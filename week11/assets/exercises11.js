/* CS650 Week 11 — Try it exercises, one set per module. Each runs in the formal-language workspace.
   expect: the result fields a correct run must produce (checked automatically). */
(function () {
  const AC = `// Air Cargo (textbook §11.1). Upper-case = constants, lower-case = variables.
Init( At(C1, SFO) ∧ At(C2, JFK) ∧ At(P1, SFO) ∧ At(P2, JFK)
  ∧ Cargo(C1) ∧ Cargo(C2) ∧ Plane(P1) ∧ Plane(P2)
  ∧ Airport(SFO) ∧ Airport(JFK) )
Goal( At(C1, JFK) ∧ At(C2, SFO) )

Action( Load(c, p, a),
  PRECOND: At(c, a) ∧ At(p, a) ∧ Cargo(c) ∧ Plane(p) ∧ Airport(a),
  EFFECT: ¬At(c, a) ∧ In(c, p) )
Action( Unload(c, p, a),
  PRECOND: In(c, p) ∧ At(p, a) ∧ Cargo(c) ∧ Plane(p) ∧ Airport(a),
  EFFECT: At(c, a) ∧ ¬In(c, p) )
Action( Fly(p, from, to),
  PRECOND: At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to) ∧ from ≠ to,
  EFFECT: ¬At(p, from) ∧ At(p, to) )`;
  const TIRE = `// Spare tire (textbook §11.1)
Init( Tire(Flat) ∧ Tire(Spare) ∧ At(Flat, Axle) ∧ At(Spare, Trunk) )
Goal( At(Spare, Axle) )

Action( Remove(obj, loc),
  PRECOND: At(obj, loc),
  EFFECT: ¬At(obj, loc) ∧ At(obj, Ground) )
Action( PutOn(t, Axle),
  PRECOND: Tire(t) ∧ At(t, Ground) ∧ ¬At(Flat, Axle) ∧ ¬At(Spare, Axle),
  EFFECT: ¬At(t, Ground) ∧ At(t, Axle) )
Action( LeaveOvernight,
  PRECOND: ⊤,
  EFFECT: ¬At(Spare, Ground) ∧ ¬At(Spare, Axle) ∧ ¬At(Spare, Trunk)
        ∧ ¬At(Flat, Ground) ∧ ¬At(Flat, Axle) ∧ ¬At(Flat, Trunk) )`;
  const BLOCKS = `// Blocks world (textbook §11.1): C sits on A; build the tower A on B on C.
Init( On(A, Table) ∧ On(B, Table) ∧ On(C, A)
  ∧ Clear(B) ∧ Clear(C) ∧ Block(A) ∧ Block(B) ∧ Block(C) )
Goal( On(A, B) ∧ On(B, C) )

Action( Move(b, x, y),
  PRECOND: On(b, x) ∧ Clear(b) ∧ Clear(y) ∧ Block(b) ∧ Block(y)
           ∧ b ≠ x ∧ b ≠ y ∧ x ≠ y,
  EFFECT: On(b, y) ∧ Clear(x) ∧ ¬On(b, x) ∧ ¬Clear(y) )
Action( MoveToTable(b, x),
  PRECOND: On(b, x) ∧ Clear(b) ∧ Block(b) ∧ Block(x),
  EFFECT: On(b, Table) ∧ Clear(x) ∧ ¬On(b, x) )`;
  const NG = `// Northgate General: Maria's surgical pathway
Init( At(Maria, PreOp) ∧ At(Okafor, PreOp) ∧ At(Priya, PreOp)
  ∧ Patient(Maria) ∧ Surgeon(Okafor) ∧ Nurse(Priya) ∧ OR(OR3) )
Goal( At(Maria, Recovery) ∧ SurgeryComplete(Maria) )

Action( Prep(p, n),
  PRECOND: Patient(p) ∧ Nurse(n) ∧ At(p, PreOp) ∧ At(n, PreOp),
  EFFECT: Prepped(p) )
Action( TransferToOR(p, o),
  PRECOND: Patient(p) ∧ OR(o) ∧ Prepped(p) ∧ At(p, PreOp) ∧ ¬Occupied(o),
  EFFECT: At(p, o) ∧ Occupied(o) ∧ ¬At(p, PreOp) )
Action( Operate(s, p, o),
  PRECOND: Surgeon(s) ∧ Patient(p) ∧ OR(o) ∧ At(p, o) ∧ At(s, o),
  EFFECT: SurgeryComplete(p) )
Action( TransferToRecovery(p, o),
  PRECOND: Patient(p) ∧ OR(o) ∧ At(p, o) ∧ SurgeryComplete(p),
  EFFECT: At(p, Recovery) ∧ ¬At(p, o) ∧ ¬Occupied(o) )`;
  const SCRUB = `
Action( ScrubIn(s, o),
  PRECOND: Surgeon(s) ∧ OR(o) ∧ At(s, PreOp),
  EFFECT: At(s, o) ∧ ¬At(s, PreOp) )`;
  const NG2 = NG + SCRUB;
  const AC3 = `// A bigger Air Cargo: 3 cargo, 2 planes, 3 airports
Init( At(C1, SFO) ∧ At(C2, JFK) ∧ At(C3, ORD) ∧ At(P1, SFO) ∧ At(P2, JFK)
  ∧ Cargo(C1) ∧ Cargo(C2) ∧ Cargo(C3) ∧ Plane(P1) ∧ Plane(P2)
  ∧ Airport(SFO) ∧ Airport(JFK) ∧ Airport(ORD) )
Goal( At(C1, JFK) ∧ At(C2, ORD) ∧ At(C3, SFO) )

Action( Load(c, p, a),
  PRECOND: At(c, a) ∧ At(p, a) ∧ Cargo(c) ∧ Plane(p) ∧ Airport(a),
  EFFECT: ¬At(c, a) ∧ In(c, p) )
Action( Unload(c, p, a),
  PRECOND: In(c, p) ∧ At(p, a) ∧ Cargo(c) ∧ Plane(p) ∧ Airport(a),
  EFFECT: At(c, a) ∧ ¬In(c, p) )
Action( Fly(p, from, to),
  PRECOND: At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to) ∧ from ≠ to,
  EFFECT: ¬At(p, from) ∧ At(p, to) )`;
  const SHARE = `// Three packages, one plane, all going to JFK
Init( At(C1, SFO) ∧ At(C2, SFO) ∧ At(C3, SFO) ∧ At(P1, SFO)
  ∧ Cargo(C1) ∧ Cargo(C2) ∧ Cargo(C3) ∧ Plane(P1) ∧ Airport(SFO) ∧ Airport(JFK) )
Goal( At(C1, JFK) ∧ At(C2, JFK) ∧ At(C3, JFK) )

Action( Load(c, p, a),
  PRECOND: At(c, a) ∧ At(p, a) ∧ Cargo(c) ∧ Plane(p) ∧ Airport(a),
  EFFECT: ¬At(c, a) ∧ In(c, p) )
Action( Unload(c, p, a),
  PRECOND: In(c, p) ∧ At(p, a) ∧ Cargo(c) ∧ Plane(p) ∧ Airport(a),
  EFFECT: At(c, a) ∧ ¬In(c, p) )
Action( Fly(p, from, to),
  PRECOND: At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to) ∧ from ≠ to,
  EFFECT: ¬At(p, from) ∧ At(p, to) )`;
  const B5 = `// Five blocks: two stacks, rebuild as one tower A-B-C-D-E
Init( On(A, Table) ∧ On(B, A) ∧ On(C, B) ∧ On(D, Table) ∧ On(E, D)
  ∧ Clear(C) ∧ Clear(E)
  ∧ Block(A) ∧ Block(B) ∧ Block(C) ∧ Block(D) ∧ Block(E) )
Goal( On(A, B) ∧ On(B, C) ∧ On(C, D) ∧ On(D, E) )

Action( Move(b, x, y),
  PRECOND: On(b, x) ∧ Clear(b) ∧ Clear(y) ∧ Block(b) ∧ Block(y)
           ∧ b ≠ x ∧ b ≠ y ∧ x ≠ y,
  EFFECT: On(b, y) ∧ Clear(x) ∧ ¬On(b, x) ∧ ¬Clear(y) )
Action( MoveToTable(b, x),
  PRECOND: On(b, x) ∧ Clear(b) ∧ Block(b) ∧ Block(x),
  EFFECT: On(b, Table) ∧ Clear(x) ∧ ¬On(b, x) )`;
  const CARS = `// Two cars (textbook §11.6). DURATION in minutes; ≺ means "must come before".
Action( AddEngine1, DURATION: 30, USE: EngineHoists(1) )
Action( AddEngine2, DURATION: 60, USE: EngineHoists(1) )
Action( AddWheels1, DURATION: 30, USE: WheelStations(1) )
Action( AddWheels2, DURATION: 15, USE: WheelStations(1) )
Action( Inspect1,   DURATION: 10, USE: Inspectors(1) )
Action( Inspect2,   DURATION: 10, USE: Inspectors(1) )

AddEngine1 ≺ AddWheels1 ≺ Inspect1
AddEngine2 ≺ AddWheels2 ≺ Inspect2`;
  const HOSP = `// Northgate: two surgical pathways sharing staff
Action( PrepMaria,    DURATION: 20, USE: Nurses(1) )
Action( SurgeryMaria, DURATION: 45, USE: ORs(1) ∧ Anesthesiologists(1) )
Action( CheckMaria,   DURATION: 10, USE: Nurses(1) )
Action( PrepDavid,    DURATION: 20, USE: Nurses(1) )
Action( SurgeryDavid, DURATION: 60, USE: ORs(1) ∧ Anesthesiologists(1) )
Action( CheckDavid,   DURATION: 10, USE: Nurses(1) )

PrepMaria ≺ SurgeryMaria ≺ CheckMaria
PrepDavid ≺ SurgeryDavid ≺ CheckDavid

Resources( ORs(2), Nurses(2), Anesthesiologists(1) )`;
  const PAINT = `// Painting with no sensors: the paint colours are unknown.
Init( Object(Table) ∧ Object(Chair) ∧ Can(C1) ∧ Can(C2)
  ∧ OneOf(Color(C1, Red), Color(C1, Blue))
  ∧ OneOf(Color(C2, Red), Color(C2, Green)) )
// any colour c will do, as long as the chair and the table match
Goal( Color(Chair, c) ∧ Color(Table, c) )

Action( Paint(x, can),
  PRECOND: Object(x) ∧ Can(can) ∧ Color(can, c),
  EFFECT: Color(x, c) )`;
  const DX = `// Northgate: Maria's diagnosis is hidden until a test is done.
Init( Patient(Maria)
  ∧ OneOf(Has(Maria, Appendicitis), Has(Maria, Gastroenteritis)) )
Goal( Treated(Maria) ∧ ¬Harmed(Maria) )

Action( Operate(p),
  PRECOND: Patient(p),
  EFFECT: when Has(p, Appendicitis): Treated(p)
        ∧ when Has(p, Gastroenteritis): Harmed(p) )
Action( Antibiotics(p),
  PRECOND: Patient(p),
  EFFECT: when Has(p, Gastroenteritis): Treated(p) )`;

  window.LAB_TRYIT = {
  intro: [
    { id: "i1", mode: "logic", run: "tt", title: "Truth table of ⇒ (Ch 7)",
      why: "Every precondition and effect in Chapter 11 is a logical sentence. Knowing exactly when ⇒ is true is the foundation for reading them.",
      task: "Run the truth table. In which single row is <code>P ⇒ Q</code> false? Then add a second line <code>Q ⇒ P</code> and run again: are the two sentences equivalent?",
      code: "P ⇒ Q", expect: { cmd: "tt" },
      notice: "P ⇒ Q is false only when P is true and Q is false. Q ⇒ P differs in two rows, so an implication and its converse are not the same." },
    { id: "i2", mode: "logic", run: "ent", title: "Entailment at Northgate (Ch 7)",
      why: "KB ⊨ α is the question every reasoning agent asks. A planner's goal test (is every goal fact true in the final state?) is the same idea.",
      task: "Run the entailment check. Then delete the line <code>HighHR</code> and run again: what counterexample does the checker give?",
      code: "// Knowledge base (one sentence per line)\nFever ∧ HighHR ⇒ SepsisRisk\nFever\nHighHR\n// the query α\n? SepsisRisk",
      expect: { cmd: "ent", value: true, label: "the KB should entail SepsisRisk" },
      notice: "Without HighHR, a model with Fever = T and HighHR = F makes the KB true but SepsisRisk false, so the entailment fails." },
    { id: "i3", mode: "logic", run: "cnf", title: "Convert to CNF (Ch 7)",
      why: "SAT planning (§11.2) hands a planner's clauses to a SAT solver, and SAT solvers only read conjunctive normal form.",
      task: "Run the conversion and follow the four steps. Then convert <code>Load ⇒ In ∧ ¬AtAirport</code>, which is a planning effect axiom. How many clauses does it give?",
      code: "B11 ⇔ (P12 ∨ P21)", expect: { cmd: "cnf" },
      notice: "An effect axiom a ⇒ (x ∧ ¬y) becomes two clauses, (¬a ∨ x) and (¬a ∨ ¬y). That is exactly how SATPlan writes effects." },
    { id: "i4", mode: "logic", run: "res", title: "Proof by resolution (Ch 7)",
      why: "Resolution proves KB ⊨ α by showing KB ∧ ¬α is impossible. This refutation idea returns in SAT planning: UNSAT means no plan of that length.",
      task: "Run the resolution proof and read each step. Which two clauses produce the empty clause □?",
      code: "// Wumpus world: no breeze in [1,1]\nB11 ⇔ (P12 ∨ P21)\n¬B11\n? ¬P12",
      expect: { cmd: "res", value: true, label: "the proof should reach the empty clause" } },
    { id: "i5", mode: "fol", run: "eval", title: "Quantifiers in a world (Ch 8)", why: "Planning schemas use variables exactly like ∀ in first-order logic: Load(c, p, a) holds for every cargo, plane and airport.", task: "Run it: the sentence is false. Read the counterexample, then <b>add one fact</b> so that every patient is treated by someone, and run again.", code: "Domain: Maria, David, Okafor, Priya\nPatient(Maria). Patient(David).\nSurgeon(Okafor). Nurse(Priya).\nTreats(Okafor, Maria).\n\n? ∀p Patient(p) ⇒ ∃s Treats(s, p)", expect: { cmd: "eval", value: true, label: "make the ∀ sentence true by adding a Treats fact" }, hint: "The counterexample names the patient nobody treats. Write a Treats(…, …) fact for that patient." },
    { id: "i6", mode: "fol", run: "unify", title: "Unification (Ch 9)",
      why: "Grounding an action schema means finding a substitution θ, just as unification does. Load(c, p, a) with θ = {c/C1, p/P1, a/SFO} becomes Load(C1, P1, SFO).",
      task: "Run it and read the trace. Then change the second sentence to <code>Knows(x, Elizabeth)</code>: why does it fail, and how does renaming x to x17 (standardizing apart) fix it?",
      code: "Unify: Knows(John, x) | Knows(y, Mother(y))", expect: { cmd: "unify", value: true } },
    { id: "i7", mode: "fol", run: "eval", title: "Categories and inheritance (Ch 10)",
      why: "Planning domains use type predicates such as Patient(p) and Cargo(c). Categories organize these types, and members inherit from every category above them.",
      task: "Run it to see Maria inherit membership in People. Then add <code>David ∈ Patients.</code> and ask <code>? David ∈ SurgicalPatients</code>: is it true?",
      code: "Maria ∈ SurgicalPatients.\nSurgicalPatients ⊂ Patients.\nPatients ⊂ People.\n\n? Maria ∈ People",
      expect: { cmd: "eval", value: true } }
  ],
  s111: [
    { id: "a1", mode: "plan", run: "step", title: "Apply RESULT by hand",
      why: "Every planner, whatever its search strategy, repeats one step: find an applicable action and compute RESULT(s, a) = (s − DEL) ∪ ADD.",
      task: "Press <b>Step through by hand</b>. Click the applicable action, watch At(P1, SFO) leave the state and At(P1, JFK) arrive, and reach the goal.",
      code: "// The tiny example from slide 8\nInit( At(P1, SFO) ∧ Plane(P1) ∧ Airport(SFO) ∧ Airport(JFK) )\nGoal( At(P1, JFK) )\n\nAction( Fly(p, from, to),\n  PRECOND: At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to) ∧ from ≠ to,\n  EFFECT: ¬At(p, from) ∧ At(p, to) )",
      expect: { cmd: "step", label: "apply actions until the goal is reached" },
      notice: "Plane(P1) and the Airport facts never change. Facts an action doesn't mention ride along unchanged." },
    { id: "a2", mode: "plan", run: "bfs", title: "Solve Air Cargo",
      why: "This is the chapter's main example: three schemas, two planes, two cargo. A domain-independent planner solves it with no hints.",
      task: "Run forward search. Open each step to see its preconditions, its delete and add lists, and the new state. Is the plan the same six steps as slide 14?",
      code: AC, expect: { cmd: "bfs", found: true, length: 6, label: "expected a 6-step plan" },
      notice: "Cargo inside a plane is at no airport, so Fly never has to update the cargo." },
    { id: "a3", mode: "plan", run: "bfs", title: "Spare tire: not every action helps",
      why: "Planners must choose only actions that help. LeaveOvernight is always applicable, but it destroys the state.",
      task: "Run it and check that LeaveOvernight is never used. Then change the goal to <code>At(Spare, Axle) ∧ At(Flat, Trunk)</code>: why is there now no plan?",
      code: TIRE, expect: { cmd: "bfs", found: true, length: 3 },
      notice: "Nothing can ever add At(Flat, Trunk), because no effect puts a tire in the trunk. A planner proves this by exhausting the reachable states." },
    { id: "a4", mode: "plan", run: "bfs", title: "Blocks world: undo before you build",
      why: "Goals interact. Pursuing On(A, B) first gets stuck because C sits on A.",
      task: "Run it. Then use <b>Step through by hand</b> and try to put A on B first. Which precondition blocks you?",
      code: BLOCKS, expect: { cmd: "bfs", found: true, length: 3 },
      notice: "The first action, MoveToTable(C, A), achieves no goal fact directly, but it makes Clear(A) true." },
    { id: "a5", mode: "plan", run: "bfs", title: "Northgate: find the modelling gap", why: "Planners check every precondition. Slide 20 noted that Operate needs Dr. Okafor in the room, yet nothing moves him there.", task: "Run it: there is <b>no plan</b>. Find the missing piece and <b>write a new action schema</b> that moves a surgeon from PreOp into an operating room. Run again until you get a 5-step plan.", code: NG, expect: { cmd: "bfs", found: true, length: 5, label: "add an action that moves the surgeon, then expect 5 steps" }, hint: "Copy the pattern of TransferToOR: PRECOND Surgeon(s) ∧ OR(o) ∧ At(s, PreOp); EFFECT At(s, o) ∧ ¬At(s, PreOp)." },
    { id: "a6", mode: "plan", run: "bfs", title: "Fix the bug: a missing delete list", why: "The delete list keeps the world consistent. Without it, an object can be in two places at once.", task: "Fly has lost its delete list. Run it: the plan has only 5 steps because P1 is at SFO and JFK at the same time. Restore <code>¬At(p, from)</code> in Fly's EFFECT and run again.", code: AC.replace("EFFECT: ¬At(p, from) ∧ At(p, to) )", "EFFECT: At(p, to) )"), expect: { cmd: "bfs", found: true, length: 6, label: "once the plane can only be in one place, the plan has 6 steps" } }
  ],
  s112: [
    { id: "b1", mode: "plan", run: "back", title: "Forward vs backward search",
      why: "PDDL is a description, so we can search in either direction. Regression considers only relevant actions, but its states are goal descriptions.",
      task: "Run <b>Backward search</b> and read the regression trace. Then run <b>Forward search (BFS)</b> and compare nodes expanded. Which actions were relevant to the original goal?",
      code: AC, expect: { cmd: "back", found: true, length: 6 },
      notice: "Only Unload actions are relevant at the first step, far fewer than the actions applicable at Init. In this grounded version, backward search still expands more nodes. That is one reason modern planners search forward with heuristics." },
    { id: "b2", mode: "plan", run: "back", title: "Regress a single goal",
      why: "Slide 27: regressing At(C2, SFO) through Unload gives the goal In(C2, p) ∧ At(p, SFO).",
      task: "Run backward search for the single goal and read the first regression step. Do the new goal facts match slide 27, with the plane now chosen?",
      code: AC.replace("Goal( At(C1, JFK) ∧ At(C2, SFO) )", "Goal( At(C2, SFO) )"), expect: { cmd: "back", found: true, length: 3 } },
    { id: "b3", mode: "plan", run: "sat", title: "Planning as satisfiability",
      why: "SATPlan asks whether a plan of exactly k steps exists, and increases k until the answer is yes.",
      task: "Run SAT planning. For which k values is the formula unsatisfiable? Read the sample precondition and effect clauses.",
      code: TIRE, expect: { cmd: "sat", found: true, k: 3 },
      notice: "Each clause looks trivial; the solver finds a truth assignment that satisfies thousands of them at once, and the true action variables are the plan." },
    { id: "b4", mode: "plan", run: "cmp", title: "The branching problem",
      why: "Blind forward search grows exponentially with plan length. One more cargo and one more airport is enough to see it.",
      task: "Compare algorithms on the 3-cargo problem. How many nodes does blind BFS expand compared with A* using the ignore-delete-lists heuristic?",
      code: AC3, expect: { cmd: "cmp" } },
    { id: "b5", mode: "plan", run: "step", title: "A partial order in practice",
      why: "A partial-order plan leaves independent actions unordered. In the spare tire plan the two Removes are independent.",
      task: "Step through by hand: do <b>Remove(Spare, Trunk)</b> first, then <b>Remove(Flat, Axle)</b>, then PutOn. Does the opposite order of BFS still reach the goal?",
      code: TIRE, expect: { cmd: "step", label: "reach the goal by hand" } }
  ],
  s113: [
    { id: "c1", mode: "plan", run: "h", title: "Relaxed heuristics at Init",
      why: "Planners compute heuristics themselves by relaxing the problem. Compare ignore preconditions (h = 2) and ignore delete lists (h = 6) with the true cost.",
      task: "Run <b>Heuristics at Init</b>. Which heuristics are admissible here, and which is closest to h*? Open the details of the ignore-delete-lists relaxed plan.",
      code: AC, expect: { cmd: "h", "h.setcover": 2, "h.ff": 6, "h.hstar": 6 } },
    { id: "c2", mode: "plan", run: "h", title: "MAX vs SUM: shared work",
      why: "Slide 43: one flight can deliver three packages. Adding each goal's separate cost counts that flight three times.",
      task: "Run the heuristics. Is h_add (SUM) admissible here? Compare it with h_max (MAX) and h*.",
      code: SHARE, expect: { cmd: "h", "h.hadd": 9, "h.hstar": 7 },
      notice: "SUM = 9 > 7 = h*: it overestimates because the goals share the Load-Fly-Unload chain. MAX = 2 is admissible but loose." },
    { id: "c3", mode: "plan", run: "cmp", title: "Heuristics vs blind search",
      why: "A good heuristic is the difference between solving instantly and never finishing.",
      task: "Compare algorithms on the five-block problem. How many nodes does A* with h_FF expand compared with blind BFS? Did any algorithm give up?",
      code: B5, expect: { cmd: "cmp" } },
    { id: "c4", mode: "plan", run: "h", title: "The same heuristics at Northgate",
      why: "Nobody had to invent a hospital heuristic: the same relaxation code reads Northgate's schemas.",
      task: "Run the heuristics on Maria's pathway. Why is ignore preconditions so optimistic here? Which actions does the relaxed plan use?",
      code: NG2, expect: { cmd: "h", "h.hstar": 5 } }
  ],
  s114: [
    { id: "d1", mode: "htn", run: "htn", title: "Refine Go(Home, SFO)",
      why: "A high-level action has several refinements; the planner keeps refining until it finds an implementation that works.",
      task: "Run it: which refinement works? Then replace <code>CarAvailable</code> with <code>HaveCash</code> in Init and run again. Which implementation is chosen now?",
      code: "Init( At(Home) ∧ CarAvailable ∧ ShuttleStop(LongTermParking) )\nGoal( At(SFO) )\n\nAction( Drive(x, y), PRECOND: At(x) ∧ CarAvailable ∧ x ≠ y, EFFECT: At(y) ∧ ¬At(x) )\nAction( Shuttle(x, y), PRECOND: At(x) ∧ ShuttleStop(x) ∧ x ≠ y, EFFECT: At(y) ∧ ¬At(x) )\nAction( Taxi(x, y), PRECOND: At(x) ∧ HaveCash ∧ x ≠ y, EFFECT: At(y) ∧ ¬At(x) )\n\nRefinement( Go(Home, SFO), STEPS: [Drive(Home, LongTermParking), Shuttle(LongTermParking, SFO)] )\nRefinement( Go(Home, SFO), STEPS: [Taxi(Home, SFO)] )\n\nPlan: [Go(Home, SFO)]",
      expect: { cmd: "htn", found: true } },
    { id: "d2", mode: "htn", run: "reach", title: "The reachable set (angelic semantics)",
      why: "REACH(s, h) lets a planner decide feasibility without choosing a flight, a seat or an airline.",
      task: "Run <b>Reachable set</b>. Then change the goal to <code>At(Boston)</code>. What does REACH ∩ Goal = ∅ tell the planner to do?",
      code: "Init( At(SFO) ∧ Airport(SFO) ∧ Airport(Denver) ∧ Airport(NY) ∧ Station(SFO) ∧ Station(NY) )\nGoal( At(NY) )\n\nAction( Fly(x, y), PRECOND: At(x) ∧ Airport(x) ∧ Airport(y) ∧ x ≠ y, EFFECT: At(y) ∧ ¬At(x) )\nAction( Train(x, y), PRECOND: At(x) ∧ Station(x) ∧ Station(y) ∧ x ≠ y, EFFECT: At(y) ∧ ¬At(x) )\n\nRefinement( Go(SFO, NY), STEPS: [Fly(SFO, NY)] )\nRefinement( Go(SFO, NY), STEPS: [Fly(SFO, Denver), Fly(Denver, NY)] )\nRefinement( Go(SFO, NY), STEPS: [Train(SFO, NY)] )\n\nPlan: [Go(SFO, NY)]",
      expect: { cmd: "reach", feasible: true } },
    { id: "d3", mode: "htn", run: "htn", title: "Admit(Maria) with OR3 occupied",
      why: "Slide 56: the scheduled intake needs a free room; the fast-track does not. One working implementation makes the HLA feasible.",
      task: "Run it and open the list of implementations checked. Why did the scheduled intake fail? Then run <b>Reachable set</b>.",
      code: "Init( At(Maria, PreOp) ∧ Occupied(OR3) ∧ Patient(Maria) ∧ OR(OR3) )\nGoal( At(Maria, OR3) )\n\nAction( Register(p), PRECOND: Patient(p), EFFECT: Registered(p) )\nAction( Prep(p), PRECOND: Registered(p), EFFECT: Prepped(p) )\nAction( TransferToOR(p, o),\n  PRECOND: Patient(p) ∧ OR(o) ∧ Prepped(p) ∧ At(p, PreOp) ∧ ¬Occupied(o),\n  EFFECT: At(p, o) ∧ Occupied(o) ∧ ¬At(p, PreOp) )\nAction( TriageOverride(p, o),\n  PRECOND: Patient(p) ∧ OR(o) ∧ Occupied(o),\n  EFFECT: ¬Occupied(o) ∧ Prepped(p) )\n\n// scheduled intake\nRefinement( Admit(Maria), STEPS: [Register(Maria), Prep(Maria), TransferToOR(Maria, OR3)] )\n// emergency fast-track\nRefinement( Admit(Maria), STEPS: [TriageOverride(Maria, OR3), TransferToOR(Maria, OR3)] )\n\nPlan: [Admit(Maria)]",
      expect: { cmd: "htn", found: true, length: 2 } },
    { id: "d4", mode: "htn", run: "htn", title: "Write your own refinement", why: "A refinement library is expert know-how. Writing one is how a hospital's procedures become a planner's knowledge.", task: "Run it: no refinement matches <code>Discharge(Maria)</code>. Write one: <code>Refinement( Discharge(p), STEPS: [ … ] )</code> using the primitive actions given, in an order whose preconditions work.", code: "Init( Patient(Maria) ∧ At(Maria, Ward) )\nGoal( At(Maria, Home) ∧ HasPrescription(Maria) )\n\nAction( Prescribe(p), PRECOND: Patient(p), EFFECT: HasPrescription(p) )\nAction( SignOut(p), PRECOND: Patient(p) ∧ HasPrescription(p), EFFECT: SignedOut(p) )\nAction( Leave(p), PRECOND: SignedOut(p) ∧ At(p, Ward), EFFECT: At(p, Home) ∧ ¬At(p, Ward) )\n\n// write your Refinement for Discharge here\n\nPlan: [Discharge(Maria)]", expect: { cmd: "htn", found: true, length: 3, label: "write a refinement whose steps reach the goal" }, hint: "SignOut needs HasPrescription, and Leave needs SignedOut. Order the three steps so each one's precondition is already true." }
  ],
  s115: [
    { id: "e1", mode: "belief", run: "belief", title: "The coercion trick",
      why: "With no sensors, the planner tracks a belief state: every world that might be real. Coercion makes the goal true in all of them.",
      task: "Run it. How many worlds does the initial belief state have? Open each step and check that the chair and table match in every world.",
      code: PAINT, expect: { cmd: "belief", found: true, length: 2 } },
    { id: "e2", mode: "belief", run: "belief", title: "When coercion is impossible",
      why: "Coercion only works when the goal doesn't care about the hidden fact. Here the goal demands a specific colour.",
      task: "Run it: there is no sensorless plan. Explain why in one sentence. Which can would you need to look inside first?",
      code: PAINT.replace("Goal( Color(Chair, c) ∧ Color(Table, c) )", "Goal( Color(Chair, Red) ∧ Color(Table, Red) )").replace("// any colour c will do, as long as the chair and the table match\n", "// now the furniture must be RED\n"),
      expect: { cmd: "belief", found: false, label: "this problem should have NO sensorless plan" } },
    { id: "e3", mode: "belief", run: "belief", title: "Conditional effects in the vacuum world",
      why: "Suck's effect depends on where the robot is. If the location is unknown, both outcomes must be kept, and beliefs can grow.",
      task: "Run it and watch the belief-state size at each step. Why does the plan start with <b>Left</b>, an action that doesn't clean anything?",
      code: "// The robot doesn't know which square it is on.\nInit( OneOf(AtL, AtR) )\nGoal( CleanL ∧ CleanR )\n\nAction( Left,  PRECOND: ⊤, EFFECT: AtL ∧ ¬AtR )\nAction( Right, PRECOND: ⊤, EFFECT: AtR ∧ ¬AtL )\nAction( Suck,  PRECOND: ⊤, EFFECT: when AtL: CleanL ∧ when AtR: CleanR )",
      expect: { cmd: "belief", found: true, length: 4 },
      notice: "Left coerces the location: after it, the belief state has one world, so every later step is certain." },
    { id: "e4", mode: "belief", run: "belief", title: "Why Northgate never uses coercion",
      why: "The right treatment depends on the hidden diagnosis, so no single sequence of actions is safe in every world.",
      task: "Run it: no sensorless plan exists. Now pretend antibiotics cured both conditions (make Antibiotics' effect simply <code>Treated(p)</code>) and run again. What changed, and why is that not realistic?",
      code: DX, expect: { cmd: "belief", found: false, label: "the original problem should have NO sensorless plan" },
      notice: "The safe plan senses first: [OrderCTScan(Maria), if Appendicitis then surgery else antibiotics]. That is a contingent plan." }
  ],
  s116: [
    { id: "f1", mode: "sched", run: "sched", title: "Critical path for two cars",
      why: "ES, LS and slack tell a manager which steps can slip and which delay everything.",
      task: "Schedule it. Which actions have zero slack? What is the makespan? Why is this schedule impossible with one engine hoist?",
      code: CARS, expect: { cmd: "sched", makespan: 85 } },
    { id: "f2", mode: "sched", run: "sched", title: "Add the resource limits", why: "Shared resources create either-or choices that make scheduling NP-hard.", task: "Add this line at the end and schedule again: <code>Resources( EngineHoists(1), WheelStations(1), Inspectors(2) )</code>. Compare the best schedule (115) with the minimum-slack heuristic (130). Why does the greedy rule lose?", code: CARS, expect: { cmd: "sched", value: 115, "minSlack.makespan": 130, label: "add the Resources line, then expect 115 (best) and 130 (minimum slack)" } },
    { id: "f3", mode: "sched", run: "sched", title: "Two patients, one anesthesiologist",
      why: "Slide 81: the operating rooms are never the bottleneck. A single specialist is.",
      task: "Schedule it. Without the anesthesiologist both finish by 90; with one, what is the best finish time? Which surgery goes first?",
      code: HOSP, expect: { cmd: "sched", value: 135 } },
    { id: "f4", mode: "sched", run: "sched", title: "Fix the bottleneck", why: "Finding what is actually scarce tells the charge nurse where one extra person helps most.", task: "Change the resources so the day finishes by 90 minutes. Will a third OR help? Try it first, then add the resource that really matters.", code: HOSP, expect: { cmd: "sched", value: 90, label: "make both pathways finish by 90 minutes" }, hint: "Edit only the Resources line. More ORs change nothing; a second anesthesiologist lets the surgeries overlap." }
  ],
  s117: [
    { id: "g1", mode: "plan", run: "cmp", title: "A planner portfolio",
      why: "No single algorithm wins everywhere. Portfolio planners such as Fast Downward Stone Soup run several and keep the best.",
      task: "Compare algorithms on the 3-cargo problem. Read the line above the table: how many possible facts, and so how many possible states (2ⁿ)? Which algorithm would you run first?",
      code: AC3, expect: { cmd: "cmp" } },
    { id: "g2", mode: "plan", run: "bfs", title: "Same code, two worlds",
      why: "Domain independence: the same algorithm runs on cargo and on patient care. Only the schemas change.",
      task: "Run forward search on two patients sharing one operating room. Notice that the planner sequences the patients so OR3 is freed in between, with no hospital-specific code.",
      code: NG2.replace("// Northgate General: Maria's surgical pathway", "// Northgate: two patients, one operating room").replace("Init( At(Maria, PreOp) ∧ At(Okafor, PreOp) ∧ At(Priya, PreOp)\n  ∧ Patient(Maria) ∧ Surgeon(Okafor) ∧ Nurse(Priya) ∧ OR(OR3) )", "Init( At(Maria, PreOp) ∧ At(David, PreOp) ∧ At(Okafor, PreOp) ∧ At(Priya, PreOp)\n  ∧ Patient(Maria) ∧ Patient(David) ∧ Surgeon(Okafor) ∧ Nurse(Priya) ∧ OR(OR3) )").replace("Goal( At(Maria, Recovery) ∧ SurgeryComplete(Maria) )", "Goal( At(Maria, Recovery) ∧ At(David, Recovery) )"),
      expect: { cmd: "bfs", found: true, length: 9 } },
    { id: "g3", mode: "plan", run: "cmp", title: "Structure beats raw power",
      why: "The five-block problem has 2⁴¹ possible states, yet a relaxed heuristic solves it almost instantly.",
      task: "Compare algorithms. Which ones exploit structure (heuristics) and which search blindly? Did backward search finish within its time budget?",
      code: B5, expect: { cmd: "cmp" } }
  ],
  wrap: [
    { id: "w1", mode: "belief", run: "belief", title: "Closed world vs belief state",
      why: "Closing question 3: with belief states, an unlisted fact is unknown, not false.",
      task: "Run it: the diagnosis is known, so the belief state has one world and the plan is simple. Then replace <code>Has(Maria, Appendicitis)</code> with <code>OneOf(Has(Maria, Appendicitis), Has(Maria, Gastroenteritis))</code> and run again.",
      code: DX.replace("∧ OneOf(Has(Maria, Appendicitis), Has(Maria, Gastroenteritis)) )", "∧ Has(Maria, Appendicitis) )").replace("// Northgate: Maria's diagnosis is hidden until a test is done.", "// Northgate: the diagnosis is KNOWN"),
      expect: { cmd: "belief", found: true, length: 1 } },
    { id: "w2", mode: "plan", run: "h", title: "Closing question 2, measured",
      why: "Ignore delete lists keeps the preconditions, so its relaxed plan still makes actions legal. That is why it is closer than ignoring preconditions.",
      task: "Run the heuristics on Air Cargo and on the blocks world (paste either problem from earlier). In both, is the ignore-delete-lists value closer to h* than ignore preconditions?",
      code: AC, expect: { cmd: "h" } },
    { id: "w3", mode: "plan", run: "bfs", title: "Challenge: write a whole problem", why: "Representation is the first third of planning. If you can write the problem down, the planner does the rest.", task: "Write a planning problem of your own: a <b>Discharge</b> pathway, a hospital supply run, or a campus errand. Use at least two action schemas and a goal with two facts. Run it until the planner finds a plan.", code: "// Your problem. Start from this skeleton.\nInit(  )\nGoal(  )\n\nAction( Name(x),\n  PRECOND: ,\n  EFFECT:  )", expect: { cmd: "bfs", found: true, "length>=": 2, label: "write a solvable problem that needs at least two actions" } }
  ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = window.LAB_TRYIT;
})();
