<!--
  <pre>
  File Name   : NotificationHeader.vue
  Description : 알림 페이지 헤더 컴포넌트
                - 뒤로가기 버튼
                - 페이지 제목 (알림)
                - 읽지 않은 알림 개수 뱃지
                - 설정 버튼
  
  History
  2025/12/09 (혜원) 최초 작성 
  </pre>

  @author 혜원
  @version 1.0
-->

<template>
  <!-- 헤더 영역 -->
  <div class="header">
    <div class="header-content">
      <!-- 헤더 왼쪽: 뒤로가기, 제목, 읽지 않은 알림 개수 -->
      <div class="header-left">
        <!-- 뒤로가기 버튼 -->
        <div class="back-button" @click="$emit('back')">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 페이지 제목 -->
        <h1 class="title">알림</h1>
        
        <!-- 읽지 않은 알림 개수 뱃지 -->
        <span class="unread-count" v-if="unreadCount > 0">{{ unreadCount }}</span>
      </div>
      
      <!-- 헤더 오른쪽: 설정 버튼 -->
      <div class="header-actions">
        <button class="icon-button" @click="$emit('settings')">
          <img src="/images/alarm/alarmsetting.svg" alt="설정" class="icon-img" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. Props 정의
/**
 * Props
 * @property {number} unreadCount - 읽지 않은 알림 개수
 */
const props = defineProps({
  unreadCount: {
    type: Number,
    default: 0
  }
});

// 2. Emits 정의
/**
 * Emits
 * @event back - 뒤로가기 버튼 클릭
 * @event settings - 설정 버튼 클릭
 */
const emit = defineEmits(['back', 'settings']);
</script>

<style scoped>
/* ===== 헤더 영역 ===== */
.header {
  background: white;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  height: 55px;
  margin: 0 auto;
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 뒤로가기 버튼 */
.back-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.back-button:hover {
  color: #1E40AF;
  transform: translateX(-2px);
}

.back-button svg {
  width: 100%;
  height: 100%;
}

/* 페이지 제목 */
.title {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.02em;
}

/* 읽지 않은 알림 개수 뱃지 */
.unread-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* 헤더 액션 버튼 */
.header-actions {
  display: flex;
  gap: 12px;
}

.icon-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-button:hover {
  background: #E2E8F0;
}

.icon-img {
  width: 20px;
  height: 20px;
}

/* ===== 반응형 디자인 ===== */
/* 모바일 */
@media (max-width: 768px) {
  .header-content {
    padding: 16px 20px;
  }

  .title {
    font-size: 18px;
  }
}
</style>