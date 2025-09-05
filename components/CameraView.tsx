
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraFlipIcon, CloseIcon } from './Icons';

interface CameraViewProps {
  onCapture: (imageBase64: string) => void;
  onExit: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onExit }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  };
  
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white p-4">
        <p className="text-red-500 text-center mb-4">{error}</p>
        <button onClick={onExit} className="px-4 py-2 bg-gray-700 rounded-md">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
      <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
      
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end">
         <button
          onClick={onExit}
          className="bg-black/50 text-white rounded-full p-3 transition hover:bg-black/75"
          aria-label="Close camera"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center">
        <div className="w-full flex justify-around items-center max-w-sm">
             <div className="w-16 h-16"></div>
            <button
              onClick={handleCapture}
              className="w-20 h-20 bg-white rounded-full border-4 border-black ring-2 ring-white transition-transform duration-200 active:scale-90"
              aria-label="Take picture"
            />
            <button onClick={toggleCamera} className="bg-gray-800/80 p-3 rounded-full" aria-label="Flip Camera">
                <CameraFlipIcon className="w-8 h-8 text-white"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CameraView;
