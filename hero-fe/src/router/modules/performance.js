const performanceRoutes = [
  {
    path: '/performance',
    name: 'Performance',
    component: () => import('@/views/performance/Index.vue'),
    meta: {
      title: '평가 관리'
    },
    children: [

    ]
  }
];

export default performanceRoutes;
