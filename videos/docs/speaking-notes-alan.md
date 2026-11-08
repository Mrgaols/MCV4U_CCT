> **2026-11-08 production note:** These headings retain the original silent timeline. The supplied recordings use the measured timings in `alan-recording-cues.csv`. Watch the MP4 review copy for synchronized sound. See `../../START_HERE.md` for the current Windows workflow.

# Speaking notes: Alan, "Zoom In Until It's Straight"

> **DRAFT for Alan to rewrite in his own words.** Claude Code wrote these notes as a starting point. They match what the animation shows, but the final narration must be Alan's own voice and wording. Do not read them word for word; change anything that doesn't sound like you. No AI voice is used anywhere.

**Lesson:** Differentiability and Motion (MCV4U Topic C)
**Animation:** `videos/alan/index.html`
**Timeline:** 11:10 (670 s) silent. Recording in Presenter mode stretches each beat to fit your speech.
**Pace:** about 130 words per minute. The spoken lines total about 1,650 words, roughly 12–13 minutes at that pace. The requirement is at least 8 minutes, so there is room to cut if you speak slowly.

## How to record with these notes

1. Open `videos/alan/index.html`, tick **Presenter mode** (or press **P**), then press **H** to hide the controls and **F** for full screen.
2. Start a QuickTime screen recording with your microphone on (File → New Screen Recording → Options → your mic).
3. Each `▶` cue below means **press → (or Space)**. The animation plays that beat and then waits for you. Talk while it moves, finish your sentence, then press → again.
4. If you stumble, press ← to go back one beat and say it again. You can cut the mistake later in iMovie.

Each section heading gives the scene's start time on the silent timeline. Lines in *italics* say what is on screen, so you know what you are pointing at.

---

## Scene 1 · Opening question (0:00)

▶ **title** *Title card.*
"Hi, I'm Alan. In this lesson we're going to answer one question: when does a curve actually have a slope at a point, and what does that slope tell us about something that's moving?"

▶ **twoV** *Two V-shaped curves, A and B.*
"Here are two curves. From this distance they look the same, a sharp V. So, does each one have a slope at its lowest point?"

▶ **zoom** *Both panels zoom in, up to 1000 times.*
"Let's zoom in on the bottom of each one. Watch curve A. As we zoom, the corner rounds off and flattens out. Curve B doesn't change at all. At a thousand times zoom it's still exactly the same V."

▶ **question** *Dashed lines: slope 0 on A; slopes −1 and +1 on B.*
"So curve A really does have one slope at the bottom: zero. Curve B has two different slopes, minus one on the left and plus one on the right, and no single slope at all. That's the idea behind differentiability, and it's what this whole lesson is about."

## Scene 2 · Secant to tangent (0:40)

▶ **setup** *f(x) = x² with the point P(3, 9).*
"Let's start with a curve we know, f of x equals x squared, and the point P at (3, 9). I want the slope of the curve exactly at P."

▶ **secant** *Point Q at h = 2, the secant line, and the rise and run.*
"We can't get a slope from one point, so we take a second point Q, a distance h to the right. With h equal to 2, Q is at (5, 25). The line through P and Q is called a secant. Its slope is rise over run: 16 over 2, which is 8. In general, the slope is f of 3 plus h, minus f of 3, all over h."

▶ **shrink** *h shrinks: 2, 1, 0.5, 0.1, 0.01. The table fills in.*
"Now let's slide Q toward P by making h smaller. With h equal to 1, the slope is 7. At 0.5 it's 6.5, at 0.1 it's 6.1, and at 0.01 it's 6.01. The secant is swinging closer and closer to one line."

▶ **left** *Q jumps to the left side: h = −1, −0.1, −0.01.*
"We should check from the other side too. With negative h, Q is to the left of P. The slopes are 5, 5.9 and 5.99. From both sides, the slopes close in on the same number: 6."

▶ **algebra** *Algebra on the right.*
"Here's why. f of 3 plus h minus f of 3, over h, is 3 plus h squared minus 9, over h. Expanding gives 6h plus h squared over h, which simplifies to 6 plus h, as long as h isn't zero. As h approaches 0, 6 plus h approaches 6. So f prime of 3 equals 6."

▶ **tangent** *The tangent line y = 6x − 9 and a check mark.*
"The limiting line is the tangent line, with slope 6 at x equals 3. If you do the same steps at any x equals a, you get f prime of a equals 2a. That's question 1.4 in Homework 1."

## Scene 3 · Derivative microscope (2:10)

▶ **lensSmooth** *A lens zooms into x² at (3, 9).*
"Here's another way to see it. Let's put a microscope on the point (3, 9) and keep zooming in. The more we zoom, the straighter the curve looks, until it's the same as the dashed tangent line with slope 6. That's what differentiable means: zoom in far enough and the curve looks like a line."

▶ **lensCorner** *The lens moves to |x − 2| at its corner.*
"Now let's try the absolute value function, g of x equals the absolute value of x minus 2, at its corner. However far we zoom, the corner stays a corner. One side always has slope minus 1 and the other slope plus 1."

▶ **oneSided** *Secants from both sides, then one-sided limits.*
"In algebra, we use one-sided difference quotients. From the left, h is negative, so absolute value of h over h is minus 1. From the right it's plus 1. The two one-sided limits are different, so g prime of 2 doesn't exist. But g is still continuous at 2, because there's no gap in the graph. You'll practise this in Homework question 1.1 and Final question 1."

## Scene 4 · Gallery of failures (3:25)

▶ **grid** *Four small graphs: corner, cusp, vertical tangent, jump.*
"So far we've seen one way a derivative can fail. There are four common ones, all at x equals 0: a corner, a cusp, a vertical tangent and a jump."

▶ **secants** *Secants from both sides; h shrinks to 0.001.*
"For each graph we draw a secant from the left and one from the right, then shrink h. For the corner, the slopes stay at minus 1 and plus 1, so they disagree. For the cusp, x to the two-thirds, they head to minus infinity and plus infinity. For the vertical tangent, x to the one-third, both slopes blow up to plus infinity, so the tangent line is vertical. For the jump, the left slope runs off to infinity because the graph isn't even connected."

▶ **logic** *Logic card and diagram.*
"Here's the key fact. If f is differentiable at a, then f is continuous at a. The reverse isn't true. The corner, the cusp and the vertical tangent are all continuous, but none of them are differentiable. The jump isn't even continuous."

▶ **verdict** *Summary card.*
"So f prime of a exists only when the difference quotient has a finite limit from the left and from the right, and the two limits match. Try Homework 1.5: is x to the four-fifths a cusp or a vertical tangent?"

## Scene 5 · Piecewise matching (4:40)

▶ **setup** *x² for x ≤ 1, a line mx + b for x > 1, with a gap.*
"Next, a classic question. f is x squared up to 1, then a line mx plus b. Which m and b make f differentiable at x equals 1? Right now there's a gap of 2."

▶ **continuity** *b slides until the line meets (1, 1).*
"Step one is continuity. The two pieces have to meet. The left piece is 1 squared, which is 1, so the line needs m plus b equals 1. Watch b slide down until the gap closes."

▶ **pivot** *The line pivots about (1, 1); a lens shows the join.*
"If we keep b equal to 1 minus m, the line stays attached and pivots around the point (1, 1). In the lens you can see a corner, until the right slope m matches the left slope. The left slope is 2x at x equals 1, which is 2. When m reaches 2, the corner disappears and the join is smooth."

▶ **solve** *Written solution.*
"So, first the values: m plus b equals 1. Then the slopes: m equals 2. That gives b equals minus 1, so the line is 2x minus 1. Always check continuity first, because matching slopes alone isn't enough. You'll find the same method in Homework 1.2, Assessment 1 question 2 and Final question 4."

## Scene 6 · From slopes to motion (5:55)

▶ **morph** *The graph turns into a position–time graph.*
"Now let's change what x means. If x is time, t, and y is position, s, then the slope of the graph is how fast position is changing."

▶ **message** *s(t), v(t) = s′(t), a(t) = v′(t).*
"That's velocity. So velocity is the derivative of position, and acceleration is the derivative of velocity."

## Scene 7 · One particle, three graphs (6:15)

▶ **setup** *Formulas for s, v and a.*
"Here's a particle with position s of t equals t cubed minus 6t squared plus 9t, in metres, from t equals 0 to 5 seconds. Differentiating, v of t is 3t squared minus 12t plus 9, which factors as 3 times t minus 1 times t minus 3. Differentiating again, a of t is 6t minus 12."

▶ **run** *The particle moves; s, v and a are drawn in step with it.*
"Let's run it. The blue dot is the particle and the red arrow is its velocity. It starts moving right, slows down and stops. Then it goes back left, stops again, and finally speeds off to the right. The three graphs are drawn as it moves, and the dashed line marks the current time."

▶ **rest** *Flat tangents at t = 1 and t = 3; zeros of v.*
"The particle is at rest when v equals 0, at t equals 1 and t equals 3 seconds. On the position graph those are the flat points. Velocity changes sign there, so the particle turns around."

▶ **read** *The playhead returns to t = 2 and the slope notes appear.*
"Here's the link between the graphs. At t equals 2, the slope of the position graph is minus 3, which is the value of v of 2. The slope of the velocity graph is 0, which is a of 2. Each graph's slope is the next graph's value."

## Scene 8 · Speeding up or slowing down (7:45)

▶ **chart** *A sign chart builds row by row.*
"Is the particle speeding up or slowing down? The answer comes from comparing signs. We split time at 1, 2 and 3, where v or a is zero. From 0 to 1, v is positive and a is negative, so it's slowing down. From 1 to 2, both are negative, so it's speeding up. From 2 to 3, v is negative and a is positive, so it's slowing down. After 3, both are positive, so it's speeding up."

▶ **replay** *Replay with the speed graph |v| and a speedometer.*
"Let's check with the speed, the absolute value of v. In the green bands the speedometer climbs, and in the orange bands it drops, exactly as the sign chart says."

▶ **predict** *Pause card at t = 2.5.*
"Pause here and predict. At t equals 2.5 seconds, a is plus 3. Is the particle speeding up? … Velocity is minus 2.25, so v times a is negative. It's slowing down. The particle is moving left while the push is to the right, which is exactly Assessment 1, question 5."

▶ **rule** *The rule card.*
"So the rule is: speeding up when v and a have the same nonzero sign, and slowing down when the signs are different. For Quick Check 2, v is minus 3 and a is minus 2. Same sign, so it's speeding up."

## Scene 9 · Displacement vs total distance (9:15)

▶ **legs** *Each leg of the trip is drawn above the track, with the odometer running.*
"Last idea: how far did the particle go? Each leg of the trip goes on its own lane. First, plus 4 metres to the right. Then minus 4 back to 0. Then plus 20. The odometer adds up every metre, but the black arrow only shows where the particle ends up compared to where it started."

▶ **compare** *The two answers.*
"Displacement is s of 5 minus s of 0, which is 20 metres. Total distance is 4 plus 4 plus 20, which is 28 metres."

▶ **method** *Three-step method.*
"Here's the method. One: find the turning times, where v equals 0, here 1 and 3. Two: work out the position at the ends and at the turning times: 0, 4, 0 and 20. Three: add the sizes of the changes. Distance can never be less than the size of the displacement. Try Homework 2.3 and Final question 5."

## Scene 10 · Recap (10:30)

▶ **cards** *Four summary cards.*
"To recap: the derivative is the limit of secant slopes, and if you zoom in far enough, the curve looks like its tangent. A derivative can fail at a corner, a cusp, a vertical tangent or a jump. Differentiable always means continuous, but not the other way around. For motion, v is s prime and a is v prime, and speed increases when v times a is positive. To find total distance, split at the turning times."

▶ **next** *Practice links.*
"Now try Homework 1, Homework 2 and Assessment 1 on our site. Next, Jeff will show you how to use derivatives to find maximums and minimums. Thanks for watching!"

---

## Pronunciation help

| Word | Say it like |
| --- | --- |
| differentiable | dif-uh-REN-shuh-bul |
| derivative | dih-RIV-uh-tiv |
| secant | SEE-kant |
| tangent | TAN-jent |
| quotient | KWOH-shunt |
| continuity / continuous | kon-tih-NOO-ih-tee / kun-TIN-yoo-us |
| cusp | kusp (rhymes with "husk" without the k) |
| velocity | vuh-LOSS-ih-tee |
| acceleration | ak-SEL-uh-RAY-shun |
| displacement | dis-PLAYS-ment |
| f′(x) | "f prime of x" |
| x^(2/3) | "x to the two-thirds" |
| h → 0⁻ | "h approaches zero from the left" |
| m/s² | "metres per second squared" |

## Timing tips

- If a beat feels too short, you don't need to change anything: in Presenter mode it waits for you.
- If you'd rather record over a silent MP4, change the seconds in `videos/alan/timing.js` to match your recording, then re-export (see `videos/README.md`).
- The 8-minute minimum applies to the **final** video. Check the length of your exported file, not this page.
