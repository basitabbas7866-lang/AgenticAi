import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaUser, FaVenusMars, FaPhone, FaAddressCard, FaInfoCircle, FaFileAlt, FaHistory, FaPills, FaSpinner, FaUpload } from 'react-icons/fa';
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
      e.target.value = "";
    }
  };

  const filteredPatients = recentPatientsList.filter(p => 
    p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <div className="w-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Patient Directory Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FaAddressCard className="text-[#1a7f8e] text-sm" />
                <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider">Patient Registry Directory</span>
              </div>
              <button
                onClick={() => {
                  setPatient(null);
                  setShowCreateForm(true);
                }}
                className="btn-pill btn-primary py-1.5 px-4 text-xs"
              >
                <FaUserPlus />
                <span>Register Patient</span>
              </button>
            </div>

            {/* Database Search Verification */}
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-xs z-10" />
                <input
                  type="text"
                  placeholder="Verify Patient ID in central system..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all placeholder:text-slate-400 font-semibold"
                />
              </div>
              <button
                onClick={onSearchPatient}
                className="bg-[#1a3b6e] text-white hover:bg-[#15305b] px-4 py-2 text-xs font-bold rounded-xl border-none cursor-pointer shadow-sm transition-all"
              >
                Verify
              </button>
            </div>

            {/* Directory list search and header */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registry Records ({filteredPatients.length})</span>
              <div className="relative group w-48">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-8 pl-8.5 pr-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Scrollable Patient Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[440px] overflow-y-auto pr-1">
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
                      className={`flex flex-col p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 min-w-0 ${
                        isSelected
                          ? 'bg-[#1a7f8e]/5 border-[#1a7f8e]/40 border-l-4 border-l-[#1a7f8e] shadow-sm'
                          : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {/* Top Row: Badge + ID / Age */}
                      <div className="flex items-center justify-between gap-2 w-full mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-inner shrink-0 ${
                            isSelected 
                              ? 'bg-[#1a7f8e] text-white' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {firstLetters}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono font-bold block leading-none truncate">{p.patient_id}</span>
                        </div>
                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600 border border-slate-200 shrink-0">
                          {p.age} Y/O
                        </span>
                      </div>

                      {/* Middle Row: Name */}
                      <div className="w-full mb-2 min-w-0">
                        <p 
                          className="text-[#1a3b6e] leading-tight font-extrabold" 
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
                      
                      <div className="border-t border-slate-100 mt-1 pt-2 flex items-center justify-between text-[9px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <FaVenusMars className="text-[#1a7f8e] text-[10px]" />
                          {p.gender}
                        </span>
                        <span className="flex items-center gap-1 font-mono truncate max-w-[110px]">
                          <FaPhone className="text-[#1a7f8e] text-[8px]" />
                          {p.phone}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl">
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
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FaUserPlus className="text-[#1a7f8e] text-sm" />
                <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider">Patient Registration Form</span>
              </div>
              
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Full Patient Name</label>
                  <input
                    placeholder="Enter name..."
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
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
                      className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gender</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="h-10 px-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs outline-none focus:border-[#1a7f8e] font-bold"
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
                    className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={onCreatePatient}
                    className="btn-pill btn-amber flex-1 h-10 text-xs shadow-sm"
                  >
                    Confirm Registration
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="btn-pill btn-secondary px-5 h-10 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : patient ? (
            /* Elegantly Styled EMR Patient Folder Card */
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm text-left">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a7f8e] animate-pulse" />
                  <span className="text-[10px] text-[#1a3b6e] font-extrabold uppercase tracking-wider">Active Medical Chart</span>
                </div>
                <button 
                  onClick={() => setPatient(null)} 
                  className="text-[9px] text-slate-400 hover:text-red-500 font-bold bg-transparent border-none cursor-pointer transition-colors"
                >
                  Close Chart
                </button>
              </div>

              {/* Patient Basic Profile Banner */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1a7f8e]/10 to-[#2b6cb0]/10 border border-[#1a7f8e]/20 text-[#1a7f8e] flex items-center justify-center text-sm font-black shadow-inner font-mono">
                  {patient.name ? patient.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "PT"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#1a3b6e] text-sm font-extrabold m-0 leading-tight truncate">{patient.name}</h3>
                  <span className="text-[9.5px] text-slate-500 font-mono font-bold mt-1 block">ID: {patient.patient_id} • {patient.gender} • {patient.age} Y/O</span>
                </div>
              </div>

              {/* Patient Chart Sub Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                {["overview", "history", "documents", "medications"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPatientTab(tab)}
                    className={`flex-1 py-1.5 text-[8.5px] font-black rounded-lg transition-all cursor-pointer border-none bg-transparent ${
                      patientTab === tab 
                        ? "bg-[#1a3b6e] text-white shadow-sm font-extrabold" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Active Tab Panel Body */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 min-h-[160px] flex flex-col justify-start">
                
                {patientTab === "overview" && (
                  <div className="flex flex-col gap-3 text-[10px] text-slate-600">
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-[8px] font-extrabold uppercase tracking-wider">Contact Phone</span>
                        <span className="font-mono text-slate-700 font-bold">{patient.phone || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-[8px] font-extrabold uppercase tracking-wider">Last Encounter</span>
                        <span className="text-slate-700 font-bold">21 Aug 2026</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-slate-400 text-[8px] font-extrabold uppercase tracking-wider">Clinical Alerts</span>
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 text-red-600 font-bold">
                        <FaInfoCircle className="text-[10px] shrink-0" />
                        <span>No known drug allergies (NKDA) | Blood Group: O+</span>
                      </div>
                    </div>
                  </div>
                )}

                {patientTab === "history" && (
                  <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-0.5">
                    <span className="text-slate-400 text-[8px] font-extrabold uppercase tracking-wider mb-0.5">Past Consultations ({sessions.length})</span>
                    
                    {loadingSessions ? (
                      <div className="flex items-center justify-center py-6 text-slate-400 text-[10px] gap-1.5 font-bold">
                        <FaSpinner className="animate-spin text-[#1a7f8e]" />
                        <span>Fetching historical charts...</span>
                      </div>
                    ) : sessions.length > 0 ? (
                      sessions.map((session, idx) => {
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
                            className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-[#1a7f8e]/30 transition-all text-left"
                          >
                            <FaHistory className="text-[#1a7f8e] text-[10px] mt-0.5 shrink-0" />
                            <div className="text-[10px] min-w-0 flex-1">
                              <p className="m-0 text-[#1a3b6e] font-extrabold leading-none mb-1 truncate">{diagnosis}</p>
                              <span className="text-slate-400 font-mono text-[8px] font-bold">Date: {sessionDate} • Ref: Session #{session.session_id}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-[10px] text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl">
                        No past consultation records found.
                      </div>
                    )}
                  </div>
                )}

                {patientTab === "documents" && (
                  <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-0.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-400 text-[8px] font-extrabold uppercase tracking-wider">Uploaded Files ({localDocs.length})</span>
                      <label className="flex items-center gap-1.5 text-[8.5px] text-[#1a7f8e] hover:text-[#1a3b6e] font-extrabold cursor-pointer transition-colors bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md select-none">
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
                      <div key={idx} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-[#1a7f8e]/20 transition-colors text-left">
                        <div className="flex items-center gap-2 min-w-0">
                          <FaFileAlt className="text-[#2b6cb0] text-[9px] shrink-0" />
                          <span className="text-slate-700 text-[10px] font-bold truncate">{doc.name}</span>
                        </div>
                        <span className="text-[#1a7f8e] font-extrabold text-[8.5px] cursor-pointer hover:underline uppercase">View</span>
                      </div>
                    ))}
                  </div>
                )}

                {patientTab === "medications" && (
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-slate-400 text-[8px] font-extrabold uppercase tracking-wider mb-1">Active Prescriptions</span>
                    <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <FaPills className="text-[#2eb37e] text-[10px] shrink-0 mt-0.5" />
                      <div className="text-[10px]">
                        <p className="m-0 text-[#1a3b6e] font-extrabold leading-none mb-1">Amoxicillin 500mg</p>
                        <span className="text-slate-500 text-[8px] font-bold">Instructions: Take 1 capsule three times daily for 5 days</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <FaPills className="text-[#2eb37e] text-[10px] shrink-0 mt-0.5" />
                      <div className="text-[10px]">
                        <p className="m-0 text-[#1a3b6e] font-extrabold leading-none mb-1">Cetirizine 10mg</p>
                        <span className="text-slate-500 text-[8px] font-bold">Instructions: Take 1 tablet once daily at bedtime for 10 days</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Placeholder State card */
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5 shadow-inner">
                <FaUser className="text-lg" />
              </div>
              <h4 className="text-xs text-[#1a3b6e] font-extrabold uppercase tracking-wider m-0">No Patient Chart Opened</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px] mt-2 leading-relaxed font-bold">
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
