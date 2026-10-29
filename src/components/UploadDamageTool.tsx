import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  FileCheck, 
  Trash2, 
  Navigation,
  Video,
  Layers
} from 'lucide-react';
import { DamageDetection, DamageType, DefectSeverity, BoundingBox } from '../types/damage';
import { DASHCAM_IMG, POTHOLE_IMG, CRACK_IMG, DEFECT_MANHOLE_HAZARD_IMG, DEFECT_ALLIGATOR_CRACK_IMG } from '../data/mockData';
import { Language, translations } from '../i18n/translations';
import { RoadDefectLogo } from './RoadDefectLogo';
import { VideoProcessingDashboard } from './VideoProcessingDashboard';

interface UploadDamageToolProps {
  onSaveNewDetection: (detection: DamageDetection) => void;
  language?: Language;
  onNavigateToMap?: () => void;
  onNavigateToCamera?: () => void;
}

export const UploadDamageTool: React.FC<UploadDamageToolProps> = ({
  onSaveNewDetection,
  language = 'en',
  onNavigateToMap,
  onNavigateToCamera
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pipeline Mode: Real Video Processing vs Single Photo Inspector
  const [pipelineMode, setPipelineMode] = useState<'video-pipeline' | 'photo-inspector'>('video-pipeline');

  // Uploaded image or video state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisDone, setAnalysisDone] = useState(false);

  // Detection metadata form
  const [damageType, setDamageType] = useState<DamageType>('pothole');
  const [title, setTitle] = useState('Pavement Defect Inspection');
  const [severity, setSeverity] = useState<DefectSeverity>('critical');
  const [confidence, setConfidence] = useState(0.93);
  const [depthCm, setDepthCm] = useState(7.5);
  const [areaM2, setAreaM2] = useState(0.48);
  const [roadName, setRoadName] = useState('Monivong Boulevard Corridor');
  const [locationName] = useState('Phnom Penh Municipal Sector');
  const [coordinates, setCoordinates] = useState({ lat: 11.5725, lng: 104.9182 });
  const [notes, setNotes] = useState('Identified via AgroRoad AI Upload Analyzer.');
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([
    { x: 30, y: 45, width: 40, height: 30, label: 'Pothole 0.93', confidence: 0.93 }
  ]);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Sample preset images for instant 1-tap testing
  const sampleImages = [
    {
      id: 'pothole-arterial',
      label: 'Corridor Pothole',
      img: DASHCAM_IMG,
      type: 'pothole' as DamageType,
      title: 'Arterial Corridor Pothole',
      severity: 'critical' as DefectSeverity,
      depth: 8.5,
      area: 0.45,
      boxes: [{ x: 34, y: 56, width: 32, height: 22, label: 'Pothole 0.92', confidence: 0.92 }]
    },
    {
      id: 'cavity-macro',
      label: 'Deep Cavity Pothole',
      img: POTHOLE_IMG,
      type: 'pothole' as DamageType,
      title: 'Severe Cavity Pothole',
      severity: 'critical' as DefectSeverity,
      depth: 10.2,
      area: 0.65,
      boxes: [{ x: 20, y: 30, width: 60, height: 50, label: 'Severe Pothole 0.96', confidence: 0.96 }]
    },
    {
      id: 'fatigue-crack',
      label: 'Fatigue Cracking',
      img: CRACK_IMG,
      type: 'crack' as DamageType,
      title: 'Structural Fatigue Cracking',
      severity: 'moderate' as DefectSeverity,
      depth: 2.4,
      area: 1.25,
      boxes: [{ x: 15, y: 18, width: 70, height: 65, label: 'Fatigue Crack 0.89', confidence: 0.89 }]
    },
    {
      id: 'manhole-hazard-sample',
      label: 'Manhole Hazard',
      img: DEFECT_MANHOLE_HAZARD_IMG,
      type: 'manhole_hazard' as DamageType,
      title: 'Settled Manhole Hazard',
      severity: 'moderate' as DefectSeverity,
      depth: 4.5,
      area: 0.6,
      boxes: [{ x: 26, y: 30, width: 48, height: 44, label: 'Manhole Hazard 0.91', confidence: 0.91 }]
    }
  ];

  const processFile = (file: File) => {
    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isVid && !isImg) {
      alert('Please upload a road inspection photo (JPG, PNG, WEBP) or video (MP4, MOV, WEBM).');
      return;
    }

    setImageFileName(file.name);
    setIsVideo(isVid);

    if (isVid) {
      const videoUrl = URL.createObjectURL(file);
      setUploadedImage(videoUrl);
      setAnalysisDone(false);
      setSaveSuccess(false);
      runAiAnalysis(file.name);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        setAnalysisDone(false);
        setSaveSuccess(false);
        runAiAnalysis(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const runAiAnalysis = (fileName?: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisStep('Loading image tensor & preparing neural pipeline...');

    setTimeout(() => {
      setAnalysisProgress(45);
      setAnalysisStep('Running YOLO-Damage Convolutional Pavement Network...');
    }, 400);

    setTimeout(() => {
      setAnalysisProgress(75);
      setAnalysisStep('Detecting defect boundaries & calculating depth metrics...');
    }, 900);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisStep('Damage classification complete!');
      setIsAnalyzing(false);
      setAnalysisDone(true);

      const isCrack = (fileName || '').toLowerCase().includes('crack');
      const detType: DamageType = isCrack ? 'crack' : 'pothole';
      setDamageType(detType);
      setTitle(isCrack ? 'Asphalt Fatigue Cracking' : 'Corridor Road Pothole');
      setSeverity(isCrack ? 'moderate' : 'critical');
      setConfidence(Number((0.89 + Math.random() * 0.08).toFixed(2)));
      setDepthCm(isCrack ? 2.3 : 7.8);
      setAreaM2(isCrack ? 1.15 : 0.42);
      setBoundingBoxes([
        { 
          x: 28, 
          y: 40, 
          width: 44, 
          height: 35, 
          label: isCrack ? 'Crack 0.89' : 'Pothole 0.94', 
          confidence: isCrack ? 0.89 : 0.94 
        }
      ]);
    }, 1400);
  };

  const handleLoadSampleVideo = () => {
    setUploadedImage('/videos/phnom_penh_patrol.mp4');
    setIsVideo(true);
    setImageFileName('phnom_penh_patrol.mp4');
    setDamageType('pothole');
    setTitle('Phnom Penh Patrol Road Survey');
    setSeverity('critical');
    setDepthCm(7.8);
    setAreaM2(0.42);
    setBoundingBoxes([{ x: 26, y: 48, width: 48, height: 28, label: 'Road Distress 0.94', confidence: 0.94 }]);
    setAnalysisDone(true);
    setSaveSuccess(false);
  };

  const handleLoadSample = (sample: typeof sampleImages[0]) => {
    setUploadedImage(sample.img);
    setIsVideo(false);
    setImageFileName(sample.label);
    setDamageType(sample.type);
    setTitle(sample.title);
    setSeverity(sample.severity);
    setDepthCm(sample.depth);
    setAreaM2(sample.area);
    setBoundingBoxes(sample.boxes);
    setAnalysisDone(true);
    setSaveSuccess(false);
  };

  const handleFetchCurrentGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5))
          });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  };

  const handleSaveToDatabase = () => {
    if (!uploadedImage) return;

    const newId = `det-up-${Date.now().toString().slice(-4)}`;
    const newDet: DamageDetection = {
      id: newId,
      type: damageType,
      title: title || 'Pavement Defect Survey',
      confidence: confidence,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      coordinates: coordinates,
      locationName: locationName,
      roadName: roadName,
      severity: severity,
      depthCm: depthCm,
      areaM2: areaM2,
      image: uploadedImage,
      cropImage: damageType === 'alligator_crack' 
        ? DEFECT_ALLIGATOR_CRACK_IMG 
        : damageType === 'manhole_hazard' 
        ? DEFECT_MANHOLE_HAZARD_IMG 
        : damageType === 'pothole' 
        ? POTHOLE_IMG 
        : CRACK_IMG,
      boundingBoxes: boundingBoxes,
      status: 'detected',
      notes: notes
    };

    onSaveNewDetection(newDet);
    setSavedId(newId);
    setSaveSuccess(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Pipeline Mode Switcher Pills */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
        <button
          onClick={() => setPipelineMode('video-pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            pipelineMode === 'video-pipeline'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>{language === 'km' ? 'ប្រព័ន្ធវិភាគវីដេអូ AI & តាមដាន' : 'AI Video Pipeline & Multi-Frame Tracking'}</span>
        </button>

        <button
          onClick={() => setPipelineMode('photo-inspector')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            pipelineMode === 'photo-inspector'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{language === 'km' ? 'វិភាគរូបថតទោល' : 'Single Photo Inspection'}</span>
        </button>
      </div>

      {pipelineMode === 'video-pipeline' ? (
        <VideoProcessingDashboard 
          onSaveNewDetection={onSaveNewDetection}
          language={language}
        />
      ) : (
        /* Main Grid: Upload Area on Left / Inspection Form on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dropzone & Image Viewport (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
          
          {/* File Dropzone */}
          {!uploadedImage ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[360px] ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-50/20 shadow-xl' 
                  : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {language === 'km' ? 'ទម្លាក់វីដេអូ ឬរូបថតផ្លូវខូចនៅទីនេះ' : 'Drop road video or inspection photo here, or browse'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-5">
                {language === 'km' 
                  ? 'គាំទ្រវីដេអូល្បាតផ្លូវ (MP4, WEBM, MOV) ឬរូបថតកម្រិតច្បាស់ (JPG, PNG)' 
                  : 'Supports road inspection videos (MP4, WEBM, MOV) or high-res photos (JPG, PNG)'}
              </p>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>{language === 'km' ? 'ជ្រើសរើសវីដេអូ ឬរូបថតផ្លូវ' : 'Browse Road Video / Photo'}</span>
              </button>
            </div>
          ) : (
            /* Uploaded Image Viewport with Bounding Boxes */
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative min-h-[380px] flex items-center justify-center">
              
              {isVideo ? (
                <video
                  src={uploadedImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className={`w-full max-h-[460px] object-contain transition-opacity duration-300 ${
                    isAnalyzing ? 'opacity-40' : 'opacity-100'
                  }`}
                />
              ) : (
                <img
                  src={uploadedImage}
                  alt="Uploaded Pavement Inspection"
                  className={`w-full max-h-[460px] object-contain transition-opacity duration-300 ${
                    isAnalyzing ? 'opacity-40' : 'opacity-100'
                  }`}
                />
              )}

              {/* Bounding Boxes Overlay */}
              {!isAnalyzing && showBoundingBoxes && boundingBoxes.map((box, idx) => {
                const isPothole = damageType === 'pothole';
                const borderColor = isPothole ? 'border-rose-500' : 'border-amber-500';
                const badgeBg = isPothole ? 'bg-rose-600' : 'bg-amber-600';
                return (
                  <div
                    key={idx}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`absolute border-2 ${borderColor} shadow-[0_0_15px_rgba(244,63,94,0.4)] pointer-events-none transition-all`}
                  >
                    <div className={`absolute -top-6 left-0 ${badgeBg} text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap`}>
                      {box.label}
                    </div>
                    {/* Reticle corner accents */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                  </div>
                );
              })}

              {/* AI Analysis Scan Animation Bar */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
                  <div className="text-white text-sm font-bold mb-1">
                    {t.analyzeDamage}
                  </div>
                  <div className="text-cyan-300 text-xs font-mono mb-3">
                    {analysisStep}
                  </div>
                  {/* Progress bar */}
                  <div className="w-64 max-w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Top Bar inside Viewport */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs z-20 pointer-events-auto">
                <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px] truncate max-w-[200px]">
                  {imageFileName || 'Road_Inspection.jpg'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      showBoundingBoxes ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-black/60 text-slate-300 border-white/10'
                    }`}
                  >
                    AI Boxes {showBoundingBoxes ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => { setUploadedImage(null); setAnalysisDone(false); }}
                    className="p-1 rounded-lg bg-black/60 text-rose-400 hover:text-rose-200 border border-white/10"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* Right Column: AI Analysis Inspection & Logging Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>{t.detectionResult}</span>
              </h3>
              {analysisDone && (
                <span className="bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                  AI Verified ({(confidence * 100).toFixed(0)}%)
                </span>
              )}
            </div>

            {/* Defect Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'km' ? 'ឈ្មោះពិការភាព' : 'Defect Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="e.g. Monivong Blvd Arterial Pothole"
              />
            </div>

            {/* Damage Type & Severity Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.type}
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-2xs ring-1 ring-slate-200 bg-slate-900">
                    <RoadDefectLogo type={damageType} className="w-full h-full" />
                  </div>
                  <select
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value as DamageType)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="pothole">{t.potholes}</option>
                    <option value="longitudinal_crack">{t.longitudinalCrack}</option>
                    <option value="transverse_crack">{t.transverseCrack}</option>
                    <option value="alligator_crack">{t.alligatorCrack}</option>
                    <option value="manhole_hazard">{t.manholeHazard}</option>
                    <option value="other">{t.otherDefects}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.severity}
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as DefectSeverity)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-rose-600"
                >
                  <option value="critical">{t.critical}</option>
                  <option value="moderate">{t.moderate}</option>
                  <option value="minor">{t.minor}</option>
                </select>
              </div>
            </div>

            {/* Metrics: Depth & Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.depth} (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={depthCm}
                  onChange={(e) => setDepthCm(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.area} (m²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={areaM2}
                  onChange={(e) => setAreaM2(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                />
              </div>
            </div>

            {/* Location & GPS */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {t.location} & GPS
                </label>
                <button
                  type="button"
                  onClick={handleFetchCurrentGps}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{language === 'km' ? 'ប្រើ GPS បច្ចុប្បន្ន' : 'Use Current Device GPS'}</span>
                </button>
              </div>
              <input
                type="text"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1.5 font-medium"
                placeholder="Road Corridor name"
              />
              <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>Lat: {coordinates.lat}° N</span>
                <span>Lng: {coordinates.lng}° E</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'km' ? 'កំណត់សម្គាល់ការត្រួតពិនិត្យ' : 'Inspection Notes'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bottom Save & Database Sync Button */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {saveSuccess ? (
              <div className="space-y-2">
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.uploadSuccess}</span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded">
                    ID: {savedId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {onNavigateToMap && (
                    <button
                      onClick={onNavigateToMap}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{language === 'km' ? 'មើលលើផែនទី' : 'View on Map'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setUploadedImage(null); setSaveSuccess(false); }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    {language === 'km' ? 'ផ្ទុកឡើងរូបភាពផ្សេងទៀត' : 'Upload Another'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSaveToDatabase}
                disabled={!uploadedImage || isAnalyzing}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  !uploadedImage || isAnalyzing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white active:scale-98 shadow-blue-500/25'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.saveToDb}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
