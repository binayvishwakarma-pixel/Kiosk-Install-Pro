import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';
import { GeoLocation } from '../types';

interface CameraCaptureProps {
  onCapture: (dataUrl: string, location: GeoLocation, timestamp: string) => void;
  label: string;
}

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment" // Use back camera
};

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label }) => {
  const webcamRef = useRef<Webcam>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (err) => {
        setError("Unable to retrieve location. Please enable GPS.");
        console.error(err);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    setIsCapturing(true);

    const imageSrc = webcamRef.current.getScreenshot();
    
    if (imageSrc && location) {
      // Create a canvas to add watermark
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = imageSrc;
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Add semi-transparent black bar at bottom
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

          // Add text
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          const timestamp = new Date().toLocaleString();
          const geoText = `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`;
          
          ctx.fillText(timestamp, 20, canvas.height - 45);
          ctx.fillText(geoText, 20, canvas.height - 15);

          // Export
          const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.8);
          onCapture(watermarkedUrl, location, timestamp);
        }
        setIsCapturing(false);
      };
    } else if (!location) {
        alert("Waiting for GPS location...");
        setIsCapturing(false);
    }
  }, [webcamRef, location, onCapture]);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-black rounded-xl overflow-hidden shadow-xl">
      <div className="relative w-full aspect-video bg-gray-900">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
        />
        {!location && (
             <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                Acquiring GPS...
             </div>
        )}
        {location && (
             <div className="absolute top-4 left-4 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle size={12} /> GPS Locked
             </div>
        )}
      </div>

      <div className="p-4 w-full bg-gray-800 flex justify-between items-center">
        <div className="text-white text-sm font-medium">{label}</div>
        <button
          onClick={capture}
          disabled={!location || isCapturing}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all
            ${!location || isCapturing ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-500/30'}`}
        >
          <Camera size={20} />
          {isCapturing ? 'Processing...' : 'Capture'}
        </button>
      </div>
    </div>
  );
};