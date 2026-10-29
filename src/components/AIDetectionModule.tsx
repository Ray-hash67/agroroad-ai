import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Calendar,
  Video,
  Clock,
  Gauge,
  MapPin,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Camera,
  FlipHorizontal,
  Flashlight,
  AlertCircle
} from 'lucide-react';
import { DamageDetection, DamageType, DefectSeverity } from '../types/damage';
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

interface AIDetectionModuleProps {
  onSaveNewDetection: (detection: DamageDetection) => void;
  standalone?: boolean;
  language?: Language;
  onOpenUploadTool?: () => void;
}

export const AIDetectionModule: React.FC<AIDetectionModuleProps> = ({
  onSaveNewDetection,
  standalone = false,
  language = 'en',
  onOpenUploadTool
}) => {
  const t = translations[language];
  const isKm = language === 'km';

  // Video and Media Mode State - Default to Live Camera Tracking Space
  const [activeMediaMode, setActiveMediaMode] = useState<'live-camera' | 'video-custom' | 'video-sample' | 'image-custom'>('live-camera');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string>('');
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Live Camera Stream State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);

  // Video Player Controls & Playback State
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(25);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isAiScanning, setIsAiScanning] = useState(true);

  // Live Camera Controls
  const startLiveCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setCameraStream(stream);
      setIsLiveCameraActive(true);
      setActiveMediaMode('live-camera');
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play().catch(() => {});
      }
      const track = stream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const capabilities = (track as any).getCapabilities?.() || {};
        setSupportsTorch(!!capabilities.torch);
      }
    } catch (err: any) {
      setCameraError(err.message || 'Camera permission denied or camera device in use.');
      setIsLiveCameraActive(false);
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
    setIsTorchOn(false);
  };

  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (isLiveCameraActive) {
      startLiveCamera(next);
    }
  };

  const toggleTorch = async () => {
    if (!cameraStream) return;
    const track = cameraStream.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const next = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: next }]
        });
        setIsTorchOn(next);
      } catch (err) {
        console.warn('Torch constraint error:', err);
      }
    }
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  // Synchronized Tracking & Selected Problem
  const [activeTrackedProblem, setActiveTrackedProblem] = useState<VideoTrackedProblem | null>(SAMPLE_VIDEO_TRACKED_PROBLEMS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedAllSuccess, setSavedAllSuccess] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Still Image Presets (when switched to static analysis)
  const imagePresets = {
    dashcam: {
      image: DASHCAM_IMG,
      crop: POTHOLE_IMG,
      type: 'pothole' as DamageType,
      title: 'Pothole (Arterial Corridor)',
      confidence: 0.92,
      date: 'Oct 15, 2026 12:03 PM',
      location: '11.5672, 104.9148',
      depth: 8.5,
      boxes: [
        { x: 38, y: 58, width: 22, height: 16, label: 'Pothole 0.92', confidence: 0.92 },
        { x: 28, y: 51, width: 14, height: 10, label: 'Pothole 0.85', confidence: 0.85 }
      ]
    },
    pothole: {
      image: POTHOLE_IMG,
      crop: POTHOLE_IMG,
      type: 'pothole' as DamageType,
      title: 'Severe Cavity Pothole',
      confidence: 0.95,
      date: 'Oct 15, 2026 12:04 PM',
      location: '11.5755, 104.9225',
      depth: 10.2,
      boxes: [
        { x: 22, y: 35, width: 56, height: 48, label: 'Pothole 0.95', confidence: 0.95 }
      ]
    },
    crack: {
      image: CRACK_IMG,
      crop: CRACK_IMG,
      type: 'crack' as DamageType,
      title: 'Structural Fatigue Cracking',
      confidence: 0.89,
      date: 'Oct 15, 2026 12:04 PM',
      location: '11.5689, 104.9160',
      depth: 2.4,
      boxes: [
        { x: 12, y: 15, width: 75, height: 70, label: 'Crack 0.89', confidence: 0.89 }
      ]
    },
    manhole: {
      image: DEFECT_MANHOLE_HAZARD_IMG,
      crop: DEFECT_MANHOLE_HAZARD_IMG,
      type: 'manhole_hazard' as DamageType,
      title: 'Manhole Hazard & Settlement',
      confidence: 0.94,
      date: 'Oct 15, 2026 12:04 PM',
      location: '11.5705, 104.9175',
      depth: 5.8,
      boxes: [
        { x: 26, y: 30, width: 48, height: 44, label: 'Manhole Hazard 0.94', confidence: 0.94 }
      ]
    }
  };

  const isVideoMode = activeMediaMode === 'video-sample' || activeMediaMode === 'video-custom';

  // Video time tracking and problem synchronization
  useEffect(() => {
    if (!isVideoMode) return;
    
    // Find problem corresponding directly to current video timestamp (0 to 25 seconds)
    const effectiveSec = Math.floor(currentTime);
    const matchedProblem = SAMPLE_VIDEO_TRACKED_PROBLEMS.find(p => {
      return (effectiveSec >= p.timeSeconds && effectiveSec <= p.endSeconds) || Math.abs(currentTime - p.timeSeconds) < 1.5;
    }) || SAMPLE_VIDEO_TRACKED_PROBLEMS[0];

    if (matchedProblem) {
      setActiveTrackedProblem(matchedProblem);
    }
  }, [currentTime, isVideoMode]);

  // Handle video playback time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 25);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleJumpToProblem = (problem: VideoTrackedProblem) => {
    setActiveMediaMode('video-sample');
    setActiveTrackedProblem(problem);
    setCurrentTime(problem.timeSeconds);
    if (videoRef.current) {
      videoRef.current.currentTime = problem.timeSeconds;
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Video and image file uploads
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setCustomVideoName(file.name);
      setActiveMediaMode('video-custom');
      setIsPlaying(true);
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomImage(ev.target?.result as string);
        setActiveMediaMode('image-custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save single active defect
  const handleSaveActiveDefect = () => {
    if (!activeTrackedProblem) return;

    const newDet: DamageDetection = {
      id: `det-v-${Date.now().toString().slice(-4)}`,
      type: activeTrackedProblem.type,
      title: activeTrackedProblem.title,
      confidence: activeTrackedProblem.confidence,
      timestamp: 'Oct 15, 2026 ' + formatSeconds(currentTime),
      date: 'Oct 15, 2026',
      time: formatSeconds(currentTime),
      coordinates: activeTrackedProblem.coordinates,
      locationName: 'Phnom Penh Patrol Video Survey',
      roadName: activeTrackedProblem.roadName,
      severity: activeTrackedProblem.severity,
      depthCm: activeTrackedProblem.depthCm,
      areaM2: activeTrackedProblem.areaM2,
      image: DASHCAM_IMG,
      cropImage: activeTrackedProblem.type === 'alligator_crack' 
        ? DEFECT_ALLIGATOR_CRACK_IMG 
        : activeTrackedProblem.type === 'manhole_hazard' 
        ? DEFECT_MANHOLE_HAZARD_IMG 
        : POTHOLE_IMG,
      boundingBoxes: activeTrackedProblem.boxes,
      status: 'detected',
      notes: activeTrackedProblem.description
    };

    onSaveNewDetection(newDet);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Save all 12 tracked problems in batch
  const handleSaveAllTrackedProblems = () => {
    SAMPLE_VIDEO_TRACKED_PROBLEMS.forEach((prob, index) => {
      const newDet: DamageDetection = {
        id: `det-patrol-${prob.timeFormatted.replace(':', '')}-${index}`,
        type: prob.type,
        title: prob.title,
        confidence: prob.confidence,
        timestamp: 'Oct 15, 2026 ' + prob.timeFormatted,
        date: 'Oct 15, 2026',
        time: prob.timeFormatted,
        coordinates: prob.coordinates,
        locationName: 'Phnom Penh Video Route Survey',
        roadName: prob.roadName,
        severity: prob.severity,
        depthCm: prob.depthCm,
        areaM2: prob.areaM2,
        image: DASHCAM_IMG,
        cropImage: prob.type === 'alligator_crack' 
          ? DEFECT_ALLIGATOR_CRACK_IMG 
          : prob.type === 'manhole_hazard' 
          ? DEFECT_MANHOLE_HAZARD_IMG 
          : POTHOLE_IMG,
        boundingBoxes: prob.boxes,
        status: 'detected',
        notes: prob.description
      };
      onSaveNewDetection(newDet);
    });

    setSavedAllSuccess(true);
    setTimeout(() => setSavedAllSuccess(false), 3500);
  };

  const runAiEvaluation = async () => {
    setIsAiAnalyzing(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      const target = isVideoMode ? activeTrackedProblem : imagePresets[activeMediaMode as keyof typeof imagePresets];
      setAiAnalysisResult(
        `Civil Engineering Assessment: ${target?.title || 'Defect'} verified at ${target?.confidence ? (target.confidence * 100).toFixed(0) : '92'}% neural network certainty. Sub-base moisture penetration detected. Cold-mastic asphalt patching or utility rim leveling recommended within 48h priority queue.`
      );
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Helper format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic telemetry calculations
  const dynamicSpeed = Math.round(24 + Math.sin(currentTime * 0.4) * 8);
  const dynamicLat = Number((11.5642 + (currentTime / duration) * 0.0159).toFixed(5));
  const dynamicLng = Number((104.9120 + (currentTime / duration) * 0.0142).toFixed(5));

  // Active boxes to render
  const currentBoxes = isVideoMode 
    ? (activeTrackedProblem?.boxes || [])
    : (imagePresets[activeMediaMode as keyof typeof imagePresets]?.boxes || []);

  const currentType = isVideoMode 
    ? (activeTrackedProblem?.type || 'pothole')
    : (imagePresets[activeMediaMode as keyof typeof imagePresets]?.type || 'pothole');

  const currentSeverity: DefectSeverity = isVideoMode
    ? (activeTrackedProblem?.severity || 'critical')
    : (currentType === 'pothole' ? 'critical' : 'moderate');

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden ${standalone ? 'p-4 sm:p-6' : 'p-3 sm:p-4'}`}>
      
      {/* Hidden File Upload Inputs */}
      <input
        ref={videoUploadInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Module Title & Video Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-100 mb-4 gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            1
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{t.aiDetection}</h3>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>MODEL: YOLO26-S (best.pt · 20.3MB)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isKm ? 'ការត្រួតពិនិត្យ និងតាមដានបញ្ហាផ្លូវតាមវីដេអូ' : 'Real-time video road distress tracking & defect telemetry'}
            </p>
          </div>
        </div>

        {/* Video Toolbar Options */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
          {/* 1. Live Camera Tracking Mode (Selected by default) */}
          <button
            onClick={() => {
              setActiveMediaMode('live-camera');
              if (!isLiveCameraActive) startLiveCamera();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMediaMode === 'live-camera'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'
            }`}
            title="Live camera road distress tracking space"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isKm ? 'ការតាមដានវីដេអូផ្ទាល់' : 'Live Camera Tracking'}</span>
            <span className={`w-2 h-2 rounded-full ${isLiveCameraActive ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'}`} />
          </button>

          {/* 2. Upload Custom Video Button */}
          <button
            onClick={() => videoUploadInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMediaMode === 'video-custom'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'
            }`}
            title="Upload road video file from PC or phone"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.uploadVideo}</span>
            {customVideoName && (
              <span className="text-[9px] font-mono opacity-80 truncate max-w-[80px]">
                ({customVideoName})
              </span>
            )}
          </button>

          {/* 3. Sample Patrol Video (Optional) */}
          <button
            onClick={() => {
              setActiveMediaMode('video-sample');
              stopLiveCamera();
              if (videoRef.current) {
                videoRef.current.src = SAMPLE_VIDEO_URL;
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMediaMode === 'video-sample'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Inspect Phnom Penh Patrol Sample Video"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isKm ? 'វីដេអូគំរូ' : 'Sample Video'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Video Player Viewport | Real-time Detection Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column (7 Cols): Video Player & Overlay Viewport */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          
          {/* Video Container Box - Spacious Live Tracking Workspace */}
          <div 
            ref={videoContainerRef}
            className="bg-slate-950 rounded-2xl overflow-hidden relative group min-h-[440px] md:min-h-[500px] flex items-center justify-center border border-slate-800 shadow-xl"
          >
            {/* Live Camera Stream Mode */}
            {activeMediaMode === 'live-camera' ? (
              isLiveCameraActive ? (
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover min-h-[440px] md:min-h-[500px]"
                />
              ) : (
                /* Spacious Live Video Tracking Viewfinder Hub */
                <div className="relative w-full h-full min-h-[440px] md:min-h-[500px] flex flex-col items-center justify-center p-6 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden">
                  {/* Subtle Grid Radar Canvas */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 pointer-events-none" />
                  
                  {/* Radar Circles */}
                  <div className="absolute w-80 h-80 rounded-full border border-cyan-500/15 pointer-events-none" />
                  <div className="absolute w-56 h-56 rounded-full border border-cyan-500/20 pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full border border-cyan-500/30 pointer-events-none animate-pulse" />

                  {/* Center Target Crosshair & Action */}
                  <div className="relative z-20 flex flex-col items-center max-w-md space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.35)] animate-pulse">
                      <Camera className="w-8 h-8" />
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {isKm ? 'ទីធ្លាតាមដានវីដេអូផ្ទាល់ (Live Tracking Space)' : 'Live Video Tracking Workspace'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        {isKm
                          ? 'បើកកាមេរ៉ាឧបករណ៍ដើម្បីចាប់ផ្តើមស្កេន និងតាមដានបញ្ហាផ្លូវផ្ទាល់ក្នុងពេលជាក់ស្តែង'
                          : 'Connect your device camera to scan and track road distress in real-time, or upload a video file.'}
                      </p>
                    </div>

                    {/* Camera Error Alert if any */}
                    {cameraError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 max-w-xs text-left">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="text-[11px] leading-tight">{cameraError}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <button
                        onClick={() => startLiveCamera()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isKm ? 'បើកកាមេរ៉ាផ្ទាល់ (Start Live Camera)' : 'Start Live Camera Tracking'}</span>
                      </button>

                      <button
                        onClick={() => videoUploadInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>{t.uploadVideo}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : isVideoMode ? (
              <video
                ref={videoRef}
                src={customVideoUrl || SAMPLE_VIDEO_URL}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-cover min-h-[440px] md:min-h-[500px]"
              />
            ) : (
              <img
                src={customImage || imagePresets[activeMediaMode as keyof typeof imagePresets]?.image || DASHCAM_IMG}
                alt="AI Road Detection Viewport"
                className="w-full h-full object-cover min-h-[440px] md:min-h-[500px]"
              />
            )}

            {/* Real-time Bounding Box Overlays */}
            {isAiScanning && currentBoxes.map((box, idx) => {
              const isPothole = currentType === 'pothole';
              const isManhole = currentType === 'manhole_hazard';
              const borderColor = isPothole ? 'border-rose-500' : isManhole ? 'border-sky-400' : 'border-amber-400';
              const badgeBg = isPothole ? 'bg-rose-600' : isManhole ? 'bg-sky-600' : 'bg-amber-600';

              return (
                <div
                  key={idx}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                  className={`absolute border-2 ${borderColor} shadow-[0_0_20px_rgba(56,189,248,0.4)] z-20 pointer-events-none transition-all duration-300 animate-pulse`}
                >
                  {/* Floating AI Label */}
                  <div className={`absolute -top-6 left-0 ${badgeBg} text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{box.label}</span>
                  </div>
                  {/* Reticle Corner Accents */}
                  <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                </div>
              );
            })}

            {/* Scanning Laser Beam Effect */}
            {isAiScanning && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline pointer-events-none shadow-[0_0_12px_#38bdf8] z-10" />
            )}

            {/* Top HUD Overlay (Dashcam Watermark matching user sample video) */}
            <div className="absolute top-2.5 inset-x-3 flex items-center justify-between text-[10px] sm:text-[11px] text-white z-20 pointer-events-none font-mono">
              <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-lg">
                <span className="font-bold text-amber-300">4K-10:05</span>
                <span className="text-white/40">|</span>
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>2026-10-15</span>
                <span className="text-cyan-300 font-bold tabular-nums">12:03:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-lg">
                <Gauge className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-bold tabular-nums">{dynamicSpeed} km/h</span>
                <span className="text-white/40">|</span>
                <span className="text-blue-300">{dynamicLat}° N, {dynamicLng}° E</span>
              </div>
            </div>

            {/* Active Problem Alert Tag on Bottom Left of Video */}
            {isVideoMode && activeTrackedProblem && (
              <div className="absolute bottom-12 left-3 z-20 pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-400/30 text-white shadow-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{t.trackingNow}:</span>
                  <span className="text-xs font-bold text-white truncate max-w-[240px]">
                    {isKm ? activeTrackedProblem.kmTitle : activeTrackedProblem.title}
                  </span>
                  <span className="font-mono text-[10px] text-amber-400 font-bold">
                    ({(activeTrackedProblem.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Video Controls Overlay Bar */}
            {isVideoMode && (
              <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black via-black/85 to-transparent z-30 flex flex-col gap-1.5">
                {/* Timeline Scrubber with Markers for every problem */}
                <div className="relative w-full flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={duration || 60}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 z-10"
                  />
                  {/* Problem Marker Dots along the scrubber */}
                  {SAMPLE_VIDEO_TRACKED_PROBLEMS.map((prob) => {
                    const scaledSec = (prob.timeSeconds / 120) * (duration || 60);
                    const leftPercent = (scaledSec / (duration || 60)) * 100;
                    const isActive = Math.abs(currentTime - scaledSec) <= 2;
                    return (
                      <button
                        key={prob.id}
                        type="button"
                        onClick={() => handleJumpToProblem(prob)}
                        style={{ left: `${leftPercent}%` }}
                        className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-20 -ml-1 transition-transform cursor-pointer ${
                          prob.severity === 'critical' ? 'bg-rose-500 ring-2 ring-rose-300' :
                          prob.type === 'manhole_hazard' ? 'bg-sky-400 ring-2 ring-sky-200' : 'bg-amber-400 ring-2 ring-amber-200'
                        } ${isActive ? 'scale-150 ring-4 ring-cyan-300 animate-pulse' : 'hover:scale-125'}`}
                        title={`${prob.timeFormatted} - ${prob.title}`}
                      />
                    );
                  })}
                </div>

                {/* Bottom Buttons Bar */}
                <div className="flex items-center justify-between text-white text-xs pt-0.5">
                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlayPause}
                      className="p-1 rounded-md hover:bg-white/20 text-white transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    {/* Replay */}
                    <button
                      onClick={handleRestart}
                      className="p-1 rounded-md hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                      title="Restart Video (0:00)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    {/* Timestamp */}
                    <span className="font-mono text-[11px] text-slate-200">
                      {formatSeconds(currentTime)} / {formatSeconds(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                      {[0.5, 1, 1.5, 2].map(spd => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-1.5 py-0.5 rounded transition-colors ${
                            playbackRate === spd ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                    {/* Mute */}
                    <button
                      onClick={handleToggleMute}
                      className="p-1 rounded-md hover:bg-white/20 text-slate-300 hover:text-white"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    {/* Fullscreen */}
                    <button
                      onClick={handleToggleFullscreen}
                      className="p-1 rounded-md hover:bg-white/20 text-slate-300 hover:text-white"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Camera Controls Overlay Bar when camera is active */}
            {activeMediaMode === 'live-camera' && isLiveCameraActive && (
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent z-30 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveActiveDefect}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isKm ? 'ថតកត់ត្រាពិការភាព' : 'Capture & Save Defect'}</span>
                  </button>
                  <button
                    onClick={toggleFacingMode}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    title="Flip camera"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>
                  {supportsTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isTorchOn ? 'bg-amber-500 text-white border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                      title="Toggle Torch"
                    >
                      <Flashlight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>LIVE TRACKING</span>
                  </span>
                  <button
                    onClick={stopLiveCamera}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Stop Cam
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>

        {/* Right Column (5 Cols): Detection Result & Video Problem Tracker */}
        <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.detectionResult}</span>
              </h4>
              <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                AI Detected ({(activeTrackedProblem?.confidence || 0.92) * 100}%)
              </span>
            </div>

            {/* Current Active Defect Snapshot Card */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                    currentSeverity === 'critical' ? 'bg-rose-600' :
                    currentType === 'manhole_hazard' ? 'bg-sky-600' : 'bg-amber-600'
                  }`}>
                    {currentType.replace('_', ' ')}
                  </span>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {isVideoMode && activeTrackedProblem 
                      ? (isKm ? activeTrackedProblem.kmTitle : activeTrackedProblem.title)
                      : (imagePresets[activeMediaMode as keyof typeof imagePresets]?.title || 'Pothole')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {isVideoMode && activeTrackedProblem ? activeTrackedProblem.timeFormatted : '00:15'}
                  </span>
                  <div className="text-[10px] text-slate-400 font-medium">{t.date}</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400">{t.depth}:</span>{' '}
                  <strong className="text-slate-800 font-mono">
                    {isVideoMode && activeTrackedProblem ? `${activeTrackedProblem.depthCm} cm` : '7.5 cm'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">{t.area}:</span>{' '}
                  <strong className="text-slate-800 font-mono">
                    {isVideoMode && activeTrackedProblem ? `${activeTrackedProblem.areaM2} m²` : '0.45 m²'}
                  </strong>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-slate-400">{t.location}:</span>{' '}
                  <strong className="text-slate-800 truncate">
                    {isVideoMode && activeTrackedProblem ? activeTrackedProblem.roadName : 'Monivong Corridor'}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                {isVideoMode && activeTrackedProblem 
                  ? (isKm ? activeTrackedProblem.kmDescription : activeTrackedProblem.description)
                  : 'Automated road inspection scanning.'}
              </p>
            </div>

            {/* AI Diagnosis Result */}
            {aiAnalysisResult && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1 text-blue-700 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Engineering Diagnosis:
                </div>
                {aiAnalysisResult}
              </div>
            )}

            {/* Tracked Problems List inside this Sample Video */}
            {isVideoMode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.trackedProblems} ({SAMPLE_VIDEO_TRACKED_PROBLEMS.length})</span>
                  </h5>
                  <span className="text-[10px] text-blue-600 font-semibold">{t.jumpToTime}</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                  {SAMPLE_VIDEO_TRACKED_PROBLEMS.map((prob) => {
                    const isSelected = activeTrackedProblem?.id === prob.id;
                    return (
                      <div
                        key={prob.id}
                        onClick={() => handleJumpToProblem(prob)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-400 shadow-2xs ring-1 ring-blue-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            prob.severity === 'critical' ? 'bg-rose-500' :
                            prob.type === 'manhole_hazard' ? 'bg-sky-500' : 'bg-amber-500'
                          }`} />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 text-[11px] truncate">
                              {isKm ? prob.kmTitle : prob.title}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span>{prob.roadName.split('(')[0]}</span>
                            </div>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-blue-700 shrink-0">
                          {prob.timeFormatted}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200/80 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Save Active Defect */}
              <button
                onClick={handleSaveActiveDefect}
                disabled={savedSuccess}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.saved}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{t.saveToDb}</span>
                  </>
                )}
              </button>

              {/* 1-Click Save All Tracked Problems from Video */}
              <button
                onClick={handleSaveAllTrackedProblems}
                disabled={savedAllSuccess}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  savedAllSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
                }`}
                title={`Save all ${SAMPLE_VIDEO_TRACKED_PROBLEMS.length} tracked road defects to database at once`}
              >
                {savedAllSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved {SAMPLE_VIDEO_TRACKED_PROBLEMS.length} Issues!</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isKm ? `រក្សាទុកទាំង ${SAMPLE_VIDEO_TRACKED_PROBLEMS.length}` : `Save All (${SAMPLE_VIDEO_TRACKED_PROBLEMS.length})`}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
