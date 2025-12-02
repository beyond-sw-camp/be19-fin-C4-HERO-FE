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
                // TODO: 실제 로그아웃 처리 (API, 토큰 삭제 등)
                console.log("⏳ 세션 만료, 로그아웃 처리");
                stopSession();
            }
        }, 1000);
    };

    // ✅ 페이지 전환될 때만 호출
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
