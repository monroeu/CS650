/* CS650 Chapters 9–10 lab: animated narrated lecture + learning activities.
   Emits document events ("lab:progress", "lab:activity") so the shared participation
   scripts can record progress and study time when the lab is connected to Supabase. */
(function () {
  "use strict";
  const MODULES = window.LAB_MODULES;
  const LEC = window.LECTURE;
  const KEY = "cs650-ch09-10-lab-v1";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

  /* ---------------- progress store ---------------- */
  let P = {};
  try { P = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { P = {}; }
  const mp = (id) => (P[id] = P[id] || { watched: [], learn: false, cards: [], check: null, mcq: {} });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };
  const emit = (type, detail) => document.dispatchEvent(new CustomEvent(type, { detail }));

  function slidesOf(m) { const out = []; for (let n = m.slides[0]; n <= m.slides[1]; n++) out.push(n); return out; }
  function stepsOf(m) { return m.kind === "section" ? ["watch", "learn", "cards", "check", "practice"] : ["watch"]; }
  const STEP_NAMES = { watch: "Watch", learn: "Learn", cards: "Flip cards", check: "Check", practice: "Practice" };

  function stepDone(m, step) {
    const p = mp(m.id);
    if (step === "watch") return slidesOf(m).every((n) => p.watched.includes(n));
    if (step === "learn") return !!p.learn;
    if (step === "cards") return p.cards.length >= m.cards.length;
    if (step === "check") return p.check !== null;
    if (step === "practice") return Object.keys(p.mcq).length >= m.mcq.length;
    return false;
  }
  function modDone(m) { return stepsOf(m).every((s) => stepDone(m, s)); }
  function modPct(m) { const st = stepsOf(m); return st.filter((s) => stepDone(m, s)).length / st.length; }
  function overall() {
    const pct = Math.round(100 * MODULES.reduce((a, m) => a + modPct(m), 0) / MODULES.length);
    $("overallPct").textContent = pct + "%"; $("overallRing").style.setProperty("--p", pct);
    return pct;
  }
  function changed(what) {
    save(); renderNav(); renderSteps(); const pct = overall();
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
        h.textContent = m.part === "p1" ? "Part 1 · Chapter 9 · Inference" : "Part 2 · Chapter 10 · Knowledge Representation";
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
    if (m.kind === "section") { renderLearn(); renderCards(); renderCheck(); renderPractice(); }
    showStep(s || "watch");
    $("main").focus({ preventScroll: true });
    emit("lab:activity", { type: "open-module", module: m.id });
  }
  function showStep(s) {
    if (s !== "watch") pause();
    step = s;
    ["watch", "learn", "cards", "check", "practice"].forEach((k) => $("panel-" + k).classList.toggle("on", k === s));
    renderSteps();
    ({ watch: "watchNext", learn: "learnNext", cards: "cardsNext", check: "checkNext", practice: "practiceNext" })[s] && wireNext(({ watch: "watchNext", learn: "learnNext", cards: "cardsNext", check: "checkNext", practice: "practiceNext" })[s], s);
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
    else { setPlayIcon(); setCaption("End of this video. " + (cur.kind === "section" ? "Continue to Learn for the key concepts." : "")); }
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
  $("scriptToggle").onclick = () => { const b = $("scriptBody"); b.hidden = !b.hidden; $("scriptToggle").setAttribute("aria-expanded", !b.hidden); $("scriptToggle").textContent = (b.hidden ? "▸" : "▾") + " Narration script"; };
  $("scriptAll").onclick = () => { fullScript = !fullScript; $("scriptAll").textContent = fullScript ? "Show only this slide" : "Show the whole section"; renderScript(); lastSent = null; emit("lab:activity", { type: "read-script", module: cur.id }); };
  $("scriptBody").addEventListener("scroll", () => emit("lab:activity", { type: "scroll" }), { passive: true });

  /* ---------------- learn ---------------- */
  function renderLearn() {
    const p = mp(cur.id);
    $("learnBody").innerHTML = cur.learn + `<div class="read-mark"><button id="readBtn" ${p.learn ? "disabled" : ""}>${p.learn ? "✓ Marked as read" : "I have read and understood this"}</button></div>`;
    $("readBtn").onclick = () => { mp(cur.id).learn = true; $("readBtn").disabled = true; $("readBtn").textContent = "✓ Marked as read"; changed("learn"); };
  }

  /* ---------------- cards ---------------- */
  function renderCards() {
    const box = $("cards"); box.innerHTML = ""; const p = mp(cur.id);
    cur.cards.forEach(([front, back], i) => {
      const b = document.createElement("button"); b.className = "fc" + (p.cards.includes(i) ? " seen" : "");
      b.setAttribute("aria-label", "Flip card: " + front);
      b.innerHTML = `<div class="fc-in"><div class="fc-face fc-front">${esc(front)}</div><div class="fc-face fc-back">${esc(back)}</div></div>`;
      b.onclick = () => { b.classList.toggle("flip"); b.classList.add("seen");
        if (!p.cards.includes(i)) { p.cards.push(i); changed("cards"); } updateCardCount(); };
      box.appendChild(b);
    });
    updateCardCount();
  }
  function updateCardCount() { $("cardCount").textContent = `${mp(cur.id).cards.length} of ${cur.cards.length} cards flipped`; }

  /* ---------------- quizzes ---------------- */
  function quizBlock(q, idx, saved, onAnswer, label) {
    const div = document.createElement("div"); div.className = "q";
    div.innerHTML = `<div class="q-n">${label}</div><div class="q-t">${esc(q.q)}</div>`;
    const btns = q.options.map((o, j) => {
      const b = document.createElement("button"); b.className = "opt";
      b.innerHTML = `<span class="l">${String.fromCharCode(65 + j)}.</span>${esc(o)}`; div.appendChild(b); return b;
    });
    const why = document.createElement("div");
    const reveal = (choice) => {
      btns.forEach((b, j) => {
        b.disabled = true;
        if (j === q.answer) b.classList.add("right");
        if (j === choice && j !== q.answer) b.classList.add("wrong");
        if (q.fb) { const f = document.createElement("span"); f.className = "fb"; f.textContent = q.fb[j]; b.appendChild(f); }
      });
      why.className = "why";
      why.innerHTML = (choice === q.answer ? "<b>Correct.</b> " : `<b>Not quite — the answer is ${String.fromCharCode(65 + q.answer)}.</b> `) + (q.why ? esc(q.why) : "");
      const r = document.createElement("button"); r.className = "retry"; r.textContent = "Try this question again";
      r.onclick = () => { const fresh = quizBlock(q, idx, null, onAnswer, label); div.replaceWith(fresh); };
      why.appendChild(document.createElement("br")); why.appendChild(r);
    };
    btns.forEach((b, j) => (b.onclick = () => { reveal(j); onAnswer(j); }));
    div.appendChild(why);
    if (saved !== null && saved !== undefined) reveal(saved);
    return div;
  }
  function renderCheck() {
    const box = $("checkBody"); box.innerHTML = ""; const p = mp(cur.id);
    box.appendChild(quizBlock(cur.check, 0, p.check, (j) => { p.check = j; changed("check"); }, "Check your understanding · not graded"));
  }
  function renderPractice() {
    const box = $("practiceBody"); box.innerHTML = ""; const p = mp(cur.id);
    cur.mcq.forEach((q, i) => box.appendChild(quizBlock(q, i, p.mcq[i], (j) => { p.mcq[i] = j; changed("practice"); score(); }, `Question ${i + 1} of ${cur.mcq.length}`)));
    score();
  }
  function score() {
    const p = mp(cur.id); const ans = Object.keys(p.mcq);
    const right = ans.filter((i) => p.mcq[i] === cur.mcq[i].answer).length;
    $("practiceScore").textContent = ans.length ? `First-try score: ${right} of ${cur.mcq.length}` : "";
  }

  /* ---------------- mobile menu ---------------- */
  function closeMenu() { $("nav").classList.remove("open"); $("menuBtn").setAttribute("aria-expanded", "false"); }
  $("menuBtn").onclick = () => { const o = $("nav").classList.toggle("open"); $("menuBtn").setAttribute("aria-expanded", o); };
  document.addEventListener("click", (e) => { if ($("nav").classList.contains("open") && !$("nav").contains(e.target) && e.target !== $("menuBtn")) closeMenu(); });

  /* ---------------- start ---------------- */
  window.CS650Lab = { progress: () => P, modules: MODULES, pause };
  // hooks used by participation.js (Monroe participation standard, as in Week 7)
  window.LAB_CONTROL = { pause: () => pause(), play: () => playNow(), playing: () => !audio.paused && !audio.ended };
  window.LAB_REPORT = function () {
    const lectures = [], mcqs = [], cards = []; let heard = 0, total = 0; const LET = "ABCD";
    MODULES.forEach((m) => {
      const p = mp(m.id), sl = slidesOf(m), n = sl.filter((x) => p.watched.includes(x)).length;
      heard += n; total += sl.length;
      lectures.push({ key: m.id, title: m.label + " · " + m.title, status: n === sl.length ? "Finished — every slide heard" : n + " of " + sl.length + " slides heard" });
      if (m.kind !== "section") return;
      m.cards.forEach((c, i) => cards.push({ key: m.id + "-card-" + (i + 1), title: m.label + " " + m.title + " — " + c[0], visited: p.cards.includes(i) }));
      const qs = [m.check].concat(m.mcq), ans = [p.check].concat(m.mcq.map((_, i) => p.mcq[i]));
      qs.forEach((q, i) => { const a = ans[i]; mcqs.push({ key: m.id + (i === 0 ? "-check" : "-mcq-" + i), prompt: m.label + ": " + q.q,
        selected: a == null ? "Not answered" : LET[a] + ". " + q.options[a], correctness: a == null ? null : a === q.answer }); });
    });
    return { lectures, mcqs, cards, lecturePercent: total ? Math.round(1000 * heard / total) / 10 : 0 };
  };
  const start = MODULES.find((m) => m.id === P.last) || MODULES[0];
  overall(); openModule(start, "watch");
})();
