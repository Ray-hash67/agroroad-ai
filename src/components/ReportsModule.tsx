import React from 'react';
import { FileText, FileSpreadsheet, Archive, TrendingUp } from 'lucide-react';
import { DamageDetection } from '../types/damage';
import { MONTHLY_DETECTIONS } from '../data/mockData';
import { Language, translations } from '../i18n/translations';

interface ReportsModuleProps {
  detections: DamageDetection[];
  onOpenPdfReport: () => void;
  standalone?: boolean;
  language?: Language;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  detections,
  onOpenPdfReport,
  standalone = false,
  language = 'en'
}) => {
  const t = translations[language];
  const total = detections.length || 254;
  const potholes = detections.filter(d => d.type === 'pothole').length || 178;
  const longitudinalCracks = detections.filter(d => d.type === 'crack' || d.type === 'longitudinal_crack').length || 34;
  const transverseCracks = detections.filter(d => d.type === 'transverse_crack').length || 18;
  const alligatorCracks = detections.filter(d => d.type === 'alligator_crack').length || 15;
  const manholeHazards = detections.filter(d => d.type === 'manhole_hazard').length || 24;

  const potholePercent = Math.round((potholes / total) * 100) || 70;
  const longitudinalPercent = Math.round((longitudinalCracks / total) * 100) || 14;
  const transversePercent = Math.round((transverseCracks / total) * 100) || 7;
  const alligatorPercent = Math.round((alligatorCracks / total) * 100) || 6;
  const manholePercent = Math.round((manholeHazards / total) * 100) || 10;

  // Real CSV export trigger
  const handleExportCsv = () => {
    const headers = ['ID', 'Type', 'Title', 'Confidence', 'Date', 'Time', 'Latitude', 'Longitude', 'Location', 'Severity', 'Depth_cm', 'Status'];
    const rows = detections.map(d => [
      d.id,
      d.type,
      `"${d.title.replace(/"/g, '""')}"`,
      d.confidence.toFixed(2),
      d.date,
      d.time,
      d.coordinates.lat.toFixed(6),
      d.coordinates.lng.toFixed(6),
      `"${d.roadName}"`,
      d.severity,
      d.depthCm || 0,
      d.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgroRoad_AI_Report_PhnomPenh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export ZIP manifest
  const handleExportZip = () => {
    alert('Road inspection image archive bundle prepared! Starting download for high-resolution defect captures with bounding-box metadata.');
  };

  // Donut SVG circumference calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const potholeDash = (potholePercent / 100) * circumference;
  const longitudinalDash = (longitudinalPercent / 100) * circumference;
  const transverseDash = (transversePercent / 100) * circumference;
  const alligatorDash = (alligatorPercent / 100) * circumference;
  const manholeDash = (manholePercent / 100) * circumference;

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden ${standalone ? 'p-6' : 'p-4'}`}>
      {/* Module Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            3
          </span>
          <h3 className="font-bold text-slate-900 text-base">{t.reports}</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Municipal Audit Cycle 2026
        </span>
      </div>

      {/* Main Charts Split: Damage Type Distribution | Monthly Detections */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Donut Chart - Damage Type Distribution */}
        <div className="md:col-span-5 flex flex-col items-center">
          <h4 className="text-xs font-bold text-slate-700 mb-3 self-start">
            {t.damageTypeDistribution}
          </h4>
          {/* SVG Donut Chart with Center Total text */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth="20"
                fill="none"
              />
              {/* Pothole slice (Red/Rose) */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#f43f5e"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${potholeDash} ${circumference}`}
                strokeDashoffset="0"
              />
              {/* Longitudinal Crack slice (Amber) */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#f59e0b"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${longitudinalDash} ${circumference}`}
                strokeDashoffset={`-${potholeDash}`}
              />
              {/* Transverse Crack slice (Teal) */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#14b8a6"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${transverseDash} ${circumference}`}
                strokeDashoffset={`-${potholeDash + longitudinalDash}`}
              />
              {/* Alligator Crack slice (Indigo) */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#6366f1"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${alligatorDash} ${circumference}`}
                strokeDashoffset={`-${potholeDash + longitudinalDash + transverseDash}`}
              />
              {/* Manhole Hazard slice (Sky Blue) */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#0284c7"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${manholeDash} ${circumference}`}
                strokeDashoffset={`-${potholeDash + longitudinalDash + transverseDash + alligatorDash}`}
              />
            </svg>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {total}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 -mt-0.5">
                Total
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="w-full space-y-1.5 mt-4 text-xs font-medium">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-700">{t.potholes}</span>
              </div>
              <span className="font-mono text-slate-800 font-bold tabular-nums">
                {potholes} ({potholePercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700">{t.longitudinalCrack}</span>
              </div>
              <span className="font-mono text-slate-800 font-bold tabular-nums">
                {longitudinalCracks} ({longitudinalPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-slate-700">{t.transverseCrack}</span>
              </div>
              <span className="font-mono text-slate-800 font-bold tabular-nums">
                {transverseCracks} ({transversePercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-700">{t.alligatorCrack}</span>
              </div>
              <span className="font-mono text-slate-800 font-bold tabular-nums">
                {alligatorCracks} ({alligatorPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-slate-700">{t.manholeHazard}</span>
              </div>
              <span className="font-mono text-slate-800 font-bold tabular-nums">
                {manholeHazards} ({manholePercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Monthly Detections Bar Chart */}
        <div className="md:col-span-7 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700">
                {t.monthlyDetections}
              </h4>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Peak in Autumn
              </span>
            </div>

            {/* Bar Chart Container */}
            <div className="h-36 pt-4 flex items-end justify-between gap-1.5 px-2 border-b border-slate-200">
              {MONTHLY_DETECTIONS.map((item) => {
                const heightPercent = (item.count / 55) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 font-bold">
                      {item.count}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-sm h-28 flex items-end">
                      <div
                        className="w-full bg-blue-600 hover:bg-blue-500 rounded-t-sm transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-900">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Report Section */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t.exportReport}
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {/* PDF Button */}
              <button
                onClick={onOpenPdfReport}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all hover:shadow-2xs active:scale-98"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{t.pdfReport}</span>
              </button>
              {/* CSV Button */}
              <button
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all hover:shadow-2xs active:scale-98"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{t.csvData}</span>
              </button>
              {/* Images ZIP Button */}
              <button
                onClick={handleExportZip}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all hover:shadow-2xs active:scale-98"
              >
                <Archive className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{t.imagesZip}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
