import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Block } from '@tarojs/components'
import Empty from 'src/components/Empty'
import Gap from 'src/components/Gap'
import { UnitMap } from 'src/constants/config'
import { getCheckList } from 'src/utils/request2.0'
import { formatDate, getWeekRangeForCheckList } from 'src/utils'

import manualEvent from 'src/utils/manualEvent'

import './index.less'
import Calendar from './Calendar'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  inited: boolean
  curPlan: string
  tabs: Array<PlanTabType>
  list: Array<CheckListItemType>
  listOrigin: Array<CheckListItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class CheckList extends Component<IProps, IState> {
  cache: Record<string, any> = {}
  block = false
  state = {
    inited: false,
    curPlan: 'all',
    tabs: [],
    list: [],
    listOrigin: []
  }
  lastQueryDate: string[] = []
  componentDidMount() {
    manualEvent
      .register('check-list')
      .on('update current day check list', () => {
        this.fetchCheckList({ isForce: true })
      })
  }
  componentDidShow() {
    manualEvent.run('check-list')
  }
  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }
  fetchCheckList = async (params: Record<string, any> = {}) => {
    console.log('params: ', params)
    const { curPlan } = this.state
    const {
      date = this.lastQueryDate[0],
      dateEnd = this.lastQueryDate[1],
      isForce = false
    } = params

    this.lastQueryDate = [date, dateEnd]

    !this.state.inited &&
      Taro.showLoading({
        title: '加载中...'
      })
    if (this.cache[`${date}-${dateEnd}`] && !isForce) {
      console.log('命中cache，不会请求')
      const listOrigin = this.cache[`${date}-${dateEnd}`]
      this.setState({
        listOrigin: listOrigin,
        list:
          curPlan === 'all'
            ? listOrigin
            : listOrigin.filter((l: CheckListItemType) => {
                return l.planID === curPlan
              })
      })
      return
    }

    console.log('未命中cache，或强制刷新，发起请求')
    const {
      code,
      list = [],
      tabs = []
    } = await getCheckList({
      date: date,
      dateEnd: dateEnd,
      returnPlanTabs: !this.state.inited // 后面的请求就不用再请求tabs了
    })
    console.log(list, tabs)
    if (code === 200) {
      const lo = list.map(l => {
        return {
          ...l,
          checkTime: formatDate(new Date(l.checkTime), 'yyyy.MM.dd hh:mm'),
          actualCheckTime:
            l.actualCheckTime && l.actualCheckTime !== l.checkTime
              ? formatDate(new Date(l.actualCheckTime), 'yyyy.MM.dd hh:mm')
              : '',
          isShowComment: false
        }
      })
      this.setState({
        inited: true,
        listOrigin: lo,
        list:
          curPlan === 'all'
            ? lo
            : lo.filter((l: CheckListItemType) => {
                return l.planID === curPlan
              }),
        tabs: tabs.length ? tabs : this.state.tabs
      })
      this.cache[`${date}-${dateEnd}`] = lo
    }
    Taro.hideLoading()
  }
  gotoCheckPage = () => {
    Taro.switchTab({
      url: '/pages/check/index'
    })
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
  onPlanChange = plan => {
    const { listOrigin } = this.state
    this.setState({
      curPlan: plan.planID,
      list: listOrigin.filter((l: CheckListItemType) => {
        return l.planID === plan.planID
      })
    })
  }
  onPlanChangeToAll = () => {
    const { listOrigin } = this.state
    this.setState({
      curPlan: 'all',
      list: listOrigin
    })
  }

  render() {
    return (
      <View className={'check-list-page'}>
        <Calendar initialType="week" fetch={this.fetchCheckList} />
        {this.state.tabs.length ? (
          <View className="tabs border-bottom">
            <View className="holder" />
            <View
              className={`tab tab-all iconfont icon-all ${
                this.state.curPlan === 'all' ? 'active' : ''
              }`}
              onClick={this.onPlanChangeToAll}
            />
            {this.state.tabs.map((t: PlanTabType) => (
              <View
                className={`tab iconfont icon-${t.icon} ${t.theme}-color ${
                  this.state.curPlan === t.planID ? 'active' : ''
                }`}
                onClick={() => {
                  this.onPlanChange(t)
                }}
              />
            ))}
            <View className="holder" />
          </View>
        ) : null}
        {!this.state.inited ? null : !this.state.tabs.length ? (
          <View className="no-plan-and-no-check">
            <Empty tip="没有打卡任务，enjoy your day~">
              <View className="go-check" onClick={this.gotoCheckPage}>
                <View>去创建计划</View>
                <View className="iconfont icon-right-arrow" />
              </View>
            </Empty>
          </View>
        ) : !this.state.listOrigin.length || !this.state.list.length ? (
          <View className="no-more">
            暂无打卡记录~要加油了鸭！
            <View className="go-check" onClick={this.gotoCheckPage}>
              <View>去打卡</View>
              <View className="iconfont icon-right-arrow" />
            </View>
          </View>
        ) : (
          <Block>
            {this.state.list.map((l: CheckListItemType, index) => (
              <View className="check-item" key={`${l.planID}${index}`}>
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
                        {l.actualCheckTime
                          ? `${l.actualCheckTime} 补打卡`
                          : l.checkTime}
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
            {this.state.list.length ? (
              <View className="no-more">没有更多了嗷~</View>
            ) : null}
            {this.props.helper.isIpx ? (
              <Gap height={34} bkg="transparent" />
            ) : null}
          </Block>
        )}
      </View>
    )
  }
}

export default CheckList
