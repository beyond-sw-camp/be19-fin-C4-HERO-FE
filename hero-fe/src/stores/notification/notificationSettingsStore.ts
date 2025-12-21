/**
 * <pre>
 * TypeScript Name: NotificationSettingsStore
 * Description: 사용자 알림 설정 상태 및 관리를 위한 Pinia 스토어
 *              브라우저 권한 변경 시 자동으로 DB 동기화
 *
 * History
 * 2025/12/16 - (혜원) 최초 작성
 * 2025/12/17 - (혜원) API 연동, 브라우저 권한 자동 동기화 추가
 * </pre>
 *  
 * @author 혜원
 * @version 1.3
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { NotificationSettingsDTO } from '@/types/notification/notification.types';
import { notificationApi } from '@/api/notification/notificationApi';
import { useAuthStore } from '@/stores/auth';

export const useNotificationSettingsStore = defineStore('notificationSettings', () => {
  
  const authStore = useAuthStore();
  
  // State
  const settings = ref<NotificationSettingsDTO>({
    employeeId: 0,
    attendanceEnabled: true,
    payrollEnabled: true,
    approvalEnabled: true,
    leaveEnabled: true,
    evaluationEnabled: true,
    systemEnabled: true,
    browserNotification: true,
    emailNotification: true,
    smsNotification: true,
  });

  const isSaving = ref(false);
  const isLoading = ref(false);

  // Computed
  const allNotificationsEnabled = computed({
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
    set: (value: boolean) => {
      settings.value.attendanceEnabled = value;
      settings.value.payrollEnabled = value;
      settings.value.approvalEnabled = value;
      settings.value.leaveEnabled = value;
      settings.value.evaluationEnabled = value;
      settings.value.systemEnabled = value;
    }
  });

  // Actions

  /**
 * 백엔드에서 설정 불러오기
 * 브라우저 권한과 사용자 설정을 분리하여 관리
 */
  const loadSettings = async (): Promise<void> => {
    const employeeId = authStore.employeeId;
    if (!employeeId) {
      console.warn('employeeId가 없습니다');
      return;
    }

    try {
      isLoading.value = true;

      // 1. 백엔드에서 설정 조회
      const response = await notificationApi.findSettings(employeeId);
      settings.value = response;

      console.log('DB에서 불러온 설정:', response);

      // 2. 브라우저 권한은 참고만 하고, 사용자 설정은 DB 우선
      if ('Notification' in window) {
        const actualPermission = Notification.permission === 'granted';
        
        // 사용자가 DB에서 ON으로 설정했는데 브라우저 권한이 없으면 경고
        if (settings.value.browserNotification && !actualPermission) {
          console.warn('브라우저 알림이 ON으로 설정되어 있지만, 브라우저 권한이 없습니다.');
          console.warn('알림을 받으려면 브라우저 설정에서 알림을 허용해주세요.');
        }
      }

    } catch (error) {
      console.error('설정 불러오기 실패:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 브라우저 권한 상태를 DB에 동기화
   * 
   * @param {boolean} permissionGranted - 실제 브라우저 권한 상태
   */
  const syncBrowserPermissionToDB = async (permissionGranted: boolean): Promise<void> => {
    const employeeId = authStore.employeeId;
    if (!employeeId) return;

    try {
      console.log(`DB 동기화 시작: browserNotification을 ${permissionGranted}로 변경`);

      // 브라우저 권한만 업데이트 (다른 설정은 그대로)
      const updatedSettings: NotificationSettingsDTO = {
        ...settings.value,
        employeeId,
        browserNotification: permissionGranted,
      };

      // 백엔드 API 호출
      await notificationApi.modifySettings(employeeId, updatedSettings);
      
      console.log('DB 동기화 완료:', updatedSettings);

    } catch (error) {
      console.error('DB 동기화 실패:', error);
    }
  };

  /**
   * 설정 저장
   */
  const saveSettings = async () => {
    const employeeId = authStore.employeeId;
    if (!employeeId) {
      console.warn('employeeId가 없습니다');
      return { success: false, error: 'No employeeId' };
    }

    try {
      isSaving.value = true;

      settings.value.employeeId = employeeId;

      const response = await notificationApi.modifySettings(employeeId, settings.value);
      settings.value = response;

      console.log('알림 설정 저장 완료:', settings.value);

      return { success: true };
    } catch (error) {
      console.error('설정 저장 실패:', error);
      return { success: false, error };
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * 설정 초기화
   */
  const resetSettings = () => {
    const employeeId = authStore.employeeId || 0;
    
    settings.value = {
      employeeId,
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

  return {
    // State
    settings,
    isSaving,
    isLoading,
    
    // Computed
    allNotificationsEnabled,
    
    // Actions
    loadSettings,
    saveSettings,
    resetSettings,
  };
});