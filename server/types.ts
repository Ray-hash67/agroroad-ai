export type DamageCategory = 
  | 'Transverse crack'
  | 'Longitudinal crack'
  | 'Alligator crack'
  | 'Pothole'
  | 'Manhole hazard';

export type DamageCode = 'D00' | 'D10' | 'D20' | 'D40' | 'MH';

export type DefectSeverity = 'critical' | 'moderate' | 'minor';

export interface BoundingBoxPercent {
  x: number;      // 0 - 100%
  y: number;      // 0 - 100%
  width: number;  // 0 - 100%
  height: number; // 0 - 100%
}

export interface DetectionRecord {
  id: string;
  trackingId: string;
  category: DamageCategory;
  damageCode?: DamageCode;
  confidence: number;
  frameNumber: number;
  timestampSec: number;
  timeFormatted: string;
  bbox: BoundingBoxPercent;
  severity: DefectSeverity;
  depthCm: number;
  areaM2: number;
  notes?: string;
}

export interface UniqueDefect {
  trackingId: string;
  category: DamageCategory;
  damageCode?: DamageCode;
  severity: DefectSeverity;
  maxConfidence: number;
  firstSeenSec: number;
  lastSeenSec: number;
  firstSeenFormatted: string;
  lastSeenFormatted: string;
  totalFramesSeen: number;
  representativeBbox: BoundingBoxPercent;
  estimatedDepthCm: number;
  estimatedAreaM2: number;
  notes?: string;
}

export type JobStatus = 'uploaded' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface VideoJobStats {
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
  processingTimeMs: number;
}

export interface VideoJob {
  id: string;
  filename: string;
  originalPath: string;
  annotatedPath?: string;
  fileSizeBytes: number;
  durationSec: number;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  status: JobStatus;
  progress: number; // 0 - 100
  phase: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  modelUsed?: string;
  stats?: VideoJobStats;
  uniqueDefects?: UniqueDefect[];
  detections?: DetectionRecord[];
}

export interface ModelEngineStatus {
  configured: boolean;
  engine: 'gemini' | 'yolo_fastapi' | 'none';
  modelName: string;
  supportedCategories: string[];
  rddClasses?: { [code: string]: string };
  setupMessage?: string;
  yoloInferenceUrl?: string;
  hasGeminiKey: boolean;
  hasLocalWeights?: boolean;
  weightsPath?: string;
  weightsSizeBytes?: number;
  weightsSizeFormatted?: string;
  weightsSource?: string;
}
