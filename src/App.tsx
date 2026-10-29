/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { RecentDetectionsList } from './components/RecentDetectionsList';
import { AIDetectionModule } from './components/AIDetectionModule';
import { ReportsModule } from './components/ReportsModule';
import { MobileAppSimulator } from './components/MobileAppSimulator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { UploadDamageTool } from './components/UploadDamageTool';
import { DataManagementModule } from './components/DataManagementModule';
import { SettingsModule } from './components/SettingsModule';
import { DetectionDetailModal } from './components/DetectionDetailModal';
import { ExportReportModal } from './components/ExportReportModal';
import { MetricsOverview } from './components/MetricsOverview';
import { FeatureHighlights } from './components/FeatureHighlights';
import { INITIAL_DETECTIONS, APP_LOGO_IMG } from './data/mockData';
import { DamageDetection, ActiveTab, DamageType, DefectStatus } from './types/damage';
import { Language, translations } from './i18n/translations';

export default function App() {
  const [detections, setDetections] = useState<DamageDetection[]>(INITIAL_DETECTIONS);
  const [selectedDetection, setSelectedDetection] = useState<DamageDetection | null>(INITIAL_DETECTIONS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<DamageType | 'all'>('all');
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `Jan 1, ${now.getFullYear()} - ${today}`;
  });
  const [mobileSimOpen, setMobileSimOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'auto' | 'desktop' | 'mobile'>('auto');
  const [detailModalItem, setDetailModalItem] = useState<DamageDetection | null>(null);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Bilingual state: English or Khmer
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('roaddamage_lang');
      return (saved === 'km' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('roaddamage_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = translations[language];

  // Screen width detection for graceful desktop simulation preview
  const [isDesktopScreen, setIsDesktopScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-lang', language);
  }, [language]);

  // Dynamic counts based on active detections
  const manholeHazardsCount = detections.filter(d => d.type === 'manhole_hazard').length;
  const counts = {
    total: detections.length >= 254 ? detections.length : 254,
    potholes: detections.filter(d => d.type === 'pothole').length >= 178 
      ? detections.filter(d => d.type === 'pothole').length 
      : 178,
    cracks: detections.filter(d => d.type === 'crack' || d.type === 'longitudinal_crack').length >= 34 
      ? detections.filter(d => d.type === 'crack' || d.type === 'longitudinal_crack').length 
      : 34,
    longitudinalCracks: detections.filter(d => d.type === 'crack' || d.type === 'longitudinal_crack').length >= 34 
      ? detections.filter(d => d.type === 'crack' || d.type === 'longitudinal_crack').length 
      : 34,
    transverseCracks: detections.filter(d => d.type === 'transverse_crack').length >= 18 
      ? detections.filter(d => d.type === 'transverse_crack').length 
      : 18,
    alligatorCracks: detections.filter(d => d.type === 'alligator_crack').length >= 15 
      ? detections.filter(d => d.type === 'alligator_crack').length 
      : 15,
    manholeHazards: manholeHazardsCount >= 24 ? manholeHazardsCount : 24,
    other: detections.filter(d => d.type === 'other').length >= 15 
      ? detections.filter(d => d.type === 'other').length 
      : 15,
  };

  const handleSaveNewDetection = (newDet: DamageDetection) => {
    setDetections(prev => [newDet, ...prev]);
    setSelectedDetection(newDet);
  };

  const handleUpdateStatus = (id: string, status: DefectStatus) => {
    setDetections(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    if (selectedDetection?.id === id) {
      setSelectedDetection(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleDeleteDetection = (id: string) => {
    setDetections(prev => prev.filter(d => d.id !== id));
    if (selectedDetection?.id === id) {
      setSelectedDetection(detections[1] || null);
    }
  };

  // Render core workspace tab content
  const renderTabContent = (isMobileLayout: boolean) => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
            {/* Top 6 Defect Type Summary Cards */}
            <MetricsOverview
              counts={counts}
              selectedTypeFilter={selectedTypeFilter}
              onSelectTypeFilter={setSelectedTypeFilter}
              language={language}
            />

            {/* Middle Section: Damage Locations Satellite Map & Recent Detections List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
              {/* Damage Locations Map */}
              <div className="lg:col-span-8 min-h-[340px] md:min-h-[460px]">
                <InteractiveMap 
                  detections={detections}
                  selectedDetection={selectedDetection}
                  onSelectDetection={setSelectedDetection}
                  onOpenDetails={(det) => setDetailModalItem(det)}
                  typeFilter={selectedTypeFilter}
                  language={language}
                />
              </div>

              {/* Recent Detections Panel */}
              <div className="lg:col-span-4 min-h-[340px] md:min-h-[460px]">
                <RecentDetectionsList 
                  detections={detections}
                  selectedDetection={selectedDetection}
                  onSelectDetection={setSelectedDetection}
                  onViewAll={() => setActiveTab('data')}
                  typeFilter={selectedTypeFilter}
                  language={language}
                />
              </div>
            </div>

            {/* Bottom 5 Feature Highlights Shortcuts */}
            <FeatureHighlights 
              onSelectFeature={(tab) => setActiveTab(tab)}
              language={language}
            />
          </div>
        );

      case 'detection':
        return (
          <div className="max-w-[1400px] mx-auto space-y-6">
            <AIDetectionModule 
              onSaveNewDetection={handleSaveNewDetection}
              standalone={true}
              language={language}
              onOpenUploadTool={() => setActiveTab('upload')}
            />
          </div>
        );

      case 'upload':
        return (
          <UploadDamageTool 
            onSaveNewDetection={handleSaveNewDetection}
            language={language}
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToCamera={() => setActiveTab('detection')}
          />
        );

      case 'map':
        return (
          <div className="h-[75vh] md:h-[calc(100vh-140px)] flex flex-col">
            <InteractiveMap 
              detections={detections}
              selectedDetection={selectedDetection}
              onSelectDetection={setSelectedDetection}
              onOpenDetails={(det) => setDetailModalItem(det)}
              typeFilter={selectedTypeFilter}
              language={language}
            />
          </div>
        );

      case 'reports':
        return (
          <div className="max-w-[1400px] mx-auto space-y-6">
            <ReportsModule 
              detections={detections}
              onOpenPdfReport={() => setIsExportReportOpen(true)}
              standalone={true}
              language={language}
            />
          </div>
        );

      case 'data':
        return (
          <div className="max-w-[1600px] mx-auto space-y-6">
            <DataManagementModule 
              detections={detections}
              onSelectDetection={(det) => setDetailModalItem(det)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteDetection={handleDeleteDetection}
            />
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-[1200px] mx-auto">
            <SettingsModule />
          </div>
        );
    }
  };

  // Only show the simulated smartphone frame if testing on a large desktop monitor AND explicitly set to mobile preview
  const showDesktopPhoneSim = isDesktopScreen && previewDeviceMode === 'mobile';

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] text-[#1E293B] lang-${language}`}>
      
      {/* Left Blue Sidebar / Toolbar Navigation (for BOTH Mobile and Computer) */}
      {!showDesktopPhoneSim && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          mobileSimOpen={mobileSimOpen}
          setMobileSimOpen={setMobileSimOpen}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Google Maps Quota Exhaustion Banner */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs text-center sticky top-0 z-50 shadow-xs">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Top Header with bilingual toggle & Blue Menu open/close button */}
        <Header 
          activeTab={activeTab}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onOpenReportExport={() => setIsExportReportOpen(true)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          previewDeviceMode={previewDeviceMode}
          setPreviewDeviceMode={setPreviewDeviceMode}
          language={language}
          setLanguage={setLanguage}
        />

        {/* Workspace Viewport */}
        {showDesktopPhoneSim ? (
          /* Desktop testing container simulating a mobile device */
          <div className="flex-1 p-4 md:p-6 flex items-center justify-center bg-slate-900/90 backdrop-blur-md overflow-y-auto">
            <div className="w-[390px] h-[820px] max-h-[90vh] bg-white rounded-[44px] shadow-2xl border-8 border-slate-800 flex flex-col overflow-hidden relative">
              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />
              </div>

              {/* Header inside simulated phone */}
              <div className="pt-8 px-4 pb-2 bg-white border-b border-slate-100 flex items-center justify-between z-30">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-blue-500/30 bg-white shrink-0 flex items-center justify-center p-0.5">
                    <img
                      src={APP_LOGO_IMG}
                      alt="AgroRoad AI Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-extrabold text-slate-900 text-xs truncate max-w-[170px] flex items-center gap-1">
                    <span className="text-[#091E42]">AgroRoad</span><span className="text-[#0066FF] font-black">AI</span>
                  </span>
                </div>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold"
                >
                  {language === 'km' ? '🇰🇭 ខ្មែរ' : '🇺🇸 EN'}
                </button>
              </div>

              {/* Scrollable Viewport inside simulated phone */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-20">
                {renderTabContent(true)}
              </div>

              {/* Fixed Bottom Mobile Tab Bar inside simulated phone */}
              <MobileBottomNav 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                language={language}
                onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}
                isMenuOpen={isSidebarOpen}
              />
            </div>
          </div>
        ) : (
          /* Natural, 100% fluid mobile & desktop responsive interface */
          <main className="flex-1 p-3.5 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-8 overflow-y-auto">
            {renderTabContent(false)}
          </main>
        )}

        {/* Real Mobile Bottom Navigation Bar (Visible on mobile screens) */}
        {!showDesktopPhoneSim && (
          <MobileBottomNav 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            language={language}
            onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}
            isMenuOpen={isSidebarOpen}
          />
        )}
      </div>

      {/* Floating Companion Phone Simulator (Desktop tool toggle) */}
      {mobileSimOpen && !showDesktopPhoneSim && (
        <div className="fixed inset-y-0 right-0 z-40 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in slide-in-from-right duration-300 shadow-2xl">
          <MobileAppSimulator 
            onCaptureDetection={handleSaveNewDetection} 
            onClose={() => setMobileSimOpen(false)} 
          />
        </div>
      )}

      {/* Detail Inspection Modal */}
      {detailModalItem && (
        <DetectionDetailModal
          detection={detailModalItem}
          onClose={() => setDetailModalItem(null)}
          onUpdateStatus={handleUpdateStatus}
          language={language}
        />
      )}

      {/* PDF Export Report Modal */}
      {isExportReportOpen && (
        <ExportReportModal
          detections={detections}
          onClose={() => setIsExportReportOpen(false)}
          dateRange={dateRange}
        />
      )}
    </div>
  );
}
