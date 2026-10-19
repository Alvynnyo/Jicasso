/**
 * Message d'accueil de Mory propre à la page (Accueil, À propos, Contact).
 * La page Œuvres définit le sien dans gallery.js.
 *
 * Script externe plutôt qu'inline, pour respecter la Content-Security-Policy
 * (script-src 'self'). Chargé en defer avant mory.js, qui lit ces valeurs.
 */
(function () {
  'use strict';

  var GREETINGS = {
    'home-page': {
      key: 'mory_greeted_home_identity',
      text: {fr:"Je suis Mory. Je vous guide parmi les figures, les émotions et les histoires d'Indirah.",en:"I'm Mory. I'll guide you through Indirah's figures, emotions and stories."}
    },
    'about-page': {
      key: 'mory_greeted_about',
      text: {fr:"Je vous laisse découvrir Indirah à votre rythme. Si un point vous intrigue, je peux l'approfondir avec vous.",en:"Take your time discovering Indirah. If something catches your attention, I can explore it with you."}
    },
    'contact-page': {
      key: 'mory_greeted_contact',
      text: {fr:"Vous y êtes. Écrivez votre mot — je le porte à Indirah, elle répond dès qu'elle a posé les pinceaux.",en:"You're here. Write your note — I'll carry it to Indirah; she replies as soon as she sets down her brushes."}
    }
  };

  var body = document.body;
  if (!body) return;
  for (var page in GREETINGS) {
    if (body.classList.contains(page)) {
      window.MORY_GREETING_KEY = GREETINGS[page].key;
      window.MORY_GREETING = GREETINGS[page].text;
      return;
    }
  }
}());
