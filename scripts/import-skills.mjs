// Optional: pull additional skills from public libraries into skills/<domain>/imported/.
// Respect each source's licence (see NOTICE.md). Usage:
//   node scripts/import-skills.mjs deanpeters/Product-Manager-Skills product-management prd-development
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [repo, domain, skill] = process.argv.slice(2);
if (!repo || !domain || !skill) {
  console.log('Usage: node scripts/import-skills.mjs <owner/repo> <product-management|project-management> <skill-name>');
  console.log('Note: imported skills keep their ORIGINAL licence. Check NOTICE.md before use.');
  process.exit(1);
}
const url = `https://raw.githubusercontent.com/${repo}/main/skills/${skill}/SKILL.md`;
https.get(url, res => {
  if (res.statusCode !== 200) { console.error('Fetch failed', res.statusCode, url); res.resume(); return; }
  let data = ''; res.on('data', d => data += d); res.on('end', () => {
    const dir = path.join(__dirname, '..', 'skills', domain, skill);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'),
      `<!-- Imported from ${repo} — retains its original licence (see NOTICE.md) -->\n` + data);
    console.log(`Imported ${repo}/${skill} -> skills/${domain}/${skill}/SKILL.md`);
    console.log('Reminder: verify the source licence permits your use.');
  });
}).on('error', e => console.error(e.message));
