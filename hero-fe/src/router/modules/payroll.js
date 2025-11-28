const payrollRoutes = [
  {
    path: '/payroll',
    name: 'Payroll',
    component: () => import('@/views/payroll/Index.vue'),
    meta: {
      title: '급여 관리'
    },
    children: [

    ]
  }
];

export default payrollRoutes;
