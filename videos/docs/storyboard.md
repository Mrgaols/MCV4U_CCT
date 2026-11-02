# Storyboard

This is an editable plan of both lessons, as built. Times are from each lesson's `timing.js` (silent timeline). The narration in Presenter mode stretches each beat to fit the speaker.

Each table row is one scene:
- **Goal:** the learning outcome;
- **Key idea:** the mathematical relationship;
- **Obstacle:** the misconception it targets;
- **What moves:** the visual mechanism;
- **Check:** the example, and where it links on the site.

## Coverage map

| Topic C requirement (Guidelines) | Where it is taught |
| --- | --- |
| Differentiability | Alan 1–5 (definition, local linearity, four failure types, piecewise) |
| Velocity and acceleration; accelerating and decelerating bodies | Alan 6–9 (s, v and a; v·a sign test; displacement vs distance) |
| Maxima, minima, extreme values | Jeff 1–4 (critical numbers, EVT, first and second derivative tests, counterexamples) |
| Optimization in **design** | Jeff 5 (open box) |
| Optimization in **economics** | Jeff 6 (profit; why MR = MC is not proof) |
| Optimization in **biological science** | Jeff 7 (drug level, developed) and Jeff 8 (bird energy, practice) |
| Applications | Jeff 5–8 |

---

## Alan: "Zoom In Until It's Straight" (11:10)

**Thread:** a derivative is what you see when you zoom in forever, and the same slope idea then describes motion.

| # | Time | Goal | Key idea | Obstacle | What moves | Check |
|---|---|---|---|---|---|---|
| 1 Hook | 0:00 | Ask what "a slope at a point" means | Smooth ⇒ locally straight | "Both curves look like a V, so both have no slope" | Two V's zoom ×1 → ×1000; only A flattens | √(x² + 0.05²) vs \|x\| |
| 2 Secant | 0:40 | Find f′(a) from the limit definition | f′(a) = lim [f(a+h) − f(a)]/h | Slope needs two points; the limit gives one | Q slides toward P from both sides; a table of 6 + h fills in; then the algebra | x² at 3 → 6 (site 1.1, HW 1.4) |
| 3 Microscope | 2:10 | Link differentiability to local linearity | Differentiable ⇔ the zoomed graph becomes its tangent | "Continuous means differentiable" | Lens on x² straightens; lens on \|x − 2\| stays a V; then the one-sided quotients | \|x − 2\| at 2: −1 vs +1 (site 1.2, HW 1.1, Final Q1) |
| 4 Gallery | 3:25 | Classify how derivatives fail | Corner, cusp, vertical tangent, jump | The converse of "differentiable ⇒ continuous" | Four panels with left and right secants shrinking to h = 0.001, then a Venn diagram | x^(2/3), x^(1/3) (site 1.3, HW 1.5, A1 Q1) |
| 5 Piecewise | 4:40 | Make a piecewise function differentiable | Match the values, then the slopes | Matching slopes alone | b slides to close the gap; the line pivots about (1, 1) until m = 2; a lens shows the corner vanish | m = 2, b = −1 (site 1.4, HW 1.2, A1 Q2, Final Q4) |
| 6 Bridge | 5:55 | Reinterpret the derivative as a rate | x → t; the slope of s is v | — | x² morphs into s(t); a tangent slides | — |
| 7 Motion | 6:15 | Get v and a from s, and read the graphs | v = s′, a = v′ | Reading position as velocity | Particle on a number line, with s, v and a graphs drawn in step | t³ − 6t² + 9t (site 2.1, HW 2.1) |
| 8 Speed | 7:45 | Decide speeding up or slowing down | Speed increases ⇔ v·a > 0 | "Positive a means speeding up" | Sign chart; speed graph with bands; speedometer; pause-and-predict at t = 2.5 | v = −2.25, a = 3 (site 2.2, A1 Q3–Q5, Quick Check 2) |
| 9 Distance | 9:15 | Tell displacement from total distance | Split at turning times | Distance = displacement | Legs stacked on lanes; odometer vs displacement arrow | 20 m vs 28 m (site 2.3, HW 2.3, Final Q5) |
| 10 Recap | 10:30 | Consolidate and point to practice | — | — | Four cards; practice pills | HW 1, HW 2, A1 |

**Strong moments**
- **Opening hook:** two curves that look identical until you zoom in.
- **Demonstration 1:** the zoom lens. x² straightens; |x − 2| never does.
- **Demonstration 2:** the pivoting line. Continuity is kept, and only one slope removes the corner.
- **Demonstration 3:** the odometer against the displacement arrow.
- **Transition:** scene 6 turns the x-axis into time, so the slope that just meant "tangent" becomes "velocity".

---

## Jeff: "Candidates, Then Proof" (11:10)

**Thread:** f′ = 0 and endpoints only *nominate* candidates; a test or a comparison *proves* the answer. The site's five-step checklist (lesson 3.3) is shown as a row of pills in every application.

| # | Time | Goal | Key idea | Obstacle | What moves | Check |
|---|---|---|---|---|---|---|
| 1 Hook | 0:00 | Motivate "candidates, then proof" | Flat ≠ top; endpoints matter | "Set f′ = 0 and you're done" | A hiker passes a shelf, a false peak, then the summit at the trail's end | New trail function (math-checks.md) |
| 2 Critical | 0:45 | Find critical numbers | f′(c) = 0 or f′(c) does not exist, c interior | Forgetting "does not exist" | A tangent slides on f while a dot moves on f′; the zeros light up; −\|x\| inset | x³ − 3x → ±1 (site 3.1, A2 Q1, Final Q10) |
| 3 EVT | 2:00 | Find absolute extrema on [a, b], and know when they must exist | Compare all candidates; EVT hypotheses | Skipping endpoints; ignoring hypotheses | Candidate markers; a table that sorts itself; two counterexample panels | ties at ±2 (site 3.1, HW 3.4, A2 Q2, A2 Q4) |
| 4 Tests | 3:30 | Classify critical numbers | First derivative test (sign change); second derivative test (concavity) | f″ = 0 means "neither" | Sign strip with arrows; cap and cup arcs; two failure cases | x³, x⁴ − 4x³ (site 3.2, HW 3.5) |
| 5 Design | 4:30 | Run the full method on a design problem | V(x) = x(S − 2x)², V′ = (S − 2x)(S − 6x) | Forgetting the domain and the ends | A sheet folds into a box in 3D; x sweeps shallow → deep → best while V(x) traces | x = 10/3, V ≈ 592.59 (site 4.1, HW 4.1) |
| 6 Economics | 6:15 | Maximize profit, and test MR = MC | P = R − C; P′ = 0 ⇔ MR = MC; P″ < 0 proves it | "MR = MC is always the max" | Profit bar between the R and C curves; the tangent to R turns parallel to C; a hypothetical twist with a local min and an endpoint winner | $600 at q = 20 (site 4.2, HW 4.2, A3 Q3/Q5, Final Q8) |
| 7 Biology | 8:15 | Optimize on an unbounded domain | Sign of C′ when the EVT does not apply | Using the EVT on [0, ∞) | Clock, vial and graph; sign bands for C′ | 2.5 mg/L at 2 h (site 4.4) |
| 8 Your turn | 9:45 | Practise a minimization | A trade-off between two terms | — | Drag and time-cost curves and their sum; pause card; reveal | v = 10 m/s, E = 15 (HW 4.3) |
| 9 Recap | 10:25 | Consolidate | — | — | Three field cards; checklist | HW 3, HW 4, A2, A3, Final |

**Strong moments**
- **Opening hook:** the hiker standing on a flat spot that isn't the top.
- **Demonstration 1:** the candidate table that sorts itself into a leaderboard.
- **Demonstration 2:** the box folding as x sweeps; the extreme boxes are visibly bad.
- **Demonstration 3:** the MR = MC twist, where one candidate is a minimum and the endpoint wins.
- **Transition:** the five-step pill row ties all three fields together.

---

## Success conditions and current status

| Condition | Status on 2026-11-02 | Evidence |
| --- | --- | --- |
| Every displayed number verified | Met | 34/34 tests; `math-checks.md` |
| Every scene launched and inspected | Met | Stills of all 19 scenes rendered and reviewed; layout fixes logged in `production-log.md` |
| Text readable at 1080p | Met | Smallest text is 28 px on a 1920 × 1080 stage (`theme.js`); checked on stills |
| No console errors | Met | Browser pane console empty for both lessons; the render tool reports no page errors |
| Controls work | Met | Play, presenter stop at a beat boundary, ←/→, [/], D and `?t=`/`?scene=` all tested |
| Silent timeline 9–12 min | Met | 670 s each, measured from the exported MP4s (see the progress report) |
| Final narrated video ≥ 8 min | **Not yet** | Needs Alan's and Jeff's recordings |
| Students can explain the code | **Not yet** | Needs the live demo exercises in `student-guide.md` |
