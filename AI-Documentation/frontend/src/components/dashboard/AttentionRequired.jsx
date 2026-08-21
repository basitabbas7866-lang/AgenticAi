import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaExclamationTriangle, 
  FaClock, 
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
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-600",
          dot: "bg-red-500 animate-pulse"
        };
      case "high":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-600",
          dot: "bg-amber-500 animate-pulse"
        };
      case "medium":
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-600",
          dot: "bg-blue-500"
        };
    }
  };

  const handleCoordinate = (patientId, patientName) => {
    onSelectPatient({
      patient_id: patientId,
      name: patientName
    });
    onNavigateToTab("journey");
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-left relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider">Administrative Layer</span>
          <h3 className="text-[#1a3b6e] text-base font-extrabold leading-tight mt-1 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500 text-sm shrink-0 animate-bounce" />
            <span>Clinical Coordination Alerts</span>
          </h3>
        </div>
        <button
          onClick={fetchAlerts}
          className="px-4 py-2 rounded-full text-xs font-bold bg-[#1a3b6e] text-white hover:bg-[#15305b] shadow-sm hover:shadow transition-all cursor-pointer border-none"
        >
          Scan Active Records
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaClock className="text-2xl animate-spin mb-3 text-[#1a7f8e]" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Scanning coordination data...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center border border-emerald-200 bg-emerald-50 text-[#2eb37e]">
            <FaCheckCircle className="text-lg" />
          </div>
          <div>
            <h4 className="text-[#1a3b6e] text-xs font-extrabold uppercase">All Records Synced</h4>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
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
              const borderTopClass = alert.severity?.toLowerCase() === 'critical' 
                ? 'border-t-4 border-t-red-500' 
                : alert.severity?.toLowerCase() === 'high' 
                  ? 'border-t-4 border-t-[#e8a020]' 
                  : 'border-t-4 border-t-[#2b6cb0]';
              
              return (
                <motion.div
                  key={`${alert.patient_id}-${alert.issue_type}-${idx}`}
                  variants={itemVariants}
                  layout
                  className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-[#1a7f8e]/30 hover:shadow-md transition-all flex flex-col justify-between group/card relative overflow-hidden text-left ${borderTopClass}`}
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
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">{alert.issue_type.replace("_", " ")}</span>
                    </div>

                    {/* Patient Context */}
                    <div className="mt-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Patient</span>
                      <h4 className="text-[#1a3b6e] text-xs font-extrabold leading-snug mt-0.5">{alert.patient_name} ({alert.patient_id})</h4>
                    </div>

                    {/* Explanation */}
                    <p className="text-slate-600 text-xs mt-3 leading-relaxed font-semibold">
                      {alert.explanation}
                    </p>

                    {/* Recommended Next Step */}
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                      <span className="text-[9px] font-extrabold text-[#1a7f8e] uppercase tracking-wider mt-0.5 shrink-0">Plan:</span>
                      <p className="text-slate-600 text-[10px] leading-normal font-semibold m-0">
                        {alert.recommended_action}
                      </p>
                    </div>
                  </div>

                  {/* Deep link coordinator action button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleCoordinate(alert.patient_id, alert.patient_name)}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-[#1a7f8e] hover:text-[#1a3b6e] uppercase tracking-wider transition-colors cursor-pointer group-hover/card:translate-x-1 duration-300 border-none bg-transparent"
                    >
                      <span>Coordinate Care</span>
                      <FaChevronRight className="text-[8px]" />
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
