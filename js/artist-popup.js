/**
 * Indirah — artist-popup.js
 * Popup de présentation de l'artiste, ouvert au clic sur .brand (toutes pages).
 * Autonome : données et logique encapsulées dans un IIFE, pas de dépendance
 * à oeuvres-data.js ni à main.js. Lit la langue via localStorage.
 */
(function () {
  'use strict';

  /* ── Données ────────────────────────────────────────────── */
  var ARTIST_DATA = [
    {
      photo: 'images/artiste.png',
      name:  'Indirah',
      role:  { fr: 'Artiste peintre',  en: 'Visual Artist' },
      quote: {
        fr: "Peindre, c'est raconter ce que les mots ne savent pas dire. Chaque toile est une conversation entre ma main et mon silence.",
        en: "Painting is telling what words cannot say. Each canvas is a conversation between my hand and my silence."
      }
    },
    {
      photo: 'images/vision.png',
      name:  'Indirah',
      role:  { fr: 'Une vision',  en: 'A Vision' },
      quote: {
        fr: "Je peins des figures, des émotions, des histoires qui me traversent. Mon travail est un pont entre ce qu'on voit et ce qu'on ressent.",
        en: "I paint figures, emotions, stories that move through me. My work is a bridge between what we see and what we feel."
      }
    },
    {
      photo: 'images/atelier.png',
      name:  'Indirah',
      role:  { fr: "L'atelier",  en: 'The Studio' },
      quote: {
        fr: "L'atelier est mon sanctuaire. C'est là que le chaos devient couleur, que l'incertitude devient ligne, que le doute devient œuvre.",
        en: "The studio is my sanctuary. That's where chaos becomes color, uncertainty becomes line, and doubt becomes art."
      }
    }
  ];

  /* ── État ───────────────────────────────────────────────── */
  var apOverlay      = null;
  var apContentInner = null;
  var apNameEl       = null;
  var apRoleEl       = null;
  var apQuoteEl      = null;
  var apPhotoEls     = [];
  var apCurrentIndex = 0;
  var apTrigger      = null;
  var apEnteringTimer = null;
  var apTextTimer     = null;

  /* ── Helpers ────────────────────────────────────────────── */
  function apGetLang() {
    return localStorage.getItem('indirah-lang') || 'fr';
  }

  function apGetFocusable(container) {
    return Array.from(container.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  function apFindBySlot(slot) {
    var found = null;
    apPhotoEls.forEach(function (card) {
      if (parseInt(card.dataset.slot, 10) === slot) found = card;
    });
    return found;
  }

  /* ── Construction du DOM ────────────────────────────────── */
  function apBuild() {
    if (document.getElementById('ap-overlay')) return;

    /* Overlay */
    var overlay = document.createElement('div');
    overlay.id  = 'ap-overlay';
    overlay.className = 'ap-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', "À propos d'Indirah");
    apOverlay = overlay;

    /* Panel */
    var panel = document.createElement('div');
    panel.className = 'ap-panel';
    overlay.appendChild(panel);

    /* Bouton fermeture */
    var closeBtn = document.createElement('button');
    closeBtn.id        = 'ap-close';
    closeBtn.className = 'ap-close';
    closeBtn.setAttribute('aria-label', 'Fermer');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"' +
      ' stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
    panel.appendChild(closeBtn);

    /* Colonne gauche — pile de photos */
    var photosCol  = document.createElement('div');
    photosCol.className = 'ap-photos';
    var photoStack = document.createElement('div');
    photoStack.className = 'ap-photo-stack';

    ARTIST_DATA.forEach(function (data, i) {
      var card       = document.createElement('div');
      card.className = 'ap-photo';
      card.dataset.slot = String(i);

      var img = document.createElement('img');
      img.src = data.photo;
      img.alt = data.name;
      img.setAttribute('loading', 'lazy');
      card.appendChild(img);
      photoStack.appendChild(card);
      apPhotoEls.push(card);
    });

    photosCol.appendChild(photoStack);
    panel.appendChild(photosCol);

    /* Colonne droite — contenu textuel */
    var contentCol = document.createElement('div');
    contentCol.className = 'ap-content';

    var contentInner = document.createElement('div');
    contentInner.className = 'ap-content-inner';
    apContentInner = contentInner;

    apNameEl  = document.createElement('p');
    apNameEl.className  = 'ap-name';
    apRoleEl  = document.createElement('p');
    apRoleEl.className  = 'ap-role';
    apQuoteEl = document.createElement('p');
    apQuoteEl.className = 'ap-quote';

    contentInner.appendChild(apNameEl);
    contentInner.appendChild(apRoleEl);
    contentInner.appendChild(apQuoteEl);
    contentCol.appendChild(contentInner);

    /* Boutons de navigation */
    var nav = document.createElement('div');
    nav.className = 'ap-nav';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'ap-nav-btn ap-nav-btn--prev';
    prevBtn.setAttribute('aria-label', 'Aspect précédent');
    prevBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"' +
      ' stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="15 18 9 12 15 6"/>' +
      '</svg>';

    var nextBtn = document.createElement('button');
    nextBtn.className = 'ap-nav-btn ap-nav-btn--next';
    nextBtn.setAttribute('aria-label', 'Aspect suivant');
    nextBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"' +
      ' stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="9 18 15 12 9 6"/>' +
      '</svg>';

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    contentCol.appendChild(nav);
    panel.appendChild(contentCol);
    document.body.appendChild(overlay);

    /* ── Listeners ── */
    closeBtn.addEventListener('click', apClose);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) apClose();
    });

    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      apGoTo((apCurrentIndex - 1 + ARTIST_DATA.length) % ARTIST_DATA.length);
    });
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      apGoTo((apCurrentIndex + 1) % ARTIST_DATA.length);
    });

    /* Clavier global */
    document.addEventListener('keydown', function (e) {
      if (!apOverlay.classList.contains('is-active')) return;
      if (e.key === 'Escape') { apClose(); return; }
      if (e.key === 'ArrowLeft')  apGoTo((apCurrentIndex - 1 + ARTIST_DATA.length) % ARTIST_DATA.length);
      if (e.key === 'ArrowRight') apGoTo((apCurrentIndex + 1) % ARTIST_DATA.length);
    });

    /* Piège de focus */
    overlay.addEventListener('keydown', function (e) {
      if (!apOverlay.classList.contains('is-active') || e.key !== 'Tab') return;
      var focusable = apGetFocusable(overlay);
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });

    /* Mise à jour de la langue via l'événement global émis par setLanguage() */
    window.addEventListener('indirah:languagechange', function () {
      if (apOverlay && apOverlay.classList.contains('is-active')) {
        apRenderSlide(apCurrentIndex, false);
      }
    });
  }

  /* ── Ouverture ──────────────────────────────────────────── */
  function apOpen(trigger) {
    if (!apOverlay) return;
    apTrigger = trigger || null;
    apCurrentIndex = 0;

    /* Remise à zéro propre */
    clearTimeout(apTextTimer);
    clearTimeout(apEnteringTimer);
    apContentInner.classList.remove('is-hidden');
    apPhotoEls.forEach(function (c) { c.classList.remove('is-entering'); });

    apUpdateStack();
    apRenderSlide(0, true);

    document.body.style.overflow = 'hidden';
    apOverlay.style.display = 'flex';
    apOverlay.offsetHeight; /* force reflow */
    apOverlay.classList.add('is-active');

    setTimeout(function () {
      var closeBtn = document.getElementById('ap-close');
      if (closeBtn) closeBtn.focus();
    }, 60);
  }

  /* ── Fermeture ──────────────────────────────────────────── */
  function apClose() {
    if (!apOverlay) return;
    clearTimeout(apTextTimer);
    clearTimeout(apEnteringTimer);
    apOverlay.classList.remove('is-active');
    var trigger = apTrigger;
    apTrigger = null;
    setTimeout(function () {
      if (!apOverlay.classList.contains('is-active')) {
        apOverlay.style.display = 'none';
        document.body.style.overflow = '';
        if (trigger) trigger.focus();
      }
    }, 360);
  }

  /* ── Pile de cartes ─────────────────────────────────────── */
  function apUpdateStack() {
    apPhotoEls.forEach(function (card, cardIndex) {
      var slot = (cardIndex - apCurrentIndex + ARTIST_DATA.length) % ARTIST_DATA.length;
      card.dataset.slot = String(slot);
    });
  }

  /* ── Navigation entre les aspects ──────────────────────── */
  function apGoTo(newIndex) {
    if (newIndex === apCurrentIndex) return;

    /* Sortie du texte */
    clearTimeout(apTextTimer);
    apContentInner.classList.add('is-hidden');

    /* Mise à jour de la pile */
    apCurrentIndex = newIndex;
    apUpdateStack();

    /* Animation d'entrée sur la nouvelle carte active */
    apPhotoEls.forEach(function (c) { c.classList.remove('is-entering'); });
    var activeCard = apFindBySlot(0);
    if (activeCard) {
      activeCard.offsetHeight; /* force reflow pour relancer l'animation */
      activeCard.classList.add('is-entering');
      clearTimeout(apEnteringTimer);
      apEnteringTimer = setTimeout(function () {
        activeCard.classList.remove('is-entering');
      }, 460);
    }

    /* Entrée du texte après la sortie */
    apTextTimer = setTimeout(function () {
      apRenderSlide(apCurrentIndex, true);
      apContentInner.classList.remove('is-hidden');
    }, 210);
  }

  /* ── Rendu du contenu textuel ───────────────────────────── */
  function apRenderSlide(index, animateWords) {
    var lang = apGetLang();
    var data = ARTIST_DATA[index];
    if (!data) return;
    apNameEl.textContent  = data.name;
    apRoleEl.textContent  = data.role[lang]  || data.role['fr'];
    if (animateWords) {
      apRenderWords(data.quote[lang] || data.quote['fr'], apQuoteEl);
    } else {
      apQuoteEl.textContent = data.quote[lang] || data.quote['fr'];
    }
  }

  /* ── Animation mot par mot ──────────────────────────────── */
  function apRenderWords(text, container) {
    container.innerHTML = '';
    var words = text.split(' ');
    for (var i = 0; i < words.length; i++) {
      var span = document.createElement('span');
      span.className = 'ap-word';
      span.textContent = words[i];
      span.style.animationDelay = (i * 20) + 'ms';
      container.appendChild(span);
      if (i < words.length - 1) {
        container.appendChild(document.createTextNode(' '));
      }
    }
  }

  /* ── Déclencheur — clic sur .brand ─────────────────────── */
  function apInitBrandTriggers() {
    document.querySelectorAll('a.brand').forEach(function (brandEl) {
      if (brandEl.dataset.artistPopupBound) return;
      brandEl.dataset.artistPopupBound = 'true';
      brandEl.addEventListener('click', function (e) {
        e.preventDefault();
        apOpen(brandEl);
      });
    });
  }

  /* ── Init au chargement ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    apBuild();
    apInitBrandTriggers();
  });

}());
