export default {
  pages: [
    'pages/home/index',
    'pages/check/index',
    'pages/my/index',
    'pages/plan-add/index',
    'pages/plan-list/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    onReachBottomDistance: 100,
    enablePullDownRefresh: true
  },
  tabBar: {
    color: '#222222',
    selectedColor: '#ee8787',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    position: 'bottom',
    list: [
      {
        pagePath: 'pages/home/index',
        text: 'Now',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/check/index',
        text: 'Better',
        iconPath: 'assets/check.png',
        selectedIconPath: 'assets/check-active.png'
      },
      {
        pagePath: 'pages/my/index',
        text: 'Me',
        iconPath: 'assets/me.png',
        selectedIconPath: 'assets/me-active.png'
      }
    ]
  }
}
