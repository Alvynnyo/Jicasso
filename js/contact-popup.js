/* Popup de contact partagé — validation, Web3Forms et états localisés. */
(function () {
  'use strict';

  var WEB3FORMS_KEY = '05a7ad8e-a472-45fb-94b6-7551e1bdc112';
  var DEFAULT_SUBJECT = 'Nouveau message du site Indirah';
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
  var focusTimer;

  function lang() {
    return window.IndirahI18n ? window.IndirahI18n.getLanguage() : (localStorage.getItem('indirah-lang') || 'fr');
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
    root.innerHTML =
      '<div class="contact-popup-card" role="dialog" aria-modal="true" aria-labelledby="contact-popup-intro" tabindex="-1">' +
        '<button class="contact-popup-close" type="button">' +
          '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<header class="contact-popup-head">' +
          '<span class="contact-popup-avatar"><img src="images/mascotte/mascotte-accueil.webp" alt="" loading="lazy" decoding="async"></span>' +
          '<p class="contact-popup-intro" id="contact-popup-intro" data-i18n="contact_popup_intro"></p>' +
        '</header>' +
        '<div class="contact-popup-form-view">' +
          '<form class="contact-popup-form" id="contact-popup-form" novalidate>' +
            '<input type="hidden" id="contact-popup-subject" name="subject">' +
            fieldMarkup('name', 'text', 'contact_q1', 'contact_ph1', 'name') +
            fieldMarkup('email', 'email', 'contact_q2', 'contact_ph2', 'email') +
            fieldMarkup('phone', 'tel', 'contact_q4', 'contact_ph4', 'tel') +
            '<div class="contact-popup-field">' +
              '<label for="contact-popup-message" data-i18n="contact_q3"></label>' +
              '<textarea id="contact-popup-message" name="message" rows="3" data-i18n-placeholder="contact_ph3" aria-describedby="contact-popup-error-message"></textarea>' +
              '<p class="contact-popup-error" id="contact-popup-error-message" aria-live="polite"></p>' +
            '</div>' +
            '<button class="contact-popup-submit" type="submit"><span class="contact-popup-spinner" aria-hidden="true" hidden></span><span class="contact-popup-submit-label" data-i18n="contact_send"></span></button>' +
          '</form>' +
        '</div>' +
        '<section class="contact-popup-state contact-popup-success" role="status" aria-live="polite" hidden>' +
          '<h2 data-i18n="contact_success_title"></h2><p data-i18n="contact_success_text"></p>' +
        '</section>' +
        '<section class="contact-popup-state contact-popup-failure" role="alert" aria-live="assertive" hidden>' +
          '<h2 data-i18n="contact_error_title"></h2><p><span data-i18n="contact_error_text"></span> <a href="mailto:contact@indirah.fr">contact@indirah.fr</a>.</p>' +
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
    root.addEventListener('click', function (event) {
      if (event.target === root) close();
    });
    form.addEventListener('submit', submit);
    root.querySelector('.contact-popup-retry').addEventListener('click', function () {
      showState('form');
      messageInput.focus();
    });
    document.addEventListener('click', onTriggerClick);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('indirah:languagechange', translate);
    translate();
  }

  function fieldMarkup(id, type, labelKey, placeholderKey, autocomplete) {
    return '<div class="contact-popup-field">' +
      '<label for="contact-popup-' + id + '" data-i18n="' + labelKey + '"></label>' +
      '<input id="contact-popup-' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + autocomplete + '"' +
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

  function open(trigger) {
    build();
    activeTrigger = trigger || document.activeElement;
    form.reset();
    clearErrors();
    setSending(false);
    showState('form');
    subjectInput.value = trigger ? triggerSubject(trigger) : DEFAULT_SUBJECT;
    messageInput.value = trigger && trigger.dataset.contactPrefill ? trigger.dataset.contactPrefill : '';
    isOpen = true;
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-popup-open');
    window.clearTimeout(focusTimer);
    window.requestAnimationFrame(function () {
      root.classList.add('is-open');
      focusTimer = window.setTimeout(function () {
        if (isOpen) nameInput.focus();
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
    });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    window.clearTimeout(focusTimer);
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-popup-open');
    if (activeTrigger && typeof activeTrigger.focus === 'function') activeTrigger.focus();
  }

  function onKeydown(event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]'))
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
    submitLabel.textContent = text(sending ? 'contact_sending' : 'contact_send');
  }

  function submit(event) {
    event.preventDefault();
    if (!validate()) return;
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
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        setSending(false);
        showState(data.success ? 'success' : 'error');
        dialog.focus();
      })
      .catch(function () {
        setSending(false);
        showState('error');
        dialog.focus();
      });
  }

  window.IndirahContact = {
    open: open,
    close: close,
    validate: validate,
    getRoot: function () { build(); return root; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
}());
