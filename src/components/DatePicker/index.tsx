import React, { useEffect, useCallback, useMemo, useState } from 'react'

import Picker from '../Picker'

import { createDateRange } from 'src/utils'

interface IProps {
  placeholder?: string
  startDate?: Date
  endDate?: Date
  range?: number
  specificStart?: Array<Array<CommonItemType>>
  initialValue?: Array<number>
  leftArrow?: boolean
  rightArrow?: boolean
  onChange: (any) => void
  onCancel?: () => void
  formatter?: (any) => void
  align?:
    | 'left'
    | 'center'
    | 'right'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
}

export default (props: IProps) => {
  const start = useMemo(() => props.startDate || new Date(), [props.startDate])
  const startYear = useMemo(() => start.getFullYear(), [start])
  const startMonth = useMemo(() => start.getMonth() + 1, [start])
  const startDate = useMemo(() => start.getDate(), [start])

  const end = useMemo(() => {
    if (props.endDate) {
      return props.endDate
    } else if (props.range) {
      return new Date(startYear + props.range!, startMonth, startDate)
    }
    return new Date()
  }, [props.endDate, props.range, startYear, startMonth, startDate])

  const endYear = useMemo(() => end.getFullYear(), [end])
  const endMonth = useMemo(() => end.getMonth() + 1, [end])
  const endDate = useMemo(() => end.getDate(), [end])

  const getInitialRange = useCallback(
    () =>
      createDateRange({
        start: start,
        end: end,
        specificStart: props.specificStart
      }),
    [start, end, props.specificStart]
  )
  const [range, setRange] = useState(getInitialRange())
  const [lastRange, setLastRange] = useState(getInitialRange())
  const [index, setIndex] = useState(props.initialValue || [0, 0, 0])
  const [lastIndex, setLastIndex] = useState([...index])

  useEffect(() => {
    if (props.initialValue) {
      if (props.initialValue[0] !== 0) onColumnChange(0, props.initialValue[0])
      if (props.initialValue[1] !== 0) onColumnChange(1, props.initialValue[1])
      if (props.initialValue[2] !== 0) onColumnChange(2, props.initialValue[2])
      // setIndex(props.initialValue)
      // setLastIndex(props.initialValue)
    }
    return () => {}
  }, [props.initialValue])

  const onCancel = useCallback(() => {
    setIndex(lastIndex)
    setRange(lastRange)
    props.onCancel && props.onCancel()
  }, [lastIndex, lastRange])

  const onChange = useCallback(() => {
    setLastIndex([...index])
    setLastRange([...range])
    props.onChange &&
      props.onChange([
        range[0][index[0]],
        range[1][index[1]],
        range[2][index[2]]
      ])
  }, [range, index])

  // const onColumnChange = useCallback(
  const onColumnChange = (columnIndex: number, rowIndex: number) => {
    const data = {
      range: range,
      index: index
    }
    if (columnIndex === 0 && rowIndex === 0) {
      // 因为有“永远”这种case，需要特殊处理
      data.index = [0, 0, 0]
      data.range = getInitialRange()
    } else if (columnIndex === 2) {
      data.index[2] = rowIndex
    } else {
      data.index[2] = 0

      if (columnIndex === 0) {
        data.index[0] = rowIndex
        data.index[1] = 0
        const year = Number(range[columnIndex][rowIndex].value)
        const _startMonth = year === startYear ? startMonth : 1
        const _endMonth = year === endYear ? endMonth : 12
        const month: Array<CommonItemType> = []
        for (let i = _startMonth; i <= _endMonth; i++) {
          month.push({
            value: `${i < 10 ? '0' : ''}${i}`,
            label: `${i}月`
          })
        }
        data.range[1] = month
      }

      if (columnIndex === 1) {
        data.index[1] = rowIndex
      }

      const year = +range[0][data.index[0]].value
      const month = +range[1][data.index[1]].value

      const _startDate =
        year === startYear && month === startMonth ? startDate : 1

      let _endDate: number = 0
      if (year === endYear && month === endMonth) {
        _endDate = endDate
      } else {
        _endDate = new Date(year, month, 0).getDate()
      }

      const day: Array<CommonItemType> = []
      for (let i = _startDate; i <= _endDate; i++) {
        day.push({
          value: `${i < 10 ? '0' : ''}${i}`,
          label: `${i}日`
        })
      }
      data.range[2] = day
    }

    setRange([...data.range])
    setIndex([...data.index])
  }
  //   [
  //     range,
  //     index,
  //     startYear,
  //     startMonth,
  //     startDate,
  //     endYear,
  //     endMonth,
  //     endDate,
  //     start,
  //     end
  //   ]
  // )

  return (
    <Picker
      index={index}
      align={props.align}
      placeholder={props.placeholder || '请选择'}
      mode="multiSelector"
      range={range}
      onCancel={onCancel}
      onChange={onChange}
      onColumnChange={onColumnChange}
      formatter={props.formatter}
      leftArrow={props.leftArrow}
      rightArrow={props.rightArrow}
    />
  )
}
