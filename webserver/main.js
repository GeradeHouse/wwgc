// Note: This code is now implemented in Node.js using Koa and koa-websocket.
// The original Deno reference has been removed since Node.js does not use it.

import Koa from "koa";
import Router from "@koa/router";
import send from "koa-send";
import websockify from "koa-websocket";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import https from "https";
import net from "net";

// Promisify exec for command execution.
const execPromise = promisify(exec);

// Create a websocket-enabled Koa application.
const app = websockify(new Koa());
const router = new Router();
const wsRouter = new Router();

const clients = []; // Array of WebSocket connections.

async function getLocalIp() {
  try {
    // Create a connection to 8.8.8.8:53 to obtain the local IP.
    return new Promise((resolve) => {
      const socket = net.createConnection(53, "8.8.8.8", function () {
        const addr = socket.address();
        resolve(addr.address);
        socket.end();
      });
      socket.on("error", () => {
        resolve("localhost");
      });
    });
  } catch {
    return "localhost";
  }
}

wsRouter.get("/datachannel", (ctx) => {
  // In koa-websocket, the WebSocket is available as ctx.websocket.
  if (!ctx.websocket) {
    ctx.body = { err: "need to connect this by ws" };
    return;
  }
  const socket = ctx.websocket;
  clients.push(socket);
  socket.on("message", (message) => {
    clients.forEach((s) => {
      if (s.readyState === s.OPEN) {
        s.send(message);
      }
    });
  });
});

router.get("/api/localip", async (ctx) => {
  const ip = await getLocalIp();
  ctx.set("Content-Type", "application/json");
  ctx.body = { ip };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
  if (
    ctx.request.url.pathname === "/" ||
    ctx.request.url.pathname === "/index.html"
  ) {
    let content = await fs.readFile(
      path.join(process.cwd(), "www", "index.html"),
      "utf8"
    );
    const localIp = await getLocalIp();
    // Replace all occurrences of "localhost" with your PC's local IP address.
    content = content.replace(/localhost/g, localIp);
    ctx.set("content-type", "text/html");
    ctx.body = content;
  } else {
    try {
      await send(ctx, ctx.request.url.pathname, {
        root: path.join(process.cwd(), "www"),
        index: "index.html",
      });
    } catch {
      await next();
    }
  }
});

// Ensure that the certificate and key files exist (or generate them if not).
async function ensureCertificates() {
  try {
    await fs.stat(path.join(process.cwd(), "webserver", "localhost.crt"));
    await fs.stat(
      path.join(process.cwd(), "webserver", "localhost_rsa_traditional.key")
    );
    console.log("Certificate and RSA key exist.");
  } catch {
    console.log("Certificate or RSA key not found. Generating using OpenSSL...");
    // Generate a traditional RSA private key.
    try {
      const { stdout, stderr } = await execPromise(
        'openssl genrsa -traditional -out webserver/localhost_rsa_traditional.key 4096'
      );
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (e) {
      console.error(e);
    }
    // Generate a self-signed certificate using the generated RSA key.
    try {
      const { stdout, stderr } = await execPromise(
        'openssl req -x509 -new -key webserver/localhost_rsa_traditional.key -out webserver/localhost.crt -days 365 -nodes -subj "/CN=localhost"'
      );
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (e) {
      console.error(e);
    }
  }
}

await ensureCertificates();

async function waitForCertificates(timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await fs.stat(path.join(process.cwd(), "webserver", "localhost.crt"));
      await fs.stat(
        path.join(process.cwd(), "webserver", "localhost_rsa_traditional.key")
      );
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return false;
}

console.log("Attempting to start HTTPS server on port 8000...");
if (await waitForCertificates()) {
  console.log("Starting secured HTTPS server on port 8000.");
  console.log("HTTPS server running at https://localhost:8000");
  // Read the certificate and key file contents.
  const certContent = await fs.readFile(
    path.join(process.cwd(), "webserver", "localhost.crt"),
    "utf8"
  );
  const keyContent = await fs.readFile(
    path.join(process.cwd(), "webserver", "localhost_rsa_traditional.key"),
    "utf8"
  );
  // Create HTTPS server using Node's https module and Koa's callback.
  const httpsServer = https.createServer(
    { key: keyContent, cert: certContent },
    app.callback()
  );
  httpsServer.listen(8000, "0.0.0.0", () => {
    console.log("Server is listening on https://localhost:8000");
  });
} else {
  console.error("Certificate files still not found after waiting.");
}

/* Attach WebSocket routes. */
app.ws.use(wsRouter.routes());
app.ws.use(wsRouter.allowedMethods());
