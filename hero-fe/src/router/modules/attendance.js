const attendanceRoutes = [
  {
    path: '/attendance',
    name: 'Attendance',
    component: () => import('@/views/attendance/Index.vue'),
    meta: {
      title: '근태'
    },
    children: [

    ]
  }
];

export default attendanceRoutes;
