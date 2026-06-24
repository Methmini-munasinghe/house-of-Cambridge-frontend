import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function MobileLogin({
  form,
  setForm,
  showPass,
  setShowPass,
  remember,
  setRemember,
  loading,
  socialLoading,
  handleSubmit,
  handleGoogleLogin,
  handleFacebookLogin,
  INPUT_CLS,
  GoogleIcon,
  FacebookIcon,
  BENEFITS
}) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#FEF2E4] pb-10 overflow-y-auto font-sans relative">
      
      {/* 1. Figma Top Section: Welcome Banner Text & Product Illustration Grid */}
      <div className="w-full pt-8 px-5 flex flex-col items-start z-10">
        <div className="mb-5">
          <Link to="/">
            <img src="/images/logo.png" alt="House of Cambridge" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        
        <h2 className="font-black text-[26px] text-[#1A1A1A] tracking-tight leading-[1.1] text-left uppercase">
          WELCOME BACK!<br />
          <span className="text-[#FFB700]">SHOP SMARTER,<br />FASTER & EASIER.</span>
        </h2>
        
        {/* Floating Product Image Container */}
        <div className="w-full mt-4 flex justify-center transform scale-105">
          <img 
            src="/images/auth/auth-login-bg.png" 
            alt="HOC Products" 
            className="w-full max-w-[340px] object-contain h-auto select-none pointer-events-none" 
          />
        </div>
      </div>

      {/* 2. Central Form Card Container */}
      <div className="px-4 -mt-20 z-20 relative">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-6 shadow-md">
          <h1 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">Welcome Back</h1>
          <p className="text-[13px] text-[#60717B] mb-5">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field Block */}
            <div>
              <label htmlFor="mobile-email" className="block text-[11px] font-bold text-[#60717B] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="mobile-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="amara@gmail.com"
                autoComplete="email"
                className={INPUT_CLS}
              />
            </div>

            {/* Password Field Block */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="mobile-password" className="text-[11px] font-bold text-[#60717B] uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link to="/forgot-password" className="text-[12px] text-[#1A1A1A] font-bold underline decoration-1 hover:text-[#FFB700]">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="mobile-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${INPUT_CLS} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Device Remember Token State Checkbox */}
            <div className="py-0.5">
              <label className="flex items-center gap-2 text-[13px] text-[#1A1A1A] font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 text-[#FFB700] accent-[#FFB700] focus:ring-0" 
                />
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Control Action Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#FFB700] text-black py-3 rounded-[6px] font-bold text-[14px] hover:bg-amber-500 transition-colors shadow-sm mt-2 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Alternative Social Oauth Connect Divider Line */}
          <div className="flex items-center gap-3 my-5" aria-hidden="true">
            <div className="flex-1 h-px bg-[#E9E9E9]" />
            <span className="text-[11px] text-[#60717B] font-bold uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-[#E9E9E9]" />
          </div>

          {/* Social Platform Action Call Clustered Buttons */}
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

          {/* Alternative Account Redirection Links Block */}
          <div className="text-center text-[13px] text-[#60717B] mt-5 space-y-1.5">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#FFB700] hover:underline">Create one free →</Link>
            </p>
            <p className="pt-0.5">
              <Link to="/shop" className="font-bold text-[#FFB700] hover:underline tracking-wide">Continue as Guest →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Why Create Account Benefits Grid Panel Box */}
      <div className="px-4 mt-4 relative z-10">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-5 shadow-sm">
          <h2 className="text-[12px] font-bold text-[#60717B] uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
            Why Create An Account?
          </h2>
          <ul className="space-y-4">
            {BENEFITS.map(({ icon, title, desc }) => (
              <li key={title} className="flex gap-3.5 items-start">
                <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                <div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] leading-tight">{title}</p>
                  <p className="text-[12px] text-[#60717B] mt-0.5 leading-normal">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Customer Care Help Support Desk Panel Box */}
      <div className="px-4 mt-4 relative z-10">
        <div className="w-full bg-white border border-[#C5C5C5] rounded-[16px] p-5 shadow-sm">
          <h2 className="text-[12px] font-bold text-[#60717B] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
            Need Help?
          </h2>
          <ul className="space-y-2.5 text-[13px] text-[#1A1A1A] font-bold">
            <li><a href="tel:+94112847846" className="flex items-center gap-2 hover:text-[#FFB700]"><span aria-hidden="true">📞</span> +94 11 284 7846</a></li>
            <li><a href="tel:+94764604227" className="flex items-center gap-2 hover:text-[#FFB700]"><span aria-hidden="true">📞</span> +94 76 460 4227</a></li>
            <li><a href="mailto:info@houseofcambridge.co.uk" className="flex items-center gap-2 hover:text-[#FFB700]"><span aria-hidden="true">✉️</span> info@houseofcambridge.co.uk</a></li>
            <li className="text-[11px] text-[#60717B] font-medium pt-0.5">24/7 Support</li>
          </ul>
        </div>
      </div>

      {/* 5. Figma Background Corner Circle Shapes */}
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#FFB700] rounded-tl-full opacity-35 pointer-events-none z-0" />
    </div>
  );
}