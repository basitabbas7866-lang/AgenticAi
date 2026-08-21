import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api";
import {
  FaArrowRight,
  FaUserMd,
  FaRegFileAlt,
  FaShieldAlt,
  FaHospital,
  FaBars,
  FaSignOutAlt,
  FaUser
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import RecentPatients from "../components/dashboard/RecentPatients";
import ConsultationTable from "../components/dashboard/ConsultationTable";
import Sidebar from "../components/dashboard/Sidebar";
import WorkstationController from "../components/dashboard/WorkstationController";
import OverviewStats from "../components/dashboard/OverviewStats";
import TranscriptReview from "../components/dashboard/TranscriptReview";
import ProfileWidget from "../components/dashboard/ProfileWidget";
import MobileHeader from "../components/dashboard/MobileHeader";
import BackgroundOrbs from "../components/dashboard/BackgroundOrbs";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { initialPatientsList, initialConsultationsList } from "../components/dashboard/mockData";
import PatientJourney from "../components/dashboard/PatientJourney";
import AttentionRequired from "../components/dashboard/AttentionRequired";
import CoordinationReviewQueue from "../components/dashboard/CoordinationReviewQueue";

function DashboardPage() {
  const navigate = useNavigate();
  
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = loggedInUser.role || "doctor";

  const [activeTab, setActiveTab] = useState(role === "patient" ? "journey" : "dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core clinical states
  const [conversation, setConversation] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [language, setLanguage] = useState("");
  const [speakerData, setSpeakerData] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", age: "", gender: "", phone: "" });
  const [quickPatient, setQuickPatient] = useState({ name: "", age: "", gender: "", phone: "", address: "" });
  const [patientIntakeMode, setPatientIntakeMode] = useState("search");

  // Audio Recording Engine Hook
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioLevels,
    startRecording: triggerStartRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    formatTime
  } = useAudioRecorder();

  const startRecording = () => triggerStartRecording(patient);

  // Pre-seeded clinical datasets
  const [recentPatients, setRecentPatients] = useState(initialPatientsList);
  const [consultations, setConsultations] = useState(initialConsultationsList);

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    setTranscribing(true);
    try {
      const res = await api.transcribeAudio(audioBlob);
      setLanguage(res.data.language || "");
      setSpeakerData(res.data.speakers || []);

      let formattedConversation = "";
      if (res.data.speakers?.length > 0) {
        res.data.speakers.forEach(s => {
          const speakerLabel = (s.speaker_id === 1 || String(s.speaker_id) === "1") ? "Doctor" : "Patient";
          formattedConversation += `${speakerLabel}: ${s.transcript}\n\n`;
        });
      } else {
        formattedConversation = res.data.transcript || "";
      }
      setConversation(formattedConversation);
    } catch (error) {
      console.error(error);
    } finally {
      setTranscribing(false);
    }
  };

  const handleSearchPatient = async () => {
    try {
      const res = await api.getPatient(patientId);
      if (res.data.exists) {
        setPatient(res.data.patient);
        setRecentPatients(prev => !prev.some(x => x.patient_id === res.data.patient.patient_id) ? [res.data.patient, ...prev] : prev);
      }
    } catch (err) { console.log(err); }
  };

  const handleCreatePatient = async () => {
    try {
      const payload = {
        ...newPatient,
        age: parseInt(newPatient.age) || 0
      };
      const res = await api.createPatient(payload);
      const p = { ...payload, patient_id: res.data.patient_id };
      setPatient(p);
      setRecentPatients(prev => [p, ...prev]);
      setShowCreateForm(false);
      setNewPatient({ name: "", age: "", gender: "", phone: "" });
    } catch (err) { console.log(err); }
  };

  const handleQuickRegister = async () => {
    if (!quickPatient.name || !quickPatient.age || !quickPatient.gender || !quickPatient.phone) return;
    const currentDateTime = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    try {
      const res = await api.createPatient({
        name: quickPatient.name, age: parseInt(quickPatient.age), gender: quickPatient.gender, phone: quickPatient.phone, address: quickPatient.address
      });
      const p = { ...quickPatient, patient_id: res.data.patient_id, registered_at: currentDateTime };
      setPatient(p);
      setRecentPatients(prev => [p, ...prev]);
      setQuickPatient({ name: "", age: "", gender: "", phone: "", address: "" });
    } catch (error) {
      const nextId = `P${1000 + recentPatients.length + 1}`;
      const p = { ...quickPatient, patient_id: nextId, registered_at: currentDateTime };
      setPatient(p);
      setRecentPatients(prev => [p, ...prev]);
      setQuickPatient({ name: "", age: "", gender: "", phone: "", address: "" });
    }
  };

  const handleSelectConsultation = (consult) => {
    navigate("/soap-generation", {
      state: {
        patient: recentPatients.find(p => p.patient_id === consult.patientId) || { patient_id: consult.patientId, name: consult.patientName, age: "N/A", gender: "N/A", phone: "N/A" },
        conversation: "Historical transcript details locked under EHR compliance guidelines.",
        language: "en-US"
      }
    });
  };

  useEffect(() => {
    if (!patient && recentPatients?.length > 0) {
      setPatient(recentPatients[0]);
      setPatientId(recentPatients[0].patient_id);
    }
  }, [recentPatients, patient]);



  return (
    <div className="dashboard-page flex flex-col w-screen h-screen bg-[#f5f7fa] text-stone-800 font-sans select-none text-left relative overflow-hidden">
      
      {/* Top Navigation Bar with Dynamic User Profile & Actions */}
      <div className="w-full bg-[#1a3b6e] text-white py-2 px-4 sm:px-6 flex items-center justify-between border-b border-[#00909e]/30 z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
              >
                <FaBars className="text-sm" />
              </button>
              <img src="/logo.jpg" alt="CareWeave Logo" className="h-8 w-auto object-contain bg-white px-2 py-0.5 rounded shadow-sm" />
              <span className="text-xs font-bold text-amber-300 hidden sm:inline">
                | {role === "patient" ? "Patient Care Portal" : "Clinical Workstation"}
              </span>
          </div>

          <div className="flex items-center gap-3">
              {/* User Identity Pill */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-[#1a3b6e] flex items-center justify-center font-extrabold text-[10px]">
                    {loggedInUser.name ? loggedInUser.name[0] : (role === "patient" ? "D" : "S")}
                  </div>
                  <span className="text-xs font-bold text-white">
                    {loggedInUser.name || (role === "patient" ? "David Miller" : "Dr. Sarah Jenkins")}
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold bg-[#1a7f8e] text-white">
                    {role}
                  </span>
              </div>

              {/* Sign Out Button */}
              <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    navigate("/auth");
                  }}
                  className="text-xs font-bold bg-white/10 hover:bg-red-500/30 text-white hover:text-red-200 px-3.5 py-1.5 rounded-full transition-all border border-white/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                  <FaSignOutAlt className="text-xs opacity-80" />
                  <span>Sign Out</span>
              </button>
          </div>
      </div>

      <div className="flex flex-1 h-full overflow-hidden relative">
        {/* Background Mesh Orbs */}
        <BackgroundOrbs />

        {/* Sidebar - Navigation Overlays */}
        <div className="hidden md:flex w-64 h-full shrink-0 border-r border-slate-200 z-20 bg-white">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-45 md:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden shadow-2xl">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Right Core Workspace Station viewport container */}
      <div className="flex-1 h-full overflow-hidden flex flex-col relative z-10 bg-[#f5f7fa]">

        {/* Professional Mesh Grid Background Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Dynamic Background Banner based on active tab */}
        <div className="absolute top-0 left-0 w-full h-80 z-0 opacity-[0.35] transition-colors duration-700 pointer-events-none"
             style={{
               background: 
                 activeTab === "dashboard" ? "linear-gradient(to bottom, #1a3b6e2a, transparent)" :
                 activeTab === "patients"  ? "linear-gradient(to bottom, #1a7f8e2a, transparent)" :
                 activeTab === "reports"   ? "linear-gradient(to bottom, #e8a0202a, transparent)" :
                 activeTab === "journey"   ? "linear-gradient(to bottom, #2b6cb02a, transparent)" :
                 activeTab === "reviews"   ? "linear-gradient(to bottom, #0596692a, transparent)" :
                 "transparent"
             }}
        />

        {/* Mobile Header Bar Component */}
        <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Dynamic Display Modules Router */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 relative z-10">
          {activeTab === "dashboard" && (
            <div className="w-full space-y-8">

              {/* Stat Cards Grid overview track */}
              <OverviewStats
                patient={patient}
                isRecording={isRecording}
                isPaused={isPaused}
                audioBlob={audioBlob}
              />

              <AttentionRequired
                onSelectPatient={(p) => {
                  setPatient(p);
                  setPatientId(p.patient_id);
                }}
                onNavigateToTab={(tab) => {
                  setActiveTab(tab);
                }}
              />

              {/* INTEGRATED STANDALONE MODULAR RECORDING/INTAKE WORKSTATION COMPONENT */}
              <WorkstationController
                patient={patient}
                isRecording={isRecording}
                isPaused={isPaused}
                recordingTime={recordingTime}
                audioBlob={audioBlob}
                audioLevels={audioLevels}
                transcribing={transcribing}
                language={language}
                speakerData={speakerData}
                patientIntakeMode={patientIntakeMode}
                setPatientIntakeMode={setPatientIntakeMode}
                patientId={patientId}
                setPatientId={setPatientId}
                recentPatients={recentPatients}
                setPatient={setPatient}
                quickPatient={quickPatient}
                setQuickPatient={setQuickPatient}
                handleSearchPatient={handleSearchPatient}
                handleQuickRegister={handleQuickRegister}
                startRecording={startRecording}
                pauseRecording={pauseRecording}
                resumeRecording={resumeRecording}
                stopRecording={stopRecording}
                transcribeAudio={transcribeAudio}
                formatTime={formatTime}
              />

              {/* Live Transcript Bubble Boards */}
              <TranscriptReview
                patient={patient}
                recentPatients={recentPatients}
                conversation={conversation}
                setConversation={setConversation}
                language={language}
                transcribing={transcribing}
                speakerData={speakerData}
              />

            </div>
          )}

          {activeTab === "patients" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <RecentPatients patient={patient} setPatient={setPatient} patientId={patientId} setPatientId={setPatientId} showCreateForm={showCreateForm} setShowCreateForm={setShowCreateForm} newPatient={newPatient} setNewPatient={setNewPatient} onSearchPatient={handleSearchPatient} onCreatePatient={handleCreatePatient} recentPatientsList={recentPatients} />
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <ConsultationTable consultations={consultations} onSelectConsultation={handleSelectConsultation} />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <ProfileWidget />
          )}

          {activeTab === "journey" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <PatientJourney patient={patient} />
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <CoordinationReviewQueue />
            </motion.div>
          )}

        </div>
      </div>
      </div>
    </div>
  );
}

export default DashboardPage;