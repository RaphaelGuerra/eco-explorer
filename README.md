# Eco Explorer

Last updated: 2025-11-25

## Table of Contents

<!-- TOC start -->
- [What It Does](#what-it-does)
- [How To Play](#how-to-play)
- [Highlights](#highlights)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)
- [Status & Learnings](#status-learnings)
- [License](#license)
<!-- TOC end -->

A playful, bite‑sized nature exploration game inspired by Brazil’s Itatiaia National Park.

This is a small side project for learning and practicing — prototyping animations, game loops, lightweight state management, i18n, and delightful UI touches. It’s not a production game.

## What It Does
- Tap Explore to scan the environment and discover wildlife species with varying rarity
- Encounter conditions affected by time of day and weather
- Quick mini‑games (e.g., photo timing) and short quizzes connected to each species
- Progression via XP, streaks, and research levels
- Shareable encounter cards (export simple PNG from a card)
- Multi‑language UI (English and Spanish)

## How To Play
- Press Explore to start a scan; if you spot something, follow prompts
- Complete a quick interaction (quiz or photo) to “secure” the encounter
- Earn XP, collect hints about habitats/behaviors, and keep your streak going

## Highlights
- Framer Motion animations and small celebration moments (confetti, sfx)
- Lightweight global state with Zustand
- Simple i18n with runtime language switching
- Compact, mobile‑first UI with a print‑free, share‑friendly layout

## Tech Stack
- React + Vite
- Framer Motion, Howler, canvas‑confetti, Zustand
- ESLint

## Run Locally
Prerequisites: Node.js >= 18

```bash
npm install
npm run dev
```

Open the local server shown by Vite.

## Status & Learnings
- Current: functional prototype used for UI/gameplay experiments
- Learnings: pacing simple game loops, cosmetic feedback (motion/sfx), and quick i18n

## License
All rights reserved. Personal portfolio project — not for production use.
