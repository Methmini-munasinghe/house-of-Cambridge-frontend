import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FiStar } from 'react-icons/fi';

function ThankYouIllustration() {
  return (
    <div className="flex justify-center mb-6">
      <img
        src="/images/reviews/review-thankyou.png"
        alt="Thank you for your feedback"
        className="max-w-[420px] w-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling.style.display = 'flex';
        }}
      />
      <div className="hidden flex-col items-center justify-center" style={{ minHeight: 260 }} aria-hidden="true">
        <svg width="320" height="240" viewBox="0 0 320 240" fill="none" role="img" aria-label="Thank you illustration">
          <rect x="50" y="60" width="180" height="120" rx="8" fill="#E9E9E9" />
          <rect x="58" y="68" width="164" height="104" rx="4" fill="#1A1A1A" />
          <rect x="66" y="76" width="148" height="88" rx="3" fill="white" />
          <text x="140" y="105" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1A1A1A">THANK YOU</text>
          <text x="140" y="118" textAnchor="middle" fontSize="9" fill="#60717B">FOR YOUR</text>
          <text x="140" y="132" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFB700">FEEDBACK</text>
          {[0, 1, 2, 3].map((i) => (
            <text key={i} x={118 + i * 16} y="148" fontSize="12" fill="#FFB700">★</text>
          ))}
          <text x="182" y="148" fontSize="12" fill="#D5D5D5">★</text>
          <rect x="30" y="180" width="240" height="12" rx="4" fill="#C5C5C5" />
          <rect x="120" y="190" width="80" height="5" rx="2.5" fill="#B0B0B0" />
          <rect x="18" y="140" width="8" height="40" rx="4" fill="#888" />
          <ellipse cx="22" cy="130" rx="14" ry="20" fill="#A0A040" opacity="0.7" />
          <ellipse cx="10" cy="120" rx="10" ry="16" fill="#B8B840" opacity="0.6" />
          <rect x="290" y="140" width="8" height="40" rx="4" fill="#888" />
          <ellipse cx="294" cy="130" rx="14" ry="20" fill="#A0A040" opacity="0.7" />
          <ellipse cx="306" cy="120" rx="10" ry="16" fill="#B8B840" opacity="0.6" />
          <circle cx="260" cy="75" r="18" fill="#F5C6A0" />
          <rect x="242" y="92" width="36" height="55" rx="8" fill="#F5A623" />
          <rect x="240" y="100" width="8" height="40" rx="4" fill="#F5C6A0" />
          <rect x="270" y="100" width="8" height="40" rx="4" fill="#F5C6A0" />
          <rect x="248" y="145" width="12" height="30" rx="5" fill="#1A1A1A" />
          <rect x="262" y="145" width="12" height="30" rx="5" fill="#1A1A1A" />
        </svg>
      </div>
    </div>
  );
}

export default function ReviewSubmitted() {
  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 py-2">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Add Review' }]} />
      </div>

      <main className="max-w-[900px] mx-auto px-4 pb-14">
        <div className="bg-white border border-[#E9E9E9] rounded-[10px] shadow-[2px_3px_8px_rgba(0,0,0,0.04)] px-8 py-12">

          <ThankYouIllustration />

          <div className="border-t border-[#E9E9E9] mb-8 max-w-[500px] mx-auto" role="separator" />

          <div className="text-center">
            <h1 className="text-[22px] font-black text-[#1A1A1A] mb-2">
              Thank You for Your Review!
            </h1>
            <p className="text-[13px] text-[#60717B] max-w-[420px] mx-auto mb-8 leading-relaxed">
              Your review has been submitted and is pending moderation. It will appear on the product
              page within 24 hours once approved by our team.
            </p>

            <div
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-5 py-2 mb-8"
              role="status"
              aria-label="20 loyalty points added to your account"
            >
              <FiStar size={14} className="text-[#FFB700] fill-[#FFB700]" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-amber-800">
                20 loyalty points have been added to your account!
              </span>
            </div>

            <nav className="flex flex-wrap gap-3 justify-center" aria-label="Next steps">
              <Link
                to="/shop"
                className="border border-[#C5C5C5] text-[#1A1A1A] font-bold text-[13px] px-7 py-3 rounded-[8px] hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                to="/add-review"
                className="bg-[#FFB700] text-black font-bold text-[13px] px-7 py-3 rounded-[8px] hover:bg-amber-500 transition-colors"
              >
                Write Another Review
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </Layout>
  );
}