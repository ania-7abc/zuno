<script setup>
import Chat from './components/Chat.vue'
import Sidebar from './components/Sidebar.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
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
  <div class="layout">
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
</style>
