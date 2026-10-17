/* Popup de contact partagé — validation, Web3Forms et états localisés. */
(function () {
  'use strict';

  var WEB3FORMS_KEY = '05a7ad8e-a472-45fb-94b6-7551e1bdc112';
  var DEFAULT_SUBJECT = 'Nouveau message du site Indirah';
  /* Astérisque purement visuel : l'obligation est portée par required. */
  var REQUIRED_MARK = '<span class="contact-popup-required" aria-hidden="true">*</span>';
  var root;
  var dialog;
  var form;
  var formView;
  var successView;
  var errorView;
  var closeButton;
  var submitButton;
  var submitLabel;
  var spinner;
  var subjectInput;
  var nameInput;
  var emailInput;
  var messageInput;
  var phoneInput;
  var activeTrigger;
  var isOpen = false;
  var releaseInert = null;
  var releaseScroll = null;
  var backdropPointerDown = false;
  /* Requête en cours : jeton + AbortController pour qu'une ancienne réponse
     ne modifie jamais une popup fermée puis rouverte. */
  var requestToken = 0;
  var requestController = null;
  var requestTimer = null;
  var REQUEST_TIMEOUT = 15000;

  function lang() {
    if (window.IndirahI18n) return window.IndirahI18n.getLanguage();
    try { return window.localStorage.getItem('indirah-lang') || 'fr'; } catch (e) { return 'fr'; }
  }

  function ui() {
    return window.IndirahUI || null;
  }

  function text(key) {
    if (window.IndirahI18n) return window.IndirahI18n.getText(lang(), key);
    return (window.translations && window.translations[lang()] && window.translations[lang()][key]) || key;
  }

  function build() {
    if (root) return;

    root = document.createElement('div');
    root.id = 'contact-popup';
    root.className = 'contact-popup';
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('inert', '');
    root.innerHTML =
      '<div class="contact-popup-card" role="dialog" aria-modal="true" aria-labelledby="contact-popup-intro" tabindex="-1">' +
        '<button class="contact-popup-close" type="button">' +
          '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<header class="contact-popup-head">' +
          '<span class="contact-popup-avatar"><img src="images/mascotte/mascotte-accueil.webp" alt="" loading="lazy" decoding="async"></span>' +
          '<p class="contact-popup-intro" id="contact-popup-intro" data-i18n="contact_popup_intro"></p>' +
        '</header>' +
        '<div class="contact-popup-form-view">' +
          '<form class="contact-popup-form" id="contact-popup-form" novalidate aria-busy="false">' +
            '<p class="contact-popup-required-note" data-i18n="contact_required_note"></p>' +
            '<input type="hidden" id="contact-popup-subject" name="subject">' +
            fieldMarkup('name', 'text', 'contact_q1', 'contact_ph1', 'name', true) +
            fieldMarkup('email', 'email', 'contact_q2', 'contact_ph2', 'email', true) +
            fieldMarkup('phone', 'tel', 'contact_q4', 'contact_ph4', 'tel', false) +
            '<div class="contact-popup-field">' +
              '<label for="contact-popup-message"><span data-i18n="contact_q3"></span>' + REQUIRED_MARK + '</label>' +
              '<textarea id="contact-popup-message" name="message" rows="3" required aria-required="true" data-i18n-placeholder="contact_ph3" aria-describedby="contact-popup-error-message"></textarea>' +
              '<p class="contact-popup-error" id="contact-popup-error-message" aria-live="polite"></p>' +
            '</div>' +
            '<button class="contact-popup-submit" type="submit"><span class="contact-popup-spinner" aria-hidden="true" hidden></span><span class="contact-popup-submit-label" data-i18n="contact_send"></span></button>' +
          '</form>' +
        '</div>' +
        /* États finaux : le focus y est porté après l'envoi (tabindex -1),
           le nom et la description sont lus une seule fois. */
        '<section class="contact-popup-state contact-popup-success" tabindex="-1" aria-labelledby="contact-popup-success-title" aria-describedby="contact-popup-success-text" hidden>' +
          '<h2 id="contact-popup-success-title" data-i18n="contact_success_title"></h2><p id="contact-popup-success-text" data-i18n="contact_success_text"></p>' +
        '</section>' +
        '<section class="contact-popup-state contact-popup-failure" tabindex="-1" aria-labelledby="contact-popup-failure-title" aria-describedby="contact-popup-failure-text" hidden>' +
          '<h2 id="contact-popup-failure-title" data-i18n="contact_error_title"></h2><p id="contact-popup-failure-text" data-i18n="contact_error_text"></p>' +
          '<button class="contact-popup-retry" type="button" data-i18n="contact_retry"></button>' +
        '</section>' +
      '</div>';

    document.body.appendChild(root);
    dialog = root.querySelector('.contact-popup-card');
    closeButton = root.querySelector('.contact-popup-close');
    form = root.querySelector('#contact-popup-form');
    formView = root.querySelector('.contact-popup-form-view');
    successView = root.querySelector('.contact-popup-success');
    errorView = root.querySelector('.contact-popup-failure');
    submitButton = root.querySelector('.contact-popup-submit');
    submitLabel = root.querySelector('.contact-popup-submit-label');
    spinner = root.querySelector('.contact-popup-spinner');
    subjectInput = root.querySelector('#contact-popup-subject');
    nameInput = root.querySelector('#contact-popup-name');
    emailInput = root.querySelector('#contact-popup-email');
    messageInput = root.querySelector('#contact-popup-message');
    phoneInput = root.querySelector('#contact-popup-phone');

    closeButton.addEventListener('click', close);
    /* Clic sur le fond : seulement si le geste a commencé sur le fond, et
       jamais pour le second clic d'un double-clic sur le déclencheur. */
    root.addEventListener('pointerdown', function (event) {
      backdropPointerDown = event.target === root;
    });
    root.addEventListener('click', function (event) {
      var startedOnBackdrop = backdropPointerDown;
      backdropPointerDown = false;
      if (event.target !== root || event.detail > 1) return;
      if (startedOnBackdrop || event.detail === 0) close();
    });
    form.addEventListener('submit', submit);
    root.querySelector('.contact-popup-retry').addEventListener('click', function () {
      showState('form');
      /* Contenu conservé : le bouton d'envoi est le contrôle logique pour réessayer. */
      submitButton.focus();
    });
    document.addEventListener('click', onTriggerClick);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('indirah:languagechange', translate);
    translate();
  }

  function fieldMarkup(id, type, labelKey, placeholderKey, autocomplete, required) {
    return '<div class="contact-popup-field">' +
      '<label for="contact-popup-' + id + '"><span data-i18n="' + labelKey + '"></span>' + (required ? REQUIRED_MARK : '') + '</label>' +
      '<input id="contact-popup-' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + autocomplete + '"' +
        (required ? ' required aria-required="true"' : '') +
        (id === 'email' ? ' inputmode="email"' : id === 'phone' ? ' inputmode="tel"' : '') + ' data-i18n-placeholder="' + placeholderKey + '" aria-describedby="contact-popup-error-' + id + '">' +
      '<p class="contact-popup-error" id="contact-popup-error-' + id + '" aria-live="polite"></p>' +
    '</div>';
  }

  function translate() {
    if (!root) return;
    root.querySelectorAll('[data-i18n]').forEach(function (element) {
      element.textContent = text(element.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
      element.placeholder = text(element.dataset.i18nPlaceholder);
    });
    closeButton.setAttribute('aria-label', text('contact_popup_close'));
    root.querySelectorAll('.contact-popup-error[data-error-key]').forEach(function (element) {
      element.textContent = text(element.dataset.errorKey);
    });
    if (submitButton.disabled) submitLabel.textContent = text('contact_sending');
  }

  function onTriggerClick(event) {
    var trigger = event.target.closest('[data-contact-open]');
    if (!trigger) return;
    event.preventDefault();
    open(trigger);
  }

  function triggerSubject(trigger) {
    if (trigger.dataset.contactSubject) return trigger.dataset.contactSubject;
    var label = (trigger.textContent || '').trim().replace(/\s+/g, ' ');
    return DEFAULT_SUBJECT + (label ? ' — ' + label : '');
  }

  function clearErrors() {
    [nameInput, emailInput, phoneInput, messageInput].forEach(function (input) {
      input.removeAttribute('aria-invalid');
      var error = document.getElementById(input.getAttribute('aria-describedby'));
      error.textContent = '';
      delete error.dataset.errorKey;
    });
  }

  function showState(state) {
    formView.hidden = state !== 'form';
    successView.hidden = state !== 'success';
    errorView.hidden = state !== 'error';
  }

  /* Annule ou invalide toute requête en cours (fermeture, réouverture). */
  function cancelRequest() {
    requestToken++;
    window.clearTimeout(requestTimer);
    requestTimer = null;
    if (requestController) {
      try { requestController.abort(); } catch (e) {}
      requestController = null;
    }
  }

  function isVisible(element) {
    var helpers = ui();
    if (helpers) return helpers.isVisible(element);
    return !!(element && element.isConnected && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
  }

  /* Cible du focus à la fermeture : le déclencheur s'il est encore visible ;
     sinon (lien du menu mobile refermé…) le bouton du menu ou un repère. */
  function resolveReturnFocus() {
    var trigger = activeTrigger;
    var hamburger = document.getElementById('hamburger-btn');
    if (trigger && trigger.closest && trigger.closest('#mobile-menu')) trigger = null;
    if (trigger && isVisible(trigger)) return trigger;
    if (hamburger && isVisible(hamburger)) return hamburger;
    var candidates = [document.querySelector('.main-nav [aria-current="page"]'), document.querySelector('.brand')];
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i] && isVisible(candidates[i])) return candidates[i];
    }
    return null;
  }

  function open(trigger) {
    build();
    if (isOpen) return; /* second clic : aucun état ni focus concurrent */
    if (window.IndirahNav && window.IndirahNav.isMenuOpen && window.IndirahNav.isMenuOpen()) {
      window.IndirahNav.closeMenu({ restoreFocus: false, immediate: true });
    }
    activeTrigger = trigger || document.activeElement;
    cancelRequest();
    form.reset();
    clearErrors();
    setSending(false);
    showState('form');
    subjectInput.value = trigger ? triggerSubject(trigger) : DEFAULT_SUBJECT;
    messageInput.value = trigger && trigger.dataset.contactPrefill ? trigger.dataset.contactPrefill : '';
    isOpen = true;
    backdropPointerDown = false;
    root.removeAttribute('inert');
    root.setAttribute('aria-hidden', 'false');
    root.classList.add('is-open');
    document.body.classList.add('contact-popup-open');
    var helpers = ui();
    releaseScroll = helpers ? helpers.lockScroll() : null;
    /* Focus d'abord dans la popup, puis arrière-plan inerte : jamais d'inert
       sur un ancêtre contenant encore le focus. */
    nameInput.focus();
    releaseInert = helpers ? helpers.inertOutside([root]) : null;
    if (helpers) helpers.notifyOverlayChange();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    cancelRequest();
    setSending(false);
    if (releaseInert) { releaseInert(); releaseInert = null; }
    if (releaseScroll) { releaseScroll(); releaseScroll = null; }
    document.body.classList.remove('contact-popup-open');
    /* Mory (ou toute interface en retrait) se réactive avant la restitution
       du focus : un déclencheur placé dans Mory redevient focalisable. */
    var helpers = ui();
    if (helpers) helpers.notifyOverlayChange();
    /* Focus restitué avant de masquer la popup. */
    var target = resolveReturnFocus();
    activeTrigger = null;
    if (target && typeof target.focus === 'function') target.focus();
    else if (dialog.contains(document.activeElement)) document.activeElement.blur();
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('inert', '');
  }

  function onKeydown(event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    var helpers = ui();
    if (helpers) { helpers.trapTab(event, dialog); return; }
    var focusable = Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), a[href]'))
      .filter(function (element) { return !element.closest('[hidden]'); });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function setError(input, key) {
    var error = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', 'true');
    error.dataset.errorKey = key;
    error.textContent = text(key);
  }

  function validate() {
    clearErrors();
    var invalid = [];
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var message = messageInput.value.trim();
    if (!name) {
      setError(nameInput, 'contact_err_empty');
      invalid.push(nameInput);
    }
    if (!email) {
      setError(emailInput, 'contact_err_empty');
      invalid.push(emailInput);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(emailInput, 'contact_err_email');
      invalid.push(emailInput);
    }
    if (!message || message.length < 10) {
      setError(messageInput, 'contact_err_min');
      invalid.push(messageInput);
    }
    /* Téléphone FACULTATIF : validé seulement s'il est renseigné, et de
       façon souple (rejette surtout les valeurs manifestement invalides —
       lettres, ou moins de 6 chiffres — sans bloquer les formats internationaux). */
    var phone = phoneInput.value.trim();
    if (phone && (/[a-zA-Z]/.test(phone) || phone.replace(/\D/g, '').length < 6)) {
      setError(phoneInput, 'contact_err_phone');
      invalid.push(phoneInput);
    }
    if (invalid.length) invalid[0].focus();
    return invalid.length === 0;
  }

  function setSending(sending) {
    submitButton.disabled = sending;
    spinner.hidden = !sending;
    form.setAttribute('aria-busy', sending ? 'true' : 'false');
    submitLabel.textContent = text(sending ? 'contact_sending' : 'contact_send');
  }

  /* Affiche l'état final et y porte le focus (lecture unique nom + texte). */
  function finish(state, token) {
    if (token !== requestToken || !isOpen) return; /* réponse périmée : ignorée */
    requestToken++; /* une seule issue par envoi (délai puis rejet d'abort, etc.) */
    window.clearTimeout(requestTimer);
    requestTimer = null;
    requestController = null;
    setSending(false);
    showState(state);
    var view = state === 'success' ? successView : errorView;
    view.focus();
  }

  function submit(event) {
    event.preventDefault();
    if (submitButton.disabled) return; /* double soumission */
    if (!validate()) return;
    cancelRequest();
    var token = requestToken;
    setSending(true);
    var payload = {
      access_key: WEB3FORMS_KEY,
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
      subject: subjectInput.value || DEFAULT_SUBJECT
    };
    /* Téléphone ajouté uniquement s'il est renseigné (pas de champ vide dans le mail). */
    var phone = phoneInput.value.trim();
    if (phone) payload.phone = phone;
    var options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    };
    if (typeof window.AbortController === 'function') {
      requestController = new window.AbortController();
      options.signal = requestController.signal;
    }
    /* Délai maximal : au-delà, la requête est abandonnée et l'erreur affichée. */
    requestTimer = window.setTimeout(function () {
      if (token !== requestToken) return;
      if (requestController) {
        try { requestController.abort(); } catch (e) {}
      }
      finish('error', token);
    }, REQUEST_TIMEOUT);
    fetch('https://api.web3forms.com/submit', options)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        finish(data && data.success ? 'success' : 'error', token);
      })
      .catch(function () {
        finish('error', token);
      });
  }

  window.IndirahContact = {
    open: open,
    close: close,
    validate: validate,
    isOpen: function () { return isOpen; },
    getRoot: function () { build(); return root; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
}());
