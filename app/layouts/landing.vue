<template>
    <div class="wrapper">
         <HeaderComponent></HeaderComponent>
    <main class="page-content page-content--landing">

             <slot id="hero"></slot>

    </main>
    <FooterComponent></FooterComponent>
    </div>
</template>
<script setup>
    import HeaderComponent from '~/components/layout/HeaderComponent.vue';
    import FooterComponent from '~/components/layout/FooterComponent.vue';
    import '~/assets/css/layout/site.css';
</script>
