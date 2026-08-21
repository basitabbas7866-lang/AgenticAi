import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import SoapGenerationPage from "./pages/SoapGenerationPage";

function App() {
  return (
    <Routes>
      {/* 1. Main public landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Fully animated Login/Register gate */}
      <Route path="/auth" element={<AuthPage />} />

      {/* 3. Protected/Internal clinician dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* 4. Structured SOAP Clinical Generation */}
      <Route path="/soap-generation" element={<SoapGenerationPage />} />
    </Routes>
  );
}

export default App;