window.LAB_MODULES = window.LAB_MODULES || [];
window.LAB_MODULES.push(
{
  id: "intro10", kind: "lecture", part: "p2", slides: [1, 3],
  label: "10 ▶", title: "Chapter 10 Opening",
  blurb: "Why knowledge representation matters, and the six layers of Chapter 10."
},
{
  id: "s101", kind: "section", part: "p2", slides: [4, 10],
  label: "10.1", title: "Ontological Engineering",
  blurb: "Designing the framework of what exists: concepts, relations, properties, and the upper ontology.",
  learn: `
<h3>1. What an ontology is</h3>
<p>An <b>ontology</b> is a formal specification of the kinds of things in a domain and how they relate, written <span class="f">O = (C, R, P)</span>: <b>C</b>oncepts (classes such as Patient, Doctor, Drug), <b>R</b>elations (TreatedBy(patient, doctor)) and <b>P</b>roperties (Age, Ward, Dose). The key axiom pattern is subcategory membership: <span class="f">∀x Doctor(x) ⇒ Person(x)</span>.</p>

<h3>2. The upper ontology</h3>
<p>The most general layer, shared by every domain: <i>Anything</i> divides into AbstractObjects (sets, numbers, sentences), GeneralizedEvents (intervals, places, processes), PhysicalObjects and Stuff. It is <b>not a strict tree</b>: Humans sit under both Animals and Agents.</p>

<h3>3. Inheritance through the hierarchy</h3>
<div class="ex"><div class="ex-h">Worked example</div>
Fact: <span class="f">Doctor(DrSmith)</span> · Axioms: <span class="f">∀x Doctor(x) ⇒ Person(x)</span>, <span class="f">∀x Person(x) ⇒ HasRights(x)</span><br>
Step 1: Doctor(DrSmith) ⇒ Person(DrSmith) · Step 2: Person(DrSmith) ⇒ HasRights(DrSmith)<br>
No rule mentions doctors having rights; the conclusion flowed down the hierarchy. This is forward chaining from Chapter 9 applied to categories.</div>

<h3>4. How real ontologies are built</h3>
<ul>
<li><b>Expert-designed</b> — CYC (since 1984): high quality, very expensive.</li>
<li><b>Imported from databases</b> — DBpedia from Wikipedia infoboxes: large, uneven quality.</li>
<li><b>Extracted from text</b> — TextRunner read millions of web pages: huge, noisy.</li>
<li><b>Crowdsourced</b> — OpenMind: cheap, inconsistent.</li>
</ul>
<p>Tom Gruber’s point: an ontology is a <b>social agreement</b> among the people who must share knowledge.</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div>Persons ⊃ Patients and Staff; Staff ⊃ Clinicians ⊃ Doctors, Nurses. Drugs ⊃ Antibiotics ⊃ BetaLactams ⊃ Penicillins ∋ Amoxicillin. One fact, PenicillinAllergy(Maria), plus the hierarchy flags every penicillin-class drug, including ones added next year.</div>
<div class="mistake"><b>Common mistake:</b> putting a category in the wrong place. It then inherits the wrong properties everywhere.</div>`,
  cards: [
    ["Ontology", "A formal specification of the kinds of things in a domain and how they relate."],
    ["O = (C, R, P)", "Concepts, Relations, Properties."],
    ["Upper ontology", "The most general categories, shared by every domain."],
    ["Why the upper ontology is not a strict tree", "A category can have two parents, e.g. Humans ⊂ Animals and Humans ⊂ Agents."],
    ["Inheritance", "Properties of a category flow down to its subcategories and members."],
    ["CYC", "Expert-built commonsense knowledge base begun in 1984."],
    ["DBpedia", "Ontology imported from Wikipedia infoboxes."],
    ["Gruber’s view", "An ontology is a social agreement among people who share knowledge."]
  ],
  check: { q: "In the upper ontology, why is the hierarchy NOT a strict tree?",
    options: ["Because abstract objects have no members", "Because a category can have two parents — Humans are Animals and Agents", "Because events and objects are the same thing", "Because ontologies forbid inheritance"], answer: 1,
    why: "Humans sit under both Animals and Agents. A strict tree allows only one parent per node." },
  mcq: [
    { q: "In O = (C, R, P), TreatedBy(patient, doctor) is an example of…", options: ["A concept", "A relation", "A property", "An axiom"], answer: 1,
      fb: ["Concepts are classes such as Patient.", "Correct: it connects two things.", "Properties are attributes such as Age.", "It is a relation, not a rule."] },
    { q: "From Doctor(DrSmith) and ∀x Doctor(x) ⇒ Person(x), we conclude…", options: ["Doctor(Person)", "Person(DrSmith)", "∀x Person(x)", "Nothing"], answer: 1,
      fb: ["Mixes a category into an argument.", "Correct: inheritance by one step.", "Far too strong.", "Modus Ponens applies."] },
    { q: "Which approach built DBpedia?", options: ["Hand-written axioms", "Importing Wikipedia infoboxes", "Crowdsourcing plain-English facts", "Reading millions of web pages"], answer: 1,
      fb: ["That describes CYC.", "Correct.", "That describes OpenMind.", "That describes TextRunner."] },
    { q: "Which is the main trade-off of expert-designed ontologies like CYC?", options: ["Noisy and inconsistent", "High quality but very expensive", "Free but small", "Fast but wrong"], answer: 1,
      fb: ["That fits text extraction and crowdsourcing.", "Correct.", "CYC is neither free nor small.", "Expert axioms are carefully checked."] },
    { q: "Amoxicillin ∈ Penicillins ⊂ BetaLactams. What does inheritance give?", options: ["Amoxicillin ∈ BetaLactams", "Penicillins ∈ Amoxicillin", "BetaLactams ⊂ Amoxicillin", "Nothing"], answer: 0,
      fb: ["Correct: membership flows up through subset links.", "Reversed.", "Reversed.", "Membership plus subset gives membership."] }
  ]
},
{
  id: "s102", kind: "section", part: "p2", slides: [11, 19],
  label: "10.2", title: "Categories and Objects",
  blurb: "Membership, subsets, partitions, parts, measurements, things versus stuff, and natural kinds.",
  learn: `
<h3>1. Two ways to write a category</h3>
<p>As a <b>predicate</b>: <span class="f">Basketball(BB₉)</span>, <span class="f">∀x Basketball(x) ⇒ Ball(x)</span>. As an <b>object</b> (reified): <span class="f">BB₉ ∈ Basketballs</span>, <span class="f">Basketballs ⊂ Balls</span>. Reifying lets us state facts about the category itself, e.g. <span class="f">Dogs ∈ DomesticatedSpecies</span>.</p>

<h3>2. Inheritance and classification</h3>
<div class="ex"><div class="ex-h">Worked example</div>
<span class="f">GrannySmith ∈ Apples</span>, <span class="f">Apples ⊂ Fruit</span>, <span class="f">Fruit ⊂ Food</span>, <span class="f">∀x x ∈ Food ⇒ Edible(x)</span><br>
→ GrannySmith ∈ Fruit → GrannySmith ∈ Food → <span class="f">Edible(GrannySmith)</span>.<br>
Classification runs the other way: Striped ∧ Round ∧ RedFlesh ∧ BlackSeeds ⇒ x ∈ Watermelons, and then x inherits everything known about watermelons.</div>

<h3>3. Disjoint, exhaustive, partition</h3>
<ul>
<li><b>Disjoint</b>: no shared members (Animals, Vegetables).</li>
<li><b>Exhaustive decomposition</b>: every member of the parent is in at least one part (Americans, Canadians, Mexicans of NorthAmericans — dual citizens may be in two).</li>
<li><b>Partition</b>: disjoint and exhaustive — exactly one part each.</li>
</ul>

<h3>4. Parts, measures, stuff</h3>
<p><b>PartOf</b> is transitive and reflexive: Bucharest ⊂ Romania … ⊂ Earth gives PartOf(Bucharest, Earth). PartOf is <i>not</i> subset, and a category is not a pile (use <span class="f">BunchOf(…)</span> for a physical group). <b>Measures</b> are objects: <span class="f">Diameter(Ball₁₂) = Inches(9.5)</span>. <b>Things</b> (count nouns) lose their identity when divided — extrinsic properties; <b>stuff</b> (mass nouns: butter, saline) does not — intrinsic properties.</p>
<p><b>Natural kinds</b> (tomato, game) have no exact definition, so we use <span class="f">Typical(Tomatoes)</span> and attach defaults to typical members only.</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div>Status {Inpatient, Outpatient, Discharged} is a partition. Clinician types are not (a nurse practitioner can be in two). PartOf(Bed12, Ward4), PartOf(Ward4, NorthWing) ⇒ PartOf(Bed12, NorthWing). Dose(Order17) = Milligrams(500). Saline is stuff: measured, not counted.</div>
<div class="mistake"><b>Common mistake:</b> asserting a partition when categories can overlap; the system will then deny true facts.</div>`,
  cards: [
    ["Reification", "Turning something (a category, an event) into an object so facts can be attached to it."],
    ["x ∈ C vs C₁ ⊂ C₂", "Membership of an object vs subset relation between categories."],
    ["Disjoint", "Categories with no members in common."],
    ["Exhaustive decomposition", "Every member of the parent belongs to at least one subcategory."],
    ["Partition", "Disjoint and exhaustive: every member in exactly one subcategory."],
    ["PartOf", "Part–whole relation; transitive and reflexive; not the same as subset."],
    ["Intrinsic property", "Kept when the object is divided (density) — typical of stuff."],
    ["Natural kind", "A category without an exact definition, e.g. tomato; use Typical(…)."]
  ],
  check: { q: "Bucharest is part of Romania. Which statement is correct?",
    options: ["Bucharest ⊂ Romania (subset)", "PartOf(Bucharest, Romania), and PartOf is transitive", "Bucharest ∈ Romania (member of a category)", "Romania is a category of cities"], answer: 1,
    why: "Bucharest is an individual object; part–whole is PartOf, which is transitive. Subset and membership relate objects and categories." },
  mcq: [
    { q: "Which set is a partition of LivingThings?", options: ["{Animals, Pets}", "{Animals, Plants, Fungi, Protista, Monera}", "{Americans, Canadians}", "{Fruit, Food}"], answer: 1,
      fb: ["Pets overlap Animals.", "Correct: every living thing in exactly one kingdom.", "Not about living things, and overlapping.", "Fruit ⊂ Food overlap."] },
    { q: "Why is ExhaustiveDecomposition({Americans, Canadians, Mexicans}, NorthAmericans) not a partition?", options: ["Some North Americans are in none", "Dual citizens can be in two", "Mexicans are not North American", "Partitions need exactly two parts"], answer: 1,
      fb: ["It is exhaustive by definition.", "Correct: not disjoint.", "They are.", "Any number of parts is allowed."] },
    { q: "Which property of butter is intrinsic?", options: ["Weight", "Shape", "Melting point", "Size"], answer: 2,
      fb: ["Halving butter halves its weight: extrinsic.", "Extrinsic.", "Correct: every piece keeps it.", "Extrinsic."] },
    { q: "Diameter(Ball₁₂) = Inches(9.5) treats a measurement as…", options: ["A predicate", "An object (a term)", "A category", "A fluent"], answer: 1,
      fb: ["Diameter is a function returning a term.", "Correct: measures are objects that can be compared and converted.", "It is a single value.", "No time is involved."] },
    { q: "What does Typical(Tomatoes) accomplish?", options: ["Defines tomatoes exactly", "Attaches rules like “red and round” only to typical members", "Removes atypical tomatoes from the KB", "Makes Tomatoes a partition"], answer: 1,
      fb: ["Natural kinds have no exact definition.", "Correct.", "Atypical members remain tomatoes.", "Unrelated to partitions."] }
  ]
},
{
  id: "s103", kind: "section", part: "p2", slides: [20, 28],
  label: "10.3", title: "Events and Time",
  blurb: "The event calculus: fluents switched on and off by events, inertia, and Allen’s interval relations.",
  learn: `
<h3>1. Why a new approach</h3>
<p>Chapter 7’s successor-state axioms assume one instantaneous action per step. Real actions take time (filling a bathtub) and overlap (brushing teeth while it fills). The <b>event calculus</b> treats events as objects with a start and an end in continuous time.</p>

<h3>2. Core predicates</h3>
<ul>
<li><span class="f">T(f, t₁, t₂)</span> — fluent f holds throughout [t₁, t₂]</li>
<li><span class="f">Happens(e, t₁, t₂)</span> — event e starts at t₁ and ends at t₂</li>
<li><span class="f">Initiates(e, f, t)</span> — e makes f become true at t</li>
<li><span class="f">Terminates(e, f, t)</span> — e makes f stop being true at t</li>
</ul>
<p>A <b>fluent</b> is a fact that can change (At(Shankar, SF), Fever(Maria)).</p>
<div class="ex"><div class="ex-h">Worked example: Shankar’s flight</div>
<span class="f">E₁ ∈ Flyings</span>, Flyer(E₁, Shankar), Origin(E₁, SF), Destination(E₁, DC), <span class="f">Happens(E₁, t₁, t₂)</span><br>
<span class="f">Terminates(E₁, At(Shankar, SF), t₁)</span> · <span class="f">Initiates(E₁, At(Shankar, DC), t₂)</span><br>
Because E₁ is an object we can add Bumpy(E₁) and Duration(E₁) = Hours(5) without new predicates.</div>

<h3>3. Inertia</h3>
<p>Fluents persist until an event terminates them. Nothing terminates At(Shankar, DC), so <span class="f">T(At(Shankar, DC), t₂, now)</span> holds.</p>

<h3>4. Intervals and changing identity</h3>
<p>Allen’s relations compare intervals i and j: <b>Meet</b> (i ends as j begins), <b>Before</b> (a gap), <b>During</b> (i inside j), <b>Overlap</b> (i starts first, j starts before i ends), Starts, Finishes, Equals, After. For terms whose referent changes, use a fluent: <span class="f">T(Equals(President(USA), GeorgeWashington), Begin(AD1790), End(AD1790))</span> — not the logical =.</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div>Admit (1 a.m.) initiates At(Maria, Ward4), held by inertia. E₂ initiates Fever(Maria) at 2 a.m.; E₅ terminates it at 8 a.m. Antibiotic 4–7 a.m. is <b>During</b> the fever and <b>Overlaps</b> IV fluids 5–10 a.m., so the system checks drug–fluid compatibility.</div>
<div class="mistake"><b>Common mistake:</b> writing President(USA) = Lincoln. Logical equality never changes; use a time-indexed Equals fluent.</div>`,
  cards: [
    ["Fluent", "A fact that can change over time, e.g. Fever(Maria)."],
    ["Event calculus", "Logic of events as objects with durations that switch fluents on and off."],
    ["T(f, t₁, t₂)", "Fluent f is true at every moment between t₁ and t₂."],
    ["Happens(e, t₁, t₂)", "Event e starts at t₁ and ends at t₂."],
    ["Initiates / Terminates", "Event makes a fluent become true / stop being true at a time."],
    ["Inertia", "Fluents persist until some event terminates them."],
    ["Allen: During(i, j)", "Interval i lies entirely inside j."],
    ["Allen: Overlap(i, j)", "i starts first, and j starts before i ends."],
    ["Time-indexed Equals", "A fluent that two terms co-refer during an interval — not logical =."]
  ],
  check: { q: "Shankar lands in DC at t₂ and no later event mentions him. Why does T(At(Shankar, DC), t₂, now) hold?",
    options: ["Because Happens(E₁, t₁, t₂) is true", "Because fluents persist until an event terminates them (inertia)", "Because At(Shankar, DC) is a logical identity", "Because Allen’s Meet relation applies"], answer: 1,
    why: "Initiates made the fluent true at t₂ and nothing terminated it, so it persists." },
  mcq: [
    { q: "Which is a fluent?", options: ["Happens(E₁, t₁, t₂)", "Fever(Maria)", "Flyings", "Hours(5)"], answer: 1,
      fb: ["That is an event predicate.", "Correct: a fact that can change.", "That is a category of events.", "That is a measure."] },
    { q: "A transfer event moves Maria from Ward 4 to the ICU at 9 a.m. It…", options: ["Initiates At(Maria, Ward4)", "Terminates At(Maria, Ward4) and initiates At(Maria, ICU)", "Has no effect on fluents", "Makes At(Maria, Ward4) true forever"], answer: 1,
      fb: ["She is leaving Ward 4.", "Correct.", "Transfers change location fluents.", "Termination ends it."] },
    { q: "World War I and World War II stand in which Allen relation?", options: ["Meet", "Overlap", "Before", "During"], answer: 2,
      fb: ["There was a gap between them.", "They did not overlap.", "Correct.", "Neither lies inside the other."] },
    { q: "Why reify the flight as E₁?", options: ["To make it a fluent", "So facts like duration and bumpiness can be attached without new predicates", "Because flights are categories", "To avoid time points"], answer: 1,
      fb: ["E₁ is an event, not a fluent.", "Correct.", "E₁ is a member of Flyings.", "Time points are still used."] },
    { q: "Antibiotic 4–7 a.m., fever 2–8 a.m. The antibiotic interval is…", options: ["Before the fever", "During the fever", "Overlapping and extending past the fever", "Equal to the fever"], answer: 1,
      fb: ["It starts after the fever starts.", "Correct: entirely inside it.", "It ends before the fever ends.", "Different endpoints."] }
  ]
},
{
  id: "s104", kind: "section", part: "p2", slides: [29, 36],
  label: "10.4", title: "Mental Objects and Modal Logic",
  blurb: "Representing what agents know and believe: referential opacity, possible worlds, and de re vs de dicto.",
  learn: `
<h3>1. Propositional attitudes</h3>
<p>A <b>propositional attitude</b> relates an agent to a proposition: Knows, Believes, Wants. Classical FOL is <b>referentially transparent</b>: if x = y, anything true of x is true of y. That breaks for knowledge.</p>
<div class="ex"><div class="ex-h">The Superman problem</div>
<span class="f">Superman = Clark</span> and <span class="f">Knows(Lois, CanFly(Superman))</span>. Substituting gives Knows(Lois, CanFly(Clark)) — false: Lois does not know Clark is Superman. Inside knowledge, <b>the description matters</b>. This is <b>referential opacity</b>.</div>

<h3>2. Modal logic and possible worlds</h3>
<p><span class="f">K_A P</span> means “agent A knows P”; K takes a whole sentence. Rule: <b>K_A P is true iff P is true in every world A considers possible</b> (the worlds accessible to A). In every world Lois considers possible, Superman flies; in some, Clark ≠ Superman. So she knows Superman flies but not that Clark does.</p>

<h3>3. Axioms of knowledge</h3>
<ul>
<li><b>Closure</b>: <span class="f">(K_a P ∧ K_a(P ⇒ Q)) ⇒ K_a Q</span></li>
<li><b>Truth</b>: <span class="f">K_a P ⇒ P</span> (knowledge, unlike belief, cannot be false)</li>
<li><b>Introspection</b>: <span class="f">K_a P ⇒ K_a(K_a P)</span></li>
</ul>
<p>Together they imply <b>logical omniscience</b> — knowing every consequence of what one knows — an unrealistic limitation.</p>

<h3>4. De re vs de dicto</h3>
<p><span class="f">∃x K_Bond Spy(x)</span> (de re, ∃ outside K): Bond knows <i>who</i> the spy is. <span class="f">K_Bond ∃x Spy(x)</span> (de dicto, ∃ inside K): Bond knows spies exist, not who. De re implies de dicto, not the reverse. Temporal modal operators G (always) and F (eventually) are used to verify hardware and software.</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div>PatientIn(Bed12) = Maria, and K_Nurse Febrile(PatientIn(Bed12)). It does not follow that K_Nurse Febrile(Maria). The pharmacist knows Maria’s allergy but not her bed. A system that reasons about who knows what alerts the nurse by name as well as bed.</div>
<div class="mistake"><b>Common mistake:</b> substituting equals inside Knows or Believes.</div>`,
  cards: [
    ["Propositional attitude", "A relation between an agent and a proposition: Knows, Believes, Wants."],
    ["Referential transparency", "If x = y, anything true of x is true of y — holds in classical FOL."],
    ["Referential opacity", "Inside Knows/Believes, equal terms cannot be freely substituted."],
    ["K_A P", "Agent A knows P; true iff P holds in every world A considers possible."],
    ["Truth axiom", "K_a P ⇒ P: you cannot know something false."],
    ["Logical omniscience", "The unrealistic consequence that agents know every implication of what they know."],
    ["De re", "∃x K Spy(x): knows of a specific individual — knows who."],
    ["De dicto", "K ∃x Spy(x): knows that some individual exists — not who."]
  ],
  check: { q: "Which sentence says Bond knows WHO the spy is?",
    options: ["K_Bond ∃x Spy(x)", "∃x K_Bond Spy(x)", "K_Bond (Spy(x) ∨ ¬Spy(x))", "∃x Spy(x)"], answer: 1,
    why: "With ∃ outside K, there is one specific person Bond knows is a spy (de re). A is de dicto; C is a tautology." },
  mcq: [
    { q: "Why does Knows(Lois, CanFly(Clark)) NOT follow from Superman = Clark and Knows(Lois, CanFly(Superman))?", options: ["Superman ≠ Clark", "Knowledge contexts are referentially opaque", "CanFly is not a predicate", "Lois knows everything"], answer: 1,
      fb: ["They are the same person.", "Correct.", "It is a predicate.", "Then the conclusion would follow."] },
    { q: "K_A P is true in world w₀ when…", options: ["P is true in w₀", "P is true in some world A considers possible", "P is true in every world A considers possible", "A believes P"], answer: 2,
      fb: ["Necessary, not sufficient.", "That is too weak.", "Correct.", "Belief is weaker than knowledge."] },
    { q: "Which axiom separates knowledge from belief?", options: ["Closure", "Truth: K_a P ⇒ P", "Introspection", "Omniscience"], answer: 1,
      fb: ["Belief can also be closed under implication.", "Correct: beliefs can be false; knowledge cannot.", "Introspection can apply to belief.", "Omniscience is a consequence, not an axiom."] },
    { q: "The night nurse knows “the patient in bed 12 is febrile.” Which follows?", options: ["K_Nurse Febrile(Maria)", "Febrile(PatientIn(Bed12))", "K_Pharm Febrile(Maria)", "K_Nurse PatientIn(Bed12) = Maria"], answer: 1,
      fb: ["Opacity blocks this substitution.", "Correct: by the Truth axiom.", "Knowledge of others does not transfer.", "Nothing says she knows who is in bed 12."] },
    { q: "Which statement is true?", options: ["De dicto implies de re", "De re implies de dicto", "They are equivalent", "Neither implies the other"], answer: 1,
      fb: ["Knowing spies exist does not tell you who.", "Correct.", "Only one direction holds.", "One direction holds."] }
  ]
},
{
  id: "s105", kind: "section", part: "p2", slides: [37, 45],
  label: "10.5", title: "Semantic Networks and Description Logics",
  blurb: "Fast reasoning about categories: graphs, inheritance with overrides, multiple inheritance, and classification.",
  learn: `
<h3>1. Semantic networks</h3>
<p>Knowledge drawn as a graph: nodes are objects or categories, labeled arrows are relations. <b>SubsetOf</b> = ⊂, <b>MemberOf</b> = ∈, other arrows carry binary relations (SisterOf). A property on a category is a <b>default</b> for its members. A semantic network is a restricted, drawn form of logic, not a rival to it.</p>

<h3>2. Inheritance: specific beats general</h3>
<div class="ex"><div class="ex-h">Worked example: how many legs?</div>
Persons has Legs = 2. Mary ∈ FemalePersons ⊂ Persons, no local value → climb → Legs = 2.<br>
John ∈ MalePersons has a local value Legs = 1 → found first → stop. The specific value overrides the default.</div>
<p><b>Multiple inheritance</b> can conflict: Nixon ∈ Republicans (default ¬Pacifist) and Quakers (default Pacifist). The <b>Nixon diamond</b> has no specific-over-general answer; a careful system stays agnostic.</p>
<p>Links are binary, so n-ary facts are <b>reified</b>: Fly₁₇ ∈ FlyEvents with Agent, Origin, Destination and During links — the same trick as the event calculus.</p>

<h3>3. Description logics</h3>
<p>Designed to answer category questions in <b>polynomial time</b>. Three tasks: <b>subsumption</b> (is C₁ ⊆ C₂?), <b>classification</b> (which categories contain x?), <b>consistency</b> (can C have members?). CLASSIC operators: And, All, AtLeast, AtMost, Fills.</p>
<div class="ex"><div class="ex-h">Worked example</div>
FOL: <span class="f">Bachelor(x) ⇔ Unmarried(x) ∧ Adult(x) ∧ Male(x)</span><br>
CLASSIC: <span class="f">Bachelor = And(Unmarried, Adult, Male)</span> — so Bachelor ⊆ Adult can be read off the conjuncts.</div>
<p>Speed is bought by restricting negation and disjunction.</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div><span class="f">SepsisWatch = And(Patient, Fills(Status, Febrile), Fills(Status, Tachycardic))</span> and <span class="f">PenicillinRisk = And(Patient, All(Prescribed, BetaLactam), Fills(Allergy, Penicillin))</span>. New data classifies Maria into both. SNOMED CT, used in hospitals worldwide, is built on a description logic.</div>
<div class="mistake"><b>Common mistake:</b> letting a general default override a local value. Inheritance stops at the first value found.</div>`,
  cards: [
    ["Semantic network", "Knowledge drawn as a graph of nodes and labeled relation arrows."],
    ["SubsetOf link", "Category ⊂ category, e.g. FemalePersons ⊂ Persons."],
    ["MemberOf link", "Object ∈ category, e.g. Mary ∈ FemalePersons."],
    ["Inheritance with override", "Climb until the first value is found; specific beats general."],
    ["Nixon diamond", "Two equally specific parents give conflicting defaults."],
    ["Subsumption", "Deciding whether one category is a subset of another."],
    ["Classification", "Deciding which categories an object belongs to."],
    ["Description logic trade-off", "Polynomial-time reasoning by limiting negation and disjunction."]
  ],
  check: { q: "John’s node says Legs = 1 and Persons says Legs = 2. What does inheritance give John?",
    options: ["2 — categories always win", "1 — the most specific value is found first and wins", "Both — it reports a conflict", "Undefined — networks cannot store numbers"], answer: 1,
    why: "The search starts at John and stops at the first value. Conflicts arise only between equally specific parents (Nixon)." },
  mcq: [
    { q: "In a semantic network, Mary → FemalePersons labeled MemberOf means…", options: ["FemalePersons ⊂ Mary", "Mary ∈ FemalePersons", "Mary ⊂ FemalePersons", "SisterOf(Mary)"], answer: 1,
      fb: ["Reversed.", "Correct.", "Mary is an object, not a category.", "Different link."] },
    { q: "Why does the Nixon diamond have no inheritance answer?", options: ["Nixon is in no category", "Two equally specific parents give opposite defaults", "Quakers ⊂ Republicans", "Networks cannot store negation"], answer: 1,
      fb: ["He is in two.", "Correct.", "Neither is more specific.", "¬Pacifist is just a default value."] },
    { q: "How does a network store Fly(Shankar, NY, NewDelhi, Yesterday)?", options: ["One four-way arrow", "An event node with four binary links", "It cannot", "As a category"], answer: 1,
      fb: ["Arrows connect only two nodes.", "Correct: reification.", "Reification makes it possible.", "It is an event."] },
    { q: "“Is every PenicillinRisk patient a Patient?” is which DL task?", options: ["Classification", "Subsumption", "Consistency", "Resolution"], answer: 1,
      fb: ["Classification is about an individual.", "Correct: is one category ⊆ another?", "Consistency asks whether a category can have members.", "Not a DL task name."] },
    { q: "Description logics are fast mainly because they…", options: ["Use GPUs", "Restrict negation and disjunction", "Avoid categories", "Use Prolog"], answer: 1,
      fb: ["Not an algorithmic reason.", "Correct.", "Categories are their whole point.", "They are a separate formalism."] }
  ]
},
{
  id: "s106", kind: "section", part: "p2", slides: [46, 54],
  label: "10.6", title: "Reasoning with Default Information",
  blurb: "When conclusions must be withdrawn: circumscription, default logic, and truth maintenance.",
  learn: `
<h3>1. Monotonic vs nonmonotonic</h3>
<p>Classical logic is <b>monotonic</b>: if KB ⊨ α then KB ∪ {β} ⊨ α. Adding facts never removes a conclusion. Common sense is <b>nonmonotonic</b>: you assume a parked car has four wheels, then see it jacked up and retract. Retraction is the rational response to incomplete information.</p>

<h3>2. Circumscription (McCarthy, 1980)</h3>
<div class="rule"><span class="f">Bird(x) ∧ ¬Abnormal₁(x) ⇒ Flies(x)</span></div>
<p>Circumscribing Abnormal₁ means assuming it is false unless forced true — formally, prefer models with the fewest abnormal objects.</p>
<div class="ex"><div class="ex-h">Worked example</div>
Bird(Tweety), nothing says abnormal → <span class="f">Flies(Tweety)</span>.<br>
Learn Penguin(Tweety) and <span class="f">Penguin(x) ⇒ Abnormal₁(x)</span> → the rule no longer applies → Flies(Tweety) withdrawn.</div>
<p>Unlike the closed-world assumption (everything unknown is false), circumscription minimizes only the predicates you name. For Nixon, two models each have one abnormality, so it stays agnostic; prioritized circumscription can break the tie.</p>

<h3>3. Default logic (Reiter, 1980)</h3>
<p>Rule <span class="f">P : J₁, …, Jₙ / C</span>: if P holds and each Jᵢ is consistent with what we know, conclude C. Birds fly: <span class="f">Bird(x) : Flies(x) / Flies(x)</span>. An <b>extension</b> is a maximal consistent set of conclusions; Nixon has two, reported as genuine ambiguity.</p>

<h3>4. Truth maintenance</h3>
<p>A <b>JTMS</b> records each belief’s justifications. Retracting P removes beliefs whose only support used P; beliefs with another justification survive. An <b>ATMS</b> labels beliefs with the assumption sets under which they hold, tracking many hypotheses at once (ideal for diagnosis).</p>
<div class="ng"><div class="ng-h">Northgate Hospital</div>Default: <span class="f">Patient(p) ∧ ¬Abnormal(p) ⇒ Tolerates(p, Amoxicillin)</span>; <span class="f">PenicillinAllergy(p) ⇒ Abnormal(p)</span>. 08:00 the allergy blocks the default and fires the alert. 10:30 the allergist finds a charting error; the JTMS removes the alert and restores the default. SepsisRisk(Maria), supported by fever and heart rate, stays.</div>
<div class="mistake"><b>Common mistake:</b> calling a retraction “unsound”. It is the correct, nonmonotonic response to new evidence.</div>`,
  cards: [
    ["Monotonic", "Adding facts never removes a conclusion (classical logic)."],
    ["Nonmonotonic", "New information can remove a conclusion (common sense)."],
    ["Circumscription", "Assume abnormal predicates are false unless forced; prefer minimal-abnormality models."],
    ["Circumscription vs CWA", "CWA makes every unknown atom false; circumscription minimizes only named predicates."],
    ["Default rule P : J / C", "If P holds and J is consistent with what we know, conclude C."],
    ["Extension", "A maximal consistent set of conclusions under default logic."],
    ["JTMS", "Records justifications; retracting P removes beliefs supported only by P."],
    ["ATMS", "Labels beliefs with assumption sets; tracks many hypothetical worlds at once."]
  ],
  check: { q: "A system believes Flies(Tweety), then learns Penguin(Tweety) and withdraws the belief. This reasoning is…",
    options: ["Monotonic", "Nonmonotonic", "Unsound", "Referentially opaque"], answer: 1,
    why: "New information removed a conclusion, which monotonic classical logic can never do. It is the rational response, not an error." },
  mcq: [
    { q: "Which statement defines monotonicity?", options: ["KB ⊨ α ⇒ KB ∪ {β} ⊨ α", "KB ⊨ α ⇒ KB ⊨ ¬α", "Adding facts can remove conclusions", "Every unknown is false"], answer: 0,
      fb: ["Correct.", "That is inconsistency.", "That is nonmonotonic.", "That is the closed-world assumption."] },
    { q: "In circumscription, which models are preferred?", options: ["Those with the most facts", "Those with the fewest abnormal objects", "Those where all birds fly", "The first model found"], answer: 1,
      fb: ["Not the criterion.", "Correct.", "Penguins are allowed to be abnormal.", "Order is irrelevant."] },
    { q: "For the Nixon diamond, default logic produces…", options: ["One extension where Nixon is a pacifist", "Two extensions with opposite conclusions", "No extensions", "A contradiction in the KB"], answer: 1,
      fb: ["The other default is equally applicable.", "Correct.", "Both defaults can apply.", "Defaults avoid contradiction by choosing."] },
    { q: "P ⇒ Q is justified by {P, P ⇒ Q} and by {R, R ⇒ Q}. P is retracted. A JTMS…", options: ["Removes Q", "Keeps Q via the second justification", "Removes R", "Rebuilds the whole KB"], answer: 1,
      fb: ["Q still has support.", "Correct.", "R is unaffected.", "A JTMS repairs only what depended on P."] },
    { q: "Why does SepsisRisk(Maria) survive when her allergy is retracted?", options: ["It is a default", "It has independent support (fever, heart rate)", "Sepsis cannot be retracted", "The JTMS ignores medical facts"], answer: 1,
      fb: ["It is derived by a rule.", "Correct: its justification never used the allergy.", "Any belief can be retracted if its support goes.", "Not how a JTMS works."] }
  ]
},
{
  id: "wrap10", kind: "lecture", part: "p2", slides: [55, 59],
  label: "✓", title: "Wrap-up: The Whole Picture",
  blurb: "Common misconceptions, how Chapter 10 fits together, where these ideas run today, and the closing summary."
}
);
