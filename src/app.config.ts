export default {
  pages: [
    'pages/check/index',
    'pages/check-makeup/index',
    'pages/days-list/index',
    'pages/days-add/index',
    'pages/days-detail/index',
    'pages/days-category/index',
    'pages/my/index',
    'pages/plan-add/index',
    'pages/plan-edit/index',
    'pages/plan-list/index',
    'pages/check-list/index',
    'pages/menstruation/index',
    'pages/reading-list/index',
    'pages/reading-add/index',
    'pages/charts-all/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    onReachBottomDistance: 100,
    enablePullDownRefresh: false
  },
  tabBar: {
    color: '#222222',
    selectedColor: '#ee8787',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    position: 'bottom',
    list: [
      {
        pagePath: 'pages/check/index',
        text: 'Today',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/charts-all/index',
        text: 'Charts',
        iconPath: 'assets/charts.png',
        selectedIconPath: 'assets/charts-active.png'
      },
      {
        pagePath: 'pages/my/index',
        text: 'My',
        iconPath: 'assets/me.png',
        selectedIconPath: 'assets/me-active.png'
      }
    ]
  }
}
