import { FaShieldAlt, FaMedkit, FaHeartbeat } from "react-icons/fa";

function Footer() {
  const legalLinks = [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms and Conditions", href: "#terms" },
    { name: "Refund and Cancellation", href: "#security" },
    { name: "About Us", href: "#about" },
    { name: "Site Map", href: "#sitemap" }
  ];

  return (
    <footer className="bg-[#1a3b6e] text-white pt-12 pb-8 border-t-4 border-[#00909e]" id="contact">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        {/* Official Initiatives Badge Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            <FaMedkit className="text-amber-400 text-xl" />
            <div className="text-left text-xs font-semibold">
              <span className="block text-amber-300 text-[10px] uppercase tracking-wider font-bold">Initiative</span>
              Ministry of Health &amp; Family Care
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            <FaHeartbeat className="text-emerald-400 text-xl" />
            <div className="text-left text-xs font-semibold">
              <span className="block text-emerald-300 text-[10px] uppercase tracking-wider font-bold">Engine</span>
              Digital India Power To Empower
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            <FaShieldAlt className="text-cyan-400 text-xl" />
            <div className="text-left text-xs font-semibold">
              <span className="block text-cyan-300 text-[10px] uppercase tracking-wider font-bold">Security</span>
              HIPAA &amp; Ayushman Bharat Compliant
            </div>
          </div>
        </div>

        {/* Footer Navigation Links */}
        <div className="py-6 flex flex-wrap justify-center items-center gap-4 text-xs font-medium opacity-90">
          {legalLinks.map((link, idx) => (
            <span key={link.name} className="flex items-center gap-4">
              <a href={link.href} className="hover:underline text-white no-underline">
                {link.name}
              </a>
              {idx < legalLinks.length - 1 && <span className="opacity-40">|</span>}
            </span>
          ))}
        </div>

        {/* Copyright & Technical Details */}
        <div className="text-center text-[11px] text-slate-300 space-y-1 pt-2 opacity-80">
          <p>Best viewed in modern browsers (Chrome, Edge, Firefox, Safari) at 1920×1080 resolution.</p>
          <p>© {new Date().getFullYear()}, ClarityNote AI (ORS Portal Node) ® | Govt. &amp; Enterprise Infrastructure</p>
          <p className="text-[10px] text-amber-300/80 pt-1">Last updated on Aug 21, 2026 • Version 3.8.13</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;