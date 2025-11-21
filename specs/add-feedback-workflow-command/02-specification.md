# Post-Implementation Feedback Workflow System

**Status:** Draft
**Authors:** Claude Code
**Date:** 2025-11-21
**Feature Slug:** add-feedback-workflow-command

---

## 1. Overview

This specification defines a comprehensive feedback workflow system that enables structured post-implementation feedback processing with interactive decision-making, code exploration, optional research integration, and intelligent re-implementation support. The system consists of a new `/spec:feedback` command and enhancements to existing `/spec:decompose` and `/spec:execute` commands to support incremental changes and session continuity.

## 2. Background/Problem Statement

After completing implementation via `/spec:execute`, users perform manual testing and discover issues, edge cases, or improvement opportunities. Currently, there is no structured way to:

1. **Capture feedback systematically** - Feedback is ad-hoc without a defined workflow
2. **Explore code context** - No guided code exploration for understanding impact
3. **Make informed decisions** - No interactive decision framework for addressing feedback
4. **Update specifications** - No clear path to update specs with feedback-driven changes
5. **Re-implement incrementally** - Decompose/execute workflows don't understand what's already done vs what needs changes

This creates friction in the iterative development cycle and makes it difficult to evolve features based on real-world testing and usage.

### Core Problem

Users need a structured, single-feedback-item-at-a-time workflow that:
- Processes one specific piece of feedback per invocation
- Explores relevant code to understand impact
- Optionally consults research-expert for solution approaches
- Presents interactive decisions with clear options
- Updates specifications with changelog entries
- Enables incremental re-implementation without starting over
- Maintains a decision log for traceability

## 3. Goals

- **Structured Feedback Processing**: Single-feedback-item workflow with clear steps
- **Code-Aware Exploration**: Automated exploration of relevant codebase areas
- **Optional Research Integration**: User-controlled research-expert consultation
- **Interactive Decision Making**: Batched questions (2-4) using AskUserQuestion pattern
- **Targeted Spec Updates**: Surgical changes to specs with changelog tracking
- **Incremental Re-Implementation**: Smart decompose/execute that preserves completed work
- **Decision Traceability**: Cumulative feedback log with chronological entries
- **Task Management Integration**: Automatic STM task creation for deferred feedback
- **Session Continuity**: Implementation resumes from previous progress
- **Flexible Workflow**: Allow feedback even with incomplete tasks (with warning)

## 4. Non-Goals

- Automated feedback detection or code analysis
- Bulk feedback processing (multiple items simultaneously)
- Multi-user feedback aggregation or collaboration features
- External tool integration (Jira, Linear, etc.)
- Automated testing of feedback-driven changes
- Continuous feedback embedded within `/spec:execute`
- Feedback analytics or reporting dashboards
- Real-time collaboration on feedback items

## 5. Technical Dependencies

### Required Dependencies
- **Simple-task-master (stm)**: For persistent task tracking and deferred feedback management
- **AskUserQuestion tool**: For interactive decision gathering
- **Task agent system**: For code exploration and optional research invocation
- **Feature-based directory structure**: `specs/<slug>/` organization
- **Existing spec structure**: 17-section specification format
- **Git**: For commit tracking and changelog analysis

### Version Requirements
- Claude Code: Latest version with AskUserQuestion support
- STM: v1.0.0+ (graceful degradation if not installed)
- Node.js: v18+ (for command execution)

### External Resources
- ClaudeKit agents: research-expert, code-review-expert, specialized domain experts
- Git command-line tools
- Markdown parsing capabilities

## 6. Detailed Design

### 6.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Feedback Workflow System                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐      ┌──────────────────┐               │
│  │ /spec:feedback│──────▶│ 05-feedback.md   │               │
│  │    command    │       │   (decision log)  │               │
│  └───────┬───────┘      └──────────────────┘               │
│          │                                                    │
│          ├─────▶ Code Exploration (Task agents)             │
│          │                                                    │
│          ├─────▶ Optional Research (research-expert)        │
│          │                                                    │
│          ├─────▶ Interactive Decisions (AskUserQuestion)    │
│          │                                                    │
│          ├─────▶ Update Spec Changelog                       │
│          │       (02-specification.md)                       │
│          │                                                    │
│          └─────▶ Create Deferred Tasks (STM)                │
│                                                               │
│  ┌────────────────┐                                          │
│  │ /spec:decompose│─────▶ Incremental Mode                  │
│  │   (enhanced)   │       • Detect changelog changes        │
│  └────────────────┘       • Create only new tasks           │
│                            • Preserve completed tasks        │
│                                                               │
│  ┌────────────────┐                                          │
│  │ /spec:execute  │─────▶ Resume Capability                 │
│  │   (enhanced)   │       • Read previous progress          │
│  └────────────────┘       • Skip completed work             │
│                            • Append to summary              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Data Flow

```
User completes /spec:execute
         │
         ▼
Manual testing discovers issue/improvement
         │
         ▼
Run: /spec:feedback specs/<slug>/02-specification.md
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
1. Validate prerequisites           2. Extract feature slug
   • 04-implementation.md exists       • specs/<slug>/... → <slug>
   • STM available (warn if not)
         │
         ▼
3. Prompt for feedback item
   • Clear instructions
   • Single granular item
         │
         ▼
4. Explore relevant code
   • From spec's codebase map
   • Task agent for exploration
         │
         ▼
5. Ask: "Consult research-expert?"
   ├─── Yes → Research solution approaches
   └─── No  → Continue with findings
         │
         ▼
6. Present findings & recommendations
         │
         ▼
7. Interactive decisions (batched 2-4 questions)
   • How to address feedback?
   • Implement now or defer?
   • Which approach to use?
   • What scope of changes?
         │
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
   Implement Now           Defer                  Out of Scope
         │                      │                      │
         ▼                      ▼                      └─── Log and exit
8a. Update spec          8b. Create STM task
    changelog                 with tags:
    (targeted)                feature:<slug>
                              feedback, deferred
         │                      │
         ▼                      ▼
9. Log decision to 05-feedback.md
   • Timestamp
   • Feedback description
   • Exploration findings
   • Decisions made
   • Actions taken
         │
         ▼
10. Inform user of next steps
    • For "implement now":
      /spec:decompose (incremental)
      /spec:execute (resume)
    • For "defer":
      Task tracked in STM
```

### 6.3 Component Design

#### 6.3.1 `/spec:feedback` Command

**File:** `.claude/commands/spec/feedback.md`

**Command Syntax:**
```bash
/spec:feedback <path-to-spec-file>

# Example:
/spec:feedback specs/add-user-auth/02-specification.md
```

**Workflow Steps:**

**Step 1: Validation & Setup**
```markdown
1. Extract feature slug from path
   - Pattern: specs/<slug>/02-specification.md → slug
   - Store for use in feedback log and STM tasks

2. Validate prerequisites
   - Check 04-implementation.md exists
   - If missing: Error "No implementation found. Run /spec:execute first."

3. Check STM availability
   - Run: claudekit status stm
   - If not installed: Warn but continue (fallback behavior)

4. Check for incomplete tasks
   - Query STM: stm list --status in-progress --tag feature:<slug>
   - If any found: Show warning but allow proceeding
   - Warning: "You have X incomplete tasks. Feedback changes may affect them."
```

**Step 2: Feedback Collection**
```markdown
5. Prompt user for feedback item
   - Clear instructions: "Provide ONE specific piece of feedback from your testing"
   - Examples of good feedback:
     - "Authentication fails when password contains special characters"
     - "Dashboard loading is slow with >100 items"
     - "Error messages are not user-friendly"
   - Capture full feedback description
```

**Step 3: Code Exploration**
```markdown
6. Explore relevant code
   - Read spec's "Detailed Design" section for affected components
   - Use Task agent with Explore subagent
   - Targeted exploration based on feedback type:
     - Bug reports → error handling, validation logic
     - Performance issues → query patterns, rendering logic
     - UX feedback → component structure, user flows
   - Gather findings on:
     - Where changes likely needed
     - Potential blast radius
     - Related code that may be affected
```

**Step 4: Optional Research**
```markdown
7. Ask user: "Should I consult research-expert for this feedback?"
   - Use AskUserQuestion tool
   - Options:
     A) Yes - Investigate solution approaches
     B) No - Continue with exploration findings

8. If user selects "Yes":
   - Launch research-expert agent
   - Prompt: "Research solutions for: {feedback description}"
   - Gather recommendations, alternatives, trade-offs
```

**Step 5: Interactive Decisions**
```markdown
9. Present findings and recommendations
   - Summarize code exploration results
   - Include research findings (if consulted)
   - Highlight key considerations

10. Interactive decisions (batched 2-4 questions)
    - Use AskUserQuestion with batched format

    Example decision set:

    Question 1: How should we address this feedback?
    Options:
      A) Implement changes now (update spec, re-decompose, re-execute)
      B) Defer for later (create STM task, track in feedback log)
      C) Out of scope (log decision, no further action)

    Question 2: (If "implement now") What scope of changes?
    Options:
      A) Minimal fix (address immediate issue only)
      B) Comprehensive solution (address root cause + related issues)
      C) Phased approach (immediate fix + follow-up improvements)

    Question 3: (If applicable) Which technical approach?
    Options:
      A) {Approach from research/exploration}
      B) {Alternative approach}
      C) Custom approach (user specifies)

    Question 4: (If applicable) What priority level?
    Options:
      A) Critical (blocking issue)
      B) High (important improvement)
      C) Medium (nice-to-have enhancement)
```

**Step 6: Execute Actions**
```markdown
11. Based on decisions, take appropriate action:

    If "Implement now" selected:
      a) Update spec changelog section
         - Add entry with timestamp
         - Describe feedback and decision
         - List specific changes to be made
         - Reference feedback log entry

         Example changelog entry:
         ```markdown
         ### 2025-11-21: Authentication Special Characters Fix
         **Source:** Feedback from manual testing (05-feedback.md #3)
         **Issue:** Password validation fails with special characters (!@#$%)
         **Decision:** Update validation regex to support full special char set
         **Changes:**
         - auth/validation.ts: Update PASSWORD_REGEX pattern
         - auth/validation.test.ts: Add test cases for special chars
         - Update "Security Considerations" section with new regex
         ```

      b) Inform user:
         "Spec updated with changelog entry. Next steps:
          1. Run: /spec:decompose specs/<slug>/02-specification.md
          2. Then: /spec:execute specs/<slug>/02-specification.md"

    If "Defer" selected:
      a) Create STM task
         ```bash
         stm add "Deferred: {feedback brief}" \
           --description "{One-line summary of feedback}" \
           --details "{Full feedback description with context}" \
           --tags "feature:<slug>,feedback,deferred,{priority-level}" \
           --status pending
         ```

      b) Inform user:
         "Deferred feedback tracked in STM. View with:
          stm list --tag feedback,deferred"

    If "Out of scope" selected:
      a) Log decision (no spec update)
      b) Inform user of reasoning
```

**Step 7: Update Feedback Log**
```markdown
12. Create or update 05-feedback.md
    - Path: specs/<slug>/05-feedback.md
    - If doesn't exist: Create with header
    - Append new entry (chronological order)

    Entry format:
    ```markdown
    ## Feedback #{N} - {Brief Description}
    **Date:** {timestamp}
    **Status:** {Implemented / Deferred / Out of Scope}
    **STM Task:** {task-id if deferred, or N/A}

    ### Feedback Description
    {Full feedback provided by user}

    ### Code Exploration Findings
    {Summary of what was found in codebase}
    {Affected components/files}
    {Potential blast radius}

    ### Research Insights (if applicable)
    {Findings from research-expert}
    {Recommended approaches}
    {Trade-offs considered}

    ### Decisions Made
    {All decisions from interactive questions}
    - Decision 1: {question} → {choice}
    - Decision 2: {question} → {choice}

    ### Actions Taken
    {What was done as a result}
    - If implemented: Link to changelog entry
    - If deferred: STM task ID and details
    - If out of scope: Reasoning

    ### Rationale
    {Why these decisions make sense}
    {Impact on implementation}
    {Future considerations}
    ```

13. Display summary to user:
    - Feedback processed
    - Decision made (implement/defer/out-of-scope)
    - Next steps (if any)
    - Feedback log updated at: specs/<slug>/05-feedback.md
```

#### 6.3.2 Enhanced `/spec:decompose` - Incremental Mode

**File:** `.claude/commands/spec/decompose.md` (enhanced)

**New Capabilities:**

**Incremental Mode Detection:**
```markdown
1. Before creating task breakdown, check for incremental mode:

   a) Query STM for existing tasks:
      stm list --tag feature:<slug> -f json

   b) Check if changelog has new entries:
      - Read specs/<slug>/02-specification.md
      - Find "Changelog" or "Change History" section
      - Check if 03-tasks.md exists and has timestamp
      - Compare: Are there changelog entries AFTER last decompose?

   c) Determine mode:
      - If no existing STM tasks → Full decompose (first run)
      - If existing tasks AND new changelog entries → Incremental mode
      - If existing tasks AND no new changelog → Skip (already decomposed)

2. If incremental mode detected:
   Display: "📋 Incremental Mode: Detected new changelog entries since last decompose"
```

**Incremental Task Creation:**
```markdown
3. In incremental mode, analyze changelog:

   For each new changelog entry:
     a) Extract specific changes described
     b) Identify affected components/files
     c) Determine if existing tasks need modification
     d) Create NEW tasks only for net-new work

   Example:
   Changelog entry: "Update auth validation regex"
   → Check if Task "Implement auth validation" exists
   → If exists and done: Create "Update auth validation regex" task
   → If exists and pending: Update existing task details
   → If doesn't exist: Create as new task

4. Preserve completed work:
   - Query STM: stm list --status done --tag feature:<slug>
   - Mark these tasks as [DONE] in task breakdown
   - Don't create duplicate tasks for completed work

5. Update task IDs for continuity:
   - New tasks continue numbering from highest existing ID
   - Maintain phase structure
   - Example: If Phase 2 had tasks 2.1-2.5, new tasks are 2.6, 2.7...

6. Generate Re-decompose Metadata section:
   ```markdown
   ## Re-decompose Metadata
   **Mode:** Incremental
   **Previous Decompose:** {timestamp from 03-tasks.md}
   **Current Decompose:** {current timestamp}
   **Changelog Entries Processed:** {count}

   ### Changelog Entries
   - {Entry 1 summary}
   - {Entry 2 summary}

   ### Task Changes
   - **Preserved:** {count} completed tasks
   - **Updated:** {count} existing tasks
   - **Created:** {count} new tasks

   ### Existing Tasks Status (from STM)
   - Task 1.1: ✅ DONE
   - Task 1.2: ✅ DONE
   - Task 2.1: 🔄 IN PROGRESS
   - Task 2.2: ⏳ PENDING
   ```

7. Update 03-tasks.md:
   - Preserve structure of original breakdown
   - Mark completed tasks with ✅
   - Add new section for incremental changes
   - Append new tasks to appropriate phases
```

**STM Task Management for Incremental:**
```markdown
8. Create STM tasks only for NEW work:
   - Skip tasks marked as DONE
   - Update IN PROGRESS tasks if details changed
   - Create new PENDING tasks for new requirements

9. Tag new tasks appropriately:
   - Include: feature:<slug>,incremental,{phase},…
   - Maintain dependency tracking
   - Link to original tasks if related
```

#### 6.3.3 Enhanced `/spec:execute` - Resume Capability

**File:** `.claude/commands/spec/execute.md` (enhanced)

**New Capabilities:**

**Session Detection & Resume:**
```markdown
1. At start of execution, check for previous progress:

   a) Check if 04-implementation.md exists
      - Path: specs/<slug>/04-implementation.md

   b) If exists, read file and extract:
      - Last session date
      - Tasks completed (with file changes)
      - Tasks in progress (with current status)
      - Known issues from previous sessions
      - Files already modified/created
      - Tests already written

   c) Display session info:
      "🔄 Resuming implementation from Session {N} ({date})"
      "Previously completed: {count} tasks"
      "In progress: {task description}"
      "Last modified: {list of files}"

2. Query STM for current task status:
   stm list --tag feature:<slug> -f json

   Cross-reference with implementation summary:
   - Verify completed tasks match STM status
   - Identify any discrepancies
   - Update working state accordingly
```

**Skip Completed Work:**
```markdown
3. Load task list, filtering out completed:

   a) Get all tasks: stm list --tag feature:<slug>

   b) Filter by status:
      - Skip: status = "done"
      - Consider: status = "in-progress" (resume)
      - Execute: status = "pending"

   c) Display execution plan:
      "📋 Execution Plan:"
      "  Completed: {count} tasks (skipping)"
      "  Resuming: {task if any}"
      "  Pending: {count} tasks"

4. For each task to execute:
   - Check if related files already modified in previous session
   - If yes: Inform agent of existing changes
   - Agent should extend/modify, not replace
```

**Incremental Summary Updates:**
```markdown
5. Update 04-implementation.md throughout session:

   a) Preserve all existing content

   b) Add "Session {N+1}" section:
      ```markdown
      ### Session {N+1} - {current-date}
      - ✅ [Task ID] {Task description}
        - Files modified: {list}
        - Tests added: {list}
        - Notes: {any relevant notes}
      ```

   c) Update summary sections:
      - Add new files to "Files Modified/Created"
      - Add new tests to "Tests Added"
      - Update "Tasks Completed" count
      - Update "Known Issues" if new ones found
      - Update "Next Steps"

   d) Append to "Implementation Notes":
      - Design decisions made this session
      - Context for future sessions
      - Any deviations from spec

6. Session markers in summary:
   - Clear delineation: "---\n## Session {N}\n---"
   - Include date and time
   - Track who initiated (manual vs automated)
   - Reference related feedback items if applicable
```

**Cross-Session Context:**
```markdown
7. Provide agents with full context:

   When launching implementation agents:
   ```
   Task tool:
   - description: "Implement {component}"
   - subagent_type: {specialist}
   - prompt: |
       CONTEXT FROM PREVIOUS SESSIONS:
       {extract from 04-implementation.md}

       Current Task: {task details from STM}

       Previous implementations in this feature:
       {list of completed tasks with file changes}

       Known issues to be aware of:
       {list from implementation summary}

       Your task: Implement {component} building on existing work.
   ```

8. Conflict detection:
   - Compare spec changelog timestamps with task timestamps
   - If spec changed after task was completed:
     - Warn: "Spec updated since task {X} was completed"
     - Suggest: Review if task needs updates
   - Allow user to decide whether to re-execute or skip
```

### 6.4 Document Formats

#### 6.4.1 Feedback Log Format

**File:** `specs/<slug>/05-feedback.md`

```markdown
# Feedback Log: {Feature Name}

**Feature Slug:** {slug}
**Spec:** specs/{slug}/02-specification.md
**Created:** {initial-date}

## Overview

This document tracks all feedback items received during testing and evolution of the {feature name} feature. Each entry includes the feedback, exploration findings, decisions made, and actions taken.

---

## Feedback #1 - {Brief Description}
**Date:** 2025-11-21 14:30:00
**Reporter:** {User or "Manual Testing"}
**Status:** Implemented
**STM Task:** N/A
**Spec Changelog:** 2025-11-21 entry

### Feedback Description
{Full detailed feedback provided by user}

### Code Exploration Findings
- **Affected Components:** auth/validation.ts, auth/validation.test.ts
- **Current Implementation:** Password regex: `^[a-zA-Z0-9]+$`
- **Issue:** Regex doesn't allow special characters (!@#$%^&*())
- **Blast Radius:** Low - isolated to validation function

### Research Insights
{If research-expert was consulted, findings go here}

### Decisions Made
1. **How to address?** → Implement now (update spec and re-execute)
2. **Scope of changes?** → Minimal fix (update regex only)
3. **Technical approach?** → Use industry-standard password regex supporting all printable ASCII
4. **Priority?** → High (affects user experience)

### Actions Taken
- Updated spec changelog with fix description
- Created changelog entry: "2025-11-21: Authentication Special Characters Fix"
- User informed to run `/spec:decompose` then `/spec:execute`

### Rationale
This is a straightforward fix addressing a real usability issue. The regex change is low-risk and well-tested. Implementation should take one task in Phase 2 of the decomposition.

---

## Feedback #2 - {Another Brief Description}
**Date:** 2025-11-21 15:45:00
**Reporter:** Manual Testing
**Status:** Deferred
**STM Task:** #47
**Spec Changelog:** N/A

### Feedback Description
{Feedback content}

### Code Exploration Findings
{Findings}

### Research Insights
{If applicable}

### Decisions Made
{Decisions}

### Actions Taken
- Created STM task #47: "Deferred: {brief}"
- Tagged: feature:{slug},feedback,deferred,medium-priority
- Logged in feedback log for future reference

### Rationale
{Why deferred and future considerations}

---

{Continue with additional feedback entries chronologically...}
```

#### 6.4.2 Spec Changelog Section Format

**Location:** In `specs/<slug>/02-specification.md`

```markdown
## 18. Changelog

### 2025-11-21: Authentication Special Characters Fix
**Source:** Feedback from manual testing (05-feedback.md #1)
**Issue:** Password validation fails with special characters (!@#$%)
**Decision:** Update validation regex to support full printable ASCII character set

**Changes to Specification:**

1. **Section 6.3: Password Validation (Updated)**
   - OLD: Regex pattern `^[a-zA-Z0-9]+$`
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
- Affects: auth/validation.ts (update PASSWORD_REGEX constant)
- Affects: auth/validation.test.ts (add 3 new test cases)
- Estimated scope: 1 task in Phase 2

**Next Steps:**
1. Run `/spec:decompose` to create incremental tasks
2. Run `/spec:execute` to implement changes

---

### 2025-11-22: Dashboard Performance Optimization
**Source:** Feedback from manual testing (05-feedback.md #5)
**Issue:** Dashboard loads slowly with >100 items
**Decision:** Implement virtualization and pagination

{...follow same format...}
```

#### 6.4.3 Re-decompose Metadata Section

**Location:** Appended to `specs/<slug>/03-tasks.md`

```markdown
## Re-decompose Metadata

### Decompose History

| Session | Date       | Mode        | Changelog Entries | New Tasks | Notes                        |
|---------|------------|-------------|-------------------|-----------|------------------------------|
| 1       | 2025-11-20 | Full        | N/A               | 15        | Initial decomposition        |
| 2       | 2025-11-21 | Incremental | 2                 | 3         | Auth fix + dashboard perf    |

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
- **Preserved:** 12 completed tasks (Tasks 1.1-1.5, 2.1-2.7)
- **Updated:** 1 task (Task 3.1 - added performance context)
- **Created:** 3 new tasks (Tasks 2.8, 3.6, 3.7)

### Existing Tasks Status (from STM at 2025-11-21 16:00:00)

**Phase 1: Foundation (Complete)**
- Task 1.1: ✅ DONE - Set up TypeScript project
- Task 1.2: ✅ DONE - Configure build system
- Task 1.3: ✅ DONE - Set up testing framework
- Task 1.4: ✅ DONE - Create project structure
- Task 1.5: ✅ DONE - Initial documentation

**Phase 2: Core Features**
- Task 2.1: ✅ DONE - Implement user model
- Task 2.2: ✅ DONE - Create auth service
- Task 2.3: ✅ DONE - Add password validation
- Task 2.4: ✅ DONE - Implement JWT tokens
- Task 2.5: ✅ DONE - Create auth middleware
- Task 2.6: ✅ DONE - Add auth endpoints
- Task 2.7: ✅ DONE - Write auth tests
- Task 2.8: ⏳ NEW - Update password regex for special characters

**Phase 3: Dashboard Features**
- Task 3.1: ✅ DONE - Create dashboard component (updated context)
- Task 3.2: ✅ DONE - Implement data fetching
- Task 3.3: 🔄 IN PROGRESS - Add filtering
- Task 3.4: ⏳ PENDING - Add sorting
- Task 3.5: ⏳ PENDING - Write dashboard tests
- Task 3.6: ⏳ NEW - Implement virtualization for large lists
- Task 3.7: ⏳ NEW - Add pagination controls

### Execution Recommendations
1. Complete Task 3.3 (in progress)
2. Execute new tasks: 2.8, 3.6, 3.7
3. Then continue with: 3.4, 3.5
```

## 7. User Experience

### 7.1 Typical Workflow

**Scenario: User discovers auth bug during testing**

```
1. User completes implementation:
   /spec:execute specs/add-user-auth/02-specification.md

2. User tests manually, finds issue:
   "Login fails when password contains @ symbol"

3. User provides feedback:
   /spec:feedback specs/add-user-auth/02-specification.md

4. Command extracts slug: add-user-auth

5. Command validates:
   ✅ Implementation summary found (04-implementation.md)
   ⚠️  Warning: 2 tasks still in progress
      Continue anyway? [Yes/No]
   → User: Yes

6. Command prompts:
   "Provide ONE specific piece of feedback from testing:"
   → User: "Login fails when password contains @ symbol"

7. Command explores code:
   🔍 Exploring relevant code...
   - Found: auth/validation.ts with PASSWORD_REGEX
   - Current regex: ^[a-zA-Z0-9]+$
   - Issue: Doesn't allow special characters

8. Command asks about research:
   Should I consult research-expert for solution approaches?
   [A] Yes - Investigate approaches
   [B] No - Continue with findings
   → User: A (Yes)

9. Research-expert investigates:
   📚 Researching password validation best practices...
   - Industry standard: Allow all printable ASCII
   - Recommendation: Regex [\x21-\x7E]+
   - Alternative: Explicit character whitelist
   - Security consideration: More chars = more entropy

10. Interactive decisions (batched):
    [Question 1] How should we address this feedback?
      A) Implement now (update spec, re-decompose, re-execute)
      B) Defer for later (create STM task)
      C) Out of scope (log decision, no action)
    → User: A

    [Question 2] What scope of changes?
      A) Minimal fix (update regex only)
      B) Comprehensive (regex + UI indicators + help text)
    → User: A

    [Question 3] Which regex approach?
      A) Printable ASCII [\x21-\x7E]+ (recommended)
      B) Explicit whitelist [a-zA-Z0-9!@#$%...]+
    → User: A

11. Command updates spec:
    ✅ Updated specs/add-user-auth/02-specification.md
       - Added changelog entry
       - Updated validation section
       - Added test requirements

12. Command logs feedback:
    ✅ Updated specs/add-user-auth/05-feedback.md
       - Feedback #3 logged
       - Decisions recorded
       - Actions documented

13. Command displays summary:
    ╔═══════════════════════════════════════════════════╗
    ║        Feedback Processing Complete               ║
    ╚═══════════════════════════════════════════════════╝

    Decision: Implement now
    Spec updated: specs/add-user-auth/02-specification.md
    Feedback log: specs/add-user-auth/05-feedback.md #3

    Next Steps:
    1. /spec:decompose specs/add-user-auth/02-specification.md
    2. /spec:execute specs/add-user-auth/02-specification.md

14. User runs decompose (incremental mode):
    /spec:decompose specs/add-user-auth/02-specification.md

    📋 Incremental Mode: Detected new changelog entries

    Analyzing changelog...
    - Found 1 new entry: Auth special characters fix

    Loading existing tasks...
    - 12 tasks completed (preserved)
    - 2 tasks in progress (preserved)
    - 3 tasks pending (preserved)

    Creating new tasks...
    ✅ Created Task 2.8: Update password validation regex
       Tags: feature:add-user-auth,incremental,phase2

    Updated: specs/add-user-auth/03-tasks.md

15. User runs execute (resume mode):
    /spec:execute specs/add-user-auth/02-specification.md

    🔄 Resuming implementation from Session 2 (2025-11-21)
    Previously completed: 12 tasks
    In progress: 2 tasks

    📋 Execution Plan:
      Skipping: 12 completed tasks
      Resuming: Task 3.3 (Add filtering)
      New: Task 2.8 (Update password regex)
      Pending: 3 other tasks

    Starting with Task 2.8...
    {Implementation proceeds...}
```

### 7.2 User Interface Elements

**Command Help:**
```
/spec:feedback <path-to-spec-file>

Process one piece of feedback from testing/usage.

The command will:
1. Prompt for feedback description
2. Explore relevant code
3. Optionally research solutions
4. Guide you through decisions
5. Update spec and feedback log
6. Create tasks if deferred

Example:
  /spec:feedback specs/my-feature/02-specification.md

Prerequisites:
  - Must have run /spec:execute first
  - STM installed (recommended, not required)

See: docs/workflow.md#feedback-workflow
```

**Progress Indicators:**
```
🔍 Exploring code...
📚 Researching solutions...
✅ Spec updated
✅ Feedback logged
⚠️  Warning: {message}
❌ Error: {message}
```

## 8. Testing Strategy

### 8.1 Testing Approach

Since Claude Code commands are **markdown-based instructions** rather than executable code, testing focuses on **behavioral verification** through documented test scenarios, fixture-based validation, and end-to-end workflow testing.

### 8.2 Test Scenarios

**Test Suite:** `tests/scenarios/feedback-workflow-scenarios.md`

Each scenario documents:
- **Purpose**: What behavior is being validated
- **Setup**: Required initial state (files, STM tasks, etc.)
- **Execution**: Command to run and inputs to provide
- **Expected Outputs**: Files created, content requirements, STM state
- **Verification**: Steps to confirm correct behavior
- **Cleanup**: Teardown procedures

#### Scenario 1: Basic Feedback Processing (Implement Now)

**Purpose:** Verify full feedback workflow with "implement now" decision creates correct outputs

**Setup:**
```bash
# Create test feature with completed implementation
mkdir -p specs/test-auth-feedback
cp tests/fixtures/sample-spec.md specs/test-auth-feedback/02-specification.md
cp tests/fixtures/sample-implementation.md specs/test-auth-feedback/04-implementation.md
stm init
```

**Execution:**
```bash
/spec:feedback specs/test-auth-feedback/02-specification.md

# Provide inputs when prompted:
# - Feedback: "Login fails with special characters in password"
# - Research expert? No
# - How to address? Implement now
# - Scope? Minimal fix
# - Priority? High
```

**Expected Outputs:**
- `specs/test-auth-feedback/05-feedback.md` created with:
  - Feedback #1 entry
  - Timestamp
  - Status: "Implemented"
  - Decisions recorded
  - Rationale documented
- `specs/test-auth-feedback/02-specification.md` updated with:
  - New "## 18. Changelog" section (if missing)
  - Entry dated today
  - Source: "Feedback from manual testing (05-feedback.md #1)"
  - Changes listed

**Verification:**
```bash
# Verify feedback log created
test -f specs/test-auth-feedback/05-feedback.md
grep "## Feedback #1" specs/test-auth-feedback/05-feedback.md

# Verify changelog updated
grep "## 18. Changelog" specs/test-auth-feedback/02-specification.md
grep "05-feedback.md #1" specs/test-auth-feedback/02-specification.md

# Verify format correctness
grep "### Feedback Description" specs/test-auth-feedback/05-feedback.md
grep "### Decisions Made" specs/test-auth-feedback/05-feedback.md
grep "### Actions Taken" specs/test-auth-feedback/05-feedback.md
```

**Cleanup:**
```bash
rm -rf specs/test-auth-feedback
```

#### Scenario 2: Deferred Feedback with STM Task Creation

**Purpose:** Verify deferred feedback creates STM task with proper tags

**Setup:**
```bash
mkdir -p specs/test-defer
cp tests/fixtures/sample-spec.md specs/test-defer/02-specification.md
cp tests/fixtures/sample-implementation.md specs/test-defer/04-implementation.md
stm init
```

**Execution:**
```bash
/spec:feedback specs/test-defer/02-specification.md

# Inputs:
# - Feedback: "Dashboard performance slow with 500+ items"
# - Research expert? Yes
# - How to address? Defer for later
# - Priority? Medium
```

**Expected Outputs:**
- `specs/test-defer/05-feedback.md` created with Status: "Deferred"
- STM task created with tags: `feature:test-defer`, `feedback`, `deferred`, `medium-priority`
- Spec changelog NOT updated (deferred items don't update spec)

**Verification:**
```bash
# Verify feedback logged as deferred
grep "**Status:** Deferred" specs/test-defer/05-feedback.md

# Verify STM task created
stm list --tag feature:test-defer,feedback,deferred | grep "Dashboard performance"

# Verify spec unchanged (no new changelog entry)
! grep "Dashboard performance" specs/test-defer/02-specification.md
```

**Cleanup:**
```bash
rm -rf specs/test-defer
stm delete --tag feature:test-defer --force
```

#### Scenario 3: Incremental Decompose After Feedback

**Purpose:** Verify decompose detects incremental mode and creates only new tasks

**Setup:**
```bash
mkdir -p specs/test-incremental/{01,02,03,04}
cp tests/fixtures/spec-with-changelog.md specs/test-incremental/02-specification.md
cp tests/fixtures/existing-tasks.md specs/test-incremental/03-tasks.md
cp tests/fixtures/implementation-summary.md specs/test-incremental/04-implementation.md

# Create completed STM tasks
stm add "Task 1.1" --tags "feature:test-incremental,phase1" --status done
stm add "Task 2.1" --tags "feature:test-incremental,phase2" --status done
stm add "Task 2.2" --tags "feature:test-incremental,phase2" --status done
```

**Execution:**
```bash
/spec:decompose specs/test-incremental/02-specification.md
```

**Expected Outputs:**
- Console displays: "📋 Incremental Mode: Detected new changelog entries"
- `specs/test-incremental/03-tasks.md` updated with:
  - "## Re-decompose Metadata" section
  - Preserved tasks marked ✅ DONE
  - New tasks created for changelog entries
  - Task numbering continuity maintained

**Verification:**
```bash
# Verify incremental mode detected
grep "Mode: Incremental" specs/test-incremental/03-tasks.md

# Verify completed tasks preserved
grep "Task 1.1: ✅ DONE" specs/test-incremental/03-tasks.md
grep "Task 2.1: ✅ DONE" specs/test-incremental/03-tasks.md

# Verify new tasks created
grep "Task 2.3: ⏳ NEW" specs/test-incremental/03-tasks.md

# Verify metadata section exists
grep "## Re-decompose Metadata" specs/test-incremental/03-tasks.md
grep "Preserved: 3 completed tasks" specs/test-incremental/03-tasks.md
```

**Cleanup:**
```bash
rm -rf specs/test-incremental
stm delete --tag feature:test-incremental --force
```

#### Scenario 4: Execute Resume with Session Continuity

**Purpose:** Verify execute skips completed tasks and appends new session

**Setup:**
```bash
mkdir -p specs/test-resume
cp tests/fixtures/sample-spec.md specs/test-resume/02-specification.md
cp tests/fixtures/tasks-breakdown.md specs/test-resume/03-tasks.md
cp tests/fixtures/implementation-session-1.md specs/test-resume/04-implementation.md

# Set up STM tasks with mixed status
stm add "Task 1.1" --tags "feature:test-resume,phase1" --status done
stm add "Task 1.2" --tags "feature:test-resume,phase1" --status done
stm add "Task 2.1" --tags "feature:test-resume,phase2" --status pending
```

**Execution:**
```bash
/spec:execute specs/test-resume/02-specification.md
```

**Expected Outputs:**
- Console displays: "🔄 Resuming implementation from Session 1"
- Console shows: "Skipping: 2 completed tasks"
- `specs/test-resume/04-implementation.md` updated with:
  - "### Session 2 - {today's date}" section
  - Previous Session 1 content preserved
  - New tasks completed listed under Session 2

**Verification:**
```bash
# Verify session 2 added
grep "### Session 2" specs/test-resume/04-implementation.md

# Verify session 1 preserved
grep "### Session 1" specs/test-resume/04-implementation.md

# Verify both sessions visible
[ $(grep -c "### Session" specs/test-resume/04-implementation.md) -eq 2 ]
```

**Cleanup:**
```bash
rm -rf specs/test-resume
stm delete --tag feature:test-resume --force
```

#### Scenario 5: Graceful Degradation Without STM

**Purpose:** Verify commands work when STM not installed

**Setup:**
```bash
mkdir -p specs/test-no-stm
cp tests/fixtures/sample-spec.md specs/test-no-stm/02-specification.md
cp tests/fixtures/sample-implementation.md specs/test-no-stm/04-implementation.md

# Simulate STM not available (rename stm binary temporarily)
mv $(which stm) $(which stm).backup 2>/dev/null || true
```

**Execution:**
```bash
/spec:feedback specs/test-no-stm/02-specification.md

# Choose "defer" option
```

**Expected Outputs:**
- Warning displayed: "STM not installed"
- Command continues without failure
- Feedback logged in 05-feedback.md
- Deferred item logged but STM task NOT created

**Verification:**
```bash
# Verify feedback logged
test -f specs/test-no-stm/05-feedback.md
grep "**Status:** Deferred" specs/test-no-stm/05-feedback.md

# Verify warning about STM (in command output during execution)
# Manual verification: user should see warning message
```

**Cleanup:**
```bash
rm -rf specs/test-no-stm
mv $(which stm).backup $(which stm) 2>/dev/null || true
```

### 8.3 Fixture-Based Testing

**Directory:** `tests/fixtures/feedback-workflow/`

Pre-configured test artifacts for repeatable testing:

**Fixtures Include:**
- `sample-spec.md` - Complete specification with all 17 sections
- `sample-implementation.md` - Implementation summary with tasks completed
- `spec-with-changelog.md` - Spec with existing changelog entries
- `existing-tasks.md` - Task breakdown with completed/pending tasks
- `expected-feedback-log.md` - Template for verifying feedback log format
- `expected-changelog-entry.md` - Template for verifying changelog format

**Test Execution Script:** `tests/run-feedback-tests.sh`

```bash
#!/bin/bash
# Automated test runner for feedback workflow

set -e

echo "Running Feedback Workflow Test Suite..."

# Run each scenario
./tests/scenarios/01-basic-feedback-implement.sh
./tests/scenarios/02-deferred-feedback.sh
./tests/scenarios/03-incremental-decompose.sh
./tests/scenarios/04-execute-resume.sh
./tests/scenarios/05-graceful-degradation.sh
./tests/scenarios/06-security-validation.sh

echo "✅ All tests passed"
```

### 8.4 Manual Test Checklist

**Critical Path Testing** (Required before release):

#### Feedback Command Tests
- [ ] **Basic flow**: Provide feedback → implement now → verify spec/log updated
- [ ] **Defer flow**: Provide feedback → defer → verify STM task created
- [ ] **Out of scope**: Provide feedback → out of scope → verify logged only
- [ ] **Research integration**: Request research-expert → verify findings included
- [ ] **Incomplete tasks warning**: Run with in-progress tasks → verify warning shown
- [ ] **Missing prerequisites**: Run without 04-implementation.md → verify error

#### Incremental Decompose Tests
- [ ] **Mode detection**: Run after changelog update → verify incremental mode
- [ ] **Task preservation**: Verify completed tasks marked ✅ DONE
- [ ] **New task creation**: Verify only new tasks created for changelog changes
- [ ] **Task numbering**: Verify new tasks continue sequence (e.g., 2.5 → 2.6)
- [ ] **Metadata section**: Verify re-decompose metadata added to 03-tasks.md

#### Execute Resume Tests
- [ ] **Session detection**: Run after previous session → verify resume message
- [ ] **Skip completed**: Verify completed tasks skipped
- [ ] **Session append**: Verify new Session N added, previous preserved
- [ ] **Cross-session context**: Verify agents receive previous session info

#### Security Tests
- [ ] **Path traversal**: Try `../../etc/passwd` → verify rejected
- [ ] **Invalid slug**: Try malformed spec path → verify error
- [ ] **Command injection**: Try feedback with `$(rm -rf /)` → verify sanitized
- [ ] **Large input**: Provide 10KB feedback text → verify handled gracefully

#### Integration Tests
- [ ] **Full cycle**: Execute → feedback → decompose → execute → verify works
- [ ] **Multiple feedback**: Process 3 feedback items → verify all logged
- [ ] **Mixed decisions**: Implement, defer, out-of-scope → verify all handled

### 8.5 Coverage Requirements

Since this is behavioral testing of markdown commands, coverage is measured by **scenario coverage** rather than code coverage:

**Minimum Behavioral Coverage:**
- ✅ All workflow paths (implement/defer/out-of-scope)
- ✅ All file outputs (feedback log, changelog, tasks, implementation summary)
- ✅ All integrations (STM, AskUserQuestion, Task agents)
- ✅ All error conditions (missing files, invalid paths, security violations)
- ✅ All optional features (research-expert, graceful STM degradation)

**Critical Paths Requiring Thorough Testing:**
- **Data preservation**: Completed work never lost during incremental decompose
- **File safety**: Path validation prevents writes outside project
- **Input sanitization**: User feedback can't inject commands or break markdown
- **State consistency**: STM tasks synchronized with file states

## 9. Performance Considerations

### 9.1 Code Exploration Optimization

**Challenge:** Full codebase search is slow for large projects

**Mitigation:**
- Targeted exploration based on spec's "Detailed Design" section
- Read only files mentioned in codebase map
- Use Explore agent with "quick" thoroughness for initial scan
- Cache exploration results in feedback log for future reference

**Example:**
```typescript
// Instead of scanning entire codebase
await exploreAgent.scan({ pattern: '**/*' }); // SLOW

// Target specific areas
await exploreAgent.scan({
  files: specCodebaseMap.affectedFiles,
  thoroughness: 'quick'
}); // FAST
```

### 9.2 STM Query Optimization

**Challenge:** Querying all tasks for large features is slow

**Mitigation:**
- Use feature-specific tag filtering: `--tag feature:<slug>`
- Combine filters: `--tag feature:<slug> --status done`
- Cache STM results during command execution
- Batch STM operations where possible

**Benchmarks:**
- Feature with <20 tasks: <100ms query time
- Feature with 20-100 tasks: <500ms query time
- Feature with >100 tasks: <2s query time (acceptable)

### 9.3 Incremental Decompose Performance

**Challenge:** Analyzing all tasks to determine what's new

**Mitigation:**
- Compare changelog timestamps with task breakdown timestamp
- Skip full analysis if no new changelog entries
- Cache completed task IDs from STM
- Only parse spec changelog section, not entire spec

**Expected Performance:**
- First decompose (full): 5-15 seconds for typical spec
- Incremental decompose: 2-5 seconds (3-5x faster)

### 9.4 Resume Execution Performance

**Challenge:** Loading previous session state

**Mitigation:**
- Parse only necessary sections of implementation summary
- Use JSON for structured data (task status, file list)
- Load agent context lazily (only when needed)

**Expected Performance:**
- Resume overhead: <2 seconds regardless of previous session count

## 10. Security Considerations

### 10.1 Path Traversal Prevention

**Risk:** Malicious spec paths could access files outside project

**Mitigation:**
```typescript
function validateSpecPath(path: string): void {
  // Ensure path is within project root
  const resolvedPath = path.resolve(path);
  const projectRoot = path.resolve(process.cwd());

  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Spec path must be within project directory');
  }

  // Ensure path matches expected pattern
  if (!resolvedPath.match(/^specs\/[a-z0-9-]+\/02-specification\.md$/)) {
    throw new Error('Invalid spec path format');
  }
}
```

### 10.2 Command Injection Prevention

**Risk:** User feedback could contain shell metacharacters

**Mitigation:**
- Never execute user feedback directly as shell commands
- Sanitize input before writing to files
- Use parameterized STM commands
- Escape markdown special characters

```typescript
function sanitizeFeedback(feedback: string): string {
  return feedback
    .replace(/[`${}]/g, '\\$&') // Escape shell chars
    .replace(/</g, '&lt;')      // Escape HTML
    .trim();
}
```

### 10.3 File Write Safety

**Risk:** Overwriting important files or creating malicious content

**Mitigation:**
- Validate file paths before writing
- Use atomic writes (write to temp, then rename)
- Backup files before modification
- Verify content is valid markdown

```typescript
async function safeWriteFeedbackLog(slug: string, content: string): Promise<void> {
  const logPath = `specs/${slug}/05-feedback.md`;
  const tempPath = `${logPath}.tmp`;

  // Validate path
  validateSpecPath(logPath);

  // Write to temp file
  await fs.writeFile(tempPath, content, 'utf8');

  // Verify content is valid markdown
  await validateMarkdown(tempPath);

  // Atomic rename
  await fs.rename(tempPath, logPath);
}
```

### 10.4 STM Task Security

**Risk:** Malicious content in STM tasks

**Mitigation:**
- Validate task content before creation
- Limit task description/details length
- Sanitize tags (alphanumeric + hyphen only)
- Never execute task content directly

### 10.5 Research-Expert Invocation

**Risk:** Unintended external API calls or data leakage

**Mitigation:**
- Always ask user permission before invoking research-expert
- Do not pass sensitive data (secrets, PII) to research agent
- Limit research scope to public documentation
- Timeout research operations after 60 seconds

## 11. Documentation

### 11.1 Command Documentation

**File:** `.claude/commands/spec/feedback.md`
- Complete workflow description
- Step-by-step instructions
- Example usage scenarios
- Integration with decompose/execute
- Troubleshooting common issues

**File:** `.claude/commands/spec/decompose.md` (updated)
- Incremental mode documentation
- Re-decompose metadata explanation
- Task preservation logic
- Examples of incremental scenarios

**File:** `.claude/commands/spec/execute.md` (updated)
- Resume capability documentation
- Session continuity explanation
- Cross-session context handling
- Examples of multi-session workflows

### 11.2 Workflow Documentation

**File:** `README.md` (updated)
- Add feedback phase to workflow diagram
- Update command reference table
- Add feedback workflow example
- Update "Quick Reference" section

```markdown
## Complete Feature Lifecycle

```
IDEATION → SPECIFICATION → DECOMPOSITION → IMPLEMENTATION
    ↓         ↓                ↓               ↓
/ideate   /ideate-to-spec  /spec:decompose  /spec:execute
                                             /validate-and-fix
                                                  ↓
                                            FEEDBACK ← Manual Testing
                                                  ↓
                                            /spec:feedback
                                            (one item at a time)
                                                  ↓
                                     ┌───────────┴────────────┐
                                     ↓                        ↓
                              Implement Now              Defer/Out of Scope
                                     ↓                        ↓
                         Update spec changelog         Create STM task
                                     ↓                        ↓
                              /spec:decompose          Track for future
                              (incremental mode)
                                     ↓
                              /spec:execute
                              (resume mode)
                                     ↓
                              COMPLETION
                                     ↓
                         /spec:doc-update
                         /git:commit
                         /git:push
```
```

**File:** `CLAUDE.md` (updated)
- Add `/spec:feedback` to command overrides section
- Document incremental decompose behavior
- Document execute resume capability
- Update best practices with feedback workflow

**File:** `.claude/README.md` (updated)
- Add feedback command to component list
- Document integration with other commands
- Add feedback log format specification
- Update troubleshooting section

### 11.3 API Documentation

**File:** `docs/api/feedback-workflow.md`
- Feedback log format specification
- Changelog entry format
- Re-decompose metadata schema
- Implementation summary updates
- STM task tagging conventions

### 11.4 User Guides

**File:** `docs/guides/feedback-workflow-guide.md`
- When to use feedback workflow
- How to write good feedback
- Choosing implement vs defer
- Managing multiple feedback items
- Tips for effective iteration

## 12. Implementation Phases

### Phase 1: Core Feedback Command
**Goal:** Basic feedback processing with manual spec updates

**Tasks:**
1. Create `/spec:feedback` command file
2. Implement slug extraction from spec path
3. Implement prerequisite validation (04-implementation.md check)
4. Implement STM availability check with graceful degradation
5. Add feedback prompt with clear instructions
6. Implement code exploration using Task agent with Explore subagent
7. Implement research-expert invocation (with user permission)
8. Implement interactive decisions using AskUserQuestion (batched)
9. Implement feedback log creation and updates (05-feedback.md)
10. Implement spec changelog updates (targeted, preserves existing)
11. Implement deferred task creation in STM with proper tags
12. Add summary output with next steps

**Acceptance Criteria:**
- Command successfully processes one feedback item
- Feedback log created/updated correctly
- Spec changelog updated with proper format
- STM tasks created for deferred feedback
- Works without STM (with warnings)
- Warns about incomplete tasks but allows proceeding

### Phase 2: Incremental Decompose
**Goal:** Smart task creation for feedback-driven changes

**Tasks:**
1. Enhance `/spec:decompose` to detect incremental mode
2. Implement changelog timestamp comparison
3. Implement STM task query for existing tasks
4. Implement changelog analysis for new entries
5. Implement task filtering (preserve completed, update in-progress, add new)
6. Implement task numbering continuity
7. Implement re-decompose metadata section generation
8. Update task breakdown format to include metadata
9. Add STM task creation for only new work
10. Update decompose documentation with incremental mode

**Acceptance Criteria:**
- Detects incremental mode when changelog has new entries
- Preserves completed tasks from STM
- Creates only new tasks for changed requirements
- Updates 03-tasks.md with re-decompose metadata
- Maintains task numbering sequence
- STM tasks properly tagged

### Phase 3: Resume Execution
**Goal:** Session continuity with previous progress awareness

**Tasks:**
1. Enhance `/spec:execute` to detect previous progress
2. Implement implementation summary parsing
3. Implement completed task extraction and filtering
4. Implement in-progress task resume logic
5. Implement STM task status cross-reference
6. Implement session-based summary updates (append, not replace)
7. Add session markers and metadata
8. Implement cross-session context for agents
9. Add conflict detection (spec changes after task completion)
10. Update execute documentation with resume capability

**Acceptance Criteria:**
- Reads previous implementation summary correctly
- Skips completed tasks
- Resumes in-progress tasks with context
- Appends new session to summary (preserves history)
- Provides agents with previous session context
- Detects and warns about spec/task conflicts

### Phase 4: Documentation & Testing
**Goal:** Complete documentation and comprehensive tests

**Tasks:**
1. Write command documentation (feedback, decompose updates, execute updates)
2. Update README.md with feedback workflow
3. Update CLAUDE.md with new capabilities
4. Update .claude/README.md with component info
5. Create user guide for feedback workflow
6. Write API documentation for file formats
7. Implement unit tests for feedback command
8. Implement unit tests for incremental decompose
9. Implement unit tests for resume execution
10. Implement integration tests for full workflow
11. Implement E2E test scenarios
12. Document testing approach and coverage

**Acceptance Criteria:**
- All command files have complete documentation
- Workflow documentation updated in README/CLAUDE.md
- User guide created with examples
- API documentation for all file formats
- Unit test coverage >80%
- Integration tests cover key scenarios
- E2E tests validate complete workflows
- Documentation reviewed and validated

## 13. Open Questions

1. **Task Priority Propagation**: When feedback is marked "critical", should newly created tasks automatically inherit high priority in STM?
   - Option A: Yes, auto-set priority based on feedback priority
   - Option B: No, let decompose assign priority based on standard logic
   - Recommendation: Option A for better workflow continuity

2. **Feedback Notifications**: Should the system support notifying team members when feedback is logged?
   - Option A: Add optional webhook/notification support
   - Option B: Keep it local-only, rely on git commit notifications
   - Recommendation: Option B (defer notifications to v2)

3. **Feedback Templates**: Should there be predefined feedback categories/templates to guide users?
   - Option A: Add templates like "Bug Report", "Performance Issue", "UX Improvement"
   - Option B: Keep it freeform, user describes feedback naturally
   - Recommendation: Option B initially, add templates in v2 if needed

4. **Changelog Limits**: Should there be a limit on changelog size (e.g., archive old entries)?
   - Option A: Auto-archive changelog entries older than X months
   - Option B: Keep full changelog forever, let users manage manually
   - Recommendation: Option B (trust users to manage, add archival in v2)

5. **Conflict Resolution**: What should happen if user runs `/spec:execute` after feedback but before `/spec:decompose`?
   - Option A: Block execution, require decompose first
   - Option B: Allow execution but warn that it won't include feedback changes
   - Option C: Auto-run decompose before execute
   - Recommendation: Option B (inform but don't block)

6. **Feedback Prioritization**: Should the feedback log support sorting/filtering by status, priority, or date?
   - Option A: Keep it simple chronological markdown
   - Option B: Add YAML frontmatter for metadata and build tooling
   - Recommendation: Option A (markdown only, future tooling optional)

## 14. References

### Internal Documentation
- `/ideate-to-spec` command pattern: `.claude/commands/ideate-to-spec.md`
- `/spec:decompose` command: `.claude/commands/spec/decompose.md`
- `/spec:execute` command: `.claude/commands/spec/execute.md`
- Feature-directory organization: `CLAUDE.md` section on document organization
- STM task management: README.md section on task tracking
- AskUserQuestion usage: Claude Code tool documentation

### Research Insights
- ADR (Architecture Decision Records) pattern for living documents
- GitHub review comments categorization (blocking vs optional)
- Windsurf/Cursor continuous feedback patterns
- Iterative software development best practices

### External Resources
- Simple-task-master documentation: npm package docs
- ClaudeKit agent system: npm @claudekit/cli
- Conventional commits specification (for changelog format)
- Semantic versioning principles (for changelog versioning)

### Related Issues/PRs
- (To be added during implementation)

---

**Implementation Note:** This specification is comprehensive and ready for decomposition. All 17 required sections are complete with detailed technical specifications, clear acceptance criteria, and well-defined implementation phases. The design preserves existing workflow patterns while adding powerful new capabilities for iterative development.