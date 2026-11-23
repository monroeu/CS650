# CS650 Week 11 Lab — Chapter 11: Automated Planning

Copy this `week11` folder into the root of the `monroeu/CS650` repository (next to `week07`, `week08`, `shared/`) and push.

* Live URL after GitHub Pages builds: https://monroeu.github.io/CS650/week11/
* Sign-in, roster check, active-time tracking and the PDF report use the shared Monroe participation scripts in `../shared/` (same as Week 8).
* `assets/participation.json` registers the lab (slug `chapter-11-automated-planning`, version 1). The **Sync participation catalog** GitHub Action sends it to Supabase on push. Then publish the Week 11 lab for your section(s) in the instructor dashboard, as you did for Week 8.

## What is inside
| Path | Contents |
|---|---|
| `index.html` | the lab page (Watch → Learn → Flip cards → Check → MCQs → Try it) |
| `media/p1/sNN_k.webp`, `aNN.mp3` | 474 lecture frames and 93 narrated slide audio files |
| `assets/lecture-data.js` | slide timings, click times and the narration script (shown/hidden by the student) |
| `assets/content11.js` | nine modules: key concepts, flip cards, a knowledge check and 5 MCQs each |
| `assets/exercises11.js` | 40 Try it exercises with automatic checks |
| `assets/fl-engine.js` | formal-language engine: propositional logic, first-order logic, unification, categories, PDDL planning (forward, backward, A*, SAT), heuristics, hierarchical planning, belief states, scheduling |
| `assets/workspace.js` | the Try it interface: symbol crumbs, notation reference, run buttons, result views |
