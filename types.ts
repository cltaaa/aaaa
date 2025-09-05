
export type Page = 'home' | 'settings' | 'camera' | 'result';

export enum Mode {
  RAINBOW = 'rainbow',
}

export interface ModeSettings {
  prompt: string;
  referenceImage: string | null;
}

export type AppSettings = {
  [key in Mode]: ModeSettings;
};
