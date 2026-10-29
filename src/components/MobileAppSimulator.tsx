import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  MapPin, 
  Play, 
  Square, 
  Home, 
  FileText, 
  Wifi, 
  Battery, 
  Signal, 
  X
} from 'lucide-react';
import { DASHCAM_IMG, POTHOLE_IMG, APP_LOGO_IMG } from '../data/mockData';
import { DamageDetection } from '../types/damage';

interface MobileAppSimulatorProps {
  onCaptureDetection: (detection: DamageDetection) => void;
  onClose?: () => void;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({
  onCaptureDetection,
  onClose
}) => {
  const [isDetecting, setIsDetecting] = useState(true);
  const [gpsActive, setGpsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'camera' | 'home' | 'map' | 'reports'>('camera');
  const [flashScreen, setFlashScreen] = useState(false);
  const [, setDetectedCount] = useState(3);
  const [confidenceOffset, setConfidenceOffset] = useState(0);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomImage(ev.target?.result as string);
        setActiveTab('camera');
      };
      reader.readAsDataURL(file);
    }
  };

  // Periodic subtle jitter to simulate live video feed inference
  useEffect(() => {
    if (!isDetecting) return;
    const interval = setInterval(() => {
      setConfidenceOffset((prev) => (prev > 2 ? 0 : prev + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isDetecting]);

  const handleCapture = () => {
    setFlashScreen(true);
    setTimeout(() => setFlashScreen(false), 200);

    const newDetection: DamageDetection = {
      id: `det-mob-${Date.now()}`,
      type: 'pothole',
      title: 'Mobile Camera Road Pothole',
      confidence: 0.92,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      coordinates: {
        lat: 11.5725 + (Math.random() - 0.5) * 0.003,
        lng: 104.9182 + (Math.random() - 0.5) * 0.003,
      },
      locationName: 'Phnom Penh Highway Patrol',
      roadName: 'Monivong Boulevard',
      severity: 'critical',
      depthCm: 7.8,
      areaM2: 0.42,
      image: customImage || DASHCAM_IMG,
      cropImage: POTHOLE_IMG,
      boundingBoxes: [
        { x: 38, y: 58, width: 22, height: 16, label: 'Pothole 0.92', confidence: 0.92 },
        { x: 28, y: 51, width: 14, height: 10, label: 'Pothole 0.85', confidence: 0.85 }
      ],
      status: 'detected',
      notes: 'Captured via Mobile Companion Camera app.'
    };

    onCaptureDetection(newDetection);
    setDetectedCount(prev => prev + 1);
  };

  return (
    <div className="relative w-[310px] md:w-[330px] shrink-0 select-none">
      {/* Smartphone Chassis Exterior */}
      <div className="relative rounded-[42px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-950/70" />
        </div>

        {/* Screen Bezel Interior */}
        <div className="relative rounded-[32px] overflow-hidden bg-slate-900 h-[640px] flex flex-col justify-between border border-slate-800">
          
          {/* Status Bar */}
          <div className="pt-2 px-6 pb-1 flex items-center justify-between text-white text-[11px] font-semibold z-30 tracking-tight">
            <span>10:24</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* App Header inside phone */}
          <div className="px-4 py-2 flex items-center justify-between z-30 bg-gradient-to-b from-slate-950/80 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-xs">
                <img
                  src={APP_LOGO_IMG}
                  alt="AgroRoad AI"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-white font-bold text-xs leading-none flex items-center gap-1">
                  <span>AgroRoad</span><span className="text-[#38BDF8] font-black">AI</span>
                </div>
                <div className="text-cyan-300 text-[8px] font-medium leading-tight mt-0.5">Smarter Analysis | Safer Roads</div>
              </div>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs hover:bg-white/30"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Camera Viewport Canvas */}
          <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Live Camera Road Image */}
            <img 
              src={customImage || DASHCAM_IMG} 
              alt="Road Viewfinder"
              className="w-full h-full object-cover scale-105"
            />

            {/* Flash screen effect on shutter capture */}
            {flashScreen && (
              <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200" />
            )}

            {/* Live bounding boxes */}
            {isDetecting && (
              <>
                {/* Pothole 0.85 */}
                <div 
                  className="absolute border-2 border-blue-500 shadow-md transition-all duration-300 pointer-events-none"
                  style={{
                    left: '12%',
                    top: '52%',
                    width: '28%',
                    height: '14%',
                  }}
                >
                  <div className="absolute -top-5 left-0 bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded font-mono">
                    Pothole {confidenceOffset === 1 ? '0.86' : '0.85'}
                  </div>
                </div>

                {/* Pothole 0.92 */}
                <div 
                  className="absolute border-2 border-blue-500 shadow-md transition-all duration-300 pointer-events-none"
                  style={{
                    left: '32%',
                    top: '60%',
                    width: '36%',
                    height: '18%',
                  }}
                >
                  <div className="absolute -top-5 left-0 bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded font-mono">
                    Pothole {confidenceOffset === 2 ? '0.94' : '0.92'}
                  </div>
                </div>

                {/* Pothole 0.91 */}
                <div 
                  className="absolute border-2 border-blue-500 shadow-md transition-all duration-300 pointer-events-none"
                  style={{
                    left: '58%',
                    top: '48%',
                    width: '24%',
                    height: '12%',
                  }}
                >
                  <div className="absolute -top-5 left-0 bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded font-mono">
                    Pothole 0.91
                  </div>
                </div>

                {/* Live laser scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2 pointer-events-none" />
              </>
            )}

            {/* Paused state overlay */}
            {!isDetecting && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center z-20">
                <Square className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-sm font-bold">Detection Paused</p>
                <p className="text-xs text-slate-300 mt-1">Tap 'Start Detection' to resume real-time computer vision scan.</p>
              </div>
            )}
          </div>

          {/* Lower Phone Controls Panel */}
          <div className="p-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-30 space-y-2.5">
            {/* Row of 3 mini utilities: Gallery, Camera Shutter, GPS On */}
            <div className="flex items-center justify-around px-2">
              {/* Gallery / File Upload */}
              <label 
                className="flex flex-col items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Upload Photo to Inspect"
              >
                <div className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-750 border border-slate-700 flex items-center justify-center text-cyan-300">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Shutter Capture */}
              <button
                onClick={handleCapture}
                className="flex flex-col items-center group active:scale-95 transition-transform"
                title="Capture & Save Defect"
              >
                <div className="w-13 h-13 rounded-full bg-blue-600 border-4 border-white/80 shadow-lg shadow-blue-500/40 flex items-center justify-center text-white group-hover:bg-blue-500">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              {/* GPS Status */}
              <button 
                onClick={() => setGpsActive(!gpsActive)}
                className="flex flex-col items-center text-slate-400 hover:text-white transition-colors"
              >
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                  gpsActive ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-1 font-medium">{gpsActive ? 'GPS On' : 'GPS Off'}</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsDetecting(!isDetecting)}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
                isDetecting
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isDetecting ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Detection</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Detection</span>
                </>
              )}
            </button>

            {/* Phone Bottom Nav Bar */}
            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-around text-slate-400 text-[10px]">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center py-1 transition-colors ${activeTab === 'home' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button 
                onClick={() => setActiveTab('camera')}
                className={`flex flex-col items-center py-1 transition-colors ${activeTab === 'camera' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
              >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={`flex flex-col items-center py-1 transition-colors ${activeTab === 'map' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
              >
                <MapPin className="w-4 h-4" />
                <span>Map</span>
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`flex flex-col items-center py-1 transition-colors ${activeTab === 'reports' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
