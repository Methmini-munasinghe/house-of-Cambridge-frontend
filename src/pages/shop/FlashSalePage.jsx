import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlashSaleProducts } from '../../redux/slices/productSlice';
import Layout from '../../components/common/Layout';
import ProductCard from '../../components/ui/ProductCard';
import { PageSpinner } from '../../components/ui/Spinner';
import { addToCart } from '../../redux/slices/cartSlice';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { FiShield, FiTruck, FiRefreshCw, FiZap, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MAX_PRICE_DEFAULT = 50000;
const PER_PAGE = 8;
const TOP_DEALS_COUNT = 12;
const SCROLL_AMOUNT = 200;

function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '');
}

function safePrice(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function safeRating(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0;
}

function Countdown({ endsAt }) {
  const [t, setT] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    let end;
    try {
      end = endsAt ? new Date(endsAt) : new Date(Date.now() + 3 * 3600000);
      if (isNaN(end.getTime())) end = new Date(Date.now() + 3 * 3600000);
    } catch {
      end = new Date(Date.now() + 3 * 3600000);
    }

    const tick = () => {
      const d = Math.max(0, end - Date.now());
      setT({
        h: String(Math.floor(d / 3600000)).padStart(2, '0'),
        m: String(Math.floor((d % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((d % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const Box = ({ v, l }) => (
    <div className="bg-black text-white rounded-lg px-3 py-2 min-w-[68px] text-center">
      <div className="text-[32px] font-black leading-none">{v}</div>
      <div className="text-[11px] text-white/60 mt-1">{l}</div>
    </div>
  );

  return (
    <div
      className="inline-flex flex-col items-center gap-1 px-5 py-3 rounded-[11px]"
      style={{
        background: 'linear-gradient(180deg, #D00000 0%, #000000 74%)',
        border: '2.2px solid transparent',
        backgroundClip: 'padding-box',
        boxShadow: '0 0 0 2.2px #FF543E, inset 0 0 0 100px rgba(0,0,0,0)',
      }}
    >
      <p className="text-[#FFB700] font-semibold text-[14px] mb-1">Hurry up ! Sale ends in</p>
      <div className="flex items-center gap-2">
        <Box v={t.h} l="Hours" />
        <span className="text-white font-black text-2xl">:</span>
        <Box v={t.m} l="Mins" />
        <span className="text-white font-black text-2xl">:</span>
        <Box v={t.s} l="Secs" />
      </div>
    </div>
  );
}

function TopDealCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const price = safePrice(
    product.flashSalePrice > 0
      ? product.flashSalePrice
      : product.discountPrice > 0
      ? product.discountPrice
      : product.price
  );

  // Set original price if a valid lower sale price exists
  const originalPrice = (product.flashSalePrice > 0 || product.discountPrice > 0) ? safePrice(product.price) : null;
  const discount = originalPrice && originalPrice > price
    ? Math.min(99, Math.max(0, Math.round((1 - price / originalPrice) * 100)))
    : 0;

  const productId = product._id;
  const productName = sanitizeText(product.name);
  const imageUrl = product.images?.[0]?.url || 'https://placehold.co/200x200?text=No+Image';
  const rating = safeRating(product.ratings);

  const handleBuyNow = useCallback(
    (e) => {
      e.preventDefault();
      if (!productId) return;
      dispatch(addToCart({ productId, quantity: 1 }));
      navigate('/checkout');
    },
    [dispatch, productId, navigate]
  );

  if (!productId) return null;

  return (
    <Link
      to={`/product/${encodeURIComponent(productId)}`}
      className="flex flex-col h-full w-full bg-white rounded-[14px] border border-[#E9E9E9] shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.14)] transition-shadow"
    >
      <div className="relative aspect-square bg-gray-50 flex-shrink-0">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200?text=No+Image'; }}
        />
        {discount > 0 && (
          <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-8 h-8 flex items-center justify-center leading-tight text-center">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-1" aria-label={`Rating: ${rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((s) => (
            <FaStar key={s} size={9} className={s <= Math.round(rating) ? 'text-[#FFB700]' : 'text-gray-200'} aria-hidden="true" />
          ))}
        </div>
        <p className="text-[11px] text-[#1A1A1A] font-medium line-clamp-2 leading-snug mb-1.5 min-h-[30px] flex-1">
          {productName}
        </p>
        <div className="flex items-end justify-between mb-0.5 w-full">
          <div className="min-h-[20px] flex items-end">
            {originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                Rs. {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[14px] font-bold text-[#1A1A1A]">
            Rs. {price.toLocaleString()}
          </span>
        </div>
        <button
          onClick={handleBuyNow}
          className="w-full bg-[#FFB700] text-black text-[11px] font-bold py-1.5 rounded-[4px] flex items-center justify-center gap-1 hover:bg-amber-500 transition-colors"
          aria-label={`Buy ${productName} now`}
        >
          <FaShoppingCart size={10} aria-hidden="true" /> Buy Now
        </button>
      </div>
    </Link>
  );
}

function FilterCheck({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer group">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-3.5 h-3.5 accent-[#FFB700]"
        />
        <span className="text-[13px] text-[#1A1A1A] group-hover:text-[#FFB700] transition-colors">
          {sanitizeText(label)}
        </span>
      </div>
      <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
        {Number.isFinite(count) ? count : 0}
      </span>
    </label>
  );
}

export default function FlashSalePage() {
  const dispatch = useDispatch();
  const { flashSale, loading, categories } = useSelector((s) => s.products);
  const scrollRef = useRef(null);

  const [selectedCats, setSelectedCats] = useState([]);
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE_DEFAULT]);
  const [sort, setSort] = useState('popularity');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchFlashSaleProducts());
  }, [dispatch]);

  const maxPrice = useMemo(() => {
    if (!flashSale.length) return MAX_PRICE_DEFAULT;
    const computed = Math.max(...flashSale.map((p) => safePrice(p.price)));
    return Number.isFinite(computed) && computed > 0 ? computed : MAX_PRICE_DEFAULT;
  }, [flashSale]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const catCounts = useMemo(() => {
    const map = {};
    flashSale.forEach((p) => {
      const catId = p.category?._id;
      if (catId && typeof catId === 'string') {
        map[catId] = (map[catId] || 0) + 1;
      }
    });
    return map;
  }, [flashSale]);

  const filtered = useMemo(() => {
    let res = flashSale.filter((p) => {
      const price = safePrice(p.discountPrice > 0 ? p.discountPrice : p.price);
      const catOk = selectedCats.length === 0 || selectedCats.includes(p.category?._id);
      const priceOk = price >= priceRange[0] && price <= priceRange[1];
      return catOk && priceOk;
    });

    if (sort === 'price-asc') {
      res = [...res].sort(
        (a, b) => safePrice(a.discountPrice || a.price) - safePrice(b.discountPrice || b.price)
      );
    } else if (sort === 'price-desc') {
      res = [...res].sort(
        (a, b) => safePrice(b.discountPrice || b.price) - safePrice(a.discountPrice || a.price)
      );
    } else if (sort === 'rating') {
      res = [...res].sort((a, b) => safeRating(b.ratings) - safeRating(a.ratings));
    }

    return res;
  }, [flashSale, selectedCats, priceRange, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleCat = useCallback((id) => {
    if (typeof id !== 'string') return;
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCats([]);
    setPriceRange([0, maxPrice]);
    setPage(1);
  }, [maxPrice]);

  const handlePriceChange = useCallback(
    (e) => {
      const val = Math.min(maxPrice, Math.max(0, Number(e.target.value)));
      setPriceRange([priceRange[0], val]);
      setPage(1);
    },
    [maxPrice, priceRange]
  );

  const handleSortChange = useCallback((e) => {
    const allowed = ['popularity', 'price-asc', 'price-desc', 'rating'];
    if (allowed.includes(e.target.value)) {
      setSort(e.target.value);
      setPage(1);
    }
  }, []);

  const scroll = useCallback((dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: 'smooth' });
    }
  }, []);

  const endsAt = flashSale[0]?.flashSaleEnds;

  const validCategories = useMemo(
    () => categories.filter((c) => c._id && catCounts[c._id]),
    [categories, catCounts]
  );

  const validFlashSaleProducts = useMemo(
    () => flashSale.filter((p) => p._id).slice(0, TOP_DEALS_COUNT),
    [flashSale]
  );

  return (
    <Layout>
      <div className="relative overflow-hidden" style={{ background: '#1a0000' }}>
        <img
          src="/images/flash-sale-bg.png"
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none select-none"
        />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8">
          <nav aria-label="Breadcrumb">
            <p className="text-white/70 text-[13px] pt-5 pb-2">
              <Link to="/" className="hover:text-white">Home</Link> / Flash Sale
            </p>
          </nav>

          <div className="flex items-center justify-between gap-4 pb-6">
            <div className="flex-shrink-0">
              <div className="flex items-start gap-2">
                <svg
                  width="60"
                  height="140"
                  viewBox="0 0 60 140"
                  fill="none"
                  className="flex-shrink-0 mt-1"
                  aria-hidden="true"
                >
                  <path
                    d="M35 0L0 80H28L18 140L60 55H32L35 0Z"
                    fill="url(#bolt-gradient)"
                  />
                  <defs>
                    <linearGradient
                      id="bolt-gradient"
                      x1="0"
                      y1="0"
                      x2="60"
                      y2="140"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FFB700" />
                      <stop offset="1" stopColor="#FF543E" />
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <div
                    className="font-black italic leading-none select-none"
                    style={{ fontSize: 'clamp(56px, 7vw, 96px)', lineHeight: '0.9' }}
                  >
                    <span className="text-white block">FLASH</span>
                    <span
                      className="block"
                      style={{
                        background: 'linear-gradient(180deg, #FFB700 90%, #CC0000 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      SALE
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 mt-2">
                <div className="text-black font-black italic text-[16px] leading-tight">
                  UP<br />TO
                </div>
                <div
                  className="text-black font-black italic leading-none"
                  style={{ fontSize: 'clamp(44px, 5vw, 64px)' }}
                >
                  40
                </div>
                <div className="text-black font-black italic text-[16px] leading-tight">
                  %<br />OFF
                </div>
              </div>
            </div>

            <div className="hidden md:block flex-shrink-0">
              <Countdown endsAt={endsAt} />
            </div>

            <div className="hidden lg:block flex-shrink-0">
              <img
                src="/images/flash-sale-products.png"
                alt="Featured flash sale products"
                className="h-[290px] w-auto object-contain pointer-events-none select-none"
                loading="eager"
              />
            </div>
          </div>

          <div
            className="flex items-center justify-between px-6 py-2.5 mb-0"
            style={{ background: 'linear-gradient(180deg, #CC0000 0%, #660000 100%)' }}
          >
            <p className="text-white font-bold italic text-[18px] sm:text-[20px] tracking-wide">
              UNBEATABLE DEALS!
            </p>
            <div className="hidden sm:flex items-center gap-6">
              {[
                { Icon: FiShield, label: '100% Genuine Products' },
                { Icon: FiRefreshCw, label: 'Easy Returns & Refund' },
                { Icon: FiTruck, label: 'Free Shipping on Orders above Rs. 10000' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-white text-[12px]">
                  <Icon size={14} className="text-[#FFB700]" aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {validFlashSaleProducts.length > 0 && (
        <div style={{ background: 'linear-gradient(180deg, #7e0707 0%, #520c0c 100%)' }}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6">
            <div
              className="flex items-center justify-between px-5 py-3 mb-5 rounded-[10px]"
              style={{ background: 'linear-gradient(90deg, #C20404 60%, #FF5312 100%)' }}
            >
              <div className="flex items-center gap-2">
                <FiZap size={18} className="text-[#FFB700]" aria-hidden="true" />
                <div>
                  <span className="text-white font-bold text-[16px]">Top Flash Deals</span>
                  <span className="text-white/70 text-[12px] ml-2">Limited Time Offer</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => scroll(-1)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  aria-label="Scroll left"
                >
                  <FiChevronLeft size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={() => scroll(1)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  aria-label="Scroll right"
                >
                  <FiChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              role="list"
              aria-label="Top flash deals"
            >
              {validFlashSaleProducts.map((p) => (
                <div key={p._id} role="listitem" className="w-[183px] flex-shrink-0 flex">
                  <TopDealCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8">
        {loading ? (
          <PageSpinner />
        ) : flashSale.length === 0 ? (
          <div className="text-center py-16 text-gray-400" role="status">
            <p className="text-5xl mb-4" aria-hidden="true">⚡</p>
            <p className="font-medium">No flash sale products at the moment</p>
            <p className="text-sm mt-1">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <div className="flex gap-6">
            <aside className="hidden lg:block w-[200px] flex-shrink-0" aria-label="Product filters">
              <div className="border border-[#E9E9E9] rounded-[10px] overflow-hidden">
                <div className="border-b border-[#E9E9E9] px-4 py-3">
                  <h3 className="text-[13px] font-bold text-[#1A1A1A] mb-2">Categories</h3>
                  <div className="space-y-0.5">
                    {validCategories.map((c) => (
                      <FilterCheck
                        key={c._id}
                        label={c.name}
                        count={catCounts[c._id] || 0}
                        checked={selectedCats.includes(c._id)}
                        onChange={() => toggleCat(c._id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-b border-[#E9E9E9] px-4 py-3">
                  <h3 className="text-[13px] font-bold text-[#1A1A1A] mb-3">Price Range</h3>
                  <div className="flex justify-between text-[11px] text-gray-500 mb-2">
                    <span>Rs. {priceRange[0].toLocaleString()}</span>
                    <span>Rs. {priceRange[1].toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full accent-[#FFB700]"
                    aria-label={`Maximum price: Rs. ${priceRange[1].toLocaleString()}`}
                  />
                </div>

                <div className="px-4 py-3">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-[#FFB700] text-black text-[12px] font-bold py-2 rounded-[6px] hover:bg-amber-500 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </aside>

            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[18px] font-bold text-[#1A1A1A]">All Flash Sale Products</h2>
                  <p className="text-[12px] text-gray-400">{filtered.length} products</p>
                </div>
                <label className="sr-only" htmlFor="flash-sort">Sort products</label>
                <select
                  id="flash-sort"
                  value={sort}
                  onChange={handleSortChange}
                  className="border border-[#E9E9E9] rounded-[6px] text-[13px] px-3 py-2 outline-none text-[#1A1A1A] bg-white"
                >
                  <option value="popularity">Sort By: Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div
  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
  role="list"
  aria-label="Flash sale products"
>
  {paginated.map((p) => (
    <div key={p._id} role="listitem" className="w-full flex">
      <TopDealCard product={p} /> 
    </div>
  ))}
</div>

              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-[13px] border border-[#E9E9E9] rounded hover:border-[#FFB700] disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-label={`Page ${n}`}
                      aria-current={page === n ? 'page' : undefined}
                      className={`w-8 h-8 text-[13px] rounded border ${
                        page === n
                          ? 'bg-[#FFB700] border-[#FFB700] text-black font-bold'
                          : 'border-[#E9E9E9] hover:border-[#FFB700]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  {totalPages > 6 && <span className="px-1 text-gray-400" aria-hidden="true">...</span>}
                  {totalPages > 6 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      aria-label={`Page ${totalPages}`}
                      className="w-8 h-8 text-[13px] rounded border border-[#E9E9E9] hover:border-[#FFB700]"
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-[13px] border border-[#E9E9E9] rounded hover:border-[#FFB700] disabled:opacity-40"
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}