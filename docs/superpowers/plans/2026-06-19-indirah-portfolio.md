# Indirah Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (FR/EN) single-page portfolio website for painter Indirah — dark teal palette, full-screen hero image viewer, sticky two-column series sections, no frameworks.

**Architecture:** Static HTML/CSS/JS, no build step. Translations stored in `js/translations.js` as a plain object; `setLanguage(lang)` walks `[data-i18n]` elements. Hero navigation managed in `js/main.js` with cross-fade transitions.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (ES6+), Google Fonts (Cormorant Garamond + EB Garamond), SVG placeholders for demo images.

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Single-page markup, all sections, data-i18n attributes |
| `css/style.css` | All styles — variables, reset, header, hero, series, footer, responsive |
| `js/translations.js` | All UI strings in FR and EN |
| `js/main.js` | Hero navigation, language toggle, localStorage persistence |
| `images/serie-1/oeuvre-{1,2,3}.svg` | Landscape-feel placeholder art |
| `images/serie-2/oeuvre-{1,2,3}.svg` | Portrait-feel placeholder art |

---

### Task 1: SVG placeholder images (6 files)

- [ ] Create `images/serie-1/oeuvre-1.svg` — dawn gradient (sky → land)
- [ ] Create `images/serie-1/oeuvre-2.svg` — autumn (ochre → forest green)
- [ ] Create `images/serie-1/oeuvre-3.svg` — winter (pale blue → deep teal)
- [ ] Create `images/serie-2/oeuvre-1.svg` — figure study (warm sienna, radial light)
- [ ] Create `images/serie-2/oeuvre-2.svg` — shadow study (dark umber, highlight spot)
- [ ] Create `images/serie-2/oeuvre-3.svg` — skin tones (cream to deep brown, split shadow)

### Task 2: js/translations.js

- [ ] Define `const translations = { fr: {...}, en: {...} }` covering all nav, hero, series, footer, and per-work title/technique keys

### Task 3: index.html

- [ ] Header with logo, centred nav (data-i18n), lang-toggle button
- [ ] Hero section: frame-wrapper + frame div, prev/next arrow buttons, meta bar (counter + caption)
- [ ] Two serie sections with data-i18n attributes and image grids
- [ ] Footer with logo, links, copyright
- [ ] Script tags for translations.js then main.js

### Task 4: css/style.css

- [ ] CSS custom properties, reset, base typography
- [ ] Fixed header with gradient fade
- [ ] Hero: full-height, frame sizing, cross-fade images, arrow circles, meta bar
- [ ] Series: divider, sticky info column, 3-column grid, hover scale+saturate
- [ ] Footer styles
- [ ] Responsive breakpoint at 860px

### Task 5: js/main.js

- [ ] `heroWorks` array referencing all 6 SVGs with title/technique keys
- [ ] `buildHeroImages()` — inject img tags, set total counter
- [ ] `goToHero(index)` — cross-fade, update counter, update caption
- [ ] `setLanguage(lang)` — walk data-i18n, update lang-option active class, update hero caption, persist to localStorage
- [ ] DOMContentLoaded init: build images, wire prev/next clicks, wire lang-toggle click, call setLanguage with stored or default lang
