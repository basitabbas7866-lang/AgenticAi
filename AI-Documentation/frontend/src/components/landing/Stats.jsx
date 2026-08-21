import { useRevealChildren } from "../../hooks/useReveal";

function Stats() {
  const containerRef = useRevealChildren();

  const stats = [
    {
      value: "70%",
      label: "Less documentation time",
      detail: "Spend more of each visit listening instead of typing.",
      color: "from-lp-primary to-lp-cyan"
    },
    {
      value: "24/7",
      label: "AI note assistance",
      detail: "Draft notes whenever your clinical team is working.",
      color: "from-[#8b5cf6] to-lp-rose"
    },
    {
      value: "4x",
      label: "Faster report creation",
      detail: "Move from transcript to structured output faster.",
      color: "from-lp-emerald to-lp-cyan"
    }
  ];

  return (
    <section className="relative py-20 bg-lp-bg">
      {/* Top divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      <div className="max-w-[1320px] mx-auto px-6" ref={containerRef}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`lp-reveal lp-reveal-delay-${i + 1}
                stat-top-bar relative overflow-hidden p-8 rounded-[20px]
                border border-white/[0.07] bg-white/[0.03]
                shadow-[0_8px_32px_rgba(0,0,0,0.2)]
                hover:-translate-y-1.5 hover:border-lp-primary/20
                hover:shadow-[0_20px_48px_rgba(0,0,0,0.3),0_0_40px_rgba(99,102,241,0.1)]
                transition-all duration-400 cursor-default`}
            >
              <h3
                className={`font-display text-[2.8rem] font-extrabold tracking-tight mb-1
                  bg-gradient-to-r ${stat.color} bg-clip-text`}
                style={{ WebkitTextFillColor: "transparent" }}
              >
                {stat.value}
              </h3>
              <h4 className="text-lp-heading text-[1.05rem] font-bold mb-2">{stat.label}</h4>
              <p className="text-lp-text-muted leading-relaxed text-sm">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
