import fs from 'fs';
import path from 'path';
import https from 'https';
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

// Create an HTTPS server using native Node.js
const server = https.createServer(options, (req, res) => {
  // Serve static files from the ../www directory.
  let filePath = req.url;
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }
  const fullPath = path.join(__dirname, '../www', filePath);
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      logWarn(`File not found for path ${req.url}. Returning 404.`);
      res.statusCode = 404;
      res.end('Not Found');
    } else {
      logDebug(`Serving static file: ${req.url} requested from ${req.socket.remoteAddress || 'unknown IP'}`);
      res.statusCode = 200;
      res.end(data);
    }
  });
});

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


// The following middleware related to legacy endpoints has been preserved for compatibility,
// but note that Koa is no longer used.
server.on('request', (req, res) => {
  // If the request is for legacy endpoints such as '/datachannel' or '/api/localip', return 404.
  if (req.url === '/datachannel' || req.url === '/api/localip') {
    logDebug(`Legacy endpoint "${req.url}" requested; returning 404 without error.`);
    res.statusCode = 404;
    res.end('Not Found');
  }
});
