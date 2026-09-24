# younesessafouri — research portfolio

Static site: plain HTML, one stylesheet, two small scripts. No build step.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Pages

| File | Content |
|---|---|
| `index.html` | Identity + Fig. 0, research question, two publication pieces, talks, "currently", photographs, contact |
| `research.html` | The research in more detail, and projects before the PhD |
| `publications.html` | Full entries with figures, abstracts, BibTeX, talks |
| `about.html` | Short bio, education, experience, teaching, tools |
| `wassersteingrad/` | Stand-alone project page for the WassersteinGrad paper (own CSS/JS) |

## Visual system

Colours are semantic and defined once in `css/style.css` (`:root`):

- `--atmo` (teal): atmospheric state, forecast fields
- `--xai` (cobalt): explanations, attributions
- `--target` (orange): targets and selected points
- `--mute` (grey): metadata
- `--paper` / `--plate` / `--night`: page, figure plates, the one dark band

Type: Newsreader (display serif), Instrument Sans (text), IBM Plex Mono
(scientific metadata). All self-hosted in `fonts/` under the SIL OFL.

## Fig. 0 (`js/field.js`)

The hero map is drawn on a canvas: an analytic 500 hPa field (contours by
marching squares), wind streaks following its geostrophic flow, a target over
Paris, and an attribution layer placed by tracing the flow backwards from the
target over the lead time. It is schematic, not model output, and the caption
says so. It pauses off-screen, and under `prefers-reduced-motion` it draws a
single still. `assets/work/fig0.webp` is that still, used when JavaScript is off
and as the social preview (`og-card.webp`).

## Updating content

- **New publication:** copy an `<article class="paper">` block in
  `publications.html`; put the figure in `assets/pub/` (WebP, ~1600 px wide,
  white background: figures are multiplied onto the paper colour). Add a row
  to the talks list or to "Work so far" in `research.html` if relevant. The
  homepage pieces are hand-composed: add one only for a major paper.
- **Photos:** `assets/photos/<name>-480.webp` and `-960.webp` (EXIF-rotated,
  quality 80). The originals in `photos/` are no longer referenced.
- **CV:** replace `assets/YounesEssafouri_CV.pdf`.

Figures in `assets/work/` are crops of the paper figures (the same sources as
the WassersteinGrad project page); nothing is redrawn.
