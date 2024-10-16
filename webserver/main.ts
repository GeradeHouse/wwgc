import { Application, Router, send } from '@oak/oak'

const clients: Array<WebSocket> = []

const app = new Application()
const router = new Router()

router.get('/datachannel', (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.response.body = {
      err: 'need to connect this by ws'
    }
    return
  }
  const socket = ctx.upgrade()
  clients.push(socket)
  socket.addEventListener('message', (event) => {
    clients.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data)
      }
    })
  })
})

app.use(router.allowedMethods())
app.use(router.routes())
app.use(async (ctx, next) => {
  try {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/../www`,
      index: 'index.html',
    })
  } catch {
    await next()
  }
})

await app.listen({
  port: 8000,
  hostname: '0.0.0.0',
})