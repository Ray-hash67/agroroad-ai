import React from 'react';
import { LayoutDashboard, Camera, MapPin, Upload, Menu } from 'lucide-react';
import { ActiveTab } from '../types/damage';
import { Language, translations } from '../i18n/translations';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  onToggleMenu?: () => void;
  isMenuOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  language,
  onToggleMenu,
  isMenuOpen,
}) => {
  const t = translations[language];

  const tabs = [
    { id: 'dashboard' as ActiveTab, label: t.dashboard, icon: LayoutDashboard },
    { id: 'map' as ActiveTab, label: language === 'km' ? 'ផែនទី' : 'Map', icon: MapPin },
    { id: 'detection' as ActiveTab, label: language === 'km' ? 'កាមេរ៉ា' : 'Camera', icon: Camera, isCenter: true },
    { id: 'upload' as ActiveTab, label: language === 'km' ? 'ផ្ទុកឡើង' : 'Upload', icon: Upload },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg md:hidden pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isMenuOpen;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 group"
                aria-label={tab.label}
              >
                <div className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isActive 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-blue-500/40' 
                    : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white ring-4 ring-white shadow-blue-500/30'
                }`}>
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight truncate max-w-[60px] ${
                  isActive ? 'text-blue-600' : 'text-slate-700 font-semibold'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${
                isActive ? 'font-bold' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 5th Button: Open/Close the Dashboard Menu */}
        <button
          onClick={onToggleMenu}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            isMenuOpen ? 'text-black font-bold' : 'text-slate-600 hover:text-black'
          }`}
          aria-label={t.menu}
        >
          <div className="relative">
            <Menu className={`w-5 h-5 ${isMenuOpen ? 'stroke-[2.5] text-black' : 'stroke-[1.8] text-slate-700'}`} />
            {isMenuOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${
            isMenuOpen ? 'font-bold text-black' : 'font-medium text-slate-600'
          }`}>
            {t.menu}
          </span>
        </button>
      </div>
    </nav>
  );
};
