import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock 
} from 'lucide-react';
import { DamageDetection, DefectStatus } from '../types/damage';
import { Language, translations } from '../i18n/translations';

interface DetectionDetailModalProps {
  detection: DamageDetection;
  onClose: () => void;
  onUpdateStatus: (id: string, status: DefectStatus) => void;
  language?: Language;
}

export const DetectionDetailModal: React.FC<DetectionDetailModalProps> = ({
  detection,
  onClose,
  onUpdateStatus,
  language = 'en',
}) => {
  const t = translations[language];
  const [currentStatus, setCurrentStatus] = useState<DefectStatus>(detection.status);

  const handleStatusChange = (newStatus: DefectStatus) => {
    setCurrentStatus(newStatus);
    onUpdateStatus(detection.id, newStatus);
  };

  const isKm = language === 'km';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-3.5 md:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
            <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider text-white shrink-0 ${
              detection.type === 'pothole' ? 'bg-rose-500' :
              detection.type === 'crack' || detection.type === 'longitudinal_crack' ? 'bg-amber-500' :
              detection.type === 'transverse_crack' ? 'bg-teal-600' :
              detection.type === 'alligator_crack' ? 'bg-indigo-600' :
              detection.type === 'manhole_hazard' ? 'bg-sky-600' : 'bg-emerald-500'
            }`}>
              {detection.type === 'pothole' ? (isKm ? 'រណ្តៅ' : 'pothole') :
                detection.type === 'crack' || detection.type === 'longitudinal_crack' ? (isKm ? 'ប្រេះបណ្តោយ' : 'longitudinal crack') :
                detection.type === 'transverse_crack' ? (isKm ? 'ប្រេះទទឹង' : 'transverse crack') :
               detection.type === 'alligator_crack' ? (isKm ? 'ប្រេះក្រពើ' : 'alligator crack') :
               detection.type === 'manhole_hazard' ? (isKm ? 'គ្រោះថ្នាក់គម្របលូ' : 'manhole hazard') :
               (isKm ? 'ផ្សេងៗ' : 'other')}
            </span>
            <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">{detection.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-5">
          {/* Photos split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-200 relative aspect-video">
              <img
                src={detection.image}
                alt="Context View"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                {isKm ? 'ទិដ្ឋភាពទូទៅ' : 'Windshield Survey'}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-200 relative aspect-video">
              <img
                src={detection.cropImage || detection.image}
                alt="Crop Detail"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                {isKm ? 'រូបភាពពង្រីក (ROI)' : 'Defect ROI'}
              </span>
            </div>
          </div>

          {/* Metric Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3 bg-slate-50 p-3.5 md:p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 font-medium text-[11px]">{t.confidence}</div>
              <div className="font-mono text-base font-bold text-blue-600 mt-0.5">
                {(detection.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">{t.severity}</div>
              <div className="font-bold text-base capitalize mt-0.5 text-rose-600">
                {detection.severity === 'critical' ? t.critical :
                  detection.severity === 'moderate' ? t.moderate : t.minor}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">{t.depth}</div>
              <div className="font-mono text-base font-bold text-slate-800 mt-0.5">
                {detection.depthCm ? `${detection.depthCm} cm` : '5.5 cm'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium text-[11px]">{t.area}</div>
              <div className="font-mono text-base font-bold text-slate-800 mt-0.5">
                {detection.areaM2 ? `${detection.areaM2} m²` : '0.4 m²'}
              </div>
            </div>
          </div>

          {/* Geo & Timeline Details */}
          <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {t.roadName}
              </span>
              <span className="font-semibold text-slate-800 text-right">{detection.roadName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {t.location}
              </span>
              <span className="font-mono text-slate-800">
                {detection.coordinates.lat.toFixed(6)}° N, {detection.coordinates.lng.toFixed(6)}° E
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {t.date}
              </span>
              <span className="text-slate-700 font-medium">{detection.timestamp}</span>
            </div>
          </div>

          {/* Work Status Update Bar */}
          <div className="bg-blue-50/60 p-3.5 md:p-4 rounded-xl border border-blue-200/80">
            <div className="text-xs font-bold text-blue-900 mb-2">
              {isKm ? 'ស្ថានភាពដំណើរការថែទាំ៖' : 'Maintenance Workflow Status:'}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['detected', 'inspected', 'scheduled', 'repaired'] as DefectStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all min-h-[36px] ${
                    currentStatus === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st === 'detected' ? t.detected :
                    st === 'inspected' ? t.inspected :
                    st === 'scheduled' ? t.scheduled :
                    `✓ ${t.repaired}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">ID: {detection.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors min-h-[38px]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
