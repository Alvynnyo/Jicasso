/**
 * All UI strings for the Indirah portfolio.
 * Keys are referenced via data-i18n attributes in HTML.
 * To add a language: duplicate one block and translate.
 */
const translations = {
  fr: {
    // Navigation
    nav_accueil:    "Accueil",
    nav_oeuvres:    "Oeuvres",
    nav_musee:      "Musee",
    nav_contact:    "Contact",

    // SEO
    meta_home_title:       "Indirah - Artiste Peintre",
    meta_home_desc:        "Site officiel d'Indirah, artiste peintre : oeuvres, musee interactif et contact.",
    meta_oeuvres_title:    "Oeuvres - Indirah",
    meta_oeuvres_desc:     "Explorez les series de peintures d'Indirah, avec une galerie visuelle et une lightbox immersive.",
    meta_musee_title:      "Musee - Indirah",
    meta_musee_desc:       "Parcourez les oeuvres d'Indirah dans un musee interactif en scrollytelling.",
    meta_contact_title:    "Contact - Indirah",
    meta_contact_desc:     "Contactez Indirah pour un projet artistique, une question ou une collaboration.",

    // Hero
    hero_scroll:    "Défiler",

    // Accueil — parcours de galerie (scrollytelling)
    home_subtitle:     "Peinture",
    home_scroll:       "Défiler",
    home_enter_hint:   "La visite commence",
    home_final_title:  "Chaque toile a son histoire.",
    home_final_text:   "La suite vous appartient.",
    home_cta_oeuvres:  "Voir les oeuvres",
    home_cta_contact:  "La contacter",

    // Musée — écran d'introduction (mise en page éditoriale)
    musee_intro_line1: "Bienvenue au",
    musee_intro_line2: "Musée",
    musee_intro_desc:  "Parcourez les œuvres d'Indirah comme les salles d'un musée. Chaque toile s'illumine à votre approche — laissez-vous porter.",

    // Série I — Paysages et lumière
    serie1_title:   "Série I",
    serie1_text:    "Paysages et lumière. Une exploration des saisons et de leurs couleurs.",
    serie1_link:    "Voir la série",

    // Série II — Portraits et figures
    serie2_title:   "Série II",
    serie2_text:    "Portraits et figures. Le corps comme matière et comme ombre.",
    serie2_link:    "Voir la série",

    // Navigation supplémentaire
    nav_home: "Accueil",

    // Footer
    footer_instagram: "Instagram",
    footer_artsy:     "Artsy",
    footer_contact:   "Contact",
    footer_copy:      "© 2024 Indirah. Tous droits réservés.",

    // Page de contact — questions
    contact_q1:  "Comment puis-je vous appeler ?",
    contact_q2:  "Où puis-je vous répondre ?",
    contact_q3:  "Quel est votre projet ?",

    // Placeholders
    contact_ph1: "Votre nom",
    contact_ph2: "votre@email.com",
    contact_ph3: "Décrivez votre projet…",

    // Boutons
    contact_next:    "Suivant",
    contact_back:    "Retour",
    contact_send:    "Envoyer",
    contact_sending: "Envoi…",
    contact_retry:   "Réessayer",

    // Confirmation
    contact_success_title: "Merci.",
    contact_success_text:  "Votre message est bien arrivé. Je vous répondrai bientôt, le temps de poser les pinceaux.",

    // Erreur
    contact_error_title: "Oops.",
    contact_error_text:  "Une erreur est survenue. Réessayez ou écrivez-moi directement à",

    // Validation
    contact_err_empty: "Ce champ est requis.",
    contact_err_email: "L’adresse e-mail n’est pas valide.",
    contact_err_min:   "Votre message doit contenir au moins 10 caractères.",

    // Oeuvres individuelles — titre et technique
    // Série I
    work1_title:     "Sans titre I",
    work1_technique: "Huile sur toile",
    work2_title:     "Sans titre II",
    work2_technique: "Huile sur toile",
    work3_title:     "Sans titre III",
    work3_technique: "Acrylique sur lin",
    // Série II
    work4_title:     "À venir",
    work4_technique: "",
    work5_title:     "À venir",
    work5_technique: "",
    work6_title:     "À venir",
    work6_technique: "",
  },

  en: {
    // Navigation
    nav_accueil:    "Home",
    nav_oeuvres:    "Works",
    nav_musee:      "Museum",
    nav_contact:    "Contact",

    // SEO
    meta_home_title:       "Indirah - Visual Artist",
    meta_home_desc:        "Official website of Indirah, visual artist: works, interactive museum and contact.",
    meta_oeuvres_title:    "Works - Indirah",
    meta_oeuvres_desc:     "Explore Indirah's painting series through a visual gallery and immersive lightbox.",
    meta_musee_title:      "Museum - Indirah",
    meta_musee_desc:       "Wander through Indirah's works in an interactive scrollytelling museum.",
    meta_contact_title:    "Contact - Indirah",
    meta_contact_desc:     "Contact Indirah for an artistic project, a question or a collaboration.",

    // Hero
    hero_scroll:    "Scroll",

    // Home — gallery tour (scrollytelling)
    home_subtitle:     "Painting",
    home_scroll:       "Scroll",
    home_enter_hint:   "The tour begins",
    home_final_title:  "Every canvas has its story.",
    home_final_text:   "The rest is up to you.",
    home_cta_oeuvres:  "See the works",
    home_cta_contact:  "Get in touch",

    // Museum — intro screen (editorial layout)
    musee_intro_line1: "Welcome to the",
    musee_intro_line2: "Museum",
    musee_intro_desc:  "Wander through Indirah's works like the rooms of a museum. Each canvas lights up as you approach — let yourself drift.",

    // Series I — Landscapes and light
    serie1_title:   "Series I",
    serie1_text:    "Landscapes and light. An exploration of seasons and their colors.",
    serie1_link:    "View series",

    // Series II — Portraits and figures
    serie2_title:   "Series II",
    serie2_text:    "Portraits and figures. The body as matter and as shadow.",
    serie2_link:    "View series",

    // Additional navigation
    nav_home: "Home",

    // Footer
    footer_instagram: "Instagram",
    footer_artsy:     "Artsy",
    footer_contact:   "Contact",
    footer_copy:      "© 2024 Indirah. All rights reserved.",

    // Contact page — questions
    contact_q1:  "How may I call you?",
    contact_q2:  "Where can I reach you?",
    contact_q3:  "What's your project?",

    // Placeholders
    contact_ph1: "Your name",
    contact_ph2: "your@email.com",
    contact_ph3: "Tell me about your project…",

    // Buttons
    contact_next:    "Next",
    contact_back:    "Back",
    contact_send:    "Send",
    contact_sending: "Sending…",
    contact_retry:   "Try again",

    // Confirmation
    contact_success_title: "Thank you.",
    contact_success_text:  "Your message has reached the studio. I will get back to you soon, just as soon as I set down my brushes.",

    // Error
    contact_error_title: "Oops.",
    contact_error_text:  "Something went wrong. Try again or write to me directly at",

    // Validation
    contact_err_empty: "This field is required.",
    contact_err_email: "Please enter a valid email address.",
    contact_err_min:   "Your message must be at least 10 characters long.",

    // Individual works — title and technique
    // Series I
    work1_title:     "Untitled I",
    work1_technique: "Oil on canvas",
    work2_title:     "Untitled II",
    work2_technique: "Oil on canvas",
    work3_title:     "Untitled III",
    work3_technique: "Acrylic on linen",
    // Series II
    work4_title:     "Coming soon",
    work4_technique: "",
    work5_title:     "Coming soon",
    work5_technique: "",
    work6_title:     "Coming soon",
    work6_technique: "",
  }
};

window.translations = translations;

window.IndirahI18n = (function () {
  'use strict';

  var STORAGE_KEY = 'indirah-lang';

  function getLanguage() {
    return localStorage.getItem(STORAGE_KEY) || document.documentElement.lang || 'fr';
  }

  function getText(lang, key) {
    return (translations[lang] && translations[lang][key]) ||
           (translations.fr && translations.fr[key]) || '';
  }

  function apply(lang, options) {
    options = options || {};
    if (!translations[lang]) return null;

    localStorage.setItem(STORAGE_KEY, lang);
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

    document.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
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
