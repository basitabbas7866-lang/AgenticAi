import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-page w-full min-h-screen overflow-x-hidden bg-lp-bg backdrop-blur-sm text-lp-text font-body antialiased text-left">
      <Navbar onEnterApp={() => navigate("/auth")} />
      <Hero onEnterApp={() => navigate("/auth")} />
      <Stats />
      <Features />
      <Workflow />
      <Testimonials />
      <CTA onEnterApp={() => navigate("/auth")} />
      <Footer />
    </main>
  );
}

export default LandingPage;