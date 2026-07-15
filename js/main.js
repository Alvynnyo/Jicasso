/**
 * Indirah — main.js
 *
 * Gère :
 *  - le flux mobile de cartes (mobile-feed)
 *  - la lightbox
 *
 * Dépend de js/oeuvres-data.js et js/translations.js chargés avant ce fichier.
 */

/* ── Données — dérivées de js/oeuvres-data.js ────────────────
   Pour ajouter une œuvre : modifier oeuvres-data.js uniquement.
─────────────────────────────────────────────────────────────── */
var series = Object.keys(oeuvresData).map(function(key) {
  return oeuvresData[key];
});

/* ── État ─────────────────────────────────────────────────── */
var currentLang      = window.IndirahI18n ? window.IndirahI18n.getLanguage() : (localStorage.getItem('indirah-lang') || 'fr');
var lightboxTrigger  = null;

window.addEventListener('indirah:languagechange', function () {
  currentLang = window.IndirahI18n ? window.IndirahI18n.getLanguage() : currentLang;
  buildDesktopGrids();
  buildMobileFeed();
  var overlay = document.getElementById('lightbox-overlay');
  if (overlay && overlay.classList.contains('active')) showLightboxImage(lightboxIndex);
});

function localized(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[currentLang] || value.fr || '';
}

function cardMeta(work) {
  var t = translations[currentLang];
  return [t[work.techniqueKey] || '', localized(work.year), localized(work.dimensions), localized(work.availability)].filter(Boolean);
}

function getFocusable(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(function(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  });
}


/* ══════════════════════════════════════════════════════════
   MOBILE FEED — flux vertical de cartes
══════════════════════════════════════════════════════════ */

function buildMobileFeed() {
  var feed = document.getElementById('mobile-feed');
  if (!feed) return;
  feed.innerHTML = '';

  var t = translations[currentLang];

  series.forEach(function(serie) {
    var group = document.createElement('div');
    group.className = 'mobile-group';

    /* Séparateur (caché pour le premier groupe via CSS) */
    var divider = document.createElement('div');
    divider.className = 'mobile-group-divider';
    group.appendChild(divider);

    /* En-tête de série */
    var header = document.createElement('div');
    header.className = 'mobile-group-header';

    var title = document.createElement('h2');
    title.className = 'mobile-group-title';
    title.setAttribute('data-i18n', serie.titleKey);
    title.textContent = t[serie.titleKey] || '';
    header.appendChild(title);

    var text = document.createElement('p');
    text.className = 'mobile-group-text';
    text.setAttribute('data-i18n', serie.textKey);
    text.textContent = t[serie.textKey] || '';
    header.appendChild(text);

    if (serie.status === 'upcoming') {
      header.classList.add('mobile-series-teaser');
      group.appendChild(header);
      feed.appendChild(group);
      return;
    }

    group.appendChild(header);

    /* Grille de cartes */
    var grid = document.createElement('div');
    grid.className = 'mobile-cards-grid';

    serie.works.forEach(function(work) {
      var card = document.createElement('article');
      card.className = 'mobile-card';

      /* Image */
      var imgWrap = document.createElement('div');
      imgWrap.className = 'mobile-card-image';

      var img = document.createElement('img');
      img.src = work.src;
      img.alt = (t[work.titleKey] || '') + (t[work.techniqueKey] ? ', ' + t[work.techniqueKey].toLowerCase() : '');
      img.dataset.i18nAltTitle     = work.titleKey;
      img.dataset.i18nAltTechnique = work.techniqueKey;
      img.setAttribute('loading', 'lazy');
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);

      /* Bloc texte */
      var info = document.createElement('div');
      info.className = 'mobile-card-info';

      var cardTitle = document.createElement('span');
      cardTitle.className = 'mobile-card-title';
      cardTitle.setAttribute('data-i18n', work.titleKey);
      cardTitle.textContent = t[work.titleKey] || '';
      info.appendChild(cardTitle);

      var cardTechnique = document.createElement('span');
      cardTechnique.className = 'mobile-card-technique';
      cardTechnique.setAttribute('data-i18n', work.techniqueKey);
      cardTechnique.textContent = t[work.techniqueKey] || '';
      info.appendChild(cardTechnique);

      var cardDetails = document.createElement('span');
      cardDetails.className = 'mobile-card-details';
      cardDetails.textContent = cardMeta(work).slice(1).join(' · ');
      info.appendChild(cardDetails);

      card.appendChild(info);

      /* Accessibilité clavier */
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      /* Lightbox au tap/clic/clavier sur la carte mobile */
      card.addEventListener('click', function() { openLightbox(work.src, card); });
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(work.src, card);
        }
      });

      grid.appendChild(card);
    });

    group.appendChild(grid);
    feed.appendChild(group);
  });
}


/* ══════════════════════════════════════════════════════════
   GALERIE DESKTOP — grilles générées depuis oeuvresData
══════════════════════════════════════════════════════════ */

function buildDesktopGrids() {
  var t = translations[currentLang];

  document.querySelectorAll('.serie-grid[data-serie]').forEach(function(grid) {
    var key = grid.dataset.serie;
    var sd  = oeuvresData[key];
    if (!sd) return;

    grid.innerHTML = '';

    sd.works.forEach(function(work) {
      var item = document.createElement('div');
      item.className = 'serie-grid-item';

      var btn = document.createElement('button');
      btn.className = 'serie-grid-btn';
      btn.dataset.i18nAltTitle     = work.titleKey;
      btn.dataset.i18nAltTechnique = work.techniqueKey;

      var img = document.createElement('img');
      img.src = work.src;
      img.setAttribute('loading', 'lazy');
      img.dataset.i18nAltTitle     = work.titleKey;
      img.dataset.i18nAltTechnique = work.techniqueKey;

      var title = t[work.titleKey] || '';
      var tech  = t[work.techniqueKey] || '';
      var label = title + (tech ? ', ' + tech.toLowerCase() : '');
      img.alt = label;
      btn.setAttribute('aria-label', label);

      btn.appendChild(img);

      var info = document.createElement('span');
      info.className = 'serie-grid-info';
      var cardTitle = document.createElement('span');
      cardTitle.className = 'serie-grid-title';
      cardTitle.setAttribute('data-i18n', work.titleKey);
      cardTitle.textContent = title;
      var details = document.createElement('span');
      details.className = 'serie-grid-details';
      details.textContent = cardMeta(work).join(' · ');
      info.appendChild(cardTitle);
      info.appendChild(details);
      btn.appendChild(info);
      btn.addEventListener('click', function() { openLightbox(work.src, btn); });
      item.appendChild(btn);
      grid.appendChild(item);
    });
  });
}


/* ══════════════════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════════════════ */

var lightboxWorks = [];
var lightboxIndex = 0;

function findWorkBySrc(src) {
  for (var i = 0; i < series.length; i++) {
    for (var j = 0; j < series[i].works.length; j++) {
      if (series[i].works[j].src === src) {
        return { serieWorks: series[i].works, index: j };
      }
    }
  }
  return null;
}

function updatePositionDots() {
  var container = document.getElementById('lightbox-position');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < lightboxWorks.length; i++) {
    var dot = document.createElement('span');
    dot.className = 'lightbox-position-dot' + (i === lightboxIndex ? ' active' : '');
    container.appendChild(dot);
  }
}

function showLightboxImage(index) {
  var work = lightboxWorks[index];
  var t    = translations[currentLang];
  document.getElementById('lightbox-img').src = work.src;
  document.getElementById('lightbox-img').alt = (t[work.titleKey] || '') + ', ' + (t[work.techniqueKey] || '').toLowerCase();
  document.getElementById('lightbox-caption-title').textContent     = t[work.titleKey]     || '';
  document.getElementById('lightbox-caption-technique').textContent = t[work.techniqueKey] || '';
  document.getElementById('lightbox-caption-year').textContent = localized(work.year);
  document.getElementById('lightbox-caption-dimensions').textContent = localized(work.dimensions);
  document.getElementById('lightbox-caption-availability').textContent = localized(work.availability);
  document.getElementById('lightbox-caption-story').textContent = localized(work.story);
  updatePositionDots();
}

function openLightbox(src, trigger) {
  var result = findWorkBySrc(src);
  if (!result) return;
  lightboxWorks = result.serieWorks;
  lightboxIndex = result.index;
  showLightboxImage(lightboxIndex);
  lightboxTrigger = trigger || null;
  var overlay = document.getElementById('lightbox-overlay');
  var img     = document.getElementById('lightbox-img');
  if (img) { img.style.transform = ''; img.style.transition = ''; }
  overlay.style.display = 'flex';
  overlay.offsetHeight;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(function() {
    var closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) closeBtn.focus();
  }, 50);
}

function closeLightbox() {
  var overlay = document.getElementById('lightbox-overlay');
  overlay.classList.remove('active');
  var trigger = lightboxTrigger;
  lightboxTrigger = null;
  setTimeout(function() {
    if (!overlay.classList.contains('active')) {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      var img = document.getElementById('lightbox-img');
      if (img) { img.style.transform = ''; img.style.transition = ''; }
      if (trigger) trigger.focus();
    }
  }, 300);
}

function initLightbox() {
  var overlay  = document.getElementById('lightbox-overlay');
  var closeBtn = document.getElementById('lightbox-close');
  var prevBtn  = document.getElementById('lightbox-prev');
  var nextBtn  = document.getElementById('lightbox-next');
  var content  = document.getElementById('lightbox-content');

  if (!overlay) return;

  /* Fermeture */
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target === content) closeLightbox();
  });

  /* Navigation dans la série */
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex - 1 + lightboxWorks.length) % lightboxWorks.length;
    showLightboxImage(lightboxIndex);
  });
  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex + 1) % lightboxWorks.length;
    showLightboxImage(lightboxIndex);
  });

  /* Touches clavier */
  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape')      { closeLightbox(); }
    if (e.key === 'ArrowLeft')   { e.preventDefault(); lightboxIndex = (lightboxIndex - 1 + lightboxWorks.length) % lightboxWorks.length; showLightboxImage(lightboxIndex); }
    if (e.key === 'ArrowRight')  { e.preventDefault(); lightboxIndex = (lightboxIndex + 1) % lightboxWorks.length; showLightboxImage(lightboxIndex); }
  });

  /* Piège de focus dans la lightbox */
  overlay.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('active') || e.key !== 'Tab') return;
    var focusable = getFocusable(overlay);
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Swipe mobile */
  initMobileSwipe();
}


/* ══════════════════════════════════════════════════════════
   SWIPE MOBILE — navigation et fermeture par geste tactile
══════════════════════════════════════════════════════════ */

function initMobileSwipe() {
  var overlay = document.getElementById('lightbox-overlay');
  var content = document.getElementById('lightbox-content');
  var img     = document.getElementById('lightbox-img');
  if (!content || !img || !overlay) return;

  var touchStartX = 0, touchStartY = 0, lastX = 0, lastY = 0;
  var swipeDir = null;

  content.addEventListener('touchstart', function(e) {
    var touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    lastX = touch.clientX;
    lastY = touch.clientY;
    swipeDir = null;
    img.style.transition     = 'none';
    overlay.style.transition = 'none';
  }, { passive: true });

  content.addEventListener('touchmove', function(e) {
    if (!e.touches.length) return;
    var touch  = e.touches[0];
    var dx     = touch.clientX - touchStartX;
    var dy     = touch.clientY - touchStartY;
    lastX = touch.clientX;
    lastY = touch.clientY;

    if (!swipeDir) {
      if (Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy)) swipeDir = 'h';
      else if (dy > 15 && dy > Math.abs(dx))                 swipeDir = 'v';
    }

    if (swipeDir === 'h') {
      e.preventDefault();
      img.style.transform = 'translateX(' + dx + 'px)';
    } else if (swipeDir === 'v') {
      e.preventDefault();
      var clampedDy = Math.max(0, dy);
      img.style.transform = 'translateY(' + clampedDy + 'px)';
      overlay.style.opacity = String(Math.max(0.05, 1 - clampedDy / 220));
    }
  }, { passive: false });

  content.addEventListener('touchend', function() {
    var dx = lastX - touchStartX;
    var dy = lastY - touchStartY;

    if (swipeDir === 'h') {
      img.style.transition = 'transform 0.3s ease';
      if (dx < -80) {
        img.style.transform = 'translateX(-110vw)';
        setTimeout(function() {
          lightboxIndex = (lightboxIndex + 1) % lightboxWorks.length;
          showLightboxImage(lightboxIndex);
          img.style.transition = 'none';
          img.style.transform  = 'translateX(110vw)';
          img.offsetHeight;
          img.style.transition = 'transform 0.3s ease';
          img.style.transform  = 'translateX(0)';
        }, 280);
      } else if (dx > 80) {
        img.style.transform = 'translateX(110vw)';
        setTimeout(function() {
          lightboxIndex = (lightboxIndex - 1 + lightboxWorks.length) % lightboxWorks.length;
          showLightboxImage(lightboxIndex);
          img.style.transition = 'none';
          img.style.transform  = 'translateX(-110vw)';
          img.offsetHeight;
          img.style.transition = 'transform 0.3s ease';
          img.style.transform  = 'translateX(0)';
        }, 280);
      } else {
        img.style.transform = 'translateX(0)';
      }
    } else if (swipeDir === 'v') {
      img.style.transition     = 'transform 0.3s ease';
      overlay.style.transition = 'opacity 0.3s ease';
      if (dy > 100) {
        img.style.transform   = 'translateY(80vh)';
        overlay.style.opacity = '0';
        setTimeout(function() {
          overlay.classList.remove('active');
          overlay.style.display    = 'none';
          overlay.style.opacity    = '';
          overlay.style.transition = '';
          img.style.transform  = '';
          img.style.transition = '';
          document.body.style.overflow = '';
        }, 300);
      } else {
        img.style.transform   = 'translateY(0)';
        overlay.style.opacity = '1';
        setTimeout(function() { overlay.style.transition = ''; }, 300);
      }
    } else {
      img.style.transform = '';
    }
  }, { passive: true });
}


/* ══════════════════════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

  /* Desktop series grids */
  buildDesktopGrids();

  /* Mobile feed */
  buildMobileFeed();

  /* Lightbox */
  initLightbox();
});
