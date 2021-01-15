import Taro from '@tarojs/taro'

export const isIpx = () => {
  const systemInfo = Taro.getSystemInfoSync()
  const { screenHeight, screenWidth, system } = systemInfo
  return (
    system.toLowerCase().indexOf('ios') >= 0 && screenHeight / screenWidth > 1.8
  )
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

  const [year, month, date] = [[], [], []] as Array<Array<CommonItemType>>

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
    date.unshift(...specificStart[1])
    return [year, month, date]
  }

  if (specificEnd) {
    year.push(...specificEnd[0])
    month.push(...specificEnd[1])
    date.push(...specificEnd[1])
    return [year, month, date]
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
  for (let i = startDate; i <= _ed; i++) {
    date.push({
      value: `${i < 10 ? '0' : ''}${i}`,
      label: `${i}日`
    })
  }
  return [year, month, date]
}
