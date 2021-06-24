import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import classnames from 'classnames'
import RadioGroup from 'src/components/RadioGroup'
import { getWeekRange } from 'src/utils/index'
import { charts } from 'src/data'
import { commonApi } from 'src/utils/request2.0'

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
  cache: Record<string, any> = {}
  state = {
    tab: 'year',
    curWeek: getWeekRange(this.now),
    curMonth: [
      this.todayYear,
      this.todayMonth // 是 date.getMonth()+1 的值
    ],
    curYear: this.todayYear,
    weekData: [],
    monthData: [],
    yearData: []
  }
  async componentDidMount() {
    switch (this.state.tab) {
      case 'week':
        this.getWeekData()
        break
      case 'month':
        this.getMonthData()
        break
      case 'year':
        this.getYearData()
        break
    }
  }

  componentDidShow() {}

  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }

  async getWeekData() {
    const { curWeek } = this.state
    const [year, month, _day] = curWeek.display[0].split('.') // month是+1的
    const day = parseInt(_day) // 这一周开始的那一天
    const lastDay = new Date(+year, +month, 0).getDate() // 这周开始的那天所在的月份的最后一天
    const dayCount = 7

    let list: ChartsAllResType[] = []
    if (this.cache[`week-${curWeek.display[0]}`]) {
      console.log(`week-${curWeek.display[0]} 命中缓存`)
      list = this.cache[`week-${curWeek.display[0]}`]
    } else {
      console.log(`week-${curWeek.display[0]} 未命中缓存，发起请求`)
      Taro.showLoading({
        title: '请求中'
      })
      // const {code，list: _list} = await commonApi({
      //   _scope: 'charts',
      //   _type: 'chartsAll',
      //   type: 'week',
      //   date: curWeek.display[0].replace(/[.]/g, '/')
      // })
      const { code, list: _list } = {
        code: 200,
        list: charts
      }
      list = _list || []
      this.cache[`week-${curWeek.display[0]}`] = _list
      Taro.hideLoading()
    }

    this.setState({
      weekData: list.map((p: ChartsAllResType) => {
        const days = p.days.split(',')
        const detail: number[] = []
        let j = 0
        for (let i = 0; i < dayCount; i++) {
          if (
            p.detail[j] &&
            ((day + i) % lastDay === p.detail[j].day ||
              day + i === p.detail[j].day)
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
    })
  }

  async getMonthData() {
    const { curMonth } = this.state
    const firstDay = new Date(curMonth[0], curMonth[1] - 1, 1).getDay() // 本月第一天是周几
    const dayCount = new Date(curMonth[0], curMonth[1], 0).getDate() // month是+1的， 本月的最后一天

    let list: ChartsAllResType[] = []
    if (this.cache[`month-${curMonth[0]}.${curMonth[1]}`]) {
      console.log(`month-${curMonth[0]}.${curMonth[1]} 命中缓存`)
      list = this.cache[`month-${curMonth[0]}.${curMonth[1]}`]
    } else {
      console.log(`month-${curMonth[0]}.${curMonth[1]} 未命中缓存，发起请求`)
      Taro.showLoading({
        title: '请求中'
      })
      // const { list = [] } = await commonApi({
      //   _scope: 'charts',
      //   _type: 'chartsAll',
      //   type: 'month',
      //   year: curMonth[0],
      //   month: curMonth[1]
      // })
      const { code, list: _list } = {
        code: 200,
        list: charts
      }
      list = _list || []
      this.cache[`month-${curMonth[0]}.${curMonth[1]}`] = _list
      Taro.hideLoading()
    }

    const allDetail: number[] = []
    const l = list.map((p: ChartsAllResType) => {
      const days = p.days.split(',')
      const detail: number[] = []
      let j = 0
      for (let i = 0; i < dayCount; i++) {
        if (p.detail[j] && p.detail[j].day === i + 1) {
          detail.push(p.detail[j].status)
          j++
        } else {
          if (p.type === 2) {
            detail.push(2)
          } else if (p.type === 3 && p.subType === 2) {
            if (days.indexOf(`${(i + firstDay) % 7}`) >= 0) {
              detail.push(2)
            } else {
              detail.push(3)
            }
          } else {
            detail.push(3)
          }
        }

        // ALL只管有没有打卡记录吧，不管完成没有了
        if (allDetail[i] === undefined) {
          allDetail[i] = detail[i] <= 1 ? 1 : detail[i]
        } else if (allDetail[i] === 2) {
          if (detail[i] === 0 || detail[i] === 1) {
            allDetail[i] = 1
          }
        } else if (allDetail[i] === 3) {
          if (detail[i] === 0 || detail[i] === 1) {
            allDetail[i] = 1
          } else if (detail[i] === 2) {
            allDetail[i] = 2
          }
        }
      }
      return {
        ...p,
        detail: detail
      }
    })
    // @ts-ignore
    const all = {
      name: '全部',
      icon: 'all',
      theme: 'main',
      detail: allDetail
    } as ChartsAllType
    this.setState({
      monthData: [all, ...l]
    })
  }

  async getYearData() {
    const { curYear } = this.state
    /**
     * 闰年判断：
     * 年份能被4整除，但不能被100整除
     * 年份能被400整除
     */
    const dayCount =
      (curYear % 4 === 0 && curYear % 100 !== 0) || curYear % 400 === 0
        ? 366
        : 365

    let list: ChartsAllResType[] = []
    if (this.cache[`year-${curYear}`]) {
      console.log(`year-${curYear} 命中缓存`)
      list = this.cache[`year-${curYear}`]
    } else {
      console.log(`year-${curYear} 未命中缓存，发起请求`)
      Taro.showLoading({
        title: '请求中'
      })
      // const { code, list = [] } = await commonApi({
      //   _scope: 'charts',
      //   _type: 'chartsAll',
      //   type: 'year',
      //   year: curYear
      // })
      const { code, list: _list } = {
        code: 200,
        list: charts
      }
      list = _list || []
      this.cache[`year-${curYear}`] = _list
      Taro.hideLoading()
    }

    const allDetail: number[] = []
    const l = list.map((p: ChartsAllResType) => {
      const days = p.days.split(',')
      const detail: number[] = []
      let j = 0
      for (let i = 0; i < dayCount; i++) {
        if (p.detail[j] && p.detail[j].day === i + 1) {
          detail.push(p.detail[j].status)
          j++
        } else {
          // if (p.type === 2) {
          //   detail.push(2)
          // } else if (p.type === 3 && p.subType === 2) {
          //   if (days.indexOf(`${(i + 1) % 7}`) >= 0) {
          //     detail.push(2)
          //   } else {
          //     detail.push(3)
          //   }
          // } else {
          //   detail.push(3)
          // }
          detail.push(2)
        }
        // ALL只管有没有打卡记录吧，不管完成没有了
        if (allDetail[i] === undefined) {
          allDetail[i] = detail[i] <= 1 ? 1 : detail[i]
        } else if (allDetail[i] === 2) {
          if (detail[i] === 0 || detail[i] === 1) {
            allDetail[i] = 1
          }
        } else if (allDetail[i] === 3) {
          if (detail[i] === 0 || detail[i] === 1) {
            allDetail[i] = 1
          } else if (detail[i] === 2) {
            allDetail[i] = 2
          }
        }
      }
      return {
        ...p,
        detail: detail
      }
    })
    // @ts-ignore
    const all = {
      name: '全部',
      icon: 'all',
      theme: 'main',
      detail: allDetail
    } as ChartsAllType
    this.setState(
      {
        yearData: [all, ...l]
      },
      () => {
        console.log(this.state.yearData)
      }
    )
  }

  onTabChange = (o: CommonItemType) => {
    this.setState({
      tab: o.value
    })
    switch (o.value) {
      case 'week':
        this.getWeekData()
        break
      case 'month':
        this.getMonthData()
        break
      case 'year':
        this.getYearData()
        break
    }
  }
  onWeekPrev = () => {
    const newWeek = getWeekRange(
      new Date(this.state.curWeek.date[0].getTime() - 1000)
    )
    this.setState(
      {
        curWeek: newWeek
      },
      () => {
        this.getWeekData()
      }
    )
  }
  onWeekNext = () => {
    const { curWeek } = this.state
    if (this.todayWeek.display[1] === curWeek.display[1]) return
    // date[1]存的是这一天的凌晨零点
    const newWeek = getWeekRange(
      new Date(curWeek.date[1].getTime() + 24 * 60 * 60 * 1000)
    )
    this.setState(
      {
        curWeek: newWeek
      },
      () => {
        this.getWeekData()
      }
    )
  }
  onMonthPrev = () => {
    const { curMonth } = this.state
    // 上一月的最后一天
    const end = new Date(curMonth[0], curMonth[1] - 1, 0)
    const y = end.getFullYear()
    const m = end.getMonth() + 1
    const start = new Date(y, m, 1)
    this.setState(
      {
        curMonth: [y, m]
      },
      () => {
        this.getMonthData()
      }
    )
  }
  onMonthNext = () => {
    const { curMonth } = this.state
    if (curMonth[0] === this.todayYear && curMonth[1] === this.todayMonth)
      return
    // 下一月的第一天
    const start = new Date(curMonth[0], curMonth[1], 1)
    const y = start.getFullYear()
    const m = start.getMonth() + 1
    const end = new Date(y, curMonth[1] + 1, 0)
    this.setState(
      {
        curMonth: [y, m]
      },
      () => {
        this.getMonthData()
      }
    )
  }
  onYearPrev = () => {
    this.setState(
      {
        curYear: this.state.curYear - 1
      },
      () => {
        this.getYearData()
      }
    )
  }
  onYearNext = () => {
    const { curYear } = this.state
    if (curYear === this.todayYear) return
    this.setState(
      {
        curYear: curYear + 1
      },
      () => {
        this.getYearData()
      }
    )
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
              {this.state.curMonth[0]}.
              {this.state.curMonth[1] < 10
                ? `0${this.state.curMonth[1]}`
                : this.state.curMonth[1]}
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
                </View>
              ))}
            </View>
          </View>
        ) : this.state.tab === 'month' ? (
          <View className="month">
            {this.state.monthData.map((p: ChartsAllType) => {
              return (
                <View className={`month-charts ${p.theme}-border-color`}>
                  <View className={`header ${p.theme}-color`}>
                    <View className={`iconfont icon-${p.icon}`} />
                    <View className="name">{p.name}</View>
                  </View>
                  <View className="days">
                    {p.detail.map((s, i) => {
                      return (
                        <View
                          className={classnames('square', {
                            opacity: s === 0,
                            [`${p.theme}-background`]: s === 1 || s === 0,
                            gray: s === 2,
                            'no-need': s === 3
                          })}
                        >
                          {i + 1}
                        </View>
                      )
                    })}
                  </View>
                </View>
              )
            })}
          </View>
        ) : (
          <View className="year">
            {this.state.yearData.map((p: ChartsAllType) => {
              return (
                <View className={`year-charts ${p.theme}-border-color`}>
                  <View className={`header ${p.theme}-color`}>
                    <View className={`iconfont icon-${p.icon}`} />
                    <View className="name">{p.name}</View>
                  </View>
                  <View className="days">
                    {/* 垂直排列 */}
                    {p.detail.map((s, i) => {
                      return (
                        <View
                          className={classnames('square', {
                            opacity: s === 0,
                            [`${p.theme}-background`]: s === 1 || s === 0,
                            gray: s === 2,
                            'no-need': s === 3
                          })}
                        ></View>
                      )
                    })}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {(this.state.tab === 'week' || this.state.tab === 'month') && (
          <View className="legend">
            <View className="legend-item">
              <View className="square main" />
              <View>打卡并完成当日计划/当日有打卡某一计划(“全部”图表)</View>
            </View>
            <View className="legend-item">
              <View className="square main opacity" />
              <View>打卡未完成当日计划</View>
            </View>
            <View className="legend-item">
              <View className="square main gray" />
              <View>未打卡当日计划/当日未打卡任一计划(“全部”图表)</View>
            </View>
            <View className="legend-item">
              <View className="square no-need" />
              <View>当日无固定计划</View>
            </View>
          </View>
        )}

        {this.state.tab === 'year' && (
          <View className="legend">
            <View className="legend-item">
              <View className="square main" />
              <View>当日有打卡某一计划</View>
            </View>
            <View className="legend-item">
              <View className="square main gray" />
              <View>当日未打卡任一计划</View>
            </View>
          </View>
        )}
      </View>
    )
  }
}

export default Charts
