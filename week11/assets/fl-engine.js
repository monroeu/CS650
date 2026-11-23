/* CS650 Formal-Language Engine — propositional logic, first-order logic, categories,
   STRIPS/PDDL planning (forward, backward, A*, SAT), heuristics, hierarchical (HTN/angelic),
   sensorless belief-state planning, and critical-path scheduling with resources.
   Pure functions (no DOM). Used by workspace.js in the browser and by tests in Node. */
(function (root) {
  "use strict";
  const E = {};

  /* ============================== tokenizer ============================== */
  const SYM = [
    ["<=>", "IFF"], ["<->", "IFF"], ["⇔", "IFF"], ["=>", "IMP"], ["->", "IMP"], ["⇒", "IMP"],
    ["!=", "NEQ"], ["≠", "NEQ"], ["¬", "NOT"], ["~", "NOT"], ["!", "NOT"], ["∧", "AND"], ["&", "AND"], ["^", "AND"],
    ["∨", "OR"], ["|", "OR"], ["∀", "ALL"], ["∃", "EX"], ["(", "("], [")", ")"], [",", ","], ["=", "EQ"],
    ["∈", "IN"], ["⊂", "SUB"], ["⊆", "SUB"], ["⊤", "TRUE"], ["⊥", "FALSE"], [":", ":"], ["[", "["], ["]", "]"], ["≺", "BEFORE"], [".", "."]
  ];
  function tokenize(s) {
    const out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (s.startsWith("//", i)) { while (i < s.length && s[i] !== "\n") i++; continue; }
      let m = /^[A-Za-z_][A-Za-z0-9_\-₀-₉']*/.exec(s.slice(i));
      if (m) {
        let w = m[0].replace(/-+$/, ""); i += w.length;
        if (w === "forall") out.push({ t: "ALL" }); else if (w === "exists") out.push({ t: "EX" });
        else if (w === "True") out.push({ t: "TRUE" }); else if (w === "False") out.push({ t: "FALSE" });
        else out.push({ t: "ID", v: w });
        continue;
      }
      m = /^[0-9]+/.exec(s.slice(i)); if (m) { out.push({ t: "NUM", v: m[0] }); i += m[0].length; continue; }
      const sy = SYM.find(([k]) => s.startsWith(k, i));
      if (!sy) throw new Error(`I don't recognise the symbol “${c}”. Use the symbol buttons above the editor.`);
      out.push({ t: sy[1] }); i += sy[0].length;
    }
    return out;
  }
  const isVar = (n) => /^[a-z]/.test(n);

  /* ============================== formula parser ============================== */
  // precedence: ¬ > (= ≠ ∈ ⊂) > ∧ > ∨ > ⇒ > ⇔ ; quantifiers extend as far right as possible
  function Parser(tokens) { this.k = tokens; this.i = 0; }
  Parser.prototype = {
    peek(o = 0) { return this.k[this.i + o]; }, next() { return this.k[this.i++]; },
    is(t) { const p = this.peek(); return p && p.t === t; },
    eat(t, msg) { const p = this.next(); if (!p || p.t !== t) throw new Error(msg || `Expected “${t}”`); return p; },
    formula() { return this.iff(); },
    iff() { let a = this.imp(); while (this.is("IFF")) { this.next(); a = { t: "iff", a, b: this.imp() }; } return a; },
    imp() { const a = this.or(); if (this.is("IMP")) { this.next(); return { t: "imp", a, b: this.imp() }; } return a; },
    or() { let a = this.and(); while (this.is("OR")) { this.next(); a = { t: "or", a, b: this.and() }; } return a; },
    and() { let a = this.unary(); while (this.is("AND")) { this.next(); a = { t: "and", a, b: this.unary() }; } return a; },
    unary() {
      if (this.is("NOT")) { this.next(); return { t: "not", a: this.unary() }; }
      if (this.is("ALL") || this.is("EX")) {
        const q = this.next().t === "ALL" ? "all" : "ex"; const vs = [this.eat("ID", "Expected a variable after the quantifier").v];
        while (this.is(",")) { this.next(); vs.push(this.eat("ID").v); }
        if (this.is(".") || this.is(":")) this.next();
        let body = this.iff();
        for (let j = vs.length - 1; j >= 0; j--) body = { t: q, v: vs[j], a: body };
        return body;
      }
      if (this.is("(")) { this.next(); const f = this.formula(); this.eat(")", "Missing “)”"); return this.rel(f); }
      if (this.is("TRUE")) { this.next(); return { t: "true" }; }
      if (this.is("FALSE")) { this.next(); return { t: "false" }; }
      return this.rel(this.atomOrTerm());
    },
    rel(x) {
      if (this.is("EQ") || this.is("NEQ")) { const op = this.next().t; const y = this.term(); const f = { t: "eq", a: toTerm(x), b: y }; return op === "EQ" ? f : { t: "not", a: f }; }
      if (this.is("IN")) { this.next(); return { t: "atom", p: "∈", args: [toTerm(x), this.term()] }; }
      if (this.is("SUB")) { this.next(); return { t: "atom", p: "⊂", args: [toTerm(x), this.term()] }; }
      return x.t === "term" ? { t: "atom", p: x.n, args: x.args || [] } : x;
    },
    atomOrTerm() {
      const id = this.peek(); if (!id || (id.t !== "ID" && id.t !== "NUM")) throw new Error("Expected a symbol, a predicate or “(”" + (id ? "" : " — the sentence ended too early"));
      this.next(); let args = null;
      if (this.is("(")) { this.next(); args = []; if (!this.is(")")) { args.push(this.term()); while (this.is(",")) { this.next(); args.push(this.term()); } } this.eat(")", "Missing “)” after the arguments of " + id.v); }
      return { t: "term", n: id.v, args };
    },
    term() {
      const id = this.peek(); if (!id || (id.t !== "ID" && id.t !== "NUM")) throw new Error("Expected a term (a constant, variable or function)");
      this.next();
      if (this.is("(")) { this.next(); const args = []; if (!this.is(")")) { args.push(this.term()); while (this.is(",")) { this.next(); args.push(this.term()); } } this.eat(")"); return { f: id.v, args }; }
      return isVar(id.v) ? { v: id.v } : { c: id.v };
    }
  };
  function toTerm(x) { if (x.t === "term") return x.args ? { f: x.n, args: x.args } : (isVar(x.n) ? { v: x.n } : { c: x.n }); throw new Error("Expected a term"); }
  function parseFormula(s) { const p = new Parser(tokenize(s)); const f = p.formula(); if (p.i < p.k.length) throw new Error("Unexpected text after the end of the sentence: check for a missing connective (∧, ∨, ⇒)"); return f; }
  E.parseFormula = parseFormula;

  /* ============================== printing ============================== */
  const tstr = (t) => t.v || t.c || (t.f + "(" + t.args.map(tstr).join(", ") + ")");
  const PREC = { iff: 1, imp: 2, or: 3, and: 4, not: 5, all: 0, ex: 0 };
  function fstr(f, parent = 0) {
    let s, p = PREC[f.t] ?? 9;
    switch (f.t) {
      case "atom": s = f.p === "∈" || f.p === "⊂" ? `${tstr(f.args[0])} ${f.p} ${tstr(f.args[1])}` : f.args.length ? `${f.p}(${f.args.map(tstr).join(", ")})` : f.p; break;
      case "eq": s = `${tstr(f.a)} = ${tstr(f.b)}`; break;
      case "true": s = "⊤"; break; case "false": s = "⊥"; break;
      case "not": s = f.a.t === "eq" ? `${tstr(f.a.a)} ≠ ${tstr(f.a.b)}` : "¬" + fstr(f.a, 5); break;
      case "and": s = fstr(f.a, 4) + " ∧ " + fstr(f.b, 4); break;
      case "or": s = (f.a.t === "and" ? "(" + fstr(f.a) + ")" : fstr(f.a, 3)) + " ∨ " + (f.b.t === "and" ? "(" + fstr(f.b) + ")" : fstr(f.b, 3)); break;
      case "imp": s = fstr(f.a, 3) + " ⇒ " + fstr(f.b, 2); break;
      case "iff": s = fstr(f.a, 2) + " ⇔ " + fstr(f.b, 2); break;
      case "all": s = "∀" + f.v + " " + fstr(f.a, 0); break;
      case "ex": s = "∃" + f.v + " " + fstr(f.a, 0); break;
    }
    return p < parent ? "(" + s + ")" : s;
  }
  E.fstr = fstr; E.tstr = tstr;

  /* ============================== propositional logic ============================== */
  function symbols(f, acc = new Set()) {
    if (f.t === "atom") { if (f.args.length) throw new Error(`“${fstr(f)}” has arguments. In the Propositional tab use plain symbols such as P, Q, Fever.`); acc.add(f.p); }
    else if (f.t === "all" || f.t === "ex" || f.t === "eq") throw new Error("Quantifiers and = belong to first-order logic. Switch to the First-order tab.");
    else ["a", "b"].forEach((k) => f[k] && symbols(f[k], acc));
    return acc;
  }
  function pl(f, m) {
    switch (f.t) {
      case "atom": return !!m[f.p]; case "true": return true; case "false": return false;
      case "not": return !pl(f.a, m); case "and": return pl(f.a, m) && pl(f.b, m); case "or": return pl(f.a, m) || pl(f.b, m);
      case "imp": return !pl(f.a, m) || pl(f.b, m); case "iff": return pl(f.a, m) === pl(f.b, m);
    }
  }
  function splitLines(text) {
    const kb = [], q = [];
    text.split("\n").forEach((raw) => {
      const line = raw.replace(/\/\/.*$/, "").trim(); if (!line) return;
      const m = /^(\?|Query:|⊨|Ask:)\s*(.*)$/i.exec(line);
      if (m) q.push(m[2]); else kb.push(line.replace(/\.$/, ""));
    });
    return { kb, q };
  }
  E.truthTable = function (text) {
    const { kb, q } = splitLines(text); const sents = kb.concat(q);
    if (!sents.length) throw new Error("Write at least one sentence.");
    const fs = sents.map(parseFormula); const syms = new Set(); fs.forEach((f) => symbols(f, syms));
    const S = [...syms].sort(); if (S.length > 6) throw new Error(`${S.length} symbols would need ${2 ** S.length} rows. Use at most 6 symbols.`);
    const rows = [];
    for (let i = 0; i < 2 ** S.length; i++) {
      const m = {}; S.forEach((s, j) => (m[s] = !!(i & (1 << (S.length - 1 - j)))));
      rows.push({ m, vals: fs.map((f) => pl(f, m)) });
    }
    const kbN = kb.length;
    const kbTrue = rows.filter((r) => r.vals.slice(0, kbN).every(Boolean)).length;
    return { kind: "truthtable", symbols: S, headers: sents.map((s, i) => fstr(fs[i])), rows, kbCount: kbN, models: kbTrue };
  };
  E.entails = function (text) {
    const { kb, q } = splitLines(text);
    if (!q.length) throw new Error("Add a query line starting with ? — for example:  ? SepsisRisk");
    const fs = kb.map(parseFormula), a = parseFormula(q[0]); const syms = new Set(); fs.concat([a]).forEach((f) => symbols(f, syms));
    const S = [...syms].sort(); let models = 0, counter = null, checked = 0;
    for (let i = 0; i < 2 ** S.length; i++) {
      const m = {}; S.forEach((s, j) => (m[s] = !!(i & (1 << (S.length - 1 - j))))); checked++;
      if (fs.every((f) => pl(f, m))) { models++; if (!pl(a, m) && !counter) counter = m; }
    }
    return { kind: "entails", value: !counter, kbModels: models, checked, counter, query: fstr(a), symbols: S, satisfiable: models > 0 };
  };
  // CNF conversion with the textbook's four steps
  function elimIff(f) { if (f.t === "iff") return { t: "and", a: { t: "imp", a: elimIff(f.a), b: elimIff(f.b) }, b: { t: "imp", a: elimIff(f.b), b: elimIff(f.a) } }; return map(f, elimIff); }
  function elimImp(f) { if (f.t === "imp") return { t: "or", a: { t: "not", a: elimImp(f.a) }, b: elimImp(f.b) }; return map(f, elimImp); }
  function pushNot(f) {
    if (f.t === "not") { const g = f.a;
      if (g.t === "not") return pushNot(g.a);
      if (g.t === "and") return { t: "or", a: pushNot({ t: "not", a: g.a }), b: pushNot({ t: "not", a: g.b }) };
      if (g.t === "or") return { t: "and", a: pushNot({ t: "not", a: g.a }), b: pushNot({ t: "not", a: g.b }) };
      if (g.t === "true") return { t: "false" }; if (g.t === "false") return { t: "true" };
      return f; }
    return map(f, pushNot);
  }
  function dist(f) {
    if (f.t === "and") return { t: "and", a: dist(f.a), b: dist(f.b) };
    if (f.t === "or") { const a = dist(f.a), b = dist(f.b);
      if (a.t === "and") return dist({ t: "and", a: { t: "or", a: a.a, b }, b: { t: "or", a: a.b, b } });
      if (b.t === "and") return dist({ t: "and", a: { t: "or", a, b: b.a }, b: { t: "or", a, b: b.b } });
      return { t: "or", a, b }; }
    return f;
  }
  function map(f, fn) { const g = Object.assign({}, f); if (g.a) g.a = fn(g.a); if (g.b) g.b = fn(g.b); return g; }
  function clausesOf(f) {
    const conj = []; (function c(x) { if (x.t === "and") { c(x.a); c(x.b); } else conj.push(x); })(f);
    return conj.map((d) => { const lits = []; (function o(x) { if (x.t === "or") { o(x.a); o(x.b); } else lits.push(x.t === "not" ? "¬" + x.a.p : x.p); })(d); return [...new Set(lits)].sort(); })
      .filter((cl) => !cl.some((l) => cl.includes(l.startsWith("¬") ? l.slice(1) : "¬" + l)));
  }
  E.cnf = function (text) {
    const { kb, q } = splitLines(text); const sents = kb.concat(q); if (!sents.length) throw new Error("Write a sentence to convert.");
    return { kind: "cnf", items: sents.map((s) => { const f = parseFormula(s); symbols(f); const a = elimIff(f), b = elimImp(a), c = pushNot(b), d = dist(c);
      return { src: fstr(f), steps: [["Eliminate ⇔", fstr(a)], ["Eliminate ⇒", fstr(b)], ["Move ¬ inwards", fstr(c)], ["Distribute ∨ over ∧", fstr(d)]], clauses: clausesOf(d) }; }) };
  };
  E.resolution = function (text) {
    const { kb, q } = splitLines(text); if (!q.length) throw new Error("Add a query line starting with ?");
    const f0 = kb.map(parseFormula), a = parseFormula(q[0]); f0.concat([a]).forEach((f) => symbols(f));
    const key = (c) => c.join(" ∨ ") || "□";
    let clauses = []; const seen = new Set(); const add = (c, why) => { const k = key(c); if (seen.has(k)) return false; seen.add(k); clauses.push({ c, why }); return true; };
    f0.forEach((f) => clausesOf(dist(pushNot(elimImp(elimIff(f))))).forEach((c) => add(c, "KB")));
    clausesOf(dist(pushNot(elimImp(elimIff({ t: "not", a }))))).forEach((c) => add(c, "¬query"));
    const steps = []; let found = false;
    for (let round = 0; round < 6 && !found; round++) {
      const n = clauses.length; let added = false;
      for (let i = 0; i < n && !found; i++) for (let j = i + 1; j < n && !found; j++) {
        const A = clauses[i].c, B = clauses[j].c;
        for (const l of A) { const nl = l.startsWith("¬") ? l.slice(1) : "¬" + l; if (!B.includes(nl)) continue;
          let r = [...new Set(A.filter((x) => x !== l).concat(B.filter((x) => x !== nl)))].sort();
          if (r.some((x) => r.includes(x.startsWith("¬") ? x.slice(1) : "¬" + x))) continue;
          if (add(r, `resolve (${key(A)}) with (${key(B)}) on ${l.replace("¬", "")}`)) { steps.push({ from: [key(A), key(B)], res: key(r) }); added = true; if (!r.length) found = true; }
          if (clauses.length > 400) break; }
      }
      if (!added) break;
    }
    return { kind: "resolution", value: found, initial: clauses.filter((c) => c.why === "KB" || c.why === "¬query").map((c) => key(c.c) + (c.why === "¬query" ? "   (from ¬query)" : "")), steps: found ? proofPath(steps) : steps.slice(0, 12), query: fstr(a) };
  };
  function proofPath(steps) { // keep only the steps that lead to the empty clause
    const need = new Set(["□"]), out = [];
    for (let i = steps.length - 1; i >= 0; i--) if (need.has(steps[i].res)) { out.unshift(steps[i]); steps[i].from.forEach((x) => need.add(x)); }
    return out;
  }

  /* ============================== first-order logic ============================== */
  function parseWorld(text) {
    const facts = [], qs = [], uni = []; let domain = null;
    text.split("\n").forEach((raw) => {
      const line = raw.replace(/\/\/.*$/, "").trim(); if (!line) return;
      let m;
      if ((m = /^Domain\s*:\s*(.*)$/i.exec(line))) { domain = m[1].split(/[,\s]+/).filter(Boolean); return; }
      if ((m = /^Unify\s*:?\s*(.*)$/i.exec(line))) { const parts = m[1].split("|"); if (parts.length !== 2) throw new Error("Write Unify: p | q  (two sentences separated by |)"); uni.push(parts.map((s) => parseFormula(s.trim()))); return; }
      if ((m = /^(\?|Query:|Ask:)\s*(.*)$/i.exec(line))) { qs.push(parseFormula(m[2])); return; }
      line.split(/\.\s+|\.$/).map((s) => s.trim()).filter(Boolean).forEach((s) => facts.push(parseFormula(s)));
    });
    return { facts, qs, uni, domain };
  }
  function groundTerm(t, env) { if (t.v) { if (!(t.v in env)) throw new Error(`The variable ${t.v} is not bound by a quantifier`); return env[t.v]; } if (t.c) return t.c; throw new Error(`Functions such as ${t.f}(…) can only be used in Unify. In a world model, give the object a name instead.`); }
  E.folEval = function (text) {
    const W = parseWorld(text); if (!W.qs.length) throw new Error("Add a query line starting with ?");
    const atoms = new Set(), consts = new Set(), sub = [], mem = [];
    W.facts.forEach((f) => {
      if (f.t !== "atom") throw new Error(`Facts must be single atoms such as Patient(Maria). “${fstr(f)}” is a rule — put rules in the query instead.`);
      f.args.forEach((a) => { if (!a.c) throw new Error(`Facts must be ground (no variables): ${fstr(f)}`); consts.add(a.c); });
      if (f.p === "⊂") sub.push([f.args[0].c, f.args[1].c]); else if (f.p === "∈") mem.push([f.args[0].c, f.args[1].c]); else atoms.add(f.p + "(" + f.args.map((a) => a.c).join(",") + ")");
    });
    // category closure: x ∈ A, A ⊂ B  ⇒  x ∈ B   (inheritance, Chapter 10)
    const members = new Set(mem.map(([x, c]) => x + "∈" + c)); let grew = true, inferred = [];
    while (grew) { grew = false; for (const [a, b] of sub) for (const k of [...members]) { const [x, c] = k.split("∈"); if (c === a && !members.has(x + "∈" + b)) { members.add(x + "∈" + b); inferred.push(`${x} ∈ ${b}  (because ${x} ∈ ${a} and ${a} ⊂ ${b})`); grew = true; } } }
    const subs = new Set(sub.map(([a, b]) => a + "⊂" + b)); grew = true;
    while (grew) { grew = false; for (const x of [...subs]) for (const y of [...subs]) { const [a, b] = x.split("⊂"), [c, d] = y.split("⊂"); if (b === c && !subs.has(a + "⊂" + d)) { subs.add(a + "⊂" + d); grew = true; } } }
    const D = W.domain || [...consts].filter((c) => !sub.some(([a, b]) => a === c || b === c) && !mem.some(([, c2]) => c2 === c));
    function ev(f, env) {
      switch (f.t) {
        case "atom": { const a = f.args.map((t) => groundTerm(t, env));
          if (f.p === "∈") return members.has(a[0] + "∈" + a[1]); if (f.p === "⊂") return subs.has(a[0] + "⊂" + a[1]);
          return atoms.has(f.p + "(" + a.join(",") + ")"); }
        case "eq": return groundTerm(f.a, env) === groundTerm(f.b, env);
        case "true": return true; case "false": return false;
        case "not": return !ev(f.a, env); case "and": return ev(f.a, env) && ev(f.b, env); case "or": return ev(f.a, env) || ev(f.b, env);
        case "imp": return !ev(f.a, env) || ev(f.b, env); case "iff": return ev(f.a, env) === ev(f.b, env);
        case "all": return D.every((d) => ev(f.a, Object.assign({}, env, { [f.v]: d })));
        case "ex": return D.some((d) => ev(f.a, Object.assign({}, env, { [f.v]: d })));
      }
    }
    const results = W.qs.map((q) => {
      const value = ev(q, {}); let witness = null;
      if (q.t === "all" && !value) { const d = D.find((d) => !ev(q.a, { [q.v]: d })); witness = `Counterexample: ${q.v} = ${d}`; }
      if (q.t === "ex" && value) { const d = D.find((d) => ev(q.a, { [q.v]: d })); witness = `Witness: ${q.v} = ${d}`; }
      return { q: fstr(q), value, witness };
    });
    return { kind: "fol", domain: D, results, value: results[0].value, inferred };
  };
  // unification (AIMA Figure 9.1) with occur check, trace of each decision
  E.unify = function (text) {
    const W = parseWorld(text); if (!W.uni.length) throw new Error("Write a line such as:  Unify: Knows(John, x) | Knows(y, Mother(y))");
    const res = W.uni.map(([p, q]) => {
      const trace = []; const th = unifyT(asT(p), asT(q), {}, trace);
      const sub = th && Object.keys(th).map((k) => `${k}/${tstr(substT(th[k], th))}`);
      return { p: fstr(p), q: fstr(q), ok: !!th, theta: th ? "{" + sub.join(", ") + "}" : "FAILURE", result: th ? tstr(substT(asT(p), th)) : null, trace };
    });
    return { kind: "unify", items: res, value: res[0].ok, theta: res[0].theta };
  };
  const asT = (f) => { if (f.t !== "atom") throw new Error("Unify works on single atoms, such as Knows(John, x)."); return { f: f.p, args: f.args }; };
  const walk = (t, th) => { while (t.v && th[t.v]) t = th[t.v]; return t; };
  const substT = (t, th) => { t = walk(t, th); return t.f ? { f: t.f, args: t.args.map((a) => substT(a, th)) } : t; };
  const occurs = (v, t, th) => { t = walk(t, th); return t.v === v || (!!t.f && t.args.some((a) => occurs(v, a, th))); };
  function unifyT(x, y, th, tr) {
    if (!th) return null; x = walk(x, th); y = walk(y, th);
    if (x.v && y.v && x.v === y.v) return th;
    if (x.c && y.c) { if (x.c === y.c) { tr.push(`${x.c} = ${y.c} ✓`); return th; } tr.push(`${x.c} ≠ ${y.c}: two different constants → FAIL`); return null; }
    if (x.v || y.v) { const [v, t] = x.v ? [x, y] : [y, x];
      if (occurs(v.v, t, th)) { tr.push(`occur check: ${v.v} appears inside ${tstr(substT(t, th))} → FAIL`); return null; }
      tr.push(`bind ${v.v}/${tstr(substT(t, th))}`); return Object.assign({}, th, { [v.v]: t }); }
    if (x.f && y.f) {
      if (x.f !== y.f || x.args.length !== y.args.length) { tr.push(`${x.f} vs ${y.f}: different symbols or arity → FAIL`); return null; }
      tr.push(`${x.f} = ${y.f}: unify the arguments one by one`);
      for (let i = 0; i < x.args.length; i++) { th = unifyT(x.args[i], y.args[i], th, tr); if (!th) return null; }
      return th;
    }
    tr.push(`${tstr(x)} vs ${tstr(y)}: a constant cannot match a function term → FAIL`); return null;
  }

  /* ============================== planning text (PDDL in AIMA notation) ============================== */
  function blocks(text, name) { // returns inner strings of Name( ... ) with balanced parens / brackets
    const out = []; const re = new RegExp("\\b" + name + "\\s*\\(", "g"); let m;
    const src = text.replace(/\/\/.*$/gm, "");
    while ((m = re.exec(src))) { let d = 1, i = m.index + m[0].length, st = i; for (; i < src.length && d; i++) { if (src[i] === "(" || src[i] === "[") d++; else if (src[i] === ")" || src[i] === "]") d--; }
      if (d) throw new Error(`${name}( … ) is missing a closing “)”.`); out.push(src.slice(st, i - 1)); re.lastIndex = i; }
    return out;
  }
  function splitTop(s, sep) { const out = []; let d = 0, cur = ""; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === "(" || c === "[") d++; if (c === ")" || c === "]") d--; if (d === 0 && s.startsWith(sep, i)) { out.push(cur); cur = ""; i += sep.length - 1; continue; } cur += c; } out.push(cur); return out.map((x) => x.trim()).filter((x) => x.length); }
  function litList(s, where) { // conjunction of literals; ⊤/empty = none
    s = s.trim().replace(/^\(\s*([\s\S]*)\s*\)$/, (m0, inner) => (balanced(inner) ? inner : m0)); if (!s || s === "⊤" || /^True$/.test(s)) return [];
    const f = parseFormula(s); const out = [];
    (function w(x) { if (x.t === "and") { w(x.a); w(x.b); } else if (x.t === "atom") out.push({ neg: false, p: x.p, args: x.args });
      else if (x.t === "not" && x.a.t === "atom") out.push({ neg: true, p: x.a.p, args: x.a.args });
      else if (x.t === "eq") out.push({ eq: true, neg: false, a: x.a, b: x.b }); else if (x.t === "not" && x.a.t === "eq") out.push({ eq: true, neg: true, a: x.a.a, b: x.a.b });
      else if (x.t === "true") {} else throw new Error(`${where}: only literals joined by ∧ are allowed here (found “${fstr(x)}”).`); })(f);
    return out;
  }
  function balanced(s) { let d = 0; for (const c of s) { if (c === "(") d++; if (c === ")") d--; if (d < 0) return false; } return d === 0; }
  function effList(s, where) { // literals and conditional effects:  when Cond: Lit
    return splitTop(s, "∧").flatMap((part) => {
      const m = /^when\s+([\s\S]+?)\s*:\s*([\s\S]+)$/.exec(part);
      if (m) return [{ when: litList(m[1], where), eff: litList(m[2], where) }];
      return litList(part, where);
    });
  }
  function headOf(s) { const f = parseFormula(s.trim()); if (f.t !== "atom") throw new Error("Expected an action name such as Load(c, p, a)"); return { name: f.p, params: f.args.map((a) => a.v || a.c), args: f.args }; }
  function parseActions(text) {
    return blocks(text, "Action").map((b) => {
      const parts = {}; const keys = ["PRECOND", "EFFECT", "DURATION", "USE"];
      const re = /\b(PRECOND|PRE|EFFECT|EFF|DURATION|USE)\s*:/g; let m, last = null, head = null, marks = [];
      while ((m = re.exec(b))) marks.push({ k: m[1], i: m.index, j: re.lastIndex });
      head = b.slice(0, marks.length ? marks[0].i : b.length).replace(/,\s*$/, "");
      marks.forEach((mk, idx) => { const end = idx + 1 < marks.length ? marks[idx + 1].i : b.length; parts[{ PRE: "PRECOND", EFF: "EFFECT" }[mk.k] || mk.k] = b.slice(mk.j, end).trim().replace(/,\s*$/, ""); });
      const h = headOf(head); const nm = h.name;
      const pre = litList(parts.PRECOND || "", "PRECOND of " + nm), eff = effList(parts.EFFECT || "", "EFFECT of " + nm);
      const vars = []; h.args.forEach((t) => { if (t.f) throw new Error(`The parameters of ${nm} must be variables or constants, not functions.`); if (t.v && !vars.includes(t.v)) vars.push(t.v); });
      return { name: nm, params: vars, headArgs: h.args, pre, eff, dur: parts.DURATION ? Number(parts.DURATION) : null, use: parts.USE ? parts.USE.split(/\s*∧\s*|,\s*(?![^()]*\))/).filter(Boolean) : [] };
    });
  }
  function parsePlanning(text) {
    const inits = blocks(text, "Init"), goals = blocks(text, "Goal");
    if (!inits.length) throw new Error("Write the initial state as Init( … ).");
    const oneOf = []; let initSrc = inits[0];
    initSrc = initSrc.replace(/OneOf\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (m0, inner) => { oneOf.push(splitTop(inner, ",").map((s) => litList(s, "OneOf")[0])); return "⊤"; });
    const init = litList(initSrc, "Init");
    if (init.some((l) => l.args && l.args.some((a) => !a.c))) throw new Error("Init must be ground: use constants only (upper-case), no variables.");
    const goal = goals.length ? litList(goals[0], "Goal") : null;
    return { init, goal, actions: parseActions(text), oneOf };
  }
  E.parsePlanning = parsePlanning;

  /* ============================== grounding ============================== */
  const fk = (p, args) => args.length ? p + "(" + args.join(",") + ")" : p;
  const pretty = (k) => k.replace(/,/g, ", ");
  function constantsOf(P) {
    const C = new Set(); const addT = (t) => { if (t.c) C.add(t.c); if (t.f) t.args.forEach(addT); };
    const addL = (l) => { if (l.eq) { addT(l.a); addT(l.b); } else l.args.forEach(addT); };
    P.init.forEach(addL); (P.goal || []).forEach(addL); P.oneOf.forEach((g) => g.forEach(addL));
    P.actions.forEach((a) => { a.pre.forEach(addL); a.eff.forEach((e) => (e.when ? e.when.concat(e.eff) : [e]).forEach(addL)); });
    return [...C].sort();
  }
  function bindT(t, env) { if (t.v) { if (!(t.v in env)) return null; return env[t.v]; } return t.c; }
  function groundLit(l, env) { if (l.eq) { const a = bindT(l.a, env), b = bindT(l.b, env); return { eq: true, neg: l.neg, a, b }; } const args = l.args.map((t) => bindT(t, env)); if (args.some((x) => x == null)) return null; return { neg: l.neg, k: fk(l.p, args) }; }
  function ground(P, opts = {}) {
    const C = constantsOf(P); const fluentPreds = new Set();
    P.actions.forEach((a) => a.eff.forEach((e) => (e.when ? e.eff : [e]).forEach((l) => !l.eq && fluentPreds.add(l.p))));
    const initSet = new Set(P.init.filter((l) => !l.neg).map((l) => fk(l.p, l.args.map((t) => t.c))));
    P.oneOf.forEach((g) => g.forEach((l) => initSet.add(fk(l.p, l.args.map((t) => t.c))))); // for static filtering, any option might hold
    const out = []; let considered = 0;
    for (const a of P.actions) {
      const vars = a.params.slice(); const extra = [];
      a.pre.forEach((l) => (l.eq ? [l.a, l.b] : l.args).forEach((t) => t.v && !vars.includes(t.v) && !extra.includes(t.v) && extra.push(t.v)));
      const all = opts.keepFree ? vars : vars.concat(extra);
      const env = {};
      (function rec(i) {
        if (i === all.length) {
          considered++;
          const pre = [], free = [];
          for (const l of a.pre) {
            const g = groundLit(l, env);
            if (!g) { free.push(l); continue; }
            if (g.eq) { if ((g.a === g.b) === g.neg) return; continue; }
            const pred = g.k.split("(")[0];
            if (!fluentPreds.has(pred)) { if (initSet.has(g.k) === g.neg) return; continue; } // static fact filter
            pre.push(g);
          }
          const add = [], del = [], cond = [];
          for (const e of a.eff) {
            if (e.when) { cond.push({ when: e.when, eff: e.eff, env: Object.assign({}, env) }); continue; }
            const g = groundLit(e, env); if (!g) { cond.push({ when: [], eff: [e], env: Object.assign({}, env), freeOnly: true }); continue; }
            (g.neg ? del : add).push(g.k);
          }
          const name = a.headArgs.length ? `${a.name}(${a.headArgs.map((t) => (t.v ? env[t.v] : t.c)).join(", ")})` : a.name;
          out.push({ name, schema: a.name, args: a.headArgs.map((t) => (t.v ? env[t.v] : t.c)), pre, add, del, cond, free, schemaRef: a, env: Object.assign({}, env), dur: a.dur, use: a.use });
          return;
        }
        for (const c of C) { env[all[i]] = c; rec(i + 1); } delete env[all[i]];
      })(0);
      if (out.length > 20000) throw new Error("This problem grounds to too many actions for the browser. Add type predicates such as Cargo(c) ∧ Plane(p) to the preconditions.");
    }
    return { actions: out, constants: C, considered };
  }
  E.ground = ground;

  /* ============================== states & search ============================== */
  const sk = (s) => [...s].sort().join(" ");
  const applicable = (a, s) => a.pre.every((l) => s.has(l.k) !== l.neg);
  function result(a, s) { const n = new Set(s); a.del.forEach((k) => n.delete(k)); a.add.forEach((k) => n.add(k)); return n; }
  const goalOK = (G, s) => G.every((l) => (l.eq ? (l.a === l.b) !== l.neg : s.has(l.k) !== l.neg));
  function groundGoal(P) { if (!P.goal) throw new Error("Write the goal as Goal( … )."); return P.goal.map((l) => { const g = groundLit(l, {}); if (!g) throw new Error("Classical goals must be ground. (Goals with variables are allowed in the Belief tab.)"); return g; }); }
  function initState(P) { return new Set(P.init.filter((l) => !l.neg).map((l) => fk(l.p, l.args.map((t) => t.c)))); }
  function setupClassical(text) {
    const P = parsePlanning(text); if (P.oneOf.length) throw new Error("OneOf(…) describes uncertainty. Use the Belief tab for this problem.");
    const G = ground(P); const s0 = initState(P), goal = groundGoal(P);
    G.actions.forEach((a) => { if (a.cond.length || a.free.length) throw new Error(`${a.name}: conditional effects and extra variables need the Belief tab.`); });
    return { P, A: G.actions, s0, goal, nGround: G.actions.length, nFluents: fluentsOf(G.actions, s0, goal).length };
  }
  function fluentsOf(A, s0, goal) { const f = new Set(s0); A.forEach((a) => { a.pre.forEach((l) => f.add(l.k)); a.add.forEach((k) => f.add(k)); a.del.forEach((k) => f.add(k)); }); goal.forEach((l) => l.k && f.add(l.k)); return [...f]; }
  function trace(s0, plan) { const rows = []; let s = s0; plan.forEach((a) => { const before = s; s = result(a, s); rows.push({ action: a.name, pre: a.pre.map((l) => (l.neg ? "¬" : "") + pretty(l.k)), del: a.del.map(pretty), add: a.add.map(pretty), state: sk(s).split(" ").filter(Boolean).map(pretty) }); }); return rows; }

  function search(text, algo, opts = {}) {
    const X = setupClassical(text); const { A, s0, goal } = X; const LIMIT = opts.limit || 60000; const t0 = Date.now();
    const H = algo === "bfs" ? null : heuristicFn(A, goal, opts.h || "ff");
    if (goalOK(goal, s0)) return pack(X, algo, [], 0, 0, t0);
    const start = { s: s0, g: 0, plan: [] }; const seen = new Map([[sk(s0), 0]]); let expanded = 0, generated = 1;
    let frontier = [start]; const pq = algo !== "bfs";
    const fval = (n) => algo === "gbfs" ? n.h : n.g + n.h;
    if (pq) start.h = H(s0);
    while (frontier.length) {
      let node;
      if (pq) { let bi = 0; for (let i = 1; i < frontier.length; i++) { const a = fval(frontier[i]), b = fval(frontier[bi]); if (a < b || (a === b && frontier[i].h < frontier[bi].h)) bi = i; } node = frontier[bi]; frontier[bi] = frontier[frontier.length - 1]; frontier.pop(); }
      else node = frontier.shift();
      if (pq && goalOK(goal, node.s)) return pack(X, algo, node.plan, expanded, generated, t0);
      expanded++; if (expanded > LIMIT || (expanded % 200 === 0 && Date.now() - t0 > (opts.ms || 4000))) return Object.assign(pack(X, algo, null, expanded, generated, t0), { gaveUp: true });
      for (const a of A) {
        if (!applicable(a, node.s)) continue;
        const s2 = result(a, node.s), k = sk(s2), g2 = node.g + 1;
        if (seen.has(k) && seen.get(k) <= g2) continue; seen.set(k, g2); generated++;
        const n2 = { s: s2, g: g2, plan: node.plan.concat([a]) };
        if (!pq && goalOK(goal, s2)) return pack(X, algo, n2.plan, expanded, generated, t0);
        if (pq) { n2.h = H(s2); if (n2.h === Infinity) continue; }
        frontier.push(n2);
      }
    }
    return pack(X, algo, null, expanded, generated, t0);
  }
  function pack(X, algo, plan, expanded, generated, t0) {
    return { kind: "plan", algo, found: !!plan, length: plan ? plan.length : null, plan: plan ? plan.map((a) => a.name) : null, steps: plan ? trace(X.s0, plan) : null,
      expanded, generated, ms: Date.now() - t0, nGround: X.nGround, nFluents: X.nFluents, init: sk(X.s0).split(" ").filter(Boolean).map(pretty), goal: X.goal.map(gstr) };
  }
  const gstr = (l) => l.eq ? `${l.a} ${l.neg ? "≠" : "="} ${l.b}` : (l.neg ? "¬" : "") + pretty(l.k);
  E.forward = (t, o) => search(t, "bfs", o);
  E.astar = (t, o) => search(t, "astar", o);
  E.gbfs = (t, o) => search(t, "gbfs", o);

  // backward (regression) search over ground goal descriptions
  E.backward = function (text, opts = {}) {
    const X = setupClassical(text); const { A, s0, goal } = X; const t0 = Date.now(); const LIMIT = opts.limit || 60000;
    const gkey = (g) => g.map(gstr).sort().join(" ∧ ");
    const sat0 = (g) => g.every((l) => s0.has(l.k) !== l.neg);
    const start = { g: goal.filter((l) => !l.eq), plan: [], regress: [] };
    if (sat0(start.g)) return packB(X, [], 0, t0, []);
    const seen = new Set([gkey(start.g)]); let frontier = [start], expanded = 0, relevantFirst = null;
    while (frontier.length) {
      const node = frontier.shift(); expanded++; if (expanded > LIMIT || (expanded % 200 === 0 && Date.now() - t0 > (opts.ms || 4000))) return Object.assign(packB(X, null, expanded, t0, [], relevantFirst), { gaveUp: true });
      const rel = [];
      for (const a of A) {
        const helps = node.g.some((l) => (!l.neg && a.add.includes(l.k)) || (l.neg && a.del.includes(l.k)));
        const undoes = node.g.some((l) => (!l.neg && a.del.includes(l.k)) || (l.neg && a.add.includes(l.k)));
        if (!helps || undoes) continue;
        const keep = node.g.filter((l) => !((!l.neg && a.add.includes(l.k)) || (l.neg && a.del.includes(l.k))));
        const g2 = keep.slice(); a.pre.forEach((p) => { if (!g2.some((x) => x.k === p.k && x.neg === p.neg)) g2.push(p); });
        if (g2.some((x) => g2.some((y) => x.k === y.k && x.neg !== y.neg))) continue; // inconsistent
        rel.push(a.name);
        const k = gkey(g2); if (seen.has(k)) continue; seen.add(k);
        const n2 = { g: g2, plan: [a].concat(node.plan), regress: node.regress.concat([{ action: a.name, goal: g2.map(gstr) }]) };
        if (sat0(g2)) return packB(X, n2.plan, expanded, t0, n2.regress, relevantFirst || rel);
        frontier.push(n2);
      }
      if (!relevantFirst) relevantFirst = rel;
    }
    return packB(X, null, expanded, t0, [], relevantFirst);
  };
  function packB(X, plan, expanded, t0, regress, relevant) {
    return Object.assign(pack(X, "backward", plan, expanded, 0, t0), { regress, relevant: relevant || [] });
  }

  /* ============================== heuristics ============================== */
  function relaxedLevels(A, s, goal) { // cost of each fact under h_max / h_add style propagation (unit costs)
    const pos = goal.filter((l) => !l.neg && !l.eq);
    const cmax = new Map(), cadd = new Map(); s.forEach((k) => { cmax.set(k, 0); cadd.set(k, 0); });
    let changed = true, iter = 0;
    while (changed && iter++ < 200) { changed = false;
      for (const a of A) { const pp = a.pre.filter((l) => !l.neg); if (!pp.every((l) => cmax.has(l.k))) continue;
        const m = pp.reduce((x, l) => Math.max(x, cmax.get(l.k)), 0) + 1, ad = pp.reduce((x, l) => x + cadd.get(l.k), 0) + 1;
        for (const k of a.add) { if (!cmax.has(k) || cmax.get(k) > m) { cmax.set(k, m); changed = true; } if (!cadd.has(k) || cadd.get(k) > ad) { cadd.set(k, ad); changed = true; } } } }
    return { pos, cmax, cadd };
  }
  function hFF(A, s, goal) { // relaxed plan length (ignore delete lists), FF-style extraction
    const pos = goal.filter((l) => !l.neg && !l.eq); const level = new Map(); s.forEach((k) => level.set(k, 0)); const ach = new Map();
    let L = 0; let frontier = true;
    while (!pos.every((l) => level.has(l.k)) && frontier) { frontier = false; L++; const newF = [];
      for (const a of A) { const pp = a.pre.filter((l) => !l.neg); if (!pp.every((l) => level.has(l.k) && level.get(l.k) < L)) continue;
        for (const k of a.add) if (!level.has(k)) { newF.push(k); if (!ach.has(k)) ach.set(k, a); } }
      newF.forEach((k) => { if (!level.has(k)) { level.set(k, L); frontier = true; } }); if (L > 300) break; }
    if (!pos.every((l) => level.has(l.k))) return { h: Infinity, plan: [] };
    const chosen = new Set(), agenda = pos.map((l) => l.k).filter((k) => level.get(k) > 0); const done = new Set();
    while (agenda.length) { const k = agenda.pop(); if (done.has(k) || level.get(k) === 0) continue; done.add(k); const a = ach.get(k); if (!a) continue;
      if (!chosen.has(a)) { chosen.add(a); a.pre.filter((l) => !l.neg).forEach((l) => agenda.push(l.k)); } }
    return { h: chosen.size, plan: [...chosen].map((a) => a.name) };
  }
  function hSetCover(A, s, goal) { // ignore preconditions: fewest actions whose effects cover the unmet goals
    const unmet = goal.filter((l) => !l.eq && s.has(l.k) === l.neg); if (!unmet.length) return { h: 0, cover: [] };
    const covers = A.map((a) => ({ a, m: unmet.filter((l) => (!l.neg && a.add.includes(l.k)) || (l.neg && a.del.includes(l.k))).map(gstr) })).filter((x) => x.m.length);
    const need = new Set(unmet.map(gstr)); if ([...need].some((g) => !covers.some((c) => c.m.includes(g)))) return { h: Infinity, cover: [] };
    const uniq = []; const seenSig = new Set(); covers.sort((x, y) => y.m.length - x.m.length).forEach((c) => { const sg = c.m.slice().sort().join("|"); if (!seenSig.has(sg)) { seenSig.add(sg); uniq.push(c); } });
    for (let k = 1; k <= need.size; k++) { const r = choose(uniq, k, need); if (r) return { h: k, cover: r.map((c) => `${c.a.name} → ${c.m.join(", ")}`) }; }
    return { h: need.size, cover: [] };
  }
  function choose(list, k, need, start = 0, acc = []) {
    if (acc.length === k) { const got = new Set(acc.flatMap((c) => c.m)); return [...need].every((g) => got.has(g)) ? acc.slice() : null; }
    for (let i = start; i < list.length; i++) { acc.push(list[i]); const r = choose(list, k, need, i + 1, acc); if (r) return r; acc.pop(); if (i - start > 60) break; }
    return null;
  }
  function heuristicFn(A, goal, kind) {
    return (s) => { if (kind === "goalcount") return goal.filter((l) => !l.eq && s.has(l.k) === l.neg).length;
      if (kind === "setcover") return hSetCover(A, s, goal).h;
      if (kind === "hmax" || kind === "hadd") { const r = relaxedLevels(A, s, goal); let v = 0; for (const l of r.pos) { const c = (kind === "hmax" ? r.cmax : r.cadd).get(l.k); if (c === undefined) return Infinity; v = kind === "hmax" ? Math.max(v, c) : v + c; } return v; }
      return hFF(A, s, goal).h; };
  }
  E.heuristics = function (text) {
    const X = setupClassical(text); const { A, s0, goal } = X;
    const r = relaxedLevels(A, s0, goal); const ff = hFF(A, s0, goal), sc = hSetCover(A, s0, goal);
    const perGoal = r.pos.map((l) => ({ goal: pretty(l.k), cost: r.cmax.has(l.k) ? r.cmax.get(l.k) : Infinity }));
    const hmax = perGoal.reduce((x, g) => Math.max(x, g.cost), 0), hadd = r.pos.reduce((x, l) => x + (r.cadd.get(l.k) ?? Infinity), 0);
    const opt = search(text, "bfs");
    const rows = [
      { name: "Goal count (unmet goal facts)", h: goal.filter((l) => !l.eq && s0.has(l.k) === l.neg).length, note: "Simplest relaxation: every unmet goal fact costs 1." },
      { name: "Ignore preconditions (set cover)", h: sc.h, note: sc.cover.join(" · ") || "—" },
      { name: "Ignore delete lists (h_FF, relaxed plan)", h: ff.h, note: ff.plan.join(", ") || "—" },
      { name: "Decomposition, MAX over goals (h_max)", h: hmax, note: perGoal.map((g) => `${g.goal}: ${g.cost}`).join(" · ") },
      { name: "Decomposition, SUM over goals (h_add)", h: hadd, note: "Adds each goal's relaxed cost; can double-count shared actions." },
      { name: "True cost h* (optimal plan length, by BFS)", h: opt.found ? opt.length : Infinity, note: opt.found ? opt.plan.join(", ") : "no plan" }
    ];
    rows.forEach((x) => { x.admissible = x.h <= rows[5].h; });
    return { kind: "heuristics", rows, hstar: rows[5].h, h: Object.fromEntries([["goalcount", rows[0].h], ["setcover", rows[1].h], ["ff", rows[2].h], ["hmax", rows[3].h], ["hadd", rows[4].h], ["hstar", rows[5].h]]) };
  };
  E.compare = function (text) {
    const runs = [["Forward BFS (blind)", () => search(text, "bfs", { ms: 2500 })], ["Backward BFS (regression)", () => E.backward(text, { ms: 2500 })], ["A* with h_FF (ignore deletes)", () => search(text, "astar", { h: "ff" })],
      ["A* with h_max (admissible)", () => search(text, "astar", { h: "hmax" })], ["Greedy best-first with h_FF", () => search(text, "gbfs", { h: "ff" })]];
    const rows = runs.map(([name, f]) => { const r = f(); return { name, found: r.found, length: r.length, expanded: r.expanded, ms: r.ms, gaveUp: !!r.gaveUp }; });
    const X = setupClassical(text);
    return { kind: "compare", rows, nGround: X.nGround, nFluents: X.nFluents, stateSpace: `2^${X.nFluents}`, best: Math.min(...rows.filter((r) => r.found).map((r) => r.length)) };
  };
  E.applicable = function (text, stateKeys) {
    const X = setupClassical(text); const s = stateKeys ? new Set(stateKeys) : X.s0;
    return { kind: "step", state: sk(s).split(" ").filter(Boolean), stateShow: sk(s).split(" ").filter(Boolean).map(pretty), goalMet: goalOK(X.goal, s), goal: X.goal.map(gstr),
      unmet: X.goal.filter((l) => !(l.eq ? (l.a === l.b) !== l.neg : s.has(l.k) !== l.neg)).map(gstr),
      actions: X.A.filter((a) => applicable(a, s)).map((a) => ({ name: a.name, del: a.del.map(pretty), add: a.add.map(pretty), next: sk(result(a, s)).split(" ").filter(Boolean) })) };
  };

  /* ============================== SAT planning (with a small DPLL solver) ============================== */
  E.satplan = function (text, opts = {}) {
    const X = setupClassical(text); const t0 = Date.now(); const maxK = opts.maxK || 10;
    // keep only actions reachable in the relaxed planning graph
    const reach = new Set(X.s0); let A = []; let grew = true;
    while (grew) { grew = false; for (const a of X.A) if (!A.includes(a) && a.pre.filter((l) => !l.neg).every((l) => reach.has(l.k))) { A.push(a); a.add.forEach((k) => reach.add(k)); grew = true; } }
    const F = fluentsOf(A, X.s0, X.goal); const tries = [];
    for (let k = 1; k <= maxK; k++) {
      const V = new Map(); const name = []; const v = (s) => { if (!V.has(s)) { V.set(s, V.size + 1); name.push(s); } return V.get(s); };
      const C = [];
      F.forEach((f) => C.push([X.s0.has(f) ? v(f + "⁰") : -v(f + "⁰")]));
      X.goal.forEach((l) => { if (!l.eq) C.push([l.neg ? -v(l.k + "^" + k) : v(l.k + "^" + k)]); });
      for (let t = 1; t <= k; t++) {
        const at = (f, tt) => v(f + "^" + tt).toString() && v(f + "^" + tt);
        const tt0 = (f) => v(f + (t - 1 === 0 ? "⁰" : "^" + (t - 1)));
        A.forEach((a) => { const av = v(a.name + "^" + t);
          a.pre.forEach((l) => C.push([-av, l.neg ? -tt0(l.k) : tt0(l.k)]));
          a.add.forEach((f) => C.push([-av, at(f, t)])); a.del.forEach((f) => C.push([-av, -at(f, t)])); });
        F.forEach((f) => {
          const adders = A.filter((a) => a.add.includes(f)).map((a) => v(a.name + "^" + t)), dels = A.filter((a) => a.del.includes(f)).map((a) => v(a.name + "^" + t));
          C.push([-tt0(f), at(f, t)].concat(dels)); C.push([tt0(f), -at(f, t)].concat(adders)); });
        for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) C.push([-v(A[i].name + "^" + t), -v(A[j].name + "^" + t)]);
      }
      const sol = dpll(C, V.size); const sample = [];
      if (k === 1 || sol) { const a = A[0]; if (a) { sample.push(`${a.name}¹ ⇒ ${a.pre.map((l) => (l.neg ? "¬" : "") + pretty(l.k) + "⁰").join(" ∧ ")}    (precondition)`);
        if (a.add[0]) sample.push(`${a.name}¹ ⇒ ${pretty(a.add[0])}¹    (effect)`); if (a.del[0]) sample.push(`${a.name}¹ ⇒ ¬${pretty(a.del[0])}¹    (effect)`);
        if (A[1]) sample.push(`¬${A[0].name}¹ ∨ ¬${A[1].name}¹    (one action per step)`); } }
      const row = { k, sat: !!sol, vars: V.size, clauses: C.length, sample };
      if (sol) { const plan = []; for (let t = 1; t <= k; t++) { const a = A.find((a) => sol[V.get(a.name + "^" + t)]); if (a) plan.push(a.name); } row.plan = plan; tries.push(row); break; }
      tries.push(row); if (Date.now() - t0 > 8000) break;
    }
    const last = tries[tries.length - 1];
    return { kind: "sat", tries, found: last.sat, length: last.sat ? last.plan.length : null, plan: last.sat ? last.plan : null, k: last.k, ms: Date.now() - t0 };
  };
  function dpll(clauses, n) {
    const assign = new Int8Array(n + 1); const trail = [];
    const watch = clauses; let steps = 0;
    function val(l) { const a = assign[Math.abs(l)]; return a === 0 ? 0 : (l > 0 ? a : -a); }
    function propagate() {
      let changed = true;
      while (changed) { changed = false;
        for (const c of watch) { let unassigned = 0, last = 0, sat = false;
          for (const l of c) { const x = val(l); if (x === 1) { sat = true; break; } if (x === 0) { unassigned++; last = l; } }
          if (sat) continue; if (unassigned === 0) return false;
          if (unassigned === 1) { assign[Math.abs(last)] = last > 0 ? 1 : -1; trail.push(Math.abs(last)); changed = true; } } }
      return true;
    }
    function solve() {
      if (++steps > 200000) return false;
      const mark = trail.length; if (!propagate()) { undo(mark); return false; }
      let pick = 0; for (let i = 1; i <= n; i++) if (!assign[i]) { pick = i; break; }
      if (!pick) return true;
      for (const vv of [-1, 1]) { const m2 = trail.length; assign[pick] = vv; trail.push(pick); if (solve()) return true; undo(m2); }
      undo(mark); return false;
    }
    function undo(m) { while (trail.length > m) assign[trail.pop()] = 0; }
    return solve() ? Array.from(assign).map((x) => x === 1) : null;
  }

  /* ============================== hierarchical planning (HTN, angelic reach) ============================== */
  function parseHTN(text) {
    const P = parsePlanning(text); const refs = blocks(text, "Refinement").map((b) => {
      const m = /([\s\S]*?),\s*STEPS\s*:\s*\[([\s\S]*?)\]\s*(?:,\s*PRECOND\s*:\s*([\s\S]*))?$/.exec(b.trim());
      if (!m) throw new Error("Write each refinement as Refinement(Go(Home, SFO), STEPS: [Taxi(Home, SFO)])");
      const head = parseFormula(m[1]); const steps = m[2].trim() ? splitTop(m[2], ",").map((s) => parseFormula(s)) : [];
      return { head, steps, pre: m[3] ? litList(m[3], "Refinement PRECOND") : [] };
    });
    let planM = /Plan\s*:?\s*\[([\s\S]*?)\]/.exec(text.replace(/\/\/.*$/gm, ""));
    const top = planM ? splitTop(planM[1], ",").map((s) => parseFormula(s)) : null;
    if (!top) throw new Error("Write the high-level plan to refine, e.g.  Plan: [Go(Home, SFO)]");
    return { P, refs, top };
  }
  function matchHead(head, call) { // head may contain variables; call is ground
    if (head.p !== call.p || head.args.length !== call.args.length) return null; const env = {};
    for (let i = 0; i < head.args.length; i++) { const h = head.args[i], c = call.args[i]; if (h.v) { if (env[h.v] && env[h.v] !== c.c) return null; env[h.v] = c.c; } else if (h.c !== c.c) return null; }
    return env;
  }
  const substF = (f, env) => ({ t: "atom", p: f.p, args: f.args.map((a) => (a.v && env[a.v] ? { c: env[a.v] } : a)) });
  E.htn = function (text, opts = {}) {
    const H = parseHTN(text); const G = ground(H.P); const prim = new Map(G.actions.map((a) => [a.name.replace(/\s/g, ""), a]));
    const s0 = initState(H.P), goal = groundGoal(H.P);
    const isHLA = (f) => H.refs.some((r) => r.head.p === f.p);
    const callName = (f) => fstr(f).replace(/\s/g, "");
    let queue = [{ plan: H.top, depth: 0, path: [] }], explored = 0, impls = [], firstOK = null; const LIMIT = opts.limit || 4000;
    while (queue.length && explored < LIMIT) {
      const n = queue.shift(); explored++;
      const i = n.plan.findIndex(isHLA);
      if (i < 0) { // fully primitive: simulate
        let s = s0, ok = true, why = ""; const names = [];
        for (const f of n.plan) { const a = prim.get(callName(f)); if (!a) { ok = false; why = H.P.actions.some((x) => x.name === f.p) ? `${fstr(f)}: its preconditions can never hold in this problem (a fixed fact is missing from Init)` : `${fstr(f)} is not a defined Action`; break; } if (!applicable(a, s)) { ok = false; why = `${a.name}: precondition fails`; break; } s = result(a, s); names.push(a.name); }
        const reached = ok && goalOK(goal, s);
        impls.push({ plan: n.plan.map(fstr), ok: reached, why: ok ? (reached ? "reaches the goal" : "runs, but the goal is not true at the end") : why, path: n.path, state: ok ? sk(s).split(" ").map(pretty) : null });
        if (reached && !firstOK) { firstOK = impls[impls.length - 1]; if (!opts.all) break; }
        continue;
      }
      const call = n.plan[i]; let any = false;
      H.refs.forEach((r, ri) => { const env = matchHead(r.head, call); if (!env) return;
        if (r.pre.length) { /* checked at simulation time through primitive preconditions */ }
        any = true; const steps = r.steps.map((st) => substF(st, env));
        queue.push({ plan: n.plan.slice(0, i).concat(steps, n.plan.slice(i + 1)), depth: n.depth + 1, path: n.path.concat([`${fstr(call)} → [${steps.map(fstr).join(", ")}]`]) }); });
      if (!any) impls.push({ plan: n.plan.map(fstr), ok: false, why: `No refinement matches ${fstr(call)}`, path: n.path });
    }
    return { kind: "htn", found: !!firstOK, solution: firstOK, explored, tried: impls.slice(0, 30), nImpl: impls.length, value: !!firstOK, length: firstOK ? firstOK.plan.length : null };
  };
  E.reach = function (text) { // angelic reachable set of the high-level plan from Init
    const r = E.htn(text, { all: true, limit: 4000 }); const H = parseHTN(text); const goal = groundGoal(H.P); const s0 = initState(H.P);
    const states = []; const seen = new Set();
    r.tried.concat([]).forEach((x) => { if (!x.state) return; const changed = x.state.filter((f) => !s0.has(f.replace(/, /g, ","))); const key = changed.join(" ∧ "); if (!seen.has(key)) { seen.add(key); states.push({ facts: changed, ok: x.ok, plan: x.plan }); } });
    return { kind: "reach", hla: H.top.map(fstr).join(", "), states, goal: goal.map(gstr), feasible: states.some((s) => s.ok), value: states.some((s) => s.ok), nImpl: r.nImpl };
  };

  /* ============================== belief states (sensorless planning) ============================== */
  E.belief = function (text, opts = {}) {
    const P = parsePlanning(text); if (!P.goal) throw new Error("Write the goal as Goal( … ).");
    const base = initState(P); let worlds = [base];
    P.oneOf.forEach((grp) => { const next = []; worlds.forEach((w) => grp.forEach((l) => { const n = new Set(w); grp.forEach((o) => n.delete(fk(o.p, o.args.map((t) => t.c)))); n.add(fk(l.p, l.args.map((t) => t.c))); next.push(n); })); worlds = next; });
    const G = ground(P, { keepFree: true }); const A = G.actions;
    const C = G.constants;
    function bindings(lits, s, env, cb) { // enumerate bindings of free variables that satisfy lits in s
      const vars = []; lits.forEach((l) => (l.eq ? [l.a, l.b] : l.args).forEach((t) => t.v && !(t.v in env) && !vars.includes(t.v) && vars.push(t.v)));
      const e = Object.assign({}, env);
      (function rec(i) { if (i === vars.length) { if (lits.every((l) => { const g = groundLit(l, e); return g.eq ? (g.a === g.b) !== g.neg : s.has(g.k) !== g.neg; })) cb(Object.assign({}, e)); return; }
        for (const c of C) { e[vars[i]] = c; rec(i + 1); } delete e[vars[i]]; })(0);
    }
    function applyW(a, s) { // returns new world or null if not applicable in s
      if (!a.pre.every((l) => s.has(l.k) !== l.neg)) return null;
      let env = null; if (a.free.length) { bindings(a.free, s, a.env, (e) => { if (!env) env = e; }); if (!env) return null; } else env = a.env;
      const n = new Set(s); a.del.forEach((k) => n.delete(k));
      const adds = a.add.slice(), dels = [];
      a.cond.forEach((c) => { const ok = c.when.every((l) => { const g = groundLit(l, env); return s.has(g.k) !== g.neg; }); if (!ok) return;
        c.eff.forEach((l) => { const g = groundLit(l, env); if (!g) return; (g.neg ? dels : adds).push(g.k); }); });
      dels.forEach((k) => n.delete(k)); adds.forEach((k) => n.add(k)); return n;
    }
    const goalW = (s) => { let ok = false; bindings(P.goal, s, {}, () => (ok = true)); return ok; };
    const bkey = (B) => B.map(sk).sort().join(" | ");
    const t0 = Date.now(); let frontier = [{ B: worlds, plan: [], trace: [] }]; const seen = new Set([bkey(worlds)]); let expanded = 0;
    const show = (B) => B.map((w) => sk(w).split(" ").filter(Boolean).map(pretty));
    const initShow = show(worlds);
    if (worlds.every(goalW)) return { kind: "belief", found: true, plan: [], length: 0, worlds: initShow, trace: [], expanded };
    while (frontier.length && expanded < (opts.limit || 20000)) {
      const n = frontier.shift(); expanded++;
      for (const a of A) {
        const nb = []; let ok = true; for (const w of n.B) { const r = applyW(a, w); if (!r) { ok = false; break; } nb.push(r); } if (!ok) continue;
        const uniq = []; const ks = new Set(); nb.forEach((w) => { const k = sk(w); if (!ks.has(k)) { ks.add(k); uniq.push(w); } });
        const k = bkey(uniq); if (seen.has(k)) continue; seen.add(k);
        const n2 = { B: uniq, plan: n.plan.concat([a.name]), trace: n.trace.concat([{ action: a.name, size: uniq.length, worlds: show(uniq) }]) };
        if (uniq.every(goalW)) return { kind: "belief", found: true, plan: n2.plan, length: n2.plan.length, worlds: initShow, trace: n2.trace, expanded, ms: Date.now() - t0 };
        frontier.push(n2);
      }
    }
    return { kind: "belief", found: false, plan: null, length: null, worlds: initShow, trace: [], expanded, ms: Date.now() - t0,
      why: "No single sequence of actions makes the goal true in every possible world. The agent must sense first (a contingent plan)." };
  };

  /* ============================== scheduling: critical path + resources ============================== */
  E.schedule = function (text) {
    const acts = parseActions(text); if (!acts.length) throw new Error("Write each job step as Action(Name, DURATION: 30, USE: Resource(1)).");
    acts.forEach((a) => { if (a.dur == null) throw new Error(`${a.name} needs a DURATION.`); });
    const src = text.replace(/\/\/.*$/gm, "");
    const order = []; (src.match(/[A-Za-z_][\w]*\s*(?:≺|<)\s*[A-Za-z_][\w]*(?:\s*(?:≺|<)\s*[A-Za-z_][\w]*)*/g) || []).forEach((chain) => { const ns = chain.split(/\s*(?:≺|<)\s*/); for (let i = 0; i + 1 < ns.length; i++) order.push([ns[i].trim(), ns[i + 1].trim()]); });
    const names = acts.map((a) => a.name); order.forEach(([a, b]) => [a, b].forEach((x) => { if (!names.includes(x)) throw new Error(`“${x}” in an ordering constraint is not an Action.`); }));
    const cap = {}; blocks(text, "Resources").forEach((b) => splitTop(b, ",").forEach((r) => { const m = /(\w+)\s*\(\s*(\d+)\s*\)/.exec(r); if (m) cap[m[1]] = Number(m[2]); }));
    const use = Object.fromEntries(acts.map((a) => [a.name, Object.fromEntries(a.use.map((u) => { const m = /(\w+)\s*\(\s*(\d+)\s*\)/.exec(u); return m ? [m[1], Number(m[2])] : [u.trim(), 1]; }))]));
    const dur = Object.fromEntries(acts.map((a) => [a.name, a.dur])); const preds = Object.fromEntries(names.map((n) => [n, order.filter(([, b]) => b === n).map(([a]) => a)]));
    const succs = Object.fromEntries(names.map((n) => [n, order.filter(([a]) => a === n).map(([, b]) => b)]));
    const topo = []; const tmp = new Set(), done = new Set();
    const visit = (n) => { if (done.has(n)) return; if (tmp.has(n)) throw new Error("The ordering constraints contain a cycle."); tmp.add(n); preds[n].forEach(visit); tmp.delete(n); done.add(n); topo.push(n); };
    names.forEach(visit);
    const ES = {}; topo.forEach((n) => (ES[n] = preds[n].reduce((m, p) => Math.max(m, ES[p] + dur[p]), 0)));
    const makespan = Math.max(...names.map((n) => ES[n] + dur[n]));
    const LS = {}; [...topo].reverse().forEach((n) => (LS[n] = succs[n].length ? Math.min(...succs[n].map((s) => LS[s])) - dur[n] : makespan - dur[n]));
    const cpm = names.map((n) => ({ name: n, dur: dur[n], ES: ES[n], LS: LS[n], slack: LS[n] - ES[n], start: ES[n], end: ES[n] + dur[n], critical: LS[n] === ES[n] }));
    const hasRes = Object.keys(cap).length > 0;
    names.forEach((n) => Object.entries(use[n]).forEach(([r, q]) => { if (r in cap && q > cap[r]) throw new Error(`${n} needs ${q} ${r} but only ${cap[r]} exist.`); if (!(r in cap) && hasRes) throw new Error(`${n} uses ${r}, but ${r} is not listed in Resources( … ).`); }));
    function sgs(seq) { // serial schedule generation: each action at the earliest time that respects order + capacity
      const start = {}, end = {}; const busy = [];
      for (const n of seq) { let t = preds[n].reduce((m, p) => Math.max(m, end[p]), 0);
        for (let guard = 0; guard < 1000; guard++) { const fits = Object.entries(use[n]).every(([r, q]) => { if (!(r in cap)) return true;
            const pts = [t].concat(busy.filter((b) => b.s > t && b.s < t + dur[n]).map((b) => b.s));
            return pts.every((p) => busy.filter((b) => b.s <= p && b.e > p).reduce((x, b) => x + (b.use[r] || 0), 0) + q <= cap[r]); });
          if (fits) break; t = Math.min(...busy.filter((b) => b.e > t).map((b) => b.e)); }
        start[n] = t; end[n] = t + dur[n]; busy.push({ s: t, e: t + dur[n], use: use[n] }); }
      return { start, end, makespan: Math.max(...seq.map((n) => end[n])) };
    }
    let minSlack = null, optimal = null;
    if (hasRes) {
      const seq = []; const placed = new Set();
      while (seq.length < names.length) { const ready = names.filter((n) => !placed.has(n) && preds[n].every((p) => placed.has(p))); ready.sort((a, b) => (LS[a] - ES[a]) - (LS[b] - ES[b]) || ES[a] - ES[b]); seq.push(ready[0]); placed.add(ready[0]); }
      minSlack = Object.assign(sgs(seq), { order: seq });
      let best = null, count = 0; const used = new Set(), cur = [];
      (function perm() { if (count > 50000) return; if (cur.length === names.length) { count++; const s = sgs(cur); if (!best || s.makespan < best.makespan) best = Object.assign(s, { order: cur.slice() }); return; }
        for (const n of names) if (!used.has(n) && preds[n].every((p) => used.has(p))) { used.add(n); cur.push(n); perm(); cur.pop(); used.delete(n); } })();
      optimal = best;
    }
    const rows = (sch) => names.map((n) => ({ name: n, start: sch.start[n], end: sch.end[n] }));
    return { kind: "sched", cpm, makespan, critical: cpm.filter((r) => r.critical).map((r) => r.name), resources: cap, uses: use,
      minSlack: minSlack && { makespan: minSlack.makespan, rows: rows(minSlack), order: minSlack.order },
      optimal: optimal && { makespan: optimal.makespan, rows: rows(optimal) }, value: optimal ? optimal.makespan : makespan };
  };

  if (typeof module !== "undefined" && module.exports) module.exports = E; else root.FLEngine = E;
})(typeof window !== "undefined" ? window : globalThis);
