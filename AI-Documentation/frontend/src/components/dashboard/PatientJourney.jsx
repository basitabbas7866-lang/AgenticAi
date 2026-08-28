import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaHospital, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaFileMedical, 
  FaShareSquare, 
  FaStethoscope, 
  FaChevronDown, 
  FaChevronUp, 
  FaPlus,
  FaClock,
  FaInfoCircle,
  FaFileInvoiceDollar,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaRobot,
  FaBrain
} from "react-icons/fa";
import { 
  getPatientJourney, 
  addJourneyEvent,
  getAppointments,
  createAppointment,
  updateAppointment,
  getReferrals,
  createReferral,
  updateReferral,
  getInvestigations,
  createInvestigation,
  updateInvestigation,
  analyzePatientCoordination,
  getPatientReviews,
  takeReviewAction
} from "../../api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 20 } }
};

function PatientJourney({ patient }) {
  const [activeSubTab, setActiveSubTab] = useState("timeline"); // "timeline", "appointments", "referrals", "investigations"
  
  // Data list states
  const [journeyEvents, setJourneyEvents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  
  // Loading states
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [loadingInvs, setLoadingInvs] = useState(false);
  
  // Expanding accordion states
  const [expandedEvents, setExpandedEvents] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form - Timeline Event
  const [eventType, setEventType] = useState("appointment");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventStatus, setEventStatus] = useState("Scheduled");
  const [eventDept, setEventDept] = useState("");

  // Form - Appointment Booking
  const [apptDept, setApptDept] = useState("Outpatient Clinic");
  const [apptType, setApptType] = useState("Consultation");
  const [apptDate, setApptDate] = useState("");
  const [apptNotes, setApptNotes] = useState("");
  const [reschedDate, setReschedDate] = useState({}); // Stores reschedule inputs per appointment ID
  const [showReschedInput, setShowReschedInput] = useState({});

  // Form - Referral Outgoing
  const [refReferring, setRefReferring] = useState("General Medicine");
  const [refReferred, setRefReferred] = useState("Cardiology Department");
  const [refReason, setRefReason] = useState("");
  const [refPriority, setRefPriority] = useState("Routine");
  const [refApptInfo, setRefApptInfo] = useState({}); // Stores appointment details per referral ID
  const [showRefApptInput, setShowRefApptInput] = useState({});

  // Form - Investigation Orders
  const [invTestName, setInvTestName] = useState("");
  const [invNotes, setInvNotes] = useState("");
  const [invSchedDate, setInvSchedDate] = useState({}); // Stores scheduled inputs per test ID
  const [showInvSchedInput, setShowInvSchedInput] = useState({});
  const [invResultFile, setInvResultFile] = useState({}); // Stores result file names per test ID
  const [showInvResultInput, setShowInvResultInput] = useState({});

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = loggedInUser.role || "doctor";

  const [coordinationAnalysis, setCoordinationAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [patientReviews, setPatientReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [inlineComments, setInlineComments] = useState({});
  const [actioningInline, setActioningInline] = useState(false);

  const fetchPatientReviews = async () => {
    if (!patient) return;
    setLoadingReviews(true);
    try {
      const res = await getPatientReviews(patient.patient_id);
      setPatientReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load patient reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleInlineAction = async (reviewId, decision) => {
    const comment = inlineComments[reviewId] || "";
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const reviewerName = loggedInUser.name || "Dr. Sarah Jenkins";
    setActioningInline(true);
    try {
      await takeReviewAction(reviewId, decision, reviewerName, comment);
      setInlineComments(prev => {
        const copy = { ...prev };
        delete copy[reviewId];
        return copy;
      });
      await fetchPatientReviews();
      fetchJourney();
      fetchAppointments();
      fetchReferrals();
      fetchInvestigations();
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setActioningInline(false);
    }
  };

  const handleAnalyzeCoordination = async () => {
    if (!patient) return;
    setLoadingAnalysis(true);
    try {
      const res = await analyzePatientCoordination(patient.patient_id);
      setCoordinationAnalysis(res.data);
      await fetchPatientReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Core Data Fetchers
  const fetchJourney = async () => {
    if (!patient) return;
    setLoadingTimeline(true);
    try {
      const res = await getPatientJourney(patient.patient_id);
      setJourneyEvents(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingTimeline(false); }
  };

  const fetchAppointments = async () => {
    if (!patient) return;
    setLoadingAppts(true);
    try {
      const res = await getAppointments(patient.patient_id);
      setAppointments(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingAppts(false); }
  };

  const fetchReferrals = async () => {
    if (!patient) return;
    setLoadingRefs(true);
    try {
      const res = await getReferrals(patient.patient_id);
      setReferrals(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingRefs(false); }
  };

  const fetchInvestigations = async () => {
    if (!patient) return;
    setLoadingInvs(true);
    try {
      const res = await getInvestigations(patient.patient_id);
      setInvestigations(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingInvs(false); }
  };

  const fetchAllData = () => {
    if (!patient) return;
    fetchJourney();
    fetchAppointments();
    fetchReferrals();
    fetchInvestigations();
    fetchPatientReviews();
  };

  useEffect(() => {
    setCoordinationAnalysis(null);
    fetchAllData();
  }, [patient]);

  // Submit Handlers
  const handleAddTimelineEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDesc || !patient) return;
    setSubmitting(true);
    try {
      await addJourneyEvent(patient.patient_id, {
        event_type: eventType,
        title: eventTitle,
        description: eventDesc,
        status: eventStatus,
        department_service: eventDept || "Outpatient Services"
      });
      setEventTitle("");
      setEventDesc("");
      setEventDept("");
      setShowAddForm(false);
      fetchJourney();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!apptDate || !patient) return;
    setSubmitting(true);
    try {
      await createAppointment(patient.patient_id, {
        department_service: apptDept,
        appointment_type: apptType,
        appointment_date: apptDate,
        notes: apptNotes
      });
      setApptDate("");
      setApptNotes("");
      fetchAppointments();
      fetchJourney(); // Update journey
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleIssueReferral = async (e) => {
    e.preventDefault();
    if (!refReason || !patient) return;
    setSubmitting(true);
    try {
      await createReferral(patient.patient_id, {
        referring_department: refReferring,
        referred_department_specialist: refReferred,
        referral_reason: refReason,
        priority: refPriority
      });
      setRefReason("");
      fetchReferrals();
      fetchJourney();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleOrderInvestigation = async (e) => {
    e.preventDefault();
    if (!invTestName || !patient) return;
    setSubmitting(true);
    try {
      await createInvestigation(patient.patient_id, {
        test_name: invTestName,
        notes: invNotes
      });
      setInvTestName("");
      setInvNotes("");
      fetchInvestigations();
      fetchJourney();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // State Change Operations
  const handleUpdateApptStatus = async (apptId, status, extraData = {}) => {
    try {
      await updateAppointment(apptId, { status, ...extraData });
      fetchAppointments();
      fetchJourney();
    } catch (err) { console.error(err); }
  };

  const handleUpdateReferralStatus = async (refId, status, extraData = {}) => {
    try {
      await updateReferral(refId, { status, ...extraData });
      fetchReferrals();
      fetchJourney();
    } catch (err) { console.error(err); }
  };

  const handleUpdateInvestigationStatus = async (invId, status, extraData = {}) => {
    try {
      await updateInvestigation(invId, { status, ...extraData });
      fetchInvestigations();
      fetchJourney();
    } catch (err) { console.error(err); }
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-xl p-6 text-center min-h-[300px] shadow-sm">
        <FaInfoCircle className="text-slate-600 text-3xl mb-4" />
        <h3 className="text-[#1a3b6e] text-base font-black">No Active Patient Selected</h3>
        <p className="text-slate-500 text-xs mt-2 max-w-sm">
          Please select a patient from the Create SOAP Note workspace or find them in the Patients Directory.
        </p>
      </div>
    );
  }

  // Styles Map
  const getEventStyles = (type) => {
    switch (type) {
      case "registration":
        return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", icon: FaClipboardList };
      case "consultation":
        return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", icon: FaStethoscope };
      case "documentation":
        return { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", icon: FaFileMedical };
      case "appointment":
        return { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-[#1a7f8e]", icon: FaCalendarAlt };
      case "referral":
        return { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", icon: FaShareSquare };
      case "investigation":
        return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: FaHospital };
      default:
        return { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-[#1a7f8e]", icon: FaHospital };
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase() || status) {
      case "completed":
      case "result_available":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "scheduled":
      case "active":
      case "in_progress":
      case "sent":
      case "accepted":
      case "appointment_scheduled":
        return "bg-sky-500/10 text-[#1a7f8e] border border-sky-500/20";
      case "overdue":
      case "missed":
      case "follow_up_required":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "cancelled":
      case "closed":
        return "bg-slate-100 text-slate-500 border border-slate-200";
      default:
        return "bg-slate-100 text-slate-500 border border-slate-200";
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-left"
    >
      {/* Dynamic Header Badge Capsule */}
      <motion.div
        variants={itemVariants}
        className="glass-panel border border-slate-200 rounded-[20px] p-6 bg-gradient-to-br from-indigo-950/10 to-slate-950/40 relative overflow-hidden shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#1a7f8e] font-bold uppercase tracking-wider">Patient Journey Coordinator</span>
            <h2 className="text-[#1a3b6e] text-lg font-black mt-1 leading-tight">{patient.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-500 text-[10px] font-semibold">
              <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/40">{patient.patient_id}</span>
              <span>•</span>
              <span>{patient.gender}</span>
              <span>•</span>
              <span>{patient.age} Years Old</span>
              <span>•</span>
              <span>{patient.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchAllData();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Refresh Workstation
            </button>
          </div>
        </div>

        {/* Care sub-navigation suite */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1.5 mt-6 overflow-x-auto whitespace-nowrap">
          {[
            { id: "timeline", label: "Care Timeline", icon: FaClipboardList },
            { id: "appointments", label: "Appointments", icon: FaCalendarAlt },
            { id: "referrals", label: "Referral Tracker", icon: FaShareSquare },
            { id: "investigations", label: "Lab & Investigations", icon: FaFileMedical },
            ...(role === "patient" ? [{ id: "analysis", label: "AI Health Summary", icon: FaRobot }] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition-all duration-300 border-none outline-none ${
                activeSubTab === tab.id
                  ? "bg-[#1a3b6e] text-white shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-[#1a3b6e] hover:bg-slate-200/50"
              }`}
            >
              <tab.icon className="text-[10px]" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* SUB-TAB CONTENTS PORTAL */}
      <AnimatePresence mode="wait">
        
        {/* 1. TIMELINE SUBTAB */}
        {activeSubTab === "timeline" && (
          <motion.div
            key="timeline-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick manual booking button bar */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-pill btn-primary py-2 px-4 text-xs shadow-sm flex items-center gap-2"
              >
                <FaPlus className="text-[10px]" />
                <span>Manual Timeline Log</span>
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-inner">
                <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-4">Record Custom Care Event</h3>
                <form onSubmit={handleAddTimelineEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="appointment">Appointment Coordination</option>
                      <option value="referral">Referral Tracking</option>
                      <option value="investigation">Investigation/Lab Test</option>
                      <option value="followup">Follow-Up Coordination</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cardiologist Follow-up Visit Scheduled"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Department / Clinic</label>
                    <input
                      type="text"
                      placeholder="e.g. Specialty Clinic, Lab Services"
                      value={eventDept}
                      onChange={(e) => setEventDept(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Status</label>
                    <select
                      value={eventStatus}
                      onChange={(e) => setEventStatus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Description / Action Notes</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Provide coordinates, clinical guidelines, or notes about this milestone..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn-pill btn-secondary px-4 py-2 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-pill btn-amber px-5 py-2 text-xs shadow-sm"
                    >
                      <span>Log Milestone</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-sm">
              <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-6">Patient Unified Journey</h3>

              {loadingTimeline ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FaClock className="text-2xl animate-spin mb-3 text-[#1a7f8e]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Syncing timeline records...</span>
                </div>
              ) : journeyEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No records found on the timeline.</div>
              ) : (
                <div className="relative border-l border-slate-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-6 py-2">
                  {journeyEvents.map((event) => {
                    const styles = getEventStyles(event.event_type);
                    const EventIcon = styles.icon;
                    const isExpanded = !!expandedEvents[event.id];
                    const dateStr = new Date(event.timestamp).toLocaleString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                    });

                    return (
                      <div key={event.id} className="relative group/item text-left">
                        <div className={`absolute -left-[38px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 ${styles.bg} ${styles.border} ${styles.text} shadow-[0_0_8px_rgba(56,189,248,0.1)] group-hover/item:scale-105 transition-transform duration-200`}>
                          <EventIcon className="text-[10px]" />
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1a7f8e]/30 transition-all shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${styles.bg} ${styles.text} border ${styles.border}`}>
                                  {event.event_type}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${getStatusColor(event.status)}`}>
                                  {event.status}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold">{event.department_service}</span>
                              </div>
                              <h4 className="text-[#1a3b6e] text-xs font-black mt-2">{event.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[9px] text-slate-500 font-mono">{dateStr}</span>
                              <button
                                onClick={() => toggleExpand(event.id)}
                                className="p-1 text-slate-500 hover:text-slate-600 cursor-pointer"
                              >
                                {isExpanded ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-3 pt-3 border-t border-slate-100/60"
                              >
                                <p className="text-slate-500 text-xs leading-relaxed whitespace-pre-wrap">{event.description}</p>
                                {event.related_entity_id && (
                                  <div className="mt-2 text-[9px] font-mono text-slate-500">
                                    Linked Entity: {event.related_entity_type?.toUpperCase()} ({event.related_entity_id})
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 2. APPOINTMENTS SUBTAB */}
        {activeSubTab === "appointments" && (
          <motion.div
            key="appointments-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Appointment Booking Panel */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 h-fit shadow-sm">
              <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-4">
                {role === "patient" ? "Request New Appointment" : "Book New Appointment"}
              </h3>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-[10px] font-bold uppercase">Department/Service</label>
                  <select
                    value={apptDept}
                    onChange={(e) => setApptDept(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="Outpatient Clinic">General Outpatient Clinic</option>
                    <option value="Cardiology Department">Cardiology Department</option>
                    <option value="Pediatrics Clinic">Pediatrics Clinic</option>
                    <option value="Neurology Unit">Neurology Unit</option>
                    <option value="Pathology Lab">Pathology Lab</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-[10px] font-bold uppercase">Appointment Type</label>
                  <select
                    value={apptType}
                    onChange={(e) => setApptType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="Consultation">Clinical Consultation</option>
                    <option value="Follow-up">Care Follow-up</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Special Procedure">Special Procedure</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-[10px] font-bold uppercase">Appointment Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-[10px] font-bold uppercase">
                    {role === "patient" ? "Reason for Appointment / Notes" : "Staff Coordination Notes"}
                  </label>
                  <textarea
                    rows="3"
                    placeholder={role === "patient" ? "E.g. experiencing mild headaches, seeking follow-up on my treatment..." : "E.g. patient requested afternoon slot, requires wheelchair assistance..."}
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-100 border border-slate-300 text-slate-700 rounded-full font-bold px-4 py-2 hover:bg-slate-200 bg-gradient-to-r from-sky-500 to-indigo-600 border-none text-white py-2 text-xs font-bold"
                >
                  <span>{role === "patient" ? "Request Appointment" : "Schedule Appointment"}</span>
                </button>
              </form>
            </div>

            {/* List panel */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-4">Patient Scheduling Catalog</h3>

              {loadingAppts ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FaClock className="text-2xl animate-spin mb-3 text-[#1a7f8e]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Syncing schedule registry...</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No active appointments scheduled.</div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => {
                    const statusColor = getStatusColor(appt.status);
                    const formattedDate = new Date(appt.appointment_date).toLocaleString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                    });
                    const isReschedOpen = !!showReschedInput[appt.appointment_id];

                    return (
                      <div key={appt.appointment_id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1a7f8e]/30 transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${statusColor}`}>
                                {appt.status}
                              </span>
                              <span className="text-[#1a7f8e] text-[10px] font-bold">{appt.appointment_type}</span>
                            </div>
                            <h4 className="text-[#1a3b6e] text-xs font-black mt-2">{appt.department_service}</h4>
                            <p className="text-slate-500 text-[10px] font-semibold mt-1">Date: <span className="text-slate-600 font-bold">{formattedDate}</span></p>
                            {appt.notes && <p className="text-slate-500 text-[10px] mt-2 italic">Notes: "{appt.notes}"</p>}
                          </div>
                          
                          {/* Coordination Action buttons */}
                          <div className="flex items-center gap-2.5 sm:self-center flex-wrap">
                            {appt.status === "SCHEDULED" && (
                              <>
                                <button
                                  onClick={() => handleUpdateApptStatus(appt.appointment_id, "COMPLETED")}
                                  className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                  title="Mark Completed"
                                >
                                  <FaCheck className="text-[10px]" />
                                </button>
                                <button
                                  onClick={() => setShowReschedInput(prev => ({ ...prev, [appt.appointment_id]: !prev[appt.appointment_id] }))}
                                  className="px-2.5 py-1 rounded-lg border border-sky-500/20 bg-sky-500/[0.04] text-[#1a7f8e] hover:bg-sky-500/10 text-[9px] font-bold cursor-pointer"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleUpdateApptStatus(appt.appointment_id, "MISSED")}
                                  className="px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/[0.04] text-rose-400 hover:bg-rose-500/10 text-[9px] font-bold cursor-pointer"
                                >
                                  Missed
                                </button>
                                <button
                                  onClick={() => handleUpdateApptStatus(appt.appointment_id, "CANCELLED")}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 hover:text-white cursor-pointer"
                                  title="Cancel Appointment"
                                >
                                  <FaTimes className="text-[10px]" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expandable Reschedule Date selector */}
                        {isReschedOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100/60 flex items-center gap-3">
                            <input
                              type="datetime-local"
                              required
                              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 text-[10px]"
                              value={reschedDate[appt.appointment_id] || ""}
                              onChange={(e) => setReschedDate(prev => ({ ...prev, [appt.appointment_id]: e.target.value }))}
                            />
                            <button
                              onClick={() => {
                                const newDate = reschedDate[appt.appointment_id];
                                if (!newDate) return;
                                handleUpdateApptStatus(appt.appointment_id, "SCHEDULED", { appointment_date: newDate });
                                setShowReschedInput(prev => ({ ...prev, [appt.appointment_id]: false }));
                              }}
                              className="px-3 py-1 bg-sky-500 text-white rounded-lg text-[9px] font-bold cursor-pointer"
                            >
                              Update Date
                            </button>
                            <button
                              onClick={() => setShowReschedInput(prev => ({ ...prev, [appt.appointment_id]: false }))}
                              className="text-slate-500 hover:text-slate-600 text-[9px] cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. REFERRALS SUBTAB */}
        {activeSubTab === "referrals" && (
          <motion.div
            key="referrals-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Outgoing Referral form - Only show for non-patients */}
            {role !== "patient" && (
              <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 h-fit shadow-sm">
                <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-4">Issue Clinic Referral</h3>
                <form onSubmit={handleIssueReferral} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Referring Department</label>
                    <input
                      type="text"
                      required
                      value={refReferring}
                      onChange={(e) => setRefReferring(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Referred Specialty Unit / Doctor</label>
                    <input
                      type="text"
                      required
                      value={refReferred}
                      onChange={(e) => setRefReferred(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Priority</label>
                    <select
                      value={refPriority}
                      onChange={(e) => setRefPriority(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="Routine">Routine Care</option>
                      <option value="Urgent">Urgent Review</option>
                      <option value="Emergency">Emergency Intake</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Referral Reason</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Provide detailed clinical query and diagnostics findings..."
                      value={refReason}
                      onChange={(e) => setRefReason(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-slate-100 border border-slate-300 text-slate-700 rounded-full font-bold px-4 py-2 hover:bg-slate-200 bg-gradient-to-r from-sky-500 to-indigo-600 border-none text-white py-2 text-xs font-bold"
                  >
                    <span>Issue Referral Order</span>
                  </button>
                </form>
              </div>
            )}

            {/* Referral Track board */}
            <div className={`${role === "patient" ? "lg:col-span-3" : "lg:col-span-2"} bg-white border border-slate-200 rounded-xl p-6 shadow-sm`}>
              <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-4">Clinical Referral Board</h3>

              {loadingRefs ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FaClock className="text-2xl animate-spin mb-3 text-[#1a7f8e]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Syncing referrals Board...</span>
                </div>
              ) : referrals.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No active referrals recorded.</div>
              ) : (
                <div className="space-y-4">
                  {referrals.map((ref) => {
                    const statusColor = getStatusColor(ref.status);
                    const formattedDate = new Date(ref.referral_date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    });
                    const isApptInputOpen = !!showRefApptInput[ref.referral_id];

                    return (
                      <div key={ref.referral_id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1a7f8e]/30 transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${statusColor}`}>
                                {ref.status}
                              </span>
                              <span className="text-pink-400 text-[10px] font-bold">Priority: {ref.priority}</span>
                            </div>
                            <h4 className="text-[#1a3b6e] text-xs font-black mt-2">{ref.referred_department_specialist}</h4>
                            <p className="text-slate-500 text-[9px]">From: {ref.referring_department} | Issued: {formattedDate}</p>
                            <p className="text-slate-600 text-xs mt-2 leading-relaxed">"{ref.referral_reason}"</p>
                            {ref.appointment_info && (
                              <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 font-semibold">
                                Appointment Info: {ref.appointment_info}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          {/* Actions */}
                          <div className="flex items-center gap-2.5 sm:self-center flex-wrap">
                            {role !== "patient" ? (
                              <>
                                {ref.status !== "COMPLETED" && ref.status !== "CANCELLED" && (
                                  <select
                                    onChange={(e) => {
                                      const nextStatus = e.target.value;
                                      if (nextStatus === "APPOINTMENT_SCHEDULED") {
                                        setShowRefApptInput(prev => ({ ...prev, [ref.referral_id]: true }));
                                      } else {
                                        handleUpdateReferralStatus(ref.referral_id, nextStatus);
                                      }
                                    }}
                                    value={ref.status}
                                    className="bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold px-2 py-1 rounded-lg focus:outline-none cursor-pointer hover:bg-slate-200"
                                  >
                                    <option value="CREATED">CREATED</option>
                                    <option value="SENT">SENT</option>
                                    <option value="ACCEPTED">ACCEPTED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                    <option value="OVERDUE">OVERDUE</option>
                                  </select>
                                )}
                              </>
                            ) : (
                              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border ${statusColor}`}>
                                Status: {ref.status}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Appointment Info Input prompt */}
                        {isApptInputOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100/60 flex items-center gap-3">
                            <input
                              type="text"
                              required
                              placeholder="Doctor Miller, Sep 02 at 2:00 PM"
                              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 text-[10px] flex-1"
                              value={refApptInfo[ref.referral_id] || ""}
                              onChange={(e) => setRefApptInfo(prev => ({ ...prev, [ref.referral_id]: e.target.value }))}
                            />
                            <button
                              onClick={() => {
                                const info = refApptInfo[ref.referral_id];
                                if (!info) return;
                                handleUpdateReferralStatus(ref.referral_id, "APPOINTMENT_SCHEDULED", { appointment_info: info });
                                setShowRefApptInput(prev => ({ ...prev, [ref.referral_id]: false }));
                              }}
                              className="px-3 py-1 bg-sky-500 text-white rounded-lg text-[9px] font-bold cursor-pointer"
                            >
                              Link Appointment
                            </button>
                            <button
                              onClick={() => setShowRefApptInput(prev => ({ ...prev, [ref.referral_id]: false }))}
                              className="text-slate-500 hover:text-slate-600 text-[9px] cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 4. INVESTIGATIONS SUBTAB */}
        {activeSubTab === "investigations" && (
          <motion.div
            key="investigations-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Order Investigation Panel - Hidden for patients */}
            {role !== "patient" && (
              <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 h-fit shadow-sm">
                <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-4">Order Clinical Test</h3>
                <form onSubmit={handleOrderInvestigation} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Test / Investigation Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brain MRI, Renal Ultrasound, CBC Panel"
                      value={invTestName}
                      onChange={(e) => setInvTestName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 text-[10px] font-bold uppercase">Pathology Notes / Indication</label>
                    <textarea
                      rows="3"
                      placeholder="Indicate diagnostic query, e.g. rule out renal artery stenosis..."
                      value={invNotes}
                      onChange={(e) => setInvNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-slate-100 border border-slate-300 text-slate-700 rounded-full font-bold px-4 py-2 hover:bg-slate-200 bg-gradient-to-r from-sky-500 to-indigo-600 border-none text-white py-2 text-xs font-bold"
                  >
                    <span>Order Diagnostic Test</span>
                  </button>
                </form>
              </div>
            )}

            {/* Tracking Dashboard */}
            <div className={`${role === "patient" ? "lg:col-span-3" : "lg:col-span-2"} bg-white border border-slate-200 rounded-xl p-6 shadow-sm`}>
              <h3 className="text-[#1a3b6e] text-xs font-bold uppercase tracking-wider mb-4">Diagnostics Tracking Board</h3>

              {loadingInvs ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FaClock className="text-2xl animate-spin mb-3 text-[#1a7f8e]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Syncing diagnostics tracking...</span>
                </div>
              ) : investigations.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No active investigations ordered.</div>
              ) : (
                <div className="space-y-4">
                  {investigations.map((inv) => {
                    const statusColor = getStatusColor(inv.status);
                    const orderedDateStr = new Date(inv.ordered_date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    });
                    const scheduledDateStr = inv.scheduled_date ? new Date(inv.scheduled_date).toLocaleString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                    }) : null;
                    const isSchedOpen = !!showInvSchedInput[inv.investigation_id];
                    const isResultOpen = !!showInvResultInput[inv.investigation_id];

                    return (
                      <div key={inv.investigation_id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1a7f8e]/30 transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${statusColor}`}>
                                {inv.status.replace("_", " ")}
                              </span>
                              <span className="text-amber-400 text-[10px] font-bold">{inv.test_name}</span>
                            </div>
                            <p className="text-slate-500 text-[9px] mt-1">Ordered: {orderedDateStr} {scheduledDateStr && `| Scheduled: ${scheduledDateStr}`}</p>
                            {inv.notes && <p className="text-slate-500 text-[10px] mt-2">Indication: "{inv.notes}"</p>}
                            {inv.result_reference && (
                              <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                                Diagnostic Document: {inv.result_reference}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2.5 sm:self-center flex-wrap">
                            {inv.status !== "CLOSED" && (
                              <>
                                <select
                                  onChange={(e) => {
                                    const nextStatus = e.target.value;
                                    if (nextStatus === "SCHEDULED") {
                                      setShowInvSchedInput(prev => ({ ...prev, [inv.investigation_id]: true }));
                                    } else if (nextStatus === "RESULT_AVAILABLE") {
                                      setShowInvResultInput(prev => ({ ...prev, [inv.investigation_id]: true }));
                                    } else {
                                      handleUpdateInvestigationStatus(inv.investigation_id, nextStatus);
                                    }
                                  }}
                                  value={inv.status}
                                  className="bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold px-2 py-1 rounded-lg focus:outline-none"
                                >
                                  <option value="ORDERED">ORDERED</option>
                                  <option value="SCHEDULED">SCHEDULED</option>
                                  <option value="IN_PROGRESS">IN PROGRESS</option>
                                  <option value="RESULT_AVAILABLE">RESULT AVAILABLE</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="FOLLOW_UP_REQUIRED">FOLLOW UP REQ</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Scheduling input */}
                        {isSchedOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100/60 flex items-center gap-3">
                            <input
                              type="datetime-local"
                              required
                              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 text-[10px]"
                              value={invSchedDate[inv.investigation_id] || ""}
                              onChange={(e) => setInvSchedDate(prev => ({ ...prev, [inv.investigation_id]: e.target.value }))}
                            />
                            <button
                              onClick={() => {
                                const newDate = invSchedDate[inv.investigation_id];
                                if (!newDate) return;
                                handleUpdateInvestigationStatus(inv.investigation_id, "SCHEDULED", { scheduled_date: newDate });
                                setShowInvSchedInput(prev => ({ ...prev, [inv.investigation_id]: false }));
                              }}
                              className="px-3 py-1 bg-sky-500 text-white rounded-lg text-[9px] font-bold cursor-pointer"
                            >
                              Update Schedule
                            </button>
                            <button
                              onClick={() => setShowInvSchedInput(prev => ({ ...prev, [inv.investigation_id]: false }))}
                              className="text-slate-500 hover:text-slate-600 text-[9px] cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        )}

                        {/* Result reference upload simulation input */}
                        {isResultOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100/60 space-y-3">
                            {/* Safety clinical warning */}
                            <div className="flex items-start gap-2 p-2 rounded bg-rose-500/[0.04] border border-rose-500/20 text-rose-400 text-[9px] font-semibold leading-tight">
                              <FaExclamationTriangle className="text-xs shrink-0 mt-0.5" />
                              <span>WARNING: Diagnostic documents logged here require human clinician evaluation. AI must not interpret findings autonomously.</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                required
                                placeholder="lab_report_cbc_scan_P1001.pdf"
                                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 text-[10px] flex-1 font-mono"
                                value={invResultFile[inv.investigation_id] || ""}
                                onChange={(e) => setInvResultFile(prev => ({ ...prev, [inv.investigation_id]: e.target.value }))}
                              />
                              <button
                                onClick={() => {
                                  const fileRef = invResultFile[inv.investigation_id];
                                  if (!fileRef) return;
                                  handleUpdateInvestigationStatus(inv.investigation_id, "RESULT_AVAILABLE", { result_available: true, result_reference: fileRef });
                                  setShowInvResultInput(prev => ({ ...prev, [inv.investigation_id]: false }));
                                }}
                                className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-bold cursor-pointer"
                              >
                                Log Result File
                              </button>
                              <button
                                onClick={() => setShowInvResultInput(prev => ({ ...prev, [inv.investigation_id]: false }))}
                                className="text-slate-500 hover:text-slate-600 text-[9px] cursor-pointer"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === "analysis" && (
          <motion.div
            key="analysis-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Run Analysis Button Capsule */}
            <div className="glass-panel border border-slate-200 rounded-[20px] p-6 bg-slate-50 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
              <h3 className="text-[#1a3b6e] text-sm font-black mb-2 flex items-center gap-2">
                <FaRobot className="text-[#1a7f8e]" />
                <span>
                  {role === "patient" ? "AI Health Summary & Next Steps" : "Multi-Agent Coordination Monitor Scan"}
                </span>
              </h3>
              <p className="text-slate-500 text-xs max-w-xl mb-4 leading-relaxed">
                {role === "patient"
                  ? "Get an instant, easy-to-understand summary of your medical history, recent lab tests, and upcoming appointments powered by AI."
                  : `Trigger a parallel analysis scan across all scheduled appointments, outgoing referrals, test orders, and history timelines for ${patient.name}. Specialist sub-agents will coordinate their findings.`
                }
              </p>
              
              <button
                type="button"
                onClick={handleAnalyzeCoordination}
                disabled={loadingAnalysis}
                className="btn-pill btn-primary px-7 py-3 text-xs shadow-md flex items-center gap-2"
              >
                {loadingAnalysis ? (
                  <>
                    <FaClock className="animate-spin text-sm" />
                    <span>
                      {role === "patient" ? "Reviewing your medical history..." : "Orchestrating Specialist Sub-Agents..."}
                    </span>
                  </>
                ) : (
                  <>
                    <FaBrain className="text-sm" />
                    <span>
                      {role === "patient" ? "Generate My Health Summary" : "Run Multi-Agent Scan"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Outputs */}
            {coordinationAnalysis && (
              <div className="space-y-6">
                {/* 1. Summary Agent Result */}
                <div className="glass-panel border border-sky-500/20 rounded-[20px] p-6 bg-gradient-to-br from-sky-950/10 to-slate-950/40 relative overflow-hidden">
                  <span className="text-[10px] text-[#1a7f8e] font-bold uppercase tracking-wider">
                    {role === "patient" ? "Personalized Health Insights" : "SummaryAgent Report"}
                  </span>
                  <h4 className="text-[#1a3b6e] text-sm font-black mt-1 leading-tight">
                    {role === "patient" ? "Your Care Plan Overview" : "Patient Coordination Summary"}
                  </h4>
                  <div className="mt-4 space-y-3 text-xs leading-relaxed">
                    <div className="text-slate-700 bg-white/60 p-3.5 rounded-xl border border-slate-200/50">
                      <strong className="text-slate-500 font-bold uppercase text-[9px] block mb-1">
                        {role === "patient" ? "Current Health Status:" : "Grounded Facts & References:"}
                      </strong>
                      <div className="prose prose-slate max-w-none text-xs text-slate-800 leading-relaxed font-semibold">
                        {coordinationAnalysis.summary?.FACTS.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-1.5">{line}</p>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600">
                      <strong className="text-slate-500 font-bold uppercase text-[9px] block mb-1">
                        {role === "patient" ? "Clinical Context:" : "Administrative Logic:"}
                      </strong> 
                      {coordinationAnalysis.summary?.REASON}
                    </p>
                    <div className="p-3.5 rounded-xl bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 text-[#1a7f8e] mt-2 font-bold">
                      <strong className="text-[#1a3b6e] font-bold uppercase text-[9px] block mb-1">
                        {role === "patient" ? "Your Recommended Next Steps:" : "Recommended Coordination Plan:"}
                      </strong>
                      {coordinationAnalysis.summary?.PROPOSED_ACTION}
                    </div>
                  </div>
                </div>

                {/* 2. INLINE HUMAN REVIEW QUEUE FOR ACTIVE PATIENT */}
                {role !== "patient" && patientReviews.filter(r => r.status === 'PENDING').length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[#1a3b6e] text-xs font-black uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Awaiting Clinician Action Approvals ({patientReviews.filter(r => r.status === 'PENDING').length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {patientReviews.filter(r => r.status === 'PENDING').map(review => (
                        <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">AI PROPOSAL ({review.supporting_evidence})</span>
                              <p className="text-slate-700 text-xs font-bold mt-1">"{review.proposed_action}"</p>
                              <p className="text-slate-500 text-[10px] mt-1">{review.reason}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
                              {review.importance_level} Risk
                            </span>
                          </div>
                          
                          <div className="flex gap-3 items-end pt-2 border-t border-slate-100">
                            <div className="flex-1">
                              <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">Decision Comment / Justification</label>
                              <input 
                                type="text"
                                value={inlineComments[review.id] || ""}
                                onChange={(e) => setInlineComments(prev => ({ ...prev, [review.id]: e.target.value }))}
                                placeholder="State reason for approval or rejection..."
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleInlineAction(review.id, "APPROVED")}
                                disabled={actioningInline}
                                className="btn-pill btn-success px-4 py-1.5 text-xs"
                              >
                                <FaCheck className="text-[10px]" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleInlineAction(review.id, "REJECTED")}
                                disabled={actioningInline}
                                className="btn-pill btn-danger px-4 py-1.5 text-xs"
                              >
                                <FaTimes className="text-[10px]" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. INLINE HUMAN REVIEW DECISION AUDIT HISTORY FOR PATIENT */}
                {role !== "patient" && patientReviews.filter(r => r.status !== 'PENDING').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-slate-500 text-xs font-black uppercase tracking-wider">
                      Human Review Decision Audit History ({patientReviews.filter(r => r.status !== 'PENDING').length})
                    </h3>
                    <div className="space-y-2">
                      {patientReviews.filter(r => r.status !== 'PENDING').map(review => (
                        <div key={review.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                review.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                              }`}>
                                {review.status}
                              </span>
                              <strong className="text-slate-600 font-bold">Proposal:</strong>
                              <span className="text-slate-700 italic">"{review.original_ai_proposal}"</span>
                            </div>
                            {review.reviewer_comment && (
                              <p className="text-slate-500 mt-1 font-semibold text-[10px]">
                                <strong className="text-slate-400 uppercase text-[9px] mr-1">Reviewer Note:</strong>
                                "{review.reviewer_comment}"
                              </p>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold shrink-0 text-left sm:text-right">
                            <span className="block text-[#1a3b6e]">Reviewer: {review.reviewer}</span>
                            <span>{new Date(review.decision_timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* 4. Specialized Agent Grid - Hidden for patients */}
                {role !== "patient" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    {/* AppointmentAgent Card */}
                    <div className="glass-panel border border-slate-200 rounded-xl p-5 bg-slate-50 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[10px] text-[#1a7f8e] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <FaCalendarAlt className="text-[10px]" />
                          <span>AppointmentAgent</span>
                        </span>
                        {coordinationAnalysis.appointments?.REQUIRES_HUMAN_REVIEW && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Human Review
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Facts Checked:</strong> {coordinationAnalysis.appointments?.FACTS}</p>
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Scan Reason:</strong> {coordinationAnalysis.appointments?.REASON}</p>
                        <p className="text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200/40"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Proposed Action:</strong> {coordinationAnalysis.appointments?.PROPOSED_ACTION}</p>
                      </div>
                    </div>

                    {/* ReferralAgent Card */}
                    <div className="glass-panel border border-slate-200 rounded-xl p-5 bg-slate-50 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[10px] text-[#1a7f8e] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <FaShareSquare className="text-[10px]" />
                          <span>ReferralAgent</span>
                        </span>
                        {coordinationAnalysis.referrals?.REQUIRES_HUMAN_REVIEW && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Human Review
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Facts Checked:</strong> {coordinationAnalysis.referrals?.FACTS}</p>
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Scan Reason:</strong> {coordinationAnalysis.referrals?.REASON}</p>
                        <p className="text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200/40"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Proposed Action:</strong> {coordinationAnalysis.referrals?.PROPOSED_ACTION}</p>
                      </div>
                    </div>

                    {/* InvestigationAgent Card */}
                    <div className="glass-panel border border-slate-200 rounded-xl p-5 bg-slate-50 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[10px] text-[#1a7f8e] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <FaFileMedical className="text-[10px]" />
                          <span>InvestigationAgent</span>
                        </span>
                        {coordinationAnalysis.investigations?.REQUIRES_HUMAN_REVIEW && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Human Review
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Facts Checked:</strong> {coordinationAnalysis.investigations?.FACTS}</p>
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Scan Reason:</strong> {coordinationAnalysis.investigations?.REASON}</p>
                        <p className="text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200/40"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Proposed Action:</strong> {coordinationAnalysis.investigations?.PROPOSED_ACTION}</p>
                      </div>
                    </div>

                    {/* FollowUpAgent Card */}
                    <div className="glass-panel border border-slate-200 rounded-xl p-5 bg-slate-50 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[10px] text-[#1a7f8e] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <FaStethoscope className="text-[10px]" />
                          <span>FollowUpAgent</span>
                        </span>
                        {coordinationAnalysis.followups?.REQUIRES_HUMAN_REVIEW && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Human Review
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Facts Checked:</strong> {coordinationAnalysis.followups?.FACTS}</p>
                        <p className="text-slate-600"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Scan Reason:</strong> {coordinationAnalysis.followups?.REASON}</p>
                        <p className="text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200/40"><strong className="text-slate-500 font-bold text-[9px] block uppercase">Proposed Action:</strong> {coordinationAnalysis.followups?.PROPOSED_ACTION}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PatientJourney;
