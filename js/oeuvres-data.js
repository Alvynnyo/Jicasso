/* ═══════════════════════════════════════════════════════
   Source unique pour toutes les données d'œuvres.
   Chargée avant translations.js et main.js / oeuvres.js.
   Pour ajouter une œuvre : modifier ce fichier uniquement,
   puis ajouter les clés correspondantes dans translations.js.
══════════════════════════════════════════════════════════ */
var oeuvresData = {
  serie1: {
    titleKey:     'serie1_title',
    textKey:      'serie1_text',
    linkKey:      'serie1_link',
    videoSrc:     'videos/gardien.mp4',
    videoThumb:   'images/serie-1/mory.webp',
    introTextKey: 'seq_intro_text',
    outroTextKey: 'seq_outro_text',
    works: [
      {
        id:           'work1',
        src:          'images/serie-1/maria.webp',
        srcSpotlight: 'images/mariaspotlight.webp',
        titleKey:     'work1_title',
        techniqueKey: 'work1_technique'
      },
      {
        id:           'work2',
        /* src        : version courante de l'œuvre (galerie, mobile)          */
        /* srcSpotlight : version musée pour la séquence reveal (oeuvres.html) */
        src:          'images/serie-1/moryupdate.webp',
        srcSpotlight: 'images/moryspotlight-reveal.webp',
        titleKey:     'work2_title',
        techniqueKey: 'work2_technique'
      },
      {
        id:           'work3',
        src:          'images/serie-1/stepout.webp',
        srcSpotlight: 'images/stepoutspotlight.webp',
        titleKey:     'work3_title',
        techniqueKey: 'work3_technique'
      }
    ]
  },
  serie2: {
    titleKey:     'serie2_title',
    textKey:      'serie2_text',
    linkKey:      'serie2_link',
    videoSrc:     null,
    videoThumb:   null,
    introTextKey: null,
    outroTextKey: null,
    works: [
      {
        id:           'work4',
        src:          'images/serie-2/oeuvre-1.svg',
        srcSpotlight: null,
        titleKey:     'work4_title',
        techniqueKey: 'work4_technique'
      },
      {
        id:           'work5',
        src:          'images/serie-2/oeuvre-2.svg',
        srcSpotlight: null,
        titleKey:     'work5_title',
        techniqueKey: 'work5_technique'
      },
      {
        id:           'work6',
        src:          'images/serie-2/oeuvre-3.svg',
        srcSpotlight: null,
        titleKey:     'work6_title',
        techniqueKey: 'work6_technique'
      }
    ]
  }
};
