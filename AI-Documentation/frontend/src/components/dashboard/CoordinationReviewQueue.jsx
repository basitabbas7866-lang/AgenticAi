import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaClipboardCheck, 
    FaCheck, 
    FaTimes, 
    FaSpinner, 
    FaSyncAlt, 
    FaExclamationTriangle,
    FaInfoCircle,
    FaUserShield,
    FaHistory
} from 'react-icons/fa';
import { getReviews, takeReviewAction, syncReviews } from '../../api';

function CoordinationReviewQueue() {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actioning, setActioning] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [comments, setComments] = useState({}); // Stores comment per review ID
    const [reviewerName, setReviewerName] = useState(loggedInUser.name || 'Dr. Sarah Jenkins');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await getReviews();
            setReviews(res.data || []);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncReviews();
            await fetchReviews();
        } catch (err) {
            console.error('Failed to sync reviews:', err);
        } finally {
            setSyncing(false);
        }
    };

    const handleAction = async (reviewId, decision) => {
        const comment = comments[reviewId] || '';
        if (!reviewerName.trim()) {
            alert('Please specify a reviewer name.');
            return;
        }
        setActioning(true);
        try {
            await takeReviewAction(reviewId, decision, reviewerName, comment);
            // Clear comment for this review
            setComments(prev => {
                const copy = { ...prev };
                delete copy[reviewId];
                return copy;
            });
            await fetchReviews();
        } catch (err) {
            console.error('Failed to apply decision:', err);
            alert('Error applying decision: ' + (err.response?.data?.detail || err.message));
        } finally {
            setActioning(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const pendingReviews = reviews.filter(r => r.status === 'PENDING');
    const processedReviews = reviews.filter(r => r.status !== 'PENDING');

    const getSeverityColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'critical': return 'bg-red-50 text-red-600 border-red-200';
            case 'high': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="w-full space-y-8 select-none text-left">
            {/* Header controls section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-[#1a3b6e] text-lg font-extrabold m-0 flex items-center gap-2">
                        <FaClipboardCheck className="text-[#1a7f8e]" />
                        Human-in-the-Loop Coordination Review Queue
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                        Review and authorize AI-generated actions before they are executed in the clinical workflow.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
                            Reviewer Signature
                        </label>
                        <input
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none w-48 font-bold"
                            placeholder="Reviewer Name"
                        />
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="btn-3d btn-3d-secondary px-3 py-2 text-xs flex items-center gap-2 mt-4 cursor-pointer"
                    >
                        <FaSyncAlt className={syncing ? 'animate-spin' : ''} />
                        <span>Sync Queue</span>
                    </button>
                </div>
            </div>

            {/* Awaiting human review section */}
            <div className="space-y-4">
                <h3 className="text-[#1a3b6e] text-sm font-extrabold m-0 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    Awaiting Human Review ({pendingReviews.length})
                </h3>

                {loading ? (
                    <div className="flex justify-center items-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <FaSpinner className="animate-spin text-2xl text-[#1a7f8e]" />
                    </div>
                ) : pendingReviews.length === 0 ? (
                    <div className="bg-slate-50/50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-400 text-xs">
                        <FaCheck className="mx-auto text-xl text-emerald-500 mb-2" />
                        No pending actions waiting for human review. Run a patient analysis or click Sync.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {pendingReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                layoutId={`review-card-${review.id}`}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200"
                            >
                                {/* 📋 SECTION 1: VERIFIED PATIENT DATA */}
                                <div className="p-5 flex flex-col justify-between bg-slate-50/50">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                                            Verified Patient Data
                                        </span>
                                        <h4 className="text-[#1a3b6e] text-sm font-black m-0">{review.patient_name}</h4>
                                        <span className="text-[10px] font-mono font-bold text-[#1a7f8e] uppercase block mt-0.5">
                                            ID: {review.patient_id}
                                        </span>
                                    </div>
                                    <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                                        <div>
                                            <strong className="text-slate-400 font-extrabold uppercase text-[9px] block">Trigger Evidence</strong>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 text-slate-700 mt-1 inline-block">
                                                {review.supporting_evidence}
                                            </span>
                                        </div>
                                        <div>
                                            <strong className="text-slate-400 font-extrabold uppercase text-[9px] block">Source Records</strong>
                                            <span className="font-mono text-[10px] font-bold text-slate-700">{review.source_records}</span>
                                        </div>
                                        <div>
                                            <strong className="text-slate-400 font-extrabold uppercase text-[9px] block">Responsible Agent</strong>
                                            <span className="text-[10px] font-bold text-slate-700">{review.agent_responsible}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getSeverityColor(review.importance_level)}`}>
                                            {review.importance_level} Risk
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {new Date(review.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                {/* 🤖 SECTION 2: AI PROPOSAL */}
                                <div className="p-5 flex flex-col justify-between md:col-span-1 bg-white">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                                            AI Proposed Action
                                        </span>
                                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 mt-2">
                                            <p className="text-slate-700 text-xs font-bold leading-relaxed">
                                                {review.proposed_action}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <strong className="text-slate-400 font-extrabold uppercase text-[9px] block">AI Decision Reason</strong>
                                        <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                                            {review.reason}
                                        </p>
                                    </div>
                                </div>

                                {/* ⚖️ SECTION 3: HUMAN DECISION */}
                                <div className="p-5 flex flex-col justify-between bg-slate-50/30">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">
                                            Human Action Decision
                                        </span>
                                        <textarea
                                            value={comments[review.id] || ''}
                                            onChange={(e) => setComments(prev => ({ ...prev, [review.id]: e.target.value }))}
                                            placeholder="Write clinical justification or comments..."
                                            className="w-full h-24 p-2.5 text-xs rounded-xl border border-slate-200 outline-none resize-none focus:border-[#1a7f8e]/40"
                                        />
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <button
                                            onClick={() => handleAction(review.id, 'APPROVED')}
                                            disabled={actioning}
                                            className="btn-3d btn-3d-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 border-emerald-700 hover:bg-emerald-700 active:bg-emerald-800"
                                            style={{ backgroundColor: '#059669', borderColor: '#047857' }}
                                        >
                                            <FaCheck />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleAction(review.id, 'REJECTED')}
                                            disabled={actioning}
                                            className="btn-3d btn-3d-danger flex-1 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <FaTimes />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Audit History & Processed Decisions */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
                <h3 className="text-[#1a3b6e] text-sm font-extrabold m-0 uppercase tracking-wider flex items-center gap-2">
                    <FaHistory className="text-slate-400" />
                    Audit Trail & Processed Decisions ({processedReviews.length})
                </h3>

                {processedReviews.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                        No audit history logged. Complete reviews to build the audit trail.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {processedReviews.map((review) => (
                            <div 
                                key={review.id}
                                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                            >
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                            review.status === 'APPROVED' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                : 'bg-red-50 text-red-600 border-red-200'
                                        }`}>
                                            {review.status}
                                        </span>
                                        <h4 className="text-[#1a3b6e] text-xs font-extrabold">
                                            {review.patient_name} <span className="text-slate-400 font-normal">({review.patient_id})</span>
                                        </h4>
                                    </div>
                                    <p className="text-slate-700 text-xs font-semibold leading-relaxed mt-1">
                                        <strong className="text-slate-400 text-[9px] uppercase tracking-wider mr-1 block sm:inline">Original AI Proposal:</strong>
                                        "{review.original_ai_proposal}"
                                    </p>
                                    {review.reviewer_comment && (
                                        <p className="text-slate-500 text-xs italic bg-slate-50 p-2 rounded-lg border border-slate-200/40 mt-1">
                                            <strong className="text-slate-400 text-[9px] uppercase tracking-wider mr-1 not-italic block sm:inline">Reviewer Note:</strong>
                                            "{review.reviewer_comment}"
                                        </p>
                                    )}
                                </div>
                                <div className="text-left md:text-right shrink-0 text-[10px] text-slate-400 font-bold space-y-1">
                                    <div className="flex items-center md:justify-end gap-1 text-[#1a3b6e]">
                                        <FaUserShield className="text-[9px] text-[#1a7f8e]" />
                                        <span>Reviewer: {review.reviewer || 'N/A'}</span>
                                    </div>
                                    <div>Processed: {new Date(review.decision_timestamp).toLocaleDateString()} at {new Date(review.decision_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CoordinationReviewQueue;
