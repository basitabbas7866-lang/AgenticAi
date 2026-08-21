import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import {
  FaArrowRight,
  FaBrain,
  FaCheckCircle,
  FaFileMedical,
  FaMicrophone,
  FaPlay,
  FaShieldAlt
} from "react-icons/fa";

const heroHighlights = [
  "Speaker-aware notes",
  "Editable SOAP draft",
  "Ready for review"
];

const intelligenceCards = [
  { icon: <FaMicrophone />, label: "Live Capture", value: "00:18" },
  { icon: <FaBrain />, label: "Medical Context", value: "AI" },
  { icon: <FaFileMedical />, label: "SOAP Draft", value: "Ready" }
];

const Hero = ({ onEnterApp }) => {
  const cardRef = useRef(null);

  // Motion values to track mouse orientation for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the movement using springs
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse positions to degrees of rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Dynamic values for a mouse-tracking glare/reflection overlay
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (normalized between -0.5 and 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  }

  function handleMouseLeave() {
    // Snap cleanly back to default flat center orientation
    x.set(0);
    y.set(0);
  }

  // Orchestrated Entry Animations
  const textContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const textItem = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section
      className="relative min-h-[95vh] pt-24 pb-12 flex items-start overflow-hidden bg-slate-950 perspective-[1200px]"
      id="home"
    >
      {/* Dynamic Ambient Mesh Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 -top-[10%] -left-[5%] bg-indigo-600 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 top-[15%] -right-[5%] bg-cyan-500 blur-[110px]"
        />
      </div>

      <div className="max-w-[1320px] mx-auto px-6 relative z-10 w-full mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left Messaging Column */}
          <motion.div
            variants={textContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col pt-4 lg:pt-10"
          >
            <motion.div variants={textItem}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-semibold tracking-wide mb-5">
                <FaShieldAlt className="text-xs animate-pulse" /> Clinical documentation &amp; Diagnosis
              </span>
            </motion.div>

            <motion.h1
              variants={textItem}
              className="font-sans font-black text-white leading-[1.1] tracking-tight text-4xl sm:text-5xl xl:text-6xl mb-5 max-w-xl"
            >
              Clinical notes that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                write with you.
              </span>
            </motion.h1>

            <motion.p
              variants={textItem}
              className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
            >
              Record the visit, review the transcript, and get a clean SOAP draft while the conversation is still fresh.
            </motion.p>

            <motion.div variants={textItem} className="flex flex-wrap gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnterApp}
                className="group/btn relative h-12 px-7 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center gap-2 overflow-hidden cursor-pointer border-none"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover/btn:animate-[shimmer_0.75s_ease-out]" />
                <span>Start documenting</span> <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="h-12 px-6 rounded-xl text-slate-300 font-bold text-sm border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:bg-slate-800 hover:text-white flex items-center gap-2 no-underline cursor-pointer transition-colors"
                href="#workflow"
              >
                <FaPlay className="text-[10px]" /> See workflow
              </motion.a>
            </motion.div>

            <motion.div variants={textItem} className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
              {heroHighlights.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 text-slate-400 font-semibold text-xs">
                  <FaCheckCircle className="text-emerald-400 text-sm" /> {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Product Column (Dynamic 3D Card Slot) */}
          <div className="w-full relative flex justify-end">
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[580px] p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-slate-900/50 backdrop-blur-2xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] cursor-grab active:cursor-grabbing group select-none overflow-hidden"
            >
              {/* Dynamic Mouse Glare Layer */}
              <motion.div
                style={{
                  background: useMotionTemplate`radial-gradient(250px circle at ${glareX} ${glareY}, rgba(255,255,255,0.06), transparent 80%)`
                }}
                className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay"
              />

              {/* Panel Header */}
              <div className="flex items-center justify-between gap-5 mb-1" style={{ transform: "translateZ(30px)" }}>
                <div>
                  <span className="block text-indigo-400 text-[0.65rem] font-bold tracking-widest uppercase mb-0.5">Current visit</span>
                  <h2 className="text-white font-sans font-bold text-lg tracking-tight m-0">Respiratory follow-up</h2>
                </div>
                {/* Simulated live audio indicator */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[0.65rem] font-black tracking-wider uppercase bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute left-3" />
                  <span className="pl-3.5">Recording</span>
                </span>
              </div>

              {/* Live Transcript Stream Simulation */}
              <div className="grid gap-2.5 my-4 p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01]" style={{ transform: "translateZ(20px)" }}>
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-3 rounded-lg bg-white/[0.02]"
                >
                  <span className="block mb-0.5 text-indigo-400 text-[0.65rem] font-bold uppercase tracking-wider">Doctor</span>
                  <p className="text-slate-200 text-sm leading-relaxed m-0">How has the cough changed since the last visit?</p>
                </motion.div>

                <motion.div
                  initial={{ x: -3, opacity: 0.9 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="ml-5 p-3 rounded-lg bg-cyan-500/[0.02] border-l-2 border-cyan-500/20"
                >
                  <span className="block mb-0.5 text-cyan-400 text-[0.65rem] font-bold uppercase tracking-wider">Patient</span>
                  <p className="text-slate-200 text-sm leading-relaxed m-0">It is less frequent, but I still feel tightness at night.</p>
                </motion.div>
              </div>

              {/* Animated Progress SOAP Note Generator */}
              <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01]" style={{ transform: "translateZ(40px)" }}>
                <div className="flex items-center justify-between mb-2 text-slate-400 text-xs">
                  <span>Generating SOAP note</span>
                  <motion.strong
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-emerald-400 font-bold"
                  >
                    Processing...
                  </motion.strong>
                </div>

                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                  {/* Streaming Progress Bar Animation */}
                  <motion.div
                    animate={{ width: ["10%", "92%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {["Subjective", "Objective", "Assessment", "Plan"].map((section, idx) => (
                    <motion.div
                      key={section}
                      animate={{ borderColor: ["rgba(255,255,255,0.04)", "rgba(99,102,241,0.15)", "rgba(255,255,255,0.04)"] }}
                      transition={{ duration: 3, delay: idx * 0.4, repeat: Infinity }}
                      className="p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04]"
                    >
                      <strong className="block mb-1 text-white text-xs tracking-wide">{section}</strong>
                      <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.8, delay: idx * 0.2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom Metrics Cards with Hover Upwards Translation */}
              <div className="grid grid-cols-3 gap-2.5 mt-4" style={{ transform: "translateZ(15px)" }}>
                {intelligenceCards.map((card) => (
                  <div
                    key={card.label}
                    className="p-3 text-center rounded-xl border border-white/[0.04] bg-slate-950/40 hover:bg-indigo-500/[0.04] hover:border-indigo-500/20 transition-all duration-300"
                  >
                    <span className="text-indigo-400 text-sm">{card.icon}</span>
                    <strong className="block mt-1 text-white text-base font-bold tracking-tight">{card.value}</strong>
                    <span className="block text-slate-500 text-[9px] uppercase font-bold tracking-wider mt-0.5">{card.label}</span>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>

        </div>

        {/* Global Bottom Status Tracker Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-14">
          {["HIPAA-conscious flow", "Clinician editable", "Dashboard connected"].map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              key={item}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/[0.04] bg-slate-900/10 backdrop-blur-xl text-slate-400 font-medium text-xs hover:border-indigo-500/10 transition-colors duration-200"
            >
              <FaCheckCircle className="text-emerald-400 text-sm" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(250%); }
        }
      `}</style>
    </section>
  );
};

export default Hero;