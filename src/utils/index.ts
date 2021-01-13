import Taro from '@tarojs/taro'

export const isIpx = () => {
  const systemInfo = Taro.getSystemInfoSync()
  const { screenHeight, screenWidth, system } = systemInfo
  return (
    system.toLowerCase().indexOf('ios') >= 0 && screenHeight / screenWidth > 1.8
  )
}
