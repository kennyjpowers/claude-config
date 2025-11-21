# Task Breakdown: Post-Implementation Feedback Workflow System

**Generated:** 2025-11-21
**Source:** specs/add-feedback-workflow-command/02-specification.md
**Feature Slug:** add-feedback-workflow-command
**STM Tasks Created:** 2025-11-21
**Current Decompose:** 2025-11-21

## Overview

This task breakdown implements a comprehensive feedback workflow system consisting of:
1. New `/spec:feedback` command for processing post-implementation feedback
2. Enhanced `/spec:decompose` with incremental mode for preserving completed work
3. Enhanced `/spec:execute` with resume capability for session continuity
4. Complete documentation and testing infrastructure

The system enables users to provide structured feedback after manual testing, make interactive decisions about addressing issues, and re-implement incrementally without duplicating completed work.

## Phase 1: Core Feedback Command (12 tasks)

### Task 1.1: Create /spec:feedback Command File Structure
**Description:** Create the markdown command file with frontmatter and basic structure
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.2

**Technical Requirements:**
- File location: `.claude/commands/spec/feedback.md`
- Frontmatter with description, category, allowed-tools, argument-hint
- Command syntax documentation
- Workflow steps outline (7 main steps)

**Implementation Steps:**
1. Create `.claude/commands/spec/` directory if doesn't exist
2. Create `feedback.md` file with YAML frontmatter:
   ```yaml
   ---
   description: Process post-implementation feedback with interactive decisions
   category: workflow
   allowed-tools: Read, Grep, Glob, Write, Edit, Task, AskUserQuestion, Bash(stm:*), Bash(claudekit:status stm)
   argument-hint: "<path-to-spec-file>"
   ---
   ```
3. Add command syntax section
4. Add workflow steps sections (1-7) as placeholders
5. Add example usage section

**Acceptance Criteria:**
- [ ] File created at `.claude/commands/spec/feedback.md`
- [ ] Valid YAML frontmatter with all required fields
- [ ] Command syntax documented: `/spec:feedback <path-to-spec-file>`
- [ ] 7 workflow step sections created as placeholders
- [ ] Example usage section present

### Task 1.2: Implement Slug Extraction Logic
**Description:** Extract feature slug from spec path for use in file paths and STM tags
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1

**Technical Requirements:**
- Pattern matching for `specs/<slug>/02-specification.md` format
- Handle legacy formats: `specs/feat-<slug>.md`, `specs/fix-<issue>-<desc>.md`
- Validation for path format
- Store slug for later use in feedback log path and STM task tags

**Implementation Steps:**
1. In Step 1 of command, add slug extraction logic:
   ```markdown
   1. Extract feature slug from path
      - Pattern: specs/<slug>/02-specification.md → slug is <slug>
      - Legacy: specs/feat-<slug>.md → slug is feat-<slug>
      - Legacy: specs/fix-<issue>-<desc>.md → slug is fix-<issue>-<desc>

      Example extraction:
      ```bash
      # Extract slug from path
      SPEC_PATH="$ARGUMENTS"

      # Feature-directory format
      if [[ "$SPEC_PATH" =~ ^specs/([^/]+)/02-specification\.md$ ]]; then
        SLUG="${BASH_REMATCH[1]}"
      # Legacy formats
      elif [[ "$SPEC_PATH" =~ ^specs/(feat|fix)-(.+)\.md$ ]]; then
        SLUG="${BASH_REMATCH[1]}-${BASH_REMATCH[2]}"
      else
        echo "❌ Error: Invalid spec path format"
        exit 1
      fi

      echo "Feature slug: $SLUG"
      ```
   ```

2. Store slug for use in:
   - Feedback log path: `specs/$SLUG/05-feedback.md`
   - STM task tags: `feature:$SLUG,feedback,deferred`

**Acceptance Criteria:**
- [ ] Extracts slug from `specs/my-feature/02-specification.md` → `my-feature`
- [ ] Handles legacy `specs/feat-authentication.md` → `feat-authentication`
- [ ] Handles legacy `specs/fix-123-bug-name.md` → `fix-123-bug-name`
- [ ] Validates path format and shows error for invalid paths
- [ ] Slug stored in variable for later use

### Task 1.3: Implement Prerequisite Validation
**Description:** Validate that implementation exists before accepting feedback
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.2 (needs slug)
**Can run parallel with:** Task 1.4

**Technical Requirements:**
- Check that `04-implementation.md` exists in feature directory
- Error message if missing: "No implementation found. Run /spec:execute first."
- Clear user guidance on next steps

**Implementation Steps:**
1. In Step 1 of command, add validation after slug extraction:
   ```markdown
   2. Validate prerequisites
      - Check 04-implementation.md exists
      ```bash
      IMPL_FILE="specs/$SLUG/04-implementation.md"

      if [ ! -f "$IMPL_FILE" ]; then
        echo "❌ Error: No implementation found"
        echo ""
        echo "You must complete implementation before providing feedback."
        echo "Run: /spec:execute specs/$SLUG/02-specification.md"
        exit 1
      fi

      echo "✅ Implementation summary found"
      ```
   ```

**Acceptance Criteria:**
- [ ] Checks for `specs/<slug>/04-implementation.md`
- [ ] Shows error if file missing
- [ ] Error message includes guidance to run `/spec:execute`
- [ ] Shows success confirmation if file exists
- [ ] Command exits gracefully on validation failure

### Task 1.4: Implement STM Availability Check
**Description:** Check if STM is installed and warn if not available (graceful degradation)
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.3

**Technical Requirements:**
- Run `claudekit status stm` to check availability
- Parse status: "Available and initialized", "Available but not initialized", "Not installed"
- Warn user if STM not available but continue
- Store STM availability flag for later conditional logic

**Implementation Steps:**
1. In Step 1 of command, add STM check:
   ```markdown
   3. Check STM availability
      ```bash
      STM_STATUS=$(claudekit status stm)
      STM_AVAILABLE=false

      if [[ "$STM_STATUS" == *"Available and initialized"* ]]; then
        STM_AVAILABLE=true
        echo "✅ STM available for task tracking"
      elif [[ "$STM_STATUS" == *"Available but not initialized"* ]]; then
        echo "⚠️  Warning: STM not initialized"
        echo "Run: stm init"
        echo "Continuing without STM..."
      else
        echo "⚠️  Warning: STM not installed"
        echo "Deferred feedback will be logged but not tracked in STM"
        echo "Install: npm install -g simple-task-master"
      fi
      ```
   ```

2. Use `$STM_AVAILABLE` flag in Step 6 when creating deferred tasks

**Acceptance Criteria:**
- [ ] Detects STM availability correctly
- [ ] Shows appropriate message for each status
- [ ] Warns but doesn't fail if STM unavailable
- [ ] Stores availability flag for later use
- [ ] Provides installation guidance when STM missing

### Task 1.5: Check for Incomplete Tasks
**Description:** Warn user about incomplete tasks but allow proceeding
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.2 (needs slug), Task 1.4 (needs STM check)

**Technical Requirements:**
- Query STM for in-progress tasks with `feature:<slug>` tag
- Count incomplete tasks
- Show warning with count but allow proceeding
- Skip this check if STM not available

**Implementation Steps:**
1. In Step 1 of command, add incomplete task check:
   ```markdown
   4. Check for incomplete tasks (if STM available)
      ```bash
      if [ "$STM_AVAILABLE" = true ]; then
        INCOMPLETE_COUNT=$(stm list --status in-progress --tag "feature:$SLUG" --format json | jq 'length')

        if [ "$INCOMPLETE_COUNT" -gt 0 ]; then
          echo "⚠️  Warning: You have $INCOMPLETE_COUNT tasks still in progress"
          echo "Feedback changes may affect them."
          echo ""
          read -p "Continue anyway? [Y/n] " -n 1 -r
          echo
          if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Feedback cancelled. Complete or defer in-progress tasks first."
            exit 0
          fi
        fi
      fi
      ```
   ```

**Acceptance Criteria:**
- [ ] Queries STM for in-progress tasks with correct tag
- [ ] Shows warning with count of incomplete tasks
- [ ] Prompts user to continue or cancel
- [ ] Allows proceeding if user confirms
- [ ] Skips check gracefully if STM unavailable

### Task 1.6: Implement Feedback Prompt
**Description:** Prompt user for single feedback item with clear instructions
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.5 (completes Step 1 validation)

**Technical Requirements:**
- Clear prompt: "Provide ONE specific piece of feedback from your testing"
- Examples of good feedback (3 examples)
- Capture full feedback description
- Store in variable for later use

**Implementation Steps:**
1. Implement Step 2 of command:
   ```markdown
   ## Step 2: Feedback Collection

   5. Prompt user for feedback item
      ```markdown
      Provide ONE specific piece of feedback from your testing:

      Examples of good feedback:
      - "Authentication fails when password contains special characters"
      - "Dashboard loading is slow with >100 items"
      - "Error messages are not user-friendly"

      Your feedback:
      ```

      Read feedback from user input and store in FEEDBACK variable.
   ```

2. Validate feedback is not empty
3. Store feedback for use in Steps 4-7

**Acceptance Criteria:**
- [ ] Clear prompt displayed with examples
- [ ] Captures full feedback text
- [ ] Validates feedback is not empty
- [ ] Stores feedback in variable for later steps
- [ ] Examples guide users to provide specific, actionable feedback

### Task 1.7: Implement Code Exploration
**Description:** Use Task agent with Explore subagent to investigate relevant code
**Size:** Large
**Priority:** High
**Dependencies:** Task 1.6 (needs feedback text)

**Technical Requirements:**
- Read spec's "Detailed Design" section for affected components
- Launch Task agent with Explore subagent
- Targeted exploration based on feedback type (bugs, performance, UX)
- Gather findings: where changes needed, blast radius, related code
- Store findings for presentation in Step 5

**Implementation Steps:**
1. Implement Step 3 of command:
   ```markdown
   ## Step 3: Code Exploration

   6. Explore relevant code based on feedback

      First, read the spec to identify affected components:
      ```
      Read specs/$SLUG/02-specification.md
      Extract "## 6. Detailed Design" section
      Identify components mentioned that relate to feedback
      ```

      Then launch exploration:
      ```
      Task tool:
      - description: "Explore code related to: $FEEDBACK"
      - subagent_type: Explore
      - prompt: |
          The user provided feedback: "$FEEDBACK"

          From the spec, these components may be affected:
          [List extracted components]

          Explore the codebase to find:
          1. Where changes would likely be needed
          2. Potential blast radius (related code affected)
          3. Current implementation that's causing the issue

          Feedback type categorization:
          - Bug reports → Focus on error handling, validation logic
          - Performance issues → Focus on query patterns, rendering logic
          - UX feedback → Focus on component structure, user flows

          Provide targeted findings, not a full codebase scan.
          Use "quick" thoroughness level.
      ```

      Store exploration results in EXPLORATION_FINDINGS variable.
   ```

**Acceptance Criteria:**
- [ ] Reads spec to identify affected components
- [ ] Launches Explore agent with targeted prompt
- [ ] Categorizes feedback type and adjusts focus
- [ ] Gathers specific findings (not full scan)
- [ ] Stores findings for later presentation
- [ ] Uses "quick" thoroughness for performance

### Task 1.8: Implement Research-Expert Invocation
**Description:** Ask user if they want research-expert consultation, invoke if yes
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.7 (after code exploration)

**Technical Requirements:**
- Use AskUserQuestion tool with single question
- Options: Yes (investigate approaches), No (continue with findings)
- If Yes: Launch research-expert agent
- Gather recommendations, alternatives, trade-offs
- Store research findings separate from exploration findings

**Implementation Steps:**
1. Implement Step 4 of command:
   ```markdown
   ## Step 4: Optional Research

   7. Ask user about research-expert consultation
      ```
      AskUserQuestion tool:
      - questions: [{
          question: "Should I consult research-expert for solution approaches?",
          header: "Research",
          multiSelect: false,
          options: [
            {
              label: "Yes",
              description: "Investigate solution approaches from industry best practices"
            },
            {
              label: "No",
              description: "Continue with code exploration findings only"
            }
          ]
        }]
      ```

      Store answer in RESEARCH_REQUESTED variable.

   8. If user selected "Yes", launch research-expert
      ```
      if [ "$RESEARCH_REQUESTED" = "Yes" ]; then
        Task tool:
        - description: "Research solutions for: $FEEDBACK"
        - subagent_type: research-expert
        - prompt: |
            Research solution approaches for this feedback:
            "$FEEDBACK"

            Code exploration found:
            $EXPLORATION_FINDINGS

            Provide:
            1. Industry best practices for addressing this issue
            2. Recommended approach with rationale
            3. Alternative approaches with trade-offs
            4. Security/performance considerations

            Focus on actionable recommendations.

        Store results in RESEARCH_FINDINGS variable.
      fi
      ```
   ```

**Acceptance Criteria:**
- [ ] Asks user via AskUserQuestion tool
- [ ] Two clear options presented
- [ ] Only invokes research-expert if user selects "Yes"
- [ ] Research prompt includes feedback and exploration context
- [ ] Stores research findings separately from exploration
- [ ] Skips gracefully if user selects "No"

### Task 1.9: Implement Interactive Decisions
**Description:** Present findings and gather user decisions with batched questions (2-4)
**Size:** Large
**Priority:** High
**Dependencies:** Task 1.8 (needs all findings)

**Technical Requirements:**
- Use AskUserQuestion tool with batched format (2-4 questions)
- Question 1: How to address? (implement/defer/out-of-scope)
- Question 2 (if implement): What scope? (minimal/comprehensive/phased)
- Question 3 (if applicable): Which approach? (from research/exploration)
- Question 4 (if applicable): What priority? (critical/high/medium)
- Dynamic questions based on previous answers
- Store all decisions for logging

**Implementation Steps:**
1. Implement Step 5 of command:
   ```markdown
   ## Step 5: Interactive Decisions

   9. Present findings and recommendations
      Display to user:
      ```
      ## Feedback Analysis

      ### Code Exploration Findings:
      $EXPLORATION_FINDINGS

      ### Research Insights (if consulted):
      $RESEARCH_FINDINGS

      ### Key Considerations:
      [Summarize important factors from findings]
      ```

   10. Gather decisions via batched questions
      ```
      AskUserQuestion tool:
      - questions: [
          {
            question: "How should we address this feedback?",
            header: "Action",
            multiSelect: false,
            options: [
              {
                label: "Implement now",
                description: "Update spec, re-decompose, re-execute to fix immediately"
              },
              {
                label: "Defer for later",
                description: "Create STM task, track in feedback log for future work"
              },
              {
                label: "Out of scope",
                description: "Log decision, no further action (not aligned with goals)"
              }
            ]
          },
          {
            question: "What scope of changes? (if implementing)",
            header: "Scope",
            multiSelect: false,
            options: [
              {
                label: "Minimal fix",
                description: "Address immediate issue only, smallest change"
              },
              {
                label: "Comprehensive",
                description: "Address root cause plus related issues"
              },
              {
                label: "Phased",
                description: "Immediate fix now + follow-up improvements later"
              }
            ]
          },
          {
            question: "Which technical approach? (if options available)",
            header: "Approach",
            multiSelect: false,
            options: [
              // Dynamic based on research/exploration findings
            ]
          },
          {
            question: "What priority level?",
            header: "Priority",
            multiSelect: false,
            options: [
              { label: "Critical", description: "Blocking issue, fix ASAP" },
              { label: "High", description: "Important improvement, prioritize" },
              { label: "Medium", description: "Nice-to-have enhancement" }
            ]
          }
        ]
      ```

      Store all answers in DECISIONS associative array.
   ```

**Acceptance Criteria:**
- [ ] Presents findings summary before questions
- [ ] Uses batched AskUserQuestion with 2-4 questions
- [ ] Question 2-4 conditional based on Question 1 answer
- [ ] All options have clear labels and descriptions
- [ ] Stores all decisions for later use
- [ ] Questions adapt based on research availability

### Task 1.10: Implement Feedback Log Creation/Update
**Description:** Create or update 05-feedback.md with decision log entry
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.9 (needs decisions)

**Technical Requirements:**
- File path: `specs/<slug>/05-feedback.md`
- Create with header if doesn't exist
- Append new entry if exists
- Auto-increment feedback number (#1, #2, #3...)
- Format with all required sections: Description, Findings, Decisions, Actions, Rationale
- Timestamp entry
- Link to STM task if deferred

**Implementation Steps:**
1. Implement Step 7 (part 1) of command:
   ```markdown
   ## Step 7: Update Feedback Log

   12. Create or update 05-feedback.md
      ```bash
      FEEDBACK_LOG="specs/$SLUG/05-feedback.md"

      # Get next feedback number
      if [ -f "$FEEDBACK_LOG" ]; then
        LAST_NUM=$(grep -oP "## Feedback #\K\d+" "$FEEDBACK_LOG" | tail -1)
        FEEDBACK_NUM=$((LAST_NUM + 1))
      else
        FEEDBACK_NUM=1
        # Create log with header
        cat > "$FEEDBACK_LOG" << EOF
      # Feedback Log: [Feature Name from spec]

      **Feature Slug:** $SLUG
      **Spec:** specs/$SLUG/02-specification.md
      **Created:** $(date +%Y-%m-%d)

      ## Overview

      This document tracks all feedback items received during testing and evolution of the feature.

      ---

      EOF
      fi

      # Append new entry
      cat >> "$FEEDBACK_LOG" << EOF
      ## Feedback #$FEEDBACK_NUM - [Brief description from feedback]
      **Date:** $(date '+%Y-%m-%d %H:%M:%S')
      **Reporter:** Manual Testing
      **Status:** [From DECISIONS - Implemented/Deferred/Out of Scope]
      **STM Task:** [Task ID if deferred, or N/A]
      **Spec Changelog:** [Date if implemented, or N/A]

      ### Feedback Description
      $FEEDBACK

      ### Code Exploration Findings
      $EXPLORATION_FINDINGS

      ### Research Insights
      $RESEARCH_FINDINGS

      ### Decisions Made
      $(format_decisions "$DECISIONS")

      ### Actions Taken
      [Generated based on DECISIONS - spec updated / STM task created / logged only]

      ### Rationale
      [Generated explanation of why these decisions make sense]

      ---

      EOF
      ```
   ```

**Acceptance Criteria:**
- [ ] Creates log file with header if doesn't exist
- [ ] Appends to existing log if present
- [ ] Auto-increments feedback number correctly
- [ ] All required sections present in entry
- [ ] Timestamp in YYYY-MM-DD HH:MM:SS format
- [ ] Links to STM task if deferred
- [ ] Preserves chronological order

### Task 1.11: Implement Spec Changelog Updates
**Description:** Update spec's changelog section with feedback-driven changes (implement only)
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.9 (needs decisions)
**Can run parallel with:** Task 1.10

**Technical Requirements:**
- Only update if decision is "Implement now"
- Add or create "## 18. Changelog" section
- Format entry with: date, source, issue, decision, changes, impact
- Preserve existing changelog entries
- Targeted updates (list specific sections/files affected)
- Append to end of file

**Implementation Steps:**
1. Implement Step 6 (part for "implement now") of command:
   ```markdown
   ## Step 6: Execute Actions (Implement Now Path)

   11a. Update spec changelog section
      ```bash
      if [ "${DECISIONS[action]}" = "Implement now" ]; then
        SPEC_FILE="specs/$SLUG/02-specification.md"

        # Check if changelog section exists
        if ! grep -q "## 18. Changelog" "$SPEC_FILE"; then
          # Add changelog section
          echo -e "\n## 18. Changelog\n" >> "$SPEC_FILE"
        fi

        # Create changelog entry
        CHANGELOG_ENTRY=$(cat <<EOF

      ### $(date +%Y-%m-%d): [Brief title from feedback]
      **Source:** Feedback from manual testing (05-feedback.md #$FEEDBACK_NUM)
      **Issue:** $FEEDBACK
      **Decision:** ${DECISIONS[scope]} - ${DECISIONS[approach]}

      **Changes to Specification:**

      [List specific sections affected - extract from exploration findings]
      - Section X: [Describe change]
      - Section Y: [Describe change]

      **Implementation Impact:**
      - Affects: [List files from exploration]
      - Estimated scope: [Based on ${DECISIONS[scope]}]

      **Next Steps:**
      1. Run: /spec:decompose specs/$SLUG/02-specification.md
      2. Then: /spec:execute specs/$SLUG/02-specification.md

      ---
      EOF
      )

        # Append to changelog section
        sed -i "/## 18. Changelog/a $CHANGELOG_ENTRY" "$SPEC_FILE"

        echo "✅ Updated spec changelog"
      fi
      ```
   ```

**Acceptance Criteria:**
- [ ] Only runs if decision is "Implement now"
- [ ] Creates "## 18. Changelog" section if missing
- [ ] Formats entry with all required fields
- [ ] Lists specific changes to spec sections
- [ ] Preserves existing changelog entries
- [ ] Shows next steps to user
- [ ] Appends entry in correct location

### Task 1.12: Implement Deferred Task Creation and Summary
**Description:** Create STM task for deferred feedback and display summary
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.9 (needs decisions), Task 1.4 (needs STM status)

**Technical Requirements:**
- Only create task if decision is "Defer" AND STM available
- Task tags: `feature:<slug>`, `feedback`, `deferred`, `<priority>`
- Task description: brief feedback summary
- Task details: full feedback context + findings
- Display summary with next steps for all decision paths
- Inform user about feedback log location

**Implementation Steps:**
1. Implement Step 6 (defer path) and Step 7 (summary) of command:
   ```markdown
   ## Step 6: Execute Actions (Defer Path)

   11b. Create STM task for deferred feedback
      ```bash
      if [ "${DECISIONS[action]}" = "Defer for later" ]; then
        if [ "$STM_AVAILABLE" = true ]; then
          # Create detailed task
          TASK_DETAILS=$(cat <<EOF
      Feedback from manual testing:
      $FEEDBACK

      Code Exploration Findings:
      $EXPLORATION_FINDINGS

      Research Insights:
      $RESEARCH_FINDINGS

      Recommended Approach:
      ${DECISIONS[approach]}

      When implementing:
      - Review feedback log: specs/$SLUG/05-feedback.md #$FEEDBACK_NUM
      - Consider ${DECISIONS[scope]} scope
      - Priority: ${DECISIONS[priority]}
      EOF
      )

          stm add "Deferred: [Brief from feedback]" \
            --description "Address feedback: ${FEEDBACK:0:80}..." \
            --details "$TASK_DETAILS" \
            --tags "feature:$SLUG,feedback,deferred,${DECISIONS[priority]}" \
            --status pending

          TASK_ID=$(stm list --tag feature:$SLUG,feedback --format json | jq -r '.[0].id')
          echo "✅ Created STM task #$TASK_ID"
        else
          echo "⚠️  STM not available - feedback logged but not tracked"
        fi
      fi
      ```

   ## Step 7: Display Summary

   13. Display comprehensive summary
      ```bash
      echo ""
      echo "╔═══════════════════════════════════════════════════╗"
      echo "║        Feedback Processing Complete               ║"
      echo "╚═══════════════════════════════════════════════════╝"
      echo ""
      echo "Decision: ${DECISIONS[action]}"
      echo "Priority: ${DECISIONS[priority]}"
      echo ""

      if [ "${DECISIONS[action]}" = "Implement now" ]; then
        echo "✅ Spec updated: specs/$SLUG/02-specification.md"
        echo "✅ Feedback logged: specs/$SLUG/05-feedback.md #$FEEDBACK_NUM"
        echo ""
        echo "Next Steps:"
        echo "1. /spec:decompose specs/$SLUG/02-specification.md"
        echo "2. /spec:execute specs/$SLUG/02-specification.md"
      elif [ "${DECISIONS[action]}" = "Defer for later" ]; then
        echo "✅ Feedback logged: specs/$SLUG/05-feedback.md #$FEEDBACK_NUM"
        if [ "$STM_AVAILABLE" = true ]; then
          echo "✅ STM task created: #$TASK_ID"
          echo ""
          echo "View deferred tasks:"
          echo "  stm list --tag feature:$SLUG,feedback,deferred"
        fi
      else
        echo "✅ Feedback logged: specs/$SLUG/05-feedback.md #$FEEDBACK_NUM"
        echo "Decision: Out of scope (no further action)"
      fi
      ```
   ```

**Acceptance Criteria:**
- [ ] Creates STM task only if defer + STM available
- [ ] Task includes full context (feedback + findings)
- [ ] Task tagged with feature:<slug>, feedback, deferred, priority
- [ ] Task stored with pending status
- [ ] Summary displays decision and actions taken
- [ ] Next steps shown for each decision path
- [ ] Feedback log location always shown

## Phase 2: Incremental Decompose (10 tasks)

### Task 2.1: Add Incremental Mode Detection Logic
**Description:** Detect if decompose should run in incremental mode based on changelog/tasks
**Size:** Medium
**Priority:** High
**Dependencies:** Phase 1 complete
**Can run parallel with:** Task 2.2

**Technical Requirements:**
- Check for existing STM tasks with `feature:<slug>` tag
- Check if changelog has new entries since last decompose
- Compare timestamps between 03-tasks.md and changelog
- Determine mode: Full (first run), Incremental (has changes), Skip (no changes)
- Display mode message to user

**Implementation Details:**
Add to `.claude/commands/spec/decompose.md` before task creation:

```markdown
## Incremental Mode Detection

Before creating tasks, check if this is incremental decompose:

```bash
# Query for existing tasks
EXISTING_TASKS=$(stm list --tag "feature:$SLUG" -f json 2>/dev/null)
TASK_COUNT=$(echo "$EXISTING_TASKS" | jq 'length')

if [ "$TASK_COUNT" -eq 0 ]; then
  MODE="full"
  echo "📋 Full Decompose: First time for this feature"
else
  # Check for new changelog entries
  SPEC_FILE="specs/$SLUG/02-specification.md"
  TASKS_FILE="specs/$SLUG/03-tasks.md"

  if [ ! -f "$TASKS_FILE" ]; then
    MODE="full"
    echo "📋 Full Decompose: Task file missing, regenerating"
  else
    # Get last decompose timestamp from tasks file
    LAST_DECOMPOSE=$(grep "**Current Decompose:**" "$TASKS_FILE" | cut -d: -f2- | xargs)

    # Check if changelog has entries after this timestamp
    if grep -A 1000 "## 18. Changelog" "$SPEC_FILE" | grep -q "### $(date -d "$LAST_DECOMPOSE + 1 second" '+%Y-%m-%d')"; then
      MODE="incremental"
      echo "📋 Incremental Mode: Detected new changelog entries since last decompose"
    else
      MODE="skip"
      echo "ℹ️  No new changes detected. Use --force to regenerate."
      exit 0
    fi
  fi
fi
```

Store MODE for use in task creation logic.
```

**Acceptance Criteria:**
- [ ] Detects first-time decompose (no STM tasks) → full mode
- [ ] Detects changelog changes → incremental mode
- [ ] Detects no changes → skip mode with message
- [ ] Compares timestamps correctly
- [ ] Displays clear mode message to user
- [ ] Stores mode for later conditional logic

### Task 2.2: Implement Changelog Timestamp Comparison
**Description:** Parse and compare timestamps between changelog and last decompose
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 2.1 (part of same logic)
**Can run parallel with:** Task 2.1

**Technical Requirements:**
- Extract timestamp from `03-tasks.md` "Re-decompose Metadata" section
- Parse changelog entries with dates
- Compare dates to find new entries
- Handle missing metadata (first decompose)
- Use date comparison logic that works cross-platform

**Implementation Details:**
Add timestamp comparison helper function:

```bash
# Function to compare changelog timestamps
has_new_changelog_entries() {
  local spec_file="$1"
  local last_decompose_date="$2"

  # Extract changelog section
  awk '/## 18. Changelog/,/^## [0-9]/' "$spec_file" | \
  grep -oP '^### \K\d{4}-\d{2}-\d{2}' | \
  while read -r entry_date; do
    if [[ "$entry_date" > "$last_decompose_date" ]]; then
      return 0  # Has new entries
    fi
  done

  return 1  # No new entries
}

# Usage in detection logic
if has_new_changelog_entries "$SPEC_FILE" "$LAST_DECOMPOSE"; then
  MODE="incremental"
fi
```

**Acceptance Criteria:**
- [ ] Extracts last decompose timestamp correctly
- [ ] Parses changelog entry dates correctly
- [ ] Compares dates accurately
- [ ] Handles missing last decompose date (returns true for first run)
- [ ] Works on macOS and Linux
- [ ] Returns boolean result for use in mode detection

### Task 2.3: Implement STM Task Query for Completed Work
**Description:** Query STM to identify completed tasks that should be preserved
**Size:** Small
**Priority:** High
**Dependencies:** Task 2.1 (needs incremental mode set)

**Technical Requirements:**
- Query STM with `feature:<slug>` tag
- Filter by status: "done"
- Extract task IDs and titles
- Store results for marking in task breakdown
- Handle empty result (no completed tasks)

**Implementation Details:**
```bash
# Query completed tasks
get_completed_tasks() {
  local slug="$1"

  stm list --tag "feature:$slug" --status done -f json | \
  jq -r '.[] | {id: .id, title: .title, phase: (.tags[] | select(startswith("phase")))} | "\(.phase):\(.id):\(.title)"'
}

# Store results
COMPLETED_TASKS=$(get_completed_tasks "$SLUG")

# Example output format:
# phase1:1:Set up project structure
# phase2:5:Implement auth validation
```

**Acceptance Criteria:**
- [ ] Queries STM with correct feature tag
- [ ] Filters for "done" status only
- [ ] Extracts task ID, title, and phase
- [ ] Returns parseable format
- [ ] Handles zero completed tasks gracefully
- [ ] Stores results for use in breakdown generation

### Task 2.4: Implement Changelog Analysis for Changes
**Description:** Extract specific changes from new changelog entries
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.2 (needs changelog parsing)

**Technical Requirements:**
- Extract changelog entries newer than last decompose
- Parse each entry for: issue, decision, changes list, impact
- Identify affected spec sections
- Determine which existing tasks might need updates
- Store structured change data for task creation

**Implementation Details:**
```bash
# Extract new changelog entries
extract_new_changelog_entries() {
  local spec_file="$1"
  local since_date="$2"

  awk -v since="$since_date" '
    /## 18. Changelog/ { in_changelog=1; next }
    /^## [0-9]/ && in_changelog { exit }
    in_changelog && /^### [0-9]{4}-[0-9]{2}-[0-9]{2}:/ {
      date = substr($2, 1, 10)
      if (date > since) {
        print_entry = 1
        print "ENTRY_START:" date
      } else {
        print_entry = 0
      }
    }
    in_changelog && print_entry { print }
  ' "$spec_file"
}

# Parse entry into structured data
parse_changelog_entry() {
  local entry="$1"

  # Extract fields
  ISSUE=$(echo "$entry" | grep "^\*\*Issue:\*\*" | cut -d: -f2-)
  DECISION=$(echo "$entry" | grep "^\*\*Decision:\*\*" | cut -d: -f2-)
  CHANGES=$(echo "$entry" | awk '/\*\*Changes to Specification:\*\*/,/\*\*Implementation Impact:\*\*/' | grep "^-")
  IMPACT=$(echo "$entry" | awk '/\*\*Implementation Impact:\*\*/,/\*\*Next Steps:\*\*/' | grep "^-")

  echo "ISSUE:$ISSUE"
  echo "DECISION:$DECISION"
  echo "CHANGES:$CHANGES"
  echo "IMPACT:$IMPACT"
}
```

**Acceptance Criteria:**
- [ ] Extracts only new changelog entries (after last decompose)
- [ ] Parses issue, decision, changes, impact for each entry
- [ ] Identifies affected spec sections from changes list
- [ ] Maps changes to potential existing tasks
- [ ] Returns structured data for task generation
- [ ] Handles multiple new entries

### Task 2.5: Implement Task Filtering Logic
**Description:** Filter tasks into preserve/update/create categories based on changelog
**Size:** Large
**Priority:** High
**Dependencies:** Task 2.3 (needs completed tasks), Task 2.4 (needs changes)

**Technical Requirements:**
- Three categories: preserve (completed, unchanged), update (in-progress, affected), create (new)
- Match changelog changes to existing tasks by affected components
- Preserve completed tasks without modification
- Flag in-progress tasks that need detail updates
- Identify net-new tasks from changelog
- Maintain task numbering for all categories

**Implementation Details:**
```bash
categorize_tasks() {
  local slug="$1"
  local completed_tasks="$2"
  local changelog_changes="$3"

  # Initialize categories
  declare -A PRESERVE_TASKS
  declare -A UPDATE_TASKS
  declare -A CREATE_TASKS

  # Get all existing tasks
  ALL_TASKS=$(stm list --tag "feature:$slug" -f json)

  # Process each existing task
  echo "$ALL_TASKS" | jq -r '.[] | "\(.id)|\(.status)|\(.title)|\(.details)"' | \
  while IFS='|' read -r id status title details; do
    if [ "$status" = "done" ]; then
      # Completed tasks are always preserved
      PRESERVE_TASKS["$id"]="$title"
    else
      # Check if changelog affects this task
      AFFECTED=false
      while read -r change; do
        if echo "$details" | grep -q "$change"; then
          AFFECTED=true
          break
        fi
      done <<< "$changelog_changes"

      if [ "$AFFECTED" = true ]; then
        UPDATE_TASKS["$id"]="$title"
      else
        PRESERVE_TASKS["$id"]="$title"
      fi
    fi
  done

  # Identify new tasks needed from changelog
  # (Tasks for changes not covered by existing tasks)
  while read -r change_entry; do
    COVERED=false
    for task_id in "${!PRESERVE_TASKS[@]}" "${!UPDATE_TASKS[@]}"; do
      task_details=$(stm show "$task_id" | grep -A 9999 "Details:")
      if echo "$task_details" | grep -q "$(echo "$change_entry" | cut -d: -f1)"; then
        COVERED=true
        break
      fi
    done

    if [ "$COVERED" = false ]; then
      # Generate new task for this change
      NEW_TASK_TITLE="Address changelog: $(echo "$change_entry" | cut -d: -f2 | head -c 50)"
      CREATE_TASKS["new-$(date +%s)"]="$NEW_TASK_TITLE"
    fi
  done <<< "$changelog_changes"

  # Output categorization
  echo "PRESERVE:${!PRESERVE_TASKS[@]}"
  echo "UPDATE:${!UPDATE_TASKS[@]}"
  echo "CREATE:${!CREATE_TASKS[@]}"
}
```

**Acceptance Criteria:**
- [ ] Categorizes all existing tasks correctly
- [ ] Preserves completed tasks unchanged
- [ ] Identifies tasks needing updates from changelog
- [ ] Creates new tasks for uncovered changelog items
- [ ] Maintains task IDs for preserve/update categories
- [ ] Generates appropriate new task IDs

### Task 2.6: Implement Task Numbering Continuity
**Description:** Maintain sequential task numbering when adding new tasks
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 2.5 (needs task categories)

**Technical Requirements:**
- Find highest task number in each phase (1.x, 2.x, 3.x, etc.)
- New tasks continue sequence: if phase 2 ends at 2.7, next is 2.8
- Preserve existing task numbers
- Update task breakdown to show continuity
- Maintain phase structure

**Implementation Details:**
```bash
get_next_task_number() {
  local phase="$1"
  local existing_tasks="$2"

  # Find highest number in this phase
  MAX_NUM=$(echo "$existing_tasks" | \
    grep "^Task $phase\." | \
    grep -oP "Task $phase\.\K\d+" | \
    sort -n | \
    tail -1)

  if [ -z "$MAX_NUM" ]; then
    echo "$phase.1"
  else
    echo "$phase.$((MAX_NUM + 1))"
  fi
}

# Usage when creating new tasks
PHASE=2  # From changelog analysis
NEXT_NUM=$(get_next_task_number "$PHASE" "$EXISTING_TASKS")
echo "Creating Task $NEXT_NUM"
```

**Acceptance Criteria:**
- [ ] Finds highest task number in phase correctly
- [ ] Increments by 1 for new tasks
- [ ] Handles empty phases (starts at .1)
- [ ] Maintains phase structure
- [ ] Works for all phases (1-4)
- [ ] Returns properly formatted task number

### Task 2.7: Generate Re-decompose Metadata Section
**Description:** Create metadata section showing decompose history and changes
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 2.5 (needs categorization)

**Technical Requirements:**
- Section added to `03-tasks.md`
- Decompose history table with sessions
- Current session details: mode, timestamps, entries processed
- Task changes summary: preserved count, updated count, created count
- Existing task status from STM with emoji indicators
- Execution recommendations

**Implementation Details:**
```markdown
## Re-decompose Metadata

### Decompose History

| Session | Date       | Mode        | Changelog Entries | New Tasks | Notes                    |
|---------|------------|-------------|-------------------|-----------|--------------------------|
| 1       | 2025-11-20 | Full        | N/A               | 15        | Initial decomposition    |
| 2       | 2025-11-21 | Incremental | 2                 | 3         | Feedback-driven changes  |

### Current Session Details

**Mode:** Incremental
**Previous Decompose:** 2025-11-20 10:30:00
**Current Decompose:** 2025-11-21 16:00:00
**Changelog Entries Processed:** 2

### Changelog Entries
1. **2025-11-21: Authentication Special Characters Fix**
   - Impact: Phase 2, Task 2.3 (auth validation)
   - Action: Created Task 2.8 for regex update

2. **2025-11-21: Dashboard Performance Optimization**
   - Impact: Phase 3, Task 3.1 (dashboard rendering)
   - Action: Created Tasks 3.6, 3.7 for virtualization

### Task Changes Summary
- **Preserved:** ${PRESERVE_COUNT} completed tasks
- **Updated:** ${UPDATE_COUNT} existing tasks
- **Created:** ${CREATE_COUNT} new tasks

### Existing Tasks Status (from STM at $(date '+%Y-%m-%d %H:%M:%S'))

**Phase 1: Foundation (Complete)**
${format_phase_tasks "phase1" "$STM_TASKS"}

**Phase 2: Core Features**
${format_phase_tasks "phase2" "$STM_TASKS"}

**Phase 3: Advanced Features**
${format_phase_tasks "phase3" "$STM_TASKS"}

**Phase 4: Documentation**
${format_phase_tasks "phase4" "$STM_TASKS"}

### Execution Recommendations
${generate_recommendations "$UPDATE_TASKS" "$CREATE_TASKS"}
```

Bash helper functions:
```bash
format_phase_tasks() {
  local phase="$1"
  local stm_tasks="$2"

  echo "$stm_tasks" | jq -r --arg phase "$phase" '
    .[] | select(.tags[] | contains($phase)) |
    "- Task \(.id): \(
      if .status == "done" then "✅ DONE"
      elif .status == "in-progress" then "🔄 IN PROGRESS"
      else "⏳ PENDING"
      end
    ) - \(.title)"
  '
}

generate_recommendations() {
  echo "1. Complete in-progress tasks: $(echo "$1" | wc -l) tasks"
  echo "2. Execute new tasks: $(echo "$2" | wc -l) tasks"
  echo "3. Then continue with pending tasks"
}
```

**Acceptance Criteria:**
- [ ] Metadata section added to 03-tasks.md
- [ ] History table shows all decompose sessions
- [ ] Current session details complete
- [ ] Changelog entries listed with actions
- [ ] Task changes summary accurate
- [ ] STM status displayed with emoji indicators
- [ ] Execution recommendations generated

### Task 2.8: Update Task Breakdown Format
**Description:** Modify 03-tasks.md to include preserved tasks with status markers
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.7 (needs metadata), Task 2.5 (needs categories)

**Technical Requirements:**
- Preserved tasks marked with ✅ DONE
- Updated tasks marked with 🔄 UPDATED (show what changed)
- New tasks marked with ⏳ NEW
- Original task structure maintained
- All task details preserved for completed tasks
- Append new tasks to appropriate phases

**Implementation Details:**
```bash
update_task_breakdown() {
  local tasks_file="$1"
  local preserve_tasks="$2"
  local update_tasks="$3"
  local create_tasks="$4"

  # Read existing breakdown
  EXISTING_BREAKDOWN=$(cat "$tasks_file")

  # For each preserved task, add ✅ marker
  for task_id in $preserve_tasks; do
    TASK_NUM=$(stm show "$task_id" | grep "Task" | grep -oP "Task \K[0-9.]+")
    sed -i "s/### Task $TASK_NUM:/### Task $TASK_NUM: ✅ DONE -/" "$tasks_file"
  done

  # For each updated task, add 🔄 marker and note
  for task_id in $update_tasks; do
    TASK_NUM=$(stm show "$task_id" | grep "Task" | grep -oP "Task \K[0-9.]+")
    UPDATE_NOTE="Updated: Affected by changelog changes"
    sed -i "s/### Task $TASK_NUM:/### Task $TASK_NUM: 🔄 UPDATED -/" "$tasks_file"
    sed -i "/### Task $TASK_NUM/a **Update Note:** $UPDATE_NOTE" "$tasks_file"
  done

  # Append new tasks to appropriate phases
  for new_task in $create_tasks; do
    PHASE=$(echo "$new_task" | cut -d: -f1)
    TASK_NUM=$(echo "$new_task" | cut -d: -f2)
    TASK_DETAILS=$(echo "$new_task" | cut -d: -f3-)

    # Find phase section and append
    sed -i "/## Phase $PHASE:/a \
    \n### Task $TASK_NUM: ⏳ NEW - $TASK_DETAILS\n" "$tasks_file"
  done
}
```

**Acceptance Criteria:**
- [ ] Preserved tasks show ✅ DONE marker
- [ ] Updated tasks show 🔄 UPDATED marker with note
- [ ] New tasks show ⏳ NEW marker
- [ ] Original task structure maintained
- [ ] All task details preserved
- [ ] New tasks appended to correct phases

### Task 2.9: Create STM Tasks for New Work Only
**Description:** Create STM tasks only for new/updated work, skip completed
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.5 (needs categories), Task 2.6 (needs numbering)

**Technical Requirements:**
- Skip creating STM tasks for preserved (completed) work
- Update STM task details for tasks marked "updated"
- Create new STM tasks for "create" category
- Use consistent tagging: `feature:<slug>,incremental,<phase>,<priority>`
- Maintain dependency tracking
- Link to original tasks if related

**Implementation Details:**
```bash
create_incremental_stm_tasks() {
  local slug="$1"
  local update_tasks="$2"
  local create_tasks="$3"

  # Update existing tasks with new details
  while read -r task_entry; do
    TASK_ID=$(echo "$task_entry" | cut -d: -f1)
    CHANGELOG_CHANGES=$(echo "$task_entry" | cut -d: -f2-)

    # Get existing task details
    EXISTING_DETAILS=$(stm show "$TASK_ID" --format json | jq -r '.details')

    # Append changelog updates
    NEW_DETAILS="$EXISTING_DETAILS

---
**Incremental Update:**
Affected by changelog changes:
$CHANGELOG_CHANGES

Review feedback log and spec changelog for context.
"

    # Update task
    stm update "$TASK_ID" --details "$NEW_DETAILS"
    echo "Updated STM task #$TASK_ID with changelog context"
  done <<< "$update_tasks"

  # Create new tasks
  while read -r task_entry; do
    TASK_NUM=$(echo "$task_entry" | cut -d: -f1)
    PHASE=$(echo "$TASK_NUM" | cut -d. -f1)
    TASK_TITLE=$(echo "$task_entry" | cut -d: -f2)
    TASK_DETAILS=$(echo "$task_entry" | cut -d: -f3-)

    # Create with full details from breakdown
    stm add "$TASK_TITLE" \
      --description "$(echo "$TASK_DETAILS" | head -1)" \
      --details "$TASK_DETAILS" \
      --tags "feature:$slug,incremental,phase$PHASE" \
      --status pending

    echo "Created STM task for Task $TASK_NUM"
  done <<< "$create_tasks"
}
```

**Acceptance Criteria:**
- [ ] Skips completed tasks (no duplicate STM entries)
- [ ] Updates existing task details with changelog context
- [ ] Creates new tasks for net-new work
- [ ] Tags include "incremental" for tracking
- [ ] Maintains phase and feature tags
- [ ] Links related tasks via dependencies

### Task 2.10: Update Decompose Documentation
**Description:** Add incremental mode documentation to decompose.md
**Size:** Small
**Priority:** Low
**Dependencies:** Tasks 2.1-2.9 complete

**Technical Requirements:**
- Add "Incremental Mode" section to `.claude/commands/spec/decompose.md`
- Explain detection logic
- Document metadata format
- Provide examples of incremental decompose
- Update success criteria to include incremental features

**Implementation Details:**
Add to `.claude/commands/spec/decompose.md`:

```markdown
## Incremental Mode

When re-running decompose after feedback-driven spec changes, the command automatically detects incremental mode and preserves completed work.

### How It Works

1. **Detection:** Checks for existing STM tasks + new changelog entries
2. **Preservation:** Completed tasks marked ✅ DONE, not regenerated
3. **Updates:** In-progress tasks updated with changelog context
4. **Creation:** New tasks added for uncovered changes
5. **Numbering:** New tasks continue sequence (e.g., 2.7 → 2.8)

### Example

```bash
# After feedback updates spec changelog
/spec:decompose specs/my-feature/02-specification.md

# Output:
📋 Incremental Mode: Detected new changelog entries since last decompose

Analyzing changelog...
- Found 2 new entries: Auth fix + Dashboard perf

Loading existing tasks...
- 12 tasks completed (preserved)
- 2 tasks in progress (updated with context)
- 3 tasks pending (preserved)

Creating new tasks...
✅ Created Task 2.8: Update password validation regex
✅ Created Tasks 3.6, 3.7: Implement virtualization

Updated: specs/my-feature/03-tasks.md
```

### Metadata Format

See "Re-decompose Metadata" section in generated 03-tasks.md for:
- Decompose history
- Changelog entries processed
- Task changes summary
- STM status snapshot
- Execution recommendations
```

**Acceptance Criteria:**
- [ ] Incremental mode section added to decompose.md
- [ ] Detection logic explained clearly
- [ ] Metadata format documented
- [ ] Example provided
- [ ] Success criteria updated

## Phase 3: Resume Execution (10 tasks)

### Task 3.1: Add Session Detection to Execute Command
**Description:** Detect if previous implementation session exists and load context
**Size:** Medium
**Priority:** High
**Dependencies:** Phase 2 complete
**Can run parallel with:** Task 3.2

**Technical Requirements:**
- Check if `04-implementation.md` exists
- Parse file to extract: last session date, tasks completed, tasks in progress
- Display resume message to user
- Store previous session context for use in execution
- Handle first-time execution (no previous session)

**Implementation Details:**
Add to `.claude/commands/spec/execute.md` at start:

```markdown
## Session Detection & Resume

Before executing tasks, check for previous progress:

```bash
# Check for existing implementation summary
IMPL_FILE="specs/$SLUG/04-implementation.md"
SESSION_NUM=1

if [ -f "$IMPL_FILE" ]; then
  # Extract previous session info
  LAST_SESSION=$(grep -oP "### Session \K\d+" "$IMPL_FILE" | tail -1)
  SESSION_NUM=$((LAST_SESSION + 1))

  LAST_DATE=$(grep "### Session $LAST_SESSION -" "$IMPL_FILE" | grep -oP "\d{4}-\d{2}-\d{2}")

  COMPLETED_TASKS=$(awk "/### Session $LAST_SESSION/,/^### Session|^##/" "$IMPL_FILE" | \
    grep "^- ✅" | wc -l)

  IN_PROGRESS_TASK=$(awk "/## Tasks In Progress/,/^##/" "$IMPL_FILE" | \
    grep "^- 🔄" | head -1)

  # Display resume info
  echo "🔄 Resuming implementation from Session $LAST_SESSION ($LAST_DATE)"
  echo "Previously completed: $COMPLETED_TASKS tasks"
  if [ -n "$IN_PROGRESS_TASK" ]; then
    echo "In progress: $IN_PROGRESS_TASK"
  fi

  # Extract files modified list
  FILES_MODIFIED=$(awk "/## Files Modified\/Created/,/^##/" "$IMPL_FILE" | grep "^-" | cut -d: -f2 | xargs)
  echo "Last modified: $FILES_MODIFIED"

  RESUME_MODE=true
else
  echo "📋 Starting new implementation (Session 1)"
  RESUME_MODE=false
fi
```
```

**Acceptance Criteria:**
- [ ] Checks for existing 04-implementation.md
- [ ] Parses last session number correctly
- [ ] Extracts completed task count
- [ ] Extracts in-progress task if any
- [ ] Extracts files modified list
- [ ] Displays clear resume message
- [ ] Handles first-time execution (no file)

### Task 3.2: Implement Implementation Summary Parsing
**Description:** Parse 04-implementation.md to extract structured session data
**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 3.1

**Technical Requirements:**
- Extract from each session: tasks completed, files modified, tests added, notes
- Parse "Tasks Completed", "Tasks In Progress", "Tasks Pending" sections
- Extract "Known Issues" list
- Parse "Files Modified/Created" grouped by type
- Return structured data for use in resume logic

**Implementation Details:**
```bash
parse_implementation_summary() {
  local impl_file="$1"
  local session_num="$2"

  # Initialize arrays
  declare -A SESSION_DATA

  # Extract session section
  SESSION_SECTION=$(awk "/### Session $session_num -/,/^### Session|^##/" "$impl_file")

  # Parse completed tasks
  COMPLETED_TASKS=$(echo "$SESSION_SECTION" | grep "^- ✅ \[Task" | grep -oP "\[Task \K[0-9.]+")
  SESSION_DATA[completed]="$COMPLETED_TASKS"

  # Parse files modified
  FILES_SECTION=$(awk "/## Files Modified\/Created/,/^##/" "$impl_file")
  SOURCE_FILES=$(echo "$FILES_SECTION" | awk "/Source files:/,/^-/" | grep "^  -" | cut -d- -f2 | xargs)
  TEST_FILES=$(echo "$FILES_SECTION" | awk "/Test files:/,/^-/" | grep "^  -" | cut -d- -f2 | xargs)
  SESSION_DATA[source_files]="$SOURCE_FILES"
  SESSION_DATA[test_files]="$TEST_FILES"

  # Parse known issues
  KNOWN_ISSUES=$(awk "/## Known Issues\/Limitations/,/^##/" "$impl_file" | grep "^-" | cut -d- -f2-)
  SESSION_DATA[known_issues]="$KNOWN_ISSUES"

  # Parse in-progress tasks
  IN_PROGRESS=$(awk "/## Tasks In Progress/,/^##/" "$impl_file" | grep "^- 🔄" | grep -oP "\[Task \K[0-9.]+")
  SESSION_DATA[in_progress]="$IN_PROGRESS"

  # Output structured data
  for key in "${!SESSION_DATA[@]}"; do
    echo "$key:${SESSION_DATA[$key]}"
  done
}

# Usage
PREV_SESSION_DATA=$(parse_implementation_summary "$IMPL_FILE" "$LAST_SESSION")
```

**Acceptance Criteria:**
- [ ] Parses tasks completed from session
- [ ] Extracts files modified (source + test)
- [ ] Extracts known issues list
- [ ] Extracts in-progress tasks
- [ ] Returns structured key:value format
- [ ] Handles multiple sessions correctly

### Task 3.3: Implement Completed Task Filtering
**Description:** Filter task list to skip tasks already completed
**Size:** Small
**Priority:** High
**Dependencies:** Task 3.2 (needs parsing)

**Technical Requirements:**
- Load task list from STM or task breakdown
- Cross-reference with completed tasks from summary
- Mark tasks as "skip" if completed
- Build filtered execution list
- Display execution plan to user

**Implementation Details:**
```bash
build_filtered_task_list() {
  local slug="$1"
  local completed_tasks="$2"

  # Get all tasks for feature
  ALL_TASKS=$(stm list --tag "feature:$slug" -f json)

  # Filter out completed
  FILTERED_TASKS=$(echo "$ALL_TASKS" | jq -r \
    --arg completed "$completed_tasks" \
    '[.[] | select(.id as $id | ($completed | contains($id) | not))] |
     sort_by(.tags[] | select(startswith("phase"))) |
     .[]'
  )

  # Count by status
  COMPLETED_COUNT=$(echo "$completed_tasks" | wc -w)
  PENDING_COUNT=$(echo "$FILTERED_TASKS" | jq -r 'select(.status == "pending")' | wc -l)
  INPROGRESS_COUNT=$(echo "$FILTERED_TASKS" | jq -r 'select(.status == "in-progress")' | wc -l)

  # Display execution plan
  echo "📋 Execution Plan:"
  echo "  Completed: $COMPLETED_COUNT tasks (skipping)"
  if [ $INPROGRESS_COUNT -gt 0 ]; then
    RESUME_TASK=$(echo "$FILTERED_TASKS" | jq -r 'select(.status == "in-progress") | .title' | head -1)
    echo "  Resuming: $RESUME_TASK"
  fi
  echo "  Pending: $PENDING_COUNT tasks"

  # Return filtered list
  echo "$FILTERED_TASKS"
}

# Usage
EXEC_TASKS=$(build_filtered_task_list "$SLUG" "$COMPLETED_TASKS")
```

**Acceptance Criteria:**
- [ ] Loads all tasks for feature
- [ ] Filters out completed tasks correctly
- [ ] Counts tasks by status
- [ ] Displays execution plan clearly
- [ ] Returns filtered task list
- [ ] Handles zero completed tasks

### Task 3.4: Implement In-Progress Task Resume Logic
**Description:** Resume in-progress tasks with context from previous session
**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.2 (needs session data)

**Technical Requirements:**
- Identify in-progress task from STM
- Extract progress notes from previous session
- Provide full context to implementation agent
- Agent prompt includes: what's done, what's remaining, known issues
- Mark task as resumed (not restarted)

**Implementation Details:**
```bash
resume_inprogress_task() {
  local task_id="$1"
  local prev_session_data="$2"

  # Get task details
  TASK_INFO=$(stm show "$task_id" --format json)
  TASK_TITLE=$(echo "$TASK_INFO" | jq -r '.title')
  TASK_DETAILS=$(echo "$TASK_INFO" | jq -r '.details')

  # Extract progress from previous session
  PROGRESS_NOTE=$(echo "$prev_session_data" | grep "in_progress_notes:" | cut -d: -f2-)
  FILES_DONE=$(echo "$prev_session_data" | grep "source_files:" | cut -d: -f2-)

  # Build resume context
  RESUME_CONTEXT="
RESUMING TASK (Session $SESSION_NUM)

**Previous Progress:**
$PROGRESS_NOTE

**Files Already Modified:**
$FILES_DONE

**Known Issues from Previous Session:**
$(echo "$prev_session_data" | grep "known_issues:" | cut -d: -f2-)

**Your Goal:**
Continue implementation of: $TASK_TITLE
DO NOT restart - build on existing work.
Review modified files first to understand current state.
"

  # Launch agent with resume context
  echo "🔄 Resuming Task $task_id: $TASK_TITLE"
  echo ""
  echo "$RESUME_CONTEXT"

  # Agent invocation includes resume context
  # (Implementation agent will receive this as part of prompt)
}
```

**Acceptance Criteria:**
- [ ] Identifies in-progress task correctly
- [ ] Extracts progress notes from prev session
- [ ] Builds comprehensive resume context
- [ ] Includes files already modified
- [ ] Includes known issues
- [ ] Agent receives resume context in prompt

### Task 3.5: Implement STM Task Status Cross-Reference
**Description:** Cross-reference STM task status with implementation summary
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 3.2 (needs parsing), Task 3.3 (needs filtering)

**Technical Requirements:**
- Query STM for all feature tasks
- Compare status with implementation summary
- Identify discrepancies (STM says done but summary doesn't list it)
- Reconcile differences automatically or warn user
- Update working state accordingly

**Implementation Details:**
```bash
cross_reference_task_status() {
  local slug="$1"
  local summary_completed="$2"

  # Get STM task status
  STM_DONE=$(stm list --tag "feature:$slug" --status done -f json | jq -r '.[].id')

  # Compare with summary
  DISCREPANCIES=()

  # Check: STM done but not in summary
  for task_id in $STM_DONE; do
    if ! echo "$summary_completed" | grep -q "$task_id"; then
      TASK_TITLE=$(stm show "$task_id" --format json | jq -r '.title')
      DISCREPANCIES+=("STM #$task_id marked done but not in summary: $TASK_TITLE")
    fi
  done

  # Check: Summary done but STM not done
  for task_id in $summary_completed; do
    STM_STATUS=$(stm show "$task_id" --format json | jq -r '.status')
    if [ "$STM_STATUS" != "done" ]; then
      TASK_TITLE=$(stm show "$task_id" --format json | jq -r '.title')
      DISCREPANCIES+=("Summary shows #$task_id done but STM status: $STM_STATUS")

      # Auto-reconcile: trust summary over STM
      stm update "$task_id" --status done
      echo "✓ Reconciled: Updated STM task #$task_id to done"
    fi
  done

  # Warn about discrepancies
  if [ ${#DISCREPANCIES[@]} -gt 0 ]; then
    echo "⚠️  Status Discrepancies Detected:"
    for disc in "${DISCREPANCIES[@]}"; do
      echo "  - $disc"
    done
  fi
}

# Usage during resume
cross_reference_task_status "$SLUG" "$COMPLETED_TASKS"
```

**Acceptance Criteria:**
- [ ] Queries STM for done tasks
- [ ] Compares with summary completed list
- [ ] Detects discrepancies in both directions
- [ ] Auto-reconciles (trusts summary)
- [ ] Warns user about discrepancies
- [ ] Updates STM to match summary

### Task 3.6: Implement Session-Based Summary Updates
**Description:** Append new session to implementation summary (don't overwrite)
**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.1 (needs session detection)

**Technical Requirements:**
- Preserve all existing content
- Add "### Session {N} - {date}" section
- Update summary sections incrementally (add to, don't replace)
- Append to "Files Modified/Created" lists
- Append to "Tests Added" lists
- Update "Tasks Completed" count
- Update "Known Issues" if new ones found
- Update "Next Steps"

**Implementation Details:**
```bash
update_implementation_summary() {
  local slug="$1"
  local session_num="$2"
  local completed_tasks="$3"
  local files_modified="$4"
  local tests_added="$5"

  IMPL_FILE="specs/$slug/04-implementation.md"

  # Read existing content
  EXISTING_CONTENT=$(cat "$IMPL_FILE")

  # Build new session section
  SESSION_SECTION="
### Session $session_num - $(date '+%Y-%m-%d')

$(format_session_tasks "$completed_tasks")
"

  # Insert session section after "## Tasks Completed" header
  awk -v session="$SESSION_SECTION" '
    /^## Tasks Completed/ {
      print $0
      print session
      next
    }
    {print}
  ' "$IMPL_FILE" > "$IMPL_FILE.tmp" && mv "$IMPL_FILE.tmp" "$IMPL_FILE"

  # Update Files Modified section (append new files)
  for file in $files_modified; do
    if ! grep -q "$file" "$IMPL_FILE"; then
      sed -i "/## Files Modified\/Created/,/^##/ {
        /^- \*\*Source files:\*\*/ a\  - $file
      }" "$IMPL_FILE"
    fi
  done

  # Update Tests Added section (append new tests)
  for test in $tests_added; do
    if ! grep -q "$test" "$IMPL_FILE"; then
      sed -i "/## Tests Added/,/^##/ {
        /^- Unit tests:/ a\  - $test
      }" "$IMPL_FILE"
    fi
  done

  # Update task counts
  TOTAL_COMPLETED=$(grep -c "^- ✅" "$IMPL_FILE")
  sed -i "s/\*\*Tasks Completed:\*\* [0-9]*/**Tasks Completed:** $TOTAL_COMPLETED/" "$IMPL_FILE"

  # Update last session date
  sed -i "s/\*\*Last Session:\*\* .*/**Last Session:** $(date '+%Y-%m-%d')/" "$IMPL_FILE"
}

format_session_tasks() {
  local tasks="$1"

  for task_id in $tasks; do
    TASK_TITLE=$(stm show "$task_id" --format json | jq -r '.title')
    FILES=$(stm show "$task_id" --format json | jq -r '.metadata.files_modified // "N/A"')
    TESTS=$(stm show "$task_id" --format json | jq -r '.metadata.tests_added // "N/A"')

    echo "- ✅ [Task $task_id] $TASK_TITLE"
    echo "  - Files modified: $FILES"
    echo "  - Tests added: $TESTS"
    echo "  - Notes: Completed in Session $session_num"
    echo ""
  done
}
```

**Acceptance Criteria:**
- [ ] Preserves all existing content
- [ ] Adds new session section
- [ ] Appends to file lists (no duplicates)
- [ ] Appends to test lists (no duplicates)
- [ ] Updates task counts correctly
- [ ] Updates last session date
- [ ] Session sections properly formatted

### Task 3.7: Add Session Markers and Metadata
**Description:** Add clear session delineation with metadata in summary
**Size:** Small
**Priority:** Low
**Dependencies:** Task 3.6 (part of summary updates)

**Technical Requirements:**
- Session marker: `---\n## Session {N}\n---`
- Metadata includes: date, time, trigger (manual/feedback-driven)
- Reference related feedback items if applicable
- Track who/what initiated session
- Visual separation between sessions

**Implementation Details:**
```markdown
Session marker format:

---
## Session 2
---

**Date:** 2025-11-21
**Time:** 16:30:00
**Trigger:** Feedback-driven changes (05-feedback.md #3)
**Initiated by:** User (via /spec:execute)

### Tasks Completed This Session
[Task list]

### Implementation Notes
[Session-specific notes]
```

Bash function:
```bash
add_session_marker() {
  local session_num="$1"
  local trigger="$2"
  local feedback_ref="$3"

  MARKER="
---
## Session $session_num
---

**Date:** $(date '+%Y-%m-%d')
**Time:** $(date '+%H:%M:%S')
**Trigger:** $trigger
$([ -n "$feedback_ref" ] && echo "**Related Feedback:** $feedback_ref")
**Initiated by:** User (via /spec:execute)
"

  echo "$MARKER"
}
```

**Acceptance Criteria:**
- [ ] Session markers clearly delineate sessions
- [ ] Metadata includes all required fields
- [ ] Links to feedback items when applicable
- [ ] Visual separation clear
- [ ] Consistent formatting across sessions

### Task 3.8: Implement Cross-Session Context for Agents
**Description:** Provide agents with context from previous sessions
**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.2 (needs parsing), Task 3.3 (needs filtering)

**Technical Requirements:**
- Extract relevant context from previous sessions
- Include: completed tasks, files modified, known issues, design decisions
- Format as agent prompt section
- Agent receives context before starting work
- Context helps agent understand existing implementation

**Implementation Details:**
```bash
build_agent_context() {
  local slug="$1"
  local task_id="$2"
  local prev_session_data="$3"

  CONTEXT="
═══════════════════════════════════════════════════
CONTEXT FROM PREVIOUS SESSIONS
═══════════════════════════════════════════════════

Feature: $slug

## Previous Implementation History

### Completed Tasks:
$(echo "$prev_session_data" | grep "completed:" | cut -d: -f2- | while read tid; do
  TITLE=$(stm show "$tid" --format json | jq -r '.title')
  echo "- ✅ Task $tid: $TITLE"
done)

### Files Already Modified:
$(echo "$prev_session_data" | grep "source_files:" | cut -d: -f2- | tr ' ' '\n' | sed 's/^/  - /')

### Tests Already Written:
$(echo "$prev_session_data" | grep "test_files:" | cut -d: -f2- | tr ' ' '\n' | sed 's/^/  - /')

### Known Issues to Be Aware Of:
$(echo "$prev_session_data" | grep "known_issues:" | cut -d: -f2- | sed 's/^/  - /')

### Design Decisions from Previous Sessions:
$(awk '/## Implementation Notes/,/^##/' "specs/$slug/04-implementation.md" | grep "^-" | tail -5)

═══════════════════════════════════════════════════
CURRENT TASK
═══════════════════════════════════════════════════

You are working on:
$(stm show "$task_id" --format json | jq -r '.title')

Task details:
$(stm show "$task_id" --format json | jq -r '.details')

Your goal: Implement this task BUILDING ON the existing work above.
Review the files already modified to understand current state before making changes.
"

  echo "$CONTEXT"
}

# Usage when launching implementation agent
AGENT_CONTEXT=$(build_agent_context "$SLUG" "$TASK_ID" "$PREV_SESSION_DATA")

# Include in Task tool prompt
Task tool:
- description: "Implement Task $TASK_ID"
- subagent_type: [appropriate specialist]
- prompt: |
    $AGENT_CONTEXT

    [Rest of task-specific instructions...]
```

**Acceptance Criteria:**
- [ ] Extracts completed tasks from previous sessions
- [ ] Lists files already modified
- [ ] Lists tests already written
- [ ] Includes known issues
- [ ] Includes design decisions (last 5)
- [ ] Formats clearly for agent reading
- [ ] Included in agent prompts automatically

### Task 3.9: Add Conflict Detection
**Description:** Detect if spec changed after task was completed
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 3.2 (needs parsing)

**Technical Requirements:**
- Compare spec changelog timestamps with task completion timestamps
- Detect if spec updated AFTER task marked done
- Warn user about potential conflicts
- Suggest reviewing if task needs updates
- Allow user to decide: re-execute or skip

**Implementation Details:**
```bash
detect_spec_conflicts() {
  local slug="$1"
  local completed_tasks="$2"

  # Get latest changelog entry date
  LATEST_CHANGELOG=$(awk '/## 18. Changelog/,/^## [0-9]/' "specs/$slug/02-specification.md" | \
    grep -oP "^### \K\d{4}-\d{2}-\d{2}" | head -1)

  # Check each completed task
  CONFLICTS=()

  for task_id in $completed_tasks; do
    # Get task completion date from STM
    TASK_DONE_DATE=$(stm show "$task_id" --format json | jq -r '.updated_at' | cut -d'T' -f1)

    if [[ "$LATEST_CHANGELOG" > "$TASK_DONE_DATE" ]]; then
      TASK_TITLE=$(stm show "$task_id" --format json | jq -r '.title')
      CONFLICTS+=("Task $task_id ($TASK_TITLE): Spec changed after completion")
    fi
  done

  # Display warnings
  if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo "⚠️  Potential Conflicts Detected:"
    for conflict in "${CONFLICTS[@]}"; do
      echo "  - $conflict"
    done
    echo ""
    echo "Spec changelog has entries after these tasks were completed."
    read -p "Review and re-execute affected tasks? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # Mark tasks for re-execution
      for task_id in $(echo "${CONFLICTS[@]}" | grep -oP "Task \K\d+"); do
        stm update "$task_id" --status pending
        echo "  Marked Task $task_id for re-execution"
      done
    fi
  fi
}

# Usage during resume
detect_spec_conflicts "$SLUG" "$COMPLETED_TASKS"
```

**Acceptance Criteria:**
- [ ] Compares changelog timestamps with task completion
- [ ] Detects conflicts (spec newer than task)
- [ ] Lists conflicted tasks clearly
- [ ] Warns user about potential issues
- [ ] Offers to mark for re-execution
- [ ] User can choose to skip or re-execute

### Task 3.10: Update Execute Documentation
**Description:** Add resume capability documentation to execute.md
**Size:** Small
**Priority:** Low
**Dependencies:** Tasks 3.1-3.9 complete

**Technical Requirements:**
- Add "Session Detection & Resume" section
- Explain how resume works
- Document session continuity features
- Provide examples of multi-session workflows
- Update success criteria

**Implementation Details:**
Add to `.claude/commands/spec/execute.md`:

```markdown
## Session Detection & Resume

When re-running execute after previous implementation, the command automatically detects prior progress and resumes from where you left off.

### How It Works

1. **Detection:** Checks for existing 04-implementation.md
2. **Context Loading:** Parses completed tasks, files modified, known issues
3. **Task Filtering:** Skips completed work automatically
4. **Resume:** Continues in-progress tasks with full context
5. **Session Tracking:** Appends new session, preserves history

### Example

```bash
# First execution (Session 1)
/spec:execute specs/my-feature/02-specification.md
# Completes tasks 1.1-1.5, 2.1-2.3
# Task 2.4 in progress

# Later: Provide feedback, update spec
/spec:feedback specs/my-feature/02-specification.md
# Creates new tasks 2.8, 3.6, 3.7

# Re-execution (Session 2)
/spec:execute specs/my-feature/02-specification.md

# Output:
🔄 Resuming implementation from Session 1 (2025-11-20)
Previously completed: 8 tasks
In progress: Task 2.4 (Add validation logic)
Last modified: src/auth.ts, src/validation.ts

📋 Execution Plan:
  Skipping: 8 completed tasks
  Resuming: Task 2.4 (Add validation logic)
  New: Tasks 2.8, 3.6, 3.7
  Pending: 5 other tasks

# Session 2 continues from Task 2.4...
# 04-implementation.md updated with "### Session 2" section
```

### Session Continuity Features

- **Smart Resume:** Agents receive context from previous sessions
- **No Duplication:** Completed work never re-executed
- **History Preservation:** All sessions tracked in 04-implementation.md
- **Conflict Detection:** Warns if spec changed after task completion
- **Cross-Session Context:** Agents know about prior work, issues, decisions
```

**Acceptance Criteria:**
- [ ] Resume section added to execute.md
- [ ] How it works explained step-by-step
- [ ] Example shows multi-session workflow
- [ ] Session continuity features listed
- [ ] Success criteria updated

## Phase 4: Documentation & Testing (12 tasks)

### Task 4.1: Write /spec:feedback Command Documentation
**Description:** Complete documentation for feedback command in feedback.md
**Size:** Medium
**Priority:** High
**Dependencies:** Phase 1 complete

**Technical Requirements:**
- Purpose and use case section
- Command syntax with all options
- Step-by-step workflow description (all 7 steps)
- Example usage scenarios (implement/defer/out-of-scope)
- Integration with decompose/execute
- Troubleshooting common issues

**Implementation Details:**
File: `.claude/commands/spec/feedback.md` (completion of Task 1.1)

Add comprehensive documentation sections:
1. **Purpose**: When and why to use feedback command
2. **Syntax**: `/spec:feedback <path-to-spec-file>`
3. **Workflow**: Detailed explanation of 7 steps
4. **Examples**:
   - Basic feedback → implement now
   - Performance issue → defer
   - Out of scope decision
5. **Integration**: How it fits with decompose/execute
6. **Troubleshooting**:
   - "No implementation found" error
   - STM not available warnings
   - Incomplete tasks warning

**Acceptance Criteria:**
- [ ] Purpose section explains use case clearly
- [ ] Command syntax documented with example
- [ ] All 7 workflow steps explained
- [ ] 3+ example scenarios provided
- [ ] Integration with other commands shown
- [ ] Troubleshooting section covers common issues

(Continuing with remaining 11 Phase 4 tasks in abbreviated form due to length...)

### Task 4.2: Update README.md with Feedback Workflow
**Description:** Add feedback phase to workflow diagram and examples in README
**Size:** Small
**Priority:** High
**Dependencies:** Task 4.1

Add feedback phase to main workflow diagram showing full cycle: IDEATION → SPECIFICATION → DECOMPOSITION → IMPLEMENTATION → FEEDBACK → RE-DECOMPOSITION → RE-IMPLEMENTATION → COMPLETION

### Task 4.3: Update CLAUDE.md with New Capabilities
**Description:** Add /spec:feedback to command overrides section with usage
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 4.1

### Task 4.4: Update .claude/README.md
**Description:** Add feedback command to component list and document integration
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 4.1

### Task 4.5: Create User Guide for Feedback Workflow
**Description:** Write comprehensive user guide with tips and best practices
**Size:** Medium
**Priority:** Low
**Dependencies:** Phase 1-3 complete

File: `docs/guides/feedback-workflow-guide.md`

### Task 4.6: Write API Documentation
**Description:** Document all file formats (feedback log, changelog, metadata)
**Size:** Medium
**Priority:** Low
**Dependencies:** Phase 1-3 complete

File: `docs/api/feedback-workflow.md`

### Task 4.7: Create Test Fixtures
**Description:** Create sample files for testing feedback workflow
**Size:** Medium
**Priority:** Medium
**Dependencies:** None (can run early)

Directory: `tests/fixtures/feedback-workflow/`

### Task 4.8: Write Test Scenarios Document
**Description:** Document all 5 test scenarios with setup/execution/verification
**Size:** Large
**Priority:** High
**Dependencies:** Task 4.7

File: `tests/scenarios/feedback-workflow-scenarios.md`

### Task 4.9: Create Test Execution Scripts
**Description:** Write bash scripts for automated scenario testing
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 4.8

Files: `tests/run-feedback-tests.sh` and individual scenario scripts

### Task 4.10: Write Manual Test Checklist
**Description:** Create checklist for critical path testing before release
**Size:** Small
**Priority:** High
**Dependencies:** Phase 1-3 complete

Section in specification already complete - formalize as standalone checklist

### Task 4.11: Perform Security Testing
**Description:** Execute security tests for path traversal, injection, etc.
**Size:** Medium
**Priority:** Critical
**Dependencies:** Phase 1-3 complete

Test all security scenarios from manual checklist

### Task 4.12: Final Integration Testing
**Description:** Execute complete feedback workflow end-to-end
**Size:** Large
**Priority:** Critical
**Dependencies:** All previous tasks complete

Test full cycle: execute → feedback → decompose → execute → verify

---

## Execution Strategy

### Critical Path
1. Phase 1 Tasks 1.1-1.12 (Core Feedback Command) - **Must complete first**
2. Phase 2 Tasks 2.1-2.10 (Incremental Decompose) - **Required for re-implementation**
3. Phase 3 Tasks 3.1-3.10 (Resume Execution) - **Required for session continuity**
4. Phase 4 Tasks 4.1-4.4 (Critical Documentation) - **Required for usability**
5. Phase 4 Tasks 4.8, 4.10-4.12 (Critical Testing) - **Required for quality**

### Parallel Execution Opportunities

**Phase 1:**
- Tasks 1.1 & 1.2 (structure + slug) can run parallel
- Tasks 1.3 & 1.4 (validation + STM) can run parallel
- Tasks 1.10 & 1.11 (feedback log + changelog) can run parallel

**Phase 2:**
- Tasks 2.1 & 2.2 (both part of mode detection) should run together
- Tasks 2.7 & 2.8 (metadata + format) can run parallel

**Phase 3:**
- Tasks 3.1 & 3.2 (detection + parsing) can run parallel
- Tasks 3.6 & 3.7 (summary + markers) should run together

**Phase 4:**
- Tasks 4.2, 4.3, 4.4 (all documentation updates) can run parallel
- Tasks 4.5 & 4.6 (user guide + API docs) can run parallel
- Tasks 4.7 & 4.8 (fixtures + scenarios) should run sequentially

### Recommended Order
1. Phase 1 complete (essential functionality)
2. Phase 4 Tasks 4.7-4.8 (set up testing early)
3. Phase 2 complete (incremental decompose)
4. Phase 3 complete (resume execution)
5. Phase 4 Tasks 4.1-4.6 (documentation)
6. Phase 4 Tasks 4.9-4.12 (testing & validation)

## Risk Assessment

**High Risk Areas:**
- Task 2.5 (Task filtering logic) - Complex categorization, high potential for bugs
- Task 3.5 (Status cross-reference) - Data consistency critical
- Task 3.6 (Summary updates) - Must preserve history, no data loss

**Mitigation:**
- Extensive testing on high-risk tasks
- Code review before marking complete
- Create backup before modifying files

**Dependencies:**
- STM availability (graceful degradation implemented)
- AskUserQuestion tool (required, no fallback)
- Git (required for changelog analysis)

## Summary

**Total Tasks:** 44
**By Phase:**
- Phase 1: 12 tasks (Core Feedback Command)
- Phase 2: 10 tasks (Incremental Decompose)
- Phase 3: 10 tasks (Resume Execution)
- Phase 4: 12 tasks (Documentation & Testing)

**By Priority:**
- Critical: 3 tasks (security + integration testing)
- High: 28 tasks (core functionality)
- Medium: 9 tasks (enhancements)
- Low: 4 tasks (documentation polish)

**By Size:**
- Small: 15 tasks
- Medium: 18 tasks
- Large: 11 tasks

**Estimated Execution Time:** Phase 1-3 can be implemented in 3-4 work sessions. Phase 4 adds 1-2 sessions for documentation and testing.

**Next Step:** Run `/spec:execute specs/add-feedback-workflow-command/02-specification.md` to begin implementation.