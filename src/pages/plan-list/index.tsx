import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Swiper, SwiperItem, Block, Image } from '@tarojs/components'
import Empty from 'src/components/Empty'
import TopBar from 'src/components/TopBar'
import ListItem from './ListItem'

import { getPlanList } from 'src/utils/request2.0'
import { pxTransform } from 'src/utils'
import manualEvent from 'src/utils/manualEvent'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  loading: boolean
  index: number
  unStarted: Array<PlanType>
  started: Array<PlanType>
  ended: Array<PlanType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

class PlanList extends Component<IProps, IState> {
  topBar = {
    list: ['未开始计划', '进行中计划', '已结束计划'],
    pos: [pxTransform(52), pxTransform(176), pxTransform(300)]
  }
  state = {
    loading: true,
    index: 1,
    unStarted: [],
    started: [],
    ended: []
  }
  componentDidMount() {
    this.getList(true)
    manualEvent.register('plan-list-page').on('update plan list', () => {
      this.getList()
      manualEvent.clear('plan-list-page')
    })
  }
  componentDidShow() {
    manualEvent.run('plan-list-page')
  }
  async getList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    const {
      code,
      unStarted = [],
      started = [],
      ended = []
    } = await getPlanList()
    if (code === 200) {
      this.setState({
        loading: false,
        unStarted,
        started,
        ended
      })
    }
    Taro.hideLoading()
  }
  onSwiperChange = ({ detail: { current, source } }) => {
    if (source !== 'touch') return
    this.setState({
      index: current
    })
  }
  onTabTap = (index: number) => {
    this.setState({
      index: index
    })
  }
  onClickPlan = (plan: PlanType) => {
    // console.log(plan)
    Taro.setStorageSync('plan', plan)
    // Taro.setStorageSync('plan', {
    //   planID: '6016a48c24afd6002e266422',
    //   name: '打球',
    //   description: '愿球场上有我挥洒汗水的身影',
    //   theme: 'theme14',
    //   icon: 'badminton',
    //   category: 1,
    //   unit: '1',
    //   goal: 1,
    //   type: 3,
    //   subType: 1,
    //   times: 1,
    //   days: '',
    //   beginTime: 1609430400000,
    //   endTime: null
    //     beginTime: 1612396800000
    // category: 1
    // days: ""
    // description: "test"
    // endTime: null
    // goal: 2
    // icon: "badminton"
    // name: "test"
    // planID: "b00064a7601c0bad02d1dc525758910b"
    // status: 2
    // subType: 0
    // theme: "theme1"
    // times: ""
    // totalTimes: 0
    // type: 2
    // unit: "1"
    // })
    Taro.navigateTo({
      url: '/pages/plan-edit/index'
    })
  }
  render() {
    return (
      <View className="plan-list-page">
        <TopBar
          tabList={this.topBar.list}
          index={this.state.index}
          onClick={this.onTabTap}
          tabPositionArr={this.topBar.pos}
        />
        <View className="swiper-wrapper">
          <Swiper
            className="swiper"
            current={this.state.index}
            duration={300}
            onChange={this.onSwiperChange}
          >
            <SwiperItem className="swiper-item">
              {this.state.loading ? null : this.state.unStarted.length ? (
                <View className="swiper-item-scroll">
                  {this.state.unStarted.map(item => (
                    <ListItem
                      {...item}
                      onClick={this.onClickPlan.bind(this, item)}
                    />
                  ))}
                </View>
              ) : (
                <Empty tip="暂无未开始计划" />
              )}
            </SwiperItem>
            <SwiperItem className="swiper-item">
              {this.state.loading ? null : this.state.started.length ? (
                <View className="swiper-item-scroll">
                  {this.state.started.map(item => (
                    <ListItem
                      {...item}
                      onClick={this.onClickPlan.bind(this, item)}
                    />
                  ))}
                </View>
              ) : (
                <Empty tip="暂无进行中计划" />
              )}
            </SwiperItem>
            <SwiperItem className="swiper-item">
              {this.state.loading ? null : this.state.ended.length ? (
                <View className="swiper-item-scroll">
                  {this.state.ended.map(item => (
                    <ListItem {...item} />
                  ))}
                </View>
              ) : (
                <Empty tip="暂无已结束计划" />
              )}
            </SwiperItem>
          </Swiper>
        </View>
      </View>
    )
  }
}

export default PlanList
