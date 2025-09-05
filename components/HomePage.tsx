
import React from 'react';
import type { Page } from '../types';
import { GearIcon, RainbowIcon } from './Icons';

interface HomePageProps {
  navigateTo: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-gray-900 p-4 overflow-hidden">
      <button
        onClick={() => navigateTo('settings')}
        className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors duration-200 z-10 p-2"
        aria-label="Settings"
      >
        <GearIcon className="w-8 h-8" />
      </button>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          Nano Banana
        </h1>
        <p className="mt-4 text-lg text-gray-300">Creative Image Generator</p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-xs">
        <ModeButton
          label="Rainbow Mode"
          icon={<RainbowIcon className="w-10 h-10" />}
          onClick={() => navigateTo('camera')}
        />
      </div>
       <footer className="absolute bottom-4 text-gray-500 text-xs">
        Powered by Gemini
      </footer>
    </div>
  );
};


interface ModeButtonProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:-translate-y-1"
    >
        <div className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
            {icon}
        </div>
        <span className="mt-4 text-xl font-semibold text-white">{label}</span>
    </button>
);


export default HomePage;
