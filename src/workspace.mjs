// Workspace artifacts: each project has a folder tree; artifacts are markdown files
// with front-matter metadata so the collaboration layer and skills can reason about them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WS_ROOT = path.join(__dirname, '..', 'workspaces');

const STAGE_FOLDER = {
  ideation: '00_charter',
  discovery: '10_discovery',
  requirements: '20_requirements',
  planning: '30_planning',
  execution: '40_execution',
  change: '50_change',
  closure: '60_closure',
};

function projDir(pid) {
  const d = path.join(WS_ROOT, pid);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}
const slug = s => (s || 'artifact').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50);

export function writeArtifact(pid, { title, domain, skill, stage = 'discovery', content, createdBy = 'super-agent' }) {
  const folder = STAGE_FOLDER[stage] || '90_misc';
  const dir = path.join(projDir(pid), folder);
  fs.mkdirSync(dir, { recursive: true });
  const artifactId = 'art_' + crypto.randomUUID().slice(0, 6);
  const file = path.join(dir, `${slug(title)}-${artifactId}.md`);
  const fm = [
    '---',
    `artifact_id: ${artifactId}`,
    `title: ${title}`,
    `domain: ${domain}`,
    `producing_skill: ${skill}`,
    `stage: ${stage}`,
    `status: draft`,
    `version: 1`,
    `created_by: ${createdBy}`,
    `created_at: ${new Date().toISOString()}`,
    '---',
    '',
    content.trim(),
    '',
  ].join('\n');
  fs.writeFileSync(file, fm);
  return { artifactId, title, domain, skill, stage, status: 'draft', path: path.relative(projDir(pid), file), folder };
}

export function listArtifacts(pid) {
  const root = projDir(pid);
  const out = [];
  const walk = dir => {
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
        out.push({
          artifactId: meta.artifact_id, title: meta.title, domain: meta.domain,
          skill: meta.producing_skill, stage: meta.stage, status: meta.status,
          createdBy: meta.created_by, createdAt: meta.created_at,
          path: path.relative(root, full),
        });
      }
    }
  };
  walk(root);
  return out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function readArtifact(pid, relPath) {
  const full = path.join(projDir(pid), relPath);
  if (!full.startsWith(projDir(pid))) throw new Error('invalid path');
  if (!fs.existsSync(full)) throw new Error('not found');
  return fs.readFileSync(full, 'utf8');
}

// Recent artifacts as compact context for the domain agents (titles + first lines).
export function recentArtifactContext(pid, limit = 6) {
  return listArtifacts(pid).slice(0, limit).map(a => {
    let preview = '';
    try {
      const raw = readArtifact(pid, a.path).replace(/^---[\s\S]*?---\s*/, '');
      preview = raw.split('\n').filter(Boolean).slice(0, 3).join(' ').slice(0, 220);
    } catch { /* ignore */ }
    return `- [${a.domain}/${a.skill}] ${a.title} (${a.status}): ${preview}`;
  }).join('\n');
}
