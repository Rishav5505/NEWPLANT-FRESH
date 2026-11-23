import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, Download, Sprout } from "lucide-react";
import { Button } from "../components/ui";
import { api } from "../lib/api";
import { formatINR, hdImage } from "../lib/format";
import { generateInvoicePDF } from "../utils/invoiceUtils";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api(`/api/orders/${orderId}`, { auth: true }).then((d) => setOrder(d.order)).catch(() => {});
  }, [orderId]);

  return (
    <section className="relative overflow-hidden">
      <img src="/images/hd/texture-calathea.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-[0.07]" />
      <div className="relative container-x py-16 text-center md:py-24">
        <div className="animate-fade-up mx-auto grid size-20 place-items-center rounded-full bg-moss text-white shadow-xl"><Check className="size-9" strokeWidth={2.5} /></div>
        <p className="eyebrow mt-8">Order confirmed</p>
        <h1 className="animate-fade-up mx-auto mt-4 max-w-2xl text-5xl leading-[0.95] font-light md:text-7xl">Your plants are <em className="text-clay">getting ready.</em></h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted">We've emailed your confirmation. Our growers are hand-picking and packing your order right now.</p>

        {order && (
          <div className="mx-auto mt-12 max-w-lg rounded-[32px] border border-line bg-surface p-6 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Order</span>
              <span className="font-semibold">#{String(order._id).slice(-8).toUpperCase()}</span>
            </div>
            <ul className="mt-4 space-y-3 border-t border-line pt-4">
              {order.items?.map((it, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {it.image && <img data-fallback="/images/placeholder.svg" src={hdImage(it.image, 120)} alt="" className="size-12 rounded-xl object-cover" />}
                  <span className="flex-1">{it.name} × {it.quantity}</span>
                  <span>{formatINR(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
              <span>Total</span><span className="font-display text-2xl">{formatINR(order.total)}</span>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button to="/account/orders">Track my order</Button>
          {order && <Button variant="outline" onClick={() => generateInvoicePDF(order)}><Download className="size-4" /> Invoice</Button>}
          <Button to="/garden" variant="ghost"><Sprout className="size-4" /> Set up care reminders</Button>
        </div>
      </div>
    </section>
  );
}
