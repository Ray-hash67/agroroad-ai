export type Language = 'en' | 'km';

export interface Translations {
  appName: string;
  appSubtitle: string;
  smartSystem: string;
  dashboard: string;
  aiDetection: string;
  satelliteMap: string;
  reports: string;
  dataManagement: string;
  settings: string;
  dashboardDesc: string;
  detectionDesc: string;
  mapDesc: string;
  reportsDesc: string;
  dataDesc: string;
  settingsDesc: string;
  totalDetections: string;
  potholes: string;
  cracks: string;
  longitudinalCrack: string;
  transverseCrack: string;
  alligatorCrack: string;
  manholeHazard: string;
  otherDefects: string;
  vsLastMonth: string;
  damageLocations: string;
  recentDetections: string;
  viewAll: string;
  confidence: string;
  date: string;
  location: string;
  viewDetails: string;
  saveToDb: string;
  saved: string;
  retake: string;
  upload: string;
  liveVision: string;
  startDetection: string;
  pauseDetection: string;
  captureDefect: string;
  detectionResult: string;
  type: string;
  severity: string;
  status: string;
  depth: string;
  area: string;
  roadName: string;
  damageTypeDistribution: string;
  monthlyDetections: string;
  exportReport: string;
  pdfReport: string;
  csvData: string;
  imagesZip: string;
  close: string;
  language: string;
  english: string;
  khmer: string;
  nightGis: string;
  streets: string;
  satellite: string;
  gpsActive: string;
  visionEngine: string;
  itcAdmin: string;
  critical: string;
  moderate: string;
  minor: string;
  detected: string;
  inspected: string;
  scheduled: string;
  repaired: string;
  phonePreview: string;
  deepEngineering: string;
  evaluating: string;
  officialAudit: string;
  printPdf: string;
  phnomPenhPatrol: string;
  deviceComputer: string;
  deviceMobile: string;
  menu: string;
  collapseMenu: string;
  expandMenu: string;
  toolCamera: string;
  toolUpload: string;
  cameraLiveTool: string;
  uploadDamagePhoto: string;
  turnOnCamera: string;
  switchCamera: string;
  takeSnapshot: string;
  dragAndDrop: string;
  analyzeDamage: string;
  uploadSuccess: string;
  cameraDenied: string;
  videoInspection: string;
  sampleVideo: string;
  uploadVideo: string;
  trackedProblems: string;
  jumpToTime: string;
  saveAllTracked: string;
  trackingNow: string;
  speed: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'AgroRoad AI',
    appSubtitle: 'Smarter Analysis | Safer Roads',
    smartSystem: 'Smarter Analysis | Safer Roads',
    dashboard: 'Dashboard',
    aiDetection: 'AI Detection',
    satelliteMap: 'Satellite Map',
    reports: 'Reports',
    dataManagement: 'Data Management',
    settings: 'Settings',
    dashboardDesc: 'Overview of detected road damage and road condition',
    detectionDesc: 'Real-time pavement crack & pothole identification and bounding box analysis',
    mapDesc: 'Geospatial satellite distribution across Phnom Penh municipal road network',
    reportsDesc: 'Defect distribution, monthly survey progression, and exportable engineering data',
    dataDesc: 'Audit log, repair scheduling, inspection records and maintenance queue',
    settingsDesc: 'Detection confidence thresholds, GPS accuracy limits, and vision model settings',
    totalDetections: 'Total Detections',
    potholes: 'Potholes',
    cracks: 'Longitudinal crack',
    longitudinalCrack: 'Longitudinal crack',
    transverseCrack: 'Transverse Crack',
    alligatorCrack: 'Alligator Crack',
    manholeHazard: 'Manhole Hazard',
    otherDefects: 'Other Defects',
    vsLastMonth: 'vs last month',
    damageLocations: 'Damage Locations',
    recentDetections: 'Recent Detections',
    viewAll: 'View All',
    confidence: 'Confidence',
    date: 'Date',
    location: 'Location',
    viewDetails: 'View Details',
    saveToDb: 'Save to Database',
    saved: 'Saved!',
    retake: 'Retake',
    upload: 'Upload',
    liveVision: 'Live AI Vision',
    startDetection: 'Start Detection',
    pauseDetection: 'Pause Detection',
    captureDefect: 'Capture Defect',
    detectionResult: 'Detection Result',
    type: 'Type',
    severity: 'Severity',
    status: 'Status',
    depth: 'Est. Depth',
    area: 'Surface Area',
    roadName: 'Corridor',
    damageTypeDistribution: 'Damage Type Distribution',
    monthlyDetections: 'Monthly Detections',
    exportReport: 'Export Report',
    pdfReport: 'PDF Report',
    csvData: 'CSV Data',
    imagesZip: 'Images (ZIP)',
    close: 'Close',
    language: 'Language',
    english: 'English',
    khmer: 'ភាសាខ្មែរ',
    nightGis: 'Night GIS',
    streets: 'Streets',
    satellite: 'Satellite',
    gpsActive: 'GPS Satellite Active',
    visionEngine: 'Vision Engine',
    itcAdmin: 'Admin • ITC AgroRoad AI',
    critical: 'Critical',
    moderate: 'Moderate',
    minor: 'Minor',
    detected: 'Detected',
    inspected: 'Inspected',
    scheduled: 'Scheduled',
    repaired: 'Repaired',
    phonePreview: 'Phone Preview',
    deepEngineering: 'Civil Engineering Assessment',
    evaluating: 'Evaluating Pavement Stress...',
    officialAudit: 'Official Municipal Road Audit',
    printPdf: 'Print / Save PDF',
    phnomPenhPatrol: 'Phnom Penh Highway Patrol',
    deviceComputer: 'Computer',
    deviceMobile: 'Mobile',
    menu: 'Menu',
    collapseMenu: 'Close Menu',
    expandMenu: 'Open Menu',
    toolCamera: 'Tool Camera',
    toolUpload: 'Tool Upload',
    cameraLiveTool: 'Mobile Camera Scanner',
    uploadDamagePhoto: 'Upload Road Damage Photo',
    turnOnCamera: 'Start Live Camera',
    switchCamera: 'Flip Camera',
    takeSnapshot: 'Capture Road Defect',
    dragAndDrop: 'Drop road defect photo here, or browse files',
    analyzeDamage: 'Analyze Damage with AI',
    uploadSuccess: 'Defect Analyzed & Saved to Database!',
    cameraDenied: 'Camera unavailable or permission denied. Using high-definition road patrol feed.',
    videoInspection: 'Video Inspection',
    sampleVideo: 'Phnom Penh Patrol (Sample Video)',
    uploadVideo: 'Upload Video',
    trackedProblems: 'Tracked Problems in Video',
    jumpToTime: 'Jump to Time',
    saveAllTracked: 'Save All Tracked Problems',
    trackingNow: 'TRACKING NOW',
    speed: 'Speed',
  },
  km: {
    appName: 'AgroRoad AI',
    appSubtitle: 'ការវិភាគឆ្លាតវៃ | ផ្លូវថ្នល់សុវត្ថិភាពជាងមុន',
    smartSystem: 'ប្រព័ន្ធវិភាគឆ្លាតវៃផ្លូវថ្នល់',
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    aiDetection: 'ការចាប់ពិការភាព AI',
    satelliteMap: 'ផែនទីផ្កាយរណប',
    reports: 'របាយការណ៍',
    dataManagement: 'ការគ្រប់គ្រងទិន្នន័យ',
    settings: 'ការកំណត់',
    dashboardDesc: 'ទិដ្ឋភាពទូទៅនៃពិការភាពផ្លូវថ្នល់ និងលក្ខខណ្ឌស្ថានភាពផ្លូវ',
    detectionDesc: 'ការសម្គាល់ស្នាមប្រេះ និងរណ្តៅផ្លូវតាមពេលជាក់ស្តែងដោយ AI',
    mapDesc: 'ការចែកចាយពិការភាពផ្លូវថ្នល់នៅលើផែនទីភូមិសាស្ត្ររាជធានីភ្នំពេញ',
    reportsDesc: 'ស្ថិតិពិការភាព របាយការណ៍ប្រចាំខែ និងការនាំចេញឯកសារវិស្វកម្ម',
    dataDesc: 'កំណត់ហេតុត្រួតពិនិត្យ កាលវិភាគជួសជុល និងបញ្ជីការងារថែទាំ',
    settingsDesc: 'កម្រិតទំនុកចិត្ត AI កម្រិតភាពត្រឹមត្រូវ GPS និងម៉ូដែល',
    totalDetections: 'ពិការភាពសរុប',
    potholes: 'រណ្តៅផ្លូវ',
    cracks: 'ស្នាមប្រេះបណ្តោយ',
    longitudinalCrack: 'ស្នាមប្រេះបណ្តោយ',
    transverseCrack: 'ស្នាមប្រេះទទឹង',
    alligatorCrack: 'ស្នាមប្រេះស្បែកក្រពើ',
    manholeHazard: 'គ្រោះថ្នាក់គម្របលូ',
    otherDefects: 'ពិការភាពផ្សេងៗ',
    vsLastMonth: 'ធៀបខែមុន',
    damageLocations: 'ទីតាំងខូចខាតផ្លូវ',
    recentDetections: 'ការចាប់បានថ្មីៗ',
    viewAll: 'មើលទាំងអស់',
    confidence: 'កម្រិតទំនុកចិត្ត',
    date: 'កាលបរិច្ឆេទ',
    location: 'ទីតាំង',
    viewDetails: 'មើលលម្អិត',
    saveToDb: 'រក្សាទុកក្នុងមូលដ្ឋានទិន្នន័យ',
    saved: 'បានរក្សាទុក!',
    retake: 'ថតម្តងទៀត',
    upload: 'ផ្ទុកឡើង',
    liveVision: 'កាមេរ៉ា AI ផ្ទាល់',
    startDetection: 'ចាប់ផ្តើមស្កេន',
    pauseDetection: 'ផ្អាកស្កេន',
    captureDefect: 'ចាប់យកពិការភាព',
    detectionResult: 'លទ្ធផលការចាប់ពិការភាព',
    type: 'ប្រភេទ',
    severity: 'កម្រិតគ្រោះថ្នាក់',
    status: 'ស្ថានភាព',
    depth: 'ជម្រៅប៉ាន់ស្មាន',
    area: 'ផ្ទៃក្រឡា',
    roadName: 'ខ្សែផ្លូវ/មហាវិថី',
    damageTypeDistribution: 'ការបែងចែកប្រភេទពិការភាព',
    monthlyDetections: 'ការរកឃើញប្រចាំខែ',
    exportReport: 'នាំចេញរបាយការណ៍',
    pdfReport: 'របាយការណ៍ PDF',
    csvData: 'ទិន្នន័យ CSV',
    imagesZip: 'រូបភាព (ZIP)',
    close: 'បិទ',
    language: 'ភាសា',
    english: 'English',
    khmer: 'ភាសាខ្មែរ',
    nightGis: 'ផែនទីរាត្រី GIS',
    streets: 'ផ្លូវថ្នល់',
    satellite: 'ផ្កាយរណប',
    gpsActive: 'ផ្កាយរណប GPS សកម្ម',
    visionEngine: 'ម៉ាស៊ីន AI',
    itcAdmin: 'រដ្ឋបាល ITC AgroRoad AI',
    critical: 'ធ្ងន់ធ្ងរ',
    moderate: 'មធ្យម',
    minor: 'ស្រាល',
    detected: 'ទើបចាប់បាន',
    inspected: 'បានត្រួតពិនិត្យ',
    scheduled: 'គ្រោងជួសជុល',
    repaired: 'បានជួសជុលរួច',
    phonePreview: 'ទិដ្ឋភាពទូរស័ព្ទ',
    deepEngineering: 'ការវាយតម្លៃវិស្វកម្មសំណង់ស៊ីវិល',
    evaluating: 'កំពុងវាយតម្លៃសំពាធផ្លូវ...',
    officialAudit: 'សវនកម្មផ្លូវថ្នល់រាជធានីផ្លូវការ',
    printPdf: 'បោះពុម្ព / រក្សាទុក PDF',
    phnomPenhPatrol: 'ល្បាតផ្លូវហាយវេភ្នំពេញ',
    deviceComputer: 'កុំព្យូទ័រ',
    deviceMobile: 'ទូរស័ព្ទដៃ',
    menu: 'ម៉ឺនុយ',
    collapseMenu: 'បិទម៉ឺនុយ',
    expandMenu: 'បើកម៉ឺនុយ',
    toolCamera: 'ឧបករណ៍កាមេរ៉ា',
    toolUpload: 'ឧបករណ៍ផ្ទុកឡើង',
    cameraLiveTool: 'កាមេរ៉ាស្កេន AI',
    uploadDamagePhoto: 'ផ្ទុកឡើងរូបថតផ្លូវខូច',
    turnOnCamera: 'បើកកាមេរ៉ាផ្ទាល់',
    switchCamera: 'ប្តូរកាមេរ៉ា',
    takeSnapshot: 'ចាប់យករូបផ្លូវខូច',
    dragAndDrop: 'ទម្លាក់រូបថតផ្លូវខូចនៅទីនេះ ឬជ្រើសរើសឯកសារ',
    analyzeDamage: 'វិភាគពិការភាពដោយ AI',
    uploadSuccess: 'បានវិភាគ និងរក្សាទុកក្នុងទិន្នន័យរួចរាល់!',
    cameraDenied: 'មិនអាចប្រើកាមេរ៉ាបាន ឬបដិសេធសិទ្ធិ។ កំពុងប្រើប្រាស់រូបភាពល្បាតកម្រិតច្បាស់ខ្ពស់។',
    videoInspection: 'ការត្រួតពិនិត្យវីដេអូ',
    sampleVideo: 'វីដេអូល្បាតភ្នំពេញ (គំរូ)',
    uploadVideo: 'ផ្ទុកឡើងវីដេអូ',
    trackedProblems: 'បញ្ហាដែលបានតាមដានក្នុងវីដេអូ',
    jumpToTime: 'លោតទៅនាទី',
    saveAllTracked: 'រក្សាទុកបញ្ហាទាំងអស់ក្នុងទិន្នន័យ',
    trackingNow: 'កំពុងតាមដានផ្ទាល់',
    speed: 'ល្បឿន',
  },
};
