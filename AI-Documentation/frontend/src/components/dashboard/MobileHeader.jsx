import { FaBars } from "react-icons/fa";

function MobileHeader({ onOpenSidebar }) {
  return (
    <header className="flex md:hidden h-14 border-b border-[#1e2d4a] bg-[#0c1322]/85 backdrop-blur-md px-4 items-center justify-between shrink-0">
      <button
        onClick={onOpenSidebar}
        className="p-1.5 rounded-lg border border-[#1e2d4a] bg-[#172237] text-slate-400 hover:text-white cursor-pointer flex items-center justify-center active:scale-95 transition-transform"
      >
        <FaBars className="text-sm" />
      </button>
      <span className="tracking-wide font-bold text-xs text-white">
        ClarityNote <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 font-medium">AI</span>
      </span>
      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">
        DR
      </div>
    </header>
  );
}

export default MobileHeader;
