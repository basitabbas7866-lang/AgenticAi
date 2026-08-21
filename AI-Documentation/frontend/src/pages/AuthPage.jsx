import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
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
    const [transcriptText, setTranscriptText] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        specialty: "",
        email: "doctor@careweave.com",
        password: "password123",
        role: "doctor"
    });

    const cardRef = useRef(null);

    // 3D Card Tilt Effects
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

    function handleMouseMove(e) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
        const relativeY = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(relativeX);
        y.set(relativeY);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    // Typewriter Simulation for Clinical Stream
    useEffect(() => {
        const fullText = "Patient presents with a 3-day history of localized left lower quadrant abdominal pain, non-radiating, rated 6/10.";
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTranscriptText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                currentIndex = 0;
            }
        }, 55);
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleSelect = (roleId) => {
        setFormData((prev) => ({
            ...prev,
            role: roleId,
            email: roleId === "doctor" ? "sarah@careweave.com" : roleId === "patient" ? "david@patient.com" : "nurse@careweave.com"
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
                    formData.specialty
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
        <div className="auth-page w-screen min-h-screen grid lg:grid-cols-12 bg-[#f5f7fa] text-[#1a1a2e] font-sans antialiased relative select-none overflow-x-hidden">
            {/* Top Navigation Bar */}
            <div className="col-span-12 w-full bg-[#1a3b6e] text-white py-2.5 px-6 flex items-center justify-between border-b border-[#00909e]/30 z-20 shadow-sm">
                <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center gap-2.5 no-underline">
                    <img src="/logo.jpg" alt="CareWeave Logo" className="h-8 w-auto object-contain bg-white px-2 py-0.5 rounded shadow-sm" />
                    <span className="text-xs font-bold text-amber-300 hidden sm:inline">| Clinical Workstation &amp; Patient Portal</span>
                </a>
                <button
                    onClick={() => navigate("/")}
                    className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full transition-all border border-white/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                    &larr; Return to Home
                </button>
            </div>

            {/* ================= LEFT COLUMN: CLINICAL SHOWCASE (5 Columns) ================= */}
            <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between py-10 px-10 border-r border-slate-200 bg-white z-10">
                <div className="my-auto flex flex-col gap-6 max-w-[440px] text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#1a3b6e] text-[#e8a020] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider w-fit border border-amber-300/30">
                        <FaStethoscope className="text-amber-300" />
                        <span>{isLogin ? "Authorized Portal Access" : "Provision New Identity"}</span>
                    </div>

                    {/* Main Title & Subtitle */}
                    <div>
                        <h1 className="text-2xl xl:text-3xl font-extrabold text-[#1a3b6e] tracking-tight leading-tight m-0 mb-2">
                            {isLogin ? "Ambient AI Built for Modern Clinicians & Patients." : "Smarter Care Coordination. Zero Gaps."}
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium m-0">
                            {isLogin
                                ? "Access patient timelines, ambient SOAP transcription drafts, and multi-agent coordination monitors in real time."
                                : "Create role-based accounts for Doctors, Nurses, and Patients with HIPAA-compliant database encryption."}
                        </p>
                    </div>

                    {/* Live Capture Engine Demo Card */}
                    <div className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                <span className="text-xs text-[#1a3b6e] font-extrabold uppercase tracking-wider">Live Capture Stream</span>
                            </div>
                            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                                ACTIVE
                            </span>
                        </div>

                        {/* Transcript Display Box */}
                        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-inner flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0 mt-0.5">
                                <FaMicrophone className="text-sm animate-pulse" />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-extrabold text-[#1a7f8e] uppercase tracking-wider">Physician &amp; Patient Stream</span>
                                <p className="text-xs text-[#1a1a2e] font-mono leading-relaxed m-0 mt-0.5">
                                    {transcriptText}
                                    <span className="inline-block w-1.5 h-3 bg-[#1a7f8e] ml-1 animate-pulse" />
                                </p>
                            </div>
                        </div>

                        {/* SOAP Draft Ready Strip */}
                        <div className="bg-[#1a3b6e] text-white rounded-xl p-3 border border-[#1a7f8e]/30 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-amber-400 text-[#1a3b6e] flex items-center justify-center font-bold text-xs shrink-0">
                                    <FaFileMedical />
                                </div>
                                <div className="text-left">
                                    <span className="block text-xs font-bold text-white leading-tight">CC: LLQ Abdominal Pain (Acute)</span>
                                    <span className="block text-[10px] text-amber-200">SOAP Framework Auto-Generated</span>
                                </div>
                            </div>
                            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                                Ready
                            </span>
                        </div>
                    </div>

                    {/* Proof Points */}
                    <div className="space-y-2 text-left">
                        {[
                            "Multi-Agent Parallel Clinical Tracking Engine",
                            "Grounded Vector RAG with MedCPT Embeddings",
                            "Strict Human-in-the-Loop Clinical Action Governance"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-[#1a3b6e]">
                                <FaCheckCircle className="text-[#059669] text-sm shrink-0" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-xs text-slate-500 font-medium text-left">
                    &copy; 2026 CareWeave AI Health Network • HIPAA Encrypted.
                </div>
            </div>

            {/* ================= RIGHT COLUMN: MASTER LOGIN / REGISTER FORM (7 Columns) ================= */}
            <div className="col-span-12 lg:col-span-7 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-[#f5f7fa]">
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full max-w-[480px] bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 text-left z-10"
                >
                    {/* Header */}
                    <div className="mb-5 flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#1a3b6e] tracking-tight m-0">
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </h2>
                            <p className="text-slate-500 text-xs font-medium mt-1 m-0">
                                {isLogin
                                    ? "Select your role and enter credentials to sign in."
                                    : "Register your identity in the CareWeave database."}
                            </p>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="w-full bg-[#f1f5f9] p-1 rounded-xl flex border border-slate-200 mb-5 relative">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
                            className={`flex-1 py-2 text-xs font-extrabold transition-all rounded-lg border-none cursor-pointer z-10 ${
                                isLogin ? "bg-[#1a3b6e] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 bg-transparent"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setErrorMsg(""); setSuccessMsg(""); }}
                            className={`flex-1 py-2 text-xs font-extrabold transition-all rounded-lg border-none cursor-pointer z-10 ${
                                !isLogin ? "bg-[#1a3b6e] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 bg-transparent"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Feedback Messages */}
                    {errorMsg && (
                        <div className="mb-4 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-4 bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                            <FaCheck className="text-emerald-600 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Role Selection Cards Grid */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                                Select Access Role
                            </label>
                            {isLogin && (
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#1a7f8e]">
                                    <span>Quick Fill:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleFillDemo("doctor")}
                                        className="hover:underline text-[#1a3b6e] cursor-pointer bg-transparent border-none p-0 font-bold"
                                    >
                                        Doctor
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => handleFillDemo("patient")}
                                        className="hover:underline text-[#1a3b6e] cursor-pointer bg-transparent border-none p-0 font-bold"
                                    >
                                        Patient
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {ROLE_OPTIONS.map((role) => {
                                const Icon = role.icon;
                                const isSelected = formData.role === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => handleRoleSelect(role.id)}
                                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-[#1a7f8e]/10 border-[#1a7f8e] shadow-sm text-[#1a3b6e]"
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <Icon className={`text-sm ${isSelected ? "text-[#1a7f8e]" : "text-slate-400"}`} />
                                            {isSelected && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1a7f8e]" />
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -6 }}
                                    animate={{ height: "auto", opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -6 }}
                                    className="flex flex-col gap-3.5 overflow-hidden"
                                >
                                    <div className="relative group">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                                        <input
                                            type="text"
                                            name="name"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder={formData.role === "doctor" ? "Full Name, M.D." : "Full Name"}
                                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all font-semibold"
                                        />
                                    </div>

                                    {formData.role === "doctor" && (
                                        <div className="relative group">
                                            <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                                            <input
                                                type="text"
                                                name="specialty"
                                                value={formData.specialty}
                                                onChange={handleInputChange}
                                                placeholder="Medical Specialty (e.g. Cardiology)"
                                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all font-semibold"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email Input */}
                        <div className="relative group">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email Address"
                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all font-semibold"
                            />
                        </div>

                        {/* Password Input with Visibility Toggle */}
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Password"
                                className="w-full h-11 pl-11 pr-11 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all font-semibold"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
                            >
                                {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between text-xs pt-0.5">
                                <label className="flex items-center gap-2 text-slate-600 font-semibold cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 accent-[#1a3b6e] cursor-pointer" defaultChecked />
                                    <span>Remember credentials</span>
                                </label>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                    Encrypted via TLS 1.3
                                </span>
                            </div>
                        )}

                        {/* Submit Action Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-amber w-full h-11 text-xs sm:text-sm rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin text-sm" />
                                    <span>Verifying Identity...</span>
                                </>
                            ) : (
                                <>
                                    <FaKey className="text-xs" />
                                    <span>{isLogin ? `Sign In as ${formData.role.toUpperCase()}` : "Register to Database"}</span>
                                    <FaArrowRight className="text-xs" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Trust Indicators */}
                    <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-md border border-slate-200">
                            <FaShieldAlt className="text-[#059669]" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-md border border-slate-200">
                            <FaShieldAlt className="text-[#2196b6]" />
                            <span>SOC-2 Verified</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-md border border-slate-200">
                            <FaUserMd className="text-[#1a3b6e]" />
                            <span>MFA Ready</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default AuthPage;