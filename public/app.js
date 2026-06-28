const $ = s => document.querySelector(s);
const api = (u, o) => fetch(u, o).then(r => r.json());
let current = null;

async function boot() {
  const meta = await api('/api/meta');
  $('#modepill').textContent = `${meta.mode} · ${meta.model}`;
  renderSkills(meta.skills);
  await refreshProjects();
}

function renderSkills(skills) {
  const byDom = {};
  skills.forEach(s => (byDom[s.domain] ||= []).push(s));
  $('#skillList').innerHTML = Object.entries(byDom).map(([d, list]) =>
    `<div class="dom">${d.replace('-', ' ')}</div>` +
    list.map(s => `<div class="sk"><b>${s.name}</b></div>`).join('')
  ).join('');
}

async function refreshProjects() {
  const projects = await api('/api/projects');
  $('#projectList').innerHTML = projects.map(p =>
    `<li data-id="${p.id}" class="${current === p.id ? 'active' : ''}">${p.name}
      <span class="pm">${p.stakeholders.length} stakeholder(s) · ${p.stage}</span></li>`
  ).join('') || '<li class="pm" style="cursor:default">No projects yet</li>';
  document.querySelectorAll('#projectList li[data-id]').forEach(li =>
    li.onclick = () => openProject(li.dataset.id));
}

async function openProject(id) {
  current = id;
  const p = await api('/api/projects/' + id);
  $('#emptyState').hidden = true;
  $('#projectView').hidden = false;
  $('#pName').textContent = p.name;
  $('#pStage').textContent = p.stage;
  $('#pOwner').textContent = 'owner: ' + p.owner;
  renderStakeholders(p);
  renderActivity(p);
  await refreshArtifacts();
  await refreshProjects();
}

function renderStakeholders(p) {
  $('#stakeList').innerHTML = p.stakeholders.map(s =>
    `<li><span>${s.email}<span class="role">${s.role}</span></span>
      ${s.role === 'owner' ? '' : `<button class="rm" data-email="${s.email}">✕</button>`}</li>`
  ).join('');
  document.querySelectorAll('#stakeList .rm').forEach(b => b.onclick = async () => {
    await fetch(`/api/projects/${current}/stakeholders/${encodeURIComponent(b.dataset.email)}`, { method: 'DELETE' });
    openProject(current);
  });
}

function renderActivity(p) {
  $('#activityList').innerHTML = (p.events || []).slice(0, 20).map(e => {
    if (e.type === 'notification')
      return `<li><span class="notif">📧 notified ${e.recipients.length}</span> — ${e.subject}</li>`;
    if (e.type === 'artifact_created')
      return `<li><span class="em">📄 ${e.title}</span> via ${e.domain}/${e.skill}</li>`;
    if (e.type === 'user_message') return `<li>🗣️ "${truncate(e.message, 70)}"</li>`;
    if (e.type === 'super_agent_reply') return `<li>🤖 ${truncate(e.message, 80)}</li>`;
    return `<li>${e.type}</li>`;
  }).join('') || '<li>No activity yet</li>';
}

async function refreshArtifacts() {
  const arts = await api(`/api/projects/${current}/artifacts`);
  $('#artifactList').innerHTML = arts.map(a =>
    `<li data-path="${a.path}"><span class="tag ${a.domain}">${a.domain === 'product-management' ? 'PROD' : 'PM'}</span>
      <span class="t">${a.title}</span>
      <div class="st">${a.skill} · ${a.stage} · ${a.status}</div></li>`
  ).join('') || '<li class="st" style="cursor:default">No artifacts yet — ask the Super Agent.</li>';
  document.querySelectorAll('#artifactList li[data-path]').forEach(li =>
    li.onclick = async () => {
      const md = await fetch(`/api/projects/${current}/artifact?path=${encodeURIComponent(li.dataset.path)}`).then(r => r.text());
      $('#modalTitle').textContent = li.querySelector('.t').textContent;
      $('#modalBody').textContent = md;
      $('#modal').hidden = false;
    });
}

function addBubble(cls, html) {
  const d = document.createElement('div');
  d.className = 'bubble ' + cls; d.innerHTML = html;
  $('#chat').appendChild(d); $('#chat').scrollTop = $('#chat').scrollHeight;
  return d;
}

async function send() {
  const message = $('#msg').value.trim();
  if (!message || !current) return;
  $('#msg').value = '';
  addBubble('user', escapeHtml(message));
  const thinking = addBubble('agent', '<span class="route">routing…</span>');
  try {
    const res = await api(`/api/projects/${current}/invoke`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const routes = (res.artifacts || []).map(a => `→ ${a.domain}/${a.skill}: ${a.title}`).join('<br>');
    thinking.innerHTML = escapeHtml(res.reply) + (routes ? `<div class="route">${routes}</div>` : '');
    await refreshArtifacts();
    openProject(current);
  } catch (e) {
    thinking.innerHTML = '<span class="route">Error: ' + escapeHtml(e.message) + '</span>';
  }
}

// events
$('#newProjectBtn').onclick = async () => {
  const name = prompt('Project name', 'Mobile Onboarding Revamp');
  if (!name) return;
  const description = prompt('One-line description', 'Streamline first-time customer onboarding in the mobile app') || '';
  const p = await api('/api/projects', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  await refreshProjects(); openProject(p.id);
};
$('#addStakeBtn').onclick = async () => {
  const email = $('#stEmail').value.trim();
  if (!email) return;
  await api(`/api/projects/${current}/stakeholders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role: $('#stRole').value }),
  });
  $('#stEmail').value = ''; openProject(current);
};
$('#sendBtn').onclick = send;
$('#msg').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); });
document.querySelectorAll('.hint').forEach(h => h.onclick = () => { $('#msg').value = h.textContent; });
$('#modalClose').onclick = () => $('#modal').hidden = true;
$('#modal').onclick = e => { if (e.target.id === 'modal') $('#modal').hidden = true; };

const truncate = (s, n) => s.length > n ? s.slice(0, n) + '…' : s;
const escapeHtml = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
boot();
