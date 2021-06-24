import React, { useMemo, useEffect, useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Text, Image, Block } from '@tarojs/components'
import classnames from 'classnames'
import { rightArrow } from 'src/assets/svg'
import { formatDate, getWeekRange } from 'src/utils/index'
import RadioGroup from 'src/components/RadioGroup'

import './index.less'

type IProps = {
  initialTab: string
  fetch: (params: Record<string, any>) => void
}

export default (props: IProps) => {
  const [tab, setTab] = useState(props.initialTab)
  const onTabChange = (o: CommonItemType) => {
    setTab(o.value)
    if (o.value === 'day') {
      props.fetch({
        date: formatDate(
          new Date(selectedDay[0], selectedDay[1], selectedDay[2]),
          'yyyy/MM/dd'
        ),
        dateEnd: ''
      })
    } else if (o.value === 'week') {
      props.fetch({
        date: formatDate(curWeekRange.date[0], 'yyyy/MM/dd'),
        dateEnd: formatDate(curWeekRange.date[1], 'yyyy/MM/dd')
      })
    } else if (o.value === 'month') {
      props.fetch({
        date: formatDate(new Date(month[0], month[1], 1), 'yyyy/MM/dd'),
        dateEnd: formatDate(new Date(month[0], month[1] + 1, 0), 'yyyy/MM/dd')
      })
    }
  }

  // 日模式
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

  const onDateChange = useCallback(
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

      const d = `${year}/${month + 1 < 10 ? '0' : ''}${month + 1}/${
        date < 10 ? '0' : ''
      }${date}`
      props.fetch({
        date: d,
        dateEnd: ''
      })
    },
    [todayYear, todayMonth, todayDate, curYear, curMonth]
  )

  // 周模式
  const todayWeekRange = useMemo(() => getWeekRange(now), [])
  const [curWeekRange, setCurWeekRange] = useState(getWeekRange(now))

  /**
   * 比如 2021.06.07
   * 那么 week 是 2021.06.07 0:0:0 ~ 2021.06.13 0:0:0
   */
  const onWeekPrev = useCallback(() => {
    const newWeek = getWeekRange(
      new Date(curWeekRange.date[0].getTime() - 1000)
    )
    setCurWeekRange(newWeek)
    props.fetch({
      date: formatDate(newWeek.date[0], 'yyyy/MM/dd'),
      dateEnd: formatDate(newWeek.date[1], 'yyyy/MM/dd')
    })
  }, [curWeekRange])

  const onWeekNext = useCallback(() => {
    if (todayWeekRange.display[1] === curWeekRange.display[1]) return
    // date[1]存的是这一天的凌晨零点
    const newWeek = getWeekRange(
      new Date(curWeekRange.date[1].getTime() + 24 * 60 * 60 * 1000)
    )
    setCurWeekRange(newWeek)
    props.fetch({
      date: formatDate(newWeek.date[0], 'yyyy/MM/dd'),
      dateEnd: formatDate(newWeek.date[1], 'yyyy/MM/dd')
    })
  }, [todayWeekRange, curWeekRange])

  // 月模式：
  const [month, setMonth] = useState([todayYear, todayMonth])
  const displayMonthInfo = useMemo(() => {
    const m = month[1] + 1 <= 9 ? `0${month[1] + 1}` : month[1] + 1
    return `${month[0]}.${m}`
  }, [month])
  const onMonthPrev = useCallback(() => {
    // 上一月的最后一天
    const end = new Date(month[0], month[1], 0)
    const y = end.getFullYear()
    const m = end.getMonth()
    const start = new Date(y, m, 1)
    setMonth([y, m])
    props.fetch({
      date: formatDate(start, 'yyyy/MM/dd'),
      dateEnd: formatDate(end, 'yyyy/MM/dd')
    })
  }, [month])
  const onMonthNext = useCallback(() => {
    if (month[0] === todayYear && month[1] === todayMonth) return
    // date[1]存的是这一天的凌晨零点
    const start = new Date(month[0], month[1] + 1, 1)
    const y = start.getFullYear()
    const m = start.getMonth()
    const end = new Date(y, month[1] + 2, 0)
    setMonth([y, m])
    props.fetch({
      date: formatDate(start, 'yyyy/MM/dd'),
      dateEnd: formatDate(end, 'yyyy/MM/dd')
    })
  }, [month, todayYear, todayMonth])

  useEffect(() => {
    switch (props.initialTab) {
      case 'day':
        props.fetch({
          date: formatDate(now, 'yyyy/MM/dd'),
          dateEnd: ''
        })
        break
      case 'week':
        props.fetch({
          date: formatDate(curWeekRange.date[0], 'yyyy/MM/dd'),
          dateEnd: formatDate(curWeekRange.date[1], 'yyyy/MM/dd')
        })
        break
      case 'month':
        props.fetch({
          date: formatDate(new Date(month[0], month[1], 1), 'yyyy/MM/dd'),
          dateEnd: formatDate(new Date(month[0], month[1] + 1, 0), 'yyyy/MM/dd')
        })
        break
      default:
        break
    }
    return () => {}
  }, [])

  return (
    <View className="check-list-calendar">
      <View className={'radio-group-wrapper'}>
        <RadioGroup
          value={tab}
          onChange={onTabChange}
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
      {tab === 'day' ? (
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
                      onDateChange(d)
                    }}
                    className={classnames('day', {
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
      ) : tab === 'week' ? (
        <View className="week-calendar-main">
          <View className="range">
            <View className="arrow-wrapper left" onClick={onWeekPrev}>
              <View className="iconfont icon-right-arrow trans" />
            </View>
            {curWeekRange.display[0]} ~ {curWeekRange.display[1]}
            <View
              className={`arrow-wrapper right ${
                todayWeekRange.display[1] === curWeekRange.display[1]
                  ? 'disable'
                  : ''
              }`}
              onClick={onWeekNext}
            >
              <View className="iconfont icon-right-arrow" />
            </View>
          </View>
        </View>
      ) : (
        <View className="month-calendar-main">
          <View className="range">
            <View className="arrow-wrapper left" onClick={onMonthPrev}>
              <View className="iconfont icon-right-arrow trans" />
            </View>
            {displayMonthInfo}
            <View
              className={`arrow-wrapper right ${
                month[0] === todayYear && month[1] === todayMonth
                  ? 'disable'
                  : ''
              }`}
              onClick={onMonthNext}
            >
              <View className="iconfont icon-right-arrow" />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
