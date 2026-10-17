/**
 * Films Jeffrey — commande éditoriale optionnelle des lecteurs vidéo.
 *
 *  - Accueil : film d'annonce, épilogue de « Fragments d'un geste ».
 *  - Œuvres : présentation de Jeffrey dans la carte « À venir » (Série 2).
 *
 * Chaque bouton [data-film-toggle] pilote la vidéo désignée par son
 * aria-controls, en plus des contrôles natifs : aucune lecture automatique,
 * le son ne démarre qu'après une action volontaire. Sans JavaScript, le
 * bouton reste masqué (attribut hidden) et les contrôles natifs suffisent.
 *
 * Attributs facultatifs (valeurs par défaut = film d'annonce de l'accueil) :
 *   data-film-play / data-film-pause / data-film-replay : clés de traduction
 *   data-film-error : id du message d'échec (défaut : id de la vidéo + "-error")
 */
(function () {
  'use strict';

  /* Lecteurs dont le démarrage demande à Mory de fermer sa bulle d'accueil
     (elle recouvre le lecteur de la carte « À venir » sur mobile). */
  var HIDE_MORY_GREETING = { 'jeffrey-serie2': true };

  function text(key) {
    if (!window.IndirahI18n) return '';
    return window.IndirahI18n.getText(window.IndirahI18n.getLanguage(), key);
  }

  function bind(toggle) {
    var video = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!video || video.tagName !== 'VIDEO' || toggle.dataset.filmBound) return;
    toggle.dataset.filmBound = 'true';

    var label  = toggle.querySelector('[data-i18n]');
    var error  = document.getElementById(toggle.dataset.filmError || video.id + '-error');
    var source = video.querySelector('source');
    var keys = {
      play:   toggle.dataset.filmPlay   || 'jeffrey_film_play',
      pause:  toggle.dataset.filmPause  || 'jeffrey_film_pause',
      replay: toggle.dataset.filmReplay || 'jeffrey_film_replay'
    };
    if (!label) return;

    /* La clé data-i18n suit l'état : un changement de langue réapplique
       directement le bon libellé (mécanisme de traduction existant), sans
       relancer ni remettre la vidéo à zéro. */
    function setLabel(key) {
      label.dataset.i18n = key;
      var value = text(key);
      if (value) label.textContent = value;
    }

    function sync() {
      if (video.ended) setLabel(keys.replay);
      else if (!video.paused) setLabel(keys.pause);
      else setLabel(keys.play);
    }

    /* Média indisponible : message compréhensible et lien direct ; le focus
       n'est jamais perdu. */
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
    /* Lecture réellement démarrée (bouton ou contrôles natifs) : simple
       demande à Mory, qui applique sa propre logique de masquage. */
    if (HIDE_MORY_GREETING[video.id]) {
      video.addEventListener('playing', function () {
        try { window.dispatchEvent(new CustomEvent('indirah:mory-hide-greeting')); } catch (e) {}
      });
    }
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

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-film-toggle][aria-controls]'), bind);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
