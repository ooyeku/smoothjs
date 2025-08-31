# SmoothJS Directory Structure Enforcement System

## Overview

The SmoothJS CLI system provides a robust methodology to enforce the recommended directory structure for all SmoothJS projects. This system ensures consistency, maintainability, and scalability across projects while promoting best practices and reducing common architectural mistakes.

## 🎯 Core Objectives

1. **Standardization**: Enforce consistent project structure across all SmoothJS projects
2. **Best Practices**: Automatically implement proven architectural patterns
3. **Developer Experience**: Reduce setup time and eliminate common mistakes
4. **Maintainability**: Create scalable, organized codebases
5. **Onboarding**: Help new developers understand and follow conventions

## 🏗️ Enforced Directory Structure

### Required Directories (Critical)

```
[projectname]/
├── components/          # Reusable UI components
├── pages/              # Page components for routing
├── stores/             # State management
└── router/             # Routing configuration
```

**Why These Are Required:**
- **components/**: Core of component-based architecture
- **pages/**: Essential for routing and page organization
- **stores/**: Critical for state management patterns
- **router/**: Required for navigation and routing logic

### Recommended Directories (Optional but Encouraged)

```
[projectname]/
├── utils/              # Utility functions and helpers
├── assets/             # Static assets (images, fonts, etc.)
├── styles/             # CSS and styling files
└── tests/              # Test files and test utilities
```

**Benefits of Recommended Directories:**
- **utils/**: Centralized utility functions, easier testing
- **assets/**: Organized static file management
- **styles/**: Centralized styling and theming
- **tests/**: Proper test organization and coverage

### Required Files (Critical)

```
[projectname]/
├── app.js              # Main application entry point
├── package.json        # Project configuration and dependencies
└── index.html          # HTML entry point
```

**Why These Files Are Required:**
- **app.js**: Core application logic and initialization
- **package.json**: Dependency management and project metadata
- **index.html**: HTML entry point for the application

## 🔧 Implementation Methods

### 1. Project Scaffolding

**Command**: `smoothjs create <project-name>`

**What It Does:**
- Creates complete directory structure
- Generates template files with best practices
- Sets up build configuration (Vite)
- Creates example components and pages
- Generates comprehensive documentation

**Benefits:**
- Zero setup time for new projects
- Consistent starting point
- Built-in examples and patterns
- Professional project structure from day one

### 2. Structure Validation

**Command**: `smoothjs validate [project-path]`

**What It Checks:**
- Required directories exist and are properly structured
- Required files exist with proper content
- File naming conventions are followed
- Import/export patterns are correct
- Best practices are implemented

**Validation Levels:**
- **Critical Issues** (-20 points): Missing required elements
- **Warnings** (-5 points): Potential problems
- **Suggestions** (0 points): Improvements
- **Bonus** (+5 points): Following best practices

**Scoring System:**
- **90-100**: Excellent - Follows all best practices
- **70-89**: Good - Solid structure with minor improvements
- **50-69**: Fair - Needs some restructuring
- **0-49**: Needs work - Major restructuring required

### 3. Component Generation

**Command**: `smoothjs add <type> <name>`

**Supported Types:**
- `component`: Reusable UI components
- `page`: Page components for routing
- `store`: State management stores
- `util`: Utility functions

**What It Does:**
- Creates properly structured files
- Follows naming conventions
- Updates index files automatically
- Provides template code
- Maintains consistency

## 📋 Naming Conventions

### File Naming

| Type | Pattern | Examples | Description |
|------|---------|----------|-------------|
| Components | `PascalCase.js` | `Button.js`, `UserCard.js` | PascalCase for component names |
| Pages | `PascalCasePage.js` | `HomePage.js`, `UserProfilePage.js` | PascalCase with "Page" suffix |
| Stores | `camelCase.js` | `userStore.js`, `counterStore.js` | camelCase for store names |
| Utils | `camelCase.js` | `helpers.js`, `formatters.js` | camelCase for utility names |

### Import/Export Patterns

```javascript
// components/index.js
export { Button } from './Button.js';
export { Card } from './Card.js';

// pages/index.js
export { HomePage } from './HomePage.js';
export { AboutPage } from './AboutPage.js';

// stores/index.js
export { userStore } from './userStore.js';
export { counterStore } from './counterStore.js';
```

## 🚀 Best Practices Enforcement

### Component Guidelines

- **Single Responsibility**: Each component has one clear purpose
- **Props Interface**: Use props for configuration and state
- **Lifecycle Management**: Implement proper onCreate/onUnmount
- **Error Handling**: Graceful error handling and boundaries
- **Testing**: Write tests for all components

### Page Guidelines

- **Separation of Concerns**: Page logic separate from component logic
- **State Management**: Use stores for shared state
- **Loading States**: Proper loading and error state handling
- **Navigation**: Handle routing and navigation properly
- **Resource Management**: Clean up resources on unmount

### Store Guidelines

- **Domain Focus**: Each store manages specific domain
- **Selector Pattern**: Use createSelector for derived state
- **Action Pattern**: Centralized actions for state changes
- **Error Handling**: Proper error state management
- **Testing**: Test stores and selectors thoroughly

### Routing Guidelines

- **Hash Routing**: Use hash routing for static hosting
- **Navigation Guards**: Implement guards for protected routes
- **Lazy Loading**: Use lazy loading for code splitting
- **404 Handling**: Graceful handling of unmatched routes
- **Route Organization**: Centralized route definitions

## 🔍 Validation Rules

### Directory Validation

```javascript
// Required directories must exist and be directories
requiredDirs: ['components', 'pages', 'stores', 'router']

// Check each required directory
for (const dir of requiredDirs) {
  const dirPath = path.join(projectPath, dir);
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      issues.push(`${dir} exists but is not a directory`);
    }
  } catch (error) {
    issues.push(`Missing required directory: ${dir}`);
  }
}
```

### File Validation

```javascript
// Required files must exist
requiredFiles: ['app.js', 'package.json', 'index.html']

// Check each required file
for (const file of requiredFiles) {
  const filePath = path.join(projectPath, file);
  try {
    await fs.access(filePath);
  } catch (error) {
    issues.push(`Missing required file: ${file}`);
  }
}
```

### Content Validation

```javascript
// Validate app.js content
async validateAppJs(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  
  if (!content.includes('import') || !content.includes('smoothjs')) {
    warnings.push('app.js may not be properly importing SmoothJS');
  }
  
  if (!content.includes('Component')) {
    warnings.push('app.js may not be using SmoothJS Component class');
  }
}
```

## 📊 Scoring Algorithm

```javascript
calculateScore() {
  let score = 100;
  
  // Deduct points for critical issues
  score -= this.issues.length * 20;
  
  // Deduct points for warnings
  score -= this.warnings.length * 5;
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
}
```

## 🔄 Migration Support

### For Existing Projects

1. **Assessment**: Run `smoothjs validate` to identify issues
2. **Restructuring**: Follow migration guide step by step
3. **Validation**: Re-run validation to confirm improvements
4. **Iteration**: Continue improving based on suggestions

### Migration Steps

```bash
# Step 1: Create required directories
mkdir components pages stores router

# Step 2: Move existing files
mv *.js components/  # Move component files
mv *Page.js pages/   # Move page files

# Step 3: Create index files
touch components/index.js pages/index.js stores/index.js router/index.js

# Step 4: Update imports
# Update all import statements to use index files

# Step 5: Validate
smoothjs validate
```

## 🎯 Success Metrics

### Immediate Benefits

- **Consistency**: All projects follow same structure
- **Onboarding**: New developers understand project layout
- **Maintenance**: Easier to navigate and maintain codebases
- **Scalability**: Structure supports project growth

### Long-term Benefits

- **Team Productivity**: Faster development and debugging
- **Code Quality**: Consistent patterns and practices
- **Knowledge Transfer**: Easier to share knowledge across projects
- **Tooling**: Better IDE support and automation

## 🔮 Future Enhancements

### Planned Features

1. **Template System**: Custom project templates
2. **Plugin Architecture**: Extensible validation rules
3. **IDE Integration**: VS Code and other editor support
4. **CI/CD Integration**: Automated validation in pipelines
5. **Metrics Dashboard**: Project structure analytics

### Customization Options

- **Strict Mode**: Enforce all rules strictly
- **Relaxed Mode**: Allow some flexibility
- **Custom Rules**: Project-specific validation rules
- **Template Customization**: Modify generated templates

## 📚 Documentation and Support

### Resources

- **CLI Help**: `smoothjs help`
- **Command Documentation**: Built-in help for each command
- **Examples**: Sample projects and code snippets
- **Best Practices**: Comprehensive guidelines and patterns

### Community Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share experiences
- **Contributing**: Submit improvements and new features
- **Examples**: Share project structures and patterns

## 🏆 Conclusion

The SmoothJS Directory Structure Enforcement System provides a comprehensive solution for maintaining consistent, scalable, and maintainable project architectures. By combining automated scaffolding, validation, and best practices enforcement, it ensures that all SmoothJS projects benefit from proven architectural patterns while maintaining flexibility for project-specific needs.

This system transforms project setup from a time-consuming, error-prone process into a streamlined, consistent experience that promotes best practices and reduces technical debt from day one.
