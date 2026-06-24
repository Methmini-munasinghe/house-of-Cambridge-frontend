import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { FaBolt, FaStar } from 'react-icons/fa';

export default function MobileHome({
  slide,
  cur,
  HERO_SLIDES,
  goSlide,
  FEATURES,
  STATIC_CATS,
  flashSale,
  MAX_FLASH_CARDS,
  popular,
  homeNewArrivals,
  beautyProducts,
  electronicsProducts,
  BRAND_LOGOS,
  FlashCountdown,
  FlashCardSkeleton,
  ProductRowSkeleton
}) {
  return (
    <div className="w-full bg-white pb-12 font-sans overflow-x-hidden max-w-[480px] mx-auto">
      
      {/* 1. ── HERO PROMOTIONAL SLIDER ── */}
      <section className="relative overflow-hidden w-full min-h-[200px] bg-gray-900" aria-label="Hero Carousel">
        <div 
          className="w-full min-h-[200px] bg-cover bg-center transition-all duration-500 relative flex items-center px-6 py-6"
          style={{ backgroundImage: `url(${cur.image})` }}
        >
          <div className="absolute inset-0 bg-black/10 z-0" />
          <div className="relative z-10 max-w-[240px] text-left">
            <p className="text-white text-[10px] font-bold uppercase tracking-wider mb-0.5">{cur.title}</p>
            <h1 className="text-[#FFB700] text-[22px] font-black leading-tight whitespace-pre-line mb-2 drop-shadow-sm">
              {cur.highlight}
            </h1>
            <p className="text-white text-xs mb-3">
              {cur.sub} <span className="text-[#FFB700] font-black">{cur.subHighlight}</span> {cur.subEnd}
            </p>
            <Link 
              to="/shop" 
              className="bg-[#FFB700] text-black text-[10px] font-extrabold px-4 py-1.5 rounded-full inline-block uppercase tracking-wider shadow"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Bullet Slide Indicators */}
        <div className="absolute bottom-3 left-6 flex gap-1 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goSlide(i)}
              className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-4 bg-[#FFB700]' : 'w-1.5 bg-white/40'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. ── MARKETING FEATURES BAR (Horizontal Inset Scroll) ── */}
      <section className="bg-white border-b border-gray-100 overflow-x-auto w-full py-4 px-4 scrollbar-none" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-6 whitespace-nowrap min-w-max">
          {FEATURES.map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="p-1.5 bg-[#FEF2E4] rounded-lg scale-90 flex-shrink-0">{icon}</div>
              <div>
                <p className="text-[12px] font-black text-[#1A1A1A] leading-tight">{title}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ── FLASH SALE ROW (Horizontal Swipe Grid matching image_9ca826.png) ── */}
      <section className="py-4 px-4 bg-white">
        <div 
          style={{ background: 'linear-gradient(135deg, #C20404 0%, #FF5312 100%)' }}
          className="p-4 rounded-xl shadow-lg w-full"
        >
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FFB700] text-black flex items-center justify-center"><FaBolt size={14} /></div>
              <div>
                <h2 className="text-white text-[15px] font-black tracking-wider leading-none">FLASH SALE</h2>
                <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-0.5">Limited Offer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FlashCountdown endsAt={flashSale[0]?.flashSaleEnds} />
              <Link to="/flash-sale" className="text-white text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded border border-white/20">
                All →
              </Link>
            </div>
          </div>

          {/* Horizontal Swiping Container for Flash Sale Products */}
          {flashSale.length > 0 ? (
            <div 
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth" 
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {flashSale.slice(0, MAX_FLASH_CARDS).map((p) => {
                const price = Number(p.flashSalePrice || p.discountPrice || p.price);
                const original = Number(p.price);
                const pct = original > price ? Math.round((1 - price / original) * 100) : 0;
                
                return (
                  <div key={p._id} className="w-[140px] flex-shrink-0 bg-white rounded-lg p-2.5 flex flex-col h-full shadow-sm">
                    <Link to={`/product/${p._id}`} className="flex flex-col h-full">
                      <div className="relative aspect-square bg-gray-50 rounded-md overflow-hidden">
                        <img src={p.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                        {pct > 0 && (
                          <span className="absolute top-1 left-1 bg-[#E70D0D] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                            -{pct}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#1A1A1A] line-clamp-2 mt-2 leading-tight min-h-[28px]">
                        {p.name}
                      </p>
                      <div className="flex gap-0.5 my-1">
                        {[1,2,3,4,5].map((s) => <FaStar key={s} size={7} className="text-[#FFB700]" />)}
                      </div>
                      <div className="mt-auto pt-1 flex flex-col">
                        <span className="text-[9px] text-gray-400 line-through">Rs.{original.toLocaleString()}</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[12px] font-black text-[#E70D0D]">Rs.{price.toLocaleString()}</span>
                          <div className="w-5 h-5 rounded-full bg-[#FFB700] text-black flex items-center justify-center text-[10px]">🛒</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <FlashCardSkeleton />
          )}
        </div>
      </section>

      {/* 4. ── SHOP BY CATEGORY (Rounded Square Boxes matching image_9ca826.png) ── */}
      <section className="py-4 bg-white border-y border-gray-100">
        <div className="px-4 mb-3">
          <h3 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wider">Shop By Category</h3>
        </div>
        <div 
          className="flex gap-3.5 px-4 overflow-x-auto pb-2 scrollbar-none" 
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {STATIC_CATS.map((cat) => (
            <Link 
              key={cat.slug} 
              to={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="w-[92px] flex-shrink-0 flex flex-col items-center gap-2 p-2 bg-white border border-gray-100 rounded-xl shadow-2xs"
            >
              <div 
                className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: cat.bg }}
              >
                <img src={cat.img} alt="" className="w-[75%] h-[75%] object-contain" />
              </div>
              <span className="text-[10px] font-black text-[#1A1A1A] text-center leading-tight line-clamp-2 min-h-[24px]">
                {cat.label.replace('\n', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. ── PRODUCT HORIZONTAL FEED SWIPERS (Popular / New Arrivals Rows) ── */}
      {[
        { title: 'Popular Products', data: popular },
        { title: 'New Arrivals', data: homeNewArrivals },
        { title: 'Beauty & Cosmetics', data: beautyProducts },
        { title: 'Electronic Appliances', data: electronicsProducts }
      ].map((row) => (
        <section key={row.title} className="bg-white py-4 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wider">{row.title}</h3>
            <Link to="/shop" className="text-[11px] font-bold text-[#FFB700] underline">View All</Link>
          </div>
          
          {row.data.length > 0 ? (
            <div 
              className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-none" 
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {row.data.map((p) => (
                <div key={p._id} className="w-[140px] flex-shrink-0 bg-white border border-gray-100 rounded-xl p-2.5 shadow-3xs">
                  <Link to={`/product/${p._id}`}>
                    <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                      <img src={p.images?.[0]?.url || 'https://placehold.co/150'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[11px] font-bold text-[#1A1A1A] line-clamp-2 mt-2 leading-tight min-h-[28px]">{p.name}</p>
                    <div className="flex gap-0.5 my-1">
                      {[1,2,3,4,5].map((s) => <FaStar key={s} size={7} className="text-[#FFB700]" />)}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                      <span className="text-[12px] font-black text-[#1A1A1A]">Rs.{p.price?.toLocaleString()}</span>
                      <div className="w-5 h-5 rounded-full bg-[#FFB700] text-black flex items-center justify-center text-[10px]">🛒</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <ProductRowSkeleton />
          )}
        </section>
      ))}

      {/* 6. ── BRAND LOGOS SCROLL ── */}
      <section className="py-6 bg-white text-center">
        <h4 className="text-[12px] font-black uppercase tracking-wider text-gray-400 mb-4">Trusted By Top Brands</h4>
        <div className="overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-8 px-6 items-center min-w-max">
            {BRAND_LOGOS.slice(0, 6).map((src, i) => (
              <img key={i} src={src} alt="" className="h-5 object-contain opacity-50" />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}