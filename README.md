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
|   |-- jeffrey-video.js # Commande bilingue des films Jeffrey (accueil, carte « À venir » d'Œuvres)
|   |-- mory-greeting.js # Message d'accueil de Mory propre a l'Accueil, A propos et Contact
|   |-- legacy-redirect.js # Redirection des pages-relais atelier.html et musee.html
|   `-- mory.js         # Assistant/guide anime
|-- fonts/              # Cormorant Garamond et EB Garamond auto-hebergees (WOFF2 latin) + licences OFL
|-- images/
|   |-- hero-accueil-texture.webp
|   |-- hero-parcours-journal.webp
|   |-- hero-mory-galerie.webp     # visuel social/partage pour Œuvres et Contact
|   |-- mains-pinceau.webp
|   |-- portrait-artiste.webp      # photo officielle (page A propos), 1200x900
|   |-- mascotte/       # Expressions de Mory (256x384, affichage max. 128 px)
|   `-- serie-1/        # Œuvres : *-thumb, *-mur (lightbox), *-spotlight ; sources pleine resolution non publiees
|-- media/
|   |-- jeffrey_v2_web.mp4         # Film d'annonce Jeffrey (accueil, lecture a la demande)
|   |-- jeffrey-v2-poster.webp     # Affiche extraite du film
|   |-- jeffrey-serie-2-introduction.mp4          # Presentation de Jeffrey, Serie 2 (Œuvres, carte « À venir »), 9:16
|   |-- jeffrey-serie-2-introduction-poster.webp  # Affiche extraite de la presentation (540x960)
|   `-- jeffrey-serie-2-introduction-en.vtt       # Sous-titres anglais de la presentation
|-- originals/images/   # Sources non compressees conservees hors assets servis
|-- robots.txt
|-- sitemap.xml
|-- manifest.json
|-- atelier.html        # Page-relais de l'ancienne route Atelier (vers oeuvres.html)
|-- musee.html          # Page-relais de l'ancienne route Musee (vers oeuvres.html#parcours-immersif)
|-- tools/check_security.py # Controles de securite pre-deploiement (non publie)
`-- .github/workflows/pages.yml  # Build et deploiement GitHub Pages
```

## Pages Actives

- `index.html` : Accueil en plusieurs sections. Le hero utilise `images/hero-accueil-texture.webp`, puis la page enchaine « Fragments d'un geste » et le film Jeffrey, apercu des œuvres, amorce artiste, cloture (avec la mention Instagram) et footer.
- `oeuvres.html` : Acces direct aux series, grille desktop, feed mobile, lightbox et parcours immersif integre.
- `apropos.html` : Presentation bilingue epuree de l'artiste et de sa demarche, sur fond teal uni.
- `contact.html` : Page mince avec invitation et bouton d'ouverture du popup partage.

Le menu actif est : `Accueil / Œuvres / À propos / Contact`.

## Fonctionnalites Cles

- **Bilingue FR/EN** : les textes utilisent `data-i18n`, `data-i18n-placeholder`, `data-i18n-alt-*` et `data-i18n-content`. `js/translations.js` applique la langue et persiste le choix dans `localStorage` avec la cle `indirah-lang`.
- **Mory** : assistant de conversation scripte dans `js/mory.js`. Les expressions sont dans `images/mascotte/`. Mory peut ouvrir le popup de contact partage depuis son option `Ecrire a Indirah`.
- **Œuvres** : `js/oeuvres-data.js` est la source de verite des series, titres, techniques, recits, disponibilites et chemins d'images. `js/main.js` genere les grilles desktop et le feed mobile, puis pilote la lightbox.
- **Parcours immersif** : `js/gallery.js` genere les salles depuis `oeuvres-data.js` dans `oeuvres.html`. Les salles s'allument via IntersectionObserver (aucune bibliotheque externe, GSAP n'est pas charge), avec chargement progressif des images.
- **Contact partage** : `js/contact-popup.js` et `css/contact-popup.css` construisent un popup unique, ouvrable depuis les navigations, le menu mobile, l'Accueil, la page Contact, le parcours immersif et Mory. Le popup gere validation locale (longueurs maximales : nom 100, e-mail 254, telephone 30, message 5 000 caracteres ; `maxlength` empeche le navigateur d'accepter une saisie plus longue, si bien qu'un texte colle au-dela de la limite peut etre coupe par le navigateur, et la validation JavaScript refuse en plus une valeur trop longue injectee ou modifiee dans le DOM ; un compteur de caracteres accessible reste une amelioration possible, non ajoutee), honeypot anti-spam `botcheck` de Web3Forms (case cochee : aucun envoi ; case non cochee : `botcheck` absent des donnees envoyees), etats de succes/erreur, focus, fermeture clavier et envoi Web3Forms.
- **Securite** : chaque page declare une Content-Security-Policy (`<meta http-equiv>`) limitee au site lui-meme et a `https://api.web3forms.com` pour l'envoi du formulaire, ainsi que `referrer` `strict-origin-when-cross-origin`. Aucun script ni style inline : tout passe par des fichiers locaux. Les polices sont servies depuis `fonts/`.

## Assets

Les assets publics suivent une convention descriptive en kebab-case, par categorie ou usage : `hero-*`, `portrait-*`, `mains-*`, `mascotte/*`, `serie-1/*-spotlight.webp`, etc.

Les originaux lourds et non compresses sont conserves dans `originals/images/`. Utiliser ces fichiers si une nouvelle compression, une taille differente ou un format alternatif devient necessaire.

La Serie II est annoncee sans image (`status: 'upcoming'` dans `js/oeuvres-data.js`). Les assets non utilises `hero-apropos-pinboard.webp`, `logo-indirah.webp` et `serie-2/vide.webp` ont ete retires.

Instagram est affiche partout comme « Instagram — bientot », sans lien (texte simple, non interactif et non focalisable), tant que l'URL officielle n'existe pas.

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
- `.github/workflows/pages.yml` construit un dossier `_site` a partir d'une liste publique explicite.
- Les Pull Requests vers `dev` et vers `main` construisent et valident l'artefact sans le deployer.
- Un push sur `dev` construit l'artefact sans le deployer.
- Seul un push sur `main` deploie le site. Un lancement manuel (`workflow_dispatch`) construit seulement l'artefact.
- Liste publique : `index.html`, `oeuvres.html`, `apropos.html`, `contact.html`, `atelier.html`, `musee.html`, `robots.txt`, `sitemap.xml`, `manifest.json`, `favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`, les dossiers `css/`, `js/`, `images/`, `fonts/`, et les medias listes un par un dans `public_media` (films Jeffrey, leurs affiches et les sous-titres de la presentation Serie 2) ; le dossier `media/` n'est jamais copie en entier.
- Exclusions explicites de l'artefact (`excluded_files` dans le workflow) : `images/serie-1/maria.webp`, `mory.webp` et `stepout.webp`. Ces sources pleine resolution restent dans le depot mais ne sont jamais chargees par le site.
- `originals/`, `docs/`, `tools/`, `Youtube/`, `administratif/`, ce README et les fichiers techniques (`.github/`, `.gitignore`) ne font pas partie de l'artefact du site. `Youtube/` et `administratif/` sont ignores par Git.
- Les actions GitHub du workflow sont epinglees par SHA complet (version en commentaire).
- `tools/check_security.py` (Python, bibliotheque standard) est execute par le workflow apres la construction : Content-Security-Policy et politique de referent de chaque page, polices locales sans Google Fonts, honeypot et limites du formulaire, epinglage des actions et liste blanche stricte de `_site`. Un echec bloque l'artefact. En local : `python tools/check_security.py --site _site`.
- Les anciennes routes sont conservees par `atelier.html` (vers `oeuvres.html`) et `musee.html` (vers `oeuvres.html#parcours-immersif`).
- La source de GitHub Pages est configuree sur « GitHub Actions » (Settings > Pages).
- Les images d'œuvres ont trois usages distincts : `*-thumb.webp` (vignettes des cartes, de l'accueil et de Mory), `*-mur.webp` (lightbox) et `*-spotlight.webp` (parcours immersif). Les œuvres sont identifiees par leur `id` dans `js/oeuvres-data.js` ; les fichiers pleine resolution n'y sont plus references.

## Flux Git

- `dev` est la branche d'integration et la branche par defaut du depot.
- `main` est la branche stable de production.
- Les branches de travail `feat/*`, `fix/*`, `perf/*` et `chore/*` partent de `dev`, et leurs Pull Requests ciblent `dev`.
- Une Pull Request `dev` → `main` n'est ouverte qu'a la fin d'un cycle coherent.
- Seul un push resultant d'une fusion sur `main` deploie GitHub Pages. Un push sur `dev` ne deploie jamais le site public.
- Les hotfixes urgents partent exceptionnellement de `main` et y sont fusionnes, puis doivent etre reintegres dans `dev`.

```text
branche de travail
        |
        v
       dev
        |
        | PR finale de release
        v
       main
        |
        v
GitHub Pages production
```

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
- Ajouter les œuvres de la Serie II dans `js/oeuvres-data.js` lorsqu'elles seront pretes.
- Completer les annees et dimensions dans `js/oeuvres-data.js`.
- Continuer a utiliser `js/oeuvres-data.js` comme source unique pour ajouter ou renommer les œuvres.
- Revalider les performances si de nouvelles images lourdes ou de nouvelles animations sont ajoutees.
