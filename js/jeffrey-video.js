/**
 * Film d'annonce « Jeffrey » — épilogue de « Fragments d'un geste » (accueil).
 *
 * Commande éditoriale optionnelle, en plus des contrôles natifs du <video> :
 * aucune lecture automatique, le son ne démarre qu'après une action
 * volontaire. Sans JavaScript, le bouton reste masqué (attribut hidden) et
 * les contrôles natifs suffisent.
 */
(function () {
  'use strict';

  function init() {
    var video  = document.getElementById('jeffrey-film');
    var toggle = document.querySelector('[data-film-toggle][aria-controls="jeffrey-film"]');
    if (!video || !toggle || toggle.dataset.filmBound) return;
    toggle.dataset.filmBound = 'true';

    var label  = toggle.querySelector('[data-i18n]');
    var error  = document.getElementById('jeffrey-film-error');
    var source = video.querySelector('source');
    if (!label) return;

    function text(key) {
      if (!window.IndirahI18n) return '';
      return window.IndirahI18n.getText(window.IndirahI18n.getLanguage(), key);
    }

    /* La clé data-i18n suit l'état : un changement de langue réapplique
       directement le bon libellé (mécanisme de traduction existant). */
    function setLabel(key) {
      label.dataset.i18n = key;
      var value = text(key);
      if (value) label.textContent = value;
    }

    function sync() {
      if (video.ended) setLabel('jeffrey_film_replay');
      else if (!video.paused) setLabel('jeffrey_film_pause');
      else setLabel('jeffrey_film_play');
    }

    /* Média indisponible : message compréhensible et lien de
       téléchargement ; le focus n'est jamais perdu. */
    function showError() {
      if (!error || !error.hidden) return;
      var hadFocus = document.activeElement === toggle;
      error.hidden = false;
      toggle.hidden = true;
      if (hadFocus) error.focus();
    }

    toggle.addEventListener('click', function () {
      if (!video.paused && !video.ended) {
        video.pause();
        return;
      }
      if (video.ended) video.currentTime = 0;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function (reason) {
          /* AbortError : lecture interrompue par une pause, sans gravité. */
          if (reason && reason.name === 'AbortError') return;
          sync();
          if (reason && reason.name === 'NotSupportedError') showError();
        });
      }
    });

    ['play', 'playing', 'pause', 'ended', 'emptied'].forEach(function (type) {
      video.addEventListener(type, sync);
    });
    video.addEventListener('error', showError);
    if (source) source.addEventListener('error', showError);
    window.addEventListener('indirah:languagechange', sync);

    /* Échec survenu avant l'exécution du script. networkState vaut aussi
       NETWORK_NO_SOURCE un court instant au début de la sélection de la
       source : on ne conclut qu'une fois la page chargée. */
    function checkEarlyFailure() {
      if (video.error || (video.networkState === video.NETWORK_NO_SOURCE && video.readyState === 0)) {
        showError();
      }
    }

    if (video.error) {
      showError();
      return;
    }

    sync();
    toggle.hidden = false;
    if (document.readyState === 'complete') checkEarlyFailure();
    else window.addEventListener('load', checkEarlyFailure);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
