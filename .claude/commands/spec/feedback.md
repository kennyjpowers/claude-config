---
description: Process post-implementation feedback with interactive decisions
category: workflow
allowed-tools: Read, Grep, Glob, Write, Edit, Task, AskUserQuestion, Bash(stm:*), Bash(claudekit:status stm)
argument-hint: "<path-to-spec-file-AND-feedback>"
---

# Process Post-Implementation Feedback

Process ONE specific piece of feedback from testing/usage with structured workflow including code exploration, optional research, interactive decisions, and spec updates.

## Command Syntax

```bash
/spec:feedback <path-to-spec-file-AND-feedback>

# Example:
/spec:feedback specs/add-user-auth/02-specification.md change the "create todo" button color to blue
```

## Prerequisites

- Must have completed `/spec:execute` for the feature (04-implementation.md must exist)
- STM recommended but not required (graceful degradation)
- Feedback should be specific and actionable

## Workflow Steps

### Step 1: Validation & Setup

Extract the feature slug, validate prerequisites, check STM availability, and warn about incomplete tasks.

## Instructions for Claude

Follow these steps to validate prerequisites before collecting feedback:

**1. Extract Feature Slug**

Extract the slug from the spec path provided as argument. The slug will be used for:
- Feedback log path: `specs/<slug>/05-feedback.md`
- STM task tags: `feature:<slug>`
- Implementation summary: `specs/<slug>/04-implementation.md`

Path formats to support:
- Feature directory: `specs/<slug>/02-specification.md` → slug is `<slug>`
- Legacy feature: `specs/feat-<name>.md` → slug is `feat-<name>`
- Legacy bugfix: `specs/fix-<issue>-<desc>.md` → slug is `fix-<issue>-<desc>`

Use simple string manipulation (cut, basename/dirname) to extract the slug. Validate the slug contains only lowercase letters, numbers, and hyphens.

Example implementation:
```bash
# Get spec path from argument
SPEC_PATH="$ARGUMENTS"

# Extract slug based on path format
if [[ "$SPEC_PATH" == specs/*/02-specification.md ]]; then
  # Feature-directory format: extract middle directory
  SLUG=$(echo "$SPEC_PATH" | cut -d'/' -f2)
else
  # Legacy format: extract filename without extension
  SLUG=$(basename "$SPEC_PATH" .md)
fi

# Validate slug format
if [[ ! "$SLUG" =~ ^[a-z0-9-]+$ ]]; then
  echo "❌ Error: Invalid slug format: $SLUG"
  echo "   Slug must be lowercase alphanumeric with hyphens"
  exit 1
fi

echo "✓ Feature slug: $SLUG"
```

**2. Validate Prerequisites**

Check that the implementation summary exists. This file is created by `/spec:execute` and must be present before processing feedback.

Path to check: `specs/<slug>/04-implementation.md`

If the file doesn't exist:
- Display error: "❌ Error: No implementation found"
- Instruct user to run: `/spec:execute specs/<slug>/02-specification.md`
- Exit with error

If the file exists:
- Display: "✅ Implementation summary found"
- Continue to next step

**3. Check STM Availability**

Check if Simple Task Master is available for tracking deferred feedback. Use the claudekit command directly:

```bash
!claudekit status stm
```

Based on the output, inform the user:
- **"Available and initialized"** → STM is ready for tracking deferred tasks
- **"Available but not initialized"** → Warn user to run `stm init`, proceed without STM
- **"Not installed"** → Warn user to install STM, proceed without tracking

Display appropriate messages:
- If available: "✅ STM available for task tracking"
- If not available: "⚠️ Warning: STM not installed" + installation instructions
- If not initialized: "⚠️ Warning: STM not initialized" + init command

Remember the STM availability status for Step 6 (when creating deferred tasks).

**4. Check for Incomplete Tasks**

If STM is available and initialized, check for in-progress tasks for this feature.

Query STM:
```bash
stm list --tags "feature:<slug>" --status in-progress
```

If any incomplete tasks are found:
- Count the tasks
- Display warning: "⚠️ Warning: You have X task(s) still in progress"
- Note: "Feedback changes may affect them"
- List the task IDs and titles
- Inform user they can proceed but should be aware of potential conflicts

Allow the workflow to continue even with incomplete tasks (this is a warning, not a blocker).

**5. Display Readiness**

Display a separator and confirmation that validation is complete:
```
═══════════════════════════════════════════════════
Ready to process feedback for: <slug>
═══════════════════════════════════════════════════
```

After validation, proceed to Step 2 (Feedback Collection).

### Step 2: Feedback Collection

Prompt the user to provide ONE specific piece of feedback from their testing or usage.

**Prompt for Feedback**

Display clear instructions and examples to guide the user in providing actionable feedback:

```
╔═══════════════════════════════════════════════════════════════╗
║           Provide Feedback from Testing/Usage                 ║
╚═══════════════════════════════════════════════════════════════╝

Please provide ONE specific piece of feedback from your testing:

Examples of good feedback:
• "Authentication fails when password contains special characters"
• "Dashboard loading is slow with >100 items"
• "Error messages are not user-friendly"
• "Cannot delete items after editing them"
• "Mobile layout breaks on screens <375px wide"

Guidelines:
- Be specific about what's wrong or what could be improved
- Include relevant context (conditions, data, steps to reproduce)
- One issue per feedback session (run command multiple times for multiple issues)

Your feedback:
```

Wait for the user to provide their feedback. The user should type or paste their feedback description at this point.

**Validate Feedback**

After receiving the feedback, perform basic validation:
- Check that feedback is not empty
- Warn if feedback seems very short (< 3 words)
- Display confirmation showing first 100 characters

If validation passes, store the feedback text for use in subsequent steps (exploration, decisions, logging).

### Step 3: Code Exploration

Use Task agent with Explore subagent to investigate relevant code based on feedback.

**Read Spec to Identify Affected Components**

Read the specification file at `specs/<slug>/02-specification.md` using the Read tool.

Extract information from the "Detailed Design" section about:
- Component names and descriptions
- File paths and directory structure
- Dependencies and integration points
- Current implementation approach

This information will provide context for targeted code exploration.

**Categorize Feedback Type**

Analyze the feedback text to determine what type of issue this is and where to focus exploration:

- **Bug/Error** (keywords: fail, error, crash, broken, doesn't work, bug)
  → Focus on: Error handling, edge cases, validation logic, failure paths

- **Performance** (keywords: slow, performance, lag, timeout, delay)
  → Focus on: Performance bottlenecks, resource usage, optimization opportunities

- **UX/UI** (keywords: ux, ui, confusing, unclear, hard to, difficult)
  → Focus on: User interaction flows, UI components, feedback mechanisms

- **Security** (keywords: security, auth, permission, access)
  → Focus on: Security controls, authentication, authorization, input validation

- **General** (other keywords)
  → Focus on: Overall implementation, integration points, data flow

Display the categorization and focus area to help frame the exploration.

**Launch Explore Agent**

Use the Task tool with `subagent_type: Explore` to investigate the codebase:

```
Task tool:
- description: "Explore code for feedback issue"
- subagent_type: Explore
- model: haiku  (for faster exploration)
- prompt: |
    # Feedback Exploration Request

    **Feature:** <slug>
    **Feedback:** <user's feedback text>
    **Type:** <categorized type>

    **Affected Components (from spec):**
    <list components from Detailed Design section>

    **Investigation Focus:**
    <exploration focus based on feedback type>

    Please conduct a QUICK but THOROUGH exploration to identify:
    1. Where in the code changes would be needed to address this feedback
    2. The blast radius (what other code might be affected)
    3. Related code that should be reviewed
    4. Any immediate concerns or risks

    Time limit: Aim for 3-5 minutes of exploration. Focus on actionable findings.
```

The Explore agent will investigate and return findings about the codebase areas related to the feedback.

**Capture Exploration Findings**

After the Explore agent completes, summarize the key findings:
- Files/components requiring changes
- Blast radius assessment (scope of impact)
- Related code to review
- Immediate concerns or risks

Display: "✓ Code exploration complete"

Store these findings for use in decision making (Step 5) and feedback logging (Step 7).

### Step 4: Optional Research

Ask the user if they want research-expert consultation, and invoke if requested.

**Ask User About Research**

Use the AskUserQuestion tool to offer optional research consultation:

```
AskUserQuestion:
- Question: "Would you like the research-expert to investigate potential approaches and best practices for addressing this feedback?"
- Header: "Research"
- multiSelect: false
- Options:
  1. Label: "Yes - Investigate approaches"
     Description: "Launch research-expert to analyze industry best practices, compare implementation approaches, and provide recommendations with trade-offs"

  2. Label: "No - Continue with findings"
     Description: "Skip research and proceed with the exploration findings already gathered"
```

**Launch Research-Expert (If Requested)**

If the user selected "Yes - Investigate approaches", launch the research-expert agent:

```
Task tool:
- description: "Research feedback solutions"
- subagent_type: research-expert
- model: haiku  (for faster research)
- prompt: |
    # Research Request: Feedback Solution Approaches

    **Context:**
    - Feature: <slug>
    - Feedback Type: <categorized type>
    - Issue: <user's feedback text>

    **Exploration Findings:**
    <summary of code exploration findings>

    **Research Objectives:**
    1. Industry best practices for this type of issue
    2. Recommended approach with clear rationale
    3. Alternative approaches with trade-offs
    4. Security and performance considerations
    5. Common pitfalls to avoid

    Please provide concise, actionable recommendations focused on helping make an informed implementation decision.

    Time limit: 5-7 minutes. Focus on practical recommendations.
```

**Capture Research Findings**

After research-expert completes (or if skipped), capture the results:
- If research was performed: Summarize industry best practices, recommended approaches, trade-offs, and considerations
- If research was skipped: Note "[Research skipped by user]"

Display: "✓ Research investigation complete" (or "✓ Continuing without research")

Store these findings for use in decision making (Step 5) and feedback logging (Step 7).

### Step 5: Interactive Decisions

Present findings and gather user decisions with batched questions.

**Display Findings Summary**

Present the exploration and research findings to the user in a clear format:

```
═══════════════════════════════════════════════════════════
                  FINDINGS SUMMARY
═══════════════════════════════════════════════════════════

Feedback: <user's feedback text>

Type: <categorized type>

--- CODE EXPLORATION FINDINGS ---
<summary of exploration findings>

--- RESEARCH FINDINGS ---
<research findings or "[Research skipped by user]">

═══════════════════════════════════════════════════════════
Now let's decide how to proceed...
```

**Gather Decisions with Batched Questions**

Use AskUserQuestion tool to collect all decisions at once. The questions should be asked based on the user's primary action choice:

**Question 1 (Always ask):**
```
- question: "How would you like to address this feedback?"
- header: "Action"
- multiSelect: false
- options:
  1. label: "Implement now"
     description: "Address this feedback immediately by updating the spec and re-running implementation"
  2. label: "Defer"
     description: "Log this feedback and create an STM task to address it later"
  3. label: "Out of scope"
     description: "Log this feedback but take no action (not aligned with current goals)"
```

**Question 2 (If "Implement now" selected):**
```
- question: "What implementation scope should be used?"
- header: "Scope"
- multiSelect: false
- options:
  1. label: "Minimal"
     description: "Address only the specific issue reported, smallest possible change"
  2. label: "Comprehensive"
     description: "Address the issue plus related improvements identified in findings"
  3. label: "Phased"
     description: "Split into multiple phases: quick fix now, comprehensive improvements later"
```

**Question 3 (If "Implement now" selected and research/exploration provided approaches):**
```
- question: "Which implementation approach should be used?"
- header: "Approach"
- multiSelect: false
- options:
  [Build options dynamically from findings]
  - List recommended approach from research/exploration
  - List alternative approaches with trade-offs
  - Include "Custom approach" option
```

**Question 4 (If "Implement now" or "Defer" selected):**
```
- question: "What is the priority level for addressing this feedback?"
- header: "Priority"
- multiSelect: false
- options:
  1. label: "Critical"
     description: "Blocks core functionality or has security implications - must fix immediately"
  2. label: "High"
     description: "Significant impact on user experience or system reliability"
  3. label: "Medium"
     description: "Noticeable issue but workarounds exist"
  4. label: "Low"
     description: "Minor inconvenience or nice-to-have improvement"
```

**Capture Decisions**

After collecting answers from AskUserQuestion, store the decisions:
- Action (implement/defer/out-of-scope)
- Scope (if implementing: minimal/comprehensive/phased)
- Approach (if implementing: selected approach)
- Priority (if implementing or deferring: critical/high/medium/low)

Display confirmation:
```
✓ Decisions captured
  Action: <selected action>
  Scope: <selected scope>
  Approach: <selected approach>
  Priority: <selected priority>
```

Store these decisions for use in Step 6 (action execution) and Step 7 (feedback logging).

### Step 6: Execute Actions

Execute the appropriate actions based on the user's decision.

Based on the action decision from Step 5, perform the appropriate action:

**Branch Logic:**
- If "Implement now" → Update spec changelog (see below)
- If "Defer" → Create STM task (see below)
- If "Out of scope" → Skip to Step 7 (only log feedback, no other action)

Display: "Processing action: <selected action>"

**If Action = "Implement now": Update Spec Changelog**

Add a changelog entry to the specification documenting the feedback and planned changes.

1. Check if the spec has a "## 18. Changelog" or "## Changelog" section
   - If missing: Create the section using Write/Edit tools
   - Display: "✓ Created Changelog section in spec"

2. Use Edit tool to append the changelog entry at the end of the Changelog section:

```markdown
### <current-date> - Post-Implementation Feedback

**Source:** Feedback #<N> (see specs/<slug>/05-feedback.md)

**Issue:** <user's feedback text>

**Decision:** Implement with <scope> scope

**Changes to Specification:**
[Based on exploration findings, list specific sections needing updates]
- Section X: <description of change needed>
- Section Y: <description of change needed>

**Implementation Impact:**
- Priority: <selected priority>
- Approach: <selected approach>
- Affected components: <list from exploration>
- Estimated blast radius: <from exploration>

**Next Steps:**
1. Review and update the affected specification sections above
2. Run `/spec:decompose specs/<slug>/02-specification.md` to update task breakdown
3. Run `/spec:execute specs/<slug>/02-specification.md` to implement changes
```

Display completion message:
```
✅ Spec changelog updated

Next steps:
  1. Review and update the affected spec sections listed in the changelog
  2. Run: /spec:decompose specs/<slug>/02-specification.md
  3. Run: /spec:execute specs/<slug>/02-specification.md
```

**If Action = "Defer": Create STM Task**

Create an STM task to track deferred feedback for later implementation.

1. Check if STM is available (from Step 1 validation)
   - If not available: Display warning, skip task creation, proceed to Step 7

2. If STM is available, create a task with the following:
   - **Title:** First 80 characters of feedback (truncate with "..." if longer)
   - **Details:** Full feedback description including:
     - Feedback text
     - Type (bug/performance/ux/security/general)
     - Exploration findings summary
     - Research insights (if any)
     - Recommended approach
     - Implementation scope
     - Reference to `specs/<slug>/05-feedback.md`
   - **Tags:** `feature:<slug>`, `feedback`, `deferred`, `<priority-lowercase>`
   - **Status:** pending

Use STM command:
```bash
stm add "<title>" \
  --details "<full-details>" \
  --tags "feature:<slug>,feedback,deferred,<priority>" \
  --status pending
```

3. After creating the task:
   - Extract the task ID from the command output
   - Display confirmation:
     ```
     ✅ Deferred task created: #<task-id>

     Task details:
       Title: <task-title>
       Tags: feature:<slug>, feedback, deferred, <priority>
       Priority: <selected-priority>

     View task: stm show <task-id>
     List deferred feedback: stm list --tags feature:<slug>,feedback,deferred
     ```
   - Store the task ID for use in Step 7 (feedback log)

4. If task creation fails:
   - Display error: "❌ Error: Failed to create STM task"
   - Continue to Step 7 (feedback will still be logged)

### Step 7: Update Feedback Log

Create or update the feedback log with a complete entry for this feedback item.

**Determine Next Feedback Number**

1. Check if `specs/<slug>/05-feedback.md` exists
2. If exists, find the highest existing feedback number (pattern: `## Feedback #N`)
   - Search for all "## Feedback #" headers
   - Extract the highest number
   - Next number = highest + 1
3. If doesn't exist or no entries found, start with #1

Display: "This will be Feedback #<N>"

**Build Feedback Entry**

Create a complete feedback entry using the Write/Edit tools with this markdown structure:

```markdown
## Feedback #<N>

**Date:** <current-date-time>
**Status:** <status-based-on-action>
**Type:** <feedback-type>
**Priority:** <selected-priority>

### Description

<user's-feedback-text>

### Code Exploration Findings

<summary-of-exploration-findings>

### Research Findings

<research-findings-or-"Research skipped by user">

### Decisions

- **Action:** <selected-action>
- **Scope:** <selected-scope>
- **Approach:** <selected-approach>
- **Priority:** <selected-priority>

### Actions Taken

<action-specific-details>

### Rationale

This feedback was addressed through the /spec:feedback workflow:
1. Code exploration identified affected components and blast radius
2. Research <was-performed-or-skipped>
3. Interactive decision process resulted in: <action>
4. <status>

---
```

**Status values based on action:**
- "Implement now" → "Accepted - Implementation in progress"
- "Defer" → "Deferred - Logged for future consideration"
- "Out of scope" → "Out of scope - Logged only"

**Actions Taken section content:**
- If "Implement now": "Updated specification changelog (Section 18); Next steps: Update spec sections → /spec:decompose → /spec:execute"
- If "Defer" (with STM task): "Created STM task #<task-id>; Tagged with: feature:<slug>, feedback, deferred, <priority>; View with: stm show <task-id>"
- If "Defer" (no STM): "Logged for future consideration; Note: STM not available, task not created"
- If "Out of scope": "Logged as out of scope; No further action planned"

**Write the Feedback Log**

1. If `specs/<slug>/05-feedback.md` doesn't exist, create it with header:

```markdown
# Feedback Log

Post-implementation feedback, analysis, and decisions for the <slug> feature.

Each feedback item includes:
- Description of the issue or improvement
- Code exploration and research findings
- Interactive decision results
- Actions taken (spec updates, deferred tasks, or out-of-scope logging)

---
```

2. Use Write or Edit tool to create/update the feedback log:
   - If file doesn't exist: Use Write tool to create with header + entry
   - If file exists: Use Edit tool to append entry to end

3. Display confirmation:
```
✅ Feedback log updated: specs/<slug>/05-feedback.md
```

**Display Completion Summary**

Show a comprehensive summary of what was completed:

```
═══════════════════════════════════════════════════════════
              FEEDBACK PROCESSING COMPLETE
═══════════════════════════════════════════════════════════

Feedback #<N> processed successfully

Decision: <selected-action>
Priority: <selected-priority>

Files Updated:
  - specs/<slug>/05-feedback.md
  <if-implement-now: - specs/<slug>/02-specification.md (changelog)>

<if-implement-now:
Next Steps:
  1. Review the changelog entry in the spec
  2. Update the affected specification sections
  3. Run: /spec:decompose specs/<slug>/02-specification.md
  4. Run: /spec:execute specs/<slug>/02-specification.md
>

<if-defer-with-task:
STM Task Created: #<task-id>

Query Commands:
  - View task: stm show <task-id>
  - List all deferred feedback: stm list --tags feature:<slug>,feedback,deferred
  - List by priority: stm list --tags feature:<slug>,feedback,deferred,<priority>
>

<if-out-of-scope:
No further action required.
>

View feedback log: specs/<slug>/05-feedback.md
═══════════════════════════════════════════════════════════
```

## Example Usage

### Scenario: Bug Found During Testing

```bash
# After completing implementation
/spec:execute specs/my-feature/02-specification.md

# Discover issue during manual testing
# Run feedback workflow
/spec:feedback specs/my-feature/02-specification.md

# Command will:
# 1. Validate prerequisites
# 2. Prompt for feedback description
# 3. Explore relevant code
# 4. Optionally research solutions
# 5. Guide through decisions
# 6. Update spec/log as appropriate
# 7. Create STM task if deferred
```

### Expected Outputs

**If "Implement Now" selected:**
- `specs/<slug>/02-specification.md` updated with changelog entry
- `specs/<slug>/05-feedback.md` created/updated with decision log
- Next steps: Run `/spec:decompose` then `/spec:execute`

**If "Defer" selected:**
- `specs/<slug>/05-feedback.md` created/updated with decision log
- STM task created with tags: `feature:<slug>`, `feedback`, `deferred`, `<priority>`
- View with: `stm list --tags feature:<slug>,feedback,deferred`

**If "Out of Scope" selected:**
- `specs/<slug>/05-feedback.md` created/updated with decision log
- No further action required

## Integration with Other Commands

This command integrates with the full specification workflow:

```
/spec:execute (complete implementation)
     ↓
Manual testing discovers issue
     ↓
/spec:feedback (this command)
     ↓
Implement now? → Update spec changelog
     ↓
/spec:decompose (incremental mode - preserves completed work)
     ↓
/spec:execute (resume mode - continues from previous progress)
```

## Troubleshooting

### Error: "No implementation found"

**Cause:** 04-implementation.md doesn't exist
**Solution:** Run `/spec:execute` first to complete initial implementation

### Warning: "STM not installed"

**Cause:** simple-task-master not installed globally
**Solution:** Install with `npm install -g simple-task-master` or continue without (deferred feedback will be logged but not tracked)

### Warning: "X tasks still in progress"

**Cause:** Previous implementation session has incomplete tasks
**Solution:** Review in-progress tasks. Feedback changes may affect them. Can proceed or complete tasks first.

### Example: Performance Issue (Deferred)

```bash
# After implementation and testing
/spec:feedback specs/dashboard-feature/02-specification.md

# Feedback provided: "Dashboard loads slowly with 500+ items"
# Research expert: Yes
# Decision: Defer for Phase 2
# Priority: High

# Result:
# - STM task created with research findings
# - Tagged: feature:dashboard-feature,feedback,deferred,high
# - Logged in 05-feedback.md #2
```

### Example: Out of Scope Decision

```bash
# Feedback: "Would be nice to export data as XML"
# Research expert: No
# Decision: Out of scope
# Priority: Low

# Result:
# - Logged in 05-feedback.md #3
# - No spec updates
# - No STM tasks created
# - Documented rationale for out-of-scope decision
```

## Edge Cases and Special Scenarios

### Multiple Feedback Items
Process ONE item at a time. For multiple issues:
```bash
/spec:feedback specs/my-feature/02-specification.md  # Issue 1
/spec:feedback specs/my-feature/02-specification.md  # Issue 2
/spec:feedback specs/my-feature/02-specification.md  # Issue 3
```
Each gets its own feedback number and independent decision-making.

### Feedback on In-Progress Implementation
If you have tasks still in progress, the command will warn you but allow proceeding. Consider:
- Complete current tasks first if feedback affects them
- Or proceed with feedback and update task context during next `/spec:execute`

### STM Not Available
Command gracefully degrades:
- Feedback still logged in 05-feedback.md
- Deferred decisions logged but no STM task created
- Recommendation displayed to install STM
- All other functionality works normally

### Empty or Minimal Changelog
If spec has no Changelog section, one is created automatically. If feedback is first, it becomes Feedback #1.

### Conflicting Feedback
If multiple feedback items conflict:
- Process each separately
- Log each with its own decision
- Changelog will show both entries
- `/spec:decompose` will create tasks for all accepted feedback
- Implementation reconciles conflicts based on priority

## See Also

- `/spec:decompose` - Breaks down specifications into tasks (supports incremental mode)
- `/spec:execute` - Implements specification tasks (supports resume mode)
- `/spec:doc-update` - Updates documentation after implementation
- [Feedback Workflow Guide](../../docs/guides/feedback-workflow-guide.md)
