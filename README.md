# Eco Explorer

Last updated: 2026-01-27

## Table of Contents

<!-- TOC start -->
- [What It Does](#what-it-does)
- [How To Play](#how-to-play)
- [Highlights](#highlights)
- [Goals](#goals)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)
- [Status & Learnings](#status--learnings)
- [License](#license)
<!-- TOC end -->

[![Lint](https://github.com/RaphaelGuerra/eco-explorer/actions/workflows/lint.yml/badge.svg)](https://github.com/RaphaelGuerra/eco-explorer/actions/workflows/lint.yml)
[![Security](https://github.com/RaphaelGuerra/eco-explorer/actions/workflows/security.yml/badge.svg)](https://github.com/RaphaelGuerra/eco-explorer/actions/workflows/security.yml)


A playful, bite-sized nature exploration game inspired by Brazil's Atlantic Forest reserves.

This is a small side project for learning and practicing — prototyping animations, game loops, lightweight state management, i18n, and delightful UI touches. It’s not a production game.

Live demo: none (run locally)

## What It Does
- Choose a location (Itatiaia National Park, Serra do Mar Reserve, Tijuca National Park) and scan the environment for wildlife
- Encounter conditions affected by time of day and weather
- Quick mini-games (photo timing) and short quizzes connected to each species
- Progression via XP, streaks, and research levels
- Daily objectives and mission-based conservation tasks for tokens
- Shareable encounter cards (PNG export from a card)
- Multi-language UI (English, Portuguese, French, Spanish)

## How To Play
- Press Explore to start a scan; if you spot something, follow prompts
- Complete a quick interaction (quiz or photo) to “secure” the encounter
- Earn XP, collect hints about habitats/behaviors, and keep your streak going

## Highlights
- Framer Motion animations and small celebration moments (confetti, sfx)
- Lightweight global state with Zustand
- Simple i18n with runtime language switching
- Compact, mobile-first UI with a clean, share-friendly layout
- Location picker with distinct day/night environment imagery
- Objective-driven conservation tasks with rewards

## Goals
- Expand the sense of place with multiple Atlantic Forest locations and visuals
- Keep the core loop quick, readable, and mobile-friendly
- Make content easy to extend (locations, species, mini-games)
See `GOALS.md` for the longer-term roadmap.

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
