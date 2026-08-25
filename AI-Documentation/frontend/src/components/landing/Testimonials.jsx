import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useReveal } from "../../hooks/useReveal";

const testimonials = [
  {
    name: "Dr. Sharma",
    role: "Internal Medicine",
    initials: "DS",
    quote: "Reduced documentation time by 70%. SOAP notes are structured enough that I only need a focused review."
  },
  {
    name: "Dr. Verma",
    role: "Family Practice",
    initials: "DV",
    quote: "The workflow is easy for the team to understand and saves valuable consultation time."
  },
  {
    name: "Dr. Rao",
    role: "Pulmonology",
    initials: "DR",
    quote: "Speaker detection keeps the clinical context clear, especially for longer follow-up visits."
  }
];

function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useReveal();

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [handleNext, isHovered]);

  const getCardPosition = (index) => {
    const total = testimonials.length;
    let offset = index - activeIndex;

    if (offset < -1) offset += total;
    if (offset > 1) offset -= total;

    return offset;
  };

  return (
    <section
      className="relative py-16 overflow-hidden flex flex-col justify-center min-h-[540px] bg-white/5"
      id="reviews"
    >
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/[0.04] blur-[120px]" />
      </div>

      <div className="max-w-[1320px] mx-auto w-full px-6 relative z-10" ref={sectionRef}>
        {/* Heading */}
        <div className="lp-reveal max-w-[600px] mx-auto text-center mb-10">
          <span className="inline-block mb-2 text-teal-600 text-[0.7rem] font-bold tracking-[0.2em] uppercase bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Reviews
          </span>
          <h2 className="font-sans font-extrabold text-stone-900 text-2xl sm:text-3xl tracking-tight mb-2">
            Trusted by frontline clinicians
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Clinicians use CareWeave AI to reduce the hidden work after each patient conversation.
          </p>
        </div>

        {/* 3D Stack Carousel */}
        <div
          className="relative max-w-[950px] mx-auto h-[230px] sm:h-[180px] flex items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {testimonials.map((item, index) => {
            const position = getCardPosition(index);
            const isActive = position === 0;
            const isLeft = position === -1;
            const isRight = position === 1;
            const isVisible = isActive || isLeft || isRight;

            if (!isVisible) return null;

            return (
              <motion.div
                key={item.name}
                style={{ originY: 0.5 }}
                animate={{
                  x: position * 240,
                  scale: isActive ? 1 : 0.82,
                  opacity: isActive ? 1 : 0.25,
                  zIndex: isActive ? 10 : 1,
                  filter: isActive ? "blur(0px)" : "blur(3px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 26
                }}
                onClick={() => { if (!isActive) setActiveIndex(index); }}
                className={`absolute w-full max-w-[540px] p-5 sm:p-6 rounded-xl border text-center flex flex-col justify-center items-center backdrop-blur-xl transition-colors duration-300 ${isActive
                    ? "border-teal-500/25 bg-white/90 shadow-[0_20px_50px_-12px_rgba(120,100,80,0.12)] cursor-default"
                    : "border-stone-200/30 bg-white/30 shadow-none cursor-pointer hover:bg-white/60"
                  }`}
              >
                <p className="text-stone-700 text-sm sm:text-base font-medium leading-relaxed italic mb-3.5 max-w-lg relative z-10">
                  "{item.quote}"
                </p>

                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-[10px] tracking-wider">
                    {item.initials}
                  </div>
                  <div className="text-left">
                    <h5 className="text-stone-900 font-bold text-xs tracking-wide inline-block">
                      {item.name}
                    </h5>
                    <span className="text-teal-600 text-[10px] font-semibold uppercase tracking-wider ml-2 border-l border-stone-200 pl-2">
                      {item.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Navigation Chevrons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-stone-200 bg-white/80 text-stone-500 hover:text-stone-900 hover:scale-105 active:scale-95 transition-all z-30 flex items-center justify-center text-sm backdrop-blur-sm shadow-sm"
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-stone-200 bg-white/80 text-stone-500 hover:text-stone-900 hover:scale-105 active:scale-95 transition-all z-30 flex items-center justify-center text-sm backdrop-blur-sm shadow-sm"
          >
            →
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-1 rounded-full cursor-pointer transition-all duration-300 ${i === activeIndex
                  ? "w-5 bg-gradient-to-r from-teal-500 to-emerald-500 shadow-[0_0_8px_rgba(13,148,136,0.3)]"
                  : "w-1 bg-stone-300 hover:bg-stone-400"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;