// Simulated stakeholder notifications. In a real deployment these become MCP calls
// to mail / Teams. Here we log them and persist as project events so the UI can show
// "who was notified about what" — the delay/sign-off routing in miniature.
import { getProject, logEvent } from './store.mjs';

export function notifyStakeholders(pid, { subject, body, roles = null }) {
  const p = getProject(pid);
  if (!p) return [];
  const recipients = p.stakeholders
    .filter(s => !roles || roles.includes(s.role))
    .map(s => s.email);
  for (const to of recipients) {
    console.log(`📧 [notify] to=${to}  subject="${subject}"`);
  }
  logEvent(pid, { type: 'notification', subject, body, recipients });
  return recipients;
}
