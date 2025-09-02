import path from 'path';
import { ProjectScaffold } from '../src/cli/scaffold.js';

async function main() {
  const parentDir = path.resolve(process.cwd(), '..');
  const name = 'smooth_project';
  const scaffold = new ProjectScaffold(name, parentDir);
  // Print only the package.json template that would be generated
  const pkg = scaffold.getPackageJsonTemplate();
  console.log(pkg);
}

main().catch((e) => { console.error(e); process.exit(1); });