/* Step-by-step traces for the v3 lab. Each module id maps to a list of tracers (see trace.js). */
(function () {
  const H = window.LabTrace.H, chip = H.chip, Q = H.queue, T = H.table;
  const ok = '<span class="vk">✓</span>', no = '<span class="vx">✗</span>';

  /* ======================================================================
     11.2 — forward breadth-first search on the one-cargo problem
     ====================================================================== */
  const TREE1 = { w: 660, h: 430, nw: 150, nodes: {
      S0: [330, 40, "S0  start", "C2@JFK · P2@JFK"],
      S1: [170, 145, "S1", "C2 in P2 · P2@JFK"], S2: [500, 145, "S2", "C2@JFK · P2@SFO"],
      S3: [95, 255, "S3", "C2 in P2 · P2@SFO"], R0a: [250, 255, "S0 again", "already reached"],
      R0b: [500, 255, "S0 again", "already reached"],
      S4: [75, 365, "S4  goal", "C2@SFO · P2@SFO"], R1: [230, 365, "S1 again", "already reached"] },
    edges: [["S0", "S1", "Load"], ["S0", "S2", "Fly"], ["S1", "S3", "Fly"], ["S1", "R0a", "Unload"], ["S2", "R0b", "Fly back"],
      ["S3", "S4", "Unload"], ["S3", "R1", "Fly back"]] };

  const side = (fr, re, ex, extra) => Q("Frontier (first in, first out)", fr) + Q("Reached", re) + `<div class="tq-n"><b>States expanded:</b> ${ex}</div>` + (extra || "");

  const BFS = { id: "bfs", kicker: "Trace 1 · forward search", title: "Breadth-first search, one expansion at a time",
    intro: `<p>We search forward from the start state of the one-cargo problem: cargo <b>C2</b> and plane <b>P2</b> at JFK, goal <span class="f">At(C2, SFO)</span>.
      Short names keep the boxes small: <b>C2@JFK</b> means <span class="f">At(C2, JFK)</span> and <b>C2 in P2</b> means <span class="f">In(C2, P2)</span>.</p>
      <p>Breadth-first search keeps two lists. The <b>frontier</b> is a waiting line of states we have found but not yet expanded. <b>Reached</b> remembers every state we have ever seen, so we never expand the same state twice.</p>`,
    tree: TREE1, steps: [
    { show: ["S0"], st: { S0: "fr" }, side: side(["S0"], ["S0"], 0),
      say: `<p>The search starts with only the start state. It is in the frontier, and it is marked as reached. Nothing has been expanded yet.</p>` },
    { ask: "Which state comes out of the frontier first?", show: ["S0"], st: { S0: "cur" }, side: side(["~S0"], ["S0"], 1),
      say: `<p>S0, the only one. To <b>expand</b> it we test every action's preconditions against S0's facts:</p>
      <ul><li><span class="f">Load(C2, P2, JFK)</span> needs C2@JFK and P2@JFK. ${ok} Both are true.</li>
      <li><span class="f">Fly(P2, JFK, SFO)</span> needs P2@JFK. ${ok}</li>
      <li><span class="f">Unload(C2, P2, …)</span> needs C2 in P2. ${no} The cargo is not in the plane.</li></ul>` },
    { show: ["S0", "S1", "S2"], st: { S0: "done", S1: "fr", S2: "fr" }, side: side(["S1", "S2"], ["S0", "S1", "S2"], 1),
      say: `<p>Each applicable action produces a child state, using RESULT = (s − DEL) ∪ ADD:</p>
      <ul><li>Load: strike out C2@JFK, add C2 in P2 → <b>S1</b>.</li><li>Fly: strike out P2@JFK, add P2@SFO → <b>S2</b>.</li></ul>
      <p><b>Goal test</b> as each child is made: does it contain C2@SFO? Neither does. Both are new, so both join the <i>back</i> of the frontier and are added to Reached.</p>` },
    { ask: "S1 and S2 are waiting. Which one does breadth-first search expand next, and why?", show: ["S0", "S1", "S2", "S3", "R0a"],
      st: { S0: "done", S1: "cur", S2: "fr", S3: "fr", R0a: "rep" }, side: side(["~S1", "S2", "S3"], ["S0", "S1", "S2", "S3"], 2),
      say: `<p><b>S1</b>, because it joined the line first (first in, first out). From S1 (cargo in the plane, plane at JFK):</p>
      <ul><li><span class="f">Unload(C2, P2, JFK)</span> → cargo back on the ground at JFK. That is S0 again, which is already in Reached, so it is <b>skipped</b> (grey, dashed).</li>
      <li><span class="f">Fly(P2, JFK, SFO)</span> → plane and cargo at SFO, cargo still inside: new state <b>S3</b>. Not the goal yet; it joins the back of the line.</li></ul>` },
    { show: ["S0", "S1", "S2", "S3", "R0a", "R0b"], st: { S0: "done", S1: "done", S2: "cur", S3: "fr", R0a: "rep", R0b: "rep" },
      side: side(["~S2", "S3"], ["S0", "S1", "S2", "S3"], 3),
      say: `<p>Next in line is <b>S2</b>: the plane flew to SFO <i>empty</i>, and the cargo is still at JFK. Load is impossible (cargo and plane are at different airports). Only <span class="f">Fly(P2, SFO, JFK)</span> applies, and it leads straight back to S0. Skipped.</p>
      <p>This whole expansion was wasted work. Breadth-first search cannot tell that S2 is a bad direction. A heuristic (section 11.3) will fix that.</p>` },
    { ask: "S3 is the only state left. What happens when we expand it?", show: ["S0", "S1", "S2", "S3", "R0a", "R0b", "S4", "R1"],
      st: { S0: "done", S1: "done", S2: "done", S3: "cur", R0a: "rep", R0b: "rep", S4: "goal", R1: "rep" }, side: side(["~S3"], ["S0", "S1", "S2", "S3", "S4"], 4),
      say: `<p>From S3 (cargo in the plane, plane at SFO), <span class="f">Unload(C2, P2, SFO)</span> applies. Its child <b>S4</b> contains <b>C2@SFO</b>. The goal test succeeds the moment S4 is generated, so the search <b>stops</b>.</p>
      <p>(Flying back to JFK would give S1 again, a repeat.)</p>` },
    { show: ["S0", "S1", "S2", "S3", "R0a", "R0b", "S4", "R1"], hl: ["S1", "S3", "S4"],
      st: { S0: "path", S1: "path", S2: "done", S3: "path", R0a: "rep", R0b: "rep", S4: "goal", R1: "rep" },
      side: `<div class="tq"><div class="tq-h">Result</div><div class="tq-n">Plan: <b>Load → Fly → Unload</b><br>States expanded: 4 (S0, S1, S2, S3)<br>Every state remembers its parent and the action that made it.</div></div>`,
      say: `<p>To read off the plan, start at the goal and follow the parent arrows back to the start: S4 ← S3 ← S1 ← S0. The actions on those arrows, read from the top, are the plan: <b>Load(C2, P2, JFK), Fly(P2, JFK, SFO), Unload(C2, P2, SFO)</b>.</p>
      <p>Because breadth-first search finishes each level before going deeper, the first plan it finds is a <b>shortest</b> one.</p>` }
  ] };

  /* --- the two-cargo swap: why blind search blows up (not on the slides) --- */
  const TREE2 = { w: 700, h: 330, nw: 150, nh: 46, nodes: {
      I: [350, 34, "Start", "C1,P1@SFO · C2,P2@JFK"],
      a: [95, 150, "Load C1", "into P1 at SFO"], b: [265, 150, "Fly P1", "SFO → JFK, empty"],
      c: [435, 150, "Load C2", "into P2 at JFK"], d: [605, 150, "Fly P2", "JFK → SFO, empty"],
      a1: [40, 270, "…", "4 children", 70], a2: [125, 270, "…", "", 70], b1: [230, 270, "…", "4 children", 70], b2: [310, 270, "…", "", 70],
      c1: [400, 270, "…", "4 children", 70], c2: [480, 270, "…", "", 70], d1: [575, 270, "…", "4 children", 70], d2: [655, 270, "…", "", 70] },
    edges: [["I", "a"], ["I", "b"], ["I", "c"], ["I", "d"], ["a", "a1"], ["a", "a2"], ["b", "b1"], ["b", "b2"], ["c", "c1"], ["c", "c2"], ["d", "d1"], ["d", "d2"]] };
  const GROW = { id: "grow", kicker: "Trace 2 · a bigger tree", title: "Why blind search blows up: the two-cargo swap",
    intro: `<p>Now the textbook's version: C1 and P1 start at SFO, C2 and P2 at JFK, and the goal is to swap the cargos. This tree is <b>not on the slides</b>. Watch how quickly it widens.</p>`,
    tree: TREE2, steps: [
    { show: ["I"], st: { I: "fr" }, say: `<p>One start state. The plan we want is 6 actions long, so breadth-first search must reach depth 6.</p>` },
    { ask: "How many actions are applicable in the start state?", show: ["I", "a", "b", "c", "d"], st: { I: "done", a: "fr", b: "fr", c: "fr", d: "fr" },
      say: `<p><b>Four</b>: load C1 into P1, fly P1 away empty, load C2 into P2, fly P2 away empty. Every one becomes a child at depth 1.</p>` },
    { show: ["I", "a", "b", "c", "d", "a1", "a2", "b1", "b2", "c1", "c2", "d1", "d2"], st: { I: "done", a: "done", b: "done", c: "done", d: "done" },
      say: `<p>Each of those children again has about four applicable actions (some lead back to states we have seen). So depth 2 has around 4 × 4 = 16 nodes, depth 3 around 64, and so on.</p>
      <p>For this 6-step plan, the lab's own breadth-first search expands <b>44 states</b>. That sounds small, but the growth is exponential: the textbook's version with 10 airports and 2,000 actions per state would need about 2000⁴¹ nodes for a 41-step plan.</p>` },
    { show: ["I", "a", "b", "c", "d", "a1", "a2", "b1", "b2", "c1", "c2", "d1", "d2"], st: { I: "done", a: "path", b: "rep", c: "path", d: "rep" },
      say: `<p>Notice how many branches are pointless: flying a plane away empty (grey) can never help at the start. A human sees that instantly; blind search does not. Heuristics in section 11.3 give the search that "common sense" automatically.</p>` }
  ] };

  /* --- backward (regression) search, with the full regression tree (not on the slides) --- */
  const RT = { w: 700, h: 430, nw: 170, nh: 50, nodes: {
      g0: [350, 40, "g₀  goal", "At(C2, SFO)"],
      g1: [350, 150, "g₁", "In(C2,P2) · At(P2,SFO)", 210],
      dA: [110, 265, "via Load@JFK", "P2 at JFK and at SFO"], dB: [350, 265, "via Load@SFO", "needs C2@SFO already"],
      g2: [590, 265, "g₂", "In(C2,P2) · At(P2,JFK)", 200],
      g3: [480, 380, "g₃  ⊆ Init ✓", "C2@JFK · P2@JFK"], r1: [640, 380, "g₁ again", "repeat", 120] },
    edges: [["g0", "g1", "Unload(C2,P2,SFO)"], ["g1", "dA", "Load"], ["g1", "dB", "Load"], ["g1", "g2", "Fly(P2,JFK,SFO)"],
      ["g2", "g3", "Load(C2,P2,JFK)"], ["g2", "r1", "Fly"]] };
  const verdict = (rows) => T(["Action", "Adds a goal fact?", "Deletes a goal fact?", "Relevant?"], rows, "tt-s");
  const BWD = { id: "bwd", kicker: "Trace 3 · backward search", title: "Backward (regression) search: test every action",
    intro: `<p>Backward search starts from the <b>goal</b> and asks, again and again, “what could the <i>last</i> action have been?”. The one-cargo problem has only six ground actions, so we can test all of them at every step.</p>
      <div class="rule"><b>Relevant action:</b> adds at least one goal fact <b>and</b> deletes none. &nbsp; <b>Regression:</b> <span class="f">g′ = (g − ADD(a)) ∪ PRECOND(a)</span></div>`,
    tree: RT, steps: [
    { show: ["g0"], st: { g0: "fr" }, side: `<div class="tq"><div class="tq-h">Is g₀ true at the start?</div><div class="tq-n">Init = {C2@JFK, P2@JFK}. C2@SFO is not there. ${no} Keep searching.</div></div>`,
      say: `<p>The goal card g₀ holds one fact: <span class="f">At(C2, SFO)</span>. In backward search a node is a <b>goal card</b> (a set of facts that must be true), not a full state.</p>` },
    { ask: "Which of the six actions is relevant to g₀?", show: ["g0"], st: { g0: "cur" },
      side: verdict([["Load(C2,P2,JFK)", "no", "—", no], ["Load(C2,P2,SFO)", "no", "—", no], ["Unload(C2,P2,JFK)", "no (adds C2@JFK)", "—", no],
        { cells: ["Unload(C2,P2,SFO)", "yes: C2@SFO", "no", ok], _cls: "hit" }, ["Fly(P2,JFK,SFO)", "no", "—", no], ["Fly(P2,SFO,JFK)", "no", "—", no]]),
      say: `<p>Only <span class="f">Unload(C2, P2, SFO)</span> adds C2@SFO. The others add facts the goal doesn't care about.</p>` },
    { show: ["g0", "g1"], st: { g0: "done", g1: "fr" },
      side: `<div class="tq"><div class="tq-h">Regress through Unload(C2,P2,SFO)</div><div class="tq-n">g₀ − ADD = { } <br>+ PRECOND = { In(C2,P2), At(P2,SFO) }<br>= <b>g₁</b>. Is g₁ true at the start? ${no}</div></div>`,
      say: `<p>Remove what Unload achieves (C2@SFO) and add what it needs. The new goal card <b>g₁</b> says: <i>just before the last step, the cargo was in the plane and the plane was at SFO.</i></p>` },
    { ask: "Test all six actions against g₁. Which are relevant, and which ones destroy a goal fact?", show: ["g0", "g1", "dA", "dB", "g2"], st: { g0: "done", g1: "cur", dA: "dead", dB: "dead", g2: "fr" },
      side: verdict([["Load(C2,P2,JFK)", "yes: In(C2,P2)", "no", ok], ["Load(C2,P2,SFO)", "yes: In(C2,P2)", "no", ok],
        ["Unload(C2,P2,JFK)", "no", "yes: In(C2,P2)", no], ["Unload(C2,P2,SFO)", "no", "yes: In(C2,P2)", no],
        { cells: ["Fly(P2,JFK,SFO)", "yes: At(P2,SFO)", "no", ok], _cls: "hit" }, ["Fly(P2,SFO,JFK)", "no", "yes: At(P2,SFO)", no]]),
      say: `<p>Three actions are relevant, so g₁ gets three children:</p>
      <ul><li><b>Load at JFK</b> → {C2@JFK, P2@JFK, P2@SFO}: the plane would be in two places at once. <b>Dead end.</b></li>
      <li><b>Load at SFO</b> → {C2@SFO, P2@SFO}: needs the cargo already at SFO, which is our goal. Going in circles. <b>Dead end.</b></li>
      <li><b>Fly JFK→SFO</b> → <b>g₂</b> = {In(C2,P2), At(P2,JFK)}. Promising.</li></ul>` },
    { ask: "Which actions are relevant to g₂, and does any of them lead to a goal card that Init satisfies?", show: ["g0", "g1", "dA", "dB", "g2", "g3", "r1"],
      st: { g0: "done", g1: "done", dA: "dead", dB: "dead", g2: "cur", g3: "goal", r1: "rep" },
      side: verdict([{ cells: ["Load(C2,P2,JFK)", "yes: In(C2,P2)", "no", ok], _cls: "hit" }, ["Load(C2,P2,SFO)", "yes", "no", ok + " (dead)"],
        ["Unload(…)", "no", "yes: In(C2,P2)", no], ["Fly(P2,JFK,SFO)", "no", "yes: At(P2,JFK)", no], ["Fly(P2,SFO,JFK)", "yes: At(P2,JFK)", "no", ok + " (repeat)"]]),
      say: `<p><b>Load(C2, P2, JFK)</b> regresses to <b>g₃</b> = {C2@JFK, P2@JFK}. Every fact in g₃ is true in Init, so the search <b>stops</b>.</p>
      <p>(Flying into JFK gives back g₁, a repeat; Load at SFO puts the plane in two places again.)</p>` },
    { show: ["g0", "g1", "dA", "dB", "g2", "g3", "r1"], hl: ["g1", "g2", "g3"], st: { g0: "path", g1: "path", dA: "dead", dB: "dead", g2: "path", g3: "goal", r1: "rep" },
      side: `<div class="tq"><div class="tq-h">Result</div><div class="tq-n">Found last step first, so read the arrows <b>bottom-up</b>:<br><b>Load → Fly → Unload</b></div></div>`,
      say: `<p>Backward search discovered the plan in reverse: Unload first, then Fly, then Load. Reading the arrows from g₃ up to g₀ gives the plan in the right order.</p>
      <p>Compare with forward search: backward search never looked at “fly the empty plane” at all, because that action is not relevant to any goal card.</p>` }
  ] };

  /* --- SAT planning on a grid --- */
  const ACTS = ["Load@JFK", "Fly JFK→SFO", "Unload@SFO"], FL = ["C2 in P2", "P2@SFO", "C2@SFO"];
  function satGrid(k, a, f, note) {
    const cell = (v) => v === "T" ? '<td class="sT">true</td>' : v === "F" ? '<td class="sF">false</td>' : v === "x" ? '<td class="sX">✗ clash</td>' : '<td class="sU">?</td>';
    let h = `<div class="satw"><table class="sat"><thead><tr><th>Action at time</th>${Array.from({ length: k }, (_, t) => `<th>t = ${t}</th>`).join("")}</tr></thead><tbody>`;
    ACTS.forEach((n, r) => { h += `<tr><th>${n}</th>${Array.from({ length: k }, (_, t) => cell(a[r + "" + t])).join("")}</tr>`; });
    h += `</tbody></table><table class="sat"><thead><tr><th>Fact at time</th>${Array.from({ length: k + 1 }, (_, t) => `<th>t = ${t}</th>`).join("")}</tr></thead><tbody>`;
    FL.forEach((n, r) => { h += `<tr><th>${n}</th>${Array.from({ length: k + 1 }, (_, t) => cell(f[r + "" + t])).join("")}</tr>`; });
    return h + `</tbody></table>${note ? `<div class="sat-n">${note}</div>` : ""}</div>`;
  }
  const f0 = { "00": "F", "10": "F", "20": "F" };
  const SAT = { id: "sat", kicker: "Trace 4 · planning as SAT", title: "SAT planning: fill in the grid, cell by cell",
    intro: `<p>A SAT planner turns “is there a plan with <b>k</b> steps?” into one big logic sentence. Every cell below is a true/false variable. The solver's job is to fill in every cell so that every rule holds. We'll do its reasoning by hand. To keep the grid small we keep only the three actions that can help.</p>
      <div class="rule">Rules used: <b>Init</b> fixes time 0 · an action needs its <b>preconditions</b> at its own time and makes its <b>effects</b> true at the next time · a fact changes only if an action changes it (<b>frame axioms</b>) · two clashing actions can't happen at the same time (<b>exclusion</b>) · the <b>goal</b> must be true at time k.</div>`,
    steps: [
    { html: satGrid(2, {}, Object.assign({}, f0, { "22": "T" }), "k = 2. Known: the start facts at t = 0 (cargo not in the plane, plane not at SFO) and the goal C2@SFO at t = 2."),
      say: `<p>Try <b>k = 2</b> first. Init fills the t = 0 column; the goal fills the last C2@SFO cell. Everything else is unknown.</p>` },
    { ask: "Can Unload happen at t = 0?", html: satGrid(2, { "20": "F" }, Object.assign({}, f0, { "22": "T" })),
      say: `<p>No. Unload needs <i>C2 in P2</i> at t = 0, and that is false. So <b>Unload⁰ = false</b>.</p>` },
    { html: satGrid(2, { "20": "F" }, Object.assign({}, f0, { "21": "F", "22": "T" })),
      say: `<p>Only Unload makes C2@SFO true. No Unload at t = 0 means <b>C2@SFO¹ = false</b>. So the goal at t = 2 needs <b>Unload¹</b>.</p>` },
    { ask: "Unload¹ needs the cargo in the plane AND the plane at SFO at t = 1. What would make both true?", html: satGrid(2, { "20": "F", "00": "?", "10": "?" }, Object.assign({}, f0, { "21": "F", "22": "T" }), "Unload¹ needs: C2 in P2 at t=1 (from Load⁰) and P2@SFO at t=1 (from Fly⁰)."),
      say: `<p>C2 in P2 at t = 1 needs <b>Load⁰</b>. P2@SFO at t = 1 needs <b>Fly⁰</b>. So we would need Load and Fly both at time 0.</p>` },
    { html: satGrid(2, { "20": "F", "00": "x", "10": "x", "21": "F" }, Object.assign({}, f0, { "21": "F", "22": "T" }), "Load⁰ ∧ Fly⁰ is forbidden, so Unload¹ is false, and the goal cell can't be true. <b>UNSATISFIABLE.</b>"),
      say: `<p>But Load and Fly <b>clash</b>: Fly deletes P2@JFK, which Load needs. The exclusion rule says <span class="f">¬(Load⁰ ∧ Fly⁰)</span>. So Unload¹ is impossible too, and nothing can make the goal true. The solver answers <b>unsatisfiable</b>: no 2-step plan exists. Try k = 3.</p>` },
    { html: satGrid(3, { "20": "F", "21": "F" }, { "00": "F", "10": "F", "20": "F", "21": "F", "22": "F", "23": "T" }, "k = 3. The same reasoning still rules out Unload⁰ and Unload¹."),
      say: `<p>With <b>k = 3</b>, the same steps still make Unload⁰ and Unload¹ false, and C2@SFO false at t = 1 and t = 2.</p>` },
    { ask: "The goal is C2@SFO at t = 3. Which Unload must be true?", html: satGrid(3, { "20": "F", "21": "F", "22": "T" }, { "00": "F", "10": "F", "20": "F", "21": "F", "22": "F", "23": "T", "02": "T", "12": "T" }, "Unload² = true, so its preconditions must hold at t = 2."),
      say: `<p><b>Unload²</b>, the only one left. It needs <b>C2 in P2</b> and <b>P2@SFO</b> at t = 2, so those cells become true.</p>` },
    { ask: "Load must happen while the plane is still at JFK, and not at the same time as Fly. What order is forced?", html: satGrid(3, { "00": "T", "01": "F", "02": "F", "10": "F", "11": "T", "12": "F", "20": "F", "21": "F", "22": "T" },
        { "00": "F", "01": "T", "02": "T", "03": "F", "10": "F", "11": "F", "12": "T", "13": "T", "20": "F", "21": "F", "22": "F", "23": "T" }, "A model: every rule holds. The true action cells are the plan."),
      say: `<p><b>Load⁰, then Fly¹.</b> Flying first would take the plane away from the cargo, and they can't share a time step. Every other action cell is false. The true cells, read left to right, are the plan: <b>Load, Fly, Unload</b>.</p>` }
  ] };

  /* --- Graphplan levels --- */
  const col = (title, items, cls) => `<div class="gp-col ${cls || ""}"><div class="gp-h">${title}</div>${items.map((i) => `<div class="gp-i ${i[1] || ""}">${H.esc(i[0])}</div>`).join("")}</div>`;
  const gp = (cols, mutex, note) => `<div class="gp">${cols.join('<div class="gp-arr">→</div>')}</div>${mutex ? `<div class="gp-mx"><b>Mutex pairs (can't both be true / both happen):</b> ${mutex}</div>` : ""}${note ? `<div class="sat-n">${note}</div>` : ""}`;
  const S0c = col("S0", [["C2@JFK"], ["P2@JFK"]]);
  const A0c = col("A0", [["Load", "act"], ["Fly", "act"], ["keep C2@JFK", "noop"], ["keep P2@JFK", "noop"]]);
  const S1c = col("S1", [["C2@JFK"], ["P2@JFK"], ["C2 in P2", "new"], ["P2@SFO", "new"]]);
  const GP = { id: "gp", kicker: "Trace 5 · Graphplan", title: "Graphplan: grow the levels, then extract the plan",
    intro: `<p>A <b>planning graph</b> lists, level by level, every fact that <i>might</i> be true and every action that <i>might</i> run. It also records <b>mutex</b> pairs: two things that cannot both happen at that level. Graphplan grows levels until every goal fact appears with no mutex between them, then searches backward for a plan.</p>`,
    steps: [
    { html: gp([S0c]), say: `<p>Level <b>S0</b> is just the start state: C2@JFK and P2@JFK.</p>` },
    { ask: "Which actions go in A0, and which two of them clash?", html: gp([S0c, A0c], "Load ✕ Fly"),
      say: `<p>A0 holds every action whose preconditions are in S0: <b>Load</b> and <b>Fly</b>. It also holds a <b>keep</b> action (a “no-op”) for each fact, meaning: do nothing and the fact stays true.</p>
      <p><b>Load and Fly are mutex</b>: Fly deletes P2@JFK, which Load needs. They can't happen at the same step.</p>` },
    { html: gp([S0c, A0c, S1c], "C2@JFK ✕ C2 in P2 · P2@JFK ✕ P2@SFO · <b>C2 in P2 ✕ P2@SFO</b>"),
      say: `<p>S1 holds every fact some A0 action produces: the old facts (via keep) plus <b>C2 in P2</b> and <b>P2@SFO</b>. Nothing is removed from a level.</p>
      <p>Fact mutexes: the cargo can't be at JFK and in the plane; the plane can't be in two places; and <b>C2 in P2 and P2@SFO</b> can only come from Load and Fly, which are mutex. So after one step they can't both be true.</p>` },
    { ask: "Unload@SFO needs C2 in P2 and P2@SFO. Can it go into A1?", html: gp([S1c, col("A1", [["Unload@SFO ✗", "bad"], ["Fly", "act"], ["keep C2 in P2", "noop"], ["…", "noop"]]), col("S2", [["C2 in P2"], ["P2@SFO"], ["…"]])],
        "In S2, C2 in P2 and P2@SFO are <b>not</b> mutex any more: keep(C2 in P2) and Fly don't clash."),
      say: `<p><b>No.</b> Its two preconditions are mutex in S1, so Unload is not allowed into A1. That is why the goal does not appear at S2.</p>
      <p>In A1, though, “keep C2 in P2” and Fly do not clash: the cargo can stay in the plane while it flies. So in S2 both facts can finally be true together.</p>` },
    { html: gp([col("S2", [["C2 in P2"], ["P2@SFO"]]), col("A2", [["Unload@SFO ✓", "act"]]), col("S3", [["C2@SFO", "goal"]])], null, "The goal first appears, with no mutex, at level 3: the length of the real plan."),
      say: `<p>Now <b>Unload@SFO</b> enters A2, and <b>C2@SFO</b> appears in S3. Graphplan stops growing and tries to extract a plan.</p>` },
    { html: T(["Level", "Needed facts", "Chosen actions (no two mutex)"], [["S3", "C2@SFO", "A2: Unload(C2,P2,SFO)"], ["S2", "C2 in P2, P2@SFO", "A1: keep C2 in P2, Fly(P2,JFK,SFO)"], ["S1", "C2 in P2, P2@JFK", "A0: Load(C2,P2,JFK), keep P2@JFK"], ["S0", "C2@JFK, P2@JFK", "true at the start ✓"]], "tt-s"),
      say: `<p>Extraction works backward, level by level: choose non-mutex actions that supply the needed facts, then their preconditions become the needs one level down. Ignore the keep actions and read top to bottom: <b>Load, Fly, Unload</b>.</p>` }
  ] };

  /* ======================================================================
     11.3 — heuristics
     ====================================================================== */
  const HSTATES = ["S0", "S1", "S2", "S3", "R0a", "R0b", "S4", "R1"];
  const GC = { id: "gc", kicker: "Trace 1 · goal count", title: "Goal count, scored on every state of the tree",
    intro: `<p>A heuristic <span class="f">h(s)</span> guesses how many actions are left from state s. <b>h*</b> is the true number. The simplest guess: <b>count the goal facts that are still false</b>. Our goal has one fact, C2@SFO.</p>`,
    tree: TREE1, steps: [
    { show: HSTATES, st: { R0a: "rep", R0b: "rep", R1: "rep" }, say: `<p>Here is the same search tree as in 11.2. We'll write h and the true distance h* under each state.</p>` },
    { show: HSTATES, st: { R0a: "rep", R0b: "rep", R1: "rep" }, ann: { S0: "h 1 · h* 3", S1: "h 1 · h* 2", S2: "h 1 · h* 4", S3: "h 1 · h* 1" },
      say: `<p>In S0, S1, S2 and S3 the cargo is not at SFO yet. One false goal fact each, so <b>h = 1</b> everywhere. The true distances differ a lot: 3, 2, 4 and 1.</p>` },
    { show: HSTATES, st: { R0a: "rep", R0b: "rep", R1: "rep", S4: "goal" }, ann: { S0: "h 1 · h* 3", S1: "h 1 · h* 2", S2: "h 1 · h* 4", S3: "h 1 · h* 1", S4: "h 0 · h* 0" },
      say: `<p>In S4 the goal fact is true: h = 0.</p>` },
    { ask: "Is goal count admissible (never too big)? And can it tell S1 apart from S2?", show: HSTATES, st: { R0a: "rep", R0b: "rep", R1: "rep", S4: "goal", S1: "cur", S2: "cur" },
      ann: { S0: "h 1 · h* 3", S1: "h 1 · h* 2", S2: "h 1 · h* 4", S3: "h 1 · h* 1", S4: "h 0 · h* 0" },
      say: `<p><b>Admissible: yes</b>, h ≤ h* in every state. <b>Useful: barely.</b> S1 (two steps away) and S2 (four steps away) both score 1, so a search guided by goal count can't tell the good branch from the bad one.</p>` }
  ] };

  const IP = { id: "ip", kicker: "Trace 2 · ignore preconditions", title: "Ignore preconditions on the two-cargo swap",
    intro: `<p>Relax the problem by pretending <b>every action can run at any time</b>. Then the estimate is the fewest actions whose add lists cover every missing goal fact (a <b>set cover</b>).</p>`,
    steps: [
    { html: `<div class="cover"><div class="cv-h">Goal</div>${chip("At(C1, JFK)")} ${chip("At(C2, SFO)")}<div class="cv-h">Start</div>${chip("At(C1, SFO)")} ${chip("At(P1, SFO)")} ${chip("At(C2, JFK)")} ${chip("At(P2, JFK)")}</div>`,
      say: `<p><b>Step 1: list the goal facts that are false.</b> At the start, C1 is at SFO (not JFK) and C2 is at JFK (not SFO). Both goal facts are missing.</p>` },
    { ask: "Which actions add At(C1, JFK)? Which add At(C2, SFO)?", html: T(["Missing goal fact", "Actions that add it", "Covers how many?"], [["At(C1, JFK)", "Unload(C1, P1, JFK), Unload(C1, P2, JFK)", "1"], ["At(C2, SFO)", "Unload(C2, P1, SFO), Unload(C2, P2, SFO)", "1"]], "tt-s"),
      say: `<p><b>Step 2:</b> only Unload actions put cargo at an airport. Each one adds exactly one of our goal facts. With preconditions ignored, they could all run right now: no loading, no flying.</p>` },
    { html: `<div class="cover">${chip("At(C1, JFK)", "add")} ← Unload(C1, P1, JFK)<br>${chip("At(C2, SFO)", "add")} ← Unload(C2, P2, SFO)<div class="sat-n">No single action covers both facts, so the fewest is <b>2</b>.</div></div>`,
      say: `<p><b>Step 3: pick the fewest actions that cover everything.</b> No single action adds both facts, so we need two: <b>h = 2</b>.</p>` },
    { html: `<div class="bars">${[["ignore preconditions", 2, "amber"], ["true cost h*", 6, "green"]].map(([l, v, c]) => `<div class="bar-r"><span>${l}</span><div class="bar ${c}" style="width:${v * 14}%">${v}</div></div>`).join("")}</div>`,
      say: `<p>The real plan needs 6 actions (load, fly and unload for each cargo). The estimate 2 never overestimates, but it is far too low, because it forgets that cargo must be loaded and flown first.</p>` }
  ] };

  const lay = (cols) => `<div class="gp">${cols.map(([t, items]) => `<div class="gp-col"><div class="gp-h">${t}</div>${items.map((i) => `<div class="gp-i ${i[1] || ""}">${H.esc(i[0])}</div>`).join("")}</div>`).join('<div class="gp-arr">→</div>')}</div>`;
  const FF = { id: "ff", kicker: "Trace 3 · ignore delete lists (h_FF)", title: "Ignore deletes: grow relaxed layers, then count a relaxed plan",
    intro: `<p>Now keep the preconditions but <b>throw away every delete list</b>: facts only pile up, nothing is ever lost. Two steps: (1) grow layers until the goal appears; (2) work back from the goal, counting the actions actually needed. That count is <b>h_FF</b>, the heuristic of the famous FF planner.</p>`,
    steps: [
    { html: lay([["layer 0", [["C2@JFK"], ["P2@JFK"]]]]), say: `<p>Score the start state <b>S0</b>. Layer 0 is its facts.</p>` },
    { ask: "Which actions apply to layer 0, and what do they add?", html: lay([["layer 0", [["C2@JFK"], ["P2@JFK"]]], ["layer 1", [["C2@JFK"], ["P2@JFK"], ["C2 in P2", "new"], ["P2@SFO", "new"]]]]),
      say: `<p><b>Load</b> adds C2 in P2 and <b>Fly</b> adds P2@SFO. Nothing is deleted, so the old facts stay. (Yes: the plane is now at JFK <i>and</i> SFO. In the relaxed world that's allowed.)</p>` },
    { html: lay([["layer 0", [["C2@JFK"], ["P2@JFK"]]], ["layer 1", [["C2@JFK"], ["P2@JFK"], ["C2 in P2"], ["P2@SFO"]]], ["layer 2", [["…all of layer 1"], ["C2@SFO", "goal"]]]]),
      say: `<p>Now <b>Unload@SFO</b> applies (cargo in the plane, plane at SFO) and adds <b>C2@SFO</b>. The goal has appeared, so we stop growing.</p>` },
    { ask: "Working back from C2@SFO, which actions does the relaxed plan need?", html: T(["Needed fact", "First made by", "That action needs"], [["C2@SFO", "Unload (layer 1→2)", "C2 in P2, P2@SFO"], ["C2 in P2", "Load (layer 0→1)", "C2@JFK, P2@JFK: in layer 0 ✓"], ["P2@SFO", "Fly (layer 0→1)", "P2@JFK: in layer 0 ✓"]], "tt-s"),
      say: `<p>Unload makes the goal; it needs C2 in P2 (from Load) and P2@SFO (from Fly); those need only layer-0 facts. Relaxed plan = {Load, Fly, Unload}, so <b>h_FF(S0) = 3</b>. Here that equals the true cost.</p>` },
    { html: lay([["layer 0", [["C2@JFK"], ["P2@SFO"]]], ["layer 1", [["C2@JFK"], ["P2@SFO"], ["P2@JFK", "new"]]], ["layer 2", [["…"], ["C2 in P2", "new"]]], ["layer 3", [["…"], ["C2@SFO", "goal"]]]]),
      say: `<p><b>New example (not on the slides): score S2</b>, where the plane flew to SFO empty. Layer 1: fly back adds P2@JFK. Layer 2: Load adds C2 in P2. Layer 3: Unload adds C2@SFO, and it can use P2@SFO, which was never deleted.</p>` },
    { ask: "So what is h_FF(S2), and what is the true distance from S2?", html: `<div class="bars">${[["h_FF(S2)", 3, "teal"], ["true h*(S2)", 4, "green"]].map(([l, v, c]) => `<div class="bar-r"><span>${l}</span><div class="bar ${c}" style="width:${v * 18}%">${v}</div></div>`).join("")}</div>`,
      say: `<p>The relaxed plan is Fly back, Load, Unload: <b>h_FF(S2) = 3</b>. The real plan needs a second flight to SFO, so <b>h* = 4</b>. The relaxation “forgot” that the plane left SFO. Across all states h_FF gives S0 3, S1 2, S2 3, S3 1, S4 0, so unlike goal count it ranks S3 best, then S1, then S2.</p>` }
  ] };

  const cost = (rows) => T(["Fact", "How it is made", "cost with MAX", "cost with SUM"], rows, "tt-s");
  const HM = { id: "hm", kicker: "Trace 4 · h_max and h_add", title: "h_max and h_add: give every fact a cost",
    intro: `<div class="rule">Facts true now cost <b>0</b>. A fact made by an action costs <span class="f">1 + combine(costs of that action's preconditions)</span>. h_max combines with <b>max</b>; h_add with <b>sum</b>. The heuristic is then the max (or sum) over the goal facts.</div>`,
    steps: [
    { html: cost([["C2@JFK", "true in S0", "0", "0"], ["P2@JFK", "true in S0", "0", "0"]]), say: `<p>Start with the facts of S0: each costs 0.</p>` },
    { html: cost([["C2@JFK", "true in S0", "0", "0"], ["P2@JFK", "true in S0", "0", "0"], ["C2 in P2", "Load: 1 + combine(0, 0)", "1", "1"], ["P2@SFO", "Fly: 1 + combine(0)", "1", "1"]]),
      say: `<p>C2 in P2 is made by Load, whose preconditions cost 0 and 0: cost 1 either way. P2@SFO is made by Fly: cost 1.</p>` },
    { ask: "C2@SFO is made by Unload, whose preconditions cost 1 and 1. What is its cost with MAX? With SUM?", html: cost([["C2@JFK", "true in S0", "0", "0"], ["P2@JFK", "true in S0", "0", "0"], ["C2 in P2", "Load", "1", "1"], ["P2@SFO", "Fly", "1", "1"], [`<b>C2@SFO</b>`, "Unload: 1 + combine(1, 1)", "<b>2</b>", "<b>3</b>"]]),
      say: `<p>MAX: 1 + max(1, 1) = <b>2</b>. SUM: 1 + (1 + 1) = <b>3</b>. So from S0, <b>h_max = 2</b> and <b>h_add = 3</b>; the true cost is 3. h_max is safely low; h_add happens to be exact.</p>` },
    { html: cost([["C1@JFK, C2@JFK, P@JFK", "true at the start", "0", "0"], ["C1 in P, C2 in P", "Load each", "1", "1"], ["P@SFO", "Fly", "1", "1"], ["C1@SFO", "Unload: 1 + (1, 1)", "2", "3"], ["C2@SFO", "Unload: 1 + (1, 1)", "2", "3"]]),
      say: `<p><b>New example:</b> two cargos C1 and C2, one plane P, all at JFK; goal: both cargos at SFO. Each goal fact on its own costs 2 (max) or 3 (sum).</p>` },
    { ask: "The real plan is Load C1, Load C2, Fly, Unload C1, Unload C2 (5 actions). Combine the two goal facts: what are h_max and h_add?", html: `<div class="bars">${[["h_max = max(2, 2)", 2, "teal"], ["h_add = 3 + 3", 6, "red"], ["true h*", 5, "green"]].map(([l, v, c]) => `<div class="bar-r"><span>${l}</span><div class="bar ${c}" style="width:${v * 13}%">${v}</div></div>`).join("")}</div>`,
      say: `<p><b>h_max = 2</b> (safe but weak). <b>h_add = 6</b>, which is <b>more</b> than the true 5: both cargos ride the same flight, and h_add counts that one Fly twice. So h_add is not admissible, but it often guides search well.</p>` }
  ] };

  const ASTAR = { id: "astar", kicker: "Trace 5 · A* search", title: "A* with h_FF: always expand the lowest f = g + h",
    intro: `<p><span class="f">g</span> = actions taken so far, <span class="f">h</span> = estimated actions left (h_FF from Trace 3), <span class="f">f = g + h</span>. The frontier is a <b>priority queue</b>: the lowest f is expanded first. The goal test happens when a state is <b>taken out</b> of the queue.</p>`,
    tree: TREE1, steps: [
    { show: ["S0"], st: { S0: "fr" }, ann: { S0: "g0 + h3 = f3" }, side: Q("Frontier, sorted by f", ["S0 (3)"]), say: `<p>Start: S0 has g = 0 and h_FF = 3, so f = 3.</p>` },
    { show: ["S0", "S1", "S2"], st: { S0: "done", S1: "fr", S2: "fr" }, ann: { S0: "f3", S1: "g1 + h2 = f3", S2: "g1 + h3 = f4" }, side: Q("Frontier, sorted by f", ["S1 (3)", "S2 (4)"]),
      say: `<p>Expand S0. Load gives S1: g 1, h 2, <b>f 3</b>. Fly gives S2: g 1, h 3, <b>f 4</b>. Sorted, S1 is ahead of S2.</p>` },
    { ask: "Breadth-first search expanded S1 and then S2. What does A* expand after S1?", show: ["S0", "S1", "S2", "S3", "R0a"], st: { S0: "done", S1: "done", S2: "fr", S3: "fr", R0a: "rep" },
      ann: { S0: "f3", S1: "f3", S2: "f4", S3: "g2 + h1 = f3" }, side: Q("Frontier, sorted by f", ["S3 (3)", "S2 (4)"]),
      say: `<p>Expanding S1 gives S3: g 2, h 1, <b>f 3</b> (Unload back to S0 is a repeat). S3 at 3 jumps <b>ahead</b> of S2 at 4, so A* expands <b>S3</b> next, not S2.</p>` },
    { show: ["S0", "S1", "S2", "S3", "R0a", "S4", "R1"], st: { S0: "done", S1: "done", S2: "fr", S3: "done", R0a: "rep", S4: "fr", R1: "rep" },
      ann: { S0: "f3", S1: "f3", S2: "f4", S3: "f3", S4: "g3 + h0 = f3" }, side: Q("Frontier, sorted by f", ["S4 (3)", "S2 (4)"]),
      say: `<p>Expanding S3 gives S4: g 3, h 0, f 3. It goes to the front of the queue.</p>` },
    { show: ["S0", "S1", "S2", "S3", "R0a", "S4", "R1"], hl: ["S1", "S3", "S4"], st: { S0: "path", S1: "path", S2: "fr", S3: "path", R0a: "rep", S4: "goal", R1: "rep" },
      ann: { S0: "f3", S1: "f3", S2: "f4 never expanded", S3: "f3", S4: "f3 goal" },
      side: `<div class="tq"><div class="tq-h">Result</div><div class="tq-n">Plan: <b>Load → Fly → Unload</b><br>A* expanded <b>3</b> states (S0, S1, S3).<br>Breadth-first expanded <b>4</b>.</div></div>`,
      say: `<p>S4 comes out of the queue and passes the goal test. Done. <b>S2 was never expanded</b>: its f of 4 was always worse. That is the whole point of a heuristic: same plan, less work. On big problems the saving is enormous.</p>` }
  ] };

  const ASTARGC = { id: "astargc", kicker: "Trace 6 · a weaker heuristic", title: "Compare: A* with goal count instead of h_FF",
    intro: `<p>Same algorithm, weaker heuristic. This comparison is <b>not on the slides</b>. Goal count gives h = 1 to every non-goal state. Ties in f are broken first-come-first-served.</p>`,
    tree: TREE1, steps: [
    { show: ["S0", "S1", "S2"], st: { S0: "done", S1: "fr", S2: "fr" }, ann: { S0: "g0 + h1 = f1", S1: "g1 + h1 = f2", S2: "g1 + h1 = f2" }, side: Q("Frontier, sorted by f", ["S1 (2)", "S2 (2)"]),
      say: `<p>After expanding S0, S1 and S2 <b>tie</b> at f = 2. The heuristic gives no reason to prefer S1.</p>` },
    { show: ["S0", "S1", "S2", "S3", "R0a"], st: { S0: "done", S1: "done", S2: "fr", S3: "fr", R0a: "rep" }, ann: { S0: "f1", S1: "f2", S2: "f2", S3: "g2 + h1 = f3" }, side: Q("Frontier, sorted by f", ["S2 (2)", "S3 (3)"]),
      say: `<p>S1 is expanded (it came first). Its child S3 has f = 3, which is now <b>worse</b> than S2's f = 2.</p>` },
    { ask: "Which state is expanded next?", show: ["S0", "S1", "S2", "S3", "R0a", "R0b"], st: { S0: "done", S1: "done", S2: "cur", S3: "fr", R0a: "rep", R0b: "rep" }, ann: { S0: "f1", S1: "f2", S2: "f2 wasted", S3: "f3" }, side: Q("Frontier, sorted by f", ["S3 (3)"]),
      say: `<p><b>S2</b>, the empty-plane dead end, because its f is lowest. Exactly the wasted expansion that breadth-first search made.</p>` },
    { show: ["S0", "S1", "S2", "S3", "R0a", "R0b", "S4", "R1"], hl: ["S1", "S3", "S4"], st: { S0: "path", S1: "path", S2: "done", S3: "path", R0a: "rep", R0b: "rep", S4: "goal", R1: "rep" },
      ann: { S0: "f1", S1: "f2", S2: "f2", S3: "f3", S4: "f3 goal" },
      side: `<div class="tq"><div class="tq-h">Compare</div><div class="tq-n">Goal count: <b>4</b> expansions<br>h_FF: <b>3</b> expansions<br>Same plan. The better-informed heuristic does less work.</div></div>`,
      say: `<p>Then S3, then S4 (goal). A* with goal count expanded 4 states, the same as blind breadth-first search. <b>Both heuristics are admissible and both find the shortest plan; the more informed one wastes less effort.</b></p>` }
  ] };

  /* ======================================================================
     11.4 — hierarchical search as a tree of plans (not on the slides)
     ====================================================================== */
  const HT = { w: 680, h: 400, nw: 200, nh: 52, nodes: {
      p0: [340, 40, "[ Go(Home, SFO) ]", "1 high-level step"],
      p1: [160, 160, "[ Drive, Shuttle ]", "refinement 1", 210], p2: [520, 160, "[ Taxi ]", "refinement 2: needs Cash ≥ 80", 230],
      c1: [160, 280, "all primitive", "simulate it from Init", 200], ok: [160, 370, "reaches At(SFO) ✓", "return this plan", 200] },
    edges: [["p0", "p1", "refine"], ["p0", "p2", "refine"], ["p1", "c1", "check"], ["c1", "ok", ""]] };
  const HIER = { id: "hier", kicker: "Trace 1 · hierarchical search", title: "Hierarchical search: a tree of plans, not of states",
    intro: `<p>In hierarchical search every node is a whole <b>plan</b>. Expanding a node means picking one high-level action (HLA) in it and replacing it with one of its refinements. Here Cash = 50 and a car is available.</p>`,
    tree: HT, steps: [
    { show: ["p0"], st: { p0: "fr" }, say: `<p>The search starts with a one-step plan: the HLA <span class="f">Go(Home, SFO)</span>.</p>` },
    { ask: "Go(Home, SFO) has two refinements. Can both be used here?", show: ["p0", "p1", "p2"], st: { p0: "done", p1: "fr", p2: "dead" },
      say: `<p>Refinement 1 replaces it with <b>Drive(Home, Parking), Shuttle(Parking, SFO)</b>. Refinement 2 is <b>Taxi(Home, SFO)</b>, but its precondition Cash ≥ 80 is false (we have 50), so that branch is pruned.</p>` },
    { show: ["p0", "p1", "p2", "c1"], st: { p0: "done", p1: "done", p2: "dead", c1: "cur" },
      say: `<p>Drive and Shuttle are both <b>primitive</b> (the agent can do them directly), so this plan is an <b>implementation</b>. Check it by simulating from Init: Drive needs a car ✓, then Shuttle needs us at the parking lot ✓.</p>` },
    { show: ["p0", "p1", "p2", "c1", "ok"], hl: ["p1", "c1", "ok"], st: { p0: "path", p1: "path", p2: "dead", c1: "path", ok: "goal" },
      say: `<p>The simulation ends with At(SFO): the goal. The search returns <b>[Drive, Shuttle]</b> after looking at just three plans, instead of searching through every turn of the steering wheel.</p>` }
  ] };

  /* ======================================================================
     11.5 — sensorless vacuum: belief states merge (not on the slides)
     ====================================================================== */
  const BT = { w: 680, h: 500, nw: 230, nh: 56, nodes: {
      b0: [340, 40, "b₀: 2 possible worlds", "robot in L or R · both dirty", 260],
      b1: [340, 145, "after Right: 1 world", "robot in R · both dirty", 240],
      b2: [340, 255, "after Suck", "robot in R · R clean", 240],
      b3: [340, 360, "after Left", "robot in L · R clean", 240],
      b4: [340, 462, "after Suck: goal ✓", "robot in L · both clean", 240] },
    edges: [["b0", "b1", "Right"], ["b1", "b2", "Suck"], ["b2", "b3", "Left"], ["b3", "b4", "Suck"]] };
  const BEL = { id: "belief", kicker: "Trace 1 · belief states", title: "A sensorless plan: shrink the belief state, then act",
    intro: `<p>The robot doesn't know which square it is in. Its <b>belief state</b> is the set of worlds it might be in. A sensorless plan must work in <b>every</b> world. The trick is to choose actions that make the worlds <b>merge</b> (coercion).</p>`,
    tree: BT, steps: [
    { show: ["b0"], st: { b0: "fr" }, say: `<p>Start: two possible worlds. Robot in L with both squares dirty, or robot in R with both dirty.</p>` },
    { ask: "Which action makes both worlds identical?", show: ["b0", "b1"], st: { b0: "done", b1: "fr" },
      say: `<p><b>Right.</b> If the robot was in L it moves to R; if it was already in R, it bumps the wall and stays. Either way it is now in R. Two worlds become <b>one</b>: the robot now knows where it is without ever looking.</p>` },
    { show: ["b0", "b1", "b2"], st: { b0: "done", b1: "done", b2: "fr" }, say: `<p><b>Suck</b> cleans the square the robot is on: R is now clean.</p>` },
    { show: ["b0", "b1", "b2", "b3", "b4"], hl: ["b1", "b2", "b3", "b4"], st: { b0: "path", b1: "path", b2: "path", b3: "path", b4: "goal" },
      say: `<p><b>Left</b>, then <b>Suck</b>: both squares clean. The plan <b>[Right, Suck, Left, Suck]</b> works from either starting world, with no sensors at all.</p>` }
  ] };

  /* ======================================================================
     11.6 — critical path, slack and the one-hoist schedule
     ====================================================================== */
  const JOBS = [["Engine 1", 30], ["Wheels 1", 30], ["Inspect 1", 10], ["Engine 2", 60], ["Wheels 2", 15], ["Inspect 2", 10]];
  const gantt = (rows, end, note) => {
    const sc = 100 / end;
    return `<div class="gantt">${rows.map(([l, s, f, c]) => `<div class="g-r"><span class="g-l">${l}</span><div class="g-t">${s == null ? "" : `<div class="g-b ${c || ""}" style="left:${s * sc}%;width:${(f - s) * sc}%">${s}–${f}</div>`}</div></div>`).join("")}
      <div class="g-r"><span class="g-l"></span><div class="g-ax"><span style="left:0">0</span><span style="left:100%">${end}</span></div></div></div>${note ? `<div class="sat-n">${note}</div>` : ""}`;
  };
  const cpm = (cols) => T(["Step", "Duration", "Must follow", "ES", "LS", "Slack"], JOBS.map(([n, d], i) => [n, d, i % 3 ? JOBS[i - 1][0] : "—"].concat(cols[i] || ["", "", ""])), "tt-s");
  const ES = [[0], [30], [60], [0], [60], [75]], LS = [15, 45, 75, 0, 60, 75];
  const CPM = { id: "cpm", kicker: "Trace 1 · scheduling", title: "Critical path: forward pass, backward pass, then the shared hoist",
    intro: `<p>Two cars. Each must have its engine, then its wheels, then an inspection. <b>ES</b> = earliest start, <b>LS</b> = latest start that doesn't delay the finish, <b>slack</b> = LS − ES.</p>`,
    steps: [
    { html: cpm([]), say: `<p>Here are the six steps and their order. First ignore resources: imagine plenty of hoists and wheel stations.</p>` },
    { ask: "Engine 1 starts at 0 and takes 30. When can Wheels 1 start? And Inspect 1?", html: cpm([["0", "", ""], ["30", "", ""], ["60", "", ""]]),
      say: `<p><b>Forward pass:</b> a step starts as soon as the step before it finishes. Engine 1 at 0 → Wheels 1 at 0 + 30 = <b>30</b> → Inspect 1 at 30 + 30 = <b>60</b>.</p>` },
    { html: cpm([["0", "", ""], ["30", "", ""], ["60", "", ""], ["0", "", ""], ["60", "", ""], ["75", "", ""]]),
      say: `<p>Car 2: Engine 2 at 0 → Wheels 2 at <b>60</b> → Inspect 2 at <b>75</b>, finishing at 85. Car 1 finishes at 70. So the project finishes at <b>85</b>.</p>` },
    { ask: "Inspect 1 must end by 85. What is its latest start, and its slack?", html: cpm([["0", "15", "15"], ["30", "45", "15"], ["60", "75", "15"], ["0", "0", "0"], ["60", "60", "0"], ["75", "75", "0"]]),
      say: `<p><b>Backward pass:</b> start from the finish, 85. Inspect 1 must start by 85 − 10 = <b>75</b>; Wheels 1 by 75 − 30 = 45; Engine 1 by 45 − 30 = 15. Car 1 has <b>15 minutes of slack</b> everywhere. Car 2 has <b>zero</b>: it is the <b>critical path</b>.</p>` },
    { html: gantt([["Engine 1", 0, 30], ["Wheels 1", 30, 60], ["Inspect 1", 60, 70], ["Engine 2", 0, 60, "crit"], ["Wheels 2", 60, 75, "crit"], ["Inspect 2", 75, 85, "crit"]], 130, "Red = critical path. But both engines use the hoist at time 0."),
      say: `<p>As a Gantt chart. Problem: there is only <b>one engine hoist</b>, and both engines are on it at time 0. We must choose an order.</p>` },
    { ask: "Minimum slack picks the ready step with the least slack. Engine 1 has slack 15, Engine 2 has 0. Which goes first, and when does everything finish?", html: gantt([["Engine 2", 0, 60, "crit"], ["Engine 1", 60, 90], ["Wheels 2", 60, 75, "crit"], ["Wheels 1", 90, 120], ["Inspect 2", 75, 85, "crit"], ["Inspect 1", 120, 130]], 130, "Minimum slack: Engine 2 first → finish at 130."),
      say: `<p>Engine 2 goes first (slack 0). Engine 1 waits until 60 and finishes at 90; its wheels end at 120; inspection at <b>130</b>.</p>` },
    { html: gantt([["Engine 1", 0, 30], ["Engine 2", 30, 90, "crit"], ["Wheels 1", 30, 60], ["Wheels 2", 90, 105, "crit"], ["Inspect 1", 60, 70], ["Inspect 2", 105, 115, "crit"]], 130, "Engine 1 first → finish at 115."),
      say: `<p>Try the other order: Engine 1 first (0–30), Engine 2 right after (30–90), wheels 90–105, inspection 105–<b>115</b>. Fifteen minutes better. The greedy rule is fast but <b>not optimal</b>: scheduling with shared resources is NP-hard.</p>` }
  ] };

  window.LAB_TRACES = { s112: [BFS, GROW, BWD, SAT, GP], s113: [GC, IP, FF, HM, ASTAR, ASTARGC], s114: [HIER], s115: [BEL], s116: [CPM] };
})();
