import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  User, 
  Monitor, 
  Smartphone,
  Menu
} from 'lucide-react';
import { ActiveTab } from '../types/damage';
import { Language, translations } from '../i18n/translations';
import { APP_LOGO_IMG } from '../data/mockData';

interface HeaderProps {
  activeTab: ActiveTab;
  dateRange: string;
  setDateRange: (range: string) => void;
  onOpenReportExport?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  previewDeviceMode: 'auto' | 'desktop' | 'mobile';
  setPreviewDeviceMode: (mode: 'auto' | 'desktop' | 'mobile') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  dateRange,
  setDateRange,
  isSidebarOpen,
  onToggleSidebar,
  previewDeviceMode,
  setPreviewDeviceMode,
  language,
  setLanguage,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = translations[language];

  const now = new Date();
  const currentYear = now.getFullYear();
  const todayFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const dateOptions = [
    `Jan 1, ${currentYear} - ${todayFormatted}`,
    `This Month (${now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`,
    'Last 7 Days',
    'Last 30 Days',
    `Fiscal Year ${currentYear}`
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: t.dashboard, subtitle: t.dashboardDesc };
      case 'detection':
        return { title: t.aiDetection, subtitle: t.detectionDesc };
      case 'upload':
        return { 
          title: t.upload, 
          subtitle: language === 'km' ? 'ផ្ទុកឡើងរូបថតផ្លូវដើម្បីវិភាគពិការភាពដោយ AI' : 'Upload road damage photos to analyze distress with automated bounding boxes' 
        };
      case 'map':
        return { title: t.satelliteMap, subtitle: t.mapDesc };
      case 'reports':
        return { title: t.reports, subtitle: t.reportsDesc };
      case 'data':
        return { title: t.dataManagement, subtitle: t.dataDesc };
      case 'settings':
        return { title: t.settings, subtitle: t.settingsDesc };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="bg-white border-b border-slate-200/90 px-3 md:px-5 py-2.5 md:py-3.5 flex items-center justify-between gap-2 md:gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Menu Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0 ${
              isSidebarOpen 
                ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' 
                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
            title={isSidebarOpen ? (language === 'km' ? 'បិទម៉ឺនុយ' : 'Collapse Menu') : (language === 'km' ? 'បើកម៉ឺនុយ' : 'Open Menu')}
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4.5 h-4.5" />
            <span className="text-xs font-bold">
              {language === 'km' ? 'ម៉ឺនុយ' : 'Menu'}
            </span>
          </button>
        )}

        {/* Brand Icon & Wordmark */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden ring-1.5 ring-blue-600/30 shadow-xs shrink-0 bg-white flex items-center justify-center p-0.5">
            <img
              src={APP_LOGO_IMG}
              alt="AgroRoad AI Shield Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-slate-950 text-sm md:text-base tracking-tight truncate flex items-center gap-1">
                <span className="text-[#091E42]">AgroRoad</span><span className="text-[#0066FF] font-black">AI</span>
              </span>
            </div>
            <p className="hidden xl:flex items-center gap-1 text-[10px] text-slate-500 font-medium truncate mt-0.5">
              <span>Smarter Analysis</span>
              <span className="text-blue-500 font-bold">|</span>
              <span>Safer Roads</span>
            </p>
          </div>
        </div>

        {/* Contextual Page Title */}
        <div className="hidden lg:block pl-3 border-l border-slate-200 ml-1">
          <h1 className="text-sm font-bold text-slate-800 leading-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 leading-tight truncate max-w-sm">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Language Selector + Device Switcher + Date Picker + Profile */}
      <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
        {/* Language Selector Dropdown (English & Khmer) */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-bold text-slate-700 transition-colors border border-slate-200/80 min-h-[38px]"
            title="Choose Language (English / ភាសាខ្មែរ)"
            aria-label="Language Selector"
          >
            <span className="text-sm">{language === 'km' ? '🇰🇭' : '🇺🇸'}</span>
            <span className="font-semibold text-[11px] md:text-xs">
              {language === 'km' ? 'ខ្មែរ' : 'EN'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {t.language} / Language
              </div>
              <button
                onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  language === 'en' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇺🇸</span>
                  <span>English</span>
                </div>
                {language === 'en' && <span className="text-blue-600 font-bold">✓</span>}
              </button>
              <button
                onClick={() => { setLanguage('km'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  language === 'km' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇰🇭</span>
                  <span>ភាសាខ្មែរ</span>
                </div>
                {language === 'km' && <span className="text-blue-600 font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Device View Mode Switcher (Desktop only) */}
        <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/70">
          <button
            onClick={() => setPreviewDeviceMode('desktop')}
            className={`px-2.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              previewDeviceMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Computer Layout"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{t.deviceComputer}</span>
          </button>
          
          <button
            onClick={() => setPreviewDeviceMode('mobile')}
            className={`px-2.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              previewDeviceMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Mobile Phone Simulation"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.deviceMobile}</span>
          </button>
        </div>

        {/* Date Range Picker Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-all shadow-xs min-h-[38px] active:scale-[0.98]"
            title="Filter by Date Range"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="tabular-nums hidden md:inline font-semibold text-slate-800">{dateRange}</span>
            <span className="tabular-nums md:hidden text-[11px] font-semibold text-slate-800">
              {dateRange.includes('Oct 2023') ? 'Oct 9, 2023' : dateRange.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Time Range
              </div>
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                    dateRange === opt
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt}</span>
                  {dateRange === opt && <span className="text-blue-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Account Avatar */}
        <div className="relative pl-1 border-l border-slate-200">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-50 transition-colors group min-h-[38px]"
            aria-label="User Account"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:ring-2 ring-blue-300 transition-all">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs">
              <div className="p-2 border-b border-slate-100 mb-1">
                <p className="font-semibold text-slate-800">ITC Engineering Unit</p>
                <p className="text-[11px] text-slate-500">todochi085@gmail.com</p>
                <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                  {language === 'km' ? 'រដ្ឋបាលរាជធានី' : 'Municipal Admin'}
                </span>
              </div>
              <button 
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-600"
              >
                {t.settings}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
