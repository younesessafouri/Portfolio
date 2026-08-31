(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "portfolio-theme";

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    var btns = document.querySelectorAll("[data-theme-toggle]");
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    });
  }

  var savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(savedTheme);

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-mobile-toggle]");
    if (!btn) return;
    var nav = document.querySelector(".nav-links");
    if (!nav) return;
    nav.classList.toggle("open");
  });

  document.querySelectorAll(".nav-links a").forEach(function (a) {
    a.addEventListener("click", function () {
      var nav = document.querySelector(".nav-links");
      if (nav) nav.classList.remove("open");
    });
  });

  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href) return;
    var target = href.split("#")[0] || "index.html";
    if (target === path || (target === "" && path === "index.html")) {
      a.classList.add("active");
    }
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 120px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
    // Safety net: force-reveal anything IO hasn't caught after a beat
    // (e.g. very fast programmatic scrolls, hash-jump navigation).
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in-view)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 400 && r.bottom > -400) {
          el.classList.add("in-view");
        }
      });
    }, 1200);
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();

/* ------------------------------------------------------------------
   Isometric parallax — hero atmosphere stack + the cityscape mark.
   Pointer moves the levels by depth; scroll drifts the whole stack.
   Purely decorative: skipped entirely under reduced-motion.
   ------------------------------------------------------------------ */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return;

  var field = document.querySelector("[data-iso]");
  if (!field) return;

  var levels = [].slice.call(field.querySelectorAll(".iso-level"));
  if (!levels.length) return;

  var px = 0, py = 0;   // pointer, normalised -1..1
  var sy = 0;           // scroll drift
  var queued = false;

  function paint() {
    queued = false;
    levels.forEach(function (g) {
      var d = parseFloat(g.getAttribute("data-depth")) || 1;
      var tx = px * 26 * d;
      var ty = py * 14 * d + sy * 18 * d;
      g.style.transform = "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px)";
    });
  }

  function request() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  window.addEventListener("pointermove", function (e) {
    var r = field.getBoundingClientRect();
    if (!r.height) return;
    px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    px = Math.max(-1, Math.min(1, px));
    py = Math.max(-1, Math.min(1, py));
    request();
  }, { passive: true });

  window.addEventListener("scroll", function () {
    var r = field.getBoundingClientRect();
    sy = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height)));
    request();
  }, { passive: true });

  /* The cityscape mark in "Beyond the Lab" gets a gentler version. */
  var art = document.querySelector(".iso-art");
  if (art) {
    var artQueued = false;
    window.addEventListener("pointermove", function (e) {
      if (artQueued) return;
      artQueued = true;
      requestAnimationFrame(function () {
        artQueued = false;
        var r = art.getBoundingClientRect();
        if (!r.height || r.bottom < 0 || r.top > window.innerHeight) return;
        var ax = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width)));
        var ay = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height)));
        art.style.transform = "translate(" + (ax * 9).toFixed(2) + "px," + (ay * 6).toFixed(2) + "px)";
      });
    }, { passive: true });
    art.style.transition = "transform .6s cubic-bezier(.22,.9,.3,1)";
    art.style.willChange = "transform";
  }
})();

/* Expandable Abstract / BibTeX panels in the publications list. */
(function () {
  var buttons = document.querySelectorAll("[data-pub-toggle]");
  if (!buttons.length) return;
  [].forEach.call(buttons, function (btn) {
    var panel = document.getElementById(btn.getAttribute("data-pub-toggle"));
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
