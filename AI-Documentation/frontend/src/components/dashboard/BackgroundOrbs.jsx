function BackgroundOrbs() {
  return (
    <>
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-indigo-500/[0.04] rounded-full blur-[120px] pointer-events-none z-0 animate-mesh-1" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-purple-500/[0.03] rounded-full blur-[110px] pointer-events-none z-0 animate-mesh-2" />
      
      {/* Floating ambient particles */}
      <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-sky-400/30 rounded-full pointer-events-none z-0 animate-float-particle" style={{ animationDelay: '0s' }} />
      <div className="absolute top-[40%] left-[60%] w-1.5 h-1.5 bg-teal-400/20 rounded-full pointer-events-none z-0 animate-float-particle" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[70%] left-[30%] w-1 h-1 bg-indigo-400/25 rounded-full pointer-events-none z-0 animate-float-particle" style={{ animationDelay: '6s' }} />
      <div className="absolute top-[25%] left-[80%] w-0.5 h-0.5 bg-cyan-300/30 rounded-full pointer-events-none z-0 animate-float-particle" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[55%] left-[45%] w-1 h-1 bg-emerald-400/20 rounded-full pointer-events-none z-0 animate-float-particle" style={{ animationDelay: '8s' }} />
      <div className="absolute top-[85%] left-[70%] w-1.5 h-1.5 bg-sky-300/15 rounded-full pointer-events-none z-0 animate-float-particle" style={{ animationDelay: '4s' }} />

      {/* Animated border scan line across the top */}
      <div className="absolute top-0 left-0 w-full h-[1px] animate-border-scan pointer-events-none z-0" />
    </>
  );
}

export default BackgroundOrbs;
