import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODE, MODEL } from './anthropic.mjs';
import { loadSkills, DOMAINS } from './skills.mjs';
import { listProjects, getProject, createProject, addStakeholder, removeStakeholder } from './store.mjs';
import { listArtifacts, readArtifact } from './workspace.mjs';
import { runSuperAgent } from './superAgent.mjs';
import {
  assignArtifact, submitReview, getWorkflow,
  getMyTasks, getItemByArtifact,
} from './workflow.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const wrap = fn => (req, res) => Promise.resolve(fn(req, res)).catch(e => {
  console.error(e); res.status(500).json({ error: e.message });
});

// ── health / meta ──────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: MODE, model: MODEL }));

app.get('/api/meta', (_req, res) => {
  const skills = loadSkills().map(s => ({ name: s.name, domain: s.domain, description: s.description, when_to_use: s.when_to_use }));
  res.json({ mode: MODE, model: MODEL, domains: DOMAINS, skills });
});

// ── projects ───────────────────────────────────────────────
app.get('/api/projects', (_req, res) => res.json(listProjects()));

app.post('/api/projects', wrap((req, res) => {
  const { name, description, owner } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  res.json(createProject({ name, description, owner }));
}));

app.get('/api/projects/:id', wrap((req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json(p);
}));

// ── stakeholders ───────────────────────────────────────────
app.post('/api/projects/:id/stakeholders', wrap((req, res) => {
  const { email, role } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: 'valid email required' });
  res.json(addStakeholder(req.params.id, { email, role }));
}));

app.delete('/api/projects/:id/stakeholders/:email', wrap((req, res) =>
  res.json(removeStakeholder(req.params.id, decodeURIComponent(req.params.email)))));

// ── artifacts ──────────────────────────────────────────────
app.get('/api/projects/:id/artifacts', wrap((req, res) => res.json(listArtifacts(req.params.id))));

app.get('/api/projects/:id/artifact', wrap((req, res) => {
  const rel = req.query.path;
  if (!rel) return res.status(400).json({ error: 'path required' });
  res.type('text/markdown').send(readArtifact(req.params.id, String(rel)));
}));

// ── invoke (legacy — returns full JSON, no streaming) ──────
app.post('/api/projects/:id/invoke', wrap(async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });
  const result = await runSuperAgent({ projectId: req.params.id, message });
  res.json(result);
}));

// ── invoke-stream (SSE) — real-time events ─────────────────
app.post('/api/projects/:id/invoke-stream', async (req, res) => {
  const { message } = req.body || {};
  if (!message) { res.status(400).json({ error: 'message required' }); return; }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Heartbeat to keep connection alive
  const hb = setInterval(() => res.write(': heartbeat\n\n'), 15000);

  try {
    await runSuperAgent({
      projectId: req.params.id,
      message,
      onEvent: (type, data) => send(type, data),
    });
  } catch (e) {
    console.error('invoke-stream error:', e);
    send('error', { message: e.message });
  } finally {
    clearInterval(hb);
    res.end();
  }
});

// ── workflow ────────────────────────────────────────────────
// GET  /api/projects/:id/workflow            — full workflow state
// POST /api/projects/:id/workflow/assign     — assign artifact for review/signoff
// POST /api/projects/:id/workflow/review     — submit review decision
// GET  /api/projects/:id/workflow/mytasks    — items assigned to ?email=
// GET  /api/projects/:id/workflow/artifact/:artId — item for specific artifact

app.get('/api/projects/:id/workflow', wrap((req, res) => {
  res.json(getWorkflow(req.params.id));
}));

app.get('/api/projects/:id/workflow/mytasks', wrap((req, res) => {
  const email = req.query.email || '';
  res.json(getMyTasks(req.params.id, email));
}));

app.get('/api/projects/:id/workflow/artifact/:artId', wrap((req, res) => {
  const item = getItemByArtifact(req.params.id, req.params.artId);
  res.json(item || null);
}));

app.post('/api/projects/:id/workflow/assign', wrap((req, res) => {
  const { artifactId, artifactTitle, artifactPath, domain, skill,
          assignedTo, assignedBy, action, message } = req.body || {};
  if (!artifactId || !assignedTo || !assignedBy) {
    return res.status(400).json({ error: 'artifactId, assignedTo, assignedBy required' });
  }
  const item = assignArtifact(req.params.id, {
    artifactId, artifactTitle, artifactPath, domain, skill,
    assignedTo, assignedBy, action: action || 'review', message,
  });
  res.json(item);
}));

app.post('/api/projects/:id/workflow/review', wrap((req, res) => {
  const { itemId, author, decision, comment } = req.body || {};
  if (!itemId || !author || !decision) {
    return res.status(400).json({ error: 'itemId, author, decision required' });
  }
  const item = submitReview(req.params.id, { itemId, author, decision, comment });
  res.json(item);
}));

// ── boot ───────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n  nivi4AI — Collaborative Agentic Workspace`);
  console.log(`  http://localhost:${PORT}   mode=${MODE}  model=${MODEL}`);
  console.log(`  ${MODE === 'MOCK' ? 'MOCK mode — fully demoable without an API key.' : 'LIVE — Claude orchestration active.'}\n`);
});
