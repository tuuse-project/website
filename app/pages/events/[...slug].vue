
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

const activeImage = ref<string | null>(null)

const gallery = computed(() => event.value?.gallery ?? [])

useSeoMeta({
  title: () => event.value?.title,
  description: () => event.value?.description,
  ogImage: () => event.value?.cover,
  ogType: 'article',
})
</script>

<template>
  <div v-if="event" class="event-page">

    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <NuxtLink to="/">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/events">Events</NuxtLink>
      <span>/</span>
      <span class="breadcrumb-current">{{ event.title }}</span>
    </nav>

    <!-- Hero -->
    <section class="event-hero" :data-img="event.cover">
      <div class="hero-image">
      

        <div class="hero-overlay"></div>

        <div class="hero-content">
          <span class="hero-label">TUUSE PRESENTS</span>

          <h1>{{ event.title }}</h1>

          <p class="hero-description">
            {{ event.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Event information -->
    <section class="event-info">

      <div class="info-item">
        <span class="info-label">DATE</span>
        <span class="info-value">{{ event.date }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">TIME</span>
        <span class="info-value">{{ event.time || 'TBA' }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">LOCATION</span>
        <span class="info-value">{{ event.location }}</span>
      </div>

    </section>

    <!-- Lineup -->
    <section
      v-if="event.lineup?.length"
      class="event-section"
    >
      <div class="section-heading">
        <span class="section-index">01 / LINEUP</span>
        <h2>Artists</h2>
      </div>

      <div class="lineup-grid">
        <div
          v-for="artist in event.lineup"
          :key="artist.name"
          class="artist-card"
        >
          <span>{{ artist.name }}</span>
          <span class="artist-arrow">↗</span>
        </div>
      </div>
    </section>

    <!-- Description -->
    <section class="event-section description-section">
      <div class="section-heading">
        <span class="section-index">02 / ABOUT</span>
        <h2>About the event</h2>
      </div>

      <ContentRenderer
        v-if="false"
        :value="event"
      />

      <p class="about-text">
        {{ event.description }}
      </p>
    </section>

    <!-- Gallery -->
    <section
      v-if="gallery.length"
      class="event-section gallery-section"
    >
      <div class="section-heading">
        <span class="section-index">03 / MOMENTS</span>
        <h2>Gallery</h2>
      </div>

      <div class="gallery-grid">
        <button
          v-for="(image, index) in gallery"
          :key="image"
          class="gallery-item"
          :class="`gallery-item-${index % 3}`"
          @click="activeImage = image"
        >
          <img
            :src="image"
            :alt="`${event.title} — photo ${index + 1}`"
            loading="lazy"
          >
          <span class="gallery-number">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <section class="event-footer">
      <span>THE UNITY OF UNIVERSE SPACE EVENTS</span>
      <h2>See you on the dancefloor.</h2>
      <NuxtLink to="/events">
        Explore more events ↗
      </NuxtLink>
    </section>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="activeImage"
          class="lightbox"
          @click.self="activeImage = null"
          @keydown.esc="activeImage = null"
        >
          <button
            class="lightbox-close"
            aria-label="Close gallery"
            @click="activeImage = null"
          >
            ×
          </button>

          <img :src="activeImage" alt="Event gallery">
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style>

.page-content {
 padding-left: 0 !important;
  padding-right: 0 !important;
}
.page__container {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.event-page {
  --bg: #090909;
  --surface: #111111;
  --text: #f5f5f5;
  --muted: #888888;
  /* --accent: #c5ff4a; */

  color: var(--text);
  min-height: 100vh;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Breadcrumb */

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.breadcrumb a {
  color: inherit;
  text-decoration: none;
  transition: color .2s;
}

.breadcrumb a:hover {
  color: var(--accent);
}

.breadcrumb-current {
  color: var(--text);
}

/* Hero */

.event-hero {
  width: 100%;
}

.hero-image {
  position: relative;
  height: min(70vh, 700px);
  min-height: 420px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--surface);
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    0deg,
    rgba(0,0,0,.9) 0%,
    rgba(0,0,0,.3) 50%,
    rgba(0,0,0,.05) 100%
  );
}

.hero-content {
  position: absolute;
  bottom: 55px;
  left: 55px;
  right: 55px;
  max-width: 850px;
}

.hero-label,
.section-index {
  color: var(--accent);
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 600;
}

.hero-content h1 {
  font-size: clamp(42px, 8vw, 100px);
  line-height: .95;
  letter-spacing: -4px;
  text-transform: uppercase;
  margin: 20px 0;
  font-weight: 800;
}

.hero-description {
  color: rgba(255,255,255,.8);
  max-width: 600px;
  font-size: 15px;
  line-height: 1.7;
}

/* Information */

.event-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #292929;
  border-bottom: 1px solid #292929;
  margin-top: 35px;
  padding: 30px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-label {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 2px;
}

.info-value {
  font-size: 17px;
  font-weight: 600;
}

/* Sections */

.event-section {
  margin-top: 110px;
}

.section-heading {
  margin-bottom: 35px;
}

.section-heading h2 {
  font-size: clamp(35px, 5vw, 60px);
  text-transform: uppercase;
  letter-spacing: -2px;
  margin: 12px 0 0;
}

/* Lineup */

.lineup-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 35px;
}

.artist-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 0;
  border-bottom: 1px solid #292929;
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 600;
  transition: color .2s;
}

.artist-card:hover {
  color: var(--accent);
}

.artist-arrow {
  font-size: 20px;
  color: var(--muted);
}

/* Description */

.about-text {
  max-width: 850px;
  font-size: 19px;
  line-height: 1.9;
  color: #b0b0b0;
  white-space: pre-line;
}

/* Gallery */

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 280px;
  gap: 12px;
}

.gallery-item {
  position: relative;
  display: block;
  padding: 0;
  border: none;
  overflow: hidden;
  cursor: pointer;
  background: var(--surface);
}

.gallery-item-0 {
  grid-row: span 2;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .5s, opacity .3s;
}

.gallery-item:hover img {
  transform: scale(1.05);
  opacity: .8;
}

.gallery-number {
  position: absolute;
  bottom: 15px;
  left: 15px;
  color: white;
  font-size: 11px;
  letter-spacing: 2px;
}

/* Footer */

.event-footer {
  margin-top: 130px;
  padding: 65px 0;
  border-top: 1px solid #292929;
  text-align: center;
}

.event-footer > span {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 3px;
}

.event-footer h2 {
  font-size: clamp(30px, 5vw, 65px);
  text-transform: uppercase;
  letter-spacing: -2px;
  margin: 25px 0;
}

.event-footer a {
  color: var(--accent);
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 1px;
}

/* Lightbox */

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.lightbox img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: 25px;
  right: 35px;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity .2s;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* Responsive */

@media (max-width: 768px) {
  .event-page {
    padding: 20px 5%;
  }

  .hero-image {
    min-height: 480px;
    height: 65vh;
  }

  .hero-content {
    left: 25px;
    right: 25px;
    bottom: 30px;
  }

  .hero-content h1 {
    letter-spacing: -2px;
  }

  .event-info {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .event-section {
    margin-top: 75px;
  }

  .lineup-grid {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 180px;
    gap: 8px;
  }

  .gallery-item-0 {
    grid-row: span 2;
  }

  .event-footer {
    margin-top: 80px;
  }
}
</style>
