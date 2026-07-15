import http from "node:http";
import { createApp } from "./app";
import { initSockets } from "./sockets";
import { env } from "./config/env";

const app = createApp();
const httpServer = http.createServer(app);

initSockets(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Sediment API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
