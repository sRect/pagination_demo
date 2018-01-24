const Koa = require("koa");
const Router = require('koa-router');
const satic = require("koa-static"); // 静态服务
const bodyParser = require('koa-bodyparser'); // 中间件
// const views = require('koa-views');
const fs = require("fs");
const path = require("path");
const db = require("./models/index.js")

const app = new Koa();
const router = new Router();

app.use(bodyParser());

app.use(satic(path.join(__dirname)))
// 加载模板引擎
// app.use(views(path.join(__dirname, './view'), {
//   extension: 'ejs'
// }))

const handler = async (ctx, next) => { // 全局处理错误
  try {
    await next()
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message
    };
    ctx.app.emit('error', err, ctx); // 释放error
  }
}
app.use(handler);

const getResourse = (search, limit, skip) => { // MongoDB获取数据
  return new Promise((resolve, reject) => {
    db.select(
      "quizzes",
      { "quiz": { $regex: search } },
      { "limit": limit, "skip": skip, "order":{"quiz": 1} },
      function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
        // console.log(data)
        resolve(data);
      }
    )
  })
}

const getCount = (search) => { // 查询总数
  return new Promise((resolve, reject) => {
    db.count("quizzes", { "quiz": { $regex: search } }, (err, data) => {
      if(err) {
        console.log(err);
        return;
      }
      resolve(data)
    })
  })
}

const insertFn = () => { // 插入记录
  db.insert("login", {
    "id": parseInt(Math.random() * 100 + 10),
    "time": new Date().getTime()
  }, function (err, result) {
    if (err) {
      console.log(err)
      return
    } else {
      console.log("插入数据成功："+JSON.stringify(result))
    }
  })
}

const render = () => { // 读取首页
  return new Promise((resolve, reject) => {
    fs.readFile('./index.html', 'utf-8', (err, data) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        
        resolve(data)
      }
    })
  })
}


router.get('/home', async (ctx, next) => { // get请求
  insertFn();
  ctx.response.type = "html";
  // let path = ctx.request.path;
  ctx.response.body = await render();
})

router.post('/index', async (ctx, next) => { // post请求
  // insertFn();
  
  ctx.response.type = "json";
  let data = ctx.request.body,
    search = '',
    limit = '',
    skip = '';

  search = data.search;
  limit = Number.parseInt(data.limit);
  skip = Number.parseInt(data.skip);

  console.log("请求参数:" + JSON.stringify(data))
  // ctx.response.body = await getResourse(search, limit, skip);
  ctx.response.body = {
    "data": await getResourse(search, limit, skip),
    "count": await getCount(search)
  }
})

app.use(router.routes())
  .use(router.allowedMethods());

app.on('error', function (err) {
  console.log('logging error ', err.message);
  console.log(err);
});

app.listen(3000, () => {
  console.log('your app is running at port 3000')
})