import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import ProfileLayout from '../../components/profile/ProfileLayout';
import { FiPackage, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE      = 8;
const MAX_SEARCH_LEN = 60;

const ACTIVE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'];

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  returned:   'bg-orange-100 text-orange-700',
};

const TABS = ['All', 'Active', 'Delivered', 'Returns', 'Cancelled'];

function sanitizeSearch(value) {
  return value.replace(/[<>"'`]/g, '').slice(0, MAX_SEARCH_LEN);
}

function sanitizeOrderId(id) {
  if (!id) return '—';
  const safe = String(id).replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase();
  return `#DFC-${new Date().getFullYear()}-${safe}`;
}

function fmtDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-LK', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getActions(o) {
  const view = (
    <Link key="view" to={`/track-order/${o._id}`}
      className="text-[11px] text-[#60717B] hover:text-[#1A1A1A] font-semibold">
      View
    </Link>
  );
  const track = (
    <Link key="track" to={`/track-order/${o._id}`}
      className="text-[11px] text-[#FFB700] font-bold hover:underline">
      Track
    </Link>
  );
  const cancel = (
    <button key="cancel" type="button"
      className="text-[11px] text-red-500 font-semibold hover:underline">
      Cancel
    </button>
  );
  const ret = (
    <Link key="return" to={`/orders/${o._id}/return`}
      className="text-[11px] text-[#60717B] font-semibold hover:text-[#1A1A1A]">
      Return
    </Link>
  );
  const reorder = (
    <button key="reorder" type="button"
      className="text-[11px] text-[#60717B] font-semibold hover:text-[#1A1A1A]">
      Re-order
    </button>
  );

  if (['pending', 'confirmed', 'processing'].includes(o.orderStatus)) return [view, track, cancel];
  if (o.orderStatus === 'shipped')   return [view, track];
  if (o.orderStatus === 'delivered') return [view, ret, reorder];
  if (o.orderStatus === 'cancelled') return [view, reorder];
  return [view];
}

export default function OrderHistory() {
  const dispatch = useDispatch();
  const { orders } = useSelector((s) => s.orders);
  const [tab, setTab]     = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage]   = useState(1);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const handleSearchChange = useCallback((e) => {
    setSearch(sanitizeSearch(e.target.value));
    setPage(1);
  }, []);

  const handleTabChange = useCallback((t) => {
    setTab(t);
    setPage(1);
  }, []);

  const orderList = orders || [];

  const filtered = orderList.filter((o) => {
    if (tab === 'Active')    return ACTIVE_STATUSES.includes(o.orderStatus);
    if (tab === 'Delivered') return o.orderStatus === 'delivered';
    if (tab === 'Returns')   return o.orderStatus === 'returned';
    if (tab === 'Cancelled') return o.orderStatus === 'cancelled';
    return true;
  }).filter((o) =>
    !search || sanitizeOrderId(o._id).toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tabCounts = {
    All:       orderList.length,
    Active:    orderList.filter((o) => ACTIVE_STATUSES.includes(o.orderStatus)).length,
    Delivered: orderList.filter((o) => o.orderStatus === 'delivered').length,
    Returns:   orderList.filter((o) => o.orderStatus === 'returned').length,
    Cancelled: orderList.filter((o) => o.orderStatus === 'cancelled').length,
  };

  const totalSpent     = orderList.reduce((s, o) => s + (Number(o.total) || 0), 0);

  const STATS = [
    { label: 'Total Orders',  value: orderList.length           },
    { label: 'Active Orders', value: tabCounts.Active           },
    { label: 'Delivered',     value: tabCounts.Delivered        },
    { label: 'Total Spent',   value: `Rs. ${totalSpent.toLocaleString()}` },
  ];

  return (
    <ProfileLayout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-[#E9E9E9] rounded-[10px] px-4 py-4 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-[22px] font-black text-[#1A1A1A] leading-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">

        <div className="flex border-b border-[#F0F0F0] overflow-x-auto" role="tablist" aria-label="Order filters">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => handleTabChange(t)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3 text-[12px] font-bold border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#FFB700] text-[#1A1A1A]'
                  : 'border-transparent text-[#60717B] hover:text-[#1A1A1A]'
              }`}
            >
              {t}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                tab === t ? 'bg-[#FFB700] text-black' : 'bg-[#F0F0F0] text-[#60717B]'
              }`} aria-label={`${tabCounts[t]} orders`}>
                {tabCounts[t]}
              </span>
            </button>
          ))}
        </div>

        <div className="px-5 py-3 border-b border-[#F0F0F0] flex items-center gap-3">
          <div className="relative flex-1 max-w-[280px]" role="search">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5C5C5]" aria-hidden="true" />
            <label htmlFor="order-search" className="sr-only">Search by order ID</label>
            <input
              id="order-search"
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by order ID..."
              maxLength={MAX_SEARCH_LEN}
              className="w-full pl-8 pr-3 py-2 border border-[#E9E9E9] rounded-[6px] text-[12px] outline-none focus:border-[#FFB700] bg-[#FAFAFA]"
            />
          </div>
          <p className="text-[11px] text-[#60717B] ml-auto" aria-live="polite">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {paginated.length === 0 ? (
          <div className="py-14 text-center" role="status">
            <FiPackage size={28} className="mx-auto mb-2 text-[#C5C5C5]" aria-hidden="true" />
            <p className="text-[13px] text-[#60717B]">No orders in this category</p>
          </div>
        ) : (
          <div className="overflow-x-auto" role="tabpanel" aria-live="polite">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                  {['Order ID', 'Date', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-2.5 text-left text-[11px] font-bold text-[#60717B] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {paginated.map((o) => (
                  <tr key={o._id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/track-order/${o._id}`}
                        className="text-[12px] font-bold text-[#FFB700] hover:underline whitespace-nowrap"
                      >
                        {sanitizeOrderId(o._id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#60717B] whitespace-nowrap">
                      <time dateTime={o.createdAt}>{fmtDate(o.createdAt)}</time>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#60717B]">
                      <div className="flex items-center gap-1">
                        {(o.items || []).slice(0, 2).map((item, i) => (
                          <img
                            key={i}
                            src={item.image || 'https://placehold.co/32?text=P'}
                            alt={item.name || 'Order item'}
                            className="w-8 h-8 object-cover rounded-[4px] border border-[#E9E9E9]"
                          />
                        ))}
                        {(o.items?.length || 0) > 2 && (
                          <span className="text-[10px] text-[#60717B]">+{o.items.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold text-[#1A1A1A] whitespace-nowrap">
                      Rs. {(Number(o.total) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize whitespace-nowrap ${
                        STATUS_STYLES[o.orderStatus] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {getActions(o)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-[#F0F0F0] flex items-center justify-between">
            <p className="text-[11px] text-[#60717B]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="w-7 h-7 border border-[#E9E9E9] rounded-[4px] flex items-center justify-center disabled:opacity-40 hover:border-[#FFB700] transition-colors"
              >
                <FiChevronLeft size={13} aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? 'page' : undefined}
                  className={`w-7 h-7 border rounded-[4px] text-[11px] font-bold transition-colors ${
                    n === page
                      ? 'bg-[#FFB700] border-[#FFB700] text-black'
                      : 'border-[#E9E9E9] text-[#60717B] hover:border-[#FFB700]'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="w-7 h-7 border border-[#E9E9E9] rounded-[4px] flex items-center justify-center disabled:opacity-40 hover:border-[#FFB700] transition-colors"
              >
                <FiChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}