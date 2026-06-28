// Simple JSON-file persistence for projects, stakeholders, and the activity/event log.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ projects: [] }, null, 2));
}
function read() { ensure(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
function write(db) { ensure(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
const id = (p = '') => p + crypto.randomUUID().slice(0, 8);

export function listProjects() { return read().projects; }
export function getProject(pid) { return read().projects.find(p => p.id === pid); }

export function createProject({ name, description = '', owner = 'you@hsbc.com' }) {
  const db = read();
  const project = {
    id: id('proj_'),
    name, description, owner,
    stage: 'ideation',
    createdAt: new Date().toISOString(),
    stakeholders: [{ email: owner, role: 'owner', addedAt: new Date().toISOString() }],
    events: [],
  };
  db.projects.unshift(project);
  write(db);
  return project;
}

export function addStakeholder(pid, { email, role = 'stakeholder' }) {
  const db = read();
  const p = db.projects.find(x => x.id === pid);
  if (!p) throw new Error('project not found');
  if (p.stakeholders.some(s => s.email.toLowerCase() === email.toLowerCase()))
    return p; // idempotent
  p.stakeholders.push({ email, role, addedAt: new Date().toISOString() });
  write(db);
  return p;
}

export function removeStakeholder(pid, email) {
  const db = read();
  const p = db.projects.find(x => x.id === pid);
  if (!p) throw new Error('project not found');
  p.stakeholders = p.stakeholders.filter(s => s.email.toLowerCase() !== email.toLowerCase());
  write(db);
  return p;
}

export function logEvent(pid, event) {
  const db = read();
  const p = db.projects.find(x => x.id === pid);
  if (!p) return;
  p.events.unshift({ id: id('evt_'), at: new Date().toISOString(), ...event });
  p.events = p.events.slice(0, 200);
  write(db);
}

export function setStage(pid, stage) {
  const db = read();
  const p = db.projects.find(x => x.id === pid);
  if (!p) return;
  p.stage = stage; write(db);
}
