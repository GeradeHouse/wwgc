import Koa from "koa";
import Router from "@koa/router";
import send from "koa-send";
import websockify from "koa-websocket";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { promisify } from "util";
import { exec, execSync } from "child_process";
import https from "https";
import net from "net";

const execPromise = promisify(exec);

// Initialize app first
const app = websockify(new Koa());
const router = new Router();
const wsRouter = new Router();
const clients = [];

// WebSocket route
wsRouter.get("/datachannel", (ctx) => {
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

// API route
router.get("/api/localip", async (ctx) => {
  const ip = await getLocalIp();
  ctx.set("Content-Type", "application/json");
  ctx.body = { ip };
});

// Middleware for /datachannel
app.use(async (ctx, next) => {
  if (ctx.path === "/datachannel" && 
     !(ctx.request.headers.upgrade?.toLowerCase() === "websocket")) {
    console.log("[DEBUG] Blocking non-WebSocket request for /datachannel");
    ctx.status = 404;
    ctx.body = "";
    return;
  }
  await next();
});

// Static file serving
app.use(async (ctx, next) => {
  try {
    await send(ctx, ctx.path, {
      root: path.join(process.cwd(), "www"),
      index: "index.html"
    });
  } catch (err) {
    await next();
  }
});

// Fallback to index.html
app.use(async (ctx) => {
  try {
    const content = await fs.readFile(path.join(process.cwd(), "www", "index.html"), "utf8");
    ctx.set("content-type", "text/html");
    ctx.body = content.replace(/localhost/g, await getLocalIp());
  } catch (err) {
    ctx.status = 404;
    ctx.body = "Not Found";
  }
});

// Helper functions
async function getLocalIp() {
  return new Promise((resolve) => {
    const socket = net.createConnection(53, "8.8.8.8");
    socket.on("connect", () => {
      resolve(socket.address().address);
      socket.end();
    });
    socket.on("error", () => resolve("localhost"));
  });
}

// Certificate handling
async function setupServer() {
  console.log("Ensuring certificates...");
  try {
    execSync("mkcert -install");
    execSync("mkcert -cert-file localhost.pem -key-file localhost-key.pem 192.168.31.18 localhost");
    
    execSync("openssl x509 -in localhost.pem -inform PEM -outform DER -out localhost.crt", { stdio: "inherit" });
    console.log("Converted PEM to DER format: localhost.crt generated.");

    const credentials = {
      cert: await fs.readFile("localhost.pem", "utf8"),
      key: await fs.readFile("localhost-key.pem", "utf8")
    };

    https.createServer(credentials, app.callback())
      .listen(8000, "0.0.0.0", () => {
        console.log("Server running on https://localhost:8000");
      });
  } catch (error) {
    console.error("Certificate error:", error);
    process.exit(1);
  }
}

// Apply routes and start
app.use(router.routes());
app.ws.use(wsRouter.routes());
setupServer();
