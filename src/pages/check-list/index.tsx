import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { ScrollView, View, Button, Text, Image } from '@tarojs/components'
import Empty from 'src/components/Empty'
import Gap from 'src/components/Gap'
import { UnitMap } from 'src/constants/config'
import { getCheckList } from 'src/utils/request'
import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  inited: boolean
  pageSize: number
  pageNo: number
  totalPage: number
  totalSize: number
  last: boolean
  list: Array<CheckListItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface CheckList {
  props: IProps
}

@connect(
  ({ userInfo, helper }) => ({
    userInfo,
    helper
  }),
  dispatch => ({})
)
class CheckList extends Component {
  block = false
  state = {
    inited: false,
    pageSize: 10,
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
  async fetchCheckList(pageInfo) {
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
      const t = l.checkTime.split('T')
      return {
        ...l,
        checkDate: `${t[0].replace(/-/g, '.')}`,
        checkTime: `${t[1].split('.')[0]}`
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
            <Gap height={15} bkg="transparent" />
            {this.state.list.map((l: CheckListItemType) => (
              <View className="check-item">
                <View className="check-detail border-bottom">
                  <View className="name">
                    <View
                      className={`iconfont icon-${l.icon} ${l.theme}-color`}
                    />
                    <View>{l.name}</View>
                  </View>
                  <View className="achieve">
                    {l.achieve}
                    {UnitMap[l.unit]}
                  </View>
                </View>
                <View className="check-time">
                  {l.checkDate} {l.checkTime}
                  {l.comment ? (
                    <View className="check-comment">{l.comment}</View>
                  ) : null}
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
