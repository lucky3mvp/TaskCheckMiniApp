import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import Calendar from './Calendar'

import { menstruation } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  status: Array<number>
  nextEnd: MenstruationType | null
  prevStart: MenstruationType | null
  records: MenstruationType[]
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class Menstruation extends Component<IProps, IState> {
  defaultPrevDay = {
    day: 32
  }
  defaultNextDay = {
    day: 0
  }
  /**
   * status:
   * 0-非经期中
   * 1-经期开始的当天
   * 2-经期中
   * 3-经期开始，可以结束的日子
   * 4-经期结束的当天
   */
  state = {
    status: [],
    nextEnd: null,
    prevStart: null,
    records: []
  }
  cache: Record<string, any> = {}
  cur: DateType = {} as DateType
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }
  componentDidMount() {
    const d = new Date()
    this.cur.year = d.getFullYear()
    this.cur.month = d.getMonth() + 1
    this.getCurMonthMenstruationInfo(this.cur.year, this.cur.month)
  }
  getCurMonthMenstruationInfo = async (year: number, month: number) => {
    if (
      year > this.cur.year ||
      (year === this.cur.year && month > this.cur.month)
    ) {
      console.log('不会获取数据')
      this.setState({
        status: [],
        nextEnd: null,
        prevStart: null,
        records: []
      })
      return
    }

    if (this.cache[`${year}/${month}`]) {
      console.log('命中缓存，也不会请求')
      const { records, prevStart, nextEnd } = this.cache[`${year}/${month}`]
      const status = this.handleDayStatus(year, month).map(r => r.status)
      this.setState({
        records,
        prevStart,
        nextEnd,
        status
      })
      return
    }

    console.log('将会获取数据')
    const {
      code,
      data: { records, prevStart, nextEnd }
    } = await menstruation({
      _type: 'fetchDetail',
      year,
      month
    })

    if (code === 200) {
      this.cache[`${year}/${month}`] = {
        records,
        prevStart,
        nextEnd
      }
      const status = this.handleDayStatus(year, month).map(r => r.status)
      this.cache[`${year}/${month}`].status = status
      this.setState({
        records,
        prevStart,
        nextEnd,
        status
      })
    }
  }
  handleDayStatus = (year: number, month: number) => {
    const thisMonthTotalDays = new Date(year, month, 0).getDate()
    const { records = [], prevStart, nextEnd } = this.cache[`${year}/${month}`]
    const r: Array<{
      day: number
      status: number
    }> = []

    if (prevStart && records[0].type === 2) {
      for (let i = 1; i < records[0].day; i++) {
        r.push({
          day: r.length + 1,
          // status: '经期中'
          status: 2
        })
      }
      r.push({
        day: r.length + 1,
        // status: '经期结束'
        status: 4
      })
    } else {
      if (records.length) {
        for (let i = 1; i < records[0].day; i++) {
          r.push({
            day: r.length + 1,
            // status: 'no'
            status: 0
          })
        }
      } else {
        for (let i = 1; i <= thisMonthTotalDays; i++) {
          r.push({
            day: r.length + 1,
            // status: 'no'
            status: 0
          })
        }
      }
    }
    for (let i = 0; i < records.length; i++) {
      if (records[i].type === 1) {
        const s = r.length ? r[r.length - 1].day + 1 : 1
        for (let j = s; j < records[i].day; j++) {
          r.push({
            day: r.length + 1,
            // status: 'no'
            status: 0
          })
        }
        if (i + 1 === records.length) {
          // 证明这是最后一个record了
          if (nextEnd) {
            for (let k = records[i].day; k <= thisMonthTotalDays; k++) {
              r.push({
                day: r.length + 1,
                // status: k === records[i].day ? '经期开始' : '经期中'
                status: k === records[i].day ? 1 : 2
              })
            }
          } else {
            r.push({
              day: r.length + 1,
              // status: '经期开始'
              status: 1
            })
            for (let k = records[i].day + 1; k <= thisMonthTotalDays; k++) {
              r.push({
                day: r.length + 1,
                // status: k <= records[i].day + 6 ? '经期已开始可以结束' : 'no'
                status: k <= records[i].day + 6 ? 3 : 0
              })
            }
          }
        } else {
          if (records[i + 1].type === 2) {
            for (let k = records[i].day; k <= records[i + 1].day; k++) {
              r.push({
                day: r.length + 1,
                // status:
                //   k === records[i].day
                //     ? '经期开始'
                //     : k === records[i + 1].day
                //     ? '经期结束'
                //     : '经期中'
                status:
                  k === records[i].day ? 1 : k === records[i + 1].day ? 4 : 2
              })
            }
          } else {
            r.push({
              day: r.length + 1,
              // status: '经期开始'
              status: 1
            })
            for (let k = records[i].day + 1; k < records[i + 1].day; k++) {
              r.push({
                day: r.length + 1,
                // status: k <= records[i].day + 6 ? '经期已开始可以结束' : 'no'
                status: k <= records[i].day + 6 ? 3 : 0
              })
            }
          }
        }
      } else if (i + 1 === records.length) {
        // record 是结束，结束其实不需要处理，会在前面的if里处理，唯一需要考虑的是，当record是结束，并且是最后一项了，需要处理这之后的时间
        for (let k = records[i].day + 1; k <= thisMonthTotalDays; k++) {
          r.push({
            day: r.length + 1,
            status: 0
          })
        }
      }
    }

    return r
  }
  onPrev = (py: number, pm: number) => {
    if (!this.cache[`${py}/${pm}`]) {
      this.getCurMonthMenstruationInfo(py, pm)
    } else {
      this.setState({
        ...this.cache[`${py}/${pm}`]
      })
    }
  }
  onNext = (ny: number, nm: number) => {
    if (!this.cache[`${ny}/${nm}`]) {
      this.getCurMonthMenstruationInfo(ny, nm)
    } else {
      this.setState({
        ...this.cache[`${ny}/${nm}`]
      })
    }
  }
  onUpdate = async (param: MenstruationType) => {
    await this.getCurMonthMenstruationInfo(param.year, param.month)
  }
  render() {
    return (
      <View
        className={`menstruation-page ${this.props.helper.isIpx ? 'ipx' : ''}`}
      >
        <Calendar
          status={this.state.status}
          prevStartDay={(this.state.prevStart || this.defaultPrevDay).day}
          nextEndDay={(this.state.nextEnd || this.defaultNextDay).day}
          onPrev={this.onPrev}
          onNext={this.onNext}
          onUpdate={this.onUpdate}
        />
      </View>
    )
  }
}

export default Menstruation
