import { Coins, Gem, ShoppingBag } from "lucide-react";
import { Panel, Button } from "@sediment/ui";
import { demoShopItems } from "@/lib/mockData";
import { useSedimentStore } from "@/lib/store";
import { sfx } from "@/lib/sound";

export function ShopPage() {
  const user = useSedimentStore((s) => s.user);
  const setUser = useSedimentStore((s) => s.setUser);
  const pushToast = useSedimentStore((s) => s.pushToast);

  function purchase(item: (typeof demoShopItems)[number]) {
    if (!user) return;
    const balance = item.currency === "coins" ? user.coins : user.gems;
    if (balance < item.price) {
      pushToast({
        kind: "info",
        title: "Not enough " + item.currency,
        body: `${item.name} costs ${item.price.toLocaleString()} ${item.currency}.`,
      });
      return;
    }
    sfx.click();
    setUser({
      ...user,
      coins: item.currency === "coins" ? user.coins - item.price : user.coins,
      gems: item.currency === "gems" ? user.gems - item.price : user.gems,
    });
    pushToast({ kind: "info", title: "Purchased", body: item.name });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Panel eyebrow="Shop" title="Cosmetics & Boosts">
        <p className="text-sm text-sand-400">
          Every item here is cosmetic or a convenience boost — nothing here affects fairness of community excavation or
          restoration outcomes.
        </p>
      </Panel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {demoShopItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col rounded-xl border border-stone-700/60 bg-stone-900/70 p-4 shadow-panel"
          >
            <div className="mb-2 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-stone-800 to-stone-900 text-sand-600">
              <ShoppingBag size={28} />
            </div>
            <p className="text-sm font-bold text-sand-50">{item.name}</p>
            <p className="mb-3 flex-1 text-xs text-sand-400">{item.description}</p>
            <Button variant="gold" size="sm" onClick={() => purchase(item)}>
              <span className="flex items-center justify-center gap-1.5">
                {item.currency === "coins" ? <Coins size={14} /> : <Gem size={14} />}
                {item.price.toLocaleString()}
              </span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
