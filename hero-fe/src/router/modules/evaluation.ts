import type { RouteRecordRaw } from 'vue-router';

const evaluationRoutes: RouteRecordRaw[] = [
  {
    path: '/evaluation',
    name: 'evaluation',
    component: () => import('@/views/evaluation/Index.vue'),
    meta: {
      title: '평가 관리',
    },
    children: [],
  },
  {
    path: '/evaluationtemplatelist',
    name: 'evaluationtemplatelist',
    component: () => import('@/views/evaluation/EvaluationTemplateList.vue'),
    meta: {
      title: '평가 템플릿',
    },
    children: [],
  }
];

export default evaluationRoutes;
