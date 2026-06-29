/* nivi4AI — Collaborative Workspace Client */
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const api = (u, o) => fetch(u, { headers: { 'Content-Type': 'application/json' }, ...o }).then(r => r.ok ? r.json() : r.json().then(e => { throw new Error(e.error || r.statusText); }));

let currentProject = null;       // full project object
let taskPlan = {};               // stepId → { title, status }
let pendingArtifacts = [];       // artifacts produced in current run
let running = false;

// ─── WORKFLOW STATE ────────────────────────────────────────
let currentUser = localStorage.getItem('n4ai_user') || '';
let currentArtifactMeta = null;      // { artifactId, title, domain, skill, path }
let currentArtifactWorkflowItem = null;  // workflow item for open artifact
let workflowCache = null;            // cached { items, log } for current project

// ═══════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════
async function boot() {
  try {
    const meta = await api('/api/meta');
    const pill = $('#modepill');
    pill.textContent = `${meta.mode} · ${meta.model.split('-').slice(0,2).join('-')}`;
    if (meta.mode === 'LIVE') pill.classList.add('live');
    renderSkillList(meta.skills);
    await loadProjects();
  } catch (e) {
    console.error('Boot error:', e);
  }
  wireEvents();
}

// ═══════════════════════════════════════════════
// SKILL REGISTRY
// ═══════════════════════════════════════════════
function renderSkillList(skills) {
  const byDomain = {};
  skills.forEach(s => (byDomain[s.domain] ||= []).push(s));
  const html = Object.entries(byDomain).map(([d, list]) =>
    `<div class="skill-domain">${d.replace('-', ' ')}</div>` +
    list.map(s => `<div class="skill-item" title="${s.description}">${s.name}</div>`).join('')
  ).join('');
  $('#skillList').innerHTML = html;
  $('#skillCount').textContent = skills.length;
}

// ═══════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════
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
      <span class="pj-meta">${p.stage} · ${p.stakeholders.length} member${p.stakeholders.length !== 1 ? 's' : ''}</span>
    </li>`
  ).join('');
  $$('#projectList li[data-id]').forEach(li =>
    li.addEventListener('click', () => openProject(li.dataset.id))
  );
}

async function openProject(id) {
  const p = await api('/api/projects/' + id);
  currentProject = p;

  // Update topbar
  $('#topbarProjectName').textContent = p.name;
  const stageBadge = $('#topbarStage');
  stageBadge.textContent = p.stage;
  stageBadge.hidden = false;

  // Show right panel + exec view
  $('#emptyState').hidden = true;
  $('#execView').hidden = false;
  $('#rightPanel').hidden = false;

  // Reset exec log to welcome
  resetExecLog(p);

  // Load artifacts, team, and workflow
  await refreshArtifacts();
  renderTeam(p);
  populateUserSwitcher(p);
  await refreshWorkflow();
  await loadProjects(); // refresh active state
}

function resetExecLog(p) {
  taskPlan = {};
  pendingArtifacts = [];
  $('#taskPlanList').hidden = true;
  $('#planEmpty').hidden = false;
  $('#taskPlanList').innerHTML = '';

  const log = $('#execLog');
  log.innerHTML = `
    <div class="log-welcome">
      <div class="log-welcome-icon">✦</div>
      <div class="log-welcome-text">
        <strong>${esc(p.name)}</strong>
        <span>${esc(p.description || 'Describe what you need below and the Super Agent will handle it.')}</span>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════
// NEW PROJECT MODAL
// ═══════════════════════════════════════════════
function showNewProjectModal() {
  $('#npName').value = '';
  $('#npDesc').value = '';
  $('#npOwner').value = '';
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

// ═══════════════════════════════════════════════
// USER SWITCHER (persona selector)
// ═══════════════════════════════════════════════
function populateUserSwitcher(project) {
  const sw = $('#userSwitcher');
  const sel = $('#currentUserSelect');
  if (!project || !project.stakeholders.length) {
    sw.hidden = true;
    return;
  }
  sw.hidden = false;

  const members = project.stakeholders;
  sel.innerHTML = '<option value="">Select user…</option>' +
    members.map(m => `<option value="${esc(m.email)}" ${m.email === currentUser ? 'selected' : ''}>${esc(m.email)} (${roleLabel(m.role)})</option>`).join('');
}

function roleLabel(role) {
  const map = {
    product_owner: 'PO', business_analyst: 'BA',
    project_manager: 'PM', reviewer: 'SME', stakeholder: 'Stakeholder', owner: 'Owner',
  };
  return map[role] || role;
}

function switchUser(email) {
  currentUser = email;
  localStorage.setItem('n4ai_user', email);
  refreshWorkflow();
}

// ═══════════════════════════════════════════════
// WORKFLOW ENGINE
// ═══════════════════════════════════════════════
async function refreshWorkflow() {
  if (!currentProject) return;
  try {
    workflowCache = await api(`/api/projects/${currentProject.id}/workflow`);
    renderCollabTab(workflowCache);
    // Re-render artifact cards with updated workflow badges
    if ($('#artifactCards') && !$('#artifactCards').hidden) {
      const arts = await api(`/api/projects/${currentProject.id}/artifacts`);
      renderArtifactCards(arts, false);
    }
  } catch (e) {
    console.warn('Workflow refresh error:', e);
  }
}

function renderCollabTab(wf) {
  if (!wf) return;
  const myTasks = currentUser
    ? wf.items.filter(i => i.assignedTo === currentUser && i.status === 'in-review')
    : [];

  // Update badge
  const badge = $('#collabBadge');
  if (myTasks.length > 0) {
    badge.textContent = myTasks.length;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }

  // Render My Tasks
  const list = $('#myTasksList');
  const empty = $('#myTasksEmpty');
  if (!myTasks.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    list.innerHTML = myTasks.map(item => {
      const actionLabel = item.action === 'signoff' ? 'Sign-off' : 'Review';
      const actionClass = item.action === 'signoff' ? 'signoff' : '';
      const when = timeAgo(item.assignedAt);
      return `<div class="my-task-card" data-item-id="${esc(item.itemId)}" data-art-path="${esc(item.artifactPath || '')}">
        <div class="my-task-title">📄 ${esc(item.artifactTitle || 'Artifact')}</div>
        <div class="my-task-meta">From <strong>${esc(item.assignedBy)}</strong> · ${esc(when)}</div>
        ${item.message ? `<div class="my-task-meta" style="font-style:italic;margin-top:2px">"${esc(item.message)}"</div>` : ''}
        <span class="my-task-action ${actionClass}">${actionLabel}</span>
      </div>`;
    }).join('');

    $$('.my-task-card').forEach(card => {
      card.addEventListener('click', () => {
        const path = card.dataset.artPath;
        if (path) {
          $('#artifactModal').hidden = false;
          openArtifact(path);
          // Switch to outputs tab to show context
        }
      });
    });
  }

  // Render Activity Log
  renderActivityLog(wf.log || []);
}

function renderActivityLog(log) {
  const el = $('#activityLog');
  if (!log.length) {
    el.innerHTML = '<div class="panel-empty"><p>Workflow activity will appear here.</p></div>';
    return;
  }
  const recent = [...log].reverse().slice(0, 30);
  el.innerHTML = recent.map(entry => {
    let icon = '📋', text = '';
    if (entry.type === 'assigned') {
      icon = '📨';
      const actionLabel = entry.action === 'signoff' ? 'sign-off' : 'review';
      text = `<strong>${shortEmail(entry.assignedBy)}</strong> assigned <strong>${esc(entry.artifactTitle)}</strong> to <strong>${shortEmail(entry.assignedTo)}</strong> for ${actionLabel}`;
    } else if (entry.type === 'reviewed') {
      const decIcon = { approved: '✅', rejected: '❌', 'changes-requested': '🔄' }[entry.decision] || '💬';
      icon = decIcon;
      const decLabel = { approved: 'approved', rejected: 'rejected', 'changes-requested': 'requested changes on' }[entry.decision] || 'reviewed';
      text = `<strong>${shortEmail(entry.author)}</strong> ${decLabel} <strong>${esc(entry.artifactTitle)}</strong>`;
    }
    return `<div class="activity-entry">
      <span class="activity-icon">${icon}</span>
      <span class="activity-text">${text}</span>
      <span class="activity-time">${timeAgo(entry.timestamp)}</span>
    </div>`;
  }).join('');
}

// ─── Assign Artifact ─────────────────────────────────────
function openAssignDialog() {
  if (!currentProject || !currentArtifactMeta) return;
  const members = (currentProject.stakeholders || []).filter(s => s.email !== currentUser);
  if (!members.length) {
    alert('Add team members first (Team tab), then you can assign for review.');
    return;
  }
  $('#assignToSelect').innerHTML = members.map(m =>
    `<option value="${esc(m.email)}">${esc(m.email)} (${roleLabel(m.role)})</option>`
  ).join('');
  $('#assignArtifactName').textContent = `📄 ${currentArtifactMeta.title || 'Artifact'}`;
  $('#assignMessage').value = '';
  $('#assignModal').hidden = false;
  setTimeout(() => $('#assignToSelect').focus(), 50);
}

async function submitAssignment() {
  const assignedTo = $('#assignToSelect').value;
  const action = $('#assignActionSelect').value;
  const message = $('#assignMessage').value.trim();
  if (!assignedTo || !currentArtifactMeta || !currentUser) return;

  try {
    $('#submitAssignBtn').disabled = true;
    await api(`/api/projects/${currentProject.id}/workflow/assign`, {
      method: 'POST',
      body: JSON.stringify({
        artifactId: currentArtifactMeta.artifactId,
        artifactTitle: currentArtifactMeta.title,
        artifactPath: currentArtifactMeta.path,
        domain: currentArtifactMeta.domain,
        skill: currentArtifactMeta.skill,
        assignedTo,
        assignedBy: currentUser,
        action,
        message,
      }),
    });
    $('#assignModal').hidden = true;
    showToast(`Assigned to ${shortEmail(assignedTo)}`);
    await refreshWorkflow();
    // Refresh workflow state in the open artifact modal
    await loadArtifactWorkflow(currentArtifactMeta.artifactId);
  } catch (e) {
    alert('Assign failed: ' + e.message);
  } finally {
    $('#submitAssignBtn').disabled = false;
  }
}

// ─── Review / Sign-off ────────────────────────────────────
async function submitReview(decision) {
  if (!currentArtifactWorkflowItem || !currentUser) return;
  const comment = $('#reviewComment').value.trim();
  const btn = { approved: '#btnApprove', rejected: '#btnReject', 'changes-requested': '#btnRequestChanges' }[decision];
  if (btn) $(btn).disabled = true;

  try {
    await api(`/api/projects/${currentProject.id}/workflow/review`, {
      method: 'POST',
      body: JSON.stringify({
        itemId: currentArtifactWorkflowItem.itemId,
        author: currentUser,
        decision,
        comment,
      }),
    });
    const labels = { approved: 'Approved ✅', rejected: 'Rejected ❌', 'changes-requested': 'Changes requested 🔄' };
    showToast(labels[decision] || 'Review submitted');
    await refreshWorkflow();
    await loadArtifactWorkflow(currentArtifactWorkflowItem.artifactId);
  } catch (e) {
    alert('Review failed: ' + e.message);
  } finally {
    if (btn) $(btn).disabled = false;
  }
}

// ─── Load workflow state for an open artifact ─────────────
async function loadArtifactWorkflow(artifactId) {
  if (!currentProject || !artifactId) return;
  try {
    const item = await api(`/api/projects/${currentProject.id}/workflow/artifact/${encodeURIComponent(artifactId)}`);
    currentArtifactWorkflowItem = item;
    updateArtifactWorkflowUI(item);
  } catch (e) {
    console.warn('Workflow load error:', e);
    currentArtifactWorkflowItem = null;
    updateArtifactWorkflowUI(null);
  }
}

function updateArtifactWorkflowUI(item) {
  const badge = $('#wfStatusBadge');
  const reviewPanel = $('#reviewPanel');
  const assignBtn = $('#assignArtifactBtn');

  // Clear review state
  $('#reviewComment').value = '';

  if (!item) {
    badge.hidden = true;
    reviewPanel.hidden = true;
    // Show assign button if user is logged in
    if (assignBtn) assignBtn.hidden = !currentUser;
    return;
  }

  // Workflow status badge
  const statusLabels = {
    'in-review': '🔵 In Review',
    approved: '✅ Approved',
    'changes-requested': '🔄 Changes Needed',
    rejected: '❌ Rejected',
  };
  badge.textContent = statusLabels[item.status] || item.status;
  badge.className = `wf-status-badge ${item.status}`;
  badge.hidden = false;

  // Assign button: hide if in-review (already assigned); show otherwise
  if (assignBtn) {
    const canAssign = currentUser && item.status !== 'in-review';
    assignBtn.hidden = !canAssign;
    assignBtn.textContent = item.status === 'draft' ? '↗ Assign' : '↗ Re-assign';
  }

  // Review panel: show if this item is assigned to current user and status is in-review
  const isMyTask = currentUser && item.assignedTo === currentUser && item.status === 'in-review';
  if (isMyTask) {
    const actionLabel = item.action === 'signoff' ? 'sign-off on' : 'review';
    reviewPanel.hidden = false;
    $('#reviewPanelInfo').innerHTML =
      `📨 <strong>${shortEmail(item.assignedBy)}</strong> asked you to <strong>${actionLabel}</strong> this artifact.` +
      (item.message ? ` <em style="color:var(--text-3)">"${esc(item.message)}"</em>` : '');

    // Show previous comments if any
    const prev = $('#reviewCommentsPrev');
    if (item.comments && item.comments.length) {
      prev.innerHTML = item.comments.map(c => {
        const decColors = { approved: 'var(--green-text)', rejected: 'var(--red-text)', 'changes-requested': 'var(--amber-text)' };
        const decLabel = { approved: 'Approved', rejected: 'Rejected', 'changes-requested': 'Changes Requested' }[c.decision] || '';
        return `<div class="review-comment-item">
          <span class="rc-author">${shortEmail(c.author)}</span>
          ${decLabel ? `<span class="rc-decision" style="background:rgba(0,0,0,.2);color:${decColors[c.decision] || 'var(--text-2)'}">${decLabel}</span>` : ''}
          ${c.text ? `<span style="color:var(--text-3)">: ${esc(c.text)}</span>` : ''}
          <span style="float:right;color:var(--text-3);font-size:9px">${timeAgo(c.timestamp)}</span>
        </div>`;
      }).join('');
    } else {
      prev.innerHTML = '';
    }
  } else {
    reviewPanel.hidden = true;
  }
}

// ═══════════════════════════════════════════════
// TEAM TAB
// ═══════════════════════════════════════════════
function renderTeam(p) {
  $('#stakeList').innerHTML = p.stakeholders.map(s =>
    `<li>
      <span class="stake-email">${esc(s.email)}</span>
      <span class="stake-role-tag">${esc(s.role)}</span>
      ${s.role !== 'owner' ? `<button class="stake-rm" data-email="${esc(s.email)}">✕</button>` : ''}
    </li>`
  ).join('') || '<li style="color:var(--text-3);font-size:11px;padding:4px 0">No team members yet</li>';

  $$('#stakeList .stake-rm').forEach(btn =>
    btn.addEventListener('click', async () => {
      await fetch(`/api/projects/${currentProject.id}/stakeholders/${encodeURIComponent(btn.dataset.email)}`, { method: 'DELETE' });
      currentProject = await api('/api/projects/' + currentProject.id);
      renderTeam(currentProject);
      populateUserSwitcher(currentProject);
    })
  );
}

async function addStakeholder() {
  const email = $('#stEmail').value.trim();
  const role = $('#stRole').value;
  if (!email) return;
  try {
    currentProject = await api(`/api/projects/${currentProject.id}/stakeholders`, {
      method: 'POST', body: JSON.stringify({ email, role }),
    });
    $('#stEmail').value = '';
    renderTeam(currentProject);
    populateUserSwitcher(currentProject);
    await loadProjects();
  } catch (e) { alert(e.message); }
}

// ═══════════════════════════════════════════════
// ARTIFACTS
// ═══════════════════════════════════════════════
async function refreshArtifacts() {
  if (!currentProject) return;
  const arts = await api(`/api/projects/${currentProject.id}/artifacts`);
  renderArtifactCards(arts, false);
}

function renderArtifactCards(arts, highlightNew = false) {
  const container = $('#artifactCards');
  const empty = $('#outputsEmpty');
  if (!arts.length) {
    container.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  container.hidden = false;

  // Build a map of workflow status for quick lookup
  const wfMap = {};
  if (workflowCache && workflowCache.items) {
    workflowCache.items.forEach(item => {
      wfMap[item.artifactId] = item.status;
    });
  }

  container.innerHTML = arts.map((a, i) => {
    const wfStatus = wfMap[a.artifactId];
    const wfBadge = wfStatus ? `<span class="artifact-wf-badge ${wfStatus}">${wfStatusLabel(wfStatus)}</span>` : '';
    return `<div class="artifact-card" data-path="${esc(a.path)}">
      <div class="artifact-card-top">
        <span class="artifact-badge ${a.domain}">${a.domain === 'product-management' ? 'PROD MGT' : 'PROJ MGT'}</span>
        ${highlightNew && i === 0 ? '<span class="artifact-new-dot" title="Just created"></span>' : ''}
        ${wfBadge}
      </div>
      <div class="artifact-title">${esc(a.title)}</div>
      <div class="artifact-meta">${esc(a.skill)} · ${esc(a.stage)} · ${esc(a.status)}</div>
    </div>`;
  }).join('');

  $$('#artifactCards .artifact-card').forEach(card =>
    card.addEventListener('click', () => openArtifact(card.dataset.path))
  );
}

function wfStatusLabel(status) {
  return { 'in-review': 'In Review', approved: 'Approved', 'changes-requested': 'Changes', rejected: 'Rejected' }[status] || status;
}

let currentArtifactRaw = '';

async function openArtifact(path) {
  currentArtifactWorkflowItem = null;
  currentArtifactMeta = null;

  const raw = await fetch(`/api/projects/${currentProject.id}/artifact?path=${encodeURIComponent(path)}`).then(r => r.text());
  const arts = await api(`/api/projects/${currentProject.id}/artifacts`);
  const art = arts.find(a => a.path === path);

  if (art) {
    currentArtifactMeta = {
      artifactId: art.artifactId,
      title: art.title,
      domain: art.domain,
      skill: art.skill,
      path: art.path,
    };
  }

  // Strip YAML front matter
  const content = raw.replace(/^---[\s\S]*?---\s*\n/, '').trim();
  currentArtifactRaw = content;

  $('#artifactModalTitle').textContent = art?.title || 'Artifact';
  $('#artifactModalBadge').textContent = art?.skill || '';

  // Reset workflow UI while loading
  $('#wfStatusBadge').hidden = true;
  $('#reviewPanel').hidden = true;

  // Assign button: show if logged in
  const assignBtn = $('#assignArtifactBtn');
  if (assignBtn) assignBtn.hidden = !currentUser;

  // Detect HTML prototype inside ```html ... ``` fence
  const htmlFenceMatch = content.match(/```html\s*\n([\s\S]*?)```/);

  if (htmlFenceMatch) {
    showArtifactIframe(htmlFenceMatch[1]);
    $('#artifactSource').textContent = content;
  } else {
    showArtifactRendered(content);
    $('#artifactSource').textContent = content;
  }

  switchArtifactTab('rendered');
  $('#artifactModal').hidden = false;

  // Load workflow state for this artifact
  if (art && art.artifactId) {
    await loadArtifactWorkflow(art.artifactId);
  }
}

function showArtifactIframe(html) {
  const iframe = $('#artifactIframe');
  const rendered = $('#artifactRendered');
  rendered.hidden = true;
  iframe.hidden = false;
  iframe.srcdoc = html;
  $('#tabRendered').textContent = 'Preview';
  $('#tabSource').textContent = 'Markdown';
}

function showArtifactRendered(markdown) {
  const iframe = $('#artifactIframe');
  const rendered = $('#artifactRendered');
  iframe.hidden = true;
  rendered.hidden = false;
  $('#tabRendered').textContent = 'Rendered';
  $('#tabSource').textContent = 'Source';

  const normalized = markdown
    .replace(/\[mermaid\]\s*\n([\s\S]*?)\[\/mermaid\]/g, '```mermaid\n$1```');

  if (typeof marked === 'undefined') {
    rendered.innerHTML = `<pre style="white-space:pre-wrap;color:var(--text-2)">${esc(markdown)}</pre>`;
    return;
  }

  const renderer = new marked.Renderer();
  renderer.code = (code, lang) => {
    if (lang === 'mermaid') {
      const id = 'mm-' + Math.random().toString(36).slice(2, 8);
      return `<div class="mermaid" id="${id}">${esc(code)}</div>`;
    }
    return `<pre><code>${esc(code)}</code></pre>`;
  };

  marked.setOptions({ renderer, breaks: true, gfm: true });
  rendered.innerHTML = marked.parse(normalized);

  if (typeof mermaid !== 'undefined') {
    setTimeout(() => {
      try { mermaid.run({ nodes: rendered.querySelectorAll('.mermaid') }); } catch(e) { console.warn('Mermaid:', e); }
    }, 100);
  }
}

function switchArtifactTab(tab) {
  $$('.artifact-view-tab').forEach(t => t.classList.toggle('active', t.dataset.view === tab));
  if (tab === 'rendered') {
    const iframe = $('#artifactIframe');
    if (!iframe.hidden || iframe.srcdoc) {
      $('#artifactRendered').hidden = true;
      iframe.hidden = false;
    } else {
      $('#artifactRendered').hidden = false;
      iframe.hidden = true;
    }
    $('#artifactSource').hidden = true;
  } else {
    $('#artifactIframe').hidden = true;
    $('#artifactRendered').hidden = true;
    $('#artifactSource').hidden = false;
  }
}

// ═══════════════════════════════════════════════
// SUPER AGENT — SSE STREAMING
// ═══════════════════════════════════════════════
async function sendMessage() {
  if (!currentProject || running) return;
  const msg = $('#msgInput').value.trim();
  if (!msg) return;

  $('#msgInput').value = '';
  resizeTextarea($('#msgInput'));
  running = true;
  $('#sendBtn').disabled = true;

  appendUserBubble(msg);

  taskPlan = {};
  pendingArtifacts = [];
  $('#taskPlanList').innerHTML = '';
  $('#taskPlanList').hidden = true;
  $('#planEmpty').hidden = false;
  switchTab('plan');

  try {
    const resp = await fetch(`/api/projects/${currentProject.id}/invoke-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });

    if (!resp.ok) throw new Error(`Server error ${resp.status}`);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop();

      for (const part of parts) {
        if (!part.trim() || part.startsWith(':')) continue;
        const eventMatch = part.match(/^event:\s*(.+)$/m);
        const dataMatch = part.match(/^data:\s*(.+)$/m);
        if (!eventMatch || !dataMatch) continue;

        try {
          const eventType = eventMatch[1].trim();
          const data = JSON.parse(dataMatch[1].trim());
          handleSSEEvent(eventType, data);
        } catch (e) {
          console.warn('SSE parse error:', e);
        }
      }
    }
  } catch (e) {
    appendReply(`⚠️ Error: ${e.message}. Please try again.`);
  } finally {
    running = false;
    $('#sendBtn').disabled = false;
    await refreshArtifacts();
    if (pendingArtifacts.length) {
      const arts = await api(`/api/projects/${currentProject.id}/artifacts`);
      renderArtifactCards(arts, true);
    }
    currentProject = await api('/api/projects/' + currentProject.id);
    renderTeam(currentProject);
    loadProjects();
    await refreshWorkflow();
  }
}

function handleSSEEvent(type, data) {
  switch (type) {

    case 'plan': {
      const { steps } = data;
      taskPlan = {};
      steps.forEach(s => { taskPlan[s.id] = { ...s, domEl: null }; });

      $('#planEmpty').hidden = true;
      $('#taskPlanList').hidden = false;
      $('#taskPlanList').innerHTML = steps.map(s =>
        `<div class="task-item" id="task-${s.id}">
          <div class="task-dot ${s.status === 'done' ? 'done' : 'pending'}" id="dot-${s.id}"></div>
          <div class="task-info">
            <div class="task-title">${esc(s.title)}</div>
            ${s.skill ? `<div class="task-meta">${esc(s.domain || '')} · ${esc(s.skill)}</div>` : ''}
          </div>
        </div>`
      ).join('');
      break;
    }

    case 'step_start': {
      const { stepId, title } = data;
      const dot = $(`#dot-${stepId}`);
      const item = $(`#task-${stepId}`);
      if (dot) { dot.className = 'task-dot running'; }
      if (item) { item.className = 'task-item running'; }

      const stepEl = document.createElement('div');
      stepEl.className = 'log-step';
      stepEl.id = `step-${stepId}`;
      stepEl.innerHTML = `
        <div class="step-header">
          <div class="step-status-dot running" id="sdot-${stepId}"></div>
          <div class="step-label">
            <span class="step-num">${getStepNum(stepId)}</span>
            <span class="step-title">${esc(title)}</span>
          </div>
          <span class="step-status-text running" id="sstatus-${stepId}">Running…</span>
        </div>
        <div class="step-body" id="sbody-${stepId}"></div>`;
      $('#execLog').appendChild(stepEl);
      scrollLog();
      break;
    }

    case 'step_progress': {
      const { stepId, message } = data;
      const body = $(`#sbody-${stepId}`);
      if (body) {
        const msg = document.createElement('div');
        msg.className = 'step-progress-msg';
        msg.textContent = message;
        body.appendChild(msg);
        scrollLog();
      }
      break;
    }

    case 'step_complete': {
      const { stepId, output, error } = data;
      const status = error ? 'error' : 'done';
      const sdot = $(`#sdot-${stepId}`);
      const sstatus = $(`#sstatus-${stepId}`);
      const stepEl = $(`#step-${stepId}`);
      if (sdot) sdot.className = `step-status-dot ${status}`;
      if (sstatus) { sstatus.className = `step-status-text ${status}`; sstatus.textContent = error ? 'Error' : 'Done'; }
      if (stepEl) {
        const header = stepEl.querySelector('.step-header');
        if (header) header.style.borderBottomColor = 'transparent';
        if (output) {
          const out = document.createElement('div');
          out.className = 'step-output';
          out.textContent = output;
          stepEl.appendChild(out);
        }
      }
      const dot = $(`#dot-${stepId}`);
      const item = $(`#task-${stepId}`);
      if (dot) dot.className = `task-dot ${status}`;
      if (item) item.className = `task-item ${status}`;
      scrollLog();
      break;
    }

    case 'artifact': {
      const { artifactId, title, domain, skill, path } = data;
      pendingArtifacts.push({ artifactId, title, domain, skill, path });
      const pill = document.createElement('div');
      pill.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-2);border:1px solid var(--border);border-radius:8px;font-size:12px;cursor:pointer';
      pill.innerHTML = `<span class="artifact-badge ${domain}" style="font-size:9px">${domain === 'product-management' ? 'PROD MGT' : 'PROJ MGT'}</span>
        <span style="font-weight:600;color:var(--text)">📄 ${esc(title)}</span>
        <span style="color:var(--green-text);margin-left:auto;font-size:11px">↗ Open</span>`;
      pill.addEventListener('click', () => openArtifact(path));
      $('#execLog').appendChild(pill);
      scrollLog();
      break;
    }

    case 'reply': {
      appendReply(data.text);
      break;
    }

    case 'error': {
      appendReply(`⚠️ ${data.message}`);
      break;
    }
  }
}

// ═══════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════
function getStepNum(stepId) {
  if (stepId === '__plan') return '✦';
  if (stepId === 'notify') return '📧';
  return stepId;
}

function appendUserBubble(msg) {
  const el = document.createElement('div');
  el.className = 'log-user';
  el.innerHTML = `<div class="log-user-bubble">${esc(msg)}</div>`;
  $('#execLog').appendChild(el);
  scrollLog();
}

function appendReply(text) {
  const el = document.createElement('div');
  el.className = 'log-reply';
  el.innerHTML = `
    <div class="log-reply-avatar">✦</div>
    <div class="log-reply-text">${mdLite(text)}</div>`;
  $('#execLog').appendChild(el);
  scrollLog();
}

function scrollLog() {
  const log = $('#execLog');
  log.scrollTop = log.scrollHeight;
}

function mdLite(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function resizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function shortEmail(email) {
  if (!email) return '?';
  return esc(email.split('@')[0]);
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function showToast(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--bg-3);border:1px solid var(--border);color:var(--text);padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,.4);animation:slideIn .2s ease';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ═══════════════════════════════════════════════
// PANEL TABS
// ═══════════════════════════════════════════════
function switchTab(name) {
  $$('.panel-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  $('#tabPlan').hidden   = name !== 'plan';
  $('#tabOutputs').hidden = name !== 'outputs';
  $('#tabCollab').hidden  = name !== 'collab';
  $('#tabTeam').hidden    = name !== 'team';
}

// ═══════════════════════════════════════════════
// WIRE EVENTS
// ═══════════════════════════════════════════════
function wireEvents() {
  // New project
  $('#newProjectBtn').addEventListener('click', showNewProjectModal);
  $('#emptyNewProjectBtn').addEventListener('click', showNewProjectModal);
  $('#cancelNewProject').addEventListener('click', hideNewProjectModal);
  $('#createProjectBtn').addEventListener('click', createProject);
  $('#newProjectModal').addEventListener('click', e => { if (e.target === e.currentTarget) hideNewProjectModal(); });
  $('#npName').addEventListener('keydown', e => { if (e.key === 'Enter') createProject(); });

  // Send message
  $('#sendBtn').addEventListener('click', sendMessage);
  $('#msgInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  $('#msgInput').addEventListener('input', () => resizeTextarea($('#msgInput')));

  // Prompt chips
  $$('.chip').forEach(chip =>
    chip.addEventListener('click', () => {
      $('#msgInput').value = chip.textContent.trim();
      resizeTextarea($('#msgInput'));
      $('#msgInput').focus();
    })
  );

  // Panel tabs
  $$('.panel-tab').forEach(tab =>
    tab.addEventListener('click', () => switchTab(tab.dataset.tab))
  );

  // Add stakeholder
  $('#addStakeBtn').addEventListener('click', addStakeholder);
  $('#stEmail').addEventListener('keydown', e => { if (e.key === 'Enter') addStakeholder(); });

  // Artifact modal
  $('#artifactModalClose').addEventListener('click', () => { $('#artifactModal').hidden = true; });
  $('#artifactModal').addEventListener('click', e => { if (e.target === e.currentTarget) $('#artifactModal').hidden = true; });
  $('#copyArtifactBtn').addEventListener('click', () => {
    navigator.clipboard?.writeText(currentArtifactRaw);
    const btn = $('#copyArtifactBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
  $$('.artifact-view-tab').forEach(tab =>
    tab.addEventListener('click', () => switchArtifactTab(tab.dataset.view))
  );

  // Assign button in artifact modal
  const assignBtn = $('#assignArtifactBtn');
  if (assignBtn) assignBtn.addEventListener('click', openAssignDialog);

  // Assign modal
  $('#assignModalClose').addEventListener('click', () => { $('#assignModal').hidden = true; });
  $('#cancelAssignBtn').addEventListener('click', () => { $('#assignModal').hidden = true; });
  $('#submitAssignBtn').addEventListener('click', submitAssignment);
  $('#assignModal').addEventListener('click', e => { if (e.target === e.currentTarget) $('#assignModal').hidden = true; });

  // Review buttons
  $('#btnApprove').addEventListener('click', () => submitReview('approved'));
  $('#btnRequestChanges').addEventListener('click', () => submitReview('changes-requested'));
  $('#btnReject').addEventListener('click', () => submitReview('rejected'));

  // User switcher
  $('#currentUserSelect').addEventListener('change', e => {
    switchUser(e.target.value);
    // If artifact modal is open and there's a loaded artifact, refresh its workflow UI
    if (!$('#artifactModal').hidden && currentArtifactWorkflowItem) {
      updateArtifactWorkflowUI(currentArtifactWorkflowItem);
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $('#newProjectModal').hidden = true;
      $('#artifactModal').hidden = true;
      $('#assignModal').hidden = true;
    }
  });

  // Poll workflow every 30 seconds for multi-user simulation
  setInterval(() => {
    if (currentProject) refreshWorkflow();
  }, 30000);
}

// ═══════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', boot);
