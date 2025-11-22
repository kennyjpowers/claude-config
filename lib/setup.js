/**
 * Setup command - Replaces install.sh functionality
 *
 * Handles installation to either:
 * - Global: ~/.claude/ (user-level configuration)
 * - Project: ./.claude/ (project-specific configuration)
 */

import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createInterface } from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, "..");

// ANSI colors for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

function printSuccess(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function printError(msg) {
  console.error(`${colors.red}✗${colors.reset} ${msg}`);
}

function printInfo(msg) {
  console.log(`${colors.yellow}ℹ${colors.reset} ${msg}`);
}

export async function setup(args) {
  console.log("================================================");
  console.log("claudeflow Setup");
  console.log("================================================\n");

  // Determine installation mode
  let mode = "interactive";
  if (args.includes("--global") || args.includes("-g")) {
    mode = "global";
  } else if (args.includes("--project") || args.includes("-p")) {
    mode = "project";
  }

  // Interactive mode: ask user
  if (mode === "interactive") {
    mode = await promptInstallationMode();
  }

  const targetDir =
    mode === "global"
      ? join(homedir(), ".claude")
      : join(process.cwd(), ".claude");

  console.log("");
  printInfo(`Installation mode: ${mode}`);
  printInfo(`Target directory: ${targetDir}`);
  console.log("");

  // Step 1: Prerequisites check
  await checkPrerequisites();

  // Step 2: Verify ClaudeKit installation
  await verifyClaudeKit();

  // Step 3: Create directories
  createDirectories(targetDir);

  // Step 4: Copy files
  copyFiles(targetDir);

  // Step 5: Initialize settings if needed
  initializeSettings(targetDir);

  // Step 6: Run ClaudeKit setup
  await runClaudeKitSetup(mode);

  // Step 7: Success summary
  printSuccessSummary(mode, targetDir);
}

async function promptInstallationMode() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("Select installation mode:");
    console.log(
      "  1) Global  - Install to ~/.claude/ (available in all projects)"
    );
    console.log("  2) Project - Install to ./.claude/ (this project only)");
    console.log("");

    rl.question("Enter choice [1/2]: ", (answer) => {
      rl.close();
      resolve(answer === "2" ? "project" : "global");
    });
  });
}

async function checkPrerequisites() {
  printInfo("Checking prerequisites...");

  // Check Node.js version
  const nodeVersion = process.version.slice(1).split(".")[0];
  if (parseInt(nodeVersion) < 20) {
    printError(`Node.js 20+ required (found: ${process.version})`);
    process.exit(1);
  }
  printSuccess(`Node.js ${process.version} found`);

  // Check npm
  try {
    const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
    printSuccess(`npm ${npmVersion} found`);
  } catch (error) {
    printError("npm not found");
    process.exit(1);
  }

  // Check Claude Code CLI
  try {
    execSync("claude --version", { stdio: "ignore" });
    printSuccess("Claude Code CLI found");
  } catch (error) {
    printError("Claude Code CLI not found");
    printInfo("Install from: https://code.claude.com");
    process.exit(1);
  }

  console.log("");
}

async function verifyClaudeKit() {
  printInfo("Verifying ClaudeKit installation...");

  try {
    const version = execSync("claudekit --version", {
      encoding: "utf8",
    }).trim();
    printSuccess(`ClaudeKit ${version} found`);
  } catch (error) {
    printError("ClaudeKit not found (should be installed as dependency)");
    printInfo("This is unusual - ClaudeKit should be installed automatically");
    printInfo("Try: npm install -g claudekit");
    process.exit(1);
  }

  console.log("");
}

function createDirectories(targetDir) {
  printInfo("Creating directories...");

  const dirs = [
    targetDir,
    join(targetDir, "commands"),
    join(targetDir, "commands", "spec"),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      printSuccess(`Created ${dir}`);
    } else {
      printInfo(`Directory exists: ${dir}`);
    }
  }

  console.log("");
}

function copyFiles(targetDir) {
  printInfo("Copying files...");

  // Copy command files
  const commandFiles = [
    ".claude/commands/ideate.md",
    ".claude/commands/ideate-to-spec.md",
    ".claude/commands/spec/create.md",
    ".claude/commands/spec/decompose.md",
    ".claude/commands/spec/execute.md",
    ".claude/commands/spec/feedback.md",
    ".claude/commands/spec/doc-update.md",
    ".claude/commands/spec/migrate.md",
  ];

  for (const file of commandFiles) {
    const src = join(PACKAGE_ROOT, file);
    const dest = join(targetDir, file.replace(".claude/", ""));

    // Create parent directory if needed
    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    try {
      copyFileSync(src, dest);
      printSuccess(`Copied ${file.replace(".claude/", "")}`);
    } catch (error) {
      printError(`Failed to copy ${file}: ${error.message}`);
      process.exit(1);
    }
  }

  // Copy README
  const readmeSrc = join(PACKAGE_ROOT, ".claude/README.md");
  const readmeDest = join(targetDir, "README.md");
  try {
    copyFileSync(readmeSrc, readmeDest);
    printSuccess("Copied README.md");
  } catch (error) {
    printError(`Failed to copy README.md: ${error.message}`);
    process.exit(1);
  }

  console.log("");
}

function initializeSettings(targetDir) {
  const settingsPath = join(targetDir, "settings.json");
  const examplePath = join(PACKAGE_ROOT, ".claude/settings.json.example");

  if (!existsSync(settingsPath)) {
    printInfo("Initializing settings.json...");
    copyFileSync(examplePath, settingsPath);
    printSuccess("Created settings.json from template");
  } else {
    printInfo("settings.json already exists (keeping existing)");
  }

  console.log("");
}

async function runClaudeKitSetup(mode) {
  printInfo("Running ClaudeKit setup...");

  try {
    const setupCommand =
      mode === "global" ? "claudekit setup --user --yes" : "claudekit setup --yes";
    execSync(setupCommand, { stdio: "inherit" });
    printSuccess("ClaudeKit setup complete");
  } catch (error) {
    printError("ClaudeKit setup failed (non-fatal)");
    printInfo('You may need to run "claudekit setup" manually');
  }

  console.log("");
}

function printSuccessSummary(mode, targetDir) {
  console.log("================================================");
  console.log("Installation Complete!");
  console.log("================================================\n");

  console.log("What was installed:");
  console.log(`  ✓ 8 custom workflow commands in ${targetDir}/commands/`);
  console.log(`  ✓ Configuration templates`);
  console.log(`  ✓ ClaudeKit integration\n`);

  console.log("Next steps:");
  if (mode === "global") {
    console.log(
      "  1. Custom commands are now available in all Claude Code sessions"
    );
    console.log("  2. Try: /ideate <task-brief>");
  } else {
    console.log("  1. Open this project in Claude Code");
    console.log("  2. Custom commands will be available in this project");
    console.log("  3. Try: /ideate <task-brief>");
  }
  console.log("  4. Read documentation: " + targetDir + "/README.md");
  console.log("  5. Explore commands: ls " + targetDir + "/commands/\n");

  console.log("Documentation:");
  console.log("  GitHub: https://github.com/kennyjpowers/claude-flow");
  console.log("  Website: https://claudeflow.dev (coming soon)\n");
}
