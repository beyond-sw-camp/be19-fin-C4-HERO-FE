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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 라우터 인스턴스에 인증 가드 설정
setupAuthGuard(router);

export default router;
