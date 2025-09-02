import fsSync, { promises as fs } from 'fs';
import path from 'path';

/**
 * SmoothJS Project Scaffolding System
 * Enforces the recommended directory structure for new projects
 */
export class ProjectScaffold {
  constructor(projectName, targetDir = process.cwd()) {
    this.projectName = projectName;
    this.targetDir = path.resolve(targetDir);
    this.projectDir = path.join(this.targetDir, projectName);
    
    // Default directory structure
    this.directories = [
      'components',
      'pages', 
      'stores',
      'router',
      'utils',
      'assets',
      'styles',
      'tests'
    ];
    
    // Template files to create
    this.templates = {
      'package.json': this.getPackageJsonTemplate(),
      'README.md': this.getReadmeTemplate(),
      'index.html': this.getIndexHtmlTemplate(),
      'app.js': this.getAppJsTemplate(),
      'components/index.js': this.getComponentsIndexTemplate(),
      'pages/index.js': this.getPagesIndexTemplate(),
      'stores/index.js': this.getStoresIndexTemplate(),
      'router/index.js': this.getRouterIndexTemplate(),
      'utils/index.js': this.getUtilsIndexTemplate(),
      'styles/index.css': this.getStylesIndexTemplate(),
      '.gitignore': this.getGitignoreTemplate(),
      'vite.config.js': this.getViteConfigTemplate(),
      'jsconfig.json': this.getJsConfigTemplate()
    };
  }

  /**
   * Create the complete project structure
   */
  async scaffold() {
    try {
      console.log(`Creating SmoothJS project: ${this.projectName}`);
      
      // Create project directory
      await this.createProjectDirectory();
      
      // Create subdirectories
      await this.createSubdirectories();
      
      // Create template files
      await this.createTemplateFiles();
      
      // Create example components
      await this.createExampleComponents();
      
      console.log(`Project ${this.projectName} created successfully!`);
      console.log(`Location: ${this.projectDir}`);
      console.log('\nNext steps:');
      console.log(`  cd ${this.projectName}`);
      console.log('  npm install');
      console.log('  npm run dev');
      
      return true;
    } catch (error) {
      console.error('❌ Scaffolding failed:', error.message);
      return false;
    }
  }

  /**
   * Create the main project directory
   */
  async createProjectDirectory() {
    try {
      await fs.mkdir(this.projectDir, { recursive: true });
      console.log(`Created project directory: ${this.projectName}`);
    } catch (error) {
      throw new Error(`Failed to create project directory: ${error.message}`);
    }
  }

  /**
   * Create all subdirectories
   */
  async createSubdirectories() {
    for (const dir of this.directories) {
      const dirPath = path.join(this.projectDir, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } catch (error) {
        throw new Error(`Failed to create directory ${dir}: ${error.message}`);
      }
    }
  }

  /**
   * Create all template files
   */
  async createTemplateFiles() {
    for (const [filePath, content] of Object.entries(this.templates)) {
      const fullPath = path.join(this.projectDir, filePath);
      const dir = path.dirname(fullPath);
      
      try {
        // Ensure directory exists
        await fs.mkdir(dir, { recursive: true });
        
        // Write file
        await fs.writeFile(fullPath, content, 'utf8');
        console.log(`Created: ${filePath}`);
      } catch (error) {
        throw new Error(`Failed to create ${filePath}: ${error.message}`);
      }
    }
  }

  /**
   * Create example components and pages
   */
  async createExampleComponents() {
    const examples = {
      'components/Button.js': this.getButtonComponentTemplate(),
      'components/Card.js': this.getCardComponentTemplate(),
      'pages/HomePage.js': this.getHomePageTemplate(),
      'pages/AboutPage.js': this.getAboutPageTemplate(),
      'pages/NotFound.js': this.getNotFoundPageTemplate(),
      'stores/counter.js': this.getCounterStoreTemplate(),
      'router/routes.js': this.getRoutesTemplate()
    };

    for (const [filePath, content] of Object.entries(examples)) {
      const fullPath = path.join(this.projectDir, filePath);
      try {
        await fs.writeFile(fullPath, content, 'utf8');
        console.log(`Created: ${filePath}`);
      } catch (error) {
        throw new Error(`Failed to create ${filePath}: ${error.message}`);
      }
    }
  }

  /**
   * Validate existing project structure
   */
  async validateStructure() {
    const issues = [];
    
    for (const dir of this.directories) {
      const dirPath = path.join(this.projectDir, dir);
      try {
        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) {
          issues.push(`${dir} exists but is not a directory`);
        }
      } catch (error) {
        issues.push(`Missing directory: ${dir}`);
      }
    }

    // Check for required files
    const requiredFiles = ['app.js', 'package.json', 'index.html'];
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectDir, file);
      try {
        await fs.access(filePath);
      } catch (error) {
        issues.push(`Missing required file: ${file}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Add new items to existing projects
   */
  async addItem(type, name, options = {}) {
    const validTypes = ['component', 'page', 'store', 'util'];
    
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!name) {
      throw new Error('Item name is required');
    }

    const pascalCase = name.charAt(0).toUpperCase() + name.slice(1);
    const camelCase = name.charAt(0).toLowerCase() + name.slice(1);
    
    let filePath, content, updateIndex = false;
    
    switch (type) {
      case 'component':
        filePath = `components/${pascalCase}.js`;
        content = this.getComponentTemplate(pascalCase);
        updateIndex = true;
        break;
        
      case 'page':
        filePath = `pages/${pascalCase}Page.js`;
        content = this.getPageTemplate(pascalCase);
        updateIndex = true;
        break;
        
      case 'store':
        filePath = `stores/${camelCase}.js`;
        content = this.getStoreTemplate(camelCase);
        updateIndex = true;
        break;
        
      case 'util':
        filePath = `utils/${camelCase}.js`;
        content = this.getUtilTemplate(camelCase);
        updateIndex = true;
        break;
    }

    // Create the file
    const fullPath = path.join(this.projectDir, filePath);
    const dir = path.dirname(fullPath);
    
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');
      console.log(`Created: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to create ${filePath}: ${error.message}`);
    }

    // Update index file if needed
    if (updateIndex) {
      await this.updateIndexFile(type, name, filePath);
    }
  }

  /**
   * Update index files when adding new items
   */
  async updateIndexFile(type, name, filePath) {
    const indexFiles = {
      component: 'components/index.js',
      page: 'pages/index.js',
      store: 'stores/index.js',
      util: 'utils/index.js'
    };

    const indexPath = indexFiles[type];
    if (!indexPath) return;

    const fullIndexPath = path.join(this.projectDir, indexPath);
    
    try {
      let content = await fs.readFile(fullIndexPath, 'utf8');
      
      // Add export statement
      const exportName = type === 'page' ? `${name}Page` : name;
      const exportStatement = `export { ${exportName} } from './${path.basename(filePath)}';\n`;
      
      // Find the last export and add after it
      const lines = content.split('\n');
      let insertIndex = lines.length - 1;
      
      // Find the last export line
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('export {') || lines[i].includes('export default')) {
          insertIndex = i + 1;
          break;
        }
      }
      
      // Insert the new export
      lines.splice(insertIndex, 0, exportStatement);
      
      // Write back to file
      await fs.writeFile(fullIndexPath, lines.join('\n'), 'utf8');
      console.log(`Updated: ${indexPath}`);
    } catch (error) {
      console.warn(`Could not update ${indexPath}: ${error.message}`);
    }
  }

  // Template generators
  getPackageJsonTemplate() {
    // Decide how to reference smoothjs:
    // - If scaffolding inside or alongside the SmoothJS repo, point to the local package with a relative file: path
    //   • Case A: scaffolding inside repo root => dependency should be file:..
    //   • Case B: scaffolding from the repo's parent that contains ./smoothjs => dependency should be file:../smoothjs
    // - Otherwise, fall back to the npm tag "latest" (for when the package is published)
    let smoothDep = 'latest';
    try {
      // Case B: parent contains a 'smoothjs' folder that is a package
      const siblingSmoothDir = path.join(this.targetDir, 'smoothjs');
      const siblingPkg = path.join(siblingSmoothDir, 'package.json');
      if (fsSync.existsSync(siblingPkg)) {
        const txt = fsSync.readFileSync(siblingPkg, 'utf8');
        const json = JSON.parse(txt);
        if (json && json.name === 'smoothjs') {
          const rel = path.relative(this.projectDir, siblingSmoothDir) || '..';
          smoothDep = `file:${rel}`;
        }
      } else {
        // Case A: scaffolding directly inside the smoothjs repo root
        const candidatePkgPath = path.join(this.targetDir, 'package.json');
        if (fsSync.existsSync(candidatePkgPath)) {
          const txt = fsSync.readFileSync(candidatePkgPath, 'utf8');
          const json = JSON.parse(txt);
          if (json && json.name === 'smoothjs') {
            // Compute relative path from the new project to the repo root
            let rel = path.relative(this.projectDir, this.targetDir);
            if (!rel || rel === '') rel = '..';
            smoothDep = `file:${rel}`;
          }
        }
      }
    } catch {}

    return `{
  "name": "${this.projectName}",
  "version": "1.0.0",
  "description": "A SmoothJS application",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "smoothjs": "${smoothDep}"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}`;
  }

  getReadmeTemplate() {
    return `# ${this.projectName}

A SmoothJS application with a well-organized, modular structure.

## Project Structure

\`\`\`
${this.projectName}/
├── components/          # Reusable UI components
├── pages/              # Page components
├── stores/             # State management
├── router/             # Routing configuration
├── utils/              # Utility functions
├── assets/             # Static assets
├── styles/             # CSS and styling
├── tests/              # Test files
├── app.js              # Main application entry point
└── index.html          # HTML entry point
\`\`\`

## Getting Started

1. Install dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Build for production: \`npm run build\`

## Development

- **Components**: Create reusable UI components in \`components/\`
- **Pages**: Add new pages in \`pages/\` and register them in \`router/routes.js\`
- **State**: Manage application state in \`stores/\`
- **Styling**: Add CSS in \`styles/\`

## Best Practices

- Keep components focused and single-purpose
- Use stores for shared state management
- Follow the established naming conventions
- Write tests for your components
- Use TypeScript for better type safety (optional)
`;
  }

  getIndexHtmlTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0ea5e9" />
  <title>${this.projectName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./styles/index.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>`;
  }

  getAppJsTemplate() {
    return `import { defineComponent, version, Velvet } from 'smoothjs';
import { router } from './router/routes.js';

// Functional root App
const App = defineComponent(({ html }) => {
  const render = () => html\`
      <div class=\"app\">
        <header class=\"app-header\">
          <div class=\"container\">
            <nav>
              <span class=\"brand\">${this.projectName}</span>
              <a href=\"#/\" data-router-link data-to=\"/\">Home</a>
              <a href=\"#/about\" data-router-link data-to=\"/about\">About</a>
            </nav>
          </div>
        </header>
        <main class=\"app-main\">
          <div class=\"container\">
            <div data-router-outlet></div>
          </div>
        </main>
        <footer class=\"app-footer\">
          <div class=\"container\">
            <p>Built with SmoothJS v\${version}</p>
          </div>
        </footer>
      </div>\`;
  return { render };
});

// Initialize the application
function startApp() {
  // Inject Velvet CSS variables for design tokens
  try { Velvet && typeof Velvet.injectThemeVariables === 'function' && Velvet.injectThemeVariables(); } catch {}
  const appElement = document.querySelector('#app');
  if (!appElement) return;
  const app = new App();
  app.mount(appElement);
  router.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
  startApp();
}`;
  }

  getComponentsIndexTemplate() {
    return `// Export all components from this directory
export { Button } from './Button.js';
export { Card } from './Card.js';

// Add new component exports here as you create them
// export { NewComponent } from './NewComponent.js';`;
  }

  getPagesIndexTemplate() {
    return `// Export all page components from this directory
export { HomePage } from './HomePage.js';
export { AboutPage } from './AboutPage.js';
export { NotFound } from './NotFound.js';

// Add new page exports here as you create them
// export { NewPage } from './NewPage.js';`;
  }

  getStoresIndexTemplate() {
    return `import { createStore, createSelector } from 'smoothjs';

// Example store
export const counterStore = createStore({ count: 0 });

// Example selector
export const selectCount = createSelector(
  s => s.count,
  (count) => count
);

// Add more stores and selectors here as needed`;
  }

  getRouterIndexTemplate() {
    return `// Re-export the router from routes.js to keep a single source of truth
export { router } from './routes.js';`;
  }

  getUtilsIndexTemplate() {
    return `// Utility functions for the application

/**
 * Format a date in a user-friendly way
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

/**
 * Debounce function calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Add more utility functions here as needed`;
  }

  getStylesIndexTemplate() {
    return `/* Base styles */
:root {
  --primary: #0ea5e9;
  --bg: #f7f9fc;
  --card: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b1220;
    --card: #0f1a2b;
    --text: #ffffff;
    --muted: #cbd5e1;
    --border: #334155;
  }
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}

a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }

.app { min-height: 100vh; display: flex; flex-direction: column; }
.container { max-width: 960px; margin: 0 auto; padding: 0 1rem; }

.app-header { background: var(--card); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
.app-header .brand { font-weight: 700; margin-right: .5rem; color: inherit; }
.app-header nav { display: flex; flex-wrap: wrap; gap: .5rem .65rem; align-items: center; padding: .75rem 0; }
.app-header a[data-router-link] { padding: .4rem .65rem; border-radius: 8px; color: var(--primary); text-decoration: none; transition: background-color .2s ease, color .2s ease; }
.app-header a[data-router-link]:hover { background: rgba(14,165,233,.12); }
.app-header a.active { background: rgba(14,165,233,.18); }

.app-main { flex: 1; padding: 1.25rem 0; }
.app-footer { border-top: 1px solid var(--border); color: var(--muted); padding: 1.25rem 0; }

.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 6px 20px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.06); }

.btn { background: var(--primary); color: #fff; border: 0; padding: .55rem .9rem; border-radius: 8px; cursor: pointer; box-shadow: 0 6px 14px rgba(14,165,233,.24); transition: transform .15s ease, box-shadow .2s ease; }
.btn:hover { transform: translateY(-1px); box-shadow: 0 10px 18px rgba(14,165,233,.28); }
.btn:disabled { opacity: .6; cursor: default; box-shadow: none; }

.input { width: 100%; padding: .6rem .75rem; border: 1px solid var(--border); background: var(--card); color: inherit; border-radius: 8px; }

.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }

.hero { background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%); color: white; border-radius: 14px; padding: 1.5rem; }
.hero h2 { margin: 0 0 .25rem 0; }
.hero p { margin: 0; opacity: .95; }`;
  }

  getGitignoreTemplate() {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.local

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/`;
  }

  getViteConfigTemplate() {
    return `export default {
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
};`;
  }

  getJsConfigTemplate() {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "strict": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": [
    "**/*.js",
    "**/*.jsx"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}`;
  }

  getButtonComponentTemplate() {
    return `import { defineComponent, Velvet } from 'smoothjs';

export const Button = defineComponent((ctx) => {
  const { html, on, props } = ctx;
  const { vs } = Velvet.useVelvet(ctx);
  on('click', 'button', (e) => { try { props && props.onClick && props.onClick(e); } catch {} });
  const cls = vs({
    base: { padding: '0.55rem 0.9rem', backgroundColor: 'var(--color-primary-500, #0ea5e9)', color: '#fff', border: '0', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 6px 14px rgba(14,165,233,.24)', transition: 'transform .15s ease, box-shadow .2s ease' },
    hover: { transform: 'translateY(-1px)', boxShadow: '0 10px 18px rgba(14,165,233,.28)' },
    dark: { color: '#fff' }
  });
  const render = () => html\`
    <button class=\"\${cls}\" \${props && props.disabled ? 'disabled' : ''}>\${(props && props.text) || 'Button'}</button>
  \`;
  return { render };
});`;
  }

  getCardComponentTemplate() {
    return `import { defineComponent } from 'smoothjs';

export const Card = defineComponent(({ html, props }) => {
  const render = () => html\`
      <div class=\"card\">
        \${props && props.title ? html\`<div class=\"card-header\"><h3 class=\"card-title\">\${props.title}</h3></div>\` : ''}
        <div class=\"card-body\">\${props && props.content ? props.content : ''}</div>
        \${props && props.footer ? html\`<div class=\"card-footer\">\${props.footer}</div>\` : ''}
      </div>
    \`;
  return { render };
});`;
  }

  getHomePageTemplate() {
    return `import { defineComponent } from 'smoothjs';

export const HomePage = defineComponent(({ html }) => {
  const render = () => html\`
      <div class="home-page">
        <section class="hero">
          <h2>Welcome to ${this.projectName}</h2>
          <p>Minimal SmoothJS starter. Clean UI, ready to build.</p>
        </section>
        <section class="grid" style="margin-top:1rem;">
          <div class="card">
            <h3 style="margin:.25rem 0 .5rem;">Get started</h3>
            <p class="muted" style="margin:0 0 .5rem;">Edit <code>pages/HomePage.js</code> and <code>styles/index.css</code>.</p>
            <p style="margin:0">Routing, state, and utilities are available out of the box.</p>
          </div>
          <a class="card" href="#/about" data-router-link data-to="/about" style="display:block;">
            <h3 style="margin:.25rem 0 .5rem;">About</h3>
            <p class="muted" style="margin:0">See a basic secondary page and link handling.</p>
          </a>
        </section>
      </div>\`;
  return { render };
});`;
  }

  getAboutPageTemplate() {
    return `import { defineComponent } from 'smoothjs';

export const AboutPage = defineComponent(({ html }) => {
  const render = () => html\`
      <div class=\"about-page\">
        <h2>About ${this.projectName}</h2>
        <p>This page is part of the default SmoothJS scaffold.</p>
      </div>\`;
  return { render };
});`;
  }

  getNotFoundPageTemplate() {
    return `import { defineComponent } from 'smoothjs';

export const NotFound = defineComponent(({ html }) => {
  const render = () => html\`
      <div class=\"not-found\">
        <h2>Page Not Found</h2>
        <p>The page you requested could not be found.</p>
        <a href=\"#/\" data-router-link data-to=\"/\">Go Home</a>
      </div>\`;
  return { render };
});`;
  }

  getCounterStoreTemplate() {
    return `import { createStore, createSelector } from 'smoothjs';

// Counter store
export const counterStore = createStore({ count: 0 });

// Counter selectors
export const selectCount = createSelector(
  s => s.count,
  (count) => count
);

export const selectIsEven = createSelector(
  s => s.count,
  (count) => count % 2 === 0
);

export const selectDouble = createSelector(
  s => s.count,
  (count) => count * 2
);

// Counter actions
export const counterActions = {
  increment: () => counterStore.setState(prev => ({ count: prev.count + 1 })),
  decrement: () => counterStore.setState(prev => ({ count: prev.count - 1 })),
  reset: () => counterStore.setState({ count: 0 }),
  setCount: (count) => counterStore.setState({ count })
};`;
  }

  getRoutesTemplate() {
    return `import { Router } from 'smoothjs';
import { HomePage } from '../pages/HomePage.js';
import { AboutPage } from '../pages/AboutPage.js';
import { NotFound } from '../pages/NotFound.js';

// Create router instance
export const router = new Router({
  mode: 'hash',
  root: '#app',
  notFound: NotFound
});

// Configure routes
router
  .route('/', HomePage)
  .route('/about', AboutPage);

// Add more routes here as you create new pages
// router.route('/users', () => import('../pages/UsersPage.js'));
// router.route('/users/:id', () => import('../pages/UserDetailPage.js'));`;
  }

  // Template generators for new items
  getComponentTemplate(name) {
    return `import { Component } from 'smoothjs';

export class ${name} extends Component {
  constructor() {
    super(null, {
      // Add your props here
    });
  }

  onCreate() {
    // Initialize event listeners and subscriptions
  }

  onUnmount() {
    // Clean up subscriptions and event listeners
  }

  template() {
    return this.html\`
      <div class="${name.toLowerCase()}">
        <!-- Your component template here -->
        <h3>${name} Component</h3>
        <p>This is the ${name} component.</p>
      </div>
    \`;
  }
}`;
  }

  getPageTemplate(name) {
    return `import { Component } from 'smoothjs';

export class ${name}Page extends Component {
  constructor() {
    super(null, {
      // Add your page state here
    });
  }

  onCreate() {
    // Initialize page-specific logic
  }

  onUnmount() {
    // Clean up page resources
  }

  template() {
    return this.html\`
      <div class="${name.toLowerCase()}-page">
        <h2>${name}</h2>
        <div class="page-content">
          <!-- Your page content here -->
          <p>This is the ${name} page.</p>
        </div>
      </div>
    \`;
  }
}`;
  }

  getStoreTemplate(name) {
    return `import { createStore, createSelector } from 'smoothjs';

// ${name} store
export const ${name}Store = createStore({
  // Add your initial state here
  data: null,
  loading: false,
  error: null
});

// ${name} selectors
export const select${name.charAt(0).toUpperCase() + name.slice(1)}Data = createSelector(
  s => s.data,
  (data) => data
);

export const select${name.charAt(0).toUpperCase() + name.slice(1)}Loading = createSelector(
  s => s.loading,
  (loading) => loading
);

export const select${name.charAt(0).toUpperCase() + name.slice(1)}Error = createSelector(
  s => s.error,
  (error) => error
);

// ${name} actions
export const ${name}Actions = {
  setData: (data) => ${name}Store.setState({ data, loading: false, error: null }),
  setLoading: (loading) => ${name}Store.setState({ loading }),
  setError: (error) => ${name}Store.setState({ error, loading: false }),
  reset: () => ${name}Store.setState({ data: null, loading: false, error: null })
};`;
  }

  getUtilTemplate(name) {
    return `/**
 * ${name} utility functions
 */

/**
 * Example utility function
 */
export function ${name}() {
  // Add your utility logic here
  return '${name} utility function';
}

/**
 * Add more utility functions as needed
 */
export function ${name}Helper() {
  return '${name} helper function';
}`;
  }
}
