// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { year, month, day, type } = event
  const bt = new Date(event.beginTime).getTime()
  const et = event.endTime ? new Date(event.endTime).getTime() : null

  console.log('submitPlan params: ', event)

  const db = cloud.database()
  const collection = db.collection('plan')

  const { errMsg, _id } = await collection.add({
    data: {
      userID: wxContext.OPENID,
      name: event.name,
      description: event.description,
      theme: event.theme,
      icon: event.icon,
      category: event.category,
      unit: event.unit,
      goal: event.goal,
      type: event.type,
      subType: event.type === 2 ? 0 : event.subType,
      times: event.times,
      days: event.days,
      beginTime: bt,
      endTime: et,
      status: 1
    }
  })
  console.log('plan table add', errMsg, _id)
  if (_id) {
    // 更新 planID
    const res = await collection.doc(_id).update({
      data: {
        planID: _id
      }
    })
    console.log('plan table update', res)

    return {
      code: 200
    }
  }

  return {
    code: 400
  }
}
