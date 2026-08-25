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

  const handleEnterAuth = () => {
    navigate("/auth");
  };

  return (
    <main className="landing-page w-full min-h-screen overflow-x-hidden bg-white/5 text-stone-800 font-body antialiased text-left">
      <Navbar onEnterApp={handleEnterAuth} />
      <Hero onEnterApp={handleEnterAuth} />
      <Stats />
      <Features onEnterApp={handleEnterAuth} />
      <Workflow onEnterApp={handleEnterAuth} />
      <Testimonials />
      <CTA onEnterApp={handleEnterAuth} />
      <Footer />
    </main>
  );
}

export default LandingPage;