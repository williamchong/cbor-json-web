// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'preload', as: 'script', href: 'https://www.googletagmanager.com/gtag/js?id=G-PG6KXFFZPF' },
      ],
    },
  },
  modules: ["nuxt-gtag", '@nuxtjs/tailwindcss'],
  gtag: {
    id: "G-PG6KXFFZPF",
  },
  devtools: { enabled: true },
  experimental: {
    clientNodeCompat: true,
  },
});
