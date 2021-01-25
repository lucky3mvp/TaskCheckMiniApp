import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Swiper, SwiperItem, Block, Image } from '@tarojs/components'
import Empty from 'src/components/Empty'
import TopBar from 'src/components/TopBar'
import ListItem from './ListItem'

import { getPlanList } from 'src/utils/request'
import { pxTransform } from 'src/utils'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  loading: boolean
  index: number
  unStarted: Array<PlanType>
  started: Array<PlanType>
  ended: Array<PlanType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface PlanList {
  props: IProps
}

class PlanList extends Component {
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
  async componentDidMount() {
    Taro.showLoading({
      title: '加载中...'
    })
    // const {
    //   code,
    //   unStarted = [],
    //   started = [],
    //   ended = []
    // } = await getPlanList()
    // if (code === 200) {
    //   this.setState({
    //     unStarted,
    //     started,
    //     ended
    //   })
    // }

    this.setState({
      loading: false,
      unStarted: [
        {
          planID: '600a7d91ca7efb003b5be7f5',
          name: '计划4每月10天跳绳',
          description: '主题22目标1000次20200201开始到永远',
          theme: 'theme22',
          icon: 'skipping',
          category: 1,
          unit: '1',
          goal: 1000,
          type: 4,
          subType: 1,
          times: 10,
          days: '',
          beginTime: '2021-02-01T00:00:00.000Z',
          endTime: null,
          status: 1,
          totalTimes: 0
        }
      ],
      started: [
        {
          planID: '60029aa3720bc4003c52b0ca',
          name: '跑步(除周3跑5千米)',
          description: '加油',
          theme: 'theme1',
          icon: 'running',
          category: 1,
          unit: '4',
          goal: 5,
          type: 3,
          subType: 2,
          days: '0,1,2,4,5,6',
          beginTime: '2021-01-16T00:00:00.000Z',
          endTime: '2022-01-01T00:00:00.000Z',
          status: 2,
          totalTimes: 1
        }
      ],
      ended: [
        {
          planID: '60029aa3720bc4003c52b0ca',
          name: '跑步(除周3跑5千米)',
          description: '加油',
          theme: 'theme1',
          icon: 'running',
          category: 1,
          unit: '4',
          goal: 5,
          type: 3,
          subType: 2,
          days: '0,1,2,4,5,6',
          beginTime: '2021-01-16T00:00:00.000Z',
          endTime: '2022-01-01T00:00:00.000Z',
          status: 2,
          totalTimes: 1
        }
      ]
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
                <Block>
                  {this.state.unStarted.map((item, index) => (
                    <ListItem
                      icon="swimming"
                      theme="theme1"
                      name="游泳"
                      description="健康类就了两块"
                      status={1}
                    />
                  ))}
                </Block>
              ) : (
                <Empty tip="暂无未开始计划" />
              )}
            </SwiperItem>
            <SwiperItem className="swiper-item">
              {this.state.loading ? null : this.state.started.length ? (
                <View className="swiper-item-scroll">
                  {this.state.started.map((item, index) => (
                    <Block>
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                      <ListItem
                        icon="swimming"
                        theme="theme2"
                        name="游泳"
                        description="健康类就了两块"
                        status={2}
                      />
                    </Block>
                  ))}
                </View>
              ) : (
                <Empty tip="暂无进行中计划" />
              )}
            </SwiperItem>
            <SwiperItem className="swiper-item">
              {this.state.loading ? null : this.state.ended.length ? (
                <Block>
                  {this.state.ended.map((item, index) => (
                    <ListItem
                      icon="swimming"
                      theme="theme3"
                      name="游泳"
                      description="健康类就了两块"
                      status={3}
                    />
                  ))}
                </Block>
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
