#!/usr/bin/env python3
"""Contrôles de sécurité pré-déploiement du site statique Indirah.

Bibliothèque standard uniquement : exécutable en local et dans GitHub Actions.

    python3 tools/check_security.py               # sources du dépôt
    python3 tools/check_security.py --site _site  # sources + artefact Pages

Le script n'affiche jamais le contenu d'un fichier : seulement des chemins et
le nom de la règle en échec (aucune valeur sensible ne peut être imprimée).
"""
import argparse
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

MAIN_PAGES = ['index.html', 'oeuvres.html', 'apropos.html', 'contact.html']
REDIRECT_PAGES = ['atelier.html', 'musee.html']
PAGES = MAIN_PAGES + REDIRECT_PAGES

# Politique attendue, directive par directive : toute source en plus (domaine,
# joker, data:, 'unsafe-*') ou toute directive en plus fait échouer le contrôle.
EXPECTED_CSP = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'"],
    'font-src': ["'self'"],
    'img-src': ["'self'"],
    'media-src': ["'self'"],
    'connect-src': ["'self'", 'https://api.web3forms.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'none'"],
}
# Pages-relais : aucun formulaire, donc aucune connexion externe.
EXPECTED_CSP_REDIRECT = dict(EXPECTED_CSP, **{'connect-src': ["'self'"]})
EXPECTED_REFERRER ='strict-origin-when-cross-origin'

FONT_FILES = [
    'fonts/cormorant-garamond-latin-normal.woff2',
    'fonts/cormorant-garamond-latin-italic.woff2',
    'fonts/eb-garamond-latin-normal.woff2',
    'fonts/eb-garamond-latin-italic.woff2',
]
FONT_LICENSES = ['fonts/OFL-cormorant-garamond.txt', 'fonts/OFL-eb-garamond.txt']
# Familles, styles et graisses de l'ancien appel Google Fonts, à l'identique.
EXPECTED_FACES = {
    ('Cormorant Garamond', 'normal', w, FONT_FILES[0]) for w in ('300', '400', '600')
} | {
    ('Cormorant Garamond', 'italic', w, FONT_FILES[1]) for w in ('300', '400', '600')
} | {
    ('EB Garamond', 'normal', w, FONT_FILES[2]) for w in ('400', '500')
} | {('EB Garamond', 'italic', '400', FONT_FILES[3])}

FIELD_LIMITS = {'name': 100, 'email': 254, 'phone': 30, 'message': 5000}

GOOGLE_FONTS = re.compile(r'fonts\.(googleapis|gstatic)\.com', re.I)

# Artefact Pages : entrées de premier niveau autorisées et extensions publiables.
SITE_TOP_LEVEL = set(PAGES) | {
    'robots.txt', 'sitemap.xml', 'manifest.json',
    'favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png',
    'css', 'js', 'images', 'media', 'fonts',
}
SITE_EXTENSIONS = {
    '.html', '.css', '.js', '.json', '.xml', '.txt',
    '.webp', '.png', '.svg', '.mp4', '.vtt', '.woff2',
}
SITE_TXT_ALLOWED = {'robots.txt', *FONT_LICENSES}
SITE_FORBIDDEN_NAMES = {
    '.git', '.github', '.gitignore', 'administratif', 'youtube', 'originals',
    'docs', 'tools', 'node_modules', '.venv', 'venv', '.cache', '__pycache__',
    '.ds_store', 'thumbs.db', 'desktop.ini',
}

failures = []


def check(condition, rule):
    if not condition:
        failures.append(rule)
    return condition


def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8-sig')


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.metas = []
        self.inline_scripts = 0
        self.style_elements = 0
        self.style_attrs = 0
        self.handler_attrs = 0
        self.js_urls = 0
        self.stylesheets = []
        # Balises du <head>, dans l'ordre du document (structure analysée).
        self.head_tags = []
        self.in_head = False

    def handle_starttag(self, tag, attrs):
        attrs = dict((k.lower(), v or '') for k, v in attrs)
        if tag == 'head':
            self.in_head = True
        elif tag == 'body':
            self.in_head = False
        elif self.in_head:
            self.head_tags.append((tag, attrs))
        if tag == 'meta':
            self.metas.append(attrs)
        if tag == 'script' and 'src' not in attrs:
            self.inline_scripts += 1
        if tag == 'style':
            self.style_elements += 1
        if tag == 'link' and 'stylesheet' in attrs.get('rel', '').split():
            self.stylesheets.append(attrs.get('href', ''))
        for name, value in attrs.items():
            if name == 'style':
                self.style_attrs += 1
            if name.startswith('on'):
                self.handler_attrs += 1
            if name in ('href', 'src', 'action') and value.strip().lower().startswith('javascript:'):
                self.js_urls += 1

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False


def is_csp_meta(tag):
    return tag[0] == 'meta' and tag[1].get('http-equiv', '').lower() == 'content-security-policy'


def loads_resource(tag):
    """Balise du <head> susceptible de déclencher un chargement réseau."""
    name, attrs = tag
    if name in ('script', 'style', 'img', 'iframe', 'object', 'embed', 'video', 'audio',
                'source', 'track', 'picture', 'svg', 'base', 'noscript', 'template'):
        return True
    if name == 'link':
        return True  # stylesheet, preload, preconnect, icon, manifest…
    if name == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh':
        return True
    return False


def parse_csp(value):
    policy = {}
    for part in value.split(';'):
        tokens = part.split()
        if tokens:
            policy.setdefault(tokens[0].lower(), []).extend(tokens[1:])
    return policy


def check_pages(base, label):
    for page in PAGES:
        path = base / page
        if not check(path.is_file(), f'{label}{page} : page absente'):
            continue
        parser = PageParser()
        parser.feed(path.read_text(encoding='utf-8-sig'))
        csp = [m for m in parser.metas if m.get('http-equiv', '').lower() == 'content-security-policy']
        referrer = [m for m in parser.metas if m.get('name', '').lower() == 'referrer']
        if check(len(csp) == 1, f'{label}{page} : une seule meta Content-Security-Policy attendue'):
            policy = parse_csp(csp[0].get('content', ''))
            raw = csp[0].get('content', '').lower()
            check("'unsafe-eval'" not in raw, f"{label}{page} : CSP contient 'unsafe-eval'")
            check("'unsafe-inline'" not in raw, f"{label}{page} : CSP contient 'unsafe-inline'")
            check('frame-ancestors' not in policy, f'{label}{page} : frame-ancestors est ignoré dans une meta CSP')
            expected = EXPECTED_CSP if page in MAIN_PAGES else EXPECTED_CSP_REDIRECT
            check(policy == expected, f'{label}{page} : CSP différente de la politique attendue (source ou directive en trop ou manquante)')
        check(len(referrer) == 1 and referrer[0].get('content') == EXPECTED_REFERRER,
              f'{label}{page} : meta referrer {EXPECTED_REFERRER} absente')
        # Ordre réel du <head> analysé : meta charset en premier, CSP juste
        # après, et aucune balise de chargement (script, link, image…) avant.
        head = parser.head_tags
        check(head and head[0][0] == 'meta' and 'charset' in head[0][1],
              f'{label}{page} : meta charset attendue en premier dans <head>')
        csp_index = next((i for i, t in enumerate(head) if is_csp_meta(t)), None)
        if check(csp_index is not None, f'{label}{page} : meta CSP absente du <head>'):
            check(csp_index == 1, f'{label}{page} : meta CSP attendue juste après meta charset')
            for tag in head[:csp_index]:
                check(not loads_resource(tag), f'{label}{page} : <{tag[0]}> placé avant la CSP')
        check(parser.inline_scripts == 0, f'{label}{page} : script inline (bloqué par la CSP)')
        check(parser.style_elements == 0, f'{label}{page} : élément <style> (bloqué par la CSP)')
        check(parser.style_attrs == 0, f'{label}{page} : attribut style (bloqué par la CSP)')
        check(parser.handler_attrs == 0, f'{label}{page} : gestionnaire on* inline (bloqué par la CSP)')
        check(parser.js_urls == 0, f'{label}{page} : URL javascript: (bloquée par la CSP)')
        check(all(not re.match(r'^[a-z]+:|^//', h, re.I) for h in parser.stylesheets),
              f'{label}{page} : feuille de style externe')


def check_no_google_fonts(base, label):
    for path in sorted(base.rglob('*')):
        if path.is_file() and path.suffix in ('.html', '.css', '.js', '.json', '.xml'):
            rel = path.relative_to(base).as_posix()
            if rel.split('/')[0] in ('Youtube', 'administratif', 'originals', 'docs', '.git', '_site', 'tools'):
                continue
            check(not GOOGLE_FONTS.search(path.read_text(encoding='utf-8-sig', errors='replace')),
                  f'{label}{rel} : référence à Google Fonts')


def check_fonts(base, label):
    for rel in FONT_FILES:
        path = base / rel
        if check(path.is_file(), f'{label}{rel} : police locale absente'):
            check(path.read_bytes()[:4] == b'wOF2', f'{label}{rel} : fichier WOFF2 invalide')
    for rel in FONT_LICENSES:
        path = base / rel
        if check(path.is_file(), f'{label}{rel} : licence OFL absente'):
            check('SIL Open Font License' in path.read_text(encoding='utf-8'), f'{label}{rel} : licence OFL illisible')
    css = (base / 'css/base.css').read_text(encoding='utf-8-sig')
    faces = re.findall(r'@font-face\s*\{(.*?)\}', css, re.S)
    declared = set()
    for face in faces:
        check(re.search(r'font-display:\s*swap', face), f'{label}css/base.css : font-display: swap manquant')
        family = re.search(r"font-family:\s*'([^']+)'", face)
        style = re.search(r'font-style:\s*(\w+)', face)
        weight = re.search(r'font-weight:\s*(\d+)\s*;', face)
        urls = re.findall(r"url\(['\"]?([^'\")]+)['\"]?\)\s*format\('woff2'\)", face)
        if not check(family and style and weight and len(urls) == 1,
                     f'{label}css/base.css : @font-face incomplète'):
            continue
        target = (base / 'css' / urls[0]).resolve()
        check(target.is_file(), f'{label}css/base.css : police référencée introuvable')
        declared.add((family.group(1), style.group(1), weight.group(1),
                      target.relative_to(base.resolve()).as_posix()))
    check(declared == EXPECTED_FACES and len(faces) == len(EXPECTED_FACES),
          f'{label}css/base.css : @font-face différentes des familles, styles et graisses attendus')
    check(re.search(r"--font-display:\s*'Cormorant Garamond',[^;]*serif", css)
          and re.search(r"--font-body:\s*'EB Garamond',[^;]*serif", css),
          f'{label}css/base.css : polices de secours manquantes')


def strip_js_comments(source):
    """Retire commentaires de bloc et lignes de commentaire // (pas les URL)."""
    source = re.sub(r'/\*.*?\*/', '', source, flags=re.S)
    return re.sub(r'^\s*//.*$', '', source, flags=re.M)


def block_end(source, open_brace):
    """Indice de l'accolade fermante correspondant à source[open_brace]."""
    depth = 0
    for i in range(open_brace, len(source)):
        if source[i] == '{':
            depth += 1
        elif source[i] == '}':
            depth -= 1
            if depth == 0:
                return i
    return -1


def check_honeypot_order(js):
    """Garde de STRUCTURE du chemin d'envoi, adaptée au fichier actuel.

    Elle vérifie que, dans submit() (hors commentaires), le bloc
    « if (botInput.checked) { … return; } » se termine avant le premier
    fetch(), que botcheck n'est jamais ajouté au payload, et que submit() et
    botInput sont réellement branchés. Ce n'est pas une preuve complète du
    comportement JavaScript, testé séparément dans un navigateur.
    """
    code = strip_js_comments(js)
    check(re.search(r"form\.addEventListener\('submit', submit\)", code),
          'contact-popup.js : submit() non branché sur le formulaire')
    check(re.search(r"botInput = root\.querySelector\('#contact-popup-botcheck'\)", code)
          and 'id="contact-popup-botcheck"' in code,
          'contact-popup.js : botInput non relié à la case honeypot')
    start = re.search(r'function submit\(event\) \{', code)
    if not check(start, 'contact-popup.js : fonction submit() introuvable'):
        return
    body_end = block_end(code, start.end() - 1)
    body = code[start.end():body_end]
    guard = re.search(r'if \(botInput\.checked\) \{', body)
    first_fetch = body.find('fetch(')
    check(first_fetch != -1, 'contact-popup.js : aucun fetch() dans submit()')
    if check(guard, 'contact-popup.js : test du honeypot absent de submit()'):
        guard_end = block_end(body, guard.end() - 1)
        check(re.search(r'\breturn\b', body[guard.end():guard_end]),
              'contact-popup.js : le bloc honeypot ne s’interrompt pas (return manquant)')
        check(first_fetch == -1 or guard_end < first_fetch,
              'contact-popup.js : bloc honeypot placé après fetch()')
    check(not re.search(r'\bbotcheck\b', body),
          'contact-popup.js : botcheck ajouté au payload (doit être absent)')


def check_contact_form():
    js = read('js/contact-popup.js')
    # Honeypot Web3Forms : case « botcheck » hors écran, hors tabulation, masquée
    # des technologies d'assistance, bloquante avant tout envoi, jamais envoyée.
    check(re.search(r'<div class="contact-popup-hp" aria-hidden="true">', js),
          'contact-popup.js : conteneur honeypot masqué (aria-hidden) absent')
    check(re.search(r'<input type="checkbox" name="botcheck"[^>]*tabindex="-1"[^>]*autocomplete="off"', js),
          'contact-popup.js : case honeypot botcheck absente ou focalisable')
    check_honeypot_order(js)
    check(re.search(r'\.contact-popup-hp\s*\{[^}]*position:\s*absolute', read('css/contact-popup.css')),
          'contact-popup.css : honeypot non masqué visuellement')
    # Limites : attribut maxlength + refus JavaScript + message bilingue.
    limits = re.search(r'var LIMITS = \{([^}]*)\}', js)
    if check(limits, 'contact-popup.js : objet LIMITS absent'):
        found = dict((k, int(v)) for k, v in re.findall(r'(\w+):\s*(\d+)', limits.group(1)))
        check(found == FIELD_LIMITS, 'contact-popup.js : valeurs LIMITS inattendues')
    check(re.search(r"maxlength=\"' \+ LIMITS\[id\]", js), 'contact-popup.js : maxlength absent des champs input')
    check(re.search(r"<textarea[^>]*maxlength=\"' \+ LIMITS\.message", js), 'contact-popup.js : maxlength absent du message')
    translations = read('js/translations.js')
    for field in FIELD_LIMITS:
        check(re.search(r'\.length > LIMITS\.' + field + r'\b', js), f'contact-popup.js : limite {field} non validée en JavaScript')
        check(len(re.findall(r'contact_err_max_' + field + r':', translations)) == 2,
              f'translations.js : message de limite {field} absent en FR ou EN')
    check(js.count("fetch('https://api.web3forms.com/submit'") == 1, 'contact-popup.js : point d’envoi Web3Forms inattendu')


def check_git_hygiene():
    lines = [l.strip() for l in read('.gitignore').splitlines()]
    check('Youtube/' in lines, '.gitignore : Youtube/ absent')
    # Un chemin SOUS le répertoire (valable même s'il n'existe pas, comme en CI) :
    # certaines versions de Git font correspondre « Dossier/ » à une ligne vide.
    # Le témoin index.html, jamais ignoré, écarte ce faux positif.
    def ignored(path):
        try:
            return subprocess.run(['git', 'check-ignore', '-q', '--no-index', path], cwd=ROOT).returncode == 0
        except OSError:
            return None
    check(ignored('index.html') is False, 'git check-ignore : témoin index.html déclaré ignoré (contrôle non fiable)')
    check(ignored('Youtube/controle.mp4') is True, 'git check-ignore : Youtube/ non ignoré')


def check_workflow():
    workflow = read('.github/workflows/pages.yml')
    uses = re.findall(r'^\s*(?:-\s*)?uses:\s*(\S+)(.*)$', workflow, re.M)
    check(uses, 'pages.yml : aucune action trouvée')
    for ref, comment in uses:
        check(re.fullmatch(r'[\w.-]+/[\w.-]+@[0-9a-f]{40}', ref), f'pages.yml : {ref.split("@")[0]} non épinglée par SHA complet')
        check(re.search(r'#\s*v\d+\.\d+\.\d+', comment), f'pages.yml : {ref.split("@")[0]} sans commentaire de version')
    check("if: github.event_name == 'push' && github.ref == 'refs/heads/main'" in workflow,
          'pages.yml : condition de déploiement limitée à main absente')
    check(re.search(r'public_dirs=\([^)]*\bfonts\b', workflow), 'pages.yml : fonts absent de la liste publique')


def is_link(path):
    """Lien symbolique, ou jonction Windows (vue comme un lien par Python 3.12+)."""
    return path.is_symlink() or getattr(path, 'is_junction', lambda: False)()


def find_links(root, entries=None):
    """Liens sous root, à toute profondeur, sans jamais les suivre ni les lire.

    Le test is_link() précède toute autre opération sur l'entrée ; seuls les
    vrais dossiers (pas les liens) sont parcourus. Retourne des chemins relatifs.
    """
    links = []
    pending = list(entries) if entries is not None else [root]
    while pending:
        path = pending.pop()
        if is_link(path):
            links.append(path.relative_to(root).as_posix())
        elif path.is_dir():
            pending.extend(path.iterdir())
    return sorted(links)


def check_source_links():
    # cp suit un lien passé en argument (fichiers racine, médias) et cp -R
    # recopie les liens des dossiers : aucune source publiée ne doit en être un.
    workflow = read('.github/workflows/pages.yml')
    published = re.findall(r'^\s+(media/\S+)\s*$', workflow, re.M)
    published += ['robots.txt', 'sitemap.xml', 'manifest.json', 'favicon.svg',
                  'favicon-32x32.png', 'apple-touch-icon.png', *PAGES,
                  'css', 'js', 'images', 'fonts']
    for rel in find_links(ROOT, [ROOT / item for item in published]):
        check(False, f'source publiée : lien symbolique interdit : {rel}')


def check_site(site):
    if not check(site.is_dir(), f'{site} : artefact absent'):
        return
    # Avant toute lecture : un lien pourrait faire publier ou lire un fichier
    # extérieur. Inspection arrêtée si un lien est trouvé.
    links = find_links(site)
    for rel in links:
        check(False, f'_site : lien symbolique interdit : {rel}')
    if links:
        return
    top = {p.name for p in site.iterdir()}
    for extra in sorted(top - SITE_TOP_LEVEL):
        check(False, f'_site : entrée non autorisée : {extra}')
    for path in sorted(site.rglob('*')):
        rel = path.relative_to(site).as_posix()
        name = path.name.lower()
        check(name not in SITE_FORBIDDEN_NAMES, f'_site : chemin interdit : {rel}')
        check(not name.startswith('.'), f'_site : fichier caché interdit : {rel}')
        if path.is_file():
            check(path.suffix.lower() in SITE_EXTENSIONS, f'_site : extension non publiable : {rel}')
            check(path.suffix.lower() != '.txt' or rel in SITE_TXT_ALLOWED, f'_site : fichier texte non autorisé : {rel}')
    check_pages(site, '_site/')
    check_no_google_fonts(site, '_site/')
    check_fonts(site, '_site/')


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--site', help='artefact GitHub Pages à contrôler (ex. _site)')
    args = parser.parse_args()

    check_pages(ROOT, '')
    check_no_google_fonts(ROOT, '')
    check_fonts(ROOT, '')
    check_contact_form()
    check_git_hygiene()
    check_workflow()
    check_source_links()
    if args.site:
        site = ROOT / args.site
        if check(not is_link(site), f'{args.site} : l’artefact est lui-même un lien symbolique'):
            check_site(site.resolve())

    if failures:
        for rule in failures:
            print(f'ÉCHEC  {rule}')
        print(f'{len(failures)} contrôle(s) en échec.')
        return 1
    print('Tous les contrôles de sécurité sont satisfaits.')
    return 0


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.exit(main())
