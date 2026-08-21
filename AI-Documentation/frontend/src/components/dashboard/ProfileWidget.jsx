import { motion } from "framer-motion";
import { 
  FaUserMd, 
  FaHospital, 
  FaRegIdCard, 
  FaShieldAlt, 
  FaUserShield, 
  FaCheckCircle, 
  FaClock, 
  FaDatabase, 
  FaServer, 
  FaLink, 
  FaHistory,
  FaMicrophone,
  FaFileAlt,
  FaWhatsapp,
  FaNetworkWired
} from "react-icons/fa";

function ProfileWidget() {
  const stats = [
    { label: "Dictation Volume", value: "42.5 Hrs", desc: "Total Audio Input", icon: <FaMicrophone className="text-teal-400" /> },
    { label: "SOAP Notes Finalized", value: "148", desc: "EHR Compliant Logs", icon: <FaFileAlt className="text-cyan-400" /> },
    { label: "Speech Engine Accuracy", value: "99.2%", desc: "Whisper Fine-Tuned", icon: <FaShieldAlt className="text-emerald-400" /> },
    { label: "Handoff PDF Deliveries", value: "112", desc: "WhatsApp Relays", icon: <FaWhatsapp className="text-indigo-400" /> }
  ];

  const integrations = [
    { name: "HL7 FHIR API", status: "ONLINE", desc: "Central EMR Synchronization", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Epic Systems Bridge", status: "ONLINE", desc: "Patient Record Exchange", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Cerner Health Gateway", status: "STANDBY", desc: "Secondary Registry Node", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { name: "WhatsApp Gateway API", status: "ACTIVE", desc: "Secure Patient Report Relay", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
  ];

  const auditLogs = [
    { time: "11:34 AM", action: "Active session token validated", details: "ID: EHR-SEC-98124-SJ" },
    { time: "11:12 AM", action: "Central Registry Node sync completed", details: "Synced 12 active patient charts" },
    { time: "09:15 AM", action: "Decrypted patient records key", details: "Encrypted handshake with Epic Node" },
    { time: "08:45 AM", action: "Clinician login verified (MFA)", details: "Authorized from IP: 192.168.1.142" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* 1. TOP SECTION: Badge + Basic Registry Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT CARD: Holographic Clinical ID Badge (lg:col-span-4) */}
        <div className="lg:col-span-4 glass-panel border border-teal-500/20 bg-gradient-to-b from-[#1e2d4a]/30 to-[#0c1322]/80 rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden min-h-[400px]">
          {/* Top holographic stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500" />
          
          {/* Security overlay indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified
          </div>

          <div className="w-full flex flex-col items-center mt-6">
            {/* Glowing Avatar Group */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 p-0.5 shadow-xl">
                <div className="w-full h-full rounded-full bg-[#172237] flex items-center justify-center text-teal-400 font-black text-2xl shadow-inner font-mono">
                  SJ
                </div>
              </div>
              <span className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#131e33] rounded-full animate-pulse" />
            </div>

            <h2 className="text-white text-base font-black m-0 leading-tight">Dr. Sarah Jenkins</h2>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mt-1.5">Attending Physician</span>
            <span className="text-[8.5px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Lead Medical Officer</span>
          </div>

          {/* Barcode & Security Badge elements */}
          <div className="w-full bg-[#0c1322]/50 border border-[#1e2d4a]/40 rounded-xl p-3.5 flex flex-col items-center gap-2 mt-6 relative">
            <FaUserShield className="text-slate-600 text-base" />
            <div className="w-full flex flex-col items-center gap-1">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Secure Access Token</span>
              <span className="font-mono text-[9px] text-slate-300 tracking-widest uppercase font-mono">EHR-SEC-98124-SJ</span>
            </div>
            {/* Faux security barcode lines */}
            <div className="w-full h-5 mt-1 flex justify-between gap-0.5 opacity-30 select-none">
              {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1].map((w, idx) => (
                <div key={idx} className="bg-white h-full" style={{ width: `${w}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Credentials & Workstation Parameters (lg:col-span-8) */}
        <div className="lg:col-span-8 glass-panel border border-[#1e2d4a]/60 rounded-3xl p-6 flex flex-col justify-between shadow-2xl bg-[#172237]/35 min-h-[400px]">
          <div>
            <div className="flex items-center gap-2 border-b border-[#1e2d4a]/60 pb-3">
              <FaUserMd className="text-teal-400 text-xs" />
              <span className="text-white text-xs font-black uppercase tracking-wider">Practitioner Registry Parameters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c1322]/40 border border-[#1e2d4a]/40 hover:border-teal-500/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <FaHospital className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Affiliated Node</span>
                    <span className="text-white text-xs font-bold mt-1 block">Metro General Hospital</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-slate-400 bg-[#172237] px-2 py-0.5 rounded-lg border border-[#1e2d4a]/50 font-semibold font-mono shrink-0">
                  Central
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c1322]/40 border border-[#1e2d4a]/40 hover:border-teal-500/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <FaUserMd className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Specialty Domain</span>
                    <span className="text-white text-xs font-bold mt-1 block">General & Internal Med</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-slate-400 bg-[#172237] px-2 py-0.5 rounded-lg border border-[#1e2d4a]/50 font-semibold font-mono shrink-0">
                  MD
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c1322]/40 border border-[#1e2d4a]/40 hover:border-teal-500/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <FaRegIdCard className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">License Reference ID</span>
                    <span className="text-white text-xs font-mono font-bold mt-1 block">LIC-98124</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/15 font-bold uppercase shrink-0">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c1322]/40 border border-[#1e2d4a]/40 hover:border-teal-500/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <FaShieldAlt className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Security Compliance</span>
                    <span className="text-white text-xs font-bold mt-1 block">HIPAA / GDPR Access</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/15 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <FaCheckCircle className="text-[9px]" />
                  Passed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0c1322]/30 border border-[#1e2d4a]/45 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Connected Node: <strong className="text-slate-200">metro-gen-hosp-central-04</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span>IP Address: <strong className="text-slate-200 font-mono">192.168.1.142</strong></span>
              <span className="text-slate-600">•</span>
              <span>Latency: <strong className="text-slate-200 font-mono">14ms</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. MIDDLE SECTION: Clinician Performance Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel border border-[#1e2d4a]/50 bg-[#172237]/20 p-4 rounded-2xl flex items-center gap-4 hover:border-teal-500/30 hover:bg-[#172237]/40 transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#0c1322] border border-[#1e2d4a] flex items-center justify-center text-sm shrink-0 shadow-inner">
              {stat.icon}
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">{stat.label}</span>
              <span className="text-white text-lg font-black mt-1 block leading-none">{stat.value}</span>
              <span className="text-[8px] text-slate-400 mt-1 block truncate leading-none">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM SECTION: Node Connections Status + Security Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* EHR System Integrations (lg:col-span-6) */}
        <div className="lg:col-span-6 glass-panel border border-[#1e2d4a]/60 rounded-3xl p-5 shadow-xl bg-[#172237]/25 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#1e2d4a]/60 pb-3">
            <FaNetworkWired className="text-teal-400 text-xs" />
            <span className="text-white text-xs font-black uppercase tracking-wider">EHR System Integrations</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {integrations.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#0c1322]/30 px-3.5 py-2.5 rounded-xl border border-[#1e2d4a]/30 hover:border-[#1e2d4a]/60 transition-colors">
                <div className="text-left min-w-0">
                  <span className="text-white text-xs font-bold block leading-none">{item.name}</span>
                  <span className="text-slate-500 text-[8px] font-semibold mt-1 block leading-none">{item.desc}</span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${item.color} font-mono shrink-0`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Security Logs & Audit Trail (lg:col-span-6) */}
        <div className="lg:col-span-6 glass-panel border border-[#1e2d4a]/60 rounded-3xl p-5 shadow-xl bg-[#172237]/25 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#1e2d4a]/60 pb-3">
            <FaHistory className="text-teal-400 text-xs" />
            <span className="text-white text-xs font-black uppercase tracking-wider">Active Security Audit Log</span>
          </div>

          <div className="flex flex-col gap-3 font-mono">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 text-[10px] items-start border-l border-[#1e2d4a] pl-3 relative ml-1.5 pb-0.5">
                <span className="absolute left-[-3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                <span className="text-[8.5px] text-slate-500 font-bold shrink-0 mt-0.5">{log.time}</span>
                <div className="text-left min-w-0">
                  <span className="text-slate-200 font-semibold block leading-tight">{log.action}</span>
                  <span className="text-[8px] text-slate-600 block mt-0.5 leading-none">{log.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
}

export default ProfileWidget;
