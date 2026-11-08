> **2026-11-08 production note:** These headings retain the original silent timeline. The supplied recordings use the measured timings in `jeff-recording-cues.csv`. Watch the MP4 review copy for synchronized sound. See `../../START_HERE.md` for the current Windows workflow.

# Speaking notes: Jeff, "Candidates, Then Proof"

> **DRAFT for Jeff to rewrite in his own words.** Claude Code wrote these notes as a starting point. They match what the animation shows, but the final narration must be Jeff's own voice and wording. Do not read them word for word; change anything that doesn't sound like you. No AI voice is used anywhere.

**Lesson:** Extreme Values and Optimization (MCV4U Topic C)
**Animation:** `videos/jeff/index.html`
**Timeline:** 11:10 (670 s) silent. Recording in Presenter mode stretches each beat to fit your speech.
**Pace:** about 130 words per minute. The spoken lines total about 1,600 words, roughly 12 minutes at that pace. The requirement is at least 8 minutes, so there is room to cut if you speak slowly.

## How to record with these notes

1. Open `videos/jeff/index.html`, tick **Presenter mode** (or press **P**), then press **H** to hide the controls and **F** for full screen.
2. Start a QuickTime screen recording with your microphone on (File → New Screen Recording → Options → your mic).
3. Each `▶` cue below means **press → (or Space)**. The animation plays that beat and then waits for you.
4. If you stumble, press ← to go back one beat and say it again.

Each section heading gives the scene's start time on the silent timeline. Lines in *italics* say what is on screen.

---

## Scene 1 · Opening question (0:00)

▶ **title** *Title card.*
"Hi, I'm Jeff. Alan showed you what a derivative is. In this lesson we'll use derivatives to find the biggest and smallest values of a function, and then solve real problems from design, economics and biology."

▶ **walk** *A hiker walks the trail and stops at three places.*
"Let's start with a hiking trail. Where's the highest point? The hiker reaches a flat spot, where the slope is zero, but the trail keeps going up afterwards. So flat doesn't mean top. Next is a real peak, also with slope zero, but it isn't the highest point either. The highest point is at the very end of the trail, and the slope there isn't zero at all."

▶ **message** *Summary line.*
"So flat spots and endpoints are only candidates. To find the true maximum, we have to test them and compare them. That's the idea of this whole lesson: candidates, then proof."

## Scene 2 · Critical numbers (0:45)

▶ **setup** *f(x) = x³ − 3x, with f′ below.*
"Here's f of x equals x cubed minus 3x, with its derivative, f prime of x equals 3x squared minus 3, underneath."

▶ **slide** *A tangent slides along f; a dot moves along f′.*
"Let's slide a tangent line along the curve. The bottom graph shows its slope. Where the tangent goes flat, at x equals minus 1 and again at x equals 1, the derivative graph crosses zero. Those points light up."

▶ **define** *Definition card.*
"A critical number is a point inside the domain where f prime is zero or doesn't exist. Here, f prime equals 3 times x minus 1 times x plus 1, so the critical numbers are minus 1 and 1. That's Assessment 2, question 1."

▶ **dne** *Inset: y = −|x|.*
"Don't forget the second case. For y equals negative absolute value of x, there's a sharp peak at 0. The derivative doesn't exist there, but it's still a maximum, so 0 is still a critical number. Final question 10 tests exactly this."

## Scene 3 · Absolute extrema and the EVT (2:00)

▶ **candidates** *Four candidates marked on [−2, 2].*
"Now let's find the absolute maximum and minimum of f on the closed interval from minus 2 to 2. The candidates are the two critical numbers, minus 1 and 1, plus the two endpoints, minus 2 and 2."

▶ **evaluate** *Each candidate is evaluated.*
"Evaluate f at each one. f of minus 2 is minus 2, f of minus 1 is 2, f of 1 is minus 2, and f of 2 is 2."

▶ **leaderboard** *The table sorts itself; rings mark the winners.*
"Now just sort them. The absolute maximum is 2, and it happens twice: at the critical number minus 1 and at the endpoint 2. The absolute minimum is minus 2, at the endpoint minus 2 and the critical number 1. The endpoints tie with the turning points, so never skip them."

▶ **theorem** *The Extreme Value Theorem.*
"Why are we sure a maximum exists at all? The Extreme Value Theorem: if f is continuous on a closed, bounded interval, then f attains an absolute maximum and an absolute minimum there. To find them, compare the endpoints and all interior critical numbers, including points where the function exists but its derivative does not."

▶ **open** *Counterexample: f(x) = x on the open interval (0, 1).*
"Both conditions matter. On the open interval from 0 to 1, f of x equals x gets to 0.9, then 0.99, then 0.999, but never reaches 1. So there's no maximum."

▶ **jump** *Counterexample: a jump at x = 1.*
"And here the interval is closed, but f jumps down to 0 at x equals 1. Again the top value is never reached. That's Homework 3.4, and Assessment 2 question 4 asks you to explain both cases."

## Scene 4 · Derivative tests (3:30)

▶ **first** *Sign strip of f′ under the graph.*
"How can we tell whether a critical number is a max or a min? The first derivative test looks at the sign of f prime. It's positive, then negative, then positive. Where it changes from plus to minus, at minus 1, the graph goes up then down, so it's a local max. Where it changes from minus to plus, at 1, it's a local min."

▶ **second** *Cap and cup shapes.*
"The second derivative test uses concavity. f double prime of x is 6x. At minus 1 it's minus 6, which is negative, so the graph is concave down, like a cap, and we have a local max. At 1 it's plus 6, concave up, like a cup, so a local min. Both tests agree."

▶ **fail** *Two cases where the tests can't decide.*
"But be careful. For x cubed at 0, f prime is zero, but it's positive on both sides, so the graph just keeps going up. There's no max or min. For x to the fourth minus 4x cubed, f double prime at 0 is zero, so the second test can't tell us anything. The first test shows f prime is negative on both sides of 0, so it's neither. That's Homework 3.5."

## Scene 5 · Design: the open-top box (4:30)

▶ **rail** *The five-step checklist appears.*
"Now let's optimize. Every problem from here on follows the same five steps: domain, objective, differentiate, candidates, and justify."

▶ **sheet** *A 20 cm sheet with the corners marked.*
"First, design. We have a 20 by 20 centimetre sheet. We cut a square of side x from each corner and fold up the sides. Step 1 is the domain. x has to be more than 0, and less than 10, or there's no base left."

▶ **fold** *The sides fold up; the volume graph appears.*
"Step 2 is the objective. The height is x and the base is 20 minus 2x on each side, so the volume is x times 20 minus 2x, squared."

▶ **sweep** *x sweeps from small to large and back to 10/3.*
"Watch what happens as x changes. A tiny cut gives a flat, shallow box. A big cut gives a tall, skinny box. Both have small volume. Somewhere in between is the best box."

▶ **calculus** *Steps 3 and 4.*
"Step 3: using the product rule and factoring, V prime of x equals 20 minus 2x, times 20 minus 6x. Step 4: V prime is zero at x equals 10, which is outside the domain because there's no base, and at x equals 10 over 3."

▶ **justify** *Step 5 and the maximum marked on the graph.*
"Step 5: justify. The volume is 0 at both ends and positive in between, so x equals 10 over 3, about 3.33 centimetres, gives the maximum. The volume is 16000 over 27, about 592.59 cubic centimetres. Homework 4.1 does the same thing with a rectangular sheet."

## Scene 6 · Economics: maximum profit (6:15)

▶ **model** *The model and steps 1 and 2.*
"Second field: economics. In a simplified model, the price is 100 minus 2q dollars when we sell q items, and the cost is 200 plus 20q. q goes from 0 to 50. Profit is revenue minus cost: 80q minus 2q squared minus 200."

▶ **curves** *Revenue and cost curves, with the profit bar.*
"The blue curve is revenue and the black line is cost. Profit is the gap between them. Green means we're making money; red means we're losing it."

▶ **tangents** *The tangent to R moves; MR and MC are compared.*
"Marginal revenue is the slope of the revenue curve, and marginal cost is the slope of the cost line, 20. As the red tangent moves, look at where it's parallel to the cost line. That's where MR equals MC, at q equals 20, and the gap is biggest."

▶ **prove** *Steps 3 to 5.*
"Let's prove it. P prime of q is 80 minus 4q, which is zero at q equals 20. P double prime is minus 4, which is negative everywhere, so the curve is concave down and q equals 20 is the absolute maximum. The ends make a loss: minus 200 and minus 1200 dollars. So sell 20 items at 60 dollars each for a 600-dollar profit."

▶ **twist** *Hypothetical profit q³ − 6q² + 9q on [0, 5].*
"But is MR equals MC always enough? Here's a made-up profit function, in thousands of dollars. MR equals MC at q equals 1 and q equals 3. But q equals 3 is a local minimum! And q equals 1 is a local max with profit 4, which loses to the endpoint q equals 5, where profit is 20. MR equals MC only finds candidates. Comparing them proves the winner. That's Assessment 3, question 5."

▶ **link** *Practice line.*
"For more practice, try Homework 4.2, and Final question 8, which asks what a 10-dollar tax does to the answer."

## Scene 7 · Biology: drug level (8:15)

▶ **model** *Model with the "illustrative" label; steps 1 and 2.*
"Third field: biology. This is an illustrative model, not real medical data. After a dose, the drug level in the blood is C of t equals 10t over t squared plus 4, in milligrams per litre, where t is hours, and t is at least 0."

▶ **run** *Clock, vial and graph over 10 hours.*
"As the clock runs, the level rises quickly, peaks, and then slowly falls as the body clears the drug."

▶ **derivative** *Quotient rule, steps 3 and 4.*
"Step 3 uses the quotient rule. After simplifying, C prime of t equals 10 times 4 minus t squared, over t squared plus 4, squared. Step 4: C prime is zero at t equals 2. t equals minus 2 is outside the domain."

▶ **justify** *The domain is closed but unbounded; sign bands for C′.*
"Step 5 is the important part. The domain from zero to infinity is closed but unbounded, so the Extreme Value Theorem for closed, bounded intervals does not apply directly. Instead, C prime is positive throughout zero to two and negative throughout two to infinity. The level increases up to two and decreases everywhere after two, so t equals two is the absolute maximum over the whole domain."

▶ **interpret** *Result banner.*
"So in this model the drug level peaks at 2.5 milligrams per litre, 2 hours after the dose."

## Scene 8 · Your turn (9:45)

▶ **terms** *Two energy terms and their total.*
"Your turn. A migrating bird uses energy E of v equals 0.05 v squared plus 100 over v per kilometre, flying at v metres per second, from 2 to 25. Flying slowly costs time, which is the 100 over v term. Flying fast costs drag, which is the 0.05 v squared term."

▶ **pause** *Pause card.*
"Pause the video now and find the speed that uses the least energy. Don't forget to check the endpoints."

▶ **reveal** *Answer.*
"Check: E prime of v equals 0.1v minus 100 over v squared. Setting that to zero gives v cubed equals 1000, so v equals 10 metres per second, and E equals 15. That's less than at both ends, 50.2 and 35.25. The full solution is Homework 4.3."

## Scene 9 · Recap (10:25)

▶ **cards** *Three solved problems.*
"To recap: for the box, the best cut is 10 over 3 centimetres for about 592.59 cubic centimetres. For profit, 20 items gives 600 dollars, and P double prime proves it's a maximum. For the drug, the level peaks at 2 hours, which we proved with the sign of C prime. Every time, the derivative gave us candidates, and a test or a comparison gave us the proof."

▶ **next** *Practice links.*
"Now try Homework 3 and 4, Assessments 2 and 3, and the final test on our site. Thanks for watching!"

---

## Pronunciation help

| Word | Say it like |
| --- | --- |
| extremum / extrema | ek-STREE-mum / ek-STREE-muh |
| critical number | KRIT-ih-kul NUM-ber |
| Extreme Value Theorem | ek-STREEM VAL-yoo THEER-um |
| concave | kon-KAYV |
| inconclusive | in-kun-KLOO-siv |
| marginal revenue | MAR-jih-nul REV-uh-noo |
| quotient rule | KWOH-shunt rule |
| f″(x) | "f double prime of x" |
| 16000/27 | "sixteen thousand over twenty-seven" |
| cm³ | "cubic centimetres" |
| mg/L | "milligrams per litre" |
| [−2, 2] | "the closed interval from negative two to two" |

## Timing tips

- In Presenter mode each beat waits for you, so you never have to rush.
- If you'd rather record over a silent MP4, change the seconds in `videos/jeff/timing.js` to match your recording, then re-export (see `videos/README.md`).
- The 8-minute minimum applies to the **final** video. Check the length of your exported file, not this page.
