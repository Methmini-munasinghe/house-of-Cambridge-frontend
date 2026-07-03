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
  if (value === null || value === undefined) return '';
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
  if (order.invoiceNo) return escapeHtml(order.invoiceNo);
  if (order.orderNumber) {
    const safeNum = String(order.orderNumber).replace(/[^0-9]/g, '');
    return `O${safeNum}`;
  }
  if (!order._id) return '—';
  const safeId = sanitizeOrderId(order._id);
  return `O${safeId.slice(-4).toUpperCase()}`;
}

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return isFinite(n) ? n : fallback;
}

export function downloadInvoice(order, customerName, customerEmail) {
  if (!order) return;

  const items      = Array.isArray(order.items) ? order.items : [];
  const subtotal = safeNum(order.subtotal, items.reduce((s, i) => s + safeNum(i.price || i.unitPrice) * safeNum(i.quantity), 0));
  const discount = safeNum(order.discount);
  const shipping = safeNum(order.shippingCost || 0);
  const taxPercent = safeNum(order.taxPercent || 8); 
  const tax        = safeNum(order.tax || order.taxAmount || (subtotal - discount) * (taxPercent / 100));
  const total      = safeNum(order.total || order.totalAmountDue || (subtotal - discount + shipping + tax));
  const addr       = order.shippingAddress || order.clientDetails || {};
  const orderNum = fmtOrderNum(order);
  const invoiceDate = fmtDate(order.createdAt || order.invoiceDate);
  const dueDate     = order.dueDate ? fmtDate(order.dueDate) : fmtDate(Date.now() + 10 * 24 * 60 * 60 * 1000);

  const safeName  = escapeHtml(customerName  || addr.clientName || addr.fullName || '—');
  const safeCompany = escapeHtml(addr.companyName || '—');
  const safeEmail = escapeHtml(customerEmail || addr.email || '—');
  const safePhone = escapeHtml(addr.phone    || '—');
  const safeVat   = escapeHtml(addr.vatTaxNo   || '—');
  
  const safeAddrLine = escapeHtml([addr.addressLine1 || addr.address, addr.city, addr.state, addr.country].filter(Boolean).join(', ') || '—');
  const safeAssigned = order.assignedPeople ? escapeHtml(order.assignedPeople) : 'Staff Member';

  const itemRows = items.map((item, idx) => {
    const itemName  = escapeHtml(item.name || '—');
    const itemQty   = safeNum(item.quantity);
    const itemPrice = safeNum(item.price || item.unitPrice);
    return `
    <tr>
      <td class="center font-medium">${String(idx + 1).padStart(2, '0')}</td>
      <td class="item-name">${itemName}</td>
      <td class="center">${itemQty}</td>
      <td class="right">Rs. ${itemPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td class="right total-cell">Rs. ${(itemPrice * itemQty).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${orderNum}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1A1A1A; background: #fff; line-height: 1.4; }
  
  .page { max-width: 800px; margin: 0 auto; padding: 24px; position: relative; page-break-inside: avoid; }

  .brand-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .logo-area { display: flex; align-items: center; gap: 15px; }
  .brand-logo { width: 72px; height: 72px; object-fit: contain; display: block; }
  
  .brand-text { display: flex; flex-direction: column; }
  .brand-title { font-size: 28px; font-weight: 700; color: #DF9E1F; font-family: 'Georgia', serif; letter-spacing: 0.5px; }
  .brand-tagline { font-size: 11px; color: #001F3F; font-weight: 600; letter-spacing: 0.3px; margin-top: 2px; }
  
  .main-invoice-title { text-align: right; }
  .main-invoice-title h1 { font-size: 38px; font-weight: 900; color: #001F3F; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: -4px; }
  .top-mini-meta { border: 1px solid #E9E9E9; padding: 6px 12px; margin-top: 5px; border-radius: 4px; background: #FAFAFA; text-align: left; min-width: 180px; }
  .top-mini-meta div { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; }

  .offices-row { display: flex; gap: 0; border: 1px solid #DF9E1F; border-radius: 6px; margin-bottom: 14px; background: #FFFBF4; overflow: hidden; }
  .office-col { flex: 1; display: flex; padding: 12px; gap: 10px; position: relative; }
  .office-left-block { flex: 1.2; display: flex; flex-direction: column; gap: 2px; }
  .office-right-block { flex: 1; display: flex; flex-direction: column; gap: 4px; justify-content: center; padding-left: 5px; }
  
  .office-heading { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; margin-bottom: 4px; }
  .office-heading .flag-icon { width: 22px; height: 22px; object-fit: cover; display: inline-block; border-radius: 50%; flex-shrink: 0; border: 1px solid #E9E9E9; }
  .office-detail { color: #444; font-size: 10px; line-height: 1.3; }
  
  .contact-item { display: flex; align-items: flex-start; gap: 6px; font-size: 10px; color: #444; line-height: 1.4; }
  .contact-icon { width: 13px; height: 13px; fill: #1A1A1A; display: inline-block; flex-shrink: 0; margin-top: 1px; }
  .contact-value { word-break: break-all; }

  .details-grid { display: flex; gap: 20px; margin-bottom: 14px; align-items: stretch; }
  .invoice-to-box { flex: 1.2; border: 1px solid #E9E9E9; border-radius: 6px; overflow: hidden; }
  .box-header { background: #DF9E1F; color: #fff; font-weight: 700; font-size: 11px; padding: 6px 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .box-content { padding: 8px 12px; display: flex; flex-direction: column; gap: 5px; }
  .info-line { display: flex; font-size: 11px; }
  .info-line .label { width: 100px; color: #555; font-weight: 600; }
  .info-line .dots { width: 15px; color: #777; }
  .info-line .value { flex: 1; color: #1A1A1A; }

  .invoice-meta-box { flex: 0.8; display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; }
  .meta-card { border: 1px solid #E9E9E9; border-radius: 6px; display: flex; align-items: center; overflow: hidden; height: 34px; }
  .meta-card-icon { background: #001F3F; color: #fff; width: 34px; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
  .meta-card-icon svg { width: 16px; height: 16px; fill: currentColor; display: block; }
  .meta-card-body { padding: 0 10px; display: flex; flex: 1; justify-content: space-between; width: calc(100% - 34px); align-items: center; }
  .meta-card-label { font-weight: 600; color: #555; font-size: 10.5px; }
  .meta-card-value { font-weight: 700; color: #1A1A1A; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; border: 1px solid #001F3F; }
  thead tr { background: #001F3F; color: #fff; }
  thead th { padding: 8px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: left; border: 1px solid #001F3F; }
  thead th.center { text-align: center; }
  thead th.right { text-align: right; }
  tbody tr { border-bottom: 1px solid #E9E9E9; }
  tbody tr:nth-child(even) { background: #FAFAFA; }
  tbody td { padding: 7px 10px; font-size: 11px; vertical-align: middle; border-right: 1px solid #E9E9E9; }
  tbody td:last-child { border-right: none; }
  td.center { text-align: center; }
  td.right { text-align: right; }
  td.total-cell { font-weight: 600; color: #001F3F; }
  td.item-name { font-weight: 500; }

  .summary-signatures-container { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 14px; align-items: flex-start; }
  .thanks-note-block { flex: 1.1; border: 1px solid #DF9E1F; border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 15px; background: #FFFBF4; min-height: 74px; }
  .globe-graphic { width: 32px; height: 32px; border: 2px dashed #DF9E1F; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .globe-graphic svg { width: 18px; height: 18px; fill: #DF9E1F; display: block; }
  .thanks-text h3 { color: #DF9E1F; font-size: 12px; font-weight: 700; margin-bottom: 2px; }
  .thanks-text p { color: #001F3F; font-size: 11px; font-weight: 600; }

  .financial-totals-block { flex: 0.9; border: 1px solid #E9E9E9; border-radius: 6px; overflow: hidden; background: #fff; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 12px; font-size: 10.5px; border-bottom: 1px solid #E9E9E9; font-weight: 600; color: #555; }
  .totals-row span:last-child { color: #1A1A1A; font-weight: 500; text-align: right; }
  .totals-row.grand-due { background: #DF9E1F; color: #fff; font-size: 11.5px; font-weight: 700; border-bottom: none; padding: 7px 12px; }
  .totals-row.grand-due span:last-child { color: #fff; font-weight: 800; font-size: 12.5px; }

  .sign-wrapper { display: flex; gap: 15px; border: 1px solid #E9E9E9; border-radius: 6px; padding: 10px; background: #FAFAFA; margin-bottom: 14px; }
  .sign-column { flex: 1; text-align: left; display: flex; flex-direction: column; justify-content: flex-end; }
  .sign-title { font-size: 11px; font-weight: 700; color: #DF9E1F; margin-bottom: 24px; border-bottom: 1px solid #E9E9E9; padding-bottom: 2px; }
  .sign-line { border-top: 1px dashed #A0A0A0; margin-bottom: 4px; }
  .sign-meta { font-size: 9.5px; color: #555; display: flex; flex-direction: column; gap: 1px; }

  .info-boxes-row { display: flex; gap: 20px; margin-bottom: 14px; }
  .footer-info-card { flex: 1; border: 1px solid #DF9E1F; border-radius: 6px; overflow: hidden; }
  .card-header-accent { background: #DF9E1F; color: #fff; padding: 4px 10px; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .card-body-text { padding: 8px 10px; font-size: 10px; color: #333; display: flex; flex-direction: column; gap: 3px; }
  .card-body-text ol { padding-left: 12px; margin: 0; }
  .card-body-text ol li { margin-bottom: 2px; color: #444; line-height: 1.3; }

  .bottom-navy-banner { background: #001F3F; color: #fff; border-radius: 4px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #E9E9E9; }
  .bottom-banner-item { display: flex; align-items: center; gap: 4px; }
  .bottom-banner-item strong { color: #fff; }
</style>
</head>
<body>
<div class="page">

  <div class="brand-container">
    <div class="logo-area">
      <img class="brand-logo" src="/images/HOC.png" alt="House of Cambridge logo" />
      <div class="brand-text">
        <div class="brand-title">House Of Cambridge</div>
        <div class="brand-tagline">Global Perspective. Local Expertise. Lasting Value.</div>
      </div>
    </div>
    <div class="main-invoice-title">
      <h1>Invoice</h1>
      <div class="top-mini-meta">
        <div><span>Invoice No.</span><span>: ${orderNum}</span></div>
        <div><span>Date</span><span>: ${invoiceDate}</span></div>
      </div>
    </div>
  </div>

  <div class="offices-row">
    <div class="office-col" style="border-right: 1px solid #DF9E1F;">
      <div class="office-left-block">
        <div class="office-heading">
          <img class="flag-icon" src="/images/UK_flag.png" alt="UK flag" />
          <span>HEAD OFFICE – UK</span>
        </div>
        <div class="office-detail"><strong>House of Cambridge Limited</strong></div>
        <div class="office-detail">Unit 2A, 2nd Floor, Cavendish House, 369 Burnt Oak Broadway, Edgware HA8 5AW, United Kingdom.</div>
      </div>
      <div class="office-right-block">
        <div class="contact-item">
          <!-- Email Envelope Icon -->
          <svg class="contact-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 3.51L12 13.59 2.4 7.51C2.15 7.36 2 7.1 2 6.8c0-.55.45-1 1-1 .17 0 .33.05.47.14L12 11.24l8.53-5.3c.14-.09.3-.14.47-.14.55 0 1 .45 1 1 0 .3-.15.56-.4.71z"/>
          </svg>
          <span class="contact-value">info@houseofcambridge.com</span>
        </div>
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h20v20H0z" fill="none" />
            <path d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m7.75-8a8 8 0 0 0 0-4h-3.82a29 29 0 0 1 0 4zm-.82 2h-3.22a14.4 14.4 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14m-8.85-2h3.84a24.6 24.6 0 0 0 0-4H8.08a24.6 24.6 0 0 0 0 4m.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4zm-6.08-2h3.82a29 29 0 0 1 0-4H2.25a8 8 0 0 0 0 4m.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6M3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6" />
          </svg>
          <span class="contact-value">https://houseofcambridge.co.uk/</span>
        </div>
        <div class="contact-item">
          <!-- Phone Icon -->
          <svg class="contact-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          <div style="display: flex; flex-direction: column;">
            <span class="contact-value">+44 (0)20 3371 178</span>
            <span class="contact-value">+44 (0)73 8639 1286</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="office-col">
      <div class="office-left-block">
        <div class="office-heading">
          <img class="flag-icon" src="/images/LK_flag.png" alt="Sri Lanka flag" />
          <span>SRI LANKAN OFFICE</span>
        </div>
        <div class="office-detail"><strong>House of Cambridge (Pvt) Ltd</strong></div>
        <div class="office-detail">No 63, Old Road, Pannipitiya.</div>
      </div>
      <div class="office-right-block">
        <div class="contact-item">
          <!-- Email Envelope Icon -->
          <svg class="contact-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 3.51L12 13.59 2.4 7.51C2.15 7.36 2 7.1 2 6.8c0-.55.45-1 1-1 .17 0 .33.05.47.14L12 11.24l8.53-5.3c.14-.09.3-.14.47-.14.55 0 1 .45 1 1 0 .3-.15.56-.4.71z"/>
          </svg>
          <span class="contact-value">info@houseofcambridge.com</span>
        </div>
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h20v20H0z" fill="none" />
            <path d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m7.75-8a8 8 0 0 0 0-4h-3.82a29 29 0 0 1 0 4zm-.82 2h-3.22a14.4 14.4 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14m-8.85-2h3.84a24.6 24.6 0 0 0 0-4H8.08a24.6 24.6 0 0 0 0 4m.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4zm-6.08-2h3.82a29 29 0 0 1 0-4H2.25a8 8 0 0 0 0 4m.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6M3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6" />
          </svg>
          <span class="contact-value">https://houseofcambridge.co.uk/</span>
        </div>
        <div class="contact-item">
          <!-- Phone Icon -->
          <svg class="contact-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          <div style="display: flex; flex-direction: column;">
            <span class="contact-value">011 2 847 847</span>
            <span class="contact-value">076 4 604 227</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- [Rest of the layout details grid, table elements, totals and script generation context left as untouched] -->
  <div class="details-grid">
    <div class="invoice-to-box">
      <div class="box-header">Invoice To</div>
      <div class="box-content">
        <div class="info-line"><span class="label">Client Name</span><span class="dots">:</span><span class="value"><strong>${safeName}</strong></span></div>
        <div class="info-line"><span class="label">Company Name</span><span class="dots">:</span><span class="value">${safeCompany}</span></div>
        <div class="info-line"><span class="label">Address</span><span class="dots">:</span><span class="value">${safeAddrLine}</span></div>
        <div class="info-line"><span class="label">Email</span><span class="dots">:</span><span class="value">${safeEmail}</span></div>
        <div class="info-line"><span class="label">Phone</span><span class="dots">:</span><span class="value">${safePhone}</span></div>
        <div class="info-line"><span class="label">VAT / Tax No.</span><span class="dots">:</span><span class="value">${safeVat}</span></div>
      </div>
    </div>
    
    <div class="invoice-meta-box">
      <div class="meta-card">
        <div class="meta-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5L13.5 2H6zm7 1.5L18.5 9H13a.5.5 0 0 1-.5-.5V3.5zM7 12h10v2H7v-2zm0 4h10v2H7v-2zM7 8h4v2H7V8z"/>
          </svg>
        </div>
        <div class="meta-card-body">
          <span class="meta-card-label">Invoice No.</span>
          <span class="meta-card-value" style="color: #001F3F;">${orderNum}</span>
        </div>
      </div>
      <div class="meta-card">
        <div class="meta-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1zm12 8H5v9.5c0 .28.22.5.5.5h15a.5.5 0 0 0 .5-.5V10zm0-2V6.5a.5.5 0 0 0-.5-.5H17v1a1 1 0 1 1-2 0V6H9v1a1 1 0 1 1-2 0V6H4.5a.5.5 0 0 0-.5.5V8h15z"/>
          </svg>
        </div>
        <div class="meta-card-body">
          <span class="meta-card-label">Invoice Date</span>
          <span class="meta-card-value">${invoiceDate}</span>
        </div>
      </div>
      <div class="meta-card">
        <div class="meta-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1zm12 8H5v9.5c0 .28.22.5.5.5h15a.5.5 0 0 0 .5-.5V10zm0-2V6.5a.5.5 0 0 0-.5-.5H17v1a1 1 0 1 1-2 0V6H9v1a1 1 0 1 1-2 0V6H4.5a.5.5 0 0 0-.5.5V8h15z"/>
          </svg>
        </div>
        <div class="meta-card-body">
          <span class="meta-card-label">Due Date</span>
          <span class="meta-card-value" style="color: #DF9E1F;">${dueDate}</span>
        </div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;" class="center">No.</th>
        <th>Description</th>
        <th style="width: 70px;" class="center">Qty</th>
        <th style="width: 130px;" class="right">Unit Price</th>
        <th style="width: 140px;" class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="summary-signatures-container">
    <div class="thanks-note-block">
      <div class="globe-graphic">
        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-5.6-4.29a9.95 9.95 0 0 1 0-11.42A7.97 7.97 0 0 0 6 10c0 1.57-.45 3.03-1.24 4.29zm1.78 1.45A7.92 7.92 0 0 0 10 14c1.54 0 2.94-.43 4.13-1.18a9.96 9.96 0 0 1-7.75 3.42zm7.21-1.45c-.8-1.26-1.24-2.72-1.24-4.29a7.97 7.97 0 0 0 1.62-5.71 9.95 9.95 0 0 1 0 11.42zM10 6c-1.54 0-2.94.43-4.13 1.18A9.96 9.96 0 0 1 13.62 3.8 7.92 7.92 0 0 0 10 6zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
        </svg>
      </div>
      <div class="thanks-text">
        <h3>Thank you for your business.</h3>
        <p>We truly appreciate the opportunity to work with you.</p>
      </div>
    </div>
    
    <div class="financial-totals-block">
      <div class="totals-row">
        <span>SUBTOTAL</span><span>Rs. ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row" style="color: #16a34a;">
        <span>DISCOUNT</span><span>Rs. ${discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row">
        <span>TAX / VAT ( ${taxPercent}% )</span><span>Rs. ${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row grand-due">
        <span>TOTAL AMOUNT DUE</span><span>Rs. ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  </div>

  <div class="sign-wrapper">
    <div class="sign-column">
      <div class="sign-title">Issued By</div>
      <div class="sign-line"></div>
      <div class="sign-meta">
        <span>Name: ${safeAssigned}</span>
        <span>Date: ${invoiceDate}</span>
      </div>
    </div>
    <div class="sign-column" style="border-left: 1px solid #E9E9E9; padding-left: 15px;">
      <div class="sign-title">Approved By</div>
      <div class="sign-line"></div>
      <div class="sign-meta">
        <span>Name: ______________________</span>
        <span>Date: ______________________</span>
      </div>
    </div>
    <div class="sign-column" style="border-left: 1px solid #E9E9E9; padding-left: 15px;">
      <div class="sign-title">Customer's Signature</div>
      <div class="sign-line"></div>
      <div class="sign-meta">
        <span>Name: ______________________</span>
        <span>Date: ______________________</span>
      </div>
    </div>
  </div>

  <div class="info-boxes-row">
    <div class="footer-info-card">
      <div class="card-header-accent">Bank Account Details</div>
      <div class="card-body-text">
        <div style="display:flex"><span style="width:100px;font-weight:600">Account Name</span><span>: House of cambridge Limited</span></div>
        <div style="display:flex"><span style="width:100px;font-weight:600">Bank Name</span><span>: HSBC UK Bank plc</span></div>
        <div style="display:flex"><span style="width:100px;font-weight:600">Account Number</span><span>: 12345678</span></div>
        <div style="display:flex"><span style="width:100px;font-weight:600">Sort Code</span><span>: 40-05-30</span></div>
        <div style="display:flex"><span style="width:100px;font-weight:600">IBAN</span><span>: GB12HBUK40053012345678</span></div>
        <div style="display:flex"><span style="width:100px;font-weight:600">SWIFT/BIC</span><span>: HBUKGB4B</span></div>
      </div>
    </div>
    
    <div class="footer-info-card">
      <div class="card-header-accent">Terms & Conditions</div>
      <div class="card-body-text">
        <ol>
          <li>Payment is due within the agreed credit period stated on the invoice(10 Days).</li>
          <li>Ownership of goods remains with House of Cambridge until full payment has been received.</li>
          <li>Any discrepancies, shortages, or damages must be reported within 48 hours of receipt.</li>
          <li>Electronic invoices are deemed original documents and are legally valid.</li>
          <li>By making payment against this invoice, the customer agrees to these terms and conditions.</li>
        </ol>
      </div>
    </div>
  </div>

  <div class="bottom-navy-banner">
    <div class="bottom-banner-item">UK: <strong>+44 (0)20 3371 178</strong> | SL: <strong>011 2 847 847</strong></div>
    <div class="bottom-banner-item">info@houseofcambridge.com | https://houseofcambridge.co.uk/</div>
    <div class="bottom-banner-item" style="letter-spacing: 0.5px;">GLOBAL PRESENCE. PERSONAL COMMITMENT.</div>
  </div>

</div>
</body>
</html>`;

  const container = document.createElement('div');
  container.style.cssText = [
    'position:absolute',
    'left:-9999px',
    'top:0',
    'width:840px',
    'background:#fff',
  ].join(';');
  container.innerHTML = html;
  document.body.appendChild(container);

  const pageEl = container.querySelector('.page');

  html2pdf()
    .set({
      margin:      [4, 4, 4, 4],
      filename:    `Invoice-${orderNum}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale:           2.0,
        useCORS:         true,
        logging:         false,
        backgroundColor: '#ffffff',
        windowWidth:     840,
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

export const generateInvoicePDF = (invoice) => {
  return downloadInvoice(invoice);
};