declare const wx
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'

import { ReadingStatusMap } from 'src/constants/config'

import Picker from 'src/components/Picker'
import Add from 'src/components/Add'
import Empty from 'src/components/Empty'
import manualEvent from 'src/utils/manualEvent'

import { commonApi } from 'src/utils/request2.0'

import Item from './Item'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  isShowList: boolean
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
class ReadingList extends Component<IProps, IState> {
  lock = false
  cache: Record<string, any> = {}
  thisYear: number = 2021
  state = {
    isShowList: true,
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
    wx.cloud.init()

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

  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }

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
    // let list = [
    //   {
    //     _id: 'b00064a760631b2c0ca05dd31764ae9e',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     name: '房思琪的初恋乐园',
    //     cover:
    //       'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/jfRSjZDMz6aY81b3609a7f1a0776de38ee992bd5d9ee.jpg',
    //     status: 3,
    //     comment: '很难过，愿世界和平，love and peace',
    //     createTime: 1616457600000,
    //     finishTime: 1616457600000
    //   },
    //   {
    //     _id: '28ee4e3e605451730b81d0bc1023cc79',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     name: '从一到无穷大',
    //     cover:
    //       'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/0mM2yZDCFEPWc95873707abefb5bd950d060d9466027.jpg',
    //     status: 1,
    //     comment: '挺有意思的科普读物，以及核物理真的太难了',
    //     createTime: 1615766400000,
    //     finishTime: 1615766400000
    //   },
    //   {
    //     _id: '79550af260378f70070e9e597f0797cd',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     name: '小王子',
    //     cover:
    //       'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/WqIfq66XcVe8272b96ddb074ddd9c1f1f8283aa73e9e.jpg',
    //     status: 2,
    //     comment: '想做一个温柔的人，被世界温柔以待，love and peace！',
    //     createTime: 1613779200000,
    //     finishTime: 1613779200000
    //   },
    //   {
    //     _id: '28ee4e3e6024f9a70489d1734a9d52d1',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     name: '星空的琴弦',
    //     cover:
    //       'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/QGdCOEItbNCc3f74f07fca950a8c542a5a9dedf8da4c.jpg',
    //     status: 2,
    //     comment: '书名太美啦~~',
    //     createTime: 1612886400000,
    //     finishTime: 1612886400000
    //   },
    //   {
    //     _id: '79550af26024f96b0425ee9134fac983',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     name: '未来简史',
    //     cover:
    //       'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/y6aUpq2CiJ9D7b4af74eb921dd6e47e1183b9e688e18.jpg',
    //     status: 3,
    //     comment: '',
    //     createTime: 1612281600000,
    //     finishTime: 1612281600000
    //   },
    //   {
    //     _id: 'b00064a76024f8fa044fba1049171c66',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     name: '人类简史',
    //     cover:
    //       'cloud://mini-0g21wdbp3f6c8c18.6d69-mini-0g21wdbp3f6c8c18-1304926316/5idTE4G4n3PF8f268473ee877a88ac94f94310d57dcd.jpg',
    //     status: 3,
    //     comment: '',
    //     createTime: 1610380800000,
    //     finishTime: 1610380800000
    //   }
    // ]
    console.log(list)
    Taro.hideLoading()

    this.cache[`${params.year}-${params.status}`] = list
    this.setState(
      {
        loading: false,
        list: list
      },
      async () => {
        // 考虑到下载图片可能需要一定的时间，故把图片的下载拎出来处理，页面可以先渲染其他的数据
        const coverTmpFile = await Promise.all<string>(
          list.map((item: ReadingListItemType, index) => {
            return new Promise(resolve => {
              if (item.cover) {
                wx.cloud.downloadFile({
                  fileID: item.cover,
                  success: res => {
                    // 返回临时文件路径
                    resolve(res.tempFilePath)
                  },
                  fail: err => {
                    resolve('')
                  }
                })
              } else {
                resolve('')
              }
            })
          })
        )
        // const coverTmpFile = [
        //   'http://tmp/XAKFUO4Movu981b3609a7f1a0776de38ee992bd5d9ee.jpg',
        //   'http://tmp/mXkBu4w5mEz5c95873707abefb5bd950d060d9466027.jpg',
        //   'http://tmp/eatwmKr87jaL272b96ddb074ddd9c1f1f8283aa73e9e.jpg',
        //   'http://tmp/ZTcNzugNVown3f74f07fca950a8c542a5a9dedf8da4c.jpg',
        //   'http://tmp/4PLmhSkzF5vy7b4af74eb921dd6e47e1183b9e688e18.jpg',
        //   'http://tmp/nVqjf7bCLvSw8f268473ee877a88ac94f94310d57dcd.jpg'
        // ]
        this.setState({
          list: list.map((item: ReadingListItemType, index) => {
            item.cover = coverTmpFile[index]
            return item
          })
        })
      }
    )
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

  onChangeDisplayMode = () => {
    this.setState({
      isShowList: !this.state.isShowList
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
          <View className="filter-item mode" onClick={this.onChangeDisplayMode}>
            {this.state.isShowList ? (
              <View className="iconfont icon-liebiao" />
            ) : (
              <View className="iconfont icon-suoluetu" />
            )}
          </View>
        </View>
        {!this.state.list.length && <Empty tip="暂无数据..." />}
        {this.state.isShowList && (
          <View>
            {this.state.list.map((item: ReadingListItemType) => {
              return <Item {...item} key={item._id} onUpdate={this.onUpdate} />
            })}
          </View>
        )}
        {!this.state.isShowList && (
          <View className="covers">
            {this.state.list.map((item: ReadingListItemType) => {
              return (
                <View className="item">
                  {item.cover ? (
                    <Image src={item.cover} className="cover" mode="widthFix" />
                  ) : (
                    <Image
                      src={require('../../assets/defaultCover.png')}
                      className="cover"
                      mode="widthFix"
                    />
                  )}
                  <View className="name">{item.name}</View>
                </View>
              )
            })}
          </View>
        )}
        {this.props.helper.isIpx && <View className="gap"></View>}
        <Add onClick={this.gotoAdd} />
      </View>
    )
  }
}

export default ReadingList
