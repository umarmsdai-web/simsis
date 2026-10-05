import React, { useState } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { SplashScreen } from './components/SplashScreen';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { FAB } from './components/FAB';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { SiswaScreen } from './screens/SiswaScreen';
import { DetailSiswaScreen } from './screens/DetailSiswaScreen';
import { TransaksiScreen } from './screens/TransaksiScreen';
import { MutasiScreen } from './screens/MutasiScreen';
import { LaporanScreen } from './screens/LaporanScreen';
import { PengaturanScreen } from './screens/PengaturanScreen';
import { AboutScreen } from './screens/AboutScreen';

import type { ActiveTab, JenisTransaksi } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

  // Sub-navigation states
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);
  const [isDetailSiswaOpen, setIsDetailSiswaOpen] = useState(false);
  const [isMutasiOpen, setIsMutasiOpen] = useState(false);
  const [mutasiTargetSiswaId, setMutasiTargetSiswaId] = useState<string | undefined>(undefined);

  // Pre-fill parameters for Transaksi
  const [transaksiPreFill, setTransaksiPreFill] = useState<{
    siswaId?: string;
    jenis?: JenisTransaksi;
  }>({});

  const handleOpenDetailSiswa = (siswaId: string) => {
    setSelectedSiswaId(siswaId);
    setIsDetailSiswaOpen(true);
    setIsMutasiOpen(false);
  };

  const handleOpenTambahTransaksi = (siswaId?: string, jenis?: JenisTransaksi) => {
    setTransaksiPreFill({ siswaId, jenis });
    setIsDetailSiswaOpen(false);
    setIsMutasiOpen(false);
    setCurrentTab('transaksi');
  };

  const handleOpenMutasi = (siswaId?: string) => {
    setMutasiTargetSiswaId(siswaId);
    setIsMutasiOpen(true);
    setIsDetailSiswaOpen(false);
  };

  const handleBackToMain = () => {
    if (isMutasiOpen && selectedSiswaId) {
      setIsMutasiOpen(false);
      setIsDetailSiswaOpen(true);
      return;
    }
    setIsMutasiOpen(false);
    setIsDetailSiswaOpen(false);
    if (currentTab === 'about') {
      setCurrentTab('pengaturan');
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <AndroidFrame>
        {/* Top App Bar */}
        <TopBar
          title={
            currentTab === 'about'
              ? 'Tentang SimSis'
              : currentTab === 'pengaturan'
              ? 'Pengaturan'
              : 'SimSis'
          }
          subtitle={
            currentTab === 'about'
              ? 'MSD Temanggung by Umar'
              : 'Simpanan Siswa'
          }
          showBack={isDetailSiswaOpen || isMutasiOpen || currentTab === 'about'}
          onBack={handleBackToMain}
          onOpenSettings={() => {
            setIsDetailSiswaOpen(false);
            setIsMutasiOpen(false);
            setCurrentTab('pengaturan');
          }}
        />

        {/* Dynamic Screen Routing */}
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          {isDetailSiswaOpen && selectedSiswaId ? (
            <DetailSiswaScreen
              siswaId={selectedSiswaId}
              onBack={() => setIsDetailSiswaOpen(false)}
              onOpenTambahTransaksi={handleOpenTambahTransaksi}
              onOpenMutasi={handleOpenMutasi}
            />
          ) : isMutasiOpen ? (
            <MutasiScreen
              initialSiswaId={mutasiTargetSiswaId}
              onBack={() => setIsMutasiOpen(false)}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardScreen
              onNavigate={(tab) => {
                setIsDetailSiswaOpen(false);
                setIsMutasiOpen(false);
                setCurrentTab(tab);
              }}
              onOpenDetailSiswa={handleOpenDetailSiswa}
              onOpenTambahTransaksi={handleOpenTambahTransaksi}
              onOpenMutasi={handleOpenMutasi}
            />
          ) : currentTab === 'siswa' ? (
            <SiswaScreen
              onSelectSiswa={handleOpenDetailSiswa}
              onOpenTambahTransaksi={handleOpenTambahTransaksi}
            />
          ) : currentTab === 'transaksi' ? (
            <TransaksiScreen
              initialSiswaId={transaksiPreFill.siswaId}
              initialJenis={transaksiPreFill.jenis}
              onSuccessNavigate={() => {
                setTransaksiPreFill({});
              }}
              onNavigateToSiswa={() => setCurrentTab('siswa')}
            />
          ) : currentTab === 'laporan' ? (
            <LaporanScreen />
          ) : currentTab === 'pengaturan' ? (
            <PengaturanScreen onNavigateAbout={() => setCurrentTab('about')} />
          ) : currentTab === 'about' ? (
            <AboutScreen onBack={() => setCurrentTab('pengaturan')} />
          ) : null}
        </main>

        {/* Floating Action Button for quick transaction logging */}
        {!isDetailSiswaOpen && !isMutasiOpen && currentTab !== 'transaksi' && (
          <FAB onClick={() => handleOpenTambahTransaksi()} />
        )}

        {/* Material 3 Bottom Navigation Bar */}
        {!isDetailSiswaOpen && !isMutasiOpen && (
          <BottomNav
            currentTab={currentTab}
            onTabChange={(tab) => {
              setIsDetailSiswaOpen(false);
              setIsMutasiOpen(false);
              setTransaksiPreFill({});
              setCurrentTab(tab);
            }}
          />
        )}
      </AndroidFrame>
    </>
  );
}
