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
      title: '평가 템플릿 목록',
    },
    children: [],
  },
  {
    path: '/createevaluationtemplate',
    name: 'createevaluationtemplate',
    component: () => import('@/views/evaluation/createEvaluationTemplate.vue'),
    meta: {
      title: '평가 템플릿 생성',
    },
    children: [],
  },
  {
    path: '/evaluationtemplate/:id',
    name: 'evaluationtemplate',
    component: () => import('@/views/evaluation/EvaluationTemplateDetail.vue'),
    meta: {
      title: '평가 템플릿 세부 페이지',
    },
    children: [],
  }
];

export default evaluationRoutes;
