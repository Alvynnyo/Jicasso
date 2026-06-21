/**
 * Indirah — oeuvres.js
 * Gère : langue FR/EN, menu hamburger, séquence "Une nuit au musée".
 * Dépend de js/translations.js chargé avant ce fichier.
 */

/* ── Langue ───────────────────────────────────────────────── */
var currentLang = localStorage.getItem('indirah-lang') || 'fr';

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('indirah-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key  = el.dataset.i18n;
    var text = translations[lang][key];
    if (text !== undefined) el.textContent = text;
  });

  document.querySelectorAll('.lang-option').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}


/* ── Données séquence ─────────────────────────────────────── */
var seriesVideos = {
  serie1: {
    videoSrc:     'videos/gardien.mp4',
    introTextKey: 'seq_intro_text',
    outroTextKey: 'seq_outro_text',
    paintings: [
      { src: 'images/serie-1/maria.png',      titleKey: 'work1_title', techniqueKey: 'work1_technique' },
      { src: 'images/serie-1/moryupdate.png', titleKey: 'work2_title', techniqueKey: 'work2_technique' },
      { src: 'images/serie-1/stepout.png',    titleKey: 'work3_title', techniqueKey: 'work3_technique' }
    ]
  }
};


/* ── État séquence ────────────────────────────────────────── */
var seqCurrentSerieKey = null;
var seqAborted = false;
var seqTimers  = [];


/* ── Helpers ─────────────────────────────────────────────── */

function seqWait(ms, fn) {
  var t = setTimeout(function() {
    if (!seqAborted) fn();
  }, ms);
  seqTimers.push(t);
}

function clearSeqTimers() {
  seqTimers.forEach(clearTimeout);
  seqTimers = [];
}

/* Rend une étape visible, masque les autres (sans flickering si déjà active) */
function showOnlyStep(stepId) {
  document.querySelectorAll('.seq-step').forEach(function(s) {
    if (s.id !== stepId) s.classList.remove('active');
  });
  var step = document.getElementById(stepId);
  if (step) step.classList.add('active');

  /* Adapter le bouton close selon le fond (clair = tableau, sombre = reste) */
  var overlay = document.getElementById('seq-overlay');
  overlay.dataset.step = stepId === 'seq-step-painting' ? 'painting' : 'dark';
}


/* ── Étapes de la séquence ────────────────────────────────── */

function runSeqVideo(serie) {
  showOnlyStep('seq-step-video');

  var video  = document.getElementById('seq-video');
  var source = video.querySelector('source');
  source.src = serie.videoSrc;
  video.load();

  function onEnded() {
    video.removeEventListener('ended', onEnded);
    if (!seqAborted) runSeqIntroText(serie);
  }
  video.addEventListener('ended', onEnded);

  var p = video.play();
  if (p && typeof p.catch === 'function') {
    p.catch(function() { if (!seqAborted) runSeqIntroText(serie); });
  }
}

function runSeqIntroText(serie) {
  showOnlyStep('seq-step-intro-text');

  var t      = translations[currentLang] || translations['fr'];
  var textEl = document.getElementById('seq-intro-text');

  textEl.textContent = t[serie.introTextKey] || '';
  textEl.style.transition = '';
  textEl.classList.remove('is-revealed', 'is-fading');
  textEl.offsetHeight; /* reflow */
  textEl.classList.add('is-revealed'); /* blur reveal 0.8s */

  /* 1.7s après le déclenchement → fade out (0.35s) → étape suivante */
  seqWait(1700, function() {
    textEl.classList.add('is-fading');
    seqWait(380, function() {
      runSeqPainting(serie, 0);
    });
  });
}

function runSeqPainting(serie, index) {
  if (index >= serie.paintings.length) {
    runSeqOutro(serie);
    return;
  }

  showOnlyStep('seq-step-painting');

  var t        = translations[currentLang] || translations['fr'];
  var painting = serie.paintings[index];
  var inner    = document.getElementById('seq-painting-inner');
  var img      = document.getElementById('seq-painting-img');

  /* Cut instantané entre tableaux — désactiver la transition le temps de reset */
  inner.style.transition = 'none';
  inner.classList.remove('is-visible');
  img.src = '';
  inner.offsetHeight; /* reflow */
  inner.style.transition = '';

  /* Remplir le contenu */
  img.src = painting.src;
  document.getElementById('seq-painting-title').textContent     = t[painting.titleKey]     || '';
  document.getElementById('seq-painting-technique').textContent = t[painting.techniqueKey] || '';
  document.getElementById('seq-painting-label').textContent     = t['seq_painting_label']  || 'RECHERCHE';
  document.getElementById('seq-painting-reward').textContent    = t['seq_painting_reward'] || 'RÉCOMPENSE : INESTIMABLE';

  /* Animation d'entrée (fade + scale, 0.4s) */
  inner.offsetHeight;
  inner.classList.add('is-visible');

  /* Affiche ~2.6s puis cut vers le tableau suivant */
  seqWait(2600, function() {
    runSeqPainting(serie, index + 1);
  });
}

function runSeqOutro(serie) {
  showOnlyStep('seq-step-outro');

  var t      = translations[currentLang] || translations['fr'];
  var textEl = document.getElementById('seq-outro-text');
  var sig    = document.getElementById('seq-signature');
  var replay = document.getElementById('seq-replay');

  textEl.textContent = t[serie.outroTextKey] || '';
  sig.classList.remove('is-visible');
  replay.classList.remove('is-visible');

  /* Blur reveal plus lent (1.2s) via style inline */
  textEl.style.transition = 'filter 1.2s ease, opacity 1.2s ease';
  textEl.classList.remove('is-revealed', 'is-fading');
  textEl.offsetHeight;
  textEl.classList.add('is-revealed');

  /* Signature après 1.4s (texte révélé à ~1.2s) */
  seqWait(1400, function() {
    sig.classList.add('is-visible');
  });

  /* Bouton Revoir après 2.2s */
  seqWait(2200, function() {
    replay.classList.add('is-visible');
  });
}


/* ── Contrôles overlay ────────────────────────────────────── */

function openSequence(serieKey) {
  var serie = seriesVideos[serieKey];
  if (!serie) return;

  seqCurrentSerieKey = serieKey;
  seqAborted = false;
  clearSeqTimers();

  document.getElementById('seq-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';

  runSeqVideo(serie);
}

function closeSequence() {
  seqAborted = true;
  clearSeqTimers();

  var video  = document.getElementById('seq-video');
  var source = video.querySelector('source');
  video.pause();
  source.src = '';

  /* Reset états visuels */
  document.querySelectorAll('.seq-step').forEach(function(s) { s.classList.remove('active'); });

  var introText = document.getElementById('seq-intro-text');
  var outroText = document.getElementById('seq-outro-text');
  var inner     = document.getElementById('seq-painting-inner');
  introText.classList.remove('is-revealed', 'is-fading');
  introText.style.transition = '';
  outroText.classList.remove('is-revealed', 'is-fading');
  outroText.style.transition = '';
  inner.style.transition = 'none';
  inner.classList.remove('is-visible');

  var overlay = document.getElementById('seq-overlay');
  overlay.classList.remove('active');
  overlay.dataset.step = '';
  document.body.style.overflow = '';
}

function replaySequence() {
  var serie = seriesVideos[seqCurrentSerieKey];
  if (!serie) return;

  seqAborted = false;
  clearSeqTimers();

  /* Reset complet */
  var introText = document.getElementById('seq-intro-text');
  var outroText = document.getElementById('seq-outro-text');
  var inner     = document.getElementById('seq-painting-inner');
  introText.classList.remove('is-revealed', 'is-fading');
  introText.style.transition = '';
  outroText.classList.remove('is-revealed', 'is-fading');
  outroText.style.transition = '';
  inner.style.transition = 'none';
  inner.classList.remove('is-visible');
  document.getElementById('seq-signature').classList.remove('is-visible');
  document.getElementById('seq-replay').classList.remove('is-visible');
  document.querySelectorAll('.seq-step').forEach(function(s) { s.classList.remove('active'); });

  runSeqVideo(serie);
}


/* ── Menu hamburger ───────────────────────────────────────── */
function initHamburgerMenu() {
  var btn      = document.getElementById('hamburger-btn');
  var menu     = document.getElementById('mobile-menu');
  var overlay  = document.getElementById('mobile-menu-overlay');
  var closeBtn = document.getElementById('mobile-menu-close');
  if (!btn || !menu || !overlay || !closeBtn) return;

  function openMenu() {
    overlay.style.display = 'block';
    menu.style.display    = 'flex';
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
    setTimeout(function() {
      if (!menu.classList.contains('active')) {
        overlay.style.display = 'none';
        menu.style.display    = 'none';
      }
    }, 260);
  }

  btn.addEventListener('click', function() {
    if (menu.classList.contains('active')) closeMenu();
    else openMenu();
  });
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  menu.querySelectorAll('a.mobile-menu-btn').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = link.getAttribute('href');
      e.preventDefault();
      closeMenu();
      if (href) setTimeout(function() { window.location.href = href; }, 260);
    });
  });

  document.querySelectorAll('#mobile-menu-lang .lang-option').forEach(function(opt) {
    opt.addEventListener('click', function() { setLanguage(opt.dataset.lang); });
  });
}


/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {

  setLanguage(currentLang);
  initHamburgerMenu();

  /* Toggle langue header */
  var langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', function(e) {
      var opt = e.target.closest('.lang-option');
      if (opt) setLanguage(opt.dataset.lang);
    });
  }

  /* Clic sur une carte vidéo → lancer la séquence */
  document.querySelectorAll('[data-serie]').forEach(function(card) {
    card.addEventListener('click', function() {
      openSequence(card.dataset.serie);
    });
  });

  /* Fermeture */
  document.getElementById('seq-close').addEventListener('click', closeSequence);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('seq-overlay').classList.contains('active')) {
      closeSequence();
    }
  });

  /* Revoir */
  document.getElementById('seq-replay').addEventListener('click', replaySequence);
});
