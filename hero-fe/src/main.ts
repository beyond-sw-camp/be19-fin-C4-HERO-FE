import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import './assets/styles/theme.css';
import { useAuthStore } from './stores/auth';

async function initializeApp() {
    const app = createApp(App);
    const pinia = createPinia();
    
    app.use(pinia);

    // Pinia가 설치된 후 auth 스토어를 초기화합니다.
    const authStore = useAuthStore();

    try {
        // 앱 시작 시 자동으로 토큰 갱신을 시도합니다.
        // HttpOnly 쿠키에 유효한 리프레시 토큰이 있다면,
        // 이 과정에서 새로운 액세스 토큰이 스토어에 저장됩니다.
        await authStore.refresh();
    } catch (error) {
        // 리프레시 토큰이 없거나 만료된 경우 오류가 발생하지만, 이는 예상된 동작입니다.
        // 사용자는 그냥 로그아웃 상태로 유지되며, 네비게이션 가드가 로그인 페이지로 안내할 것입니다.
        console.log('Initial token refresh failed. User is not logged in.');
    }

    // 라우터를 설치하고 앱을 마운트합니다.
    // 자동 갱신 시도 후에 라우터를 설치해야 네비게이션 가드가 올바른 인증 상태로 동작합니다.
    app.use(router);
    app.mount('#app');
}

initializeApp();
