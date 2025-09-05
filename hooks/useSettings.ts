
import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, ModeSettings } from '../types';
import { Mode } from '../types';

const DEFAULT_PROMPT = "In the main photo of the person, edit them to be holding a small card or sign that clearly displays the provided reference image.";

const initialSettings: AppSettings = {
  [Mode.RAINBOW]: {
    prompt: DEFAULT_PROMPT,
    referenceImage: null,
  },
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Ensure all modes are present, even if new ones were added
        const mergedSettings = { ...initialSettings, ...parsedSettings };
        setSettings(mergedSettings);
      } else {
        setSettings(initialSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      setSettings(initialSettings);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveSettings = useCallback((mode: Mode, newModeSettings: ModeSettings) => {
    setSettings(prevSettings => {
      const updatedSettings = {
        ...prevSettings,
        [mode]: newModeSettings,
      };
      try {
        localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
      }
      return updatedSettings;
    });
  }, []);

  return { settings, saveSettings, isLoaded };
};
