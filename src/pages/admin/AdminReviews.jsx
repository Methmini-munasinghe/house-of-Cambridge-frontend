import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminReviews, approveReview, rejectReview, deleteAdminReview } from '../../redux/slices/adminSlice.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { ToastContainer } from '../../components/ui/Toast.jsx';
import useToast from '../../hooks/useToast.js';
import { FiSearch, FiCheck, FiX, FiTrash2, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE   = 20;
const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100  text-green-700',
  rejected: 'bg-red-100    text-red-700',
};

export default function AdminReviews() {
  const dispatch = useDispatch();
  const { reviews, reviewsTotal, loading } = useSelector((s) => s.admin);
  const { toasts, toast, removeToast }     = useToast();

  const [tab,          setTab]          = useState('pending');
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [delLoading,   setDelLoading]   = useState(false);
  const [actionId,     setActionId]     = useState(null);

  const pages = Math.ceil((reviewsTotal ?? 0) / PAGE_SIZE);

  const load = useCallback((s = search, t = tab, p = page) => {
    dispatch(fetchAdminReviews({
      search: s || undefined,
      status: t === 'all' ? undefined : t,
      page:   p,
      limit:  PAGE_SIZE,
    }));
  }, [dispatch, search, tab, page]);

  useEffect(() => { load(search, tab, page); }, [tab, page]);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await dispatch(approveReview({ id })).unwrap();
      toast.success('Review approved');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Approve failed');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await dispatch(rejectReview({ id })).unwrap();
      toast.success('Review rejected');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Reject failed');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await dispatch(deleteAdminReview(deleteTarget._id)).unwrap();
      toast.success('Review deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Delete failed');
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-[20px] font-black text-[#1A1A1A]">
          Reviews <span className="text-[#60717B] font-normal text-[16px]">({reviewsTotal ?? 0})</span>
        </h2>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-4 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 p-1 bg-[#F4F5F7] rounded-[8px]" role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => { setTab(t); setPage(1); }}
                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold capitalize transition-colors ${tab === t ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#60717B] hover:text-[#1A1A1A]'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); load(search, tab, 1); }}
            className="flex gap-2 flex-1 min-w-[200px]"
            role="search"
          >
            <div className="relative flex-1">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60717B]" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews…"
                aria-label="Search reviews"
                className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#FFB700] text-[#1A1A1A] font-semibold text-[13px] rounded-[8px] hover:bg-amber-400 transition-colors">Search</button>
          </form>
        </div>

        <div className="space-y-3">
          {loading && !reviews.length ? (
            <div className="text-center py-12 text-[#60717B]">
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#FFB700] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Loading…
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-[#E9E9E9] py-12 text-center text-[#60717B]">No reviews found</div>
          ) : reviews.map((r) => (
            <article key={r._id} className="bg-white rounded-[12px] border border-[#E9E9E9] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {r.status}
                    </span>
                    <div className="flex items-center gap-0.5" aria-label={`Rating: ${r.rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <FiStar key={n} size={12} className={n <= r.rating ? 'text-[#FFB700] fill-[#FFB700]' : 'text-[#C5C5C5]'} aria-hidden="true" />
                      ))}
                    </div>
                    {r.isVerifiedPurchase && (
                      <span className="text-[11px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Verified Purchase</span>
                    )}
                  </div>
                  <p className="text-[14px] font-bold text-[#1A1A1A]">{r.title}</p>
                  <p className="text-[13px] text-[#60717B] mt-1 line-clamp-2">{r.comment}</p>
                  <div className="flex items-center gap-3 mt-2 text-[12px] text-[#60717B]">
                    <span>by <strong className="text-[#1A1A1A]">{r.user?.name}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>on <strong className="text-[#1A1A1A]">{r.product?.name}</strong></span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString('en-GB')}</time>
                  </div>
                </div>
                {r.product?.images?.[0]?.url && (
                  <img src={r.product.images[0].url} alt={r.product.name} className="w-12 h-12 object-cover rounded-[8px] flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F4F5F7]">
                {r.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(r._id)}
                    disabled={actionId === r._id}
                    aria-label={`Approve review by ${r.user?.name}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-green-100 text-green-700 rounded-[6px] hover:bg-green-200 disabled:opacity-50 transition-colors"
                  >
                    <FiCheck size={13} aria-hidden="true" /> Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(r._id)}
                    disabled={actionId === r._id}
                    aria-label={`Reject review by ${r.user?.name}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-red-100 text-red-700 rounded-[6px] hover:bg-red-200 disabled:opacity-50 transition-colors"
                  >
                    <FiX size={13} aria-hidden="true" /> Reject
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(r)}
                  aria-label={`Delete review by ${r.user?.name}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#60717B] border border-[#E9E9E9] rounded-[6px] hover:bg-[#FAFAFA] ml-auto transition-colors"
                >
                  <FiTrash2 size={13} aria-hidden="true" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[#60717B]">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] bg-white transition-colors"><FiChevronLeft size={14} /></button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] bg-white transition-colors"><FiChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Permanently delete this review? Product ratings will be recalculated."
        confirmLabel="Delete"
        variant="danger"
        loading={delLoading}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}