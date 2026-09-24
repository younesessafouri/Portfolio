# younesessafouri — research portfolio

Static site: plain HTML, one stylesheet, two small scripts. No build step.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Structure

One page, `index.html`: identity over Fig. 0, then Research, Publications and
About as sections, reached from the fixed navigation (`#research`,
`#publications`, `#about`). `research.html` and `publications.html` only
redirect to those sections, so old links keep working. The CV stays a PDF, and
`wassersteingrad/` is the paper's stand-alone project page.

The About section:

- **Photographs** in an asymmetric grid, linked to a small atlas: hovering a
  photo lights up where it was taken (and the reverse). On phones it becomes a
  swipeable strip and the atlas follows. Captions are coordinates and capture
  times from the photos' EXIF data.
- **Reading**: a shelf of spines; hovering one shows the author's details.
- **Music**: a record (grooves drawn as contour-like rings) and a short
  "on rotation" list with waveforms. Choosing a record turns the disc and
  sweeps the waveform. There is no audio.
- **Path**: education, research and teaching on one time axis, with a "now"
  marker. The PhD bar is solid up to today and dotted beyond, like a forecast.

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

- **New publication:** copy an `<li class="pub">` block in `index.html`.
  Accepted venues get `class="pub-venue is-accepted"`.
- **Photos:** add `assets/photos/<name>-480.webp` and `-960.webp` (EXIF-rotated,
  quality 80), a `<figure class="shot">` in the gallery, and a point in the atlas
  SVG. The originals in `photos/` are no longer referenced.
- **Books / records:** each spine is an `<li class="book">` (height, width and
  colour are inline custom properties); each record is a `<button data-track>`.
- **Path:** each bar is an `<li>` with `--a` / `--b` as decimal years.
- **CV:** replace `assets/YounesEssafouri_CV.pdf`.
