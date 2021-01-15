import React, { useCallback } from 'react'
import classnames from 'classnames'

import { View, Text } from '@tarojs/components'

import './index.less'

interface IProps {
  theme: string
  value?: string
  values?: Array<string>
  btns: Array<CommonItemType>
  multiple?: boolean
  onChange: (t: CommonItemType) => void
  btnStyle?: Record<string, any>
}

export default (props: IProps) => {
  const onChange = useCallback(o => {
    props.onChange && props.onChange(o)
  }, [])

  return (
    <View className="btn-group-component">
      <View className="btns">
        {props.btns &&
          props.btns.map((o: CommonItemType) => {
            const active =
              (!props.multiple && props.value === o.value) ||
              (props.multiple && props.values?.includes(o.value))
            return (
              <View
                className={classnames('btn', {
                  [`${props.theme}-border-color`]: active,
                  [`${props.theme}-color`]: active,
                  [`btn-color-and-border-color-default`]: !active,
                  active: active
                })}
                style={props.btnStyle}
                onClick={onChange.bind(null, o)}
              >
                <View
                  className={`btn-fake-bkg ${props.theme}-background`}
                ></View>
                <Text>{o.label}</Text>
              </View>
            )
          })}
        {<View className="l" />}
      </View>
    </View>
  )
}
