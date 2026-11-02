# MCV4U CCT — Mathematical Animation Production

> **Instructions for Claude Code**  
> Project: MCV4U Course Culminating Task — Topic C: Derivatives and Optimization  
> Students: Jeff and Alan  
> Primary medium: HTML / JavaScript animations with students' own English voiceovers  
> Status: Production brief, **not** a statement that videos are already finished

## 0. Mission and creative authority

Act as a mathematics educator, animation director, interaction designer, and front-end engineer. Build **two genuinely educational, mathematically reliable, visually engaging animated lessons** based on the current project. Claude Code has **substantial creative freedom** over narrative structure, scene count, pacing, visual metaphors, transitions, animation systems, example selection, and styling.

**Freedom applies to creative and technical implementation; it does not override the teacher's requirements, mathematical truth, the students' participation, or honest progress reporting.** Treat the learning objectives below as coverage constraints, **not** a fixed shot list or script. Explore alternative concepts and iterate if a design underperforms.

Do not reduce this task to slides with simple transitions. The animations should *teach* by revealing how and why mathematical relationships work. Prefer clear explanations over gratuitous effects.

## 1. First inspect the real project and requirements

Before editing:

1. Identify the repository root and inspect the complete file tree.
2. Read the current `index.html` and other available source files. Locate four Topic C lesson modules, worked examples, diagrams, homework, assessments, and existing video placeholders. **Verify what is actually there; do not rely on numbers stated in old reports.**
3. Locate and read the original `CCT Guidelines` and `CCT Rubric` if present. Compare the full text to the summary in this file. The actual teacher documents take precedence. If one is missing, report that clearly and request it only if essential; continue with what can be done safely.
4. Build a concept-to-scene coverage map tied to the existing website. Note existing mathematical errors or weak explanations, but do not silently propagate them.
5. Inspect the environment and determine what can actually be rendered, automated, previewed, and exported. Keep a verified distinction between *code exists*, *browser renders*, *video exports*, and *student-narrated final video exists*.

**Starting-point context (to verify, not blindly assume):** an earlier ZIP review found four lesson modules (differentiability; velocity and acceleration; maxima/minima/extreme values; design, economics, and biological optimization), accompanying homework and assessments, and video placeholders. These counts may have changed.

## 2. Hard academic and production requirements

- **Two instructional videos minimum**, each **at least 8 minutes** in its final submitted form. Target a natural ~9–12 minutes per lesson, but do not add filler to reach time.
- The videos must use meaningful **visual explanations** and show worked mathematical reasoning, not just results.
- **Alan's lesson** covers *Differentiability and Motion*: tangent/difference quotient and differentiability; continuity vs differentiability; nondifferentiable cases and/or piecewise matching; position, velocity, acceleration; speeding up and slowing down; displacement and total distance.
- **Jeff's lesson** covers *Extreme Values and Optimization*: critical numbers; local and absolute extrema; the Extreme Value Theorem and relevant derivative tests; step-by-step constrained optimization; **at least one developed application from each of design, economics, and biological science**. These are required Topic C fields.
- The lessons should connect to the site's homework and evaluations rather than teach unrelated topics.
- Mathematical calculations, diagrams, units, conditions, and conclusions must be verified. Clearly label simplified or hypothetical models, especially in biology.
- Jeff and Alan will **record their own English narration**. They need not show their faces unless the teacher specifically requires it. AI voice is not to be passed off as their narration.
- The teacher has **not yet expressly confirmed** whether AI-assisted animation production is permitted. Make this an explicit **pending teacher-confirmation item**; do not claim approval. If there are stricter school rules, comply with them.
- Two students must genuinely contribute and be able to explain **the mathematics and how the code works**, including key animations beyond just their personal section.
- Preserve an accurate record of how Claude Code assisted; never fabricate student participation or pretend automated implementation was hand-written.

### Context from teacher's marking scheme — verify against original rubric

| Rubric criterion | Maximum |
| --- | ---: |
| Video Lesson Content | 15 |
| Website Sequencing and Content | 15 |
| Homework | 10 |
| Teaching Effectiveness | 10 |
| Organization | 10 |
| Video Delivery and Timing | 10 |
| Assessments | 20 |
| Conference / Progress and Feedback | 10 |
| **Total** | **100** |

The directly video-related criteria (content, effectiveness, delivery) total **35/100**, but the teacher awards those marks, not the code generator. Other CCT requirements include **at least four homework sets** with typed step-by-step solutions, **at least three assessments** with worked solutions, **one final assessment** covering **K, A, T, C**, and final submission of a website URL and PDF. Confirm the details in the actual Guidelines.

## 3. Artistic direction: deliberately open-ended

You choose the best structure and creative approach after inspecting the mathematics. You **may**:

- Reorder concepts when a better teaching sequence exists.
- Use motion, diagrams, simulated experiments, manipulable parameters, interactive visuals, visual analogies, labels, color, and spatial reasoning.
- Build some scenes as narrative simulations and others as precise graph-based proofs.
- Use suitable HTML/JavaScript libraries and rendering systems, including Canvas, SVG, CSS, WebGL, Three.js, GSAP, D3, or math typesetting, when they provide measurable value.
- Rework animation concepts based on real preview results. The proposed video themes are fixed in coverage but **not** in visual treatment.

Prioritize readability, smooth performance, mathematical correctness, accessible labels, high contrast, controlled pacing, and professional visual storytelling. Do not overengineer effects that the students cannot explain.

### Illustrative ideas, NOT mandatory scene specifications

**Alan:** a moving secant becomes a tangent as `h → 0`; a cusp versus a smooth curve; a particle moves along a number line while position/velocity/acceleration graphs update; a sign chart explains speeding up vs slowing down; an object reverses direction and the difference between displacement and total distance becomes visible.

**Jeff:** animate a curve and its critical points; contrast a stationary point with a proven extremum; a square sheet is cut and folded into an open box while its volume changes; profit varies with quantity and `MR = MC` is tested rather than blindly assumed sufficient; an explicitly hypothetical biological function reaches a peak within a defined domain.

Use these only if superior to your own ideas. No fixed scene count, scene durations, storyboard order, animation palette, or required library is imposed.

## 4. Technical architecture and editing policy

The **primary authoring technology is HTML, CSS, and JavaScript**. Supporting dependencies are allowed if justified. Design modular scenes, explicit mathematics functions, timeline or state controls, and a way to render/record consistently. Students must be able to find and modify important model parameters.

- Keep the existing `index.html` **unchanged during the first production pass**.
- Create new working assets in a clearly named subdirectory (for example `videos/`), but choose its precise internal architecture yourself.
- Build reusable controls where useful: play/pause, seek, restart, speed, responsive sizing, visual diagnostics, and timing marks. Include only controls that actually work.
- Make animations deterministic or reliably reproducible where possible; use a clock/timeline rather than accumulating frame-by-frame numeric drift for important mathematical values.
- Keep mathematical calculations separate from presentation when practical. Add short comments explaining *why*, not just *what*.
- Use accessible naming; document the mapping from mathematical coordinates to screen coordinates and how numeric labels are computed.
- **Do not push, merge, delete existing work, overwrite the main site, or deploy without explicit student permission.** Ordinary edits inside the isolated new animation working area are authorized for this task.

## 5. Production workflow — autonomous, iterative, evidence-driven

Proceed through the following phases, using your own creative decisions. Do not repeatedly request approval for ordinary artistic choices or small implementation details.

### Phase A — discovery and storyboard

1. Audit the existing mathematics and mapping to Topic C requirements.
2. Develop an **editable** storyboard for both lessons: learning objective, key mathematical relationship, conceptual obstacle, visual mechanism, example/check, and suggested narration beat per scene.
3. Identify especially strong opening hooks, transitions, and two or three demonstration moments where animated change yields mathematical insight.
4. Establish testable success conditions, including runtime targets, text legibility, verified calculations, actual playback, and student explainability.

### Phase B — per-scene implementation and rehearsal

For each scene:

1. State a concrete learning outcome.
2. Specify the equation, domain, units, expected reference values, and mathematical checks.
3. Implement a visual demonstration with readable mathematical notation.
4. **Run a real preview**, not just a build or a claim of success.
5. Inspect key frames, transitions, clipping, formulas, labels, mobile/desktop behavior if applicable, console issues, and actual timing.
6. Correct defects and repeat until the scene is fit for use.
7. Log what was genuinely tested, including any untested environments.

If your current environment lacks browser or video-rendering tools, explicitly identify the blocker and provide reproducible test/export steps. **Never invent screenshots, outputs, recordings, or passing tests.**

### Phase C — complete technical rehearsals

- Assemble two coherent lessons with intelligible pacing and clear conceptual links.
- Prepare narration scripts or flexible talking-point notes, pronunciation guidance for difficult mathematical vocabulary, and time markers aligned with actual scenes.
- Create an *adjustable* timeline so final scene durations can be matched to the students' real recordings.
- Where tools support it, export and inspect **silent or placeholder-audio technical preview videos**; label them `TECHNICAL PREVIEW — NOT FINAL STUDENT NARRATION`.
- Inspect actual exported clip duration, resolution, readability, transitions, frame integrity, sound synchronization references, and playback in a standard player. Do not report video duration from code estimates alone.
- A finished **student-narrated video** exists only after real narration is recorded, integrated, and the final file is validated at ≥8 minutes.

### Phase D — student participation and final integration

- Jeff and Alan each review the mathematical derivations, modify at least one meaningful animation parameter or effect, and verify the result themselves.
- Cross-review the other student's video; both must understand the whole website.
- Document how to run and demonstrate the work locally; include the most relevant source functions.
- After the students approve and supply final narration, integrate completed MP4s into the existing website **with explicit permission** and retest.
- Confirm actual school submission requirements, final site URL, and print/PDF behavior before declaring the project ready.

## 6. Mathematics verification checklist

Build both executable checks (where feasible) and a readable `math-checks.md` with worked derivations and test cases. At minimum verify:

- Difference quotient and limiting derivative; derivatives shown match the graphed functions.
- Continuity is necessary but not sufficient for differentiability; one-sided derivatives where relevant.
- Stationary points, sharp corners, cusps, and vertical tangents are characterized correctly.
- `v(t) = s'(t)` and `a(t) = v'(t)`; speeding up occurs when velocity and acceleration have the same **nonzero** sign, slowing down when signs differ.
- Displacement is `s(b)−s(a)`; total distance requires splitting at actual turning points or integrating `|v(t)|`.
- Critical numbers are *candidates*, not automatic maxima/minima; include domain and endpoint checks.
- Design optimization shows a variable, physical constraints, target function, derivative condition, and proof/check of optimum.
- Economic optimization distinguishes a stationary point satisfying `MR = MC` from a validated profit maximum.
- Biological optimization explicitly describes hypothetical equations, assumptions, units, and relevant domain; do not call synthetic values scientific measurements.
- Keep all computed numbers and spoken narration consistent with animation labels.

If an existing site example is wrong or ambiguous, stop propagating the error; explain the discrepancy and propose a mathematically correct replacement.

## 7. Explainability and authentic student contribution

Make this project **genuinely student-understandable**, not simply cosmetically student-like.

Produce a short `student-guide.md` explaining:

- Which files control each scene and how to run the project.
- The mathematical meaning of key variables and formulas.
- How graph coordinates are converted to pixels.
- What updates during an animation frame or timeline tick.
- How to pause, scrub, change a parameter, and verify the result.
- How to recreate the test of an important scene.

Produce `production-log.md` and `contribution-record.md` based only on **actual** work. Separate Claude Code actions from Jeff's and Alan's real actions. Do not backfill or invent a history. Keep a small live demo exercise for each student: change one critical parameter, predict the mathematical effect, test it, and explain the code. If the teacher asks whether AI was used, the answer must be truthful and consistent with school rules.

## 8. Rubric self-assessment and completion audit

Maintain a current `CCT_PROGRESS_REPORT.md` (and PDF only if tooling permits) containing:

### Completed
Only items with a real artifact and evidence of execution, inspection, or validation. Link to local files and test records.

### Pending
Actual unfinished work: teacher approval if required, student voice recordings, final video exports, teacher conference, classroom presentation, deployment, PDF and submission as applicable.

### Pending review
Math that needs human checking, narration timing, student edits, accessibility, teacher feedback, KATC adequacy, and any assumptions that were not verified.

### Rubric self-scoring
Use the **real rubric's eight categories and their exact maximum scores**. Give each item an evidence-based current score, a short justification, risks and what would improve it. Separate current demonstrated attainment from possible final potential; do not count unrecorded narration or classroom observation as completed. The total must add correctly to `/100`.

Also show clear validation states:

| Quality gate | Pass condition |
| --- | --- |
| Academic accuracy | Main examples and derivations independently verified |
| Scene functionality | Each scene actually launched and visually inspected |
| Teaching quality | Coherent progression and understandable animation-supported reasoning |
| Rendering | Technical preview actually exported and inspected, or clearly blocked |
| Human narration | Jeff/Alan real audio integrated; ≥8 minutes confirmed per final video |
| Student explainability | Both complete real parameter-edit/test/explanation tasks |
| Teacher compliance | Requirements matched to actual Guidelines and Rubric; outstanding permission flagged |
| Submission | Live link and complete PDF verified, with final human submission confirmed |

Mark a quality gate `PASS`, `PARTIAL`, `PENDING`, or `BLOCKED` and identify the evidence. Do not imply that `PASS` reflects a teacher-awarded score.

## 9. Deliverables

Generate, in the isolated working area:

1. Two editable HTML/JS animation projects (Alan and Jeff) with clear run instructions.
2. Flexible storyboards and aligned English speaking notes, not merely a static narration transcript.
3. Real, verified scene previews; exported technical preview videos if the environment supports export.
4. An executable/replicable math validation checklist and worked mathematical audit.
5. Student-facing technical guide and authentic production/contribution log.
6. `CCT_PROGRESS_REPORT.md` with **Completed, Pending, Pending Review, and Rubric Self-Assessment** sections.
7. A clear punch list of the remaining **human** actions before final submission.

Do not report final submission complete until the real MP4s, website, and PDF have been inspected and the human submission has occurred.

## 10. First action and autonomy boundary

**Start now** by inspecting the current repository and available teacher documents. Produce a concise coverage audit and a creative plan, then continue building and rehearsing the animations independently wherever the environment permits.

You do **not** need to ask the students to approve every scene, visual decision, library choice, or minor revision. Ask only for a genuine external dependency (for example unavailable teacher policies, inaccessible source material, or actual voice recordings). Do not claim to have done work you cannot verify.

Keep the principal educational goal at the center: **Jeff and Alan must understand, explain, and truthfully defend the mathematics and the development process.**