(function () {
  'use strict';
  const D = window.LAB_DATA, Q = window.LAB_QUIZ;
  const $ = (s, el = document) => el.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => c != null && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs) => { const el = document.createElementNS(SVGNS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };

  // ---------- sections index ----------
  const SECTIONS = [];
  D.chapters.forEach(ch => ch.sections.forEach(s => { s.chapter = ch; SECTIONS.push(s); }));
  const byId = id => SECTIONS.find(s => s.id === id);

  // ---------- progress (stored in this browser only) ----------
  const KEY = 'cs650-lab-ch7-8-v1';
  // --- SCORM 1.2 (used only when the lab runs inside Blackboard as a SCORM package) ---
  function findAPI(w) { for (let i = 0; w && i < 12; i++) { try { if (w.API) return w.API; } catch (e) { return null; } if (w.parent === w) break; w = w.parent; } return null; }
  let API = findAPI(window) || (window.opener ? findAPI(window.opener) : null);
  if (API) { try { if (String(API.LMSInitialize('')) !== 'true') API = null; } catch (e) { API = null; } }
  const lmsGet = k => { try { return API ? String(API.LMSGetValue(k) || '') : ''; } catch (e) { return ''; } };
  const lmsSet = (k, v) => { try { if (API) API.LMSSetValue(k, String(v)); } catch (e) {} };
  // compact encoding so progress fits in SCORM's 4,096-character suspend_data
  function encode(P) {
    const o = {};
    for (const [id, st] of Object.entries(P)) {
      const s = byId(id); if (!s) continue; const q = Q[id];
      o[id] = [st.seen || 0, st.heard || '',
        q.checks.map((_, i) => i in st.checks ? (st.checks[i] ? 't' : 'f') : '-').join(''),
        q.mcq.map((_, i) => i in st.mcq ? String(st.mcq[i]) : '-').join(''),
        q.cards.map((_, i) => (st.cards || {})[i] ? 'v' : '-').join('')];
    }
    return JSON.stringify(o);
  }
  function decode(str) {
    const P = {}; let o; try { o = JSON.parse(str); } catch (e) { return P; }
    for (const [id, a] of Object.entries(o || {})) {
      if (!byId(id) || !Array.isArray(a)) continue;
      const st = { seen: +a[0] || 0, heard: a[1] || '', checks: {}, mcq: {} };
      [...(a[2] || '')].forEach((c, i) => { if (c !== '-') st.checks[i] = c === 't'; });
      [...(a[3] || '')].forEach((c, i) => { if (c !== '-') st.mcq[i] = +c; });
      st.cards = {}; [...(a[4] || '')].forEach((c, i) => { if (c === 'v') st.cards[i] = true; });
      P[id] = st;
    }
    return P;
  }
  let P = {};
  const fromLms = lmsGet('cmi.suspend_data');
  if (API && fromLms) P = decode(fromLms);
  else { try { P = decode(localStorage.getItem(KEY) || '{}'); } catch (e) { P = {}; } }
  // heard = which slides have been listened to the end, as a hex bitmask
  const heardSet = st => { const b = new Set(); [...(st.heard || '')].forEach((h, i) => { const v = parseInt(h, 16); for (let k = 0; k < 4; k++) if (v & (1 << k)) b.add(i * 4 + k); }); return b; };
  const heardStr = set => { const n = Math.max(0, ...set) + 1; let out = ''; for (let i = 0; i < n; i += 4) { let v = 0; for (let k = 0; k < 4; k++) if (set.has(i + k)) v |= 1 << k; out += v.toString(16); } return out; };
  const heardCount = s => heardSet(P[s.id] || {}).size;
  const lectureDone = s => heardCount(s) >= s.slides.length;
  function reportLms() {
    if (!API) return;
    const done = SECTIONS.filter(lectureDone).length;
    lmsSet('cmi.suspend_data', encode(P));
    lmsSet('cmi.core.score.min', 0); lmsSet('cmi.core.score.max', 100);
    lmsSet('cmi.core.score.raw', Math.round(100 * done / SECTIONS.length));
    lmsSet('cmi.core.lesson_status', done === SECTIONS.length ? 'completed' : 'incomplete');
    lmsSet('cmi.core.exit', 'suspend');
    try { API.LMSCommit(''); } catch (e) {}
  }
  const save = () => { try { localStorage.setItem(KEY, encode(P)); } catch (e) {} reportLms(); };
  const finish = () => { if (API) { reportLms(); try { API.LMSFinish(''); } catch (e) {} API = null; } };
  window.addEventListener('pagehide', finish);
  window.addEventListener('beforeunload', finish);
  const sp = id => { P[id] = P[id] || { seen: 0, heard: '', checks: {}, mcq: {} }; P[id].cards = P[id].cards || {}; return P[id]; };
  function status(s) {
    const st = P[s.id]; if (!st) return 'none';
    const q = Q[s.id]; const allMcq = q && Object.keys(st.mcq).length >= q.mcq.length;
    if (lectureDone(s) && allMcq) return 'done';
    return (st.seen > 0 || Object.keys(st.mcq).length || Object.keys(st.checks).length) ? 'part' : 'none';
  }
  function updateTop() {
    const done = SECTIONS.filter(s => status(s) === 'done').length;
    $('#progText').textContent = `${done} of ${SECTIONS.length} sections`;
    $('#progBar').style.width = (100 * done / SECTIONS.length) + '%';
  }

  // ---------- navigation rail ----------
  function renderRail(currentId) {
    const rail = $('#rail'); rail.innerHTML = '';
    D.chapters.forEach(ch => {
      rail.append(h('h2', { text: ch.title }));
      ch.sections.forEach(s => {
        const st = status(s);
        rail.append(h('a', { href: '#' + s.id, 'aria-current': s.id === currentId ? 'page' : false },
          h('span', { class: 'tick ' + st, 'aria-hidden': 'true', text: st === 'done' ? '✓' : '' }),
          h('span', { text: s.title }),
          h('span', { class: 'sr-only', style: 'position:absolute;left:-9999px', text: st === 'done' ? ' (completed)' : st === 'part' ? ' (started)' : '' })));
      });
    });
    const ex = h('div', { class: 'extra' });
    ex.append(h('a', { href: '#home', 'aria-current': currentId === 'home' ? 'page' : false }, h('span', { class: 'tick', 'aria-hidden': 'true' }), h('span', { text: 'How this lab works' })));
    ex.append(h('a', { href: '#summary', 'aria-current': currentId === 'summary' ? 'page' : false }, h('span', { class: 'tick', 'aria-hidden': 'true' }), h('span', { text: 'Your results' })));
    rail.append(ex);
    updateTop();
  }
  const menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => { const o = $('#rail').classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });

  // ---------- audio player ----------
  const audio = $('#audio');
  let cur = null;          // { section, idx }
  let raf = 0;
  let speed = 1;
  let captionsOn = true;
  try { const pr = JSON.parse(localStorage.getItem(KEY + '-prefs')) || {}; speed = pr.speed || 1; captionsOn = pr.cc !== false; } catch (e) {}
  const savePrefs = () => { try { localStorage.setItem(KEY + '-prefs', JSON.stringify({ speed, cc: captionsOn })); } catch (e) {} };

  const pad = n => String(n).padStart(3, '0');
  const imgSrc = (s, sl) => `${s.dir}/img/${pad(sl.n)}.webp`;
  const audSrc = (s, sl) => `${s.dir}/aud/${pad(sl.n)}.mp3`;

  function ellipseLen(rx, ry) { return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry))); }
  function buildMarks(svg, marks) {
    svg.innerHTML = '';
    const defs = sv('defs', {});
    const mkr = sv('marker', { id: 'ah', viewBox: '0 0 10 10', refX: '7', refY: '5', markerWidth: '4', markerHeight: '4', orient: 'auto-start-reverse' });
    mkr.append(sv('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#B3202F' })); defs.append(mkr); svg.append(defs);
    return marks.map(m => {
      const [a, b, c, d] = m.g; let el, len = 1;
      if (m.k === 'ring') { el = sv('ellipse', { cx: a + c / 2, cy: b + d / 2, rx: c / 2, ry: d / 2 }); len = ellipseLen(c / 2, d / 2); }
      else if (m.k === 'box') { el = sv('rect', { x: a, y: b, width: c, height: d, rx: 0.1 }); len = 2 * (c + d); }
      else if (m.k === 'hl') { el = sv('rect', { x: a, y: b, width: c, height: d }); }
      else { el = sv('line', { x1: a, y1: b, x2: c, y2: d }); len = Math.hypot(c - a, d - b); if (m.k === 'arrow') el.setAttribute('marker-end', 'url(#ah)'); }
      el.setAttribute('class', 'mk ' + m.k);
      if (m.k !== 'hl') { el.style.strokeDasharray = len; el.style.strokeDashoffset = len; }
      svg.append(el);
      return { t: m.t, el };
    });
  }

  function Player(section, mount) {
    const slides = section.slides;
    const wrap = h('div', { class: 'stage-wrap' });
    const stage = h('div', { class: 'stage' });
    const img = h('img', { alt: '' });
    const svg = sv('svg', { viewBox: '0 0 13.333 7.5', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
    const big = h('button', { class: 'bigplay', 'aria-label': 'Play lecture', text: '▶' });
    stage.append(img, svg, big);
    const sbar = h('div', { class: 'slidebar', 'aria-hidden': 'true' }, h('i'));
    const bPrev = h('button', { 'aria-label': 'Previous slide', text: '⏮' });
    const bPlay = h('button', { 'aria-label': 'Play', text: '▶ Play' });
    const bNext = h('button', { 'aria-label': 'Next slide', text: '⏭' });
    const bAgain = h('button', { 'aria-label': 'Replay this slide', text: '↺' });
    const count = h('span', { class: 'count', 'aria-live': 'polite' });
    const range = h('input', { type: 'range', min: 0, max: slides.length - 1, step: 1, value: 0, 'aria-label': 'Go to slide' });
    const sel = h('select', { 'aria-label': 'Playback speed' }, ...[0.75, 1, 1.25, 1.5].map(v => h('option', { value: v, text: v + '×', selected: v === speed })));
    const bCC = h('button', { 'aria-pressed': String(captionsOn), text: 'CC' });
    const controls = h('div', { class: 'controls' }, bPrev, bPlay, bNext, bAgain, count, range, sel, bCC);
    wrap.append(stage, sbar, controls);
    const title = h('div', { class: 'slidetitle' });
    const cap = h('div', { class: 'caption', 'aria-live': 'off', hidden: !captionsOn });
    const doneNote = h('div', { class: 'done-note', hidden: true, text: 'Lecture complete. Practise this section below.' });
    const heardNote = h('div', { class: 'heard' });
    mount.append(wrap, title, cap, heardNote, doneNote);
    function updateHeard() { const n = heardSet(sp(section.id)).size; heardNote.textContent = n >= slides.length ? '' : `Slides heard to the end: ${n} of ${slides.length}`; }

    let idx = 0, marks = [], playing = false, wantPlay = false;
    const st = sp(section.id);
    { const hs = heardSet(st); if (hs.size && hs.size < slides.length) { const first = slides.findIndex((_, i) => !hs.has(i)); if (first >= 0) idx = first; } }

    function setPlayUI() {
      bPlay.textContent = playing ? '⏸ Pause' : '▶ Play'; bPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      big.hidden = playing || audio.currentTime > 0.05;
    }
    function preload(i) {
      for (const j of [i + 1, i + 2]) if (slides[j]) { const im = new Image(); im.src = imgSrc(section, slides[j]); }
    }
    function load(i, autoplay) {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      const sl = slides[idx];
      img.src = imgSrc(section, sl); img.alt = `Slide ${sl.n}: ${sl.title}`;
      marks = buildMarks(svg, sl.marks);
      audio.src = audSrc(section, sl); audio.playbackRate = speed;
      count.textContent = `Slide ${idx + 1} of ${slides.length}`; range.value = idx;
      title.textContent = sl.title;
      cap.textContent = sl.caps.length ? sl.caps[0][1] : '';
      sbar.firstChild.style.width = '0';
      if (idx + 1 > st.seen) { st.seen = idx + 1; save(); }
      preload(idx);
      if (autoplay) play(); else { playing = false; setPlayUI(); }
      cur = { section, idx };
    }
    function play() {
      if (window.LAB_GATE && !window.LAB_GATE.ready()) { window.LAB_GATE.prompt(); return; }
      wantPlay = true;
      const p = audio.play();
      if (p && p.catch) p.catch(() => { playing = false; wantPlay = false; setPlayUI(); });
    }
    function pause() { wantPlay = false; audio.pause(); }
    function tick() {
      const t = audio.currentTime;
      for (const m of marks) m.el.classList.toggle('on', t >= m.t);
      const sl = slides[idx];
      if (captionsOn && sl.caps.length) {
        let c = sl.caps[0][1];
        for (const [ct, txt] of sl.caps) if (t + 0.15 >= ct) c = txt;
        if (cap.textContent !== c) cap.textContent = c;
      }
      if (audio.duration) sbar.firstChild.style.width = (100 * t / audio.duration) + '%';
      if (playing) raf = requestAnimationFrame(tick);
    }
    audio.onplay = () => { playing = true; setPlayUI(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    audio.onpause = () => { playing = false; setPlayUI(); tick(); };
    audio.onseeked = () => tick();
    audio.onended = () => {
      playing = false; setPlayUI(); tick();
      const hs = heardSet(st); hs.add(idx); st.heard = heardStr(hs); save();
      const allHeard = hs.size >= slides.length;
      updateHeard();
      if (allHeard) { doneNote.hidden = false; renderRail(section.id); }
      if (idx < slides.length - 1) setTimeout(() => { if (cur && cur.section === section && wantPlay) load(idx + 1, true); }, 300);
      else wantPlay = false;
    };
    big.onclick = () => play();
    bPlay.onclick = () => (playing ? pause() : play());
    bPrev.onclick = () => load(idx - 1, playing || wantPlay);
    bNext.onclick = () => load(idx + 1, playing || wantPlay);
    bAgain.onclick = () => { audio.currentTime = 0; tick(); play(); };
    range.oninput = () => load(+range.value, playing || wantPlay);
    sel.onchange = () => { speed = +sel.value; audio.playbackRate = speed; savePrefs(); };
    bCC.onclick = () => { captionsOn = !captionsOn; cap.hidden = !captionsOn; bCC.setAttribute('aria-pressed', String(captionsOn)); savePrefs(); tick(); };

    load(idx, false); updateHeard();
    window.LAB_CONTROL = { pause: () => pause(), play: () => play(), playing: () => playing };
    if (lectureDone(section)) doneNote.hidden = false;
    return {
      goToSlide(n) { const i = slides.findIndex(s => s.n === n); if (i >= 0) { load(i, false); wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
      key(e) {
        if (e.key === ' ' || e.key === 'k') { e.preventDefault(); playing ? pause() : play(); }
        else if (e.key === 'ArrowRight') load(idx + 1, playing || wantPlay);
        else if (e.key === 'ArrowLeft') load(idx - 1, playing || wantPlay);
        else if (e.key === 'c') bCC.click();
      },
      stop() { pause(); cancelAnimationFrame(raf); audio.removeAttribute('src'); audio.load(); window.LAB_CONTROL = { pause() {}, play() {}, playing: () => false }; }
    };
  }

  // ---------- practice blocks ----------
  const LET = 'ABCDEF';
  function cardsBlock(q, s) {
    const grid = h('div', { class: 'cards' }); const st = s ? sp(s.id) : null;
    q.cards.forEach(([f, b], ci) => {
      const btn = h('button', { class: 'flip', 'aria-pressed': 'false' },
        h('span', { class: 'in' },
          h('span', { class: 'f' }, h('strong', { text: f }), h('span', { text: 'Tap to flip' })),
          h('span', { class: 'b', text: b })));
      btn.addEventListener('click', () => { const on = btn.classList.toggle('on'); btn.setAttribute('aria-pressed', String(on)); if (on && st && !st.cards[ci]) { st.cards[ci] = true; save(); } });
      grid.append(btn);
    });
    return h('section', { class: 'block', id: 'cards' }, h('h2', { text: 'Flip cards' }), h('p', { class: 'hint', text: 'Say the answer out loud, then tap the card to check yourself.' }), grid);
  }
  function checksBlock(s, q) {
    const st = sp(s.id), list = h('div', { class: 'qlist' });
    q.checks.forEach(([stmt, ans, why], i) => {
      const box = h('div', { class: 'q' }, h('div', { class: 'stem', text: stmt }));
      const row = h('div', { class: 'opts tf' });
      const fb = h('div');
      const show = (choice) => {
        [...row.children].forEach((b, j) => { b.disabled = true; const val = j === 0; if (val === ans) b.classList.add('right'); else if (val === choice) b.classList.add('wrong'); });
        const ok = choice === ans;
        fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = '';
        fb.append(h('b', { text: (ok ? 'Correct. ' : 'Not quite. ') + `The statement is ${ans ? 'true' : 'false'}.` }), why);
      };
      [true, false].forEach(v => row.append(h('button', { class: 'opt', onclick: () => { st.checks[i] = v; save(); show(v); renderRail(s.id); } }, h('span', { class: 'l', text: v ? 'T' : 'F' }), v ? 'True' : 'False')));
      box.append(row, fb); list.append(box);
      if (i in st.checks) show(st.checks[i]);
    });
    return h('section', { class: 'block', id: 'checks' }, h('h2', { text: 'Knowledge check' }), h('p', { class: 'hint', text: 'True or false? You get instant feedback; these are not scored.' }), list);
  }
  function mcqBlock(s, q, player) {
    const st = sp(s.id), list = h('div', { class: 'qlist' });
    const score = h('div', { class: 'score' });
    const refresh = () => {
      const answered = Object.keys(st.mcq).length, right = q.mcq.filter((m, i) => st.mcq[i] === m.a).length;
      score.innerHTML = '';
      score.append(answered < q.mcq.length ? `Answered ${answered} of ${q.mcq.length}` : `Score: ${right} of ${q.mcq.length}`);
      if (answered) score.append(h('button', { class: 'btn ghost', onclick: () => { st.mcq = {}; save(); renderSection(s.id, '#mcq'); } }, 'Try these again'));
    };
    q.mcq.forEach((m, i) => {
      const box = h('div', { class: 'q' }, h('div', { class: 'stem', text: `${i + 1}. ${m.q}` }));
      const opts = h('div', { class: 'opts' }); const fb = h('div');
      const show = (choice) => {
        [...opts.children].forEach((b, j) => { b.disabled = true; if (j === m.a) b.classList.add('right'); else if (j === choice) b.classList.add('wrong'); });
        const ok = choice === m.a;
        fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = '';
        fb.append(h('b', { text: ok ? 'Correct.' : `Not quite. The answer is ${LET[m.a]}.` }), m.why);
        if (m.ref) fb.append(h('div', {}, h('button', { class: 'review', onclick: () => player.goToSlide(m.ref) }, `Review the slide on this`)));
      };
      m.o.forEach((o, j) => opts.append(h('button', { class: 'opt', onclick: () => { st.mcq[i] = j; save(); show(j); refresh(); renderRail(s.id); } }, h('span', { class: 'l', text: LET[j] }), h('span', { text: o }))));
      box.append(opts, fb); list.append(box);
      if (i in st.mcq) show(st.mcq[i]);
    });
    refresh();
    return h('section', { class: 'block', id: 'mcq' }, h('h2', { text: 'Multiple choice' }), h('p', { class: 'hint', text: 'Choose one answer. Each answer explains why, and links back to the slide that teaches it.' }), list, score);
  }

  // ---------- views ----------
  let player = null;
  function stopPlayer() { if (player) { player.stop(); player = null; } }

  function renderHome() {
    stopPlayer(); renderRail('home');
    const m = $('#main'); m.innerHTML = '';
    const resume = SECTIONS.find(s => status(s) === 'part') || SECTIONS.find(s => status(s) !== 'done');
    const intro = h('div', { class: 'intro' },
      h('h1', { text: 'Logical agents and first-order logic, one step at a time' }),
      h('p', { text: 'This lab covers Chapters 7 and 8 of Russell and Norvig. Each section starts with a narrated lecture: the slides advance on their own, and circles and boxes appear on the slide as the narrator talks about each part.' }),
      h('p', { text: 'After each lecture, practise with flip cards, a quick true-or-false check, and multiple-choice questions. Your progress is saved in this browser.' }),
      resume ? h('a', { class: 'btn', href: '#' + resume.id, text: status(resume) === 'part' ? `Continue: ${resume.title}` : `Start: ${resume.title}` }) : h('a', { class: 'btn', href: '#summary', text: 'See your results' }));
    const grid = h('div', { class: 'chapgrid' });
    D.chapters.forEach(ch => {
      grid.append(h('div', { class: 'chap' }, h('h2', { text: ch.title }), h('ol', {}, ...ch.sections.map(s => h('li', {}, h('a', { href: '#' + s.id, text: s.title })))), ));
    });
    const how = h('div', { class: 'how' },
      h('div', {}, h('strong', { text: 'Listen' }), 'Press play once; the lecture moves through the section by itself. Use 0.75× to 1.5× speed, and turn captions on or off with CC.'),
      h('div', {}, h('strong', { text: 'Watch the marks' }), 'An amber circle or box shows what the narrator is talking about right now. A red underline marks a formula as it is read aloud.'),
      h('div', {}, h('strong', { text: 'Practise' }), 'Flip cards and true-or-false checks are for practice. Multiple-choice answers are scored and explain why.'),
      h('div', {}, h('strong', { text: 'Keyboard' }), 'Space plays or pauses, ← and → change slides, C toggles captions.'));
    m.append(intro, grid, how);
    m.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }

  function renderSection(id, anchor) {
    const s = byId(id); if (!s) return renderHome();
    stopPlayer(); renderRail(id);
    const m = $('#main'); m.innerHTML = '';
    const q = Q[id];
    m.append(h('div', { class: 'sechead' }, h('h1', { text: s.title }), h('span', { class: 'meta', text: `${s.chapter.title} · ${s.slides.length} slides` })));
    if (window.LAB_PARTICIPATION) m.append(h('div', { class: 'lockbanner', text: 'Sign in with your Student ID at the top of the page to start this lecture. Study time and progress count only while you are signed in.' }));
    const pm = h('div'); m.append(pm);
    player = Player(s, pm);
    if (q) m.append(cardsBlock(q, s), checksBlock(s, q), mcqBlock(s, q, player));
    const i = SECTIONS.indexOf(s);
    const nav = h('div', { class: 'next' },
      i > 0 ? h('a', { class: 'btn ghost', href: '#' + SECTIONS[i - 1].id, text: '← ' + SECTIONS[i - 1].title }) : h('span'),
      i < SECTIONS.length - 1 ? h('a', { class: 'btn', href: '#' + SECTIONS[i + 1].id, text: 'Next: ' + SECTIONS[i + 1].title }) : h('a', { class: 'btn', href: '#summary', text: 'See your results' }));
    m.append(nav);
    if (anchor) { const a = $(anchor); a && a.scrollIntoView(); } else window.scrollTo(0, 0);
    $('#rail').classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
  }

  function renderSummary() {
    stopPlayer(); renderRail('summary');
    const m = $('#main'); m.innerHTML = '';
    m.append(h('div', { class: 'sechead' }, h('h1', { text: 'Your results' })));
    m.append(h('p', { text: API ? 'Your progress is saved in Blackboard. Your Blackboard grade for this lab is the share of lectures you have listened to the end; practice scores here are not graded.' : 'Saved in this browser only. Practice scores here are not graded; the graded questions are in Blackboard.' }));
    const tb = h('tbody');
    let tr = 0, tt = 0;
    SECTIONS.forEach(s => {
      const st = P[s.id] || { seen: 0, heard: '', mcq: {}, checks: {} }, q = Q[s.id];
      const right = q.mcq.filter((x, i) => (st.mcq || {})[i] === x.a).length, ans = Object.keys(st.mcq || {}).length;
      tr += right; tt += q.mcq.length;
      tb.append(h('tr', {}, h('td', {}, h('a', { href: '#' + s.id, text: s.title })),
        h('td', { text: lectureDone(s) ? 'Finished' : heardCount(s) ? `${heardCount(s)} of ${s.slides.length} slides heard` : 'Not started' }),
        h('td', { text: `${Object.keys(st.checks || {}).length} of ${q.checks.length}` }),
        h('td', { text: ans ? `${right} of ${q.mcq.length}` + (ans < q.mcq.length ? ` (${ans} answered)` : '') : '—' })));
    });
    m.append(h('div', { class: 'tablewrap' }, h('table', { class: 'sum' }, h('thead', {}, h('tr', {}, h('th', { text: 'Section' }), h('th', { text: 'Lecture' }), h('th', { text: 'Knowledge check' }), h('th', { text: 'Multiple choice' }))), tb)));
    m.append(h('p', { class: 'score', text: `Multiple choice overall: ${tr} of ${tt}` }));
    m.append(h('button', { class: 'btn ghost', onclick: () => { if (confirm('Clear all saved progress in this browser?')) { P = {}; save(); renderSummary(); } } }, 'Clear my progress'));
    window.scrollTo(0, 0);
  }

  function route() {
    const id = (location.hash || '#home').slice(1);
    if (id === 'home' || !id) renderHome();
    else if (id === 'summary') renderSummary();
    else renderSection(id);
  }
  // data for the participation PDF report (participation.js)
  window.LAB_REPORT = function () {
    const lectures = [], mcqs = [], cards = []; let heardAll = 0, total = 0;
    SECTIONS.forEach(s => {
      const st = P[s.id] || { mcq: {}, cards: {} }, q = Q[s.id], n = heardCount(s);
      heardAll += Math.min(n, s.slides.length); total += s.slides.length;
      lectures.push({ key: s.id, title: s.chapter.title.split('·')[0].trim() + ' · ' + s.title, status: lectureDone(s) ? 'Finished — every slide heard' : `${n} of ${s.slides.length} slides heard` });
      q.cards.forEach((c, i) => cards.push({ key: s.id + '-card-' + (i + 1), title: s.title + ' — ' + c[0], visited: !!(st.cards || {})[i] }));
      q.mcq.forEach((m, i) => { const a = (st.mcq || {})[i]; mcqs.push({ key: s.id + '-mcq-' + (i + 1), prompt: s.title + ': ' + m.q, selected: a == null ? 'Not answered' : LET[a] + '. ' + m.o[a], correctness: a == null ? null : a === m.a }); });
    });
    return { lectures, mcqs, cards, lecturePercent: total ? Math.round(1000 * heardAll / total) / 10 : 0 };
  };
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', e => {
    if (!player || e.target.closest('input,select,textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('button') && e.key === ' ') return;
    player.key(e);
  });
  route();
})();
