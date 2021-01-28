import { UPDATE_HELPER_INFO } from 'src/constants'

export const updateHelperInfo = helperInfo => {
  return {
    type: UPDATE_HELPER_INFO,
    payload: helperInfo
  }
}
