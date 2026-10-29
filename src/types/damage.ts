export type DamageType = 
  | 'pothole' 
  | 'crack' 
  | 'longitudinal_crack' 
  | 'transverse_crack' 
  | 'alligator_crack' 
  | 'manhole_hazard'
  | 'rutting' 
  | 'other';

export type DefectSeverity = 'critical' | 'moderate' | 'minor';

export type DefectStatus = 'detected' | 'inspected' | 'scheduled' | 'repaired';

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  confidence: number;
}

export interface DamageDetection {
  id: string;
  type: DamageType;
  title: string;
  confidence: number;
  timestamp: string;
  date: string;
  time: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  locationName: string;
  roadName: string;
  severity: DefectSeverity;
  image: string;
  cropImage?: string;
  boundingBoxes: BoundingBox[];
  status: DefectStatus;
  depthCm?: number;
  areaM2?: number;
  notes?: string;
}

export type ActiveTab = 'dashboard' | 'detection' | 'upload' | 'map' | 'reports' | 'data' | 'settings';
