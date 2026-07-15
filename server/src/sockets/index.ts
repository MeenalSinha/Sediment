import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { RealtimeEvent } from "@sediment/shared";
import { env } from "../config/env";
import { redisPublisher, redisSubscriber } from "../db/redis";

let io: Server | null = null;

const REDIS_CHANNEL = "sediment:realtime";

export function initSockets(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.webOrigin, credentials: true },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join_subreddit", ({ subredditId }: { subredditId: string }) => {
      if (typeof subredditId === "string") {
        socket.join(roomName(subredditId));
      }
    });
  });

  // Cross-instance fan-out: any process can publish, every process rebroadcasts to its local sockets.
  redisSubscriber.subscribe(REDIS_CHANNEL);
  redisSubscriber.on("message", (_channel, message) => {
    try {
      const event = JSON.parse(message) as RealtimeEvent;
      io?.to(roomName(event.subredditId)).emit("realtime_event", event);
    } catch {
      // ignore malformed payloads
    }
  });

  return io;
}

function roomName(subredditId: string): string {
  return `subreddit:${subredditId}`;
}

/** Publishes a realtime event to every server instance's connected clients for that subreddit. */
export async function broadcastRealtimeEvent<T>(event: RealtimeEvent<T>): Promise<void> {
  await redisPublisher.publish(REDIS_CHANNEL, JSON.stringify(event));
}
