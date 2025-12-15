<!--
  <pre>
  File Name   : NotificationPage.vue
  Description : 알림 목록 페이지 - 컴포넌트 통합 버전
                - NotificationHeader: 헤더 (뒤로가기, 제목, 설정)
                - NotificationFilter: 필터 탭 및 모두 읽음 버튼
                - NotificationItem: 개별 알림 아이템
                - NotificationEmpty: 알림 없는 상태 UI
  
  History
  2025/12/09 (혜원) 최초작성
  2025/12/09 (혜원) 컴포넌트 분리 및 통합
  2025/12/12 (혜원) TypeScript 변환 및 Store 연동
  </pre>

  @author 혜원
  @version 2.0
-->

<template>
  <!-- 알림 페이지 전체 컨테이너 -->
  <div class="notification-page">
    <!-- 헤더 컴포넌트 -->
    <NotificationHeader
      :unreadCount="unreadCount"
      @back="goBack"
      @settings="toggleSettings"
    />

    <!-- 필터 탭 컴포넌트 -->
    <NotificationFilter
      :tabs="tabs"
      v-model:activeTab="activeTab"
      @markAllRead="handleMarkAllRead"
    />

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>알림을 불러오는 중...</p>
    </div>

    <!-- 알림 목록 영역 -->
    <div v-else class="notification-list">
      <!-- 알림 아이템 트랜지션 그룹 -->
      <transition-group name="notification" tag="div">
        <!-- 알림 아이템 컴포넌트 -->
        <NotificationItem
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :notification="notification"
          @click="handleNotificationClick"
          @delete="deleteNotification"
          @action="handleAction"
        />
      </transition-group>

      <!-- 빈 상태 컴포넌트 (알림이 없을 때) -->
      <NotificationEmpty v-if="filteredNotifications.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Import 구문
import { ref, computed, onMounted, onUnmounted, Ref, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification/notificationStore';
import NotificationHeader from '@/components/notification/NotificationHeader.vue';
import NotificationFilter from '@/components/notification/NotificationFilter.vue';
import NotificationItem from '@/components/notification/NotificationItem.vue';
import NotificationEmpty from '@/components/notification/NotificationEmpty.vue';
import type { Notification, Tab, NotificationCategory } from '@/types/notification/notification.types';

// 2. Composables
const router = useRouter();
const notificationStore = useNotificationStore();

// 3. Reactive 데이터
/**
 * 현재 활성화된 탭 ID
 * @type {Ref<string>}
 */
const activeTab: Ref<string> = ref('all');

/**
 * 탭 목록 데이터
 * @type {Ref<Array<Tab>>}
 * @property {string} id - 탭 고유 ID
 * @property {string} label - 탭 표시 라벨
 * @property {number} count - 해당 탭의 알림 개수
 */
const tabs: Ref<Tab[]> = ref([
  { id: 'all', label: '전체', count: 0 },
  { id: 'unread', label: '읽지 않음', count: 0 },
  { id: 'attendance', label: '근태', count: 0 },
  { id: 'payroll', label: '급여', count: 0 },
  { id: 'approval', label: '결재', count: 0 },
  { id: 'leave', label: '휴가', count: 0 },
  { id: 'evaluation', label: '평가', count: 0 },
  { id: 'system', label: '시스템', count: 0 }
]);

// 4. Computed 속성 (Store에서 가져오기)
/**
 * 알림 목록 데이터 (Store에서 관리)
 * @type {ComputedRef<Array<Notification>>}
 * @property {number} id - 알림 고유 ID
 * @property {string} type - 알림 타입 (approval, leave, evaluation 등)
 * @property {string} title - 알림 제목
 * @property {string} description - 알림 상세 설명
 * @property {string} timeAgo - 알림 발생 시간 (상대 시간)
 * @property {string} date - 알림 발생 날짜
 * @property {boolean} isNew - 읽지 않은 알림 여부
 * @property {string|null} action - 액션 버튼 텍스트
 * @property {string|null} link - 알림 클릭 시 이동할 링크
 */
const notifications: ComputedRef<Notification[]> = computed(
  () => notificationStore.notifications
);

/**
 * 읽지 않은 알림 개수 계산 (Store에서 관리)
 * @returns {number} 읽지 않은 알림 개수
 */
const unreadCount: ComputedRef<number> = computed(() => notificationStore.unreadCount);

/**
 * 로딩 상태 (Store에서 관리)
 * @returns {boolean} 로딩 중 여부
 */
const isLoading: ComputedRef<boolean> = computed(() => notificationStore.isLoading);

/**
 * 선택된 탭에 따른 필터링된 알림 목록
 * @returns {Array<Notification>} 필터링된 알림 배열
 */
const filteredNotifications: ComputedRef<Notification[]> = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value;
  }
  if (activeTab.value === 'unread') {
    return notifications.value.filter((n) => n.isNew);
  }
  return notifications.value.filter(
    (n) => n.type === (activeTab.value as NotificationCategory)
  );
});

// 5. 메소드
/**
 * 알림 클릭 이벤트 핸들러
 * - 읽지 않은 알림을 읽음 처리
 * - 알림 상세 페이지로 이동 (link가 있는 경우)
 * @param {Notification} notification - 클릭된 알림 객체
 */
const handleNotificationClick = async (notification: Notification): Promise<void> => {
  try {
    // 읽음 처리
    if (notification.isNew) {
      await notificationStore.markAsRead(notification.id);
      updateTabCounts();
    }

    // 링크가 있으면 해당 페이지로 이동
    if (notification.link) {
      router.push(notification.link);
    }
  } catch (error) {
    console.error('알림 클릭 처리 실패:', error);
  }
};

/**
 * 알림 액션 버튼 클릭 이벤트 핸들러
 * - 액션 타입에 따라 적절한 페이지로 라우팅
 * @param {Notification} notification - 액션이 발생한 알림 객체
 */
const handleAction = (notification: Notification): void => {
  console.log('Action clicked:', notification);
  
  // 링크가 있으면 해당 페이지로 이동
  if (notification.link) {
    router.push(notification.link);
  }
  
  // TODO: 액션별 라우팅 처리 구현
  // 예: approval -> /approval/detail/:id
  // 예: payroll -> /payroll/detail/:id
};

/**
 * 알림 삭제
 * - 해당 알림을 목록에서 제거
 * - 탭별 알림 개수 업데이트
 * @param {number} id - 삭제할 알림 ID
 */
const deleteNotification = (id: number): void => {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) {
    // TODO: 백엔드 삭제 API 추가 필요
    notifications.value.splice(index, 1);
    updateTabCounts();
  }
};

/**
 * 모든 알림을 읽음 처리
 * - 모든 알림의 isNew를 false로 변경
 * - 탭별 알림 개수 업데이트
 */
const handleMarkAllRead = async (): Promise<void> => {
  try {
    await notificationStore.markAllAsRead();
    updateTabCounts();
  } catch (error) {
    console.error('전체 읽음 처리 실패:', error);
  }
};

/**
 * 설정 버튼 클릭 이벤트 핸들러
 * - 알림 설정 페이지로 이동
 */
const toggleSettings = (): void => {
  console.log('Settings clicked');
  // TODO: 알림 설정 페이지로 이동
  // router.push({ name: 'NotificationSettings' });
};

/**
 * 탭별 알림 개수 업데이트
 * - 각 탭의 count 속성을 현재 알림 데이터 기준으로 재계산
 */
const updateTabCounts = (): void => {
  tabs.value.forEach((tab) => {
    if (tab.id === 'all') {
      tab.count = 0; // 전체 탭은 개수 표시 안 함
    } else if (tab.id === 'unread') {
      tab.count = notifications.value.filter((n) => n.isNew).length;
    } else {
      tab.count = notifications.value.filter(
        (n) => n.type === (tab.id as NotificationCategory)
      ).length;
    }
  });
};

/**
 * 뒤로가기
 * - 이전 페이지로 이동
 */
const goBack = (): void => {
  router.back();
};

// 6. Lifecycle Hooks
/**
 * 컴포넌트 마운트 시 실행
 * - 알림 목록 조회
 * - 탭 개수 업데이트
 * - WebSocket 연결
 */
onMounted(async () => {
  try {
    // 알림 목록 조회
    await notificationStore.fetchNotifications();
    updateTabCounts();

    // WebSocket 연결
    notificationStore.connectWebSocket();
  } catch (error) {
    console.error('초기화 실패:', error);
  }
});

/**
 * 컴포넌트 언마운트 시 실행
 * - WebSocket 연결 해제
 */
onUnmounted(() => {
  notificationStore.disconnectWebSocket();
});
</script>

<style scoped>
/* 전역 스타일 초기화 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 페이지 컨테이너 */
.notification-page {
  width: 100%;
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* 알림 목록 영역 */
.notification-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px 40px;
}

/* 로딩 상태 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 애니메이션 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ===== 반응형 디자인 ===== */
/* 태블릿 */
@media (max-width: 1024px) {
  .notification-list {
    padding-left: 24px;
    padding-right: 24px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .notification-list {
    padding: 0 20px 32px;
  }
}
</style>