// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'preload', as: 'script', href: 'https://www.googletagmanager.com/gtag/js?id=G-PG6KXFFZPF' },
      ],
    },
  },

  modules: [
    'nuxt-gtag',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/sitemap',
    '@sentry/nuxt/module',
    '@nuxt/scripts',
    '@nuxtjs/color-mode',
  ],

  scripts: {
    registry: {
      clarity: {
        id: 'tkugyjvqz5'
      }
    }
  },

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
    lazy: true,
    defaultLocale: 'en',
  },

  site: {
    url: 'https://cbor.williamchong.cloud',
    name: 'CBOR to JSON Online Converter',
  },

  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare-pages"
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