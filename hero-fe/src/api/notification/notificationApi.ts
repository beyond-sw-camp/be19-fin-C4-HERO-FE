/**
 * <pre>
 * File Name: notificationApi.ts
 * Description: 알림 API 클라이언트
 *              백엔드 알림 API 호출 함수 모음
 *
 * History
 * 2025/12/12 (혜원) 최초 작성
 * 2025/12/16 (혜원) 삭제 관련 API 추가
 * </pre>
 *
 * @author 혜원
 * @version 2.0
 */

import apiClient from '@/api/apiClient';
import type { NotificationDTO } from '@/types/notification/notification.types';

export const notificationApi = {
  /**
   * 알림 목록 조회
   * @param employeeId 직원 ID
   * @returns Promise<NotificationDTO[]>
   */
  getNotifications: async (employeeId: number): Promise<NotificationDTO[]> => {
    const response = await apiClient.get(`/notifications/${employeeId}`);
    return response.data;
  },

  /**
   * 미읽은 알림 개수 조회
   * @param employeeId 직원 ID
   * @returns Promise<number>
   */
  getUnreadCount: async (employeeId: number): Promise<number> => {
    const response = await apiClient.get(`/notifications/${employeeId}/unread-count`);
    return response.data;
  },

  /**
   * 알림 읽음 처리
   * @param notificationId 알림 ID
   * @returns Promise<void>
   */
  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * 모든 알림 읽음 처리
   * @param employeeId 직원 ID
   * @returns Promise<void>
   */
  markAllAsRead: async (employeeId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${employeeId}/read-all`);
  },

  /**
   * 알림 소프트 삭제
   * @param notificationId 알림 ID
   * @returns Promise<void>
   */
  softDelete: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/delete`);
  },

  /**
   * 삭제된 알림 복구
   * @param notificationId 알림 ID
   * @returns Promise<void>
   */
  restore: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/restore`);
  },

  /**
   * 알림 영구 삭제
   * @param notificationId 알림 ID
   * @returns Promise<void>
   */
  hardDelete: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  /**
   * 삭제된 알림 목록 조회
   * @param employeeId 직원 ID
   * @returns Promise<NotificationDTO[]>
   */
  getDeletedNotifications: async (employeeId: number): Promise<NotificationDTO[]> => {
    const response = await apiClient.get(`/notifications/${employeeId}/deleted`);
    return response.data;
  },
};