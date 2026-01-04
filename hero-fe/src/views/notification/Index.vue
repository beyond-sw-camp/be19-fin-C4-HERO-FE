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
  2025/12/16 (혜원) 삭제/복구 기능 추가
  2026/01/04 (혜원) 스타일 수정 및 클릭 동작 변경
  </pre>

  @author 혜원
  @version 3.1
-->

<template>
  <div class="notification-page">
    <NotificationHeader
      :unreadCount="unreadCount"
      @back="goBack"
      @settings="toggleSettings"
    />

    <NotificationFilter
      :tabs="tabs"
      v-model:activeTab="activeTab"
      @markAllRead="handleMarkAllRead"
    />

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>알림을 불러오는 중...</p>
    </div>

    <div v-else class="notification-list">
      <!-- 일반 알림 목록 -->
      <transition-group v-if="activeTab !== 'deleted'" name="notification" tag="div">
        <NotificationItem
          v-for="notification in filteredNotifications"
          :key="notification.notificationId"
          :notification="notification"
          @view="handleViewDetail"
          @delete="handleDelete"
        />
      </transition-group>

      <!-- 삭제된 알림 목록 -->
      <transition-group v-else name="notification" tag="div">
        <div
          v-for="notification in deletedNotifications"
          :key="notification.notificationId"
          class="notification-item deleted"
        >
          <div class="notification-icon">
            <img 
              :src="getIcon(notification.type)" 
              :alt="`${notification.type} 아이콘`"
            />
          </div>
          
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">
              삭제됨: {{ notification.deletedAt ? getTimeAgo(notification.deletedAt) : '' }}
            </div>
          </div>

          <div class="action-buttons">
            <button 
              class="restore-btn"
              @click="handleRestore(notification.notificationId)"
              title="복구"
            >
              복구
            </button>
            <button 
              class="hard-delete-btn"
              @click="handleHardDelete(notification.notificationId)"
              title="영구 삭제"
            >
              영구 삭제
            </button>
          </div>
        </div>
      </transition-group>

      <NotificationEmpty v-if="filteredNotifications.length === 0 && activeTab !== 'deleted'" />
      <NotificationEmpty v-if="deletedNotifications.length === 0 && activeTab === 'deleted'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, Ref, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import { getRelativeTime } from '@/utils/timeUtils';
import { useNotificationStore } from '@/stores/notification/notification.store';
import NotificationHeader from '@/components/notification/NotificationHeader.vue';
import NotificationFilter from '@/components/notification/NotificationFilter.vue';
import NotificationItem from '@/components/notification/NotificationItem.vue';
import NotificationEmpty from '@/components/notification/NotificationEmpty.vue';
import type { Notification, Tab, NotificationCategory } from '@/types/notification/notification.types';

const router = useRouter();
const notificationStore = useNotificationStore();

/**
 * 현재 활성화된 탭 ID
 * @type {Ref<string>}
 */
const activeTab: Ref<string> = ref('all');

/**
 * 탭 목록 데이터
 * @type {Ref<Array<Tab>>}
 */
const tabs: Ref<Tab[]> = ref([
  { id: 'all', label: '전체', count: 0 },
  { id: 'unread', label: '읽지 않음', count: 0 },
  { id: 'attendance', label: '근태', count: 0 },
  { id: 'payroll', label: '급여', count: 0 },
  { id: 'approval', label: '결재', count: 0 },
  { id: 'evaluation', label: '평가', count: 0 },
  { id: 'system', label: '시스템', count: 0 },
  { id: 'deleted', label: '삭제된 알림', count: 0 }
]);

/**
 * 알림 목록 데이터 (Store에서 관리)
 * @type {ComputedRef<Array<Notification>>}
 */
const notifications: ComputedRef<Notification[]> = computed(
  () => notificationStore.notifications
);

/**
 * 삭제된 알림 목록 데이터 (Store에서 관리)
 * @type {ComputedRef<Array<Notification>>}
 */
const deletedNotifications: ComputedRef<Notification[]> = computed(
  () => notificationStore.deletedNotifications
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
    return notifications.value.filter((n) => !n.isRead);
  }
  if (activeTab.value === 'deleted') {
    return deletedNotifications.value;
  }
  return notifications.value.filter(
    (n) => n.type === (activeTab.value as NotificationCategory)
  );
});

/**
 * 상세 보기 버튼 클릭 이벤트 핸들러
 * @param {Notification} notification - 클릭된 알림 객체
 */
const handleViewDetail = async (notification: Notification): Promise<void> => {
  try {
    // 읽음 처리
    if (!notification.isRead) {
      await notificationStore.markAsRead(notification.notificationId);
      updateTabCounts();
    }

    // 관련 페이지로 이동
    if (notification.link) {
      router.push(notification.link);
    }
  } catch (error) {
    console.error('페이지 이동 실패:', error);
  }
};

/**
 * 알림 소프트 삭제
 * @param {number} notificationId - 삭제할 알림 ID
 */
const handleDelete = async (notificationId: number): Promise<void> => {
  if (confirm('알림을 삭제하시겠습니까? (30일 후 자동으로 영구 삭제됩니다)')) {
    try {
      await notificationStore.softDeleteNotification(notificationId);
      updateTabCounts();
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      alert('알림 삭제에 실패했습니다');
    }
  }
};

/**
 * 알림 복구
 * @param {number} notificationId - 복구할 알림 ID
 */
const handleRestore = async (notificationId: number): Promise<void> => {
  try {
    await notificationStore.restoreNotification(notificationId);
    updateTabCounts();
    alert('알림이 복구되었습니다');
  } catch (error) {
    console.error('알림 복구 실패:', error);
    alert('알림 복구에 실패했습니다');
  }
};

/**
 * 알림 영구 삭제
 * @param {number} notificationId - 영구 삭제할 알림 ID
 */
const handleHardDelete = async (notificationId: number): Promise<void> => {
  if (confirm('정말로 영구 삭제하시겠습니까? 복구할 수 없습니다!')) {
    try {
      await notificationStore.hardDeleteNotification(notificationId);
      updateTabCounts();
      alert('알림이 영구 삭제되었습니다');
    } catch (error) {
      console.error('알림 영구 삭제 실패:', error);
      alert('알림 영구 삭제에 실패했습니다');
    }
  }
};

/**
 * 모든 알림을 읽음 처리
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
 */
const toggleSettings = (): void => {
  router.push({ name: 'NotificationMySettings' });
};

/**
 * 탭별 알림 개수 업데이트
 */
const updateTabCounts = (): void => {
  tabs.value.forEach((tab) => {
    if (tab.id === 'all') {
      tab.count = 0;
    } else if (tab.id === 'unread') {
      tab.count = notifications.value.filter((n) => !n.isRead).length;
    } else if (tab.id === 'deleted') {
      tab.count = deletedNotifications.value.length;
    } else {
      tab.count = notifications.value.filter(
        (n) => n.type === (tab.id as NotificationCategory)
      ).length;
    }
  });
};

/**
 * 뒤로가기
 */
const goBack = (): void => {
  router.back();
};

/**
 * 아이콘 경로 반환
 */
const getIcon = (type: NotificationCategory): string => {
  const iconMap: Record<NotificationCategory, string> = {
    'attendance': '/images/alarm/alarm-check.svg',
    'payroll': '/images/alarm/alarm-money.svg',
    'approval': '/images/alarm/alarm-paper.svg',
    'evaluation': '/images/alarm/alarm-paper.svg',
    'system': '/images/alarm/alarmsetting.svg'
  };
  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};

const getTimeAgo = getRelativeTime;

onMounted(async () => {
  try {
    await notificationStore.fetchNotifications();
    await notificationStore.fetchDeletedNotifications();
    updateTabCounts();
  } catch (error) {
    console.error('초기화 실패:', error);
  }
});
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.notification-page {
  width: 100%;
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow-y: auto;
}

.notification-list {
  margin: 0 auto;
  padding: 0 32px 40px;
  overflow-y: visible;
}

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

.notification-item.deleted {
  background: #F9FAFB;
  border-left: 3px solid #9CA3AF;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-icon img {
  width: 20px;
  height: 20px;
  margin-bottom: 25px;     
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.restore-btn,
.hard-delete-btn {
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.restore-btn {
  background: #DBEAFE;
  color: #1E40AF;
  border-color: #93C5FD;
}

.restore-btn:hover {
  background: #BFDBFE;
}

.hard-delete-btn {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.hard-delete-btn:hover {
  background: #FECACA;
}

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

@media (max-width: 1024px) {
  .notification-list {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 768px) {
  .notification-list {
    padding: 0 20px 32px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .restore-btn,
  .hard-delete-btn {
    width: 100%;
  }
}
</style>