import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Navbar({ onEnterApp }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 sm:px-6">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full transition-all duration-500 backdrop-blur-md ${scrolled
          ? "max-w-[820px] mt-4 rounded-full border border-slate-800 bg-slate-950/70 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.08)] px-5"
          : "max-w-[1320px] mt-0 rounded-none border-b border-white/[0.04] bg-transparent px-2"
          }`}
      >
        <div
          className={`w-full flex items-center justify-between transition-all duration-500 ${scrolled ? "py-2" : "py-4"
            }`}
        >
          {/* Brand */}
          <a
            className="flex items-center text-white no-underline font-sans font-bold tracking-tight group"
            href="#home"
          >
            <div
              className={`relative flex items-center justify-center rounded-xl text-white font-black bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all duration-500 ${scrolled ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm"
                }`}
            >
              C
              <div className="absolute inset-0.5 rounded-[10px] border border-white/20 pointer-events-none" />
            </div>

            <span
              className={`tracking-tight font-black ml-2.5 transition-all duration-500 ${scrolled ? "text-sm" : "text-base"
                }`}
            >
              ClarityNote{" "}
              <span className="text-indigo-400 font-medium">AI</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative font-semibold no-underline hover:text-white transition-all duration-500 group ${scrolled
                  ? "px-3 py-1.5 text-xs text-slate-300"
                  : "px-4 py-2 text-sm text-slate-400"
                  }`}
              >
                <span className="relative z-10">{link.label}</span>

                <span className="absolute inset-0 bg-white/[0.04] rounded-full scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none" />
              </a>
            ))}

            {/* Desktop Open App Button */}
            <button
              className={`relative font-sans font-bold text-center text-white cursor-pointer border rounded-full overflow-hidden outline-none select-none transition-all duration-500 group/burst
                bg-[#1a1a1a] border-[#2c2c2c] hover:bg-[#292929] hover:border-[#666666] active:scale-95 ${scrolled
                  ? "ml-4 w-24 h-7 text-[10px] tracking-wide"
                  : "ml-6 w-28 h-9 text-xs tracking-wider"
                }`}
              onClick={onEnterApp}
            >
              <span className="absolute inset-0 w-full h-full rounded-full transition-transform duration-700 ease-out scale-0 bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_70%)] group-hover/burst:scale-[4.5] pointer-events-none" />

              <span className="relative z-10">Open App</span>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg border border-white/10 bg-slate-900/40 gap-1 cursor-pointer text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span
              className={`block w-4 h-0.5 bg-white transition-transform duration-300 ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""
                }`}
            />
            <span
              className={`block w-4 h-0.5 bg-white transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`block w-4 h-0.5 bg-white transition-transform duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""
                }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-1 pb-4 pt-1">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-slate-400 font-semibold text-sm no-underline hover:text-white hover:bg-white/[0.04] rounded-xl transition-all duration-150"
                  >
                    {link.label}
                  </a>
                ))}

                {/* NEW MOBILE OPEN APP BUTTON */}
                <button
                  className="group relative mt-3 w-full h-11 rounded-xl overflow-hidden
                  bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
                  text-white font-semibold text-sm tracking-wide
                  shadow-[0_8px_25px_rgba(99,102,241,0.35)]
                  hover:shadow-[0_12px_35px_rgba(99,102,241,0.45)]
                  active:scale-[0.98]
                  transition-all duration-300"
                  onClick={() => {
                    setMobileOpen(false);
                    onEnterApp();
                  }}
                >
                  {/* Shine Animation */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Glow Layer */}
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Open

                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}

export default Navbar;