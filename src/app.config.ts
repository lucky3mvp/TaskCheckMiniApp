export default {
  pages: [
    'pages/home/index', 'pages/clock/index', 'pages/my/index'
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
    selectedColor: '#fa6484',
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
        pagePath: 'pages/clock/index',
        text: 'Better',
        iconPath: 'assets/product.png',
        selectedIconPath: 'assets/product-active.png'
      },
      {
        pagePath: 'pages/my/index',
        text: 'Me',
        iconPath: 'assets/user-center.png',
        selectedIconPath: 'assets/user-center-active.png'
      }
    ]
  }
}
