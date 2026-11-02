# Production log

This is a record of what was actually done and tested. Every entry here was done by **Claude Code** (an AI coding assistant) during one working session on **2026-11-02**, at the request of the repository owner. There are no student actions in this log yet. When Alan or Jeff work on the project, add your own entries in `contribution-record.md`.

## 1. Discovery

- **Files read in the repository:**
  - `CLAUDE.md`, the production brief committed by Jeffrey DU and merged in PR #1;
  - `CCT Guidlines July 2026.pdf`, 3 pages, with the text extracted;
  - `index.html`.
- **Rubric:** not found. It is not in the repository, and a Spotlight search of this Mac found no MCV4U rubric. The rubric categories used in the progress report come from `CLAUDE.md` and are **not verified** against the teacher's document.
- **Site content confirmed by reading `index.html`:**
  - 4 modules and 14 figures;
  - 4 homework sets with 5, 4, 5 and 4 problems;
  - Assessments 1–3 (18, 14 and 20 marks) and a 50-mark final, all tagged K/A/T/C;
  - two empty video slots (`VIDEO_LESSONS`).
- **Tools available:** Node 24.20, Chrome 156, and Swift 6.4 with AVFoundation. ffmpeg is not installed. Nothing was installed for this work.

## 2. Plan

- A written plan was presented and approved by the user before any code was written. It is summarized in `storyboard.md`.
- Work happens on a new local branch `animations` cut from `main` (4f00a6a). All new files are under `videos/`. `index.html` is untouched.

## 3. Build and test, in order

| Step | What was done | How it was checked | Result |
| --- | --- | --- | --- |
| Player tests | Wrote `tests/engine.test.mjs` first and ran it before any player code existed | `node --test` | Failed as expected (module missing) |
| Player | Wrote `shared/timeline.js`, `plot.js`, `theme.js`, `draw.js`, `engine.js`, `player.css` | `node --test` | 11/11 pass |
| Alan math tests | Wrote `tests/math-alan.test.mjs` before `alan/math.js` | `node --test` | Failed as expected, then 25/25 pass |
| Alan scenes | Wrote 10 scenes and `timing.js` (670 s) | 53 still frames (including re-renders after fixes) rendered at exact times by headless Chrome and reviewed | Layout problems found; fixed below |
| Alan controls | Opened in the browser pane | Presenter mode stopped at exactly 88.00 s (a beat boundary); → resumed; Space paused; P toggled; → jumped 89 → 100 s; `]` → 130 s and `[` → 40 s (via a dispatched key event); D showed diagnostics; console empty | Pass |
| Commit | 15af611 on `animations` | — | — |
| Jeff math tests | Wrote `tests/math-jeff.test.mjs` before `jeff/math.js` | `node --test` | Failed as expected, then 34/34 pass |
| Jeff scenes | Wrote 9 scenes and `timing.js` (670 s) | 46 still frames reviewed (including re-renders); `?scene=box&autoplay=1&speed=2` tested in the browser pane; console empty | Layout problems found; fixed below |
| Commit | 1b5cc43 on `animations` | — | — |
| Parameter demo | Made the box scene's labels compute from `SHEET` | Rendered a copy with `SHEET = 30`: it showed x = 5.00 cm and V = 2000 cm³, with the graph rescaled | Pass |
| Encoder | Wrote `tools/encode.swift` and `tools/render.mjs --video` | 10-second test export measured back from the file: 10.000 s, 1920×1080, 30 fps, 300 frames | Pass |

### Layout problems found in previews, and what was changed

**Alan**
- **Hook:** curve A still looked bent at ×400 zoom, so the zoom now goes to ×1000.
- **Secant scene:**
  - the Q label sat on the curve and collided with P at small h;
  - the rise/run labels overlapped the P label;
  - the table's side labels were misplaced, so they are now brackets;
  - the tangent label sat on the x-axis.
- **Microscope:**
  - the caption touched the lens, so the lens moved down;
  - the dashed tangent was hidden under the curve, so it is now drawn on top;
  - two labels overlapped;
  - nested `^{}` inside `_{}` broke the text parser. The parser now handles nesting, and the limits are written in words.
- **Gallery:** verdict text ran past the card edges, so it was shortened. The background panels are now dimmed more under the overlay.
- **Piecewise:** the line crossed its own label at large m.
- **Motion:**
  - the velocity arrow at v = 24 m/s ran off the frame, so arrow lengths are now capped;
  - graph names overlapped the y-axis numbers;
  - the "turns at" pills overlapped the title;
  - a slope note overlapped the formulas, so it moved into the graph cards.
- **Speed:** the "speed |v|" label overlapped the axis; the rule card text was cramped.
- **Distance:** lane labels were ambiguous, so the lanes were spread apart.

**Jeff**
- **Hook:** the summit label sat on the card border.
- **Critical numbers:** in the f′ graph a tick label and the formula overlapped the curve.
- **Absolute extrema:** value labels piled up on the axis numbers and the function label collided. Labels are now stacked by each dot, winners are marked with rings, and the function name moved to the table header.
- **Box:** the "20 cm" label sat on the sheet.
- **Profit:**
  - the proof steps printed on top of the model text;
  - the revenue, cost and profit labels collided;
  - the faded checklist showed through the twist heading;
  - the twist table said "x" instead of "q";
  - a line ran off the right edge;
  - the practice line sat under the watermark.
- **Drug:** the final card covered the whole scene, so it became a result banner under the graph.
- **Bird:** the total and drag labels collided.

## 4. Export

See the "Export results" section below. It is filled in from the actual export run.

## 5. Sharing

- The user asked for the `animations` branch to be pushed to GitHub for review, and it was pushed to the private repository. Pull request #2 was opened.
- The user then asked for everything to go into `main`. PR #2 was merged on 2026-11-02 (merge commit cf05c5d), and the `animations` branch was deleted.
- `index.html` was not changed by the merge, and the site is not deployed (GitHub Pages is off).

## 6. Not tested

- Safari, Firefox, Windows, and phones. Only Chrome on this Mac was used.
- Full-screen mode (F) and the H key. They are simple browser calls, but they were not exercised.
- A real QuickTime screen recording with a microphone.
- Any student narration. None exists yet.
- Whether the teacher accepts AI-assisted animation. Not asked yet.

## Export results

Both lessons were exported on 2026-11-02 with `tools/render.mjs --video` at 30 fps. Each 20,100-frame export took 401 s on this Mac. The figures below were **measured from the finished files** with AVFoundation (`encode --probe`), not computed from the code.

| File | Duration | Size | Frame rate | Frames | File size | Page errors during render |
| --- | --- | --- | --- | --- | --- | --- |
| `exports/alan-technical-preview.mp4` | 670.000 s (11:10) | 1920×1080 | 30.00 fps | 20,100 | 94.0 MB | none (exit 0) |
| `exports/jeff-technical-preview.mp4` | 670.000 s (11:10) | 1920×1080 | 30.00 fps | 20,100 | 86.6 MB | none (exit 0) |

Further checks on the files:
- **Decoding.** Frames were decoded back out of each MP4 and inspected:
  - Alan at 0.5, 130.3 (a cross-fade), 200, 440 and 669.9 s;
  - Jeff at 20, 168, 372, 449, 583 and 669.9 s.
  All matched the scenes, with the watermark present.
- **Playback.** Alan's MP4 played in Chrome's built-in video player: duration 670 s, 1920×1080, and 2.5 s of playback advanced 2.5 s.
  - Seeking in that player was not possible from the simple Python server, which does not support range requests.
  - Playback in QuickTime Player was **not** tested.
- **Silent files only.** These are technical previews, with no narration and no audio track. They do not count as the required 8-minute video lessons.
- **Index position.** After these exports the encoder was changed to put the MP4 index at the start of the file, for faster web playback. A 2-second test export confirmed the new layout (`ftyp, moov, mdat`). The two exports above were made just before that change. Their content is the same; only the index position differs.
