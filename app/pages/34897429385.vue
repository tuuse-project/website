<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Input from '~/components/Input.vue'

definePageMeta({ layout: 'landing' })

// ========================================
// CONFIG + TYPES
// ========================================

const API_URL = useRuntimeConfig().public.apiUrl || 'http://localhost:8787'

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
  hero?: { eyebrow?: string; title?: string; description?: string; image?: string; buttonText?: string; buttonUrl?: string }
  gallery?: string[]
  about?: { eyebrow?: string; title?: string; description?: string; image?: string }
  presale?: { enabled?: boolean; event?: string }
}

// ========================================
// CMS DATA
// ========================================

const { data: rawPage } = await useAsyncData('home', () =>
  queryCollection('pages').where('stem', '=', 'pages/home').first()
)

const pageData = computed<HomePage>(() => {
  const page = rawPage.value as any
  return page?.meta ?? page ?? {}
})

const { data: events } = await useAsyncData('events', () =>
  queryCollection('events').where('status', '=', 'published').order('date', 'DESC').all()
)

const publishedEvents = computed<EventItem[]>(() => (events.value ?? []) as unknown as EventItem[])

const selectedEvent = computed(() => {
  if (!pageData.value.presale?.enabled) return null
  const slug = pageData.value.presale?.event
  if (!slug) return null
  return publishedEvents.value.find(e => e.slug === slug) ?? null
})

const gallery = computed(() => pageData.value.gallery ?? [])
const heroWords = computed(() => (pageData.value.hero?.title ?? '').split(/\s+/).filter(Boolean))

const menuItems = computed(() => {
  const items: { href: string; label: string }[] = []
  if (gallery.value.length) items.push({ href: '#gallery', label: 'Archive' })
  if (selectedEvent.value) items.push({ href: '#tickets', label: 'Tickets' })
  if (pageData.value.about) items.push({ href: '#about', label: 'About' })
  items.push({ href: '#join', label: 'Join' })
  return items
})

// ========================================
// CHECKOUT
// ========================================

const form = reactive({ name: '', email: '', phone: '' })
const quantity = ref(1)
const isSubmitting = ref(false)
const submitError = ref('')
const orderCreated = ref(false)
const orderNumber = ref('')

const total = computed(() => Number(selectedEvent.value?.price ?? 0) * quantity.value)
const currency = computed(() => selectedEvent.value?.currency || 'MDL')

function formatDate(date?: string) {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed)
}

const decreaseQuantity = () => { quantity.value = Math.max(1, quantity.value - 1) }
const increaseQuantity = () => { quantity.value = Math.min(10, quantity.value + 1) }

async function submitForm() {
  if (isSubmitting.value) return

  if (!selectedEvent.value) {
    submitError.value = 'This event is not available.'
    return
  }
  if (!form.name.trim()) {
    submitError.value = 'Enter your full name.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  orderCreated.value = false

  try {
    const response = await $fetch<{
      success: boolean
      data: { orderId: string; orderNumber: string; checkoutUrl: string; status: string; quantity: number; totalAmount: number; currency: string }
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

    if (!response.success || !response.data.checkoutUrl) throw new Error('Could not create the order.')

    orderNumber.value = response.data.orderNumber
    orderCreated.value = true
    window.location.assign(response.data.checkoutUrl)
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string }
    submitError.value = err.data?.message || err.message || 'Something went wrong. Try again.'
  } finally {
    isSubmitting.value = false
  }
}

// ========================================
// INTRO: counter + iris. Plays once per session.
// ========================================

const root = ref<HTMLElement | null>(null)
const introDone = ref(false)
const progress = ref(0)
let introRaf = 0
let reduceMotion = false

function finishIntro() {
  cancelAnimationFrame(introRaf)
  progress.value = 100
  introDone.value = true
  document.documentElement.style.overflow = ''
  try { sessionStorage.setItem('tuuse-intro', '1') } catch { /* storage can be blocked */ }
}

function runIntro() {
  document.documentElement.style.overflow = 'hidden'
  const start = performance.now()
  const duration = 2600
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    progress.value = Math.round((1 - Math.pow(1 - t, 3)) * 100)
    if (t < 1) introRaf = requestAnimationFrame(tick)
    else finishIntro()
  }
  introRaf = requestAnimationFrame(tick)
}

// ========================================
// SPACE: star field + scroll-driven planet
// ========================================

const starsEl = ref<HTMLCanvasElement | null>(null)
let starRaf = 0
let scrollRaf = 0
const cleanups: Array<() => void> = []

function initStars() {
  const canvas = starsEl.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random(), y: Math.random(), z: Math.random() * 0.9 + 0.1, t: Math.random() * 6.28
  }))
  let w = 0
  let h = 0

  const resize = () => {
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (reduceMotion) draw(0)
  }

  const draw = (time: number) => {
    ctx.clearRect(0, 0, w, h)
    for (const s of stars) {
      const y = (((s.y * h - window.scrollY * s.z * 0.25) % h) + h) % h
      const twinkle = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(time / 900 + s.t)
      ctx.fillStyle = `rgba(236,235,247,${0.2 + 0.55 * s.z * twinkle})`
      ctx.fillRect(s.x * w, y, s.z * 1.8, s.z * 1.8)
    }
    if (!reduceMotion) starRaf = requestAnimationFrame(draw)
  }

  resize()
  window.addEventListener('resize', resize)
  cleanups.push(() => window.removeEventListener('resize', resize))
  if (!reduceMotion) starRaf = requestAnimationFrame(draw)
}

function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
    root.value?.style.setProperty('--p', p.toFixed(4))
  })
}

// ========================================
// MENU
// ========================================

const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)

watch(menuOpen, async (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
  await nextTick()
  if (open) (document.querySelector('#menu a') as HTMLElement | null)?.focus()
  else menuButton.value?.focus()
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && menuOpen.value) menuOpen.value = false
}

// ========================================
// GALLERY RAIL
// ========================================

const rail = ref<HTMLElement | null>(null)
const railIndex = ref(1)

function onRail() {
  const el = rail.value
  if (!el) return
  const items = Array.from(el.children) as HTMLElement[]
  let best = 0
  let bestDist = Infinity
  items.forEach((item, i) => {
    const d = Math.abs(item.offsetLeft - el.offsetLeft - el.scrollLeft)
    if (d < bestDist) { bestDist = d; best = i }
  })
  railIndex.value = best + 1
}

function nudge(direction: 1 | -1) {
  const el = rail.value
  el?.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: reduceMotion ? 'auto' : 'smooth' })
}

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let seen = false
  try { seen = sessionStorage.getItem('tuuse-intro') === '1' } catch { /* ignore */ }

  if (reduceMotion || seen) finishIntro()
  else runIntro()

  initStars()
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(introRaf)
  cancelAnimationFrame(starRaf)
  cancelAnimationFrame(scrollRaf)
  cleanups.forEach(fn => fn())
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})

useHead({
  title: 'The Unity of Universe Space Events',
  meta: [{ name: 'description', content: 'Discover events and experiences in your city.' }],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&display=swap'
    }
  ]
})
</script>

<template>
  <div ref="root" class="page" :class="{ 'is-ready': introDone }">
    <canvas ref="starsEl" class="stars" aria-hidden="true" />
    <div class="planet" aria-hidden="true" />

    <!-- Intro -->
    <div class="intro" :class="{ 'intro--done': introDone }" :aria-hidden="introDone">
      <svg class="intro__ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" pathLength="100" :style="{ strokeDashoffset: 100 - progress }" />
      </svg>
      <p class="intro__count" role="status">{{ progress }}<span>%</span></p>
      <p class="intro__name">The Unity of Universe Space Events</p>
      <button type="button" class="intro__skip" :tabindex="introDone ? -1 : 0" @click="finishIntro">Skip</button>
    </div>

    <!-- Bar + menu -->
    <header class="bar">
      <a href="#top" class="bar__logo">TUUSE</a>
      <button
        ref="menuButton"
        type="button"
        class="bar__menu"
        :aria-expanded="menuOpen"
        aria-controls="menu"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? 'Close' : 'Menu' }}
      </button>
    </header>

    <nav id="menu" class="menu" :class="{ 'menu--open': menuOpen }" :inert="menuOpen ? undefined : ''" aria-label="Sections">
      <a v-for="(item, i) in menuItems" :key="item.href" :href="item.href" @click="menuOpen = false">
        <small>{{ String(i + 1).padStart(2, '0') }}</small>{{ item.label }}
      </a>
    </nav>

    <!-- Hero -->
    <section v-if="pageData.hero" id="top" class="hero">
      <div class="hero__bg" :style="{ backgroundImage: `url('${pageData.hero.image}')` }" />

      <p v-if="pageData.hero.eyebrow" class="hero__note">{{ pageData.hero.eyebrow }}</p>

      <h1 class="hero__title" :aria-label="pageData.hero.title">
        <span v-for="(word, i) in heroWords" :key="i" class="word" aria-hidden="true">
          <span :style="{ transitionDelay: `${300 + i * 110}ms` }">{{ word }}</span>
        </span>
      </h1>

      <p class="hero__text">{{ pageData.hero.description }}</p>

      <a
        v-if="pageData.hero.buttonText && pageData.hero.buttonUrl"
        :href="pageData.hero.buttonUrl"
        class="pill"
        :aria-label="pageData.hero.buttonText"
      >
        <span class="pill__track" aria-hidden="true">
          <span v-for="n in 14" :key="n">{{ pageData.hero.buttonText }}<i /></span>
        </span>
      </a>
    </section>

    <!-- Archive -->
    <section v-if="gallery.length" id="gallery" class="archive">
      <div class="archive__head">
        <h2>Where we've been</h2>
        <p>Photos from past TUUSE nights.</p>
        <div class="archive__ctrl">
          <span aria-live="polite">{{ String(railIndex).padStart(2, '0') }} / {{ String(gallery.length).padStart(2, '0') }}</span>
          <button type="button" aria-label="Previous photos" @click="nudge(-1)">←</button>
          <button type="button" aria-label="Next photos" @click="nudge(1)">→</button>
        </div>
      </div>

      <div ref="rail" class="rail" tabindex="0" aria-label="Photo archive" @scroll.passive="onRail">
        <figure v-for="(image, i) in gallery" :key="i" class="rail__item" :class="`rail__item--${(i % 3) + 1}`">
          <img :src="image" :alt="`TUUSE night, photo ${i + 1}`" loading="lazy" draggable="false">
        </figure>
      </div>
    </section>

    <!-- Tickets -->
    <section v-if="selectedEvent" id="tickets" class="tickets">
      <div class="tickets__info">
        <p class="tickets__label">Next event</p>
        <h2>{{ selectedEvent.title }}</h2>
        <dl>
          <div><dt>Where</dt><dd>{{ selectedEvent.location }}</dd></div>
          <div><dt>When</dt><dd>{{ formatDate(selectedEvent.date) }}<template v-if="selectedEvent.time">, {{ selectedEvent.time }}</template></dd></div>
        </dl>
      </div>

      <div class="pass">
        <div class="pass__top">
          <div>
            <p class="tickets__label">Ticket</p>
            <h3>{{ selectedEvent.ticketType || 'General access' }}</h3>
          </div>
          <p class="pass__price">{{ selectedEvent.price }} <span>{{ currency }}</span></p>
        </div>

        <form class="pass__form" @submit.prevent="submitForm">
          <Input v-model="form.name" label="Full name" type="text" placeholder="Your full name" required />
          <Input v-model="form.email" label="Email" type="email" placeholder="Your email address" required />
          <Input v-model="form.phone" label="Phone" type="tel" placeholder="+373" required />

          <div class="qty">
            <span id="qty-label">Tickets</span>
            <div class="qty__control" role="group" aria-labelledby="qty-label">
              <button type="button" aria-label="Fewer tickets" :disabled="quantity <= 1" @click="decreaseQuantity">−</button>
              <output>{{ quantity }}</output>
              <button type="button" aria-label="More tickets" :disabled="quantity >= 10" @click="increaseQuantity">+</button>
            </div>
          </div>

          <div class="pass__total">
            <span>Total</span>
            <strong>{{ total }} {{ currency }}</strong>
          </div>

          <p v-if="submitError" class="pass__error" role="alert">{{ submitError }}</p>

          <button class="pass__submit" type="submit" :disabled="isSubmitting || !selectedEvent.price">
            {{ isSubmitting ? 'Creating your order…' : 'Continue to payment' }}
          </button>
          <p class="pass__note">Payment is handled by Stripe. You'll leave this page to pay.</p>
        </form>
      </div>
    </section>

    <section v-else-if="pageData.presale?.enabled" class="empty">
      <h2>No tickets on sale right now.</h2>
      <p>The next event will be announced here.</p>
    </section>

    <!-- About -->
    <section v-if="pageData.about" id="about" class="about">
      <img class="about__img" :src="pageData.about.image" :alt="pageData.about.title || 'About TUUSE'" loading="lazy">
      <div class="about__body">
        <h2>{{ pageData.about.title }}</h2>
        <p>{{ pageData.about.description }}</p>
        <a v-if="gallery.length" href="#gallery" class="link">See the archive</a>
      </div>
    </section>

    <!-- Join -->
    <section id="join" class="join">
      <h2>Next time, you're in the photo.</h2>
      <a v-if="selectedEvent" href="#tickets" class="pill pill--light" aria-label="Get tickets">
        <span class="pill__track" aria-hidden="true"><span v-for="n in 14" :key="n">Get tickets<i /></span></span>
      </a>
      <a v-else href="#gallery" class="pill pill--light" aria-label="See the archive">
        <span class="pill__track" aria-hidden="true"><span v-for="n in 14" :key="n">See the archive<i /></span></span>
      </a>
    </section>
  </div>
</template>

<style scoped>
.page {
  --void: #05060b;
  --star: #ecebf7;
  --dust: #8b8aa5;
  --line: rgba(236, 235, 247, 0.16);
  --violet: #296282;
  --cyan: #5e689640;
  --pink: #e9e9e9;
  --amber: #badeff;
  --band: linear-gradient(90deg, var(--violet), var(--cyan), var(--pink), var(--amber));
  --p: 0;
  --gutter: clamp(20px, 5vw, 72px);

  position: relative;
  isolation: isolate;
  background: var(--void);
  color: var(--star);
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  font-variation-settings: 'wdth' 90;
  overflow-x: clip;
}

.page :where(a, button, input):focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 3px;
}

h1, h2, h3, p, dl, dd, figure { margin: 0; }

/* ---------- space ---------- */
.stars { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -2; }

.planet {
  position: fixed;
  z-index: -1;
  top: 10vh;
  right: -14vmin;
  width: 74vmin;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 28% 26%, rgba(255, 255, 255, 0.35), transparent 32%),
    conic-gradient(from 210deg, var(--violet), var(--cyan), var(--pink), var(--amber), var(--violet));
  box-shadow: inset -9vmin -6vmin 14vmin rgba(0, 0, 0, 0.92), 0 0 14vmin rgba(106, 76, 255, 0.28);
  opacity: 0;
  transform: translate3d(calc(var(--p) * -62vw), calc(var(--p) * 78vh), 0) scale(calc(1 - var(--p) * 0.6));
  transition: opacity 1.6s 0.5s;
  filter: blur(10px);
}
.is-ready .planet { opacity: 0.9; }

/* ---------- intro ---------- */
.intro {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: var(--void);
  clip-path: circle(150% at 50% 50%);
  transition: clip-path 1.1s cubic-bezier(0.7, 0, 0.2, 1), visibility 0s 1.1s;
}
.intro--done { clip-path: circle(0% at 50% 50%); visibility: hidden; }

.intro__ring { position: absolute; width: min(70vmin, 520px); transform: rotate(-90deg); }
.intro__ring circle { fill: none; stroke: var(--star); stroke-width: 0.35; stroke-dasharray: 100; }

.intro__count {
  font-size: clamp(64px, 14vw, 180px);
  font-weight: 300;
  font-variation-settings: 'wdth' 75;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}
.intro__count span { font-size: 0.3em; color: var(--dust); margin-left: 0.2em; }

.intro__name { position: absolute; left: var(--gutter); bottom: 32px; color: var(--dust); font-size: 14px; }

.intro__skip {
  position: absolute;
  right: var(--gutter);
  bottom: 24px;
  padding: 12px 4px;
  background: none;
  border: 0;
  border-bottom: 1px solid var(--line);
  color: var(--star);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

/* ---------- bar + menu ---------- */
.bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 60;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px var(--gutter);
  mix-blend-mode: difference;
}
.bar__logo { color: #fff; text-decoration: none; font-weight: 700; font-size: 20px; letter-spacing: -0.03em; }
.bar__menu {
  min-width: 44px; min-height: 44px;
  background: none; border: 0; color: #fff; font: inherit; font-size: 15px; cursor: pointer;
}

.menu {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 var(--gutter);
  background: rgba(5, 6, 11, 0.94);
  backdrop-filter: blur(18px);
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.6s cubic-bezier(0.7, 0, 0.2, 1);
}
.menu--open { clip-path: inset(0); }
.menu a {
  display: flex;
  align-items: baseline;
  gap: 24px;
  padding: 6px 0;
  color: var(--dust);
  text-decoration: none;
  font-size: clamp(48px, 10vw, 140px);
  font-weight: 500;
  font-variation-settings: 'wdth' 78;
  letter-spacing: -0.045em;
  line-height: 1;
  transition: color 0.25s, padding-left 0.35s;
}
.menu a small { font-size: 14px; letter-spacing: 0; color: var(--dust); min-width: 2ch; }
.menu a:hover, .menu a:focus-visible { color: var(--star); padding-left: 16px; }

/* ---------- hero ---------- */
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  align-content: end;
  gap: 28px;
  padding: 120px var(--gutter) 40px;
}
.hero__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  opacity: 0.4;
  -webkit-mask-image: linear-gradient(to bottom, #000 30%, transparent 96%);
  mask-image: linear-gradient(to bottom, #000 30%, transparent 96%);
}
.hero__note { color: var(--dust); font-size: 15px; }

.hero__title {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.22em;
  max-width: 14ch;
  font-size: clamp(54px, 12.5vw, 200px);
  font-weight: 600;
  font-variation-settings: 'wdth' 76;
  line-height: 0.88;
  letter-spacing: -0.045em;
}
.word { display: inline-block; overflow: hidden; padding-bottom: 0.1em; }
.word > span {
  display: inline-block;
  transform: translateY(110%);
  transition: transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.is-ready .word > span { transform: none; }

.hero__text { max-width: 38ch; color: #c9c8dc; font-size: 17px; line-height: 1.55; }

/* marquee pill: the one loud control */
.pill {
  display: block;
  overflow: hidden;
  border: 1px solid var(--star);
  border-radius: 999px;
  color: var(--star);
  text-decoration: none;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}
.pill__track {
  display: flex;
  width: max-content;
  animation: slide 28s linear infinite;
}
.pill__track > span {
  display: inline-flex;
  align-items: center;
  gap: 28px;
  padding: 20px 14px 20px 0;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}
.pill__track i {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--band);
  background-size: 300% 100%;
}
.pill:hover, .pill:focus-visible { background: var(--star); color: var(--void); }
.pill:hover .pill__track, .pill:focus-visible .pill__track { animation-duration: 10s; }
.pill--light { max-width: 760px; width: 100%; }

@keyframes slide { to { transform: translateX(-50%); } }

/* ---------- archive ---------- */
.archive { padding: 140px 0 120px; }
.archive__head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 16px 40px;
  padding: 0 var(--gutter) 48px;
}
.archive__head h2 {
  grid-column: 1 / -1;
  font-size: clamp(44px, 8vw, 128px);
  font-weight: 600;
  font-variation-settings: 'wdth' 78;
  line-height: 0.92;
  letter-spacing: -0.045em;
}
.archive__head p { color: var(--dust); max-width: 32ch; }
.archive__ctrl { display: flex; align-items: center; gap: 10px; font-variant-numeric: tabular-nums; color: var(--dust); font-size: 14px; }
.archive__ctrl span { margin-right: 14px; }
.archive__ctrl button {
  width: 48px; height: 48px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: none;
  color: var(--star);
  font: inherit;
  cursor: pointer;
  transition: background 0.25s, color 0.25s;
}
.archive__ctrl button:hover { background: var(--star); color: var(--void); }

.rail {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 0 var(--gutter);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-left: var(--gutter);
  scrollbar-width: none;
}
.rail::-webkit-scrollbar { display: none; }
.rail__item { flex: none; scroll-snap-align: start; overflow: hidden; border-radius: 4px; background: #14151f; }
.rail__item img { display: block; width: 100%; height: 100%; object-fit: cover; }
.rail__item--1 { width: min(62vw, 720px); aspect-ratio: 4 / 5; }
.rail__item--2 { width: min(44vw, 520px); aspect-ratio: 1; margin-top: 12vh; }
.rail__item--3 { width: min(52vw, 620px); aspect-ratio: 16 / 11; margin-top: 4vh; }

/* ---------- tickets ---------- */
.tickets {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(40px, 7vw, 110px);
  align-items: start;
  padding: 120px var(--gutter);
}
.tickets__label { color: var(--dust); font-size: 14px; }
.tickets__info { position: sticky; top: 110px; }
.tickets__info h2 {
  margin: 14px 0 40px;
  font-size: clamp(48px, 8.5vw, 140px);
  font-weight: 600;
  font-variation-settings: 'wdth' 76;
  line-height: 0.9;
  letter-spacing: -0.045em;
  overflow-wrap: anywhere;
}
.tickets__info dl { display: grid; gap: 14px; }
.tickets__info dl div { display: grid; grid-template-columns: 7ch 1fr; gap: 16px; border-top: 1px solid var(--line); padding-top: 14px; }
.tickets__info dt { color: var(--dust); }
.tickets__info dd { font-size: 18px; }

.pass {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: rgba(10, 11, 20, 0.7);
  backdrop-filter: blur(12px);
}
.pass::before { content: ''; position: absolute; inset: 0 28px auto; height: 2px; background: var(--band); }
.pass__top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; padding: 36px 32px 28px; }
.pass__top h3 { margin-top: 8px; font-size: 26px; font-weight: 600; letter-spacing: -0.03em; }
.pass__price { font-size: 44px; font-weight: 600; letter-spacing: -0.04em; white-space: nowrap; }
.pass__price span { font-size: 18px; color: var(--dust); }

.pass__form { position: relative; display: grid; gap: 22px; padding: 36px 32px 32px; border-top: 2px dashed var(--line); }
.pass__form::before, .pass__form::after {
  content: '';
  position: absolute;
  top: -14px;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--void);
  border: 1px solid var(--line);
}
.pass__form::before { left: -14px; clip-path: inset(0 0 0 50%); }
.pass__form::after { right: -14px; clip-path: inset(0 50% 0 0); }

.qty { display: flex; justify-content: space-between; align-items: center; color: var(--dust); }
.qty__control { display: flex; align-items: center; gap: 18px; color: var(--star); }
.qty__control button {
  width: 44px; height: 44px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: none;
  color: var(--star);
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.qty__control button:hover:not(:disabled) { background: var(--star); color: var(--void); }
.qty__control button:disabled { opacity: 0.3; cursor: not-allowed; }
.qty__control output { min-width: 2ch; text-align: center; font-size: 20px; font-variant-numeric: tabular-nums; }

.pass__total { display: flex; justify-content: space-between; align-items: baseline; padding-top: 18px; border-top: 1px solid var(--line); color: var(--dust); }
.pass__total strong { color: var(--star); font-size: 34px; font-weight: 600; letter-spacing: -0.04em; }

.pass__error { color: #ff8a8a; font-size: 14px; }

.pass__submit {
  width: 100%;
  min-height: 60px;
  border: 0;
  border-radius: 999px;
  background: var(--star);
  color: var(--void);
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, background 0.25s;
}
.pass__submit:hover:not(:disabled) { background: #fff; }
.pass__submit:active:not(:disabled) { transform: scale(0.98); }
.pass__submit:disabled { opacity: 0.45; cursor: not-allowed; }
.pass__note { color: var(--dust); font-size: 13px; text-align: center; }

.empty { padding: 140px var(--gutter); }
.empty h2 { font-size: clamp(36px, 6vw, 88px); font-weight: 600; letter-spacing: -0.04em; line-height: 0.95; }
.empty p { margin-top: 18px; color: var(--dust); }

/* ---------- about ---------- */
.about {
  display: grid;
  grid-template-columns: 0.8fr 1fr;
  gap: clamp(40px, 8vw, 120px);
  align-items: center;
  padding: 120px var(--gutter);
}
.about__img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 4px; background: #14151f; }
.about__body h2 {
  font-size: clamp(40px, 6vw, 96px);
  font-weight: 600;
  font-variation-settings: 'wdth' 80;
  line-height: 0.95;
  letter-spacing: -0.04em;
}
.about__body p { margin-top: 32px; max-width: 46ch; color: #b4b3c9; font-size: 18px; line-height: 1.65; }
.link { display: inline-block; margin-top: 36px; padding: 10px 0; color: var(--star); text-decoration: none; border-bottom: 1px solid var(--star); }
.link:hover { border-color: var(--pink); }

/* ---------- join ---------- */
.join {
  display: grid;
  justify-items: start;
  gap: 56px;
  padding: 160px var(--gutter) 100px;
  border-top: 1px solid var(--line);
}
.join h2 {
  max-width: 12ch;
  font-size: clamp(52px, 11vw, 180px);
  font-weight: 600;
  font-variation-settings: 'wdth' 76;
  line-height: 0.88;
  letter-spacing: -0.05em;
}

/* ---------- responsive ---------- */
@media (max-width: 900px) {
  .tickets, .about { grid-template-columns: 1fr; }
  .tickets__info { position: static; }
  .planet { width: 90vmin; top: 6vh; right: -30vmin; }
  .rail__item--1 { width: 78vw; }
  .rail__item--2 { width: 64vw; margin-top: 6vh; }
  .rail__item--3 { width: 72vw; }
  .archive__head { grid-template-columns: 1fr; }
  .archive__ctrl { justify-content: space-between; }
}

@media (max-width: 480px) {
  .pass__top, .pass__form { padding-left: 20px; padding-right: 20px; }
  .pass__price { font-size: 36px; }
}

@media (prefers-reduced-motion: reduce) {
  .pill__track { animation: none; }
  .word > span, .planet, .menu, .intro { transition: none; }
}
</style>