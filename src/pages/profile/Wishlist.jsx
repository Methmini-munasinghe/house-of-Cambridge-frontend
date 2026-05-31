import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../../redux/slices/userSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import Layout from '../../components/common/Layout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { PageSpinner } from '../../components/ui/Spinner';
import { FiHeart, FiShoppingCart, FiX, FiMinus, FiPlus, FiEye, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MAX_QTY = 99;
const MIN_QTY = 1;

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default'              },
  { value: 'price_asc',  label: 'Price: Low to High'   },
  { value: 'price_desc', label: 'Price: High to Low'   },
  { value: 'name',       label: 'Name A–Z'             },
];

const ALLOWED_SORTS = new Set(SORT_OPTIONS.map((o) => o.value));

function getPrice(p) {
  return (p.discountPrice > 0 ? p.discountPrice : p.price) || 0;
}

function normalizeItem(item) {
  return typeof item === 'object' ? item : { _id: item };
}

export default function Wishlist() {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((s) => s.user);
  const [qtys, setQtys]       = useState({});
  const [sort, setSort]       = useState('default');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  const getQty = useCallback((id) => qtys[id] || MIN_QTY, [qtys]);

  const setQty = useCallback((id, qty) => {
    setQtys((prev) => ({ ...prev, [id]: Math.min(MAX_QTY, Math.max(MIN_QTY, qty)) }));
  }, []);

  const handleSortChange = useCallback((e) => {
    const val = e.target.value;
    if (ALLOWED_SORTS.has(val)) setSort(val);
  }, []);

  const handleAddToCart = useCallback((p) => {
    dispatch(addToCart({ productId: p._id, quantity: getQty(p._id) })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') toast.success('Added to cart!');
      else toast.error('Failed to add to cart. Please try again.');
    });
  }, [dispatch, getQty]);

  const handleAddAll = useCallback(() => {
    const prods = (wishlist || []).map(normalizeItem).filter((p) => p._id);
    if (prods.length === 0) return;
    prods.forEach((p) => dispatch(addToCart({ productId: p._id, quantity: getQty(p._id) })));
    toast.success('All items added to cart!');
  }, [dispatch, wishlist, getQty]);

  const handleRemove = useCallback((id) => {
    dispatch(toggleWishlist(id)).then(() => toast.success('Removed from wishlist'));
  }, [dispatch]);

  const handleClearAll = useCallback(() => {
    const ids = (wishlist || []).map((p) => (typeof p === 'object' ? p._id : p)).filter(Boolean);
    ids.forEach((id) => dispatch(toggleWishlist(id)));
    toast.success('Wishlist cleared');
    setShowClearConfirm(false);
  }, [dispatch, wishlist]);

  const getSorted = useCallback(() => {
    const items = (wishlist || []).map(normalizeItem);
    if (sort === 'price_asc')  return [...items].sort((a, b) => getPrice(a) - getPrice(b));
    if (sort === 'price_desc') return [...items].sort((a, b) => getPrice(b) - getPrice(a));
    if (sort === 'name')       return [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return items;
  }, [wishlist, sort]);

  if (loading) return <Layout><PageSpinner /></Layout>;

  const sortedItems  = getSorted();
  const wishlistList = wishlist || [];

  return (
    <Layout>
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-wishlist-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white rounded-[12px] shadow-xl p-6 max-w-[360px] w-full mx-4">
            <h2 id="clear-wishlist-title" className="text-[15px] font-black text-[#1A1A1A] mb-2">Clear Wishlist?</h2>
            <p className="text-[13px] text-[#60717B] mb-5">
              All {wishlistList.length} item{wishlistList.length !== 1 ? 's' : ''} will be removed from your wishlist.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 border border-[#C5C5C5] text-[#1A1A1A] text-[13px] font-bold py-2.5 rounded-[6px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 bg-red-500 text-white text-[13px] font-bold py-2.5 rounded-[6px] hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 py-2">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'My Wishlist' }]} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h1 className="text-[22px] font-black text-[#1A1A1A]">
            My Wishlist ({wishlistList.length} item{wishlistList.length !== 1 ? 's' : ''})
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <label htmlFor="wishlist-sort" className="sr-only">Sort wishlist</label>
              <select
                id="wishlist-sort"
                value={sort}
                onChange={handleSortChange}
                className="appearance-none border border-[#C5C5C5] rounded-[6px] pl-3 pr-8 py-2 text-[13px] text-[#1A1A1A] bg-white outline-none focus:border-[#FFB700] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <FiChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
            </div>

            {wishlistList.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="bg-[#FFB700] text-black font-bold text-[13px] px-4 py-2 rounded-[6px] hover:bg-amber-500 transition-colors flex items-center gap-1.5"
                >
                  <FiShoppingCart size={13} aria-hidden="true" /> Add All To Cart
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="border border-[#C5C5C5] text-[#60717B] font-medium text-[13px] px-4 py-2 rounded-[6px] hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  Clear Wishlist
                </button>
              </>
            )}
          </div>
        </div>

        {wishlistList.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart size={56} className="mx-auto mb-4 text-gray-200" aria-hidden="true" />
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-1.5">Your wishlist is empty</h2>
            <p className="text-[13px] text-[#60717B] mb-6">
              Save items you love to your wishlist and revisit them anytime.
            </p>
            <Link
              to="/shop"
              className="bg-[#FFB700] text-black px-8 py-3 rounded-[6px] font-bold text-[14px] hover:bg-amber-500 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-5 py-3.5 mb-5 flex items-center justify-between gap-4" role="note">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FFB700]/20 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <FiEye size={16} className="text-[#FFB700]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1A1A1A]">Price Drop Alert</p>
                  <p className="text-[12px] text-[#60717B]">
                    Some items in your wishlist have dropped in price. Don&apos;t miss out!
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bg-[#FFB700] text-black font-bold text-[12px] px-4 py-2 rounded-[6px] hover:bg-amber-500 transition-colors flex-shrink-0 whitespace-nowrap"
              >
                View Price Drops
              </button>
            </div>

            <div className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-[#F5F5F5] border-b border-[#E9E9E9]">
                      {['Product', 'Unit Price', 'Quantity', 'Subtotal', 'Action'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className={`text-[12px] font-bold text-[#60717B] uppercase tracking-wider px-4 py-3.5 ${
                            h === 'Product' ? 'text-left px-5' : 'text-center'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {sortedItems.map((p) => {
                      if (!p._id) return null;
                      const price = getPrice(p);
                      const qty   = getQty(p._id);
                      return (
                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <Link to={`/product/${p._id}`} className="flex-shrink-0">
                                <img
                                  src={p.images?.[0]?.url || 'https://placehold.co/80?text=P'}
                                  alt={p.name || 'Product image'}
                                  className="w-[70px] h-[70px] object-cover rounded-[8px] border border-[#E9E9E9]"
                                />
                              </Link>
                              <Link
                                to={`/product/${p._id}`}
                                className="text-[13px] font-medium text-[#1A1A1A] hover:text-[#FFB700] transition-colors line-clamp-2 max-w-[220px]"
                              >
                                {p.name || 'Product'}
                              </Link>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="text-[14px] font-bold text-[#1A1A1A]">
                              Rs. {price.toLocaleString()}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <div
                                className="flex items-center border border-[#C5C5C5] rounded-[6px] overflow-hidden"
                                role="group"
                                aria-label={`Quantity for ${p.name || 'product'}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setQty(p._id, qty - 1)}
                                  disabled={qty <= MIN_QTY}
                                  aria-label="Decrease quantity"
                                  className="w-8 h-8 flex items-center justify-center bg-[#F5F5F5] hover:bg-gray-200 transition-colors disabled:opacity-40"
                                >
                                  <FiMinus size={11} aria-hidden="true" />
                                </button>
                                <span
                                  className="w-10 h-8 flex items-center justify-center text-[13px] font-semibold text-[#1A1A1A] border-x border-[#C5C5C5] bg-white"
                                  aria-live="polite"
                                  aria-label={`Quantity: ${qty}`}
                                >
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQty(p._id, qty + 1)}
                                  disabled={qty >= MAX_QTY}
                                  aria-label="Increase quantity"
                                  className="w-8 h-8 flex items-center justify-center bg-[#F5F5F5] hover:bg-gray-200 transition-colors disabled:opacity-40"
                                >
                                  <FiPlus size={11} aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="text-[14px] font-bold text-[#1A1A1A]">
                              Rs. {(price * qty).toLocaleString()}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddToCart(p)}
                                className="bg-[#FFB700] text-black font-bold text-[12px] px-3.5 py-2 rounded-[6px] hover:bg-amber-500 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                              >
                                <FiShoppingCart size={12} aria-hidden="true" /> Add To Cart
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemove(p._id)}
                                aria-label={`Remove ${p.name || 'product'} from wishlist`}
                                className="w-8 h-8 border border-[#E9E9E9] rounded-[6px] flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
                              >
                                <FiX size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}