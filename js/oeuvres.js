/**
 * Indirah — oeuvres.js
 * Gère : langue FR/EN, menu hamburger, séquence "Une nuit au musée",
 *         lecteur vidéo personnalisé glassmorphism.
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


/* ── Helpers séquence ─────────────────────────────────────── */

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

function showOnlyStep(stepId) {
  document.querySelectorAll('.seq-step').forEach(function(s) {
    if (s.id !== stepId) s.classList.remove('active');
  });
  var step = document.getElementById(stepId);
  if (step) step.classList.add('active');
}


/* ═══════════════════════════════════════════════════════════
   LECTEUR VIDÉO PERSONNALISÉ
═══════════════════════════════════════════════════════════ */

var playerVideo     = null;
var playerContainer = null;
var playerHideTimer = null;
var playerSettingsOpen = false;

var ICONS = {
  play: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  replay: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.36"/></svg>',
  volFull: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
  volMute: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  exitFs: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>'
};

function formatTime(secs) {
  if (!isFinite(secs) || isNaN(secs)) return '0:00';
  var m = Math.floor(secs / 60);
  var s = Math.floor(secs % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function updatePlayIcon() {
  var btn = document.getElementById('video-play-pause');
  if (!btn || !playerVideo) return;
  if (playerVideo.ended)       btn.innerHTML = ICONS.replay;
  else if (playerVideo.paused) btn.innerHTML = ICONS.play;
  else                          btn.innerHTML = ICONS.pause;
}

function updateVolumeIcon() {
  var btn = document.getElementById('video-volume-btn');
  if (!btn || !playerVideo) return;
  btn.innerHTML = (playerVideo.muted || playerVideo.volume === 0) ? ICONS.volMute : ICONS.volFull;
}

function updateProgress() {
  var fill   = document.getElementById('video-progress-fill');
  var timeEl = document.getElementById('video-time');
  if (!playerVideo) return;
  var pct = playerVideo.duration ? (playerVideo.currentTime / playerVideo.duration) * 100 : 0;
  if (fill)   fill.style.width = pct + '%';
  if (timeEl) timeEl.textContent = formatTime(playerVideo.currentTime) + ' / ' + formatTime(playerVideo.duration);
}

function showPlayerControls() {
  if (!playerContainer || !playerVideo) return;
  playerContainer.classList.add('controls-visible');
  clearTimeout(playerHideTimer);
  if (!playerVideo.paused && !playerVideo.ended && !playerSettingsOpen) {
    playerHideTimer = setTimeout(function() {
      playerContainer.classList.remove('controls-visible');
    }, 3000);
  }
}

function hidePlayerControls() {
  if (!playerContainer || !playerVideo) return;
  clearTimeout(playerHideTimer);
  if (!playerVideo.paused && !playerVideo.ended && !playerSettingsOpen) {
    playerContainer.classList.remove('controls-visible');
  }
}

function resetVideoPlayer() {
  if (!playerVideo) return;
  clearTimeout(playerHideTimer);
  playerSettingsOpen = false;

  if (playerContainer) playerContainer.classList.remove('controls-visible');

  var fill   = document.getElementById('video-progress-fill');
  var timeEl = document.getElementById('video-time');
  var playBtn = document.getElementById('video-play-pause');
  var volBtn  = document.getElementById('video-volume-btn');
  var volSlider = document.getElementById('video-volume-slider');
  var settingsMenu = document.getElementById('video-settings-menu');
  var fsBtn   = document.getElementById('video-fullscreen-btn');

  if (fill)   fill.style.width = '0%';
  if (timeEl) timeEl.textContent = '0:00 / 0:00';
  if (playBtn) playBtn.innerHTML = ICONS.play;
  if (volBtn)  volBtn.innerHTML  = ICONS.volMute;
  if (fsBtn)   fsBtn.innerHTML   = ICONS.fullscreen;
  if (settingsMenu) settingsMenu.setAttribute('hidden', '');

  /* Reset vitesse */
  if (playerVideo) playerVideo.playbackRate = 1;
  document.querySelectorAll('.video-speed-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.speed === '1');
  });
  /* Le volume slider reste à sa valeur — l'utilisateur garde sa préférence entre plays */
  if (volSlider) playerVideo.volume = parseFloat(volSlider.value);
}

function initVideoPlayer() {
  playerVideo     = document.getElementById('seq-video');
  playerContainer = document.getElementById('video-player-container');
  if (!playerVideo || !playerContainer) return;

  var playBtn      = document.getElementById('video-play-pause');
  var volBtn       = document.getElementById('video-volume-btn');
  var volSlider    = document.getElementById('video-volume-slider');
  var progressBar  = document.getElementById('video-progress-bar');
  var settingsBtn  = document.getElementById('video-settings-btn');
  var settingsMenu = document.getElementById('video-settings-menu');
  var fsBtn        = document.getElementById('video-fullscreen-btn');

  /* Icônes initiales */
  if (playBtn)     playBtn.innerHTML    = ICONS.play;
  if (volBtn)      volBtn.innerHTML     = ICONS.volMute;
  if (settingsBtn) settingsBtn.innerHTML = ICONS.settings;
  if (fsBtn)       fsBtn.innerHTML      = ICONS.fullscreen;

  /* ── Play / Pause ── */
  function togglePlayPause() {
    if (playerVideo.ended) {
      playerVideo.currentTime = 0;
      playerVideo.play().catch(function() {});
    } else if (playerVideo.paused) {
      playerVideo.play().catch(function() {});
    } else {
      playerVideo.pause();
    }
    showPlayerControls();
  }

  if (playBtn) playBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    togglePlayPause();
  });

  playerVideo.addEventListener('click', function() {
    togglePlayPause();
  });

  /* Événements vidéo */
  playerVideo.addEventListener('play', function() {
    updatePlayIcon();
    showPlayerControls();
  });
  playerVideo.addEventListener('pause', function() {
    updatePlayIcon();
    /* Garder les contrôles visibles quand en pause */
    playerContainer.classList.add('controls-visible');
    clearTimeout(playerHideTimer);
  });
  playerVideo.addEventListener('ended', function() {
    updatePlayIcon();
    playerContainer.classList.add('controls-visible');
    clearTimeout(playerHideTimer);
  });
  playerVideo.addEventListener('timeupdate', updateProgress);
  playerVideo.addEventListener('loadedmetadata', updateProgress);

  /* ── Barre de progression (seek) ── */
  if (progressBar) {
    var seeking = false;

    function seekAt(e) {
      var rect = progressBar.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (isFinite(playerVideo.duration)) {
        playerVideo.currentTime = pct * playerVideo.duration;
        updateProgress();
      }
    }

    progressBar.addEventListener('mousedown', function(e) {
      seeking = true;
      seekAt(e);
      showPlayerControls();
    });
    document.addEventListener('mousemove', function(e) {
      if (seeking) { seekAt(e); showPlayerControls(); }
    });
    document.addEventListener('mouseup', function() { seeking = false; });

    progressBar.addEventListener('touchstart', function(e) { seekAt(e); showPlayerControls(); }, { passive: true });
    progressBar.addEventListener('touchmove',  function(e) { seekAt(e); showPlayerControls(); }, { passive: true });
  }

  /* ── Volume ── */
  if (volBtn) {
    volBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      playerVideo.muted = !playerVideo.muted;
      updateVolumeIcon();
      showPlayerControls();
    });
  }
  if (volSlider) {
    volSlider.addEventListener('input', function() {
      playerVideo.volume = parseFloat(volSlider.value);
      playerVideo.muted  = (parseFloat(volSlider.value) === 0);
      updateVolumeIcon();
      showPlayerControls();
    });
  }

  /* ── Vitesse ── */
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      playerSettingsOpen = !playerSettingsOpen;
      if (settingsMenu) {
        if (playerSettingsOpen) settingsMenu.removeAttribute('hidden');
        else                    settingsMenu.setAttribute('hidden', '');
      }
      showPlayerControls();
    });
  }
  if (settingsMenu) {
    settingsMenu.addEventListener('click', function(e) { e.stopPropagation(); });
    settingsMenu.querySelectorAll('.video-speed-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        playerVideo.playbackRate = parseFloat(btn.dataset.speed);
        settingsMenu.querySelectorAll('.video-speed-btn').forEach(function(b) {
          b.classList.toggle('active', b === btn);
        });
        playerSettingsOpen = false;
        settingsMenu.setAttribute('hidden', '');
        showPlayerControls();
      });
    });
  }

  /* ── Plein écran ── */
  if (fsBtn) {
    fsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var frame = document.getElementById('seq-frame') || playerContainer;
      if (!document.fullscreenElement) {
        frame.requestFullscreen().catch(function() {});
      } else {
        document.exitFullscreen().catch(function() {});
      }
      showPlayerControls();
    });
  }
  document.addEventListener('fullscreenchange', function() {
    if (fsBtn) fsBtn.innerHTML = document.fullscreenElement ? ICONS.exitFs : ICONS.fullscreen;
  });

  /* ── Affichage/masquage des contrôles ── */
  var isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (isMobile) {
    playerContainer.classList.add('controls-always');
    playerVideo.addEventListener('click', showPlayerControls);
  } else {
    playerContainer.addEventListener('mousemove',  showPlayerControls);
    playerContainer.addEventListener('mouseenter', showPlayerControls);
    playerContainer.addEventListener('mouseleave', hidePlayerControls);
  }

  /* Fermer le menu vitesse en cliquant ailleurs */
  document.addEventListener('click', function() {
    if (playerSettingsOpen && settingsMenu) {
      playerSettingsOpen = false;
      settingsMenu.setAttribute('hidden', '');
    }
  });
}


/* ═══════════════════════════════════════════════════════════
   ÉTAPES DE LA SÉQUENCE
═══════════════════════════════════════════════════════════ */

function runSeqVideo(serie) {
  showOnlyStep('seq-step-video');
  resetVideoPlayer();

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

  /* Montrer les contrôles brièvement au démarrage */
  seqWait(100, function() { showPlayerControls(); });
}

function runSeqIntroText(serie) {
  showOnlyStep('seq-step-intro-text');

  var t      = translations[currentLang] || translations['fr'];
  var textEl = document.getElementById('seq-intro-text');

  textEl.textContent = t[serie.introTextKey] || '';
  textEl.style.transition = '';
  textEl.classList.remove('is-revealed', 'is-fading');
  textEl.offsetHeight;
  textEl.classList.add('is-revealed');

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

  /* Cut instantané entre tableaux */
  inner.style.transition = 'none';
  inner.classList.remove('is-visible');
  img.src = '';
  inner.offsetHeight;
  inner.style.transition = '';

  img.src = painting.src;
  document.getElementById('seq-painting-title').textContent     = t[painting.titleKey]     || '';
  document.getElementById('seq-painting-technique').textContent = t[painting.techniqueKey] || '';
  document.getElementById('seq-painting-label').textContent     = t['seq_painting_label']  || 'RECHERCHE';
  document.getElementById('seq-painting-reward').textContent    = t['seq_painting_reward'] || 'RÉCOMPENSE : INESTIMABLE';

  inner.offsetHeight;
  inner.classList.add('is-visible');

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

  textEl.style.transition = 'filter 1.2s ease, opacity 1.2s ease';
  textEl.classList.remove('is-revealed', 'is-fading');
  textEl.offsetHeight;
  textEl.classList.add('is-revealed');

  seqWait(1400, function() { sig.classList.add('is-visible'); });
  seqWait(2200, function() { replay.classList.add('is-visible'); });
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
  resetVideoPlayer();
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

  document.getElementById('seq-overlay').classList.remove('active');
  document.body.style.overflow = '';

  /* Sortir du plein écran si actif */
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(function() {});
  }
}

function replaySequence() {
  var serie = seriesVideos[seqCurrentSerieKey];
  if (!serie) return;

  seqAborted = false;
  clearSeqTimers();

  resetVideoPlayer();

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
  initVideoPlayer();

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
