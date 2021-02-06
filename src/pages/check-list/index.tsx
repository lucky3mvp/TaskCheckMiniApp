import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { ScrollView, View, Button, Text, Image } from '@tarojs/components'
import Empty from 'src/components/Empty'
import Gap from 'src/components/Gap'
import { UnitMap } from 'src/constants/config'
import { getCheckList } from 'src/utils/request2.0'
import { formatDate } from 'src/utils'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  inited: boolean
  pageSize: number
  pageNo: number
  totalPage: number
  totalSize: number
  last: boolean
  list: Array<CheckListItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class CheckList extends Component<IProps, IState> {
  block = false
  state = {
    inited: false,
    pageSize: 15,
    pageNo: 1,
    totalPage: 0,
    totalSize: 0,
    last: false,
    list: []
  }
  componentDidMount() {
    this.fetchCheckList({
      pageSize: this.state.pageSize,
      pageNo: this.state.pageNo
    })
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  async fetchCheckList(pageInfo) {
    !this.state.inited &&
      Taro.showLoading({
        title: '加载中...'
      })
    const {
      code,
      list,
      totalSize,
      totalPage,
      pageSize,
      pageNo
    } = await getCheckList(pageInfo)
    const _list = list.map(l => {
      return {
        ...l,
        checkTime: formatDate(new Date(l.checkTime), 'yyyy.MM.dd hh:mm'),
        isShowComment: false
      }
    })
    if (code === 200) {
      this.setState({
        inited: true,
        list: [...this.state.list, ..._list],
        totalSize,
        totalPage,
        pageSize,
        pageNo,
        last: totalPage === pageNo
      })
    }
    Taro.hideLoading()
  }
  gotoCheck = () => {
    Taro.switchTab({
      url: '/pages/check/index'
    })
  }

  onReachBottom = async () => {
    if (this.block) return
    if (this.state.pageNo < this.state.totalPage) {
      this.block = true
      await this.fetchCheckList({
        pageSize: this.state.pageSize,
        pageNo: this.state.pageNo + 1
      })
      this.block = false
    }
  }

  onClickComment = (index: number) => {
    const { list } = this.state
    const item: CheckListItemType = list[index]
    if (!item.comment) return
    item.isShowComment = !item.isShowComment
    this.setState({
      list: [...list]
    })
  }

  render() {
    return (
      <View className="check-list-page">
        {!this.state.inited ? null : !this.state.list.length ? (
          <Empty tip="还没有打卡记录，要加油了鸭！">
            <View className="go-check" onClick={this.gotoCheck}>
              <View>去打卡</View>
              <View className="iconfont icon-right-arrow" />
            </View>
          </Empty>
        ) : (
          <ScrollView
            scrollY
            enableBackToTop
            lowerThreshold={100}
            className="scroll-view"
            onScrollToLower={this.onReachBottom}
          >
            {this.state.list.map((l: CheckListItemType, index) => (
              <View className="check-item">
                <View className="inner border-bottom">
                  <View
                    className={`plan-icon iconfont icon-${l.icon} ${l.theme}-color`}
                  />
                  <View className="info">
                    <View className="detail-item">
                      <View className="name">{l.name}</View>
                      <View className="achieve">
                        {l.achieve} {UnitMap[l.unit]}
                      </View>
                    </View>
                    <View className="detail-item">
                      <View className="time">
                        {l.checkDate} {l.checkTime}
                      </View>
                      {l.comment ? (
                        <View
                          className="check-comment"
                          onClick={this.onClickComment.bind(null, index)}
                        >
                          查看打卡心情
                        </View>
                      ) : null}
                    </View>
                    <View
                      className={`detail-item comment-wrapper ${
                        l.isShowComment ? 'show' : ''
                      }`}
                    >
                      <View className="indicator" />
                      <View className="comment">{l.comment}</View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            {this.state.last ? (
              <View className="no-more">没有更多了嗷</View>
            ) : null}
            {this.props.helper.isIpx ? (
              <Gap height={34} bkg="transparent" />
            ) : null}
          </ScrollView>
        )}
      </View>
    )
  }
}

export default CheckList
