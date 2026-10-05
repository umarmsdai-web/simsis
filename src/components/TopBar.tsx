import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { SimSisLogo } from './SimSisLogo';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'SimSis',
  subtitle = 'Simpanan Siswa',
  showBack = false,
  onBack,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-blue-700 text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3 h-14">
        {/* Left Section: Back or Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-white hover:bg-blue-800 rounded-full active:scale-95 transition-all"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <SimSisLogo size={32} />
          )}

          <div className="truncate">
            <h1 className="text-base font-bold leading-tight tracking-tight text-white truncate">
              {title}
            </h1>
            <p className="text-[11px] text-blue-100 font-medium truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-1">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-800 rounded-full active:scale-95 transition-all"
              aria-label="Pengaturan"
              title="Pengaturan"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
