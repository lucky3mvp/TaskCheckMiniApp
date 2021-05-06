import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Block } from '@tarojs/components'
import Empty from 'src/components/Empty'
import Gap from 'src/components/Gap'
import { UnitMap } from 'src/constants/config'
import { getCheckList } from 'src/utils/request2.0'
import { formatDate } from 'src/utils'

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
  selectedDate: string
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
    selectedDate: formatDate(new Date(), 'yyyy/MM/dd'),
    todayDate: formatDate(new Date(), 'yyyy/MM/dd'),
    tabs: [],
    list: [],
    listOrigin: []
  }
  componentDidMount() {
    this.fetchCheckList()
    manualEvent
      .register('check-list')
      .on('update current day check list', () => {
        this.fetchCheckList({ isForce: true })
      })
  }
  componentDidShow() {
    manualEvent.run('check-list')
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }
  async fetchCheckList(params: Record<string, any> = {}) {
    const { date = this.state.selectedDate, isForce = false } = params
    !this.state.inited &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { curPlan, selectedDate } = this.state
    if (this.cache[`${date}`] && !isForce) {
      console.log('命中cache，不会请求')
      const listOrigin = this.cache[`${date}`]
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
    const { code, list = [], tabs = [] } = await getCheckList({
      date: date,
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
      this.cache[`${date}`] = lo
    }
    Taro.hideLoading()
  }
  gotoCheckPage = () => {
    Taro.switchTab({
      url: '/pages/check/index'
    })
  }
  gotoSpecificCheckPage = () => {
    Taro.navigateTo({
      url: `/pages/check-makeup/index?date=${this.state.selectedDate}`
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
  onPlanChange = planTab => {
    const { listOrigin } = this.state
    this.setState({
      curPlan: planTab,
      list:
        planTab === 'all'
          ? listOrigin
          : listOrigin.filter((l: CheckListItemType) => {
              return l.planID === planTab
            })
    })
  }
  onDayClick = ({ year, month, date }) => {
    const d = `${year}/${month < 10 ? '0' : ''}${month}/${
      date < 10 ? '0' : ''
    }${date}`

    if (year < 2021) {
      this.setState({
        curPlan: 'all', // 切换的时候默认换到全部？
        selectedDate: d,
        listOrigin: [],
        list: []
      })
      return
    }

    this.setState(
      {
        curPlan: 'all', // 切换的时候默认换到全部？
        selectedDate: d
      },
      () => {
        this.fetchCheckList({ date: d })
      }
    )
  }

  render() {
    return (
      <View className={'check-list-page'}>
        <Calendar
          onDayClick={this.onDayClick}
          plans={this.state.tabs}
          curPlan={this.state.curPlan}
          onPlanChange={this.onPlanChange}
        />

        {!this.state.inited ? null : !this.state.tabs.length ? (
          <View className="no-plan-and-no-check">
            <Empty tip="没有打卡任务，enjoy your day~">
              <View className="go-check" onClick={this.gotoCheckPage}>
                <View>去创建计划</View>
                <View className="iconfont icon-right-arrow" />
              </View>
            </Empty>
          </View>
        ) : !this.state.listOrigin.length ? (
          <View className="has-plan-but-no-check">
            {this.state.selectedDate === this.state.todayDate ? (
              <Empty tip="还没有打卡记录，要加油了鸭！">
                <View className="go-check" onClick={this.gotoCheckPage}>
                  <View>去打卡</View>
                  <View className="iconfont icon-right-arrow" />
                </View>
              </Empty>
            ) : (
              <Empty tip="没有找到打卡记录，是忘记打卡了嘛？">
                <View className="go-check" onClick={this.gotoSpecificCheckPage}>
                  <View>去补打卡</View>
                  <View className="iconfont icon-right-arrow" />
                </View>
              </Empty>
            )}
          </View>
        ) : !this.state.list.length ? (
          <View className="no-more">
            暂无数据~是不是忘记打卡了？
            <View className="go-check" onClick={this.gotoSpecificCheckPage}>
              <View>去补打卡</View>
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
