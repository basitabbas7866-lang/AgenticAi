import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaArrowRight, 
  FaChevronRight, 
  FaCheckCircle 
} from "react-icons/fa";
import { getCoordinationAlerts } from "../../api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
};

function AttentionRequired({ onSelectPatient, onNavigateToTab }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await getCoordinationAlerts();
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Error fetching coordination alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll alerts every 30 seconds for dynamic refresh
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase() || severity) {
      case "critical":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          text: "text-rose-400",
          dot: "bg-rose-500 animate-pulse"
        };
      case "high":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          dot: "bg-amber-500 animate-pulse"
        };
      case "medium":
      default:
        return {
          bg: "bg-sky-500/10",
          border: "border-sky-500/30",
          text: "text-sky-400",
          dot: "bg-sky-500"
        };
    }
  };

  const handleCoordinate = (patientId, patientName) => {
    // Mimic selecting the patient in the dashboard
    onSelectPatient({
      patient_id: patientId,
      name: patientName
    });
    // Direct staff to Care Journey workspace
    onNavigateToTab("journey");
  };

  return (
    <div className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-6 bg-slate-950/20 text-left relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-6">
        <div>
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Administrative Layer</span>
          <h3 className="text-white text-base font-black leading-tight mt-1 flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-500 text-xs shrink-0" />
            <span>Clinical Coordination Alerts</span>
          </h3>
        </div>
        <button
          onClick={fetchAlerts}
          className="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          Scan Active Records
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaClock className="text-2xl animate-spin mb-3 text-sky-400" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Scanning coordination data...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center border border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400">
            <FaCheckCircle className="text-lg" />
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase">All Records Synced</h4>
            <p className="text-slate-500 text-[10px] mt-1 max-w-sm">
              All appointments, referrals, and lab tests are currently coordinated within administrative limits.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {alerts.map((alert, idx) => {
              const styles = getSeverityStyles(alert.severity);
              
              return (
                <motion.div
                  key={`${alert.patient_id}-${alert.issue_type}-${idx}`}
                  variants={itemVariants}
                  layout
                  className="glass-panel border border-[#1e2d4a]/30 rounded-xl p-4 bg-slate-950/40 hover:border-slate-800 transition-all flex flex-col justify-between group/card relative overflow-hidden"
                >
                  <div>
                    {/* Badge header */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${styles.bg} ${styles.text} border ${styles.border}`}>
                          {alert.severity} Alert
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{alert.issue_type.replace("_", " ")}</span>
                    </div>

                    {/* Patient Context */}
                    <div className="mt-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Patient</span>
                      <h4 className="text-white text-xs font-black leading-snug mt-0.5">{alert.patient_name} ({alert.patient_id})</h4>
                    </div>

                    {/* Explanation */}
                    <p className="text-slate-300 text-xs mt-3 leading-relaxed font-medium">
                      {alert.explanation}
                    </p>

                    {/* Recommended Next Step */}
                    <div className="mt-3 p-2.5 rounded-lg bg-[#070b13]/60 border border-slate-900/60 flex items-start gap-2">
                      <span className="text-[8px] font-bold text-sky-400 uppercase tracking-wider mt-0.5 shrink-0">Plan:</span>
                      <p className="text-slate-400 text-[10px] leading-normal font-semibold">
                        {alert.recommended_action}
                      </p>
                    </div>
                  </div>

                  {/* Deep link coordinator action button */}
                  <div className="mt-4 pt-3 border-t border-slate-900/50 flex justify-end">
                    <button
                      onClick={() => handleCoordinate(alert.patient_id, alert.patient_name)}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-sky-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer group-hover/card:translate-x-1 duration-300"
                    >
                      <span>Coordinate Care</span>
                      <FaChevronRight className="text-[8px] transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default AttentionRequired;
