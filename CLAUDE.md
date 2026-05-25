# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

See `README.md` for standard commands (`yarn dev`, `yarn build`, `yarn test`, `yarn lint`, `yarn typecheck`).

Run a single test file: `npx vitest run app/utils/cbor.test.ts`

## Architecture

### Source Layout

This is a Nuxt 4 project using the `app/` source directory: Vue app code lives in `app/` (`app/pages/`, `app/components/`, `app/composables/`, `app/layouts/`, `app/utils/`). `i18n/`, `server/`, `public/`, the Sentry config files, and `nuxt.config.ts` stay at the project root.

### Data Flow

The app is a single-page dual-pane converter (`app/pages/index.vue`). User edits CBOR (left pane) or JSON (right pane), and the other pane updates via debounced conversion. The `isJsonInput` ref tracks which direction the conversion flows.

- **CBOR input**: auto-detects encoding (base64 vs hex) using `isBase64()`/`isHex()`, then calls `cborToJsonString()`
- **JSON input**: calls `jsonStringToCbor()` which parses JSON (reviving BigInt literals like `"123n"` and Buffer objects) then encodes to CBOR

### Core Module: `app/utils/cbor.ts`

All conversion logic lives here. Key design decisions:
- BigInt values can't natively serialize to JSON — supported as either plain strings (`"123"`) or literal format (`"123n"`) controlled by `bigintFormat` option
- Buffer/ArrayBuffer objects detected via `isBufferObject()` and can output as base64, hex, or raw JSON depending on `bufferFormat`
- `jsonStringToCbor()` uses a JSON reviver to reconstruct BigInt and Buffer from their string representations
- Sets serialize as `{}` by default in JSON; `convertSetToArray` option converts them to arrays instead

### UI Framework

Built on **Nuxt UI v4** (`@nuxt/ui`) + **Tailwind CSS v4** (CSS-first config in `app/assets/css/main.css`). `@nuxt/ui` bundles `@nuxt/icon`, `@nuxtjs/color-mode`, and `@nuxt/fonts`, so those are not registered as standalone modules. The root is wrapped in `<UApp>` (`app/app.vue`); theme colors map to `primary: blue` / `neutral: gray` in `app/app.config.ts`. Prefer Nuxt UI semantic tokens (`text-muted`, `text-highlighted`, `bg-default`, `bg-muted`, `text-primary`, `border-default`) over raw `gray-*`/`blue-*` `dark:` pairs. Form controls use `USelect`/`UCheckbox`/`URadioGroup`/`UTextarea`/`UButton`; the settings panel uses `UPopover`.

### Components

- `JsonHighlighter.vue` — Shiki-powered syntax highlighting for JSON output; toggles between highlighted view and an editable `UTextarea` on click (focuses the element via the textarea's exposed `textareaRef`)
- `CopyButton.vue` — `UButton` driven by VueUse `useClipboard`; positioned absolutely in parent container
- `ColorModeToggle.vue` — `UButton` that cycles system/light/dark using VueUse `useCycleList`; color mode comes from Nuxt UI's bundled `@nuxtjs/color-mode`

### Key Patterns

- VueUse composables used throughout: `useDebounceFn`, `useFileDialog`, `useClipboard`, `useCycleList` (outside-click/dismiss is handled by `UPopover`, not `onClickOutside`)
- `useAnalytics()` composable wraps `nuxt-gtag`'s `useTrackEvent` for event tracking
- `experimental.clientNodeCompat: true` in Nuxt config enables Node.js `Buffer` in browser context (required by `cbor-x`)
- Icons use Lucide (`i-lucide-*`) via `@nuxt/icon`. Because the static GitHub Pages host has no runtime icon API, `icon.clientBundle` in `nuxt.config.ts` keeps `scan: true` **and** lists Nuxt UI's internal component icons (select chevron, checkbox tick) explicitly — add any new icon there if it must survive the static build
- i18n uses lazy-loaded locale files in `i18n/locales/` with `prefix_and_default` strategy

### Deployment

Static site generated with `nitro.preset: "github-pages"`. CI runs lint, typecheck, test, and build on every push/PR (`.github/workflows/test.yml`). Deployment to GitHub Pages triggers on push to `main` (`.github/workflows/deploy.yml`).
