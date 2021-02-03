// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {year, month, day, type} = event

  console.log('submitMenstruation', event)

  const db = cloud.database()
  const collection = db.collection('menstruation')

  const {errMsg} = await collection.add({
    data: {
      userID: wxContext.OPENID,
      year: year,
      month: month,
      day: day,
      type: type,
    }
  })

  return {
    code: errMsg.indexOf('add:ok') >= 0 ? 200 : 400,
  };
}
