/* v3 study cards. Each card: k = kind ("term" | "q" | "prob" | "pair"), f = front,
   d = the answer / definition, ex = worked example, w = common mistake, pic = small picture (HTML).
   For "pair" cards, d is an HTML two-column comparison. Content is trusted HTML written for the lab. */
(function () {
const K = window.PK, f = K.f, ch = K.chips;
const pair = (a, b, rows, tell) => `<table class="cmp"><thead><tr><th></th><th>${a}</th><th>${b}</th></tr></thead><tbody>${rows.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>${tell ? `<div class="cmp-t"><b>How to tell them apart:</b> ${tell}</div>` : ""}`;
const mini = (nodes, edges, w, h) => K.tree(w || 300, h || 150, nodes, edges, 96, 34);

window.LAB_CARDS = {
intro: [
  { k: "term", f: "Plan", d: "A sequence of actions that takes you from the start state to a goal state, which you can check before acting.",
    ex: `Load(C2, P2, JFK) → Fly(P2, JFK, SFO) → Unload(C2, P2, SFO)`, w: "A plan is not a single action and not the goal itself; it is the ordered list of steps." },
  { k: "q", f: "Why does planning write each kind of action once, as a schema with variables?",
    d: "So one template covers every specific case. Logical agents (Ch. 7) needed a separate sentence for every object and time step.",
    ex: `${f("Fly(p, from, to)")} stands for every flight of every plane between any two airports.` },
  { k: "q", f: "Read out loud and say what it means: ¬At(C2, SFO) ∧ At(P2, JFK)",
    d: "“Not At C2 SFO, and At P2 JFK”: cargo C2 is not at SFO, and plane P2 is at JFK.", w: "¬ applies only to the fact right after it, not to the whole sentence." },
  { k: "pair", f: "Constant vs variable: how do you tell them apart in planning notation?",
    d: pair("Constant", "Variable", [["Looks like", "Capitalised: C2, JFK, At", "lower-case: c, p, from"], ["Means", "one specific thing or relation", "a blank to be filled in"], ["Example", "Fly(P2, JFK, SFO)", "Fly(p, from, to)"]], "If it starts with a capital letter, it is a specific thing.") },
  { k: "q", f: "When is P ⇒ Q false?", d: "Only when P is true and Q is false. In every other case the implication is true.",
    ex: "“If it rains, the ground is wet” is broken only by rain on dry ground.", w: "⇒ does not mean “P causes Q”, and a false P makes the whole implication true." },
  { k: "term", f: "Substitution θ = {x/C2}", d: "A list of replacements: every x becomes C2. Applying θ to a pattern gives a specific fact or action.",
    ex: `${f("At(x, JFK)")} with {x/C2} becomes ${f("At(C2, JFK)")}.` },
  { k: "prob", f: "Maria ∈ SurgicalPatients and SurgicalPatients ⊂ Patients. What new fact follows?",
    d: "Maria ∈ Patients. Membership passes up through subset links.", w: "∈ is for an individual in a category; ⊂ is for one category inside another." }
],
s111: [
  { k: "term", f: "State", d: "The set of facts that are true right now. Each fact is ground: no variables.",
    ex: `${ch(["At(C2, JFK)", "At(P2, JFK)"])}`, pic: K.scene({ plane: "JFK", cargo: "JFK" }) },
  { k: "q", f: "The state is {At(C2, JFK)}. What does that tell you about At(C2, SFO)?",
    d: "It is false. Under the <b>closed-world assumption</b>, any fact not listed is false, like a name missing from an attendance list.",
    w: "Classical planning has no “unknown”. Unknown facts arrive in 11.5 (belief states)." },
  { k: "term", f: "Action schema: PRECOND and EFFECT",
    d: "PRECOND: facts that must be true <i>before</i> the action. EFFECT: what changes. Facts with ¬ form the DELETE list; the rest form the ADD list.",
    ex: `<div class="code">Load(c, p, a)<br>PRECOND: At(c, a) ∧ At(p, a)<br>EFFECT: ¬At(c, a) ∧ In(c, p)</div>`, w: "The preconditions are not deleted unless the EFFECT says so: At(p, a) stays true after Load." },
  { k: "prob", f: "Ground Load(c, p, a) with {c/C1, p/P1, a/SFO}. Write the precondition.",
    d: `${f("At(C1, SFO) ∧ At(P1, SFO)")}`, w: "Replace each variable everywhere it appears: in the name, the precondition and the effect." },
  { k: "pair", f: "Applicable vs useful", d: pair("Applicable", "Useful", [["Question", "Are all preconditions true now?", "Does it move us toward the goal?"], ["Checked by", "looking at the current state", "searching ahead"], ["Example", "LeaveOvernight (precondition ⊤) is always applicable", "LeaveOvernight is never useful: it deletes every tire location"]], "Applicable is a fact about now; useful is a fact about the future.") },
  { k: "prob", f: "s = {At(C2, JFK), At(P2, JFK)}. What is RESULT(s, Load(C2, P2, JFK))?",
    d: `{At(P2, JFK), In(C2, P2)}: strike out the DELETE fact, then add the ADD fact.`,
    pic: `<div class="ckrow">${ch([["At(C2, JFK)", "del"], "At(P2, JFK)", ["In(C2, P2)", "add"]])}</div>`, ex: `RESULT(s, a) = (s − DEL(a)) ∪ ADD(a)` },
  { k: "q", f: "Fly never mentions cargo. Why does the cargo arrive at SFO with the plane?",
    d: "In(C2, P2) is not in Fly's delete list, so it carries over unchanged. Facts an action doesn't mention stay as they were; this solves the frame problem for free.",
    pic: `<div class="ckrow">${ch(["In(C2, P2)", ["At(P2, JFK)", "del"], ["At(P2, SFO)", "add"]])}</div>` },
  { k: "q", f: "What goes wrong if Fly's EFFECT is only At(p, to), with no ¬At(p, from)?",
    d: "The plane ends up at both airports at once, and the planner will use that impossible state to make plans that are too short and wrong.", w: "When you write an effect, always ask: what stops being true?" },
  { k: "q", f: "Goal(At(C2, SFO)). Is a final state with the plane back at JFK a goal state?",
    d: "Yes. The goal is <b>partial</b>: it names only the facts we care about. Any state that contains At(C2, SFO) is a goal state." }
],
s112: [
  { k: "term", f: "Forward (progression) search", d: "Start at Init. Repeatedly apply <b>applicable</b> actions with RESULT until a state contains every goal fact.",
    pic: mini({ a: [150, 20, "S0", "start"], b: [70, 90, "S1", "Load"], c: [230, 90, "S2", "Fly"] }, [["a", "b"], ["a", "c"]], 300, 120) },
  { k: "pair", f: "Frontier vs reached", d: pair("Frontier", "Reached", [["Holds", "states found but not yet expanded", "every state ever seen"], ["In BFS", "a first-in, first-out queue", "a set"], ["Used for", "choosing what to expand next", "skipping repeats"]], "The frontier is the waiting line; reached is the guest book.") },
  { k: "prob", f: "BFS frontier is [S2, S3] and S1 has just been expanded. Which state is expanded next, and why?",
    d: "S2. Breadth-first search takes the state that joined the queue first (first in, first out).", w: "Taking the newest first (S3) would be depth-first search." },
  { k: "q", f: "Why is blind forward search hopeless on large problems?",
    d: "Nodes grow as b^d. With b ≈ 2,000 actions per state and a 41-step plan, that is about 2000⁴¹ ≈ 10¹³⁵ nodes. It needs a heuristic.", ex: "One-cargo toy: b = 2, d = 3, so about 8 leaves." },
  { k: "pair", f: "Applicable vs relevant", d: pair("Applicable (forward)", "Relevant (backward)", [["Asks", "can it run in this state?", "could it be the last step toward this goal card?"], ["Test", "every precondition is true", "adds a goal fact and deletes none"], ["Example", "Load(C2,P2,JFK) in the start state", "Unload(C2,P2,SFO) for goal At(C2,SFO)"]], "Forward looks at preconditions; backward looks at effects.") },
  { k: "prob", f: "Regress g = {At(C2, SFO)} through Unload(C2, P2, SFO).",
    d: `g′ = (g − ADD) ∪ PRECOND = <b>{In(C2, P2), At(P2, SFO)}</b>: just before the last step, the cargo was in the plane and the plane was at SFO.`,
    pic: K.flow([["g₀", "At(C2,SFO)", "ok"], ["g₁", "In(C2,P2) · At(P2,SFO)"]]) },
  { k: "q", f: "Goal card {In(C2, P2), At(P2, SFO)}. Is Fly(P2, SFO, JFK) relevant?",
    d: "No. It deletes At(P2, SFO), which is on the goal card, so it would destroy the goal.", w: "Adding some fact is not enough; the action must also delete no goal fact." },
  { k: "term", f: "SATPlan", d: "Guess a length k. Encode “a plan of k steps exists” as clauses: Init at t = 0, goal at t = k, action rules, frame axioms, exclusions. Ask a SAT solver; if UNSAT, try k + 1.",
    ex: "One-cargo: k = 1 and k = 2 are UNSAT; k = 3 gives Load⁰, Fly¹, Unload²." },
  { k: "q", f: "Why can't Load⁰ and Fly⁰ both be true in the SAT grid?",
    d: "Fly deletes At(P2, JFK), which Load needs at the same moment. The exclusion clause ¬(Load⁰ ∧ Fly⁰) forbids it." },
  { k: "term", f: "Mutex (planning graph)", d: "Two actions or facts that cannot both happen at the same level. The goal must appear with no mutex between its facts before a plan can be extracted.",
    ex: "In S1, “C2 in P2” and “P2@SFO” are mutex, so Unload can't enter A1 and the goal first appears at S3." },
  { k: "term", f: "Partial-order plan", d: "A plan that fixes only the orderings that matter. Steps with no arrow between them can happen in either order.",
    pic: mini({ s: [150, 18, "Start", ""], a: [70, 75, "Remove Flat", ""], b: [230, 75, "Remove Spare", ""], p: [150, 132, "PutOn Spare", "", "ok"] }, [["s", "a"], ["s", "b"], ["a", "p"], ["b", "p"]], 300, 152) }
],
s113: [
  { k: "pair", f: "h(s) vs h*(s)", d: pair("h(s)", "h*(s)", [["Is", "an estimate of the actions left", "the true number of actions left"], ["Known when searching?", "yes: computed quickly", "no: finding it is the whole problem"], ["One-cargo start", "goal count 1, h_FF 3", "3"]], "h is the GPS guess; h* is the real drive.") },
  { k: "q", f: "What does “admissible” mean, and why does A* care?",
    d: "The heuristic never overestimates: h(s) ≤ h*(s) everywhere. With an admissible h, A* is guaranteed to return a shortest plan.", w: "Admissible doesn't mean accurate: h = 0 is admissible but useless." },
  { k: "term", f: "Relaxation", d: "Remove some rules to get an easier problem, solve that exactly, and use its plan length as h. Planners do this automatically from the schemas.",
    ex: "Ignore preconditions; ignore delete lists. (Straight-line distance on a map is a relaxation too.)" },
  { k: "q", f: "Why is goal count weak in the one-cargo tree?",
    d: "It gives S1, S2 and S3 the same value (1), though they are 2, 4 and 1 steps away. The search can't tell good branches from bad ones." },
  { k: "prob", f: "Two-cargo swap, ignore preconditions: what is h at the start, and what is the true cost?",
    d: "h = 2: one Unload per missing goal fact, and no single action adds both. The true cost is 6, because loading and flying are skipped.", w: "Ignoring preconditions skips the hard part of the problem, so it badly underestimates." },
  { k: "prob", f: "Compute h_FF for S0 (C2@JFK, P2@JFK; goal C2@SFO).",
    d: "Layers: L0 {C2@JFK, P2@JFK} → L1 adds C2 in P2 (Load), P2@SFO (Fly) → L2 adds C2@SFO (Unload). Extract back from the goal: Unload, Load, Fly. <b>h_FF = 3</b>.",
    pic: `<div class="gp"><div class="gp-col"><div class="gp-h">L0</div><div class="gp-i">C2@JFK</div><div class="gp-i">P2@JFK</div></div><div class="gp-arr">→</div><div class="gp-col"><div class="gp-h">L1</div><div class="gp-i new">C2 in P2</div><div class="gp-i new">P2@SFO</div></div><div class="gp-arr">→</div><div class="gp-col"><div class="gp-h">L2</div><div class="gp-i goal">C2@SFO</div></div></div>`,
    w: "Count actions in the relaxed plan, not layers. Two layers here, but three actions." },
  { k: "pair", f: "Ignore preconditions vs ignore delete lists", d: pair("Ignore preconditions", "Ignore delete lists (h_FF)", [["Removes", "every precondition", "every delete list"], ["Order of actions", "lost: any action, any time", "kept: Load before Fly before Unload"], ["Two-cargo swap", "2", "6 (true 6)"]], "Ask which rule was thrown away. Keeping preconditions keeps the order, so h_FF is far better informed.") },
  { k: "pair", f: "h_max vs h_add", d: pair("h_max", "h_add", [["Fact cost", "1 + max of precondition costs", "1 + sum of precondition costs"], ["Goal value", "max over goal facts", "sum over goal facts"], ["Admissible?", "yes", "no: can double-count"], ["Two cargos, one flight", "2", "6 (true 5)"]], "MAX is safe but low; SUM is informative but can overshoot when goals share an action.") },
  { k: "prob", f: "A* frontier: S2 (g 1, h 3) and S3 (g 2, h 1). Which is expanded next?",
    d: "S3: f = 2 + 1 = 3 beats S2's f = 1 + 3 = 4. A* always expands the lowest f = g + h.", w: "A* doesn't use arrival order or g alone; it uses g + h." },
  { k: "q", f: "With h_FF, A* expanded 3 states; with goal count, 4. What does that show?",
    d: "Both are admissible here and both find the shortest plan, but the better-informed heuristic wastes less effort: S2 was never expanded with h_FF." }
],
s114: [
  { k: "pair", f: "HLA vs primitive action", d: pair("HLA", "Primitive action", [["Can the agent just do it?", "no: it must be refined", "yes"], ["Example", "Go(Home, SFO)", "Drive(Home, Parking)"], ["Has", "one or more refinements", "PRECOND and EFFECT"]], "If you still have to ask “how?”, it's an HLA.") },
  { k: "term", f: "Refinement and implementation", d: "A refinement is one way to carry out an HLA, as a sequence of steps. An implementation is a refinement made only of primitive actions.",
    ex: "Go(Home, SFO) → [Drive, Shuttle] (implementation) or [Taxi] if Cash ≥ 80.", pic: mini({ g: [150, 20, "Go(Home,SFO)", "HLA", "hl", 130], a: [80, 95, "Drive, Shuttle", "", "ok", 120], b: [225, 95, "Taxi", "Cash ≥ 80", "", 100] }, [["g", "a"], ["g", "b"]], 300, 122) },
  { k: "q", f: "In hierarchical search, what is a node, and how is it expanded?",
    d: "A node is a whole plan. Expand it by picking one HLA in the plan and replacing it with one of its refinements. Stop when the plan is all primitive and reaches the goal." },
  { k: "prob", f: "Flat: b = 10, d = 20. Hierarchy: r = 3 refinements of k = 5 steps. Compare the search sizes.",
    d: "Flat: 10²⁰ plans. Hierarchical: r^((d−1)/(k−1)) = 3^4.75 ≈ <b>185</b> refinement trees.", w: "The saving depends on good refinements, which someone has to write." },
  { k: "pair", f: "REACH⁺ vs REACH⁻", d: pair("REACH⁺ (optimistic)", "REACH⁻ (pessimistic)", [["Contains", "every truly reachable state, maybe more", "only states surely reachable"], ["Misses the goal →", "prune the plan", "nothing certain"], ["Touches the goal →", "maybe: refine", "commit: it works"]], "Optimistic can rule things out; pessimistic can rule things in."),
    pic: `<div class="venn sm"><div class="v-o">REACH⁺</div><div class="v-t">REACH</div><div class="v-p">REACH⁻</div></div>` },
  { k: "q", f: "REACH⁺ meets the goal but REACH⁻ does not. What should the planner do?", d: "Refine and look closer: success is possible but not yet guaranteed." },
  { k: "pair", f: "Angelic vs demonic choice", d: pair("Angelic", "Demonic", [["Who chooses", "the agent", "the world"], ["Where", "choosing refinements (11.4)", "action outcomes (11.5)"], ["A plan works if", "some outcome reaches the goal", "every outcome reaches the goal"]], "Ask who picks: you (angel) or nature (demon).") }
],
s115: [
  { k: "term", f: "Belief state", d: "The set of every world the agent might be in. A plan is safe only if it reaches the goal from every world in the set.",
    pic: `<div class="worlds sm"><div class="w">C red<br>T red</div><div class="w">C red<br>T blue</div><div class="w">C blue<br>T red</div><div class="w">C blue<br>T blue</div></div>`, ex: "Like a detective's list of suspects." },
  { k: "q", f: "How can painting the chair and table from the same can reach the goal without ever looking?",
    d: "Whatever colour the can is, both pieces end up that colour, so every possible world ends with matching colours. This is <b>coercion</b>." },
  { k: "prob", f: "The vacuum robot is in L or R. Which single action shrinks the belief state to one world?",
    d: "Right: from L it moves to R; from R it bumps the wall and stays. Either way it ends in R.",
    pic: mini({ a: [150, 20, "robot in L or R", "", "", 150], b: [150, 95, "robot in R", "1 world", "ok", 130] }, [["a", "b", "Right"]], 300, 120) },
  { k: "term", f: "Conditional effect", d: "An effect that depends on the world the action runs in: “when X: Y”. Update a belief state by applying the action to each world separately.",
    ex: `${f("Suck: when AtL: CleanL ∧ when AtR: CleanR")}` },
  { k: "pair", f: "Sensorless plan vs contingent plan", d: pair("Sensorless", "Contingent", [["Senses?", "never", "yes, then branches"], ["Shape", "a straight list", "a tree of if–then branches"], ["Paint example", "paint both from one can", "look; if the colours differ, repaint the chair"]], "If the plan contains an “if”, it's contingent.") },
  { k: "q", f: "What does sensing do to a belief state?", d: "It splits it: each possible observation keeps only the worlds that agree with it.", ex: "LookAt(Table): see red → {w1, w3}; see blue → {w2, w4}." },
  { k: "term", f: "Execution monitoring: three kinds", d: `<table class="cmp"><tbody><tr><th>Action</th><td>are the next step's preconditions still true?</td></tr><tr><th>Plan</th><td>will the rest of the plan still work?</td></tr><tr><th>Goal</th><td>is there now a better goal?</td></tr></tbody></table>`,
    ex: "Northgate: OR3 is busy before the transfer (action monitoring), so replan from now: use OR2.", w: "Replan from the current state, not from the original start." }
],
s116: [
  { k: "q", f: "What is the difference between planning and scheduling?", d: "Planning decides <b>what</b> to do and in what order. Scheduling decides <b>when</b> each step starts, given durations and resources.", ex: "Plan first, schedule second." },
  { k: "pair", f: "ES vs LS", d: pair("ES (earliest start)", "LS (latest start)", [["Found by", "forward pass from time 0", "backward pass from the finish"], ["Rule", "max over predecessors of ES + duration", "min over successors of LS − own duration"], ["Wheels 1", "30", "45"]], "ES asks “how soon can I start?”; LS asks “how late can I start without delaying the end?”") },
  { k: "prob", f: "Engine 1 (30) → Wheels 1 (30) → Inspect 1 (10). Earliest starts?", d: "0, 30 and 60. Each step starts when the one before it finishes." },
  { k: "term", f: "Slack and critical path", d: "Slack = LS − ES: how long a step can slip for free. Steps with zero slack form the critical path, which sets the finish time.",
    pic: `<div class="gantt sm"><div class="g-r"><span class="g-l">Car 1</span><div class="g-t"><div class="g-b" style="left:0;width:54%">0–70 · slack 15</div></div></div><div class="g-r"><span class="g-l">Car 2</span><div class="g-t"><div class="g-b crit" style="left:0;width:65%">0–85 · critical</div></div></div></div>`,
    w: "Zero slack doesn't mean late; it means any delay there delays everything." },
  { k: "q", f: "With one engine hoist, why does the order of the engines matter?", d: "Only one engine can be on the hoist at a time. Engine 1 first finishes at 115; Engine 2 first finishes at 130." },
  { k: "q", f: "Minimum slack chose Engine 2 first (finish 130), but the best schedule finishes at 115. What does that show?", d: "Greedy rules are fast but not always optimal. Scheduling with shared resources is NP-hard in general." },
  { k: "term", f: "Aggregation", d: "Count interchangeable resources instead of naming each one.", ex: `${f("Inspectors(2)")} rather than Inspector1, Inspector2.` }
],
s117: [
  { k: "q", f: "Why is planning hard in general?", d: "Each true/false fact doubles the number of states: n facts give 2ⁿ states. General planning is PSPACE-hard.", ex: "30 facts ≈ 1 billion states." },
  { k: "q", f: "When can two goals be planned as independent subproblems?", d: "When they never interact. Each cargo with its own plane: plan each separately and merge.", w: "If they share something, like the only plane, the separate plans may clash." },
  { k: "term", f: "Portfolio planner", d: "Runs several planners on the same problem and takes the first good answer, because no single method wins everywhere." },
  { k: "pair", f: "Classical planning vs MDP vs POMDP", d: pair("Outcomes certain", "Outcomes random", [["Fully observable", "Classical planning (Ch. 11)", "MDP (Ch. 17)"], ["Partially observable", "Sensorless / contingent (11.5)", "POMDP (Ch. 17)"]], "Unknown action model? Learn it: reinforcement learning (Ch. 22).") }
],
wrap: [
  { k: "q", f: "Name the three ways 11.2 finds a plan.", d: "Forward search (applicable actions from Init), backward search (relevant actions from the goal), and SAT planning (logic per time step)." },
  { k: "q", f: "How does a planner get a heuristic without a human writing one?", d: "Relax the problem (ignore preconditions or delete lists), solve the easy version exactly, and use its plan length as h." },
  { k: "prob", f: "Init {At(C1, SFO), At(P1, SFO)}; goal At(C1, JFK). Write the plan.", d: "Load(C1, P1, SFO), Fly(P1, SFO, JFK), Unload(C1, P1, JFK)." },
  { k: "q", f: "Which extension handles which problem: hierarchy, belief states, scheduling?", d: "Hierarchy: problems too big to plan step by step. Belief states: uncertainty about the world. Scheduling: time and shared resources." }
]
};
})();
