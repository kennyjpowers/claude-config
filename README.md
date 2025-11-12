# Claude Config - Hybrid Configuration for Claude Code + ClaudeKit

A comprehensive configuration repository that combines **ClaudeKit**, **custom agents/commands**, and **Claude Code official features** for an optimal AI-assisted development workflow.

## What This Repository Provides

This repository implements a **layered configuration approach**:

1. **ClaudeKit Foundation** (installed via npm) - 30+ agents, 20+ commands, 25+ hooks
2. **Custom Extensions** (this repo) - Domain-specific agents and workflow commands
3. **Official Claude Code Features** - Built-in capabilities and plugin system

All three layers work together seamlessly in Claude Code.

## Key Features

### ClaudeKit (npm package)
- 30+ specialized agents (TypeScript, React, Testing, Database, DevOps, etc.)
- 20+ workflow commands (/git:commit, /spec:create, /research, etc.)
- 25+ intelligent hooks (file-guard, linting, testing, checkpoints)
- Automated quality assurance and error prevention

### Custom Extensions (this repo)
- 4 workflow commands:
  - **/ideate**: Structured ideation with comprehensive documentation
  - **/ideate-to-spec**: Transform ideation into validated specification
  - **/spec:progress**: Track implementation progress and update task breakdowns
  - **/spec:doc-update**: Parallel documentation review based on specs
- Complete end-to-end workflow from ideation to deployment
- Example configurations for teams and individuals
- Uses ClaudeKit's 30+ agents for specialized tasks

### Official Claude Code Features
- 5-tier configuration hierarchy
- Project-level `.claude/` directories
- CLAUDE.md context files
- MCP server integration
- Plugin system

## Quick Start

### Option 1: Automated Installation (Recommended)

```bash
# Clone this repository
git clone https://github.com/kennethpriester/claude-config.git
cd claude-config

# Choose installation mode:

# Global (available in all projects)
./install.sh user

# OR

# Project-specific (for team sharing)
cd /path/to/your/project
/path/to/claude-config/install.sh project
```

**Which should I use?** See [Installation Guide](docs/INSTALLATION_GUIDE.md) for detailed guidance.

**Quick decision**:
- **Solo developer or want commands everywhere?** → `./install.sh user`
- **Team project or want version control?** → `./install.sh project`
- **Both?** → You can do both! They work together via configuration hierarchy.

The script will:
1. Check prerequisites (Node.js 18+, Claude Code CLI)
2. Install ClaudeKit globally via npm
3. Copy custom workflow commands
4. Set up configuration files
5. Run ClaudeKit setup

### Option 2: Manual Installation

```bash
# 1. Install ClaudeKit
npm install -g claudekit

# 2. Clone this repo
git clone https://github.com/kennethpriester/claude-config.git

# 3. Copy custom configuration to your project
cd your-project
cp -r ../claude-config/.claude/* .claude/

# 4. Initialize ClaudeKit
claudekit setup --yes

# 5. Verify installation
claudekit list agents
claudekit list commands
```

## Repository Structure

```
claude-config/
├── .claude/                          # Custom configuration (layers on ClaudeKit)
│   ├── commands/                     # Custom slash commands
│   │   ├── ideate.md                 # Structured ideation workflow
│   │   ├── ideate-to-spec.md         # Transform ideation to spec
│   │   └── spec/
│   │       └── doc-update.md         # Documentation review
│   ├── settings.json.example         # Example configuration
│   └── README.md                     # Component documentation
│
├── .claude-plugin/                   # Plugin metadata (optional)
│   └── plugin.json                   # For installing as Claude Code plugin
│
├── templates/                        # Configuration templates
│   ├── project-config/               # Project-level templates
│   │   ├── settings.json             # Team settings
│   │   ├── settings.local.json.example
│   │   ├── CLAUDE.md                 # Project instructions
│   │   ├── CLAUDE.local.md.example
│   │   └── .gitignore.example
│   └── user-config/                  # User-level templates
│       ├── settings.json             # Personal global settings
│       └── CLAUDE.md                 # Personal preferences
│
├── docs/                             # Documentation
│
├── install.sh                        # Installation script
├── README.md                         # This file
└── research.md                       # Detailed research & best practices
```

## Understanding the Hybrid Approach

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│  Layer 3: Custom (This Repo)        │  ← Domain-specific agents & commands
├─────────────────────────────────────┤
│  Layer 2: ClaudeKit (npm)           │  ← 30+ agents, 20+ commands, 25+ hooks
├─────────────────────────────────────┤
│  Layer 1: Claude Code (Official)    │  ← Base CLI, plugin system, MCP
└─────────────────────────────────────┘
```

### How They Work Together

| Feature | Claude Code | ClaudeKit | This Repo |
|---------|-------------|-----------|-----------|
| **Agents** | Built-in agents | typescript-expert, react-expert, database-expert, etc. (30+) | Uses ClaudeKit agents |
| **Commands** | `/init`, `/plugin` | /git:commit, /spec:create, /research, etc. (20+) | /ideate, /ideate-to-spec, /spec:progress, /spec:doc-update |
| **Hooks** | Hook system | file-guard, typecheck-changed, lint-changed, etc. (25+) | Uses ClaudeKit hooks via settings.json |
| **Config** | .claude/ hierarchy | Integrates with .claude/ | Custom commands in .claude/ |

### Configuration Hierarchy

Claude Code uses a 5-tier precedence system:

1. **Enterprise policies** (highest) - IT-managed, cannot be overridden
2. **CLI arguments** - Temporary session overrides
3. **Local settings** (`.claude/settings.local.json`) - Personal, gitignored
4. **Project settings** (`.claude/settings.json`) - Team, committed
5. **User settings** (`~/.claude/settings.json`) - Personal global defaults

## Available Components

### Custom Commands (This Repo)

#### /ideate
Structured ideation workflow that enforces complete investigation for any code-change task (bug fix or feature). Produces comprehensive ideation documentation including:
- Intent & assumptions
- Pre-reading log
- Codebase mapping
- Root cause analysis (for bugs)
- Research findings
- Clarification questions

**Usage:** `/ideate Fix chat UI auto-scroll bug when messages exceed viewport height`

#### /ideate-to-spec
Transform an ideation document into a validated, implementation-ready specification. This command:
1. Reads and synthesizes the ideation document
2. Interactively gathers decisions from the user
3. Creates a detailed specification using `/spec:create`
4. Validates it with `/spec:validate`
5. Presents a summary with next steps

**Usage:** `/ideate-to-spec docs/ideation/add-proxy-config-to-figma-plugin.md`

#### /spec:progress
Track implementation progress for a specification. Bridges the gap between `/spec:decompose` and `/spec:execute` by:
- Querying task status from STM (Simple Task Master)
- Generating detailed progress reports
- Updating task breakdown documents with completion status
- Providing clear visibility into completed, in-progress, and pending work
- Recommending next steps

**Usage:** `/spec:progress specs/add-user-auth-jwt.md`

#### /spec:doc-update
Review all documentation to identify what needs to be updated based on a new specification file. Launches parallel documentation expert agents to review each doc file for:
- Deprecated content
- Content requiring updates
- Missing content for new features

**Usage:** `/spec:doc-update specs/text-generator-spec.md`

### ClaudeKit Agents (30+)

**Build Tools:** webpack-expert, vite-expert

**Languages:** typescript-expert, typescript-build-expert, typescript-type-expert

**Frontend:** react-expert, react-performance-expert, nextjs-expert, css-styling-expert, accessibility-expert

**Testing:** testing-expert, jest-testing-expert, vitest-testing-expert, playwright-expert

**Database:** database-expert, postgres-expert, mongodb-expert

**DevOps:** docker-expert, github-actions-expert, devops-expert, git-expert

**Specialized:** ai-sdk-expert, nestjs-expert, kafka-expert, loopback-expert, nodejs-expert

**Utilities:** code-search, linting-expert, refactoring-expert, code-review-expert, research-expert

### ClaudeKit Commands (20+)

**Git Workflow:** /git:status, /git:commit, /git:checkout, /git:push, /git:ignore-init

**Specifications:** /spec:create, /spec:decompose, /spec:execute, /spec:validate

**Quality:** /code-review, /validate-and-fix

**Research:** /research

**Development:** /create-command, /create-subagent

**Checkpoints:** /checkpoint:restore

**Hooks:** /hook:disable, /hook:enable, /hook:status

### ClaudeKit Hooks (25+)

**PreToolUse:** file-guard (protects sensitive files)

**PostToolUse:** typecheck-changed, lint-changed, check-any-changed, test-changed, codebase-map-update, check-comment-replacement

**Stop:** create-checkpoint, check-todos, typecheck-project, lint-project, test-project, self-review

**UserPromptSubmit:** thinking-level, codebase-map

## Standard Workflow

This repository implements a complete end-to-end workflow for feature development:

```
┌─────────────────────────────────────────────────────────────────┐
│                    IDEATION PHASE                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   /ideate <task-brief>
                   (Custom Command)
                              │
                    Creates ideation doc
                    with research & analysis
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SPECIFICATION PHASE                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
          /ideate-to-spec <ideation-doc>
          (Custom, calls /spec:create & /spec:validate)
                              │
              Creates validated specification
                              │
                              ▼
            /spec:decompose <spec-file>
            (ClaudeKit Command)
                              │
              Breaks spec into tasks
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  IMPLEMENTATION PHASE                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            /spec:execute <spec-file>
            (ClaudeKit Command)
                              │
              Implements tasks
                              │
                              ▼
            /spec:progress <spec-file>
            (Custom Command)
                              │
        Tracks progress, updates task breakdown
                              │
                   ┌──────────┴──────────┐
                   │                     │
              Not Finished          Finished
                   │                     │
                   └──────────┬──────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETION PHASE                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
               /git:commit
               (ClaudeKit Command)
                              │
              Commits implementation
                              │
                              ▼
           /spec:doc-update <spec-file>
           (Custom Command)
                              │
        Reviews & updates documentation
                              │
                              ▼
               /git:commit
               (ClaudeKit Command)
                              │
           Commits doc updates
                              │
                              ▼
               /git:push
               (ClaudeKit Command)
                              │
            Pushes to remote
                              │
                              ▼
                          DONE! 🎉
```

### Key Workflow Steps

1. **Ideation** → Comprehensive investigation and research
2. **Specification** → Validated, implementation-ready spec
3. **Decomposition** → Tasks broken down with dependencies
4. **Implementation** → Iterative execution with progress tracking
5. **Completion** → Documentation updates and git workflow

## Usage Examples

### Complete Workflow Example

```bash
# Step 1: Start with ideation
/ideate Add user authentication with JWT tokens
# → Creates: docs/ideation/add-user-auth-jwt.md
#   Includes: investigation, research, clarifications

# Step 2: Transform to validated specification
/ideate-to-spec docs/ideation/add-user-auth-jwt.md
# → User makes decisions interactively
# → Creates: specs/add-user-auth-jwt.md (validated)

# Step 3: Break down into tasks
/spec:decompose specs/add-user-auth-jwt.md
# → Creates: specs/add-user-auth-jwt-tasks.md
#   Includes: phased tasks with dependencies

# Step 4: Start implementation
/spec:execute specs/add-user-auth-jwt.md
# → Implements tasks incrementally

# Step 5: Check progress
/spec:progress specs/add-user-auth-jwt.md
# → Shows: completion %, current phase, next tasks
# → Updates: task breakdown with status

# Step 6: Continue implementing (loop back to step 4 if needed)
/spec:execute specs/add-user-auth-jwt.md

# Step 7: Final progress check (should show 100%)
/spec:progress specs/add-user-auth-jwt.md

# Step 8: Commit implementation
/git:commit
# → Creates conventional commit with changes

# Step 9: Update documentation
/spec:doc-update specs/add-user-auth-jwt.md
# → Parallel agents review all docs
# → Identifies outdated content and missing docs

# Step 10: Commit documentation updates
/git:commit

# Step 11: Push to remote
/git:push
```

### Quick Start (Skip Ideation)

If you already know what you need:

```bash
# Start directly with spec creation
/spec:create Add user authentication with JWT tokens

# Then follow steps 3-11 above
```

### Updating Documentation After Implementation

```bash
# After implementing a feature via a spec
/spec:doc-update specs/add-user-auth-jwt.md

# This will:
# - Launch parallel documentation expert agents
# - Review all docs for outdated content
# - Identify missing documentation for new features
# - Provide prioritized recommendations
```

## Configuration

### Project Setup (Team)

```bash
cd your-project

# Initialize with ClaudeKit + custom config
./path/to/claude-config/install.sh project

# Customize settings
cp .claude/settings.json.example .claude/settings.json
# Edit .claude/settings.json for team

# Add to git
echo ".claude/settings.local.json" >> .gitignore
echo "CLAUDE.local.md" >> .gitignore
git add .claude/ CLAUDE.md .gitignore
git commit -m "Add Claude Code configuration"
```

### Personal Setup (Global)

```bash
# Install to ~/.claude
./path/to/claude-config/install.sh user

# Customize personal settings
cp ~/.claude/settings.json ~/.claude/settings.local.json
# Edit ~/.claude/settings.local.json for personal preferences
```

### Settings Management

**Team Settings** (`.claude/settings.json` - committed):
```json
{
  "permissions": {
    "allow": ["Read", "Edit", "Bash(git:*)"],
    "deny": [".env", "**/*.key", "secrets/"]
  },
  "hooks": {
    "PreToolUse": [{
      "matcher": "Read|Edit|Write",
      "hooks": [{"type": "command", "command": "claudekit-hooks run file-guard"}]
    }]
  }
}
```

**Personal Overrides** (`.claude/settings.local.json` - gitignored):
```json
{
  "environmentVariables": {
    "EDITOR": "code"
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
```

### Update Custom Configuration

```bash
# Pull latest from this repo
cd path/to/claude-config
git pull origin main

# Re-run installation to update
./install.sh project
```

### Validate Configuration

```bash
# Validate agents
claudekit lint-agents

# Validate commands
claudekit lint-commands

# List all components
claudekit list agents
claudekit list commands

# Check hook status
claudekit-hooks status

# Profile hook performance
claudekit-hooks profile
```

## Best Practices

### 1. Security First
- Always enable file-guard hook
- Never commit secrets to `.claude/settings.json`
- Use environment variable references: `"API_KEY": "${API_KEY}"`
- Keep `.env` files gitignored

### 2. Team Collaboration
- Commit `.claude/settings.json` and `CLAUDE.md` to git
- Gitignore `.claude/settings.local.json` and `CLAUDE.local.md`
- Document custom agents and commands in README
- Use PR reviews for configuration changes

### 3. Performance
- Profile hooks regularly: `claudekit-hooks profile`
- Keep UserPromptSubmit hooks under 10k characters
- Use `*-changed` hooks for fast feedback
- Use `*-project` hooks sparingly (slow but comprehensive)

### 4. Agent Management
- Start with 10-15 most relevant agents
- Add more as needed
- Remove unused agents to reduce context overhead
- Document agent purposes in `.claude/agents/README.md`

### 5. Context Optimization
- Keep CLAUDE.md focused and concise
- Use file references instead of embedding code
- Enable codebase-map hook for project structure
- Break large tasks into smaller steps

## Troubleshooting

### ClaudeKit Not Found

```bash
# Reinstall globally
npm install -g claudekit

# Check installation
which claudekit
claudekit --version
```

### Agents Not Appearing

```bash
# Verify agent files
ls -la .claude/agents/

# Validate agents
claudekit lint-agents

# Restart Claude Code session
```

### Hooks Not Running

```bash
# Check hook status
claudekit-hooks status

# Enable hooks
claudekit-hooks enable file-guard

# Verify settings.json syntax
cat .claude/settings.json | jq .

# Restart Claude Code session
```

### Settings Not Applied

- Check configuration hierarchy (local > project > user)
- Restart Claude Code session
- Validate JSON syntax: `jq . .claude/settings.json`
- Check for enterprise policies overriding settings

## Resources

### Official Documentation
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [ClaudeKit Documentation](https://docs.claudekit.cc/)
- [ClaudeKit GitHub](https://github.com/carlrannaberg/claudekit)

### This Repository
- [Installation Guide](docs/INSTALLATION_GUIDE.md) - When to use user vs project installation
- [Setup Guide](docs/SETUP_GUIDE.md) - Detailed setup instructions
- [Detailed Research](research.md) - Comprehensive analysis and validation
- [GitHub Issues](https://github.com/kennethpriester/claude-config/issues) - Report problems

### Community Resources
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)
- [ClaudeLog](https://claudelog.com/)
- [ClaudeKit Skills](https://github.com/mrgoonie/claudekit-skills)

## Contributing

Contributions welcome! Please:
1. Follow existing patterns and structure
2. Test changes thoroughly
3. Update documentation
4. Submit PRs with clear descriptions

## License

MIT License - feel free to use and modify for your projects.

## Acknowledgments

- **ClaudeKit** by Carl Rannaberg - Comprehensive toolkit foundation
- **Anthropic** - Claude Code CLI and official features
- Community contributors and examples

---

**Note**: This repository implements a validated, research-backed approach for managing Claude Code configuration. See [research.md](research.md) for detailed analysis, sources, and best practices.

## Why This Approach?

### vs. Git Submodules (Grok's Original Suggestion)
- ✅ Simpler: npm install vs. submodule complexity
- ✅ Standard: Familiar to all Node.js developers
- ✅ Easy updates: `npm update -g` vs. `git submodule update --remote`
- ✅ No merge conflicts with upstream
- ❌ Submodules add unnecessary complexity

### vs. Manual Configuration
- ✅ Automated setup via installation script
- ✅ Validated configurations from research
- ✅ Combines best of ClaudeKit + custom + official
- ✅ Easy to maintain and update

### vs. Plugin-Only Approach
- ✅ More flexible than plugins alone
- ✅ Can customize ClaudeKit features
- ✅ Works with npm-distributed tools
- ✅ Better for teams with specific needs

This hybrid approach provides the **best of all worlds**: ClaudeKit's mature foundation, your custom extensions, and official Claude Code features, all working together seamlessly.
