/* CS650 participation standard bridge v1.0
   For the CS650 Week 3 / Week 5 lab engine (globals: client, currentUser, sessionId,
   currentOffering, completion, attempted, openedKeys, SECTIONS, CARDS, MC, studyKey,
   questionKey, api, SUPABASE_URL, SUPABASE_KEY).
   Adds the Monroe standard used in MG628:
   - centralized active study time (shared/active-time.js), started only for a
     roster-verified session, with the server total shown under the login panel;
   - "Download My Work (PDF)" built from the authenticated server record
     (shared/participation-adapter.js + participation-pdf.js via MonroeReportContext).
   It never changes answers, grades or completion. */
(function () {
  'use strict';
  const has = name => { try { return typeof eval(name) !== 'undefined'; } catch (_) { return false; } };
  const get = name => { try { return eval(name); } catch (_) { return undefined; } };
  const needed = ['client', 'api', 'SECTIONS', 'CARDS', 'MC', 'studyKey', 'questionKey', 'SUPABASE_URL', 'SUPABASE_KEY'];
  if (!needed.every(has)) { console.warn('CS650 standard bridge: lab engine globals not found.'); return; }
  const $ = id => document.getElementById(id);
  const txt = id => ($(id)?.textContent || '').trim();
  const label = () => (window.MONROE_PDF_CONFIG && window.MONROE_PDF_CONFIG.week) ? 'Week ' + Number(window.MONROE_PDF_CONFIG.week) : 'this week';
  const currentSession = () => (get('currentUser') && get('sessionId')) ? get('sessionId') : null;
  async function token() {
    if (!currentSession()) return null;
    const { data, error } = await get('client').auth.getSession();
    return error ? null : (data?.session?.access_token || null);
  }
  const fmt = s => Math.floor(s / 3600) + 'h ' + String(Math.floor(s % 3600 / 60)).padStart(2, '0') + 'm ' + String(s % 60).padStart(2, '0') + 's';

  // ---- visible server total under the login status ----
  function timeLine() {
    let el = $('cs650-active-time');
    if (!el) {
      el = document.createElement('div'); el.id = 'cs650-active-time'; el.setAttribute('aria-live', 'polite');
      el.style.cssText = 'margin-top:8px;font-size:.92rem;color:#2f6f63;font-weight:700';
      const anchor = $('academic-identity') || $('auth-status');
      if (anchor) anchor.insertAdjacentElement('afterend', el);
    }
    return el;
  }
  document.addEventListener('monroe:active-time', ev => {
    if (!currentSession() || ev.detail?.sessionId !== currentSession()) return;
    const s = Number(ev.detail.seconds);
    if (Number.isSafeInteger(s) && s >= 0) timeLine().textContent = 'Recorded active study time (server): ' + fmt(s);
  });

  // ---- start the shared tracker once its deferred script has loaded ----
  function start() {
    if (!window.MonroeActiveTime?.init || window.MonroeActiveTime.current) return;
    window.MonroeActiveTime.init({ session: currentSession, token });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();

  // ---- trusted context for the shared PDF report ----
  window.MonroeReportContext = async function () {
    const sid = currentSession(), offering = get('currentOffering');
    if (!sid || !offering?.id) throw new Error('Sign in and open your roster-verified ' + label() + ' session first.');
    const sb = get('client');
    const { data: authData, error } = await sb.auth.getSession();
    let bearer = authData?.session?.access_token;
    if (error || !bearer) throw new Error('Your session has expired. Sign in again.');
    const readTime = b => fetch(get('SUPABASE_URL') + '/functions/v1/participation-active-time', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': get('SUPABASE_KEY'), 'Authorization': 'Bearer ' + b },
      body: JSON.stringify({ action: 'read', session_id: sid })
    });
    let [timeRes, saved] = await Promise.all([readTime(bearer).catch(() => null), get('api')({ action: 'resume_session', offering_id: offering.id })]);
    if (timeRes && timeRes.status === 401) {
      const r = await sb.auth.refreshSession(); bearer = r.data?.session?.access_token;
      timeRes = (!r.error && bearer) ? await readTime(bearer).catch(() => null) : null;
    }
    let time = null; try { if (timeRes?.ok) time = await timeRes.json(); } catch (_) {}
    if (!saved?.session || saved.session.id !== sid) throw new Error('Could not validate the current participation record.');
    const c = saved.completion || get('completion') || {};
    const savedCards = new Set(saved.card_keys || []);
    const answers = new Map((saved.knowledge_responses || []).map(x => [x.question_key, x]));
    const SECTIONS = get('SECTIONS'), CARDS = get('CARDS'), MC = get('MC'), studyKey = get('studyKey'), questionKey = get('questionKey');
    const cards = [], mcqs = [];
    for (const sec of SECTIONS) {
      (CARDS[sec.id] || []).forEach((card, i) => { const k = studyKey(sec.id, i); cards.push({ key: k, title: (sec.label || sec.id) + ' — ' + card[0], visited: savedCards.has(k) }); });
      (MC[sec.id] || []).forEach((q, i) => {
        const k = questionKey(sec.id, i), r = answers.get(k);
        let selected = 'Not answered';
        if (r) { const idx = 'abcd'.indexOf(String(r.selected_answer || '').toLowerCase()); selected = String(r.selected_answer || '').toUpperCase() + (idx >= 0 && q[1]?.[idx] ? '. ' + q[1][idx] : ''); }
        mcqs.push({ key: k, prompt: q[0], selected, correctness: r?.is_correct === true ? true : r?.is_correct === false ? false : null });
      });
    }
    const tracked = time?.measurement === 'tracked' && Number.isSafeInteger(time.active_seconds) && time.active_seconds >= 0;
    return {
      student_name: txt('ai-student') || 'Roster-verified student', student_id: txt('ai-student-id') || 'Unavailable',
      section: txt('ai-section') || 'Not reported', term: txt('ai-term') || (window.MONROE_PDF_CONFIG?.term || 'Fall 2026'),
      status: String(c.status || 'incomplete').toUpperCase(),
      completion_percent: Number.isFinite(Number(c.completion_percentage)) ? Number(c.completion_percentage) : null,
      grade: c.participation_grade ?? null, verification_code: c.verification_code || null,
      active_time_seconds: tracked ? time.active_seconds : null, active_time_verified: tracked, active_time_source: tracked ? 'supabase' : null,
      cards, cards_summary: cards.filter(x => x.visited).length + '/' + cards.length,
      mcqs, mcq_summary: mcqs.filter(x => x.selected !== 'Not answered').length + '/' + mcqs.length,
      written: [], written_summary: 'None in this lab', exercises: [], exercise_summary: 'None in this lab',
      notes: 'Identity, completion, cards and answers are read from the authenticated Supabase record for this session. ' +
        (tracked ? 'Active study time is the server total.' : 'Active study time could not be read; it is not reported as zero.')
    };
  };
})();
