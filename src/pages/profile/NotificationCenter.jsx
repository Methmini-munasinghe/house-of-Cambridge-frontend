import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../../redux/slices/userSlice';
import ProfileLayout from '../../components/profile/ProfileLayout';
import {
  FiPackage, FiGift, FiShield, FiTag,
  FiMessageSquare, FiRefreshCw, FiX,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';

const TABS      = ['All', 'Unread', 'Orders', 'Promotions', 'Loyalty', 'System'];
const PAGE_SIZE = 9;

const TYPE_META = {
  order:     { label: 'Order',     color: 'bg-blue-100 text-blue-700',     Icon: FiPackage      },
  loyalty:   { label: 'Loyalty',   color: 'bg-amber-100 text-amber-700',   Icon: FiGift         },
  support:   { label: 'Support',   color: 'bg-green-100 text-green-700',   Icon: FiMessageSquare },
  return:    { label: 'Return',    color: 'bg-orange-100 text-orange-700', Icon: FiRefreshCw    },
  promotion: { label: 'Promotion', color: 'bg-purple-100 text-purple-700', Icon: FiTag          },
  security:  { label: 'Security',  color: 'bg-red-100 text-red-700',       Icon: FiShield       },
};

const SAFE_ORIGIN_RE = /^https:\/\/houseofcambridge\.co\.uk(\/.*)?$/;

function isSafeActionUrl(url) {
  if (!url) return false;
  try {
    return SAFE_ORIGIN_RE.test(url);
  } catch {
    return false;
  }
}

function groupByDate(items) {
  const groups  = {};
  const today     = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  items.forEach((n) => {
    const d = new Date(n.createdAt || Date.now());
    let label;
    if (d.toDateString() === today.toDateString())     label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

function fmtTime(d) {
  return new Date(d || Date.now()).toLocaleTimeString('en-LK', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function NotificationCenter() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((s) => s.user);
  const [tab, setTab]         = useState('All');
  const [page, setPage]       = useState(1);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const all         = (notifications || []).filter((n) => !dismissed.has(n._id));
  const unreadCount = all.filter((n) => !n.isRead).length;

  const tabCounts = {
    All:        all.length,
    Unread:     unreadCount,
    Orders:     all.filter((n) => n.type === 'order').length,
    Promotions: all.filter((n) => n.type === 'promotion').length,
    Loyalty:    all.filter((n) => n.type === 'loyalty').length,
    System:     all.filter((n) => ['security', 'support'].includes(n.type)).length,
  };

  const filtered = all.filter((n) => {
    if (tab === 'Unread')     return !n.isRead;
    if (tab === 'Orders')     return n.type === 'order';
    if (tab === 'Promotions') return n.type === 'promotion';
    if (tab === 'Loyalty')    return n.type === 'loyalty';
    if (tab === 'System')     return ['security', 'support'].includes(n.type);
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const grouped    = groupByDate(paginated);

  const handleMarkAll = useCallback(() => {
    all.filter((n) => !n.isRead).forEach((n) => dispatch(markNotificationRead(n._id)));
  }, [all, dispatch]);

  const handleDismiss = useCallback((id) => {
    setDismissed((prev) => new Set([...prev, id]));
  }, []);

  const handleTabChange = useCallback((t) => {
    setTab(t);
    setPage(1);
  }, []);

  return (
    <ProfileLayout>
      <div className="bg-white border border-[#E9E9E9] rounded-[10px] overflow-hidden shadow-[2px_3px_8px_rgba(0,0,0,0.04)]">

        <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-black text-[#1A1A1A]">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[11px] text-[#60717B]" aria-live="polite">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[11px] text-[#FFB700] font-bold hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex border-b border-[#F0F0F0] overflow-x-auto" role="tablist" aria-label="Notification filters">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => handleTabChange(t)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#FFB700] text-[#1A1A1A]'
                  : 'border-transparent text-[#60717B] hover:text-[#1A1A1A]'
              }`}
            >
              {t}
              {tabCounts[t] > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tab === t ? 'bg-[#FFB700] text-black' : 'bg-[#F0F0F0] text-[#60717B]'
                  }`}
                  aria-label={`${tabCounts[t]} notifications`}
                >
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="py-16 text-center" role="status">
            <FiPackage size={28} className="mx-auto mb-2 text-[#C5C5C5]" aria-hidden="true" />
            <p className="text-[13px] text-[#60717B]">No notifications here</p>
          </div>
        ) : (
          <div role="tabpanel" aria-live="polite">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="px-5 py-2 bg-[#FAFAFA] border-b border-[#F5F5F5]">
                  <p className="text-[11px] font-black text-[#60717B] uppercase tracking-wider">{date}</p>
                </div>
                <div className="divide-y divide-[#F5F5F5]">
                  {items.map((n) => {
                    const meta = TYPE_META[n.type] || TYPE_META.order;
                    const Icon = meta.Icon;
                    const safeUrl = isSafeActionUrl(n.actionUrl) ? n.actionUrl : null;

                    return (
                      <div
                        key={n._id}
                        className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                          !n.isRead ? 'bg-amber-50/40' : 'hover:bg-[#FAFAFA]'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-2" aria-hidden="true">
                          <div className={`w-2 h-2 rounded-full ${!n.isRead ? 'bg-[#FFB700]' : 'bg-transparent'}`} />
                        </div>

                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.color}`} aria-hidden="true">
                          <Icon size={15} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[13px] leading-snug ${!n.isRead ? 'font-bold text-[#1A1A1A]' : 'font-semibold text-[#1A1A1A]'}`}>
                              {n.title || 'Notification'}
                            </p>
                            <time
                              dateTime={n.createdAt}
                              className="text-[10px] text-[#C5C5C5] flex-shrink-0 whitespace-nowrap"
                            >
                              {fmtTime(n.createdAt)}
                            </time>
                          </div>
                          <p className="text-[12px] text-[#60717B] mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>
                              {meta.label}
                            </span>
                            {safeUrl && (
                              <a
                                href={safeUrl}
                                className="text-[11px] text-[#FFB700] font-bold hover:underline"
                                rel="noopener noreferrer"
                              >
                                {n.actionLabel || 'View Details'}
                              </a>
                            )}
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => dispatch(markNotificationRead(n._id))}
                                className="text-[11px] text-[#60717B] hover:text-[#1A1A1A] font-semibold"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDismiss(n._id)}
                          aria-label={`Dismiss notification: ${n.title || 'Notification'}`}
                          className="flex-shrink-0 text-[#C5C5C5] hover:text-[#60717B] transition-colors mt-0.5"
                        >
                          <FiX size={14} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-[#F0F0F0] flex items-center justify-between">
            <p className="text-[11px] text-[#60717B]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? 'page' : undefined}
                  className={`w-7 h-7 border rounded-[4px] text-[11px] font-bold transition-colors ${
                    n === page
                      ? 'bg-[#FFB700] border-[#FFB700] text-black'
                      : 'border-[#E9E9E9] text-[#60717B] hover:border-[#FFB700]'
                  }`}
                >
                  {n}
                </button>
              ))}

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