import React, { useEffect, useCallback, useMemo, useState } from 'react'

import Picker from '../Picker'

import { createDateRange } from 'src/utils'

interface IProps {
  placeholder?: string
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
  const range = useMemo(() => {
    const h: CommonItemType[] = []
    for (let i = 0; i <= 23; i++) {
      const v = i < 10 ? `0${i}` : `${i}`
      h.push({ label: v, value: v })
    }
    const s: CommonItemType[] = []
    for (let i = 0; i <= 59; i++) {
      const v = i < 10 ? `0${i}` : `${i}`
      s.push({ label: v, value: v })
    }
    return [h, s]
  }, [])
  const [index, setIndex] = useState(props.initialValue || [0, 0])
  const [lastIndex, setLastIndex] = useState([...index])

  useEffect(() => {
    if (props.initialValue) {
      setIndex(props.initialValue)
      setLastIndex(props.initialValue)
    }
    return () => {}
  }, [props.initialValue])

  const onCancel = useCallback(() => {
    setIndex(lastIndex)
    props.onCancel && props.onCancel()
  }, [lastIndex])

  const onChange = useCallback(() => {
    setLastIndex([...index])
    props.onChange && props.onChange([range[0][index[0]], range[1][index[1]]])
  }, [range, index])

  const onColumnChange = useCallback(
    (columnIndex: number, rowIndex: number) => {
      const _index: number[] = [...index]
      _index[columnIndex] = rowIndex
      setIndex(_index)
    },
    [index]
  )
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
