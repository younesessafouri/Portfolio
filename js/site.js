/* Small, progressive interactions. Every piece of content works without JS. */
(function () {
  "use strict";

  /* ---------- copy BibTeX ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var src = document.getElementById(btn.getAttribute("data-copy"));
    if (!src) return;
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var text = src.textContent.trim();
      var done = function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = label; }, 1600);
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

  /* ---------- expandable panels (Abstract / BibTeX on the publications page) ---------- */
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
