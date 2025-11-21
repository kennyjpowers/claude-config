---
description: Break down a validated specification into actionable implementation tasks
category: validation
allowed-tools: Read, Task, Write, TodoWrite, Bash(mkdir:*), Bash(cat:*), Bash(grep:*), Bash(echo:*), Bash(basename:*), Bash(date:*), Bash(claudekit:status stm), Bash(stm:*)
argument-hint: "<path-to-spec-file>"
---

# Decompose Specification into Tasks

Decompose the specification at: $ARGUMENTS

## Extract Feature Slug

Extract the feature slug from the spec path:
- If path is `specs/<slug>/02-specification.md` → slug is `<slug>`
- If path is `specs/feat-<slug>.md` (legacy) → slug is `feat-<slug>`
- If path is `specs/fix-<issue>-<desc>.md` (legacy) → slug is `fix-<issue>-<desc>`

Store the slug for use in:
1. Task breakdown output path: `specs/<slug>/03-tasks.md`
2. STM task tagging: `--tags "feature:<slug>,phase1,..."`

Example: `specs/add-user-auth/02-specification.md` → slug is `add-user-auth`

## Process Overview

This command takes a validated specification and breaks it down into:
1. Clear, actionable tasks with dependencies
2. Implementation phases and milestones
3. Testing and validation requirements
4. Documentation needs

!claudekit status stm

## ⚠️ CRITICAL: Content Preservation Requirements

**THIS IS THE MOST IMPORTANT PART**: When creating STM tasks, you MUST copy ALL content from the task breakdown into the STM tasks. Do NOT summarize or reference the spec - include the ACTUAL CODE and details.

## Pre-Flight Checklist

Before creating any STM tasks, confirm your understanding:
- [ ] I will NOT write summaries like "Create X as specified in spec"
- [ ] I will COPY all code blocks from the task breakdown into STM --details
- [ ] I will USE heredocs or temp files for multi-line content
- [ ] I will INCLUDE complete implementations, not references
- [ ] Each STM task will be self-contained with ALL details from the breakdown

**If you find yourself typing phrases like "as specified", "from spec", or "see specification" - STOP and copy the actual content instead!**

## Instructions for Claude:

0. **Task Management System**:
   - Check the STM_STATUS output above
   - If status is "Available but not initialized", run: `stm init`
   - If status is "Available and initialized", use STM for task management
   - If status is "Not installed", fall back to TodoWrite

0.5. **Incremental Mode Detection**:

   Determine if this is a first-time decompose, incremental update, or should be skipped.

   **Extract Feature Slug:**

   Extract the slug from the spec path using simple string operations:
   - If path is `specs/<slug>/02-specification.md` → slug is `<slug>`
   - Use cut, basename, or dirname to extract
   - Store slug for use in task file path and STM queries

   Example:
   ```bash
   SPEC_FILE="$ARGUMENTS"
   SLUG=$(echo "$SPEC_FILE" | cut -d'/' -f2)
   TASKS_FILE="specs/$SLUG/03-tasks.md"
   ```

   **Determine Decompose Mode:**

   Follow this decision logic to determine which mode to use:

   1. **Check for existing STM tasks:**
      ```bash
      stm list --tags "feature:<slug>" -f json
      ```
      - If result is empty or `[]` → **Full mode** (first-time decompose)
      - Display: "🆕 First-time decompose - Full mode"

   2. **Check if task file exists:**
      - If `specs/<slug>/03-tasks.md` doesn't exist → **Full mode**
      - Display: "📄 Tasks file missing - Full mode"

   3. **Extract last decompose timestamp:**
      - Read `specs/<slug>/03-tasks.md`
      - Find line containing "Last Decompose: YYYY-MM-DD"
      - Extract the date
      - If no date found → **Full mode**
      - Display: "📄 No decompose timestamp found - Full mode"

   4. **Check for new changelog entries:**
      - Read the spec file's "## 18. Changelog" section
      - Look for entries with dates >= last decompose date
      - Compare dates (string comparison works for YYYY-MM-DD format)

      If new entries found:
      - Mode: **Incremental**
      - Display: "🔄 Changelog changes detected - Incremental mode"
      - Display: "   Last decompose: <date>"

      If no new entries:
      - Mode: **Skip**
      - Display: "✅ No changes since last decompose (<date>)"
      - Display: "   To force re-decompose, delete <tasks-file>"
      - **Exit** (don't proceed with decomposition)

   **Store Mode for Later:**
   Remember the determined mode (full/incremental/skip) and last decompose date for use in subsequent steps.

1. **Read and Validate Specification**:
   - Read the specified spec file
   - Verify it's a valid specification (has expected sections)
   - Extract implementation phases and technical details

2. **Analyze Specification Components**:
   - Identify major features and components
   - Extract technical requirements
   - Note dependencies between components
   - Identify testing requirements
   - Document success criteria

2.5. **Incremental Mode Processing** (if MODE=incremental):

   When running in incremental mode, perform additional analysis to identify what to preserve, update, and create.

   **Get Completed Tasks for Preservation:**

   Query STM for tasks that are already done:
   ```bash
   stm list --tags "feature:<slug>" --status done -f json
   ```

   For each completed task, extract:
   - Task ID
   - Phase (from tags like "phase1", "phase2")
   - Title

   These tasks will be marked with ✅ DONE in the task breakdown and preserved as-is.

   **Extract New Changelog Entries:**

   Read the spec file and identify changelog entries added since the last decompose:

   1. Use Read tool on `specs/<slug>/02-specification.md`
   2. Find the "## 18. Changelog" section
   3. For each changelog entry (marked by ### headers):
      - Extract the **Date** field
      - Compare with last decompose date (string comparison works for YYYY-MM-DD)
      - If date >= last decompose date, this is a new entry
   4. For new entries, extract key fields:
      - **Issue:** What problem/feedback is being addressed
      - **Decision:** What action was chosen (implement/defer/out-of-scope)
      - **Changes to Specification:** Which sections are affected
      - **Implementation Impact:** Priority, affected components, blast radius

   **Categorize Existing Tasks:**

   Based on the new changelog entries, determine which existing tasks need updates:

   1. **Preserve Tasks (✅ DONE):**
      - All tasks with status "done" in STM
      - No changes to these tasks
      - Copy to task breakdown with ✅ marker

   2. **Update Tasks (🔄 UPDATED):**
      - Tasks that are in-progress or pending
      - Related to components mentioned in changelog "Changes to Specification"
      - Need updated context from changelog
      - Mark with 🔄 in task breakdown
      - Add changelog context to task details

   3. **Create Tasks (⏳ NEW):**
      - New work identified in changelog "Implementation Impact"
      - Not covered by existing tasks
      - Mark with ⏳ in task breakdown
      - Create fresh STM tasks

   **Categorization Logic:**

   For each existing task (from STM):
   - If status = "done" → PRESERVE
   - If status = "in-progress" or "pending":
     - Check if task's component/file mentioned in changelog
     - If yes → UPDATE (add changelog context)
     - If no → PRESERVE (no changes needed)

   For each changelog entry:
   - Compare "Implementation Impact" → "Affected components" against existing tasks
   - If component not covered by existing tasks → CREATE new task
       task_status=$(echo "$task" | jq -r '.status')
       task_title=$(echo "$task" | jq -r '.title')
       task_details=$(echo "$task" | jq -r '.details')

       if [ "$task_status" = "done" ]; then
         # Preserve completed tasks
         PRESERVE_TASKS[$task_id]="$task_title"
       else
         # Check if changelog affects this task
         if echo "$NEW_CHANGELOG" | grep -qi "$(echo "$task_title" | sed 's/\[.*\] //')"; then
           UPDATE_TASKS[$task_id]="$task_title"
         else
           PRESERVE_TASKS[$task_id]="$task_title"
         fi
       fi
     done
   }

   # Get next task number for a phase
   get_next_task_number() {
     local phase="$1"
     local existing_tasks="$2"

     # Find highest task number in this phase
     max_num=$(echo "$existing_tasks" | grep -oP "Task $phase\.\K[0-9]+" | sort -n | tail -1)

     if [ -z "$max_num" ]; then
       echo "$phase.1"
     else
       echo "$phase.$((max_num + 1))"
     fi
   }

   echo "📊 Incremental Analysis:"
   echo "   - Completed tasks to preserve: $(echo "$COMPLETED_TASKS" | wc -l)"
   echo "   - New changelog entries: $(echo "$NEW_CHANGELOG" | grep -c "^\*\*Date:\*\*")"
   ```

3. **Create Task Breakdown**:
   
   Break down the specification into concrete, actionable tasks.
   
   Key principles:
   - Each task should have a single, clear objective
   - **PRESERVE ALL CONTENT**: Copy implementation details, code blocks, and examples verbatim from the spec
   - Define clear acceptance criteria with specific test scenarios
   - Include tests as part of each task
   - Document dependencies between tasks
     * Write meaningful tests that can fail to reveal real issues
     * Follow project principle: "When tests fail, fix the code, not the test"
   - Create foundation tasks first, then build features on top
   - Each task should be self-contained with all necessary details
   
   **CRITICAL REQUIREMENT**: When creating tasks, you MUST preserve:
   - Complete code examples (including full functions, not just snippets)
   - All technical requirements and specifications
   - Detailed implementation steps
   - Configuration examples
   - Error handling requirements
   - All acceptance criteria and test scenarios
   
   Think of each task as a complete mini-specification that contains everything needed to implement it without referring back to the original spec.
   
   ## 📋 THE TWO-STEP PROCESS YOU MUST FOLLOW:
   
   **Step 1**: Create the task breakdown DOCUMENT with all details
   **Step 2**: Copy those SAME details into STM tasks
   
   The task breakdown document is NOT just for reference - it's the SOURCE for your STM task content!
   
   Task structure:
   - Foundation tasks: Core infrastructure (database, frameworks, testing setup)
   - Feature tasks: Complete vertical slices including all layers
   - Testing tasks: Unit, integration, and E2E tests
   - Documentation tasks: API docs, user guides, code comments

3.5. **Incremental Task Breakdown Adjustments** (if MODE=incremental):

   When generating the task breakdown in incremental mode:

   - **Mark Preserved Tasks**: Add ✅ DONE marker to completed tasks
   - **Mark Updated Tasks**: Add 🔄 UPDATED marker with update note
   - **Mark New Tasks**: Add ⏳ NEW marker and continue task numbering
   - **Include Re-decompose Metadata**: Add metadata section showing history

   Example task marking:
   ```markdown
   ### Task 2.3: Implement file operations ✅ DONE
   **Status**: Completed in previous session
   **Description**: ...existing content...

   ### Task 2.5: Add backup validation 🔄 UPDATED
   **Update Note**: Affected by changelog entry on 2025-11-21 - Review spec section 15.3 for new validation requirements
   **Description**: ...existing content...

   ### Task 2.8: Implement incremental backup ⏳ NEW
   **Description**: New task based on changelog feedback
   **Added**: 2025-11-21
   ```

4. **Generate Task Document**:

   Create a comprehensive task breakdown document:

   ```markdown
   # Task Breakdown: [Specification Name]
   Generated: [Date]
   Source: [spec-file]

   ## Re-decompose Metadata (if incremental mode)

   ### Decompose History
   | Session | Date | Mode | Changelog Entries | New Tasks | Notes |
   |---------|------|------|-------------------|-----------|-------|
   | 1 | 2025-11-20 | Full | N/A | 22 | Initial decomposition |
   | 2 | 2025-11-21 | Incremental | 2 | 5 | Feedback-driven updates |

   ### Current Session Details
   - **Mode**: Incremental
   - **Previous Decompose**: 2025-11-20
   - **Current Decompose**: 2025-11-21
   - **Changelog Entries Processed**: 2

   ### Changelog Entries (New Since Last Decompose)
   1. **Date**: 2025-11-21
      **Title**: Add incremental mode to decompose
      **Impact**: New tasks for detection logic and metadata
      **Action**: Created tasks 2.8-2.12

   2. **Date**: 2025-11-21
      **Title**: Update validation requirements
      **Impact**: Updated task 2.5 with new criteria
      **Action**: Updated task 2.5

   ### Task Changes Summary
   - **Preserved**: 18 tasks (completed, no changes)
   - **Updated**: 2 tasks (in-progress, affected by changelog)
   - **Created**: 5 tasks (new work from changelog)
   - **Total**: 25 tasks

   ### Existing Tasks Status
   #### Phase 1: Foundation (8 tasks)
   - Task 1.1: Setup project structure ✅ DONE
   - Task 1.2: Configure TypeScript ✅ DONE
   - Task 1.3: Initialize git repository ✅ DONE
   - Task 1.4: Setup testing framework ✅ DONE
   - Task 1.5: Configure linting ✅ DONE
   - Task 1.6: Setup CI/CD pipeline ✅ DONE
   - Task 1.7: Create documentation structure ✅ DONE
   - Task 1.8: Initialize package.json ✅ DONE

   #### Phase 2: Core Implementation (10 tasks)
   - Task 2.1: Implement core module ✅ DONE
   - Task 2.2: Add configuration system ✅ DONE
   - Task 2.3: Implement file operations ✅ DONE
   - Task 2.4: Create CLI interface 🔄 IN PROGRESS
   - Task 2.5: Add validation logic 🔄 UPDATED
   - Task 2.6: Implement error handling ⏳ PENDING
   - Task 2.7: Add logging system ⏳ PENDING
   - Task 2.8: Implement incremental mode ⏳ NEW
   - Task 2.9: Add metadata tracking ⏳ NEW
   - Task 2.10: Create changelog parser ⏳ NEW

   ### Execution Recommendations
   1. Review updated tasks (2.5) for new requirements
   2. Complete in-progress tasks (2.4) before new work
   3. Start new tasks in dependency order (2.8 → 2.9 → 2.10)

   ---

   ## Overview
   [Brief summary of what's being built]
   
   ## Phase 1: Foundation
   
   ### Task 1.1: [Task Title]
   **Description**: One-line summary of what needs to be done
   **Size**: Small/Medium/Large
   **Priority**: High/Medium/Low
   **Dependencies**: None
   **Can run parallel with**: Task 1.2, 1.3
   
   **Technical Requirements**:
   - [All technical details from spec]
   - [Specific library versions]
   - [Code examples from spec]
   
   **Implementation Steps**:
   1. [Detailed step from spec]
   2. [Another step with specifics]
   3. [Continue with all steps]
   
   **Acceptance Criteria**:
   - [ ] [Specific criteria from spec]
   - [ ] Tests written and passing
   - [ ] [Additional criteria]
   
   ## Phase 2: Core Features
   [Continue pattern...]
   ```
   
   Example task breakdown:
   ```markdown
   ### Task 2.3: Implement file system operations with backup support
   **Description**: Build filesystem.ts module with Unix-focused operations and backup support
   **Size**: Large
   **Priority**: High
   **Dependencies**: Task 1.1 (TypeScript setup), Task 1.2 (Project structure)
   **Can run parallel with**: Task 2.4 (Config module)
   
   **Source**: specs/feat-modernize-setup-installer.md
   
   **Technical Requirements**:
   - Path validation: Basic checks for reasonable paths
   - Permission checks: Verify write permissions before operations
   - Backup creation: Simple backup before overwriting files
   - Error handling: Graceful failure with helpful messages
   - Unix path handling: Use path.join, os.homedir(), standard Unix permissions
   
   **Functions to implement**:
   - validateProjectPath(input: string): boolean - Basic path validation
   - ensureDirectoryExists(path: string): Promise<void>
   - copyFileWithBackup(source: string, target: string, backup: boolean): Promise<void>
   - setExecutablePermission(filePath: string): Promise<void> - chmod 755
   - needsUpdate(source: string, target: string): Promise<boolean> - SHA-256 comparison
   - getFileHash(filePath: string): Promise<string> - SHA-256 hash generation
   
   **Implementation example from spec**:
   ```typescript
   async function needsUpdate(source: string, target: string): Promise<boolean> {
     if (!await fs.pathExists(target)) return true;
     
     const sourceHash = await getFileHash(source);
     const targetHash = await getFileHash(target);
     
     return sourceHash !== targetHash;
   }
   ```
   
   **Acceptance Criteria**:
   - [ ] All file operations handle Unix paths correctly
   - [ ] SHA-256 based idempotency checking implemented
   - [ ] Backup functionality creates timestamped backups
   - [ ] Executable permissions set correctly for hooks (755)
   - [ ] Path validation prevents directory traversal
   - [ ] Tests: All operations work on macOS/Linux with proper error handling
   ```
   
5. **Create Task Management Entries**:

   ## 🚨 Incremental Mode: STM Task Creation Strategy

   When MODE=incremental, modify the STM task creation strategy:

   ```bash
   # Function to update existing STM tasks with changelog context
   update_stm_tasks() {
     local slug="$1"
     local update_tasks="$2"  # Format: "id:title|id:title|..."

     IFS='|' read -ra TASKS <<< "$update_tasks"
     for task_entry in "${TASKS[@]}"; do
       IFS=':' read -ra PARTS <<< "$task_entry"
       task_id="${PARTS[0]}"
       task_title="${PARTS[1]}"

       # Get existing details
       existing_details=$(stm show "$task_id" | awk '/^## Details$/,/^## [A-Z]/' | sed '1d;$d')

       # Append incremental update note
       updated_details="$existing_details

   ---

   ## Incremental Update ($(date +%Y-%m-%d))

   **Affected by changelog changes**. Review the following:
   - Check specification sections mentioned in recent changelog
   - Review feedback log for this task
   - Update implementation based on new requirements

   **Related changelog**: See Re-decompose Metadata section in 03-tasks.md"

       # Update STM task
       stm update "$task_id" --details "$updated_details"

       echo "   🔄 Updated task $task_id: $task_title"
     done
   }

   # Function to create new STM tasks for incremental work
   create_incremental_stm_tasks() {
     local slug="$1"
     local create_tasks="$2"  # Format: "phase.num:title:details|..."

     IFS='|' read -ra TASKS <<< "$create_tasks"
     for task_entry in "${TASKS[@]}"; do
       IFS=':' read -ra PARTS <<< "$task_entry"
       task_num="${PARTS[0]}"
       phase=$(echo "$task_num" | cut -d. -f1)
       task_title="${PARTS[1]}"
       task_details="${PARTS[2]}"

       # Create temporary file for details
       cat > /tmp/stm-incremental-details.txt << EOF
   $task_details

   ---

   ## Incremental Task Context

   **Created**: $(date +%Y-%m-%d)
   **Source**: Changelog-driven decomposition
   **Related**: See Re-decompose Metadata in specs/$slug/03-tasks.md

   This task was created based on specification changes documented in the changelog.
   EOF

       # Create STM task
       stm add "[$task_num] $task_title" \
         --description "New task from incremental decompose based on changelog feedback" \
         --details "$(cat /tmp/stm-incremental-details.txt)" \
         --validation "See task breakdown in specs/$slug/03-tasks.md for acceptance criteria" \
         --tags "feature:$slug,incremental,phase$phase" \
         --status pending

       echo "   ⏳ Created task [$task_num]: $task_title"

       rm /tmp/stm-incremental-details.txt
     done
   }

   # Execute based on mode
   if [ "$DECOMPOSE_MODE" = "incremental" ]; then
     echo ""
     echo "📝 Updating STM tasks (incremental mode):"
     # Update affected tasks
     update_stm_tasks "$SLUG" "$UPDATE_TASKS_LIST"
     # Create new tasks
     create_incremental_stm_tasks "$SLUG" "$CREATE_TASKS_LIST"
     echo ""
     echo "✅ Incremental decompose complete!"
     echo "   - Preserved: $PRESERVED_COUNT tasks"
     echo "   - Updated: $UPDATED_COUNT tasks"
     echo "   - Created: $CREATED_COUNT tasks"
   else
     # Full mode: Create all tasks as usual (existing behavior below)
     echo "📝 Creating STM tasks (full mode):"
   fi
   ```

   ## 🚨 STOP AND READ: Common Mistake vs Correct Approach
   
   ❌ **WRONG - What NOT to do**:
   ```bash
   stm add "[P1.3] Implement common hook utilities" \
     --description "Create shared utilities module for all hooks" \
     --details "Create cli/hooks/utils.ts with readStdin() with 1-second timeout, findProjectRoot() using git rev-parse, detectPackageManager() checking lock files" \
     --validation "readStdin with timeout. Project root discovery. Package manager detection."
   ```
   
   ✅ **CORRECT - What you MUST do**:
   ```bash
   # For each task in the breakdown, find the corresponding section and COPY ALL its content
   # Use temporary files for large content to preserve formatting
   
   cat > /tmp/task-details.txt << 'EOF'
   Create cli/hooks/utils.ts with the following implementations:
   
   ```typescript
   import { exec } from 'child_process';
   import { promisify } from 'util';
   import * as fs from 'fs-extra';
   import * as path from 'path';
   
   const execAsync = promisify(exec);
   
   // Standard input reader
   export async function readStdin(): Promise<string> {
     return new Promise((resolve) => {
       let data = '';
       process.stdin.on('data', chunk => data += chunk);
       process.stdin.on('end', () => resolve(data));
       setTimeout(() => resolve(''), 1000); // Timeout fallback
     });
   }
   
   // Project root discovery
   export async function findProjectRoot(startDir: string = process.cwd()): Promise<string> {
     try {
       const { stdout } = await execAsync('git rev-parse --show-toplevel', { cwd: startDir });
       return stdout.trim();
     } catch {
       return process.cwd();
     }
   }
   
   // [Include ALL other functions from the task breakdown...]
   ```
   
   Technical Requirements:
   - Standard input reader with timeout
   - Project root discovery using git
   - Package manager detection (npm/yarn/pnpm)
   - Command execution wrapper
   - Error formatting helper
   - Tool availability checker
   EOF
   
   stm add "[P1.3] Implement common hook utilities" \
     --description "Create shared utilities module for all hooks with stdin reader, project root discovery, package manager detection, command execution wrapper, error formatting, and tool availability checking" \
     --details "$(cat /tmp/task-details.txt)" \
     --validation "readStdin with 1-second timeout. Project root discovery via git. Package manager detection for npm/yarn/pnpm. Command execution with timeout and output capture. Error formatting follows BLOCKED: pattern. Tool availability checker works." \
     --tags "feature:<slug>,phase1,infrastructure,utilities"
   
   rm /tmp/task-details.txt
   ```
   
   **Remember**: The task breakdown document you created has ALL the implementation details. Your job is to COPY those details into STM, not summarize them!
   
   **Example: Creating a task with complete specification details**

   When creating STM tasks, include ALL implementation details from the task breakdown. Use one of these approaches:

   **Method 1: Direct multi-line string (for shorter content)**
   ```bash
   stm add "Implement auto-checkpoint hook logic" \
     --description "Build complete auto-checkpoint functionality with git integration" \
     --details "Technical Requirements:
   - Check if current directory is git repository
   - Detect uncommitted changes using git status --porcelain
   - Create timestamped stash with configurable prefix
   - Apply stash to restore working directory
   - Handle exit codes properly (0 for success, 1 for errors)

   Implementation from specification:
   [Copy full code blocks from task breakdown here]

   Key implementation notes:
   - Use child_process.spawn for git commands
   - Capture stdout to check for changes
   - Generate ISO timestamp and sanitize for git message
   - Chain git stash push and apply operations" \
     --validation "- Check git repository detection
   - Verify uncommitted changes detection
   - Test checkpoint creation format
   - Confirm working directory restoration
   - Validate exit codes
   - Test custom prefix support" \
     --tags "feature:<slug>,phase2,core,high-priority,large" \
     --status pending \
     --deps "35,36"
   ```

   **Method 2: Using Write tool for very large content**

   For tasks with extensive code blocks or very detailed requirements:

   1. Use Write tool to create a temp file with the full details
   2. Read the file content
   3. Pass to STM add command
   4. Clean up temp file

   This avoids bash parsing issues with complex multi-line content.

   ```bash
   # Create temp files with full content
   # (Use Write tool in practice, shown as bash here for illustration)

   # Create details file
   echo "Technical Requirements:
   - Full requirement 1
   - Full requirement 2

   Implementation code blocks:
   [Full code from task breakdown]

   Key notes:
   - Implementation detail 1
   - Implementation detail 2" > /tmp/stm-details.txt

   # Create validation file
   echo "Acceptance Criteria:
   - Test scenario 1
   - Test scenario 2
   - Edge case verification" > /tmp/stm-validation.txt

   # Read files and pass to STM
   DETAILS=$(cat /tmp/stm-details.txt)
   VALIDATION=$(cat /tmp/stm-validation.txt)

   stm add "Task title" \
     --description "Brief what and why" \
     --details "$DETAILS" \
     --validation "$VALIDATION" \
     --tags "feature:<slug>,appropriate,tags" \
     --status pending

   # Cleanup
   rm /tmp/stm-details.txt /tmp/stm-validation.txt
   ```
   
   **Important STM field usage**:
   - `--description`: Brief what & why (1-2 sentences max)
   - `--details`: Complete technical implementation including:
     - All technical requirements from spec
     - Full code examples with proper formatting (COPY from breakdown, don't summarize!)
     - Implementation steps and notes
     - Architecture decisions
     - **MUST be self-contained** - someone should be able to implement the task without seeing the original spec
   - `--validation`: Complete acceptance criteria including:
     - All test scenarios
     - Success/failure conditions
     - Edge cases to verify
   
   ## Content Size Guidelines
   
   - **Small tasks (< 20 lines)**: Can use heredocs directly in command
   - **Medium tasks (20-200 lines)**: Use temporary files to preserve formatting
   - **Large tasks (> 200 lines)**: Always use temporary files
   - **Tasks with code blocks**: MUST use heredocs or files (never inline)
   
   Example for medium/large content:
   ```bash
   # Extract the full implementation from your task breakdown
   cat > /tmp/stm-task-details.txt << 'EOF'
   [PASTE THE ENTIRE "Technical Requirements" and "Implementation" sections from the task breakdown]
   [Include ALL code blocks with proper formatting]
   [Include ALL technical notes and comments]
   EOF
   
   cat > /tmp/stm-task-validation.txt << 'EOF'
   [PASTE THE ENTIRE "Acceptance Criteria" section]
   [Include ALL test scenarios]
   EOF
   
   stm add "[Task Title]" \
     --description "[One line summary]" \
     --details "$(cat /tmp/stm-task-details.txt)" \
     --validation "$(cat /tmp/stm-task-validation.txt)" \
     --tags "feature:<slug>,appropriate,tags" \
     --deps "1,2,3"
   
   rm /tmp/stm-task-*.txt
   ```
   
   If STM is not available, use TodoWrite:
   ```javascript
   [
     {
       id: "1",
       content: "Phase 1: Set up TypeScript project structure",
       status: "pending",
       priority: "high"
     },
     {
       id: "2",
       content: "Phase 1: Configure build system with esbuild",
       status: "pending",
       priority: "high"
     },
     // ... additional tasks
   ]
   ```

6. **Save Task Breakdown**:
   - Save the detailed task breakdown document to `specs/<slug>/03-tasks.md` (using slug from "Extract Feature Slug" section)
   - For legacy paths, save to `specs/<spec-name>-tasks.md`
   - Create tasks in STM or TodoWrite for immediate tracking
   - Generate a summary report showing:
     - Total number of tasks
     - Breakdown by phase
     - Parallel execution opportunities
     - Task management system used (STM or TodoWrite)

## Output Format

### Task Breakdown Document
The generated markdown file includes:
- Executive summary
- Phase-by-phase task breakdown
- Dependency graph
- Risk assessment
- Execution strategy

### Task Management Integration
Tasks are immediately available in STM (if installed) or TodoWrite for:
- Progress tracking
- Status updates
- Blocking issue identification
- Parallel work coordination
- Dependency tracking (STM only)
- Persistent storage across sessions (STM only)

### Summary Report
Displays:
- Total tasks created
- Tasks per phase
- Critical path identification
- Recommended execution order

## Usage Examples

```bash
# Decompose a feature specification
/spec:decompose specs/feat-user-authentication.md

# Decompose a system enhancement spec
/spec:decompose specs/feat-api-rate-limiting.md
```

## Success Criteria

The decomposition is complete when:
- ✅ Task breakdown document is saved to specs directory
- ✅ All tasks are created in STM (if available) or TodoWrite for tracking
- ✅ **Tasks preserve ALL implementation details from the spec including:**
  - Complete code blocks and examples (not summarized)
  - Full technical requirements and specifications
  - Detailed step-by-step implementation instructions
  - All configuration examples
  - Complete acceptance criteria with test scenarios
- ✅ Foundation tasks are identified and prioritized
- ✅ Dependencies between tasks are clearly documented
- ✅ All tasks include testing requirements
- ✅ Parallel execution opportunities are identified
- ✅ **STM tasks use all three fields properly:**
  - `--description`: Brief what & why (1-2 sentences)
  - `--details`: Complete technical implementation from spec (ACTUAL CODE, not references)
  - `--validation`: Full acceptance criteria and test scenarios
- ✅ **Quality check passed**: Running `stm show [any-task-id]` displays full code implementations
- ✅ **No summary phrases**: Tasks don't contain "as specified", "from spec", or similar references

## Post-Creation Validation

After creating STM tasks, perform these checks:

1. **Sample Task Review**:
   ```bash
   # Pick a random task and check it has full implementation
   stm show [task-id] | grep -E "(as specified|from spec|see specification)"
   # Should return NO matches - if it does, the task is incomplete
   ```

2. **Content Length Check**:
   ```bash
   # Implementation tasks should have substantial details
   stm list --format json | jq '.[] | select(.details | length < 500) | {id, title}'
   # Review any tasks with very short details - they likely need more content
   ```

3. **Code Block Verification**:
   ```bash
   # Check that tasks contain actual code blocks
   stm grep "```" | wc -l
   # Should show many matches for tasks with code implementations
   ```

## Integration with Other Commands

- **Prerequisites**: Run `/spec:validate` first to ensure spec quality
- **Next step**: Use `/spec:execute` to implement the decomposed tasks
- **Progress tracking**:
  - With STM: `stm list --pretty --tag feature:<slug>` to see only this feature's tasks
  - With STM: `stm list --status pending --tag feature:<slug>` for pending tasks
  - With TodoWrite: Monitor task completion in session
- **Quality checks**: Run `/validate-and-fix` after implementation

## Best Practices

1. **Task Granularity**: Keep tasks focused on single objectives
2. **Dependencies**: Clearly identify blocking vs parallel work
3. **Testing**: Include test tasks for each component
4. **Documentation**: Add documentation tasks alongside implementation
5. **Phases**: Group related tasks into logical phases

## Incremental Mode

### Overview

Incremental mode allows `/spec:decompose` to intelligently re-decompose a specification after feedback has been incorporated via `/spec:feedback`. Instead of recreating all tasks, it:

1. **Preserves completed work** - Tasks marked as DONE are not regenerated
2. **Updates affected tasks** - In-progress tasks get changelog context appended
3. **Creates new tasks** - Only for work not covered by existing tasks
4. **Maintains numbering** - New tasks continue the sequence (e.g., 2.8, 2.9, 2.10)
5. **Tracks history** - Metadata section shows all decompose sessions

### How It Works

#### 1. Detection
When you run `/spec:decompose specs/<slug>/02-specification.md`, the command:
- Checks for existing STM tasks tagged with `feature:<slug>`
- Looks for the `03-tasks.md` file with decompose history
- Compares changelog timestamps to find new entries
- Determines mode: **Full** (first time), **Incremental** (has changes), or **Skip** (no changes)

#### 2. Preservation
For completed tasks (status = DONE in STM):
- Task details remain unchanged in 03-tasks.md
- Marked with ✅ DONE in task breakdown
- No STM task created (already exists and complete)
- Full implementation details preserved for reference

#### 3. Updates
For in-progress tasks affected by changelog:
- Marked with 🔄 UPDATED in task breakdown
- Update note added explaining what changed
- STM task details updated with changelog context
- Developer prompted to review new requirements

#### 4. Creation
For net-new work identified in changelog:
- Marked with ⏳ NEW in task breakdown
- Continues task numbering from existing phase
- New STM task created with incremental tag
- Links to Re-decompose Metadata for context

#### 5. Numbering Continuity
Task numbering is maintained across decompose sessions:
- Existing tasks keep their numbers (1.1, 1.2, 2.1, 2.2, etc.)
- New tasks continue the sequence in each phase
- Example: If Phase 2 has tasks 2.1-2.7, new tasks become 2.8, 2.9, 2.10

### Example

**First Decompose** (Full Mode):
```bash
/spec:decompose specs/my-feature/02-specification.md

# Output:
🆕 First-time decompose - Full mode
✅ Created 22 tasks across 4 phases
📄 Task breakdown saved to specs/my-feature/03-tasks.md
```

**After Feedback** (Incremental Mode):
```bash
# Developer runs /spec:feedback with issue
# Specification updated, changelog entry added
# Now re-decompose:

/spec:decompose specs/my-feature/02-specification.md

# Output:
🔄 Changelog changes detected - Incremental mode
   Last decompose: 2025-11-20
📊 Incremental Analysis:
   - Completed tasks to preserve: 8
   - New changelog entries: 2
📝 Updating STM tasks (incremental mode):
   🔄 Updated task 2.5: Add validation logic
   ⏳ Created task [2.8]: Implement incremental mode detection
   ⏳ Created task [2.9]: Add metadata tracking
   ⏳ Created task [2.10]: Create changelog parser
✅ Incremental decompose complete!
   - Preserved: 18 tasks
   - Updated: 2 tasks
   - Created: 3 tasks
```

**No Changes** (Skip Mode):
```bash
/spec:decompose specs/my-feature/02-specification.md

# Output:
✅ No changes since last decompose (2025-11-21)
   To force re-decompose, delete specs/my-feature/03-tasks.md
```

### Re-decompose Metadata Format

When incremental mode runs, the generated `03-tasks.md` includes a metadata section:

```markdown
## Re-decompose Metadata

### Decompose History
| Session | Date | Mode | Changelog Entries | New Tasks | Notes |
|---------|------|------|-------------------|-----------|-------|
| 1 | 2025-11-20 | Full | N/A | 22 | Initial decomposition |
| 2 | 2025-11-21 | Incremental | 2 | 3 | Added incremental mode |

### Current Session Details
- **Mode**: Incremental
- **Previous Decompose**: 2025-11-20
- **Current Decompose**: 2025-11-21
- **Changelog Entries Processed**: 2
- **Last Decompose**: 2025-11-21

### Changelog Entries (New Since Last Decompose)
1. **Date**: 2025-11-21
   **Issue**: Decompose creates duplicate tasks on re-run
   **Decision**: Add incremental mode with task preservation
   **Impact**: New tasks for detection, categorization, and metadata
   **Action**: Created tasks 2.8-2.10

### Task Changes Summary
- **Preserved**: 18 tasks (completed, no changes needed)
- **Updated**: 2 tasks (in-progress, affected by changelog)
- **Created**: 3 tasks (new work from changelog)
- **Total**: 23 tasks

### Execution Recommendations
1. Review updated task 2.5 for new validation requirements
2. Complete in-progress tasks before starting new work
3. Start new tasks in dependency order: 2.8 → 2.9 → 2.10
```

### Task Status Markers

In the task breakdown, tasks are marked with emoji indicators:

- **✅ DONE** - Completed in a previous session, preserved as-is
- **🔄 UPDATED** - In-progress, affected by changelog, needs review
- **⏳ NEW** - Created in this session based on changelog
- **No marker** - Pending from previous session, no changes

### STM Integration

Incremental mode modifies STM task creation:

**Preserved Tasks (DONE)**:
- No action - STM task already exists with status=done
- Task details preserved in 03-tasks.md for reference

**Updated Tasks (In-Progress)**:
- STM task details updated with incremental note
- Developer alerted to review changelog and spec changes
- Status remains as-is (pending/in-progress)

**New Tasks**:
- STM task created with `incremental` tag
- Tagged with `feature:<slug>,incremental,phase<N>`
- Details include link to Re-decompose Metadata

### Force Full Re-decompose

To force a full re-decompose (ignoring incremental mode):

```bash
# Delete the tasks file
rm specs/<slug>/03-tasks.md

# Run decompose
/spec:decompose specs/<slug>/02-specification.md
# Will run in full mode since no tasks file exists
```

Or manually delete STM tasks:
```bash
# Delete all tasks for a feature
stm list --tags "feature:<slug>" -f json | jq -r '.[].id' | xargs -I {} stm delete {}

# Run decompose
/spec:decompose specs/<slug>/02-specification.md
# Will run in full mode since no STM tasks exist
```

### Best Practices for Incremental Mode

1. **Always use `/spec:feedback` for changes** - This ensures changelog is properly updated
2. **Review updated tasks carefully** - Check what changed and why
3. **Complete tasks in order** - Finish updated tasks before starting new ones
4. **Check Re-decompose Metadata** - Understand what triggered the changes
5. **Use STM filtering** - `stm list --tags "feature:<slug>,incremental"` to see new work

### Troubleshooting

**Problem**: Incremental mode not detecting changes
- **Solution**: Ensure changelog entries have proper date format (YYYY-MM-DD)
- **Check**: Last Decompose date is correctly set in 03-tasks.md

**Problem**: Too many tasks marked as updated
- **Solution**: Changelog impact assessment may be broad - review and adjust
- **Option**: Delete 03-tasks.md and do full re-decompose if needed

**Problem**: Skip mode triggered but I have changes
- **Solution**: Changelog entries may predate last decompose - add new entry with current date
- **Option**: Force full re-decompose by deleting 03-tasks.md