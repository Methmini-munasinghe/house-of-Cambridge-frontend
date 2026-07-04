import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Subscribed! You get 20% off your next order.');
    setEmail('');
  };

  return (
    <footer className="bg-[#171C26] text-gray-400">

      <div className="relative overflow-hidden md:h-[170px] py-6 md:py-0" style={{ background: '#758688' }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-14 h-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-0 text-center md:text-left relative">

          <div className="flex-shrink-0">
            <p className="text-white font-black text-[13px] md:text-[14px] tracking-wide mb-0.5">Stay Updated with Us</p>
            <h3 className="text-white font-black leading-tight mb-0.5 text-[24px] md:text-[34px]">
              Get <span className="text-[#FFB700]">20% Off</span> Discount Coupon
            </h3>
            <p className="text-white font-black text-[13px] md:text-[14px]">by Subscribe our Newsletter</p>
          </div>

          <div className="hidden md:flex items-center flex-shrink-0 pointer-events-none select-none" aria-hidden="true">
            <img src="/images/arrow.png" alt="" className="w-[100px] h-[100px] object-contain -mr-4 z-10 flex-shrink-0" />
            <img src="/images/headphone.png" alt="" className="h-[160px] w-auto object-contain flex-shrink-0" />
            <img src="/images/newsletter-email.png" alt="" className="w-[70px] h-[70px] object-contain ml-2 flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8 md:py-10 flex flex-col sm:flex-row sm:justify-between gap-8 border-b border-white/5">

        <div className="w-full sm:w-auto sm:max-w-[260px]">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <img src="/images/logo.png" alt="House of Cambridge" className="h-9 md:h-13 w-auto object-contain" />
          </div>
          <p className="text-[11px] md:text-[14px] leading-relaxed text-white mb-2">
            We are more than just an online store; we are a platform built to deliver quality, convenience, and trust.
          </p>
          <p className="text-[#FFB700] text-[11px] md:text-[14px] font-semibold mb-3 md:mb-4">Shop with confidence!</p>
        </div>

        <div className="w-full sm:w-auto">
          <h4 className="text-[#FFB700] text-[12px] md:text-[14px] font-bold mb-2 md:mb-3">ABOUT</h4>
          <ul className="space-y-1.5 md:space-y-2 text-[11px] md:text-[13px]">
            <li><Link to="/about" className="text-white hover:text-[#FFB700] transition-colors">About Us</Link></li>
            <li><Link to="/privacy-policy" className="text-white hover:text-[#FFB700] transition-colors">Privacy Policy</Link></li>
            <li><Link to="/return-policy" className="text-white hover:text-[#FFB700] transition-colors">Return and Refund Policy</Link></li>
            <li><Link to="/terms" className="text-white hover:text-[#FFB700] transition-colors">Terms and Conditions</Link></li>
          </ul>
        </div>

        <div className="w-full sm:w-auto">
          <h4 className="text-[#FFB700] text-[12px] md:text-[14px] font-bold mb-2 md:mb-3 opacity-0 select-none" aria-hidden="true">Newsletter</h4>
          <form onSubmit={handleNewsletter} className="flex items-stretch max-w-[280px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              required
              className="flex-1 min-w-0 bg-white text-[#171C26] text-[12px] md:text-[13px] placeholder:text-gray-400 rounded-l-[6px] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FFB700]"
            />
            <button
              type="submit"
              className="bg-[#FFB700] text-black text-[12px] md:text-[13px] font-bold px-3 md:px-4 rounded-r-[6px] whitespace-nowrap hover:bg-amber-500 transition-colors"
            >
              Subscribe Now
            </button>
          </form>
        </div>

        <div className="w-full sm:w-auto">
          <h4 className="text-[#FFB700] text-[12px] md:text-[14px] font-bold mb-2 md:mb-3">CONTACT US</h4>
          <ul className="space-y-1.5 md:space-y-2 text-[11px] md:text-[13px]">
            <li className="flex items-center gap-1.5 md:gap-2">
              <Icon icon="mdi:whatsapp" width={12} className="md:w-[14px] text-green-500 shrink-0" aria-hidden="true" />
              <a href="https://wa.me/94764604227" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FFB700] transition-colors">076 460 4227</a>
            </li>
            <li className="flex items-center gap-1.5 md:gap-2">
              <Icon icon="mdi:phone" width={12} className="md:w-[14px] text-red-500 shrink-0" aria-hidden="true" />
              <a href="tel:+94112847846" className="text-white hover:text-[#FFB700] transition-colors">0112 847 846</a>
            </li>
            <li className="flex items-center gap-1.5 md:gap-2">
              <Icon icon="mdi:email" width={12} className="md:w-[14px] text-yellow-500 shrink-0" aria-hidden="true" />
              <a href="mailto:info@houseofcambridge.co.uk" className="text-white hover:text-[#FFB700] transition-colors break-all">
                info@houseofcambridge.co.uk
              </a>
            </li>
            <li className="flex items-start gap-1.5 md:gap-2">
              <Icon icon="mdi:map-marker" width={12} className="md:w-[14px] text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-white">No 63 Old Road, Pannipitiya</span>
            </li>
          </ul>
          <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4" aria-label="Social media links">
            <a
              href="https://www.facebook.com/share/1EvLTYix5L/?mibextid=wwXIfr"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 md:w-7 md:h-7 bg-[#1877F2] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Icon icon="mdi:facebook" width={12} className="md:w-[14px] text-white" />
            </a>
            <a
              href="https://www.instagram.com/houseofcambridge"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            >
              <Icon icon="mdi:instagram" width={12} className="md:w-[14px] text-white" />
            </a>
            <a
              href="https://www.tiktok.com/@houseofcambridge1"
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 md:w-7 md:h-7 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Icon icon="logos:tiktok-icon" width={12} className="md:w-[14px]" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-4 text-center text-xs text-gray-500">
        <span>©2026 Developed by Lee Harvey. All rights reserved.</span>
      </div>
    </footer>
  );
}