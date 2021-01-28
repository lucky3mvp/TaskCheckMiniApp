import { combineReducers } from 'redux'
import userInfo from './userInfo'
import helper from './helper'

const reducers = combineReducers({
  userInfo,
  helper
})

export default reducers

declare global {
  export type GlobalStateType = ReturnType<typeof reducers>
}
