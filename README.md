# MCV4U CCT — Derivatives & Optimization

Topic C website by Alan and Jeff. Open **index.html** for the integrated course: four lessons, two recorded video lessons, four homework sets, three assessments and a final unit test, with 43 typed step-by-step solutions.

**Current status:** [PROJECT_STATUS.json](PROJECT_STATUS.json) and [current progress report](videos/CCT_PROGRESS_REPORT.md). The user accepted the November 9 audio revision. Earlier progress/acceptance documents are archived rather than used as current status.

## Watch and study

- **Alan:** [Differentiability and Motion](videos/exports/alan-narrated-review.mp4), 13:58.8.
- **Jeff:** [Extreme Values and Optimization](videos/exports/jeff-narrated-review.mp4), 12:53.7.
- [Complete website PDF](MCV4U-CCT-website.pdf), 32 pages.
- [Requirements and Rubric checklist](rubric-check.html).

Both MP4s are checked into this branch and embedded directly in the HTML. The players do not require JavaScript to appear. Chapter links, separate MP4 links, interactive animations and linked practice are included. The review suffix in filenames is retained to preserve links; there is no review banner in either video. Alan scenes 1–2 use the ten newly supplied 2026-11-09 recordings; scene 3 retains the approved noise reduction. Jeff retains the supplied updated 7.4 recording. Both lessons have shorter clip-boundary silence and gentle edge fades; internal pauses and speech speed remain intact.

## Run locally

Download/clone the complete branch, preserving the directory structure. Open index.html in Chrome or Edge, or run a static HTTP server at the repository root. Use a server with HTTP byte-range support for reliable video seeking. A local server address only works on that computer; a GitHub repository URL itself is not a deployed website.

## Editable source and verification

- `videos/alan/`, `videos/jeff/`: models, scenes and original/recording-adjusted timing.
- `videos/shared/`: renderer, timeline and controls.
- `videos/docs/`: scripts, mathematical derivations, recording cue maps and student guides.
- `videos/tests/`: 34 mathematical and timeline tests. Run `node --test videos/tests/*.test.mjs`.
- `videos/tools/verify-site.mjs`: browser verification and PDF export. Run with `--no-pdf` to preserve the PDF. Set `CCT_SITE_URL` to test an HTTP host; otherwise it opens the local file.
- `videos/verification/requirements-audit.json`: question counts and K/A/T/C mark totals.
- `GITHUB_DELIVERY_MANIFEST.json`: SHA-256 inventory of the delivery files, excluding this manifest and Git metadata.

Raw voice recordings, historical video exports and intermediate production files remain preserved locally. They are not needed to play the two included MP4s. Reproduction from raw recordings requires the students' retained local recording folder.

## Acceptance limits

Local playback, chapter seeking, static HTML fallback, 390/1440-pixel layouts and the 32-page PDF were checked. All 43 solution first steps are present in the PDF; 34 tests passed. These checks do not constitute teacher approval or a grade. Complete human review of spoken mathematical accuracy, genuine student response evidence, teacher-conference feedback and independent hosted-site access remain pending. See `rubric-check.html` and `FINAL_ACCEPTANCE.md`.

The current delivery is on `codex/cct-audio-refresh-20261109`, tracked by [review request #4](https://github.com/Mrgaols/MCV4U_CCT/pull/4). It does not publish GitHub Pages or merge into main. The original CLAUDE.md is a production brief; PROJECT_STATUS.json describes the current state.
