import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'
import Calendar from 'src/components/Calendar'

import { Themes } from 'src/constants/config'

import { getPlanTabList } from 'src/utils/request'

import './index.less'

type PlanTabType = {
  planID: string
  name: string
  description: string
  theme: string
  icon: string
  category: string
  beginTime: string
  endTime: string
}

type PageStateProps = {
  userInfo: UserInfoStoreType
}

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

@connect(
  ({ userInfo }) => ({
    userInfo
  }),
  dispatch => ({})
)
class Home extends Component {
  inited = false
  state = {
    tabs: [],
    cur: 'all'
  }
  async componentDidMount() {
    await this.getPlanTabList()
    setTimeout(() => {
      this.inited = true
    }, 1000)
  }
  componentDidShow() {
    if (this.inited) {
      this.getPlanTabList(this.inited)
    }
  }
  async getPlanTabList(inited = false) {
    !this.inited &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { code, tabs } = await getPlanTabList()
    if (code === 200) {
      this.setState({
        tabs
      })
    }
    // this.setState({
    //   tabs: [
    //     {
    //       planID: '60029aa3720bc4003c52b0ca',
    //       name: '跑步(除周3跑5千米)',
    //       description: '加油',
    //       theme: 'theme1',
    //       icon: 'running',
    //       category: 1,
    //       beginTime: '2021-01-16T00:00:00.000Z',
    //       endTime: '2022-01-01T00:00:00.000Z'
    //     },
    //     {
    //       planID: '60090712f9777f003c2fe9d1',
    //       name: '每月跑3次计划一次6km',
    //       description: '每月跑3次计划',
    //       theme: 'theme11',
    //       icon: 'running',
    //       category: 1,
    //       beginTime: '2021-01-21T00:00:00.000Z',
    //       endTime: null
    //     },
    //     {
    //       planID: '600a7ca9ca7efb003b5be7ec',
    //       name: '计划一每日读书30分',
    //       description: '结束时间是永远主题是1',
    //       theme: 'theme1',
    //       icon: 'reading',
    //       category: 4,
    //       beginTime: '2021-01-22T00:00:00.000Z',
    //       endTime: null
    //     },
    //     {
    //       planID: '600a7d00ca7efb003b5be7ef',
    //       name: '计划二每周3天游泳',
    //       description: '目标是60min结束永远主题8',
    //       theme: 'theme8',
    //       icon: 'swimming',
    //       category: 1,
    //       beginTime: '2021-01-22T00:00:00.000Z',
    //       endTime: null
    //     },
    //     {
    //       planID: '600a7d4eca7efb003b5be7f2',
    //       name: '计划3每周135瑜伽主题15',
    //       description: '20220101结束目标1次',
    //       theme: 'theme15',
    //       icon: 'yoga',
    //       category: 1,
    //       beginTime: '2021-01-22T00:00:00.000Z',
    //       endTime: '2022-01-01T00:00:00.000Z'
    //     },
    //     {
    //       planID: '600a7d91ca7efb003b5be7f5',
    //       name: '计划4每月10天跳绳',
    //       description: '主题22目标1000次20200201开始到永远',
    //       theme: 'theme22',
    //       icon: 'skipping',
    //       category: 1,
    //       beginTime: '2021-02-01T00:00:00.000Z',
    //       endTime: null
    //     },
    //     {
    //       planID: '600a896b6bf2840029f3b1dc',
    //       name: '每日1000步',
    //       description: '111',
    //       theme: 'theme25',
    //       icon: 'running',
    //       category: 1,
    //       beginTime: '2021-01-22T00:00:00.000Z',
    //       endTime: null
    //     }
    //   ]
    // })
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
        <View>报表功能敬请期待</View>
        <View className="iconfont icon-add" onClick={this.onAdd} />
      </View>
    )
  }
}

export default Home
