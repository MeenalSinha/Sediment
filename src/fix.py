import sys

with open('main.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Imports
code = code.replace(
    'import { Devvit, useState } from "@devvit/public-api";',
    'import { Devvit, useState, useChannel } from "@devvit/public-api";'
)

# 2. Config
code = code.replace(
    '  realtime: true,\n',
    ''
)

# 3. Broadcast any
code = code.replace(
    'await context.realtime.send(CHANNEL(subredditId), event);',
    'await context.realtime.send(CHANNEL(subredditId), event as any);'
)

# 4. Remove context.realtime.subscribe
target_str = """    // ── Realtime listener: forward events to WebView ─────────────────────────
    context.realtime.subscribe(
      // The channel will be determined per-subreddit at runtime
      // We catch all events and forward them
      `sediment-events-*`,
      (event: RealtimeEvent) => {
        context.ui.webView.postMessage("sediment-webview", {
          type: "realtime_event",
          event,
        } satisfies DevvitMessage);
      },
    );"""
code = code.replace(target_str, "")

# 5. useChannel in render
code = code.replace(
    '    const [webviewVisible, setWebviewVisible] = useState(false);',
    """    const [webviewVisible, setWebviewVisible] = useState(false);

    const channel = useChannel({
      name: "sediment-events",
      onMessage: (msg) => {
        context.ui.webView.postMessage("sediment-webview", {
          type: "realtime_event",
          event: msg,
        } as any);
      },
    });
    channel.subscribe();"""
)

# 6. Remove realtime.subscribe inside webview_ready
code = code.replace(
    '          // Subscribe this user to realtime events on mount\n          await realtime.subscribe(CHANNEL(subredditId));\n',
    ''
)

# 7. satisfies DevvitMessage -> as any
code = code.replace('} satisfies DevvitMessage);', '} as any);')
code = code.replace('context.ui.webView.postMessage("sediment-webview", reply);', 'context.ui.webView.postMessage("sediment-webview", reply as any);')

# 8. submitPost options as any
code = code.replace(
    """    await context.reddit.submitPost({
      title: `r/${subreddit.name} Community Dig — The Excavation Begins!`,
      subredditName: subreddit.name,
      preview: (
        <vstack grow alignment="middle center" padding="large">
          <text size="xlarge" weight="bold">
            🏺 Sediment
          </text>
          <text size="medium" color="neutral-content-weak">
            Loading your dig site…
          </text>
        </vstack>
      ),
    });""",
    """    await context.reddit.submitPost({
      title: `r/${subreddit.name} Community Dig — The Excavation Begins!`,
      subredditName: subreddit.name,
      preview: (
        <vstack grow alignment="middle center" padding="large">
          <text size="xlarge" weight="bold">
            🏺 Sediment
          </text>
          <text size="medium" color="neutral-content-weak">
            Loading your dig site…
          </text>
        </vstack>
      ),
    } as any);"""
)

with open('main.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
