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

  function initLanguageToggle() {
    var langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', function (e) {
        var option = e.target.closest('.lang-option');
        if (option) setLanguage(option.dataset.lang);
      });
    }

    document.querySelectorAll('#mobile-menu-lang .lang-option').forEach(function (option) {
      option.addEventListener('click', function () {
        setLanguage(option.dataset.lang);
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
