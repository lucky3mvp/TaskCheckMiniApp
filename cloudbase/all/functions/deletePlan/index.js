// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { planID } = event

  console.log('deletePlan params: ', event)

  const db = cloud.database()
  const collection = db.collection('plan')

  await collection.doc(planID).update({
    data: {
      status: 2,
    }
  })

  return {
    code: 200
  }
}
