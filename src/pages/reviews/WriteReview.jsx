import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import { createReview } from '../../redux/slices/productSlice';
import Layout from '../../components/common/Layout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FiStar, FiCamera, FiX, FiCheck, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const INPUT_CLS = 'w-full border border-[#C5C5C5] rounded-[6px] px-3 py-2.5 text-[13px] outline-none focus:border-[#FFB700] bg-[#FAFAFA]';

const MAX_PHOTOS    = 5;
const MAX_PHOTO_MB  = 5 * 1024 * 1024;
const MAX_BODY_CHARS = 1000;

function StarRating({ value, onChange, size = 32 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n !== 1 ? 's' : ''} — ${RATING_LABELS[n]}`}
          aria-pressed={value === n}
          className="transition-transform hover:scale-110"
        >
          <FiStar
            size={size}
            aria-hidden="true"
            className={`transition-colors ${n <= display ? 'fill-[#FFB700] text-[#FFB700]' : 'text-[#D5D5D5]'}`}
          />
        </button>
      ))}
    </div>
  );
}

function formatOrderId(id) {
  if (!id) return '';
  return `#DFC-${new Date().getFullYear()}-${id.slice(-8).toUpperCase()}`;
}

function fmtDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-LK', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function WriteReview() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { orders }               = useSelector((s) => s.orders);
  const { loading: reviewLoading } = useSelector((s) => s.products);
  const fileInputRef = useRef(null);

  const [activeProductId, setActiveProductId] = useState(productId || null);
  const [rating,     setRating]     = useState(0);
  const [title,      setTitle]      = useState('');
  const [body,       setBody]       = useState('');
  const [photos,     setPhotos]     = useState([]);
  const [confirmed,  setConfirmed]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const pendingItems = [];
  (orders || []).forEach((order) => {
    if (order.orderStatus === 'delivered') {
      (order.items || []).forEach((item) => {
        if (!item.isReviewed) {
          pendingItems.push({
            productId:   item.product?._id || item.product,
            name:        item.name || item.product?.name,
            image:       item.image || item.product?.images?.[0]?.url,
            price:       item.price,
            orderId:     order._id,
            orderNum:    formatOrderId(order._id),
            purchasedAt: order.deliveredAt || order.updatedAt,
          });
        }
      });
    }
  });

  const activeItem = pendingItems.find((i) => i.productId === activeProductId) || pendingItems[0] || null;

  const selectItem = useCallback((pid) => {
    setActiveProductId(pid);
    setRating(0);
    setTitle('');
    setBody('');
    setPhotos([]);
  }, []);

  const handlePhotoAdd = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > MAX_PHOTOS) return toast.error(`Max ${MAX_PHOTOS} photos allowed`);
    setPhotos((prev) => [...prev, ...files.filter((f) => f.size <= MAX_PHOTO_MB)]);
  }, [photos.length]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => ['image/jpeg', 'image/png'].includes(f.type) && f.size <= MAX_PHOTO_MB
    );
    if (photos.length + files.length > MAX_PHOTOS) return toast.error(`Max ${MAX_PHOTOS} photos`);
    setPhotos((prev) => [...prev, ...files]);
  }, [photos.length]);

  const removePhoto = useCallback((index) => {
    setPhotos((prev) => prev.filter((_, j) => j !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!rating)      return toast.error('Please select a rating');
    if (!body.trim()) return toast.error('Please write your review');
    if (!confirmed)   return toast.error('Please confirm your review is genuine');
    if (!activeItem)  return toast.error('No product selected');

    setSubmitting(true);
    const action = await dispatch(createReview({
      id:   activeItem.productId,
      data: { rating, title, comment: body },
    }));
    setSubmitting(false);

    if (action.meta.requestStatus === 'fulfilled') {
      navigate('/review-submitted');
    } else {
      toast.error(action.payload || 'Failed to submit review');
    }
  }, [rating, body, confirmed, activeItem, dispatch, title, navigate]);

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 py-2">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Add Review' }]} />
      </div>

      <main className="max-w-[900px] mx-auto px-4 pb-14">

        <div className="mb-4">
          <h1 className="text-[20px] font-black text-[#1A1A1A]">Write a Review</h1>
          <p className="text-[12px] text-[#60717B]">
            Share your experience to help other shoppers. Earn 20 loyalty points per verified review!
          </p>
        </div>

        {pendingItems.length > 0 && (
          <section
            className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-4"
            aria-label="Pending reviews"
          >
            <div className="px-5 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA]">
              <p className="text-[12px] font-black text-[#60717B] uppercase tracking-wider">
                Pending Reviews ({pendingItems.length} Item{pendingItems.length !== 1 ? 's' : ''} Awaiting Review)
              </p>
            </div>
            <ul className="divide-y divide-[#F5F5F5]" role="list">
              {pendingItems.map((item) => (
                <li
                  key={item.productId}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${activeProductId === item.productId ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                >
                  <img
                    src={item.image || 'https://placehold.co/56?text=P'}
                    alt=""
                    className="w-12 h-12 object-cover rounded-[6px] border border-[#E9E9E9] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#60717B]">
                      Purchased: {fmtDate(item.purchasedAt)} · Order {item.orderNum}
                    </p>
                  </div>
                  <button
                    onClick={() => selectItem(item.productId)}
                    aria-label={`Write a review for ${item.name}`}
                    aria-pressed={activeProductId === item.productId}
                    className="flex items-center gap-1 text-[12px] text-[#FFB700] font-bold hover:text-amber-600 transition-colors whitespace-nowrap"
                  >
                    Review Now <FiArrowRight size={12} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]"
          aria-label="Review form"
        >
          {activeItem && (
            <div className="px-5 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA]">
              <p className="text-[11px] text-[#60717B]">
                Reviewing: <span className="font-semibold text-[#1A1A1A]">{activeItem.name}</span>
              </p>
            </div>
          )}

          <div className="p-5">

            {activeItem && (
              <div className="flex items-center gap-3 p-3.5 border border-[#E9E9E9] rounded-[8px] mb-5 bg-[#FAFAFA]">
                <img
                  src={activeItem.image || 'https://placehold.co/64?text=P'}
                  alt=""
                  className="w-16 h-16 object-cover rounded-[6px] border border-[#E9E9E9] flex-shrink-0"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A] mb-0.5">{activeItem.name}</p>
                  <p className="text-[11px] text-[#60717B]">Purchased: {fmtDate(activeItem.purchasedAt)}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <FiCheck size={9} strokeWidth={3} aria-hidden="true" /> Verified Purchase
                  </span>
                </div>
              </div>
            )}

            {!activeItem && pendingItems.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[14px] text-[#60717B] mb-2">No items awaiting review.</p>
                <p className="text-[12px] text-[#60717B]">Items become reviewable after your order is delivered.</p>
                <Link to="/orders" className="inline-block mt-4 text-[13px] text-[#FFB700] font-bold hover:underline">
                  View My Orders
                </Link>
              </div>
            )}

            {(activeItem || pendingItems.length === 0) && (
              <>
                <div className="mb-5">
                  <label className="block text-[12px] font-semibold text-[#1A1A1A] mb-2" id="rating-label">
                    Overall Rating <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <StarRating value={rating} onChange={setRating} size={36} />
                  {rating > 0 && (
                    <p className="text-[12px] text-[#60717B] mt-1.5" aria-live="polite">
                      {rating} out of 5 — <span className="font-semibold">{RATING_LABELS[rating]}</span>
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="review-title" className="block text-[12px] font-semibold text-[#1A1A1A] mb-1.5">
                    Review Title <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarise your experience in a few words"
                    maxLength={120}
                    className={INPUT_CLS}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="review-body" className="block text-[12px] font-semibold text-[#1A1A1A] mb-1.5">
                    Your Review <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="review-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY_CHARS))}
                    rows={5}
                    placeholder="Tell us what you liked or disliked about this product..."
                    className="w-full border border-[#C5C5C5] rounded-[6px] px-3 py-2.5 text-[13px] outline-none focus:border-[#FFB700] bg-[#FAFAFA] resize-none"
                  />
                  <p className="text-right text-[11px] text-[#C5C5C5] mt-1" aria-live="polite">
                    {body.length} / {MAX_BODY_CHARS} characters
                  </p>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload photos for your review"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-[#C5C5C5] rounded-[8px] px-5 py-7 text-center cursor-pointer hover:border-[#FFB700] hover:bg-amber-50/30 transition-colors mb-4"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handlePhotoAdd}
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <FiCamera size={26} className="mx-auto mb-2 text-[#C5C5C5]" aria-hidden="true" />
                  <p className="text-[12px] font-medium text-[#60717B] mb-0.5">Add photos to your review (optional)</p>
                  <p className="text-[10px] text-[#C5C5C5]">
                    JPG, PNG · Max {MAX_PHOTOS} photos · 5MB each · Earn 10 bonus points for photo reviews!
                  </p>
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {photos.map((f, i) => (
                        <div key={i} className="relative">
                          <img
                            src={URL.createObjectURL(f)}
                            alt={`Preview ${i + 1}`}
                            className="w-16 h-16 object-cover rounded-[6px] border border-[#E9E9E9]"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                            aria-label={`Remove photo ${i + 1}`}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <FiX size={10} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2.5 mb-5">
                  <input
                    type="checkbox"
                    id="genuine"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="accent-[#FFB700] w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <label htmlFor="genuine" className="text-[12px] text-[#60717B] cursor-pointer leading-relaxed">
                    I confirm this review is based on my genuine experience with this product.
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || reviewLoading}
                    aria-busy={submitting || reviewLoading}
                    className="bg-[#FFB700] text-black font-bold text-[13px] px-8 py-3 rounded-[6px] hover:bg-amber-500 transition-colors disabled:opacity-60"
                  >
                    {submitting || reviewLoading ? 'Submitting…' : 'Submit Your Review'}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}