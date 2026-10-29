import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  MapPin, 
  FlipHorizontal, 
  Image as ImageIcon, 
  CheckCircle2, 
  Flashlight, 
  Video, 
  Upload, 
  Info, 
  Zap, 
  Calendar 
} from 'lucide-react';
import { DamageDetection, DamageType } from '../types/damage';
import { 
  DASHCAM_IMG, 
  POTHOLE_IMG, 
  CRACK_IMG, 
  DEFECT_MANHOLE_HAZARD_IMG,
  DEFECT_ALLIGATOR_CRACK_IMG,
  SAMPLE_VIDEO_URL, 
  SAMPLE_VIDEO_TRACKED_PROBLEMS,
  VideoTrackedProblem 
} from '../data/mockData';
import { Language, translations } from '../i18n/translations';

interface MobileCameraScannerProps {
  onSaveNewDetection: (det: DamageDetection) => void;
  language?: Language;
  onOpenUploadTool?: () => void;
  dateRange?: string;
}

export const MobileCameraScanner: React.FC<MobileCameraScannerProps> = ({ 
  onSaveNewDetection,
  language = 'en',
  onOpenUploadTool,
  dateRange = 'Oct 15, 2026'
}) => {
  const t = translations[language];

  // Camera stream refs & state
  const videoRef = useRef<HTMLVideoElement>(null);
  const patrolVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);

  // Video Inspection & Tracking state
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [activePatrolProblem, setActivePatrolProblem] = useState<VideoTrackedProblem>(SAMPLE_VIDEO_TRACKED_PROBLEMS[0]);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [flash, setFlash] = useState(false);
  const [savedToast, setSavedToast] = useState<{ id: string; title: string } | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({ lat: 11.5672, lng: 104.9148 });
  const [, setGpsStatus] = useState<'acquiring' | 'locked' | 'simulated'>('simulated');
  const [currentTime, setCurrentTime] = useState(() => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update active tracked problem as the patrol video plays
  const handlePatrolTimeUpdate = () => {
    if (patrolVideoRef.current) {
      const time = patrolVideoRef.current.currentTime;
      setVideoCurrentTime(time);
      const sec = Math.floor(time);
      const matched = SAMPLE_VIDEO_TRACKED_PROBLEMS.find(p => sec >= p.timeSeconds && sec <= p.endSeconds);
      if (matched && matched.id !== activePatrolProblem.id) {
        setActivePatrolProblem(matched);
        setGpsCoords(matched.coordinates);
      }
    }
  };

  const handleJumpToProblem = (prob: VideoTrackedProblem) => {
    setActivePatrolProblem(prob);
    setGpsCoords(prob.coordinates);
    if (patrolVideoRef.current) {
      patrolVideoRef.current.currentTime = prob.timeSeconds;
      patrolVideoRef.current.play().catch(() => {});
    }
  };

  // Initialize GPS on mobile devices
  useEffect(() => {
    if ('geolocation' in navigator) {
      setGpsStatus('acquiring');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5))
          });
          setGpsStatus('locked');
        },
        () => {
          setGpsStatus('simulated');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Stop camera stream utility
  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
    setIsTorchOn(false);
  }, [stream]);

  // Start real camera stream
  const startCameraStream = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsLiveCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }

      // Check for torch capability
      const track = newStream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const capabilities = (track as any).getCapabilities?.() || {};
        setSupportsTorch(!!capabilities.torch);
      }
    } catch (err: any) {
      console.warn('Real camera could not be started:', err);
      setCameraError(err.message || 'Camera permission denied or camera device in use.');
      setIsLiveCameraActive(false);
    }
  }, [facingMode, stream]);

  // Toggle torch/flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextTorch = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setIsTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch constraint error:', err);
      }
    }
  };

  // Switch between rear/front camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isLiveCameraActive) {
      startCameraStream(nextMode);
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Handle capture snapshot from live camera or simulated road frame
  const handleCapture = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(60); } catch (_) {}
    }

    let capturedImageUrl = customPhoto || DASHCAM_IMG;
    if (isLiveCameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          capturedImageUrl = canvas.toDataURL('image/jpeg', 0.88);
        }
      }
    }

    const prob = activePatrolProblem || SAMPLE_VIDEO_TRACKED_PROBLEMS[0];

    const newDet: DamageDetection = {
      id: `det-mob-${Date.now().toString().slice(-4)}`,
      type: prob.type,
      title: language === 'km' ? prob.kmTitle : prob.title,
      confidence: prob.confidence,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + prob.timeFormatted,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: prob.timeFormatted,
      coordinates: prob.coordinates,
      locationName: language === 'km' ? 'ល្បាតផ្លូវហាយវេភ្នំពេញ' : 'Phnom Penh Patrol Video Survey',
      roadName: language === 'km' ? prob.kmRoadName : prob.roadName,
      severity: prob.severity,
      depthCm: prob.depthCm,
      areaM2: prob.areaM2,
      image: capturedImageUrl || DASHCAM_IMG,
      cropImage: prob.type === 'alligator_crack'
        ? DEFECT_ALLIGATOR_CRACK_IMG
        : prob.type === 'manhole_hazard'
        ? DEFECT_MANHOLE_HAZARD_IMG
        : prob.type === 'pothole'
        ? POTHOLE_IMG
        : CRACK_IMG,
      boundingBoxes: prob.boxes,
      status: 'detected',
      notes: prob.description
    };

    onSaveNewDetection(newDet);
    setSavedToast({ id: newDet.id, title: newDet.title });
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomPhoto(ev.target?.result as string);
        stopCameraStream();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[520px] max-h-[820px] bg-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between border border-blue-900/60 shadow-2xl select-none">
      
      {/* Hidden canvas for capturing real camera video frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Camera HUD Bar */}
      <div className="z-30 p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between text-white text-xs gap-2">
        {/* Left: AI Mode & Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-blue-600/90 text-white font-mono font-bold tracking-wider uppercase text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg shadow-sm border border-cyan-400/30">
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
            <span>{isLiveCameraActive ? 'LIVE DEVICE CAM' : 'AI PATROL SENSOR'}</span>
          </div>
          {/* Quick toggle to real camera */}
          <button
            onClick={() => isLiveCameraActive ? stopCameraStream() : startCameraStream()}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 border ${
              isLiveCameraActive 
                ? 'bg-emerald-600/90 text-white border-emerald-400/40 shadow-sm' 
                : 'bg-white/10 hover:bg-white/20 text-blue-200 border-white/10'
            }`}
            title={isLiveCameraActive ? 'Switch to Road Simulation' : 'Start Real Mobile Camera'}
          >
            {isLiveCameraActive ? <Video className="w-3 h-3 text-emerald-200" /> : <Camera className="w-3 h-3 text-cyan-300" />}
            <span className="hidden xs:inline">{isLiveCameraActive ? 'Live Active' : t.turnOnCamera}</span>
          </button>
        </div>

        {/* Right: GPS & Camera Utilities */}
        <div className="flex items-center gap-2">
          {supportsTorch && isLiveCameraActive && (
            <button
              onClick={toggleTorch}
              className={`p-1.5 rounded-lg border transition-all ${
                isTorchOn ? 'bg-amber-500 text-white border-amber-300' : 'bg-black/60 text-slate-300 border-white/10'
              }`}
              title="Toggle Flashlight / Torch"
            >
              <Flashlight className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Camera flip */}
          <button
            onClick={toggleFacingMode}
            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-cyan-300 hover:text-white border border-white/10 transition-colors active:scale-95"
            title={t.switchCamera}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* GPS Coordinates pill */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono border border-cyan-400/20 text-cyan-300">
            <MapPin className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>{gpsCoords.lat}° N, {gpsCoords.lng}° E</span>
          </div>
        </div>
      </div>

      {/* Viewfinder Center Display */}
      <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-black">
        {/* Real Live Camera Video Stream */}
        {isLiveCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          /* Video Patrol Camera View (Playing sample dashcam video) */
          <video
            ref={patrolVideoRef}
            src={SAMPLE_VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            onTimeUpdate={handlePatrolTimeUpdate}
            className="w-full h-full object-cover"
          />
        )}

        {/* Timestamp & Date HUD watermark (Matching sample dashcam 4K-10:05) */}
        <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none flex flex-wrap items-center gap-1.5 animate-in fade-in duration-300">
          <span className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white shadow-xl flex items-center gap-1.5 font-mono text-[11px]">
            <span className="font-bold text-amber-300">4K-10:05</span>
            <span className="text-white/30">|</span>
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-100">2026-10-15</span>
            <span className="text-white/30">|</span>
            <span className="text-cyan-300 font-bold tabular-nums">12:03:{Math.floor(35 + videoCurrentTime).toString().padStart(2, '0')}</span>
          </span>
          <span className="bg-rose-600/90 backdrop-blur-md px-2 py-1 rounded-lg border border-rose-400/40 text-white shadow text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            AI Video Tracking
          </span>
        </div>

        {/* Active Problem Alert Tag on Bottom Left */}
        {activePatrolProblem && (
          <div className="absolute bottom-12 left-3 z-20 pointer-events-none">
            <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-cyan-400/40 text-white shadow-xl flex items-center gap-2 max-w-[280px]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <div className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold">
                  {activePatrolProblem.timeFormatted} • {activePatrolProblem.type.replace('_', ' ')}
                </div>
                <div className="text-[11px] font-bold text-white truncate">
                  {language === 'km' ? activePatrolProblem.kmTitle : activePatrolProblem.title}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Telemetry & GPS coordinate watermark */}
        <div className="absolute bottom-3.5 left-3.5 z-20 pointer-events-none">
          <span className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-slate-200 shadow-xl text-[10px] font-mono flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Phnom Penh Highway • {gpsCoords.lat}° N, {gpsCoords.lng}° E</span>
          </span>
        </div>

        {/* Camera Permission Alert */}
        {cameraError && !isLiveCameraActive && (
          <div className="absolute top-14 inset-x-4 bg-slate-900/90 border border-blue-500/40 text-blue-100 p-2.5 rounded-xl text-xs flex items-center justify-between z-30 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-[11px] leading-tight">
                {t.cameraDenied}
              </span>
            </div>
            <button
              onClick={() => setCameraError(null)}
              className="text-cyan-300 text-[10px] font-bold underline ml-2"
            >
              OK
            </button>
          </div>
        )}

        {/* Shutter White Flash Animation */}
        {flash && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200" />
        )}

        {/* Viewfinder Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/20">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div />
          </div>
        </div>

        {/* Real-time AI Bounding Box Overlays Synchronized with Video */}
        {isScanning && activePatrolProblem && (
          <>
            {activePatrolProblem.boxes.map((box, bIdx) => {
              const isPothole = activePatrolProblem.type === 'pothole';
              const isManhole = activePatrolProblem.type === 'manhole_hazard';
              const borderColor = isPothole ? 'border-rose-500' : isManhole ? 'border-sky-400' : 'border-amber-400';
              const badgeBg = isPothole ? 'bg-rose-600' : isManhole ? 'bg-sky-600' : 'bg-amber-600';

              return (
                <div 
                  key={bIdx}
                  className={`absolute border-2 ${borderColor} shadow-[0_0_20px_rgba(56,189,248,0.5)] pointer-events-none transition-all duration-300 animate-pulse`}
                  style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%` }}
                >
                  {/* Floating AI Label */}
                  <div className={`absolute -top-6 left-0 ${badgeBg} text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{box.label}</span>
                  </div>
                  {/* Corner Reticle Accents */}
                  <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white" />
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white" />
                  
                  <div className="absolute -bottom-6 right-0 bg-black/85 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-400/30">
                    Depth ~{activePatrolProblem.depthCm}cm • Area ~{activePatrolProblem.areaM2}m²
                  </div>
                </div>
              );
            })}

            {/* Laser scanning beam */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline pointer-events-none shadow-[0_0_10px_#38bdf8]" />
          </>
        )}

        {/* Center Target Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
          <div className="w-8 h-8 border border-white/60 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          </div>
        </div>

        {/* Saved Success Toast Alert */}
        {savedToast && (
          <div className="absolute top-6 inset-x-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between z-40 border border-emerald-400/40 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{savedToast.title}</div>
                <div className="text-[10px] text-emerald-100">{t.saved}</div>
              </div>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold shrink-0">
              GPS Synced
            </span>
          </div>
        )}
      </div>

      {/* Bottom Shutter & Controls Dock */}
      <div className="z-30 p-3 sm:p-4 bg-gradient-to-t from-black via-black/95 to-transparent space-y-3">
        {/* Preset & Category Selection Row */}
        <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {SAMPLE_VIDEO_TRACKED_PROBLEMS.map((prob) => {
              const isSelected = activePatrolProblem?.id === prob.id;
              return (
                <button
                  key={prob.id}
                  onClick={() => handleJumpToProblem(prob)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950 shadow-md font-bold ring-2 ring-cyan-200'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    prob.severity === 'critical' ? 'bg-rose-400' :
                    prob.type === 'manhole_hazard' ? 'bg-sky-400' : 'bg-amber-400'
                  }`} />
                  <span className="font-mono text-[9px] font-bold opacity-80">{prob.timeFormatted}</span>
                  <span className="truncate max-w-[110px]">{language === 'km' ? prob.kmTitle : prob.title}</span>
                </button>
              );
            })}
          </div>

          {/* Quick link to dedicated Upload Tool */}
          {onOpenUploadTool && (
            <button
              onClick={onOpenUploadTool}
              className="px-2.5 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-400/30 flex items-center gap-1 shrink-0"
              title="Open full Upload & AI Analysis Tool"
            >
              <Upload className="w-3 h-3" />
              <span>{t.toolUpload}</span>
            </button>
          )}
        </div>

        {/* Shutter Action Control Dock */}
        <div className="flex items-center justify-around pt-1">
          {/* Gallery / File Picker Button */}
          <label 
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex flex-col items-center justify-center text-white cursor-pointer transition-all active:scale-95 shadow-md"
            title="Upload Photo from Phone Gallery"
          >
            <ImageIcon className="w-5 h-5 text-cyan-300" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Center Main Shutter Capture Button */}
          <button
            onClick={handleCapture}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white p-1 border-4 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center text-blue-600 active:scale-90 transition-transform cursor-pointer"
            aria-label={t.captureDefect}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 flex items-center justify-center text-white transition-colors shadow-inner">
              <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          </button>

          {/* AI Reticle / Scanning HUD Toggle */}
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`w-12 h-12 rounded-full border flex items-center justify-center text-white transition-all active:scale-95 shadow-md ${
              isScanning 
                ? 'bg-cyan-600 border-cyan-300 text-white shadow-cyan-500/50' 
                : 'bg-white/10 border-white/20 text-slate-400'
            }`}
            title="Toggle AI Bounding Box HUD"
          >
            <Zap className={`w-5 h-5 ${isScanning ? 'fill-current text-white' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
