/**
 * Doctor command - Diagnose installation issues
 *
 * Checks:
 * - Node.js version
 * - npm availability
 * - Claude Code CLI
 * - ClaudeKit installation
 * - .claude/ directory structure
 * - Command files presence
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function printCheck(name, status, details = '') {
  const symbol = status ? '✓' : '✗';
  const color = status ? colors.green : colors.red;
  console.log(`${color}${symbol}${colors.reset} ${name}${details ? ' - ' + details : ''}`);
}

export async function doctor() {
  console.log('claudeflow Doctor - Installation Diagnostics\n');
  console.log('================================================\n');

  let issuesFound = 0;

  // Check Node.js
  const nodeVersion = process.version.slice(1).split('.')[0];
  const nodeOk = parseInt(nodeVersion) >= 20;
  printCheck('Node.js version', nodeOk, nodeOk ? process.version : `${process.version} (need 20+)`);
  if (!nodeOk) issuesFound++;

  // Check npm
  let npmOk = false;
  let npmVersion = 'not found';
  try {
    npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    npmOk = true;
  } catch (error) {
    issuesFound++;
  }
  printCheck('npm', npmOk, npmVersion);

  // Check Claude Code CLI
  let claudeOk = false;
  let claudeVersion = 'not found';
  try {
    claudeVersion = execSync('claude --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    claudeOk = true;
  } catch (error) {
    issuesFound++;
  }
  printCheck('Claude Code CLI', claudeOk, claudeVersion);

  // Check ClaudeKit
  let claudekitOk = false;
  let claudekitVersion = 'not found';
  try {
    claudekitVersion = execSync('claudekit --version', { encoding: 'utf8' }).trim();
    claudekitOk = true;
  } catch (error) {
    issuesFound++;
  }
  printCheck('ClaudeKit', claudekitOk, claudekitVersion);

  console.log('');
  console.log('Installation Locations:\n');

  // Check global installation
  const globalDir = join(homedir(), '.claude');
  const globalExists = existsSync(globalDir);
  printCheck('Global (~/.claude/)', globalExists);

  if (globalExists) {
    const globalCommands = join(globalDir, 'commands');
    const globalCommandsExist = existsSync(globalCommands);
    printCheck('  Commands directory', globalCommandsExist);

    if (globalCommandsExist) {
      const requiredCommands = [
        'ideate.md',
        'ideate-to-spec.md',
        'spec/create.md',
        'spec/decompose.md',
        'spec/execute.md',
        'spec/feedback.md'
      ];

      let commandsOk = 0;
      for (const cmd of requiredCommands) {
        if (existsSync(join(globalCommands, cmd))) {
          commandsOk++;
        }
      }
      printCheck('  Command files', commandsOk === requiredCommands.length,
        `${commandsOk}/${requiredCommands.length} found`);
      if (commandsOk < requiredCommands.length) issuesFound++;
    } else {
      issuesFound++;
    }
  }

  // Check project installation
  const projectDir = join(process.cwd(), '.claude');
  const projectExists = existsSync(projectDir);
  printCheck('Project (./.claude/)', projectExists);

  if (projectExists) {
    const projectCommands = join(projectDir, 'commands');
    const projectCommandsExist = existsSync(projectCommands);
    printCheck('  Commands directory', projectCommandsExist);

    if (projectCommandsExist) {
      const requiredCommands = [
        'ideate.md',
        'ideate-to-spec.md',
        'spec/create.md',
        'spec/decompose.md',
        'spec/execute.md',
        'spec/feedback.md'
      ];

      let commandsOk = 0;
      for (const cmd of requiredCommands) {
        if (existsSync(join(projectCommands, cmd))) {
          commandsOk++;
        }
      }
      printCheck('  Command files', commandsOk === requiredCommands.length,
        `${commandsOk}/${requiredCommands.length} found`);
    }
  }

  console.log('');
  console.log('================================================\n');

  if (issuesFound === 0) {
    console.log(`${colors.green}✓ All checks passed! Installation looks good.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Found ${issuesFound} issue(s)${colors.reset}\n`);
    console.log('Recommendations:');
    if (!nodeOk) {
      console.log('  - Install Node.js 20+: https://nodejs.org');
    }
    if (!npmOk) {
      console.log('  - Install npm (usually bundled with Node.js)');
    }
    if (!claudeOk) {
      console.log('  - Install Claude Code CLI: https://code.claude.com');
    }
    if (!claudekitOk) {
      console.log('  - Install ClaudeKit: npm install -g claudekit');
    }
    if (!globalExists && !projectExists) {
      console.log('  - Run: claudeflow setup');
    }
    console.log('');
  }
}
