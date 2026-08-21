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
    FaMicrophone,
    FaClipboardCheck
} from 'react-icons/fa';

function Sidebar({ activeTab = 'dashboard', setActiveTab, onClose }) {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Clinical Workspace', helper: 'Dictation & SOAP framework', icon: FaMicrophone },
        { id: 'patients', label: 'Patient Registry', helper: 'Search & register charts', icon: FaUsers },
        { id: 'journey', label: 'Care Journey', helper: 'Patient timeline & events', icon: FaHospital },
        { id: 'reports', label: 'Consultation Reports', helper: 'Review saved encounters', icon: FaRegFileAlt },
        { id: 'reviews', label: 'Review Queue', helper: 'Awaiting human decisions', icon: FaClipboardCheck },
        { id: 'profile', label: 'Practitioner Profile', helper: 'Clinic & compliance parameters', icon: FaCog }
    ];

    const handleTabClick = (tabId) => {
        if (setActiveTab) setActiveTab(tabId);
        if (onClose) onClose();
    };

    return (
        <aside className="w-full h-full flex flex-col justify-between py-4 px-3.5 bg-white border-r border-slate-200 text-[#1a1a2e] select-none font-sans antialiased shadow-sm relative">

            {/* TOP NAVIGATION CONTAINER */}
            <div className="flex flex-col gap-4">

                {/* Upper Branding Header bar */}
                <div className="flex items-center justify-between px-1">
                    <a
                        href="/"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/');
                        }}
                        className="flex items-center no-underline tracking-tight group"
                    >
                        <img src="/logo.jpg" alt="CareWeave Logo" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
                    </a>

                    {/* Close button on compact layouts */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="md:hidden p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                        >
                            <FaTimes className="text-[10px]" />
                        </button>
                    )}
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* INTERACTIVE NAVIGATION SUITE */}
                <nav className="flex flex-col gap-1 relative">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left bg-transparent cursor-pointer transition-all duration-300 outline-none border-none ${
                                    isActive ? 'text-[#1a7f8e] font-extrabold' : 'text-slate-600 hover:text-[#1a7f8e] hover:bg-[#1a7f8e]/10'
                                }`}
                            >
                                {/* Active Backdrop Pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="premiumActiveTabIndicator"
                                        className="absolute inset-0 rounded-xl bg-[#1a7f8e]/10 border border-[#1a7f8e]/15 z-0"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}

                                {/* Left Icon Core Frame */}
                                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 ${
                                    isActive
                                        ? 'bg-[#1a7f8e] text-white shadow-sm'
                                        : 'bg-slate-50 border border-slate-200 text-slate-500 group-hover:border-[#1a7f8e]/30 group-hover:bg-[#1a7f8e]/5 group-hover:text-[#1a7f8e] shadow-sm'
                                }`}>
                                    <Icon className="text-xs" />
                                </div>

                                {/* Text Layout Stack */}
                                <div className="relative z-10 min-w-0 flex-1">
                                    <span className={`block text-xs font-extrabold tracking-tight leading-tight transition-colors ${
                                        isActive ? 'text-[#1a7f8e]' : 'text-slate-600 group-hover:text-[#1a7f8e]'
                                    }`}>
                                        {item.label}
                                    </span>
                                    <span className={`block text-[10px] mt-0.5 truncate transition-colors ${
                                        isActive ? 'text-[#1a7f8e]/80' : 'text-slate-400 group-hover:text-[#1a7f8e]/80'
                                    }`}>
                                        {item.helper}
                                    </span>
                                </div>

                                {/* Active Right Track Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeRightTrackGlow"
                                        className="w-[2.5px] h-4 rounded-full bg-[#1a7f8e] ml-auto relative z-10 shadow-sm"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* LOWER COMPLIANCE & PRACTITIONER CARD LOCK */}
            <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3">

                {/* Core HIPAA Capsule Badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 justify-center cursor-default">
                    <FaShieldAlt className="text-emerald-600 text-[10px] shrink-0" />
                    <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider">
                        HIPAA Pipeline Secure
                    </span>
                </div>

                {/* Practitioner Interactive Widget Block */}
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors duration-200 hover:bg-slate-50 group select-none">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1a7f8e] font-black text-xs shrink-0 group-hover:border-[#1a7f8e]/30 transition-colors">
                        SJ
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs text-[#1a3b6e] font-extrabold truncate leading-none mb-1">
                            Dr. Sarah Jenkins
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                            <FaHospital className="text-[9px] text-[#1a7f8e] shrink-0" />
                            <span className="truncate">Metro General Hospital</span>
                        </div>
                    </div>
                </div>

                {/* Compact Terminal Exit Action Button */}
                <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 border border-slate-200 rounded-full cursor-pointer transition-all active:scale-95"
                >
                    <FaSignOutAlt className="text-xs shrink-0 opacity-80" />
                    <span>Exit Workstation</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;