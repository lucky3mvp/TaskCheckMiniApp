import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface PlanDetail {
  props: IProps
}

@connect(
  ({ userInfo }) => ({
    userInfo
  }),
  dispatch => ({})
)
class PlanDetail extends Component {
  render() {
    return <View className=""></View>
  }
}

export default PlanDetail
