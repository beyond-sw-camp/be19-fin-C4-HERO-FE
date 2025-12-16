import type { RouteRecordRaw } from 'vue-router'

const vacationRoutes: RouteRecordRaw[] = [
  {
    path: '/vacation',
    redirect: '/vacation/history',
    children: [
      {
        path: 'history',
        name: 'VacationHistory',
        component: () => import('@/views/vacation/VacationHistory.vue'),
        meta: { title: '휴가 이력' },
      },
      {
        path: 'department',
        name: 'DepartmentVacation',
        component: () => import('@/views/vacation/DepartmentVacation.vue'),
        meta: { title: '부서 휴가 현황' },
      },
    ],
  },
]

export default vacationRoutes
