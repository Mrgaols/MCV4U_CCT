# CCT progress report: animated video lessons

**Updated:** 2026-11-02, by Claude Code
**Branch:** `animations` (local only, not pushed, not merged)
**Due:** Sunday 2026-11-15, 23:59 (site link + PDF), plus a class presentation

This report keeps four states apart:
1. **code exists**;
2. **it renders in a browser**;
3. **a video file has been exported**;
4. **a student-narrated final video exists**.

Only the first three are true today.

## Completed

Only items with a real file and a record of testing.

| Item | Evidence |
| --- | --- |
| Shared animation player: timeline, controls, presenter mode, diagnostics, `?t=` / `?scene=` links | `shared/`; 11 tests in `tests/engine.test.mjs`; controls tested in the browser pane (`docs/production-log.md` §3) |
| Alan's lesson, *Differentiability and Motion*: 10 scenes, 11:10 silent timeline | `alan/`; 53 stills reviewed; console clean |
| Jeff's lesson, *Extreme Values and Optimization*: 9 scenes, 11:10 silent timeline | `jeff/`; 46 stills reviewed; console clean |
| Every number on screen checked | 34/34 tests pass (`node --test 'videos/tests/*.test.mjs'`); derivations in `docs/math-checks.md` |
| Topic C coverage, including one developed example each from design, economics and biological science | Coverage map in `docs/storyboard.md` |
| Silent technical-preview MP4s exported and measured | `exports/alan-technical-preview.mp4` and `exports/jeff-technical-preview.mp4`. Each measures **670.000 s (11:10)**, 1920×1080, 30 fps, read from the file itself. Frames were decoded and inspected. They are git-ignored, so they exist on this Mac only. Details are in `docs/production-log.md`, "Export results". |
| Draft English speaking notes, with cues, time markers and a pronunciation table | `docs/speaking-notes-alan.md` (≈1,650 words), `docs/speaking-notes-jeff.md` (≈1,600 words) |
| Storyboard, student guide, production log, contribution record | `docs/` |
| One live-demo parameter per student, checked to work | `docs/student-guide.md` §7; the 30 cm box was rendered and checked |
| Original site untouched | `index.html` is identical to `main` (no diff on this branch) |

## Pending

Real work that is not done yet.

| Item | Who | Notes |
| --- | --- | --- |
| Ask the teacher whether AI-assisted animation is allowed (and whether faces must be shown) | Alan and Jeff | **Not confirmed.** Do this first; it may change everything below. |
| Get the real rubric | Alan and Jeff | The scores below use `CLAUDE.md`'s copy, which is not verified |
| Record narration in your own voices | Alan, Jeff | Use Presenter mode and QuickTime (`README.md`) |
| Final narrated MP4s, each checked to be ≥ 8:00 | Alan, Jeff | Check the length of the real file, e.g. `swiftc -O videos/tools/encode.swift -o /tmp/enc && /tmp/enc --probe your-video.mp4` |
| Upload the videos and put the links in `VIDEO_LESSONS` (`index.html` line 1570) | Students; Claude Code can do the edit once asked | The site's video stat changes from "0/2" to "2" when both links are filled |
| Publish the site with a public link | Students to decide | The repo is private and GitHub Pages is off |
| Export the final PDF of the site after the videos are added; check all 43 solutions print | Students | Chrome → Print → Save as PDF |
| Class presentation | Alan and Jeff | — |
| Teacher conference / progress check | Alan and Jeff | Required by the rubric (per `CLAUDE.md`) |
| Merge `animations` into `main` | Students to decide | Not needed for the site to work. Only merge after you review it. |

## Pending review

These need a person to check them.

- **Math.** Each student should re-derive every number in their lesson from `docs/math-checks.md` and sign off in `contribution-record.md`. The automated tests check the code against those derivations; they do not replace a human check. Three examples are new and not on the site, so look at them closely:
  - Alan's hook curve;
  - the jump function in Alan's gallery;
  - Jeff's trail.
- **Wording of the speaking notes.** They are drafts. Rewrite them so they sound like you, and check that every sentence is mathematically correct the way you say it.
- **Narration timing.** In Presenter mode the beats wait for you. If you voice over a silent export instead, adjust `timing.js`.
- **Accessibility.**
  - The colours were chosen for contrast, and text is 28 px or more on a 1920 × 1080 frame.
  - There are no captions yet. Consider adding subtitles in iMovie after recording.
  - Red/green colour-blindness was not tested. Speeding-up and slowing-down bands also carry text labels, so they don't rely on colour alone.
- **Modelling assumptions.** The drug model and the bird model are labelled illustrative or simplified, and the hypothetical profit curve is labelled hypothetical. Check that the wording is acceptable to the teacher.
- **KATC adequacy** of the site's assessments against the real rubric. Not checked, because the rubric is missing.
- **Browsers.** Only Chrome on this Mac was tested. Check Safari or whatever you will record with.

## Rubric self-assessment

> **Not a teacher score.** These categories and maximums come from `CLAUDE.md`. They have **not** been checked against the teacher's rubric, which we don't have. "Now" counts only what can be shown today. Unrecorded narration, presentations and conferences count as zero until they happen. "Possible" is what the category could reach if the pending work is done well.

| Category | Max | Now | Possible | Why "now" | Main risk / how to improve |
| --- | ---: | ---: | ---: | --- | --- |
| Video Lesson Content | 15 | 5 | 13–14 | Animated content for both lessons exists and is verified, but there is no narrated video lesson yet | Record narration that explains the reasoning, not just the answers |
| Website Sequencing and Content | 15 | 11 | 13–14 | Four modules in a logical order, with worked examples and 14 figures | Not compared with the textbook; videos not embedded yet |
| Homework | 10 | 8 | 9 | Four sets, 18 problems, typed step-by-step solutions | The rubric may expect more problems per topic; check it |
| Teaching Effectiveness | 10 | 3 | 8–9 | The animations are built to teach (predict-then-check moments, misconceptions targeted), but no one has been taught with them yet | Rehearse; test the videos on a classmate |
| Organization | 10 | 8 | 9 | The site and this folder are organized and documented | Keep `index.html` and the videos in sync at the end |
| Video Delivery and Timing | 10 | 0 | 8–9 | No narrated video exists | Clear voice, steady pace, ≥ 8:00 checked on the real file |
| Assessments | 20 | 16 | 18–19 | Three assessments and a final, all KATC-tagged with full solutions | Check the KATC split against the rubric |
| Conference / Progress and Feedback | 10 | 0 | 7–9 | No record of a teacher conference | Book it; bring this report |
| **Total** | **100** | **51** | **85–92** | | |

## Quality gates

`PASS` here means the check was carried out. It is not a teacher's judgement.

| Gate | State | Evidence or reason |
| --- | --- | --- |
| Academic accuracy | PARTIAL | 34/34 automated checks pass, and derivations are written up; a human review by the students is still to come |
| Scene functionality | PASS | All 19 scenes launched and inspected as stills; controls tested in the browser pane; no console errors |
| Teaching quality | PARTIAL | The storyboard has an objective, an obstacle and a check per scene; not yet tried on a real viewer |
| Rendering | PASS | Both silent previews were exported, measured from the file (670.000 s each) and decoded frame by frame; Chrome played Alan's. QuickTime playback was not tested. |
| Human narration | PENDING | No recordings yet |
| Student explainability | PENDING | The live demos in `student-guide.md` §7 have not been done by the students |
| Teacher compliance | PARTIAL | Matched to the Guidelines. The rubric is missing, and AI permission has not been asked |
| Submission | PENDING | No public link; the final PDF is not made; nothing submitted |

## Human punch list before 2026-11-15

1. Ask the teacher: is AI-assisted animation allowed with our own narration? Do we need to show our faces? Get the rubric.
2. Each student: re-derive your lesson's numbers (`docs/math-checks.md`) and sign off.
3. Each student: rewrite your speaking notes, then rehearse once with Presenter mode.
4. Record the narration. Check that each final file is ≥ 8:00 by measuring the file.
5. Do your live demo (`student-guide.md` §7) and fill in `contribution-record.md`.
6. Watch and review each other's video.
7. Upload both videos and put the links in `VIDEO_LESSONS` in `index.html`.
8. Publish the site, and test the public link in a private window.
9. Save the final PDF of the site; check that the solutions and video links appear.
10. Prepare the class presentation, including how the animations work (`student-guide.md`).
11. Submit the link and the PDF before Sunday 2026-11-15, 23:59.
