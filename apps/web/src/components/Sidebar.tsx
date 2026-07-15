import { Landmark, BookOpen, Columns3, ShieldHalf, CalendarDays, Store, Pickaxe, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "dig_site", label: "Dig Site", icon: Pickaxe },
  { id: "museum", label: "Museum", icon: Landmark },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "civilization", label: "Civilization", icon: Columns3 },
  { id: "roles", label: "Roles", icon: ShieldHalf },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "shop", label: "Shop", icon: Store },
] as const;

export interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ active, onSelect, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const items = (
    <>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex w-16 flex-col items-center gap-1 rounded-lg py-2.5 text-[11px] font-medium transition-colors sm:w-16 ${
              isActive
                ? "bg-gold-500/10 text-gold-300 ring-1 ring-inset ring-gold-500/50"
                : "text-sand-400 hover:bg-stone-800 hover:text-sand-200"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop: persistent icon rail */}
      <nav
        className="hidden w-20 shrink-0 flex-col items-center gap-1 border-r border-stone-800 bg-stone-900/70 py-3 sm:flex"
        aria-label="Main navigation"
      >
        {items}
      </nav>

      {/* Mobile: off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex sm:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onCloseMobile} />
          <nav
            className="relative flex w-56 flex-col gap-1 border-r border-stone-800 bg-stone-900 p-3 pt-4"
            aria-label="Main navigation"
          >
            <button
              onClick={onCloseMobile}
              className="mb-2 flex items-center gap-2 self-end rounded-md p-1.5 text-sand-400 hover:bg-stone-800"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gold-500/10 text-gold-300 ring-1 ring-inset ring-gold-500/50"
                        : "text-sand-300 hover:bg-stone-800"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                    {label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
