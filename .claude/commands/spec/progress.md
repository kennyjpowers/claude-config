---
description: Update task breakdown with completion status and generate progress report
category: validation
allowed-tools: Read, Write, Edit, Bash(stm:*), Bash(jq:*), Bash(grep:*), Bash(wc:*), Bash(basename:*)
argument-hint: "<path-to-spec-file>"
---

# Spec Implementation Progress Tracker

Track implementation progress for spec: $ARGUMENTS

## Overview

This command bridges the gap between `/spec:decompose` (task creation) and `/spec:execute` (implementation) by providing visibility into progress and keeping documentation synchronized with actual task status.

## Process

### Step 1: Validate Inputs

1. **Check spec file exists**:
   ```bash
   test -f "$SPEC_FILE" || exit 1
   ```

2. **Extract spec name**:
   ```bash
   SPEC_NAME=$(basename "$SPEC_FILE" .md)
   ```

3. **Find task breakdown document**:
   - Expected location: `specs/${SPEC_NAME}-tasks.md`
   - If not found, inform user that `/spec:decompose` must be run first

### Step 2: Gather Task Status from STM

Query STM for tasks related to this spec:

```bash
# Get all tasks (assuming they're tagged with spec name or have spec reference)
stm list --format json > /tmp/stm-tasks.json

# Filter for tasks related to this spec
# Tasks should have been created with tags or references during /spec:decompose
```

**Extract statistics**:
- Total tasks
- Tasks by status (pending, in-progress, done)
- Tasks by phase (if tagged)
- Blocked tasks (if any have blocking status)

### Step 3: Generate Progress Report

Create a comprehensive progress report:

```markdown
# Implementation Progress: {Spec Name}

**Generated**: {current-timestamp}
**Spec**: {spec-file-path}
**Task Breakdown**: {task-breakdown-path}

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | {total} |
| **Completed** | {done-count} ({done-percentage}%) |
| **In Progress** | {in-progress-count} |
| **Pending** | {pending-count} |
| **Blocked** | {blocked-count} |

---

## Progress by Phase

### Phase 1: Foundation
- ✅ Task 1.1: {title} (completed)
- ✅ Task 1.2: {title} (completed)
- 🔄 Task 1.3: {title} (in progress)
- ⏳ Task 1.4: {title} (pending)

### Phase 2: Core Features
- ⏳ Task 2.1: {title} (pending)
- ⏳ Task 2.2: {title} (pending)

### Phase 3: Polish
- ⏳ Task 3.1: {title} (pending)

---

## Current Focus

**Active Tasks**:
{List all in-progress tasks with IDs}

**Up Next** (recommended order):
{List next 3-5 pending tasks based on dependencies}

---

## Blockers & Issues

{If any tasks are blocked, list them with details}
{If no blockers, state "No blockers identified"}

---

## Completion Forecast

**Current pace**: {tasks-completed} tasks completed
**Remaining work**: {pending-count} tasks pending
**Estimated completion**: {phase-analysis}

---

## Recent Activity

{List last 5 completed tasks with completion timestamps}

---

## Next Steps

1. Continue with: {next-task-id}: {next-task-title}
2. After current phase: {next-phase-description}
3. Remaining phases: {phase-list}

---

**Pro Tip**: Run `/spec:progress {spec-file}` again anytime to see updated status.
```

### Step 4: Update Task Breakdown Document

Read the task breakdown document and update it:

1. **Find each task entry** in the breakdown
2. **Update status indicators**:
   - Replace `**Status**: Pending` with `**Status**: ✅ Completed` or `**Status**: 🔄 In Progress`
   - Update checkboxes in Acceptance Criteria based on completion
   - Add completion timestamps to completed tasks

3. **Example transformation**:

**Before**:
```markdown
### Task 1.1: Set up TypeScript configuration
**Status**: Pending
**Dependencies**: None

**Acceptance Criteria**:
- [ ] TypeScript config created
- [ ] Build passes
```

**After** (if completed):
```markdown
### Task 1.1: Set up TypeScript configuration
**Status**: ✅ Completed (2025-01-12 14:32)
**Dependencies**: None

**Acceptance Criteria**:
- [x] TypeScript config created
- [x] Build passes
```

### Step 5: Generate Summary Output

Display a concise summary to the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Spec Implementation Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Spec: {spec-name}

Progress: {done}/{total} tasks ({percentage}%)
[████████░░░░░░░░] {percentage}%

Current Phase: {current-phase-name}
Active: {in-progress-count} tasks
Pending: {pending-count} tasks
Blocked: {blocked-count} tasks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Reports Generated:
  • Progress report: specs/{spec-name}-progress.md
  • Task breakdown updated: specs/{spec-name}-tasks.md

🎯 Next Steps:
  1. {next-action-recommendation}
  2. Run /spec:execute to continue implementation
  3. Run /spec:progress again to track updates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 6: Save Progress Report

Save the detailed progress report to:
- `specs/{spec-name}-progress.md`

This file can be:
- Committed to git for historical tracking
- Referenced in PR descriptions
- Shared with stakeholders
- Used for retrospectives

## Edge Cases

### If STM Not Available

Fall back to manual task tracking:
```
⚠️  STM not detected. Progress tracking requires STM.

Options:
1. Install STM: npm install -g @your/stm-tool
2. Run: stm init
3. Ensure tasks were created with /spec:decompose

Or track progress manually in task breakdown document.
```

### If No Tasks Found

```
⚠️  No tasks found for spec: {spec-name}

This usually means:
1. /spec:decompose hasn't been run yet
2. Tasks weren't tagged with spec reference
3. Spec name doesn't match task references

Recommendation: Run /spec:decompose {spec-file} first
```

### If Task Breakdown Document Not Found

```
⚠️  Task breakdown document not found: specs/{spec-name}-tasks.md

Expected location: specs/{spec-name}-tasks.md

Recommendation: Run /spec:decompose {spec-file} to create task breakdown
```

## Usage Examples

### Check Progress Mid-Implementation

```bash
/spec:progress specs/feat-simple-text-generator.md
```

Output shows current phase, completed tasks, what's next.

### Before Starting Work Session

```bash
/spec:progress specs/feat-templated-io-integration.md
```

Shows recommended next tasks to work on.

### Before Creating PR

```bash
/spec:progress specs/feat-getlate-full-integration.md
```

Verify all tasks completed, generate final progress report for PR description.

### Daily Standup

```bash
/spec:progress specs/feat-social-posting-poc.md
```

Quick status update on implementation progress.

## Integration with Other Commands

### Workflow Integration

```
/spec:decompose <spec>     # Creates tasks
         ↓
/spec:progress <spec>      # Check status (shows 0% complete)
         ↓
/spec:execute <spec>       # Implement tasks
         ↓
/spec:progress <spec>      # Check status (shows progress)
         ↓
[Continue implementing]
         ↓
/spec:progress <spec>      # Final check (shows 100%)
         ↓
/spec:doc-update <spec>    # Update documentation
```

### Recommended Cadence

- **Before work session**: Check progress and identify next tasks
- **After completing tasks**: Update progress to see impact
- **Before PR**: Final progress check and report generation
- **During reviews**: Share progress report with reviewers

## Output Files

This command creates/updates:

1. **`specs/{spec-name}-progress.md`**
   - Detailed progress report
   - Timestamped snapshot of status
   - Can be committed for historical tracking

2. **`specs/{spec-name}-tasks.md`** (updates)
   - Task status indicators updated
   - Acceptance criteria checkboxes marked
   - Completion timestamps added

## Success Criteria

Progress tracking is successful when:

- ✅ Progress report accurately reflects STM task status
- ✅ Task breakdown document synchronized with actual progress
- ✅ Clear visibility into completed, in-progress, and pending work
- ✅ Next steps are clearly identified
- ✅ Blockers are surfaced and visible
- ✅ Reports are saved for documentation and reference

## Notes

- **Historical tracking**: Commit progress reports to track implementation velocity
- **Automation potential**: This command can be run automatically via git hooks or CI
- **Flexibility**: Works with any spec that has been decomposed
- **Lightweight**: Quick to run, minimal overhead
- **Actionable**: Provides clear next steps, not just statistics
