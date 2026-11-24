/* CS650 Week 11 lab v3 — modules 5–9: 11.4, 11.5, 11.6, 11.7, Wrap-up. */
(function () {
const K = window.PK, f = K.f;

window.LAB_MODULES.push(
/* ======================================================================= */
{
  id: "s114", kind: "section", part: "p1", slides: [80, 92],
  label: "11.4", title: "Hierarchical Planning",
  blurb: "Think in big steps first and fill in details later: high-level actions, refinements, plan rewriting, and reachable sets that prune, commit or refine.",
  learn: K.top("11.4", "Big Steps First, Details Later", 15, ["explain HLA, refinement, primitive action and implementation", "rewrite a plan by replacing an HLA with a refinement", "say why hierarchy shrinks the search", "use REACH⁺ and REACH⁻ to prune, commit or refine"]) + `
<h3>1. You already plan in levels</h3>
${K.fig(K.tree(600, 250, { t: [300, 26, "Trip to SFO", "", "hl", 160], g: [170, 106, "Go(Home, SFO)", "", "", 160], c: [430, 106, "Check in", "", "", 130],
  d: [100, 186, "Drive", "", "", 100], s: [240, 186, "Shuttle", "", "", 100], p1: [60, 236, "turn", "", "rep", 60], p2: [130, 236, "brake", "", "rep", 60], p3: [240, 236, "pay", "", "rep", 60] },
  [["t", "g"], ["t", "c"], ["g", "d"], ["g", "s"], ["d", "p1"], ["d", "p2"], ["s", "p3"]], 120, 36), "Each level breaks a step into smaller ones. Nobody plans the brake pedal before booking the flight.")}
<p>A flat planner would search over millions of steering and braking actions. A hierarchical planner searches over a handful of big steps, and only expands the ones it needs.</p>
<h3>2. The vocabulary</h3>
<table class="sym"><thead><tr><th>Term</th><th>Meaning</th><th>Example</th></tr></thead><tbody>
<tr><td><b>Primitive action</b></td><td>the agent can do it directly</td><td>Drive(Home, Parking)</td></tr>
<tr><td><b>HLA</b> (high-level action)</td><td>a big step that must be broken down</td><td>Go(Home, SFO)</td></tr>
<tr><td><b>Refinement</b></td><td>one way to carry out an HLA, as a sequence of steps</td><td>[Drive, Shuttle] or [Taxi]</td></tr>
<tr><td><b>Implementation</b></td><td>a refinement made only of primitive actions</td><td>[Drive, Shuttle]</td></tr></tbody></table>
<div class="code">Refinement( Go(Home, SFO),<br>&nbsp; STEPS: [ Drive(Home, Parking), Shuttle(Parking, SFO) ] )<br>Refinement( Go(Home, SFO),<br>&nbsp; PRECOND: Cash ≥ 80 &nbsp; STEPS: [ Taxi(Home, SFO) ] )</div>
${K.plain(`An HLA <b>achieves</b> a goal if <b>at least one</b> of its implementations does. The planner gets to choose.`)}
<h3>3. Hierarchical search rewrites the plan</h3>
${K.flow([["[ Trip ]", "plan 0"], ["[ Go(Home,SFO), CheckIn ]", "plan 1"], ["[ Drive, Shuttle, CheckIn ]", "plan 2: all primitive", "ok"]])}
<p>Each node of the search is a whole plan. Expand it by picking an HLA and replacing it with one refinement. Stop when the plan is all primitive and it reaches the goal; if it fails, back up and try another refinement.</p>
<h3>4. Why it pays off</h3>
<div class="rule">flat search ≈ ${f("bᵈ")} plans &nbsp;·&nbsp; hierarchical ≈ ${f("r^((d−1)/(k−1))")} refinement trees &nbsp; (r refinements per HLA, k steps each)</div>
<p>With b = 10 actions, depth d = 20: flat search faces 10²⁰ plans. With r = 3 refinements of k = 5 steps: 3^4.75 ≈ <b>185</b>. Each refinement fixes five steps at once, so the tree is much shallower.</p>
${K.watch(`The speed comes from <b>good refinements</b>, and a person (or a library) has to write them. Hierarchy is not free.`)}
<h3>5. Judging an HLA without refining it: reachable sets</h3>
<p>${f("REACH(s, h)")} is the set of all states some implementation of h could lead to. Exact sets are hard to compute, so we bound them:</p>
${K.fig(`<div class="venn"><div class="v-o">REACH⁺ (optimistic)</div><div class="v-t">REACH (true)</div><div class="v-p">REACH⁻</div></div>`, "REACH⁻ ⊆ REACH ⊆ REACH⁺: the truth is squeezed between a cautious and a generous estimate.")}
<table class="sym"><thead><tr><th>What we see</th><th>Decision</th><th>Why</th></tr></thead><tbody>
<tr><td>REACH⁺ doesn't touch the goal</td><td><b>Prune</b></td><td>even the generous estimate fails</td></tr>
<tr><td>REACH⁻ touches the goal</td><td><b>Commit</b></td><td>even the cautious estimate succeeds</td></tr>
<tr><td>only REACH⁺ touches it</td><td><b>Refine</b></td><td>can't tell yet; look closer</td></tr></tbody></table>
${K.analogy(`<b>Angelic</b> choice: the agent picks the refinement, like a helpful angel always choosing the best option, so one reachable goal state is enough. (In 11.5 the <i>world</i> picks outcomes, which is <b>demonic</b>: every outcome must be good.)`)}
${K.tryit("REACH⁺ of a plan does not overlap the goal. What should the planner do?", "Prune it. If even the optimistic set misses the goal, no refinement can succeed.")}
${K.ng(`Treat(Maria) → Admit(Maria), Surgery(Maria). Admit has two refinements (routine registration or emergency admission); Surgery refines to Prep, ScrubIn, TransferToOR, Operate, TransferToRecovery.`)}
${K.recap(["HLAs are big steps; refinements say how to do them; implementations are all primitive.", "Hierarchical search rewrites plans, not states.", "REACH⁺ misses goal → prune; REACH⁻ hits goal → commit; otherwise refine."])}`,
  cards: [
    ["Primitive action", "An action the agent can carry out directly."],
    ["HLA", "High-level action: a big step with one or more refinements."],
    ["Refinement", "One sequence of steps that carries out an HLA."],
    ["Implementation", "A refinement made only of primitive actions."],
    ["Hierarchical search", "Nodes are plans; expand by replacing an HLA with a refinement."],
    ["REACH⁺", "Optimistic reachable set: contains every truly reachable state, maybe more."],
    ["REACH⁻", "Pessimistic reachable set: every state in it really is reachable."],
    ["Prune / commit / refine", "REACH⁺ misses goal / REACH⁻ hits goal / otherwise."],
    ["Angelic choice", "The agent chooses the refinement, so one good outcome is enough."]
  ],
  check: { q: "REACH⁺ meets the goal but REACH⁻ does not. What should the planner do?", options: ["Prune", "Commit", "Refine and look closer", "Give up"] },
  mcq: [
    { q: "Which is an implementation of Go(Home, SFO)?", options: ["[Go(Home, SFO)]", "[Drive(Home, Parking), Shuttle(Parking, SFO)]", "[Trip]", "Cash ≥ 80"] },
    { q: "Cash = 50. The Taxi refinement needs Cash ≥ 80. What happens in hierarchical search?", options: ["Taxi is used anyway", "That refinement is not applicable; try Drive + Shuttle", "The search fails", "Cash becomes 80"] },
    { q: "Flat: b = 10, d = 20. Hierarchical: r = 3, k = 5. About how many refinement trees?", options: ["10²⁰", "185", "60", "3"] },
    { q: "REACH⁻ overlaps the goal. Decision?", options: ["Prune", "Commit", "Refine", "Backtrack"] },
    { q: "Why is the choice of refinement called angelic?", options: ["The world picks the worst outcome", "The agent picks, so it can always choose the best", "It uses probabilities", "It needs no refinements"] }
  ]
},

/* ======================================================================= */
{
  id: "s115", kind: "section", part: "p1", slides: [93, 104],
  label: "11.5", title: "Planning and Acting in Nondeterministic Domains",
  blurb: "When the agent isn't sure what is true or what will happen: belief states, sensorless plans, conditional effects, percepts, contingent plans and replanning.",
  learn: K.top("11.5", "When the World Is Uncertain", 15, ["describe a belief state as a set of possible worlds", "explain how a sensorless plan coerces every world into the goal", "read a contingent (if–then) plan", "name the three kinds of execution monitoring"]) + `
<h3>1. Three ways reality breaks the classical assumptions</h3>
<table class="sym"><thead><tr><th>Problem</th><th>Example</th><th>Answer in this section</th></tr></thead><tbody>
<tr><td>We don't know the start</td><td>is the paint can red or blue?</td><td>belief states, sensorless plans</td></tr>
<tr><td>Actions may have several outcomes</td><td>did the paint stick?</td><td>contingent plans</td></tr>
<tr><td>The world changes as we act</td><td>OR3 just became busy</td><td>monitoring and replanning</td></tr></tbody></table>
<h3>2. A belief state is a list of suspects</h3>
${K.analogy(`A detective doesn't know who did it, so she keeps a list of every suspect who <i>could</i> have. She only crosses someone off when evidence rules them out. An agent's <b>belief state</b> is the list of every world it might be in.`)}
${K.fig(`<div class="worlds"><div class="w">Chair red<br>Table red</div><div class="w">Chair red<br>Table blue</div><div class="w">Chair blue<br>Table red</div><div class="w">Chair blue<br>Table blue</div></div>`, "Goal: chair and table the same colour. We don't know their colours, so the belief state has four worlds.")}
<div class="rule">A plan is safe only if it works in <b>every</b> world in the belief state.</div>
<h3>3. Sensorless planning: force the worlds together</h3>
<p>Open one can of paint (colour unknown). Paint the chair from it, then the table from the same can. Whatever world we started in, both are now the can's colour: four worlds collapse into two (“both red” or “both blue”), and the goal is true in <b>both</b>. We never had to look. Forcing every world into a goal state is called <b>coercion</b>.</p>
${K.fig(K.tree(560, 300, { b0: [280, 26, "2 worlds", "robot in L or R · both dirty", "", 230], b1: [280, 100, "1 world", "robot in R · both dirty", "hl", 230], b2: [280, 172, "robot in R", "R clean", "", 230], b3: [280, 236, "robot in L", "R clean", "", 230], b4: [280, 280, "goal ✓", "both clean", "ok", 230] },
  [["b0", "b1", "Right"], ["b1", "b2", "Suck"], ["b2", "b3", "Left"], ["b3", "b4", "Suck"]], 230, 38), "The vacuum robot doesn't know where it is. Moving Right puts it in R from either world, so the belief state shrinks to one world.")}
<h3>4. Conditional effects: it depends where you are</h3>
<div class="rule">${f("Suck: EFFECT when AtL: CleanL ∧ when AtR: CleanR")} — clean whichever square the robot is on.</div>
<p>To update a belief state, apply the action to <b>each</b> world separately and collect the results.</p>
<h3>5. Sensing splits the belief state</h3>
<div class="rule">${f("Percept(Color(x, c), PRECOND: Object(x) ∧ InView(x))")} — if x is in view, you see its colour.</div>
${K.fig(K.tree(520, 200, { b: [260, 26, "4 worlds", "", "", 120], l: [260, 96, "LookAt(Table)", "", "hl", 140], r: [130, 170, "see red", "{w1, w3}", "", 140], u: [390, 170, "see blue", "{w2, w4}", "", 140] }, [["b", "l"], ["l", "r"], ["l", "u"]], 120, 38), "Looking doesn't change the world, but it rules out half the suspects.")}
<h3>6. Contingent plans: if–then branches</h3>
<p>Look first, then branch: <i>if</i> the chair and table already match, do nothing; <i>else</i> paint the chair the table's colour. Each branch is a small plan for that case. It costs less paint than always repainting both.</p>
<h3>7. Replanning: watch, and fix when things go wrong</h3>
<table class="sym"><thead><tr><th>Monitoring</th><th>Asks</th></tr></thead><tbody>
<tr><td><b>Action</b> monitoring</td><td>are the next step's preconditions still true?</td></tr>
<tr><td><b>Plan</b> monitoring</td><td>will the rest of the plan still work?</td></tr>
<tr><td><b>Goal</b> monitoring</td><td>is there now a better goal?</td></tr></tbody></table>
<p>When a check fails, plan again <b>from the current state</b>, not from scratch.</p>
${K.ng(`Maria's lab result is unknown, so the belief state is {Infection, NoInfection}. A lab test splits it: positive → antibiotics, then the surgery plan; negative → straight to surgery. During the day, action monitoring finds OR3 busy before the transfer, and the planner replans from there: transfer to OR2 instead.`)}
${K.tryit("Robot in L or R, both squares dirty. After one Suck, is the goal 'both clean' reached?", "No. Exactly one square is clean, and we don't know which. The robot must move and Suck again.")}
${K.recap(["Belief state = every world the agent might be in; a plan must work in all of them.", "Sensorless plans coerce the worlds together; percepts split them.", "Contingent plans branch on what is observed; monitoring + replanning fix plans during execution."])}`,
  cards: [
    ["Belief state", "The set of all worlds the agent might be in."],
    ["Sensorless plan", "Works in every possible world without any sensing."],
    ["Coercion", "Actions that force every possible world into the same (goal) state."],
    ["Conditional effect", "'when X: Y' — the effect depends on the world the action runs in."],
    ["Percept schema", "Says what the agent can observe and when, e.g. Percept(Color(x, c), …)."],
    ["Contingent plan", "A plan with if–then branches on what is observed."],
    ["Action monitoring", "Check the next step's preconditions before doing it."],
    ["Replanning", "When a check fails, plan again from the current state."]
  ],
  check: { q: "Why can painting both the chair and table from one can reach the goal without looking?", options: ["Paint is always red", "Every possible world ends with matching colours", "The agent secretly senses", "The goal is ignored"] },
  mcq: [
    { q: "A belief state holds 4 worlds. A plan is safe if it works in…", options: ["any one world", "most worlds", "every world", "the likeliest world"] },
    { q: "Robot in L or R. Which single action makes the belief state one world?", options: ["Suck", "Right", "NoOp", "Look"] },
    { q: "What does LookAt(Table) do to the belief state {w1, w2, w3, w4}?", options: ["Nothing", "Splits it by what is seen", "Paints the table", "Removes the goal"] },
    { q: "Before the transfer, monitoring finds OR3 busy. What is this called, and what next?", options: ["Goal monitoring; give up", "Action monitoring; replan from now", "Plan monitoring; start over from Init", "No monitoring"] },
    { q: "Robot in L or R, both dirty. After one Suck, the goal 'both clean' is…", options: ["reached", "not reached: one square is clean", "impossible", "reached in one world only, which is enough"] }
  ]
},

/* ======================================================================= */
{
  id: "s116", kind: "section", part: "p1", slides: [105, 115],
  label: "11.6", title: "Time, Schedules, and Resources",
  blurb: "Plan first, schedule second: durations, ordering, the critical path method (ES, LS, slack), shared resources, and the minimum-slack rule.",
  learn: K.top("11.6", "When Does Each Step Happen?", 15, ["compute earliest and latest start times with a forward and backward pass", "find slack and the critical path", "explain why a shared resource forces an order", "say why the minimum-slack rule is fast but not always optimal"]) + `
<h3>1. Plan first, schedule second</h3>
${K.analogy(`<b>Cooking dinner.</b> The roast takes 60 minutes and the cake 40, and both need the one oven. You chop before you sauté. The <i>plan</i> says what to do and in what order; the <i>schedule</i> says when each thing starts. Planning answers “what”; scheduling answers “when”.`)}
<h3>2. The car-assembly problem</h3>
${K.flow([["Engine 1", "30 min"], ["Wheels 1", "30 min"], ["Inspect 1", "10 min"]])}
${K.flow([["Engine 2", "60 min"], ["Wheels 2", "15 min"], ["Inspect 2", "10 min"]])}
<p>${f("A ≺ B")} means A must finish before B starts. Resources: 1 engine hoist, 1 wheel station, 2 inspectors. Writing ${f("Inspectors(2)")} instead of naming each inspector is <b>aggregation</b>.</p>
<h3>3. Forward pass: earliest start (ES)</h3>
<div class="rule">${f("ES(B) = max over A ≺ B of ES(A) + duration(A)")} — you can start when your slowest predecessor finishes.</div>
<p>Car 1: 0 → 30 → 60, done at 70. Car 2: 0 → 60 → 75, done at 85. The project finishes at <b>85</b>.</p>
<h3>4. Backward pass: latest start (LS) and slack</h3>
<p>Work back from 85: a step must start by (the latest start of what follows) − (its own duration).</p>
<table class="sym"><thead><tr><th>Step</th><th>ES</th><th>LS</th><th>Slack = LS − ES</th></tr></thead><tbody>
<tr><td>Engine 1</td><td>0</td><td>15</td><td>15</td></tr><tr><td>Wheels 1</td><td>30</td><td>45</td><td>15</td></tr><tr><td>Inspect 1</td><td>60</td><td>75</td><td>15</td></tr>
<tr class="crit"><td>Engine 2</td><td>0</td><td>0</td><td>0</td></tr><tr class="crit"><td>Wheels 2</td><td>60</td><td>60</td><td>0</td></tr><tr class="crit"><td>Inspect 2</td><td>75</td><td>75</td><td>0</td></tr></tbody></table>
${K.plain(`<b>Slack</b> is how long a step can slip for free. Zero-slack steps form the <b>critical path</b>: any delay there delays everything. Zero slack doesn't mean late; it means critical.`)}
<h3>5. Shared resources force an order</h3>
<p>Both engines want the single hoist at time 0. One must wait:</p>
<div class="gantt">${[["Engine 1 first", [[0, 30, ""], [30, 90, "crit"]], 115], ["Engine 2 first", [[0, 60, "crit"], [60, 90, ""]], 130]].map(([l, bars, end]) => `<div class="g-r"><span class="g-l">${l}</span><div class="g-t">${bars.map(([s, e, c]) => `<div class="g-b ${c}" style="left:${s / 1.3}%;width:${(e - s) / 1.3}%">${s}–${e}</div>`).join("")}<div class="g-end" style="left:${end / 1.3}%">finish ${end}</div></div></div>`).join("")}</div>
<p>Same steps, same durations: the order on the shared hoist changes the finish from <b>115</b> to <b>130</b>. Each shared resource adds an either-or choice, and the choices multiply: scheduling with resources is <b>NP-hard</b>.</p>
<h3>6. The minimum-slack rule</h3>
<p>A fast rule of thumb: at each moment, start the ready step with the <b>least slack</b>. Engine 2 has slack 0, so it goes first, and the cars finish at 130, not the best possible 115. Greedy rules are good, not perfect.</p>
${K.ng(`Two patients share OR3. Maria: prep 20, surgery 60, transfer 10. Lee: prep 15, surgery 45, transfer 10. With separate rooms both are done by 90. With one room, minimum slack puts Maria (slack 0) first → 135. Putting Lee's shorter surgery first (while Maria is still in prep) → <b>130</b>.`)}
${K.tryit("A (20 min) must precede B (30 min). C (40 min) runs in parallel. Finish time? C's slack?", "Finish 50 (A then B). C can start as late as 10 and still finish by 50, so its slack is 10.")}
${K.recap(["Forward pass gives ES; backward pass gives LS; slack = LS − ES.", "Zero slack = critical path; it sets the finish time.", "Shared resources force an order; finding the best order is NP-hard.", "Minimum slack is a fast greedy rule, not always optimal."])}`,
  cards: [
    ["Plan first, schedule second", "Decide what and in which order, then decide when."],
    ["A ≺ B", "A must finish before B starts."],
    ["Aggregation", "Count interchangeable resources (Inspectors(2)) instead of naming each one."],
    ["ES", "Earliest start: when the slowest predecessor finishes."],
    ["LS", "Latest start that doesn't delay the whole project."],
    ["Slack", "LS − ES: how long a step can slip for free."],
    ["Critical path", "The chain of zero-slack steps; it sets the finish time."],
    ["Minimum-slack rule", "Start the ready step with least slack; fast, not guaranteed optimal."]
  ],
  check: { q: "Without resource limits, which car's steps have zero slack?", options: ["Car 1", "Car 2", "Both", "Neither"] },
  mcq: [
    { q: "ES(Engine 1) = 0 and it takes 30. ES(Wheels 1) = ?", options: ["0", "15", "30", "60"] },
    { q: "A step has ES = 30 and LS = 45. Its slack is…", options: ["0", "15", "45", "75"] },
    { q: "Inspect 1 lasts 10 and the project must end at 85. Its latest start is…", options: ["60", "70", "75", "85"] },
    { q: "With one hoist, which order of engines gives the better finish?", options: ["Engine 1 first (115)", "Engine 2 first (130)", "They tie", "Both at once"] },
    { q: "Why does a shared resource make scheduling hard?", options: ["It adds durations", "It adds an either-or ordering choice, and choices multiply", "It removes the goal", "It doesn't"] }
  ]
},

/* ======================================================================= */
{
  id: "s117", kind: "section", part: "p1", slides: [116, 122],
  label: "11.7", title: "Analysis of Planning Approaches",
  blurb: "Why planning is hard in general, why it works in practice anyway, and where it leads next.",
  learn: K.top("11.7", "Why Planning Is Hard, and Why It Works Anyway", 8, ["explain why n facts give 2ⁿ states", "name three ways planners exploit structure", "place classical planning among MDPs, POMDPs and reinforcement learning"]) + `
<h3>1. Every new fact doubles the states</h3>
<table class="sym"><thead><tr><th>True/false facts n</th><th>States 2ⁿ</th></tr></thead><tbody><tr><td>10</td><td>1,024</td></tr><tr><td>20</td><td>about a million</td></tr><tr><td>30</td><td>about a billion</td></tr><tr><td>300</td><td>more than atoms in the universe</td></tr></tbody></table>
<p>In general, planning is <b>PSPACE-hard</b>: no shortcut works for every problem.</p>
<h3>2. Why it works anyway: structure</h3>
${K.flow([["Relax", "heuristics (11.3)"], ["Split", "independent subproblems"], ["Summarise", "HLAs (11.4)"]])}
<p>Because states are facts and actions are readable schemas, the planner can look <b>inside</b> the problem. If two goals never interact (each cargo has its own plane), plan each one alone and merge: two 3-step searches cost about ${f("2 × b³")} instead of ${f("b⁶")}. But if they share something, like the only plane, they are no longer independent.</p>
<h3>3. No single best planner: portfolios</h3>
<p>Forward + FF wins on some problems, SAT on others, hierarchy on others. A <b>portfolio</b> runs several and takes the first answer; portfolios often win planning competitions.</p>
<h3>4. Where planning goes next</h3>
<table class="sym"><thead><tr><th></th><th>Certain outcomes</th><th>Random outcomes</th></tr></thead><tbody>
<tr><td>Fully observable</td><td><b>Classical planning (Ch. 11)</b></td><td>MDPs (Ch. 17)</td></tr>
<tr><td>Partially observable</td><td>sensorless / contingent (11.5)</td><td>POMDPs (Ch. 17)</td></tr></tbody></table>
<p>If the agent doesn't even know the action model, it must <b>learn</b> it: reinforcement learning (Ch. 22).</p>
${K.recap(["n facts → 2ⁿ states; planning is PSPACE-hard in general.", "Structure (relax, split, summarise) makes it practical.", "Run a portfolio; drop more assumptions and you reach MDPs, POMDPs and RL."])}`,
  cards: [
    ["2ⁿ states", "Each of n true/false facts doubles the number of states."],
    ["PSPACE-hard", "General planning has no shortcut that works for every problem."],
    ["Independent subproblems", "Goals that never interact can be planned separately and merged."],
    ["Portfolio planner", "Runs several planners and takes the first (or best) answer."],
    ["MDP / POMDP", "Planning with random outcomes / plus hidden state (Ch. 17)."],
    ["Reinforcement learning", "Learning to act when the action model is unknown (Ch. 22)."]
  ],
  check: { q: "A domain has 30 independent true/false facts. Roughly how many states?", options: ["30", "900", "about a billion", "infinite"] },
  mcq: [
    { q: "Two goals share the only plane. Can they be planned as independent subproblems?", options: ["Yes", "No: they interact through the plane", "Only with SAT", "Only backward"] },
    { q: "Why do portfolios work well?", options: ["One planner is always best", "Different planners win on different problems", "They use less memory", "They avoid heuristics"] },
    { q: "Random outcomes but full observability is modelled as…", options: ["Classical planning", "An MDP", "A POMDP", "SAT"] }
  ]
},

/* ======================================================================= */
{
  id: "wrap", review: true, kind: "section", part: "p1", slides: [123, 126],
  label: "Wrap", title: "Wrap-Up and Exit Ticket",
  blurb: "The whole chapter in one picture, the seven questions and their answers, and a faded worked example to finish.",
  learn: K.top("Wrap", "The Whole Chapter on One Page", 6, ["connect every section to one picture", "solve a small plan on your own"]) + `
${K.flow([["Represent", "facts + schemas (11.1)"], ["Search", "forward · backward · SAT (11.2)"], ["Search fast", "relaxed heuristics (11.3)"], ["Scale and adapt", "hierarchy · uncertainty · time (11.4–11.6)", "ok"]])}
<table class="sym"><thead><tr><th>Section</th><th>Question</th><th>Answer</th></tr></thead><tbody>
<tr><td>11.1</td><td>How do we write a problem down?</td><td>States of facts; schemas; RESULT = (s − DEL) ∪ ADD</td></tr>
<tr><td>11.2</td><td>How do we find the plan?</td><td>Forward, backward (regression), or SAT</td></tr>
<tr><td>11.3</td><td>How do we search fast?</td><td>Relax the problem to get h automatically</td></tr>
<tr><td>11.4</td><td>How do big plans stay manageable?</td><td>HLAs, refinements, REACH⁺ / REACH⁻</td></tr>
<tr><td>11.5</td><td>What if the world is uncertain?</td><td>Belief states, sensing, replanning</td></tr>
<tr><td>11.6</td><td>What about time and resources?</td><td>Critical path, slack, resource order</td></tr>
<tr><td>11.7</td><td>When does it work?</td><td>Hard in general; structure makes it practical</td></tr></tbody></table>
<h3>Exit ticket: finish the plan</h3>
<div class="rule">${f("Init( At(C1, SFO) ∧ At(P1, SFO) )")} &nbsp; ${f("Goal( At(C1, JFK) )")}</div>
<ol><li>Load(C1, P1, SFO) — given</li><li>Fly( ___ , ___ , ___ )</li><li>______ (C1, P1, JFK)</li></ol>
${K.tryit("Fill in the two blanks and check each precondition.", "2. Fly(P1, SFO, JFK): needs At(P1, SFO) ✓. 3. Unload(C1, P1, JFK): needs In(C1, P1) ✓ and At(P1, JFK) ✓. Goal reached.")}`,
  cards: [
    ["Represent", "Facts, Init/Goal, action schemas, RESULT."],
    ["Search", "Forward (applicable), backward (relevant), SAT (logic per time step)."],
    ["Heuristics", "Relax, solve, use the length: goal count, ignore preconditions, h_FF, h_max/h_add."],
    ["Extensions", "Hierarchy (HLAs), uncertainty (belief states), time (critical path)."]
  ],
  check: { q: "Which statement best summarizes Chapter 11?", options: ["Planning is just BFS", "Write problems as facts and schemas, then search with automatically derived heuristics, and extend for hierarchy, uncertainty and time", "Planning needs a human heuristic for every problem", "Planning only works for airports"] },
  mcq: [
    { q: "Init {At(C1, SFO), At(P1, SFO)}; after Load(C1, P1, SFO), which action comes next toward At(C1, JFK)?", options: ["Unload(C1, P1, SFO)", "Fly(P1, SFO, JFK)", "Load(C1, P1, JFK)", "Fly(P1, JFK, SFO)"] },
    { q: "Which heuristic is computed by ignoring delete lists?", options: ["Goal count", "Set cover", "h_FF", "Slack"] }
  ]
}
);
})();
