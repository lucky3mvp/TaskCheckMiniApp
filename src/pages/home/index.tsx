import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'
import Add from 'src/components/Add'
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
    console.log('fetch')
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    // const { code, tabs } = await getPlanTabList()
    const { code, tabs } = {
      code: 200,
      tabs: [
        {
          planID: '28ee4e3e601a43f402aa8a9a294acb51',
          name: '读书',
          description: '如果能重来，希望做一个知识人',
          theme: 'theme12',
          icon: 'reading',
          category: 4,
          beginTime: 1609430400000,
          endTime: null
        },
        {
          planID: '79550af2601a7409026a6137022e9ca8',
          name: '打球',
          description: '又A又飒',
          theme: 'theme14',
          icon: 'badminton',
          category: 1,
          beginTime: 1609430400000,
          endTime: null
        },
        {
          planID: '79550af2601a7525026aa98d1a450897',
          name: '瑜伽',
          description: '要优雅~~',
          theme: 'theme11',
          icon: 'yoga',
          category: 1,
          beginTime: 1609430400000,
          endTime: null
        },
        {
          planID: '28ee4e3e601a799802b49d9200bd73a8',
          name: '跳绳',
          description: '从来、坚持、都不是、轻而易举',
          theme: 'theme20',
          icon: 'skipping',
          category: 1,
          beginTime: 1617206400000,
          endTime: 1635609600000
        },
        {
          planID: '1526e12a601a79f5020250253d35c871',
          name: '游泳',
          description: '想做一条鱼，在水里游来游去',
          theme: 'theme4',
          icon: 'swimming',
          category: 1,
          beginTime: 1609430400000,
          endTime: null
        }
      ]
    }
    if (code === 200) {
      this.setState({
        tabs
      })
    }
    Taro.hideLoading()
  }
  onTabChange = cur => {
    this.setState({
      cur
    })
  }
  gotoDayDetail = (d: DateType) => {
    // 这里拿到的month就是实际的值，1-12，而不是 0-11
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
        <Add />
      </View>
    )
  }
}

export default Home
