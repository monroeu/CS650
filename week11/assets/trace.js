/* CS650 Ch11 lab v3 — "Step by step" tracer.
   A tracer is a list of steps. Each step can draw a tree (SVG, nodes coloured by status),
   an HTML diagram, a side panel (frontier / reached / tables), an explanation, and an optional
   "predict first" question that the student answers before the explanation is revealed. */
(function () {
  "use strict";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ST = { // status -> [fill, stroke, text]
    new: ["#eef3fb", "#7a93bd", "#17284a"], fr: ["#fff4d6", "#d08a00", "#5b3b00"], cur: ["#ffe08a", "#b45309", "#3b2600"],
    done: ["#e3f4f1", "#0f766e", "#0b3f3a"], rep: ["#f1f2f4", "#9aa3af", "#6b7280"], goal: ["#d9f2e1", "#15803d", "#0b4a22"],
    dead: ["#fdecec", "#b91c1c", "#7f1d1d"], path: ["#d9f2e1", "#15803d", "#0b4a22"]
  };
  const LEG = { fr: "waiting (frontier)", cur: "being expanded now", done: "expanded", rep: "repeat: skipped", goal: "goal", dead: "dead end" };

  function svgTree(tree, s) {
    const W = tree.w || 660, H = tree.h || 420, nw = tree.nw || 128, nh = tree.nh || 54;
    const show = new Set(s.show || []), stt = s.st || {}, ann = s.ann || {}, hl = new Set(s.hl || []);
    let out = `<svg viewBox="0 0 ${W} ${H}" class="tr-svg" role="img" aria-label="Search tree, step diagram">`;
    out += `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#7a8699"/></marker>
      <marker id="ahg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#15803d"/></marker></defs>`;
    (tree.edges || []).forEach(([a, b, lab]) => {
      if (!show.has(a) || !show.has(b)) return;
      const A = tree.nodes[a], B = tree.nodes[b];
      const x1 = A[0], y1 = A[1] + nh / 2, x2 = B[0], y2 = B[1] - nh / 2 - 2;
      const on = hl.has(b);
      const dash = (stt[b] === "rep" || stt[b] === "dead") ? ' stroke-dasharray="5 4"' : "";
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? "#15803d" : "#7a8699"}" stroke-width="${on ? 3.5 : 1.6}"${dash} marker-end="url(#${on ? "ahg" : "ah"})"/>`;
      if (lab) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const tw = lab.length * 6.6 + 10;
        out += `<rect x="${mx - tw / 2}" y="${my - 10}" width="${tw}" height="18" rx="4" fill="#fff" opacity=".92"/><text x="${mx}" y="${my + 3}" class="tr-el">${esc(lab)}</text>`; }
    });
    Object.entries(tree.nodes).forEach(([id, n]) => {
      if (!show.has(id)) return;
      const [x, y, label, sub] = n; const st = stt[id] || "new"; const c = ST[st];
      const w = n[4] || nw;
      out += `<g class="tr-n"><rect x="${x - w / 2}" y="${y - nh / 2}" width="${w}" height="${nh}" rx="9" fill="${c[0]}" stroke="${c[1]}" stroke-width="${st === "cur" ? 3.5 : 2}"/>`;
      const sb = ann[id] || sub;
      out += `<text x="${x}" y="${y - (sb ? 5 : -6)}" class="tr-nl" fill="${c[2]}">${esc(label)}</text>`;
      if (ann[id]) out += `<text x="${x}" y="${y + 15}" class="tr-na">${esc(ann[id])}</text>`;
      else if (sub) out += `<text x="${x}" y="${y + 15}" class="tr-ns" fill="${c[2]}">${esc(sub)}</text>`;
      out += `</g>`;
    });
    return out + `</svg>`;
  }

  function legend(s) {
    const used = new Set(Object.values(s.st || {}));
    const items = Object.keys(LEG).filter((k) => used.has(k));
    if (!items.length) return "";
    return `<div class="tr-leg">` + items.map((k) => `<span><i style="background:${ST[k][0]};border-color:${ST[k][1]}"></i>${LEG[k]}</span>`).join("") + `</div>`;
  }

  function render(box, tracer, opts) {
    let k = 0, revealed = false;
    const N = tracer.steps.length;
    const root = document.createElement("div"); root.className = "tr";
    root.innerHTML = `<div class="tr-h"><div><div class="tr-kick">${esc(tracer.kicker || "Step-by-step trace")}</div><h3>${tracer.title}</h3></div><span class="tr-done" hidden>✓ traced</span></div>
      ${tracer.intro ? `<div class="tr-intro">${tracer.intro}</div>` : ""}
      <div class="tr-body"><div class="tr-fig"></div><div class="tr-side"></div></div>
      <div class="tr-q" hidden></div>
      <div class="tr-say" aria-live="polite"></div>
      <div class="tr-ctl"><button class="tr-b" data-a="first" aria-label="Back to the start">⏮</button><button class="tr-b" data-a="prev">◀ Back</button>
      <div class="tr-prog"><div class="tr-bar"><span></span></div><span class="tr-k"></span></div>
      <button class="tr-b tr-next" data-a="next">Next ▶</button></div>`;
    box.appendChild(root);
    const $ = (c) => root.querySelector(c);
    if (opts.done) $(".tr-done").hidden = false;
    function draw() {
      const s0 = tracer.steps[k], pending = s0.ask && !revealed && k > 0;
      const s = pending ? Object.assign({}, tracer.steps[k - 1], { ask: s0.ask, say: s0.say }) : s0;
      const fig = s.html != null ? s.html : (tracer.tree ? svgTree(tracer.tree, s) : "");
      $(".tr-fig").innerHTML = fig + (tracer.tree && s.html == null ? legend(s) : "");
      $(".tr-side").innerHTML = s.side || "";
      $(".tr-side").hidden = !s.side;
      $(".tr-body").classList.toggle("noside", !s.side);
      const q = $(".tr-q");
      if (s0.ask && !revealed) {
        q.hidden = false; q.innerHTML = `<b>Predict first:</b> ${s.ask} <button class="tr-rev">Show me</button>`;
        q.querySelector(".tr-rev").onclick = () => { revealed = true; draw(); };
        $(".tr-say").innerHTML = ""; $(".tr-say").hidden = true;
      } else {
        q.hidden = !s0.ask; if (s0.ask) q.innerHTML = `<b>Predict first:</b> ${s.ask}`;
        $(".tr-say").hidden = false; $(".tr-say").innerHTML = `<span class="tr-sn">Step ${k}${k === 0 ? " · start" : ""}</span>${s.say}`;
      }
      $(".tr-k").textContent = `Step ${k} of ${N - 1}`;
      $(".tr-bar span").style.width = (100 * k / Math.max(1, N - 1)) + "%";
      root.querySelector('[data-a="prev"]').disabled = k === 0;
      root.querySelector('[data-a="first"]').disabled = k === 0;
      const nx = root.querySelector('[data-a="next"]');
      nx.disabled = k === N - 1 && !(s0.ask && !revealed);
      nx.textContent = s0.ask && !revealed ? "Show me ▶" : (k === N - 1 ? "Done ✓" : "Next ▶");
      if (k === N - 1 && (!s0.ask || revealed)) { $(".tr-done").hidden = false; opts.onDone && opts.onDone(); }
    }
    root.querySelector(".tr-ctl").addEventListener("click", (e) => {
      const a = e.target.getAttribute("data-a"); if (!a) return;
      const s = tracer.steps[k];
      if (a === "next") { if (s.ask && !revealed) { revealed = true; } else if (k < N - 1) { k++; revealed = false; } }
      if (a === "prev" && k > 0) { k--; revealed = true; }
      if (a === "first") { k = 0; revealed = false; }
      draw(); opts.onStep && opts.onStep(k);
    });
    draw();
  }

  /* ---------- small HTML helpers the trace data uses ---------- */
  const H = {
    chip: (t, c) => `<span class="ck${c ? " " + c : ""}">${esc(t)}</span>`,
    queue: (title, items, note) => `<div class="tq"><div class="tq-h">${esc(title)}</div><div class="tq-row">${items.length ? items.map((x) => `<span class="tq-i${x.startsWith("~") ? " out" : ""}">${esc(x.replace(/^~/, ""))}</span>`).join("") : '<span class="tq-e">(empty)</span>'}</div>${note ? `<div class="tq-n">${note}</div>` : ""}</div>`,
    table: (head, rows, cls) => `<table class="tt ${cls || ""}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr${r._cls ? ` class="${r._cls}"` : ""}>${(r.cells || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`,
    esc
  };

  window.LabTrace = { render, H, svgTree };
})();
