import { io, type Socket } from "socket.io-client";
import type { RealtimeEvent } from "@sediment/shared";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000", {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket"],
    });
  }
  return socket;
}

export function joinSubreddit(subredditId: string): void {
  getSocket().emit("join_subreddit", { subredditId });
}

export function onRealtimeEvent(handler: (event: RealtimeEvent) => void): () => void {
  const s = getSocket();
  s.on("realtime_event", handler);
  return () => s.off("realtime_event", handler);
}
