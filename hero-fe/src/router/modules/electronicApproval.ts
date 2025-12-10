import type { RouteRecordRaw } from 'vue-router';

const electronicApprovalRoutes: RouteRecordRaw[] = [
  {
    path: '/approval/document-templates',
    name: 'DocumentTemplates',
    component: () => import('@/views/electronicApproval/templates/TemplateList.vue'),
    meta: { title: 'Document Templates' },
  },
  {
    path: '/approval/inbox',
    name: 'DocumentInbox',
    component: () => import('@/views/electronicApproval/inbox/Inbox.vue'),
    meta: { title: 'Document Inbox' },
  },
  {
    path: '/approval/write/:formName', 
    name: 'WriteDocument',
    component: () => import('@/views/electronicApproval/write/WriteDocument.vue'),
    props: true, 
    meta: { title: '기안 작성' }
  }
];

export default electronicApprovalRoutes;