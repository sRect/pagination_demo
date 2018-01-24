const MongoClient = require('mongodb').MongoClient;
// const urlQuiz = 'mongodb://localhost:27017/quiz';
// const urlInsert = "mongodb://localhost:27017/login";
const config = require("../config/index")

const _connectMongoDB = (url, callback) => {
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('连接数据库失败');
      callback(err, null);
      return;
    }
    // console.log("数据库连接成功");
    callback(err, db);
  })
}

// 查
exports.select = (collectionName, search, arg, callback) => {
  // console.log(arguments.length)
  // if(arguments.length !== 4) {
  //   throw new Error('参数错误')
  //   return;
  // }

  let limit = arg.limit || 0,
    skip = arg.skip * arg.limit || 0,
    order = arg.order || {};

  _connectMongoDB(config.urlQuiz, (err, db) => {
    db.collection(collectionName).find(search).limit(limit).skip(skip).sort(order).toArray((err, data) => {
      callback(err, data);
      db.close();
    })
  })
}

// 查询总数
exports.count = (collectionName, search, callback) => {
  _connectMongoDB(config.urlQuiz, (err,db) => {
    db.collection(collectionName).find(search).count(function (err, data) {
      if (err) {
        throw new Error('查询总条数错误：'+ err)
        return;
      }
      console.log('查询总数：' + data)
      callback(err, data);
      db.close();
    })
  })
}

// 增
exports.insert = (collectionName, insertObj, callback) => {
  _connectMongoDB(config.urlInsert, (err, db) => {
    db.collection(collectionName).insertMany([{ "id": insertObj.id, "time": insertObj.time }], (err, result) => {
      if (err) {
        throw new Error("插入数据失败:"+err)
        return;
      }
      console.log('插入数据成功')
      callback(err, result)
      db.close()
    })
  })
}