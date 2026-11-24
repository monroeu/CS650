# CS650 Week 11 Lab (v3) — Chapter 11: Automated Planning

This folder replaces the existing `week11` folder in the `monroeu/CS650` repository. Delete the old `week11` contents, copy this folder in, and push.

* Live URL after GitHub Pages builds: https://monroeu.github.io/CS650/week11/
* `assets/participation.json` is **unchanged** (same slug and version), so the catalog sync has nothing new to register and the lab's published status is not touched.
* Progress is stored under a new browser key (`cs650-ch11-planning-lab-v3`), so students start the v3 activities fresh. Sign-in, active time and the PDF report work as before.

## Each section now runs
Watch (v3 narrated video) → **Read** (illustrated pamphlet, printable) → **Step by step** (interactive traces, in 11.2–11.6) → Flip cards → Check → MCQs → Try it

## What is inside
| Path | Contents |
|---|---|
| `media/p1/sNN_k.webp`, `aNN.mp3` | 627 lecture frames and 126 narrated slide audio files (v3 deck) |
| `assets/lecture-data.js` | slide timings and the show/hide narration script |
| `assets/pamkit.js` | drawing helpers for the pamphlets (fact cards, scenes, trees, flows) |
| `assets/content11.js`, `content11b.js` | nine modules: pamphlet, flip cards, check, MCQs with per-option feedback |
| `assets/trace.js`, `traces11.js` | the step-by-step tracer and 17 traces (BFS, backward, SAT, Graphplan, goal count, ignore preconditions, h_FF, h_max/h_add, A*, hierarchical search, belief states, critical path) |
| `assets/exercises11.js`, `fl-engine.js`, `workspace.js` | 40 Try it exercises and the formal-language engine (unchanged) |

## Grading and the lab standard (added)

- The header shows **Grade so far**; click it for the rubric breakdown. MCQs are scored on the first answer; retries are practice.
- Change the weights for one lab with `window.LAB_RUBRIC = {...}` before `app.js` (see `LAB_STANDARD.md`, section 10).
- The grade and the per-part breakdown are included in the participation report (`grade`, `gradeRows`).
- Before publishing any lab, run `node tools/check_lab.js` from the lab folder. `LAB_STANDARD.md` is the authoring guide.
