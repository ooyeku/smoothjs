import { ProjectScaffold } from '../src/cli/scaffold.js';

async function main() {
  const name = 'tmp-smooth-app';
  const scaffold = new ProjectScaffold(name, process.cwd());
  const ok = await scaffold.scaffold();
  if (!ok) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
