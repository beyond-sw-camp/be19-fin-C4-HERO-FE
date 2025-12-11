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
    path: '/evaluation/template/list',
    name: 'evaluationtemplatelist',
    component: () => import('@/views/evaluation/EvaluationTemplateList.vue'),
    meta: {
      title: '평가 템플릿 목록',
    },
    children: [],
  },
  {
    path: '/evaluation/template/create',
    name: 'createevaluationtemplate',
    component: () => import('@/views/evaluation/CreateEvaluationTemplate.vue'),
    meta: {
      title: '평가 템플릿 생성',
    },
    children: [],
  },
  {
    path: '/evaluation/template/:id',
    name: 'evaluationtemplatedetail',
    component: () => import('@/views/evaluation/EvaluationTemplateDetail.vue'),
    meta: {
      title: '평가 템플릿 세부 페이지',
    },
    children: [],
  },
  {
    path: '/evaluation/guide/list',
    name: 'evaluationguide',
    component: () => import('@/views/evaluation/EvaluationGuideList.vue'),
    meta: {
      title: '평가 가이드 목록',
    },
    children: [],
  },
  {
    path: '/evaluation/guide/create',
    name: 'createevaluationguide',
    component: () => import('@/views/evaluation/CreateEvaluationGuide.vue'),
    meta: {
      title: '평가 가이드 생성',
    },
    children: [],
  },
  {
    path: '/evaluation/guide/:id',
    name: 'evaluationguidedetail',
    component: () => import('@/views/evaluation/EvaluationGuideDetail.vue'),
    meta: {
      title: '평가 가이드 세부 페이지',
    },
    children: [],
  }
];

export default evaluationRoutes;
