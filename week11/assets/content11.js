window.LAB_MODULES = window.LAB_MODULES || [];
window.LAB_MODULES.push(
{
  id: "intro", kind: "section", part: "p1", slides: [1, 4],
  label: "Start", title: "Welcome and the Notation Toolkit",
  blurb: "Why planning, the two running worlds (Air Cargo and Northgate General), and a refresher on the formal notation from Chapters 7–10 that Chapter 11 builds on.",
  learn: `
<h3>1. Why planning?</h3>
<p>Chapter 3's search agents needed a human to write a new heuristic for every problem. Chapter 7's logical agents needed the same rule copied for every time step and every square. Planning fixes both. <b>Action schemas</b> let one template, with variables, stand for every specific action. <b>Factored states</b>, made of named facts, let the computer work out its own heuristics. NASA's Remote Agent (Deep Space One, 1999) and Hitachi's factory scheduler were built on these ideas.</p>
<h3>2. Two worlds, one toolkit</h3>
<p>Every idea in this chapter is shown twice: on the textbook's <b>Air Cargo</b> problem (cargo C1 and C2, planes P1 and P2, airports SFO and JFK) and on <b>Northgate General Hospital</b> (Maria Santos, Dr. Okafor, Nurse Priya, Operating Room 3). A <b>domain-independent</b> planner runs the same code on both; only the names change.</p>
<h3>3. The notation you will use (Chapters 7–10)</h3>
<p>Planning is written in logic, so the notation from earlier chapters returns.</p>
<div class="rule"><b>Ch 7, propositional logic:</b> <span class="f">¬</span> not · <span class="f">∧</span> and · <span class="f">∨</span> or · <span class="f">⇒</span> implies · <span class="f">⇔</span> if and only if · <span class="f">KB ⊨ α</span> “the KB entails α”: α is true in every model where the KB is true.</div>
<div class="rule"><b>Ch 8–9, first-order logic:</b> <span class="f">∀x</span> for all · <span class="f">∃x</span> there exists · predicates such as <span class="f">At(C1, SFO)</span> · functions such as <span class="f">Mother(John)</span> · a substitution <span class="f">θ = {x/John}</span> · <span class="f">UNIFY(p, q)</span> finds the θ that makes p and q identical.</div>
<div class="rule"><b>Ch 10, categories:</b> <span class="f">Maria ∈ Patients</span> (membership) · <span class="f">SurgicalPatients ⊂ Patients</span> (subcategory); members inherit the properties of every category above them.</div>
<div class="ex"><div class="ex-h">Worked example: entailment at Northgate</div>
KB: <span class="f">Fever ∧ HighHR ⇒ SepsisRisk</span>, <span class="f">Fever</span>, <span class="f">HighHR</span>.<br>
There are 2³ = 8 models of the three symbols. Only one makes all three KB sentences true (Fever = T, HighHR = T, SepsisRisk = T), and in it SepsisRisk is true. So <span class="f">KB ⊨ SepsisRisk</span>.</div>
<h3>4. Writing conventions in this lab</h3>
<ul><li><b>Upper-case</b> names are constants and predicates: <span class="f">Maria</span>, <span class="f">At</span>, <span class="f">SFO</span>. <b>Lower-case</b> names are variables: <span class="f">x</span>, <span class="f">p</span>, <span class="f">from</span>.</li>
<li>In planning, a fact is a ground atom such as <span class="f">At(P1, SFO)</span>; a state is the set of facts that are true right now.</li></ul>
<div class="mistake"><b>Common mistake:</b> reading <span class="f">P ⇒ Q</span> as “P causes Q”. It only says Q is true whenever P is true; it is false in exactly one case, P true and Q false.</div>`,
  cards: [
    ["Action schema", "One template with variables, e.g. Fly(p, from, to), standing for every specific action."],
    ["Factored state", "A state broken into named facts, e.g. {At(C1, SFO), At(P1, SFO)}."],
    ["Domain-independent planner", "The same code solves any domain; only the action schemas and objects change."],
    ["KB ⊨ α", "α is true in every model in which the KB is true."],
    ["P ⇒ Q", "False only when P is true and Q is false."],
    ["∀x / ∃x", "For every object x / for at least one object x."],
    ["θ = {x/John}", "A substitution: replace every x with John."],
    ["x ∈ C, C ⊂ D", "Membership and subcategory (Chapter 10); members of C are also members of D."]
  ],
  check: { q: "Which planning idea removes the need for a human to write a new heuristic for every problem?",
    options: ["Atomic states", "Factored states", "Propositional axioms for each time step", "A larger search tree"], answer: 1,
    why: "Because a factored state is made of named facts, the planner can relax the problem itself and compute heuristics automatically (section 11.3)." },
  mcq: [
    { q: "In the KB {Fever ∧ HighHR ⇒ SepsisRisk, Fever, HighHR}, how many of the 8 models make every KB sentence true?", options: ["0", "1", "3", "8"], answer: 1,
      fb: ["The KB is satisfiable.", "Correct: only Fever = T, HighHR = T, SepsisRisk = T.", "Three models satisfy the rule alone; Fever and HighHR must also be true.", "That is every model, including ones where Fever is false."] },
    { q: "When is P ⇒ Q false?", options: ["When P is false", "When Q is true", "When P is true and Q is false", "When both are false"], answer: 2,
      fb: ["A false premise makes the implication true.", "A true conclusion makes the implication true.", "Correct: that is the only case.", "Both false gives true."] },
    { q: "Which is a variable in the Air Cargo schema Fly(p, from, to)?", options: ["Fly", "SFO", "from", "P1"], answer: 2,
      fb: ["Fly is the action name.", "SFO is a constant.", "Correct: lower-case names are variables.", "P1 is a constant (a specific plane)."] },
    { q: "UNIFY(Knows(John, x), Knows(y, Ann)) = ?", options: ["{x/John, y/Ann}", "{y/John, x/Ann}", "FAILURE", "{John/y, Ann/x}"], answer: 1,
      fb: ["The pairs are crossed.", "Correct: compare argument by argument.", "Two variables meet two constants, so unification succeeds.", "Substitutions replace variables, written variable/value."] },
    { q: "Maria ∈ SurgicalPatients and SurgicalPatients ⊂ Patients. What follows?", options: ["Patients ⊂ Maria", "Maria ∈ Patients", "SurgicalPatients ∈ Maria", "Nothing"], answer: 1,
      fb: ["A person is not a category.", "Correct: membership is inherited upward.", "Reversed.", "Category inheritance gives a new fact."] }
  ]
},
{
  id: "s111", kind: "section", part: "p1", slides: [5, 21],
  label: "11.1", title: "Defining Classical Planning",
  blurb: "PDDL: the initial state, action schemas, the goal, and the RESULT rule, worked through Air Cargo, the spare tire, the blocks world and Northgate.",
  learn: `
<h3>1. The planning question</h3>
<p>Given where I am now, what sequence of actions gets me to my goal? The agent works out the <b>whole</b> sequence before acting, and the answer can be checked. <b>Classical planning</b> assumes the world is <b>discrete</b>, <b>deterministic</b>, <b>static</b> and <b>fully observable</b>. Section 11.5 drops the last two.</p>
<h3>2. Three ingredients: Init, Actions, Goal</h3>
<div class="rule"><span class="f">Init( At(C1, SFO) ∧ At(C2, JFK) ∧ At(P1, SFO) ∧ At(P2, JFK) )</span><br><span class="f">Goal( At(C1, JFK) ∧ At(C2, SFO) )</span></div>
<p>The goal is a <b>partial</b> description: it says nothing about the planes, so any plan that gets the cargo right counts.</p>
<h3>3. States and the closed-world assumption</h3>
<p>A state is the set of facts true right now. Under the <b>closed-world assumption</b>, a fact that is not listed is false: if <span class="f">At(P1, JFK)</span> is missing, then <span class="f">¬At(P1, JFK)</span>. This keeps states short, like a database where a missing row means “no”.</p>
<h3>4. Action schemas and grounding</h3>
<div class="rule"><span class="f">Action( Load(c, p, a), PRECOND: At(c, a) ∧ At(p, a), EFFECT: ¬At(c, a) ∧ In(c, p) )</span></div>
<p>The <b>precondition</b> must be true before the action runs. The <b>effect</b> has a <b>delete list</b> (the negative literals) and an <b>add list</b> (the positive literals). Substituting objects for variables, e.g. {c/C1, p/P1, a/SFO}, is called <b>grounding</b>.</p>
<h3>5. The RESULT rule</h3>
<div class="rule"><span class="f">RESULT(s, a) = (s − DEL(a)) ∪ ADD(a)</span></div>
<div class="ex"><div class="ex-h">Worked example</div>
s = {At(P1, SFO), At(C2, JFK)}, a = Fly(P1, SFO, JFK).<br>
DEL(a) = {At(P1, SFO)}, ADD(a) = {At(P1, JFK)}.<br>
s − DEL = {At(C2, JFK)}; ∪ ADD = {At(C2, JFK), At(P1, JFK)}. At(C2, JFK) was never touched; facts an action doesn't mention carry over unchanged.</div>
<h3>6. Four domains, one structure</h3>
<ul><li><b>Air Cargo:</b> Load, Fly, Unload. The solution has 6 steps. Cargo inside a plane is at no airport, so flying never needs to update it.</li>
<li><b>Spare tire:</b> one Remove schema matches Init two ways. <span class="f">LeaveOvernight</span> deletes everything, so a planner must avoid it. Plan: Remove(Flat, Axle), Remove(Spare, Trunk), PutOn(Spare, Axle).</li>
<li><b>Blocks world:</b> sometimes you must undo before you build. Move C to the table first, then B onto C, then A onto B. <span class="f">MoveToTable</span> is a separate action, because the table always has room.</li>
<li><b>Northgate:</b> Prep, TransferToOR, Operate and TransferToRecovery have the same structure. Operate needs Dr. Okafor in the room, and checking every precondition is exactly how a planner catches a modelling gap like that.</li></ul>
<div class="mistake"><b>Common mistake:</b> forgetting the delete list. Without <span class="f">¬At(p, from)</span>, a plane that flies to JFK would still be at SFO.</div>`,
  cards: [
    ["Classical planning assumptions", "Discrete, deterministic, static, fully observable."],
    ["PDDL", "Planning Domain Definition Language: one schema describes a whole family of actions."],
    ["Init / Goal", "The facts true at the start / the facts that must be true at the end (a partial description)."],
    ["Closed-world assumption", "A fact not listed in the state is false."],
    ["Precondition", "What must be true before an action can run."],
    ["Add list / delete list", "The positive / negated literals of an action's effect."],
    ["Grounding", "Substituting objects for variables to get a concrete action."],
    ["RESULT(s, a)", "(s − DEL(a)) ∪ ADD(a); unmentioned facts are unchanged."],
    ["Why MoveToTable?", "The table always has room, so Clear(Table) must never be switched off."]
  ],
  check: { q: "s = {At(P1, SFO), At(C2, JFK)}. What is RESULT(s, Fly(P1, SFO, JFK))?",
    options: ["{At(P1, JFK)}", "{At(C2, JFK), At(P1, JFK)}", "{At(P1, SFO), At(P1, JFK), At(C2, JFK)}", "{At(C2, JFK)}"], answer: 1,
    why: "Remove the delete list At(P1, SFO), add At(P1, JFK); At(C2, JFK) carries over. A forgets the untouched fact; C forgets the delete; D forgets the add." },
  mcq: [
    { q: "Under the closed-world assumption, At(P1, JFK) is missing from the state. Therefore…", options: ["At(P1, JFK) is unknown", "¬At(P1, JFK)", "The state is invalid", "P1 is in the air"], answer: 1,
      fb: ["“Unknown” is the belief-state view of section 11.5.", "Correct: unlisted means false.", "Missing facts are normal; states list only true facts.", "Nothing in the state says P1 is in the air."] },
    { q: "Which literal is in the DELETE list of Load(c, p, a)?", options: ["In(c, p)", "At(p, a)", "¬At(c, a)", "Cargo(c)"], answer: 2,
      fb: ["That is added.", "The plane stays where it is.", "Correct: the cargo is no longer at the airport.", "Types never change."] },
    { q: "Why is the Air Cargo goal At(C1, JFK) ∧ At(C2, SFO) a partial description?", options: ["It is missing Init", "It says nothing about the planes", "It uses variables", "It has no ∨"], answer: 1,
      fb: ["The goal is separate from Init.", "Correct: any final plane position is acceptable.", "It is ground.", "Goals are conjunctions."] },
    { q: "Grounding Load(c, p, a) with {c/C1, p/P1, a/SFO} gives…", options: ["Load(C1, P1, SFO) with PRECOND At(C1, SFO) ∧ At(P1, SFO)", "Load(c, p, a) with SFO added", "A new schema", "Load(SFO, P1, C1)"], answer: 0,
      fb: ["Correct: every variable is replaced everywhere.", "Grounding replaces variables; it does not add them.", "It produces one concrete action.", "The order of the substitution matters."] },
    { q: "In the blocks world, why must C move to the table first?", options: ["C is heaviest", "A is not clear while C sits on it", "Move cannot use B", "The goal mentions C on the table"], answer: 1,
      fb: ["Weight is not modelled.", "Correct: you must undo before you build.", "B moves in step 2.", "The goal is A on B and B on C."] }
  ]
},
{
  id: "s112", kind: "section", part: "p1", slides: [22, 32],
  label: "11.2", title: "Algorithms for Classical Planning",
  blurb: "Forward (progression) search, backward (regression) search, planning as satisfiability, other encodings, and partial-order plans.",
  learn: `
<h3>1. Three ways to search</h3>
<p>Because PDDL <i>describes</i> the problem rather than prescribing a method, we can search in different directions:</p>
<ul><li><b>Forward search (progression)</b>: start at Init and apply applicable actions until a state satisfies the goal.</li>
<li><b>Backward search (regression)</b>: start at the goal and ask what must have been true one step earlier.</li>
<li><b>SAT planning</b>: ask a satisfiability solver whether a plan of exactly k steps exists.</li></ul>
<h3>2. Forward search and the branching problem</h3>
<p>An action is <b>applicable</b> when its preconditions are true in the current state. Forward search is ordinary Chapter 3 search over states made of facts. Its weakness is branching: in a large Air Cargo problem (10 airports, 50 planes, 200 cargo) there are about 2,000 applicable actions per state. A 41-step solution then means about <span class="f">2000⁴¹</span> nodes for blind search. A good heuristic is essential (section 11.3).</p>
<h3>3. Backward search (regression)</h3>
<p>Pick a <b>relevant</b> action: one that achieves a goal literal without undoing any other goal literal. Then regress:</p>
<div class="rule"><span class="f">g′ = (g − ADD(a)) ∪ PRECOND(a)</span></div>
<div class="ex"><div class="ex-h">Worked example</div>
Goal g = {At(C2, SFO)}. Relevant action: Unload(C2, p, SFO), which adds At(C2, SFO).<br>
g′ = ({At(C2, SFO)} − {At(C2, SFO)}) ∪ {In(C2, p), At(p, SFO)} = {In(C2, p), At(p, SFO)}. The plane p is still a variable.</div>
<p>Regression considers far fewer actions, but its states contain variables, which makes heuristics harder. Most modern planners search forward.</p>
<h3>4. Planning as satisfiability</h3>
<p>Fix a length k. Create a true/false variable for every fact at every time step and every action at every step. Then add clauses:</p>
<ul><li><b>Preconditions:</b> <span class="f">Load(C1, P1, SFO)ᵗ ⇒ At(C1, SFO)ᵗ⁻¹</span></li>
<li><b>Effects:</b> <span class="f">Load(C1, P1, SFO)ᵗ ⇒ In(C1, P1)ᵗ ∧ ¬At(C1, SFO)ᵗ</span></li>
<li><b>Frame axioms</b>, which say what does not change, and <b>one action per step</b>.</li></ul>
<p>If the formula is satisfiable, the true action variables are the plan. If it is unsatisfiable, increase k by one and try again.</p>
<h3>5. Other approaches and partial-order plans</h3>
<p><b>Graphplan</b> builds a planning graph; <b>situation calculus</b> writes planning in first-order logic; a <b>CSP encoding</b> makes each time step a variable whose values are actions. A <b>partial-order plan</b> leaves actions unordered when their order does not matter. For the spare tire, the two Removes can happen in either order. Such plans are still popular where people must read and check them, as in Mars rover operations.</p>
<div class="mistake"><b>Common mistake:</b> treating “relevant” as “applicable”. Applicable looks at the <i>current state</i> (forward); relevant looks at the <i>goal</i> (backward).</div>`,
  cards: [
    ["Progression", "Forward search from Init, applying applicable actions."],
    ["Applicable action", "An action whose preconditions are true in the current state."],
    ["Regression", "Backward search from the goal: g′ = (g − ADD(a)) ∪ PRECOND(a)."],
    ["Relevant action", "Achieves a goal literal and undoes none of the others."],
    ["Branching problem", "Thousands of applicable actions per state make blind forward search hopeless."],
    ["SATPlan", "Encode “is there a plan of k steps?” as clauses; if UNSAT, try k + 1."],
    ["Frame axiom", "A clause saying a fact stays the same unless an action changes it."],
    ["Partial-order plan", "Leaves actions unordered when their order doesn't matter: a graph, not a sequence."]
  ],
  check: { q: "Regress the goal {At(C2, SFO)} through Unload(C2, p, SFO). The new goal is…",
    options: ["{At(C2, SFO)}", "{In(C2, p), At(p, SFO)}", "{At(C2, JFK)}", "{In(C2, p)}"], answer: 1,
    why: "Remove what the action adds and add what it needs: both preconditions of Unload. D forgets that the plane must be at SFO." },
  mcq: [
    { q: "Why do most modern planners search forward rather than backward?", options: ["Backward search is incomplete", "Backward states contain variables, which makes heuristics harder", "Forward search has fewer choices", "Regression cannot use PDDL"], answer: 1,
      fb: ["Regression is complete.", "Correct.", "Forward search usually has more choices.", "Regression works directly on PDDL."] },
    { q: "In SAT planning, the solver says UNSATISFIABLE for k = 4. What next?", options: ["No plan exists", "Try k = 5", "Remove frame axioms", "Try k = 3"], answer: 1,
      fb: ["Only no plan of exactly 4 steps.", "Correct: increase k and ask again.", "Without frame axioms facts could change at random.", "Shorter plans were already ruled out."] },
    { q: "What does the clause Load(C1, P1, SFO)ᵗ ⇒ At(C1, SFO)ᵗ⁻¹ encode?", options: ["An effect", "A precondition", "A frame axiom", "The goal"], answer: 1,
      fb: ["Effects point forward in time.", "Correct: the fact must hold before the action.", "Frame axioms say facts persist.", "The goal refers to the last step."] },
    { q: "Roughly how many nodes does blind forward search face for a 41-step plan with 2,000 actions per state?", options: ["41 × 2,000", "2,000²", "2,000⁴¹", "41²⁰⁰⁰"], answer: 2,
      fb: ["That ignores branching at every level.", "Only two levels deep.", "Correct: b to the d.", "Reversed exponent."] },
    { q: "In the spare tire plan, which pair can be left unordered in a partial-order plan?", options: ["Remove(Flat, Axle) and PutOn(Spare, Axle)", "Remove(Spare, Trunk) and PutOn(Spare, Axle)", "Remove(Flat, Axle) and Remove(Spare, Trunk)", "None of them"], answer: 2,
      fb: ["The axle must be free first.", "The spare must be on the ground first.", "Correct: neither affects the other.", "One pair is independent."] }
  ]
},
{
  id: "s113", kind: "section", part: "p1", slides: [33, 45],
  label: "11.3", title: "Heuristics for Planning",
  blurb: "Relax the problem, solve the easier version, use its cost: ignore preconditions, set cover, ignore delete lists, symmetry, serializable subgoals, preferred actions, abstraction and decomposition.",
  learn: `
<h3>1. Admissibility</h3>
<p>A heuristic h(s) estimates how many actions remain. It is <b>admissible</b> if it never overestimates: <span class="f">h(s) ≤ h*(s)</span>. With an admissible heuristic, A* finds an optimal plan. The recipe for every heuristic in this section: <b>relax</b> the problem, solve the easier version, and use its cost.</p>
<h3>2. Ignore preconditions</h3>
<p>Delete every precondition; any action can happen at any time. At the start of Air Cargo two goal facts are missing, and two Unloads achieve them directly, so h = 2 while the true cost is 6. It is admissible but loose, like the misplaced-tiles heuristic for the 8-puzzle.</p>
<h3>3. Set cover</h3>
<p>Keep only each action's effects that are goal facts, then find the fewest actions that cover every goal fact. Set cover counts <b>actions</b>, not facts: one action can produce two goal facts. The exact minimum is NP-hard; a greedy cover is fast but can lose admissibility.</p>
<h3>4. Ignore delete lists (h_FF)</h3>
<p>Pretend actions only add facts; the “− DEL(a)” in RESULT is dropped. Facts pile up instead of competing, there are no dead ends, and hill-climbing finds a <b>relaxed plan</b> quickly. Its length is the heuristic behind <b>FF (Fast Forward)</b>. Because preconditions are kept, the relaxed plan still does the real work of making actions legal, so the estimate is much closer than ignoring preconditions.</p>
<div class="ex"><div class="ex-h">Air Cargo at Init</div>
Ignore preconditions: h = 2 · ignore delete lists: h = 6 · true cost h* = 6.</div>
<h3>5. Pruning ideas</h3>
<ul><li><b>Symmetry reduction:</b> twelve identical blocks give 110 equivalent first moves; keep one.</li>
<li><b>Serializable subgoals:</b> an order exists in which no finished subgoal is undone, e.g. building a tower bottom-up. It let Remote Agent avoid almost all backtracking.</li>
<li><b>Preferred actions:</b> search actions from a relaxed plan first (forward pruning). This is fast but can miss the optimum.</li></ul>
<h3>6. Abstraction and decomposition</h3>
<p><b>Abstraction</b> maps many states onto one, e.g. ignore fuel. Its cost never exceeds the real cost, so it is admissible. <b>Decomposition</b> solves subgoals separately and combines their costs:</p>
<div class="rule"><span class="f">MAX(3, 5, 4) = 5</span> always admissible · <span class="f">SUM = 12</span> often closer, but can double-count shared work (one flight delivering three packages)</div>
<div class="ng"><div class="ng-h">Northgate</div>The same relaxation code reads Northgate's schemas. Ignoring delete lists lets Maria be in PreOp and OR3 at once: absurd, but fine for an estimate. Ignoring preconditions lets SurgeryComplete happen in one step, which is far too optimistic.</div>
<div class="mistake"><b>Common mistake:</b> assuming a more informed heuristic is always admissible. h_add (SUM) can overestimate when subgoals share actions.</div>`,
  cards: [
    ["Admissible heuristic", "Never overestimates: h(s) ≤ h*(s). A* with it finds an optimal plan."],
    ["Relaxation", "Remove a restriction, solve the easier problem, use its cost as h."],
    ["Ignore preconditions", "Any action any time; admissible but loose (Air Cargo: h = 2 vs 6)."],
    ["Set cover", "Fewest actions covering all goal facts; counts actions, not facts."],
    ["Ignore delete lists", "Actions only add facts; the basis of FF. Much closer estimates."],
    ["Symmetry reduction", "Prune moves that lead to equivalent states."],
    ["Serializable subgoals", "An order exists in which completed subgoals are never undone."],
    ["Preferred actions", "Try actions from a relaxed plan first; fast, but can miss the optimum."],
    ["MAX vs SUM", "MAX of subgoal costs is admissible; SUM is closer but can overestimate."]
  ],
  check: { q: "Why is ignoring delete lists usually a closer estimate than ignoring preconditions?",
    options: ["It deletes more facts", "It keeps preconditions, so the relaxed plan still makes actions legal", "It is not admissible", "It ignores the goal"], answer: 1,
    why: "Ignoring preconditions skips the hard part (Load, Fly). Ignoring deletes still needs Load and Fly before Unload." },
  mcq: [
    { q: "True cost is 3. Which estimate is NOT admissible?", options: ["0", "2", "3", "4"], answer: 3,
      fb: ["Zero never overestimates (but is useless).", "Under the true cost: admissible.", "Equal is fine.", "Correct: it overestimates."] },
    { q: "Goal: On(C, Table) ∧ Clear(A). One action, MoveToTable(C, A), produces both. Set-cover h = ?", options: ["0", "1", "2", "3"], answer: 1,
      fb: ["Both facts are unmet.", "Correct: one action covers both facts.", "That counts facts, not actions.", "Too many."] },
    { q: "Subgoal costs are 3, 5 and 4. The admissible decomposition estimate is…", options: ["3", "4", "5", "12"], answer: 2,
      fb: ["MIN is admissible but very loose; the section uses MAX.", "Not a combination rule.", "Correct: MAX.", "SUM can overestimate."] },
    { q: "Which planner is built around the ignore-delete-lists heuristic?", options: ["Graphplan", "FF (Fast Forward)", "SATPlan", "O-PLAN"], answer: 1,
      fb: ["Graphplan uses planning graphs.", "Correct.", "SATPlan uses a SAT solver.", "O-PLAN is hierarchical."] },
    { q: "Why can “preferred actions” miss the best plan?", options: ["They are admissible", "They prune actions that are not in the relaxed plan", "They ignore the goal", "They only work backward"], answer: 1,
      fb: ["Admissibility is about estimates, not pruning.", "Correct: forward pruning can drop the optimal action.", "The relaxed plan targets the goal.", "They are used in forward search."] }
  ]
},
{
  id: "s114", kind: "section", part: "p1", slides: [46, 57],
  label: "11.4", title: "Hierarchical Planning",
  blurb: "High-level actions, refinements and implementations; why hierarchy saves exponentially; angelic semantics, reachable sets and optimistic/pessimistic bounds.",
  learn: `
<h3>1. High-level actions and refinements</h3>
<p>A <b>high-level action (HLA)</b> such as <span class="f">Go(Home, SFO)</span> can be carried out in more than one way. Each way is a <b>refinement</b>:</p>
<div class="rule"><span class="f">Refinement(Go(Home, SFO), STEPS: [Drive(Home, SFOLongTermParking), Shuttle(SFOLongTermParking, SFO)])</span><br><span class="f">Refinement(Go(Home, SFO), STEPS: [Taxi(Home, SFO)])</span></div>
<p>A refinement made only of primitive actions is an <b>implementation</b>. A refinement library is expert know-how built into the planner.</p>
<h3>2. “At least one” is enough</h3>
<p>A high-level plan achieves the goal if <b>at least one</b> of its implementations does, because the agent itself chooses which one to run. The simplest algorithm starts from <span class="f">[Act]</span>, repeatedly replaces an HLA with one of its refinements, and simulates each fully primitive plan.</p>
<h3>3. The payoff</h3>
<p>Flat search costs about <span class="f">bᵈ</span>: with b = 10 and d = 7 that is 10,000,000 nodes. With r refinements of k steps each, hierarchical search costs about <span class="f">r^((d−1)/(k−1))</span>: with r = 2, k = 3 that is 2³ = 8. Hitachi's O-PLAN scheduled 350 products, 35 machines and over 2,000 operations this way.</p>
<h3>4. Angelic semantics and the reachable set</h3>
<p><span class="f">REACH(s, h)</span> is the set of states that <b>some</b> implementation of h can reach from s. The plan is feasible if <span class="f">REACH ∩ Goal ≠ ∅</span>. This is <b>angelic</b> choice: the agent picks. In <b>demonic</b> nondeterminism (Chapter 4) an adversary picks, so every outcome must succeed.</p>
<div class="ex"><div class="ex-h">Worked example</div>Go(SFO, NY) has three implementations: fly direct, fly via Denver, take the train. All end at NY, so REACH = {At(NY)}. With Goal = {At(NY)}, the intersection is non-empty and the plan is feasible, without choosing a flight.</div>
<h3>5. Optimistic and pessimistic bounds</h3>
<ul><li><span class="f">REACH⁻</span> (pessimistic) contains only what certainly happens; <span class="f">REACH⁺</span> (optimistic) contains everything that might.</li>
<li>If even REACH⁺ misses the goal → the plan <b>certainly fails</b>; prune it.</li>
<li>If even REACH⁻ hits the goal → the plan <b>certainly works</b>; commit and refine later.</li>
<li>Otherwise → uncertain; refine further. <b>Angelic search</b> does exactly this, and is roughly linear on the vacuum world where flat search is about 5ᵈ.</li></ul>
<div class="ng"><div class="ng-h">Northgate</div>Admit(Maria) has two refinements: scheduled intake (Register, Prep, TransferToOR) needs a free room; emergency fast-track (TriageOverride, TransferToOR) does not. With OR3 occupied, one implementation hits the goal, so Admit(Maria) is feasible.</div>
<div class="mistake"><b>Common mistake:</b> requiring <i>every</i> implementation to work. That is the demonic test; for HLAs, one good implementation is enough.</div>`,
  cards: [
    ["High-level action (HLA)", "An action that can be carried out in more than one way, e.g. Go(Home, SFO)."],
    ["Refinement", "One way to carry out an HLA: a sequence of (possibly high-level) steps."],
    ["Implementation", "A refinement made only of primitive, executable actions."],
    ["Hierarchical cost", "About r^((d−1)/(k−1)) instead of bᵈ: roughly the k-th root of flat search."],
    ["Downward refinement property", "If a high-level plan claims success, some implementation really succeeds."],
    ["REACH(s, h)", "States that some implementation of h can reach from s."],
    ["Angelic vs demonic", "Agent chooses: one success is enough / Adversary chooses: all must succeed."],
    ["REACH⁻ and REACH⁺", "Pessimistic (certain) and optimistic (possible) bounds on the reachable set."],
    ["Angelic search", "Prune provable failures, commit to provable successes, refine only what's uncertain."]
  ],
  check: { q: "REACH⁺ meets the goal but REACH⁻ does not. What should the planner do?",
    options: ["Prune the plan", "Commit to the plan", "Refine the plan further", "Switch to flat search"], answer: 2,
    why: "The plan might work but is not certain, so refine to find out. Prune only if even REACH⁺ misses; commit only if REACH⁻ hits." },
  mcq: [
    { q: "A high-level plan achieves the goal if…", options: ["every implementation achieves it", "at least one implementation achieves it", "it has no primitive actions", "REACH⁻ = REACH⁺"], answer: 1,
      fb: ["That is the demonic test.", "Correct: the agent picks the implementation.", "Plans must end in primitives.", "Equal bounds are not required."] },
    { q: "Flat search with b = 10, d = 7 versus a hierarchy with r = 2, k = 3. The hierarchy explores about…", options: ["10,000,000", "70", "8", "1"], answer: 2,
      fb: ["That is flat search.", "Not the formula.", "Correct: 2^((7−1)/(3−1)) = 2³ = 8.", "Too few."] },
    { q: "Which is an implementation of Go(Home, SFO)?", options: ["[Go(Home, SFO)]", "[Drive(Home, SFOLongTermParking), Shuttle(SFOLongTermParking, SFO)]", "[Admit(Maria)]", "[Act]"], answer: 1,
      fb: ["Still high level.", "Correct: all primitive.", "Unrelated HLA.", "The top-level HLA."] },
    { q: "REACH(s, Go(SFO, NY)) = {At(NY)}, Goal = {At(Boston)}. Conclusion?", options: ["Feasible", "Infeasible: REACH ∩ Goal = ∅", "Need to refine", "Need sensors"], answer: 1,
      fb: ["The sets do not overlap.", "Correct: prune it.", "Exact REACH already decides it.", "This is about reachability, not observation."] },
    { q: "Why is Admit(Maria) feasible even though OR3 is occupied?", options: ["Every refinement works", "The fast-track refinement reaches the goal", "Occupied rooms are ignored", "HLAs never fail"], answer: 1,
      fb: ["The scheduled intake fails.", "Correct: one successful implementation is enough.", "The scheduled intake checks the room.", "HLAs can fail when no implementation works."] }
  ]
},
{
  id: "s115", kind: "section", part: "p1", slides: [58, 71],
  label: "11.5", title: "Planning in Nondeterministic Domains",
  blurb: "Belief states, sensorless planning and the coercion trick, conditional effects, contingent plans, online planning and execution monitoring.",
  learn: `
<h3>1. From classical to online planning</h3>
<p><b>Classical</b>: one known state, one fixed plan. <b>Sensorless</b>: the state is uncertain and there are no sensors. <b>Contingent</b>: there are sensors, and the plan branches on what is observed. <b>Online</b>: act, observe, repair.</p>
<h3>2. Belief states</h3>
<p>A <b>belief state</b> is the set of every world that might be real. The closed-world assumption must go: an unlisted fact is now <b>unknown</b>, not false. Paint example: <span class="f">b₀ = {s₁: Color(Can1, Red), s₂: Color(Can1, Blue)}</span>.</p>
<h3>3. Sensorless planning and coercion</h3>
<p>Apply the RESULT rule to <b>every</b> world at once. <span class="f">Paint(Chair, Can1)</span> then <span class="f">Paint(Table, Can1)</span> leaves the chair and table the same colour in every world, so the goal holds even though the agent never learns the colour. This is <b>coercion</b>: choose actions that make the goal true whatever the hidden fact is.</p>
<h3>4. Conditional effects</h3>
<div class="rule"><span class="f">Suck, EFFECT: when AtL: CleanL ∧ when AtR: CleanR</span></div>
<p>If the location is unknown, both outcomes must be kept: <span class="f">(AtL ∧ CleanL) ∨ (AtR ∧ CleanR)</span>. Chains of such actions can make belief states grow exponentially. The fix is to prefer plans that keep beliefs small: Left, Suck, Right, Suck.</p>
<h3>5. Contingent plans</h3>
<p>A <b>percept schema</b>, e.g. <span class="f">Percept(Color(x, c), PRE: Object(x) ∧ InView(x))</span>, models the sensors. A contingent plan can branch:</p>
<div class="rule"><span class="f">[LookAt(Table), LookAt(Chair), if Color(Table, c) ∧ Color(Chair, c) then NoOp else […]]</span></div>
<p>The full paint plan has three layers of fallback: look first; if a can matches one piece, paint only the other; use coercion only as a last resort.</p>
<h3>6. Online planning and execution monitoring</h3>
<ul><li><b>Action monitoring</b>: check that the next action's preconditions still hold. Catches trouble at the last moment.</li>
<li><b>Plan monitoring</b>: check that the whole remaining plan still works. Catches trouble early, and notices good luck.</li>
<li><b>Goal monitoring</b>: ask whether there is now a better goal.</li></ul>
<p>Retrying works for a patchy coat of paint; an empty can needs the model to be updated.</p>
<div class="ng"><div class="ng-h">Northgate: why no coercion</div>Paint's goal is indifferent to the hidden colour. Maria's goal is “treat what she actually has”: operating helps appendicitis but harms gastroenteritis. No single action is right for every diagnosis, so the plan must <b>sense first</b>: <span class="f">[OrderCTScan(Maria), if Diagnosis(Maria, Appendicitis) then [surgery] else [Prescribe(Antibiotics), Discharge(Maria)]]</span>.</div>
<div class="mistake"><b>Common mistake:</b> using a sensorless plan when the right action depends on the hidden fact. Coercion is safe only when the goal does not depend on it.</div>`,
  cards: [
    ["Belief state", "The set of all worlds that might be real; an unlisted fact is unknown, not false."],
    ["Sensorless plan", "One action sequence that reaches the goal in every possible world."],
    ["Coercion", "Make the goal true whatever the hidden fact is (paint both from the same can)."],
    ["Conditional effect", "when Cond: Effect — the effect depends on the state; it can blow up belief states."],
    ["Percept schema", "The planner's model of its sensors: what it perceives, under which preconditions."],
    ["Contingent plan", "A plan with if-then-else branches on observations."],
    ["Online planning", "Act, observe, repair, continue toward the same goal."],
    ["Action / plan / goal monitoring", "Check the next step / the rest of the plan / whether a better goal exists."]
  ],
  check: { q: "Why can a sensorless plan solve the paint problem but not Maria's treatment?",
    options: ["Paint has fewer actions", "Any matching colour satisfies the paint goal, but the right treatment depends on the hidden diagnosis", "Hospitals have no sensors", "Belief states cannot contain diseases"], answer: 1,
    why: "Coercion works only when the goal is indifferent to the hidden fact. When it is not, the agent must sense first." },
  mcq: [
    { q: "In a belief state, a fact that is not listed is…", options: ["false", "true", "unknown", "an error"], answer: 2,
      fb: ["That is the closed-world view of 11.1.", "Nothing makes it true.", "Correct.", "Belief states are normal."] },
    { q: "b₀ = {Can1 = Red, Can1 = Blue}. After Paint(Chair, Can1), how many worlds?", options: ["1", "2", "4", "0"], answer: 1,
      fb: ["The colour is still unknown.", "Correct: one per can colour, each with the chair painted that colour.", "No new uncertainty is added.", "Painting is applicable in both."] },
    { q: "Which monitoring level notices that there is too little red paint before painting the chair?", options: ["Action monitoring", "Plan monitoring", "Goal monitoring", "None"], answer: 1,
      fb: ["It checks only the next action.", "Correct: it checks the whole remaining plan.", "That asks about better goals.", "Plan monitoring catches it."] },
    { q: "Suck has EFFECT: when AtL: CleanL ∧ when AtR: CleanR, and the location is unknown. After Suck…", options: ["CleanL ∧ CleanR", "(AtL ∧ CleanL) ∨ (AtR ∧ CleanR)", "Nothing changes", "AtL ∧ AtR"], answer: 1,
      fb: ["Only one square is cleaned.", "Correct: keep both possibilities.", "One square is cleaned.", "The robot is in one place."] },
    { q: "The first step of Maria's safe contingent plan is…", options: ["Operate", "Prescribe antibiotics", "Order a CT scan", "Discharge"], answer: 2,
      fb: ["That may harm her.", "Wrong if she has appendicitis.", "Correct: gather information first.", "Premature."] }
  ]
},
{
  id: "s116", kind: "section", part: "p1", slides: [72, 83],
  label: "11.6", title: "Time, Schedules and Resources",
  blurb: "Plan first, schedule later: job-shop problems, the critical path method, slack, resource constraints, aggregation and the minimum-slack heuristic, from car assembly to operating rooms.",
  learn: `
<h3>1. What classical planning leaves out</h3>
<p>Time (when actions start and how long they take) and shared <b>resources</b>. The usual approach is to <b>plan first, schedule later</b>.</p>
<h3>2. A job-shop problem</h3>
<div class="rule"><span class="f">Job 1: AddEngine1 ≺ AddWheels1 ≺ Inspect1</span> · <span class="f">Job 2: AddEngine2 ≺ AddWheels2 ≺ Inspect2</span><br>Resources: EngineHoists(1), WheelStations(1), Inspectors(2), LugNuts(500)</div>
<p><span class="f">A ≺ B</span> means A must finish before B starts. Writing <span class="f">Inspectors(2)</span> instead of two named people is <b>aggregation</b>: it keeps the problem small and makes capacity checks instant.</p>
<h3>3. The critical path method</h3>
<div class="rule"><span class="f">ES(Start) = 0</span> · <span class="f">ES(B) = max over A ≺ B of ES(A) + Dur(A)</span> · <span class="f">Slack = LS − ES</span></div>
<p>ES is the earliest start, LS the latest start that does not delay the project. <b>Zero slack</b> means the action is on the <b>critical path</b>: any delay there delays everything.</p>
<div class="ex"><div class="ex-h">Two cars, no resource limits</div>Car 1: engine 0–30, wheels 30–60, inspect 60–70 (slack 15 each). Car 2: engine 0–60, wheels 60–75, inspect 75–85 (slack 0: critical). Makespan 85, but both engines use the single hoist at time 0.</div>
<h3>4. Resources make it hard</h3>
<div class="rule"><span class="f">Start(A) + Dur(A) ≤ Start(B) &nbsp; OR &nbsp; Start(B) + Dur(B) ≤ Start(A)</span></div>
<p>Each shared resource adds an either-or choice, and these choices multiply: scheduling with resources is <b>NP-hard</b>. With the hoist constraint the best schedule takes <b>115</b> minutes (engine 1 first). The <b>minimum-slack heuristic</b> (schedule the ready action with least slack first, like MRV in CSPs) gives engine 2 the hoist first and finishes at <b>130</b>: fast, but not optimal.</p>
<div class="ng"><div class="ng-h">Northgate: two patients</div>Maria: prep 20, surgery 45, check 10. David: prep 20, surgery 60, check 10. With two ORs and two nurses both finish by 90 (David's path is critical; Maria has 15 minutes of slack). But there is <b>one anesthesiologist</b>: the surgeries cannot overlap, and the best finish is 135 in either order. The rooms were never the bottleneck. Find what is actually scarce first.</div>
<div class="mistake"><b>Common mistake:</b> assuming the greedy heuristic is optimal. Minimum slack gives 130 on the cars, while the optimum is 115.</div>`,
  cards: [
    ["Plan first, schedule later", "Decide what to do, then add durations and resource limits."],
    ["A ≺ B", "A must finish before B starts."],
    ["Aggregation", "Count interchangeable resources (Inspectors(2)) instead of naming each one."],
    ["ES / LS", "Earliest start / latest start without delaying the project."],
    ["Slack", "LS − ES. Zero slack = on the critical path."],
    ["Critical path", "The longest chain of dependent actions; it sets the makespan."],
    ["Resource constraint", "A before B OR B before A: either-or choices make scheduling NP-hard."],
    ["Minimum-slack heuristic", "Schedule the least-slack ready action first; fast, not guaranteed optimal."]
  ],
  check: { q: "Without resource limits, which car's steps have zero slack?",
    options: ["Car 1", "Car 2", "Both", "Neither"], answer: 1,
    why: "Car 2's chain (60 + 15 + 10 = 85) sets the makespan; Car 1 (30 + 30 + 10 = 70) has 15 minutes of slack." },
  mcq: [
    { q: "ES(AddEngine1) = 0 and Dur = 30. ES(AddWheels1) = ?", options: ["0", "15", "30", "60"], answer: 2,
      fb: ["The engine must finish first.", "That is the slack.", "Correct: 0 + 30.", "That is the wheels' finish time."] },
    { q: "An action has ES = 30 and LS = 45. Its slack is…", options: ["0", "15", "45", "75"], answer: 1,
      fb: ["It is not critical.", "Correct: LS − ES.", "That is LS.", "That is LS + ES."] },
    { q: "Why does one engine hoist make the schedule harder to compute?", options: ["It adds durations", "It adds an either-or choice between the two engines", "It removes ordering constraints", "It changes the goal"], answer: 1,
      fb: ["Durations were already there.", "Correct: disjunctions make the problem NP-hard.", "Orderings remain.", "The goal is unchanged."] },
    { q: "With one anesthesiologist, the earliest both Northgate pathways can finish is…", options: ["90", "105", "135", "155"], answer: 2,
      fb: ["That ignores the shared specialist.", "That is only the two surgeries back to back.", "Correct: 20 + 45 + 60 + 10.", "Too late."] },
    { q: "Writing Inspectors(2) rather than Inspector(Ann) and Inspector(Bob) is called…", options: ["Abstraction", "Aggregation", "Decomposition", "Grounding"], answer: 1,
      fb: ["Abstraction merges states.", "Correct.", "Decomposition splits goals.", "Grounding substitutes constants."] }
  ]
},
{
  id: "s117", kind: "section", part: "p1", slides: [84, 89],
  label: "11.7", title: "Analysis of Planning Approaches",
  blurb: "Why planning is combinatorially hard, why planners still win by exploiting structure, portfolio planning, and where planning leads next.",
  learn: `
<h3>1. Why planning is hard</h3>
<p>Each fact can be true or false independently, so n facts give up to <span class="f">2ⁿ</span> states: 10 facts give about 1,000 states, 30 facts about a billion, and 300 facts more than there are atoms in the universe. Large Air Cargo faces about 2000⁴¹ nodes. Combinatorial explosion is the default, not the exception.</p>
<h3>2. Why planners still win: structure</h3>
<p>Every technique in the chapter exploits structure rather than raw computing power:</p>
<ul><li>a <b>factored representation</b> (11.1)</li><li><b>goal-directed search</b> (11.2)</li><li><b>relaxed heuristics</b> (11.3)</li><li><b>abstraction and decomposition</b> (11.3)</li><li><b>hierarchy</b> (11.4)</li></ul>
<p>The biggest lever is <b>independent subproblems</b>: full decomposition gives an exponential speed-up. <b>Negative interactions</b>, where one action undoes another's progress, break independence. SAT planners encode them in logic; forward search handles them with heuristics.</p>
<h3>3. Portfolio planning</h3>
<p>No single planner wins everywhere. <b>Portfolio planning</b> runs several planners, in sequence or in parallel, and keeps the best answer. Fast Downward Stone Soup is a well-known example.</p>
<h3>4. Where planning leads</h3>
<ul><li>Known effects → probabilities on outcomes: <b>MDPs</b> (Chapter 16).</li>
<li>Belief states → probabilistic beliefs: <b>POMDPs</b> (Chapter 16).</li>
<li>A given model → learning how to act from experience: <b>reinforcement learning</b> (Chapter 23).</li></ul>
<h3>5. Same toolkit, two worlds</h3>
<table class="mini"><tr><th>Idea</th><th>Air Cargo</th><th>Northgate</th></tr>
<tr><td>RESULT rule</td><td>Fly moves a plane</td><td>TransferToOR moves a patient</td></tr>
<tr><td>Relaxation</td><td>ignore Load's deletes</td><td>ignore TransferToOR's deletes</td></tr>
<tr><td>HLAs</td><td>Go(Home, SFO)</td><td>Admit(Maria)</td></tr>
<tr><td>Belief states</td><td>coercion works for paint</td><td>diagnosis needs sensing</td></tr>
<tr><td>Scheduling</td><td>one engine hoist</td><td>one anesthesiologist</td></tr></table>
<div class="mistake"><b>Common mistake:</b> concluding that planning is impractical because it is hard in the worst case. Real problems have structure, and planners exploit it.</div>`,
  cards: [
    ["2ⁿ states", "n independent true/false facts give up to 2ⁿ states."],
    ["Exploit structure", "Factored states, goal-directed search, relaxations, abstraction, decomposition, hierarchy."],
    ["Independent subproblems", "Full decomposition gives an exponential speed-up."],
    ["Negative interaction", "One action undoes another's progress, breaking independence."],
    ["Portfolio planning", "Run several planners and keep the best answer (e.g. Fast Downward Stone Soup)."],
    ["MDP / POMDP", "Planning with probabilistic outcomes / with probabilistic beliefs (Chapter 16)."],
    ["Reinforcement learning", "Learning how to act from experience when no model is given (Chapter 23)."]
  ],
  check: { q: "A domain has 30 independent true/false facts. Roughly how many states?",
    options: ["30", "900", "About a billion", "2³⁰⁰"], answer: 2,
    why: "2³⁰ ≈ 1.07 billion. 30 and 900 are linear and quadratic; 2³⁰⁰ is the 300-fact case." },
  mcq: [
    { q: "What do factored states, relaxed heuristics and hierarchy have in common?", options: ["They all use SAT solvers", "They all exploit problem structure", "They all remove the goal", "They all need sensors"], answer: 1,
      fb: ["Only SATPlan does.", "Correct.", "They keep the goal.", "Sensors are a 11.5 topic."] },
    { q: "Which interaction breaks the speed-up from decomposition?", options: ["Independent subgoals", "Negative interactions", "Symmetry", "Abstraction"], answer: 1,
      fb: ["Independence enables the speed-up.", "Correct.", "Symmetry helps pruning.", "Abstraction is a heuristic tool."] },
    { q: "Fast Downward Stone Soup is an example of…", options: ["Hierarchical planning", "Portfolio planning", "Contingent planning", "Critical path scheduling"], answer: 1,
      fb: ["Not an HTN planner.", "Correct.", "Not about sensing.", "Not a scheduler."] },
    { q: "Which later topic attaches probabilities to action outcomes?", options: ["Reinforcement learning", "MDPs", "Partial-order planning", "PDDL"], answer: 1,
      fb: ["RL learns the model or policy from experience.", "Correct: Chapter 16.", "Not probabilistic.", "PDDL is deterministic."] },
    { q: "Which comparison shows the one real difference between Air Cargo and Northgate?", options: ["RESULT rule", "Relaxation", "Belief states", "Scheduling"], answer: 2,
      fb: ["Identical equation.", "Same code.", "Correct: coercion works for paint, but diagnosis needs sensing.", "Same bottleneck maths."] }
  ]
},
{
  id: "wrap", kind: "section", part: "p1", slides: [90, 93],
  label: "End", title: "Wrap-Up and Review",
  blurb: "Planning = representation + search + structure. A recap of the chapter and three closing questions that tie 11.1, 11.3 and 11.5 together.",
  learn: `
<h3>1. Planning = representation + search + structure</h3>
<ul><li><b>Representation:</b> factored states and action schemas let a computer reason about a domain instead of searching it blindly.</li>
<li><b>Search:</b> forward, backward and logic-based search are all possible because the representation is a description, not a program.</li>
<li><b>Structure:</b> heuristics, abstraction, decomposition and hierarchy defeat exponential state spaces in practice.</li></ul>
<h3>2. What you should be able to explain</h3>
<table class="mini"><tr><th>Area</th><th>Key ideas</th></tr>
<tr><td>Representation</td><td>Init, actions, goal; states as sets of facts; preconditions, add and delete lists; RESULT</td></tr>
<tr><td>Algorithms</td><td>forward, backward, SAT, partial-order</td></tr>
<tr><td>Scaling</td><td>relaxed heuristics, abstraction, decomposition, hierarchy</td></tr>
<tr><td>Beyond classical</td><td>belief states, contingent and online plans, scheduling with time and resources</td></tr></table>
<h3>3. Three closing questions</h3>
<div class="ex"><div class="ex-h">1 · §11.1</div>When does the closed-world assumption work, and when does it become unrealistic? <i>It works when records are complete; it fails when facts can genuinely be unknown.</i></div>
<div class="ex"><div class="ex-h">2 · §11.3</div>Why is ignoring delete lists a closer estimate than ignoring preconditions? <i>It keeps the preconditions, so the relaxed plan still does the real work of making actions legal.</i></div>
<div class="ex"><div class="ex-h">3 · §11.5</div>Why must the closed-world assumption go in belief states? <i>The planner tracks every possible world, so an unlisted fact means unknown, not false.</i></div>
<p>Real systems built on these ideas include NASA's Remote Agent, Hitachi's O-PLAN factory scheduler, Mars rover mission planning and modern logistics.</p>`,
  cards: [
    ["The one idea", "Planning = representation + search + structure."],
    ["Representation", "Factored states and action schemas: a description, not a program."],
    ["Search", "Forward, backward, SAT — all possible because PDDL is declarative."],
    ["Structure", "Heuristics, abstraction, decomposition and hierarchy beat exponential spaces."],
    ["Closed world vs belief state", "Unlisted = false / unlisted = unknown."],
    ["Domain independence", "The same algorithms and code for cargo and for patient care."]
  ],
  check: { q: "Which statement best summarizes Chapter 11?",
    options: ["Planning is search with a bigger computer", "Planning = representation + search + structure", "Planning needs a human heuristic per domain", "Planning only works for toy problems"], answer: 1,
    why: "The chapter's throughline: a declarative representation enables many search methods, and structure makes them scale." },
  mcq: [
    { q: "A hospital's records are incomplete. Which assumption becomes unrealistic?", options: ["Determinism", "The closed-world assumption", "Discreteness", "Admissibility"], answer: 1,
      fb: ["Not about missing records.", "Correct: unlisted facts may be unknown, not false.", "Not about time steps.", "A heuristic property."] },
    { q: "Ignoring delete lists beats ignoring preconditions because…", options: ["it is not admissible", "it keeps preconditions, so actions must still be made legal", "it deletes the goal", "it uses SAT"], answer: 1,
      fb: ["Both are relaxations; admissibility is not the reason.", "Correct.", "Nonsense.", "Unrelated."] },
    { q: "Which pairing is correct?", options: ["Regression — searches from Init", "SATPlan — one action per step, increase k if UNSAT", "Coercion — sense first", "Slack — ES + LS"], answer: 1,
      fb: ["Regression starts from the goal.", "Correct.", "Coercion avoids sensing.", "Slack = LS − ES."] },
    { q: "Which real system used serializable subgoals to fly a spacecraft?", options: ["O-PLAN", "Remote Agent", "FF", "Stone Soup"], answer: 1,
      fb: ["O-PLAN scheduled a factory.", "Correct: Deep Space One, 1999.", "A classical planner.", "A planner portfolio."] },
    { q: "REACH(s, h) ∩ Goal ≠ ∅ means…", options: ["Every implementation works", "Some implementation reaches the goal", "The goal is unreachable", "The agent needs sensors"], answer: 1,
      fb: ["That is the demonic reading.", "Correct: angelic semantics.", "The opposite.", "Unrelated."] }
  ]
}
);
