import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'
import CheckModal from 'src/components/CheckModal'
import CheckItem from 'src/components/CheckItem'
import CheckListItem from 'src/components/CheckListItem'
import RadioGroup from 'src/components/RadioGroup'
import Calendar from './Calendar'
import { formatDate } from 'src/utils'

import { getPlanByDate, getCheckList } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  date: string
  tab: string
  loading: boolean
  isShowModal: boolean
  planList: Array<CheckPlanType>
  checkList: Array<CheckListItemType>
  checkItem: CheckPlanType
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class CheckMakeup extends Component<IProps, IState> {
  lock = false
  cache = {}
  state = {
    date: getCurrentInstance().router!.params.date || '',
    tab: 'plan',
    loading: false,
    isShowModal: false,
    planList: [],
    checkList: [],
    checkItem: {} as CheckPlanType
  }
  async componentDidMount() {
    this.state.tab === 'plan' ? this.getPlanList() : this.getCheckList()
  }

  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }

  async getPlanList(d?: string) {
    const date = d || this.state.date
    if (!date) return
    console.log('getPlanList param: ', d)
    if (this.cache[`plan-${date}`]) {
      console.log('getPlanList 命中缓存')
      this.setState({
        planList: this.cache[`plan-${date}`]
      })
      return
    }
    console.log('getPlanList 发起请求')
    Taro.showLoading({
      title: '加载中...'
    })
    this.setState({
      loading: true
    })
    const { code, plans = [] } = await getPlanByDate({
      date: date
    })
    this.setState({
      loading: false
    })
    Taro.hideLoading()
    console.log('getPlanList result: ', plans)
    if (code === 200) {
      const planList = plans.map(
        (p: CheckPlanResType): CheckPlanType => ({
          ...p,
          days: (p.days || '').split(',')
        })
      )
      this.cache[`plan-${date}`] = planList
      this.setState({
        planList: planList
      })
    }
  }

  async getCheckList(d?: string) {
    const date = d || this.state.date
    if (!date) return
    console.log('getCheckList param: ', date)
    if (this.cache[`check-${date}`]) {
      console.log('getCheckList 命中缓存')
      this.setState({
        planList: this.cache[`check-${date}`]
      })
      return
    }
    console.log('getCheckList 发起请求')
    Taro.showLoading({
      title: '加载中...'
    })
    this.setState({
      loading: true
    })
    const { code, list = [] } = await getCheckList({
      date: date,
      dateEnd: '',
      returnPlanTabs: false
    })
    this.setState({
      loading: false
    })
    Taro.hideLoading()

    const cl = list.map(l => ({
      ...l,
      /* 老数据 actualCheckTime 可能没有 */
      checkTime: formatDate(new Date(l.checkTime), 'hh:mm'),
      actualCheckTime:
        l.actualCheckTime && l.actualCheckTime !== l.checkTime
          ? formatDate(new Date(l.actualCheckTime), 'MM.dd hh:mm')
          : ''
    }))
    console.log('getCheckList result: ', cl)
    this.cache[`check-${date}`] = cl
    this.setState({
      checkList: cl
    })
  }

  onCheck = (p: CheckPlanType) => {
    if (p.status === 1 || p.totalAchieve > p.goal) return // 已完成返回

    this.setState({
      checkItem: p,
      isShowModal: true
    })
  }

  onCloseModal = () => {
    this.setState({
      isShowModal: false
    })
  }

  onSubmitCheck = async () => {
    // 打卡后需要清空之前的缓存
    this.cache[`plan-${this.state.date}`] = ''
    this.cache[`check-${this.state.date}`] = ''
    this.getPlanList()
    this.onCloseModal()
  }

  onDateClick = async (d: string) => {
    this.setState({
      date: d
    })
    switch (this.state.tab) {
      case 'plan':
        this.getPlanList(d)
        break
      case 'check':
        this.getCheckList(d)
        break
      default:
        break
    }
  }

  onTabChange = async (o: CommonItemType) => {
    this.setState({
      tab: o.value
    })
    switch (o.value) {
      case 'plan':
        this.getPlanList()
        break
      case 'check':
        this.getCheckList()
        break
      default:
        break
    }
  }

  render() {
    return (
      <Block>
        <View className="check-makeup-page">
          <Calendar onDateClick={this.onDateClick} />
          <View className={'radio-group-wrapper'}>
            <RadioGroup
              value={this.state.tab}
              onChange={this.onTabChange}
              options={[
                {
                  label: '当日计划',
                  value: 'plan'
                },
                {
                  label: '打卡记录',
                  value: 'check'
                }
              ]}
            />
          </View>
          {this.state.tab === 'plan' ? (
            <View>
              {!this.state.planList.length ? (
                <View className="no-more">
                  {this.state.loading
                    ? ''
                    : this.state.date
                    ? '暂无计划~'
                    : '请选择日期'}
                </View>
              ) : (
                this.state.planList.map((p: CheckPlanType) => (
                  <CheckItem key={p.planID} onClick={this.onCheck} plan={p} />
                ))
              )}
            </View>
          ) : (
            <View>
              {!this.state.checkList.length ? (
                <View className="no-more">
                  {this.state.loading
                    ? ''
                    : this.state.date
                    ? '暂无打卡数据~'
                    : '请选择日期'}
                </View>
              ) : (
                this.state.checkList.map(
                  (c: CheckListItemType, index: number) => (
                    <CheckListItem {...c} key={`${c.planID}${index}`} />
                  )
                )
              )}
            </View>
          )}
        </View>
        <CheckModal
          isMakeUp
          date={this.state.date}
          submitBtnText="补打卡！Keep Going!"
          isShow={this.state.isShowModal}
          onClose={this.onCloseModal}
          onSubmit={this.onSubmitCheck}
          plan={this.state.checkItem}
        />
      </Block>
    )
  }
}

export default CheckMakeup
