---
description: Implement a validated specification by orchestrating concurrent agents
category: validation
allowed-tools: Task, Read, TodoWrite, Grep, Glob, Bash(claudekit:status stm), Bash(stm:*), Bash(jq:*)
argument-hint: "<path-to-spec-file>"
---

# Implement Specification

Implement the specification at: $ARGUMENTS

!claudekit status stm

## Extract Feature Slug

Extract the feature slug from the spec path:
- If path is `specs/<slug>/02-specification.md` → slug is `<slug>`
- If path is `specs/feat-<slug>.md` (legacy) → slug is `feat-<slug>`
- If path is `specs/fix-<issue>-<desc>.md` (legacy) → slug is `fix-<issue>-<desc>`

Store the slug for use in:
1. Filtering STM tasks: `stm list --tag feature:<slug>`
2. Implementation summary path: `specs/<slug>/04-implementation.md`

Example: `specs/add-user-auth/02-specification.md` → slug is `add-user-auth`

## Session Detection & Resume

**Purpose:** Support multi-session implementation with session continuity. This allows you to resume from where you left off instead of starting over.

### How It Works

When you run `/spec:execute`, the command automatically:

1. **Detects Previous Sessions:** Checks if `specs/<slug>/04-implementation.md` exists
2. **Loads Context:** Extracts completed tasks, in-progress tasks, files modified, known issues
3. **Filters Task List:** Skips completed tasks, resumes in-progress tasks
4. **Provides Agent Context:** Agents receive full history (completed work, design decisions, known issues)
5. **Tracks Sessions:** Appends Session N to implementation summary, preserving all history

### Implementation

```bash
# Check for existing implementation summary
IMPL_FILE="specs/$SLUG/04-implementation.md"
RESUME_MODE=false
SESSION_NUM=1

if [ -f "$IMPL_FILE" ]; then
  echo "🔄 Detected previous implementation session"
  RESUME_MODE=true

  # Extract last session number
  LAST_SESSION=$(grep -E "^### Session [0-9]+" "$IMPL_FILE" | \
    sed -E 's/### Session ([0-9]+).*/\1/' | \
    sort -n | \
    tail -1)

  SESSION_NUM=$((LAST_SESSION + 1))

  # Extract last session date
  LAST_DATE=$(grep -E "^### Session $LAST_SESSION -" "$IMPL_FILE" | \
    sed -E 's/### Session [0-9]+ - (.*)/\1/')

  # Count completed tasks (all ✅ markers)
  COMPLETED_COUNT=$(grep -c "^- ✅ \[Task" "$IMPL_FILE" || echo "0")

  # Extract in-progress task (if any)
  IN_PROGRESS_TASK=$(awk '/^## Tasks In Progress/,/^## / {print}' "$IMPL_FILE" | \
    grep -E "^- 🔄 \[Task" | \
    head -1 | \
    sed -E 's/- 🔄 \[Task ([0-9]+)\].*/\1/')

  # Extract files modified
  FILES_MODIFIED=$(awk '/^## Files Modified\/Created/,/^## / {print}' "$IMPL_FILE" | \
    grep -E "^\s*-" | \
    head -5)

  echo "📋 Resume Information:"
  echo "  - Last session: Session $LAST_SESSION on $LAST_DATE"
  echo "  - Tasks completed: $COMPLETED_COUNT"
  if [ -n "$IN_PROGRESS_TASK" ]; then
    echo "  - In-progress task: Task $IN_PROGRESS_TASK (will resume)"
  fi
  echo "  - Files modified (recent):"
  echo "$FILES_MODIFIED" | sed 's/^/    /'
  echo ""
  echo "Starting Session $SESSION_NUM..."
  echo ""
else
  echo "🚀 Starting new implementation (Session 1)"
  echo ""
fi
```

### Parse Implementation Summary

Extract structured data from previous sessions:

```bash
# Function: parse_implementation_summary
# Extracts structured data from 04-implementation.md
# Args: impl_file, session_num (optional - if provided, only parse that session)
parse_implementation_summary() {
  local impl_file="$1"
  local target_session="$2"  # Optional

  if [ ! -f "$impl_file" ]; then
    echo "error:no_file"
    return 1
  fi

  # Extract completed tasks (all sessions or specific session)
  if [ -n "$target_session" ]; then
    # Get tasks from specific session
    COMPLETED_TASKS=$(awk "/^### Session $target_session -/,/^### Session [0-9]+|^## /" "$impl_file" | \
      grep -E "^- ✅ \[Task ([0-9]+)\]" | \
      sed -E 's/.*\[Task ([0-9]+)\].*/\1/' | \
      tr '\n' ',' | \
      sed 's/,$//')
  else
    # Get all completed tasks
    COMPLETED_TASKS=$(grep -E "^- ✅ \[Task ([0-9]+)\]" "$impl_file" | \
      sed -E 's/.*\[Task ([0-9]+)\].*/\1/' | \
      tr '\n' ',' | \
      sed 's/,$//')
  fi

  # Extract files modified (source files)
  SOURCE_FILES=$(awk '/^## Files Modified\/Created/,/^## / {print}' "$impl_file" | \
    awk '/^\*\*Source files:\*\*/,/^\*\*/ {print}' | \
    grep -E "^\s*-" | \
    sed 's/^\s*- //' | \
    tr '\n' '|' | \
    sed 's/|$//')

  # Extract test files
  TEST_FILES=$(awk '/^## Files Modified\/Created/,/^## / {print}' "$impl_file" | \
    awk '/^\*\*Test files:\*\*/,/^\*\*/ {print}' | \
    grep -E "^\s*-" | \
    sed 's/^\s*- //' | \
    tr '\n' '|' | \
    sed 's/|$//')

  # Extract known issues
  KNOWN_ISSUES=$(awk '/^## Known Issues\/Limitations/,/^## / {print}' "$impl_file" | \
    grep -E "^\s*-" | \
    sed 's/^\s*- //' | \
    tr '\n' '|' | \
    sed 's/|$//')

  # Extract in-progress tasks
  INPROGRESS_TASK=$(awk '/^## Tasks In Progress/,/^## / {print}' "$impl_file" | \
    grep -E "^- 🔄 \[Task ([0-9]+)\]" | \
    sed -E 's/.*\[Task ([0-9]+)\].*/\1/' | \
    head -1)

  INPROGRESS_STATUS=$(awk '/^## Tasks In Progress/,/^## / {print}' "$impl_file" | \
    grep -A 2 "^- 🔄 \[Task" | \
    grep "Current status:" | \
    sed 's/.*Current status: //')

  # Output structured data
  echo "completed_tasks:$COMPLETED_TASKS"
  echo "source_files:$SOURCE_FILES"
  echo "test_files:$TEST_FILES"
  echo "known_issues:$KNOWN_ISSUES"
  echo "inprogress_task:$INPROGRESS_TASK"
  echo "inprogress_status:$INPROGRESS_STATUS"
}

# Load previous session data if resuming
if [ "$RESUME_MODE" = true ]; then
  PREV_SESSION_DATA=$(parse_implementation_summary "$IMPL_FILE")
fi
```

### Filter Completed Tasks

Build execution plan by filtering out completed work:

```bash
# Function: build_filtered_task_list
# Filters task list to skip completed tasks
# Args: slug, completed_tasks (comma-separated IDs)
build_filtered_task_list() {
  local slug="$1"
  local completed_tasks="$2"

  # Get all tasks for this feature from STM
  ALL_TASKS=$(stm list --tags "feature:$slug" -f json)

  if [ -z "$completed_tasks" ]; then
    # No completed tasks, return all pending/in-progress
    FILTERED_TASKS=$(echo "$ALL_TASKS" | \
      jq -r '[.[] | select(.status == "pending" or .status == "in-progress")] | sort_by(.tags | map(select(startswith("phase"))) | .[0])')
  else
    # Filter out completed tasks
    FILTERED_TASKS=$(echo "$ALL_TASKS" | \
      jq -r --arg completed "$completed_tasks" '
        [.[] |
         select(.status == "pending" or .status == "in-progress") |
         select((.id | tostring) as $id | ($completed | split(",") | index($id)) == null)
        ] |
        sort_by(.tags | map(select(startswith("phase"))) | .[0])')
  fi

  # Count tasks by status
  COMPLETED_COUNT=$(echo "$completed_tasks" | tr ',' '\n' | wc -l | tr -d ' ')
  PENDING_COUNT=$(echo "$FILTERED_TASKS" | jq '[.[] | select(.status == "pending")] | length')
  INPROGRESS_COUNT=$(echo "$FILTERED_TASKS" | jq '[.[] | select(.status == "in-progress")] | length')

  echo "📊 Execution Plan:"
  echo "  - ✅ Completed: $COMPLETED_COUNT tasks (skipping)"
  if [ "$INPROGRESS_COUNT" -gt 0 ]; then
    echo "  - 🔄 In Progress: $INPROGRESS_COUNT task (will resume)"
  fi
  echo "  - ⏳ Pending: $PENDING_COUNT tasks (will execute)"
  echo ""

  echo "$FILTERED_TASKS"
}

# Build filtered task list if resuming
if [ "$RESUME_MODE" = true ]; then
  COMPLETED_TASKS=$(echo "$PREV_SESSION_DATA" | grep "^completed_tasks:" | cut -d: -f2)
  TASK_LIST=$(build_filtered_task_list "$SLUG" "$COMPLETED_TASKS")
else
  TASK_LIST=$(stm list --tags "feature:$SLUG" --status pending -f json)
fi
```

### Resume In-Progress Task

Provide full context when resuming interrupted work:

```bash
# Function: resume_inprogress_task
# Resumes in-progress task with context from previous session
# Args: task_id, prev_session_data
resume_inprogress_task() {
  local task_id="$1"
  local prev_data="$2"

  # Get task details
  TASK_INFO=$(stm show "$task_id" -f json)
  TASK_TITLE=$(echo "$TASK_INFO" | jq -r '.title')
  TASK_DETAILS=$(echo "$TASK_INFO" | jq -r '.details')

  # Extract context from previous session
  PROGRESS_NOTE=$(echo "$prev_data" | grep "^inprogress_status:" | cut -d: -f2-)
  FILES_DONE=$(echo "$prev_data" | grep "^source_files:" | cut -d: -f2 | tr '|' '\n')
  KNOWN_ISSUES=$(echo "$prev_data" | grep "^known_issues:" | cut -d: -f2 | tr '|' '\n')

  # Build resume context
  RESUME_CONTEXT="
RESUMING TASK FROM PREVIOUS SESSION

**Previous Progress:**
$PROGRESS_NOTE

**Files Already Modified:**
$FILES_DONE

**Known Issues from Previous Session:**
$KNOWN_ISSUES

**Your Goal:**
Resume work on: $TASK_TITLE

IMPORTANT:
- DO NOT restart from scratch
- Review the files already modified to understand what's done
- Continue from where the previous session left off
- Address any known issues if applicable
"

  echo "🔄 Resuming Task $task_id: $TASK_TITLE"
  echo ""
  echo "$RESUME_CONTEXT"
  echo ""

  # Return context for agent invocation
  echo "$RESUME_CONTEXT"
}

# Check for in-progress task
if [ "$RESUME_MODE" = true ]; then
  INPROGRESS_TASK=$(echo "$PREV_SESSION_DATA" | grep "^inprogress_task:" | cut -d: -f2)

  if [ -n "$INPROGRESS_TASK" ]; then
    RESUME_CONTEXT=$(resume_inprogress_task "$INPROGRESS_TASK" "$PREV_SESSION_DATA")
    # This context will be included in the agent prompt
  fi
fi
```

### Cross-Reference STM Task Status

Reconcile STM status with implementation summary:

```bash
# Function: cross_reference_task_status
# Cross-references STM task status with implementation summary
# Args: slug, summary_completed (comma-separated task IDs)
cross_reference_task_status() {
  local slug="$1"
  local summary_completed="$2"

  # Get STM tasks marked as done
  STM_DONE=$(stm list --tags "feature:$slug" --status done -f json | \
    jq -r '.[].id' | \
    tr '\n' ',' | \
    sed 's/,$//')

  DISCREPANCIES=()

  # Check: STM says done, but not in summary?
  if [ -n "$STM_DONE" ]; then
    for task_id in $(echo "$STM_DONE" | tr ',' ' '); do
      if ! echo "$summary_completed" | grep -q "\b$task_id\b"; then
        TASK_TITLE=$(stm show "$task_id" -f json | jq -r '.title')
        DISCREPANCIES+=("⚠️  Task $task_id marked done in STM but not in summary: $TASK_TITLE")
      fi
    done
  fi

  # Check: Summary says done, but not in STM? (auto-reconcile)
  if [ -n "$summary_completed" ]; then
    for task_id in $(echo "$summary_completed" | tr ',' ' '); do
      STM_STATUS=$(stm show "$task_id" -f json 2>/dev/null | jq -r '.status')
      if [ "$STM_STATUS" != "done" ] && [ "$STM_STATUS" != "null" ]; then
        TASK_TITLE=$(stm show "$task_id" -f json | jq -r '.title')
        echo "🔧 Auto-reconciling: Marking Task $task_id as done in STM (trusts summary)"
        stm update "$task_id" --status done
      fi
    done
  fi

  # Display discrepancies
  if [ ${#DISCREPANCIES[@]} -gt 0 ]; then
    echo "⚠️  Status Discrepancies Detected:"
    for disc in "${DISCREPANCIES[@]}"; do
      echo "   $disc"
    done
    echo ""
    echo "Note: Summary is considered source of truth. Review if needed."
    echo ""
  fi
}

# Reconcile status if resuming
if [ "$RESUME_MODE" = true ]; then
  COMPLETED_TASKS=$(echo "$PREV_SESSION_DATA" | grep "^completed_tasks:" | cut -d: -f2)
  cross_reference_task_status "$SLUG" "$COMPLETED_TASKS"
fi
```

### Detect Spec Conflicts

Warn if spec changed after task completion:

```bash
# Function: detect_spec_conflicts
# Detects if spec was updated after tasks were completed
# Args: slug, completed_tasks (comma-separated IDs)
detect_spec_conflicts() {
  local slug="$1"
  local completed_tasks="$2"
  local spec_file="specs/$slug/02-specification.md"

  if [ ! -f "$spec_file" ]; then
    return
  fi

  # Get latest changelog date from spec
  LATEST_CHANGELOG=$(awk '/^## Changelog/,/^## / {print}' "$spec_file" | \
    grep -E "^\*\*[0-9]{4}-[0-9]{2}-[0-9]{2}" | \
    head -1 | \
    sed -E 's/\*\*([0-9]{4}-[0-9]{2}-[0-9]{2})\*\*.*/\1/')

  if [ -z "$LATEST_CHANGELOG" ]; then
    return  # No changelog entries
  fi

  CHANGELOG_TS=$(date -j -f "%Y-%m-%d" "$LATEST_CHANGELOG" "+%s" 2>/dev/null || echo "0")

  CONFLICTS=()

  # Check each completed task
  for task_id in $(echo "$completed_tasks" | tr ',' ' '); do
    TASK_INFO=$(stm show "$task_id" -f json 2>/dev/null)
    if [ -z "$TASK_INFO" ]; then
      continue
    fi

    TASK_UPDATED=$(echo "$TASK_INFO" | jq -r '.updated')
    TASK_TS=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${TASK_UPDATED:0:19}" "+%s" 2>/dev/null || echo "0")

    if [ "$CHANGELOG_TS" -gt "$TASK_TS" ]; then
      TASK_TITLE=$(echo "$TASK_INFO" | jq -r '.title')
      CONFLICTS+=("Task $task_id: $TASK_TITLE (completed before spec update)")
    fi
  done

  if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo "⚠️  SPEC CONFLICT DETECTED"
    echo ""
    echo "The specification was updated AFTER these tasks were completed:"
    for conflict in "${CONFLICTS[@]}"; do
      echo "  - $conflict"
    done
    echo ""
    echo "This may mean these tasks need to be re-executed to incorporate spec changes."
    echo ""
    read -p "Would you like to mark these tasks for re-execution? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      for task_id in $(echo "${CONFLICTS[@]}" | grep -Eo "Task [0-9]+" | awk '{print $2}'); do
        echo "  Marking Task $task_id as pending..."
        stm update "$task_id" --status pending
      done
      echo "✅ Tasks marked for re-execution"
      echo ""
    else
      echo "Proceeding without re-execution. Review manually if needed."
      echo ""
    fi
  fi
}

# Check for conflicts if resuming
if [ "$RESUME_MODE" = true ]; then
  COMPLETED_TASKS=$(echo "$PREV_SESSION_DATA" | grep "^completed_tasks:" | cut -d: -f2)
  detect_spec_conflicts "$SLUG" "$COMPLETED_TASKS"
fi
```

### Build Agent Context

Provide comprehensive cross-session context to agents:

```bash
# Function: build_agent_context
# Builds cross-session context for agents
# Args: slug, task_id, prev_session_data
build_agent_context() {
  local slug="$1"
  local task_id="$2"
  local prev_data="$3"

  # Extract completed tasks
  COMPLETED_IDS=$(echo "$prev_data" | grep "^completed_tasks:" | cut -d: -f2)
  COMPLETED_LIST=""
  if [ -n "$COMPLETED_IDS" ]; then
    for cid in $(echo "$COMPLETED_IDS" | tr ',' ' '); do
      CTITLE=$(stm show "$cid" -f json 2>/dev/null | jq -r '.title')
      COMPLETED_LIST="$COMPLETED_LIST\n- Task $cid: $CTITLE"
    done
  fi

  # Extract files modified
  SOURCE_FILES=$(echo "$prev_data" | grep "^source_files:" | cut -d: -f2 | tr '|' '\n' | sed 's/^/  - /')

  # Extract tests written
  TEST_FILES=$(echo "$prev_data" | grep "^test_files:" | cut -d: -f2 | tr '|' '\n' | sed 's/^/  - /')

  # Extract known issues
  KNOWN_ISSUES=$(echo "$prev_data" | grep "^known_issues:" | cut -d: -f2 | tr '|' '\n' | sed 's/^/  - /')

  # Extract design decisions from implementation notes (last 5 sessions)
  IMPL_FILE="specs/$slug/04-implementation.md"
  DESIGN_DECISIONS=""
  if [ -f "$IMPL_FILE" ]; then
    DESIGN_DECISIONS=$(awk '/^## Implementation Notes/,/^## / {print}' "$IMPL_FILE" | \
      grep -A 10 "^### Session" | \
      tail -50)
  fi

  # Get current task details
  CURRENT_TASK=$(stm show "$task_id" -f json)
  TASK_TITLE=$(echo "$CURRENT_TASK" | jq -r '.title')
  TASK_DETAILS=$(echo "$CURRENT_TASK" | jq -r '.details')

  # Build context
  CONTEXT="
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CROSS-SESSION CONTEXT (Feature: $slug)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Completed Tasks in Previous Sessions:**
$COMPLETED_LIST

**Files Already Modified:**
$SOURCE_FILES

**Tests Already Written:**
$TEST_FILES

**Known Issues to Be Aware Of:**
$KNOWN_ISSUES

**Design Decisions from Previous Sessions:**
$DESIGN_DECISIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task $task_id: $TASK_TITLE**

$TASK_DETAILS

**Your Goal:**
Build on the existing implementation. Review the files already modified to understand the current state. Ensure your work integrates properly with what's already been done.
"

  echo "$CONTEXT"
}

# This function is called when launching agents in the implementation workflow
# Include the context in the agent prompt:
#
# Task tool:
# - description: "Implement [component]"
# - subagent_type: [specialist]
# - prompt: |
#     $(build_agent_context "$SLUG" "$TASK_ID" "$PREV_SESSION_DATA")
#
#     [Rest of agent prompt...]
```

### Update Implementation Summary

Append new session without overwriting history:

```bash
# Function: update_implementation_summary
# Appends new session to implementation summary
# Args: slug, session_num, completed_tasks, files_modified, tests_added
update_implementation_summary() {
  local slug="$1"
  local session_num="$2"
  local completed_tasks="$3"    # JSON array or comma-separated
  local files_modified="$4"     # Pipe-separated
  local tests_added="$5"        # Pipe-separated

  local impl_file="specs/$slug/04-implementation.md"

  if [ ! -f "$impl_file" ]; then
    echo "Error: Implementation file not found"
    return 1
  fi

  # Build session section
  SESSION_DATE=$(date "+%Y-%m-%d")
  SESSION_SECTION="
### Session $session_num - $SESSION_DATE

"

  # Format completed tasks
  for task_id in $(echo "$completed_tasks" | tr ',' ' '); do
    TASK_INFO=$(stm show "$task_id" -f json)
    TASK_TITLE=$(echo "$TASK_INFO" | jq -r '.title')
    SESSION_SECTION="$SESSION_SECTION- ✅ [Task $task_id] $TASK_TITLE
"
  done

  # Create temp file with updated content
  TMP_FILE=$(mktemp)

  # Insert session section after "## Tasks Completed" header
  awk -v section="$SESSION_SECTION" '
    /^## Tasks Completed/ {
      print
      print ""
      print section
      next
    }
    {print}
  ' "$impl_file" > "$TMP_FILE"

  # Update file lists (source files)
  if [ -n "$files_modified" ]; then
    for file in $(echo "$files_modified" | tr '|' ' '); do
      # Check if file already in list
      if ! grep -q "$file" "$TMP_FILE"; then
        # Append to Source files section
        awk -v file="  - $file" '
          /^\*\*Source files:\*\*/ {
            print
            getline
            print
            print file
            next
          }
          {print}
        ' "$TMP_FILE" > "$TMP_FILE.2"
        mv "$TMP_FILE.2" "$TMP_FILE"
      fi
    done
  fi

  # Update test lists
  if [ -n "$tests_added" ]; then
    for test in $(echo "$tests_added" | tr '|' ' '); do
      if ! grep -q "$test" "$TMP_FILE"; then
        awk -v test="  - $test" '
          /^- Unit tests:/ {
            print
            print test
            next
          }
          {print}
        ' "$TMP_FILE" > "$TMP_FILE.2"
        mv "$TMP_FILE.2" "$TMP_FILE"
      fi
    done
  fi

  # Update task completion count
  TOTAL_COMPLETED=$(grep -c "^- ✅ \[Task" "$TMP_FILE" || echo "0")
  sed -i '' "s/\*\*Tasks Completed:\*\* [0-9]*/\*\*Tasks Completed:\*\* $TOTAL_COMPLETED/" "$TMP_FILE"

  # Update last session date
  sed -i '' "s/\*\*Last Session:\*\* .*/\*\*Last Session:\*\* $SESSION_DATE/" "$TMP_FILE"

  # Replace original file
  mv "$TMP_FILE" "$impl_file"

  echo "✅ Updated implementation summary (Session $session_num)"
}

# Call this function after completing tasks in the current session
# Example: update_implementation_summary "$SLUG" "$SESSION_NUM" "23,24,25" ".claude/commands/spec/execute.md" ""
```

### Example: Multi-Session Workflow

**First Execution:**
```bash
$ /spec:execute specs/add-user-auth/02-specification.md

🚀 Starting new implementation (Session 1)

📊 Execution Plan:
  - ⏳ Pending: 8 tasks (will execute)

Proceeding with implementation...
[Implements Tasks 1-5, runs out of time]

✅ Implementation summary created: specs/add-user-auth/04-implementation.md
```

**After feedback creates new tasks:**
```bash
$ /spec:feedback specs/add-user-auth/02-specification.md
[Creates feedback log, updates spec changelog]
$ /spec:decompose specs/add-user-auth/02-specification.md
[Adds Tasks 9-12 for feedback items]
```

**Resume Execution:**
```bash
$ /spec:execute specs/add-user-auth/02-specification.md

🔄 Detected previous implementation session

📋 Resume Information:
  - Last session: Session 1 on 2025-11-21
  - Tasks completed: 5
  - In-progress task: Task 6 (will resume)
  - Files modified (recent):
    - src/auth/login.ts
    - src/auth/register.ts
    - tests/auth/login.test.ts

Starting Session 2...

📊 Execution Plan:
  - ✅ Completed: 5 tasks (skipping)
  - 🔄 In Progress: 1 task (will resume)
  - ⏳ Pending: 6 tasks (will execute)

🔄 Resuming Task 6: Implement password reset flow

[Provides agent with full context from Session 1]
[Completes Task 6, Tasks 7-12]

✅ Implementation summary updated (Session 2)
```

### Session Continuity Features

- **Smart Resume:** Automatically detects and resumes from previous sessions
- **No Duplication:** Skips completed tasks, only works on new/in-progress items
- **History Preservation:** All session data preserved in 04-implementation.md
- **Conflict Detection:** Warns if spec changed after task completion
- **Cross-Session Context:** Agents receive full history (completed work, design decisions, known issues)

## Pre-Execution Checks

1. **Check Task Management**:
   - If STM shows "Available but not initialized" → Run `stm init` first, then `/spec:decompose` to create tasks
   - If STM shows "Available and initialized" → Use STM for tasks
   - If STM shows "Not installed" → Use TodoWrite instead

2. **Verify Specification**:
   - Confirm spec file exists and is complete
   - Check that required tools are available
   - Stop if anything is missing or unclear

## Implementation Process

### 1. Analyze Specification and Previous Progress

**Read the specification** at the path provided to understand:
- What components need to be built
- Dependencies between components
- Testing requirements
- Success criteria

**Session Detection & Resume** (automatic):
The command automatically detects previous implementation sessions and loads context:

1. **Checks for existing `04-implementation.md`**
2. **Extracts session data:**
   - Last session number and date
   - Tasks already completed
   - Tasks in progress
   - Files already modified/created
   - Tests already written
   - Known issues encountered
3. **Displays resume information** to user
4. **Loads previous session data** for use throughout execution
5. **Filters task list** to skip completed work
6. **Reconciles STM status** with implementation summary
7. **Detects spec conflicts** (spec updated after task completion)

See "Session Detection & Resume" section above for implementation details.

If the file doesn't exist, this is the first execution run (Session 1).

### 2. Load or Create Tasks

**Using STM** (if available):
```bash
# Filter by feature slug to see only this feature's tasks
stm list --status pending --tag feature:<slug> -f json
```

**Using TodoWrite** (fallback):
Create tasks for each component in the specification

### 3. Implementation Workflow

For each task, follow this cycle:

**Available Agents:**
!`claudekit list agents`

#### Step 1: Implement

Launch appropriate specialist agent with cross-session context:

```
Task tool:
- description: "Implement [component name]"
- subagent_type: [choose specialist that matches the task]
- prompt: |
    # Cross-Session Context (if resuming)
    $(if [ "$RESUME_MODE" = true ]; then build_agent_context "$SLUG" "[task-id]" "$PREV_SESSION_DATA"; fi)

    # Current Task
    First run: stm show [task-id]
    This will give you the full task details and requirements.

    Then implement the component based on those requirements.
    Follow project code style and add error handling.

    If resuming: Review files already modified to understand existing work.
    Build on what's already been done, don't restart from scratch.

    Report back when complete.
```

**Note:** The `build_agent_context` function automatically provides agents with:
- Completed tasks from previous sessions
- Files already modified
- Tests already written
- Known issues to be aware of
- Design decisions from previous sessions

#### Step 2: Write Tests

Launch testing expert:

```
Task tool:
- description: "Write tests for [component]"
- subagent_type: testing-expert [or jest/vitest-testing-expert]
- prompt: |
    First run: stm show [task-id]
    
    Write comprehensive tests for the implemented component.
    Cover edge cases and aim for >80% coverage.
    Report back when complete.
```

Then run tests to verify they pass.

#### Step 3: Code Review (Required)

**Important:** Always run code review to verify both quality AND completeness. Task cannot be marked done without passing both.

Launch code review expert:

```
Task tool:
- description: "Review [component]"
- subagent_type: code-review-expert
- prompt: |
    First run: stm show [task-id]
    
    Review implementation for BOTH:
    1. COMPLETENESS - Are all requirements from the task fully implemented?
    2. QUALITY - Code quality, security, error handling, test coverage
    
    Categorize any issues as: CRITICAL, IMPORTANT, or MINOR.
    Report if implementation is COMPLETE or INCOMPLETE.
    Report back with findings.
```

#### Step 4: Fix Issues & Complete Implementation

If code review found the implementation INCOMPLETE or has CRITICAL issues:

1. Launch specialist to complete/fix:
   ```
   Task tool:
   - description: "Complete/fix [component]"
   - subagent_type: [specialist matching the task]
   - prompt: |
       First run: stm show [task-id]
       
       Address these items from code review:
       - Missing requirements: [list any incomplete items]
       - Critical issues: [list any critical issues]
       
       Update tests if needed.
       Report back when complete.
   ```

2. Re-run tests to verify fixes

3. Re-review to confirm both COMPLETE and quality standards met

4. Only when implementation is COMPLETE and all critical issues fixed:
   - If using STM: `stm update [task-id] --status done`
   - If using TodoWrite: Mark task as completed

#### Step 5: Commit Changes

Create atomic commit following project conventions:
```bash
git add [files]
git commit -m "[follow project's commit convention]"
```

### 4. Track Progress

Monitor implementation progress:

**Using STM:**
```bash
stm list --pretty --tag feature:<slug>              # View this feature's tasks
stm list --status pending --tag feature:<slug>      # Pending tasks for this feature
stm list --status in-progress --tag feature:<slug>  # Active tasks for this feature
stm list --status done --tag feature:<slug>         # Completed tasks for this feature
```

**Using TodoWrite:**
Track tasks in the session with status indicators.

### 5. Create or Update Implementation Summary

**Throughout implementation** (not just at the end), maintain an implementation summary:

**Output path:** `specs/<slug>/04-implementation.md` (or `IMPLEMENTATION_SUMMARY.md` for legacy paths)

**When to update:**
- After completing each major task or milestone
- When encountering blockers or issues
- At the end of an execution session
- When all tasks are complete

**How to update:**
- **First time:** Create file with initial structure (Session 1)
- **Resume sessions:** Use `update_implementation_summary` function to append Session N
- **IMPORTANT:** Always preserve existing content - never overwrite previous sessions
- Add new completed tasks to current session section
- Append new files/tests to master lists (avoid duplicates)
- Update task counts, dates, and status

**Use the provided function:**
```bash
update_implementation_summary "$SLUG" "$SESSION_NUM" "23,24,25" "file1.ts|file2.ts" "test1.test.ts"
```

This function:
- Appends new Session N section under "Tasks Completed"
- Updates file lists without duplicates
- Updates test lists without duplicates
- Recalculates total task completion count
- Updates last session date
- Preserves all previous session history

**Content structure:**

```markdown
# Implementation Summary: {Feature Name}

**Created:** {initial-date}
**Last Updated:** {current-date}
**Spec:** specs/{slug}/02-specification.md
**Tasks:** specs/{slug}/03-tasks.md

## Overview

{Brief description of what's being implemented}

## Progress

**Status:** {In Progress / Complete}
**Tasks Completed:** {X} / {Total}
**Last Session:** {current-date}

## Tasks Completed

### Session {N} - {date}
- ✅ [Task ID] {Task description}
  - Files modified: {list}
  - Tests added: {list}
  - Notes: {any relevant notes}

### Session {N-1} - {date}
- ✅ [Task ID] {Task description}
  - Files modified: {list}
  - Tests added: {list}
  - Notes: {any relevant notes}

## Tasks In Progress

- 🔄 [Task ID] {Task description}
  - Started: {date}
  - Current status: {description}
  - Blockers: {any blockers}

## Tasks Pending

- ⏳ [Task ID] {Task description}
- ⏳ [Task ID] {Task description}

## Files Modified/Created

{Organized list of all files changed, grouped by type:}
- **Source files:** {list}
- **Test files:** {list}
- **Configuration files:** {list}
- **Documentation files:** {list}

## Tests Added

{Summary of test coverage:}
- Unit tests: {count and key files}
- Integration tests: {count and key files}
- E2E tests: {count and key files}

## Known Issues/Limitations

{Any known issues, edge cases, or limitations}
- {Issue 1} - {Impact and potential solution}
- {Issue 2} - {Impact and potential solution}

## Blockers

{Any current blockers preventing progress:}
- {Blocker 1} - {What's needed to unblock}
- {Blocker 2} - {What's needed to unblock}

## Next Steps

{Recommended follow-up actions:}
- [ ] {Action 1}
- [ ] {Action 2}

## Implementation Notes

### Session {N}
{Notes about this session's implementation, design decisions, or context}

### Session {N-1}
{Previous session notes}

## Session History

- **{current-date}:** {Tasks completed this session}
- **{previous-date}:** {Tasks completed in previous session}
```

**Important:** Always preserve existing content when updating. Append new sessions rather than replacing old ones.

### 6. Complete Implementation

Implementation is complete when:
- All tasks are COMPLETE (all requirements implemented)
- All tasks pass quality review (no critical issues)
- All tests passing
- Documentation updated
- Implementation summary created

## If Issues Arise

If any agent encounters problems:
1. Identify the specific issue
2. Launch appropriate specialist to resolve
3. Or request user assistance if blocked