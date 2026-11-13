<template>
  <div class="ts-field">
    <label
      v-if="label"
      class="ts-label"
      :for="inputId"
      :class="{ 'is-focused': focused }"
    >
      {{ label }}
    </label>

    <div class="ts-input" :class="{ 'is-focused': focused }">
      <span class="corner corner-tl"></span>
      <span class="corner corner-tr"></span>
      <span class="corner corner-bl"></span>
      <span class="corner corner-br"></span>

      <input
        :id="inputId"
        type="text"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
      />

      <span class="focus-line"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, useId } from 'vue'

defineProps({
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Enter text...'
  },
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const focused = ref(false)
const inputId = useId()
</script>

<style scoped>
.ts-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1rem;
}

/* Label */

.ts-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.ts-label.is-focused {
  color: #fff;
}

/* Input */

.ts-input {
  --accent: #fff;
  --muted: rgba(255, 255, 255, 0.2);

  position: relative;
  width: 100%;
  height: 48px;

  display: flex;
  align-items: center;

  background: rgba(255, 255, 255, 0.025);
  transition: background 0.3s ease;
}

.ts-input input {
  position: relative;
  z-index: 1;

  width: 100%;
  height: 100%;
  padding: 0 16px;

  border: none;
  outline: none;
  background: transparent;

  color: #fff;
  font: inherit;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.ts-input input::placeholder {
  color: rgba(255, 255, 255, 0.35);
  transition: color 0.3s ease;
}

.ts-input:focus-within {
  background: rgba(255, 255, 255, 0.045);
}

.ts-input:focus-within input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* Corners */

.corner {
  position: absolute;
  width: 9px;
  height: 9px;
  pointer-events: none;

  transition:
    width 0.35s ease,
    height 0.35s ease,
    opacity 0.35s ease;
}

.corner-tl {
  top: 0;
  left: 0;
  border-top: 1px solid var(--accent);
  border-left: 1px solid var(--accent);
}

.corner-tr {
  top: 0;
  right: 0;
  border-top: 1px solid var(--muted);
  border-right: 1px solid var(--muted);
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 1px solid var(--muted);
  border-left: 1px solid var(--muted);
}

.corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 1px solid var(--accent);
  border-right: 1px solid var(--accent);
}

/* Focus */

.ts-input:focus-within .corner {
  width: 13px;
  height: 13px;
}

.ts-input:focus-within .corner-tr,
.ts-input:focus-within .corner-bl {
  opacity: 0.8;
}

@media (prefers-reduced-motion: reduce) {
  .ts-input,
  .ts-input input::placeholder,
  .corner,
  .ts-label {
    transition: none;
  }
}
</style>