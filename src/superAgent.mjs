// superAgent.mjs — Meta agent with streaming event support
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMessage, isLive, MODEL, MODE } from './anthropic.mjs';
import { skillCatalogue, loadSkills, DOMAINS } from './skills.mjs';
import { runDomainAgent } from './domainAgent.mjs';
import { writeArtifact } from './workspace.mjs';
import { getProject, logEvent, setStage } from './store.mjs';
import { notifyStakeholders } from './notify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const META_PROMPT = fs.readFileSync(path.join(__dirname, '..', 'agents', 'super-agent.md'), 'utf8');

const delegationTool = {
  name: 'invoke_domain_agent',
  description: 'Delegate a unit of work to a domain agent. Choose the single most appropriate domain and skill for the task. Call this once per artifact you want produced.',
  input_schema: {
    type: 'object',
    properties: {
      domain: { type: 'string', enum: ['product-management', 'project-management'] },
      skill: { type: 'string', description: 'Exact skill name from the catalogue.' },
      task_brief: { type: 'string', description: 'Self-contained brief for the domain agent.' },
      artifact_title: { type: 'string', description: 'Short title for the artifact.' },
    },
    required: ['domain', 'skill', 'task_brief', 'artifact_title'],
  },
};

async function executeDelegation(project, input, onEvent, stepId) {
  const { domain, skill, task_brief, artifact_title } = input;
  onEvent('step_progress', { stepId, message: 'Loading Skill: ' + skill });
  await delay(300);
  onEvent('step_progress', { stepId, message: 'Routing to ' + domain + ' agent...' });

  const { content, stage } = await runDomainAgent({ projectId: project.id, domain, skillName: skill, taskBrief: task_brief, project });

  onEvent('step_progress', { stepId, message: 'Writing artifact to workspace...' });
  const meta = writeArtifact(project.id, { title: artifact_title, domain, skill, stage, content, createdBy: domain + ' agent' });

  setStage(project.id, stage);
  logEvent(project.id, { type: 'artifact_created', domain, skill, title: artifact_title, artifactId: meta.artifactId, stage });
  notifyStakeholders(project.id, { subject: 'New artifact for review: ' + artifact_title, body: 'The ' + domain + ' agent produced "' + artifact_title + '" (' + skill + '). Status: draft.' });
  onEvent('artifact', { artifactId: meta.artifactId, title: artifact_title, domain, skill, stage, path: meta.path });

  return { meta, output: 'Produced ' + artifact_title + ' via ' + domain + '/' + skill + '. Stage: ' + stage + '.' };
}

export async function runSuperAgent({ projectId, message, onEvent = () => {} }) {
  const project = getProject(projectId);
  if (!project) throw new Error('project not found');
  logEvent(projectId, { type: 'user_message', message });
  if (!isLive()) return mockRun(project, message, onEvent);
  return liveRun(project, message, onEvent);
}

async function liveRun(project, message, onEvent) {
  const catalogue = skillCatalogue();
  const planningSystem = [
    'You are a planning assistant for an AI product workspace.',
    'Given the user request and available skills, create a concise execution plan.',
    'Return ONLY valid JSON — no markdown fences, no explanation.',
    'Format: {"intent": "one sentence", "steps": [{"id": 1, "title": "...", "domain": "...", "skill": "..."}]}',
    'domain must be "product-management" or "project-management".',
    'skill must be an exact name from the catalogue. Use max 4 steps.',
    '',
    '## Skill catalogue', catalogue,
  ].join('\n');

  onEvent('step_start', { stepId: '__plan', title: 'Analyzing request and decomposing tasks...' });

  let planSteps = [];
  try {
    const planResp = await createMessage({ model: MODEL, max_tokens: 512, system: planningSystem, messages: [{ role: 'user', content: message }] });
    const raw = planResp.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
    const parsed = JSON.parse(raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim());
    planSteps = (parsed.steps || []).map((s, i) => ({ ...s, id: String(i + 1), status: 'pending' }));
    onEvent('step_complete', { stepId: '__plan', output: 'Intent: ' + (parsed.intent || message.slice(0, 80)) });
  } catch (e) {
    planSteps = [{ id: '1', title: 'Execute task', domain: 'product-management', skill: 'prd', status: 'pending' }];
    onEvent('step_complete', { stepId: '__plan', output: 'Plan created (1 step).' });
  }

  onEvent('plan', { steps: planSteps });

  const metaSystem = [
    META_PROMPT, '',
    '## Domains', Object.entries(DOMAINS).map(([k, v]) => '- ' + k + ': ' + v).join('\n'),
    '', '## Skill catalogue', catalogue,
    '', '## Project\n- name: ' + project.name + '\n- description: ' + project.description + '\n- stage: ' + project.stage,
  ].join('\n');

  const messages = [{ role: 'user', content: message }];
  const produced = [];
  let stepIdx = 0;
  let guard = 0;

  while (guard++ < 8) {
    const resp = await createMessage({ model: MODEL, max_tokens: 2048, system: metaSystem, tools: [delegationTool], messages });
    messages.push({ role: 'assistant', content: resp.content });

    if (resp.stop_reason === 'tool_use') {
      const results = [];
      for (const block of resp.content) {
        if (block.type !== 'tool_use') continue;
        const stepId = String(++stepIdx);
        onEvent('step_start', { stepId, title: (block.input.artifact_title || block.input.skill) + ' — ' + block.input.domain });
        try {
          const { meta, output } = await executeDelegation(project, block.input, onEvent, stepId);
          produced.push(meta);
          onEvent('step_complete', { stepId, output });
          results.push({ type: 'tool_result', tool_use_id: block.id, content: output });
        } catch (e) {
          onEvent('step_complete', { stepId, output: 'Error: ' + e.message, error: true });
          results.push({ type: 'tool_result', tool_use_id: block.id, is_error: true, content: e.message });
        }
      }
      messages.push({ role: 'user', content: results });
      continue;
    }

    const reply = resp.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    logEvent(project.id, { type: 'super_agent_reply', message: reply });
    onEvent('reply', { text: reply });
    onEvent('done', {});
    return { mode: MODE, reply, artifacts: produced };
  }

  onEvent('reply', { text: 'Completed delegation steps.' });
  onEvent('done', {});
  return { mode: MODE, reply: 'Completed.', artifacts: produced };
}

async function mockRun(project, message, onEvent) {
  const skills = loadSkills();
  const q = message.toLowerCase();
  const score = s => [s.name, s.description, s.when_to_use].join(' ').toLowerCase().split(/\W+/).filter(w => w.length > 3 && q.includes(w)).length;
  const ranked = skills.map(s => ({ s, n: score(s) })).sort((a, b) => b.n - a.n);
  const chosen = ranked.filter(r => r.n > 0).slice(0, 2).map(r => r.s);
  if (!chosen.length) chosen.push(skills.find(s => s.name === 'market-research') || skills[0]);

  onEvent('step_start', { stepId: '__plan', title: 'Analyzing request and decomposing tasks...' });
  await delay(600);

  const planSteps = [
    { id: '__plan', title: 'Intent analysis & task decomposition', status: 'done' },
    ...chosen.map((s, i) => ({ id: String(i + 1), title: titleCase(s.name) + ' — ' + s.domain, status: 'pending', domain: s.domain, skill: s.name })),
    { id: 'notify', title: 'Notify stakeholders', status: 'pending' },
  ];

  onEvent('step_complete', { stepId: '__plan', output: 'Identified ' + chosen.length + ' deliverable' + (chosen.length > 1 ? 's' : '') + ': ' + chosen.map(s => s.name).join(', ') + '.' });
  onEvent('plan', { steps: planSteps });

  const produced = [];
  for (let i = 0; i < chosen.length; i++) {
    const s = chosen[i];
    const stepId = String(i + 1);
    onEvent('step_start', { stepId, title: titleCase(s.name) + ' — ' + s.domain });
    await delay(400);
    try {
      const { meta, output } = await executeDelegation(project, { domain: s.domain, skill: s.name, task_brief: message, artifact_title: titleCase(s.name) }, onEvent, stepId);
      produced.push(meta);
      onEvent('step_complete', { stepId, output });
    } catch (e) {
      onEvent('step_complete', { stepId, output: 'Error: ' + e.message, error: true });
    }
    await delay(200);
  }

  onEvent('step_start', { stepId: 'notify', title: 'Notifying stakeholders' });
  await delay(300);
  onEvent('step_complete', { stepId: 'notify', output: project.stakeholders.length + ' stakeholder(s) notified via email.' });

  const reply = 'Completed ' + produced.length + ' artifact' + (produced.length > 1 ? 's' : '') + ': ' + produced.map(a => a.title).join(', ') + '. Stakeholders notified. (MOCK mode — set ANTHROPIC_API_KEY for full Claude orchestration.)';
  logEvent(project.id, { type: 'super_agent_reply', message: reply });
  onEvent('reply', { text: reply });
  onEvent('done', {});
  return { mode: MODE, reply, artifacts: produced };
}

const delay = ms => new Promise(r => setTimeout(r, ms));
const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
