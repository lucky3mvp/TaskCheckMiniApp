import React, { useCallback, useEffect } from 'react'
import { Picker, View, Text } from '@tarojs/components'
import './index.less'

interface IProps {
  mode: any
  value: any
  text: string
  placeholder: string
  range: any
  onChange?: (...any) => void
  onCancel?: () => void
  onColumnChange?: (...args) => void
}

export default (props: IProps) => {
  const onChange = useCallback(
    e => {
      props.onChange && props.onChange(e.detail.value, e)
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
      <View className={`value ${props.text ? '' : 'placeholder'}`}>
        <Text>{props.text || props.placeholder}</Text>
        <RightArrow />
      </View>
    </Picker>
  )
}
