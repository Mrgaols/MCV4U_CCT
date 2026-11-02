# Contribution record

This file records who did what, accurately. **Rows for Alan and Jeff are left for them to fill in themselves.** Nothing here has been filled in on their behalf.

How to use it: add a row whenever you do real work, such as reviewing a derivation, changing a parameter, recording narration, editing a scene or presenting. Say what you did, and point to the evidence (a commit, a file, a recording).

## Claude Code (AI assistant), working in this repository at the user's request

| Date | What Claude Code did | Evidence |
| --- | --- | --- |
| 2026-10-30 to 2026-11-01 | In earlier sessions, at the user's request, edited the main website `index.html`: content and figure fixes, then a restyle to the Mintlify look. Those sessions are not detailed here. | `index.html` at commit 17a6795 |
| 2026-11-02 | Read `CLAUDE.md`, the CCT Guidelines and `index.html`, and wrote the plan for both animations, which the user approved | the plan file (`~/.claude/plans/synchronous-beaming-ember.md` on the user's Mac); `docs/storyboard.md` |
| 2026-11-02 | Wrote all code in `videos/`: the player, both lessons, the tests and the export tools | commits 15af611 and 1b5cc43 on branch `animations`, plus the documentation commit |
| 2026-11-02 | Ran the math tests and the visual checks, fixed layout problems, and exported silent technical previews | `docs/production-log.md` |
| 2026-11-02 | Wrote the draft speaking notes, the storyboard, the math checks, the student guide and the progress report | `docs/`, `CCT_PROGRESS_REPORT.md` |

**Note on commit names.** The commits on `animations` show the author "Mrgaols", because that is the git name set up on this computer. **The code in them was written by Claude Code**, not typed by a student. The commit messages leave out the usual Claude attribution line because the user asked for that. This file and `production-log.md` are the accurate record.

## Students and other people

| Date | Who | What | Evidence |
| --- | --- | --- | --- |
| 2026-11-02 | Jeffrey DU (git author) | Committed `CLAUDE.md`, the animation production brief, and merged it into `main` through PR #1 from the `wengecaitui` fork | commits ca0c59c and 4f00a6a |
| | Alan | *(to fill in)* | |
| | Alan | *(to fill in: live demo from `student-guide.md` §7)* | |
| | Alan | *(to fill in: narration recorded)* | |
| | Jeff | *(to fill in)* | |
| | Jeff | *(to fill in: live demo from `student-guide.md` §7)* | |
| | Jeff | *(to fill in: narration recorded)* | |
| | Both | *(to fill in: cross-review of each other's lesson)* | |

## Suggested items for each student (from `CLAUDE.md` §5–§7)

- [ ] Re-derive every number in your own lesson by hand, using `docs/math-checks.md`, and sign off.
- [ ] Rewrite the speaking notes in your own words.
- [ ] Record your own narration. AI voice is not allowed.
- [ ] Do the live demo exercise in `student-guide.md` §7: change a parameter, predict, test and explain.
- [ ] Review the other student's lesson and be able to explain one of its animations and its code.
- [ ] Ask the teacher whether AI-assisted animation is allowed, and record the answer here.
