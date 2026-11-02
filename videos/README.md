# MCV4U CCT: animated video lessons

Two animated lessons for the Topic C website, built in plain HTML, CSS and JavaScript with no libraries:

| Lesson | Presenter | Open this file | Silent timeline |
| --- | --- | --- | --- |
| Differentiability and Motion | Alan | `alan/index.html` | 11:10, 10 scenes |
| Extreme Values and Optimization | Jeff | `jeff/index.html` | 11:10, 9 scenes |

These are **animations for the students to narrate**. A video only counts as finished once Alan or Jeff has recorded their own voice over it and the final file is checked to be at least 8 minutes long. See `CCT_PROGRESS_REPORT.md` for what is and is not done.

The main site (`../index.html`) is not changed by anything in this folder.

## Open a lesson

Double-click `alan/index.html` or `jeff/index.html`. It opens in your browser and works offline.

If your browser blocks local files, run a small web server from the project folder:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765/videos/alan/ or http://localhost:8765/videos/jeff/.

## Controls

| Key or button | What it does |
| --- | --- |
| Space / Play | play or pause |
| ← / → | previous / next beat (a beat is one small step inside a scene) |
| [ / ] | previous / next scene |
| Home / Restart | back to the start |
| P / Presenter mode | stop at the end of every beat and wait for → (for live narration) |
| D / Diagnostics | show the time, scene, beat, frame rate and the title-safe area |
| H | hide the controls (for a clean screen recording) |
| F | full screen |

You can also open a lesson at a given point with a link:
- `?t=93` opens at 93 seconds.
- `?scene=box` opens at a named scene.
- `?presenter=1` turns on Presenter mode.
- `?speed=1.5` plays faster.
- `?autoplay=1` starts playing straight away.

## Record your narration

**Option A: narrate live (recommended).**
1. Open your lesson and turn on Presenter mode (P).
2. Press H to hide the controls and F for full screen.
3. Start a QuickTime screen recording with your microphone on.
4. Follow `docs/speaking-notes-<name>.md`, pressing → at each ▶ cue.
5. Trim the start and end in QuickTime or iMovie.

**Option B: voice over a silent export.**
1. Render the silent MP4 (see below).
2. Record your voice over it in iMovie.
3. If your talking doesn't fit, change the seconds in `<name>/timing.js` and render again.

## Export a silent technical preview

This needs Google Chrome and Xcode's command-line tools (for `swiftc`). Nothing else has to be installed.

```bash
node videos/tools/render.mjs alan --video videos/exports/alan-technical-preview.mp4
```

```bash
node videos/tools/render.mjs jeff --video videos/exports/jeff-technical-preview.mp4
```

- Each export takes about 8 minutes on this Mac.
- Every frame carries the watermark "TECHNICAL PREVIEW — NOT FINAL STUDENT NARRATION".
- When it finishes, the tool prints the file's real duration, measured from the MP4 itself.
- For an export without the watermark, add `--watermark 0`. Only do this after you have added your own narration.

To save a few still frames instead (for checking or for slides):

```bash
node videos/tools/render.mjs alan --stills 12,95.5,400 --out /tmp/alan-stills
```

`videos/exports/` is ignored by git because the files are large.

## Check the math

```bash
node --test 'videos/tests/*.test.mjs'
```

There are 34 tests. They check every number the animations show against a hand-worked answer or an independent numerical estimate. The worked derivations are in `docs/math-checks.md`.

## Where things are

```
videos/
  shared/      the player (engine.js), timeline maths (timeline.js), drawing helpers (draw.js),
               graph helper (plot.js), colours and sizes (theme.js), page style (player.css)
  alan/        math.js (functions and numbers), scenes.js (what each scene draws),
               timing.js (seconds per beat), index.html
  jeff/        the same four files for Jeff
  tests/       engine.test.mjs, math-alan.test.mjs, math-jeff.test.mjs
  tools/       render.mjs (headless Chrome export), encode.swift (MP4 encoder and checker)
  docs/        storyboard, speaking notes, math checks, student guide, logs
  CCT_PROGRESS_REPORT.md
```

`docs/student-guide.md` explains how the code works, so you can change it and explain it.
