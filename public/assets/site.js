// Shared behaviour for every page: header, menus, contact scrolling and scroll motion.
// The form and the chat are the CRM embeds and run their own scripts.
(function () {
  var doc = document.documentElement;
  var header = document.querySelector('.site-header');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.matchMedia('(max-width: 1179px)').matches; };

  // Opening transition on the home page: any tap, scroll or key press skips it, a link to a spot on the
  // page skips it, and it removes itself when done.
  var intro = document.querySelector('.intro');
  if (intro) {
    var skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    var done = function () {
      if (intro.isConnected) intro.remove();
      skipEvents.forEach(function (name) { window.removeEventListener(name, skip); });
    };
    var skip = function () {
      intro.classList.add('is-skipped');
      document.body.classList.remove('has-intro');
      skipEvents.forEach(function (name) { window.removeEventListener(name, skip); });
    };
    skipEvents.forEach(function (name) { window.addEventListener(name, skip, { passive: true }); });
    intro.addEventListener('animationend', function (e) { if (e.target === intro) done(); });
    // Jumping straight to a spot on the page, or a slow script that arrives after the panel lifted
    if (location.hash || reduceMotion || performance.now() > 1900) { document.body.classList.remove('has-intro'); done(); }
  }

  // Header gets a line and a shadow once the page scrolls.
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu.
  var menuToggle = document.querySelector('.menu-toggle');
  var setMenu = function (open) {
    doc.classList.toggle('menu-open', open);
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  };
  if (menuToggle) menuToggle.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
  document.querySelectorAll('.mobile-group-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.closest('.mobile-group');
      var open = !group.classList.contains('is-open');
      group.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.querySelectorAll('.mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () { if (a.getAttribute('href').charAt(0) !== '#') setMenu(false); });
  });

  // Desktop dropdowns: hover opens them, and the buttons open them for keyboard and touch.
  var navItems = document.querySelectorAll('.nav-item.has-dropdown');
  var closeDropdowns = function (except) {
    navItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var b = item.querySelector('.nav-link');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  };
  navItems.forEach(function (item) {
    var btn = item.querySelector('button.nav-link');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      closeDropdowns(item);
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav-item')) closeDropdowns(); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeDropdowns();
    if (doc.classList.contains('menu-open')) { setMenu(false); if (menuToggle) menuToggle.focus(); }
  });

  // Every Contact us link lands with the whole form in the middle of the screen,
  // clear of the sticky header above and the round buttons below.
  var scrollToForm = function () {
    var form = document.getElementById('contact-form');
    if (!form) return false;
    var headerH = header ? header.offsetHeight : 0;
    var bottom = isMobile() ? 96 : 0;
    var avail = window.innerHeight - headerH - bottom;
    // Layout position, not getBoundingClientRect, so a section still easing into place is measured where it will settle.
    var formTop = 0;
    for (var el = form; el; el = el.offsetParent) formTop += el.offsetTop;
    var height = form.offsetHeight;
    var top = formTop - headerH;
    top -= height < avail ? (avail - height) / 2 : 12;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
    form.focus({ preventScroll: true });
    return true;
  };
  document.querySelectorAll('a[href="#contact"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      setMenu(false);
      if (scrollToForm()) {
        e.preventDefault();
        if (history.replaceState) history.replaceState(null, '', '#contact');
      }
    });
  });
  if (location.hash === '#contact') window.addEventListener('load', function () { setTimeout(scrollToForm, 60); });

  // Scroll motion. Lists and grids rise in one item after another, heading blocks build line by line
  // (the styles live in site.css), and the rating counts up when it arrives.
  var STAGGER = '.grid, .check-list, .steps, .reasons, .chips, .faq, .proof-list, .doc-list, .rows, .way-list, .footer-cols, .stats';
  document.querySelectorAll(STAGGER).forEach(function (list) {
    if (list.closest('.hero')) return;
    list.classList.remove('reveal');
    Array.prototype.forEach.call(list.children, function (item, i) {
      item.classList.add('reveal');
      item.style.setProperty('--d', String(Math.min(i, 7)));
    });
  });
  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) {
    var first = el.firstElementChild;
    if (el.classList.contains('section-head') || (first && first.classList.contains('eyebrow')) || (first && first.classList.contains('ornament'))) el.classList.add('cascade');
  });
  // Numbers count up from 0: the Google rating keeps its decimal, the home page numbers (data-count)
  // are whole numbers with their + or % after them. Without the script they simply show their value.
  var countUp = function (el) {
    var whole = el.hasAttribute('data-count');
    var target = parseFloat(whole ? el.getAttribute('data-count') : el.textContent);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var show = function (v) { el.textContent = (whole ? Math.round(v).toLocaleString('en-US') : v.toFixed(1)) + suffix; };
    var start = null;
    var step = function (t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / (whole ? 1800 : 1100));
      show(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    show(0);
    requestAnimationFrame(step);
  };
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        entry.target.querySelectorAll('.rating-score, [data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Home hero: as the page scrolls, the photo drifts down slower than the page and the headline lifts away.
  var heroMedia = document.querySelector('.home .hero-media');
  var heroCopy = document.querySelector('.home .hero-copy');
  if (heroMedia && !reduceMotion) {
    var ticking = false;
    var drift = function () {
      ticking = false;
      var h = heroMedia.parentElement.offsetHeight;
      var y = Math.min(window.scrollY, h);
      heroMedia.style.transform = 'translate3d(0, ' + (y * 0.3).toFixed(1) + 'px, 0)';
      if (heroCopy) {
        heroCopy.style.transform = 'translate3d(0, ' + (y * -0.12).toFixed(1) + 'px, 0)';
        heroCopy.style.opacity = String(Math.max(0, 1 - y / (h * 0.9)).toFixed(3));
      }
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(drift); }
    }, { passive: true });
  }
})();
