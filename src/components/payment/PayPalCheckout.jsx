import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useDispatch } from 'react-redux';
import { capturePayPalOrder } from '../../redux/slices/paymentSlice.js';
import api from '../../redux/api/axiosInstance.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

if (!PAYPAL_CLIENT_ID) {
  console.warn('VITE_PAYPAL_CLIENT_ID is not set. PayPal checkout will not function.');
}

export default function PayPalCheckout({ order }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const createOrder = async () => {
    const res = await api.post('/payments/paypal/create', { orderId: order._id });
    return res.data.paypalOrderId;
  };

  const onApprove = async (data) => {
    try {
      await dispatch(capturePayPalOrder({
        paypalOrderId: data.orderID,
        orderId: order._id,
      })).unwrap();
      navigate(`/order-confirmation/${order._id}`);
    } catch {
      toast.error('PayPal capture failed. Please contact support.');
      navigate('/payment-denied');
    }
  };

  const onError = () => {
    toast.error('A PayPal error occurred. Please try again.');
    navigate('/payment-denied');
  };

  const onCancel = () => {
    toast.error('PayPal payment was cancelled.');
  };

  return (
    <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID ?? '', currency: 'USD' }}>
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
        disabled={!PAYPAL_CLIENT_ID}
      />
    </PayPalScriptProvider>
  );
}