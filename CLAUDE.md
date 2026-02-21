# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

See `README.md` for standard commands (`yarn dev`, `yarn build`, `yarn test`, `yarn lint`, `yarn typecheck`).

Run a single test file: `npx vitest run utils/cbor.test.ts`

## Architecture

### Data Flow

The app is a single-page dual-pane converter (`pages/index.vue`). User edits CBOR (left pane) or JSON (right pane), and the other pane updates via debounced conversion. The `isJsonInput` ref tracks which direction the conversion flows.

- **CBOR input**: auto-detects encoding (base64 vs hex) using `isBase64()`/`isHex()`, then calls `cborToJsonString()`
- **JSON input**: calls `jsonStringToCbor()` which parses JSON (reviving BigInt literals like `"123n"` and Buffer objects) then encodes to CBOR

### Core Module: `utils/cbor.ts`

All conversion logic lives here. Key design decisions:
- BigInt values can't natively serialize to JSON — supported as either plain strings (`"123"`) or literal format (`"123n"`) controlled by `bigintFormat` option
- Buffer/ArrayBuffer objects detected via `isBufferObject()` and can output as base64, hex, or raw JSON depending on `bufferFormat`
- `jsonStringToCbor()` uses a JSON reviver to reconstruct BigInt and Buffer from their string representations
- Sets serialize as `{}` by default in JSON; `convertSetToArray` option converts them to arrays instead

### Components

- `JsonHighlighter.vue` — Shiki-powered syntax highlighting for JSON output; toggles between highlighted view and editable textarea on click
- `CopyButton.vue` — Uses VueUse `useClipboard`; positioned absolutely in parent container
- `ColorModeToggle.vue` — Cycles system/light/dark using VueUse `useCycleList` and Nuxt `@nuxtjs/color-mode`

### Key Patterns

- VueUse composables used throughout: `useDebounceFn`, `onClickOutside`, `useFileDialog`, `useClipboard`, `useCycleList`
- `useAnalytics()` composable wraps `nuxt-gtag`'s `useTrackEvent` for event tracking
- `experimental.clientNodeCompat: true` in Nuxt config enables Node.js `Buffer` in browser context (required by `cbor-x`)
- i18n uses lazy-loaded locale files in `i18n/locales/` with `prefix_and_default` strategy

### Deployment

Static site generated with `nitro.preset: "github-pages"`. CI runs lint, typecheck, test, and build on every push/PR (`.github/workflows/test.yml`). Deployment to GitHub Pages triggers on push to `main` (`.github/workflows/deploy.yml`).
