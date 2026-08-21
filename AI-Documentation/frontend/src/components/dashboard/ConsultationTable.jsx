import React, { useState } from 'react';
import { FaFileMedical, FaSearch, FaChevronRight, FaClock } from 'react-icons/fa';

function ConsultationTable({ consultations = [], onSelectConsultation }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = consultations.filter(item => 
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.diagnosis && item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-panel border border-[#1e2d4a]/60 rounded-2xl p-5 flex flex-col gap-5 shadow-xl bg-[#172237]/30">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2d4a]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-md">
            <FaFileMedical className="text-sm" />
          </div>
          <div>
            <h2 className="text-white text-xs font-black uppercase tracking-wider m-0 leading-none">Consultation Report Vault</h2>
            <span className="text-[9px] text-slate-500 font-bold mt-1 block uppercase">EHR Finalized Encounter Charts</span>
          </div>
        </div>
        
        {/* Central vault filter input */}
        <div className="relative group w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors text-xs" />
          <input
            type="text"
            placeholder="Search by ID, name, diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8.5 pl-9 pr-3 rounded-xl bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/30 transition-all placeholder-slate-700 font-medium"
          />
        </div>
      </div>

      {/* Structured Medical Table */}
      <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-[#1e2d4a]/40 bg-[#0c1322]/20">
        <table className="w-full border-collapse text-left min-w-[650px]">
          <thead>
            <tr className="border-b border-[#1e2d4a]/60 bg-[#0c1322]/40 text-slate-500 text-[8.5px] font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Patient Profile</th>
              <th className="py-3.5 px-3">Date / Time</th>
              <th className="py-3.5 px-3">Primary Diagnosis</th>
              <th className="py-3.5 px-3">Review Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d4a]/30">
            {filtered.length > 0 ? (
              filtered.map((item, index) => {
                const isCompleted = item.status === 'Completed';
                const patientFirstInitial = item.patientName ? item.patientName.charAt(0) : "P";
                
                return (
                  <tr 
                    key={index} 
                    className="hover:bg-[#1e2d4a]/15 transition-all group cursor-pointer"
                    onClick={() => onSelectConsultation && onSelectConsultation(item)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7.5 h-7.5 rounded-lg bg-[#172237] border border-[#1e2d4a]/60 text-slate-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {patientFirstInitial}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-white text-xs font-bold truncate max-w-[150px]">{item.patientName}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{item.patientId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <FaClock className="text-[9px] text-slate-600 shrink-0" />
                        <span>{item.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-teal-300 font-semibold">{item.diagnosis || 'General SOAP Review'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase ${
                        isCompleted 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        className="btn-3d-secondary px-3 py-1 text-[10px] inline-flex items-center gap-1 group-hover:scale-105 active:translate-y-[1px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectConsultation && onSelectConsultation(item);
                        }}
                      >
                        <span>Review Chart</span>
                        <FaChevronRight className="text-[7px] text-slate-500" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 text-xs text-slate-600 font-bold border-none">
                  No finalized consultation encounter charts found matching the filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConsultationTable;
