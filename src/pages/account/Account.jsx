import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Plus, Trash2, MapPin, Star } from "lucide-react";
import AccountLayout from "./AccountLayout";
import { Button, Modal } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";

export default function Account() {
  return (
    <AccountLayout title="Profile">
      <Content />
    </AccountLayout>
  );
}

function Content() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [busy, setBusy] = useState("");
  const [addrOpen, setAddrOpen] = useState(false);

  useEffect(() => {
    setForm({ name: user?.name || "", phone: user?.phone || "" });
  }, [user]);

  const update = async (body, key, msg) => {
    setBusy(key);
    try {
      const d = await api("/api/me", { method: "PUT", auth: true, body });
      setUser(d.user);
      toast(msg);
      return true;
    } catch (e) {
      toast(e.message, "error");
      return false;
    } finally {
      setBusy("");
    }
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast("Please choose an image under 2 MB", "error");
    // Downscale before upload to keep the profile document small.
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(1, 320 / Math.max(img.width, img.height));
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      update({ profilePhoto: c.toDataURL("image/jpeg", 0.85) }, "photo", "Profile photo updated");
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const addresses = user?.addresses || [];
  const saveAddresses = (list, msg) => update({ addresses: list }, "addr", msg);

  return (
    <div className="space-y-8">
      {/* Identity */}
      <div className="flex flex-col gap-6 rounded-[32px] bg-surface p-6 sm:flex-row sm:items-center md:p-8">
        <div className="relative">
          <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-sage font-display text-4xl text-forest">
            {user.profilePhoto ? <img src={user.profilePhoto} alt="" className="size-full object-cover" /> : user.name?.[0]?.toUpperCase()}
          </div>
          <button onClick={() => fileRef.current?.click()} className="absolute right-0 bottom-0 grid size-9 place-items-center rounded-full bg-forest text-on-forest shadow-lg" aria-label="Change photo">
            {busy === "photo" ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        </div>
        <div className="flex-1">
          <p className="font-display text-3xl">{user.name}</p>
          <p className="text-muted">{user.email}</p>
          {user.profilePhoto && <button onClick={() => update({ profilePhoto: null }, "photo", "Photo removed")} className="mt-2 text-sm text-clay">Remove photo</button>}
        </div>
      </div>

      <LoyaltyCard />
      <ReferralCard />

      {/* Details */}
      <Card title="Personal details">
        <form onSubmit={(e) => { e.preventDefault(); update(form, "details", "Profile saved"); }} className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Full name</span><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Mobile</span><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="field" inputMode="tel" /></label>
          <div className="sm:col-span-2"><Button type="submit" disabled={busy === "details"}>{busy === "details" && <Loader2 className="size-4 animate-spin" />} Save changes</Button></div>
        </form>
      </Card>

      {/* Addresses */}
      <Card title="Saved addresses" action={<Button size="sm" variant="outline" onClick={() => setAddrOpen(true)}><Plus className="size-4" /> Add</Button>}>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted">No saved addresses yet. Add one for one-tap checkout.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((a, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${a.isDefault ? "border-forest" : "border-line"}`}>
                <div className="flex items-start justify-between">
                  <p className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-moss" /> {a.label || "Address"}</p>
                  {a.isDefault && <span className="rounded-full bg-forest px-2 py-0.5 text-xs font-bold text-on-forest">Default</span>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{a.fullName} · {a.phone}<br />{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}<br />{a.city}, {a.state} {a.pincode}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  {!a.isDefault && <button onClick={() => saveAddresses(addresses.map((x, j) => ({ ...x, isDefault: j === i })), "Default address updated")} className="inline-flex items-center gap-1 font-semibold text-moss"><Star className="size-3.5" /> Make default</button>}
                  <button onClick={() => saveAddresses(addresses.filter((_, j) => j !== i), "Address removed")} className="inline-flex items-center gap-1 font-semibold text-clay"><Trash2 className="size-3.5" /> Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Password */}
      <Card title="Change password">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (pw.next.length < 6) return toast("Password must be at least 6 characters", "error");
            if (pw.next !== pw.confirm) return toast("Passwords don't match", "error");
            if (await update({ password: pw.next }, "pw", "Password updated")) setPw({ next: "", confirm: "" });
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="block"><span className="mb-1.5 block text-sm font-medium">New password</span><input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className="field" autoComplete="new-password" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Confirm password</span><input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className="field" autoComplete="new-password" /></label>
          <div className="sm:col-span-2"><Button type="submit" variant="outline" disabled={busy === "pw"}>Update password</Button></div>
        </form>
      </Card>

      <AddressModal
        key={addrOpen ? "open" : "closed"}
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        onSave={async (a) => {
          const list = [...addresses.map((x) => (a.isDefault ? { ...x, isDefault: false } : x)), { ...a, isDefault: a.isDefault || addresses.length === 0 }];
          if (await saveAddresses(list, "Address saved")) setAddrOpen(false);
        }}
      />
    </div>
  );
}

function LoyaltyCard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api("/api/loyalty", { auth: true }).then(setD).catch(() => {});
  }, []);
  if (!d) return null;
  const idx = d.tiers.findIndex((t) => t.name === d.tier);
  const pct = d.next ? Math.min(100, ((d.spent - d.tiers[idx].min) / (d.next.min - d.tiers[idx].min)) * 100) : 100;
  return (
    <div className="rounded-[32px] border border-line p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Leaf Club</p>
          <h2 className="mt-2 font-display text-3xl">You're a <em className="text-moss">{d.tier}</em></h2>
          <p className="mt-1 text-sm text-muted">{d.rate}% cashback on every delivered order</p>
        </div>
        <div className="flex gap-2">
          {d.tiers.map((t, i) => (
            <div key={t.name} className={`rounded-2xl px-3 py-2 text-center text-xs ${i <= idx ? "bg-forest text-on-forest" : "bg-surface-2 text-muted"}`}>
              <p className="font-bold">{t.name}</p>
              <p>{t.rate}%</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-moss transition-all duration-700" style={{ width: `${pct}%` }} /></div>
      <p className="mt-3 text-sm text-muted">
        {d.next ? <>Spend <b className="text-ink">{formatINRShort(d.next.remaining)}</b> more on delivered orders to reach <b className="text-ink">{d.next.name}</b> ({d.next.rate}% cashback).</> : "You've reached our highest tier — thank you for growing with us 🌿"}
      </p>
    </div>
  );
}

function ReferralCard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  useEffect(() => {
    api("/api/referral", { auth: true }).then(setData).catch(() => {});
  }, []);
  if (!data) return null;

  const message = `I get my plants from JeevaLeaf 🌿 Use my code ${data.code} for ₹${data.reward} off your first order (above ₹${data.minOrder}): ${window.location.origin}/shop`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.code);
      toast("Referral code copied", "info");
    } catch {
      toast(data.code, "info");
    }
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "JeevaLeaf", text: message });
      else window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    } catch {
      /* share cancelled */
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#16301f] p-6 text-[#f4f1e8] md:p-8">
      <img src="/images/hd/texture-fern.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-15" />
      <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#e07a52] uppercase">Refer a friend</p>
          <h2 className="mt-3 font-display text-3xl leading-tight">Give ₹{data.reward}, get ₹{data.reward}.</h2>
          <p className="mt-2 text-sm text-[#f4f1e8]/75">Friends get ₹{data.reward} off their first order. You get ₹{data.reward} in your wallet when it's delivered.</p>
          <p className="mt-4 text-sm text-[#f4f1e8]/75">{data.friends} friend{data.friends === 1 ? "" : "s"} joined · {formatINRShort(data.earned)} earned</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
          <p className="text-xs text-[#f4f1e8]/70">Your code</p>
          <p className="mt-1 font-display text-3xl tracking-wider">{data.code}</p>
          <div className="mt-4 flex gap-2">
            <button onClick={copy} className="flex-1 rounded-full border border-white/30 py-2 text-sm font-semibold hover:bg-white/10">Copy</button>
            <button onClick={share} className="flex-1 rounded-full bg-[#f4f1e8] py-2 text-sm font-semibold text-[#16301f] hover:bg-white">Share</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatINRShort = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function Card({ title, action, children }) {
  return (
    <div className="rounded-[32px] border border-line p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddressModal({ open, onClose, onSave }) {
  const empty = { label: "Home", fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", isDefault: false };
  const [a, setA] = useState(empty);
  const set = (k) => (e) => setA((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const F = (k, label, props = {}) => (
    <label className={`block ${props.full ? "sm:col-span-2" : ""}`}><span className="mb-1.5 block text-sm font-medium">{label}</span><input required={!props.optional} value={a[k]} onChange={set(k)} className="field" {...(props.input || {})} /></label>
  );
  return (
    <Modal open={open} onClose={onClose} title="Add address" wide>
      <h2 className="font-display text-3xl">New address</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSave(a); }} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-2 sm:col-span-2">
          {["Home", "Work", "Other"].map((l) => (
            <button type="button" key={l} onClick={() => setA((x) => ({ ...x, label: l }))} className={`rounded-full px-4 py-2 text-sm font-semibold ${a.label === l ? "bg-forest text-on-forest" : "border border-line"}`}>{l}</button>
          ))}
        </div>
        {F("fullName", "Full name")}
        {F("phone", "Mobile", { input: { inputMode: "tel" } })}
        {F("addressLine1", "House, street", { full: true })}
        {F("addressLine2", "Area / landmark", { full: true, optional: true })}
        {F("city", "City")}
        {F("state", "State")}
        {F("pincode", "Pincode", { input: { inputMode: "numeric", maxLength: 6, pattern: "\\d{6}" } })}
        <label className="flex items-center gap-3 self-end pb-3 text-sm"><input type="checkbox" checked={a.isDefault} onChange={set("isDefault")} className="size-5 accent-[var(--moss)]" /> Make default</label>
        <Button type="submit" className="sm:col-span-2">Save address</Button>
      </form>
    </Modal>
  );
}
