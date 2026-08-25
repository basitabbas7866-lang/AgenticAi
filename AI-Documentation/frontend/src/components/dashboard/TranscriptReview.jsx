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
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorName = loggedInUser.name || "Dr. Sarah Jenkins";

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Left Column: Source Transcript Editor */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-6 flex flex-col gap-3 shadow-sm">
          <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider border-b border-slate-100 pb-2">
            Source Transcript Editor
          </span>
          <textarea
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            className="w-full h-80 p-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs outline-none focus:border-[#1a7f8e] focus:ring-2 focus:ring-[#1a7f8e]/20 transition-all font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Right Column: Aura Patient-Doctor dialogue bubbles */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-6 flex flex-col gap-3 shadow-sm">
          <span className="text-[#1a3b6e] text-xs font-extrabold uppercase tracking-wider border-b border-slate-100 pb-2">
            Patient-Doctor Dialogue Streams
          </span>
          <div className="w-full h-80 overflow-y-auto no-scrollbar flex flex-col gap-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
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
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs text-left ${
                        isDoc
                          ? "bg-[#1a3b6e] text-white rounded-tr-none shadow-sm"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                      }`}
                    >
                      <span className={`block text-[8px] font-extrabold uppercase tracking-wider mb-1 ${isDoc ? "text-amber-300" : "text-[#1a7f8e]"}`}>
                        {isDoc ? doctorName : (patient?.name || "Patient")}
                      </span>
                      <p className="font-mono m-0 leading-relaxed break-words">{bubble.text}</p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
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
            className="bg-gradient-to-r from-[#e8a020] to-[#f3b236] hover:from-[#d49018] hover:to-[#e8a020] text-[#1a3b6e] font-extrabold text-xs h-12 px-10 rounded-full border border-amber-300 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Continue to SOAP Generation</span>
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      )}
    </>
  );
}

export default TranscriptReview;
