// Shared behaviour for every page: header, menus, contact scrolling and scroll motion.
// The form and the chat are the CRM embeds and run their own scripts.
(function () {
  var doc = document.documentElement;
  var header = document.querySelector('.site-header');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.matchMedia('(max-width: 1179px)').matches; };

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

  // Sections settle into place as they come into view.
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
