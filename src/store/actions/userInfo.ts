import { UPDATE_USER_INFO } from 'src/constants'

export const updateUserInfo = userInfo => {
  return {
    type: UPDATE_USER_INFO,
    payload: userInfo
  }
}
