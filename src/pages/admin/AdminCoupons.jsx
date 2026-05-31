import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminCoupons, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon,
} from '../../redux/slices/adminSlice.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { ToastContainer } from '../../components/ui/Toast.jsx';
import useToast from '../../hooks/useToast.js';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSearch,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';

const PAGE_SIZE = 20;

const EMPTY = {
  code: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscount: '', usageLimit: '',
  validFrom: '', validTo: '', isActive: true,
};

const INPUT_CLS =
  'w-full px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]';

export default function AdminCoupons() {
  const dispatch = useDispatch();
  const { coupons, couponsTotal, loading } = useSelector((s) => s.admin);
  const { toasts, toast, removeToast }     = useToast();

  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [delLoading,   setDelLoading]   = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [saving,       setSaving]       = useState(false);

  const pages = Math.ceil((couponsTotal ?? 0) / PAGE_SIZE);

  const load = useCallback((s = search, p = page) => {
    dispatch(fetchAdminCoupons({ search: s || undefined, page: p, limit: PAGE_SIZE }));
  }, [dispatch, search, page]);

  useEffect(() => { load(search, page); }, [page]);

  const openCreate = useCallback(() => { setEditing(null); setForm(EMPTY); setShowForm(true); }, []);

  const openEdit = useCallback((c) => {
    setEditing(c);
    setForm({
      code:           c.code,
      discountType:   c.discountType,
      discountValue:  c.discountValue,
      minOrderAmount: c.minOrderAmount || '',
      maxDiscount:    c.maxDiscount    || '',
      usageLimit:     c.usageLimit     || '',
      validFrom:      c.validFrom  ? c.validFrom.slice(0, 10)  : '',
      validTo:        c.validTo    ? c.validTo.slice(0, 10)    : '',
      isActive:       c.isActive,
    });
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => { setShowForm(false); setEditing(null); }, []);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim())       return toast.error('Coupon code is required');
    if (!form.discountValue)     return toast.error('Discount value is required');
    if (!editing && !form.validTo) return toast.error('Expiry date is required');

    setSaving(true);
    const data = { ...form, code: form.code.toUpperCase().trim() };
    Object.keys(data).forEach((k) => { if (data[k] === '') delete data[k]; });

    try {
      if (editing) {
        await dispatch(updateAdminCoupon({ id: editing._id, data })).unwrap();
        toast.success('Coupon updated');
      } else {
        await dispatch(createAdminCoupon(data)).unwrap();
        toast.success('Coupon created');
      }
      closeForm();
      load(search, page);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await dispatch(deleteAdminCoupon(deleteTarget._id)).unwrap();
      toast.success(`Coupon "${deleteTarget.code}" deleted`);
      setDeleteTarget(null);
      load(search, page);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Delete failed');
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-[20px] font-black text-[#1A1A1A]">
            Coupons <span className="text-[#60717B] font-normal text-[16px]">({couponsTotal ?? 0})</span>
          </h2>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#FFB700] text-[#1A1A1A] font-semibold text-[13px] rounded-[8px] hover:bg-amber-400 transition-colors">
            <FiPlus size={16} /> Add Coupon
          </button>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] p-4">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(search, 1); }} className="flex gap-2" role="search">
            <div className="relative flex-1">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60717B]" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coupon code…"
                aria-label="Search coupons"
                className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#FFB700] text-[#1A1A1A] font-semibold text-[13px] rounded-[8px] hover:bg-amber-400 transition-colors">
              Search
            </button>
          </form>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E9E9E9] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#FAFAFA] border-b border-[#E9E9E9]">
                <tr>
                  {['Code', 'Type', 'Value', 'Min Order', 'Usage', 'Validity', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[#60717B] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && !coupons.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#60717B]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#FFB700] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        Loading…
                      </div>
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#60717B]">No coupons found</td></tr>
                ) : coupons.map((c) => (
                  <tr key={c._id} className="border-b border-[#F4F5F7] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#1A1A1A] uppercase">{c.code}</td>
                    <td className="px-4 py-3 text-[#60717B] capitalize">{c.discountType}</td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `Rs.${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-[#60717B]">{c.minOrderAmount ? `Rs.${c.minOrderAmount}` : '—'}</td>
                    <td className="px-4 py-3 text-[#60717B]">{c.usedCount ?? 0}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                    <td className="px-4 py-3 text-[#60717B] whitespace-nowrap">
                      {c.validTo ? new Date(c.validTo).toLocaleDateString('en-GB') : '∞'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} aria-label={`Edit coupon ${c.code}`} className="text-[#60717B] hover:text-[#1A1A1A] transition-colors"><FiEdit2 size={15} /></button>
                        <button onClick={() => setDeleteTarget(c)} aria-label={`Delete coupon ${c.code}`} className="text-[#60717B] hover:text-red-600 transition-colors"><FiTrash2 size={15} /></button>
                      </div>
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
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors">
                  <FiChevronLeft size={14} />
                </button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next page" className="p-2 rounded-[6px] border border-[#E9E9E9] disabled:opacity-40 hover:bg-[#FAFAFA] transition-colors">
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={editing ? 'Edit Coupon' : 'Add Coupon'}>
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} aria-hidden="true" />
          <div className="relative ml-auto w-full max-w-[440px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-[#E9E9E9] px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-[16px] font-bold text-[#1A1A1A]">{editing ? 'Edit Coupon' : 'Add Coupon'}</h3>
              <button onClick={closeForm} aria-label="Close drawer" className="text-[#60717B] hover:text-[#1A1A1A] transition-colors"><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              <div>
                <label htmlFor="coupon-code" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                  Code <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="coupon-code"
                  value={form.code}
                  onChange={setField('code')}
                  required
                  maxLength={50}
                  placeholder="SAVE20"
                  style={{ textTransform: 'uppercase' }}
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="coupon-type" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Type</label>
                  <select id="coupon-type" value={form.discountType} onChange={setField('discountType')} className={INPUT_CLS}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="coupon-value" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                    Value <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input id="coupon-value" type="number" min={0} value={form.discountValue} onChange={setField('discountValue')} required className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="coupon-min" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Min Order (Rs.)</label>
                  <input id="coupon-min" type="number" min={0} value={form.minOrderAmount} onChange={setField('minOrderAmount')} className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="coupon-max" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Max Discount (Rs.)</label>
                  <input id="coupon-max" type="number" min={0} value={form.maxDiscount} onChange={setField('maxDiscount')} className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="coupon-limit" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Usage Limit</label>
                  <input id="coupon-limit" type="number" min={1} value={form.usageLimit} onChange={setField('usageLimit')} placeholder="Unlimited" className={INPUT_CLS} />
                </div>
                <div />
                <div>
                  <label htmlFor="coupon-from" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Valid From</label>
                  <input id="coupon-from" type="date" value={form.validFrom} onChange={setField('validFrom')} className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="coupon-to" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                    Valid To <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input id="coupon-to" type="date" value={form.validTo} onChange={setField('validTo')} required className={INPUT_CLS} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-[#FFB700]" />
                <span className="text-[13px] text-[#1A1A1A] font-medium">Active</span>
              </label>

              <div className="flex gap-3 pt-2 border-t border-[#F0F0F0]">
                <button type="button" onClick={closeForm} className="flex-1 py-2.5 border border-[#E9E9E9] rounded-[8px] text-[13px] font-medium text-[#60717B] hover:bg-[#FAFAFA] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#FFB700] rounded-[8px] text-[13px] font-bold text-[#1A1A1A] hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {saving && <span className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" aria-hidden="true" />}
                  {editing ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Delete coupon "${deleteTarget?.code}"? Coupons applied to active carts cannot be deleted — disable them instead.`}
        confirmLabel="Delete"
        variant="danger"
        loading={delLoading}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}