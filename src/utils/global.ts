type GLOBAL = {}

const Global = {} as GLOBAL

export const setGlobal = params => Object.assign(Global, params)

export default Global
