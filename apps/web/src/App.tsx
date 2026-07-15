import { useState } from "react";
import { AppShell } from "@/components/AppShell";

const REDDIT_LOGIN_URL = import.meta.env.VITE_REDDIT_LOGIN_URL ?? "http://localhost:4000/api/auth/reddit/login";

export default function App() {
  const [enteredDemo, setEnteredDemo] = useState(false);

  if (!enteredDemo) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-stone-950 px-6 text-center text-sand-100">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-widest text-gold-300">SEDIMENT</h1>
          <p className="mt-1 text-sm tracking-widest text-sand-400">Uncover. Restore. Remember.</p>
        </div>
        <p className="max-w-md text-sm text-sand-400">
          Sign in with Reddit to join your subreddit&rsquo;s excavation, or explore the prototype with demo data.
        </p>
        <div className="flex gap-3">
          <a
            href={REDDIT_LOGIN_URL}
            className="rounded-lg border border-teal-500/50 bg-teal-700 px-5 py-2.5 text-sm font-semibold text-sand-50 hover:bg-teal-600"
          >
            Continue with Reddit
          </a>
          <button
            onClick={() => setEnteredDemo(true)}
            className="rounded-lg border border-gold-500/50 bg-gradient-to-b from-gold-500 to-gold-700 px-5 py-2.5 text-sm font-bold text-stone-950"
          >
            View Demo
          </button>
        </div>
      </div>
    );
  }

  return <AppShell />;
}
