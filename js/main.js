/**
 * Indirah — main.js
 *
 * Gère :
 *  - le flux mobile de cartes (mobile-feed)
 *  - la bascule de langue FR/EN (setLanguage, localStorage)
 *  - la lightbox
 *  - l'intro livre 3D (mobile)
 *
 * Dépend de js/translations.js chargé avant ce fichier.
 */

/* ── Données ──────────────────────────────────────────────────
   Source unique : le tableau `series`.
   Pour ajouter une oeuvre : ajouter un objet dans works[],
   et les clés correspondantes dans translations.js.
─────────────────────────────────────────────────────────────── */
var series = [
  {
    titleKey: 'serie1_title',
    textKey:  'serie1_text',
    works: [
      { src: 'images/serie-1/maria.png', titleKey: 'work1_title', techniqueKey: 'work1_technique' },
      { src: 'images/serie-1/moryupdate.png', titleKey: 'work2_title', techniqueKey: 'work2_technique' },
      { src: 'images/serie-1/stepout.png', titleKey: 'work3_title', techniqueKey: 'work3_technique' },
    ]
  },
  {
    titleKey: 'serie2_title',
    textKey:  'serie2_text',
    works: [
      { src: 'images/serie-2/oeuvre-1.svg', titleKey: 'work4_title', techniqueKey: 'work4_technique' },
      { src: 'images/serie-2/oeuvre-2.svg', titleKey: 'work5_title', techniqueKey: 'work5_technique' },
      { src: 'images/serie-2/oeuvre-3.svg', titleKey: 'work6_title', techniqueKey: 'work6_technique' },
    ]
  }
];

/* ── État ─────────────────────────────────────────────────── */
var currentLang = localStorage.getItem('indirah-lang') || 'fr';


/* ══════════════════════════════════════════════════════════
   MOBILE FEED — flux vertical de cartes
══════════════════════════════════════════════════════════ */

function buildMobileFeed() {
  var feed = document.getElementById('mobile-feed');
  if (!feed) return;

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
      img.alt = '';
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

      card.appendChild(info);

      /* Lightbox au tap sur la carte mobile */
      card.addEventListener('click', function() { openLightbox(work.src); });

      grid.appendChild(card);
    });

    group.appendChild(grid);
    feed.appendChild(group);
  });
}


/* ══════════════════════════════════════════════════════════
   LANGUE
══════════════════════════════════════════════════════════ */

function setLanguage(lang) {
  if (!translations[lang]) return;

  currentLang = lang;
  localStorage.setItem('indirah-lang', lang);
  document.documentElement.lang = lang;

  /* Tous les éléments data-i18n (desktop + mobile feed) */
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key  = el.dataset.i18n;
    var text = translations[lang][key];
    if (text !== undefined) el.textContent = text;
  });

  /* Bouton de langue */
  document.querySelectorAll('.lang-option').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === lang);
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
  document.getElementById('lightbox-caption-title').textContent     = t[work.titleKey]     || '';
  document.getElementById('lightbox-caption-technique').textContent = t[work.techniqueKey] || '';
  updatePositionDots();
}

function openLightbox(src) {
  var result = findWorkBySrc(src);
  if (!result) return;
  lightboxWorks = result.serieWorks;
  lightboxIndex = result.index;
  showLightboxImage(lightboxIndex);
  var overlay = document.getElementById('lightbox-overlay');
  var img     = document.getElementById('lightbox-img');
  if (img) { img.style.transform = ''; img.style.transition = ''; }
  overlay.style.display = 'flex';
  overlay.offsetHeight; /* force reflow */
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var overlay = document.getElementById('lightbox-overlay');
  overlay.classList.remove('active');
  setTimeout(function() {
    if (!overlay.classList.contains('active')) {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      var img = document.getElementById('lightbox-img');
      if (img) { img.style.transform = ''; img.style.transition = ''; }
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
    if (e.target === overlay) closeLightbox();
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

  /* Clic sur les images du grid desktop */
  document.querySelectorAll('.serie-grid-item img').forEach(function(img) {
    img.addEventListener('click', function() {
      openLightbox(img.getAttribute('src'));
    });
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
   MENU MOBILE — hamburger + pile de boutons pilule
══════════════════════════════════════════════════════════ */

function initHamburgerMenu() {
  var btn     = document.getElementById('hamburger-btn');
  var menu    = document.getElementById('mobile-menu');
  var overlay = document.getElementById('mobile-menu-overlay');
  var closeBtn = document.getElementById('mobile-menu-close');

  if (!btn || !menu || !overlay || !closeBtn) return;

  function openMenu() {
    overlay.style.display = 'block';
    menu.style.display    = 'flex';
    overlay.offsetHeight; /* force reflow pour déclencher la transition */
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

  /* Liens de navigation : ferme le menu, puis scroll (ancre) ou navigue (page) */
  menu.querySelectorAll('a.mobile-menu-btn').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = link.getAttribute('href');
      e.preventDefault();
      closeMenu();
      if (href && href.charAt(0) === '#') {
        var target = document.getElementById(href.slice(1));
        if (target) setTimeout(function() { target.scrollIntoView({ behavior: 'smooth' }); }, 260);
      } else if (href) {
        setTimeout(function() { window.location.href = href; }, 260);
      }
    });
  });

  /* Toggle de langue dans le menu — un listener par option pour fiabilité mobile */
  document.querySelectorAll('#mobile-menu-lang .lang-option').forEach(function(option) {
    option.addEventListener('click', function() {
      setLanguage(option.dataset.lang);
    });
  });
}


/* ══════════════════════════════════════════════════════════
   BOOK INTRO — overlay mobile, ouverture au tap/clic
══════════════════════════════════════════════════════════ */

function initBookIntro() {
  var intro     = document.getElementById('book-intro');
  var scene     = document.getElementById('book-scene');
  var floater   = document.getElementById('book-floater');
  var coverWrap = document.getElementById('book-cover-wrap');
  var mhContent = document.getElementById('mobile-hero-content');
  var mhScroll  = document.getElementById('mobile-hero-scroll');
  if (!intro || !scene || !floater || !coverWrap) return;

  /* Sur tablette/desktop l'overlay livre n'est pas visible — animer le hero directement */
  if (window.getComputedStyle(intro).display === 'none') {
    if (mhContent) {
      setTimeout(function() {
        mhContent.classList.add('is-visible');
        if (mhScroll) mhScroll.classList.add('is-visible');
      }, 300);
    }
    return;
  }

  function openBook() {
    scene.removeEventListener('click', openBook);

    floater.style.animation = 'none';
    coverWrap.classList.add('is-open');

    setTimeout(function() { intro.classList.add('is-opening'); }, 380);

    setTimeout(function() {
      intro.style.display = 'none';
      if (mhContent) mhContent.classList.add('is-visible');
      if (mhScroll) mhScroll.classList.add('is-visible');
    }, 950);
  }

  scene.addEventListener('click', openBook);
}


/* ══════════════════════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

  /* Bascule de langue */
  document.getElementById('lang-toggle').addEventListener('click', function(e) {
    var option = e.target.closest('.lang-option');
    if (option) setLanguage(option.dataset.lang);
  });

  /* Book intro mobile */
  initBookIntro();

  /* Mobile feed */
  buildMobileFeed();

  /* Menu hamburger mobile */
  initHamburgerMenu();

  /* Lightbox */
  initLightbox();

  /* Langue initiale */
  setLanguage(currentLang);
});
