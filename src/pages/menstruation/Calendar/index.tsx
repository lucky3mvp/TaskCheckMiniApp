import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { View, Image } from '@tarojs/components'
import classnames from 'classnames'
import { rightArrow } from 'src/assets/svg'

import './index.less'

type IProps = {
  start: string
  end: string
  onDayClick: (d) => void
  onMonthChange: (cur, prev) => void
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

  const onPrev = useCallback(() => {
    setCurYear(prevMonthLastDate.getFullYear())
    setCurMonth(prevMonthLastDate.getMonth())
  }, [prevMonthLastDate])

  const onNext = useCallback(() => {
    setCurYear(nextMonthFirstDate.getFullYear())
    setCurMonth(nextMonthFirstDate.getMonth())
  }, [nextMonthFirstDate])

  const onDayClick = useCallback(d => {
    props.onDayClick(d)
  }, [])

  return (
    <View className="calendar-component">
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
          <View className="day-wrapper" key={`${d.year}-${d.month}-${d.date}`}>
            <View
              onClick={e => {
                onDayClick(d)
              }}
              className={classnames('day', {
                light: d.month !== curMonth,
                today:
                  d.year === todayYear &&
                  d.month === todayMonth &&
                  d.date === todayDate
              })}
            >
              {d.date}
              {/* <View className="indicator" /> */}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
