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
      className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-6 flex flex-col items-center text-center shadow-2xl relative bg-[#172237]/80 overflow-hidden grid-overlay"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/[0.04] rounded-full blur-[60px] pointer-events-none" />

      {/* Pulsing Hardware Orb */}
      <motion.div
        animate={isRecording ? {
          scale: [1, 1.04, 1],
          borderColor: ["rgba(244,63,94,0.3)", "rgba(244,63,94,0.6)", "rgba(244,63,94,0.3)"],
          boxShadow: ["0 0 20px rgba(244,63,94,0.15)", "0 0 35px rgba(244,63,94,0.35)", "0 0 20px rgba(244,63,94,0.15)"]
        } : isPaused ? {
          scale: 1.02,
          borderColor: "rgba(245,158,11,0.3)",
          boxShadow: "0 0 25px rgba(245,158,11,0.15)"
        } : {
          scale: 1,
          borderColor: "rgba(20,184,166,0.2)",
          boxShadow: "0 0 20px rgba(20,184,166,0.05)"
        }}
        transition={isRecording ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : {}}
        className="relative w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500"
      >
        <FaMicrophone className={`text-xl transition-colors duration-300 ${isRecording ? 'text-rose-400' : isPaused ? 'text-amber-400' : 'text-teal-400'
          }`} />
        {isRecording && (
          <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping opacity-75" />
        )}
      </motion.div>

      {/* Dynamic Action Switcher / Status Screen */}
      <div className="mt-5 w-full max-w-md">
        {isRecording || isPaused ? (
          <div className="flex flex-col items-center">
            <span className="text-white text-2xl font-black font-mono tracking-tight leading-none">
              {formatTime(recordingTime)}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${isPaused ? 'text-amber-400' : 'text-rose-400'}`}>
              {isPaused ? 'Recording Paused' : 'Recording Dialogue...'}
            </span>
          </div>
        ) : !patient ? (
          <div className="w-full flex flex-col gap-3.5">
            {/* Mode Controls */}
            <div className="bg-[#0c1322] p-1 rounded-xl flex relative border border-[#1e2d4a] max-w-[280px] mx-auto w-full">
              {["search", "create"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPatientIntakeMode(mode)}
                  className={`relative z-10 flex-1 py-1 text-[10px] font-bold transition-colors duration-200 rounded-md border-none cursor-pointer bg-transparent ${patientIntakeMode === mode ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {patientIntakeMode === mode && (
                    <motion.div
                      layoutId="intakeModeIndicator"
                      className="absolute inset-0 bg-[#1e2d4a] border border-white/[0.04] rounded-md shadow-md z-[-1]"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
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
                    <h3 className="text-white text-xs font-black uppercase tracking-wider">Search Patient Chart</h3>
                    <p className="text-slate-500 text-[9px] mt-0.5">Enter a patient ID or select from recent charts.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      placeholder="Patient ID (e.g. P1001)..."
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium transition-all"
                    />
                    <button
                      onClick={handleSearchPatient}
                      className="btn-3d-secondary px-3 h-8 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all shrink-0 active:translate-y-[2px]"
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
                          className="p-2 rounded-lg border border-[#1e2d4a] bg-[#0c1322]/40 text-left hover:border-teal-500/40 hover:bg-[#0c1322]/80 transition-all cursor-pointer truncate active:scale-95"
                        >
                          <span className="block text-[7px] text-slate-500 font-bold uppercase tracking-wider leading-none">{p.patient_id}</span>
                          <span className="block text-white text-[11px] font-bold truncate mt-0.5 leading-none">{p.name}</span>
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
                    <h3 className="text-white text-xs font-black uppercase tracking-wider">Register Patient</h3>
                    <p className="text-slate-500 text-[9px] mt-0.5 font-medium">Capture details. Timestamp automatically initialized.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Full Name"
                      value={quickPatient.name}
                      onChange={(e) => setQuickPatient({ ...quickPatient, name: e.target.value })}
                      className="h-8 px-2.5 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium transition-all"
                    />
                    <input
                      placeholder="Age"
                      type="number"
                      value={quickPatient.age}
                      onChange={(e) => setQuickPatient({ ...quickPatient, age: e.target.value })}
                      className="h-8 px-2.5 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={quickPatient.gender}
                      onChange={(e) => setQuickPatient({ ...quickPatient, gender: e.target.value })}
                      className="h-8 px-2 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-slate-300 text-xs outline-none focus:border-teal-500/40 font-medium transition-all"
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
                      className="h-8 px-2.5 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium transition-all"
                    />
                  </div>

                  <input
                    placeholder="Home Address"
                    value={quickPatient.address}
                    onChange={(e) => setQuickPatient({ ...quickPatient, address: e.target.value })}
                    className="h-8 px-2.5 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 placeholder-slate-700 font-medium transition-all"
                  />

                  <button
                    onClick={handleQuickRegister}
                    className="btn-3d-primary h-9 mt-1 text-xs font-bold text-white cursor-pointer transition-all flex items-center justify-center"
                  >
                    <span>Register & Lock Patient Chart</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="text-white text-base font-black m-0">Start Ambient Clinical Dictation</h3>
            <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
              Chart is locked for <span className="text-teal-400 font-bold">{patient.name}</span>. Click below to begin recording.
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
              className="btn-3d-primary h-10 px-6 text-xs font-bold text-white cursor-pointer shadow-lg"
            >
              Start Recording
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="btn-3d-secondary h-9 px-4 text-xs font-bold text-slate-300 hover:text-white cursor-pointer flex items-center gap-2"
                >
                  <FaPlay className="text-[9px]" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="btn-3d-secondary h-9 px-4 text-xs font-bold text-slate-300 hover:text-white cursor-pointer flex items-center gap-2"
                >
                  <FaPause className="text-[9px]" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={stopRecording}
                className="btn-3d-danger h-9 px-4 text-xs font-bold text-white cursor-pointer flex items-center gap-2"
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
        <div className="relative flex items-center justify-center gap-[2px] mt-6 w-full max-w-md h-16 bg-[#0c1322]/70 border border-[#1e2d4a] rounded-xl px-4 overflow-hidden shadow-inner">
          {/* Dashed Red Center Baseline */}
          <div className="absolute left-0 right-0 h-px border-t border-dashed border-rose-500/50 z-0 pointer-events-none" />
          
          {/* Waveform timeline */}
          <div className="flex items-center justify-center gap-[2px] w-full h-full z-10 relative">
            {waveHistory.map((val, idx) => {
              const barHeight = Math.max(2, val * 52);
              return (
                <div
                  key={idx}
                  className="w-[3px] bg-teal-400 rounded-full transition-all duration-75 shrink-0"
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Post Processing Handoff Engine */}
      {audioBlob && !isRecording && !isPaused && (
        <div className="mt-6 pt-5 border-t border-[#1e2d4a] w-full flex flex-col items-center gap-3">
          <button
            onClick={transcribeAudio}
            disabled={transcribing}
            className="btn-3d-primary h-10 px-6 text-xs font-bold text-white cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-400 mt-1">
              {language && (
                <span className="flex items-center gap-1.5">
                  <FaGlobe className="text-slate-600 text-[10px]" />
                  Detected Language: <span className="text-white font-mono uppercase">{language}</span>
                </span>
              )}
              {language && (
                <span className="flex items-center gap-1.5">
                  <FaUsers className="text-slate-600 text-[10px]" />
                  Speakers: <span className="text-white font-mono">{speakerData.length || 2} Detected</span>
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