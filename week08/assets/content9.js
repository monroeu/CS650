window.LAB_MODULES = window.LAB_MODULES || [];
window.LAB_MODULES.push(
{
  id: "intro", kind: "lecture", part: "p1", slides: [1, 4],
  label: "Start", title: "Welcome and Roadmap",
  blurb: "How this lab works, the two running examples (the Crime KB and Northgate Hospital), and Chapter 9 in one picture."
},
{
  id: "s91", kind: "section", part: "p1", slides: [5, 15],
  label: "9.1", title: "Propositionalization",
  blurb: "What inference means, and how to remove quantifiers so first-order logic becomes propositional logic.",
  learn: `
<h3>1. What inference means</h3>
<p>A knowledge base (KB) is a set of sentences we accept as true. <b>Inference</b> derives new sentences that <i>must</i> be true whenever the KB is true. We write <span class="f">KB ⊨ α</span> and read it “the KB entails α”: in every possible world where all of the KB is true, α is true too. Every algorithm in Chapter 9 answers this one yes-or-no question.</p>

<h3>2. Universal Instantiation (UI)</h3>
<div class="rule"><span class="f">∀v α &nbsp;⟶&nbsp; SUBST({v/g}, α)</span></div>
<p>If a sentence holds for <b>every</b> object, it holds for any particular object you name. <span class="f">SUBST({v/g}, α)</span> means “replace every v in α with g.” The term g must be a <b>ground term</b>: a term with no variables, such as <span class="f">John</span> or <span class="f">Father(John)</span>.</p>
<div class="ex"><div class="ex-h">Worked example</div>
Rule: <span class="f">∀x King(x) ∧ Greedy(x) ⇒ Evil(x)</span>. Domain: {John, Richard}.<br>
Step 1 — substitute {x/John}: <span class="f">King(John) ∧ Greedy(John) ⇒ Evil(John)</span><br>
Step 2 — substitute {x/Richard}: <span class="f">King(Richard) ∧ Greedy(Richard) ⇒ Evil(Richard)</span><br>
Step 3 — the facts <span class="f">King(John)</span> and <span class="f">Greedy(John)</span> match the John instance, so Modus Ponens gives <span class="f">Evil(John)</span>.</div>

<h3>3. Existential Instantiation (EI) and Skolemization</h3>
<div class="rule"><span class="f">∃v α &nbsp;⟶&nbsp; SUBST({v/k}, α)</span>, where k is a <b>brand-new</b> constant</div>
<p>If something exists, give it a new name — a <b>Skolem constant</b>. From <span class="f">∃x Crown(x) ∧ OnHead(x, John)</span> we write <span class="f">Crown(C₁) ∧ OnHead(C₁, John)</span>. The name must not already appear in the KB, and EI is applied once (UI can be applied many times).</p>
<p>When ∃ sits inside ∀, a constant is too strong. <span class="f">∀x ∃y Loves(x, y)</span> (everyone loves someone) becomes <span class="f">∀x Loves(x, F(x))</span>, where the <b>Skolem function</b> F(x) means “the person x loves” and can differ for each x.</p>

<h3>4. Propositionalization and its limits</h3>
<p>Apply UI to every rule for every ground term, apply EI, rename each ground atom as a propositional symbol (<span class="f">King(John)</span> → <span class="f">KingJohn</span>), then run any Chapter 7 algorithm. It is correct, but:</p>
<ul>
<li><b>Infinite terms:</b> with a function such as Father, the ground terms <span class="f">John, Father(John), Father(Father(John))…</span> never end. Herbrand’s theorem (1930) guarantees that a proof, if one exists, uses only finitely many of them, so we search depth 0, 1, 2…</li>
<li><b>Semidecidable:</b> if α is entailed we eventually say yes; if not, we may search forever.</li>
<li><b>Explosion:</b> about <span class="f">p × nᵏ</span> ground atoms. With 50 predicates, 100 constants and 3 arguments: 50 × 100³ = 50 million.</li>
</ul>
<div class="ng"><div class="ng-h">Northgate Hospital</div>Rule R1: <span class="f">∀p Fever(p) ∧ HighHeartRate(p) ⇒ SepsisRisk(p)</span>. Grounding it for 400 patients creates 400 instances to find the one about Maria. Section 9.2 shows how to find Maria’s instance directly.</div>
<div class="mistake"><b>Common mistake:</b> using a variable as g in UI (for example <span class="f">Likes(y, IceCream)</span>). The substituted term must be ground, or no quantifier has really been removed.</div>`,
  cards: [
    ["Inference", "Deriving new sentences that must be true whenever the KB is true."],
    ["KB ⊨ α", "“The KB entails α”: α is true in every world where the KB is true."],
    ["Ground term", "A term with no variables, e.g. John or Father(John)."],
    ["Universal Instantiation", "From ∀v α, infer SUBST({v/g}, α) for any ground term g."],
    ["Existential Instantiation", "From ∃v α, infer SUBST({v/k}, α) with a brand-new constant k; use once."],
    ["Skolem constant", "A new name given to an object known to exist, e.g. C₁ for “that crown”."],
    ["Skolem function", "Names an existing object that depends on an outer ∀ variable, e.g. F(x) in ∀x Loves(x, F(x))."],
    ["Herbrand’s theorem", "If KB ⊨ α, a proof exists using a finite set of ground instances."],
    ["Semidecidable", "An algorithm can confirm every entailed sentence, but cannot always say “no”."]
  ],
  check: { q: "Which substitution is a valid use of Universal Instantiation on ∀x Likes(x, IceCream)?",
    options: ["Likes(y, IceCream)", "Likes(Father(Ana), IceCream)", "Likes(C₁, IceCream), then discard the rule", "∃x Likes(x, IceCream)"], answer: 1,
    why: "Father(Ana) has no variables, so it is a ground term. A still has a variable; C describes Existential Instantiation; D is not an instance at all." },
  mcq: [
    { q: "In ∀v α ⟶ SUBST({v/g}, α), what does {x/John} mean?", options: ["John becomes x", "Replace every x with John", "x and John are both variables", "Delete x from the sentence"], answer: 1,
      fb: ["Reversed: the variable is replaced, not the constant.", "Correct: read {x/John} as “x becomes John”.", "John is a constant.", "Nothing is deleted; x is replaced."] },
    { q: "Why must the constant introduced by Existential Instantiation be brand new?", options: ["Constants are cheaper to store", "Reusing a name could claim a fact we do not know", "So that UI can be applied later", "Because ∃ only applies to new objects"], answer: 1,
      fb: ["Storage is not the reason.", "Correct: reusing John would claim John is the crown.", "UI is unrelated to this choice.", "∃ applies to any object; only the name must be new."] },
    { q: "∀x ∃y Mother(y, x) should be Skolemized as…", options: ["∀x Mother(K, x)", "∀x Mother(M(x), x)", "Mother(K, x)", "∃y ∀x Mother(y, x)"], answer: 1,
      fb: ["A constant K says everyone has the same mother.", "Correct: M(x) lets each x have its own mother.", "Dropping ∀ without a function loses the dependency.", "That swaps the quantifiers and changes the meaning."] },
    { q: "Why does propositionalization fail to terminate when the KB contains a function symbol like Father?", options: ["Function symbols cannot be grounded", "Infinitely many ground terms can be built", "UI cannot be applied to functions", "Modus Ponens is not valid for functions"], answer: 1,
      fb: ["They can be grounded, without end.", "Correct: John, Father(John), Father(Father(John)), …", "UI applies to any ground term.", "Modus Ponens is always valid."] },
    { q: "A KB has 20 predicates of arity 2 and 50 constants. Roughly how many ground atoms?", options: ["1,000", "2,500", "50,000", "20 × 2 × 50 = 2,000"], answer: 2,
      fb: ["That is 20 × 50.", "That is 50² alone.", "Correct: 20 × 50² = 50,000.", "Arity is an exponent, not a factor."] }
  ]
},
{
  id: "s92", kind: "section", part: "p1", slides: [16, 28],
  label: "9.2", title: "Unification and Generalized Modus Ponens",
  blurb: "Finding the one substitution that makes a rule match the facts — the key idea behind every Chapter 9 algorithm.",
  learn: `
<h3>1. The idea</h3>
<p>Instead of generating every instance of a rule, <b>unification</b> looks at two sentences side by side and computes the substitution θ that makes them identical. Only the substitution needed for this inference is ever computed.</p>
<div class="rule"><span class="f">UNIFY(p, q) = θ</span> &nbsp;where&nbsp; <span class="f">SUBST(θ, p) = SUBST(θ, q)</span>, or <b>FAILURE</b></div>

<h3>2. The four rules (compare position by position)</h3>
<ol>
<li><b>A variable meets anything</b> → bind it: x meets John gives x/John.</li>
<li><b>Two constants</b> → same name: continue; different names: FAIL.</li>
<li><b>A variable already bound</b> → replace it with its value first, then compare.</li>
<li><b>Two compound terms</b> → same function name: unify their arguments one by one.</li>
</ol>
<div class="ex"><div class="ex-h">Worked example: UNIFY(Knows(John, x), Knows(y, Mother(y)))</div>
Predicate: Knows = Knows ✓<br>
Argument 1: John vs y → rule 1 → θ = {y/John}<br>
Argument 2: x vs Mother(y). y is already John (rule 3), so this is x vs Mother(John) → θ = {y/John, x/Mother(John)}<br>
Both sentences become <span class="f">Knows(John, Mother(John))</span>.</div>

<h3>3. Three safeguards</h3>
<ul>
<li><b>Standardizing apart.</b> <span class="f">Knows(John, x)</span> and <span class="f">Knows(x, Elizabeth)</span> appear to fail, but the two x’s are unrelated. Rename one (x₁₇) and unification succeeds: {x₁₇/John, x/Elizabeth}.</li>
<li><b>Most general unifier (MGU).</b> When several θ work, UNIFY returns the one that commits to the fewest values: for Knows(John, x) and Knows(y, z), {y/John, x/z} rather than {y/John, x/John, z/John}.</li>
<li><b>Occur check.</b> Never bind x to a term containing x (such as F(x)); that would create an infinite term.</li>
</ul>

<h3>4. Generalized Modus Ponens (GMP)</h3>
<div class="rule">Rule <span class="f">p₁ ∧ … ∧ pₙ ⇒ q</span>, facts <span class="f">p₁′ … pₙ′</span>. If <b>one</b> θ makes every SUBST(θ, pᵢ) = SUBST(θ, pᵢ′), conclude <span class="f">SUBST(θ, q)</span>.</div>
<div class="ng"><div class="ng-h">Northgate Hospital</div>R4: <span class="f">Prescribed(p, d) ∧ BetaLactam(d) ∧ PenicillinAllergy(p) ⇒ Alert(p, d)</span>.<br>
Premise 1 unifies with <span class="f">Prescribed(Maria, Amoxicillin)</span>: θ = {p/Maria, d/Amoxicillin}. Premises 2 and 3 become <span class="f">BetaLactam(Amoxicillin)</span> and <span class="f">PenicillinAllergy(Maria)</span>, both in the KB. One θ fits all three, so GMP concludes <span class="f">Alert(Maria, Amoxicillin)</span>.</div>
<div class="mistake"><b>Common mistake:</b> forgetting rule 3. In UNIFY(Owns(x, Car(x)), Owns(Ana, y)), y must become Car(Ana), not Car(x).</div>`,
  cards: [
    ["Substitution θ", "A set of bindings such as {x/John, y/Bill}."],
    ["UNIFY(p, q)", "Returns θ such that SUBST(θ, p) = SUBST(θ, q), or FAILURE."],
    ["Unification rule: two different constants", "FAIL — constants never change."],
    ["Unification rule: variable already bound", "Replace it with its value first, then compare."],
    ["Standardizing apart", "Renaming variables so two sentences share no variable names before unifying."],
    ["Most general unifier (MGU)", "The unifier that commits to the fewest values; UNIFY always returns it."],
    ["Occur check", "Refuse to bind x to a term that contains x, e.g. F(x)."],
    ["Generalized Modus Ponens", "If one θ makes all premises match facts, conclude SUBST(θ, q)."]
  ],
  check: { q: "What is UNIFY(Owns(x, Car(x)), Owns(Ana, y))?",
    options: ["{x/Ana, y/Car(x)}", "{x/Ana, y/Car(Ana)}", "FAILURE", "{x/y}"], answer: 1,
    why: "Argument 1 binds x/Ana. Argument 2: Car(x) meets y; replace x first to get Car(Ana), then bind y/Car(Ana)." },
  mcq: [
    { q: "UNIFY(King(x), Queen(John)) returns…", options: ["{x/John}", "FAILURE", "{King/Queen}", "{}"], answer: 1,
      fb: ["The predicate names differ, so nothing can match.", "Correct: King ≠ Queen.", "Predicate names are never substituted.", "An empty θ would only work if the sentences were already identical."] },
    { q: "UNIFY(P(x, x), P(John, Bill)) returns…", options: ["{x/John}", "{x/John, x/Bill}", "FAILURE", "{x/Bill}"], answer: 2,
      fb: ["Then argument 2 compares John with Bill.", "A variable cannot have two values.", "Correct: x is bound to John, then John vs Bill fails.", "Argument 1 already needs x = John."] },
    { q: "Why do inference engines standardize apart before unifying?", options: ["To speed up indexing", "Because variables in different sentences are unrelated even if they share a name", "To satisfy the occur check", "To produce ground terms"], answer: 1,
      fb: ["It is about correctness, not speed.", "Correct: two x’s in different sentences are like two students named Alex.", "The occur check is a separate safeguard.", "Variables remain variables."] },
    { q: "Which θ is the MGU of Knows(John, x) and Knows(y, z)?", options: ["{y/John, x/z}", "{y/John, x/John, z/John}", "{x/John}", "FAILURE"], answer: 0,
      fb: ["Correct: it commits to the fewest values.", "A valid unifier, but more specific than necessary.", "Argument 1 still needs y/John.", "These sentences do unify."] },
    { q: "In GMP, what must be true about θ?", options: ["Each premise may use its own θ", "One θ must work for all premises at once", "θ must bind every variable to John", "θ is applied only to the conclusion"], answer: 1,
      fb: ["Then a rule could fire for x = John and x = Richard at once.", "Correct: a single consistent substitution.", "Any ground values are allowed.", "θ must also make the premises match the facts."] }
  ]
},
{
  id: "s93", kind: "section", part: "p1", slides: [29, 39],
  label: "9.3", title: "Forward Chaining",
  blurb: "Data-driven inference: start from the facts and fire rules until the goal appears or nothing new can be derived.",
  learn: `
<h3>1. Definite clauses</h3>
<p>Forward chaining works on <b>definite clauses</b>: <span class="f">p₁ ∧ p₂ ∧ … ∧ pₙ ⇒ q</span>, a conjunction of atomic premises and exactly one atomic conclusion. Variables are implicitly ∀. A fact is a definite clause with no premises. <span class="f">P ⇒ Q ∨ R</span> is <i>not</i> definite (two possible conclusions).</p>

<h3>2. The algorithm (FOL-FC-ASK)</h3>
<ol>
<li>Start with the known facts.</li>
<li>For each rule, find one θ that unifies all its premises with known facts.</li>
<li>If found, the rule fires: add <span class="f">SUBST(θ, q)</span> if it is genuinely new.</li>
<li>If the new fact matches the goal → success.</li>
<li>If a full pass (one <b>iteration</b>) adds nothing → <b>fixed point</b> → stop: the goal is not entailed.</li>
</ol>

<div class="ex"><div class="ex-h">Worked example: Is Colonel West a criminal?</div>
Rules: R1 <span class="f">American(x) ∧ Weapon(y) ∧ Sells(x,y,z) ∧ Hostile(z) ⇒ Criminal(x)</span>; R2 <span class="f">Missile(x) ∧ Owns(Nono,x) ⇒ Sells(West,x,Nono)</span>; R3 <span class="f">Missile(x) ⇒ Weapon(x)</span>; R4 <span class="f">Enemy(x,America) ⇒ Hostile(x)</span>.<br>
Facts: American(West), Missile(M₁), Owns(Nono,M₁), Enemy(Nono,America).<br><br>
<b>Iteration 1:</b> R1 cannot fire yet. R2 fires {x/M₁} → Sells(West,M₁,Nono). R3 fires → Weapon(M₁). R4 fires {x/Nono} → Hostile(Nono).<br>
<b>Iteration 2:</b> R1 matches with θ = {x/West, y/M₁, z/Nono} → <span class="f">Criminal(West)</span>. Goal proven.</div>

<h3>3. Properties</h3>
<ul>
<li><b>Sound</b> (every step is GMP) and <b>complete</b> for definite clauses.</li>
<li><b>Terminates for Datalog</b> (no function symbols); with functions it may run forever, e.g. <span class="f">NatNum(n) ⇒ NatNum(S(n))</span>.</li>
<li><b>Derives irrelevant facts</b> — everything it can, not just what the goal needs.</li>
<li>Made efficient by indexing and matching the most constrained premise first, <b>incremental</b> FC (only rules touching last iteration’s new facts), and the <b>Rete</b> network.</li>
</ul>
<div class="ng"><div class="ng-h">Northgate Hospital</div>Iteration 1: R1 gives SepsisRisk(Maria); R3 gives BetaLactam(Amox). Iteration 2: R2 (SepsisRisk ⇒ NeedsLactateTest) and R4 (the allergy alert) can now fire. Iteration 3 adds nothing: fixed point. This is how clinical alerting works — new data arrives, rules fire forward.</div>
<div class="mistake"><b>Common mistake:</b> using a fact in the same iteration it was derived. In the textbook algorithm, facts derived during an iteration become available in the next one.</div>`,
  cards: [
    ["Definite clause", "Conjunction of atomic premises ⇒ exactly one atomic conclusion."],
    ["Forward chaining", "Data-driven: start from facts, fire rules, add conclusions, repeat."],
    ["Iteration", "One complete pass through all the rules."],
    ["Fixed point", "An iteration adds no new facts; nothing more can be derived."],
    ["Datalog", "Definite clauses with no function symbols; FC always terminates."],
    ["Incremental forward chaining", "Only try rules with a premise that matches a fact new in the last iteration."],
    ["Rete network", "Structure that remembers partial rule matches between iterations."],
    ["FC weakness", "Derives every possible fact, including ones irrelevant to the goal."]
  ],
  check: { q: "Why did R4 (the alert) NOT fire in iteration 1 for Maria?",
    options: ["Maria has no allergy recorded", "BetaLactam(Amox) was not yet a known fact", "R4 has too many premises", "Forward chaining fires only one rule per iteration"], answer: 1,
    why: "BetaLactam(Amox) was derived by R3 during iteration 1, so it was available to R4 only in iteration 2." },
  mcq: [
    { q: "Which sentence is NOT a definite clause?", options: ["Missile(x) ⇒ Weapon(x)", "American(West)", "P(x) ⇒ Q(x) ∨ R(x)", "A(x) ∧ B(x) ⇒ C(x)"], answer: 2,
      fb: ["One premise, one conclusion: definite.", "A fact is a definite clause with no premises.", "Correct: two possible conclusions.", "Conjunction of premises, one conclusion: definite."] },
    { q: "Forward chaining stops without proving the goal when…", options: ["A rule fails to fire", "An iteration adds no new facts", "The goal has a variable", "Two rules conflict"], answer: 1,
      fb: ["Other rules may still fire.", "Correct: a fixed point.", "Goals with variables are allowed.", "Definite clauses cannot conflict."] },
    { q: "In iteration 2 of the Crime trace, which θ fires R1?", options: ["{x/West}", "{x/West, y/M₁, z/Nono}", "{x/Nono, y/M₁}", "{y/West, z/M₁}"], answer: 1,
      fb: ["All four premises must be matched.", "Correct.", "Nono is the buyer, not the seller.", "The bindings are mixed up."] },
    { q: "Forward chaining is guaranteed to terminate when the KB is…", options: ["Small", "Datalog (no function symbols)", "Written in Prolog", "Converted to CNF"], answer: 1,
      fb: ["Size alone does not guarantee termination.", "Correct: finitely many possible facts.", "Prolog uses backward chaining.", "CNF is for resolution."] },
    { q: "What does incremental forward chaining avoid?", options: ["Using unification", "Re-trying rules that cannot produce anything new", "Deriving the goal", "Checking for duplicates"], answer: 1,
      fb: ["Unification is still needed.", "Correct: only rules touching new facts are tried.", "It still derives the goal.", "Duplicate checks remain."] }
  ]
},
{
  id: "s94", kind: "section", part: "p1", slides: [40, 49],
  label: "9.4", title: "Backward Chaining and Prolog",
  blurb: "Goal-directed inference: start from the question and prove only the subgoals it needs.",
  learn: `
<h3>1. The idea</h3>
<p>Ask: <i>what would have to be true for the goal to hold?</i> Then prove those things the same way, until every leaf is a known fact. To bake a cake you need batter and a hot oven; batter needs flour, eggs and sugar; those are in the pantry. Backward chaining never explores what the goal does not need.</p>

<h3>2. The algorithm</h3>
<ol>
<li>Put the query on a list of goals.</li>
<li>Take the first goal. If it unifies with a fact, it is solved (record θ).</li>
<li>Otherwise choose a rule whose <b>conclusion</b> unifies with it (<b>OR</b>: any one rule may work).</li>
<li>Replace the goal with that rule’s premises (<b>AND</b>: all must be proved), carrying θ forward.</li>
<li>Work depth-first; if a subgoal fails, <b>backtrack</b> to the next rule.</li>
</ol>
<div class="ex"><div class="ex-h">Worked example: Criminal(West)?</div>
R1’s conclusion matches with {x/West} → four subgoals: American(West), Weapon(y), Sells(West,y,z), Hostile(z).<br>
American(West): fact ✓ · Weapon(y) → R3 → Missile(y) → fact Missile(M₁), so y = M₁ ✓<br>
Sells(West,M₁,z) → R2 with z = Nono → Missile(M₁) ✓, Owns(Nono,M₁) ✓<br>
Hostile(Nono) → R4 → Enemy(Nono,America) ✓ · Every leaf is a fact: proven with θ = {x/West, y/M₁, z/Nono}.</div>

<h3>3. Depth-first search and its danger</h3>
<p>The goal list is a <b>stack</b> (last in, first out), so backward chaining is depth-first search on the proof tree. Recursive rules can loop forever: proving <span class="f">Path(A,C)</span> with <span class="f">Path(x,z) ⇐ Path(x,y) ∧ Link(y,z)</span> keeps generating Path(A, y′). Fixes: check repeated goals, reorder premises, or memoize (tabling).</p>

<h3>4. Prolog</h3>
<p>Prolog writes <span class="f">head :- body</span> for <span class="f">body ⇒ head</span>; capitalized names are variables. <code>criminal(X) :- american(X), weapon(Y), sells(X,Y,Z), hostile(Z).</code> The query <code>?- criminal(Who).</code> answers <code>Who = west.</code> Prolog differs from pure logic: the <b>closed-world assumption</b> (unprovable = false), <b>negation as failure</b>, clause order matters, and no occur check.</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div>A pharmacist asks <span class="f">Alert(Maria, d)?</span>. R4 gives three subgoals; Prescribed(Maria, d) binds d = Amox; BetaLactam(Amox) reduces via R3 to Penicillin(Amox) ✓; PenicillinAllergy(Maria) ✓. Answer: d = amoxicillin — and the sepsis rules were never touched.</div>
<div class="mistake"><b>Common mistake:</b> thinking backward chaining starts from facts. It starts from the goal and works toward the facts.</div>`,
  cards: [
    ["Backward chaining", "Goal-driven: reduce the goal to subgoals until all are known facts."],
    ["AND node", "All premises of the chosen rule must be proved."],
    ["OR node", "Any one rule whose conclusion matches the goal may be used."],
    ["Goal stack", "Backward chaining keeps goals last-in-first-out, i.e. depth-first search."],
    ["Backtracking", "When a subgoal fails, return and try the next rule."],
    ["Prolog clause", "head :- body means body ⇒ head."],
    ["Closed-world assumption", "Whatever cannot be proved is treated as false."],
    ["Negation as failure", "\\+ P succeeds when P cannot be proved — not the same as logical ¬P."]
  ],
  check: { q: "Which data structure best describes how backward chaining manages its goals?",
    options: ["A queue (first in, first out)", "A stack (last in, first out)", "A priority queue ordered by cost", "A hash table"], answer: 1,
    why: "The newest subgoals are always worked on first. That is depth-first search, which uses a stack." },
  mcq: [
    { q: "Backward chaining begins with…", options: ["All known facts", "The goal", "A random rule", "The CNF of the KB"], answer: 1,
      fb: ["That is forward chaining.", "Correct.", "Rule choice is driven by the goal.", "CNF is for resolution."] },
    { q: "When proving Criminal(West), which subgoal set comes from R1?", options: ["Missile(y) only", "American(West), Weapon(y), Sells(West,y,z), Hostile(z)", "Enemy(Nono, America)", "Owns(Nono, M₁)"], answer: 1,
      fb: ["That comes from R3.", "Correct: R1’s four premises with x = West.", "That comes from R4.", "That comes from R2."] },
    { q: "Why can backward chaining loop forever?", options: ["It forgets θ", "Recursive rules can regenerate the same kind of goal", "It uses a queue", "Facts can be retracted"], answer: 1,
      fb: ["θ is carried forward.", "Correct: e.g. Path(A,y) → Path(A,y′) → …", "It uses a stack.", "Retraction is not part of basic BC."] },
    { q: "In Prolog, what does a capitalized name like Who denote?", options: ["A constant", "A predicate", "A variable", "A comment"], answer: 2,
      fb: ["Constants start with lowercase.", "Predicates are lowercase too.", "Correct.", "Comments start with %."] },
    { q: "Under the closed-world assumption, if Prolog cannot prove Allergic(maria), it concludes…", options: ["Allergic(maria) is unknown", "Allergic(maria) is false", "Allergic(maria) is true", "The query is malformed"], answer: 1,
      fb: ["Pure FOL would say unknown; Prolog does not.", "Correct — which is why missing data in a chart is dangerous.", "Nothing supports it.", "The query is fine."] }
  ]
},
{
  id: "s95", kind: "section", part: "p1", slides: [50, 60],
  label: "9.5", title: "Resolution",
  blurb: "Proof by contradiction, complete for all of first-order logic: convert to CNF, add the negated goal, resolve to the empty clause.",
  learn: `
<h3>1. Why resolution</h3>
<p>Chaining needs definite clauses. Real knowledge includes disjunctions (<span class="f">Bacterial(Maria) ∨ Viral(Maria)</span>), negations (<span class="f">¬Pregnant(Maria)</span>) and nested quantifiers. Resolution handles all of them.</p>

<h3>2. Conjunctive Normal Form (CNF)</h3>
<p>A <b>literal</b> is an atom or its negation; a <b>clause</b> is literals joined by ∨; CNF is clauses joined by ∧. Every definite clause is already a clause: <span class="f">Missile(x) ⇒ Weapon(x)</span> ≡ <span class="f">¬Missile(x) ∨ Weapon(x)</span>.</p>
<div class="ex"><div class="ex-h">The six conversion steps (example: everyone who loves all animals is loved by someone)</div>
<span class="f">∀x [∀y Animal(y) ⇒ Loves(x,y)] ⇒ [∃y Loves(y,x)]</span><br>
1. Remove ⇒: P ⇒ Q becomes ¬P ∨ Q.<br>
2. Move ¬ inward: ¬∀ becomes ∃¬; ¬(A ∨ B) becomes ¬A ∧ ¬B; ¬¬A becomes A → <span class="f">∀x [∃y Animal(y) ∧ ¬Loves(x,y)] ∨ [∃y Loves(y,x)]</span><br>
3. Rename variables: the second y becomes z.<br>
4. Skolemize: y → F(x), z → G(x).<br>
5. Drop ∀.<br>
6. Distribute ∨ over ∧ → <span class="f">[Animal(F(x)) ∨ Loves(G(x),x)] ∧ [¬Loves(x,F(x)) ∨ Loves(G(x),x)]</span></div>

<h3>3. The resolution rule</h3>
<p>Two clauses containing a <b>complementary pair</b> (L and ¬L′ that unify) produce a <b>resolvent</b>: cancel the pair, merge the rest, apply θ. From <span class="f">¬King(x) ∨ ¬Greedy(x) ∨ Evil(x)</span> and <span class="f">King(John)</span> with {x/John}: <span class="f">¬Greedy(John) ∨ Evil(John)</span>.</p>

<h3>4. Refutation</h3>
<p>To prove α: add <span class="f">¬α</span>, convert everything to CNF, resolve repeatedly. If the <b>empty clause □</b> appears (from P and ¬P), the KB plus ¬α is impossible, so α is proven.</p>
<div class="ex"><div class="ex-h">Proving Criminal(West)</div>
C1 (R1 in CNF) + American(West) → R1 · + Weapon(M₁) → R2 · + Sells(West,M₁,Nono) → R3 · + Hostile(Nono) → R4 = Criminal(West) · + ¬Criminal(West) → □</div>
<p>Resolution is <b>sound</b> and <b>refutation-complete</b> (if KB ⊨ α it will reach □), but may run forever when α is not entailed. Strategies such as unit preference, set of support and subsumption keep it practical.</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div>¬Prescribed(p,d) ∨ ¬BetaLactam(d) ∨ ¬PenicillinAllergy(p) ∨ Alert(p,d), resolved with Maria’s chart facts and the negated goal ¬Alert(Maria, Amox), reaches □ in four steps.</div>
<div class="mistake"><b>Common mistake:</b> resolving two literals at once. Each resolution step cancels exactly one complementary pair.</div>`,
  cards: [
    ["Literal", "An atom or the negation of an atom."],
    ["Clause", "A disjunction (∨) of literals."],
    ["CNF", "A conjunction (∧) of clauses."],
    ["P ⇒ Q in CNF", "¬P ∨ Q"],
    ["Complementary pair", "A literal and the negation of a literal that unifies with it."],
    ["Resolvent", "The clause left after cancelling a complementary pair and merging the rest."],
    ["Empty clause □", "A clause with no literals; reaching it means a contradiction."],
    ["Refutation", "Prove α by adding ¬α and deriving □."],
    ["Refutation-complete", "If KB ⊨ α, resolution on KB ∪ {¬α} is guaranteed to reach □."]
  ],
  check: { q: "What do you get when you resolve ¬Weapon(y) ∨ Criminal(West) with Weapon(M₁)?",
    options: ["Criminal(M₁)", "Criminal(West)", "¬Weapon(M₁)", "the empty clause □"], answer: 1,
    why: "The pair ¬Weapon(y) / Weapon(M₁) cancels with θ = {y/M₁}; what remains is Criminal(West)." },
  mcq: [
    { q: "Which is in CNF?", options: ["(A ∨ B) ∧ (¬C ∨ D)", "A ⇒ B", "¬(A ∧ B)", "(A ∧ B) ∨ C"], answer: 0,
      fb: ["Correct: ∧ of ∨-clauses.", "Contains ⇒.", "¬ applies to a compound.", "∨ over ∧ must be distributed."] },
    { q: "In CNF conversion, what does Skolemization remove?", options: ["Implications", "Existential quantifiers", "Negations", "Disjunctions"], answer: 1,
      fb: ["Step 1 removes ⇒.", "Correct: ∃ variables become Skolem constants or functions.", "Negations stay (on atoms).", "Disjunctions are part of clauses."] },
    { q: "Resolution refutation proves α by…", options: ["Deriving α directly", "Adding ¬α and deriving the empty clause", "Adding α and checking consistency", "Grounding every rule"], answer: 1,
      fb: ["That is chaining.", "Correct.", "That would only show α is consistent.", "That is propositionalization."] },
    { q: "Resolving P(x) ∨ Q(x) with ¬P(A) gives…", options: ["Q(A)", "Q(x)", "P(A) ∨ Q(A)", "□"], answer: 0,
      fb: ["Correct: cancel P with θ = {x/A}, keep Q(A).", "θ must be applied to the rest.", "P(A) was cancelled.", "Q(A) remains."] },
    { q: "If α is NOT entailed, resolution…", options: ["Always reports “no” quickly", "May run forever", "Derives ¬α", "Derives □ anyway"], answer: 1,
      fb: ["FOL is semidecidable; no method can promise that.", "Correct.", "Not necessarily.", "That would make it unsound."] }
  ]
},
{
  id: "wrap9", kind: "lecture", part: "p1", slides: [61, 63],
  label: "9 ✓", title: "Chapter 9 Wrap-up",
  blurb: "Choosing an inference method, the six ideas of Chapter 9, and the bridge to knowledge representation."
}
);
