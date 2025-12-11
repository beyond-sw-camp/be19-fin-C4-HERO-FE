<!--
  <pre>
  File Name   : NotificationItem.vue
  Description : 알림 개별 아이템 컴포넌트
                - 알림 유형별 아이콘, 제목, 설명, 메타 정보 표시
                - NEW 배지로 읽지 않은 알림 강조
                - 삭제 버튼 (읽은 알림만 표시)
                - 액션 버튼으로 관련 페이지 이동
                - 클릭 시 알림 상세 페이지로 이동

  History
  2025/12/09 (혜원) 최초 작성
  </pre>

  @author 혜원
  @version 1.0
-->

<template>
  <!-- 알림 아이템 카드 (새 알림일 경우 is-new 클래스 추가) -->
  <div
    :class="['notification-item', { 'is-new': notification.isNew }]"
    @click="$emit('click', notification)"
  >
    <!-- 알림 유형 아이콘 -->
    <div class="notification-icon">
      <img :src="iconPath" :alt="notification.type" />
    </div>

    <!-- 알림 내용 영역 -->
    <div class="notification-content">
      <!-- 헤더: 제목, NEW 배지, 삭제 버튼 -->
      <div class="content-header">
        <div class="title-wrapper">
          <!-- 알림 제목 -->
          <h3 class="notification-title">{{ notification.title }}</h3>
          <!-- NEW 배지 (새 알림만 표시) -->
          <span v-if="notification.isNew" class="new-badge">NEW</span>
        </div>
        <!-- 삭제 버튼 (읽은 알림만 표시) -->
        <button 
          v-if="!notification.isNew" 
          class="delete-button"
          @click.stop="$emit('delete', notification.id)"
        >
          ✕
        </button>
      </div>

      <!-- 알림 설명 텍스트 -->
      <p class="notification-description">{{ notification.description }}</p>

      <!-- 푸터: 메타 정보 + 액션 버튼 -->
      <div class="notification-footer">
        <!-- 메타 정보: 시간 경과, 날짜 -->
        <div class="meta-info">
          <!-- 시간 경과 표시 -->
          <div class="meta-item">
            <img src="/images/alarm/alarm-time.svg" alt="time" />
            <span>{{ notification.timeAgo }}</span>
          </div>
          <div class="meta-divider">•</div>
          <!-- 날짜 표시 -->
          <div class="meta-item">
            <img src="/images/alarm/alarm-calendar.svg" alt="date" />
            <span>{{ notification.date }}</span>
          </div>
        </div>

        <!-- 액션 버튼 (action이 있는 경우만 표시) -->
        <button 
          v-if="notification.action" 
          class="action-button"
          @click.stop="$emit('action', notification)"
        >
          {{ notification.action }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 1. Import 구문
import { computed } from 'vue';

// 2. 타입 정의
/**
 * 알림 객체 타입 정의
 * @property {number} id - 알림 고유 ID
 * @property {string} type - 알림 유형 (approval, leave, evaluation, attendance, payroll, system)
 * @property {string} title - 알림 제목
 * @property {string} description - 알림 상세 설명
 * @property {boolean} isNew - 읽지 않은 알림 여부
 * @property {string} timeAgo - 알림 발생 시간 (상대 시간)
 * @property {string} date - 알림 발생 날짜
 * @property {string} action - 액션 버튼 텍스트 (선택적)
 */
interface Notification {
  id: number;
  type: 'approval' | 'leave' | 'evaluation' | 'attendance' | 'payroll' | 'system';
  title: string;
  description: string;
  isNew: boolean;
  timeAgo: string;
  date: string;
  action?: string;
}

// 3. Props 정의
/**
 * Props
 * @property {Notification} notification - 표시할 알림 객체
 */
const props = defineProps<{
  notification: Notification;
}>();

// 4. Emits 정의
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

// 5. Computed 속성
/**
 * 알림 유형별 아이콘 경로를 반환
 * - approval: 결재 알림 (체크 아이콘)
 * - leave: 휴가 알림 (캘린더 아이콘)
 * - evaluation: 평가 알림 (문서 아이콘)
 * - attendance: 근태 알림 (시계 아이콘)
 * - payroll: 급여 알림 (돈 아이콘)
 * - system: 시스템 알림 (문서 아이콘)
 * @returns {string} 아이콘 이미지 경로
 */
const iconPath = computed<string>(() => {
  // 알림 유형별 아이콘 매핑
  const iconMap: Record<Notification['type'], string> = {
    approval: '/images/alarm/alarm-check.svg',      // 결재 알림
    leave: '/images/alarm/alarm-calendar.svg',      // 휴가 알림
    evaluation: '/images/alarm/alarm-paper.svg',    // 평가 알림
    attendance: '/images/alarm/alarm-time.svg',     // 근태 알림
    payroll: '/images/alarm/alarm-money.svg',       // 급여 알림
    system: '/images/alarm/alarm-paper.svg'         // 시스템 알림
  };
  
  // 매핑된 아이콘이 없으면 기본 아이콘 반환
  return iconMap[props.notification.type] || '/images/alarm/alarm-paper.svg';
});
</script>

<style scoped>
/* 알림 아이템 카드 */
.notification-item {
  display: flex;
  height: 180px;
  gap: 20px;
  padding: 24px;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

/* 알림 아이템 호버 효과 */
.notification-item:hover {
  border-color: #CBD5E1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

/* 새 알림 강조 스타일 (왼쪽 파란색 테두리 + 배경 그라데이션) */
.notification-item.is-new {
  border-left: 4px solid #1E40AF;
  background: linear-gradient(to right, #EFF6FF 0%, white 100%);
}

/* 새 알림 호버 효과 */
.notification-item.is-new:hover {
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.1);
}

/* 알림 아이콘 */
.notification-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #DBEAFE;
  border-radius: 12px;
}

.notification-icon img {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

/* 알림 내용 영역 */
.notification-content {
  flex: 1;
  min-width: 0; /* flex 아이템 텍스트 오버플로우 방지 */
}

/* 헤더: 제목 + 배지 + 삭제 버튼 */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 16px;
}

/* 제목과 배지를 감싸는 래퍼 */
.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* 알림 제목 */
.notification-title {
  font-size: 17px;
  font-weight: 600;
  color: #0F172A;
  line-height: 1.4;
}

/* NEW 배지 */
.new-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

/* 알림 설명 텍스트 */
.notification-description {
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 16px;
}

/* 푸터: 메타 정보 + 액션 버튼 */
.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* 메타 정보 컨테이너 (시간, 날짜) */
.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #94A3B8;
  font-size: 14px;
}

/* 개별 메타 아이템 */
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item img {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

/* 메타 정보 구분자 */
.meta-divider {
  color: #CBD5E1;
}

/* 버튼 스타일 */
/* 액션 버튼 (예: "결재 처리 →", "상세 보기 →") */
.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3);
}

/* 액션 버튼 호버 효과 */
.action-button:hover {
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4);
  transform: translateY(-1px);
}

/* 삭제 버튼 (읽은 알림만 표시) */
.delete-button {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #94A3B8;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

/* 삭제 버튼 호버 효과 */
.delete-button:hover {
  background: #FEE2E2;
  color: #EF4444;
  transform: scale(1.1);
}

/* 반응형 디자인 */
/* 모바일 (768px 이하) */
@media (max-width: 768px) {
  /* 세로 레이아웃으로 변경 */
  .notification-item {
    flex-direction: column;
    gap: 16px;
  }

  /* 아이콘을 왼쪽 정렬 */
  .notification-icon {
    align-self: flex-start;
  }

  /* 푸터를 세로 배치 */
  .notification-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  /* 메타 정보 왼쪽 정렬 */
  .meta-info {
    justify-content: flex-start;
  }

  /* 액션 버튼 전체 너비 */
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>