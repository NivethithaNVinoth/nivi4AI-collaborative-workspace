// Meta (Super) Agent. Receives a natural-language request for a project, decides which
// domain agent(s) and skill(s) to invoke, delegates, and composes a final reply.
// LIVE mode: Claude with a delegation tool, looped until end_turn.
// MOCK mode: deterministic keyword router (1 skill) so it's demoable with no key.
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
  description:
    'Delegate a unit of work to a domain agent. Choose the single most appropriate domain ' +
    'and skill for the task. The domain agent will run the skill and write an artifact to the ' +
    'project workspace. Call this once per artifact you want produced.',
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

async function executeDelegation(project, input) {
  const { domain, skill, task_brief, artifact_title } = input;
  const { content, stage, skill: skillObj } =
    await runDomainAgent({ projectId: project.id, domain, skillName: skill, taskBrief: task_brief, project });
  const meta = writeArtifact(project.id, {
    title: artifact_title, domain, skill, stage, content, createdBy: `${domain} agent`,
  });
  setStage(project.id, stage);
  logEvent(project.id, { type: 'artifact_created', domain, skill, title: artifact_title, artifactId: meta.artifactId, stage });
  notifyStakeholders(project.id, {
    subject: `New artifact for review: ${artifact_title}`,
    body: `The ${domain} agent produced "${artifact_title}" (${skill}). Status: draft — please review and sign off.`,
  });
  return meta;
}

export async function runSuperAgent({ projectId, message }) {
  const project = getProject(projectId);
  if (!project) throw new Error('project not found');
  logEvent(projectId, { type: 'user_message', message });

  if (!isLive()) return mockRun(project, message);

  const catalogue = skillCatalogue();
  const system = [
    META_PROMPT, '',
    '## Domains', Object.entries(DOMAINS).map(([k, v]) => `- ${k}: ${v}`).join('\n'),
    '', '## Skill catalogue', catalogue,
    '', `## Project\n- name: ${project.name}\n- description: ${project.description}\n- stage: ${project.stage}\n- stakeholders: ${project.stakeholders.map(s => `${s.email}(${s.role})`).join(', ')}`,
  ].join('\n');

  const messages = [{ role: 'user', content: message }];
  const produced = [];
  let guard = 0;

  while (guard++ < 6) {
    const resp = await createMessage({
      model: MODEL, max_tokens: 1536, system, tools: [delegationTool], messages,
    });
    messages.push({ role: 'assistant', content: resp.content });

    if (resp.stop_reason === 'tool_use') {
      const results = [];
      for (const block of resp.content) {
        if (block.type !== 'tool_use') continue;
        try {
          const meta = await executeDelegation(project, block.input);
          produced.push(meta);
          results.push({ type: 'tool_result', tool_use_id: block.id,
            content: `Created artifact "${meta.title}" (${meta.artifactId}) via ${meta.domain}/${meta.skill}, stage=${meta.stage}, status=draft. Stakeholders notified.` });
        } catch (e) {
          results.push({ type: 'tool_result', tool_use_id: block.id, is_error: true, content: String(e.message) });
        }
      }
      messages.push({ role: 'user', content: results });
      continue;
    }
    const reply = resp.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    logEvent(projectId, { type: 'super_agent_reply', message: reply });
    return { mode: MODE, reply, artifacts: produced };
  }
  return { mode: MODE, reply: 'Stopped after max delegation steps.', artifacts: produced };
}

// ---- MOCK router: pick the best-matching skill by keyword overlap, run it once. ----
function mockRun(project, message) {
  const skills = loadSkills();
  const q = message.toLowerCase();
  const score = s => [s.name, s.description, s.when_to_use].join(' ').toLowerCase()
    .split(/\W+/).filter(w => w.length > 3 && q.includes(w)).length;
  const ranked = skills.map(s => ({ s, n: score(s) })).sort((a, b) => b.n - a.n);
  const chosen = (ranked[0]?.n ? ranked[0].s : skills.find(s => s.name === 'market-research')) || skills[0];

  return executeDelegation(project, {
    domain: chosen.domain, skill: chosen.name,
    task_brief: message, artifact_title: titleCase(chosen.name),
  }).then(meta => ({
    mode: MODE,
    reply: `Routed to the **${chosen.domain}** agent → **${chosen.name}** skill and created draft artifact "${meta.title}". Stakeholders were notified for review. (MOCK mode — set ANTHROPIC_API_KEY for full Claude orchestration.)`,
    artifacts: [meta],
  }));
}
const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
