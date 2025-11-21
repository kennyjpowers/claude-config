# Task Breakdown: Post-Implementation Feedback Workflow System

**Generated:** 2025-11-21
**Source:** specs/add-feedback-workflow-command/02-specification.md
**Feature Slug:** add-feedback-workflow-command
**Last Decompose:** 2025-11-21
**Current Decompose:** 2025-11-21

## Re-decompose Metadata

### Decompose History

| Session | Date       | Mode        | Changelog Entries | New Tasks | Notes                              |
|---------|------------|-------------|-------------------|-----------|-----------------------------------|
| 1       | 2025-11-21 | Full        | N/A               | 44        | Initial decomposition             |
| 2       | 2025-11-21 | Incremental | 1                 | 5         | Simplify bash command complexity  |

### Current Session Details

**Mode:** Incremental
**Previous Decompose:** 2025-11-21 (earlier today)
**Current Decompose:** 2025-11-21
**Changelog Entries Processed:** 1

### Changelog Entries (New Since Last Decompose)

1. **Date**: 2025-11-21
   **Title**: Post-Implementation Feedback: Bash Command Complexity
   **Issue**: Feedback command Step 1 has 26 complex bash blocks with BASH_REMATCH, command substitution, parse errors
   **Decision**: Replace prescriptive bash with declarative guidance following execute.md pattern
   **Impact**: Affects `.claude/commands/spec/feedback.md` primarily Step 1 (lines 42-131)
   **Action**: Created tasks 1.13-1.17 for refactoring bash command patterns

### Task Changes Summary

- **Preserved**: 44 tasks (all completed in Session 1)
- **Updated**: 0 tasks (no in-progress tasks affected)
- **Created**: 5 new tasks (bash simplification work)
- **Total**: 49 tasks

### Existing Tasks Status (from STM at 2025-11-21)

**Phase 1: Core Feedback Command (12 tasks → 17 tasks)**
- Task 1.1: ✅ DONE - Create /spec:feedback command file structure
- Task 1.2: ✅ DONE - Implement slug extraction logic
- Task 1.3: ✅ DONE - Implement prerequisite validation
- Task 1.4: ✅ DONE - Implement STM availability check
- Task 1.5: ✅ DONE - Add feedback prompt
- Task 1.6: ✅ DONE - Implement code exploration
- Task 1.7: ✅ DONE - Implement research-expert invocation
- Task 1.8: ✅ DONE - Implement interactive decisions
- Task 1.9: ✅ DONE - Implement feedback log creation
- Task 1.10: ✅ DONE - Implement spec changelog updates
- Task 1.11: ✅ DONE - Implement deferred task creation
- Task 1.12: ✅ DONE - Add summary output
- Task 1.13: ⏳ NEW - Refactor slug extraction to declarative pattern
- Task 1.14: ⏳ NEW - Refactor STM status check to use !claudekit pattern
- Task 1.15: ⏳ NEW - Remove complex bash blocks from Step 1
- Task 1.16: ⏳ NEW - Update to declarative guidance following execute.md
- Task 1.17: ⏳ NEW - Test feedback command with simplified workflow

**Phase 2: Incremental Decompose (10 tasks)**
- Task 2.1: ✅ DONE - Detect incremental mode
- Task 2.2: ✅ DONE - Implement changelog timestamp comparison
- Task 2.3: ✅ DONE - Query STM for existing tasks
- Task 2.4: ✅ DONE - Implement changelog analysis
- Task 2.5: ✅ DONE - Implement task filtering logic
- Task 2.6: ✅ DONE - Implement task numbering continuity
- Task 2.7: ✅ DONE - Generate re-decompose metadata
- Task 2.8: ✅ DONE - Update task breakdown format
- Task 2.9: ✅ DONE - Create STM tasks for new work only
- Task 2.10: ✅ DONE - Update decompose documentation

**Phase 3: Resume Execution (10 tasks)**
- Task 3.1: ✅ DONE - Detect previous progress
- Task 3.2: ✅ DONE - Parse implementation summary
- Task 3.3: ✅ DONE - Extract and filter completed tasks
- Task 3.4: ✅ DONE - Implement in-progress task resume
- Task 3.5: ✅ DONE - Cross-reference STM task status
- Task 3.6: ✅ DONE - Implement session-based updates
- Task 3.7: ✅ DONE - Add session markers
- Task 3.8: ✅ DONE - Implement cross-session context
- Task 3.9: ✅ DONE - Add conflict detection
- Task 3.10: ✅ DONE - Update execute documentation

**Phase 4: Documentation & Testing (12 tasks)**
- Task 4.1: ✅ DONE - Write command documentation
- Task 4.2: ✅ DONE - Update README.md
- Task 4.3: ✅ DONE - Update CLAUDE.md
- Task 4.4: ✅ DONE - Update .claude/README.md
- Task 4.5: ✅ DONE - Create user guide
- Task 4.6: ✅ DONE - Write API documentation
- Task 4.7: ✅ DONE - Implement unit tests for feedback
- Task 4.8: ✅ DONE - Implement unit tests for incremental decompose
- Task 4.9: ✅ DONE - Implement unit tests for resume execution
- Task 4.10: ✅ DONE - Implement integration tests
- Task 4.11: ✅ DONE - Implement E2E test scenarios
- Task 4.12: ✅ DONE - Document testing approach

### Execution Recommendations

1. **Review the changelog entry** to understand the specific bash issues
2. **Execute new tasks in order**: 1.13 → 1.14 → 1.15 → 1.16 → 1.17
3. **Focus areas**:
   - Replace BASH_REMATCH patterns with simpler approaches
   - Use `!claudekit status stm` instead of `$(claudekit status stm)`
   - Remove associative arrays and complex heredocs
   - Follow execute.md's declarative pattern for guidance
4. **Test thoroughly** after refactoring to ensure workflow still works

---

## Overview

This task breakdown implements a comprehensive feedback workflow system consisting of:
1. New `/spec:feedback` command for processing post-implementation feedback
2. Enhanced `/spec:decompose` with incremental mode for preserving completed work
3. Enhanced `/spec:execute` with resume capability for session continuity
4. Complete documentation and testing infrastructure

The system enables users to provide structured feedback after manual testing, make interactive decisions about addressing issues, and re-implement incrementally without duplicating completed work.

**Incremental Update (Session 2):** This decompose session addresses feedback about bash command complexity in the feedback command. All previous work (44 tasks) is preserved as completed. New tasks focus on simplifying Step 1 validation logic.

## Phase 1: Core Feedback Command (17 tasks)

### Task 1.13: Refactor Slug Extraction to Declarative Pattern ⏳ NEW
**Description:** Replace complex BASH_REMATCH regex with simple declarative guidance or basename/dirname approach
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.2 (original slug extraction - completed)
**Can run parallel with:** None (modifies existing code)
**Added:** 2025-11-21

**Source:** Changelog entry "2025-11-21 - Post-Implementation Feedback: Bash Command Complexity"

**Current Implementation (Lines 76-94 of feedback.md):**
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

**Issues:**
- Uses BASH_REMATCH which causes parsing issues
- Complex regex patterns prone to errors
- Multiple conditional branches

**Required Changes:**

**Approach 1: Declarative Guidance (Recommended)**
Replace prescriptive bash with declarative instructions:
```markdown
1. Extract feature slug from the spec path

   The slug is needed for:
   - Feedback log path: `specs/<slug>/05-feedback.md`
   - STM task tags: `feature:<slug>`
   - Implementation summary path: `specs/<slug>/04-implementation.md`

   Path formats to support:
   - Feature directory: `specs/<slug>/02-specification.md` → slug is `<slug>`
   - Legacy feat: `specs/feat-<desc>.md` → slug is `feat-<desc>`
   - Legacy fix: `specs/fix-<issue>-<desc>.md` → slug is `fix-<issue>-<desc>`

   Extract the slug using simple path manipulation (basename, dirname, or string operations).
   Validate that the extracted slug matches expected format: lowercase alphanumeric with hyphens.
```

**Approach 2: Simple Bash (if bash is needed)**
```bash
# Extract slug using basename/dirname
SPEC_PATH="$ARGUMENTS"

# Check if feature-directory format
if [[ "$SPEC_PATH" == specs/*/02-specification.md ]]; then
  # Extract directory name between specs/ and /02-specification.md
  SLUG=$(echo "$SPEC_PATH" | cut -d'/' -f2)
else
  # Legacy format - extract filename without .md
  SLUG=$(basename "$SPEC_PATH" .md)
fi

# Validate slug format
if [[ ! "$SLUG" =~ ^[a-z0-9-]+$ ]]; then
  echo "❌ Error: Invalid slug format: $SLUG"
  echo "   Slug must be lowercase alphanumeric with hyphens"
  exit 1
fi

echo "📝 Feature slug: $SLUG"
```

**Acceptance Criteria:**
- [ ] Removes BASH_REMATCH usage completely
- [ ] Uses simple string operations (cut, basename) or declarative guidance
- [ ] Handles all three path formats correctly
- [ ] Includes slug validation (lowercase, alphanumeric, hyphens)
- [ ] Clear error messages for invalid paths
- [ ] Test: `specs/my-feature/02-specification.md` → `my-feature`
- [ ] Test: `specs/feat-user-auth.md` → `feat-user-auth`
- [ ] Test: `specs/invalid@path.md` → Error with clear message

---

### Task 1.14: Refactor STM Status Check to Use !claudekit Pattern ⏳ NEW
**Description:** Replace command substitution with direct !claudekit invocation pattern
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.4 (original STM check - completed)
**Can run parallel with:** Task 1.13
**Added:** 2025-11-21

**Source:** Changelog entry "2025-11-21 - Post-Implementation Feedback: Bash Command Complexity"

**Current Implementation (Lines 82-98 of feedback.md):**
```bash
# Check STM availability
STM_STATUS=$(claudekit status stm)

if [[ "$STM_STATUS" == *"not installed"* ]]; then
  echo "⚠️  Warning: STM not installed"
  echo "   Deferred feedback will be logged but not tracked in STM"
  STM_AVAILABLE=false
elif [[ "$STM_STATUS" == *"not initialized"* ]]; then
  echo "⚠️  Warning: STM not initialized"
  echo "   Run: stm init"
  STM_AVAILABLE=false
else
  STM_AVAILABLE=true
fi
```

**Issues:**
- Uses command substitution `$(...)` which doesn't work reliably
- String matching on output is fragile
- Boolean variable doesn't persist across Bash tool invocations

**Required Changes:**

**Approach 1: Declarative Guidance (Recommended)**
```markdown
3. Check STM availability using claudekit status

   Use the following command to check STM status:
   ```bash
   !claudekit status stm
   ```

   Expected outputs:
   - "Not installed" → STM not available (warn user, continue without STM)
   - "Available but not initialized" → STM needs init (warn user, continue without STM)
   - "Available and initialized" → STM ready (use for deferred tasks)

   Based on the status:
   - If not available/initialized: Display warning and note that deferred feedback will be logged but not tracked in STM
   - If available: Proceed with full STM integration for deferred tasks

   Store the STM availability state for later use when creating deferred tasks in Step 6.
```

**Approach 2: Simple Bash Pattern**
```bash
# Check STM availability
!claudekit status stm

# Read the output and provide guidance
echo ""
echo "STM Status Check:"
echo "- If 'Not installed': Feedback will be logged but deferred items won't create STM tasks"
echo "- If 'Available but not initialized': Run 'stm init' first, or continue without STM tracking"
echo "- If 'Available and initialized': Deferred feedback can be tracked in STM"
echo ""

# Prompt user to confirm proceeding
read -p "Continue with feedback workflow? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
  echo "Feedback workflow cancelled"
  exit 0
fi
```

**Acceptance Criteria:**
- [ ] Uses `!claudekit status stm` pattern (NOT command substitution)
- [ ] Removes string matching on command output
- [ ] Provides clear user guidance for each status
- [ ] No boolean variables that need persistence
- [ ] Allows workflow to continue regardless of STM status
- [ ] Clear warnings when STM unavailable
- [ ] Test: STM not installed → shows warning, allows continuation
- [ ] Test: STM installed → proceeds normally

---

### Task 1.15: Remove Complex Bash Blocks from Step 1 ⏳ NEW
**Description:** Eliminate associative arrays, heredocs, and other complex bash patterns from validation step
**Size:** Medium
**Priority:** High
**Dependencies:** Tasks 1.13, 1.14
**Can run parallel with:** None (depends on previous refactors)
**Added:** 2025-11-21

**Source:** Changelog entry "2025-11-21 - Post-Implementation Feedback: Bash Command Complexity"

**Current Implementation Issues:**
- Lines 42-131 contain 26 bash code blocks
- Uses `declare -A` associative arrays
- Uses `cat <<'EOF'` heredoc patterns
- Nested parentheses and complex conditionals
- Variables don't persist between Bash tool invocations

**Problematic Patterns to Remove:**

**Pattern 1: Associative Arrays**
```bash
# REMOVE THIS
declare -A DECISIONS
DECISIONS["address"]=""
DECISIONS["scope"]=""
```

**Pattern 2: Heredocs for Multi-line Content**
```bash
# REMOVE THIS
cat <<'EOF' > /tmp/feedback.txt
Multi-line content here
EOF
```

**Pattern 3: Nested Command Substitution**
```bash
# REMOVE THIS
TASKS=$(echo "$(stm list --tags feature:$SLUG -f json)" | jq '. | length')
```

**Required Changes:**

Replace all complex bash patterns with one of these approaches:

**Approach 1: Use Claude's Tools Directly**
```markdown
4. Check for incomplete tasks

   Query STM for in-progress tasks using:
   ```bash
   stm list --status in-progress --tags "feature:$SLUG" -f json
   ```

   If any tasks are found:
   - Display the list of incomplete tasks
   - Warn: "You have X incomplete tasks. Feedback changes may affect them."
   - Ask user if they want to proceed anyway

   Allow proceeding even with incomplete tasks (with warning).
```

**Approach 2: Simple Sequential Commands**
```bash
# Check for incomplete tasks
echo "Checking for incomplete tasks..."
stm list --status in-progress --tags "feature:add-feedback-workflow-command"

# If output is not empty, show warning
echo ""
echo "⚠️  Note: If you have incomplete tasks, feedback changes may affect them."
echo "   You can proceed, but be aware of potential conflicts."
echo ""
```

**Specific Removals:**
1. Remove all `declare -A` statements
2. Remove all `cat <<'EOF'` heredoc patterns
3. Replace with Write tool for file creation
4. Replace with direct tool invocation for querying
5. Use AskUserQuestion for decisions (not bash variables)

**Acceptance Criteria:**
- [ ] Zero associative arrays in Step 1
- [ ] Zero heredocs in Step 1
- [ ] No nested command substitution
- [ ] All file writes use Write tool or simple redirection
- [ ] All queries use direct tool invocation
- [ ] Variables only used within single Bash invocation
- [ ] Step 1 readable and maintainable
- [ ] Test: Complete Step 1 without bash parse errors

---

### Task 1.16: Update to Declarative Guidance Following execute.md Pattern ⏳ NEW
**Description:** Rewrite Step 1 to use declarative markdown guidance instead of prescriptive bash scripts
**Size:** Large
**Priority:** High
**Dependencies:** Tasks 1.13, 1.14, 1.15
**Can run parallel with:** None (comprehensive rewrite)
**Added:** 2025-11-21

**Source:** Changelog entry "2025-11-21 - Post-Implementation Feedback: Bash Command Complexity"

**Reference Pattern:** `.claude/commands/spec/execute.md`

**Current Problem:**
Step 1 (lines 42-131) is 90 lines of prescriptive bash code. This approach:
- Doesn't work well with Bash tool limitations
- Creates parse errors with complex syntax
- Doesn't persist variables across invocations
- Is hard to read and maintain

**Execute.md Pattern (Declarative):**
```markdown
## Instructions for Claude:

1. **Check Prerequisites**
   - Read the spec file to extract feature information
   - Verify that 03-tasks.md exists (task breakdown)
   - Check STM status using: `!claudekit status stm`

2. **Load Tasks**
   - Query STM for tasks tagged with feature:<slug>
   - Filter by status: pending (to execute) and in-progress (to resume)
   - Create execution plan showing order

3. **Execute Each Task**
   For each task:
   - Read full task details from STM
   - Determine appropriate specialist agent
   - Launch agent with task context
   - Review implementation
   - Run tests
   - Mark task as done if successful
```

**Required Rewrite of Step 1:**

Transform from:
```bash
# 90 lines of bash scripts with:
BASH_REMATCH patterns
Command substitution
Associative arrays
Heredocs
Complex conditionals
```

To:
```markdown
## Instructions for Claude:

**Step 1: Validation & Setup**

1. **Extract Feature Slug**

   Extract the slug from the spec path for use in file paths and STM tags.

   Path formats:
   - `specs/<slug>/02-specification.md` → slug is `<slug>`
   - `specs/feat-<desc>.md` → slug is `feat-<desc>` (legacy)
   - `specs/fix-<issue>.md` → slug is `fix-<issue>` (legacy)

   Validate the slug format (lowercase, alphanumeric, hyphens only).

2. **Validate Prerequisites**

   Check that implementation summary exists:
   - File: `specs/<slug>/04-implementation.md`
   - If missing: Error and exit ("No implementation found. Run /spec:execute first.")

3. **Check STM Availability**

   Run: `!claudekit status stm`

   Handle each status:
   - "Not installed" → Warn user, continue (no STM task creation for deferred)
   - "Available but not initialized" → Warn user, suggest `stm init`, continue
   - "Available and initialized" → Proceed with full STM integration

4. **Check for Incomplete Tasks**

   Query: `stm list --status in-progress --tags "feature:<slug>"`

   If any found:
   - Display the incomplete tasks
   - Warn: "You have X incomplete tasks. Feedback changes may affect them."
   - Use AskUserQuestion to confirm: "Proceed anyway?"
   - Allow proceeding with confirmation

After validation, proceed to Step 2 (Feedback Collection).
```

**Key Differences:**
- **What to do** instead of **how to do it in bash**
- Guidance for Claude to follow using available tools
- Simple, clear instructions
- No complex bash syntax
- Relies on Claude's tool use capabilities

**Acceptance Criteria:**
- [ ] Step 1 rewritten in declarative style matching execute.md pattern
- [ ] No prescriptive bash scripts (only simple command examples)
- [ ] Clear numbered instructions for Claude
- [ ] Guidance on what to check, not how to check it
- [ ] References to appropriate tools (Read, Write, Bash, AskUserQuestion)
- [ ] All 4 substeps covered: slug, prerequisites, STM, incomplete tasks
- [ ] Maintains all original functionality
- [ ] Easier to read and understand than original
- [ ] Test: Claude can execute Step 1 without bash errors
- [ ] Test: Step 1 produces same validation outcomes as original

---

### Task 1.17: Test Feedback Command with Simplified Workflow ⏳ NEW
**Description:** End-to-end test of feedback command with refactored Step 1 to verify functionality
**Size:** Medium
**Priority:** High
**Dependencies:** Tasks 1.13, 1.14, 1.15, 1.16
**Can run parallel with:** None (final integration test)
**Added:** 2025-11-21

**Source:** Changelog entry "2025-11-21 - Post-Implementation Feedback: Bash Command Complexity"

**Testing Scope:**
Verify that all refactoring in tasks 1.13-1.16 preserves original functionality while eliminating bash complexity issues.

**Test Scenarios:**

**Scenario 1: Basic Feedback Flow (Implement Now)**
```bash
# Setup
mkdir -p specs/test-feedback-refactor
cp specs/add-feedback-workflow-command/02-specification.md specs/test-feedback-refactor/
cp specs/add-feedback-workflow-command/04-implementation.md specs/test-feedback-refactor/

# Execute
/spec:feedback specs/test-feedback-refactor/02-specification.md

# Provide test feedback
# - Feedback: "Test issue for validation"
# - Research expert: No
# - Decision: Implement now
# - Scope: Minimal

# Verify
test -f specs/test-feedback-refactor/05-feedback.md
grep "Test issue for validation" specs/test-feedback-refactor/05-feedback.md
grep "## 18. Changelog" specs/test-feedback-refactor/02-specification.md
```

**Scenario 2: Slug Extraction (All Formats)**
```bash
# Test feature-directory format
/spec:feedback specs/test-feedback-refactor/02-specification.md
# Verify slug extracted: "test-feedback-refactor"

# Test legacy feat format
cp specs/test-feedback-refactor/02-specification.md specs/feat-legacy-test.md
/spec:feedback specs/feat-legacy-test.md
# Verify slug extracted: "feat-legacy-test"

# Test legacy fix format
cp specs/test-feedback-refactor/02-specification.md specs/fix-123-bug-name.md
/spec:feedback specs/fix-123-bug-name.md
# Verify slug extracted: "fix-123-bug-name"
```

**Scenario 3: STM Availability (Graceful Degradation)**
```bash
# Simulate STM not installed
mv $(which stm) $(which stm).backup 2>/dev/null || true

# Execute feedback command
/spec:feedback specs/test-feedback-refactor/02-specification.md

# Provide feedback and choose "defer"
# Verify: Warning displayed about STM not available
# Verify: Feedback logged but STM task NOT created

# Restore STM
mv $(which stm).backup $(which stm) 2>/dev/null || true
```

**Scenario 4: Incomplete Tasks Warning**
```bash
# Create incomplete task
stm add "Test incomplete task" --tags "feature:test-feedback-refactor,phase1" --status in-progress

# Execute feedback command
/spec:feedback specs/test-feedback-refactor/02-specification.md

# Verify: Warning displayed about 1 incomplete task
# Verify: Option to proceed or cancel
# Choose: Proceed
# Verify: Workflow continues normally
```

**Scenario 5: Invalid Paths (Error Handling)**
```bash
# Test invalid path format
/spec:feedback specs/invalid@path.md
# Verify: Clear error message about invalid slug format

# Test missing file
/spec:feedback specs/nonexistent/02-specification.md
# Verify: Error about missing file

# Test missing implementation
rm specs/test-feedback-refactor/04-implementation.md
/spec:feedback specs/test-feedback-refactor/02-specification.md
# Verify: Error "No implementation found. Run /spec:execute first."
```

**Scenario 6: No Bash Parse Errors**
```bash
# Execute and monitor for bash errors
/spec:feedback specs/test-feedback-refactor/02-specification.md 2>&1 | tee /tmp/feedback-test.log

# Verify no bash errors in output
! grep -i "parse error" /tmp/feedback-test.log
! grep -i "syntax error" /tmp/feedback-test.log
! grep -i "BASH_REMATCH" /tmp/feedback-test.log
! grep -i "command not found" /tmp/feedback-test.log
```

**Acceptance Criteria:**
- [ ] Scenario 1: Feedback processed, files created correctly
- [ ] Scenario 2: All three slug formats extracted correctly
- [ ] Scenario 3: Works without STM (with warnings)
- [ ] Scenario 4: Incomplete tasks warning shown, workflow proceeds
- [ ] Scenario 5: Invalid inputs produce clear error messages
- [ ] Scenario 6: Zero bash parse errors in execution
- [ ] Step 1 execution time < 5 seconds (faster than original)
- [ ] All original functionality preserved
- [ ] Code is more maintainable and readable
- [ ] Documentation matches new implementation

**Cleanup:**
```bash
rm -rf specs/test-feedback-refactor
rm -f specs/feat-legacy-test.md
rm -f specs/fix-123-bug-name.md
stm delete --tag feature:test-feedback-refactor --force
```

---

## Phase 2: Incremental Decompose (10 tasks) - ✅ COMPLETED

All tasks in Phase 2 were completed in Session 1. No changes needed.

## Phase 3: Resume Execution (10 tasks) - ✅ COMPLETED

All tasks in Phase 3 were completed in Session 1. No changes needed.

## Phase 4: Documentation & Testing (12 tasks) - ✅ COMPLETED

All tasks in Phase 4 were completed in Session 1. No changes needed.

---

## Summary

**Total Tasks:** 49
- **Completed (Session 1):** 44 tasks
- **New (Session 2):** 5 tasks (1.13-1.17)

**Focus for Session 2:**
Simplify the bash command patterns in `/spec:feedback` Step 1 by:
1. Replacing BASH_REMATCH with simple string operations
2. Using `!claudekit status stm` instead of command substitution
3. Removing associative arrays and heredocs
4. Rewriting as declarative guidance following execute.md pattern
5. Comprehensive testing to ensure no regressions

**Why This Matters:**
The current implementation has 26 complex bash blocks that don't work well with Bash tool limitations. The refactoring will make the command more reliable, maintainable, and aligned with Claude Code best practices.

**Next Steps:**
1. Run: `/spec:execute specs/add-feedback-workflow-command/02-specification.md` (resume mode)
2. Execute tasks 1.13-1.17 in sequence
3. Validate with comprehensive testing
4. Update documentation if needed
