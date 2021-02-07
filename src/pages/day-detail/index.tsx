import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Swiper, SwiperItem } from '@tarojs/components'
import Empty from 'src/components/Empty'

import { formatDate, pxTransform } from 'src/utils'
import { getPlanByDate } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  plan: string
  loading: boolean
  index: number
  planList: Array<PlanType>
  checkList: Array<CheckListItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class DayDetail extends Component<IProps, IState> {
  dateObj = new Date()
  dateStr: string = ''

  state = {
    plan: '',
    loading: true,
    index: 0,
    planList: [],
    checkList: []
  }
  componentDidMount() {
    // @ts-ignore
    const { params } = getCurrentInstance().router
    let _params = params
    if (!_params.year) {
      const now = new Date()
      _params = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      }
    }
    let { year, month, day } = _params
    this.dateObj = new Date(+year, +(month - 1), +day)
    this.dateStr = formatDate(this.dateObj, 'yyyy/MM/dd')
    Taro.setNavigationBarTitle({
      title: this.dateStr.split('/').join('-')
    })
    this.setState({
      plan: 'all',
      loading: false
    })
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  onSwiperChange = ({ detail: { current, source } }) => {
    if (source !== 'touch') return
    this.setState({
      index: current
    })
  }
  onTabTap = (index: number) => {
    this.setState({
      index
    })
  }
  render() {
    if (this.state.loading) return null
    else if (this.state.plan === 'all') {
      return !this.state.planList.length ? (
        <Empty tip="今天没有打卡计划，enjoy your day~" />
      ) : (
        <View>展示当天的计划和记录</View>
      )
    } else {
      // 每个计划tab进来的
      return !this.state.checkList.length ? (
        <Empty tip="暂无打卡记录" />
      ) : (
        <View>展示当天的打卡记录</View>
      )
    }
  }
}

export default DayDetail
