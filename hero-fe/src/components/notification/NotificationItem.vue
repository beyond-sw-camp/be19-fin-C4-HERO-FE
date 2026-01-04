<!--
  <pre>
  Vue Name: NotificationItem.vue
  Description: 알림 아이템 컴포넌트
                - 알림 타입별 아이콘 표시
                - 읽음/안 읽음 상태 스타일 구분
                - 링크 버튼 클릭 시 관련 페이지 이동
                - 삭제 버튼 제공

  History
  2025/12/09 (혜원) 최초작성
  2025/12/14 (혜원) TypeScript 변환 및 타입 정의
  2025/12/16 (혜원) Notification 타입 맞춤 수정, 링크 버튼 추가
  2026/01/04 (혜원) 알림 디자인 수정
  2026/01/04 (혜원) 아이템 클릭 제거, 버튼만 클릭 가능하도록 수정
  </pre>

  @author 혜원
  @version 2.3
-->

<template>
  <!-- 알림 아이템 최상위 컨테이너 (클릭 불가) -->
  <div
    class="notification-item"
    :class="{ unread: !notification.isRead }"
  >
    <!-- 알림 헤더 영역 (클릭 불가로 변경) -->
    <div class="notification-header">
      <!-- 알림 타입 아이콘 -->
      <img
        :src="getIcon(notification.type)"
        :alt="`${notification.type} 아이콘`"
        class="notification-icon"
      />

      <!-- 알림 내용 영역 -->
      <div class="content">
        <!-- 알림 제목 -->
        <h3 class="title">{{ notification.title }}</h3>

        <!-- 알림 메시지 (2줄 말줄임) -->
        <p class="description">{{ notification.message }}</p>

        <!-- 시간 + 링크버튼을 같은 줄로 -->
        <div class="meta-row">
          <span class="time">{{ notification.timeAgo }}</span>

          <!-- 원래 있던 링크 버튼 로직 유지 (link 있을 때만) -->
          <button
            v-if="notification.link"
            class="link-btn inline"
            type="button"
            @click.stop="handleViewClick"
          >
            {{ getLinkText(notification.type) }}
          </button>
        </div>
      </div>

      <!-- 삭제 버튼 (우측 상단 고정) -->
      <button
        class="delete-btn"
        type="button"
        @click.stop="handleDeleteClick"
        title="삭제"
      >
        ✕
      </button>

      <!-- 링크 버튼 영역 (link가 있을 때만 표시) -->
      <!-- 기존 구조는 남겨두되, '같은 줄' 요구사항 때문에 실제 버튼은 meta-row에 배치 -->
      <div v-if="notification.link" class="notification-footer">
        <!-- (기존 자리 유지용 / 필요하면 여기 스타일로 다른 액션 넣어도 됨) -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Import 구문
import type { Notification, NotificationCategory } from '@/types/notification/notification.types';

// 2. Props 정의
/**
 * 컴포넌트 Props
 *
 * @property {Notification} notification - 표시할 알림 데이터 객체
 * @property {number} notification.notificationId - 알림 고유 ID
 * @property {string} notification.title - 알림 제목
 * @property {string} notification.message - 알림 내용
 * @property {string} notification.timeAgo - 상대 시간 (예: 방금 전)
 * @property {boolean} notification.isRead - 읽음 여부
 * @property {string | null} notification.link - 이동할 링크 (없으면 null)
 * @property {NotificationCategory} notification.type - 알림 카테고리
 */
const props = defineProps<{
  notification: Notification;
}>();

// 3. Emits 정의
/**
 * 컴포넌트 이벤트 정의
 *
 * @event view - 상세 보기 버튼 클릭 시 발생
 *               부모 컴포넌트에서 읽음 처리 및 페이지 이동 처리
 *               @param {Notification} notification - 클릭된 알림 객체
 *
 * @event delete - 삭제 버튼 클릭 시 발생
 *                 부모 컴포넌트에서 소프트 삭제 처리
 *                 @param {number} id - 삭제할 알림 ID
 */
const emit = defineEmits<{
  view: [notification: Notification];
  delete: [id: number];
}>();

// 4. 이벤트 핸들러

/**
 * 상세 보기 버튼 클릭 핸들러
 */
const handleViewClick = (): void => {
  emit('view', props.notification);
};

/**
 * 삭제 버튼 클릭 핸들러
 */
const handleDeleteClick = (): void => {
  emit('delete', props.notification.notificationId);
};

// 5. 헬퍼 함수 (비즈니스 로직)

/**
 * 알림 타입에 따른 아이콘 경로 반환
 */
const getIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    attendance: '/images/alarm/alarm-check.svg',
    payroll: '/images/alarm/alarm-money.svg',
    approval: '/images/alarm/alarm-paper.svg',
    evaluation: '/images/alarm/alarm-paper.svg',
    system: '/images/alarm/alarmsetting.svg',
  };

  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};

/**
 * 알림 타입에 따른 링크 버튼 텍스트 반환
 */
const getLinkText = (type: NotificationCategory): string => {
  const linkTextMap: Record<NotificationCategory, string> = {
    attendance: '근태 확인하기',
    payroll: '명세서 보기',
    approval: '결재 상세보기',
    evaluation: '평가 보기',
    system: '자세히 보기',
  };

  return linkTextMap[type] || '자세히 보기';
};
</script>

<style scoped>
/**
 * 알림 아이템 최상위 컨테이너
 */
.notification-item {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #EFF6FF; /* 카드 배경 통일 */
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: default; /* 클릭 불가능 표시 */
}

/* 공통 띠 */
.notification-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;          /* 항상 동일 */
  height: 100%;
  background: #CBD5E1; /* 읽음 = 회색 */
}

/* 안 읽은 알림 */
.notification-item.unread::before {
  background: #3B82F6; /* 안 읽음 = 파랑 */
}

.notification-item.unread .title {
  font-weight: 700;
  color: #1E40AF;
}

.notification-item .title {
  color: #1E293B;
}

/**
 * 읽지 않은 알림 시각적 강조
 */
.notification-item.unread {
  background: #EFF6FF !important;
}

.notification-item.unread .description {
  color: #1E293B;
}

/**
 * 알림 헤더 (아이콘 + 내용 + 삭제 버튼)
 */
.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  position: relative;
  cursor: default; /* 클릭 불가능 */
}

/* 호버 효과는 유지 (시각적 피드백) */
.notification-header:hover {
  background: rgba(0, 0, 0, 0.02);
}

/**
 * 알림 타입 아이콘
 */
.notification-icon {
  margin-top: 5px;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/**
 * 알림 내용 컨테이너
 */
.content {
  flex: 1;
  min-width: 0;
  padding-right: 52px; /* 삭제 버튼이랑 겹침 방지(기존 32px -> 52px) */
}

/**
 * 알림 제목
 */
.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

/**
 * 알림 메시지
 */
.description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 시간 + 링크버튼 같은 줄 */
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/**
 * 상대 시간 표시
 */
.time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

/**
 * 삭제 버튼 (우측 상단 고정)
 */
.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #FEE2E2;
  color: #EF4444;
}

/**
 * 링크 버튼 컨테이너 (기존 유지)
 */
.notification-footer {
  margin-top: 20px;
  padding: 0 16px 16px 16px;
  border-top: 1px solid #F1F5F9;
  padding-top: 12px;
  display: none; /* "같은 줄"로 올렸으니 화면에는 안 보이게(구조는 유지) */
}

/**
 * 링크 버튼 (명세서 보기, 결재 상세보기 등)
 */
.link-btn {
  width: 100%;
  padding: 10px 16px;
  background: white;
  color: #3B82F6;
  border: 1px solid #3B82F6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* 같은 줄에서 쓰는 버튼은 width 100%면 깨져서 override */
.link-btn.inline {
  width: auto;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.link-btn:hover {
  background: #3B82F6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/**
 * 읽지 않은 알림의 링크 버튼 스타일
 */
.notification-item.unread .link-btn.inline {
  background: #DBEAFE;
  border-color: #3B82F6;
  color: #1E40AF;
}

.notification-item.unread .link-btn.inline:hover {
  background: #3B82F6;
  color: white;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .notification-header {
    gap: 12px;
    padding: 12px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }

  .title {
    font-size: 14px;
  }

  .description {
    font-size: 13px;
  }

  .delete-btn {
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .link-btn.inline {
    width: 100%;
  }
}
</style>