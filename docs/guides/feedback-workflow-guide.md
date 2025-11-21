# Feedback Workflow Guide

A comprehensive guide to using the `/spec:feedback` command for iterative feature development.

## Table of Contents

1. [Introduction](#introduction)
2. [When to Use](#when-to-use-feedback-workflow)
3. [Providing Effective Feedback](#providing-effective-feedback)
4. [Decision Making Guide](#decision-making-guide)
5. [Integration with Decompose and Execute](#integration-with-decompose-and-execute)
6. [Best Practices](#best-practices)
7. [Common Scenarios](#common-scenarios)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Patterns](#advanced-patterns)

## Introduction

The `/spec:feedback` command provides a structured workflow for processing post-implementation feedback from testing or usage. It bridges the gap between implementation and iteration by:

- Processing one feedback item at a time
- Exploring relevant code to understand impact
- Optionally researching solution approaches
- Guiding interactive decision-making
- Updating specifications or deferring for later
- Maintaining a complete decision log

This enables rapid iteration while preserving completed work and maintaining clear documentation of all changes.

## When to Use Feedback Workflow

### Use `/spec:feedback` when:

- **After manual testing** - You've completed `/spec:execute` and discovered issues during testing
- **After user feedback** - Real users have reported bugs or requested improvements
- **After code review** - Reviewers have suggested changes or improvements
- **After deployment** - Production monitoring reveals issues or performance problems

### Don't use `/spec:feedback` for:

- **During initial implementation** - Use `/spec:execute` directly for implementing the original spec
- **Trivial typos or formatting** - Make these changes directly without the feedback workflow
- **Breaking changes requiring redesign** - Start a new `/ideate` → `/ideate-to-spec` cycle instead

## Providing Effective Feedback

### Guidelines for Good Feedback

**Be Specific**
```
✅ Good: "Authentication fails when password contains special characters like @ or #"
❌ Bad: "Login doesn't work"
```

**Include Context**
```
✅ Good: "Dashboard loads slowly (>5s) when displaying more than 100 items"
❌ Bad: "Dashboard is slow"
```

**One Issue Per Feedback**
```
✅ Good: Run /spec:feedback three times for three separate issues
❌ Bad: "The login is broken, dashboard is slow, and export doesn't work"
```

**Be Actionable**
```
✅ Good: "Error messages don't indicate which field failed validation"
❌ Bad: "The UI could be better"
```

### Examples of Effective Feedback

**Bug Report:**
```
"When a user attempts to edit an item and then delete it without saving,
the delete action fails with a 404 error. The item still shows in the list
but is actually deleted from the database, causing inconsistency."
```

**Performance Issue:**
```
"Search query takes 3-5 seconds when searching across 10,000+ records.
Users expect sub-second response. The current implementation scans the
entire dataset without using database indexes."
```

**UX Improvement:**
```
"After submitting a form, users don't receive confirmation that their
action succeeded. They're unsure if they should resubmit or wait.
Adding a success message and loading state would improve confidence."
```

**Security Concern:**
```
"API endpoint /api/users/:id returns full user objects including password
hashes and email addresses without verifying the requesting user has
permission to view that data."
```

## Decision Making Guide

The `/spec:feedback` command guides you through 4 key decisions:

### Decision 1: How to Address

**Implement Now**
- Issue is critical or blocks important functionality
- You have time to address it in the current iteration
- Changes are well-scoped and understood

**Defer**
- Issue is important but not urgent
- You want to batch similar issues together
- You need more research or planning first
- Current sprint/iteration is ending

**Out of Scope**
- Issue doesn't align with project goals
- Would require significant architectural changes
- Is actually a feature request for a different product
- User misunderstood the intended behavior

### Decision 2: Implementation Scope

**Minimal**
- Fix only the specific issue reported
- Smallest possible change
- Use when: Quick fix needed, low risk tolerance, time constrained

**Comprehensive**
- Address the root cause plus related issues
- May refactor surrounding code
- Use when: Issue reveals deeper problems, high risk of similar bugs, quality is priority

**Phased**
- Immediate minimal fix + follow-up comprehensive work
- Use when: Issue is urgent but comprehensive fix needs more time

### Decision 3: Technical Approach

Options presented depend on whether you requested research-expert:

**With Research:**
- Recommended approach (from best practices)
- Alternative approaches (with trade-offs)
- Custom approach (specify your own)

**Without Research:**
- Approaches identified during code exploration
- Custom approach

**Choosing an Approach:**
- Consider maintainability and consistency with existing code
- Evaluate performance implications
- Assess security impact
- Think about future extensibility

### Decision 4: Priority

**Critical**
- Blocks core functionality
- Security vulnerability
- Data loss risk
- Must fix immediately

**High**
- Significant UX degradation
- Affects many users
- Workaround exists but is painful
- Should fix soon

**Medium**
- Noticeable but not severe
- Affects some users
- Acceptable workaround available
- Fix in next iteration

**Low**
- Minor inconvenience
- Rare edge case
- Nice-to-have improvement
- Fix when convenient

## Integration with Decompose and Execute

The feedback workflow integrates seamlessly with incremental decompose and resume execute:

### Full Iteration Cycle

```bash
# 1. Initial implementation
/spec:execute specs/my-feature/02-specification.md

# 2. Manual testing reveals issue
# (Discover: "Auth fails with special characters")

# 3. Process feedback
/spec:feedback specs/my-feature/02-specification.md
# - Provide feedback description
# - Optionally research solutions
# - Choose: Implement Now
# - Spec changelog updated

# 4. Re-decompose (incremental mode)
/spec:decompose specs/my-feature/02-specification.md
# - Detects changelog update
# - Preserves 15 completed tasks
# - Creates 2 new tasks for feedback fix

# 5. Re-execute (resume mode)
/spec:execute specs/my-feature/02-specification.md
# - Detects previous session
# - Skips 15 completed tasks
# - Executes 2 new tasks only

# 6. Test again, repeat if needed
```

### Incremental Decompose Behavior

When `/spec:decompose` detects a changelog update:

1. **Reads** existing `03-tasks.md` for task breakdown
2. **Queries** STM for task status (done/in-progress/pending)
3. **Analyzes** changelog entries added since last decompose
4. **Preserves** completed tasks (marked ✅ DONE)
5. **Updates** affected in-progress tasks with new context
6. **Creates** new tasks only for net-new work
7. **Numbers** new tasks sequentially (e.g., 2.5 → 2.6)
8. **Generates** re-decompose metadata section

### Resume Execute Behavior

When `/spec:execute` detects previous implementation:

1. **Reads** `04-implementation.md` for session history
2. **Extracts** completed tasks, files modified, known issues
3. **Queries** STM to reconcile task status
4. **Displays** execution plan (completed/resuming/pending)
5. **Skips** all completed tasks
6. **Resumes** any in-progress task with full context
7. **Executes** pending tasks
8. **Appends** new session to implementation summary

## Best Practices

### 1. Process Feedback Immediately After Testing

Don't accumulate feedback - process it while context is fresh:

```bash
# ✅ Good: Process as you find issues
Test → Find issue → /spec:feedback → Fix → Test again

# ❌ Bad: Batch everything at the end
Test → Note 10 issues → Process all at once → Context lost
```

### 2. One Feedback Item Per Run

The command processes ONE item at a time intentionally:

```bash
# ✅ Good: Three separate runs
/spec:feedback specs/my-feature/02-specification.md  # Auth issue
/spec:feedback specs/my-feature/02-specification.md  # Performance issue
/spec:feedback specs/my-feature/02-specification.md  # UX improvement

# ❌ Bad: Trying to cram multiple issues into one feedback
"Auth is broken AND dashboard is slow AND export fails..."
```

### 3. Use Research-Expert for Complex Issues

When uncertain about the best approach, request research:

- Security vulnerabilities → Research best practices
- Performance optimization → Research proven techniques
- Architecture decisions → Research trade-offs

### 4. Defer Strategically

Don't be afraid to defer feedback:

```bash
# Good reasons to defer:
- Issue is important but not urgent
- Want to batch similar issues
- Need more investigation
- Current iteration is ending

# After deferring:
stm list --tags feature:my-feature,feedback,deferred
# Review deferred items when planning next iteration
```

### 5. Review Feedback Log Regularly

The `05-feedback.md` log is your decision history:

```bash
# Learn from patterns:
- Are certain types of issues recurring?
- Are we deferring too much?
- Are decisions well-reasoned?
```

### 6. Keep Specs Up to Date

Always choose "Implement Now" for critical issues - this ensures:
- Spec reflects current reality
- New team members see accurate documentation
- Future changes have correct context

### 7. Test After Each Feedback Fix

Don't accumulate fixes without testing:

```bash
# ✅ Good: Feedback → Fix → Test → Next feedback
/spec:feedback → /spec:decompose → /spec:execute → Test → /spec:feedback

# ❌ Bad: Feedback → Feedback → Feedback → Fix all → Test
```

## Common Scenarios

### Scenario 1: Bug Discovered in Testing

```bash
# Situation: Login fails with special characters
/spec:feedback specs/auth-feature/02-specification.md

# Feedback: "Authentication fails when password contains @ or #"
# Research: No (straightforward regex fix)
# Action: Implement Now
# Scope: Minimal
# Approach: Update password regex
# Priority: High

# Result:
# - Spec changelog updated
# - Feedback log entry created (#1)
# - Next steps: /spec:decompose → /spec:execute
```

### Scenario 2: Performance Issue

```bash
# Situation: Dashboard slow with many items
/spec:feedback specs/dashboard/02-specification.md

# Feedback: "Dashboard loads >5s with 500+ items"
# Research: Yes (explore pagination vs virtualization vs lazy loading)
# Action: Defer
# Scope: Comprehensive (will need architecture changes)
# Priority: High

# Result:
# - STM task created (#42)
# - Tagged: feature:dashboard,feedback,deferred,high
# - Feedback log entry created (#2)
# - Can implement later when time allows
```

### Scenario 3: Multiple Related Issues

```bash
# Situation: Form validation has 3 problems

# Process each separately:

# Issue 1: Missing email validation
/spec:feedback specs/user-form/02-specification.md
# Action: Implement Now → Creates Task 3.8

# Issue 2: Password strength not indicated
/spec:feedback specs/user-form/02-specification.md
# Action: Implement Now → Creates Task 3.9

# Issue 3: Would be nice to have password visibility toggle
/spec:feedback specs/user-form/02-specification.md
# Action: Defer → Creates STM task

# Then implement accepted feedback:
/spec:decompose specs/user-form/02-specification.md  # Creates 2 new tasks
/spec:execute specs/user-form/02-specification.md    # Executes new tasks only
```

### Scenario 4: Conflicting Feedback

```bash
# Situation: Two feedback items conflict

# Feedback #1: "Search should be case-sensitive"
/spec:feedback
# Action: Implement Now
# Updates spec: search is case-sensitive

# Feedback #2: "Search should be case-insensitive"
/spec:feedback
# Action: Implement Now
# Updates spec: search is case-insensitive

# Resolution:
# - Both logged in 05-feedback.md with rationale
# - Latest decision wins (case-insensitive)
# - Changelog shows both decisions
# - Can revisit if needed
```

## Troubleshooting

### "No implementation found" Error

**Problem:** `/spec:feedback` requires `04-implementation.md` to exist.

**Solution:** Run `/spec:execute` first to complete initial implementation before providing feedback.

### "STM not installed" Warning

**Problem:** simple-task-master not available.

**Solution:**
```bash
npm install -g simple-task-master
```

Or continue without STM (deferred feedback will be logged but not tracked in tasks).

### "X tasks still in progress" Warning

**Problem:** Previous implementation session has incomplete tasks.

**Impact:** Feedback changes may affect in-progress work.

**Options:**
1. Complete in-progress tasks first
2. Proceed with feedback (tasks will be updated with new context during next execute)

### Spec Not Updating After Feedback

**Problem:** Chose "Defer" or "Out of Scope" instead of "Implement Now".

**Solution:** Only "Implement Now" updates the spec changelog. To change:
```bash
/spec:feedback  # Run again with "Implement Now"
```

### New Tasks Not Created After Feedback

**Problem:** Forgot to run `/spec:decompose` after feedback.

**Solution:**
```bash
# After /spec:feedback with "Implement Now":
/spec:decompose specs/<slug>/02-specification.md
```

## Advanced Patterns

### Pattern 1: Feedback-Driven Development

Use feedback workflow as primary iteration method:

```bash
# 1. Implement minimal viable version
/spec:execute specs/feature/02-specification.md

# 2. Test with real users
# Gather 5-10 specific feedback items

# 3. Process each feedback item
for item in feedback_items; do
  /spec:feedback specs/feature/02-specification.md
done

# 4. Batch implement accepted feedback
/spec:decompose specs/feature/02-specification.md  # Incremental
/spec:execute specs/feature/02-specification.md    # Resume

# 5. Repeat cycle
```

### Pattern 2: Feedback Prioritization

Use STM tags to manage feedback backlog:

```bash
# View all deferred feedback
stm list --tags feedback,deferred

# View by priority
stm list --tags feedback,deferred,critical
stm list --tags feedback,deferred,high
stm list --tags feedback,deferred,medium

# View by feature
stm list --tags feature:auth-system,feedback,deferred

# Implement highest priority deferred feedback
stm show 42  # Read full context
# Manually update spec changelog
/spec:decompose specs/auth-system/02-specification.md
/spec:execute specs/auth-system/02-specification.md
```

### Pattern 3: Team Feedback Workflow

Coordinate feedback across team members:

```bash
# Each team member processes their test findings
Developer A: /spec:feedback  # Auth issue
Developer B: /spec:feedback  # Performance issue
Developer C: /spec:feedback  # UX improvement

# Commit feedback logs
git add specs/*/05-feedback.md
git commit -m "doc: add testing feedback from team review"
git push

# Lead reviews feedback log and decides
git pull
# Review specs/my-feature/05-feedback.md
# Identify critical items

# Update spec for critical items
# (Manual changelog update if needed)

# Team implements in next iteration
/spec:decompose
/spec:execute
```

### Pattern 4: Research-Driven Iteration

Use research-expert for high-impact feedback:

```bash
# Performance issue discovered
/spec:feedback specs/dashboard/02-specification.md

# Feedback: "Query takes 3-5 seconds with 10,000+ records"
# Research: YES

# Research expert investigates:
# - Database indexing strategies
# - Pagination vs cursor-based
# - Caching approaches
# - Query optimization techniques

# Use research to make informed decision
# Choose approach with best trade-offs
# Implement with confidence
```

### Pattern 5: Continuous Improvement

Track feedback trends over time:

```bash
# Monthly feedback review
grep "^## Feedback" specs/*/05-feedback.md | wc -l
# "We processed 23 feedback items this month"

# Analyze patterns
grep "**Type:** bug" specs/*/05-feedback.md | wc -l
# "15 were bugs - need better testing?"

grep "**Type:** performance" specs/*/05-feedback.md | wc -l
# "8 were performance - need optimization focus?"

# Identify improvements to process
# - Are we testing thoroughly enough?
# - Should we use research-expert more?
# - Are we deferring too much?
```

## Summary

The feedback workflow provides a structured, repeatable process for iterating on implementations:

1. **Process one item at a time** for focused attention
2. **Explore code** to understand impact
3. **Research when uncertain** for informed decisions
4. **Decide interactively** with clear options
5. **Integrate seamlessly** with decompose and execute
6. **Maintain complete history** of all decisions

This enables rapid, confident iteration while preserving quality and documentation.

---

**See Also:**
- [API Documentation](../api/feedback-workflow.md) - File format specifications
- [/spec:feedback Command](../../.claude/commands/spec/feedback.md) - Full command documentation
- [CLAUDE.md](../../CLAUDE.md) - Complete workflow overview
