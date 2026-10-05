import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState('08:00');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start sm:p-4 select-none">
      {/* Top Device Mode Toolbar */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-slate-300">SimSis Mobile Preview</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              isPhoneFrame ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="Tampilan Smartphone Android"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>HP</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              !isPhoneFrame ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="Tampilan Luas / Tablet"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Layar Luas</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col bg-slate-50 overflow-hidden shadow-2xl ${
          isPhoneFrame
            ? 'max-w-md sm:rounded-[36px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700 min-h-screen sm:min-h-[844px] sm:max-h-[92vh]'
            : 'max-w-4xl sm:rounded-2xl sm:border border-slate-700 min-h-screen sm:min-h-[85vh]'
        }`}
      >
        {/* Android Status Bar */}
        <div className="bg-blue-800 text-white px-5 pt-1.5 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wide shrink-0">
          <span className="font-mono">{currentTime}</span>

          {/* Punch-hole camera dot for phone frame */}
          {isPhoneFrame && (
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800/80 shadow-inner"></div>
          )}

          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <span className="text-[10px] font-mono">100%</span>
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {children}
        </div>

        {/* Android Gesture Bar */}
        {isPhoneFrame && (
          <div className="h-4 bg-slate-100 flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-400 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
