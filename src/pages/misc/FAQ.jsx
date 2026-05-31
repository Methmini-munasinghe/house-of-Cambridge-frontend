import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import {
  FiChevronDown, FiChevronUp, FiSearch,
  FiMessageCircle, FiMail, FiPhone,
  FiThumbsUp, FiThumbsDown,
} from 'react-icons/fi';

const CATEGORIES = [
  { id: 'orders',  emoji: '📦', label: 'Orders & Shipping',  count: 8 },
  { id: 'returns', emoji: '🔄', label: 'Returns & Refunds',  count: 6 },
  { id: 'payment', emoji: '💳', label: 'Payment',            count: 5 },
  { id: 'loyalty', emoji: '⭐', label: 'Loyalty Points',     count: 4 },
  { id: 'brands',  emoji: '🏷️', label: 'Brands & Products', count: 4 },
  { id: 'privacy', emoji: '🔒', label: 'Privacy & Security', count: 3 },
];

const POPULAR_TOPICS = [
  { label: 'Track my order',       id: 'track-order'   },
  { label: 'How to return an item', id: 'return-policy' },
  { label: 'Change my address',    id: 'change-address' },
  { label: 'Promo codes',          id: 'promo-code'    },
  { label: 'Size guide',           id: 'size-guide'    },
];

const FAQ_DATA = [
  {
    category: 'orders',
    emoji: '📦',
    title: 'Orders & Shipping',
    items: [
      {
        id: 'track-order',
        q: 'How do I track my order?',
        a: "Once your order is dispatched, you will receive an email and SMS with a tracking number. You can use this number to track your parcel on the carrier's website to see the live tracking status. Tracking information typically becomes active within 2–4 hours of dispatch.",
        tags: ['Tracking', 'Shipping'],
        defaultOpen: true,
      },
      {
        id: 'delivery-time',
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 2–5 business days within Colombo and suburbs. Orders to other provinces typically take 3–7 business days. Express delivery (1–2 business days) is available at checkout for an additional fee.',
        tags: ['Delivery', 'Shipping'],
      },
      {
        id: 'free-shipping',
        q: 'Is free shipping available?',
        a: 'Yes! All orders over Rs. 5,000 qualify for free standard delivery islandwide. Orders below this threshold are charged a flat delivery fee of Rs. 350.',
        tags: ['Shipping', 'Free'],
      },
      {
        id: 'change-address',
        q: 'Can I change my delivery address after placing an order?',
        a: 'Address changes are possible only within 1 hour of placing your order, before it is dispatched. Please contact our support team immediately via WhatsApp or live chat with your Order ID to request a change.',
        tags: ['Address', 'Order'],
      },
      {
        id: 'cancel-order',
        q: 'Can I cancel my order?',
        a: 'You can cancel your order within 1 hour of placing it, provided it has not yet been dispatched. Once dispatched, cancellation is no longer possible — you would need to initiate a return after receiving the item.',
        tags: ['Cancel', 'Order'],
      },
    ],
  },
  {
    category: 'returns',
    emoji: '🔄',
    title: 'Returns & Refunds',
    items: [
      {
        id: 'return-policy',
        q: 'What is your return policy?',
        a: 'You may return most items within 30 days of delivery, provided they are unworn, unwashed, and in their original packaging with all tags attached. Sale items and personalised/customised products are non-returnable. Please visit our full Return & Refund Policy for complete details.',
        tags: ['Returns', 'Policy'],
        defaultOpen: true,
      },
      {
        id: 'refund-time',
        q: 'How long does my refund take to process?',
        a: 'Once we receive your returned item and verify its condition, refunds are processed within 3–5 business days. The amount will be credited to your original payment method. Bank processing times may add an additional 2–5 business days.',
        tags: ['Refund', 'Processing'],
      },
      {
        id: 'initiate-return',
        q: 'How do I initiate a return?',
        a: 'To initiate a return, log in to your account, go to Order History, select the relevant order, and click "Return Item". Fill in the reason for return and submit. Our team will contact you within 24 hours with return instructions.',
        tags: ['Returns', 'Process'],
      },
    ],
  },
  {
    category: 'payment',
    emoji: '💳',
    title: 'Payment',
    items: [
      {
        id: 'payment-methods',
        q: 'What payment methods do you accept?',
        a: 'We accept bank transfers, cash on delivery, and other manual payment methods. Payment details will be provided after your order is placed. We do not store any card details on our servers.',
        tags: ['Payment', 'Security'],
        defaultOpen: true,
      },
      {
        id: 'promo-code',
        q: 'How do I apply a promo code?',
        a: 'You can apply a promo code at checkout in the "Promo / Voucher Code" field. Enter your code and click "Apply". Valid codes will show a discount automatically applied to your order total. Only one promo code can be used per order.',
        tags: ['Promo', 'Discount'],
      },
    ],
  },
  {
    category: 'loyalty',
    emoji: '⭐',
    title: 'Loyalty Programme',
    items: [
      {
        id: 'loyalty-points',
        q: 'How do loyalty points work?',
        a: 'You earn 1 point for every Rs 100 spent. Points are credited to your account after a successful order delivery. You can redeem points for discounts on future orders (100 points = Rs 30 off). Points expire after 12 months of account inactivity.',
        tags: ['Loyalty', 'Points'],
        defaultOpen: true,
      },
      {
        id: 'loyalty-tiers',
        q: 'What are the loyalty tiers?',
        a: 'We have four loyalty tiers: Bronze (0–499 points), Silver (500–1,499 points), Gold (1,500–4,999 points), and Platinum (5,000+ points). Higher tiers unlock exclusive benefits including bonus points on purchases, priority support, and early access to sales.',
        tags: ['Loyalty', 'Tiers'],
      },
    ],
  },
];

const MAX_SEARCH_LENGTH = 150;

function sanitize(value) {
  return value.replace(/[<>"'`]/g, '').slice(0, MAX_SEARCH_LENGTH);
}

function FAQItem({ item, isFirstOpen }) {
  const [open, setOpen] = useState(isFirstOpen || item.defaultOpen || false);
  const [helpful, setHelpful] = useState(null);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <div className={`border border-[#E9E9E9] rounded-[8px] overflow-hidden transition-shadow ${open ? 'shadow-[2px_3px_8px_rgba(0,0,0,0.06)]' : ''}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`faq-body-${item.id}`}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <span className="text-[13px] font-medium leading-snug pr-4 text-[#1A1A1A]">
          {item.q}
        </span>
        {open
          ? <FiChevronUp size={16} className="text-[#FFB700] flex-shrink-0" aria-hidden="true" />
          : <FiChevronDown size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
        }
      </button>

      {open && (
        <div id={`faq-body-${item.id}`} className="px-5 pb-4 border-t border-[#F0F0F0]">
          <p className="text-[13px] text-[#60717B] leading-relaxed pt-3 mb-3">{item.a}</p>

          {item.tags && (
            <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Tags">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-[#F5F5F5] border border-[#E9E9E9] text-[#60717B] px-2.5 py-0.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3" role="group" aria-label="Was this helpful?">
            <span className="text-[12px] text-[#60717B]">Was this helpful?</span>
            <button
              type="button"
              onClick={() => setHelpful('yes')}
              aria-pressed={helpful === 'yes'}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-[5px] border transition-colors ${
                helpful === 'yes'
                  ? 'border-green-400 bg-green-50 text-green-600'
                  : 'border-[#E9E9E9] text-[#60717B] hover:border-green-300 hover:text-green-600'
              }`}
            >
              <FiThumbsUp size={12} aria-hidden="true" /> Yes
            </button>
            <button
              type="button"
              onClick={() => setHelpful('no')}
              aria-pressed={helpful === 'no'}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-[5px] border transition-colors ${
                helpful === 'no'
                  ? 'border-red-400 bg-red-50 text-red-500'
                  : 'border-[#E9E9E9] text-[#60717B] hover:border-red-300 hover:text-red-500'
              }`}
            >
              <FiThumbsDown size={12} aria-hidden="true" /> No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('orders');

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(sanitize(e.target.value));
  }, []);

  const filteredData = FAQ_DATA.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !searchQuery ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((section) => section.items.length > 0);

  const visibleData = activeCategory
    ? filteredData.filter((s) => s.category === activeCategory || searchQuery)
    : filteredData;

  const scrollToCategory = useCallback((id) => {
    setActiveCategory(id);
    const el = document.getElementById(`cat-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToItem = useCallback((itemId) => {
    const section = FAQ_DATA.find((s) => s.items.some((i) => i.id === itemId));
    if (section) {
      setActiveCategory(section.category);
      setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  return (
    <Layout>
      <div className="max-w-[1280px] mx-auto px-4 py-2">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Pages', href: '#' }, { label: 'FAQ' }]} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 mb-6">
        <div className="bg-[#F5F5F5] border border-[#E9E9E9] rounded-[10px] px-8 py-8 flex items-center gap-8 relative overflow-hidden">
          <div className="flex-1 min-w-0 z-10">
            <h1 className="text-[32px] font-black text-[#1A1A1A] leading-tight mb-1">How Can We Help You?</h1>
            <p className="text-[13px] text-[#60717B] mb-5">
              Browse our frequently asked questions or search for what you need below.
            </p>
            <div className="flex max-w-[520px]" role="search">
              <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
              <input
                id="faq-search"
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search FAQs e.g. 'return policy', 'track order'..."
                maxLength={MAX_SEARCH_LENGTH}
                className="flex-1 border border-[#C5C5C5] border-r-0 rounded-l-[6px] px-4 py-2.5 text-[13px] outline-none focus:border-[#FFB700] bg-white"
              />
              <button
                type="button"
                className="bg-[#FFB700] text-black font-bold text-[13px] px-5 py-2.5 rounded-r-[6px] hover:bg-amber-500 transition-colors flex items-center gap-1.5 flex-shrink-0"
                aria-label="Search FAQs"
              >
                <FiSearch size={14} aria-hidden="true" /> Search
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center w-[180px] flex-shrink-0 select-none" aria-hidden="true">
            <div className="relative">
              <div className="w-32 h-24 bg-[#FFB700] rounded-[14px] flex items-center justify-center shadow-lg">
                <span className="text-[36px] font-black text-white tracking-tight">FAQ</span>
              </div>
              <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-[22px] font-black">?!</span>
              </div>
              <div className="absolute -top-3 -left-3 w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-[#1A1A1A] text-[14px] font-bold">?</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 pb-14 flex gap-6 items-start">

        <aside className="hidden lg:block w-[220px] flex-shrink-0 sticky top-24 space-y-4" aria-label="FAQ navigation">
          <div className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 border-b border-[#E9E9E9]">
              <span className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider">Categories</span>
            </div>
            <nav>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => scrollToCategory(cat.id)}
                  aria-current={activeCategory === cat.id ? 'true' : undefined}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors border-l-[3px] ${
                    activeCategory === cat.id
                      ? 'border-[#FFB700] bg-amber-50 text-[#1A1A1A] font-semibold'
                      : 'border-transparent text-[#60717B] hover:text-[#1A1A1A] hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] flex-shrink-0 ${
                    activeCategory === cat.id ? 'bg-[#FFB700] text-black' : 'bg-[#FFB700]/20 text-[#1A1A1A]'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-4 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-3">Popular Topics</p>
            <ul className="space-y-2">
              {POPULAR_TOPICS.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => scrollToItem(topic.id)}
                    className="w-full text-left text-[12px] text-[#60717B] hover:text-[#FFB700] transition-colors"
                  >
                    {topic.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-8">

          {searchQuery && filteredData.length === 0 && (
            <div className="text-center py-16" role="status" aria-live="polite">
              <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
              <p className="text-[15px] font-bold text-[#1A1A1A] mb-1">No results found</p>
              <p className="text-[13px] text-[#60717B]">Try different keywords or browse the categories.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 text-[#FFB700] text-[13px] font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {visibleData.map((section) => (
            <section key={section.category} id={`cat-${section.category}`} className="scroll-mt-24" aria-labelledby={`section-title-${section.category}`}>
              <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b-2 border-[#E9E9E9]">
                <span className="text-[20px]" aria-hidden="true">{section.emoji}</span>
                <h2 id={`section-title-${section.category}`} className="text-[18px] font-black text-[#1A1A1A]">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-2.5">
                {section.items.map((item, idx) => (
                  <div key={item.id} id={item.id} className="scroll-mt-24">
                    <FAQItem item={item} isFirstOpen={idx === 0 && !searchQuery} />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {!searchQuery && (
            <section className="bg-white border border-[#E9E9E9] rounded-[10px] p-6 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]" aria-labelledby="contact-support-heading">
              <h3 id="contact-support-heading" className="text-[16px] font-black text-[#1A1A1A] mb-1">
                Didn&apos;t find your answer?
              </h3>
              <p className="text-[13px] text-[#60717B] mb-5">
                Our support team is ready to help you. Choose your preferred contact method below.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-[#E9E9E9] rounded-[10px] p-5 text-center hover:border-[#FFB700] hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiMessageCircle size={18} className="text-[#60717B]" aria-hidden="true" />
                  </div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] mb-1">Live Chat</p>
                  <p className="text-[11px] text-[#60717B] mb-4">Chat with a human agent. Available 24/7</p>
                  <button
                    type="button"
                    className="w-full bg-[#FFB700] text-black font-bold text-[12px] py-2 rounded-[6px] hover:bg-amber-500 transition-colors"
                  >
                    Start Chat
                  </button>
                </div>

                <div className="border border-[#E9E9E9] rounded-[10px] p-5 text-center hover:border-[#FFB700] hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiMail size={18} className="text-[#60717B]" aria-hidden="true" />
                  </div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] mb-1">Email Support</p>
                  <p className="text-[11px] text-[#60717B] mb-4">
                    info@houseofcambridge.co.uk<br />Response within 24 hours.
                  </p>
                  <a
                    href="mailto:info@houseofcambridge.co.uk"
                    className="w-full bg-[#FFB700] text-black font-bold text-[12px] py-2 rounded-[6px] hover:bg-amber-500 transition-colors block"
                  >
                    Send Email
                  </a>
                </div>

                <div className="border border-[#E9E9E9] rounded-[10px] p-5 text-center hover:border-[#FFB700] hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiPhone size={18} className="text-[#60717B]" aria-hidden="true" />
                  </div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] mb-1">Phone Support</p>
                  <p className="text-[11px] text-[#60717B] mb-4">0112 847 846<br />Mon–Sat, 9 AM – 6 PM</p>
                  <a
                    href="tel:+94112847846"
                    className="w-full bg-[#FFB700] text-black font-bold text-[12px] py-2 rounded-[6px] hover:bg-amber-500 transition-colors block"
                  >
                    Call Us
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}