import { useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function PaymentProcessingPage() {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-[900px] bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row">

        <div
          className="md:w-[45%] bg-[#FFF9EC] flex items-center justify-center p-10 min-h-[300px]"
          aria-hidden="true"
        >
          <img
            src="/images/checkout/payment-processing.png"
            alt=""
            className="w-full max-w-[280px] object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="hidden flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-[#FFB700]/20 rounded-full flex items-center justify-center mb-4">
              <svg viewBox="0 0 80 80" className="w-14 h-14" fill="none" aria-hidden="true">
                <rect x="10" y="25" width="60" height="38" rx="5" fill="#FFB700" opacity="0.2" />
                <rect x="10" y="25" width="60" height="38" rx="5" stroke="#FFB700" strokeWidth="2.5" />
                <rect x="10" y="36" width="60" height="8" fill="#FFB700" opacity="0.5" />
                <rect x="18" y="50" width="12" height="6" rx="2" fill="#FFB700" />
                <rect x="34" y="50" width="20" height="6" rx="2" fill="#FFB700" opacity="0.4" />
              </svg>
            </div>
            <p className="text-[#60717B] text-[13px]">Processing your payment</p>
          </div>
        </div>

        <main
          className="md:w-[55%] p-8 md:p-12 flex flex-col justify-center"
          role="status"
          aria-live="polite"
          aria-label="Payment processing status"
        >
          <div className="flex justify-center mb-6" aria-hidden="true">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#E9E9E9]" />
              <div className="absolute inset-0 rounded-full border-4 border-[#FFB700] border-t-transparent animate-spin" />
            </div>
          </div>

          <h1 className="text-[24px] font-black text-[#1A1A1A] text-center mb-2">
            Processing Your Payment
          </h1>
          <p className="text-[13px] text-[#60717B] text-center mb-6">
            Please wait while we securely process your transaction.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4" role="alert">
            <div className="flex items-start gap-3">
              <FiAlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-bold text-amber-800 mb-1">
                  Do Not Close Or Refresh This Page
                </p>
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  Closing this page while payment is being processed may result in a failed
                  transaction. You will be redirected automatically once the process is complete.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4 text-green-500 fill-current flex-shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[11px] text-[#60717B]">256-bit SSL Encrypted · Secure Payment</span>
          </div>
        </main>
      </div>
    </div>
  );
}