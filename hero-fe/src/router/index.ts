import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import Home from '@/views/Home.vue';
import attendanceRoutes from './modules/attendance';
import electronicApprovalRoutes from './modules/electronicApproval';
import payrollRoutes from './modules/payroll';
import evaluationRoutes from './modules/evaluation';
import personnelRoutes from './modules/personnel';
import notificationRoutes from './modules/notification';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
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

export default router;
