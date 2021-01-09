import { combineReducers } from 'redux'
import userInfo from './userInfo'

const reducers = combineReducers({
  userInfo
})

export default reducers

declare global {
  export type GlobalStateType = ReturnType<typeof reducers>
}
