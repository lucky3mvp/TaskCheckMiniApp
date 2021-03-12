declare const wx
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'

import Add from 'src/components/Add'
import Empty from 'src/components/Empty'

import { formatTimestamp } from 'src/utils'
import manualEvent from 'src/utils/manualEvent'

import { commonApi } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  loading: boolean
  cur: string
  categories: DaysCategoryType[]
  days: DaysItemType[]
  top: DaysItemType
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class Check extends Component<IProps, IState> {
  lock = false
  state = {
    loading: true,
    cur: 'all',
    categories: [],
    days: [],
    top: {} as DaysItemType
  }
  async componentDidMount() {
    wx.cloud.init()
    this.getDaysList()
    this.getCategoryList()
    manualEvent
      .register('days-list-page')
      .on('update days category', () => {
        this.getCategoryList()
        manualEvent.clear('days-list-page')
      })
      .on('update days list', () => {
        this.getDaysList()
        manualEvent.clear('days-list-page')
      })
  }

  componentDidShow() {
    manualEvent.run('days-list-page')
  }

  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }
  calDayCount(c, d) {
    if (c > d) {
      return Math.floor((c - d) / (24 * 60 * 60 * 1000))
    } else {
      return Math.floor((d - c) / (24 * 60 * 60 * 1000) + 1)
    }
  }
  async getDaysList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    // const { days = [] } = await commonApi({
    //   _scope: 'days',
    //   _type: 'fetchDays'
    // })
    const days = [
      {
        category: '79550af2604180b4085c4f825d82b526',
        cover: '',
        createTime: 1614906915852,
        date: 1614470400000,
        isTop: false,
        name: '第一次跑步撸铁',
        notifyTime: null,
        status: 1,
        userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
        _id: '79550af260418623085d6f370d5ce6f4'
      }
    ]
    console.log('days', days)
    // const f = await Promise.all<string>(
    //   days.map(d => {
    //     if (d.cover) {
    //       return new Promise(resolve => {
    //         wx.cloud.downloadFile({
    //           fileID: d.cover,
    //           success: res => {
    //             resolve(res.tempFilePath)
    //           },
    //           fail: err => {
    //             console.error(err)
    //           }
    //         })
    //       })
    //     }
    //     return Promise.resolve('')
    //   })
    // )
    const r = days.map((d, i) => {
      return {
        ...d,
        // cover: f[i],
        dateFormat: formatTimestamp(d.date, 'yyyy.MM.dd'),
        dayCount: this.calDayCount(d.createTime, d.date)
      }
    })
    const top = r.find(d => d.isTop) || ({} as DaysItemType)
    if (top.cover) {
      // 这页面目前只展示top的图片，其他不用下载下来
      const c = await new Promise<string>(resolve => {
        wx.cloud.downloadFile({
          fileID: top.cover,
          success: res => {
            console.log('download', res.tempFilePath)
            resolve(res.tempFilePath)
          },
          fail: err => {
            console.error(err)
          }
        })
      })
      top.cover = c
    }
    this.setState({
      loading: false,
      days: r,
      top: top
    })
    Taro.hideLoading()
  }
  async getCategoryList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    // const { categories = [] } = await commonApi({
    //   _scope: 'days',
    //   _type: 'fetchCategory'
    // })
    const categories = [
      {
        icon: 'jianshen',
        name: '运动',
        status: 1,
        userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
        _id: '79550af2604180b4085c4f825d82b526'
      }
    ]

    console.log(categories)
    this.setState({
      loading: false,
      categories: categories
    })
    Taro.hideLoading()
  }

  onCategoryChangeToAll = () => {
    this.setState({
      cur: 'all'
    })
  }
  onCategoryChange = (t: DaysCategoryType) => {
    this.setState({
      cur: t._id
    })
  }

  gotoDaysAdd = () => {
    Taro.navigateTo({
      url: '/pages/days-add/index'
    })
  }
  gotoDaysCategory = () => {
    Taro.navigateTo({
      url: '/pages/days-category/index'
    })
  }

  onEdit = (day: DaysItemType) => {
    Taro.setStorageSync('day', day)
    Taro.navigateTo({
      url: '/pages/days-edit/index'
    })
  }

  render() {
    const { top } = this.state
    return this.state.loading ? null : (
      <View className="days-page">
        <Add onClick={this.gotoDaysAdd} />
        {top.name ? (
          <View className="top">
            {top.cover ? (
              <Image className="cover" mode="center" src={top.cover} />
            ) : null}
            <View className="inner">
              <View className="name">{top.name}</View>
              <View className="count-wrapper">
                <View className="count">{top.dayCount}</View>
                {top.dayCount === 0 ? (
                  <View className="unit today">就是今天</View>
                ) : top.createTime > top.date ? (
                  <View className="unit before">天了</View>
                ) : (
                  <View className="unit after">天后</View>
                )}
              </View>
              <View className="date">{top.dateFormat}</View>
            </View>
          </View>
        ) : null}
        <View className="tabs-wrapper border-bottom">
          <View className="tabs">
            <View className="holder" />
            <View
              className={`tab tab-all iconfont icon-all ${
                this.state.cur === 'all' ? 'active' : ''
              }`}
              onClick={this.onCategoryChangeToAll}
            />
            {this.state.categories.map((t: DaysCategoryType) => (
              <View
                className={`tab ${this.state.cur === t._id ? 'active' : ''}`}
              >
                <Image
                  src={require(`../../assets/days/${t.icon}.png`)}
                  className={`img`}
                  onClick={() => {
                    this.onCategoryChange(t)
                  }}
                />
              </View>
            ))}
            <View className="holder" />
          </View>
          <View className="setting" onClick={this.gotoDaysCategory}>
            <View className="iconfont icon-shezhi" />
          </View>
        </View>
        {!this.state.days.length ? (
          <Empty tip="还没有数据哦~" />
        ) : (
          <View className="days">
            {this.state.days.map((d: DaysItemType) => {
              return this.state.cur === 'all' ||
                d.category === this.state.cur ? (
                <Block>
                  <View className="day-item" onClick={() => this.onEdit(d)}>
                    <View className="name">{d.name}</View>
                    <View className="count">{d.dayCount}</View>
                    {d.dayCount === 0 ? (
                      <View className="unit today">就是今天</View>
                    ) : d.createTime > d.date ? (
                      <View className="unit before">天了</View>
                    ) : (
                      <View className="unit after">天后</View>
                    )}
                  </View>
                  <View className="self-border-bottom" />
                </Block>
              ) : null
            })}
          </View>
        )}
      </View>
    )
  }
}

export default Check
