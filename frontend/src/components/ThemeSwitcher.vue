<script setup lang="ts">
import {ref, watch} from 'vue'

import Icon from './Icon.vue'

const STORAGE_KEY = 'zuno.theme'

const media = window.matchMedia('(prefers-color-scheme: dark)')
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const darkTheme = ref<boolean>(stored ? stored === 'dark' : media.matches)

function apply(): void {
  document.documentElement.dataset.theme = darkTheme.value ? 'dark' : 'light'
}

apply()

watch(darkTheme, (value) => {
  apply()
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light')
  } catch {
    // localStorage may be unavailable; the theme still applies for this session.
  }
})

media.addEventListener('change', (event) => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) return
  darkTheme.value = event.matches
})
</script>

<template>
  <button
      :class="['theme-toggle', {dark: darkTheme}]"
      :title="darkTheme ? 'Switch to light theme' : 'Switch to dark theme'"
      type="button"
      @click="darkTheme = !darkTheme"
  >
    <Icon :name="darkTheme ? 'sun' : 'moon'" :size="17"/>
    <span>{{ darkTheme ? 'Light' : 'Dark' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.theme-toggle:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.theme-toggle.dark {
  color: var(--text);
}

@media (max-width: 860px) {
  .theme-toggle span {
    display: none;
  }

  .theme-toggle {
    width: 30px;
    padding: 0;
    justify-content: center;
  }
}
</style>
