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
