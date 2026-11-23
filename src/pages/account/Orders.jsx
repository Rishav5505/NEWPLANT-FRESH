import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Download, Star, Loader2, ChevronDown, Gift, XCircle, CreditCard, RotateCcw } from "lucide-react";
import { useCart } from "../../context/CartContext";
import AccountLayout from "./AccountLayout";
import { Button, EmptyState, Modal, Stars } from "../../components/ui";
import { api } from "../../lib/api";
import { formatINR, formatDate, hdImage } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { generateInvoicePDF } from "../../utils/invoiceUtils";

const STEPS = ["pending", "processing", "shipped", "delivered"];
const LABEL = { pending: "Order placed", processing: "Being packed", shipped: "On the way", delivered: "Delivered", cancelled: "Cancelled" };

export default function Orders() {
  return (
    <AccountLayout title="Orders">
      <OrderList />
    </AccountLayout>
  );
}

function OrderList() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    api("/api/my-orders", { auth: true }).then((d) => setOrders(d.orders || [])).catch((e) => setError(e.message));
  }, []);

  const replace = (o) => setOrders((list) => list.map((x) => (x._id === o._id ? o : x)));

  if (error) return <EmptyState icon={Package} title="Couldn't load orders" text={error} />;
  if (!orders) return <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-moss" /></div>;
  if (orders.length === 0) return <EmptyState icon={Package} title="No orders yet" text="When you place an order, you can track it here." action={<Button to="/shop">Start shopping</Button>} />;

  return (
    <>
      <div className="space-y-5">
        {orders.map((o) => <OrderCard key={o._id} order={o} onReview={() => setReviewing(o)} onUpdate={replace} />)}
      </div>
      <ReviewModal order={reviewing} onClose={() => setReviewing(null)} />
    </>
  );
}

function OrderCard({ order, onReview, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();
  const { addMany } = useCart();
  const status = (order.status || "pending").toLowerCase();
  const cancelled = status === "cancelled";
  const stepIdx = STEPS.indexOf(status);
  const canCancel = ["pending", "processing"].includes(status);
  const awaitingPayment = order.paymentMethod !== "cod" && order.paymentStatus === "pending" && !cancelled;

  const cancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      const d = await api(`/api/orders/${order._id}/cancel`, { method: "POST", auth: true });
      onUpdate(d.order);
      toast("Order cancelled");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-[28px] border border-line">
      <button onClick={() => setOpen((x) => !x)} className="flex w-full flex-wrap items-center gap-4 bg-surface p-5 text-left md:p-6" aria-expanded={open}>
        <div className="flex -space-x-3">
          {order.items?.slice(0, 3).map((it, i) => (
            <img key={i} data-fallback="/images/placeholder.svg" src={it.image ? hdImage(it.image, 120) : "/images/placeholder.svg"} alt="" className="size-12 rounded-full border-2 border-surface object-cover" />
          ))}
        </div>
        <div className="min-w-[9rem] flex-1">
          <p className="font-semibold">#{String(order._id).slice(-8).toUpperCase()}</p>
          <p className="text-sm whitespace-nowrap text-muted">{formatDate(order.createdAt)} · {order.items?.length} item{order.items?.length === 1 ? "" : "s"}</p>
        </div>
        <ChevronDown className={`size-5 shrink-0 transition sm:order-last ${open ? "rotate-180" : ""}`} />
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <span className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${cancelled ? "bg-clay/10 text-clay" : status === "delivered" ? "bg-moss/15 text-moss" : "bg-surface-2"}`}>{LABEL[status] || status}</span>
          <span className="font-display text-xl whitespace-nowrap">{formatINR(order.total)}</span>
        </div>
      </button>

      {!cancelled && (
        <div className="px-5 pt-6 md:px-6">
          <ol className="flex items-start">
            {STEPS.map((s, i) => (
              <li key={s} className="relative flex flex-1 flex-col items-center text-center">
                {i > 0 && <span className={`absolute top-2.5 right-1/2 h-0.5 w-full ${i <= stepIdx ? "bg-moss" : "bg-line"}`} />}
                <span className={`relative z-10 size-5 rounded-full border-4 ${i <= stepIdx ? "border-moss bg-moss" : "border-line bg-bg"} ${i === stepIdx ? "ring-4 ring-moss/20" : ""}`} />
                <span className={`mt-2 text-[11px] font-semibold sm:text-xs ${i <= stepIdx ? "text-ink" : "text-muted"}`}>{LABEL[s]}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {open && (
        <div className="p-5 md:p-6">
          <ul className="divide-y divide-line">
            {order.items?.map((it, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                {it.image && <img data-fallback="/images/placeholder.svg" src={hdImage(it.image, 120)} alt="" className="size-14 rounded-xl object-cover" />}
                <div className="flex-1">
                  {it.productId ? <Link to={`/product/${it.productId}`} className="text-sm font-semibold hover:text-moss">{it.name}</Link> : <p className="text-sm font-semibold">{it.name}</p>}
                  <p className="text-xs text-muted">Qty {it.quantity}</p>
                </div>
                <p className="text-sm">{formatINR(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-6 border-t border-line pt-4 text-sm md:grid-cols-2">
            <div>
              <p className="font-semibold">Delivering to</p>
              <p className="mt-1 text-muted">{order.deliveryName}<br />{order.deliveryAddress}<br />{order.deliveryLocation}<br />{order.deliveryPhone}</p>
              {order.giftMessage && <p className="mt-3 flex gap-2 text-muted"><Gift className="size-4 shrink-0 text-clay" /> “{order.giftMessage}”</p>}
              {order.preferredDate && <p className="mt-3 text-muted">Preferred delivery: <b className="text-ink">{formatDate(order.preferredDate)}{order.preferredSlot ? `, ${order.preferredSlot}` : ""}</b></p>}
            </div>
            <dl className="space-y-1">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {order.couponCode && `(${order.couponCode})`}</dt><dd className="text-moss">−{formatINR(order.discount)}</dd></div>}
              {order.walletUsed > 0 && <div className="flex justify-between"><dt className="text-muted">Wallet</dt><dd className="text-moss">−{formatINR(order.walletUsed)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{formatINR(order.tax)}</dd></div>
              {order.giftWrapFee > 0 && <div className="flex justify-between"><dt className="text-muted">Gift wrap</dt><dd>{formatINR(order.giftWrapFee)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total · {order.paymentMethod?.toUpperCase()}</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {awaitingPayment && <Button size="sm" to={`/payment/${order._id}`}><CreditCard className="size-4" /> Complete payment</Button>}
            <Button size="sm" variant="outline" onClick={() => generateInvoicePDF(order)}><Download className="size-4" /> Invoice</Button>
            <Button size="sm" variant="outline" onClick={() => addMany((order.items || []).filter((it) => it.productId).map((it) => ({ id: String(it.productId), name: it.name, price: it.price, image: it.image, quantity: it.quantity })))}><RotateCcw className="size-4" /> Buy again</Button>
            {status === "delivered" && <Button size="sm" variant="outline" onClick={onReview}><Star className="size-4" /> Review</Button>}
            {canCancel && <Button size="sm" variant="ghost" className="text-clay" onClick={cancel} disabled={cancelling}><XCircle className="size-4" /> Cancel order</Button>}
          </div>
        </div>
      )}
    </article>
  );
}

function ReviewModal({ order, onClose }) {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [productId, setProductId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (order) {
      setRating(5);
      setText("");
      setProductId(order.items?.[0]?.productId || "");
    }
  }, [order]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/api/orders/${order._id}/review`, { method: "POST", auth: true, body: { rating, text, productId } });
      toast("Thank you for your review 🌿");
      onClose();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!order} onClose={onClose} title="Write a review">
      <h2 className="font-display text-3xl">How's it growing?</h2>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {order?.items?.length > 1 && (
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="field">
            {order.items.map((it, i) => <option key={i} value={it.productId}>{it.name}</option>)}
          </select>
        )}
        <Stars value={rating} size="size-8" onChange={setRating} />
        <textarea required minLength={10} rows={4} value={text} onChange={(e) => setText(e.target.value)} className="field" placeholder="Tell other plant parents what you think…" />
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Post review</Button>
      </form>
    </Modal>
  );
}
