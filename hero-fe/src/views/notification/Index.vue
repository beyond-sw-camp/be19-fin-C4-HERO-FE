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
      @markAllRead="markAllAsRead"
    />

    <!-- 알림 목록 영역 -->
    <div class="notification-list">
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

<script setup>
// 1. Import 구문
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import NotificationHeader from '@/components/notification/NotificationHeader.vue';
import NotificationFilter from '@/components/notification/NotificationFilter.vue';
import NotificationItem from '@/components/notification/NotificationItem.vue';
import NotificationEmpty from '@/components/notification/NotificationEmpty.vue';

// 2. Composables
const router = useRouter();

// 3. Reactive 데이터
/**
 * 현재 활성화된 탭 ID
 * @type {Ref<string>}
 */
const activeTab = ref('all');

/**
 * 탭 목록 데이터
 * @type {Ref<Array>}
 * @property {string} id - 탭 고유 ID
 * @property {string} label - 탭 표시 라벨
 * @property {number} count - 해당 탭의 알림 개수
 */
const tabs = ref([
  { id: 'all', label: '전체', count: 0 },
  { id: 'unread', label: '읽지 않음', count: 3 },
  { id: 'attendance', label: '근태', count: 1 },
  { id: 'payroll', label: '급여', count: 1 },
  { id: 'approval', label: '결재', count: 1 },
  { id: 'leave', label: '휴가', count: 1 },
  { id: 'evaluation', label: '평가', count: 1 },
  { id: 'system', label: '시스템', count: 1 }
]);

// 추후 수정: 실제 API 연동
/**
 * 알림 목록 데이터
 * @type {Ref<Array>}
 * @property {number} id - 알림 고유 ID
 * @property {string} type - 알림 타입 (approval, leave, evaluation 등)
 * @property {string} title - 알림 제목
 * @property {string} description - 알림 상세 설명
 * @property {string} timeAgo - 알림 발생 시간 (상대 시간)
 * @property {string} date - 알림 발생 날짜
 * @property {boolean} isNew - 읽지 않은 알림 여부
 * @property {string|null} action - 액션 버튼 텍스트
 */
const notifications = ref([
  {
    id: 1,
    type: 'approval',
    title: '결재 요청 도착',
    description: '2025년 1월 비용 결산 건에 대한 결재가 요청되었습니다.',
    timeAgo: '5분 전',
    date: '2025-12-02',
    isNew: true,
    action: '결재 처리'
  },
  {
    id: 2,
    type: 'leave',
    title: '연차 소멸 예정',
    description: '2025년 11월 연차 소멸 예정자 집계 알림을 발송합니다. 남은 연차: 3.5일/20일',
    timeAgo: '1시간 전',
    date: '2025-11-30',
    isNew: true,
    action: '상세 보기'
  },
  {
    id: 3,
    type: 'evaluation',
    title: '평가 시즌 시작',
    description: '2025년 하반기 성과평가가 시작되었습니다. 평가 기간: 12/01 ~ 12/20',
    timeAgo: '2시간 전',
    date: '2025-12-01',
    isNew: true,
    action: '평가 작성'
  },
  {
    id: 4,
    type: 'attendance',
    title: '출근 미체크',
    description: '2025년 12월 01일 출근 체크가 없습니다. 지정된 시간에 미체크 알림을 발송합니다.',
    timeAgo: '3시간 전',
    date: '2025-12-01',
    isNew: false,
    action: null
  },
  {
    id: 5,
    type: 'payroll',
    title: '급여명세서 도착',
    description: '2025년 11월 급여명세서가 발급되었습니다.',
    timeAgo: '1일 전',
    date: '2025-11-28',
    isNew: false,
    action: '명세서 보기'
  },
  {
    id: 6,
    type: 'system',
    title: '시스템 공지 발송',
    description: '2025년 12월 05일 오전 2시 ~ 4시 시스템 정기 점검이 예정되어 있습니다.',
    timeAgo: '3일 전',
    date: '2025-12-05',
    isNew: false,
    action: null
  }
]);

// 4. Computed 속성
/**
 * 읽지 않은 알림 개수 계산
 * @returns {number} 읽지 않은 알림 개수
 */
const unreadCount = computed(() => {
  return notifications.value.filter(n => n.isNew).length;
});

/**
 * 선택된 탭에 따른 필터링된 알림 목록
 * @returns {Array} 필터링된 알림 배열
 */
const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value;
  }
  if (activeTab.value === 'unread') {
    return notifications.value.filter(n => n.isNew);
  }
  return notifications.value.filter(n => n.type === activeTab.value);
});

// 5. 메소드
/**
 * 알림 클릭 이벤트 핸들러
 * - 읽지 않은 알림을 읽음 처리
 * - 알림 상세 페이지로 이동
 * @param {Object} notification - 클릭된 알림 객체
 */
const handleNotificationClick = (notification) => {
  // 읽음 처리
  if (notification.isNew) {
    notification.isNew = false;
    updateTabCounts();
  }
  
  // 상세 페이지로 이동
  router.push({
    name: 'NotificationDetail',
    params: { id: notification.id }
  });
};

/**
 * 알림 액션 버튼 클릭 이벤트 핸들러
 * - 액션 타입에 따라 적절한 페이지로 라우팅
 * @param {Object} notification - 액션이 발생한 알림 객체
 */
const handleAction = (notification) => {
  console.log('Action clicked:', notification);
  // TODO: 액션별 라우팅 처리 구현
};

/**
 * 알림 삭제
 * - 해당 알림을 목록에서 제거
 * - 탭별 알림 개수 업데이트
 * @param {number} id - 삭제할 알림 ID
 */
const deleteNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
    updateTabCounts();
  }
};

/**
 * 모든 알림을 읽음 처리
 * - 모든 알림의 isNew를 false로 변경
 * - 탭별 알림 개수 업데이트
 */
const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.isNew = false;
  });
  updateTabCounts();
};

/**
 * 설정 버튼 클릭 이벤트 핸들러
 * - 알림 설정 페이지로 이동
 */
const toggleSettings = () => {
  console.log('Settings clicked');
  // TODO: 알림 설정 페이지로 이동
  // router.push({ name: 'NotificationSettings' });
};

/**
 * 탭별 알림 개수 업데이트
 * - 각 탭의 count 속성을 현재 알림 데이터 기준으로 재계산
 */
const updateTabCounts = () => {
  tabs.value.forEach(tab => {
    if (tab.id === 'all') {
      tab.count = 0; // 전체 탭은 개수 표시 안 함
    } else if (tab.id === 'unread') {
      tab.count = notifications.value.filter(n => n.isNew).length;
    } else {
      tab.count = notifications.value.filter(n => n.type === tab.id).length;
    }
  });
};

/**
 * 뒤로가기
 * - 이전 페이지로 이동
 */
const goBack = () => {
  router.back();
};
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