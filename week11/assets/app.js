/* CS650 Chapter 11 lab: animated narrated lecture, learning activities and a formal-language "Try it" workspace.
   Emits document events ("lab:progress", "lab:activity") so the shared participation
   scripts can record progress and study time when the lab is connected to Supabase. */
(function () {
  "use strict";
  const MODULES = window.LAB_MODULES;
  const LEC = window.LECTURE;
  const KEY = "cs650-ch11-planning-lab-v3";
  MODULES.forEach((m) => { if ((window.LAB_CARDS || {})[m.id]) m.cards = window.LAB_CARDS[m.id];
    m.tryit = (window.LAB_TRYIT || {})[m.id] || []; m.traces = (window.LAB_TRACES || {})[m.id] || [];
    const W = (window.LAB_WHY || {})[m.id] || []; (m.mcq || []).forEach((q, i) => { if (!q.why && W[i]) q.why = W[i]; }); });
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

  /* ---------------- progress store ---------------- */
  let P = {};
  try { P = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { P = {}; }
  const mp = (id) => { const p = (P[id] = P[id] || { watched: [], learn: false, cards: [], check: null, mcq: {} }); p.tryit = p.tryit || {}; p.code = p.code || {}; p.trace = p.trace || {}; p.first = p.first || {}; p.keys = p.keys || {}; p.solutions = p.solutions || {}; return p; };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };
  const emit = (type, detail) => document.dispatchEvent(new CustomEvent(type, { detail }));

  function slidesOf(m) { const out = []; for (let n = m.slides[0]; n <= m.slides[1]; n++) out.push(n); return out; }
  function stepsOf(m) { return m.kind === "section" ? ["watch", "learn"].concat(m.traces.length ? ["trace"] : [], ["cards", "check", "practice"], m.tryit.length ? ["tryit"] : []) : ["watch"]; }
  const STEP_NAMES = { watch: "Watch", learn: "Read", trace: "Step by step", cards: "Flip cards", check: "Check", practice: "MCQs", tryit: "Try it" };

  function stepDone(m, step) {
    const p = mp(m.id);
    if (step === "watch") return slidesOf(m).every((n) => p.watched.includes(n));
    if (step === "learn") return !!p.learn;
    if (step === "trace") return m.traces.every((t) => p.trace[t.id]);
    if (step === "cards") return p.cards.length >= m.cards.length;
    if (step === "check") return p.check !== null;
    if (step === "practice") return Object.keys(p.mcq).length >= m.mcq.length;
    if (step === "tryit") return m.tryit.every((x) => p.tryit[x.id]);
    return false;
  }
  function modDone(m) { return stepsOf(m).every((s) => stepDone(m, s)); }
  function modPct(m) { const st = stepsOf(m); return st.filter((s) => stepDone(m, s)).length / st.length; }
  function overall() {
    const pct = Math.round(100 * MODULES.reduce((a, m) => a + modPct(m), 0) / MODULES.length);
    $("overallPct").textContent = pct + "%"; $("overallRing").style.setProperty("--p", pct);
    return pct;
  }
  /* ---------------- rubric and running grade ---------------- */
  const RUBRIC = Object.assign({ watch: 10, learn: 5, trace: 15, cards: 10, check: 5, practice: 25, tryit: 30 }, window.LAB_RUBRIC || {});
  const RUBRIC_TEXT = {
    watch: ["Watch", "share of lecture slides heard to the end"], learn: ["Read", "sections whose reading you marked as read"],
    trace: ["Step by step", "traces stepped through to the last step"], cards: ["Study cards", "cards marked “Got it”"],
    check: ["Check", "check questions answered (any answer counts)"], practice: ["MCQs", "questions right on your FIRST answer"],
    tryit: ["Try it", "exercises whose result matched"] };
  function firstOf(p, i) { const f = p.first["mcq" + i]; return f === undefined ? p.mcq[i] : f; }
  /* Answer keys. The published lab ships without answers: the key for a question arrives from the
     server (window.LAB_ANSWER) only after the student's first answer is saved, and is kept in p.keys.
     The authoring copy and the preview still carry q.answer / q.fb / q.why and use them directly. */
  const qOf = (m, slot) => (slot === "check" ? m.check : m.mcq[Number(slot.slice(3))]);
  const qKey = (m, slot) => m.id + (slot === "check" ? "-check" : "-mcq-" + (Number(slot.slice(3)) + 1));
  function keyFor(m, slot) {
    const k = mp(m.id).keys[slot]; if (k && Number.isInteger(k.answer)) return k;
    const q = qOf(m, slot); return q && Number.isInteger(q.answer) ? { answer: q.answer, fb: q.fb, why: q.why } : null;
  }
  const answerOf = (m, slot) => { const k = keyFor(m, slot); return k ? k.answer : undefined; };
  function gradeParts() {
    const t = {}; Object.keys(RUBRIC).forEach((k) => (t[k] = [0, 0]));
    MODULES.forEach((m) => {
      const p = mp(m.id), sl = slidesOf(m);
      t.watch[0] += sl.filter((n) => p.watched.includes(n)).length; t.watch[1] += sl.length;
      if (m.kind !== "section") return;
      t.learn[0] += p.learn ? 1 : 0; t.learn[1] += 1;
      t.trace[0] += m.traces.filter((x) => p.trace[x.id]).length; t.trace[1] += m.traces.length;
      t.cards[0] += p.cards.length; t.cards[1] += m.cards.length;
      t.check[0] += p.check != null ? 1 : 0; t.check[1] += 1;
      t.practice[0] += m.mcq.filter((q, i) => firstOf(p, i) != null && firstOf(p, i) === answerOf(m, "mcq" + i)).length; t.practice[1] += m.mcq.length;
      t.tryit[0] += m.tryit.filter((x) => p.tryit[x.id]).length; t.tryit[1] += m.tryit.length;
    });
    const rows = Object.keys(RUBRIC).filter((k) => t[k][1] > 0).map((k) => ({ key: k, name: RUBRIC_TEXT[k][0], what: RUBRIC_TEXT[k][1],
      done: t[k][0], of: t[k][1], weight: RUBRIC[k], points: RUBRIC[k] * t[k][0] / t[k][1] }));
    const max = rows.reduce((a, r) => a + r.weight, 0), pts = rows.reduce((a, r) => a + r.points, 0);
    return { rows, max, points: pts, percent: max ? 100 * pts / max : 0 };
  }
  function renderGrade() {
    const g = gradeParts(); const el = $("gradeNow"); if (el) el.textContent = g.percent.toFixed(0) + "/100";
    const box = $("gradeBody"); if (!box) return g;
    box.innerHTML = `<table class="sym grade-t"><thead><tr><th>Part</th><th>What counts</th><th>Weight</th><th>Your progress</th><th>Points</th></tr></thead><tbody>` +
      g.rows.map((r) => `<tr><td><b>${r.name}</b></td><td>${r.what}</td><td>${(100 * r.weight / g.max).toFixed(0)}</td><td>${r.done} of ${r.of}</td><td>${(100 * r.points / g.max).toFixed(1)}</td></tr>`).join("") +
      `</tbody><tfoot><tr><td colspan="4"><b>Grade so far</b></td><td><b>${g.percent.toFixed(1)} / 100</b></td></tr></tfoot></table>
      <ul class="grade-notes"><li>MCQs are graded on your <b>first</b> answer. “Try this question again” is practice and does not change your grade.</li>
      <li>Everything else counts when it is complete, so you can take as many tries as you need.</li>
      <li>${RECORDED && RECORDED.grade_breakdown
        ? `<b>Recorded on the server: ${Number(RECORDED.participation_grade).toFixed(1)} / 100</b>${RECORDED.status === "overridden" ? " (set by your instructor)" : ""}. This is the grade your instructor sees. It can trail this page by a few seconds while your work is being saved.`
        : "This grade is calculated in your browser. Once you are signed in, your work is saved to the server and the recorded grade appears here."}</li></ul>`;
    return g;
  }
  /* ---------------- hooks for participation.js (server records) ---------------- */
  let RECORDED = null;
  window.LAB_SERVER = {
    modules: MODULES,
    progress: () => P,
    slideSeconds: (n) => { for (const part in LEC) { const d = (LEC[part] || []).find((x) => x.n === n); if (d) return Math.max(2, Math.round(d.dur / 1000)); } return 2; },
    owner: () => P.__owner || null,
    reset: (owner) => { Object.keys(P).forEach((k) => delete P[k]); P.__owner = owner; save(); },
    // apply server state; fn(P, mp) mutates progress, then every panel except the player is redrawn
    merge: (fn) => {
      fn(P, mp); save(); renderNav(); renderSteps(); overall(); renderGrade();
      if (cur.kind === "section") { renderLearn(); renderTrace(); renderCards(); renderCheck(); renderPractice(); renderTryit(); }
      renderDots();
    },
    setRecorded: (c) => { RECORDED = c || null; renderGrade(); },
    touch: () => save(),
    // a credited exercise's worked solution, sent by the server
    setSolution: (mod, id, text) => {
      if (!text) return; mp(mod).solutions[id] = text; save();
      if (cur.id === mod) document.querySelectorAll("#tryitBody .ex-card").forEach((e) => e._refreshSol && e._refreshSol());
    },
  };
  function changed(what) {
    save(); renderNav(); renderSteps(); const pct = overall(); renderGrade();
    emit("lab:progress", { module: cur.id, what, percent: pct, progress: P });
  }

  /* ---------------- navigation ---------------- */
  let cur = MODULES[0], step = "watch";
  function renderNav() {
    const nav = $("navList"); nav.innerHTML = "";
    let lastPart = null;
    MODULES.forEach((m) => {
      if (m.part !== lastPart) {
        const h = document.createElement("div"); h.className = "nav-sep";
        h.textContent = "Chapter 11 · Automated Planning";
        nav.appendChild(h); lastPart = m.part;
      }
      const b = document.createElement("button"); b.className = "nav-item";
      b.setAttribute("aria-current", m === cur ? "true" : "false");
      const st = modDone(m) ? "✅" : (modPct(m) > 0 ? "◐" : "");
      b.innerHTML = `<span class="tag">${esc(m.label)}</span><span class="nm">${esc(m.title)}</span><span class="st" aria-label="${modDone(m) ? "complete" : ""}">${st}</span>`;
      b.onclick = () => { openModule(m, "watch"); closeMenu(); };
      nav.appendChild(b);
    });
  }
  function renderSteps() {
    const ol = $("steps"); ol.innerHTML = "";
    stepsOf(cur).forEach((s, i) => {
      const li = document.createElement("li"); const b = document.createElement("button");
      b.setAttribute("role", "tab"); b.setAttribute("aria-selected", s === step ? "true" : "false");
      b.innerHTML = `${i + 1}. ${STEP_NAMES[s]}${stepDone(cur, s) ? '<span class="ok">✓</span>' : ""}`;
      b.onclick = () => showStep(s); li.appendChild(b); ol.appendChild(li);
    });
  }
  function nextLabel(s) {
    const st = stepsOf(cur); const i = st.indexOf(s);
    if (i < st.length - 1) return { text: "Continue to " + STEP_NAMES[st[i + 1]] + " →", go: () => showStep(st[i + 1]) };
    const mi = MODULES.indexOf(cur);
    if (mi < MODULES.length - 1) { const nm = MODULES[mi + 1]; return { text: "Next: " + nm.label + " " + nm.title + " →", go: () => openModule(nm, "watch") }; }
    return { text: "You have finished the lab ✓", go: () => {} };
  }
  function wireNext(btnId, s) { const n = nextLabel(s); const b = $(btnId); b.textContent = n.text; b.onclick = () => { n.go(); window.scrollTo({ top: 0, behavior: "smooth" }); }; }

  function openModule(m, s) {
    pause(); cur = m; P.last = m.id; save();
    $("modLabel").textContent = m.label; $("modTitle").textContent = m.title; $("modBlurb").textContent = m.blurb || "";
    renderNav(); loadSlide(0, false);
    if (m.kind === "section") { renderLearn(); renderTrace(); renderCards(); renderCheck(); renderPractice(); renderTryit(); }
    showStep(s || "watch");
    $("main").focus({ preventScroll: true });
    emit("lab:activity", { type: "open-module", module: m.id });
  }
  function showStep(s) {
    if (s !== "watch") pause();
    step = s;
    ["watch", "learn", "trace", "cards", "check", "practice", "tryit"].forEach((k) => $("panel-" + k).classList.toggle("on", k === s));
    renderSteps();
    const NB = { watch: "watchNext", learn: "learnNext", trace: "traceNext", cards: "cardsNext", check: "checkNext", practice: "practiceNext", tryit: "tryitNext" }; NB[s] && wireNext(NB[s], s);
    if (s === "tryit") emit("lab:activity", { type: "open-tryit", module: cur.id });
  }

  /* ---------------- player ---------------- */
  const audio = $("audio"); let slides = [], si = 0, state = -1, front = "imgA", fullScript = false, autoNext = false;
  const slideData = (n) => LEC[cur.part][n - 1];
  const imgSrc = (n, k) => `media/${cur.part}/s${String(n).padStart(2, "0")}_${k}.webp`;
  function preload(n) { const d = slideData(n); for (let k = 0; k <= d.clicks.length; k++) { const i = new Image(); i.src = imgSrc(n, k); } }

  function loadSlide(i, play) {
    slides = slidesOf(cur); si = Math.max(0, Math.min(i, slides.length - 1));
    const n = slides[si], d = slideData(n);
    audio.src = `media/${cur.part}/a${String(n).padStart(2, "0")}.mp3`;
    audio.playbackRate = parseFloat($("speed").value);
    state = -1; setState(0, true); preload(n); if (slides[si + 1]) preload(slides[si + 1]);
    $("slideNum").textContent = `Slide ${si + 1} of ${slides.length}`;
    $("tDur").textContent = fmt(d.dur); $("tCur").textContent = "0:00"; $("seek").value = 0;
    renderDots(); renderScript(); setCaption("");
    $("bigPlay").hidden = !!play;
    if (play) playNow();
  }
  function setState(k, instant) {
    if (k === state) return; state = k;
    const n = slides[si]; const back = front === "imgA" ? "imgB" : "imgA";
    const b = $(back), f = $(front);
    b.alt = slideData(n).title; b.src = imgSrc(n, k);
    if (instant) { b.style.transition = "none"; f.style.transition = "none"; }
    const swap = () => { b.classList.add("show"); f.classList.remove("show"); front = back;
      if (instant) requestAnimationFrame(() => { b.style.transition = ""; f.style.transition = ""; }); };
    if (b.complete && b.naturalWidth) swap(); else { b.onload = swap; b.onerror = swap; }
  }
  function playNow() {
    if (window.LAB_GATE && !window.LAB_GATE.ready()) { window.LAB_GATE.prompt(); $("bigPlay").hidden = false; return; }
    const p = audio.play(); $("bigPlay").hidden = true;
    if (p && p.catch) p.catch(() => { $("bigPlay").hidden = false; setPlayIcon(); });
  }
  function pause() { if (!audio.paused) audio.pause(); }
  function setPlayIcon() { const pl = !audio.paused; $("playPause").textContent = pl ? "❚❚" : "▶"; $("playPause").setAttribute("aria-label", pl ? "Pause" : "Play"); }

  audio.addEventListener("play", () => { setPlayIcon(); emit("lab:activity", { type: "media-play", module: cur.id, slide: slides[si] }); });
  audio.addEventListener("pause", () => { setPlayIcon(); emit("lab:activity", { type: "media-pause", module: cur.id }); });
  audio.addEventListener("timeupdate", () => {
    const t = audio.currentTime * 1000, d = slideData(slides[si]);
    let k = 0; while (k < d.clicks.length && d.clicks[k] <= t) k++;
    setState(k, false);
    $("tCur").textContent = fmt(t); if (!seeking) $("seek").value = Math.round(1000 * t / Math.max(1, d.dur));
    highlight(t);
    if (t > 0.9 * d.dur) markWatched(slides[si]);
  });
  audio.addEventListener("ended", () => {
    markWatched(slides[si]);
    if (si < slides.length - 1) loadSlide(si + 1, true);
    else { setPlayIcon(); setCaption("End of this video. Continue to Read for the illustrated reading."); }
  });
  function markWatched(n) { const p = mp(cur.id); if (!p.watched.includes(n)) { p.watched.push(n); changed("watch"); renderDots(); } }

  let seeking = false;
  $("seek").addEventListener("input", () => { seeking = true; const d = slideData(slides[si]); $("tCur").textContent = fmt($("seek").value / 1000 * d.dur); });
  $("seek").addEventListener("change", () => { const d = slideData(slides[si]); audio.currentTime = $("seek").value / 1000 * d.dur / 1000; seeking = false; });
  $("playPause").onclick = () => { if (audio.paused) playNow(); else pause(); };
  $("bigPlay").onclick = playNow;
  $("stage").addEventListener("click", (e) => { if (e.target.id !== "bigPlay") { if (audio.paused) playNow(); else pause(); } });
  $("prevSlide").onclick = () => { if (audio.currentTime > 3) audio.currentTime = 0; else loadSlide(si - 1, !audio.paused); };
  $("nextSlide").onclick = () => loadSlide(si + 1, !audio.paused || true);
  $("speed").onchange = () => { audio.playbackRate = parseFloat($("speed").value); };
  $("ccBtn").onclick = () => { const on = $("ccBtn").getAttribute("aria-pressed") !== "true"; $("ccBtn").setAttribute("aria-pressed", on); $("caption").classList.toggle("off", !on); };
  document.addEventListener("keydown", (e) => {
    if (step !== "watch" || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === " " && e.target.tagName !== "BUTTON") { e.preventDefault(); audio.paused ? playNow() : pause(); }
    if (e.key === "ArrowRight" && e.altKey) loadSlide(si + 1, true);
    if (e.key === "ArrowLeft" && e.altKey) loadSlide(si - 1, true);
  });

  function renderDots() {
    const box = $("dots"); box.innerHTML = ""; const p = mp(cur.id);
    slides.forEach((n, i) => {
      const b = document.createElement("button"); b.className = "dot" + (i === si ? " cur" : p.watched.includes(n) ? " done" : "");
      b.textContent = i + 1; b.title = slideData(n).title; b.setAttribute("aria-label", `Slide ${i + 1}: ${slideData(n).title}`);
      b.onclick = () => loadSlide(i, true); box.appendChild(b);
    });
  }

  /* ---------------- script + captions ---------------- */
  let sentEls = [];
  function renderScript() {
    if (!renderScript.init) { renderScript.init = true; $("scriptBody").hidden = true; $("scriptToggle").setAttribute("aria-expanded", "false"); $("scriptToggle").textContent = "▸ Show narration"; }
    const body = $("scriptBody"); body.innerHTML = ""; sentEls = []; lastSent = null;
    body.classList.toggle("full", fullScript);
    const list = fullScript ? slides : [slides[si]];
    list.forEach((n) => {
      const d = slideData(n);
      if (fullScript) { const h = document.createElement("div"); h.className = "slide-h"; h.textContent = `Slide ${slides.indexOf(n) + 1} · ${d.title}`; body.appendChild(h); }
      d.segs.forEach((seg) => {
        const p = document.createElement("p"); p.className = "seg";
        seg.sents.forEach(([ms, txt]) => {
          const s = document.createElement("span"); s.className = "sent"; s.textContent = txt + " ";
          s.tabIndex = 0; s.setAttribute("role", "button"); s.title = "Play from here";
          const go = () => { if (n !== slides[si]) { loadSlide(slides.indexOf(n), false); }
            audio.currentTime = Math.max(0, ms - 150) / 1000; playNow(); };
          s.onclick = go; s.onkeydown = (e) => { if (e.key === "Enter") go(); };
          p.appendChild(s); if (n === slides[si]) sentEls.push([ms, s, txt]);
        });
        body.appendChild(p);
      });
    });
  }
  let lastSent = null;
  function highlight(t) {
    let hit = null; for (const e of sentEls) { if (e[0] <= t + 60) hit = e; else break; }
    if (hit === lastSent) return; lastSent = hit;
    sentEls.forEach((e) => e[1].classList.toggle("now", e === hit));
    if (hit) { setCaption(hit[2]); const box = $("scriptBody");
      if (!fullScript && !$("scriptBody").hidden) { const top = hit[1].offsetTop - box.offsetTop - 40; box.scrollTo({ top, behavior: "smooth" }); } }
  }
  function setCaption(t) { $("caption").textContent = t; }
  $("scriptToggle").onclick = () => { const b = $("scriptBody"); b.hidden = !b.hidden; $("scriptToggle").setAttribute("aria-expanded", !b.hidden); $("scriptToggle").textContent = b.hidden ? "▸ Show narration" : "▾ Hide narration"; emit("lab:activity", { type: b.hidden ? "hide-script" : "show-script", module: cur.id }); };
  $("scriptAll").onclick = () => { fullScript = !fullScript; $("scriptAll").textContent = fullScript ? "Show only this slide" : "Show the whole section"; renderScript(); lastSent = null; emit("lab:activity", { type: "read-script", module: cur.id }); };
  $("scriptBody").addEventListener("scroll", () => emit("lab:activity", { type: "scroll" }), { passive: true });

  /* ---------------- learn ---------------- */
  function renderLearn() {
    const p = mp(cur.id);
    $("learnBody").innerHTML = `<div class="pam-tools"><button class="pbtn" id="printRead" type="button">🖨 Print or save this reading as PDF</button></div>` + cur.learn + `<div class="read-mark"><button id="readBtn" ${p.learn ? "disabled" : ""}>${p.learn ? "✓ Marked as read" : "I have read and understood this"}</button></div>`;
    $("printRead").onclick = () => { document.body.classList.add("print-read"); emit("lab:activity", { type: "print-reading", module: cur.id }); window.print(); setTimeout(() => document.body.classList.remove("print-read"), 500); };
    $("learnBody").querySelectorAll("details.tryq").forEach((d) => d.addEventListener("toggle", () => emit("lab:activity", { type: "reveal", module: cur.id })));
    $("readBtn").onclick = () => { mp(cur.id).learn = true; $("readBtn").disabled = true; $("readBtn").textContent = "✓ Marked as read"; changed("learn"); };
  }

  /* ---------------- step-by-step traces ---------------- */
  function renderTrace() {
    const box = $("traceBody"); box.innerHTML = ""; if (!cur.traces.length || !window.LabTrace) return;
    const p = mp(cur.id), m = cur;
    const toc = document.createElement("div"); toc.className = "tr-toc";
    toc.innerHTML = `<b>${m.traces.length} trace${m.traces.length > 1 ? "s" : ""} in this section.</b> Press <b>Next ▶</b> to move one step. When a step asks you to <b>predict first</b>, decide before pressing <b>Show me</b>.` +
      `<ol>${m.traces.map((t) => `<li><a href="#tr-${t.id}">${t.title}</a></li>`).join("")}</ol>`;
    box.appendChild(toc);
    m.traces.forEach((t) => {
      const holder = document.createElement("div"); holder.id = "tr-" + t.id; box.appendChild(holder);
      window.LabTrace.render(holder, t, { done: !!p.trace[t.id],
        onDone: () => { if (!p.trace[t.id]) { p.trace[t.id] = true; changed("trace"); traceCount(); } },
        onStep: (k) => emit("lab:activity", { type: "trace-step", module: m.id, trace: t.id, step: k }) });
    });
    traceCount();
  }
  function traceCount() { const p = mp(cur.id); $("traceCount").textContent = `${cur.traces.filter((t) => p.trace[t.id]).length} of ${cur.traces.length} traces completed`; }

  /* ---------------- cards ---------------- */
  /* ---------------- study cards (v3): one at a time, self-rated ---------------- */
  const KIND = { term: "Term", q: "Question", prob: "Problem", pair: "Compare" };
  let deck = [], cardRev = false, cardAll = false, cardFlipped = false;
  function cardObj(c) { return Array.isArray(c) ? { k: "term", f: esc(c[0]), d: esc(c[1]) } : c; }
  function cardBack(c) {
    return `<div class="sc-d">${c.d}</div>` + (c.pic ? `<div class="sc-pic">${c.pic}</div>` : "") +
      (c.ex ? `<div class="sc-ex"><b>Example</b> ${c.ex}</div>` : "") + (c.w ? `<div class="sc-w"><b>Watch out</b> ${c.w}</div>` : "");
  }
  function renderCards() {
    const p = mp(cur.id); cur.cards = cur.cards.map(cardObj);
    deck = cur.cards.map((_, i) => i).filter((i) => !p.cards.includes(i));
    cardFlipped = false; drawCards();
  }
  function drawCards() {
    const box = $("cards"), p = mp(cur.id), N = cur.cards.length; box.className = "sc";
    const bar = `<div class="sc-bar"><div class="sc-prog"><div class="sc-pbar"><span style="width:${100 * p.cards.length / N}%"></span></div><span>${p.cards.length} of ${N} cards marked “Got it”</span></div>
      <div class="sc-tools"><button class="pbtn" id="scShuffle" type="button">⤨ Shuffle</button>
      <button class="pbtn${cardRev ? " on" : ""}" id="scRev" type="button" aria-pressed="${cardRev}">⇄ ${cardRev ? "Answer first: on" : "Answer first: off"}</button>
      <button class="pbtn${cardAll ? " on" : ""}" id="scAll" type="button" aria-pressed="${cardAll}">☰ ${cardAll ? "Back to studying" : "See all cards"}</button></div></div>`;
    if (cardAll) {
      box.innerHTML = bar + `<div class="sc-list">${cur.cards.map((c, i) => `<div class="sc-li${p.cards.includes(i) ? " got" : ""}"><div class="sc-li-f"><span class="sc-k k-${c.k}">${KIND[c.k] || "Card"}</span>${c.f}</div><div class="sc-li-b">${cardBack(c)}</div></div>`).join("")}</div>`;
    } else if (!deck.length) {
      box.innerHTML = bar + `<div class="sc-done"><div class="sc-done-h">✓ All ${N} cards marked “Got it”</div><p>Go through them once more any time; it only takes a few minutes and spaced review is what makes it stick.</p><button class="next-btn" id="scAgain" type="button">Study all ${N} cards again</button></div>`;
    } else {
      const i = deck[0], c = cur.cards[i], rev = cardRev && c.k === "term";
      const front = rev ? `<div class="sc-ask">Which term matches this?</div>${cardBack({ d: c.d, pic: c.pic })}` : `<div class="sc-f">${c.f}</div>`;
      const back = rev ? `<div class="sc-f">${c.f}</div>` + (c.ex ? `<div class="sc-ex"><b>Example</b> ${c.ex}</div>` : "") + (c.w ? `<div class="sc-w"><b>Watch out</b> ${c.w}</div>` : "") : cardBack(c);
      box.innerHTML = bar + `<div class="sc-card${cardFlipped ? " flipped" : ""}" id="scCard" role="button" tabindex="0" aria-label="Study card. Press Enter to show the answer.">
        <div class="sc-top"><span class="sc-k k-${c.k}">${KIND[c.k] || "Card"}</span><span class="sc-left">${deck.length} left in this round</span></div>
        <div class="sc-front">${front}</div>
        ${cardFlipped ? `<div class="sc-back">${back}</div>` : `<div class="sc-hint">Say your answer out loud, then tap to check.</div>`}</div>
        <div class="sc-rate"${cardFlipped ? "" : " hidden"}><button class="sc-again" id="scNo" type="button">↻ Review again <small>(key 1)</small></button><button class="sc-got" id="scYes" type="button">✓ Got it <small>(key 2)</small></button></div>`;
      const card = $("scCard");
      card.onclick = () => { if (!cardFlipped) { cardFlipped = true; emit("lab:activity", { type: "card-flip", module: cur.id, card: i }); drawCards(); } };
      card.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.onclick(); } };
      if (cardFlipped) { $("scNo").onclick = () => rate(false); $("scYes").onclick = () => rate(true); }
    }
    $("scShuffle").onclick = () => { for (let j = deck.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [deck[j], deck[r]] = [deck[r], deck[j]]; } cardFlipped = false; drawCards(); };
    $("scRev").onclick = () => { cardRev = !cardRev; cardFlipped = false; drawCards(); };
    $("scAll").onclick = () => { cardAll = !cardAll; drawCards(); };
    if ($("scAgain")) $("scAgain").onclick = () => { deck = cur.cards.map((_, j) => j); cardFlipped = false; drawCards(); };
    updateCardCount();
  }
  function rate(ok) {
    const p = mp(cur.id), i = deck.shift();
    if (ok) { if (!p.cards.includes(i)) { p.cards.push(i); changed("cards"); } }
    else deck.splice(Math.min(3, deck.length), 0, i);
    emit("lab:activity", { type: "card-rate", module: cur.id, card: i, gotIt: ok });
    cardFlipped = false; drawCards(); const c = $("scCard"); if (c) c.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", (e) => {
    const panel = $("panel-cards"); if (!panel || !panel.classList.contains("on") || cardAll) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || "")) return;
    if (cardFlipped && e.key === "1") rate(false); else if (cardFlipped && e.key === "2") rate(true);
  });
  function updateCardCount() { $("cardCount").textContent = `${mp(cur.id).cards.length} of ${cur.cards.length} cards marked “Got it”`; }

  /* ---------------- quizzes ---------------- */
  function quizBlock(m, slot, saved, onAnswer, label, firstFn) {
    const q = qOf(m, slot);
    const div = document.createElement("div"); div.className = "q";
    div.innerHTML = `<div class="q-n">${label}</div><div class="q-t">${esc(q.q)}</div>`;
    const btns = q.options.map((o, j) => {
      const b = document.createElement("button"); b.className = "opt";
      b.innerHTML = `<span class="l">${String.fromCharCode(65 + j)}.</span>${esc(o)}`; div.appendChild(b); return b;
    });
    const why = document.createElement("div");
    const L = (j) => String.fromCharCode(65 + j);
    const reveal = (choice) => {
      const k = keyFor(m, slot);
      if (!k) { why.className = "why why-wait"; why.innerHTML = `<div class="why-p">Your answer (${L(choice)}) is saved. The explanation appears once you are signed in and online.</div>`; btns.forEach((b, j) => { b.disabled = true; if (j === choice) b.classList.add("picked"); }); return; }
      const A = k.answer, fb = Array.isArray(k.fb) ? k.fb : null;
      btns.forEach((b, j) => {
        b.disabled = true; b.classList.remove("picked");
        if (j === A) b.classList.add("right");
        if (j === choice && j !== A) b.classList.add("wrong");
        if (fb && fb[j]) { const f = document.createElement("span"); f.className = "fb"; f.textContent = fb[j]; b.appendChild(f); }
      });
      const ok = choice === A;
      why.className = "why " + (ok ? "why-ok" : "why-no");
      why.innerHTML = (ok
        ? `<div class="why-h">✓ Correct: ${L(A)}. ${esc(q.options[A])}</div>`
        : `<div class="why-h">✗ Not quite. You chose ${L(choice)}. ${esc(q.options[choice])}</div>` +
          (fb && fb[choice] ? `<div class="why-p"><b>Why ${L(choice)} is wrong:</b> ${esc(fb[choice])}</div>` : "") +
          `<div class="why-p"><b>The correct answer is ${L(A)}:</b> ${esc(q.options[A])}</div>`) +
        (k.why ? `<div class="why-p"><b>Why ${L(A)} is correct:</b> ${esc(k.why)}</div>` : "");
      const f0 = firstFn ? firstFn() : undefined;
      if (f0 !== undefined && f0 !== null) why.insertAdjacentHTML("beforeend", `<div class="why-first">${f0 === A
        ? "✓ Graded: your first answer (" + L(f0) + ") was correct."
        : "Graded on your first answer (" + L(f0) + ", not correct). Retries are practice and do not change your grade."}</div>`);
      const r = document.createElement("button"); r.className = "retry"; r.textContent = "Try this question again";
      r.onclick = () => { const fresh = quizBlock(m, slot, null, onAnswer, label, firstFn); div.replaceWith(fresh); };
      why.appendChild(document.createElement("br")); why.appendChild(r);
    };
    btns.forEach((b, j) => (b.onclick = async () => {
      const p = mp(m.id);
      // first answer in a published lab: the server saves it, then sends the key
      if (window.LAB_ANSWER && !p.keys[slot]) {
        btns.forEach((x) => (x.disabled = true)); b.classList.add("picked");
        why.className = "why why-wait"; why.innerHTML = `<div class="why-p">Saving your answer…</div>`;
        try {
          const r = await window.LAB_ANSWER(qKey(m, slot), j);
          p.keys[slot] = { answer: r.answer, fb: r.fb, why: r.why };
          onAnswer(j, r.selected); reveal(j);
        } catch (e) {
          b.classList.remove("picked"); btns.forEach((x) => (x.disabled = false));
          why.className = "why why-no"; why.innerHTML = `<div class="why-p">${esc(e.message || "Your answer could not be saved.")} Nothing was recorded; choose again when you are ready.</div>`;
        }
        return;
      }
      reveal(j); onAnswer(j, null);
    }));
    div.appendChild(why);
    if (saved !== null && saved !== undefined) reveal(saved);
    return div;
  }
  function renderCheck() {
    const box = $("checkBody"); box.innerHTML = ""; const p = mp(cur.id);
    box.appendChild(quizBlock(cur, "check", p.check, (j, first) => { if (first != null) p.first.check = first; else if (p.first.check === undefined) p.first.check = j; p.check = j; changed("check"); }, "Check your understanding · completion counts, not correctness"));
  }
  function renderPractice() {
    const box = $("practiceBody"); box.innerHTML = ""; const p = mp(cur.id);
    cur.mcq.forEach((q, i) => box.appendChild(quizBlock(cur, "mcq" + i, p.mcq[i], (j, first) => { if (first != null) p.first["mcq" + i] = first; else if (p.first["mcq" + i] === undefined) p.first["mcq" + i] = j; p.mcq[i] = j; changed("practice"); score(); }, `Question ${i + 1} of ${cur.mcq.length} · graded on your first answer`, () => mp(cur.id).first["mcq" + i])));
    score();
  }
  function score() {
    const p = mp(cur.id); const ans = Object.keys(p.mcq);
    const right = cur.mcq.filter((q, i) => firstOf(p, i) != null && firstOf(p, i) === answerOf(cur, "mcq" + i)).length;
    $("practiceScore").textContent = ans.length ? `First-try score: ${right} of ${cur.mcq.length}` : "";
  }

  /* ---------------- try it (formal-language workspace) ---------------- */
  function renderTryit() {
    if (!cur.tryit.length || !window.FLWorkspace) return;
    const p = mp(cur.id);
    window.FLWorkspace.render($("tryitBody"), cur, { passed: p.tryit, code: p.code, solutions: p.solutions, save: () => { save(); emit("lab:code", { module: cur.id }); }, onPass: () => { changed("tryit"); tryCount(); } });
    tryCount();
  }
  function tryCount() { const p = mp(cur.id); $("tryitCount").textContent = `${cur.tryit.filter((x) => p.tryit[x.id]).length} of ${cur.tryit.length} exercises done`; }

  /* ---------------- mobile menu ---------------- */
  function closeMenu() { $("nav").classList.remove("open"); $("menuBtn").setAttribute("aria-expanded", "false"); }
  $("menuBtn").onclick = () => { const o = $("nav").classList.toggle("open"); $("menuBtn").setAttribute("aria-expanded", o); };
  document.addEventListener("click", (e) => { if ($("nav").classList.contains("open") && !$("nav").contains(e.target) && e.target !== $("menuBtn")) closeMenu(); });

  /* ---------------- start ---------------- */
  window.CS650Lab = { progress: () => P, modules: MODULES, pause };
  // hooks used by participation.js (Monroe participation standard, as in Week 7)
  window.LAB_CONTROL = { pause: () => pause(), play: () => playNow(), playing: () => !audio.paused && !audio.ended };
  window.LAB_REPORT = function () {
    const lectures = [], mcqs = [], cards = [], tryit = []; let heard = 0, total = 0; const LET = "ABCD";
    MODULES.forEach((m) => {
      const p = mp(m.id), sl = slidesOf(m), n = sl.filter((x) => p.watched.includes(x)).length;
      heard += n; total += sl.length;
      lectures.push({ key: m.id, title: m.label + " · " + m.title, status: n === sl.length ? "Finished — every slide heard" : n + " of " + sl.length + " slides heard" });
      if (m.kind !== "section") return;
      m.tryit.forEach((x) => tryit.push({ key: m.id + "-tryit-" + x.id, title: m.label + " Try it · " + x.title, status: p.tryit[x.id] ? "Finished — result matched" : "Not finished" }));
      m.cards.forEach((c, i) => cards.push({ key: m.id + "-card-" + (i + 1), title: m.label + " " + m.title + " — " + String(Array.isArray(c) ? c[0] : c.f).replace(/<[^>]+>/g, ""), visited: p.cards.includes(i) }));
      const qs = [m.check].concat(m.mcq), ans = [p.check].concat(m.mcq.map((_, i) => p.mcq[i]));
      const firsts = [p.first.check === undefined ? p.check : p.first.check].concat(m.mcq.map((_, i) => firstOf(p, i)));
      qs.forEach((q, i) => { const a = firsts[i]; mcqs.push({ key: m.id + (i === 0 ? "-check" : "-mcq-" + i), prompt: m.label + ": " + q.q,
        selected: a == null ? "Not answered" : LET[a] + ". " + q.options[a], correctness: a == null ? null : (answerOf(m, i === 0 ? "check" : "mcq" + (i - 1)) === undefined ? null : a === answerOf(m, i === 0 ? "check" : "mcq" + (i - 1))) }); });
    });
    const g = gradeParts();
    return { lectures, mcqs, cards, tryit, lecturePercent: total ? Math.round(1000 * heard / total) / 10 : 0,
      grade: Math.round(10 * g.percent) / 10, gradeRows: g.rows.map((r) => ({ part: r.name, progress: r.done + " of " + r.of, points: Math.round(1000 * r.points / g.max) / 10, weight: Math.round(100 * r.weight / g.max) })) };
  };
  const start = MODULES.find((m) => m.id === P.last) || MODULES[0];
  overall(); renderGrade(); openModule(start, "watch");
  const gb = $("gradeBtn"), gd = $("gradeDlg");
  if (gb && gd) { gb.onclick = () => { renderGrade(); gd.hidden = false; $("gradeClose").focus(); };
    $("gradeClose").onclick = () => { gd.hidden = true; gb.focus(); };
    gd.addEventListener("click", (e) => { if (e.target === gd) { gd.hidden = true; gb.focus(); } });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !gd.hidden) { gd.hidden = true; gb.focus(); } }); }
})();
