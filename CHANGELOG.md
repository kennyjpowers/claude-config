# Changelog

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

**Repository:** https://github.com/kennethpriester/claude-config
**License:** MIT
