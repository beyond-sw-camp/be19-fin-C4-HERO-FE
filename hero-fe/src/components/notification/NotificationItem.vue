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
  2025/12/16 (혜원) Notification 타입 맞춤 수정, 링크 버튼 추가
  </pre>

  @author 혜원
  @version 2.2
-->

<template>
  <!-- 알림 아이템 최상위 컨테이너 -->
  <div 
    class="notification-item"
    :class="{ 'unread': !notification.isRead }"
  >
    <!-- 알림 헤더 영역 (클릭 가능) -->
    <div class="notification-header" @click="handleClick">
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
        
        <!-- 상대 시간 표시 (예: 방금 전, 3분 전) -->
        <span class="time">{{ notification.timeAgo }}</span>
      </div>

      <!-- 삭제 버튼 (우측 상단 고정) -->
      <button 
        class="delete-btn"
        @click.stop="handleDeleteClick"
        title="삭제"
      >
        ✕
      </button>
      
      <!-- 링크 버튼 영역 (link가 있을 때만 표시) -->
      <div v-if="notification.link" class="notification-footer">
        <button 
          class="link-btn"
          @click.stop="handleLinkClick"
        >
        {{ getLinkText(notification.type) }}
      </button>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Import 구문 
import { useRouter } from 'vue-router';
import type { Notification, NotificationCategory } from '@/types/notification/notification.types';

// 2. Composables
/**
 * Vue Router 인스턴스
 * 페이지 이동에 사용
 */
const router = useRouter();

// 3. Props 정의
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

// 4. Emits 정의
/**
 * 컴포넌트 이벤트 정의
 * 
 * @event click - 알림 아이템 클릭 시 발생
 *                부모 컴포넌트에서 읽음 처리 및 상세 로직 실행
 *                @param {Notification} notification - 클릭된 알림 객체
 * 
 * @event delete - 삭제 버튼 클릭 시 발생
 *                 부모 컴포넌트에서 소프트 삭제 처리
 *                 @param {number} id - 삭제할 알림 ID
 */
const emit = defineEmits<{
  click: [notification: Notification];
  delete: [id: number];
}>();

// 5. 이벤트 핸들러 

/**
 * 알림 아이템 클릭 핸들러
 * 
 * @description
 * 알림 헤더 영역(아이콘 + 내용)을 클릭했을 때 실행
 * 부모 컴포넌트로 click 이벤트를 발행하여 읽음 처리 요청
 * 
 * @fires click - 알림 클릭 이벤트 발행
 * @returns {void}
 */
const handleClick = (): void => {
  emit('click', props.notification);
};

/**
 * 삭제 버튼 클릭 핸들러
 * 
 * @description
 * 우측 상단 X 버튼 클릭 시 실행
 * 이벤트 전파를 중단하여 알림 클릭 이벤트가 발생하지 않도록 함
 * 부모 컴포넌트로 delete 이벤트를 발행하여 소프트 삭제 요청
 * 
 * @param {Event} event - 클릭 이벤트 객체
 * @fires delete - 알림 삭제 이벤트 발행
 * @returns {void}
 */
const handleDeleteClick = (event: Event): void => {
  event.stopPropagation(); // 부모 요소로 이벤트 전파 방지 (핵심!)
  emit('delete', props.notification.notificationId);
};

/**
 * 링크 버튼 클릭 핸들러
 * 
 * @description
 * 하단의 "명세서 보기", "결재 상세보기" 등의 버튼 클릭 시 실행
 * 1. 알림을 읽음 처리 (click 이벤트 발행)
 * 2. 관련 페이지로 이동 (router.push)
 * 
 * @fires click - 읽음 처리를 위한 클릭 이벤트 발행
 * @returns {void}
 */
const handleLinkClick = (): void => {
  if (props.notification.link) {
    // 1. 읽음 처리 요청 (부모 컴포넌트에 위임)
    emit('click', props.notification);
    
    // 2. 페이지 이동
    router.push(props.notification.link);
  }
};

// 6. 헬퍼 함수 (비즈니스 로직)

/**
 * 알림 타입에 따른 아이콘 경로 반환
 * 
 * @description
 * 알림 카테고리별로 다른 아이콘을 표시하기 위한 경로 매핑
 * 
 * 아이콘 종류:
 * - attendance: 근태 (체크 아이콘)
 * - payroll: 급여 (돈 아이콘)
 * - approval: 결재 (문서 아이콘)
 * - leave: 휴가 (달력 아이콘)
 * - evaluation: 평가 (문서 아이콘)
 * - system: 시스템 (설정 아이콘)
 * 
 * @param {string} type - 알림 카테고리 타입
 * @returns {string} 아이콘 이미지 경로
 */
const getIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'attendance': '/images/alarm/alarm-check.svg',
    'payroll': '/images/alarm/alarm-money.svg',
    'approval': '/images/alarm/alarm-paper.svg',
    'leave': '/images/alarm/alarm-calendar.svg',
    'evaluation': '/images/alarm/alarm-paper.svg',
    'system': '/images/alarm/alarmsetting.svg'
  };
  
  return iconMap[type] || '/images/alarm/alarmsetting.svg';
};

/**
 * 알림 타입에 따른 링크 버튼 텍스트 반환
 * 
 * @description
 * 알림 카테고리별로 다른 버튼 텍스트를 표시하기 위한 매핑
 * 
 * 버튼 텍스트 종류:
 * - attendance: '근태 확인하기'
 * - payroll: '명세서 보기'
 * - approval: '결재 상세보기'
 * - leave: '휴가 확인하기'
 * - evaluation: '평가 보기'
 * - system: '자세히 보기'
 * 
 * @param {NotificationCategory} type - 알림 카테고리 타입
 * @returns {string} 버튼에 표시될 텍스트
 * 
 * @example
 * getLinkText('payroll') // returns '명세서 보기'
 * getLinkText('approval') // returns '결재 상세보기'
 */
const getLinkText = (type: NotificationCategory): string => {
  const linkTextMap: Record<NotificationCategory, string> = {
    'attendance': '근태 확인하기',
    'payroll': '명세서 보기',
    'approval': '결재 상세보기',
    'leave': '휴가 확인하기',
    'evaluation': '평가 보기',
    'system': '자세히 보기'
  };
  
  return linkTextMap[type] || '자세히 보기';
};
</script>

<style scoped>
/**
 * 알림 아이템 최상위 컨테이너
 */
.notification-item {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 12px;
  border-left: 4px solid transparent; /* 읽음 상태 구분용 */
  overflow: hidden;
}

/**
 * 읽지 않은 알림 시각적 강조
 */
.notification-item.unread {
  background: #EFF6FF !important;
  border-left: 4px solid #3B82F6;
}

.notification-item.unread .title {
  font-weight: 700;
  color: #1E40AF;
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
  cursor: pointer;
  position: relative; /* 삭제 버튼 절대 위치의 기준점 */
}

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
  padding-right: 32px;
}

/**
 * 알림 제목
 */
.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1e293b;
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

/**
 * 상대 시간 표시
 * - 예: "방금 전", "3분 전"
 */
.time {
  font-size: 12px;
  color: #94a3b8;
}

/**
 * 삭제 버튼 (우측 상단 고정)
 * - 클릭 시: 이벤트 전파 중단 (stopPropagation)
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
 * 링크 버튼 컨테이너
 */
.notification-footer {
  margin-top: 20px;
  padding: 0 16px 16px 16px;
  border-top: 1px solid #F1F5F9;
  padding-top: 12px;
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

.link-btn:hover {
  background: #3B82F6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/**
 * 읽지 않은 알림의 링크 버튼 스타일
 */
.notification-item.unread .link-btn {
  background: #DBEAFE;
  border-color: #3B82F6;
  color: #1E40AF;
  font-weight: 600;
}

.notification-item.unread .link-btn:hover {
  background: #3B82F6;
  color: white;
}

/* 반응형 스타일  */
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

  .notification-footer {
    padding: 0 12px 12px 12px;
  }
}
</style>