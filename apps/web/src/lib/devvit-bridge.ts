/**
 * devvit-bridge.ts
 *
 * Replaces the old HTTP `api.ts`. Instead of talking to an Express server,
 * this module sends/receives JSON messages via the Devvit WebView postMessage
 * protocol, which Reddit injects into the page at runtime.
 *
 * Usage:
 *   import { bridge } from "@/lib/devvit-bridge";
 *   bridge.send({ type: "get_artifacts" });
 *   bridge.on("initial_data", (msg) => { ... });
 */

import type { WebViewMessage, DevvitMessage } from "../../../src/types.js";

type MessageHandler<T extends DevvitMessage["type"]> = (
  msg: Extract<DevvitMessage, { type: T }>,
) => void;

type AnyHandler = (msg: DevvitMessage) => void;

class DevvitBridge {
  private handlers = new Map<string, AnyHandler[]>();
  private ready = false;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", (event) => {
        // Devvit wraps the payload in a data.type === "devvit-message" envelope
        const outer = event.data as { type?: string; data?: { message?: DevvitMessage } };
        let msg: DevvitMessage | null = null;

        if (outer?.type === "devvit-message" && outer?.data?.message) {
          msg = outer.data.message;
        } else if ((event.data as DevvitMessage)?.type) {
          // Fallback: direct message (e.g. during local dev preview)
          msg = event.data as DevvitMessage;
        }

        if (!msg) return;
        this._dispatch(msg);
      });
    }
  }

  /** Send a message to the Devvit backend */
  send(msg: WebViewMessage): void {
    if (typeof window === "undefined") return;
    window.parent.postMessage(msg, "*");
  }

  /** Register a typed handler for a specific message type */
  on<T extends DevvitMessage["type"]>(type: T, handler: MessageHandler<T>): () => void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler as AnyHandler);
    this.handlers.set(type, list);
    // Return an unsubscribe function
    return () => {
      const updated = (this.handlers.get(type) ?? []).filter((h) => h !== handler);
      this.handlers.set(type, updated);
    };
  }

  /** Initialize: tell Devvit the WebView is ready */
  init(): void {
    if (this.ready) return;
    this.ready = true;
    // Small delay to ensure the iframe is fully rendered before posting
    setTimeout(() => {
      this.send({ type: "webview_ready" });
    }, 100);
  }

  private _dispatch(msg: DevvitMessage): void {
    const list = this.handlers.get(msg.type) ?? [];
    for (const h of list) h(msg);

    // Also dispatch to "*" wildcard listeners
    const wildcard = this.handlers.get("*") ?? [];
    for (const h of wildcard) h(msg);
  }
}

export const bridge = new DevvitBridge();
