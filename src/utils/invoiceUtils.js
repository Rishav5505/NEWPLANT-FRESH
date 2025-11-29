// Lightweight invoice PDF generator using html2canvas + jsPDF via CDN
// Generates an invoice PDF from an order object and triggers a download.

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

async function ensureLibs() {
  // html2canvas and jspdf
  if (!window.html2canvas) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  }
}

function buildInvoiceHtml(order) {
  const itemsHtml = (order.items || []).map(it => `
    <tr>
      <td style="padding:6px 8px">${it.name} (${it.quantity}×)</td>
      <td style="padding:6px 8px; text-align:right">₹${Number(it.price || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div id="invoice-root" style="font-family:Arial,Helvetica,sans-serif; color:#111; background:white; padding:20px; width:800px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <h1 style="margin:0; color:#0b6b3b">Indore Plants</h1>
          <div style="font-size:12px; color:#444">Invoice</div>
        </div>
        <div style="text-align:right; font-size:12px; color:#444">
          <div>Order ID: ${order._id}</div>
          <div>${new Date(order.createdAt || Date.now()).toLocaleString()}</div>
        </div>
      </div>

      <div style="display:flex; gap:16px; margin-bottom:10px;">
        <div style="flex:1">
          <div style="font-size:12px; color:#666">Bill To</div>
          <div style="font-weight:600">${order.deliveryName || order.user?.name || '—'}</div>
          <div style="font-size:12px; color:#444">${order.deliveryAddress || '—'}</div>
          <div style="font-size:12px; color:#444">${order.deliveryLocation || ''}</div>
          <div style="font-size:12px; color:#444">${order.deliveryPhone || ''}</div>
          <div style="font-size:12px; color:#444">${order.deliveryEmail || ''}</div>
        </div>
        <div style="width:200px; text-align:right">
          <div style="font-size:12px; color:#666">Payment</div>
          <div style="font-weight:600">${(order.paymentMethod || '—').toUpperCase()}</div>
          <div style="font-size:12px; color:#666; margin-top:8px">Status: ${(order.paymentStatus || '—')}</div>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-top:8px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px; border-bottom:1px solid #eee">Item</th>
            <th style="text-align:right; padding:8px; border-bottom:1px solid #eee">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top:12px; width:100%; display:flex; justify-content:flex-end;">
        <div style="width:260px;">
          <div style="display:flex; justify-content:space-between; padding:6px 0"><span style="color:#666">Subtotal</span><span>₹${Number(order.subtotal || 0).toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; padding:6px 0"><span style="color:#666">Tax</span><span>₹${Number(order.tax || 0).toFixed(2)}</span></div>
          <div style="display:flex; justify-content:space-between; padding:6px 0"><span style="color:#666">Shipping</span><span>₹${Number(order.shipping || 0).toFixed(2)}</span></div>
          <div style="border-top:1px solid #eee; margin-top:6px; padding-top:8px; display:flex; justify-content:space-between; font-weight:700"> <span>Total</span><span>₹${Number(order.total || 0).toFixed(2)}</span></div>
        </div>
      </div>

      <div style="margin-top:18px; font-size:12px; color:#666">Thank you for shopping with Indore Plants.</div>
    </div>
  `;
  return html;
}

export async function generateInvoicePDF(order) {
  if (!order) throw new Error('Order required');
  await ensureLibs();

  // build invoice HTML node
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.innerHTML = buildInvoiceHtml(order);
  document.body.appendChild(wrapper);

  try {
    const canvas = await window.html2canvas(wrapper, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // convert px to mm roughly: 1px = 0.264583 mm at 96dpi. But we will scale by width ratio
    const imgProps = { width: canvas.width, height: canvas.height };
    const pdfWidth = pageWidth - 20; // margin
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
    pdf.save(`invoice_${order._id}.pdf`);
  } finally {
    // cleanup
    document.body.removeChild(wrapper);
  }
}

export default { generateInvoicePDF };
