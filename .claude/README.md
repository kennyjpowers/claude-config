# Custom Claude Code Configuration

This directory contains custom commands and settings that work alongside ClaudeKit.

## Structure

- **commands/** - Custom slash commands for project workflows
- **settings.json.example** - Example hook and permission configuration

## How It Works

This configuration is designed to **layer on top of ClaudeKit**, not replace it:

1. **ClaudeKit** (installed via npm) provides 30+ agents, 20+ commands, and 25+ hooks
2. **This configuration** adds custom workflow commands specific to your needs
3. Both work together seamlessly in Claude Code

## Available Custom Commands

### /ideate
Structured ideation workflow that enforces complete investigation for any code-change task (bug fix or feature). Creates comprehensive ideation documentation.

**Usage**: `/ideate Fix chat UI auto-scroll bug when messages exceed viewport height`

### /ideate-to-spec
Transform an ideation document into a validated, implementation-ready specification. Bridges the gap between ideation and implementation.

**Usage**: `/ideate-to-spec docs/ideation/add-proxy-config-to-figma-plugin.md`

### /spec:feedback
Process ONE piece of post-implementation feedback with structured workflow. Includes code exploration, optional research, interactive decisions (implement/defer/out-of-scope), spec updates, and feedback logging.

**Usage**: `/spec:feedback specs/add-user-auth/02-specification.md`

### /spec:doc-update
Review all documentation to identify what needs to be updated based on a new specification file. Launches parallel documentation expert agents.

**Usage**: `/spec:doc-update specs/text-generator-spec.md`

## Enhanced Spec Commands (Overrides)

These commands override ClaudeKit versions with enhanced features:

### /spec:decompose
Enhanced with incremental mode that preserves completed work and creates only new tasks when spec changelog is updated.

### /spec:execute
Enhanced with resume capability that continues from previous sessions, skipping completed work and maintaining implementation history.

## Installation

See the main README.md in the repository root for installation instructions.

## Customization

1. Copy `settings.json.example` to `settings.json` and modify for your needs
2. Add your own commands to the `commands/` directory
3. Commit `settings.json` for team sharing, or use `settings.local.json` for personal settings

## Integration with ClaudeKit

These custom commands complement ClaudeKit's features:

| Feature | ClaudeKit Provides | This Config Adds |
|---------|-------------------|------------------|
| **Agents** | typescript-expert, react-expert, testing-expert, etc. (30+) | (Uses ClaudeKit agents) |
| **Commands** | /git:commit, /spec:create, /research, etc. (20+) | /ideate, /ideate-to-spec, /spec:progress, /spec:doc-update |
| **Hooks** | file-guard, typecheck-changed, lint-changed, etc. (25+) | (Uses ClaudeKit hooks via settings.json) |

## Maintenance

- Keep ClaudeKit updated: `npm update -g claudekit`
- Validate custom commands: `claudekit lint-commands`
- List all available commands: `claudekit list commands`
