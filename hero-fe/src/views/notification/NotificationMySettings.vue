<!--
  <pre>
  Vue Name   : NotificationSettingsPage
  Description : 알림 설정 페이지
                - 전체 알림 ON/OFF 토글
                - 알림 타입별 ON/OFF 설정
                - 브라우저 알림 권한 설정
                - 이메일 알림 설정
                - SMS 문자 알림 설정
  
  History
  2025/12/16 (혜원) 최초 작성
  2025/12/17 (혜원) 알림 마운트 수정
  </pre>

  @author 혜원
  @version 1.2
-->
<template>
  <div class="notification-settings-page">
    <div class="settings-header">
      <button
        class="back-btn"
        type="button"
        @click="goBack"
      >
        <img
          src="/images/backArrow.svg"
          alt="뒤로가기"
          class="back-icon"
        />
      </button>
      <h1>알림 설정</h1>
    </div>

    <div class="settings-container">
      <section class="settings-section master-toggle-section">
        <div class="setting-item master-toggle">
          <div class="setting-icon">
            <img
              src="/images/alarm.svg"
              alt="전체 알림"
            />
          </div>
          <div class="setting-content">
            <h3 class="setting-label">전체 알림 수신</h3>
            <p class="setting-description">모든 알림을 한 번에 켜거나 끌 수 있습니다</p>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              v-model="settingsStore.allNotificationsEnabled"
            />
            <span class="slider"></span>
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">알림 타입</h2>
        <p class="section-description">수신할 알림 타입을 선택하세요</p>

        <div class="settings-list">
          <div
            v-for="item in notificationTypes"
            :key="item.id"
            class="setting-item"
          >
            <div class="setting-icon">
              <img
                :src="item.icon"
                :alt="item.label"
              />
            </div>
            <div class="setting-content">
              <h3 class="setting-label">{{ item.label }}</h3>
              <p class="setting-description">{{ item.description }}</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="settingsStore.settings[item.id]"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">수신 방법</h2>
        <p class="section-description">알림을 받을 방법을 선택하세요</p>

        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-icon">
              <img
                src="/images/alarm/alarm-browser.svg"
                alt="브라우저 알림"
              />
            </div>
            <div class="setting-content">
              <h3 class="setting-label">브라우저 알림</h3>
              <p class="setting-description">실시간 푸시 알림 수신</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="settingsStore.settings.browserNotification"
                @change="handleBrowserNotificationChange"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-icon">
              <img
                src="/images/alarm/alarm-email.svg"
                alt="이메일 알림"
              />
            </div>
            <div class="setting-content">
              <h3 class="setting-label">이메일 알림</h3>
              <p class="setting-description">이메일로 알림 수신</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="settingsStore.settings.emailNotification"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-icon">
              <img
                src="/images/alarm/alarm-phone.svg"
                alt="SMS 알림"
              />
            </div>
            <div class="setting-content">
              <h3 class="setting-label">SMS 문자 알림</h3>
              <p class="setting-description">
                중요 알림을 문자로 수신 (별도 비용 발생 가능)
              </p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="settingsStore.settings.smsNotification"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <div class="settings-actions">
        <button
          class="save-btn"
          type="button"
          @click="handleSaveSettings"
          :disabled="settingsStore.isSaving"
        >
          <span v-if="!settingsStore.isSaving">설정 저장</span>
          <span v-else>저장 중...</span>
        </button>
        <button
          class="reset-btn"
          type="button"
          @click="handleResetSettings"
        >
          기본값으로 되돌리기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Import 구문
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationSettingsStore } from '@/stores/notification/notificationSettings.store';
import type { NotificationSettingItem } from '@/types/notification/notification.types';

// 2. Composables (외부 로직)
const router = useRouter();
const settingsStore = useNotificationSettingsStore(); // Pinia Store 인스턴스

// 3. Reactive 데이터 및 상수 정의

/**
 * 알림 타입 섹션을 구성하기 위한 상수 데이터
 * Pinia Store의 settings 객체 키와 연결
 */
const notificationTypes: NotificationSettingItem[] = [
  {
    id: 'attendanceEnabled',
    label: '근태 알림',
    description: '출퇴근, 지각 등 근태 관련 알림',
    icon: '/images/alarm/alarm-time.svg',
  },
  {
    id: 'payrollEnabled',
    label: '급여 알림',
    description: '급여 지급, 명세서 생성 알림',
    icon: '/images/alarm/alarm-money.svg',
  },
  {
    id: 'approvalEnabled',
    label: '결재 알림',
    description: '결재 승인, 반려 등 결재 관련 알림',
    icon: '/images/alarm/alarm-check.svg',
  },
  {
    id: 'evaluationEnabled',
    label: '평가 알림',
    description: '평가 시작, 완료 알림',
    icon: '/images/alarm/alarm-paper.svg',
  },
  {
    id: 'systemEnabled',
    label: '시스템 알림',
    description: '공지사항, 시스템 안내 알림',
    icon: '/images/alarm/alarmsetting.svg',
  },
];

// 4. 메소드 (일반 함수)

/**
 * 뒤로가기 동작을 수행
 */
const goBack = () => {
  router.back();
};

/**
 * 브라우저 알림 설정 변경을 처리
 * 알림이 ON 상태로 변경될 경우 브라우저 권한을 요청
 */
/**
 * 브라우저 알림 토글 변경 시
 */
const handleBrowserNotificationChange = async () => {
  if (settingsStore.settings.browserNotification) {
    // 켜려고 시도할 때만 권한 요청
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // 권한 받음 → DB에 true 저장
        console.log('브라우저 알림 권한 허용됨');
      } else {
        // 권한 거부 → 토글 다시 OFF
        settingsStore.settings.browserNotification = false;
        alert('브라우저 알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
      }
    }
  } else {
    // 권한 체크 안 함, 그냥 DB에 false 저장
    console.log('브라우저 알림 OFF');
    // 브라우저 권한은 그대로 두고, DB만 false로 저장
  }
};

/**
 * 설정 저장 동작을 Pinia Store 액션에 위임
 */
const handleSaveSettings = async () => {
  const result = await settingsStore.saveSettings();

  if (result.success) {
    alert('설정이 저장되었습니다.');
    // 저장 성공 후 알림 페이지로 이동 (UX 개선)
    router.push('/notifications');
  } else {
    alert('설정 저장에 실패했습니다.');
  }
};

/**
 * 설정을 기본값으로 되돌리고 저장
 */
const handleResetSettings = () => {
  if (confirm('설정을 기본값(모두 ON)으로 되돌리시겠습니까?')) {
    settingsStore.resetSettings();
    // 기본값으로 되돌린 후 저장 액션 호출
    handleSaveSettings(); 
  }
};

// 5. 생명주기 훅

/**
 * 컴포넌트 마운트 시 Pinia Store에서 기존 설정 값을 불러옴
 */
onMounted(async () => {
  await settingsStore.loadSettings();
});
</script>

<style scoped>
/*
 * 6. Style (CSS)
 * - 설정 페이지의 레이아웃, 섹션 구분, 토글 스위치, 버튼 스타일 정의
 */

.notification-settings-page {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
}

/* 헤더 스타일 */
.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 55px;
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #1e40af;
  transform: translateX(-2px);
}

.back-icon {
  width: 20px;
  height: 20px;
}

.settings-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* 메인 컨테이너 */
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

/* 설정 섹션 카드 */
.settings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 전체 알림 섹션 강조 (마스터 토글) */
.master-toggle-section {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.master-toggle {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.master-toggle:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 개별 설정 항목 */
.setting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.setting-item:hover {
  background: #f3f4f6;
}

.setting-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.setting-content {
  flex: 1;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.setting-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Toggle Switch 스타일 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* 액션 버튼 */
.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.save-btn,
.reset-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #3b82f6;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.save-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
  transform: none;
}

.reset-btn {
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.reset-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* 미디어 쿼리 (모바일 대응) */
@media (max-width: 768px) {
  .settings-header {
    padding: 16px 20px;
  }

  .settings-container {
    padding: 20px;
  }

  .settings-section {
    padding: 20px;
  }

  .setting-item {
    flex-direction: row;
    align-items: flex-start;
  }

  .setting-icon {
    width: 32px;
    height: 32px;
  }

  .settings-actions {
    flex-direction: column;
  }
}
</style>