import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function TranscriptReview({
  patient,
  recentPatients,
  conversation,
  setConversation,
  language,
  transcribing,
  speakerData
}) {
  const navigate = useNavigate();

  if (!conversation.trim() && !transcribing) return null;

  const chatBubbles = (() => {
    if (speakerData?.length > 0) {
      return speakerData.map(s => ({
        speaker: s.speaker_id === "1" || s.speaker_id === 1 ? "doctor" : "patient",
        text: s.transcript
      }));
    }
    if (!conversation.trim()) return [];
    return conversation.split("\n").filter(l => l.trim().length > 0).map(line => {
      const isDoc = line.toLowerCase().startsWith("speaker 1:") ||
                    line.toLowerCase().startsWith("doctor:") ||
                    line.toLowerCase().startsWith("clinician:") ||
                    line.toLowerCase().startsWith("dr.");
      return {
        speaker: isDoc ? "doctor" : "patient",
        text: line.replace(/^(?:speaker \d+|doctor|patient|clinician|dr\.\s+\w+):/i, "").trim()
      };
    });
  })();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-5 lg:col-span-6 flex flex-col gap-3 shadow-xl">
          <span className="text-white text-xs font-black uppercase tracking-wider border-b border-[#1e2d4a]/60 pb-2">
            Source Transcript Editor
          </span>
          <textarea
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            className="w-full h-80 p-3.5 rounded-xl bg-[#0c1322] border border-[#1e2d4a] text-slate-300 text-xs outline-none focus:border-teal-500/30 transition-all font-mono resize-none leading-relaxed"
          />
        </div>

        <div className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-5 lg:col-span-6 flex flex-col gap-3 shadow-xl bg-[#0c1322]/10">
          <span className="text-white text-xs font-black uppercase tracking-wider border-b border-[#1e2d4a]/60 pb-2">
            Aura Patient-Doctor dialogue
          </span>
          <div className="w-full h-80 overflow-y-auto no-scrollbar flex flex-col gap-3.5 p-1.5 bg-[#0c1322]/20 border border-[#1e2d4a] rounded-xl">
            {chatBubbles.length > 0 ? (
              chatBubbles.map((bubble, i) => {
                const isDoc = bubble.speaker === "doctor";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${isDoc ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[20px] px-4 py-2.5 text-xs ${
                        isDoc
                          ? "bg-teal-600 text-white rounded-tr-none shadow-[0_3px_6px_rgba(20,184,166,0.15)]"
                          : "bg-[#27354f] text-slate-200 rounded-tl-none shadow-[0_3px_6px_rgba(0,0,0,0.1)]"
                      }`}
                    >
                      <span className="block text-[8px] font-bold uppercase tracking-wider mb-1 opacity-75">
                        {isDoc ? "Dr. Sarah Jenkins" : "Patient"}
                      </span>
                      <p className="font-mono m-0 leading-relaxed break-words">{bubble.text}</p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                <span className="text-[10px] font-bold uppercase tracking-wider">Dialogue Bubbles Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {conversation.trim().length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() =>
              navigate("/soap-generation", {
                state: { patient: patient || recentPatients[0], conversation, language }
              })
            }
            className="btn-3d-primary flex items-center justify-center gap-2.5 h-12 px-10 text-xs font-bold text-white shadow-xl transition-all"
          >
            <span>Continue to SOAP Generation</span>
            <FaArrowRight className="text-[10px] transition-transform duration-300 hover:translate-x-1" />
          </button>
        </div>
      )}
    </>
  );
}

export default TranscriptReview;
