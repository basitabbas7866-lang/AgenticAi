import { useState } from "react";
import {
  FaArrowRight,
  FaBrain,
  FaCalendarCheck,
  FaUserMd,
  FaQrcode,
  FaStethoscope,
  FaHospital,
  FaChevronRight
} from "react-icons/fa";

const heroHighlights = [
  {
    title: "1. Speaker-Aware Voice Capture",
    desc: "AI automatically separates doctor and patient dialogue in real-time."
  },
  {
    title: "2. Automatic SOAP Note Draft",
    desc: "Generates structured Subjective, Objective, Assessment & Plan notes instantly."
  },
  {
    title: "3. Multi-Agent Care Tracking",
    desc: "Monitors referrals, appointments, and pending lab results automatically."
  }
];

const Hero = ({ onEnterApp }) => {
  const [activeHighlight, setActiveHighlight] = useState(0);

  return (
    <section className="pt-28 pb-10 bg-[#f5f7fa]" id="home">
      {/* ── ORS Full-Width Blue/Teal Banner Container ──────── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        {/* Sub-header Announcement text */}
        <div className="text-center py-2 px-4 mb-4 text-[#1a3b6e] font-serif text-sm md:text-base font-semibold leading-snug">
          Online Patient Registration &amp; Clinical Documentation System (ORS AI) is a Digital India initiative providing online access to hospital services, SOAP notes, and Ayushman Bharat Health Accounts.
        </div>

        {/* ── Main Blue Hero Banner (ORS Style) ──────────────── */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#1c4d8d] via-[#1a65a3] to-[#2196b6] p-6 sm:p-10 text-white shadow-xl overflow-hidden min-h-[420px] flex flex-col justify-between">
          {/* Subtle Stethoscope / Medical Line Overlay Background */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 200 C 150 100, 250 300, 350 200 C 450 100, 550 300, 650 200 L 750 200" stroke="white" strokeWidth="6" strokeDasharray="12 12"/>
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Banner Left Column: Text & Yellow CTA */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-2 bg-[#00909e] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-white/20">
                <FaStethoscope className="text-amber-300" /> Digital Health Portal
              </span>

              <h1 className="font-serif text-2xl sm:text-4xl xl:text-5xl font-normal leading-tight text-white mb-5 tracking-wide">
                Now getting an <span className="font-bold text-amber-300">OPD appointment, lab reports</span> and patient journey tracking has become <span className="underline decoration-amber-400 decoration-2 underline-offset-4">online and easy</span>.
              </h1>

              {/* Yellow Register/Login Button */}
              <div className="flex flex-wrap gap-4 items-center mt-2">
                <button
                  onClick={onEnterApp}
                  className="bg-[#e8a020] hover:bg-[#d49018] text-[#1a3b6e] font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all border border-amber-200 flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Register / Login</span>
                  <FaArrowRight className="text-xs" />
                </button>

                <a
                  href="#workflow"
                  className="text-white hover:text-amber-200 text-xs font-bold underline underline-offset-4 flex items-center gap-1.5 px-2 py-1"
                >
                  <FaHospital /> View Facilities
                </a>
              </div>
            </div>

            {/* Banner Right Column: Interactive Step Wheel Illustration */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="w-full max-w-[420px] bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <FaBrain /> AI Workflow Steps
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">Active Engine</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {heroHighlights.map((item, idx) => {
                    const isActive = activeHighlight === idx;
                    return (
                      <div
                        key={item.title}
                        onMouseEnter={() => setActiveHighlight(idx)}
                        onClick={() => setActiveHighlight(idx)}
                        className={`p-3 rounded-xl transition-all cursor-pointer border ${
                          isActive
                            ? "bg-white text-[#1a3b6e] border-amber-400 shadow-md font-bold"
                            : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{item.title}</span>
                          <FaChevronRight className={`text-[10px] transition-transform ${isActive ? "rotate-90 text-[#1a7f8e]" : "text-white/60"}`} />
                        </div>
                        {isActive && (
                          <p className="text-[11px] text-slate-600 font-normal mt-1.5 leading-snug">
                            {item.desc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom 3 Primary Action Pills (ORS Style) ──────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 relative z-10 pt-6 border-t border-white/20">
            <button
              onClick={onEnterApp}
              className="bg-[#2b6cb0] hover:bg-[#1a4971] text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-full flex items-center justify-center gap-2.5 shadow border border-white/20 transition-all cursor-pointer"
            >
              <FaCalendarCheck className="text-amber-300 text-base" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={onEnterApp}
              className="bg-[#00909e] hover:bg-[#007a87] text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-full flex items-center justify-center gap-2.5 shadow border border-white/20 transition-all cursor-pointer"
            >
              <FaUserMd className="text-amber-300 text-base" />
              <span>Book Teleconsultation Appointment</span>
            </button>

            <button
              onClick={onEnterApp}
              className="bg-[#107c74] hover:bg-[#0c615b] text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-full flex items-center justify-center gap-2.5 shadow border border-white/20 transition-all cursor-pointer"
            >
              <FaQrcode className="text-amber-300 text-base" />
              <span>Scan and Share</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;