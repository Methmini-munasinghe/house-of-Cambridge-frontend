import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice.js';
import { toggleWishlist } from '../../redux/slices/userSlice.js';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

function HeartIcon({ filled }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? '#e53535' : 'none'}
      stroke={filled ? '#e53535' : '#999'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        display: 'block',
        transition: 'fill 0.2s, stroke 0.2s, transform 0.15s',
        transform: filled ? 'scale(1.15)' : 'scale(1)',
      }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { wishlist }        = useSelector((s) => s.user);

  const isWishlisted = wishlist.some((p) => (p._id || p) === product._id);

  const price         = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;
  const discountPct   = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  const logoSrc   = product.seller?.logo || product.shop?.logo || product.seller?.avatar?.url || product.shop?.avatar?.url || null;
  const sellerName = product.seller?.name || product.shop?.name || null;

  const handleBuyNow = (e) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    navigate('/checkout');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    dispatch(toggleWishlist(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const inStock = product.stock > 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-white rounded-[10px] border border-[#E9E9E9] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 overflow-hidden relative"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {logoSrc && (
          <div className="absolute top-2 left-2 z-20 w-9 h-9 rounded-full bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
            <img src={logoSrc} alt={sellerName || 'Seller'} className="w-full h-full object-cover" />
          </div>
        )}

        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 z-20 w-[34px] h-[34px] rounded-full flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.14)] transition-all duration-150 active:scale-90 ${
            isWishlisted ? 'bg-red-50 hover:bg-red-100' : 'bg-white/90 hover:bg-red-50'
          }`}
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-20">
          {product.isFlashSale && (
            <span className="bg-[#FFB700] text-[#5a3a00] text-[10px] font-bold px-2 py-0.5 rounded leading-tight shadow-sm">
              Flash Sale
            </span>
          )}
          {discountPct > 0 && !product.isFlashSale && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded leading-tight shadow-sm">
              -{discountPct}%
            </span>
          )}
        </div>

        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-white font-bold text-xs bg-black/70 px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-0.5 mb-1.5" aria-label={`Rating: ${product.ratings ?? 0} out of 5`}>
          {[1, 2, 3, 4, 5].map((s) => (
            <FaStar
              key={s}
              size={10}
              className={s <= Math.round(product.ratings ?? 0) ? 'text-[#FFB700]' : 'text-gray-200'}
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({product.numReviews ?? 0})</span>
        </div>

        <h3 className="text-[13px] font-medium text-[#1A1A1A] line-clamp-2 mb-2 leading-snug min-h-[36px]">
          {product.name}
        </h3>

        <div className="mb-2.5 flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-[#171C26]">Rs. {price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-[11px] text-gray-400 line-through">Rs. {originalPrice.toLocaleString()}</span>
          )}
        </div>

        {inStock ? (
          <button
            onClick={handleBuyNow}
            className="w-full bg-[#FFB700] text-black text-[12px] font-semibold py-1.5 rounded-sm hover:bg-amber-500 transition-colors"
          >
            Buy Now
          </button>
        ) : (
          <div className="w-full text-center text-[12px] text-gray-400 py-1.5 border border-gray-200 rounded-[4px]">
            Out of Stock
          </div>
        )}
      </div>
    </Link>
  );
}