import { motion } from "framer-motion";
import { FaUserMd } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 18 } }
};

function OverviewStats({ patient, isRecording, isPaused, audioBlob }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      <motion.div
        variants={itemVariants}
        className="glass-panel glass-panel-hover border border-[#1e2d4a]/60 rounded-[20px] p-5 col-span-1 lg:col-span-2 flex flex-col justify-between min-h-[120px] bg-gradient-to-br from-indigo-950/20 to-slate-950/40 relative overflow-hidden shadow-lg group grid-overlay"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <FaUserMd className="text-sm" />
          </div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Clinical Station</span>
        </div>
        <div>
          <h2 className="text-white text-base font-black m-0 leading-tight">Sarah Jenkins, M.D.</h2>
          <p className="text-slate-500 text-[10px] font-semibold mt-1">General Practitioner | Node Online</p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-5 flex flex-col justify-between min-h-[120px] shadow-lg"
      >
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Patient</span>
        {patient ? (
          <div>
            <h3 className="text-white text-sm font-black m-0 leading-tight truncate">{patient.name}</h3>
            <p className="text-indigo-400 text-[10px] font-mono mt-1">{patient.patient_id}</p>
          </div>
        ) : (
          <p className="text-slate-600 text-[10px] font-semibold italic">No Active Chart Selected</p>
        )}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-5 flex flex-col justify-between min-h-[120px] shadow-lg"
      >
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Consultation Status</span>
        <div>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
            isRecording
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              : isPaused
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : audioBlob
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "bg-slate-950 text-slate-500 border border-slate-900"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isRecording
                ? "bg-rose-400 animate-breathe"
                : isPaused
                ? "bg-amber-400"
                : audioBlob
                ? "bg-cyan-400 animate-breathe"
                : "bg-slate-600"
            }`} />
            {isRecording ? "Recording Live" : isPaused ? "Recording Paused" : audioBlob ? "Audio Captured" : "Ready to dictate"}
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-5 flex flex-col justify-between min-h-[120px] shadow-lg"
      >
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Aura AI Accuracy</span>
        <div>
          <h3 className="text-white text-base font-black m-0 leading-tight">98.8%</h3>
          <p className="text-emerald-400 text-[10px] font-semibold mt-1">Optimal Sync (hi-IN)</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OverviewStats;
