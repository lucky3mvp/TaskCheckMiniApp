import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Block } from '@tarojs/components'
import Empty from 'src/components/Empty'
import RadioButton from 'src/components/RadioGroup'
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
  type: string
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
    type: 'week',
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
  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }
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
    // const {
    //   code,
    //   list = [],
    //   tabs = []
    // } = await getCheckList({
    //   date: date,
    //   returnPlanTabs: !this.state.inited // 后面的请求就不用再请求tabs了
    // })
    const code = 200
    const tabs = [
      {
        beginTime: 1609430400000,
        category: 4,
        description: '如果能重来，希望做一个知识人',
        endTime: null,
        icon: 'reading',
        name: '读书',
        planID: '28ee4e3e601a43f402aa8a9a294acb51',
        theme: 'theme12'
      },
      {
        beginTime: 1609430400000,
        category: 1,
        description: '又A又飒',
        endTime: null,
        icon: 'badminton',
        name: '打球',
        planID: '79550af2601a7409026a6137022e9ca8',
        theme: 'theme14'
      },
      {
        beginTime: 1609430400000,
        category: 1,
        description: '要优雅~~',
        endTime: null,
        icon: 'yoga',
        name: '瑜伽',
        planID: '79550af2601a7525026aa98d1a450897',
        theme: 'theme11'
      },
      {
        beginTime: 1609430400000,
        category: 1,
        description: '想做一条鱼，在水里游来游去',
        endTime: null,
        icon: 'swimming',
        name: '游泳',
        planID: '1526e12a601a79f5020250253d35c871',
        theme: 'theme4'
      },
      {
        beginTime: 1614441600000,
        category: 1,
        description: '减脂减脂',
        endTime: null,
        icon: 'running',
        name: '跳舞、跑步、撸铁',
        planID: '79550af26041e90f0873e7c70e7b0a29',
        theme: 'theme22'
      }
    ]
    const list = [
      {
        achieve: 1,
        actualCheckTime: 1623049227952,
        checkTime: 1623049227952,
        comment: '',
        icon: 'yoga',
        name: '瑜伽',
        planID: '79550af2601a7525026aa98d1a450897',
        theme: 'theme11',
        unit: '1'
      },
      {
        achieve: 500,
        actualCheckTime: 1622981559333,
        checkTime: 1622981559333,
        comment: '读以色列',
        icon: 'reading',
        name: '读书',
        planID: '28ee4e3e601a43f402aa8a9a294acb51',
        theme: 'theme12',
        unit: '6'
      },
      {
        achieve: 1,
        actualCheckTime: 1622981528029,
        checkTime: 1622981528029,
        comment: '6km',
        icon: 'running',
        name: '跳舞、跑步、撸铁',
        planID: '79550af26041e90f0873e7c70e7b0a29',
        theme: 'theme22',
        unit: '1'
      }
    ]
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
  gotoCheckMakeupPage = () => {
    Taro.navigateTo({
      url: `/pages/check-makeup/index?from=check-list&date=${this.state.selectedDate}`
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
  onChangeMode = (o: CommonItemType) => {
    const { selectedDate } = this.state
    const [year, month, date] = selectedDate.split('/') // 2021.06.02 那么拿到的month是6不是5
    /**
     * 当前选中的这一天所在的周/月
     */
    this.setState({
      type: o.value
    })
  }

  render() {
    return (
      <View className={'check-list-page'}>
        <View className={'radio-group-wrapper'}>
          <RadioButton
            value={this.state.type}
            fixedWidth={56}
            mode="fixedWidth"
            onChange={this.onChangeMode}
            options={[
              {
                label: '日',
                value: 'day'
              },
              {
                label: '周',
                value: 'week'
              },
              {
                label: '月',
                value: 'month'
              }
            ]}
          />
        </View>
        <Calendar
          type={this.state.type}
          onDayClick={this.onDayClick}
          plans={this.state.tabs}
          curPlan={this.state.curPlan}
        />
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
                <View className="go-check" onClick={this.gotoCheckMakeupPage}>
                  <View>去补打卡</View>
                  <View className="iconfont icon-right-arrow" />
                </View>
              </Empty>
            )}
          </View>
        ) : !this.state.list.length ? (
          <View className="no-more">
            暂无数据~是不是忘记打卡了？
            <View className="go-check" onClick={this.gotoCheckMakeupPage}>
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
