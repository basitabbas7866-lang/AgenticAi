import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaStop,
  FaPause,
  FaPlay,
  FaSpinner,
  FaGlobe,
  FaUsers
} from "react-icons/fa";

function WorkstationController({
  patient,
  isRecording,
  isPaused,
  recordingTime,
  audioBlob,
  audioLevels = [0, 0, 0, 0, 0, 0, 0, 0],
  transcribing,
  language,
  speakerData,
  patientIntakeMode,
  setPatientIntakeMode,
  patientId,
  setPatientId,
  recentPatients,
  setPatient,
  quickPatient,
  setQuickPatient,
  handleSearchPatient,
  handleQuickRegister,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  transcribeAudio,
  formatTime
}) {
  const [waveHistory, setWaveHistory] = React.useState(Array(80).fill(0.01));
  const audioLevelsRef = React.useRef(audioLevels);

  React.useEffect(() => {
    audioLevelsRef.current = audioLevels;
  }, [audioLevels]);

  React.useEffect(() => {
    if (!isRecording) {
      setWaveHistory(Array(80).fill(0.01));
      return;
    }

    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setWaveHistory(prev => {
        const next = [...prev.slice(1)];
        const currentLevels = audioLevelsRef.current || [];
        const avg = currentLevels.reduce((a, b) => a + b, 0) / (currentLevels.length || 1);
        const vol = Math.min(1.0, avg * 1.8);
        next.push(vol > 0.01 ? vol : 0.01);
        return next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 20 }}
      className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#1a7f8e]/[0.02] rounded-full blur-[60px] pointer-events-none" />

      {/* Pulsing Hardware Orb */}
      <motion.div
        animate={isRecording ? {
          scale: [1, 1.04, 1],
          borderColor: ["rgba(239,68,68,0.3)", "rgba(239,68,68,0.6)", "rgba(239,68,68,0.3)"],
          boxShadow: ["0 0 20px rgba(239,68,68,0.1)", "0 0 35px rgba(239,68,68,0.25)", "0 0 20px rgba(239,68,68,0.1)"]
        } : isPaused ? {
          scale: 1.02,
          borderColor: "rgba(245,158,11,0.3)",
          boxShadow: "0 0 25px rgba(245,158,11,0.15)"
        } : {
          scale: 1,
          borderColor: "rgba(26,127,142,0.2)",
          boxShadow: "0 0 20px rgba(26,127,142,0.05)"
        }}
        transition={isRecording ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : {}}
        className="relative w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500 bg-slate-50"
      >
        <FaMicrophone className={`text-xl transition-colors duration-300 ${isRecording ? 'text-red-500' : isPaused ? 'text-amber-500' : 'text-[#1a7f8e]'}`} />
        {isRecording && (
          <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-75" />
        )}
      </motion.div>

      {/* Dynamic Action Switcher / Status Screen */}
      <div className="mt-5 w-full max-w-md">
        {isRecording || isPaused ? (
          <div className="flex flex-col items-center">
            <span className="text-[#1a3b6e] text-2xl font-black font-mono tracking-tight leading-none">
              {formatTime(recordingTime)}
            </span>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider mt-2 ${isPaused ? 'text-amber-600' : 'text-red-600'}`}>
              {isPaused ? 'Recording Paused' : 'Recording Dialogue...'}
            </span>
          </div>
        ) : !patient ? (
          <div className="w-full flex flex-col gap-3.5">
            {/* Mode Controls */}
            <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 max-w-[280px] mx-auto w-full relative">
              {["search", "create"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPatientIntakeMode(mode)}
                  className={`flex-1 py-1.5 text-[10px] font-extrabold transition-all rounded-lg border-none cursor-pointer z-10 ${
                    patientIntakeMode === mode ? "bg-[#1a3b6e] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 bg-transparent"
                  }`}
                >
                  {mode === "search" ? "Search Patient" : "Register Patient"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {patientIntakeMode === "search" ? (
                <motion.div
                  key="search-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3 text-left"
                >
                  <div className="text-center">
                    <h3 className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider m-0">Search Patient Chart</h3>
                    <p className="text-slate-500 text-[9px] mt-0.5 font-bold uppercase tracking-wider">Enter a patient ID or select from recent charts.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      placeholder="Patient ID (e.g. P1001)..."
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                    <button
                      onClick={handleSearchPatient}
                      className="px-4 bg-[#1a3b6e] text-white hover:bg-[#15305b] font-bold text-xs rounded-lg border-none cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      Verify
                    </button>
                  </div>

                  <div className="mt-1 flex flex-col gap-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Recent Charts</span>
                    <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto no-scrollbar pr-0.5">
                      {recentPatients.map(p => (
                        <button
                          key={p.patient_id}
                          onClick={() => setPatient(p)}
                          className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-left hover:border-[#1a7f8e]/30 hover:bg-slate-100 transition-all cursor-pointer truncate active:scale-95"
                        >
                          <span className="block text-[7px] text-slate-500 font-bold uppercase tracking-wider leading-none">{p.patient_id}</span>
                          <span className="block text-[#1a3b6e] text-[11px] font-extrabold truncate mt-0.5 leading-none">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="create-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3 text-left"
                >
                  <div className="text-center">
                    <h3 className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider m-0">Register Patient</h3>
                    <p className="text-slate-500 text-[9px] mt-0.5 font-bold uppercase tracking-wider">Capture details. Timestamp automatically initialized.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Full Name"
                      value={quickPatient.name}
                      onChange={(e) => setQuickPatient({ ...quickPatient, name: e.target.value })}
                      className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                    <input
                      placeholder="Age"
                      type="number"
                      value={quickPatient.age}
                      onChange={(e) => setQuickPatient({ ...quickPatient, age: e.target.value })}
                      className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={quickPatient.gender}
                      onChange={(e) => setQuickPatient({ ...quickPatient, gender: e.target.value })}
                      className="h-10 px-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs outline-none focus:border-[#1a7f8e] font-bold"
                    >
                      <option value="" disabled>Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      placeholder="Mobile No"
                      value={quickPatient.phone}
                      onChange={(e) => setQuickPatient({ ...quickPatient, phone: e.target.value })}
                      className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                  </div>

                  <input
                    placeholder="Home Address"
                    value={quickPatient.address}
                    onChange={(e) => setQuickPatient({ ...quickPatient, address: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                  />

                  <button
                    onClick={handleQuickRegister}
                    className="w-full bg-[#1a7f8e] hover:bg-[#00909e] text-white font-extrabold text-xs h-10 rounded-full border-none cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center justify-center"
                  >
                    <span>Register &amp; Lock Patient Chart</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="text-[#1a3b6e] text-base font-extrabold m-0 uppercase tracking-wide">Start Ambient Clinical Dictation</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-sm leading-relaxed font-bold">
              Chart is locked for <span className="text-[#1a7f8e]">{patient.name}</span>. Click below to begin recording.
            </p>
          </div>
        )}
      </div>

      {/* Control Triggers */}
      {patient && (
        <div className="mt-6 flex items-center gap-4">
          {!isRecording && !isPaused ? (
            <button
              onClick={startRecording}
              className="bg-[#1a7f8e] hover:bg-[#00909e] text-white py-2.5 px-6 rounded-full text-xs font-bold shadow-sm cursor-pointer border-none"
            >
              Start Recording
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-full cursor-pointer flex items-center gap-2"
                >
                  <FaPlay className="text-[9px]" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-full cursor-pointer flex items-center gap-2"
                >
                  <FaPause className="text-[9px]" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-full border-none cursor-pointer flex items-center gap-2"
              >
                <FaStop className="text-[9px]" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Dynamic Voice Frequency Waves Animation */}
      {isRecording && (
        <div className="relative flex items-center justify-center gap-[2px] mt-6 w-full max-w-md h-16 bg-slate-50 border border-slate-200 rounded-xl px-4 overflow-hidden shadow-inner">
          {/* Dashed Center Baseline */}
          <div className="absolute left-0 right-0 h-px border-t border-dashed border-red-300 z-0 pointer-events-none" />
          
          {/* Waveform timeline */}
          <div className="flex items-center justify-center gap-[2px] w-full h-full z-10 relative">
            {waveHistory.map((val, idx) => {
              const barHeight = Math.max(2, val * 52);
              return (
                <div
                  key={idx}
                  className="w-[3px] bg-[#1a7f8e] rounded-full transition-all duration-75 shrink-0"
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Post Processing Handoff Engine */}
      {audioBlob && !isRecording && !isPaused && (
        <div className="mt-6 pt-5 border-t border-slate-100 w-full flex flex-col items-center gap-3">
          <button
            onClick={transcribeAudio}
            disabled={transcribing}
            className="w-full bg-gradient-to-r from-[#e8a020] to-[#f3b236] text-[#1a3b6e] font-extrabold text-xs h-10 rounded-full border border-amber-300 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {transcribing ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Converting Dictation...</span>
              </>
            ) : (
              <span>Convert To Text</span>
            )}
          </button>

          {(language || transcribing) && (
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500 mt-1">
              {language && (
                <span className="flex items-center gap-1.5">
                  <FaGlobe className="text-slate-400 text-[10px]" />
                  Detected Language: <span className="text-[#1a3b6e] font-mono uppercase">{language}</span>
                </span>
              )}
              {language && (
                <span className="flex items-center gap-1.5">
                  <FaUsers className="text-slate-400 text-[10px]" />
                  Speakers: <span className="text-[#1a3b6e] font-mono">{speakerData.length || 2} Detected</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default WorkstationController;