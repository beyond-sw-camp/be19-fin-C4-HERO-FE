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
  {
    path: '/personnel/promotion',
    name: 'Promotion',
    component: () => import('@/views/personnel/promotion/Promotion.vue'),
    meta: {
      title: '승진',
    },
    redirect: '/personnel/promotion/plan',
    children: [
      {
        path: 'plan',
        name: 'promotionPlan',
        component: () => import('@/views/personnel/promotion/PromotionPlan.vue'),
        meta: {
          title: '승진 계획',
        }
      },
      {
        path: 'plan/:id',
        name: 'promotionPlanDetail',
        component: () => import('@/views/personnel/promotion/PromotionPlanDetail.vue'),
        meta: {
          title: '승진 계획 상세',
        }
      },
      {
        path: 'recommend',
        name: 'promotionRecommend',
        component: () => import('@/views/personnel/recommend/Recommend.vue'),
        meta: {
          title: '승진 추천',
        }
      },
      {
        path: 'review',
        name: 'promotionReview',
        component: () => import('@/views/personnel/review/Review.vue'),
        meta: {
          title: '승진 심사',
        }
      },
    ],
  }
];

export default personnelRoutes;
