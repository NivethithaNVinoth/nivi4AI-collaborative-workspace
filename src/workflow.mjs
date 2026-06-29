// workflow.mjs — Collaborative review and approval workflow engine
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WS_ROOT = path.join(__dirname, '..', 'workspaces');

function wfFile(pid) {
  const d = path.join(WS_ROOT, pid);
  fs.mkdirSync(d, { recursive: true });
  return path.join(d, 'workflow.json');
}

function load(pid) {
  const f = wfFile(pid);
  if (!fs.existsSync(f)) return { items: [], log: [] };
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch { return { items: [], log: [] }; }
}

function save(pid, data) {
  fs.writeFileSync(wfFile(pid), JSON.stringify(data, null, 2));
}

/** Assign an artifact to a team member for review or sign-off */
export function assignArtifact(pid, {
  artifactId, artifactTitle, artifactPath, domain, skill,
  assignedTo, assignedBy, action, message
}) {
  const wf = load(pid);
  const existing = wf.items.find(i => i.artifactId === artifactId);
  const itemId = existing?.itemId || ('wf_' + crypto.randomUUID().slice(0, 6));

  const item = {
    itemId, artifactId, artifactTitle, artifactPath, domain, skill,
    status: 'in-review',
    assignedTo, assignedBy, action: action || 'review',
    message: message || '',
    assignedAt: new Date().toISOString(),
    comments: existing?.comments || [],
    decision: null, signedOffBy: null, signedOffAt: null,
  };

  if (existing) { wf.items[wf.items.indexOf(existing)] = item; }
  else { wf.items.push(item); }

  wf.log.push({
    type: 'assigned', itemId, artifactTitle,
    assignedTo, assignedBy, action: action || 'review',
    message: message || '',
    timestamp: new Date().toISOString(),
  });
  save(pid, wf);
  return item;
}

/** Submit a review decision: approved | rejected | changes-requested */
export function submitReview(pid, { itemId, author, decision, comment }) {
  const wf = load(pid);
  const item = wf.items.find(i => i.itemId === itemId);
  if (!item) throw new Error('Workflow item not found: ' + itemId);

  item.status = { approved: 'approved', rejected: 'rejected', 'changes-requested': 'changes-requested' }[decision] || 'in-review';
  item.decision = decision;
  item.comments.push({
    id: crypto.randomUUID().slice(0, 6),
    author, text: comment || '', decision,
    timestamp: new Date().toISOString(),
  });
  if (decision === 'approved') {
    item.signedOffBy = author;
    item.signedOffAt = new Date().toISOString();
  }

  wf.log.push({
    type: 'reviewed', itemId, artifactTitle: item.artifactTitle,
    author, decision, comment: comment || '',
    timestamp: new Date().toISOString(),
  });
  save(pid, wf);
  return item;
}

/** Get full workflow state for a project */
export function getWorkflow(pid) { return load(pid); }

/** Get workflow items currently assigned to an email */
export function getMyTasks(pid, email) {
  return load(pid).items.filter(i =>
    i.assignedTo === email && i.status === 'in-review'
  );
}

/** Get workflow item for a specific artifact (if any) */
export function getItemByArtifact(pid, artifactId) {
  return load(pid).items.find(i => i.artifactId === artifactId) || null;
}

/** Get recent activity log (newest first) */
export function getActivityLog(pid, limit) {
  limit = limit || 40;
  return [...load(pid).log].reverse().slice(0, limit);
}

/** Add an inline comment to an artifact (optionally anchored to selected text) */
export function addComment(pid, {
  artifactId, itemId, author, anchorText, anchorSection, comment
}) {
  const wf = load(pid);
  if (!wf.comments) wf.comments = [];
  const cmt = {
    id: 'cmt_' + crypto.randomUUID().slice(0, 6),
    artifactId, itemId: itemId || null,
    author,
    anchorText: anchorText || '',
    anchorSection: anchorSection || '',
    comment,
    timestamp: new Date().toISOString(),
    resolved: false, resolvedBy: null, resolvedAt: null,
  };
  wf.comments.push(cmt);
  wf.log.push({
    type: 'commented', artifactId,
    artifactTitle: (wf.items.find(i => i.artifactId === artifactId) || {}).artifactTitle || artifactId,
    author, comment: comment.slice(0, 100), timestamp: cmt.timestamp,
  });
  save(pid, wf);
  return cmt;
}

/** Resolve a comment */
export function resolveComment(pid, commentId, resolvedBy) {
  const wf = load(pid);
  if (!wf.comments) return null;
  const cmt = wf.comments.find(c => c.id === commentId);
  if (!cmt) throw new Error('Comment not found: ' + commentId);
  cmt.resolved = true;
  cmt.resolvedBy = resolvedBy;
  cmt.resolvedAt = new Date().toISOString();
  save(pid, wf);
  return cmt;
}

/** Get all comments for a specific artifact */
export function getArtifactComments(pid, artifactId) {
  const wf = load(pid);
  return (wf.comments || []).filter(c => c.artifactId === artifactId);
}
