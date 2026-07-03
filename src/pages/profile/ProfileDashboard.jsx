import { useEffect, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, fetchWishlist } from '../../redux/slices/userSlice';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import ProfileLayout from '../../components/profile/ProfileLayout';
import {
  FiPackage, FiSearch, FiChevronLeft, FiChevronRight,
  FiMapPin, FiCreditCard, FiPhone, FiMail,
} from 'react-icons/fi';

const MAX_SEARCH_LEN     = 60;
const RECENT_ORDER_COUNT = 5;

const STATUS_STYLES = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100   text-blue-700',
  processing:       'bg-purple-100 text-purple-700',
  shipped:          'bg-indigo-100 text-indigo-700',
  delivered:        'bg-green-100  text-green-700',
  cancelled:        'bg-red-100    text-red-700',
  returned:         'bg-orange-100 text-orange-700',
  return_requested: 'bg-amber-100  text-amber-700',
};

function sanitizeSearch(value) {
  return value.replace(/[<>"'`]/g, '').slice(0, MAX_SEARCH_LEN);
}

function fmtDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-LK', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ProfileDashboard() {
  const dispatch = useDispatch();
  const { profile, wishlist } = useSelector((s) => s.user);
  const { user }              = useSelector((s) => s.auth);
  const { orders }            = useSelector((s) => s.orders);
  const [search, setSearch]   = useState('');
  const wishlistRef           = useRef(null);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchMyOrders());
    dispatch(fetchWishlist());
  }, [dispatch]);

  const u            = profile || user;
  const orderList    = orders  || [];
  const wishlistList = wishlist || [];

  const activeOrders  = orderList.filter((o) => !['delivered', 'cancelled', 'returned'].includes(o.orderStatus));
  const totalSpent    = orderList.reduce((s, o) => s + (o.total || 0), 0);
  const loyaltyPoints = u?.loyaltyPoints || 0;

  const handleSearchChange = useCallback((e) => {
    setSearch(sanitizeSearch(e.target.value));
  }, []);

 
  const filteredOrders = orderList.filter(
    (o) =>
      !search ||
      (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (o._id || '').toLowerCase().includes(search.toLowerCase()),
  );

  const scrollWishlist = useCallback((dir) => {
    wishlistRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }, []);

  const defaultAddress = (u?.addresses || [])[0];

  const STATS = [
    { label: 'Total Orders',   value: orderList.length,                    color: 'text-[#1A1A1A]' },
    { label: 'Active Orders',  value: activeOrders.length,                 color: 'text-[#FFB700]' },
    { label: 'Loyalty Points', value: loyaltyPoints,                       color: 'text-[#FFB700]' },
    { label: 'Total Spent',    value: `Rs. ${totalSpent.toLocaleString()}`, color: 'text-[#1A1A1A]' },
  ];

  return (
    <ProfileLayout>
    
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#E9E9E9] rounded-[10px] px-4 py-4 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-[22px] font-black leading-tight ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

  
      <section
        className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-4"
        aria-labelledby="recent-orders-heading"
      >
        <div className="px-5 py-3.5 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 id="recent-orders-heading" className="text-[13px] font-black text-[#1A1A1A]">Recent Orders</h2>
          <div className="flex items-center gap-2">
            <div className="relative" role="search">
              <FiSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C5C5C5]" aria-hidden="true" />
              <label htmlFor="order-search" className="sr-only">Search orders by number</label>
              <input
                id="order-search"
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search orders..."
                maxLength={MAX_SEARCH_LEN}
                className="pl-8 pr-3 py-1.5 border border-[#E9E9E9] rounded-[6px] text-[12px] outline-none focus:border-[#FFB700] w-40"
              />
            </div>
            <Link to="/orders" className="text-[12px] text-[#FFB700] font-bold hover:underline whitespace-nowrap">
              View All
            </Link>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-10 text-center" role="status">
            <FiPackage size={28} className="mx-auto mb-2 text-[#C5C5C5]" aria-hidden="true" />
            <p className="text-[13px] text-[#60717B]">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                  {['Order #', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-2.5 text-left text-[11px] font-bold text-[#60717B] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {filteredOrders.slice(0, RECENT_ORDER_COUNT).map((o) => (
                  <tr key={o._id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3">
                 
                      <Link
                        to={`/orders/${o._id}`}
                        className="text-[12px] font-bold text-[#FFB700] hover:underline"
                      >
                        {o.orderNumber || `#${o._id.slice(-8).toUpperCase()}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#60717B]">
                      <time dateTime={o.createdAt}>{fmtDate(o.createdAt)}</time>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#60717B]">
                      {o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold text-[#1A1A1A]">
                      Rs. {o.total?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${
                          STATUS_STYLES[o.orderStatus] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {(o.orderStatus || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    
        <section
          className="bg-white border border-[#E9E9E9] rounded-[10px] p-5 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]"
          aria-labelledby="account-summary-heading"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="account-summary-heading" className="text-[13px] font-black text-[#1A1A1A]">Account Summary</h2>
            <Link to="/profile/edit" className="text-[11px] text-[#FFB700] font-bold hover:underline">Edit</Link>
          </div>
          <dl className="space-y-2.5 text-[12px] text-[#60717B]">
            <div className="flex items-center gap-2.5">
              <FiMail size={13} className="text-[#C5C5C5] flex-shrink-0" aria-hidden="true" />
              <dt className="sr-only">Name</dt>
              <dd>{u?.name || '—'}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <FiMail size={13} className="text-[#C5C5C5] flex-shrink-0" aria-hidden="true" />
              <dt className="sr-only">Email</dt>
              <dd className="truncate">{u?.email || '—'}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <FiPhone size={13} className="text-[#C5C5C5] flex-shrink-0" aria-hidden="true" />
              <dt className="sr-only">Phone</dt>
              <dd>{u?.phone || 'Not set'}</dd>
            </div>
            {defaultAddress && (
              <div className="flex items-start gap-2.5">
                <FiMapPin size={13} className="text-[#C5C5C5] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="sr-only">Default address</dt>
                <dd>{defaultAddress.addressLine1}, {defaultAddress.city}</dd>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <FiCreditCard size={13} className="text-[#C5C5C5] flex-shrink-0" aria-hidden="true" />
              <dt className="sr-only">Default payment</dt>
              <dd>Payment methods managed at checkout</dd>
            </div>
          </dl>
        </section>

   
        <section
          className="bg-white border border-[#E9E9E9] rounded-[10px] p-5 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]"
          aria-labelledby="wishlist-heading"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="wishlist-heading" className="text-[13px] font-black text-[#1A1A1A]">My Wishlist</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollWishlist(-1)}
                aria-label="Scroll wishlist left"
                className="w-6 h-6 border border-[#E9E9E9] rounded-full flex items-center justify-center hover:border-[#FFB700] transition-colors"
              >
                <FiChevronLeft size={12} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollWishlist(1)}
                aria-label="Scroll wishlist right"
                className="w-6 h-6 border border-[#E9E9E9] rounded-full flex items-center justify-center hover:border-[#FFB700] transition-colors"
              >
                <FiChevronRight size={12} aria-hidden="true" />
              </button>
              <Link to="/wishlist" className="text-[11px] text-[#FFB700] font-bold hover:underline ml-1">
                View All
              </Link>
            </div>
          </div>

          {wishlistList.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[12px] text-[#60717B] mb-1">No items in wishlist</p>
              <Link to="/shop" className="text-[12px] text-[#FFB700] font-bold hover:underline">
                Browse Products
              </Link>
            </div>
          ) : (
            <div
              ref={wishlistRef}
              className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
              aria-label="Wishlist items"
            >
              {wishlistList.map((item) => {
                const p = item.product || item;
                if (!p._id) return null;
                return (
                  <Link key={p._id} to={`/product/${p._id}`} className="flex-shrink-0 w-[100px]">
                    <img
                      src={p.images?.[0]?.url || 'https://placehold.co/100?text=P'}
                      alt={p.name || 'Wishlist product'}
                      className="w-full h-[90px] object-cover rounded-[6px] border border-[#E9E9E9] mb-1"
                    />
                    <p className="text-[10px] font-semibold text-[#1A1A1A] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#FFB700] font-bold">Rs. {p.price?.toLocaleString()}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </ProfileLayout>
  );
}