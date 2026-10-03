# מסע המבוכים

A maze game for kids. It ships as **one HTML file** (`dist/game.html`) and as an offline app (`dist/app/`).

## Layout
- `src/index.html` – page markup; each `@include part` line is replaced by that file when building
- `src/css/` – styles (fonts are embedded so the game works with no internet)
- `src/gen/` – level makers: pure functions, no DOM (`GEN.*`)
- `src/game/` – the game: drawing, worlds, saved progress, map, engine, one file per region, render loop, controls, builder, shop
- `tools/build.js` – assemble + minify → `dist/game.html`, `dist/page.html` (test page with hooks); `--app` also builds `dist/app/`
- `tools/pk_bank.js` – regenerates the parking-lot puzzle bank (`tools/pk_bank.json`)
- `tests/` – browser bots (Playwright); `tests/golden/` = level fingerprints and screen fingerprints (fake clock, seeded; `--save` to re-record)

## Commands
    npm run build        # dist/game.html + dist/app
    npm test             # quick suites in parallel (logs in dist/logs)
    npm run test:full    # all bots (slow)
    npm run golden       # re-record level fingerprints after an intended generator change
