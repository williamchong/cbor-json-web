// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'CBOR to JSON Online Converter',
      meta: [
        { name: 'og:title', content: 'CBOR to JSON Online Converter' },
        { name: 'description', content: 'Easily convert data between CBOR (Concise Binary Object Representation) and JSON (JavaScript Object Notation) formats with this online web decoder.' }
      ],
      script: [
        { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5384552213891537', async: true, crossorigin: 'anonymous' },
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
