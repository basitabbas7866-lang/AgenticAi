import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
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
    FaKey
} from "react-icons/fa";

function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transcriptText, setTranscriptText] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        specialty: "",
        email: "doctor@claritynote.com",
        password: "••••••••"
    });

    const cardRef = useRef(null);

    // Motion values to track mouse orientation for 3D card tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

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

    // Typewriter effect simulation for live transcript mockup
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
        }, 60);

        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            navigate("/dashboard");
        }, 800);
    };

    return (
        <div className="auth-page w-screen min-h-screen grid lg:grid-cols-12 bg-[#f5f7fa] text-[#1a1a2e] font-sans antialiased relative select-none overflow-x-hidden">
            {/* Top Navigation Bar */}
            <div className="col-span-12 w-full bg-[#1a3b6e] text-white py-2 px-6 flex items-center justify-between border-b border-[#00909e]/30 z-20">
                <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center gap-2 no-underline">
                    <img src="/logo.jpg" alt="CareWeave Logo" className="h-8 w-auto object-contain bg-white px-2 py-0.5 rounded" />
                    <span className="text-xs font-bold text-amber-300 hidden sm:inline">| Clinical Workstation Portal</span>
                </a>
                <button
                    onClick={() => navigate("/")}
                    className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full transition-all border border-white/20 cursor-pointer flex items-center gap-1.5"
                >
                    &larr; Back to Home
                </button>
            </div>

            {/* ================= LEFT COLUMN: CLINICAL SHOWCASE (5 Columns) ================= */}
            <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between py-10 px-10 border-r border-slate-200 bg-white z-10">
                <div className="my-auto flex flex-col gap-6 max-w-[440px] text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#1a3b6e] text-[#e8a020] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider w-fit border border-amber-300/30">
                        <FaStethoscope className="text-amber-300" />
                        <span>{isLogin ? "Practitioner Workstation" : "Clinician Onboarding"}</span>
                    </div>

                    {/* Main Title & Subtitle */}
                    <div>
                        <h1 className="text-2xl xl:text-3xl font-serif font-extrabold text-[#1a3b6e] tracking-tight leading-tight m-0 mb-2">
                            {isLogin ? "Ambient AI Built for Modern Clinicians." : "Smarter Charts. Less Screen Time."}
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium m-0">
                            {isLogin
                                ? "Rejoin thousands of physicians dictating accurate SOAP frameworks safely at the point of care."
                                : "Turn complex, multi-person medical dialogs into billing-ready charting drafts in under 45 seconds."}
                        </p>
                    </div>

                    {/* Live Capture Engine Demo Card (Clean High-Contrast White Box) */}
                    <div className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] p-4 shadow-md flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                <span className="text-xs text-[#1a3b6e] font-extrabold uppercase tracking-wider">Live Capture Engine</span>
                            </div>
                            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                                00:42 SEC
                            </span>
                        </div>

                        {/* Transcript Display Box */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-inner flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0 mt-0.5">
                                <FaMicrophone className="text-sm animate-pulse" />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-extrabold text-[#1a7f8e] uppercase tracking-wider">Doctor &amp; Patient Stream</span>
                                <p className="text-xs text-[#1a1a2e] font-mono leading-relaxed m-0 mt-0.5">
                                    {transcriptText}
                                    <span className="inline-block w-1.5 h-3 bg-[#1a7f8e] ml-1 animate-pulse" />
                                </p>
                            </div>
                        </div>

                        {/* SOAP Draft Ready Strip */}
                        <div className="bg-[#1a3b6e] text-white rounded-lg p-3 border border-[#1a7f8e]/30 flex items-center justify-between shadow-sm">
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
                            "98.4% Out-of-the-box Clinical Context Accuracy",
                            "Direct EHR Auto-Sync (Epic, Cerner, Athena)",
                            "Bank-Grade HIPAA Encrypted Tunnel Architecture"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-[#1a3b6e]">
                                <FaCheckCircle className="text-[#2eb37e] text-sm shrink-0" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-xs text-slate-500 font-medium text-left">
                    &copy; 2026 CareWeave AI Inc. • HIPAA Secured Health Network.
                </div>
            </div>

            {/* ================= RIGHT COLUMN: MASTER LOGIN / REGISTER FORM (7 Columns) ================= */}
            <div className="col-span-12 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative bg-[#f5f7fa]">
                {/* Master Elevated Login Card */}
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full max-w-[440px] bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 text-left z-10"
                >
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-serif font-extrabold text-[#1a3b6e] tracking-tight m-0">
                            {isLogin ? "Welcome Back" : "Create Practitioner Account"}
                        </h2>
                        <p className="text-slate-500 text-xs font-medium mt-1 m-0">
                            {isLogin
                                ? "Enter your clinical keys to access your workstation."
                                : "Provision an encrypted credentials layer within minutes."}
                        </p>
                    </div>

                    {/* Tab Switcher Capsule */}
                    <div className="w-full bg-[#f1f5f9] p-1 rounded-xl flex border border-slate-200 mb-6 relative">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-xs font-extrabold transition-all rounded-lg border-none cursor-pointer z-10 ${
                                isLogin ? "bg-[#1a3b6e] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 bg-transparent"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-xs font-extrabold transition-all rounded-lg border-none cursor-pointer z-10 ${
                                !isLogin ? "bg-[#1a3b6e] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 bg-transparent"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -8 }}
                                    animate={{ height: "auto", opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -8 }}
                                    className="flex flex-col gap-4 overflow-hidden"
                                >
                                    <div className="relative group">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                                        <input
                                            type="text"
                                            name="name"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Full Name, M.D."
                                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all placeholder:text-slate-400 font-semibold"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                                        <input
                                            type="text"
                                            name="specialty"
                                            required={!isLogin}
                                            value={formData.specialty}
                                            onChange={handleInputChange}
                                            placeholder="Medical Specialty (e.g., Pulmonology)"
                                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all placeholder:text-slate-400 font-semibold"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative group">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Clinical Email Address"
                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all placeholder:text-slate-400 font-semibold"
                            />
                        </div>

                        <div className="relative group">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a7f8e] text-sm z-10" />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Secure Password"
                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-300 text-[#1a1a2e] text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all placeholder:text-slate-400 font-semibold"
                            />
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 text-slate-600 font-semibold cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-[#1a3b6e] cursor-pointer" defaultChecked />
                                    <span>Remember me</span>
                                </label>
                                <a href="#forgot" className="text-[#1a7f8e] hover:text-[#1a3b6e] font-bold no-underline transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        {/* Yellow ORS-Style Action Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-gradient-to-r from-[#e8a020] to-[#f3b236] hover:from-[#d49018] hover:to-[#e8a020] text-[#1a3b6e] font-extrabold text-sm rounded-full shadow-md hover:shadow-lg transition-all border border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2 disabled:opacity-50"
                        >
                            <FaKey className="text-xs" />
                            <span>{isSubmitting ? "Verifying Keys..." : isLogin ? "Sign In to Workstation" : "Authorize Practitioner License"}</span>
                            <FaArrowRight className="text-xs" />
                        </button>
                    </form>

                    {/* Trust Indicators Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-md border border-slate-200">
                            <FaShieldAlt className="text-[#2eb37e]" />
                            <span>HIPAA Secure</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-md border border-slate-200">
                            <FaShieldAlt className="text-[#2196b6]" />
                            <span>SOC2 Type II</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-md border border-slate-200">
                            <FaUserMd className="text-[#1a3b6e]" />
                            <span>MFA Active</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default AuthPage;