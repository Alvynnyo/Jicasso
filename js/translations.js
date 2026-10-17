/**
 * All UI strings for the Indirah portfolio.
 * Keys are referenced via data-i18n attributes in HTML.
 * To add a language: duplicate one block and translate.
 */
const translations = {
  fr: {
    // Navigation
    nav_accueil:    "Accueil",
    nav_oeuvres:    "Œuvres",
    nav_apropos:    "À propos",
    nav_contact:    "Contact",

    // SEO
    meta_home_title:       "Indirah - Artiste Peintre",
    meta_home_desc:        "Indirah, artiste peintre : figures, émotions et œuvres à découvrir.",
    meta_oeuvres_title:    "Œuvres - Indirah",
    meta_oeuvres_desc:     "Explorez les series de peintures d'Indirah, avec une galerie visuelle et une lightbox immersive.",
    meta_contact_title:    "Contact - Indirah",
    meta_contact_desc:     "Contactez Indirah pour un projet artistique, une question ou une collaboration.",
    meta_apropos_title:    "À propos - Indirah",
    meta_apropos_desc:     "Découvrez Indirah, sa démarche artistique et sa vision de la peinture.",

    // Accueil
    home_hook:         "Peindre ce que les mots taisent.",
    home_identity:     "Indirah — peintre, figures & émotions.",
    home_depth:        "Série en cours",
    home_scroll:       "Défiler",
    home_cta_oeuvres:  "Découvrir les œuvres",
    home_cta_artist:   "Rencontrer l'artiste",
    home_final_title:  "Chaque toile a son histoire.",
    home_final_text:   "La suite vous appartient.",
    home_cta_contact:  "La contacter",
    home_works_eyebrow: "Aperçu",
    home_works_title:   "Quelques œuvres",
    home_works_link:    "Voir toutes les œuvres",
    home_artist_eyebrow: "L'artiste",
    home_artist_phrase: "Ses figures donnent une présence à ce qui reste sans voix.",
    home_social_prompt: "Suivre le travail",
    home_closing_title: "Une œuvre vous parle ?",

    // A propos
    apropos_eyebrow: "L'artiste",
    apropos_title: "Peindre ce que les mots taisent.",
    apropos_intro: "Indirah est artiste peintre. Elle construit, toile après toile, un langage fait de figures, d'émotions et d'histoires.",
    apropos_quote: "Peindre, c'est raconter ce que les mots ne savent pas dire.",
    apropos_vision_eyebrow: "Démarche",
    apropos_vision_title: "Entre la main et le silence",
    apropos_vision_p2: "Son travail explore ce qui la traverse et cherche le point de rencontre entre ce que l'on voit et ce que l'on ressent.",
    apropos_personal_eyebrow: "Une présence",
    apropos_personal_p1: "Ses figures ne livrent pas tout. Elles invitent le regard à s'approcher, à s'arrêter et à inventer sa propre lecture.",
    apropos_cta: "Découvrir les œuvres",

    // Série I — figures
    serie1_title:   "Série I",
    serie1_text:    "Figures et présence. Trois visages entre intériorité, musique et affirmation.",
    serie1_link:    "Voir les trois œuvres",

    // Série II — teaser
    serie2_title:   "Série II",
    serie2_text:    "Nouvelle série en préparation.",
    immersive_eyebrow: "Un autre regard",
    immersive_text: "Trois œuvres, trois salles, un temps de regard guidé par Mory.",
    immersive_enter: "Entrer dans le parcours",
    immersive_close: "Quitter le parcours",
    immersive_intro_line1: "Bienvenue dans le",
    immersive_intro_line2: "Parcours",
    immersive_intro_desc: "Avancez d'une œuvre à l'autre. Chaque toile s'éclaire à votre approche — laissez-vous porter.",

    // Footer
    footer_contact:   "Contact",
    footer_copy:      "© 2026 Indirah. Tous droits réservés.",

    // Page de contact — questions
    contact_q1:  "Comment puis-je vous appeler ?",
    contact_q2:  "Où puis-je vous répondre ?",
    contact_q3:  "Quel est votre projet ?",

    // Placeholders
    contact_ph1: "Votre nom",
    contact_ph2: "votre@email.com",
    contact_q4:  "Un numéro pour vous joindre plus vite ? (facultatif)",
    contact_ph4: "(555) 123-4567",
    contact_ph3: "Décrivez votre projet…",

    // Boutons
    contact_open:    "Écrire à Indirah",
    contact_send:    "Envoyer",
    contact_sending: "Envoi…",
    contact_retry:   "Réessayer",

    // Popup de contact partagé
    contact_popup_intro: "Racontez-moi votre projet — je le transmets à Indirah.",
    contact_popup_close: "Fermer",

    // Confirmation
    contact_success_title: "Merci.",
    contact_success_text:  "Votre message est bien arrivé. Je vous répondrai bientôt, le temps de poser les pinceaux.",

    // Erreur
    contact_error_title: "Oops.",
    contact_error_text:  "Une erreur est survenue. Veuillez réessayer plus tard.",

    // Validation
    contact_err_empty: "Ce champ est requis.",
    contact_err_phone: "Ce numéro semble incomplet ou invalide.",
    contact_err_email: "L’adresse e-mail n’est pas valide.",
    contact_err_min:   "Votre message doit contenir au moins 10 caractères.",

    // Œuvres individuelles — titre et technique
    // Série I
    work1_title:     "Sous les pivoines",
    work1_technique: "Huile sur toile",
    work2_title:     "L'Accord intérieur",
    work2_technique: "Huile sur toile",
    work3_title:     "À pleine voix",
    work3_technique: "Acrylique sur lin",
    meta_year:       "Année",
    meta_medium:     "Technique",
    meta_dimensions: "Dimensions",
    meta_availability: "Disponibilité",

    // Accessibilité — noms accessibles et navigation clavier
    skip_link:          "Aller au contenu",
    nav_main_label:     "Navigation principale",
    nav_mobile_label:   "Menu mobile",
    nav_footer_label:   "Liens de pied de page",
    lang_switch_label:  "Langue du site",
    menu_toggle:        "Menu",
    menu_close:         "Fermer le menu",
    lightbox_close:     "Fermer la vue agrandie",
    lightbox_prev:      "Œuvre précédente",
    lightbox_next:      "Œuvre suivante",
    lightbox_goto:      "Voir l’œuvre {n}",
    lightbox_position:  "Œuvre {n} sur {total} : {title}",
    immersive_label:    "Parcours immersif",
    immersive_start:    "Défiler : commencer la visite",
    instagram_soon:     "Instagram — bientôt",
    home_artist_link:   "Sa démarche",
    alt_portrait:       "Portrait d'Indirah",
    alt_hands:          "Mains d'artiste tenant un pinceau",
    contact_page_button: "Ouvrir le formulaire",
    contact_required_note: "Les champs marqués d’un astérisque (*) sont obligatoires.",

    // Fragments d'un geste — annonce de la nouvelle œuvre
    fragments_title:    "Fragments d’un geste",
    fragment1_title:    "Le geste",
    fragment1_line1:    "Tout commence par un mouvement.",
    fragment1_line2:    "Une intuition, une trace, une présence encore invisible.",
    fragment2_title:    "La matière",
    fragment2_line1:    "Couleur après couleur, la forme cherche sa place.",
    fragment2_line2:    "L’œuvre se construit, puis se révèle.",
    fragment3_title:    "La révélation",
    fragment3_line1:    "Une nouvelle œuvre d’Indirah rejoindra bientôt la collection.",
    upcoming_eyebrow:   "À venir",
    upcoming_title:     "Une nouvelle œuvre prend forme.",
    upcoming_link:      "Suivre le geste",
    jeffrey_film_title: "Jeffrey — film d’annonce",
    jeffrey_film_desc:  "Une évocation visuelle de la naissance de Jeffrey, jusqu’à sa révélation.",
    jeffrey_film_meta:  "15 secondes, avec son.",
    jeffrey_film_play:  "Voir le geste",
    jeffrey_film_pause: "Pause",
    jeffrey_film_replay: "Revoir",
    jeffrey_film_fallback: "Votre navigateur ne peut pas lire cette vidéo.",
    jeffrey_film_error: "Le film ne peut pas être lu pour le moment.",
    jeffrey_film_download: "Télécharger le film (MP4, 4 Mo)",
  },

  en: {
    // Navigation
    nav_accueil:    "Home",
    nav_oeuvres:    "Works",
    nav_apropos:    "About",
    nav_contact:    "Contact",

    // SEO
    meta_home_title:       "Indirah - Visual Artist",
    meta_home_desc:        "Indirah, visual artist: figures, emotions and works to discover.",
    meta_oeuvres_title:    "Works - Indirah",
    meta_oeuvres_desc:     "Explore Indirah's painting series through a visual gallery and immersive lightbox.",
    meta_contact_title:    "Contact - Indirah",
    meta_contact_desc:     "Contact Indirah for an artistic project, a question or a collaboration.",
    meta_apropos_title:    "About - Indirah",
    meta_apropos_desc:     "Discover Indirah, her artistic approach and her vision of painting.",

    // Home
    home_hook:         "Painting what words leave unsaid.",
    home_identity:     "Indirah — painter, figures & emotions.",
    home_depth:        "Series in progress",
    home_scroll:       "Scroll",
    home_cta_oeuvres:  "Discover the works",
    home_cta_artist:   "Meet the artist",
    home_final_title:  "Every canvas has its story.",
    home_final_text:   "The rest is up to you.",
    home_cta_contact:  "Get in touch",
    home_works_eyebrow: "Preview",
    home_works_title:   "Selected works",
    home_works_link:    "View all works",
    home_artist_eyebrow: "The artist",
    home_artist_phrase: "Her figures give presence to what remains without a voice.",
    home_social_prompt: "Follow the work",
    home_closing_title: "Does a work speak to you?",

    // About
    apropos_eyebrow: "The artist",
    apropos_title: "Painting what words leave unsaid.",
    apropos_intro: "Indirah is a visual artist. Canvas by canvas, she builds a language of figures, emotions and stories.",
    apropos_quote: "Painting is telling what words cannot say.",
    apropos_vision_eyebrow: "Approach",
    apropos_vision_title: "Between hand and silence",
    apropos_vision_p2: "Her work explores what moves through her and searches for the meeting point between what we see and what we feel.",
    apropos_personal_eyebrow: "A presence",
    apropos_personal_p1: "Her figures never reveal everything. They invite the eye to come closer, pause and imagine its own reading.",
    apropos_cta: "Discover the works",

    // Series I — figures
    serie1_title:   "Series I",
    serie1_text:    "Figures and presence. Three faces poised between introspection, music and affirmation.",
    serie1_link:    "View the three works",

    // Series II — teaser
    serie2_title:   "Series II",
    serie2_text:    "A new series is in preparation.",
    immersive_eyebrow: "Another perspective",
    immersive_text: "Three works, three rooms, a moment of looking guided by Mory.",
    immersive_enter: "Enter the tour",
    immersive_close: "Leave the tour",
    immersive_intro_line1: "Welcome to the",
    immersive_intro_line2: "Tour",
    immersive_intro_desc: "Move from one work to the next. Each canvas lights up as you approach — let yourself drift.",

    // Footer
    footer_contact:   "Contact",
    footer_copy:      "© 2026 Indirah. All rights reserved.",

    // Contact page — questions
    contact_q1:  "How may I call you?",
    contact_q2:  "Where can I reach you?",
    contact_q3:  "What's your project?",

    // Placeholders
    contact_ph1: "Your name",
    contact_ph2: "your@email.com",
    contact_q4:  "A number to reach you faster? (optional)",
    contact_ph4: "(555) 123-4567",
    contact_ph3: "Tell me about your project…",

    // Buttons
    contact_open:    "Write to Indirah",
    contact_send:    "Send",
    contact_sending: "Sending…",
    contact_retry:   "Try again",

    // Shared contact popup
    contact_popup_intro: "Tell me about your project — I'll pass it on to Indirah.",
    contact_popup_close: "Close",

    // Confirmation
    contact_success_title: "Thank you.",
    contact_success_text:  "Your message has reached the studio. I will get back to you soon, just as soon as I set down my brushes.",

    // Error
    contact_error_title: "Oops.",
    contact_error_text:  "An error occurred. Please try again later.",

    // Validation
    contact_err_empty: "This field is required.",
    contact_err_phone: "This phone number looks incomplete or invalid.",
    contact_err_email: "Please enter a valid email address.",
    contact_err_min:   "Your message must be at least 10 characters long.",

    // Individual works — title and technique
    // Series I
    work1_title:     "Beneath the Peonies",
    work1_technique: "Oil on canvas",
    work2_title:     "The Inner Chord",
    work2_technique: "Oil on canvas",
    work3_title:     "In Full Voice",
    work3_technique: "Acrylic on linen",
    meta_year:       "Year",
    meta_medium:     "Medium",
    meta_dimensions: "Dimensions",
    meta_availability: "Availability",

    // Accessibility — accessible names and keyboard navigation
    skip_link:          "Skip to content",
    nav_main_label:     "Main navigation",
    nav_mobile_label:   "Mobile menu",
    nav_footer_label:   "Footer links",
    lang_switch_label:  "Site language",
    menu_toggle:        "Menu",
    menu_close:         "Close menu",
    lightbox_close:     "Close enlarged view",
    lightbox_prev:      "Previous work",
    lightbox_next:      "Next work",
    lightbox_goto:      "View work {n}",
    lightbox_position:  "Work {n} of {total}: {title}",
    immersive_label:    "Immersive tour",
    immersive_start:    "Scroll: start the tour",
    instagram_soon:     "Instagram — coming soon",
    home_artist_link:   "Her approach",
    alt_portrait:       "Portrait of Indirah",
    alt_hands:          "An artist's hands holding a brush",
    contact_page_button: "Open the form",
    contact_required_note: "Fields marked with an asterisk (*) are required.",

    // Fragments of a gesture — new work announcement
    fragments_title:    "Fragments of a Gesture",
    fragment1_title:    "The gesture",
    fragment1_line1:    "Everything begins with a movement.",
    fragment1_line2:    "An intuition, a trace, a presence still unseen.",
    fragment2_title:    "The matter",
    fragment2_line1:    "Colour after colour, form begins to find its place.",
    fragment2_line2:    "The work takes shape, then reveals itself.",
    fragment3_title:    "The reveal",
    fragment3_line1:    "A new work by Indirah will soon join the collection.",
    upcoming_eyebrow:   "Upcoming",
    upcoming_title:     "A new work is taking shape.",
    upcoming_link:      "Follow the gesture",
    jeffrey_film_title: "Jeffrey — announcement film",
    jeffrey_film_desc:  "A visual evocation of Jeffrey taking shape, culminating in its final reveal.",
    jeffrey_film_meta:  "15 seconds, with sound.",
    jeffrey_film_play:  "Watch the gesture",
    jeffrey_film_pause: "Pause",
    jeffrey_film_replay: "Replay",
    jeffrey_film_fallback: "Your browser cannot play this video.",
    jeffrey_film_error: "The film cannot be played right now.",
    jeffrey_film_download: "Download the film (MP4, 4 MB)",
  }
};

window.translations = translations;

window.IndirahI18n = (function () {
  'use strict';

  var STORAGE_KEY = 'indirah-lang';
  /* Repli en mémoire : localStorage peut lever une exception (navigation
     privée stricte, stockage désactivé, iframe sandboxée…). */
  var memoryLang = null;

  function readStoredLanguage() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return translations[value] ? value : null;
    } catch (e) {
      return null;
    }
  }

  function storeLanguage(lang) {
    memoryLang = lang;
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function getLanguage() {
    return readStoredLanguage() || memoryLang || 'fr';
  }

  function getText(lang, key) {
    return (translations[lang] && translations[lang][key]) ||
           (translations.fr && translations.fr[key]) || '';
  }

  function apply(lang, options) {
    options = options || {};
    if (!translations[lang]) return null;

    storeLanguage(lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var text = translations[lang][el.dataset.i18n];
      if (text !== undefined) el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var text = translations[lang][el.dataset.i18nPlaceholder];
      if (text !== undefined) el.placeholder = text;
    });

    document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
      var text = translations[lang][el.dataset.i18nContent];
      if (text !== undefined) el.setAttribute('content', text);
    });

    document.querySelectorAll('[data-i18n-alt-title]').forEach(function (el) {
      var title = getText(lang, el.dataset.i18nAltTitle);
      var tech = getText(lang, el.dataset.i18nAltTechnique);
      var label = title + (tech ? ', ' + tech.toLowerCase() : '');
      if (el.tagName === 'IMG') el.alt = label;
      else el.setAttribute('aria-label', label);
    });

    /* Noms accessibles localisés (aria-label des contrôles et repères). */
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var text = translations[lang][el.dataset.i18nAriaLabel];
      if (text !== undefined) el.setAttribute('aria-label', text);
    });

    document.querySelectorAll('.lang-option').forEach(function (btn) {
      var isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      if (btn.tagName === 'BUTTON') btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (typeof options.afterApply === 'function') options.afterApply(lang);
    window.dispatchEvent(new CustomEvent('indirah:languagechange'));
    return lang;
  }

  return {
    getLanguage: getLanguage,
    getText: getText,
    apply: apply
  };
}());
