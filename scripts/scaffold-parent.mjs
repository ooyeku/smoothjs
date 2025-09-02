import path from 'path';
import { ProjectScaffold } from '../src/cli/scaffold.js';

async function main() {
  const name = 'smooth_project_parent_check';
  const parentDir = path.resolve(process.cwd(), '..');
  const scaffold = new ProjectScaffold(name, parentDir);
  const ok = await scaffold.scaffold();
  if (!ok) process.exit(1);
  console.log('Scaffolded at:', path.join(parentDir, name));
}

main().catch((e) => { console.error(e); process.exit(1); });