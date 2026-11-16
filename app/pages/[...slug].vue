<template>
  <div class="error-wrapper">

     <h1>404</h1>
  <p>Page was not found</p>
  </div>
 
</template>
<script setup>
useHead({
  title: '404',
  
})
</script>
<style scoped>

.error-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  text-align: center;

}

.error-wrapper h1 {
  font-weight: bold;
  font-size: 3rem
}
</style>
