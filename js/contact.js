/* ═══════════════════════════════════════════════════════════
   Indirah — contact.js

   ⚠️  CONFIGURATION REQUISE
   Remplacez la valeur de WEB3FORMS_KEY ci-dessous par votre
   clé personnelle, obtenue gratuitement sur https://web3forms.com
   (créez un compte, récupérez la clé, collez-la ici).
═══════════════════════════════════════════════════════════ */

var WEB3FORMS_KEY = '05a7ad8e-a472-45fb-94b6-7551e1bdc112';

var currentStep = 1;
var currentLang = localStorage.getItem('indirah-lang') || 'fr';


/* ══════════════════════════════════════════════════════════
   ÉTAPES — transitions fade + slide
══════════════════════════════════════════════════════════ */

function updateProgress() {
  document.getElementById('progress-bar').style.width = ((currentStep / 3) * 100) + '%';
}

function goToStep(nextNum) {
  if (nextNum < 1 || nextNum > 3) return;

  var fromEl  = document.getElementById('step-' + currentStep);
  var toEl    = document.getElementById('step-' + nextNum);
  var forward = nextNum > currentStep;

  fromEl.style.transition = 'opacity 0.26s ease, transform 0.26s ease';
  fromEl.style.opacity    = '0';
  fromEl.style.transform  = forward ? 'translateY(-22px)' : 'translateY(22px)';

  setTimeout(function() {
    fromEl.style.display    = 'none';
    fromEl.style.transform  = '';
    fromEl.style.transition = '';

    toEl.style.display    = 'flex';
    toEl.style.opacity    = '0';
    toEl.style.transform  = forward ? 'translateY(22px)' : 'translateY(-22px)';
    toEl.style.transition = 'none';

    void toEl.offsetHeight;

    toEl.style.transition = 'opacity 0.38s ease, transform 0.38s ease';
    toEl.style.opacity    = '1';
    toEl.style.transform  = 'translateY(0)';

    currentStep = nextNum;
    updateProgress();

    var input = toEl.querySelector('input, textarea');
    if (input) setTimeout(function() { input.focus(); }, 80);
  }, 260);
}

function showFinalStep(stepId) {
  var fromEl  = document.getElementById('step-' + currentStep);
  var finalEl = document.getElementById(stepId);

  fromEl.style.transition = 'opacity 0.26s ease, transform 0.26s ease';
  fromEl.style.opacity    = '0';
  fromEl.style.transform  = 'translateY(-22px)';

  setTimeout(function() {
    fromEl.style.display = 'none';

    finalEl.style.display    = 'flex';
    finalEl.style.opacity    = '0';
    finalEl.style.transform  = 'translateY(22px)';
    finalEl.style.transition = 'none';

    void finalEl.offsetHeight;

    finalEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    finalEl.style.opacity    = '1';
    finalEl.style.transform  = 'translateY(0)';

    document.getElementById('progress-bar').style.width = '100%';
  }, 260);
}


/* ══════════════════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════════════════ */

function showError(el, key) {
  el.textContent = (translations[currentLang] && translations[currentLang][key]) || key;
  el.classList.add('visible');
}

function hideError(el) {
  el.textContent = '';
  el.classList.remove('visible');
}

function validateName() {
  var val = document.getElementById('input-name').value.trim();
  var err = document.getElementById('error-name');
  if (!val) { showError(err, 'contact_err_empty'); return false; }
  hideError(err);
  return true;
}

function validateEmail() {
  var val = document.getElementById('input-email').value.trim();
  var err = document.getElementById('error-email');
  if (!val) { showError(err, 'contact_err_empty'); return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { showError(err, 'contact_err_email'); return false; }
  hideError(err);
  return true;
}

function validateMessage() {
  var val = document.getElementById('input-message').value.trim();
  var err = document.getElementById('error-message');
  if (!val || val.length < 10) { showError(err, 'contact_err_min'); return false; }
  hideError(err);
  return true;
}


/* ══════════════════════════════════════════════════════════
   ENVOI — Web3Forms
══════════════════════════════════════════════════════════ */

function sendForm() {
  var name    = document.getElementById('input-name').value.trim();
  var email   = document.getElementById('input-email').value.trim();
  var message = document.getElementById('input-message').value.trim();
  var btn     = document.getElementById('btn-send');

  btn.disabled  = true;
  btn.innerHTML = '<span class="btn-spinner"></span>';

  fetch('https://api.web3forms.com/submit', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      name:       name,
      email:      email,
      message:    message,
      subject:    'Nouveau message du site Indirah'
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.success) {
      showFinalStep('step-confirm');
    } else {
      btn.disabled    = false;
      btn.textContent = translations[currentLang].contact_send;
      showFinalStep('step-error');
    }
  })
  .catch(function() {
    btn.disabled    = false;
    btn.textContent = translations[currentLang].contact_send;
    showFinalStep('step-error');
  });
}


/* ══════════════════════════════════════════════════════════
   LANGUE
══════════════════════════════════════════════════════════ */

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('indirah-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var text = translations[lang][el.dataset.i18n];
    if (text !== undefined) el.textContent = text;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var text = translations[lang][el.dataset.i18nPlaceholder];
    if (text !== undefined) el.placeholder = text;
  });

  document.querySelectorAll('.lang-option').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  /* btn-send géré séparément car son contenu change pendant l'envoi */
  var btnSend = document.getElementById('btn-send');
  if (btnSend && !btnSend.disabled) {
    btnSend.textContent = translations[lang].contact_send;
  }
}


/* ══════════════════════════════════════════════════════════
   MENU HAMBURGER
══════════════════════════════════════════════════════════ */

function initHamburgerMenu() {
  var btn      = document.getElementById('hamburger-btn');
  var menu     = document.getElementById('mobile-menu');
  var overlay  = document.getElementById('mobile-menu-overlay');
  var closeBtn = document.getElementById('mobile-menu-close');

  if (!btn || !menu || !overlay || !closeBtn) return;

  function openMenu() {
    overlay.style.display = 'block';
    menu.style.display    = 'flex';
    overlay.offsetHeight;
    menu.offsetHeight;
    overlay.classList.add('active');
    menu.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    overlay.classList.remove('active');
    menu.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(function() {
      if (!menu.classList.contains('active')) {
        overlay.style.display = 'none';
        menu.style.display    = 'none';
      }
    }, 260);
  }

  btn.addEventListener('click', function() {
    if (menu.classList.contains('active')) closeMenu();
    else openMenu();
  });

  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  menu.querySelectorAll('a.mobile-menu-btn').forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });

  document.querySelectorAll('#mobile-menu-lang .lang-option').forEach(function(option) {
    option.addEventListener('click', function() { setLanguage(option.dataset.lang); });
  });
}


/* ══════════════════════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

  /* Langue */
  var langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', function(e) {
      var opt = e.target.closest('.lang-option');
      if (opt) setLanguage(opt.dataset.lang);
    });
  }

  setLanguage(currentLang);
  updateProgress();

  /* Apparition de l'étape 1 */
  var step1 = document.getElementById('step-1');
  step1.style.display    = 'flex';
  step1.style.opacity    = '0';
  step1.style.transform  = 'translateY(20px)';
  step1.style.transition = 'none';

  setTimeout(function() {
    step1.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    step1.style.opacity    = '1';
    step1.style.transform  = 'translateY(0)';
  }, 80);

  setTimeout(function() { document.getElementById('input-name').focus(); }, 650);

  /* ─── Boutons Suivant ─── */
  document.getElementById('btn-next-1').addEventListener('click', function() {
    if (validateName()) goToStep(2);
  });

  document.getElementById('btn-next-2').addEventListener('click', function() {
    if (validateEmail()) goToStep(3);
  });

  /* ─── Envoi ─── */
  document.getElementById('btn-send').addEventListener('click', function() {
    if (validateMessage()) sendForm();
  });

  /* ─── Retour ─── */
  document.getElementById('btn-back-2').addEventListener('click', function() { goToStep(1); });
  document.getElementById('btn-back-3').addEventListener('click', function() { goToStep(2); });

  /* ─── Réessayer ─── */
  document.getElementById('btn-retry').addEventListener('click', function() {
    var errorEl = document.getElementById('step-error');
    var step3   = document.getElementById('step-3');

    errorEl.style.transition = 'opacity 0.26s ease';
    errorEl.style.opacity    = '0';

    setTimeout(function() {
      errorEl.style.display = 'none';

      step3.style.display    = 'flex';
      step3.style.opacity    = '0';
      step3.style.transform  = 'translateY(22px)';
      step3.style.transition = 'none';

      void step3.offsetHeight;

      step3.style.transition = 'opacity 0.38s ease, transform 0.38s ease';
      step3.style.opacity    = '1';
      step3.style.transform  = 'translateY(0)';

      currentStep = 3;
      updateProgress();

      var btn      = document.getElementById('btn-send');
      btn.disabled    = false;
      btn.textContent = translations[currentLang].contact_send;
    }, 260);
  });

  /* ─── Touche Entrée pour avancer ─── */
  document.getElementById('input-name').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); if (validateName()) goToStep(2); }
  });

  document.getElementById('input-email').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); if (validateEmail()) goToStep(3); }
  });

  /* ─── Auto-resize textarea ─── */
  var textarea = document.getElementById('input-message');
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });

  /* ─── Menu hamburger ─── */
  initHamburgerMenu();
});
