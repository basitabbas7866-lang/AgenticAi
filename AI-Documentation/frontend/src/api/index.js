import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname ? `http://${window.location.hostname}:8000` : "http://127.0.0.1:8000");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds timeout for slow transcription/LLM generation pipelines
  headers: {
    "Content-Type": "application/json",
  },
});

// Outgoing request interceptor for debugging and telemetry
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Incoming response interceptor for unified logging and error tracking
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} from ${response.config.url}`);
    
    // Warn if the API returned 200 OK but the payload indicates logical failure
    if (response.data && (response.data.success === false || response.data.status === "error")) {
      console.warn(
        `[API Logical Warning] ${response.config.url}:`,
        response.data.message || "Logical operation failed."
      );
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error(
        `[API Server Error] Status ${error.response.status} from ${error.config?.url}:`,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received (Network Error / Server Offline)
      console.error(
        `[API Network Error] No response received from ${error.config?.url || API_BASE_URL}. ` +
        `Verify that the backend server is running and accessible.`
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("[API Setup Error]:", error.message);
    }
    return Promise.reject(error);
  }
);

export const getPatient = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}`);
  return response;
};

export const getPatients = async (doctorId = null) => {
  const url = doctorId ? `/patients?doctor_id=${doctorId}` : "/patients";
  const response = await apiClient.get(url);
  return response;
};

export const getDoctors = async () => {
  const response = await apiClient.get("/doctors");
  return response;
};

export const assignDoctor = async (patientId, doctorId) => {
  const response = await apiClient.post(`/patient/${patientId}/assign-doctor`, { doctor_id: doctorId });
  return response;
};

export const approvePatient = async (patientId, doctorId = null) => {
  const url = doctorId ? `/patient/${patientId}/approve?doctor_id=${doctorId}` : `/patient/${patientId}/approve`;
  const response = await apiClient.post(url);
  return response;
};

export const createPatient = async (patientData) => {
  const response = await apiClient.post("/patient/create", patientData);
  return response;
};

export const prescribeMedication = async (patientId, docId, docName, medName, inst) => {
  const response = await apiClient.post(`/patient/${patientId}/prescribe`, {
    doctor_id: String(docId),
    doctor_name: docName,
    medication_name: medName,
    instructions: inst
  });
  return response;
};

export const getPatientPrescriptions = async (patientId, doctorId = null) => {
  const url = doctorId ? `/patient/${patientId}/prescriptions?doctor_id=${doctorId}` : `/patient/${patientId}/prescriptions`;
  const response = await apiClient.get(url);
  return response;
};

export const deletePrescription = async (prescriptionId) => {
  const response = await apiClient.delete(`/prescription/${prescriptionId}`);
  return response;
};

export const transcribeAudio = async (audioBlob, patientId = "", spokenText = "") => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  if (patientId) {
    formData.append("patient_id", patientId);
  }
  if (spokenText) {
    formData.append("spoken_text", spokenText);
  }
  const response = await apiClient.post("/transcribe", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const generateSoap = async (patientId, conversation) => {
  const response = await apiClient.post("/generate", {
    patient_id: patientId,
    conversation
  });
  return response;
};

export const getPatientSessions = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/sessions`);
  return response;
};

export const uploadFile = async (fileObject) => {
  const formData = new FormData();
  formData.append("file", fileObject);
  const response = await apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const getPatientJourney = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/journey`);
  return response;
};

export const addJourneyEvent = async (patientId, eventData) => {
  const response = await apiClient.post(`/patient/${patientId}/journey/event`, eventData);
  return response;
};

export const getAppointments = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/appointments`);
  return response;
};

export const createAppointment = async (patientId, apptData) => {
  const response = await apiClient.post(`/patient/${patientId}/appointments`, apptData);
  return response;
};

export const updateAppointment = async (apptId, apptData) => {
  const response = await apiClient.patch(`/appointments/${apptId}`, apptData);
  return response;
};

export const getReferrals = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/referrals`);
  return response;
};

export const createReferral = async (patientId, refData) => {
  const response = await apiClient.post(`/patient/${patientId}/referrals`, refData);
  return response;
};

export const updateReferral = async (refId, refData) => {
  const response = await apiClient.patch(`/referrals/${refId}`, refData);
  return response;
};

export const getInvestigations = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/investigations`);
  return response;
};

export const createInvestigation = async (patientId, invData) => {
  const response = await apiClient.post(`/patient/${patientId}/investigations`, invData);
  return response;
};

export const updateInvestigation = async (invId, invData) => {
  const response = await apiClient.patch(`/investigations/${invId}`, invData);
  return response;
};

export const getCoordinationAlerts = async () => {
  const response = await apiClient.get("/coordination/alerts");
  return response;
};

export const getPatientAlerts = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/alerts`);
  return response;
};

export const analyzePatientCoordination = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/coordination/analyze`, {
    headers: { Authorization: "Bearer clinical-workspace-token" }
  });
  return response;
};

export const getReviews = async () => {
  const response = await apiClient.get("/coordination/reviews");
  return response;
};

export const getPatientReviews = async (patientId) => {
  const response = await apiClient.get(`/patient/${patientId}/coordination/reviews`);
  return response;
};

export const takeReviewAction = async (reviewId, decision, reviewer, comment) => {
  const response = await apiClient.post(`/coordination/reviews/${reviewId}/action`, {
    decision,
    reviewer,
    comment
  });
  return response;
};

export const syncReviews = async () => {
  const response = await apiClient.post("/coordination/reviews/sync");
  return response;
};

export const loginUser = async (email, password, role) => {
  const response = await apiClient.post("/auth/login", { email, password, role });
  return response;
};

export const registerUser = async (name, email, password, role, specialty = null, age = null, gender = null, phone = null) => {
  const response = await apiClient.post("/auth/register", { name, email, password, role, specialty, age, gender, phone });
  return response;
};

export const updatePatient = async (patientId, patientData) => {
  const response = await apiClient.put(`/patient/${patientId}/update`, patientData);
  return response;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/auth/user/${userId}/update`, userData);
  return response;
};

export const generateFinalReport = async (patientId, soapNote, prescription, historicalComparison = "") => {
  const response = await apiClient.post("/generate/final_report", {
    patient_id: patientId,
    soap_note: soapNote,
    prescription,
    historical_comparison: historicalComparison
  });
  return response;
};

export default apiClient;

