import React, { useCallback, useMemo } from 'react'
import { Picker, View, Text } from '@tarojs/components'
import './index.less'

interface ModeSelector {
  mode: 'selector'
  value: number
  range: Array<CommonItemType>
  placeholder: string
  displayFormatter?: (any) => void
  onChange: (any) => void
  onCancel?: () => void
  onColumnChange?: (...args) => void
  leftArrow?: boolean
}

interface ModeMultiSelector {
  mode: 'multiSelector'
  value: number[]
  range: Array<Array<CommonItemType>>
  placeholder: string
  displayFormatter?: (any) => void
  onChange: (any) => void
  onCancel?: () => void
  onColumnChange?: (...args) => void
  leftArrow?: boolean
}

export default (props: ModeSelector | ModeMultiSelector) => {
  const onChange = useCallback(
    e => {
      props.onChange && props.onChange(e.detail.value)
    },
    [props.onChange]
  )
  const onCancel = useCallback(() => {
    props.onCancel && props.onCancel()
  }, [props.onCancel])
  const onColumnChange = useCallback(
    e => {
      props.onColumnChange &&
        props.onColumnChange(e.detail.column, e.detail.value)
    },
    [props.onColumnChange]
  )
  const text = useMemo(() => {
    if (props.displayFormatter) {
      return props.mode === 'selector'
        ? props.displayFormatter(props.range[props.value])
        : props.displayFormatter(props.range[props.value])
    } else if (props.value >= 0) {
      return props.range[props.value] ? props.range[props.value].label : ''
    }
    return ''
  }, [props.value, props.range])

  // 这样 return 纯粹是为了解决 ts 报错
  return props.mode === 'multiSelector' ? (
    <Picker
      disabled={false}
      rangeKey="label"
      mode={props.mode}
      value={props.value}
      range={props.range}
      onChange={onChange}
      onCancel={onCancel}
      onColumnChange={onColumnChange}
    >
      <View className={`picker-component ${text ? '' : 'placeholder'}`}>
        {props.leftArrow ? (
          <View className="iconfont icon-right-arrow left-arrow" />
        ) : null}
        <Text>{text || props.placeholder}</Text>
        {!props.leftArrow ? (
          <View className="iconfont icon-right-arrow" />
        ) : null}
      </View>
    </Picker>
  ) : (
    <Picker
      disabled={false}
      rangeKey="label"
      mode={props.mode}
      value={props.value}
      range={props.range}
      onChange={onChange}
      onCancel={onCancel}
    >
      <View className={`picker-component ${text ? '' : 'placeholder'}`}>
        {props.leftArrow ? (
          <View className="iconfont icon-right-arrow left-arrow" />
        ) : null}
        <Text>{text || props.placeholder}</Text>
        {!props.leftArrow ? (
          <View className="iconfont icon-right-arrow" />
        ) : null}
      </View>
    </Picker>
  )
}
