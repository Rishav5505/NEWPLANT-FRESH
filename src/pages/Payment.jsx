import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Loader2, Smartphone, CreditCard, Landmark, AlertTriangle } from "lucide-react";
import { Button, EmptyState } from "../components/ui";
import { api } from "../lib/api";
import { formatINR } from "../lib/format";

const ICON = { upi: Smartphone, card: CreditCard, netbanking: Landmark };

// Demo payment step — a real gateway (e.g. Razorpay) can be plugged in here.
export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api(`/api/orders/${orderId}`, { auth: true })
      .then((d) => {
        if (d.order.paymentStatus === "paid") navigate(`/order-success/${orderId}`, { replace: true });
        else setOrder(d.order);
      })
      .catch((e) => setError(e.message));
  }, [orderId, navigate]);

  const pay = async () => {
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      await api(`/api/orders/${orderId}/confirm-payment`, { method: "POST", auth: true });
      navigate(`/order-success/${orderId}`, { replace: true });
    } catch (e) {
      setError(e.message);
      setPaying(false);
    }
  };

  if (error) return <div className="container-x py-24"><EmptyState icon={AlertTriangle} title="Payment unavailable" text={error} action={<Button to="/account/orders">View my orders</Button>} /></div>;
  if (!order) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="size-8 animate-spin text-moss" /></div>;

  const Icon = ICON[order.paymentMethod] || CreditCard;
  return (
    <section className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-md rounded-[36px] border border-line bg-surface p-8 text-center shadow-2xl">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-forest text-on-forest"><Icon className="size-7" /></div>
        <p className="eyebrow mt-6">Pay with {order.paymentMethod}</p>
        <p className="mt-3 font-display text-5xl">{formatINR(order.total)}</p>
        <p className="mt-2 text-sm text-muted">Order #{String(order._id).slice(-8).toUpperCase()} · {order.items?.length} item{order.items?.length === 1 ? "" : "s"}</p>
        <Button size="lg" className="mt-8 w-full" onClick={pay} disabled={paying}>
          {paying ? <><Loader2 className="size-4 animate-spin" /> Processing…</> : <><Lock className="size-4" /> Pay {formatINR(order.total)}</>}
        </Button>
        <p className="mt-4 text-xs text-muted">Demo payment — no money will be charged.</p>
      </div>
    </section>
  );
}
