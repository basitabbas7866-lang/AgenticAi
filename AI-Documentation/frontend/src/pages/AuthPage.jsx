import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, AnimatePresence } from "framer-motion";
import {
    FaShieldAlt,
    FaEnvelope,
    FaLock,
    FaUser,
    FaArrowRight,
    FaStethoscope,
    FaCheckCircle,
    FaMicrophone,
    FaFileMedical,
    FaHospital,
    FaUserMd
} from "react-icons/fa";

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const cardRef = useRef(null);
    const navigate = useNavigate();

    // Hover button state states to dynamically handle text background gradients inside Tailwind
    const [mainBtnHovered, setMainBtnHovered] = useState(false);

    // Form States
    const [formData, setFormData] = useState({ name: "", email: "", password: "", specialty: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Live Typing Simulation (Strict Mode safe)
    const [transcriptText, setTranscriptText] = useState("");
    const [resetTrigger, setResetTrigger] = useState(0);
    const indexRef = useRef(0);
    const fullTranscript = "Patient presents with a 3-day history of localized left lower quadrant abdominal pain, sharp, rated 6/10, worse after meals. Denies fever or chills...";

    useEffect(() => {
        indexRef.current = 0;
        setTranscriptText("");
        const timer = setInterval(() => {
            if (indexRef.current < fullTranscript.length) {
                const nextChar = fullTranscript.charAt(indexRef.current);
                setTranscriptText((prev) => prev + nextChar);
                indexRef.current++;
            } else {
                clearInterval(timer);
                setTimeout(() => {
                    setResetTrigger((prev) => prev + 1);
                }, 4000);
            }
        }, 40);

        return () => clearInterval(timer);
    }, [isLogin, resetTrigger]);

    // 3D Parallax Tracking
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

    function handleMouseMove(e) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            navigate("/dashboard");
        }, 1200);
    };

    const waveBars = [
        { delay: "0.1s", height: "12px" },
        { delay: "0.3s", height: "22px" },
        { delay: "0.5s", height: "32px" },
        { delay: "0.2s", height: "18px" },
        { delay: "0.4s", height: "26px" },
        { delay: "0.6s", height: "14px" },
        { delay: "0.1s", height: "28px" },
        { delay: "0.3s", height: "20px" }
    ];

    return (
        <div className="auth-page w-screen h-screen max-h-screen overflow-hidden grid lg:grid-cols-12 bg-[#030508]/80 backdrop-blur-md text-slate-100 font-sans antialiased relative select-none">

            {/* BACKGROUND GLOWS */}
            <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-indigo-500/[0.07] rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-cyan-500/[0.04] rounded-full blur-[110px] pointer-events-none z-0" />

            {/* ================= LEFT COLUMN: CONDENSED SIDEBAR SHOWCASE (42% Width) ================= */}
            <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between py-7 px-8 lg:pl-16 lg:pr-8 overflow-hidden border-r border-slate-900 bg-slate-950/20 backdrop-blur-3xl z-10 h-full max-h-screen">

                {/* Brand Identity */}
                <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center text-white no-underline tracking-tight group relative z-10 w-fit">
                    <div className="relative flex w-8.5 h-8.5 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-md group-hover:scale-105 transition-transform duration-300">
                        <span className="font-sans font-black text-white text-sm">C</span>
                        <div className="absolute inset-0.5 rounded-[10px] border border-white/20 pointer-events-none" />
                    </div>
                    <span className="tracking-wide font-bold ml-2.5 text-base text-white">
                        ClarityNote <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-medium">AI</span>
                    </span>
                </a>

                {/* Left Dynamic Marketing Content Cluster */}
                <div className="relative z-10 my-auto flex flex-col gap-4 max-w-[420px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? "login-copy" : "register-copy"}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-1.5"
                        >
                            <div className="inline-flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/15">
                                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                                {isLogin ? "Welcome Back Practitioner" : "Start Charting Freely"}
                            </div>
                            <h1 className="text-white text-xl xl:text-2xl font-black tracking-tight leading-tight m-0">
                                {isLogin ? "Ambient AI Built for Modern Clinicians." : "Smarter Charts. Less Screen Time."}
                            </h1>
                            <p className="text-slate-400 text-[11px] leading-relaxed font-medium m-0">
                                {isLogin
                                    ? "Rejoin thousands of physicians dictating accurate SOAP frameworks safely at the point of care."
                                    : "Turn complex, multi-person medical dialogs into billing-ready charting drafts in under 45 seconds."}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Tighter, Streamlined Live Capture Mockup */}
                    <div className="w-full rounded-xl border border-slate-900 bg-slate-950/50 p-3 shadow-xl backdrop-blur-2xl overflow-hidden flex flex-col gap-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-900/60">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Live Capture Engine</span>
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold bg-slate-900/80 px-2 py-0.5 rounded">00:42 SEC</div>
                        </div>

                        {/* Merged Waveform & Minimal Transcript to save vertical height */}
                        <div className="grid grid-cols-12 gap-2 items-center bg-slate-900/20 rounded-lg p-2 border border-slate-900/60 min-h-[56px]">
                            <div className="col-span-3 flex flex-col items-center justify-center border-r border-slate-900 pr-1">
                                <FaMicrophone className="text-indigo-400 text-[10px] mb-1 animate-pulse" />
                                <div className="flex items-center gap-0.5 h-4">
                                    {waveBars.slice(0, 4).map((bar, i) => (
                                        <div key={i} className="w-[2px] rounded-full bg-indigo-500/60 animate-pulse" style={{ height: `calc(${bar.height} * 0.4)` }} />
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-9 pl-1">
                                <p className="text-[10.5px] text-indigo-100/70 leading-normal font-mono m-0 line-clamp-2">
                                    {transcriptText}
                                    <span className="inline-block w-1 h-2.5 bg-cyan-400 ml-0.5 animate-pulse" />
                                </p>
                            </div>
                        </div>

                        {/* Condensed Generated SOAP Preview Row */}
                        <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6.5 h-6.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <FaFileMedical className="text-[10px]" />
                                </div>
                                <span className="text-[11px] text-slate-300 font-bold truncate">CC: LLQ abdominal pain acute</span>
                            </div>
                            <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase shrink-0">Ready</span>
                        </div>
                    </div>

                    {/* Compact Bullet Proof-Points */}
                    <div className="space-y-1">
                        {[
                            "98.4% Out-of-the-box Clinical Context Accuracy",
                            "Direct EHR Auto-Sync (Epic, Cerner, Athena)",
                            "Bank-Grade HIPAA Encrypted Tunnel Architecture"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                <FaCheckCircle className="text-emerald-500/80 text-xs shrink-0" />
                                <span className="truncate">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-[9px] text-slate-600 font-medium">
                    &copy; 2026 ClarityNote AI Inc. Secure HIPAA Pipeline Node.
                </div>
            </div>

            {/* ================= RIGHT COLUMN: PREMIUM AUTH WORKSTATION SCREEN (58% Width) ================= */}
            <div className="col-span-12 lg:col-span-7 flex flex-col items-center p-6 justify-between relative h-full max-h-screen z-10">

                {/* Top Back Action Toolbar */}
                <div className="w-full max-w-[420px] flex justify-between items-center lg:justify-end">
                    <div className="lg:hidden">
                        <a href="/" className="flex items-center no-underline text-white font-bold text-sm">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center mr-2 text-white font-black text-xs">C</div>
                            <span className="font-sans tracking-tight font-black text-xs">ClarityNote <span className="text-indigo-400 font-medium">AI</span></span>
                        </a>
                    </div>

                    {/* TAILWIND UIVERSE ADAPTATION 1: Back Button styled cleanly using translucent parameters */}
                    <a
                        href="/"
                        onClick={(e) => { e.preventDefault(); navigate("/"); }}
                        className="text-slate-400 hover:text-white transition-all duration-300 text-xs font-bold no-underline flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-900 bg-slate-950/40 backdrop-blur-md hover:border-slate-800"
                    >
                        &larr; Back
                    </a>
                </div>

                {/* Master Interactive 3D Login/Registration Card Frame */}
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-[420px] p-6 rounded-2xl border border-slate-900/60 bg-slate-950/25 backdrop-blur-2xl shadow-2xl z-10 my-auto"
                >
                    <motion.div
                        style={{
                            background: useMotionTemplate`radial-gradient(350px circle at ${glareX} ${glareY}, rgba(99,102,241,0.06), transparent 80%)`
                        }}
                        className="absolute inset-0 pointer-events-none z-30 mix-blend-screen rounded-2xl"
                    />

                    {/* Form Context Headers */}
                    <div className="flex flex-col mb-4 text-left" style={{ transform: "translateZ(30px)" }}>
                        <h2 className="text-white font-black text-lg tracking-tight m-0 leading-tight">
                            {isLogin ? "Welcome Back" : "Register License"}
                        </h2>
                        <p className="text-slate-400 font-medium text-xs mt-1 m-0">
                            {isLogin ? "Enter your clinical keys to access your workstation." : "Provision an encrypted credentials layer within minutes."}
                        </p>
                    </div>

                    {/* Custom Sliding Tab Switcher Capsule */}
                    <div className="w-full bg-slate-950/80 p-1 rounded-xl flex relative border border-slate-900/60 mb-4" style={{ transform: "translateZ(20px)" }}>
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`relative z-10 flex-1 py-1.5 text-xs font-bold transition-colors duration-200 rounded-md border-none cursor-pointer bg-transparent ${isLogin ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`relative z-10 flex-1 py-1.5 text-xs font-bold transition-colors duration-200 rounded-md border-none cursor-pointer bg-transparent ${!isLogin ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            Create Account
                        </button>
                        <motion.div
                            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-gradient-to-r from-slate-900 to-slate-800 border border-white/[0.04] rounded-md shadow-md pointer-events-none z-0"
                            animate={{ x: isLogin ? 0 : "100%" }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                    </div>

                    {/* Main Form Fields */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5" style={{ transform: "translateZ(20px)" }}>
                        <AnimatePresence mode="popLayout" initial={false}>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -8 }}
                                    animate={{ height: "auto", opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col gap-2.5 overflow-hidden"
                                >
                                    <div className="relative group">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-xs z-10" />
                                        <input
                                            type="text"
                                            name="name"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Full Name, M.D."
                                            className="w-full h-9.5 pl-11 pr-4 rounded-lg bg-slate-950/40 border border-slate-900 text-white text-xs outline-none focus:border-indigo-500/40 focus:bg-slate-950/60 transition-all placeholder-slate-600 font-medium"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-xs z-10" />
                                        <input
                                            type="text"
                                            name="specialty"
                                            required={!isLogin}
                                            value={formData.specialty}
                                            onChange={handleInputChange}
                                            placeholder="Specialty (e.g., Pulmonology)"
                                            className="w-full h-9.5 pl-11 pr-4 rounded-lg bg-slate-950/40 border border-slate-900 text-white text-xs outline-none focus:border-indigo-500/40 focus:bg-slate-950/60 transition-all placeholder-slate-600 font-medium"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative group">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-xs z-10" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Clinical Email Address"
                                className="w-full h-9.5 pl-11 pr-4 rounded-lg bg-slate-950/40 border border-slate-900 text-white text-xs outline-none focus:border-indigo-500/40 focus:bg-slate-950/60 transition-all placeholder-slate-600 font-medium"
                            />
                        </div>

                        <div className="relative group">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-xs z-10" />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Secure Password"
                                className="w-full h-9.5 pl-11 pr-4 rounded-lg bg-slate-950/40 border border-slate-900 text-white text-xs outline-none focus:border-indigo-500/40 focus:bg-slate-950/60 transition-all placeholder-slate-600 font-medium"
                            />
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between mt-0.5">
                                <label className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold cursor-pointer group">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-900 bg-slate-950 text-indigo-500 focus:ring-0 accent-indigo-500 cursor-pointer transition-colors" />
                                    <span className="group-hover:text-slate-400 transition-colors">Remember me</span>
                                </label>
                                <a href="#forgot" className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors font-bold no-underline">Forgot password?</a>
                            </div>
                        )}

                        {/* ================= TAILWIND ADAPTATION: MUHAMMADHASANN'S UIVERSE SPARKLE BUTTON ================= */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            onMouseEnter={() => setMainBtnHovered(true)}
                            onMouseLeave={() => setMainBtnHovered(false)}
                            className="group/uiverse relative flex items-center justify-center gap-2 w-full h-11 mt-2 rounded-full border-none cursor-pointer overflow-visible select-none bg-transparent transition-transform duration-300 active:scale-100 lg:hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Inner Border Rotation Animation Frame (.dots_border) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+2px)] h-[calc(100%+2px)] overflow-hidden rounded-full z-[-10] bg-transparent">
                                <div className="absolute top-[30%] left-1/2 w-full h-8 bg-white origin-left -translate-x-1/2 -translate-y-1/2 rotate-0 animate-[rotate_2s_linear_infinite] [mask:linear-gradient(transparent_0%,white_120%)]" />
                            </div>

                            {/* Base Background Solid Mask Structure (::before) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#1f1f1f] rounded-full z-0 transition-all duration-300
                                [box-shadow:inset_0_0.5px_hsl(0,0%,100%),inset_0_-1px_2px_0_hsl(0,0%,0%)]
                                group-hover/uiverse:[box-shadow:inset_0_0.5px_hsl(0,0%,100%),inset_0_-1px_2px_0_hsl(0,0%,0%),0_0_0_0.375rem_rgba(99,102,241,0.75)]
                                shadow-[0_4px_10px_-4px_rgba(0,0,0,1)] group-hover/uiverse:shadow-[0_4px_10px_-4px_rgba(0,0,0,0)]"
                            />

                            {/* Hover Space Mesh Gradient Display (::after) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full z-[2] transition-opacity duration-300 bg-[rgba(99,102,241,0.75)] pointer-events-none opacity-0 group-hover/uiverse:opacity-100
                                bg-[radial-gradient(at_51%_89%,#bda7f9_0px,transparent_50%),radial-gradient(at_100%_100%,#8d74d8_0px,transparent_50%),radial-gradient(at_22%_91%,#8d74d8_0px,transparent_50%)] bg-top"
                            />

                            {/* SVG Custom Sparkle Cluster */}
                            <svg className="relative z-10 w-7 h-7 text-white fill-current stroke-current" viewBox="0 0 24 24">
                                <path
                                    className="origin-center text-white fill-white transition-transform duration-300 group-hover/uiverse:animate-[path_1.5s_linear_0.5s_infinite]"
                                    style={{ "--scale_path_1": "1.2" }}
                                    d="M12,2 L13.5,8.5 L20,10 L13.5,11.5 L12,18 L10.5,11.5 L4,10 L10.5,8.5 Z"
                                />
                            </svg>

                            {/* Dynamic Text Fill Layer (.text_button) */}
                            <span
                                className="relative z-10 text-sm font-bold bg-clip-text text-transparent transition-all duration-300"
                                style={{
                                    backgroundImage: mainBtnHovered
                                        ? "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 120%)"
                                        : "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 120%)"
                                }}
                            >
                                {isSubmitting ? "Verifying Keys..." : isLogin ? "Sign In to Workstation" : "Authorize License"}
                            </span>
                        </button>
                    </form>

                    {/* Secondary SSO Split Divider */}
                    <div className="relative flex py-2 items-center" style={{ transform: "translateZ(10px)" }}>
                        <div className="flex-grow border-t border-slate-900/60" />
                        <span className="flex-shrink mx-2 text-[9px] text-slate-600 font-bold uppercase tracking-wider">or enterprise identity</span>
                        <div className="flex-grow border-t border-slate-900/60" />
                    </div>



                    {/* Compact Trust Indicators */}
                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-center gap-x-4 text-[9px] text-slate-500 font-bold tracking-wider uppercase text-center" style={{ transform: "translateZ(15px)" }}>
                        <div className="flex items-center gap-1"><FaShieldAlt className="text-emerald-500 text-[10px]" /><span>HIPAA Secure</span></div>
                        <div className="flex items-center gap-1"><FaShieldAlt className="text-cyan-500 text-[10px]" /><span>SOC2 Type II</span></div>
                        <div className="flex items-center gap-1"><FaUserMd className="text-indigo-500 text-[10px]" /><span>MFA Active</span></div>
                    </div>
                </motion.div>

                {/* Structural spacer for clean viewport distribution balance */}
                <div className="w-full h-2 hidden lg:block" />
            </div>

            {/* Injected custom CSS frames for pure rotation tracking */}
            <style>{`
                @keyframes rotate {
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes path {
                    0%, 34%, 71%, 100% { transform: scale(1); }
                    17% { transform: scale(1.2); }
                    49% { transform: scale(1.2); }
                    83% { transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}

export default AuthPage;