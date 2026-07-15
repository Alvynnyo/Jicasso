/* Source unique des œuvres et de leurs métadonnées éditoriales. */
var oeuvresData = {
  serie1: {
    titleKey: 'serie1_title',
    textKey: 'serie1_text',
    linkKey: 'serie1_link',
    works: [
      {
        id: 'work1',
        src: 'images/serie-1/maria.webp',
        srcSpotlight: 'images/serie-1/maria-spotlight.webp',
        titleKey: 'work1_title',
        techniqueKey: 'work1_technique',
        year: { fr: '[Année à confirmer]', en: '[Year to be confirmed]' },
        dimensions: { fr: '[Dimensions à confirmer]', en: '[Dimensions to be confirmed]' },
        availability: { fr: 'Sur demande', en: 'On request' },
        story: {
          fr: "Le visage se dérobe sous un bouquet de pivoines, entre présence affirmée et jardin intérieur. Le contraste entre la peau, les cheveux et les pétales invite à chercher ce qui demeure volontairement hors du regard.",
          en: "The face slips beneath a bouquet of peonies, poised between an assured presence and an inner garden. The contrast between skin, hair and petals invites us to seek what deliberately remains beyond view."
        },
        moryComment: {
          fr: "Les fleurs cachent le regard, mais la présence reste entière. Prenez le temps de vous en approcher.",
          en: "The flowers hide her gaze, yet her presence remains whole. Take the time to come closer."
        }
      },
      {
        id: 'work2',
        src: 'images/serie-1/mory.webp',
        srcSpotlight: 'images/serie-1/mory-spotlight.webp',
        titleKey: 'work2_title',
        techniqueKey: 'work2_technique',
        year: { fr: '[Année à confirmer]', en: '[Year to be confirmed]' },
        dimensions: { fr: '[Dimensions à confirmer]', en: '[Dimensions to be confirmed]' },
        availability: { fr: 'Sur demande', en: 'On request' },
        story: {
          fr: "Le contrebassiste qui inspire Mory, le guide du site, se tient au cœur d'un mouvement orange et vert. Les couleurs semblent prolonger la vibration de l'instrument et transformer l'écoute en paysage.",
          en: "The double bassist who inspires Mory, the site's guide, stands at the heart of an orange-and-green movement. The colors seem to carry the instrument's vibration outward, turning listening into landscape."
        },
        moryComment: {
          fr: "Cette contrebasse m'est familière. Écoutez les couleurs avant de chercher la mélodie.",
          en: "That double bass feels familiar to me. Listen to the colors before searching for the melody."
        }
      },
      {
        id: 'work3',
        src: 'images/serie-1/stepout.webp',
        srcSpotlight: 'images/serie-1/stepout-spotlight.webp',
        titleKey: 'work3_title',
        techniqueKey: 'work3_technique',
        year: { fr: '[Année à confirmer]', en: '[Year to be confirmed]' },
        dimensions: { fr: '[Dimensions à confirmer]', en: '[Dimensions to be confirmed]' },
        availability: { fr: 'Sur demande', en: 'On request' },
        story: {
          fr: "Une figure surgit d'un monde de manchettes, de traits et de silences imprimés. La bouche ouverte et la chevelure monumentale donnent à l'image la force d'une voix qui refuse de rester en marge.",
          en: "A figure rises from a world of headlines, marks and printed silences. The open mouth and monumental hair give the image the force of a voice refusing to remain at the margins."
        },
        moryComment: {
          fr: "Ici, le papier devient matière et la figure prend toute la place. Laissez cette voix venir à vous.",
          en: "Here, paper becomes material and the figure claims the whole space. Let that voice reach you."
        }
      }
    ]
  },
  serie2: {
    titleKey: 'serie2_title',
    textKey: 'serie2_text',
    status: 'upcoming',
    works: []
  }
};
