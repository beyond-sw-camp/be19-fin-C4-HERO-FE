import type { RouteRecordRaw } from 'vue-router';

const personnelRoutes: RouteRecordRaw[] = [
  {
    path: '/personnel',
    name: 'Personnel',
    component: () => import('@/views/personnel/Index.vue'),
    meta: {
      title: '인사관리',
    },
    children: [],
  },
];

export default personnelRoutes;
