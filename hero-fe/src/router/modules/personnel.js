const personnelRoutes = [
  {
    path: '/personnel',
    name: 'Personnel',
    component: () => import('@/views/personnel/Index.vue'),
    meta: {
      title: '인사관리'
    },
    children: [

    ]
  }
];

export default personnelRoutes;