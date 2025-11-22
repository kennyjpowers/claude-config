# Transform claude-config into npm Package "claudeflow"

**Status:** ✅ Implemented
**Authors:** Claude Code
**Date:** 2025-11-21
**Implemented:** 2025-11-22
**Version:** 1.2.0
**Related Documents:** specs/package-publishing-strategy/01-ideation.md

---

## Overview

Transform the claude-config repository into a professionally published npm package named "claudeflow" that provides cross-platform installation via standard package managers (npm, yarn, pnpm). Replace the current 262-line bash-based install.sh with a Node.js Pure Installer CLI that maintains all existing functionality while enabling modern package distribution patterns.

This transformation enables:
- Standard npm/yarn/pnpm installation workflows
- Automatic multi-package-manager support (single publish → works everywhere)
- Cross-platform compatibility (Windows, macOS, Linux)
- Automated version management via semantic-release
- Update notifications for users
- Professional package distribution following ClaudeKit's proven pattern

---

## Background/Problem Statement

### Current State

claude-config is currently distributed via a bash script (install.sh) that:
- Requires manual download and execution
- Is not cross-platform (bash doesn't run natively on Windows)
- Has no update mechanism (users must manually check for updates)
- Lacks version management automation
- Requires users to find and download the repository manually

### Problem

This distribution method creates barriers to adoption:
1. **Discovery:** Users must find the GitHub repository before they can use it
2. **Installation:** Bash scripts are unfamiliar to many developers and incompatible with Windows
3. **Updates:** No mechanism to notify users of new versions or features
4. **Trust:** Manual script execution is less trusted than verified npm packages
5. **Integration:** Cannot be declared as a dependency in package.json

### Opportunity

Publishing to npm as "claudeflow" enables:
- **Discoverability:** Listed in npm registry, searchable by developers
- **Ease of use:** Single command installation (`npm install -g claudeflow`)
- **Multi-PM support:** Automatically works with npm, yarn, and pnpm (zero additional config)
- **Updates:** Built-in update mechanisms and notifications
- **Trust:** npm package provenance and verification
- **Integration:** Can be added to project dependencies

### Research Validation

Comprehensive research (see 01-ideation.md) validated:
- ClaudeKit successfully uses this exact pattern (npm-only distribution)
- Publishing to npm registry automatically supports npm/yarn/pnpm (single publish)
- Python/pip distribution is unnecessary (wrong audience, massive complexity)
- "claudeflow" name scored 20/20 for ecosystem fit and memorability
- Pure Installer architecture is simplest and most maintainable

---

## Goals

- ✅ Publish claude-config to npm registry as "claudeflow" package
- ✅ Replace install.sh with cross-platform Node.js CLI
- ✅ Maintain 100% feature parity with current bash installation
- ✅ Support npm, yarn, and pnpm installation methods equally
- ✅ Implement automated version management via semantic-release
- ✅ Add update notifications to inform users of new versions
- ✅ Achieve cross-platform compatibility (Windows, macOS, Linux)
- ✅ Set up CI/CD testing across all package managers and platforms
- ✅ Maintain existing .claude/ command structure and behavior
- ✅ Integrate seamlessly with ClaudeKit as a dependency
- ✅ Provide diagnostic command (`claudeflow doctor`) for troubleshooting
- ✅ Enable npm package provenance for security and trust

---

## Non-Goals

- ❌ Wrapper commands that invoke Claude Code directly (Pure Installer only)
- ❌ Python/pip distribution (unnecessary for Node.js developer audience)
- ❌ Website creation (domain purchased at claudeflow.dev, defer site to later)
- ❌ Automatic migration command for install.sh users (manual uninstall/reinstall acceptable)
- ❌ Support for package managers other than npm/yarn/pnpm
- ❌ Maintaining install.sh (clean break, remove completely)
- ❌ Rewriting command markdown syntax or behavior
- ❌ Changing three-layer architecture (Claude Code → ClaudeKit → claudeflow)
- ❌ Removing ClaudeKit dependency
- ❌ Breaking changes to existing .claude/ directory structure

---

## Technical Dependencies

### Required Runtime Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Node.js | >=20.0.0 | Runtime environment (ClaudeKit requires 20+) |
| npm | >=9.0.0 | Package manager (bundled with Node.js 20+) |
| claudekit | latest | Provides 30+ agents, 20+ commands, 25+ hooks |

### Development Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @semantic-release/changelog | latest | Generate CHANGELOG.md automatically |
| @semantic-release/git | latest | Commit release assets |
| semantic-release | latest | Automated version management and publishing |
| update-notifier | latest | Notify users of package updates |

### Optional User Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| simple-task-master | latest | Task tracking integration (optional) |
| Claude Code CLI | latest | Required runtime environment for commands |

### External Services

- **npm Registry:** Package hosting and distribution
- **GitHub Actions:** CI/CD automation
- **GitHub Releases:** Release notes and assets

---

## Detailed Design

### Architecture Overview

**Current (Bash-based):**
```
User → Downloads repo → Runs install.sh → Copies files to ~/.claude/ or ./.claude/
                                        → Installs ClaudeKit
                                        → Runs claudekit setup
```

**Proposed (npm-based):**
```
User → npm install -g claudeflow → npm installs package
                                  → npm installs claudekit dependency
                                  → User runs: claudeflow setup
                                  → Copies files to ~/.claude/ or ./.claude/
                                  → Runs claudekit setup
```

### Package Structure

```
claudeflow/
├── package.json              # npm package metadata
├── bin/
│   └── claudeflow.js         # CLI entry point (replaces install.sh)
├── lib/
│   ├── setup.js              # Setup command logic
│   ├── doctor.js             # Diagnostic command
│   ├── version.js            # Version display
│   └── utils/
│       ├── file-copy.js      # Cross-platform file operations
│       ├── validation.js     # Prerequisite checks
│       └── claudekit.js      # ClaudeKit integration
├── .claude/                  # Custom commands (distributed as-is)
│   ├── commands/
│   │   ├── ideate.md
│   │   ├── ideate-to-spec.md
│   │   └── spec/
│   │       ├── create.md
│   │       ├── decompose.md
│   │       ├── execute.md
│   │       ├── feedback.md
│   │       ├── doc-update.md
│   │       └── migrate.md
│   ├── settings.json.example
│   └── README.md
├── templates/                # Configuration templates
│   ├── project-config/
│   │   ├── CLAUDE.md
│   │   ├── settings.json
│   │   └── .gitignore.example
│   └── user-config/
│       ├── CLAUDE.md
│       └── settings.json
├── docs/                     # Documentation
├── README.md                 # Package documentation
├── CLAUDE.md                 # AI assistant instructions
├── CHANGELOG.md              # Version history (auto-generated)
├── LICENSE                   # MIT License
├── .npmignore                # Files to exclude from package
├── .github/
│   └── workflows/
│       └── release.yml       # CI/CD automation
└── .releaserc.json           # semantic-release configuration
```

### package.json Configuration

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
  }
}
```

### CLI Commands Implementation

#### 1. bin/claudeflow.js (Entry Point)

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
    message: `Update available: ${notifier.update.latest}\nRun: npm install -g claudeflow`
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
  npm install -g claudeflow
  yarn global add claudeflow
  pnpm add -g claudeflow

DOCUMENTATION:
  https://github.com/kennyjpowers/claude-flow.git
  https://claudeflow.dev (coming soon)

REPORT ISSUES:
  https://github.com/kennyjpowers/claude-flow.git/issues
`);
}
```

#### 2. lib/setup.js (Core Installation Logic)

```javascript
/**
 * Setup command - Replaces install.sh functionality
 *
 * Handles installation to either:
 * - Global: ~/.claude/ (user-level configuration)
 * - Project: ./.claude/ (project-specific configuration)
 */

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');

// ANSI colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function printSuccess(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function printError(msg) {
  console.error(`${colors.red}✗${colors.reset} ${msg}`);
}

function printInfo(msg) {
  console.log(`${colors.yellow}ℹ${colors.reset} ${msg}`);
}

export async function setup(args) {
  console.log('================================================');
  console.log('claudeflow Setup');
  console.log('================================================\n');

  // Determine installation mode
  let mode = 'interactive';
  if (args.includes('--global') || args.includes('-g')) {
    mode = 'global';
  } else if (args.includes('--project') || args.includes('-p')) {
    mode = 'project';
  }

  // Interactive mode: ask user
  if (mode === 'interactive') {
    mode = await promptInstallationMode();
  }

  const targetDir = mode === 'global'
    ? join(homedir(), '.claude')
    : join(process.cwd(), '.claude');

  console.log('');
  printInfo(`Installation mode: ${mode}`);
  printInfo(`Target directory: ${targetDir}`);
  console.log('');

  // Step 1: Prerequisites check
  await checkPrerequisites();

  // Step 2: Verify ClaudeKit installation
  await verifyClaudeKit();

  // Step 3: Create directories
  createDirectories(targetDir);

  // Step 4: Copy files
  copyFiles(targetDir);

  // Step 5: Initialize settings if needed
  initializeSettings(targetDir);

  // Step 6: Run ClaudeKit setup
  await runClaudeKitSetup(mode);

  // Step 7: Success summary
  printSuccessSummary(mode, targetDir);
}

async function promptInstallationMode() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('Select installation mode:');
    console.log('  1) Global  - Install to ~/.claude/ (available in all projects)');
    console.log('  2) Project - Install to ./.claude/ (this project only)');
    console.log('');

    rl.question('Enter choice [1/2]: ', (answer) => {
      rl.close();
      resolve(answer === '2' ? 'project' : 'global');
    });
  });
}

async function checkPrerequisites() {
  printInfo('Checking prerequisites...');

  // Check Node.js version
  const nodeVersion = process.version.slice(1).split('.')[0];
  if (parseInt(nodeVersion) < 20) {
    printError(`Node.js 20+ required (found: ${process.version})`);
    process.exit(1);
  }
  printSuccess(`Node.js ${process.version} found`);

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    printSuccess(`npm ${npmVersion} found`);
  } catch (error) {
    printError('npm not found');
    process.exit(1);
  }

  // Check Claude Code CLI
  try {
    execSync('claude --version', { stdio: 'ignore' });
    printSuccess('Claude Code CLI found');
  } catch (error) {
    printError('Claude Code CLI not found');
    printInfo('Install from: https://code.claude.com');
    process.exit(1);
  }

  console.log('');
}

async function verifyClaudeKit() {
  printInfo('Verifying ClaudeKit installation...');

  try {
    const version = execSync('claudekit --version', { encoding: 'utf8' }).trim();
    printSuccess(`ClaudeKit ${version} found`);
  } catch (error) {
    printError('ClaudeKit not found (should be installed as dependency)');
    printInfo('This is unusual - ClaudeKit should be installed automatically');
    printInfo('Try: npm install -g claudekit');
    process.exit(1);
  }

  console.log('');
}

function createDirectories(targetDir) {
  printInfo('Creating directories...');

  const dirs = [
    targetDir,
    join(targetDir, 'commands'),
    join(targetDir, 'commands', 'spec')
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      printSuccess(`Created ${dir}`);
    } else {
      printInfo(`Directory exists: ${dir}`);
    }
  }

  console.log('');
}

function copyFiles(targetDir) {
  printInfo('Copying files...');

  // Copy command files
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

  for (const file of commandFiles) {
    const src = join(PACKAGE_ROOT, file);
    const dest = join(targetDir, file.replace('.claude/', ''));

    // Create parent directory if needed
    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    try {
      copyFileSync(src, dest);
      printSuccess(`Copied ${file.replace('.claude/', '')}`);
    } catch (error) {
      printError(`Failed to copy ${file}: ${error.message}`);
      process.exit(1);
    }
  }

  // Copy README
  const readmeSrc = join(PACKAGE_ROOT, '.claude/README.md');
  const readmeDest = join(targetDir, 'README.md');
  try {
    copyFileSync(readmeSrc, readmeDest);
    printSuccess('Copied README.md');
  } catch (error) {
    printError(`Failed to copy README.md: ${error.message}`);
    process.exit(1);
  }

  console.log('');
}

function initializeSettings(targetDir) {
  const settingsPath = join(targetDir, 'settings.json');
  const examplePath = join(PACKAGE_ROOT, '.claude/settings.json.example');

  if (!existsSync(settingsPath)) {
    printInfo('Initializing settings.json...');
    copyFileSync(examplePath, settingsPath);
    printSuccess('Created settings.json from template');
  } else {
    printInfo('settings.json already exists (keeping existing)');
  }

  console.log('');
}

async function runClaudeKitSetup(mode) {
  printInfo('Running ClaudeKit setup...');

  try {
    const setupCommand = mode === 'global' ? 'claudekit setup --global' : 'claudekit setup';
    execSync(setupCommand, { stdio: 'inherit' });
    printSuccess('ClaudeKit setup complete');
  } catch (error) {
    printError('ClaudeKit setup failed (non-fatal)');
    printInfo('You may need to run "claudekit setup" manually');
  }

  console.log('');
}

function printSuccessSummary(mode, targetDir) {
  console.log('================================================');
  console.log('Installation Complete!');
  console.log('================================================\n');

  console.log('What was installed:');
  console.log(`  ✓ 8 custom workflow commands in ${targetDir}/commands/`);
  console.log(`  ✓ Configuration templates`);
  console.log(`  ✓ ClaudeKit integration\n`);

  console.log('Next steps:');
  if (mode === 'global') {
    console.log('  1. Custom commands are now available in all Claude Code sessions');
    console.log('  2. Try: /ideate <task-brief>');
  } else {
    console.log('  1. Open this project in Claude Code');
    console.log('  2. Custom commands will be available in this project');
    console.log('  3. Try: /ideate <task-brief>');
  }
  console.log('  4. Read documentation: ' + targetDir + '/README.md');
  console.log('  5. Explore commands: ls ' + targetDir + '/commands/\n');

  console.log('Documentation:');
  console.log('  GitHub: https://github.com/kennyjpowers/claude-flow.git');
  console.log('  Website: https://claudeflow.dev (coming soon)\n');
}
```

#### 3. lib/doctor.js (Diagnostic Command)

```javascript
/**
 * Doctor command - Diagnose installation issues
 *
 * Checks:
 * - Node.js version
 * - npm availability
 * - Claude Code CLI
 * - ClaudeKit installation
 * - .claude/ directory structure
 * - Command files presence
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function printCheck(name, status, details = '') {
  const symbol = status ? '✓' : '✗';
  const color = status ? colors.green : colors.red;
  console.log(`${color}${symbol}${colors.reset} ${name}${details ? ' - ' + details : ''}`);
}

export async function doctor() {
  console.log('claudeflow Doctor - Installation Diagnostics\n');
  console.log('================================================\n');

  let issuesFound = 0;

  // Check Node.js
  const nodeVersion = process.version.slice(1).split('.')[0];
  const nodeOk = parseInt(nodeVersion) >= 20;
  printCheck('Node.js version', nodeOk, nodeOk ? process.version : `${process.version} (need 20+)`);
  if (!nodeOk) issuesFound++;

  // Check npm
  let npmOk = false;
  let npmVersion = 'not found';
  try {
    npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    npmOk = true;
  } catch (error) {
    issuesFound++;
  }
  printCheck('npm', npmOk, npmVersion);

  // Check Claude Code CLI
  let claudeOk = false;
  let claudeVersion = 'not found';
  try {
    claudeVersion = execSync('claude --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    claudeOk = true;
  } catch (error) {
    issuesFound++;
  }
  printCheck('Claude Code CLI', claudeOk, claudeVersion);

  // Check ClaudeKit
  let claudekitOk = false;
  let claudekitVersion = 'not found';
  try {
    claudekitVersion = execSync('claudekit --version', { encoding: 'utf8' }).trim();
    claudekitOk = true;
  } catch (error) {
    issuesFound++;
  }
  printCheck('ClaudeKit', claudekitOk, claudekitVersion);

  console.log('');
  console.log('Installation Locations:\n');

  // Check global installation
  const globalDir = join(homedir(), '.claude');
  const globalExists = existsSync(globalDir);
  printCheck('Global (~/.claude/)', globalExists);

  if (globalExists) {
    const globalCommands = join(globalDir, 'commands');
    const globalCommandsExist = existsSync(globalCommands);
    printCheck('  Commands directory', globalCommandsExist);

    if (globalCommandsExist) {
      const requiredCommands = [
        'ideate.md',
        'ideate-to-spec.md',
        'spec/create.md',
        'spec/decompose.md',
        'spec/execute.md',
        'spec/feedback.md'
      ];

      let commandsOk = 0;
      for (const cmd of requiredCommands) {
        if (existsSync(join(globalCommands, cmd))) {
          commandsOk++;
        }
      }
      printCheck('  Command files', commandsOk === requiredCommands.length,
        `${commandsOk}/${requiredCommands.length} found`);
      if (commandsOk < requiredCommands.length) issuesFound++;
    } else {
      issuesFound++;
    }
  }

  // Check project installation
  const projectDir = join(process.cwd(), '.claude');
  const projectExists = existsSync(projectDir);
  printCheck('Project (./.claude/)', projectExists);

  if (projectExists) {
    const projectCommands = join(projectDir, 'commands');
    const projectCommandsExist = existsSync(projectCommands);
    printCheck('  Commands directory', projectCommandsExist);

    if (projectCommandsExist) {
      const requiredCommands = [
        'ideate.md',
        'ideate-to-spec.md',
        'spec/create.md',
        'spec/decompose.md',
        'spec/execute.md',
        'spec/feedback.md'
      ];

      let commandsOk = 0;
      for (const cmd of requiredCommands) {
        if (existsSync(join(projectCommands, cmd))) {
          commandsOk++;
        }
      }
      printCheck('  Command files', commandsOk === requiredCommands.length,
        `${commandsOk}/${requiredCommands.length} found`);
    }
  }

  console.log('');
  console.log('================================================\n');

  if (issuesFound === 0) {
    console.log(`${colors.green}✓ All checks passed! Installation looks good.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Found ${issuesFound} issue(s)${colors.reset}\n`);
    console.log('Recommendations:');
    if (!nodeOk) {
      console.log('  - Install Node.js 20+: https://nodejs.org');
    }
    if (!npmOk) {
      console.log('  - Install npm (usually bundled with Node.js)');
    }
    if (!claudeOk) {
      console.log('  - Install Claude Code CLI: https://code.claude.com');
    }
    if (!claudekitOk) {
      console.log('  - Install ClaudeKit: npm install -g claudekit');
    }
    if (!globalExists && !projectExists) {
      console.log('  - Run: claudeflow setup');
    }
    console.log('');
  }
}
```

### Cross-Platform Compatibility Strategy

**Path Handling:**
- Use `path.join()` for all path construction (never hardcode `/` or `\`)
- Use `os.homedir()` for home directory (not `~/`)
- Use `process.cwd()` for current directory

**File Operations:**
- Use Node.js `fs` module (not shell commands like `cp` or `mkdir`)
- Handle Windows file permissions (no `chmod` equivalent needed)
- Use UTF-8 encoding explicitly for text files

**Command Execution:**
- Use `child_process.execSync()` with careful error handling
- Test that `claudekit` command works on Windows (should via npm bin wrappers)
- Provide clear error messages if commands fail

**Terminal Output:**
- ANSI color codes work on modern Windows Terminal, PowerShell, and cmd
- Fallback to no colors if `process.stdout.isTTY` is false

### ClaudeKit Integration

**Dependency Declaration:**
```json
{
  "dependencies": {
    "claudekit": "^1.0.0"
  }
}
```

**Integration Points:**

1. **Automatic Installation:** npm installs claudekit as dependency when user installs claudeflow
2. **Setup Integration:** Call `claudekit setup` after copying files
3. **Verification:** Check `claudekit --version` in doctor command
4. **Agent Usage:** Commands spawn ClaudeKit agents (research-expert, code-review-expert, etc.)
5. **Hooks:** Use ClaudeKit hooks via settings.json

---

## User Experience

### Installation Flow

**For New Users:**

1. Discover package on npm: `npm search claudeflow`
2. Install globally: `npm install -g claudeflow`
3. Run setup: `claudeflow setup`
4. Choose global or project installation
5. Files copied, ClaudeKit configured automatically
6. Ready to use: `/ideate <task-brief>` in Claude Code

**For Existing install.sh Users:**

1. Uninstall old version:
   - Remove `~/.claude/` (if using global)
   - Remove `.claude/` (if using project)
2. Install via npm: `npm install -g claudeflow`
3. Run setup: `claudeflow setup --global` (or `--project`)
4. Resume normal workflow

**For yarn Users:**

```bash
yarn global add claudeflow
claudeflow setup
```

**For pnpm Users:**

```bash
pnpm add -g claudeflow
claudeflow setup
```

### Command Usage

```bash
# Interactive setup (recommended for first-time users)
claudeflow setup

# Direct modes
claudeflow setup --global      # Install to ~/.claude/
claudeflow setup --project     # Install to ./.claude/

# Check installation
claudeflow doctor

# Version information
claudeflow version
claudeflow --version
claudeflow -v

# Help
claudeflow help
claudeflow --help
claudeflow -h
```

### Update Experience

**When new version available:**

```
╭───────────────────────────────────────────────────╮
│                                                   │
│   Update available: 1.3.0                        │
│   Current version:  1.2.0                        │
│   Run: npm install -g claudeflow                 │
│                                                   │
╰───────────────────────────────────────────────────╯
```

**Updating:**

```bash
# npm
npm update -g claudeflow

# yarn
yarn global upgrade claudeflow

# pnpm
pnpm update -g claudeflow
```

### Troubleshooting Flow

**If installation fails:**

1. Run `claudeflow doctor` to diagnose
2. Check error messages for specific issues
3. Verify prerequisites (Node.js 18+, npm, Claude Code CLI)
4. Try reinstalling: `npm uninstall -g claudeflow && npm install -g claudeflow`
5. Report issue: https://github.com/kennyjpowers/claude-flow.git/issues

---

## Testing Strategy

### Unit Tests

**Test Files:** `test/unit/`

**Coverage Areas:**

1. **CLI Entry Point** (`bin/claudeflow.js`)
   - Purpose: Verify command routing works correctly
   - Test cases:
     - `claudeflow setup` routes to setup command
     - `claudeflow doctor` routes to doctor command
     - `claudeflow version` displays version
     - Unknown commands show error and help
     - `--help` flag shows help message
   - Why: Ensures users can access all commands

2. **Setup Logic** (`lib/setup.js`)
   - Purpose: Verify installation logic handles all scenarios
   - Test cases:
     - Interactive mode prompts user correctly
     - `--global` flag installs to ~/.claude/
     - `--project` flag installs to ./.claude/
     - Prerequisite checks fail with clear errors (Node.js < 18)
     - Prerequisite checks pass with Node.js 18+
     - Directory creation creates all required directories
     - File copying copies all 8 command files
     - Existing files are preserved (not overwritten without confirmation)
   - Why: Core functionality must work reliably across all modes

3. **Doctor Diagnostics** (`lib/doctor.js`)
   - Purpose: Verify diagnostic checks are accurate
   - Test cases:
     - Detects Node.js version correctly
     - Detects missing npm
     - Detects missing Claude Code CLI
     - Detects missing ClaudeKit
     - Correctly identifies global installation
     - Correctly identifies project installation
     - Counts command files accurately
     - Reports appropriate recommendations
   - Why: Users need accurate diagnostics to fix issues

4. **Utilities** (`lib/utils/`)
   - Purpose: Verify cross-platform compatibility
   - Test cases:
     - Path joining works on Windows and Unix
     - Home directory detection works on all platforms
     - File copy preserves content and encoding
     - Directory creation handles existing directories gracefully
   - Why: Must work reliably on Windows, macOS, Linux

### Integration Tests

**Test Files:** `test/integration/`

**Coverage Areas:**

1. **End-to-End Installation**
   - Purpose: Verify complete installation flow works
   - Test cases:
     - Fresh global installation creates all files
     - Fresh project installation creates all files
     - Reinstallation preserves settings.json
     - ClaudeKit setup runs successfully
     - Installed commands are accessible in Claude Code
   - Why: Validates the entire user journey

2. **Update Notifications**
   - Purpose: Verify users are informed of updates
   - Test cases:
     - Update check runs on command execution
     - Notification displays when update available
     - No notification when up-to-date
     - Update check doesn't block command execution
   - Why: Users need to know about new versions

3. **Multi-Package Manager**
   - Purpose: Verify npm/yarn/pnpm all work
   - Test cases:
     - Installation via npm succeeds
     - Installation via yarn succeeds
     - Installation via pnpm succeeds
     - All three install same files
     - All three make `claudeflow` command available
   - Why: Must support user's package manager of choice

### Cross-Platform Tests (CI/CD)

**Matrix Strategy:**

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    package-manager: [npm, yarn, pnpm]
    node-version: [20, 22]
```

**Test Execution:**

1. Install Node.js version
2. Install package manager
3. Install claudeflow via package manager
4. Run `claudeflow setup --global`
5. Verify files created in ~/.claude/
6. Run `claudeflow doctor`
7. Verify all checks pass

**Purpose:** Ensure 100% cross-platform compatibility

**Note:** Testing Node.js 20 and 22 only (ClaudeKit requires 20+)

### Testing with pnpm (Phantom Dependency Detection)

**Special Focus:** pnpm uses strict dependency resolution

**Test Cases:**
- Install claudeflow via pnpm
- Verify ClaudeKit is accessible (not phantom dependency)
- Verify update-notifier works (not phantom dependency)
- Run all commands successfully
- No "Cannot find module" errors

**Why:** pnpm catches dependency declaration issues that npm/yarn hide

### Mocking Strategies

**External Dependencies:**

1. **npm Registry:** Mock update-notifier to avoid network calls
2. **File System:** Use temp directories for test installations
3. **child_process:** Mock execSync for ClaudeKit/Claude CLI checks
4. **readline:** Mock stdin for interactive prompt testing

**Example (Jest):**

```javascript
// Mock update-notifier to avoid network calls
jest.mock('update-notifier', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    update: null,
    notify: jest.fn()
  }))
}));

// Mock file system to use temp directory
import { tmpdir } from 'os';
import { mkdtempSync } from 'fs';

const testDir = mkdtempSync(join(tmpdir(), 'claudeflow-test-'));
```

### Test Documentation Examples

```javascript
/**
 * Purpose: Verify that setup command creates all required directories
 *
 * Why this test exists:
 * - Users need .claude/commands/ and .claude/commands/spec/ directories
 * - Missing directories cause command loading failures in Claude Code
 * - This test catches regressions where directory creation logic breaks
 *
 * What it validates:
 * - All parent and child directories are created
 * - Directories have correct permissions on Unix systems
 * - Existing directories are not deleted or corrupted
 */
test('setup creates all required directories', async () => {
  const testDir = createTempDirectory();
  await setup(['--project'], { cwd: testDir });

  expect(existsSync(join(testDir, '.claude'))).toBe(true);
  expect(existsSync(join(testDir, '.claude/commands'))).toBe(true);
  expect(existsSync(join(testDir, '.claude/commands/spec'))).toBe(true);
});
```

### Minimum Coverage Requirements

- **Unit tests:** 80% line coverage
- **Integration tests:** All critical user flows
- **Cross-platform tests:** All 6 combinations (3 OS × 2 Node versions)

---

## Performance Considerations

### Installation Performance

**Current (install.sh):**
- ~2-5 seconds on Unix systems
- Not available on Windows

**Target (npm package):**
- <5 seconds for `npm install -g @33strategies/claudeflow` (includes ClaudeKit)
- <2 seconds for `claudeflow setup` (file copying only)
- Acceptable: Users install once, run setup rarely

**Optimizations:**
- Use `fs.copyFileSync()` (fast, synchronous for small files)
- Parallelize prerequisite checks where possible
- Cache update notifications (check daily, not every command)

### Package Size

**Target:** <500KB published package

**Current Estimate:**
- .claude/ directory: ~164KB
- templates/: ~28KB
- docs/: ~108KB
- bin/ + lib/: ~50KB (estimated)
- Total: ~350KB

**Optimization:**
- Use `files` whitelist in package.json (not .npmignore blacklist)
- Exclude specs/ directory (~1MB+)
- Exclude .simple-task-master/ directory
- Exclude development files (.git, etc.)

### Update Check Performance

**Strategy:** Non-blocking background check

```javascript
// Check runs async, doesn't block command execution
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24  // Check once per day
});

// Notification displays but doesn't prevent command from running
if (notifier.update) {
  notifier.notify();
}

// Command proceeds immediately
```

**Impact:** <100ms added latency, only once per day

---

## Security Considerations

### Package Security

**NPM Provenance:**
- Enable `--provenance` flag during publish
- Links published package to source repository
- Verifies authenticity via GitHub Actions

**Dependency Security:**
- ClaudeKit: Maintained dependency, regular security updates
- update-notifier: Popular package (10M+ weekly downloads)
- Run `npm audit` in CI/CD
- Fail CI on critical vulnerabilities

### Installation Security

**No Arbitrary Code Execution:**
- No `eval()` or `Function()` calls
- No shell command construction from user input
- All file paths validated (prevent directory traversal)

**File Permissions:**
- Respect umask on Unix systems (default 644 for files, 755 for dirs)
- No chmod operations (let OS handle permissions)
- Settings files readable only by user

**Update Notifications:**
- Use HTTPS for version checks (update-notifier default)
- No execution of update scripts
- User must manually run update command

### Secrets Protection

**Never Include:**
- API keys or tokens in package
- Environment variables in published files
- User credentials or sensitive data

**Package Files Review:**
- Verify `files` field in package.json
- Test with `npm pack` before publishing
- Check tarball contents: `tar -tzf claudeflow-*.tgz`

### Supply Chain Security

**Development:**
- Lock dependency versions with package-lock.json
- Review dependency changes in PRs
- Use Dependabot for automated updates
- Require 2FA for npm publishing

**Publishing:**
- Publish only from CI/CD (not local machines)
- Use npm Trusted Publishers (OIDC) for secure, token-free publishing
  - Short-lived OIDC tokens instead of long-lived NPM_TOKEN
  - Automatic cryptographic provenance attestations (SLSA Level 2)
  - No secrets storage in GitHub (tokens generated per-workflow run)
- Enable GitHub Actions required reviews
- Tag releases with signed commits
- Require `id-token: write` permission in workflow for OIDC authentication

---

## Documentation

### README.md Updates

**Sections to Add/Update:**

1. **Installation** (replace bash script instructions)
   ```markdown
   ## Installation

   Install claudeflow globally via your preferred package manager:

   ### npm
   ```bash
   npm install -g claudeflow
   ```

   ### yarn
   ```bash
   yarn global add claudeflow
   ```

   ### pnpm
   ```bash
   pnpm add -g claudeflow
   ```

   ### Setup

   After installation, run the setup command:

   ```bash
   claudeflow setup
   ```

   Choose:
   - **Global:** Install to ~/.claude/ (available in all projects)
   - **Project:** Install to ./.claude/ (this project only)
   ```

2. **Quick Start** (update commands)
   ```markdown
   ## Quick Start

   1. Install: `npm install -g claudeflow`
   2. Setup: `claudeflow setup`
   3. Open a project in Claude Code
   4. Try: `/ideate <task-brief>`
   ```

3. **Troubleshooting**
   ```markdown
   ## Troubleshooting

   ### Installation Issues

   Run the diagnostic command:
   ```bash
   claudeflow doctor
   ```

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
   - Try: `npm list -g claudeflow`

   **"ClaudeKit not found"**
   - ClaudeKit should install automatically as dependency
   - Manual install: `npm install -g claudekit`

   **"Commands not loading in Claude Code"**
   - Run: `claudeflow doctor`
   - Verify files exist in ~/.claude/commands/
   - Restart Claude Code
   ```

4. **Migration from install.sh**
   ```markdown
   ## Migration from install.sh

   If you previously used install.sh:

   1. Remove old installation:
      ```bash
      # Global installation
      rm -rf ~/.claude

      # Project installation
      rm -rf .claude
      ```

   2. Install via npm:
      ```bash
      npm install -g claudeflow
      ```

   3. Run setup:
      ```bash
      # Global (if you used install.sh user)
      claudeflow setup --global

      # Project (if you used install.sh project)
      claudeflow setup --project
      ```

   4. Verify:
      ```bash
      claudeflow doctor
      ```
   ```

### CHANGELOG.md Updates

**Add v1.2.0 Entry:**

```markdown
## [1.2.0] - 2025-11-21

### Added
- Published to npm registry as "claudeflow"
- Cross-platform CLI installer (replaces install.sh)
- Update notifications for new versions
- `claudeflow doctor` diagnostic command
- Automated version management via semantic-release
- CI/CD testing across npm, yarn, pnpm on Windows, macOS, Linux

### Changed
- Installation method: npm/yarn/pnpm instead of bash script
- Distribution: npm package instead of manual download
- Version management: Automated via semantic-release

### Removed
- install.sh script (replaced by `claudeflow setup`)

### Migration
- See README.md for migration instructions from install.sh
```

### New Documentation Files

**LICENSE** (MIT License)

```
MIT License

Copyright (c) 2025 Kenneth Priester

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Full MIT License text]
```

**.npmignore**

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

# Keep these in package
!README.md
!CLAUDE.md
!CHANGELOG.md
!LICENSE
```

### docs/npm-migration-guide.md

Comprehensive migration guide with:
- Step-by-step uninstall instructions
- npm installation process
- Verification steps
- Troubleshooting common issues
- FAQ

---

## Implementation Phases

### Phase 1: Core npm Package (MVP)

**Goal:** Replace install.sh with npm package distribution

**Deliverables:**

1. **Package Configuration**
   - Create package.json with all required fields
   - Add LICENSE file (MIT)
   - Add .npmignore for file exclusion
   - Update .claude-plugin/plugin.json to v1.2.0

2. **CLI Implementation**
   - Implement bin/claudeflow.js (entry point)
   - Implement lib/setup.js (installation logic)
   - Implement lib/doctor.js (diagnostics)
   - Implement lib/utils/ (cross-platform helpers)

3. **Cross-Platform Compatibility**
   - Replace bash-specific code with Node.js equivalents
   - Test path handling on Windows
   - Verify file operations on all platforms

4. **ClaudeKit Integration**
   - Declare claudekit as dependency
   - Call claudekit setup during installation
   - Verify integration in doctor command

5. **Documentation Updates**
   - Update README.md installation section
   - Update CHANGELOG.md for v1.2.0
   - Add migration guide for install.sh users
   - Create comprehensive CLI usage docs

6. **CI/CD Setup**
   - Create .github/workflows/release.yml
   - Configure semantic-release
   - Set up npm publishing with provenance
   - Test matrix: 3 OS × 3 package managers

7. **Testing**
   - Write unit tests for all CLI commands
   - Write integration tests for installation flows
   - Set up cross-platform test automation

8. **Publishing**
   - Verify package name availability: `npm view claudeflow`
   - Test with `npm pack` and manual installation
   - Publish to npm: `npm publish --provenance`
   - Verify installation from npm registry

**Acceptance Criteria:**
- ✅ Users can install via npm/yarn/pnpm globally
- ✅ `claudeflow setup` works on Windows, macOS, Linux
- ✅ `claudeflow doctor` correctly diagnoses issues
- ✅ All 8 command files copied correctly
- ✅ ClaudeKit integrated and functional
- ✅ CI/CD passes on all 6 combinations (3 OS × 2 Node versions)
- ✅ Package published to npm with provenance
- ✅ Documentation updated and accurate

### Phase 2: Enhanced Features & Polish

**Goal:** Improve user experience and add advanced features

**Deliverables:**

1. **Update Notifications**
   - Integrate update-notifier package
   - Test notification display
   - Configure check interval (daily)

2. **Testing Expansion**
   - Achieve 80%+ test coverage
   - Add edge case tests
   - Test pnpm specifically (phantom dependency detection)
   - Add performance benchmarks

3. **Documentation Expansion**
   - Create video walkthrough
   - Add troubleshooting guide
   - Create FAQ document
   - Write CONTRIBUTING.md

4. **Community Engagement**
   - Submit to awesome-claude-code list
   - Create GitHub issue templates
   - Set up GitHub Discussions
   - Create PR template

5. **Monitoring**
   - Set up npm download tracking
   - Monitor GitHub issues/discussions
   - Track version adoption rates
   - Gather user feedback

**Acceptance Criteria:**
- ✅ Update notifications work correctly
- ✅ Test coverage ≥80%
- ✅ Comprehensive documentation
- ✅ Listed in awesome-claude-code
- ✅ Active community engagement channels

### Phase 3: Ecosystem Growth

**Goal:** Drive adoption and build community

**Deliverables:**

1. **Website Creation** (claudeflow.dev)
   - Create documentation website
   - Add interactive examples
   - Provide getting started guide
   - Host API documentation

2. **Marketing & Outreach**
   - Write launch blog post (DEV.to, Medium)
   - Submit to Product Hunt
   - Present at meetups/conferences
   - Create demo videos

3. **Integration Examples**
   - Example project setups
   - Integration guides for popular frameworks
   - Best practices documentation
   - Community showcases

4. **Advanced Features** (Future Consideration)
   - Wrapper commands (if community requests)
   - Plugin system for custom commands
   - Command marketplace
   - Analytics and telemetry (opt-in)

**Success Metrics:**
- 100+ GitHub stars in first month
- 1K npm downloads/week within 3 months
- 500+ GitHub stars within 6 months
- 10K npm downloads/week within 1 year
- Active contributor community (5+ regular contributors)

---

## Open Questions - RESOLVED

### Technical Questions

1. **ClaudeKit Version Compatibility** ✅ RESOLVED
   - Decision: Use caret range `"claudekit": "^1.0.0"`
   - Rationale: Automatic updates, test compatibility in CI/CD

2. **ESM vs CommonJS** ✅ RESOLVED
   - Decision: Use ESM (import/export)
   - Rationale: Node.js 20+ has excellent ESM support, modern and future-proof

3. **TypeScript Migration** ✅ RESOLVED
   - Decision: Start with JavaScript for MVP, consider TypeScript in Phase 2
   - Rationale: Faster MVP delivery, can migrate later if needed

### Documentation Questions

4. **Author Information** ✅ RESOLVED
   - Decision: Kenneth Priester <33strategies@duck.com>
   - Status: Already added to package.json (line 218)

5. **Package Naming** ✅ RESOLVED
   - Decision: `@33strategies/claudeflow` (scoped package under 33strategies org)
   - Rationale: Unscoped "claudeflow" is available but using org namespace for better management
   - Verification: `npm view claudeflow` shows no existing package

### Publishing Questions

6. **NPM Organization** ✅ RESOLVED
   - Decision: Publish under @33strategies organization
   - Rationale: Organization already created, allows team publishing and better package management

7. **Anthropic Approval** ✅ DEFERRED
   - Decision: Defer approval request, assume safe based on precedent
   - Rationale: ClaudeKit successfully uses "claude" prefix, similar usage pattern
   - Action: Monitor for any trademark issues post-launch

8. **ClaudeKit Coordination** ✅ PLANNED
   - Decision: Notify ClaudeKit maintainer before launch
   - Action: Create GitHub issue or email maintainer with package details
   - Benefit: Potential cross-promotion, ensure compatibility

### Policy Questions

9. **Support Policy** ✅ RESOLVED
   - Decision: Support latest + previous major version (e.g., 2.x when 3.x releases)
   - Rationale: Balances user support with maintenance burden

10. **Breaking Changes Policy** ✅ RESOLVED
    - Decision: Follow semver strictly, provide migration guides
    - Rationale: Predictable upgrades, clear version signaling

11. **Trademark Search** ✅ RESOLVED
    - Decision: No existing trademarks found for "claudeflow"
    - Action: Not filing trademark at this time
    - Status: Safe to proceed with name

12. **Domain Ownership** ✅ RESOLVED
    - Decision: claudeflow.dev domain purchased and owned by project
    - Status: Domain ready for Phase 3 website deployment

---

## References

### Research Documents

- **Ideation Document:** specs/package-publishing-strategy/01-ideation.md
- **npm CLI Research:** /tmp/research_20251121_npm_cli_naming_packaging.md
- **Package Manager Research:** /tmp/research_20251121_npm_package_manager_interop.md

### Official Documentation

- **npm:** https://docs.npmjs.com/
  - Publishing packages: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
  - package.json reference: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
  - Provenance: https://docs.npmjs.com/generating-provenance-statements

- **Yarn:** https://yarnpkg.com/
  - Rulebook: https://yarnpkg.com/advanced/rulebook
  - Global installs: https://classic.yarnpkg.com/en/docs/cli/global/

- **pnpm:** https://pnpm.io/
  - package.json: https://pnpm.io/package_json
  - Strict mode: https://pnpm.io/npmrc#strict-peer-dependencies

- **Node.js:**
  - ESM support: https://nodejs.org/api/esm.html
  - File system: https://nodejs.org/api/fs.html
  - Path handling: https://nodejs.org/api/path.html

### Tools & Libraries

- **ClaudeKit:**
  - Repository: https://github.com/carlrannaberg/claudekit
  - Documentation: https://docs.claudekit.cc/
  - npm page: https://www.npmjs.com/package/claudekit

- **semantic-release:**
  - Repository: https://github.com/semantic-release/semantic-release
  - Configuration: https://semantic-release.gitbook.io/semantic-release/usage/configuration
  - Plugins: https://semantic-release.gitbook.io/semantic-release/extending/plugins-list

- **update-notifier:**
  - Repository: https://github.com/yeoman/update-notifier
  - npm page: https://www.npmjs.com/package/update-notifier

### Best Practices

- **Node.js CLI Best Practices:** https://github.com/lirantal/nodejs-cli-apps-best-practices
- **Rush.js Phantom Dependencies:** https://rushjs.io/pages/advanced/phantom_deps/
- **Conventional Commits:** https://www.conventionalcommits.org/
- **awesome-claude-code:** https://github.com/hesreallyhim/awesome-claude-code

### Related Issues & Discussions

- Package naming discussion: (to be created)
- ClaudeKit integration approach: (to be created)
- Windows compatibility testing: (to be created)

---

## Changelog

### Specification Changes

**2025-11-21 - Initial Draft**
- Created comprehensive specification based on ideation document
- Defined Pure Installer architecture
- Detailed CLI command implementation
- Specified cross-platform compatibility requirements
- Outlined 3-phase implementation plan
- Identified 12 open questions for resolution

**Next Steps:**
1. ✅ All open questions resolved
2. ✅ Specification validated and ready for implementation
3. Begin Phase 1 implementation
4. Set up GitHub repository structure
5. Configure CI/CD pipeline

**Updates:**
- Updated Node.js requirement from >=18.0.0 to >=20.0.0 (ClaudeKit requirement)
- Changed package name to @33strategies/claudeflow (scoped under 33strategies org)
- Added error handling for file copy operations in setup.js
- Reduced CI/CD matrix from 3 Node versions to 2 (20, 22 only)
- Resolved all 12 open questions with actionable decisions
- Verified npm package name availability (unscoped "claudeflow" available but using scoped)
- Trademark search completed (no conflicts)
- Domain ownership confirmed (claudeflow.dev purchased)

**2025-11-21 - Post-Implementation Feedback**
- **Trusted Publishers (OIDC)**: Migrating from NPM_TOKEN to npm Trusted Publishers for secure publishing
  - Decision: Implement BEFORE first publish (recommended by research, easier than retrofitting)
  - Security benefits: No long-lived tokens, automatic provenance attestations, SLSA Level 2 compliance
  - Implementation: Add `id-token: write` permission to workflow, remove NPM_TOKEN, configure on npmjs.com
  - Approach: Initial 7-day token publish, then switch to OIDC (package must exist before OIDC config)
  - Impact: ~50-100 line changes across 4 files, 30-60 minutes implementation time
  - Research: Comprehensive analysis completed (see /tmp/research_20251121_npm_trusted_publishers_semantic_release.md)
  - Next steps: Update specification sections, create tasks via /spec:decompose, implement via /spec:execute

### 2025-11-21 - Post-Implementation Feedback

**Source:** Feedback #1 (see specs/package-publishing-strategy/05-feedback.md)

**Issue:** ClaudeKit setup fails for global mode with error: `error: unknown option '--global'`

**Decision:** Implement with minimal scope

**Changes to Specification:**

- **Section 5.2: lib/setup.js (Core Installation Logic)**
  - Line 620: Update `runClaudeKitSetup()` function implementation
  - Change from: `claudekit setup --global` to `claudekit setup --user --yes`
  - Change from: `claudekit setup` to `claudekit setup --yes`
  - Add non-interactive mode with `--yes` flag for both installation modes

**Implementation Impact:**
- Priority: High
- Approach: Add non-interactive mode (change --global to --user, add --yes for both modes)
- Affected components: lib/setup.js (runClaudeKitSetup function, single line change)
- Estimated blast radius: LOW - Single function, one-line fix, no downstream dependencies

**Next Steps:**
1. Review and update lib/setup.js:257 (change claudekit setup flags)
2. Run `/spec:decompose specs/package-publishing-strategy/02-specification.md` to update task breakdown
3. Run `/spec:execute specs/package-publishing-strategy/02-specification.md` to implement changes

### 2025-11-21 - Post-Implementation Feedback #2

**Source:** Feedback #2 (see specs/package-publishing-strategy/05-feedback.md)

**Issue:** Update notifications not displaying when running v1.0.1 with v1.1.0 published on npm

**Decision:** Implement with minimal scope

**Changes to Specification:**

- **Section 5.1: bin/claudeflow.js (Entry Point)**
  - Line 289: Update `updateCheckInterval` from 24 hours to 7 days
  - Change from: `updateCheckInterval: 1000 * 60 * 60 * 24` to `updateCheckInterval: 1000 * 60 * 60 * 24 * 7`
  - Rationale: Align with industry standard (npm, yarn, pnpm use 7-day intervals)

**Implementation Impact:**
- Priority: Low
- Approach: Option B - Weekly interval (recommended, industry standard)
- Affected components: bin/claudeflow.js (updateCheckInterval parameter, single value change)
- Estimated blast radius: LOW - Single file, one parameter change, no downstream dependencies

**Next Steps:**
1. Review and update bin/claudeflow.js:289 (change updateCheckInterval to 7 days)
2. Run `/spec:decompose specs/package-publishing-strategy/02-specification.md` to update task breakdown
3. Run `/spec:execute specs/package-publishing-strategy/02-specification.md` to implement changes
