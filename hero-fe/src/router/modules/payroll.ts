import type { RouteRecordRaw } from 'vue-router';

const payrollRoutes: RouteRecordRaw[] = [
  {
    path: '/payroll',
    name: 'Payroll',
    component: () => import('@/views/payroll/Index.vue'),
    meta: {
      title: '급여 관리',
    },
    children: [],
  },
];

export default payrollRoutes;
