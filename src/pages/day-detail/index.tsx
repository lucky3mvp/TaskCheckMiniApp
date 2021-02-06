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

type IState = {
  planList: Array<PlanType>
  checkList: Array<CheckListItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ userInfo }) => ({
    userInfo
  }),
  dispatch => ({})
)
class DayDetail extends Component<IProps, IState> {
  dateObj = new Date()
  dateStr = ''
  topBar = {
    list: ['打卡记录', '打卡计划'],
    pos: [pxTransform(52), pxTransform(176), pxTransform(300)]
  }
  state = {
    planList: [],
    checkList: []
  }
  componentDidMount() {
    // @ts-ignore
    const { params } = getCurrentInstance().router
    let _params = params
    if (!params) {
      const now = new Date()
      _params = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      }
    }
    const { year, month, day } = _params
    this.dateObj = new Date(+year, +(month - 1), +day)
    this.dateStr = formatDate(this.dateObj, 'yyyy/MM/dd')
    Taro.setNavigationBarTitle({
      title: this.dateStr.split('/').join('-')
    })
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  render() {
    return <View className="day-detail-page">{this.state.date}</View>
  }
}

export default DayDetail
