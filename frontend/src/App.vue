<script setup>
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
</template>

<style scoped>
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
</style>
