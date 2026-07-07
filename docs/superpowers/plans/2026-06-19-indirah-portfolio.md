# Indirah Portfolio â€” Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (FR/EN) single-page portfolio website for painter Indirah â€” dark teal palette, full-screen hero image viewer, sticky two-column series sections, no frameworks.

**Architecture:** Static HTML/CSS/JS, no build step. Translations stored in `js/translations.js` as a plain object; `setLanguage(lang)` walks `[data-i18n]` elements. Hero navigation managed in `js/main.js` with cross-fade transitions.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (ES6+), Google Fonts (Cormorant Garamond + EB Garamond), WebP artwork assets.

> Historical note: this early implementation plan originally referenced SVG placeholders. Those placeholders were removed during the post-restructure cleanup once `oeuvres-data.js` became the source of truth for current WebP artwork paths.

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Single-page markup, all sections, data-i18n attributes |
| `css/style.css` | All styles â€” variables, reset, header, hero, series, footer, responsive |
| `js/translations.js` | All UI strings in FR and EN |
| `js/main.js` | Hero navigation, language toggle, localStorage persistence |

---

### Task 1: Artwork assets

- [x] Use the current WebP artwork paths declared in `js/oeuvres-data.js`.
