// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["nuxt-gtag"],
  gtag: {
    id: "G-PG6KXFFZPF",
  },
  devtools: { enabled: true },
  experimental: {
    clientNodeCompat: true,
  },
});
