/* CS650 Week 11 lab v3 — modules 1–4: Introduction, 11.1, 11.2, 11.3.
   "learn" is the Read pamphlet; cards, check and mcq follow. Slide ranges match the v3 deck. */
window.LAB_MODULES = window.LAB_MODULES || [];
(function () {
const K = window.PK, f = K.f, ck = K.chip;

window.LAB_MODULES.push(
/* ======================================================================= */
{
  id: "intro", kind: "section", part: "p1", slides: [1, 8],
  label: "Start", title: "Welcome: You Already Know How to Plan",
  blurb: "What planning is, the two worlds we use all chapter (Air Cargo and Northgate General), and the logic symbols from Chapters 7–10 that you will read and write.",
  learn: K.top("Intro", "You Already Know How to Plan", 10, ["say what an automated planner does, in one sentence", "name the two running examples and their objects", "read the symbols ¬ ∧ ∨ ⇒ ∀ ∃ and a fact like At(C2, JFK) out loud"]) + `
<h3>1. A plan is a recipe you can check before you cook</h3>
<p>Every morning you plan without noticing: find the keys, then lock the door, then walk to the bus. The <b>order</b> matters (you can't lock the door before you find the keys), and you can check the plan in your head <b>before</b> doing anything.</p>
${K.big(`An automated planner does exactly this for a computer: given <b>where we are</b>, <b>what we want</b>, and <b>what actions are possible</b>, it finds a <b>sequence of actions</b> that gets from one to the other, and it can prove the sequence works before anything happens.`)}
${K.flow([["Where we are", "the start state"], ["What we can do", "action rules"], ["Planner", "searches", "hl"], ["The plan", "a checked list of actions", "ok"]])}
<h3>2. Why a whole new chapter?</h3>
<p>You have met two kinds of agent already, and each had a weakness:</p>
<ul><li><b>Search agents (Chapter 3)</b> were fast, but a <i>human</i> had to invent a new heuristic for every new problem (Manhattan distance for the 8-puzzle, straight-line distance for maps).</li>
<li><b>Logical agents (Chapter 7)</b> could reason, but needed the same rule written again for every time step and every square: thousands of nearly identical sentences.</li></ul>
<p>Planning keeps the best of both: it writes each kind of action <b>once</b>, as a template with variables, and it describes states as lists of named facts, which lets the computer <b>invent its own heuristics</b> (you'll see how in 11.3).</p>
<h3>3. Two worlds, all chapter long</h3>
<div class="two">
<div>${K.scene({ plane: "JFK", cargo: "JFK" }, "plane P2 and cargo C2 at JFK")}<p class="cap"><b>Air Cargo</b> (from the textbook). Cargo C1, C2; planes P1, P2; airports SFO and JFK. Actions: Load, Fly, Unload.</p></div>
<div class="ngpic"><div class="rooms"><span>PreOp</span><span>OR3</span><span>Recovery</span></div><div class="toks"><i class="t m">M</i><i class="t o">O</i><i class="t p">P</i></div><p class="cap"><b>Northgate General</b> (our hospital). Patient Maria Santos, surgeon Dr. Okafor, nurse Priya, operating room OR3.</p></div>
</div>
<p>The same planning program solves both. Only the names of things and the action rules change. That is what <b>domain-independent</b> means.</p>
<h3>4. The symbols you will read (Chapters 7–10)</h3>
<p>Planning is written in logic, so here is everything you need, each with how to say it out loud:</p>
${K.tbl ? "" : ""}<table class="sym"><thead><tr><th>Symbol</th><th>Say it as</th><th>Example</th><th>Meaning of the example</th></tr></thead><tbody>
<tr><td>${f("¬")}</td><td>not</td><td>${f("¬At(P2, SFO)")}</td><td>plane P2 is not at SFO</td></tr>
<tr><td>${f("∧")}</td><td>and</td><td>${f("At(C2, JFK) ∧ At(P2, JFK)")}</td><td>both are true</td></tr>
<tr><td>${f("∨")}</td><td>or</td><td>${f("Rain ∨ Snow")}</td><td>at least one is true</td></tr>
<tr><td>${f("⇒")}</td><td>implies, “if … then …”</td><td>${f("Fever ⇒ Test")}</td><td>whenever Fever is true, Test is true</td></tr>
<tr><td>${f("⇔")}</td><td>if and only if</td><td>${f("Open ⇔ Unlocked")}</td><td>both true or both false</td></tr>
<tr><td>${f("∀x")} / ${f("∃x")}</td><td>for every x / there is some x</td><td>${f("∀p Patient(p) ⇒ Chart(p)")}</td><td>every patient has a chart</td></tr>
<tr><td>${f("At(C2, JFK)")}</td><td>“At, C2, JFK”</td><td>a <b>fact</b></td><td>cargo C2 is at JFK</td></tr>
<tr><td>${f("{x/C2}")}</td><td>x becomes C2</td><td>a <b>substitution</b></td><td>replace every x with C2</td></tr>
<tr><td>${f("∈")} / ${f("⊂")}</td><td>is a member of / is a subset of</td><td>${f("Maria ∈ Patients")}</td><td>Maria is one of the patients</td></tr>
</tbody></table>
${K.plain(`<b>Capital letters</b> are specific things or relations: ${f("C2")}, ${f("JFK")}, ${f("At")}. <b>Lower-case letters</b> are variables, blanks waiting to be filled: ${f("c")}, ${f("p")}, ${f("from")}.`)}
${K.watch(`${f("P ⇒ Q")} does <b>not</b> mean “P causes Q”. It is only false in one situation: P true and Q false.`)}
${K.tryit("Read this out loud and say what it means: ¬At(C2, SFO) ∧ At(P2, JFK)", "“Not At C2 SFO, and At P2 JFK”: cargo C2 is not at SFO, and plane P2 is at JFK.")}
<h3>5. How to use this lab</h3>
${K.flow([["Watch", "narrated video"], ["Read", "this pamphlet"], ["Step by step", "trace the algorithms"], ["Flip cards", "key terms"], ["MCQs", "with feedback"], ["Try it", "write and run plans"]])}
${K.recap(["A plan is a sequence of actions you can check before acting.", "Planning writes each action once, with variables, and describes states as lists of facts.", "Capitals are constants; lower-case are variables; ¬ ∧ ∨ ⇒ are not / and / or / implies."])}`,
  cards: [
    ["Plan", "A sequence of actions that takes you from the start to the goal, checked before acting."],
    ["Action schema", "One template with variables, e.g. Fly(p, from, to), standing for every specific flight."],
    ["Factored state", "A state written as a list of named facts, e.g. {At(C2, JFK), At(P2, JFK)}."],
    ["Domain-independent planner", "The same program solves any domain; only the objects and action rules change."],
    ["¬  ∧  ∨", "not · and · or"],
    ["P ⇒ Q", "If P then Q. False only when P is true and Q is false."],
    ["∀x / ∃x", "For every x / there is at least one x."],
    ["θ = {x/C2}", "A substitution: replace every x with C2."]
  ],
  check: { q: "Which idea lets a planner compute its own heuristics instead of waiting for a human to write one?", options: ["Describing states as lists of named facts", "Using bigger computers", "Writing a separate rule for every time step", "Searching only backward"] },
  mcq: [
    { q: "Which symbol means “and”?", options: ["¬", "∧", "∨", "⇒"] },
    { q: "When is P ⇒ Q false?", options: ["When P is false", "When Q is true", "When P is true and Q is false", "When both are false"] },
    { q: "In Fly(p, from, to), which part is a variable?", options: ["Fly", "SFO", "from", "P1"] },
    { q: "What does ¬At(P2, SFO) say?", options: ["P2 is at SFO", "P2 is not at SFO", "SFO is not a plane", "P2 might be at SFO"] },
    { q: "Maria ∈ SurgicalPatients and SurgicalPatients ⊂ Patients. What follows?", options: ["Patients ⊂ Maria", "Maria ∈ Patients", "SurgicalPatients ∈ Maria", "Nothing"] }
  ]
},

/* ======================================================================= */
{
  id: "s111", kind: "section", part: "p1", slides: [9, 30],
  label: "11.1", title: "Defining Classical Planning",
  blurb: "How to write a planning problem down so precisely that a computer can solve it: facts, states, Init and Goal, action schemas, and RESULT.",
  learn: K.top("11.1", "Writing a Planning Problem Down", 18, ["describe a state as a set of facts, and explain the closed-world assumption", "read an action schema and ground it with a substitution", "decide whether an action is applicable", "compute RESULT(s, a) by striking out deletes and adding adds"]) + `
<h3>1. The four simplifying assumptions</h3>
<p>Classical planning starts with a simple world, the way physics starts with frictionless surfaces:</p>
<table class="sym"><thead><tr><th>Assumption</th><th>In plain words</th><th>Everyday example that breaks it</th></tr></thead><tbody>
<tr><td>Fully observable</td><td>we know every relevant fact at the start</td><td>you don't know if the milk has gone off</td></tr>
<tr><td>Deterministic</td><td>each action has exactly one result</td><td>a coin flip</td></tr>
<tr><td>Discrete steps</td><td>the world changes in separate steps</td><td>water slowly filling a bath</td></tr>
<tr><td>Static</td><td>nothing changes while the agent thinks</td><td>a traffic light changing while you decide</td></tr></tbody></table>
<p>Section 11.5 relaxes some of these. For now, keep the world simple.</p>

<h3>2. A state is a list of true facts</h3>
${K.fig(K.scene({ plane: "JFK", cargo: "JFK" }) + `<div class="ckrow">${K.chips(["At(C2, JFK)", "At(P2, JFK)"])}</div>`, "The picture and the facts say the same thing. The computer only ever sees the facts.")}
<p>A <b>fact</b> (also called a fluent or ground atom) is a true sentence with no variables, like ${f("At(C2, JFK)")}. A <b>state</b> is simply the set of facts that are true right now: ${f("{ At(C2, JFK), At(P2, JFK) }")}.</p>
${K.analogy(`<b>An attendance list.</b> If your name isn't on the list, you weren't in class. Planning uses the same rule, the <b>closed-world assumption</b>: any fact not listed is <b>false</b>. So the state above also tells us ${f("¬At(P2, SFO)")}, ${f("¬In(C2, P2)")} and ${f("¬At(C2, SFO)")} without writing them.`)}
${K.watch(`A state never contains variables. ${f("At(c, JFK)")} is not a fact; it is a pattern.`)}

<h3>3. Init and Goal</h3>
<div class="rule">${f("Init( At(C2, JFK) ∧ At(P2, JFK) )")} &nbsp; ${f("Goal( At(C2, SFO) )")}</div>
<p><b>Init</b> lists every fact true at the start. <b>Goal</b> lists only the facts we care about at the end. The goal above says nothing about the plane, so a final state with the plane at SFO and one with the plane back at JFK are <b>both</b> goal states. The goal is a <b>partial</b> description.</p>
${K.tryit("Is { At(C2, SFO), At(P2, JFK) } a goal state for Goal( At(C2, SFO) )?", "Yes. It contains At(C2, SFO). Extra facts don't matter.")}

<h3>4. Action schemas: one recipe, many actions</h3>
${K.analogy(`A schema is like a <b>function definition</b> in code: ${f("Load(c, p, a)")} has three parameters. Calling it with real arguments, ${f("Load(C2, P2, JFK)")}, gives one concrete action.`)}
<div class="anat">
<div class="code">Action( Load(c, p, a),<br>&nbsp; PRECOND: At(c, a) ∧ At(p, a)<br>&nbsp; EFFECT: &nbsp;¬At(c, a) ∧ In(c, p) )</div>
<div class="anat-n"><div><b>Name + parameters</b>: which cargo, which plane, which airport.</div><div><b>PRECOND</b>: what must be true <i>before</i>: cargo and plane at the same airport.</div><div><b>EFFECT</b>: what changes. Facts with ¬ form the <span class="del-t">DELETE list</span> (stop being true); the rest form the <span class="add-t">ADD list</span> (become true).</div></div>
</div>
<p>The three Air Cargo schemas:</p>
<table class="sym"><thead><tr><th>Schema</th><th>Needs</th><th>Deletes</th><th>Adds</th></tr></thead><tbody>
<tr><td>${f("Load(c, p, a)")}</td><td>At(c,a), At(p,a)</td><td>At(c,a)</td><td>In(c,p)</td></tr>
<tr><td>${f("Fly(p, from, to)")}</td><td>At(p,from)</td><td>At(p,from)</td><td>At(p,to)</td></tr>
<tr><td>${f("Unload(c, p, a)")}</td><td>In(c,p), At(p,a)</td><td>In(c,p)</td><td>At(c,a)</td></tr></tbody></table>

<h3>5. Grounding: fill in the blanks</h3>
${K.flow([["Load(c, p, a)", "schema"], ["{c/C2, p/P2, a/JFK}", "substitution", "hl"], ["Load(C2, P2, JFK)", "one ground action", "ok"]])}
<p>The substitution replaces each variable <b>everywhere</b>, including the precondition, which becomes ${f("At(C2, JFK) ∧ At(P2, JFK)")}. With one cargo, one plane and two airports there are 2 Loads, 2 Unloads and 2 Flys: <b>six ground actions</b>. Real problems have thousands, which is why we write schemas.</p>

<h3>6. Is an action applicable?</h3>
<p>An action is <b>applicable</b> in state s when <b>every</b> precondition fact is in s.</p>
<table class="sym"><thead><tr><th>Action</th><th>Needs</th><th>In the start state?</th></tr></thead><tbody>
<tr><td>Load(C2, P2, JFK)</td><td>At(C2,JFK), At(P2,JFK)</td><td><span class="vk">✓ ✓ applicable</span></td></tr>
<tr><td>Fly(P2, JFK, SFO)</td><td>At(P2,JFK)</td><td><span class="vk">✓ applicable</span></td></tr>
<tr><td>Unload(C2, P2, SFO)</td><td>In(C2,P2), At(P2,SFO)</td><td><span class="vx">✗ ✗ not applicable</span></td></tr></tbody></table>

<h3>7. RESULT: strike out, then add</h3>
<div class="rule">${f("RESULT(s, a) = (s − DEL(a)) ∪ ADD(a)")} &nbsp; “take the state, remove what the action deletes, add what it adds”</div>
<p>Run the whole plan and watch the fact cards:</p>
<div class="steps3">
<div>${K.scene({ plane: "JFK", cargo: "in" })}<div class="st-t">1 · Load(C2, P2, JFK)</div>${K.chips([["At(C2, JFK)", "del"], "At(P2, JFK)", ["In(C2, P2)", "add"]])}</div>
<div>${K.scene({ plane: "SFO", cargo: "in" })}<div class="st-t">2 · Fly(P2, JFK, SFO)</div>${K.chips(["In(C2, P2)", ["At(P2, JFK)", "del"], ["At(P2, SFO)", "add"]])}</div>
<div>${K.scene({ plane: "SFO", cargo: "SFO" })}<div class="st-t">3 · Unload(C2, P2, SFO)</div>${K.chips([["In(C2, P2)", "del"], "At(P2, SFO)", ["At(C2, SFO)", "add"]])}</div></div>
${K.plain(`Notice step 2: Fly never mentions the cargo, yet the cargo travels. That's because ${f("In(C2, P2)")} isn't in Fly's delete list, so it simply <b>stays</b>. Facts an action doesn't mention carry over unchanged. This one rule solves Chapter 7's “frame problem” for free.`)}
${K.tryit("s = {At(P2, JFK), At(C2, JFK)}. What is RESULT(s, Fly(P2, JFK, SFO))?", "{At(C2, JFK), At(P2, SFO)}. Fly deletes At(P2, JFK) and adds At(P2, SFO). The cargo wasn't loaded, so it stays at JFK.")}
${K.watch(`<b>Forgetting the delete list.</b> If Fly only said “add At(p, to)”, the plane would end up at JFK <i>and</i> SFO, and the planner would happily use that impossible state. Always ask: <i>what stops being true?</i>`)}

<h3>8. The same structure, other worlds</h3>
<div class="two">
<div><b>Spare tire.</b> Remove(Flat, Axle), Remove(Spare, Trunk), PutOn(Spare, Axle). The trap action <i>LeaveOvernight</i> is always applicable (precondition ⊤ = always true) but deletes every tire location: <b>applicable does not mean useful</b>.</div>
<div><b>Blocks world.</b> C sits on A, goal: A on B on C. You must first move C to the table, a step that achieves no goal fact directly but makes the others possible.
${K.tree(320, 150, { la: [80, 14, "start", "", "rep", 90], a: [55, 122, "A", "", "", 50], c: [55, 84, "C", "", "bad", 50], b: [115, 122, "B", "", "", 50], lg: [255, 14, "goal", "", "rep", 90], gC: [255, 122, "C", "", "", 50], gB: [255, 84, "B", "", "", 50], gA: [255, 46, "A", "", "ok", 50] }, [], 50, 36)}</div></div>
${K.ng(`Rooms instead of airports, a patient instead of cargo: Prep, TransferToOR, Operate, TransferToRecovery. When we ran a planner on our first model it reported <b>no plan</b>. Why? Operate needs the surgeon in the room, and no action ever moved Dr. Okafor. Adding a <b>ScrubIn(s, o)</b> schema fixed it. A planner that checks every precondition is also a great <b>bug finder</b> for your model.`)}
${K.recap(["A state is a set of true facts; anything unlisted is false.", "A schema has PRECOND (needed first) and EFFECT (DELETE list ¬… and ADD list).", "Applicable = every precondition is in the state.", "RESULT(s, a) = (s − DEL) ∪ ADD; untouched facts carry over."])}`,
  cards: [
    ["State", "The set of facts true right now, e.g. {At(C2, JFK), At(P2, JFK)}."],
    ["Closed-world assumption", "Any fact not listed in the state is false (like an attendance list)."],
    ["Goal (partial)", "Lists only the facts we care about; any state containing them is a goal state."],
    ["PRECOND", "Facts that must be true before the action can run."],
    ["DELETE list", "The ¬ facts in the EFFECT: they stop being true."],
    ["ADD list", "The positive facts in the EFFECT: they become true."],
    ["Grounding", "Replacing every variable with an object, e.g. {c/C2, p/P2, a/JFK}."],
    ["Applicable", "Every precondition of the action is in the current state."],
    ["RESULT(s, a)", "(s − DEL(a)) ∪ ADD(a): strike out the deletes, then add the adds."],
    ["Frame problem (solved)", "Facts an action doesn't mention simply carry over."]
  ],
  check: { q: "s = {At(P1, SFO), At(C2, JFK)}. What is RESULT(s, Fly(P1, SFO, JFK))?", options: ["{At(P1, JFK), At(C2, JFK)}", "{At(P1, SFO), At(P1, JFK), At(C2, JFK)}", "{At(P1, JFK)}", "{At(P1, SFO), At(C2, JFK)}"] },
  mcq: [
    { q: "Under the closed-world assumption, the state {At(C2, JFK)} says what about At(C2, SFO)?", options: ["It is true", "It is false", "It is unknown", "It is a variable"] },
    { q: "Which part of Load's EFFECT is the DELETE list?", options: ["In(c, p)", "¬At(c, a)", "At(p, a)", "At(c, a) ∧ At(p, a)"] },
    { q: "Start state {At(C2, JFK), At(P2, JFK)}. Which action is NOT applicable?", options: ["Load(C2, P2, JFK)", "Fly(P2, JFK, SFO)", "Unload(C2, P2, SFO)", "All are applicable"] },
    { q: "Why does the cargo travel when the plane flies, even though Fly never mentions cargo?", options: ["Fly secretly adds In(c, p)", "In(C2, P2) isn't deleted, so it carries over", "The goal moves it", "It doesn't travel"] },
    { q: "Ground Load(c, p, a) with {c/C1, p/P1, a/SFO}. Its precondition becomes…", options: ["At(c, a) ∧ At(p, a)", "At(C1, SFO) ∧ At(P1, SFO)", "In(C1, P1)", "At(C1, P1)"] },
    { q: "LeaveOvernight has precondition ⊤ and deletes every tire location. What does it teach?", options: ["Every applicable action helps", "Applicable does not mean useful", "Preconditions are optional", "Goals must be complete"] }
  ]
},

/* ======================================================================= */
{
  id: "s112", kind: "section", part: "p1", slides: [31, 57],
  label: "11.2", title: "Algorithms for Classical Planning",
  blurb: "Three ways to find the plan: search forward from the start, search backward from the goal, or translate everything into one big SAT problem. Plus planning graphs and partial-order plans.",
  learn: K.top("11.2", "How a Computer Finds the Plan", 20, ["draw the search tree for a small planning problem", "explain the frontier and reached set in breadth-first search", "regress a goal through an action and decide which actions are relevant", "explain how a SAT planner turns a plan into true/false variables"]) + `
<h3>1. Planning is search through a tree of states</h3>
<p>Picture every state as a box and every action as an arrow. Starting from Init, the arrows fan out into a <b>search tree</b>. Somewhere in that tree is a state containing the goal facts; the arrows on the path to it are the plan.</p>
${K.fig(K.tree(640, 320, {
  s0: [320, 30, "S0 start", "C2@JFK · P2@JFK", "", 150],
  s1: [160, 120, "S1", "C2 in P2 · P2@JFK", "", 150], s2: [480, 120, "S2", "C2@JFK · P2@SFO", "", 150],
  s3: [160, 205, "S3", "C2 in P2 · P2@SFO", "", 150], r: [480, 205, "back to S0", "repeat", "rep", 150],
  s4: [160, 290, "S4 goal", "C2@SFO · P2@SFO", "ok", 150] }, [["s0", "s1", "Load"], ["s0", "s2", "Fly"], ["s1", "s3", "Fly"], ["s2", "r", "Fly back", "rep"], ["s3", "s4", "Unload"]], 150, 44),
  "The whole search space of the one-cargo problem. (C2@JFK is short for At(C2, JFK).)")}
${K.analogy(`<b>A maze.</b> You can explore from the <b>entrance</b> (forward search), from the <b>exit</b> back toward the entrance (backward search), or write down the rules of the maze as a giant logic puzzle and let a puzzle-solver do it (SAT planning). This section covers all three.`)}

<h3>2. Forward search, one level at a time</h3>
<p><b>Breadth-first search</b> explores the tree level by level. It keeps two lists:</p>
<ul><li><b>Frontier</b>: states found but not yet expanded. A first-in, first-out waiting line.</li>
<li><b>Reached</b>: every state ever seen, so a repeated state is skipped instead of expanded again.</li></ul>
<p>Each round: take the first state out of the line, find every applicable action, compute each child with RESULT, test each child for the goal, and put new children at the back of the line.</p>
${K.flow([["Take", "the first state from the frontier"], ["Expand", "every applicable action"], ["Test", "is a child the goal?", "hl"], ["Queue", "new children join the back"]])}
<p>On the one-cargo problem breadth-first search expands S0, S1, <b>S2</b>, S3 and then finds S4. S2 (the plane flown empty to SFO) was wasted work: blind search has no idea which direction is promising. The <b>Step by step</b> tab walks through every expansion.</p>
<h3>3. Why blind forward search is hopeless on real problems</h3>
<table class="sym"><thead><tr><th>Branching factor b</th><th>Depth d</th><th>Leaves ≈ bᵈ</th></tr></thead><tbody>
<tr><td>2 (our toy)</td><td>3</td><td>8</td></tr><tr><td>4 (two-cargo swap)</td><td>6</td><td>4,096</td></tr>
<tr><td>2,000 (10 airports, 50 planes, 200 cargos)</td><td>41</td><td>≈ 10¹³⁵ — more than atoms in the universe</td></tr></tbody></table>
${K.plain(`Every level multiplies the work by the branching factor. Forward search only works with a <b>heuristic</b> that says which branch to try first. That is section 11.3.`)}

<h3>4. Backward search: “what could the last step have been?”</h3>
<p>Backward search starts from the goal. Instead of states, its nodes are <b>goal cards</b>: sets of facts that must be true. It asks which action could have come <b>last</b>, and only considers <b>relevant</b> actions:</p>
<div class="rule"><b>Relevant</b>: the action adds at least one goal fact <b>and</b> deletes none. &nbsp; <b>Regression</b>: ${f("g′ = (g − ADD(a)) ∪ PRECOND(a)")}</div>
${K.flow([["g₀", "At(C2,SFO)", "ok"], ["g₁", "In(C2,P2) · At(P2,SFO)"], ["g₂", "In(C2,P2) · At(P2,JFK)"], ["g₃ ⊆ Init ✓", "At(C2,JFK) · At(P2,JFK)", "ok"]])}
<p>Through Unload, then Fly, then Load. The plan is found last step first, so you read it bottom-up: Load, Fly, Unload.</p>
${K.analogy(`<b>Working backward from a deadline.</b> “To be at the airport at 5, I must leave home by 4. To leave by 4, I must be packed by 3:30.” Each step asks what must be true <i>just before</i>.`)}
${K.watch(`Relevant is not just “adds a goal fact”. Flying P2 out of SFO adds At(P2, JFK), but it <b>deletes</b> At(P2, SFO), which is on the goal card. It would destroy the goal, so it is rejected.`)}
${K.tryit("Goal card: In(C2, P2). Regress it through Load(C2, P2, JFK). What is the new goal card?", "{At(C2, JFK), At(P2, JFK)}: drop In(C2, P2) (Load achieves it), add Load's preconditions. Init satisfies it.")}

<h3>5. Planning as SAT: turn the plan into a logic puzzle</h3>
<p>Guess a length <b>k</b>. Make a true/false variable for every action at every time step (Load⁰, Fly¹, …) and every fact at every time step. Then write four kinds of rules:</p>
<table class="sym"><thead><tr><th>Rule</th><th>Example</th><th>Plain English</th></tr></thead><tbody>
<tr><td>Init and goal</td><td>${f("At(C2,JFK)⁰ ∧ At(C2,SFO)³")}</td><td>start facts at time 0, goal at time k</td></tr>
<tr><td>Action rules</td><td>${f("Fly¹ ⇒ At(P2,JFK)¹ ∧ At(P2,SFO)²")}</td><td>an action needs its preconditions now, causes its effects next</td></tr>
<tr><td>Frame axioms</td><td>${f("At(P2,SFO)² ⇔ Fly¹ ∨ (At(P2,SFO)¹ ∧ ¬FlyAway¹)")}</td><td>a fact changes only if an action changes it</td></tr>
<tr><td>Exclusion</td><td>${f("¬(Load⁰ ∧ Fly⁰)")}</td><td>clashing actions can't share a time step</td></tr></tbody></table>
<p>A SAT solver (DPLL from Chapter 7) either finds values for every variable (the true action cells <b>are</b> the plan) or says <b>unsatisfiable</b>: no plan of length k, try k + 1. For our problem k = 1 and 2 fail and k = 3 succeeds, so the first success is a shortest plan.</p>

<h3>6. Graphplan: what <i>might</i> be true at each level</h3>
<p>A <b>planning graph</b> alternates fact levels (S0, S1, …) and action levels (A0, A1, …). Facts are never removed from a level; new ones pile up. It also records <b>mutexes</b>: pairs that can't both happen at that level (Load and Fly at the same time; the plane at two airports). The first level where all goal facts appear with no mutex between them is a <b>lower bound</b> on the plan length. Here that is level 3, the true length.</p>

<h3>7. Partial-order plans</h3>
${K.fig(K.tree(420, 200, { s: [210, 24, "Start", "", "", 90], r1: [100, 100, "Remove(Flat, Axle)", "", "", 170], r2: [320, 100, "Remove(Spare, Trunk)", "", "", 170], p: [210, 176, "PutOn(Spare, Axle)", "", "ok", 170] }, [["s", "r1"], ["s", "r2"], ["r1", "p", "axle free"], ["r2", "p", "spare out"]], 120, 40), "Arrows mean “must come before”. The two Remove steps have no arrow between them, so either can go first.")}
<p>Only the orderings that matter are fixed. This is how people plan projects: “these two jobs can happen in any order, but both before the next one.”</p>
<table class="sym"><thead><tr><th></th><th>Forward</th><th>Backward</th><th>SAT</th></tr></thead><tbody>
<tr><td>Starts from</td><td>Init</td><td>Goal</td><td>a guessed length k</td></tr><tr><td>Considers</td><td>applicable actions</td><td>relevant actions</td><td>all actions at all times</td></tr>
<tr><td>Strength</td><td>simple; great with a heuristic</td><td>ignores irrelevant actions</td><td>reuses fast SAT solvers</td></tr></tbody></table>
${K.recap(["Forward search applies applicable actions from Init; BFS uses a FIFO frontier and a reached set.", "Backward search regresses goal cards through relevant actions: g′ = (g − ADD) ∪ PRECOND.", "SAT planning: variables per time step, four rule types, try k = 1, 2, 3, …", "Planning graphs give a lower bound; partial-order plans keep only necessary orderings."])}`,
  cards: [
    ["Forward (progression) search", "Start at Init; apply applicable actions; stop at a state containing the goal."],
    ["Frontier (BFS)", "A first-in, first-out waiting line of states found but not yet expanded."],
    ["Reached set", "Every state seen so far; repeats are skipped."],
    ["Branching factor", "How many actions apply per state. bᵈ nodes at depth d."],
    ["Goal card (backward search)", "A set of facts that must be true; the nodes of backward search."],
    ["Relevant action", "Adds at least one goal fact and deletes none."],
    ["Regression", "g′ = (g − ADD(a)) ∪ PRECOND(a): what must be true just before a."],
    ["SATPlan", "Encode 'a plan of k steps exists' as clauses; if UNSAT, try k + 1."],
    ["Frame axiom", "A fact changes only if an action changes it."],
    ["Mutex", "Two actions or facts that can't both happen at the same level."],
    ["Partial-order plan", "Only the necessary 'before' orderings are fixed."]
  ],
  check: { q: "Regress the goal {At(C2, SFO)} through Unload(C2, p, SFO). The new goal is…", options: ["{At(C2, SFO)}", "{In(C2, p), At(p, SFO)}", "{At(C2, JFK)}", "{In(C2, p)}"] },
  mcq: [
    { q: "BFS frontier is [S2, S3]. Which state is expanded next?", options: ["S3, because it is newer", "S2, because it joined first", "Whichever is closer to the goal", "Both at once"] },
    { q: "During BFS, expanding S1 produces S0 again. What happens?", options: ["S0 is expanded again", "S0 is skipped because it is in Reached", "The search fails", "S0 becomes the goal"] },
    { q: "Goal card {In(C2, P2), At(P2, SFO)}. Is Fly(P2, SFO, JFK) relevant?", options: ["Yes, it adds At(P2, JFK)", "No, it deletes At(P2, SFO), a goal fact", "Yes, every Fly is relevant", "No, Fly is never relevant"] },
    { q: "In SAT planning the solver says UNSATISFIABLE for k = 2. What does that mean?", options: ["No plan exists at all", "No plan of length 2 exists; try k = 3", "The frame axioms are wrong", "The goal is already true"] },
    { q: "Why are Load⁰ and Fly⁰ not allowed to be true together?", options: ["Fly deletes At(P2, JFK), which Load needs", "Load deletes At(P2, JFK)", "They have the same name", "The goal forbids it"] },
    { q: "Roughly how many nodes does blind forward search face with 2,000 actions per state and a 41-step plan?", options: ["41 × 2,000", "2,000²", "2,000⁴¹", "41²⁰⁰⁰"] },
    { q: "In the spare tire plan, which pair can be left unordered?", options: ["Remove(Flat, Axle) and PutOn(Spare, Axle)", "Remove(Spare, Trunk) and PutOn(Spare, Axle)", "Remove(Flat, Axle) and Remove(Spare, Trunk)", "None"] }
  ]
},

/* ======================================================================= */
{
  id: "s113", kind: "section", part: "p1", slides: [58, 79],
  label: "11.3", title: "Heuristics for Planning",
  blurb: "How a planner invents its own estimate of 'how far to the goal': relax the problem, solve the easy version, and use its length. Goal count, ignore preconditions, ignore deletes, h_max / h_add, and A*.",
  learn: K.top("11.3", "Guessing the Distance to the Goal", 20, ["explain h, h* and admissible with a number line", "compute goal count, ignore-preconditions, h_FF, h_max and h_add for a small state", "run A* by hand using f = g + h", "explain why a more informed heuristic expands fewer states"]) + `
<h3>1. A heuristic is a GPS estimate</h3>
${K.analogy(`Your GPS says “about 20 minutes”. It doesn't know the exact traffic, but the estimate tells you which road to try first. A planning heuristic ${f("h(s)")} estimates <b>how many actions are left</b> from state s. The true number is ${f("h*(s)")}.`)}
${K.fig(`<div class="nline"><div class="nl-ax">${[0, 1, 2, 3, 4, 5].map((i) => `<span style="left:${i * 20}%">${i}</span>`).join("")}</div>
<div class="nl-pt g" style="left:20%">goal count = 1</div><div class="nl-pt t" style="left:60%">h* = 3 (truth)</div><div class="nl-pt b" style="left:80%">bad guess = 4</div></div>`, "One-cargo start state. Estimates at or left of the truth are admissible; anything to the right overestimates.")}
<div class="rule"><b>Admissible:</b> never overestimates, ${f("h(s) ≤ h*(s)")}. With an admissible heuristic, A* is guaranteed to return a <b>shortest</b> plan.</div>
<h3>2. Where do estimates come from? Relax the problem</h3>
<p>The trick: <b>remove some rules</b> to get an easier problem, solve the easy problem exactly, and use its plan length as the estimate. Removing rules can only make plans shorter or equal, so the estimate is optimistic.</p>
${K.analogy(`Straight-line distance on a map is a relaxation: you pretend you can walk through buildings. Because planning problems are written as facts and schemas, the computer can relax <b>any</b> problem by itself. This is the big payoff of 11.1's representation.`)}
<h3>3. The simplest: goal count</h3>
<p>Count the goal facts that are still false. Admissible (each needs at least one action) but weak: in the one-cargo tree, S1 (2 steps away) and S2 (4 steps away) both score 1, so it can't tell them apart.</p>
<h3>4. Relaxation 1: ignore preconditions</h3>
<p>Pretend every action can run at any time. Then you only need enough actions to <b>add</b> every missing goal fact. Choosing the fewest is the <b>set cover</b> problem:</p>
${K.fig(`<div class="vcover"><span class="vg">A</span><span class="vg">B</span><span class="vg">C</span><div class="vs s1">a₁ adds A, B</div><div class="vs s2">a₂ adds B, C</div><div class="vs s3">a₃ adds A</div></div>`, "Goal A ∧ B ∧ C. The fewest actions covering all three: a₁ + a₂, so h = 2.")}
<p>On the two-cargo swap: two goal facts, each added by one Unload, no Unload adds both, so <b>h = 2</b>, while the truth is 6. It forgets that cargo must be loaded and flown first.</p>
<h3>5. Relaxation 2: ignore delete lists (h_FF)</h3>
<p>Keep the preconditions but throw away the delete lists: <b>facts only pile up</b>. Then:</p>
<ol><li><b>Grow layers</b>: from the state's facts, apply every applicable action and add what it adds, until the goal appears.</li>
<li><b>Extract a relaxed plan</b>: work back from the goal, picking an action for each needed fact, and count the actions.</li></ol>
${K.fig(`<div class="gp"><div class="gp-col"><div class="gp-h">layer 0</div><div class="gp-i">C2@JFK</div><div class="gp-i">P2@JFK</div></div><div class="gp-arr">→</div><div class="gp-col"><div class="gp-h">layer 1</div><div class="gp-i">C2@JFK</div><div class="gp-i">P2@JFK</div><div class="gp-i new">C2 in P2</div><div class="gp-i new">P2@SFO</div></div><div class="gp-arr">→</div><div class="gp-col"><div class="gp-h">layer 2</div><div class="gp-i">…</div><div class="gp-i goal">C2@SFO</div></div></div>`, "Relaxed layers from S0. Relaxed plan = {Load, Fly, Unload}, so h_FF = 3.")}
<p>Because preconditions are kept, the order Load → Fly → Unload is still forced, which is why h_FF is usually close to the truth. It is the heuristic of the <b>FF</b> planner. It is not guaranteed admissible, but it is very well informed.</p>
${K.watch(`“Ignore deletes” does <b>not</b> ignore preconditions. Only the delete lists go.`)}
<h3>6. Combining goals: MAX or SUM (h_max, h_add)</h3>
<p>Give every fact a cost: facts true now cost 0; a fact made by an action costs ${f("1 + combine(costs of its preconditions)")}. h_max combines with <b>max</b>, h_add with <b>sum</b>.</p>
<table class="sym"><thead><tr><th>Fact (from S0)</th><th>Made by</th><th>MAX</th><th>SUM</th></tr></thead><tbody>
<tr><td>C2 in P2</td><td>Load: 1 + (0, 0)</td><td>1</td><td>1</td></tr><tr><td>P2@SFO</td><td>Fly: 1 + (0)</td><td>1</td><td>1</td></tr>
<tr><td><b>C2@SFO</b></td><td>Unload: 1 + (1, 1)</td><td><b>2</b></td><td><b>3</b></td></tr></tbody></table>
${K.plain(`h_max never overestimates. h_add is better informed but can <b>double-count</b>: with two cargos sharing one flight to SFO, h_add = 3 + 3 = 6, but the real plan is 5 actions, because one Fly serves both.`)}
<h3>7. Putting it to work: A*</h3>
<div class="rule">${f("f(n) = g(n) + h(n)")}: actions taken so far + estimated actions left. Always expand the lowest f.</div>
<table class="sym"><thead><tr><th>Heuristic used by A*</th><th>States expanded (one-cargo)</th></tr></thead><tbody>
<tr><td>none (breadth-first)</td><td>4: S0, S1, S2, S3</td></tr><tr><td>goal count</td><td>4: ties at f = 2 let S2 in</td></tr><tr><td>h_FF</td><td><b>3</b>: S2 (f = 4) is never expanded</td></tr></tbody></table>
<p>The difference is one state here, and astronomically many on real problems. The <b>Step by step</b> tab traces all of these.</p>
<h3>8. More tricks real planners use</h3>
<ul><li><b>Symmetry reduction</b>: two identical planes in the same place give mirror-image branches; explore one.</li>
<li><b>Abstraction</b>: ignore some details (which cargo is which) to merge states; the abstract cost is a lower bound.</li>
<li><b>Serializable subgoals</b>: some goals can be achieved one at a time without undoing earlier ones (build a tower bottom-up).</li>
<li><b>Preferred actions</b>: try the first actions of the relaxed plan first. Fast, but may miss the best plan.</li></ul>
${K.ng(`Goal: Maria in recovery and her surgery complete. Goal count = 2. Ignore-deletes = 5 (Prep, ScrubIn, TransferToOR, Operate, TransferToRecovery), which is exactly the true cost.`)}
${K.recap(["h(s) estimates actions left; admissible means h ≤ h*.", "Relax the problem, solve it exactly, use its length.", "Ignore preconditions → set cover (weak); ignore deletes → h_FF (strong).", "h_max is admissible; h_add can double-count shared actions.", "A* expands the lowest f = g + h; a better h means fewer expansions."])}`,
  cards: [
    ["h(s) and h*(s)", "The estimated and the true number of actions from s to the goal."],
    ["Admissible heuristic", "Never overestimates: h(s) ≤ h*(s). A* with it finds a shortest plan."],
    ["Relaxation", "Remove rules, solve the easier problem exactly, use its plan length as h."],
    ["Goal count", "Number of goal facts still false. Admissible but weak."],
    ["Ignore preconditions", "Any action any time; fewest actions covering the goal facts (set cover)."],
    ["Ignore delete lists (h_FF)", "Facts only pile up; grow layers, extract a relaxed plan, count its actions."],
    ["h_max", "Fact cost = 1 + max of precondition costs; goal = max over goal facts. Admissible."],
    ["h_add", "Fact cost = 1 + sum of precondition costs; can double-count shared actions."],
    ["f = g + h", "A*: actions so far plus estimated actions left; expand the lowest f."],
    ["Preferred actions", "Try the relaxed plan's actions first; fast, not guaranteed optimal."]
  ],
  check: { q: "Why is ignoring delete lists usually a much closer estimate than ignoring preconditions?", options: ["It deletes more facts", "It keeps preconditions, so Load and Fly are still needed before Unload", "It is always admissible", "It ignores the goal"] },
  mcq: [
    { q: "True cost is 3. Which estimate is NOT admissible?", options: ["0", "2", "3", "4"] },
    { q: "Goal count gives S1 and S2 the same value 1. What is the consequence for A*?", options: ["A* fails", "A* can't tell which is closer and may expand the worse one", "A* returns a longer plan", "Nothing"] },
    { q: "Relaxed layers from S0: layer 1 adds C2 in P2 and P2@SFO; layer 2 adds C2@SFO. The relaxed plan is {Load, Fly, Unload}. h_FF = ?", options: ["1", "2", "3", "4"] },
    { q: "Fact costs: C2 in P2 = 1, P2@SFO = 1. Unload needs both. Cost of C2@SFO with h_max and h_add?", options: ["2 and 2", "2 and 3", "3 and 3", "1 and 2"] },
    { q: "A* frontier: S2 (f = 4), S3 (f = 3). Which is expanded next?", options: ["S2, it was added first", "S3, lower f", "Both", "Neither: stop"] },
    { q: "Why can h_add overestimate?", options: ["It ignores preconditions", "It counts a shared action once for each goal that needs it", "It uses max", "It never can"] },
    { q: "Which planner made the ignore-delete-lists heuristic famous?", options: ["Graphplan", "FF (Fast Forward)", "SATPlan", "STRIPS"] }
  ]
}
);
})();
