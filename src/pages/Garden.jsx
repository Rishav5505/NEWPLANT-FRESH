import { useEffect, useMemo, useState } from "react";
import { Droplets, Plus, Trash2, Sprout, Loader2, Bell, Flame, Pencil, Mail } from "lucide-react";
import { Button, Modal, EmptyState, Reveal } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { hdImage } from "../lib/format";
import { PLANT_PROFILES } from "../lib/plantProfiles";

const DAY = 86400000;
const ROOMS = ["Living room", "Bedroom", "Balcony", "Kitchen", "Office", "Bathroom"];

const status = (p) => {
  const last = p.lastWatered ? new Date(p.lastWatered).getTime() : new Date(p.createdAt).getTime();
  const next = last + p.waterEveryDays * DAY;
  const days = Math.ceil((next - Date.now()) / DAY);
  const pct = Math.min(1, Math.max(0, (Date.now() - last) / (p.waterEveryDays * DAY)));
  return { days, pct };
};

const dueLabel = (d) => (d < 0 ? `${-d} day${d === -1 ? "" : "s"} overdue` : d === 0 ? "Water today" : d === 1 ? "Tomorrow" : `In ${d} days`);

export default function Garden() {
  const { user, openAuth } = useAuth();
  const toast = useToast();
  const [plants, setPlants] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | {} new | plant
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!user) return;
    api("/api/garden", { auth: true })
      .then((d) => setPlants(d.plants || []))
      .catch((e) => setError(e.message));
  }, [user]);

  const sorted = useMemo(() => (plants || []).map((p) => ({ ...p, ...status(p) })).sort((a, b) => a.days - b.days), [plants]);
  const thirsty = sorted.filter((p) => p.days <= 0).length;
  const streak = useMemo(() => {
    const days = new Set((plants || []).flatMap((p) => (p.history || []).map((h) => new Date(h).toDateString())));
    let n = 0;
    for (let d = new Date(); days.has(d.toDateString()); d = new Date(d.getTime() - DAY)) n++;
    return n;
  }, [plants]);

  if (!user) {
    return (
      <section className="container-x grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <p className="eyebrow mb-4">My Garden</p>
          <h1 className="text-5xl leading-[0.95] font-light md:text-7xl">Never forget to <em className="text-clay">water again.</em></h1>
          <p className="mt-6 max-w-md text-lg text-muted">Your personal plant journal — watering schedules, reminders and streaks for every plant you own. Free with your JeevaLeaf account.</p>
          <div className="mt-8 flex gap-3">
            <Button size="lg" onClick={() => openAuth("signup")}>Create free account</Button>
            <Button size="lg" variant="outline" onClick={() => openAuth("login")}>Sign in</Button>
          </div>
        </div>
        <img src="/images/hd/shelf.jpg" alt="A shelf of potted plants" className="h-[480px] w-full object-cover arch shadow-2xl" />
      </section>
    );
  }

  const water = async (p) => {
    setBusyId(p._id);
    try {
      const d = await api(`/api/garden/${p._id}/water`, { method: "POST", auth: true });
      setPlants((list) => list.map((x) => (x._id === p._id ? d.plant : x)));
      toast(`${p.nickname || p.name} has been watered 💧`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Remove ${p.nickname || p.name} from your garden?`)) return;
    try {
      await api(`/api/garden/${p._id}`, { method: "DELETE", auth: true });
      setPlants((list) => list.filter((x) => x._id !== p._id));
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const save = async (form) => {
    const isNew = !form._id;
    const d = await api(isNew ? "/api/garden" : `/api/garden/${form._id}`, { method: isNew ? "POST" : "PUT", auth: true, body: form });
    setPlants((list) => (isNew ? [d.plant, ...list] : list.map((x) => (x._id === d.plant._id ? d.plant : x))));
    setEditing(null);
    toast(isNew ? "Planted in your garden 🌱" : "Saved");
  };

  return (
    <>
      <section className="container-x pt-12 pb-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="animate-fade-up">
            <p className="eyebrow mb-3">My Garden</p>
            <h1 className="text-5xl leading-[0.95] font-light md:text-6xl">Good {greeting()}, <em className="text-moss">{user.name?.split(" ")[0]}.</em></h1>
          </div>
          <Button onClick={() => setEditing({})}><Plus className="size-4" /> Add a plant</Button>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 md:max-w-2xl">
          <StatCard icon={Sprout} n={sorted.length} l="Plants" />
          <StatCard icon={Bell} n={thirsty} l="Thirsty now" hot={thirsty > 0} />
          <StatCard icon={Flame} n={streak} l="Day streak" />
        </div>
        <ReminderToggle />
      </section>

      <section className="container-x pb-12">
        {error ? (
          <EmptyState icon={Sprout} title="Couldn't load your garden" text={error} />
        ) : !plants ? (
          <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-moss" /></div>
        ) : sorted.length === 0 ? (
          <EmptyState icon={Sprout} title="Your garden is waiting" text="Add the plants you own — or they'll appear here automatically after your orders are delivered." action={<Button onClick={() => setEditing({})}><Plus className="size-4" /> Add your first plant</Button>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((p, i) => (
              <Reveal key={p._id} delay={(i % 3) * 60} className="flex gap-4 rounded-[28px] border border-line bg-surface p-4">
                <div className="relative shrink-0">
                  <Ring pct={p.pct} hot={p.days <= 0} />
                  <img data-fallback="/images/placeholder.svg" src={p.image ? hdImage(p.image, 200) : "/images/hd/pothos.jpg"} alt="" className="absolute inset-[7px] size-[82px] rounded-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl">{p.nickname || p.name}</p>
                      <p className="truncate text-xs text-muted">{p.nickname ? p.name : ""}{p.room ? `${p.nickname ? " · " : ""}${p.room}` : ""}</p>
                    </div>
                    <div className="flex shrink-0">
                      <button onClick={() => setEditing(p)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-ink/5" aria-label="Edit"><Pencil className="size-3.5" /></button>
                      <button onClick={() => remove(p)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-clay" aria-label="Remove"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                  <p className={`mt-2 text-sm font-semibold ${p.days <= 0 ? "text-clay" : "text-moss"}`}>{dueLabel(p.days)}</p>
                  <p className="text-xs text-muted">Every {p.waterEveryDays} days</p>
                  <button onClick={() => water(p)} disabled={busyId === p._id} className={`mt-3 inline-flex h-9 items-center justify-center gap-2 self-start rounded-full px-4 text-sm font-semibold transition ${p.days <= 0 ? "bg-clay text-white" : "bg-surface-2 hover:bg-sage/40"}`}>
                    {busyId === p._id ? <Loader2 className="size-4 animate-spin" /> : <Droplets className="size-4" />} Watered
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <PlantForm open={!!editing} initial={editing} onClose={() => setEditing(null)} onSave={save} />
    </>
  );
}

function ReminderToggle() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const on = user?.reminderEmails !== false;
  const flip = async () => {
    setBusy(true);
    try {
      const d = await api("/api/me", { method: "PUT", auth: true, body: { reminderEmails: !on } });
      setUser(d.user);
      toast(!on ? "Morning reminders on — we'll email you when plants are thirsty" : "Email reminders turned off", "info");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <label className="mt-4 flex max-w-2xl cursor-pointer items-center gap-4 rounded-3xl border border-line p-4">
      <Mail className="size-5 shrink-0 text-moss" />
      <span className="flex-1 text-sm">
        <b className="block">Morning email reminders</b>
        <span className="text-muted">A short email around 8 am when any plant is due for water.</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={busy}
        onClick={flip}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-moss" : "bg-line"}`}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
        <span className="sr-only">Toggle email reminders</span>
      </button>
    </label>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function StatCard({ icon: Icon, n, l, hot }) {
  return (
    <div className={`rounded-3xl p-5 ${hot ? "bg-clay text-white" : "bg-surface"}`}>
      <Icon className={`size-5 ${hot ? "" : "text-moss"}`} />
      <p className="mt-3 font-display text-4xl">{n}</p>
      <p className={`text-xs ${hot ? "text-white/80" : "text-muted"}`}>{l}</p>
    </div>
  );
}

function Ring({ pct, hot }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 96 96" className="size-24 -rotate-90" aria-hidden="true">
      <circle cx="48" cy="48" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={hot ? "var(--clay)" : "var(--moss)"} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-all duration-700" />
    </svg>
  );
}

function PlantForm({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ name: "", nickname: "", room: "", waterEveryDays: 7, image: "", ...(initial || {}) });
      setErr("");
    }
  }, [open, initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await onSave({ ...form, waterEveryDays: Number(form.waterEveryDays) });
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Plant details">
      <h2 className="pr-8 font-display text-3xl">{form._id ? "Edit plant" : "Add a plant"}</h2>
      {!form._id && (
        <>
          <p className="mt-4 mb-2 text-xs font-bold tracking-widest text-muted uppercase">Quick pick</p>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {PLANT_PROFILES.slice(0, 8).map((p) => (
              <button key={p.id} type="button" onClick={() => setForm((f) => ({ ...f, name: p.name, image: p.image, waterEveryDays: [0, 14, 7, 3][p.water] }))} className={`shrink-0 rounded-2xl border p-1.5 ${form.name === p.name ? "border-clay" : "border-line"}`}>
                <img src={p.image} alt={p.name} title={p.name} className="size-14 rounded-xl object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block"><span className="mb-1.5 block text-sm font-medium">Plant</span><input required value={form.name || ""} onChange={set("name")} className="field" placeholder="e.g. Money Plant" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Nickname</span><input value={form.nickname || ""} onChange={set("nickname")} className="field" placeholder="Optional" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Room</span>
            <select value={form.room || ""} onChange={set("room")} className="field"><option value="">—</option>{ROOMS.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 flex justify-between text-sm font-medium">Water every <b>{form.waterEveryDays} days</b></span>
          <input type="range" min="1" max="30" value={form.waterEveryDays || 7} onChange={set("waterEveryDays")} className="w-full accent-[var(--moss)]" />
        </label>
        {err && <p className="text-sm text-clay">{err}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} {form._id ? "Save changes" : "Add to garden"}</Button>
      </form>
    </Modal>
  );
}
