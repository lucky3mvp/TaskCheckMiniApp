import React, { Component } from 'react'
import { Provider } from 'react-redux'
import wit from './utils/wit'
import {updateUserInfo} from './store/actions/userInfo'
import configStore from './store'

const store = configStore()
const {dispatch} = store

import './app.less'


class App extends Component {
  async componentDidMount () {
    const [res] = await wit.login()
    if (res) {
      dispatch(updateUserInfo(res))
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
