import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  Layers, 
  Eye, 
  BarChart3, 
  RefreshCw, 
  ShieldAlert, 
  Sliders, 
  Check, 
  Maximize2, 
  FolderPlus,
  Video,
  Database
} from 'lucide-react';
import { DamageDetection, DamageType, DefectSeverity } from '../types/damage';
import { Language, translations } from '../i18n/translations';
import { RoadDefectLogo } from './RoadDefectLogo';

interface VideoJobResponse {
  id: string;
  filename: string;
  originalPath: string;
  annotatedPath?: string;
  fileSizeBytes: number;
  durationSec: number;
  fps: number;
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  phase: string;
  errorMessage?: string;
  createdAt: string;
  modelUsed?: string;
  stats?: {
    totalUniqueDefects: number;
    categoryCounts: {
      'Transverse crack': number;
      'Longitudinal crack': number;
      'Alligator crack': number;
      'Pothole': number;
      'Manhole hazard': number;
    };
    avgConfidence: number;
    totalFramesAnalyzed: number;
    videoDurationSec: number;
  };
  uniqueDefects?: Array<{
    trackingId: string;
    category: 'Transverse crack' | 'Longitudinal crack' | 'Alligator crack' | 'Pothole' | 'Manhole hazard';
    severity: DefectSeverity;
    maxConfidence: number;
    firstSeenSec: number;
    lastSeenSec: number;
    firstSeenFormatted: string;
    lastSeenFormatted: string;
    totalFramesSeen: number;
    representativeBbox: { x: number; y: number; width: number; height: number };
    estimatedDepthCm: number;
    estimatedAreaM2: number;
    notes?: string;
  }>;
  detections?: Array<{
    id: string;
    trackingId: string;
    category: 'Transverse crack' | 'Longitudinal crack' | 'Alligator crack' | 'Pothole' | 'Manhole hazard';
    confidence: number;
    frameNumber: number;
    timestampSec: number;
    timeFormatted: string;
    bbox: { x: number; y: number; width: number; height: number };
    severity: DefectSeverity;
    depthCm: number;
    areaM2: number;
    notes?: string;
  }>;
}

interface ModelStatusResponse {
  configured: boolean;
  engine: 'gemini' | 'yolo_fastapi' | 'none';
  modelName: string;
  supportedCategories: string[];
  setupMessage?: string;
  yoloInferenceUrl?: string;
  hasGeminiKey: boolean;
}

interface VideoProcessingDashboardProps {
  onSaveNewDetection?: (detection: DamageDetection) => void;
  language?: Language;
}

export const VideoProcessingDashboard: React.FC<VideoProcessingDashboardProps> = ({
  onSaveNewDetection,
  language = 'en'
}) => {
  const t = translations[language];
  const isKm = language === 'km';

  // Video File & Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewLocalUrl, setPreviewLocalUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active Job State
  const [currentJob, setCurrentJob] = useState<VideoJobResponse | null>(null);
  const [activeVideoView, setActiveVideoView] = useState<'annotated' | 'original' | 'split'>('annotated');
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [savedToDbCount, setSavedToDbCount] = useState<number>(0);

  // Video player playback controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const splitRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Load Model Status on Mount
  useEffect(() => {
    fetchModelStatus();
  }, []);

  const fetchModelStatus = async () => {
    try {
      const res = await fetch('/api/model/status');
      if (res.ok) {
        const data = await res.json();
        setModelStatus(data);
      }
    } catch (err) {
      console.warn('Could not fetch model status:', err);
    }
  };

  // Poll Job Status while processing
  useEffect(() => {
    if (!currentJob || currentJob.status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/jobs/${currentJob.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.job) {
            setCurrentJob(data.job);
            if (data.job.status === 'completed' || data.job.status === 'failed' || data.job.status === 'cancelled') {
              clearInterval(interval);
            }
          }
        }
      } catch (err) {
        console.error('Error polling job:', err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [currentJob?.id, currentJob?.status]);

  // Client-side File Validation
  const handleFileSelect = (file: File) => {
    setUploadError(null);
    const validExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));
    const isVideoMime = file.type.startsWith('video/') || file.type === 'application/octet-stream';

    if (!hasValidExt && !isVideoMime) {
      setUploadError('Invalid format. Please select an MP4, MOV, AVI, WEBM, or MKV road inspection video.');
      return;
    }

    // 250MB limit
    if (file.size > 250 * 1024 * 1024) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed video size is 250MB.`);
      return;
    }

    setSelectedFile(file);
    // Revoke previous preview if any
    if (previewLocalUrl) {
      URL.revokeObjectURL(previewLocalUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewLocalUrl(localUrl);
  };

  // Real Upload via XMLHttpRequest with streaming progress
  const handleUploadVideo = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append('video', selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/video/upload');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.job) {
            setCurrentJob(res.job);
            // Free local blob URL
            if (previewLocalUrl) {
              URL.revokeObjectURL(previewLocalUrl);
              setPreviewLocalUrl(null);
            }
          }
        } catch (err) {
          setUploadError('Invalid response from server.');
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          setUploadError(errRes.error || 'Upload failed.');
        } catch {
          setUploadError(`Upload failed with status code ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadError('Network error occurred during video upload.');
    };

    xhr.send(formData);
  };

  // Load Built-in Sample Patrol Video (1-click test)
  const handleLoadSampleVideo = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await fetch('/api/video/sample', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.job) {
          setCurrentJob(data.job);
          setSelectedFile(null);
          if (previewLocalUrl) {
            URL.revokeObjectURL(previewLocalUrl);
            setPreviewLocalUrl(null);
          }
        }
      } else {
        const err = await res.json();
        setUploadError(err.error || 'Failed to load sample video.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error registering sample video.');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger Asynchronous Processing
  const handleStartProcessing = async () => {
    if (!currentJob) return;

    // Check if model configured
    if (!modelStatus?.configured) {
      setShowSetupModal(true);
      return;
    }

    try {
      const res = await fetch(`/api/video/jobs/${currentJob.id}/process`, {
        method: 'POST'
      });
      if (res.ok) {
        setCurrentJob(prev => prev ? { ...prev, status: 'processing', progress: 5, phase: 'Initializing video frames...' } : null);
      } else {
        const err = await res.json();
        setUploadError(err.error || 'Failed to start processing job.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error starting processing.');
    }
  };

  // Cancel Job
  const handleCancelProcessing = async () => {
    if (!currentJob) return;
    try {
      await fetch(`/api/video/jobs/${currentJob.id}/cancel`, { method: 'POST' });
      setCurrentJob(prev => prev ? { ...prev, status: 'cancelled', phase: 'Processing cancelled' } : null);
    } catch (err) {
      console.error('Error cancelling:', err);
    }
  };

  // Retry Job
  const handleRetryProcessing = async () => {
    if (!currentJob) return;
    try {
      const res = await fetch(`/api/video/jobs/${currentJob.id}/retry`, { method: 'POST' });
      if (res.ok) {
        setCurrentJob(prev => prev ? { ...prev, status: 'processing', progress: 5, phase: 'Retrying pipeline...' } : null);
      }
    } catch (err) {
      console.error('Error retrying:', err);
    }
  };

  // Seek Video to specific timestamp
  const handleSeekToTimestamp = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play();
      setIsPlaying(true);
    }
    if (splitRef.current) {
      splitRef.current.currentTime = sec;
      splitRef.current.play();
    }
  };

  // Synchronize All Unique Defect Detections into Main App Database
  const handleSyncToMainApp = () => {
    if (!currentJob?.uniqueDefects || !onSaveNewDetection) return;
    let count = 0;

    currentJob.uniqueDefects.forEach((d, idx) => {
      // Map category to DamageType
      let mappedType: DamageType = 'pothole';
      if (d.category === 'Transverse crack') mappedType = 'transverse_crack';
      else if (d.category === 'Longitudinal crack') mappedType = 'longitudinal_crack';
      else if (d.category === 'Alligator crack') mappedType = 'alligator_crack';
      else if (d.category === 'Manhole hazard') mappedType = 'manhole_hazard';

      const newDet: DamageDetection = {
        id: `vid-${currentJob.id}-${d.trackingId}`,
        type: mappedType,
        title: `${d.category} [${d.trackingId}]`,
        confidence: d.maxConfidence,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` ${d.firstSeenFormatted}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.firstSeenFormatted,
        coordinates: {
          lat: Number((11.5650 + (idx * 0.0018)).toFixed(5)),
          lng: Number((104.9150 + (idx * 0.0015)).toFixed(5))
        },
        locationName: 'Survey Corridor Patrol',
        roadName: `Monivong Blvd Segment (Video ${d.firstSeenFormatted})`,
        severity: d.severity,
        depthCm: d.estimatedDepthCm,
        areaM2: d.estimatedAreaM2,
        image: '/src/assets/images/road_dashcam_view.jpg',
        cropImage: mappedType === 'manhole_hazard'
          ? '/assets/aistudio/image_7eff1d52.png'
          : mappedType === 'alligator_crack'
          ? '/assets/aistudio/image_c0099d7b.png'
          : mappedType === 'pothole'
          ? '/assets/aistudio/image_646ff71d.png'
          : '/src/assets/images/road_crack_surface.jpg',
        boundingBoxes: [
          {
            x: d.representativeBbox.x,
            y: d.representativeBbox.y,
            width: d.representativeBbox.width,
            height: d.representativeBbox.height,
            label: `${d.category} ${(d.maxConfidence * 100).toFixed(0)}% [${d.trackingId}]`,
            confidence: d.maxConfidence
          }
        ],
        status: 'detected',
        notes: d.notes || `Detected via Video Pipeline at ${d.firstSeenFormatted} (Tracked across ${d.totalFramesSeen} frames).`
      };

      onSaveNewDetection(newDet);
      count++;
    });

    setSavedToDbCount(count);
  };

  // Filtered detections
  const filteredDetections = (currentJob?.detections || []).filter(det => {
    if (selectedCategoryFilter === 'all') return true;
    return det.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6">


      {/* Model Setup Alert Warning if not configured */}
      {modelStatus && !modelStatus.configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-amber-950 mb-0.5">Road Damage AI Model Engine Notice</h4>
            <p className="text-amber-800 leading-relaxed mb-2">
              {modelStatus.setupMessage || 'No inference model or API key is currently detected. To perform real object detection on frames, configure GEMINI_API_KEY or launch the Python YOLO FastAPI inference server.'}
            </p>
            <button
              onClick={() => setShowSetupModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>View Quick Setup Guide</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Upload & Dropzone Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>{isKm ? 'ផ្ទុកឡើងវីដេអូផ្លូវថ្មី' : '1. Upload Road Video'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports MP4, MOV, AVI, WEBM, MKV (Max 250MB). Files stream directly to server storage without filling RAM.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!currentJob && (
              <button
                onClick={handleLoadSampleVideo}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5 transition-all shadow-2xs"
                title="Load sample Phnom Penh patrol video"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{isKm ? 'ផ្ទុកវីដេអូគំរូ Patrol' : 'Load Sample Patrol Video'}</span>
              </button>
            )}
            {currentJob && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                currentJob.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : currentJob.status === 'processing'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                  : currentJob.status === 'failed'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  currentJob.status === 'completed' ? 'bg-emerald-500' : currentJob.status === 'processing' ? 'bg-blue-500' : 'bg-slate-400'
                }`} />
                <span>Status: {currentJob.status}</span>
              </span>
            )}
          </div>
        </div>

        {/* Drag and Drop Box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-blue-500 bg-blue-50/40'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,.mp4,.mov,.avi,.webm,.mkv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'video'}
                </p>
                <p className="text-xs text-blue-600 font-semibold pt-1">Click to select a different video</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {isKm ? 'អូសទម្លាក់វីដេអូ ឬចុចដើម្បីជ្រើសរើស' : 'Drag and drop your road inspection video here, or browse'}
                </p>
                <p className="text-xs text-slate-400">MP4, MOV, AVI, WEBM, MKV up to 250MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Error Display */}
        {uploadError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Uploading video to server...</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {selectedFile && !currentJob && (
            <button
              onClick={handleUploadVideo}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isKm ? 'ផ្ទុកឡើងវីដេអូទៅកាន់ម៉ាស៊ីនបម្រើ' : 'Upload Video to Server'}</span>
            </button>
          )}

          {currentJob && currentJob.status !== 'processing' && currentJob.status !== 'completed' && (
            <button
              onClick={handleStartProcessing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/30 transition-all active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isKm ? 'ដំណើរការវិភាគ AI និងតាមដានពិការភាព' : 'Process Video (Run AI & Tracking)'}</span>
            </button>
          )}

          {currentJob && currentJob.status === 'processing' && (
            <button
              onClick={handleCancelProcessing}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <X className="w-4 h-4" />
              <span>{isKm ? 'បោះបង់ការដំណើរការ' : 'Cancel Processing'}</span>
            </button>
          )}

          {currentJob && (currentJob.status === 'failed' || currentJob.status === 'cancelled') && (
            <button
              onClick={handleRetryProcessing}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isKm ? 'ព្យាយាមដំណើរការឡើងវិញ' : 'Retry Processing'}</span>
            </button>
          )}

          {currentJob && (
            <button
              onClick={() => {
                setCurrentJob(null);
                setSelectedFile(null);
                if (previewLocalUrl) {
                  URL.revokeObjectURL(previewLocalUrl);
                  setPreviewLocalUrl(null);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isKm ? 'សម្អាត / វីដេអូថ្មី' : 'Reset / New Video'}</span>
            </button>
          )}
        </div>

        {/* Processing Stepper Status Bar */}
        {currentJob && (currentJob.status === 'processing' || currentJob.status === 'completed') && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                {currentJob.status === 'processing' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                {currentJob.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span>{currentJob.phase}</span>
              </span>
              <span className="font-mono font-bold text-blue-600">{currentJob.progress}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  currentJob.status === 'completed' 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500'
                }`}
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Video View & Defect Inspection Workspace (When Job Exists) */}
      {currentJob && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Video Player & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              {/* Top View Selector Bar */}
              <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveVideoView('annotated')}
                    disabled={!currentJob.annotatedPath}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeVideoView === 'annotated'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
                    }`}
                  >
                    Annotated (AI BBoxes)
                  </button>
                  <button
                    onClick={() => setActiveVideoView('original')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeVideoView === 'original'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Original Video
                  </button>
                  <button
                    onClick={() => setActiveVideoView('split')}
                    disabled={!currentJob.annotatedPath}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeVideoView === 'split'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {currentJob.filename} • {currentJob.durationSec}s
                </span>
              </div>

              {/* Video Player Display */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {activeVideoView === 'split' ? (
                  <div className="w-full h-full grid grid-cols-2 gap-0.5">
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        src={`/api/video/media/${currentJob.id}/original`}
                        className="w-full h-full object-contain"
                        controls
                        onTimeUpdate={() => {
                          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Raw Video
                      </div>
                    </div>
                    <div className="relative w-full h-full">
                      <video
                        ref={splitRef}
                        src={`/api/video/media/${currentJob.id}/annotated`}
                        className="w-full h-full object-contain"
                        controls
                      />
                      <div className="absolute top-2 left-2 bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Annotated AI
                      </div>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={
                      activeVideoView === 'annotated' && currentJob.annotatedPath
                        ? `/api/video/media/${currentJob.id}/annotated`
                        : `/api/video/media/${currentJob.id}/original`
                    }
                    className="w-full h-full object-contain"
                    controls
                    onTimeUpdate={() => {
                      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                )}
              </div>

              {/* Video Action Footer */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">
                    Time: {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                    {Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
                    {Math.floor(currentJob.durationSec / 60).toString().padStart(2, '0')}:
                    {Math.floor(currentJob.durationSec % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentJob.annotatedPath && (
                    <a
                      href={`/api/video/media/${currentJob.id}/annotated`}
                      download={`annotated_${currentJob.filename}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download Annotated Video</span>
                    </a>
                  )}
                  {currentJob.status === 'completed' && (
                    <a
                      href={`/api/video/jobs/${currentJob.id}/report/csv`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export CSV Report</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sync to App Global State Banner */}
            {currentJob.status === 'completed' && currentJob.uniqueDefects && currentJob.uniqueDefects.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-sm text-blue-950">Add Detections to Pavement Database</h4>
                  <p className="text-xs text-blue-700">
                    Sync {currentJob.uniqueDefects.length} unique tracked defects to your Satellite Map and Work Orders.
                  </p>
                </div>
                {savedToDbCount > 0 ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Synced {savedToDbCount} defects</span>
                  </span>
                ) : (
                  <button
                    onClick={handleSyncToMainApp}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Database className="w-4 h-4" />
                    <span>Sync to System Database</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: AI Analytics & Defect Classification Breakdown (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Defect Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Detection & Tracking Metrics</span>
                </h3>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {currentJob.stats?.totalFramesAnalyzed || 0} Frames Analyzed
                </span>
              </div>

              {/* Big Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Unique Defects</p>
                  <p className="text-2xl font-black text-blue-950 mt-0.5">
                    {currentJob.stats?.totalUniqueDefects || 0}
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Tracked across video timeline</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Avg Confidence</p>
                  <p className="text-2xl font-black text-emerald-950 mt-0.5">
                    {((currentJob.stats?.avgConfidence || 0) * 100).toFixed(0)}%
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">YOLO/Gemini model consensus</p>
                </div>
              </div>

              {/* 5 Distress Category Cards */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Damage Categories (5 Standard Classes)
                </p>

                {/* 1. Transverse Crack */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-2xs" />
                    <span className="text-xs font-bold text-slate-800">1. Transverse Crack</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded">
                    {currentJob.stats?.categoryCounts['Transverse crack'] || 0}
                  </span>
                </div>

                {/* 2. Longitudinal Crack */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-2xs" />
                    <span className="text-xs font-bold text-slate-800">2. Longitudinal Crack</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                    {currentJob.stats?.categoryCounts['Longitudinal crack'] || 0}
                  </span>
                </div>

                {/* 3. Alligator Crack */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-2xs" />
                    <span className="text-xs font-bold text-slate-800">3. Alligator Crack</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {currentJob.stats?.categoryCounts['Alligator crack'] || 0}
                  </span>
                </div>

                {/* 4. Pothole */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-2xs" />
                    <span className="text-xs font-bold text-slate-800">4. Pothole</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-rose-100 text-rose-900 px-2 py-0.5 rounded">
                    {currentJob.stats?.categoryCounts['Pothole'] || 0}
                  </span>
                </div>

                {/* 5. Manhole Hazard */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shadow-2xs" />
                    <span className="text-xs font-bold text-slate-800">5. Manhole Hazard</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                    {currentJob.stats?.categoryCounts['Manhole hazard'] || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Detections Timeline List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Individual Detections ({filteredDetections.length})</span>
                </h3>

                {/* Category Filter Dropdown */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Categories</option>
                  <option value="Pothole">Potholes</option>
                  <option value="Transverse crack">Transverse crack</option>
                  <option value="Longitudinal crack">Longitudinal crack</option>
                  <option value="Alligator crack">Alligator crack</option>
                  <option value="Manhole hazard">Manhole hazard</option>
                </select>
              </div>

              {/* Detections Scrollable Table */}
              <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                {filteredDetections.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    {currentJob.status === 'processing' 
                      ? 'Analyzing frames, detections will appear here...'
                      : 'No detections matching current filter.'}
                  </div>
                ) : (
                  filteredDetections.map((det) => (
                    <div
                      key={det.id}
                      onClick={() => handleSeekToTimestamp(det.timestampSec)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded text-[10px]">
                            {det.trackingId}
                          </span>
                          <span className="font-bold text-slate-900">{det.category}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            det.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {det.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Frame #{det.frameNumber} • {det.timeFormatted} ({(det.confidence * 100).toFixed(0)}% conf)
                        </p>
                      </div>

                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Seek</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Setup Instructions Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Road Damage AI Model Setup</h3>
                  <p className="text-xs text-slate-500">How to configure real road pavement distress detection</p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              {/* Option 1: Gemini Vision */}
              <div className="border border-blue-200 rounded-2xl p-4 bg-blue-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Option 1: Google Gemini 3.8 Flash Vision (Built-in)</span>
                  </h4>
                  {modelStatus?.hasGeminiKey ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      Requires Key
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">
                  The server natively integrates Google's latest multimodal vision engine to inspect video frames, detect defect boundaries, compute depth/area estimations, and classify the 5 standard categories.
                </p>
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px]">
                  export GEMINI_API_KEY="your-api-key"
                </div>
              </div>

              {/* Option 2: Python YOLO FastAPI */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-700" />
                    <span>Option 2: Standalone Python YOLO FastAPI Service</span>
                  </h4>
                  {modelStatus?.engine === 'yolo_fastapi' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      Standby
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">
                  Run an offline Ultralytics YOLOv8/YOLOv11 model trained on the Road Damage Dataset (RDD2022) using the provided Python service in <code>inference_service/app.py</code>:
                </p>
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px] space-y-1">
                  <div>cd inference_service</div>
                  <div>pip install fastapi uvicorn ultralytics opencv-python pillow</div>
                  <div>python app.py</div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Then configure <code>YOLO_INFERENCE_URL="http://localhost:8000/predict"</code>.
                </p>
              </div>

              {/* Supported Classes */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Supported 5 Categories:</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg">1. Transverse crack</div>
                  <div className="p-2 bg-slate-50 rounded-lg">2. Longitudinal crack</div>
                  <div className="p-2 bg-slate-50 rounded-lg">3. Alligator crack</div>
                  <div className="p-2 bg-slate-50 rounded-lg">4. Pothole</div>
                  <div className="p-2 bg-slate-50 rounded-lg col-span-2">5. Manhole hazard</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
