import React, { useCallback, useState, useEffect } from 'react'
import classnames from 'classnames'

import { View, Text } from '@tarojs/components'

import './index.less'

interface IProps {
  value: string | number
  multiple?: boolean
  btns: Array<CommonItemType>
  theme: string
  onChange: (t: CommonItemType) => void
}

export default (props: IProps) => {
  const onChange = useCallback(
    o => {
      props.onChange && o.value !== props.value && props.onChange(o)
    },
    [props.value]
  )

  return (
    <View className="btn-group-component">
      <View className="btns">
        {props.btns &&
          props.btns.map((o: CommonItemType) => (
            <View
              className={classnames('btn', {
                [`${props.theme}-border-color`]: props.value === o.value,
                [`${props.theme}-color`]: props.value === o.value,
                active: props.value === o.value
              })}
              onClick={onChange.bind(null, o)}
            >
              <View className={`btn-fake-bkg ${props.theme}-background`}></View>
              <Text>{o.label}</Text>
            </View>
          ))}
        {<View className="l" />}
      </View>
    </View>
  )
}
