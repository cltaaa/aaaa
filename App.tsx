
import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import SettingsPage from './components/SettingsPage';
import CameraView from './components/CameraView';
import ResultView from './components/ResultView';
import { useSettings } from './hooks/useSettings';
// Fix: Import 'Mode' as a value because it is an enum used at runtime, while 'Page' is imported as a type.
import { Mode, type Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { settings, saveSettings, isLoaded } = useSettings();

  const handlePhotoTaken = useCallback((imageBase64: string) => {
    setCapturedImage(imageBase64);
    setCurrentPage('result');
  }, []);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);
  
  const handleGoHome = useCallback(() => {
    setCapturedImage(null);
    setCurrentPage('home');
  }, []);


  const renderContent = () => {
    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
          <p>Loading Settings...</p>
        </div>
      );
    }
    
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'settings':
        return <SettingsPage navigateTo={navigateTo} settings={settings} saveSettings={saveSettings} />;
      case 'camera':
        return <CameraView onCapture={handlePhotoTaken} onExit={() => navigateTo('home')} />;
      case 'result':
        if (!capturedImage || !settings[Mode.RAINBOW]) {
          handleGoHome();
          return null;
        }
        return (
          <ResultView
            capturedImage={capturedImage}
            settings={settings[Mode.RAINBOW]}
            onBack={handleGoHome}
          />
        );
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default App;
