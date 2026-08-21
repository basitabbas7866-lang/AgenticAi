import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

export const createPatient = async (patientData) => {
  const response = await apiClient.post("/patient/create", patientData);
  return response;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
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
  const response = await apiClient.get(`/patient/${patientId}/coordination/analyze`);
  return response;
};

export default apiClient;

