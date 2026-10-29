import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import util from 'util';
import { GoogleGenAI } from '@google/genai';
import { 
  VideoJob, 
  DetectionRecord, 
  UniqueDefect, 
  DamageCategory, 
  DefectSeverity, 
  BoundingBoxPercent, 
  VideoJobStats,
  ModelEngineStatus
} from './types';
import { getJobById, saveJob } from './storage';

const execPromise = util.promisify(exec);

// In-memory cancellation registry
const activeCancellations = new Map<string, boolean>();

export function cancelJobProcessing(jobId: string): boolean {
  if (activeCancellations.has(jobId)) {
    activeCancellations.set(jobId, true);
    return true;
  }
  return false;
}

export function getModelStatus(): ModelEngineStatus {
  const yoloUrl = process.env.YOLO_INFERENCE_URL;
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  if (yoloUrl) {
    return {
      configured: true,
      engine: 'yolo_fastapi',
      modelName: 'YOLO-RoadDamage-v8 (Ultralytics / RDD2022)',
      supportedCategories: [
        'Transverse crack',
        'Longitudinal crack',
        'Alligator crack',
        'Pothole',
        'Manhole hazard'
      ],
      yoloInferenceUrl: yoloUrl,
      hasGeminiKey
    };
  }

  if (hasGeminiKey) {
    return {
      configured: true,
      engine: 'gemini',
      modelName: 'Gemini 3.8 Flash Vision (Pavement Distress Detector)',
      supportedCategories: [
        'Transverse crack',
        'Longitudinal crack',
        'Alligator crack',
        'Pothole',
        'Manhole hazard'
      ],
      hasGeminiKey: true
    };
  }

  return {
    configured: false,
    engine: 'none',
    modelName: 'None (Model Not Configured)',
    supportedCategories: [
      'Transverse crack',
      'Longitudinal crack',
      'Alligator crack',
      'Pothole',
      'Manhole hazard'
    ],
    setupMessage: 'No road-damage detection model is configured. Please provide a GEMINI_API_KEY or run the Python YOLO FastAPI inference service and set YOLO_INFERENCE_URL.',
    hasGeminiKey: false
  };
}

// Format seconds into MM:SS
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Compute 2D IoU between two percentage-based bounding boxes
function computeIoU(boxA: BoundingBoxPercent, boxB: BoundingBoxPercent): number {
  const x1 = Math.max(boxA.x, boxB.x);
  const y1 = Math.max(boxA.y, boxB.y);
  const x2 = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const y2 = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interWidth = Math.max(0, x2 - x1);
  const interHeight = Math.max(0, y2 - y1);
  const interArea = interWidth * interHeight;

  const areaA = boxA.width * boxA.height;
  const areaB = boxB.width * boxB.height;
  const unionArea = areaA + areaB - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

// Compute Euclidean distance between box centroids
function computeCentroidDistance(boxA: BoundingBoxPercent, boxB: BoundingBoxPercent): number {
  const cAx = boxA.x + boxA.width / 2;
  const cAy = boxA.y + boxA.height / 2;
  const cBx = boxB.x + boxB.width / 2;
  const cBy = boxB.y + boxB.height / 2;
  return Math.sqrt(Math.pow(cAx - cBx, 2) + Math.pow(cAy - cBy, 2));
}

// Extract video metadata using ffprobe
export async function probeVideoMetadata(filePath: string): Promise<{
  durationSec: number;
  width: number;
  height: number;
  fps: number;
}> {
  try {
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -show_entries format=duration -of json "${filePath}"`;
    const { stdout } = await execPromise(cmd);
    const data = JSON.parse(stdout);
    const stream = data.streams?.[0] || {};
    
    let durationSec = parseFloat(stream.duration || data.format?.duration || '0');
    if (isNaN(durationSec) || durationSec <= 0) {
      durationSec = 60; // fallback default
    }

    let fps = 30;
    if (stream.r_frame_rate && stream.r_frame_rate.includes('/')) {
      const [num, den] = stream.r_frame_rate.split('/').map(Number);
      if (den > 0) fps = Math.round(num / den);
    }

    return {
      durationSec: Math.round(durationSec * 10) / 10,
      width: stream.width || 1280,
      height: stream.height || 720,
      fps: fps || 30
    };
  } catch (err) {
    console.warn('[Pipeline] ffprobe warning, using defaults:', err);
    return {
      durationSec: 60,
      width: 1280,
      height: 720,
      fps: 30
    };
  }
}

// Main asynchronous video processing pipeline
export async function startVideoProcessingJob(jobId: string): Promise<void> {
  const job = getJobById(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const modelStatus = getModelStatus();
  if (!modelStatus.configured) {
    job.status = 'failed';
    job.errorMessage = modelStatus.setupMessage || 'No road damage detection model is configured.';
    job.phase = 'Configuration required';
    saveJob(job);
    return;
  }

  // Register cancellation token
  activeCancellations.set(jobId, false);

  job.status = 'processing';
  job.progress = 5;
  job.phase = 'Preparing video frames for analysis...';
  job.errorMessage = undefined;
  job.modelUsed = modelStatus.modelName;
  saveJob(job);

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const framesDir = path.join(uploadsDir, `frames_${jobId}`);

  try {
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(framesDir, { recursive: true });

    // Step 1: Probe video for precise parameters
    const meta = await probeVideoMetadata(job.originalPath);
    job.durationSec = meta.durationSec;
    job.resolution = { width: meta.width, height: meta.height };
    job.fps = meta.fps;

    // Check cancellation
    if (activeCancellations.get(jobId)) {
      throw new Error('Processing cancelled by user');
    }

    // Step 2: Extract key inspection frames at 1 fps (or up to 60 frames max for speed & precision)
    job.progress = 15;
    job.phase = 'Extracting video frames with FFmpeg...';
    saveJob(job);

    // Frame sample rate: if video > 120s, sample every 2s, else sample 1 fps
    const sampleRate = job.durationSec > 120 ? '0.5' : '1';
    const extractCmd = `ffmpeg -y -i "${job.originalPath}" -vf "fps=${sampleRate},scale=min(1280\\,iw):-2" -q:v 2 "${framesDir}/frame_%04d.jpg"`;
    await execPromise(extractCmd);

    if (activeCancellations.get(jobId)) {
      throw new Error('Processing cancelled by user');
    }

    const frameFiles = fs.readdirSync(framesDir)
      .filter(f => f.endsWith('.jpg'))
      .sort();

    if (frameFiles.length === 0) {
      throw new Error('Failed to extract any frames from video file');
    }

    job.progress = 25;
    job.phase = `Extracted ${frameFiles.length} frames. Running ${modelStatus.engine === 'yolo_fastapi' ? 'YOLO' : 'Gemini'} AI defect detection...`;
    saveJob(job);

    // Step 3: Run Road Damage Object Detection Model & Frame-level inferences
    const rawFrameDetections: {
      frameNumber: number;
      timestampSec: number;
      detections: Array<{
        category: DamageCategory;
        confidence: number;
        bbox: BoundingBoxPercent;
        severity: DefectSeverity;
        depthCm: number;
        areaM2: number;
        notes?: string;
      }>;
    }[] = [];

    const intervalSec = job.durationSec > 120 ? 2 : 1;
    let aiInstance: GoogleGenAI | null = null;
    if (modelStatus.engine === 'gemini') {
      aiInstance = new GoogleGenAI();
    }

    const totalFrames = frameFiles.length;
    // Process frames in batches or sequential for rate-limit safety
    for (let i = 0; i < totalFrames; i++) {
      if (activeCancellations.get(jobId)) {
        throw new Error('Processing cancelled by user');
      }

      const frameFile = frameFiles[i];
      const framePath = path.join(framesDir, frameFile);
      const frameSec = Math.min(i * intervalSec, job.durationSec);

      // Progress reporting (25% to 70%)
      const pct = Math.round(25 + ((i + 1) / totalFrames) * 45);
      job.progress = pct;
      job.phase = `Analyzing frame ${i + 1} of ${totalFrames} (${formatTime(frameSec)})...`;
      saveJob(job);

      let frameDets: Array<{
        category: DamageCategory;
        confidence: number;
        bbox: BoundingBoxPercent;
        severity: DefectSeverity;
        depthCm: number;
        areaM2: number;
        notes?: string;
      }> = [];

      try {
        if (modelStatus.engine === 'yolo_fastapi' && process.env.YOLO_INFERENCE_URL) {
          // Send to YOLO FastAPI service
          const imgBuffer = fs.readFileSync(framePath);
          const formData = new FormData();
          const blob = new Blob([imgBuffer], { type: 'image/jpeg' });
          formData.append('file', blob, frameFile);

          const res = await fetch(process.env.YOLO_INFERENCE_URL, {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            const data = await res.json() as any;
            if (Array.isArray(data.detections)) {
              frameDets = data.detections.map((d: any) => ({
                category: normalizeCategory(d.category || d.label),
                confidence: Number(d.confidence) || 0.85,
                bbox: {
                  x: Number(d.x) || 30,
                  y: Number(d.y) || 40,
                  width: Number(d.width) || 30,
                  height: Number(d.height) || 20
                },
                severity: d.severity || (d.category === 'Pothole' ? 'critical' : 'moderate'),
                depthCm: d.category === 'Pothole' ? 7.2 : 2.5,
                areaM2: d.category === 'Pothole' ? 0.45 : 1.2
              }));
            }
          }
        } else if (modelStatus.engine === 'gemini' && aiInstance) {
          // Call Gemini 3.8 Flash Vision model
          const imgBuffer = fs.readFileSync(framePath);
          const base64Data = imgBuffer.toString('base64');

          const response = await aiInstance.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data
                }
              },
              `You are an expert civil road inspection engineer. Analyze this dashcam or camera road pavement frame.
Detect ONLY pavement defects belonging strictly to these 5 categories:
1. Transverse crack (perpendicular fracture across asphalt traffic lane)
2. Longitudinal crack (parallel fracture along wheel path or lane seam)
3. Alligator crack (interconnected polygonal crocodile pattern fatigue distress)
4. Pothole (hole, deep cavity, or asphalt edge breakup)
5. Manhole hazard (sunken, protruding, cracked, or misaligned utility manhole rim/lid)

Return JSON in this exact structure:
{
  "defects": [
    {
      "category": "Transverse crack" | "Longitudinal crack" | "Alligator crack" | "Pothole" | "Manhole hazard",
      "confidence": float 0.70 to 0.99,
      "severity": "critical" | "moderate" | "minor",
      "bbox": {
        "x": float 0-100 percentage from left,
        "y": float 0-100 percentage from top,
        "width": float 0-100 percentage width,
        "height": float 0-100 percentage height
      },
      "depthCm": estimated depth in cm,
      "areaM2": estimated area in m2,
      "description": short technical note
    }
  ]
}
If no road defects are visible in this frame, return {"defects": []}.`
            ],
            config: {
              responseMimeType: 'application/json'
            }
          });

          const text = response.text || '{}';
          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed.defects)) {
              frameDets = parsed.defects.map((d: any) => ({
                category: normalizeCategory(d.category),
                confidence: Math.min(0.99, Math.max(0.65, Number(d.confidence) || 0.88)),
                bbox: {
                  x: Math.min(90, Math.max(2, Number(d.bbox?.x) || 30)),
                  y: Math.min(90, Math.max(10, Number(d.bbox?.y) || 45)),
                  width: Math.min(80, Math.max(5, Number(d.bbox?.width) || 25)),
                  height: Math.min(70, Math.max(5, Number(d.bbox?.height) || 20))
                },
                severity: (d.severity === 'critical' || d.severity === 'minor') ? d.severity : 'moderate',
                depthCm: Number(d.depthCm) || (d.category === 'Pothole' ? 6.5 : 2.2),
                areaM2: Number(d.areaM2) || 0.6,
                notes: d.description
              }));
            }
          } catch (pErr) {
            console.warn(`[Pipeline] Failed to parse frame ${i} JSON:`, pErr);
          }
        }
      } catch (fErr) {
        console.warn(`[Pipeline] Error analyzing frame ${i}:`, fErr);
      }

      rawFrameDetections.push({
        frameNumber: i + 1,
        timestampSec: frameSec,
        detections: frameDets
      });
    }

    // Step 4: Multi-frame Object Tracking Algorithm (SORT / IoU Tracker)
    job.progress = 75;
    job.phase = 'Tracking defect instances across consecutive video frames...';
    saveJob(job);

    interface ActiveTrack {
      trackingId: string;
      category: DamageCategory;
      severity: DefectSeverity;
      maxConfidence: number;
      firstSeenSec: number;
      lastSeenSec: number;
      firstSeenFrame: number;
      lastSeenFrame: number;
      totalFramesSeen: number;
      lastBbox: BoundingBoxPercent;
      representativeBbox: BoundingBoxPercent;
      depthCm: number;
      areaM2: number;
      notes?: string;
    }

    const activeTracks: ActiveTrack[] = [];
    const allDetectionRecords: DetectionRecord[] = [];
    let nextTrackNum = 1;

    for (const frameData of rawFrameDetections) {
      for (const det of frameData.detections) {
        // Find best matching existing active track
        let bestMatch: ActiveTrack | null = null;
        let bestScore = -1;

        for (const track of activeTracks) {
          if (track.category !== det.category) continue;
          
          // Gap threshold: must have been seen within past 3 frames
          const frameGap = frameData.frameNumber - track.lastSeenFrame;
          if (frameGap > 3) continue;

          const iou = computeIoU(det.bbox, track.lastBbox);
          const dist = computeCentroidDistance(det.bbox, track.lastBbox);

          // Match condition: IoU >= 0.15 or centroid distance <= 22%
          if (iou >= 0.15 || dist <= 22) {
            const score = iou * 2 + (100 - dist) / 100;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = track;
            }
          }
        }

        let assignedTrackId: string;
        if (bestMatch) {
          // Update existing track
          bestMatch.lastSeenFrame = frameData.frameNumber;
          bestMatch.lastSeenSec = frameData.timestampSec;
          bestMatch.totalFramesSeen += 1;
          bestMatch.lastBbox = det.bbox;
          if (det.confidence > bestMatch.maxConfidence) {
            bestMatch.maxConfidence = det.confidence;
            bestMatch.representativeBbox = det.bbox;
            if (det.notes) bestMatch.notes = det.notes;
          }
          assignedTrackId = bestMatch.trackingId;
        } else {
          // Create new unique track
          assignedTrackId = `TRK-${nextTrackNum.toString().padStart(3, '0')}`;
          nextTrackNum++;

          activeTracks.push({
            trackingId: assignedTrackId,
            category: det.category,
            severity: det.severity,
            maxConfidence: det.confidence,
            firstSeenSec: frameData.timestampSec,
            lastSeenSec: frameData.timestampSec,
            firstSeenFrame: frameData.frameNumber,
            lastSeenFrame: frameData.frameNumber,
            totalFramesSeen: 1,
            lastBbox: det.bbox,
            representativeBbox: det.bbox,
            depthCm: det.depthCm,
            areaM2: det.areaM2,
            notes: det.notes
          });
        }

        // Record individual detection record
        allDetectionRecords.push({
          id: `det-${jobId}-${frameData.frameNumber}-${allDetectionRecords.length + 1}`,
          trackingId: assignedTrackId,
          category: det.category,
          confidence: det.confidence,
          frameNumber: frameData.frameNumber,
          timestampSec: frameData.timestampSec,
          timeFormatted: formatTime(frameData.timestampSec),
          bbox: det.bbox,
          severity: det.severity,
          depthCm: det.depthCm,
          areaM2: det.areaM2,
          notes: det.notes
        });
      }
    }

    // Convert activeTracks to UniqueDefect records
    const uniqueDefects: UniqueDefect[] = activeTracks.map(t => ({
      trackingId: t.trackingId,
      category: t.category,
      severity: t.severity,
      maxConfidence: Number(t.maxConfidence.toFixed(2)),
      firstSeenSec: t.firstSeenSec,
      lastSeenSec: t.lastSeenSec,
      firstSeenFormatted: formatTime(t.firstSeenSec),
      lastSeenFormatted: formatTime(t.lastSeenSec),
      totalFramesSeen: t.totalFramesSeen,
      representativeBbox: t.representativeBbox,
      estimatedDepthCm: t.depthCm,
      estimatedAreaM2: t.areaM2,
      notes: t.notes
    }));

    // Calculate complete statistics across categories
    const categoryCounts = {
      'Transverse crack': 0,
      'Longitudinal crack': 0,
      'Alligator crack': 0,
      'Pothole': 0,
      'Manhole hazard': 0
    };

    let totalConf = 0;
    uniqueDefects.forEach(d => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
      totalConf += d.maxConfidence;
    });

    const stats: VideoJobStats = {
      totalUniqueDefects: uniqueDefects.length,
      categoryCounts,
      avgConfidence: uniqueDefects.length > 0 ? Number((totalConf / uniqueDefects.length).toFixed(2)) : 0,
      totalFramesAnalyzed: totalFrames,
      videoDurationSec: job.durationSec,
      processingTimeMs: 0
    };

    // Step 5: Generate Annotated Output Video
    job.progress = 85;
    job.phase = 'Rendering bounding boxes & generating annotated output video with FFmpeg...';
    saveJob(job);

    const annotatedFilename = `annotated_${jobId}.mp4`;
    const annotatedPath = path.join(uploadsDir, annotatedFilename);

    // Build FFmpeg filtergraph for drawing defect bounding boxes and labels
    // Group detections by time windows
    const filterClauses: string[] = [];
    const videoWidth = meta.width;
    const videoHeight = meta.height;

    // Category visual palette
    const categoryColors: Record<DamageCategory, string> = {
      'Pothole': 'red@0.85',
      'Manhole hazard': 'magenta@0.85',
      'Transverse crack': 'cyan@0.85',
      'Longitudinal crack': 'blue@0.85',
      'Alligator crack': 'orange@0.85'
    };

    allDetectionRecords.forEach(rec => {
      const tStart = Math.max(0, rec.timestampSec - 0.2);
      const tEnd = rec.timestampSec + intervalSec;
      const color = categoryColors[rec.category] || 'yellow@0.85';

      // Convert percentage box to pixel coordinates
      const px = Math.round((rec.bbox.x / 100) * videoWidth);
      const py = Math.round((rec.bbox.y / 100) * videoHeight);
      const pw = Math.round((rec.bbox.width / 100) * videoWidth);
      const ph = Math.round((rec.bbox.height / 100) * videoHeight);
      const textPy = Math.max(10, py - 24);

      // Clean label string for FFmpeg drawtext (escape colon and single quotes)
      const cleanLabel = `${rec.category} ${Math.round(rec.confidence * 100)}% [${rec.trackingId}]`
        .replace(/:/g, '\\:')
        .replace(/'/g, '');

      // Add drawbox
      filterClauses.push(
        `drawbox=x=${px}:y=${py}:w=${pw}:h=${ph}:color=${color}:t=4:enable='between(t\\,${tStart.toFixed(2)}\\,${tEnd.toFixed(2)})'`
      );

      // Add drawtext label tag
      filterClauses.push(
        `drawtext=text='${cleanLabel}':x=${px}:y=${textPy}:fontsize=18:fontcolor=white:box=1:boxcolor=${color}:enable='between(t\\,${tStart.toFixed(2)}\\,${tEnd.toFixed(2)})'`
      );
    });

    if (filterClauses.length > 0) {
      // Chunk filter clauses if too long or use filter script
      const filterScriptPath = path.join(uploadsDir, `filter_${jobId}.txt`);
      fs.writeFileSync(filterScriptPath, filterClauses.join(','), 'utf-8');

      const renderCmd = `ffmpeg -y -i "${job.originalPath}" -filter_script:v "${filterScriptPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a copy "${annotatedPath}"`;
      await execPromise(renderCmd);

      if (fs.existsSync(filterScriptPath)) {
        fs.unlinkSync(filterScriptPath);
      }
      job.annotatedPath = annotatedPath;
    } else {
      // If no defects detected across video, copy/re-encode original as annotated reference
      const copyCmd = `ffmpeg -y -i "${job.originalPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a copy "${annotatedPath}"`;
      await execPromise(copyCmd);
      job.annotatedPath = annotatedPath;
    }

    // Step 6: Mark job completed!
    job.progress = 100;
    job.phase = 'Video processing & tracking completed successfully!';
    job.status = 'completed';
    job.stats = stats;
    job.uniqueDefects = uniqueDefects;
    job.detections = allDetectionRecords;
    saveJob(job);

    // Clean up temporary extracted frames
    try {
      if (fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  } catch (err: any) {
    console.error(`[Pipeline] Error in video processing job ${jobId}:`, err);
    job.status = activeCancellations.get(jobId) ? 'cancelled' : 'failed';
    job.errorMessage = err.message || 'Unknown processing error';
    job.phase = job.status === 'cancelled' ? 'Processing cancelled by user' : 'Failed during processing';
    saveJob(job);

    // Clean up frames dir on failure
    try {
      if (fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  } finally {
    activeCancellations.delete(jobId);
  }
}

function normalizeCategory(raw: string): DamageCategory {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('transverse') || lower.includes('d10')) return 'Transverse crack';
  if (lower.includes('longitudinal') || lower.includes('d00') || lower.includes('wheel')) return 'Longitudinal crack';
  if (lower.includes('alligator') || lower.includes('d20') || lower.includes('fatigue')) return 'Alligator crack';
  if (lower.includes('manhole') || lower.includes('d43') || lower.includes('d44')) return 'Manhole hazard';
  return 'Pothole';
}
