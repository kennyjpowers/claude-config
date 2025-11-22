# Installation Guide

This guide explains when and how to install claudeflow for Claude Code.

## Prerequisites

Before installing claudeflow, ensure you have the following:

### Required Software

- **Node.js 22.14+** (required by ClaudeKit dependency)
  - Check version: `node --version`
  - Install from: https://nodejs.org
  - Must be 22.14 or higher

- **Package Manager** (npm, yarn, or pnpm)
  - npm comes bundled with Node.js
  - yarn: https://yarnpkg.com
  - pnpm: https://pnpm.io

- **Claude Code CLI** (runtime environment)
  - Install from: https://code.claude.com
  - Verify installation: `claude --version`

### Supported Platforms

- ✅ **Windows** (Windows 10+, PowerShell, cmd, Git Bash)
- ✅ **macOS** (10.15+)
- ✅ **Linux** (Ubuntu, Debian, Fedora, Arch, and similar distributions)

**Note:** Unlike the previous bash-based installer (install.sh), claudeflow works natively on all platforms including Windows.

## Installation Modes

claudeflow supports two installation modes via the `claudeflow setup` command:

```bash
claudeflow setup --global   # Install to ~/.claude/ (global)
claudeflow setup --project  # Install to ./.claude/ (project)
claudeflow setup            # Interactive mode (prompts for choice)
```

## Understanding the Difference

### User/Global Installation (`~/.claude/`)

**Where it installs**: `~/.claude/commands/`, `~/.claude/settings.json`

**Scope**: Available in **all projects** on your machine

**Version control**: Not committed to git (personal)

**Best for**:
- Personal workflow preferences
- Commands you use across all projects
- Individual developers

### Project Installation (`./.claude/`)

**Where it installs**: `<project>/.claude/commands/`, `<project>/.claude/settings.json`

**Scope**: Available only in **this specific project**

**Version control**: Can be committed to git (shared)

**Best for**:
- Team collaboration
- Project-specific workflows
- Standardizing team practices

## Package Manager Support

claudeflow works with all major Node.js package managers. Choose the one you prefer:

### npm (default)
```bash
npm install -g @33strategies/claudeflow
claudeflow setup
```

### yarn
```bash
yarn global add @33strategies/claudeflow
claudeflow setup
```

### pnpm
```bash
pnpm add -g @33strategies/claudeflow
claudeflow setup
```

**Note:** All three methods install the same package and provide identical functionality. ClaudeKit is installed automatically as a dependency.

## Decision Guide

### When to Use User/Global Installation

```bash
npm install -g @33strategies/claudeflow
claudeflow setup --global
```

**Use this if**:
- ✅ You work on multiple projects and want the same workflow everywhere
- ✅ You're a solo developer
- ✅ You want your personal productivity commands available everywhere
- ✅ Different projects use different workflows and you don't want to force yours on them

**Example scenario**:
> "I use the /ideate → /spec workflow on all my personal and work projects. I want it available everywhere without setting it up per-project."

**Result**:
```
~/.claude/
├── commands/
│   ├── ideate.md
│   ├── ideate-to-spec.md
│   └── spec/
│       ├── create.md
│       ├── decompose.md
│       ├── execute.md
│       ├── feedback.md
│       ├── doc-update.md
│       └── migrate.md
└── settings.json

Your commands are now available in ALL projects!
```

### When to Use Project Installation

```bash
npm install -g @33strategies/claudeflow
cd /path/to/your/project
claudeflow setup --project
```

**Use this if**:
- ✅ You're working on a team project
- ✅ You want to standardize workflows across the team
- ✅ The project has specific workflow requirements
- ✅ You want to version control the configuration

**Example scenario**:
> "My team wants to use the /ideate → /spec workflow for all features. We want everyone on the team to have the same commands and follow the same process."

**Result**:
```
your-project/
├── .claude/
│   ├── commands/
│   │   ├── ideate.md
│   │   ├── ideate-to-spec.md
│   │   └── spec/
│       ├── create.md
│       ├── decompose.md
│       ├── execute.md
│       ├── feedback.md
│       ├── doc-update.md
│       └── migrate.md
│   └── settings.json
├── .gitignore  (updated to ignore settings.local.json)
├── CLAUDE.md   (project-specific context for AI)
└── README.md   (documents the workflow for team)

Team members clone the repo and get the workflow automatically!
```

### Can I Do Both?

**Yes!** You can install globally AND in specific projects. They work together via Claude Code's configuration hierarchy:

```bash
# Global installation (personal commands everywhere)
npm install -g @33strategies/claudeflow
claudeflow setup --global

# Project installation (team commands for this project)
cd /path/to/team-project
claudeflow setup --project
```

**Configuration precedence**:
1. Local project settings (`.claude/settings.local.json` - gitignored)
2. Project settings (`.claude/settings.json` - committed)
3. Global user settings (`~/.claude/settings.json`)

Project settings override global settings, so team conventions take precedence.

## Installation Walkthrough

### User/Global Installation (Step-by-Step)

1. **Install Node.js 22.14+ if needed**
   ```bash
   node --version  # Check version
   # If < 22.14, install from nodejs.org
   ```

2. **Install claudeflow**
   ```bash
   # Using npm (recommended)
   npm install -g @33strategies/claudeflow

   # OR using yarn
   yarn global add @33strategies/claudeflow

   # OR using pnpm
   pnpm add -g @33strategies/claudeflow
   ```

3. **Run setup**
   ```bash
   claudeflow setup --global
   ```

4. **Verify installation**
   ```bash
   claudeflow doctor
   ```

   You should see all checks passing:
   ```
   ✓ Node.js version - v22.14.0
   ✓ npm - 10.2.3
   ✓ Claude Code CLI - 1.0.0
   ✓ ClaudeKit - 1.0.0
   ✓ Global (~/.claude/)
     ✓ Commands directory
     ✓ Command files - 8/8 found
   ```

5. **Customize settings (optional)**
   ```bash
   # Copy example settings
   cp ~/.claude/settings.json.example ~/.claude/settings.json

   # Edit with your preferences
   code ~/.claude/settings.json
   ```

6. **Start using commands**
   - Open any project in Claude Code
   - Type `/ideate` to see the command available
   - All custom commands work everywhere!

### Project Installation (Step-by-Step)

1. **Install Node.js 22.14+ if needed**
   ```bash
   node --version  # Check version
   # If < 22.14, install from nodejs.org
   ```

2. **Install claudeflow globally**
   ```bash
   npm install -g @33strategies/claudeflow
   ```

3. **Navigate to your project**
   ```bash
   cd /path/to/your/project
   ```

4. **Run project setup**
   ```bash
   claudeflow setup --project
   ```

5. **Review and customize configuration**
   ```bash
   # Review settings
   cat .claude/settings.json

   # Customize for your team
   code .claude/settings.json

   # Create project context for AI
   code CLAUDE.md
   ```

6. **Add to version control**
   ```bash
   # Ensure local settings are gitignored
   echo ".claude/settings.local.json" >> .gitignore
   echo "CLAUDE.local.md" >> .gitignore

   # Commit team configuration
   git add .claude/ CLAUDE.md .gitignore
   git commit -m "Add claudeflow workflow configuration"
   git push
   ```

7. **Document for team members**
   Add to your project's README.md:
   ```markdown
   ## Development Workflow

   This project uses claudeflow for structured feature development.

   **Setup:**
   ```bash
   npm install -g @33strategies/claudeflow
   claudeflow doctor  # Verify installation
   ```

   **Workflow:**
   - Start features with `/ideate <description>`
   - Follow the complete workflow documented in CLAUDE.md
   ```

8. **Team member onboarding**
   New team members just need to:
   ```bash
   git clone <repo>
   npm install -g @33strategies/claudeflow
   claudeflow doctor
   ```
   The `.claude/` configuration is already in the repo!

## Diagnostic Command

If you encounter issues at any point, run the diagnostic command:

```bash
claudeflow doctor
```

This checks:
- ✓ Node.js version (requires 22.14+)
- ✓ npm availability
- ✓ Claude Code CLI installation
- ✓ ClaudeKit installation (should be automatic)
- ✓ Global installation (~/.claude/)
- ✓ Project installation (./.claude/)
- ✓ Command files presence (8/8 required commands)

**Example output:**
```
claudeflow Doctor - Installation Diagnostics

================================================

✓ Node.js version - v22.14.0
✓ npm - 10.2.3
✓ Claude Code CLI - 1.0.0
✓ ClaudeKit - 1.0.0

Installation Locations:

✓ Global (~/.claude/)
  ✓ Commands directory
  ✓ Command files - 8/8 found

✓ Project (./.claude/)
  ✓ Commands directory
  ✓ Command files - 8/8 found

================================================

✓ All checks passed! Installation looks good.
```

**If checks fail**, the doctor command provides specific recommendations:
- Node.js < 22.14: Install Node.js 22.14+ from https://nodejs.org
- ClaudeKit not found: Should install automatically; manual: `npm install -g claudekit`
- Commands missing: Re-run `claudeflow setup`
- Claude Code CLI not found: Install from https://code.claude.com

## Updating After Installation

### Update Global Installation

```bash
# Using npm
npm update -g @33strategies/claudeflow

# Using yarn
yarn global upgrade @33strategies/claudeflow

# Using pnpm
pnpm update -g @33strategies/claudeflow

# Re-run setup if needed
claudeflow setup --global
```

### Update Project Configuration

```bash
# Update the CLI
npm update -g @33strategies/claudeflow

# Navigate to project
cd /path/to/your-project

# Re-run project setup
claudeflow setup --project

# Commit updates
git add .claude/
git commit -m "Update claudeflow configuration"
git push
```

### Update Notifications

claudeflow automatically checks for updates once per week (every 7 days). When updates are available, you'll see:

```
╭───────────────────────────────────────────────────╮
│                                                   │
│   Update available: 1.3.0                        │
│   Current version:  1.2.0                        │
│   Run: npm install -g @33strategies/claudeflow   │
│                                                   │
╰───────────────────────────────────────────────────╯
```

**Update checks:**
- Run in the background (non-blocking)
- Check once per week
- Never prevent commands from running

**Manual update check:**
```bash
npm outdated -g @33strategies/claudeflow
```

## Installation Checklists

### For User/Global Installation

- [ ] Verify Node.js 22.14+ installed (`node --version`)
- [ ] Install claudeflow globally (`npm install -g @33strategies/claudeflow`)
- [ ] Run setup (`claudeflow setup --global`)
- [ ] Verify with doctor command (`claudeflow doctor`)
- [ ] Check all checks pass
- [ ] Commands available in all projects
- [ ] Customize `~/.claude/settings.json` if desired
- [ ] Test a command in Claude Code (try `/ideate`)

### For Project/Team Installation

- [ ] Verify Node.js 22.14+ installed (`node --version`)
- [ ] Navigate to project directory
- [ ] Install claudeflow globally (`npm install -g @33strategies/claudeflow`)
- [ ] Run project setup (`claudeflow setup --project`)
- [ ] Review `.claude/settings.json` for team settings
- [ ] Create/update `CLAUDE.md` with project context
- [ ] Update `.gitignore`:
  - [ ] Add `.claude/settings.local.json`
  - [ ] Add `CLAUDE.local.md`
- [ ] Commit configuration:
  ```bash
  git add .claude/ CLAUDE.md .gitignore
  git commit -m "Add claudeflow workflow configuration"
  ```
- [ ] Document setup in project README.md
- [ ] Test commands in Claude Code
- [ ] Share setup instructions with team

## Migration from install.sh (v1.1.0 and earlier)

If you previously used install.sh to install claude-config, follow these steps:

### Step 1: Remove Old Installation

```bash
# If you used global installation (install.sh user)
rm -rf ~/.claude

# If you used project installation (install.sh project)
cd /path/to/project
rm -rf .claude
```

### Step 2: Install via npm

```bash
# Using npm
npm install -g @33strategies/claudeflow

# OR using yarn
yarn global add @33strategies/claudeflow

# OR using pnpm
pnpm add -g @33strategies/claudeflow
```

### Step 3: Run Setup

```bash
# Global installation (if you previously used: install.sh user)
claudeflow setup --global

# Project installation (if you previously used: install.sh project)
cd /path/to/project
claudeflow setup --project
```

### Step 4: Verify Installation

```bash
claudeflow doctor
```

You should see all checks passing.

### What Changed?

| Aspect | Old (install.sh) | New (npm package) |
|--------|------------------|-------------------|
| **Distribution** | Manual git clone/download | npm registry |
| **Installation** | `./install.sh user/project` | `claudeflow setup --global/--project` |
| **Prerequisites** | Bash shell (Unix only) | Node.js 22.14+ (cross-platform) |
| **Updates** | `git pull && ./install.sh` | `npm update -g claudeflow` |
| **Diagnostics** | Manual file checks | `claudeflow doctor` |
| **Notifications** | None | Automatic weekly update checks |
| **Platforms** | macOS, Linux only | Windows, macOS, Linux |
| **Package Managers** | N/A | npm, yarn, pnpm |
| **ClaudeKit** | Manual: `npm install -g claudekit` | Automatic dependency |

### Migration Notes

- **STM Tasks Preserved:** Your existing STM tasks are not affected. Migration only changes the installation method.
- **Settings Preserved:** If you back up your `settings.json` before removing `.claude/`, you can restore it after setup.
- **No Breaking Changes:** All commands work exactly the same way.

## Troubleshooting

### "Command not found: claudeflow"

**Cause:** npm global bin directory not in PATH, or claudeflow not installed globally

**Solutions:**
```bash
# Check if installed
npm list -g @33strategies/claudeflow

# If not installed
npm install -g @33strategies/claudeflow

# If installed but not in PATH, find npm global bin directory
npm bin -g
# Add that directory to your PATH in ~/.bashrc, ~/.zshrc, or equivalent
```

### "ClaudeKit not found"

**Cause:** ClaudeKit should install automatically as a dependency but didn't

**Solutions:**
```bash
# Reinstall claudeflow (will install ClaudeKit)
npm uninstall -g @33strategies/claudeflow
npm install -g @33strategies/claudeflow

# Manual installation (if needed)
npm install -g claudekit

# Verify
claudekit --version
```

### "Commands not loading in Claude Code"

**Causes:**
- Commands not installed to correct location
- Claude Code not detecting `.claude/` directory
- Command files corrupted or missing

**Solutions:**
```bash
# Run diagnostics
claudeflow doctor

# Re-run setup
claudeflow setup --global  # or --project

# Verify files exist
ls -la ~/.claude/commands/         # For global
ls -la ./.claude/commands/         # For project

# Restart Claude Code completely
```

### "Node.js version too old"

**Cause:** Node.js version < 22.14

**Solution:**
```bash
# Check current version
node --version

# Install Node.js 22.14+ from:
# https://nodejs.org

# Or use a version manager:
# nvm (https://github.com/nvm-sh/nvm)
nvm install 22
nvm use 22
```

### Installation hangs or fails

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Try with verbose logging
npm install -g @33strategies/claudeflow --verbose

# Try different package manager
yarn global add @33strategies/claudeflow
# OR
pnpm add -g @33strategies/claudeflow
```

### Permission errors on Unix/macOS

**Cause:** Trying to install globally without permissions

**Solutions:**
```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g @33strategies/claudeflow

# Option 2: Fix npm permissions (recommended)
# Follow: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

# Option 3: Use nvm (best practice)
# Install nvm, then Node.js will install to your home directory
```

## Quick Reference

| Situation | Command | Location |
|-----------|---------|----------|
| **First-time install (solo dev)** | `npm install -g @33strategies/claudeflow && claudeflow setup --global` | `~/.claude/` |
| **First-time install (team project)** | `npm install -g @33strategies/claudeflow && claudeflow setup --project` | `./.claude/` |
| **Install both modes** | Run both commands above | Both locations |
| **Check installation** | `claudeflow doctor` | N/A |
| **Update CLI** | `npm update -g @33strategies/claudeflow` | N/A |
| **Re-run setup** | `claudeflow setup` | Interactive |
| **Remove global** | `npm uninstall -g @33strategies/claudeflow && rm -rf ~/.claude/` | N/A |
| **Remove project** | `rm -rf ./.claude/` | N/A |
| **Migrate from install.sh** | See "Migration from install.sh" section above | Varies |
| **Get help** | `claudeflow help` | N/A |
| **Check version** | `claudeflow version` | N/A |

## Best Practices

### For Solo Developers

1. **Install globally** - Get commands everywhere
   ```bash
   npm install -g @33strategies/claudeflow
   claudeflow setup --global
   ```

2. **Keep updated** - Let update notifications guide you
   - Updates check weekly automatically
   - Run `npm update -g @33strategies/claudeflow` when notified

3. **Customize freely** - Personalize your workflow
   - Edit `~/.claude/settings.json` for your preferences
   - Add custom CLAUDE.md context if desired

### For Teams

1. **Install to project** - Standardize across team
   ```bash
   cd /path/to/project
   claudeflow setup --project
   ```

2. **Commit configuration** - Share workflow with team
   ```bash
   git add .claude/ CLAUDE.md .gitignore
   git commit -m "Add claudeflow configuration"
   ```

3. **Document in README** - Help new team members
   - Add setup instructions
   - Explain the workflow
   - Link to CLAUDE.md

4. **Use local overrides** - Allow personal preferences
   - Team: Commit `.claude/settings.json`
   - Individual: Use `.claude/settings.local.json` (gitignored)

5. **Keep in sync** - Update when workflow improves
   ```bash
   npm update -g @33strategies/claudeflow
   claudeflow setup --project
   git add .claude/
   git commit -m "Update claudeflow"
   ```

### For Both

1. **Run doctor regularly** - Catch issues early
   ```bash
   claudeflow doctor
   ```

2. **Stay updated** - Get new features and fixes
   - Watch for update notifications (weekly checks)
   - Update when convenient

3. **Keep ClaudeKit updated** - It's a dependency
   - Updates automatically with claudeflow
   - Check version: `claudekit --version`

## Additional Resources

- **Main README:** [README.md](../README.md) - Overview and quick start
- **Design Rationale:** [docs/DESIGN_RATIONALE.md](DESIGN_RATIONALE.md) - Why this approach works
- **Setup Guide:** [docs/SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed configuration
- **Feedback Workflow:** [docs/guides/feedback-workflow-guide.md](guides/feedback-workflow-guide.md) - Post-implementation feedback
- **GitHub Issues:** https://github.com/kennyjpowers/claude-flow.git/issues - Report problems
- **Package Page:** https://www.npmjs.com/package/@33strategies/claudeflow - npm registry

## Need Help?

1. **Run diagnostics:**
   ```bash
   claudeflow doctor
   ```

2. **Check the troubleshooting section** in this guide (above)

3. **Search existing issues:**
   https://github.com/kennyjpowers/claude-flow.git/issues

4. **Create a new issue:**
   Include output of `claudeflow doctor` in your report
