import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaUser, FaVenusMars, FaPhone, FaCalendarAlt, FaAddressCard, FaInfoCircle, FaFileAlt, FaHistory, FaPills, FaSpinner, FaUpload } from 'react-icons/fa';
import { getPatientSessions, uploadFile } from '../../api';

function RecentPatients({
  patient,
  setPatient,
  patientId,
  setPatientId,
  showCreateForm,
  setShowCreateForm,
  newPatient,
  setNewPatient,
  onSearchPatient,
  onCreatePatient,
  recentPatientsList = []
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [patientTab, setPatientTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (patient && patientTab === 'history') {
      setLoadingSessions(true);
      getPatientSessions(patient.patient_id)
        .then(res => {
          setSessions(res.data || []);
        })
        .catch(err => {
          console.error(err);
          setSessions([]);
        })
        .finally(() => {
          setLoadingSessions(false);
        });
    }
  }, [patient, patientTab]);

  const [localDocs, setLocalDocs] = useState([
    { name: "Lab_Report_CBC.pdf" },
    { name: "Chest_XRay_Report.pdf" }
  ]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (patient) {
      setLocalDocs([
        { name: "Lab_Report_CBC.pdf" },
        { name: "Chest_XRay_Report.pdf" }
      ]);
    }
  }, [patient]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const res = await uploadFile(file);
      if (res.data.message === "uploaded") {
        setLocalDocs(prev => [...prev, { name: res.data.filename }]);
        alert(`Document Uploaded: ${res.data.filename}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload document");
    } finally {
      setUploadingDoc(false);
      // Reset input value to allow selecting same file again
      e.target.value = "";
    }
  };

  // Filter patients locally
  const filteredPatients = recentPatientsList.filter(p => 
    p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Patient Directory Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="glass-panel border border-[#1e2d4a]/60 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-[#1e2d4a]/60 pb-3">
              <div className="flex items-center gap-2">
                <FaAddressCard className="text-teal-400 text-sm" />
                <span className="text-white text-xs font-black uppercase tracking-wider">Patient Registry Directory</span>
              </div>
              <button
                onClick={() => {
                  setPatient(null);
                  setShowCreateForm(true);
                }}
                className="btn-3d-primary px-3 py-1.5 text-[10px] flex items-center gap-1.5 active:translate-y-[1px]"
              >
                <FaUserPlus className="text-[10px]" />
                <span>Register Patient</span>
              </button>
            </div>

            {/* Database Search Verification */}
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors text-xs" />
                <input
                  type="text"
                  placeholder="Verify Patient ID in central system..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 focus:bg-[#0c1322] transition-all placeholder-slate-600 font-medium"
                />
              </div>
              <button
                onClick={onSearchPatient}
                className="btn-3d-secondary px-4 h-9 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all border border-[#1e2d4a] active:translate-y-[1px]"
              >
                Verify
              </button>
            </div>

            {/* Directory list search and header */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registry Records ({filteredPatients.length})</span>
              <div className="relative group w-48">
                <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-400 transition-colors text-[10px]" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-7 pl-7.5 pr-3 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-[10px] outline-none focus:border-teal-500/30 transition-all placeholder-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Scrollable Patient Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[440px] overflow-y-auto pr-1 no-scrollbar">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => {
                  const isSelected = patient && patient.patient_id === p.patient_id;
                  const firstLetters = p.name ? p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "PT";
                  return (
                    <div
                      key={p.patient_id}
                      onClick={() => {
                        setPatient(p);
                        setShowCreateForm(false);
                      }}
                      className={`flex flex-col p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 glass-panel-hover min-w-0 ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500/40 shadow-lg shadow-teal-500/5'
                          : 'bg-[#172237]/40 border-[#1e2d4a]/60 hover:bg-[#172237]/60 hover:border-[#1e2d4a]/90 shadow-sm'
                      }`}
                    >
                      {/* Top Row: Badge + ID / Age */}
                      <div className="flex items-center justify-between gap-2 w-full mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-inner shrink-0 ${
                            isSelected 
                              ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white' 
                              : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300'
                          }`}>
                            {firstLetters}
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono block leading-none truncate">{p.patient_id}</span>
                        </div>
                        <span className="text-[9px] bg-[#0c1322] px-2 py-0.5 rounded-full font-mono text-slate-400 border border-[#1e2d4a]/50 shrink-0">
                          {p.age} Y/O
                        </span>
                      </div>

                      {/* Middle Row: Name in a single line */}
                      <div className="w-full mb-2 min-w-0">
                        <p 
                          className="text-white leading-tight font-black" 
                          style={{ 
                            fontSize: "12px", 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis" 
                          }}
                          title={p.name}
                        >
                          {p.name}
                        </p>
                      </div>
                      
                      <div className="border-t border-[#1e2d4a]/40 mt-1 pt-2 flex items-center justify-between text-[9px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <FaVenusMars className="text-slate-600 text-[10px]" />
                          {p.gender}
                        </span>
                        <span className="flex items-center gap-1 font-mono truncate max-w-[110px]">
                          <FaPhone className="text-slate-600 text-[8px]" />
                          {p.phone}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-xs text-slate-600 font-semibold border border-dashed border-slate-900 rounded-xl">
                  No registered patient records match your filter
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Patient Folder or Create Form (lg:col-span-5) */}
        <div className="lg:col-span-5">
          {showCreateForm ? (
            /* Registry Form Card */
            <div className="glass-panel border border-teal-500/20 bg-teal-500/[0.02] rounded-2xl p-5 flex flex-col gap-4 shadow-xl animate-fade-in">
              <div className="flex items-center gap-2 border-b border-[#1e2d4a]/60 pb-3">
                <FaUserPlus className="text-teal-400 text-xs" />
                <span className="text-white text-xs font-black uppercase tracking-wider">Patient Registration Form</span>
              </div>
              
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Full Patient Name</label>
                  <input
                    placeholder="Enter name..."
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="h-9 px-3 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Age (Years)</label>
                    <input
                      placeholder="Age..."
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      className="h-9 px-3 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gender</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="h-9 px-2 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-slate-300 text-xs outline-none focus:border-teal-500/40 font-medium"
                    >
                      <option value="" disabled>Select gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Mobile Phone Number</label>
                  <input
                    placeholder="+91 India / Phone Number"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="h-9 px-3 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={onCreatePatient}
                    className="btn-3d-primary flex-1 h-9 text-xs font-bold cursor-pointer active:translate-y-[1px]"
                  >
                    Confirm Registration
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="btn-3d-secondary px-4 h-9 text-xs font-bold cursor-pointer active:translate-y-[1px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : patient ? (
            /* Elegantly Styled EMR Patient Folder Card */
            <div className="glass-panel border border-teal-500/25 bg-teal-500/[0.01] rounded-2xl p-5 flex flex-col gap-4 shadow-xl animate-fade-in">
              
              <div className="flex items-center justify-between border-b border-[#1e2d4a]/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-[10px] text-teal-400 font-black uppercase tracking-wider">Active Medical Chart</span>
                </div>
                <button 
                  onClick={() => setPatient(null)} 
                  className="text-[9px] text-slate-500 hover:text-rose-400 font-bold bg-transparent border-none cursor-pointer transition-colors"
                >
                  Close Chart
                </button>
              </div>

              {/* Patient Basic Profile Banner */}
              <div className="flex items-center gap-3 bg-[#0c1322]/40 p-3 rounded-xl border border-[#1e2d4a]/40">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-black shadow-md font-mono">
                  {patient.name ? patient.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "PT"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white text-sm font-black m-0 leading-tight truncate">{patient.name}</h3>
                  <span className="text-[9.5px] text-slate-500 font-mono mt-1 block font-mono">ID: {patient.patient_id} • {patient.gender} • {patient.age} Y/O</span>
                </div>
              </div>

              {/* Patient Chart Sub Tabs */}
              <div className="flex bg-[#0c1322] p-0.5 rounded-xl border border-[#1e2d4a]/80 shadow-inner">
                {["overview", "history", "documents", "medications"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPatientTab(tab)}
                    className={`flex-1 py-1.5 text-[8.5px] font-black rounded-lg transition-all duration-300 cursor-pointer border-none bg-transparent ${
                      patientTab === tab 
                        ? "bg-[#172237] text-teal-400 shadow-sm" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Active Tab Panel Body */}
              <div className="bg-[#0c1322]/20 border border-[#1e2d4a]/30 rounded-xl p-3.5 min-h-[160px] flex flex-col justify-start">
                
                {patientTab === "overview" && (
                  <div className="flex flex-col gap-3 text-[10px] text-slate-300">
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#1e2d4a]/30">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Contact Phone</span>
                        <span className="font-mono text-slate-200 font-mono">{patient.phone || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Last Encounter</span>
                        <span className="text-slate-200">10 May 2024</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Clinical Alerts</span>
                      <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5 text-rose-400">
                        <FaInfoCircle className="text-[9px]" />
                        <span>No known drug allergies (NKDA) | Blood Group: O+</span>
                      </div>
                    </div>
                  </div>
                )}

                {patientTab === "history" && (
                  <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-0.5 no-scrollbar">
                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">Past Diagnoses & Visits ({sessions.length})</span>
                    
                    {loadingSessions ? (
                      <div className="flex items-center justify-center py-6 text-slate-500 text-[10px] gap-1.5 font-semibold">
                        <FaSpinner className="animate-spin text-teal-400" />
                        <span>Fetching historical charts...</span>
                      </div>
                    ) : sessions.length > 0 ? (
                      sessions.map((session, idx) => {
                        // Extract first diagnosis line from Assessment section of SOAP report
                        let diagnosis = "Consultation Summary";
                        if (session.report) {
                          const assessmentMatch = session.report.match(/(?:A:|Assessment:)\s*\n*([^\n]+)/i);
                          if (assessmentMatch && assessmentMatch[1].trim()) {
                            diagnosis = assessmentMatch[1].trim().replace(/^[\*\-\d\s\.\:]+/, "");
                            if (diagnosis.length > 35) diagnosis = diagnosis.slice(0, 35) + "...";
                          }
                        }
                        
                        const sessionDate = session.created_at 
                          ? new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : "N/A";
                          
                        return (
                          <div 
                            key={session.consultation_id || idx} 
                            className="flex items-start gap-2.5 bg-[#0c1322]/40 p-2.5 rounded-lg border border-[#1e2d4a]/20 hover:border-teal-500/25 transition-all"
                          >
                            <FaHistory className="text-teal-400 text-[9px] mt-0.5 shrink-0" />
                            <div className="text-[10px] text-left min-w-0 flex-1">
                              <p className="m-0 text-slate-200 font-bold leading-none mb-1 truncate">{diagnosis}</p>
                              <span className="text-slate-500 font-mono text-[8px]">Date: {sessionDate} • Ref: Session #{session.session_id}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-[10px] text-slate-600 font-semibold border border-dashed border-slate-900 rounded-xl">
                        No past consultation records found in SQLite database.
                      </div>
                    )}
                  </div>
                )}

                {patientTab === "documents" && (
                  <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-0.5 no-scrollbar">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Uploaded Clinical Files ({localDocs.length})</span>
                      <label className="flex items-center gap-1.5 text-[8.5px] text-teal-400 hover:text-teal-300 font-bold cursor-pointer transition-colors bg-[#0c1322] border border-[#1e2d4a]/50 px-2.5 py-1 rounded-md active:translate-y-[1px] select-none">
                        <FaUpload className="text-[7.5px]" />
                        <span>{uploadingDoc ? "Uploading..." : "Upload File"}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg"
                          onChange={handleFileUpload}
                          disabled={uploadingDoc}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {localDocs.map((doc, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#0c1322]/40 px-3 py-2 rounded-lg border border-[#1e2d4a]/20 hover:border-teal-500/10 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <FaFileAlt className="text-cyan-500 text-[9px] shrink-0" />
                          <span className="text-slate-200 text-[10px] font-bold truncate">{doc.name}</span>
                        </div>
                        <span className="text-teal-400 font-bold text-[8.5px] cursor-pointer hover:underline uppercase">View</span>
                      </div>
                    ))}
                  </div>
                )}

                {patientTab === "medications" && (
                  <div className="flex flex-col gap-2">
                    <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider mb-1">Active Prescriptions</span>
                    <div className="flex items-start gap-2.5 bg-[#0c1322]/40 p-2.5 rounded-lg border border-[#1e2d4a]/20">
                      <FaPills className="text-emerald-400 text-[10px] shrink-0 mt-0.5" />
                      <div className="text-[10px]">
                        <p className="m-0 text-slate-200 font-bold leading-none mb-1">Amoxicillin 500mg</p>
                        <span className="text-slate-500 text-[8px]">Instructions: Take 1 capsule three times daily for 5 days</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-[#0c1322]/40 p-2.5 rounded-lg border border-[#1e2d4a]/20">
                      <FaPills className="text-emerald-400 text-[10px] shrink-0 mt-0.5" />
                      <div className="text-[10px]">
                        <p className="m-0 text-slate-200 font-bold leading-none mb-1">Cetirizine 10mg</p>
                        <span className="text-slate-500 text-[8px]">Instructions: Take 1 tablet once daily at bedtime for 10 days</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Heartbeat Placeholder State card */
            <div className="glass-panel border border-dashed border-[#1e2d4a]/85 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
              <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-teal-500/5 border border-teal-500/15 flex items-center justify-center text-teal-400 mb-3.5 shadow-md animate-pulse">
                <FaUser className="text-lg" />
              </div>
              <h4 className="text-xs text-slate-300 font-black uppercase tracking-wider m-0">No Patient Chart Opened</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px] mt-2 leading-relaxed">
                Select a patient from the registry directory or click Register Patient to start a new consultation session.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default RecentPatients;
