import fs from 'fs';
import path from 'path';
import https from 'https';
import Koa from 'koa';
import send from 'koa-send';
import koaWebsocket from 'koa-websocket';
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

const app = koaWebsocket(new Koa());

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

const wsClients = new Set();

app.ws.use((ctx) => {
  if (ctx.path === '/ws') {
    const clientId = (ctx.websocket._socket.remoteAddress || 'unknown') + ':' + (ctx.websocket._socket.remotePort || '');
    wsClients.add(ctx.websocket);
    logDebug(`New WebSocket client connected (ID: ${clientId}). Total clients: ${wsClients.size}`);
    
    ctx.websocket.on('message', (message) => {
      logDebug(`Received WebSocket message from client ${clientId}: ${message}`);
      try {
        const parsed = JSON.parse(message);
        logDebug(`Parsed message content from client ${clientId}:`, parsed);
      } catch (e) {
        logWarn(`Received invalid JSON message from client ${clientId}. Raw message: ${message}`);
      }
      wsClients.forEach(client => {
        if (client !== ctx.websocket && client.readyState === 1) { // OPEN state
          client.send(message);
          logDebug(`Forwarded message from client ${clientId} to another client. Total clients: ${wsClients.size}`);
        }
      });
    });
    
    ctx.websocket.on('close', () => {
      wsClients.delete(ctx.websocket);
      logDebug(`WebSocket client disconnected (ID: ${clientId}). Total clients: ${wsClients.size}`);
    });
    
    ctx.websocket.on('error', (error) => {
      logError(`WebSocket client error (ID: ${clientId}):`, error);
    });
  }
});

https.createServer(options, app.callback()).listen(port, () => {
  logDebug(`HTTPS server listening on port ${port}`);
});
