# Add Post-Implementation Feedback Workflow Command

**Slug:** add-feedback-workflow-command
**Author:** Claude Code
**Date:** 2025-11-21
**Branch:** feat/add-feedback-workflow-command
**Related:** /spec:execute, /ideate-to-spec, existing workflow commands

---

## 1) Intent & Assumptions

**Task brief:** Create a new optional command in the workflow that allows users to provide structured feedback after implementation, have Claude research and explore the feedback, create interactive decisions, and optionally update specifications with changes that can feed back into the decompose/execute flow.

**Assumptions:**
- User has already completed `/spec:execute` and has implementation results
- Feedback is given one granular piece at a time (not bulk feedback)
- The command should be interactive and guide the user through decisions
- Some feedback should result in immediate spec changes, others should be deferred
- The workflow should integrate with existing spec structure and STM task tracking
- Simple-task-master (stm) is installed for task tracking capabilities
- Users want a log of feedback decisions similar to the implementation summary

**Out of scope:**
- Automated feedback detection or analysis of the codebase
- Bulk feedback processing (design is for single feedback items)
- Feedback from multiple team members (focused on single user's feedback)
- Integration with external feedback tools (Jira, Linear, etc.)
- Automated testing of feedback-driven changes

---

## 2) Pre-reading Log

Files/documents reviewed with key takeaways:

- `.claude/commands/ideate-to-spec.md`: Interactive decision gathering pattern with AskUserQuestion tool, step-by-step workflow, summary presentation
- `.claude/commands/spec/execute.md`: Session continuity pattern with `04-implementation.md`, task management via STM, implementation summary structure
- `.claude/commands/spec/decompose.md`: Task breakdown creation, STM integration with feature tagging, content preservation requirements
- `.claude/commands/spec/create.md`: Spec creation with comprehensive 17-section structure, validation requirements, first principles analysis
- `README.md`: Current workflow overview (IDEATION → SPECIFICATION → DECOMPOSITION → IMPLEMENTATION → COMPLETION), feature-directory organization, STM task tracking
- `.claude/README.md`: Component documentation showing custom commands layer on top of ClaudeKit
- `CLAUDE.md`: System architecture, version 1.1.0 features, document organization in `specs/<slug>/` directories
- Research report: Industry patterns for continuous feedback loops, categorization frameworks (blocking vs optional), living document approaches, decision tracking patterns

---

## 3) Codebase Map

**Primary components/modules:**
- `.claude/commands/` - Custom slash commands directory
  - `ideate-to-spec.md` - Interactive decision workflow pattern
  - `spec/execute.md` - Implementation with session continuity
  - `spec/decompose.md` - Task breakdown with STM integration
  - `spec/doc-update.md` - Parallel documentation review

**Shared dependencies:**
- STM (simple-task-master) for persistent task tracking
- Feature-based directory structure: `specs/<slug>/`
- Interactive decision pattern using AskUserQuestion tool
- Task agent system for research and code exploration
- Standardized document formats (markdown with specific sections)

**Data flow:**
1. User completes `/spec:execute` → `04-implementation.md` exists
2. User provides feedback → New command processes
3. Claude explores code + research (optional) → Findings gathered
4. Interactive decisions → User makes choices
5. Feedback logged → `05-feedback.md` created/updated
6. If changes approved → `02-specification.md` updated with changelog
7. If changes approved → Can run `/spec:decompose` and `/spec:execute` again

**Feature flags/config:**
- None currently, but command should check for STM availability
- Should integrate with existing settings.json hooks configuration

**Potential blast radius:**
- New command file: `.claude/commands/spec/feedback.md`
- New document in feature directories: `specs/<slug>/05-feedback.md`
- Updates to existing `02-specification.md` (changelog section)
- Potential new STM tasks created for deferred items
- Documentation updates needed in README.md, CLAUDE.md, and .claude/README.md

---

## 4) Root Cause Analysis

N/A - This is a new feature, not a bug fix.

---

## 5) Research Findings

The research-expert conducted comprehensive investigation into feedback loops in iterative software development. Key findings:

### Potential Solutions

**Solution 1: Continuous Micro-Feedback (Windsurf/Cursor Pattern)**
- Embed feedback prompts throughout implementation after each task
- Quick categorization at each step (blocking vs optional)
- Minimal disruption to flow

**Pros:**
- Catches issues early before they compound
- Maintains continuous human control over AI actions
- Aligns with industry best practices (Windsurf's continuous perception)
- Natural checkpoints during implementation

**Cons:**
- Could feel interruptive if feedback prompts are too frequent
- Requires discipline to provide feedback consistently
- May slow down rapid iteration phases
- Not suitable for post-implementation review scenarios

---

**Solution 2: Structured Feedback Sessions (Post-Implementation Review Pattern)**
- Discrete command run after `/spec:execute` completion
- Single feedback item processed per invocation
- Complete workflow from feedback → decision → action

**Pros:**
- Clear separation of implementation and review phases
- User controls when to provide feedback
- Comprehensive processing of each feedback item
- Suitable for manual testing discoveries
- Matches the user's stated requirement

**Cons:**
- Delayed feedback may miss opportunities for course correction
- Requires context switching between implementation and review
- May accumulate multiple issues before addressing any

---

**Solution 3: Hybrid Continuous + Structured Sessions**
- Quick checks during implementation (optional prompts)
- Structured review sessions after completion (deliberate command)
- Combines benefits of both approaches

**Pros:**
- Flexibility for different feedback scenarios
- Catches critical issues early while allowing thorough review later
- Matches research recommendation (Section 5.1 of research report)
- Can evolve from structured to continuous over time

**Cons:**
- More complex to implement
- Potential for confusion about when to use which approach
- Requires careful UX design to avoid duplication

---

**Solution 4: Single Continuous Flow Command**
- One command that handles entire feedback lifecycle
- Loops internally until user decides they're done
- No need to re-run command for multiple feedback items

**Pros:**
- Simpler mental model (one command, all feedback)
- Natural conversation flow
- Less context switching between commands
- Can process related feedback items together

**Cons:**
- Very long command execution sessions
- Harder to pause and resume
- May accumulate too much change before user sees results
- Doesn't fit "one feedback item at a time" requirement well

---

### Recommendation

**Adopt Solution 2: Structured Feedback Sessions with iterative invocation**

**Rationale:**
1. **Matches user requirements**: The user explicitly stated "1 specific piece of feedback granular as possible at a time" and the feedback comes during "manual testing myself" after implementation
2. **Clear workflow boundary**: Feedback happens AFTER `/spec:execute`, so a discrete command makes sense
3. **Controlled scope**: Processing one feedback item per invocation keeps sessions focused and manageable
4. **Re-runnable**: User can invoke multiple times for multiple feedback items, each creating entries in the feedback log
5. **Natural exit points**: After each feedback item, user decides whether to continue or stop
6. **Aligns with existing patterns**: Similar to how `/ideate-to-spec` has clear start/end, and `/spec:execute` can be re-run

**Enhanced with research insights:**
- Use two-tier categorization: BLOCKING vs DEFERRED (from GitHub patterns)
- Create living document `05-feedback.md` for decision log (from ADR patterns)
- Interactive decision workflow using AskUserQuestion (from existing commands)
- Option to defer feedback creates STM tasks (from existing integrations)
- Spec changelog updates maintain history (from ADR best practices)

**Command structure:**
```bash
/spec:feedback <path-to-spec-file>

# Example:
/spec:feedback specs/add-user-auth/02-specification.md
```

**Workflow per invocation:**
1. Prompt user for single feedback item
2. Claude explores relevant code
3. Claude determines if research-expert needed
4. Claude presents findings and recommendations
5. Interactive decisions via AskUserQuestion
6. Update `05-feedback.md` with decisions
7. If "make changes now" selected:
   - Update `02-specification.md` with changelog
   - Inform user to run `/spec:decompose` and `/spec:execute` for implementation
8. If "defer changes" selected:
   - Create STM task tagged with `feature:<slug>,feedback,deferred`
   - Mark as complete

User can then re-run the command for the next feedback item.

---

## 6) Clarifications

### Clarification 1: Single Command vs Split Commands
**Question:** Should this be a single command that handles the entire feedback loop including spec updates and re-execution, or should it stop after updating the spec and require the user to manually run `/spec:decompose` and `/spec:execute` again?

**Context from ideation:** The user stated "I'm undecided whether this should be a single new command that runs thru this entire flow in one continuous thread, vs breaking out after updating the spec and then able to call decompose and/or execute again which realizes that it just needs to change some things not start over."

**Options:**
- **A) Split approach** (recommended): Command updates spec and feedback log, then user explicitly runs `/spec:decompose` and `/spec:execute` to implement
  - Pros: Clear separation of concerns, user maintains control, follows existing workflow patterns
  - Cons: Requires more manual steps

- **B) Continuous approach**: Command automatically calls `/spec:decompose` and `/spec:execute` after updating spec
  - Pros: Fully automated, fewer user actions
  - Cons: Loss of explicit control, harder to pause/review, may be unexpected behavior

**Impact:** Determines command architecture and user workflow patterns

---

### Clarification 2: Feedback Granularity and Batching
**Question:** Should the command support processing multiple related feedback items in a single session (with prompts for "add another?"), or strictly one feedback item per command invocation?

**Context from ideation:** User stated "1 specific piece of feedback granular as possible at a time" but didn't clarify if "at a time" means per session or per decision point.

**Options:**
- **A) Strictly single item per invocation** (recommended): Command processes exactly one feedback item then exits
  - Pros: Simpler, clearer scope, easier to implement, matches "at a time" literally
  - Cons: More command invocations needed for multiple feedback items

- **B) Session-based with "add another?" prompt**: After processing one item, ask "Do you have another feedback item? [Yes/No]"
  - Pros: More efficient for multiple feedback items, natural conversation flow
  - Cons: Longer sessions, harder to pause, may violate "at a time" principle

**Impact:** User experience, session length, command invocation frequency

---

### Clarification 3: Research Expert Invocation Strategy
**Question:** Should Claude automatically decide whether to invoke research-expert, or should it ask the user first?

**Context from ideation:** "claude considers this feedback, explores relevant code, and even decides whether it's worth consulting the research-expert agent"

**Options:**
- **A) Claude decides automatically** (recommended): Based on feedback type/complexity, Claude determines if external research is needed
  - Pros: Faster, less user friction, shows AI judgment
  - Cons: May research when user doesn't want it, uses extra tokens

- **B) Ask user via AskUserQuestion**: "This feedback may benefit from external research. Should I consult the research-expert? [Yes/No/Let Claude decide]"
  - Pros: User control, transparency
  - Cons: Extra decision point, may slow down workflow

**Impact:** User experience, command execution speed, token usage

---

### Clarification 4: Spec Update Scope
**Question:** When updating the spec due to feedback, should the command make targeted changes to specific sections, or should it regenerate entire sections?

**Options:**
- **A) Targeted updates** (recommended): Update only the specific paragraphs/sections affected by feedback, append to changelog
  - Pros: Preserves existing content, surgical changes, faster
  - Cons: May miss related sections that need updating

- **B) Section regeneration**: Regenerate entire affected sections (e.g., whole "Detailed Design" section)
  - Pros: Ensures consistency within sections
  - Cons: May lose important existing details, more disruptive

- **C) Hybrid with user choice**: Show proposed changes, ask "Update only affected paragraphs [A] or regenerate entire section [B]?"
  - Pros: Maximum control
  - Cons: Additional decision burden

**Impact:** Spec file stability, change management, user trust

---

### Clarification 5: Deferred Feedback Tracking
**Question:** For deferred feedback, should we create STM tasks immediately or just log in `05-feedback.md` for later manual processing?

**Options:**
- **A) Automatic STM task creation** (recommended): Create STM task with `feature:<slug>,feedback,deferred` tags
  - Pros: Integrated with existing task tracking, easy to query, actionable
  - Cons: Clutters STM if many items deferred, requires STM installed

- **B) Log only in `05-feedback.md`**: Just document in feedback log, user manually creates tasks later if desired
  - Pros: Cleaner, no STM dependency
  - Cons: Deferred items may be forgotten, no integration with existing workflow

- **C) Ask user per item**: "Should I create an STM task for this deferred feedback? [Yes/No]"
  - Pros: User control
  - Cons: Extra decision point

**Impact:** Task tracking integration, workflow completeness, tool dependencies

---

### Clarification 6: Feedback Log Structure
**Question:** Should `05-feedback.md` be cumulative (all feedback in one file) or session-based (separate files per session)?

**Options:**
- **A) Cumulative single file** (recommended): All feedback for a feature logged chronologically in `specs/<slug>/05-feedback.md`
  - Pros: Single source of truth, easy to review history, simpler structure
  - Cons: File may get large, harder to find specific feedback items

- **B) Session-based files**: `specs/<slug>/05-feedback-session-1.md`, `05-feedback-session-2.md`, etc.
  - Pros: Smaller files, clear session boundaries
  - Cons: Fragmented history, harder to see full picture

**Impact:** Documentation structure, long-term maintainability

---

### Clarification 7: Re-decompose Behavior
**Question:** When spec is updated with feedback changes, should `/spec:decompose` be smart enough to only create tasks for the changes, or should it regenerate all tasks?

**Context from ideation:** "then we should basically be able to pick up the decompose -> execute flow similar to how we would have the first time" and "which realizes that it just needs to change some things not start over"

**Options:**
- **A) Incremental task creation**: Decompose analyzes changelog, creates only new/modified tasks, preserves completed tasks
  - Pros: Doesn't duplicate work, efficient, smart
  - Cons: Complex to implement, may miss dependencies

- **B) Full regeneration with smart status**: Regenerate all tasks but check STM for completed ones, mark them done
  - Pros: Ensures consistency, comprehensive
  - Cons: May create duplicates, requires careful STM querying

- **C) Manual user decision**: Ask "Should I create tasks for only the changes [A] or regenerate full task breakdown [B]?"
  - Pros: User control, clear intent
  - Cons: User may not know which is appropriate

**Impact:** Re-implementation workflow, task management, user experience

---

### Clarification 8: Interactive Decision Format
**Question:** For the interactive decisions, should we use the same multi-question format as `/ideate-to-spec` (1-4 questions at once) or present decisions one at a time?

**Context from ideation:** "interactively steps the user through the decisions similar to the /ideate-to-spec command"

**Options:**
- **A) Sequential single decisions**: Present one decision at a time, wait for answer, proceed to next
  - Pros: Focused, less overwhelming, can adapt based on previous answers
  - Cons: More back-and-forth, may feel tedious

- **B) Batched questions like ideate-to-spec** (recommended): Present related decisions together (2-4 questions)
  - Pros: Efficient, matches existing pattern, familiar UX
  - Cons: User must think about multiple things at once

**Impact:** User experience, command execution time, cognitive load

---

### Clarification 9: Handling Conflicts with In-Progress Work
**Question:** What should happen if user runs `/spec:feedback` while there are incomplete tasks from previous `/spec:execute`?

**Options:**
- **A) Block with warning**: "You have incomplete tasks. Complete or defer them before providing feedback."
  - Pros: Prevents confusion, maintains clean state
  - Cons: Inflexible, may frustrate users

- **B) Allow but warn**: "Note: You have incomplete tasks. Feedback changes may affect them."
  - Pros: Flexible, user decides
  - Cons: May lead to inconsistent state

- **C) Offer to complete/defer first**: "You have X incomplete tasks. Would you like to mark them as done, defer them, or continue anyway?"
  - Pros: Helpful, maintains flexibility
  - Cons: Complex, additional decision burden

**Impact:** Workflow safety, user experience, state management

---

### Clarification 10: Command Naming
**Question:** What should the command be named?

**Options:**
- **A) `/spec:feedback`** (recommended): Clear, concise, fits existing `/spec:*` pattern
- **B) `/spec:review`**: Implies broader review, may confuse with code review
- **C) `/feedback`**: Shorter but less specific about scope
- **D) `/spec:feedback-session`**: More descriptive but longer

**Impact:** Command discoverability, clarity of purpose, consistency with existing commands

---
