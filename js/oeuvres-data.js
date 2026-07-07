/* ═══════════════════════════════════════════════════════
   Source unique pour toutes les données d'œuvres.
   Chargee avant translations.js, main.js, gallery.js et mory.js.
   Pour ajouter une œuvre : modifier ce fichier uniquement,
   puis ajouter les clés correspondantes dans translations.js.
══════════════════════════════════════════════════════════ */
var oeuvresData = {
  serie1: {
    titleKey:     'serie1_title',
    textKey:      'serie1_text',
    linkKey:      'serie1_link',
    works: [
      {
        id:           'work1',
        src:          'images/serie-1/maria.webp',
        srcSpotlight: 'images/serie-1/maria-spotlight.webp',
        titleKey:     'work1_title',
        techniqueKey: 'work1_technique',
        /* Descriptions racontées par Mory. Remplacer par les vrais textes d'Indirah. */
        description: {
          fr: "Description à venir pour cette œuvre.",
          en: "Description coming soon for this work."
        },
        /* Commentaire de Mory quand l'œuvre entre à l'écran (parcours accueil).
           Placeholder — à remplacer par le vrai texte d'Indirah. */
        moryComment: {
          fr: "Commençons par celle-ci. Laissez la lumière venir à vous.",
          en: "Let's begin with this one. Let the light come to you."
        }
      },
      {
        id:           'work2',
        /* src        : version courante de l'œuvre (galerie, mobile)          */
        /* srcSpotlight : version musée pour la séquence reveal (oeuvres.html) */
        src:          'images/serie-1/mory.webp',
        srcSpotlight: 'images/serie-1/mory-spotlight.webp',
        titleKey:     'work2_title',
        techniqueKey: 'work2_technique',
        description: {
          fr: "Description à venir pour cette œuvre.",
          en: "Description coming soon for this work."
        },
        moryComment: {
          fr: "Approchez-vous. Les détails se révèlent de près.",
          en: "Step closer. The details reveal themselves up close."
        }
      },
      {
        id:           'work3',
        src:          'images/serie-1/stepout.webp',
        srcSpotlight: 'images/serie-1/stepout-spotlight.webp',
        titleKey:     'work3_title',
        techniqueKey: 'work3_technique',
        description: {
          fr: "Description à venir pour cette œuvre.",
          en: "Description coming soon for this work."
        },
        moryComment: {
          fr: "Celle-ci a du mouvement. Suivez-le du regard.",
          en: "This one has movement. Follow it with your eyes."
        }
      }
    ]
  },
  serie2: {
    titleKey:     'serie2_title',
    textKey:      'serie2_text',
    linkKey:      'serie2_link',
    works: [
      {
        id:           'work4',
        src:          'images/serie-2/vide.webp', /* placeholder — œuvre à venir */
        srcSpotlight: null,
        titleKey:     'work4_title',
        techniqueKey: 'work4_technique',
        description: {
          fr: "Description à venir pour cette œuvre.",
          en: "Description coming soon for this work."
        },
        moryComment: {
          fr: "Cette œuvre vous sera bientôt dévoilée.",
          en: "This piece will be revealed soon."
        }
      },
      {
        id:           'work5',
        src:          'images/serie-2/vide.webp', /* placeholder — œuvre à venir */
        srcSpotlight: null,
        titleKey:     'work5_title',
        techniqueKey: 'work5_technique',
        description: {
          fr: "Description à venir pour cette œuvre.",
          en: "Description coming soon for this work."
        },
        moryComment: {
          fr: "Cette œuvre vous sera bientôt dévoilée.",
          en: "This piece will be revealed soon."
        }
      },
      {
        id:           'work6',
        src:          'images/serie-2/vide.webp', /* placeholder — œuvre à venir */
        srcSpotlight: null,
        titleKey:     'work6_title',
        techniqueKey: 'work6_technique',
        description: {
          fr: "Description à venir pour cette œuvre.",
          en: "Description coming soon for this work."
        },
        moryComment: {
          fr: "Cette œuvre vous sera bientôt dévoilée.",
          en: "This piece will be revealed soon."
        }
      }
    ]
  }
};
