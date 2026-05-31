import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminReturns, fetchAdminReturn, updateAdminReturnStatus } from '../../redux/slices/adminSlice.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { ToastContainer } from '../../components/ui/Toast.jsx';
import useToast from '../../hooks/useToast.js';
import { FiSearch, FiEye, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE = 20;

const STATUSES = ['pending', 'in_review', 'approved', 'rejected', 'collected', 'qc', 'refunded'];

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  in_review: 'bg-blue-100   text-blue-700',
  approved:  'bg-green-100  text-green-700',
  rejected:  'bg-red-100    text-red-700',
  collected: 'bg-indigo-100 text-indigo-700',
  qc:        'bg-purple-100 text-purple-700',
  refunded:  'bg-gray-100   text-gray-700',
};

const EMPTY_UPDATE = { status: '', adminNotes: '', refundAmount: '', refundMethod: '' };

const INPUT_CLS =
  'w-full px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]';

export default function AdminReturns() {
  const dispatch = useDispatch();
  const { returns, returnsTotal, selectedReturn, loading } = useSelector((s) => s.admin);
  const { toasts, toast, removeToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [detailOpen,   setDetailOpen]   = useState(false);
  const [updateForm,   setUpdateForm]   = useState(EMPTY_UPDATE);
  const [saving,       setSaving]       = useState(false);

  const pages = Math.ceil((returnsTotal ?? 0) / PAGE_SIZE);

  const load = useCallback((s = search, st = statusFilter, p = page) => {
    dispatch(fetchAdminReturns({
      search: s  || undefined,
      status: st || undefined,
      page:   p,
      limit:  PAGE_SIZE,
    }));
  }, [dispatch, search, statusFilter, page]);

  useEffect(() => { load(search, statusFilter, page); }, [page]);

  const openDetail = async (ret) => {
    await dispatch(fetchAdminReturn(ret._id));
    setUpdateForm({ ...EMPTY_UPDATE, status: ret.status });
    setDetailOpen(true);
  };

  const closeDetail = useCallback(() => setDetailOpen(false), []);

  const setField = (key) => (e) => setUpdateForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setSaving(true);
    const data = { ...updateForm };
    Object.keys(data).forEach((k) => { if (data[k] === '') delete data[k]; });
    try {
      await dispatch(updateAdminReturnStatus({ id: selectedReturn._id, data })).unwrap();
      toast.success('Return status updated');
      closeDetail();
      load(search, statusFilter, page);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-[20px] font-black text-[#1A1A1A]">
          Returns <span className="text-[#60717B] font-normal text-[16px]">({returnsTotal ?? 0})</span>
        </h2>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-4 flex flex-wrap gap-3">
          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); load(search, statusFilter, 1); }}
            className="flex gap-2 flex-1 min-w-[200px]"
            role="search"
          >
            <div className="relative flex-1">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60717B]" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by return ID…"
                aria-label="Search returns"
                className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#FFB700] text-[#1A1A1A] font-semibold text-[13px] rounded-[8px] hover:bg-amber-400 transition-colors">
              Search
            </button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(search, e.target.value, 1); }}
            aria-label="Filter by status"
            className="px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#FAFAFA] border-b border-[#E9E9E9]">
                <tr>
                  {['Return ID', 'Order', 'Customer', 'Reason', 'Items', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[#60717B] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && !returns.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#60717B]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#FFB700] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        Loading…
                      </div>
                    </td>
                  </tr>
                ) : returns.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#60717B]">No returns found</td></tr>
                ) : returns.map((r) => (
                  <tr key={r._id} className="border-b border-[#F4F5F7] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#1A1A1A] text-[12px]">{r.returnId}</td>
                    <td className="px-4 py-3 text-[#60717B]">{r.order?.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A1A1A]">{r.user?.name}</p>
                      <p className="text-[11px] text-[#60717B]">{r.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[#60717B] capitalize">{r.reason?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-[#60717B]">{r.items?.length}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#60717B] whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(r)}
                        aria-label={`View return ${r.returnId}`}
                        className="text-[#FFB700] hover:text-amber-500 transition-colors"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="px-4 py-3 border-t border-[#E9E9E9] flex items-center justify-between">
              <p className="text-[13px] text-[#60717B]">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors"><FiChevronLeft size={14} /></button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors"><FiChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={`Return ${selectedReturn.returnId}`}>
          <div className="absolute inset-0 bg-black/40" onClick={closeDetail} aria-hidden="true" />
          <div className="relative ml-auto w-full max-w-[520px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-[#E9E9E9] px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-[16px] font-bold text-[#1A1A1A]">{selectedReturn.returnId}</h3>
              <button onClick={closeDetail} aria-label="Close drawer" className="text-[#60717B] hover:text-[#1A1A1A] transition-colors"><FiX size={20} /></button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                {[
                  { label: 'Customer',   value: selectedReturn.user?.name },
                  { label: 'Order',      value: selectedReturn.order?.orderNumber },
                  { label: 'Reason',     value: selectedReturn.reason?.replace(/_/g, ' '), cls: 'capitalize' },
                  { label: 'Resolution', value: selectedReturn.resolution, cls: 'capitalize' },
                ].map(({ label, value, cls }) => (
                  <div key={label}>
                    <p className="text-[#60717B] text-[12px] mb-0.5">{label}</p>
                    <p className={`font-semibold text-[#1A1A1A] ${cls ?? ''}`}>{value || '—'}</p>
                  </div>
                ))}
              </div>

              {selectedReturn.description && (
                <div className="bg-[#FAFAFA] rounded-[8px] p-3 text-[13px] text-[#60717B]">{selectedReturn.description}</div>
              )}

              <div>
                <p className="text-[13px] font-semibold text-[#1A1A1A] mb-2">Items</p>
                <div className="space-y-2">
                  {selectedReturn.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-[13px]">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-[6px]" />}
                      <div className="flex-1">
                        <p className="font-medium text-[#1A1A1A]">{item.name}</p>
                        <p className="text-[#60717B]">Qty: {item.quantity} · Rs.{item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.images?.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A] mb-2">Attached Images</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReturn.images.map((img, i) => (
                      <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                        <img src={img.url} alt={`Return image ${i + 1}`} className="w-16 h-16 object-cover rounded-[8px] border border-[#E9E9E9]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-3 border-t border-[#E9E9E9] pt-4">
                <p className="text-[14px] font-bold text-[#1A1A1A]">Update Status</p>

                <div>
                  <label htmlFor="ret-status" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Status</label>
                  <select id="ret-status" value={updateForm.status} onChange={setField('status')} className={INPUT_CLS}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ret-refund-amt" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Refund Amount (Rs.)</label>
                    <input id="ret-refund-amt" type="number" min={0} value={updateForm.refundAmount} onChange={setField('refundAmount')} className={INPUT_CLS} />
                  </div>
                  <div>
                    <label htmlFor="ret-refund-method" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Refund Method</label>
                    <select id="ret-refund-method" value={updateForm.refundMethod} onChange={setField('refundMethod')} className={INPUT_CLS}>
                      <option value="">Select</option>
                      <option value="original">Original Payment</option>
                      <option value="store_credit">Store Credit</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ret-notes" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Admin Notes</label>
                  <textarea id="ret-notes" value={updateForm.adminNotes} onChange={setField('adminNotes')} rows={2} maxLength={1000} className={`${INPUT_CLS} resize-none`} />
                </div>

                <button type="submit" disabled={saving} className="w-full py-2.5 bg-[#FFB700] rounded-[8px] text-[13px] font-bold text-[#1A1A1A] hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {saving && <span className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" aria-hidden="true" />}
                  Update Return
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}