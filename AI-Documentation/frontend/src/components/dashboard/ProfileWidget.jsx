import { motion } from "framer-motion";
import { 
  FaUserMd, 
  FaHospital, 
  FaRegIdCard, 
  FaShieldAlt, 
  FaUserShield, 
  FaCheckCircle, 
  FaNetworkWired,
  FaHistory,
  FaMicrophone,
  FaFileAlt,
  FaWhatsapp
} from "react-icons/fa";

function ProfileWidget() {
  const stats = [
    { label: "Dictation Volume", value: "42.5 Hrs", desc: "Total Audio Input", icon: <FaMicrophone className="text-[#1a7f8e]" /> },
    { label: "SOAP Notes Finalized", value: "148", desc: "EHR Compliant Logs", icon: <FaFileAlt className="text-[#2b6cb0]" /> },
    { label: "Speech Engine Accuracy", value: "99.2%", desc: "Whisper Fine-Tuned", icon: <FaShieldAlt className="text-[#107c74]" /> },
    { label: "Handoff PDF Deliveries", value: "112", desc: "WhatsApp Relays", icon: <FaWhatsapp className="text-[#2eb37e]" /> }
  ];

  const integrations = [
    { name: "HL7 FHIR API", status: "ONLINE", desc: "Central EMR Synchronization", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Epic Systems Bridge", status: "ONLINE", desc: "Patient Record Exchange", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Cerner Health Gateway", status: "STANDBY", desc: "Secondary Registry Node", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "WhatsApp Gateway API", status: "ACTIVE", desc: "Secure Patient Report Relay", color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
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
      className="w-full space-y-6 text-left"
    >
      {/* 1. TOP SECTION: Badge + Basic Registry Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT CARD: Holographic Clinical ID Badge (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-sm relative overflow-hidden min-h-[400px]">
          {/* Top blue/teal indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1c4d8d] via-[#1a7f8e] to-[#00909e]" />
          
          {/* Security badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-[8px] font-extrabold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified
          </div>

          <div className="w-full flex flex-col items-center mt-6">
            {/* Avatar Group */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1a7f8e] via-[#2b6cb0] to-[#00909e] p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-[#1a7f8e] font-black text-2xl shadow-inner font-mono">
                  SJ
                </div>
              </div>
              <span className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>

            <h2 className="text-[#1a3b6e] text-base font-extrabold m-0 leading-tight">Dr. Sarah Jenkins</h2>
            <span className="text-[10px] text-[#1a7f8e] font-extrabold uppercase tracking-wider mt-1.5">Attending Physician</span>
            <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider mt-1">Lead Medical Officer</span>
          </div>

          {/* Secure access token */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col items-center gap-2 mt-6 relative shadow-inner">
            <FaUserShield className="text-slate-500 text-base" />
            <div className="w-full flex flex-col items-center gap-1">
              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Secure Access Token</span>
              <span className="font-mono text-[9px] text-[#1a3b6e] tracking-widest uppercase font-mono font-bold">EHR-SEC-98124-SJ</span>
            </div>
            {/* Barcode representation */}
            <div className="w-full h-5 mt-1 flex justify-between gap-0.5 opacity-25 select-none">
              {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1].map((w, idx) => (
                <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Credentials & Workstation Parameters (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm min-h-[400px]">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaUserMd className="text-[#1a7f8e] text-sm" />
              <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider">Practitioner Registry Parameters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1a7f8e]/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                    <FaHospital className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Affiliated Node</span>
                    <span className="text-[#1a3b6e] text-xs font-bold mt-1 block">Metro General Hospital</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-bold font-mono shrink-0">
                  Central
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1a7f8e]/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                    <FaUserMd className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Specialty Domain</span>
                    <span className="text-[#1a3b6e] text-xs font-bold mt-1 block">General &amp; Internal Med</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-bold font-mono shrink-0">
                  MD
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1a7f8e]/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                    <FaRegIdCard className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">License Reference ID</span>
                    <span className="text-[#1a3b6e] text-xs font-mono font-bold mt-1 block">LIC-98124</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold uppercase shrink-0">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1a7f8e]/25 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                    <FaShieldAlt className="text-xs" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Security Compliance</span>
                    <span className="text-[#1a3b6e] text-xs font-bold mt-1 block">HIPAA / GDPR Access</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <FaCheckCircle className="text-[9px]" />
                  Passed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1a7f8e] animate-pulse" />
              <span>Connected Node: <strong className="text-slate-700">metro-gen-hosp-central-04</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span>IP Address: <strong className="text-slate-700 font-mono">192.168.1.142</strong></span>
              <span className="text-slate-300">•</span>
              <span>Latency: <strong className="text-slate-700 font-mono">14ms</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. MIDDLE SECTION: Clinician Performance Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 hover:border-[#1a7f8e]/30 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm shrink-0">
              {stat.icon}
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">{stat.label}</span>
              <span className="text-[#1a3b6e] text-lg font-black mt-1 block leading-none">{stat.value}</span>
              <span className="text-[8px] text-slate-400 mt-1 block truncate leading-none">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM SECTION: Node Connections Status + Security Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* EHR System Integrations (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaNetworkWired className="text-[#1a7f8e] text-sm shrink-0" />
            <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider">EHR System Integrations</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {integrations.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-[#1a7f8e]/30 transition-colors">
                <div className="text-left min-w-0">
                  <span className="text-[#1a3b6e] text-xs font-bold block leading-none">{item.name}</span>
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
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaHistory className="text-[#1a7f8e] text-sm shrink-0" />
            <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider">Active Security Audit Log</span>
          </div>

          <div className="flex flex-col gap-3 font-mono">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 text-[10px] items-start border-l border-slate-200 pl-3 relative ml-1.5 pb-0.5">
                <span className="absolute left-[-3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#1a7f8e] shrink-0" />
                <span className="text-[8.5px] text-slate-500 font-bold shrink-0 mt-0.5">{log.time}</span>
                <div className="text-left min-w-0">
                  <span className="text-slate-700 font-semibold block leading-tight">{log.action}</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5 leading-none">{log.details}</span>
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
