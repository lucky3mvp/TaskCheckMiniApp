import React, { useMemo, useEffect, useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import classnames from 'classnames'
import { rightArrow } from 'src/assets/svg'
import Switch from 'src/components/Switch'

import { submitMenstruation } from 'src/utils/request'

import './index.less'

type IProps = {
  status: Array<number>
  prevStartDay: number
  nextEndDay: number
  onPrev: (py: number, pm: number) => void
  onNext: (ny: number, nm: number) => void
  onUpdate: (d: MenstruationType) => void
}

export default (props: IProps) => {
  const now = useMemo(() => new Date(), [])
  const todayYear = useMemo(() => now.getFullYear(), [now])
  const todayMonth = useMemo(() => now.getMonth(), [now])
  const todayDate = useMemo(() => now.getDate(), [now])

  const [curYear, setCurYear] = useState(now.getFullYear())
  const [curMonth, setCurMonth] = useState(now.getMonth())
  const displayMonth = useMemo(() => {
    return curMonth + 1 <= 9 ? `0${curMonth + 1}` : curMonth + 1
  }, [curMonth])

  // 本月第一天
  const curMonthFirstDate = useMemo(() => new Date(curYear, curMonth, 1), [
    curYear,
    curMonth
  ])
  // 本月最后一天
  const curMonthLastDate = useMemo(() => new Date(curYear, curMonth + 1, 0), [
    curYear,
    curMonth
  ])
  // 上个月最后一天
  const prevMonthLastDate = useMemo(() => new Date(curYear, curMonth, 0), [
    curYear,
    curMonth
  ])
  // 下个月第一天
  const nextMonthFirstDate = useMemo(() => new Date(curYear, curMonth + 1, 1), [
    curYear,
    curMonth
  ])

  const [days, setDays] = useState<Array<DateType>>([])

  useEffect(() => {
    // 填充上个月的天数
    const arr: Array<DateType> = []
    let prevMonthTotalDays = prevMonthLastDate.getDate()
    const prevMonthYear = prevMonthLastDate.getFullYear()
    const prevMonth = prevMonthLastDate.getMonth()
    for (let i = 0; i < curMonthFirstDate.getDay(); i++) {
      arr.unshift({
        year: prevMonthYear,
        month: prevMonth,
        date: prevMonthTotalDays
      })
      prevMonthTotalDays--
    }
    // 填充本月的天数
    let thisMonthTotalDays = curMonthLastDate.getDate()
    for (let i = 1; i <= thisMonthTotalDays; i++) {
      arr.push({
        year: curYear,
        month: curMonth,
        date: i
      })
    }
    // 填充下个月天数
    const curMonthLastDateDay = curMonthLastDate.getDay()
    const nextMonth = nextMonthFirstDate.getMonth()
    const nextMonthYear = nextMonthFirstDate.getFullYear()
    for (let i = curMonthLastDateDay + 1, j = 1; i <= 6; i++, j++) {
      arr.push({
        year: nextMonthYear,
        month: nextMonth,
        date: j
      })
    }
    setDays(arr)
    return () => {}
  }, [
    curYear,
    curMonth,
    curMonthFirstDate,
    curMonthLastDate,
    prevMonthLastDate,
    nextMonthFirstDate
  ])

  const [selectedDay, setSelectedDay] = useState([
    todayYear,
    todayMonth,
    todayDate
  ])
  const status = useMemo(() => {
    let icon = ''
    let text = ''
    let showStart = false
    let showEnd = false
    if (curYear !== selectedDay[0] || curMonth !== selectedDay[1]) {
      return {
        icon: '',
        text: '',
        showStart: false,
        showEnd: false
      }
    }
    if (props.status[selectedDay[2] - 1] === 1) {
      icon = 'cry'
      text = '经期开始'
    } else if (props.status[selectedDay[2] - 1] === 2) {
      icon = 'cry'
      text = '经期中'
    } else if (props.status[selectedDay[2] - 1] === 3) {
      icon = 'wubiaoqing'
      text = '经期已开始'
      showEnd = true
    } else if (props.status[selectedDay[2] - 1] === 4) {
      icon = 'cry'
      text = '经期结束'
    } else {
      icon = 'smile'
      text = '耶~放心去high'
      showStart = true
    }
    return {
      icon,
      text,
      showStart,
      showEnd
    }
  }, [props.status, selectedDay, todayYear, todayMonth, curMonth, curYear])
  // const [status, setStatus] = useState(statusCallback())
  // useEffect(() => {
  //   setStatus(statusCallback())
  //   return () => {}
  // }, [props.status, selectedDay])

  const onPrev = useCallback(() => {
    const py = prevMonthLastDate.getFullYear()
    const pm = prevMonthLastDate.getMonth()
    setCurYear(py)
    setCurMonth(pm)
    // setStatus({
    //   icon: '',
    //   text: '',
    //   showStart: false,
    //   showEnd: false
    // })
    props.onPrev(py, pm + 1)
  }, [prevMonthLastDate])

  const onNext = useCallback(() => {
    const ny = nextMonthFirstDate.getFullYear()
    const nm = nextMonthFirstDate.getMonth()
    setCurYear(ny)
    setCurMonth(nm)
    // setStatus({
    //   icon: '',
    //   text: '',
    //   showStart: false,
    //   showEnd: false
    // })
    props.onNext(ny, nm + 1)
  }, [nextMonthFirstDate])

  const onDayClick = useCallback(
    (d: DateType) => {
      if (
        d.year > todayYear ||
        (d.year === todayYear &&
          (d.month > todayMonth ||
            (d.month === todayMonth && d.date > todayDate)))
      ) {
        // 今天及之前可点击
        return
      }
      if (d.year < curYear || d.month < curMonth) {
        onPrev()
      } else if (d.year > curYear || d.month > curMonth) {
        onNext()
      }
      setSelectedDay([d.year, d.month, d.date])
    },
    [curYear, curMonth, todayYear, todayMonth, todayDate, props.status]
  )

  const [checked, setChecked] = useState(false)
  const onSwitchChange = useCallback(() => {
    const oldChecked = checked
    const newChecked = !checked
    setChecked(newChecked)
    if (newChecked) {
      Taro.showModal({
        title: '提示',
        content: `确认${status.showStart ? '开始' : '结束'}经期嘛？`,
        success: async function (res) {
          if (res.confirm) {
            const p = {
              year: selectedDay[0],
              month: selectedDay[1] + 1,
              day: selectedDay[2],
              type: status.showStart ? 1 : 2
            }
            const { code } = await submitMenstruation(p)
            if (code === 200) {
              setChecked(false)
              props.onUpdate(p)
            }
          } else if (res.cancel) {
            setChecked(oldChecked)
          }
        }
      })
    }
  }, [checked, selectedDay])

  return (
    <View className="menstruation-calendar-component">
      <View className="calendar">
        <View className="header border-bottom">
          <View className="arrow trans" onClick={onPrev}>
            <Image src={rightArrow} className="img"></Image>
          </View>
          <View className="txt">
            {curYear}-{displayMonth}
          </View>
          <View className="arrow" onClick={onNext}>
            <Image src={rightArrow} className="img"></Image>
          </View>
        </View>
        <View className="labels">
          <View className="label">日</View>
          <View className="label">一</View>
          <View className="label">二</View>
          <View className="label">三</View>
          <View className="label">四</View>
          <View className="label">五</View>
          <View className="label">六</View>
        </View>
        <View className="days">
          {days.map((d: DateType) => (
            <View
              className="day-wrapper"
              key={`${d.year}-${d.month}-${d.date}`}
            >
              <View
                onClick={e => {
                  onDayClick(d)
                }}
                className={classnames('day', {
                  light: d.month !== curMonth,
                  today:
                    d.year === todayYear &&
                    d.month === todayMonth &&
                    d.date === todayDate,
                  active:
                    // 本月
                    (d.month === curMonth &&
                      (props.status[d.date - 1] === 1 ||
                        props.status[d.date - 1] === 2 ||
                        props.status[d.date - 1] === 4)) ||
                    //上月
                    ((d.year < curYear || d.month < curMonth) &&
                      props.prevStartDay &&
                      d.date >= props.prevStartDay) ||
                    // 下月
                    ((d.year > curYear || d.month > curMonth) &&
                      props.nextEndDay &&
                      d.date <= props.nextEndDay),
                  cur:
                    d.year === selectedDay[0] &&
                    d.month === selectedDay[1] &&
                    d.date === selectedDay[2]
                })}
              >
                {d.date}
                <View className="indicator" />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View className="instruction border-bottom">
        <View className="ins-item">
          <View className="dot" />
          <View className="txt">经期中</View>
        </View>
        <View className="ins-item">
          <View className="circle" />
          <View className="txt">选中日</View>
        </View>
        <View className="ins-item">
          <View className="triangle" />
          <View className="txt">今天</View>
        </View>
      </View>
      <View className="info">
        {status.icon ? (
          <View className="item border-bottom">
            <View className="txt">状态</View>
            <View className="status">
              <View className={`iconfont icon-${status.icon}`} />
              <View>{status.text}</View>
            </View>
          </View>
        ) : null}
        {status.showStart ? (
          <View
            className="item border-bottom"
            key={`${curYear}-${curMonth}-${selectedDay[0]}-${selectedDay[1]}-${selectedDay[2]}`}
          >
            <View className="txt">开始经期？</View>
            <Switch checked={checked} onChange={onSwitchChange} />
          </View>
        ) : null}
        {status.showEnd ? (
          <View
            className="item border-bottom"
            key={`${curYear}-${curMonth}-${selectedDay[0]}-${selectedDay[1]}-${selectedDay[2]}`}
          >
            <View className="txt">结束经期？</View>
            <Switch checked={checked} onChange={onSwitchChange} />
          </View>
        ) : null}
      </View>
    </View>
  )
}
