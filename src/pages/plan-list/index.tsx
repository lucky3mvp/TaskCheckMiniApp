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
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
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
    // const unStarted = [
    //   {
    //     beginTime: 1617206400000,
    //     category: 1,
    //     days: '',
    //     description: '从来、坚持、都不是、轻而易举',
    //     endTime: 1635609600000,
    //     goal: 1500,
    //     icon: 'skipping',
    //     name: '跳绳',
    //     planID: '28ee4e3e601a799802b49d9200bd73a8',
    //     status: 1,
    //     subType: 1,
    //     theme: 'theme20',
    //     times: 3,
    //     type: 3,
    //     unit: '1'
    //   }
    // ]
    // const started = [
    //   {
    //     beginTime: 1609430400000,
    //     category: 4,
    //     days: '0',
    //     description: '如果能重来，希望做一个知识人',
    //     endTime: null,
    //     goal: 300,
    //     icon: 'reading',
    //     monthTimes: 0,
    //     name: '读书',
    //     planID: '28ee4e3e601a43f402aa8a9a294acb51',
    //     status: 2,
    //     subType: 2,
    //     theme: 'theme12',
    //     times: '',
    //     totalTimes: 4,
    //     type: 3,
    //     unit: '6',
    //     weekTimes: 0
    //   }
    // ]
    // const ended = [
    //   {
    //     beginTime: 1609430400000,
    //     category: 4,
    //     days: '0',
    //     description: '如果能重来，希望做一个知识人',
    //     endTime: null,
    //     goal: 300,
    //     icon: 'reading',
    //     monthTimes: 0,
    //     name: '读书',
    //     planID: '28ee4e3e601a43f402aa8a9a294acb51',
    //     status: 3,
    //     subType: 2,
    //     theme: 'theme12',
    //     times: '',
    //     totalTimes: 4,
    //     type: 3,
    //     unit: '6',
    //     weekTimes: 0
    //   }
    // ]
    console.log(unStarted, started, ended)
    this.setState({
      loading: false,
      unStarted,
      started,
      ended
    })
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
    Taro.setStorageSync('plan', plan)
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
