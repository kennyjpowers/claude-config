# Installation Guide

This guide explains when and how to install this configuration repository.

## Installation Modes

The `install.sh` script supports two modes:

```bash
./install.sh user      # Install to ~/.claude/ (global)
./install.sh project   # Install to current project's .claude/
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

## Decision Guide

### When to Use User/Global Installation

```bash
./install.sh user
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
│   ├── spec/
│   │   ├── progress.md
│   │   └── doc-update.md
└── settings.json

Your commands are now available in ALL projects!
```

### When to Use Project Installation

```bash
cd /path/to/your/project
./install.sh project
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
│   │   ├── spec/
│   │   │   ├── progress.md
│   │   │   └── doc-update.md
│   └── settings.json
├── .gitignore  (updated to ignore settings.local.json)
└── (other project files)

Team members can:
1. Clone the repo
2. Install ClaudeKit: npm install -g claudekit
3. Run: claudekit setup --yes
4. Start using the commands immediately!
```

## Can I Use Both?

**Yes!** You can install globally AND per-project. Claude Code's configuration hierarchy handles this:

```
Priority (highest to lowest):
1. Project .claude/settings.local.json  (personal, gitignored)
2. Project .claude/settings.json        (team, committed)
3. User ~/.claude/settings.json         (personal global)
```

### Hybrid Approach (Recommended)

**Install globally for personal use**:
```bash
./install.sh user
```

**Then install to specific projects for teams**:
```bash
cd /path/to/team-project
./install.sh project
git add .claude/
git commit -m "Add team workflow configuration"
```

**Result**:
- You have the commands everywhere (global)
- Team projects have standardized workflows (project-level)
- Project settings override your global defaults

## Common Scenarios

### Scenario 1: Solo Developer

**Your situation**: You work alone on multiple projects

**Recommendation**:
```bash
./install.sh user
```

**Why**: Simple setup, available everywhere, no need for per-project config

---

### Scenario 2: Team Lead Standardizing Workflow

**Your situation**: You want your team to use these workflows

**Recommendation**:
```bash
cd /path/to/team-project
./install.sh project
git add .claude/ CLAUDE.md .gitignore
git commit -m "Add team workflow configuration"
git push origin main
```

**Team members do**:
```bash
git pull
npm install -g claudekit
claudekit setup --yes
```

**Why**: Configuration is version controlled and shared with the team

---

### Scenario 3: Team Member Joining Project

**Your situation**: Project already has `.claude/` configuration

**Recommendation**:
```bash
# Just install ClaudeKit, the project config is already there
npm install -g claudekit
cd /path/to/project
claudekit setup --yes

# Optional: Add personal global preferences too
cd /path/to/claude-config
./install.sh user
```

**Why**: Respect team's workflow while adding personal preferences globally

---

### Scenario 4: Multiple Teams with Different Workflows

**Your situation**: Work on Team A (uses this workflow) and Team B (uses different workflow)

**Recommendation**:
```bash
# Install your preferred workflow globally
./install.sh user

# Each team project has its own config
cd /path/to/team-a-project
./install.sh project  # This workflow

cd /path/to/team-b-project
# Different configuration, or none at all
```

**Why**: Global gives you defaults, project-level overrides when needed

---

### Scenario 5: Trying It Out

**Your situation**: Want to test this workflow before committing

**Recommendation**:
```bash
# Try it in one project first
cd /path/to/test-project
./install.sh project

# After testing, if you like it:
./install.sh user  # Make it global
```

**Why**: Low-risk experimentation in one project

## Installation Checklist

### For User/Global Installation

- [ ] Clone this repository
- [ ] Run `./install.sh user`
- [ ] ClaudeKit will be installed globally
- [ ] Commands available in all projects
- [ ] Customize `~/.claude/settings.json` if desired

### For Project/Team Installation

- [ ] Clone this repository
- [ ] Navigate to your project: `cd /path/to/project`
- [ ] Run `../claude-config/install.sh project`
- [ ] Review and customize `.claude/settings.json`
- [ ] Create/update `CLAUDE.md` with project context
- [ ] Add to git:
  ```bash
  git add .claude/ CLAUDE.md .gitignore
  git commit -m "Add Claude Code workflow configuration"
  ```
- [ ] Document in project README how to set up

## Updating After Installation

### Update Global Configuration

```bash
cd /path/to/claude-config
git pull origin main
./install.sh user
```

### Update Project Configuration

```bash
cd /path/to/claude-config
git pull origin main
cd /path/to/your-project
../claude-config/install.sh project
git add .claude/
git commit -m "Update workflow configuration"
```

### Update ClaudeKit

```bash
npm update -g claudekit
```

## Configuration Files Explained

### Files Created by Installation

**User/Global** (`~/.claude/`):
```
~/.claude/
├── commands/          # Your custom commands
├── settings.json      # Global defaults
└── CLAUDE.md          # Personal preferences (optional)
```

**Project** (`.claude/`):
```
project/.claude/
├── commands/          # Team custom commands
├── settings.json      # Team settings (committed)
└── settings.local.json # Your personal overrides (gitignored)
```

### What to Commit to Git (Project Installation)

**DO commit**:
- `.claude/settings.json` (team settings)
- `.claude/commands/` (team commands)
- `CLAUDE.md` (project context)
- `.gitignore` updates

**DON'T commit**:
- `.claude/settings.local.json` (personal overrides)
- `CLAUDE.local.md` (personal notes)

Add to `.gitignore`:
```gitignore
.claude/settings.local.json
CLAUDE.local.md
```

## Re-Installing & Updates

### ⚠️ Important: Re-Installation Behavior

When you run `./install.sh` on a project that already has commands installed:

**What gets OVERWRITTEN**:
- Files with the SAME NAME as files in this repo
- Example: If both have `ideate.md`, this repo's version wins

**What gets PRESERVED**:
- Files with DIFFERENT NAMES that only exist in the project
- Example: `team-specific-review.md` stays

### Safety Check (Added in Script)

The install script now shows a warning when re-installing:

```
⚠️  WARNING: Re-installing will overwrite files with the same names!

Files that will be OVERWRITTEN (same name in both locations):
  - ideate.md
  - ideate-to-spec.md

Files that will be PRESERVED (different names):
  - team-review.md
  - project-standup.md

Continue with installation? This may overwrite existing files (y/N):
```

### Best Practices to Avoid Conflicts

#### 1. **Never Modify Base Commands in Projects**

❌ **Bad**:
```bash
# In project repo
nano .claude/commands/ideate.md  # Modifying base command
git commit -m "Customize ideate"
```

✅ **Good**:
```bash
# In project repo - create NEW command
cat > .claude/commands/project-ideate.md << 'EOF'
---
description: Project-specific ideation
---
[Your custom content]
EOF
git commit -m "Add project-specific ideation"
```

#### 2. **Use Team Fork for Heavy Customization**

If your team needs customized versions of the base commands:

```bash
# Fork this repo to your team's GitHub
# Clone the fork
git clone https://github.com/your-team/claude-config.git

# Customize base commands in the fork
cd claude-config
nano .claude/commands/ideate.md  # Modify freely

# Commit to YOUR fork
git add .
git commit -m "Customize for team workflow"
git push

# Team installs from the fork
./install.sh project
```

#### 3. **Check Git Status Before Re-Installing**

```bash
# Before re-installing in a project
cd /path/to/project
git status .claude/commands/

# If there are uncommitted changes
git diff .claude/commands/

# Option A: Commit them first
git add .claude/commands/
git commit -m "Save command modifications"

# Option B: Stash them
git stash push .claude/commands/

# Then re-install
/path/to/claude-config/install.sh project

# Review what changed
git diff .claude/

# If you stashed, restore selectively
git stash list
git stash show -p stash@{0}
git stash pop  # or git stash drop if you don't want them
```

#### 4. **Namespace Project Commands**

Use prefixes to avoid conflicts:

```bash
# Project-specific commands
.claude/commands/
├── project-review.md          # Team's review process
├── project-deploy.md          # Team's deployment
├── ideate.md                  # From claude-config (base)
├── ideate-to-spec.md          # From claude-config (base)
└── spec/
    ├── progress.md            # From claude-config (base)
    └── doc-update.md          # From claude-config (base)
```

### Team Collaboration Workflow

**Initial Setup** (Team Lead):
```bash
# Install to project
cd /path/to/team-project
/path/to/claude-config/install.sh project

# Review and commit
git add .claude/ CLAUDE.md .gitignore
git commit -m "Add base workflow from claude-config v1.0.0"
git push
```

**Team Members Join**:
```bash
git pull
npm install -g claudekit
claudekit setup --yes
# Ready to use!
```

**Adding Team Commands** (Any Team Member):
```bash
# Create NEW command (don't modify base)
cat > .claude/commands/team-standup.md << 'EOF'
---
description: Generate daily standup report
---
...
EOF

git add .claude/commands/team-standup.md
git commit -m "Add standup command"
git push
```

**Updating Base Commands** (Team Lead):
```bash
cd /path/to/claude-config
git pull origin main  # Get updates from this repo

cd /path/to/team-project
git status .claude/  # Check for uncommitted team changes

# If clean, update
/path/to/claude-config/install.sh project

# Review changes
git diff .claude/

# Commit updates
git add .claude/
git commit -m "Update base workflow to claude-config v1.1.0"
git push
```

## Troubleshooting

### "Commands not available after installation"

**Solution**: Restart your Claude Code session
```bash
# Exit Claude, then restart
claude
```

### "Which installation do I have?"

**Check user/global**:
```bash
ls -la ~/.claude/commands/
```

**Check current project**:
```bash
ls -la .claude/commands/
```

### "Want to switch from user to project"

No problem! You can have both. They work together via the configuration hierarchy.

### "Accidentally installed to wrong location"

**Remove and reinstall**:
```bash
# Remove from wrong location
rm -rf ~/.claude/commands/ideate*
rm -rf ~/.claude/commands/spec

# Reinstall to correct location
./install.sh [user|project]
```

## Best Practices

1. **Start global, go project when teaming** - Install globally for yourself, then add to projects when collaborating

2. **Document team decisions** - If installing at project level, document the workflow in the project README

3. **Use local overrides** - Keep team settings in `settings.json`, personal tweaks in `settings.local.json`

4. **Version control wisely** - Commit team config, gitignore personal config

5. **Regular updates** - Update ClaudeKit monthly, update this config when improved commands are released

## Quick Reference

| Situation | Command | Location |
|-----------|---------|----------|
| Solo dev, want everywhere | `./install.sh user` | `~/.claude/` |
| Team project | `./install.sh project` | `./.claude/` |
| Both | Both commands | Both locations |
| Update global | `./install.sh user` again | `~/.claude/` |
| Update project | `./install.sh project` again | `./.claude/` |
| Remove global | `rm -rf ~/.claude/commands/ideate* ~/.claude/commands/spec` | N/A |
| Remove project | `rm -rf ./.claude/` | N/A |

---

**Still unsure?** Start with `./install.sh user` - you can always add project-level later!
