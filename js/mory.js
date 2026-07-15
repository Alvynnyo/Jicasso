/**
 * Indirah — mory.js
 * ────────────────────────────────────────────────────────────────
 * « Mory », guide interactif du parcours : un chatbot ENTIÈREMENT SCRIPTÉ
 * (aucune IA). Toutes les questions et réponses sont écrites en dur
 * ci-dessous dans MORY_CONVERSATION. Le visiteur choisit parmi des
 * boutons ; Mory répond avec une bulle de chat et propose la suite.
 *
 * Chargé sur index.html, oeuvres.html, apropos.html et contact.html, après
 * oeuvres-data.js et translations.js. Le DOM est injecté dynamiquement.
 * ────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════
     1. ARBRE DE CONVERSATION — bilingue, facile à éditer
     ──────────────────────────────────────────────────────────────
     Pour ajouter une question : ajoutez un bouton dans menu.options
     (avec un id) et le nœud correspondant dans `nodes`.
     Chaque nœud possède :
       expression : nom d'image de la mascotte (voir EXPRESSIONS)
       message    : { fr, en } le texte de la réponse de Mory
       image      : (optionnel) chemin d'une image affichée dans la bulle
       options    : boutons proposés à la suite (toujours au moins « menu »)
  ════════════════════════════════════════════════════════════════ */

  /* Libellés réutilisés (boutons récurrents) */
  var LABELS = {
    backToMenu:  { fr: 'Retour au menu',    en: 'Back to menu' },
    chooseWork:  { fr: 'Choisir une œuvre', en: 'Pick a work' },
    nextWork:    { fr: "L'œuvre suivante →", en: 'Next work →' },
    writeToHer:  { fr: 'Écrire à Indirah',  en: 'Write to Indirah' }
  };

  var MORY_CONVERSATION = {

    /* Bulle d'accueil affichée une fois par session (repli si la page ne
       définit pas window.MORY_GREETING). */
    greeting: {
      fr: "Bonjour, je suis Mory. Guide de cette galerie, et accessoirement contrebassiste. Cliquez sur moi, je vous raconte tout.",
      en: "Hello, I'm Mory. Guide of this gallery, and bassist on the side. Click me, I'll tell you everything."
    },

    /* Menu principal */
    menu: {
      expression: 'mascotte-accueil',
      message: {
        fr: "Que voulez-vous savoir ?",
        en: "What would you like to know?"
      },
      options: [
        { id: 'work:work1', featured: true, label: { fr: "Suivez-moi",        en: "Follow me" } },
        { id: 'oeuvres',                    label: { fr: "Choisir une œuvre",  en: "Pick a work" } },
        { id: 'about',                      label: { fr: "Un mot sur Indirah", en: "A word about Indirah" } },
        { id: 'contact',                    label: { fr: "La contacter",       en: "Get in touch" } }
      ]
    },

    /* Nœuds de réponse */
    nodes: {
      /* « Un mot sur Indirah » — registre intime de Mory, COMPLÉMENTAIRE de la
         page À propos (il ne la recopie pas). ⚠️ Décrit le VRAI processus de
         travail de l'artiste → à faire relire en priorité par Indirah. */
      about: {
        expression: 'mascotte-joue',
        message: {
          fr: "La page « À propos » vous dit sa démarche. Moi, je vous dis autre chose : Indirah peint ce qu'elle n'arrive pas à dire tout haut. Ça commence dans le silence, souvent le soir, la main décide avant la tête. Quand une toile la met un peu mal à l'aise, c'est souvent qu'elle est juste.",
          en: "The About page tells you her approach. I'll tell you something else: Indirah paints what she can't quite say out loud. It starts in silence, often at night — the hand decides before the head. When a canvas makes her a little uneasy, that's usually when it's right."
        },
        options: [
          { id: 'goto-apropos', href: 'apropos.html', label: { fr: "Lire sa démarche", en: "Read her approach" } },
          { id: 'goto-oeuvres', href: 'oeuvres.html', label: { fr: "Voir les œuvres",  en: "See the works" } },
          { id: 'menu',                                label: LABELS.backToMenu }
        ]
      },

      contact: {
        expression: 'mascotte-ecoute',
        message: {
          fr: "Une histoire à raconter, un projet en tête ? Indirah vous écoute. Laissez-lui un message, elle vous répondra dès qu'elle aura posé les pinceaux.",
          en: "A story to tell, a project in mind? Indirah is listening. Leave her a message and she'll reply as soon as she sets down her brushes."
        },
        options: [
          { id: 'goto-contact', contactOpen: true, subject: 'Mory — Écrire à Indirah', label: LABELS.writeToHer },
          { id: 'menu',         label: LABELS.backToMenu }
        ]
      },

      /* Le nœud « oeuvres » (Choisir une œuvre) construit ses boutons
         dynamiquement à partir de oeuvres-data.js (voir buildOeuvresNode). */
      oeuvres: {
        expression: 'mascotte-montre',
        message: {
          fr: "Voici les œuvres. Laquelle vous intrigue ?",
          en: "Here are the works. Which one intrigues you?"
        }
      }
    }
  };

  /* ── Récits par œuvre, dans la VOIX de Mory (parcours guidé « Suivez-moi »).
     ⚠️ Contenu éditorial à valider par l'artiste. `next` chaîne le parcours ;
     la dernière œuvre (next: null) mène au nœud « payoff » une fois les 3 vues. */
  var MORY_WORKS = {
    work1: {
      message: {
        fr: "On commence par elle. Le visage se dérobe sous les pivoines — et pourtant elle est là, entière. Indirah cache le regard pour qu'on cherche le reste : la nuque, la peau, ce jardin qu'on porte en dedans. La fleur ne vous rendra pas les yeux, mais elle vous rendra la présence.",
        en: "We begin with her. The face slips beneath the peonies — yet she is wholly there. Indirah hides the gaze so we look for the rest: the neck, the skin, the garden one carries within. The flower won't give you back her eyes, but it will give you her presence."
      },
      transition: {
        fr: "La suivante, elle… c'est un peu moi.",
        en: "The next one… is a little bit me."
      },
      next: 'work2'
    },
    work2: {
      message: {
        fr: "Ah, celle-ci… c'est de là que je viens. Le contrebassiste, au cœur de l'orange et du vert. Indirah n'a pas peint un musicien : elle a peint le son. Les couleurs vibrent avant la mélodie — écoutez d'abord, vous comprendrez après.",
        en: "Ah, this one… this is where I come from. The double bassist, at the heart of orange and green. Indirah didn't paint a musician — she painted the sound. The colors vibrate before the melody: listen first, you'll understand after."
      },
      transition: {
        fr: "La dernière, elle, ne murmure pas. Elle crie.",
        en: "The last one doesn't murmur. It shouts."
      },
      next: 'work3'
    },
    work3: {
      message: {
        fr: "Et on finit fort. Une figure jaillit d'un monde de manchettes et de silences imprimés. Bouche ouverte, chevelure immense : une voix qui refuse la marge. Le papier devient matière, la figure prend toute la place. Laissez-la vous atteindre.",
        en: "And we end loud. A figure erupts from a world of headlines and printed silences. Open mouth, monumental hair: a voice that refuses the margins. Paper becomes matter, the figure takes all the space. Let it reach you."
      },
      next: null
    }
  };

  /* Payoff — n'apparaît qu'après avoir vu les 3 œuvres (voir buildWorkNode). */
  var MORY_PAYOFF = {
    fr: "Voilà mes trois : un visage qu'on devine, un son qu'on écoute, une voix qu'on entend. Trois façons d'être présent sans tout dire. Si l'une vous a parlé, dites-le à Indirah.",
    en: "There are my three: a face you sense, a sound you hear, a voice you can't ignore. Three ways of being present without telling all. If one spoke to you, tell Indirah."
  };

  /* ════════════════════════════════════════════════════════════════
     2. CONSTANTES & ÉTAT
  ════════════════════════════════════════════════════════════════ */
  var IMAGE_DIR   = 'images/mascotte/';
  var IMAGE_EXT   = '.webp';
  var EXPRESSIONS  = ['mascotte-accueil', 'mascotte-montre', 'mascotte-joue', 'mascotte-ecoute'];
  var GREETED_KEY = 'mory_greeted';
  var COLLAPSED_KEY = 'mory_collapsed';

  var UI_LABELS = {
    open:    { fr: 'Ouvrir la conversation avec Mory', en: 'Open the conversation with Mory' },
    minimize:{ fr: 'Réduire Mory',    en: 'Minimize Mory' },
    restore: { fr: 'Afficher Mory',   en: 'Show Mory' },
    close:   { fr: 'Fermer',          en: 'Close' },
    dismiss: { fr: 'Fermer le message', en: 'Dismiss message' }
  };

  /* Références DOM */
  var root, figure, minBtn, greetEl, greetText, greetClose;
  var panel, panelClose, messagesEl, optionsEl, headerTitle;
  var imageEls = [], activeImageIndex = 0, currentImageName = null;
  var prefetchedExpressions = {};

  /* Fil de conversation : tableau ré-affichable pour le changement de langue.
     Chaque entrée : { role:'user'|'mory', ... }  */
  var thread = [];
  var currentOptions = [];
  var typingTimer = null;
  var greetTimer  = null;
  var hasEntered  = false;
  var sayText     = null; /* texte transitoire en cours (API publique Mory.say) */
  var viewedWorks = {};   /* œuvres vues dans la conversation courante (payoff) */

  /* ════════════════════════════════════════════════════════════════
     3. HELPERS
  ════════════════════════════════════════════════════════════════ */
  function getStored(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }
  function setStored(storage, key, value) {
    try { storage.setItem(key, value); } catch (e) {}
  }
  function getLang() {
    return getStored(localStorage, 'indirah-lang') || document.documentElement.lang || 'fr';
  }
  function pick(map) {
    if (!map) return '';
    var lang = getLang();
    return map[lang] || map.fr || '';
  }
  function imagePath(name) { return IMAGE_DIR + name + IMAGE_EXT; }

  /* Liste à plat de toutes les œuvres (toutes séries), dans l'ordre. */
  function getAllWorks() {
    if (typeof oeuvresData === 'undefined') return [];
    var out = [];
    Object.keys(oeuvresData).forEach(function (serieKey) {
      var serie = oeuvresData[serieKey];
      if (serie && serie.works) {
        serie.works.forEach(function (w) { out.push(w); });
      }
    });
    return out;
  }

  function tr(key) {
    if (typeof translations === 'undefined') return { fr: key, en: key };
    return {
      fr: (translations.fr && translations.fr[key]) || key,
      en: (translations.en && translations.en[key]) || key
    };
  }

  function findWork(workId) {
    var all = getAllWorks();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === workId) return all[i];
    }
    return null;
  }

  /* ════════════════════════════════════════════════════════════════
     4. RÉSOLUTION D'UN NŒUD  →  { expression, message, image?, title?,
                                    subtitle?, options[] }
  ════════════════════════════════════════════════════════════════ */
  function buildOeuvresNode() {
    var base = MORY_CONVERSATION.nodes.oeuvres;
    var options = getAllWorks().map(function (w) {
      return { id: 'work:' + w.id, label: tr(w.titleKey) };
    });
    options.push({ id: 'menu', label: LABELS.backToMenu });
    return {
      expression: base.expression,
      message: base.message,
      options: options
    };
  }

  function allWorksViewed() {
    var all = getAllWorks();
    return all.length > 0 && all.every(function (w) { return viewedWorks[w.id]; });
  }

  function buildWorkNode(workId) {
    var w = findWork(workId);
    if (!w) return null;
    var mw = MORY_WORKS[workId] || {};

    /* Trace des œuvres vues dans la conversation courante (pour le payoff). */
    viewedWorks[workId] = true;

    /* Récit + transition (voix de Mory) réunis dans une seule bulle. */
    var message = {
      fr: (mw.message ? mw.message.fr : '') + (mw.transition ? '\n\n' + mw.transition.fr : ''),
      en: (mw.message ? mw.message.en : '') + (mw.transition ? '\n\n' + mw.transition.en : '')
    };

    var options = [];
    if (mw.next) {
      /* Enchaînement guidé vers l'œuvre suivante. */
      options.push({ id: 'work:' + mw.next, featured: true, label: LABELS.nextWork });
    } else if (allWorksViewed()) {
      /* Dernière œuvre ET les 3 vues → payoff (jamais incohérent). */
      options.push({ id: 'payoff', featured: true, label: { fr: 'Continuer', en: 'Continue' } });
    }
    options.push({ id: 'oeuvres', label: LABELS.chooseWork });
    options.push({ id: 'menu',    label: LABELS.backToMenu });

    return {
      expression: 'mascotte-montre',
      image: w.src,
      title: tr(w.titleKey),
      subtitle: tr(w.techniqueKey),
      message: message,
      options: options
    };
  }

  function buildPayoffNode() {
    return {
      expression: 'mascotte-ecoute',
      message: MORY_PAYOFF,
      options: [
        { id: 'goto-contact', contactOpen: true, subject: 'Mory — Écrire à Indirah', featured: true, label: LABELS.writeToHer },
        { id: 'oeuvres', label: LABELS.chooseWork },
        { id: 'menu',    label: LABELS.backToMenu }
      ]
    };
  }

  function getNode(nodeId) {
    if (nodeId === 'menu') return MORY_CONVERSATION.menu;
    if (nodeId === 'oeuvres') return buildOeuvresNode();
    if (nodeId === 'payoff') return buildPayoffNode();
    if (nodeId.indexOf('work:') === 0) return buildWorkNode(nodeId.slice(5));
    return MORY_CONVERSATION.nodes[nodeId] || null;
  }

  /* ════════════════════════════════════════════════════════════════
     5. CONSTRUCTION DU DOM
  ════════════════════════════════════════════════════════════════ */
  function buildDom() {
    if (document.getElementById('mory')) return;

    root = document.createElement('div');
    root.id = 'mory';
    root.className = 'mory';

    /* ── Panneau de conversation ── */
    panel = document.createElement('div');
    panel.className = 'mory-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Mory');

    var head = document.createElement('div');
    head.className = 'mory-panel-head';

    var headAvatar = document.createElement('span');
    headAvatar.className = 'mory-panel-avatar';
    var headImg = document.createElement('img');
    headImg.src = imagePath('mascotte-accueil');
    headImg.alt = '';
    headImg.loading = 'lazy';
    headImg.decoding = 'async';
    headAvatar.appendChild(headImg);

    headerTitle = document.createElement('span');
    headerTitle.className = 'mory-panel-title';
    headerTitle.textContent = 'Mory';

    panelClose = document.createElement('button');
    panelClose.type = 'button';
    panelClose.className = 'mory-panel-close';
    panelClose.innerHTML = closeIcon(13);

    head.appendChild(headAvatar);
    head.appendChild(headerTitle);
    head.appendChild(panelClose);

    messagesEl = document.createElement('div');
    messagesEl.className = 'mory-messages';
    messagesEl.setAttribute('aria-live', 'polite');

    optionsEl = document.createElement('div');
    optionsEl.className = 'mory-options';

    panel.appendChild(head);
    panel.appendChild(messagesEl);
    panel.appendChild(optionsEl);

    /* ── Bulle d'accueil ── */
    greetEl = document.createElement('div');
    greetEl.className = 'mory-greeting';
    greetEl.setAttribute('role', 'status');

    greetClose = document.createElement('button');
    greetClose.type = 'button';
    greetClose.className = 'mory-greeting-close';
    greetClose.innerHTML = closeIcon(11);

    greetText = document.createElement('p');
    greetText.className = 'mory-greeting-text';

    greetEl.appendChild(greetClose);
    greetEl.appendChild(greetText);

    /* ── Figure de Mory (2 images pour le fondu enchaîné) ── */
    figure = document.createElement('button');
    figure.type = 'button';
    figure.className = 'mory-figure';
    for (var i = 0; i < 2; i++) {
      var img = document.createElement('img');
      img.className = 'mory-img' + (i === 0 ? ' is-active' : '');
      img.alt = '';
      img.decoding = 'async';
      img.loading = i === 0 ? 'eager' : 'lazy';
      figure.appendChild(img);
      imageEls.push(img);
    }

    /* Bouton « réduire » (vers la pastille) */
    minBtn = document.createElement('button');
    minBtn.type = 'button';
    minBtn.className = 'mory-min';
    minBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>';

    root.appendChild(panel);
    root.appendChild(greetEl);
    root.appendChild(figure);
    root.appendChild(minBtn);
    document.body.appendChild(root);

    if (isCollapsed()) root.classList.add('is-collapsed');
    setImage('mascotte-accueil');
    updateUiLabels();
    bindEvents();

    window.requestAnimationFrame(function () {
      root.classList.add('is-ready');
      hasEntered = true;
    });
  }

  function closeIcon(size) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  /* ════════════════════════════════════════════════════════════════
     6. ÉVÉNEMENTS
  ════════════════════════════════════════════════════════════════ */
  function bindEvents() {
    figure.addEventListener('click', function () {
      if (root.classList.contains('is-collapsed')) { expand(); return; }
      openPanel();
    });

    minBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      collapse();
    });

    panelClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closePanel();
    });

    optionsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.mory-opt');
      if (!btn || !optionsEl.contains(btn)) return;
      var opt = currentOptions[parseInt(btn.dataset.optionIndex, 10)];
      if (!opt) return;
      if (opt.contactOpen) return;
      if (opt.href) { window.location.href = opt.href; return; }
      navigate(opt.id, opt.label);
    });

    greetEl.addEventListener('click', function (e) {
      if (e.target === greetClose || greetClose.contains(e.target)) {
        hideGreeting();
        return;
      }
      hideGreeting();
      openPanel();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) closePanel();
    });

    window.addEventListener('indirah:languagechange', onLanguageChange);
    window.addEventListener('resize', updateOverlayState);
  }

  function updateUiLabels() {
    var lang = getLang();
    figure.setAttribute('aria-label',
      root && root.classList.contains('is-collapsed')
        ? (UI_LABELS.restore[lang] || UI_LABELS.restore.fr)
        : (UI_LABELS.open[lang] || UI_LABELS.open.fr));
    minBtn.setAttribute('aria-label', UI_LABELS.minimize[lang] || UI_LABELS.minimize.fr);
    panelClose.setAttribute('aria-label', UI_LABELS.close[lang] || UI_LABELS.close.fr);
    greetClose.setAttribute('aria-label', UI_LABELS.dismiss[lang] || UI_LABELS.dismiss.fr);
  }

  /* ════════════════════════════════════════════════════════════════
     7. EXPRESSIONS (fondu enchaîné entre deux <img>)
  ════════════════════════════════════════════════════════════════ */
  function setImage(name) {
    if (!name || name === currentImageName || !imageEls.length) return;

    if (!currentImageName) {
      imageEls[activeImageIndex].src = imagePath(name);
      prefetchedExpressions[name] = true;
      currentImageName = name;
      return;
    }

    var incomingIndex = activeImageIndex === 0 ? 1 : 0;
    var incoming = imageEls[incomingIndex];
    var outgoing = imageEls[activeImageIndex];
    var didSwap = false;

    function swap() {
      if (didSwap) return;
      didSwap = true;
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
      activeImageIndex = incomingIndex;
      currentImageName = name;
    }

    incoming.onload = function () {
      prefetchedExpressions[name] = true;
      swap();
    };
    incoming.onerror = function () {
      incoming.onload = null;
      incoming.onerror = null;
    };
    incoming.src = imagePath(name);
    if (incoming.complete && incoming.naturalWidth > 0) {
      prefetchedExpressions[name] = true;
      swap();
    }
  }

  /* ════════════════════════════════════════════════════════════════
     8. NAVIGATION DANS LA CONVERSATION
  ════════════════════════════════════════════════════════════════ */
  function navigate(nodeId, userLabel) {
    var node = getNode(nodeId);
    if (!node) return;

    setImage(node.expression);

    /* Écho du choix de l'utilisateur (bulle alignée à droite) */
    if (userLabel) {
      var uEntry = { role: 'user', label: userLabel };
      thread.push(uEntry);
      appendUserBubble(uEntry);
    }

    /* Efface les boutons pendant que Mory « écrit » */
    renderOptions([]);
    showTyping();

    clearTimeout(typingTimer);
    typingTimer = window.setTimeout(function () {
      hideTyping();
      var mEntry = {
        role: 'mory',
        message: node.message,
        image: node.image || null,
        title: node.title || null,
        subtitle: node.subtitle || null
      };
      thread.push(mEntry);
      appendMoryBubble(mEntry, true);
      currentOptions = node.options || [];
      renderOptions(currentOptions);
    }, 520);
  }

  /* ── Bulles ── */
  function appendUserBubble(entry) {
    var row = document.createElement('div');
    row.className = 'mory-msg mory-msg--user mory-msg--in';
    var b = document.createElement('div');
    b.className = 'mory-chat mory-chat--user';
    var p = document.createElement('p');
    p.className = 'mory-chat-text';
    p.textContent = pick(entry.label);
    b.appendChild(p);
    row.appendChild(b);
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function appendMoryBubble(entry, animate) {
    var row = document.createElement('div');
    row.className = 'mory-msg mory-msg--mory' + (animate ? ' mory-msg--in' : '');
    var b = document.createElement('div');
    b.className = 'mory-chat';

    if (entry.image) {
      var img = document.createElement('img');
      img.className = 'mory-chat-img';
      img.src = entry.image;
      img.alt = entry.title ? pick(entry.title) : '';
      img.loading = 'lazy';
      b.appendChild(img);
    }
    if (entry.title) {
      var cap = document.createElement('p');
      cap.className = 'mory-chat-title';
      cap.textContent = pick(entry.title);
      if (entry.subtitle) {
        var sub = document.createElement('span');
        sub.className = 'mory-chat-subtitle';
        sub.textContent = pick(entry.subtitle);
        cap.appendChild(document.createElement('br'));
        cap.appendChild(sub);
      }
      b.appendChild(cap);
    }
    var p = document.createElement('p');
    p.className = 'mory-chat-text';
    p.textContent = pick(entry.message);
    b.appendChild(p);

    row.appendChild(b);
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function showTyping() {
    hideTyping();
    var row = document.createElement('div');
    row.className = 'mory-msg mory-msg--mory mory-msg--in';
    row.id = 'mory-typing';
    row.innerHTML =
      '<div class="mory-chat mory-typing">' +
      '<span class="mory-dot"></span><span class="mory-dot"></span><span class="mory-dot"></span>' +
      '</div>';
    messagesEl.appendChild(row);
    scrollToBottom();
  }
  function hideTyping() {
    var t = document.getElementById('mory-typing');
    if (t) t.parentNode.removeChild(t);
  }

  function renderOptions(options) {
    optionsEl.innerHTML = '';
    (options || []).forEach(function (opt, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mory-opt' + (opt.featured ? ' mory-opt--featured' : '');
      btn.dataset.optionIndex = String(index);
      btn.dataset.optionId = opt.id;
      if (opt.href) btn.dataset.href = opt.href;
      if (opt.contactOpen) {
        btn.dataset.contactOpen = '';
        if (opt.subject) btn.dataset.contactSubject = opt.subject;
      }
      btn.textContent = pick(opt.label);
      optionsEl.appendChild(btn);
    });
  }

  function scrollToBottom() {
    window.requestAnimationFrame(function () {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  /* ── Ré-affichage complet (changement de langue) ── */
  function rebuildThread() {
    messagesEl.innerHTML = '';
    thread.forEach(function (entry) {
      if (entry.role === 'user') appendUserBubble(entry);
      else appendMoryBubble(entry, false);
    });
    renderOptions(currentOptions);
    scrollToBottom();
  }

  /* ════════════════════════════════════════════════════════════════
     9. OUVERTURE / FERMETURE / RÉDUCTION
  ════════════════════════════════════════════════════════════════ */
  function openPanel() {
    if (root.classList.contains('is-open')) return;
    hideGreeting();
    root.classList.add('is-open');

    /* Nouvelle conversation à chaque ouverture : on repart du menu. */
    thread = [];
    currentOptions = [];
    viewedWorks = {};
    messagesEl.innerHTML = '';
    optionsEl.innerHTML = '';
    navigate('menu', null);

    window.setTimeout(function () { panelClose.focus(); }, 60);
  }

  function closePanel() {
    if (!root.classList.contains('is-open')) return;
    clearTimeout(typingTimer);
    root.classList.remove('is-open');
    figure.focus();
  }

  function isCollapsed() {
    return getStored(sessionStorage, COLLAPSED_KEY) === 'true';
  }
  function collapse() {
    setStored(sessionStorage, COLLAPSED_KEY, 'true');
    root.classList.remove('is-open');
    root.classList.add('is-collapsed');
    hideGreeting();
    updateUiLabels();
  }
  function expand() {
    setStored(sessionStorage, COLLAPSED_KEY, 'false');
    root.classList.remove('is-collapsed');
    updateUiLabels();
  }

  /* ════════════════════════════════════════════════════════════════
     10. BULLE D'ACCUEIL (une fois par session)
  ════════════════════════════════════════════════════════════════ */
  function showGreeting() {
    var greetedKey = window.MORY_GREETING_KEY || GREETED_KEY;
    if (getStored(sessionStorage, greetedKey) === 'true') return;
    if (root.classList.contains('is-collapsed') ||
        root.classList.contains('is-open') ||
        hasActiveOverlay()) return;
    setStored(sessionStorage, greetedKey, 'true');
    /* window.MORY_GREETING permet à une page (ex. le parcours d'accueil)
       de personnaliser le message d'accueil de Mory. */
    greetText.textContent = pick(window.MORY_GREETING || MORY_CONVERSATION.greeting);
    root.classList.add('has-greeting');
  }
  function hideGreeting() {
    clearTimeout(greetTimer);
    root.classList.remove('has-greeting');
    sayText = null;
  }

  /* ── Bulle transitoire pilotée par l'extérieur (API window.Mory.say) ──
     Réutilise la bulle d'accueil pour afficher un message ponctuel
     (commentaire d'œuvre, conclusion de parcours…), sans toucher au
     marqueur « déjà accueilli » de la session. */
  function morySay(textMap, opts) {
    opts = opts || {};
    if (!root || !greetText) return;
    if (root.classList.contains('is-open') ||
        root.classList.contains('is-collapsed') ||
        hasActiveOverlay()) return;
    clearTimeout(greetTimer);
    if (opts.expression) setImage(opts.expression);
    sayText = textMap;
    greetText.textContent = pick(textMap);
    root.classList.add('has-greeting');
    var duration = (opts.duration === undefined) ? 6000 : opts.duration;
    if (duration > 0) {
      greetTimer = window.setTimeout(function () {
        root.classList.remove('has-greeting');
        sayText = null;
      }, duration);
    }
  }

  function scheduleGreeting() {
    function fire(delay) {
      greetTimer = window.setTimeout(showGreeting, delay);
    }
    fire(2000);
  }

  /* ════════════════════════════════════════════════════════════════
     11. MASQUAGE SOUS LES OVERLAYS (lightbox, séquence vidéo, etc.)
  ════════════════════════════════════════════════════════════════ */
  function hasActiveOverlay() {
    if (document.querySelector('#lightbox-overlay.active')) return true;
    if (document.querySelector('#seq-overlay.active')) return true;
    if (document.querySelector('#mobile-menu.active')) return true;
    if (document.querySelector('#mobile-menu-overlay.active')) return true;

    return false;
  }

  function updateOverlayState() {
    if (!root) return;
    root.classList.toggle('is-suppressed', hasActiveOverlay());
  }

  function observeOverlayState() {
    var observer = new MutationObserver(updateOverlayState);
    observer.observe(document.body, {
      attributes: true, childList: true, subtree: true,
      attributeFilter: ['class', 'style', 'hidden']
    });
    updateOverlayState();
  }

  /* ════════════════════════════════════════════════════════════════
     12. CHANGEMENT DE LANGUE EN COURS DE CONVERSATION
  ════════════════════════════════════════════════════════════════ */
  function onLanguageChange() {
    updateUiLabels();
    if (greetText) {
      greetText.textContent = pick(sayText || window.MORY_GREETING || MORY_CONVERSATION.greeting);
    }
    if (root.classList.contains('is-open')) rebuildThread();
  }

  /* ════════════════════════════════════════════════════════════════
     13. INITIALISATION
  ════════════════════════════════════════════════════════════════ */
  function prefetchExpression(name) {
    if (!name || prefetchedExpressions[name] || name === currentImageName) return;
    var pre = new Image();
    pre.decoding = 'async';
    pre.onload = function () { prefetchedExpressions[name] = true; };
    pre.onerror = function () { delete prefetchedExpressions[name]; };
    prefetchedExpressions[name] = 'pending';
    pre.src = imagePath(name);
  }

  function scheduleExpressionPrefetch() {
    function run() {
      EXPRESSIONS.forEach(prefetchExpression);
    }
    /* Sur une page d'accueil peu interactive, requestIdleCallback peut partir
       avant même la fin du chargement. On réserve d'abord la bande passante au
       premier écran, puis on précharge les expressions pendant un temps idle. */
    window.setTimeout(function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(run, { timeout: 2000 });
      } else {
        run();
      }
    }, 3000);
  }

  /* ════════════════════════════════════════════════════════════════
     API PUBLIQUE — pilotage de Mory depuis une autre page/script
     (utilisée par le parcours d'accueil : gallery.js)
  ════════════════════════════════════════════════════════════════ */
  window.Mory = {
    /* say({fr,en}, { expression, duration }) — affiche une bulle ponctuelle.
       duration en ms (0 = persistant jusqu'au prochain say/hide). */
    say: morySay,
    hide: function () { hideGreeting(); },
    setExpression: function (name) { setImage(name); }
  };

  function init() {
    buildDom();
    scheduleExpressionPrefetch();
    observeOverlayState();
    scheduleGreeting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
