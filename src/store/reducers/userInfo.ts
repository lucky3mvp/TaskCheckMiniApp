import { UPDATE_USER_INFO } from 'src/constants'

const INITIAL_STATE: UserInfoStoreType = {
  openID: '',
  avatarUrl: "",
  gender: 1,
  nickName: ""
}

export default function counter (state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_USER_INFO:
      return {
        ...state,
        ...action.payload
      }
     default:
       return state
  }
}
