import fs from 'fs';
import path from 'path';
import { VideoJob } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(JOBS_FILE)) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

export function getAllJobs(): VideoJob[] {
  try {
    if (!fs.existsSync(JOBS_FILE)) return [];
    const content = fs.readFileSync(JOBS_FILE, 'utf-8');
    return JSON.parse(content || '[]') as VideoJob[];
  } catch (err) {
    console.error('[Storage] Error reading jobs:', err);
    return [];
  }
}

export function getJobById(id: string): VideoJob | undefined {
  const jobs = getAllJobs();
  return jobs.find(j => j.id === id);
}

export function saveJob(job: VideoJob): void {
  const jobs = getAllJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  job.updatedAt = new Date().toISOString();
  if (index >= 0) {
    jobs[index] = job;
  } else {
    jobs.unshift(job);
  }
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

export function deleteJob(id: string): boolean {
  const jobs = getAllJobs();
  const target = jobs.find(j => j.id === id);
  if (!target) return false;

  const filtered = jobs.filter(j => j.id !== id);
  fs.writeFileSync(JOBS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');

  // Also remove physical files if they exist
  try {
    if (target.originalPath && fs.existsSync(target.originalPath) && !target.originalPath.includes('public/videos')) {
      fs.unlinkSync(target.originalPath);
    }
    if (target.annotatedPath && fs.existsSync(target.annotatedPath)) {
      fs.unlinkSync(target.annotatedPath);
    }
  } catch (err) {
    console.warn('[Storage] Error cleaning job files:', err);
  }
  return true;
}
