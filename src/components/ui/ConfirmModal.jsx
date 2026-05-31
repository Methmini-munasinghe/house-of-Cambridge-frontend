import { useEffect, useCallback } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    },
    [onClose, loading]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const btnColor = isDanger
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-[#FFB700] hover:bg-amber-500 text-[#1A1A1A]';
  const iconBg   = isDanger ? 'bg-red-100' : 'bg-amber-100';
  const iconColor = isDanger ? 'text-red-600' : 'text-amber-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div className="absolute inset-0 bg-black/50" onClick={!loading ? onClose : undefined} aria-hidden="true" />
      <div className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-[420px] p-6 animate-fade-in">
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[#60717B] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
            <FiAlertTriangle size={20} className={iconColor} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-modal-title" className="text-[16px] font-bold text-[#1A1A1A] mb-1">{title}</h3>
            <p id="confirm-modal-desc" className="text-[14px] text-[#60717B] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-[14px] font-medium text-[#60717B] border border-[#E9E9E9] rounded-[8px] hover:bg-[#FAFAFA] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-[14px] font-semibold rounded-[8px] transition-colors disabled:opacity-50 flex items-center gap-2 ${btnColor}`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}