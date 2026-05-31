import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice.js';
import Layout from '../common/Layout.jsx';
import {
  FiGrid, FiPackage, FiHeart, FiMapPin, FiCreditCard,
  FiGift, FiBell, FiUser, FiLogOut,
} from 'react-icons/fi';

const NAV = [
  { icon: FiGrid,       label: 'Dashboard',       href: '/profile' },
  { icon: FiPackage,    label: 'Order History',    href: '/orders' },
  { icon: FiHeart,      label: 'Wishlist',         href: '/wishlist' },
  { icon: FiMapPin,     label: 'Saved Addresses',  href: '/profile/addresses' },
  { icon: FiCreditCard, label: 'Payment Methods',  href: '/profile/payment' },
  { icon: FiGift,       label: 'Loyalty Points',   href: '/profile/loyalty' },
  { icon: FiBell,       label: 'Notifications',    href: '/profile/notifications' },
  { icon: FiUser,       label: 'Profile Settings', href: '/profile/edit' },
];

export default function ProfileLayout({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((s) => s.user);
  const { user }    = useSelector((s) => s.auth);
  const u = profile ?? user;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const initials = u?.name
    ? u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 pb-14">
        <div className="flex gap-5 items-start">

          <aside className="w-[230px] flex-shrink-0 sticky top-4" aria-label="Profile navigation">
            <div className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">

              <div className="px-5 pt-6 pb-5 text-center border-b border-[#F0F0F0]">
                {u?.avatar?.url ? (
                  <img
                    src={u.avatar.url}
                    alt={u?.name ?? 'User avatar'}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-[#FFB700]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#FFB700] flex items-center justify-center mx-auto mb-3 text-black font-black text-[18px]" aria-hidden="true">
                    {initials}
                  </div>
                )}
                <p className="text-[14px] font-black text-[#1A1A1A] leading-tight">{u?.name ?? 'Guest'}</p>
                <p className="text-[11px] text-[#60717B] mt-0.5 truncate">{u?.email}</p>
                <span className="inline-block mt-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full">
                  Bronze Member
                </span>
              </div>

              <nav className="py-1.5">
                {NAV.map(({ icon: Icon, label, href }) => {
                  const active = location.pathname === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 px-5 py-2.5 text-[13px] transition-colors border-l-[3px] ${
                        active
                          ? 'bg-amber-50 text-[#FFB700] border-[#FFB700] font-bold'
                          : 'border-transparent text-[#60717B] hover:bg-gray-50 hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Icon size={15} aria-hidden="true" />
                      {label}
                    </Link>
                  );
                })}
                <div className="border-t border-[#F0F0F0] mt-1.5 pt-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut size={15} aria-hidden="true" /> Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          <div className="flex-1 min-w-0 pt-2">
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}