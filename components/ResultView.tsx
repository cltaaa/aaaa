
import React, { useState, useEffect } from 'react';
import type { ModeSettings } from '../types';
import { generateImageWithReference } from '../services/geminiService';
import { ArrowLeftIcon, DownloadIcon } from './Icons';
import Loader from './Loader';

interface ResultViewProps {
  capturedImage: string;
  settings: ModeSettings;
  onBack: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ capturedImage, settings, onBack }) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      if (!settings.referenceImage) {
        setError('A reference image must be set in settings.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await generateImageWithReference(capturedImage, settings.referenceImage, settings.prompt);
        setGeneratedImage(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage, settings]);

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-screen bg-gray-900 p-6 overflow-hidden">
        <header className="flex items-center mb-6">
            <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 -ml-2"
                aria-label="Back to Home"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold ml-4">Result</h1>
        </header>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-300 mb-4">Original</h2>
                <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain rounded-md" />
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-300 mb-4">Generated</h2>
                <div className="w-full h-full flex items-center justify-center">
                    {isLoading && <Loader />}
                    {error && <div className="text-red-400 text-center p-4">{error}</div>}
                    {!isLoading && generatedImage && (
                        <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain rounded-md" />
                    )}
                </div>
            </div>
        </div>

        <footer className="mt-6 flex justify-center">
            {generatedImage && !isLoading && (
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200"
                >
                    <DownloadIcon className="w-5 h-5"/>
                    Download
                </button>
            )}
        </footer>
    </div>
  );
};

export default ResultView;
