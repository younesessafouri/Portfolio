# younesessafouri — research portfolio

Static site: plain HTML, one stylesheet, two small scripts. No build step.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Structure

One page, `index.html`, reached from the fixed navigation:

- **Hero**: name, field, a one-sentence introduction, over Fig. 0.
- **Publications** (`#publications`): the list, with abstract and BibTeX panels.
- **Talks & Teaching** (`#talks`): the seminar talk and the teaching. Adding
  `data-hours="N"` to the teaching item draws one tick per hour under its title.
- **About** (`#about`): what the research is about, in plain words, then the
  **Path**, then life off the clock (photographs + atlas, books, records).

`research.html` and `publications.html` only redirect to their sections. The CV
stays a PDF, and `wassersteingrad/` is the paper's stand-alone project page.

The Path is a time axis of the research stages. On wide screens it is
scroll-driven: the section stays in place while a cursor moves through the
stages, and each stage's sentence appears under its bar. On phones it becomes a
vertical timeline; with reduced motion, a static axis with the list below.

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
geostrophic flow) and a crosshair over Toulouse. The pattern is a plain
mid-latitude one: westerlies from the Atlantic, a trough to the north-west and a
subtropical ridge to the south-east, both drifting east with lead time, and a
short wave travelling east. Winds come mostly from the west-south-west at
20–35 m/s, and flow around lows and highs turns the right way for the northern
hemisphere.

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

- **New publication:** copy an `<li class="pub">` block in `index.html`.
  Accepted venues get `class="pub-venue is-accepted"`.
- **Photos:** add `assets/photos/<name>-480.webp` and `-960.webp` (EXIF-rotated,
  quality 80), a `<figure class="shot">` in the gallery, and a point in the atlas
  SVG. The originals in `photos/` are no longer referenced.
- **Books / records:** each spine is an `<li class="book">` (height, width and
  colour are inline custom properties); each record is a `<button data-track>`.
- **Path:** each stage is an `<li class="stage">` with `--a` / `--b` (and
  `data-a` / `data-b`) as decimal years, a lane, a short bar label and one sentence.
- **CV:** replace `assets/YounesEssafouri_CV.pdf`.
