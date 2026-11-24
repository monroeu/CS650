/* CS650 Week 11 — "Try it" workspace: run formal-language exercises (Chapters 7–11).
   Renders into the Try it panel. Engine: fl-engine.js (window.FLEngine). */
(function () {
  "use strict";
  const E = window.FLEngine;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- crumbs: every symbol and construct, with what it means ---------------- */
  const C = {
    logic: { title: "Propositional logic · Ch 7", items: [
      ["¬", "¬", "not — ¬P is true when P is false"], ["∧", " ∧ ", "and — both sides true"], ["∨", " ∨ ", "or — at least one side true"],
      ["⇒", " ⇒ ", "implies — false only when the left is true and the right is false"], ["⇔", " ⇔ ", "if and only if — both sides have the same truth value"],
      ["( )", "()", "group a sub-sentence"], ["⊤", "⊤", "true (always)"], ["⊥", "⊥", "false (always)"], ["? query", "\n? ", "the sentence α you are asking about: does KB ⊨ α?"]] },
    fol: { title: "First-order logic · Ch 8–9", items: [
      ["∀", "∀x ", "for all — ∀x P(x): P holds for every object"], ["∃", "∃x ", "there exists — ∃x P(x): P holds for at least one object"],
      ["=", " = ", "the same object"], ["≠", " ≠ ", "different objects"], ["P(x, y)", "Pred(x, y)", "a predicate (relation) applied to terms; lower-case = variable, Upper-case = constant"],
      ["F(x)", "Mother(x)", "a function term: names an object, e.g. Mother(John)"], ["Domain:", "Domain: ", "list the objects in the world model"],
      ["Unify:", "\nUnify: P(x) | P(John)", "find θ that makes two atoms identical (Ch 9)"]] },
    kr: { title: "Categories · Ch 10", items: [
      ["∈", " ∈ ", "is a member of — Maria ∈ Patients"], ["⊂", " ⊂ ", "is a subcategory of — SurgicalPatients ⊂ Patients (members inherit)"]] },
    plan: { title: "Planning (PDDL) · Ch 11", items: [
      ["Init( )", "Init(  )", "the initial state: ground facts joined by ∧ (closed world: anything not listed is false)"],
      ["Goal( )", "Goal(  )", "the facts that must be true at the end (a partial description)"],
      ["Action", "\nAction( Name(x, y),\n  PRECOND: ,\n  EFFECT:  )", "an action schema: variables in the head, preconditions, effects"],
      ["PRECOND:", "PRECOND: ", "what must be true before the action (literals joined by ∧)"],
      ["EFFECT:", "EFFECT: ", "what changes: positive literals = ADD list, ¬literals = DELETE list"],
      ["¬", "¬", "inside EFFECT, ¬At(p, a) deletes the fact; inside PRECOND it requires the fact to be false"],
      ["≠", " ≠ ", "inequality between variables, e.g. from ≠ to"],
      ["Refinement", "\nRefinement( HLA(x), STEPS: [Step1(x), Step2(x)] )", "one way to carry out a high-level action (§11.4)"],
      ["Plan: [ ]", "\nPlan: [ ]", "the high-level plan to refine (§11.4)"],
      ["OneOf( )", "OneOf(A, B)", "uncertain initial state: exactly one option is true; creates a belief state (§11.5)"],
      ["when", "when Cond: Fact", "a conditional effect: Fact is added only in worlds where Cond holds (§11.5)"],
      ["DURATION:", ", DURATION: ", "how long the action takes, in minutes (§11.6)"],
      ["USE:", ", USE: Resource(1)", "a resource the action holds while it runs (§11.6)"],
      ["≺", " ≺ ", "must come before: A ≺ B means A finishes before B starts (§11.6)"],
      ["Resources( )", "\nResources( Name(1) )", "how many units of each resource exist (§11.6)"]] }
  };
  const MODE_CRUMBS = { logic: ["logic"], fol: ["logic", "fol", "kr"], plan: ["plan", "logic"], htn: ["plan"], belief: ["plan"], sched: ["plan"] };
  const CMDS = {
    logic: [["ent", "KB ⊨ α ?"], ["tt", "Truth table"], ["cnf", "Convert to CNF"], ["res", "Resolution proof"]],
    fol: [["eval", "Evaluate in this world"], ["unify", "Unify"]],
    plan: [["bfs", "Forward search (BFS)"], ["back", "Backward search"], ["astar", "A* with h_FF"], ["step", "Step through by hand"], ["h", "Heuristics at Init"], ["sat", "SAT planning"], ["cmp", "Compare algorithms"]],
    htn: [["htn", "Refine the plan"], ["reach", "Reachable set (angelic)"]],
    belief: [["belief", "Find a sensorless plan"]],
    sched: [["sched", "Schedule it"]]
  };
  const RUN = {
    ent: E.entails, tt: E.truthTable, cnf: E.cnf, res: E.resolution, eval: E.folEval, unify: E.unify,
    bfs: E.forward, back: E.backward, astar: E.astar, step: (t) => E.applicable(t), h: E.heuristics, sat: E.satplan, cmp: E.compare,
    htn: E.htn, reach: E.reach, belief: E.belief, sched: E.schedule
  };
  const MODE_NAME = { logic: "Propositional logic", fol: "First-order logic", plan: "Planning (PDDL)", htn: "Hierarchical planning", belief: "Belief states", sched: "Scheduling" };

  /* ---------------- notation reference (Chapters 7–11) ---------------- */
  const REF = [
    ["Ch 7", "¬ P", "not P", "¬Fever"], ["Ch 7", "P ∧ Q", "P and Q", "Fever ∧ HighHR"], ["Ch 7", "P ∨ Q", "P or Q (or both)", "P12 ∨ P21"],
    ["Ch 7", "P ⇒ Q", "if P then Q", "Fever ∧ HighHR ⇒ SepsisRisk"], ["Ch 7", "P ⇔ Q", "P if and only if Q", "B11 ⇔ (P12 ∨ P21)"],
    ["Ch 7", "KB ⊨ α", "α is true in every model of KB (entailment)", "KB ⊨ SepsisRisk"], ["Ch 7", "CNF", "a conjunction of clauses; each clause is an OR of literals", "(¬A ∨ B) ∧ (A ∨ ¬B)"],
    ["Ch 8", "∀x φ", "φ holds for every object x", "∀p Patient(p) ⇒ Person(p)"], ["Ch 8", "∃x φ", "φ holds for some object x", "∃s Treats(s, Maria)"],
    ["Ch 8", "Pred(t₁, t₂)", "a relation between objects", "Treats(Okafor, Maria)"], ["Ch 8", "F(t)", "a function naming an object", "Mother(John)"],
    ["Ch 9", "θ = {x/John}", "a substitution: replace x with John", "SUBST({x/John}, King(x))"], ["Ch 9", "UNIFY(p, q)", "the most general θ that makes p and q identical", "UNIFY(Knows(John,x), Knows(y,Ann))"],
    ["Ch 10", "x ∈ C", "x is a member of category C", "Maria ∈ Patients"], ["Ch 10", "C ⊂ D", "C is a subcategory of D", "SurgicalPatients ⊂ Patients"],
    ["Ch 11", "Init( … )", "initial state (closed world)", "Init(At(C1, SFO) ∧ …)"], ["Ch 11", "Goal( … )", "facts that must hold at the end", "Goal(At(C1, JFK))"],
    ["Ch 11", "Action(a, PRECOND, EFFECT)", "an action schema", "Action(Fly(p, from, to), …)"], ["Ch 11", "RESULT(s, a)", "(s − DEL(a)) ∪ ADD(a)", "removes At(P1, SFO), adds At(P1, JFK)"],
    ["Ch 11", "h(s) ≤ h*(s)", "admissible: the heuristic never overestimates", "ignore preconditions: h = 2 ≤ 6"], ["Ch 11", "REACH(s, h)", "states some implementation of HLA h can reach", "REACH ∩ Goal ≠ ∅ ⇒ feasible"],
    ["Ch 11", "b = {s₁, s₂}", "belief state: the set of worlds that might be real", "{Can1 = Red, Can1 = Blue}"], ["Ch 11", "A ≺ B", "A must come before B", "AddEngine1 ≺ AddWheels1"],
    ["Ch 11", "Slack = LS − ES", "how long an action can slip without delaying the project", "slack 0 ⇒ critical path"]
  ];

  /* ---------------- rendering results ---------------- */
  const chip = (x, cls = "") => `<span class="chip ${cls}">${esc(x)}</span>`;
  const verdict = (ok, yes, no) => `<div class="verdict ${ok ? "ok" : "no"}">${ok ? "✓ " + yes : "✗ " + no}</div>`;
  function table(head, rows) { return `<div class="tbl-wrap"><table class="ws-tbl"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr${r.cls ? ` class="${r.cls}"` : ""}>${(r.cells || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; }
  function planSteps(r) {
    if (!r.steps) return "";
    return `<ol class="plan-steps">${r.steps.map((s) => `<li><details><summary><b>${esc(s.action)}</b></summary>
      <div class="kv"><span class="kl">PRECOND</span>${s.pre.map((x) => chip(x)).join(" ") || "—"}</div>
      <div class="kv"><span class="kl">DELETE</span>${s.del.map((x) => chip(x, "del")).join(" ") || "—"}</div>
      <div class="kv"><span class="kl">ADD</span>${s.add.map((x) => chip(x, "add")).join(" ") || "—"}</div>
      <div class="kv"><span class="kl">New state</span>${s.state.map((x) => chip(x)).join(" ")}</div></details></li>`).join("")}</ol>`;
  }
  const R = {
    truthtable(r) { return `<p>${r.rows.length} rows (2<sup>${r.symbols.length}</sup>).${r.kbCount ? ` Rows where every KB sentence is true are highlighted: <b>${r.models}</b>.` : ""}</p>` +
      table(r.symbols.concat(r.headers.map((h, i) => (i < r.kbCount ? "KB: " : (r.kbCount ? "α: " : "")) + esc(h))), r.rows.map((row) => ({ cls: r.kbCount && row.vals.slice(0, r.kbCount).every(Boolean) ? "hi" : "", cells: r.symbols.map((s) => (row.m[s] ? "T" : "F")).concat(row.vals.map((v) => `<b class="${v ? "t" : "f"}">${v ? "T" : "F"}</b>`)) }))); },
    entails(r) { return verdict(r.value, `KB ⊨ ${r.query}: in every model where the KB is true, ${r.query} is true.`, `KB does not entail ${r.query}.`) +
      `<p>Checked ${r.checked} models over ${r.symbols.map(esc).join(", ")}. The KB is true in <b>${r.kbModels}</b> of them.</p>` +
      (r.counter ? `<p><b>Counterexample</b> (KB true, query false): ${Object.entries(r.counter).map(([k, v]) => chip(`${k} = ${v ? "T" : "F"}`)).join(" ")}</p>` : "") +
      (!r.satisfiable ? `<p class="warn">The KB itself is unsatisfiable (no model makes it true), so it entails everything.</p>` : ""); },
    cnf(r) { return r.items.map((it) => `<div class="cnf"><div class="src">${esc(it.src)}</div><ol>${it.steps.map(([n, f]) => `<li><span class="step-n">${n}</span> <code>${esc(f)}</code></li>`).join("")}</ol>
      <p><b>Clauses (${it.clauses.length}):</b> ${it.clauses.map((c) => chip(c.join(" ∨ "))).join(" ")}</p></div>`).join(""); },
    resolution(r) { return verdict(r.value, `Proved by refutation: KB ∧ ¬(${r.query}) leads to the empty clause □.`, `No contradiction found, so the KB does not entail ${r.query} (within the steps tried).`) +
      `<p><b>Start clauses:</b> ${r.initial.map((c) => chip(c)).join(" ")}</p>` + (r.steps.length ? `<ol class="proof">${r.steps.map((s) => `<li>${chip(s.from[0])} + ${chip(s.from[1])} ⟶ ${chip(s.res, s.res === "□" ? "add" : "")}</li>`).join("")}</ol>` : ""); },
    fol(r) { return `<p>Domain: ${r.domain.map((d) => chip(d)).join(" ")}</p>` + r.results.map((x) => verdict(x.value, `${x.q} is TRUE in this world.`, `${x.q} is FALSE in this world.`) + (x.witness ? `<p>${esc(x.witness)}</p>` : "")).join("") +
      (r.inferred.length ? `<p><b>Inherited through categories:</b></p><ul>${r.inferred.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""); },
    unify(r) { return r.items.map((x) => `<div class="unify"><p>UNIFY(${esc(x.p)}, ${esc(x.q)})</p>` + verdict(x.ok, `θ = ${x.theta}`, "FAILURE: no substitution makes them identical") +
      `<ol>${x.trace.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>` + (x.result ? `<p>Both become: <code>${esc(x.result)}</code></p>` : "") + "</div>").join(""); },
    plan(r) {
      const algo = { bfs: "Forward breadth-first search", backward: "Backward (regression) search", astar: "A* search with h_FF", gbfs: "Greedy best-first" }[r.algo] || r.algo;
      return verdict(r.found, `${algo} found a plan of ${r.length} step${r.length === 1 ? "" : "s"}.`, r.gaveUp ? "Search stopped at its node limit without a plan." : "No plan exists: no sequence of applicable actions reaches the goal.") +
        `<p class="stats">${r.nGround} ground actions · ${r.nFluents} possible facts · ${r.expanded} nodes expanded · ${r.ms} ms</p>` +
        (r.found ? planSteps(r) : `<p>Goal: ${r.goal.map((g) => chip(g)).join(" ")}</p><p class="hint2">Check each precondition: which goal fact can no action ever make true? Use <b>Step through by hand</b> to see where you get stuck.</p>`) +
        (r.regress && r.regress.length ? `<details class="more" open><summary>Regression: the goal, rewritten backwards one action at a time</summary><ol>${r.regress.map((x) => `<li>Regress through <b>${esc(x.action)}</b> ⟶ new goal: ${x.goal.map((g) => chip(g)).join(" ")}</li>`).join("")}</ol></details>` : "") +
        (r.relevant && r.relevant.length ? `<p><b>Relevant actions for the original goal:</b> ${r.relevant.map((a) => chip(a)).join(" ")}</p>` : "");
    },
    heuristics(r) { return `<p>Estimates of the number of actions still needed from the <b>initial state</b>. True cost h* = <b>${r.hstar}</b>.</p>` +
      table(["Heuristic", "h(Init)", "Admissible here? (h ≤ h*)", "Details"], r.rows.map((x) => [esc(x.name), `<b>${x.h === Infinity ? "∞" : x.h}</b>`, x.admissible ? "✓ yes" : "✗ overestimates", esc(x.note)])); },
    sat(r) { return verdict(r.found, `SAT solver found a plan with k = ${r.k} steps.`, "No plan found up to the step limit.") +
      table(["k (plan length)", "Variables", "Clauses", "Solver answer"], r.tries.map((t) => [t.k, t.vars, t.clauses, t.sat ? "<b>SATISFIABLE</b>" : "unsatisfiable → try k + 1"])) +
      (r.tries[0] && r.tries[0].sample.length ? `<p><b>Sample clauses</b> (superscript = time step):</p><ul class="mono">${r.tries[0].sample.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : "") +
      (r.plan ? `<p><b>Plan read from the true action variables:</b></p><ol>${r.plan.map((a) => `<li>${esc(a)}</li>`).join("")}</ol>` : ""); },
    compare(r) { return `<p>${r.nGround} ground actions, ${r.nFluents} possible facts, so up to ${esc(r.stateSpace)} states.</p>` +
      table(["Algorithm", "Plan length", "Nodes expanded", "Time"], r.rows.map((x) => [esc(x.name), x.found ? x.length : (x.gaveUp ? "gave up" : "none"), x.expanded.toLocaleString(), x.ms + " ms"])); },
    htn(r) { return verdict(r.found, `Found an implementation after exploring ${r.explored} partial plan${r.explored === 1 ? "" : "s"}.`, "No implementation of the high-level plan reaches the goal.") +
      (r.solution ? `<p><b>Refinements used:</b></p><ol>${r.solution.path.map((p) => `<li>${esc(p)}</li>`).join("")}</ol><p><b>Primitive plan:</b> ${r.solution.plan.map((a) => chip(a, "add")).join(" → ")}</p>` : "") +
      `<details class="more" ${r.found ? "" : "open"}><summary>Every fully primitive implementation that was checked (${r.nImpl})</summary><ol>${r.tried.map((t) => `<li class="${t.ok ? "okline" : "noline"}">${t.plan.map(esc).join(" → ")}<br><small>${esc(t.why)}</small></li>`).join("")}</ol></details>`; },
    reach(r) { return `<p>REACH(Init, ${esc(r.hla)}) — states that <i>some</i> implementation reaches (${r.nImpl} implementations checked). Only facts that changed are shown.</p>` +
      (r.states.length ? `<ul>${r.states.map((s) => `<li>${s.facts.map((f) => chip(f)).join(" ")} ${s.ok ? "<b class=t>meets the goal</b>" : "<span class=f>misses the goal</span>"}<br><small>via ${s.plan.map(esc).join(" → ")}</small></li>`).join("")}</ul>` : "<p>No implementation can even be executed from Init.</p>") +
      `<p>Goal: ${r.goal.map((g) => chip(g)).join(" ")}</p>` + verdict(r.feasible, "REACH ∩ Goal ≠ ∅ — the high-level plan is feasible (angelic semantics: one good implementation is enough).", "REACH ∩ Goal = ∅ — no implementation reaches the goal, so the plan can be pruned."); },
    belief(r) { return `<p><b>Initial belief state:</b> ${r.worlds.length} possible world${r.worlds.length === 1 ? "" : "s"}.</p><ul class="worlds">${r.worlds.map((w, i) => `<li><b>s${i + 1}</b> ${w.map((f) => chip(f)).join(" ")}</li>`).join("")}</ul>` +
      verdict(r.found, `Sensorless plan: ${r.plan ? r.plan.join(" → ") || "(nothing to do)" : ""}`, r.why || "No sensorless plan.") +
      (r.trace.length ? `<ol class="plan-steps">${r.trace.map((t) => `<li><details><summary><b>${esc(t.action)}</b> — belief state now has ${t.size} world${t.size === 1 ? "" : "s"}</summary><ul class="worlds">${t.worlds.map((w, i) => `<li><b>s${i + 1}</b> ${w.map((f) => chip(f)).join(" ")}</li>`).join("")}</ul></details></li>`).join("")}</ol>` : ""); },
    sched(r) {
      const end = Math.max(r.makespan, r.optimal ? r.optimal.makespan : 0, r.minSlack ? r.minSlack.makespan : 0);
      const gantt = (rows, title) => `<div class="gantt"><div class="g-h">${title}</div>${rows.map((x) => `<div class="g-row"><span class="g-n">${esc(x.name)}</span><span class="g-track"><span class="g-bar${r.critical.includes(x.name) && title.startsWith("Critical") ? " crit" : ""}" style="left:${100 * x.start / end}%;width:${100 * (x.end - x.start) / end}%">${x.start}–${x.end}</span></span></div>`).join("")}</div>`;
      return `<p><b>Critical path method</b> (ignoring resource limits): makespan <b>${r.makespan}</b> min. Critical path: ${r.critical.map((c) => chip(c, "del")).join(" → ")}</p>` +
        table(["Action", "Duration", "ES", "LS", "Slack"], r.cpm.map((x) => ({ cls: x.critical ? "hi" : "", cells: [esc(x.name), x.dur, x.ES, x.LS, x.slack === 0 ? "<b>0 (critical)</b>" : x.slack] }))) +
        gantt(r.cpm, "Critical-path schedule (no resource limits)") +
        (r.optimal ? `<p><b>With resource limits</b> ${Object.entries(r.resources).map(([k, v]) => chip(`${k}(${v})`)).join(" ")}: the best schedule takes <b>${r.optimal.makespan}</b> min; the greedy minimum-slack heuristic gives <b>${r.minSlack.makespan}</b> min.</p>` +
          gantt(r.optimal.rows, `Best schedule with resources — ${r.optimal.makespan} min`) + gantt(r.minSlack.rows, `Minimum-slack heuristic — ${r.minSlack.makespan} min (order: ${r.minSlack.order.join(", ")})`) : `<p class="hint2">Add a line such as <code>Resources( EngineHoists(1) )</code> to see what limited resources do.</p>`);
    }
  };

  /* ---------------- step-through (manual forward search) ---------------- */
  function stepper(out, text, onState) {
    let hist = [null]; const draw = () => {
      let r; try { r = E.applicable(text, hist[hist.length - 1]); } catch (e) { out.innerHTML = `<div class="err">${esc(e.message)}</div>`; return; }
      onState && onState(r);
      out.innerHTML = `<p><b>Step ${hist.length - 1}.</b> Current state (closed world — anything not listed is false):</p><p>${r.stateShow.map((x) => chip(x)).join(" ")}</p>` +
        (r.goalMet ? verdict(true, `Goal reached in ${hist.length - 1} actions.`, "") : `<p>Goal facts still missing: ${r.unmet.map((g) => chip(g, "del")).join(" ")}</p>`) +
        `<p><b>${r.actions.length} applicable actions</b> (preconditions true right now). Click one to apply RESULT(s, a):</p><div class="app-acts">${r.actions.map((a, i) => `<button class="act" data-i="${i}"><b>${esc(a.name)}</b><small>${a.del.map((x) => "−" + x).concat(a.add.map((x) => "+" + x)).map(esc).join("  ")}</small></button>`).join("")}</div>` +
        `<div class="row"><button class="ghost undo" ${hist.length < 2 ? "disabled" : ""}>↶ Undo</button><button class="ghost restart">Restart from Init</button></div>`;
      out.querySelectorAll(".act").forEach((b) => (b.onclick = () => { hist.push(r.actions[b.dataset.i].next); draw(); }));
      out.querySelector(".undo").onclick = () => { hist.pop(); draw(); }; out.querySelector(".restart").onclick = () => { hist = [null]; draw(); };
    }; draw();
  }

  /* ---------------- expectation check ---------------- */
  const getPath = (o, p) => p.split(".").reduce((x, k) => (x == null ? x : x[k]), o);
  function meets(ex, cmd, r) {
    const want = ex.expect; if (!want) return true;
    if (want.cmd && want.cmd !== cmd) return false;
    return Object.entries(want).every(([k, v]) => k === "cmd" || k === "label" || (k.endsWith(">=") ? getPath(r, k.slice(0, -2)) >= v : getPath(r, k) === v));
  }

  /* ---------------- build one exercise ---------------- */
  function exercise(ex, i, n, st) {
    const saved = st.code[ex.id];
    const el = document.createElement("details"); el.className = "ex-card" + (st.passed[ex.id] ? " passed" : ""); el.id = "ex-" + ex.id;
    el.innerHTML = `<summary><span class="ex-num">${i + 1}/${n}</span><span class="ex-title">${esc(ex.title)}</span><span class="ex-mode">${MODE_NAME[ex.mode]}</span><span class="ex-badge">${st.passed[ex.id] ? "✓ Done" : "To do"}</span></summary>
      <div class="ex-body">
        <div class="ex-why"><b>Why this matters.</b> ${ex.why}</div>
        <div class="ex-task"><b>Your task.</b> ${ex.task}</div>
        <div class="crumbs"></div>
        <textarea class="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code for ${esc(ex.title)}"></textarea>
        <div class="cmds"></div>
        <div class="row small"><button class="ghost reset">Reset code</button><button class="ghost sol" hidden title="Available once this exercise is credited">Show a solution</button>${ex.hint ? '<button class="ghost hintb">Hint</button>' : ""}<span class="check"></span></div>
        <div class="hintbox" hidden>${ex.hint || ""}</div>
        <div class="out" aria-live="polite"></div>
        ${ex.notice ? `<div class="notice"><b>What to notice.</b> ${ex.notice}</div>` : ""}
      </div>`;
    const ta = el.querySelector(".code"); ta.value = saved != null ? saved : ex.code; const fit = () => { ta.style.height = "auto"; ta.style.height = Math.min(520, ta.scrollHeight + 6) + "px"; };
    ta.addEventListener("input", () => { st.code[ex.id] = ta.value; st.save(); fit(); });
    ta.addEventListener("keydown", (e) => { if (e.key === "Tab") { e.preventDefault(); insert("  "); } if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(ex.run); } });
    function insert(s) { const a = ta.selectionStart, b = ta.selectionEnd; const sel = ta.value.slice(a, b);
      let ins = s; if (s === "()") ins = "(" + sel + ")"; ta.setRangeText(ins, a, b, "end"); if (s === "()" && !sel) ta.selectionStart = ta.selectionEnd = a + 1; ta.focus(); ta.dispatchEvent(new Event("input")); }
    const cr = el.querySelector(".crumbs");
    (ex.crumbs || MODE_CRUMBS[ex.mode]).forEach((g) => { const grp = C[g]; const d = document.createElement("div"); d.className = "crumb-g"; d.innerHTML = `<span class="crumb-t">${grp.title}</span>`;
      grp.items.forEach(([label, ins, tip]) => { const b = document.createElement("button"); b.type = "button"; b.className = "crumb"; b.textContent = label; b.title = tip; b.setAttribute("aria-label", `Insert ${label}: ${tip}`); b.onclick = () => insert(ins); d.appendChild(b); });
      cr.appendChild(d); });
    const tip = document.createElement("div"); tip.className = "crumb-tip"; tip.textContent = "Hover over or press-and-hold a symbol to see what it means. Click it to insert it at the cursor."; cr.appendChild(tip);
    cr.querySelectorAll(".crumb").forEach((b) => { const show = () => (tip.textContent = `${b.textContent} — ${b.title}`); b.addEventListener("mouseenter", show); b.addEventListener("focus", show); b.addEventListener("touchstart", show, { passive: true }); });
    const cmds = el.querySelector(".cmds");
    CMDS[ex.mode].forEach(([id, label]) => { const b = document.createElement("button"); b.className = id === ex.run ? "run primary" : "run"; b.textContent = (id === ex.run ? "▶ " : "") + label; b.onclick = () => run(id); cmds.appendChild(b); });
    const out = el.querySelector(".out"), chk = el.querySelector(".check");
    function run(cmd) {
      document.dispatchEvent(new CustomEvent("lab:activity", { detail: { type: "tryit-run", exercise: ex.id, cmd } }));
      if (cmd === "step") { stepper(out, ta.value, (r) => { if (ex.expect && ex.expect.cmd === "step" && r.goalMet) pass(); }); return; }
      out.innerHTML = '<p class="running">Running…</p>'; const code = ta.value;
      setTimeout(() => {
        let r;
        try { r = RUN[cmd](code); } catch (e) { out.innerHTML = `<div class="err"><b>Check your syntax.</b> ${esc(e.message)}</div>`; chk.textContent = ""; return; }
        out.innerHTML = (R[r.kind] || ((x) => `<pre>${esc(JSON.stringify(x, null, 1))}</pre>`))(r);
        if (meets(ex, cmd, r)) pass(); else if (ex.expect) { chk.className = "check no"; chk.textContent = ex.expect.label ? "Not yet — " + ex.expect.label : "Ran. Compare the result with the task."; }
      }, 30);
    }
    function pass() { chk.className = "check ok"; chk.textContent = "✓ Matches the expected result"; if (!st.passed[ex.id]) { st.passed[ex.id] = true; st.save(); el.classList.add("passed"); el.querySelector(".ex-badge").textContent = "✓ Done"; el._refreshSol && el._refreshSol(); st.onPass(ex.id); } }
    el.querySelector(".reset").onclick = () => { ta.value = ex.code; delete st.code[ex.id]; st.save(); fit(); out.innerHTML = ""; chk.textContent = ""; };
    // The worked solution appears only after the exercise is credited. In the published lab the
    // solution text is not in the page: the server sends it once the exercise is recorded as done.
    const solOf = () => (st.solutions && st.solutions[ex.id]) || ex.solution || null;
    const sb = el.querySelector(".sol");
    el._refreshSol = () => { sb.hidden = !(st.passed[ex.id] && solOf()); };
    sb.onclick = () => { const sol = solOf(); if (sol && confirm("Replace your code with a worked solution? Your exercise stays credited.")) { ta.value = sol; st.code[ex.id] = ta.value; st.save(); fit(); } };
    el._refreshSol();
    const hb = el.querySelector(".hintb"); if (hb) hb.onclick = () => { const h = el.querySelector(".hintbox"); h.hidden = !h.hidden; };
    el.addEventListener("toggle", () => { if (el.open) fit(); });
    setTimeout(fit, 0);
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && fit())).observe(ta);
    return el;
  }

  /* ---------------- public: render the Try it panel for a module ---------------- */
  window.FLWorkspace = {
    render(box, mod, st) {
      box.innerHTML = "";
      const head = document.createElement("div"); head.className = "ws-head";
      head.innerHTML = `<p>${mod.tryitIntro || "Run each exercise, read the output, then change the code and run it again."} Each exercise is ready to run: press <b>▶</b>, read the output, then make the change the task asks for. Click the symbol buttons to insert notation; <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the main command.</p>
        <details class="ref"><summary>Notation reference — every symbol from Chapters 7 to 11</summary>${table(["Chapter", "Write", "Read it as", "Example"], REF.map((r) => [r[0], `<code>${esc(r[1])}</code>`, esc(r[2]), `<code>${esc(r[3])}</code>`]))}
        <p class="hint2">Spelling rules: <b>Upper-case</b> names are constants or predicates (Maria, At, SFO); <b>lower-case</b> names are variables (x, p, from). Keyboard alternatives also work: ~ for ¬, &amp; for ∧, | for ∨, =&gt; for ⇒, &lt;=&gt; for ⇔, != for ≠, forall and exists.</p></details>`;
      box.appendChild(head);
      const first = mod.tryit.findIndex((x) => !st.passed[x.id]);
      mod.tryit.forEach((ex, i) => { const el = exercise(ex, i, mod.tryit.length, st); if (i === (first < 0 ? 0 : first)) el.open = true; box.appendChild(el); });
    }
  };
})();
