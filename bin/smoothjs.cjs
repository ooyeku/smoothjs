#!/usr/bin/env node
/*
  SmoothJS CLI (Vite-powered)
  Commands:
    - smoothjs help
    - smoothjs create <dir>
    - smoothjs serve [dir] [--port <port>]  // uses Vite dev server under the hood
  No external dependencies beyond the smoothjs package itself.
*/

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function printHelp() {
  console.log(`SmoothJS CLI\n\nUsage:\n  smoothjs help\n  smoothjs create <project-name>\n  smoothjs serve [dir] [--port <port>]\n\nExamples:\n  smoothjs create my-app\n  smoothjs serve --port 5173\n  smoothjs serve examples --port 5173\n`);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeFileSafe(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

async function cmdCreate(dirArg) {
  const dest = path.resolve(process.cwd(), dirArg || 'smoothjs-app');
  if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
    console.error(`Target directory not empty: ${dest}`);
    process.exit(1);
  }
  // Delegate to the opinionated scaffolder in src/cli
  const projectName = path.basename(dest);

  // ESM import of the scaffolder from CJS
  let ProjectScaffold;
  try {
    const mod = await import(path.resolve(__dirname, '../src/cli/scaffold.js'));
    ProjectScaffold = mod.ProjectScaffold;
  } catch (e) {
    console.error('Failed to load scaffolder:', e.message);
    process.exit(1);
  }

  const scaffold = new ProjectScaffold(projectName, path.dirname(dest));
  const ok = await scaffold.scaffold();
  if (!ok) process.exit(1);

  // Scaffolder already prints next steps.
}

function startVite(rootDir = '.', port = 5173) {
  const cwd = path.resolve(process.cwd(), rootDir);
  const viteBin = path.resolve(__dirname, '../node_modules/vite/bin/vite.js');
  if (!fs.existsSync(viteBin)) {
    console.error('Vite is not installed with smoothjs. Please reinstall smoothjs or add vite to your project.');
    process.exit(1);
  }

  // Prepare a temporary Vite config to alias 'smoothjs' to this package when serving external dirs.
  // This lets freshly scaffolded apps work without installing dependencies first.
  const hasUserConfig = ['vite.config.js','vite.config.mjs','vite.config.cjs','vite.config.ts','vite.config.mts','vite.config.cts']
    .some(f => fs.existsSync(path.join(cwd, f)));

  let tempConfigPath = null;
  if (!hasUserConfig) {
    try {
      // Try resolve order: local project node_modules, global node_modules, this package
      let aliasTarget = null;
      const tryPaths = [];
      // 1) local project resolution
      try {
        const localResolved = require.resolve('smoothjs', { paths: [cwd] });
        tryPaths.push(localResolved);
      } catch {}
      // 2) global resolution via `npm root -g`
      try {
        const out = cp.execSync('npm root -g', { encoding: 'utf8' }).trim();
        const candidate = path.join(out, 'smoothjs', 'index.js');
        tryPaths.push(candidate);
      } catch {}
      // 3) fallback to this package (useful if running from linked repo)
      tryPaths.push(path.resolve(__dirname, '../index.js'));

      for (const p of tryPaths) {
        if (typeof p === 'string' && fs.existsSync(p)) {
          aliasTarget = p;
          break;
        }
      }

      if (!aliasTarget) {
        // Last resort: point to package name; Vite may resolve via its own algorithm if installed
        aliasTarget = 'smoothjs';
      }

      const contents = `export default {\n  resolve: { alias: { smoothjs: ${JSON.stringify(aliasTarget)} } },\n  server: { port: ${Number(port)} }\n};\n`;
      tempConfigPath = path.join(cwd, '.smoothjs.vite.config.mjs');
      fs.writeFileSync(tempConfigPath, contents);
    } catch (e) {
      // If we fail to write config, continue without alias; resolution will work if the app installed deps.
      tempConfigPath = null;
    }
  }

  const args = [];
  // Provide root explicitly when not current dir to mirror `vite --root <dir>` behavior
  if (rootDir && rootDir !== '.') {
    args.push('--root', cwd);
  }
  args.push('--port', String(port));
  if (tempConfigPath) {
    args.push('--config', tempConfigPath);
  }
  const child = cp.spawn(process.execPath, [viteBin, ...args], { stdio: 'inherit', cwd: process.cwd(), env: { ...process.env } });
  child.on('exit', (code) => process.exit(code || 0));
}

function cmdServe(dirArg, portArg) {
  const dir = dirArg || '.';
  const port = portArg ? parseInt(portArg, 10) : 5173;
  startVite(dir, port);
}

function main(argv) {
  const args = argv.slice(2);
  const cmd = args[0] || 'help';
  if (cmd === 'help' || cmd === '--help' || cmd === '-h') return printHelp();
  if (cmd === 'create') return cmdCreate(args[1]).then(()=>{});
  if (cmd === 'serve') {
    let dir = args[1] && !args[1].startsWith('--') ? args[1] : '.';
    let portIdx = args.findIndex(a => a === '--port');
    let port = (portIdx !== -1 && args[portIdx + 1]) ? args[portIdx + 1] : '5173';
    return cmdServe(dir, port);
  }
  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

main(process.argv);
