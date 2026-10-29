import React from 'react';
import { Camera, MapPin, BarChart3, FileText, Wrench } from 'lucide-react';
import { ActiveTab } from '../types/damage';
import { Language } from '../i18n/translations';

interface FeatureHighlightsProps {
  onSelectFeature: (tab: ActiveTab) => void;
  language?: Language;
}

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({ 
  onSelectFeature,
  language = 'en'
}) => {
  const isKm = language === 'km';

  const features = [
    {
      title: isKm ? 'ការសម្គាល់ពិការភាព AI' : 'AI Road Damage Detection',
      desc: isKm ? 'ស្កេនពិការភាពតាមពេលជាក់ស្តែង' : 'Real-time deep learning bounding box inference',
      icon: Camera,
      tab: 'detection' as ActiveTab,
    },
    {
      title: isKm ? 'ផែនទីផ្កាយរណប GPS' : 'GPS Location Mapping',
      desc: isKm ? 'ទីតាំងភូមិសាស្ត្រច្បាស់លាស់' : 'Sub-meter geospatial georeferencing & clustering',
      icon: MapPin,
      tab: 'map' as ActiveTab,
    },
    {
      title: isKm ? 'ផ្ទាំងគ្រប់គ្រងអន្តរកម្ម' : 'Interactive Dashboard',
      desc: isKm ? 'សន្ទស្សន៍ស្ថានភាពផ្លូវថ្នល់ PCI' : 'Pavement condition index & asset analytics',
      icon: BarChart3,
      tab: 'dashboard' as ActiveTab,
    },
    {
      title: isKm ? 'របាយការណ៍ត្រួតពិនិត្យ' : 'Inspection Reports',
      desc: isKm ? 'របាយការណ៍សវនកម្មវិស្វកម្ម' : 'Automated municipal engineering export audits',
      icon: FileText,
      tab: 'reports' as ActiveTab,
    },
    {
      title: isKm ? 'ការគាំទ្រផែនការថែទាំផ្លូវ' : 'Support Road Maintenance Planning',
      desc: isKm ? 'អាទិភាពការងារជួសជុល' : 'Priority work orders & repair budgeting',
      icon: Wrench,
      tab: 'data' as ActiveTab,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 md:gap-3 pt-2">
      {features.map((feat, index) => {
        const Icon = feat.icon;
        return (
          <div
            key={index}
            onClick={() => onSelectFeature(feat.tab)}
            className="bg-white hover:bg-blue-50/50 rounded-xl p-2.5 md:p-3 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-2.5 md:gap-3 group"
          >
            {/* Square Blue Icon Button matching design */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-blue-700 transition-all">
              <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] md:text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight line-clamp-2">
                {feat.title}
              </h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};
