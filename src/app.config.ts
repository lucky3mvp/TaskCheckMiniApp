export default {
  pages: [
    'pages/check/index',
    'pages/days-matter/index',
    'pages/my/index',
    'pages/plan-add/index',
    'pages/plan-edit/index',
    'pages/plan-list/index',
    'pages/check-list/index',
    'pages/menstruation/index',
    'pages/reading-list/index',
    'pages/reading-add/index'
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
        text: '今日',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      // {
      //   pagePath: 'pages/check/index',
      //   text: '今日',
      //   iconPath: 'assets/check.png',
      //   selectedIconPath: 'assets/check-active.png'
      // },
      {
        pagePath: 'pages/days-matter/index',
        text: '工具',
        iconPath: 'assets/clock.png',
        selectedIconPath: 'assets/clock-active.png'
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'assets/me.png',
        selectedIconPath: 'assets/me-active.png'
      }
    ]
  }
}
