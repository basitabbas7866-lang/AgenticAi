import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useRevealChildren } from "../../hooks/useReveal";

function CTA({ onEnterApp }) {
  const ref = useRevealChildren();
  const checklist = ["Record", "Generate", "Review", "Store"];

  // Dynamic mouse position for a premium cursor-tracking glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section
      className="py-16 overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #020617 0%, #090d16 100%)"
      }}
    >
      <div className="max-w-[1320px] mx-auto px-6" ref={ref}>
        <motion.div
          onMouseMove={handleMouseMove}
          className="lp-reveal group relative overflow-hidden p-8 md:p-14 rounded-2xl
            border border-slate-800 bg-slate-900/40 backdrop-blur-xl
            shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)]
            flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10"
        >
          {/* Interactive Mouse Tracker Glow */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 z-0"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  450px circle at ${mouseX}px ${mouseY}px,
                  rgba(99, 102, 241, 0.15),
                  transparent 80%
                )
              `,
            }}
          />

          {/* Core Aesthetic Ambient Orbs */}
          <div
            className="absolute w-[350px] h-[350px] -right-20 -top-40 rounded-full
              opacity-[0.15] pointer-events-none blur-[80px]"
            style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
          />
          <div
            className="absolute w-[250px] h-[250px] -left-20 -bottom-20 rounded-full
              opacity-[0.08] pointer-events-none blur-[60px]"
            style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
          />

          {/* Left Block: Content */}
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block mb-3 text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase bg-cyan-500/10 px-3 py-1 rounded-full">
              Get Started
            </span>
            <h2 className="font-sans font-extrabold text-white text-3xl sm:text-4xl tracking-tight mb-4 leading-tight">
              Transform your clinical documentation today
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-lg">
              Generate structured, review-ready SOAP notes from natural conversations while keeping full control over every record.
            </p>
          </div>

          {/* Right Block: Interactive Features & Action */}
          <div className="relative z-10 flex flex-col items-start lg:items-end gap-6 shrink-0 w-full lg:w-auto">
            {/* Inline Badges */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {checklist.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-slate-300 font-medium text-sm bg-slate-800/40 border border-white/[0.04] px-3 py-1.5 rounded-lg"
                >
                  <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Premium Button Interaction */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnterApp}
              className="group/btn relative w-full sm:w-auto h-12 px-8 rounded-xl text-white font-bold text-sm
                bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600
                shadow-[0_4px_20px_rgba(99,102,241,0.35)] cursor-pointer
                hover:shadow-[0_12px_32px_rgba(99,102,241,0.45)]
                transition-shadow duration-300 flex items-center justify-center gap-2 overflow-hidden"
            >
              {/* Internal Button Glare Animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover/btn:animate-[shimmer_0.75s_ease-out]" />

              <span className="relative z-10">Open dashboard</span>
              <FaArrowRight className="text-xs relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Global CSS Inject for Button Shimmer Effect */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(250%); }
        }
      `}</style>
    </section>
  );
}

export default CTA;