import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import Calendar from 'src/components/Calendar'

import { Themes } from 'src/constants/config'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Home {
  props: IProps
}

@connect(
  ({ userInfo }) => ({
    userInfo
  }),
  dispatch => ({})
)
class Home extends Component {
  render() {
    return (
      <View className="home-page">
        <Calendar />
        {Themes.map(t => (
          <View className={`test ${t}-background`}></View>
        ))}
      </View>
    )
  }
}

export default Home
