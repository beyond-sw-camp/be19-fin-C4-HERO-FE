<!-- 
  Vue Name: NotificationDetail
  Description: 알림 상세 페이지 - 개별 알림의 상세 정보 표시 및 액션 처리
  
  History
  2024/12/15 (혜원) 최초 작성
  
  Author: 혜원
  Version: 1.0
-->

<template>
  <div class="notification-detail-page">
    <!-- 헤더영역 -->
    <div class="header">
      <div class="header-content">
        <!-- 뒤로가기 버튼 -->
        <button class="back-button" @click="goBack">
          <img src="@/images/arrow.svg" alt="뒤로가기 아이콘" />
          <span>알림 목록</span>
        </button>

        <!-- 더보기 메뉴 -->
        <!-- 추후 수정 -->
        <button class="icon-button" @click="toggleMenu">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="5" r="1" fill="currentColor"/>
            <circle cx="12" cy="19" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 컨텐츠 영역 -->
    <div class="content-wrapper">
      <div class="content-container">
        <!-- 알림 헤더 -->
        <div class="notification-header">
          <!-- 알림 타입 아이콘 및 배지 -->
          <div class="header-top">
            <div :class="['notification-icon', `icon-${notification.type}`]">
              <!-- 결재 아이콘 -->
              <svg v-if="notification.type === 'approval'" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              
              <!-- 휴가 아이콘 -->
              <svg v-else-if="notification.type === 'leave'" viewBox="0 0 24 24" fill="none">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              
              <!-- 평가 아이콘 -->
              <svg v-else-if="notification.type === 'evaluation'" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              
              <!-- 근태 아이콘 -->
              <svg v-else-if="notification.type === 'attendance'" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              
              <!-- 급여 아이콘 -->
              <svg v-else-if="notification.type === 'payroll'" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              
              <!-- 기본 아이콘 -->
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <span :class="['type-badge', `badge-${notification.type}`]">
              {{ getTypeLabel(notification.type) }}
            </span>
          </div>

          <!-- 제목 -->
          <h1 class="notification-title">{{ notification.title }}</h1>

          <!-- 메타 정보 -->
          <div class="meta-info">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ notification.fullDate }}</span>
            </div>
            <div class="meta-divider">•</div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ notification.sender }}</span>
            </div>
          </div>
        </div>

        <!-- 알림 내용 -->
        <div class="notification-body">
          <div class="section">
            <h2 class="section-title">알림 내용</h2>
            <div class="description-box">
              <p>{{ notification.description }}</p>
            </div>
          </div>

          <!-- 상세 정보 -->
          <div class="section" v-if="notification.details">
            <h2 class="section-title">상세 정보</h2>
            <div class="detail-grid">
              <div 
                v-for="(detail, index) in notification.details" 
                :key="index"
                class="detail-item"
              >
                <span class="detail-label">{{ detail.label }}</span>
                <span class="detail-value">{{ detail.value }}</span>
              </div>
            </div>
          </div>

          <!-- 첨부 파일 -->
          <div class="section" v-if="notification.attachments && notification.attachments.length > 0">
            <h2 class="section-title">첨부 파일</h2>
            <div class="attachment-list">
              <div 
                v-for="(file, index) in notification.attachments" 
                :key="index"
                class="attachment-item"
              >
                <div class="file-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ file.size }}</span>
                </div>
                <button class="download-button">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 관련 링크 -->
          <div class="section" v-if="notification.relatedLink">
            <h2 class="section-title">관련 정보</h2>
            <div class="related-link-box" @click="goToRelatedPage">
              <div class="link-content">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997M14 11C13.5705 10.4258 13.0226 9.95078 12.3934 9.60703C11.7642 9.26327 11.0685 9.05885 10.3533 9.00763C9.63819 8.95641 8.92037 9.0596 8.24861 9.31018C7.57685 9.56077 6.96684 9.9529 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="link-text">
                  <span class="link-title">{{ notification.relatedLink.title }}</span>
                  <span class="link-url">{{ notification.relatedLink.url }}</span>
                </div>
              </div>
              <svg class="arrow-icon" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 영역 -->
        <div class="action-section" v-if="notification.actions && notification.actions.length > 0">
          <button 
            v-for="(action, index) in notification.actions"
            :key="index"
            :class="['action-button', action.type]"
            @click="handleAction(action)"
          >
            <svg v-if="action.icon === 'check'" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="action.icon === 'x'" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="action.icon === 'eye'" viewBox="0 0 24 24" fill="none">
              <path d="M1 12S5 4 12 4C19 4 23 12 23 12S19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 알림 데이터 (실제로는 API에서 가져오거나 route params로 전달받음)
const notification = ref({
  id: 1,
  type: 'approval',
  title: '2025년 1월 비용 결산 건 결재 요청',
  description: '2025년 1월 비용 결산 건에 대한 결재가 요청되었습니다. 총 결산 금액은 15,500,000원이며, 상세 내역을 확인하신 후 결재 진행 부탁드립니다.',
  sender: '김민수 과장',
  fullDate: '2025년 12월 02일 14:35',
  details: [
    { label: '결재 번호', value: 'AP-2025-0102-001' },
    { label: '결재 종류', value: '비용 결산' },
    { label: '요청 부서', value: '재무팀' },
    { label: '총 금액', value: '15,500,000원' },
    { label: '결재 기한', value: '2025년 12월 05일' },
    { label: '긴급도', value: '보통' }
  ],
  attachments: [
    { name: '2025년_1월_비용결산_내역서.xlsx', size: '245 KB' },
    { name: '증빙자료_영수증.pdf', size: '1.2 MB' }
  ],
  relatedLink: {
    title: '결재 상세 페이지로 이동',
    url: '/approval/detail/AP-2025-0102-001'
  },
  actions: [
    { label: '승인', type: 'primary', icon: 'check', action: 'approve' },
    { label: '반려', type: 'danger', icon: 'x', action: 'reject' },
    { label: '상세 보기', type: 'secondary', icon: 'eye', action: 'view' }
  ]
});

// 컴포넌트 마운트 시 알림 데이터 로드
onMounted(() => {
  loadNotificationDetail();
});

// 알림 상세 데이터 로드
const loadNotificationDetail = () => {
  const notificationId = route.params.id;
  // TODO: API 호출하여 알림 상세 데이터 가져오기
  console.log('Loading notification detail for ID:', notificationId);
};

// 알림 타입에 따른 라벨 반환
const getTypeLabel = (type) => {
  const typeLabels = {
    approval: '결재',
    leave: '휴가',
    evaluation: '평가',
    attendance: '근태',
    payroll: '급여',
    system: '시스템'
  };
  return typeLabels[type] || '알림';
};

// 뒤로가기
const goBack = () => {
  router.back();
};

// 더보기 메뉴 토글
const toggleMenu = () => {
  console.log('Toggle menu');
  // TODO: 메뉴 표시/숨김 구현
};

// 관련 페이지로 이동
const goToRelatedPage = () => {
  if (notification.value.relatedLink) {
    router.push(notification.value.relatedLink.url);
  }
};

// 액션 처리
const handleAction = (action) => {
  console.log('Action clicked:', action);
  // TODO: 액션에 따른 처리 구현
  if (action.action === 'approve') {
    // 승인 처리
  } else if (action.action === 'reject') {
    // 반려 처리
  } else if (action.action === 'view') {
    // 상세 보기
    goToRelatedPage();
  }
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
.notification-detail-page {
  width: 100%;
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* ========== 헤더 스타일 ========== */
.header {
  background: white;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  height: 64px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 뒤로가기 버튼 */
.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #64748B;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
}

.back-button:hover {
  background: #F1F5F9;
  color: #1E40AF;
}

.back-button svg {
  width: 20px;
  height: 20px;
}

/* 아이콘 버튼 */
.icon-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border: none;
  border-radius: 10px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-button:hover {
  background: #E2E8F0;
  color: #334155;
}

.icon-button svg {
  width: 20px;
  height: 20px;
}

/* ========== 컨텐츠 영역 ========== */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}

.content-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

/* 알림 헤더 */
.notification-header {
  padding: 40px;
  border-bottom: 1px solid #E2E8F0;
  background: linear-gradient(to bottom, #FAFBFC 0%, white 100%);
}

.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

/* 알림 아이콘 */
.notification-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: white;
}

.notification-icon svg {
  width: 28px;
  height: 28px;
}

/* 알림 타입별 아이콘 색상 */
.icon-approval {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.icon-leave {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.icon-evaluation {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

.icon-attendance {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.icon-payroll {
  background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
}

.icon-system {
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
  box-shadow: 0 4px 16px rgba(107, 114, 128, 0.3);
}

/* 타입 뱃지 */
.type-badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.badge-approval {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.badge-leave {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.badge-evaluation {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.badge-attendance {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.badge-payroll {
  background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
}

.badge-system {
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
}

/* 알림 제목 */
.notification-title {
  font-size: 28px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.3;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

/* 메타 정보 */
.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748B;
  font-size: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item svg {
  width: 18px;
  height: 18px;
}

.meta-divider {
  color: #CBD5E1;
}

/* ========== 알림 본문 ========== */
.notification-body {
  padding: 40px;
}

/* 섹션 */
.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 16px;
}

/* 설명 박스 */
.description-box {
  padding: 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.description-box p {
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
}

/* 상세 정보 그리드 */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  padding: 16px 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

.detail-value {
  font-size: 15px;
  color: #0F172A;
  font-weight: 600;
}

/* 첨부 파일 목록 */
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  transition: all 0.2s;
}

.attachment-item:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  color: #64748B;
}

.file-icon svg {
  width: 20px;
  height: 20px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  color: #0F172A;
  font-weight: 500;
}

.file-size {
  font-size: 13px;
  color: #94A3B8;
}

.download-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.download-button:hover {
  background: #1E40AF;
  border-color: #1E40AF;
  color: white;
}

.download-button svg {
  width: 18px;
  height: 18px;
}

/* 관련 링크 박스 */
.related-link-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-link-box:hover {
  background: #EFF6FF;
  border-color: #1E40AF;
}

.link-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.link-content > svg {
  width: 24px;
  height: 24px;
  color: #1E40AF;
}

.link-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.link-title {
  font-size: 15px;
  color: #0F172A;
  font-weight: 600;
}

.link-url {
  font-size: 13px;
  color: #64748B;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: #94A3B8;
}

/* ========== 액션 버튼 영역 ========== */
.action-section {
  padding: 24px 40px;
  border-top: 1px solid #E2E8F0;
  background: #FAFBFC;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button svg {
  width: 18px;
  height: 18px;
}

.action-button.primary {
  background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3);
}

.action-button.primary:hover {
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4);
  transform: translateY(-1px);
}

.action-button.danger {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.action-button.danger:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.action-button.secondary {
  background: white;
  color: #475569;
  border: 1.5px solid #E2E8F0;
}

.action-button.secondary:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

/* ========== 반응형 디자인 ========== */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }

  .notification-header {
    padding: 24px;
  }

  .notification-title {
    font-size: 22px;
  }

  .notification-body {
    padding: 24px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .action-section {
    padding: 20px 24px;
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .header-content {
    padding: 0 20px;
  }
}
</style>
