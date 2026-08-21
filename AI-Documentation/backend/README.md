# ClarityNote AI

ClarityNote AI is a clinical documentation prototype that turns a doctor-patient
conversation into a SOAP-style clinical note. The repository contains:

- A React 19 + Vite frontend for patient selection, microphone recording,
  transcription, and report generation.
- A FastAPI backend for patient management, audio transcription, report
  generation, session storage, and retrieval-augmented generation (RAG).
- SQLite for structured patient and consultation data.
- ChromaDB for historical report and previous-session embeddings.
- Sarvam AI for speech-to-text with speaker diarization.
- Groq for extracting medical search terms.
- A local Ollama `medgemma:4b` model for clinical note generation.

> This is a prototype, not a production medical system. Generated output must
> be reviewed by a qualified clinician and must not be treated as medical
> advice.

## Contents

1. [System Overview](#system-overview)
2. [Repository Structure](#repository-structure)
3. [Frontend Developer Quick Start](#frontend-developer-quick-start)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [End-to-End User Flow](#end-to-end-user-flow)
7. [Frontend Architecture](#frontend-architecture)
8. [API Contract](#api-contract)
9. [Data and RAG Flow](#data-and-rag-flow)
10. [Database Model](#database-model)
11. [Current Limitations](#current-limitations)
12. [Troubleshooting](#troubleshooting)

## System Overview

```text
Browser (React + Vite)
        |
        | HTTP requests to http://127.0.0.1:8000
        v
FastAPI
  |-- Patient and session routes ------> SQLite (claritynote.db)
  |-- /transcribe ---------------------> Sarvam AI
  |-- /generate
        |-- medical keyword extraction -> Groq
        |-- history retrieval ----------> ChromaDB
        |-- clinical note generation ---> local Ollama / medgemma:4b
        |-- session persistence --------> SQLite + ChromaDB
```

The frontend currently calls the backend directly through hard-coded Axios
URLs. There is no authentication, API client module, Vite proxy, or frontend
environment variable yet.

## Repository Structure

Generated dependencies and runtime data are shown for context but should not
normally be edited.

```text
claritynote/
|-- README.md                    # Project-wide guide
|-- requirements.txt            # Partial Python dependency list
|-- Patient ID.pdf              # Sample medical PDF
|-- backend/
|   |-- .env                    # Local API keys; do not commit real secrets
|   |-- claritynote.db          # SQLite runtime database
|   |-- rebuild.py              # Hard-coded example PDF ingestion script
|   |-- test_ingest.py          # Hard-coded ingestion helper
|   |-- Patient ID*.pdf         # Sample historical reports
|   |-- sarvam_output/          # Downloaded transcription results
|   |-- app/
|       |-- main.py             # FastAPI application and CORS setup
|       |-- database.py         # SQLAlchemy engine/session configuration
|       |-- models/
|       |   |-- patient.py      # Patient and unused Report models
|       |   |-- session.py      # Session model
|       |   |-- consultation.py # Transcript/report model
|       |   |-- session_service.py
|       |       # Older duplicate service; not used by active routes
|       |-- routes/
|       |   |-- patient.py      # Create and find patients
|       |   |-- transcribe.py   # Upload audio and call Sarvam
|       |   |-- generate.py     # Generate and save a clinical report
|       |   |-- session.py      # List a patient's consultations
|       |   |-- upload.py       # Save a file only; does not run RAG ingestion
|       |-- services/
|       |   |-- groq_service.py       # Groq chat completion client
|       |   |-- medgemma_service.py   # Local Ollama client
|       |   |-- query_builder.py      # Medical keyword extraction
|       |   |-- soap_service.py       # RAG prompt and report generation
|       |   |-- session_service.py    # SQLite + Chroma persistence
|       |   |-- sarvam_service.py     # Alternate, currently unused STT helper
|       |   |-- speaker_service.py    # Unused speaker-labeling helper
|       |-- rag/
|       |   |-- ingest.py       # Split and embed historical PDFs
|       |   |-- retriever.py    # Retrieve PDF/session context
|       |   |-- store_report.py # Embed generated reports
|       |-- uploads/            # Files saved by POST /upload
|       |-- chroma_db/          # Persistent vector database
|-- frontend/
|   |-- package.json            # Scripts and JavaScript dependencies
|   |-- vite.config.js          # Vite React configuration
|   |-- index.html              # Browser entry document
|   |-- public/                 # Static icons
|   |-- src/
|       |-- main.jsx            # React root
|       |-- App.jsx             # Main workflow and API calls
|       |-- App.css             # Workflow-specific styles
|       |-- index.css           # Global theme and layout
|       |-- components/
|           |-- PatientManagement.jsx # Patient search/create UI
|           |-- Header.jsx             # Empty placeholder
|           |-- InputSection.jsx       # Empty placeholder
|           |-- ResultCard.jsx         # Empty placeholder
|-- frontend/node_modules/      # Installed npm packages; generated
|-- venv/                       # Local Python environment; generated
|-- *.zip                       # Local source/archive snapshots
```

## Frontend Developer Quick Start

For frontend-only work, the backend still needs to be running because the UI
does not currently include mocks.

Open two terminals from the repository root.

**Terminal 1: backend**

```powershell
cd backend
..\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Confirm the API is available:

```text
http://127.0.0.1:8000/
http://127.0.0.1:8000/docs
```

**Terminal 2: frontend**

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

The current UI requires a patient before recording or generating a report.
Create a patient in the UI or search for an existing ID such as `P1001`.

## Backend Setup

### Prerequisites

- Python 3.12 is used by the checked-in local virtual environment.
- Ollama must be installed and running.
- The local model must be available:

```powershell
ollama pull medgemma:4b
```

- Valid Groq and Sarvam API keys are required.

### Environment variables

Create or update `backend/.env`:

```dotenv
GROQ_API_KEY=your_groq_api_key
SARVAM_API_KEY=your_sarvam_api_key
```

Never expose these values through Vite variables or frontend code. Vite
variables are shipped to the browser.

### Python dependencies

The root `requirements.txt` is incomplete compared with the imports in the
backend. The active code additionally uses packages such as:

```text
sqlalchemy
groq
ollama
sarvamai
langchain-chroma
langchain-text-splitters
```

When using the existing `venv`, these may already be installed. For a clean
environment, install the root requirements and the missing runtime packages:

```powershell
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install sqlalchemy groq ollama sarvamai langchain-chroma langchain-text-splitters
```

### Start FastAPI

Run the backend from `backend/`. This working directory matters because the
SQLite path, upload path, and Sarvam output path are relative:

```powershell
cd backend
..\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Useful URLs:

| URL | Purpose |
| --- | --- |
| `http://127.0.0.1:8000/` | Health-style status response |
| `http://127.0.0.1:8000/docs` | Swagger API explorer |
| `http://127.0.0.1:8000/redoc` | ReDoc API reference |
| `http://127.0.0.1:8000/openapi.json` | Generated OpenAPI schema |

## Frontend Setup

### Scripts

Run these commands from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `frontend/dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

### Browser requirements

Audio recording uses:

- `navigator.mediaDevices.getUserMedia({ audio: true })`
- The browser `MediaRecorder` API
- A `webm` audio blob uploaded as `recording.webm`

Microphone access generally requires `localhost` or HTTPS. The user must grant
microphone permission. Safari support for recording formats may differ from
Chromium and Firefox, so verify the generated MIME type before broader browser
support is promised.

### Backend address

The backend URL is currently repeated in:

- `frontend/src/App.jsx`
- `frontend/src/components/PatientManagement.jsx`

Both use:

```js
http://127.0.0.1:8000
```

A recommended frontend refactor is to add an API module and use:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then read it with `import.meta.env.VITE_API_BASE_URL`. Do not place secret API
keys in this file.

## End-to-End User Flow

1. Search for a patient by ID or create a patient.
2. Start microphone recording. Recording is blocked until a patient is set.
3. Stop recording to create an in-memory `audio/webm` blob.
4. Choose **Convert To Text**.
5. The frontend sends multipart form data to `POST /transcribe`.
6. Sarvam returns a transcript, detected language, and diarized speaker entries.
7. The frontend formats entries as `Speaker {id}: {text}` in the conversation
   textarea. The user can edit the text.
8. Choose **Generate Clinical Note**.
9. The frontend sends the patient ID and conversation to `POST /generate`.
10. The backend extracts medical terms, retrieves relevant history, asks local
    MedGemma to create the report, saves the consultation, and returns the text.
11. The frontend renders the returned report inside a `<pre>` element.

## Frontend Architecture

### `src/App.jsx`

`App` owns nearly all application state:

| State | Meaning |
| --- | --- |
| `conversation` | Editable transcript sent to `/generate` |
| `response` | Generated clinical report |
| `loading` | Report-generation request state |
| `transcribing` | Audio transcription request state |
| `isRecording` | Whether `MediaRecorder` is active |
| `audioBlob` | Recorded `audio/webm` data |
| `language` | Language code returned by Sarvam |
| `speakerData` | Diarized speaker entries returned by Sarvam |
| `patientId` | Text entered in patient search |
| `patient` | Selected or newly created patient |
| `showCreateForm` | Patient form visibility |
| `newPatient` | Draft patient form values |

The recording chunks and `MediaRecorder` instance are stored in refs to avoid
rerendering for each audio chunk.

### `src/components/PatientManagement.jsx`

This component:

- Searches with `GET /patient/{patient_id}`.
- Creates with `POST /patient/create`.
- Displays the selected patient.
- Receives all state from `App`; it has no local state.

### Empty component files

`Header.jsx`, `InputSection.jsx`, and `ResultCard.jsx` are currently empty. They
look like planned extraction points for the large `App.jsx` component.

### Styling

- `index.css` contains the Vite starter theme, global layout, dark-mode tokens,
  and a centered `#root`.
- `App.css` contains clinical workflow styles.
- Both files define broad element selectors such as `body`, `h1`, `button`, and
  `p`, so cascade order can cause surprising visual overrides.

## API Contract

Base URL during local development:

```text
http://127.0.0.1:8000


The backend currently enables permissive CORS for all origins, methods, and
headers.

### Health check

```http
GET /
```

Response:

```json
{
  "status": "running"
}
```

### Create patient

```http
POST /patient/create
Content-Type: application/json
```

Request:

```json
{
  "name": "Asha Rao",
  "age": 42,
  "gender": "Female",
  "phone": "9876543210"
}
```

Success-shaped response:

```json
{
  "success": true,
  "patient_id": "P1004",
  "message": "Patient Created Successfully"
}
```

Failure-shaped response:

```json
{
  "success": false,
  "message": "error details"
}
```

Frontend notes:

- The backend accepts an untyped dictionary and directly accesses all four
  fields, so send every field.
- `age` is stored as an integer. The current input produces a string and relies
  on database coercion; convert and validate it in the UI.
- A failed operation can still return HTTP 200 with `success: false`.
- IDs are generated as `P1001`, `P1002`, and so on.

### Find patient

```http
GET /patient/{patient_id}
```

Found response:

```json
{
  "exists": true,
  "patient": {
    "patient_id": "P1001",
    "name": "Asha Rao",
    "age": 42,
    "gender": "Female",
    "phone": "9876543210"
  }
}
```

Not-found response:

```json
{
  "exists": false,
  "message": "Patient Not Found"
}
```

The not-found case currently returns HTTP 200, not HTTP 404.

### Transcribe audio

```http
POST /transcribe
Content-Type: multipart/form-data
```

Form field:

| Field | Type | Current frontend value |
| --- | --- | --- |
| `file` | Audio file | `recording.webm` |

Success response:

```json
{
  "status": "success",
  "transcript": "Full transcript text",
  "language": "hi-IN",
  "speakers": [
    {
      "speaker_id": 0,
      "transcript": "Speaker text"
    }
  ]
}
```

Sarvam may include additional fields in each speaker entry. The frontend only
depends on `speaker_id` and `transcript`.

Error response:

```json
{
  "status": "error",
  "message": "error details"
}
```

Frontend notes:

- The route currently forces `language_code="hi-IN"`; language detection is not
  fully automatic despite the UI label.
- The backend waits for the entire external transcription job, so this request
  can take a while.
- Error-shaped responses may still use HTTP 200. Check `data.status`, not only
  Axios rejection.
- The backend recreates one shared `sarvam_output/` directory per request,
  which is unsafe for concurrent transcription requests.

### Generate clinical report

```http
POST /generate
Content-Type: application/json
```

Request:

```json
{
  "patient_id": "P1001",
  "conversation": "Doctor: How are you feeling?\nPatient: I feel tired."
}
```

Response:

```json
{
  "session_id": 12,
  "response": "SOAP NOTE\n..."
}
```

This is a slow endpoint because it can perform:

1. A Groq request for medical keyword extraction.
2. Two Chroma similarity searches.
3. A local Ollama/MedGemma generation.
4. SQLite writes.
5. A Chroma write for the generated report.

The `response` is plain text, not structured JSON. Preserve whitespace when
rendering it.

### List patient sessions

```http
GET /patient/{patient_id}/sessions
```

Response:

```json
[
  {
    "consultation_id": 7,
    "session_id": 12,
    "transcript": "Doctor: ...",
    "report": "SOAP NOTE\n...",
    "created_at": "2026-06-05T08:30:00"
  }
]
```

The list is ordered newest first. The current frontend does not call this
endpoint, but it can power a patient history screen or previous-notes panel.

### Upload file

```http
POST /upload
Content-Type: multipart/form-data
```

Form field:

| Field | Type |
| --- | --- |
| `file` | Any uploaded file |

Response:

```json
{
  "message": "uploaded",
  "filename": "report.pdf"
}
```

Important: this route only writes the file to `backend/app/uploads/`. It does
not call `ingest_pdf`, associate the upload with a patient, or add content to
ChromaDB.

## Data and RAG Flow

### Historical PDF ingestion

`backend/app/rag/ingest.py`:

1. Loads a PDF with `PyPDFLoader`.
2. Splits text into chunks of 800 characters with 150-character overlap.
3. Adds `patient_id` and `source=historical_pdf` metadata.
4. Embeds chunks with `ncbi/MedCPT-Article-Encoder`.
5. Stores them in Chroma collection `history_{patient_id}`.

There is no active API route for this process. The scripts `rebuild.py` and
`test_ingest.py` contain machine-specific, hard-coded PDF paths and patient IDs.

### Report generation

`POST /generate` performs this sequence:

```text
conversation
  -> Groq extracts medical keywords
  -> MedCPT Query Encoder embeds the query
  -> retrieve top 2 historical PDF chunks
  -> retrieve top 2 previous generated reports
  -> combine context + current conversation
  -> local Ollama medgemma:4b generates report text
  -> save transcript/report to SQLite
  -> embed generated report into session_{patient_id}
```

Historical documents use `ncbi/MedCPT-Article-Encoder`; searches use the paired
`ncbi/MedCPT-Query-Encoder`.

### Chroma collections

| Collection | Content |
| --- | --- |
| `history_{patient_id}` | Chunks from imported historical PDFs |
| `session_{patient_id}` | Reports generated by previous consultations |

## Database Model

SQLite is configured as:

```text
sqlite:///./claritynote.db
```

Because this is relative, starting FastAPI from `backend/` points to
`backend/claritynote.db`.

### `patients`

| Column | Type | Notes |
| --- | --- | --- |
| `patient_id` | string | Primary key, generated as `P####` |
| `name` | string | No validation currently |
| `age` | integer | No range validation currently |
| `gender` | string | Free-form |
| `phone` | string | Free-form |
| `created_at` | datetime | UTC default |

### `sessions`

| Column | Type | Notes |
| --- | --- | --- |
| `session_id` | integer | Primary key |
| `patient_id` | string | Not declared as a foreign key |
| `created_at` | datetime | UTC default |

### `consultations`

| Column | Type | Notes |
| --- | --- | --- |
| `consultation_id` | integer | Primary key |
| `session_id` | integer | Not declared as a foreign key |
| `patient_id` | string | Patient association |
| `transcript` | text | Submitted conversation |
| `report` | text | Generated clinical note |
| `created_at` | datetime | UTC default |

The `reports` table exists but is not used by the active report-generation
flow.

## Current Limitations

Frontend developers should account for these current implementation details:

1. API URLs are hard-coded instead of using `VITE_API_BASE_URL`.
2. API errors often return HTTP 200 with an error object.
3. Patient request bodies are not validated by Pydantic.
4. The UI does not check `success` after patient creation.
5. The UI does not check `status` after transcription.
6. There are no request cancellation, timeout, retry, or progress mechanisms.
7. Recording tracks are not explicitly stopped after `MediaRecorder.stop()`, so
   the browser may continue showing microphone use.
8. Starting a new patient does not clear the previous transcript, recording, or
   report.
9. Generated reports are plain text and have no stable section schema.
10. Session history exists in the API but is not displayed.
11. PDF upload and PDF ingestion are separate; upload does not update RAG.
12. Transcription is forced to Hindi (`hi-IN`) in the active route.
13. There is no authentication or authorization, despite sensitive patient
    data.
14. CORS currently allows every origin and should be restricted for deployment.
15. The checked-in source tree contains local databases, vector data, sample
    medical documents, `.env`, dependency directories, and archives. These
    should be reviewed before sharing or deploying the repository.
16. Initial embedding-model downloads can be large and make backend startup or
    first use slow.
17. `POST /generate` assumes the patient's history and session Chroma
    collections can be queried; empty/missing collection behavior should be
    tested before relying on first-visit generation.

## Recommended Frontend Improvements

Suggested implementation order:

1. Add `src/api/client.js` with an Axios instance and configurable base URL.
2. Add typed runtime schemas or migrate the frontend to TypeScript.
3. Split `App.jsx` into patient, recorder, transcript, and report components.
4. Replace `alert()` with inline success/error states.
5. Validate patient fields before submission.
6. Handle backend `success` and `status` fields explicitly.
7. Add disabled states to prevent duplicate requests.
8. Stop every microphone stream track when recording finishes.
9. Add a session-history panel using
   `GET /patient/{patient_id}/sessions`.
10. Agree on structured report JSON before building section-specific UI.
11. Add loading copy that explains transcription and generation can take time.
12. Add mock API responses or Mock Service Worker for backend-independent UI
    development.

## Troubleshooting

### Frontend says `Backend Error`

- Confirm FastAPI is running on `http://127.0.0.1:8000`.
- Open `/docs` and try the endpoint directly.
- Check that Ollama is running and `medgemma:4b` is installed.
- Check backend logs for Groq, Chroma, embedding-model, or Ollama errors.

### Transcription fails

- Confirm `SARVAM_API_KEY` is set in `backend/.env`.
- Confirm the browser granted microphone permission.
- Check the browser generated a non-empty `audioBlob`.
- Inspect the JSON body even when the HTTP status is 200; it may contain
  `{"status":"error"}`.

### Report generation fails on a new patient

- The patient may not have a historical Chroma collection yet.
- Ingest a PDF for that patient or make retrieval tolerant of empty collections.
- Confirm `GROQ_API_KEY` is valid.
- Confirm the Ollama service is reachable.

### A different SQLite file appears

Start the backend from `backend/`. The database URL is relative to the process
working directory.

### PowerShell blocks virtual-environment activation

For the current shell session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### Production build check

```powershell
cd frontend
npm run lint
npm run build
```

The production frontend still expects the backend at
`http://127.0.0.1:8000` until the API base URL is made configurable.