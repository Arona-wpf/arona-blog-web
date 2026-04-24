const Koa = require('koa')
const koaSend = require('koa-send')
const koaStatic = require('koa-static')
const app = new Koa()

const config = {
  port: process.env.PORT || 12233,
  root: './dist'
}
app.use(koaStatic(config.root))

app.use(async (ctx, next) => {
  const url = ctx.request.originalUrl
  const path = url.split('?')[0]
  if (path === '/favicon.png' || /^\/assets/.test(path)) {
    ctx.set('Cache-Control', 'max-age=604800,private,immutable')
    await next()
    return
  }

  await koaSend(ctx, `${config.root}/index.html`)
})

app.listen(config.port, () => {
  console.log(`listening on port ${config.port}..`)
})
