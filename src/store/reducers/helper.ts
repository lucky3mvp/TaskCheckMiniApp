import { UPDATE_HELPER_INFO } from 'src/constants'

const INITIAL_STATE: HelperStoreType = {
  isIpx: false,
  statusBarHeight: 0,
  windowWidth: 375
}

export default function helper(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_HELPER_INFO:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}
