# WassersteinGrad — project page

Project page for **"Explanation of Dynamic Physical Field Predictions using
WassersteinGrad: Application to Autoregressive Weather Forecasting"**
(Essafouri, Raynaud, Drozda, Risser — arXiv:2604.22580).

## Running it

There is no build step. It is one HTML file, one stylesheet, one script.

```bash
python3 -m http.server 8000
# then open http://localhost:8000/wassersteingrad/
```

## Deploying

**GitHub Pages** — already works: the page is served from
`https://<user>.github.io/<repo>/wassersteingrad/`. No workflow needed.

**Vercel / Netlify** — deploy this directory as the project root with no build
command and no output directory.

Every asset path is relative, so the site works from any subdirectory.

## Layout

```
wassersteingrad/
├── index.html
└── assets/
    ├── css/style.css
    ├── js/main.js          # progressive enhancement only — page works without it
    └── figures/*.webp
```

## Figures

Every figure is extracted from the paper PDF or the presentation slides. Nothing
is redrawn, resynthesised or invented; the extraction script crops the vector
page regions at high zoom, or pulls embedded rasters at native resolution.

| File(s) | Source |
|---|---|
| `rollout`, `attribution-pipeline`, `noise-*` | Paper Figure 1 (a), (b), (c) |
| `map-{basegrad,smoothgrad,wgbary,wgbarygrad}-{t1,t5}`, `map-colorbar` | Paper Figure 2 |
| `domain-map` | Paper Figure 3 |
| `displacement-t1`, `displacement-t5` | Paper Figure 4 |
| `barycenter-input-1..8`, `barycenter-{pointwise-mean,wasserstein}` | Slides, p. 19 |
| `receptive-field-altitude` | Slides, p. 15 |
| `anemoi-{smoothgrad,wassersteingrad}` | Slides, p. 24 (preliminary, labelled as such) |

All quantitative claims on the page come from Table 1, Section 4.2, Appendix
C.2/E.2 of the paper, or the slides — no numbers are estimated off a plot.

## Things to update before publishing

- **arXiv links.** `2604.22580` is used throughout (hero buttons, footer,
  BibTeX, JSON-LD, `<link rel="canonical">`). Update if the identifier changes.
- **Canonical URL.** Set to `https://younesessafouri.github.io/Portfolio/wassersteingrad/`.
- **Code link.** Currently points at upstream `meteofrance/py4cast`. The slides
  mention `py4cast-xai` and `anemoi-plugins-xai`; swap the hero and footer links
  once those are public.
- **Venue.** The badge reads *Preprint · Under review*. Update on acceptance.

## Assets that would improve the page

These are not required, but each would replace something currently doing more
work than it should:

1. **A hero-scale version of the WG<sub>Bary</sub> map** (or a short loop showing
   the barycenter forming across the 20 perturbed samples). The teaser currently
   uses the four Figure-2 panels at their printed resolution.
2. **Author photos or an institution logo strip** (IMT / Météo-France / Cerfacs /
   ANITI) for the footer.
3. **Vector (PDF/SVG) originals of Figures 1–4.** The current WebP crops are
   rasterised at 6–9× zoom; vector sources would stay sharp at any display size.
