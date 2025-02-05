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

// Setup HTTPS server using either Java trust store or mkcert certificates.
// If the environment variable USE_JAVA_KEYSTORE is set (e.g., "true"),
// the server will attempt to load the certificate from the Java trust store.
// Note: The Java trust store (cacerts) does not include private keys.
// Therefore, you must supply the path to the corresponding private key file
// via the environment variable LOCAL_KEY_PATH.
let certContent, keyContent;
if (process.env.USE_JAVA_KEYSTORE === "true") {
  console.log("Attempting to load certificate from Java trust store...");
  try {
    const javaKeystorePath = path.join(process.env.JAVA_HOME, "lib", "security", "cacerts");
    // Export the certificate with alias "localhost" from the Java trust store.
    // The cacerts file is protected by the default password "changeit".
    const keytoolCmd = `keytool -exportcert -alias localhost -keystore "${javaKeystorePath}" -rfc -storepass changeit`;
    const { stdout, stderr } = await execPromise(keytoolCmd);
    if (stderr) console.error(stderr);
    certContent = stdout;
    // Load the private key from the file specified in LOCAL_KEY_PATH.
    // This private key must correspond to the certificate in the trust store.
    if (process.env.LOCAL_KEY_PATH) {
      keyContent = await fs.readFile(process.env.LOCAL_KEY_PATH, "utf8");
    } else {
      throw new Error("LOCAL_KEY_PATH not provided. Please set the environment variable to the private key file path.");
    }
    console.log("Successfully loaded certificate from Java trust store.");
  } catch (e) {
    console.error("Failed to load certificate from Java trust store:", e);
  }
} else {
  // Fallback: use mkcert-generated certificates in the webserver directory.
  console.log("Attempting to load mkcert certificates from webserver directory...");
  const certPath = path.join(process.cwd(), "webserver", "localhost.pem");
  const keyPath = path.join(process.cwd(), "webserver", "localhost-key.pem");
  try {
    await fs.stat(certPath);
    await fs.stat(keyPath);
    console.log("mkcert certificates found.");
    certContent = await fs.readFile(certPath, "utf8");
    keyContent = await fs.readFile(keyPath, "utf8");
  } catch (e) {
    console.error("mkcert certificate files not found. Please run mkcert to generate certificates.", e);
  }
}

// Create and start the HTTPS server if we have both certificate and key.
if (certContent && keyContent) {
  console.log("Starting secured HTTPS server on port 8000.");
  const httpsServer = https.createServer(
    { key: keyContent, cert: certContent },
    app.callback()
  );
  httpsServer.listen(8000, "0.0.0.0", () => {
    console.log("Server is listening on https://localhost:8000");
  });
} else {
  console.error("Unable to start HTTPS server due to missing certificate or key.");
}

app.ws.use(wsRouter.routes());
app.ws.use(wsRouter.allowedMethods());
