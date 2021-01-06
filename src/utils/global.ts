type GLOBAL = {
  openID: string
}

const Global = {
  openID: ''
} as GLOBAL

export const setGlobal = (params) => Object.assign(Global, params)

export default Global
