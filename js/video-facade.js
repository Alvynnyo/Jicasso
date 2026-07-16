/**
 * Indirah — video-facade.js
 * ────────────────────────────────────────────────────────────────
 * Façade « lite embed » YouTube (page À propos). Aucune requête vers
 * YouTube au chargement : seule une miniature locale + un bouton play
 * sont affichés. Au survol (desktop) on préconnecte ; au clic on
 * remplace la façade par la vraie <iframe> (autoplay post-geste).
 * Vanilla, sans dépendance. Chargé sur apropos.html uniquement.
 * ────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var PLACEHOLDER = 'TODO-youtube-id';
  var EMBED_HOST  = 'https://www.youtube-nocookie.com';
  var PRECONNECT_HOSTS = [EMBED_HOST, 'https://i.ytimg.com', 'https://s.ytimg.com'];
  var MESSAGE_DURATION = 2800;
  var preconnected = false;
  var messageTimer = null;

  function addPreconnect() {
    if (preconnected) return;
    preconnected = true;
    PRECONNECT_HOSTS.forEach(function (href) {
      if (document.querySelector('link[rel="preconnect"][href="' + href + '"]')) return;
      var link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
    });
  }

  function isPlaceholderId(id) {
    return !id || id === PLACEHOLDER || /^todo/i.test(id) || /^placeholder/i.test(id);
  }

  function showPlaceholderMessage(btn) {
    window.clearTimeout(messageTimer);
    btn.classList.add('is-message-visible');
    messageTimer = window.setTimeout(function () {
      btn.classList.remove('is-message-visible');
    }, MESSAGE_DURATION);
  }

  function activate(btn) {
    var id = btn.getAttribute('data-yt-id');
    if (isPlaceholderId(id)) {
      showPlaceholderMessage(btn);
      return;   /* placeholder → aucun iframe, aucune requête externe */
    }

    var iframe = document.createElement('iframe');
    iframe.className = 'about-video-frame';
    iframe.src = EMBED_HOST + '/embed/' + encodeURIComponent(id) +
                 '?autoplay=1&rel=0&playsinline=1';
    iframe.title = btn.getAttribute('aria-label') || 'Vidéo de présentation';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('tabindex', '-1');

    if (btn.parentNode) btn.parentNode.replaceChild(iframe, btn);
    /* Le bouton disparaît : on porte le focus sur l'iframe pour ne pas le perdre. */
    try { iframe.focus({ preventScroll: true }); } catch (e) { try { iframe.focus(); } catch (e2) {} }
  }

  function init() {
    var buttons = document.querySelectorAll('.about-video[data-yt-id]');
    Array.prototype.forEach.call(buttons, function (btn) {
      var id = btn.getAttribute('data-yt-id');
      if (!isPlaceholderId(id)) {
        /* Préconnexion uniquement quand la vidéo est réelle. */
        btn.addEventListener('pointerenter', addPreconnect);
        btn.addEventListener('focus', addPreconnect);
      }
      btn.addEventListener('click', function () { activate(btn); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
