#!/usr/bin/env node

/**
 * claudeflow - Workflow orchestration for Claude Code
 *
 * CLI entry point with cross-platform compatibility
 */

import updateNotifier from "update-notifier";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get package.json for version and update checking
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8")
);

// Check for updates (non-blocking)
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24,
}); // Check daily
if (notifier.update) {
  notifier.notify({
    message: `Update available: ${notifier.update.latest}\nRun: npm install -g @33strategies/claudeflow`,
  });
}

// Parse command and arguments
const [, , command, ...args] = process.argv;

// Command routing
switch (command) {
  case "setup":
    const { setup } = await import("../lib/setup.js");
    await setup(args);
    break;

  case "doctor":
    const { doctor } = await import("../lib/doctor.js");
    await doctor();
    break;

  case "version":
  case "--version":
  case "-v":
    console.log(`claudeflow v${pkg.version}`);
    break;

  case "help":
  case "--help":
  case "-h":
  case undefined:
    showHelp();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "claudeflow help" for usage information');
    process.exit(1);
}

function showHelp() {
  console.log(`
claudeflow v${pkg.version} - Workflow orchestration for Claude Code

USAGE:
  claudeflow <command> [options]

COMMANDS:
  setup              Interactive installer (prompts for global or project)
  setup --global     Install to ~/.claude/ (user-level)
  setup --project    Install to ./.claude/ (project-level)
  doctor             Verify installation and diagnose issues
  version            Show version information
  help               Show this help message

EXAMPLES:
  # Interactive setup (recommended for first-time users)
  claudeflow setup

  # Install globally to ~/.claude/
  claudeflow setup --global

  # Install to current project
  claudeflow setup --project

  # Check installation health
  claudeflow doctor

INSTALLATION METHODS:
  npm install -g @33strategies/claudeflow
  yarn global add @33strategies/claudeflow
  pnpm add -g @33strategies/claudeflow

DOCUMENTATION:
  https://github.com/kennyjpowers/claude-flow.git
  https://claudeflow.dev (coming soon)

REPORT ISSUES:
  https://github.com/kennyjpowers/claude-flow.git/issues
`);
}
