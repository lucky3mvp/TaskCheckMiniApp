import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Textarea, Text, Image } from '@tarojs/components'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

type PageOwnProps = {}

type PageState = {
  value: string
}

type IProps = PageStateProps & PageOwnProps

interface Feedback {
  props: IProps
}

@connect(({ helper }) => ({
  helper
}))
class Feedback extends Component {
  state = { value: '' }
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
      <View className={`feedback-page ${this.props.helper.isIpx ? 'ipx' : ''}`}>
        <View className="text-area-wrapper">
          <Textarea
            className="text-area"
            placeholder="请描述你的问题，或是输入你的意见、反馈"
            holdKeyboard
            disableDefaultPadding
            cursorSpacing={20}
            onBlur={this.onBlur}
            onInput={this.onInput}
          />
        </View>
        <View className="btn-wrapper">
          <View className="btn" onClick={this.onSubmit}>
            提交
          </View>
        </View>
      </View>
    )
  }
}

export default Feedback
