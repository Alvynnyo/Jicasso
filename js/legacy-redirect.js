/**
 * Pages-relais des anciennes routes (atelier.html, musee.html).
 *
 * Remplace l'entrée d'historique par la destination indiquée dans la balise
 * meta refresh de la page (aucune cible dupliquée ici). Script externe pour
 * respecter la Content-Security-Policy ; sans JavaScript, la meta refresh et
 * le lien de la page suffisent.
 */
(function () {
  'use strict';
  var refresh = document.querySelector('meta[http-equiv="refresh"]');
  var match = refresh && /url=(.+)$/i.exec(refresh.getAttribute('content') || '');
  /* Destination relative uniquement : jamais d'URL absolue ou de schéma. */
  if (match && /^[\w./#-]+$/.test(match[1]) && match[1].indexOf('//') === -1) {
    location.replace(match[1]);
  }
}());
