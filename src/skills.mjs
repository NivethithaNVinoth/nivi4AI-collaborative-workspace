// Skill Registry: discovers SKILL.md files under skills/<domain>/<skill>/SKILL.md,
// parses lightweight front-matter, and exposes them to the agents.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.join(__dirname, '..', 'skills');

// Minimal front-matter parser (key: value lines between the first two '---').
function parseFrontMatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (key) meta[key] = val;
  }
  return { meta, body: m[2].trim() };
}

let CACHE = null;

export function loadSkills() {
  if (CACHE) return CACHE;
  const skills = [];
  if (!fs.existsSync(SKILLS_DIR)) { CACHE = skills; return skills; }
  for (const domain of fs.readdirSync(SKILLS_DIR)) {
    const domainDir = path.join(SKILLS_DIR, domain);
    if (!fs.statSync(domainDir).isDirectory()) continue;
    for (const skillName of fs.readdirSync(domainDir)) {
      const skillMd = path.join(domainDir, skillName, 'SKILL.md');
      if (!fs.existsSync(skillMd)) continue;
      const raw = fs.readFileSync(skillMd, 'utf8');
      const { meta, body } = parseFrontMatter(raw);
      skills.push({
        id: `${domain}/${meta.name || skillName}`,
        name: meta.name || skillName,
        domain, // 'product-management' | 'project-management'
        description: meta.description || '',
        when_to_use: meta.when_to_use || '',
        retrieval_intent: meta.retrieval_intent || '',
        output: meta.output || 'Markdown artifact',
        stage: meta.stage || '',
        body,
      });
    }
  }
  CACHE = skills;
  return skills;
}

export function skillsForDomain(domain) {
  return loadSkills().filter(s => s.domain === domain);
}

export function getSkill(domain, name) {
  return loadSkills().find(s => s.domain === domain && s.name === name);
}

// Compact catalogue the Super Agent reads when routing.
export function skillCatalogue() {
  return loadSkills().map(s =>
    `- domain: ${s.domain} | skill: ${s.name}\n    does: ${s.description}\n    use when: ${s.when_to_use}`
  ).join('\n');
}

export const DOMAINS = {
  'project-management': 'Project Management — delivery lifecycle: charter, planning, sprints, RAID, status, closure.',
  'product-management': 'Product Management — discovery & definition: market research, PRDs, user stories, roadmap, prioritisation.',
};
