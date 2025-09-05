
import React, { useState, useRef, useEffect } from 'react';
import type { Page, AppSettings, ModeSettings } from '../types';
import { Mode } from '../types';
import { fileToBase64 } from '../utils/imageUtils';
import { ArrowLeftIcon, UploadIcon } from './Icons';

interface SettingsPageProps {
  navigateTo: (page: Page) => void;
  settings: AppSettings;
  saveSettings: (mode: Mode, newSettings: ModeSettings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ navigateTo, settings, saveSettings }) => {
  const [prompt, setPrompt] = useState(settings[Mode.RAINBOW].prompt);
  const [referenceImage, setReferenceImage] = useState<string | null>(settings[Mode.RAINBOW].referenceImage);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPrompt(settings[Mode.RAINBOW].prompt);
    setReferenceImage(settings[Mode.RAINBOW].referenceImage);
  }, [settings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const mimeType = file.type;
        setReferenceImage(`data:${mimeType};base64,${base64}`);
      } catch (error) {
        console.error("Error converting file to base64", error);
        setFeedback('Error processing image. Please try another.');
      }
    }
  };

  const handleSave = () => {
    saveSettings(Mode.RAINBOW, { prompt, referenceImage });
    setFeedback('Settings saved successfully!');
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div className="relative flex flex-col h-screen w-screen bg-gray-900 p-6 overflow-y-auto">
      <header className="flex items-center mb-8">
        <button
          onClick={() => navigateTo('home')}
          className="text-gray-400 hover:text-white transition-colors duration-200 p-2 -ml-2"
          aria-label="Back to Home"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold ml-4">Rainbow Mode Settings</h1>
      </header>

      <div className="space-y-8 flex-grow">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            AI Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            placeholder="Describe what the AI should do..."
          />
           <p className="mt-2 text-xs text-gray-500">The AI will use this instruction along with your photo and the reference image.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reference Image
          </label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md cursor-pointer hover:border-purple-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            {referenceImage ? (
              <img src={referenceImage} alt="Reference preview" className="max-h-48 object-contain rounded-md" />
            ) : (
              <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-400">
                  <p className="pl-1">Upload an image</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>
      
      <footer className="mt-8 flex items-center justify-between">
          <div className="text-green-400 text-sm h-5">{feedback}</div>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200"
          >
            Save Settings
          </button>
      </footer>
    </div>
  );
};

export default SettingsPage;
