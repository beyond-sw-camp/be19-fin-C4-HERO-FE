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
    path: '/evaluation/template/edit/:id',
    name: 'editevaluationtemplate',
    component: () => import('@/views/evaluation/EditEvaluationTemplate.vue'),
    meta: {
      title: '평가 템플릿 수정',
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
    path: '/evaluation/guide/edit/:id',
    name: 'editevaluationguide',
    component: () => import('@/views/evaluation/EditEvaluationGuide.vue'),
    meta: {
      title: '평가 가이드 수정',
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
  },
  {
    path: '/evaluation/list',
    name: 'evaluationlist',
    component: () => import('@/views/evaluation/EvaluationList.vue'),
    meta: {
      title: '평가 목록',
    },
    children: [],
  },
  {
    path: '/evaluation/list2',
    name: 'evaluationlist2',
    component: () => import('@/views/evaluation/EvaluationList2.vue'),
    meta: {
      title: '평가 목록2',
    },
    children: [],
  },
  {
    path: '/evaluation/create/:id',
    name: 'createevaluation',
    component: () => import('@/views/evaluation/CreateEvaluation.vue'),
    meta: {
      title: '평가 생성',
    },
    children: [],
  },
  {
    path: '/evaluation/evaluation/:id',
    name: 'evaluationdetail',
    component: () => import('@/views/evaluation/EvaluationDetail.vue'),
    meta: {
      title: '평가 세부 페이지',
    },
    children: [],
  },
  {
    path: '/evaluation/form/create/:id',
    name: 'createevaluationform',
    component: () => import('@/views/evaluation/CreateEvaluationForm.vue'),
    meta: {
      title: '평가서 생성',
    },
    children: [],
  }
];

export default evaluationRoutes;
