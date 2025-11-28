<template>
  <header class="header">
    <nav class="header__nav">
      <h1>HERO</h1>
      <!-- TODO: Add navigation links -->
    </nav>
  </header>
</template>

<script setup>
// No script logic needed for a simple placeholder
</script>

<style scoped>
.header {
  width: 100%;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.header__nav h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #343a40;
}
</style>
