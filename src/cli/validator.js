import { promises as fs } from 'fs';
import path from 'path';

/**
 * SmoothJS Project Structure Validator
 * Validates existing projects against the recommended structure
 */
export class ProjectValidator {
  constructor(projectPath = process.cwd()) {
    this.projectPath = path.resolve(projectPath);
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
    
    // Required directory structure
    this.requiredDirs = [
      'components',
      'pages',
      'stores',
      'router'
    ];
    
    // Optional but recommended directories
    this.recommendedDirs = [
      'utils',
      'assets',
      'styles',
      'tests'
    ];
    
    // Required files
    this.requiredFiles = [
      'app.js',
      'package.json',
      'index.html'
    ];
    
    // Recommended files
    this.recommendedFiles = [
      'README.md',
      '.gitignore',
      'vite.config.js',
      'jsconfig.json'
    ];
  }

  /**
   * Validate the complete project structure
   */
  async validate() {
    console.log(`🔍 Validating project structure: ${this.projectPath}`);
    
    try {
      // Check if project path exists
      await this.checkProjectExists();
      
      // Validate directories
      await this.validateDirectories();
      
      // Validate files
      await this.validateFiles();
      
      // Check for common issues
      await this.checkCommonIssues();
      
      // Generate report
      this.generateReport();
      
      return {
        isValid: this.issues.length === 0,
        issues: this.issues,
        warnings: this.warnings,
        suggestions: this.suggestions,
        score: this.calculateScore()
      };
    } catch (error) {
      console.error('Validation failed:', error.message);
      return {
        isValid: false,
        issues: [error.message],
        warnings: [],
        suggestions: [],
        score: 0
      };
    }
  }

  /**
   * Check if project directory exists
   */
  async checkProjectExists() {
    try {
      const stats = await fs.stat(this.projectPath);
      if (!stats.isDirectory()) {
        throw new Error('Project path is not a directory');
      }
    } catch (error) {
      throw new Error(`Project directory not found: ${this.projectPath}`);
    }
  }

  /**
   * Validate required and recommended directories
   */
  async validateDirectories() {
    // Check required directories
    for (const dir of this.requiredDirs) {
      const dirPath = path.join(this.projectPath, dir);
      try {
        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) {
          this.issues.push(`${dir}/ exists but is not a directory`);
        } else {
          // Check if directory has content
          const files = await fs.readdir(dirPath);
          if (files.length === 0) {
            this.warnings.push(`${dir}/ directory is empty`);
          }
        }
      } catch (error) {
        this.issues.push(`Missing required directory: ${dir}/`);
      }
    }

    // Check recommended directories
    for (const dir of this.recommendedDirs) {
      const dirPath = path.join(this.projectPath, dir);
      try {
        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) {
          this.suggestions.push(`Consider adding ${dir}/ directory for better organization`);
        }
      } catch (error) {
        this.suggestions.push(`Consider adding ${dir}/ directory for better organization`);
      }
    }
  }

  /**
   * Validate required and recommended files
   */
  async validateFiles() {
    // Check required files
    for (const file of this.requiredFiles) {
      const filePath = path.join(this.projectPath, file);
      try {
        await fs.access(filePath);
        
        // Check file content for basic validation
        if (file === 'app.js') {
          await this.validateAppJs(filePath);
        } else if (file === 'package.json') {
          await this.validatePackageJson(filePath);
        }
      } catch (error) {
        this.issues.push(`Missing required file: ${file}`);
      }
    }

    // Check recommended files
    for (const file of this.recommendedFiles) {
      const filePath = path.join(this.projectPath, file);
      try {
        await fs.access(filePath);
      } catch (error) {
        this.suggestions.push(`Consider adding ${file} for better project setup`);
      }
    }
  }

  /**
   * Validate app.js file structure
   */
  async validateAppJs(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check for basic SmoothJS imports
      if (!content.includes('import') || !content.includes('smoothjs')) {
        this.warnings.push('app.js may not be properly importing SmoothJS');
      }
      
      // Check for Component usage
      if (!content.includes('Component')) {
        this.warnings.push('app.js may not be using SmoothJS Component class');
      }
      
      // Check for router usage
      if (!content.includes('router')) {
        this.warnings.push('app.js may not be using SmoothJS Router');
      }
    } catch (error) {
      this.warnings.push(`Could not read app.js for validation: ${error.message}`);
    }
  }

  /**
   * Validate package.json file
   */
  async validatePackageJson(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const pkg = JSON.parse(content);
      
      // Check for SmoothJS dependency
      if (!pkg.dependencies || !pkg.dependencies.smoothjs) {
        this.warnings.push('package.json does not include smoothjs dependency');
      }
      
      // Check for type module
      if (pkg.type !== 'module') {
        this.warnings.push('package.json should have "type": "module" for ES modules');
      }
      
      // Check for scripts
      if (!pkg.scripts || !pkg.scripts.dev) {
        this.suggestions.push('Consider adding dev script to package.json');
      }
    } catch (error) {
      this.warnings.push(`Could not parse package.json: ${error.message}`);
    }
  }

  /**
   * Check for common project structure issues
   */
  async checkCommonIssues() {
    // Check for index.js files in directories
    for (const dir of this.requiredDirs) {
      const indexPath = path.join(this.projectPath, dir, 'index.js');
      try {
        await fs.access(indexPath);
      } catch (error) {
        this.suggestions.push(`Consider adding index.js in ${dir}/ for cleaner imports`);
      }
    }

    // Check for proper file organization
    const allFiles = await this.getAllFiles(this.projectPath);
    
    // Check for components outside components directory
    const componentFiles = allFiles.filter(file => 
      file.includes('Component') || file.includes('component') ||
      file.endsWith('.jsx') || file.endsWith('.tsx')
    ).filter(file => !file.includes('components/'));
    
    if (componentFiles.length > 0) {
      this.warnings.push('Found component-like files outside components/ directory');
    }

    // Check for pages outside pages directory
    const pageFiles = allFiles.filter(file => 
      file.includes('Page') || file.includes('page')
    ).filter(file => !file.includes('pages/'));
    
    if (pageFiles.length > 0) {
      this.warnings.push('Found page-like files outside pages/ directory');
    }
  }

  /**
   * Get all files in project recursively
   */
  async getAllFiles(dir, files = []) {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        await this.getAllFiles(fullPath, files);
      } else if (stats.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath.replace(this.projectPath + '/', ''));
      }
    }
    
    return files;
  }

  /**
   * Calculate project structure score
   */
  calculateScore() {
    let score = 100;
    
    // Deduct points for issues
    score -= this.issues.length * 20;
    
    // Deduct points for warnings
    score -= this.warnings.length * 5;
    
    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 Project Structure Validation Report');
    console.log('=====================================');
    
    if (this.issues.length === 0) {
      console.log('No critical issues found.');
    } else {
      console.log(`Found ${this.issues.length} critical issue(s):`);
      this.issues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  Found ${this.warnings.length} warning(s):`);
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (this.suggestions.length > 0) {
      console.log(`💡 ${this.suggestions.length} suggestion(s) for improvement:`);
      this.suggestions.forEach(suggestion => console.log(`   • ${suggestion}`));
    }
    
    const score = this.calculateScore();
    console.log(`\n🏆 Project Structure Score: ${score}/100`);
    
    if (score >= 90) {
      console.log('🌟 Excellent! Your project follows SmoothJS best practices.');
    } else if (score >= 70) {
      console.log('👍 Good! Your project has a solid structure with room for improvement.');
    } else if (score >= 50) {
      console.log('⚠️  Fair. Consider restructuring your project to follow SmoothJS conventions.');
    } else {
      console.log('🔧 Needs work. Your project would benefit from following the recommended structure.');
    }
    
    if (this.issues.length > 0) {
      console.log('\n🚨 Critical issues must be fixed for the project to work properly.');
    }
    
    if (this.suggestions.length > 0) {
      console.log('\n💡 Run "npx smoothjs validate" for detailed recommendations.');
    }
  }

  /**
   * Generate detailed recommendations
   */
  generateRecommendations() {
    console.log('\n📋 Detailed Recommendations');
    console.log('==========================');
    
    if (this.issues.length > 0) {
      console.log('\n🔴 Critical Issues to Fix:');
      this.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue}`);
        console.log(`   Action: ${this.getActionForIssue(issue)}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n🟡 Warnings to Address:');
      this.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning}`);
        console.log(`   Action: ${this.getActionForWarning(warning)}`);
      });
    }
    
    if (this.suggestions.length > 0) {
      console.log('\n🟢 Suggestions for Improvement:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`\n${index + 1}. ${suggestion}`);
        console.log(`   Action: ${this.getActionForSuggestion(suggestion)}`);
      });
    }
  }

  /**
   * Get action recommendations for issues
   */
  getActionForIssue(issue) {
    if (issue.includes('Missing required directory')) {
      const dir = issue.split(': ')[1];
      return `Create the ${dir} directory and add appropriate files`;
    }
    if (issue.includes('Missing required file')) {
      const file = issue.split(': ')[1];
      return `Create ${file} with proper content`;
    }
    return 'Review and fix the issue according to SmoothJS conventions';
  }

  /**
   * Get action recommendations for warnings
   */
  getActionForWarning(warning) {
    if (warning.includes('may not be properly importing')) {
      return 'Ensure proper SmoothJS imports in your files';
    }
    if (warning.includes('directory is empty')) {
      return 'Add appropriate files to the directory or remove it if not needed';
    }
    return 'Review the warning and take appropriate action';
  }

  /**
   * Get action recommendations for suggestions
   */
  getActionForSuggestion(suggestion) {
    if (suggestion.includes('Consider adding')) {
      const item = suggestion.split('Consider adding ')[1];
      return `Add ${item} to improve your project structure`;
    }
    if (suggestion.includes('Consider restructuring')) {
      return 'Reorganize your project to follow the recommended directory structure';
    }
    return 'Consider implementing the suggestion for better project organization';
  }
}
