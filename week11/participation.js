/* CS650 Week 11 lab (Chapter 11) — Monroe participation standard.
   Student ID sign-in (student-auth-api), roster-verified session (participation-api),
   centralized active study time (shared/active-time.js v1.3) and the shared PDF report.
   Narration counts as activity only while it plays in the visible tab; a presence check
   pauses the lecture after 10 minutes without any touch, click or key press. */
(function () {
  'use strict';
  const CFG = window.LAB_PARTICIPATION;
  if (!CFG) return;                                     // SCORM / offline builds: no sign-in
  const SUPABASE_URL = 'https://irnrjzeejalbbqdrbzmj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_aj2vpjfJrSMvjTxcKuC0pQ_pf7JbDo2';
  const PRESENCE_MS = window.LAB_TEST_PRESENCE_MS || 10 * 60 * 1000;
  const $ = id => document.getElementById(id);
  const client = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let currentUser = null, offering = null, sessionId = null, section = null, bootData = null, completion = null, busy = null;

  function setStatus(msg, kind = '') { const el = $('auth-status'); if (el) { el.textContent = msg; el.className = 'gate-note' + (kind ? ' status-' + kind : ''); } }
  const put = (id, v) => { const el = $(id); if (el) el.textContent = (v && String(v).trim()) ? String(v) : '—'; };
  async function api(body) {
    const { data, error } = await client.functions.invoke('participation-api', { body });
    if (error) {                                          // show the function's own message, not "non-2xx status code"
      let msg = error.message || 'Participation service error';
      try { const j = await error.context?.json?.(); if (j?.error) msg = j.error; } catch (_) {}
      throw new Error(msg);
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }
  async function studentAuth(action) {
    const student_id = $('auth-student-id').value.trim(), password = $('auth-password').value;
    if (!student_id) throw new Error('Enter your Student ID.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const r = await fetch(SUPABASE_URL + '/functions/v1/student-auth-api', { method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
      body: JSON.stringify({ action, student_id, password }) });
    let data = null; try { data = await r.json(); } catch (_) {}
    if (!r.ok || data?.error) throw new Error(data?.error || 'Student account service error (' + r.status + ')');
    if (data?.must_change_password) { setStatus('Your temporary password must be changed in the Student Portal first.', 'err'); location.href = 'https://monroeu.github.io/student/'; throw new Error('Password change required'); }
    if (data?.session?.access_token && data?.session?.refresh_token) {
      const { error } = await client.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
      if (error) throw error;
    }
    $('auth-password').value = '';
    return data;
  }

  function lock(message) {
    document.body.classList.add('lab-locked');
    sessionId = null; offering = null; completion = null;
    $('academic-identity').hidden = true; $('cs650-active-time').textContent = '';
    if (window.LAB_CONTROL) window.LAB_CONTROL.pause();
    if (message) setStatus(message);
  }
  function unlock() { document.body.classList.remove('lab-locked'); }
  function showIdentity(r, enrollment) {
    const s = enrollment?.section || {}; section = s;
    put('ai-student', r.user?.full_name); put('ai-student-id', r.user?.institutional_id || 'Not listed');
    put('ai-course', [s.course?.code, s.course?.title].filter(Boolean).join(' — '));
    put('ai-section', s.course?.code && s.section_code ? s.course.code + '-' + s.section_code : s.section_code);
    put('ai-term', [s.term?.name, s.term?.code].filter(Boolean).join(' · '));
    $('academic-identity').hidden = false;
  }
  async function bootstrap() {
    if (busy) return busy;
    busy = (async () => {
      const { data: { user } } = await client.auth.getUser();
      currentUser = user || null;
      $('auth-signout').hidden = !user; $('authFields').hidden = !!user;
      if (!user) { lock('Sign in before beginning. Lectures, practice and study time are recorded only while you are signed in.'); return; }
      setStatus('Signed in. Matching your Student ID to the CS650 roster…');
      try {
        const r = await api({ action: 'bootstrap' }); bootData = r;
        const off = (r.offerings || []).find(o => o.assignment?.slug === CFG.slug && Number(o.assignment?.version) === Number(CFG.version));
        if (!off) {
          lock();
          const enrolled = (r.enrollments || []).some(e => /CS\s*-?\s*650/i.test(e.section?.course?.code || ''));
          setStatus(enrolled
            ? 'Signed in and on the CS650 roster, but the ' + CFG.label + ' lab has not been published for your section yet. Check back later or contact Professor Kassoh.'
            : 'Signed in, but this Student ID is not on a CS650 roster. Contact Professor Kassoh.', 'err');
          return;
        }
        offering = off;
        showIdentity(r, (r.enrollments || []).find(e => e.section_id === off.section_id));
        let res = await api({ action: 'resume_session', offering_id: off.id });
        if (!res.session) { await api({ action: 'start_session', offering_id: off.id, track: 'business' }); res = await api({ action: 'resume_session', offering_id: off.id }); }
        sessionId = res.session?.id || null; completion = res.completion || null;
        if (!sessionId) throw new Error('Your participation session could not be started.');
        loadServerState(user.id, res);
        setStatus('Roster verified. Your ' + CFG.label + ' participation and study time are being recorded to Supabase.', 'ok');
        unlock();
      } catch (e) { lock(); setStatus(e.message || String(e), 'err'); }
    })().finally(() => { busy = null; });
    return busy;
  }

  // ---------- server records ----------
  // Every gradeable action (slide heard, reading, trace, study card, first answer, Try it) is written to
  // participation-api, which keeps the first answer to each question and calculates the recorded grade.
  const PFX = CFG.prefix;                                   // e.g. "CS11"; without it nothing is synced
  const pad = (n, k) => String(n).padStart(k, '0');
  let sent = new Set(), flushing = false, retryTimer = null, stopped = '';
  const view = (type, key, secs) => ({ id: 'v:' + key, body: { action: 'record_view', activity_type: type, activity_key: key, dwell_seconds: secs || 2, visibility_ratio: 1 } });
  function wanted() {
    const S = window.LAB_SERVER, P = S.progress(), out = [];
    for (const m of S.modules) {
      const p = P[m.id]; if (!p) continue;
      // answers are not queued here: each first answer goes straight to the server through LAB_ANSWER
      (p.cards || []).forEach(i => { const k = PFX + '-F-' + m.id + '-' + pad(i + 1, 2); out.push({ id: 'c:' + k, body: { action: 'card_opened', card_key: k } }); });
      if (p.learn) out.push(view('reading', PFX + '-RD-' + m.id));
      Object.keys(p.trace || {}).filter(k => p.trace[k]).forEach(id => out.push(view('trace', PFX + '-TR-' + m.id + '-' + id)));
      Object.keys(p.tryit || {}).filter(k => p.tryit[k]).forEach(id => out.push(view('tryit', PFX + '-TY-' + m.id + '-' + id)));
      (p.watched || []).forEach(n => out.push(view('lecture_slide', PFX + '-SL' + pad(n, 3), S.slideSeconds(n))));
    }
    return out;
  }
  // first sign-in on this browser for this student: replace local progress with what the server holds
  function loadServerState(uid, res) {
    const S = window.LAB_SERVER; if (!S || !PFX) return;
    if (S.owner() !== uid) S.reset(uid);                   // never upload another student's work from a shared computer
    const byMod = Object.fromEntries(S.modules.map(m => [m.id, m]));
    const slideMod = n => S.modules.find(m => n >= m.slides[0] && n <= m.slides[1]);
    const known = new Set();
    S.merge((P, mp) => {
      for (const r of res.knowledge_responses || []) {
        const mm = String(r.question_key).match(/^(.+)-(check|mcq-(\d+))$/); if (!mm || !byMod[mm[1]]) continue;
        const p = mp(mm[1]), v = r.selected_answer, slot = mm[2] === 'check' ? 'check' : 'mcq' + (Number(mm[3]) - 1);
        if (Number.isInteger(r.correct_answer)) p.keys[slot] = { answer: r.correct_answer, fb: r.feedback || null, why: r.explanation || '' };
        if (slot === 'check') { p.first.check = v; if (p.check == null) p.check = v; }
        else { const i = Number(mm[3]) - 1; p.first['mcq' + i] = v; if (p.mcq[i] == null) p.mcq[i] = v; }
        known.add('q:' + r.question_key);
      }
      for (const k of res.card_keys || []) {
        const mm = String(k).match(new RegExp('^' + PFX + '-F-(.+)-(\\d+)$')); if (!mm || !byMod[mm[1]]) continue;
        const p = mp(mm[1]), i = Number(mm[2]) - 1; if (!p.cards.includes(i)) p.cards.push(i); known.add('c:' + k);
      }
      for (const v of res.view_activity || []) {
        const k = String(v.activity_key); let mm;
        if ((mm = k.match(new RegExp('^' + PFX + '-SL(\\d+)$')))) { const n = Number(mm[1]), m = slideMod(n); if (m) { const p = mp(m.id); if (!p.watched.includes(n)) p.watched.push(n); } }
        else if ((mm = k.match(new RegExp('^' + PFX + '-RD-(.+)$'))) && byMod[mm[1]]) mp(mm[1]).learn = true;
        else if ((mm = k.match(new RegExp('^' + PFX + '-TR-([^-]+)-(.+)$'))) && byMod[mm[1]]) mp(mm[1]).trace[mm[2]] = true;
        else if ((mm = k.match(new RegExp('^' + PFX + '-TY-([^-]+)-(.+)$'))) && byMod[mm[1]]) mp(mm[1]).tryit[mm[2]] = true;
        known.add('v:' + k);
      }
    });
    sent = known; stopped = '';
    S.setRecorded(res.completion || null);
    flush();
    mergeCode(res.code_saves || []);
    for (const x of res.solutions || []) { const mm = String(x.activity_key).match(new RegExp('^' + PFX + '-TY-([^-]+)-(.+)$')); if (mm) S.setSolution(mm[1], mm[2], x.solution); }
  }
  async function flush() {
    if (flushing || !sessionId || !PFX || !window.LAB_SERVER || stopped) return;
    flushing = true; clearTimeout(retryTimer);
    try {
      const todo = wanted().filter(x => !sent.has(x.id));
      for (const x of todo) {
        if (!sessionId) break;
        let r;
        try { r = await api(Object.assign({ session_id: sessionId }, x.body)); }
        catch (e) {
          const msg = String(e.message || e);
          if (/Only one attempt/i.test(msg)) { sent.add(x.id); continue; }
          if (/closed|not open|not published|not enrolled/i.test(msg)) { stopped = msg; setStatus(msg + '. Your work is kept in this browser but is no longer being recorded.', 'err'); break; }
          if (/Unknown activity|required|Invalid/i.test(msg)) { sent.add(x.id); console.warn('participation: skipped', x.id, msg); continue; }
          retryTimer = setTimeout(flush, 15000); break;          // network or server hiccup: try again shortly
        }
        sent.add(x.id);
        if (r && r.solution) { const mm = x.id.match(new RegExp('^v:' + PFX + '-TY-([^-]+)-(.+)$')); if (mm) window.LAB_SERVER.setSolution(mm[1], mm[2], r.solution); }
        if (r && r.completion) { completion = r.completion; window.LAB_SERVER.setRecorded(r.completion); }
      }
    } finally { flushing = false; }
    if (!stopped && sessionId && wanted().some(x => !sent.has(x.id)) && !retryTimer) setTimeout(flush, 500);
  }
  // First answer to a check question or MCQ: saved on the server, which then returns the key and explanations.
  // If the server already holds an answer for this question, that earlier answer is the graded one.
  window.LAB_ANSWER = async function (questionKey, choice) {
    if (!sessionId) throw new Error('Sign in to answer: answers are saved and checked on the server.');
    if (stopped) throw new Error(stopped + '.');
    const r = await api({ action: 'answer_knowledge', session_id: sessionId, question_key: questionKey, selected_answer: choice });
    if (r.completion) { completion = r.completion; window.LAB_SERVER?.setRecorded(r.completion); }
    return { selected: r.selected_answer, answer: r.correct_answer, fb: r.feedback || null, why: r.explanation || '' };
  };
  // ---------- Try it code: the latest version of every exercise is kept on the server ----------
  let codeSent = {}, codeSeen = {}, codeTimer = null;       // key -> code the server holds / code last seen here
  const codeKey = (mod, id) => PFX + '-TY-' + mod + '-' + id;
  function mergeCode(saves) {
    const S = window.LAB_SERVER; codeSent = {};
    const byKey = new Map(saves.map(c => [c.activity_key, c]));
    S.merge((P, mp) => {
      for (const m of S.modules) for (const x of m.tryit || []) {
        const c = byKey.get(codeKey(m.id, x.id)); if (!c) continue;
        const p = mp(m.id); p.codeAt = p.codeAt || {};
        const local = p.code[x.id], localAt = p.codeAt[x.id] || 0, serverAt = Date.parse(c.updated_at) || 0;
        if (local === undefined || (local !== c.code && serverAt > localAt)) {       // the server copy is newer
          if (c.code === '') delete p.code[x.id]; else p.code[x.id] = c.code;
          p.codeAt[x.id] = serverAt;
        }
        codeSent[codeKey(m.id, x.id)] = c.code;
      }
    });
    codeSeen = {}; for (const c of changedCode()) codeSeen[c.k] = c.code;
    for (const k in codeSent) if (!(k in codeSeen)) codeSeen[k] = codeSent[k];
    sendCode();                                             // anything newer here goes up
  }
  function changedCode() {
    const S = window.LAB_SERVER, P = S.progress(), out = [];
    for (const m of S.modules) { const p = P[m.id]; if (!p) continue;
      for (const x of m.tryit || []) { const k = codeKey(m.id, x.id), code = (p.code || {})[x.id] ?? '';
        if ((codeSent[k] ?? '') !== code) out.push({ m, x, p, k, code }); } }
    return out;
  }
  function stampCode() {                                    // remember when each exercise was last edited here
    if (!window.LAB_SERVER || !PFX) return; let any = false;
    for (const c of changedCode()) if (codeSeen[c.k] !== c.code) { c.p.codeAt = c.p.codeAt || {}; c.p.codeAt[c.x.id] = Date.now(); codeSeen[c.k] = c.code; any = true; }
    if (any) window.LAB_SERVER.touch();
  }
  async function sendCode() {
    if (!sessionId || !PFX || stopped || !window.LAB_SERVER) return;
    clearTimeout(codeTimer);
    for (const c of changedCode()) {
      try { await api({ action: 'save_code', session_id: sessionId, activity_key: c.k, code: c.code }); codeSent[c.k] = c.code; }
      catch (e) {
        const msg = String(e.message || e);
        if (/closed|not open|not published|not enrolled/i.test(msg)) { stopped = msg; setStatus(msg + '. Your work is kept in this browser but is no longer being recorded.', 'err'); return; }
        if (/Unknown Try it|too long/i.test(msg)) { codeSent[c.k] = c.code; console.warn('participation: code not saved', c.k, msg); continue; }
        codeTimer = setTimeout(sendCode, 15000); return;    // offline or server hiccup: try again shortly
      }
    }
  }
  document.addEventListener('lab:code', () => { stampCode(); clearTimeout(codeTimer); codeTimer = setTimeout(sendCode, 2000); });
  window.addEventListener('pagehide', () => { if (changedCode().length) sendCode(); });
  let flushTimer = null;
  document.addEventListener('lab:progress', () => { clearTimeout(flushTimer); flushTimer = setTimeout(flush, 800); });
  window.addEventListener('online', () => { flush(); sendCode(); });

  // ---------- sign-in UI ----------
  $('auth-signin').addEventListener('click', async () => { try { setStatus('Signing in…'); await studentAuth('login'); await bootstrap(); } catch (e) { setStatus(e.message || String(e), 'err'); } });
  $('auth-signup').addEventListener('click', async () => { try { setStatus('Checking the roster and creating your account…'); const d = await studentAuth('register'); if (d?.needs_sign_in) setStatus(d.message || 'Account created. Now select Sign in.', 'ok'); else await bootstrap(); } catch (e) { setStatus(e.message || String(e), 'err'); } });
  $('auth-signout').addEventListener('click', async () => { await client.auth.signOut(); lock('Signed out.'); await bootstrap(); });
  $('auth-password').addEventListener('keydown', e => { if (e.key === 'Enter') $('auth-signin').click(); });

  // ---------- timer ----------
  const fmt = s => Math.floor(s / 3600) + 'h ' + String(Math.floor(s % 3600 / 60)).padStart(2, '0') + 'm ' + String(s % 60).padStart(2, '0') + 's';
  document.addEventListener('monroe:active-time', ev => {
    if (!sessionId || ev.detail?.sessionId !== sessionId) return;
    const s = Number(ev.detail.seconds);
    if (Number.isSafeInteger(s) && s >= 0) $('cs650-active-time').textContent = 'Recorded active study time (server): ' + fmt(s);
  });
  let presenceHold = false, lastTouch = Date.now();
  ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(t => document.addEventListener(t, e => { if (e.isTrusted) lastTouch = Date.now(); }, { passive: true, capture: true }));
  const playing = () => !!(window.LAB_CONTROL && window.LAB_CONTROL.playing());
  function startTracker() {
    if (!window.MonroeActiveTime?.init || window.MonroeActiveTime.current) return;
    window.MonroeActiveTime.init({
      session: () => (currentUser && sessionId) ? sessionId : null,
      token: async () => { if (!sessionId) return null; const { data, error } = await client.auth.getSession(); return error ? null : (data?.session?.access_token || null); },
      engaged: () => playing() && !presenceHold && !document.hidden
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startTracker, { once: true }); else startTracker();

  // presence check: narration alone keeps the timer running for at most 10 minutes
  const modal = $('presence');
  setInterval(() => {
    if (presenceHold || !sessionId || document.hidden || !playing()) return;
    if (Date.now() - lastTouch >= PRESENCE_MS) {
      presenceHold = true; window.LAB_CONTROL.pause(); window.MonroeActiveTime?.current?.hold?.();
      modal.hidden = false; $('presence-continue').focus();
    }
  }, 5000);
  $('presence-continue').addEventListener('click', () => {
    presenceHold = false; modal.hidden = true; lastTouch = Date.now();
    window.MonroeActiveTime?.current?.confirmPresence?.();
    window.LAB_CONTROL.play();
  });

  // ---------- gate used by the player ----------
  window.LAB_GATE = {
    ready: () => !!sessionId && !presenceHold,
    prompt: () => { $('authBox').scrollIntoView({ behavior: 'smooth', block: 'start' }); setStatus(sessionId ? 'Confirm you are still there to continue.' : 'Sign in with your Student ID to start the lecture. Study time is recorded only while you are signed in.', sessionId ? '' : 'err'); }
  };

  // ---------- trusted context for the shared PDF report ----------
  window.MonroeReportContext = async function () {
    if (!sessionId || !offering) throw new Error('Sign in and open your roster-verified ' + CFG.label + ' session first.');
    const { data: auth, error } = await client.auth.getSession();
    let bearer = auth?.session?.access_token;
    if (error || !bearer) throw new Error('Your session has expired. Sign in again.');
    const readTime = b => fetch(SUPABASE_URL + '/functions/v1/participation-active-time', { method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + b },
      body: JSON.stringify({ action: 'read', session_id: sessionId }) });
    let [timeRes, saved] = await Promise.all([readTime(bearer).catch(() => null), api({ action: 'resume_session', offering_id: offering.id })]);
    if (timeRes && timeRes.status === 401) { const r = await client.auth.refreshSession(); bearer = r.data?.session?.access_token; timeRes = (!r.error && bearer) ? await readTime(bearer).catch(() => null) : null; }
    let time = null; try { if (timeRes?.ok) time = await timeRes.json(); } catch (_) {}
    if (!saved?.session || saved.session.id !== sessionId) throw new Error('Could not validate the current participation record.');
    const c = saved.completion || completion || {};
    const L = window.LAB_REPORT ? window.LAB_REPORT() : { lectures: [], mcqs: [], checks: '', cards: [] };
    const tracked = time?.measurement === 'tracked' && Number.isSafeInteger(time.active_seconds) && time.active_seconds >= 0;
    const txt = id => ($(id)?.textContent || '').trim();
    return {
      student_name: txt('ai-student') || 'Roster-verified student', student_id: txt('ai-student-id') || 'Unavailable',
      section: txt('ai-section') || 'Not reported', term: txt('ai-term') || 'Fall 2026',
      status: String(c.status || 'in_progress').toUpperCase(),
      completion_percent: c.completion_percentage ?? L.lecturePercent,
      grade: c.grade_breakdown ? (Number(c.participation_grade).toFixed(1) + ' / 100 (recorded on the server' + (c.status === 'overridden' ? ', set by instructor' : '') + ')') : (L.grade != null ? L.grade + ' / 100 (rubric, this browser)' : null),
      active_time_seconds: tracked ? time.active_seconds : null, active_time_verified: tracked, active_time_source: tracked ? 'supabase' : null,
      cards: L.cards, cards_summary: (c.study_cards_required ? c.study_cards_completed + '/' + c.study_cards_required + ' (recorded)' : L.cards.filter(x => x.visited).length + '/' + L.cards.length + ' (this browser)'),
      mcqs: L.mcqs, mcq_summary: L.mcqs.filter(x => x.selected !== 'Not answered').length + '/' + L.mcqs.length,
      written: [], written_summary: 'None in this lab',
      exercises: L.lectures.concat(L.tryit || []), exercise_summary: L.lectures.filter(x => x.status.startsWith('Finished')).length + '/' + L.lectures.length + ' lectures heard to the end; ' + (L.tryit || []).filter(x => x.status.startsWith('Finished')).length + '/' + (L.tryit || []).length + ' Try it exercises finished',
      notes: 'Identity, session and active study time are read from Supabase for this authenticated session' + (tracked ? '' : ' (study time could not be read and is not reported as zero)') +
        '. Slides heard, readings, traces, study cards, first answers to every question and Try it results are recorded on the server; MCQs are graded on the first answer. ' +
        (c.grade_breakdown ? 'Grade breakdown: ' + c.grade_breakdown.parts.map(x => x.name + ' ' + x.done + '/' + x.of).join('; ') + '.' : '')
    };
  };

  if (!client) { lock(); setStatus('The sign-in service could not load. Check your internet connection and reload.', 'err'); return; }
  client.auth.onAuthStateChange((event) => { if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) setTimeout(bootstrap, 0); });
  bootstrap();
})();
