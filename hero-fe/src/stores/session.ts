/**
 * <pre>
 * TypeScript Name : session.ts
 * Description     : 세션 관리용 Pinia Store
 *
 * Responsibility
 *   - 프론트엔드 세션 타이머 관리 (초 단위 카운트다운)
 *   - 페이지 전환 시 세션 갱신
 *   - 세션 만료 시 로그아웃 처리(추후 API 연동 예정)
 *
 * Note
 *   - 현재는 콘솔 로그만, 추후 토큰 삭제 & API 기반 로그아웃 구현 예정
 *
 * History
 *   2025/12/10 - 동근 최초 작성 (Pinia + Composition API)
 * </pre>
 *
 * @module session-store
 * @author 동근
 * @version 1.0
 */
import { defineStore } from "pinia";
import { ref, onUnmounted } from "vue";

export const useSessionStore = defineStore("session", () => {
    const remainingSeconds = ref(3600); // 60분
    let timer: number | null = null;

    const startSession = () => {
        stopSession();
        remainingSeconds.value = 3600;

        timer = window.setInterval(() => {
            remainingSeconds.value--;
            if (remainingSeconds.value <= 0) {
                //후에 해야될것 -> 실제 로그아웃 처리 (API, 토큰 삭제 등)
                console.log("세션 만료, 로그아웃 처리");
                stopSession();
            }
        }, 1000);
    };

    // 페이지 전환될 때만 호출
    const refreshSession = () => {
        remainingSeconds.value = 3600;
    };

    const stopSession = () => {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };

    onUnmounted(stopSession);

    return {
        remainingSeconds,
        startSession,
        refreshSession,
        stopSession,
    };
});
