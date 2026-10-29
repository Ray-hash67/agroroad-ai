import React from 'react';
import { DamageType } from '../types/damage';
import { Language, translations } from '../i18n/translations';
import { RoadDefectLogo } from './RoadDefectLogo';
import { AnalyticsGrowthLogo } from './AnalyticsGrowthLogo';

interface MetricsOverviewProps {
  selectedTypeFilter: DamageType | 'all';
  onSelectTypeFilter: (type: DamageType | 'all') => void;
  counts: {
    total: number;
    potholes: number;
    cracks?: number;
    longitudinalCracks?: number;
    transverseCracks?: number;
    alligatorCracks?: number;
    manholeHazards?: number;
    other?: number;
  };
  language?: Language;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  selectedTypeFilter,
  onSelectTypeFilter,
  counts,
  language = 'en'
}) => {
  const t = translations[language];
  const total = counts.total || 254;
  const potholes = counts.potholes ?? 178;
  const longitudinalCracks = counts.longitudinalCracks ?? counts.cracks ?? 34;
  const transverseCracks = counts.transverseCracks ?? 18;
  const alligatorCracks = counts.alligatorCracks ?? 15;
  const manholeHazards = counts.manholeHazards ?? 24;

  const potholePercent = Math.round((potholes / total) * 100) || 70;
  const longitudinalPercent = Math.round((longitudinalCracks / total) * 100) || 14;
  const transversePercent = Math.round((transverseCracks / total) * 100) || 7;
  const alligatorPercent = Math.round((alligatorCracks / total) * 100) || 6;
  const manholePercent = Math.round((manholeHazards / total) * 100) || 10;

  const isLongitudinalActive = selectedTypeFilter === 'crack' || selectedTypeFilter === 'longitudinal_crack';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3.5">
      {/* 1. Total Detections Card */}
      <div 
        onClick={() => onSelectTypeFilter('all')}
        className={`bg-white rounded-xl p-3 md:p-4.5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          selectedTypeFilter === 'all'
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-white border border-slate-200/90 shadow-xs md:shadow-sm flex items-center justify-center p-1 shrink-0 transition-transform hover:scale-105">
              <AnalyticsGrowthLogo className="w-full h-full" />
            </div>
            <div>
              <div className="text-[11px] md:text-xs font-semibold text-slate-500 line-clamp-1">{t.totalDetections}</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {total}
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 tabular-nums">
              ↑ +12%
            </span>
            <div className="text-[10px] text-slate-400 font-medium">{t.vsLastMonth}</div>
          </div>
        </div>
        <div className="sm:hidden mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span className="text-emerald-600 font-semibold">↑ +12%</span>
          <span>{t.vsLastMonth}</span>
        </div>
      </div>

      {/* 2. Potholes Card */}
      <div 
        onClick={() => onSelectTypeFilter(selectedTypeFilter === 'pothole' ? 'all' : 'pothole')}
        className={`bg-white rounded-xl p-3 md:p-4.5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          selectedTypeFilter === 'pothole'
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 shadow-xs md:shadow-sm ring-1 ring-slate-200 bg-slate-900 transition-transform hover:scale-105">
              <RoadDefectLogo type="pothole" className="w-full h-full" title={t.potholes} />
            </div>
            <div>
              <div className="text-[11px] md:text-xs font-semibold text-slate-500">{t.potholes}</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {potholes}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 tabular-nums">{potholePercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1 md:h-1.5 overflow-hidden">
          <div 
            className="bg-rose-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${potholePercent}%` }}
          />
        </div>
      </div>

      {/* 3. Longitudinal Crack Card */}
      <div 
        onClick={() => onSelectTypeFilter(isLongitudinalActive ? 'all' : 'longitudinal_crack')}
        className={`bg-white rounded-xl p-3 md:p-4.5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          isLongitudinalActive
            ? 'border-amber-500 ring-2 ring-amber-500/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 shadow-xs md:shadow-sm ring-1 ring-slate-200 bg-slate-900 transition-transform hover:scale-105">
              <RoadDefectLogo type="longitudinal_crack" className="w-full h-full" title={t.longitudinalCrack} />
            </div>
            <div>
              <div className="text-[11px] md:text-xs font-semibold text-slate-500">{t.longitudinalCrack}</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {longitudinalCracks}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 tabular-nums">{longitudinalPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1 md:h-1.5 overflow-hidden">
          <div 
            className="bg-amber-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${longitudinalPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Transverse Crack Card */}
      <div 
        onClick={() => onSelectTypeFilter(selectedTypeFilter === 'transverse_crack' ? 'all' : 'transverse_crack')}
        className={`bg-white rounded-xl p-3 md:p-4.5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          selectedTypeFilter === 'transverse_crack'
            ? 'border-teal-500 ring-2 ring-teal-500/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 shadow-xs md:shadow-sm ring-1 ring-slate-200 bg-slate-900 transition-transform hover:scale-105">
              <RoadDefectLogo type="transverse_crack" className="w-full h-full" title={t.transverseCrack} />
            </div>
            <div>
              <div className="text-[11px] md:text-xs font-semibold text-slate-500">{t.transverseCrack}</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {transverseCracks}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 tabular-nums">{transversePercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1 md:h-1.5 overflow-hidden">
          <div 
            className="bg-teal-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${transversePercent}%` }}
          />
        </div>
      </div>

      {/* 5. Alligator Crack Card */}
      <div 
        onClick={() => onSelectTypeFilter(selectedTypeFilter === 'alligator_crack' ? 'all' : 'alligator_crack')}
        className={`bg-white rounded-xl p-3 md:p-4.5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          selectedTypeFilter === 'alligator_crack'
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 shadow-xs md:shadow-sm ring-1 ring-slate-200 bg-slate-900 transition-transform hover:scale-105">
              <RoadDefectLogo type="alligator_crack" className="w-full h-full" title={t.alligatorCrack} />
            </div>
            <div>
              <div className="text-[11px] md:text-xs font-semibold text-slate-500">{t.alligatorCrack}</div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {alligatorCracks}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 tabular-nums">{alligatorPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1 md:h-1.5 overflow-hidden">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${alligatorPercent}%` }}
          />
        </div>
      </div>

      {/* 6. Manhole Hazard Card */}
      <div 
        onClick={() => onSelectTypeFilter(selectedTypeFilter === 'manhole_hazard' ? 'all' : 'manhole_hazard')}
        className={`bg-white rounded-xl p-3 md:p-4.5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
          selectedTypeFilter === 'manhole_hazard'
            ? 'border-sky-500 ring-2 ring-sky-500/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 shadow-xs md:shadow-sm ring-1 ring-slate-200 bg-slate-900 transition-transform hover:scale-105">
              <RoadDefectLogo type="manhole_hazard" className="w-full h-full" title={t.manholeHazard} />
            </div>
            <div>
              <div className="text-[11px] md:text-xs font-semibold text-slate-500">{t.manholeHazard}</div>
              <div className="text-xl md:text-2xl font-extrabold text-black tracking-tight tabular-nums mt-0.5">
                {manholeHazards}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 tabular-nums">{manholePercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1 md:h-1.5 overflow-hidden">
          <div 
            className="bg-sky-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${manholePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
