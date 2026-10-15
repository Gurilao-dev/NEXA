import React from 'react';
import { HeroScene } from './HeroScene.js';
import { ScrollCinemaA } from './ScrollCinemaA.js';
import { BenefitsSection } from './BenefitsSection.js';
import { TimelineSection } from './TimelineSection.js';
import { InteractiveDemo } from './InteractiveDemo.js';
import { FaqSection } from './FaqSection.js';
import { Footer } from './Footer.js';

interface LandingPageProps {
  onGoToCatalog: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToCatalog }) => {
  return (
    <div className="flex flex-col w-full">
      <HeroScene onExplore={onGoToCatalog} />
      <ScrollCinemaA />
      <BenefitsSection />
      <TimelineSection />
      <InteractiveDemo />
      <FaqSection />
      <Footer />
    </div>
  );
};
