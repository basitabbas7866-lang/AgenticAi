# ClarityNote AI - Clinical Documentation Assistant (Frontend)

This is the React + Vite frontend workspace for **ClarityNote AI**, an ambient clinical documentation assistant designed for healthcare practitioners. It captures clinical dialogue, generates structured SOAP notes, syncs with EHR registries, and provides print-ready SOP exports and WhatsApp reports.

---

## 🚀 Key Features

*   **Ambient Dictation Station**: Real-time microphone audio recording with a dynamic, scrolling waveform timeline (oscillogram) powered by the Web Audio API.
*   **Structured SOAP Note Engine**: Live Markdown compilation, diagnosis confidence meters, inline clinical formatting toolbar, and dual preview/edit modes.
*   **EMR Patient Directory**: Split-pane medical records dashboard separating registries from active charts (Overview, Histories, Documents, and Prescriptions).
*   **Holographic Practitioner Profile**: High-fidelity security console showing active HL7 FHIR nodes, network latencies, connection logs, and active session tokens.
*   **SOP Printable Layout**: High-quality standard operating procedure (SOP) PDF printer format with clinical signature blocks and dual borders.

---

## 🛠️ Environment Configuration

Before building or running the project, you must set up the backend connection.

1. Navigate to the `frontend/` directory.
2. Verify or create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
   *Replace `http://localhost:8000` with your production backend URL if deploying to a live server.*

---

## 💻 Local Development

Ensure you have **Node.js (v18 or higher)** and **npm** installed.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *By default, the server will launch on `http://localhost:5173/`.*

3. **Verify Dev Build**:
   Open the local port in your browser. Note that modern browsers require secure origins (`localhost` or `https://`) to allow microphone access (`getUserMedia`).

---

## 📦 Production Build & Deployment

### 1. Compile the Static Bundle
To build the application for production hosting:
```bash
npm run build
```
This generates optimized, minified static HTML, CSS, and JS bundles inside the **`dist/`** directory.

### 2. Static Hosting Providers
You can deploy the contents of the `dist/` folder directly to any static web hosting service.

#### 🌌 Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the `frontend/` directory and follow the prompts.
3. To handle React Router client-side routing, Vercel automatically reads the configuration. If needed, create a `vercel.json` in the root:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

#### ⚡ Option B: Netlify
1. Drag and drop the `dist/` folder to the Netlify dashboard or use the Netlify CLI.
2. To support client-side routing on page refresh, add a `_redirects` file inside the `public/` directory (which copies to `dist/` on build) containing:
   ```text
   /*   /index.html   200
   ```

#### 🛡️ Option C: Nginx (VPS / Self-Hosted)
If deploying to your own Linux server running Nginx, copy the contents of `dist/` to `/var/www/html` and add the following block to your Nginx configuration to support routing redirects:
```nginx
server {
    listen 80;
    server_name your-clinical-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ⚙️ Tech Stack

*   **Runtime/Bundler**: Node.js, Vite 8
*   **Logic & UI**: React 18, Tailwind CSS v4, Framer Motion
*   **Utility Icons**: React Icons (FontAwesome)
*   **API Client**: Axios (Centralized under `src/api/index.js`)
*   **Native Printing**: CSS Media Print Queries
*   **Media Analysis**: Web Audio API (AnalyserNode)
