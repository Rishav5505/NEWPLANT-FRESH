import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy, Loader2 } from "lucide-react";
import { Modal, Button } from "./ui";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const KEY = "jl_welcome_seen";
const seen = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
};
const markSeen = () => {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* storage unavailable */
  }
};

// One-time newsletter offer: shows after 25s of browsing or on exit intent (desktop).
export default function WelcomePopup() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const blocked = !!user || /^\/(checkout|payment|admin|order-success)/.test(pathname);

  useEffect(() => {
    if (blocked || seen()) return;
    const show = () => {
      if (seen()) return;
      markSeen();
      setOpen(true);
    };
    const t = setTimeout(show, 25000);
    const onLeave = (e) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [blocked]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/newsletter", { method: "POST", body: { email } });
      setDone(true);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("WELCOME10");
      toast("Code copied — use it at checkout", "info");
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Welcome offer" wide>
      <div className="-m-6 grid overflow-hidden sm:-m-8 md:grid-cols-2">
        <img src="/images/hd/monstera-hands.jpg" alt="" className="hidden h-full min-h-80 w-full object-cover md:block" />
        <div className="p-6 sm:p-10">
          <p className="eyebrow">Welcome to JeevaLeaf</p>
          <h2 className="mt-3 font-display text-4xl leading-tight">Take <em className="text-clay">10% off</em> your first plant</h2>
          {done ? (
            <>
              <p className="mt-4 text-sm text-muted">You're on the list! Here's your code — valid on your first order.</p>
              <button onClick={copy} className="mt-6 flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-clay px-5 py-4 font-display text-2xl tracking-widest text-clay">
                WELCOME10 <Copy className="size-5" />
              </button>
              <Button className="mt-4 w-full" onClick={() => setOpen(false)}>Start shopping</Button>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm text-muted">Join our letters for seasonal care notes and get a welcome code instantly.</p>
              <form onSubmit={submit} className="mt-6 space-y-3">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" className="field" />
                <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Get my 10% code</Button>
              </form>
              <button onClick={() => setOpen(false)} className="mt-4 w-full text-center text-xs text-muted hover:text-ink">No thanks</button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
