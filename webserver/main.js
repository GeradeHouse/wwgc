import fs from 'fs';
import path from 'path';
import https from 'https';
import Koa from 'koa';
import send from 'koa-send';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logging helper functions for consistent and enriched logging
function logDebug(message, ...args) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}
function logError(message, ...args) {
  console.error(`[${new Date().toISOString()}] ${message}`, ...args);
}
function logWarn(message, ...args) {
  console.warn(`[${new Date().toISOString()}] ${message}`, ...args);
}

logDebug('Starting webserver...');

let key, cert;
try {
  const certDir = path.join(__dirname, '../');
  logDebug(`Reading certificate files from ${certDir}`);
  key = fs.readFileSync(path.join(certDir, 'key.pem'));
  cert = fs.readFileSync(path.join(certDir, 'cert.pem'));
  logDebug('Successfully read certificate files.');
} catch (err) {
  logError(`Error reading certificate files from ${path.join(__dirname, '../')}. Please ensure that 'key.pem' and 'cert.pem' exist in the project root. Verify file existence and permissions.`, err);
  process.exit(1);
}

const options = { key, cert };

const port = process.env.PORT || 8000;

const app = new Koa();
const server = https.createServer(options, app.callback());
server.listen(port, () => {
  logDebug(`HTTPS server listening on port ${port}`);
});
const io = new SocketIOServer(server, { cors: { origin: "*" }});
io.on("connection", (socket) => {
  logDebug(`New socket.io client connected: ${socket.id}`);
  socket.on("message", (data) => {
    logDebug(`Received message from ${socket.id}:`, data);
    socket.broadcast.emit("message", data);
  });
  socket.on("disconnect", () => {
    logDebug(`Socket.io client disconnected: ${socket.id}`);
  });
});

app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/ws')) {
    return await next();
  }
  // If the request is for legacy endpoints such as '/datachannel', return 404 quietly.
  if (ctx.path === '/datachannel' || ctx.path === '/api/localip') {
    logDebug(`Legacy endpoint "${ctx.path}" requested; returning 404 without error.`);
    ctx.status = 404;
    ctx.body = 'Not Found';
    return;
  }
  try {
    logDebug(`Serving static file: ${ctx.path} requested from ${ctx.ip || 'unknown IP'}`);
    await send(ctx, ctx.path, { root: path.join(__dirname, '../www'), index: 'index.html' });
    if (!ctx.body) {
      logWarn(`File not found for path ${ctx.path}. Returning 404.`);
      ctx.status = 404;
      ctx.body = 'Not Found';
    }
  } catch (err) {
    logError(`Error serving static file for path ${ctx.path}:`, err);
    ctx.status = err.status || 404;
    ctx.body = 'Not Found';
  }
});

 
