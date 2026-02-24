# Eco Explorer Stewardship Plan

Last updated: 2026-02-24

## 1) System Intent (Reconstructed)

Eco Explorer is a client-only educational game prototype focused on a fast exploration loop:

1. Scan an Atlantic Forest scene.
2. Resolve a short interaction (quiz/photo).
3. Reward progress (XP, streaks, perks, tasks, achievements).
4. Reinforce replay through environmental variation, hints, and cosmetic feedback.

The product goal is learning through lightweight play, not production-grade game infrastructure.

## 2) Architecture Snapshot

- Runtime: React 19 + Vite 7, static hosting (GitHub Pages).
- State: component-local React state in `src/App.jsx` + localStorage persistence.
- Domain logic:
  - Encounter weighting/pity/behavior: `src/utils/encounters.js`.
  - Conservation task progression: `src/utils/conservation.js`.
  - Smart hint logic: `src/utils/smartHints.js`.
  - Translation manager: `src/utils/i18n.js` + `src/hooks/useTranslation.js`.
- UX layers: animated scanner, ambient/sfx, hints, tasks, achievements.
- Tests: unit tests for encounter logic plus new tests for conservation and smart hints.

## 3) Strengths

- Clear gameplay loop and strong thematic coherence.
- Deterministic random helpers already covered by tests.
- Good baseline CI (lint, dependency audit, gitleaks, pages deploy).
- Rich sensory feedback and multi-language support.

## 4) Risks and Debt

- `src/App.jsx` is a god component (state, domain rules, rendering, effects), making change risk high.
- Prototype residue (unused components/files) and repeated doc-only commits reduced repository signal quality.
- Some effects previously recreated timers/listeners too often, increasing subtle runtime risk.
- i18n initialization previously mixed with render-cycle language state, which could cause redundant initialization.

## 5) Modernization Strategy

### Phase A: Stabilize core (done in this pass)

- Extracted conservation/smart-hint domain logic into dedicated utility modules.
- Added focused unit tests for those modules.
- Fixed lifecycle issues in polling/timer effects.
- Removed dead prototype components that were not part of runtime.
- Hardened i18n initialization flow and URL language bootstrapping.

### Phase B: Decompose runtime architecture (next)

- Split `App.jsx` into feature modules:
  - `features/exploration`
  - `features/progression`
  - `features/audio`
  - `features/overlays`
- Move game state orchestration into a reducer or Zustand slices with typed events.
- Isolate species/content data from behavior logic and add schema validation.

### Phase C: Productize and automate (later)

- Add Playwright smoke tests for core loop (scan -> encounter -> result).
- Add content validation checks in CI (missing i18n keys, malformed species entries).
- Add lightweight telemetry for balancing (encounter rates, drop-offs, mission completion).

## 6) Human Decisions Required

1. Product direction: keep this as a prototype sandbox or evolve into a maintainable small game product.
2. Content source of truth: continue inline JSON/JS or migrate to structured content pipeline (e.g., versioned JSON schema).
3. Persistence scope: local-only progress vs optional cloud sync/account model.
4. Distribution target: GitHub Pages demo only vs broader deployment and observability.

## 7) Immediate Backlog (High Leverage)

1. Break `App.jsx` into feature-level containers/hooks without gameplay changes.
2. Add regression tests around mission completion, streak progression, and achievement unlocks.
3. Consolidate and lint locale content for mixed-language entries and key naming inconsistencies.
4. Replace ad-hoc card export with robust DOM-to-image capture strategy for predictable output.
