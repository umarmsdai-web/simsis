import React from 'react';
import { ArrowLeft, MessageSquare, Phone, Heart, Shield } from 'lucide-react';
import { SimSisLogo } from '../components/SimSisLogo';
import { getMsdWhatsAppUrl } from '../utils/whatsapp';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const handleContactWhatsApp = () => {
    window.open(getMsdWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Top Bar */}
      <div className="bg-blue-700 text-white p-4 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-blue-100 hover:text-white font-medium text-xs py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Tentang Aplikasi
        </span>
        <div className="w-12"></div>
      </div>

      <div className="p-5 max-w-md mx-auto w-full space-y-4">
        {/* Brand Hero */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center flex flex-col items-center">
          <SimSisLogo size={80} className="shadow-lg mb-3" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            SimSis
          </h2>
          <p className="text-sm font-semibold text-blue-700">
            Simpanan Siswa
          </p>
          <span className="text-[11px] font-mono text-slate-400 mt-1 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Versi 1.0.0
          </span>
        </div>

        {/* Tentang SimSis (Section 21) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tentang SimSis
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            SimSis adalah aplikasi sederhana untuk membantu guru, wali kelas, dan bendahara kelas dalam mencatat simpanan siswa, transaksi setoran dan penarikan, melihat saldo, mutasi, serta membuat laporan dengan mudah.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Aplikasi dirancang agar pencatatan simpanan siswa menjadi lebih cepat, rapi, dan praktis.
          </p>
        </div>

        {/* Dibuat Oleh (Section 21 & 39) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Dibuat Oleh
          </h3>

          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
            <h4 className="text-base font-extrabold text-blue-900">
              MSD Temanggung
            </h4>
            <p className="text-xs text-blue-700 font-medium">
              by Umar
            </p>

            <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Kontak WhatsApp:</span>
              <span className="font-mono font-bold text-slate-800">082138950006</span>
            </div>
          </div>

          <button
            onClick={handleContactWhatsApp}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Hubungi via WhatsApp</span>
          </button>
        </div>

        {/* Offline & Privacy guarantee */}
        <div className="flex items-center gap-2 px-3 text-[11px] text-slate-400">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Data disimpan lokal di perangkat. Bebas iklan & bebas pelacakan.</span>
        </div>

        {/* Footer (Section 21) */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 font-medium">
            © 2026 MSD Temanggung. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
