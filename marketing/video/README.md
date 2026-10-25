# POS product showcase

A self-contained Remotion project for a 36-second, 1920 × 1080, 30 fps product film.
It follows the POS landing page's teal, mint, Fraunces, and DM Sans branding.
All animations use frame-based timing and all fonts are bundled locally.

## Run

Requires Node.js 22 or later, with `ffmpeg` and `ffprobe` on PATH for music
mastering, audio replacement, and verification. Install and run from this directory:

```powershell
npm ci
npm run assets
npm run studio
```

Open Remotion Studio at `http://localhost:3100`. Preview, scrub, and edit the
`PosShowcase` composition. The first render downloads Remotion's headless browser
if it is not installed yet.

```powershell
npm run typecheck
npm run render
npm run poster
node scripts/render-stills.mjs
npm run verify
```

`verify` requires `ffmpeg` and `ffprobe` on PATH. It checks video dimensions,
frame count, duration, video/audio streams, unexpected black sections, and
soundtrack levels. Review the stills and the full video for visual/timing QA.

## Replace only the music

```powershell
npm run music
```

This generates the upbeat original track **Everyday in Motion** and replaces
the MP4's audio with FFmpeg. It copies the existing H.264 video stream without
rendering or re-encoding any pictures. SHA-256 hashes verify that the encoded
video track is identical and that the audio track changed.

The updated file is `out/pos-showcase-upbeat.mp4`, also copied to the standard
`out/pos-showcase.mp4` path. The first version is preserved as
`out/pos-showcase-original-music.mp4`. The comparison is recorded in
`out/music-update.json`.

The new 120 BPM arrangement combines electric piano, a plucked melody,
syncopated bass, drums, stereo ambience, and a resolved ending. It is mastered
to -16 LUFS with a -1.5 dB true-peak limit. Fades are included in the audio,
so Remotion plays it at unity volume for future renders.

## Deliverables

- `out/pos-showcase.mp4`: H.264 MP4, stereo AAC audio, 1080p, 30 fps.
- `out/pos-showcase-poster.png`: opening title poster.
- `out/frame-*.png`: review stills from every scene and checkout/stock states.
- `out/verification.json`: technical verification of the final MP4.

Generated files are ignored by Git. The source, dependency lockfile, and audio
generator are tracked so the film can be reproduced.

## Storyboard

| Time | Scene | Current product capabilities shown |
| --- | --- | --- |
| 0–4s | Your shop. All together. | Sales, inventory, people |
| 4–13s | A smoother checkout. | Product search, cash/card recording, change, receipts |
| 13–20s | A clear view of every item. | Stock by variant, low-stock alerts, receiving stock, movements |
| 20–27s | Less guessing. More clarity. | Revenue, gross profit, orders, top products, CSV/PDF reports |
| 27–32s | The right access. For every role. | Owner, manager, and cashier responsibilities |
| 32–36s | Made for your everyday. | Brand closing |

## Editing

- `src/storyboard.ts`: timing, prices, sample inventory, chart data, money format.
- `src/Showcase.tsx`: scenes, copy, UI illustrations, transitions, and audio volume.
- `src/style.css`: typography, brand colors, layout, and reusable visual treatments.
- `scripts/create-audio-upbeat.mjs`: original upbeat instrumental and loudness mastering.
- `scripts/create-audio.mjs`: the first, softer soundtrack arrangement.
- `scripts/replace-music.mjs`: replace audio while preserving the encoded video track.

The UI is a motion-designed illustration of existing workflows, not a screen
recording. Product data, team names, and sales figures are fictional and are
labeled as demo data. The film does not demonstrate proposed features such as
e-wallet integration, saved carts, purchase orders, or offline checkout. Card
payments refer to recording a payment method, not processing a card transaction.
No production database or user records are used or modified.

## Assets

The soundtrack is an original, locally synthesized composition. It contains no
external samples or downloaded music. DM Sans and Fraunces are included through
their Fontsource packages under the SIL Open Font License; see each package's
license. Lucide icons use the ISC license. Remotion has its own license terms:
[remotion.dev/license](https://www.remotion.dev/license).
