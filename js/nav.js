/**
 * Shared navigation and language behavior.
 * Loaded on every page after translations.js.
 *
 * Expose aussi window.IndirahUI : petits utilitaires partagés par les
 * interfaces superposées (menu mobile, lightbox, parcours, popup Contact,
 * Mory) pour garder un état cohérent quand plusieurs se succèdent.
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     UTILITAIRES PARTAGÉS — window.IndirahUI
  ══════════════════════════════════════════════════════════════ */

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* inert compté par élément : plusieurs interfaces peuvent neutraliser le
     même élément ; il ne redevient interactif qu'au dernier relâchement, et
     un inert posé par ailleurs (HTML, autre script) n'est jamais retiré. */
  var inertRecords = [];

  function findInertRecord(el) {
    for (var i = 0; i < inertRecords.length; i++) {
      if (inertRecords[i].el === el) return inertRecords[i];
    }
    return null;
  }

  function holdInert(elements) {
    var held = [];
    (elements || []).forEach(function (el) {
      if (!el || el.nodeType !== 1) return;
      var record = findInertRecord(el);
      if (!record) {
        record = { el: el, count: 0, added: !el.hasAttribute('inert') };
        inertRecords.push(record);
        if (record.added) el.setAttribute('inert', '');
      }
      record.count++;
      held.push(el);
    });
    var released = false;
    return function release() {
      if (released) return;
      released = true;
      held.forEach(function (el) {
        var record = findInertRecord(el);
        if (!record) return;
        record.count--;
        if (record.count <= 0) {
          if (record.added) el.removeAttribute('inert');
          inertRecords.splice(inertRecords.indexOf(record), 1);
        }
      });
    };
  }

  /* Neutralise tous les enfants directs de <body> sauf ceux qui contiennent
     un élément à garder interactif. À appeler APRÈS avoir déplacé le focus
     dans l'interface ouverte (jamais d'inert sur un ancêtre du focus). */
  function inertOutside(keep) {
    keep = (keep || []).filter(Boolean);
    var targets = Array.prototype.filter.call(document.body.children, function (el) {
      if (/^(SCRIPT|NOSCRIPT|TEMPLATE|STYLE|LINK)$/.test(el.tagName)) return false;
      if (el.classList.contains('lang-curtain')) return false;
      return !keep.some(function (k) { return k === el || el.contains(k); });
    });
    return holdInert(targets);
  }

  /* Verrou de défilement compté, avec restitution de la position. */
  var scrollLocks = 0;
  var savedScrollY = 0;

  function lockScroll() {
    if (scrollLocks === 0) {
      savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.body.classList.add('scroll-locked');
    }
    scrollLocks++;
    var released = false;
    return function unlock() {
      if (released) return;
      released = true;
      scrollLocks = Math.max(0, scrollLocks - 1);
      if (scrollLocks === 0) {
        document.body.classList.remove('scroll-locked');
        var current = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (Math.abs(current - savedScrollY) > 1) {
          try { window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' }); }
          catch (e) { window.scrollTo(0, savedScrollY); }
        }
      }
    };
  }

  function isVisible(el) {
    return !!(el && el.isConnected && (el.offsetWidth || el.offsetHeight || el.getClientRects().length) &&
      !el.closest('[inert]') && window.getComputedStyle(el).visibility !== 'hidden');
  }

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusable(containers) {
    var out = [];
    (Array.isArray(containers) ? containers : [containers]).forEach(function (container) {
      if (!container) return;
      Array.prototype.forEach.call(container.querySelectorAll(FOCUSABLE), function (el) {
        if (!el.closest('[hidden]') && isVisible(el)) out.push(el);
      });
    });
    return out;
  }

  /* Confine Tab / Maj+Tab dans un ou plusieurs conteneurs. */
  function trapTab(event, containers) {
    if (event.key !== 'Tab') return;
    var focusable = getFocusable(containers);
    if (!focusable.length) { event.preventDefault(); return; }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;
    var inside = focusable.indexOf(active) !== -1;
    if (event.shiftKey) {
      if (!inside || active === first) { event.preventDefault(); last.focus(); }
    } else if (!inside || active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* Signale l'ouverture / la fermeture d'une interface superposée
     (écouté par Mory pour se mettre en retrait sans MutationObserver). */
  function notifyOverlayChange() {
    try { window.dispatchEvent(new CustomEvent('indirah:overlaychange')); } catch (e) {}
  }

  window.IndirahUI = {
    prefersReducedMotion: prefersReducedMotion,
    holdInert: holdInert,
    inertOutside: inertOutside,
    lockScroll: lockScroll,
    isVisible: isVisible,
    getFocusable: getFocusable,
    trapTab: trapTab,
    notifyOverlayChange: notifyOverlayChange
  };

  /* ══════════════════════════════════════════════════════════════
     LANGUE
  ══════════════════════════════════════════════════════════════ */

  function readStoredLang() {
    try { return window.localStorage.getItem('indirah-lang') || 'fr'; } catch (e) { return 'fr'; }
  }

  function getCurrentLang() {
    return window.IndirahI18n ? window.IndirahI18n.getLanguage() : readStoredLang();
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

  /* Chaque langue est un vrai <button type="button"> : Tab, puis Entrée ou
     Espace déclenchent nativement un seul « click ». Un écouteur délégué par
     groupe → aucun double changement. */
  function initLanguageToggle() {
    ['lang-toggle', 'mobile-menu-lang'].forEach(function (id) {
      var group = document.getElementById(id);
      if (!group || group.dataset.langBound) return;
      group.dataset.langBound = 'true';
      group.addEventListener('click', function (e) {
        var option = e.target.closest ? e.target.closest('.lang-option') : null;
        if (option && group.contains(option)) switchLanguage(option.dataset.lang);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     MENU MOBILE
  ══════════════════════════════════════════════════════════════ */
  var menuApi = { isOpen: function () { return false; }, close: function () {} };

  function initHamburgerMenu() {
    var btn      = document.getElementById('hamburger-btn');
    var menu     = document.getElementById('mobile-menu');
    var overlay  = document.getElementById('mobile-menu-overlay');
    var closeBtn = document.getElementById('mobile-menu-close');

    if (!btn || !menu || !overlay || !closeBtn || menu.dataset.menuBound) return;
    menu.dataset.menuBound = 'true';

    var open = false;
    var finishTimer = null;
    var releaseInert = null;
    var releaseScroll = null;
    var desktopQuery = window.matchMedia ? window.matchMedia('(min-width: 769px)') : null;

    function setClosedState() {
      overlay.style.display = 'none';
      menu.style.display = 'none';
      menu.setAttribute('inert', '');
      menu.setAttribute('aria-hidden', 'true');
    }

    function clearFinish() {
      window.clearTimeout(finishTimer);
      finishTimer = null;
      menu.removeEventListener('transitionend', onTransitionEnd);
    }

    function onTransitionEnd(event) {
      if (event.target !== menu || event.propertyName !== 'opacity') return;
      finishClose();
    }

    function finishClose() {
      clearFinish();
      if (!open) setClosedState();
    }

    function openMenu() {
      if (open) return;
      open = true;
      clearFinish();
      overlay.style.display = 'block';
      menu.style.display = 'flex';
      menu.removeAttribute('inert');
      menu.removeAttribute('aria-hidden');
      overlay.offsetHeight; /* force le reflow avant la transition */
      overlay.classList.add('active');
      menu.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      releaseScroll = lockScroll();
      var first = getFocusable(menu)[0] || closeBtn;
      first.focus();
      /* Le reste de la page devient inerte ; le focus est déjà dans le menu.
         L'overlay reste cliquable pour fermer. */
      releaseInert = inertOutside([menu, overlay]);
      notifyOverlayChange();
    }

    /* options.restoreFocus : false quand un lien navigue ou ouvre la popup. */
    function closeMenu(options) {
      if (!open) return;
      options = options || {};
      open = false;
      var focusWasInside = menu.contains(document.activeElement);
      overlay.classList.remove('active');
      menu.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('inert', '');        /* immédiatement inatteignable */
      if (releaseInert) { releaseInert(); releaseInert = null; }
      if (releaseScroll) { releaseScroll(); releaseScroll = null; }

      if (options.restoreFocus !== false) {
        if (isVisible(btn)) btn.focus();
        else if (focusWasInside) {
          var fallback = document.querySelector('.main-nav [aria-current="page"]') || document.querySelector('.brand');
          if (fallback) fallback.focus();
        }
      }

      clearFinish();
      if (prefersReducedMotion() || options.immediate) {
        finishClose();
      } else {
        menu.addEventListener('transitionend', onTransitionEnd);
        /* Filet de sécurité si transitionend ne se produit pas. */
        finishTimer = window.setTimeout(finishClose, 400);
      }
      notifyOverlayChange();
    }

    setClosedState();

    btn.addEventListener('click', function () {
      if (open) closeMenu();
      else openMenu();
    });

    closeBtn.addEventListener('click', function () { closeMenu(); });
    overlay.addEventListener('click', function () { closeMenu(); });

    /* Liens : fermeture immédiate puis comportement natif (navigation,
       ou ouverture de la popup Contact par contact-popup.js). */
    menu.querySelectorAll('a.mobile-menu-btn').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu({ restoreFocus: false, immediate: true });
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key === 'Tab') trapTab(e, menu);
    });

    function onViewportChange(query) {
      if (query.matches && open) closeMenu({ immediate: true });
    }
    if (desktopQuery) {
      if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onViewportChange);
      else if (desktopQuery.addListener) desktopQuery.addListener(onViewportChange);
    }

    menuApi = {
      isOpen: function () { return open; },
      close: closeMenu,
      toggleButton: btn
    };
  }

  window.IndirahNav = {
    getCurrentLang: getCurrentLang,
    setLanguage: setLanguage,
    initHamburgerMenu: initHamburgerMenu,
    isMenuOpen: function () { return menuApi.isOpen(); },
    closeMenu: function (options) { menuApi.close(options); }
  };

  function init() {
    initLanguageToggle();
    initHamburgerMenu();
    setLanguage(getCurrentLang());
  }

  /* Même moment qu'avant : après l'exécution de tous les scripts différés,
     pour que la langue s'applique aussi au contenu qu'ils ont généré. */
  document.addEventListener('DOMContentLoaded', init);
}());
