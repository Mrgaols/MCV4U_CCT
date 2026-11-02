# Student guide: how the animations work

This guide is for Alan and Jeff. Read it so you can explain the code as well as the math. The teacher may ask either of you about **both** lessons, so read the whole thing, not just your half.

## 1. Run it

- Open `videos/alan/index.html` or `videos/jeff/index.html` in Chrome, Safari or Firefox. Double-clicking the file works.
- Press **D** to turn on Diagnostics. The black bar at the bottom shows:
  - the lesson time;
  - the scene name and number;
  - the beat name and how far through it you are (%);
  - the frame rate.
- Check the math: `node --test 'videos/tests/*.test.mjs'`. It should print `pass 34` and `fail 0`.

## 2. Which file controls what

| You want to change… | Edit this file |
| --- | --- |
| a function, a number or a model (e.g. the particle's s(t), the box sheet size) | `<lesson>/math.js` |
| how long a step lasts (to fit your narration) | `<lesson>/timing.js` |
| what a scene draws, its text, its positions | `<lesson>/scenes.js` |
| colours, font sizes, margins | `shared/theme.js` |
| how graphs are drawn (axes, curves, dots) | `shared/plot.js` |
| text, cards, arrows, the zoom lens, easing | `shared/draw.js` |
| play/pause, keys, the scrub bar, presenter mode | `shared/engine.js` |
| how scene times are worked out | `shared/timeline.js` |

Each scene is a `scenes.<id>` object in `scenes.js`. The id matches the `scene:` names in `timing.js`.

| Alan scene | id | Jeff scene | id |
| --- | --- | --- | --- |
| Opening question | `hook` | Opening question | `hook` |
| Secant to tangent | `secant` | Critical numbers | `critical` |
| Derivative microscope | `microscope` | Local vs absolute; EVT | `evt` |
| Gallery of failures | `gallery` | Derivative tests | `tests` |
| Piecewise matching | `piecewise` | Design: open box | `box` |
| From slopes to motion | `bridge` | Economics: profit | `profit` |
| Position, velocity, acceleration | `motion` | Biology: drug level | `drug` |
| Speeding up or slowing down | `speed` | Your turn (bird) | `yourTurn` |
| Displacement vs distance | `distance` | Recap | `recap` |
| Recap | `recap` | | |

## 3. Key variables and formulas

**Alan (`alan/math.js`)**

| Name | Meaning |
| --- | --- |
| `dq(f, a, h)` | difference quotient `[f(a+h) − f(a)] / h`, the slope of the secant line |
| `secantSlope(3, h)` | the same for f(x) = x² at a = 3, equal to 6 + h |
| `smoothV`, `EPS` | the hook's curve A: √(x² + 0.05²), which looks like \|x\| but is smooth |
| `corner`, `vee`, `cusp`, `vtan`, `jump` | the failure examples: \|x − 2\|, \|x\|, x^(2/3), x^(1/3) and a jump at 0 |
| `PW`, `PW_START`, `continuousB(m)` | the piecewise problem: the answer (m = 2, b = −1), where the animation starts, and b = 1 − m |
| `s`, `v`, `a` | position t³ − 6t² + 9t (m), velocity (m/s), acceleration (m/s²) |
| `motionState(t)` | `'speeding'` if v·a > 0, `'slowing'` if v·a < 0, `'neither'` if either is 0 |
| `totalDistance(t0, t1)` | splits at the turning times `REST_TIMES` and adds the absolute changes |

**Jeff (`jeff/math.js`)**

| Name | Meaning |
| --- | --- |
| `trail`, `trailSlope`, `TRAIL` | the hook's trail. It is built from its slope u²(u − 3)(u − 6)/10 with u = x − 2, so it has a shelf at 2, a peak at 5, a valley at 8, and its end at 9.2 |
| `f`, `fp`, `fpp` | x³ − 3x and its first and second derivatives |
| `CANDIDATES`, `absoluteExtrema(g, xs)` | the candidates on [−2, 2], and a function that finds the largest and smallest values among them, including ties |
| `SHEET`, `boxV`, `boxVp`, `BOX` | the sheet side (20 cm), V(x) = x(S − 2x)², V′(x), and the answer `xStar = S/6` |
| `price`, `revenue`, `cost`, `profit`, `MR`, `MC` | the economics model (dollars) |
| `twist`, `TWIST` | the hypothetical profit q³ − 6q² + 9q on [0, 5] |
| `drug`, `drugP`, `DRUG` | C(t) = 10t / (t² + 4) mg/L and its derivative (illustrative only) |
| `bird`, `birdP`, `drag`, `timeCost` | E(v) = 0.05v² + 100/v and its two parts |

## 4. From graph coordinates to pixels

The stage is always **1920 × 1080 stage pixels**. On screen it is scaled to fit the window, but the code never needs to know.

A `Plot` (in `shared/plot.js`) is a rectangle on the stage, called `box`, that shows a window of the plane, called `win`. To turn a math point (x, y) into a pixel:

```
pixelX = box.x + (x − xMin) / (xMax − xMin) × box.w
pixelY = box.y + (yMax − y) / (yMax − yMin) × box.h
```

**Why `yMax − y`?** Pixel rows count downward from the top, but y counts upward. So the top of the box has to match `yMax`.

**Example.** Alan's secant plot shows x from 0 to 5.6 across 788 pixels, so 1 unit of x is about 141 pixels. The point (3, 9) lands 3 × 141 ≈ 422 pixels right of the plot's left edge.

`p.X(x)` and `p.Y(y)` do this conversion. `p.invX` and `p.invY` undo it. The test `plot maps math coordinates to pixels and back` in `tests/engine.test.mjs` checks both directions.

**The zoom lens** (Alan's microscope) is just a second `Plot` whose window shrinks: half-width 1.2, then 0.12, then 0.012… Each second of the beat zooms by the same factor because the half-width uses `logLerp`, which changes on a log scale.

## 5. What happens every frame

`shared/engine.js` runs a loop about 60 times a second:

1. **Find the time.** `t = time when Play was pressed + (now − that moment) × speed`. Time is read from the clock. It is never built up by adding frame lengths, so it cannot drift.
2. **Find where we are.** `timeline.js` turns the beat lengths from `timing.js` into start and end times, then finds the current scene, beat and the time inside the scene.
3. **Draw.** The canvas is cleared, then the scene's `draw(ctx, s)` runs. `s.p('beat')` is how far through that beat we are, from 0 to 1. Scenes use it to move things. For example, the particle's time in Alan's motion scene is `M.T_END * s.p('run', 0.03, 0.97)`: it runs from 0 to 5 s over the middle 94% of the "run" beat.
4. **Cross-fade.** For the first 0.6 s of a scene, the last frame of the previous scene is laid on top and faded out.
5. **Presenter mode.** If a beat boundary was crossed during this frame, the clock stops exactly on it and waits for →.

Because each frame depends only on `t`, scrubbing, jumping and exporting always draw the same picture for the same time. The export tool (`tools/render.mjs`) uses this: frame n is simply `lesson.seek(n / 30)`.

## 6. Pause, scrub, change a parameter, check the result

1. Press **D**, then drag the scrub bar to the scene you want. Read the time in the diagnostics bar.
2. Open `<lesson>/math.js`, change one value and save.
3. Reload the page. It opens at the start; add `?t=<seconds>` to the address to jump straight back.
4. Predict the new numbers by hand first. Then compare them with the labels on screen.
5. Run `node --test 'videos/tests/*.test.mjs'`. Tests that compare against the old hand-worked answer will now **fail**; that is expected. Work out the new answer by hand, update the expected value in the test, and run it again.
6. Put the original value back when you are done, or keep the change if you both agree. Write it in `docs/contribution-record.md`.

## 7. Live demo exercises (one each, for the class or the teacher)

### Alan: the size of the gap in the piecewise scene

- **File:** `alan/math.js`, line `const PW_START = { m: 0.5, b: 2.5 };`
- **Change:** set it to `{ m: 1, b: 3 }`.
- **Predict before running:**
  - The starting gap is m + b − 1 = 1 + 3 − 1 = 3.
  - After the "continuity" beat, b = 1 − m = 0. The line passes through (1, 1) with slope 1.
  - The final answer is unchanged: m = 2, b = −1, because it comes from x² alone.
- **Test:** open `alan/index.html?scene=piecewise` and press → beat by beat. The red label should read "gap 3.00". Then run the tests. They should still pass, because no test depends on the starting point.
- **Explain the code:**
  - `pwGap(m, b)` returns `m·1 + b − 1`.
  - The `continuity` beat moves b with `lerp(start.b, continuousB(start.m), …)`.
  - The `pivot` beat sets `b = continuousB(m)`, which keeps the line attached at (1, 1) while it turns.

### Jeff: a bigger sheet for the box

- **File:** `jeff/math.js`, line `const SHEET = 20;`
- **Change:** set it to `30`.
- **Predict before running:**
  - The domain is 0 < x < 15.
  - V′(x) = (30 − 2x)(30 − 6x) = 0 gives x = 5 (x = 15 is outside the domain).
  - V(5) = 5 · 20² = **2000 cm³**. In general, V(S/6) = 2S³/27.
- **Test:** open `jeff/index.html?scene=box`. The labels, the graph scale and the working all update from `SHEET`. The finished box should read x = 5.00 cm and V = 2000 cm³.
  - Run the tests. `open box from a 20 cm sheet` now fails, because it still expects 10/3 and 16000/27.
  - Update it to 5 and 2000, by hand, then run it again.
- **Explain the code:**
  - `BOX.xStar = SHEET / 6` comes from setting `boxVp` to zero.
  - The scene's labels are built from `S = M.SHEET`. The exact fraction comes from `frac(2 * S³, 27)`.
  - The box drawing scales with `isoMap(500, 640, 400 / S)`, so a bigger sheet still fits on screen.

Both exercises were run by Claude Code on 2026-11-02 to check they work: the 30 cm sheet was rendered and inspected. **That is not your demo.** Do it yourselves and record it in `docs/contribution-record.md`.

## 8. Recreate the test of an important scene

To check a scene the same way it was checked during production:

```bash
node videos/tools/render.mjs jeff --stills 330,372 --out /tmp/box-check
```

This saves two PNG frames from the box scene at 330 s and 372 s, exactly as they appear in the video. Open them and check:
- the numbers on screen match `math.js` and `docs/math-checks.md`;
- no text is cut off or overlapping.

Then run the matching unit tests:

```bash
node --test videos/tests/math-jeff.test.mjs
```

## 9. Honest-use notes

- Claude Code wrote this code, the storyboard and the draft speaking notes. That is recorded in `docs/production-log.md`.
- If you change something, add it to `docs/contribution-record.md` in your own words.
- The narration must be your own voice. If the teacher asks how AI was used, the production log is the accurate answer.
- The teacher has **not yet confirmed** whether AI-assisted animation is allowed. Ask before you submit.
