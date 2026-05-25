// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    'nuxt-gtag',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@nuxtjs/sitemap',
    '@sentry/nuxt/module',
  ],

  // Nuxt UI bundles @nuxt/icon, @nuxtjs/color-mode and @nuxt/fonts, so those
  // are no longer registered as standalone modules above.
  css: ['~/assets/css/main.css'],

  gtag: {
    id: 'G-PG6KXFFZPF',
  },

  i18n: {
    baseUrl: 'https://cbor.williamchong.cloud',
    strategy: 'prefix_and_default',
    detectBrowserLanguage: {
      useCookie: false,
      redirectOn: 'root'
    },
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.json'
      },
      {
        code: 'zh',
        language: 'zh-TW',
        file: 'zh.json'
      },
      {
        code: 'ja',
        language: 'ja-JP',
        file: 'ja.json'
      }
    ],
    defaultLocale: 'en',
  },

  site: {
    url: 'https://cbor.williamchong.cloud',
    name: 'CBOR to JSON Online Converter',
  },

  devtools: { enabled: true },

  icon: {
    // Static GitHub Pages host has no server, so the runtime
    // `/api/_nuxt_icon/` endpoint 404s. Bundle scanned icons into the
    // client instead so they resolve offline without API fallback.
    clientBundle: {
      scan: true,
      // `scan` only covers our own source, so Nuxt UI's internal component
      // icons (USelect chevron, UCheckbox tick) and the icons we pass via
      // component props are listed explicitly to guarantee they bundle.
      icons: [
        'lucide:chevron-down',
        'lucide:check',
        'lucide:copy',
        'lucide:circle-check',
        'lucide:sun',
        'lucide:moon',
        'lucide:monitor',
        'lucide:settings',
        'lucide:file-up',
      ],
    },
  },

  nitro: {
    preset: "github-pages"
  },

  vite: {
    define: {
      __SENTRY_DEBUG__: false,
      __SENTRY_TRACING__: false,
    },
  },

  experimental: {
    clientNodeCompat: true,
  },

  compatibilityDate: '2025-02-13',

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  sentry: {
    sourceMapsUploadOptions: {
      org: 'williamchong',
      project: 'cbor-convertor',
    },
  },

  sourcemap: {
    client: 'hidden',
  },
});