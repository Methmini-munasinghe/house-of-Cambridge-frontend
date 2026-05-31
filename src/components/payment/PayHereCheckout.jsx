import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getPayHereHash } from '../../redux/slices/paymentSlice.js';
import { submitPayHereForm, PAYHERE_MERCHANT_ID } from '../../utils/payhere.js';
import toast from 'react-hot-toast';

export default function PayHereCheckout({ order, onError }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const amount = order.total.toFixed(2);
      const { hash } = await dispatch(
        getPayHereHash({ orderId: order._id, amount, currency: 'LKR' })
      ).unwrap();

      const addr = order.shippingAddress ?? {};
      const nameParts = (addr.fullName ?? '').trim().split(' ');

      submitPayHereForm({
        merchant_id: PAYHERE_MERCHANT_ID,
        return_url:  `${window.location.origin}/order-confirmation/${order._id}`,
        cancel_url:  `${window.location.origin}/payment-denied`,
        notify_url:  `${import.meta.env.VITE_API_URL}/payments/payhere/notify`,
        order_id:    order.orderNumber,
        items:       order.items.map((i) => i.name).join(', '),
        currency:    'LKR',
        amount,
        first_name:  nameParts[0] ?? '',
        last_name:   nameParts.slice(1).join(' '),
        email:       order.guestEmail ?? '',
        phone:       addr.phone ?? '',
        address:     addr.addressLine1 ?? '',
        city:        addr.city ?? '',
        country:     'Sri Lanka',
        hash,
      });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to initiate payment');
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-[#FFB700] text-black font-bold text-[14px] py-3.5 rounded-[8px] hover:bg-amber-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Redirecting…' : `Pay Rs. ${order?.total?.toLocaleString()} with PayHere`}
    </button>
  );
}