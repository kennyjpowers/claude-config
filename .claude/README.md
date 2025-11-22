# .claude/ Directory

This directory contains custom commands and settings distributed via the **claudeflow** npm package. These commands work alongside ClaudeKit to provide a complete workflow orchestration layer.

## Structure

- **commands/** - Custom slash commands for project workflows
- **settings.json.example** - Example hook and permission configuration

## How It Works

This configuration is designed to **layer on top of ClaudeKit**, not replace it:

1. **ClaudeKit** (installed as dependency) provides 30+ agents, 20+ commands, and 25+ hooks
2. **claudeflow** (this package) adds custom workflow commands specific to feature development
3. Both work together seamlessly in Claude Code

## Available Custom Commands

### /ideate
Structured ideation workflow that enforces complete investigation for any code-change task (bug fix or feature). Creates comprehensive ideation documentation.

**Usage**: `/ideate Fix chat UI auto-scroll bug when messages exceed viewport height`

### /ideate-to-spec
Transform an ideation document into a validated, implementation-ready specification. Bridges the gap between ideation and implementation with automatic open questions resolution.

**Features:**
- Extracts decisions from ideation clarifications
- Builds detailed spec via `/spec:create`
- **Automatically resolves open questions interactively**
- Validates completeness via `/spec:validate`
- Loops until all questions answered
- Preserves audit trail in spec file

**Interactive Steps:**
1. Answer ideation clarifications (text-based)
2. System creates specification
3. **System detects open questions**
4. **Answer each question interactively (with context)**
5. **Spec updated with strikethrough format**
6. **Re-validation confirms completeness**
7. Summary shows resolved questions

**Usage**: `/ideate-to-spec specs/<slug>/01-ideation.md`

**Interactive Question Resolution:**
When the generated specification contains open questions, the system:
- Parses the "Open Questions" section
- Presents questions one at a time with progress ("Question 3 of 12")
- Shows context and available options for each question
- Supports multi-select questions (e.g., "Which package managers?")
- Updates spec with strikethrough answers (preserves original context)
- Re-validates after answering questions
- Loops until all questions resolved
- Skips already-answered questions (re-entrant support)

**Key Behaviors:**
- **Save-as-you-go:** Each answer is saved immediately to the spec file, enabling recovery if interrupted
- **Backward compatible:** Specs without "Open Questions" sections skip interactive resolution entirely
- **External edit detection:** Re-parses spec on each iteration to handle manual changes gracefully

**Answer Recording Format:**

Questions are marked as resolved using strikethrough format:

```markdown
1. ~~**ClaudeKit Version Compatibility**~~ (RESOLVED)
   **Answer:** Use caret range (^1.0.0)
   **Rationale:** Automatic updates, test compatibility in CI/CD

   Original context preserved:
   - Option A: Pin exact version
   - Option B: Use caret range
   - Recommendation: Option B
```

This format provides a complete audit trail showing both the original question and the final decision.

### /spec:feedback
Process ONE specific piece of post-implementation feedback with a structured 7-step workflow. After manual testing reveals issues or improvement opportunities, this command:

1. Validates prerequisites (implementation must exist)
2. Collects detailed feedback description
3. Explores relevant code with targeted investigation
4. Optionally consults research-expert for solution approaches
5. Guides through interactive decisions (implement now/defer/out-of-scope)
6. Updates spec changelog for "implement now" decisions
7. Creates STM tasks for deferred items or logs rejected feedback

Seamlessly integrates with incremental `/spec:decompose` and resume `/spec:execute` for feedback iteration cycles.

**Usage**: `/spec:feedback specs/add-user-auth/02-specification.md`

### /spec:doc-update
Review all documentation to identify what needs to be updated based on a new specification file. Launches parallel documentation expert agents.

**Usage**: `/spec:doc-update specs/text-generator-spec.md`

## Enhanced Spec Commands (Overrides)

These commands override ClaudeKit versions with enhanced features:

### /spec:create
Enhanced with feature-directory awareness and automatic output path detection. Creates specifications in `specs/<slug>/02-specification.md` format instead of flat structure.

**Usage**: `/spec:create Add user authentication with JWT tokens`

### /spec:decompose
Enhanced with incremental mode that preserves completed work and creates only new tasks when spec changelog is updated. Tags all STM tasks with `feature:<slug>` for filtering.

**Usage**: `/spec:decompose specs/add-user-auth/02-specification.md`

### /spec:execute
Enhanced with resume capability that continues from previous sessions, skipping completed work and maintaining implementation history. Reads `04-implementation.md` for session continuity.

**Usage**: `/spec:execute specs/add-user-auth/02-specification.md`

### /spec:migrate
Migrates existing specs from flat structure (`specs/*.md`) to feature-directory structure (`specs/<slug>/02-specification.md`). Tags existing STM tasks with `feature:<slug>`.

**Usage**: `/spec:migrate`

## Installation

This configuration is distributed as part of the **claudeflow** npm package.

**Install claudeflow:**
```bash
# Using npm (recommended)
npm install -g @33strategies/claudeflow

# Using yarn
yarn global add @33strategies/claudeflow

# Using pnpm
pnpm add -g @33strategies/claudeflow
```

**Run setup:**
```bash
claudeflow setup    # Interactive mode (prompts for global or project)
```

**Choose installation mode:**
- **Global:** Install to `~/.claude/` (available in all projects)
- **Project:** Install to `./.claude/` (this project only)

For detailed installation instructions, see [docs/INSTALLATION_GUIDE.md](../docs/INSTALLATION_GUIDE.md).

## Troubleshooting

If commands aren't loading or you encounter issues, run the diagnostic command:

```bash
claudeflow doctor
```

This checks:
- ✓ Node.js version (requires 22.14+)
- ✓ npm availability
- ✓ Claude Code CLI installation
- ✓ ClaudeKit installation (automatic dependency)
- ✓ .claude/ directory structure
- ✓ Command files presence (8/8 required)

The doctor command provides specific recommendations for any issues found.

**Common issues:**
- **"Commands not loading"** - Run `claudeflow doctor`, restart Claude Code
- **"ClaudeKit not found"** - Should install automatically; manual: `npm install -g claudekit`
- **"Node.js too old"** - Requires Node.js 22.14+, install from https://nodejs.org

For comprehensive troubleshooting, see [README.md](../README.md#troubleshooting).

## Migration from install.sh

If you previously installed using install.sh:

1. **Remove old installation:**
   ```bash
   # For global installation
   rm -rf ~/.claude

   # For project installation
   rm -rf ./.claude
   ```

2. **Install via npm:**
   ```bash
   npm install -g @33strategies/claudeflow
   ```

3. **Run setup:**
   ```bash
   # For global (if you used install.sh user)
   claudeflow setup --global

   # For project (if you used install.sh project)
   claudeflow setup --project
   ```

4. **Verify installation:**
   ```bash
   claudeflow doctor
   ```

## Customization

1. Copy `settings.json.example` to `settings.json` and modify for your needs
2. Add your own commands to the `commands/` directory
3. Commit `settings.json` for team sharing, or use `settings.local.json` for personal settings

## Integration with ClaudeKit

These custom commands complement ClaudeKit's features:

| Feature | ClaudeKit Provides | This Config Adds |
|---------|-------------------|------------------|
| **Agents** | typescript-expert, react-expert, testing-expert, etc. (30+) | (Uses ClaudeKit agents) |
| **Commands** | /git:commit, /spec:create, /research, etc. (20+) | /ideate, /ideate-to-spec, /spec:feedback, /spec:doc-update |
| **Hooks** | file-guard, typecheck-changed, lint-changed, etc. (25+) | (Uses ClaudeKit hooks via settings.json) |

## Maintenance

**Update claudeflow to latest version:**
```bash
# Using npm
npm update -g @33strategies/claudeflow

# Using yarn
yarn global upgrade @33strategies/claudeflow

# Using pnpm
pnpm update -g @33strategies/claudeflow
```

**Verify installation health:**
```bash
claudeflow doctor
```

**Note:** ClaudeKit is installed automatically as a dependency of claudeflow and will be updated when you update claudeflow.
