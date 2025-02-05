/// <reference lib="deno" />
import { Application, Router, send } from "https://deno.land/x/oak@v11.1.0/mod.ts";

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
      root: `${Deno.cwd()}/www`,
      index: 'index.html',
    })
  } catch {
    await next()
  }
})
console.log("Server started on port 8000. Access it using your PC's local IP address for mobile devices.");
await app.listen({
  port: 8000,
  hostname: '0.0.0.0',
});