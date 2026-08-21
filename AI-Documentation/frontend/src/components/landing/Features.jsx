import {
  FaDatabase,
  FaEdit,
  FaFileMedical,
  FaLock,
  FaMicrophone,
  FaUsers
} from "react-icons/fa";
import { useRevealChildren } from "../../hooks/useReveal";

const features = [
  {
    icon: <FaMicrophone />,
    title: "Speech to Text",
    desc: "Convert consultation audio into clean transcript text for review."
  },
  {
    icon: <FaUsers />,
    title: "Speaker Detection",
    desc: "Separate doctor and patient dialogue so notes keep their context."
  },
  {
    icon: <FaFileMedical />,
    title: "SOAP Notes",
    desc: "Draft Subjective, Objective, Assessment, and Plan sections instantly."
  },
  {
    icon: <FaDatabase />,
    title: "Patient Records",
    desc: "Keep generated reports organized for quick follow-up."
  },
  {
    icon: <FaEdit />,
    title: "Editable Output",
    desc: "Review, refine, and approve notes before storing them."
  },
  {
    icon: <FaLock />,
    title: "Secure Workflow",
    desc: "Designed around careful access and clinical data handling."
  }
];

function Features() {
  const containerRef = useRevealChildren();

  return (
    <section className="relative py-20 bg-white/5 overflow-hidden" id="features">
      {/* Ambient background glow */}
      <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] rounded-full
        bg-teal-500 opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[100px] -left-[100px] w-[300px] h-[300px] rounded-full
        bg-amber-500 opacity-[0.05] blur-[120px] pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 relative z-10" ref={containerRef}>
        {/* Section heading */}
        <div className="lp-reveal max-w-[600px] mx-auto text-center mb-12">
          <span className="inline-block mb-2 text-teal-600 text-[0.72rem] font-bold tracking-[0.12em] uppercase bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Features
          </span>
          <h2 className="font-sans font-extrabold text-stone-900 text-[clamp(1.8rem,3vw,2.4rem)] tracking-tight mb-3">
            Built for real clinical documentation work
          </h2>
          <p className="text-stone-600 leading-relaxed">
            Every section stays connected to the consultation, from raw speech to
            structured note output.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item, i) => (
            <div
              key={item.title}
              className={`lp-reveal lp-reveal-delay-${(i % 3) + 1}
                feature-glow relative overflow-hidden p-7 rounded-[20px]
                border border-stone-200/60 bg-white/85
                shadow-[0_8px_24px_rgba(120,100,80,0.05)]
                hover:border-teal-500/25 hover:-translate-y-1.5
                hover:shadow-[0_16px_40px_rgba(120,100,80,0.12)]
                transition-all duration-400 cursor-default group`}
            >
              <div
                className="relative z-10 inline-flex w-[50px] h-[50px] mb-5 items-center justify-center
                  rounded-[14px] text-teal-600 text-xl bg-teal-500/10 border border-teal-500/20
                  group-hover:bg-gradient-to-br group-hover:from-teal-600 group-hover:to-teal-700
                  group-hover:text-white group-hover:border-transparent
                  group-hover:rotate-[-3deg] group-hover:scale-110
                  group-hover:shadow-[0_8px_24px_rgba(13,148,136,0.25)]
                  transition-all duration-[350ms]"
              >
                {item.icon}
              </div>
              <h5 className="relative z-10 text-stone-900 font-bold text-[1.05rem] mb-2">
                {item.title}
              </h5>
              <p className="relative z-10 text-stone-600 text-[0.92rem] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
