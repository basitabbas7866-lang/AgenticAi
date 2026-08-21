import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaTachometerAlt, FaUserPlus, FaSignInAlt, FaMobileAlt } from "react-icons/fa";

function Navbar({ onEnterApp }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Dashboard", href: "#workflow", icon: <FaTachometerAlt /> },
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Reviews", href: "#reviews" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-md">
      {/* ── Top Utility Header (ORS Navy Bar) ──────────────── */}
      <div className="w-full bg-[#1a3b6e] text-white text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-[#00909e]/30">
        <div className="flex items-center gap-3 font-medium">
          <span className="bg-[#00909e] text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
            Medical Care
          </span>
          <span className="hidden md:inline tracking-wide opacity-90">
            A Digital Health AI Initiative • Smart Patient &amp; Clinical Portal
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] opacity-90">
          <a href="#workflow" className="hover:underline text-white flex items-center gap-1">
            <FaMobileAlt className="text-amber-400" /> App Portal
          </a>
          <span className="opacity-40">|</span>
          <a href="#contact" className="hover:underline text-white">FAQs</a>
          <span className="opacity-40">|</span>
          <a href="#contact" className="hover:underline text-white">Contact</a>
          <span className="opacity-40">|</span>
          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-semibold">English</span>
        </div>
      </div>

      {/* ── Main Navbar ────────────────────────────────────── */}
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between">
        {/* Brand logo (CareWeave Logo) */}
        <a href="#home" className="flex items-center gap-3 no-underline group">
          <img src="/logo.jpg" alt="CareWeave Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
          <span className="text-[10px] text-[#4a5568] font-semibold tracking-wider uppercase hidden sm:inline border-l border-slate-200 pl-3">
            Online Patient &amp; Clinical System
          </span>
        </a>

        {/* Desktop Links & ORS Yellow Action Button */}
        <div className="hidden lg:flex items-center gap-6">
          <a
            href="#home"
            className="flex items-center gap-1.5 text-xs font-bold text-[#1a7f8e] hover:text-[#1a3b6e] no-underline transition-colors px-2 py-1"
          >
            <FaHome className="text-sm" /> Home
          </a>

          {links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="text-xs font-bold text-[#4a5568] hover:text-[#1a7f8e] no-underline transition-colors px-2 py-1 flex items-center gap-1.5"
            >
              {link.icon && <span className="text-[#1a7f8e]">{link.icon}</span>}
              {link.label}
            </a>
          ))}

          {/* ORS Yellow Register / Login CTA Button */}
          <button
            onClick={onEnterApp}
            className="btn-pill btn-amber text-xs px-5 py-2 shadow-sm ml-2 flex items-center gap-2"
          >
            <FaSignInAlt className="text-sm" />
            <span>Register / Login</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg border border-[#1a3b6e]/20 bg-[#1a3b6e]/5 gap-1.5 cursor-pointer text-[#1a3b6e]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`block w-5 h-0.5 bg-[#1a3b6e] transition-transform duration-300 ${mobileOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#1a3b6e] transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#1a3b6e] transition-transform duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[4px]" : ""}`} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 flex flex-col gap-3 shadow-lg"
          >
            {links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold text-[#1a3b6e] no-underline py-1.5 flex items-center gap-2 border-b border-slate-100"
              >
                {link.icon} {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                onEnterApp();
              }}
              className="mt-2 w-full py-2.5 rounded-full bg-[#e8a020] text-[#1a3b6e] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <FaSignInAlt /> Register / Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;