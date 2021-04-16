import Taro from '@tarojs/taro'

export const isIpx = () => {
  const systemInfo = Taro.getSystemInfoSync()
  const { screenHeight, screenWidth, system } = systemInfo
  return (
    system.toLowerCase().indexOf('ios') >= 0 && screenHeight / screenWidth > 1.8
  )
}

export function createDateRange2(
  option: CreateDateRangeParamsType
): Array<Array<CommonItemType>> {
  let {
    start,
    end,
    range, // 目前暂时只支持年跨度
    specificStart,
    specificEnd
  } = option

  if (!start) start = new Date()

  const startYear = start.getFullYear()
  const startMonth = start.getMonth()
  const startDate = start.getDate()

  if (!end && !range) {
    console.error('date range 需指定一种结束日期')
    return [
      [{ value: '', label: '' }],
      [{ value: '', label: '' }],
      [{ value: '', label: '' }]
    ]
  } else if (end) {
    // end 的优先级高于 range
  } else if (range) {
    // 可能出现2020.02.29 -> 2022.02.29 但是 2022.02 没有 29 号，这时就直接用 Date 的特性顺延即可
    end = new Date(startYear + range, startMonth, startDate)
  }

  const endYear = end!.getFullYear()
  const endMonth = end!.getMonth()
  const endDate = end!.getDate()

  const [year, month, day] = [[], [], []] as Array<Array<CommonItemType>>

  if (start < end!) {
    for (let i = startYear; i <= endYear; i++) {
      year.push({
        value: `${i}`,
        label: `${i}年`
      })
    }
  } else {
    for (let i = startYear; i >= endYear; i--) {
      year.push({
        value: `${i}`,
        label: `${i}年`
      })
    }
  }

  if (specificStart) {
    year.unshift(...specificStart[0])
    month.unshift(...specificStart[1])
    day.unshift(...specificStart[1])
    return [year, month, day]
  }

  if (specificEnd) {
    year.push(...specificEnd[0])
    month.push(...specificEnd[1])
    day.push(...specificEnd[1])
    return [year, month, day]
  }

  // _em = startYear === endYear ? endMonth + 1 : 12
  let _sm = startYear === endYear ? startMonth + 1 : 1
  let _em = startYear === endYear ? endMonth + 1 : 12
  for (let i = _sm; i <= _em; i++) {
    month.push({
      value: `${i < 10 ? '0' : ''}${i}`,
      label: `${i}月`
    })
  }

  let _sd = startYear === endYear && startMonth === endMonth ? startDate : 1
  // let _ed =
  //   startYear === endYear && startMonth === endMonth
  //     ? endDate
  //     : new Date(startYear, startMonth + 1, 0).getDate() // 取这个月的天数
  for (let i = _sd; i <= endDate; i++) {
    day.push({
      value: `${i < 10 ? '0' : ''}${i}`,
      label: `${i}日`
    })
  }

  // console.log('range21', startYear, startMonth, startDate)
  // console.log('range22', endYear, endMonth, endDate)
  // console.log('range23', year, month, day)

  return [year, month, day]
}

export function createDateRange(
  option: CreateDateRangeParamsType
): Array<Array<CommonItemType>> {
  let {
    start,
    end,
    range, // 目前暂时只支持年跨度
    specificStart,
    specificEnd
  } = option

  if (!start) start = new Date()

  const startYear = start.getFullYear()
  const startMonth = start.getMonth()
  const startDate = start.getDate()

  if (!end && !range) {
    console.error('date range 需指定一种结束日期')
    return [
      [{ value: '', label: '' }],
      [{ value: '', label: '' }],
      [{ value: '', label: '' }]
    ]
  } else if (end) {
    // end 的优先级高于 range
  } else if (range) {
    // 可能出现2020.02.29 -> 2022.02.29 但是 2022.02 没有 29 号，这时就直接用 Date 的特性顺延即可
    end = new Date(startYear + range, startMonth, startDate)
  }

  const endYear = end!.getFullYear()
  const endMonth = end!.getMonth()
  const endDate = end!.getDate()

  const [year, month, day] = [[], [], []] as Array<Array<CommonItemType>>

  if (start < end!) {
    for (let i = startYear; i <= endYear; i++) {
      year.push({
        value: `${i}`,
        label: `${i}年`
      })
    }
  } else {
    for (let i = startYear; i >= endYear; i--) {
      year.push({
        value: `${i}`,
        label: `${i}年`
      })
    }
  }

  if (specificStart) {
    year.unshift(...specificStart[0])
    month.unshift(...specificStart[1])
    day.unshift(...specificStart[1])
    return [year, month, day]
  }

  if (specificEnd) {
    year.push(...specificEnd[0])
    month.push(...specificEnd[1])
    day.push(...specificEnd[1])
    return [year, month, day]
  }

  const _em = startYear === endYear ? endMonth + 1 : 12
  for (let i = startMonth + 1; i <= _em; i++) {
    month.push({
      value: `${i < 10 ? '0' : ''}${i}`,
      label: `${i}月`
    })
  }

  const _ed =
    startYear === endYear && startMonth === endMonth
      ? endDate
      : new Date(startYear, startMonth + 1, 0).getDate() // 取这个月的天数

  console.log('start: ', startYear, startMonth, startDate)
  console.log('end: ', endYear, endMonth, endDate)
  for (let i = startDate; i <= _ed; i++) {
    day.push({
      value: `${i < 10 ? '0' : ''}${i}`,
      label: `${i}日`
    })
  }

  console.log('range1', startYear, startMonth, startDate)
  console.log('range2', endYear, endMonth, endDate)
  console.log('range3', year, month, day)

  return [year, month, day]
}

export function formatDate(date: Date, fmt: string): string {
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      String(date.getFullYear()).substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const temp: string =
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(String(o[k]).length)
      fmt = fmt.replace(RegExp.$1, temp)
    }
  }
  return fmt
}

export function formatTimestamp(t: number, fmt: string): string {
  return formatDate(new Date(t), fmt)
}

let screenWidth = Taro.getSystemInfoSync().screenWidth
export const pxTransform = (pxNumber: number) => {
  if (!screenWidth) {
    screenWidth = Taro.getSystemInfoSync().screenWidth
  }
  return (pxNumber / 375) * screenWidth + 'px'
}
