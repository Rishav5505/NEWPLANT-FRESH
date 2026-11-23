import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Loader2, Send } from "lucide-react";
import { Button } from "../components/ui";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const TOPICS = ["Plant care help", "Order & delivery", "Bulk / corporate gifting", "Something else"];

export default function Contact() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "", topic: TOPICS[0], message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/contact", { method: "POST", body: { name: form.name, email: form.email, phone: form.phone, message: `[${form.topic}] ${form.message}` } });
      setSent(true);
      toast("Message sent — we'll reply within a day 🌿");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container-x grid gap-14 py-12 md:py-20 lg:grid-cols-[1fr_1.2fr]">
      <div className="animate-fade-up">
        <p className="eyebrow mb-5">Contact</p>
        <h1 className="text-5xl leading-[0.95] font-light md:text-7xl">Let's talk <em className="text-clay">plants.</em></h1>
        <p className="mt-6 max-w-md text-lg text-muted">A droopy leaf, a delivery question or a big gifting order — our plant team reads every message.</p>
        <ul className="mt-12 space-y-6">
          <Info icon={MapPin} t="Studio" d="Gurugram, Haryana" />
          <Info icon={Phone} t="Phone" d={<a href="tel:+919508287609" className="hover:text-clay">+91 95082 87609</a>} />
          <Info icon={Mail} t="Email" d={<a href="mailto:rishavkumar33372@gmail.com" className="hover:text-clay">rishavkumar33372@gmail.com</a>} />
          <Info icon={Clock} t="Hours" d="Mon–Fri 9 am – 6 pm · Sat 10 am – 4 pm" />
        </ul>
      </div>

      <div className="rounded-[36px] bg-surface p-6 sm:p-10">
        {sent ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-moss text-white"><Send className="size-7" /></div>
            <h2 className="mt-6 text-4xl">Message received</h2>
            <p className="mt-3 max-w-sm text-muted">Thank you, {form.name.split(" ")[0]}. We'll get back to you at {form.email || "your email"} within one working day.</p>
            <Button variant="outline" className="mt-8" onClick={() => { setSent(false); setForm((f) => ({ ...f, message: "" })); }}>Send another</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium">What can we help with?</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, topic: t }))} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${form.topic === t ? "bg-forest text-on-forest" : "border border-line hover:border-ink"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-sm font-medium">Name</span><input required value={form.name} onChange={set("name")} className="field" autoComplete="name" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium">Phone (optional)</span><input value={form.phone} onChange={set("phone")} className="field" inputMode="tel" autoComplete="tel" /></label>
            </div>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">Email</span><input required type="email" value={form.email} onChange={set("email")} className="field" autoComplete="email" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">Message</span><textarea required minLength={10} rows={6} value={form.message} onChange={set("message")} className="field" placeholder="Tell us what's going on…" /></label>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send message</Button>
          </form>
        )}
      </div>
    </section>
  );
}

function Info({ icon: Icon, t, d }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-moss"><Icon className="size-5" /></span>
      <div><p className="text-xs font-bold tracking-widest text-muted uppercase">{t}</p><p className="mt-1 text-lg">{d}</p></div>
    </li>
  );
}
