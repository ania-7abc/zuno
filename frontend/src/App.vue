<script setup lang="ts">
import Chat from './components/Chat.vue'
import Sidebar from './components/Sidebar.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'

import {useWebui} from './useWebui.js'
import {useMessengerState} from './useMessengerState'

const {isAvailable, isConnected} = useWebui()
const {mobileView} = useMessengerState()

</script>

<template>
  <nav class="navbar">
    <a class="brand" href="/">
      <span class="brand-mark">Z</span>
      <span class="brand-name">Zuno</span>
    </a>
    <div class="nav-right">
      <ThemeSwitcher/>
    </div>
  </nav>
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
  <div v-else :data-mobile-view="mobileView" class="layout">
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

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  height: var(--nav-h);
  flex: 0 0 auto;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--text);
  text-decoration: none;
  user-select: none;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  background: var(--text);
  color: var(--panel);
  font-size: 14px;
  font-weight: 700;
}

.brand-name {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sidebar {
  flex: 0 0 300px;
  overflow: hidden;
  min-height: 0;
  background: var(--panel);
}

.divider {
  width: 1px;
  align-self: stretch;
  background: var(--border);
  flex: 0 0 1px;
}

.chat {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--panel);
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

@media (max-width: 640px) {
  .sidebar {
    flex: 1 1 auto;
  }

  .chat {
    flex: 1 1 auto;
  }

  .layout[data-mobile-view="chat"] .sidebar,
  .layout[data-mobile-view="chat"] .divider {
    display: none;
  }

  .layout[data-mobile-view="list"] .chat {
    display: none;
  }
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
