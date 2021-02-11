declare const wx
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image } from '@tarojs/components'

import { ReadingStatusMap, ReadingStatusIconMap } from 'src/constants/config'

import Picker from 'src/components/Picker'
import Add from 'src/components/Add'
import Empty from 'src/components/Empty'
import manualEvent from 'src/utils/manualEvent'

import { formatDate } from 'src/utils'

import { commonApi } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  loading: boolean
  list: Array<ReadingListItemType>
  yearOptions: Array<CommonItemType>
  yearIndex: number
  year: number
  statusOptions: Array<CommonItemType>
  statusIndex: number
  status: number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ helper }) => ({
  helper
}))
class Check extends Component<IProps, IState> {
  lock = false
  cache: Record<string, any> = {}
  state = {
    list: [],
    loading: true,
    yearOptions: [],
    yearIndex: 0,
    year: new Date().getFullYear(),
    statusOptions: [],
    statusIndex: 3,
    status: 3
  }

  async componentDidMount() {
    manualEvent.register('reading-list-page').on('update check list', () => {
      const yi: CommonItemType = this.state.yearOptions[this.state.yearIndex]
      const si: CommonItemType = this.state.statusOptions[
        this.state.statusIndex
      ]
      this.getReadingList(
        {
          year: +yi.value,
          status: +si.value
        },
        false
      )
      manualEvent.clear('reading-list-page')
    })

    const s = this.initData()
    this.setState(s)
    this.getReadingList(
      {
        year: s.year,
        status: s.status
      },
      true
    )
  }

  componentDidShow() {
    manualEvent.run('reading-list-page')
  }

  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }

  initData() {
    const yearOptions: Array<CommonItemType> = []
    const year = new Date().getFullYear()
    let yearIndex = 0
    for (let i = 2021, j = 0; i <= year; i++, j++) {
      if (year === i) {
        yearIndex = j
      }
      yearOptions.push({
        label: `${year}`,
        value: `${year}`
      })
    }
    const statusOptions: Array<CommonItemType> = [
      {
        label: '全部',
        value: '0'
      }
    ]
    let status = 3 // 全部
    let statusIndex = 0
    let index = 0
    for (let key of Object.keys(ReadingStatusMap)) {
      index++ // index 0 是全部
      if (+key === status) {
        statusIndex = index
      }
      statusOptions.push({
        label: `${ReadingStatusMap[key]}`,
        value: `${key}`
      })
    }

    return {
      yearOptions,
      statusOptions,
      yearIndex,
      statusIndex,
      year,
      status: status
    }
  }

  async getReadingList(
    params: {
      year: number
      status: number
    },
    showLoading = false
  ) {
    console.log('请求参数： ', params)
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    let d = this.cache[`${params.year}-${params.status}`]
    if (d) {
      this.setState({
        list: d
      })
      return
    }

    // const { list = [] } = await commonApi({
    //   _scope: 'reading',
    //   _type: 'fetchList',
    //   year: params.year,
    //   status: params.status
    // })

    const list = [
      {
        comment: '书名太美啦~~',
        cover:
          'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/QGdCOEItbNCc3f74f07fca950a8c542a5a9dedf8da4c.jpg',
        createTime: 1612886400000,
        finishTime: 1612886400000,
        name: '星空的琴弦',
        status: 3
      }
    ]

    const r = list.map((l: ReadingListItemType) => ({
      ...l,
      formatCreateTime: l.createTime
        ? formatDate(new Date(l.createTime), 'yyyy.MM.dd')
        : '',
      formatBeginTime: l.beginTime
        ? formatDate(new Date(l.beginTime), 'yyyy.MM.dd')
        : '',
      formatFinishTime: l.finishTime
        ? formatDate(new Date(l.finishTime), 'yyyy.MM.dd')
        : ''
    }))
    this.cache[`${params.year}-${params.status}`] = r
    this.setState({
      loading: false,
      list: r
    })
    console.log(list)
    Taro.hideLoading()
    // 考虑到下载图片可能需要一定的时间，故把图片的下载拎出来处理，页面可以先渲染其他的数据
    // list.map((item: ReadingListItemType, index) => {
    //   if (item.cover) {
    //     wx.cloud.init()
    //     wx.cloud.downloadFile({
    //       fileID:
    //         'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/88hTTWF7qWS23f74f07fca950a8c542a5a9dedf8da4c.jpg',
    //       success: res => {
    //         // 返回临时文件路径
    //         this.setState({
    //           file: res.tempFilePath
    //         })
    //       },
    //       fail: console.error
    //     })
    //   }
    // })
  }

  onYearChange = (index: string) => {
    const yi: CommonItemType = this.state.yearOptions[index]
    this.setState({
      year: +yi.value,
      yearIndex: +index
    })
    this.getReadingList(
      {
        year: +yi.value,
        status: this.state.status
      },
      false
    )
  }

  onStatusChange = (index: string) => {
    const si: CommonItemType = this.state.statusOptions[index]
    this.setState({
      status: +si.value,
      statusIndex: +index
    })
    this.getReadingList(
      {
        year: this.state.year,
        status: +si.value
      },
      false
    )
  }

  gotoAdd = () => {
    Taro.navigateTo({
      url: '/pages/reading-add/index'
    })
  }

  render() {
    return this.state.loading ? null : (
      <View className="reading-list-page">
        <View className="filter">
          <View className="filter-item">
            <View className="filter-item-label">时间：</View>
            <View className="filter-item-picker">
              <Picker
                defaultSelected
                mode="selector"
                placeholder="时间"
                index={+this.state.yearIndex}
                range={this.state.yearOptions}
                onChange={this.onYearChange}
              />
            </View>
            <View className="filter-item-icon iconfont icon-right-arrow" />
          </View>
          <View className="filter-item">
            <View className="filter-item-label">状态：</View>
            <View className="filter-item-picker">
              <Picker
                defaultSelected
                mode="selector"
                placeholder="状态"
                index={+this.state.statusIndex}
                range={this.state.statusOptions}
                onChange={this.onStatusChange}
              />
            </View>
            <View className="filter-item-icon  =iconfont icon-right-arrow" />
          </View>
        </View>
        {!this.state.list.length ? (
          <Empty tip="暂无数据..." />
        ) : (
          <ScrollView key="finish">
            {this.state.list.map((item: ReadingListItemType) => {
              return (
                <View className="finish-item">
                  <View className="finish-item-line" />
                  <View className="finish-item-dot" />
                  <View className="info border-bottom">
                    <View className="time">
                      {item.status === 3
                        ? item.formatFinishTime
                        : item.status === 2
                        ? item.formatBeginTime
                        : item.formatCreateTime}
                    </View>
                    <View className="name">《{item.name}》</View>
                    {item.status === 3 ? (
                      <View className="iconfont icon-gou" />
                    ) : item.status === 2 ? (
                      <View className="iconfont icon-tag icon-zhengzaijinxing" />
                    ) : (
                      <View className="iconfont icon-tag icon-weidu" />
                    )}
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}
        <Add onClick={this.gotoAdd} />
      </View>
    )
  }
}

export default Check
