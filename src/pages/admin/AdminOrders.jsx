import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../redux/slices/adminSlice.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { ToastContainer } from '../../components/ui/Toast.jsx';
import useToast from '../../hooks/useToast.js';
import { FiSearch, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'];

const STATUS_COLORS = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100   text-blue-700',
  processing:       'bg-purple-100 text-purple-700',
  shipped:          'bg-indigo-100 text-indigo-700',
  delivered:        'bg-green-100  text-green-700',
  cancelled:        'bg-red-100    text-red-700',
  return_requested: 'bg-orange-100 text-orange-700',
  returned:         'bg-gray-100   text-gray-700',
};

const PAGE_SIZE = 20;

const INPUT_CLS =
  'w-full px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]';

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, ordersTotal, loading } = useSelector((s) => s.admin);
  const [searchParams]                   = useSearchParams();
  const { toasts, toast, removeToast }   = useToast();

  const [search,        setSearch]        = useState(searchParams.get('search') || '');
  const [status,        setStatus]        = useState(searchParams.get('status') || '');
  const [page,          setPage]          = useState(1);
  const [modal,         setModal]         = useState(null);
  const [adminNotes,    setAdminNotes]    = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const pages = Math.ceil((ordersTotal ?? 0) / PAGE_SIZE);

  const load = useCallback((s = search, st = status, p = page) => {
    dispatch(fetchAdminOrders({
      search: s  || undefined,
      status: st || undefined,
      page:   p,
      limit:  PAGE_SIZE,
    }));
  }, [dispatch, search, status, page]);

  useEffect(() => { load(search, status, page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(search, status, 1);
  };

  const handleStatusFilter = (val) => {
    setStatus(val);
    setPage(1);
    load(search, val, 1);
  };

  const openModal = (order, newStatus) => {
    setModal({ orderId: order._id, orderNumber: order.orderNumber, newStatus });
    setAdminNotes('');
  };

  const handleStatusUpdate = async () => {
    if (!modal) return;
    setActionLoading(true);
    try {
      await dispatch(updateAdminOrderStatus({
        id:   modal.orderId,
        data: { status: modal.newStatus, adminNotes },
      })).unwrap();
      toast.success(`Order ${modal.orderNumber} marked as ${modal.newStatus.replace(/_/g, ' ')}`);
      setModal(null);
      setAdminNotes('');
      load(search, status, page);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <h2 className="text-[20px] font-black text-[#1A1A1A]">
            Orders <span className="text-[#60717B] font-normal text-[16px]">({ordersTotal ?? 0})</span>
          </h2>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-4 flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]" role="search">
            <div className="relative flex-1">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60717B]" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order #, guest email…"
                aria-label="Search orders"
                className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#FFB700] text-[#1A1A1A] font-semibold text-[13px] rounded-[8px] hover:bg-amber-400 transition-colors">
              Search
            </button>
          </form>
          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#FAFAFA] border-b border-[#E9E9E9]">
                <tr>
                  {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[#60717B] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && !orders.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#60717B]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#FFB700] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        Loading…
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#60717B]">No orders found</td></tr>
                ) : orders.map((order) => (
                  <tr key={order._id} className="border-b border-[#F4F5F7] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A] whitespace-nowrap">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-[#1A1A1A]">
                      <p className="font-medium">{order.user?.name || order.guestName || 'Guest'}</p>
                      <p className="text-[#60717B] text-[11px]">{order.user?.email || order.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[#60717B] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-[#60717B]">{order.items?.length}</td>
                    <td className="px-4 py-3 font-bold text-[#1A1A1A] whitespace-nowrap">Rs.{order.total?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => openModal(order, e.target.value)}
                        aria-label={`Change status for order ${order.orderNumber}`}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full border-0 cursor-pointer capitalize focus:outline-none ${STATUS_COLORS[order.orderStatus] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        aria-label={`View order ${order.orderNumber}`}
                        className="text-[#FFB700] hover:text-amber-500 transition-colors"
                      >
                        <FiEye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="px-4 py-3 border-t border-[#E9E9E9] flex items-center justify-between">
              <p className="text-[13px] text-[#60717B]">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors">
                  <FiChevronLeft size={14} />
                </button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors">
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!modal}
        onClose={() => { setModal(null); setAdminNotes(''); }}
        onConfirm={handleStatusUpdate}
        title="Update Order Status"
        message={
          <div className="space-y-3">
            <p>Change <strong>{modal?.orderNumber}</strong> to <strong className="capitalize">{modal?.newStatus?.replace(/_/g, ' ')}</strong>?</p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Admin note (optional)"
              rows={2}
              maxLength={1000}
              aria-label="Admin note"
              className={`${INPUT_CLS} resize-none`}
            />
          </div>
        }
        confirmLabel="Update"
        variant="warning"
        loading={actionLoading}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}