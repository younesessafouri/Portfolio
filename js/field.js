/* ==========================================================================
   Fig. 0 — "Looking inside a forecast"

   A schematic 500 hPa forecast over France, drawn on canvas:
     · geopotential contours (marching squares) and wind streaks that follow
       the geostrophic flow of the same field,
     · a target box over Paris,
     · an attribution layer — where the forecast "came from" — found by
       tracing the flow backwards from the target over the lead time, and
       revealed through a lens (or entirely, in the Explanation view).

   The fields are small analytic toys chosen to look plausible.
   Nothing here is model output.
   ========================================================================== */
(function () {
  "use strict";

  var fig = document.querySelector("[data-field]");
  if (!fig) return;
  var stage = fig.querySelector(".field-stage");
  var canvas = stage && stage.querySelector("canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var leadInput = fig.querySelector("[data-field-lead]");
  var leadOut = fig.querySelector("[data-field-lead-out]");
  var viewButtons = [].slice.call(fig.querySelectorAll("[data-field-view]"));
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var still = motionQuery.matches;

  /* ---------- palette, read from the CSS tokens ---------- */
  var rootStyle = getComputedStyle(document.documentElement);
  function tok(name, fallback) {
    var v = rootStyle.getPropertyValue(name).trim();
    return v || fallback;
  }
  function rgba(hex, a) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
  }
  var C = {
    plate: tok("--plate", "#efebe1"),
    land: tok("--land", "#f5f2ea"),
    ink: tok("--ink", "#15171a"),
    mute: tok("--mute", "#66686c"),
    atmo: tok("--atmo", "#3b7980"),
    atmoInk: tok("--atmo-ink", "#2a4a4f"),
    xai: tok("--xai", "#2344d4"),
    target: tok("--target", "#e2622a")
  };
  var MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

  /* ---------- geography (lon, lat), simplified by hand ---------- */
  var COAST = [
    // Wales and the south coast of England
    [[-4.08,52.41],[-4.66,52.1],[-4.98,52.0],[-5.3,51.88],[-5.05,51.7],[-4.7,51.67],[-4.4,51.72],[-4.2,51.56],[-3.95,51.61],[-3.6,51.47],[-3.17,51.45],[-2.95,51.55],[-2.65,51.6],[-2.75,51.48],[-2.98,51.34],[-3.47,51.2],[-4.12,51.21],[-4.53,51.02],[-4.94,50.55],[-5.48,50.21],[-5.71,50.07],[-5.2,49.96],[-5.05,50.15],[-4.6,50.33],[-4.14,50.33],[-3.64,50.22],[-3.5,50.45],[-3.41,50.62],[-2.93,50.72],[-2.45,50.58],[-1.98,50.68],[-1.4,50.8],[-0.79,50.73],[-0.14,50.82],[0.25,50.74],[0.97,50.91],[1.18,51.08],[1.32,51.13],[1.44,51.38],[0.9,51.45],[0.5,51.5],[0.72,51.54],[1.15,51.79],[1.29,51.95],[1.6,52.2],[1.75,52.48],[1.7,52.75],[1.3,52.95],[0.5,52.95]],
    // Low Countries, France, northern Spain, Portugal
    [[4.72,53.0],[4.6,52.5],[4.25,52.1],[4.0,51.95],[3.8,51.75],[3.55,51.45],[3.2,51.35],[2.92,51.23],[2.55,51.09],[2.37,51.05],[1.85,50.96],[1.6,50.87],[1.6,50.73],[1.58,50.37],[1.62,50.2],[1.38,50.08],[1.08,49.93],[0.72,49.87],[0.37,49.77],[0.11,49.69],[0.1,49.49],[0.3,49.44],[0.23,49.42],[0.0,49.35],[-0.25,49.29],[-0.6,49.34],[-1.1,49.39],[-1.25,49.6],[-1.27,49.69],[-1.62,49.65],[-1.94,49.72],[-1.85,49.5],[-1.79,49.37],[-1.6,49.0],[-1.57,48.84],[-1.51,48.64],[-1.85,48.7],[-2.03,48.65],[-2.32,48.68],[-2.76,48.52],[-3.05,48.8],[-3.44,48.83],[-3.98,48.72],[-4.55,48.62],[-4.77,48.4],[-4.45,48.33],[-4.62,48.28],[-4.35,48.1],[-4.73,48.04],[-4.37,47.8],[-3.92,47.87],[-3.37,47.72],[-3.12,47.48],[-2.8,47.52],[-2.52,47.29],[-2.2,47.27],[-2.1,47.12],[-2.0,46.95],[-1.95,46.72],[-1.78,46.49],[-1.4,46.34],[-1.15,46.16],[-1.1,45.95],[-1.24,45.7],[-1.05,45.6],[-1.1,45.52],[-1.2,45.1],[-1.25,44.65],[-1.3,44.2],[-1.44,43.65],[-1.56,43.48],[-1.78,43.37],[-1.98,43.32],[-2.5,43.38],[-3.0,43.38],[-3.8,43.47],[-4.4,43.4],[-5.0,43.47],[-5.7,43.56],[-6.3,43.57],[-7.0,43.55],[-7.7,43.73],[-8.3,43.5],[-8.4,43.37],[-9.2,43.2],[-9.3,42.9],[-8.9,42.5],[-8.85,42.1],[-8.9,41.8],[-8.8,41.2]],
    // Catalonia, the French Riviera, Liguria, Tuscany
    [[1.0,41.05],[2.1,41.3],[2.8,41.7],[3.2,41.9],[3.32,42.32],[3.17,42.44],[3.08,42.53],[3.04,42.8],[3.05,43.0],[3.2,43.2],[3.5,43.28],[3.7,43.4],[4.0,43.55],[4.43,43.45],[4.85,43.35],[5.05,43.35],[5.37,43.3],[5.6,43.17],[5.93,43.1],[6.2,43.12],[6.64,43.27],[6.9,43.42],[7.02,43.55],[7.26,43.7],[7.5,43.78],[7.8,43.82],[8.2,43.95],[8.45,44.3],[8.95,44.41],[9.5,44.2],[9.85,44.05],[10.2,43.9],[10.3,43.55],[10.5,42.95],[11.1,42.4],[11.7,42.1]],
    // Corsica
    [[9.4,43.0],[9.45,42.7],[9.55,42.1],[9.4,41.7],[9.16,41.39],[8.8,41.55],[8.73,41.92],[8.6,42.25],[8.75,42.57],[9.05,42.72],[9.33,42.95],[9.4,43.0]],
    // northern Sardinia
    [[8.2,41.1],[8.4,40.95],[9.2,41.25],[9.8,40.9]],
    // Lake Geneva
    [[6.15,46.2],[6.5,46.45],[6.9,46.45],[6.8,46.38],[6.5,46.36],[6.2,46.27],[6.15,46.2]]
  ];
  var BORDERS = [
    [[-1.78,43.37],[-1.4,43.25],[-0.75,42.95],[0.0,42.7],[0.7,42.85],[1.45,42.6],[1.73,42.5],[2.5,42.35],[3.17,42.44]],
    [[2.55,51.09],[2.9,50.7],[3.25,50.7],[3.7,50.35],[4.2,50.1],[4.85,50.15],[4.85,49.8],[5.4,49.6],[5.8,49.55],[6.4,49.45],[6.75,49.17],[7.4,49.17],[8.2,48.97],[7.8,48.58],[7.6,48.1],[7.59,47.59],[7.0,47.48],[6.9,47.35],[6.45,47.0],[6.1,46.6],[6.15,46.2]],
    [[6.8,46.38],[6.9,46.1],[7.0,45.9],[6.8,45.7],[7.1,45.2],[6.63,45.1],[6.9,44.85],[7.0,44.2],[7.5,44.15],[7.5,43.78]],
    [[7.59,47.59],[8.6,47.65],[9.5,47.55],[10.0,47.5],[10.5,47.55],[11.0,47.4],[12.2,47.6]],
    [[7.0,45.9],[7.9,45.95],[8.4,46.3],[9.0,46.0],[9.3,46.5],[10.1,46.25],[10.5,46.55],[11.0,46.8],[12.2,47.0]],
    [[3.4,51.35],[4.3,51.37],[5.0,51.45],[5.85,51.15],[6.2,51.5],[5.95,51.8],[6.8,51.95],[7.05,52.4],[7.2,53.2]],
    [[5.8,49.55],[5.75,49.9],[6.1,50.15],[6.4,50.3],[6.0,50.75],[5.85,51.15]],
    [[6.1,50.15],[6.5,49.8],[6.4,49.45]],
    [[-8.9,41.87],[-8.2,42.1],[-7.2,41.9],[-6.6,41.95],[-6.2,41.6]]
  ];
  // Land masks: each coast above, closed around the outside of the view.
  var LAND = [
    COAST[0].concat([[0.5,56],[-4.08,56]]),
    COAST[1].concat([[-8.8,40.4],[0.9,40.4]], COAST[2], [[20,42],[20,56],[4.72,56]]),
    COAST[3],
    [[8.2,41.1],[8.4,40.95],[9.2,41.25],[9.8,40.9],[9.8,38],[8,38]],
    [[-10.3,51.6],[-9.8,51.45],[-9.4,51.5],[-8.5,51.6],[-8.0,51.8],[-7.5,51.95],[-6.9,52.15],[-6.35,52.2],[-6.2,52.6],[-6.0,53.0],[-6.1,53.5],[-6.1,56],[-10.3,56]]
  ];
  COAST.push(LAND[4].slice(0, 11));     // southern Ireland, for wide plates
  var TARGET = [2.35, 48.86];           // Paris

  /* ---------- projection: equirectangular, true scale at 47° N ---------- */
  var DEG = Math.PI / 180;
  var KX = Math.cos(47 * DEG);
  var V = { w: 0, h: 0, dpr: 1, s: 1, lon0: 0.6, lat0: 46.9 };
  function X(lon) { return V.w / 2 + (lon - V.lon0) * KX * V.s; }
  function Y(lat) { return V.h / 2 - (lat - V.lat0) * V.s; }
  function LON(x) { return V.lon0 + (x - V.w / 2) / (KX * V.s); }
  function LAT(y) { return V.lat0 - (y - V.h / 2) / V.s; }

  /* ---------- the field: 500 hPa geopotential height (m) ----------
     A westerly flow, an upper trough west of the British Isles drifting
     east with lead time, a ridge over the Alps, a short wave, and a slow
     "breathing" term so the chart never sits perfectly still. */
  function Z(lon, lat, L, t) {
    var z = 5640 - 24 * (lat - 47);
    var dx = (lon - (-9 + 0.11 * L)) * KX, dy = lat - (51.4 - 0.02 * L);
    z -= 150 * Math.exp(-(dx * dx) / 35 - (dy * dy) / 42);
    dx = (lon - (11 + 0.06 * L)) * KX; dy = lat - 44.5;
    z += 80 * Math.exp(-(dx * dx + dy * dy) / 60);
    z += 22 * Math.sin((lon - 0.18 * L) * 0.36 + lat * 0.12 + 0.8) * Math.exp(-(lat - 48) * (lat - 48) / 60);
    z += 6 * Math.sin(0.22 * t + lon * 0.25 - lat * 0.1);
    return z;
  }
  // geostrophic wind (m/s): u east, v north
  var GF = 9.81 / 1.1e-4, M_PER_DEG = 111000;
  function wind(lon, lat, L, t, out) {
    var h = 0.05;
    var dzx = (Z(lon + h, lat, L, t) - Z(lon - h, lat, L, t)) / (2 * h * M_PER_DEG * Math.cos(lat * DEG));
    var dzy = (Z(lon, lat + h, L, t) - Z(lon, lat - h, L, t)) / (2 * h * M_PER_DEG);
    out[0] = -GF * dzy;
    out[1] = GF * dzx;
    return out;
  }
  var W2 = [0, 0];

  /* ---------- state ---------- */
  var S = {
    lead: leadInput ? +leadInput.value : 24,
    shownLead: 0,                    // what is drawn (animated during the intro)
    view: "forecast",
    t: 0,                            // ambient seconds
    running: false,
    visible: false,
    exDirty: true,
    exLead: -1,
    origin: [0, 0],                  // screen position of attribution barycenter
    path: [],                        // back-trajectory, screen coords
    pointer: null,                   // {x, y, until}
    intro: still ? null : { t: 0 },
    fade: still ? 1 : 0
  };
  var lens = { x: 0, y: 0, r: 0, a: 0, tx: 0, ty: 0, tr: 0 };

  var staticLayer = document.createElement("canvas");   // graticule + ticks
  var coastLayer = document.createElement("canvas");    // coastlines + borders
  var inputLayer = document.createElement("canvas");    // contours of the input state
  var exLayer = document.createElement("canvas");       // attribution, trajectory, ellipse
  var sctx = staticLayer.getContext("2d");
  var cctx = coastLayer.getContext("2d");
  var ictx = inputLayer.getContext("2d");
  var ectx = exLayer.getContext("2d");

  /* ---------- sizing ---------- */
  var grid = { cell: 9, nx: 0, ny: 0, lon: null, lat: null, z: null };
  var particles = [];

  function resize() {
    var r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    // resetting a canvas clears it: only rebuild when the size really changed
    if (r.width === V.w && r.height === V.h && dpr === V.dpr) return "same";
    V.w = r.width; V.h = r.height;
    V.dpr = dpr;
    V.s = Math.min(V.h / 10.8, V.w / (13.5 * KX));
    // keep a little more ocean on wide plates, where the upstream story lives
    V.lon0 = V.w / V.h > 1.15 ? -0.6 : 0.3;
    [canvas, staticLayer, coastLayer, inputLayer, exLayer].forEach(function (c) {
      c.width = Math.round(V.w * V.dpr);
      c.height = Math.round(V.h * V.dpr);
    });
    [ctx, sctx, cctx, ictx, ectx].forEach(function (c) { c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0); });

    grid.cell = V.w < 520 ? 8 : 9;
    grid.nx = Math.ceil(V.w / grid.cell) + 1;
    grid.ny = Math.ceil(V.h / grid.cell) + 1;
    grid.lon = new Float32Array(grid.nx);
    grid.lat = new Float32Array(grid.ny);
    grid.z = new Float32Array(grid.nx * grid.ny);
    for (var i = 0; i < grid.nx; i++) grid.lon[i] = LON(i * grid.cell);
    for (var j = 0; j < grid.ny; j++) grid.lat[j] = LAT(j * grid.cell);

    var n = Math.round(V.w * V.h / (V.w < 520 ? 1300 : 1500));
    particles = [];
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (var k = 0; k < n; k++) {
      var p = { x: 0, y: 0, age: 0, life: 1 };
      spawn(p, still ? rnd : Math.random);
      p.age = (still ? rnd() : Math.random()) * p.life;
      particles.push(p);
    }
    drawStatic();
    // the input state (t = 0) never changes: its contours are drawn once
    ictx.clearRect(0, 0, V.w, V.h);
    sampleGrid(0, 0);
    drawContours(ictx, 0.22, 0.34, null);
    S.exDirty = true;
    lens.tr = baseRadius();
    return true;
  }
  function baseRadius() { return Math.max(96, Math.min(160, Math.min(V.w, V.h) * 0.23)); }
  function spawn(p, rnd) {
    p.x = rnd() * V.w; p.y = rnd() * V.h;
    p.age = 0; p.life = 2.2 + rnd() * 3.6;
  }

  /* ---------- static layer: graticule, coast, borders ---------- */
  function polyline(c, pts, close) {
    c.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var x = X(pts[i][0]), y = Y(pts[i][1]);
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    if (close) c.closePath();
  }
  function drawStatic() {
    var c = sctx;
    c.clearRect(0, 0, V.w, V.h);
    // land, a shade lighter than the sea
    c.fillStyle = C.land;
    LAND.forEach(function (pts) { polyline(c, pts, true); c.fill(); });
    c.fillStyle = C.plate;
    polyline(c, COAST[5], true); c.fill();              // Lake Geneva
    // graticule crosses every 2°
    c.strokeStyle = rgba(C.ink, 0.2); c.lineWidth = 1;
    c.beginPath();
    for (var lon = -14; lon <= 16; lon += 2) {
      for (var lat = 38; lat <= 56; lat += 2) {
        var x = Math.round(X(lon)) + 0.5, y = Math.round(Y(lat)) + 0.5;
        if (x < 0 || y < 0 || x > V.w || y > V.h) continue;
        c.moveTo(x - 3, y); c.lineTo(x + 3, y);
        c.moveTo(x, y - 3); c.lineTo(x, y + 3);
      }
    }
    c.stroke();
    // coast and borders live on their own layer, drawn above the contours
    var k = cctx;
    k.clearRect(0, 0, V.w, V.h);
    k.lineJoin = "round"; k.lineCap = "round";
    k.strokeStyle = rgba(C.ink, 0.74); k.lineWidth = 1.1;
    COAST.forEach(function (pts) { polyline(k, pts, false); k.stroke(); });
    k.setLineDash([2.5, 3]);
    k.strokeStyle = rgba(C.ink, 0.4); k.lineWidth = 1;
    BORDERS.forEach(function (pts) { polyline(k, pts, false); k.stroke(); });
    k.setLineDash([]);
    // tick labels: longitude along the bottom, latitude along the right edge
    c.font = "10px " + MONO; c.fillStyle = rgba(C.mute, 0.95);
    c.textBaseline = "alphabetic"; c.textAlign = "center";
    for (lon = -12; lon <= 16; lon += 4) {
      x = X(lon);
      if (x < 34 || x > V.w - 70) continue;
      c.fillText(lon === 0 ? "0°" : Math.abs(lon) + "°" + (lon < 0 ? "W" : "E"), x, V.h - 9);
    }
    c.textAlign = "right"; c.textBaseline = "middle";
    for (lat = 40; lat <= 56; lat += 2) {
      y = Y(lat);
      if (y < 44 || y > V.h - 30) continue;
      c.fillText(lat + "°N", V.w - 10, y);
    }
  }

  /* ---------- contours (marching squares) ---------- */
  var LEVELS = [];
  for (var lv = 5360; lv <= 5880; lv += 40) LEVELS.push(lv);

  function sampleGrid(L, t) {
    var nx = grid.nx, ny = grid.ny, z = grid.z;
    for (var j = 0; j < ny; j++) {
      var la = grid.lat[j];
      for (var i = 0; i < nx; i++) z[j * nx + i] = Z(grid.lon[i], la, L, t);
    }
  }

  // Strokes every level into the given context; returns label anchors for
  // the emphasised levels (every 120 m), found near a vertical column.
  function drawContours(c, alphaThin, alphaBold, labelX) {
    var nx = grid.nx, ny = grid.ny, z = grid.z, cs = grid.cell;
    var labels = [];
    for (var k = 0; k < LEVELS.length; k++) {
      var level = LEVELS[k];
      var bold = (level - 5400) % 120 === 0;
      var found = null;
      c.beginPath();
      for (var j = 0; j < ny - 1; j++) {
        var y0 = j * cs;
        for (var i = 0; i < nx - 1; i++) {
          var a = z[j * nx + i], b = z[j * nx + i + 1], d = z[(j + 1) * nx + i], e = z[(j + 1) * nx + i + 1];
          var idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (e > level ? 2 : 0) | (d > level ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          var x0 = i * cs;
          var tx = x0 + cs * (level - a) / (b - a), ty = y0;                // top
          var rx = x0 + cs, ry = y0 + cs * (level - b) / (e - b);            // right
          var bx = x0 + cs * (level - d) / (e - d), by = y0 + cs;            // bottom
          var lx = x0, ly = y0 + cs * (level - a) / (d - a);                 // left
          switch (idx) {
            case 1: case 14: c.moveTo(lx, ly); c.lineTo(bx, by); break;
            case 2: case 13: c.moveTo(bx, by); c.lineTo(rx, ry); break;
            case 3: case 12: c.moveTo(lx, ly); c.lineTo(rx, ry); break;
            case 4: case 11: c.moveTo(tx, ty); c.lineTo(rx, ry); break;
            case 5: c.moveTo(tx, ty); c.lineTo(rx, ry); c.moveTo(lx, ly); c.lineTo(bx, by); break;
            case 6: case 9: c.moveTo(tx, ty); c.lineTo(bx, by); break;
            case 7: case 8: c.moveTo(lx, ly); c.lineTo(tx, ty); break;
            case 10: c.moveTo(lx, ly); c.lineTo(tx, ty); c.moveTo(bx, by); c.lineTo(rx, ry); break;
          }
          if (bold && labelX != null && !found && x0 <= labelX && x0 + cs > labelX && y0 > 40 && y0 < V.h - 40) {
            found = { x: x0 + cs / 2, y: y0 + cs / 2, level: level };
          }
        }
      }
      c.lineWidth = bold ? 1.35 : 0.8;
      c.strokeStyle = rgba(C.atmo, bold ? alphaBold : alphaThin);
      c.stroke();
      if (found) labels.push(found);
    }
    return labels;
  }

  function drawLabels(c, labels, alpha) {
    c.font = "10px " + MONO; c.textAlign = "center"; c.textBaseline = "middle";
    labels.forEach(function (l) {
      var txt = String(l.level / 10);
      var w = c.measureText(txt).width + 8;
      c.fillStyle = C.plate; c.globalAlpha = 1;
      c.fillRect(l.x - w / 2, l.y - 7, w, 14);
      c.fillStyle = rgba(C.atmo, alpha);
      c.fillText(txt, l.x, l.y + 0.5);
    });
  }

  /* ---------- particles: short streaks advected by the wind ---------- */
  var K_SPEED = 1.35;                  // px per second per m/s
  function stepParticles(dt, L, t) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      wind(LON(p.x), LAT(p.y), L, t, W2);
      p.vx = W2[0] * K_SPEED; p.vy = -W2[1] * K_SPEED;
      p.x += p.vx * dt; p.y += p.vy * dt; p.age += dt;
      if (p.age > p.life || p.x < -20 || p.x > V.w + 20 || p.y < -20 || p.y > V.h + 20) spawn(p, Math.random);
    }
  }
  function drawParticles(fade) {
    var buckets = [[], [], [], []];
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (p.vx === undefined) { wind(LON(p.x), LAT(p.y), S.shownLead, S.t, W2); p.vx = W2[0] * K_SPEED; p.vy = -W2[1] * K_SPEED; }
      var a = still ? 1 : Math.min(1, p.age / 0.7, (p.life - p.age) / 0.9);
      if (a <= 0.02) continue;
      buckets[Math.min(3, Math.floor(a * 4))].push(p);
    }
    ctx.lineCap = "round"; ctx.lineWidth = 1.1;
    for (var b = 0; b < 4; b++) {
      if (!buckets[b].length) continue;
      ctx.strokeStyle = rgba(C.atmoInk, (0.1 + 0.1 * b) * fade);
      ctx.beginPath();
      buckets[b].forEach(function (p) {
        var k = 0.3;
        ctx.moveTo(p.x - p.vx * k, p.y - p.vy * k);
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  }

  /* ---------- the explanation layer ----------
     Trace the flow back from the target over the lead time; the attribution
     sits around where that trajectory starts, stretched along the flow and
     broadening with lead time. A faint copy of the initial-state contours
     sits underneath: the explanation lives on the input, not the forecast. */
  function hash(i, j) {
    var n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function vnoise(x, y) {
    var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    var a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }

  var BACK = 0.13;                     // schematic: how far upstream a forecast hour reaches
  function backTrajectory(L) {
    var lon = TARGET[0], lat = TARGET[1], dt = 0.5;
    var pts = [[X(lon), Y(lat)]];
    for (var tau = L; tau > 0; tau -= dt) {
      wind(lon, lat, tau, 0, W2);
      lon -= W2[0] * 3600 * dt * BACK / (M_PER_DEG * Math.cos(lat * DEG));
      lat -= W2[1] * 3600 * dt * BACK / M_PER_DEG;
      pts.push([X(lon), Y(lat)]);
    }
    return pts;
  }

  function buildExplanation(L) {
    var c = ectx;
    c.clearRect(0, 0, V.w, V.h);


    var path = backTrajectory(L);
    var o = path[path.length - 1];
    S.path = path; S.origin = o;

    // along-flow axis at the origin, in screen coordinates
    wind(LON(o[0]), LAT(o[1]), 0, 0, W2);
    var ex = W2[0], ey = -W2[1], en = Math.hypot(ex, ey) || 1;
    ex /= en; ey /= en;
    var sa = (0.3 + 0.017 * L) * V.s, sc = (0.22 + 0.009 * L) * V.s;
    var tX = X(TARGET[0]), tY = Y(TARGET[1]);
    var near = 0.5 * Math.exp(-L / 10), sn = 0.28 * V.s;

    // halftone dots on a hex lattice
    var sp = V.w < 520 ? 5 : 6, row = sp * 0.866, r0 = sp * 0.46;
    c.fillStyle = rgba(C.xai, 0.9);
    c.beginPath();
    var reach = 3.6;
    var x0 = Math.max(0, Math.min(o[0], tX) - reach * sa), x1 = Math.min(V.w, Math.max(o[0], tX) + reach * sa);
    var y0 = Math.max(0, Math.min(o[1], tY) - reach * sa), y1 = Math.min(V.h, Math.max(o[1], tY) + reach * sa);
    var jStart = Math.floor(y0 / row), jEnd = Math.ceil(y1 / row);
    for (var j = jStart; j <= jEnd; j++) {
      var y = j * row;
      var off = (j & 1) ? sp / 2 : 0;
      var iStart = Math.floor((x0 - off) / sp), iEnd = Math.ceil((x1 - off) / sp);
      for (var i = iStart; i <= iEnd; i++) {
        var x = i * sp + off;
        var dx = x - o[0], dy = y - o[1];
        var da = dx * ex + dy * ey, dc = -dx * ey + dy * ex;
        var m = Math.exp(-0.5 * (da * da / (sa * sa) + dc * dc / (sc * sc)));
        if (near > 0.01) {
          var nx = x - tX, ny = y - tY;
          m += near * Math.exp(-0.5 * (nx * nx + ny * ny) / (sn * sn));
        }
        if (m < 0.02) continue;
        var a = m * (0.5 + 0.55 * vnoise(x / 34, y / 34)) * (0.62 + 0.62 * hash(i, j));
        if (a < 0.06) continue;
        var r = r0 * Math.sqrt(Math.min(1, a));
        c.moveTo(x + r, y);
        c.arc(x, y, r, 0, Math.PI * 2);
      }
    }
    c.fill();

    // faint speckle everywhere else: raw gradients are never exactly zero
    c.fillStyle = rgba(C.xai, 0.4);
    c.beginPath();
    var sp2 = sp * 1.5;
    for (var yy = sp2 / 2; yy < V.h; yy += sp2 * 0.866) {
      for (var xx = sp2 / 2; xx < V.w; xx += sp2) {
        var hsh = hash(Math.round(xx * 0.7), Math.round(yy * 1.3));
        if (hsh > 0.075) continue;
        var rr = 0.55 + hsh * 7;
        c.moveTo(xx + rr, yy);
        c.arc(xx, yy, rr, 0, Math.PI * 2);
      }
    }
    c.fill();

    // back-trajectory: from the target to the input time
    c.strokeStyle = rgba(C.xai, 0.85); c.lineWidth = 1.2;
    c.setLineDash([1.5, 3.5]); c.lineCap = "round";
    c.beginPath();
    path.forEach(function (p, k) { if (k) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); });
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = C.xai;
    for (var k = 12; k < path.length; k += 12) {           // a tick every 6 h
      c.beginPath(); c.arc(path[k][0], path[k][1], 1.8, 0, Math.PI * 2); c.fill();
    }

    // 95 % influence ellipse and barycenter
    var ang = Math.atan2(ey, ex);
    c.strokeStyle = C.xai; c.lineWidth = 1.3;
    c.beginPath(); c.ellipse(o[0], o[1], 2.448 * sa, 2.448 * sc, ang, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(o[0] - 6, o[1]); c.lineTo(o[0] + 6, o[1]);
    c.moveTo(o[0], o[1] - 6); c.lineTo(o[0], o[1] + 6);
    c.stroke();

    // annotation, just below the ellipse
    c.font = "10px " + MONO; c.textBaseline = "top"; c.textAlign = "center";
    var ext = Math.sqrt(Math.pow(2.448 * sa * Math.sin(ang), 2) + Math.pow(2.448 * sc * Math.cos(ang), 2));
    var tw = c.measureText("95 % influence").width;
    var ax = clamp(o[0], tw / 2 + 6, V.w - tw / 2 - 6);
    c.fillStyle = rgba(C.plate, 0.9);
    c.fillRect(ax - tw / 2 - 3, o[1] + ext + 4, tw + 6, 14);
    c.fillStyle = C.xai;
    c.fillText("95 % influence", ax, o[1] + ext + 6);

    S.exLead = L; S.exDirty = false;
  }

  /* ---------- target ---------- */
  function drawTarget(t) {
    var x = X(TARGET[0]), y = Y(TARGET[1]);
    if (!still) {
      var ph = (t % 3.2) / 3.2;
      var s = 6 + ph * 22, a = (1 - ph) * 0.55;
      ctx.strokeStyle = rgba(C.target, a); ctx.lineWidth = 1;
      ctx.strokeRect(x - s, y - s, s * 2, s * 2);
    }
    ctx.fillStyle = C.plate;
    ctx.fillRect(x - 5, y - 5, 10, 10);
    ctx.strokeStyle = C.target; ctx.lineWidth = 1.8;
    ctx.strokeRect(x - 5, y - 5, 10, 10);
    ctx.font = "10px " + MONO; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    ctx.fillStyle = C.plate;
    var label = "TARGET · rain, Paris";
    var w = ctx.measureText(label).width;
    var lx = x + 14;
    if (lx + w > V.w - 8) { ctx.textAlign = "right"; lx = x - 14; ctx.fillRect(lx - w - 3, y - 7, w + 6, 14); }
    else ctx.fillRect(lx - 3, y - 7, w + 6, 14);
    ctx.fillStyle = C.ink;
    ctx.fillText(label, lx, y + 0.5);
  }

  // the back-trajectory, faint, outside the lens: target → where it came from
  function drawTrail(alpha) {
    var path = S.path;
    if (!path || path.length < 2) return;
    ctx.strokeStyle = rgba(C.xai, alpha); ctx.lineWidth = 1.1;
    ctx.setLineDash([1.5, 3.5]); ctx.lineCap = "round";
    ctx.beginPath();
    path.forEach(function (p, k) { if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ---------- the lens ---------- */
  function drawLens() {
    if (lens.a < 0.01 || lens.r < 1) return;
    var diag = Math.hypot(V.w, V.h);
    ctx.save();
    ctx.beginPath(); ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = lens.a;
    ctx.fillStyle = C.plate; ctx.fillRect(0, 0, V.w, V.h);
    ctx.drawImage(staticLayer, 0, 0, V.w, V.h);
    ctx.drawImage(inputLayer, 0, 0, V.w, V.h);
    ctx.drawImage(coastLayer, 0, 0, V.w, V.h);
    ctx.drawImage(exLayer, 0, 0, V.w, V.h);
    ctx.restore();
    if (lens.r < diag * 0.8) {
      var fadeRing = lens.a * Math.max(0, 1 - lens.r / (diag * 0.8));
      ctx.strokeStyle = rgba(C.xai, 0.9 * fadeRing); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      for (var q = 0; q < 4; q++) {
        var an = q * Math.PI / 2;
        ctx.moveTo(lens.x + Math.cos(an) * lens.r, lens.y + Math.sin(an) * lens.r);
        ctx.lineTo(lens.x + Math.cos(an) * (lens.r + 6), lens.y + Math.sin(an) * (lens.r + 6));
      }
      ctx.stroke();
      ctx.font = "10px " + MONO; ctx.fillStyle = rgba(C.xai, fadeRing);
      // label on the upper-left of the ring (the target usually sits up-right),
      // flipped to the right when it would leave the plate
      if (V.w < 480) return;            // narrow plates: the legend says it
      var text = "∂ rain / ∂ input", tw = ctx.measureText(text).width;
      var lx = lens.x + Math.cos(-2.35) * lens.r - 6, ly = lens.y + Math.sin(-2.35) * lens.r - 4;
      var left = lx - tw >= 6;
      if (!left) lx = lens.x + Math.cos(-0.79) * lens.r + 6;
      ly = Math.max(16, ly);
      ctx.fillStyle = rgba(C.plate, 0.9 * fadeRing);
      ctx.fillRect(left ? lx - tw - 3 : lx - 3, ly - 13, tw + 6, 15);
      ctx.fillStyle = rgba(C.xai, fadeRing);
      ctx.textBaseline = "bottom"; ctx.textAlign = left ? "right" : "left";
      ctx.fillText(text, lx, ly);
    }
  }

  /* ---------- frame ---------- */
  var labelsCache = [];
  function render() {
    var L = S.shownLead;
    ctx.clearRect(0, 0, V.w, V.h);
    ctx.globalAlpha = S.fade;
    ctx.drawImage(staticLayer, 0, 0, V.w, V.h);
    ctx.globalAlpha = 1;

    sampleGrid(L, S.t);
    labelsCache = drawContours(ctx, 0.5 * S.fade, 0.78 * S.fade, V.w * (V.w / V.h > 1.15 ? 0.26 : 0.2));
    drawLabels(ctx, labelsCache, 0.95 * S.fade);
    ctx.globalAlpha = S.fade;
    ctx.drawImage(coastLayer, 0, 0, V.w, V.h);
    ctx.globalAlpha = 1;
    drawParticles(S.fade);

    if (lens.a > 0.01) {
      if (S.exDirty || Math.abs(S.exLead - L) > 0.001) buildExplanation(L);
      drawTrail(0.4 * lens.a);
      drawLens();
    }
    drawTarget(S.t);
  }

  /* ---------- motion ---------- */
  function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function setLeadReadout(L) {
    var v = Math.round(L);
    if (leadOut) leadOut.innerHTML = "<span>LEAD</span> +" + (v < 10 ? "0" : "") + v + " H";
    if (leadInput) {
      leadInput.value = v;
      leadInput.setAttribute("aria-valuetext", "+" + v + " hours");
    }
  }

  function endIntro() {
    if (!S.intro) return;
    S.intro = null;
    S.fade = 1;
    setLeadReadout(S.lead);
    if (lens.a < 0.01) { lens.x = S.origin[0]; lens.y = S.origin[1]; lens.r = 0; }
    lens.a = Math.max(lens.a, 0.001);
  }

  function updateLensTargets(dt) {
    var diag = Math.hypot(V.w, V.h);
    lens.tr = S.view === "explanation" ? diag : baseRadius();
    var now = performance.now();
    if (S.pointer && S.pointer.until > now) {
      lens.tx = S.pointer.x; lens.ty = S.pointer.y;
    } else {
      S.pointer = null;
      var o = S.origin, R = baseRadius();
      var ox = clamp(o[0], R * 0.6, V.w - R * 0.6), oy = clamp(o[1], R * 0.6, V.h - R * 0.6);
      lens.tx = ox + Math.sin(S.t * 0.21) * R * 0.32;
      lens.ty = oy + Math.sin(S.t * 0.29 + 1.3) * R * 0.22;
    }
  }

  var last = 0;
  function frame(now) {
    if (!S.running) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    S.t += dt;

    if (S.intro) {
      var it = (S.intro.t += dt);
      S.fade = clamp(it / 0.9, 0, 1);
      if (it < 0.9) S.shownLead = 0;
      else if (it < 4.4) S.shownLead = S.lead * ease((it - 0.9) / 3.5);
      else S.shownLead = S.lead;
      setLeadReadout(S.shownLead);
      if (it >= 4.4) {
        // lens appears on the target, then walks back along the trajectory
        if (S.exDirty || S.exLead !== S.lead) buildExplanation(S.lead);
        var k = clamp((it - 4.4) / 0.8, 0, 1);
        lens.a = k; lens.r = baseRadius() * ease(k);
        var w = clamp((it - 5.0) / 2.4, 0, 1), path = S.path;
        var idx = Math.round(ease(w) * (path.length - 1));
        lens.x = lens.tx = path[idx][0]; lens.y = lens.ty = path[idx][1];
      }
      if (it > 7.6) endIntro();
    } else {
      S.shownLead += (S.lead - S.shownLead) * (1 - Math.exp(-dt * 8));
      if (Math.abs(S.lead - S.shownLead) < 0.02) S.shownLead = S.lead;
      updateLensTargets(dt);
      var f = 1 - Math.exp(-dt * 5.5);
      lens.x += (lens.tx - lens.x) * f;
      lens.y += (lens.ty - lens.y) * f;
      lens.r += (lens.tr - lens.r) * (1 - Math.exp(-dt * 4));
      lens.a += (1 - lens.a) * (1 - Math.exp(-dt * 4));
    }

    stepParticles(dt, S.shownLead, S.t);
    render();
    requestAnimationFrame(frame);
  }

  function start() {
    if (still || S.running || !S.visible || document.hidden) return;
    S.running = true; last = 0;
    requestAnimationFrame(frame);
  }
  function stop() { S.running = false; }

  // reduced motion: one composed still, redrawn only when something changes
  function drawStill() {
    S.shownLead = S.lead;
    S.fade = 1;
    buildExplanation(S.lead);
    var o = S.origin, R = baseRadius();
    lens.a = 1;
    lens.r = S.view === "explanation" ? Math.hypot(V.w, V.h) : R;
    if (S.pointer) { lens.x = S.pointer.x; lens.y = S.pointer.y; }
    else { lens.x = clamp(o[0], R * 0.6, V.w - R * 0.6); lens.y = clamp(o[1], R * 0.6, V.h - R * 0.6); }
    for (var i = 0; i < particles.length; i++) particles[i].vx = undefined;
    render();
  }
  function refresh() { if (still) drawStill(); }

  /* ---------- input ---------- */
  function localPoint(e) {
    var r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  stage.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var p = localPoint(e);
    endIntro();
    S.pointer = { x: p.x, y: p.y, until: performance.now() + 900 };
    if (still) { S.pointer.until = Infinity; refresh(); }
  });
  stage.addEventListener("pointerleave", function (e) {
    if (e.pointerType === "touch") return;
    if (S.pointer) S.pointer.until = performance.now() + 700;
    if (still) { S.pointer = null; refresh(); }
  });
  stage.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "touch") return;
    var p = localPoint(e);
    endIntro();
    S.pointer = { x: p.x, y: p.y, until: performance.now() + 4500 };
    if (still) refresh();
  });

  if (leadInput) {
    leadInput.addEventListener("input", function () {
      var v = +leadInput.value;
      endIntro();
      S.lead = v;
      setLeadReadout(S.lead);
      if (still) refresh();
    });
  }
  viewButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      endIntro();
      S.view = btn.getAttribute("data-field-view");
      viewButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      if (still) refresh();
    });
  });

  /* ---------- lifecycle ---------- */
  function init() {
    if (!resize()) return false;
    S.exDirty = true;
    if (still) { S.intro = null; setLeadReadout(S.lead); drawStill(); }
    else {
      // until the intro runs, show the plain state so the plate is never blank
      buildExplanation(S.lead);
      render();
    }
    return true;
  }

  var ready = false;
  function boot() {
    if (ready) return;
    ready = init();
    if (!ready) return;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        S.visible = entries[0].isIntersecting;
        if (S.visible) start(); else stop();
      }, { threshold: 0.05 }).observe(stage);
    } else { S.visible = true; start(); }
  }

  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!ready) { boot(); return; }
      var changed = resize();
      if (changed !== true) return;
      if (still) drawStill(); else if (!S.running) render();
    }, 120);
  }
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(stage);
  else window.addEventListener("resize", onResize);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });
  var onMotionChange = function () {
    still = motionQuery.matches;
    if (still) { stop(); S.intro = null; drawStill(); }
    else { S.fade = 1; start(); }
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

  // wait for the mono font so canvas labels don't render in a fallback face
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load("10px " + MONO), document.fonts.load("10px " + MONO, "∂")])
      .catch(function () {}).then(boot);
  } else boot();
})();
