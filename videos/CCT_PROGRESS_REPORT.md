# Audio update — 2026-11-09

Alan recordings 1.1–2.6 are replaced by the ten newly supplied takes. Scene 3 retains the previously approved noise reduction; later Alan scenes and all Jeff speech retain their supplied recordings. Both lessons have shorter leading/trailing clip silence and smooth edge fades. Internal pauses, speech speed and speaker identity are preserved. Video beat timing and chapter links are updated. Earlier versions and all raw takes remain preserved.

Current durations: Alan 13:58.8; Jeff 12:53.7. Historical durations, audio-identity and denoising statements below describe earlier versions, not the current export. The human-evidence Rubric limits remain unchanged.

---

# Presentation update v4

Removed the bottom NARRATED REVIEW COPY banner from both narrated videos at the user’s request. The strip was confined to the blank margin below the 1000 px content boundary, preserving the vertical title gradient and the bottom progress line. Audio streams are copied without re-encoding. The previous audio and mathematical/Rubric review states below retain their scope; removing a visual label does not change the acceptance record.

# Audio revision v3

Alan scenes 1–3 (13 beats, through 332.633333 s) have been denoised. See docs/ALAN_DENOISE_V3.md for measured scope, A/B samples and limits. All video frames, cue boundaries and Jeff media remain unchanged. Existing mathematical and Rubric review items below retain their status.

# MCV4U CCT — current production and Rubric acceptance v2

Revision update: the supplied 7.4new.m4a is integrated. Its duration fits the existing 26.1-second beat, so the visual timeline and speech speed remain unchanged. The previous production directory and ZIP are preserved. Offline transcription still reports “not a closed interval”; retain the wording review until the actual sound is checked. The user states no teacher feedback is currently provided.

Updated 2026-11-08 (Asia/Shanghai). This report supersedes the inherited November 2 status for this isolated production copy. The teacher awards the grade. This review has not published, pushed, merged, modified GitHub main or submitted the project.

## Overall decision

**Local technical production is complete for review. Final Rubric acceptance is PARTIAL.** Both supplied narration sets are complete and have been integrated. Spoken mathematical accuracy and delivery still require listening and student sign-off; the offline recognizer flags Jeff 7.4 for possible retention of the old unbounded-domain wording. Genuine student assessment samples, teacher-conference evidence and final submission verification remain outstanding.

## Completed — current evidence

| Item | Verified result | Evidence |
|---|---|---|
| Supplied handoff integrity | 53/53 manifest entries match; original extracted files unchanged | Original FILE_MANIFEST.json rechecked during packaging |
| Selected project | 01_Current_Project; matches the previously inspected upstream baseline in content, plus the original Rubric | verification/source-receipt.json; no fresh remote HEAD claim |
| Teacher requirements | Original Guidelines and both original Rubric pages read; Rubric rendered and visually inspected | Root teacher PDFs |
| Mathematics tests | 34 passed, 0 failed on the production copy | verification/test-results.txt |
| Baseline animation checks | Alan 10 scenes / 108 sampled time points; Jeff 9 / 114; controls and mobile page fit pass, no script errors or sampled off-frame text | verification/alan/result.json; verification/jeff/result.json |
| Recording-adjusted animation checks | All 19 scenes / 222 sampled beat times checked again against the active recorded timelines | verification/alan-narrated/result.json; verification/jeff-narrated/result.json |
| Genuine supplied recording files | Alan 36/36 unique clips; Jeff 38/38; all selected raw copies match source hashes | verification/audio-inventory.json; audio/ |
| Duplicate resolution | Two Jeff 1.1 containers have different bytes but identical decoded sound; selected the already used take and preserved the other container | verification/duplicate-audio-checks.json; audio/duplicates/ |
| Alan narrated review video | **15:30**, measured 929.800000 s; 1920×1080, 30 fps, H.264 + AAC; full decode and browser playback pass | exports/alan-narrated-review.mp4; verification/alan-narrated-media.json |
| Jeff narrated review video | **14:00**, measured 839.600000 s; 1920×1080, 30 fps, H.264 + AAC; full decode and browser playback pass; no missing slots | exports/jeff-narrated-review.mp4; verification/jeff-narrated-media.json |
| Silent technical videos | Two measured 670 s, 1080p, 30 fps baseline previews | exports/*-technical-preview.mp4 |
| Voice timing and levels | Each recording maps to one beat, original speech rate retained, short beat separation; two-pass loudness mastering around −16 LUFS, measured peaks below 0 dBFS | docs/*-recording-cues.csv; verification/*-audio-mastering.json and *-audio-loudness.txt |
| Local website integration | Two real MP4s load metadata and play in Chrome; navigation has no missing targets or duplicate IDs; correct/incorrect quiz feedback verified; 1440 px and 390 px page fit | verification/site/result.json and screenshots |
| PDF review | **30 pages**, all 43 typed Solution blocks, Final Q10 correction and final Q11 present; no outdated missing-recording label | ../MCV4U-CCT-website-review.pdf |

The initial eight missing Jeff recordings were supplied during this session; that finding is resolved. Earlier incomplete exports are retained outside the deliverable folder and are not the website's current videos.

## Changes made

- Corrected Jeff's description of [0,∞): closed but unbounded. The standard closed, bounded-interval EVT does not apply directly. Preserved the global increasing/decreasing argument for the drug maximum.
- Made the EVT boundedness condition explicit and included undefined-derivative critical candidates in Jeff's recap. Updated corresponding written notes.
- Applied Final Q10's correction: derivative sign changes give a sufficient test under its hypotheses, not a universal necessary condition. Included the interior/endpoint distinction and a non-strict extremum counterexample.
- Preserved original timing.js files; added separate measured narration-timing.js files. Recorded sound has not been sped up to fit the old 11:10 timeline. Individual word-to-reveal alignment still needs human review.
- Fixed player keyboard handling for focused controls and invalid playback speeds. Adapted the exporter for Windows and added reproducible recording preparation and media validation tools.
- Integrated the recorded review copies and interactive animation links in the local website. Graph readouts interpolate at the pointer's x and mark sampled values approximate.
- Improved print spacing, kept teaching cards together and added page numbers. Preserved existing lessons, diagrams, homework and assessments.

## Pending — requirements that cannot be inferred from artifacts

1. Listen to both complete recorded review copies. Check pronunciation, mathematical meaning, volume and pointing. The offline base-model recognizer produces substantial errors; its transcripts are not approved captions or a verified account of what was said.
2. In particular, re-listen to Jeff **7.4**. If he says the domain is not closed because it continues forever, record the corrected explanation in docs/RECORDING_REVIEW.md and rebuild that beat/video. The visual correction does not establish that the spoken statement is correct.
3. Both students complete actual mathematical cross-review and parameter-change/explanation exercises; fill their own contribution records. Supplied audio files do not establish equal contribution to every website feature.
4. Add genuine student assessment response samples and associated feedback. A model answer or generated example cannot replace the Rubric's student-sample evidence.
5. Record the actual teacher conference, feedback and any resulting changes. The template is preparation only. The project's unresolved question about the permitted use of assisted animation remains for the teacher to answer; the PDFs themselves do not establish an AI-specific prohibition.
6. After content/voice review, approve a publication destination, verify the externally accessible URL and videos, regenerate the final website PDF, present the project and submit. Local playback does not verify public availability or submission.

## Original Rubric acceptance — maxima verified, current grade not assigned

| Original criterion | Maximum | Acceptance state | Evidence / remaining requirement |
|---|---:|---|---|
| Video Lesson Content | 15 | PARTIAL | Main model calculations and visual corrections verified; spoken mathematical content needs complete listening and Jeff 7.4 resolution |
| Web page Sequencing and Content | 15 | PARTIAL | Four lessons and linked recorded/interactive lessons; local navigation passes; final reviewed teaching version and external delivery pending |
| Homework | 10 | STRUCTURE PASS; pedagogical attainment pending | Four sets, 18 typed solutions, including extension tasks; no learner-preparation outcome demonstrated |
| Effectiveness | 10 | PARTIAL | Meaningful animated demonstrations and prediction prompts exist; complete learner understanding has not been observed |
| Organization | 10 | LOCAL TECHNICAL PASS | Structured topics, working local links, source guides and efficient section navigation; this is not a teacher-awarded Level 4 |
| Delivery and Timing | 10 | PARTIAL | Both real recorded files exceed eight minutes and have measured audio; diction, use of notes and engaging delivery require observation |
| Assessments (2) | 20 | PARTIAL | Three assessments plus final, all with KATC and 43 total worked solutions across practice/tests; genuine student samples and effectiveness evidence absent |
| Conference — anecdotal evidence and feedback | 10 | PENDING | No actual teacher-conference record supplied; a preparation guide is provided |
| **Total maximum** | **100** | **NOT FINALLY ACCEPTED / NOT SCORED** | No numerical grade, predicted grade or claim of teacher approval |

The Rubric row reads Assessments (2), while the Guidelines require at least three assessments plus a final; the project provides three plus the final, satisfying the larger count. The Rubric's Level 4 assessment descriptor explicitly includes student samples. Typed model solutions alone do not meet that additional evidence requirement.

## Current content inventory

- Four homework sets: 5 + 4 + 5 + 4 = **18** questions, each with a typed worked solution.
- Three assessments: **5 + 4 + 5 = 14** questions. Their category totals are K3/A8/T4/C3, K2/A5/T4/C3 and K3/A10/T4/C3.
- Final: **11 questions / 50 marks**, K10/A15/T15/C10, with typed solutions.
- **43 solution blocks**, 14 instructional figures and three extra instant feedback checks. Counts and tags do not independently establish teaching effectiveness.

## Verification limits

- Browser checks are current Windows Chrome samples; they do not establish every-frame visual inspection or other-browser behavior.
- Exported MP4s were decoded in full and sampled frames inspected. Content review is not a claim that a person watched and listened to every second.
- The original recordings are preserved in audio/. Mastering changes level, channel layout and encoding, without voice synthesis or speech-speed changes. Small terminal AAC padding is measured in media receipts; it is not cumulative beat drift.
- The separate original ChatGPT conversation body remains unavailable through the current Codex interface; this handoff is source material, not a substitute verbatim chat transcript.
- Historical Mac exports, old estimates such as 51/100, prior classroom activity and earlier Git observations retain their historical scope.
- Guidelines give Sunday November 15 at 11:59 pm for the website URL and PDF. Confirm any later teacher notice and the teacher's submission timezone.
