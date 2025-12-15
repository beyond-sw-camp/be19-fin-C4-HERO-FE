/**
 * <pre>
 * TypeScript Name: notificationApi
 * Description: 알림 관련 API 클라이언트
 *               - 알림 목록 조회
 *               - 미읽은 알림 개수 조회
 *               - 알림 읽음 처리 (단건/전체)
 * 
 * History
 * 2025/12/12 (혜원) 최초 작성
 * </pre>
 * 
 * @author 혜원
 * @version 1.0
 */

import client from '@/api/apiClient';
import type { NotificationDTO } from '@/types/notification/notification.types';
import type { AxiosResponse } from 'axios';

/**
 * 알림 API 클라이언트
 */
export const notificationApi = {
  /**
   * 알림 목록 조회
   * @param employeeId - 직원 ID
   * @returns 알림 목록
   */
  async findNotifications(employeeId: number): Promise<NotificationDTO[]> {
    const response: AxiosResponse<NotificationDTO[]> = await client.get(
      `/notifications/${employeeId}`
    );
    return response.data;
  },

  /**
   * 미읽은 알림 개수 조회
   * @param employeeId - 직원 ID
   * @returns 미읽은 개수
   */
  async findUnreadCount(employeeId: number): Promise<number> {
    const response: AxiosResponse<number> = await client.get(
      `/notifications/${employeeId}/unread-count`
    );
    return response.data;
  },

  /**
   * 알림 읽음 처리
   * @param notificationId - 알림 ID
   */
  async modifyIsRead(notificationId: number): Promise<void> {
    await client.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * 전체 알림 읽음 처리
   * @param employeeId - 직원 ID
   */
  async modifyAllIsRead(employeeId: number): Promise<void> {
    await client.patch(`/notifications/${employeeId}/read-all`);
  },
};