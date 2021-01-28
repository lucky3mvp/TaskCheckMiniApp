import React, { Component } from 'react'
import { Provider } from 'react-redux'
import wit from './utils/wit'
import { updateUserInfo } from './store/actions/userInfo'
import { updateHelperInfo } from './store/actions/helper'
import { isIpx } from 'src/utils'
import configStore from './store'

const store = configStore()
const { dispatch } = store

import './app.less'

class App extends Component {
  async componentDidMount() {
    const [res] = await wit.login()
    const [userInfoRes] = await wit.getUserInfo()
    if (userInfoRes) {
      dispatch(
        updateUserInfo({
          ...(res ? res : {}),
          ...userInfoRes
        })
      )
    }
    dispatch(
      updateHelperInfo({
        isIpx: isIpx()
      })
    )
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
