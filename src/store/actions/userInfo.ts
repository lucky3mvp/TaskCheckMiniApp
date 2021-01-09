import { UPDATE_USER_INFO } from 'src/constants'

export const updateUserInfo = userInfo => {
  return {
    type: UPDATE_USER_INFO,
    payload: userInfo
  }
}
// 异步的action
// export function asyncAdd() {
//   return dispatch => {
//     setTimeout(() => {
//       dispatch(add())
//     }, 2000)
//   }
// }
