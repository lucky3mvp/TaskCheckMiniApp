import { combineReducers } from 'redux'
import counter from './counter'

const reducers = combineReducers({
  counter
})

export default reducers

declare global {
  export type GlobalStateType = ReturnType<typeof reducers>
}
