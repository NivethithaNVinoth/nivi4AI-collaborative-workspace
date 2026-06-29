// superAgent.mjs -- Benchmark Super Agent with 5-layer Intent Classification
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMessage, isLive, MODEL, MODE } from './anthropic.mjs';
import { skillCatalogue, loadSkills, DOMAINS } from './skills.mjs';
import { runDomainAgent } from './domainAgent.mjs';
import { writeArtifact, listArtifacts, createSession, updateSession } from './workspace.mjs';
import { getProject, logEvent, setStage } from './store.mjs';
import { getWorkflow } from './workflow.mjs';
import { notifyStakeholders } from './notify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const META_PROMPT = fs.readFileSync(path.join(__dirname, '..', 'agents', 'super-agent.md'), 'utf8');
const delay = ms => new Promise(r => setTimeout(r, ms));

// =================================================================
// INTENT CLASSIFICATION ENGINE -- 5-Layer Taxonomy
// =================================================================

const INTENT_TAXONOMY = {
  DISCOVER: {
    signals: [
      'market research','market sizing','tam sam som','landscape','competitor',
      'discovery','problem space','hypothesis','validate','explore','understand',
      'user research','customer insight','pain point','opportunity','job to be done',
      'jtbd','jobs to be done','segment','persona','ethnography','interview','survey','nps','csat',
      'voice of customer','voc','market trend','industry analysis',
    ],
    skills: ['market-research','discovery-brief','competitive-analysis','jtbd-framework'],
    phase: 'early', domain: 'product-management',
  },
  STRATEGIZE: {
    signals: [
      'strategy','roadmap','okr','objective','key result','goal','vision',
      'north star','prioritis','prioritiz','rice','moscow','kano','value vs effort',
      'bet','initiative','quarter','q1','q2','q3','q4','annual plan','half',
      'product strategy','go-to-market','gtm','launch strategy','market entry',
      'positioning','differentiat','competitive advantage',
      'business case','roi','investment','build vs buy','make vs buy','approve',
      'exec summary','executive summary','press release','one pager',
    ],
    skills: ['roadmap','prioritization-rice','okr-framework','competitive-analysis','business-case','executive-summary'],
    phase: 'mid', domain: 'product-management',
  },
  SPECIFY: {
    signals: [
      'prd','product requirement','feature spec','requirements doc','user stor',
      'acceptance criteria','epic','backlog','functional requirement','non-functional',
      'definition of done','dod','definition of ready','dor','given when then',
      'gherkin','use case','stakeholder map','stakeholder requirement',
      'define what','specify','write up','document the feature',
    ],
    skills: ['prd','user-story','stakeholder-map'],
    phase: 'mid', domain: 'product-management',
  },
  DESIGN: {
    signals: [
      'process flow','workflow','swimlane','flowchart','process map','diagram','draw.io','drawio',
      'cross functional','cross-functional','bpmn','flow diagram','swim lane','flowforge',
      'visualise','visualize','journey map','customer journey','sequence diagram','timeline diagram',
      'architecture diagram','hub diagram','tree diagram','compare diagram','mindmap',
      'ui','wireframe','prototype','mockup','screen','interface','ux','user journey',
      'experience map','service blueprint','system design',
      'architecture','data flow','state machine',
      'hsbc red','hsbc diagram','banking flow','credit card flow',
    ],
    skills: ['flowforge','drawio-swimlane','process-flow','html-ui-screens'],
    phase: 'mid', domain: 'diagramming',
  },
  PLAN: {
    signals: [
      'sprint plan','sprint','iteration','scrum','agile','velocity','capacity',
      'project plan','project charter','charter','kickoff','resource plan',
      'timeline','milestone','gantt','wbs','work breakdown','release plan',
      'deployment plan','go live','launch plan','plan on a page',
      'schedule','estimate','story point','t-shirt siz',
    ],
    skills: ['sprint-plan','project-charter','resource-plan','release-plan','plan-on-a-page','stakeholder-map'],
    phase: 'mid', domain: 'project-management',
  },
  GOVERN: {
    signals: [
      'raid','risk','assumption','issue','dependency','mitigation','status report',
      'progress report','weekly update','project health','rag status','red amber green',
      'escalation','change request','change management','retrospective','retro',
      'lessons learned','post mortem','audit','compliance','governance',
      'steer','steering committee','pmo','programme',
    ],
    skills: ['raid-log','status-report','escalation-brief','change-request','retrospective'],
    phase: 'late', domain: 'project-management',
  },
  COMMUNICATE: {
    signals: [
      'deck','presentation','slide','pitch','executive','board','stakeholder update',
      'brief','announcement','newsletter','comms','communication plan',
      'town hall','all hands','one pager','summary','overview','exec brief',
    ],
    skills: ['html-deck','executive-summary','plan-on-a-page','status-report'],
    phase: 'any', domain: 'any',
  },
  ANALYSE: {
    signals: [
      'prioritis','prioritiz','rank','score','compare','evaluate','trade-off',
      'tradeoff','decision','make vs buy','build vs buy','feasibility',
      'cost benefit','roi','business case','impact analysis','gap analysis',
      'swot','pestle','benchmarking',
    ],
    skills: ['prioritization-rice','competitive-analysis','discovery-brief','business-case'],
    phase: 'any', domain: 'any',
  },
};

function classifyIntent(text) {
  const q = text.toLowerCase();
  const scores = {};
  for (const [cat, def] of Object.entries(INTENT_TAXONOMY)) {
    let score = 0;
    def.signals.forEach(sig => { if (q.includes(sig)) score += sig.split(' ').length * 3; });
    if (score > 0) scores[cat] = score;
  }
  const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  return {
    primary: sorted[0]?.[0] || 'DISCOVER',
    secondary: sorted[1]?.[0] || null,
    scores,
    isMultiIntent: sorted.filter(([,s]) => s > 3).length > 1,
  };
}

function selectSkills(intent, message, project) {
  const skills = loadSkills();
  const q = message.toLowerCase();
  const projText = ((project?.name||'') + ' ' + (project?.description||'')).toLowerCase();

  let existingSkills = new Set();
  try { listArtifacts(project.id).filter(a => a.isLatest).forEach(a => existingSkills.add(a.skill)); } catch {}

  const scored = skills.map(skill => {
    let score = 0;
    const cat = INTENT_TAXONOMY[intent.primary];
    if (cat?.skills.includes(skill.name)) score += 20;
    if (intent.secondary) {
      const cat2 = INTENT_TAXONOMY[intent.secondary];
      if (cat2?.skills.includes(skill.name)) score += 10;
    }
    const body = [skill.name, skill.description, skill.when_to_use].join(' ').toLowerCase();
    body.split(/\W+/).filter(w=>w.length>3).forEach(w => {
      if (q.includes(w) || projText.includes(w)) score += 1;
    });
    if (q.includes(skill.name.replace(/-/g,' '))) score += 15;
    if (existingSkills.has(skill.name) && !/(redo|update|revise|new version|v\d)/i.test(q)) score -= 50;
    return { skill, score };
  })
  .filter(r => r.score > 0)
  .sort((a, b) => {
    if (Math.abs(a.score-b.score) > 5) return b.score - a.score;
    const order = {
      'market-research':1,'discovery-brief':1,'competitive-analysis':2,'jtbd-framework':2,
      'prd':3,'user-story':3,'stakeholder-map':3,
      'prioritization-rice':4,'roadmap':4,'okr-framework':4,'business-case':4,'executive-summary':4,
      'flowforge':5,'drawio-swimlane':5,'process-flow':5,'html-ui-screens':5,
      'project-charter':6,'resource-plan':6,'release-plan':6,
      'sprint-plan':7,'plan-on-a-page':7,
      'raid-log':8,'status-report':8,'change-request':8,'escalation-brief':8,'retrospective':8,
      'html-deck':9,
    };
    return (order[a.skill.name]||5) - (order[b.skill.name]||5);
  })
  .slice(0, 3)
  .map(r => r.skill);

  if (!scored.length) {
    const isProjMgmt = /(project|delivery|sprint|plan|charter|risk|raid)/i.test(q+projText);
    const fallback = isProjMgmt
      ? skills.find(s=>s.name==='project-charter') || skills.find(s=>s.domain==='project-management')
      : skills.find(s=>s.name==='discovery-brief') || skills.find(s=>s.domain==='product-management');
    if (fallback) scored.push(fallback);
  }

  return scored;
}

// =================================================================
// PROJECT MEMORY
// =================================================================
function buildProjectMemory(project) {
  const lines = ['## Project Memory'];
  if (project.stakeholders?.length) {
    lines.push('\n### Team');
    project.stakeholders.forEach(s => lines.push(`- ${s.email} (${s.role})`));
  }
  try {
    const arts = listArtifacts(project.id);
    if (arts.length) {
      lines.push('\n### Artifacts in Workspace');
      arts.filter(a=>a.isLatest).slice(0,15).forEach(a =>
        lines.push(`- [${a.status}] "${a.title}" v${a.version} -- ${a.skill} (${a.stage})`));
    }
  } catch {}
  try {
    const wf = getWorkflow(project.id);
    const approved  = (wf.items||[]).filter(i=>i.status==='approved');
    const inReview  = (wf.items||[]).filter(i=>i.status==='in-review');
    if (approved.length||inReview.length) {
      lines.push('\n### Workflow State');
      approved.forEach(i => lines.push(`- Approved: "${i.artifactTitle}"`));
      inReview.forEach(i => lines.push(`- In Review: "${i.artifactTitle}" -> ${i.assignedTo}`));
    }
  } catch {}
  return lines.join('\n');
}

// =================================================================
// DELEGATION TOOL
// =================================================================
const delegationTool = {
  name: 'invoke_domain_agent',
  description: 'Delegate a unit of work to a domain agent. Call once per artifact.',
  input_schema: {
    type: 'object',
    properties: {
      domain:         { type:'string', enum:['product-management','project-management'] },
      skill:          { type:'string', description:'Exact skill name from catalogue.' },
      task_brief:     { type:'string', description:'Self-contained brief with product context.' },
      artifact_title: { type:'string', description:'Descriptive title: "Skill Type -- Product Context".' },
    },
    required: ['domain','skill','task_brief','artifact_title'],
  },
};

// =================================================================
// EXECUTE DELEGATION
// =================================================================
async function executeDelegation(project, input, onEvent, stepId, sessionId = null) {
  const { domain, skill, task_brief, artifact_title } = input;
  onEvent('step_progress', { stepId, message: `Loading skill: ${skill}` });
  await delay(300);
  onEvent('step_progress', { stepId, message: `Routing to ${domain} agent...` });
  const { content, stage } = await runDomainAgent({
    projectId:project.id, domain, skillName:skill, taskBrief:task_brief, project,
  });
  onEvent('step_progress', { stepId, message: 'Writing artifact to workspace...' });
  const meta = writeArtifact(project.id, { title:artifact_title, domain, skill, stage, content, createdBy:domain+' agent', sessionId });
  setStage(project.id, stage);
  logEvent(project.id, { type:'artifact_created', domain, skill, title:artifact_title, artifactId:meta.artifactId, version:meta.version, stage, sessionId });
  if (sessionId) updateSession(project.id, sessionId, { stepId, stepStatus:'done', artifactId:meta.artifactId });
  notifyStakeholders(project.id, { subject:'New artifact: '+artifact_title, body:`"${artifact_title}" (${skill} v${meta.version}) is ready for review.` });
  onEvent('artifact', { artifactId:meta.artifactId, title:artifact_title, domain, skill, stage, version:meta.version, path:meta.path });
  return { meta, output:`Produced "${artifact_title}" v${meta.version} via ${domain}/${skill}.` };
}

// =================================================================
// PUBLIC ENTRY
// =================================================================
export async function runSuperAgent({ projectId, message, onEvent=()=>{} }) {
  const project = getProject(projectId);
  if (!project) throw new Error('project not found');
  logEvent(projectId, { type:'user_message', message });
  if (!isLive()) return mockRun(project, message, onEvent);
  return liveRun(project, message, onEvent);
}

// =================================================================
// LIVE RUN
// =================================================================
async function liveRun(project, message, onEvent) {
  const catalogue     = skillCatalogue();
  const intent        = classifyIntent(message);
  const projectMemory = buildProjectMemory(project);

  const planningSystem = [
    'You are an expert PM/PjM planning assistant.',
    `Detected intent: ${intent.primary}${intent.secondary?' + '+intent.secondary:''}`,
    'Create a precise execution plan. Return ONLY valid JSON.',
    'Format: {"intent":"one clear sentence","steps":[{"id":1,"title":"...","domain":"...","skill":"...","rationale":"..."}]}',
    'domain = "product-management" or "project-management". skill = exact catalogue name.',
    'Max 3 steps. Order: discovery -> strategy -> requirements -> design -> delivery -> governance.',
    '', '## Skill catalogue', catalogue, '', projectMemory,
  ].join('\n');

  onEvent('step_start', { stepId:'__plan', title:`Classifying intent (${intent.primary}) and building plan...` });
  let planSteps = []; let parsedIntent = message.slice(0,80);
  try {
    const pr = await createMessage({ model:MODEL, max_tokens:768, system:planningSystem, messages:[{role:'user',content:message}] });
    const raw = pr.content.filter(b=>b.type==='text').map(b=>b.text).join('').trim();
    const parsed = JSON.parse(raw.replace(/^```[a-z]*\n?/,'').replace(/```$/,'').trim());
    parsedIntent = parsed.intent || parsedIntent;
    planSteps = (parsed.steps||[]).map((s,i)=>({...s,id:String(i+1),status:'pending'}));
    onEvent('step_complete', { stepId:'__plan', output:`Intent: ${parsedIntent}` });
  } catch {
    planSteps = [{ id:'1', title:'Execute task', domain:'product-management', skill:'prd', status:'pending' }];
    onEvent('step_complete', { stepId:'__plan', output:'Plan ready (1 step).' });
  }
  const sessionId = createSession(project.id, { intent: parsedIntent, triggeredBy: message, steps: planSteps });
  logEvent(project.id, { type:'task_plan', steps:planSteps, intent:intent.primary, triggeredBy:message.slice(0,120), sessionId });
  onEvent('plan', { steps:planSteps, intent:intent.primary, sessionId });

  const metaSystem = [
    META_PROMPT, '',
    '## Domains', Object.entries(DOMAINS).map(([k,v])=>'- '+k+': '+v).join('\n'),
    '', '## Skill catalogue', catalogue,
    '', '## Project', `- name: ${project.name}`, `- description: ${project.description||'N/A'}`, `- stage: ${project.stage}`,
    '', projectMemory,
  ].join('\n');

  const messages = [{ role:'user', content:message }];
  const produced = [];
  let stepIdx = 0, guard = 0;

  while (guard++ < 8) {
    const resp = await createMessage({ model:MODEL, max_tokens:2048, system:metaSystem, tools:[delegationTool], messages });
    messages.push({ role:'assistant', content:resp.content });
    if (resp.stop_reason === 'tool_use') {
      const results = [];
      for (const block of resp.content) {
        if (block.type !== 'tool_use') continue;
        const stepId = String(++stepIdx);
        onEvent('step_start', { stepId, title:(block.input.artifact_title||block.input.skill)+' -- '+block.input.domain });
        try {
          const { meta, output } = await executeDelegation(project, block.input, onEvent, stepId, sessionId);
          produced.push(meta);
          onEvent('step_complete', { stepId, output });
          results.push({ type:'tool_result', tool_use_id:block.id, content:output });
        } catch(e) {
          onEvent('step_complete', { stepId, output:'Error: '+e.message, error:true });
          results.push({ type:'tool_result', tool_use_id:block.id, is_error:true, content:e.message });
        }
      }
      messages.push({ role:'user', content:results });
      continue;
    }
    const reply = resp.content.filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
    logEvent(project.id, { type:'super_agent_reply', message:reply });
    onEvent('reply', { text:reply });
    onEvent('done', {});
    return { mode:MODE, reply, artifacts:produced };
  }
  onEvent('reply', { text:'Delegation complete.' });
  onEvent('done', {});
  return { mode:MODE, reply:'Completed.', artifacts:produced };
}

// =================================================================
// MOCK RUN -- Benchmark Intent Engine
// =================================================================
async function mockRun(project, message, onEvent) {
  onEvent('step_start', { stepId:'__plan', title:'Classifying intent and selecting skills...' });
  await delay(600);

  const intent  = classifyIntent(message);
  const chosen  = selectSkills(intent, message, project);

  const intentLabels = {
    DISCOVER:'Discover', STRATEGIZE:'Strategise', SPECIFY:'Specify',
    DESIGN:'Design', PLAN:'Plan', GOVERN:'Govern',
    COMMUNICATE:'Communicate', ANALYSE:'Analyse',
  };
  const intentLabel = [intentLabels[intent.primary], intent.secondary ? intentLabels[intent.secondary] : null]
    .filter(Boolean).join(' + ');

  // Build plan steps
  const planSteps = chosen.map((skill, i) => ({
    id:     String(i + 1),
    title:  skill.description.split('.')[0].slice(0, 80),
    domain: skill.domain,
    skill:  skill.name,
    status: 'pending',
  }));

  const intentSentence = `${intentLabel} -- ${message.slice(0, 80)}${message.length > 80 ? '...' : ''}`;
  const sessionId = createSession(project.id, { intent: intentSentence, triggeredBy: message, steps: planSteps });
  logEvent(project.id, { type:'task_plan', steps:planSteps, intent:intentSentence, triggeredBy:message.slice(0,120), sessionId });

  onEvent('step_complete', { stepId:'__plan', output:`${intentLabel} -- ${chosen.length} skill${chosen.length!==1?'s':''} selected.` });
  onEvent('plan', { steps:planSteps, intent:intentSentence, sessionId });

  const produced = [];

  for (let i = 0; i < chosen.length; i++) {
    const skill  = chosen[i];
    const stepId = String(i + 1);
    planSteps[i].status = 'running';
    updateSession(project.id, sessionId, { stepId, stepStatus:'running' });

    const skillTitle = skill.name.split('-').map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
    const title      = `${skillTitle} -- ${project.name}`;

    onEvent('step_start', { stepId, title });
    await delay(450 + i * 150);

    try {
      const { meta, output } = await executeDelegation(
        project,
        { domain:skill.domain, skill:skill.name, task_brief:message, artifact_title:title },
        onEvent, stepId, sessionId
      );
      produced.push(meta);
      planSteps[i].status = 'done';
      onEvent('step_complete', { stepId, output });
    } catch(e) {
      planSteps[i].status = 'error';
      updateSession(project.id, sessionId, { stepId, stepStatus:'error' });
      onEvent('step_complete', { stepId, output:'Error: '+e.message, error:true });
    }
    await delay(200);
  }

  updateSession(project.id, sessionId, { status:'completed' });

  onEvent('step_start', { stepId:'notify', title:'Notifying stakeholders' });
  await delay(250);
  onEvent('step_complete', { stepId:'notify', output:`${project.stakeholders.length} stakeholder(s) notified.` });

  const prior = listArtifacts(project.id).length - produced.length;
  const reply = [
    `${intentLabel} -- completed ${produced.length} artifact${produced.length!==1?'s':''}: ${produced.map(a=>`"${a.title}" v${a.version}`).join(', ')}.`,
    project.stakeholders.length ? `Team: ${project.stakeholders.map(s=>s.email.split('@')[0]).join(', ')}.` : '',
    '(MOCK mode -- set ANTHROPIC_API_KEY for live Claude generation.)',
  ].filter(Boolean).join(' ');
  onEvent('reply', { text:reply });
  onEvent('done', {});
  return { mode:MODE, reply, artifacts:produced };
}
