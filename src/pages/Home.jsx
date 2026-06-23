import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaTruck, FaUndo, FaLock, FaMedal, FaStar, FaBolt } from 'react-icons/fa';
import {
  fetchFlashSaleProducts,
  fetchCategories,
  fetchPopularProducts,
  fetchHomeNewArrivals,
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';   
import api from '../redux/api/axiosInstance';
import ProductCard from '../components/ui/ProductCard';
import Layout from '../components/common/Layout';

const HERO_SLIDES = [
  {
    title:        'HOME APPLIANCE',
    highlight:    'SMART DEALS,\nBETTER LIVING!',
    sub:          'Up to',
    subHighlight: '45% OFF',
    subEnd:       'On Top Brands',
    image:        '/images/hero-slide-1-7a4bbd.png',
  },
  {
    title:        'BEAUTY DEALS',
    highlight:    'GLOW MORE,\nSAVE MORE!',
    sub:          'Up to',
    subHighlight: '40% OFF',
    subEnd:       'On Top Brands',
    image:        '/images/hero-slide-2.png',
  },
  {
    title:        'SELF CARE\nSTARTS HERE',
    highlight:    'PAMPER YOURSELF\nEVERYDAY!',
    sub:          'Up to',
    subHighlight: '40% OFF',
    subEnd:       'On Top Brands',
    image:        '/images/hero-slide-3-6a4322.png',
  },
];

const STATIC_CATS = [
  { label: 'Beauty and\nCosmetics', bg: '#ABFFDF',              img: '/images/categories/cat-beauty-1627cd.png',          slug: 'beauty'           },
  { label: 'Computers &\nPrinters', bg: '#CBFAFF',              img: '/images/categories/cat-computers-3b5a07.png',       slug: 'computers'        },
  { label: 'Electronics',           bg: '#FFD4F0',              img: '/images/categories/cat-electronics-4ce300.png',     slug: 'electronics'      },
  { label: 'Home\nAppliances',      bg: '#DDDFFF',              img: '/images/categories/cat-home-appliances-1ae981.png', slug: 'home-appliances'  },
  { label: 'Baby Care',             bg: 'rgba(255,146,118,0.35)', img: '/images/categories/cat-baby-care-211669.png',     slug: 'baby-care'        },
];

const BRAND_LOGOS = [
  '/images/about/brand-logo-1.png',
  '/images/about/brand-logo-2-490804.png',
  '/images/about/brand-logo-3.png',
  '/images/about/brand-logo-4.png',
  '/images/about/brand-logo-5.png',
  '/images/about/brand-logo-6-344f7d.png',
  '/images/about/brand-logo-7.png',
  '/images/about/brand-logo-8-25d535.png',
  '/images/about/brand-logo-9-7959ba.png',
  '/images/about/brand-logo-10-465f37.png',
];

const FEATURES = [
  { icon: <FaTruck size={26} className="text-[#FFB700]" aria-hidden="true" />, title: 'Free Shipping',  sub: 'When ordering over Rs.10000'  },
  { icon: <FaUndo  size={22} className="text-[#FFB700]" aria-hidden="true" />, title: 'Free Return',    sub: 'Get return within 30 days'    },
  { icon: <FaLock  size={22} className="text-[#FFB700]" aria-hidden="true" />, title: 'Secure Payment', sub: '100% secure online payment'   },
  { icon: <FaMedal size={24} className="text-[#FFB700]" aria-hidden="true" />, title: 'Best Quality',   sub: 'Original product guaranteed'  },
];

const SKELETON_COUNT  = 6;
const HERO_INTERVAL   = 5000;
const SCROLL_STEP     = 220;
const MAX_FLASH_CARDS = 6;
const MAX_CATEGORY_PRODUCTS = 8;
const FLASH_SALE_FALLBACK_HOURS = 3;

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return isFinite(n) ? n : fallback;
}

function FlashCountdown({ endsAt }) {
  const calcRemaining = useCallback(() => {
    const fallbackEnd = new Date(Date.now() + FLASH_SALE_FALLBACK_HOURS * 3_600_000);
    const end  = endsAt ? new Date(endsAt) : fallbackEnd;
    const diff = Math.max(0, end - Date.now());
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  }, [endsAt]);

  const [t, setT] = useState(calcRemaining);

  useEffect(() => {
    const id = setInterval(() => setT(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, [calcRemaining]);

  const pad = (n) => String(n).padStart(2, '0');

  const TimeBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div
        className="bg-white/20 text-white font-black text-2xl w-12 h-12 flex items-center justify-center rounded-lg"
        aria-label={`${value} ${label}`}
      >
        {pad(value)}
      </div>
    </div>
  );

  return (
    <div
      className="flex items-center gap-1.5"
      role="timer"
      aria-label="Flash sale ends in"
      aria-live="off"
    >
      <TimeBox value={t.h} label="hours" />
      <span className="text-white text-2xl font-black leading-none mb-1" aria-hidden="true">:</span>
      <TimeBox value={t.m} label="minutes" />
      <span className="text-white text-2xl font-black leading-none mb-1" aria-hidden="true">:</span>
      <TimeBox value={t.s} label="seconds" />
    </div>
  );
}

function ProductRow({ products, label }) {
  const rowRef = useRef(null);

  const scroll = useCallback((dir) => {
    rowRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label={`Scroll ${label || 'products'} left`}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full shadow items-center justify-center hover:border-[#FFB700] hover:text-[#FFB700] transition-colors"
      >
        <FiChevronLeft size={18} aria-hidden="true" />
      </button>
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        aria-label={label}
        role="list"
      >
        {products.map((p) => (
          <div key={p._id} className="w-[185px] flex-shrink-0" role="listitem">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label={`Scroll ${label || 'products'} right`}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full shadow items-center justify-center hover:border-[#FFB700] hover:text-[#FFB700] transition-colors"
      >
        <FiChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

function ProductRowSkeleton() {
  return (
    <div className="flex gap-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="w-[185px] h-[280px] flex-shrink-0 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function SectionHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-4 md:mb-5">
      <h2 className="text-sm md:text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">{title}</h2>
      <Link
        to={to || '/shop'}
        className="text-xs font-semibold text-[#1A1A1A] border border-gray-300 px-3 py-1 rounded hover:border-[#FFB700] hover:text-[#FFB700] transition-colors"
      >
        View All
      </Link>
    </div>
  );
}
function FlashCard({ product }) {
  const dispatch = useDispatch();

  const price    = safeNum(product.flashSalePrice || product.discountPrice || product.price);
  const original = safeNum(product.price);
  const pct      = original > price ? Math.round((1 - price / original) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const toastId = toast.loading('Adding to cart...');

    dispatch(addToCart({ productId: product._id, quantity: 1 }))
      .then(() => {
        toast.success('Added to cart!', { id: toastId });
      })
      .catch(() => {
        toast.error('Failed to add to cart', { id: toastId });
      });
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/200x200?text=Product'}
          alt={product.name || 'Flash sale product'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
        />
        {pct > 0 && (
          <span className="absolute top-2 left-2 bg-[#E70D0D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{pct}%
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-1" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((s) => (
            <FaStar key={s} size={9} className="text-[#FFB700]" />
          ))}
        </div>
        <p className="text-[12px] font-medium text-[#1A1A1A] line-clamp-2 mb-1.5 flex-1">
          {product.name}
        </p>
        <div className="flex items-end justify-between mb-0.5 w-full">
          <div className="min-h-[20px] flex items-end">
            {pct > 0 && (
              <span className="text-[10px] text-gray-400 line-through">
                Rs. {original.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[14px] font-bold text-[#1A1A1A]">
            Rs. {price.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-[#FFB700] text-black text-[11px] font-semibold py-1.5 rounded hover:bg-[#e6a600] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}

function FlashCardSkeleton() {
  return (
    <div className="flex gap-3" aria-busy="true" aria-label="Loading flash sale products">
      {Array.from({ length: MAX_FLASH_CARDS }).map((_, i) => (
        <div key={i} className="bg-white/10 rounded-lg h-64 w-full animate-pulse flex-1" />
      ))}
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { flashSale, popular, homeNewArrivals, categories } = useSelector((s) => s.products);

  const [slide, setSlide]                       = useState(0);
  const [beautyProducts, setBeautyProducts]     = useState([]);
  const [electronicsProducts, setElectronicsProducts] = useState([]);

  const autoRef = useRef(null);

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(
      () => setSlide((p) => (p + 1) % HERO_SLIDES.length),
      HERO_INTERVAL,
    );
  }, []);

  const goSlide = useCallback((i) => {
    setSlide(i);
    startAuto();
  }, [startAuto]);

  useEffect(() => {
    dispatch(fetchFlashSaleProducts());
    dispatch(fetchPopularProducts());
    dispatch(fetchHomeNewArrivals());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, [startAuto]);

  useEffect(() => {
    if (!categories || categories.length === 0) return;

    let cancelled = false;

    const beautyId = categories.find((c) => c.name.toLowerCase().includes('beauty'))?._id;
    const electronicsId = categories.find((c) => c.name.toLowerCase().includes('electronic'))?._id;

    if (beautyId) {
      api.get('/products', { params: { category: beautyId, limit: MAX_CATEGORY_PRODUCTS } })
        .then((res) => { if (!cancelled) setBeautyProducts(res.data.products || []); })
        .catch(() => {});
    }
    if (electronicsId) {
      api.get('/products', { params: { category: electronicsId, limit: MAX_CATEGORY_PRODUCTS } })
        .then((res) => { if (!cancelled) setElectronicsProducts(res.data.products || []); })
        .catch(() => {});
    }

    return () => { cancelled = true; };
  }, [categories?.length]);

  const cur = HERO_SLIDES[slide];

  return (
    <Layout>

      <section
        className="relative overflow-hidden bg-gray-900"
        aria-label="Promotional hero carousel"
        aria-roledescription="carousel"
      >
        <div
          className="relative min-h-[437px] bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${cur.image})` }}
          role="img"
          aria-label={`${cur.title}: ${cur.highlight.replace('\n', ' ')}`}
        >
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative max-w-[1280px] mx-auto px-16 w-full py-16 min-h-[437px] flex items-center">
            <div className="max-w-lg">
              <p className="text-white text-2xl font-bold whitespace-pre-line mb-1">{cur.title}</p>
              <h1 className="text-[#FFB700] text-5xl font-black leading-tight whitespace-pre-line mb-4">
                {cur.highlight}
              </h1>
              <p className="text-white text-2xl mb-0.5">
                {cur.sub}{' '}
                <span className="text-[#FFB700] font-black">{cur.subHighlight}</span>
              </p>
              <p className="text-white/80 text-xl mb-8">{cur.subEnd}</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#FFB700] text-black px-8 py-2.5 rounded-full font-semibold text-base hover:bg-amber-500 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => goSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <FiChevronLeft size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goSlide((slide + 1) % HERO_SLIDES.length)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <FiChevronRight size={20} aria-hidden="true" />
        </button>

        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          role="tablist"
          aria-label="Slide indicators"
        >
          {HERO_SLIDES.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === slide}
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              onClick={() => goSlide(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === slide ? 'w-6 bg-[#FFB700]' : 'w-2.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      <section className="bg-white border-b border-gray-100" aria-label="Service highlights">
        <div className="max-w-[1280px] mx-auto px-4">
          <ul className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 list-none m-0 p-0">
            {FEATURES.map(({ icon, title, sub }) => (
              <li key={title} className="flex items-center gap-3 px-6 py-4">
                {icon}
                <div>
                  <p className="text-[13px] font-bold text-[#1A1A1A]">{title}</p>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        style={{ background: 'linear-gradient(90deg, #C20404 0%, #FF5312 100%)' }}
        className="py-6"
        aria-labelledby="flash-sale-heading"
      >
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <FaBolt className="text-[#FFB700]" size={18} aria-hidden="true" />
                <h2 id="flash-sale-heading" className="text-white text-2xl font-black tracking-widest">
                  FLASH SALE
                </h2>
              </div>
              <p className="text-white/70 text-xs mt-0.5">Limited Time Offer</p>
            </div>
            <FlashCountdown endsAt={flashSale[0]?.flashSaleEnds} />
            <Link
              to="/flash-sale"
              className="flex items-center gap-1 bg-white/10 border border-white/30 text-white text-sm px-4 py-2 rounded hover:bg-white/20 transition-colors"
            >
              View All Deals <FiChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {flashSale.length > 0 ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
              role="list"
              aria-label="Flash sale products"
            >
              {flashSale.slice(0, MAX_FLASH_CARDS).map((p) => (
            <div key={p._id} role="listitem" className="h-full">
                  <FlashCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <FlashCardSkeleton />
          )}
        </div>
      </section>

      <section className="py-8 bg-white" aria-labelledby="categories-heading">
        <div className="max-w-[1280px] mx-auto px-4">
          <h2 id="categories-heading" className="sr-only">Shop by Category</h2>
          <ul className="flex items-center justify-center gap-8 flex-wrap list-none m-0 p-0">
            {STATIC_CATS.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div
                    className="w-[120px] h-[120px] rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#FFB700] transition-all shadow-sm"
                    style={{ background: cat.bg }}
                    aria-hidden="true"
                  >
                    <img
                      src={cat.img}
                      alt=""
                      className="w-[80%] h-[80%] object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A] text-center whitespace-pre-line leading-tight group-hover:text-[#FFB700] transition-colors">
                    {cat.label.replace('\n', ' ')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-6" aria-labelledby="promo-banners-1-heading">
        <div className="max-w-[1280px] mx-auto px-4">
          <h2 id="promo-banners-1-heading" className="sr-only">Promotional offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                img: '/images/promo-banner-1.png',
                tag: 'Best Deals',
                title: 'BEST DEALS\nOF THE WEEK',
                to: '/shop',
              },
              {
                img: '/images/promo-banner-1.png',
                tag: 'Everyday Savings',
                title: 'SAVE MORE\nEVERYDAY',
                sub: 'at unbeatable prices',
                to: '/shop',
              },
              {
                img: '/images/promo-banner-3.png',
                tag: 'Just In',
                title: 'NEW ARRIVALS\nJUST LANDED!',
                sub: 'Check out the latest products',
                to: '/shop?newArrival=true',
              },
            ].map(({ img, tag, title, sub, to }) => (
              <div key={tag} className="rounded-xl overflow-hidden relative flex items-end min-h-[170px] shadow-sm">
                <img
                  src={img}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="relative p-5 z-10 w-full" style={{ background: 'rgba(0,0,0,0.45)' }}>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{tag}</p>
                  <h3 className="text-white font-black text-xl leading-tight mb-3 whitespace-pre-line">{title}</h3>
                  {sub && <p className="text-white/70 text-xs mb-3">{sub}</p>}
                  <Link to={to} className="inline-block bg-[#FFB700] text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-amber-500 transition-colors">
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-white" aria-labelledby="popular-heading">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <SectionHeader title="Popular Products" />
          <h2 id="popular-heading" className="sr-only">Popular Products</h2>
          {popular.length > 0
            ? <ProductRow products={popular} label="Popular products" />
            : <ProductRowSkeleton />
          }
        </div>
      </section>

      <section className="py-8 bg-gray-50" aria-labelledby="new-arrivals-heading">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <SectionHeader title="New Arrivals" />
          <h2 id="new-arrivals-heading" className="sr-only">New Arrivals</h2>
          {homeNewArrivals.length > 0
            ? <ProductRow products={homeNewArrivals} label="New arrivals" />
            : <ProductRowSkeleton />
          }
        </div>
      </section>

      <section className="bg-white py-6" aria-labelledby="sub-banners-heading">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <h2 id="sub-banners-heading" className="sr-only">Shop by department</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                img:   '/images/promo-banner-1.png',
                title: 'PREMIUM HOME\nAPPLIANCES',
                to:    '/shop?category=home-appliances',
              },
              {
                img:   '/images/promo-banner-1.png',
                title: 'LATEST GADGETS',
                sub:   'Great products at the best offers',
                to:    '/shop?category=electronics',
              },
              {
                img:   '/images/promo-banner-3.png',
                title: 'BEAUTY AND\nPERSONAL CARE',
                sub:   'Look good, feel great',
                to:    '/shop?category=beauty',
              },
            ].map(({ img, title, sub, to }) => (
              <div key={title} className="rounded-xl overflow-hidden relative flex items-end min-h-[130px] shadow-sm">
                <img
                  src={img}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="relative p-4 z-10 w-full" style={{ background: 'rgba(0,0,0,0.45)' }}>
                  <h3 className="text-white font-black text-base leading-tight mb-2 whitespace-pre-line">{title}</h3>
                  {sub && <p className="text-white/70 text-xs mb-2">{sub}</p>}
                  <Link to={to} className="inline-block bg-[#FFB700] text-black text-xs font-bold px-3 py-1.5 rounded hover:bg-amber-500 transition-colors">
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50" aria-labelledby="beauty-heading">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <SectionHeader title="Beauty and Cosmetics" to="/shop?category=beauty" />
          <h2 id="beauty-heading" className="sr-only">Beauty and Cosmetics</h2>
          {beautyProducts.length > 0
            ? <ProductRow products={beautyProducts} label="Beauty and cosmetics products" />
            : <ProductRowSkeleton />
          }
        </div>
      </section>

      <section className="py-8 bg-white" aria-labelledby="electronics-heading">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <SectionHeader title="Electronic Appliances" to="/shop?category=electronics" />
          <h2 id="electronics-heading" className="sr-only">Electronic Appliances</h2>
          {electronicsProducts.length > 0
            ? <ProductRow products={electronicsProducts} label="Electronic appliances" />
            : <ProductRowSkeleton />
          }
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-100" aria-labelledby="brands-heading">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-8">
            <h2 id="brands-heading" className="text-xl md:text-[28px] font-black">
              <span className="text-[#FFB700]">Trusted By </span>
              <span className="text-[#1A1A1A]">Top Brands</span>
            </h2>
          </div>
          <div className="overflow-hidden relative" aria-hidden="true">
            <div
              className="flex items-center gap-10 whitespace-nowrap"
              style={{ animation: 'marquee 28s linear infinite' }}
            >
              {[...BRAND_LOGOS, ...BRAND_LOGOS].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-9 object-contain flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
          .transition-transform { transition: none !important; }
          .animate-spin         { animation: none !important; }
          .animate-pulse        { animation: none !important; }
        }
      `}</style>

    </Layout>
  );
}