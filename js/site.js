/* Small, progressive interactions. Every piece of content works without JS. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- navigation: state + the section in view ---------- */
  var nav = document.querySelector("[data-topnav]");
  if (nav) {
    var links = $$('ul a[href^="#"]', nav);
    var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    var about = document.getElementById("about");
    var queued = false;
    var update = function () {
      queued = false;
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
      nav.classList.toggle("on-dusk", !!about && about.getBoundingClientRect().top < 60);
      var line = window.innerHeight * 0.4, active = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) active = i; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = targets.length - 1;
      links.forEach(function (a, i) {
        a.classList.toggle("is-active", i === active);
        if (i === active) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- photographs ↔ atlas ---------- */
  function light(place, on) {
    $$('[data-place="' + place + '"]').forEach(function (el) { el.classList.toggle("is-lit", on); });
  }
  $$(".shot").forEach(function (fig) {
    var place = fig.getAttribute("data-place"), frame = fig.querySelector(".shot-frame");
    fig.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") light(place, true); });
    fig.addEventListener("pointerleave", function () {
      light(place, false);
      fig.style.setProperty("--mx", 0); fig.style.setProperty("--my", 0);
    });
    fig.addEventListener("focus", function () { light(place, true); });
    fig.addEventListener("blur", function () { light(place, false); });
    if (!reduce) {
      // the image drifts a little against the cursor, inside its frame
      fig.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var r = frame.getBoundingClientRect();
        fig.style.setProperty("--mx", (((e.clientX - r.left) / r.width) - 0.5) * 2);
        fig.style.setProperty("--my", (((e.clientY - r.top) / r.height) - 0.5) * 2);
      });
    }
  });
  $$(".atlas-pt").forEach(function (pt) {
    var place = pt.getAttribute("data-place");
    pt.addEventListener("pointerenter", function () { light(place, true); });
    pt.addEventListener("pointerleave", function () { light(place, false); });
  });
  // on phones the photographs are a swipeable strip: mark the one in view on the atlas
  var gallery = document.querySelector(".gallery");
  if (gallery && "IntersectionObserver" in window) {
    var strip = window.matchMedia("(max-width: 699px)");
    var io = new IntersectionObserver(function (entries) {
      if (!strip.matches) return;
      entries.forEach(function (en) {
        light(en.target.getAttribute("data-place"), en.isIntersecting);
      });
    }, { root: gallery, threshold: 0.6 });
    $$(".shot", gallery).forEach(function (s) { io.observe(s); });
  }

  /* ---------- the shelf ---------- */
  var detail = document.querySelector("[data-shelf-detail]");
  $$(".book").forEach(function (book) {
    var show = function () { if (detail) { detail.textContent = book.getAttribute("data-detail"); detail.classList.add("is-on"); } };
    var hide = function () { if (detail) detail.classList.remove("is-on"); };
    book.addEventListener("pointerenter", show); book.addEventListener("focus", show);
    book.addEventListener("pointerleave", hide); book.addEventListener("blur", hide);
  });

  /* ---------- the turntable ---------- */
  var deck = document.querySelector("[data-turntable]");
  if (deck) {
    var NS = "http://www.w3.org/2000/svg";
    var grooves = deck.querySelector(".record-grooves");
    // grooves as slightly irregular rings, like contour lines
    var disc = document.createElementNS(NS, "circle");
    disc.setAttribute("r", "149"); disc.setAttribute("fill", "#15171a");
    grooves.appendChild(disc);
    for (var k = 0; k < 26; k++) {
      var r0 = 56 + k * 3.45, d = "";
      for (var s = 0; s <= 96; s++) {
        var th = s / 96 * Math.PI * 2;
        var r = r0 + 0.45 * Math.sin(3 * th + k * 0.9) + 0.25 * Math.sin(7 * th - k);
        d += (s ? "L" : "M") + (r * Math.cos(th)).toFixed(2) + " " + (r * Math.sin(th)).toFixed(2);
      }
      var path = document.createElementNS(NS, "path");
      var gap = k === 9 || k === 18;
      path.setAttribute("d", d + "Z");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", gap ? "rgba(0,0,0,.55)" : "rgba(255,255,255," + (k % 5 === 0 ? 0.11 : 0.05) + ")");
      path.setAttribute("stroke-width", gap ? "1.8" : "0.9");
      grooves.appendChild(path);
    }

    // a waveform per record, stable for each name
    function seeded(str) {
      var h = 2166136261;
      for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return function () { h = Math.imul(h ^ h >>> 15, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
    }
    var buttons = $$(".tracks button", deck);
    buttons.forEach(function (btn) {
      var wave = btn.querySelector(".wave"), rnd = seeded(btn.getAttribute("data-track")), n = 46, prev = 0.5;
      for (var i = 0; i < n; i++) {
        var env = 0.55 + 0.45 * Math.sin(i / n * Math.PI) * (0.7 + 0.3 * Math.sin(i * 0.37));
        prev = prev * 0.45 + rnd() * 0.55;
        var bar = document.createElement("i");
        bar.style.setProperty("--v", Math.max(0.12, Math.min(1, env * (0.3 + prev * 0.9))).toFixed(3));
        wave.appendChild(bar);
      }
    });

    var label = deck.querySelector("[data-record-artist]");
    var current = null;
    function stop() {
      deck.classList.remove("is-playing");
      buttons.forEach(function (b) { b.parentNode.classList.remove("is-playing-track"); });
    }
    function play(btn) {
      var same = current === btn && deck.classList.contains("is-playing");
      stop();
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn && !same)); });
      if (same) { current = null; label.textContent = "Side A"; return; }
      current = btn;
      label.textContent = btn.getAttribute("data-track");
      var li = btn.parentNode;
      void li.offsetWidth;                         // restart the progress sweep
      li.classList.add("is-playing-track");
      deck.classList.add("is-playing");
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () { play(btn); });
      btn.querySelector(".wave").addEventListener("animationend", function () {
        if (current === btn) deck.classList.remove("is-playing");   // side over: the arm lifts
      });
    });
  }

  /* ---------- copy BibTeX ---------- */
  $$("[data-copy]").forEach(function (btn) {
    var src = document.getElementById(btn.getAttribute("data-copy"));
    if (!src) return;
    var text0 = btn.textContent;
    btn.addEventListener("click", function () {
      var text = src.textContent.trim();
      var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = text0; }, 1600); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      else { fallback(text); done(); }
    });
  });
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- expandable panels (Abstract / BibTeX) ---------- */
  $$("[data-toggle]").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("data-toggle"));
    if (!panel) return;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", panel.id);
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });
})();
