# Indirah Portfolio - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> Historical note: this early implementation plan reflects the first vanilla HTML/CSS/JS version. The current project structure has since evolved: artwork data now lives in `js/oeuvres-data.js`, the old single `css/style.css` bundle has been split into page/component CSS files, and the up-to-date project map is maintained in `README.md`.

**Goal:** Build a bilingual (FR/EN) single-page portfolio website for painter Indirah - dark teal palette, full-screen hero image viewer, sticky two-column series sections, no frameworks.

**Architecture:** Static HTML/CSS/JS, no build step. Translations stored in `js/translations.js` as a plain object; `setLanguage(lang)` walks `[data-i18n]` elements. Hero navigation was historically managed in `js/main.js`; current navigation and language behavior are documented in `README.md`.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (ES6+), Google Fonts (Cormorant Garamond + EB Garamond), WebP artwork assets.

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Historical single-page markup; current site now has four HTML pages |
| `css/style.css` | Historical single stylesheet; now replaced by `css/base.css`, `css/layout.css`, `css/home.css`, `css/works.css`, `css/gallery.css`, `css/contact.css`, and `css/mory.css` |
| `js/translations.js` | All UI strings in FR and EN |
| `js/main.js` | Historical hero/navigation logic; current role is Oeuvres grids, mobile feed, and lightbox |

---

### Task 1: Artwork assets

- [x] Use the current WebP artwork paths declared in `js/oeuvres-data.js`.
