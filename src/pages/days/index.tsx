import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import Add from 'src/components/Add'
import Empty from 'src/components/Empty'
import Modal from 'src/components/Modal'
import SelfInput from 'src/components/SelfInput'

import { formatDate } from 'src/utils'
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
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class Check extends Component<IProps, IState> {
  lock = false
  state = {
    loading: true,
    cur: 'all',
    categories: [],
    days: []
  }
  async componentDidMount() {
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

  async getDaysList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    // const { code, days } = await commonApi({
    //   _scope: 'days',
    //   _type: 'fetchDays'
    // })
    // if (code === 200) {
    //   this.setState({
    //     days
    //   })
    // }
    this.setState({
      loading: false,
      days: [
        {
          _id: '111',
          name: 'test',
          category: '1111',
          date: '2021/02/01',
          dayCount: 0
        }
      ]
    })
    Taro.hideLoading()
  }
  async getCategoryList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    // const { code, categories } = await commonApi({
    //   _scope: 'days',
    //   _type: 'fetchCategory'
    // })
    // if (code === 200) {
    //   this.setState({
    //     list: categories
    //   })
    // }
    this.setState({
      loading: false,
      categories: [
        {
          _id: '1111',
          name: '生活',
          icon: 'life',
          status: 1
        },
        {
          _id: '22222',
          name: '生活222',
          icon: 'study',
          status: 1
        }
      ]
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

  render() {
    return this.state.loading ? null : (
      <View className="days-page">
        <Add onClick={this.gotoDaysAdd} />
        <View className="tabs border-bottom">
          <View className="holder" />
          <View
            className={`tab tab-all iconfont icon-all ${
              this.state.cur === 'all' ? 'active' : ''
            }`}
            onClick={this.onCategoryChangeToAll}
          />
          {this.state.categories.map((t: DaysCategoryType) => (
            <View className={`tab ${this.state.cur === t._id ? 'active' : ''}`}>
              <Image
                src={require(`../../assets/days/${t.icon}.png`)}
                className={`img`}
                onClick={() => {
                  this.onCategoryChange(t)
                }}
              />
            </View>
          ))}
          <View className="holder-right" />
          <View className="setting" onClick={this.gotoDaysCategory}>
            <View className="iconfont icon-shezhi" />
          </View>
        </View>
        {!this.state.days.length ? (
          <Empty tip="还没有数据哦~" />
        ) : (
          <View className="days">
            {this.state.days.map((d: DaysItemType) => (
              <View className="day-item">
                <View className="name">{d.name}</View>
                <View>还有</View>
                <View className="count">{d.dayCount}</View>
                <View className="unit">天</View>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }
}

export default Check
