# younesessafouri — research portfolio

Static site: plain HTML, one stylesheet, two small scripts. No build step.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Pages

| File | Content |
|---|---|
| `index.html` | Identity over Fig. 0, then one continuous flow: publications, currently, photographs, contact |
| `publications.html` | The same list with abstracts and BibTeX |
| `research.html` | A short research statement, one paper figure, projects before the PhD |
| `about.html` | Bio, education, experience, teaching |
| `wassersteingrad/` | Stand-alone project page for the WassersteinGrad paper (own CSS/JS) |

## Visual system

Colours are semantic and defined once in `css/style.css` (`:root`):

- `--mist`: the page, a cool overcast tone
- `--atmo` (sea-glass): the forecast field; `--wash-lo` / `--wash-hi` tint it
- `--xai` (ultramarine): explanations, and links
- `--target` (vermilion): the forecast location

Type: Newsreader (display serif), Instrument Sans (text), IBM Plex Mono
(scientific metadata). All self-hosted in `fonts/` under the SIL OFL.

## Fig. 0 (`js/field.js`)

The hero is drawn on a canvas: an analytic 500 hPa field over south-western
Europe (a wash, smoothed marching-squares contours, wind trails following its
geostrophic flow) and a crosshair over Toulouse.

The explanation is computed rather than drawn. A cloud of particles, one per
level of the column, is released at the target and carried backwards through
the time-dependent flow, one autoregressive step (6 h) at a time. Upper levels
travel further and lower ones are slower and veered, so as the steps accumulate
the explanation moves upstream, stretches and shears. Faint ellipses mark each
intermediate step. The lead-time slider chooses the number of steps; clicking
the map moves the target.

It is schematic, not model output, and the caption says so. It pauses
off-screen, and under `prefers-reduced-motion` it draws a single still.
`assets/work/fig0.webp` is that still (shown without JavaScript);
`og-card.webp` is the social preview.

## Updating content

- **New publication:** copy an `<li class="pub">` block, in `index.html` and in
  `publications.html`. Accepted venues get `class="pub-venue is-accepted"`.
- **Photos:** `assets/photos/<name>-480.webp` and `-960.webp` (EXIF-rotated,
  quality 80). The originals in `photos/` are no longer referenced.
- **CV:** replace `assets/YounesEssafouri_CV.pdf`.
