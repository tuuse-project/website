<script setup lang="ts">
const { data: page } = await useAsyncData(
  'privacy-policy',
  () => queryCollection('pages')
    .where('stem', '=', 'pages/privacy-policy')
    .first()
)

const updatedAt = computed(() => {
  if (!page.value?.updatedAt) return ''

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(page.value.updatedAt))
})

useHead({
  title: computed(() => `${page.value?.title || 'Privacy Policy'}`),
  meta: [
    {
      name: 'description',
      content: 'Learn how TUUSE collects, processes and protects your personal information.'
    }
  ]
})
</script>

<template>
 
    <section class="max-w-7xl pb-2"> 
     <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 class="text-6xl md:text-8xl font-bold tracking-tighter uppercase">
          PRIVACY POLICY<span class="text-zinc-600">.</span>
        </h1>

        <p class="text-sm text-zinc-500 max-w-xs leading-relaxed text-end">
          Discover how we process, store and protect your data.
        </p>
      </div>

     
    </section>
     <div class="h-px bg-zinc-800 mt-10 mb-10"></div>
     <div class="legal">
       <ContentRenderer :value="page.meta.body" />
     </div>

   

</template>

<style scoped>



/* MARKDOWN */

.legal {
  color: #aaa;
  font-size: 15px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}

.legal :deep(h2) {
  color: #fff;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: -1px;
  margin: 65px 0 20px;
}
.legal :deep(h2), .legal :deep(h3) {
font-family: 'Geist', sans-serif !important;
}
.legal :deep(h3) {
  color: #fff;
  font-size: 19px;
  margin: 40px 0 15px;
}


.legal :deep(ul),
.legal :deep(ol) {
  padding-left: 25px;
  margin-bottom: 25px;
}

.legal :deep(li) {
  padding-left: 5px;
  margin-bottom: 10px;
}

.legal :deep(a) {
  color: #4882FF;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.legal :deep(h2) a, .legal :deep(h3) a {
  color: white;
  text-decoration: none;
}
.legal :deep(strong) {
  color: white;
}

/* EMPTY */

.legal-empty {
  padding: 100px 0;
  text-align: center;
  color: #777;
}

</style>