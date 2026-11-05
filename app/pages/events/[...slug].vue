<script setup lang="ts">

const route = useRoute()

const { data: event } = await useAsyncData(
  `event-${route.params.slug}`,
  () => queryCollection('events')
    .where('slug', '=', route.params.slug as string)
    .where('status', '=', 'published')
    .first()
)

if (!event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Event not found',
  })
}
</script>

<template>

    <NuxtLink to="/events">
      Events / 
    </NuxtLink>
     <img :src="event.cover" :alt="event.title">

    <h1>{{ event.title }}</h1>
    <p>{{ event.description }}</p>

    <p>{{ event.date }} · {{ event.time }}</p>
    <p>{{ event.location.name }}</p>

    <div v-for="artist in event.lineup" :key="artist.name">
      {{ artist.name }}
    </div>

    <a v-if="event.ticketUrl" :href="event.ticketUrl">
      Buy tickets
    </a>


</template>