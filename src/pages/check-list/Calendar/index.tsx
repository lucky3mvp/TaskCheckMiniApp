import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { View, Button, Text, Image, Block } from '@tarojs/components'
import classnames from 'classnames'
import { rightArrow } from 'src/assets/svg'

import './index.less'

type IProps = {
  onDayClick: (d: DateType) => void
  onPlanChange: (p: string) => void
  theme?: string
  curPlan: string
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
  const displayMonth = useMemo(() => {
    return curMonth + 1 <= 9 ? `0${curMonth + 1}` : curMonth + 1
  }, [curMonth])
  const [selectedDay, setSelectedDay] = useState([
    todayYear,
    todayMonth,
    todayDate
  ])
  const displayDate = useMemo(() => {
    return selectedDay[2] + 1 <= 9 ? `0${selectedDay[2]}` : selectedDay[2]
  }, [selectedDay])
  const displayHeader = useMemo(() => {
    if (fold) {
      return `${curYear}-${displayMonth}-${displayDate}`
    } else {
      return `${curYear}-${displayMonth}`
    }
  }, [fold, curYear, displayMonth, displayDate])

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
    if (fold) return
    setCurYear(prevMonthLastDate.getFullYear())
    setCurMonth(prevMonthLastDate.getMonth())
  }, [prevMonthLastDate, fold])

  const onNext = useCallback(() => {
    if (fold) return
    setCurYear(nextMonthFirstDate.getFullYear())
    setCurMonth(nextMonthFirstDate.getMonth())
  }, [nextMonthFirstDate, fold])

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

  const onPlanChangeToAll = useCallback(() => {
    props.onPlanChange('all')
  }, [])
  const onPlanChange = useCallback(t => {
    props.onPlanChange(t.planID)
  }, [])

  return (
    <View className="check-list-calendar">
      <View className={`check-list-calendar-holder ${fold ? '' : 'hide'}`} />
      <View className={`check-list-calendar-main ${fold ? 'fixed' : ''}`}>
        <View className={`inner `}>
          <View className="header border-bottom">
            <View className="arrow trans" onClick={onPrev}>
              <Image src={rightArrow} className="img"></Image>
            </View>
            <View className="txt">{displayHeader}</View>
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
                  className={classnames('day', `${props.theme || ''}`, {
                    light: d.month !== curMonth,
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
      {props.plans.length ? (
        <View className="tabs border-bottom">
          <View className="holder" />
          <View
            className={`tab tab-all iconfont icon-all ${
              props.curPlan === 'all' ? 'active' : ''
            }`}
            onClick={onPlanChangeToAll}
          />
          {props.plans.map((t: PlanTabType) => (
            <View
              className={`tab iconfont icon-${t.icon} ${t.theme}-color ${
                props.curPlan === t.planID ? 'active' : ''
              }`}
              onClick={() => {
                onPlanChange(t)
              }}
            />
          ))}
          <View className="holder" />
        </View>
      ) : null}
    </View>
  )
}
