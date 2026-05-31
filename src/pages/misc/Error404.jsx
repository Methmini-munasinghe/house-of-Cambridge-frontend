import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';

const MAX_QUERY_LENGTH = 200;

function sanitizeQuery(value) {
  return value.replace(/[<>"'`]/g, '').slice(0, MAX_QUERY_LENGTH);
}

function Monster404Illustration() {
  return (
    <div className="relative flex items-end justify-center select-none mb-2" style={{ height: 220 }} aria-hidden="true">
      <svg width="110" height="180" viewBox="0 0 110 180" fill="none" className="relative z-10 mb-2">
        <ellipse cx="55" cy="172" rx="35" ry="8" fill="#E9E9E9" />
        <ellipse cx="55" cy="105" rx="42" ry="58" fill="#F5A623" />
        <circle cx="38" cy="92" r="7" fill="white" />
        <circle cx="72" cy="92" r="7" fill="white" />
        <circle cx="40" cy="94" r="3.5" fill="#1A1A1A" />
        <circle cx="74" cy="94" r="3.5" fill="#1A1A1A" />
        <path d="M42 114 Q55 105 68 114" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <line x1="55" y1="47" x2="55" y2="28" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" />
        <circle cx="55" cy="22" r="7" fill="#F5A623" />
        <ellipse cx="13" cy="100" rx="10" ry="14" fill="#F5A623" />
        <ellipse cx="97" cy="100" rx="10" ry="14" fill="#F5A623" />
        <path d="M13 130 Q0 148 10 162" stroke="#F5A623" strokeWidth="10" strokeLinecap="round" fill="none" />
        <rect x="0" y="156" width="20" height="14" rx="3" fill="#E53E3E" />
        <rect x="36" y="158" width="14" height="18" rx="6" fill="#F5A623" />
        <rect x="60" y="158" width="14" height="18" rx="6" fill="#F5A623" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center leading-none">
          <p className="text-[15px] font-bold text-[#60717B] tracking-[0.3em] mb-1">OOPS ...</p>
          <p className="font-black text-[#F5A623]" style={{ fontSize: 120, lineHeight: 1 }}>404</p>
        </div>
      </div>

      <svg width="110" height="175" viewBox="0 0 110 175" fill="none" className="relative z-10 mb-2">
        <ellipse cx="55" cy="168" rx="35" ry="8" fill="#E9E9E9" />
        <ellipse cx="55" cy="102" rx="42" ry="55" fill="#F5A623" />
        <circle cx="38" cy="90" r="7" fill="white" />
        <circle cx="72" cy="90" r="7" fill="white" />
        <circle cx="40" cy="92" r="3.5" fill="#1A1A1A" />
        <circle cx="74" cy="92" r="3.5" fill="#1A1A1A" />
        <path d="M42 110 Q55 102 68 110" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M35 52 L25 28 L50 48" fill="#F5A623" />
        <path d="M75 52 L85 28 L60 48" fill="#F5A623" />
        <ellipse cx="13" cy="98" rx="10" ry="14" fill="#F5A623" />
        <ellipse cx="97" cy="98" rx="10" ry="14" fill="#F5A623" />
        <path d="M97 128 Q112 145 100 160" stroke="#F5A623" strokeWidth="10" strokeLinecap="round" fill="none" />
        <rect x="36" y="152" width="14" height="18" rx="6" fill="#F5A623" />
        <rect x="60" y="152" width="14" height="18" rx="6" fill="#F5A623" />
      </svg>
    </div>
  );
}

export default function Error404() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(() => {
    const safe = sanitizeQuery(query).trim();
    if (safe) {
      navigate(`/shop?search=${encodeURIComponent(safe)}`);
    }
  }, [query, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handleChange = useCallback((e) => {
    setQuery(sanitizeQuery(e.target.value));
  }, []);

  const today = new Date().toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Layout>
      <main className="max-w-[1280px] mx-auto px-4 py-8 pb-14">
        <div className="bg-white border border-[#E9E9E9] rounded-[12px] shadow-[2px_4px_16px_rgba(0,0,0,0.05)] mx-auto max-w-[860px] px-6 py-12">

          <div className="flex justify-center mb-2">
            <Monster404Illustration />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-[28px] font-black text-[#1A1A1A] tracking-wide mb-3">
              PAGE NOT FOUND
            </h1>
            <p className="text-[13px] text-[#60717B] max-w-[520px] mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist, has been moved, or the URL may have been entered
              incorrectly. Try searching for what you need or browse our categories below.
            </p>
          </div>

          <div className="flex gap-2 max-w-[540px] mx-auto mb-6" role="search">
            <label htmlFor="search-404" className="sr-only">Search products</label>
            <input
              id="search-404"
              type="search"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Search for products, orders, or help topics..."
              maxLength={MAX_QUERY_LENGTH}
              className="flex-1 border border-[#C5C5C5] rounded-l-[6px] px-4 py-2.5 text-[13px] outline-none focus:border-[#FFB700] bg-[#FAFAFA]"
            />
            <button
              onClick={handleSearch}
              className="bg-[#FFB700] text-black font-bold text-[13px] px-6 py-2.5 rounded-r-[6px] hover:bg-amber-500 transition-colors"
            >
              Search
            </button>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="Recovery options">
            <Link
              to="/"
              className="bg-[#FFB700] text-black font-bold text-[13px] px-7 py-3 rounded-[8px] hover:bg-amber-500 transition-colors"
            >
              Go To Homepage
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 border border-[#C5C5C5] text-[#1A1A1A] font-bold text-[13px] px-7 py-3 rounded-[8px] hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft size={14} aria-hidden="true" /> Go Back
            </button>
            <Link
              to="/contact"
              className="flex items-center gap-2 border border-[#C5C5C5] text-[#1A1A1A] font-bold text-[13px] px-7 py-3 rounded-[8px] hover:bg-gray-50 transition-colors"
            >
              <FiMessageSquare size={14} aria-hidden="true" /> Contact Support
            </Link>
          </nav>

          <p className="text-center text-[11px] text-[#C5C5C5] mt-10">
            Error Reference: 404 · houseofcambridge.co.uk · <time dateTime={new Date().toISOString().split('T')[0]}>{today}</time>
          </p>
        </div>
      </main>
    </Layout>
  );
}