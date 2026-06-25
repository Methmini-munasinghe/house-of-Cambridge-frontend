import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../../redux/slices/adminSlice.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { PageSpinner } from '../../components/ui/Spinner.jsx';
import {
  FiShoppingBag, FiUsers, FiBox,
  FiAlertCircle, FiStar, FiRepeat, FiTrendingUp,
} from 'react-icons/fi';

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

function RupeeIcon() {
  return <span className="text-[16px] font-black leading-none" aria-hidden="true">₨</span>;
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${color}`} aria-hidden="true">
          <Icon />
        </div>
        {sub && <span className="text-[12px] text-[#60717B]">{sub}</span>}
      </div>
      <p className="text-[24px] font-black text-[#1A1A1A]">{value}</p>
      <p className="text-[13px] text-[#60717B] mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, recentOrders, topProducts, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchDashboardStats()); }, [dispatch]);

  if (loading && !stats) {
    return <AdminLayout><PageSpinner /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={RupeeIcon}
            label="Total Revenue"
            value={`Rs.${(stats?.totalRevenue ?? 0).toLocaleString()}`}
            sub={`Rs.${(stats?.monthRevenue ?? 0).toLocaleString()} this month`}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={FiShoppingBag}
            label="Total Orders"
            value={stats?.totalOrders ?? 0}
            sub={`${stats?.monthOrders ?? 0} this month`}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={FiUsers}
            label="Total Customers"
            value={stats?.totalUsers ?? 0}
            sub={`+${stats?.monthUsers ?? 0} this month`}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={FiBox}
            label="Active Products"
            value={stats?.totalProducts ?? 0}
            sub={stats?.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : 'All stocked'}
            color="bg-amber-100 text-amber-600"
          />
        </div>

        {(stats?.lowStockProducts > 0 || stats?.pendingReviews > 0 || stats?.pendingReturns > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats?.lowStockProducts > 0 && (
              <Link
                to="/admin/products?isActive=true&lowStock=true"
                className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 hover:bg-amber-100 transition-colors"
              >
                <FiAlertCircle className="text-amber-600 flex-shrink-0" size={18} aria-hidden="true" />
                <span className="text-[13px] font-semibold text-amber-800">{stats.lowStockProducts} products low on stock</span>
              </Link>
            )}
            {stats?.pendingReviews > 0 && (
              <Link
                to="/admin/reviews?status=pending"
                className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-3 hover:bg-blue-100 transition-colors"
              >
                <FiStar className="text-blue-600 flex-shrink-0" size={18} aria-hidden="true" />
                <span className="text-[13px] font-semibold text-blue-800">{stats.pendingReviews} reviews awaiting moderation</span>
              </Link>
            )}
            {stats?.pendingReturns > 0 && (
              <Link
                to="/admin/returns?status=pending"
                className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-[10px] px-4 py-3 hover:bg-orange-100 transition-colors"
              >
                <FiRepeat className="text-orange-600 flex-shrink-0" size={18} aria-hidden="true" />
                <span className="text-[13px] font-semibold text-orange-800">{stats.pendingReturns} returns need attention</span>
              </Link>
            )}
          </div>
        )}

        {stats?.ordersByStatus && (
          <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-5">
            <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Orders by Status</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <Link
                  key={status}
                  to={`/admin/orders?status=${status}`}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-opacity hover:opacity-80 ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {status.replace(/_/g, ' ')}: {count}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[#1A1A1A]">Recent Orders</h2>
              <Link to="/admin/orders" className="text-[13px] text-[#FFB700] font-semibold hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentOrders?.slice(0, 8).map((order) => (
  <Link
    key={order._id}
    to={`/admin/orders/${order.orderNumber || order._id}`}   
    className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0 hover:bg-[#FAFAFA] px-1 rounded transition-colors"
  >
    <div>
      <p className="text-[13px] font-semibold text-[#1A1A1A]">{order.orderNumber}</p>
      <p className="text-[12px] text-[#60717B]">{order.user?.name || order.guestName || 'Guest'}</p>
    </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-[#1A1A1A]">Rs.{order.total?.toLocaleString()}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.orderStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                      {order.orderStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))}
              {!recentOrders?.length && (
                <p className="text-[13px] text-[#60717B] text-center py-4">No orders yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[#1A1A1A]">Top Selling Products</h2>
              <FiTrendingUp className="text-[#FFB700]" size={18} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              {topProducts?.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 py-2 border-b border-[#F4F5F7] last:border-0">
                  <span className="w-6 h-6 rounded-full bg-[#FFB700]/15 text-[#FFB700] text-[11px] font-black flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    {i + 1}
                  </span>
                  {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 rounded-[6px] object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{p.name}</p>
                    <p className="text-[12px] text-[#60717B]">{p.totalQty} units sold</p>
                  </div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] flex-shrink-0">
                    Rs.{p.revenue?.toLocaleString()}
                  </p>
                </div>
              ))}
              {!topProducts?.length && (
                <p className="text-[13px] text-[#60717B] text-center py-4">No sales data yet</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}