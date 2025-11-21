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
- 4 custom workflow commands:
  - **/ideate**: Structured ideation with comprehensive documentation
  - **/ideate-to-spec**: Transform ideation into validated specification
  - **/spec:feedback**: Post-implementation feedback with interactive decisions
  - **/spec:doc-update**: Parallel documentation review based on specs
- 4 enhanced spec command overrides (replace ClaudeKit versions):
  - **/spec:create**: Detects output path and creates specs in feature directories
  - **/spec:decompose**: Incremental mode preserves completed work, tags STM tasks
  - **/spec:execute**: Session resume capability with implementation tracking
  - **/spec:migrate**: Migrates existing specs to feature-directory structure
- Complete end-to-end workflow from ideation to deployment
- Example configurations for teams and individuals
- Uses ClaudeKit's 30+ agents for specialized tasks
- **Task tracking**: Integrates with [simple-task-master](https://github.com/carlrannaberg/simple-task-master) (stm) - use `stm list --pretty --tag feature:<slug>` to track progress

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

**Optional but recommended**: Install [simple-task-master](https://github.com/carlrannaberg/simple-task-master) for enhanced task tracking:
```bash
npm install -g simple-task-master
```
This enables `/spec:decompose` and `/spec:execute` to automatically track tasks with `stm list --pretty`.

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

## Document Organization

All documents related to a feature are organized in a single directory:

```
specs/
└── <feature-slug>/
    ├── 01-ideation.md          # Ideation and research
    ├── 02-specification.md     # Validated specification
    ├── 03-tasks.md             # Task breakdown
    ├── 04-implementation.md    # Implementation summary
    └── 05-feedback.md          # Post-implementation feedback log
```

**Benefits:**
- All related documents in one place
- Clear lifecycle progression (01 → 02 → 03 → 04)
- Easy to find and navigate
- Git-friendly tracking
- STM tasks tagged with `feature:<slug>` for filtering

**Example:**
```
specs/add-user-auth-jwt/
├── 01-ideation.md          # Created by /ideate
├── 02-specification.md     # Created by /ideate-to-spec → /spec:create
├── 03-tasks.md             # Created by /spec:decompose
├── 04-implementation.md    # Created by /spec:execute
└── 05-feedback.md          # Created by /spec:feedback (after testing)
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
└── docs/
    ├── DESIGN_RATIONALE.md          # Design validation & best practices
    └── ...
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
| **Commands** | `/init`, `/plugin` | /git:commit, /spec:create, /research, etc. (20+) | /ideate, /ideate-to-spec, /spec:doc-update + overrides for /spec:create, /spec:decompose, /spec:execute, /spec:migrate |
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

#### /spec:feedback
Process ONE specific piece of post-implementation feedback from testing or usage. This command:
1. Validates prerequisites (implementation must exist)
2. Prompts for detailed feedback description
3. Explores relevant code with targeted investigation
4. Optionally consults research-expert for solution approaches
5. Guides through interactive decisions (implement/defer/out-of-scope)
6. Updates spec changelog for "implement now" decisions
7. Creates STM tasks for deferred feedback
8. Logs all decisions in `05-feedback.md`

Integrates with incremental `/spec:decompose` and resume `/spec:execute` for seamless iteration.

**Usage:** `/spec:feedback specs/my-feature/02-specification.md`

#### /spec:doc-update
Review all documentation to identify what needs to be updated based on a new specification file. Launches parallel documentation expert agents to review each doc file for:
- Deprecated content
- Content requiring updates
- Missing content for new features

**Usage:** `/spec:doc-update specs/text-generator-spec.md`

### Enhanced Spec Commands (Overrides)

These commands override ClaudeKit's versions with enhanced feature-directory organization and STM integration:

#### /spec:create
Enhanced version that detects output paths and organizes specs in feature directories. Creates specs in `specs/<slug>/02-specification.md` format.

**Usage:** `/spec:create Add user authentication with JWT tokens`

#### /spec:decompose
Enhanced version with **incremental mode** that detects changelog updates and creates only new tasks while preserving completed work. Extracts feature slugs and tags all STM tasks with `feature:<slug>` for filtering. Creates task breakdown in `specs/<slug>/03-tasks.md` with re-decompose metadata.

**Usage:** `/spec:decompose specs/add-user-auth/02-specification.md`

**Incremental Mode:** Automatically detects when spec changelog has been updated after feedback and creates only new tasks for changes.

#### /spec:execute
Enhanced version with **session resume capability** that continues from previous progress. Reads implementation summary to skip completed tasks, resume in-progress work, and append new session history. Creates/updates `specs/<slug>/04-implementation.md` with cross-session context.

**Usage:** `/spec:execute specs/add-user-auth/02-specification.md`

**Resume Mode:** Automatically detects previous sessions and skips completed work, maintaining full implementation history.

**Session Continuity:** When you run `/spec:execute` multiple times on the same spec, it reads `04-implementation.md` to understand what work has already been completed. This allows you to:
- Work on large features across multiple sessions without re-doing completed tasks
- Return to implementation after testing/feedback cycles
- Maintain a complete history of all sessions (Session 1, Session 2, etc.)
- Seamlessly integrate feedback workflow: implement → test → `/spec:feedback` → `/spec:decompose` (incremental) → `/spec:execute` (resume)

**Track Progress:** `stm list --pretty --tag feature:add-user-auth` (replaces removed `/spec:progress`)

#### /spec:migrate
Migrates existing specs from flat structure to feature-directory structure. Moves specs, tasks, and ideation docs into organized `specs/<slug>/` directories and tags STM tasks.

**Usage:** `/spec:migrate`

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

**Specifications:** /spec:validate
- **Note:** This repo overrides `/spec:create`, `/spec:decompose`, `/spec:execute` with enhanced versions
- Enhanced versions add feature-directory organization and STM task tagging
- `/spec:migrate` is a custom addition for migrating existing specs
- Use `stm list --pretty --tag feature:<slug>` to track progress (replaces removed `/spec:progress`)

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
            (Custom Override - uses stm if installed)
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
            (Custom Override - uses stm if installed)
                              │
              Implements tasks
                              │
                              ▼
       stm list --pretty --tag feature:<slug>
              (Track progress)
                              │
        View task status and completion
                              │
                   ┌──────────┴──────────┐
                   │                     │
              Not Finished          Finished
                   │                     │
                   └──────────┬──────────┘
                              │
                              ▼
                    Manual Testing
                              │
                   Discover issues or
                   improvement opportunities
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FEEDBACK PHASE                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
           /spec:feedback <spec-file>
           (Custom Command - one item at a time)
                              │
            Process feedback item:
            • Code exploration
            • Optional research
            • Interactive decisions
                              │
                   ┌──────────┴──────────┬────────────┐
                   │                     │            │
              Implement Now           Defer     Out of Scope
                   │                     │            │
        Update spec changelog    Create STM task     Log only
                   │                     │            │
                   ▼                     │            │
       /spec:decompose (incremental)    │            │
                   │                     │            │
       /spec:execute (resume)           │            │
                   │                     │            │
                   └──────────┬──────────┴────────────┘
                              │
                   More feedback items? (repeat)
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
3. **Decomposition** → Tasks broken down with dependencies (uses stm if installed, tags with `feature:<slug>`)
4. **Implementation** → Iterative execution with stm task tracking via `stm list --pretty --tag feature:<slug>`
5. **Feedback** → Process post-implementation feedback with structured decisions (implement/defer/out-of-scope)
6. **Completion** → Documentation updates and git workflow

## Usage Examples

### Complete Workflow Example

```bash
# Step 1: Start with ideation
/ideate Add user authentication with JWT tokens
# → Creates: specs/add-user-auth-jwt/01-ideation.md
#   Includes: investigation, research, clarifications

# Step 2: Transform to validated specification
/ideate-to-spec specs/add-user-auth-jwt/01-ideation.md
# → User makes decisions interactively
# → Creates: specs/add-user-auth-jwt/02-specification.md (validated)

# Step 3: Break down into tasks
/spec:decompose specs/add-user-auth-jwt/02-specification.md
# → Creates: specs/add-user-auth-jwt/03-tasks.md
# → Creates STM tasks tagged with feature:add-user-auth-jwt

# Step 4: Start implementation
/spec:execute specs/add-user-auth-jwt/02-specification.md
# → Implements tasks incrementally, updating stm status

# Step 5: Check progress (can run anytime during implementation)
stm list --pretty --tag feature:add-user-auth-jwt
# → Shows: completion %, current phase, task status
#   Note: This replaces the removed /spec:progress command

# Step 6: Continue implementing (loop back to step 4 if needed)
/spec:execute specs/add-user-auth-jwt/02-specification.md

# Step 7: Final progress check (should show 100%)
stm list --pretty --tag feature:add-user-auth-jwt

# Step 8: Implementation summary created automatically
# → Creates: specs/add-user-auth-jwt/04-implementation.md

# Step 9: Manual testing (discover feedback items)
# Test the implemented feature manually
# Identify bugs, improvements, or missing functionality

# Step 10: Process feedback (repeat for each feedback item)
/spec:feedback specs/add-user-auth-jwt/02-specification.md
# → Interactive workflow:
#   1. Describe feedback item
#   2. Code exploration
#   3. Optional research
#   4. Make decision:
#      - Implement Now: Updates spec changelog
#      - Defer: Creates STM task for later
#      - Out of Scope: Logs decision only

# Step 11: If "Implement Now" was chosen, run incremental decompose
/spec:decompose specs/add-user-auth-jwt/02-specification.md
# → Incremental mode: preserves completed tasks, creates only new ones

# Step 12: Resume implementation for new tasks
/spec:execute specs/add-user-auth-jwt/02-specification.md
# → Resume mode: skips completed work, implements new feedback tasks

# Step 13: Repeat steps 9-12 until all feedback is addressed

# Step 14: Commit implementation
/git:commit
# → Creates conventional commit with changes

# Step 15: Update documentation
/spec:doc-update specs/add-user-auth-jwt/02-specification.md
# → Parallel agents review all docs
# → Identifies outdated content and missing docs

# Step 16: Commit documentation updates
/git:commit

# Step 17: Push to remote
/git:push

# All documents for this feature are now in: specs/add-user-auth-jwt/
# ├── 01-ideation.md
# ├── 02-specification.md
# ├── 03-tasks.md
# ├── 04-implementation.md
# └── 05-feedback.md
```

### Quick Start (Skip Ideation)

If you already know what you need:

```bash
# Start directly with spec creation
/spec:create Add user authentication with JWT tokens

# Then follow steps 3-11 above
```

### Migrating Existing Specs

If you have specs in the old flat structure:

```bash
# Migrate all existing specs to new structure
/spec:migrate

# This will:
# - Move specs/*.md to specs/<slug>/02-specification.md
# - Move specs/*-tasks.md to specs/<slug>/03-tasks.md
# - Move docs/ideation/*.md to specs/<slug>/01-ideation.md
# - Tag STM tasks with feature:<slug>
# - Generate migration report
```

### Updating Documentation After Implementation

```bash
# After implementing a feature via a spec
/spec:doc-update specs/add-user-auth-jwt/02-specification.md

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
- [Design Rationale](docs/DESIGN_RATIONALE.md) - Design validation and best practices
- [Feedback Workflow Guide](docs/guides/feedback-workflow-guide.md) - Complete guide to post-implementation feedback
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
