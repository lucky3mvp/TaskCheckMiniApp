import React, { useCallback, useMemo, useState } from 'react'
import { Picker, View, Text } from '@tarojs/components'
import './index.less'

interface ModeSelector {
  mode: 'selector'
  index: number
  range: Array<CommonItemType>
  placeholder: string
  formatter?: (any) => void
  onChange: (v: string) => void
  onCancel?: () => void
  onColumnChange?: (...args) => void
  leftArrow?: boolean
  rightArrow?: boolean
  align?:
    | 'left'
    | 'center'
    | 'right'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
}

interface ModeMultiSelector {
  mode: 'multiSelector'
  index: number[]
  range: Array<Array<CommonItemType>>
  placeholder: string
  formatter?: (any) => void
  onChange: (vArr: Array<string>) => void
  onCancel?: () => void
  onColumnChange?: (...args) => void
  leftArrow?: boolean
  rightArrow?: boolean
  align?:
    | 'left'
    | 'center'
    | 'right'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
}

export default (props: ModeSelector | ModeMultiSelector) => {
  const [init, setInit] = useState(true)
  const onChange = useCallback(
    e => {
      if (init) {
        setInit(false)
      }
      props.onChange && props.onChange(e.detail.value)
    },
    [init, props.onChange]
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
  const getMultiPickerSelected = useCallback(
    (type?: string) => {
      const v: CommonItemType[] = []
      if (props.mode === 'multiSelector') {
        for (let i = 0; i < props.range.length; i++) {
          v.push(props.range[i][props.index[i]])
        }
      }
      if (type === 'value') {
        return v.map(o => o.value)
      } else if (type === 'label') {
        return v.map(o => o.label)
      }
      return v
    },
    [props.range, props.index, props.mode]
  )
  const text = useMemo(() => {
    if (init) return ''

    if (props.formatter) {
      return props.mode === 'selector'
        ? props.formatter(props.range[props.index])
        : props.formatter(getMultiPickerSelected())
    } else {
      return props.mode === 'selector'
        ? props.range[props.index]
          ? props.range[props.index].label
          : ''
        : getMultiPickerSelected('label').join('')
    }
  }, [init, props.index, props.range])

  // 这样 return 纯粹是为了解决 ts 报错
  return props.mode === 'multiSelector' ? (
    <Picker
      disabled={false}
      rangeKey="label"
      mode={props.mode}
      value={props.index}
      range={props.range}
      onChange={onChange}
      onCancel={onCancel}
      onColumnChange={onColumnChange}
    >
      <View
        className={`picker-component ${text ? '' : 'placeholder'} ${
          props.align || 'space-between'
        }`}
      >
        {props.leftArrow ? (
          <View className="iconfont icon-right-arrow left-arrow" />
        ) : null}
        <Text>{text || props.placeholder}</Text>
        {props.rightArrow ? (
          <View className="iconfont icon-right-arrow" />
        ) : null}
      </View>
    </Picker>
  ) : (
    <Picker
      disabled={false}
      rangeKey="label"
      mode={props.mode}
      value={props.index}
      range={props.range}
      onChange={onChange}
      onCancel={onCancel}
    >
      <View
        className={`picker-component ${text ? '' : 'placeholder'} ${
          props.align || 'space-between'
        }`}
      >
        {props.leftArrow ? (
          <View className="iconfont icon-right-arrow left-arrow" />
        ) : null}
        <Text>{text || props.placeholder}</Text>
        {props.rightArrow ? (
          <View className="iconfont icon-right-arrow" />
        ) : null}
      </View>
    </Picker>
  )
}
