/*
  <pre>
  (File=>TypeScript) Name   : settings.ts
  Description : 부서/직책/직급/권한 등의 설정을 위한 모듈입니다.

  History
  2025/12/15 - 승건 최초 작성
  </pre>

  @author 이승건
  @version 1.0
*/

import type { RouteRecordRaw } from 'vue-router';
import Settings from '@/views/settings/Settings.vue';
import Department from '@/views/settings/Department.vue';
import Grade from '@/views/settings/Grade.vue';
import JobTitle from '@/views/settings/JobTitle.vue';
import Permission from '@/views/settings/Permission.vue';

const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    component: Settings,
    children: [
      {
        path: '',
        redirect: '/settings/department',
      },
      {
        path: 'department',
        name: 'DepartmentSettings',
        component: Department,
      },
      {
        path: 'grade',
        name: 'GradeSettings',
        component: Grade,
      },
      {
        path: 'jobTitle',
        name: 'JobTitleSettings',
        component: JobTitle,
      },
      {
        path: 'permission',
        name: 'PermissionSettings',
        component: Permission,
      },
    ],
  },
];

export default settingsRoutes;
