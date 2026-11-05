<script setup lang="ts">
const { data: events } = await useAsyncData(
  'events',
  () => queryCollection('events')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .all()
)


</script>

<template>

         <h1>Events</h1>

    <div v-for="event in events" :key="event.id">
      <NuxtLink :to="`/events/${event.slug}`">
        <img :src="event.cover" :alt="event.title">

        <h2>{{ event.title }}</h2>
        <p>{{ event.description }}</p>
        <p>{{ event.date }}</p>
      </NuxtLink>
    </div>   

</template>