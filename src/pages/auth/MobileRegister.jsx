import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function MobileRegister({
  form,
  set,
  strength,
  showPass,
  setShowPass,
  showConfirm,
  setShowConfirm,
  loading,
  socialLoading,
  handleSubmit,
  handleGoogleLogin,
  handleFacebookLogin,
  INPUT_CLS,
  LABEL_CLS,
  SECTION_CLS,
  GoogleIcon,
  FacebookIcon,
  NEXT_STEPS,
  MEMBER_BENEFITS
}) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FEF2E4] pb-12 overflow-y-auto font-sans relative">
      
      {/* 1. Figma Top Section: Header Title & Product Banner */}
      <div className="w-full pt-8 px-5 flex flex-col items-start z-10">
        <div className="mb-4">
          <Link to="/">
            <img src="/images/logo.png" alt="House of Cambridge" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        
        <h2 className="font-black text-[26px] text-[#1A1A1A] tracking-tight leading-[1.1] text-left uppercase">
          SIGN UP NOW!<br />
          <span className="text-[#FFB700]">UNLOCK DEALS,<br />REWARDS & MORE.</span>
        </h2>
        
        {/* Product Showcase Background Asset Container */}
        <div className="w-full mt-4 flex justify-center transform scale-105">
          <img 
            src="/images/auth/auth-login-bg.png" 
            alt="HOC Sign Up Banner" 
            className="w-full max-w-[340px] object-contain h-auto select-none pointer-events-none" 
          />
        </div>
      </div>

      {/* 2. Core Registration Form Card Container */}
      <div className="px-4 -mt-20 z-20 relative">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-5 shadow-md">
          <h1 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">Create Your Account</h1>
          <p className="text-[13px] text-[#60717B] mb-4">Join House of Cambridge — it's free and takes less than a minute.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* ── PERSONAL INFORMATION SECTION ── */}
            <p className={`${SECTION_CLS} text-[11px] font-bold text-[#60717B] uppercase tracking-wider pb-1.5 border-b border-[#E9E9E9]`}>
              Personal Information
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mob-reg-fname" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">First Name *</label>
                <input id="mob-reg-fname" type="text" value={form.firstName} onChange={set('firstName')} required placeholder="Amara" autoComplete="given-name" className={INPUT_CLS} />
              </div>
              <div>
                <label htmlFor="mob-reg-lname" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Last Name *</label>
                <input id="mob-reg-lname" type="text" value={form.lastName} onChange={set('lastName')} required placeholder="Perera" autoComplete="family-name" className={INPUT_CLS} />
              </div>
            </div>

            <div>
              <label htmlFor="mob-reg-phone" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Phone Number</label>
              <input id="mob-reg-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+94 77 123 4567" autoComplete="tel" className={INPUT_CLS} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mob-reg-dob" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Date of Birth</label>
                <input id="mob-reg-dob" type="date" value={form.dob} onChange={set('dob')} autoComplete="bday" className={INPUT_CLS} />
              </div>
              <div>
                <label htmlFor="mob-reg-gender" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Gender</label>
                <select id="mob-reg-gender" value={form.gender} onChange={set('gender')} className={INPUT_CLS}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* ── ACCOUNT CREDENTIALS SECTION ── */}
            <p className={`${SECTION_CLS} text-[11px] font-bold text-[#60717B] uppercase tracking-wider pb-1.5 border-b border-[#E9E9E9] pt-2`}>
              Account Credentials
            </p>

            <div>
              <label htmlFor="mob-reg-email" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Email Address *</label>
              <input id="mob-reg-email" type="email" value={form.email} onChange={set('email')} required placeholder="amara@email.com" autoComplete="email" className={INPUT_CLS} />
            </div>

            <div>
              <label htmlFor="mob-reg-password" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Password *</label>
              <div className="relative">
                <input
                  id="mob-reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  className={`${INPUT_CLS} pr-10`}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {strength && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.w }} />
                  </div>
                  <span className={`text-[11px] font-bold ${strength.text}`}>{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="mob-reg-confirm" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  id="mob-reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  required
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={`${INPUT_CLS} pr-10`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none">
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* ── PREFERENCES & CONSENT ── */}
            <p className={`${SECTION_CLS} text-[11px] font-bold text-[#60717B] uppercase tracking-wider pb-1.5 border-b border-[#E9E9E9] pt-2`}>
              Consent & Preferences
            </p>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2.5 text-[13px] text-[#1A1A1A] font-medium cursor-pointer select-none">
                <input type="checkbox" checked={form.newsletter} onChange={set('newsletter')} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#FFB700] accent-[#FFB700] focus:ring-0" />
                <span>Subscribe to our newsletter for deals and updates</span>
              </label>

              <label className="flex items-start gap-2.5 text-[13px] text-[#1A1A1A] font-medium cursor-pointer select-none">
                <input type="checkbox" checked={form.terms} onChange={set('terms')} required className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#FFB700] accent-[#FFB700] focus:ring-0" />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#FFB700] font-bold underline">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-[#FFB700] font-bold underline">Privacy Policy</Link> *
                </span>
              </label>
            </div>

            {/* Register Execution Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#FFB700] text-black py-3 rounded-[6px] font-bold text-[14px] hover:bg-amber-500 active:bg-amber-600 transition-colors shadow-sm mt-4 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create My Account'}
            </button>
          </form>

          {/* Oauth Social Divider Line */}
          <div className="flex items-center gap-3 my-5" aria-hidden="true">
            <div className="flex-1 h-px bg-[#E9E9E9]" />
            <span className="text-[11px] text-[#60717B] font-bold uppercase tracking-wider">or sign up with</span>
            <div className="flex-1 h-px bg-[#E9E9E9]" />
          </div>

          {/* Social Sign Up Cluster Buttons */}
          <div className="space-y-2.5">
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={!!socialLoading} 
              className="w-full flex items-center justify-center gap-3 border border-[#C5C5C5] bg-white rounded-[6px] py-2.5 text-[13px] font-bold text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            >
              {socialLoading === 'google' ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>
            <button 
              type="button" 
              onClick={handleFacebookLogin} 
              disabled={!!socialLoading} 
              className="w-full flex items-center justify-center gap-3 border border-[#C5C5C5] bg-white rounded-[6px] py-2.5 text-[13px] font-bold text-[#1A1A1A] hover:bg-gray-50 transition-colors"
            >
              {socialLoading === 'facebook' ? <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <FacebookIcon />}
              Continue with Facebook
            </button>
          </div>

          <p className="text-center text-[13px] text-[#60717B] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#FFB700] hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>

      {/* 3. Figma Instruction Steps Component Block */}
      <div className="px-4 mt-4 relative z-10">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-5 shadow-sm">
          <h2 className="text-[12px] font-bold text-[#60717B] uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
            What Happens Next?
          </h2>
          <ol className="space-y-4">
            {NEXT_STEPS.map(({ n, text }) => (
              <li key={n} className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-[#FFB700] text-black text-[12px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </span>
                <p className="text-[13px] font-medium text-[#1A1A1A] pt-0.5 leading-tight">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 4. Figma Loyalty Member Benefits Panel */}
      <div className="px-4 mt-4 relative z-10">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-5 shadow-sm">
          <h2 className="text-[12px] font-bold text-[#60717B] uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
            Member Benefits
          </h2>
          <ul className="space-y-3.5">
            {MEMBER_BENEFITS.map((benefit) => (
              <li key={benefit} className="text-[13px] font-bold text-[#1A1A1A] flex items-center gap-2">
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Security Context Data Warning Box */}
      <div className="px-4 mt-4 relative z-10">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-5 shadow-sm">
          <h2 className="text-[12px] font-bold text-[#60717B] uppercase tracking-widest mb-2 border-b border-gray-100 pb-1.5">
            Your Data Is Safe
          </h2>
          <p className="text-[12px] text-[#60717B] leading-relaxed font-medium">
            We use AES-256 encryption and never share your personal data with third parties without your consent. Read our{' '}
            <Link to="/privacy-policy" className="text-[#FFB700] font-bold underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Background Graphic Accents */}
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#FFB700] rounded-tl-full opacity-35 pointer-events-none z-0" />
    </div>
  );
}