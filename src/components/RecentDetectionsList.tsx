import React from 'react';
import { ChevronRight, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { DamageDetection, DamageType } from '../types/damage';
import { Language, translations } from '../i18n/translations';

interface RecentDetectionsListProps {
  detections: DamageDetection[];
  selectedDetection: DamageDetection | null;
  onSelectDetection: (detection: DamageDetection) => void;
  onViewAll: () => void;
  typeFilter: DamageType | 'all';
  language?: Language;
}

export const RecentDetectionsList: React.FC<RecentDetectionsListProps> = ({
  detections,
  selectedDetection,
  onSelectDetection,
  onViewAll,
  typeFilter,
  language = 'en'
}) => {
  const t = translations[language];

  const filtered = detections.filter((item) => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'crack' || typeFilter === 'longitudinal_crack') {
      return item.type === 'crack' || item.type === 'longitudinal_crack';
    }
    return item.type === typeFilter;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 md:p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm md:text-base font-bold text-slate-900">{t.recentDetections}</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group p-1 -mr-1"
        >
          <span>{t.viewAll}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Detections List */}
      <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[460px]">
        {filtered.map((item) => {
          const isSelected = selectedDetection?.id === item.id;
          const isPothole = item.type === 'pothole';
          const isLongitudinal = item.type === 'crack' || item.type === 'longitudinal_crack';
          const isTransverse = item.type === 'transverse_crack';
          const isAlligator = item.type === 'alligator_crack';
          const isManhole = item.type === 'manhole_hazard';

          let badgeBg = 'bg-emerald-600';
          let badgeText = language === 'km' ? 'ផ្សេងៗ' : 'other';

          if (isPothole) {
            badgeBg = 'bg-rose-500';
            badgeText = language === 'km' ? 'រណ្តៅ' : 'pothole';
          } else if (isLongitudinal) {
            badgeBg = 'bg-amber-500';
            badgeText = language === 'km' ? 'ប្រេះបណ្តោយ' : 'longitudinal';
          } else if (isTransverse) {
            badgeBg = 'bg-teal-600';
            badgeText = language === 'km' ? 'ប្រេះទទឹង' : 'transverse';
          } else if (isAlligator) {
            badgeBg = 'bg-indigo-600';
            badgeText = language === 'km' ? 'ប្រេះក្រពើ' : 'alligator';
          } else if (isManhole) {
            badgeBg = 'bg-sky-600';
            badgeText = language === 'km' ? 'គម្របលូ' : 'manhole';
          }

          return (
            <div
              key={item.id}
              onClick={() => onSelectDetection(item)}
              className={`p-3 md:p-3.5 flex items-center gap-3 md:gap-3.5 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/70 border-l-4 border-blue-600 pl-2.5'
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                <img
                  src={item.cropImage || item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Information Content */}
              <div className="flex-1 min-w-0">
                {/* Badge Tag */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase text-white shadow-2xs ${badgeBg}`}
                  >
                    {badgeText}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    {t.confidence}: <span className="font-mono text-slate-800 font-bold">{item.confidence.toFixed(2)}</span>
                  </span>
                </div>

                {/* Date & Time */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 leading-tight truncate">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.timestamp}</span>
                </div>

                {/* GPS Coordinates */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 leading-tight mt-0.5 font-mono">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Chevron Arrow */}
              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'
              }`} />
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            {language === 'km' ? 'មិនមានទិន្នន័យស្របនឹងតម្រងនេះទេ' : 'No detections found matching this filter.'}
          </div>
        )}
      </div>
    </div>
  );
};
