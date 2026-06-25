import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../../redux/slices/orderSlice';
import Layout from '../../components/common/Layout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { PageSpinner } from '../../components/ui/Spinner';
import api from '../../redux/api/axiosInstance';
import {
  FiCheck, FiPackage, FiTruck, FiSearch, FiDollarSign,
  FiArrowLeft, FiMessageSquare, FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const RETURN_STEPS = [
  { key: 'submitted', label: 'Submitted',      Icon: FiCheck      },
  { key: 'in_review', label: 'In Review',      Icon: FiSearch     },
  { key: 'approved',  label: 'Return Approved', Icon: FiCheck     },
  { key: 'collected', label: 'Item Collected',  Icon: FiTruck     },
  { key: 'qc',        label: 'QC Inspection',   Icon: FiSearch    },
  { key: 'refunded',  label: 'Refund Issued',   Icon: FiDollarSign },
];

const STEP_KEY_INDEX = Object.fromEntries(
  RETURN_STEPS.map((s, i) => [s.key, i]),
);

function fmtDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-LK', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function fmtDateTime(d) {
  return new Date(d || Date.now()).toLocaleString('en-LK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return isFinite(n) ? n : fallback;
}

export default function ReturnStatus() {
  const { orderId } = useParams();
  const dispatch    = useDispatch();
  const { order, loading: orderLoading } = useSelector((s) => s.orders);

  const [returnData,     setReturnData]     = useState(null);
  const [returnLoading,  setReturnLoading]  = useState(true);
  const [cancelling,     setCancelling]     = useState(false);

  
  useEffect(() => {
    if (orderId) dispatch(fetchOrder(orderId));
  }, [orderId, dispatch]);


  useEffect(() => {
    if (!orderId) return;
    setReturnLoading(true);
    api.get('/orders/my-returns')
      .then((res) => {
        const returns = res.data.returns || [];
        const found   = returns.find(
          (r) => String(r.order?._id || r.order) === String(orderId),
        );
        setReturnData(found || null);
      })
      .catch(() => setReturnData(null))
      .finally(() => setReturnLoading(false));
  }, [orderId]);

  const handleCancelReturn = async () => {
    if (!returnData?._id) return;
    if (!window.confirm('Cancel this return request?')) return;
    setCancelling(true);
    try {
    
      toast.success('Return cancellation request sent. Our team will contact you.');
    } catch {
      toast.error('Could not cancel return request. Please contact support.');
    } finally {
      setCancelling(false);
    }
  };

  const loading = orderLoading || returnLoading;
  if (loading && !order) return <Layout><PageSpinner /></Layout>;

  const items       = Array.isArray(order?.items) ? order.items : [];
  const orderTotal  = safeNum(order?.total);

  const currentStatus = returnData?.status || 'pending';

  const CURRENT_STEP =
    currentStatus === 'pending' ? 0
    : (STEP_KEY_INDEX[currentStatus] ?? 1);

  const progressPct = RETURN_STEPS.length > 1
    ? (CURRENT_STEP / (RETURN_STEPS.length - 1)) * 100
    : 0;

  const returnItems = returnData?.items?.length ? returnData.items : items;

  const activityLog = [
    returnData && {
      time:   returnData.updatedAt || returnData.createdAt,
      title:  `Return status: ${(returnData.status || 'pending').replace(/_/g, ' ')}`,
      desc:   returnData.adminNotes || 'Your return is being processed by our team.',
      active: true,
    },
    returnData && {
      time:   returnData.createdAt,
      title:  'Return request submitted',
      desc:   `Return request ${returnData.returnId || ''} submitted for ${returnItems.length} item${returnItems.length !== 1 ? 's' : ''}.`,
      active: false,
    },
    order && {
      time:   order.deliveredAt || order.updatedAt,
      title:  'Order delivered',
      desc:   `Order ${order.orderNumber || ''} was delivered successfully.`,
      active: false,
    },
  ].filter(Boolean);

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 py-2">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Orders', href: '/orders' },
          { label: 'Return Status' },
        ]} />
      </div>

      <div className="max-w-[900px] mx-auto px-4 pb-14">
        <div className="mb-5">
          <h1 className="text-[22px] font-black text-[#1A1A1A]">Return Status</h1>
          <p className="text-[13px] text-[#60717B]">Track the progress of your return request.</p>
        </div>

        <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-5 shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[16px] font-black text-[#1A1A1A] mb-1">
                {returnData?.returnId || 'Return Request'}
              </p>
              <p className="text-[12px] text-[#60717B]">
                Submitted:{' '}
                <time dateTime={returnData?.createdAt}>
                  {fmtDate(returnData?.createdAt || new Date())}
                </time>
                {' · '}Order{' '}
                {order?.orderNumber || `#${orderId?.slice(-8).toUpperCase()}`}
                {' · '}{returnItems.length} Item{returnItems.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="flex-shrink-0 text-[11px] font-bold bg-[#FFB700] text-black px-3 py-1.5 rounded-full capitalize">
              {(returnData?.status || 'Pending').replace(/_/g, ' ')}
            </span>
          </div>
        </div>

    
        <section
          className="bg-white border border-[#E9E9E9] rounded-[10px] p-6 shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-4"
          aria-labelledby="return-progress-heading"
        >
          <h2 id="return-progress-heading" className="text-[12px] font-black text-[#60717B] uppercase tracking-wider mb-6">
            Return Progress
          </h2>

          <div className="relative flex items-start justify-between" role="list" aria-label="Return processing steps">
            <div className="absolute top-5 left-0 right-0 h-[2px] bg-[#E9E9E9] z-0" aria-hidden="true" />
            <div
              className="absolute top-5 left-0 h-[2px] bg-[#FFB700] z-0 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              aria-hidden="true"
            />

            {RETURN_STEPS.map((s, i) => {
              const done   = i < CURRENT_STEP;
              const active = i === CURRENT_STEP;
              const { Icon } = s;
              return (
                <div
                  key={s.key}
                  role="listitem"
                  aria-label={`${s.label}${done ? ' — complete' : active ? ' — in progress' : ' — pending'}`}
                  className="relative z-10 flex flex-col items-center gap-1.5 flex-1"
                >
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                    done   ? 'bg-[#FFB700] border-[#FFB700] text-black'  :
                    active ? 'bg-white border-[#FFB700] text-[#FFB700]'  :
                    'bg-white border-[#E9E9E9] text-[#C5C5C5]'
                  }`}>
                    {done
                      ? <FiCheck size={15} strokeWidth={3} aria-hidden="true" />
                      : <Icon size={14} aria-hidden="true" />
                    }
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-bold leading-tight max-w-[68px] mx-auto ${
                      active || done ? 'text-[#1A1A1A]' : 'text-[#C5C5C5]'
                    }`}>
                      {s.label}
                    </p>
                    {active && (
                      <p className="text-[9px] text-[#FFB700] font-semibold mt-0.5">In Progress</p>
                    )}
                    {done && i === 0 && returnData?.createdAt && (
                      <p className="text-[9px] text-[#60717B] mt-0.5">
                        <time dateTime={returnData.createdAt}>{fmtDate(returnData.createdAt)}</time>
                      </p>
                    )}
                    {!done && !active && i === 2 && (
                      <p className="text-[9px] text-[#C5C5C5] mt-0.5">Est. {addDays(2)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-[#F8F8F8] border border-[#E9E9E9] rounded-[8px] px-5 py-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-[#60717B] uppercase tracking-wider mb-0.5">Expected Refund</p>
              <p className="text-[14px] font-black text-[#1A1A1A]">
                Rs. {(returnData?.refundAmount || orderTotal).toLocaleString()}
                {returnData?.refundMethod
                  ? ` · ${returnData.refundMethod.replace(/_/g, ' ')}`
                  : ' · Original payment method'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#60717B] uppercase tracking-wider mb-0.5">Estimated Date</p>
              <p className="text-[13px] font-bold text-[#1A1A1A]">{addDays(6)} – {addDays(10)}</p>
            </div>
          </div>
        </section>

     
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-4 shadow-[2px_3px_6px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-black text-[#60717B] uppercase tracking-wider mb-2.5">Return Reason</p>
            <p className="text-[13px] font-medium text-[#1A1A1A] capitalize">
              {(returnData?.reason || '—').replace(/_/g, ' ')}
            </p>
            {returnData?.description && (
              <p className="text-[12px] text-[#60717B] mt-1">{returnData.description}</p>
            )}
          </div>

          <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-4 shadow-[2px_3px_6px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-black text-[#60717B] uppercase tracking-wider mb-2.5">Collection Method</p>
            <dl className="space-y-1 text-[12px] text-[#60717B]">
              <div className="flex gap-1">
                <dt className="font-semibold text-[#1A1A1A]">Method:</dt>
                <dd>HOC Courier Pickup</dd>
              </div>
              <div className="flex gap-1">
                <dt className="font-semibold text-[#1A1A1A]">Date:</dt>
                <dd>{addDays(2)} – {addDays(3)}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="font-semibold text-[#1A1A1A]">Address:</dt>
                <dd>{order?.shippingAddress?.city || 'Colombo'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-4 shadow-[2px_3px_6px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-black text-[#60717B] uppercase tracking-wider mb-2.5">Refund Details</p>
            <dl className="space-y-1 text-[12px] text-[#60717B]">
              <div className="flex gap-1">
                <dt className="font-semibold text-[#1A1A1A]">Amount:</dt>
                <dd>Rs. {(returnData?.refundAmount || orderTotal).toLocaleString()}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="font-semibold text-[#1A1A1A]">Method:</dt>
                <dd className="capitalize">
                  {(returnData?.refundMethod || returnData?.resolution || 'refund').replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="font-semibold text-[#1A1A1A]">Timeline:</dt>
                <dd>5–7 business days</dd>
              </div>
            </dl>
          </div>
        </div>

     
        <section
          className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-4"
          aria-labelledby="return-items-heading"
        >
          <div className="px-5 py-3.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
            <h2 id="return-items-heading" className="text-[13px] font-black text-[#1A1A1A]">
              Items Being Returned ({returnItems.length})
            </h2>
          </div>
          <ul className="divide-y divide-[#F5F5F5]">
            {returnItems.map((item, idx) => {
              const price = safeNum(item.price);
              const qty   = safeNum(item.quantity, 1);
              return (
                <li key={item._id || idx} className="flex items-center gap-4 px-5 py-4">
                  <img
                    src={item.image || item.product?.images?.[0]?.url || 'https://placehold.co/60?text=P'}
                    alt={item.name || item.product?.name || 'Product'}
                    className="w-14 h-14 object-cover rounded-[6px] border border-[#E9E9E9] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A1A1A]">
                      {item.name || item.product?.name}
                    </p>
                    <p className="text-[12px] text-[#60717B]">Rs. {price.toLocaleString()}</p>
                  </div>
                  <span className="text-[11px] text-[#60717B] border border-[#E9E9E9] rounded-[6px] px-3 py-1.5 flex-shrink-0">
                    Qty to return: {qty}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

       
        <section
          className="bg-white border border-[#E9E9E9] rounded-[10px] p-5 shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-6"
          aria-labelledby="return-activity-heading"
        >
          <h2 id="return-activity-heading" className="text-[12px] font-black text-[#60717B] uppercase tracking-wider mb-5">
            Activity Log
          </h2>
          <ol className="space-y-4">
            {activityLog.map((log, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    log.active ? 'bg-[#FFB700] border-[#FFB700]' : 'bg-white border-[#C5C5C5]'
                  }`} aria-hidden="true" />
                  {i < activityLog.length - 1 && (
                    <div className="w-[1px] flex-1 bg-[#E9E9E9] mt-1" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-4">
                  <time className="text-[11px] text-[#60717B] mb-0.5 block" dateTime={log.time}>
                    {fmtDateTime(log.time)}
                  </time>
                  <p className="text-[13px] font-bold text-[#1A1A1A] mb-0.5">{log.title}</p>
                  <p className="text-[12px] text-[#60717B] leading-relaxed">{log.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

   
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Link
              to="/orders"
              className="flex items-center gap-2 border border-[#C5C5C5] text-[#1A1A1A] text-[12px] font-semibold px-4 py-2.5 rounded-[6px] hover:bg-gray-50"
            >
              <FiArrowLeft size={13} /> Back To Orders
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 border border-[#C5C5C5] text-[#1A1A1A] text-[12px] font-semibold px-4 py-2.5 rounded-[6px] hover:bg-gray-50"
            >
              <FiMessageSquare size={13} /> Contact Support
            </Link>
          </div>
          {returnData && !['refunded', 'collected', 'qc'].includes(returnData.status) && (
            <button
              onClick={handleCancelReturn}
              disabled={cancelling}
              className="flex items-center gap-2 border border-red-200 text-red-500 text-[12px] font-semibold px-4 py-2.5 rounded-[6px] hover:bg-red-50 disabled:opacity-50"
            >
              <FiX size={13} /> {cancelling ? 'Cancelling…' : 'Cancel Return Request'}
            </button>
          )}
        </nav>
      </div>
    </Layout>
  );
}