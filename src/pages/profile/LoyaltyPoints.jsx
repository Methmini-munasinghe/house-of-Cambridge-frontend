import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import ProfileLayout from '../../components/profile/ProfileLayout';
import {
  FiStar, FiShoppingBag, FiMessageSquare,
  FiUserPlus, FiCheck, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 999,  color: '#CD7F32' },
  { name: 'Silver',   min: 1000, max: 2499, color: '#A8A9AD' },
  { name: 'Gold',     min: 2500, max: 4999, color: '#FFB700' },
  { name: 'Platinum', min: 5000, max: null, color: '#5B5EA6' },
];

const EARN_CARDS = [
  { icon: FiShoppingBag,   title: 'Shop & Earn',       desc: '1 point per Rs. 50 spent on any order',                   pts: '+1 pt / Rs.50' },
  { icon: FiMessageSquare, title: 'Write a Review',     desc: 'Earn 20 pts per verified product review',                 pts: '+20 pts'       },
  { icon: FiCheck,         title: 'Complete Profile',   desc: 'Fill all profile fields for a one-time bonus',            pts: '+50 pts'       },
  { icon: FiUserPlus,      title: 'Refer a Friend',     desc: 'Earn 200 pts when a referred friend places an order',     pts: '+200 pts'      },
];

const HISTORY_TABS = ['All', 'Earned', 'Redeemed', 'Expired'];
const PAGE_SIZE    = 6;

const REDEEM_RULES = [
  'Points expire 180 days after earning',
  'Cannot be combined with coupon codes',
  'Minimum order Rs. 500 required',
];

const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'earned',   desc: 'Order #DFC-2026-AB12CD34',  pts: +120, date: '2026-05-10' },
  { id: 't2', type: 'earned',   desc: 'Product review submitted',   pts: +20,  date: '2026-05-08' },
  { id: 't3', type: 'redeemed', desc: 'Redeemed at checkout',        pts: -200, date: '2026-05-05' },
  { id: 't4', type: 'earned',   desc: 'Order #DFC-2026-EF56GH78',  pts: +80,  date: '2026-04-28' },
  { id: 't5', type: 'earned',   desc: 'Profile completion bonus',    pts: +50,  date: '2026-04-20' },
  { id: 't6', type: 'expired',  desc: 'Points expired (180 days)',   pts: -30,  date: '2026-04-01' },
  { id: 't7', type: 'earned',   desc: 'Referral bonus — Kasun P.',  pts: +200, date: '2026-03-15' },
];

const MIN_REDEEM   = 100;
const REDEEM_RATE  = 50;

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getTierIndex(pts) {
  return TIERS.findIndex((t) => pts >= t.min && (t.max === null || pts <= t.max));
}

function getTierProgressPct(tierIndex, pts) {
  const tier     = TIERS[tierIndex];
  const nextTier = TIERS[tierIndex + 1];
  if (!nextTier) return 100;
  const segWidth = 100 / (TIERS.length - 1);
  const segProgress = ((pts - tier.min) / (nextTier.min - tier.min)) * segWidth;
  return (tierIndex / (TIERS.length - 1)) * 100 + segProgress;
}

export default function LoyaltyPoints() {
  const { profile } = useSelector((s) => s.user);
  const { user }    = useSelector((s) => s.auth);
  const u           = profile || user;
  const points      = u?.loyaltyPoints ?? 842;

  const [redeemInput, setRedeemInput] = useState('');
  const [histTab, setHistTab]         = useState('All');
  const [page, setPage]               = useState(1);

  const tierIndex = getTierIndex(points);
  const tier      = TIERS[Math.max(0, tierIndex)];
  const nextTier  = TIERS[tierIndex + 1];
  const barPct    = getTierProgressPct(Math.max(0, tierIndex), points);

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    if (histTab === 'Earned')   return t.type === 'earned';
    if (histTab === 'Redeemed') return t.type === 'redeemed';
    if (histTab === 'Expired')  return t.type === 'expired';
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalEarned   = MOCK_TRANSACTIONS.filter((t) => t.pts > 0).reduce((s, t) => s + t.pts, 0);
  const totalRedeemed = Math.abs(MOCK_TRANSACTIONS.filter((t) => t.type === 'redeemed').reduce((s, t) => s + t.pts, 0));
  const expiringSoon  = 120;

  const STATS = [
    { label: 'Available Points', value: points,        color: 'text-[#FFB700]' },
    { label: 'Total Earned',     value: totalEarned,   color: 'text-[#1A1A1A]' },
    { label: 'Total Redeemed',   value: totalRedeemed, color: 'text-[#1A1A1A]' },
    { label: 'Expiring in 30d',  value: expiringSoon,  color: 'text-red-500'   },
  ];

  const redeemValue = parseInt(redeemInput, 10);
  const redeemDiscount = !isNaN(redeemValue) && redeemValue >= MIN_REDEEM
    ? Math.floor(redeemValue / MIN_REDEEM) * REDEEM_RATE
    : 0;

  const handleRedeemInput = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setRedeemInput(raw);
  }, []);

  const handleRedeem = useCallback(() => {
    if (!redeemValue || redeemValue <= 0) {
      toast.error('Enter a valid points amount.');
      return;
    }
    if (redeemValue < MIN_REDEEM) {
      toast.error(`Minimum redemption is ${MIN_REDEEM} points.`);
      return;
    }
    if (redeemValue > points) {
      toast.error('Insufficient points.');
      return;
    }
    toast.success(`${redeemValue} points will be applied at checkout`);
    setRedeemInput('');
  }, [redeemValue, points]);

  const handleTabChange = useCallback((t) => {
    setHistTab(t);
    setPage(1);
  }, []);

  return (
    <ProfileLayout>
      <div className="bg-[#1A1A1A] rounded-[10px] p-5 mb-5 relative overflow-hidden shadow-[2px_3px_12px_rgba(0,0,0,0.15)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold text-[#C5C5C5] uppercase tracking-wider mb-1">Current Tier</p>
            <p className="text-[18px] font-black" style={{ color: tier.color }}>
              {tier.name} Member
            </p>
          </div>
          <div className="text-right">
            <p className="text-[42px] font-black text-[#FFB700] leading-none" aria-label={`${points.toLocaleString()} loyalty points`}>
              {points.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#C5C5C5]">loyalty points</p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between mb-1.5" aria-hidden="true">
            {TIERS.map((t, i) => (
              <span
                key={t.name}
                className={`text-[10px] font-bold ${i <= tierIndex ? 'text-[#FFB700]' : 'text-[#60717B]'}`}
              >
                {t.name}
              </span>
            ))}
          </div>
          <div
            className="h-2 bg-[#333] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={points}
            aria-valuemin={tier.min}
            aria-valuemax={nextTier?.min ?? tier.min}
            aria-label={`Tier progress: ${points} points`}
          >
            <div
              className="h-full bg-[#FFB700] rounded-full transition-all duration-500"
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>

        {nextTier && (
          <p className="text-[11px] text-[#C5C5C5]">
            {(nextTier.min - points).toLocaleString()} more points to reach{' '}
            <span className="text-[#FFB700] font-bold">{nextTier.name}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#E9E9E9] rounded-[10px] px-4 py-4 shadow-[2px_3px_8px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-[22px] font-black leading-tight ${s.color}`}>
              {s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-5 shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-4">
        <p className="text-[13px] font-black text-[#1A1A1A] mb-4">Ways to Earn Points</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EARN_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="flex items-start gap-3 p-3.5 border border-[#F0F0F0] rounded-[8px] hover:border-[#FFB700] hover:bg-amber-50/30 transition-colors"
              >
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[#FFB700]" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-[#1A1A1A]">{c.title}</p>
                    <span className="text-[11px] font-black text-[#FFB700] whitespace-nowrap">{c.pts}</span>
                  </div>
                  <p className="text-[11px] text-[#60717B] mt-0.5">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-[#E9E9E9] rounded-[10px] p-5 shadow-[2px_3px_8px_rgba(0,0,0,0.04)] mb-4">
        <p className="text-[13px] font-black text-[#1A1A1A] mb-1">Redeem Points At Checkout</p>
        <p className="text-[11px] text-[#60717B] mb-4">
          {MIN_REDEEM} points = Rs. {REDEEM_RATE} discount · Minimum {MIN_REDEEM} points to redeem
        </p>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <FiStar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFB700]" aria-hidden="true" />
            <label htmlFor="redeem-input" className="sr-only">Points to redeem</label>
            <input
              id="redeem-input"
              type="text"
              inputMode="numeric"
              value={redeemInput}
              onChange={handleRedeemInput}
              placeholder="Enter points to redeem"
              maxLength={6}
              className="w-full pl-8 pr-3 py-2.5 border border-[#C5C5C5] rounded-[6px] text-[13px] outline-none focus:border-[#FFB700] bg-[#FAFAFA]"
            />
          </div>
          <button
            type="button"
            onClick={handleRedeem}
            className="bg-[#FFB700] text-black text-[13px] font-bold px-5 py-2.5 rounded-[6px] hover:bg-amber-500 transition-colors whitespace-nowrap"
          >
            Redeem
          </button>
        </div>

        {redeemDiscount > 0 && (
          <p className="text-[11px] text-[#60717B]" aria-live="polite">
            = Rs. {redeemDiscount.toLocaleString()} discount at checkout
          </p>
        )}

        <ul className="mt-3 space-y-1" aria-label="Redemption rules">
          {REDEEM_RULES.map((r) => (
            <li key={r} className="flex items-center gap-1.5 text-[11px] text-[#60717B]">
              <span className="w-1 h-1 rounded-full bg-[#C5C5C5] flex-shrink-0" aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">
        <div className="flex border-b border-[#F0F0F0]" role="tablist" aria-label="Transaction history filters">
          {HISTORY_TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={histTab === t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2.5 text-[12px] font-bold border-b-2 transition-colors ${
                histTab === t
                  ? 'border-[#FFB700] text-[#1A1A1A]'
                  : 'border-transparent text-[#60717B] hover:text-[#1A1A1A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[#F5F5F5]" role="tabpanel" aria-live="polite">
          {paginated.length === 0 ? (
            <p className="text-center text-[13px] text-[#60717B] py-10">No transactions found.</p>
          ) : (
            paginated.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">{t.desc}</p>
                  <p className="text-[11px] text-[#60717B]">
                    <time dateTime={t.date}>{fmtDate(t.date)}</time>
                  </p>
                </div>
                <span
                  className={`text-[14px] font-black ${t.pts > 0 ? 'text-green-600' : 'text-red-500'}`}
                  aria-label={`${t.pts > 0 ? 'Earned' : 'Used'} ${Math.abs(t.pts)} points`}
                >
                  {t.pts > 0 ? '+' : ''}{t.pts} pts
                </span>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#F0F0F0] flex items-center justify-between">
            <p className="text-[11px] text-[#60717B]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="w-7 h-7 border border-[#E9E9E9] rounded-[4px] flex items-center justify-center disabled:opacity-40 hover:border-[#FFB700] transition-colors"
              >
                <FiChevronLeft size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="w-7 h-7 border border-[#E9E9E9] rounded-[4px] flex items-center justify-center disabled:opacity-40 hover:border-[#FFB700] transition-colors"
              >
                <FiChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}