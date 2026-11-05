<template>
    <div class="wrapper">
         <HeaderComponent></HeaderComponent>
    <main class="page-content">
        <div class="page__container">
             <slot></slot>
        </div>
    </main>
    <FooterComponent></FooterComponent>
    </div>
</template>
<script setup>
    import HeaderComponent from '~/components/layout/HeaderComponent.vue';
    import FooterComponent from '~/components/layout/FooterComponent.vue';
    import '~/assets/css/layout/site.css';
</script>
