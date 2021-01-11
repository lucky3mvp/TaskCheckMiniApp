import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
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

interface TaskAdd {
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
class TaskAdd extends Component {
  render() {
    return <View className="task-add-page"></View>
  }
}

export default TaskAdd
