/**
 * (File => TypeScript) Name   : approval.ts
 * Description : 결재(Approval) 도메인 라우트 설정
 *               - 결재 작성 화면
 *               - 결재 서식 목록 화면
 *               - 결재 문서함 화면
 *
 * History
 * 2025/12/10 - 민철 최초 작성
 * 2025/12/23 - 민철 파일명 변경
 *
 * @author 민철
 * @version 2.0
 */
import type { RouteRecordRaw } from 'vue-router';

const approvalRoutes: RouteRecordRaw[] = [
  {
    path: '/approval/document-templates',
    name: 'DocumentTemplates',
    component: () => import('@/views/approval/templates/ApprovalTemplates.vue'),
    meta: { title: 'Document Templates' },
  },
  {
    path: '/approval/inbox',
    name: 'DocumentInbox',
    component: () => import('@/views/approval/inbox/ApprovalInbox.vue'),
    meta: { title: 'Document Inbox' },
  },
  {
    path: '/approval/create/:formName', 
    name: 'ApprovalCreate',
    component: () => import('@/views/approval/create/ApprovalCreate.vue'),
    props: true, 
    meta: { title: 'Create Document' }
  }
];

export default approvalRoutes;