import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  generateSoap, 
  finalizeReport,
  getPatient, 
  getPatients, 
  createPatient, 
  transcribeAudio 
} from "../api";
import { 
  FaArrowLeft, 
  FaRedo, 
  FaSave, 
  FaFilePdf, 
  FaNotesMedical, 
  FaUser, 
  FaPhone, 
  FaCalendarAlt, 
  FaVenusMars,
  FaFileAlt,
  FaSpinner,
  FaCheckCircle,
  FaWhatsapp,
  FaCheck,
  FaBrain,
  FaUserMd,
  FaRegFileAlt,
  FaArrowRight,
  FaMicrophone,
  FaStop,
  FaPause,
  FaPlay,
  FaGlobe,
  FaUsers,
  FaSearch,
  FaUserPlus,
  FaClipboardCheck
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

function SoapGenerationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve navigation state if redirected from dashboard
  const initialData = location.state || {};
  
  // 1. Patient States
  const [patient, setPatient] = useState(initialData.patient || null);
  const [patientIdInput, setPatientIdInput] = useState("");
  const [recentPatients, setRecentPatients] = useState([]);
  const [patientIntakeMode, setPatientIntakeMode] = useState("search");
  const [quickPatient, setQuickPatient] = useState({ name: "", age: "", gender: "", phone: "", address: "" });

  // 2. Transcription and Capture States
  const [conversation, setConversation] = useState(initialData.conversation || "");
  const [language, setLanguage] = useState(initialData.language || "en-IN");
  const [transcribing, setTranscribing] = useState(false);
  const [speakerData, setSpeakerData] = useState([]);
  
  // 3. Audio Recorder Hook
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioLevels,
    transcriptText,
    setTranscriptText,
    setAudioBlob,
    startRecording: triggerStartRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    formatTime
  } = useAudioRecorder();

  const startRecording = () => {
    if (!patient) {
      alert("Please select or register a patient first.");
      return;
    }
    triggerStartRecording(patient);
  };

  // 4. Note Generation States — multi-agent pipeline outputs
  const [soapText, setSoapText] = useState("");        // Agent 1: SOAP note (displayed)
  const [soapNote, setSoapNote] = useState("");         // Agent 1: raw soap stored
  const [clinicalInsights, setClinicalInsights] = useState(""); // Agent 2
  const [validationReport, setValidationReport] = useState(""); // Agent 3
  const [consultationId, setConsultationId] = useState(null);   // DB ID for finalize
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // 5. Doctor Review Input States
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [doctorPrescription, setDoctorPrescription] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  // 6. Finalized Consultation States
  const [finalReport, setFinalReport] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState("soap"); // soap | insights | validation | finalReport
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Fetch recent patients for Quick Search on mount
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const fetchId = loggedInUser.role === "doctor" ? loggedInUser.id : null;
    getPatients(fetchId)
      .then(r => {
        if (r.data && r.data.success && r.data.patients) {
          setRecentPatients(r.data.patients);
        }
      })
      .catch(err => console.error("Error fetching patients list:", err));
  }, []);

  // Set whatsapp number when patient is loaded
  useEffect(() => {
    if (patient) {
      setWhatsappNumber(patient.phone || "");
    }
  }, [patient]);

  // Audio wave visualizer state
  const [waveHistory, setWaveHistory] = useState(Array(80).fill(0.01));
  const audioLevelsRef = useRef(audioLevels);

  useEffect(() => {
    audioLevelsRef.current = audioLevels;
  }, [audioLevels]);

  useEffect(() => {
    if (!isRecording) {
      setWaveHistory(Array(80).fill(0.01));
      return;
    }
    if (isPaused) return;

    const interval = setInterval(() => {
      setWaveHistory(prev => {
        const next = [...prev.slice(1)];
        const currentLevels = audioLevelsRef.current || [];
        const avg = currentLevels.reduce((a, b) => a + b, 0) / (currentLevels.length || 1);
        const vol = Math.min(1.0, avg * 1.8);
        next.push(vol > 0.01 ? vol : 0.01);
        return next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Audio transcription handler
  const handleTranscribeAudio = async () => {
    if (!audioBlob) return;
    setTranscribing(true);
    try {
      const res = await transcribeAudio(audioBlob, patient?.patient_id || "", transcriptText);
      setLanguage(res.data.language || "en-IN");
      setSpeakerData(res.data.speakers || []);

      let formattedConversation = "";
      if (res.data.speakers?.length > 0) {
        res.data.speakers.forEach(s => {
          const speakerLabel = (s.speaker_id === 1 || String(s.speaker_id) === "1") ? "Doctor" : "Patient";
          formattedConversation += `${speakerLabel}: ${s.transcript}\n\n`;
        });
      } else {
        formattedConversation = res.data.transcript || "";
      }
      setConversation(formattedConversation);
    } catch (error) {
      console.error("Transcription failed:", error);
      alert("Failed to transcribe audio. You can type or paste the transcript directly.");
    } finally {
      setTranscribing(false);
    }
  };

  // SOAP Generation API trigger — runs 3-agent pipeline
  const fetchSoapNote = async () => {
    if (!conversation.trim()) {
      alert("Please capture or type a conversation first.");
      return;
    }
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 3000); // Each agent takes ~3s

    try {
      const res = await generateSoap(patient.patient_id, conversation);
      const data = res.data;

      // Store consultation ID for finalize step
      setConsultationId(data.consultation_id || null);

      // Store each agent output separately
      const soap = data.soap || "";
      const insights = data.insights || "";
      const validation = data.validation || "";

      setSoapNote(soap);
      setClinicalInsights(insights);
      setValidationReport(validation);

      // soapText is used for the parsed SOAP section display
      setSoapText(soap);
      setActiveOutputTab("soap");
    } catch (error) {
      console.error("SOAP note generation failed:", error);
      alert("Clinical note generation failed. Please check that the backend is running and Ollama medgemma:4b is active.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  // SOAP Note parser helper
  const parseSoapNote = (text) => {
    const result = {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      diagnosis: "",
      insights: "",
      predictions: "",
      historicalComparison: ""
    };
    if (!text) return result;

    const soapNoteBlock = text.match(/(?:SOAP Note:?)\s*\n*([\s\S]*?)(?=\n(?:Diagnosis Suggestions|Clinical Insights|Symptom Predictions|Historical Comparison)|$)/i);
    const diagnosisBlock = text.match(/(?:Diagnosis Suggestions:?)\s*\n*([\s\S]*?)(?=\n(?:SOAP Note|Clinical Insights|Symptom Predictions|Historical Comparison)|$)/i);
    const insightsBlock = text.match(/(?:Clinical Insights:?)\s*\n*([\s\S]*?)(?=\n(?:SOAP Note|Diagnosis Suggestions|Symptom Predictions|Historical Comparison)|$)/i);
    const predictionsBlock = text.match(/(?:Symptom Predictions:?)\s*\n*([\s\S]*?)(?=\n(?:SOAP Note|Diagnosis Suggestions|Clinical Insights|Historical Comparison)|$)/i);
    const historicalBlock = text.match(/(?:Historical Comparison:?)\s*\n*([\s\S]*?)(?=\n(?:SOAP Note|Diagnosis Suggestions|Clinical Insights|Symptom Predictions)|$)/i);

    const soapTextPart = soapNoteBlock ? soapNoteBlock[1].trim() : text;

    result.diagnosis = diagnosisBlock ? diagnosisBlock[1].trim() : "";
    result.insights = insightsBlock ? insightsBlock[1].trim() : "";
    result.predictions = predictionsBlock ? predictionsBlock[1].trim() : "";
    result.historicalComparison = historicalBlock ? historicalBlock[1].trim() : "";

    const sMatch = soapTextPart.match(/(?:^|\n)S:\s*\n?([\s\S]*?)(?=\nO:|\nA:|\nP:|$)/i);
    const oMatch = soapTextPart.match(/(?:^|\n)O:\s*\n?([\s\S]*?)(?=\nS:|\nA:|\nP:|$)/i);
    const aMatch = soapTextPart.match(/(?:^|\n)A:\s*\n?([\s\S]*?)(?=\nS:|\nO:|\nP:|$)/i);
    const pMatch = soapTextPart.match(/(?:^|\n)P:\s*\n?([\s\S]*?)(?=\nS:|\nO:|\nA:|$)/i);

    result.subjective = sMatch ? sMatch[1].trim() : "";
    result.objective = oMatch ? oMatch[1].trim() : "";
    result.assessment = aMatch ? aMatch[1].trim() : "";
    result.plan = pMatch ? pMatch[1].trim() : "";

    // Fallback split if regex fails
    if (!result.subjective && !result.objective && !result.assessment && !result.plan) {
      const lines = soapTextPart.split("\n");
      let activeSection = "";
      lines.forEach(line => {
        const lowerLine = line.toLowerCase().trim();
        if (lowerLine === "s:" || lowerLine.startsWith("s: ") || lowerLine.startsWith("subjective")) {
          activeSection = "subjective";
        } else if (lowerLine === "o:" || lowerLine.startsWith("o: ") || lowerLine.startsWith("objective")) {
          activeSection = "objective";
        } else if (lowerLine === "a:" || lowerLine.startsWith("a: ") || lowerLine.startsWith("assessment")) {
          activeSection = "assessment";
        } else if (lowerLine === "p:" || lowerLine.startsWith("p: ") || lowerLine.startsWith("plan")) {
          activeSection = "plan";
        } else if (activeSection) {
          result[activeSection] += line + "\n";
        }
      });
      result.subjective = result.subjective.trim();
      result.objective = result.objective.trim();
      result.assessment = result.assessment.trim();
      result.plan = result.plan.trim();
    }

    if (!result.subjective && !result.objective && !result.assessment && !result.plan) {
      result.subjective = soapTextPart;
    }

    return result;
  };

  const parsedSoap = parseSoapNote(soapText);

  // Pre-fill Doctor Review inputs when SOAP note is generated
  useEffect(() => {
    if (soapText) {
      const parsed = parseSoapNote(soapText);
      
      // Extract first diagnosis suggestion or assessment
      let diagSeed = "";
      if (parsed.diagnosis) {
        diagSeed = parsed.diagnosis.split("\n")[0].replace(/^\d+[.)]\s*/, "").replace(/\(Confidence:.*\)/i, "").trim();
      }
      if (!diagSeed && parsed.assessment) {
        diagSeed = parsed.assessment.replace(/^-\s*/, "").trim();
      }
      setFinalDiagnosis(diagSeed);

      // Seed prescription from Plan
      if (parsed.plan) {
        setDoctorPrescription(parsed.plan);
      }

      // Seed doctor notes from clinical insights
      if (parsed.insights) {
        setDoctorNotes(parsed.insights);
      }
    }
  }, [soapText]);

  // Handle final patient report compilation via /finalize-report
  const handleFinalizeReport = async () => {
    if (!soapText) {
      alert("No clinical SOAP note has been generated yet.");
      return;
    }
    if (!consultationId) {
      alert("No consultation session found. Please generate the clinical note first.");
      return;
    }
    setIsFinalizing(true);
    try {
      const res = await finalizeReport(
        consultationId,
        finalDiagnosis,
        doctorPrescription,
        doctorNotes
      );
      if (res.data && res.data.final_report) {
        setFinalReport(res.data.final_report);
        setActiveOutputTab("finalReport");
      }
    } catch (error) {
      console.error("Failed to finalize report via backend:", error);
      // Fallback local compilation
      const localReport = [
        "====================================",
        "CLARITYNOTE CLINICAL REPORT",
        "====================================",
        "",
        `Patient: ${patient?.name || "N/A"} | ID: ${patient?.patient_id || "N/A"}`,
        `Date: ${new Date().toLocaleDateString()}`,
        "",
        "==== SOAP NOTE ====",
        soapText,
        "",
        "==== FINAL DIAGNOSIS ====",
        finalDiagnosis || "Pending",
        "",
        "==== PRESCRIPTION ====",
        doctorPrescription || "N/A",
        "",
        "==== DOCTOR NOTES ====",
        doctorNotes || "N/A",
        "",
        "Doctor Validated ✔  |  AI Assisted ✔"
      ].join("\n");
      setFinalReport(localReport);
      setActiveOutputTab("finalReport");
    } finally {
      setIsFinalizing(false);
    }
  };

  // Patient Registry Search
  const handleSearchPatient = async () => {
    if (!patientIdInput.trim()) return;
    try {
      const res = await getPatient(patientIdInput);
      if (res.data && res.data.exists) {
        setPatient(res.data.patient);
        clearWorkspace();
      } else {
        alert("Patient chart not found. Register a new patient.");
      }
    } catch (err) {
      console.error("Error searching patient:", err);
    }
  };

  // Patient Registration
  const handleQuickRegister = async () => {
    if (!quickPatient.name || !quickPatient.age || !quickPatient.gender || !quickPatient.phone) {
      alert("Please fill all patient registration fields.");
      return;
    }
    try {
      const payload = {
        name: quickPatient.name,
        age: parseInt(quickPatient.age) || 0,
        gender: quickPatient.gender,
        phone: quickPatient.phone,
        address: quickPatient.address || "",
        assigned_doctor_id: JSON.parse(localStorage.getItem("user") || "{}").id || null
      };
      const res = await createPatient(payload);
      if (res.data && res.data.success) {
        const p = { ...payload, patient_id: res.data.patient_id, status: "PENDING" };
        setPatient(p);
        setShowCreateForm(false);
        setQuickPatient({ name: "", age: "", gender: "", phone: "", address: "" });
        clearWorkspace();
      }
    } catch (err) {
      console.error("Error creating patient:", err);
    }
  };

  const clearWorkspace = () => {
    setSoapText("");
    setSoapNote("");
    setClinicalInsights("");
    setValidationReport("");
    setConsultationId(null);
    setConversation("");
    setLanguage("en-IN");
    setFinalReport("");
    setDoctorPrescription("");
    setFinalDiagnosis("");
    setDoctorNotes("");
    setAudioBlob(null);
    setTranscriptText("");
    setActiveOutputTab("soap");
    setShowSaveSuccess(false);
    setWhatsappSent(false);
  };

  // Report saving / finalizing checklist
  const handleSaveSession = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowSaveSuccess(true);
    }, 1500);
  };

  const handleSendWhatsapp = () => {
    setSendingWhatsapp(true);
    setTimeout(() => {
      setSendingWhatsapp(false);
      setWhatsappSent(true);
    }, 1200);
  };

  // Clinical Markup Formatting Helpers
  const parseInlineMarkdown = (line) => {
    if (!line) return "";
    const boldParts = line.split(/\*\*/g);
    return boldParts.map((part, i) => {
      const isBold = i % 2 === 1;
      const parseItalicAndUnderline = (text) => {
        const italicParts = text.split(/\*/g);
        return italicParts.map((subpart, j) => {
          const isItalic = j % 2 === 1;
          const uParts = subpart.split(/<u>|<\/u>/g);
          const uElements = uParts.map((uPart, k) => {
            const isUnderline = k % 2 === 1;
            if (isUnderline) {
              return <u key={k}>{uPart}</u>;
            }
            return uPart;
          });
          if (isItalic) {
            return <em key={j}>{uElements}</em>;
          }
          return <span key={j}>{uElements}</span>;
        });
      };
      if (isBold) {
        return <strong key={i} className="text-[#1a3b6e] font-bold">{parseItalicAndUnderline(part)}</strong>;
      }
      return <span key={i}>{parseItalicAndUnderline(part)}</span>;
    });
  };

  const renderFormattedText = (text) => {
    if (!text || text.trim() === "" || text.trim().toLowerCase() === "not provided") {
      return <p className="text-slate-500 italic text-xs pl-1">Not provided</p>;
    }
    const lines = text.split("\n");
    return (
      <div className="flex flex-col gap-2 text-xs text-slate-700 font-sans leading-relaxed select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 mt-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1a7f8e]/10 text-[#1a7f8e] font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  {numMatch[1]}
                </span>
                <span className="text-slate-700">{parseInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }

          if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
            const content = trimmed.replace(/^[-*•]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a7f8e] shrink-0 mt-2" />
                <span className="text-slate-700">{parseInlineMarkdown(content)}</span>
              </div>
            );
          }
          return <p key={idx} className="m-0 pl-1 mt-1">{parseInlineMarkdown(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderDiagnosisSuggestions = (text) => {
    if (!text || text.trim() === "" || text.trim().toLowerCase() === "not provided") {
      return <p className="text-slate-500 italic text-xs pl-1">Not provided</p>;
    }
    const lines = text.split("\n");
    const parsedDiagnoses = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const scoreMatch = trimmed.match(/(0\.\d+|100%|\d{2}%)/);
      if (scoreMatch) {
        let name = trimmed
          .replace(/^\d+[.)]\s*/, "")
          .replace(/\(?(?:confidence|Confidence|Conf)?\s*[:\-]?\s*(0\.\d+|100%|\d{2}%)\)?/i, "")
          .replace(/[:-]/, "")
          .trim();
        let scoreStr = scoreMatch[1];
        let val = 0.50;
        if (scoreStr.includes("%")) {
          val = parseFloat(scoreStr) / 100;
        } else {
          val = parseFloat(scoreStr);
        }
        parsedDiagnoses.push({ name, confidence: val });
      } else {
        const cleanLine = trimmed.replace(/^\d+[.)]\s*/, "").trim();
        if (cleanLine.length > 2) {
          parsedDiagnoses.push({ name: cleanLine, confidence: 0.60 });
        }
      }
    });

    if (parsedDiagnoses.length === 0) {
      return renderFormattedText(text);
    }

    return (
      <div className="flex flex-col gap-2.5 mt-2 font-sans select-text">
        {parsedDiagnoses.map((diag, i) => {
          const percent = Math.round(diag.confidence * 100);
          const colorClass = percent >= 80 ? "bg-teal-500" : percent >= 60 ? "bg-sky-500" : "bg-amber-500";
          return (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700">{diag.name}</span>
                <span className="text-slate-500 font-mono text-[10px] font-bold">{percent}% confidence</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handlePrintFinalReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the clinical report.");
      return;
    }
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const docId = `PAT-${patient.patient_id}-${Date.now().toString().slice(-4)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PATIENT_CONSULTATION_REPORT_${patient.patient_id}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; padding: 30px; background: #ffffff; font-size: 11px; }
          .report-container { border: 2px solid #e2e8f0; border-radius: 12px; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 25px; }
          .title { font-size: 18px; font-weight: 800; color: #1a3b6e; text-transform: uppercase; }
          .meta-info { text-align: right; font-size: 10px; font-weight: bold; color: #475569; }
          .patient-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .patient-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 11px; }
          .label { font-weight: bold; background-color: #f8fafc; color: #475569; text-transform: uppercase; font-size: 9px; }
          .section { margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 20px; }
          .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1a3b6e; margin-bottom: 12px; letter-spacing: 0.05em; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; }
          .sig-line { border-top: 1.5px solid #0f172a; width: 200px; margin-top: 35px; padding-top: 5px; font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: right; }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div>
              <div class="title">ClarityNote AI Medical Consultation</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-weight: 500;">Consolidated Patient Care Summary & Prescription</div>
            </div>
            <div class="meta-info">
              <div>Ref ID: ${docId}</div>
              <div>Date: ${currentDate}</div>
            </div>
          </div>
          
          <table class="patient-table">
            <tr>
              <td class="label">Patient Name:</td>
              <td>${patient.name || "N/A"}</td>
              <td class="label">Patient ID:</td>
              <td>${patient.patient_id || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Age / Gender:</td>
              <td>${patient.age || "N/A"} Y / ${patient.gender || "N/A"}</td>
              <td class="label">Contact Phone:</td>
              <td>${patient.phone || "N/A"}</td>
            </tr>
          </table>

          <div class="section">
            <div class="section-title">1. Clinical Assessment / Diagnosis</div>
            <div style="white-space: pre-wrap; font-size: 11px; color: #334155;">- ${finalDiagnosis || "Diagnoses under evaluation."}</div>
          </div>

          <div class="section">
            <div class="section-title">2. Prescribed Treatment & Instructions</div>
            <div style="white-space: pre-wrap; font-size: 11px; color: #334155; font-family: monospace;">${doctorPrescription || "No special instructions."}</div>
          </div>

          <div class="section">
            <div class="section-title">3. Dietary & Lifestyle Advisory</div>
            <div style="white-space: pre-wrap; font-size: 11px; color: #334155;">${doctorNotes || "Follow standard physical activity guidelines."}</div>
          </div>

          <div class="footer">
            <div style="font-size: 8.5px; color: #64748b; max-width: 400px;">
              Disclaimer: This consolidated clinical report represents the approved consultation care plan and official prescription. Hand it over to the patient.
            </div>
            <div>
              <div class="sig-line">Attending Physician Signature</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#f5f7fa] text-stone-800 font-sans select-none text-left flex flex-col pb-12 soap-generation-page">
      
      {/* 1. Top Navbar Header */}
      <header className="w-full h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm font-sans">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => navigate("/dashboard")} 
            className="flex items-center no-underline tracking-tight cursor-pointer"
          >
            <img src="/logo.jpg" alt="CareWeave Logo" className="h-8 w-auto object-contain" />
          </div>
          <span className="text-slate-700 text-sm">|</span>
          <span className="text-xs text-teal-600 font-bold uppercase tracking-wider font-sans">ClarityNote AI Workspace</span>
        </div>

        <button 
          onClick={() => navigate("/dashboard")}
          className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-full cursor-pointer flex items-center gap-2 transition-all active:scale-95 font-sans"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Dashboard</span>
        </button>
      </header>

      {/* 2. Welcome Screen / Patient Selection Banner */}
      {!patient ? (
        <div className="w-full px-8 mt-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col lg:flex-row justify-between gap-8 shadow-sm relative overflow-hidden text-left font-sans">
            <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[200%] bg-[#1a7f8e]/[0.02] rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex-1 flex flex-col gap-4">
              <span className="text-[10px] text-teal-600 font-extrabold uppercase tracking-wider bg-teal-50 border border-teal-200 px-3 py-1 rounded-full w-max">
                AI-ASSISTED CONSULTATION DESK
              </span>
              <h1 className="text-[#1a3b6e] text-2xl lg:text-3xl font-extrabold tracking-tight max-w-xl">
                Turn doctor-patient conversations into structured clinical reports.
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-lg leading-relaxed font-medium">
                Record, transcribe, generate SOAP documentation, review clinical insights, and finalize the doctor-approved report in one focused workspace.
              </p>
              
              {/* Steps overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
                {[
                  { id: "1", label: "Patient profile" },
                  { id: "2", label: "Conversation Capture" },
                  { id: "3", label: "Run AI note" },
                  { id: "4", label: "Doctor review" }
                ].map(step => (
                  <div key={step.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                      {step.id}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Registry search card */}
            <div className="w-full lg:w-96 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] text-[#1a3b6e] font-extrabold uppercase tracking-wider">ACTIVE CONSULTATION</span>
                <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Draft Mode
                </span>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <p className="m-0 text-slate-500">Patient: <span className="text-[#1a3b6e] font-bold">None</span></p>
                <p className="m-0 text-slate-500 mt-1">Outputs: <span className="text-[#1a3b6e] font-bold">0/0</span></p>
              </div>

              {/* Toggle Search vs Register */}
              <div className="bg-slate-200/60 p-1 rounded-xl flex border border-slate-200/80 w-full mt-2">
                {["search", "create"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setPatientIntakeMode(mode);
                      setShowCreateForm(mode === "create");
                    }}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer border-none transition-all ${
                      patientIntakeMode === mode 
                        ? "bg-[#1a3b6e] text-white shadow-sm" 
                        : "text-slate-600 hover:text-slate-900 bg-transparent"
                    }`}
                  >
                    {mode === "search" ? "Search Patient" : "New Patient"}
                  </button>
                ))}
              </div>

              {patientIntakeMode === "search" ? (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input
                      placeholder="Patient ID (e.g. P1005)..."
                      value={patientIdInput}
                      onChange={(e) => setPatientIdInput(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                    <button
                      onClick={handleSearchPatient}
                      className="px-4 bg-[#1a3b6e] hover:bg-[#15305b] text-white font-bold text-xs rounded-lg border-none cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                    >
                      <FaSearch className="text-[10px]" />
                      <span>Search</span>
                    </button>
                  </div>
                  {recentPatients.length > 0 && (
                    <div className="mt-1 flex flex-col gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Recent Charts</span>
                      <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-0.5 no-scrollbar">
                        {recentPatients.slice(0, 4).map(p => (
                          <button
                            key={p.patient_id}
                            onClick={() => { setPatient(p); clearWorkspace(); }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-left hover:border-[#1a7f8e]/30 hover:bg-slate-100 transition-all cursor-pointer truncate active:scale-95"
                          >
                            <span className="block text-[6.5px] text-slate-400 font-bold uppercase tracking-wider leading-none">{p.patient_id}</span>
                            <span className="block text-[#1a3b6e] text-[10px] font-extrabold truncate mt-0.5 leading-none">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-left">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Full Name"
                      value={quickPatient.name}
                      onChange={(e) => setQuickPatient({ ...quickPatient, name: e.target.value })}
                      className="h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                    <input
                      placeholder="Age"
                      type="number"
                      value={quickPatient.age}
                      onChange={(e) => setQuickPatient({ ...quickPatient, age: e.target.value })}
                      className="h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={quickPatient.gender}
                      onChange={(e) => setQuickPatient({ ...quickPatient, gender: e.target.value })}
                      className="h-9 px-2 rounded-lg bg-white border border-slate-300 text-slate-600 text-xs outline-none focus:border-[#1a7f8e] font-bold"
                    >
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      placeholder="Mobile No"
                      value={quickPatient.phone}
                      onChange={(e) => setQuickPatient({ ...quickPatient, phone: e.target.value })}
                      className="h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs outline-none focus:border-[#1a7f8e] font-semibold"
                    />
                  </div>
                  <button
                    onClick={handleQuickRegister}
                    className="btn-pill btn-primary w-full h-9 text-[10px] rounded-lg mt-1"
                  >
                    <FaUserPlus className="text-xs" />
                    <span>Register &amp; Lock Chart</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Patient Profile active header banner */
        <div className="w-full px-8 mt-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-5 relative font-sans">
            
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 flex items-center justify-center text-[#1a7f8e] shrink-0">
                <FaUser className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[#1a3b6e] text-lg font-extrabold m-0 leading-none">{patient.name}</h1>
                  <span className="text-[9px] bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 px-2 py-0.5 rounded font-mono text-[#1a7f8e] font-extrabold uppercase tracking-wider">
                    {patient.patient_id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 mt-2 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-[#1a7f8e] text-[10px]" />
                    Age: {patient.age}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FaVenusMars className="text-[#1a7f8e] text-[10px]" />
                    Gender: {patient.gender}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FaPhone className="text-[#1a7f8e] text-[10px]" />
                    {patient.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick switcher / close actions */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 border border-slate-200 p-1 bg-slate-50 rounded-lg">
                <input
                  placeholder="Patient ID..."
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  className="w-24 h-7 px-2 rounded bg-white border border-slate-300 text-[10px] outline-none font-semibold"
                />
                <button
                  onClick={handleSearchPatient}
                  className="px-2 h-7 bg-[#1a3b6e] text-white font-bold text-[9px] rounded border-none cursor-pointer hover:bg-[#15305b]"
                >
                  Verify
                </button>
              </div>
              <button 
                onClick={() => { setPatient(null); clearWorkspace(); }}
                className="px-3 h-9 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95"
              >
                Release Chart
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. Main Console Workspace Columns (Only show when patient profile is active) */}
      {patient && (
        <main className="w-full px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          
          {/* LEFT COLUMN: STEP 1 - Conversation Capture (cols 7) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm text-left relative min-h-[540px]">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a7f8e]/10 text-[#1a7f8e] text-[10px] font-black flex items-center justify-center">1</span>
                  <h2 className="text-[#1a3b6e] text-xs font-black uppercase tracking-wider m-0">Conversation Capture</h2>
                </div>
                
                {/* Recording Time Info */}
                {(isRecording || isPaused) && (
                  <span className="text-xs font-bold font-mono text-[#1a3b6e] bg-[#1a7f8e]/5 border border-[#1a7f8e]/15 px-3 py-1 rounded-full">
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>

              {/* Recorder action controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${isRecording ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                    <FaMicrophone className={`text-sm ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-[#1a3b6e] text-xs font-bold leading-none">
                      {isRecording ? "Recording Dialogue..." : isPaused ? "Recording Paused" : "Start Consult Session"}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-none">Click to capture live consult conversation.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isRecording && !isPaused ? (
                    <button
                      onClick={startRecording}
                      className="btn-pill btn-primary py-1.5 px-4 text-[10px] rounded-lg shadow-sm"
                    >
                      <FaMicrophone />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <>
                      {isPaused ? (
                        <button
                          onClick={resumeRecording}
                          className="btn-pill btn-secondary py-1.5 px-3.5 text-[10px] rounded-lg"
                        >
                          <FaPlay className="text-[8px] text-[#1a7f8e]" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={pauseRecording}
                          className="btn-pill btn-secondary py-1.5 px-3.5 text-[10px] rounded-lg"
                        >
                          <FaPause className="text-[8px] text-amber-500" />
                          <span>Pause</span>
                        </button>
                      )}
                      <button
                        onClick={stopRecording}
                        className="btn-pill btn-danger py-1.5 px-3.5 text-[10px] rounded-lg"
                      >
                        <FaStop className="text-[8px]" />
                        <span>Stop</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Soundwave frequencies when recording */}
              {isRecording && (
                <div className="flex items-center justify-center gap-[2px] w-full h-11 bg-slate-50 border border-slate-100 rounded-lg px-3 overflow-hidden shadow-inner">
                  {waveHistory.map((val, idx) => {
                    const barHeight = Math.max(2, val * 36);
                    return (
                      <div
                        key={idx}
                        className="w-[2px] bg-[#1a7f8e] rounded-full shrink-0"
                        style={{ height: `${barHeight}px` }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Live speech output text feedback block */}
              {(isRecording || isPaused) && transcriptText && (
                <div className="p-3 bg-teal-50/30 border border-teal-100 rounded-xl text-left">
                  <span className="text-[9px] text-[#1a7f8e] font-black uppercase tracking-wider block mb-1">🎙️ Live Transcription Stream</span>
                  <p className="m-0 text-[#1a3b6e] text-xs font-semibold leading-relaxed max-h-16 overflow-y-auto no-scrollbar font-mono">
                    {transcriptText}
                  </p>
                </div>
              )}

              {/* Post processing transcribe CTA triggers */}
              {audioBlob && !isRecording && !isPaused && (
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleTranscribeAudio}
                    disabled={transcribing}
                    className="btn-pill btn-amber w-full h-10 text-[10px] rounded-lg shadow-sm"
                  >
                    {transcribing ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>Converting Dictation...</span>
                      </>
                    ) : (
                      <span>Convert To Text</span>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FaGlobe className="text-[10px]" />
                      Language: <span className="text-[#1a3b6e] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded">{language}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaUsers className="text-[10px]" />
                      Speakers: <span className="text-[#1a3b6e]">Auto-Separated</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Conversation Transcript Editor screen */}
              <div className="flex flex-col gap-1.5 flex-1 mt-1 text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Session Transcript stream</span>
                <textarea
                  value={conversation}
                  onChange={(e) => setConversation(e.target.value)}
                  placeholder="Clinical dialogue transcript streams will appear here. You can record audio above, or directly paste transcript lines manually."
                  className="w-full flex-1 min-h-[220px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs outline-none focus:border-[#1a7f8e] transition-all font-mono leading-relaxed resize-none select-text"
                />
              </div>

              {/* Generate SOAP Note CTA trigger button */}
              <button
                onClick={fetchSoapNote}
                disabled={loading || !conversation.trim()}
                className="btn-pill btn-primary w-full h-11 text-xs rounded-lg shadow-md mt-2 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Processing Session...</span>
                  </>
                ) : (
                  <>
                    <FaBrain className="text-xs" />
                    <span>Generate Clinical Note</span>
                  </>
                )}
              </button>

            </div>
          </section>

          {/* RIGHT COLUMN: STEP 3 - Doctor Review (cols 5) */}
          <section className="lg:col-span-5 flex flex-col gap-6 font-sans">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm text-left min-h-[540px]">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a7f8e]/10 text-[#1a7f8e] text-[10px] font-black flex items-center justify-center">3</span>
                  <h2 className="text-[#1a3b6e] text-xs font-black uppercase tracking-wider m-0">Doctor Review</h2>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 flex-1">
                {/* 1. Final Diagnosis suggestions */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Final Diagnosis</span>
                  <input
                    value={finalDiagnosis}
                    onChange={(e) => setFinalDiagnosis(e.target.value)}
                    placeholder="E.g. Localized scrotal fluid swelling / Hydrocele"
                    className="h-10 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold outline-none focus:border-[#1a7f8e] focus:bg-white transition-all select-text"
                  />
                </div>

                {/* 2. Custom Prescription Pad */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prescription</span>
                  <textarea
                    value={doctorPrescription}
                    onChange={(e) => setDoctorPrescription(e.target.value)}
                    placeholder="E.g.&#10;1. Tab. Paracetamol 650mg TDS for 3 days.&#10;2. Cold compresses and scrotal elevation support.&#10;3. Rest."
                    className="w-full h-44 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none focus:border-[#1a7f8e] focus:bg-white transition-all leading-relaxed font-mono resize-none select-text"
                  />
                </div>

                {/* 3. Doctor Notes */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Doctor Notes / Lifestyle Advice</span>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="E.g. Rest, take plenty of fluids, and check in scrotal ultrasound clinic in 3 days."
                    className="w-full h-24 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none focus:border-[#1a7f8e] focus:bg-white transition-all leading-relaxed resize-none select-text"
                  />
                </div>
              </div>

              {/* Finalize Button */}
              <button
                onClick={handleFinalizeReport}
                disabled={isFinalizing || !soapText}
                className="btn-pill btn-success w-full h-11 text-xs rounded-lg shadow-md mt-2 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Finalizing Care Plan...</span>
                  </>
                ) : (
                  <>
                    <FaClipboardCheck className="text-xs" />
                    <span>Finalize Report</span>
                  </>
                )}
              </button>

            </div>
          </section>

          {/* BOTTOM ROW: STEP 2 - Generated Clinical Output */}
          <section className="lg:col-span-12 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left min-h-[300px] relative font-sans">
              
              {/* Checklist progress loader overlay during SOAP note generation */}
              {loading && (
                <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-6 z-30 backdrop-blur-sm p-8 text-center animate-fadeIn">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-spin border-t-teal-500" />
                    <span className="text-teal-400 font-bold text-xs">AI</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[#1a3b6e] text-base font-black uppercase tracking-wider">Analyzing Conversation...</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Clinical pipeline agents are compiling the structured SOAP record.</p>
                  </div>
                  
                  <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 text-left">
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">✓</span>
                      <span className="text-slate-700 font-semibold">RAG Context Retrieved</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      {loadingStep >= 1 ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 animate-pulse" />
                      )}
                      <span className={loadingStep >= 1 ? "text-slate-700 font-semibold" : "text-slate-400"}>Agent 1: SOAP Note Generated</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      {loadingStep >= 2 ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-[#1a7f8e]/10 border border-[#1a7f8e]/20 animate-pulse" />
                      )}
                      <span className={loadingStep >= 2 ? "text-slate-700 font-semibold" : "text-slate-400"}>Agent 2: Clinical Insights Generated</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      {loadingStep >= 3 ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-amber-100 border border-amber-200 animate-pulse" />
                      )}
                      <span className={loadingStep >= 3 ? "text-slate-700 font-semibold" : "text-slate-400"}>Agent 3: Validation Report Ready</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Header Controls for generated outputs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a7f8e]/10 text-[#1a7f8e] text-[10px] font-black flex items-center justify-center">2</span>
                  <h2 className="text-[#1a3b6e] text-xs font-black uppercase tracking-wider m-0">Generated Clinical Output</h2>
                </div>

                {soapText && (
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setActiveOutputTab("soap")}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all ${
                        activeOutputTab === "soap"
                          ? "bg-[#1a3b6e] text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      SOAP Note
                    </button>
                    {clinicalInsights && (
                      <button
                        onClick={() => setActiveOutputTab("insights")}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all ${
                          activeOutputTab === "insights"
                            ? "bg-teal-700 text-white shadow-sm"
                            : "bg-teal-50 hover:bg-teal-100 text-teal-700"
                        }`}
                      >
                        AI Insights
                      </button>
                    )}
                    {validationReport && (
                      <button
                        onClick={() => setActiveOutputTab("validation")}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all ${
                          activeOutputTab === "validation"
                            ? "bg-amber-700 text-white shadow-sm"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-700"
                        }`}
                      >
                        Validation
                      </button>
                    )}
                    {finalReport && (
                      <button
                        onClick={() => setActiveOutputTab("finalReport")}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all ${
                          activeOutputTab === "finalReport"
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        Final Report
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Output Content display */}
              {!soapText ? (
                /* 1. Default empty state */
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-slate-400 text-center animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                    <FaRegFileAlt className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-slate-700 text-xs font-extrabold uppercase tracking-wider m-0">Ready for generated notes</h3>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm font-bold uppercase tracking-wider leading-relaxed">
                      SOAP notes, insights, validation checks, and final reports will appear here.
                    </p>
                  </div>
                </div>
              ) : activeOutputTab === "soap" ? (
                /* 2. SOAP Note bulleted block */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  
                  {/* Left: Bullet notes (Subjective, Objective, Assessment, Plan) */}
                  <div className="space-y-4 text-left border-r border-slate-100 pr-0 md:pr-6">
                    <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                      <FaNotesMedical className="text-[#1a7f8e] text-xs" />
                      <span className="text-[11px] font-black uppercase text-[#1a3b6e] tracking-wider">Bulleted SOAP Note Details</span>
                    </div>

                    <div className="space-y-3.5 select-text">
                      <div className="border-l-4 border-[#1a7f8e] pl-3">
                        <span className="text-[9px] text-[#1a7f8e] font-black uppercase tracking-wider block mb-1">Subjective (S)</span>
                        {renderFormattedText(parsedSoap.subjective)}
                      </div>
                      <div className="border-l-4 border-[#2b6cb0] pl-3">
                        <span className="text-[9px] text-[#2b6cb0] font-black uppercase tracking-wider block mb-1">Objective (O)</span>
                        {renderFormattedText(parsedSoap.objective)}
                      </div>
                      <div className="border-l-4 border-indigo-600 pl-3">
                        <span className="text-[9px] text-indigo-600 font-black uppercase tracking-wider block mb-1">Assessment (A)</span>
                        {renderFormattedText(parsedSoap.assessment)}
                      </div>
                      <div className="border-l-4 border-emerald-500 pl-3">
                        <span className="text-[9px] text-emerald-500 font-black uppercase tracking-wider block mb-1">Plan (P)</span>
                        {renderFormattedText(parsedSoap.plan)}
                      </div>
                    </div>
                  </div>
                  {/* Right: Full raw SOAP text */}
                  <div className="space-y-3 text-left">
                    <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                      <FaBrain className="text-[#1a7f8e] text-xs" />
                      <span className="text-[11px] font-black uppercase text-[#1a3b6e] tracking-wider">Full SOAP Output</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed select-text font-mono">
                      {soapText}
                    </div>
                  </div>

                </div>
              ) : activeOutputTab === "insights" ? (
                /* 3. AI Clinical Insights from Agent 2 */
                <div className="animate-fadeIn space-y-4">
                  <div className="flex items-center gap-2 border-b border-teal-100 pb-2">
                    <FaBrain className="text-teal-600 text-sm" />
                    <span className="text-[11px] font-black uppercase text-teal-700 tracking-wider">AI Clinical Insights</span>
                    <span className="ml-auto text-[9px] bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">Agent 2 Output</span>
                  </div>
                  <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-5 text-xs text-slate-700 leading-relaxed select-text">
                    {renderFormattedText(clinicalInsights)}
                  </div>
                </div>
              ) : activeOutputTab === "validation" ? (
                /* 4. Validation Report from Agent 3 */
                <div className="animate-fadeIn space-y-4">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                    <FaClipboardCheck className="text-amber-600 text-sm" />
                    <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">Validation Report</span>
                    <span className="ml-auto text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">Agent 3 Output</span>
                  </div>
                  <div className={`rounded-xl p-5 text-xs leading-relaxed select-text border ${
                    validationReport.toLowerCase().includes("pass")
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                      : "bg-amber-50/50 border-amber-200 text-amber-800"
                  }`}>
                    {renderFormattedText(validationReport)}
                  </div>
                </div>
              ) : (
                /* 5. Compiled Final Report output with Print & WhatsApp */
                <div className="flex flex-col gap-6 animate-fadeIn">
                  
                  {showSaveSuccess ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                        <FaCheck />
                      </div>
                      <div>
                        <h4 className="text-emerald-800 text-sm font-extrabold uppercase m-0">Consultation Session Logged Successfully</h4>
                        <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto leading-relaxed">
                          Report finalized, synced to patient journey history timelines, and active prescriptions locked.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <div>
                        <h4 className="text-[#1a3b6e] text-xs font-black uppercase m-0">Consolidated Patient Consultation Summary</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Ready for print verification or patient WhatsApp delivery.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrintFinalReport}
                          className="px-4 py-2 bg-[#1a3b6e] text-white hover:bg-[#15305b] font-bold text-xs rounded-full border-none cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                        >
                          <FaFilePdf />
                          <span>Print / Save PDF</span>
                        </button>
                        <button
                          onClick={handleSaveSession}
                          disabled={saving}
                          className="px-4 py-2 bg-gradient-to-r from-[#e8a020] to-[#f3b236] text-[#1a3b6e] font-extrabold text-xs rounded-full border border-amber-300 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                        >
                          {saving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave />}
                          <span>Sync to EHR</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Markdown Report Content display */}
                  <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-xl font-sans text-xs text-slate-700 shadow-sm leading-relaxed whitespace-pre-wrap select-text text-left">
                    {renderFormattedText(finalReport)}
                  </div>

                  {/* Share on WhatsApp simulated block */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#2eb37e]">
                        <FaWhatsapp className="text-lg" />
                      </div>
                      <div>
                        <h4 className="text-[#1a3b6e] text-xs font-bold leading-none">Share PDF via WhatsApp</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-none">Instant care instructions delivery to patient.</p>
                      </div>
                    </div>

                    {whatsappSent ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[#2eb37e] text-xs font-bold">
                        <FaCheckCircle className="text-sm shrink-0" />
                        <span>Clinical Summary PDF dispatched successfully to {whatsappNumber}</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="WhatsApp number (e.g. +91 81021 57190)"
                          className="w-56 h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:border-[#1a7f8e] focus:bg-white transition-all font-mono"
                        />
                        <button
                          onClick={handleSendWhatsapp}
                          disabled={sendingWhatsapp || !whatsappNumber}
                          className="px-4 h-9 bg-[#2eb37e] hover:bg-[#259b6c] text-white font-bold text-xs border-none rounded-lg cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          {sendingWhatsapp ? <FaSpinner className="animate-spin text-xs" /> : <FaWhatsapp />}
                          <span>Send PDF</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </section>

        </main>
      )}

    </div>
  );
}

export default SoapGenerationPage;
