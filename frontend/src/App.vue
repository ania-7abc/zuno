<script setup>
import Chat from './components/Chat.vue'
import Sidebar from './components/Sidebar.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'

import {useWebui} from "./useWebui.js"

const {isAvailable, isConnected} = useWebui()
</script>

<template>
  <nav class="navbar">
    <div class="nav-left">
      <a class="brand" href="/">Zuno</a>
    </div>
    <div class="nav-right">
      <ThemeSwitcher/>
    </div>
  </nav>
  <hr>
  <div v-if="!isAvailable" class="status-screen">
    <div class="error">
      <div class="error-icon">⚠</div>
      <h2>WebUI is unavailable</h2>
    </div>
  </div>
  <div v-else-if="!isConnected" class="status-screen">
    <div class="spinner"></div>
    <p class="loading-text">Connecting...</p>
  </div>
  <div v-else class="layout">
    <aside class="sidebar">
      <Sidebar/>
    </aside>
    <span class="divider"></span>
    <main class="chat">
      <Chat/>
    </main>
  </div>
</template>

<style scoped>
:global(#app) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.navbar,
hr {
  flex-shrink: 0;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px;
}

.brand {
  font-weight: 700;
  font-size: 18pt;
  text-decoration: none;
  color: var(--text);
}

.nav-left,
.nav-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

hr {
  color: var(--text);
  margin: 0 0 10px;
}

.layout {
  display: flex;
  justify-content: space-between;
  flex: 1;
  min-height: 0;
}

.sidebar {
  flex: 0 0 200px;
  overflow-y: auto;
  min-height: 0;
}

.divider {
  width: 1px;
  align-self: stretch;
  background: var(--text);
  margin: 0 15px;
  flex: 0 0 1px;
}

.chat {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.status-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 0;
  color: var(--text);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid color-mix(in srgb, var(--text) 20%, transparent);
  border-top-color: var(--text);
  border-radius: 50%;
  animation: spin 0.2s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  font-size: 12pt;
  opacity: 0.75;
  letter-spacing: 0.03em;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  max-width: 420px;
  padding: 20px;
}

.error-icon {
  font-size: 48px;
  line-height: 1;
  color: #f00;
}

.error h2 {
  margin: 0;
  font-size: 18pt;
}
</style>
