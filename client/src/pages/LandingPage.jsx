import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/navigation/LandingNavbar';
import HeroSection from '../components/hero/HeroSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import FeatureStorySection from '../components/sections/FeatureStorySection';
import BuiltForDevelopersSection from '../components/sections/BuiltForDevelopersSection';
import FinalCtaSection from '../components/sections/FinalCtaSection';
import LandingFooter from '../components/navigation/LandingFooter';
import PageTransition from '../components/ui/PageTransition';
import SmoothScrollProvider from '../components/motion/SmoothScrollProvider';
import { ScrollProgressBar } from '../components/motion/ScrollEffects';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleExplore = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <SmoothScrollProvider>
      <PageTransition>
        <div className="bg-tech-grid" style={{ minHeight: '100vh', width: '100%' }}>
          <LandingNavbar onStartBuilding={handleStartBuilding} onSignIn={handleSignIn} />
          
          <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <HeroSection onStartBuilding={handleStartBuilding} onExplore={handleExplore} />
            <HowItWorksSection />
            <FeatureStorySection />
            <BuiltForDevelopersSection />
            <FinalCtaSection onStartBuilding={handleStartBuilding} onExplore={handleExplore} />
          </main>

          <LandingFooter />
        </div>
      </PageTransition>
    </SmoothScrollProvider>
  );
}
