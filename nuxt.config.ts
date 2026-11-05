import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
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
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'ro', name: 'Română', file: 'ro.json' }
    ],
    langDir: 'locales/', 
    defaultLocale: 'en',
    strategy: 'prefix_except_default'
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
})