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

const app = websockify(new Koa());
const router = new Router();
const wsRouter = new Router();

const clients = [];

async function getLocalIp() {
  try {
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

// Static file serving middleware with logging.
app.use(async (ctx, next) => {
  console.log("Incoming request:", ctx.path);
  // If the requested path is "/" or "/index.html" (or empty), serve index.html directly.
  if (!ctx.path || ctx.path === "/" || ctx.path === "/index.html") {
    console.log("[DEBUG] Serving index.html for:", ctx.path);
    const filePath = path.join(process.cwd(), "www", "index.html");
    console.log("Attempting to serve index from:", filePath);
    try {
      let content = await fs.readFile(filePath, "utf8");
      const localIp = await getLocalIp();
      console.log("[DEBUG] Replacing 'localhost' with:", localIp);
      content = content.replace(/localhost/g, localIp);
      console.log("[DEBUG] Content length:", content.length);
      ctx.set("content-type", "text/html");
      ctx.body = content;
      console.log("Successfully served index.html for", ctx.path);
      return;
    } catch (err) {
      console.error("Error reading index.html at", filePath, err);
      ctx.status = 500;
      ctx.body = "Internal Server Error";
      return;
    }
  } else {
    try {
      await send(ctx, ctx.path, {
        root: path.join(process.cwd(), "www"),
        index: "index.html",
      });
    } catch (err) {
      console.error("Error sending file for", ctx.path, err);
      await next();
    }
  }
});

// Fallback middleware: Always serve index.html.
// This ensures routes not matching a static asset will load the SPA.
app.use(async (ctx) => {
  const filePath = path.join(process.cwd(), "www", "index.html");
  console.log("Default fallback: serving index.html for", ctx.path);
  try {
    let fallbackContent = await fs.readFile(filePath, "utf8");
    const localIp = await getLocalIp();
    fallbackContent = fallbackContent.replace(/localhost/g, localIp);
    ctx.set("content-type", "text/html");
    ctx.body = fallbackContent;
  } catch (err) {
    console.error("Fallback error reading index.html at", filePath, err);
    ctx.status = 404;
    ctx.body = "Not Found";
  }
});

// Simplified HTTPS Certificate Handling with mkcert check and auto-generation.
console.log("Ensuring mkcert is installed and initialized...");

async function ensureMkcertInstalled() {
  try {
    execSync("mkcert -version", { stdio: "ignore" });
    console.log("mkcert is already installed.");
  } catch (e) {
    console.log("mkcert is not installed. Installing mkcert via Chocolatey...");
    try {
      execSync("choco install mkcert -y", { stdio: "inherit" });
      console.log("mkcert installed successfully.");
    } catch (installError) {
      console.error("Failed to install mkcert", installError);
      throw installError;
    }
    try {
      execSync("mkcert -install", { stdio: "inherit" });
      console.log("mkcert has been initialized successfully.");
    } catch (initError) {
      console.error("Failed to initialize mkcert", initError);
      throw initError;
    }
  }
}

await ensureMkcertInstalled();

console.log("Ensuring certificate files exist...");

const certPath = path.join(process.cwd(), "localhost.pem");
const keyPath = path.join(process.cwd(), "localhost-key.pem");

async function ensureCertificates() {
  if (!fsSync.existsSync(certPath) || !fsSync.existsSync(keyPath)) {
    console.log("Certificates not found. Generating via mkcert...");
    try {
      execSync("mkcert localhost", { stdio: "inherit" });
      console.log("Certificates generated successfully.");
    } catch (error) {
      console.error("Error generating certificates via mkcert", error);
      throw error;
    }
  }
  try {
    const certContent = await fs.readFile(certPath, "utf8");
    const keyContent = await fs.readFile(keyPath, "utf8");
    return { cert: certContent, key: keyContent };
  } catch (error) {
    console.error("Error reading certificate files", error);
    throw error;
  }
}

try {
  const credentials = await ensureCertificates();
  console.log("Starting secured HTTPS server on port 8000.");
  const httpsServer = https.createServer(credentials, app.callback());
  httpsServer.listen(8000, "0.0.0.0", () => {
    console.log("Server is listening on https://localhost:8000");
  });
} catch (error) {
  console.error("Unable to start HTTPS server due to certificate issues:", error);
}

app.ws.use(wsRouter.routes());
app.ws.use(wsRouter.allowedMethods());
