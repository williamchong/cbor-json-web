// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'CBOR to JSON Online Converter',
      meta: [
        { name: 'og:title', content: 'CBOR to JSON Online Converter' },
        { name: 'description', content: 'Easily convert data between CBOR (Concise Binary Object Representation) and JSON (JavaScript Object Notation) formats with this online web decoder.' }
      ],
      link: [
        { rel: 'preload', as: 'script', href: 'https://www.googletagmanager.com/gtag/js?id=G-PG6KXFFZPF' },
      ],
    },
  },
  modules: ["nuxt-gtag"],
  gtag: {
    id: "G-PG6KXFFZPF",
  },
  devtools: { enabled: true },
  experimental: {
    clientNodeCompat: true,
  },
});
