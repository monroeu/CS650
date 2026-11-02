/* CS650 Week 7 lab — Monroe participation standard.
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
    if (error) throw new Error(error.message || 'Participation service error');
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
        if (!off) { lock(); setStatus('Signed in, but this Student ID is not on the CS650 roster for this lab, or it has not been published yet. Contact Professor Kassoh.', 'err'); return; }
        offering = off;
        showIdentity(r, (r.enrollments || []).find(e => e.section_id === off.section_id));
        let res = await api({ action: 'resume_session', offering_id: off.id });
        if (!res.session) { await api({ action: 'start_session', offering_id: off.id, track: 'business' }); res = await api({ action: 'resume_session', offering_id: off.id }); }
        sessionId = res.session?.id || null; completion = res.completion || null;
        if (!sessionId) throw new Error('Your participation session could not be started.');
        setStatus('Roster verified. Your ' + CFG.label + ' participation and study time are being recorded to Supabase.', 'ok');
        unlock();
      } catch (e) { lock(); setStatus(e.message || String(e), 'err'); }
    })().finally(() => { busy = null; });
    return busy;
  }

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
      completion_percent: L.lecturePercent, grade: null,
      active_time_seconds: tracked ? time.active_seconds : null, active_time_verified: tracked, active_time_source: tracked ? 'supabase' : null,
      cards: L.cards, cards_summary: L.cards.filter(x => x.visited).length + '/' + L.cards.length + ' (this browser)',
      mcqs: L.mcqs, mcq_summary: L.mcqs.filter(x => x.selected !== 'Not answered').length + '/' + L.mcqs.length,
      written: [], written_summary: 'None in this lab',
      exercises: L.lectures, exercise_summary: L.lectures.filter(x => x.status.startsWith('Finished')).length + '/' + L.lectures.length + ' lectures heard to the end',
      notes: 'Identity, session and active study time are read from Supabase for this authenticated session' + (tracked ? '' : ' (study time could not be read and is not reported as zero)') +
        '. Lecture listening, flip cards and practice answers are recorded in this browser. Completion = share of lecture slides heard to the end.'
    };
  };

  if (!client) { lock(); setStatus('The sign-in service could not load. Check your internet connection and reload.', 'err'); return; }
  client.auth.onAuthStateChange((event) => { if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) setTimeout(bootstrap, 0); });
  bootstrap();
})();
