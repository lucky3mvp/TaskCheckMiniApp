import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import FormItem from 'src/components/FormItem'
import Gap from 'src/components/Gap'
import Switch from 'src/components/Switch'
import Picker from 'src/components/Picker'
import DatePicker from 'src/components/DatePicker'
import TimePicker from 'src/components/TimePicker'
import SelfInput from 'src/components/SelfInput'
import Footer from 'src/components/Footer'

import { commonApi } from 'src/utils/request2.0'
import manualEvent from 'src/utils/manualEvent'
import { formatDate } from 'src/utils'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  disable: boolean
  name: string
  categoryIndex: string
  categoryOptions: CommonItemType[]
  date: string
  dateInitialValue: Number[]
  isTop: boolean
  notify: boolean
  notifyDate: string
  notifyTime: string
  cover: string
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ helper }) => ({
  helper
}))
class DaysDetail extends Component<IProps, IState> {
  lock = false
  day: DaysItemType
  startDate = new Date(1971, 0, 1)
  endDate = new Date(2051, 11, 31)
  state = {
    disable: true,
    name: '',
    categoryIndex: '',
    categoryOptions: [],
    date: '',
    dateInitialValue: [0, 0, 0],
    isTop: false,
    notify: false,
    notifyDate: '',
    notifyTime: '',
    cover: ''
  }
  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }
  async componentDidMount() {}

  render() {
    return (
      <View className="days-detail-page">
        <View
          className="status-bar"
          style={{
            paddingTop: `${this.props.helper.statusBarHeight}px`
          }}
        />
      </View>
    )
  }
}

export default DaysDetail
