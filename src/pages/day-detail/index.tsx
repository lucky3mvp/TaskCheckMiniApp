import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'

import { formatDate } from 'src/utils'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ userInfo }) => ({
    userInfo
  }),
  dispatch => ({})
)
class DayDetail extends Component<IProps, IState> {
  date = ''
  componentDidMount() {
    this.date =
      getCurrentInstance().router!?.params.date ||
      formatDate(new Date(), 'yyyy/MM/dd')
    // todo
    Taro.setNavigationBarTitle({ title: this.date.split('/').join('-') })
  }
  render() {
    return <View className="day-detail-page"></View>
  }
}

export default DayDetail
