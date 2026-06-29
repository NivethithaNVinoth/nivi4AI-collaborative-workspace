// workspace.mjs — Session-based artifact storage
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WS_ROOT = path.join(__dirname, '..', 'workspaces');

function projDir(pid) {
  const d = path.join(WS_ROOT, pid);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

function sessDir(pid) {
  const d = path.join(projDir(pid), 'sessions');
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

const slug = s => (s || 'artifact').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50);

// ═══════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════

export function createSession(pid, { intent = '', triggeredBy = '', steps = [] } = {}) {
  const ts = new Date();
  const datePart = ts.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = ts.toISOString().slice(11, 19).replace(/:/g, '');
  const rand = crypto.randomUUID().slice(0, 4);
  const sessionId = `sess_${datePart}_${timePart}_${rand}`;

  const data = {
    id: sessionId, projectId: pid, createdAt: ts.toISOString(),
    intent: intent.slice(0, 200), triggeredBy: triggeredBy.slice(0, 300),
    steps: steps.map(s => ({ ...s, artifactId: null, completedAt: null })),
    status: 'running', completedAt: null,
  };

  const dir = path.join(sessDir(pid), sessionId);
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, 'artifacts'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'session.json'), JSON.stringify(data, null, 2));
  return sessionId;
}

export function updateSession(pid, sessionId, updates = {}) {
  const file = path.join(sessDir(pid), sessionId, 'session.json');
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (updates.stepId !== undefined) {
    const step = data.steps.find(s => String(s.id) === String(updates.stepId));
    if (step) {
      if (updates.stepStatus) step.status = updates.stepStatus;
      if (updates.artifactId) step.artifactId = updates.artifactId;
      if (updates.stepStatus === 'done' || updates.stepStatus === 'error')
        step.completedAt = new Date().toISOString();
    }
  } else {
    if (updates.status) data.status = updates.status;
    if (updates.intent) data.intent = updates.intent;
    if (updates.status === 'completed' || updates.status === 'error')
      data.completedAt = new Date().toISOString();
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function listSessions(pid) {
  const dir = sessDir(pid);
  const out = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(dir, entry.name, 'session.json');
      if (!fs.existsSync(file)) continue;
      try { out.push(JSON.parse(fs.readFileSync(file, 'utf8'))); } catch {}
    }
  } catch {}
  return out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// ═══════════════════════════════════════════════════════════
// ARTIFACT MANAGEMENT
// ═══════════════════════════════════════════════════════════

function countExistingVersions(pid, skill) {
  try { return listArtifacts(pid).filter(a => a.skill === skill).length; }
  catch { return 0; }
}

export function writeArtifact(pid, {
  title, domain, skill, stage = 'discovery', content,
  createdBy = 'super-agent', sessionId = null,
}) {
  let dir;
  if (sessionId) {
    dir = path.join(sessDir(pid), sessionId, 'artifacts');
  } else {
    const STAGE_FOLDER = {
      ideation:'00_charter', discovery:'10_discovery', requirements:'20_requirements',
      planning:'30_planning', execution:'40_execution', change:'50_change', closure:'60_closure',
    };
    dir = path.join(projDir(pid), STAGE_FOLDER[stage] || '90_misc');
  }
  fs.mkdirSync(dir, { recursive: true });

  const version = countExistingVersions(pid, skill) + 1;
  const artifactId = 'art_' + crypto.randomUUID().slice(0, 6);
  const vSuffix = version > 1 ? `-v${version}` : '';
  const file = path.join(dir, `${slug(title)}${vSuffix}-${artifactId}.md`);

  const fm = [
    '---', `artifact_id: ${artifactId}`, `title: ${title}`, `domain: ${domain}`,
    `producing_skill: ${skill}`, `stage: ${stage}`, `status: draft`,
    `version: ${version}`, `created_by: ${createdBy}`, `created_at: ${new Date().toISOString()}`,
    ...(sessionId ? [`session_id: ${sessionId}`] : []),
    '---', '', content.trim(), '',
  ].join('\n');

  fs.writeFileSync(file, fm);
  return {
    artifactId, title, domain, skill, stage, status: 'draft', version, sessionId,
    path: path.relative(projDir(pid), file),
  };
}

export function listArtifacts(pid) {
  const root = projDir(pid);
  const out = [];
  const walk = dir => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.md')) {
        const raw = fs.readFileSync(full, 'utf8');
        const meta = {};
        const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
        if (m) for (const line of m[1].split('\n')) {
          const i = line.indexOf(':'); if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
        }
        if (!meta.artifact_id) continue;
        out.push({
          artifactId: meta.artifact_id, title: meta.title, domain: meta.domain,
          skill: meta.producing_skill, stage: meta.stage, status: meta.status,
          version: parseInt(meta.version || '1', 10),
          createdBy: meta.created_by, createdAt: meta.created_at,
          sessionId: meta.session_id || null,
          path: path.relative(root, full),
        });
      }
    }
  };
  try { walk(root); } catch {}
  const sorted = out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const latestBySkill = {};
  sorted.forEach(a => { if (!latestBySkill[a.skill]) latestBySkill[a.skill] = a.artifactId; });
  sorted.forEach(a => { a.isLatest = latestBySkill[a.skill] === a.artifactId; });
  return sorted;
}

export function readArtifact(pid, relPath) {
  const root = projDir(pid);
  const full = path.join(root, relPath);
  if (!full.startsWith(root)) throw new Error('invalid path');
  if (!fs.existsSync(full)) throw new Error('not found');
  return fs.readFileSync(full, 'utf8');
}

export function recentArtifactContext(pid, limit = 6) {
  return listArtifacts(pid).filter(a => a.isLatest).slice(0, limit).map(a => {
    let preview = '';
    try {
      const raw = readArtifact(pid, a.path).replace(/^---[\s\S]*?---\s*/, '');
      preview = raw.split('\n').filter(Boolean).slice(0, 3).join(' ').slice(0, 220);
    } catch {}
    return `- [${a.domain}/${a.skill}] ${a.title} v${a.version} (${a.status}): ${preview}`;
  }).join('\n');
}
