/**
 * Indirah — main.js
 *
 * Gère :
 *  - le flux mobile de cartes (mobile-feed)
 *  - la lightbox
 *
 * Dépend de js/oeuvres-data.js et js/translations.js chargés avant ce fichier.
 * Utilise window.IndirahUI (js/nav.js) pour l'inert, le verrou de défilement
 * et le piège de focus, avec repli sans erreur s'il est absent.
 */

/* ── Données — dérivées de js/oeuvres-data.js ────────────────
   Pour ajouter une œuvre : modifier oeuvres-data.js uniquement.
─────────────────────────────────────────────────────────────── */
var series = Object.keys(oeuvresData).map(function(key) {
  return oeuvresData[key];
});

/* ── Langue (stockage protégé : localStorage peut être indisponible) ── */
function readLang() {
  if (window.IndirahI18n) return window.IndirahI18n.getLanguage();
  try { return window.localStorage.getItem('indirah-lang') || 'fr'; } catch (e) { return 'fr'; }
}

/* ── État ─────────────────────────────────────────────────── */
var currentLang      = readLang();
var lightboxTrigger  = null;
var lightboxTriggerId = null;

window.addEventListener('indirah:languagechange', function () {
  currentLang = readLang();
  buildDesktopGrids();
  buildMobileFeed();
  if (lightboxOpen) showLightboxImage(lightboxIndex);
});

function ui() {
  return window.IndirahUI || null;
}

function reducedMotion() {
  var u = ui();
  if (u) return u.prefersReducedMotion();
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function tr(key) {
  var t = translations[currentLang] || translations.fr;
  return (t && t[key]) || (translations.fr && translations.fr[key]) || '';
}

function format(template, values) {
  return String(template || '').replace(/\{(\w+)\}/g, function (match, name) {
    return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match;
  });
}

function localized(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[currentLang] || value.fr || '';
}

function isPlaceholderValue(value) {
  return !value || /^\s*\[[^\]]+\]\s*$/.test(value);
}

function setMetaField(id, value) {
  var el = document.getElementById(id);
  if (!el) return;
  var normalized = (value || '').trim();
  var group = el.closest ? el.closest('div') : el.parentNode;
  if (isPlaceholderValue(normalized)) {
    el.textContent = '';
    if (group) group.hidden = true;
    return;
  }
  el.textContent = normalized;
  if (group) group.hidden = false;
}

function cardMeta(work) {
  var t = translations[currentLang];
  return [t[work.techniqueKey] || '', localized(work.year), localized(work.dimensions), localized(work.availability)]
    .filter(function (value) { return !isPlaceholderValue(value); });
}

function workLabel(work) {
  var t = translations[currentLang];
  var title = t[work.titleKey] || '';
  var tech  = t[work.techniqueKey] || '';
  return title + (tech ? ', ' + tech.toLowerCase() : '');
}

function getFocusable(container) {
  var u = ui();
  if (u) return u.getFocusable(container);
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(function(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  });
}

/* Dérivé d'image absent (œuvre incomplète dans oeuvres-data.js) : un seul
   avertissement par œuvre et par champ, aucune URL undefined, aucun repli
   vers une image pleine résolution. */
var warnedDerivatives = {};

function hasDerivative(work, field) {
  if (work && work[field]) return true;
  var key = (work && work.id) + ':' + field;
  if (!warnedDerivatives[key]) {
    warnedDerivatives[key] = true;
    if (window.console && typeof console.warn === 'function') {
      console.warn('[Indirah] Œuvre « ' + (work && work.id) + ' » : dérivé « ' + field + ' » manquant, image ignorée.');
    }
  }
  return false;
}

function isVisible(el) {
  var u = ui();
  if (u) return u.isVisible(el);
  return !!(el && el.isConnected && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
}


/* ══════════════════════════════════════════════════════════
   MOBILE FEED — flux vertical de cartes
   Les séries publiées vont dans #mobile-feed ; les séries « à venir »
   dans #mobile-feed-after, placé après l'annonce éditoriale statique.
══════════════════════════════════════════════════════════ */

function buildMobileFeed() {
  var feed = document.getElementById('mobile-feed');
  if (!feed) return;
  var feedAfter = document.getElementById('mobile-feed-after') || feed;
  feed.innerHTML = '';
  if (feedAfter !== feed) feedAfter.innerHTML = '';

  var t = translations[currentLang];

  series.forEach(function(serie) {
    var target = serie.status === 'upcoming' ? feedAfter : feed;
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
      target.appendChild(group);
      return;
    }

    group.appendChild(header);

    /* Grille de cartes */
    var grid = document.createElement('div');
    grid.className = 'mobile-cards-grid';

    serie.works.forEach(function(work) {
      /* Sans vignette, la carte ne peut pas s'afficher correctement. */
      if (!hasDerivative(work, 'srcThumb')) return;
      /* Carte = véritable bouton : clavier (Entrée, Espace) natif. */
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'mobile-card';
      card.dataset.workId = work.id;
      card.dataset.i18nAltTitle     = work.titleKey;
      card.dataset.i18nAltTechnique = work.techniqueKey;
      card.setAttribute('aria-label', workLabel(work));

      /* Image */
      var imgWrap = document.createElement('span');
      imgWrap.className = 'mobile-card-image';

      var img = document.createElement('img');
      img.src = work.srcThumb;
      if (work.thumbWidth && work.thumbHeight) {
        img.setAttribute('width', work.thumbWidth);
        img.setAttribute('height', work.thumbHeight);
      }
      img.alt = workLabel(work);
      img.dataset.i18nAltTitle     = work.titleKey;
      img.dataset.i18nAltTechnique = work.techniqueKey;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);

      /* Bloc texte */
      var info = document.createElement('span');
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
      cardDetails.textContent = [localized(work.year), localized(work.dimensions), localized(work.availability)]
        .filter(function (value) { return !isPlaceholderValue(value); })
        .join(' · ');
      if (cardDetails.textContent) info.appendChild(cardDetails);

      card.appendChild(info);

      /* Lightbox au tap / clic / clavier sur la carte mobile */
      card.addEventListener('click', function() { openLightbox(work.id, card); });

      grid.appendChild(card);
    });

    group.appendChild(grid);
    target.appendChild(group);
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
      if (!hasDerivative(work, 'srcThumb')) return;
      var item = document.createElement('div');
      item.className = 'serie-grid-item';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'serie-grid-btn';
      btn.dataset.workId = work.id;
      btn.dataset.i18nAltTitle     = work.titleKey;
      btn.dataset.i18nAltTechnique = work.techniqueKey;

      var img = document.createElement('img');
      img.src = work.srcThumb;
      if (work.thumbWidth && work.thumbHeight) {
        img.setAttribute('width', work.thumbWidth);
        img.setAttribute('height', work.thumbHeight);
      }
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.dataset.i18nAltTitle     = work.titleKey;
      img.dataset.i18nAltTechnique = work.techniqueKey;

      var title = t[work.titleKey] || '';
      var label = workLabel(work);
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
      btn.addEventListener('click', function() { openLightbox(work.id, btn); });
      item.appendChild(btn);
      grid.appendChild(item);
    });
  });
}


/* ══════════════════════════════════════════════════════════
   LIGHTBOX
   Toutes les fermetures (bouton, Échap, clic extérieur, geste tactile)
   passent par closeLightbox() : focus, inert, défilement et styles
   inline sont restitués au même endroit.
══════════════════════════════════════════════════════════ */

var lightboxWorks = [];
var lightboxIndex = 0;
var lightboxLoadToken = 0;
var lightboxOpen = false;
var lightboxTimers = [];
var releaseLightboxInert = null;
var releaseLightboxScroll = null;

function lightboxLater(fn, delay) {
  var id = window.setTimeout(function () {
    lightboxTimers = lightboxTimers.filter(function (t) { return t !== id; });
    fn();
  }, delay);
  lightboxTimers.push(id);
}

function clearLightboxTimers() {
  lightboxTimers.forEach(function (id) { window.clearTimeout(id); });
  lightboxTimers = [];
}

function findWorkById(id) {
  for (var i = 0; i < series.length; i++) {
    for (var j = 0; j < series[i].works.length; j++) {
      if (series[i].works[j].id === id) {
        /* La lightbox ne parcourt que les œuvres dotées d'une image. */
        var works = series[i].works.filter(function (w) { return hasDerivative(w, 'srcLightbox'); });
        var index = works.indexOf(series[i].works[j]);
        return index === -1 ? null : { serieWorks: works, index: index };
      }
    }
  }
  return null;
}

/* L'image est créée ici plutôt que dans le HTML : pas d'<img> sans source
   (ni requête vers la page courante) avant la première ouverture. */
function ensureLightboxImage() {
  var img = document.getElementById('lightbox-img');
  if (img) return img;
  var content = document.getElementById('lightbox-content');
  if (!content) return null;
  img = document.createElement('img');
  img.className = 'lightbox-img';
  img.id = 'lightbox-img';
  img.alt = '';
  img.decoding = 'async';
  content.insertBefore(img, content.firstChild);
  return img;
}

/* Indicateurs mis à jour sur place : le point qui a le focus n'est jamais
   détruit lors d'un changement d'œuvre. */
function updatePositionDots() {
  var container = document.getElementById('lightbox-position');
  if (!container) return;
  if (container.children.length !== lightboxWorks.length) {
    container.innerHTML = '';
    for (var i = 0; i < lightboxWorks.length; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'lightbox-position-dot';
      dot.dataset.index = String(i);
      container.appendChild(dot);
    }
  }
  Array.prototype.forEach.call(container.children, function (dot, index) {
    var active = index === lightboxIndex;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-label', format(tr('lightbox_goto'), { n: index + 1 }));
    if (active) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
}

function showLightboxImage(index) {
  var work = lightboxWorks[index];
  var img = ensureLightboxImage();
  if (!work || !img) return;
  var t    = translations[currentLang];
  var lightboxSrc = work.srcLightbox;
  var token = ++lightboxLoadToken;
  img.alt = (t[work.titleKey] || '') + ', ' + (t[work.techniqueKey] || '').toLowerCase();
  if (img.getAttribute('src') !== lightboxSrc) {
    img.classList.add('is-loading');
    img.onload = function () {
      if (token === lightboxLoadToken) img.classList.remove('is-loading');
    };
    img.onerror = function () {
      if (token === lightboxLoadToken) img.classList.remove('is-loading');
    };
    img.src = lightboxSrc;
  } else {
    img.classList.remove('is-loading');
  }
  document.getElementById('lightbox-caption-title').textContent     = t[work.titleKey]     || '';
  setMetaField('lightbox-caption-technique', t[work.techniqueKey] || '');
  setMetaField('lightbox-caption-year', localized(work.year));
  setMetaField('lightbox-caption-dimensions', localized(work.dimensions));
  setMetaField('lightbox-caption-availability', localized(work.availability));
  document.getElementById('lightbox-caption-story').textContent = localized(work.story);
  updatePositionDots();
}

/* Annonce sobre du changement d'œuvre (une seule région live, polie). */
function announceLightbox() {
  var status = document.getElementById('lightbox-status');
  var work = lightboxWorks[lightboxIndex];
  if (!status || !work) return;
  status.textContent = format(tr('lightbox_position'), {
    n: lightboxIndex + 1,
    total: lightboxWorks.length,
    title: tr(work.titleKey)
  });
}

function goToLightbox(index) {
  if (!lightboxOpen || !lightboxWorks.length) return;
  lightboxIndex = (index + lightboxWorks.length) % lightboxWorks.length;
  showLightboxImage(lightboxIndex);
  announceLightbox();
}

function resetLightboxStyles() {
  var overlay = document.getElementById('lightbox-overlay');
  var img     = document.getElementById('lightbox-img');
  if (overlay) { overlay.style.opacity = ''; overlay.style.transition = ''; }
  if (img) { img.style.transform = ''; img.style.transition = ''; }
}

function openLightbox(id, trigger) {
  var overlay = document.getElementById('lightbox-overlay');
  if (!overlay || lightboxOpen) return;
  var result = findWorkById(id);
  if (!result) return;
  lightboxWorks = result.serieWorks;
  lightboxIndex = result.index;
  lightboxTrigger = trigger || document.activeElement;
  lightboxTriggerId = id;

  clearLightboxTimers();
  resetLightboxStyles();
  var status = document.getElementById('lightbox-status');
  if (status) status.textContent = '';
  showLightboxImage(lightboxIndex);

  lightboxOpen = true;
  overlay.hidden = false;
  overlay.removeAttribute('inert');
  overlay.offsetHeight; /* reflow avant la transition d'opacité */
  overlay.classList.add('active');

  var u = ui();
  releaseLightboxScroll = u ? u.lockScroll() : null;
  var closeBtn = document.getElementById('lightbox-close');
  if (closeBtn) closeBtn.focus();
  /* Arrière-plan neutralisé une fois le focus dans la lightbox. */
  releaseLightboxInert = u ? u.inertOutside([overlay]) : null;
  if (u) u.notifyOverlayChange();
}

/* Retour du focus sur le déclencheur ; si la grille a été reconstruite
   entre-temps (changement de langue), sur la carte de la même œuvre. */
function restoreLightboxFocus() {
  var target = lightboxTrigger;
  var id = lightboxTriggerId;
  lightboxTrigger = null;
  if (!target || !isVisible(target)) {
    target = null;
    var candidates = document.querySelectorAll('[data-work-id]');
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].dataset.workId === id && isVisible(candidates[i])) {
        target = candidates[i];
        break;
      }
    }
  }
  if (target && typeof target.focus === 'function') target.focus();
}

function finishLightboxClose() {
  if (lightboxOpen) return;
  var overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;
  overlay.hidden = true;
  overlay.removeAttribute('inert');
  resetLightboxStyles();
}

function closeLightbox(options) {
  var overlay = document.getElementById('lightbox-overlay');
  if (!overlay || !lightboxOpen) return;
  options = options || {};
  lightboxOpen = false;
  clearLightboxTimers();
  overlay.classList.remove('active');
  if (releaseLightboxInert) { releaseLightboxInert(); releaseLightboxInert = null; }
  if (releaseLightboxScroll) { releaseLightboxScroll(); releaseLightboxScroll = null; }
  /* Focus restitué tout de suite, sans attendre la fin du fondu. */
  restoreLightboxFocus();
  overlay.setAttribute('inert', '');
  var u = ui();
  if (u) u.notifyOverlayChange();
  if (options.immediate || reducedMotion()) finishLightboxClose();
  else lightboxLater(finishLightboxClose, 300);
}

function initLightbox() {
  var overlay  = document.getElementById('lightbox-overlay');
  var closeBtn = document.getElementById('lightbox-close');
  var prevBtn  = document.getElementById('lightbox-prev');
  var nextBtn  = document.getElementById('lightbox-next');
  var content  = document.getElementById('lightbox-content');

  if (!overlay || !content || overlay.dataset.lightboxBound) return;
  overlay.dataset.lightboxBound = 'true';
  ensureLightboxImage();

  /* Fermeture */
  if (closeBtn) closeBtn.addEventListener('click', function () { closeLightbox(); });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target === content) closeLightbox();
  });

  /* Navigation dans la série */
  if (prevBtn) prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    goToLightbox(lightboxIndex - 1);
  });
  if (nextBtn) nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    goToLightbox(lightboxIndex + 1);
  });
  var position = document.getElementById('lightbox-position');
  if (position) {
    position.addEventListener('click', function(e) {
      var dot = e.target.closest ? e.target.closest('.lightbox-position-dot') : null;
      if (!dot || !position.contains(dot)) return;
      e.stopPropagation();
      goToLightbox(Number(dot.dataset.index));
    });
  }

  /* Clavier : Échap, flèches, piège de focus */
  document.addEventListener('keydown', function(e) {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goToLightbox(lightboxIndex - 1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToLightbox(lightboxIndex + 1); return; }
    if (e.key !== 'Tab') return;
    var u = ui();
    if (u) { u.trapTab(e, overlay); return; }
    var focusable = getFocusable(overlay);
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Swipe mobile */
  initMobileSwipe();
}


/* ══════════════════════════════════════════════════════════
   SWIPE MOBILE — navigation et fermeture par geste tactile
   Sous prefers-reduced-motion : mêmes gestes, sans déplacement animé.
══════════════════════════════════════════════════════════ */

function initMobileSwipe() {
  var overlay = document.getElementById('lightbox-overlay');
  var content = document.getElementById('lightbox-content');
  var img     = ensureLightboxImage();
  if (!content || !img || !overlay) return;

  var touchStartX = 0, touchStartY = 0, lastX = 0, lastY = 0;
  var swipeDir = null;
  var still = false;

  /* Remet le geste à l'état initial (styles inline et état interne), sans
     fermer la lightbox, sans changer d'œuvre et sans toucher au focus. */
  function resetGesture() {
    img.style.transform      = '';
    img.style.transition     = '';
    overlay.style.opacity    = '';
    overlay.style.transition = '';
    touchStartX = 0;
    touchStartY = 0;
    lastX = 0;
    lastY = 0;
    swipeDir = null;
  }

  function slide(step, outX) {
    if (still) { goToLightbox(lightboxIndex + step); return; }
    img.style.transition = 'transform 0.3s ease';
    img.style.transform = 'translateX(' + outX + 'vw)';
    lightboxLater(function() {
      goToLightbox(lightboxIndex + step);
      img.style.transition = 'none';
      img.style.transform  = 'translateX(' + (-outX) + 'vw)';
      img.offsetHeight;
      img.style.transition = 'transform 0.3s ease';
      img.style.transform  = 'translateX(0)';
    }, 280);
  }

  content.addEventListener('touchstart', function(e) {
    if (!lightboxOpen) return;
    var touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    lastX = touch.clientX;
    lastY = touch.clientY;
    swipeDir = null;
    still = reducedMotion();
    if (!still) {
      img.style.transition     = 'none';
      overlay.style.transition = 'none';
    }
  }, { passive: true });

  content.addEventListener('touchmove', function(e) {
    if (!lightboxOpen || !e.touches.length) return;
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
      if (!still) img.style.transform = 'translateX(' + dx + 'px)';
    } else if (swipeDir === 'v') {
      e.preventDefault();
      if (still) return;
      var clampedDy = Math.max(0, dy);
      img.style.transform = 'translateY(' + clampedDy + 'px)';
      overlay.style.opacity = String(Math.max(0.05, 1 - clampedDy / 220));
    }
  }, { passive: false });

  content.addEventListener('touchend', function() {
    if (!lightboxOpen) return;
    var dx = lastX - touchStartX;
    var dy = lastY - touchStartY;

    if (swipeDir === 'h') {
      if (dx < -80) slide(1, -110);
      else if (dx > 80) slide(-1, 110);
      else if (!still) {
        img.style.transition = 'transform 0.3s ease';
        img.style.transform = 'translateX(0)';
      }
    } else if (swipeDir === 'v') {
      if (dy > 100) {
        if (still) { closeLightbox({ immediate: true }); return; }
        img.style.transition     = 'transform 0.3s ease';
        overlay.style.transition = 'opacity 0.3s ease';
        img.style.transform   = 'translateY(80vh)';
        overlay.style.opacity = '0';
        /* Même chemin que les autres fermetures (focus, inert, scroll). */
        lightboxLater(function() { closeLightbox({ immediate: true }); }, 300);
      } else if (!still) {
        img.style.transition     = 'transform 0.3s ease';
        overlay.style.transition = 'opacity 0.3s ease';
        img.style.transform   = 'translateY(0)';
        overlay.style.opacity = '1';
        lightboxLater(function() { overlay.style.transition = ''; overlay.style.opacity = ''; }, 300);
      }
    } else {
      resetGesture();
    }
  }, { passive: true });

  /* Geste annulé par le navigateur ou le système : retour à l'état neutre. */
  content.addEventListener('touchcancel', function() {
    resetGesture();
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
