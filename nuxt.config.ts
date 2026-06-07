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
    "bootstrap-icons/font/bootstrap-icons.css",
    "@/assets/css/variables.scss",
    "@/assets/css/admin/tables.css",
    "@/assets/css/typography.css",
    "@/assets/css/components/breadcrumb.css",
  ],

  app: {
    head: {
      link: [
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