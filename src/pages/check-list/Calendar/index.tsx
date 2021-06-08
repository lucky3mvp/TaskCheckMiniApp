import React, { useMemo, useEffect, useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Text, Image, Block } from '@tarojs/components'
import classnames from 'classnames'
import { rightArrow } from 'src/assets/svg'
import { formatDate } from 'src/utils/index'

import './index.less'

type IProps = {
  onDayClick: (d: DateType) => void
  theme?: string
  curPlan: string
  type: string
  plans: Array<PlanTabType>
}

export default (props: IProps) => {
  const [fold, setFold] = useState(false)
  const onToggleFold = useCallback(() => {
    setFold(!fold)
  }, [fold])
  const now = useMemo(() => new Date(), [])
  const todayYear = useMemo(() => now.getFullYear(), [now])
  const todayMonth = useMemo(() => now.getMonth(), [now])
  const todayDate = useMemo(() => now.getDate(), [now])

  const [curYear, setCurYear] = useState(todayYear)
  const [curMonth, setCurMonth] = useState(todayMonth)

  const [selectedDay, setSelectedDay] = useState([
    todayYear,
    todayMonth,
    todayDate
  ])

  // const displayMonth = useMemo(() => {
  //   return curMonth + 1 <= 9 ? `0${curMonth + 1}` : curMonth + 1
  // }, [curMonth])
  // const displayDate = useMemo(() => {
  //   return selectedDay[2] <= 9 ? `0${selectedDay[2]}` : selectedDay[2]
  // }, [selectedDay])

  // 本月第一天
  const curMonthFirstDate = useMemo(
    () => new Date(curYear, curMonth, 1),
    [curYear, curMonth]
  )
  // 本月最后一天
  const curMonthLastDate = useMemo(
    () => new Date(curYear, curMonth + 1, 0),
    [curYear, curMonth]
  )
  // 上个月最后一天
  const prevMonthLastDate = useMemo(
    () => new Date(curYear, curMonth, 0),
    [curYear, curMonth]
  )
  // 下个月第一天
  const nextMonthFirstDate = useMemo(
    () => new Date(curYear, curMonth + 1, 1),
    [curYear, curMonth]
  )

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

  const onPrev = useCallback(() => {
    if (fold) return
    setCurYear(prevMonthLastDate.getFullYear())
    setCurMonth(prevMonthLastDate.getMonth())
  }, [prevMonthLastDate, fold])

  const onNext = useCallback(() => {
    if (fold) return
    if (curYear === todayYear && curMonth === todayMonth) return
    setCurYear(nextMonthFirstDate.getFullYear())
    setCurMonth(nextMonthFirstDate.getMonth())
  }, [nextMonthFirstDate, fold, curYear, curMonth, todayYear, todayMonth])

  const onDayClick = useCallback(
    ({ year, month, date }) => {
      if (
        year > todayYear ||
        (year === todayYear &&
          (month > todayMonth || (month === todayMonth && date > todayDate)))
      ) {
        // 今天及之前可点击
        return
      }
      if (year < curYear || month < curMonth) {
        onPrev()
      } else if (year > curYear || month > curMonth) {
        onNext()
      }
      setSelectedDay([year, month, date])
      props.onDayClick && props.onDayClick({ year, month: month + 1, date })
    },
    [todayYear, todayMonth, todayDate, curYear, curMonth]
  )

  const getWeekRange = p => {
    if (p instanceof Date) {
      const day = p.getDay()
      const y = p.getFullYear()
      const m = p.getMonth()
      const d = p.getDate()
      const s = new Date(y, m, d - ((day - 1 + 7) % 7))
      const e = new Date(y, m, d - ((day - 1 + 7) % 7) + 6)
      return {
        display: [formatDate(s, 'yyyy-MM-dd'), formatDate(e, 'yyyy-MM-dd')],
        date: [s, e]
      }
    } else if (p instanceof Array) {
      const [y, m, d] = p
      const day = new Date(y, m, d).getDay()
      const s = new Date(y, m, d - ((day - 1 + 7) % 7))
      const e = new Date(y, m, d - ((day - 1 + 7) % 7) + 6)
      return {
        display: [formatDate(s, 'yyyy-MM-dd'), formatDate(e, 'yyyy-MM-dd')],
        date: [s, e]
      }
    }
    return {
      display: [],
      date: []
    }
  }

  const todayWeek = useMemo(() => getWeekRange(now).display, [])
  const [displayWeek, setDisplayWeek] = useState(
    getWeekRange(selectedDay).display
  )

  const onWeekPrev = useCallback(() => {}, [])

  const onWeekNext = useCallback(() => {
    if (todayWeek[1] === displayWeek[1]) return
  }, [])

  return (
    <View className="check-list-calendar">
      {props.type === 'day' ? (
        <View className={`day-calendar-main ${fold ? 'fold' : ''}`}>
          <View className="arrow left" onClick={onPrev}>
            <Image src={rightArrow} className="img"></Image>
          </View>
          <View
            className={`arrow right ${
              curYear === todayYear && curMonth === todayMonth ? 'disable' : ''
            }`}
            onClick={onNext}
          >
            <Image src={rightArrow} className="img"></Image>
          </View>
          <View className={`inner `}>
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
                    className={classnames('day', `${props.theme || ''}`, {
                      light: d.month !== curMonth,
                      'now-and-past':
                        d.year < todayYear ||
                        (d.year === todayYear && d.month < todayMonth) ||
                        (d.year === todayYear &&
                          d.month === todayMonth &&
                          d.date <= todayDate),
                      today:
                        d.year === todayYear &&
                        d.month === todayMonth &&
                        d.date === todayDate,
                      active:
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
          <View className={`fold-icon`} onClick={onToggleFold}>
            <Image
              src={rightArrow}
              className={`img  arrow-${fold ? 'down' : 'up'}`}
            ></Image>
          </View>
        </View>
      ) : props.type === 'week' ? (
        <View className="week-calendar-main">
          <View className="week-range">
            <View className="arrow-wrapper left" onClick={onWeekPrev}>
              <View className="iconfont icon-right-arrow trans" />
            </View>
            {displayWeek[0]} ~ {displayWeek[1]}
            <View
              className={`arrow-wrapper right ${
                todayWeek[1] === displayWeek[1] ? 'disable' : ''
              }`}
              onClick={onWeekNext}
            >
              <View className="iconfont icon-right-arrow" />
            </View>
          </View>
        </View>
      ) : (
        <View>month</View>
      )}
    </View>
  )
}
