# Backend Developer's Guide to the ClarityNote AI Frontend

This document explains the frontend project structure, environment configuration, and detailed API contract. It helps backend developers understand what endpoints, schemas, payloads, and response structures the frontend expects.

---

## 🛠️ Project Structure & Architecture

The frontend is built as a Single Page Application (SPA) using:
*   **React 18 + Vite** (Dev server default port: `http://localhost:5173/`)
*   **Tailwind CSS v4** (Styling)
*   **React Router v6** (Routing)
*   **Axios** (Centralized API client under `src/api/index.js`)

---

## ⚙️ Environment Configuration

The frontend communicates with the backend using the base URL defined in its environment variables.

Create a `.env` file in the `frontend/` root directory:
```env
VITE_API_URL=http://localhost:8000
```
If this variable is omitted, the frontend falls back to `http://127.0.0.1:8000`.

---

## 📡 API Contract (Endpoints & Payloads)

All Axios calls are centralized inside [src/api/index.js](file:///d:/AI%20Documentation/frontend/src/api/index.js). The frontend expects the backend to expose the following endpoints:

### 1. Retrieve Patient Record
*   **Endpoint**: `GET /patient/{patientId}`
*   **Purpose**: Checks if a patient exists in the central EHR system and retrieves their details.
*   **Response (JSON)**:
    ```json
    {
      "exists": true,
      "patient": {
        "patient_id": "P1001",
        "name": "Eleanor Vance",
        "age": 64,
        "gender": "Female",
        "phone": "+1 (555) 019-2834",
        "address": "123 Medical Way"
      }
    }
    ```
    *Note: If `exists` is false, the frontend displays a warning.*

---

### 2. Register New Patient
*   **Endpoint**: `POST /patient/create`
*   **Purpose**: Creates a new patient record in the registry database.
*   **Payload (JSON)**:
    ```json
    {
      "name": "Rahul Kumar",
      "age": "29",
      "gender": "Male",
      "phone": "+91 98765 43210"
    }
    ```
*   **Response (JSON)**:
    ```json
    {
      "patient_id": "P1005"
    }
    ```

---

### 3. Audio Transcription (Diarization)
*   **Endpoint**: `POST /transcribe`
*   **Purpose**: Uploads recorded audio files and processes them through the transcription engine.
*   **Payload**: `multipart/form-data` containing:
    *   `file`: WebM audio blob (`recording.webm`)
*   **Response (JSON)**:
    ```json
    {
      "language": "en-US",
      "transcript": "Full compiled transcript...",
      "speakers": [
        { "speaker_id": 1, "transcript": "Hello, how can I help you today?" },
        { "speaker_id": 0, "transcript": "I have been experiencing a sharp stomach ache." }
      ]
    }
    ```
*   **Diarization Mapping Rules**:
    *   `speaker_id === 1` represents the **Doctor** (renders as green bubbles in the dialogue tab).
    *   `speaker_id === 0` (or other ids) represents the **Patient** (renders as slate bubbles in the dialogue tab).

---

### 4. SOAP Note & Clinical Suggestions Generation
*   **Endpoint**: `POST /generate`
*   **Purpose**: Calls the LLM to generate structured SOAP notes and clinical insights based on conversation text.
*   **Payload (JSON)**:
    ```json
    {
      "conversation": "Doctor: Hello, how can I help you?...\n\nPatient: My stomach hurts..."
    }
    ```
*   **Response (JSON)**:
    ```json
    {
      "response": "SOAP Note:\nS: Patient reports sharp left lower quadrant abdominal pain for 3 days.\nO: LLQ tenderness, soft abdomen, vitals stable.\nA: LLQ pain, rule out acute diverticulitis.\nP: Clear liquid diet, oral antibiotics, follow up in 1 week.\n\nDiagnosis Suggestions:\n- Acute Diverticulitis (Confidence: 0.85)\n- Symptomatic Diverticular Disease (Confidence: 0.70)\n\nClinical Insights:\nAdvise on fiber intake after symptoms subside. Watch for warning signs like fever or severe cramping.\n\nSymptom Predictions:\nHigh risk for recurrence if dietary habits are not adjusted."
    }
    ```

#### 📌 Parsing Rules for LLM Generation:
The frontend parses the `response` string using key section headers. The LLM must output text matching these exact section templates:
1.  **High-Level Blocks**: The generator must output blocks starting with:
    *   `SOAP Note:` or `SOAP Note`
    *   `Diagnosis Suggestions:` or `Diagnosis Suggestions`
    *   `Clinical Insights:` or `Clinical Insights`
    *   `Symptom Predictions:` or `Symptom Predictions`
2.  **Internal SOAP Sections**: Inside the `SOAP Note` block, sections must start with:
    *   `S:` or `Subjective:`
    *   `O:` or `Objective:`
    *   `A:` or `Assessment:`
    *   `P:` or `Plan:`
3.  **Diagnosis Confidence Bars**: To render the color-coded confidence bars, format diagnosis suggestions like `- [Diagnosis Name] (Confidence: [0.0-1.0])`. E.g., `- Viral Fever (Confidence: 0.82)`.

---

## 🎙️ Audio Visualizer Technical Details

*   **Recorder**: Uses browser native `MediaRecorder` API to capture standard `audio/webm` media chunks.
*   **Frequency Timeline**: Analyzes real-time volume parameters using Web Audio API `AnalyserNode` (`fftSize = 32`).
*   **Scrolling Wave**: Renders an 80-bar rolling buffer scrolling from right-to-left at a `70ms` interval, drawing peak values extending vertically upward and downward from a dotted center baseline.
