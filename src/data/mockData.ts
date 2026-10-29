import { DamageDetection, DamageType } from '../types/damage';

import appLogoImg from '../assets/images/road_damage_shield_logo.jpg';
import defectTransverseCrackImg from '../assets/images/defect_transverse_crack.jpg';
import defectLongitudinalCrackImg from '../assets/images/defect_longitudinal_crack.jpg';
import defectAlligatorCrackImg from '../assets/images/defect_alligator_crack.jpg';
import defectPotholeImg from '../assets/images/defect_pothole.jpg';
import defectManholeHazardImg from '../assets/images/defect_manhole_hazard.jpg';
import dashcamImg from '../assets/images/road_dashcam_view.jpg';
import crackImg from '../assets/images/road_crack_surface.jpg';

export const POTHOLE_IMG = defectPotholeImg;
export const DASHCAM_IMG = dashcamImg;
export const CRACK_IMG = crackImg;
export const APP_LOGO_IMG = appLogoImg;
export const DEFECT_TRANSVERSE_CRACK_IMG = defectTransverseCrackImg;
export const DEFECT_ALLIGATOR_CRACK_IMG = defectAlligatorCrackImg;
export const DEFECT_LONGITUDINAL_CRACK_IMG = defectLongitudinalCrackImg;
export const DEFECT_POTHOLE_IMG = defectPotholeImg;
export const DEFECT_MANHOLE_HAZARD_IMG = defectManholeHazardImg;

// 24 Detailed Manhole Hazard Problems with complete engineering inspection metadata
export const MANHOLE_HAZARDS_24_PROBLEMS: DamageDetection[] = [
  {
    id: 'det-mh-01',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Sunken Frame Depression',
    confidence: 0.94,
    timestamp: 'Oct 14, 2026 11:20 AM',
    date: 'Oct 14, 2026',
    time: '11:20 AM',
    coordinates: { lat: 11.5725, lng: 104.9182 },
    locationName: 'Daun Penh District',
    roadName: 'Preah Norodom Blvd (Near Wat Koh)',
    severity: 'critical',
    depthCm: 5.8,
    areaM2: 0.75,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 26, y: 30, width: 48, height: 45, label: 'Manhole Hazard 0.94', confidence: 0.94 }
    ],
    status: 'detected',
    notes: 'Problem #1: Cast iron rim sunken 5.8cm below wearing course, creating severe vertical shock for fast-moving motorcycles and sedans.'
  },
  {
    id: 'det-mh-02',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Fractured Cast-Iron Cover',
    confidence: 0.96,
    timestamp: 'Oct 14, 2026 10:45 AM',
    date: 'Oct 14, 2026',
    time: '10:45 AM',
    coordinates: { lat: 11.5695, lng: 104.9210 },
    locationName: 'Prampir Makara',
    roadName: 'Preah Monivong Blvd',
    severity: 'critical',
    depthCm: 6.2,
    areaM2: 0.65,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 24, y: 28, width: 52, height: 48, label: 'Manhole Hazard 0.96', confidence: 0.96 }
    ],
    status: 'inspected',
    notes: 'Problem #2: Heavy axle load caused structural fracture across center quadrant. High collapse risk under heavy bus traffic.'
  },
  {
    id: 'det-mh-03',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Protruding Rim Lip',
    confidence: 0.89,
    timestamp: 'Oct 14, 2026 09:30 AM',
    date: 'Oct 14, 2026',
    time: '09:30 AM',
    coordinates: { lat: 11.5741, lng: 104.9203 },
    locationName: 'Phnom Penh Center',
    roadName: 'Russian Federation Blvd',
    severity: 'critical',
    depthCm: 4.5,
    areaM2: 0.55,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 28, y: 32, width: 46, height: 42, label: 'Manhole Hazard 0.89', confidence: 0.89 }
    ],
    status: 'detected',
    notes: 'Problem #3: Surrounding pavement rutted away, leaving circular steel flange standing 4.5cm above road grade.'
  },
  {
    id: 'det-mh-04',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Rocking Loose Lid',
    confidence: 0.91,
    timestamp: 'Oct 14, 2026 08:15 AM',
    date: 'Oct 14, 2026',
    time: '08:15 AM',
    coordinates: { lat: 11.5654, lng: 104.9242 },
    locationName: 'Chamkar Mon',
    roadName: 'Preah Sihanouk Blvd',
    severity: 'moderate',
    depthCm: 3.2,
    areaM2: 0.50,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 30, y: 35, width: 44, height: 40, label: 'Manhole Hazard 0.91', confidence: 0.91 }
    ],
    status: 'scheduled',
    notes: 'Problem #4: Unseated seating ring causes severe rocking motion and noise whenever vehicular tires strike.'
  },
  {
    id: 'det-mh-05',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Severe Collar Fatigue Cracks',
    confidence: 0.88,
    timestamp: 'Oct 13, 2026 04:50 PM',
    date: 'Oct 13, 2026',
    time: '04:50 PM',
    coordinates: { lat: 11.5702, lng: 104.9163 },
    locationName: 'Prampir Makara',
    roadName: 'Charles de Gaulle Blvd',
    severity: 'moderate',
    depthCm: 2.8,
    areaM2: 1.40,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 20, y: 22, width: 60, height: 56, label: 'Manhole Hazard 0.88', confidence: 0.88 }
    ],
    status: 'inspected',
    notes: 'Problem #5: Circular concentric shear cracks radiating around manhole frame due to differential deflection.'
  },
  {
    id: 'det-mh-06',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Missing Storm Drain Grate',
    confidence: 0.98,
    timestamp: 'Oct 13, 2026 02:10 PM',
    date: 'Oct 13, 2026',
    time: '02:10 PM',
    coordinates: { lat: 11.5750, lng: 104.9190 },
    locationName: 'Daun Penh',
    roadName: 'Preah Sisowath Quay (Riverside)',
    severity: 'critical',
    depthCm: 45.0,
    areaM2: 0.80,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 25, y: 25, width: 50, height: 50, label: 'Manhole Hazard 0.98', confidence: 0.98 }
    ],
    status: 'detected',
    notes: 'Problem #6: Critical emergency! Grate completely missing, leaving open 45cm drop in bicycle & pedestrian corridor.'
  },
  {
    id: 'det-mh-07',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Displaced Telecom Vault Lid',
    confidence: 0.92,
    timestamp: 'Oct 13, 2026 11:35 AM',
    date: 'Oct 13, 2026',
    time: '11:35 AM',
    coordinates: { lat: 11.5620, lng: 104.9189 },
    locationName: 'Boeung Keng Kang',
    roadName: 'Mao Tse Toung Blvd',
    severity: 'critical',
    depthCm: 7.5,
    areaM2: 0.90,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 22, y: 28, width: 55, height: 46, label: 'Manhole Hazard 0.92', confidence: 0.92 }
    ],
    status: 'scheduled',
    notes: 'Problem #7: Fiber optic vault rectangular cover shifted 12cm askew, leaving open wedge gap.'
  },
  {
    id: 'det-mh-08',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Sub-base Chamber Cavity',
    confidence: 0.90,
    timestamp: 'Oct 13, 2026 09:12 AM',
    date: 'Oct 13, 2026',
    time: '09:12 AM',
    coordinates: { lat: 11.5688, lng: 104.9135 },
    locationName: 'Tuol Kouk',
    roadName: 'Kim Il Sung Blvd',
    severity: 'critical',
    depthCm: 8.0,
    areaM2: 1.80,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 18, y: 24, width: 64, height: 52, label: 'Manhole Hazard 0.90', confidence: 0.90 }
    ],
    status: 'inspected',
    notes: 'Problem #8: Subterranean washout beneath brick chimney, asphalt crust unsupported and caving in.'
  },
  {
    id: 'det-mh-09',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Asphalt Shoving at Ring',
    confidence: 0.86,
    timestamp: 'Oct 12, 2026 05:20 PM',
    date: 'Oct 12, 2026',
    time: '05:20 PM',
    coordinates: { lat: 11.5801, lng: 104.9215 },
    locationName: 'Russei Keo',
    roadName: 'National Highway 5',
    severity: 'moderate',
    depthCm: 4.2,
    areaM2: 1.10,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 26, y: 32, width: 48, height: 44, label: 'Manhole Hazard 0.86', confidence: 0.86 }
    ],
    status: 'detected',
    notes: 'Problem #9: Heavy freight braking pushed hot mix into a 4.2cm high lateral crest immediately ahead of cover.'
  },
  {
    id: 'det-mh-10',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Surcharge Drainage Overflow',
    confidence: 0.87,
    timestamp: 'Oct 12, 2026 03:40 PM',
    date: 'Oct 12, 2026',
    time: '03:40 PM',
    coordinates: { lat: 11.5540, lng: 104.9080 },
    locationName: 'Boeung Salang',
    roadName: 'Street 271 (Yothapol Khemarak Phoumin)',
    severity: 'moderate',
    depthCm: 3.5,
    areaM2: 0.70,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 30, y: 30, width: 42, height: 42, label: 'Manhole Hazard 0.87', confidence: 0.87 }
    ],
    status: 'inspected',
    notes: 'Problem #10: Storm backpressure displaced iron lid off recess seating, letting silt deposit on road.'
  },
  {
    id: 'det-mh-11',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Corroded Heavy Iron Frame',
    confidence: 0.85,
    timestamp: 'Oct 12, 2026 01:15 PM',
    date: 'Oct 12, 2026',
    time: '01:15 PM',
    coordinates: { lat: 11.5475, lng: 104.9120 },
    locationName: 'Chamkar Mon',
    roadName: 'Street 217 (Monireth Blvd)',
    severity: 'minor',
    depthCm: 2.5,
    areaM2: 0.60,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 28, y: 28, width: 45, height: 45, label: 'Manhole Hazard 0.85', confidence: 0.85 }
    ],
    status: 'scheduled',
    notes: 'Problem #11: Flaking oxidation on flange rim reducing bearing area; requires anti-corrosion coating & seat leveling.'
  },
  {
    id: 'det-mh-12',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Unpaved Shoulder Trench Gap',
    confidence: 0.91,
    timestamp: 'Oct 12, 2026 10:05 AM',
    date: 'Oct 12, 2026',
    time: '10:05 AM',
    coordinates: { lat: 11.5680, lng: 104.9090 },
    locationName: 'Tuol Kouk',
    roadName: 'Kampuchea Krom Blvd',
    severity: 'critical',
    depthCm: 7.0,
    areaM2: 1.20,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 22, y: 25, width: 56, height: 50, label: 'Manhole Hazard 0.91', confidence: 0.91 }
    ],
    status: 'detected',
    notes: 'Problem #12: Excavated utility perimeter left unpaved with sharp gravel rim exposing vehicle rims to puncture.'
  },
  {
    id: 'det-mh-13',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Tilting Shaft Inspection Lid',
    confidence: 0.89,
    timestamp: 'Oct 11, 2026 04:30 PM',
    date: 'Oct 11, 2026',
    time: '04:30 PM',
    coordinates: { lat: 11.5772, lng: 104.9125 },
    locationName: 'Doun Penh',
    roadName: 'Street 130',
    severity: 'moderate',
    depthCm: 4.8,
    areaM2: 0.55,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 27, y: 31, width: 46, height: 43, label: 'Manhole Hazard 0.89', confidence: 0.89 }
    ],
    status: 'inspected',
    notes: 'Problem #13: 8-degree slant on frame due to uneven settlement of masonry manhole cone.'
  },
  {
    id: 'det-mh-14',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Ponding Low-Spot Submerged',
    confidence: 0.84,
    timestamp: 'Oct 11, 2026 02:45 PM',
    date: 'Oct 11, 2026',
    time: '02:45 PM',
    coordinates: { lat: 11.5760, lng: 104.9225 },
    locationName: 'Daun Penh',
    roadName: 'Street 144 / Pasteur Corridor',
    severity: 'moderate',
    depthCm: 5.0,
    areaM2: 2.10,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 25, y: 28, width: 50, height: 45, label: 'Manhole Hazard 0.84', confidence: 0.84 }
    ],
    status: 'scheduled',
    notes: 'Problem #14: Low road point causes water to pool directly over sunken lid, disguising a 5cm pothole drop.'
  },
  {
    id: 'det-mh-15',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Warped Steel Utility Plate',
    confidence: 0.93,
    timestamp: 'Oct 11, 2026 01:20 PM',
    date: 'Oct 11, 2026',
    time: '01:20 PM',
    coordinates: { lat: 11.5380, lng: 104.8820 },
    locationName: 'Meanchey',
    roadName: 'Veng Sreng Blvd',
    severity: 'critical',
    depthCm: 6.5,
    areaM2: 1.50,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 20, y: 25, width: 58, height: 50, label: 'Manhole Hazard 0.93', confidence: 0.93 }
    ],
    status: 'detected',
    notes: 'Problem #15: Heavy container truck loading permanently bowed steel utility bridging plate downward.'
  },
  {
    id: 'det-mh-16',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Unseated Water Valve Casing',
    confidence: 0.88,
    timestamp: 'Oct 11, 2026 11:10 AM',
    date: 'Oct 11, 2026',
    time: '11:10 AM',
    coordinates: { lat: 11.5645, lng: 104.9215 },
    locationName: 'Boeung Keng Kang 1',
    roadName: 'Preah Trasak Paem (Street 63)',
    severity: 'moderate',
    depthCm: 4.1,
    areaM2: 0.35,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 32, y: 32, width: 38, height: 38, label: 'Manhole Hazard 0.88', confidence: 0.88 }
    ],
    status: 'inspected',
    notes: 'Problem #16: Small diameter water utility gate valve box cover shifted, catching thin motorbike tires.'
  },
  {
    id: 'det-mh-17',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Delaminated Pavement Infill',
    confidence: 0.86,
    timestamp: 'Oct 11, 2026 09:40 AM',
    date: 'Oct 11, 2026',
    time: '09:40 AM',
    coordinates: { lat: 11.5670, lng: 104.9250 },
    locationName: 'Chamkar Mon',
    roadName: 'Street 51 (Rue Pasteur)',
    severity: 'minor',
    depthCm: 2.2,
    areaM2: 0.40,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 30, y: 30, width: 40, height: 40, label: 'Manhole Hazard 0.86', confidence: 0.86 }
    ],
    status: 'repaired',
    notes: 'Problem #17: Infill asphalt inside recessed lid tray disintegrated; replaced with high-adhesion mastic.'
  },
  {
    id: 'det-mh-18',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Sunken Catch-Basin Curb Inlet',
    confidence: 0.90,
    timestamp: 'Oct 10, 2026 05:15 PM',
    date: 'Oct 10, 2026',
    time: '05:10 PM',
    coordinates: { lat: 11.5580, lng: 104.9240 },
    locationName: 'Boeung Keng Kang 1',
    roadName: 'Oknha Chrun You Hak St (Street 294)',
    severity: 'moderate',
    depthCm: 5.5,
    areaM2: 0.85,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 24, y: 28, width: 52, height: 46, label: 'Manhole Hazard 0.90', confidence: 0.90 }
    ],
    status: 'scheduled',
    notes: 'Problem #18: Gutter catch-basin manhole junction dropped 5.5cm below gutter line, damaging parked car tires.'
  },
  {
    id: 'det-mh-19',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Broken Hinge Sewer Access',
    confidence: 0.87,
    timestamp: 'Oct 10, 2026 03:25 PM',
    date: 'Oct 10, 2026',
    time: '03:25 PM',
    coordinates: { lat: 11.5720, lng: 104.9080 },
    locationName: 'Tuol Kouk',
    roadName: 'Samdach Penn Nouth St (Street 289)',
    severity: 'critical',
    depthCm: 6.0,
    areaM2: 0.65,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 26, y: 28, width: 48, height: 46, label: 'Manhole Hazard 0.87', confidence: 0.87 }
    ],
    status: 'inspected',
    notes: 'Problem #19: Mechanical hinge pin sheared off; cover slides out of locking alignment during rain flows.'
  },
  {
    id: 'det-mh-20',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Exposed Rebar at Joint Ring',
    confidence: 0.95,
    timestamp: 'Oct 10, 2026 12:15 PM',
    date: 'Oct 10, 2026',
    time: '12:15 PM',
    coordinates: { lat: 11.5280, lng: 104.9280 },
    locationName: 'Meanchey',
    roadName: 'Hun Sen Blvd (60M Road)',
    severity: 'critical',
    depthCm: 5.2,
    areaM2: 0.95,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 22, y: 26, width: 55, height: 48, label: 'Manhole Hazard 0.95', confidence: 0.95 }
    ],
    status: 'detected',
    notes: 'Problem #20: Spalled precast concrete ring exposed rusted steel reinforcement wires that puncture rubber tires.'
  },
  {
    id: 'det-mh-21',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Utility Cut Settlement Drop',
    confidence: 0.91,
    timestamp: 'Oct 10, 2026 09:50 AM',
    date: 'Oct 10, 2026',
    time: '09:50 AM',
    coordinates: { lat: 11.5580, lng: 104.8870 },
    locationName: 'Sen Sok',
    roadName: 'Street 2004 (Mai Da)',
    severity: 'critical',
    depthCm: 7.2,
    areaM2: 2.20,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 18, y: 22, width: 62, height: 54, label: 'Manhole Hazard 0.91', confidence: 0.91 }
    ],
    status: 'detected',
    notes: 'Problem #21: Trench backfill consolidation caused entire square surround around manhole to sink 7.2cm.'
  },
  {
    id: 'det-mh-22',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Twin Vault Uneven Step Level',
    confidence: 0.89,
    timestamp: 'Oct 09, 2026 04:10 PM',
    date: 'Oct 09, 2026',
    time: '04:10 PM',
    coordinates: { lat: 11.5520, lng: 104.9140 },
    locationName: 'Chamkar Mon',
    roadName: 'Street 271 (Near Toul Tompoung)',
    severity: 'moderate',
    depthCm: 3.8,
    areaM2: 1.10,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 24, y: 30, width: 52, height: 44, label: 'Manhole Hazard 0.89', confidence: 0.89 }
    ],
    status: 'scheduled',
    notes: 'Problem #22: Double-leaf electric transformer vault has 3.8cm height difference between twin doors.'
  },
  {
    id: 'det-mh-23',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Depressed Spiderweb Fracture',
    confidence: 0.93,
    timestamp: 'Oct 09, 2026 01:30 PM',
    date: 'Oct 09, 2026',
    time: '01:30 PM',
    coordinates: { lat: 11.5660, lng: 104.9170 },
    locationName: 'Prampir Makara',
    roadName: 'Oknha Tep Phan St (Street 182)',
    severity: 'critical',
    depthCm: 6.8,
    areaM2: 1.65,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 20, y: 25, width: 60, height: 50, label: 'Manhole Hazard 0.93', confidence: 0.93 }
    ],
    status: 'detected',
    notes: 'Problem #23: Sunken sewer manhole perimeter shattered into polygonal block fractures with crumbly asphalt edges.'
  },
  {
    id: 'det-mh-24',
    type: 'manhole_hazard',
    title: 'Manhole Hazard - Clattering Gasket Failure Rim',
    confidence: 0.87,
    timestamp: 'Oct 09, 2026 10:15 AM',
    date: 'Oct 09, 2026',
    time: '10:15 AM',
    coordinates: { lat: 11.5740, lng: 104.9060 },
    locationName: 'Tuol Kouk',
    roadName: 'Street 315 (Tuol Kouk Central)',
    severity: 'moderate',
    depthCm: 3.0,
    areaM2: 0.50,
    image: DEFECT_MANHOLE_HAZARD_IMG,
    cropImage: DEFECT_MANHOLE_HAZARD_IMG,
    boundingBoxes: [
      { x: 28, y: 32, width: 44, height: 42, label: 'Manhole Hazard 0.87', confidence: 0.87 }
    ],
    status: 'repaired',
    notes: 'Problem #24: Missing neoprene damping ring caused metal-on-metal clang and micro-shocks; new elastomeric ring fitted.'
  }
];

// Additional standard road defects to complement the dataset
export const ADDITIONAL_ROAD_DEFECTS: DamageDetection[] = [
  {
    id: 'det-001',
    type: 'pothole',
    title: 'Severe Asphalt Pothole',
    confidence: 0.92,
    timestamp: 'Oct 11, 2026 10:24 AM',
    date: 'Oct 11, 2026',
    time: '10:24 AM',
    coordinates: { lat: 11.5725, lng: 104.9182 },
    locationName: 'Daun Penh District',
    roadName: 'Preah Monivong Blvd (Near Wat Koh)',
    severity: 'critical',
    depthCm: 8.5,
    areaM2: 0.45,
    image: DASHCAM_IMG,
    cropImage: POTHOLE_IMG,
    boundingBoxes: [
      { x: 38, y: 58, width: 22, height: 16, label: 'Pothole', confidence: 0.92 },
      { x: 28, y: 51, width: 14, height: 10, label: 'Pothole', confidence: 0.85 }
    ],
    status: 'detected',
    notes: 'High-risk deep pothole in right travel lane, exposed sub-base rock causing vehicle swerving.'
  },
  {
    id: 'det-002',
    type: 'pothole',
    title: 'Medium Edge Pothole',
    confidence: 0.87,
    timestamp: 'Oct 11, 2026 10:21 AM',
    date: 'Oct 11, 2026',
    time: '10:21 AM',
    coordinates: { lat: 11.5741, lng: 104.9203 },
    locationName: 'Phnom Penh Center',
    roadName: 'Russian Federation Blvd',
    severity: 'critical',
    depthCm: 6.2,
    areaM2: 0.32,
    image: POTHOLE_IMG,
    cropImage: POTHOLE_IMG,
    boundingBoxes: [
      { x: 30, y: 40, width: 45, height: 35, label: 'Pothole', confidence: 0.87 }
    ],
    status: 'inspected',
    notes: 'Located near intersection curbside, water pooling risk during rain.'
  },
  {
    id: 'det-003',
    type: 'longitudinal_crack',
    title: 'Longitudinal Pavement Crack',
    confidence: 0.81,
    timestamp: 'Oct 11, 2026 10:18 AM',
    date: 'Oct 11, 2026',
    time: '10:18 AM',
    coordinates: { lat: 11.5702, lng: 104.9163 },
    locationName: 'Prampir Makara',
    roadName: 'Charles de Gaulle Blvd',
    severity: 'moderate',
    depthCm: 2.1,
    areaM2: 1.15,
    image: CRACK_IMG,
    cropImage: CRACK_IMG,
    boundingBoxes: [
      { x: 15, y: 10, width: 70, height: 80, label: 'Crack', confidence: 0.81 }
    ],
    status: 'scheduled',
    notes: 'Extensive longitudinal fatigue cracking along wheel path, requires hot-pour crack sealant.'
  },
  {
    id: 'det-004',
    type: 'pothole',
    title: 'Traffic Lane Pothole',
    confidence: 0.89,
    timestamp: 'Oct 11, 2026 10:15 AM',
    date: 'Oct 11, 2026',
    time: '10:15 AM',
    coordinates: { lat: 11.5736, lng: 104.9178 },
    locationName: 'Daun Penh',
    roadName: 'Preah Norodom Blvd',
    severity: 'critical',
    depthCm: 7.0,
    areaM2: 0.38,
    image: POTHOLE_IMG,
    cropImage: POTHOLE_IMG,
    boundingBoxes: [
      { x: 25, y: 35, width: 50, height: 40, label: 'Pothole', confidence: 0.89 }
    ],
    status: 'detected',
    notes: 'Rapidly deteriorating due to heavy bus transit corridor.'
  },
  {
    id: 'det-005',
    type: 'alligator_crack',
    title: 'Alligator Fatigue Cracking',
    confidence: 0.94,
    timestamp: 'Oct 11, 2026 09:42 AM',
    date: 'Oct 11, 2026',
    time: '09:42 AM',
    coordinates: { lat: 11.5688, lng: 104.9135 },
    locationName: 'Tuol Kouk',
    roadName: 'Kim Il Sung Blvd',
    severity: 'moderate',
    depthCm: 1.8,
    areaM2: 2.4,
    image: DEFECT_ALLIGATOR_CRACK_IMG,
    cropImage: DEFECT_ALLIGATOR_CRACK_IMG,
    boundingBoxes: [
      { x: 10, y: 20, width: 80, height: 60, label: 'Crack', confidence: 0.94 }
    ],
    status: 'detected',
    notes: 'Interconnected polygon cracks signaling sub-base structural exhaustion.'
  },
  {
    id: 'det-007',
    type: 'pothole',
    title: 'Highway Fast-Lane Pothole',
    confidence: 0.91,
    timestamp: 'Oct 10, 2026 04:30 PM',
    date: 'Oct 10, 2026',
    time: '04:30 PM',
    coordinates: { lat: 11.5654, lng: 104.9242 },
    locationName: 'Chamkar Mon',
    roadName: 'Preah Sihanouk Blvd',
    severity: 'critical',
    depthCm: 9.2,
    areaM2: 0.52,
    image: DASHCAM_IMG,
    cropImage: POTHOLE_IMG,
    boundingBoxes: [
      { x: 42, y: 62, width: 25, height: 18, label: 'Pothole', confidence: 0.91 }
    ],
    status: 'repaired',
    notes: 'Emergency cold-mix patch completed by municipal crew #4.'
  },
  {
    id: 'det-008',
    type: 'transverse_crack',
    title: 'Transverse Thermal Crack',
    confidence: 0.88,
    timestamp: 'Oct 10, 2026 02:14 PM',
    date: 'Oct 10, 2026',
    time: '02:14 PM',
    coordinates: { lat: 11.5772, lng: 104.9125 },
    locationName: 'Doun Penh',
    roadName: 'Street 130',
    severity: 'minor',
    depthCm: 1.2,
    areaM2: 0.85,
    image: CRACK_IMG,
    cropImage: CRACK_IMG,
    boundingBoxes: [
      { x: 20, y: 25, width: 60, height: 50, label: 'Crack', confidence: 0.88 }
    ],
    status: 'inspected',
    notes: 'Perpendicular transverse seam extending across lane width.'
  },
  {
    id: 'det-009',
    type: 'pothole',
    title: 'Intersection Cluster Pothole',
    confidence: 0.95,
    timestamp: 'Oct 10, 2026 11:05 AM',
    date: 'Oct 10, 2026',
    time: '11:05 AM',
    coordinates: { lat: 11.5620, lng: 104.9189 },
    locationName: 'Boeung Keng Kang',
    roadName: 'Mao Tse Toung Blvd',
    severity: 'critical',
    depthCm: 8.0,
    areaM2: 0.48,
    image: POTHOLE_IMG,
    cropImage: POTHOLE_IMG,
    boundingBoxes: [
      { x: 35, y: 45, width: 40, height: 35, label: 'Pothole', confidence: 0.95 }
    ],
    status: 'detected',
    notes: 'Severe impact crater at braking zone before traffic signal.'
  },
  {
    id: 'det-010',
    type: 'other',
    title: 'Asphalt Rutting & Shoving',
    confidence: 0.83,
    timestamp: 'Oct 9, 2026 03:50 PM',
    date: 'Oct 9, 2026',
    time: '03:50 PM',
    coordinates: { lat: 11.5801, lng: 104.9215 },
    locationName: 'Russei Keo',
    roadName: 'National Highway 5',
    severity: 'moderate',
    depthCm: 3.8,
    areaM2: 3.2,
    image: DASHCAM_IMG,
    cropImage: POTHOLE_IMG,
    boundingBoxes: [
      { x: 20, y: 60, width: 55, height: 25, label: 'Rutting', confidence: 0.83 }
    ],
    status: 'inspected',
    notes: 'Permanent longitudinal surface depression caused by heavy axle freight.'
  }
];

// Combine all 24 Manhole Hazards as primary records followed by other defects
export const INITIAL_DETECTIONS: DamageDetection[] = [
  ...MANHOLE_HAZARDS_24_PROBLEMS,
  ...ADDITIONAL_ROAD_DEFECTS
];

// Metrics distribution reflecting all 24 Manhole Hazard problems
export const METRICS = {
  total: 254,
  growthPercentage: 14,
  potholes: {
    count: 178,
    percentage: 70
  },
  cracks: {
    count: 52,
    percentage: 20
  },
  manholeHazards: {
    count: 24,
    percentage: 10
  },
  other: {
    count: 15,
    percentage: 6
  }
};

// Monthly detections trend for report chart
export const MONTHLY_DETECTIONS = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 18 },
  { month: 'Mar', count: 24 },
  { month: 'Apr', count: 22 },
  { month: 'May', count: 28 },
  { month: 'Jun', count: 36 },
  { month: 'Jul', count: 40 },
  { month: 'Aug', count: 42 },
  { month: 'Sep', count: 48 },
  { month: 'Oct', count: 54 }
];

export interface MapPinItem {
  id: string;
  lat: number;
  lng: number;
  type: DamageDetection['type'];
  title: string;
  confidence: number;
  date: string;
  roadName?: string;
  severity?: 'critical' | 'moderate' | 'minor';
}

// Map Pins for Phnom Penh: All 24 Manhole Hazard pins with accurate signs & titles + other defects
export const MAP_PINS: MapPinItem[] = [
  // 24 Manhole Hazard Pins with their specific problem titles and coordinates
  ...MANHOLE_HAZARDS_24_PROBLEMS.map((mh, idx) => ({
    id: mh.id,
    lat: mh.coordinates.lat,
    lng: mh.coordinates.lng,
    type: 'manhole_hazard' as const,
    title: `Manhole Hazard #${idx + 1}: ${mh.title.replace('Manhole Hazard - ', '')}`,
    confidence: mh.confidence,
    date: mh.timestamp,
    roadName: mh.roadName,
    severity: mh.severity
  })),
  // Additional road defect pins for comprehensive GIS map view
  { id: 'det-001', lat: 11.5725, lng: 104.9182, type: 'pothole', title: 'Severe Pothole #1', confidence: 0.92, date: 'Oct 11, 2026 10:24 AM', roadName: 'Preah Monivong Blvd', severity: 'critical' },
  { id: 'det-002', lat: 11.5741, lng: 104.9203, type: 'pothole', title: 'Edge Pothole #2', confidence: 0.87, date: 'Oct 11, 2026 10:21 AM', roadName: 'Russian Federation Blvd', severity: 'critical' },
  { id: 'det-003', lat: 11.5702, lng: 104.9163, type: 'longitudinal_crack', title: 'Longitudinal Crack #3', confidence: 0.81, date: 'Oct 11, 2026 10:18 AM', roadName: 'Charles de Gaulle Blvd', severity: 'moderate' },
  { id: 'det-004', lat: 11.5736, lng: 104.9178, type: 'pothole', title: 'Lane Pothole #4', confidence: 0.89, date: 'Oct 11, 2026 10:15 AM', roadName: 'Preah Norodom Blvd', severity: 'critical' },
  { id: 'det-005', lat: 11.5688, lng: 104.9135, type: 'alligator_crack', title: 'Alligator Fatigue #5', confidence: 0.94, date: 'Oct 11, 2026 09:42 AM', roadName: 'Kim Il Sung Blvd', severity: 'moderate' },
  { id: 'det-007', lat: 11.5654, lng: 104.9242, type: 'pothole', title: 'Highway Pothole #7', confidence: 0.91, date: 'Oct 10, 2026 04:30 PM', roadName: 'Preah Sihanouk Blvd', severity: 'critical' },
  { id: 'det-008', lat: 11.5772, lng: 104.9125, type: 'transverse_crack', title: 'Transverse Seam #8', confidence: 0.88, date: 'Oct 10, 2026 02:14 PM', roadName: 'Street 130', severity: 'minor' },
  { id: 'det-009', lat: 11.5620, lng: 104.9189, type: 'pothole', title: 'Cluster Pothole #9', confidence: 0.95, date: 'Oct 10, 2026 11:05 AM', roadName: 'Mao Tse Toung Blvd', severity: 'critical' },
  { id: 'det-010', lat: 11.5801, lng: 104.9215, type: 'other', title: 'Asphalt Rutting #10', confidence: 0.83, date: 'Oct 9, 2026 03:50 PM', roadName: 'National Highway 5', severity: 'moderate' },
  { id: 'bg-1', lat: 11.5710, lng: 104.9210, type: 'pothole', title: 'Pothole In-fill', confidence: 0.86, date: 'Oct 9, 2026', roadName: 'Monivong Corridor', severity: 'critical' },
  { id: 'bg-2', lat: 11.5695, lng: 104.9195, type: 'crack', title: 'Longitudinal Seam', confidence: 0.79, date: 'Oct 9, 2026', roadName: 'Street 214', severity: 'moderate' },
  { id: 'bg-3', lat: 11.5730, lng: 104.9230, type: 'pothole', title: 'Shoulder Pothole', confidence: 0.93, date: 'Oct 8, 2026', roadName: 'Preah Sisowath Quay', severity: 'critical' }
];

export const SAMPLE_VIDEO_URL = '/videos/phnom_penh_patrol.mp4';

export interface VideoTrackedProblem {
  id: string;
  timeSeconds: number;
  timeFormatted: string;
  endSeconds: number;
  type: DamageType;
  title: string;
  kmTitle: string;
  severity: 'critical' | 'moderate' | 'minor';
  confidence: number;
  coordinates: { lat: number; lng: number };
  roadName: string;
  kmRoadName: string;
  depthCm: number;
  areaM2: number;
  boxes: { x: number; y: number; width: number; height: number; label: string; confidence: number }[];
  description: string;
  kmDescription: string;
}

export const SAMPLE_VIDEO_TRACKED_PROBLEMS: VideoTrackedProblem[] = [
  {
    id: 'vid-prob-01',
    timeSeconds: 1,
    endSeconds: 3,
    timeFormatted: '00:01',
    type: 'pothole',
    title: 'Railway Level Crossing Flangeway Gap & Impact Spalling',
    kmTitle: 'ប្រហោងក្បែរផ្លូវដែក និងការបែកបាក់កៅស៊ូ (ឈប់ STOP)',
    severity: 'critical',
    confidence: 0.96,
    coordinates: { lat: 11.5672, lng: 104.9148 },
    roadName: 'Railroad Level Crossing Intersect (ឈប់ STOP)',
    kmRoadName: 'ផ្លូវប្រសព្វផ្លូវដែកក្រុងភ្នំពេញ (ឈប់ STOP)',
    depthCm: 8.2,
    areaM2: 0.95,
    boxes: [
      { x: 22, y: 56, width: 56, height: 26, label: 'Rail Flange Cavity 0.96', confidence: 0.96 },
      { x: 38, y: 50, width: 22, height: 16, label: 'Track Spall 0.91', confidence: 0.91 }
    ],
    description: 'Deep flangeway groove gap and severe impact spalling where dual steel rails cross the asphalt pavement. High-shock hazard for vehicle suspension and two-wheelers.',
    kmDescription: 'ការប្រេះបាក់បាតផ្លូវក្បែរកំណាត់ដែកផ្លូវរថភ្លើង បង្កើតជាក្រឡុកជម្រៅ ៨.២ស.ម គ្រោះថ្នាក់ខ្លាំងដល់ម៉ូតូ និងរថយន្ត។'
  },
  {
    id: 'vid-prob-02',
    timeSeconds: 4,
    endSeconds: 7,
    timeFormatted: '00:04',
    type: 'transverse_crack',
    title: 'Transverse Construction Trench Seam & Shoulder Rutting',
    kmTitle: 'ស្នាមប្រេះទទឹងកាត់ផ្លូវ និងការស្រុតចិញ្ចើមផ្លូវ',
    severity: 'moderate',
    confidence: 0.92,
    coordinates: { lat: 11.5681, lng: 104.9155 },
    roadName: 'Post-Crossing Corridor (Near Blue Site Fence)',
    kmRoadName: 'កំណាត់ផ្លូវបន្ទាប់ពីផ្លូវដែក (ក្បែររបងការដ្ឋានខៀវ)',
    depthCm: 4.5,
    areaM2: 0.80,
    boxes: [
      { x: 26, y: 58, width: 48, height: 18, label: 'Transverse Trench 0.92', confidence: 0.92 }
    ],
    description: 'Transverse backfill trench seam crossing entire traffic lane width with shoulder edge settlement.',
    kmDescription: 'ស្នាមប្រេះទទឹងកាត់ទទឹងផ្លូវបណ្តាលមកពីការកប់បំពង់ក្រោមដី រួមជាមួយការស្រុតចិញ្ចើមផ្លូវ។'
  },
  {
    id: 'vid-prob-03',
    timeSeconds: 8,
    endSeconds: 11,
    timeFormatted: '00:08',
    type: 'longitudinal_crack',
    title: 'Longitudinal Centerline Seam Crack & Asphalt Ravelling',
    kmTitle: 'ស្នាមប្រេះបណ្តោយកណ្តាលទ្រូងផ្លូវ និងការរបកសំបកកៅស៊ូ',
    severity: 'moderate',
    confidence: 0.90,
    coordinates: { lat: 11.5689, lng: 104.9161 },
    roadName: 'Street 217 Transition Corridor (Red Car Zone)',
    kmRoadName: 'ផ្លូវលេខ ២១៧ (តំបន់ឆ្លងកាត់រថយន្តក្រហម)',
    depthCm: 2.8,
    areaM2: 1.35,
    boxes: [
      { x: 34, y: 50, width: 32, height: 38, label: 'Longitudinal Seam 0.90', confidence: 0.90 }
    ],
    description: 'Continuous longitudinal crack running down paving joint seam with surface stone stripped away.',
    kmDescription: 'ស្នាមប្រេះបណ្តោយស្របតាមទិសដៅចរាចរណ៍ បង្កឡើងដោយការដាច់ស្រទាប់តំណកៅស៊ូ និងរបកថ្ម។'
  },
  {
    id: 'vid-prob-04',
    timeSeconds: 12,
    endSeconds: 15,
    timeFormatted: '00:12',
    type: 'crack',
    title: 'Patch Perimeter Cracking & Differential Settlement',
    kmTitle: 'ការប្រេះស្រុតជុំវិញកន្លែងប៉ះកៅស៊ូចាស់',
    severity: 'moderate',
    confidence: 0.88,
    coordinates: { lat: 11.5698, lng: 104.9169 },
    roadName: 'Food Stall & Cargo Van Section',
    kmRoadName: 'តំបន់តូបអាហារ និងរថយន្តដឹកទំនិញ',
    depthCm: 3.5,
    areaM2: 1.60,
    boxes: [
      { x: 22, y: 55, width: 54, height: 26, label: 'Patch Perimeter Crack 0.88', confidence: 0.88 }
    ],
    description: 'Large rectangular roadway patch exhibiting edge boundary failure and differential wheel compaction.',
    kmDescription: 'កន្លែងដែលធ្លាប់ប៉ះប៉ូវកៅស៊ូចាស់រាងបួនជ្រុងចាប់ផ្តើមរបកប្រេះតាមគែម និងស្រុតចុះ។'
  },
  {
    id: 'vid-prob-05',
    timeSeconds: 16,
    endSeconds: 19,
    timeFormatted: '00:16',
    type: 'longitudinal_crack',
    title: 'Sunken Pavement Patch & Longitudinal Fatigue Seam',
    kmTitle: 'កន្លែងប៉ះកៅស៊ូស្រុត និងស្នាមប្រេះបណ្តោយ',
    severity: 'moderate',
    confidence: 0.91,
    coordinates: { lat: 11.5705, lng: 104.9175 },
    roadName: 'Modern White Complex Frontage',
    kmRoadName: 'មុខអគារទំនើបពណ៌ស (ជិតច្រកការដ្ឋាន)',
    depthCm: 3.8,
    areaM2: 1.45,
    boxes: [
      { x: 30, y: 52, width: 38, height: 35, label: 'Longitudinal Joint 0.91', confidence: 0.91 }
    ],
    description: 'Dark asphalt rectangular patch sunken below surrounding road surface with longitudinal fatigue crack.',
    kmDescription: 'ផ្ទៃកៅស៊ូប៉ះពណ៌ខ្មៅស្រុតទាបជាងផ្ទៃផ្លូវ និងមានស្នាមប្រេះបណ្តោយឆ្លងកាត់។'
  },
  {
    id: 'vid-prob-06',
    timeSeconds: 20,
    endSeconds: 22,
    timeFormatted: '00:20',
    type: 'manhole_hazard',
    title: 'Curb Storm Drain Settlement & Water Ponding Defect',
    kmTitle: 'គម្របលូទឹកភ្លៀងស្រុត និងការដក់ទឹកចិញ្ចើមផ្លូវ',
    severity: 'critical',
    confidence: 0.93,
    coordinates: { lat: 11.5712, lng: 104.9182 },
    roadName: 'Commercial Frontage (Right of Auto-Rickshaw)',
    kmRoadName: 'ចិញ្ចើមផ្លូវពាណិជ្ជកម្ម (ខាងស្តាំកង់បី)',
    depthCm: 5.6,
    areaM2: 0.72,
    boxes: [
      { x: 44, y: 56, width: 36, height: 28, label: 'Sunken Drain Hazard 0.93', confidence: 0.93 }
    ],
    description: 'Depressed drainage inlet / storm chamber sunken 5.6cm into pavement shoulder with water ponding and deteriorating asphalt border.',
    kmDescription: 'គម្របលូទឹកភ្លៀងស្រុតចុះ ៥.៦ស.ម បង្កជាកន្លែងដក់ទឹក និងខូចខាតកៅស៊ូចិញ្ចើមផ្លូវ។'
  },
  {
    id: 'vid-prob-07',
    timeSeconds: 23,
    endSeconds: 25,
    timeFormatted: '00:23',
    type: 'alligator_crack',
    title: 'Wheel-Path Rutting & Road Base Fatigue Crack',
    kmTitle: 'ស្នាមប្រេះកង់រថយន្ត និងការរលាក់ទ្រូងផ្លូវ',
    severity: 'moderate',
    confidence: 0.89,
    coordinates: { lat: 11.5719, lng: 104.9189 },
    roadName: 'Road Corridor behind Auto-Rickshaw',
    kmRoadName: 'កំណាត់ផ្លូវពីក្រោយកង់បី (ឆ្ពោះទៅមហាវិថីធំ)',
    depthCm: 3.2,
    areaM2: 1.80,
    boxes: [
      { x: 28, y: 54, width: 44, height: 30, label: 'Wheel-Path Fatigue 0.89', confidence: 0.89 }
    ],
    description: 'Surface alligator fatigue cracking under high-axle vehicle traffic paths before the intersection.',
    kmDescription: 'ស្នាមប្រេះបែកមែកធាងកណ្តាលទ្រូងផ្លូវដោយសារសំពាធទម្ងន់កង់រថយន្តបើកបរជាប្រចាំ។'
  }
];


