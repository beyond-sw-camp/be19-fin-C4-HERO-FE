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
 * </pre>
 *
 * @author 동근
 * @version 1.1
 */


import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import Home from '@/views/Home.vue';
import attendanceRoutes from './modules/attendance';
import electronicApprovalRoutes from './modules/electronicApproval';
import payrollRoutes from './modules/payroll';
import evaluationRoutes from './modules/evaluation';
import { setupAuthGuard } from './guard'; // guard.ts에서 setupAuthGuard 함수 임포트
import personnelRoutes from './modules/personnel';
import authRoutes from './modules/auth';

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
  ...electronicApprovalRoutes,
  ...payrollRoutes,
  ...evaluationRoutes,
  ...personnelRoutes,
  ...notificationRoutes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 라우터 인스턴스에 인증 가드 설정
setupAuthGuard(router);

export default router;
