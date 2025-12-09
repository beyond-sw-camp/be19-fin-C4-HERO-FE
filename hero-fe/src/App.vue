<template>
  <div id="app">
    <TheHeader />
    <div class="layout-body">
      <TheSidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/layout/TheHeader.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import TheSidebar from '@/components/layout/TheSidebar.vue';
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useSessionStore } from "@/stores/session";

const route = useRoute();
const session = useSessionStore();

onMounted(() => {
  session.startSession();
});

// 페이지 전환 될 때 세션 갱신
watch(
  () => route.fullPath,
  () => {
    session.refreshSession();
  }
);
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f6fa;
  overflow: hidden;
}

.layout-body {
  flex: 1;
  display: flex;
  min-height: 0;              
  overflow: hidden; 
}

.main-content {
  flex: 1;
  padding: 0px;
  background: #f5f6fa;
  height: 100%;               
  min-height: 0;              
  overflow-y: auto; 
}
</style>
