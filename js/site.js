/* Small, progressive interactions. Every piece of content works without JS. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- current page in the nav ---------- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- one-shot sequences when a figure scrolls into view ---------- */
  function onceInView(el, fn, margin) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, { rootMargin: margin || "0px 0px -18% 0px" });
    io.observe(el);
  }
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    onceInView(el, function () { el.classList.add("is-in"); });
  });

  /* ---------- compare: wipe between two attribution maps ---------- */
  document.querySelectorAll("[data-compare]").forEach(function (box) {
    var range = box.querySelector("input[type=range]");
    function set(v) {
      box.style.setProperty("--pos", v + "%");
      range.value = v;
      range.setAttribute("aria-valuetext", Math.round(100 - v) + "% WassersteinGrad");
    }
    range.addEventListener("input", function () { set(+range.value); });
    // with a mouse, hovering is enough
    box.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = box.getBoundingClientRect();
      set(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)));
    });
    set(50);

    // a slow first sweep shows what the widget does
    if (!reduce) {
      onceInView(box, function () {
        var t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var k = Math.min(1, (ts - t0) / 2200);
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          set(88 - 38 * e);
          if (k < 1 && !box.matches(":hover")) requestAnimationFrame(step);
        }
        set(88);
        requestAnimationFrame(step);
      }, "0px 0px -30% 0px");
    }
  });

  /* ---------- WassersteinGrad lead time toggle ---------- */
  var leadButtons = document.querySelectorAll("[data-wg-lead]");
  leadButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lead = btn.getAttribute("data-wg-lead");
      leadButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      document.querySelectorAll("[data-src-" + lead + "]").forEach(function (img) {
        img.src = img.getAttribute("data-src-" + lead);
      });
    });
    // warm the cache so the swap is instant
    btn.addEventListener("pointerenter", function () {
      var lead = btn.getAttribute("data-wg-lead");
      document.querySelectorAll("[data-src-" + lead + "]").forEach(function (img) {
        (new Image()).src = img.getAttribute("data-src-" + lead);
      });
    }, { once: true });
  });

  /* ---------- EGU: step through the vertical coordinate ---------- */
  document.querySelectorAll("[data-altitude]").forEach(function (fig) {
    var buttons = [].slice.call(fig.querySelectorAll("[data-level]"));
    var imgs = [].slice.call(fig.querySelectorAll("[data-level-img]"));
    var tag = fig.querySelector("[data-level-tag]");
    var names = { "250hpa": "u · 250 hPa", "500hpa": "u · 500 hPa", "850hpa": "u · 850 hPa", "10m": "u · 10 m" };
    var touched = false;
    function show(level) {
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-level") === level)); });
      imgs.forEach(function (im) { im.classList.toggle("is-on", im.getAttribute("data-level-img") === level); });
      if (tag) tag.textContent = names[level] || level;
    }
    buttons.forEach(function (b) {
      var level = b.getAttribute("data-level");
      b.addEventListener("click", function () { touched = true; show(level); });
      b.addEventListener("mouseenter", function () { touched = true; show(level); });
      b.addEventListener("focus", function () { touched = true; show(level); });
    });
    // descend once through the atmosphere when the figure comes into view
    if (!reduce) {
      onceInView(fig, function () {
        var order = ["250hpa", "500hpa", "850hpa", "10m"], i = 0;
        show(order[0]);
        var timer = setInterval(function () {
          if (touched || ++i >= order.length) { clearInterval(timer); return; }
          show(order[i]);
        }, 1300);
      }, "0px 0px -25% 0px");
    }
  });

  /* ---------- copy BibTeX ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var src = document.getElementById(btn.getAttribute("data-copy"));
    if (!src) return;
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var text = src.textContent.trim();
      var done = function () {
        btn.textContent = "Copied ✓";
        setTimeout(function () { btn.textContent = label; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else { fallback(text); done(); }
    });
  });
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- expandable panels (Abstract / BibTeX) ---------- */
  document.querySelectorAll("[data-toggle]").forEach(function (btn) {
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
