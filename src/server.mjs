import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODE, MODEL } from './anthropic.mjs';
import { loadSkills, DOMAINS } from './skills.mjs';
import { listProjects, getProject, createProject, addStakeholder, removeStakeholder } from './store.mjs';
import { listArtifacts, readArtifact } from './workspace.mjs';
import { runSuperAgent } from './superAgent.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const wrap = fn => (req, res) => Promise.resolve(fn(req, res)).catch(e => {
  console.error(e); res.status(500).json({ error: e.message });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: MODE, model: MODEL }));

app.get('/api/meta', (_req, res) => {
  const skills = loadSkills().map(s => ({ name: s.name, domain: s.domain, description: s.description, when_to_use: s.when_to_use }));
  res.json({ mode: MODE, model: MODEL, domains: DOMAINS, skills });
});

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

app.post('/api/projects/:id/stakeholders', wrap((req, res) => {
  const { email, role } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: 'valid email required' });
  res.json(addStakeholder(req.params.id, { email, role }));
}));
app.delete('/api/projects/:id/stakeholders/:email', wrap((req, res) =>
  res.json(removeStakeholder(req.params.id, decodeURIComponent(req.params.email)))));

app.get('/api/projects/:id/artifacts', wrap((req, res) => res.json(listArtifacts(req.params.id))));
app.get('/api/projects/:id/artifact', wrap((req, res) => {
  const rel = req.query.path;
  if (!rel) return res.status(400).json({ error: 'path required' });
  res.type('text/markdown').send(readArtifact(req.params.id, String(rel)));
}));

app.post('/api/projects/:id/invoke', wrap(async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });
  const result = await runSuperAgent({ projectId: req.params.id, message });
  res.json(result);
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n  nivi4AI — Collaborative Agentic Workspace`);
  console.log(`  http://localhost:${PORT}   mode=${MODE}  model=${MODEL}`);
  console.log(`  ${MODE === 'MOCK' ? 'No API key set — running templated MOCK mode (fully demoable).' : 'LIVE — using Claude for orchestration.'}\n`);
});
