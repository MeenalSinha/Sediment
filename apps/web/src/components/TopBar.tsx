import { Menu, Settings, Trophy, Zap, Coins, Gem } from "lucide-react";
import { StatPill, ProgressBar } from "@sediment/ui";
import type { SedimentUser } from "@sediment/shared";

export interface TopBarProps {
  user: SedimentUser;
  onOpenShop: () => void;
  onOpenMenu: () => void;
  onToggleMobileNav: () => void;
}

export function TopBar({ user, onOpenShop, onOpenMenu, onToggleMobileNav }: TopBarProps) {
  return (
    <header className="flex items-center gap-2 border-b border-stone-800 bg-stone-900/80 px-2 py-2.5 sm:gap-4 sm:px-4">
      {/* Mobile-only nav toggle */}
      <button
        onClick={onToggleMobileNav}
        className="rounded-lg border border-stone-700 p-2 text-sand-300 hover:bg-stone-800 sm:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Left: identity */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-gold-500/70 bg-stone-800 sm:h-11 sm:w-11">
          {user.avatarUrl && <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 sm:min-w-[9rem]">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-sand-50">{user.redditUsername}</span>
            <span className="hidden text-xs text-sand-400 md:inline">Archaeologist Lv. {user.level}</span>
          </div>
          <ProgressBar value={(user.xp / user.xpToNextLevel) * 100} color="gold" height="sm" />
        </div>
        <div className="hidden items-center gap-1.5 rounded-lg border border-gold-600/40 bg-stone-900/70 px-3 py-1.5 text-gold-300 lg:flex">
          <Trophy size={16} />
          <span className="text-sm font-semibold text-sand-50">{user.rank.toLocaleString()}</span>
          <span className="text-xs text-sand-400">Rank</span>
        </div>
      </div>

      {/* Center: banner title */}
      <div className="mx-auto hidden sm:flex justify-center items-center">
        <img src="/sediment_logo.png" alt="SEDIMENT" className="h-14 w-auto object-contain drop-shadow-2xl hover:brightness-110 transition-all duration-300" />
      </div>

      {/* Right: resources */}
      <div className="ml-auto flex items-center gap-1.5 overflow-x-auto sm:ml-0 sm:gap-2.5">
        <StatPill
          icon={<Zap size={16} />}
          value={`${user.digEnergy}/${user.maxDigEnergy}`}
          tone="energy"
          onAdd={onOpenShop}
        />
        <StatPill icon={<Coins size={16} />} value={user.coins.toLocaleString()} tone="coins" onAdd={onOpenShop} />
        <div className="hidden sm:block">
          <StatPill icon={<Gem size={16} />} value={user.gems.toLocaleString()} tone="gems" onAdd={onOpenShop} />
        </div>
        <button
          onClick={onOpenMenu}
          className="shrink-0 rounded-lg border border-stone-700 p-2 text-sand-300 hover:bg-stone-800"
          aria-label="Settings and accessibility"
          title="Settings & Accessibility"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
