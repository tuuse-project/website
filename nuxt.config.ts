import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  site: {
    name: 'TUUSE - The Unity of Universe Space Events',
    url: process.env.NUXT_SITE_URL || 'https://tuuse.space',
  },
  sitemap: {
  enabled: true,
  sitemaps: false,
},
  app: {
    head: {
      // title: 'TUUSE',
      titleTemplate: '%s | TUUSE',
      link: [
        {
          rel: 'icon',
          href: '/images/logo.png',
        },
        {
          rel: 'apple-touch-icon',
          href: '/images/logo.png',
        },
      ],
    },
  },
  compatibilityDate: '2026-11-04',

  devtools: {
    enabled: true,
  },

  modules: [
    '@nuxt/content',
    '@nuxtjs/seo',
    '@nuxtjs/i18n'
  ],

 i18n: {
  locales: [
    { code: 'en', name: 'English', file: 'en.json' },
  ],
  langDir: 'locales/',
  defaultLocale: 'en',
  strategy: 'no_prefix',
}
  ,
  css: [
    '~/assets/css/style.css',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    preset: 'static',
  },
   runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || 'https://api.tuuse.space',

      environment:
        process.env.NUXT_PUBLIC_ENVIRONMENT || 'production',
    },
  },
})