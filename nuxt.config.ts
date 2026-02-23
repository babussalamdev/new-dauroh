export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,

  devServer: {
    port: 3000,
  },
  plugins: ["~/plugins/axios.ts", "~/plugins/bootstrap.client.ts"],

  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "bootstrap-icons/font/bootstrap-icons.css", // <--- TAMBAHIN BARIS INI (PENTING!)
    "@/assets/css/variables.scss",
  ],

  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap",
        },
      ],
    },
  },
  modules: ["@nuxt/icon", "@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt", "@nuxt/image"],
  pinia: {
    storesDirs: ["./app/stores/**"],
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiFlip: process.env.NUXT_PUBLIC_API_FLIP,
      websocketUrl: process.env.NUXT_PUBLIC_WEBSOCKET_URL,
      img: process.env.EVENT_PIC,
    },
  },
});