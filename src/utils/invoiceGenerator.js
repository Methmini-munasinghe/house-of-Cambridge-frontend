import html2pdf from 'html2pdf.js';

const MAX_FIELD_LEN = 200;
const MAX_NOTES_LEN = 500;

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .slice(0, MAX_FIELD_LEN)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function escapeNotes(value) {
  if (!value) return '';
  return String(value)
    .slice(0, MAX_NOTES_LEN)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function sanitizeOrderId(id) {
  if (!id) return '';
  return String(id).replace(/[^A-Za-z0-9\-_]/g, '').slice(0, 32);
}

function fmtDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function fmtOrderNum(order) {
  if (order.orderNumber) return escapeHtml(order.orderNumber);
  if (!order._id) return '—';
  const safeId = sanitizeOrderId(order._id);
  const year   = new Date(order.createdAt || Date.now()).getFullYear();
  return `HOC-${year}-${safeId.slice(-5).toUpperCase()}`;
}

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return isFinite(n) ? n : fallback;
}

export function downloadInvoice(order, customerName, customerEmail) {
  if (!order) return;

  const items    = Array.isArray(order.items) ? order.items : [];
  const subtotal = safeNum(order.subtotal, items.reduce((s, i) => s + safeNum(i.price) * safeNum(i.quantity), 0));
  const discount = safeNum(order.discount);
  const shipping = safeNum(order.shippingCost);
  const tax      = safeNum(order.tax);
  const total    = safeNum(order.total);
  const addr     = order.shippingAddress || {};
  const orderNum = fmtOrderNum(order);
  const invoiceDate = fmtDate(order.createdAt);
  const payMethod   = escapeHtml((order.paymentMethod || 'card').replace(/_/g, ' ').toUpperCase());
  const payStatus   = escapeHtml((order.paymentStatus || 'pending').toUpperCase());
  const orderStatus = escapeHtml((order.orderStatus || 'pending').replace(/_/g, ' ').toUpperCase());
  const shippingMethod = escapeHtml((order.shippingMethod || 'courier').replace(/_/g, ' '));

  const safeName  = escapeHtml(customerName  || addr.fullName || '—');
  const safeEmail = escapeHtml(customerEmail || '');
  const safePhone = escapeHtml(addr.phone    || '');

  const safeAddrName  = escapeHtml(addr.fullName   || customerName || '—');
  const safeAddrLine1 = escapeHtml(addr.addressLine1 || '');
  const safeAddrLine2 = escapeHtml(addr.addressLine2 || '');
  const safeAddrCity  = escapeHtml(addr.city  || '');
  const safeAddrState = escapeHtml(addr.state || '');
  const safeAddrPost  = escapeHtml(addr.postalCode || '');
  const safeAddrCountry = escapeHtml(addr.country  || 'Sri Lanka');
  const safeCoupon    = order.coupon        ? escapeHtml(order.coupon)         : '';
  const safeTracking  = order.trackingNumber ? escapeHtml(order.trackingNumber) : '';
  const safeNotes     = order.notes          ? escapeNotes(order.notes)         : '';

  const loyaltyEarned = safeNum(order.loyaltyPointsEarned);
  const loyaltyUsed   = safeNum(order.loyaltyPointsUsed);

  const itemRows = items.map((item) => {
    const itemName  = escapeHtml(item.name || '—');
    const itemQty   = safeNum(item.quantity);
    const itemPrice = safeNum(item.price);
    return `
    <tr>
      <td class="item-name">${itemName}</td>
      <td class="center">${itemQty}</td>
      <td class="right">Rs. ${itemPrice.toLocaleString()}</td>
      <td class="right total-cell">Rs. ${(itemPrice * itemQty).toLocaleString()}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
<title>Invoice ${orderNum} – House of Cambridge</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1A1A1A; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 40px 40px 60px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #1A1A1A; }
  .brand { display: flex; flex-direction: column; gap: 4px; }
  .brand-name { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
  .brand-tag { font-size: 11px; color: #60717B; text-transform: uppercase; letter-spacing: 1px; }
  .brand-accent { display: inline-block; width: 32px; height: 3px; background: #FFB700; margin-top: 6px; border-radius: 2px; }
  .invoice-meta { text-align: right; }
  .invoice-label { font-size: 28px; font-weight: 900; color: #1A1A1A; text-transform: uppercase; letter-spacing: 1px; }
  .invoice-num { font-size: 13px; color: #60717B; margin-top: 4px; }
  .invoice-date { font-size: 12px; color: #60717B; margin-top: 2px; }
  .badge { display: inline-block; background: #FFB700; color: #000; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

  .addresses { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
  .addr-block { flex: 1; }
  .addr-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #60717B; margin-bottom: 8px; }
  .addr-name { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
  .addr-line { font-size: 12px; color: #60717B; line-height: 1.6; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #1A1A1A; color: #fff; }
  thead th { padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
  thead th.center { text-align: center; }
  thead th.right { text-align: right; }
  tbody tr { border-bottom: 1px solid #F0F0F0; }
  tbody tr:nth-child(even) { background: #FAFAFA; }
  tbody td { padding: 10px 12px; font-size: 12px; vertical-align: middle; }
  td.center { text-align: center; }
  td.right { text-align: right; }
  td.total-cell { font-weight: 600; }
  td.item-name { max-width: 320px; }

  .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 28px; }
  .totals { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px solid #F0F0F0; }
  .totals-row.discount { color: #16a34a; }
  .totals-row.grand { font-size: 15px; font-weight: 900; border-bottom: none; border-top: 2px solid #1A1A1A; padding-top: 10px; margin-top: 4px; }

  .info-grid { display: flex; gap: 24px; margin-bottom: 32px; }
  .info-box { flex: 1; background: #F8F8F8; border: 1px solid #E9E9E9; border-radius: 8px; padding: 14px 16px; }
  .info-box-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #60717B; margin-bottom: 8px; }
  .info-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
  .info-row span:last-child { font-weight: 600; }

  .footer { border-top: 1px solid #E9E9E9; padding-top: 20px; text-align: center; font-size: 11px; color: #60717B; line-height: 1.8; }
  .footer strong { color: #1A1A1A; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 20px; }
    @page { margin: 1cm; size: A4; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="brand">
      <div class="brand-name">House of Cambridge</div>
      <div class="brand-tag">Premium Lifestyle</div>
      <div class="brand-accent"></div>
      <div class="addr-line" style="margin-top:10px">houseofcambridge.co.uk</div>
      <div class="addr-line">info@houseofcambridge.co.uk</div>
      <div class="addr-line">+94 11 284 7846</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-label">Invoice</div>
      <div class="invoice-num">${orderNum}</div>
      <div class="invoice-date">Date: ${invoiceDate}</div>
      <div class="badge">${payStatus}</div>
    </div>
  </div>

  <div class="addresses">
    <div class="addr-block">
      <div class="addr-label">Bill To</div>
      <div class="addr-name">${safeName}</div>
      ${safeEmail  ? `<div class="addr-line">${safeEmail}</div>`  : ''}
      ${safePhone  ? `<div class="addr-line">${safePhone}</div>`  : ''}
    </div>
    <div class="addr-block">
      <div class="addr-label">Ship To</div>
      <div class="addr-name">${safeAddrName}</div>
      <div class="addr-line">${safeAddrLine1}</div>
      ${safeAddrLine2 ? `<div class="addr-line">${safeAddrLine2}</div>` : ''}
      <div class="addr-line">${[safeAddrCity, safeAddrState].filter(Boolean).join(', ')} ${safeAddrPost}</div>
      <div class="addr-line">${safeAddrCountry}</div>
    </div>
    <div class="addr-block" style="text-align:right">
      <div class="addr-label">Order Info</div>
      <div class="addr-line">Method: <strong>${payMethod}</strong></div>
      <div class="addr-line">Shipping: <strong>${shippingMethod}</strong></div>
      ${safeCoupon   ? `<div class="addr-line">Coupon: <strong>${safeCoupon}</strong></div>`   : ''}
      ${safeTracking ? `<div class="addr-line">Tracking: <strong>${safeTracking}</strong></div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="center">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span><span>Rs. ${subtotal.toLocaleString()}</span>
      </div>
      ${discount > 0 ? `<div class="totals-row discount"><span>Discount</span><span>−Rs. ${discount.toLocaleString()}</span></div>` : ''}
      ${loyaltyUsed > 0 ? `<div class="totals-row discount"><span>Loyalty Points (${loyaltyUsed} pts)</span><span>−Rs. ${loyaltyUsed.toLocaleString()}</span></div>` : ''}
      <div class="totals-row">
        <span>Shipping</span><span>${shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}</span>
      </div>
      <div class="totals-row">
        <span>Tax (VAT 8%)</span><span>Rs. ${tax.toLocaleString()}</span>
      </div>
      <div class="totals-row grand">
        <span>Total</span><span>Rs. ${total.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-label">Payment Details</div>
      <div class="info-row"><span>Method</span><span>${payMethod}</span></div>
      <div class="info-row"><span>Status</span><span>${payStatus}</span></div>
      <div class="info-row"><span>Order Status</span><span>${orderStatus}</span></div>
    </div>
    ${loyaltyEarned > 0 ? `
    <div class="info-box">
      <div class="info-box-label">Loyalty Points</div>
      <div class="info-row"><span>Points Earned</span><span>+${loyaltyEarned} pts</span></div>
      ${loyaltyUsed > 0 ? `<div class="info-row"><span>Points Used</span><span>−${loyaltyUsed} pts</span></div>` : ''}
      <div class="info-row"><span>Rate</span><span>1 pt per Rs. 50</span></div>
    </div>` : ''}
    ${safeNotes ? `
    <div class="info-box">
      <div class="info-box-label">Order Notes</div>
      <div style="font-size:12px;color:#60717B;line-height:1.6">${safeNotes}</div>
    </div>` : ''}
  </div>

  <div class="footer">
    <strong>House of Cambridge</strong> · houseofcambridge.co.uk · info@houseofcambridge.co.uk<br/>
    Thank you for shopping with us. This is a computer-generated invoice and does not require a signature.<br/>
    For queries regarding this invoice, please quote order number <strong>${orderNum}</strong>.
  </div>

</div>
</body>
</html>`;

  const container = document.createElement('div');
  container.style.cssText = [
    'position:absolute',
    'left:-9999px',
    'top:0',
    'width:794px',
    'background:#fff',
  ].join(';');
  container.innerHTML = html;
  document.body.appendChild(container);

  const pageEl = container.querySelector('.page');

  html2pdf()
    .set({
      margin:      [8, 8, 8, 8],
      filename:    `Invoice-${orderNum}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale:           2,
        useCORS:         true,
        logging:         false,
        backgroundColor: '#ffffff',
        windowWidth:     794,
      },
      jsPDF:     { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    })
    .from(pageEl)
    .save()
    .then(() => document.body.removeChild(container))
    .catch((err) => {
      console.error('Invoice PDF error:', err);
      if (document.body.contains(container)) document.body.removeChild(container);
    });
}