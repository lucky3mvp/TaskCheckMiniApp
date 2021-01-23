import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.less'

interface IProps {
  index: number
  onClick: (index) => any
  tabList: Array<string>
  tabPositionArr: Array<any>
}

export default (props: IProps) => {
  return (
    <View className="top-bar-component">
      <View className="inner">
        {props.tabList.map((item, index) => (
          <Text
            className={`tab-name ${index === props.index ? 'active' : ''}`}
            key={item}
            onClick={props.onClick.bind(null, index)}
          >
            {item}
          </Text>
        ))}
      </View>
      <View
        className="bottom-brick"
        style={`transform:translateX(${props.tabPositionArr[props.index]});`}
      />
    </View>
  )
}
