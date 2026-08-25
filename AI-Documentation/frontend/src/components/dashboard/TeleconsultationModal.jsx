import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaPhoneAlt,
  FaDesktop,
  FaBrain,
  FaNotesMedical,
  FaTimes,
  FaUserMd,
  FaUser,
  FaLock,
  FaHeartbeat,
  FaCheck,
  FaExpand,
  FaCompress,
  FaComments,
  FaExchangeAlt,
  FaCamera,
  FaCircle,
  FaRedo
} from "react-icons/fa";
import { getDoctors } from "../../api";

function TeleconsultationModal({ isOpen, onClose, patient, role: initialRole = "patient", onGenerateSoap }) {
  const [currentRole, setCurrentRole] = useState(initialRole); // "doctor" or "patient"
  const [callStatus, setCallStatus] = useState("ringing"); // "ringing", "connected", "unanswered"
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState("vitals"); // "vitals", "transcript", "notes"
  const [assignedDoc, setAssignedDoc] = useState(null);

  useEffect(() => {
    if (isOpen && patient?.assigned_doctor_id) {
      getDoctors()
        .then(res => {
          if (res.data.success) {
            const matched = (res.data.doctors || []).find(d => String(d.id) === String(patient.assigned_doctor_id));
            if (matched) setAssignedDoc(matched);
          }
        })
        .catch(err => console.log("Failed to load doctors in call modal:", err));
    }
  }, [isOpen, patient?.assigned_doctor_id]);
  const [notes, setNotes] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(true);

  const [liveTranscript, setLiveTranscript] = useState([
    { speaker: "Dr. Sarah Jenkins", text: "Hello David, I can see and hear you clearly. How has your condition been over the last two days?", time: "00:05" },
    { speaker: "David Miller (Patient)", text: "Hi Doctor! The chest tightness subsided, but I have mild abdominal discomfort after meals.", time: "00:14" },
    { speaker: "Dr. Sarah Jenkins", text: "Got it. Your SpO2 looks steady at 98% and blood pressure is 120/80. Let me review your latest CBC lab report.", time: "00:26" },
    { speaker: "David Miller (Patient)", text: "Thank you Doctor. Should I continue the prescribed dosage for this week?", time: "00:35" }
  ]);

  const localVideoRef = useRef(null);
  const mainLocalVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Reset call status whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setCallStatus("ringing");
      setCallDuration(0);
    }
  }, [isOpen]);

  // Handle call duration and speaking animation when connected
  useEffect(() => {
    if (!isOpen || callStatus !== "connected") return;

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    const speechTimer = setInterval(() => {
      setIsDoctorSpeaking(prev => !prev);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(speechTimer);
    };
  }, [isOpen, callStatus]);

  // Request real camera stream via WebRTC getUserMedia
  const startCamera = async () => {
    setCameraError("");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true
        });
        streamRef.current = stream;
        setHasCameraPermission(true);
        setIsVideoOff(false);

        // Attach stream to video elements
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(e => console.log("PiP play error:", e));
        }
        if (mainLocalVideoRef.current) {
          mainLocalVideoRef.current.srcObject = stream;
          mainLocalVideoRef.current.play().catch(e => console.log("Main local play error:", e));
        }
      } else {
        setCameraError("WebRTC camera API is not supported in this browser.");
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
      setCameraError(err.name === "NotAllowedError" ? "Camera permission was denied. Please allow camera in your browser." : "No physical webcam detected. Showing clinical presence feed.");
      setHasCameraPermission(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Re-attach video stream if elements change
  useEffect(() => {
    if (streamRef.current && hasCameraPermission) {
      if (localVideoRef.current && localVideoRef.current.srcObject !== streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
        localVideoRef.current.play().catch(e => console.log("Local PiP playback error:", e));
      }
      if (mainLocalVideoRef.current && mainLocalVideoRef.current.srcObject !== streamRef.current) {
        mainLocalVideoRef.current.srcObject = streamRef.current;
        mainLocalVideoRef.current.play().catch(e => console.log("Main local playback error:", e));
      }
    }
  }, [callStatus, hasCameraPermission, isOpen]);

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleMic = () => {
    setIsMicMuted(!isMicMuted);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = isMicMuted);
    }
  };

  const handleToggleVideo = () => {
    if (isVideoOff && !hasCameraPermission) {
      startCamera();
    } else {
      setIsVideoOff(!isVideoOff);
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(t => t.enabled = isVideoOff);
      }
    }
  };

  const handleAcceptCall = () => {
    setCallStatus("connected");
  };

  const handleSimulateNotAnswered = () => {
    setCallStatus("unanswered");
  };

  const handleRedial = () => {
    setCallStatus("ringing");
    setCallDuration(0);
  };

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const handleExportToSoap = () => {
    const conversation = liveTranscript.map(t => `${t.speaker}: ${t.text}`).join("\n\n");
    if (onGenerateSoap) {
      onGenerateSoap(patient, conversation);
    }
    handleEndCall();
  };

  if (!isOpen) return null;

  // Identity labels dynamically loaded from session
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorName = loggedInUser.role === "doctor" ? (loggedInUser.name || "Dr. Sarah Jenkins") : (assignedDoc?.name || "Dr. Sarah Jenkins");
  const doctorSpecialty = assignedDoc?.specialty || "General Specialist";
  const patientName = loggedInUser.role === "patient" ? (loggedInUser.name || "David Miller") : (patient?.name || "David Miller");

  const isViewingAsPatient = currentRole === "patient";
  const remoteParticipantName = isViewingAsPatient ? `${doctorName} (${doctorSpecialty})` : `${patientName} (Patient)`;
  const remoteParticipantRole = isViewingAsPatient ? `Attending Specialist • ${doctorSpecialty} Department` : `Patient ID: ${patient?.patient_id || "P1005"} • Active Consultation`;
  const localParticipantName = isViewingAsPatient ? `${patientName} (You)` : `${doctorName} (You)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 font-sans text-slate-800 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full ${isFullscreen ? 'h-full max-w-none' : 'max-w-6xl h-[92vh] max-h-[850px]'} bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 relative`}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-950 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${callStatus === "connected" ? "bg-emerald-400 animate-ping" : "bg-amber-400 animate-pulse"}`} />
            <div className="text-left">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <span>1:1 Teleconsultation Live Room</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <FaLock className="text-[8px]" /> WebRTC 1080p Encrypted
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {callStatus === "connected" ? (
                  <>Connected with: <strong className="text-amber-300">{remoteParticipantName}</strong></>
                ) : callStatus === "ringing" ? (
                  <>Calling: <strong className="text-amber-300">{remoteParticipantName}</strong> (Ringing...)</>
                ) : (
                  <strong className="text-red-400">Call Not Answered by {remoteParticipantName}</strong>
                )}
              </span>
            </div>
          </div>

          {/* Perspective Switcher & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentRole(currentRole === "patient" ? "doctor" : "patient")}
              className="btn-pill bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-full border border-slate-600 flex items-center gap-1.5 shadow-sm"
              title="Toggle Perspective"
            >
              <FaExchangeAlt className="text-amber-400 text-[10px]" />
              <span>Perspective: <strong>{currentRole === "patient" ? "Patient View" : "Doctor View"}</strong></span>
            </button>

            {callStatus === "connected" && (
              <div className="bg-slate-800/90 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold text-white border border-slate-700">
                ⏱️ {formatCallTime(callDuration)}
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border-none"
            >
              {isFullscreen ? <FaCompress className="text-xs" /> : <FaExpand className="text-xs" />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-colors cursor-pointer border border-red-500/30"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>

        {/* Main Stage Grid (Video Feed + Clinical Companion Panel) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Main Video Screen Area */}
          <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
            
            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 1. STATE: OUTGOING CALL RINGING (Caller sees own full-size face) */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {callStatus === "ringing" && (
              <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                {/* Caller's own Full Screen Camera Feed */}
                <video
                  ref={mainLocalVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover mirror ${isVideoOff || !hasCameraPermission ? 'hidden' : 'block'}`}
                />

                {/* Fallback if Camera Permission Pending / Denied - Show Dynamic Active Simulated Feed */}
                {(isVideoOff || !hasCameraPermission) && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-center text-white relative">
                    {/* Ringing Pulse Radar */}
                    <div className="relative mb-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#1a7f8e] via-[#00909e] to-[#2b6cb0] flex items-center justify-center text-5xl text-white shadow-2xl relative border-4 border-[#00c988]/30">
                        {isViewingAsPatient ? <FaUser /> : <FaUserMd />}
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-[#00c988] animate-ping opacity-30 pointer-events-none" />
                    </div>

                    <h3 className="text-lg font-black text-white m-0">{localParticipantName}</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-[#00c988] font-bold px-3 py-1 rounded-full border border-[#00c988]/30 mt-2 block w-fit">
                      🟢 Live Simulated Local Preview active
                    </span>
                    <p className="text-xs text-slate-400 mt-2.5 max-w-sm leading-relaxed">
                      Your local video stream is active and ready. Click "Accept" to start peer-to-peer transmission.
                    </p>
                    
                    <button
                      onClick={startCamera}
                      className="btn-pill btn-primary text-xs py-2 px-4 mt-4 flex items-center gap-1.5"
                    >
                      <FaCamera />
                      <span>Use Real Hardware Webcam</span>
                    </button>
                  </div>
                )}

                {/* Floating Ringing Call Action Banner on top of Caller's Face */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-xl px-6 py-4 rounded-2xl border border-slate-700 shadow-2xl text-center flex flex-col items-center gap-3 z-30 max-w-md w-[90%]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg animate-bounce border border-emerald-500/30">
                      <FaPhoneAlt />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-extrabold text-white m-0">Calling {remoteParticipantName}...</h4>
                      <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Ringing... (Your face is visible on screen)
                      </span>
                    </div>
                  </div>

                  {/* Simulator Trigger Buttons for Quick Verification */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800 w-full justify-center">
                    <button
                      onClick={handleAcceptCall}
                      className="btn-pill btn-success text-xs py-2 px-5 rounded-full shadow-md flex items-center gap-2"
                    >
                      <FaPhoneAlt className="text-[10px]" />
                      <span>Accept / Pick Up Call</span>
                    </button>
                    <button
                      onClick={handleSimulateNotAnswered}
                      className="btn-pill bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-4 rounded-full border border-slate-600"
                    >
                      <span>Simulate No Answer</span>
                    </button>
                  </div>
                </div>

                {/* Tag for Caller's Face */}
                <div className="absolute bottom-6 left-6 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white text-xs font-bold flex items-center gap-2">
                  <FaCircle className="text-[7px] text-emerald-400" />
                  <span>Self View (Calling {remoteParticipantName})</span>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 2. STATE: CALL NOT ANSWERED / MISSED                              */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {callStatus === "unanswered" && (
              <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
                {/* Caller's face in background */}
                <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-red-400/50 flex items-center justify-center text-4xl text-red-400 shadow-2xl mb-4">
                  <FaPhoneSlash />
                </div>
                
                <h3 className="text-xl font-extrabold text-white m-0">Call Not Answered</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed font-medium">
                  {remoteParticipantName} is currently unavailable or in another clinical consultation. You can retry calling or leave an async message.
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={handleRedial}
                    className="btn-pill btn-primary text-xs py-2.5 px-6 rounded-full shadow-lg flex items-center gap-2"
                  >
                    <FaRedo />
                    <span>Redial Call</span>
                  </button>
                  <button
                    onClick={handleAcceptCall}
                    className="btn-pill btn-success text-xs py-2.5 px-5 rounded-full shadow-lg flex items-center gap-2"
                  >
                    <FaPhoneAlt />
                    <span>Force Connect Call</span>
                  </button>
                  <button
                    onClick={handleEndCall}
                    className="btn-pill btn-secondary text-xs py-2.5 px-5 rounded-full"
                  >
                    <span>Close Window</span>
                  </button>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 3. STATE: CONNECTED (Remote participant video on main stage)       */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {callStatus === "connected" && (
              <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
                {isViewingAsPatient ? (
                  /* Patient looks at Doctor (Dr. Sarah Jenkins) */
                  <div className="w-full h-full flex flex-col items-center justify-center relative p-6">
                    <div className="relative flex flex-col items-center">
                      <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-[#1a7f8e] via-[#00909e] to-[#2b6cb0] text-white flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 border-emerald-400/40 relative">
                        <FaUserMd />
                        {isDoctorSpeaking && (
                          <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-60 pointer-events-none" />
                        )}
                      </div>

                      <div className="mt-4 text-center">
                        <h3 className="text-white text-lg sm:text-xl font-extrabold m-0 tracking-tight flex items-center justify-center gap-2">
                          <span>{doctorName}</span>
                          <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                            Consulting Live
                          </span>
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 font-medium">Senior Cardiologist • AIIMS Clinical Care Wing</p>
                        
                        {/* Audio Waveforms */}
                        <div className="flex items-center justify-center gap-1 mt-3">
                          {[16, 28, 12, 36, 44, 20, 32, 14, 26, 40, 18].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-150 ${
                                isDoctorSpeaking ? "bg-emerald-400 animate-pulse" : "bg-slate-700"
                              }`}
                              style={{ height: `${isDoctorSpeaking ? h : 6}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Subtitle Dialogue Overlay */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-5 py-2 rounded-xl border border-slate-700 text-slate-200 text-xs max-w-md text-center shadow-2xl font-medium">
                      <span className="text-emerald-400 font-bold mr-1.5">Dr. Sarah:</span>
                      <span>"I am reviewing your latest readings. Please describe when the discomfort began."</span>
                    </div>
                  </div>
                ) : (
                  /* Doctor looks at Patient (David Miller) */
                  <div className="w-full h-full flex flex-col items-center justify-center relative p-6">
                    <div className="relative flex flex-col items-center">
                      <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-indigo-600 text-white flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 border-amber-400/40 relative">
                        <FaUser />
                        {!isDoctorSpeaking && (
                          <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping opacity-60 pointer-events-none" />
                        )}
                      </div>

                      <div className="mt-4 text-center">
                        <h3 className="text-white text-lg sm:text-xl font-extrabold m-0 tracking-tight flex items-center justify-center gap-2">
                          <span>{patient?.name || "David Miller"}</span>
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                            Patient Live
                          </span>
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 font-medium">Age: {patient?.age || "42"} • ID: {patient?.patient_id || "P1005"} • Patient Portal Feed</p>
                        
                        {/* Audio Waveforms */}
                        <div className="flex items-center justify-center gap-1 mt-3">
                          {[18, 30, 14, 22, 38, 26, 42, 16, 28, 34, 20].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-150 ${
                                !isDoctorSpeaking ? "bg-amber-400 animate-pulse" : "bg-slate-700"
                              }`}
                              style={{ height: `${!isDoctorSpeaking ? h : 6}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Subtitle Dialogue Overlay */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-5 py-2 rounded-xl border border-slate-700 text-slate-200 text-xs max-w-md text-center shadow-2xl font-medium">
                      <span className="text-amber-400 font-bold mr-1.5">David Miller:</span>
                      <span>"The symptoms started two days ago after dinner with mild nausea."</span>
                    </div>
                  </div>
                )}

                {/* Remote Participant Name Tag */}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{remoteParticipantName}</span>
                </div>

                {/* Floating PiP Window (Self Camera Feed) */}
                <motion.div
                  drag
                  dragConstraints={{ left: 10, right: 300, top: 10, bottom: 300 }}
                  className="absolute top-4 right-4 w-44 h-32 sm:w-56 sm:h-40 bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-500/60 cursor-grab active:cursor-grabbing z-20"
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover mirror ${isVideoOff || !hasCameraPermission ? 'hidden' : 'block'}`}
                  />
                  {(isVideoOff || !hasCameraPermission) && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-2 text-center text-slate-300 text-xs relative">
                      {/* Pulse Radar for PiP */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm border border-emerald-500/30">
                          {isViewingAsPatient ? <FaUser /> : <FaUserMd />}
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-35 pointer-events-none" />
                      </div>
                      
                      <span className="text-[9px] text-emerald-400 font-bold mt-1">
                        Simulated Webcam Live
                      </span>
                      
                      <button
                        onClick={startCamera}
                        className="mt-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[8px] text-slate-300 border border-slate-700 transition-colors"
                      >
                        Use Real Cam
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-1">
                    <FaCircle className="text-[6px] text-emerald-400" />
                    <span>{localParticipantName}</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ── In-Call Bottom Controls Bar ────────────────────── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/95 backdrop-blur-lg px-6 py-2.5 rounded-full border border-slate-700 shadow-2xl z-30">
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMic}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer border-none shadow-md ${
                  isMicMuted ? "bg-red-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
                title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMicMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={handleToggleVideo}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer border-none shadow-md ${
                  isVideoOff ? "bg-red-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
                title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              </button>

              {/* Screen Share */}
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer border-none shadow-md ${
                  isScreenSharing ? "bg-[#1a7f8e] text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
                title="Share Screen"
              >
                <FaDesktop />
              </button>

              {/* AI Ambient Transcription Listening Pill */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-slate-700 text-white text-xs font-bold">
                <FaBrain className="text-emerald-400 text-xs animate-pulse" />
                <span className="text-[10px] text-slate-300">Live AI Transcription Sync</span>
              </div>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer border-none shadow-lg active:scale-95 ml-2"
              >
                <FaPhoneSlash className="text-xs" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Right Clinical Companion Panel (Tabs: Vitals, Live Transcript, Notes) */}
          <div className="w-full lg:w-80 xl:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 text-left">
            {/* Panel Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1">
              <button
                onClick={() => setActiveTab("vitals")}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg border-none cursor-pointer transition-all ${
                  activeTab === "vitals" ? "bg-white text-[#1a3b6e] shadow-sm" : "text-slate-500 hover:text-slate-900 bg-transparent"
                }`}
              >
                <FaHeartbeat className="inline mr-1 text-[#1a7f8e]" /> Vitals
              </button>
              <button
                onClick={() => setActiveTab("transcript")}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg border-none cursor-pointer transition-all ${
                  activeTab === "transcript" ? "bg-white text-[#1a3b6e] shadow-sm" : "text-slate-500 hover:text-slate-900 bg-transparent"
                }`}
              >
                <FaComments className="inline mr-1 text-[#1a7f8e]" /> Transcript
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg border-none cursor-pointer transition-all ${
                  activeTab === "notes" ? "bg-white text-[#1a3b6e] shadow-sm" : "text-slate-500 hover:text-slate-900 bg-transparent"
                }`}
              >
                <FaNotesMedical className="inline mr-1 text-[#1a7f8e]" /> Notes
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeTab === "vitals" && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Patient Information</span>
                    <h4 className="text-sm font-extrabold text-[#1a3b6e] mt-0.5">{patient?.name || "David Miller"}</h4>
                    <p className="text-xs text-slate-500 font-medium">{patient?.age || "42"} Y/O • {patient?.gender || "Male"} • ID: {patient?.patient_id || "P1005"}</p>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Blood Pressure</span>
                      <span className="text-xs font-black text-[#1a3b6e]">120/80 mmHg</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Heart Rate</span>
                      <span className="text-xs font-black text-[#1a3b6e]">72 bpm</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">SpO2 Level</span>
                      <span className="text-xs font-black text-emerald-600">98% Normal</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Temperature</span>
                      <span className="text-xs font-black text-[#1a3b6e]">98.6 °F</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <strong className="text-amber-800 font-bold block text-[10px] uppercase">Allergies &amp; Alerts</strong>
                    <span className="text-amber-900 font-medium">Penicillin Allergy documented. No active drug interactions.</span>
                  </div>
                </div>
              )}

              {activeTab === "transcript" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Live Ambient Dialogue</span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Syncing 1080p
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {liveTranscript.map((t, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl text-xs ${
                        t.speaker.includes("Doctor") || t.speaker.includes("Sarah") ? "bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 text-[#1a3b6e]" : "bg-slate-100 text-slate-800"
                      }`}>
                        <div className="flex items-center justify-between font-extrabold text-[10px] mb-1 opacity-80">
                          <span>{t.speaker}</span>
                          <span>{t.time}</span>
                        </div>
                        <p className="m-0 leading-relaxed font-medium">{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Clinical Notes</span>
                  <textarea
                    rows="6"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Type key clinical observations, prescribed medications, or follow-up milestones during call..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 font-medium resize-none"
                  />
                  
                  <button
                    onClick={handleExportToSoap}
                    className="btn-pill btn-amber w-full py-2.5 text-xs rounded-full shadow-sm flex items-center justify-center gap-2"
                  >
                    <FaNotesMedical />
                    <span>End &amp; Generate SOAP Note</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default TeleconsultationModal;
