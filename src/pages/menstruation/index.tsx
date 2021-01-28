import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import Calendar from './Calendar'
import Switch from 'src/components/Switch'

import { getMenstruationDetail } from 'src/utils/request'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  checked: boolean
  status: number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Menstruation {
  props: IProps
}

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class Menstruation extends Component {
  state = {
    checked: false,
    status: 1 // 经期中，
  }
  async componentDidMount() {
    // const {
    //   code,
    //   unStarted = [],
    //   started = [],
    //   ended = []
    // } = await getMenstruationDetail()
    // if (code === 200) {
    //   this.setState({
    //     unStarted,
    //     started,
    //     ended
    //   })
    // }
  }
  onSwitchChange = checked => {
    this.setState({
      checked
    })
  }
  render() {
    return (
      <View
        className={`menstruation-page ${this.props.helper.isIpx ? 'ipx' : ''}`}
      >
        <Calendar
          start=""
          end=""
          onDayClick={() => {
            console.log(11)
          }}
          onMonthChange={(cur, prev) => {
            console.log(cur)
          }}
        />
        <View className="info">
          <View className="instruction border-bottom">
            <View className="ins-item">
              <View className="dot" />
              <View className="txt">经期中</View>
            </View>
            <View className="ins-item">
              <View className="circle" />
              <View className="txt">今天</View>
            </View>
          </View>
          <View className="item border-bottom">
            <View className="txt">状态</View>
            <View className="status">
              <View
                className={`iconfont icon-${
                  this.state.status === 1 ? 'cry' : 'smile'
                }`}
              />
              <View>
                {this.state.status === 1 ? '经期中' : '耶~放心去high'}
              </View>
            </View>
          </View>
          <View className="item border-bottom">
            <View className="txt">开始经期</View>
            <Switch
              theme="theme1"
              checked={this.state.checked}
              onChange={this.onSwitchChange}
            />
          </View>
          {this.state.status === 1 ? (
            <View className="item border-bottom">
              <View className="txt">结束经期</View>
              <Switch
                checked={this.state.checked}
                onChange={this.onSwitchChange}
              />
            </View>
          ) : null}
        </View>
      </View>
    )
  }
}

export default Menstruation
