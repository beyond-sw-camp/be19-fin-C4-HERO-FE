<!--
  <pre>
  Vue Name: NotificationItem.vue
  Description: 알림 아이템 컴포넌트
                - 알림 타입별 아이콘 표시
                - 읽음/안 읽음 상태 스타일 구분
                - 클릭 시 상세 페이지 이동
                - 액션 버튼 및 삭제 버튼 제공
  
  History
  2025/12/09 (혜원) 최초작성
  2025/12/14 (혜원) TypeScript 변환 및 타입 정의
  </pre>

  @author 혜원
  @version 2.0
-->

<template>
  <!-- 알림 아이템 컨테이너 -->
  <div 
    class="notification-item"
    :class="{ 'unread': props.notification.isNew }"
    @click="handleClick"
  >
    <!-- 알림 타입별 아이콘 -->
    <!-- img 태그로 사용 -->
    <img 
      :src="getIcon(notification.type)" 
      :alt="`${notification.type} 아이콘`"
      class="notification-icon"
  />

    <!-- 알림 내용 -->
    <div class="content">
      <h3 class="title">{{ props.notification.title }}</h3>
      <p class="description">{{ props.notification.description }}</p>
      <span class="time">{{ props.notification.timeAgo }}</span>
    </div>

    <!-- 액션 버튼 (action이 있는 경우에만 표시) -->
    <button 
      v-if="props.notification.action"
      class="action-btn"
      @click="handleActionClick"
    >
      {{ props.notification.action }}
    </button>

    <!-- 삭제 버튼 -->
    <button 
      class="delete-btn"
      @click="handleDeleteClick"
      title="삭제"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
// 1. Import 구문
import type { Notification } from '@/types/notification/notification.types';

// 2. Props 정의
/**
 * Props
 * @property {Notification} notification - 표시할 알림 객체
 */
const props = defineProps<{
  notification: Notification;
}>();

// 3. Emits 정의
/**
 * Emits
 * @event click - 알림 아이템 클릭 시 상세 페이지 이동
 * @event delete - 알림 삭제 버튼 클릭
 * @event action - 액션 버튼 클릭 (관련 페이지 이동)
 */
const emit = defineEmits<{
  click: [notification: Notification];     // 알림 아이템 클릭 시 상세 페이지 이동
  delete: [id: number];                    // 알림 삭제 버튼 클릭
  action: [notification: Notification];    // 액션 버튼 클릭 (관련 페이지 이동)
}>();

// 4. 메소드
/**
 * 알림 아이템 클릭 핸들러
 * - 부모 컴포넌트로 click 이벤트 발행
 */
const handleClick = (): void => {
  emit('click', props.notification);
};

/**
 * 삭제 버튼 클릭 핸들러
 * - 이벤트 전파 방지 (알림 클릭 이벤트 발생 안 함)
 * - 부모 컴포넌트로 delete 이벤트 발행
 * @param {Event} event - 클릭 이벤트 객체
 */
const handleDeleteClick = (event: Event): void => {
  event.stopPropagation(); // 이벤트 전파 방지
  emit('delete', props.notification.id);
};

/**
 * 액션 버튼 클릭 핸들러
 * - 이벤트 전파 방지 (알림 클릭 이벤트 발생 안 함)
 * - 부모 컴포넌트로 action 이벤트 발행
 * @param {Event} event - 클릭 이벤트 객체
 */
const handleActionClick = (event: Event): void => {
  event.stopPropagation(); // 이벤트 전파 방지
  emit('action', props.notification);
};

/**
 * 알림 타입에 따른 아이콘 경로 반환
 * 
 * @param type - 알림 카테고리
 * @returns SVG 아이콘 경로
 */
const getIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'attendance': '/images/alarm/alarm-check.svg',      // 근태
    'payroll': '/images/alarm/alarm-money.svg',         // 급여
    'approval': '/images/alarm/alarm-paper.svg',        // 결재
    'leave': '/images/alarm/alarm-calendar.svg',        // 휴가
    'evaluation': '/images/alarm/alarm-paper.svg',      // 평가
    'system': '/images/alarm/alarmsetting.svg'          // 시스템
  };
  
  return iconMap[type] || '/images/alarm/alarmsetting.svg';  // 기본값
};
</script>

<style scoped>
/* 알림 아이템 컨테이너 */
.notification-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  border-left: 4px solid transparent;
}

/* 호버 효과 */
.notification-item:hover {
  background: #f8fafc;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 읽지 않은 알림 스타일 */
.notification-item.unread {
  border-left-color: #3b82f6;
  background: #f0f7ff;
}

/* 아이콘 영역 */
.icon {
  font-size: 32px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
}

/* 내용 영역 */
.content {
  flex: 1;
  min-width: 0; /* 텍스트 오버플로우 처리를 위해 */
}

/* 제목 */
.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1e293b;
  line-height: 1.4;
}

/* 설명 */
.description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 2줄까지만 표시 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 시간 */
.time {
  font-size: 12px;
  color: #94a3b8;
}

/* 액션 버튼 */
.action-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn:active {
  transform: translateY(0);
}

/* 삭제 버튼 */
.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ===== 반응형 디자인 ===== */
/* 모바일 */
@media (max-width: 768px) {
  .notification-item {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }

  .icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }

  .title {
    font-size: 14px;
  }

  .description {
    font-size: 13px;
  }

  .action-btn {
    width: 100%;
    order: 4; /* 하단으로 이동 */
  }

  .delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}
</style>