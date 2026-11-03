<script setup>
import {ref, watch} from 'vue'

const media = window.matchMedia('(prefers-color-scheme: dark)')
const darkTheme = ref(media.matches)

function apply() {
  document.documentElement.dataset.theme = darkTheme.value ? 'dark' : 'light'
}

apply()

watch(darkTheme, apply)
media.addEventListener('change', e => darkTheme.value = e.matches)
</script>

<template>
  <label class="switch">
    <span v-if="darkTheme" class="switch--label">Темная тема</span>
    <span v-else class="switch--label">Светлая тема</span>
    <input v-model="darkTheme" class="switch--input" type="checkbox"/>
    <span class="switch--track"></span>
  </label>
</template>

<style scoped>
.switch {
  display: inline-flex;
  cursor: pointer;
  user-select: none;
}

.switch--input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.switch--track {
  position: relative;
  display: block;
  width: 48px;
  height: 26px;
  background: var(--primary);
  border-radius: 999px;
  transition: background 0.2s ease;
}

.switch--track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: var(--bg);
  border-radius: 50%;
  box-shadow: none;
  transition: transform 0.2s ease;
}

.switch--input:checked + .switch--track::after {
  transform: translateX(22px);
}

.switch--input:focus-visible + .switch--track {
  box-shadow: 0 0 0 3px var(--muted);
}

.switch--label {
  padding-right: 10px;
}
</style>