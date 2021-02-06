import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Textarea, Text, Image } from '@tarojs/components'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
  helper: HelperStoreType
}

type PageOwnProps = {}

type IState = {
  value: string
}

type IProps = PageStateProps & PageOwnProps

@connect(({ userInfo, helper }) => ({
  userInfo,
  helper
}))
class Mood extends Component<IProps, IState> {
  state = {
    value: '',
    list: [
      {
        time: '2020.01.31 13:55',
        comment:
          '黑科技和接口会健康金黑科技和接口会健康金黑科技和接口会健康金黑科技和接口会健康金'
      }
    ]
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  onBlur = ({ detail: { value } }) => {
    this.setState({
      value
    })
  }
  onInput = ({ detail: { value } }) => {
    this.setState({
      value
    })
  }
  onSubmit = () => {
    console.log(this.state.value)
  }
  render() {
    return (
      <View className={`mood-page ${this.props.helper.isIpx ? 'ipx' : ''}`}>
        {/* <View>{this.state.list.map(r => {})}</View>
        <View className="text-area-wrapper">
          <Textarea
            className="text-area"
            placeholder="人间值得"
            holdKeyboard
            disableDefaultPadding
            cursorSpacing={20}
            maxlength={100}
            onBlur={this.onBlur}
            onInput={this.onInput}
          />
          <View className="counter">{this.state.value.length}/100</View>
        </View> */}
        <View className="btn-wrapper">
          <View className="btn" onClick={this.onSubmit}>
            敬请期待
          </View>
        </View>
      </View>
    )
  }
}

export default Mood
