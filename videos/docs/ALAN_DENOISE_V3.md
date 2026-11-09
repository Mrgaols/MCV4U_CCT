# Audio update — 2026-11-09

Alan recordings 1.1–2.6 are replaced by the ten newly supplied takes. Scene 3 retains the previously approved noise reduction; later Alan scenes and all Jeff speech retain their supplied recordings. Both lessons have shorter leading/trailing clip silence and smooth edge fades. Internal pauses, speech speed and speaker identity are preserved. Video beat timing and chapter links are updated. Earlier versions and all raw takes remain preserved.

Current durations: Alan 13:58.8; Jeff 12:53.7. Historical durations, audio-identity and denoising statements below describe earlier versions, not the current export. The human-evidence Rubric limits remain unchanged.

---

# Alan scenes 1–3: denoising revision v3

The source is the v2 mastered Alan narration. Original recordings, v2 video and prior archives are preserved. Only the first three scenes are denoised: **13 beats, 0 to 332.633333 seconds**. No recording was shortened, sped up or pitch-shifted.

The processing uses a separate noise estimate for each recording, measured in automatically detected non-speech frames. It applies a 70 Hz zero-phase high-pass and moderate spectral attenuation while retaining complex phase. A minimum spectral gain of 0.22 and smoothing limit aggressive removal. Short blends stay inside the processed region.

## Measured checks

- Noise estimate in selected non-speech windows: **9.57 dB lower**.
- Energy in selected strong-speech windows: **1.35 dB lower**, including both speech and remaining background energy. This is not a pure measurement of the voice component.
- Six one-second speech alignment checks: **0 detected lag**.
- Audio after scene 3: exactly unchanged at the decoded PCM stage. Re-encoding AAC can introduce very small codec differences throughout the track; no denoising is applied to scenes 4–10.
- Video image stream: bit-identical to v2. Jeff's MP4: byte-identical to v2.
- Final Alan video: **929.800 seconds**, 1920×1080, 30 fps; complete decode passes.

The baseline noise estimate uses VAD-selected intervals, not a clean studio reference. Automatic speech recognition was also spot-checked as a listening aid; it still misrecognizes accented mathematical vocabulary and is not proof of verbatim intelligibility. Listen to the before/after examples for subjective quality.

## Listen and reuse

- Open `../../denoise-review.html` for synchronized A/B switching and the complete video.
- `../exports/alan-scenes123-before-sample.m4a` and `alan-scenes123-after-sample.m4a` contain the same 20 seconds of beat 2.2, starting at lesson time 94.866667 s.
- `../audio/alan-denoised/` contains the 13 denoised beats at their video cue lengths, including their existing beat pauses. These are derived from the mastered movie soundtrack, not replacements for the preserved raw source recordings.
- `../verification/alan-scenes123-denoise.json` records parameters, media metadata and scope checks.

This is an audio-quality revision. It does not change the mathematical review, student evidence, teacher feedback or submission status recorded in the acceptance report.
