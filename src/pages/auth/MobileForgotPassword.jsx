import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

export default function MobileForgotPassword({
  email,
  setEmail,
  sent,
  loading,
  handleSubmit,
  INPUT_CLS
}) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FEF2E4] pb-12 overflow-y-auto font-sans relative" style={{ background: 'linear-gradient(149deg, rgba(255,255,255,1) 57%, rgba(254,242,228,1) 85%)' }}>
      
      {/* 1. Figma Illustration Top Section */}
      <div className="w-full pt-6 px-5 flex flex-col items-center z-10">
        <div className="w-full mt-2 flex justify-center max-h-[260px]">
          <img 
            src="/images/auth/auth-forgot-illustration.png" 
            alt="Forgot Password Illustration" 
            className="w-full max-w-[320px] object-contain h-auto select-none pointer-events-none" 
          />
        </div>
      </div>

      {/* 2. Main Forgot Password Card Container */}
      <div className="px-4 -mt-14 z-20 relative">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-6 shadow-md text-center">
          
          {/* Key/Lock Round Icon Indicator */}
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200 shadow-inner">
            <span className="text-xl" aria-hidden="true">🔑</span>
          </div>

          <h1 className="text-[20px] font-bold text-[#1A1A1A] tracking-tight">Forgot Your Password?</h1>
          <p className="text-[12px] text-[#60717B] mt-1 px-2 leading-relaxed">
            Enter your registered email address and we'll send you a secure link to reset your password. The link will expire in 1 hour.
          </p>

          {/* Social Auth Guard Warning Note */}
          <div className="flex items-start gap-2 bg-[#F9F9F9] border border-[#E0E0E0] rounded-[8px] p-3 my-4 text-left" role="note">
            <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5" aria-hidden="true">💡</span>
            <p className="text-[11px] text-[#60717B] font-medium leading-relaxed">
              If you signed up with Google or Facebook, please use those login options — password reset does not apply to social logins.
            </p>
          </div>

          {/* Core Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left" noValidate>
            <div>
              <label htmlFor="mob-forgot-email" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1.5">
                REGISTERED EMAIL ADDRESS *
              </label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="mob-forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  autoComplete="email"
                  className={`${INPUT_CLS} pl-9`}
                />
              </div>
            </div>

            {/* Action Buttons Stack */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFB700] text-black py-3 rounded-[6px] font-bold text-[14px] hover:bg-amber-500 active:bg-amber-600 transition-colors shadow-sm disabled:opacity-60 mt-2"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 border border-[#C5C5C5] bg-white rounded-[6px] py-2.5 text-[13px] font-bold text-[#1A1A1A] hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <FiArrowLeft size={14} aria-hidden="true" /> Back to Login
            </Link>
          </form>

          {/* Inline Navigation Redirection Shortcuts */}
          <div className="mt-4 text-center text-[12px] text-[#60717B] font-medium space-y-1">
            <p>
              Remembered your password?{' '}
              <Link to="/login" className="font-bold text-[#FFB700] hover:underline">Sign in →</Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#FFB700] hover:underline">Create one free →</Link>
            </p>
          </div>

          {/* ── AFTER CLICKING SEND LIVE LOG TRACK ENGINE ── */}
          <div className="border-t border-[#E9E9E9] mt-5 pt-4 text-left" aria-live="polite">
            <p className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-3">
              AFTER CLICKING SEND — YOU WILL SEE:
            </p>
            
            {sent ? (
              <div className="w-full bg-gray-50 border border-[#E9E9E9] rounded-[12px] p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2" aria-hidden="true">
                  <FiMail size={18} className="text-green-500" />
                </div>
                <h4 className="text-[14px] font-bold text-[#1A1A1A]">Reset Link Sent!</h4>
                <p className="text-[12px] text-[#60717B] mt-1 px-1 leading-normal">
                  We sent a password reset link to <strong className="text-[#1A1A1A]">{email}</strong>. Please check your inbox and spam folder. The link expires in 1 hour.
                </p>
                <p className="text-[11px] text-[#60717B] mt-2 font-medium">
                  Didn't receive it? <span className="text-gray-400 font-bold underline cursor-not-allowed">Resend (available in 60s)</span>
                </p>
              </div>
            ) : (
              <div className="w-full bg-gray-50 border border-[#E9E9E9] rounded-[12px] p-4 flex flex-col items-center text-center opacity-65" aria-hidden="true">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                  <FiMail size={18} className="text-green-400" />
                </div>
                <h4 className="text-[14px] font-bold text-gray-500">Reset Link Sent!</h4>
                <p className="text-[12px] text-gray-400 mt-1 leading-normal">
                  We sent a password reset link to <span className="font-semibold">amara@gmail.com</span>. Please check your inbox and spam folder. The link expires in 1 hour.
                </p>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  Didn't receive it? <span className="underline">Resend (available in 60s)</span>
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Background Graphic Accent Corner */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#FFB700] rounded-tl-full opacity-20 pointer-events-none z-0" />
    </div>
  );
}