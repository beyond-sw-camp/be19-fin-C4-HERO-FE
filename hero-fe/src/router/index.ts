import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import Home from '@/views/Home.vue';
import attendanceRoutes from './modules/attendance';
import electronicApprovalRoutes from './modules/electronicApproval';
import payrollRoutes from './modules/payroll';
import performanceRoutes from './modules/performance';
import personnelRoutes from './modules/personnel';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  ...attendanceRoutes,
  ...electronicApprovalRoutes,
  ...payrollRoutes,
  ...performanceRoutes,
  ...personnelRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
