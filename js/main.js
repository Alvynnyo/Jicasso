/**
 * Indirah — main.js
 *
 * Gère :
 *  - le viewer hero desktop (navigation, cross-fade, compteur, légende)
 *  - le flux mobile de cartes (mobile-feed)
 *  - la bascule de langue FR/EN (setLanguage, localStorage)
 *
 * Dépend de js/translations.js chargé avant ce fichier.
 */

/* ── Données ──────────────────────────────────────────────────
   Source unique : le tableau `series`.
   heroWorks (viewer desktop) est dérivé automatiquement.
   Pour ajouter une oeuvre : ajouter un objet dans works[],
   et les clés correspondantes dans translations.js.
─────────────────────────────────────────────────────────────── */
var series = [
  {
    titleKey: 'serie1_title',
    textKey:  'serie1_text',
    works: [
      { src: 'images/serie-1/maria.png', titleKey: 'work1_title', techniqueKey: 'work1_technique' },
      { src: 'images/serie-1/Mory.png', titleKey: 'work2_title', techniqueKey: 'work2_technique' },
      { src: 'images/serie-1/oeuvre-1.png', titleKey: 'work3_title', techniqueKey: 'work3_technique' },
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

/* Liste plate pour le viewer desktop */
var heroWorks = series.reduce(function(acc, s) { return acc.concat(s.works); }, []);

/* ── État ─────────────────────────────────────────────────── */
var currentLang  = localStorage.getItem('indirah-lang') || 'fr';
var currentIndex = 0;


/* ══════════════════════════════════════════════════════════
   HERO — viewer desktop
══════════════════════════════════════════════════════════ */

function buildHeroImages() {
  var frame = document.getElementById('hero-frame');
  if (!frame) return;

  heroWorks.forEach(function(work, i) {
    var img = document.createElement('img');
    img.src = work.src;
    img.alt = '';
    img.setAttribute('draggable', 'false');
    if (i === 0) img.classList.add('active');
    frame.appendChild(img);
  });

  document.getElementById('hero-count-total').textContent =
    '/ ' + String(heroWorks.length).padStart(2, '0');
}

function goToWork(targetIndex) {
  var images = document.querySelectorAll('#hero-frame img');
  if (!images.length) return;

  images[currentIndex].classList.remove('active');
  currentIndex = ((targetIndex % heroWorks.length) + heroWorks.length) % heroWorks.length;
  images[currentIndex].classList.add('active');

  document.getElementById('hero-count-current').textContent =
    String(currentIndex + 1).padStart(2, '0');

  updateCaption();
}

function updateCaption() {
  var work = heroWorks[currentIndex];
  var t    = translations[currentLang];

  var titleEl     = document.getElementById('hero-caption-title');
  var techniqueEl = document.getElementById('hero-caption-technique');
  if (titleEl)     titleEl.textContent     = t[work.titleKey]     || '';
  if (techniqueEl) techniqueEl.textContent = t[work.techniqueKey] || '';
}


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

  /* Légende du hero (desktop) */
  updateCaption();
}


/* ══════════════════════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

  /* Hero desktop */
  buildHeroImages();

  var prevBtn = document.getElementById('hero-prev');
  var nextBtn = document.getElementById('hero-next');
  if (prevBtn) prevBtn.addEventListener('click', function() { goToWork(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { goToWork(currentIndex + 1); });

  /* Navigation clavier */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  goToWork(currentIndex - 1);
    if (e.key === 'ArrowRight') goToWork(currentIndex + 1);
  });

  /* Bascule de langue */
  document.getElementById('lang-toggle').addEventListener('click', function(e) {
    var option = e.target.closest('.lang-option');
    if (option) setLanguage(option.dataset.lang);
  });

  /* Mobile feed */
  buildMobileFeed();

  /* Langue initiale */
  setLanguage(currentLang);
});
