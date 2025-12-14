/**
 * <pre>
 * TypeScript Name: useNotificationSocket
 * Description: WebSocket 알림 연결 Composable
 *              STOMP 프로토콜을 사용한 실시간 알림 수신
 *
 * 주요 기능:
 * - WebSocket 서버 연결 및 해제
 * - 알림 토픽 구독 관리
 * - 자동 재연결 (5초 간격)
 * - Heartbeat를 통한 연결 유지
 *
 * History
 * 2025/12/14 (혜원) 최초 작성
 * </pre>
*/

import { ref, Ref } from 'vue';
import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import type { NotificationDTO, WebSocketMessage } from '@/types/notification/notification.types';

interface UseNotificationSocket {
  isConnected: Ref<boolean>;
  connect: (employeeId: number, onMessage: (notification: NotificationDTO) => void) => void;
  disconnect: () => void;
}

/**
 * WebSocket 알림 연결 Composable
 * 
 * @description STOMP 프로토콜을 사용한 WebSocket 연결 관리
 * @returns {UseNotificationSocket} WebSocket 연결 상태 및 메서드
 */
export function useNotificationSocket(): UseNotificationSocket {
  const isConnected: Ref<boolean> = ref(false);
  let stompClient: Client | null = null;
  let subscription: StompSubscription | null = null;

  /**
   * WebSocket 서버에 연결하고 알림 토픽 구독
   * 
   * @param employeeId - 구독할 직원 ID
   * @param onMessage - 알림 수신 시 실행할 콜백 함수
   */
  const connect = (
    employeeId: number,
    onMessage: (notification: NotificationDTO) => void
  ): void => {
    // SockJS 소켓 생성
    const socket = new SockJS('http://localhost:8080/ws/notifications');
    
    // STOMP 클라이언트 설정
    stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      debug: (str: string) => {
        // 프로덕션에서는 주석 처리
        // console.log(str);
      },
      reconnectDelay: 5000,      // 재연결 대기 시간 (ms)
      heartbeatIncoming: 4000,   // 서버로부터 heartbeat 수신 간격
      heartbeatOutgoing: 4000,   // 서버로 heartbeat 전송 간격
    });

    // 연결 성공 시 콜백
    stompClient.onConnect = () => {
      console.log('[WebSocket] 연결 성공');
      isConnected.value = true;

      if (stompClient) {
        // 알림 토픽 구독
        subscription = stompClient.subscribe(
          `/topic/notifications/${employeeId}`,
          (message: WebSocketMessage) => {
            try {
              const notification: NotificationDTO = JSON.parse(message.body);
              console.log('[WebSocket] 알림 수신:', notification);
              onMessage(notification);
            } catch (error) {
              console.error('[WebSocket] 메시지 파싱 실패:', error);
            }
          }
        );
        console.log(`[WebSocket] 토픽 구독 완료: /topic/notifications/${employeeId}`);
      }
    };

    // STOMP 에러 처리
    stompClient.onStompError = (frame) => {
      console.error('[WebSocket] STOMP 에러 발생:', frame.headers['message']);
      console.error('[WebSocket] 에러 상세:', frame.body);
      isConnected.value = false;
    };

    // WebSocket 연결 종료 처리
    stompClient.onWebSocketClose = () => {
      console.log('[WebSocket] 연결 종료됨');
      isConnected.value = false;
    };

    // WebSocket 연결 시작
    stompClient.activate();
  };

  /**
   * WebSocket 연결 해제 및 리소스 정리
   */
  const disconnect = (): void => {
    // 구독 해제
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
      console.log('[WebSocket] 토픽 구독 해제됨');
    }

    // 클라이언트 비활성화
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      console.log('[WebSocket] 연결 해제 완료');
      isConnected.value = false;
    }
  };

  return {
    isConnected,
    connect,
    disconnect,
  };
}