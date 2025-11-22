# Setup Guide: ClaudeKit + Custom Configuration

This guide explains how to set up the hybrid Claude Code configuration that combines ClaudeKit, your custom extensions, and official features.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Your Project                      │
│  ┌───────────────────────────────────────┐  │
│  │     Layer 3: Custom (This Repo)      │  │
│  │  - Custom agents                      │  │
│  │  - Custom commands                    │  │
│  │  - Custom workflows                   │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │     Layer 2: ClaudeKit (npm)         │  │
│  │  - 30+ specialized agents             │  │
│  │  - 20+ workflow commands              │  │
│  │  - 25+ intelligent hooks              │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │   Layer 1: Claude Code (Official)    │  │
│  │  - Base CLI                           │  │
│  │  - Plugin system                      │  │
│  │  - MCP integration                    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Quick Start

### Step 1: Install ClaudeKit

```bash
# Install globally via npm
npm install -g claudekit

# Verify installation
claudekit --version
```

### Step 2: Clone This Repository

```bash
git clone https://github.com/kennyjpowers/claude-flow.git.git
cd claude-config
```

### Step 3: Install to Your Project

```bash
# Automated installation
./install.sh project /path/to/your/project

# Or install to user directory (global)
./install.sh user
```

### Step 4: Verify Installation

```bash
cd /path/to/your/project

# List all available agents
claudekit list agents

# List all available commands
claudekit list commands

# Check hook status
claudekit-hooks status
```

## Detailed Setup

### For New Projects

```bash
# 1. Create project directory
mkdir my-project
cd my-project

# 2. Initialize git
git init

# 3. Install ClaudeKit
npm install -g claudekit

# 4. Clone and run installer
git clone https://github.com/kennyjpowers/claude-flow.git.git ~/.claude-config
~/.claude-config/install.sh project .

# 5. Customize configuration
cp .claude/settings.json.example .claude/settings.json
# Edit .claude/settings.json

# 6. Create CLAUDE.md
cat > CLAUDE.md << 'EOF'
# My Project

## Overview
[Your project description]

## Development Commands
- `npm run dev` - Start development server
- `npm test` - Run tests

## Coding Standards
[Your standards]
EOF

# 7. Add to git
echo ".claude/settings.local.json" >> .gitignore
echo "CLAUDE.local.md" >> .gitignore
git add .claude/ CLAUDE.md .gitignore
git commit -m "Initialize Claude Code configuration"

# 8. Start coding with Claude
claude
```

### For Existing Projects

```bash
cd your-existing-project

# 1. Install ClaudeKit
npm install -g claudekit

# 2. Backup existing .claude directory (if it exists)
[ -d .claude ] && mv .claude .claude.backup

# 3. Clone and run installer
git clone https://github.com/kennyjpowers/claude-flow.git.git ~/.claude-config
~/.claude-config/install.sh project .

# 4. Merge with backup (if you had one)
if [ -d .claude.backup ]; then
    cp -n .claude.backup/* .claude/ 2>/dev/null || true
    echo "Merged with existing configuration. Review .claude/ for duplicates."
fi

# 5. Validate
claudekit lint-agents
claudekit lint-commands

# 6. Commit changes
git add .claude/
git commit -m "Add ClaudeKit + custom configuration"
```

### For Team Environments

```bash
# 1. One team member sets up configuration
cd team-project
~/.claude-config/install.sh project .

# 2. Customize for team
# Edit .claude/settings.json with team standards
# Create CLAUDE.md with project context

# 3. Commit to repository
git add .claude/ CLAUDE.md
git commit -m "Add team Claude Code configuration"
git push origin main

# 4. Other team members
# After pulling the repository:
npm install -g claudekit
claudekit setup --yes

# 5. Personal overrides (optional)
cp .claude/settings.json .claude/settings.local.json
# Edit .claude/settings.local.json for personal preferences
# This file is gitignored
```

## Configuration Files

### .claude/settings.json (Team Settings)

**Purpose**: Team-shared settings committed to git

**Example**:
```json
{
  "permissions": {
    "allow": ["Read", "Edit", "Write", "Bash(git:*)", "Bash(npm:*)"],
    "deny": [".env", "**/*.key", "secrets/**"]
  },
  "environmentVariables": {
    "NODE_ENV": "development"
  },
  "hooks": {
    "PreToolUse": [{
      "matcher": "Read|Edit|Write|Bash",
      "hooks": [{"type": "command", "command": "claudekit-hooks run file-guard"}]
    }],
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [
        {"type": "command", "command": "claudekit-hooks run typecheck-changed"},
        {"type": "command", "command": "claudekit-hooks run lint-changed"}
      ]
    }]
  }
}
```

### .claude/settings.local.json (Personal Settings)

**Purpose**: Personal overrides, gitignored

**Example**:
```json
{
  "environmentVariables": {
    "EDITOR": "code",
    "MY_CUSTOM_VAR": "my-value"
  },
  "hooks": {
    "Stop": [{
      "hooks": [{"type": "command", "command": "echo 'Session ended'"}]
    }]
  }
}
```

### CLAUDE.md (Project Context)

**Purpose**: Master project documentation for Claude

**Example**:
```markdown
# Project Name

## Architecture
- Frontend: React 18 with TypeScript
- Backend: Node.js Express API
- Database: PostgreSQL

## Development Commands
```bash
npm run dev      # Start development server
npm test         # Run tests
npm run lint     # Run linter
```

## Coding Standards
- Use TypeScript strict mode
- Follow Airbnb style guide
- Write tests for all business logic
- Minimum 80% code coverage

## Git Workflow
- Branch naming: feature/*, fix/*, hotfix/*
- Commit format: Conventional Commits
- PRs require 1 approval + passing CI
```

### .gitignore (Git Exclusions)

**Add these lines**:
```gitignore
# Claude Code local settings
.claude/settings.local.json
CLAUDE.local.md

# Environment files
.env
.env.*

# Secrets
secrets/
credentials/
**/*.key
**/*.pem
```

## Using the Configuration

### Available Custom Commands

```bash
# Start Claude Code
claude

# Use custom workflow commands
/ideate Fix chat UI auto-scroll bug       # Structured ideation
/ideate-to-spec docs/ideation/fix.md     # Transform to spec
/spec:progress specs/my-spec.md          # Track implementation progress
/spec:doc-update specs/my-spec.md        # Documentation review
```

### Using ClaudeKit Agents

Claude will automatically use ClaudeKit's 30+ agents for specialized tasks:

```bash
# ClaudeKit agents work automatically
"Please review the authentication module for security vulnerabilities"
# → Uses code-review-expert or security-focused agents

"Optimize the dashboard component for better performance"
# → Uses react-performance-expert

"Create comprehensive tests for the UserService class"
# → Uses testing-expert or jest-testing-expert
```

### Available ClaudeKit Commands

```bash
# Git workflow
/git:status        # Intelligent git status with commit suggestions
/git:commit        # Create commit following project conventions
/git:checkout feature/my-feature  # Create and switch to branch

# Specifications
/spec:create Add payment processing  # Create feature spec
/spec:execute specs/payment.md       # Implement specification

# Research
/research How does OAuth 2.0 work?  # Deep research with citations

# Development
/create-command my-workflow  # Create custom command
/create-subagent my-expert  # Create custom agent

# Quality
/validate-and-fix           # Run tests and linting
```

### Available ClaudeKit Hooks

**Active by default** (via settings.json):

- **file-guard**: Protects sensitive files (PreToolUse)
- **typecheck-changed**: Type checks modified files (PostToolUse)
- **lint-changed**: Lints modified files (PostToolUse)
- **check-any-changed**: Blocks TypeScript `any` types (PostToolUse)
- **create-checkpoint**: Auto-saves work (Stop)
- **check-todos**: Identifies TODOs (Stop)
- **thinking-level**: Assesses cognitive depth (UserPromptSubmit)

**Available but not enabled**:

- test-changed: Run tests on changed files
- test-project: Run full test suite
- lint-project: Lint entire project
- typecheck-project: Type check entire project
- self-review: Automated code review
- codebase-map: Generate project structure

## Customization

### Add Your Own Agent (Optional)

If you need project-specific agents beyond ClaudeKit's 30+:

```bash
# Create agents directory
mkdir -p .claude/agents

# Create agent file
cat > .claude/agents/my-domain-expert.md << 'EOF'
---
name: my-domain-expert
description: Expert in my-domain patterns and best practices
tools: Read, Grep, Write, Edit
model: sonnet
---

You are an expert in my-domain with deep knowledge of...

## Your Responsibilities
- Validate my-domain configurations
- Review code for my-domain best practices
- Suggest optimizations

## Constraints
- Always check for X before Y
- Use PROACTIVELY when you detect Z
EOF

# Validate
claudekit lint-agents

# Test
claude
# Then ask: "Please review my-domain code"
```

### Add Your Own Command

```bash
# Create command file
cat > .claude/commands/deploy.md << 'EOF'
---
name: deploy
description: Deploy to specified environment
---

Deploy the application to: $ARGUMENTS

## Steps:
1. Run tests: `npm test`
2. Build: `npm run build`
3. Deploy: `npm run deploy:$ARGUMENTS`
4. Verify deployment health

Provide deployment summary and any issues encountered.
EOF

# Validate
claudekit lint-commands

# Test
claude
# Then use: /deploy staging
```

### Enable Additional Hooks

```bash
# Enable test-changed hook
# Edit .claude/settings.json, add to PostToolUse:
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [
        {"type": "command", "command": "claudekit-hooks run typecheck-changed"},
        {"type": "command", "command": "claudekit-hooks run lint-changed"},
        {"type": "command", "command": "claudekit-hooks run test-changed"}  # Add this
      ]
    }]
  }
}
```

## Maintenance

### Update ClaudeKit

```bash
# Check for updates
npm outdated -g | grep claudekit

# Update to latest
npm update -g claudekit

# Verify
claudekit --version
```

### Update Custom Configuration

```bash
# Pull latest from this repo
cd ~/.claude-config
git pull origin main

# Re-run installation
./install.sh project /path/to/your/project
```

### Validate Configuration

```bash
# Run all validation checks
claudekit lint-agents
claudekit lint-commands
claudekit-hooks status

# Profile hook performance
claudekit-hooks profile

# List all components
claudekit list agents
claudekit list commands
```

## Troubleshooting

### Common Issues

**Issue**: `claudekit: command not found`

```bash
# Solution 1: Reinstall
npm install -g claudekit

# Solution 2: Check npm prefix
npm config get prefix
# Add to PATH if needed
export PATH="$PATH:$(npm config get prefix)/bin"
```

**Issue**: Agents not appearing

```bash
# Solution: Restart Claude Code session
# Exit Claude, then restart
claude
```

**Issue**: Hooks not running

```bash
# Check status
claudekit-hooks status

# Enable specific hook
claudekit-hooks enable file-guard

# Verify settings.json syntax
cat .claude/settings.json | jq .

# Restart Claude Code
```

**Issue**: Settings not applied

- Check hierarchy: local > project > user
- Restart Claude Code session
- Validate JSON: `jq . .claude/settings.json`

## Best Practices

1. **Start Simple**: Begin with file-guard hook only, add more as needed
2. **Profile Performance**: Run `claudekit-hooks profile` regularly
3. **Document Customizations**: Keep `.claude/README.md` updated
4. **Version Control**: Commit `.claude/settings.json`, gitignore `.claude/settings.local.json`
5. **Team Alignment**: Document setup in project README
6. **Regular Updates**: Update ClaudeKit monthly
7. **Validate Changes**: Run lint commands before committing

## Support

- **This Repository**: [GitHub Issues](https://github.com/kennyjpowers/claude-flow.git/issues)
- **ClaudeKit**: [GitHub](https://github.com/carlrannaberg/claudekit) | [Docs](https://docs.claudekit.cc/)
- **Claude Code**: [Docs](https://docs.claude.com/en/docs/claude-code/)

---

**Last Updated**: November 12, 2025
