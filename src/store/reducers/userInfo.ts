import { UPDATE_USER_INFO } from 'src/constants'

const INITIAL_STATE: UserInfoStoreType = {
  isLogin: false,
  openID: '',
  avatarUrl: '',
  gender: 0,
  nickName: ''
}

export default function userInfo(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_USER_INFO:
      return {
        ...state,
        ...action.payload,
        isLogin: !!(action.payload.openID || state.openID)
      }
    default:
      return state
  }
}
