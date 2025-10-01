// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr:false,
  devServer: {
    port: 3000
  },
  plugins: [
    '~/plugins/axios.ts',
    { src: '~/plugins/bootstrap.client.ts', mode: 'client' },
  ],

    css: [
       'bootstrap/dist/css/bootstrap.min.css', '@/assets/css/variables.scss'],
   app: {
    head: {
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js', tagPosition: 'bodyClose' },
        { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js', tagPosition: 'bodyClose' },
        { innerHTML: `window.gtranslateSettings = {"default_language":"id","languages":["id","ar","en"],"wrapper_selector":".gtranslate_wrapper","flag_size":24,"switcher_horizontal_position":"inline","flag_style":"3d"}`, tagPosition: 'bodyClose'},
        { src: 'https://cdn.gtranslate.net/widgets/latest/dwf.js', defer: true, tagPosition: 'bodyClose' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap' }
      ],
      
    }
  },
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/fonts', 
    '@nuxt/icon', 
  ],
    runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE,
    },
  },
})