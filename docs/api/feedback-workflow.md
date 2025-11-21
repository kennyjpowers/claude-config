# Feedback Workflow API Documentation

Technical specification of file formats and data structures used in the feedback workflow system.

## Table of Contents

1. [05-feedback.md Format](#05-feedbackmd-format)
2. [Spec Changelog Format (Section 18)](#spec-changelog-format-section-18)
3. [Re-decompose Metadata Format](#re-decompose-metadata-format)
4. [Implementation Summary Session Format](#implementation-summary-session-format)
5. [STM Task Format](#stm-task-format)

---

## 05-feedback.md Format

**Location:** `specs/<slug>/05-feedback.md`

**Purpose:** Log all post-implementation feedback items with decisions and actions taken.

### File Structure

```markdown
# Feedback Log

Post-implementation feedback, analysis, and decisions for the <feature-name> feature.

Each feedback item includes:
- Description of the issue or improvement
- Code exploration and research findings
- Interactive decision results
- Actions taken (spec updates, deferred tasks, or out-of-scope logging)

---

## Feedback #<N>

**Date:** <YYYY-MM-DD HH:MM:SS>
**Status:** <Status Value>
**Type:** <Type Value>
**Priority:** <Priority Value>

### Description

<Full feedback text>

### Code Exploration Findings

<Findings from code exploration>
<Affected components/files>
<Blast radius assessment>

### Research Findings

<Findings from research-expert if consulted>
<Or: [Research skipped by user]>

### Decisions

- **Action:** <Action Value>
- **Scope:** <Scope Value>
- **Approach:** <Approach Description>
- **Priority:** <Priority Value>

### Actions Taken

<Actions based on decision>

### Rationale

<Explanation of decisions and reasoning>

---

<Additional feedback entries...>
```

### Field Definitions

#### Feedback Number
- **Format:** Sequential integer starting from 1
- **Example:** `## Feedback #1`, `## Feedback #2`
- **Auto-incrementing:** Command determines next number by reading existing entries

#### Date
- **Format:** `YYYY-MM-DD HH:MM:SS`
- **Example:** `2025-11-21 14:30:00`
- **Source:** System timestamp when feedback processed

#### Status Values
- `Accepted - Implementation in progress` - Chosen "Implement Now"
- `Deferred - Logged for future consideration` - Chosen "Defer"
- `Out of scope - Logged only` - Chosen "Out of Scope"

#### Type Values
Automatically categorized from feedback content:
- `bug` - Errors, failures, crashes, broken functionality
- `performance` - Slow, laggy, timeout issues
- `ux` - User experience, confusing UI, difficult interactions
- `security` - Auth, permissions, access control, vulnerabilities
- `general` - Catch-all for uncategorized feedback

#### Priority Values
- `Critical` - Blocking, security, data loss
- `High` - Significant impact, important
- `Medium` - Noticeable, nice-to-have
- `Low` - Minor, rare edge case

#### Action Values
- `Implement now` - Update spec and re-implement
- `Defer` - Create STM task for later
- `Out of scope` - Log only, no action

#### Scope Values
- `Minimal` - Fix only specific issue
- `Comprehensive` - Fix root cause + related issues
- `Phased` - Quick fix + future improvements

### Example Entry

```markdown
## Feedback #3

**Date:** 2025-11-21 15:30:00
**Status:** Accepted - Implementation in progress
**Type:** bug
**Priority:** High

### Description

Authentication fails when password contains special characters like @ or #.
Users with email-style passwords cannot log in. Current validation regex
only allows alphanumeric characters.

### Code Exploration Findings

**Affected Components:**
- `auth/validation.ts` - PASSWORD_REGEX constant
- `auth/validation.test.ts` - Test suite

**Current Implementation:**
```typescript
const PASSWORD_REGEX = /^[a-zA-Z0-9]+$/;
```

**Blast Radius:** Low - isolated to validation function only

### Research Findings

[Research skipped by user]

### Decisions

- **Action:** Implement now
- **Scope:** Minimal
- **Approach:** Update regex to allow printable ASCII characters: [\x21-\x7E]+
- **Priority:** High

### Actions Taken

- Updated specification changelog (Section 18)
- Next steps: Update spec sections → /spec:decompose → /spec:execute

### Rationale

This is a straightforward bug fix addressing real user pain. The regex change
is low-risk and well-understood. Industry-standard approach supports all
standard keyboard characters. Minimal scope appropriate as issue is isolated
to validation logic.

---
```

---

## Spec Changelog Format (Section 18)

**Location:** `specs/<slug>/02-specification.md` (Section 18 or 19)

**Purpose:** Track specification updates resulting from feedback.

### Section Structure

```markdown
## 18. Changelog

Track specification updates and their rationale.

### <YYYY-MM-DD> - Post-Implementation Feedback

**Source:** Feedback #<N> (see specs/<slug>/05-feedback.md)

**Issue:** <Brief feedback description>

**Decision:** <Action> with <Scope> scope

**Changes to Specification:**

1. **Section <X>: <Section Name> (Updated/Addition)**
   - OLD: <Previous specification text>
   - NEW: <Updated specification text>
   - Rationale: <Why this change>

2. **Section <Y>: <Section Name> (Updated/Addition)**
   - <Change description>

**Implementation Impact:**
- Priority: <Priority>
- Approach: <Approach description>
- Affected components: <List>
- Estimated blast radius: <Assessment>

**Next Steps:**
1. Review and update the affected specification sections above
2. Run `/spec:decompose specs/<slug>/02-specification.md` to update task breakdown
3. Run `/spec:execute specs/<slug>/02-specification.md` to implement changes

---

<Additional changelog entries...>
```

### Example Entry

```markdown
### 2025-11-21 - Post-Implementation Feedback

**Source:** Feedback #3 (see specs/auth-system/05-feedback.md)

**Issue:** Authentication fails when password contains special characters (!@#$%)

**Decision:** Implement now with Minimal scope

**Changes to Specification:**

1. **Section 6.3: Password Validation (Updated)**
   - OLD: Regex pattern `^[a-zA-Z0-9]+$` (alphanumeric only)
   - NEW: Regex pattern `^[\x21-\x7E]+$` (all printable ASCII)
   - Rationale: Industry standard, supports international keyboards

2. **Section 11: Testing Strategy (Addition)**
   - Add test case: "Password with special characters (!@#$%^&*())"
   - Add test case: "Password with unicode characters (boundary test)"
   - Add test case: "Password with spaces (should fail)"

3. **Section 13: Security Considerations (Clarification)**
   - Note: Special characters in passwords increase entropy
   - Recommendation: Inform users about character support in UI

**Implementation Impact:**
- Priority: High
- Approach: Update PASSWORD_REGEX constant in auth/validation.ts
- Affected components: auth/validation.ts, auth/validation.test.ts
- Estimated blast radius: Low - isolated to validation function

**Next Steps:**
1. Review and update Section 6.3 with new regex pattern
2. Run `/spec:decompose specs/auth-system/02-specification.md`
3. Run `/spec:execute specs/auth-system/02-specification.md`

---
```

---

## Re-decompose Metadata Format

**Location:** Appended to `specs/<slug>/03-tasks.md`

**Purpose:** Track decomposition history and changes across sessions.

### Structure

```markdown
## Re-decompose Metadata

### Decompose History

| Session | Date       | Mode        | Changelog Entries | New Tasks | Notes                        |
|---------|------------|-------------|-------------------|-----------|------------------------------|
| 1       | YYYY-MM-DD | Full        | N/A               | <count>   | Initial decomposition        |
| 2       | YYYY-MM-DD | Incremental | <count>           | <count>   | <Brief description>          |
| N       | YYYY-MM-DD | Incremental | <count>           | <count>   | <Brief description>          |

### Current Session Details

**Mode:** Incremental
**Previous Decompose:** YYYY-MM-DD HH:MM:SS
**Current Decompose:** YYYY-MM-DD HH:MM:SS
**Changelog Entries Processed:** <count>

### Changelog Entries

1. **YYYY-MM-DD: <Changelog Title>**
   - Impact: Phase <N>, Task <X> (<description>)
   - Action: <What was done>

2. **YYYY-MM-DD: <Changelog Title>**
   - Impact: Phase <M>, Task <Y> (<description>)
   - Action: <What was done>

### Task Changes Summary

- **Preserved:** <count> completed tasks (Task IDs: <list>)
- **Updated:** <count> tasks (Task IDs: <list>)
- **Created:** <count> new tasks (Task IDs: <list>)

### Existing Tasks Status (from STM at YYYY-MM-DD HH:MM:SS)

**Phase 1: <Phase Name> (Complete/In Progress/Pending)**
- Task 1.1: ✅ DONE - <Task description>
- Task 1.2: ✅ DONE - <Task description>

**Phase 2: <Phase Name>**
- Task 2.1: ✅ DONE - <Task description>
- Task 2.2: 🔄 IN PROGRESS - <Task description>
- Task 2.3: ⏳ PENDING - <Task description>
- Task 2.4: ⏳ NEW - <Task description added from feedback>

### Execution Recommendations

1. <Recommendation>
2. <Recommendation>
```

### Status Indicators

- `✅ DONE` - Task completed in previous session
- `🔄 IN PROGRESS` - Task started but not complete (formerly `UPDATED`)
- `⏳ PENDING` - Task not yet started
- `⏳ NEW` - Task just created from changelog

---

## Implementation Summary Session Format

**Location:** `specs/<slug>/04-implementation.md`

**Purpose:** Track implementation progress across multiple sessions.

### Session Structure

```markdown
### Session <N> - YYYY-MM-DD

**Trigger:** <What initiated this session>
**Related Feedback:** Feedback #<N> (if applicable)
**Start Time:** HH:MM:SS
**End Time:** HH:MM:SS

**Tasks Completed:**
- ✅ [Task <ID>] <Task description>
  - Files modified: <list>
  - Tests added: <list>
  - Notes: <any relevant notes>

- ✅ [Task <ID>] <Task description>
  - Files modified: <list>
  - Tests added: <list>
  - Notes: <any relevant notes>

**Tasks In Progress:**
- 🔄 [Task <ID>] <Task description>
  - Progress: <description>
  - Next steps: <what remains>

**Known Issues:**
- <Issue description>
- <Issue description>

**Design Decisions:**
- <Decision made during this session>
- <Rationale>

**Next Steps:**
- [ ] <Next action>
- [ ] <Next action>

---
```

### Top-Level Metadata Updates

After each session, these sections are updated:

```markdown
**Status:** In Progress
**Tasks Completed:** <total-count> / <total-tasks>
**Last Session:** Session <N> - YYYY-MM-DD
**Current Phase:** Phase <N> - <Phase Name>

## Files Modified/Created

**Source Files:**
- `path/to/file1.ts` (Sessions: 1, 2)
- `path/to/file2.ts` (Sessions: 2, 3)

**Test Files:**
- `path/to/file1.test.ts` (Sessions: 1, 2)
- `path/to/file2.test.ts` (Sessions: 2, 3)

**Documentation:**
- `docs/api.md` (Session: 3)

## Tests Added

- Unit tests: <count>
- Integration tests: <count>
- E2E tests: <count>

## Known Issues/Limitations

- <Issue from any session>
- <Issue from any session>
```

---

## STM Task Format

**Purpose:** Tasks created for deferred feedback items.

### Task Creation

```bash
stm add "<Brief feedback description>" \
  --details "<Full context including feedback, findings, approach>" \
  --tags "feature:<slug>,feedback,deferred,<priority>" \
  --status pending
```

### Required Tags

1. **feature:<slug>** - Links task to feature
2. **feedback** - Identifies as feedback-related
3. **deferred** - Marks as deferred (vs immediate)
4. **<priority>** - One of: critical, high, medium, low

### Task Details Format

```markdown
**Feedback:** <Full feedback text>

**Type:** <Type value>

**Exploration Findings:**
<Code exploration results>

**Research Insights:**
<Research findings or [Research skipped by user]>

**Recommended Approach:** <Approach description>

**Implementation Scope:** <Scope value>

**When Implementing:**
1. Update spec changelog and affected sections
2. Run /spec:decompose to update tasks
3. Run /spec:execute to implement changes

**Reference:** See specs/<slug>/05-feedback.md for full context
```

### Example Task

```bash
stm add "Dashboard loads slowly with 500+ items" \
  --details "**Feedback:** Dashboard loads >5 seconds when displaying 500+ items. Users expect sub-second response.

**Type:** performance

**Exploration Findings:**
- Current implementation: Full dataset loaded on mount
- No pagination or virtualization
- 500+ DOM elements rendered
- Affected: DashboardList.tsx, useItems hook

**Research Insights:**
Research-expert recommends:
1. Virtual scrolling (react-window) - Best for large lists
2. Pagination - Simpler but less smooth UX
3. Infinite scroll - Good middle ground
Trade-offs: Virtualization adds complexity but provides best UX

**Recommended Approach:** Implement virtual scrolling with react-window

**Implementation Scope:** Comprehensive

**When Implementing:**
1. Update spec changelog and Section 6.4 (Dashboard Implementation)
2. Run /spec:decompose specs/dashboard/02-specification.md
3. Run /spec:execute specs/dashboard/02-specification.md

**Reference:** See specs/dashboard/05-feedback.md #2" \
  --tags "feature:dashboard,feedback,deferred,high" \
  --status pending
```

### Querying Feedback Tasks

```bash
# All feedback for a feature
stm list --tags feature:<slug>,feedback

# Deferred feedback only
stm list --tags feature:<slug>,feedback,deferred

# By priority
stm list --tags feature:<slug>,feedback,deferred,high

# Show full details
stm show <task-id>
```

---

## Schema Validation

### Feedback Log Entry Schema

```typescript
interface FeedbackEntry {
  number: number;                    // Sequential, auto-increment
  date: string;                      // ISO 8601: YYYY-MM-DD HH:MM:SS
  status: 'Accepted - Implementation in progress'
        | 'Deferred - Logged for future consideration'
        | 'Out of scope - Logged only';
  type: 'bug' | 'performance' | 'ux' | 'security' | 'general';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  explorationFindings: string;
  researchFindings: string | '[Research skipped by user]';
  decisions: {
    action: 'Implement now' | 'Defer' | 'Out of scope';
    scope: 'Minimal' | 'Comprehensive' | 'Phased';
    approach: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  };
  actionsTaken: string;
  rationale: string;
}
```

### Changelog Entry Schema

```typescript
interface ChangelogEntry {
  date: string;                      // YYYY-MM-DD
  title: string;                     // Brief description
  source: string;                    // Reference to feedback log
  issue: string;                     // Brief issue description
  decision: string;                  // Action + Scope
  changes: Array<{
    section: string;                 // e.g., "Section 6.3"
    name: string;                    // Section name
    changeType: 'Updated' | 'Addition' | 'Removal';
    old?: string;                    // Previous content (if Updated)
    new: string;                     // New content
    rationale: string;               // Why this change
  }>;
  implementationImpact: {
    priority: string;
    approach: string;
    affectedComponents: string[];
    blastRadius: string;
  };
  nextSteps: string[];
}
```

### Re-decompose Metadata Schema

```typescript
interface RedecomposeMetadata {
  decomposeHistory: Array<{
    session: number;
    date: string;                    // YYYY-MM-DD
    mode: 'Full' | 'Incremental' | 'Skip';
    changelogEntries: number;
    newTasks: number;
    notes: string;
  }>;
  currentSession: {
    mode: 'Incremental';
    previousDecompose: string;       // YYYY-MM-DD HH:MM:SS
    currentDecompose: string;        // YYYY-MM-DD HH:MM:SS
    changelogEntriesProcessed: number;
  };
  changelogEntries: Array<{
    title: string;
    impact: string;
    action: string;
  }>;
  taskChanges: {
    preserved: {
      count: number;
      taskIds: string[];
    };
    updated: {
      count: number;
      taskIds: string[];
    };
    created: {
      count: number;
      taskIds: string[];
    };
  };
  taskStatus: Map<string, {
    phase: string;
    taskId: string;
    status: '✅ DONE' | '🔄 IN PROGRESS' | '⏳ PENDING' | '⏳ NEW';
    description: string;
  }>;
  recommendations: string[];
}
```

---

## Data Flow

### Feedback → Changelog → Tasks → Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User provides feedback via /spec:feedback                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Feedback logged in 05-feedback.md                            │
│    - Entry #N created with all details                          │
│    - Decision recorded (implement/defer/out-of-scope)           │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    Implement Now            Defer/Out of Scope
         │                       │
         ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│ 3a. Spec Changelog  │   │ 3b. STM Task        │
│     Updated         │   │     Created         │
│  - Section 18 entry │   │  - Tagged           │
│  - Change details   │   │  - Full context     │
└────────┬────────────┘   └─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. /spec:decompose (Incremental Mode)                           │
│    - Detects changelog update                                   │
│    - Preserves completed tasks                                  │
│    - Creates new tasks for changes                              │
│    - Updates 03-tasks.md with metadata                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. /spec:execute (Resume Mode)                                  │
│    - Reads 04-implementation.md                                 │
│    - Skips completed tasks                                      │
│    - Executes only new tasks                                    │
│    - Appends Session N+1                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Version History

**v1.2.0 (Nov 21, 2025):**
- Initial feedback workflow API specification
- Defined all file formats and schemas
- Documented data flow and integration

---

**See Also:**
- [Feedback Workflow Guide](../guides/feedback-workflow-guide.md) - User-facing documentation
- [/spec:feedback Command](../../.claude/commands/spec/feedback.md) - Implementation details
- [CLAUDE.md](../../CLAUDE.md) - System overview
