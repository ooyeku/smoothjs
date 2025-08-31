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
  console.log(`SmoothJS CLI\n\nUsage:\n  smoothjs help\n  smoothjs create <dir>\n  smoothjs serve [dir] [--port <port>]\n\nExamples:\n  smoothjs create my-app\n  smoothjs serve --port 5173\n  smoothjs serve examples --port 5173\n`);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeFileSafe(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function cmdCreate(dirArg) {
  const dest = path.resolve(process.cwd(), dirArg || 'smoothjs-app');
  if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
    console.error(`Target directory not empty: ${dest}`);
    process.exit(1);
  }
  ensureDir(dest);

  const indexHtml = '<!DOCTYPE html>\n'
    + '<html lang="en">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8" />\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
    + '  <title>SmoothJS App</title>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div id="app"></div>\n'
    + '  <script type="module">\n'
    + "    import SmoothJS, { Component } from 'smoothjs/index.js';\n"
    + '    class App extends Component {\n'
    + '      template() { return `<h1>Hello SmoothJS</h1>`; }\n'
    + '    }\n'
    + "    new App().mount('#app');\n"
    + '  </script>\n'
    + '</body>\n'
    + '</html>';

  writeFileSafe(path.join(dest, 'index.html'), indexHtml);

  const pkgJson = {
    name: path.basename(dest),
    private: true,
    type: 'module'
  };
  writeFileSafe(path.join(dest, 'package.json'), JSON.stringify(pkgJson, null, 2));

  console.log(`✔ Created SmoothJS app in ${dest}`);
  console.log('Open index.html in your browser, or serve with:');
  console.log(`  smoothjs serve ${dirArg || '.'} --port 5173`);
}

function startVite(rootDir = '.', port = 5173) {
  const cwd = path.resolve(process.cwd(), rootDir);
  const viteBin = path.resolve(__dirname, '../node_modules/vite/bin/vite.js');
  if (!fs.existsSync(viteBin)) {
    console.error('Vite is not installed with smoothjs. Please reinstall smoothjs or add vite to your project.');
    process.exit(1);
  }
  const args = [];
  // Provide root explicitly when not current dir to mirror `vite --root <dir>` behavior
  if (rootDir && rootDir !== '.') {
    args.push('--root', cwd);
  }
  args.push('--port', String(port));
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
  if (cmd === 'create') return cmdCreate(args[1]);
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
