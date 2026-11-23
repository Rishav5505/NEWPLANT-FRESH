import { useEffect, useState } from "react";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Leaf, Loader2 } from "lucide-react";
import AccountLayout from "./AccountLayout";
import { EmptyState } from "../../components/ui";
import { api } from "../../lib/api";
import { formatINR, formatDate } from "../../lib/format";

export default function Wallet() {
  return (
    <AccountLayout title="Wallet">
      <Content />
    </AccountLayout>
  );
}

function Content() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/wallet", { auth: true }).then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <EmptyState icon={WalletIcon} title="Wallet unavailable" text={error} />;
  if (!data) return <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-moss" /></div>;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[32px] bg-[#16301f] p-8 text-[#f4f1e8] md:p-10">
        <img src="/images/hd/texture-calathea.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-20" />
        <div className="relative">
          <p className="text-xs font-bold tracking-[0.2em] text-[#e07a52] uppercase">JeevaLeaf credits</p>
          <p className="mt-4 font-display text-6xl">{formatINR(data.balance)}</p>
          <p className="mt-3 max-w-md text-sm text-[#f4f1e8]/75">As a {data.tier || "Seedling"} you earn {data.cashbackPercent || 5}% back as credits on every delivered order. Use them at checkout on your next plant.</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-line p-6 md:p-8">
        <h2 className="text-2xl">Activity</h2>
        {data.transactions?.length ? (
          <ul className="mt-6 divide-y divide-line">
            {data.transactions.map((t, i) => {
              const credit = t.amount > 0;
              return (
                <li key={i} className="flex items-center gap-4 py-4">
                  <span className={`grid size-10 place-items-center rounded-full ${credit ? "bg-moss/15 text-moss" : "bg-clay/10 text-clay"}`}>
                    {credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.note}</p>
                    <p className="text-xs text-muted">{formatDate(t.createdAt)}</p>
                  </div>
                  <p className={`font-semibold ${credit ? "text-moss" : ""}`}>{credit ? "+" : "−"}{formatINR(Math.abs(t.amount))}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-surface p-5 text-sm text-muted">
            <Leaf className="size-5 shrink-0 text-moss" /> No activity yet. Your first cashback arrives when an order is delivered.
          </div>
        )}
      </div>
    </div>
  );
}
