import { motion } from "framer-motion";
import { FaUserMd, FaUserCheck, FaMicrophone, FaAward, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 18 } }
};

function OverviewStats({ patient, isRecording, isPaused, audioBlob }) {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = loggedInUser.name || loggedInUser.email?.split("@")[0] || "Dr. Sarah Jenkins";
  const userRole = loggedInUser.role || "doctor";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-3.5 border border-slate-200 col-span-1 lg:col-span-2 flex items-center gap-3.5 min-h-[80px] shadow-sm relative overflow-hidden text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-[#1a3b6e] flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
          <FaUserMd />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] text-[#1a7f8e] font-extrabold uppercase tracking-wider block">Clinical Station</span>
          <h2 className="text-[#1a3b6e] text-sm font-extrabold m-0 leading-tight mt-0.5">
            {userRole === "doctor" ? `Dr. ${fullName}` : fullName}
          </h2>
          <p className="text-slate-500 text-[9px] font-bold mt-0.5 uppercase tracking-wider">
            {userRole === "doctor" ? "General Practitioner" : userRole === "nurse" ? "Registered Nurse" : "Patient Portal"} | Node Online
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3.5 min-h-[80px] shadow-sm text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-[#1a3b6e] flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
          <FaUserCheck />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">Active Patient</span>
          {patient ? (
            <div className="mt-0.5">
              <h3 className="text-[#1a3b6e] text-xs font-extrabold m-0 leading-tight block truncate">{patient.name}</h3>
              <p className="text-[#1a7f8e] text-[9px] font-mono font-bold mt-0.5 uppercase leading-none">{patient.patient_id}</p>
            </div>
          ) : (
            <p className="text-slate-400 text-[9px] font-bold italic m-0 mt-0.5">No Active Chart</p>
          )}
        </div>
      </motion.div>

      {userRole === "doctor" ? (
        <>
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3.5 min-h-[80px] shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1a3b6e] flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
              <FaMicrophone />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">Consultation Status</span>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                  isRecording
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : isPaused
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : audioBlob
                    ? "bg-teal-50 text-teal-600 border border-teal-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${
                    isRecording
                      ? "bg-red-500 animate-ping"
                      : isPaused
                      ? "bg-amber-500"
                      : audioBlob
                      ? "bg-teal-500"
                      : "bg-slate-400"
                  }`} />
                  {isRecording ? "Recording" : isPaused ? "Paused" : audioBlob ? "Captured" : "Ready"}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3.5 min-h-[80px] shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1a3b6e] flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
              <FaAward />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">Aura AI Accuracy</span>
              <div className="mt-0.5">
                <h3 className="text-[#1a3b6e] text-sm font-extrabold m-0 leading-tight">98.8%</h3>
                <p className="text-emerald-600 text-[9px] font-bold mt-0.5 uppercase tracking-wider leading-none">Optimal Sync (en-IN)</p>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3.5 min-h-[80px] shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
              <FaExclamationTriangle />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">Coordination Status</span>
              <div className="mt-0.5">
                <h3 className="text-[#1a3b6e] text-xs font-extrabold m-0 leading-tight">Active Monitoring</h3>
                <p className="text-[#1a7f8e] text-[8px] font-bold mt-0.5 uppercase tracking-wider leading-none">Tracking Patient Care</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3.5 min-h-[80px] shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
              <FaCheckCircle />
            </div>
            <div className="min-w-0">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block">Audit Logs</span>
              <div className="mt-0.5">
                <h3 className="text-emerald-600 text-xs font-extrabold m-0 leading-tight">Secured</h3>
                <p className="text-slate-400 text-[8px] font-bold mt-0.5 uppercase tracking-wider leading-none">HIPAA Trail Active</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default OverviewStats;
