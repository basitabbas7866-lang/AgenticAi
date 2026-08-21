import {
  FaBrain,
  FaComments,
  FaFileMedical,
  FaMicrophone
} from "react-icons/fa";
import { useRevealChildren } from "../../hooks/useReveal";

function Workflow() {
  const containerRef = useRevealChildren();

  const steps = [
    {
      icon: <FaMicrophone />,
      title: "Record",
      desc: "Capture doctor-patient conversation from the browser."
    },
    {
      icon: <FaComments />,
      title: "Transcribe",
      desc: "Convert speech into speaker-aware transcript text."
    },
    {
      icon: <FaBrain />,
      title: "Analyze",
      desc: "Extract symptoms, clinical findings, and decisions."
    },
    {
      icon: <FaFileMedical />,
      title: "Generate",
      desc: "Create an editable SOAP note for the patient record."
    }
  ];

  return (
    <section className="py-20 bg-lp-bg" id="workflow">
      <div className="max-w-[1320px] mx-auto px-6" ref={containerRef}>
        {/* Section heading */}
        <div className="lp-reveal max-w-[600px] mx-auto text-center mb-12">
          <span className="inline-block mb-2 text-lp-accent text-[0.72rem] font-bold tracking-[0.12em] uppercase">
            Workflow
          </span>
          <h2 className="font-display font-extrabold text-lp-heading text-[clamp(1.8rem,3vw,2.4rem)] tracking-tight mb-3">
            From consultation to completed note
          </h2>
          <p className="text-lp-text-muted leading-relaxed">
            A four-step flow keeps the experience understandable for clinicians
            and auditable for teams.
          </p>
        </div>

        {/* Workflow cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`lp-reveal lp-reveal-delay-${index + 1}
                workflow-glow relative overflow-hidden p-7 rounded-[20px]
                border border-white/[0.07] bg-white/[0.03]
                shadow-[0_8px_24px_rgba(0,0,0,0.15)]
                hover:border-lp-primary/25 hover:-translate-y-1.5
                hover:shadow-[0_16px_48px_rgba(0,0,0,0.25),0_0_40px_rgba(99,102,241,0.08)]
                transition-all duration-400 cursor-default group`}
            >
              {/* Step number watermark */}
              <span
                className="absolute right-5 top-5 font-display text-[2rem] font-black leading-none
                  text-lp-primary/20 group-hover:text-lp-primary/40 transition-colors duration-300"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div
                className="relative z-10 inline-flex w-[50px] h-[50px] mb-5 items-center justify-center
                  rounded-[14px] text-lp-accent text-xl bg-lp-primary/10 border border-lp-primary/15
                  group-hover:bg-gradient-to-br group-hover:from-lp-primary group-hover:to-[#8b5cf6]
                  group-hover:text-white group-hover:border-transparent
                  group-hover:rotate-[-3deg] group-hover:scale-110
                  group-hover:shadow-[0_8px_24px_rgba(99,102,241,0.35)]
                  transition-all duration-[350ms]"
              >
                {step.icon}
              </div>
              <h5 className="relative z-10 text-lp-heading font-bold text-[1.05rem] mb-2">
                {step.title}
              </h5>
              <p className="relative z-10 text-lp-text-muted text-[0.92rem] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Workflow;
