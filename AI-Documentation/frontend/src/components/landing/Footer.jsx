import { useState } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaPinterestP,
  FaInstagram,
  FaPaperPlane,
  FaChevronUp,
  FaCheck
} from "react-icons/fa";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="w-full bg-[#181b22] text-slate-300 font-sans relative" id="contact">
      {/* ── Main 4-Column Footer Section ────────────────────── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start text-left">
          
          {/* Column 1: Logo & Social Links (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            {/* White Logo Container Box */}
            <div className="bg-white rounded-lg p-2.5 px-4 mb-6 shadow-sm inline-block">
              <img
                src="/logo.jpg"
                alt="CareWeave Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            <h4 className="text-[#00c988] font-bold text-sm uppercase tracking-wider mb-4">
              Follow us
            </h4>

            {/* Social Icons Row */}
            <div className="flex items-center gap-4 text-white text-base">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="text-white/80 hover:text-[#00c988] transition-colors p-1"
              >
                <FaFacebookF />
              </a>
              <a
                href="#twitter"
                aria-label="Twitter"
                className="text-white/80 hover:text-[#00c988] transition-colors p-1"
              >
                <FaTwitter />
              </a>
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="text-white/80 hover:text-[#00c988] transition-colors p-1"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="#pinterest"
                aria-label="Pinterest"
                className="text-white/80 hover:text-[#00c988] transition-colors p-1"
              >
                <FaPinterestP />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="text-white/80 hover:text-[#00c988] transition-colors p-1"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Column 2: Useful Links (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <h4 className="text-[#00c988] font-bold text-base mb-5 tracking-tight">
              Useful Links
            </h4>
            <ul className="space-y-3 p-0 m-0 list-none text-xs text-slate-300 font-medium">
              <li>
                <a href="#workflow" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Clinical Events &amp; Webinars
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Volunteer &amp; Medical Staff
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Diagnostic Labs &amp; Gallery
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Care Coordination Blog
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Clinical Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Pages (lg:col-span-2) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <h4 className="text-[#00c988] font-bold text-base mb-5 tracking-tight">
              Pages
            </h4>
            <ul className="space-y-3 p-0 m-0 list-none text-xs text-slate-300 font-medium">
              <li>
                <a href="#about" className="hover:text-white transition-colors text-slate-300 no-underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="/auth" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Doctor Workstation
                </a>
              </li>
              <li>
                <a href="/auth" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Patient Portal
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors text-slate-300 no-underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us & Newsletter (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <h4 className="text-[#00c988] font-bold text-base mb-5 tracking-tight">
              Contact Us
            </h4>
            
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed mb-6 font-medium">
              <p>Ward No. 5, Digital Health Block,</p>
              <p>AIIMS Institutional Area, Ansari Nagar,</p>
              <p>New Delhi, Delhi, India</p>
              <p>Pin-Code: 110029</p>
              <p className="pt-1">
                <a href="mailto:careweave.health@gmail.com" className="text-slate-300 hover:text-[#00c988] no-underline transition-colors">
                  careweave.health@gmail.com
                </a>
              </p>
              <p>+91 98765 43210</p>
            </div>

            {/* Newsletter Input */}
            <form onSubmit={handleSubscribe} className="w-full max-w-sm">
              <div className="relative flex items-center bg-[#292e39] rounded-lg overflow-hidden border border-slate-700 focus-within:border-[#00c988] transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent text-white placeholder-slate-400 text-xs px-3.5 py-2.5 outline-none border-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="bg-transparent text-white hover:text-[#00c988] px-3.5 py-2.5 transition-colors cursor-pointer border-none flex items-center justify-center"
                >
                  {subscribed ? (
                    <FaCheck className="text-xs text-[#00c988]" />
                  ) : (
                    <FaPaperPlane className="text-xs" />
                  )}
                </button>
              </div>
              {subscribed && (
                <span className="text-[10px] text-[#00c988] font-bold mt-1.5 block">
                  Thank you for subscribing!
                </span>
              )}
            </form>
          </div>

        </div>
      </div>

      {/* ── Sub-Footer Bar (Darker Strip) ───────────────────── */}
      <div className="w-full bg-[#111317] border-t border-slate-800/80 py-5 px-6 sm:px-10">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between">
          <div className="text-xs text-slate-400 text-left font-normal">
            &copy; {new Date().getFullYear()} CareWeave Health AI Foundation. All Rights Reserved. Developed by{" "}
            <span className="text-[#00c988] font-semibold">Digital India &amp; Ayushman Bharat Mission</span>
          </div>

          {/* Green Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-10 h-10 rounded bg-[#00c988] hover:bg-[#00b378] text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer border-none shrink-0"
          >
            <FaChevronUp className="text-sm" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;