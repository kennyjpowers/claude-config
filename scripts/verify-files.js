#!/usr/bin/env node

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const requiredFiles = [
  '.claude/commands/ideate.md',
  '.claude/commands/ideate-to-spec.md',
  '.claude/commands/spec/create.md',
  '.claude/commands/spec/decompose.md',
  '.claude/commands/spec/execute.md',
  '.claude/commands/spec/feedback.md',
  '.claude/commands/spec/doc-update.md',
  '.claude/commands/spec/migrate.md',
  'templates/project-config/CLAUDE.md',
  'templates/user-config/CLAUDE.md',
  'docs/DESIGN_RATIONALE.md',
  'README.md',
  'CLAUDE.md',
  'LICENSE'
];

let missingFiles = [];

for (const file of requiredFiles) {
  const fullPath = join(projectRoot, file);
  if (!existsSync(fullPath)) {
    missingFiles.push(file);
    console.error(`✗ Missing: ${file}`);
  } else {
    console.log(`✓ Found: ${file}`);
  }
}

if (missingFiles.length > 0) {
  console.error(`\n❌ ${missingFiles.length} required files missing!`);
  console.error('Cannot publish package with missing files.');
  process.exit(1);
} else {
  console.log('\n✅ All required files present. Ready to publish!');
  process.exit(0);
}
