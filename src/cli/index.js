#!/usr/bin/env node

import { createProject, validateProject, addItem } from './create.js';
import { ProjectValidator } from './validator.js';

/**
 * SmoothJS CLI - Project Management and Structure Enforcement
 * 
 * This CLI provides tools to:
 * - Create new SmoothJS projects with recommended structure
 * - Validate existing projects against best practices
 * - Add new components, pages, stores, and utilities
 * - Enforce consistent project organization
 */

// Export all CLI functions
export {
  createProject,
  validateProject,
  addItem,
  ProjectValidator
};

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'create':
      if (!args[0]) {
        console.error('Project name is required');
        console.log('Usage: npx smoothjs create <project-name> [target-dir]');
        process.exit(1);
      }
      createProject(args[0], { target: args[1] });
      break;
      
    case 'validate':
      const validator = new ProjectValidator(args[0]);
      validator.validate().then(result => {
        if (result.issues.length > 0) {
          process.exit(1);
        }
      });
      break;
      
    case 'add':
      if (!args[0] || !args[1]) {
        console.error('Type and name are required');
        console.log('Usage: npx smoothjs add <type> <name> [project-path]');
        console.log('Types: component, page, store, util');
        process.exit(1);
      }
      addItem(args[0], args[1], { project: args[2] });
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      showHelp();
      break;
  }
}

/**
 * Display CLI help information
 */
function showHelp() {
  console.log('SmoothJS CLI - Project Management and Structure Enforcement');
  console.log('=============================================================');
  console.log('');
  console.log('Commands:');
  console.log('');
  console.log('  create <project-name> [target-dir]');
  console.log('    Create a new SmoothJS project with recommended structure');
  console.log('    Example: npx smoothjs create my-app');
  console.log('');
  console.log('  validate [project-path]');
  console.log('    Validate existing project structure against best practices');
  console.log('    Example: npx smoothjs validate');
  console.log('');
  console.log('  add <type> <name> [project-path]');
  console.log('    Add new items to existing projects');
  console.log('    Types: component, page, store, util');
  console.log('    Example: npx smoothjs add component Button');
  console.log('');
  console.log('  help');
  console.log('    Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  npx smoothjs create my-app');
  console.log('  npx smoothjs create my-app ./projects');
  console.log('  npx smoothjs validate');
  console.log('  npx smoothjs add component Button');
  console.log('  npx smoothjs add page UserProfile');
  console.log('  npx smoothjs add store user');
  console.log('  npx smoothjs add util helpers');
  console.log('');
  console.log('Project Structure:');
  console.log('  [projectname]/');
  console.log('  ├── components/          # Reusable UI components');
  console.log('  ├── pages/              # Page components');
  console.log('  ├── stores/             # State management');
  console.log('  ├── router/             # Routing configuration');
  console.log('  ├── utils/              # Utility functions');
  console.log('  ├── assets/             # Static assets');
  console.log('  ├── styles/             # CSS and styling');
  console.log('  ├── tests/              # Test files');
  console.log('  ├── app.js              # Main application entry point');
  console.log('  └── index.html          # HTML entry point');
  console.log('');
  console.log('For more information, visit: https://github.com/smoothjs/smoothjs');
}
