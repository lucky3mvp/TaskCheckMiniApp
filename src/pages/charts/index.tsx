import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import classnames from 'classnames'
import RadioGroup from 'src/components/RadioGroup'
import { getWeekRange } from 'src/utils/index'
import { charts } from 'src/data'
import { common } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  tab: string
  curWeek: WeekRangType
  curMonth: number[]
  curYear: number
  weekData: ChartsAllType[]
  monthData: ChartsAllType[]
  yearData: ChartsAllType[]
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class Charts extends Component<IProps, IState> {
  now = new Date()
  todayYear = this.now.getFullYear()
  todayMonth = this.now.getMonth() + 1
  todayWeek: WeekRangType = getWeekRange(this.now)
  state = {
    tab: 'month',
    curWeek: getWeekRange(this.now),
    curMonth: [this.todayYear, this.todayMonth],
    curYear: this.todayYear,
    weekData: [],
    monthData: [],
    yearData: []
  }
  async componentDidMount() {
    this.getWeekData()
  }

  componentDidShow() {}

  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }

  async getWeekData() {
    const { curWeek, curMonth, curYear, tab } = this.state
    const condition: any = {
      _scope: 'charts',
      _type: 'chartsAll',
      type: tab
    }

    let day = -1
    let lastDay = -1
    let dayCount = -1
    if (tab === 'week') {
      condition.date = curWeek.display[0].replace(/[.]/g, '/')

      const [year, month, _day] = curWeek.display[0].split('.') // month是+1的
      day = parseInt(_day) // 这一周开始的那一天
      lastDay = new Date(+year, +month, 0).getDate() // 这周开始的那天所在的月份的最后一天

      dayCount = 7
    } else if (tab === 'month') {
      condition.year = curMonth[0]
      condition.month = curMonth[1]

      dayCount = new Date(curMonth[0], curMonth[1], 0).getDate() // month是+1的， 本月的最后一天
    } else if (tab === 'year') {
      condition.year = curYear

      /**
       * 闰年判断：
       * 年份能被4整除，但不能被100整除
       * 年份能被400整除
       */
      dayCount =
        (curYear % 4 === 0 && curYear % 100 !== 0) || curYear % 400 === 0
          ? 366
          : 365
    }

    // const { code, list = [] } = await common(condition)
    const list = charts

    this.setState(
      {
        weekData: list.map((p: ChartsAllResType) => {
          const detail: number[] = []
          let j = 0
          for (let i = 0; i < dayCount; i++) {
            if (
              (tab === 'week' &&
                p.detail[j] &&
                ((day + i) % lastDay === p.detail[j].day ||
                  day + i === p.detail[j].day)) ||
              (tab === 'month' && p.detail[j].day === i + 1) ||
              tab === 'year'
            ) {
              detail.push(p.detail[j].status)
              j++
            } else {
              /**
               * 0 该天有打卡，但没完成任务
               * 1 该天有打卡，且已完成任务
               * 2 该天有任务，但没打卡，也就没完成任务
               * 3 该天无任务，不需要打卡
               */
              /**
               * 只针对每日计划 & 每周几的计划做这个处理
               * 每周几次&每月几次的不做这个限制
               */
              if (p.type === 2) {
                detail.push(2)
              } else if (p.type === 3 && p.subType === 2) {
                const days = p.days.split(',')
                /**
                 * i + 1 // 表示的是周i
                 */
                if (days.indexOf(`${(i + 1) % 7}`) >= 0) {
                  detail.push(2)
                } else {
                  detail.push(3)
                }
              } else {
                detail.push(3)
              }
            }
          }
          return {
            ...p,
            detail: detail
          }
        })
      },
      () => {
        console.log(this.state.weekData)
      }
    )
  }

  onTabChange = (o: CommonItemType) => {
    this.setState({
      tab: o.value
    })
    // update data
  }
  onWeekPrev = () => {
    const newWeek = getWeekRange(
      new Date(this.state.curWeek.date[0].getTime() - 1000)
    )
    this.setState({
      curWeek: newWeek
    })
    // update data
  }
  onWeekNext = () => {
    const { curWeek } = this.state
    if (this.todayWeek.display[1] === curWeek.display[1]) return
    // date[1]存的是这一天的凌晨零点
    const newWeek = getWeekRange(
      new Date(curWeek.date[1].getTime() + 24 * 60 * 60 * 1000)
    )
    this.setState({
      curWeek: newWeek
    })
    // update data
  }
  onMonthPrev = () => {
    const { curMonth } = this.state
    // 上一月的最后一天
    const end = new Date(curMonth[0], curMonth[1] - 1, 0)
    const y = end.getFullYear()
    const m = end.getMonth() + 1
    const start = new Date(y, m, 1)
    this.setState({
      curMonth: [y, m]
    })
    // update data
  }
  onMonthNext = () => {
    const { curMonth } = this.state
    if (curMonth[0] === this.todayYear && curMonth[1] === this.todayMonth)
      return
    // date[1]存的是这一天的凌晨零点
    const start = new Date(curMonth[0], curMonth[1] - 1, 1)
    const y = start.getFullYear()
    const m = start.getMonth() + 1
    const end = new Date(y, curMonth[1] + 1, 0)
    this.setState({
      curMonth: [y, m]
    })
    // update data
  }
  onYearPrev = () => {
    this.setState({
      curYear: this.state.curYear - 1
    })
    // update data
  }
  onYearNext = () => {
    const { curYear } = this.state
    if (curYear === this.todayYear) return
    this.setState({
      curYear: curYear + 1
    })
    // update data
  }

  render() {
    return (
      <View className="charts-page">
        <RadioGroup
          value={this.state.tab}
          onChange={this.onTabChange}
          options={[
            {
              label: '周报表',
              value: 'week'
            },
            {
              label: '月报表',
              value: 'month'
            },
            {
              label: '年报表',
              value: 'year'
            }
          ]}
        />
        {this.state.tab === 'week' ? (
          <View className="range">
            <View className="arrow-wrapper left" onClick={this.onWeekPrev}>
              <View className="iconfont icon-right-arrow trans" />
            </View>
            <View className="mid">
              {this.state.curWeek.display[0]} ~ {this.state.curWeek.display[1]}
            </View>
            <View
              className={`arrow-wrapper right ${
                this.todayWeek.display[1] === this.state.curWeek.display[1]
                  ? 'disable'
                  : ''
              }`}
              onClick={this.onWeekNext}
            >
              <View className="iconfont icon-right-arrow" />
            </View>
          </View>
        ) : this.state.tab === 'month' ? (
          <View className="range">
            <View className="arrow-wrapper left" onClick={this.onMonthPrev}>
              <View className="iconfont icon-right-arrow trans" />
            </View>
            <View className="mid">
              {this.state.curMonth[0]}.{this.state.curMonth[1]}
            </View>
            <View
              className={`arrow-wrapper right ${
                this.state.curMonth[0] === this.todayYear &&
                this.state.curMonth[1] === this.todayMonth
                  ? 'disable'
                  : ''
              }`}
              onClick={this.onMonthNext}
            >
              <View className="iconfont icon-right-arrow" />
            </View>
          </View>
        ) : (
          <View className="range">
            <View className="arrow-wrapper left" onClick={this.onYearPrev}>
              <View className="iconfont icon-right-arrow trans" />
            </View>
            <View className="mid">{this.state.curYear}</View>
            <View
              className={`arrow-wrapper right ${
                this.state.curYear === this.todayYear ? 'disable' : ''
              }`}
              onClick={this.onYearNext}
            >
              <View className="iconfont icon-right-arrow" />
            </View>
          </View>
        )}

        {this.state.tab === 'week' ? (
          <View className="week">
            <View className="week-charts">
              <View className="row th">
                <View className="col-1"></View>
                {['一', '二', '三', '四', '五', '六', '日'].map(o => (
                  <View className={`col`}>{o}</View>
                ))}
                {/* <View className="col"></View> */}
              </View>
              {this.state.weekData.map((p: ChartsAllType) => (
                <View className="row">
                  <View className={`col-1 ${p.theme}-color`}>
                    <View className={`iconfont icon-${p.icon}`} />
                    <View className={`name`}>{p.name}</View>
                  </View>
                  {p.detail.map(s => (
                    <View className="col">
                      <View
                        className={classnames('square', {
                          opacity: s === 0,
                          [`${p.theme}-background`]: s === 1 || s === 0,
                          gray: s === 2,
                          'no-need': s === 3
                        })}
                      />
                    </View>
                  ))}
                  {/* <View className="col"></View> */}
                </View>
              ))}
            </View>
            <View className="week-legend">
              <View className="legend-item">
                <View className="square main" />
                <View>打卡并完成当日计划</View>
              </View>
              <View className="legend-item">
                <View className="square main opacity" />
                <View>打卡未完成当日计划</View>
              </View>
              <View className="legend-item">
                <View className="square main gray" />
                <View>当日有计划未打卡</View>
              </View>
              <View className="legend-item">
                <View className="square no-need" />
                <View>当日无固定计划</View>
              </View>
            </View>
          </View>
        ) : this.state.tab === 'month' ? (
          <View>月报表</View>
        ) : (
          <View>年报表</View>
        )}
      </View>
    )
  }
}

export default Charts
