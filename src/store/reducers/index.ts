import { combineReducers } from 'redux'
import counter from './counter'
import userInfo from './userInfo'

const reducers = combineReducers({
  counter,
  userInfo
})

export default reducers

declare global {
  export type GlobalStateType = ReturnType<typeof reducers>
}
