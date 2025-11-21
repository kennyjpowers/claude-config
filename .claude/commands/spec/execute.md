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

**Check for existing implementation summary:**
```bash
# Check if implementation summary exists
if [ -f specs/<slug>/04-implementation.md ]; then
  echo "Found existing implementation summary - reading previous progress"
fi
```

If `specs/<slug>/04-implementation.md` exists:
1. **Read the file** to understand what's already been completed
2. **Extract information:**
   - Tasks already completed
   - Files already modified/created
   - Tests already written
   - Known issues encountered
   - Where the implementation left off
3. **Use this context** to:
   - Avoid repeating completed work
   - Understand blockers from previous sessions
   - Continue from where the last session stopped
   - Build on existing implementation decisions

If the file doesn't exist, this is the first execution run.

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

Launch appropriate specialist agent:

```
Task tool:
- description: "Implement [component name]"  
- subagent_type: [choose specialist that matches the task]
- prompt: |
    First run: stm show [task-id]
    This will give you the full task details and requirements.
    
    Then implement the component based on those requirements.
    Follow project code style and add error handling.
    Report back when complete.
```

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
- If file exists: Read it, then update relevant sections
- If file doesn't exist: Create it with initial structure
- Preserve information from previous sessions
- Add new completed tasks, files, tests
- Update known issues and next steps

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