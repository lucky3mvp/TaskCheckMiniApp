import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import wit from 'src/utils/wit'
import { updateUserInfo } from 'src/store/actions/userInfo'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface TaskList {
  props: IProps
}

@connect(
  ({ userInfo }) => ({
    userInfo
  }),
  dispatch => ({
    updateUserInfo(userInfo) {
      dispatch(updateUserInfo(userInfo))
    }
  })
)
class TaskList extends Component {
  getUserInfo = async () => {
    const [res] = await wit.getUserInfo()
    if (res) {
      this.props.updateUserInfo(res)
    }
  }
  render() {
    return <View className=""></View>
  }
}

export default TaskList
