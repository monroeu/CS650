/* Small drawing helpers for the v3 "Read" pamphlets. Everything is plain HTML/SVG so it prints. */
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const K = {};
  K.chip = (t, c) => `<span class="ck${c ? " " + c : ""}">${esc(t)}</span>`;
  K.chips = (list) => list.map((x) => Array.isArray(x) ? K.chip(x[0], x[1]) : K.chip(x)).join(" ");
  K.fig = (inner, cap) => `<figure class="pfig">${inner}${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
  K.flow = (items) => `<div class="flow">${items.map((it, i) => (i ? '<span class="fl-a">→</span>' : "") + `<div class="fl-b${it[2] ? " " + it[2] : ""}"><b>${it[0]}</b>${it[1] ? `<small>${it[1]}</small>` : ""}</div>`).join("")}</div>`;
  K.state = (title, list, cls) => `<div class="stbox ${cls || ""}"><div class="st-t">${title}</div>${K.chips(list)}</div>`;
  /* Air-cargo scene: where = {plane: "JFK"|"SFO", cargo: "JFK"|"SFO"|"in"} */
  K.scene = (where, label) => {
    const ax = { SFO: 80, JFK: 300 };
    const p = ax[where.plane], c = where.cargo === "in" ? null : ax[where.cargo];
    let s = `<svg viewBox="0 0 380 130" class="scene" role="img" aria-label="${esc(label || "air cargo picture")}">`;
    ["SFO", "JFK"].forEach((a) => { s += `<rect x="${ax[a] - 65}" y="70" width="130" height="44" rx="8" fill="#e3f4f1" stroke="#0f766e" stroke-width="2"/><text x="${ax[a]}" y="98" text-anchor="middle" font-size="16" font-weight="700" fill="#0b3f3a">${a}</text>`; });
    s += `<g transform="translate(${p - 34},16)"><rect width="68" height="34" rx="17" fill="#1d4ed8"/><text x="34" y="23" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">✈ P2</text>`;
    if (where.cargo === "in") s += `<rect x="18" y="-14" width="32" height="18" rx="3" fill="#f2b134" stroke="#b45309"/><text x="34" y="0" text-anchor="middle" font-size="11" font-weight="700" fill="#3b2600">C2</text>`;
    s += `</g>`;
    if (c != null) s += `<rect x="${c + 22}" y="44" width="40" height="24" rx="4" fill="#f2b134" stroke="#b45309"/><text x="${c + 42}" y="61" text-anchor="middle" font-size="13" font-weight="700" fill="#3b2600">C2</text>`;
    return s + `</svg>`;
  };
  K.big = (t) => `<div class="big"><div class="lbl">The big idea</div>${t}</div>`;
  K.plain = (t) => `<div class="plain"><div class="lbl">In plain English</div>${t}</div>`;
  K.analogy = (t) => `<div class="analogy"><div class="lbl">Think of it like this</div>${t}</div>`;
  K.watch = (t) => `<div class="watchout"><div class="lbl">Watch out</div>${t}</div>`;
  K.ng = (t) => `<div class="ngbox"><div class="lbl">At Northgate General</div>${t}</div>`;
  K.tryit = (q, a) => `<details class="tryq"><summary><span class="lbl">Try it in your head</span> ${q}</summary><div class="ans">${a}</div></details>`;
  K.recap = (items) => `<div class="recap"><div class="lbl">Remember</div><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
  K.top = (sec, title, mins, goals) => `<div class="pam-top"><div class="pam-k">Section ${sec} · Reading · about ${mins} minutes</div><h2>${title}</h2><div class="pam-goals"><b>After this reading you can:</b><ul>${goals.map((g) => `<li>${g}</li>`).join("")}</ul></div></div>`;
  K.f = (t) => `<span class="f">${esc(t)}</span>`;
  /* simple tree drawing for pamphlets: nodes {id:[x,y,label,sub,cls]}, edges [[a,b,label,cls]] */
  K.tree = (w, h, nodes, edges, nw, nh) => {
    nw = nw || 120; nh = nh || 44;
    let s = `<svg viewBox="0 0 ${w} ${h}" class="ptree" role="img" aria-label="tree diagram"><defs><marker id="pah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7a8699"/></marker></defs>`;
    edges.forEach(([a, b, lab, cls]) => { const A = nodes[a], B = nodes[b];
      s += `<line x1="${A[0]}" y1="${A[1] + nh / 2}" x2="${B[0]}" y2="${B[1] - nh / 2 - 2}" class="pe ${cls || ""}" marker-end="url(#pah)"/>`;
      if (lab) { const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2; const tw = lab.length * 6.4 + 10; s += `<rect x="${mx - tw / 2}" y="${my - 10}" width="${tw}" height="18" rx="4" fill="#fff"/><text x="${mx}" y="${my + 3}" class="pel">${esc(lab)}</text>`; } });
    Object.values(nodes).forEach(([x, y, lab, sub, cls, ww]) => { const W = ww || nw;
      s += `<rect x="${x - W / 2}" y="${y - nh / 2}" width="${W}" height="${nh}" rx="8" class="pn ${cls || ""}"/><text x="${x}" y="${y - (sub ? 4 : -5)}" class="pnl">${esc(lab)}</text>${sub ? `<text x="${x}" y="${y + 13}" class="pns">${esc(sub)}</text>` : ""}`; });
    return s + `</svg>`;
  };
  window.PK = K;
})();
