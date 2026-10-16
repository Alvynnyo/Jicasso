# Indirah

Site vitrine de l'artiste peintre Indirah. Le projet est un site statique en HTML, CSS et JavaScript vanilla, sans build tool et sans `package.json`.

Une migration React/Next.js a ete etudiee pour de futurs composants 3D et une architecture plus modulaire. Elle est en pause afin de garder la version vanilla actuelle rapide, stable et facile a deployer.

## Structure Du Projet

```text
.
|-- index.html          # Accueil : hero abstrait, apercu d'œuvres, amorce artiste, cloture
|-- oeuvres.html        # Œuvres : series, grilles, feed mobile, lightbox et parcours immersif
|-- apropos.html        # Page epuree de presentation et demarche de l'artiste
|-- contact.html        # Page mince avec bouton d'ouverture du popup de contact partage
|-- css/
|   |-- base.css        # Variables, reset, base typographique
|   |-- layout.css      # Header, navigation epuree, footer, menu mobile
|   |-- home.css        # Accueil et sections de la page
|   |-- works.css       # Page Œuvres, grilles, feed mobile, lightbox
|   |-- gallery.css     # Parcours immersif integre a Œuvres
|   |-- about.css       # Page A propos
|   |-- contact.css     # Page Contact mince
|   |-- contact-popup.css # Popup de contact partage
|   `-- mory.css        # Assistant Mory
|-- js/
|   |-- translations.js # Textes FR/EN et application data-i18n
|   |-- nav.js          # Navigation, menu mobile, switch langue
|   |-- oeuvres-data.js # Source de verite des œuvres et images
|   |-- main.js         # Œuvres : grilles, feed mobile, lightbox
|   |-- gallery.js      # Parcours immersif : salles, activation, commentaires Mory
|   |-- contact-popup.js # Popup partage, validation et Web3Forms
|   `-- mory.js         # Assistant/guide anime
|-- images/
|   |-- hero-accueil-texture.webp
|   |-- hero-parcours-journal.webp
|   |-- hero-apropos-pinboard.webp # asset conserve, non charge par la page A propos actuelle
|   |-- hero-mory-galerie.webp     # visuel social/partage pour Œuvres et Contact
|   |-- logo-indirah.webp          # asset conserve, non reference par le logo actuel
|   |-- mains-pinceau.webp
|   |-- portrait-artiste.webp
|   |-- mascotte/       # Expressions de Mory
|   |-- serie-1/        # Œuvres et versions spotlight
|   `-- serie-2/        # Placeholder vide.webp
|-- originals/images/   # Sources non compressees conservees hors assets servis
|-- robots.txt
|-- sitemap.xml
|-- manifest.json
|-- atelier.html        # Page-relais de l'ancienne route Atelier (vers oeuvres.html)
|-- musee.html          # Page-relais de l'ancienne route Musee (vers oeuvres.html#parcours-immersif)
`-- .github/workflows/pages.yml  # Build et deploiement GitHub Pages
```

## Pages Actives

- `index.html` : Accueil en plusieurs sections. Le hero utilise `images/hero-accueil-texture.webp`, puis la page enchaine apercu des œuvres, amorce artiste, rappel social, cloture et footer.
- `oeuvres.html` : Acces direct aux series, grille desktop, feed mobile, lightbox et parcours immersif integre.
- `apropos.html` : Presentation bilingue epuree de l'artiste et de sa demarche, sur fond teal uni.
- `contact.html` : Page mince avec invitation et bouton d'ouverture du popup partage.

Le menu actif est : `Accueil / Œuvres / A propos / Contact`.

## Fonctionnalites Cles

- **Bilingue FR/EN** : les textes utilisent `data-i18n`, `data-i18n-placeholder`, `data-i18n-alt-*` et `data-i18n-content`. `js/translations.js` applique la langue et persiste le choix dans `localStorage` avec la cle `indirah-lang`.
- **Mory** : assistant de conversation scripte dans `js/mory.js`. Les expressions sont dans `images/mascotte/`. Mory peut ouvrir le popup de contact partage depuis son option `Ecrire a Indirah`.
- **Œuvres** : `js/oeuvres-data.js` est la source de verite des series, titres, techniques, recits, disponibilites et chemins d'images. `js/main.js` genere les grilles desktop et le feed mobile, puis pilote la lightbox.
- **Parcours immersif** : `js/gallery.js` genere les salles depuis `oeuvres-data.js` dans `oeuvres.html`. Les animations utilisent GSAP + ScrollTrigger depuis CDN, avec repli IntersectionObserver et chargement progressif des images.
- **Contact partage** : `js/contact-popup.js` et `css/contact-popup.css` construisent un popup unique, ouvrable depuis les navigations, le menu mobile, l'Accueil, la page Contact, le parcours immersif et Mory. Le popup gere validation locale, etats de succes/erreur, focus, fermeture clavier et envoi Web3Forms.

## Assets

Les assets publics suivent une convention descriptive en kebab-case, par categorie ou usage : `hero-*`, `portrait-*`, `mains-*`, `mascotte/*`, `serie-1/*-spotlight.webp`, etc.

Les originaux lourds et non compresses sont conserves dans `originals/images/`. Utiliser ces fichiers si une nouvelle compression, une taille differente ou un format alternatif devient necessaire.

`images/serie-2/vide.webp` est un placeholder volontaire pour les œuvres a venir. Il doit etre remplace progressivement par de vraies œuvres dans `js/oeuvres-data.js`.

## SEO Et Hosting

Le site contient les fichiers et balises SEO de base :

- `robots.txt`
- `sitemap.xml`
- `manifest.json`
- `apple-touch-icon.png`
- meta descriptions
- Open Graph / Twitter cards
- canonical par page
- `theme-color`

Les URLs SEO utilisent l'URL publique actuelle `https://alvynnyo.github.io/Jicasso/...`. Si le domaine change, la remplacer partout : pages HTML, `robots.txt`, `sitemap.xml`, `manifest.json` si besoin.

Etat hosting actuel :

- Le deploiement cible GitHub Pages : `https://alvynnyo.github.io/Jicasso/`.
- `.github/workflows/pages.yml` construit un dossier `_site` a partir d'une liste publique explicite, puis le deploie uniquement depuis `main`. Sur une Pull Request, l'artefact est construit et valide sans deploiement.
- Liste publique : `index.html`, `oeuvres.html`, `apropos.html`, `contact.html`, `atelier.html`, `musee.html`, `robots.txt`, `sitemap.xml`, `manifest.json`, `favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`, et les dossiers `css/`, `js/`, `images/`.
- `originals/`, `docs/`, ce README et les fichiers techniques (`.github/`, `.gitignore`) ne font pas partie de l'artefact du site.
- Les anciennes routes sont conservees par `atelier.html` (vers `oeuvres.html`) et `musee.html` (vers `oeuvres.html#parcours-immersif`).
- A l'activation du workflow, la source de GitHub Pages doit etre configuree sur « GitHub Actions » (Settings > Pages).
- Les images d'œuvres ont trois usages distincts : `*-thumb.webp` (vignettes des cartes, de l'accueil et de Mory), `*-mur.webp` (lightbox) et `*-spotlight.webp` (parcours immersif). Les fichiers `maria.webp`, `mory.webp` et `stepout.webp` restent les sources identifiantes dans `js/oeuvres-data.js`.

## Migration React En Pause

Une migration React/Next.js a ete envisagee pour faciliter une architecture de composants, un design system et de possibles integrations Three.js / 3D. La migration est en pause : la priorite actuelle est de garder le site vanilla rapide, lisible et stable.

Le detail de l'audit de migration n'est pas present comme document dedie dans `docs/` a ce stade.

## Developpement Local

Il n'y a rien a installer actuellement : pas de `package.json`, pas de bundler, pas de pipeline de build.

La methode la plus fiable est de servir le dossier avec un petit serveur statique afin que les chemins relatifs, les scripts et les assets se comportent comme en production. Node.js est disponible dans l'environnement de travail actuel.

Exemple sans dependance projet :

```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();http.createServer((req,res)=>{const u=new URL(req.url,'http://local');const rel=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));const file=path.join(root,rel);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.end(data);});}).listen(8080,()=>console.log('http://localhost:8080'));"
```

Ouvrir ensuite l'URL locale indiquee par le serveur, puis tester les quatre pages actives : `index.html`, `oeuvres.html`, `apropos.html`, `contact.html`.

L'ouverture directe des fichiers HTML peut fonctionner pour des verifications simples, mais un serveur statique reste recommande pour un comportement plus proche du deploiement.

## A Faire

- Revoir les canonical, le sitemap et les liens internes au moment d'une vraie bascule vers URLs propres.
- Remplacer progressivement `images/serie-2/vide.webp` par de vraies œuvres.
- Completer les annees et dimensions dans `js/oeuvres-data.js`.
- Continuer a utiliser `js/oeuvres-data.js` comme source unique pour ajouter ou renommer les œuvres.
- Revalider les performances si de nouvelles images lourdes ou de nouvelles animations sont ajoutees.
