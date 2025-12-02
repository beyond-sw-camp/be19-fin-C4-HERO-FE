import type { RouteRecordRaw } from 'vue-router';

const attendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/attendance',
    name: 'Attendance',
    component: () => import('@/views/attendance/Index.vue'),
    meta: {
      title: '근태',
    },
    children: [],
  },
];

export default attendanceRoutes;
