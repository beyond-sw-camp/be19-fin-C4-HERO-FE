/**
 * <pre>
 * TypeScript Name: notificationApi
 * Description: 알림 API 클라이언트
 *              백엔드 알림 API와 통신하는 모든 요청을 정의
 *
 * 주요 기능:
 * - 알림 목록 조회 (일반/삭제됨)
 * - 알림 읽음 처리 (개별/전체)
 * - 알림 삭제 (소프트/하드)
 * - 알림 복구
 * - 알림 설정 조회 및 수정
 *
 * History
 * 2025/12/12 (혜원) 최초 작성
 * 2025/12/16 (혜원) 삭제 관련 API 추가, 경로 수정
 * 2025/12/17 (혜원) 설정 관련 API 추가
 * </pre>
 *
 * @author 혜원
 * @version 2.2
 */

import apiClient from '@/api/apiClient';
import type { NotificationDTO } from '@/types/notification/notification.types';
import type { NotificationSettingsDTO } from '@/types/notification/notification.types';
/**
 * 알림 관련 API 요청 모음
 */
export const notificationApi = {
  /**
   * 알림 목록 조회
   * @param {number} employeeId - 조회할 직원 ID
   * @returns {Promise<NotificationDTO[]>} 알림 목록
   */
  findNotifications: async (employeeId: number): Promise<NotificationDTO[]> => {
    const response = await apiClient.get(`/notifications/${employeeId}`);
    return response.data;
  },

  /**
   * 미읽은 알림 개수 조회
   * @param {number} employeeId - 조회할 직원 ID
   * @returns {Promise<number>} 미읽은 알림 개수
   */
  findUnreadCount: async (employeeId: number): Promise<number> => {
    const response = await apiClient.get(`/notifications/${employeeId}/unread-count`);
    return response.data;
  },

  /**
   * 알림 읽음 처리 (개별)
   * @param {number} notificationId - 읽음 처리할 알림 ID
   * @returns {Promise<void>}
   */
  modifyIsRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * 모든 알림 읽음 처리
   * @param {number} employeeId - 대상 직원 ID
   * @returns {Promise<void>}
   */
  modifyAllIsRead: async (employeeId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${employeeId}/read-all`);
  },

  /**
   * 알림 소프트 삭제 (30일 후 자동 영구 삭제)
   * @param {number} notificationId - 삭제할 알림 ID
   * @returns {Promise<void>}
   */
  softRemove: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/delete`);
  },

  /**
   * 삭제된 알림 복구
   * @param {number} notificationId - 복구할 알림 ID
   * @returns {Promise<void>}
   */
  modifyRestore: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/restore`);
  },

  /**
   * 알림 영구 삭제 (복구 불가능)
   * @param {number} notificationId - 영구 삭제할 알림 ID
   * @returns {Promise<void>}
   */
  removeNotification: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  /**
   * 삭제된 알림 목록 조회
   * @param {number} employeeId - 조회할 직원 ID
   * @returns {Promise<NotificationDTO[]>} 삭제된 알림 목록
   */
  findDeletedNotifications: async (employeeId: number): Promise<NotificationDTO[]> => {
    const response = await apiClient.get(`/notifications/${employeeId}/deleted`);
    return response.data;
  },

  /**
   * 알림 설정 조회
   * @param {number} employeeId - 조회할 직원 ID
   * @returns {Promise<NotificationSettingsDTO>} 알림 설정
   */
  findSettings: async (employeeId: number): Promise<NotificationSettingsDTO> => {
    const response = await apiClient.get(`/notification-settings/${employeeId}`);
    return response.data;
  },

  /**
   * 알림 설정 수정
   * @param {number} employeeId - 대상 직원 ID
   * @param {NotificationSettingsDTO} settings - 수정할 설정
   * @returns {Promise<NotificationSettingsDTO>} 수정된 설정
   */
  modifySettings: async (employeeId: number, settings: NotificationSettingsDTO): Promise<NotificationSettingsDTO> => {
    const response = await apiClient.put(`/notification-settings/${employeeId}`, settings);
    return response.data;
  },
};