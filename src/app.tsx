import React, { Component } from 'react'
import { Provider } from 'react-redux'
import Taro from '@tarojs/taro'
import wit from './utils/wit'
import { updateUserInfo } from './store/actions/userInfo'
import { updateHelperInfo } from './store/actions/helper'
import { isIpx } from 'src/utils'
import configStore from './store'

const store = configStore()
const { dispatch } = store

import './app.less'

class App extends Component {
  checkUpdate() {
    const updateManager = Taro.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      console.log('check update', res)
      if (res.hasUpdate) {
        Taro.showToast({
          title: '即将有更新请留意',
          icon: 'none'
        })
      }
    })
    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: '有新版本啦！',
        content: '试试新版本吧',
        cancelColor: '#2a90d7',
        confirmColor: '#2a90d7',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          } else {
            Taro.showToast({
              icon: 'none',
              title: '小程序下一次「冷启动」时会使用新版本'
            })
          }
        }
      })
    })
    updateManager.onUpdateFailed(() => {
      Taro.showToast({
        title: '更新失败，下次启动继续...',
        icon: 'none'
      })
    })
  }

  async componentDidMount() {
    const [userInfoRes] = await wit.getUserInfo()
    if (userInfoRes) {
      dispatch(updateUserInfo(userInfoRes))
    }
    dispatch(
      updateHelperInfo({
        isIpx: isIpx()
      })
    )
    this.checkUpdate()
  }

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Provider store={store}>{this.props.children}</Provider>
  }
}

export default App
