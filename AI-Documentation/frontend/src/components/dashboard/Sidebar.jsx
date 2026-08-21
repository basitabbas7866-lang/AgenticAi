import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaUsers,
    FaRegFileAlt,
    FaCog,
    FaSignOutAlt,
    FaHospital,
    FaShieldAlt,
    FaTimes,
    FaMicrophone
} from 'react-icons/fa';

function Sidebar({ activeTab = 'dashboard', setActiveTab, onClose }) {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Clinical Workspace', helper: 'Dictation & SOAP framework', icon: FaMicrophone },
        { id: 'patients', label: 'Patient Registry', helper: 'Search & register charts', icon: FaUsers },
        { id: 'journey', label: 'Care Journey', helper: 'Patient timeline & events', icon: FaHospital },
        { id: 'reports', label: 'Consultation Reports', helper: 'Review saved encounters', icon: FaRegFileAlt },
        { id: 'profile', label: 'Practitioner Profile', helper: 'Clinic & compliance parameters', icon: FaCog }
    ];

    const handleTabClick = (tabId) => {
        if (setActiveTab) setActiveTab(tabId);
        if (onClose) onClose();
    };

    return (
        <aside className="w-full h-full flex flex-col justify-between py-3 px-3.5 bg-[#0a0f1d]/90 backdrop-blur-xl border-r border-[#1e2d4a] text-slate-200 select-none font-sans antialiased shadow-lg relative grid-overlay">

            {/* TOP RETAINER TRACK */}
            <div className="flex flex-col gap-3.5">

                {/* Upper Branding Header bar */}
                <div className="flex items-center justify-between px-1.5 pt-0.5">
                    <a
                        href="/"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/');
                        }}
                        className="flex items-center text-white no-underline tracking-tight group"
                    >
                        <div className="relative flex w-8 h-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-500/10 group-hover:scale-102 transition-transform duration-300">
                            <span className="font-sans font-black text-white text-xs tracking-tighter">C</span>
                            <div className="absolute inset-0 rounded-lg border border-white/10" />
                        </div>

                        <span className="tracking-tight font-extrabold ml-2.5 text-sm text-slate-100 group-hover:text-white transition-colors">
                            ClarityNote <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-medium">AI</span>
                        </span>
                    </a>

                    {/* Close button on compact layouts */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="md:hidden p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white cursor-pointer transition-colors"
                        >
                            <FaTimes className="text-[10px]" />
                        </button>
                    )}
                </div>

                {/* HIGH VISIBILITY CENTERED 3D SEPARATOR */}
                <div className="w-[92%] mx-auto flex flex-col my-1 relative">
                    {/* Upper deep shadow line */}
                    <div className="w-full h-[1px] bg-slate-950 shadow-[0_-1px_0_rgba(0,0,0,0.8)]" />
                    {/* Lower light reflection highlights line */}
                    <div className="w-full h-[1px] bg-slate-800/30 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />
                </div>

                {/* INTERACTIVE NAVIGATION SUITE */}
                <nav className="flex flex-col gap-1 mt-0.5 relative">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left bg-transparent cursor-pointer transition-all duration-300 outline-none border-none ${isActive ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {/* Active Backdrop Shared Layout Pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="premiumActiveTabIndicator"
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/[0.07] to-indigo-500/[0.02] z-0"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}

                                {/* Left Mini-Icon Core Frame */}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 ${isActive
                                    ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/10'
                                    : 'bg-slate-950/40 border border-slate-900/40 text-slate-500 group-hover:text-slate-400'
                                    }`}>
                                    <Icon className="text-xs" />
                                </div>

                                {/* Text Layout Stack */}
                                <div className="relative z-10 min-w-0 flex-1">
                                    <span className="block text-xs font-bold tracking-tight leading-tight transition-colors">
                                        {item.label}
                                    </span>
                                    <span className={`block text-[10px] mt-0.5 truncate transition-colors ${isActive ? 'text-sky-400/50' : 'text-slate-500 group-hover:text-slate-400/60'
                                        }`}>
                                        {item.helper}
                                    </span>
                                </div>

                                {/* Micro-Glow Track Trace on Right Side */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeRightTrackGlow"
                                        className="w-[2px] h-4 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500 ml-auto relative z-10 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* LOWER COMPLIANCE & PRACTITIONER CARD LOCK */}
            <div className="flex flex-col gap-2.5 border-t border-slate-900/80 pt-2.5">

                {/* Core HIPAA Capsule Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] justify-center cursor-default animate-glow-pulse">
                    <FaShieldAlt className="text-emerald-500/80 text-[10px] shrink-0" />
                    <span className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest">
                        HIPAA Pipeline Secure
                    </span>
                </div>

                {/* Practitioner Interactive Widget Block */}
                <div className="flex items-center gap-2.5 px-1.5 py-1 rounded-xl transition-colors duration-200 hover:bg-slate-950/20 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 group-hover:border-indigo-500/20 transition-colors">
                        SJ
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-200 font-bold truncate leading-none mb-1 group-hover:text-white transition-colors">
                            Dr. Sarah Jenkins
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                            <FaHospital className="text-[9px] text-slate-600 shrink-0" />
                            <span className="truncate">Metro General Hospital</span>
                        </div>
                    </div>
                </div>

                {/* Compact Terminal Exit Action Button */}
                <button
                    onClick={() => navigate('/auth')}
                    className="btn-3d-secondary flex items-center justify-center gap-2 w-full py-2 text-[11px] font-bold hover:bg-rose-950/25 hover:border-rose-500/20 active:translate-y-[2px]"
                >
                    <FaSignOutAlt className="text-xs shrink-0 opacity-80" />
                    <span>Exit Workstation</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;