export function PageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4" aria-busy="true" aria-label="Loading">
      <div className="h-24 animate-pulse rounded-xl bg-stone-800/60" />
      <div className="flex flex-1 gap-4">
        <div className="hidden w-64 animate-pulse rounded-xl bg-stone-800/60 sm:block" />
        <div className="flex-1 animate-pulse rounded-xl bg-stone-800/60" />
        <div className="hidden w-80 animate-pulse rounded-xl bg-stone-800/60 lg:block" />
      </div>
    </div>
  );
}

export function FullScreenSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-stone-950">
      <div className="h-16 animate-pulse border-b border-stone-800 bg-stone-900/60" />
      <PageSkeleton />
    </div>
  );
}
