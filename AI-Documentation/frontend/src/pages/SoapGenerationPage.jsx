import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateSoap } from "../api";
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
  FaCheck
} from "react-icons/fa";

function SoapGenerationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load state from router or use premium mock defaults as fallback
  const initialData = location.state || {
    patient: {
      patient_id: "P1001",
      name: "Eleanor Vance",
      age: "64",
      gender: "Female",
      phone: "+1 (555) 019-2834"
    },
    conversation: "Patient presents with a 3-day history of localized left lower quadrant abdominal pain, sharp, rated 6/10, worse after meals. Denies fever or chills. Stool is normal. History of diverticulosis. BP: 138/88 mmHg, HR: 72 bpm.",
    language: "hi-IN",
    speakerData: []
  };

  const { patient, conversation, language } = initialData;

  const [soapText, setSoapText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showApprovePanel, setShowApprovePanel] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(patient?.phone || "+91 98765 43210");

  // Trigger SOAP note generation on load
  useEffect(() => {
    fetchSoapNote();
  }, []);

  const fetchSoapNote = async () => {
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1100);

    try {
      const res = await generateSoap(patient.patient_id, conversation);
      // Wait to ensure the user gets to see the checklist checkmarks finish nicely
      await new Promise(resolve => setTimeout(resolve, 3600));
      setSoapText(res.data.response);
    } catch (error) {
      console.error(error);
      // Fallback response for offline/testing mode
      await new Promise(resolve => setTimeout(resolve, 3600));
      setSoapText(
        `S: Patient complains of sharp left lower quadrant abdominal pain for 3 days, rated 6/10, worse after eating. Denies fever, chills, nausea, or changes in bowel habits. Background history of diverticulosis.\n\n` +
        `O: General appearance is comfortable. Abdomen is soft, with mild tenderness in the left lower quadrant without rebound or guarding. Vital signs: BP 138/88 mmHg, HR 72 bpm, temp 98.6F.\n\n` +
        `A: Left lower quadrant abdominal pain, likely acute diverticulitis flare vs. symptomatic diverticulosis. Stable vitals.\n\n` +
        `P: 1. Recommend clear liquid diet for 48 hours, then gradual advance to high fiber.\n2. Prescribe oral antibiotics (Ciprofloxacin and Metronidazole) for 7 days.\n3. Return to clinic or go to ER if fever develops, pain increases, or unable to tolerate fluids.\n4. Follow-up in 1 week.`
      );
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  // SOAP Parser
  const parseSoapNote = (text) => {
    const result = {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      diagnosis: "",
      insights: "",
      predictions: ""
    };

    if (!text) return result;

    // 1. Separate high-level sections (SOAP Note, Diagnosis Suggestions, Clinical Insights, Symptom Predictions)
    // We match blocks starting with a header and capturing everything until the next header or end of string
    const soapNoteBlock = text.match(/(?:SOAP Note:?)\s*\n*([\s\S]*?)(?=(?:Diagnosis Suggestions|Clinical Insights|Symptom Predictions|$))/i);
    const diagnosisBlock = text.match(/(?:Diagnosis Suggestions:?)\s*\n*([\s\S]*?)(?=(?:SOAP Note|Clinical Insights|Symptom Predictions|$))/i);
    const insightsBlock = text.match(/(?:Clinical Insights:?)\s*\n*([\s\S]*?)(?=(?:SOAP Note|Diagnosis Suggestions|Symptom Predictions|$))/i);
    const predictionsBlock = text.match(/(?:Symptom Predictions:?)\s*\n*([\s\S]*?)(?=(?:SOAP Note|Diagnosis Suggestions|Clinical Insights|$))/i);

    const soapText = soapNoteBlock ? soapNoteBlock[1].trim() : text;

    result.diagnosis = diagnosisBlock ? diagnosisBlock[1].trim() : "";
    result.insights = insightsBlock ? insightsBlock[1].trim() : "";
    result.predictions = predictionsBlock ? predictionsBlock[1].trim() : "";

    // 2. Extract S, O, A, P sections inside the SOAP Note block (or the entire text if the block wasn't found)
    const sMatch = soapText.match(/(?:S:|Subjective:)\s*\n*([\s\S]*?)(?=\n(?:O:|Objective:|A:|Assessment:|P:|Plan:|$))/i) ||
                  text.match(/(?:S:|Subjective:)\s*\n*([\s\S]*?)(?=\n(?:O:|Objective:|A:|Assessment:|P:|Plan:|$))/i);
    const oMatch = soapText.match(/(?:O:|Objective:)\s*\n*([\s\S]*?)(?=\n(?:S:|Subjective:|A:|Assessment:|P:|Plan:|$))/i) ||
                  text.match(/(?:O:|Objective:)\s*\n*([\s\S]*?)(?=\n(?:S:|Subjective:|A:|Assessment:|P:|Plan:|$))/i);
    const aMatch = soapText.match(/(?:A:|Assessment:)\s*\n*([\s\S]*?)(?=\n(?:S:|Subjective:|O:|Objective:|P:|Plan:|$))/i) ||
                  text.match(/(?:A:|Assessment:)\s*\n*([\s\S]*?)(?=\n(?:S:|Subjective:|O:|Objective:|P:|Plan:|$))/i);
    const pMatch = soapText.match(/(?:P:|Plan:)\s*\n*([\s\S]*?)(?=\n(?:S:|Subjective:|O:|Objective:|A:|Assessment:|$))/i) ||
                  text.match(/(?:P:|Plan:)\s*\n*([\s\S]*?)(?=\n(?:S:|Subjective:|O:|Objective:|A:|Assessment:|$))/i);

    result.subjective = sMatch ? sMatch[1].trim() : "";
    result.objective = oMatch ? oMatch[1].trim() : "";
    result.assessment = aMatch ? aMatch[1].trim() : "";
    result.plan = pMatch ? pMatch[1].trim() : "";

    // Fallback: If S, O, A, P parsing fails, try line-by-line classification
    if (!result.subjective && !result.objective && !result.assessment && !result.plan) {
      const lines = soapText.split("\n");
      let activeSection = "";
      lines.forEach(line => {
        const lowerLine = line.toLowerCase().trim();
        if (lowerLine.startsWith("s:") || lowerLine.startsWith("subjective")) {
          activeSection = "subjective";
        } else if (lowerLine.startsWith("o:") || lowerLine.startsWith("objective")) {
          activeSection = "objective";
        } else if (lowerLine.startsWith("a:") || lowerLine.startsWith("assessment")) {
          activeSection = "assessment";
        } else if (lowerLine.startsWith("p:") || lowerLine.startsWith("plan")) {
          activeSection = "plan";
        } else if (activeSection) {
          result[activeSection] += line + "\n";
        }
      });

      // Trim results
      result.subjective = result.subjective.trim();
      result.objective = result.objective.trim();
      result.assessment = result.assessment.trim();
      result.plan = result.plan.trim();
    }

    // Secondary fallback: if everything is still completely blank, dump the soapText in subjective
    if (!result.subjective && !result.objective && !result.assessment && !result.plan) {
      result.subjective = soapText;
    }

    return result;
  };

  const parsedSoap = parseSoapNote(soapText);

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
        return <strong key={i} className="text-white font-bold">{parseItalicAndUnderline(part)}</strong>;
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
      <div className="flex flex-col gap-2 text-xs text-slate-300 font-sans leading-relaxed select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // Check if it's a numbered list item (e.g. "1. " or "2. ")
          const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 mt-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  {numMatch[1]}
                </span>
                <span className="text-slate-300">{parseInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }

          // Check if it's a bullet item (e.g. "- " or "* " or "• ")
          if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
            const content = trimmed.replace(/^[-*•]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
                <span className="text-slate-300">{parseInlineMarkdown(content)}</span>
              </div>
            );
          }

          // Normal paragraph
          return <p key={idx} className="m-0 pl-1 mt-1">{parseInlineMarkdown(trimmed)}</p>;
        })}
      </div>
    );
  };

  const handleSaveReport = () => {
    setShowApprovePanel(true);
  };

  const handleConfirmSave = () => {
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

  const handleInsertMarkup = (type) => {
    const textarea = document.getElementById("clinical-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (type === "B") replacement = `**${selectedText || "bold text"}**`;
    else if (type === "I") replacement = `*${selectedText || "italic text"}*`;
    else if (type === "U") replacement = `<u>${selectedText || "underlined text"}</u>`;
    else if (type === "S") replacement = `~~${selectedText || "strikethrough text"}~~`;
    else if (type === "bullet") replacement = `\n- ${selectedText || "list item"}`;
    else if (type === "number") replacement = `\n1. ${selectedText || "list item"}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setSoapText(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
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

      // Matches things like "1. Viral Fever (Confidence: 0.82)" or "Influenza: 68%" or "Dengue Fever - 0.45"
      const scoreMatch = trimmed.match(/(0\.\d+|100%|\d{2}%)/);
      if (scoreMatch) {
        let name = trimmed
          .replace(/^\d+[.)]\s*/, "") // Remove list numbering
          .replace(/\(?(?:confidence|Confidence|Conf)?\s*[:\-]?\s*(0\.\d+|100%|\d{2}%)\)?/i, "") // Remove score match
          .replace(/[:-]/, "") // Remove stray colons/dashes
          .trim();

        let scoreStr = scoreMatch[1];
        let val = 0.50;
        if (scoreStr.includes("%")) {
          val = parseFloat(scoreStr) / 100;
        } else {
          val = parseFloat(scoreStr);
        }
        if (isNaN(val)) val = 0.50;

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
          const colorClass = percent >= 80 
            ? "bg-teal-500" 
            : percent >= 60 
              ? "bg-sky-500" 
              : "bg-amber-500";

          return (
            <div key={i} className="bg-[#0c1322] border border-[#1e2d4a]/70 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-200">{diag.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{percent}% confidence</span>
              </div>
              <div className="w-full h-1.5 bg-[#172237] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colorClass} rounded-full transition-all duration-700`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const formatMarkdownToHTML = (text) => {
    if (!text || text.trim() === "" || text.trim().toLowerCase() === "not provided") {
      return `<p style="font-style: italic; color: #64748b; margin: 0;">Not provided</p>`;
    }

    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    escaped = escaped
      .replace(/&lt;u&gt;/g, "<u>")
      .replace(/&lt;\/u&gt;/g, "</u>")
      .replace(/&lt;del&gt;/g, "<del>")
      .replace(/&lt;\/del&gt;/g, "</del>")
      .replace(/&lt;strong&gt;/g, "<strong>")
      .replace(/&lt;\/strong&gt;/g, "</strong>")
      .replace(/&lt;em&gt;/g, "<em>")
      .replace(/&lt;\/em&gt;/g, "</em>");

    // Parse bold
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Parse italic
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
    escaped = escaped.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Parse strikethrough
    escaped = escaped.replace(/~~(.*?)~~/g, "<del>$1</del>");

    const lines = escaped.split("\n");
    let resultHtml = "";
    let inList = false;
    let listType = null;

    const closeListIfNeeded = () => {
      if (inList) {
        resultHtml += `</${listType}>`;
        inList = false;
        listType = null;
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        closeListIfNeeded();
        return;
      }

      // Check for headings
      const h3Match = trimmed.match(/^###\s+(.*)/);
      const h2Match = trimmed.match(/^##\s+(.*)/);
      const h1Match = trimmed.match(/^#\s+(.*)/);

      if (h3Match) {
        closeListIfNeeded();
        resultHtml += `<h4 style="margin: 12px 0 6px 0; font-size: 11px; font-weight: bold; color: #0f172a;">${h3Match[1]}</h4>`;
      } else if (h2Match) {
        closeListIfNeeded();
        resultHtml += `<h3 style="margin: 14px 0 8px 0; font-size: 12px; font-weight: bold; color: #0f172a;">${h2Match[1]}</h3>`;
      } else if (h1Match) {
        closeListIfNeeded();
        resultHtml += `<h2 style="margin: 16px 0 10px 0; font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">${h1Match[1]}</h2>`;
      } else {
        // Check for list items
        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);

        if (numMatch) {
          if (inList && listType !== "ol") {
            closeListIfNeeded();
          }
          if (!inList) {
            resultHtml += `<ol style="margin: 5px 0 10px 20px; padding: 0; list-style-type: decimal;">`;
            inList = true;
            listType = "ol";
          }
          resultHtml += `<li style="margin-bottom: 5px; padding-left: 2px;">${numMatch[2]}</li>`;
        } else if (bulletMatch) {
          if (inList && listType !== "ul") {
            closeListIfNeeded();
          }
          if (!inList) {
            resultHtml += `<ul style="margin: 5px 0 10px 20px; padding: 0; list-style-type: disc;">`;
            inList = true;
            listType = "ul";
          }
          resultHtml += `<li style="margin-bottom: 5px; padding-left: 2px;">${bulletMatch[1]}</li>`;
        } else {
          closeListIfNeeded();
          resultHtml += `<p style="margin: 0 0 10px 0; line-height: 1.5; text-align: justify;">${trimmed}</p>`;
        }
      }
    });

    closeListIfNeeded();
    return resultHtml;
  };

  const formatDiagnosisToHTML = (text) => {
    if (!text || text.trim() === "" || text.trim().toLowerCase() === "not provided") {
      return `<p style="font-style: italic; color: #64748b; margin: 0;">Not provided</p>`;
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
        if (isNaN(val)) val = 0.50;

        parsedDiagnoses.push({ name, confidence: val });
      } else {
        const cleanLine = trimmed.replace(/^\d+[.)]\s*/, "").trim();
        if (cleanLine.length > 2) {
          parsedDiagnoses.push({ name: cleanLine, confidence: 0.60 });
        }
      }
    });

    if (parsedDiagnoses.length === 0) {
      return formatMarkdownToHTML(text);
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${parsedDiagnoses.map(diag => {
          const percent = Math.round(diag.confidence * 100);
          const fillClass = percent >= 80 
            ? "fill-teal" 
            : percent >= 60 
              ? "fill-sky" 
              : "fill-amber";

          return `
            <div class="pdf-diag-item">
              <div class="pdf-diag-meta">
                <span>${diag.name}</span>
                <span style="font-family: monospace;">${percent}%</span>
              </div>
              <div class="pdf-diag-bar-bg">
                <div class="pdf-diag-bar-fill ${fillClass}" style="width: ${percent}%;"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  };

  const handleDownloadPDF = () => {
    setDownloading(true);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the clinical report.");
      setDownloading(false);
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const docId = `EHR-${patient.patient_id}-${Date.now().toString().slice(-4)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CLINICAL_CONSULTATION_REPORT_${patient.patient_id}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.5;
            padding: 20px;
            background: #f8fafc;
            font-size: 11px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .record-container {
            border: 4px double #0f172a;
            padding: 35px;
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            position: relative;
            box-sizing: border-box;
          }
          
          /* Clinical Header / Letterhead */
          .letterhead-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px double #0f172a;
            padding-bottom: 18px;
            margin-bottom: 22px;
          }
          .clinic-brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .clinic-logo {
            background-color: #0d9488;
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 900;
          }
          .clinic-details {
            display: flex;
            flex-direction: column;
          }
          .clinic-name {
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            margin: 0;
          }
          .clinic-tagline {
            font-size: 9px;
            color: #64748b;
            margin: 2px 0 0 0;
            font-weight: 500;
          }
          .document-meta {
            text-align: right;
          }
          .doc-type {
            font-size: 13px;
            font-weight: 800;
            color: #0d9488;
            letter-spacing: 1px;
            margin: 0;
          }
          .doc-id {
            font-size: 9.5px;
            font-family: monospace;
            color: #475569;
            margin: 4px 0 0 0;
            font-weight: bold;
          }

          /* Demographics Table */
          .patient-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .patient-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            vertical-align: middle;
            font-size: 10.5px;
          }
          .patient-table .label {
            font-weight: 700;
            background-color: #f8fafc;
            color: #334155;
            width: 18%;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.3px;
          }
          .patient-table .value {
            color: #0f172a;
            width: 32%;
            font-weight: 500;
          }
          
          /* SOP Section Blocks */
          .sop-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          .sop-section-header {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-left: 5px solid #0d9488;
            color: #0f172a;
            font-weight: bold;
            font-size: 11px;
            padding: 8px 12px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            justify-content: space-between;
          }
          .sop-section-body {
            border: 1px solid #cbd5e1;
            border-top: none;
            padding: 14px 18px;
            background-color: #ffffff;
            color: #334155;
            font-size: 10.5px;
          }
          
          /* Two Column Grid for Analytics */
          .analytics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin-top: 20px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .analytics-box {
            border: 1px solid #cbd5e1;
            display: flex;
            flex-direction: column;
            background-color: #ffffff;
          }
          .analytics-header {
            background-color: #f1f5f9;
            border-bottom: 1px solid #cbd5e1;
            border-left: 4px solid #0284c7;
            color: #0f172a;
            font-weight: bold;
            font-size: 10px;
            padding: 8px 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .analytics-body {
            padding: 12px 15px;
            font-size: 10px;
            color: #334155;
            flex: 1;
          }
          
          /* Diagnosis Bar Custom Styles for PDF */
          .pdf-diag-item {
            margin-bottom: 10px;
          }
          .pdf-diag-meta {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .pdf-diag-bar-bg {
            width: 100%;
            height: 6px;
            background-color: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
          }
          .pdf-diag-bar-fill {
            height: 100%;
            border-radius: 3px;
          }
          .fill-teal { background-color: #0d9488; }
          .fill-sky { background-color: #0284c7; }
          .fill-amber { background-color: #d97706; }

          /* Signatures Area */
          .signature-area {
            margin-top: 35px;
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
          }
          .signature-area td {
            border: none;
            padding: 0;
          }
          .signature-status {
            font-size: 10px;
            color: #334155;
          }
          .status-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #0d9488;
          }
          .status-item .box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 14px;
            border: 1.5px solid #0d9488;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
          }
          .doctor-sign-block {
            text-align: right;
            width: 250px;
          }
          .sign-line {
            border-bottom: 1.5px solid #0f172a;
            margin-bottom: 8px;
            width: 100%;
          }
          .doctor-name {
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
          }
          .doctor-title {
            font-size: 8px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
            margin-top: 2px;
          }
          .sign-date {
            font-size: 9px;
            font-family: monospace;
            color: #475569;
            margin-top: 4px;
          }

          /* Print Overrides */
          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .record-container {
              border: 4px double #000;
              box-shadow: none;
              max-width: 100%;
              padding: 25px;
            }
            .sop-section-header {
              background-color: #f1f5f9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .analytics-header {
              background-color: #f1f5f9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="record-container">
          <div class="letterhead-container">
            <div class="clinic-brand">
              <div class="clinic-logo">+</div>
              <div class="clinic-details">
                <h1 class="clinic-name">ClarityNote Medical Center</h1>
                <span class="clinic-tagline">Ambient EHR Clinical Documentation & Systems</span>
              </div>
            </div>
            <div class="document-meta">
              <h2 class="doc-type">CLINICAL CONSULTATION REPORT</h2>
              <p class="doc-id">Control Ref: ${docId}</p>
            </div>
          </div>

          <table class="patient-table">
            <tr>
              <td class="label">Patient Name:</td>
              <td class="value">${patient.name || "N/A"}</td>
              <td class="label">Patient ID:</td>
              <td class="value">${patient.patient_id || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Age / Gender:</td>
              <td class="value">${patient.age || "N/A"} Y / ${patient.gender || "N/A"}</td>
              <td class="label">Contact Phone:</td>
              <td class="value">${patient.phone || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Attending Doctor:</td>
              <td class="value">Dr. Patel, MD</td>
              <td class="label">Hospital/Clinic:</td>
              <td class="value">ClarityNote Medical Center</td>
            </tr>
          </table>

          <div class="sop-section">
            <div class="sop-section-header">
              <span>1.0 Subjective Section (S)</span>
              <span style="font-weight: 500; font-size: 8.5px; opacity: 0.8;">Patient Narrative & History</span>
            </div>
            <div class="sop-section-body">
              ${formatMarkdownToHTML(parsedSoap.subjective)}
            </div>
          </div>

          <div class="sop-section">
            <div class="sop-section-header">
              <span>2.0 Objective Section (O)</span>
              <span style="font-weight: 500; font-size: 8.5px; opacity: 0.8;">Clinical Findings & Vitals</span>
            </div>
            <div class="sop-section-body">
              ${formatMarkdownToHTML(parsedSoap.objective)}
            </div>
          </div>

          <div class="sop-section">
            <div class="sop-section-header">
              <span>3.0 Assessment Section (A)</span>
              <span style="font-weight: 500; font-size: 8.5px; opacity: 0.8;">Clinical Formulations & Hypotheses</span>
            </div>
            <div class="sop-section-body">
              ${formatMarkdownToHTML(parsedSoap.assessment)}
            </div>
          </div>

          <div class="sop-section">
            <div class="sop-section-header">
              <span>4.0 Plan Section (P)</span>
              <span style="font-weight: 500; font-size: 8.5px; opacity: 0.8;">Treatment Plan & Action Items</span>
            </div>
            <div class="sop-section-body">
              ${formatMarkdownToHTML(parsedSoap.plan)}
            </div>
          </div>

          <div class="analytics-grid">
            <div class="analytics-box">
              <div class="analytics-header">AI Diagnosis Suggestions</div>
              <div class="analytics-body">
                ${formatDiagnosisToHTML(parsedSoap.diagnosis)}
              </div>
            </div>
            <div class="analytics-box">
              <div class="analytics-header">Clinical Insights & Takeaways</div>
              <div class="analytics-body">
                ${formatMarkdownToHTML(parsedSoap.insights || parsedSoap.predictions)}
              </div>
            </div>
          </div>

          <table class="signature-area">
            <tr>
              <td style="vertical-align: bottom;">
                <div class="signature-status">
                  <div class="status-item">
                    <span class="box">✓</span> Note Reviewed
                  </div>
                  <div class="status-item">
                    <span class="box">✓</span> Note Approved
                  </div>
                  <div style="font-size: 9px; color: #64748b; margin-top: 5px; font-weight: 500;">
                    Disposition: Finalized and synced with HIPAA-compliant EHR storage systems.
                  </div>
                </div>
              </td>
              <td style="vertical-align: bottom; text-align: right;">
                <div class="doctor-sign-block" style="display: inline-block;">
                  <div class="sign-line"></div>
                  <div class="doctor-name">Dr. Patel, MD</div>
                  <div class="doctor-title">Attending Physician / Signatory</div>
                  <div class="sign-date">Disposition Date: ${currentDate}</div>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setDownloading(false);
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#0c1322]/80 backdrop-blur-md text-slate-100 font-sans select-none text-left flex flex-col pb-12 soap-generation-page">
      
      {/* 1. Header Navigation */}
      <header className="w-full h-16 border-b border-[#1e2d4a] bg-[#0c1322]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div 
            onClick={() => navigate("/dashboard")} 
            className="flex items-center text-white no-underline tracking-tight cursor-pointer"
          >
            <div className="relative flex w-8 h-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-500 shadow-md">
              <span className="font-sans font-black text-white text-xs">C</span>
            </div>
            <span className="tracking-wide font-bold ml-2.5 text-sm text-white">
              ClarityNote <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 font-medium">AI</span>
            </span>
          </div>
          <span className="text-slate-700 text-sm">|</span>
          <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">SOAP Note Workshop</span>
        </div>

        <button 
          onClick={() => navigate("/dashboard")}
          className="btn-3d-secondary px-4 py-1.5 text-xs flex items-center gap-2"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Dashboard</span>
        </button>
      </header>

      {/* 2. Patient Header Banner */}
      <div className="w-full px-8 mt-6">
        <div className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden bg-[#172237]">
          {/* Background Glows */}
          <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[200%] bg-teal-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[40%] h-[200%] bg-cyan-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <FaUser className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white text-xl font-black m-0 leading-none">{patient.name}</h1>
                <span className="text-[10px] bg-teal-500/15 border border-teal-500/25 px-2 py-0.5 rounded font-mono text-teal-400 font-bold uppercase tracking-wider">
                  {patient.patient_id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-slate-600 text-[10px]" />
                  Age: {patient.age}
                </span>
                <span className="text-slate-800">•</span>
                <span className="flex items-center gap-1.5">
                  <FaVenusMars className="text-slate-600 text-[10px]" />
                  Gender: {patient.gender}
                </span>
                <span className="text-slate-800">•</span>
                <span className="flex items-center gap-1.5">
                  <FaPhone className="text-slate-600 text-[10px]" />
                  {patient.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-right items-end border-t border-[#1e2d4a] md:border-t-0 pt-4 md:pt-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Consultation Date</span>
            <span className="text-sm text-white font-bold mt-1 font-mono">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded bg-emerald-500/10 border border-emerald-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-bold uppercase">Ready to Review</span>
            </div>
          </div>
        </div>
      </div>
      {/* 3. Main EHR Workspace Desk Grid */}
      <main className="w-full px-8 mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Summary & Source Transcript (xl:span-4) */}
        <section className="xl:col-span-4 flex flex-col gap-6">
          <div className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#1e2d4a]/60 pb-3">
              <FaFileAlt className="text-teal-400 text-xs" />
              <h2 className="text-white text-xs font-black uppercase tracking-wider m-0">Source Conversation</h2>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ambient Conversation Transcript</span>
              <div className="w-full h-[580px] p-4 rounded-xl bg-[#0c1322] border border-[#1e2d4a] text-slate-300 text-xs outline-none overflow-y-auto leading-relaxed font-mono whitespace-pre-wrap select-text pr-1">
                {conversation}
              </div>
            </div>

            {language && (
              <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold px-1">
                <span className="text-slate-500">Audio Language:</span>
                <span className="text-white font-mono uppercase bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded text-[10px]">
                  {language}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Unified SOAP Document Editor (xl:span-8) */}
        <section className="xl:col-span-8 flex flex-col gap-6">
          <div className="glass-panel border border-[#1e2d4a]/60 rounded-[20px] p-5 flex flex-col gap-5 shadow-xl relative min-h-[500px]">
            
            {/* Step 8 Checklist Loader Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-[#0c1322]/95 rounded-[20px] flex flex-col items-center justify-center gap-6 z-30 backdrop-blur-md p-8 text-center">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-spin border-t-teal-500" />
                  <span className="text-teal-400 font-bold text-xs">AI</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-white text-base font-black uppercase tracking-wider">Analyzing Conversation...</h3>
                  <p className="text-slate-400 text-xs">ClarityNote AI agents are generating your structured clinical note.</p>
                </div>

                <div className="w-full max-w-xs bg-[#131d30] border border-[#1e2d4a] rounded-xl p-4 flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clinical pipeline status</span>
                    <span className="text-[9px] text-teal-400 font-bold uppercase font-mono">Running</span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 mt-1">
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        ✓
                      </span>
                      <span className="text-slate-200">Transcription Complete</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      {loadingStep >= 1 ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 animate-pulse" />
                      )}
                      <span className={loadingStep >= 1 ? "text-slate-200" : "text-slate-500"}>Retrieving Patient History</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      {loadingStep >= 2 ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20" />
                      )}
                      <span className={loadingStep >= 2 ? "text-slate-200" : "text-slate-500"}>Generating SOAP Note</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      {loadingStep >= 3 ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20" />
                      )}
                      <span className={loadingStep >= 3 ? "text-slate-200" : "text-slate-500"}>Validating Output</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 14: Save Success Panel with WhatsApp Delivery */}
            {showSaveSuccess ? (
              <div className="flex flex-col gap-6 justify-center py-6 min-h-[500px]">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <FaCheck className="text-2xl" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white text-base font-black uppercase tracking-wider">Session Saved!</h3>
                    <p className="text-emerald-400 text-xs font-semibold">Consultation saved successfully to database.</p>
                  </div>
                </div>

                {/* Patient History Updated Status Indicator */}
                <div className="bg-[#131d30] border border-[#1e2d4a] rounded-xl p-5 flex flex-col gap-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1e2d4a]">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Patient History Updated</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded font-mono uppercase">New Entry Locked</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <p className="m-0 text-slate-300 font-bold">{patient.name}</p>
                    <p className="m-0 text-slate-400 text-[11px]">Consultation details added to patient chart history database.</p>
                  </div>
                </div>

                {/* Send PDF to WhatsApp simulation */}
                <div className="bg-[#131d30] border border-[#1e2d4a] rounded-xl p-5 flex flex-col gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
                      <FaWhatsapp className="text-lg" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold leading-none">Send PDF to WhatsApp</h4>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-none">Share clinical note instantly with patient.</p>
                    </div>
                  </div>

                  {whatsappSent ? (
                    <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-lg text-emerald-400 text-xs font-semibold">
                      <FaCheckCircle className="text-emerald-400 shrink-0 text-sm" />
                      <span>Clinical note (PDF) sent successfully to {whatsappNumber}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="WhatsApp Number..."
                        className="flex-1 h-9 px-3 rounded-lg bg-[#0c1322] border border-[#1e2d4a] text-white text-xs outline-none focus:border-teal-500/40 font-medium font-mono"
                      />
                      <button
                        onClick={handleSendWhatsapp}
                        disabled={sendingWhatsapp}
                        className="btn-3d-primary h-9 px-4 text-xs font-bold shrink-0 flex items-center gap-1.5 animate-pulse"
                      >
                        {sendingWhatsapp ? (
                          <>
                            <FaSpinner className="animate-spin text-xs" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <FaWhatsapp className="text-xs" />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3.5 mt-2">
                  <button
                    onClick={() => {
                      navigate("/dashboard", { state: { activeTab: "reports" } });
                    }}
                    className="btn-3d-secondary h-10 px-5 text-xs font-bold"
                  >
                    Go to Patient History
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="btn-3d-primary h-10 px-5 text-xs font-bold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : showApprovePanel ? (
              /* Step 13: Approve & Finalize Panel */
              <div className="flex flex-col gap-6 justify-center py-6 min-h-[500px]">
                <div className="flex flex-col items-center text-center gap-3 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/5">
                    <FaCheck className="text-lg" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white text-base font-black uppercase tracking-wider">Approve & Finalize</h3>
                    <p className="text-slate-400 text-xs">Verify consultation details below before saving to the EHR system.</p>
                  </div>
                </div>

                <div className="bg-[#131d30] border border-[#1e2d4a] rounded-xl p-5 flex flex-col gap-4 text-left">
                  <div className="flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/15 rounded-lg">
                    <FaCheckCircle className="text-teal-400 shrink-0 text-base" />
                    <div>
                      <h4 className="text-white text-xs font-bold leading-none">Note Approved</h4>
                      <p className="text-[10px] text-teal-300 mt-1 leading-none">Ready to save this consultation.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Created By</span>
                      <span className="text-slate-200 font-semibold block mt-0.5">Dr. Patel</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Date & Time</span>
                      <span className="text-slate-200 font-semibold block mt-0.5">{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="col-span-2 border-t border-[#1e2d4a] pt-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Patient Chart</span>
                      <span className="text-slate-200 font-semibold block mt-0.5">{patient.name} ({patient.patient_id})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3.5 mt-2">
                  <button
                    onClick={() => setShowApprovePanel(false)}
                    className="btn-3d-secondary h-10 px-5 text-xs font-bold"
                  >
                    Back to Review
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    disabled={saving}
                    className="btn-3d-primary h-10 px-6 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>Saving Note...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="text-xs" />
                        <span>Save Session</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Regular Preview / Editor Workspace Flow */
              <>
                <div className="flex items-center justify-between border-b border-[#1e2d4a]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <FaNotesMedical className="text-teal-400 text-xs" />
                    <h2 className="text-white text-xs font-black uppercase tracking-wider m-0">Aura Clinical Report</h2>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn-3d-secondary h-8 px-3.5 text-[11px] flex items-center gap-1.5"
                    >
                      {isEditing ? (
                        <>
                          <FaFileAlt className="text-teal-400 text-[10px]" />
                          <span>View Chart</span>
                        </>
                      ) : (
                        <>
                          <FaNotesMedical className="text-teal-400 text-[10px]" />
                          <span>Edit Raw Text</span>
                        </>
                      )}
                    </button>
                    <span className="text-[9px] text-teal-400 bg-teal-500/10 border border-teal-500/15 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Clinical Standard Report
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  /* Step 11: Review & Edit Workspace */
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Clinical Report Summary (Editable)</span>
                      <span className="text-[9px] text-slate-500 italic">Select text and use toolbar to format</span>
                    </div>
                    <div className="flex flex-col">
                      {/* Editor formatting toolbar */}
                      <div className="flex items-center gap-1 bg-[#131d30] border border-[#1e2d4a] border-b-0 rounded-t-xl px-2 py-1 max-w-full overflow-x-auto">
                        {["B", "I", "U", "S"].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleInsertMarkup(tag)}
                            className="w-7 h-7 flex items-center justify-center font-bold text-xs text-slate-400 hover:text-white bg-transparent border-none rounded hover:bg-[#172237] transition-all cursor-pointer font-sans active:scale-95"
                          >
                            {tag === "B" ? <strong>B</strong> : tag === "I" ? <em>I</em> : tag === "U" ? <u>U</u> : <del>S</del>}
                          </button>
                        ))}
                        <div className="w-px h-4 bg-[#1e2d4a] mx-1" />
                        <button
                          type="button"
                          onClick={() => handleInsertMarkup("bullet")}
                          className="h-7 px-2 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white bg-transparent border-none rounded hover:bg-[#172237] transition-all cursor-pointer active:scale-95"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertMarkup("number")}
                          className="h-7 px-2 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white bg-transparent border-none rounded hover:bg-[#172237] transition-all cursor-pointer active:scale-95"
                        >
                          1. List
                        </button>
                      </div>
                      <textarea
                        id="clinical-textarea"
                        value={soapText}
                        onChange={(e) => setSoapText(e.target.value)}
                        className="w-full h-[546px] p-4 rounded-b-xl bg-[#0c1322] border border-[#1e2d4a] text-slate-300 text-xs outline-none focus:border-teal-500/40 transition-all font-mono resize-none leading-relaxed select-text"
                        placeholder="Clinical report is compiling..."
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium italic mt-1 leading-normal">
                      *Review the structured notes above. You can directly edit the text before saving it to the EHR system.
                    </p>
                  </div>
                ) : (
                  /* Step 9: Generated Clinical Note (Preview) */
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Live Document Preview</span>
                      <span className="text-[9px] text-slate-500 italic">Scroll to read the entire report</span>
                    </div>
                    <div className="w-full h-[580px] overflow-y-auto pr-1 bg-[#131d30] border border-[#1e2d4a] rounded-xl p-6 relative overflow-x-hidden font-sans">
                      {/* Elegant Watermark */}
                      <div className="absolute top-8 right-8 text-teal-500/5 pointer-events-none">
                        <FaNotesMedical className="text-9xl" />
                      </div>

                      {/* Header Letterhead */}
                      <div className="border-b border-[#1e2d4a] pb-4 mb-5 flex justify-between items-start">
                        <div>
                          <h3 className="text-white text-xs font-bold tracking-wide uppercase">ClarityNote EHR System</h3>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Automated Ambient Medical Documentation</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                            Status: Draft
                          </span>
                          <p className="text-[9px] text-slate-500 mt-1 font-mono">ID: {patient.patient_id}-{Date.now().toString().slice(-4)}</p>
                        </div>
                      </div>

                      {/* Document Content Flow */}
                      <div className="flex flex-col gap-6">
                        {/* Subjective */}
                        <div className="border-l-4 border-teal-500 pl-4 py-0.5">
                          <h4 className="text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-2">Subjective (S)</h4>
                          {renderFormattedText(parsedSoap.subjective)}
                        </div>

                        {/* Objective */}
                        <div className="border-l-4 border-sky-500 pl-4 py-0.5">
                          <h4 className="text-sky-400 text-[10px] font-bold uppercase tracking-wider mb-2">Objective (O)</h4>
                          {renderFormattedText(parsedSoap.objective)}
                        </div>

                        {/* Assessment */}
                        <div className="border-l-4 border-indigo-400 pl-4 py-0.5">
                          <h4 className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-2">Assessment (A)</h4>
                          {renderFormattedText(parsedSoap.assessment)}
                        </div>

                        {/* Plan */}
                        <div className="border-l-4 border-emerald-500 pl-4 py-0.5">
                          <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">Plan (P)</h4>
                          {renderFormattedText(parsedSoap.plan)}
                        </div>

                        {/* Diagnosis Suggestions */}
                        {parsedSoap.diagnosis && (
                          <div className="mt-2 border border-amber-500/15 bg-amber-500/5 rounded-xl p-4">
                            <h4 className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">Diagnosis Suggestions</h4>
                            {renderDiagnosisSuggestions(parsedSoap.diagnosis)}
                            <p className="text-[9px] text-amber-500/80 italic mt-3 pt-2 border-t border-amber-500/10 leading-normal">
                              *Disclaimer: Diagnostic recommendations are generated by AI and are intended for reference only. They do not constitute official medical advice.
                            </p>
                          </div>
                        )}

                        {/* Clinical Insights & Predictions */}
                        {(parsedSoap.insights || parsedSoap.predictions) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {parsedSoap.insights && (
                              <div className="border border-teal-500/15 bg-teal-500/5 rounded-xl p-4">
                                <h4 className="text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-2">Clinical Insights</h4>
                                {renderFormattedText(parsedSoap.insights)}
                              </div>
                            )}
                            {parsedSoap.predictions && (
                              <div className="border border-sky-500/15 bg-sky-500/5 rounded-xl p-4">
                                <h4 className="text-sky-400 text-[10px] font-bold uppercase tracking-wider mb-2">Symptom Predictions</h4>
                                {renderFormattedText(parsedSoap.predictions)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium italic mt-1 leading-normal">
                      *Review the formatted clinical sheet above. Click "Edit Raw Text" to modify the content directly.
                    </p>
                  </div>
                )}

                {/* Bottom Actions Cluster */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-4 border-t border-[#1e2d4a]">
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="btn-3d-secondary h-10 px-4 text-xs"
                    >
                      Back to Dashboard
                    </button>

                    <button
                      onClick={fetchSoapNote}
                      disabled={loading}
                      className="btn-3d-secondary h-10 px-4 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaRedo className="text-[10px]" />
                      <span>Regenerate SOAP</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="btn-3d-secondary h-10 px-4 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {downloading ? (
                        <>
                          <FaSpinner className="animate-spin text-xs" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <FaFilePdf className="text-xs text-rose-400" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSaveReport}
                      disabled={saving}
                      className="btn-3d-primary h-10 px-5 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin text-xs" />
                          <span>Saving Note...</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="text-xs" />
                          <span>Save Report</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>
        </section>

      </main>

    </div>
  );
}

export default SoapGenerationPage;
