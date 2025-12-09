
import type { RouteRecordRaw } from 'vue-router';

const attendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/attendance',
    name: 'Attendance',
    component: () => import('@/views/attendance/Index.vue'),
    meta: { title: '근태 관리' },
    redirect: '/attendance/attendance_record/personal', // 기본 진입 시 개인 근태로

    children: [
      // 1) 개인 근태 이력
      {
        path: 'attendance_record/personal',
        name: 'AttendancePersonal',
        component: () =>
          import('@/views/attendance/attendance_record/Personal.vue'),
        meta: { title: '개인 근태 이력' },
      },

      // 2) 초과 근무 이력
      {
        path: 'attendance_record/overtime',
        name: 'AttendanceOvertime',
        component: () =>
          import('@/views/attendance/attendance_record/Overtime.vue'),
        meta: { title: '초과 근무 이력' },
      },

      // 3) 근태 기록 수정 이력
      {
        path: 'attendance_record/correction',
        name: 'AttendanceCorrection',
        component: () =>
          import('@/views/attendance/attendance_record/Correction.vue'),
        meta: { title: '근태 기록 수정 이력' },
      },

      // 4) 근무제 변경 이력
      {
        path: 'attendance_record/change_log',
        name: 'AttendanceChangeLog',
        component: () =>
          import('@/views/attendance/attendance_record/Change_log.vue'),
        meta: { title: '근무제 변경 이력' },
      },

      // 부서 근태 현황
      {
        path: 'department',
        name: 'DepartmentAttendanceRecord',
        component: () =>
          import(
            '@/views/attendance/department_attendance_record/Index.vue'
          ),
        meta: { title: '부서 근태 현황' },
      },
    ],
  },
];

export default attendanceRoutes;
