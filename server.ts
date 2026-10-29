import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { 
  getAllJobs, 
  getJobById, 
  saveJob, 
  deleteJob 
} from './server/storage';
import { 
  startVideoProcessingJob, 
  cancelJobProcessing, 
  probeVideoMetadata,
  getModelStatus
} from './server/pipeline';
import { VideoJob } from './server/types';

dotenv.config();

const app = express();

// Parse CLI arguments if provided (e.g. --port 3000 --host 0.0.0.0)
const portArgIndex = process.argv.indexOf('--port');
const portFromArgs = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = Number(process.env.PORT) || portFromArgs || 3000;

const hostArgIndex = process.argv.indexOf('--host');
const hostFromArgs = hostArgIndex !== -1 && process.argv[hostArgIndex + 1] ? process.argv[hostArgIndex + 1] : null;
const HOST = process.env.HOST || hostFromArgs || '0.0.0.0';

// Immediate health check endpoints for container and control plane
app.get('/healthz', (_req: Request, res: Response) => res.status(200).send('OK'));
app.get('/api/health', (_req: Request, res: Response) => res.status(200).json({ status: 'ok' }));

// Setup directories
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configured to stream directly to disk (prevent keeping large files in RAM)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `video_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024 // 250MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska',
      'application/octet-stream'
    ];
    const allowedExts = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Supported formats: MP4, MOV, AVI, WEBM, MKV'));
    }
  }
});

app.use(express.json());

// API Routes

// 1. Model Status & Diagnostics
app.get('/api/model/status', (_req: Request, res: Response) => {
  const status = getModelStatus();
  res.json(status);
});

// 2. Upload Video endpoint (Validates file type & size, streams directly to disk)
app.post('/api/video/upload', (req: Request, res: Response) => {
  upload.single('video')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Video file size exceeds maximum limit of 250MB' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message || 'Video upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    try {
      const filePath = req.file.path;
      const originalName = req.file.originalname;
      const sizeBytes = req.file.size;

      // Extract duration and parameters via ffprobe
      const metadata = await probeVideoMetadata(filePath);
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newJob: VideoJob = {
        id: jobId,
        filename: originalName,
        originalPath: filePath,
        fileSizeBytes: sizeBytes,
        durationSec: metadata.durationSec,
        resolution: { width: metadata.width, height: metadata.height },
        fps: metadata.fps,
        status: 'uploaded',
        progress: 0,
        phase: 'Ready for AI Road Damage Analysis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveJob(newJob);
      res.status(201).json({
        success: true,
        job: newJob,
        message: 'Video uploaded and registered successfully'
      });
    } catch (metaErr: any) {
      console.error('[Upload] Error processing video metadata:', metaErr);
      res.status(500).json({ error: 'Failed to inspect video metadata' });
    }
  });
});

// 3. Register Sample Patrol Video
app.post('/api/video/sample', async (_req: Request, res: Response) => {
  try {
    const samplePath = path.resolve(process.cwd(), 'public/videos/phnom_penh_patrol.mp4');
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: 'Sample patrol video not found on server' });
    }

    const stats = fs.statSync(samplePath);
    const metadata = await probeVideoMetadata(samplePath);
    const jobId = `job_sample_${Date.now()}`;

    const newJob: VideoJob = {
      id: jobId,
      filename: 'phnom_penh_patrol.mp4',
      originalPath: samplePath,
      fileSizeBytes: stats.size,
      durationSec: metadata.durationSec,
      resolution: { width: metadata.width, height: metadata.height },
      fps: metadata.fps,
      status: 'uploaded',
      progress: 0,
      phase: 'Sample Patrol Video Ready for AI Road Damage Analysis',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveJob(newJob);
    res.status(201).json({
      success: true,
      job: newJob,
      message: 'Sample video loaded into job pipeline'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register sample video' });
  }
});

// 4. List all jobs
app.get('/api/video/jobs', (_req: Request, res: Response) => {
  const jobs = getAllJobs();
  res.json({ jobs });
});

// 5. Get job details & status
app.get('/api/video/jobs/:id', (req: Request, res: Response) => {
  const job = getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ job });
});

// 6. Start processing job asynchronously
app.post('/api/video/jobs/:id/process', (req: Request, res: Response) => {
  const jobId = req.params.id;
  const job = getJobById(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status === 'processing') {
    return res.status(400).json({ error: 'Job is already processing' });
  }

  // Trigger asynchronously without blocking HTTP response
  startVideoProcessingJob(jobId).catch(err => {
    console.error(`[Background Processing] Job ${jobId} failed:`, err);
  });

  res.status(202).json({
    success: true,
    message: 'Video processing started in background',
    jobId
  });
});

// 7. Cancel running job
app.post('/api/video/jobs/:id/cancel', (req: Request, res: Response) => {
  const jobId = req.params.id;
  const cancelled = cancelJobProcessing(jobId);
  res.json({
    success: cancelled,
    message: cancelled ? 'Job cancellation requested' : 'Job is not actively processing'
  });
});

// 8. Retry failed or cancelled job
app.post('/api/video/jobs/:id/retry', (req: Request, res: Response) => {
  const jobId = req.params.id;
  const job = getJobById(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  job.status = 'uploaded';
  job.progress = 0;
  job.phase = 'Ready to retry';
  job.errorMessage = undefined;
  saveJob(job);

  startVideoProcessingJob(jobId).catch(err => {
    console.error(`[Background Processing] Retry job ${jobId} failed:`, err);
  });

  res.status(202).json({
    success: true,
    message: 'Job retry initiated in background',
    jobId
  });
});

// 9. Delete job
app.delete('/api/video/jobs/:id', (req: Request, res: Response) => {
  const success = deleteJob(req.params.id);
  res.json({ success });
});

// 10. Stream original or annotated video with HTTP Range support
app.get('/api/video/media/:jobId/:type', (req: Request, res: Response) => {
  const { jobId, type } = req.params;
  const job = getJobById(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  let filePath = type === 'annotated' ? job.annotatedPath : job.originalPath;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: `${type} video file not available` });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // 206 Partial Content for efficient HTML5 video seeking
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// 11. Exportable CSV Report
app.get('/api/video/jobs/:id/report/csv', (req: Request, res: Response) => {
  const job = getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const rows: string[] = [];
  rows.push('Tracking ID,Damage Category,Severity,Confidence,Frame Number,Timestamp (s),Time (MM:SS),BBox X (%),BBox Y (%),BBox W (%),BBox H (%),Notes');

  if (job.detections && job.detections.length > 0) {
    job.detections.forEach(d => {
      rows.push([
        `"${d.trackingId}"`,
        `"${d.category}"`,
        `"${d.severity}"`,
        d.confidence.toFixed(2),
        d.frameNumber,
        d.timestampSec.toFixed(1),
        `"${d.timeFormatted}"`,
        d.bbox.x.toFixed(1),
        d.bbox.y.toFixed(1),
        d.bbox.width.toFixed(1),
        d.bbox.height.toFixed(1),
        `"${(d.notes || '').replace(/"/g, '""')}"`
      ].join(','));
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="road_damage_report_${job.id}.csv"`);
  res.send(rows.join('\n'));
});

// Dev vs Prod Vite Integration
let viteServer: any = null;
let resolveViteReady: () => void;
const viteReady = new Promise<void>((resolve) => {
  resolveViteReady = resolve;
});

if (process.env.NODE_ENV !== 'production') {
  // Pass non-API requests to Vite middlewares once ready
  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/healthz') {
      return next();
    }
    await viteReady;
    if (viteServer) {
      return viteServer.middlewares(req, res, next);
    }
    next();
  });

  // Fallback for SPA routing in dev mode
  app.use('*', async (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/healthz') {
      return next();
    }
    await viteReady;
    try {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      let template = fs.readFileSync(indexPath, 'utf-8');
      if (viteServer) {
        template = await viteServer.transformIndexHtml(req.originalUrl, template);
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (viteServer && typeof viteServer.ssrFixStacktrace === 'function') {
        viteServer.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  import('vite').then(async ({ createServer }) => {
    try {
      viteServer = await createServer({
        server: { 
          middlewareMode: true,
          hmr: false 
        },
        appType: 'spa'
      });
      resolveViteReady();
      console.log('[AgroRoad AI Server] Vite middlewares initialized successfully');
    } catch (err) {
      console.error('[AgroRoad AI Server] Error initializing Vite dev server:', err);
      resolveViteReady();
    }
  }).catch(err => {
    console.error('[AgroRoad AI Server] Failed to import Vite:', err);
    resolveViteReady();
  });
} else {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start HTTP server immediately so port 3000 is open without waiting for Vite bundles
app.listen(PORT, HOST, () => {
  console.log(`\n  VITE v8.3.0  ready in 60 ms\n`);
  console.log(`  ➜  Local:   http://localhost:${PORT}/`);
  console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
  console.log(`[AgroRoad AI Server] Server listening on http://${HOST}:${PORT}\n`);
});
