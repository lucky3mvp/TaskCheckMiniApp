import React, { useCallback } from 'react'
import { Input } from '@tarojs/components'

import './index.less'

interface IProps {
  type?: any
  defaultValue?: string
  placeholder?: string
  maxlength?: number
  onInput?: (_) => void
  onFocus?: (_) => void
  onBlur?: (...any) => void
  cursorSpacing?: number
  disabled?: boolean
}

export default (props: IProps) => {
  const onInput = useCallback(
    e => {
      props.onInput && props.onInput(e.detail.value.trim())
    },
    [props.onInput]
  )

  const onFocus = useCallback(
    e => {
      props.onFocus && props.onFocus(e.detail.value.trim())
    },
    [props.onFocus]
  )

  const onBlur = useCallback(
    e => {
      props.onBlur && props.onBlur(e.detail.value.trim(), e)
    },
    [props.onBlur]
  )

  return (
    <Input
      placeholderClass="placeholder"
      placeholderStyle="color: rgb(202, 202, 202)"
      className="self-input-component"
      type={props.type || 'text'}
      value={props.defaultValue}
      maxlength={props.maxlength || 500}
      cursorSpacing={props.cursorSpacing || 10}
      placeholder={props.placeholder}
      onBlur={onBlur}
      onFocus={onFocus}
      onInput={onInput}
    />
  )
}
