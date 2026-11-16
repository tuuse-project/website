
<script setup lang="ts">
const { data: events } = await useAsyncData(
  'events',
  () => queryCollection('events')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .all()
)

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date)).toUpperCase()
}
</script>

<template>
    <!-- Header -->
    <section class="max-w-7xl mx-auto pb-2"> 
     <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 class="text-6xl md:text-8xl font-bold tracking-tighter uppercase">
          Events<span class="text-zinc-600">.</span>
        </h1>

        <p class="text-sm text-zinc-500 max-w-xs leading-relaxed text-end">
          Discover upcoming experiences, unforgettable nights
          and moments worth remembering.
        </p>
      </div>

     
    </section>
 <div class="h-px bg-zinc-800 mt-10"></div>
    <!-- Events -->
    <section class="max-w-7xl mx-auto mt-10">

      <div v-if="events?.length" class="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-14">

        <NuxtLink
          v-for="event in events"
          :key="event.id"
          :to="`/events/${event.slug}`"
          class="group block"
        >
          <!-- Image -->
          <div class="relative aspect-[16/10] overflow-hidden bg-zinc-900 mb-6">
            <img
              :src="event.cover"
              :alt="event.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            >

            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>

            <div class="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2">
              <span class="text-[10px] tracking-[0.2em] font-medium">
                {{ formatDate(event.date) }}
              </span>
            </div>

            <div class="absolute bottom-4 right-4 w-11 h-11 rounded-full border border-white/50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white">
              <span class="text-xl">↗</span>
            </div>
          </div>

          <!-- Content -->
          <div class="flex items-start justify-between gap-5">
            <div class="min-w-0">
              <h2 class="text-2xl md:text-3xl font-semibold uppercase tracking-tight group-hover:text-zinc-400 transition-colors">
                {{ event.title }}
              </h2>

              <p class="text-sm text-zinc-500 mt-3 leading-relaxed max-w-md line-clamp-2">
                {{ event.description }}
              </p>
            </div>

            <span class="text-xs text-zinc-600 mt-2 shrink-0">
              ↗
            </span>
          </div>

          <div class="h-px bg-zinc-800 mt-6 group-hover:bg-zinc-500 transition-colors"></div>
        </NuxtLink>

      </div>

      <!-- Empty state -->
      <div v-else class="py-32 text-center border border-zinc-800">
        <p class="text-zinc-600 text-xs tracking-[0.3em] uppercase mb-4">
          No events available
        </p>
        <h2 class="text-3xl font-semibold uppercase">
          Stay tuned<span class="text-zinc-600">.</span>
        </h2>
        <p class="text-zinc-500 text-sm mt-3">
          New experiences are coming soon.
        </p>
      </div>

    </section>



</template>
