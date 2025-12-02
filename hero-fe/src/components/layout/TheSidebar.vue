<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <nav class="sidebar__nav">
      <ul class="sidebar__menu">
        <!-- 대시보드 -->
        <li
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive('/') && route.path === '/' }"
        >
          <RouterLink to="/" class="sidebar__link">
            <span class="sidebar__icon">📊</span>
            <span v-if="!isCollapsed" class="sidebar__label">대시보드</span>
          </RouterLink>
        </li>

        <!-- 근태관리 (서브메뉴 포함) -->
        <li
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive('/attendance') }"
        >
          <RouterLink
            to="/attendance"
            class="sidebar__link sidebar__link--with-caret"
          >
            <span class="sidebar__icon">⏱</span>
            <span v-if="!isCollapsed" class="sidebar__label">근태관리</span>
            <span
              v-if="!isCollapsed"
              class="sidebar__caret"
            >
              ⌵
            </span>
          </RouterLink>

          <!-- 근태 서브 메뉴 (접혔을 땐 안보이게) -->
          <ul v-if="!isCollapsed" class="sidebar__submenu">
            <li>
              <RouterLink
                to="/attendance"
                class="sidebar__submenu-link"
                :class="{
                  'sidebar__submenu-link--active': route.path === '/attendance'
                }"
              >
                근태 기록
              </RouterLink>
            </li>
            <li>
              <!-- TODO: /attendance/work-time 같은 라우트 생기면 수정 -->
              <button class="sidebar__submenu-link">
                근무 시간 변경
              </button>
            </li>
          </ul>
        </li>

        <!-- 휴가/연차 -->
        <li class="sidebar__item">
          <button class="sidebar__link sidebar__link--with-caret">
            <span class="sidebar__icon">📅</span>
            <span v-if="!isCollapsed" class="sidebar__label">휴가/연차</span>
            <span v-if="!isCollapsed" class="sidebar__caret">⌵</span>
          </button>
        </li>

        <!-- 전자결재 -->
        <li
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive('/electronic-approval') }"
        >
          <RouterLink to="/electronic-approval" class="sidebar__link">
            <span class="sidebar__icon">📄</span>
            <span v-if="!isCollapsed" class="sidebar__label">전자결재</span>
          </RouterLink>
        </li>

        <!-- 성과평가 -->
        <li
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive('/performance') }"
        >
          <RouterLink to="/performance" class="sidebar__link">
            <span class="sidebar__icon">⭐</span>
            <span v-if="!isCollapsed" class="sidebar__label">성과평가</span>
          </RouterLink>
        </li>

        <!-- 급여 -->
        <li
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive('/payroll') }"
        >
          <RouterLink
            to="/payroll"
            class="sidebar__link sidebar__link--with-caret"
          >
            <span class="sidebar__icon">💲</span>
            <span v-if="!isCollapsed" class="sidebar__label">급여</span>
            <span v-if="!isCollapsed" class="sidebar__caret">⌵</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- 하단 접기 버튼 -->
    <div class="sidebar__bottom">
      <button class="sidebar__collapse" @click="toggleSidebar">
        <span class="sidebar__collapse-icon">
          {{ isCollapsed ? '▶' : '◀' }}
        </span>
        <span v-if="!isCollapsed" class="sidebar__collapse-label">접기</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const isCollapsed = ref(false);

const isActive = (basePath: string) => {
  return route.path.startsWith(basePath);
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #eef0f4;
  padding-top: 24px;
  transition: width 0.2s ease;
}

/* 접힌 상태 */
.sidebar--collapsed {
  width: 72px;
}

.sidebar__nav {
  padding: 0 16px;
  flex: 1;
  overflow-y: auto;
}

.sidebar--collapsed .sidebar__nav {
  padding: 0 8px;
}

.sidebar__menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar__item {
  margin-bottom: 4px;
}

/* RouterLink / button 공용 스타일 */
.sidebar__link {
  width: 100%;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.12s ease-out, color 0.12s ease-out,
    box-shadow 0.12s ease-out;
}

.sidebar--collapsed .sidebar__link {
  justify-content: center;
  padding: 10px 10px;
}

.sidebar__link:hover {
  background-color: #f3f4ff;
  color: #111827;
}

.sidebar__icon {
  font-size: 16px;
  width: 18px;
  text-align: center;
}

.sidebar__label {
  flex: 1;
  text-align: left;
}

.sidebar__link--with-caret .sidebar__caret {
  font-size: 10px;
  color: #9ca3af;
}

/* 활성 메뉴 (gradient 버튼) */
.sidebar__item--active .sidebar__link {
  background: linear-gradient(135deg, #06336f, #123c9c);
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.45);
}

.sidebar__item--active .sidebar__caret {
  color: #e5e7eb;
}

/* 서브메뉴 */
.sidebar__submenu {
  list-style: none;
  margin: 4px 0 8px;
  padding: 0 8px 0 42px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__submenu-link {
  width: 100%;
  border: none;
  background-color: transparent;
  border-radius: 8px;
  font-size: 13px;
  padding: 6px 10px;
  color: #4b5563;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.12s ease-out, color 0.12s ease-out;
}

.sidebar__submenu-link:hover {
  background-color: #e5edff;
  color: #1f2937;
}

.sidebar__submenu-link--active {
  background-color: #4f88ff;
  color: #ffffff;
}

/* 하단 */
.sidebar__bottom {
  padding: 12px 16px 20px;
  border-top: 1px solid #eef0f4;
}

.sidebar--collapsed .sidebar__bottom {
  padding: 12px 8px 20px;
}

.sidebar__collapse {
  width: 100%;
  border-radius: 999px;
  border: none;
  background-color: #f3f4ff;
  color: #4b5563;
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  cursor: pointer;
}

.sidebar__collapse-icon {
  font-size: 11px;
}
</style>
