
<script setup lang="ts">
import { reactive, ref } from 'vue'
import Input from '~/components/Input.vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { Check } from 'lucide-vue-next'
const config = useRuntimeConfig()


const API_URL = config.public.apiBase

const form = reactive({
  name: '',
  phone: '',
  email: '',
  instagram: '',
  consent: false
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const qrCode = ref('')

async function submitForm() {
  error.value = ''

  if (!form.consent) {
    error.value = 'Please accept the privacy policy.'
    return
  }

  loading.value = true

  try {
    const response = await fetch(`${API_URL}/v1/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        instagram: form.instagram.trim()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.')
    }

    qrCode.value = data.qrCode || data.qr_code || ''
    success.value = true
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="join">
    <div class="join-container join__container">

      <template v-if="!success">
       

        <h1>Be part of<br /><span>our guests</span></h1>

        <p class="description">
          Leave your details to join the TUUSE guest list.
          We'll keep you updated about upcoming events.
        </p>
        <br>
        <br>

        <form @submit.prevent="submitForm">

          <Input
          id="name"
              v-model="form.name"
              type="text"
              placeholder="Your full name"
              autocomplete="name"
              required
              minlength="2"
              label="Full name"
              maxlength="100"></Input>

   
           <Input
           label="PHONE NUMBER"
                id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="+373 000 000 00"
              autocomplete="tel"
              required
              maxlength="25" 
           ></Input>

         
           <Input
           label="EMAIL ADDRESS"
          id="email"
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              maxlength="254"
           ></Input>

            <Input
            label="instagram"
           id="instagram"
                v-model="form.instagram"
                type="text"
                placeholder="username"
                maxlength="30"
                prefix="@"
                optional
           ></Input>

         

          <label class="consent">
            <input
              v-model="form.consent"
              type="checkbox"
              required
            />
            <span>
              I agree to the
              <a href="/privacy-policy" target="_blank">
                Privacy Policy
              </a>
              and the processing of my personal data.
            </span>
          </label>

          <p v-if="error" class="error">{{ error }}</p>

          <button type="submit" :disabled="loading">
            <span>{{ loading ? 'SUBMITTING...' : 'JOIN TUUSE' }}</span>
              <ArrowUpRight :size="19" />
          </button>

        </form>

      </template>

      <div v-else class="success">
        <div class="success-icon">
          <Check :size="25"></Check>
        </div>

  
        <h1>You're <span>in.</span></h1>

        <p class="description">
          Thank you for joining TUUSE.
          Your registration has been received.
        </p>

     

      </div>

    </div>
  </section>
</template>

<style scoped>
.join {
  min-height: 100%;
  
  color: #f5f5f5;
  font-family: inherit;
}

.join-container {
  width: 100%;
  max-width: 600px !important;
  margin: 0 auto;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #888;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d5d5d5;
}

h1 {
  margin: 32px 0 16px;
  font-size: clamp(42px, 8vw, 62px);
  line-height: 0.98;
  letter-spacing: -3px;
  font-weight: 600;
}

h1 span {
  color: #777;
}

.description {
  max-width: 380px;
  margin: 0 auto;
  color: #888;
  font-size: 14px;
  line-height: 1.7;
}

form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field label {
  color: #999;
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 600;
}

.optional {
  color: #555;
  margin-left: 5px;
}

.field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #303030;
  border-radius: 4px;
  outline: none;
  background: #171717;
  color: white;
  font-size: 14px;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #888;
}

.field input::placeholder {
  color: #555;
}

.instagram-input {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #303030;
  border-radius: 4px;
  background: #171717;
}

.instagram-input:focus-within {
  border-color: #888;
}

.instagram-input span {
  color: #777;
}

.instagram-input input {
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
}

.instagram-input input:focus {
  border: 0;
}

.consent {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  color: #888;
  font-size: 11px;
  line-height: 1.6;
  cursor: pointer;
}

.consent input {
  margin-top: 2px;
  accent-color: white;
}

.consent a {
  color: white;
  text-decoration: underline;
  text-underline-offset: 3px;
}

button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 54px;
  padding: 0 18px;
  border: 0;
  border-radius: 4px;
  background: #f2f2f2;
  color: #111;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #ccc;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.arrow {
  font-size: 20px;
}

.error {
  color: #ff7777;
  font-size: 12px;
}

.footer-note {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid #292929;
  color: #555;
  font-size: 9px;
  letter-spacing: 1.5px;
}

.success {
  text-align: center;
}

.success .eyebrow {
  justify-content: center;
}

.success h1 {
  margin-top: 0px;
}

.success-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height:64px;
  margin: 0 auto 28px;
  border: 1px solid #555;
  border-radius: 50%;
  font-size: 24px;
}

.success-message {
  padding: 24px;
  border: 1px solid #303030;
  color: #aaa;
  font-size: 13px;
}

.qr-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: white;
  color: #111;
}

.qr-container img {
  width: 180px;
  height: 180px;
  object-fit: contain;
}

.qr-container p {
  margin: 0;
  font-size: 10px;
  letter-spacing: 1.5px;
}

@media (max-width: 480px) {
  .join {
    padding: 48px 20px;
  }
}
</style>
