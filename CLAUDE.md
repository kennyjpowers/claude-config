# claudeflow - AI-Assisted Development Workflow

## Project Overview

**claudeflow** is a workflow orchestration npm package for Claude Code that provides a complete end-to-end feature development lifecycle for AI-assisted development. It layers custom workflow commands on top of ClaudeKit (30+ agents, 20+ commands, 25+ hooks) and Claude Code's official CLI.

**Version:** 1.2.0 (November 21, 2025)
**Package:** @33strategies/claudeflow
**Distribution:** npm, yarn, pnpm

## Architecture

Three-layer system:
1. **Claude Code (Official)** - Base CLI, plugin system, MCP integration
2. **ClaudeKit (npm)** - 30+ specialized agents, workflow commands, intelligent hooks
3. **claudeflow (npm)** - Domain-specific workflow extensions, end-to-end feature lifecycle

**System Requirements:**
- Node.js 22.14+ (ClaudeKit dependency requirement)
- npm/yarn/pnpm (any package manager)
- Claude Code CLI (runtime environment)

See [docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) for detailed prerequisites and installation instructions.

## Core Workflow

Complete feature lifecycle in 6 phases:

```
IDEATION → SPECIFICATION → DECOMPOSITION → IMPLEMENTATION → FEEDBACK → COMPLETION
```

### Phase 1: Ideation
- **Command:** `/ideate <task-brief>`
- **Output:** `specs/<slug>/01-ideation.md`
- **Purpose:** Enforce complete investigation before code changes
- **Includes:** Intent, pre-reading, codebase mapping, root cause analysis, research, clarifications

### Phase 2: Specification
- **Command:** `/ideate-to-spec <path-to-ideation>`
- **Output:** `specs/<slug>/02-specification.md`
- **Purpose:** Transform ideation into validated technical specification
- **Process:** Extract decisions → build spec → validate completeness

### Phase 3: Decomposition
- **Command:** `/spec:decompose <path-to-spec>`
- **Output:** `specs/<slug>/03-tasks.md` + STM tasks
- **Purpose:** Break specification into actionable tasks
- **Critical:** Tasks tagged with `feature:<slug>` for filtering
- **Pattern:** Full implementation details copied into tasks (NOT summaries)

### Phase 4: Implementation
- **Command:** `/spec:execute <path-to-spec>`
- **Output:** `specs/<slug>/04-implementation.md`
- **Purpose:** Implement tasks incrementally with session continuity
- **Process:** For each task: implement → test → code review → fix → commit
- **Tracks:** Progress, files modified, tests added, known issues, next steps

### Phase 5: Feedback
- **Command:** `/spec:feedback <path-to-spec>`
- **Output:** `specs/<slug>/05-feedback.md`
- **Purpose:** Process post-implementation feedback with structured decisions
- **Process:** One feedback item at a time → explore code → optional research → interactive decisions → take action based on outcome
- **Decision Outcomes:**
  - **Implement Now:** Update spec changelog → incremental `/spec:decompose` → resume `/spec:execute`
  - **Defer:** Create STM task for future consideration → log in feedback file
  - **Out of Scope:** Log decision with rationale → no further action
- **Integration:** Works with incremental `/spec:decompose` and resume `/spec:execute`

### Phase 6: Completion
- **Commands:** `/git:commit`, `/spec:doc-update`, `/git:push`
- **Purpose:** Finalize changes, update documentation, push to remote

## Key Commands

### Custom Commands (4)
| Command | Purpose |
|---------|---------|
| `/ideate <task-brief>` | Structured investigation workflow |
| `/ideate-to-spec <path>` | Transform ideation → validated spec |
| `/spec:feedback <path>` | Post-implementation feedback processing |
| `/spec:doc-update <path>` | Review docs with parallel agents |

### Command Overrides (4)
Enhanced versions of ClaudeKit commands:

| Command | Enhancement |
|---------|------------|
| `/spec:create <desc>` | Feature-directory aware with output path detection |
| `/spec:decompose <path>` | Incremental mode: preserves completed work, creates only new tasks |
| `/spec:execute <path>` | Resume mode: continues from previous session, skips completed work |
| `/spec:migrate` | Convert old flat structure to feature directories |

### Progress Tracking
```bash
# View all tasks for a feature
stm list --pretty --tag feature:<slug>

# View by status
stm list --status pending --tag feature:<slug>
stm list --status done --tag feature:<slug>
```

## Document Organization

**Feature-Based Directories** - All docs for a feature in one place:

```
specs/<feature-slug>/
├── 01-ideation.md          # Investigation & research
├── 02-specification.md     # Technical specification
├── 03-tasks.md             # Task breakdown
├── 04-implementation.md    # Progress tracking
└── 05-feedback.md          # Post-implementation feedback log
```

**Benefits:**
- Single source of truth per feature
- Clear lifecycle progression (01 → 02 → 03 → 04)
- Easy to find related documents
- Git-friendly tracking

## Important Conventions

### Content Preservation Pattern
**CRITICAL:** When creating tasks, copy full implementation details from spec - DO NOT summarize or reference.

```bash
# WRONG ❌
stm add "Task" --details "See spec section 3"

# CORRECT ✅
stm add "Task" --details "[Full code blocks and details copied here]"
```

### Task Tagging
All tasks MUST be tagged with `feature:<slug>`:
```bash
stm add "Task" --tags "feature:my-feature,phase1,high-priority"
```

### Configuration Hierarchy
5-tier precedence (highest to lowest):
1. Enterprise policies
2. CLI arguments
3. Local settings (`.claude/settings.local.json` - gitignored)
4. Project settings (`.claude/settings.json` - committed)
5. User settings (`~/.claude/settings.json` - global)

### Specification Requirements
Valid specs must include 18 sections:
- Title, status, overview, problem, goals, non-goals
- Dependencies, design, UX, testing, performance, security
- Documentation, phases, open questions, references
- NO time/effort estimations

### Testing Convention
- Each test has purpose comment explaining why it exists
- Tests validate real behavior, not just passing
- Include edge cases to catch regressions
- Minimum 80% coverage on business logic

### Code Review Pattern
Two-pass review required:
1. **Completeness Check** - All spec requirements implemented?
2. **Quality Check** - Code quality, security, error handling, coverage

Tasks marked DONE only when:
- Implementation COMPLETE
- All CRITICAL issues fixed
- All tests passing
- Quality standards met

### Commit Convention
Follow conventional commits:
```
<type>(<scope>): <description>

<body>
<footer>
```
Types: feat, fix, docs, style, refactor, test, chore

## Directory Structure

```
claudeflow/                    # npm package (@33strategies/claudeflow)
├── package.json               # npm package metadata
├── bin/
│   └── claudeflow.js          # CLI entry point
├── lib/
│   ├── setup.js               # Installation logic
│   ├── doctor.js              # Diagnostics
│   └── utils/                 # Cross-platform utilities
├── .claude/                   # Distributed in package
│   ├── commands/              # Custom slash commands
│   │   ├── ideate.md
│   │   ├── ideate-to-spec.md
│   │   └── spec/              # Spec command overrides
│   ├── settings.json.example  # Configuration template
│   └── README.md
├── templates/
│   ├── project-config/        # Team-level templates
│   └── user-config/           # Personal templates
├── specs/                     # Feature specifications (not in package)
│   └── <feature-slug>/        # Feature directory
├── docs/                      # Documentation
├── LICENSE                    # MIT License
├── CHANGELOG.md               # Auto-generated
└── CLAUDE.md                  # This file
```

## ClaudeKit Agents Available

**Build Tools:** webpack-expert, vite-expert
**Languages:** typescript-expert, typescript-build-expert, typescript-type-expert
**Frontend:** react-expert, react-performance-expert, nextjs-expert, css-styling-expert, accessibility-expert
**Testing:** testing-expert, jest-testing-expert, vitest-testing-expert, playwright-expert
**Database:** database-expert, postgres-expert, mongodb-expert
**DevOps:** docker-expert, github-actions-expert, devops-expert, git-expert
**Specialized:** ai-sdk-expert, nestjs-expert, kafka-expert, loopback-expert, nodejs-expert, code-review-expert, refactoring-expert, research-expert

## Configuration Hooks

From `settings.json.example`:

```json
{
  "PreToolUse": ["file-guard"],
  "PostToolUse": ["typecheck-changed", "lint-changed", "test-changed"],
  "Stop": ["create-checkpoint", "check-todos"],
  "UserPromptSubmit": ["thinking-level"]
}
```

## Installation

**Quick Install:**
```bash
npm install -g @33strategies/claudeflow
claudeflow setup                    # Interactive mode
# OR: claudeflow setup --global     # Install to ~/.claude/
# OR: claudeflow setup --project    # Install to ./.claude/
```

**Alternative Package Managers:**
```bash
yarn global add @33strategies/claudeflow
pnpm add -g @33strategies/claudeflow
```

**Diagnostics:**
```bash
claudeflow doctor                   # Verify installation health
```

**For detailed installation instructions, troubleshooting, and migration from install.sh, see:**
- [docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md) - Complete installation guide
- [README.md](README.md#troubleshooting) - Troubleshooting section

## Optional Enhancements

**Recommended:** Install simple-task-master for persistent task tracking:
```bash
npm install -g simple-task-master
```

## Quick Reference

### First-Time Setup
```bash
npm install -g @33strategies/claudeflow
claudeflow setup
claudeflow doctor    # Verify installation
```

### Standard Workflow
```bash
/ideate <task-brief>
/ideate-to-spec specs/<slug>/01-ideation.md
/spec:decompose specs/<slug>/02-specification.md
/spec:execute specs/<slug>/02-specification.md
stm list --pretty --tag feature:<slug>  # Track progress

# After manual testing, process feedback
/spec:feedback specs/<slug>/02-specification.md  # One item at a time
# (Choose: implement/defer/out-of-scope)
# If "implement": spec updated, then run:
/spec:decompose specs/<slug>/02-specification.md  # Incremental mode
/spec:execute specs/<slug>/02-specification.md    # Resume mode

# Final steps
/spec:doc-update specs/<slug>/02-specification.md
/git:commit
/git:push
```

### Quick Start (Skip Ideation)
```bash
/spec:create <description>
/spec:decompose specs/<slug>/02-specification.md
/spec:execute specs/<slug>/02-specification.md
```

### Migrate Existing Project
```bash
/spec:migrate
```

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Comprehensive guide |
| `CHANGELOG.md` | Version history |
| `docs/DESIGN_RATIONALE.md` | Design validation and best practices |
| `.claude/README.md` | Component documentation |
| `docs/INSTALLATION_GUIDE.md` | Detailed installation guidance |
| `templates/*/CLAUDE.md` | Context templates |

## Best Practices

1. **Security First** - Enable file-guard, never commit secrets
2. **Team Collaboration** - Commit settings.json and CLAUDE.md, gitignore local overrides
3. **Content Preservation** - Copy full details into tasks, not summaries
4. **Task Organization** - Always tag with `feature:<slug>`
5. **Session Continuity** - `/spec:execute` reads previous progress
6. **Documentation Updates** - Use `/spec:doc-update` after implementation

## Common Issues

**Installation problems?** Run `claudeflow doctor` for diagnostics
**Commands not loading?** Verify with `claudeflow doctor`, restart Claude Code
**ClaudeKit not found?** Should install automatically; manual: `npm install -g claudekit`
**Tasks not showing in STM?** Install simple-task-master: `npm install -g simple-task-master`
**Hooks not running?** Check settings precedence (local overrides project)
**Migration needed?** Use `/spec:migrate` to convert old structure

**For comprehensive troubleshooting, see [README.md](README.md#troubleshooting)**

## Version History

**v1.2.0 (Nov 21, 2025):**
- **Distribution:** Published to npm as @33strategies/claudeflow
- **Installation:** Cross-platform CLI (`claudeflow setup`) replaces install.sh
- **Diagnostics:** New `claudeflow doctor` command
- **Updates:** Automatic weekly update notifications
- **CI/CD:** Automated releases via semantic-release with npm provenance
- **Platforms:** Full Windows, macOS, Linux support
- **Package Managers:** Works with npm, yarn, pnpm
- **Feedback Workflow:** New `/spec:feedback` command for post-implementation feedback
- **Incremental Mode:** `/spec:decompose` preserves completed work
- **Resume Mode:** `/spec:execute` session continuity across runs
- **Feedback Log:** New `05-feedback.md` format
- **Integration:** Seamless feedback → decompose → execute loop
- **License:** MIT License
- **Security:** npm provenance attestations (SLSA Level 2)

**v1.1.0 (Nov 21, 2025):**
- Feature-based directory structure
- Removed `/spec:progress` (use STM instead)
- STM task tagging with `feature:<slug>`
- Session continuity in `/spec:execute`
- Migration command `/spec:migrate`
- Enhanced overrides for spec commands
