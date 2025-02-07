/**
 * Main webserver entry point for the WWGC application.
 * Implements a secure HTTPS server with Socket.IO support for real-time communication.
 * 
 * @module main
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';

// Set up __filename and __dirname equivalents for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Logging utility functions for consistent timestamp-based logging across the application.
 * Each function prepends ISO timestamp to the message.
 */

/**
 * Logs debug-level messages with timestamp
 * @param {string} message - The message to log
 * @param {...any} args - Additional arguments to log
 */
function logDebug(message, ...args) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}

/**
 * Logs error-level messages with timestamp
 * @param {string} message - The error message to log
 * @param {...any} args - Additional arguments to log
 */
function logError(message, ...args) {
  console.error(`[${new Date().toISOString()}] ${message}`, ...args);
}

/**
 * Logs warning-level messages with timestamp
 * @param {string} message - The warning message to log
 * @param {...any} args - Additional arguments to log
 */
function logWarn(message, ...args) {
  console.warn(`[${new Date().toISOString()}] ${message}`, ...args);
}

logDebug('Starting webserver...');

// Load SSL certificates for HTTPS
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

// HTTPS server configuration
const options = { key, cert };
const port = process.env.PORT || 8000;

/**
 * HTTPS server instance that handles:
 * 1. Static file serving from ../www directory
 * 2. Socket.IO connections for real-time communication
 * 3. Legacy endpoint handling
 */
const server = https.createServer(options, (req, res) => {
  // Handle static file serving
  let filePath = req.url;
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';  // Default to index.html for root requests
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

// Start the HTTPS server
server.listen(port, () => {
  logDebug(`HTTPS server listening on port ${port}`);
});

/**
 * Socket.IO server instance for handling real-time communication
 * Configured with CORS enabled for all origins
 */
const io = new SocketIOServer(server, { cors: { origin: "*" }});

// Socket.IO event handlers
io.on("connection", (socket) => {
  logDebug(`New socket.io client connected: ${socket.id}`);
  
  // Handle incoming messages and broadcast them to all other clients
  socket.on("message", (data) => {
    logDebug(`Received message from ${socket.id}:`, data);
    socket.broadcast.emit("message", data);
  });
  
  // Handle client disconnections
  socket.on("disconnect", () => {
    logDebug(`Socket.io client disconnected: ${socket.id}`);
  });
});

/**
 * Legacy endpoint handler
 * Maintains backwards compatibility by properly handling deprecated endpoints
 * Currently returns 404 for /datachannel and /api/localip
 */
server.on('request', (req, res) => {
  if (req.url === '/datachannel' || req.url === '/api/localip') {
    logDebug(`Legacy endpoint "${req.url}" requested; returning 404 without error.`);
    res.statusCode = 404;
    res.end('Not Found');
  }
});