/**
 * Shared navigation and language behavior.
 * Loaded on every page after translations.js.
 */
(function () {
  'use strict';

  function getCurrentLang() {
    return window.IndirahI18n
      ? window.IndirahI18n.getLanguage()
      : (localStorage.getItem('indirah-lang') || 'fr');
  }

  function setLanguage(lang) {
    if (!window.IndirahI18n) return null;
    return window.IndirahI18n.apply(lang);
  }

  /* ── Rideau de transition (purement cosmétique) au changement de langue ──
     La bascule reste instantanée ; le rideau habille juste la transition.
     Un seul overlay partagé, borné dans le temps → jamais bloqué / empilé. */
  var CURTAIN_FADE = 160;   /* durée du fondu (ms) — doit matcher la transition CSS */
  var CURTAIN_HOLD = 120;   /* courte pause « écran couvert » (ms) */
  var curtainEl   = null;
  var curtainBusy = false;
  var pendingLang = null;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function ensureCurtain() {
    if (curtainEl && document.body.contains(curtainEl)) return curtainEl;
    var el = document.createElement('div');
    el.className = 'lang-curtain';
    el.setAttribute('aria-hidden', 'true');
    var mark = document.createElement('span');
    mark.className = 'lang-curtain-mark';
    mark.textContent = 'Indirah';
    el.appendChild(mark);
    document.body.appendChild(el);
    curtainEl = el;
    return el;
  }

  function runCurtainCycle() {
    curtainBusy = true;
    var el = ensureCurtain();
    el.classList.add('is-visible');                 /* fondu d'entrée */
    window.setTimeout(function () {
      if (pendingLang) setLanguage(pendingLang);     /* bascule réelle, écran couvert */
      el.classList.remove('is-visible');             /* fondu de sortie */
      window.setTimeout(function () {
        curtainBusy = false;
        /* Si l'utilisateur a re-cliqué une AUTRE langue pendant le cycle, on relance. */
        if (pendingLang && pendingLang !== getCurrentLang()) runCurtainCycle();
        else pendingLang = null;
      }, CURTAIN_FADE + 40);
    }, CURTAIN_FADE + CURTAIN_HOLD);
  }

  /* Bascule habillée par le rideau — déclenchée par les clics utilisateur. */
  function switchLanguage(lang) {
    if (!lang) return;
    var effectiveCurrent = curtainBusy ? pendingLang : getCurrentLang();
    if (lang === effectiveCurrent) return;           /* déjà la langue cible */
    if (prefersReducedMotion()) { setLanguage(lang); return; } /* pas d'habillage */
    pendingLang = lang;
    if (!curtainBusy) runCurtainCycle();
  }

  function initLanguageToggle() {
    var langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', function (e) {
        var option = e.target.closest('.lang-option');
        if (option) switchLanguage(option.dataset.lang);
      });
    }

    document.querySelectorAll('#mobile-menu-lang .lang-option').forEach(function (option) {
      option.addEventListener('click', function () {
        switchLanguage(option.dataset.lang);
      });
    });
  }

  function initHamburgerMenu() {
    var btn      = document.getElementById('hamburger-btn');
    var menu     = document.getElementById('mobile-menu');
    var overlay  = document.getElementById('mobile-menu-overlay');
    var closeBtn = document.getElementById('mobile-menu-close');

    if (!btn || !menu || !overlay || !closeBtn) return;

    function openMenu() {
      overlay.style.display = 'block';
      menu.style.display = 'flex';
      overlay.offsetHeight;
      menu.offsetHeight;
      overlay.classList.add('active');
      menu.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      overlay.classList.remove('active');
      menu.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      setTimeout(function () {
        if (!menu.classList.contains('active')) {
          overlay.style.display = 'none';
          menu.style.display = 'none';
        }
      }, 260);
    }

    btn.addEventListener('click', function () {
      if (menu.classList.contains('active')) closeMenu();
      else openMenu();
    });

    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    menu.querySelectorAll('a.mobile-menu-btn').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        e.preventDefault();
        closeMenu();
        if (link.hasAttribute('data-contact-open')) return;
        if (href && href.charAt(0) === '#') {
          var target = document.getElementById(href.slice(1));
          if (target) setTimeout(function () { target.scrollIntoView({ behavior: 'smooth' }); }, 260);
        } else if (href) {
          setTimeout(function () { window.location.href = href; }, 260);
        }
      });
    });
  }

  window.IndirahNav = {
    getCurrentLang: getCurrentLang,
    setLanguage: setLanguage,
    initHamburgerMenu: initHamburgerMenu
  };

  document.addEventListener('DOMContentLoaded', function () {
    initLanguageToggle();
    initHamburgerMenu();
    setLanguage(getCurrentLang());
  });
}());
