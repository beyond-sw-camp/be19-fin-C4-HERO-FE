/**
 * <pre>
 * TypeScript Name   : index.ts
 * Description : Vue Router 설정 파일
 *               - 메인 Home 라우트 등록
 *               - 근태, 전자결재, 급여, 평가, 인사 모듈 라우트 통합
 *
 * History
 * 2025/11/28 - 승건 최초 작성
 * 2025/12/09 - 동근 JSDoc 추가
 * 2025/12/12 - 동근 급여 관련 도메인 분리 & 라우터 전역 가드에 세션 갱신 로직 추가 및 인증 라우트(/auth/*) 제외 처리
 * </pre>
 *
 * @author 동근
 * @version 1.2
 */


import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import attendanceRoutes from './modules/attendance';
import vacationRoutes from './modules/vacation';
import electronicApprovalRoutes from './modules/electronicApproval';
import payrollMeRoutes from './modules/payrollMe';
import payrollAdminRoutes from "./modules/payrollAdmin";
import evaluationRoutes from './modules/evaluation';
import { setupAuthGuard } from './guard'; // guard.ts에서 setupAuthGuard 함수 임포트
import personnelRoutes from './modules/personnel';
import authRoutes from './modules/auth';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';

import notificationRoutes from './modules/notification';


// 전체 애플리케이션 라우트 정의
const routes: RouteRecordRaw[] = [
  ...authRoutes,
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {

    },
  },
  ...attendanceRoutes,
  ...vacationRoutes,
  ...electronicApprovalRoutes,
  ...payrollMeRoutes,
  ...payrollAdminRoutes,
  ...evaluationRoutes,
  ...personnelRoutes,
  ...notificationRoutes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const sessionStore = useSessionStore();

  // 인증관련 페이지들(/auth/*)는 가드 대상에서 제외시킴
  const isAuthRoute = to.path.startsWith('/auth');

  if (authStore.isAuthenticated && !isAuthRoute) {
    sessionStore.refreshSession();
  }

  next();
});

// 라우터 인스턴스에 인증 가드 설정
// setupAuthGuard(router);

export default router;
