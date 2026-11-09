# Current project progress — 2026-11-09

This is the current status for the audio-20261109 delivery. Earlier progress and acceptance documents are archived under `docs/history/20261109-before-information-sync/`. Old runtimes and old claims of unchanged audio/video apply only to those historical versions.

## Current delivered content

| Item | Verified current result |
|---|---|
| Alan recorded video | 838.779 seconds (13:58.8), 1920×1080, 30 fps; 36 beats |
| Jeff recorded video | 773.746 seconds (12:53.7), 1920×1080, 30 fps; 38 beats |
| Alan replacement takes | 1.1–1.4 and 2.1–2.6 use the ten newly supplied files |
| Retained recordings | Alan scene 3 keeps the approved noise reduction; later Alan speech and all Jeff speech retain the supplied takes, including Jeff 7.4 |
| Pacing | Boundary silence shortened to approximately 0.34–0.55 seconds, with gentle edge fades; internal pauses and speech speed preserved |
| User audio review | User accepted the revised audio and transitions in chat on November 9 |
| Website | Native embedded players, nonzero chapter jumps, editable interactive animations and four guided lessons |
| Homework | Four sets, 18 questions with typed worked solutions |
| Assessments | Three assessments with 14 questions, plus an 11-question final test; all include K/A/T/C |
| Final test | 50 marks: K10 / A15 / T15 / C10 |
| Solutions and PDF | 43 typed solution blocks; 32-page current website PDF |

## Verification and evidence

- Both complete MP4s decode successfully; both exceed eight minutes. Current measurements: `verification/alan-narrated-media.json` and `verification/jeff-narrated-media.json`.
- The 74 checked speech windows retain alignment with zero measured lag and waveform correlation above 0.99. Decoded sample peaks are below 0 dBFS. See `verification/audio-edit-quality-20261109.json`.
- Browser playback, nonzero chapter seeking, quiz feedback, static HTML players with scripting disabled, and 390/1440-pixel layouts passed. See `verification/site/result.json`.
- All 34 mathematics/timeline tests passed. All 43 solution first steps were checked in the 32-page PDF. This does not claim independent verification of every spoken word or every video frame.
- Updated per-beat timings are in `alan/narration-timing.js`, `jeff/narration-timing.js`, `verification/*-narration-cues.json` and `docs/*-recording-cues.csv`.

## GitHub and acceptance

The current delivery branch is `codex/cct-audio-refresh-20261109`, with [review request #4](https://github.com/Mrgaols/MCV4U_CCT/pull/4). This revision does not directly modify main or activate website hosting. A GitHub repository link is not a published course website.

The user has accepted the current audio treatment. This is separate from a complete spoken-mathematics audit, teacher approval, a numerical grade, or final Rubric acceptance. Genuine learner responses, teacher-conference evidence, contribution/explainability records, classroom presentation, independent hosted access and actual submission remain unverified. See `../FINAL_ACCEPTANCE.md` and `../rubric-check.html`.

Machine-readable current status is in `../PROJECT_STATUS.json`. The original `CLAUDE.md` is a production brief; historical logs and technical-preview receipts are not current acceptance records.
