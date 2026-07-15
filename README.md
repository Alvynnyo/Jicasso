# Indirah

Site vitrine de l'artiste peintre Indirah. Le projet est un site statique en HTML, CSS et JavaScript vanilla, sans build tool et sans `package.json`.

Une migration React/Next.js a ete etudiee pour de futurs composants 3D et une architecture plus modulaire. Elle est en pause afin de garder la version vanilla actuelle rapide, stable et facile a deployer.

## Structure Du Projet

```text
.
|-- index.html          # Accueil : hero abstrait, apercu d'oeuvres, amorce artiste, cloture
|-- oeuvres.html        # Oeuvres : series, grilles, feed mobile, lightbox et parcours immersif
|-- apropos.html        # Page epuree de presentation et demarche de l'artiste
|-- contact.html        # Page mince avec bouton d'ouverture du popup de contact partage
|-- css/
|   |-- base.css        # Variables, reset, base typographique
|   |-- layout.css      # Header, navigation epuree, footer, menu mobile
|   |-- home.css        # Accueil et sections de la page
|   |-- works.css       # Page Oeuvres, grilles, feed mobile, lightbox
|   |-- gallery.css     # Parcours immersif integre a Oeuvres
|   |-- about.css       # Page A propos
|   |-- contact.css     # Page Contact mince
|   |-- contact-popup.css # Popup de contact partage
|   `-- mory.css        # Assistant Mory
|-- js/
|   |-- translations.js # Textes FR/EN et application data-i18n
|   |-- nav.js          # Navigation, menu mobile, switch langue
|   |-- oeuvres-data.js # Source de verite des oeuvres et images
|   |-- main.js         # Oeuvres : grilles, feed mobile, lightbox
|   |-- gallery.js      # Parcours immersif : salles, activation, commentaires Mory
|   |-- contact-popup.js # Popup partage, validation et Web3Forms
|   `-- mory.js         # Assistant/guide anime
|-- images/
|   |-- hero-accueil-texture.webp
|   |-- hero-parcours-journal.webp
|   |-- hero-apropos-pinboard.webp # asset conserve, non charge par la page A propos actuelle
|   |-- hero-mory-galerie.webp     # visuel social/partage pour Oeuvres et Contact
|   |-- logo-indirah.webp          # asset conserve, non reference par le logo actuel
|   |-- mains-pinceau.webp
|   |-- portrait-artiste.webp
|   |-- mascotte/       # Expressions de Mory
|   |-- serie-1/        # Oeuvres et versions spotlight
|   `-- serie-2/        # Placeholder vide.webp
|-- originals/images/   # Sources non compressees conservees hors assets servis
|-- robots.txt
|-- sitemap.xml
|-- manifest.json
|-- vercel.json
|-- _redirects          # Legacy Netlify
`-- .htaccess           # Legacy Apache
```

## Pages Actives

- `index.html` : Accueil en plusieurs sections. Le hero utilise `images/hero-accueil-texture.webp`, puis la page enchaine apercu des oeuvres, amorce artiste, rappel social, cloture et footer.
- `oeuvres.html` : Acces direct aux series, grille desktop, feed mobile, lightbox et parcours immersif integre.
- `apropos.html` : Presentation bilingue epuree de l'artiste et de sa demarche, sur fond teal uni.
- `contact.html` : Page mince avec invitation et bouton d'ouverture du popup partage.

Le menu actif est : `Accueil / Oeuvres / A propos / Contact`.

## Fonctionnalites Cles

- **Bilingue FR/EN** : les textes utilisent `data-i18n`, `data-i18n-placeholder`, `data-i18n-alt-*` et `data-i18n-content`. `js/translations.js` applique la langue et persiste le choix dans `localStorage` avec la cle `indirah-lang`.
- **Mory** : assistant de conversation scripte dans `js/mory.js`. Les expressions sont dans `images/mascotte/`. Mory peut ouvrir le popup de contact partage depuis son option `Ecrire a Indirah`.
- **Oeuvres** : `js/oeuvres-data.js` est la source de verite des series, titres, techniques, recits, disponibilites et chemins d'images. `js/main.js` genere les grilles desktop et le feed mobile, puis pilote la lightbox.
- **Parcours immersif** : `js/gallery.js` genere les salles depuis `oeuvres-data.js` dans `oeuvres.html`. Les animations utilisent GSAP + ScrollTrigger depuis CDN, avec repli IntersectionObserver et chargement progressif des images.
- **Contact partage** : `js/contact-popup.js` et `css/contact-popup.css` construisent un popup unique, ouvrable depuis les navigations, le menu mobile, l'Accueil, la page Contact, le parcours immersif et Mory. Le popup gere validation locale, etats de succes/erreur, focus, fermeture clavier et envoi Web3Forms.

## Assets

Les assets publics suivent une convention descriptive en kebab-case, par categorie ou usage : `hero-*`, `portrait-*`, `mains-*`, `mascotte/*`, `serie-1/*-spotlight.webp`, etc.

Les originaux lourds et non compresses sont conserves dans `originals/images/`. Utiliser ces fichiers si une nouvelle compression, une taille differente ou un format alternatif devient necessaire.

`images/serie-2/vide.webp` est un placeholder volontaire pour les oeuvres a venir. Il doit etre remplace progressivement par de vraies oeuvres dans `js/oeuvres-data.js`.

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

Les URLs SEO utilisent actuellement `https://indirah.fr/...`. Verifier et remplacer ce domaine partout si le domaine final change : pages HTML, `robots.txt`, `sitemap.xml`, `manifest.json` si besoin.

Etat hosting actuel :

- Le site est encore pense comme un site statique simple, compatible GitHub Pages.
- `vercel.json` est present pour une migration future vers Vercel.
- `cleanUrls` est volontairement a `false` tant que les URLs `.html` restent la reference stable.
- `vercel.json` contient les redirects/rewrite necessaires pour les anciennes routes publiques et les routes courtes.
- `_redirects` et `.htaccess` sont encore presents comme fichiers legacy Netlify/Apache. Les supprimer avant un deploiement final Vercel si Vercel devient l'unique cible.

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

- Supprimer `_redirects` et `.htaccess` si Vercel devient l'unique plateforme de deploiement.
- Revoir `vercel.json`, les canonical, le sitemap et les liens internes au moment d'une vraie bascule vers URLs propres.
- Remplacer progressivement `images/serie-2/vide.webp` par de vraies oeuvres.
- Completer les annees et dimensions dans `js/oeuvres-data.js`.
- Continuer a utiliser `js/oeuvres-data.js` comme source unique pour ajouter ou renommer les oeuvres.
- Revalider les performances si de nouvelles images lourdes ou de nouvelles animations sont ajoutees.
