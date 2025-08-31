#!/usr/bin/env node

import { ProjectScaffold } from './scaffold.js';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * CLI command to create new SmoothJS projects
 * Usage: npx smoothjs create <project-name> [options]
 */
export async function createProject(projectName, options = {}) {
  if (!projectName) {
    console.error('❌ Project name is required');
    console.log('Usage: npx smoothjs create <project-name>');
    process.exit(1);
  }

  // Validate project name
  if (!/^[a-z0-9-]+$/.test(projectName)) {
    console.error('❌ Project name must contain only lowercase letters, numbers, and hyphens');
    process.exit(1);
  }

  const targetDir = options.target || process.cwd();
  
  try {
    // Check if project directory already exists
    const projectPath = path.join(targetDir, projectName);
    try {
      await fs.access(projectPath);
      console.error(`❌ Project directory already exists: ${projectPath}`);
      console.log('Please choose a different project name or remove the existing directory');
      process.exit(1);
    } catch {
      // Directory doesn't exist, proceed
    }

    // Create the project scaffold
    const scaffold = new ProjectScaffold(projectName, targetDir);
    const success = await scaffold.scaffold();
    
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to create project:', error.message);
    process.exit(1);
  }
}

/**
 * CLI command to validate existing project structure
 */
export async function validateProject(projectPath = process.cwd()) {
  try {
    const scaffold = new ProjectScaffold('', projectPath);
    const validation = await scaffold.validateStructure();
    
    if (validation.isValid) {
      console.log('✅ Project structure is valid!');
      return true;
    } else {
      console.log('❌ Project structure has issues:');
      validation.issues.forEach(issue => console.log(`  - ${issue}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

/**
 * CLI command to add new components/pages/stores
 */
export async function addItem(type, name, options = {}) {
  const validTypes = ['component', 'page', 'store', 'util'];
  
  if (!validTypes.includes(type)) {
    console.error(`❌ Invalid type. Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  if (!name) {
    console.error('❌ Item name is required');
    console.log(`Usage: npx smoothjs add ${type} <name>`);
    process.exit(1);
  }

  const projectPath = options.project || process.cwd();
  
  try {
    const scaffold = new ProjectScaffold('', projectPath);
    await scaffold.addItem(type, name, options);
    console.log(`✅ Added ${type}: ${name}`);
  } catch (error) {
    console.error(`❌ Failed to add ${type}:`, error.message);
    process.exit(1);
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'create':
      createProject(args[0], { target: args[1] });
      break;
    case 'validate':
      validateProject(args[0]);
      break;
    case 'add':
      const type = args[0];
      const name = args[1];
      addItem(type, name, { project: args[2] });
      break;
    default:
      console.log('SmoothJS CLI');
      console.log('');
      console.log('Commands:');
      console.log('  create <project-name> [target-dir]  Create a new project');
      console.log('  validate [project-path]             Validate project structure');
      console.log('  add <type> <name> [project-path]   Add new item (component/page/store/util)');
      console.log('');
      console.log('Examples:');
      console.log('  npx smoothjs create my-app');
      console.log('  npx smoothjs create my-app ./projects');
      console.log('  npx smoothjs validate');
      console.log('  npx smoothjs add component Button');
      console.log('  npx smoothjs add page UserProfile');
      console.log('  npx smoothjs add store user');
      console.log('  npx smoothjs add util helpers');
      break;
  }
}
