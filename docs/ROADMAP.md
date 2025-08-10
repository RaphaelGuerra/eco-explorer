## Objectives
- Increase session length and D1/D7 retention with minimal dev effort
- Keep “eco” identity: learning, logging, conservation
- Make feedback loop satisfying without scope creep

## Market references (takeaways)
- Pokemon GO: daily streaks, time/weather gating, map hotspots
- Pokemon Snap: quick, reactive photo mini-games over text quizzes
- Alba: A Wildlife Adventure: wholesome quests, conservation impact meter
- Wingspan (digital): collection joy and educational facts per card
- Marvel Snap: daily/weekly missions that always feel completable
- Genshin/HSR: “pity” mechanics for rare outcomes reduce frustration

## Low-hanging fruit (1–2 days total)
- [ ] Micro-feedback polish
  - Subtle SFX: scan start, focus found, success, mastery
  - Confetti/particle burst on success/mastery; pulse glow on Radiant
- [x] “Pity” counters
  - Rare encounter pity and Radiant pity increase chance after misses; reset on hit
- [x] Daily streak and login nudge
  - +5% encounter at 3+ days; small UI badge
- [x] Hint chips + Objective ribbon
  - Contextual hint above Scan; rotating objective with progress bar
- [x] Eco‑Dex card improvements
  - Rarity icon, best time/weather, one “fun fact,” progress to next perk
- [x] Shareable log card
  - Download a small PNG of a species card for social

## Phase plan
- Phase 0: Baseline metrics (half‑day)
  - Client-only counters: sessions/day, time to first encounter, scans/session, success rate, pity triggers, language usage
  - Simple console logging; wire later to lightweight endpoint
- Phase 1: Core loop upgrades (3–5 days)
  - Implement pity (rare/radiant)
  - Add HintChip + ObjectiveRibbon; daily/weekly objectives (JSON config)
  - Replace 30–50% of quizzes with a PhotoMiniGame (timed click ring)
  - Eco‑Dex facts and “best conditions” fields; render in cards
- Phase 2: Progression depth (5–7 days)
  - Gear upgrades (binoculars/mic/lens) crafted with research tokens
  - Perk synergies (2-perk combos unlock a small rule bonus)
  - Rotating biome hotspots (3 tiles; time/weather weighting)
  - Seasonal event flag for 1 limited species
- Phase 3: Retention and polish (3–5 days)
  - Daily streak UI; small reward crate
  - Ambient audio + subtle overlays (rain splashes, star twinkle)
  - Badge sets for collection milestones

## Minimal schema changes
- species: add bestTime, bestWeather, funFact, rarityIcon?
- playerState: add researchTokens, gearUpgrades, streakDays, pityRare, pityRadiant
- objectives.json: id, type, target, reward, expiresAt
- i18n: add keys for objectives, hints, gear, badges, SFX labels (toggles)

## Acceptance criteria (Phase 1)
- Pity increases rare/radiant odds predictably; unit tests for thresholds
- Hint chip shows one actionable tip; Objective ribbon tracks progress
- PhotoMiniGame works desktop/mobile; translated prompts
- Eco‑Dex shows fact + best conditions; all strings localized

## Metrics to watch
- Time to first encounter (<30s)
- Scans per session (+15%)
- Rare/radiant conversion rate (stable, less variance with pity)
- Objective completion rate (40–60%)
- D1 retention (+5–10% after streaks go live)

## Build order
1. [x] Pity counters + tests (pity implemented; tests pending)
2. [ ] HintChip + ObjectiveRibbon (daily: “Log 2 sky species”)
3. [x] Eco‑Dex facts (i18n)
4. [ ] PhotoMiniGame and swap-in map
5. [ ] SFX and particles (toggle)
6. [ ] Daily streak counter UI
