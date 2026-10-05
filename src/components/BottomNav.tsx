import React from 'react';
import { LayoutDashboard, Users, ArrowLeftRight, FileText } from 'lucide-react';
import type { ActiveTab } from '../types';

interface BottomNavProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'siswa', label: 'Siswa', icon: Users },
    { id: 'transaksi', label: 'Transaksi', icon: ArrowLeftRight },
    { id: 'laporan', label: 'Laporan', icon: FileText },
  ] as const;

  return (
    <nav className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ActiveTab)}
              className="flex flex-col items-center justify-center w-full h-full text-center relative py-1 focus:outline-none transition-colors active:scale-95"
            >
              <div
                className={`px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'font-bold text-blue-700' : 'font-medium text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
