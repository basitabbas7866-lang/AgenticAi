import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "../api";
import {
    FaUser,
    FaLock,
    FaEnvelope,
    FaStethoscope,
    FaShieldAlt,
    FaCheckCircle,
    FaMicrophone,
    FaFileMedical,
    FaArrowRight,
    FaUserMd,
    FaKey,
    FaEye,
    FaEyeSlash,
    FaSpinner,
    FaCheck
} from "react-icons/fa";

const ROLE_OPTIONS = [
    {
        id: "doctor",
        label: "Doctor / Specialist",
        desc: "Ambient SOAP & Consultation",
        icon: FaUserMd,
        badge: "Full Workstation"
    },
    {
        id: "nurse",
        label: "Clinical Nurse",
        desc: "Triage, Alerts & Care Coordination",
        icon: FaStethoscope,
        badge: "Care Coordinator"
    },
    {
        id: "patient",
        label: "Patient Portal",
        desc: "My Timeline, Appointments & Reports",
        icon: FaUser,
        badge: "Patient View"
    }
];

function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        specialty: "",
        email: "doctor@careweave.com",
        password: "password123",
        role: "doctor",
        // Patient-specific registration fields
        age: "",
        gender: "",
        phone: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleSelect = (roleId) => {
        setFormData((prev) => ({
            ...prev,
            role: roleId,
            email: roleId === "doctor" ? "sarah@careweave.com" : roleId === "patient" ? "david@patient.com" : "soni@careweave.com"
        }));
    };

    const handleFillDemo = (roleType) => {
        if (roleType === "doctor") {
            setFormData({
                name: "Dr. Sarah Jenkins",
                specialty: "Cardiology",
                email: "sarah@careweave.com",
                password: "doctorpassword123",
                role: "doctor"
            });
        } else if (roleType === "patient") {
            setFormData({
                name: "David Miller",
                specialty: "",
                email: "david@patient.com",
                password: "patientpassword456",
                role: "patient"
            });
        } else if (roleType === "nurse") {
            setFormData({
                name: "Nurse Soni",
                specialty: "",
                email: "soni@careweave.com",
                password: "123456",
                role: "nurse"
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            if (isLogin) {
                const res = await api.loginUser(formData.email, formData.password, formData.role);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                setSuccessMsg("Authorization successful. Redirecting to workspace...");
                setTimeout(() => navigate("/dashboard"), 500);
            } else {
                const res = await api.registerUser(
                    formData.name,
                    formData.email,
                    formData.password,
                    formData.role,
                    formData.specialty,
                    // Patient-specific fields sent to backend
                    formData.role === "patient" ? parseInt(formData.age) || null : null,
                    formData.role === "patient" ? formData.gender || null : null,
                    formData.role === "patient" ? formData.phone || null : null
                );
                localStorage.setItem("user", JSON.stringify(res.data.user));
                setSuccessMsg("Account provisioned successfully! Loading portal...");
                setTimeout(() => navigate("/dashboard"), 700);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.detail || "Authentication failed. Please verify credentials.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page w-screen min-h-screen grid lg:grid-cols-12 bg-[#1a3b6e] text-[#1a1a2e] font-sans antialiased relative select-none overflow-hidden">
            
            {/* ================= LEFT COLUMN: ILLUSTRATION (6 Columns) ================= */}
            <div 
                className="hidden lg:flex lg:col-span-6 relative flex-col justify-between py-10 px-12 bg-white z-10 items-center overflow-hidden"
                style={{ clipPath: "polygon(0 0, 100% 0, 93% 30%, 98% 70%, 86% 100%, 0 100%)" }}
            >
                
                {/* Back Link */}
                <button
                    onClick={() => navigate("/")}
                    className="absolute left-8 top-8 text-slate-400 hover:text-slate-600 font-extrabold text-[11px] bg-transparent border-none cursor-pointer flex items-center gap-1 uppercase tracking-wider transition-colors z-20"
                >
                    &larr; back
                </button>

                <div className="my-auto flex flex-col items-center gap-5 max-w-[480px] text-center z-10">
                    <img 
                        src="/coordination_illustration.jpg" 
                        alt="Medical AI Coordination" 
                        className="w-full max-w-[420px] lg:max-w-[460px] object-contain transform hover:scale-102 transition-transform duration-300"
                    />
                    <div className="mt-1">
                        <h2 className="text-[#1a3b6e] text-lg font-black tracking-tight leading-tight m-0 mb-1.5">
                            Coordinated Healthcare Intelligence
                        </h2>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium m-0 max-w-sm">
                            Connecting Doctors, Nurses, and Patients with automated ambient SOAP transcription and clinical tracking.
                        </p>
                    </div>

                    {/* Stat Pills */}
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        {[
                            { value: "500+", label: "AI Notes / Day" },
                            { value: "3 Roles", label: "Doctor · Nurse · Patient" },
                            { value: "99.9%", label: "Uptime" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                                <span className="text-[#1a3b6e] font-black text-sm leading-tight">{stat.value}</span>
                                <span className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider mt-0.5">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Feature Highlights */}
                    <div className="flex flex-col gap-2 text-left w-full max-w-xs">
                        {[
                            "Ambient SOAP auto-transcription",
                            "Multi-agent clinical coordination",
                            "HIPAA compliant, end-to-end encrypted",
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600">
                                <span className="w-4 h-4 rounded-full bg-[#1a7f8e]/10 border border-[#1a7f8e]/30 flex items-center justify-center text-[#1a7f8e] shrink-0 text-[8px]">✓</span>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SVG Waves at the bottom */}
                <svg className="absolute bottom-0 left-0 w-full h-[140px] text-slate-100 fill-current z-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,192C672,171,768,149,864,160C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
                <svg className="absolute bottom-0 left-0 w-full h-[95px] text-[#1a7f8e]/10 fill-current z-0 opacity-60" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path d="M0,96L48,112C96,128,192,160,288,181.3C384,203,480,213,576,197.3C672,181,768,139,864,138.7C960,139,1056,181,1152,192C1248,203,1344,181,1392,171L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* ================= RIGHT COLUMN: MASTER LOGIN / REGISTER FORM (6 Columns) ================= */}
            <div className="col-span-12 lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#1a3b6e] relative overflow-y-auto">
                
                {/* Decorative glowing gradient backdrops */}
                <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#1a7f8e]/20 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

                <div className="w-full max-w-[440px] flex flex-col z-10">
                    
                    {/* Header */}
                    <div className="mb-6 text-left">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase m-0">
                            {isLogin ? "Sign In" : "Sign Up"}
                        </h2>
                        <p className="text-slate-300 text-xs font-semibold mt-1.5 m-0 uppercase tracking-wider">
                            {isLogin
                                ? "to access CareWeave coordination workspace"
                                : "to provision a new clinical identity"}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="w-full bg-[#10274c]/50 p-1 rounded-xl flex border border-white/5 mb-6 relative">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
                            className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-lg border-none cursor-pointer z-10 ${
                                isLogin ? "bg-amber-500 text-[#1a3b6e] shadow-md" : "text-slate-400 hover:text-white bg-transparent"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setErrorMsg(""); setSuccessMsg(""); }}
                            className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-lg border-none cursor-pointer z-10 ${
                                !isLogin ? "bg-amber-500 text-[#1a3b6e] shadow-md" : "text-slate-400 hover:text-white bg-transparent"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Feedback Messages */}
                    {errorMsg && (
                        <div className="mb-5 bg-red-955/40 text-red-200 text-xs font-bold p-3.5 rounded-xl border border-red-500/30 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-5 bg-emerald-955/40 text-emerald-200 text-xs font-bold p-3.5 rounded-xl border border-emerald-500/30 flex items-center gap-2">
                            <FaCheck className="text-emerald-400 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Role Selection Cards Grid */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2.5">
                            <label className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">
                                Select Access Role
                            </label>
                            {isLogin && (
                                <div className="flex items-center gap-2 text-[10px] font-bold text-teal-400">
                                    <span>Quick Fill:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleFillDemo("doctor")}
                                        className="hover:underline text-amber-300 cursor-pointer bg-transparent border-none p-0 font-bold"
                                    >
                                        Doctor
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => handleFillDemo("nurse")}
                                        className="hover:underline text-amber-300 cursor-pointer bg-transparent border-none p-0 font-bold"
                                    >
                                        Nurse
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => handleFillDemo("patient")}
                                        className="hover:underline text-amber-300 cursor-pointer bg-transparent border-none p-0 font-bold"
                                    >
                                        Patient
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {ROLE_OPTIONS.map((role) => {
                                const Icon = role.icon;
                                const isSelected = formData.role === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => handleRoleSelect(role.id)}
                                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-[#1a7f8e]/20 border-teal-400 text-white shadow-md scale-98"
                                                : "bg-[#10274c]/30 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-[#10274c]/50 hover:text-slate-200"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <Icon className={`text-sm ${isSelected ? "text-teal-400" : "text-slate-500"}`} />
                                            {isSelected && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-sm" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-extrabold leading-tight">
                                                {role.label.split("/")[0]}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-semibold leading-tight mt-0.5 line-clamp-1">
                                                {role.badge}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -6 }}
                                    animate={{ height: "auto", opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -6 }}
                                    className="flex flex-col gap-5 overflow-hidden"
                                >
                                    <div className="flex flex-col gap-1 text-left relative group">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder={formData.role === "doctor" ? "e.g. Dr. Sarah Jenkins" : "e.g. David Miller"}
                                            className="w-full bg-transparent border-t-0 border-r-0 border-l-0 border-b border-slate-500/60 focus:border-teal-400 py-2.5 text-white text-xs outline-none transition-all font-semibold"
                                        />
                                    </div>

                                    {formData.role === "doctor" && (
                                        <div className="flex flex-col gap-1 text-left relative group">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Specialty</label>
                                            <select
                                                name="specialty"
                                                value={formData.specialty}
                                                onChange={handleInputChange}
                                                className="w-full bg-transparent border-t-0 border-r-0 border-l-0 border-b border-slate-500/60 focus:border-teal-400 py-2.5 text-white text-xs outline-none transition-all font-semibold cursor-pointer appearance-none"
                                                required
                                            >
                                                <option value="" className="bg-[#1a3b6e] text-white">-- Select Specialty --</option>
                                                <option value="Cardiology" className="bg-[#1a3b6e] text-white">Cardiology</option>
                                                <option value="Dentist" className="bg-[#1a3b6e] text-white">Dentist (Dental Medicine)</option>
                                                <option value="Pediatrics" className="bg-[#1a3b6e] text-white">Pediatrics</option>
                                                <option value="Orthopedics" className="bg-[#1a3b6e] text-white">Orthopedics</option>
                                                <option value="Neurology" className="bg-[#1a3b6e] text-white">Neurology</option>
                                                <option value="Dermatology" className="bg-[#1a3b6e] text-white">Dermatology</option>
                                                <option value="General Medicine" className="bg-[#1a3b6e] text-white">General Medicine</option>
                                                <option value="Psychiatry" className="bg-[#1a3b6e] text-white">Psychiatry</option>
                                                <option value="Diagnosis" className="bg-[#1a3b6e] text-white">Diagnosis</option>
                                                <option value="General Surgery" className="bg-[#1a3b6e] text-white">General Surgery</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Patient-specific fields */}
                                    {formData.role === "patient" && (
                                        <div className="flex flex-col gap-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1 text-left">
                                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Age</label>
                                                    <input
                                                        type="number"
                                                        name="age"
                                                        required
                                                        min="1" max="120"
                                                        value={formData.age}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. 32"
                                                        className="w-full bg-transparent border-t-0 border-r-0 border-l-0 border-b border-slate-500/60 focus:border-teal-400 py-2.5 text-white text-xs outline-none transition-all font-semibold"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 text-left">
                                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gender</label>
                                                    <select
                                                        name="gender"
                                                        required
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-transparent border-t-0 border-r-0 border-l-0 border-b border-slate-500/60 focus:border-teal-400 py-2.5 text-white text-xs outline-none transition-all font-semibold cursor-pointer appearance-none"
                                                    >
                                                        <option value="" className="bg-[#1a3b6e] text-white">-- Select --</option>
                                                        <option value="Male" className="bg-[#1a3b6e] text-white">Male</option>
                                                        <option value="Female" className="bg-[#1a3b6e] text-white">Female</option>
                                                        <option value="Other" className="bg-[#1a3b6e] text-white">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 text-left">
                                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. 9876543210"
                                                    className="w-full bg-transparent border-t-0 border-r-0 border-l-0 border-b border-slate-500/60 focus:border-teal-400 py-2.5 text-white text-xs outline-none transition-all font-semibold"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email Input */}
                        <div className="flex flex-col gap-1 text-left relative group">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">E-Mail</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email address"
                                className="w-full bg-transparent border-t-0 border-r-0 border-l-0 border-b border-slate-500/60 focus:border-teal-400 py-2.5 text-white text-xs outline-none transition-all font-semibold"
                            />
                        </div>

                        {/* Password Input with Visibility Toggle */}
                        <div className="flex flex-col gap-1 text-left relative group">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••••••"
                                    className="w-full bg-transparent border-t-0 border-r-0 border-l-0 border-b border-slate-500/60 focus:border-teal-400 py-2.5 pr-10 text-white text-xs outline-none transition-all font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-1"
                                >
                                    {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-600 bg-transparent accent-amber-500 cursor-pointer" defaultChecked />
                                    <span>Remember credentials</span>
                                </label>
                                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                                    TLS 1.3 Secure
                                </span>
                            </div>
                        )}

                        {/* Submit Action Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-amber-500 hover:bg-amber-600 text-[#1a3b6e] font-extrabold w-full h-11 text-xs sm:text-sm rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4 transition-all disabled:opacity-50 active:scale-98"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin text-sm" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <FaKey className="text-xs" />
                                    <span>{isLogin ? `Sign In` : "Create Account"}</span>
                                    <FaArrowRight className="text-xs" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-4 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                            <FaShieldAlt className="text-emerald-400" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FaShieldAlt className="text-teal-400" />
                            <span>SOC-2 Verified</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FaUserMd className="text-amber-400" />
                            <span>MFA Ready</span>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-medium text-center mt-6">
                        &copy; 2026 CareWeave AI Health Network. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;