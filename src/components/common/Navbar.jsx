import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser,
  FiPhone, FiChevronDown, FiMenu, FiX, FiGlobe,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice.js';
import { fetchCategories } from '../../redux/slices/productSlice.js';
import { fetchWishlist } from '../../redux/slices/userSlice.js';
import { buildCategoryTree } from '../../utils/categoryTree.js';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

function AllCategoriesDropdown({ tree }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative h-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-[#FFB700] text-black text-[14px] font-bold px-7 py-4 h-full hover:bg-amber-500 transition-colors whitespace-nowrap"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <FiMenu size={16} />
        All Categories
        <FiChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full w-64 bg-[#1e2130] border border-white/10 rounded-b shadow-xl py-1 z-50 max-h-[70vh] overflow-y-auto">
          <Link
            to="/shop"
            className="block px-4 py-2.5 text-[13px] text-[#FFB700] font-semibold hover:bg-white/5 border-b border-white/5 mb-1"
            onClick={() => setOpen(false)}
          >
            All Products
          </Link>
          {tree.map((parent) => (
            <div key={parent._id}>
              <Link
                to={`/shop?category=${parent._id}`}
                className="flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-200 font-medium hover:text-[#FFB700] hover:bg-white/5 transition-colors"
                onClick={() => setOpen(false)}
              >
                {parent.name}
              </Link>
              {parent.children.map((child) => (
                <Link
                  key={child._id}
                  to={`/shop?category=${child._id}`}
                  className="flex items-center gap-2 pl-7 pr-4 py-2 text-[12px] text-gray-400 hover:text-[#FFB700] hover:bg-white/5 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-gray-600 flex-shrink-0">└</span>
                  {child.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NavBadgeDropdown({ label, glowColor, tree, baseParam, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
  <button
  onClick={() => setOpen((v) => !v)}
  className="flex items-center gap-2 px-5 py-2 rounded-md bg-white text-black text-[13px] font-bold transition-all hover:brightness-95 cursor-pointer"
  aria-expanded={open}
  aria-haspopup="true"
>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: glowColor }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: glowColor }} />
        </span>
        {label}
        <FiChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-60 bg-[#1e2130] border border-white/10 rounded shadow-xl py-1 z-50 max-h-[70vh] overflow-y-auto">
          {loading && <div className="px-4 py-3 text-[13px] text-gray-400">Loading categories…</div>}
          {!loading && tree.length === 0 && (
            <Link to={`/shop?${baseParam}`} className="block px-4 py-2.5 text-[13px] text-[#FFB700] font-semibold hover:bg-white/5" onClick={() => setOpen(false)}>
              View All
            </Link>
          )}
          {!loading && tree.length > 0 && (
            <>
              <Link to={`/shop?${baseParam}`} className="block px-4 py-2.5 text-[13px] text-[#FFB700] font-semibold hover:bg-white/5 border-b border-white/5 mb-1" onClick={() => setOpen(false)}>
                View All
              </Link>
              {tree.map((parent) => (
                <div key={parent._id}>
                  <Link to={`/shop?${baseParam}&category=${parent._id}`} className="flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-200 font-medium hover:text-[#FFB700] hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                    {parent.name}
                  </Link>
                  {parent.children.map((child) => (
                    <Link key={child._id} to={`/shop?${baseParam}&category=${child._id}`} className="flex items-center gap-2 pl-7 pr-4 py-2 text-[12px] text-gray-400 hover:text-[#FFB700] hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                      <span className="text-gray-600 flex-shrink-0">└</span>
                      {child.name}
                    </Link>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NavTextDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
  onClick={() => setOpen((v) => !v)}
  className="flex items-center gap-1.5 px-5 py-2 bg-white text-black text-[13.5px] font-bold rounded-md transition-all hover:brightness-95 cursor-pointer"
  style={{ letterSpacing: '0.04em' }}
  aria-expanded={open}
  aria-haspopup="true"
>
        {label}
        <FiChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-0 w-48 bg-[#1e2130] border border-white/10 rounded shadow-xl py-1 z-50">
          {items.map(({ label: l, to }) => (
            <Link key={to} to={to} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-[#FFB700] hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
              {l}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGES_ITEMS = [
  { label: 'Privacy Policy',     to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'FAQ',                to: '/faq' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { categories, categoriesLoading } = useSelector((s) => s.products);
  const { cart } = useSelector((s) => s.cart);
  const { wishlist } = useSelector((s) => s.user);

  const [search, setSearch]               = useState('');
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileExpandedCats, setMobileExpandedCats] = useState(new Set());
  const [userOpen, setUserOpen]           = useState(false);
  const userRef = useRef(null);
  useClickOutside(userRef, () => setUserOpen(false));

  const cartCount     = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const wishlistCount = wishlist?.length ?? 0;

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => { if (isAuthenticated) dispatch(fetchWishlist()); }, [isAuthenticated, dispatch]);

  const toggleMobileCat = (id) => {
    setMobileExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (trimmed) navigate(`/shop?keyword=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setUserOpen(false);
    setMobileOpen(false);
  };

  return (
   <header 
  className="sticky top-0 z-[9999] w-full bg-[#111111]"
  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.7)' }}
>
      <div className="w-full px-4 md:px-14 py-3 md:py-4 flex items-center flex-wrap gap-3 md:gap-6">
        <Link to="/" className="flex-shrink-0">
          <img src="/images/logo.png" alt="House of Cambridge" className="h-10 md:h-14 w-auto object-contain" />
        </Link>

        <button
          className="md:hidden ml-auto text-[#FFB700]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>

        <form
          onSubmit={handleSearch}
          className="flex w-full md:flex-1 md:max-w-2xl md:mx-auto order-last md:order-none"
          role="search"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for Products, Categories and More…"
            aria-label="Search"
            className="flex-1 bg-white text-[#1A1A1A] placeholder-gray-400 px-4 py-2.5 text-[13px] md:text-[14px] outline-none rounded-l"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="bg-[#FFB700] px-4 md:px-5 rounded-r flex items-center justify-center hover:bg-amber-500 transition-colors"
          >
            <FiSearch size={18} className="text-black" />
          </button>
        </form>

        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          <Link to="/cart" className="flex flex-col items-center gap-0.5 text-[#FFB700] hover:text-amber-400 transition-colors group">
            <div className="relative">
              <FiShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FFB700] text-black text-[9px] font-black min-w-[15px] h-[15px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">Cart</span>
          </Link>

          <Link to="/wishlist" className="flex flex-col items-center gap-0.5 text-[#FFB700] hover:text-amber-400 transition-colors group">
            <div className="relative">
              <FiHeart size={24} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black min-w-[15px] h-[15px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">Wishlist</span>
          </Link>

          <div className="flex flex-col items-center gap-0.5 text-[#FFB700] cursor-default" aria-label="Language and currency: English, LKR">
            <FiGlobe size={22} />
            <span className="text-[10px] text-gray-500">EN / LKR</span>
          </div>

          <div className="w-px h-8 bg-white/10 flex-shrink-0" />

          <div ref={userRef} className="relative">
            {isAuthenticated ? (
              <button onClick={() => setUserOpen((v) => !v)} className="flex flex-col items-center gap-0.5 text-[#FFB700] hover:text-amber-400 transition-colors group" aria-expanded={userOpen} aria-haspopup="true">
                {user?.avatar?.url
                  ? <img src={user.avatar.url} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-[#FFB700]" />
                  : <FiUser size={24} />
                }
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 max-w-[55px] truncate">{user?.name?.split(' ')[0]}</span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-[#FFB700] text-black text-[14px] font-bold px-6 py-2.5 rounded hover:bg-amber-500 transition-colors whitespace-nowrap">
                <FiUser size={15} /> Login
              </Link>
            )}
            {userOpen && isAuthenticated && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e2130] border border-white/10 rounded shadow-xl py-1 z-50" role="menu">
                <Link to="/profile"  className="block px-4 py-2.5 text-sm text-gray-300 hover:text-[#FFB700] hover:bg-white/5" onClick={() => setUserOpen(false)} role="menuitem">My Profile</Link>
                <Link to="/orders"   className="block px-4 py-2.5 text-sm text-gray-300 hover:text-[#FFB700] hover:bg-white/5" onClick={() => setUserOpen(false)} role="menuitem">My Orders</Link>
                <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-[#FFB700] hover:bg-white/5" onClick={() => setUserOpen(false)} role="menuitem">Wishlist</Link>
                <hr className="my-1 border-white/5" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5" role="menuitem">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="hidden md:block border-t border-white/[0.07]" style={{ background: 'linear-gradient(180deg, #1c1c1c 0%, #151515 100%)' }} aria-label="Main navigation">
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #FFB70030, #FFB70060, #FFB70030, transparent)' }} />

        <div className="w-full flex items-stretch relative" style={{ minHeight: '52px' }}>
          <AllCategoriesDropdown tree={categoryTree} />
          <div className="w-px bg-white/10 self-stretch" />

          <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1 pointer-events-auto" style={{ paddingLeft: '220px', paddingRight: '160px' }}>
              <Link to="/" className="px-5 py-2 text-[13.5px] font-bold text-black bg-white whitespace-nowrap rounded-md transition-all hover:brightness-95" style={{ letterSpacing: '0.04em' }}>
                Home
              </Link>

              <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />

              <NavBadgeDropdown 
  label="Pre-Owned UK Items" 
  glowColor="#ef4444" 
  tree={categoryTree} 
  baseParam="preowned=true" 
  loading={categoriesLoading} 
/>
              <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />

<NavBadgeDropdown 
  label="New Arrivals" 
  glowColor="#22c55e" 
  tree={categoryTree} 
  baseParam="newArrival=true" 
  loading={categoriesLoading} 
/>

              <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />

             <NavTextDropdown label="Pages" items={PAGES_ITEMS} />

              <Link to="/about"   className="px-5 py-2 text-[13.5px] font-bold text-black bg-white whitespace-nowrap rounded-md transition-all hover:brightness-95" style={{ letterSpacing: '0.04em' }}>About</Link>
              <Link to="/contact" className="px-5 py-2 text-[13.5px] font-bold text-black bg-white whitespace-nowrap rounded-md transition-all hover:brightness-95" style={{ letterSpacing: '0.04em' }}>Contact</Link>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 px-8 text-[13px] font-bold text-white flex-shrink-0 z-10">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(255,183,0,0.08)', border: '1px solid rgba(255,183,0,0.2)' }}>
              <FiPhone size={13} className="text-[#FFB700]" />
              <a href="tel:01128478480" className="text-[#FFB700] tracking-wide text-[13px]">0112 847 848</a>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, #ffffff12, #ffffff08, transparent)' }} />
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1a1a1a] py-2 px-4 flex flex-col gap-0.5 max-h-[80vh] overflow-y-auto" role="navigation" aria-label="Mobile navigation">
          <Link to="/"     className="py-2.5 text-sm text-gray-200 border-b border-white/5" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/shop" className="py-2.5 text-sm text-gray-200 border-b border-white/5" onClick={() => setMobileOpen(false)}>Shop</Link>

          <div className="border-b border-white/5">
            <button onClick={() => setMobileCatOpen((v) => !v)} className="w-full flex items-center justify-between py-2.5 text-sm text-gray-200" aria-expanded={mobileCatOpen}>
              All Categories
              <FiChevronDown size={14} className={`transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileCatOpen && (
              <div className="pb-2 space-y-0.5">
                <Link to="/shop" className="block py-2 pl-2 text-[13px] text-[#FFB700] font-medium" onClick={() => setMobileOpen(false)}>All Products</Link>
                {categoryTree.map((parent) => {
                  const hasChildren = parent.children.length > 0;
                  const isExpanded  = mobileExpandedCats.has(parent._id);
                  return (
                    <div key={parent._id}>
                      <div className="flex items-center">
                        <Link to={`/shop?category=${parent._id}`} className="flex-1 py-2 pl-2 text-[13px] text-gray-300 font-medium hover:text-[#FFB700]" onClick={() => setMobileOpen(false)}>
                          {parent.name}
                        </Link>
                        {hasChildren && (
                          <button onClick={() => toggleMobileCat(parent._id)} className="px-2 py-2 text-gray-500 hover:text-[#FFB700]" aria-expanded={isExpanded}>
                            <FiChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      {hasChildren && isExpanded && (
                        <div className="pl-4 border-l border-white/10 ml-2 space-y-0.5 mb-1">
                          {parent.children.map((child) => (
                            <Link key={child._id} to={`/shop?category=${child._id}`} className="flex items-center gap-2 py-1.5 text-[12px] text-gray-400 hover:text-[#FFB700]" onClick={() => setMobileOpen(false)}>
                              <span className="text-gray-600">└</span>{child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link to="/shop?preowned=true"   className="py-2.5 text-sm font-bold border-b border-white/5 text-red-400"   onClick={() => setMobileOpen(false)}>Pre-Owned UK Items</Link>
          <Link to="/shop?newArrival=true" className="py-2.5 text-sm font-bold border-b border-white/5 text-green-400" onClick={() => setMobileOpen(false)}>New Arrivals</Link>
          <Link to="/flash-sale" className="py-2.5 text-sm text-red-400  border-b border-white/5" onClick={() => setMobileOpen(false)}>Flash Sale</Link>
          <Link to="/about"      className="py-2.5 text-sm text-gray-200 border-b border-white/5" onClick={() => setMobileOpen(false)}>About</Link>
          <Link to="/contact"    className="py-2.5 text-sm text-gray-200 border-b border-white/5" onClick={() => setMobileOpen(false)}>Contact</Link>

          <div className="flex items-center gap-4 pt-3">
            <Link to="/cart" className="flex items-center gap-1.5 text-[#FFB700] text-sm" onClick={() => setMobileOpen(false)}>
              <FiShoppingCart size={18} />Cart
              {cartCount > 0 && <span className="bg-[#FFB700] text-black text-[9px] font-black px-1.5 rounded-full">{cartCount}</span>}
            </Link>
            {isAuthenticated && (
              <Link to="/wishlist" className="flex items-center gap-1.5 text-[#FFB700] text-sm" onClick={() => setMobileOpen(false)}>
                <FiHeart size={18} />Wishlist
                {wishlistCount > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded-full">{wishlistCount}</span>}
              </Link>
            )}
            {isAuthenticated
              ? <button onClick={handleLogout} className="text-sm text-red-400">Sign Out</button>
              : <Link to="/login" className="bg-[#FFB700] text-black px-4 py-1.5 rounded text-sm font-bold" onClick={() => setMobileOpen(false)}>Login</Link>
            }
          </div>
        </div>
      )}
    </header>
  );
}