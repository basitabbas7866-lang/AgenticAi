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
    FaClipboardCheck,
    FaUserMd,
    FaUser,
    FaStethoscope,
    FaVideo
} from 'react-icons/fa';

function Sidebar({ activeTab = 'dashboard', setActiveTab, onClose }) {
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const role = loggedInUser.role || 'doctor';
    const userName = loggedInUser.name || (role === 'patient' ? 'David Miller' : 'Dr. Sarah Jenkins');
    const userRoleText = loggedInUser.specialty || (role === 'patient' ? 'Patient Portal' : role === 'nurse' ? 'Clinical Nurse' : 'General Practitioner');

    // Get initials
    const initials = userName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CW';

    const menuItems = role === 'patient' ? [
        { id: 'teleconsult', label: 'Online Consultation', helper: 'Start video call with doctor', icon: FaVideo },
        { id: 'journey', label: 'My Medical History', helper: 'View my visits, tests & timeline', icon: FaHospital },
        { id: 'profile', label: 'My Profile & Records', helper: 'View personal details & vitals', icon: FaCog }
    ] : role === 'nurse' ? [
        { id: 'dashboard', label: 'Nurse Dashboard', helper: 'Track patient alerts & updates', icon: FaStethoscope },
        { id: 'patients', label: 'Patients Directory', helper: 'Find or add patient charts', icon: FaUsers },
        { id: 'journey', label: 'Patient Timeline', helper: 'Track visits, labs & history', icon: FaHospital },
        { id: 'reviews', label: 'Pending Approvals', helper: 'Review & approve AI suggestions', icon: FaClipboardCheck },
        { id: 'profile', label: 'My Profile & Settings', helper: 'Manage account & clinic info', icon: FaCog }
    ] : [ // doctor
        { id: 'dashboard', label: 'Create SOAP Note', helper: 'Generate SOAP from Audio/Text', icon: FaMicrophone },
        { id: 'teleconsult', label: 'Online Consultation', helper: 'Start video call with patient', icon: FaVideo },
        { id: 'patients', label: 'Patients Directory', helper: 'Find or add patient charts', icon: FaUsers },
        { id: 'journey', label: 'Patient Timeline', helper: 'Track visits, labs & history', icon: FaHospital },
        { id: 'reports', label: 'Saved Reports', helper: 'View completed patient notes', icon: FaRegFileAlt },
        { id: 'reviews', label: 'Pending Approvals', helper: 'Review & approve AI suggestions', icon: FaClipboardCheck },
        { id: 'profile', label: 'My Profile & Settings', helper: 'Manage account & clinic info', icon: FaCog }
    ];

    const handleTabClick = (tabId) => {
        if (setActiveTab) setActiveTab(tabId);
        if (onClose) onClose();
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/auth');
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
                                className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left bg-transparent cursor-pointer transition-all duration-200 outline-none border-none ${
                                    isActive ? 'text-[#1a7f8e] font-extrabold' : 'text-slate-600 hover:text-[#1a7f8e] hover:bg-[#1a7f8e]/10'
                                }`}
                            >
                                {/* Active Backdrop Pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="premiumActiveTabIndicator"
                                        className="absolute inset-0 rounded-xl bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 z-0"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}

                                {/* Left Icon Core Frame */}
                                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 relative z-10 transition-all duration-200 ${
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
                                </div>

                                {/* Active Right Indicator Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeRightTrackGlow"
                                        className="w-[3px] h-4 rounded-full bg-[#1a7f8e] ml-auto relative z-10 shadow-sm"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* LOWER COMPLIANCE & ACTIVE USER PROFILE CARD */}
            <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3">

                {/* Core HIPAA Capsule Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 justify-center cursor-default">
                    <FaShieldAlt className="text-emerald-600 text-[10px] shrink-0" />
                    <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider">
                        HIPAA Pipeline Active
                    </span>
                </div>

                {/* Dynamic User Profile Card */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50 transition-colors select-none">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a7f8e] to-[#1a3b6e] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs text-[#1a3b6e] font-extrabold truncate leading-tight mb-0.5">
                            {userName}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <span className="truncate">{userRoleText}</span>
                        </div>
                    </div>
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleLogout}
                    className="btn-pill btn-secondary w-full text-xs py-2 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                >
                    <FaSignOutAlt className="text-xs shrink-0 opacity-80" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;