import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'
import Calendar from 'src/components/Calendar'

import { Themes } from 'src/constants/config'

import { getPlanTabList } from 'src/utils/request2.0'
import manualEvent from 'src/utils/manualEvent'

import './index.less'

type PlanTabType = {
  planID: string
  name: string
  description: string
  theme: string
  icon: string
  category: string
  beginTime: number
  endTime: number
}

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  cur: string
  tabs: Array<PlanTabType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Home {
  props: IProps
}

@connect()
class Home extends Component {
  state = {
    tabs: [],
    cur: 'all'
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
        <Calendar />
        {/* <View>报表功能敬请期待</View> */}
        <View className="iconfont icon-add" onClick={this.onAdd} />
      </View>
    )
  }
}

export default Home
