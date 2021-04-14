declare const wx
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'

import { ReadingStatusMap } from 'src/constants/config'

import Picker from 'src/components/Picker'
import Add from 'src/components/Add'
import Empty from 'src/components/Empty'
import manualEvent from 'src/utils/manualEvent'

import { formatDate } from 'src/utils'

import { commonApi } from 'src/utils/request2.0'

import FinishItem from './FinishItem'
import CommonItem from './CommonItem'

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
  thisYear: number = 2021
  state = {
    list: [],
    loading: true,
    yearOptions: [],
    yearIndex: 1,
    year: new Date().getFullYear(),
    statusOptions: [],
    statusIndex: 3,
    status: 3
  }

  async componentDidMount() {
    manualEvent
      .register('reading-list-page')
      .on('update reading list', (params: { status: number; year: number }) => {
        this.eventHandler(params)
        manualEvent.clear('reading-list-page')
      })

    const s = this.initData()
    this.setState(s)
    this.getReadingList({
      year: s.year,
      status: s.status
    })
  }

  componentDidShow() {
    manualEvent.run('reading-list-page')
  }

  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }

  eventHandler(params: { status: number; year: number }) {
    const yi: CommonItemType = this.state.yearOptions[this.state.yearIndex]
    const si: CommonItemType = this.state.statusOptions[this.state.statusIndex]
    const year = +yi.value
    const status = +si.value
    // 清空之前缓存的数据
    this.cache[`${params.year || this.thisYear}-${status}`] = null
    if (params.status === status) {
      // eg: 当前在未读tab,又去添加了一个未读回来，那应该更新当前未读tab
      this.getReadingList({
        year: year,
        status: status
      })
    } else {
      // 可以先不请求了，后面 statusChange 的时候会去请求
    }
  }

  initData() {
    const yearOptions: Array<CommonItemType> = [
      {
        label: '全部',
        value: '0'
      }
    ]
    const year = new Date().getFullYear()
    this.thisYear = year // 存一下
    let yearIndex = 0
    for (let i = 2021, j = 1; i <= year; i++, j++) {
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
    let status = 3 // 默认选中读完
    let statusIndex = 0
    let index = 0
    for (let key of Object.keys(ReadingStatusMap)) {
      index++
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

  async getReadingList(params: { year: number; status: number }) {
    let d = this.cache[`${params.year}-${params.status}`]
    if (d) {
      console.log('命中缓存')
      this.setState({
        list: d
      })
      return
    }

    Taro.showLoading({
      title: '加载中...'
    })
    console.log('去请求数据', params)
    const { list = [] } = await commonApi({
      _scope: 'reading',
      _type: 'fetchList',
      year: params.year,
      status: params.status
    })
    Taro.hideLoading()

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
    this.getReadingList({
      year: +yi.value,
      status: this.state.status
    })
  }

  onStatusChange = (index: string) => {
    const si: CommonItemType = this.state.statusOptions[index]
    this.setState({
      status: +si.value,
      statusIndex: +index
    })
    this.getReadingList({
      year: this.state.year,
      status: +si.value
    })
  }

  gotoAdd = () => {
    Taro.navigateTo({
      url: '/pages/reading-add/index'
    })
  }

  onUpdate = (type: string, data: ReadingListItemType) => {
    const yi: CommonItemType = this.state.yearOptions[this.state.yearIndex]
    const si: CommonItemType = this.state.statusOptions[this.state.statusIndex]
    const year = +yi.value
    const status = +si.value
    if (type === 'updateBegin') {
      // 未读 -> 在读
      this.cache[`${year}-1`] = null
      this.cache[`${year}-2`] = null
    } else if (type === 'updateFinish') {
      // 1. 未读 -> 已读
      // 2. 在读 -> 已读
      // if (data.status === 1) {
      //   this.cache[`${year}-1`] = null
      // } else if (data.status === 2) {
      //   this.cache[`${year}-2`] = null
      // }
      this.cache[`${year}-${data.status}`] = null
      this.cache[`${year}-3`] = null
    } else if (type === 'delete') {
      this.cache[`${year}-${status}`] = null
    }

    this.getReadingList({
      year,
      status
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
        ) : this.state.status === 3 ? (
          <ScrollView key={this.state.status}>
            {this.state.list.map((item: ReadingListItemType) => {
              return <FinishItem {...item} key={item._id} />
            })}
          </ScrollView>
        ) : (
          <ScrollView key={this.state.status}>
            {this.state.list.map((item: ReadingListItemType) => {
              return (
                <CommonItem {...item} key={item._id} onUpdate={this.onUpdate} />
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
