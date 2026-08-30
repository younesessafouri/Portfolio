/* WassersteinGrad project page — progressive enhancement only.
   Everything below is optional: the page is complete without JS. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ nav */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Highlight the section currently in view */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var targets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (targets.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* --------------------------------------------------------------- reveal */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { revealer.observe(el); });
  }

  /* ------------------------------------------------- lead-time switching */
  /* Table 1, LLE_cos column (x10^3), lower is better. */
  var LLE_COS = {
    t1: [
      { name: 'BaseGrad',       v: 3.5, ours: false },
      { name: 'IntegratedGrad', v: 2.9, ours: false },
      { name: 'SmoothGrad',     v: 2.1, ours: false },
      { name: 'VarGrad',        v: 2.3, ours: false },
      { name: 'WG_Bary',        v: 0.1, ours: true  },
      { name: 'WG_Bary×Grad',   v: 3.6, ours: true  }
    ],
    t5: [
      { name: 'BaseGrad',       v: 4.2, ours: false },
      { name: 'IntegratedGrad', v: 6.3, ours: false },
      { name: 'SmoothGrad',     v: 2.6, ours: false },
      { name: 'VarGrad',        v: 3.0, ours: false },
      { name: 'WG_Bary',        v: 0.2, ours: true  },
      { name: 'WG_Bary×Grad',   v: 4.3, ours: true  }
    ]
  };

  var barsBody = document.getElementById('bars-body');
  var barsLead = document.getElementById('bars-lead');

  function label(name) {
    return name
      .replace('WG_Bary×Grad', 'WG<sub>Bary×Grad</sub>')
      .replace('WG_Bary', 'WG<sub>Bary</sub>');
  }

  /* The markup is always written immediately, so the numbers are present
     whatever happens to the observer. Only the fill width waits for the
     section to scroll into view. */
  var barsVisible = false;

  function paintBars() {
    if (!barsBody) return;
    Array.prototype.forEach.call(barsBody.querySelectorAll('.bar-fill'), function (f) {
      f.style.width = f.dataset.w + '%';
    });
  }

  function renderBars(lead) {
    if (!barsBody) return;
    var rows = LLE_COS[lead];
    var max = rows.reduce(function (m, r) { return Math.max(m, r.v); }, 0);

    barsBody.innerHTML = rows.map(function (r) {
      return '<div class="bar-row' + (r.ours ? ' ours' : '') + '">' +
               '<span class="lbl">' + label(r.name) + '</span>' +
               '<span class="bar-track"><span class="bar-fill" data-w="' +
                 (r.v / max * 100).toFixed(1) + '"></span></span>' +
               '<span class="val">' + r.v.toFixed(1) + '</span>' +
             '</div>';
    }).join('');

    if (barsLead) barsLead.textContent = lead === 't1' ? 't + 1' : 't + 5';

    if (!barsVisible) return;
    if (reduceMotion) paintBars();
    else requestAnimationFrame(function () { requestAnimationFrame(paintBars); });
  }

  var barsSection = barsBody && barsBody.closest('.bars');
  function armBars(lead) {
    renderBars(lead);
    if (!barsSection || reduceMotion || !('IntersectionObserver' in window)) {
      barsVisible = true; paintBars(); return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      barsVisible = true;
      requestAnimationFrame(paintBars);
      obs.disconnect();
    }, { threshold: 0.1 });
    io.observe(barsSection);
  }

  var currentLead = 't1';
  var mapImgs = document.querySelectorAll('#teaser-grid img[data-map]');
  var segButtons = document.querySelectorAll('.seg button[data-lead]');

  function setLead(lead) {
    if (lead === currentLead) return;
    currentLead = lead;

    Array.prototype.forEach.call(segButtons, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lead === lead));
    });

    Array.prototype.forEach.call(mapImgs, function (img) {
      var next = 'assets/figures/map-' + img.dataset.map + '-' + lead + '.webp';
      if (img.getAttribute('src') === next) return;
      if (reduceMotion) { img.src = next; return; }
      var pre = new Image();
      pre.onload = function () {
        img.style.opacity = '0';
        setTimeout(function () {
          img.src = next;
          img.style.opacity = '1';
        }, 160);
      };
      pre.src = next;
    });

    renderBars(lead);
  }

  Array.prototype.forEach.call(segButtons, function (b) {
    b.addEventListener('click', function () { setLead(b.dataset.lead); });
  });

  armBars(currentLead);

  /* ---------------------------------------------------- comparison slider */
  var cmp = document.getElementById('compare');
  if (cmp) {
    var top = cmp.querySelector('[data-compare="top"]');
    var handle = cmp.querySelector('.compare-handle');
    var pos = 50;

    function setPos(p) {
      pos = Math.max(0, Math.min(100, p));
      top.style.clipPath = 'inset(0 0 0 ' + pos + '%)';
      handle.style.left = pos + '%';
      cmp.setAttribute('aria-valuenow', Math.round(pos));
      cmp.setAttribute('aria-valuetext', Math.round(pos) + '% WassersteinGrad');
    }

    function fromEvent(e) {
      var r = cmp.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setPos(x / r.width * 100);
    }

    var dragging = false;
    var start = function (e) { dragging = true; fromEvent(e); };
    var move = function (e) {
      if (!dragging) return;
      if (e.cancelable && e.touches) e.preventDefault();
      fromEvent(e);
    };
    var end = function () { dragging = false; };

    cmp.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    cmp.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);

    cmp.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft')       { setPos(pos - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setPos(pos + step); e.preventDefault(); }
      else if (e.key === 'Home')       { setPos(0);   e.preventDefault(); }
      else if (e.key === 'End')        { setPos(100); e.preventDefault(); }
    });

    setPos(50);
  }

  /* ------------------------------------------------------------ copy bib */
  var copyBtn = document.getElementById('copy-bib');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var src = document.getElementById(copyBtn.dataset.target);
      if (!src) return;
      var text = src.textContent;

      var done = function (ok) {
        copyBtn.textContent = ok ? 'Copied' : 'Press ⌘C';
        copyBtn.classList.toggle('done', ok);
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('done');
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); },
                                                 function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      }
    });
  }
})();
