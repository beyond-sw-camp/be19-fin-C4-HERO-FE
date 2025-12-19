<template>
  <div class="page-container">
    <div class="header-container">
      <h2 class="page-title">시스템 설정</h2>
    </div>

    <div class="content-wrapper">
      <div class="main-card">
        <!-- 탭 메뉴 -->
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="changeTab(tab)"
            :class="['tab-button', isActive(tab) ? 'active' : '']"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 탭 컨텐츠 -->
        <div class="content-container">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();
const router = useRouter();
const route = useRoute();

const tabs = [
  { id: 'department', label: '부서 관리', path: '/settings/department' },
  { id: 'grade', label: '직급 관리', path: '/settings/grade' },
  { id: 'jobTitle', label: '직책 관리', path: '/settings/jobTitle' },
  { id: 'permission', label: '권한 관리', path: '/settings/permission' },
];

const changeTab = (tab: any) => {
  router.push(tab.path);
};

const isActive = (tab: any) => {
  return route.path.includes(tab.path);
};

onMounted(() => {
  // 설정 페이지 진입 시 필요한 데이터 로드
  // settingsStore.loadAllSettings();
});
</script>

<style scoped>
.page-container {
  background-color: #f8fafc;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-container {
  width: 100%;
  height: 50px;
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172b;
}

.content-wrapper {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.main-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  min-height: 600px;
}

.tabs-container {
  display: inline-flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  width: 146px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  border-right: 2px solid #e2e8f0;
  border-left: none;
  font-size: 14px;
  color: #62748e;
  cursor: pointer;
}

.tab-button:first-child {
  border-left: 2px solid #e2e8f0;
  border-top-left-radius: 14px;
}

.tab-button:last-child {
  border-top-right-radius: 14px;
}

.tab-button.active {
  background: linear-gradient(180deg, #1c398e 0%, #162456 100%);
  color: white;
  font-weight: 700;
}

.content-container {
  padding: 24px;
}
</style>
