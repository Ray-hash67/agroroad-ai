import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  ExternalLink, 
  X,
  Satellite
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { DamageDetection, DamageType } from '../types/damage';
import { MAP_PINS, MapPinItem } from '../data/mockData';
import { Language, translations } from '../i18n/translations';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBZhF85IOu86jI5N7uyJQW2HCWPX0CFmQU';

interface InteractiveMapProps {
  detections: DamageDetection[];
  selectedDetection: DamageDetection | null;
  onSelectDetection: (detection: DamageDetection) => void;
  onOpenDetails: (detection: DamageDetection) => void;
  typeFilter: DamageType | 'all';
  language?: Language;
}

// Controller component to dynamically pan and zoom the Google Map instance
const MapCameraController: React.FC<{
  selectedDetection: DamageDetection | null;
  zoomLevel: number;
}> = ({ selectedDetection, zoomLevel }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedDetection) {
      map.panTo({
        lat: selectedDetection.coordinates.lat,
        lng: selectedDetection.coordinates.lng,
      });
      const currentZoom = map.getZoom() || 15;
      if (currentZoom < 16) {
        map.setZoom(16);
      }
    }
  }, [map, selectedDetection]);

  useEffect(() => {
    if (!map) return;
    if (zoomLevel) {
      map.setZoom(zoomLevel);
    }
  }, [map, zoomLevel]);

  return null;
};

// Sign configuration per defect type (color, icon, sign styling)
export const getSignConfig = (type: DamageType | string) => {
  switch (type) {
    case 'manhole_hazard':
      return {
        bg: 'bg-sky-600',
        border: 'border-sky-300',
        ring: 'ring-sky-400/50',
        pinColor: '#0284c7',
        badgeBg: 'bg-sky-100',
        textColor: 'text-sky-950',
        label: 'Manhole Hazard',
        icon: (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18M6.5 6.5l11 11M6.5 17.5l11-11" strokeWidth="1.5" />
          </svg>
        )
      };
    case 'pothole':
      return {
        bg: 'bg-rose-600',
        border: 'border-rose-300',
        ring: 'ring-rose-400/50',
        pinColor: '#e11d48',
        badgeBg: 'bg-rose-100',
        textColor: 'text-rose-950',
        label: 'Pothole',
        icon: (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3.5" fill="#881337" />
          </svg>
        )
      };
    case 'crack':
    case 'longitudinal_crack':
      return {
        bg: 'bg-amber-600',
        border: 'border-amber-300',
        ring: 'ring-amber-400/50',
        pinColor: '#d97706',
        badgeBg: 'bg-amber-100',
        textColor: 'text-amber-950',
        label: 'Longitudinal Crack',
        icon: (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v20M9 7l3 2-2 4 4 3-2 4" />
          </svg>
        )
      };
    case 'transverse_crack':
      return {
        bg: 'bg-teal-600',
        border: 'border-teal-300',
        ring: 'ring-teal-400/50',
        pinColor: '#0d9488',
        badgeBg: 'bg-teal-100',
        textColor: 'text-teal-950',
        label: 'Transverse Crack',
        icon: (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 12h20M7 9l2 3-4 2 3 4" />
          </svg>
        )
      };
    case 'alligator_crack':
      return {
        bg: 'bg-indigo-600',
        border: 'border-indigo-300',
        ring: 'ring-indigo-400/50',
        pinColor: '#4f46e5',
        badgeBg: 'bg-indigo-100',
        textColor: 'text-indigo-950',
        label: 'Alligator Crack',
        icon: (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 19 8 16 16 8 16 5 8" />
            <path d="M12 2v14M5 8l11 8M19 8L8 16" />
          </svg>
        )
      };
    default:
      return {
        bg: 'bg-emerald-600',
        border: 'border-emerald-300',
        ring: 'ring-emerald-400/50',
        pinColor: '#059669',
        badgeBg: 'bg-emerald-100',
        textColor: 'text-emerald-950',
        label: 'Other Defect',
        icon: (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        )
      };
  }
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  detections,
  selectedDetection,
  onSelectDetection,
  onOpenDetails,
  typeFilter,
  language = 'en'
}) => {
  const t = translations[language];
  // Map styles: 'satellite' (hybrid with labels), 'streets' (roadmap), 'satellite-pure' (no labels), 'dark' (vector night)
  const [mapMode, setMapMode] = useState<'satellite' | 'streets' | 'satellite-pure' | 'dark'>('satellite');
  const [zoomLevel, setZoomLevel] = useState(15);
  const [useFallbackVector, setUseFallbackVector] = useState(false);

  const defaultCenter = { lat: 11.5725, lng: 104.9182 };

  const filteredPins: MapPinItem[] = MAP_PINS.filter((pin) => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'crack' || typeFilter === 'longitudinal_crack') {
      return pin.type === 'crack' || pin.type === 'longitudinal_crack';
    }
    return pin.type === typeFilter;
  });

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 1, 12));
  const handleRecenter = () => {
    setZoomLevel(15);
    if (detections[0]) {
      onSelectDetection(detections[0]);
    }
  };

  const handleSelectPin = (pin: MapPinItem) => {
    const matched = detections.find(d => d.id === pin.id) || {
      id: pin.id,
      type: pin.type as DamageType,
      title: pin.title,
      confidence: pin.confidence,
      timestamp: pin.date,
      date: 'Oct 14, 2026',
      time: '11:20 AM',
      coordinates: { lat: pin.lat, lng: pin.lng },
      locationName: 'Phnom Penh Municipality',
      roadName: pin.roadName || 'Corridor Transit Route',
      severity: pin.severity || 'critical',
      image: detections[0]?.image || '',
      cropImage: detections[0]?.cropImage || detections[0]?.image || '',
      boundingBoxes: [{ x: 25, y: 25, width: 50, height: 50, label: pin.title, confidence: pin.confidence }],
      status: 'detected' as const
    };
    onSelectDetection(matched);
  };

  // Convert map mode to Google Maps mapTypeId
  const googleMapTypeId = 
    mapMode === 'satellite' ? 'hybrid' :
    mapMode === 'satellite-pure' ? 'satellite' :
    mapMode === 'streets' ? 'roadmap' : 'hybrid';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Map Card Header */}
      <div className="p-3 md:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm md:text-base font-bold text-slate-900">
            {t.damageLocations}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
            Phnom Penh ({filteredPins.length} problems)
          </span>
          {typeFilter === 'manhole_hazard' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 font-mono">
              24 Manhole Hazards
            </span>
          )}
          {mapMode.startsWith('satellite') && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 font-mono">
              {t.satellite}
            </span>
          )}
        </div>

        {/* Satellite & Layer Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button 
            onClick={() => { setMapMode('satellite'); setUseFallbackVector(false); }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
              mapMode === 'satellite' && !useFallbackVector
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Satellite Imagery with Road Labels"
          >
            <Satellite className="w-3 h-3" />
            <span>{t.satellite}</span>
          </button>
          
          <button 
            onClick={() => { setMapMode('streets'); setUseFallbackVector(false); }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              mapMode === 'streets' && !useFallbackVector
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Street Map View"
          >
            {t.streets}
          </button>

          <button 
            onClick={() => { setMapMode('dark'); setUseFallbackVector(true); }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              mapMode === 'dark' || useFallbackVector
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Night GIS Vector View"
          >
            {t.nightGis}
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative flex-1 min-h-[440px] bg-slate-950 overflow-hidden select-none">
        
        {/* Google Maps Satellite View */}
        {!useFallbackVector && GOOGLE_MAPS_API_KEY ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="w-full h-full min-h-[440px] relative">
              <Map
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                defaultCenter={defaultCenter}
                defaultZoom={15}
                mapTypeId={googleMapTypeId}
                gestureHandling="greedy"
                disableDefaultUI={false}
                style={{ width: '100%', height: '100%' }}
              >
                <MapCameraController 
                  selectedDetection={selectedDetection}
                  zoomLevel={zoomLevel}
                />

                {/* Render Circle Problem Markers on Google Maps */}
                {filteredPins.map((pin) => {
                  const isSelected = selectedDetection?.coordinates.lat === pin.lat && 
                                     selectedDetection?.coordinates.lng === pin.lng;
                  const sign = getSignConfig(pin.type);

                  return (
                    <AdvancedMarker
                      key={pin.id}
                      position={{ lat: pin.lat, lng: pin.lng }}
                      title={`${pin.title} (${(pin.confidence * 100).toFixed(0)}%)`}
                      onClick={() => handleSelectPin(pin)}
                    >
                      <div 
                        className={`group relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                          isSelected ? 'scale-125 z-40' : 'hover:scale-110 z-20'
                        }`}
                      >
                        {/* Ping indicator when selected */}
                        {isSelected && (
                          <div className="absolute -inset-2.5 rounded-full bg-blue-500/40 animate-ping pointer-events-none" />
                        )}

                        {/* Circular Problem Marker */}
                        <div 
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white transition-all ${sign.bg} ${
                            isSelected 
                              ? 'ring-4 ring-blue-400 shadow-2xl scale-110' 
                              : 'hover:brightness-110 shadow-md'
                          }`}
                        >
                          {sign.icon}
                        </div>

                        {/* Pin pointer tip */}
                        <div 
                          className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] -mt-0.5 drop-shadow-xs" 
                          style={{ borderTopColor: sign.pinColor }}
                        />

                        {/* Hover Tooltip displaying problem title & confidence */}
                        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/95 text-white text-[10px] font-semibold whitespace-nowrap shadow-xl pointer-events-none z-50">
                          <span>{pin.title}</span>
                          <span className="font-mono text-sky-300">{(pin.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </Map>
            </div>
          </APIProvider>
        ) : (
          /* High-Fidelity Vector Road Map (Night GIS / Fallback) with interactive signs */
          <div className="relative w-full h-full min-h-[440px]">
            <svg className="w-full h-full object-cover" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="grid-night" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.5"/>
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="#090d16" />
              <rect width="100%" height="100%" fill="url(#grid-night)" />

              {/* Tonle Sap River */}
              <path d="M 620,0 C 600,140 560,260 590,380 C 610,460 680,540 780,600 L 800,600 L 800,0 Z" fill="#082f49" opacity="0.85" />

              {/* Arterials */}
              <g stroke="#1e293b" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 40,240 L 260,250 L 520,240 L 720,220" />
                <path d="M 380,30 L 390,240 L 410,420 L 420,580" />
                <path d="M 480,40 L 485,240 L 500,430 L 520,570" />
                <path d="M 120,490 L 320,460 L 460,450 L 600,480" />
                <path d="M 200,340 L 390,340 L 560,340" />
              </g>
              <g stroke="#334155" strokeWidth="4" fill="none">
                <path d="M 40,240 L 260,250 L 520,240 L 720,220" />
                <path d="M 380,30 L 390,240 L 410,420 L 420,580" />
                <path d="M 480,40 L 485,240 L 500,430 L 520,570" />
                <path d="M 120,490 L 320,460 L 460,450 L 600,480" />
                <path d="M 200,340 L 390,340 L 560,340" />
              </g>

              {/* Render defect circle problems on vector map */}
              {filteredPins.map((pin) => {
                const x = Math.max(30, Math.min(760, ((pin.lng - 104.88) / 0.06) * 700 + 50));
                const y = Math.max(30, Math.min(560, ((11.59 - pin.lat) / 0.07) * 500 + 50));
                const isSelected = selectedDetection?.coordinates.lat === pin.lat && 
                                   selectedDetection?.coordinates.lng === pin.lng;
                const sign = getSignConfig(pin.type);

                return (
                  <g 
                    key={`svg-pin-${pin.id}`} 
                    className="cursor-pointer transition-all duration-200"
                    transform={`translate(${x}, ${y})`}
                    onClick={() => handleSelectPin(pin)}
                  >
                    <title>{`${pin.title} (${(pin.confidence * 100).toFixed(0)}%)`}</title>
                    {isSelected && (
                      <circle r="18" fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" strokeWidth="1.5">
                        <animate attributeName="r" values="14;22;14" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Circle problem marker */}
                    <circle r="8" fill={sign.pinColor} stroke="#ffffff" strokeWidth="2.5" />
                    <circle r="3" fill="#ffffff" opacity="0.9" />
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Zoom & Recenter Controls */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200/80 p-0.5">
          <button 
            onClick={handleZoomIn}
            className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors active:scale-95"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 w-full" />
          <button 
            onClick={handleZoomOut}
            className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors active:scale-95"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 w-full" />
          <button 
            onClick={handleRecenter}
            className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg text-sm transition-colors active:scale-95"
            title="Recenter Map"
            aria-label="Recenter Map"
          >
            <Crosshair className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>

        {/* Legend Box on top right with Defect Problem Circles */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200/80 p-2 md:p-2.5 text-[10px] md:text-[11px] text-slate-700 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Problem Legend
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs flex items-center justify-center text-white text-[8px] font-bold">●</span>
            <span className="font-medium">{t.potholes}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs flex items-center justify-center text-white text-[8px] font-bold">●</span>
            <span className="font-medium">{t.longitudinalCrack}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500 shadow-xs flex items-center justify-center text-white text-[8px] font-bold">●</span>
            <span className="font-medium">{t.transverseCrack}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-xs flex items-center justify-center text-white text-[8px] font-bold">●</span>
            <span className="font-medium">{t.alligatorCrack}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-sky-300 shadow-xs flex items-center justify-center text-white text-[8px] font-bold">●</span>
            <span className="font-bold text-sky-700">{t.manholeHazard} (24)</span>
          </div>
        </div>

        {/* Floating Detail Popup Card when a pin is selected */}
        {selectedDetection && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-88 z-30 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start gap-3">
              {/* Defect Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                <img 
                  src={selectedDetection.cropImage || selectedDetection.image} 
                  alt={selectedDetection.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-white ${
                  selectedDetection.type === 'pothole' ? 'bg-rose-600' :
                  selectedDetection.type === 'crack' || selectedDetection.type === 'longitudinal_crack' ? 'bg-amber-600' :
                  selectedDetection.type === 'transverse_crack' ? 'bg-teal-600' :
                  selectedDetection.type === 'alligator_crack' ? 'bg-indigo-600' :
                  selectedDetection.type === 'manhole_hazard' ? 'bg-sky-600' : 'bg-emerald-600'
                }`}>
                  {selectedDetection.type.replace('_', ' ')}
                </span>
              </div>

              {/* Defect Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold text-white uppercase ${
                    selectedDetection.type === 'pothole' ? 'bg-rose-500' :
                    selectedDetection.type === 'crack' || selectedDetection.type === 'longitudinal_crack' ? 'bg-amber-500' :
                    selectedDetection.type === 'transverse_crack' ? 'bg-teal-600' :
                    selectedDetection.type === 'alligator_crack' ? 'bg-indigo-600' :
                    selectedDetection.type === 'manhole_hazard' ? 'bg-sky-600' : 'bg-emerald-600'
                  }`}>
                    {selectedDetection.type.replace('_', ' ')}
                  </span>
                  <button 
                    onClick={() => onSelectDetection(null as any)}
                    className="text-slate-400 hover:text-slate-600 p-1 -mr-1"
                    aria-label="Close popup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1 truncate" title={selectedDetection.title}>
                  {selectedDetection.title}
                </div>
                <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                  {selectedDetection.roadName}
                </div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>Confidence: <strong className="text-blue-600 font-mono">{(selectedDetection.confidence * 100).toFixed(0)}%</strong></span>
                  <span className="font-mono text-slate-400">{selectedDetection.coordinates.lat.toFixed(4)}, {selectedDetection.coordinates.lng.toFixed(4)}</span>
                </div>
                {selectedDetection.depthCm && (
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Depression: <strong className="text-slate-700">{selectedDetection.depthCm} cm</strong> | Area: <strong className="text-slate-700">{selectedDetection.areaM2 || 0.6} m²</strong>
                  </div>
                )}
                <button
                  onClick={() => onOpenDetails(selectedDetection)}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors min-h-[30px]"
                >
                  <span>{t.viewDetails}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
