// CS 650 Chapters 7–8 Lab — practice content.
// cards: [front, back]; checks: [statement, true/false, explanation]; mcq: {q, o: options, a: index of correct option, why, ref: slide number to review}
window.LAB_QUIZ = {
"ch7-s1": {
  cards: [
    ["Knowledge base (KB)", "The agent’s “notebook”: a set of sentences it believes are true — facts and rules written in a formal language."],
    ["TELL", "Adds a new sentence to the knowledge base. Example: TELL(KB, LowOxygen_Maria) records a new reading."],
    ["ASK", "Puts a question to the knowledge base. The answer must follow from what the KB already contains."],
    ["Inference", "Deriving new sentences from the ones already in the KB, without being told them directly."],
    ["The agent loop", "Every time step: TELL the KB what was perceived, ASK it what action to take, then TELL it which action was taken."],
    ["Declarative vs procedural", "Declarative: tell the agent what is true and let inference decide what to do. Procedural: write the behaviour directly as code."]
  ],
  checks: [
    ["ASK may return an answer that does not follow from the knowledge base.", false, "An answer from ASK must follow from (be entailed by) what is in the KB."],
    ["In each step of the loop, the agent TELLs its percept before it ASKs for an action.", true, "Percept first, so the question is answered using the newest information."],
    ["The declarative approach means writing the agent’s exact behaviour as program code.", false, "That is the procedural approach. Declarative means stating facts and rules, and letting inference work out the behaviour."]
  ],
  mcq: [
    {q: "Which operation adds a new fact to a knowledge base?", o: ["ASK", "TELL", "Inference", "A percept"], a: 1, why: "TELL writes a sentence into the KB. ASK only queries it; inference derives new sentences from existing ones.", ref: 8},
    {q: "A KB contains “If the door is locked, use the key” and “The door is locked.” The agent concludes “use the key.” What is this called?", o: ["TELL", "Inference", "A percept", "A procedural rule"], a: 1, why: "Nobody told the agent “use the key”; it derived it from two sentences already in the KB. That is inference.", ref: 12},
    {q: "What is the order of operations in one step of the knowledge-based agent loop?", o: ["ASK for an action → TELL the percept → TELL the action", "TELL the percept → ASK for an action → TELL the action", "TELL the action → ASK → TELL the percept", "ASK → ASK → TELL"], a: 1, why: "The agent records what it perceives, asks what to do, then records what it did.", ref: 14},
    {q: "What is the main advantage of the declarative approach?", o: ["No inference is needed", "New knowledge can be added without rewriting the program", "It is always faster", "It can never make a mistake"], a: 1, why: "Because behaviour comes from facts plus inference, you extend the agent by TELLing it more, not by reprogramming it.", ref: 18},
    {q: "What is a “sentence” in a knowledge base?", o: ["A paragraph of English", "A statement written in a knowledge-representation language", "A function in the agent’s program", "A sensor reading only"], a: 1, why: "KB sentences are statements in a formal language, such as propositional logic, that inference can work with.", ref: 8}
  ]
},
"ch7-s2": {
  cards: [
    ["The wumpus", "A beast in one square. Entering its square is fatal. Squares directly next to it (never diagonal) have a stench."],
    ["Pits", "Bottomless holes. Entering one is fatal. Squares directly next to a pit have a breeze."],
    ["The gold", "In one square. The agent perceives glitter only in that square, then can Grab it."],
    ["Neighbours", "The squares directly up, down, left or right of a square. Diagonal squares are never neighbours."],
    ["Percepts", "Five per turn: Stench, Breeze, Glitter, Bump, Scream. Example: [None, Breeze, None, None, None]."],
    ["Performance measure", "+1000 for climbing out with the gold, −1000 for dying, −1 per action, −10 for using the arrow."]
  ],
  checks: [
    ["A breeze in [2,1] means [3,2] could hold a pit.", false, "[3,2] is diagonal to [2,1]. The neighbours of [2,1] are [1,1], [3,1] and [2,2]."],
    ["The agent knows the layout of the cave when it starts.", false, "It only knows the rules of the world. It must discover where the pits and the wumpus are from its percepts."],
    ["Glitter is perceived only in the square that holds the gold.", true, "Unlike breeze and stench, glitter does not spread to neighbouring squares."]
  ],
  mcq: [
    {q: "Which squares are the neighbours of [2,2] in a 4 × 4 cave?", o: ["[1,1], [3,3], [1,3], [3,1]", "[1,2], [3,2], [2,1], [2,3]", "All eight surrounding squares", "[2,1] and [2,3] only"], a: 1, why: "Neighbours are directly left, right, below and above — never diagonal.", ref: 23},
    {q: "The agent is in [3,2] and perceives a stench. It has already visited [3,1] and [2,2] safely. Where could the wumpus be?", o: ["[3,1] or [2,2]", "[4,2] or [3,3]", "[4,1] or [2,3]", "Anywhere in the cave"], a: 1, why: "The wumpus is in a neighbour of [3,2]: [2,2], [4,2], [3,1] or [3,3]. The agent survived [3,1] and [2,2], so only [4,2] and [3,3] remain.", ref: 28},
    {q: "An agent grabs the gold and climbs out after 20 actions in total (including Grab and Climb), without shooting. What is its score?", o: ["1000", "980", "990", "−20"], a: 1, why: "+1000 for leaving with the gold, minus 1 for each of the 20 actions: 1000 − 20 = 980.", ref: 29},
    {q: "The agent perceives [None, Breeze, None, None, None]. What does it learn?", o: ["The wumpus is next door", "At least one neighbouring square has a pit", "The gold is in this square", "It walked into a wall"], a: 1, why: "The second slot is Breeze, which means a pit in at least one neighbouring square.", ref: 27},
    {q: "Why does the wumpus agent need logical reasoning?", o: ["It can see the whole cave", "It must combine percepts from several squares to work out which squares are safe", "The rules change every turn", "It is told where the pits are"], a: 1, why: "Each percept is only local, so safety has to be inferred by combining clues over time.", ref: 45}
  ]
},
"ch7-s3": {
  cards: [
    ["Syntax", "The grammar of a logic: which strings of symbols are well-formed sentences."],
    ["Semantics", "What makes a sentence true or false in a given world."],
    ["Model (possible world)", "One assignment of true/false to every symbol. Two symbols give 4 models; n symbols give 2ⁿ."],
    ["Entailment  KB ⊨ α", "α is true in every model where the KB is true. No world that fits the KB may make α false."],
    ["Sound", "An inference method that only derives sentences that are entailed. It never draws a false conclusion from true premises."],
    ["Complete", "An inference method that can derive every sentence that is entailed."]
  ],
  checks: [
    ["With 3 symbols there are 8 possible worlds.", true, "Each symbol is T or F: 2 × 2 × 2 = 8."],
    ["KB ⊨ α means α is true in at least one world where the KB is true.", false, "It must be true in every world where the KB is true."],
    ["A sound inference method can sometimes derive a false conclusion from true facts.", false, "Sound means everything it derives is entailed, so true premises always give true conclusions."]
  ],
  mcq: [
    {q: "KB = { A ⇒ B, A }. Does the KB entail B?", o: ["Yes — B is true in every world that fits the KB", "No — there is a world with A true and B false", "Only if B is also in the KB", "It cannot be decided"], a: 0, why: "A must be true, and A ⇒ B then forces B true. The only world that fits is A = T, B = T.", ref: 58},
    {q: "KB = { C ∨ D }. Does the KB entail C?", o: ["Yes", "No — the world C = F, D = T fits the KB", "Yes, because C comes first", "Only if D is false"], a: 1, why: "A counterexample world fits the KB but makes C false, so C is not entailed.", ref: 61},
    {q: "How many possible worlds are there with 4 propositional symbols?", o: ["8", "12", "16", "4"], a: 2, why: "2⁴ = 16.", ref: 51},
    {q: "Which of these inferences is NOT valid?", o: ["From A ⇒ B and A, conclude B", "From A ⇒ B and ¬B, conclude ¬A", "From A ⇒ B and B, conclude A", "From A ∧ B, conclude A"], a: 2, why: "Concluding A from A ⇒ B and B is affirming the consequent: the world A = F, B = T fits both premises.", ref: 62},
    {q: "Truth-table enumeration (checking every world) for propositional logic is…", o: ["Sound but not complete", "Complete but not sound", "Sound and complete", "Neither"], a: 2, why: "It checks every world, so it never gets an answer wrong and never misses an entailed sentence — it is just slow.", ref: 67}
  ]
},
"ch7-s4": {
  cards: [
    ["⇒ (implies)", "A ⇒ B is false only when A is true and B is false. Think of a promise: it is broken only if A happens and B does not."],
    ["⇔ (if and only if)", "A ⇔ B is true when A and B have the same value."],
    ["Order of operations", "Like PEMDAS: ¬ first, then ∧, then ∨, then ⇒, then ⇔. ¬A ∧ B means (¬A) ∧ B."],
    ["Equivalent", "Two sentences that have the same truth value in every world. Example: A ⇒ B and ¬A ∨ B."],
    ["Valid", "True in every world (a tautology). Example: A ∨ ¬A."],
    ["Satisfiable", "True in at least one world. A ∧ ¬A is unsatisfiable: no world makes it true."]
  ],
  checks: [
    ["¬A ∧ B means ¬(A ∧ B).", false, "¬ binds tightest, so ¬A ∧ B means (¬A) ∧ B."],
    ["A ∨ ¬A is valid.", true, "Whatever A is, one of the two sides is true, so it holds in every world."],
    ["A ∧ ¬A is satisfiable.", false, "A cannot be true and false at once, so no world makes it true."]
  ],
  mcq: [
    {q: "With X = T, Y = F, Z = F, what is the value of (X ∧ Y) ⇒ Z?", o: ["True", "False", "Undefined", "Depends on the order"], a: 0, why: "X ∧ Y is false, and an implication with a false left side is true.", ref: 76},
    {q: "Which sentence is equivalent to A ⇒ B?", o: ["B ⇒ A", "¬A ∨ B", "A ∧ ¬B", "¬B ∨ A"], a: 1, why: "A ⇒ B is false only when A = T and B = F — exactly when ¬A ∨ B is false.", ref: 91},
    {q: "How many rows does a truth table for 7 symbols have?", o: ["14", "49", "128", "256"], a: 2, why: "2⁷ = 128. This is why the wumpus truth table grows so quickly.", ref: 88},
    {q: "Which sentence is valid?", o: ["A ∧ B", "A ⇒ ¬A", "(A ⇒ B) ∨ (B ⇒ A)", "A ⇔ ¬A"], a: 2, why: "If A ⇒ B is false, then A = T and B = F, which makes B ⇒ A true. So one side is always true.", ref: 92},
    {q: "Which sentence is unsatisfiable?", o: ["A ∨ B", "A ⇒ B", "A ⇔ ¬A", "¬A"], a: 2, why: "A ⇔ ¬A needs A to equal its own opposite, which no world allows.", ref: 92}
  ]
},
"ch7-s5": {
  cards: [
    ["Modus Ponens", "From α ⇒ β and α, write β."],
    ["Contraposition", "From α ⇒ β, write ¬β ⇒ ¬α."],
    ["Resolution", "Two clauses with a matching pair (a literal and its negation): cancel the pair and join what is left with ∨."],
    ["CNF", "Conjunctive normal form: an AND of clauses, where each clause is an OR of literals."],
    ["Proof by contradiction", "To show KB ⊨ α, add ¬α to the KB. If resolution reaches the empty clause, α must be entailed."],
    ["Definite clause", "A clause with exactly one positive literal, e.g. (A ∧ B) ⇒ C. Forward and backward chaining work on these."],
    ["Forward vs backward chaining", "Forward: start from the facts and fire rules (data-driven). Backward: start from the question and work back to facts (goal-driven)."]
  ],
  checks: [
    ["Resolution is applied to sentences in clause form (CNF).", true, "Resolution works on clauses, so sentences are first converted to CNF."],
    ["Forward chaining starts from the question and works back to the facts.", false, "That is backward chaining. Forward chaining starts from the known facts."],
    ["A definite clause has exactly one positive literal.", true, "For example ¬A ∨ ¬B ∨ C, which is the rule (A ∧ B) ⇒ C."]
  ],
  mcq: [
    {q: "From G ⇒ H and ¬H, how can you derive ¬G with the rules from the lecture?", o: ["Modus Ponens on G ⇒ H", "Contraposition gives ¬H ⇒ ¬G, then Modus Ponens with ¬H gives ¬G", "And-Elimination", "It cannot be derived"], a: 1, why: "Contraposition turns the rule around; Modus Ponens then applies it to ¬H.", ref: 99},
    {q: "What is the result of resolving (K ∨ ¬M) with (M ∨ N)?", o: ["K ∨ N", "K ∨ M ∨ N", "¬M ∨ N", "The empty clause"], a: 0, why: "¬M and M cancel; what is left, K and N, is joined with ∨.", ref: 111},
    {q: "Which is the CNF of C ⇒ (D ∨ E)?", o: ["C ∨ D ∨ E", "¬C ∨ D ∨ E", "(¬C ∨ D) ∧ E", "¬C ∧ (D ∨ E)"], a: 1, why: "α ⇒ β becomes ¬α ∨ β, giving the single clause ¬C ∨ D ∨ E.", ref: 115},
    {q: "To prove KB ⊨ α by resolution, what do you add to the KB before resolving?", o: ["α", "¬α", "Nothing", "α ⇒ KB"], a: 1, why: "Resolution proves by contradiction: if KB ∧ ¬α leads to the empty clause, α is entailed.", ref: 121},
    {q: "Rules: A ∧ B ⇒ C, C ⇒ D, B ⇒ E. Facts: A, B. Which symbols does forward chaining derive?", o: ["C only", "C and D", "C, D and E", "D and E"], a: 2, why: "A and B fire the first rule (C) and the third (E); C then fires the second rule (D).", ref: 130},
    {q: "When is backward chaining usually the better choice?", o: ["When you want every possible conclusion", "When you have one specific question to answer", "When there are no rules", "When the KB is in CNF"], a: 1, why: "Backward chaining only explores rules relevant to the goal, so it suits answering a specific question.", ref: 142}
  ]
},
"ch7-s6": {
  cards: [
    ["The SAT problem", "Is there any assignment of true/false that makes a sentence true? KB ⊨ α exactly when KB ∧ ¬α is unsatisfiable."],
    ["DPLL", "A complete backtracking search for a satisfying assignment, much faster than the full truth table."],
    ["Pure symbol", "A symbol that appears with only one sign in every remaining clause. Set it to make those literals true."],
    ["Unit clause", "A clause with only one literal still unassigned. That literal must be made true."],
    ["WalkSAT", "Local search: start from a random assignment and flip one symbol at a time in a clause that is false."],
    ["Hard region", "Random 3-SAT problems are hardest when the ratio of clauses to symbols is about 4.3."]
  ],
  checks: [
    ["WalkSAT can prove that a sentence is unsatisfiable.", false, "WalkSAT can find a solution, but if it finds none it cannot say none exists."],
    ["DPLL is complete.", true, "It is a systematic search, so it always finds a satisfying assignment if one exists, or proves there is none."],
    ["Early termination lets DPLL stop as soon as one clause is false.", true, "A single false clause makes the whole CNF false, so that branch can be abandoned."]
  ],
  mcq: [
    {q: "Clauses: (A ∨ ¬B), (B ∨ C), (¬C ∨ A). Which symbol is pure?", o: ["A", "B", "C", "None"], a: 0, why: "A appears only positively. B and C each appear with both signs.", ref: 146},
    {q: "A is set to false. Which clause becomes a unit clause?", o: ["(A ∨ D)", "(¬A ∨ D)", "(D ∨ E)", "(¬A)"], a: 0, why: "With A false, (A ∨ D) has only D left unassigned, so D must be true.", ref: 147},
    {q: "To check KB ⊨ α with DPLL, you test whether…", o: ["KB ∧ α is satisfiable", "KB ∧ ¬α is unsatisfiable", "α is valid", "KB is satisfiable"], a: 1, why: "If no world makes KB true and α false, then α is entailed.", ref: 156},
    {q: "Why is WalkSAT useful even though it is incomplete?", o: ["It always proves unsatisfiability", "It is often very fast at finding solutions to large satisfiable problems", "It never needs random choices", "It checks every world"], a: 1, why: "Local search can find solutions quickly in huge problems where systematic search is slow.", ref: 161},
    {q: "For random 3-SAT, where are the hardest problems?", o: ["Very few clauses per symbol", "A clause-to-symbol ratio of about 4.3", "Very many clauses per symbol", "Problems are equally hard everywhere"], a: 1, why: "Below the ratio almost all problems are satisfiable, above it almost none are; near 4.3 they are hardest to decide.", ref: 162}
  ]
},
"ch7-s7": {
  cards: [
    ["Fluent", "A fact that can change over time, written with a time step, e.g. the agent’s location L(1,1) at time 0."],
    ["Atemporal fact", "A fact that never changes, such as where the pits are."],
    ["The frame problem", "Actions change a few things; logic must also be told everything that stays the same."],
    ["Successor-state axiom", "One axiom per fluent: F at t+1 ⇔ (an action made F true at t) ∨ (F was true at t and no action made it false)."],
    ["Hybrid agent", "Uses logical inference to find safe squares, and search (A*) to plan a route through them."],
    ["SATPlan", "Planning as satisfiability: look for a plan of length 1, 2, 3, … by solving a SAT problem each time."]
  ],
  checks: [
    ["The location of a pit is a fluent.", false, "Pits never move, so they are atemporal. The agent’s location is a fluent."],
    ["A successor-state axiom describes how one fluent at time t+1 depends on time t and the action taken.", true, "There is one such axiom per fluent."],
    ["SATPlan tries longer and longer plan lengths until a SAT solver finds a plan.", true, "Each length gives a SAT problem; the first satisfiable one yields the plan."]
  ],
  mcq: [
    {q: "Which of these is a fluent in the wumpus world?", o: ["A pit in [3,1]", "The agent’s location", "The size of the cave", "The rules about breezes"], a: 1, why: "The agent’s location changes as it moves; the others never change.", ref: 165},
    {q: "Which has the form of a successor-state axiom?", o: ["F at t+1 ⇔ ActionCausesF at t ∨ (F at t ∧ ¬ActionCausesNotF at t)", "F at t ⇒ F at t+1", "F at t+1 ⇒ ActionCausesF at t", "F ⇔ ¬F"], a: 0, why: "A fluent is true next step if an action made it true, or it was already true and nothing made it false.", ref: 168},
    {q: "Why write one axiom per fluent instead of listing what each action leaves unchanged?", o: ["It is shorter and avoids listing every non-effect", "It removes the need for time steps", "It makes every fluent atemporal", "It is required by DPLL"], a: 0, why: "Listing non-effects for every action and fluent explodes; one axiom per fluent covers them compactly.", ref: 168},
    {q: "In the hybrid wumpus agent, what is logical inference used for?", o: ["Planning the shortest route", "Working out which squares are safe", "Choosing a random move", "Counting the score"], a: 1, why: "Inference finds the safe squares; a search algorithm then plans a route through them.", ref: 169},
    {q: "SATPlan finds no plan of length 4. What does it do next?", o: ["Gives up", "Tries length 5", "Tries length 3", "Removes the goal"], a: 1, why: "It increases the plan length and tries again.", ref: 174}
  ]
},
"ch7-s8": {
  cards: [
    ["Not entailed ≠ false", "If the KB does not entail a sentence, it may still be true — the KB simply does not know yet."],
    ["Adding facts", "Each new fact can only remove worlds that fit the KB, never add them. So more facts can only make more sentences entailed."],
    ["One symbol, one fact", "In propositional logic, each symbol names a single fact about one patient, such as LowOxygen_Maria."],
    ["⇒ is not ⇔", "A ⇒ B does not mean B ⇒ A. Reading a rule backwards is a classic mistake."],
    ["Checking entailment", "List the worlds that fit the KB; the sentence is entailed only if it is true in all of them."],
    ["Diagonals", "In the wumpus world, breezes and stenches only reach squares directly next door — never diagonally."]
  ],
  checks: [
    ["If the KB does not entail M, then M must be false.", false, "Not entailed only means some world that fits the KB makes M false. Other worlds may make it true."],
    ["Adding a fact to a KB can only remove worlds that fit it, never add new ones.", true, "A world must satisfy every sentence in the KB, so each new sentence can only rule worlds out."],
    ["A ⇒ B means the same as B ⇒ A.", false, "They differ when A is false and B is true: A ⇒ B is true there, but B ⇒ A is false."]
  ],
  mcq: [
    {q: "Northgate rule: F ⇒ B (F = Maria is flagged as a fall risk, B = her bed alarm is switched on). The KB knows the rule and F. Is B entailed?", o: ["Yes, by Modus Ponens", "No", "Only if B is also told", "It depends on Maria"], a: 0, why: "F is true and F ⇒ B, so every world that fits the KB makes B true.", ref: 186},
    {q: "Same rule F ⇒ B, but the KB knows only the rule and B. Is F entailed?", o: ["Yes", "No — the world F = F, B = T fits the KB", "Yes, by contraposition", "Only on weekdays"], a: 1, why: "The bed alarm could be on for another reason. Concluding F would be affirming the consequent.", ref: 186},
    {q: "Over the symbols G, T, W, how many worlds fit KB = { (G ∧ T) ⇒ W, G, T }?", o: ["1", "2", "3", "8"], a: 0, why: "G and T must be true, and then the rule forces W true: only G = T, T = T, W = T fits.", ref: 183},
    {q: "Over the two symbols F and B, how many worlds fit KB = { F ⇒ B }?", o: ["1", "2", "3", "4"], a: 2, why: "Only F = T, B = F breaks the rule, leaving 3 of the 4 worlds.", ref: 182},
    {q: "The system reports that W is not entailed. A user concludes “so W is false.” What is the error?", o: ["Treating not entailed as false", "Affirming the consequent", "Ignoring diagonals", "Using CNF"], a: 0, why: "Not entailed means unknown: some worlds that fit the KB make W true and some make it false.", ref: 185}
  ]
},
"ch8-s1": {
  cards: [
    ["Object", "A thing the world contains — the nouns: Maria, Ward B, the number 3, square [2,1]."],
    ["Relation", "True or false of objects, like verbs and adjectives: Adjacent([1,1],[2,1]). A relation on one object is a property: Patient(Maria)."],
    ["Function", "Points to exactly one object: BedOf(Maria) → Bed 12. It names a thing; it is not true or false."],
    ["Constant symbol", "A name for one object, such as Richard or WardB."],
    ["Ontological commitment", "What a logic assumes exists. First-order logic: facts, objects and relations."],
    ["Epistemological commitment", "What the agent can believe about each fact. First-order logic: true, false or unknown."]
  ],
  checks: [
    ["A function such as MotherOf(Sofia) is either true or false.", false, "A function names an object (Sofia’s mother); relations are the ones that are true or false."],
    ["In propositional logic, the same rule must be copied for each patient.", true, "Each symbol bakes in one patient, e.g. Fever_Maria, so rules cannot talk about patients in general."],
    ["First-order logic lets an agent believe a fact to degree 0.7.", false, "Degrees of belief come from probability theory. First-order logic keeps true, false and unknown."]
  ],
  mcq: [
    {q: "In “The nurse gives Leo his medicine,” what does “gives” name?", o: ["An object", "A relation", "A function", "A constant"], a: 1, why: "“Gives” is true or false of the objects involved, so it is a relation.", ref: 11},
    {q: "What does the term MotherOf(Leo) refer to?", o: ["True or false", "An object — Leo’s mother", "A relation between two people", "A quantifier"], a: 1, why: "A function applied to an object is a term that names one object.", ref: 12},
    {q: "“Ward B is next to Ward C” is best written as…", o: ["NextTo(WardB, WardC)", "NextTo_WardB_WardC", "WardB(NextTo, WardC)", "∀x NextTo(x)"], a: 0, why: "A relation applied to two objects. The second option is the propositional style that bakes the objects into one symbol.", ref: 11},
    {q: "Why can first-order logic say in one rule what propositional logic needs many copies for?", o: ["It uses more symbols", "Its rules can talk about any object using variables and quantifiers", "It ignores objects", "It has no connectives"], a: 1, why: "A rule like ∀p … ⇒ … covers every patient, including ones admitted later.", ref: 9},
    {q: "What is first-order logic’s ontological commitment?", o: ["Facts only", "Facts, objects and relations", "Degrees of belief", "Facts with degrees of truth"], a: 1, why: "That is what first-order logic assumes the world contains.", ref: 15}
  ]
},
"ch8-s2": {
  cards: [
    ["Model", "A domain of objects plus an interpretation saying which object or relation each name points to."],
    ["Term", "A way of pointing at an object: a constant (John) or a function applied to terms (LeftLeg(John))."],
    ["∀ — for all", "True when every object passes. A big AND. Pair it with ⇒: ∀x King(x) ⇒ Person(x)."],
    ["∃ — there exists", "True when at least one object (a witness) passes. A big OR. Pair it with ∧: ∃x Crown(x) ∧ OnHead(x, John)."],
    ["Order of quantifiers", "∀x ∃y: each x picks its own y. ∃y ∀x: one y must work for every x. Mixing ∀ and ∃ makes order matter."],
    ["Duality", "¬∃x P ≡ ∀x ¬P and ¬∀x P ≡ ∃x ¬P. Pushing ¬ through a quantifier flips it."],
    ["Equality", "x = y means both terms point to the same object. Use ¬(x = y) to say two things are different."]
  ],
  checks: [
    ["∀x Cat(x) ∧ Mammal(x) says that all cats are mammals.", false, "With ∧ it says everything is a cat and a mammal. Use ∀x Cat(x) ⇒ Mammal(x)."],
    ["∀x ∃y Likes(x, y) and ∃y ∀x Likes(x, y) can have different truth values.", true, "The first says everyone likes someone; the second says one person is liked by everyone."],
    ["¬∃x Late(x) means the same as ∀x ¬Late(x).", true, "“Nobody is late” = “everyone is not late”."]
  ],
  mcq: [
    {q: "Which sentence says “every nurse is certified”?", o: ["∀n Nurse(n) ∧ Certified(n)", "∀n Nurse(n) ⇒ Certified(n)", "∃n Nurse(n) ∧ Certified(n)", "∃n Nurse(n) ⇒ Certified(n)"], a: 1, why: "∀ goes with ⇒. The ∧ version claims everything is a certified nurse.", ref: 44},
    {q: "Which sentence says “some ward is full”?", o: ["∃w Ward(w) ∧ Full(w)", "∃w Ward(w) ⇒ Full(w)", "∀w Ward(w) ⇒ Full(w)", "∀w Ward(w) ∧ Full(w)"], a: 0, why: "∃ goes with ∧. The ⇒ version is true as soon as anything is not a ward.", ref: 52},
    {q: "In the tiny world (Richard, John, the crown, two legs), is ∃x King(x) ∧ Brother(x, Richard) true?", o: ["Yes — John is a witness", "No — Richard is not a king", "No — the crown is not a person", "It cannot be checked"], a: 0, why: "John is a king and is Richard’s brother, so one witness is enough.", ref: 48},
    {q: "Which sentence says “every patient has a doctor” (possibly a different one each)?", o: ["∃d ∀p DoctorOf(d, p)", "∀p ∃d DoctorOf(d, p)", "∀p ∀d DoctorOf(d, p)", "∃p ∃d DoctorOf(d, p)"], a: 1, why: "∀p first lets each patient have their own d. ∃d first would mean one doctor for everyone.", ref: 64},
    {q: "Which sentence says “there are at least two nurses”?", o: ["∃x,y Nurse(x) ∧ Nurse(y)", "∃x,y Nurse(x) ∧ Nurse(y) ∧ ¬(x = y)", "∀x,y Nurse(x) ∧ Nurse(y)", "∃x Nurse(x) ∧ Nurse(x)"], a: 1, why: "Without ¬(x = y), x and y could be the same nurse.", ref: 70},
    {q: "Which sentence is equivalent to ¬∀x Likes(x, Tea)?", o: ["∀x ¬Likes(x, Tea)", "∃x ¬Likes(x, Tea)", "¬∃x Likes(x, Tea)", "∃x Likes(x, Tea)"], a: 1, why: "“Not everyone likes tea” = “someone does not like tea”.", ref: 66}
  ]
},
"ch8-s3": {
  cards: [
    ["ASKVARS", "Asks “for which x?” and returns substitutions, such as { x / Leo }."],
    ["Substitution", "{ x / Leo } means: put Leo in place of x."],
    ["Axiom", "A basic fact or rule given to the KB."],
    ["Definition", "An axiom of the form Word(x) ⇔ …, saying exactly what a word means."],
    ["Theorem", "A sentence that follows from the axioms. It is derived when needed, not stored."],
    ["Peano numbers", "0, S(0), S(S(0)), … where S means “the next number”. 2 is S(S(0))."],
    ["Diagnostic vs causal rules", "Diagnostic: effect → cause (a breeze means a pit is nearby). Causal: cause → effect (a pit makes its neighbours breezy)."]
  ],
  checks: [
    ["The Sibling definition needs ¬(x = y).", true, "Otherwise everyone would be their own sibling, since they share a parent with themselves."],
    ["In the Peano axioms, 3 is written S(S(S(0))).", true, "Three applications of the successor function to 0."],
    ["Causal rules go from an effect to its cause.", false, "Causal rules go from cause to effect; diagnostic rules go from effect to cause."]
  ],
  mcq: [
    {q: "Which is a correct definition of Grandparent?", o: ["∀g,c Grandparent(g,c) ⇔ ∃p Parent(g,p) ∧ Parent(p,c)", "∀g,c Grandparent(g,c) ⇔ ∃p Parent(g,p) ⇒ Parent(p,c)", "∀g,c Grandparent(g,c) ⇔ Parent(g,c) ∧ Parent(c,g)", "∃g,c Grandparent(g,c)"], a: 0, why: "Two parent links in a row, with ∃ paired with ∧.", ref: 81},
    {q: "Facts: Parent(Ann, Bob), Parent(Bob, Cal), Parent(Bob, Dee). What does ASKVARS(Grandparent(Ann, x)) return?", o: ["{ x / Bob }", "{ x / Cal } and { x / Dee }", "{ x / Ann }", "Nothing"], a: 1, why: "Ann → Bob → Cal and Ann → Bob → Dee.", ref: 85},
    {q: "Same family, with Sibling(x,y) ⇔ ¬(x = y) ∧ ∃p Parent(p,x) ∧ Parent(p,y). What does ASKVARS(Sibling(Cal, x)) return?", o: ["{ x / Dee }", "{ x / Cal } and { x / Dee }", "{ x / Bob }", "{ x / Ann }"], a: 0, why: "Cal and Dee share the parent Bob; Cal is excluded by ¬(x = y).", ref: 87},
    {q: "Using the Peano axioms, what is S(0) + S(S(0))?", o: ["S(S(0))", "S(S(S(0)))", "S(0)", "0"], a: 1, why: "1 + 2 = 3, which is S(S(S(0))).", ref: 93},
    {q: "In a 4 × 4 cave, which squares are Adjacent to [2,3]?", o: ["[1,3], [3,3], [2,2], [2,4]", "[1,2], [3,4], [1,4], [3,2]", "[2,2] and [2,4] only", "All eight surrounding squares"], a: 0, why: "Same row one column apart, or same column one row apart.", ref: 96}
  ]
},
"ch8-s4": {
  cards: [
    ["Seven steps", "Identify the questions · assemble the knowledge · choose a vocabulary · encode general knowledge · encode the specific problem · pose queries · debug."],
    ["Vocabulary", "The predicates, functions and constants: Gate, Type, In, Out, Connected, Signal."],
    ["General knowledge", "Axioms true of every circuit, e.g. connected terminals carry the same signal."],
    ["Specific problem", "Facts about this circuit only: each gate’s type and every wire, as Connected(…) facts."],
    ["Functions in the circuit", "Type(X1) and Signal(t) are functions: each gate has exactly one type, each terminal one signal."],
    ["Debugging a KB", "Bugs are missing or wrong axioms, not crashes: the KB simply cannot conclude what it should."]
  ],
  checks: [
    ["Type(X1) = XOR uses Type as a function.", true, "Each gate has exactly one type, so Type returns an object."],
    ["To run the full adder backwards (outputs → inputs), new axioms must be added.", false, "The same knowledge base answers both directions; only the query changes."],
    ["Forgetting the axiom 1 ≠ 0 can stop the KB from answering about an XOR gate.", true, "The XOR axiom needs to know the two inputs differ, which requires 1 ≠ 0."]
  ],
  mcq: [
    {q: "The full adder gets inputs 1, 0, 1. What are Sum and Carry?", o: ["Sum 1, Carry 0", "Sum 0, Carry 1", "Sum 1, Carry 1", "Sum 0, Carry 0"], a: 1, why: "1 + 0 + 1 = 2 = binary 10. X1 = 1, X2 = 0 (Sum); A1 = 0, A2 = 1, so O1 = 1 (Carry).", ref: 123},
    {q: "Inputs 0, 0, 1. What are Sum and Carry?", o: ["Sum 1, Carry 0", "Sum 0, Carry 1", "Sum 1, Carry 1", "Sum 0, Carry 0"], a: 0, why: "0 + 0 + 1 = 1 = binary 01.", ref: 123},
    {q: "In which step do you write Connected(Out(1,X1), In(1,X2))?", o: ["Choose a vocabulary", "Encode general knowledge", "Encode the specific problem", "Pose queries"], a: 2, why: "Wires belong to this particular circuit, so they are part of the specific problem.", ref: 113},
    {q: "Which sentence is general knowledge, true of every circuit?", o: ["Type(X1) = XOR", "Connected(Out(1,X1), In(1,X2))", "∀t₁,t₂ Connected(t₁,t₂) ⇒ Signal(t₁) = Signal(t₂)", "Signal(In(1,C1)) = 1"], a: 2, why: "It holds for any wire in any circuit. The others describe this circuit or one query.", ref: 109},
    {q: "An XOR gate receives 1 and 1. What does it output?", o: ["1", "0", "2", "Undefined"], a: 1, why: "XOR outputs 1 only when its inputs differ.", ref: 107}
  ]
},
"ch8-s5": {
  cards: [
    ["One rule, every patient", "∀p rules cover every patient, including ones admitted later — no new rules, just new facts."],
    ["ASKVARS on the ward", "“Which patients …?” returns one substitution per patient, such as { x / Ana }."],
    ["Unknown, not false", "If a rule needs two conditions and only one is known, the conclusion is not entailed — the KB does not know yet."],
    ["∀w ∃n vs ∃n ∀w", "Every ward has some nurse, versus one nurse covers every ward. Same symbols, very different claims."],
    ["Four beginner mistakes", "∀ with ∧ · ∃ with ⇒ · swapping ∀ and ∃ · forgetting ¬(x = y)."],
    ["Coming next: Chapter 9", "How a machine finds these answers automatically: unification, forward and backward chaining, resolution."]
  ],
  checks: [
    ["In first-order logic, a newly admitted patient needs new rules.", false, "The ∀p rules already cover them; only new facts about the patient are added."],
    ["ASKVARS can return several substitutions for one question.", true, "One for each object that makes the query true."],
    ["∃n ∀w Assigned(n, w) means each ward has its own nurse.", false, "It means one single nurse is assigned to every ward."]
  ],
  mcq: [
    {q: "Rule: ∀p Patient(p) ∧ FallRisk(p) ⇒ BedAlarm(p). Facts: Patient(Ana), FallRisk(Ana), Patient(Raj). What does ASKVARS(BedAlarm(x)) return?", o: ["{ x / Ana }", "{ x / Ana } and { x / Raj }", "{ x / Raj }", "Nothing"], a: 0, why: "Only Ana is known to be a fall risk.", ref: 132},
    {q: "Same KB. Is BedAlarm(Raj) entailed?", o: ["Yes", "No — it is unknown, because nothing says Raj is a fall risk", "Yes, because Raj is a patient", "It is false"], a: 1, why: "The rule cannot fire for Raj, so the KB does not know. That is not the same as false.", ref: 133},
    {q: "Which sentence says “every ward has at least one nurse”?", o: ["∃n Nurse(n) ∧ ∀w (Ward(w) ⇒ Assigned(n, w))", "∀w Ward(w) ⇒ ∃n Nurse(n) ∧ Assigned(n, w)", "∀w ∀n Assigned(n, w)", "∃w ∃n Assigned(n, w)"], a: 1, why: "∀w first lets each ward have its own nurse.", ref: 135},
    {q: "What is wrong with ∃p Patient(p) ⇒ Discharged(p) as a way to say “some patient was discharged”?", o: ["Nothing", "It pairs ∃ with ⇒, so it is true as soon as anything is not a patient", "It should use ∀", "Discharged must be a function"], a: 1, why: "∃ goes with ∧: ∃p Patient(p) ∧ Discharged(p).", ref: 141},
    {q: "Which sentence wrongly claims that everything is a patient in Ward B?", o: ["∀x Patient(x) ∧ In(x, WardB)", "∀x Patient(x) ⇒ In(x, WardB)", "∃x Patient(x) ∧ In(x, WardB)", "∀x In(x, WardB) ⇒ Patient(x)"], a: 0, why: "∀ with ∧ makes the claim about every object in the domain.", ref: 141}
  ]
}
};
