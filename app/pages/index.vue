<template>
  <!-- Hero -->
  <section
    class="hero"
    :style="{
      backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.65), rgba(0,0,0,.12)), url('${pageData.hero.image}')`,
    }"
  >
    <div class="hero__container">
      <div class="hero-content">
        <div class="hero-content__float">
           <h1 class="hero-title">
          {{  pageData.hero.title }}
        </h1>
       

        <p>{{ pageData.hero.description }}</p>
        </div>

        <!-- <a :href="pageData.hero.buttonUrl" class="primary-button">
          {{ pageData.hero.buttonText }}
          <span>↗</span>
        </a> -->
        <div class="hero-bottom">
          <span>PEOPLE</span>
          <span>MUSIC</span>
          <span>ATMOSPHERE</span>
        </div>
      </div>
    </div>
  </section>

  <section id="tickets" class="tickets">
    <div class="tickets__container">
      <div class="tickets__header">
        <span class="eyebrow">Join our next event</span>
        <h2>TUUSE<br />vol. 5</h2>
        <p>
         SOHO CLUB
         <br>
         21/11/2026
        </p>
      </div>

      <div class="ticket-card">
        <div class="ticket-card__top">
          <div>
            <span class="ticket-label">TICKET TYPE</span>
            <h3>GENERAL ACCESS</h3>
          
          </div>

          <div class="ticket-price">
           300 <span>MDL</span>
          </div>
        </div>

        <div class="ticket-divider"></div>

        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">FULL NAME</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="Your full name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">EMAIL ADDRESS</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Your email address"
              required
            />
          </div>

          <div class="form-group">
            <label for="phone">PHONE NUMBER</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="+373"
              required
            />
          </div>

          <div class="form-group">
            <label for="quantity">QUANTITY</label>
            <div class="quantity-control">
              <button
                type="button"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                −
              </button>

              <span>{{ quantity }}</span>

              <button
                type="button"
                @click="quantity = Math.min(10, quantity + 1)"
              >
                +
              </button>
            </div>
          </div>

          <div class="ticket-divider"></div>

          <div class="ticket-total">
            <span>TOTAL</span>
            <strong>{{ total }} MDL</strong>
          </div>

          <button class="purchase-button" type="submit">
            CONTINUE TO PAYMENT
            <span>↗</span>
          </button>

          <p class="payment-note">
            Secure payment powered by Stripe.
          </p>
        </form>
      </div>
    </div>
  </section>
  <!-- About -->
  <!-- <section id="about" class="about">
    <div class="about__container">
      <div class="about-image">
        <img :src="pageData.about.image" :alt="pageData.about.title" />
      </div>

      <div class="about-content">
        <h2>{{ pageData.about.title }}</h2>

        <p>{{ pageData.about.description }}</p>

        <a href="#join" class="text-link"> DISCOVER TUUSE ↗ </a>
      </div>
    </div>
  </section> -->

  <!-- Join -->
  <!-- <section id="join" class="join">
    <div class="join__container">
      <span class="eyebrow">BECOME PART OF IT</span>

      <h2>LET'S MAKE<br />MEMORIES.</h2>

      <a :href="pageData.hero.buttonUrl" class="primary-button">
        {{ pageData.hero.buttonText }}
        <span>↗</span>
      </a>
    </div>
  </section> -->
</template>

<script setup lang="ts">
definePageMeta({
  layout: "landing",

});
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const { data: rawPage } = await useAsyncData("home", () =>
  queryCollection("pages").where("stem", "=", "pages/home").first(),
);

const pageData = computed(() => {
  // Поддержка локализованной и обычной структуры JSON
  return rawPage.value?.meta?.[locale.value] ?? rawPage.value;
});

useHead({
  title: 'The Unity of Universe Space Events',
  meta: [
    { name: 'description', content: 'Discover events and experiences in your city' }
  ]
})

import { computed, reactive, ref } from 'vue'

const PRICE = 300

const quantity = ref(1)

const form = reactive({
  name: '',
  email: '',
  phone: '',
})

const total = computed(() => PRICE * quantity.value)

function submitForm() {
  // Stripe Checkout integration will be added here.
  console.log({
    ...form,
    ticketType: 'GENERAL_ACCESS',
    quantity: quantity.value,
    total: total.value,
  })
}
</script>

<style scoped>
.home {
  background: #080808;
  color: #fff;
  min-height: 100vh;
  font-family: inherit;
}

/* Navigation */

.navbar {
  height: 90px;
  padding: 0 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #080808;
}

.logo {
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -2px;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 38px;
}

.nav-links a,
.languages a {
  color: #aaa;
  text-decoration: none;
  font-size: 11px;
  letter-spacing: 1px;
  transition: color 0.2s;
}

.nav-links a:hover,
.languages a:hover,
.languages a.active {
  color: white;
}

.languages {
  display: flex;
  gap: 15px;
}

/* Hero */

.hero {
  min-height: 690px;
  height: calc(100svh - 90px);
  max-height: 900px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 10%;
  background-size: cover;
  background-position: center;
  background-color: #181818;
}

.hero-content {
   display: flex;
    flex-direction: column;
    width: 100% !important;
    justify-content: center;
    align-items: center;
  text-align: center;
}

.eyebrow {
  display: block;
  font-size: 11px;
  letter-spacing: 3px;
  color: #aaa;
  margin-bottom: 28px;
  text-transform: uppercase;
}

.hero h1 {
  font-size: clamp(40px, 6vw, 100px);
  line-height: 0.85;
  letter-spacing: -0.085em;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0;
  max-width: 900px;
}

.hero-content > p {
  text-align: center;
  width: 100%;
  font-size: 17px;
  line-height: 1.7;
  color: #ddd;
  margin: 35px 0;
}
.hero-content button {
    display: flex;
    margin: 0 auto;
}
.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 35px;
  padding: 19px 25px;
  background: white;
  color: black;
  text-decoration: none;
  font-size: 11px;
  width: fit-content;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition:
    background 0.2s,
    color 0.2s;
}

.primary-button:hover {
  background: #000000;
  color: white;
}

.primary-button span {
  font-size: 17px;
}

.hero-bottom {
  position: absolute;
  bottom: 35px;
  
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 2px;
  font-weight: 700;
  width: 100%;
  overflow:visible;
   z-index:21 !important;
  
}
.hero-bottom::before {
  position: absolute;
  content: ' ';
  bottom: 0px;
  z-index: -1;
  background: linear-gradient(transparent 0%, rgba(0, 0, 0, 0.445) 40%, black 80% );
  left: 0;
  right: 0;
  width: 200dvw;
  transform: translateX(-20%)  translateY(3rem);

  height: 20rem;
}
.hero-content__float {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: fixed;
  top: 40%;
   z-index: 19
}

/* About */

.about {
  padding: 150px 10%;
  z-index: 20
}

.about__container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 100px;
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

/* Join */

.join {
  min-height: 520px;
  background: #ffffff;
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
  background: #080808;
  color: white;
}

.join .primary-button:hover {
  background: #333;
}

/* Footer */

.footer {
  padding: 45px 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #777;
  font-size: 10px;
  letter-spacing: 1px;
}

.footer a:not(.logo) {
  color: #aaa;
  text-decoration: none;
}

/* Responsive */

@media (max-width: 768px) {
  .navbar {
    height: 70px;
    padding: 0 6%;
  }

  .nav-links {
    display: none;
  }

  .hero {
    height: calc(85svh - 70px);
    min-height: 580px;
    width: 100%;
    background-position: center;
  }

  .hero h1 {
    font-size: clamp(32px, 2vw, 100px);
  }

  .hero-content > p {
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

  .scroll-indicator {
    display: none;
  }

  .about {
    padding: 90px 7%;
   
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
    gap: 25px;
  }
}

.hero__container {
  width: 100% !important;
  height: 100%;
  position: relative;
  justify-content: center;
  text-align: center;
}



.about__container > div {
  width: 100%;
}


.hero-title {
  display: flex;
  flex-direction: column;
}
.hero-title span:first-child {
  text-align: start !important;
}
.hero-title span:last-child {
  text-align: end !important;

}
/* Ticketys */


.tickets {
  background: #080808;
  color: white;
  padding: 140px 10%;
    z-index: 20;
    position: relative;
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
}

.tickets__header p {
  color: #999;
  line-height: 1.8;
  max-width: 350px;
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

.ticket-card__top p {
  font-size: 12px;
  color: #888;
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

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  margin-bottom: 12px;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  background: #1b1b1b;
  border: 1px solid #333;
  padding: 16px;
  color: white;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border 0.2s;
}

.form-group input:focus {
  border-color: white;
}

.form-group input::placeholder {
  color: #666;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 25px;
}

.quantity-control button {
  width: 38px;
  height: 38px;
  background: #222;
  border: 1px solid #444;
  color: white;
  cursor: pointer;
  font-size: 20px;
}

.quantity-control span {
  font-size: 16px;
  font-weight: 700;
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

.purchase-button span {
  font-size: 18px;
}

.payment-note {
  color: #666;
  text-align: center;
  font-size: 10px;
  margin: 20px 0 0;
}

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
}
</style>
