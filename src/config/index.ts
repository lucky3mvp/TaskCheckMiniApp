export default ((c, freeze) => {
  return freeze(c())
})(
  () => {
    const defaultConfig = {}
    let config: any = {}
    if (process.env.NODE_ENV === 'production')
      config = require('./production').default
    else config = require('./dev').default

    return { ...defaultConfig, ...config }
  },
  function freeze(o) {
    Object.keys(o).forEach((key) => {
      switch (Object.prototype.toString.call(o[key])) {
        case '[object Object]':
          o[key] = freeze(o[key])
          break
        case '[object Array]':
          o[key] = Object.freeze(o[key].map((item) => freeze(item)))
          break
        default:
      }
    })
    return Object.freeze(o)
  }
)
