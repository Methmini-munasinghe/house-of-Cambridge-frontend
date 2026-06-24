import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

// Requirements list check layout matching standard definitions
function MobileReq({ met, label }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
        {met ? <FiCheck size={11} /> : <FiX size={11} />}
      </div>
      <span className={`text-[12px] font-medium ${met ? 'text-green-600' : 'text-[#60717B]'}`}>{label}</span>
    </div>
  );
}

export default function MobileResetPassword({
  form,
  setForm,
  showPass,
  setShowPass,
  showConfirm,
  setShowConfirm,
  success,
  loading,
  reqs,
  token,
  handleSubmit,
  INPUT_CLS
}) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FEF2E4] pb-12 overflow-y-auto font-sans relative" style={{ background: 'linear-gradient(135deg, rgba(254,242,228,1) 22%, rgba(255,255,255,1) 64%)' }}>
      
      {/* 1. Figma Graphic Header Illustration Section */}
      <div className="w-full pt-6 px-5 flex flex-col items-center z-10">
        <div className="w-full mt-2 flex justify-center max-h-[240px]">
          <img 
            src="/images/auth/auth-reset-illustration.png" 
            alt="Reset Password Illustration" 
            className="w-full max-w-[280px] object-contain h-auto select-none pointer-events-none" 
          />
        </div>
      </div>

      {/* 2. Main Reset Password Form Card Container */}
      <div className="px-4 -mt-20 z-20 relative">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-6 shadow-md text-center">
          
          {/* Padlock Round Top Icon */}
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200 shadow-inner">
            <span className="text-xl" aria-hidden="true">🔒</span>
          </div>

          <h1 className="text-[20px] font-bold text-[#1A1A1A] tracking-tight">Set New Password</h1>
          <p className="text-[12px] text-[#60717B] mt-1 px-2 leading-relaxed">
            Choose a strong new password for your House of Cambridge account. This link is valid for **1 hour** only.
          </p>

          {/* Token verification note bar mapping to design layout */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-3 py-2 mt-4 text-left text-[11px] font-medium text-[#60717B]">
            🔗 Reset link verified for <span className="text-[#1A1A1A] font-bold">account</span> • Expires in 47 minutes
          </div>

          {/* Security Instruction Info Note */}
          <div className="flex items-start gap-2 bg-[#FFFDF9] border border-amber-200 rounded-[8px] p-3 my-3 text-left" role="note">
            <span className="text-amber-500 text-sm flex-shrink-0" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-amber-800 font-medium leading-normal">
              For your security, this reset link can only be used once and expires after 1 hour. If it has expired, please request a new one.
            </p>
          </div>

          {/* Core Submission Inputs Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left mt-4" noValidate>
            
            {/* New Password field row */}
            <div>
              <label htmlFor="mob-reset-password" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1.5">
                NEW PASSWORD *
              </label>
              <div className="relative">
                <input
                  id="mob-reset-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className={INPUT_CLS}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400 hover:text-gray-600 focus:outline-none uppercase">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm Password field row */}
            <div>
              <label htmlFor="mob-reset-confirm" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1.5">
                CONFIRM NEW PASSWORD *
              </label>
              <div className="relative">
                <input
                  id="mob-reset-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className={INPUT_CLS}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400 hover:text-gray-600 focus:outline-none uppercase">
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Dynamic Real-time Password Strength Requirements Tracker Box */}
            <div className="bg-[#F9F9F9] border border-[#E9E9E9] rounded-[12px] p-4 text-left" role="list">
              <p className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-2.5 border-b border-gray-100 pb-1">
                PASSWORD REQUIREMENTS
              </p>
              <div className="flex flex-col space-y-1">
                <MobileReq met={reqs.len} label="At least 8 characters" />
                <MobileReq met={reqs.upper} label="At least one uppercase letter (A-Z)" />
                <MobileReq met={reqs.num} label="At least one number (0-9)" />
                <MobileReq met={reqs.special} label="At least one special character (@$!%*?&)" />
                <MobileReq met={reqs.match} label="Passwords match" />
              </div>
            </div>

            {/* Submit Execution Button Control */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFB700] text-black py-3 rounded-[6px] font-bold text-[14px] hover:bg-amber-500 active:bg-amber-600 transition-colors shadow-sm disabled:opacity-60 mt-2"
            >
              {loading ? 'Updating…' : 'Set New Password'}
            </button>
          </form>

          {/* ── AFTER RESETTING LIVE RE-ROUTE PREVIEW MODULE ── */}
          <div className="border-t border-[#E9E9E9] mt-6 pt-4 text-left" aria-live="polite">
            <p className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-3">
              SUCCESS STATE PREVIEW:
            </p>
            
            {success ? (
              <div className="w-full bg-gray-50 border border-[#E9E9E9] rounded-[12px] p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2" aria-hidden="true">
                  <FiCheck size={20} className="text-green-500" />
                </div>
                <h4 className="text-[15px] font-bold text-[#1A1A1A]">Password Updated!</h4>
                <p className="text-[12px] text-[#60717B] mt-1 px-2 leading-normal">
                  Your password has been changed successfully. All other active sessions have been signed out for your security.
                </p>
                <Link to="/login" className="w-full bg-[#FFB700] text-black py-2.5 rounded-[6px] font-bold text-[13px] mt-4 block text-center">
                  → Sign in with new Password
                </Link>
              </div>
            ) : (
              <div className="w-full bg-gray-50 border border-[#E9E9E9] rounded-[12px] p-5 flex flex-col items-center text-center opacity-65" aria-hidden="true">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                  <FiCheck size={20} className="text-green-400" />
                </div>
                <h4 className="text-[15px] font-bold text-gray-500">Password Updated!</h4>
                <p className="text-[12px] text-gray-400 mt-1 leading-normal">
                  Your password has been changed successfully. All other active sessions have been signed out for your security.
                </p>
                <div className="w-full bg-gray-300 text-gray-500 py-2.5 rounded-[6px] font-bold text-[13px] mt-4 text-center cursor-not-allowed">
                  → Sign in with new Password
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Decorative Golden Corner Radial Splash */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#FFB700] rounded-tl-full opacity-20 pointer-events-none z-0" />
    </div>
  );
}