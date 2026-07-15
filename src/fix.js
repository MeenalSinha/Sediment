const fs = require('fs');

let code = fs.readFileSync('main.tsx', 'utf8');

// 1. Add useChannel to imports
code = code.replace(
  'import { Devvit, useState } from "@devvit/public-api";',
  'import { Devvit, useState, useChannel } from "@devvit/public-api";'
);

// 2. Remove realtime from configuration
code = code.replace(
  `Devvit.configure({
  redditAPI: true,
  redis: true,
  realtime: true,
});`,
  `Devvit.configure({
  redditAPI: true,
  redis: true,
});`
);

// 3. Fix broadcast to cast event to any
code = code.replace(
  'await context.realtime.send(CHANNEL(subredditId), event);',
  'await context.realtime.send(CHANNEL(subredditId), event as any);'
);

// 4. Remove context.realtime.subscribe and replace with nothing
const subscribeStr = `    // ── Realtime listener: forward events to WebView ─────────────────────────
    context.realtime.subscribe(
      // The channel will be determined per-subreddit at runtime
      // We catch all events and forward them
      \`sediment-events-*\`,
      (event: RealtimeEvent) => {
        context.ui.webView.postMessage("sediment-webview", {
          type: "realtime_event",
          event,
        } satisfies DevvitMessage);
      },
    );`;

code = code.replace(subscribeStr, "");

// 5. Add useChannel in render
code = code.replace(
  `    const [webviewVisible, setWebviewVisible] = useState(false);`,
  `    const [webviewVisible, setWebviewVisible] = useState(false);

    const channel = useChannel({
      name: "sediment-events",
      onMessage: (msg) => {
        context.ui.webView.postMessage("sediment-webview", {
          type: "realtime_event",
          event: msg,
        } as any);
      },
    });
    channel.subscribe();`
);

code = code.replace(
  `// Subscribe this user to realtime events on mount
          await realtime.subscribe(CHANNEL(subredditId));`,
  `// Subscribe this user to realtime events on mount
          // await realtime.subscribe(CHANNEL(subredditId));`
);

// 6. Fix TS object casting for webview messages
code = code.replace(/} satisfies DevvitMessage\);/g, '} as any);');
code = code.replace(/context\.ui\.webView\.postMessage\("sediment-webview", reply\);/g, 'context.ui.webView.postMessage("sediment-webview", reply as any);');

// 7. Fix preview property in submitPost
code = code.replace(/preview: \([\s\S]*?\),/g, '');

fs.writeFileSync('main.tsx', code);
