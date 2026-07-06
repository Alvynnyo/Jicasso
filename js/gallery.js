/**
 * Indirah — gallery.js
 * ────────────────────────────────────────────────────────────────
 * Parcours d'accueil en scrollytelling : une « salle » plein écran par
 * œuvre, un spotlight qui s'allume à l'entrée dans le viewport, et Mory
 * qui peut commenter. Les salles d'œuvres sont générées depuis
 * oeuvres-data.js et insérées entre la salle d'entrée et la salle finale.
 *
 * Animations liées au défilement via GSAP + ScrollTrigger (CDN), avec
 * repli sur IntersectionObserver si GSAP n'est pas disponible. Aucun
 * scroll-jacking : l'utilisateur garde le contrôle du défilement.
 *
 * Chargé sur index.html après oeuvres-data.js, translations.js et main.js.
 * ────────────────────────────────────────────────────────────────
 */

/* Message d'accueil de Mory spécifique au parcours (lu par mory.js). */
window.MORY_GREETING_KEY = 'mory_greeted_musee';
window.MORY_GREETING = {
  fr: "Je vais vous accompagner. Contentez-vous de scroller.",
  en: "I'll guide you. Just scroll."
};

(function () {
  'use strict';

  /* Conclusion prononcée par Mory dans la salle finale. */
  var FINAL_MESSAGE = {
    fr: "Voilà. Chaque toile a son histoire. La suite vous appartient.",
    en: "That's all. Every canvas has its story. The rest is up to you."
  };

  var commented = {};   /* œuvres déjà commentées par Mory (une fois par visite) */
  var finalSaid = false;

  function getLang() {
    return localStorage.getItem('indirah-lang') || document.documentElement.lang || 'fr';
  }
  function pick(map) {
    if (!map) return '';
    var lang = getLang();
    return map[lang] || map.fr || '';
  }
  function tr(key) {
    var lang = getLang();
    if (typeof translations === 'undefined') return '';
    return (translations[lang] && translations[lang][key]) ||
           (translations.fr && translations.fr[key]) || '';
  }

  function getAllWorks() {
    if (typeof oeuvresData === 'undefined') return [];
    var out = [];
    Object.keys(oeuvresData).forEach(function (k) {
      var s = oeuvresData[k];
      if (s && s.works) s.works.forEach(function (w) { out.push(w); });
    });
    return out;
  }

  /* Teinte subtile de la « salle » selon son rang, pour passer de salle
     en salle sans rupture brutale (autour du teal #0D3A35). */
  function roomHue(i) {
    var h = 174 + ((i % 3) - 1) * 5;   /* 169 · 174 · 179 */
    var l = 13 + (i % 2) * 2;          /* 13% ou 15%     */
    return 'hsl(' + h + ', 60%, ' + l + '%)';
  }

  /* ── Construction des salles d'œuvres ──────────────────────────── */
  function buildRooms() {
    var gallery = document.getElementById('gallery');
    var finalRoom = document.getElementById('room-final');
    if (!gallery || !finalRoom) return [];

    var works = getAllWorks();
    works.forEach(function (work, i) {
      var section = document.createElement('section');
      section.className = 'room room--art';
      section.dataset.workId = work.id;
      section.dataset.roomBg = roomHue(i);

      var stage = document.createElement('div');
      stage.className = 'room-art-stage';

      var frame = document.createElement('div');
      frame.className = 'room-art-frame';

      var img = document.createElement('img');
      img.className = 'room-art-img';
      img.src = work.srcSpotlight || work.src;   /* version « musée » si dispo */
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.dataset.i18nAltTitle = work.titleKey;
      img.dataset.i18nAltTechnique = work.techniqueKey;
      var title = tr(work.titleKey);
      var tech = tr(work.techniqueKey);
      img.alt = title + (tech ? ', ' + tech.toLowerCase() : '');

      frame.appendChild(img);
      stage.appendChild(frame);

      var caption = document.createElement('div');
      caption.className = 'room-art-caption';

      var titleEl = document.createElement('p');
      titleEl.className = 'room-art-title';
      titleEl.setAttribute('data-i18n', work.titleKey);
      titleEl.textContent = title;

      var techEl = document.createElement('p');
      techEl.className = 'room-art-technique';
      techEl.setAttribute('data-i18n', work.techniqueKey);
      techEl.textContent = tech;

      caption.appendChild(titleEl);
      caption.appendChild(techEl);

      section.appendChild(stage);
      section.appendChild(caption);

      /* Commentaire de Mory attaché à la salle (placeholder éditable
         dans oeuvres-data.js → champ moryComment). */
      if (work.moryComment) section._moryComment = work.moryComment;

      gallery.insertBefore(section, finalRoom);
    });

    return Array.prototype.slice.call(gallery.querySelectorAll('.room'));
  }

  /* ── Activation / désactivation d'une salle ────────────────────── */
  function activateRoom(room) {
    room.classList.add('is-lit');

    if (room.dataset.roomBg) {
      document.documentElement.style.setProperty('--room-bg', room.dataset.roomBg);
    } else {
      document.documentElement.style.setProperty('--room-bg', '#0D3A35');
    }

    if (room.classList.contains('room--art')) {
      commentRoom(room);
    } else if (room.classList.contains('room--final')) {
      sayFinal();
    }
  }

  function deactivateRoom(room) {
    /* On garde la salle d'entrée allumée (nom lisible tout en haut). */
    if (room.classList.contains('room--entry')) return;
    room.classList.remove('is-lit');
  }

  function commentRoom(room) {
    var id = room.dataset.workId;
    if (!id || commented[id] || !room._moryComment) return;
    if (!window.Mory || typeof window.Mory.say !== 'function') return;
    commented[id] = true;
    window.Mory.say(room._moryComment, { expression: 'mascotte-montre', duration: 5500 });
  }

  function sayFinal() {
    if (finalSaid || !window.Mory || typeof window.Mory.say !== 'function') return;
    finalSaid = true;
    window.Mory.say(FINAL_MESSAGE, { expression: 'mascotte-ecoute', duration: 0 });
  }

  /* ── Pilotage du défilement ────────────────────────────────────── */
  function setupGsap(rooms) {
    gsap.registerPlugin(ScrollTrigger);
    rooms.forEach(function (room) {
      ScrollTrigger.create({
        trigger: room,
        start: 'top 62%',       /* la salle occupe ~40% du bas de l'écran */
        end: 'bottom 38%',
        onToggle: function (self) {
          if (self.isActive) activateRoom(room);
          else deactivateRoom(room);
        }
      });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  function setupObserver(rooms) {
    if (!('IntersectionObserver' in window)) {
      /* Dernier repli : tout est allumé. */
      rooms.forEach(function (r) { activateRoom(r); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activateRoom(entry.target);
        else deactivateRoom(entry.target);
      });
    }, { threshold: 0.6 });
    rooms.forEach(function (r) { io.observe(r); });
  }

  /* ── Indicateur de défilement : descend vers la 1re œuvre ──────── */
  function initScrollCue() {
    var cue = document.querySelector('.scroll-cue');
    var firstArt = document.querySelector('.room--art');
    if (!cue) return;
    cue.addEventListener('click', function (e) {
      e.preventDefault();
      var target = firstArt || document.getElementById('room-final');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ── Init ──────────────────────────────────────────────────────── */
  function init() {
    var rooms = buildRooms();
    if (!rooms.length) return;

    initScrollCue();

    var hasGsap = (typeof window.gsap !== 'undefined') &&
                  (typeof window.ScrollTrigger !== 'undefined');
    if (hasGsap) setupGsap(rooms);
    else setupObserver(rooms);

    /* La salle d'entrée est visible dès le chargement. */
    var entry = document.getElementById('room-entry');
    if (entry) activateRoom(entry);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
