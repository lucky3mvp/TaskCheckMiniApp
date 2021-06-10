import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import Modal from 'src/components/Modal'
import SelfInput from 'src/components/SelfInput'
import { UnitMap } from 'src/constants/config'
import { formatDate } from 'src/utils'
import { check } from 'src/utils/request2.0'

import './index.less'

interface IProps {
  isShow: boolean
  isMakeUp?: boolean
  date?: string
  plan: CheckPlanType
  submitBtnText: string
  onClose: () => void
  onSubmit: () => {}
}

export default (props: IProps) => {
  const [lock, setLock] = useState(false)
  const [stage, setStage] = useState(0)
  const [achieve, setAchieve] = useState('')
  const [comment, setComment] = useState('')
  useEffect(() => {
    if (props.isShow) {
      setStage(1)
      setTimeout(() => {
        setStage(2)
      }, 100)
    } else {
      setStage(1)
      setAchieve('')
      setComment('')
      setTimeout(() => {
        setStage(0)
      }, 100)
    }
    return () => {
      setStage(0)
      setAchieve('')
      setComment('')
    }
  }, [props.isShow])
  const onAchieveChange = (achieve: string) => {
    setAchieve(achieve)
  }
  const onCommentChange = (comment: string) => {
    setComment(comment)
  }
  const onSubmit = async () => {
    if (!achieve) return
    if (lock) return
    setLock(true)
    Taro.showLoading({
      title: '请求中'
    })
    const { code, msg } = await check({
      date: props.isMakeUp ? props.date : formatDate(new Date(), 'yyyy/MM/dd'),
      achieve: +achieve,
      comment: comment,
      planID: props.plan.planID,
      isReCheck: props.isMakeUp
    })
    if (code === 200) {
      Taro.showToast({
        title: '打卡成功啦~'
      })
      setTimeout(() => {
        props.onSubmit()
      }, 1500)
    } else {
      Taro.showToast({
        title: '出错了，一会再试吧',
        icon: 'none'
      })
    }
    setLock(false)
    Taro.hideLoading()
  }
  return (
    <Modal maskCloseable visible={stage > 0} onClose={props.onClose}>
      <View className={`check-modal-component ${stage > 1 ? 'show' : 'hide'}`}>
        <View className="achieve-item border-bottom">
          <SelfInput
            type="number"
            placeholder={`打卡成绩，当前已完成：${props.plan.totalAchieve}/${props.plan.goal}`}
            maxlength={10}
            value={achieve}
            onBlur={onAchieveChange}
            onInput={onAchieveChange}
          />
          <View className="unit">{UnitMap[props.plan.unit]}</View>
        </View>
        <View className="border-bottom">
          <SelfInput
            type="text"
            placeholder="留下此刻的心情吧~"
            value={comment}
            onBlur={onCommentChange}
            onInput={onCommentChange}
          />
        </View>
        <View
          className={`check-btn ${!!achieve ? '' : 'disable'} ${
            props.plan.theme
          }-background`}
          onClick={onSubmit}
        >
          {props.submitBtnText}
        </View>
      </View>
    </Modal>
  )
}
