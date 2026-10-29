import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  MapPin, 
  FileText, 
  Database, 
  Settings, 
  ChevronLeft, 
  Upload
} from 'lucide-react';
import { ActiveTab } from '../types/damage';
import { Language, translations } from '../i18n/translations';
import { APP_LOGO_IMG } from '../data/mockData';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  mobileSimOpen?: boolean;
  setMobileSimOpen?: (open: boolean) => void;
  language: Language;
  setLanguage?: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onToggle,
  language,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: t.dashboard, icon: LayoutDashboard },
    { id: 'detection' as ActiveTab, label: t.aiDetection, icon: Camera },
    { id: 'upload' as ActiveTab, label: t.upload, icon: Upload },
    { id: 'map' as ActiveTab, label: t.satelliteMap, icon: MapPin },
    { id: 'reports' as ActiveTab, label: t.reports, icon: FileText },
    { id: 'data' as ActiveTab, label: t.dataManagement, icon: Database },
    { id: 'settings' as ActiveTab, label: t.settings, icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    // On small mobile screens, smoothly close the drawer after choosing a tab
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      {/* Semi-transparent backdrop overlay - mobile only */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-40 transition-opacity duration-300 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Menu & Tools Navigation */}
      <aside 
        className={`bg-white text-black border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out select-none
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] shadow-2xl
          md:static md:z-20 md:h-screen md:sticky md:top-0 md:shadow-none
          ${
            isOpen 
              ? 'translate-x-0 md:w-72 md:opacity-100' 
              : '-translate-x-full md:w-0 md:border-r-0 md:overflow-hidden md:opacity-0 md:pointer-events-none'
          }
        `}
      >
        <div className="w-72 sm:w-80 h-full flex flex-col justify-between shrink-0">
          {/* Top Header inside Dashboard Menu */}
          <div className="flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-2 ring-blue-600/30 shadow-md shadow-blue-900/10 shrink-0 bg-white flex items-center justify-center p-0.5">
                  <img
                    src={APP_LOGO_IMG}
                    alt="AgroRoad AI Shield Logo"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold tracking-tight text-slate-950 truncate flex items-center gap-1">
                      <span className="text-[#091E42]">AgroRoad</span><span className="text-[#0066FF] font-black">AI</span>
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold truncate leading-tight flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>Smarter Analysis | Safer Roads</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onToggle}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-black flex items-center justify-center transition-all border border-slate-300 active:scale-95 shrink-0 shadow-2xs"
                title={t.collapseMenu}
                aria-label={t.collapseMenu}
              >
                <ChevronLeft className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-3 sm:p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] bg-white">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'km' ? 'បញ្ជីរុករកចម្បង' : 'Main Navigation'}
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[46px] ${
                      isActive
                        ? 'bg-slate-100 text-black font-extrabold border-l-4 border-black ring-1 ring-slate-300 shadow-2xs'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-black'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-slate-600'}`} />
                    <span className="truncate text-black font-semibold">{item.label}</span>
                    {item.id === 'detection' && (
                      <span className="ml-auto text-[10px] bg-red-100 text-red-800 border border-red-200 font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs">
                        Live
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Status and City Skyline Graphic in Light Slate */}
          <div className="relative pt-3 pb-2 border-t border-slate-200 bg-slate-50 overflow-hidden shrink-0">
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t.gpsActive}
                </span>
                <span className="font-mono text-[11px] text-black font-bold">11.5725° N</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="font-bold text-slate-900">{t.visionEngine}</span>
                <span className="text-black font-mono text-[11px] font-bold">YOLO-Road v8</span>
              </div>
            </div>
            {/* City Infrastructure Skyline graphic */}
            <div className="w-full h-11 opacity-40 pointer-events-none mt-1">
              <svg viewBox="0 0 240 60" className="w-full h-full text-slate-300 fill-current" preserveAspectRatio="none">
                <path d="M0,60 L0,48 L15,48 L15,35 L25,35 L25,48 L40,48 L40,25 L50,20 L60,25 L60,48 L75,48 L75,15 L80,10 L85,15 L85,48 L100,48 L100,30 L115,30 L115,48 L130,48 L135,18 L145,18 L150,48 L170,48 L170,28 L185,28 L185,48 L200,48 L200,38 L215,38 L215,48 L240,48 L240,60 Z" />
                <path d="M60,60 L75,40 L100,60 L125,35 L150,60" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
