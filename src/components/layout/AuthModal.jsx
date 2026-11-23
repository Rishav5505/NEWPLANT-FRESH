import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Modal, Button } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";

export default function AuthModal() {
  const { authModal, openAuth, saveSession } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "" });
  const [step, setStep] = useState("form"); // form | otp
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    setStep("form");
    setError("");
    setForm((f) => ({ ...f, password: "", otp: "" }));
  }, [authModal]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const close = () => openAuth(null);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const email = form.email.trim().toLowerCase();

  const submit = (e) => {
    e.preventDefault();
    if (authModal === "login") {
      run(async () => {
        const d = await api("/api/login", { method: "POST", body: { email, password: form.password } });
        saveSession(d.token, d.user);
        toast(`Welcome back, ${d.user.name?.split(" ")[0] || "friend"} 🌿`);
        close();
      });
    } else if (authModal === "signup") {
      if (step === "form") {
        if (form.password.length < 6) return setError("Password must be at least 6 characters");
        run(async () => {
          const d = await api("/api/request-otp", { method: "POST", body: { email } });
          setStep("otp");
          if (d.debugOtp) setForm((f) => ({ ...f, otp: d.debugOtp }));
          toast(d.message || "We've emailed you a 6-digit code", "info");
        });
      } else {
        run(async () => {
          const d = await api("/api/verify-otp-signup", { method: "POST", body: { email, otp: form.otp.trim(), name: form.name.trim(), password: form.password } });
          saveSession(d.token, d.user);
          toast("Your account is ready. Welcome to JeevaLeaf 🌱");
          close();
        });
      }
    } else if (authModal === "forgot") {
      if (step === "form") {
        run(async () => {
          const d = await api("/api/request-password-reset", { method: "POST", body: { email } });
          setStep("otp");
          if (d.debugOtp) setForm((f) => ({ ...f, otp: d.debugOtp }));
          toast(d.message || "Reset code sent to your email", "info");
        });
      } else {
        if (form.password.length < 6) return setError("Password must be at least 6 characters");
        run(async () => {
          await api("/api/verify-otp", { method: "POST", body: { email, otp: form.otp.trim(), newPassword: form.password } });
          toast("Password updated — please sign in");
          openAuth("login");
        });
      }
    }
  };

  const titles = {
    login: ["Welcome back", "Sign in to track orders, sync your wishlist and get care reminders."],
    signup: ["Join JeevaLeaf", "Create an account for faster checkout and your own digital garden."],
    forgot: ["Reset password", "We'll email you a one-time code to set a new password."],
  };
  const [title, sub] = titles[authModal] || titles.login;

  const pwField = (label, autoComplete) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className="relative">
        <input type={showPw ? "text" : "password"} required minLength={6} value={form.password} onChange={set("password")} className="field pr-12" autoComplete={autoComplete} />
        <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted" aria-label={showPw ? "Hide password" : "Show password"}>
          {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </label>
  );

  return (
    <Modal open={!!authModal} onClose={close} title={title}>
      <div className="mb-6 pr-8">
        <h2 className="font-display text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-muted">{step === "otp" ? `Enter the 6-digit code we sent to ${email}.` : sub}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {step === "form" && (
          <>
            {authModal === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Full name</span>
                <input required value={form.name} onChange={set("name")} className="field" autoComplete="name" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Email</span>
              <input type="email" required value={form.email} onChange={set("email")} className="field" autoComplete="email" />
            </label>
            {authModal !== "forgot" && pwField("Password", authModal === "login" ? "current-password" : "new-password")}
          </>
        )}

        {step === "otp" && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Verification code</span>
              <input inputMode="numeric" required maxLength={6} value={form.otp} onChange={set("otp")} className="field text-center font-display text-2xl tracking-[0.5em]" autoComplete="one-time-code" />
            </label>
            {authModal === "forgot" && pwField("New password", "new-password")}
          </>
        )}

        {error && <p className="rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {authModal === "login" ? "Sign in" : step === "otp" ? (authModal === "signup" ? "Verify & create account" : "Set new password") : authModal === "signup" ? "Send verification code" : "Send reset code"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted">
        {authModal === "login" && (
          <>
            <button onClick={() => openAuth("forgot")} className="font-medium text-ink underline-offset-4 hover:underline">Forgot password?</button>
            <p>New here? <button onClick={() => openAuth("signup")} className="font-semibold text-clay">Create an account</button></p>
          </>
        )}
        {authModal !== "login" && (
          <p>Already have an account? <button onClick={() => openAuth("login")} className="font-semibold text-clay">Sign in</button></p>
        )}
      </div>
    </Modal>
  );
}
