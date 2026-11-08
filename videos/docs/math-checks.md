# Math checks

Every number shown in either animation is worked out by hand below, and each one has an automated check:

```bash
node --test 'videos/tests/*.test.mjs'
```

Last run on 2026-11-02 by Claude Code: **34 tests, 34 passed, 0 failed.** The tests compare the code's values with the hand-worked answers below. Where possible they also use an independent method: a numerical derivative, Simpson's rule, or a brute-force search over 200,000 points.

**Scope of the check.** These checks show that the code matches the math written here. A person still needs to read the derivations: see "Pending review" in `../CCT_PROGRESS_REPORT.md`.

## Audit of the site examples the videos reuse

Before reusing an example from `index.html`, it was re-derived by hand. No errors were found in:
- lesson 1.1, f′(3) for x²;
- 1.2, |x − 2| at 2;
- 1.3, x^(2/3) and x^(1/3);
- 1.4, the piecewise join;
- 2.1–2.3, the particle t³ − 6t² + 9t;
- 3.1–3.2, x³ − 3x on [−2, 2];
- 4.1, the 20 cm box;
- 4.2, the profit model;
- 4.4, the drug model;
- HW 3.4, 3.5 and 4.3;
- A1 Q3/Q5, A2 Q4 and A3 Q5.

The videos add three examples that are **not** on the site. They are derived below:
- Alan's hook curve √(x² + 0.05²);
- the jump function in Alan's gallery;
- Jeff's hiking trail.

---

## Alan: Differentiability and Motion

### Hook: curve A, √(x² + 0.0025)
- y = √(x² + ε²) with ε = 0.05, so y′ = x / √(x² + ε²). At x = 0, y′ = 0: a tangent exists and it is flat.
- |√(x² + ε²) − |x|| ≤ ε = 0.05 for all x, and for |x| ≥ 0.5 the gap is at most 0.0025. So at zoom ×1 it looks the same as |x|.
- Test: `hook curve A is smooth with slope 0 at x = 0, but looks like |x| from far away`

### Secant to tangent: f(x) = x², a = 3
- [f(3 + h) − f(3)] / h = [(3 + h)² − 9] / h = (6h + h²) / h = 6 + h, for h ≠ 0.
- The table shows 6 + h:

  | h | 2 | 1 | 0.5 | 0.1 | 0.01 | −1 | −0.1 | −0.01 |
  |---|---|---|---|---|---|---|---|---|
  | slope | 8 | 7 | 6.5 | 6.1 | 6.01 | 5 | 5.9 | 5.99 |

- At h = 2, Q = (5, 25), rise 16, run 2, slope 8.
- f′(3) = lim (6 + h) = 6. The tangent is y − 9 = 6(x − 3), or y = 6x − 9.
- Tests: `secant slopes of x² at a = 3 equal 6 + h`, `tangent to x² at (3, 9) has slope 6`

### Microscope and one-sided limits: g(x) = |x − 2|
- For h < 0: |h| / h = −h / h = −1. For h > 0: |h| / h = h / h = +1.
- The one-sided limits disagree, so g′(2) does not exist. g is continuous at 2, because g(2) = 0 and both one-sided limits of g are 0.
- In the lens, the y-axis is stretched by 6 so that slope 6 appears at 45°. This is stated in the code comment.
- Test: `|x − 2| has one-sided slopes −1 and +1 at x = 2`

### Gallery (all at x = 0, with h = 0.001 shown)

| Function | Left quotient | Right quotient | Verdict |
| --- | --- | --- | --- |
| \|x\| | \|h\|/h = −1 | +1 | corner: the slopes disagree |
| x^(2/3) | h^(2/3)/h = h^(−1/3) = −10 | +10 | cusp: they head to −∞ and +∞ |
| x^(1/3) | h^(1/3)/h = h^(−2/3) = 100 | 100 | vertical tangent: both head to +∞ |
| x for x < 0, x + 1 for x ≥ 0 | (h − 1)/h = 1 − 1/h = 1001 | (h + 1 − 1)/h = 1 | jump: not continuous |

- For h < 0, the cube root of a negative number is negative, so (−0.001)^(−1/3) = −10.
- Tests: `x^(2/3) … cusp`, `x^(1/3) … vertical tangent`, `jump function …`

### Piecewise: x² for x ≤ 1, mx + b for x > 1
- Continuity at 1: 1² = m + b, so b = 1 − m. The animation starts at m = 0.5, b = 2.5, a gap of (0.5 + 2.5) − 1 = 2.
- Smoothness: the left derivative 2x at x = 1 is 2, and the right derivative is m, so m = 2 and b = −1. The line is 2x − 1.
- Test: `piecewise join …`

### Particle: s(t) = t³ − 6t² + 9t, 0 ≤ t ≤ 5
- v = 3t² − 12t + 9 = 3(t − 1)(t − 3) m/s, and a = 6t − 12 = 6(t − 2) m/s².
- Rest at t = 1 and 3. Positions: s(0) = 0, s(1) = 4, s(2) = 2, s(3) = 0, s(5) = 20.
- At t = 2: v(2) = −3 (the slope of the s graph) and a(2) = 0 (the slope of the v graph).
- Signs, v·a and speed on each interval:

  | Interval | v | a | v·a | speed |
  | --- | --- | --- | --- | --- |
  | (0, 1) | + | − | < 0 | slowing |
  | (1, 2) | − | − | > 0 | speeding up |
  | (2, 3) | − | + | < 0 | slowing |
  | (3, 5) | + | + | > 0 | speeding up |

- At t = 2.5: v = 3(1.5)(−0.5) = −2.25 m/s and a = 3 m/s². v·a = −6.75 < 0, so it is slowing down. These are Assessment 1 Q5's numbers.
- Displacement = s(5) − s(0) = 20 m. Distance = |4 − 0| + |0 − 4| + |20 − 0| = 28 m.
  - Independently, the integral of |v| from 0 to 5 by Simpson's rule (20,000 intervals) is 28.000000.
- Odometer readings: 4 m at t = 1, 4 + 2 = 6 m at t = 2, 8 m at t = 3, 28 m at t = 5.
- Tests: `particle: v = s′ and a = v′`, `particle positions …`, `speeding up / slowing down …`, `t = 2.5 …`, `displacement 20 m and total distance 28 m`, `odometer reading …`

---

## Jeff: Extreme Values and Optimization

### Hook trail (new; elevation in arbitrary units)
- The trail is built from its slope: h′(x) = u²(u − 3)(u − 6) / 10 with u = x − 2. Integrating gives h(x) = (u⁵/5 − 9u⁴/4 + 6u³)/10 + 10.
- What the slope shows:
  - h′ = 0 at x = 2, but h′ > 0 on both sides (the u² factor never changes sign): a shelf.
  - h′ changes + to − at x = 5: a local max, h ≈ 12.84.
  - h′ changes − to + at x = 8: a local min, h ≈ 3.52.
- Values: h(9.2) ≈ 16.27 > 12.84, so the highest point on [0, 9.2] is the endpoint.
- A brute-force search over 200,000 points confirms the maximum is at x = 9.2.
- Test: `hook trail: shelf at 2, false peak at 5, summit at the end of the trail`

### Critical numbers and absolute extrema: f(x) = x³ − 3x on [−2, 2]
- f′(x) = 3x² − 3 = 3(x − 1)(x + 1), which is 0 at x = ±1. Both are inside the interval.
- Candidates: f(−2) = −2, f(−1) = 2, f(1) = −2, f(2) = 2.
  - Absolute max 2, at x = −1 and x = 2.
  - Absolute min −2, at x = −2 and x = 1.
- −|x| at 0: f′(0) does not exist, but 0 is a local maximum, so it is a critical number (Final Q10).
- Test: `f(x) = x³ − 3x: critical numbers ±1 and candidate values on [−2, 2]`

### Derivative tests
- The sign of f′ is + on (−∞, −1), − on (−1, 1) and + on (1, ∞). So x = −1 is a local max and x = 1 is a local min.
- f″(x) = 6x: f″(−1) = −6 < 0 (concave down, max) and f″(1) = 6 > 0 (concave up, min).
- x³ at 0: f′ = 3x² ≥ 0 on both sides, so it is not an extremum.
- x⁴ − 4x³: f′ = 4x²(x − 3) and f″ = 12x² − 24x.
  - f″(0) = 0, so the second test is inconclusive.
  - f′(−1) = −16 and f′(1) = −8, so f′ is negative on both sides of 0 and there is no extremum at 0.
  - x = 3 is a local min: f(3) = −27 and f″(3) = 36.
- Tests: `derivative tests on x³ − 3x agree`, `stationary points that are not extrema …`

### EVT counterexamples
- f(x) = x on (0, 1): the values 0.9, 0.99, 0.999 approach 1, which is never reached. There is no max.
- f(x) = x on [0, 1) with f(1) = 0: the interval is closed but f is not continuous at 1, and the supremum 1 is never reached. There is no max (HW 3.4).
- These are shown, not computed, so there is no separate test. The values 1 − h use the same `stepped` helper as Alan's table.

### Design: open box from an S = 20 cm sheet
- V(x) = x(S − 2x)², with 0 < x < S/2 = 10.
- V′(x) = (S − 2x)² + x · 2(S − 2x)(−2) = (S − 2x)(S − 2x − 4x) = (S − 2x)(S − 6x).
- V′ = 0 at x = S/2 = 10 (outside the domain) or x = S/6 = 10/3.
- V(10/3) = (10/3)(40/3)² = 16000/27 ≈ 592.59 cm³. In general V(S/6) = 2S³/27.
- V(0) = V(10) = 0 and V > 0 between, so the interior critical number is the absolute max.
- A brute-force search gives x ≈ 3.3333.
- Test: `open box from a 20 cm sheet: x = 10/3, V = 16000/27 cm³`

### Economics: p(q) = 100 − 2q, C(q) = 200 + 20q, 0 ≤ q ≤ 50
- R(q) = 100q − 2q² and P(q) = 80q − 2q² − 200.
- MR = 100 − 4q and MC = 20, so MR = MC at q = 20. P′(q) = 80 − 4q = 0 at q = 20.
- P″ = −4 < 0, so the curve is concave down and q = 20 is the absolute max.
- P(20) = 1600 − 800 − 200 = **$600**, at price p(20) = $60. The ends: P(0) = −$200 and P(50) = −$1200.
- Test: `profit model: q = 20 items, price $60, profit $600`

### "MR = MC is not proof": P(q) = q³ − 6q² + 9q on [0, 5] (hypothetical, thousands of dollars)
- P′(q) = 3(q − 1)(q − 3), which is 0 at q = 1 and q = 3.
- Candidates: P(0) = 0, P(1) = 4 (local max), P(3) = 0 (local min) and P(5) = 125 − 150 + 45 = 20. The winner is the endpoint q = 5.
- Test: `MR = MC is not proof …`

### Biology: C(t) = 10t / (t² + 4) mg/L, t ≥ 0 h (illustrative, not medical data)
- Quotient rule: C′(t) = [10(t² + 4) − 10t · 2t] / (t² + 4)² = 10(4 − t²) / (t² + 4)².
- C′ = 0 at t = 2 (t = −2 is outside the domain). C′ > 0 on [0, 2) and C′ < 0 for t > 2, so t = 2 is the absolute max on [0, ∞).
  - The EVT does not apply here, because [0, ∞) is closed but unbounded. The EVT requires a closed, bounded interval.
- C(2) = 20/8 = **2.5 mg/L**. C(10) = 100/104 ≈ 0.96 mg/L, which is the vial reading at 10 h.
- Test: `drug model: peak 2.5 mg/L at t = 2 h …`

### Your turn: E(v) = 0.05v² + 100/v, 2 ≤ v ≤ 25 (HW 4.3)
- E′(v) = 0.1v − 100/v², which is 0 when v³ = 1000, so v = 10 m/s and E = 5 + 10 = **15**.
- The ends: E(2) = 0.2 + 50 = 50.2 and E(25) = 31.25 + 4 = 35.25. Both are greater than 15, so v = 10 is the absolute min.
- Test: `bird flight energy: least at v = 10 m/s, E = 15`

---

## The player itself

`tests/engine.test.mjs` (11 tests) checks:
- beat times add up;
- a missing scene or a zero-length beat is reported clearly;
- `locate` finds the right beat and clamps out-of-range times;
- `s.p()` progress is correct, including sub-ranges;
- the beat stops for ←/→ are correct;
- presenter mode stops exactly on a boundary;
- the math-to-pixel mapping works in both directions;
- `fmt` prints a true minus sign and never "−0.00".
