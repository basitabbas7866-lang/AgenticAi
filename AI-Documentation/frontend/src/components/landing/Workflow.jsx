import {
  FaBrain,
  FaComments,
  FaFileMedical,
  FaMicrophone,
  FaVideo
} from "react-icons/fa";
import { useRevealChildren } from "../../hooks/useReveal";

function Workflow({ onEnterApp }) {
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
    <section className="py-20 bg-white/5" id="workflow">
      <div className="max-w-[1320px] mx-auto px-6" ref={containerRef}>
        {/* Section heading */}
        <div className="lp-reveal max-w-[600px] mx-auto text-center mb-12">
          <span className="inline-block mb-2 text-teal-600 text-[0.72rem] font-bold tracking-[0.12em] uppercase bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Workflow
          </span>
          <h2 className="font-sans font-extrabold text-stone-900 text-[clamp(1.8rem,3vw,2.4rem)] tracking-tight mb-3">
            From consultation to completed note
          </h2>
          <p className="text-stone-600 leading-relaxed">
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
                border border-stone-200/60 bg-white/85
                shadow-[0_8px_24px_rgba(120,100,80,0.05)]
                hover:border-teal-500/25 hover:-translate-y-1.5
                hover:shadow-[0_16px_40px_rgba(120,100,80,0.12)]
                transition-all duration-400 cursor-default group`}
            >
              {/* Step number watermark */}
              <span
                className="absolute right-5 top-5 font-sans text-[2rem] font-black leading-none
                  text-teal-600/10 group-hover:text-teal-600/25 transition-colors duration-300"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div
                className="relative z-10 inline-flex w-[50px] h-[50px] mb-5 items-center justify-center
                  rounded-[14px] text-teal-600 text-xl bg-teal-500/10 border border-teal-500/20
                  group-hover:bg-gradient-to-br group-hover:from-teal-600 group-hover:to-teal-700
                  group-hover:text-white group-hover:border-transparent
                  group-hover:rotate-[-3deg] group-hover:scale-110
                  group-hover:shadow-[0_8px_24px_rgba(13,148,136,0.25)]
                  transition-all duration-[350ms]"
              >
                {step.icon}
              </div>
              <h5 className="relative z-10 text-stone-900 font-bold text-[1.05rem] mb-2">
                {step.title}
              </h5>
              <p className="relative z-10 text-stone-600 text-[0.92rem] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Teleconsultation Action Banner in Workflow */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#1a3b6e] via-[#1a65a3] to-[#1a7f8e] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl text-amber-300 shadow-inner shrink-0">
              <FaVideo />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white m-0">Live 1:1 Teleconsultation Video Room</h4>
              <p className="text-xs text-slate-200 m-0 mt-1 font-medium leading-relaxed">
                Connect directly with real-time video, dual camera feeds, patient vitals synchronization, and automatic ambient AI transcription.
              </p>
            </div>
          </div>
          <button
            onClick={onEnterApp}
            className="btn-pill btn-amber text-xs px-6 py-3 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <FaVideo className="text-xs" />
            <span>Sign In to Launch Video Room</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Workflow;
