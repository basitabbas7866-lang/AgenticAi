import React, { useState, useEffect } from "react";
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
  FaWhatsapp,
  FaPills,
  FaExclamationCircle,
  FaUserNurse,
  FaCamera,
  FaEdit
} from "react-icons/fa";
import { getPatientReviews, getDoctors, assignDoctor, getPatientPrescriptions, updatePatient } from "../../api";

function ProfileWidget({ patient }) {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = loggedInUser.name || loggedInUser.email?.split("@")[0] || "Dr. Sarah Jenkins";
  const userRole = loggedInUser.role || "doctor";
  const initials = fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [hasApprovedReviews, setHasApprovedReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [viewDoctorId, setViewDoctorId] = useState("");
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignedDocInfo, setAssignedDocInfo] = useState(null);
  const [patientStatus, setPatientStatus] = useState("PENDING");
  const [lockedDocInfo, setLockedDocInfo] = useState(null);
  const [isLockedByPrescription, setIsLockedByPrescription] = useState(false);
  // Custom doctor name input state
  const [customDoctorName, setCustomDoctorName] = useState("");
  const [customDoctors, setCustomDoctors] = useState([]);

  // Profile Customization State
  const [profilePic, setProfilePic] = useState(() => {
    if (patient?.patient_id) {
      return localStorage.getItem(`patient_profile_pic_${patient.patient_id}`) || "";
    }
    return "";
  });

  useEffect(() => {
    if (patient?.patient_id) {
      setProfilePic(localStorage.getItem(`patient_profile_pic_${patient.patient_id}`) || "");
    }
  }, [patient?.patient_id]);

  // Doctor/Nurse Profile Customization State
  const [docProfilePic, setDocProfilePic] = useState(() => {
    if (loggedInUser.id) {
      return localStorage.getItem(`doctor_profile_pic_${loggedInUser.id}`) || "";
    }
    return "";
  });

  useEffect(() => {
    if (loggedInUser.id) {
      setDocProfilePic(localStorage.getItem(`doctor_profile_pic_${loggedInUser.id}`) || "");
    }
  }, [loggedInUser.id]);

  const handleDocPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (loggedInUser.id) {
        localStorage.setItem(`doctor_profile_pic_${loggedInUser.id}`, base64String);
      }
      setDocProfilePic(base64String);
      window.location.reload(); // Refresh to update sidebar too
    };
    reader.readAsDataURL(file);
  };

  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editDocName, setEditDocName] = useState(fullName);
  const [editDocEmail, setEditDocEmail] = useState(loggedInUser.email || "");
  const [editDocSpecialty, setEditDocSpecialty] = useState(loggedInUser.specialty || "");
  const [editDocHospital, setEditDocHospital] = useState(() => {
    return localStorage.getItem(`doctor_hospital_${loggedInUser.id}`) || "Metro General Hospital";
  });
  const [editDocLicense, setEditDocLicense] = useState(() => {
    return localStorage.getItem(`doctor_license_${loggedInUser.id}`) || `LIC-${98000 + (loggedInUser.id || 124)}`;
  });
  const [editDocPhone, setEditDocPhone] = useState(() => {
    return localStorage.getItem(`doctor_phone_${loggedInUser.id}`) || "+91-98765-43210";
  });
  const [editDocBio, setEditDocBio] = useState(() => {
    return localStorage.getItem(`doctor_bio_${loggedInUser.id}`) || "Experienced medical specialist dedicated to evidence-based clinical practices and patient coordination.";
  });
  const [editDocConsultationHours, setEditDocConsultationHours] = useState(() => {
    return localStorage.getItem(`doctor_hours_${loggedInUser.id}`) || "Mon-Fri (09:00 AM - 05:00 PM)";
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [showChangeDoctor, setShowChangeDoctor] = useState(false);

  // Blood Group & Allergies States
  const [bloodGroup, setBloodGroup] = useState(() => {
    if (patient?.patient_id) {
      return localStorage.getItem(`patient_blood_group_${patient.patient_id}`) || "Not Recorded";
    }
    return "Not Recorded";
  });
  const [allergies, setAllergies] = useState(() => {
    if (patient?.patient_id) {
      return localStorage.getItem(`patient_allergies_${patient.patient_id}`) || "None Documented";
    }
    return "None Documented";
  });

  useEffect(() => {
    if (patient?.patient_id) {
      setBloodGroup(localStorage.getItem(`patient_blood_group_${patient.patient_id}`) || "Not Recorded");
      setAllergies(localStorage.getItem(`patient_allergies_${patient.patient_id}`) || "None Documented");
    }
  }, [patient?.patient_id]);

  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editAllergies, setEditAllergies] = useState("");

  const handleEditClick = () => {
    setEditName(patient?.name || fullName);
    setEditAge(patient?.age || "");
    setEditGender(patient?.gender || "Male");
    setEditPhone(patient?.phone || "");
    setEditBloodGroup(localStorage.getItem(`patient_blood_group_${patient?.patient_id}`) || "");
    setEditAllergies(localStorage.getItem(`patient_allergies_${patient?.patient_id}`) || "");
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    try {
      const targetId = patient?.patient_id || "P1010";
      const payload = {
        name: editName,
        age: parseInt(editAge) || 0,
        gender: editGender,
        phone: editPhone
      };
      const res = await updatePatient(targetId, payload);
      if (res.data.success) {
        // Also update the local storage user object if the name changed
        const currentLocalUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentLocalUser.role === "patient") {
          currentLocalUser.name = editName;
          localStorage.setItem("user", JSON.stringify(currentLocalUser));
        }
        // Save blood group & allergies locally
        localStorage.setItem(`patient_blood_group_${targetId}`, editBloodGroup);
        localStorage.setItem(`patient_allergies_${targetId}`, editAllergies);
        setBloodGroup(editBloodGroup || "Not Recorded");
        setAllergies(editAllergies || "None Documented");

        setIsEditing(false);
        alert("Profile details updated successfully!");
        window.location.reload();
      } else {
        alert(res.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating patient profile:", err);
      alert("An error occurred while saving profile changes.");
    }
  };

  const handleSaveDocProfile = async () => {
    if (!editDocName.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    try {
      const { updateUser } = await import("../../api");
      const res = await updateUser(loggedInUser.id, {
        name: editDocName,
        email: editDocEmail,
        specialty: editDocSpecialty
      });

      if (res.data.success) {
        // Update user session details
        const updatedLocalUser = { ...loggedInUser };
        updatedLocalUser.name = editDocName;
        updatedLocalUser.email = editDocEmail;
        updatedLocalUser.specialty = editDocSpecialty;
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));

        // Save local items
        localStorage.setItem(`doctor_hospital_${loggedInUser.id}`, editDocHospital);
        localStorage.setItem(`doctor_license_${loggedInUser.id}`, editDocLicense);
        localStorage.setItem(`doctor_phone_${loggedInUser.id}`, editDocPhone);
        localStorage.setItem(`doctor_bio_${loggedInUser.id}`, editDocBio);
        localStorage.setItem(`doctor_hours_${loggedInUser.id}`, editDocConsultationHours);

        setIsEditingDoc(false);
        alert("Practitioner profile details updated successfully!");
        window.location.reload();
      } else {
        alert(res.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating doctor profile:", err);
      alert("An error occurred while saving profile changes.");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const targetId = patient?.patient_id || "P1010";
      localStorage.setItem(`patient_profile_pic_${targetId}`, base64String);
      setProfilePic(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Combine custom + registered doctors for dropdown; custom entries appear first
  const allDoctors = [
    ...customDoctors,
    ...doctors.filter(d => !customDoctors.some(c => c.id === d.id))
  ];

  const handleAddCustomDoctor = () => {
    const trimmed = customDoctorName.trim();
    if (!trimmed) return;
    const customId = `custom_${Date.now()}`;
    const newDoc = { id: customId, name: trimmed, specialty: "External / Custom", isCustom: true };
    setCustomDoctors(prev => [newDoc, ...prev]);
    setSelectedDoctorId(customId);
    setCustomDoctorName("");
  };

  // Check for prescriptions and enforce specialty lock
  useEffect(() => {
    if (userRole === "patient" && patient) {
      getPatientPrescriptions(patient.patient_id)
        .then(res => {
          if (res.data.success && res.data.prescriptions?.length > 0) {
            const firstPresc = res.data.prescriptions[0];
            setIsLockedByPrescription(true);
            setLockedDocInfo({
              id: firstPresc.doctor_id,
              name: firstPresc.doctor_name,
              specialty: "Attending Specialist"
            });
            setSelectedDoctorId(firstPresc.doctor_id);
            setViewDoctorId(firstPresc.doctor_id);
          }
        })
        .catch(err => console.log("Failed to load locking prescriptions:", err));
    }
  }, [userRole, patient]);

  // Load patient assignment info dynamically
  useEffect(() => {
    if (userRole === "patient" && patient) {
      setPatientStatus(patient.status || "PENDING");
      if (patient.assigned_doctor_id) {
        setSelectedDoctorId(patient.assigned_doctor_id);
      }
    }
  }, [userRole, patient]);

  // Load doctors list
  useEffect(() => {
    if (userRole === "patient") {
      getDoctors()
        .then(res => {
          if (res.data.success) {
            setDoctors(res.data.doctors || []);
            // Find current assigned doctor name/details
            if (patient?.assigned_doctor_id) {
              const matched = (res.data.doctors || []).find(d => String(d.id) === String(patient.assigned_doctor_id));
              if (matched) setAssignedDocInfo(matched);
            }
          }
        })
        .catch(err => console.log("Failed to load doctors:", err));
    }
  }, [userRole, patient]);

  useEffect(() => {
    if (userRole === "patient") {
      setLoadingReviews(true);
      const targetId = patient?.patient_id || "P1010"; // Rajesh Kuamr
      getPatientReviews(targetId)
        .then(res => {
          const approved = (res.data || []).some(r => r.status === "APPROVED");
          setHasApprovedReviews(approved);
        })
        .catch(err => console.log("Failed to load reviews:", err))
        .finally(() => setLoadingReviews(false));
    }
  }, [userRole, patient]);

  // Load prescriptions based on selected doctor
  useEffect(() => {
    if (userRole === "patient" && patient) {
      if (viewDoctorId) {
        setLoadingPrescriptions(true);
        getPatientPrescriptions(patient.patient_id, viewDoctorId)
          .then(res => {
            if (res.data.success) {
              setPatientPrescriptions(res.data.prescriptions || []);
            }
          })
          .catch(err => console.log("Failed to load prescriptions:", err))
          .finally(() => setLoadingPrescriptions(false));
      } else {
        setPatientPrescriptions([]);
      }
    }
  }, [userRole, patient, viewDoctorId]);

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
    { time: "11:34 AM", action: "Active session token validated", details: `ID: EHR-SEC-98124-${initials}` },
    { time: "11:12 AM", action: "Central Registry Node sync completed", details: "Synced 12 active patient charts" },
    { time: "09:15 AM", action: "Decrypted patient records key", details: "Encrypted handshake with Epic Node" },
    { time: "08:45 AM", action: "Clinician login verified (MFA)", details: "Authorized from IP: 192.168.1.142" }
  ];

  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) return;
    setAssigning(true);
    try {
      const targetId = patient?.patient_id || "P1010";

      // Check if it's a custom (manually entered) doctor
      const customDoc = customDoctors.find(d => d.id === selectedDoctorId);
      if (customDoc) {
        // Custom doctor: no backend API call, just set local state
        setAssignedDocInfo({ id: customDoc.id, name: customDoc.name, specialty: "External / Custom" });
        setPatientStatus("PENDING");
        alert(`Consultation request noted for external doctor "${customDoc.name}". Note: External doctors must be manually coordinated outside the system.`);
        setAssigning(false);
        return;
      }

      // Registered doctor: call backend API
      await assignDoctor(targetId, selectedDoctorId);
      setPatientStatus("PENDING");
      const matched = doctors.find(d => String(d.id) === String(selectedDoctorId));
      if (matched) setAssignedDocInfo(matched);
      alert("Consultation request sent to the doctor. Please log in as the doctor to approve this intake.");
      window.location.reload();
    } catch (err) {
      console.log("Failed to assign doctor:", err);
    } finally {
      setAssigning(false);
    }
  };

  if (userRole === "patient") {
    // isAssigned = true only when doctor has been actually submitted/assigned, NOT on dropdown selection
    const isAssigned = !!assignedDocInfo || !!patient?.assigned_doctor_id;
    const isApproved = patientStatus === "APPROVED" || patient?.status === "APPROVED";

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6 text-left font-sans"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Holographic Patient ID Badge (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#1a3b6e]/5 to-[#1a7f8e]/10 border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden min-h-[420px]">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1a7f8e] to-[#2b6cb0]" />
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 text-[#1a7f8e] text-[8px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a7f8e] animate-pulse" />
              Patient Portal
            </div>

            <div className="w-full flex flex-col items-center mt-6">
              <div className="relative mb-5 group/avatar">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1a7f8e] to-[#2b6cb0] p-1 shadow-md relative overflow-hidden">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#1a7f8e] font-black text-3xl shadow-inner font-mono overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  
                  {/* Camera overlay */}
                  <label className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold">
                    <FaCamera className="text-base mb-1" />
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {isEditing ? (
                <div className="w-full mt-2 space-y-3 bg-white/70 p-4 rounded-2xl border border-slate-200/50 text-left">
                  <div>
                    <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Age</label>
                      <input 
                        type="number" 
                        value={editAge} 
                        onChange={e => setEditAge(e.target.value)} 
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Gender</label>
                      <select 
                        value={editGender} 
                        onChange={e => setEditGender(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-bold text-slate-700"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={editPhone} 
                      onChange={e => setEditPhone(e.target.value)} 
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Blood Group</label>
                      <input 
                        type="text" 
                        value={editBloodGroup} 
                        onChange={e => setEditBloodGroup(e.target.value)} 
                        placeholder="e.g. O+"
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Allergies</label>
                      <input 
                        type="text" 
                        value={editAllergies} 
                        onChange={e => setEditAllergies(e.target.value)} 
                        placeholder="e.g. None"
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1.5">
                    <button 
                      onClick={handleSaveProfile}
                      className="flex-1 py-2 rounded-xl bg-[#1a7f8e] text-white font-extrabold text-[10px] uppercase cursor-pointer hover:bg-[#166d7a] transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-600 font-extrabold text-[10px] uppercase cursor-pointer hover:bg-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-[#1a3b6e] text-lg font-black m-0 leading-tight">{patient?.name || fullName}</h2>
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-2">Patient ID: {patient?.patient_id || "P1010"}</span>
                  
                  <div className="flex flex-col gap-1 mt-2 text-center text-[10px] text-slate-500 font-semibold w-full px-2">
                    <span>Age: {patient?.age || "N/A"} • Gender: {patient?.gender || "N/A"}</span>
                    <span>Phone: {patient?.phone || "N/A"}</span>
                    <div className="border-t border-slate-100/60 my-1 pt-1.5 grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-[7.5px] text-slate-400 font-extrabold uppercase block leading-none">Blood Type</span>
                        <span className="text-[10px] font-black text-[#1a3b6e] mt-1 block">{bloodGroup}</span>
                      </div>
                      <div>
                        <span className="text-[7.5px] text-slate-400 font-extrabold uppercase block leading-none">Allergies</span>
                        <span className="text-[10px] font-black text-rose-600 mt-1 block truncate" title={allergies}>{allergies}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-[#1a7f8e] font-extrabold mt-1">General Health Plan Active</span>
                  </div>

                  <button 
                    onClick={handleEditClick}
                    className="mt-3 px-4 py-2 rounded-full border border-[#1a7f8e]/35 bg-white text-[#1a7f8e] hover:bg-[#1a7f8e]/10 text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <FaEdit />
                    <span>Edit Profile Details</span>
                  </button>
                </>
              )}
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 mt-6">
              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Secure Health Card Key</span>
              <span className="font-mono text-[9px] text-[#1a3b6e] font-bold tracking-widest">EHR-PAT-{patient?.patient_id || "P1010"}-{initials}</span>
            </div>
          </div>

          {/* Specialist Selection and Treatment Center (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm min-h-[420px]">
            <div>
              {/* Doctor Assignment Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FaUserMd className="text-[#1a7f8e] text-sm" />
                  <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider">My Specialist Treatment Coordinator</span>
                </div>
                <span className={`text-[8.5px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                  isApproved 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                    : isAssigned 
                      ? "bg-amber-50 border-amber-200 text-amber-600 animate-pulse" 
                      : "bg-slate-100 border-slate-200 text-slate-500"
                }`}>
                  {isApproved ? "Approved by Doctor" : isAssigned ? "Awaiting Doctor Approval" : "No Doctor Selected"}
                </span>
              </div>

              {/* Conditionally Render Doctor Assignment Form or Assigned Doctor Info */}
              {!isAssigned ? (
                <div className="flex flex-col gap-4 text-left animate-fadeIn">
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed m-0">
                    Select a registered specialist from the list below based on their specialty domain to request consultation and unlock your care plan.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Select Specialist Doctor</label>

                    {/* Dropdown — registered specialists */}
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold outline-none focus:border-[#1a7f8e]"
                    >
                      <option value="">-- Choose registered doctor --</option>
                      {doctors.length > 0 && (
                        <optgroup label="─── Registered Specialists">
                          {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name} (Specialty: {doc.specialty || "General Medicine"})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <button
                    onClick={handleAssignDoctor}
                    disabled={!selectedDoctorId || assigning}
                    className="h-11 rounded-xl bg-[#1a3b6e] text-white hover:bg-[#15305b] font-bold text-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] mt-2"
                  >
                    {assigning ? "Requesting intake..." : "Assign Specialist & Submit Consultation Request"}
                  </button>
                </div>
              ) : !isApproved ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 animate-fadeIn px-4">
                  <FaExclamationCircle className="text-amber-500 text-2xl mb-3 animate-pulse" />
                  <h4 className="text-xs text-[#1a3b6e] font-black uppercase tracking-wider m-0">Awaiting Confirmation from Your Doctor</h4>
                  <p className="text-[10px] max-w-sm mt-2 leading-relaxed font-semibold text-slate-500">
                    We've forwarded your request to <strong className="text-slate-700">{assignedDocInfo ? assignedDocInfo.name : "your selected specialist"}</strong>
                    {assignedDocInfo?.specialty ? ` (${assignedDocInfo.specialty})` : ""}. They will review your intake details and confirm at the earliest.
                  </p>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mt-4 text-left max-w-md w-full">
                    <span className="text-[8.5px] text-sky-800 font-extrabold uppercase tracking-wider block mb-2">What happens next?</span>
                    <ul className="space-y-1.5 m-0 pl-0 list-none">
                      <li className="text-[9.5px] text-sky-700 font-semibold flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5 shrink-0">✓</span>
                        Your doctor will review your details and confirm the appointment.
                      </li>
                      <li className="text-[9.5px] text-sky-700 font-semibold flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5 shrink-0">✓</span>
                        Once confirmed, your care plan and video consultation will be ready for you here.
                      </li>
                      <li className="text-[9.5px] text-sky-700 font-semibold flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5 shrink-0">✓</span>
                        You'll be able to view your prescriptions and health records after approval.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Approved Medications and Doctor Consultation Info */
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className={`border rounded-xl p-3.5 flex items-center justify-between text-left ${isLockedByPrescription ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white ${isLockedByPrescription ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                        <FaUserMd />
                      </div>
                      <div>
                        <span className={`text-[8px] font-extrabold uppercase tracking-wider block ${isLockedByPrescription ? 'text-rose-800' : 'text-emerald-800'}`}>Assigned Doctor</span>
                        <strong className="text-[#1a3b6e] text-xs font-black block mt-0.5">{isLockedByPrescription ? lockedDocInfo?.name : (assignedDocInfo ? assignedDocInfo.name : "Assigned Specialist")}</strong>
                        <span className="text-slate-500 text-[8.5px] font-bold block mt-0.5">Specialist: {isLockedByPrescription ? (lockedDocInfo?.specialty || "Attending Specialist") : (assignedDocInfo ? (assignedDocInfo.specialty || "General Medicine") : "N/A")} • Active Consultation</span>
                      </div>
                    </div>
                    <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase font-mono border ${isLockedByPrescription ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse' : 'bg-emerald-600 text-white border-emerald-700'}`}>{isLockedByPrescription ? "🔒 Primary locked" : "Approved"}</span>
                  </div>

                  {showChangeDoctor ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fadeIn text-left">
                      <span className="text-[10px] text-[#1a3b6e] font-extrabold uppercase block">Request Consultation with another Specialist:</span>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold outline-none focus:border-[#1a7f8e]"
                      >
                        <option value="">-- Choose registered doctor --</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} (Specialty: {doc.specialty || "General Medicine"})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAssignDoctor}
                          disabled={!selectedDoctorId || assigning}
                          className="flex-1 py-2 rounded-xl bg-[#1a7f8e] text-white font-extrabold text-[10px] uppercase cursor-pointer hover:bg-[#166d7a] transition-all disabled:opacity-50"
                        >
                          {assigning ? "Requesting intake..." : "Submit New Request"}
                        </button>
                        <button
                          onClick={() => {
                            setShowChangeDoctor(false);
                            setSelectedDoctorId("");
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-600 font-extrabold text-[10px] uppercase cursor-pointer hover:bg-slate-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    !isLockedByPrescription && (
                      <button
                        onClick={() => setShowChangeDoctor(true)}
                        className="px-4 py-2 rounded-xl border border-[#1a7f8e]/35 bg-white text-[#1a7f8e] hover:bg-[#1a7f8e]/10 text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer w-fit self-start active:scale-95 shadow-sm"
                      >
                        Request Consultation with a Different Doctor
                      </button>
                    )
                  )}

                  <div className="flex flex-col gap-3.5 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-[#1a3b6e] font-extrabold uppercase tracking-wider block">View prescriptions from doctor:</label>
                      {isLockedByPrescription ? (
                        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-[#1a3b6e] text-xs font-extrabold">
                          <span>{lockedDocInfo?.name} (Primary Attending Specialist)</span>
                          <span className="text-[8px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase border border-red-200">🔒 Care Locked</span>
                        </div>
                      ) : (
                        <select
                          value={viewDoctorId}
                          onChange={(e) => setViewDoctorId(e.target.value)}
                          className="h-9 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold outline-none focus:border-[#1a7f8e] w-full"
                        >
                          <option value="">-- Select Attending Doctor --</option>
                          {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name} ({doc.specialty || "General Medicine"})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-slate-400 text-[8px] font-extrabold uppercase tracking-wider block mb-2">Prescribed Active Medications</span>
                      
                      {loadingPrescriptions ? (
                        <div className="flex items-center justify-center py-8 text-slate-400 text-xs font-bold gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-[#1a7f8e] animate-spin" />
                          Fetching Doctor Prescriptions...
                        </div>
                      ) : !viewDoctorId ? (
                        <div className="text-center py-8 text-[10px] text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl">
                          Select a doctor name from the dropdown to view prescriptions.
                        </div>
                      ) : patientPrescriptions.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {patientPrescriptions.map(med => (
                            <div key={med.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-[#1a7f8e]/35 transition-all">
                              <FaPills className="text-[#1a7f8e] text-base shrink-0 mt-0.5" />
                              <div className="text-left">
                                <p className="m-0 text-[#1a3b6e] font-extrabold text-xs">{med.medication_name}</p>
                                <span className="text-slate-500 text-[10px] font-semibold mt-1 block">{med.instructions}</span>
                                <span className="text-[7.5px] bg-[#1a7f8e]/10 text-[#1a7f8e] font-extrabold px-1.5 py-0.5 rounded mt-2 inline-block uppercase">Prescribed by {med.doctor_name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[10px] text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl">
                          No active prescriptions recorded by this specialist doctor.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4 text-[10px] text-slate-500">
              <div className="flex items-center gap-2 text-left">
                <FaUserNurse className="text-[#1a7f8e] text-sm shrink-0" />
                <span>Primary Care Coordinator: <strong className="text-slate-700">Metro Care Support Group</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span>Emergency Help: <strong className="text-slate-700 font-mono">+91-9988-7766-55</strong></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6 text-left"
    >
      {/* 1. TOP SECTION: Badge + Basic Registry Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT CARD: Holographic Clinical ID Badge (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#1a3b6e]/5 to-[#1a7f8e]/10 border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden min-h-[420px] transition-all hover:shadow-xl hover:border-[#1a7f8e]/40 group/avatar">
          {/* Top blue/teal indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1c4d8d] via-[#1a7f8e] to-[#00c988]" />
          
          {/* Security badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[8px] font-extrabold uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Active EMR
          </div>

          <div className="w-full flex flex-col items-center mt-6">
            {/* Avatar Group */}
            <div className="relative mb-5 group/avatar">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1a7f8e] via-[#2b6cb0] to-[#00909e] p-1 shadow-md group-hover:scale-105 transition-transform overflow-hidden relative">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#1a7f8e] font-black text-3xl shadow-inner font-mono tracking-tight overflow-hidden">
                  {docProfilePic ? (
                    <img src={docProfilePic} alt="Clinician Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              
              {/* Camera overlay */}
              <label className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold">
                <FaCamera className="text-base mb-1" />
                Upload
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleDocPhotoUpload} 
                  className="hidden" 
                />
              </label>
              <span className="absolute bottom-1 right-2 w-5 h-5 bg-[#00c988] border-4 border-white rounded-full shadow-md z-10" />
            </div>

            {isEditingDoc ? (
              <div className="w-full space-y-2.5 mt-1 text-left">
                <div>
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-0.5">Practitioner Name</label>
                  <input 
                    type="text" 
                    value={editDocName} 
                    onChange={e => setEditDocName(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-0.5">Clinical Email</label>
                  <input 
                    type="email" 
                    value={editDocEmail} 
                    onChange={e => setEditDocEmail(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-[#1a3b6e] text-lg font-black m-0 leading-tight tracking-tight">{loggedInUser.name || fullName}</h2>
                <span className="text-[10px] text-[#1a7f8e] font-extrabold uppercase tracking-wider mt-2 px-3 py-1 bg-[#1a7f8e]/10 rounded-full">
                  {userRole === "doctor" ? "Attending Physician" : userRole === "nurse" ? "Registered Nurse" : "Patient"}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">
                  {userRole === "doctor" ? "Lead Medical Officer" : "Clinical Coordinator"}
                </span>
              </>
            )}
          </div>

          {/* Secure access token */}
          <div className="w-full bg-white/85 backdrop-blur-md border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2.5 mt-6 relative shadow-sm">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Access Token</span>
              <span className="font-mono text-[9.5px] text-[#1a3b6e] font-black tracking-wider uppercase">EHR-SEC-98124-{initials}</span>
            </div>
            {/* Barcode representation */}
            <div className="w-full h-6 mt-0.5 flex justify-between gap-0.5 opacity-40 select-none">
              {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4].map((w, idx) => (
                <div key={idx} className="bg-slate-900 h-full rounded-sm" style={{ width: `${w}px` }} />
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

            {isEditingDoc ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
                <div>
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Affiliated Hospital/Node</label>
                  <input 
                    type="text" 
                    value={editDocHospital} 
                    onChange={e => setEditDocHospital(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Specialty Domain</label>
                  <input 
                    type="text" 
                    value={editDocSpecialty} 
                    onChange={e => setEditDocSpecialty(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">License Reference ID</label>
                  <input 
                    type="text" 
                    value={editDocLicense} 
                    onChange={e => setEditDocLicense(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Contact Phone</label>
                  <input 
                    type="text" 
                    value={editDocPhone} 
                    onChange={e => setEditDocPhone(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Consultation Hours</label>
                  <input 
                    type="text" 
                    value={editDocConsultationHours} 
                    onChange={e => setEditDocConsultationHours(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] font-semibold text-slate-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[8px] text-slate-500 font-extrabold uppercase block mb-1">Clinical Bio & Expert Profile</label>
                  <textarea 
                    rows="3"
                    value={editDocBio} 
                    onChange={e => setEditDocBio(e.target.value)} 
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#1a7f8e] text-slate-700"
                  />
                </div>
                <div className="flex gap-2.5 md:col-span-2 mt-2">
                  <button 
                    onClick={handleSaveDocProfile}
                    className="flex-1 py-2.5 rounded-xl bg-[#1a3b6e] text-white font-extrabold text-xs uppercase cursor-pointer hover:bg-[#15305b] transition-all"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditingDoc(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-extrabold text-xs uppercase cursor-pointer hover:bg-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1a7f8e]/25 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                        <FaHospital className="text-xs" />
                      </div>
                      <div className="text-left">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Affiliated Node</span>
                        <span className="text-[#1a3b6e] text-xs font-bold mt-1 block">
                          {editDocHospital}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8.5px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-bold font-mono shrink-0">
                      {userRole === "doctor" ? "Specialist" : "General"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1a7f8e]/25 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                        <FaUserMd className="text-xs" />
                      </div>
                      <div className="text-left">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">Specialty Domain</span>
                        <span className="text-[#1a3b6e] text-xs font-bold mt-1 block">
                          {loggedInUser.specialty || editDocSpecialty || "General Practitioner"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8.5px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-bold font-mono shrink-0">
                      {userRole === "doctor" ? "M.D." : userRole === "nurse" ? "R.N." : "P.T."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1a7f8e]/25 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                        <FaRegIdCard className="text-xs" />
                      </div>
                      <div className="text-left">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-none">License Reference ID</span>
                        <span className="text-[#1a3b6e] text-xs font-mono font-bold mt-1 block">
                          {editDocLicense}
                        </span>
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

                <div className="border-t border-slate-100 pt-4 mt-4 text-left">
                  <span className="text-[8.5px] text-[#1a3b6e] font-extrabold uppercase tracking-wider block mb-1">Clinical Profile & Consultation Info</span>
                  <p className="text-slate-600 text-xs leading-relaxed m-0 font-medium">{editDocBio}</p>
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100/50">
                    <div>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase block leading-none">Consultation Hours</span>
                      <span className="text-slate-700 text-xs font-bold mt-1.5 block">{editDocConsultationHours}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase block leading-none">Clinical Contact</span>
                      <span className="text-slate-700 text-xs font-bold mt-1.5 block">{editDocPhone}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditingDoc(true)}
                  className="mt-6 px-4 py-2 rounded-full border border-[#1a7f8e]/35 bg-white text-[#1a7f8e] hover:bg-[#1a7f8e]/10 text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 w-fit"
                >
                  <FaEdit />
                  <span>Edit Clinician Profile</span>
                </button>
              </>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1a7f8e] animate-pulse" />
              <span>Connected Node: <strong className="text-slate-700">metro-gen-{loggedInUser.specialty?.toLowerCase() || "hosp"}-node-{loggedInUser.id || 10}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span>IP Address: <strong className="text-slate-700 font-mono">{typeof window !== "undefined" ? window.location.hostname : "192.168.0.111"}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Latency: <strong className="text-slate-700 font-mono">11ms</strong></span>
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
