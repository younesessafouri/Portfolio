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
