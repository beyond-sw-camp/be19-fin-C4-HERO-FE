/**
 * <pre>
 * TypeScript Name: notificationStore.ts
 * Description: 알림 상태 관리 Store
 *               - 알림 목록, 미읽은 개수 관리
 *               - WebSocket 연결 관리
 *               - 알림 CRUD 작업
 * 
 * History
 * 2025/12/14 (혜원) 최초 작성
 * </pre>
 * 
 * @author 혜원
 * @version 2.0
 */

import { defineStore } from 'pinia';
import { ref, computed, Ref, ComputedRef } from 'vue';
import { notificationApi } from '@/api/notification/notificationApi';
import { useNotificationSocket } from '@/composables/notification/useNotificationSocket';
import { useAuthStore } from '@/stores/auth';  // authStore import
import type {
  Notification,
  NotificationDTO,
  NotificationType,
  NotificationCategory,
} from '@/types/notification/notification.types';

interface NotificationStore {
  notifications: Ref<Notification[]>;
  unreadCount: Ref<number>;
  isLoading: Ref<boolean>;
  employeeId: ComputedRef<number>;  // ComputedRef로 변경
  isConnected: Ref<boolean>;
  unreadNotifications: ComputedRef<Notification[]>;
  notificationsByType: (type: NotificationCategory) => Notification[];
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

export const useNotificationStore = defineStore('notification', (): NotificationStore => {
  // State
  const notifications: Ref<Notification[]> = ref([]);
  const unreadCount: Ref<number> = ref(0);
  const isLoading: Ref<boolean> = ref(false);
  
  // authStore에서 employeeId 가져오기
  const authStore = useAuthStore();
  const employeeId: ComputedRef<number> = computed(() => {
    // 로그인한 사용자의 employeeId, 없으면 1 (테스트용)
    return Number(authStore.user?.employeeId) || 1;
  });

  const { isConnected, connect, disconnect } = useNotificationSocket();

  // Getters
  const unreadNotifications: ComputedRef<Notification[]> = computed(() =>
    notifications.value.filter((n) => n.isNew)
  );

  const notificationsByType = (type: NotificationCategory): Notification[] =>
    notifications.value.filter((n) => n.type === type);

  // Actions
  /**
   * 알림 목록 조회
   */
  const fetchNotifications = async (): Promise<void> => {
    try {
      isLoading.value = true;
      
      // computed된 employeeId 사용
      const data: NotificationDTO[] = await notificationApi.findNotifications(
        employeeId.value  // .value 사용
      );

      notifications.value = data.map((n) => mapDTOToNotification(n));
      await fetchUnreadCount();
    } catch (error) {
      console.error('알림 조회 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 미읽은 개수 조회
   */
  const fetchUnreadCount = async (): Promise<void> => {
    try {
      const count: number = await notificationApi.findUnreadCount(employeeId.value);
      unreadCount.value = count;
    } catch (error) {
      console.error('미읽은 개수 조회 실패:', error);
    }
  };

  /**
   * 알림 읽음 처리
   */
  const markAsRead = async (notificationId: number): Promise<void> => {
    try {
      await notificationApi.modifyIsRead(notificationId);

      const notification = notifications.value.find((n) => n.id === notificationId);
      if (notification && notification.isNew) {
        notification.isNew = false;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (error) {
      console.error('읽음 처리 실패:', error);
      throw error;
    }
  };

  /**
   * 전체 알림 읽음 처리
   */
  const markAllAsRead = async (): Promise<void> => {
    try {
      await notificationApi.modifyAllIsRead(employeeId.value);

      notifications.value.forEach((n) => {
        n.isNew = false;
      });
      unreadCount.value = 0;
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
      throw error;
    }
  };

  /**
   * WebSocket 연결
   */
  const connectWebSocket = (): void => {
    // computed된 employeeId 사용
    connect(employeeId.value, (newNotification: NotificationDTO) => {
      const formattedNotification = mapDTOToNotification(newNotification);
      formattedNotification.timeAgo = '방금 전';

      notifications.value.unshift(formattedNotification);
      unreadCount.value++;

      showToast(formattedNotification);
    });
  };

  /**
   * WebSocket 연결 해제
   */
  const disconnectWebSocket = (): void => {
    disconnect();
  };

  // Helper Functions
  /**
   * DTO를 Notification으로 변환
   */
  const mapDTOToNotification = (dto: NotificationDTO): Notification => {
    return {
      id: dto.notificationId,
      type: mapNotificationType(dto.type),
      title: dto.title,
      description: dto.message,
      timeAgo: getTimeAgo(dto.createdAt),
      date: dto.createdAt,
      isNew: !dto.isRead,
      action: getActionByType(dto.type),
      link: dto.link,
    };
  };

  /**
   * 백엔드 타입을 프론트 카테고리로 변환
   */
  const mapNotificationType = (type: NotificationType): NotificationCategory => {
    const typeMap: Record<NotificationType, NotificationCategory> = {
      ATTENDANCE_CHECK_IN: 'attendance',
      DOCUMENT_APPROVED: 'approval',
      DOCUMENT_PENDING: 'approval',
      DOCUMENT_REJECTED: 'approval',
      PAYROLL_PAID: 'payroll',
      PAYSLIP_GENERATED: 'payroll',
      EVALUATION_COMPLETED: 'evaluation',
      EVALUATION_STARTED: 'evaluation',
      LEAVE_APPROVED: 'leave',
      TRAINING_NOTICE: 'system',
      SYSTEM_NOTICE: 'system',
    };
    return typeMap[type];
  };

  /**
   * 타입별 액션 버튼 텍스트
   */
  const getActionByType = (type: NotificationType): string | null => {
    const actionMap: Partial<Record<NotificationType, string>> = {
      DOCUMENT_APPROVED: '결재 확인',
      DOCUMENT_PENDING: '결재 처리',
      PAYROLL_PAID: '명세서 보기',
      EVALUATION_STARTED: '평가 작성',
      LEAVE_APPROVED: '상세 보기',
    };
    return actionMap[type] ?? null;
  };

  /**
   * 상대 시간 계산
   */
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  /**
   * 토스트 알림 표시
   */
  const showToast = (notification: Notification): void => {
    console.log('🔔 새 알림:', notification.title);
    // TODO: vue-toastification 또는 커스텀 토스트
  };

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    employeeId,  // computed 반환
    isConnected,

    // Getters
    unreadNotifications,
    notificationsByType,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    connectWebSocket,
    disconnectWebSocket,
  };
});