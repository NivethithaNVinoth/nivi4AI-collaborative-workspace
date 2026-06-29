/* nivi4AI — Collaborative Workspace Client  v3 */
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const on = (sel, evt, fn) => { const el = $(sel); if (el) el.addEventListener(evt, fn); };
const api = (u, o) => fetch(u, { headers: { 'Content-Type': 'application/json' }, ...o })
  .then(r => r.ok ? r.json() : r.json().then(e => { throw new Error(e.error || r.statusText); }));

let currentProject         = null;
let taskPlan               = {};
let pendingArtifacts       = [];
let running                = false;

// ── workflow state ────────────────────────────────────────────────
let currentUser                  = localStorage.getItem('n4ai_user') || '';
let currentArtifactMeta          = null;   // { artifactId, title, domain, skill, path }
let currentArtifactWorkflowItem  = null;
let currentArtifactComments      = [];
let workflowCache                = null;
let pendingCommentAnchor         = '';     // selected text awaiting comment

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
async function boot() {
  try {
    const meta = await api('/api/meta');
    const pill = $('#modepill');
    pill.textContent = `${meta.mode} · ${meta.model.split('-').slice(0,2).join('-')}`;
    if (meta.mode === 'LIVE') pill.classList.add('live');
    renderSkillList(meta.skills);
    await loadProjects();
  } catch (e) { console.error('Boot error:', e); }
  wireEvents();
}

// ═══════════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════════
function renderSkillList(skills) {
  const byDomain = {};
  skills.forEach(s => (byDomain[s.domain] ||= []).push(s));
  $('#skillList').innerHTML = Object.entries(byDomain).map(([d, list]) =>
    `<div class="skill-domain">${d.replace('-',' ')}</div>` +
    list.map(s => `<div class="skill-item" title="${s.description}">${s.name}</div>`).join('')
  ).join('');
  $('#skillCount').textContent = skills.length;
}

// ═══════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════
async function loadProjects() {
  const projects = await api('/api/projects');
  const list = $('#projectList');
  if (!projects.length) {
    list.innerHTML = '<li style="padding:8px 14px;color:var(--text-3);font-size:11px">No projects yet</li>';
    return;
  }
  list.innerHTML = projects.map(p =>
    `<li data-id="${p.id}" class="${currentProject?.id === p.id ? 'active' : ''}">
      <span class="pj-name">${esc(p.name)}</span>
      <span class="pj-meta">${p.stage} · ${p.stakeholders.length} member${p.stakeholders.length!==1?'s':''}</span>
    </li>`
  ).join('');
  $$('#projectList li[data-id]').forEach(li =>
    li.addEventListener('click', () => openProject(li.dataset.id))
  );
}

async function openProject(id) {
  const p = await api('/api/projects/' + id);
  currentProject = p;
  $('#topbarProjectName').textContent = p.name;
  const sb = $('#topbarStage'); sb.textContent = p.stage; sb.hidden = false;
  $('#emptyState').hidden = true;
  $('#execView').hidden = false;
  $('#rightPanel').hidden = false;

  // ── restore conversation history ─────────────────────────
  restoreHistory(p);
  restorePlan(p);

  await refreshArtifacts();
  renderTeam(p);
  populateUserSwitcher(p);
  await refreshWorkflow();
  await loadProjects();
}

// ── MEMORY: replay stored events in the exec log ─────────────
function restoreHistory(p) {
  const log = $('#execLog');
  log.innerHTML = '';
  taskPlan = {}; pendingArtifacts = [];

  const events = (p.events || []).slice(0, 80).reverse(); // chronological (oldest first)

  // Project welcome banner — always shown
  const banner = document.createElement('div');
  banner.className = 'log-welcome';
  banner.innerHTML = `<div class="log-welcome-icon">✦</div>
    <div class="log-welcome-text">
      <strong>${esc(p.name)}</strong>
      <span>${esc(p.description || 'Collaborative Agentic Workspace')}</span>
    </div>`;
  log.appendChild(banner);

  if (!events.length) {
    // No events stored — synthesize timeline from workspace artifacts
    synthesizeHistoryFromArtifacts(log);
    scrollLog(); return;
  }

  // History header
  const histDiv = document.createElement('div');
  histDiv.className = 'history-divider';
  histDiv.innerHTML = `<span>📂 ${events.length} event${events.length!==1?'s':''} restored</span>`;
  log.appendChild(histDiv);

  // Group events by calendar date so we can show date separators
  let lastDate = '';
  events.forEach(ev => {
    const ts = ev.at || ev.timestamp || '';
    const dateLabel = ts ? fmtDate(ts) : '';
    const timeLabel = ts ? fmtTime(ts) : '';

    // Date separator when day changes
    if (dateLabel && dateLabel !== lastDate) {
      lastDate = dateLabel;
      const dateSep = document.createElement('div');
      dateSep.className = 'history-date-sep';
      dateSep.innerHTML = `<span>${dateLabel}</span>`;
      log.appendChild(dateSep);
    }

    if (ev.type === 'user_message' && ev.message) {
      const el = document.createElement('div');
      el.className = 'log-user history-item';
      el.innerHTML = `<div class="log-user-bubble">${esc(ev.message)}${timeLabel?`<span class="log-ts">${timeLabel}</span>`:''}</div>`;
      log.appendChild(el);
    } else if (ev.type === 'super_agent_reply' && ev.message) {
      const el = document.createElement('div');
      el.className = 'log-reply history-item';
      el.innerHTML = `<div class="log-reply-avatar">✦</div>
        <div class="log-reply-text">${mdLite(ev.message)}${timeLabel?`<div class="log-ts-reply">${timeLabel}</div>`:''}</div>`;
      log.appendChild(el);
    } else if (ev.type === 'artifact_created') {
      const pill = document.createElement('div');
      pill.className = 'history-artifact-pill history-item';
      pill.dataset.artifactId = ev.artifactId || '';
      pill.innerHTML = `<span class="artifact-badge ${ev.domain||''}" style="font-size:9px">${(ev.domain||'').includes('product')?'PROD MGT':'PROJ MGT'}</span>
        <span style="font-weight:600;color:var(--text)">📄 ${esc(ev.title||'Artifact')}</span>
        <span style="color:var(--text-3);margin-left:auto;font-size:10px">${esc(ev.skill||'')}${timeLabel?' · '+timeLabel:''}</span>
        <span style="color:var(--accent);font-size:10px">↗ Open</span>`;
      pill.addEventListener('click', async () => {
        const arts = await api(`/api/projects/${currentProject.id}/artifacts`);
        const a = arts.find(x => x.artifactId === pill.dataset.artifactId);
        if (a) openArtifact(a.path);
      });
      log.appendChild(pill);
    }
  });

  // Divider separating history from current session
  const nowDiv = document.createElement('div');
  nowDiv.className = 'history-divider history-now-line';
  nowDiv.innerHTML = `<span>✦ Now — ${fmtDate(new Date().toISOString())}</span>`;
  log.appendChild(nowDiv);

  scrollLog();
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date(); const yest = new Date(today); yest.setDate(yest.getDate()-1);
  if (d.toDateString()===today.toDateString()) return 'Today';
  if (d.toDateString()===yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', year: d.getFullYear()!==today.getFullYear()?'numeric':undefined });
}

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
}

/** Called when a project has no events — reconstruct timeline from artifact files */
async function synthesizeHistoryFromArtifacts(log) {
  if (!currentProject) return;
  try {
    const arts = await api(`/api/projects/${currentProject.id}/artifacts`);
    if (!arts.length) return;
    // Sort oldest first
    const sorted = [...arts].sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));
    const div = document.createElement('div');
    div.className = 'history-divider';
    div.innerHTML = `<span>📂 ${arts.length} artifact${arts.length!==1?'s':''} found from previous sessions</span>`;
    log.appendChild(div);
    let lastDate = '';
    sorted.forEach(a => {
      const ts = a.createdAt || '';
      const dateLabel = ts ? fmtDate(ts) : '';
      const timeLabel = ts ? fmtTime(ts) : '';
      if (dateLabel && dateLabel !== lastDate) {
        lastDate = dateLabel;
        const dateSep = document.createElement('div');
        dateSep.className = 'history-date-sep';
        dateSep.innerHTML = `<span>${dateLabel}</span>`;
        log.appendChild(dateSep);
      }
      const pill = document.createElement('div');
      pill.className = 'history-artifact-pill history-item';
      pill.dataset.artPath = a.path || '';
      const domLabel = (a.domain||'').includes('product') ? 'PROD MGT' : 'PROJ MGT';
      const ver = a.version > 1 ? ` <span class="ver-badge">v${a.version}</span>` : '';
      const latest = a.isLatest ? '' : ' <span style="color:var(--text-3);font-size:9px">(older)</span>';
      pill.innerHTML = `<span class="artifact-badge ${a.domain||''}">${domLabel}</span>
        <span style="font-weight:600;color:var(--text)">📄 ${esc(a.title||'Artifact')}${ver}${latest}</span>
        <span style="color:var(--text-3);margin-left:auto;font-size:10px">${esc(a.skill||'')}${timeLabel?' · '+timeLabel:''}</span>
        <span style="color:var(--accent);font-size:10px">↗</span>`;
      pill.addEventListener('click', () => { if(pill.dataset.artPath) openArtifact(pill.dataset.artPath); });
      log.appendChild(pill);
    });
    const nowDiv = document.createElement('div');
    nowDiv.className = 'history-divider history-now-line';
    nowDiv.innerHTML = `<span>✦ Now — ${fmtDate(new Date().toISOString())}</span>`;
    log.appendChild(nowDiv);
  } catch(e) { console.warn('synthesizeHistory:', e); }
}

// ═══════════════════════════════════════════════════════════
// SESSION FOLDER — COWORK-STYLE PLAN PANEL
// ═══════════════════════════════════════════════════════════

/** Build a Cowork-style checklist item for a step */
function makeProgressItem(step, artifactPath) {
  const st = step.status || 'pending';
  const checkInner = st === 'done' ? '✓' : st === 'error' ? '✕' : '';
  const skillPill = step.skill
    ? `<span class="progress-skill-pill">${esc(step.skill)}</span>` : '';
  const domainLabel = (step.domain||'').includes('project') ? 'Project Mgmt' : step.domain ? 'Product Mgmt' : '';
  return `<div class="progress-item${artifactPath?' clickable':''}" id="pi-${esc(String(step.id))}" data-path="${esc(artifactPath||'')}">
    <div class="progress-check ${st}" id="pc-${esc(String(step.id))}">${checkInner}</div>
    <div class="progress-label">
      <div class="progress-label-title ${st}" id="pt-${esc(String(step.id))}">${esc(step.title)}</div>
      ${step.skill ? `<div class="progress-label-skill">${skillPill}${domainLabel?`<span>${esc(domainLabel)}</span>`:''}</div>` : ''}
    </div>
  </div>`;
}

/** Build a session folder block */
function makeSessionFolder(session, expanded, artifactMap) {
  const ts = session.createdAt ? fmtDate(session.createdAt) + ' · ' + fmtTime(session.createdAt) : '';
  const steps = (session.steps || []).filter(s => s.id !== '__plan' && s.id !== 'notify');
  const doneCount = steps.filter(s => s.status === 'done').length;
  const badgeCls = session.status === 'completed' ? 'completed' : session.status === 'error' ? 'error' : 'running';
  const badgeLabel = session.status === 'completed' ? `${doneCount}/${steps.length} done`
                   : session.status === 'running' ? 'Running…' : 'Error';
  const title = session.intent ? session.intent.slice(0, 70) + (session.intent.length > 70 ? '…' : '') : 'Session ' + ts;

  const items = steps.map(s => {
    const art = artifactMap[s.id] || null;
    return makeProgressItem(s, art?.path || '');
  }).join('');

  return `<div class="session-folder" id="sf-${esc(session.id)}">
    <div class="session-folder-hdr${expanded?' open':''}">
      <span class="session-folder-icon">📁</span>
      <div class="session-folder-info">
        <div class="session-folder-title">${esc(title)}</div>
        <div class="session-folder-meta">${esc(ts)}</div>
      </div>
      <span class="session-folder-badge ${badgeCls}">${badgeLabel}</span>
      <span class="session-folder-chevron">›</span>
    </div>
    <div class="session-folder-body">
      <div class="progress-list">${items || '<div style="padding:10px 14px;font-size:11px;color:var(--text-4)">No steps recorded</div>'}</div>
    </div>
  </div>`;
}

let currentSessionId = null;  // the live session during SSE streaming

async function restorePlan(p) {
  const list = $('#taskPlanList'); const empty = $('#planEmpty');
  list.innerHTML = ''; list.hidden = true; empty.hidden = false;

  try {
    const sessions = await api(`/api/projects/${p.id}/sessions`);
    if (!sessions.length) {
      // Fall back to synthesizing from artifacts
      await synthesizePlanFromArtifacts(p, list, empty);
      return;
    }

    // Build artifactId → artifact map for linking steps to artifacts
    let arts = [];
    try { arts = await api(`/api/projects/${p.id}/artifacts`); } catch {}
    const artBySession = {};
    arts.forEach(a => {
      if (a.sessionId) {
        if (!artBySession[a.sessionId]) artBySession[a.sessionId] = {};
        // Map by skill so we can find which step produced which artifact
        artBySession[a.sessionId][a.skill] = a;
      }
    });

    empty.hidden = true; list.hidden = false;
    list.innerHTML = '';

    sessions.forEach((session, i) => {
      // Build step → artifact path map using skill matching
      const artifactMap = {};
      const sessionArts = artBySession[session.id] || {};
      (session.steps || []).forEach(step => {
        if (step.skill && sessionArts[step.skill]) {
          artifactMap[step.id] = sessionArts[step.skill];
        }
      });

      const expanded = i === 0; // expand the most recent session
      const div = document.createElement('div');
      div.innerHTML = makeSessionFolder(session, expanded, artifactMap);
      const folder = div.firstElementChild;

      // Toggle expand/collapse
      folder.querySelector('.session-folder-hdr').addEventListener('click', function() {
        this.classList.toggle('open');
      });

      // Wire clickable steps to open artifacts
      folder.querySelectorAll('.progress-item.clickable').forEach(item => {
        if (item.dataset.path) {
          item.addEventListener('click', e => {
            e.stopPropagation();
            openArtifact(item.dataset.path);
          });
        }
      });

      list.appendChild(folder);
    });
  } catch(e) {
    console.warn('restorePlan:', e);
    await synthesizePlanFromArtifacts(p, list, empty);
  }
}

async function synthesizePlanFromArtifacts(p, list, empty) {
  try {
    const arts = await api(`/api/projects/${p.id}/artifacts`);
    if (!arts.length) return;
    empty.hidden = true; list.hidden = false;

    // Group by session or date-bucket
    const bySession = {};
    arts.forEach(a => {
      const key = a.sessionId || (a.createdAt ? a.createdAt.slice(0, 10) : 'unknown');
      if (!bySession[key]) bySession[key] = [];
      bySession[key].push(a);
    });

    list.innerHTML = '';
    Object.entries(bySession).forEach(([key, group], i) => {
      const ts = group[0].createdAt ? fmtDate(group[0].createdAt) + ' · ' + fmtTime(group[0].createdAt) : key;
      const steps = group.map((a, j) => ({
        id: String(j+1), title: a.title || 'Artifact', skill: a.skill, domain: a.domain,
        status: 'done', artifactId: a.artifactId,
      }));
      const synthSession = { id: key, createdAt: group[0].createdAt, intent: `${group.length} artifact(s) — ${ts}`, steps, status: 'completed' };
      const artifactMap = {};
      group.forEach((a, j) => { artifactMap[String(j+1)] = a; });

      const div = document.createElement('div');
      div.innerHTML = makeSessionFolder(synthSession, i === 0, artifactMap);
      const folder = div.firstElementChild;
      folder.querySelector('.session-folder-hdr').addEventListener('click', function() {
        this.classList.toggle('open');
      });
      folder.querySelectorAll('.progress-item.clickable').forEach(item => {
        if (item.dataset.path) item.addEventListener('click', e => { e.stopPropagation(); openArtifact(item.dataset.path); });
      });
      list.appendChild(folder);
    });
  } catch(e) { console.warn('synthesizePlan:', e); }
}

// ═══════════════════════════════════════════════════════════
// NEW PROJECT
// ═══════════════════════════════════════════════════════════
function showNewProjectModal() {
  $('#npName').value=''; $('#npDesc').value=''; $('#npOwner').value='';
  $('#newProjectModal').hidden = false;
  setTimeout(() => $('#npName').focus(), 50);
}
function hideNewProjectModal() { $('#newProjectModal').hidden = true; }

async function createProject() {
  const name = $('#npName').value.trim();
  if (!name) { $('#npName').focus(); return; }
  try {
    const p = await api('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description: $('#npDesc').value.trim(), owner: $('#npOwner').value.trim() || 'owner' }),
    });
    hideNewProjectModal();
    await loadProjects();
    openProject(p.id);
  } catch (e) { alert(e.message); }
}

// ═══════════════════════════════════════════════════════════
// USER SWITCHER
// ═══════════════════════════════════════════════════════════
function populateUserSwitcher(project) {
  const sw = $('#userSwitcher'); const sel = $('#currentUserSelect');
  if (!project || !project.stakeholders.length) { sw.hidden = true; return; }
  sw.hidden = false;
  sel.innerHTML = '<option value="">Select user…</option>' +
    project.stakeholders.map(m =>
      `<option value="${esc(m.email)}" ${m.email===currentUser?'selected':''}>${esc(m.email)} (${roleLabel(m.role)})</option>`
    ).join('');
}

function roleLabel(r) {
  return ({product_owner:'PO',business_analyst:'BA',project_manager:'PM',reviewer:'SME',stakeholder:'Stakeholder',owner:'Owner'})[r]||r;
}

function switchUser(email) {
  currentUser = email;
  localStorage.setItem('n4ai_user', email);
  refreshWorkflow();
  if (!$('#artifactModal').hidden && currentArtifactWorkflowItem) {
    updateArtifactWorkflowUI(currentArtifactWorkflowItem);
  }
}

// ═══════════════════════════════════════════════════════════
// WORKFLOW ENGINE
// ═══════════════════════════════════════════════════════════
async function refreshWorkflow() {
  if (!currentProject) return;
  try {
    workflowCache = await api(`/api/projects/${currentProject.id}/workflow`);
    renderCollabTab(workflowCache);
    const cards = $('#artifactCards');
    if (cards && !cards.hidden) {
      const arts = await api(`/api/projects/${currentProject.id}/artifacts`);
      renderArtifactCards(arts, false);
    }
  } catch (e) { console.warn('Workflow refresh:', e); }
}

function renderCollabTab(wf) {
  if (!wf) return;
  const myTasks = currentUser ? wf.items.filter(i => i.assignedTo===currentUser && i.status==='in-review') : [];
  const badge = $('#collabBadge');
  badge.textContent = myTasks.length; badge.hidden = !myTasks.length;

  const list = $('#myTasksList'); const empty = $('#myTasksEmpty');
  if (!myTasks.length) { list.innerHTML = ''; empty.style.display='block'; }
  else {
    empty.style.display = 'none';
    list.innerHTML = myTasks.map(item => {
      const ac = item.action==='signoff'?'signoff':'';
      return `<div class="my-task-card" data-art-path="${esc(item.artifactPath||'')}">
        <div class="my-task-title">📄 ${esc(item.artifactTitle||'Artifact')}</div>
        <div class="my-task-meta">From <strong>${shortEmail(item.assignedBy)}</strong> · ${timeAgo(item.assignedAt)}</div>
        ${item.message?`<div class="my-task-meta" style="font-style:italic">"${esc(item.message)}"</div>`:''}
        <span class="my-task-action ${ac}">${item.action==='signoff'?'Sign-off':'Review'}</span>
      </div>`;
    }).join('');
    $$('.my-task-card').forEach(c => c.addEventListener('click', () => {
      if (c.dataset.artPath) openArtifact(c.dataset.artPath);
    }));
  }
  renderActivityLog(wf.log||[]);
}

function renderActivityLog(log) {
  const el = $('#activityLog');
  if (!log.length) { el.innerHTML='<div class="panel-empty"><p>Workflow activity will appear here.</p></div>'; return; }
  el.innerHTML = [...log].reverse().slice(0,40).map(entry => {
    let icon='📋', text='';
    if (entry.type==='assigned') {
      icon='📨'; text=`<strong>${shortEmail(entry.assignedBy)}</strong> assigned <strong>${esc(entry.artifactTitle)}</strong> to <strong>${shortEmail(entry.assignedTo)}</strong> for ${entry.action==='signoff'?'sign-off':'review'}`;
    } else if (entry.type==='reviewed') {
      const di={approved:'✅',rejected:'❌','changes-requested':'🔄'}; icon=di[entry.decision]||'💬';
      const dl={approved:'approved',rejected:'rejected','changes-requested':'requested changes on'}[entry.decision]||'reviewed';
      text=`<strong>${shortEmail(entry.author)}</strong> ${dl} <strong>${esc(entry.artifactTitle)}</strong>`;
    } else if (entry.type==='commented') {
      icon='💬'; text=`<strong>${shortEmail(entry.author)}</strong> commented on <strong>${esc(entry.artifactTitle||entry.artifactId)}</strong>`;
    }
    return `<div class="activity-entry"><span class="activity-icon">${icon}</span><span class="activity-text">${text}</span><span class="activity-time">${timeAgo(entry.timestamp)}</span></div>`;
  }).join('');
}

// ─── Assign ───────────────────────────────────────────────
function openAssignDialog() {
  if (!currentProject || !currentArtifactMeta) return;
  const members = (currentProject.stakeholders||[]).filter(s=>s.email!==currentUser);
  if (!members.length) { alert('Add team members first (Team tab).'); return; }
  $('#assignToSelect').innerHTML = members.map(m=>`<option value="${esc(m.email)}">${esc(m.email)} (${roleLabel(m.role)})</option>`).join('');
  $('#assignArtifactName').textContent = `📄 ${currentArtifactMeta.title||'Artifact'}`;
  $('#assignMessage').value = '';
  $('#assignModal').hidden = false;
}

async function submitAssignment() {
  const assignedTo=$('#assignToSelect').value;
  if (!assignedTo||!currentArtifactMeta||!currentUser) return;
  try {
    $('#submitAssignBtn').disabled=true;
    await api(`/api/projects/${currentProject.id}/workflow/assign`,{
      method:'POST',
      body: JSON.stringify({
        artifactId:currentArtifactMeta.artifactId, artifactTitle:currentArtifactMeta.title,
        artifactPath:currentArtifactMeta.path, domain:currentArtifactMeta.domain,
        skill:currentArtifactMeta.skill, assignedTo, assignedBy:currentUser,
        action:$('#assignActionSelect').value, message:$('#assignMessage').value.trim(),
      }),
    });
    $('#assignModal').hidden=true;
    showToast(`Assigned to ${shortEmail(assignedTo)}`);
    await refreshWorkflow();
    await loadArtifactWorkflow(currentArtifactMeta.artifactId);
  } catch(e) { alert('Assign failed: '+e.message); }
  finally { $('#submitAssignBtn').disabled=false; }
}

// ─── Review ────────────────────────────────────────────────
async function submitReview(decision) {
  if (!currentArtifactWorkflowItem||!currentUser) return;
  const comment=$('#reviewComment').value.trim();
  try {
    await api(`/api/projects/${currentProject.id}/workflow/review`,{
      method:'POST',
      body: JSON.stringify({ itemId:currentArtifactWorkflowItem.itemId, author:currentUser, decision, comment }),
    });
    showToast({approved:'Approved ✅',rejected:'Rejected ❌','changes-requested':'Changes requested 🔄'}[decision]||'Submitted');
    await refreshWorkflow();
    await loadArtifactWorkflow(currentArtifactWorkflowItem.artifactId);
  } catch(e) { alert('Review failed: '+e.message); }
}

async function loadArtifactWorkflow(artifactId) {
  if (!currentProject||!artifactId) return;
  try {
    const item = await api(`/api/projects/${currentProject.id}/workflow/artifact/${encodeURIComponent(artifactId)}`);
    currentArtifactWorkflowItem = item;
    updateArtifactWorkflowUI(item);
  } catch(e) { currentArtifactWorkflowItem=null; updateArtifactWorkflowUI(null); }
}

function updateArtifactWorkflowUI(item) {
  const badge=$('#wfStatusBadge'); const rp=$('#reviewPanel'); const ab=$('#assignArtifactBtn');
  $('#reviewComment').value='';
  if (!item) {
    badge.hidden=true; rp.hidden=true;
    if(ab) ab.hidden=!currentUser; return;
  }
  const sl={
    'in-review':'🔵 In Review', approved:'✅ Approved',
    'changes-requested':'🔄 Changes Needed', rejected:'❌ Rejected',
  };
  badge.textContent=sl[item.status]||item.status;
  badge.className=`wf-status-badge ${item.status}`; badge.hidden=false;
  if (ab) { ab.hidden=!currentUser||item.status==='in-review'; ab.textContent=item.status==='draft'?'↗ Assign':'↗ Re-assign'; }
  const isMyTask=currentUser&&item.assignedTo===currentUser&&item.status==='in-review';
  if (isMyTask) {
    rp.hidden=false;
    const al=item.action==='signoff'?'sign-off on':'review';
    $('#reviewPanelInfo').innerHTML=`📨 <strong>${shortEmail(item.assignedBy)}</strong> asked you to <strong>${al}</strong> this artifact.`+(item.message?` <em style="color:var(--text-3)">"${esc(item.message)}"</em>`:'');
    const prev=$('#reviewCommentsPrev');
    prev.innerHTML=(item.comments||[]).map(c=>{
      const dc={approved:'var(--green-text)',rejected:'var(--red-text)','changes-requested':'var(--amber-text)'}; const dl={approved:'Approved',rejected:'Rejected','changes-requested':'Changes'}[c.decision]||'';
      return `<div class="review-comment-item"><span class="rc-author">${shortEmail(c.author)}</span>${dl?`<span class="rc-decision" style="color:${dc[c.decision]||'var(--text-2)'}">${dl}</span>`:''} ${c.text?`<span style="color:var(--text-3)">: ${esc(c.text)}</span>`:''}</div>`;
    }).join('');
  } else { rp.hidden=true; }
}

// ═══════════════════════════════════════════════════════════
// COMMENT SYSTEM
// ═══════════════════════════════════════════════════════════
let commentsVisible = false;

function toggleCommentsPanel() {
  commentsVisible = !commentsVisible;
  $('#commentsPanel').hidden = !commentsVisible;
  $('#toggleCommentsBtn').classList.toggle('active', commentsVisible);
  if (commentsVisible && currentArtifactMeta) loadAndRenderComments(currentArtifactMeta.artifactId);
}

async function loadAndRenderComments(artifactId) {
  if (!currentProject||!artifactId) return;
  try {
    currentArtifactComments = await api(`/api/projects/${currentProject.id}/workflow/comments/${encodeURIComponent(artifactId)}`);
    renderComments();
  } catch(e) { currentArtifactComments=[]; renderComments(); }
}

function renderComments() {
  const list=$('#commentsList');
  const count=currentArtifactComments.length;

  // Update count badge
  const cb=$('#commentCount');
  if (count>0) { cb.textContent=count; cb.hidden=false; } else { cb.hidden=true; }

  // Show/hide refine bar
  const unresolved=currentArtifactComments.filter(c=>!c.resolved);
  $('#refineBar').hidden = unresolved.length===0;

  if (!count) {
    list.innerHTML='<div style="padding:16px 0;text-align:center;color:var(--text-3);font-size:11px;line-height:1.6">No comments yet.<br/>Select text in the rendered view to comment on a specific section,<br/>or click <strong>+ Add</strong> for a general comment.</div>';
    return;
  }

  list.innerHTML = currentArtifactComments.map(c => {
    const anchor = c.anchorText ? `<div class="comment-card-anchor" title="Jump to section">"${esc(c.anchorText.slice(0,120))}${c.anchorText.length>120?'…':''}"</div>` : '';
    const resolvedTag = c.resolved ? `<span class="comment-resolved-tag">✅ Resolved by ${shortEmail(c.resolvedBy)}</span>` : `<button class="btn-resolve" data-cmt-id="${esc(c.id)}">Mark resolved</button>`;
    return `<div class="comment-card ${c.resolved?'resolved':''}" id="cmt-${esc(c.id)}">
      ${anchor}
      <div class="comment-card-author">
        <span class="comment-card-name">${shortEmail(c.author)}</span>
        <span class="comment-card-time">${timeAgo(c.timestamp)}</span>
      </div>
      <div class="comment-card-text">${esc(c.comment)}</div>
      <div class="comment-card-footer">${resolvedTag}</div>
    </div>`;
  }).join('');

  $$('.btn-resolve').forEach(btn => btn.addEventListener('click', () => resolveComment(btn.dataset.cmtId)));
  $$('.comment-card-anchor').forEach(anchor => anchor.addEventListener('click', () => {
    // Highlight the anchor text in the rendered view
    highlightAnchorInView(anchor.textContent.replace(/^"|"$/g,'').replace(/…$/,''));
  }));
}

async function resolveComment(commentId) {
  if (!currentProject||!currentUser) { alert('Select a user first (Acting as dropdown)'); return; }
  try {
    await api(`/api/projects/${currentProject.id}/workflow/comment/${commentId}/resolve`,{
      method:'POST', body:JSON.stringify({resolvedBy:currentUser}),
    });
    await loadAndRenderComments(currentArtifactMeta.artifactId);
    await refreshWorkflow();
    showToast('Comment resolved ✅');
  } catch(e) { alert('Error: '+e.message); }
}

function highlightAnchorInView(text) {
  const rendered=$('#artifactRendered');
  if (!rendered||rendered.hidden) return;
  const walker=document.createTreeWalker(rendered,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())) {
    const idx=node.textContent.indexOf(text.slice(0,60));
    if (idx>=0) {
      const el=node.parentElement;
      if (el) { el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.background='rgba(227,179,65,.25)'; setTimeout(()=>{el.style.background='';},2000); }
      break;
    }
  }
}

// Text selection → floating comment button ─────────────────
function handleTextSelection() {
  const sel=window.getSelection();
  const rendered=$('#artifactRendered');
  const fb=$('#floatingCommentBtn');
  if (!sel||!sel.toString().trim()||sel.toString().trim().length<4) { fb.hidden=true; return; }
  // Only show when selection is inside the rendered artifact
  try {
    const range=sel.getRangeAt(0);
    if (!rendered||!rendered.contains(range.commonAncestorContainer)) { fb.hidden=true; return; }
    const rect=range.getBoundingClientRect();
    fb.style.top=(rect.bottom+window.scrollY+8)+'px';
    fb.style.left=Math.min(rect.left+window.scrollX, window.innerWidth-220)+'px';
    fb.hidden=false;
    pendingCommentAnchor=sel.toString().trim();
  } catch { fb.hidden=true; }
}

function openInlineComment() {
  $('#floatingCommentBtn').hidden=true;
  if (!commentsVisible) toggleCommentsPanel();
  const anchor=pendingCommentAnchor;
  if (anchor) {
    $('#addCommentAnchor').hidden=false;
    $('#addCommentAnchorText').textContent=anchor.slice(0,200)+(anchor.length>200?'…':'');
  } else {
    $('#addCommentAnchor').hidden=true;
  }
  $('#addCommentForm').hidden=false;
  $('#addCommentText').value='';
  setTimeout(()=>$('#addCommentText').focus(),50);
}

function openGeneralComment() {
  pendingCommentAnchor='';
  if (!commentsVisible) toggleCommentsPanel();
  $('#addCommentAnchor').hidden=true;
  $('#addCommentForm').hidden=false;
  $('#addCommentText').value='';
  setTimeout(()=>$('#addCommentText').focus(),50);
}

async function submitComment() {
  const text=$('#addCommentText').value.trim();
  if (!text) return;
  if (!currentUser) { alert('Please select "Acting as" in the topbar first.'); return; }
  if (!currentArtifactMeta) return;
  try {
    $('#submitCommentBtn').disabled=true;
    await api(`/api/projects/${currentProject.id}/workflow/comment`,{
      method:'POST',
      body: JSON.stringify({
        artifactId:currentArtifactMeta.artifactId,
        itemId:currentArtifactWorkflowItem?.itemId||null,
        author:currentUser,
        anchorText:pendingCommentAnchor||'',
        comment:text,
      }),
    });
    $('#addCommentForm').hidden=true;
    $('#addCommentText').value='';
    pendingCommentAnchor='';
    await loadAndRenderComments(currentArtifactMeta.artifactId);
    await refreshWorkflow();
    showToast('Comment posted 💬');
  } catch(e) { alert('Error: '+e.message); }
  finally { $('#submitCommentBtn').disabled=false; }
}

// ─── Refine with AI ────────────────────────────────────────
async function refineWithAI() {
  if (!currentArtifactMeta||!currentProject) return;
  const unresolved=currentArtifactComments.filter(c=>!c.resolved);
  if (!unresolved.length) { showToast('No unresolved comments to refine with.'); return; }

  const commentLines=unresolved.map((c,i)=>{
    const anchor=c.anchorText?` [on: "${c.anchorText.slice(0,80)}"]`:'';
    return `${i+1}. ${c.author}${anchor}: ${c.comment}`;
  }).join('\n');

  const refinementPrompt=`Refine the artifact "${currentArtifactMeta.title}" (skill: ${currentArtifactMeta.skill}) based on these reviewer comments:\n\n${commentLines}\n\nProduce an updated version that addresses all the feedback above.`;

  // Close modal, send message
  $('#artifactModal').hidden=true;
  $('#msgInput').value=refinementPrompt;
  resizeTextarea($('#msgInput'));
  showToast('Refinement prompt loaded — press Send to run ✨');
  $('#msgInput').focus();
}

// ═══════════════════════════════════════════════════════════
// TEAM
// ═══════════════════════════════════════════════════════════
function renderTeam(p) {
  $('#stakeList').innerHTML = p.stakeholders.map(s =>
    `<li><span class="stake-email">${esc(s.email)}</span><span class="stake-role-tag">${esc(s.role)}</span>
     ${s.role!=='owner'?`<button class="stake-rm" data-email="${esc(s.email)}">✕</button>`:''}</li>`
  ).join('') || '<li style="color:var(--text-3);font-size:11px;padding:4px 0">No team members yet</li>';
  $$('#stakeList .stake-rm').forEach(btn => btn.addEventListener('click', async () => {
    await fetch(`/api/projects/${currentProject.id}/stakeholders/${encodeURIComponent(btn.dataset.email)}`,{method:'DELETE'});
    currentProject=await api('/api/projects/'+currentProject.id);
    renderTeam(currentProject); populateUserSwitcher(currentProject);
  }));
}

async function addStakeholder() {
  const email=$('#stEmail').value.trim(); const role=$('#stRole').value;
  if (!email) return;
  try {
    currentProject=await api(`/api/projects/${currentProject.id}/stakeholders`,{method:'POST',body:JSON.stringify({email,role})});
    $('#stEmail').value='';
    renderTeam(currentProject); populateUserSwitcher(currentProject);
    await loadProjects();
  } catch(e) { alert(e.message); }
}

// ═══════════════════════════════════════════════════════════
// ARTIFACTS
// ═══════════════════════════════════════════════════════════
async function refreshArtifacts() {
  if (!currentProject) return;
  const arts=await api(`/api/projects/${currentProject.id}/artifacts`);
  renderArtifactCards(arts,false);
}

function renderArtifactCards(arts, highlightNew=false) {
  const container=$('#artifactCards'); const empty=$('#outputsEmpty');
  if (!arts.length) { container.hidden=true; empty.hidden=false; return; }
  empty.hidden=true; container.hidden=false;

  const wfMap={};
  if (workflowCache?.items) workflowCache.items.forEach(i=>wfMap[i.artifactId]=i);

  function makeCard(a, isNew) {
    const wf=wfMap[a.artifactId];
    const wfBadge=wf?`<span class="artifact-wf-badge ${wf.status}">${wfStatusLabel(wf.status)}</span>`:'';
    const cmtCount=(workflowCache?.comments||[]).filter(c=>c.artifactId===a.artifactId&&!c.resolved).length;
    const cmtBadge=cmtCount?`<span title="${cmtCount} open comment(s)" style="font-size:9px;color:var(--amber-text)">💬 ${cmtCount}</span>`:'';
    const verBadge = a.version>1 ? `<span class="ver-badge">v${a.version}</span>` : '';
    const dateStr = a.createdAt ? fmtDate(a.createdAt) : '';
    const stale = a.isLatest===false;
    // Split title at " — " to show project context on second line
    const dash = (a.title||'').indexOf(' — ');
    const mainTitle = dash>0 ? a.title.slice(0,dash) : (a.title||'Artifact');
    const subTitle  = dash>0 ? a.title.slice(dash+3) : '';
    return `<div class="artifact-card ${stale?'artifact-card-stale':''}" data-path="${esc(a.path)}">
      <div class="artifact-card-top">
        ${isNew?'<span class="artifact-new-dot"></span>':''}
        ${wfBadge}${cmtBadge}${verBadge}
      </div>
      <div class="artifact-title">${esc(mainTitle)}</div>
      ${subTitle?`<div class="artifact-subtitle">${esc(subTitle)}</div>`:''}
      <div class="artifact-meta">
        <span>${esc(a.skill||'')}</span>
        ${dateStr?`<span class="artifact-meta-sep">·</span><span>${dateStr}</span>`:''}
      </div>
    </div>`;
  }

  // Group by domain
  const domainOrder = ['product-management','project-management'];
  const byDomain = {};
  arts.forEach(a=>{ const d=a.domain||'other'; (byDomain[d]=byDomain[d]||[]).push(a); });

  const allDomains = [...new Set([...domainOrder, ...Object.keys(byDomain)])].filter(d=>byDomain[d]);
  const domainLabels = {'product-management':'Product Management','project-management':'Project Management','other':'Other'};

  container.innerHTML = '';

  allDomains.forEach(domain => {
    const domArts = byDomain[domain];
    const latest = domArts.filter(a=>a.isLatest!==false);
    const older  = domArts.filter(a=>a.isLatest===false);
    const domLabel = domainLabels[domain]||domain;
    const section = document.createElement('div');
    section.className = 'artifact-section';

    let html = `<div class="artifact-section-hdr">${esc(domLabel)}<span class="artifact-section-count">${latest.length}</span></div>`;
    html += `<div class="artifact-cards">`;
    latest.forEach((a,i) => { html += makeCard(a, highlightNew && i===0 && domain===allDomains[0]); });
    html += `</div>`;

    if (older.length) {
      const uid = 'older-'+domain.replace(/\W/g,'_');
      html += `<div class="artifact-older-toggle" data-uid="${uid}">▾ ${older.length} older version${older.length>1?'s':''}</div>`;
      html += `<div class="artifact-older-group" id="${uid}"><div class="artifact-cards">`;
      older.forEach(a => { html += makeCard(a, false); });
      html += `</div></div>`;
    }

    section.innerHTML = html;
    container.appendChild(section);
  });

  // Wire clicks
  container.querySelectorAll('.artifact-card').forEach(card => {
    card.addEventListener('click', ()=>openArtifact(card.dataset.path));
  });
  // Wire older version toggles
  container.querySelectorAll('.artifact-older-toggle').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const grp=document.getElementById(btn.dataset.uid);
      if(grp){ grp.classList.toggle('open'); btn.textContent = grp.classList.contains('open') ? '▴ hide older versions' : `▾ ${byDomain[btn.closest('.artifact-section').querySelector('.artifact-section-hdr').textContent.trim().replace(/\d+/,'').trim()]?.filter(a=>a.isLatest===false).length||''} older version(s)`; }
    });
  });
}

function wfStatusLabel(s){return{'in-review':'In Review',approved:'Approved','changes-requested':'Changes',rejected:'Rejected'}[s]||s;}

let currentArtifactRaw='';

async function openArtifact(path) {
  currentArtifactWorkflowItem=null; currentArtifactMeta=null;
  currentArtifactComments=[]; commentsVisible=false;
  $('#commentsPanel').hidden=true; $('#toggleCommentsBtn').classList.remove('active');
  $('#commentCount').hidden=true; $('#addCommentForm').hidden=true;
  $('#floatingCommentBtn').hidden=true;

  const [raw, arts] = await Promise.all([
    fetch(`/api/projects/${currentProject.id}/artifact?path=${encodeURIComponent(path)}`).then(r=>r.text()),
    api(`/api/projects/${currentProject.id}/artifacts`),
  ]);
  const art=arts.find(a=>a.path===path);
  if (art) currentArtifactMeta={artifactId:art.artifactId,title:art.title,domain:art.domain,skill:art.skill,path:art.path};

  const content=raw.replace(/^---[\s\S]*?---\s*\n/,'').trim();
  currentArtifactRaw=content;
  const verLabel = art?.version>1 ? ` (v${art.version})` : '';
  $('#artifactModalTitle').textContent=(art?.title||'Artifact')+verLabel;
  $('#artifactModalBadge').textContent=art?.skill||'';
  $('#wfStatusBadge').hidden=true; $('#reviewPanel').hidden=true;
  const ab=$('#assignArtifactBtn'); if(ab) ab.hidden=!currentUser;

  const htmlFence=content.match(/```html\s*\n([\s\S]*?)```/);
  if (htmlFence) { showArtifactIframe(htmlFence[1]); $('#artifactSource').textContent=content; }
  else { showArtifactRendered(content); $('#artifactSource').textContent=content; }

  switchArtifactTab('rendered');
  $('#artifactModal').hidden=false;

  if (art?.artifactId) {
    await Promise.all([
      loadArtifactWorkflow(art.artifactId),
      loadAndRenderComments(art.artifactId),
    ]);
  }
}

function showArtifactIframe(html) {
  const iframe=$('#artifactIframe'); const rendered=$('#artifactRendered');
  rendered.hidden=true; iframe.hidden=false; iframe.srcdoc=html;
  $('#tabRendered').textContent='Preview'; $('#tabSource').textContent='Markdown';
}

function showArtifactRendered(markdown) {
  $('#artifactIframe').hidden=true; $('#artifactRendered').hidden=false;
  $('#tabRendered').textContent='Rendered'; $('#tabSource').textContent='Source';
  const norm=markdown.replace(/\[mermaid\]\s*\n([\s\S]*?)\[\/mermaid\]/g,'```mermaid\n$1```');
  if (typeof marked==='undefined') { $('#artifactRendered').innerHTML=`<pre style="white-space:pre-wrap;color:var(--text-2)">${esc(markdown)}</pre>`; return; }
  const renderer=new marked.Renderer();
  renderer.code=(code,lang)=>{
    if(lang==='mermaid'){const id='mm-'+Math.random().toString(36).slice(2,8);return `<div class="mermaid" id="${id}">${esc(code)}</div>`;}
    return `<pre><code>${esc(code)}</code></pre>`;
  };
  marked.setOptions({renderer,breaks:true,gfm:true});
  $('#artifactRendered').innerHTML=marked.parse(norm);
  if(typeof mermaid!=='undefined') setTimeout(()=>{try{mermaid.run({nodes:$('#artifactRendered').querySelectorAll('.mermaid')});}catch(e){console.warn('Mermaid:',e);}},100);
}

function switchArtifactTab(tab) {
  $$('.artifact-view-tab').forEach(t=>t.classList.toggle('active',t.dataset.view===tab));
  const iframe=$('#artifactIframe');
  if (tab==='rendered') {
    if (!iframe.hidden||iframe.srcdoc){$('#artifactRendered').hidden=true;iframe.hidden=false;}
    else{$('#artifactRendered').hidden=false;iframe.hidden=true;}
    $('#artifactSource').hidden=true;
  } else {
    iframe.hidden=true; $('#artifactRendered').hidden=true; $('#artifactSource').hidden=false;
  }
}

// ═══════════════════════════════════════════════════════════
// SUPER AGENT — SSE STREAMING
// ═══════════════════════════════════════════════════════════
async function sendMessage() {
  if (!currentProject||running) return;
  const msg=$('#msgInput').value.trim();
  if (!msg) return;
  $('#msgInput').value=''; resizeTextarea($('#msgInput'));
  running=true; $('#sendBtn').disabled=true;
  appendUserBubble(msg);
  taskPlan={}; pendingArtifacts=[];
  switchTab('plan');
  try {
    const resp=await fetch(`/api/projects/${currentProject.id}/invoke-stream`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:msg}),
    });
    if (!resp.ok) throw new Error(`Server error ${resp.status}`);
    const reader=resp.body.getReader(); const decoder=new TextDecoder(); let buffer='';
    while(true){
      const{done,value}=await reader.read(); if(done) break;
      buffer+=decoder.decode(value,{stream:true});
      const parts=buffer.split('\n\n'); buffer=parts.pop();
      for(const part of parts){
        if(!part.trim()||part.startsWith(':')) continue;
        const em=part.match(/^event:\s*(.+)$/m); const dm=part.match(/^data:\s*(.+)$/m);
        if(!em||!dm) continue;
        try { handleSSEEvent(em[1].trim(),JSON.parse(dm[1].trim())); } catch(e){console.warn('SSE:',e);}
      }
    }
  } catch(e) { appendReply(`⚠️ Error: ${e.message}. Please try again.`); }
  finally {
    running=false; $('#sendBtn').disabled=false;
    await refreshArtifacts();
    if(pendingArtifacts.length){const arts=await api(`/api/projects/${currentProject.id}/artifacts`);renderArtifactCards(arts,true);}
    currentProject=await api('/api/projects/'+currentProject.id);
    renderTeam(currentProject); loadProjects(); await refreshWorkflow();
  }
}

function handleSSEEvent(type,data){
  switch(type){
    case'plan':{
      const{steps,intent,sessionId}=data; taskPlan={}; currentSessionId=sessionId||null;
      steps.forEach(s=>{taskPlan[s.id]={...s};});
      $('#planEmpty').hidden=true; $('#taskPlanList').hidden=false;
      // Create a live session folder at the top
      const liveSession = {
        id: sessionId||'live', createdAt: new Date().toISOString(),
        intent: intent||'', steps: steps.filter(s=>s.id!=='__plan'&&s.id!=='notify'),
        status:'running',
      };
      const div=document.createElement('div');
      div.innerHTML=makeSessionFolder(liveSession,true,{});
      const folder=div.firstElementChild;
      folder.querySelector('.session-folder-hdr').addEventListener('click',function(){this.classList.toggle('open');});
      // Prepend (push to top, above any previous sessions)
      if($('#taskPlanList').firstChild) {
        $('#taskPlanList').insertBefore(folder,$('#taskPlanList').firstChild);
      } else {
        $('#taskPlanList').appendChild(folder);
      }
      break;}
    case'step_start':{
      const{stepId,title}=data;
      // Update Cowork checklist
      const pc=$(`#pc-${stepId}`); const pt=$(`#pt-${stepId}`); const pi=$(`#pi-${stepId}`);
      if(pc){pc.className='progress-check running'; pc.textContent='';}
      if(pt){pt.className='progress-label-title running'; pt.textContent=title||pt.textContent;}
      // Legacy execLog dot
      const item=$(`#task-${stepId}`);
      if(item){item.className='task-item running';}
      const dot=$(`#dot-${stepId}`); if(dot){dot.className='task-dot running';}
      const el=document.createElement('div');
      el.className='log-step'; el.id=`step-${stepId}`;
      el.innerHTML=`<div class="step-header"><div class="step-status-dot running" id="sdot-${stepId}"></div>
        <div class="step-label"><span class="step-num">${getStepNum(stepId)}</span><span class="step-title">${esc(title)}</span></div>
        <span class="step-status-text running" id="sstatus-${stepId}">Running…</span></div>
        <div class="step-body" id="sbody-${stepId}"></div>`;
      $('#execLog').appendChild(el); scrollLog(); break;}
    case'step_progress':{
      const body=$(`#sbody-${data.stepId}`);
      if(body){const m=document.createElement('div');m.className='step-progress-msg';m.textContent=data.message;body.appendChild(m);scrollLog();}
      break;}
    case'step_complete':{
      const{stepId,output,error}=data; const st=error?'error':'done';
      // Update Cowork checklist
      const pc=$(`#pc-${stepId}`); const pt=$(`#pt-${stepId}`);
      if(pc){pc.className=`progress-check ${st}`; pc.textContent=st==='done'?'✓':'✕';}
      if(pt){pt.className=`progress-label-title ${st}`;}
      // Legacy execLog
      const sdot=$(`#sdot-${stepId}`); const ss=$(`#sstatus-${stepId}`); const sel=$(`#step-${stepId}`);
      if(sdot) sdot.className=`step-status-dot ${st}`;
      if(ss){ss.className=`step-status-text ${st}`;ss.textContent=error?'Error':'Done';}
      if(sel&&output){const h=sel.querySelector('.step-header');if(h) h.style.borderBottomColor='transparent';const o=document.createElement('div');o.className='step-output';o.textContent=output;sel.appendChild(o);}
      const item=$(`#task-${stepId}`); if(item) item.className=`task-item ${st}`;
      scrollLog(); break;}
    case'artifact':{
      const{artifactId,title,domain,skill,path}=data;
      pendingArtifacts.push({artifactId,title,domain,skill,path});
      const pill=document.createElement('div');
      pill.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-2);border:1px solid var(--border);border-radius:8px;font-size:12px;cursor:pointer';
      pill.innerHTML=`<span class="artifact-badge ${domain}" style="font-size:9px">${domain==='product-management'?'PROD MGT':'PROJ MGT'}</span>
        <span style="font-weight:600;color:var(--text)">📄 ${esc(title)}</span>
        <span style="color:var(--green-text);margin-left:auto;font-size:11px">↗ Open</span>`;
      pill.addEventListener('click',()=>openArtifact(path));
      $('#execLog').appendChild(pill); scrollLog(); break;}
    case'reply':appendReply(data.text);break;
    case'error':appendReply(`⚠️ ${data.message}`);break;
  }
}

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════
function getStepNum(id){if(id==='__plan')return'✦';if(id==='notify')return'📧';return id;}

function appendUserBubble(msg){
  const el=document.createElement('div'); el.className='log-user';
  el.innerHTML=`<div class="log-user-bubble">${esc(msg)}</div>`;
  $('#execLog').appendChild(el); scrollLog();
}
function appendReply(text){
  const el=document.createElement('div'); el.className='log-reply';
  el.innerHTML=`<div class="log-reply-avatar">✦</div><div class="log-reply-text">${mdLite(text)}</div>`;
  $('#execLog').appendChild(el); scrollLog();
}
function scrollLog(){const l=$('#execLog');if(l) l.scrollTop=l.scrollHeight;}
function mdLite(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');}
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function resizeTextarea(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
function shortEmail(e){if(!e) return'?'; return esc(e.split('@')[0]);}
function timeAgo(iso){
  if(!iso) return''; const d=Date.now()-new Date(iso).getTime();
  const m=Math.floor(d/60000); if(m<1) return'just now'; if(m<60) return`${m}m ago`;
  const h=Math.floor(m/60); if(h<24) return`${h}h ago`; return`${Math.floor(h/24)}d ago`;
}
function showToast(msg){
  const el=document.createElement('div');
  el.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--bg-3);border:1px solid var(--border);color:var(--text);padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.4);animation:slideIn .2s ease';
  el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
}

// ═══════════════════════════════════════════════════════════
// PANEL TABS
// ═══════════════════════════════════════════════════════════
function switchTab(name){
  $$('.panel-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
  $('#tabPlan').hidden=name!=='plan'; $('#tabOutputs').hidden=name!=='outputs';
  $('#tabCollab').hidden=name!=='collab'; $('#tabTeam').hidden=name!=='team';
}

// ═══════════════════════════════════════════════════════════
// WIRE EVENTS
// ═══════════════════════════════════════════════════════════
function wireEvents() {
  // ── New Project ────────────────────────────────────────
  on('#newProjectBtn',     'click', showNewProjectModal);
  on('#emptyNewProjectBtn','click', showNewProjectModal);
  on('#modalClose',        'click', hideNewProjectModal);
  on('#cancelNewProject',  'click', hideNewProjectModal);
  on('#newProjectModal',   'click', e => { if (e.target === e.currentTarget) hideNewProjectModal(); });
  on('#createProjectBtn',  'click', createProject);

  // ── Message input ──────────────────────────────────────
  on('#msgInput','input',   e => resizeTextarea(e.target));
  on('#msgInput','keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  on('#sendBtn', 'click',   sendMessage);
  $$('.chip').forEach(btn => btn.addEventListener('click', () => {
    const input = $('#msgInput');
    input.value = btn.textContent.trim();
    resizeTextarea(input);
    sendMessage();
  }));

  // ── Panel tabs ─────────────────────────────────────────
  $$('.panel-tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

  // ── Artifact modal ─────────────────────────────────────
  const closeArt = () => {
    $('#artifactModal').hidden=true;
    $('#commentsPanel').hidden=true;
    $('#toggleCommentsBtn').classList.remove('active');
    $('#floatingCommentBtn').hidden=true;
  };
  on('#artifactModalClose','click', closeArt);
  on('#artifactModal',     'click', e => { if (e.target === e.currentTarget) closeArt(); });
  on('#copyArtifactBtn',   'click', () => {
    const src = $('#artifactSource');
    const text = src && !src.hidden ? src.textContent : ($('#artifactRendered').innerText || '');
    navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed'));
  });
  on('#toggleCommentsBtn', 'click', toggleCommentsPanel);
  on('#assignArtifactBtn', 'click', openAssignDialog);
  on('#tabRendered',       'click', () => switchArtifactTab('rendered'));
  on('#tabSource',         'click', () => switchArtifactTab('source'));

  // ── Comments ───────────────────────────────────────────
  on('#addGeneralCommentBtn','click', openGeneralComment);
  on('#submitCommentBtn',    'click', submitComment);
  on('#cancelCommentBtn',    'click', () => { $('#addCommentForm').hidden=true; });
  on('#refineWithAIBtn',     'click', refineWithAI);
  document.addEventListener('mouseup', handleTextSelection);
  on('#floatingCommentBtn',  'click', openInlineComment);

  // ── Review actions ─────────────────────────────────────
  on('#btnApprove',        'click', () => submitReview('approved'));
  on('#btnRequestChanges', 'click', () => submitReview('changes_requested'));
  on('#btnReject',         'click', () => submitReview('rejected'));

  // ── Assign modal ───────────────────────────────────────
  on('#assignModalClose','click', () => { $('#assignModal').hidden=true; });
  on('#assignModal',     'click', e => { if (e.target === e.currentTarget) $('#assignModal').hidden=true; });
  on('#cancelAssignBtn', 'click', () => { $('#assignModal').hidden=true; });
  on('#submitAssignBtn', 'click', submitAssignment);

  // ── User switcher ──────────────────────────────────────
  on('#currentUserSelect','change', e => switchUser(e.target.value));

  // ── Team ───────────────────────────────────────────────
  on('#addStakeBtn','click', addStakeholder);
  on('#stEmail',   'keydown', e => { if (e.key==='Enter') addStakeholder(); });
}

document.addEventListener('DOMContentLoaded', boot);
