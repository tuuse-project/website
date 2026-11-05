<template>
    <header class="header">
        <div class="header__container">
            <NuxtLink to="/" class="logo">

                
            </NuxtLink>
             <!-- <nav class="header-langs">
                 <nuxt-link 
        v-for="loc in availableLocales" 
        :key="loc.code" 
        :to="switchLocalePath(loc.code)"
        :class="{ active: loc.code === locale }"
      >
        {{ loc.code.toUpperCase() }}
      </nuxt-link>
             </nav> -->
        </div>
      
    </header>
</template>
<script setup>
import '~/assets/css/components/layout/header.css';
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value.filter(i => i.code !== locale.value)
})
</script>