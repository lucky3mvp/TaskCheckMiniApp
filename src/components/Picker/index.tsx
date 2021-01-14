import React, { useCallback, useMemo } from 'react'
import { Picker, View, Text } from '@tarojs/components'
import './index.less'

interface IProps {
  mode: any
  value: any
  placeholder: string
  range: Array<CommonItemType>
  onChange?: (index) => void
  onCancel?: () => void
  onColumnChange?: (...args) => void
}

export default (props: IProps) => {
  const onChange = useCallback(
    e => {
      props.onChange && props.onChange(+e.detail.value)
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
    if (props.value >= 0) {
      return props.range[props.value] ? props.range[props.value].label : ''
    }
    return ''
  }, [props.value, props.range])
  return (
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
        <Text>{text || props.placeholder}</Text>
        <View className="iconfont icon-right-arrow" />
      </View>
    </Picker>
  )
}
