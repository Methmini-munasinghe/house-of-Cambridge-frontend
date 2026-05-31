import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { broadcastNotification } from '../../redux/slices/adminSlice.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { ToastContainer } from '../../components/ui/Toast.jsx';
import useToast from '../../hooks/useToast.js';
import { FiBell, FiSend } from 'react-icons/fi';

const TYPES = ['promotion', 'order', 'loyalty', 'security', 'system'];
const ROLES = [
  { value: 'user',  label: 'All Customers' },
  { value: 'admin', label: 'All Admins' },
];

const EMPTY_FORM = { title: '', message: '', type: 'promotion', targetRole: 'user', link: '' };

const INPUT_CLS =
  'w-full px-3 py-2 text-[13px] border border-[#E9E9E9] rounded-[8px] bg-[#FAFAFA] focus:outline-none focus:border-[#FFB700]';

export default function AdminBroadcast() {
  const dispatch = useDispatch();
  const { toasts, toast, removeToast } = useToast();
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await dispatch(broadcastNotification(form)).unwrap();
      toast.success(res.message || 'Notification sent!');
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const hasPreview = form.title || form.message;

  return (
    <AdminLayout>
      <div className="max-w-[600px] space-y-5">
        <h2 className="text-[20px] font-black text-[#1A1A1A]">Broadcast Notification</h2>

        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 flex items-start gap-3" role="note">
          <FiBell className="text-amber-600 mt-0.5 flex-shrink-0" size={18} aria-hidden="true" />
          <p className="text-[13px] text-amber-800">
            This will send a notification to all active users of the selected role. Use sparingly to avoid notification fatigue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[12px] border border-[#E9E9E9] p-6 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bc-role" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Target Audience</label>
              <select id="bc-role" value={form.targetRole} onChange={setField('targetRole')} className={INPUT_CLS}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bc-type" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">Notification Type</label>
              <select id="bc-type" value={form.type} onChange={setField('type')} className={INPUT_CLS}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="bc-title" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">
              Title <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="bc-title"
              value={form.title}
              onChange={setField('title')}
              required
              maxLength={200}
              placeholder="e.g. Flash Sale is Live!"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label htmlFor="bc-message" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">
              Message <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <textarea
              id="bc-message"
              value={form.message}
              onChange={setField('message')}
              required
              rows={4}
              maxLength={1000}
              placeholder="e.g. Get up to 50% off on selected items. Offer ends midnight tonight!"
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="bc-link" className="text-[13px] font-semibold text-[#1A1A1A] block mb-1">
              Link <span className="text-[#60717B] font-normal">(optional)</span>
            </label>
            <input
              id="bc-link"
              value={form.link}
              onChange={setField('link')}
              placeholder="e.g. /shop/flash-sale"
              maxLength={500}
              className={INPUT_CLS}
            />
          </div>

          {hasPreview && (
            <div className="bg-[#FAFAFA] border border-[#E9E9E9] rounded-[10px] p-4" aria-label="Notification preview">
              <p className="text-[11px] font-semibold text-[#60717B] uppercase tracking-wide mb-2">Preview</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFB700]/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <FiBell size={14} className="text-[#FFB700]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1A1A1A]">{form.title || 'Notification Title'}</p>
                  <p className="text-[12px] text-[#60717B] mt-0.5">{form.message || 'Your message here…'}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 bg-[#FFB700] rounded-[8px] text-[14px] font-bold text-[#1A1A1A] hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              : <FiSend size={16} aria-hidden="true" />
            }
            {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </form>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AdminLayout>
  );
}