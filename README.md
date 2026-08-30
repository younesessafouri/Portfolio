# WassersteinGrad — project page

Project page for **"Explanation of Dynamic Physical Field Predictions using
WassersteinGrad: Application to Autoregressive Weather Forecasting"**

Younes Essafouri, Laure Raynaud, Luciano Drozda, Laurent Risser — arXiv:2604.22580

🌐 **https://younesessafouri.github.io/wassersteingrad/**

---

## Running it locally

There is no build step. It is one HTML file, one stylesheet, one script.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
The `.nojekyll` file keeps Pages from running the content through Jekyll.

**Vercel / Netlify** — deploy the repository root with no build command and no
output directory.

All asset paths are relative, so the site also works from a subdirectory.

## Layout

```
.
├── index.html
├── .nojekyll
└── assets/
    ├── css/style.css
    ├── js/main.js          # progressive enhancement only — page works without it
    └── figures/*.webp      # 30 files, ~1.1 MB total
```

## Figures

Every figure is extracted from the paper PDF or the presentation slides. Nothing
is redrawn, resynthesised or invented: vector page regions are cropped at 6–9×
zoom, and embedded rasters are pulled at native resolution.

| File(s) | Source |
|---|---|
| `rollout`, `attribution-pipeline`, `noise-*` | Paper Figure 1 (a), (b), (c) |
| `map-{basegrad,smoothgrad,wgbary,wgbarygrad}-{t1,t5}` | Paper Figure 2 |
| `domain-map` | Paper Figure 3 |
| `displacement-t1`, `displacement-t5` | Paper Figure 4 |
| `shattered-gradients` | Slides, p. 12 |
| `receptive-field-altitude` | Slides, p. 15 |
| `barycenter-input-1..8`, `barycenter-{pointwise-mean,wasserstein}` | Slides, p. 19 |
| `anemoi-{smoothgrad,wassersteingrad}` | Slides, p. 24 (preliminary, labelled as such on the page) |

All quantitative claims come from Table 1, Section 4.2, or Appendix C.2/E.2 of
the paper, or from the slides — no numbers are estimated off a plot.

## Before publishing

- **arXiv identifier.** `2604.22580` appears in the hero buttons, footer, BibTeX,
  JSON-LD and `<link rel="canonical">`. Update everywhere if it changes.
- **Code link.** The hero and footer currently point at upstream
  [`meteofrance/py4cast`](https://github.com/meteofrance/py4cast). Swap in
  `py4cast-xai` and `anemoi-plugins-xai` once those are public.
- **Venue badge.** Reads *Preprint · Under review*. Update on acceptance.

## Assets that would improve the page

1. **A hero-scale WG<sub>Bary</sub> render**, or a short loop showing the
   barycenter forming across the 20 perturbed samples. The teaser currently uses
   the four Figure-2 panels at their printed resolution.
2. **Vector (PDF/SVG) originals of Figures 1–4** — the current WebP crops are
   rasterised, and vector sources would stay sharp at any display size.
3. **An institution logo strip** (IMT / Météo-France / Cerfacs / ANITI) for the footer.

## Licence

Figures are reproduced from the authors' own paper and presentation. Add a
licence file before reuse by third parties.
