/* ==========================================================================
   Fig. 0 — "What did the model rely on?"

   A schematic 500 hPa forecast over south-western Europe: a soft wash of the
   field, smoothed contours, and wind trails following its geostrophic flow.
   The explanation of the forecast at the target is computed, not drawn:
   a cloud of particles released at the target is carried backwards through
   the flow, one autoregressive step (6 h) at a time. Each extra step moves,
   stretches and spreads it. Faint ellipses mark every intermediate step:
   the chain rule through the rollout, made visible.

   The field is an analytic toy chosen to look plausible. Not model output.
   ========================================================================== */
(function () {
  "use strict";

  var fig = document.querySelector("[data-field]");
  if (!fig) return;
  var stage = fig.querySelector(".field-stage");
  var canvas = stage && stage.querySelector("canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var stepInput = fig.querySelector("[data-field-lead]");
  var leadOut = fig.querySelector("[data-field-lead-out]");
  var placeOut = fig.querySelector("[data-field-place]");
  var resetBtn = fig.querySelector("[data-field-reset]");
  var viewButtons = [].slice.call(fig.querySelectorAll("[data-field-view]"));
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var still = motionQuery.matches;

  var STEP_H = 6, MAX_STEPS = 8;
  var HOME = { lon: 1.44, lat: 43.6, name: "Toulouse" };

  /* ---------- palette, from the CSS tokens ---------- */
  var rootStyle = getComputedStyle(document.documentElement);
  function tok(name, fallback) { return rootStyle.getPropertyValue(name).trim() || fallback; }
  function rgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function rgba(hex, a) { var c = rgb(hex); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  var C = {
    ink: tok("--ink", "#0e1a24"),
    atmo: tok("--atmo", "#4e8490"),
    atmoInk: tok("--atmo-ink", "#2b4d57"),
    xai: tok("--xai", "#2f3fd0"),
    target: tok("--target", "#e0532a"),
    washLo: tok("--wash-lo", "#d6e2e7"),
    washHi: tok("--wash-hi", "#eef0ea")
  };
  var SERIF = '"Newsreader", Georgia, serif', MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

  /* ---------- geography (lon, lat), simplified by hand ---------- */
  var COAST = [
    // the continent: Low Countries, France, Iberia, the Mediterranean, Italy
    [[4.72,53.0],[4.6,52.5],[4.25,52.1],[3.8,51.75],[3.55,51.45],[3.2,51.35],[2.92,51.23],[2.37,51.05],[1.85,50.96],[1.6,50.73],[1.62,50.2],[1.08,49.93],[0.37,49.77],[0.1,49.49],[0.23,49.42],[-0.25,49.29],[-1.1,49.39],[-1.27,49.69],[-1.94,49.72],[-1.79,49.37],[-1.57,48.84],[-1.51,48.64],[-2.03,48.65],[-2.76,48.52],[-3.05,48.8],[-3.98,48.72],[-4.55,48.62],[-4.77,48.4],[-4.45,48.33],[-4.62,48.28],[-4.35,48.1],[-4.73,48.04],[-4.37,47.8],[-3.37,47.72],[-3.12,47.48],[-2.52,47.29],[-2.2,47.27],[-2.0,46.95],[-1.78,46.49],[-1.15,46.16],[-1.24,45.7],[-1.05,45.6],[-1.2,45.1],[-1.25,44.65],[-1.3,44.2],[-1.44,43.65],[-1.78,43.37],[-2.5,43.38],[-3.0,43.38],[-3.8,43.47],[-4.4,43.4],[-5.0,43.47],[-5.7,43.56],[-6.3,43.57],[-7.0,43.55],[-7.7,43.73],[-8.3,43.5],[-8.4,43.37],[-9.2,43.2],[-9.3,42.9],[-8.9,42.5],[-8.85,42.1],[-8.9,41.8],[-8.68,41.15],[-8.75,40.64],[-8.87,40.15],[-9.07,39.6],[-9.38,39.36],[-9.5,38.78],[-9.15,38.68],[-8.9,38.48],[-8.87,37.95],[-8.99,37.02],[-8.67,37.1],[-7.93,37.0],[-7.42,37.18],[-6.95,37.2],[-6.4,36.85],[-6.3,36.53],[-6.03,36.18],[-5.6,36.01],[-5.35,36.14],[-5.15,36.42],[-4.42,36.72],[-3.52,36.72],[-2.46,36.84],[-2.19,36.72],[-1.82,37.18],[-0.98,37.6],[-0.69,37.63],[-0.68,37.98],[-0.48,38.35],[0.23,38.73],[0.1,38.84],[-0.22,39.17],[-0.33,39.45],[-0.2,39.68],[0.0,39.95],[0.4,40.36],[0.88,40.7],[1.25,41.1],[2.2,41.38],[2.8,41.7],[3.2,41.9],[3.32,42.32],[3.17,42.44],[3.04,42.8],[3.05,43.0],[3.5,43.28],[4.0,43.55],[4.43,43.45],[4.85,43.35],[5.37,43.3],[5.93,43.1],[6.64,43.27],[7.02,43.55],[7.5,43.78],[8.2,43.95],[8.45,44.3],[8.95,44.41],[9.85,44.05],[10.3,43.55],[10.5,42.95],[11.1,42.4],[11.7,42.1],[12.5,41.6],[13.6,41.2],[15.6,40.0]],
    // North Africa
    [[-6.0,35.8],[-5.3,35.9],[-4.0,35.2],[-2.0,35.1],[0.0,35.9],[3.0,36.8],[6.4,37.08],[8.6,36.95],[9.9,37.3],[10.3,37.2],[11.1,37.05]],
    // islands: Corsica, Sardinia, Mallorca, Menorca, Ibiza
    [[9.4,43.0],[9.45,42.7],[9.55,42.1],[9.4,41.7],[9.16,41.39],[8.8,41.55],[8.73,41.92],[8.6,42.25],[8.75,42.57],[9.05,42.72],[9.33,42.95],[9.4,43.0]],
    [[8.2,41.1],[9.2,41.25],[9.65,40.9],[9.8,40.5],[9.65,40.0],[9.6,39.3],[9.1,39.2],[8.6,38.9],[8.4,39.1],[8.4,39.7],[8.5,40.3],[8.2,40.6],[8.2,41.1]],
    [[2.35,39.55],[2.65,39.97],[3.2,39.95],[3.47,39.72],[3.25,39.35],[2.95,39.35],[2.7,39.5],[2.35,39.55]],
    [[3.82,40.05],[4.3,39.87],[4.2,39.82],[3.83,39.93],[3.82,40.05]],
    [[1.2,38.97],[1.53,39.1],[1.6,38.97],[1.4,38.85],[1.2,38.97]],
    // Cornwall and the south coast of England, for tall views
    [[-5.71,50.07],[-5.2,49.96],[-4.14,50.33],[-3.64,50.22],[-3.41,50.62],[-2.45,50.58],[-1.4,50.8],[-0.14,50.82],[0.97,50.91],[1.44,51.38]]
  ];
  var LAND = [
    COAST[0].concat([[20,40],[20,56],[4.72,56]]),
    COAST[1].concat([[11.1,30],[-6,30]]),
    COAST[2], COAST[3], COAST[4], COAST[5], COAST[6],
    COAST[7].concat([[1.44,56],[-5.71,56]])
  ];

  /* ---------- projection: equirectangular, true at 45° N ---------- */
  var DEG = Math.PI / 180, KX = Math.cos(45 * DEG);
  var V = { w: 0, h: 0, dpr: 0, s: 1, lon0: 0, lat0: 45, from: 0 };
  function X(lon) { return V.w / 2 + (lon - V.lon0) * KX * V.s; }
  function Y(lat) { return V.h / 2 - (lat - V.lat0) * V.s; }
  function LON(x) { return V.lon0 + (x - V.w / 2) / (KX * V.s); }
  function LAT(y) { return V.lat0 - (y - V.h / 2) / V.s; }

  /* ---------- the field: 500 hPa geopotential height (m) ----------
     A mid-latitude pattern: westerlies from the Atlantic, a trough to the
     north-west and a subtropical ridge to the south-east, both drifting east,
     and a short wave travelling east in between. Lh is the forecast lead in
     hours. Winds come out mostly from the west-south-west at 20–35 m/s,
     so an explanation traced upstream from Toulouse heads for the Atlantic. */
  function Z(lon, lat, Lh) {
    var z = 5640 - 24 * (lat - 45);
    var dx = (lon - (-15 + 0.12 * Lh)) * KX, dy = lat - (49.5 - 0.02 * Lh);
    z -= 130 * Math.exp(-(dx * dx) / 60 - (dy * dy) / 30);
    dx = (lon - (11 + 0.06 * Lh)) * KX; dy = lat - 38.5;
    z += 70 * Math.exp(-(dx * dx + dy * dy) / 60);
    z += 16 * Math.sin((lon - 0.3 * Lh) * 0.42 + 0.9) * Math.exp(-(lat - 45) * (lat - 45) / 40);
    return z;
  }
  var GF = 9.81 / 1.03e-4, M_PER_DEG = 111000;
  function wind(lon, lat, Lh, out) {           // geostrophic wind (m/s): u east, v north
    var h = 0.05;
    var dzx = (Z(lon + h, lat, Lh) - Z(lon - h, lat, Lh)) / (2 * h * M_PER_DEG * Math.cos(lat * DEG));
    var dzy = (Z(lon, lat + h, Lh) - Z(lon, lat - h, Lh)) / (2 * h * M_PER_DEG);
    out[0] = -GF * dzy; out[1] = GF * dzx;
    return out;
  }
  var W2 = [0, 0];

  /* ---------- deterministic randomness ---------- */
  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(6.2831853 * r()); }

  /* ---------- state ---------- */
  var S = {
    steps: stepInput ? +stepInput.value : 4,   // requested autoregressive steps
    bloom: 0,                                  // displayed steps (eased)
    fieldLead: (stepInput ? +stepInput.value : 4) * STEP_H,
    view: "forecast",
    reveal: 0,                                 // 0 forecast … 1 explanation
    fade: still ? 1 : 0,
    t: 0,
    target: { lon: HOME.lon, lat: HOME.lat },
    cache: {},                                 // explanation per step count
    probe: null,
    intro: still ? null : { t: 0 },
    running: false, visible: false
  };

  /* ---------- layers ---------- */
  function layer() { var c = document.createElement("canvas"); return { c: c, x: c.getContext("2d") }; }
  var washL = layer(), staticL = layer(), contourL = layer(), attrL = layer(), maskL = layer(), densL = layer();

  var grid = { cell: 8, nx: 0, ny: 0, z: null };
  var flows = [], TRAIL = 22;
  var cloud = { N: 0, x: null, y: null };      // displayed particle positions (screen)
  var dens = { cell: 5, nx: 0, ny: 0, a: null, b: null, img: null };

  function readLayout() {
    var cs = getComputedStyle(stage);
    function num(n, d) { var v = parseFloat(cs.getPropertyValue(n)); return isNaN(v) ? d : v; }
    return { fx: num("--focus-x", 0.7), fy: num("--focus-y", 0.44), span: num("--span", 11), from: num("--interactive-from", 0) };
  }

  function resize() {
    var r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var big = r.width * r.height > 1.1e6;
    var dpr = Math.min(window.devicePixelRatio || 1, big ? 1.5 : 2);
    var lay = readLayout();
    if (r.width === V.w && r.height === V.h && dpr === V.dpr && lay.fx === V.fx && lay.span === V.span) return "same";
    V.w = r.width; V.h = r.height; V.dpr = dpr; V.fx = lay.fx; V.span = lay.span; V.from = lay.from;
    V.s = V.h / lay.span;
    V.lon0 = HOME.lon - (lay.fx - 0.5) * V.w / (KX * V.s);
    V.lat0 = HOME.lat + (lay.fy - 0.5) * V.h / V.s;

    [{ c: canvas, x: ctx }, staticL, contourL, attrL, maskL].forEach(function (l) {
      l.c.width = Math.round(V.w * dpr); l.c.height = Math.round(V.h * dpr);
      l.x.setTransform(dpr, 0, 0, dpr, 0, 0);
    });

    grid.cell = V.w < 700 ? 7 : 8;
    grid.nx = Math.ceil(V.w / grid.cell) + 1;
    grid.ny = Math.ceil(V.h / grid.cell) + 1;
    grid.z = new Float32Array(grid.nx * grid.ny);
    washL.c.width = grid.nx; washL.c.height = grid.ny;

    dens.nx = Math.ceil(V.w / dens.cell) + 1;
    dens.ny = Math.ceil(V.h / dens.cell) + 1;
    dens.a = new Float32Array(dens.nx * dens.ny);
    dens.b = new Float32Array(dens.nx * dens.ny);
    densL.c.width = dens.nx; densL.c.height = dens.ny;
    dens.img = densL.x.createImageData(dens.nx, dens.ny);

    var n = Math.max(70, Math.round(V.w * V.h / (V.w < 700 ? 2600 : 5200)));
    var r0 = mulberry(3);
    flows = [];
    for (var k = 0; k < n; k++) {
      var p = { x: 0, y: 0, hx: new Float32Array(TRAIL), hy: new Float32Array(TRAIL), n: 0, age: 0, life: 1, acc: 0 };
      spawnFlow(p, still ? r0 : Math.random);
      p.age = (still ? r0() : Math.random()) * p.life;
      flows.push(p);
    }

    cloud.N = V.w < 700 ? 900 : 1500;
    cloud.x = new Float32Array(cloud.N); cloud.y = new Float32Array(cloud.N);
    S.cache = {};
    drawStatic();
    S.fieldDirty = true;
    return true;
  }

  function spawnFlow(p, rnd) {
    p.x = rnd() * V.w; p.y = rnd() * V.h;
    p.n = 0; p.age = 0; p.life = 3 + rnd() * 5; p.acc = 0;
  }

  /* ---------- static: land tint, coast, a sparse graticule ---------- */
  function poly(c, pts) {
    c.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var x = X(pts[i][0]), y = Y(pts[i][1]);
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
  }
  function drawStatic() {
    var c = staticL.x;
    c.clearRect(0, 0, V.w, V.h);
    c.fillStyle = "rgba(255,255,255,0.42)";
    LAND.forEach(function (pts) { poly(c, pts); c.closePath(); c.fill(); });
    c.lineJoin = "round"; c.lineCap = "round";
    c.strokeStyle = rgba(C.ink, 0.34); c.lineWidth = 0.9;
    COAST.forEach(function (pts) { poly(c, pts); c.stroke(); });
    c.strokeStyle = rgba(C.ink, 0.14); c.lineWidth = 1;
    c.beginPath();
    for (var lon = -30; lon <= 30; lon += 5) {
      for (var lat = 30; lat <= 60; lat += 5) {
        var x = Math.round(X(lon)) + 0.5, y = Math.round(Y(lat)) + 0.5;
        if (x < 0 || y < 0 || x > V.w || y > V.h) continue;
        c.moveTo(x - 3, y); c.lineTo(x + 3, y); c.moveTo(x, y - 3); c.lineTo(x, y + 3);
      }
    }
    c.stroke();
  }

  /* ---------- wash + smoothed contours of the forecast field ---------- */
  var LEVELS = [];
  for (var lv = 5360; lv <= 5920; lv += 40) LEVELS.push(lv);
  var LO = rgb(C.washLo), HI = rgb(C.washHi);

  function buildField(Lh) {
    var nx = grid.nx, ny = grid.ny, z = grid.z, cs = grid.cell;
    for (var j = 0; j < ny; j++) {
      var la = LAT(j * cs);
      for (var i = 0; i < nx; i++) z[j * nx + i] = Z(LON(i * cs), la, Lh);
    }
    // the wash: low heights cool, high heights pale
    var img = washL.x.createImageData(nx, ny), d = img.data;
    for (var k = 0; k < nx * ny; k++) {
      var t = Math.max(0, Math.min(1, (z[k] - 5420) / 420));
      t = t * t * (3 - 2 * t);
      d[k * 4] = LO[0] + (HI[0] - LO[0]) * t;
      d[k * 4 + 1] = LO[1] + (HI[1] - LO[1]) * t;
      d[k * 4 + 2] = LO[2] + (HI[2] - LO[2]) * t;
      d[k * 4 + 3] = 255;
    }
    washL.x.putImageData(img, 0, 0);

    var c = contourL.x;
    c.clearRect(0, 0, V.w, V.h);
    c.lineJoin = "round"; c.lineCap = "round";
    for (var q = 0; q < LEVELS.length; q++) {
      var bold = (LEVELS[q] - 5400) % 120 === 0;
      c.strokeStyle = rgba(C.atmo, bold ? 0.5 : 0.3);
      c.lineWidth = bold ? 1.15 : 0.75;
      c.beginPath();
      isolines(z, nx, ny, cs, LEVELS[q]).forEach(function (line) { smoothPath(c, line); });
      c.stroke();
    }
    S.fieldDirty = false;
  }

  // marching squares, with segments chained into polylines so they can be smoothed
  function isolines(z, nx, ny, cs, level) {
    var pts = {}, adj = {}, segs = [];
    var i, j, x0, y0, a, b, d, e;
    function pt(code) {                        // 0 top, 1 right, 2 bottom, 3 left
      var id;
      switch (code) {
        case 0: id = 2 * (j * nx + i); if (!pts[id]) pts[id] = [x0 + cs * (level - a) / (b - a), y0]; break;
        case 1: id = 2 * (j * nx + i + 1) + 1; if (!pts[id]) pts[id] = [x0 + cs, y0 + cs * (level - b) / (e - b)]; break;
        case 2: id = 2 * ((j + 1) * nx + i); if (!pts[id]) pts[id] = [x0 + cs * (level - d) / (e - d), y0 + cs]; break;
        default: id = 2 * (j * nx + i) + 1; if (!pts[id]) pts[id] = [x0, y0 + cs * (level - a) / (d - a)];
      }
      return id;
    }
    function link(p, q) {
      var ea = pt(p), eb = pt(q), k = segs.length;
      segs.push([ea, eb]);
      (adj[ea] || (adj[ea] = [])).push(k);
      (adj[eb] || (adj[eb] = [])).push(k);
    }
    for (j = 0; j < ny - 1; j++) {
      for (i = 0; i < nx - 1; i++) {
        a = z[j * nx + i]; b = z[j * nx + i + 1]; d = z[(j + 1) * nx + i]; e = z[(j + 1) * nx + i + 1];
        var idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (e > level ? 2 : 0) | (d > level ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        x0 = i * cs; y0 = j * cs;
        switch (idx) {
          case 1: case 14: link(3, 2); break;
          case 2: case 13: link(2, 1); break;
          case 3: case 12: link(3, 1); break;
          case 4: case 11: link(0, 1); break;
          case 5: link(0, 1); link(3, 2); break;
          case 6: case 9: link(0, 2); break;
          case 7: case 8: link(3, 0); break;
          case 10: link(3, 0); link(2, 1); break;
        }
      }
    }
    var used = new Uint8Array(segs.length), lines = [];
    function walk(start, from) {
      var out = [], cur = from, s = start;
      while (s !== -1 && !used[s]) {
        used[s] = 1;
        var nxt = segs[s][0] === cur ? segs[s][1] : segs[s][0];
        out.push(nxt);
        var cand = adj[nxt], ns = -1;
        for (var k = 0; k < cand.length; k++) if (!used[cand[k]]) { ns = cand[k]; break; }
        cur = nxt; s = ns;
      }
      return out;
    }
    for (var s = 0; s < segs.length; s++) {
      if (used[s]) continue;
      var a0 = segs[s][0];
      var fwd = walk(s, a0);                         // a0 → …
      var other = adj[a0], back = [];
      for (var k = 0; k < other.length; k++) if (!used[other[k]]) { back = walk(other[k], a0); break; }
      var ids = back.reverse().concat([a0], fwd);
      if (ids.length > 2) lines.push(ids.map(function (id) { return pts[id]; }));
    }
    return lines;
  }
  function smoothPath(c, p) {
    c.moveTo(p[0][0], p[0][1]);
    for (var i = 1; i < p.length - 1; i++) {
      c.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
    }
    c.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
  }

  /* ---------- wind trails ---------- */
  var K_SPEED = 0.9;                           // px per second per m/s
  function stepFlows(dt) {
    var Lh = S.fieldLead;
    for (var i = 0; i < flows.length; i++) {
      var p = flows[i];
      wind(LON(p.x), LAT(p.y), Lh, W2);
      p.x += W2[0] * K_SPEED * dt; p.y -= W2[1] * K_SPEED * dt;
      p.age += dt; p.acc += dt;
      if (p.acc > 0.06) {                        // a trail sample every 60 ms
        p.acc = 0;
        if (p.n < TRAIL) p.n++;
        for (var k = p.n - 1; k > 0; k--) { p.hx[k] = p.hx[k - 1]; p.hy[k] = p.hy[k - 1]; }
        p.hx[0] = p.x; p.hy[0] = p.y;
      }
      if (p.age > p.life || p.x < -40 || p.x > V.w + 40 || p.y < -40 || p.y > V.h + 40) spawnFlow(p, Math.random);
    }
  }
  function drawFlows(fade) {
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 1;
    // three passes: tail, body, head, so each trail thins out behind
    var cuts = [[TRAIL - 1, 14, 0.07], [14, 7, 0.14], [7, 0, 0.24]];
    for (var c = 0; c < 3; c++) {
      ctx.strokeStyle = rgba(C.atmoInk, cuts[c][2] * fade);
      ctx.beginPath();
      for (var i = 0; i < flows.length; i++) {
        var p = flows[i];
        var life = Math.min(1, p.age / 0.8, (p.life - p.age) / 1.2);
        if (life < 0.35) continue;
        var a = Math.min(cuts[c][0], p.n - 1), b = cuts[c][1];
        if (a <= b) continue;
        ctx.moveTo(p.hx[a], p.hy[a]);
        for (var k = a - 1; k >= b; k--) ctx.lineTo(p.hx[k], p.hy[k]);
      }
      ctx.stroke();
    }
  }
  // reduced motion: short streamlines from a jittered grid, drawn once
  function drawStreamlines() {
    var r = mulberry(11), gap = V.w < 700 ? 34 : 46;
    ctx.strokeStyle = rgba(C.atmoInk, 0.2); ctx.lineWidth = 1; ctx.lineCap = "round";
    ctx.beginPath();
    for (var y = gap / 2; y < V.h; y += gap) {
      for (var x = gap / 2; x < V.w; x += gap) {
        var px = x + (r() - 0.5) * gap * 0.8, py = y + (r() - 0.5) * gap * 0.8;
        ctx.moveTo(px, py);
        for (var k = 0; k < 9; k++) {
          wind(LON(px), LAT(py), S.fieldLead, W2);
          var m = Math.hypot(W2[0], W2[1]) || 1;
          px += W2[0] / m * 3.2; py -= W2[1] / m * 3.2;
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();
  }

  /* ---------- the explanation ----------
     For n steps: release the cloud at the target at lead 6n h, carry it
     backwards through the time-dependent flow to the input time, with a little
     diffusion. Record the cloud after every step. */
  var BACK = 0.11;                             // schematic: how far upstream an hour reaches
  var VEER = 30 * DEG;                         // near the surface, wind turns towards low pressure
  function explain(n) {
    var key = n;
    if (S.cache[key]) return S.cache[key];
    // each particle stands for one level of the column (0 surface … 1 upper air):
    // upper levels are carried further, lower ones slower and veered, so the
    // explanation shears into a plume as the steps accumulate
    var N = cloud.N, r = mulberry(1234);
    var lon = new Float64Array(N), lat = new Float64Array(N), eta = new Float64Array(N);
    for (var i = 0; i < N; i++) {
      lon[i] = S.target.lon + gauss(r) * 0.18 / KX;
      lat[i] = S.target.lat + gauss(r) * 0.18;
      eta[i] = r();
    }
    var stages = [stats(lon, lat)], T = n * STEP_H;
    for (var h = 0; h < T; h++) {
      var tau = T - h - 0.5;
      for (i = 0; i < N; i++) {
        wind(lon[i], lat[i], tau, W2);
        var sp = 0.35 + 0.9 * eta[i], rot = (1 - eta[i]) * VEER, cr = Math.cos(rot), sr = Math.sin(rot);
        var u = (W2[0] * cr - W2[1] * sr) * sp, v = (W2[0] * sr + W2[1] * cr) * sp;
        lon[i] -= u * 3600 * BACK / (M_PER_DEG * Math.cos(lat[i] * DEG)) - gauss(r) * 0.03 / KX;
        lat[i] -= v * 3600 * BACK / M_PER_DEG - gauss(r) * 0.03;
      }
      if ((h + 1) % STEP_H === 0) stages.push(stats(lon, lat));
    }
    return (S.cache[key] = { lon: Float32Array.from(lon), lat: Float32Array.from(lat), stages: stages });
  }
  function stats(lon, lat) {                   // centroid and covariance, in (lon·cos, lat) degrees
    var N = lon.length, mx = 0, my = 0, xx = 0, yy = 0, xy = 0;
    for (var i = 0; i < N; i++) { mx += lon[i]; my += lat[i]; }
    mx /= N; my /= N;
    for (i = 0; i < N; i++) {
      var dx = (lon[i] - mx) * KX, dy = lat[i] - my;
      xx += dx * dx; yy += dy * dy; xy += dx * dy;
    }
    return { lon: mx, lat: my, xx: xx / N, yy: yy / N, xy: xy / N };
  }
  function lerpStat(a, b, f) {
    return { lon: a.lon + (b.lon - a.lon) * f, lat: a.lat + (b.lat - a.lat) * f,
             xx: a.xx + (b.xx - a.xx) * f, yy: a.yy + (b.yy - a.yy) * f, xy: a.xy + (b.xy - a.xy) * f };
  }
  function ellipse(c, st, k) {                 // k-sigma ellipse of a stat, in screen space
    var a = st.xx, b = st.xy, d = st.yy;
    var tr = (a + d) / 2, det = Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + b * b));
    var l1 = tr + det, l2 = Math.max(1e-6, tr - det);
    var ang = Math.atan2(l1 - a, b || 1e-9);
    c.ellipse(X(st.lon), Y(st.lat), k * Math.sqrt(l1) * V.s, k * Math.sqrt(l2) * V.s, -ang, 0, Math.PI * 2);
  }

  // displayed cloud: morph between the explanations for ⌊bloom⌋ and ⌈bloom⌉ steps
  var chain = [];
  function composeCloud() {
    var b = S.bloom, n0 = Math.floor(b), n1 = Math.min(MAX_STEPS, Math.ceil(b)), f = b - n0;
    f = f * f * (3 - 2 * f);
    var e0 = explain(n0), e1 = n1 === n0 ? e0 : explain(n1);
    for (var i = 0; i < cloud.N; i++) {
      cloud.x[i] = X(e0.lon[i] + (e1.lon[i] - e0.lon[i]) * f);
      cloud.y[i] = Y(e0.lat[i] + (e1.lat[i] - e0.lat[i]) * f);
    }
    chain = [];
    for (var j = 0; j <= n1; j++) {
      var a = e0.stages[Math.min(j, n0)], c = e1.stages[j];
      chain.push({ st: lerpStat(a, c, f), vis: j <= n0 ? 1 : f });
    }
  }

  function buildDensity() {
    var nx = dens.nx, ny = dens.ny, a = dens.a, b = dens.b, cs = dens.cell;
    a.fill(0);
    for (var i = 0; i < cloud.N; i++) {
      var gx = cloud.x[i] / cs, gy = cloud.y[i] / cs;
      var ix = Math.floor(gx), iy = Math.floor(gy);
      if (ix < 0 || iy < 0 || ix >= nx - 1 || iy >= ny - 1) continue;
      var fx = gx - ix, fy = gy - iy, k = iy * nx + ix;
      a[k] += (1 - fx) * (1 - fy); a[k + 1] += fx * (1 - fy);
      a[k + nx] += (1 - fx) * fy; a[k + nx + 1] += fx * fy;
    }
    for (var pass = 0; pass < 2; pass++) { blur(a, b, nx, ny, 1, 0); blur(b, a, nx, ny, 0, 1); }
    var max = 0;
    for (i = 0; i < a.length; i++) if (a[i] > max) max = a[i];
    var col = rgb(C.xai), d = dens.img.data;
    for (i = 0; i < a.length; i++) {
      var v = max ? a[i] / max : 0;
      d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2];
      d[i * 4 + 3] = 255 * 0.5 * Math.pow(v, 0.75);
    }
    densL.x.putImageData(dens.img, 0, 0);
  }
  function blur(src, dst, nx, ny, hx, hy) {    // radius-2 box blur along one axis
    var R = 2, norm = 1 / (2 * R + 1);
    for (var j = 0; j < ny; j++) {
      for (var i = 0; i < nx; i++) {
        var s = 0;
        for (var k = -R; k <= R; k++) {
          var x = i + k * hx, y = j + k * hy;
          if (x < 0 || y < 0 || x >= nx || y >= ny) continue;
          s += src[y * nx + x];
        }
        dst[j * nx + i] = s * norm;
      }
    }
  }

  function drawExplanation(c, t) {
    c.clearRect(0, 0, V.w, V.h);
    c.imageSmoothingEnabled = true;
    c.drawImage(densL.c, 0, 0, dens.nx, dens.ny, 0, 0, dens.nx * dens.cell, dens.ny * dens.cell);

    // the chain through the rollout: target → each step back → input time
    var tx = X(S.target.lon), ty = Y(S.target.lat);
    c.strokeStyle = rgba(C.xai, 0.55); c.lineWidth = 1; c.setLineDash([1, 3.5]); c.lineCap = "round";
    c.beginPath(); c.moveTo(tx, ty);
    var pts = [[tx, ty]];
    for (var j = 1; j < chain.length; j++) pts.push([X(chain[j].st.lon), Y(chain[j].st.lat)]);
    for (j = 1; j < pts.length - 1; j++) c.quadraticCurveTo(pts[j][0], pts[j][1], (pts[j][0] + pts[j + 1][0]) / 2, (pts[j][1] + pts[j + 1][1]) / 2);
    if (pts.length > 1) c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    c.stroke();
    for (j = 1; j < chain.length - 1; j++) {
      c.strokeStyle = rgba(C.xai, 0.32 * chain[j].vis);
      c.beginPath(); ellipse(c, chain[j].st, 1.6); c.stroke();
    }
    c.setLineDash([]);
    if (chain.length > 1) {
      var last = chain[chain.length - 1];
      c.strokeStyle = rgba(C.xai, 0.55 * last.vis); c.lineWidth = 0.9;
      c.beginPath(); ellipse(c, last.st, 2.45); c.stroke();
    }

    // the stipple: every particle, shimmering very slightly
    c.fillStyle = rgba(C.xai, 0.62);
    var r = V.w < 700 ? 1 : 1.15, amp = still ? 0 : 0.7;
    for (var i = 0; i < cloud.N; i++) {
      var ph = i * 2.399;
      c.fillRect(cloud.x[i] + amp * Math.sin(t * 0.7 + ph) - r / 2, cloud.y[i] + amp * Math.cos(t * 0.53 + ph) - r / 2, r, r);
    }
  }

  /* ---------- the target: a crosshair ---------- */
  function drawTarget(t, grow) {
    var x = X(S.target.lon), y = Y(S.target.lat);
    var g = Math.max(0, Math.min(1, grow));
    if (g <= 0) return;
    if (!still) {
      var ph = (t % 4.5) / 4.5;
      ctx.strokeStyle = rgba(C.target, 0.35 * (1 - ph) * g); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 5 + ph * 22, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = rgba(C.target, g); ctx.lineWidth = 1.3; ctx.lineCap = "butt";
    var r1 = 5, r2 = 5 + 11 * g;
    ctx.beginPath();
    ctx.moveTo(x - r2, y); ctx.lineTo(x - r1, y); ctx.moveTo(x + r1, y); ctx.lineTo(x + r2, y);
    ctx.moveTo(x, y - r2); ctx.lineTo(x, y - r1); ctx.moveTo(x, y + r1); ctx.lineTo(x, y + r2);
    ctx.stroke();
    ctx.fillStyle = rgba(C.target, g);
    ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();

    var home = isHome();
    ctx.globalAlpha = g * 0.85;
    ctx.fillStyle = C.ink; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.font = home ? "italic 15px " + SERIF : "10.5px " + MONO;
    ctx.fillText(home ? HOME.name : place(), x + 13, y - 10);
    ctx.globalAlpha = 1;
  }
  function isHome() { return Math.abs(S.target.lon - HOME.lon) < 1e-6 && Math.abs(S.target.lat - HOME.lat) < 1e-6; }
  function place() {
    var la = S.target.lat, lo = S.target.lon;
    return Math.abs(la).toFixed(1) + "° " + (la >= 0 ? "N" : "S") + "  " + Math.abs(lo).toFixed(1) + "° " + (lo >= 0 ? "E" : "W");
  }

  /* ---------- frame ---------- */
  function render(t) {
    if (S.fieldDirty) buildField(S.fieldLead);
    ctx.clearRect(0, 0, V.w, V.h);
    ctx.globalAlpha = S.fade;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(washL.c, 0, 0, grid.nx, grid.ny, 0, 0, grid.nx * grid.cell, grid.ny * grid.cell);
    ctx.drawImage(staticL.c, 0, 0, V.w, V.h);
    ctx.drawImage(contourL.c, 0, 0, V.w, V.h);
    ctx.globalAlpha = 1;
    if (still) drawStreamlines(); else drawFlows(S.fade);

    var probe = S.probe && S.view === "forecast" ? 1 : 0;
    if (S.reveal > 0.005 || probe) {
      var key = S.bloom.toFixed(4) + "|" + S.target.lon + "|" + S.target.lat + "|" + V.w + "x" + V.h;
      if (key !== S.cloudKey) { composeCloud(); buildDensity(); S.cloudKey = key; }
      drawExplanation(attrL.x, t);
      if (S.reveal > 0.005) {
        ctx.globalAlpha = S.reveal;
        ctx.drawImage(attrL.c, 0, 0, V.w, V.h);
        ctx.globalAlpha = 1;
      }
      if (probe && S.reveal < 0.99) {
        // a soft, ring-less probe: the explanation shows through around the cursor
        var m = maskL.x, R = Math.max(110, Math.min(190, V.h * 0.2));
        m.globalCompositeOperation = "source-over";
        m.clearRect(0, 0, V.w, V.h);
        var g = m.createRadialGradient(S.probe.x, S.probe.y, 0, S.probe.x, S.probe.y, R);
        g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.55, "rgba(0,0,0,0.75)"); g.addColorStop(1, "rgba(0,0,0,0)");
        m.fillStyle = g; m.fillRect(0, 0, V.w, V.h);
        m.globalCompositeOperation = "source-in";
        m.drawImage(attrL.c, 0, 0, V.w, V.h);
        m.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1 - S.reveal;
        ctx.drawImage(maskL.c, 0, 0, V.w, V.h);
        ctx.globalAlpha = 1;
      }
    }
    drawTarget(t, S.intro ? (S.intro.t - 1.2) / 0.9 : 1);
  }

  /* ---------- motion ---------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function setView(v, rebloom) {
    S.view = v;
    viewButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-field-view") === v)); });
    if (v === "explanation" && rebloom) S.bloom = 0;
    if (still) refresh();
  }
  function setReadout() {
    var n = S.steps;
    if (leadOut) leadOut.innerHTML = "t+" + n + "<span> · " + n * STEP_H + " h</span>";
    if (stepInput) {
      stepInput.value = n;
      stepInput.setAttribute("aria-valuetext", n + " autoregressive steps, " + n * STEP_H + " hours");
    }
  }
  function endIntro() {
    if (!S.intro) return;
    S.intro = null; S.fade = 1;
    if (S.view !== "explanation") setView("explanation", false);
  }

  var last = 0;
  function frame(now) {
    if (!S.running) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now; S.t += dt;

    if (S.intro) {
      var it = (S.intro.t += dt);
      S.fade = clamp(it / 1.6, 0, 1);
      if (it > 2.8 && S.view !== "explanation") setView("explanation", true);
      if (it > 9) endIntro();
    }
    // the explanation grows from the target, one step at a time
    // a steady walk, about one autoregressive step per second, easing at the end
    var gap = S.steps - S.bloom, move = gap * (1 - Math.exp(-dt * 3));
    S.bloom += Math.max(-0.85 * dt, Math.min(0.85 * dt, move));
    if (Math.abs(S.steps - S.bloom) < 0.002) S.bloom = S.steps;
    S.reveal += ((S.view === "explanation" ? 1 : 0) - S.reveal) * (1 - Math.exp(-dt * 2.2));

    var lead = S.steps * STEP_H;
    if (Math.abs(lead - S.fieldLead) > 0.02) {
      S.fieldLead += (lead - S.fieldLead) * (1 - Math.exp(-dt * 2.5));
      S.fieldDirty = true;
    }

    stepFlows(dt);
    render(S.t);
    requestAnimationFrame(frame);
  }
  function start() {
    if (still || S.running || !S.visible || document.hidden) return;
    S.running = true; last = 0;
    requestAnimationFrame(frame);
  }
  function stop() { S.running = false; }

  function drawStill() {
    S.fade = 1; S.intro = null;
    S.bloom = S.steps; S.fieldLead = S.steps * STEP_H; S.fieldDirty = true;
    S.reveal = S.view === "explanation" ? 1 : 0;
    render(0);
  }
  function refresh() { if (still) drawStill(); }

  /* ---------- input ---------- */
  function local(e) { var r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function interactive(p) { return p.x >= V.from * V.w; }
  var down = null;
  fig.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var p = local(e);
    if (p.y < 0 || p.y > V.h || !interactive(p)) { S.probe = null; stage.style.cursor = ""; return; }
    S.probe = p;
    stage.style.cursor = "crosshair";
    if (still) refresh();
  });
  fig.addEventListener("pointerleave", function () { S.probe = null; if (still) refresh(); });
  stage.addEventListener("pointerdown", function (e) { down = local(e); });
  stage.addEventListener("pointerup", function (e) {
    var p = local(e);
    if (!down || Math.hypot(p.x - down.x, p.y - down.y) > 6 || !interactive(p)) { down = null; return; }
    down = null;
    setTarget(LON(p.x), LAT(p.y));
  });

  // compute the explanations for every lead time ahead of need, when the browser is idle
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 60); };
  var warmToken = 0;
  function warmCache() {
    var token = ++warmToken, n = 1;
    (function next() {
      if (token !== warmToken || n > MAX_STEPS) return;
      explain(n++);
      idle(next);
    })();
  }

  function setTarget(lon, lat) {
    endIntro();
    S.target = { lon: lon, lat: lat };
    S.cache = {};
    S.bloom = 0;
    warmCache();
    setView("explanation", true);
    var home = isHome();
    if (placeOut) placeOut.textContent = home ? HOME.name : place().replace("  ", " ");
    if (resetBtn) resetBtn.hidden = home;
    if (still) refresh();
  }
  if (resetBtn) resetBtn.addEventListener("click", function () { setTarget(HOME.lon, HOME.lat); });

  if (stepInput) stepInput.addEventListener("input", function () {
    var v = +stepInput.value;
    endIntro();
    S.steps = v; setReadout();
    if (S.view !== "explanation") setView("explanation", false);
    if (still) refresh();
  });
  viewButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      endIntro();
      var v = b.getAttribute("data-field-view");
      if (v !== S.view) setView(v, true);
    });
  });

  /* ---------- lifecycle ---------- */
  var ready = false;
  function boot() {
    if (ready) return;
    if (resize() !== true) return;
    ready = true;
    setReadout();
    if (still) { setView("explanation", false); drawStill(); }
    else render(0);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        S.visible = en[0].isIntersecting;
        if (S.visible) start(); else stop();
      }, { threshold: 0.02 }).observe(stage);
    } else { S.visible = true; start(); }
    // warm the cache for the other lead times when the browser is idle
    setTimeout(warmCache, 400);
  }
  var rt = 0;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (!ready) { boot(); return; }
      if (resize() !== true) return;
      if (still) drawStill(); else if (!S.running) render(S.t);
    }, 120);
  }
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(stage);
  else window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
  var onMotion = function () {
    still = motionQuery.matches;
    if (still) { stop(); setView("explanation", false); drawStill(); } else { S.fade = 1; start(); }
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotion);
  else if (motionQuery.addListener) motionQuery.addListener(onMotion);

  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load("italic 15px " + SERIF), document.fonts.load("10px " + MONO)]).catch(function () {}).then(boot);
  } else boot();
})();
