const ALLOWED_PAYHERE_URLS = new Set([
  'https://www.payhere.lk/pay/checkout',
  'https://sandbox.payhere.lk/pay/checkout',
]);

export const PAYHERE_URL = (() => {
  const live = 'https://www.payhere.lk/pay/checkout';
  const sandbox = 'https://sandbox.payhere.lk/pay/checkout';
  const url = import.meta.env.VITE_PAYHERE_MODE === 'live' ? live : sandbox;
  return ALLOWED_PAYHERE_URLS.has(url) ? url : sandbox;
})();

export const PAYHERE_MERCHANT_ID = import.meta.env.VITE_PAYHERE_MERCHANT_ID;

const PARAM_KEY_RE    = /^[A-Za-z0-9_]{1,64}$/;
const MAX_PARAM_VALUE = 500;

function sanitizeParamValue(value) {
  return String(value ?? '').slice(0, MAX_PARAM_VALUE);
}

export function submitPayHereForm(params) {
  if (!params || typeof params !== 'object') {
    console.error('submitPayHereForm: params must be a non-null object.');
    return;
  }

  if (!ALLOWED_PAYHERE_URLS.has(PAYHERE_URL)) {
    console.error('submitPayHereForm: unexpected PayHere URL blocked.');
    return;
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = PAYHERE_URL;

  Object.entries(params).forEach(([key, value]) => {
    if (!PARAM_KEY_RE.test(key)) {
      console.warn(`submitPayHereForm: skipping unsafe param key "${key}"`);
      return;
    }
    const input   = document.createElement('input');
    input.type    = 'hidden';
    input.name    = key;
    input.value   = sanitizeParamValue(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}