import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'

import CheckModal from 'src/components/CheckModal'
import CheckItem from 'src/components/CheckItem'
import RadioButton from 'src/components/RadioGroup'
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
    isShowModal: false,
    planList: [],
    checkList: [],
    checkItem: {} as CheckPlanType
  }
  async componentDidMount() {}

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
    // const { code, plans = [] } = await getPlanByDate({
    //   date: date
    // })
    const code = 200
    const plans = [
      // {
      //   beginTime: 1609430400000,
      //   category: 1,
      //   days: '',
      //   description: '又A又飒',
      //   endTime: null,
      //   goal: 1,
      //   icon: 'badminton',
      //   name: '打球',
      //   planID: '79550af2601a7409026a6137022e9ca8',
      //   status: 0,
      //   subType: 1,
      //   theme: 'theme14',
      //   times: 1,
      //   totalAchieve: 0,
      //   totalFulfillTimes: 0,
      //   type: 3,
      //   unit: '1',
      //   userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
      //   _id: '79550af2601a7409026a6137022e9ca8'
      // },
      // {
      //   beginTime: 1609430400000,
      //   category: 1,
      //   days: '1,5',
      //   description: '要优雅~~',
      //   endTime: null,
      //   goal: 1,
      //   icon: 'yoga',
      //   name: '瑜伽',
      //   planID: '79550af2601a7525026aa98d1a450897',
      //   status: 1,
      //   subType: 2,
      //   theme: 'theme11',
      //   times: '',
      //   totalAchieve: 1,
      //   totalFulfillTimes: 0,
      //   type: 3,
      //   unit: '1',
      //   userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
      //   _id: '79550af2601a7525026aa98d1a450897'
      // }
    ]
    console.log(plans)
    console.log('getPlanList result: ', plans)
    if (code === 200) {
      const planList = plans.map(
        (p: CheckPlanMidType): CheckPlanType => ({
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
    // const { code, list = [] } = await getCheckList({
    //   date: date,
    //   dateEnd: '',
    //   returnPlanTabs: false
    // })
    const list = [
      {
        achieve: 1,
        actualCheckTime: 1623328722360,
        checkTime: 1623328722360,
        comment: '跑步机6.5公里',
        icon: 'running',
        name: '跳舞、跑步、撸铁',
        planID: '79550af26041e90f0873e7c70e7b0a29',
        theme: 'theme22',
        unit: '1',
        _id: 'cbddf0af60c207d20f702904456b256e'
      }
    ]
    const cl = list.map(l => ({
      ...l,
      checkTime: formatDate(new Date(l.checkTime), 'yyyy.MM.dd hh:mm'),
      actualCheckTime:
        l.actualCheckTime && l.actualCheckTime !== l.checkTime
          ? formatDate(new Date(l.actualCheckTime), 'yyyy.MM.dd hh:mm')
          : '',
      isShowComment: false
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
    // 能打卡的话应该是在plan tab，所以直接就getPlanList吧
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
            <RadioButton
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
                <View className="no-more">暂无计划~</View>
              ) : (
                this.state.planList.map((p: CheckPlanType) => (
                  <CheckItem key={p.planID} onClick={this.onCheck} plan={p} />
                ))
              )}
            </View>
          ) : (
            <View>
              {!this.state.checkList.length ? (
                <View className="no-more">暂无打卡数据~</View>
              ) : (
                this.state.checkList.map((p: CheckPlanType) => (
                  <View className="no-more">打卡数据~</View>
                ))
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
