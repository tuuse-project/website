
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import Input from '~/components/Input.vue'

definePageMeta({
  layout: 'landing'
})

// ========================================
// CONFIG
// ========================================

const API_URL = 'http://localhost:8787'

interface EventItem {
  id: string
  slug: string
  title: string
  description: string
  cover: string
  date: string
  time?: string
  location: string
  ticketUrl?: string
  ticketType?: string
  price?: number
  currency?: string
  status: string
}

interface HomePage {
  hero?: {
    eyebrow?: string
    title?: string
    description?: string
    image?: string
    buttonText?: string
    buttonUrl?: string
  }
  gallery?: string[]
  about?: {
    eyebrow?: string
    title?: string
    description?: string
    image?: string
  }
  presale?: {
    enabled?: boolean
    event?: string
  }
}

// ========================================
// CMS DATA
// ========================================

const { data: rawPage } = await useAsyncData(
  'home',
  () => queryCollection('pages')
    .where('stem', '=', 'pages/home')
    .first()
)

const pageData = computed<HomePage>(() => {
  const page = rawPage.value as any

  return page?.meta ?? page ?? {}
})

// ========================================
// EVENTS
// ========================================

const { data: events } = await useAsyncData(
  'events',
  () => queryCollection('events')
    .where('status', '=', 'published')
    .order('date', 'DESC')
    .all()
)

const publishedEvents = computed<EventItem[]>(() => {
  return (events.value ?? []) as unknown as EventItem[]
})

// Find event selected in Decap CMS

const selectedEvent = computed(() => {
  if (!pageData.value.presale?.enabled) {
    return null
  }

  const selectedSlug = pageData.value.presale?.event

  if (!selectedSlug) {
    return null
  }

  return publishedEvents.value.find(
    event => event.slug === selectedSlug
  ) ?? null
})

// ========================================
// FORM
// ========================================

const form = reactive({
  name: '',
  email: '',
  phone: ''
})

const quantity = ref(1)

const isSubmitting = ref(false)
const submitError = ref('')
const orderCreated = ref(false)
const orderNumber = ref('')

// ========================================
// PRICE
// ========================================

const total = computed(() => {
  return Number(selectedEvent.value?.price ?? 0) * quantity.value
})

const currency = computed(() => {
  return selectedEvent.value?.currency || 'MDL'
})

// ========================================
// HELPERS
// ========================================

function formatDate(date?: string) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsed)
}

// ========================================
// QUANTITY
// ========================================

function decreaseQuantity() {
  quantity.value = Math.max(1, quantity.value - 1)
}

function increaseQuantity() {
  quantity.value = Math.min(10, quantity.value + 1)
}

// ========================================
// CHECKOUT
// ========================================

async function submitForm() {
  if (isSubmitting.value) return

  if (!selectedEvent.value) {
    submitError.value = 'Event is not available.'
    return
  }

  if (!form.name.trim()) {
    submitError.value = 'Please enter your full name.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  orderCreated.value = false

  try {
    const response = await $fetch<{
      success: boolean
      data: {
        orderId: string
        orderNumber: string
        checkoutUrl: string
        status: string
        quantity: number
        totalAmount: number
        currency: string
      }
    }>(`${API_URL}/v1/orders`, {
      method: 'POST',

      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        quantity: quantity.value,

        // Backend must validate this event
        eventSlug: selectedEvent.value.slug
      }
    })

    if (!response.success || !response.data.checkoutUrl) {
      throw new Error('Could not create order.')
    }

    orderNumber.value = response.data.orderNumber
    orderCreated.value = true

    window.location.assign(response.data.checkoutUrl)

  } catch (error: unknown) {
    const err = error as {
      data?: {
        message?: string
      }
      message?: string
    }

    submitError.value =
      err.data?.message ||
      err.message ||
      'Something went wrong. Please try again.'

  } finally {
    isSubmitting.value = false
  }
}

// ========================================
// SEO
// ========================================

useHead({
  title: 'The Unity of Universe Space Events',

  meta: [
    {
      name: 'description',
      content: 'Discover events and experiences in your city.'
    }
  ]
})

</script>

<template>

    <!-- ================================== -->
    <!-- HERO -->
    <!-- ================================== -->

   <section v-if="pageData.hero" class="hero">

  <!-- Background -->
  <div class="hero__media">
    <img
      v-if="pageData.hero.image"
      :src="pageData.hero.image"
      alt=""
      class="hero__image"
      fetchpriority="high"
    />
  </div>

  <div class="hero__overlay"></div>
  <div class="hero__grain"></div>

  <!-- Top information -->
  <div class="hero__top">

    <span class="hero__index">EST. 2026</span>
  </div>

  <!-- Main content -->
  <div class="hero__content">

    <div class="hero__eyebrow">
      <span class="hero__dot"></span>
      {{ pageData.hero.eyebrow }}
    </div>

    <h1 class="hero__title">
      {{ pageData.hero.title }}
      <span class="hero__title-dot">.</span>
    </h1>

    <div class="hero__bottom">

      <div class="hero__description">
        <p>{{ pageData.hero.description }}</p>

        <a
          v-if="pageData.hero.buttonText && pageData.hero.buttonUrl"
          :href="pageData.hero.buttonUrl"
          class="hero__button"
        >
          <span>{{ pageData.hero.buttonText }}</span>
          <ArrowUpRight :size="19" />
        </a>
      </div>

      <div class="hero__categories">
        <span>PEOPLE</span>
        <span>MUSIC</span>
        <span>ATMOSPHERE</span>
      </div>

    </div>
  </div>



  <div class="hero__coordinates">
    <span>47°01'22'' N</span>
    <span>28°50'07'' E</span>
  </div>

</section>


    <!-- ================================== -->
    <!-- GALLERY -->
    <!-- ================================== -->

    <section
      v-if="pageData.gallery?.length"
      id="gallery"
      class="gallery"
    >

      <div class="gallery__header">

        <div>
          <span class="eyebrow">TUUSE / Moments</span>

          <h2>
            THE<br />
            EXPERIENCE<span>.</span>
          </h2>
        </div>

        <p>
          A collection of moments, people
          and experiences that bring us together.
        </p>

      </div>

      <div class="gallery__grid">

        <div
          v-for="(image, index) in pageData.gallery"
          :key="index"
          class="gallery__item"
          :class="`gallery__item--${(index % 3) + 1}`"
        >

          <img
            :src="image"
            :alt="`TUUSE experience ${index + 1}`"
            loading="lazy"
          />

          <span class="gallery__number">
            {{ String(index + 1).padStart(2, '0') }}
          </span>

        </div>

      </div>

    </section>

    <!-- ================================== -->
    <!-- ABOUT -->
    <!-- ================================== -->

    <section
      v-if="pageData.about"
      id="about"
      class="about"
    >

      <div class="about__container">

        <div class="about-image">

          <img
            :src="pageData.about.image"
            :alt="pageData.about.title || 'About TUUSE'"
            loading="lazy"
          />

        </div>

        <div class="about-content">
          <h2>
            {{ pageData.about.title }}
          </h2>

       

         <MDC :value="pageData.about.description" />
         
        </div>

      </div>

    </section>


  

    <!-- ================================== -->
    <!-- JOIN -->
    <!-- ================================== -->

    <section id="join" class="join">

    

      <h2>
        LET'S MAKE<br />
        MEMORIES.
      </h2>

      <a href="/join" class="primary-button">
        BE PART OF IT
        <ArrowUpRight />
      </a>

    </section>



</template>


<style scoped>

/* ========================================
   GENERAL
======================================== */

.home {
  background: #080808;
  color: #fff;
  min-height: 100vh;
  font-family: inherit;
}

.eyebrow {
  display: block;
  font-size: 11px;
  letter-spacing: 3px;
  color: #aaa;
  margin-bottom: 28px;
  text-transform: uppercase;
}


/* ========================================
   HERO
======================================== */
/* ========================================
   IMMERSIVE HERO
======================================== */

.hero {
  position: relative;
  min-height: 760px;
  height: calc(100svh - 90px);
  max-height: 1100px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 35px 6% 45px;
  overflow: hidden;

  background: #090909;
  color: #fff;
  isolation: isolate;
}

/* BACKGROUND */

.hero__media {
  position: absolute;
  inset: 0;
  z-index: -3;
  overflow: hidden;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;

  transform: scale(1.08);
  animation: heroReveal 2s cubic-bezier(.2,.7,.2,1) forwards;
}

@keyframes heroReveal {
  to {
    transform: scale(1);
  }
}

/* OVERLAY */

.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: -2;

  background:
    linear-gradient(
      90deg,
      rgba(0,0,0,.65) 0%,
      rgba(0,0,0,.25) 55%,
      rgba(0,0,0,.15) 100%
    ),
    linear-gradient(
      0deg,
      rgba(0,0,0,.8) 0%,
      transparent 50%,
      rgba(0,0,0,.25) 100%
    );
}

/* GRAIN */

.hero__grain {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: .13;

  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}

/* TOP */

.hero__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.hero__brand {
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -2px;
}

.hero__edition,
.hero__index {
  color: rgba(255,255,255,.65);
}

/* CONTENT */

.hero__content {
  width: 100%;
  margin-top: auto;
  margin-bottom: 65px;
}

/* EYEBROW */

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;

  margin-bottom: 25px;

  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;

  color: rgba(255,255,255,.8);

  animation: heroFadeUp .9s .2s both;
}


/* TITLE */

.hero__title {
  max-width: 1400px;

  font-size: clamp(65px, 12.5vw, 190px);
  line-height: .78;

  font-weight: 900;
  letter-spacing: -.095em;
  text-transform: uppercase;

  margin: 0 0 55px;

  overflow-wrap: anywhere;
  text-wrap: balance;

  animation: heroFadeUp 1s .35s both;
}

.hero__title-dot {
  color: #6c6c6c;
}

/* BOTTOM */

.hero__bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;

  border-top: 1px solid rgba(255,255,255,.3);
  padding-top: 25px;

  animation: heroFadeUp 1s .55s both;
}

/* DESCRIPTION */

.hero__description {
  max-width: 420px;
}

.hero__description p {
  max-width: 380px;

  color: rgba(255,255,255,.75);

  font-size: 15px;
  line-height: 1.7;

  margin: 0 0 25px;
}

/* BUTTON */

.hero__button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 55px;

  padding: 17px 21px;

  background: #575757;
  color: #ffffff;

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-decoration: none;

  transition: .3s ease;
}

.hero__button:hover {
  background: white;
  color: black;
  gap: 70px;
}

/* CATEGORIES */

.hero__categories {
  display: flex;
  gap: 35px;

  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.hero__categories span {
  color: rgba(255,255,255,.7);
  transition: color .3s;
}


/* SCROLL */

.hero__scroll {
  position: absolute;
  bottom: 45px;
  left: 50%;

  display: flex;
  align-items: center;
  gap: 15px;

  transform: translateX(-50%);

  font-size: 8px;
  letter-spacing: 2px;
  white-space: nowrap;
  color: rgba(255,255,255,.6);
}

.hero__scroll-line {
  width: 45px;
  height: 1px;
  background: rgba(255,255,255,.6);
  transform-origin: left;
  animation: scrollLine 2s infinite;
}

@keyframes scrollLine {
  0%, 100% { transform: scaleX(.4); }
  50% { transform: scaleX(1); }
}

/* COORDINATES */

.hero__coordinates {
  position: absolute;
  right: 6%;
  top: 50%;

  display: flex;
  flex-direction: column;
  gap: 7px;

  font-size: 8px;
  letter-spacing: 2px;
  color: rgba(255,255,255,.6);
}

/* ANIMATION */

@keyframes heroFadeUp {
  from {
    opacity: 0;
    transform: translateY(35px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .hero {
    padding: 30px 6%;
  }

  .hero__categories {
    flex-direction: column;
    gap: 12px;
  }

  .hero__coordinates {
    display: none;
  }

  .hero__title {
    font-size: clamp(65px, 14vw, 120px);
  }
}

@media (max-width: 600px) {
  .hero {
    min-height: 700px;
    height: calc(100svh - 70px);
    padding: 25px 6%;
  }

  .hero__edition {
    display: none;
  }

  .hero__title {
    font-size: clamp(58px, 16vw, 95px);
    margin-bottom: 35px;
  }

  .hero__content {
    margin-bottom: 75px;
  }

  .hero__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 30px;
  }

  .hero__description p {
    font-size: 13px;
  }

  .hero__categories {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 8px;
  }

  .hero__scroll {
    left: 6%;
    transform: none;
    bottom: 25px;
  }

  .hero__button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__image,
  .hero__eyebrow,
  .hero__title,
  .hero__bottom,
  .hero__scroll-line {
    animation: none;
    transform: none;
  }
}

/* ========================================
   GALLERY
======================================== */

.gallery {
  padding: 140px 10%;
  background: #080808;
}

.gallery__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 40px;
  margin-bottom: 60px;
}

.gallery__header h2 {
  font-size: clamp(55px, 8vw, 110px);
  line-height: 0.85;
  letter-spacing: -0.085em;
  margin: 0;
  text-transform: uppercase;
}

.gallery__header h2 span {
  color: #777;
}

.gallery__header > p {
  color: #888;
  max-width: 300px;
  font-size: 13px;
  line-height: 1.8;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.gallery__item {
  position: relative;
  overflow: hidden;
  background: #171717;
  aspect-ratio: 16 / 10;
}

.gallery__item--2 {
  aspect-ratio: 16 / 12;
}

.gallery__item--3 {
  aspect-ratio: 16 / 9;
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
}

.gallery__item:hover img {
  transform: scale(1.04);
}

.gallery__number {
  position: absolute;
  bottom: 15px;
  left: 18px;
  font-size: 10px;
  letter-spacing: 2px;
  color: white;
}


/* ========================================
   ABOUT
======================================== */

.about {
  padding: 150px 10%;
  position: relative;
  z-index: 2;
  background: #080808;
}

.about__container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 100px;
  max-width: 1400px;
  margin: 0 auto;
}

.about-image {
  overflow: hidden;
  aspect-ratio: 4 / 5;
  background: #171717;
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
}

.about-image:hover img {
  transform: scale(1.04);
}

.about-content h2 {
  font-size: clamp(42px, 6vw, 85px);
  line-height: 0.95;
  letter-spacing: -0.06em;
  text-transform: uppercase;
  margin: 0 0 35px;
}

.about-content p {
  color: #999;
  line-height: 1.9;
  font-size: 16px;
  max-width: 450px;
}

.text-link {
  display: inline-block;
  color: white;
  text-decoration: none;
  font-size: 11px;
  letter-spacing: 2px;
  border-bottom: 1px solid #666;
  padding-bottom: 12px;
  margin-top: 30px;
}


/* ========================================
   TICKETS
======================================== */

.tickets {
  background: #080808;
  color: white;
  padding: 140px 10%;
  position: relative;
  z-index: 2;
}

.tickets__container {
  display: grid;
  grid-template-columns: 1fr 0.8fr;
  align-items: start;
  gap: 100px;
  max-width: 1250px;
  margin: 0 auto;
}

.tickets__header h2 {
  font-size: clamp(65px, 9vw, 120px);
  line-height: 0.85;
  letter-spacing: -0.085em;
  margin: 0 0 35px;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.event-information p {
  color: #999;
  line-height: 1.8;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ticket-card {
  border: 1px solid #292929;
  padding: 35px;
}

.ticket-card__top {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 15px;
}

.ticket-label,
.form-group label {
  display: block;
  font-size: 10px;
  letter-spacing: 2px;
  color: #888;
  font-weight: 700;
}

.ticket-card h3 {
  font-size: 23px;
  margin: 12px 0 5px;
  letter-spacing: -1px;
}

.ticket-price {
  font-size: 38px;
  font-weight: 800;
  white-space: nowrap;
  text-align: end;
}

.ticket-price span {
  font-size: 20px;
}

.ticket-divider {
  height: 1px;
  background: #303030;
  margin: 30px 0;
}


/* ========================================
   FORM
======================================== */

.form-group {
  margin: 22px 0;
}

.form-group label {
  margin-bottom: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 25px;
  border-bottom: 1px solid #333;
  padding: 10px 0;
  width: fit-content;
}

.quantity-control button {
  width: 38px;
  height: 38px;
  background: #000;
  border: 1px solid #444;
  color: white;
  cursor: pointer;
  font-size: 20px;
  border-radius: 0;
}

.quantity-control button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity-control span {
  font-size: 16px;
  font-weight: 700;
  min-width: 15px;
  text-align: center;
}

.ticket-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 11px;
  letter-spacing: 2px;
}

.ticket-total strong {
  font-size: 30px;
  letter-spacing: -1px;
}

.purchase-button {
  width: 100%;
  padding: 19px;
  border: none;
  background: white;
  color: black;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: 0.2s;
}

.purchase-button:hover {
  background: #ccc;
}

.purchase-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.payment-note {
  color: #666;
  text-align: center;
  font-size: 10px;
  margin: 20px 0 0;
}

.form-error {
  color: #ff7777;
  font-size: 12px;
  margin-bottom: 15px;
}


/* ========================================
   PRESALE EMPTY
======================================== */

.presale-empty {
  background: #080808;
  padding: 120px 10%;
  text-align: center;
  border-top: 1px solid #222;
}

.presale-empty h2 {
  font-size: clamp(45px, 8vw, 100px);
  line-height: 0.9;
  letter-spacing: -0.08em;
}


/* ========================================
   JOIN
======================================== */

.join {
  min-height: 520px;
  background: #fff;
  color: #080808;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
}

.join .eyebrow {
  color: #333;
}

.join h2 {
  font-size: clamp(60px, 10vw, 130px);
  line-height: 0.85;
  letter-spacing: -0.08em;
  margin: 0 0 45px;
}

.join .primary-button {

  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 55px;

  padding: 17px 21px;

  background: #000000;
  color: #ffffff;

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-decoration: none;

  transition: .3s ease;


}

.join .primary-button:hover {
  background: #333;
}


/* ========================================
   FOOTER
======================================== */

.footer {
  padding: 45px 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  color: #777;
  font-size: 10px;
  letter-spacing: 1px;
  background: #080808;
}

.footer__logo {
  font-size: 25px;
  font-weight: 900;
  letter-spacing: -2px;
  color: white;
}


/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 900px) {

  .tickets {
    padding: 90px 7%;
  }

  .tickets__container {
    grid-template-columns: 1fr;
    gap: 50px;
  }

  .tickets__header h2 {
    font-size: clamp(65px, 15vw, 100px);
  }

  .about__container {
    gap: 45px;
  }

}

@media (max-width: 768px) {

  .hero {
    height: calc(85svh - 70px);
    min-height: 580px;
    padding: 0 7%;
  }

  

  .hero-content__float {
    gap: 1.5rem;
  }

  .hero-content__float > p {
    font-size: 14px;
  }

  .hero-bottom {
    flex-direction: column;
    gap: 10px;
    font-size: 8px;
  }

  .hero-bottom span:first-child {
    text-align: start;
  }

  .hero-bottom span:last-child {
    text-align: end;
  }

  .gallery {
    padding: 90px 7%;
  }

  .gallery__header {
    flex-direction: column;
    align-items: start;
    gap: 20px;
  }

  .gallery__grid {
    grid-template-columns: 1fr;
  }

  .gallery__item,
  .gallery__item--2,
  .gallery__item--3 {
    aspect-ratio: 4 / 3;
  }

  .about {
    padding: 90px 7%;
  }

  .about__container {
    grid-template-columns: 1fr;
    gap: 45px;
  }

  .about-image {
    aspect-ratio: 5 / 4;
  }

  .about-content h2 {
    font-size: 60px;
  }

  .join {
    min-height: 400px;
  }

  .footer {
    flex-wrap: wrap;
  }

}

@media (max-width: 480px) {

  .ticket-card {
    padding: 24px 18px;
  }

  .ticket-card h3 {
    font-size: 19px;
  }

  .ticket-price {
    font-size: 32px;
  }

  .tickets__header h2 {
    font-size: 60px;
  }

}

</style>
