import type { RouteRecordRaw } from 'vue-router';

const personnelRoutes: RouteRecordRaw[] = [
  {
    path: '/personnel',
    name: 'Personnel',
    component: () => import('@/views/personnel/Index.vue'),
    meta: {
      title: '인사관리',
    },
    redirect: '/personnel/list',
    children: [
      {
        path: 'list',
        name: 'EmployeeList',
        component: () => import('@/views/personnel/EmployeeList.vue'),
        meta: {
          title: '사원 정보',
        },
      },
      {
        path: 'register',
        name: 'EmployeeRegister',
        component: () => import('@/views/personnel/EmployeeRegister.vue'),
        meta: {
          title: '사원 등록',
        },
      },
    ],
  },
];

export default personnelRoutes;
