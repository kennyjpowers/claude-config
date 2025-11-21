# Feedback Log

Post-implementation feedback, analysis, and decisions for the add-feedback-workflow-command feature.

Each feedback item includes:
- Description of the issue or improvement
- Code exploration and research findings
- Interactive decision results
- Actions taken (spec updates, deferred tasks, or out-of-scope logging)

---

## Feedback #1

**Date:** 2025-11-21
**Status:** Accepted - Implementation in progress
**Type:** bug
**Priority:** High

### Description

The beginning of the feedback command workflow seems too complicated and the bash commands have lots of issues

### Code Exploration Findings

**Primary Issues in `.claude/commands/spec/feedback.md`:**

1. **Over-Prescription Syndrome**: 26 bash code blocks trying to script the entire workflow
   - Lines 42-62: Complex BASH_REMATCH regex patterns
   - Lines 82-98: Nested conditionals with string pattern matching
   - Lines 105-131: Piped commands with jq and nested parentheses

2. **Wrong Invocation Pattern**:
   - Using `$(claudekit status stm)` (bash substitution)
   - Should use `!claudekit status stm` (direct command pattern)
   - Compare: execute.md uses the correct `!command` pattern

3. **Complex Bash Patterns Causing Parse Errors**:
   - Associative arrays: `declare -A DECISIONS`
   - Heredocs with variables: `cat <<'EOF'`
   - Command substitution with parentheses: `$(stm list...)` - **This causes the parse error!**
   - JQ interpolation: `jq -r '.[] | "[\(.id)]"'` - Nested parentheses

4. **Variable Persistence Problem**: Bash variables don't persist between separate Bash tool invocations

**Affected Components:**
- `.claude/commands/spec/feedback.md` (PRIMARY - 1000+ lines)
- `.claude/commands/spec/decompose.md` (SECONDARY - similar patterns)

**Blast Radius:** Medium
- feedback.md needs significant refactoring
- decompose.md may have similar issues
- Other commands (create.md, execute.md) use simpler, working patterns

**Root Cause:** The command tries to prescribe exact bash scripts instead of providing declarative guidance for Claude to follow.

### Research Findings

Research skipped by user

### Decisions

- **Action:** Implement now
- **Scope:** Minimal
- **Approach:** Recommended: Declarative markdown pattern
- **Priority:** High

### Actions Taken

- Updated specification changelog (Section 18)
- Next steps: Update spec sections → /spec:decompose → /spec:execute

### Rationale

This feedback was addressed through the /spec:feedback workflow:
1. Code exploration identified affected components and blast radius
2. Research was skipped
3. Interactive decision process resulted in: Implement now
4. Accepted - Implementation in progress

The bash parsing errors are blocking the ability to test the feedback workflow itself. By following the execute.md pattern with declarative markdown and !command invocations, the command will be more reliable and maintainable. The minimal scope focuses on Step 1 (Validation & Setup) which is where the immediate issues occur.

---

## Feedback #2

**Date:** 2025-11-21 16:35:00
**Status:** Accepted - Implementation in progress
**Type:** Bug
**Priority:** High

### Description

After completing bash refactoring in `/spec:feedback` command (Session 5, Tasks 45-49), discovered that `/spec:decompose` command has the same bash complexity issues:

1. Associative arrays (`declare -A PRESERVE_TASKS UPDATE_TASKS CREATE_TASKS` on line 200)
2. Heredocs (`cat <<'EOF'` on lines 631, 698)
3. Extensive command substitution throughout (lines 65-99 and beyond)
4. Complex bash logic that doesn't work reliably with Bash tool limitations

These patterns cause the same issues we just fixed in feedback.md: parse errors, variable persistence problems, and maintenance difficulties.

### Code Exploration Findings

**File affected:** `.claude/commands/spec/decompose.md`
- **Size:** 1113 lines
- **Bash blocks:** 16 total
- **Complexity:** Higher than feedback.md (includes incremental mode detection, changelog parsing, task filtering)

**Specific issues identified:**
- Lines 61-99: Complex incremental mode detection with nested conditionals and command substitution
- Line 200: Associative arrays for task categorization (PRESERVE_TASKS, UPDATE_TASKS, CREATE_TASKS)
- Lines 631, 698: Heredocs for multi-line STM task content
- Multiple instances of `$(stm list ...)`, `$(echo ... | sed ...)`, `$(echo ... | jq ...)`

**Comparison to feedback.md refactoring:**
- feedback.md: 26+ bash blocks → simplified to declarative guidance ✅ (Session 5)
- decompose.md: 16 bash blocks → needs same treatment ⏳ (this feedback)
- execute.md: Already clean, used as reference pattern ✅

**Blast radius:** Medium
- Affects decompose command reliability
- Inconsistent with newly refactored feedback.md
- May cause parse errors during task creation

### Research Findings

Research skipped - pattern already established from feedback.md refactoring.

**Proven approach from Session 5:**
1. Replace BASH_REMATCH with simple string operations (cut, basename)
2. Use `!claudekit status stm` instead of `$(claudekit status stm)`
3. Remove associative arrays - use declarative guidance instead
4. Remove heredocs - use Write tool or simple examples
5. Provide declarative instructions that guide Claude to use appropriate tools
6. Follow execute.md pattern (proven clean and working)

### Decisions

- **Action:** Implement now
- **Scope:** Comprehensive (refactor all complex bash blocks to declarative pattern)
- **Approach:** Follow execute.md declarative pattern, same methodology as feedback.md refactoring
- **Priority:** High (consistency across commands, prevent execution failures)

### Actions Taken

- Updated specification changelog (Section 18) with this feedback
- Creating new tasks for decompose.md refactoring (Tasks 50-54)
- Next steps: Execute refactoring → Update documentation

### Rationale

This feedback was addressed through the /spec:feedback workflow:
1. Code exploration identified same bash complexity issues in decompose.md as were in feedback.md
2. Research was skipped because proven pattern already exists from Session 5
3. Interactive decision process resulted in: Implement now with comprehensive scope
4. Accepted - Implementation in progress

**Why high priority:**
- **Consistency:** All three spec commands should use same declarative pattern
- **Reliability:** Prevent parse errors and execution failures
- **Maintainability:** Easier to understand and modify in future
- **Proven solution:** Session 5 already demonstrated successful refactoring approach

**Why comprehensive scope:**
- decompose.md is 1113 lines with 16 bash blocks (needs thorough refactoring)
- Incremental mode detection logic can be expressed declaratively
- Changelog parsing can use Read tool + guidance instead of complex awk/sed
- Task filtering can use declarative instructions for STM queries
- Following execute.md pattern ensures consistency across all spec commands

---
