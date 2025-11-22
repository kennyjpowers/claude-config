# [1.1.0](https://github.com/kennyjpowers/claude-flow/compare/v1.0.1...v1.1.0) (2025-11-22)


### Bug Fixes

* enable npm provenance for OIDC publishing ([4ded4fc](https://github.com/kennyjpowers/claude-flow/commit/4ded4fc9885d24adfd6db14de3476d35c9b13188))
* update Node version requirements for semantic-release v25 ([ddc22fa](https://github.com/kennyjpowers/claude-flow/commit/ddc22fa4532281c58d0ab9772113d22b644406c2))
* update semantic-release to latest with OIDC support ([0440f6a](https://github.com/kennyjpowers/claude-flow/commit/0440f6a444aaa34cff849491d242236e2a5d9153)), closes [semantic-release/npm#1015](https://github.com/semantic-release/npm/issues/1015) [semantic-release/npm#1017](https://github.com/semantic-release/npm/issues/1017)
* use npm install instead of npm ci for complex dependencies ([22ebc10](https://github.com/kennyjpowers/claude-flow/commit/22ebc10ac6ac6e51a92c4b31f89c431586222718))


### Features

* enable OIDC publishing and remove token workflow ([5d1f195](https://github.com/kennyjpowers/claude-flow/commit/5d1f1950d01f8d12f8759cba1d255c17d57b9278))

## [1.0.1](https://github.com/kennyjpowers/claude-flow/compare/v1.0.0...v1.0.1) (2025-11-22)


### Bug Fixes

* add publishConfig for public scoped package ([bbc3bf1](https://github.com/kennyjpowers/claude-flow/commit/bbc3bf1ab0a3ae552c66cce9397324b44c883fc0))

# 1.0.0 (2025-11-22)


### Bug Fixes

* add required permissions to release-token workflow ([3c37cee](https://github.com/kennyjpowers/claude-flow/commit/3c37cee0d0c24973f1ba6ecec0afdca26c158d32))
* allow git credentials for semantic-release ([062e42d](https://github.com/kennyjpowers/claude-flow/commit/062e42da511a46392e8bc1c0b076c3db778c6fa1))
* improved feedback workflow command using the feedback command ([#2](https://github.com/kennyjpowers/claude-flow/issues/2)) ([efce9eb](https://github.com/kennyjpowers/claude-flow/commit/efce9eb45040314501d6ae249b38e867538471a8))
* **release:** add public access for scoped package publishing ([b7dd0a8](https://github.com/kennyjpowers/claude-flow/commit/b7dd0a82f9ed7f77702e86ea2a2c2de64586bf20))
* **workflows:** add GitHub App token to OIDC release workflow ([5dedbfe](https://github.com/kennyjpowers/claude-flow/commit/5dedbfe7306b901508424753f8b0951048fa08d3))
* **workflows:** use GitHub App token to bypass branch protection ([7b28f96](https://github.com/kennyjpowers/claude-flow/commit/7b28f96620c2f5d2e57c31882d52e3e7b771b24f))


### Features

* package publishing strategy ([#3](https://github.com/kennyjpowers/claude-flow/issues/3)) ([8c7546b](https://github.com/kennyjpowers/claude-flow/commit/8c7546bbb73f95366f238292109c89c8194448e3))
* reorganize specs into feature-based directories ([8d9da77](https://github.com/kennyjpowers/claude-flow/commit/8d9da77389510dee8611dd380c87776714cf8a2b))

# Changelog

## [1.2.0] - 2025-11-21

### Added

- **npm Package Distribution** - Published to npm registry as "@33strategies/claudeflow"
  - Cross-platform CLI installer (replaces install.sh)
  - Update notifications for new versions via update-notifier
  - `claudeflow doctor` diagnostic command for troubleshooting
  - Automated version management via semantic-release
  - CI/CD testing across npm, yarn, pnpm on Windows, macOS, Linux
  - Pure Installer architecture (setup command, not wrapper commands)
  - ESM-based implementation (import/export, Node.js 20+)
  - ClaudeKit as npm dependency with automatic installation

- **Post-Implementation Feedback Workflow System** - Complete feedback processing lifecycle
  - `/spec:feedback` - New command for structured feedback processing
    - Single-feedback-item workflow with interactive decisions
    - Code-aware exploration of affected areas (Explore agent integration)
    - Optional research-expert consultation for solution approaches
    - Batched interactive questions (implement/defer/out-of-scope)
    - Targeted spec updates with changelog entries for traceability
    - Decision log in `05-feedback.md` with complete audit trail
    - STM task creation for deferred feedback items
  - `05-feedback.md` - New document format for feedback decision logs
    - Chronological feedback entries with auto-numbering
    - Code exploration findings from targeted investigation
    - Research insights (when research-expert consulted)
    - Decisions made with complete rationale
    - Actions taken tracking (spec updated, task created, or logged only)

- **Incremental Decompose Mode** - Smart task creation that preserves completed work
  - Detects new changelog entries since last decompose (timestamp comparison)
  - Preserves completed tasks from STM (no duplication of finished work)
  - Creates only new tasks for changed requirements from changelog
  - Maintains task numbering continuity across decompose sessions (2.7 → 2.8)
  - Re-decompose metadata section in `03-tasks.md` tracks session history
  - Task status visualization with emoji markers (✅ DONE, 🔄 UPDATED, ⏳ NEW)
  - Automatic mode detection: full (first run), incremental (changes), skip (no changes)

- **Resume Execution Capability** - Session continuity across multiple implementation runs
  - Session detection from `04-implementation.md` with automatic resume
  - Skips completed tasks automatically (reads from implementation summary)
  - Session-based progress tracking (Session 1, Session 2, etc.)
  - Cross-session context provided to all implementation agents
  - Conflict detection for spec changes after task completion
  - STM status cross-reference with auto-reconciliation
  - Session markers with metadata (date, time, trigger, related feedback)

### Changed

- **Installation Method** - npm/yarn/pnpm package distribution replaces bash script
  - Distribution: npm package instead of manual git clone/download
  - Installation: `npm install -g @33strategies/claudeflow` instead of running install.sh
  - Setup: Interactive `claudeflow setup` with global/project choice
  - Node.js requirement: Now requires 20+ (aligned with ClaudeKit)
  - Version management: Fully automated via semantic-release and conventional commits
  - Updates: Automatic check on command execution with upgrade notifications

- **Enhanced `/spec:decompose`** - Now supports incremental mode (backward compatible)
  - Automatic mode detection via changelog timestamp analysis
  - Queries STM for existing task status to preserve completed work
  - Filters tasks into three categories: preserve (done), update (in-progress), add (new)
  - Appends re-decompose metadata section to `03-tasks.md` for history tracking
  - Original full decompose behavior preserved when no existing tasks found

- **Enhanced `/spec:execute`** - Now supports resume capability (backward compatible)
  - Detects previous implementation sessions from `04-implementation.md`
  - Displays session info and execution plan (completed/in-progress/pending counts)
  - Appends new sessions to implementation summary (preserves complete history)
  - Provides agents with previous session context for informed decisions
  - Original fresh start behavior preserved for first-time execution

- **Updated Specification Format** - Section 18 standardized for Changelog
  - Feedback-driven changes logged in spec changelog with structured entries
  - Changelog entries reference feedback log for complete traceability
  - Clear audit trail: feedback → decision → spec change → implementation

### Workflow Integration

New feedback loop integrated into complete 6-phase lifecycle:

```
IDEATION → SPECIFICATION → DECOMPOSITION → IMPLEMENTATION
                                              ↓
                                    Manual Testing discovers issue
                                              ↓
                                      FEEDBACK (new phase)
                                   /spec:feedback (one item at a time)
                                              ↓
                               ┌──────────────┴──────────────┐
                               ↓                             ↓
                        Implement Now                  Defer/Out-of-Scope
                     (Update spec changelog)           (Create STM task or log)
                               ↓
                     /spec:decompose (incremental mode)
                   (Preserves completed, adds only new)
                               ↓
                     /spec:execute (resume mode)
                   (Continues from previous session)
                               ↓
                          COMPLETION
```

### Benefits

- **Structured Iteration** - Clear workflow for processing feedback after implementation
- **Intelligent Re-execution** - No duplicate work when re-running decompose/execute commands
- **Decision Traceability** - Complete record of why changes were made with rationale
- **Session Continuity** - Resume implementation across multiple sessions without losing context
- **Flexible Feedback Handling** - Implement now, defer for later, or mark out-of-scope
- **Code-Aware Decisions** - Exploration findings inform decision-making with targeted investigation
- **Research Integration** - Optional expert consultation for complex feedback items
- **Task Management** - Deferred feedback tracked in STM for future work

### Documentation

- Enhanced `/spec:feedback` command documentation with examples and edge cases
- Updated `/spec:decompose` docs with incremental mode explanation
- Updated `/spec:execute` docs with resume capability details
- Created comprehensive user guide (500+ lines, 9 sections, 4 scenarios)
- Created complete API documentation with TypeScript schemas
- Updated README.md with 6-phase workflow including feedback phase
- Updated CLAUDE.md to v1.2.0 with new capabilities
- Created `docs/DESIGN_RATIONALE.md` - Design validation and best practices

### Files Added

- `.claude/commands/spec/feedback.md` - Complete feedback command
- `docs/guides/feedback-workflow-guide.md` - Comprehensive user guide
- `docs/api/feedback-workflow.md` - API specification with schemas
- `docs/DESIGN_RATIONALE.md` - Design decisions and research
- `package.json` - npm package metadata
- `bin/claudeflow.js` - CLI entry point
- `lib/setup.js` - Installation logic
- `lib/doctor.js` - Diagnostic command
- `scripts/verify-files.js` - Pre-publish file verification
- `LICENSE` - MIT License
- `.npmignore` - Package exclusion rules

### Removed

- `install.sh` - Replaced by `claudeflow setup` command
- Bash-specific installation scripts

### Migration from install.sh

For users upgrading from the bash script installation:

1. **Uninstall old version:**
   ```bash
   # Global installation
   rm -rf ~/.claude

   # OR Project installation
   rm -rf .claude
   ```

2. **Install via npm:**
   ```bash
   npm install -g @33strategies/claudeflow
   ```

3. **Run setup:**
   ```bash
   # Global (if you used install.sh user)
   claudeflow setup --global

   # OR Project (if you used install.sh project)
   claudeflow setup --project
   ```

4. **Verify installation:**
   ```bash
   claudeflow doctor
   ```

See README.md for detailed migration instructions and troubleshooting.

## [1.1.0] - 2025-11-21

### Added

- **Feature-Based Directory Structure** - All specification documents now organized in `specs/<slug>/` directories
  - `01-ideation.md` - Created by `/ideate`
  - `02-specification.md` - Created by `/ideate-to-spec`
  - `03-tasks.md` - Created by `/spec:decompose`
  - `04-implementation.md` - Created by `/spec:execute`
- **STM Task Tagging** - All tasks tagged with `feature:<slug>` for easy filtering
- **Session Continuity** - `/spec:execute` now reads previous progress from implementation summary
- **Migration Command** - `/spec:migrate` to convert existing specs to new structure
- **Command Overrides:**
  - `/spec:create` - Detects output path from prompt
  - `/spec:decompose` - Extracts slug and tags STM tasks
  - `/spec:execute` - Creates/updates implementation summary with session history

### Changed

- **Replaced `/spec:progress`** - Now use `stm list --pretty --tag feature:<slug>` instead
- **Updated `/ideate`** - Creates specs in `specs/<slug>/01-ideation.md` (was `docs/ideation/<slug>.md`)
- **Updated `/ideate-to-spec`** - Extracts slug and passes explicit paths
- **Updated README.md** - New document organization section and updated workflow examples
- **Workflow Commands Count** - Reduced from 4 to 3 custom commands (removed `/spec:progress`)

### Benefits

- All feature documents in one directory
- Clear lifecycle progression with numbered prefixes
- Easy filtering of STM tasks by feature
- Session continuity for multi-run implementations
- Backward compatible with legacy paths

## [1.0.0] - 2025-11-12

### Initial Release

**What's Included:**

- **4 Custom Workflow Commands:**
  - `/ideate` - Structured ideation workflow with comprehensive documentation
  - `/ideate-to-spec` - Transform ideation documents into validated specifications
  - `/spec:progress` - Track implementation progress and update task breakdowns
  - `/spec:doc-update` - Parallel documentation review based on spec files

- **ClaudeKit Integration:**
  - npm-based installation (no git submodules)
  - Layers custom commands on top of ClaudeKit's 30+ agents, 20+ commands, and 25+ hooks
  - Example settings.json with ClaudeKit hooks configuration

- **Templates & Configuration:**
  - Project-level configuration templates
  - User-level configuration templates
  - Example .gitignore patterns
  - CLAUDE.md templates

- **Documentation:**
  - Comprehensive README with installation and usage instructions
  - Detailed SETUP_GUIDE.md
  - Research documentation validating the hybrid approach

- **Installation Script:**
  - Automated `install.sh` for project and user-level installation
  - Prerequisite checking
  - ClaudeKit integration

### Design Decisions

- **No Example Agents:** Relies on ClaudeKit's comprehensive agent library rather than including redundant examples
- **Workflow Focus:** Custom commands focus on workflow orchestration (ideation → specification → documentation)
- **npm Over Submodules:** Uses ClaudeKit via npm for simpler installation and updates
- **Layered Architecture:** Three-layer approach (Claude Code → ClaudeKit → Custom Commands)

### Breaking Changes

None - this is the initial release.

---

**Repository:** https://github.com/kennyjpowers/claude-flow.git
**License:** MIT
