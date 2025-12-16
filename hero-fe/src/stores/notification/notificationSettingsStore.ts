/**
 * <pre>
 * TypeScript Name: NotificationSettingsStore
 * Description: 사용자 알림 설정 상태 및 관리를 위한 Pinia 스토어
 *              로컬 저장소에서 설정을 불러오고 저장하며, 브라우저 알림 권한 상태를 관리
 * * History
 * 2025/12/16 - (혜원) 최초 작성
 * </pre>
 *  
 * @author 혜원
 * @version 1.0
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { NotificationSettings } from '@/types/notification/notification.types';

/**
 * 알림 설정 관리를 위한 Pinia 스토어 정의
 * notificationSettings 스토어 ID를 사용합니다.
 */
export const useNotificationSettingsStore = defineStore('notificationSettings', () => {
  
  // State (상태)
  /**
   * 사용자의 알림 설정 상태 객체
   * NotificationSettings 타입에 정의된 기본값으로 초기화됩니다.
   */
  const settings = ref<NotificationSettings>({
    attendanceEnabled: true, // 근태 알림 활성화 여부
    payrollEnabled: true,      // 급여 알림 활성화 여부
    approvalEnabled: true,     // 승인 알림 활성화 여부
    leaveEnabled: true,        // 휴가 알림 활성화 여부
    evaluationEnabled: true,   // 평가 알림 활성화 여부
    systemEnabled: true,       // 시스템 알림 활성화 여부
    browserNotification: true, // 브라우저 알림 수신 활성화 여부
    emailNotification: true,   // 이메일 알림 수신 활성화 여부
    smsNotification: true,     // SMS 알림 수신 활성화 여부
  });

  /**
   * 설정 저장 API 호출 중 상태를 나타내는 플래그
   */
  const isSaving = ref(false);

  // Computed (계산된 속성 / Getter)

  /**
   * 모든 항목 알림(근태~시스템)이 활성화되었는지 확인하는 양방향 Computed 속성
   * get: 모든 항목이 true인지 확인합니다.
   * set: 모든 항목을 일괄적으로 활성화/비활성화합니다.
   */
  const allNotificationsEnabled = computed({
    /**
     * @returns {boolean} 모든 알림 항목이 활성화되었는지 여부
     */
    get: () => {
      return (
        settings.value.attendanceEnabled &&
        settings.value.payrollEnabled &&
        settings.value.approvalEnabled &&
        settings.value.leaveEnabled &&
        settings.value.evaluationEnabled &&
        settings.value.systemEnabled
      );
    },
    /**
     * 모든 알림 항목을 주어진 값으로 설정합니다.
     * @param {boolean} value - 설정할 활성화/비활성화 상태
     */
    set: (value: boolean) => {
      settings.value.attendanceEnabled = value;
      settings.value.payrollEnabled = value;
      settings.value.approvalEnabled = value;
      settings.value.leaveEnabled = value;
      settings.value.evaluationEnabled = value;
      settings.value.systemEnabled = value;
    }
  });

  // Actions (액션)

  /**
   * 초기 설정을 로컬 저장소(localStorage)에서 불러오고 브라우저 알림 권한 상태를 확인합니다.
   */
  const loadSettings = () => {
    // 1. localStorage에서 설정 불러오기
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // 기존 설정에 저장된 설정을 덮어쓰기 (부분 업데이트)
        settings.value = { ...settings.value, ...parsed };
      } catch (error) {
        console.error('localStorage 설정 파싱 실패:', error);
      }
    }

    // 2. 브라우저 알림 권한 확인 및 상태 업데이트
    if ('Notification' in window) {
      settings.value.browserNotification = Notification.permission === 'granted';
    }
  };

  /**
   * 현재 설정을 로컬 저장소에 저장하고 백엔드 API를 호출합니다.
   * isSaving 상태를 통해 로딩 상태를 관리합니다.
   *
   * @returns {Promise<{success: boolean, error?: any}>} 저장 성공/실패 결과 객체
   */
  const saveSettings = async () => {
    try {
      isSaving.value = true;

      // 1. localStorage에 저장 (클라이언트 측 임시 저장)
      localStorage.setItem('notificationSettings', JSON.stringify(settings.value));

      // 2. TODO: 백엔드 API 호출 (실제 구현 필요)
      // await notificationApi.updateSettings(settings.value);

      return { success: true };
    } catch (error) {
      console.error('설정 저장 실패:', error);
      return { success: false, error };
    } finally {
      // 저장 작업 완료 후 isSaving 상태를 false로 설정합니다.
      isSaving.value = false;
    }
  };

  /**
   * 알림 설정을 초기값(모두 활성화)으로 되돌립니다.
   */
  const resetSettings = () => {
    settings.value = {
      attendanceEnabled: true,
      payrollEnabled: true,
      approvalEnabled: true,
      leaveEnabled: true,
      evaluationEnabled: true,
      systemEnabled: true,
      browserNotification: true,
      emailNotification: true,
      smsNotification: true,
    };
  };

  // Return (노출할 요소)

  return {
    // State
    settings,              // 알림 설정 객체
    isSaving,              // 저장 중 상태 플래그
    
    // Computed
    allNotificationsEnabled, // 모든 항목 알림 활성화 여부 (양방향 바인딩 가능)
    
    // Actions
    loadSettings,          // 설정 불러오기
    saveSettings,          // 설정 저장
    resetSettings,         // 설정 초기화
  };
});