
<script setup lang="ts">

const route = useRoute()

const orderId = computed(() => String(route.params.id))
const sessionId = computed(() => String(route.params.sessionId))

const { data: response, pending, error } = await useFetch(
  `http://localhost:8787/v1/orders/${orderId.value}/verify`,
  {
    query: {
      session_id: sessionId.value,
    },
  }
)

const order = computed(() => response.value?.order)
const tickets = computed(() => response.value?.tickets ?? [])

const isPaid = computed(() => response.value?.paymentStatus === 'paid')

useHead({
    title: `Order №${order.orderNumber ? order.orderNumber : 'd' }`
})
console.log(order)
const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

const formatTicketType = (type: string) => type.replaceAll('_', ' ')

const ticketUrl = (id: string) => `/ticket/${id}`

const copyOrderId = async () => {
  if (order.value?.orderNumber) {
    await navigator.clipboard.writeText(order.value.orderNumber)
  }
}
</script>

<template>
    <div class="order-container">
      <!-- Loading -->
      <div v-if="pending" class="state-container">
        <div class="spinner"></div>
        <p>Verifying your order...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error || !response?.success" class="state-container">
        <div class="error-icon">!</div>
        <h1>Unable to load your order</h1>
        <p>Please try again later or contact our support.</p>
      </div>

      <template v-else-if="order">

        <!-- Success -->
        <section class="success-section">
          <div
            class="success-icon"
            :class="{ 'is-pending': !isPaid }"
          >
            <svg
              v-if="isPaid"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m5 12 4 4L19 6"
              />
            </svg>

            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="9" />
              <path stroke-linecap="round" d="M12 7v5l3 2" />
            </svg>
          </div>

          <p class="eyebrow">
            {{ isPaid ? 'Payment confirmed' : 'Order received' }}
          </p>

          <h1>{{ isPaid ? 'Thank you!' : 'Almost there.' }}</h1>

          <p class="success-description">
            {{
              isPaid
                ? 'Your payment has been successfully processed. Your tickets are ready.'
                : 'Your order is being processed. Please wait for payment confirmation.'
            }}
          </p>
        </section>

        <!-- Order details -->
        <section class="order-card">
          <div class="card-header">
            <h2>Order details</h2>

            <span
              class="status-badge"
              :class="{ 'status-pending': !isPaid }"
            >
              {{ order.status }}
            </span>
          </div>

          <div class="order-details">
            <div class="detail-row">
              <span>Order number</span>

              <button class="copy-button" @click="copyOrderId">
                {{ order.orderNumber }}

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="8" y="8" width="13" height="13" rx="2" />
                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>

            <div class="detail-row">
              <span>Quantity</span>
              <span>{{ order.quantity }} tickets</span>
            </div>

            <div class="detail-row">
              <span>Payment</span>
              <span class="capitalize">{{ response.paymentStatus }}</span>
            </div>

            <div class="total-row">
              <span>Total {{ isPaid ? 'paid' : 'amount' }}</span>
              <strong>
                {{ formatPrice(order.totalAmount, order.currency) }}
              </strong>
            </div>
          </div>
        </section>

        <!-- Tickets -->
        <section v-if="tickets.length" class="tickets-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Your access</p>
              <h2>Your tickets</h2>
            </div>

            <span class="ticket-count">
              {{ tickets.length }} tickets
            </span>
          </div>

          <div class="ticket-list">
            <article
              v-for="ticket in tickets"
              :key="ticket.id"
              class="ticket-card"
            >
              <div class="ticket-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3Z"
                  />
                  <path stroke-dasharray="2 2" d="M13 4v16" />
                </svg>
              </div>

              <div class="ticket-info">
                
                <h3>Ticket #{{ ticket.ticketNumber }}</h3>
                <p>{{ formatTicketType(ticket.type) }}</p>
              </div>

              <span
                class="ticket-status"
                :class="{ 'ticket-invalid': ticket.status !== 'VALID' }"
              >
                {{ ticket.status }}
              </span>

              <NuxtLink
                :to="ticketUrl(ticket.token)"
                class="ticket-link"
                aria-label="View ticket"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M7 17 17 7M7 7h10v10"
                  />
                </svg>
              </NuxtLink>
            </article>
          </div>

          <p class="tickets-note">
            Each ticket has its own unique access link.
            Keep your tickets safe and present them at the entrance.
          </p>
        </section>

        <!-- Footer -->
        <footer class="order-footer">
          <p>Thank you for being part of TUUSE.</p>

          <NuxtLink to="/">
            Back to TUUSE <span>→</span>
          </NuxtLink>
        </footer>

      </template>
    </div>

    <div class="bottom-brand">
      THE UNITY OF UNIVERSE SPACE
    </div>
</template>

<style scoped>
.order-page {
  color: #fff;
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  selection-background-color: #fff;
}

.order-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-inner {
  max-width: 1024px;
  height: 80px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  color: #fff;
  text-decoration: none;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 0.25em;
}

.header-label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.order-container {
  max-width: 768px;
  margin: 0 auto;
  padding: 96px 24px 80px;
}

/* Loading and error */

.state-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.state-container p {
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}

.state-container h1 {
  font-size: 25px;
  font-weight: 600;
}

.spinner {
  width: 34px;
  height: 34px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 40px;
  color: #f87171;
  background-color: #F8717147;;
  border-radius: 9999px;
  padding: 0.5rem;
  aspect-ratio: 1/1;
}

/* Success section */

.success-section {
  margin-bottom: 56px;
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(52, 211, 153, 0.2);
  background: rgba(52, 211, 153, 0.08);
  border-radius: 50%;
  color: #34d399;
}

.success-icon.is-pending {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.2);
  background: rgba(251, 191, 36, 0.08);
}

.success-icon svg {
  width: 30px;
  height: 30px;
}

.eyebrow {
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.success-section h1 {
  font-size: clamp(36px, 6vw, 50px);
  font-weight: 600;
  letter-spacing: -0.04em;
}

.success-description {
  max-width: 420px;
  margin: 16px auto 0;
  color: rgba(255, 255, 255, 0.48);
  font-size: 14px;
  line-height: 1.8;
}

/* Order card */

.order-card {
  margin-bottom: 42px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.025);
}

.card-header {
  min-height: 65px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.card-header h2 {
  font-size: 14px;
  font-weight: 600;
}

.status-badge {
  padding: 6px 11px;
  border-radius: 30px;
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.status-pending {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.order-details {
  padding: 24px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  font-size: 13px;
}

.detail-row > span:first-child,
.total-row > span {
  color: rgba(255, 255, 255, 0.42);
}

.detail-row > span:last-child {
  text-align: right;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.copy-button:hover {
  opacity: 0.65;
}

.copy-button svg {
  width: 15px;
  height: 15px;
  stroke-width: 1.5;
}

.capitalize {
  text-transform: capitalize;
}

.total-row {
  padding-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.total-row > span {
  font-size: 13px;
}

.total-row strong {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

/* Tickets */

.tickets-section {
  margin-bottom: 48px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-heading h2 {
  font-size: 25px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.ticket-count {
  padding-bottom: 4px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-card {
  min-height: 90px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  transition: border-color 0.2s, background 0.2s;
}

.ticket-card:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.045);
}

.ticket-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
}

.ticket-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 1.4;
}

.ticket-info {
  flex: 1;
  min-width: 0;
}

.ticket-info h3 {
  font-size: 15px;
  font-weight: 600;
}

.ticket-info p {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ticket-status {
  padding: 6px 10px;
  border-radius: 20px;
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.ticket-invalid {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.ticket-link {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  transition: background 0.2s, color 0.2s;
}

.ticket-link:hover {
  background: #fff;
  color: #090909;
}

.ticket-link svg {
  width: 19px;
  height: 19px;
}

.tickets-note {
  max-width: 420px;
  margin: 20px auto 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
  line-height: 1.8;
  text-align: center;
}

/* Footer */

.order-footer {
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.order-footer p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.order-footer a {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s;
}

.order-footer a:hover {
  color: #fff;
}

.order-footer a span {
  font-size: 16px;
}

.bottom-brand {
  padding: 0 20px 30px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 9px;
  letter-spacing: 0.35em;
  text-align: center;
}

/* Responsive */

@media (max-width: 600px) {
  .header-inner {
    height: 68px;
    padding: 0 20px;
  }

  .logo {
    font-size: 18px;
  }

  .header-label {
    font-size: 9px;
  }

  .order-container {
    padding: 64px 18px 60px;
  }

  .success-section {
    margin-bottom: 40px;
  }

  .card-header,
  .order-details {
    padding: 18px;
  }

  .detail-row {
    font-size: 12px;
  }

  .copy-button {
    font-size: 10px;
  }

  .ticket-card {
    gap: 12px;
    padding: 14px;
  }

  .ticket-icon {
    width: 42px;
    height: 42px;
  }

  .ticket-status {
    font-size: 8px;
    padding: 5px 7px;
  }

  .ticket-link {
    width: 36px;
    height: 36px;
  }

  .total-row strong {
    font-size: 21px;
  }
}

@media (max-width: 380px) {
  .ticket-card {
    gap: 9px;
    padding: 12px;
  }

  .ticket-status {
    display: none;
  }

  .copy-button {
    max-width: 190px;
    overflow-wrap: anywhere;
  }
}
</style>
