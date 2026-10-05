import React, { useEffect } from 'react';
import { SimSisLogo } from './SimSisLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-blue-700 to-blue-900 text-white p-8 select-none cursor-pointer transition-opacity duration-300"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative mb-6 transform transition-transform animate-bounce duration-1000">
          <SimSisLogo size={96} className="shadow-2xl" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
          SimSis
        </h1>
        <p className="text-blue-100 text-base font-medium tracking-wide">
          Simpanan Siswa
        </p>

        <div className="mt-8 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping"></span>
          <span className="text-xs text-blue-200">Memuat data lokal...</span>
        </div>
      </div>

      <div className="text-center pb-4">
        <p className="text-xs text-blue-200 tracking-wider font-semibold uppercase">
          Dibuat oleh:
        </p>
        <p className="text-sm font-bold text-white tracking-wide">
          MSD Temanggung
        </p>
        <p className="text-xs text-blue-200 font-medium">
          by Umar
        </p>
      </div>
    </div>
  );
};
