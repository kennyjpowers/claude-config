# Task Breakdown: Transform claude-config into npm Package "claudeflow"

**Generated:** 2025-11-21
**Source:** specs/package-publishing-strategy/02-specification.md
**Feature Slug:** package-publishing-strategy
**Last Decompose:** 2025-11-21

---

## Overview

Transform the claude-config repository from a bash-based installer (install.sh) into a professional npm package (@33strategies/claudeflow) that provides cross-platform installation via npm/yarn/pnpm. This transformation includes:

- Pure Installer CLI architecture (replaces 262-line install.sh)
- Cross-platform support (Windows, macOS, Linux)
- Node.js >=20.0.0 requirement (aligned with ClaudeKit)
- Automated version management via semantic-release
- Update notifications for users
- CI/CD testing across 6 combinations (3 OS × 2 Node versions)

**Total Tasks:** 25 tasks across 3 phases
**Estimated MVP Completion:** Phase 1 (18 tasks)

---

## Phase 1: Core npm Package (MVP)

**Goal:** Replace install.sh with npm package distribution

### Task 1.1: Create package.json with all required fields

**Description:** Initialize package.json with complete npm package configuration
**Size:** Small
**Priority:** Critical
**Dependencies:** None
**Can run parallel with:** Task 1.2 (LICENSE)

**Technical Requirements:**
- Package name: `@33strategies/claudeflow`
- Version: `1.2.0` (maintains continuity with current project)
- Author: Kenneth Priester <33strategies@duck.com>
- License: MIT
- Node.js engine: `>=20.0.0`
- npm engine: `>=9.0.0`

**Complete package.json structure:**
```json
{
  "name": "@33strategies/claudeflow",
  "version": "1.2.0",
  "description": "Workflow orchestration for Claude Code - end-to-end feature development lifecycle",
  "keywords": [
    "claude",
    "claude-code",
    "workflow",
    "orchestration",
    "ai-assisted-development",
    "cli",
    "automation"
  ],
  "author": {
    "name": "Kenneth Priester",
    "email": "33strategies@duck.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/kennyjpowers/claude-flow.git.git"
  },
  "bugs": {
    "url": "https://github.com/kennyjpowers/claude-flow.git/issues"
  },
  "homepage": "https://claudeflow.dev",
  "bin": {
    "claudeflow": "./bin/claudeflow.js"
  },
  "main": "./lib/index.js",
  "files": [
    "bin/",
    "lib/",
    ".claude/",
    "templates/",
    "docs/",
    "README.md",
    "CLAUDE.md",
    "CHANGELOG.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "claudekit": "^1.0.0",
    "update-notifier": "^7.0.0"
  },
  "devDependencies": {
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/git": "^10.0.1",
    "semantic-release": "^22.0.0"
  },
  "scripts": {
    "test": "echo 'Tests coming in Phase 2'",
    "prepublishOnly": "node scripts/verify-files.js"
  },
  "type": "module"
}
```

**Implementation Steps:**
1. Create package.json in project root
2. Copy the JSON structure above
3. Verify all fields are present
4. Run `npm install` to test dependency resolution
5. Check that `claudekit` and `update-notifier` install successfully

**Acceptance Criteria:**
- [ ] package.json exists in project root
- [ ] Package name is `@33strategies/claudeflow`
- [ ] Version is `1.2.0`
- [ ] Node.js engine requirement is `>=20.0.0`
- [ ] Both dependencies (claudekit, update-notifier) specified
- [ ] Files whitelist includes all necessary directories
- [ ] `npm install` completes without errors
- [ ] `bin` field points to `./bin/claudeflow.js`

---

### Task 1.2: Create LICENSE file (MIT)

**Description:** Add MIT License file to project root
**Size:** Small
**Priority:** Critical
**Dependencies:** None
**Can run parallel with:** Task 1.1, 1.3

**Technical Requirements:**
- License type: MIT
- Copyright holder: Kenneth Priester
- Year: 2025

**Complete LICENSE content:**
```
MIT License

Copyright (c) 2025 Kenneth Priester

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Implementation Steps:**
1. Create file named `LICENSE` (no extension) in project root
2. Copy the MIT License text above
3. Verify copyright year and name are correct
4. Ensure file is tracked in git

**Acceptance Criteria:**
- [ ] LICENSE file exists in project root
- [ ] File contains complete MIT License text
- [ ] Copyright year is 2025
- [ ] Copyright holder is Kenneth Priester
- [ ] File is committed to git

---

### Task 1.3: Create .npmignore file

**Description:** Configure npm package file exclusions
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1, 1.2

**Technical Requirements:**
- Exclude development files (specs/, .simple-task-master/, test/)
- Exclude git metadata (.git/, .github/)
- Explicitly include distribution files (README.md, CLAUDE.md, CHANGELOG.md, LICENSE)

**Complete .npmignore content:**
```
# Development files
.git/
.github/
specs/
.simple-task-master/

# Test files
test/
coverage/

# Development docs
docs/ideation/

# Local files
*.log
.DS_Store
temp.txt
node_modules/

# Keep these in package (override)
!README.md
!CLAUDE.md
!CHANGELOG.md
!LICENSE
```

**Implementation Steps:**
1. Create `.npmignore` file in project root
2. Copy the ignore patterns above
3. Test with `npm pack` to verify file list
4. Inspect generated tarball: `tar -tzf 33strategies-claudeflow-1.2.0.tgz`
5. Ensure specs/ and test/ are excluded
6. Ensure README.md, CLAUDE.md, LICENSE are included

**Acceptance Criteria:**
- [ ] .npmignore file exists
- [ ] specs/ directory excluded from package
- [ ] .simple-task-master/ excluded
- [ ] README.md, CLAUDE.md, CHANGELOG.md, LICENSE included
- [ ] `npm pack` creates tarball < 500KB
- [ ] Tarball inspection shows correct files

---

### Task 1.4: Update .claude-plugin/plugin.json to v1.2.0

**Description:** Update plugin metadata to match package version
**Size:** Trivial
**Priority:** Low
**Dependencies:** Task 1.1 (package.json)

**Technical Requirements:**
- Version must match package.json (1.2.0)
- Update description if needed
- Ensure repository URL is correct

**Current plugin.json (outdated at v1.0.0):**
```json
{
  "name": "claude-config",
  "version": "1.0.0",
  "description": "Best practice configuration templates and utilities for Claude Code",
  "author": "Kenneth Priester",
  "repository": "https://github.com/kennyjpowers/claude-flow.git",
  "keywords": ["claude-code", "configuration", "templates", "best-practices"]
}
```

**Updated plugin.json:**
```json
{
  "name": "@33strategies/claudeflow",
  "version": "1.2.0",
  "description": "Workflow orchestration for Claude Code - end-to-end feature development lifecycle",
  "author": "Kenneth Priester",
  "repository": "https://github.com/kennyjpowers/claude-flow.git",
  "keywords": ["claude-code", "workflow", "orchestration", "automation"]
}
```

**Implementation Steps:**
1. Read current .claude-plugin/plugin.json
2. Update version to 1.2.0
3. Update name to @33strategies/claudeflow
4. Update description to match package.json
5. Save file

**Acceptance Criteria:**
- [ ] Version updated to 1.2.0
- [ ] Name matches package.json
- [ ] Description updated
- [ ] File is valid JSON

---

### Task 1.5: Implement bin/claudeflow.js (CLI entry point)

**Description:** Create CLI entry point with command routing and update notifications
**Size:** Medium
**Priority:** Critical
**Dependencies:** Task 1.1 (package.json)
**Can run parallel with:** Task 1.6, 1.7 (other lib/ files)

**Technical Requirements:**
- Shebang: `#!/usr/bin/env node` (must be first line)
- ESM imports (use `import`, not `require`)
- Command routing for: setup, doctor, version, help
- Update notifications using update-notifier
- Non-blocking update check (daily interval)
- Executable permissions: chmod +x bin/claudeflow.js

**Complete implementation:**
```javascript
#!/usr/bin/env node

/**
 * claudeflow - Workflow orchestration for Claude Code
 *
 * CLI entry point with cross-platform compatibility
 */

import updateNotifier from 'update-notifier';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get package.json for version and update checking
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

// Check for updates (non-blocking)
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 }); // Check daily
if (notifier.update) {
  notifier.notify({
    message: `Update available: ${notifier.update.latest}\nRun: npm install -g @33strategies/claudeflow`
  });
}

// Parse command and arguments
const [,, command, ...args] = process.argv;

// Command routing
switch (command) {
  case 'setup':
    const { setup } = await import('../lib/setup.js');
    await setup(args);
    break;

  case 'doctor':
    const { doctor } = await import('../lib/doctor.js');
    await doctor();
    break;

  case 'version':
  case '--version':
  case '-v':
    console.log(`claudeflow v${pkg.version}`);
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    showHelp();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "claudeflow help" for usage information');
    process.exit(1);
}

function showHelp() {
  console.log(`
claudeflow v${pkg.version} - Workflow orchestration for Claude Code

USAGE:
  claudeflow <command> [options]

COMMANDS:
  setup              Interactive installer (prompts for global or project)
  setup --global     Install to ~/.claude/ (user-level)
  setup --project    Install to ./.claude/ (project-level)
  doctor             Verify installation and diagnose issues
  version            Show version information
  help               Show this help message

EXAMPLES:
  # Interactive setup (recommended for first-time users)
  claudeflow setup

  # Install globally to ~/.claude/
  claudeflow setup --global

  # Install to current project
  claudeflow setup --project

  # Check installation health
  claudeflow doctor

INSTALLATION METHODS:
  npm install -g @33strategies/claudeflow
  yarn global add @33strategies/claudeflow
  pnpm add -g @33strategies/claudeflow

DOCUMENTATION:
  https://github.com/kennyjpowers/claude-flow.git
  https://claudeflow.dev (coming soon)

REPORT ISSUES:
  https://github.com/kennyjpowers/claude-flow.git/issues
`);
}
```

**Implementation Steps:**
1. Create bin/ directory: `mkdir -p bin`
2. Create bin/claudeflow.js file
3. Add shebang as first line: `#!/usr/bin/env node`
4. Copy implementation code above
5. Make executable: `chmod +x bin/claudeflow.js`
6. Test command routing: `node bin/claudeflow.js help`
7. Verify update-notifier import works

**Acceptance Criteria:**
- [ ] bin/claudeflow.js exists with shebang
- [ ] File is executable (chmod +x)
- [ ] `claudeflow help` displays help message
- [ ] `claudeflow version` shows version
- [ ] `claudeflow unknown` shows error and help
- [ ] Update check runs without blocking
- [ ] ESM imports work correctly
- [ ] Command routes to setup/doctor functions (even if not implemented yet)

---

### Task 1.6: Implement lib/setup.js (installation logic)

**Description:** Port install.sh functionality to Node.js with cross-platform support
**Size:** Large
**Priority:** Critical
**Dependencies:** Task 1.1 (package.json), Task 1.5 (bin/claudeflow.js)

**Technical Requirements:**
- Installation modes: interactive, global (--global), project (--project)
- Target directories:
  - Global: `~/.claude/` (use os.homedir())
  - Project: `./.claude/` (use process.cwd())
- Prerequisites checks: Node.js >=20, npm, Claude Code CLI, ClaudeKit
- Directory creation with recursive option
- File copying with error handling (try/catch)
- Settings initialization from template
- ClaudeKit setup integration
- Cross-platform path handling (use path.join, no hardcoded slashes)

**Complete implementation:**
(See spec lines 372-645 for full code)

Key functions:
```javascript
export async function setup(args) {
  // Main entry point
  // 1. Determine mode (interactive/global/project)
  // 2. Prompt user if interactive
  // 3. Run prerequisite checks
  // 4. Verify ClaudeKit
  // 5. Create directories
  // 6. Copy files with error handling
  // 7. Initialize settings
  // 8. Run ClaudeKit setup
  // 9. Print success summary
}

async function promptInstallationMode() {
  // Use readline to ask user: global or project?
  // Return 'global' or 'project'
}

async function checkPrerequisites() {
  // Check Node.js >= 20
  // Check npm exists
  // Check Claude Code CLI exists
  // Exit with error if any fail
}

async function verifyClaudeKit() {
  // Check claudekit --version
  // Should be installed as dependency
}

function createDirectories(targetDir) {
  // Create: targetDir, commands/, commands/spec/
  // Use mkdirSync with recursive: true
}

function copyFiles(targetDir) {
  // Copy 8 command files
  // Copy README.md
  // Use try/catch for error handling
  // Exit on any copy failure
}

function initializeSettings(targetDir) {
  // Copy settings.json.example to settings.json if not exists
  // Preserve existing settings.json
}

async function runClaudeKitSetup(mode) {
  // Run: claudekit setup or claudekit setup --global
  // Non-fatal if fails (print warning)
}

function printSuccessSummary(mode, targetDir) {
  // Print installation complete message
  // Show next steps
}
```

**Files to copy (hardcoded list):**
```javascript
const commandFiles = [
  '.claude/commands/ideate.md',
  '.claude/commands/ideate-to-spec.md',
  '.claude/commands/spec/create.md',
  '.claude/commands/spec/decompose.md',
  '.claude/commands/spec/execute.md',
  '.claude/commands/spec/feedback.md',
  '.claude/commands/spec/doc-update.md',
  '.claude/commands/spec/migrate.md'
];
```

**Implementation Steps:**
1. Create lib/setup.js
2. Import required Node.js modules (fs, path, os, child_process, readline)
3. Implement all helper functions (checkPrerequisites, verifyClaudeKit, etc.)
4. Implement main setup() function with all 7 steps
5. Add error handling with try/catch for file operations
6. Test interactive mode
7. Test --global and --project flags
8. Verify on Windows, macOS, Linux paths

**Acceptance Criteria:**
- [ ] lib/setup.js exists with all functions
- [ ] Interactive mode prompts user for global/project choice
- [ ] --global flag installs to ~/.claude/
- [ ] --project flag installs to ./.claude/
- [ ] Node.js version check requires >=20
- [ ] npm, Claude CLI, ClaudeKit checks work
- [ ] All 8 command files copied successfully
- [ ] File copy errors caught and reported
- [ ] settings.json created from example if missing
- [ ] settings.json preserved if exists
- [ ] ClaudeKit setup runs after file copy
- [ ] Success summary shows installation details
- [ ] Works on Windows with path.join() usage

---

### Task 1.7: Implement lib/doctor.js (diagnostic command)

**Description:** Create diagnostic tool to verify installation health
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1 (package.json)
**Can run parallel with:** Task 1.6 (setup.js)

**Technical Requirements:**
- Check Node.js version (>=20)
- Check npm availability
- Check Claude Code CLI
- Check ClaudeKit installation
- Check global installation (~/.claude/)
- Check project installation (./.claude/)
- Count command files in each location
- Provide recommendations for issues found

**Complete implementation:**
(See spec lines 648-819 for full code)

Key checks:
```javascript
export async function doctor() {
  let issuesFound = 0;

  // 1. Check Node.js version
  const nodeVersion = process.version.slice(1).split('.')[0];
  const nodeOk = parseInt(nodeVersion) >= 20;
  if (!nodeOk) issuesFound++;

  // 2. Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  } catch (error) {
    issuesFound++;
  }

  // 3. Check Claude Code CLI
  try {
    const claudeVersion = execSync('claude --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    issuesFound++;
  }

  // 4. Check ClaudeKit
  try {
    const claudekitVersion = execSync('claudekit --version', { encoding: 'utf8' }).trim();
  } catch (error) {
    issuesFound++;
  }

  // 5. Check global installation
  const globalDir = join(homedir(), '.claude');
  const globalExists = existsSync(globalDir);

  // 6. Check project installation
  const projectDir = join(process.cwd(), '.claude');
  const projectExists = existsSync(projectDir);

  // 7. Count command files (6 required: ideate, ideate-to-spec, create, decompose, execute, feedback)
  const requiredCommands = [
    'ideate.md',
    'ideate-to-spec.md',
    'spec/create.md',
    'spec/decompose.md',
    'spec/execute.md',
    'spec/feedback.md'
  ];

  // 8. Print recommendations if issues found
  if (issuesFound === 0) {
    console.log('✓ All checks passed!');
  } else {
    console.log('Recommendations:');
    if (!nodeOk) console.log('  - Install Node.js 20+: https://nodejs.org');
    // ... more recommendations
  }
}
```

**Implementation Steps:**
1. Create lib/doctor.js
2. Import required modules (fs, path, os, child_process)
3. Implement version checks for Node.js, npm, Claude, ClaudeKit
4. Check file system for ~/.claude/ and ./.claude/
5. Count command files in each location
6. Track issues found (counter)
7. Print recommendations based on issues
8. Test on clean system (missing components)
9. Test on fully installed system

**Acceptance Criteria:**
- [ ] lib/doctor.js exists
- [ ] Node.js version check detects < 20
- [ ] npm check detects missing npm
- [ ] Claude CLI check works
- [ ] ClaudeKit check works
- [ ] Global installation detection works (~/.claude/)
- [ ] Project installation detection works (./.claude/)
- [ ] Command file counting accurate (6 required files)
- [ ] Recommendations printed for each issue
- [ ] Exit code 0 if all checks pass
- [ ] Helpful output with ✓ and ✗ symbols

---

### Task 1.8: Create directory structure (bin/, lib/)

**Description:** Create necessary directories for package structure
**Size:** Trivial
**Priority:** Critical
**Dependencies:** None
**Can run parallel with:** Task 1.1

**Technical Requirements:**
- Create bin/ for CLI entry point
- Create lib/ for implementation modules
- No subdirectories in lib/ for MVP (lib/utils/ deferred to Phase 2)

**Implementation Steps:**
1. Run: `mkdir -p bin`
2. Run: `mkdir -p lib`
3. Verify directories exist
4. Commit to git

**Acceptance Criteria:**
- [ ] bin/ directory exists
- [ ] lib/ directory exists
- [ ] Directories tracked in git

---

### Task 1.9: Create scripts/verify-files.js (prepublish check)

**Description:** Implement prepublishOnly hook to verify package contents
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.1 (package.json)

**Technical Requirements:**
- Verify all required files exist before npm publish
- Check: .claude/commands/*.md files (8 total)
- Check: templates/ directory
- Check: docs/ directory
- Check: README.md, CLAUDE.md, LICENSE
- Exit with code 1 if any missing

**Implementation:**
```javascript
#!/usr/bin/env node

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const requiredFiles = [
  '.claude/commands/ideate.md',
  '.claude/commands/ideate-to-spec.md',
  '.claude/commands/spec/create.md',
  '.claude/commands/spec/decompose.md',
  '.claude/commands/spec/execute.md',
  '.claude/commands/spec/feedback.md',
  '.claude/commands/spec/doc-update.md',
  '.claude/commands/spec/migrate.md',
  'templates/project-config/CLAUDE.md',
  'templates/user-config/CLAUDE.md',
  'docs/DESIGN_RATIONALE.md',
  'README.md',
  'CLAUDE.md',
  'LICENSE'
];

let missingFiles = [];

for (const file of requiredFiles) {
  const fullPath = join(projectRoot, file);
  if (!existsSync(fullPath)) {
    missingFiles.push(file);
    console.error(`✗ Missing: ${file}`);
  } else {
    console.log(`✓ Found: ${file}`);
  }
}

if (missingFiles.length > 0) {
  console.error(`\n❌ ${missingFiles.length} required files missing!`);
  console.error('Cannot publish package with missing files.');
  process.exit(1);
} else {
  console.log('\n✅ All required files present. Ready to publish!');
  process.exit(0);
}
```

**Implementation Steps:**
1. Create scripts/ directory: `mkdir -p scripts`
2. Create scripts/verify-files.js
3. Add shebang: `#!/usr/bin/env node`
4. Copy implementation above
5. Make executable: `chmod +x scripts/verify-files.js`
6. Test: `node scripts/verify-files.js`
7. Verify it catches missing files
8. Verify it passes with all files present

**Acceptance Criteria:**
- [ ] scripts/verify-files.js exists
- [ ] File is executable
- [ ] Checks all 8 command files
- [ ] Checks templates/ files
- [ ] Checks docs/ files
- [ ] Checks README.md, CLAUDE.md, LICENSE
- [ ] Exits with code 1 if files missing
- [ ] Exits with code 0 if all files present
- [ ] Prints helpful error messages

---

### Task 1.10: Update README.md installation section

**Description:** Replace bash installer instructions with npm installation
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1 (package.json), Task 1.5 (bin/claudeflow.js)

**Technical Requirements:**
- Remove install.sh references
- Add npm/yarn/pnpm installation examples
- Show all three package managers explicitly (as per user decision)
- Update Quick Start section
- Add troubleshooting section with `claudeflow doctor`
- Add migration guide for install.sh users

**New Installation Section:**
```markdown
## Installation

Install claudeflow globally via your preferred package manager:

### npm
\`\`\`bash
npm install -g @33strategies/claudeflow
\`\`\`

### yarn
\`\`\`bash
yarn global add @33strategies/claudeflow
\`\`\`

### pnpm
\`\`\`bash
pnpm add -g @33strategies/claudeflow
\`\`\`

### Setup

After installation, run the setup command:

\`\`\`bash
claudeflow setup
\`\`\`

Choose:
- **Global:** Install to ~/.claude/ (available in all projects)
- **Project:** Install to ./.claude/ (this project only)

## Quick Start

1. Install: `npm install -g @33strategies/claudeflow`
2. Setup: `claudeflow setup`
3. Open a project in Claude Code
4. Try: `/ideate <task-brief>`

## Troubleshooting

### Installation Issues

Run the diagnostic command:
\`\`\`bash
claudeflow doctor
\`\`\`

This checks:
- Node.js version (need 20+)
- npm availability
- Claude Code CLI installation
- ClaudeKit installation
- .claude/ directory structure
- Command files presence

### Common Issues

**"Command not found: claudeflow"**
- Ensure npm global bin is in PATH
- Try: `npm list -g @33strategies/claudeflow`

**"ClaudeKit not found"**
- ClaudeKit should install automatically as dependency
- Manual install: `npm install -g claudekit`

**"Commands not loading in Claude Code"**
- Run: `claudeflow doctor`
- Verify files exist in ~/.claude/commands/
- Restart Claude Code

## Migration from install.sh

If you previously used install.sh:

1. Remove old installation:
   \`\`\`bash
   # Global installation
   rm -rf ~/.claude

   # Project installation
   rm -rf .claude
   \`\`\`

2. Install via npm:
   \`\`\`bash
   npm install -g @33strategies/claudeflow
   \`\`\`

3. Run setup:
   \`\`\`bash
   # Global (if you used install.sh user)
   claudeflow setup --global

   # Project (if you used install.sh project)
   claudeflow setup --project
   \`\`\`

4. Verify:
   \`\`\`bash
   claudeflow doctor
   \`\`\`
```

**Implementation Steps:**
1. Read current README.md
2. Find "## Installation" section
3. Replace with new content above
4. Update "Quick Start" section
5. Add "Troubleshooting" section
6. Add "Migration from install.sh" section
7. Remove all references to `./install.sh`
8. Save file
9. Review for any other install.sh references

**Acceptance Criteria:**
- [ ] Installation section shows npm, yarn, pnpm
- [ ] All three package managers documented equally
- [ ] Quick Start updated to use `claudeflow` commands
- [ ] Troubleshooting section includes `claudeflow doctor`
- [ ] Migration guide provided for install.sh users
- [ ] No references to `./install.sh` remain
- [ ] Links to documentation updated

---

### Task 1.11: Update CHANGELOG.md for v1.2.0

**Description:** Document the npm packaging transformation in changelog
**Size:** Small
**Priority:** Medium
**Dependencies:** None
**Can run parallel with:** Task 1.10

**Technical Requirements:**
- Follow conventional changelog format
- Version: 1.2.0
- Date: 2025-11-21
- Sections: Added, Changed, Removed, Migration

**New changelog entry:**
```markdown
## [1.2.0] - 2025-11-21

### Added
- Published to npm registry as "@33strategies/claudeflow"
- Cross-platform CLI installer (replaces install.sh)
- Update notifications for new versions
- `claudeflow doctor` diagnostic command
- Automated version management via semantic-release
- CI/CD testing across npm, yarn, pnpm on Windows, macOS, Linux

### Changed
- Installation method: npm/yarn/pnpm instead of bash script
- Distribution: npm package instead of manual download
- Version management: Automated via semantic-release
- Node.js requirement: Now requires 20+ (aligned with ClaudeKit)

### Removed
- install.sh script (replaced by `claudeflow setup`)

### Migration
- See README.md for migration instructions from install.sh
- Uninstall old: `rm -rf ~/.claude` or `rm -rf .claude`
- Install new: `npm install -g @33strategies/claudeflow`
- Run setup: `claudeflow setup --global` or `claudeflow setup --project`
```

**Implementation Steps:**
1. Read CHANGELOG.md
2. Add new section at top for v1.2.0
3. Copy entry above
4. Maintain existing entries below
5. Update version links at bottom
6. Save file

**Acceptance Criteria:**
- [ ] v1.2.0 entry exists at top of CHANGELOG.md
- [ ] Date is 2025-11-21
- [ ] Added section lists new features
- [ ] Changed section documents installation changes
- [ ] Removed section mentions install.sh removal
- [ ] Migration section guides users
- [ ] Format follows conventional changelog

---

### Task 1.12: Create .github/workflows/release.yml

**Description:** Set up GitHub Actions CI/CD for automated releases
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1 (package.json), Task 1.13 (.releaserc.json)

**Technical Requirements:**
- Trigger on push to main branch
- Test matrix: 3 OS × 2 Node versions = 6 combinations
  - OS: ubuntu-latest, macos-latest, windows-latest
  - Node: 20, 22
- Run tests (when available)
- semantic-release for automated versioning
- npm publish with provenance
- NPM_TOKEN required in secrets

**Complete workflow:**
```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  test:
    name: Test on ${{ matrix.os }} with Node ${{ matrix.node }}
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [20, 22]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Verify files
        run: node scripts/verify-files.js

  release:
    name: Release to npm
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

**Implementation Steps:**
1. Create .github/workflows/ directory: `mkdir -p .github/workflows`
2. Create release.yml file
3. Copy workflow above
4. Configure NPM_TOKEN in GitHub Secrets:
   - Go to repository Settings → Secrets → Actions
   - Add NPM_TOKEN with value from npmjs.com
5. Test workflow on feature branch first
6. Merge to main to trigger release

**Acceptance Criteria:**
- [ ] .github/workflows/release.yml exists
- [ ] Workflow triggers on push to main
- [ ] Test matrix includes 3 OS × 2 Node = 6 jobs
- [ ] Tests run before release
- [ ] semantic-release configured
- [ ] NPM_TOKEN secret set in GitHub
- [ ] Workflow runs successfully on test branch
- [ ] Release job only runs on main branch

---

### Task 1.13: Create .releaserc.json (semantic-release config)

**Description:** Configure semantic-release for automated version management
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.1 (package.json)
**Can run parallel with:** Task 1.12

**Technical Requirements:**
- Analyze commit messages (conventional commits)
- Generate CHANGELOG.md
- Update package.json version
- Create git tags
- Create GitHub releases
- Publish to npm with provenance

**Complete configuration:**
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        "npmPublish": true,
        "pkgRoot": ".",
        "tarballDir": "dist"
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

**Commit message conventions:**
- `fix:` → patch release (1.2.0 → 1.2.1)
- `feat:` → minor release (1.2.0 → 1.3.0)
- `BREAKING CHANGE:` → major release (1.2.0 → 2.0.0)

**Implementation Steps:**
1. Create .releaserc.json in project root
2. Copy configuration above
3. Install semantic-release plugins:
   ```bash
   npm install --save-dev @semantic-release/changelog @semantic-release/git semantic-release
   ```
4. Verify configuration is valid JSON
5. Test locally: `npx semantic-release --dry-run`

**Acceptance Criteria:**
- [ ] .releaserc.json exists
- [ ] Branches configured to ["main"]
- [ ] All 6 plugins configured
- [ ] CHANGELOG.md generation enabled
- [ ] Git assets include package.json and CHANGELOG.md
- [ ] npm publish enabled
- [ ] GitHub releases enabled
- [ ] Dry-run succeeds

---

### Task 1.14: Remove install.sh

**Description:** Delete bash installer (clean break to npm)
**Size:** Trivial
**Priority:** Medium
**Dependencies:** Task 1.6 (lib/setup.js implemented and tested)

**Technical Requirements:**
- Remove install.sh file
- Ensure lib/setup.js has feature parity
- Document removal in CHANGELOG.md (already done in Task 1.11)
- Commit deletion with message: "chore: remove install.sh (replaced by npm package)"

**Implementation Steps:**
1. Verify lib/setup.js works on all platforms
2. Test `claudeflow setup` succeeds
3. Delete install.sh: `git rm install.sh`
4. Commit: `git commit -m "chore: remove install.sh (replaced by npm package)"`

**Acceptance Criteria:**
- [ ] install.sh deleted from repository
- [ ] lib/setup.js tested and working
- [ ] CHANGELOG.md documents removal
- [ ] No references to install.sh in README.md
- [ ] Commit message follows conventional format

---

### Task 1.15: Test package locally with npm pack

**Description:** Verify package contents and local installation
**Size:** Small
**Priority:** High
**Dependencies:** All Phase 1 implementation tasks (1.1-1.14)

**Technical Requirements:**
- Run `npm pack` to create tarball
- Inspect tarball contents
- Install globally from tarball
- Test all CLI commands
- Verify file size < 500KB

**Implementation Steps:**
1. Run: `npm pack`
2. List contents: `tar -tzf 33strategies-claudeflow-1.2.0.tgz | head -20`
3. Verify includes:
   - package/bin/claudeflow.js
   - package/lib/setup.js
   - package/lib/doctor.js
   - package/.claude/commands/ (8 files)
   - package/templates/
   - package/docs/
   - package/README.md
   - package/CLAUDE.md
   - package/LICENSE
4. Verify excludes:
   - specs/
   - .simple-task-master/
   - test/
5. Check size: `ls -lh 33strategies-claudeflow-1.2.0.tgz`
6. Install globally: `npm install -g ./33strategies-claudeflow-1.2.0.tgz`
7. Test commands:
   ```bash
   claudeflow --version
   claudeflow help
   claudeflow doctor
   claudeflow setup --global
   ```
8. Verify installation created files in ~/.claude/
9. Uninstall: `npm uninstall -g @33strategies/claudeflow`

**Acceptance Criteria:**
- [ ] `npm pack` succeeds
- [ ] Tarball size < 500KB
- [ ] All required files included
- [ ] specs/ directory excluded
- [ ] Global install from tarball succeeds
- [ ] `claudeflow --version` works
- [ ] `claudeflow help` shows help
- [ ] `claudeflow doctor` runs diagnostics
- [ ] `claudeflow setup --global` creates ~/.claude/
- [ ] All 8 command files copied
- [ ] Uninstall cleans up properly

---

### Task 1.16: Publish to npm with provenance

**Description:** Publish package to npm registry with provenance
**Size:** Small
**Priority:** Critical
**Dependencies:** Task 1.15 (local testing), Task 1.12 (CI/CD), Task 1.13 (semantic-release)

**Technical Requirements:**
- Publish to @33strategies organization
- Enable provenance (links to source repo)
- Use `--access public` (scoped packages are private by default)
- Verify publication on npmjs.com

**Pre-flight checks:**
1. Verify NPM_TOKEN is set in GitHub Secrets
2. Verify you're logged in to npm: `npm whoami`
3. Verify you're a member of @33strategies org
4. Run `npm pack` and test tarball locally (Task 1.15)
5. Ensure all tests pass in CI/CD

**Manual publish (if not using semantic-release):**
```bash
# Login to npm
npm login

# Publish with provenance
npm publish --access public --provenance
```

**Automated publish (via semantic-release):**
1. Push to main branch
2. Semantic-release detects commit type (feat/fix)
3. Bumps version automatically
4. Generates CHANGELOG.md
5. Creates git tag
6. Publishes to npm with provenance
7. Creates GitHub release

**Implementation Steps:**
1. Ensure all previous tasks complete
2. Merge feature branch to main
3. Push to GitHub
4. Monitor GitHub Actions workflow
5. Wait for semantic-release to publish
6. Verify package on npmjs.com: https://www.npmjs.com/package/@33strategies/claudeflow
7. Check provenance badge appears
8. Test installation: `npm install -g @33strategies/claudeflow`

**Acceptance Criteria:**
- [ ] Package published to npm
- [ ] Version is 1.2.0 (or higher if using semantic-release)
- [ ] Package scope is @33strategies
- [ ] Access is public
- [ ] Provenance enabled and visible
- [ ] Installation works: `npm install -g @33strategies/claudeflow`
- [ ] npmjs.com page shows package
- [ ] README.md renders correctly on npm
- [ ] All files included correctly

---

### Task 1.17: Verify installation from npm registry

**Description:** Test end-to-end installation from published package
**Size:** Small
**Priority:** Critical
**Dependencies:** Task 1.16 (npm publish)

**Technical Requirements:**
- Test on fresh system (no existing installation)
- Test all three package managers: npm, yarn, pnpm
- Test on all three OS: Windows, macOS, Linux (use CI/CD or VMs)
- Verify claudeflow command available
- Verify all features work

**Test scenarios:**

**npm installation:**
```bash
# Uninstall any existing version
npm uninstall -g @33strategies/claudeflow

# Install from npm registry
npm install -g @33strategies/claudeflow

# Verify
claudeflow --version
claudeflow help
claudeflow doctor
```

**yarn installation:**
```bash
# Uninstall
yarn global remove @33strategies/claudeflow

# Install
yarn global add @33strategies/claudeflow

# Verify
claudeflow --version
```

**pnpm installation:**
```bash
# Uninstall
pnpm remove -g @33strategies/claudeflow

# Install
pnpm add -g @33strategies/claudeflow

# Verify
claudeflow --version
```

**Implementation Steps:**
1. Test npm installation on local machine
2. Test yarn installation on local machine
3. Test pnpm installation on local machine
4. Use CI/CD matrix to test on Windows, macOS, Linux
5. Verify `claudeflow --version` shows correct version
6. Run `claudeflow setup --global`
7. Verify ~/.claude/ created with all files
8. Run `claudeflow doctor` and ensure all checks pass

**Acceptance Criteria:**
- [ ] npm installation succeeds on all 3 OS
- [ ] yarn installation succeeds on all 3 OS
- [ ] pnpm installation succeeds on all 3 OS
- [ ] `claudeflow` command available after install
- [ ] `claudeflow --version` shows 1.2.0+
- [ ] `claudeflow setup` creates files correctly
- [ ] All 8 command files present
- [ ] ClaudeKit installed as dependency
- [ ] `claudeflow doctor` passes all checks

---

### Task 1.18: Notify ClaudeKit maintainer

**Description:** Inform ClaudeKit maintainer about package launch
**Size:** Trivial
**Priority:** Low
**Dependencies:** Task 1.16 (npm publish)

**Technical Requirements:**
- Create GitHub issue or send email
- Introduce claudeflow package
- Mention tight integration with ClaudeKit
- Request potential cross-promotion
- Ensure compatibility noted

**Message template:**
```
Subject: New package published: @33strategies/claudeflow (builds on ClaudeKit)

Hi [ClaudeKit maintainer],

I wanted to let you know about a new package I've published that builds on top of ClaudeKit:

📦 @33strategies/claudeflow
https://www.npmjs.com/package/@33strategies/claudeflow

**What it is:**
- Workflow orchestration for Claude Code
- Provides end-to-end feature development lifecycle
- Uses ClaudeKit as a dependency for 30+ agents and 20+ commands
- Pure Installer CLI architecture

**Integration with ClaudeKit:**
- Declares claudekit as a dependency (^1.0.0)
- Automatically installs ClaudeKit when users install claudeflow
- Calls `claudekit setup` during installation
- Uses ClaudeKit agents in custom workflow commands

**Benefits:**
- Shows another use case for ClaudeKit
- Could potentially drive ClaudeKit adoption
- Demonstrates ecosystem growth around Claude Code

**Cross-promotion opportunity:**
- Would you be open to mentioning claudeflow in ClaudeKit docs?
- I'm happy to add ClaudeKit acknowledgment in claudeflow README
- Could collaborate on integration examples

Let me know if you have any questions or feedback!

Best,
Kenneth
```

**Implementation Steps:**
1. Find ClaudeKit maintainer contact info
2. Create GitHub issue on ClaudeKit repo, OR
3. Send email using contact from ClaudeKit docs
4. Include package link and description
5. Request feedback and potential cross-promotion
6. Follow up if no response in 1 week

**Acceptance Criteria:**
- [ ] Message sent to ClaudeKit maintainer
- [ ] Package introduction clear
- [ ] Integration details explained
- [ ] Cross-promotion requested
- [ ] Contact info saved for follow-up

---

## Phase 2: Enhanced Features & Polish

**Goal:** Improve user experience and add advanced features

**Note:** Phase 2 tasks are deferred for now. Focus on Phase 1 (MVP) completion first.

### Task 2.1: Achieve 80%+ test coverage

**Description:** Write comprehensive unit and integration tests
**Size:** Large
**Priority:** Medium (deferred to Phase 2)
**Dependencies:** All Phase 1 tasks

**Brief overview:**
- Unit tests for bin/claudeflow.js (command routing)
- Unit tests for lib/setup.js (all functions)
- Unit tests for lib/doctor.js (all checks)
- Integration tests for end-to-end installation flows
- Mock external dependencies (update-notifier, child_process)
- Use temporary directories for file operation tests

---

### Task 2.2: Add performance benchmarks

**Description:** Measure and optimize installation performance
**Size:** Medium
**Priority:** Low (deferred to Phase 2)
**Dependencies:** Task 2.1 (tests)

**Brief overview:**
- Benchmark `claudeflow setup` execution time
- Target: < 2 seconds for file operations
- Compare against install.sh performance
- Identify bottlenecks (if any)
- Document performance in README

---

### Task 2.3: Create video walkthrough

**Description:** Record demo video showing installation and usage
**Size:** Small
**Priority:** Low (deferred to Phase 2)
**Dependencies:** Task 1.16 (npm publish)

**Brief overview:**
- Record 3-5 minute demo video
- Show: install → setup → verify → use
- Upload to YouTube
- Embed in README.md
- Add to package homepage

---

### Task 2.4: Submit to awesome-claude-code list

**Description:** Add claudeflow to awesome-claude-code repository
**Size:** Trivial
**Priority:** Medium (deferred to Phase 2)
**Dependencies:** Task 1.16 (npm publish)

**Brief overview:**
- Fork awesome-claude-code repo
- Add claudeflow to list with description
- Create pull request
- Follow up if not merged in 1 week

---

### Task 2.5: Create GitHub issue templates

**Description:** Add issue templates for bugs, features, and questions
**Size:** Small
**Priority:** Low (deferred to Phase 2)
**Dependencies:** Task 1.16 (npm publish)

**Brief overview:**
- Create .github/ISSUE_TEMPLATE/ directory
- Add bug_report.md template
- Add feature_request.md template
- Add question.md template
- Configure issue labels

---

## Phase 3: Ecosystem Growth

**Goal:** Drive adoption and build community

**Note:** Phase 3 tasks are long-term goals. Focus on Phase 1 and 2 first.

### Task 3.1: Create documentation website (claudeflow.dev)

**Description:** Build documentation site on purchased domain
**Size:** Large
**Priority:** Low (deferred to Phase 3)
**Dependencies:** Task 1.16 (npm publish)

**Brief overview:**
- Choose static site generator (VitePress, Docusaurus, etc.)
- Design documentation structure
- Create getting started guide
- Add API documentation
- Deploy to claudeflow.dev

---

### Task 3.2: Write launch blog post

**Description:** Announce package on DEV.to and Medium
**Size:** Medium
**Priority:** Low (deferred to Phase 3)
**Dependencies:** Task 3.1 (website)

**Brief overview:**
- Write comprehensive blog post
- Explain problem and solution
- Show installation and usage
- Include code examples
- Publish on DEV.to and Medium

---

## Execution Strategy

### Critical Path (Must complete in order)
1. Task 1.1 → 1.5 → 1.6 → 1.7 → 1.15 → 1.16 → 1.17

### Parallel Execution Opportunities
- **Group A (Package Config):** Tasks 1.1, 1.2, 1.3, 1.8
- **Group B (CLI Implementation):** Tasks 1.5, 1.6, 1.7 (after Group A)
- **Group C (Documentation):** Tasks 1.10, 1.11 (after Group A)
- **Group D (CI/CD):** Tasks 1.12, 1.13 (after Group A)
- **Group E (Finalization):** Tasks 1.14, 1.15, 1.16, 1.17 (after all above)

### Recommended Order
1. Start with Group A (foundation)
2. Implement Group B (core functionality)
3. Parallel: Groups C and D (docs and CI/CD)
4. Task 1.9 (verify-files script)
5. Task 1.14 (remove install.sh)
6. Group E (testing and publishing)
7. Task 1.18 (notify ClaudeKit)

### Estimated Timeline
- **Phase 1 (MVP):** 18 tasks, ~3-5 days for one developer
- **Phase 2 (Polish):** 5 tasks, ~1-2 weeks
- **Phase 3 (Growth):** 2 tasks, ~2-4 weeks (ongoing)

---

## Risk Assessment

### High Risk
- **Multi-PM compatibility:** Testing across npm/yarn/pnpm required
- **Cross-platform paths:** Windows path handling must be correct
- **ClaudeKit integration:** Must verify automatic installation works

### Medium Risk
- **npm provenance:** First-time setup may have issues
- **semantic-release:** Configuration must be correct for automation

### Low Risk
- **File copying:** Straightforward with proper error handling
- **Documentation:** Well-specified, minimal risk

---

## Success Metrics

**Phase 1 MVP Complete When:**
- ✅ All 18 Phase 1 tasks marked DONE
- ✅ Package published to npm registry
- ✅ Installation works on Windows, macOS, Linux
- ✅ All CLI commands functional
- ✅ CI/CD passing
- ✅ Documentation updated

**Phase 2 Complete When:**
- ✅ Test coverage ≥80%
- ✅ Performance benchmarks documented
- ✅ Community engagement channels active
- ✅ Listed in awesome-claude-code

**Phase 3 Complete When:**
- ✅ Website live at claudeflow.dev
- ✅ Blog post published and promoted
- ✅ 100+ GitHub stars achieved
- ✅ 1K npm downloads/week

---

## Notes

- **Content Preservation:** All implementation details from spec are preserved in tasks
- **STM Integration:** Use tags `feature:package-publishing-strategy,phase1,<priority>,<size>`
- **Testing Philosophy:** "When tests fail, fix the code, not the test"
- **Cross-Platform:** Always use path.join(), os.homedir(), never hardcode slashes
- **Error Handling:** All file operations wrapped in try/catch
- **Node.js Version:** Requires >=20.0.0 (aligned with ClaudeKit)

---

**End of Task Breakdown**
