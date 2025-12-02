import type { RouteRecordRaw } from 'vue-router';

const electronicApprovalRoutes: RouteRecordRaw[] = [
  {
    path: '/electronic-approval',
    name: 'ElectronicApproval',
    component: () => import('@/views/electronicApproval/Index.vue'),
    meta: {
      title: '전자결재',
    },
    children: [],
  },
];

export default electronicApprovalRoutes;
