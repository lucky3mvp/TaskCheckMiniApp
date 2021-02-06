import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'
import Calendar from './Calendar'

import { Themes } from 'src/constants/config'

import { getPlanTabList } from 'src/utils/request2.0'
import manualEvent from 'src/utils/manualEvent'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  cur: string
  tabs: Array<PlanTabType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class Home extends Component<IProps, IState> {
  state = {
    tabs: [],
    cur: 'all'
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  componentDidMount() {
    this.getPlanTabList(true)
    manualEvent.register('home-page').on('update plan tab list', () => {
      this.getPlanTabList()
      manualEvent.clear('home-page')
    })
  }

  componentDidShow() {
    manualEvent.run('home-page')
  }
  async getPlanTabList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { code, tabs } = await getPlanTabList()
    if (code === 200) {
      this.setState({
        tabs
      })
    }
    Taro.hideLoading()
  }
  onAdd = () => {
    Taro.navigateTo({
      url: '/pages/plan-add/index'
    })
  }
  onTabChange = cur => {
    this.setState({
      cur
    })
  }

  gotoDayDetail = (d: DateType) => {
    Taro.navigateTo({
      url: `/pages/day-detail/index?year=${d.year}&month=${d.month}&day=${d.date}`
    })
  }
  render() {
    return (
      <View className="home-page">
        <View className="tabs">
          <View className="holder" />
          <View
            className={`tab tab-all iconfont icon-all ${
              this.state.cur === 'all' ? 'active' : ''
            }`}
            onClick={this.onTabChange.bind(null, 'all')}
          />
          {this.state.tabs.map((t: PlanTabType) => (
            <View
              className={`tab iconfont icon-${t.icon} ${t.theme}-color ${
                this.state.cur === t.planID ? 'active' : ''
              }`}
              onClick={this.onTabChange.bind(null, t.planID)}
            />
          ))}
          <View className="holder" />
        </View>
        <Calendar onDayClick={this.gotoDayDetail} />
        {/* <View>报表功能敬请期待</View> */}
        <View className="iconfont icon-add" onClick={this.onAdd} />
      </View>
    )
  }
}

export default Home
