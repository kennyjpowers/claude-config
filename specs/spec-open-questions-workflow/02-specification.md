# Interactive Open Questions Resolution for /ideate-to-spec

**Status:** Implemented ✅
**Authors:** Claude Code
**Date:** 2025-11-21
**Implemented:** 2025-11-22
**Version:** 1.2.0
**Related Documents:** specs/spec-open-questions-workflow/01-ideation.md
**Implementation:** specs/spec-open-questions-workflow/04-implementation.md

---

## Overview

Enhance the `/ideate-to-spec` workflow to automatically detect and interactively resolve open questions in generated specifications before proceeding to decomposition. This ensures all specifications are fully implementation-ready by adding an interactive resolution loop (Steps 6a-6d) between validation and summary presentation.

When a specification contains an "Open Questions" section with unanswered questions, the system will:
- Parse each question with its context and options
- Present questions interactively one at a time using AskUserQuestion
- Update the spec file with answers using strikethrough formatting for audit trail
- Re-validate and loop until all questions are resolved
- Prevent proceeding to decomposition with incomplete specifications

---

## Background/Problem Statement

### Current State

The `/ideate-to-spec` workflow currently follows this pattern:
1. Extract slug and read ideation document
2. Gather decisions from ideation clarifications (text-based)
3. Identify specification scope
4. Build and execute `/spec:create` prompt
5. Run `/spec:validate` to check completeness
6. Present summary and next steps

**Problem:** When `/spec:create` generates specifications with "Open Questions" sections (as seen in package-publishing-strategy spec with 12 questions), there is no mechanism to resolve these questions before decomposition. Users must:
- Manually edit the spec file to add answers
- Remember which questions need answers
- Risk proceeding to decomposition with incomplete specifications
- Lose the benefit of interactive guidance that ideation clarifications provide

### Real-World Example

The `specs/package-publishing-strategy/02-specification.md` specification was generated with 12 open questions covering:
- Technical decisions (ClaudeKit version compatibility, ESM vs CommonJS)
- Documentation questions (author information, scope ownership)
- Publishing questions (NPM organization, Anthropic approval)
- Policy questions (support policy, breaking changes)

These questions required manual resolution outside the workflow, creating friction and potential for oversight.

### Root Cause

The workflow assumes specifications are complete after validation, but `/spec:validate` (ClaudeKit) only checks structural completeness (18 required sections), not whether open questions have been answered. There's a gap between "structurally valid" and "implementation-ready."

---

## Goals

- ✅ Automatically detect "Open Questions" sections in generated specifications
- ✅ Parse questions with context, options, and recommendations
- ✅ Present questions interactively using AskUserQuestion tool (one at a time)
- ✅ Update specification file with answers in strikethrough format (preserves audit trail)
- ✅ Re-validate specifications after answering questions
- ✅ Loop until all questions are resolved or user intervention required
- ✅ Skip question resolution if spec has no open questions (backward compatible)
- ✅ Detect already-answered questions and skip them (re-entrant)
- ✅ Handle validation failures gracefully with interactive prompting
- ✅ Include resolved questions in Step 7 summary
- ✅ Maintain implementation localized to `.claude/commands/ideate-to-spec.md`

---

## Non-Goals

- ❌ Modify `/spec:create` command to prevent generating open questions
- ❌ Modify `/spec:validate` command behavior (ClaudeKit external dependency)
- ❌ Change the structure or format of "Open Questions" sections in specs
- ❌ Implement automated question answering (LLM-suggested answers)
- ❌ Support question templates or question libraries
- ❌ Handle multi-spec question propagation (answering once, applying to multiple specs)
- ❌ Implement question analytics or tracking
- ❌ Support collaborative decision-making (multi-user question answering)
- ❌ Handle user cancellation mid-flow (focus on happy path completion)
- ❌ Create automated unit/integration tests (manual testing scenarios only)
- ❌ Modify other workflow commands (feedback, decompose, execute)

---

## Technical Dependencies

### Required Runtime Components

| Component | Version | Purpose |
|-----------|---------|---------|
| Claude Code CLI | latest | Host environment for commands and tools |
| ClaudeKit | latest | Provides `/spec:validate` command |
| AskUserQuestion tool | built-in | Interactive user prompting |
| Read tool | built-in | Parse specification files |
| Edit tool | built-in | Update spec with answers |
| Grep tool | built-in | Extract "Open Questions" section |
| SlashCommand tool | built-in | Execute `/spec:validate` |

### Modified Files

- `.claude/commands/ideate-to-spec.md` - Add Steps 6a-6d between Step 6 and Step 7

### No External Dependencies

This feature uses only built-in Claude Code tools and existing ClaudeKit commands. No external libraries or npm packages required.

---

## Detailed Design

### Architecture Overview

**Current Flow (7 steps):**
```
Step 1: Extract slug & read ideation
Step 2: Interactive decision gathering (text-based)
Step 3: Identify additional specifications
Step 4: Build spec creation prompt
Step 5: Execute /spec:create
Step 6: Validate specification (/spec:validate)
Step 7: Present summary & next steps
```

**Enhanced Flow (adds 4 sub-steps):**
```
Step 1: Extract slug & read ideation
Step 2: Interactive decision gathering (text-based)
Step 3: Identify additional specifications
Step 4: Build spec creation prompt
Step 5: Execute /spec:create
Step 6: Validate specification (/spec:validate)
  └─ If validation passes but has open questions:
     Step 6a: Extract Open Questions from spec
     Step 6b: Interactive question resolution (AskUserQuestion)
     Step 6c: Update spec with answers (Edit tool)
     Step 6d: Re-validate (/spec:validate)
     └─ Loop back to 6a if questions remain
Step 7: Present summary & next steps (includes resolved questions)
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ Steps 1-5: Ideation → Spec Creation                │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ Step 6: /spec:validate                              │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Has Open       │
              │ Questions?     │
              └────────────────┘
                 │          │
             NO  │          │ YES
                 │          │
                 │          ▼
                 │   ┌─────────────────────────────┐
                 │   │ Step 6a: Read Spec          │
                 │   │ - Parse "Open Questions"    │
                 │   │ - Extract question numbers  │
                 │   └─────────────────────────────┘
                 │          │
                 │          ▼
                 │   ┌─────────────────────────────┐
                 │   │ For Each Unanswered Question│
                 │   └─────────────────────────────┘
                 │          │
                 │          ▼
                 │   ┌─────────────────────────────┐
                 │   │ Step 6b: AskUserQuestion    │
                 │   │ - Show question + context   │
                 │   │ - Present options           │
                 │   │ - Collect answer            │
                 │   └─────────────────────────────┘
                 │          │
                 │          ▼
                 │   ┌─────────────────────────────┐
                 │   │ Step 6c: Update Spec        │
                 │   │ - Strikethrough question    │
                 │   │ - Add "Answer:" line        │
                 │   │ - Save via Edit tool        │
                 │   └─────────────────────────────┘
                 │          │
                 │          ▼
                 │   ┌─────────────────────────────┐
                 │   │ More questions?             │
                 │   └─────────────────────────────┘
                 │      │              │
                 │  YES │              │ NO
                 │      │              │
                 │      └──────┐       │
                 │             │       ▼
                 │             │  ┌────────────────┐
                 │             │  │ Step 6d:       │
                 │             │  │ Re-validate    │
                 │             │  └────────────────┘
                 │             │       │
                 │             │       ▼
                 │             │  ┌────────────────┐
                 │             │  │ Still has      │
                 │             │  │ questions?     │
                 │             │  └────────────────┘
                 │             │    │         │
                 │             │YES │         │ NO
                 │             │    │         │
                 │             └────┘         │
                 │                            │
                 ▼                            ▼
┌─────────────────────────────────────────────────────┐
│ Step 7: Present Summary                             │
│ - Include resolved questions list                   │
└─────────────────────────────────────────────────────┘
```

### Implementation Details

#### Step 6a: Extract Open Questions from Spec

**Objective:** Parse the "Open Questions" section from the generated specification file.

**Algorithm:**
```
1. Read spec file: specs/{slug}/02-specification.md
2. Use Grep to locate "## Open Questions" section
3. Extract all numbered questions using pattern: ^[0-9]+\. \*\*(.+?)\*\*
4. For each question, extract:
   - Question number
   - Question text (bold header)
   - Context (paragraphs following question until next question or section)
   - Options (if present, format: "- Option A:", "- Option B:")
   - Recommendations (if present, format: "- Recommendation:")
5. Detect already-answered questions by searching for "Answer:" keyword
6. Build list of unanswered questions
```

**Question Format Examples:**

*Simple question with options:*
```markdown
1. **ClaudeKit Version Compatibility**
   - Option A: Pin exact version (e.g., "1.2.3")
   - Option B: Use caret range (e.g., "^1.0.0")
   - Recommendation: Option B
```

*Open-ended question:*
```markdown
2. **Author Information**
   Who should be listed as package author?
   Need: Name and email address for npm contact
```

*Already answered (skip):*
```markdown
3. ~~**ESM vs CommonJS**~~ (RESOLVED)
   **Answer:** Use ESM (import/export) for modern Node.js 18+ compatibility
```

**Parsing Logic:**
```
If "Answer:" exists in question context:
  → Skip question (already resolved)
Else:
  → Add to unanswered list with question number, text, context, options
```

**Edge Cases:**
- **No "Open Questions" section:** Skip Steps 6a-6d entirely, proceed to Step 7
- **Empty section (no questions):** Skip Steps 6a-6d
- **Malformed questions (no number):** Treat entire section as single free-form question
- **Context exceeds 200 characters:** Truncate for display, preserve full context in spec

#### Step 6b: Interactive Question Resolution

**Objective:** Present each unanswered question to the user interactively and collect answers.

**For Each Unanswered Question:**

1. **Progress Indicator:**
   ```
   Question {N} of {Total}: {Question Text}
   ```

2. **Construct AskUserQuestion Call:**
   ```javascript
   {
     "question": "{Question text from spec}",
     "header": "Question {N}",
     "multiSelect": {detect from question text},
     "options": [
       {
         "label": "Option A" (or extracted from spec),
         "description": "{Context or recommendation}"
       },
       {
         "label": "Option B",
         "description": "..."
       }
     ]
   }
   ```

3. **Multi-Select Detection:**
   - Search question text for keywords: "select all", "multiple", "which ones", "choose multiple"
   - If found: `multiSelect: true`
   - Default: `multiSelect: false`

4. **Options Construction:**
   - If spec has "Option A:", "Option B:" format → Use those as options
   - If spec has "Recommendation:" → Add as description to recommended option
   - If no options in spec → Provide generic: "Yes", "No", "Other (specify)"
   - Always include "Other" option for free-form text

5. **Context Display:**
   - Show question text + first 200 chars of context
   - If context > 200 chars: Add "(see full context in spec)"

6. **Record Answer:**
   ```
   Question {N}: {Question text}
   User's answer: {Selected option or free-form text}
   ```

**Example AskUserQuestion Usage:**
```javascript
AskUserQuestion({
  questions: [{
    question: "Should we pin to specific ClaudeKit version or use caret range?",
    header: "Question 1",
    multiSelect: false,
    options: [
      {
        label: "Pin to exact version (e.g., '1.2.3')",
        description: "More stable but requires frequent updates"
      },
      {
        label: "Use caret range (e.g., '^1.0.0') - Recommended",
        description: "Automatic updates but potential breaking changes. Test compatibility in CI/CD."
      }
    ]
  }]
})
```

#### Step 6c: Update Spec with Answers

**Objective:** Edit the specification file to record user's answers with audit trail.

**Answer Format (Strikethrough Pattern):**

Before:
```markdown
1. **ClaudeKit Version Compatibility**
   - Option A: Pin exact version
   - Option B: Use caret range
   - Recommendation: Option B
```

After:
```markdown
1. ~~**ClaudeKit Version Compatibility**~~ (RESOLVED)
   **Answer:** Use caret range (^1.0.0)
   **Rationale:** Automatic updates, test compatibility in CI/CD

   Original context preserved:
   - Option A: Pin exact version
   - Option B: Use caret range
   - Recommendation: Option B
```

**Edit Tool Usage:**

1. **Locate Question Block:**
   ```
   old_string = "1. **ClaudeKit Version Compatibility**\n   - Option A:..."
   ```

2. **Construct Replacement:**
   ```
   new_string = "1. ~~**ClaudeKit Version Compatibility**~~ (RESOLVED)\n   **Answer:** {user's choice}\n   **Rationale:** {extracted from option description}\n\n   Original context preserved:\n   {original context}"
   ```

3. **Apply Edit:**
   ```
   Edit(
     file_path: "specs/{slug}/02-specification.md",
     old_string: {matched question block},
     new_string: {strikethrough + answer format}
   )
   ```

**Handling Edge Cases:**

- **Edit fails (context mismatch):** Re-read spec, re-parse question, retry once
- **Multiple edits needed:** Apply one at a time (save as we go)
- **External manual edit detected:** Re-parse entire "Open Questions" section before next edit

#### Step 6d: Re-validate and Loop Control

**Objective:** Verify spec is complete and loop until all questions resolved.

**Re-validation Process:**

1. **Execute `/spec:validate`:**
   ```
   /spec:validate specs/{slug}/02-specification.md
   ```

2. **Capture Validation Output:**
   - Completeness score
   - Remaining open questions (if any)
   - Other validation warnings

3. **Decision Logic:**
   ```
   If validation output indicates "Open Questions" section still has unanswered questions:
     → Loop back to Step 6a (re-parse questions)

   Else if validation passes (or only warnings):
     → Proceed to Step 7

   Else if validation fails for non-question reasons:
     → Use AskUserQuestion to prompt:
       "Validation found issues: {list issues}. What would you like to do?"
       Options:
         - "Continue with question resolution (issues can be fixed later)"
         - "Stop and fix validation issues manually first"
         - "Show me the validation details"
   ```

4. **Loop Control:**
   - **User decision:** No iteration limit (user chose "no limit")
   - **Safety check:** If 10+ iterations, warn user: "Resolved {N} questions so far, {M} remain. Continue?"
   - **Exit conditions:**
     - All questions answered AND validation passes
     - User manually requests stop (via interactive prompt)
     - Edit tool fails repeatedly (prompt for manual intervention)

**External Edit Handling:**

- **Re-parse on each iteration:** Read spec fresh every loop to detect manual changes
- **Safety:** Edit tool will fail if old_string doesn't match (prevents data corruption)
- **Recovery:** If Edit fails, re-read spec, show user what changed, ask how to proceed

### Integration with Existing Steps

#### Step 7 Enhancement: Summary with Resolved Questions

**Current Step 7 Output:**
```markdown
## Specification Summary

**Feature Slug:** {slug}
**Spec Location:** specs/{slug}/02-specification.md
**Validation Status:** {PASS/NEEDS_WORK}
**Completeness Score:** {score}/10

### What Was Specified
...

### Decisions Made
{List decisions from Step 2}

### Validation Results
...

### Recommended Next Steps
...
```

**Enhanced Step 7 Output (adds section):**
```markdown
## Specification Summary

**Feature Slug:** {slug}
**Spec Location:** specs/{slug}/02-specification.md
**Validation Status:** READY FOR DECOMPOSITION ✅
**Completeness Score:** 10/10
**Open Questions Resolved:** {count}

### What Was Specified
...

### Decisions Made (Step 2: Ideation Clarifications)
{List decisions from Step 2}

### Resolved Questions (Step 6b: Spec Open Questions)
{List resolved questions with answers}

1. ClaudeKit Version Compatibility → Use caret range (^1.0.0)
2. Author Information → Kenneth Priester <email@example.com>
3. ESM vs CommonJS → ESM (modern Node.js 18+)
...

### Validation Results
✅ All 18 sections complete
✅ All open questions answered
✅ Spec ready for decomposition

### Recommended Next Steps
1. ✅ Review specification at specs/{slug}/02-specification.md
2. → Run /spec:decompose specs/{slug}/02-specification.md
3. → Implement with /spec:execute specs/{slug}/02-specification.md
4. → Track progress: stm list --pretty --tag feature:{slug}
```

### Code Examples

#### Example 1: Question Parsing with Grep

```bash
# Find Open Questions section
grep -n "## Open Questions" specs/my-feature/02-specification.md

# Extract numbered questions
grep -E "^[0-9]+\. \*\*" specs/my-feature/02-specification.md

# Check if question is already answered
grep -A 5 "^1\. \*\*" specs/my-feature/02-specification.md | grep -q "Answer:"
```

#### Example 2: AskUserQuestion Call

```javascript
AskUserQuestion({
  questions: [
    {
      question: "Should we support npm, yarn, and pnpm equally?",
      header: "Question 3",
      multiSelect: false,
      options: [
        {
          label: "Yes, all three equally",
          description: "Single publish to npm registry automatically supports all three package managers"
        },
        {
          label: "npm only",
          description: "Simplest approach, users can still use other package managers manually"
        },
        {
          label: "npm + yarn only",
          description: "Skip pnpm support initially"
        }
      ]
    }
  ]
})
```

#### Example 3: Edit Tool Update

```javascript
Edit({
  file_path: "specs/package-publishing-strategy/02-specification.md",
  old_string: `3. **Package Manager Support**
   - Option A: npm only
   - Option B: npm + yarn + pnpm
   - Recommendation: Option B`,
  new_string: `3. ~~**Package Manager Support**~~ (RESOLVED)
   **Answer:** Yes, all three equally (npm + yarn + pnpm)
   **Rationale:** Single publish to npm registry automatically supports all three package managers

   Original context preserved:
   - Option A: npm only
   - Option B: npm + yarn + pnpm
   - Recommendation: Option B`
})
```

---

## User Experience

### User Journey

**Entry Point:** User runs `/ideate-to-spec specs/my-feature/01-ideation.md`

**Flow:**

1. **Steps 1-5: Standard Workflow**
   - User sees familiar ideation → spec creation flow
   - Answers clarification questions from ideation (Step 2, text-based)
   - Spec is created via `/spec:create`

2. **Step 6: Initial Validation**
   - System runs `/spec:validate`
   - Output shows: "Spec is structurally complete but has 5 open questions"

3. **Step 6a-6b: Question Resolution Begins**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Resolving Open Questions
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   The specification has 5 open questions that need answers
   before proceeding to decomposition.

   Let's resolve them now...
   ```

4. **Interactive Question Answering:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Question 1 of 5
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Should we pin to specific ClaudeKit version or use caret range?

   Context: This affects automatic dependency updates. Pinning provides
   stability but requires manual updates. Caret range allows automatic
   updates but requires testing for compatibility.

   [User sees interactive options and selects: "Use caret range (^1.0.0)"]

   ✅ Answer recorded

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Question 2 of 5
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ...
   ```

5. **Step 6c: Real-Time Updates**
   - User doesn't see file operations, but spec is updated after each answer
   - Audit trail preserved in spec file (strikethrough format)

6. **Step 6d: Re-validation**
   ```
   All 5 questions answered. Re-validating specification...

   ✅ Validation passed!
   ✅ Spec ready for decomposition
   ```

7. **Step 7: Enhanced Summary**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Specification Complete
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Feature: package-publishing-strategy
   Location: specs/package-publishing-strategy/02-specification.md
   Status: READY FOR DECOMPOSITION ✅

   Resolved Questions:
   1. ClaudeKit Version → Use caret range
   2. Author Information → Kenneth Priester
   3. Package Manager Support → npm + yarn + pnpm
   4. ESM vs CommonJS → ESM
   5. NPM Organization → Personal account initially

   Next Steps:
   → Run: /spec:decompose specs/package-publishing-strategy/02-specification.md
   → Then: /spec:execute specs/package-publishing-strategy/02-specification.md
   ```

### User Interactions

**Interaction 1: Standard Question**
- User sees question with 2-4 clear options
- Selects one option
- Sees confirmation
- Moves to next question

**Interaction 2: Open-Ended Question**
- User sees question without predefined options
- Selects "Other" and provides free-form text
- Sees confirmation
- Moves to next question

**Interaction 3: Validation Failure (Non-Question Issue)**
```
⚠️ Validation found issues:
- Missing "Performance Considerations" section
- "Testing Strategy" section is incomplete

What would you like to do?
[A] Continue with question resolution (fix issues later)
[B] Stop and fix validation issues manually first
[C] Show me the validation details

User selects: [A]

✅ Continuing with question resolution...
```

**Interaction 4: Many Questions Warning**
```
Progress update: Resolved 15 questions so far, 8 remain.
This spec has many questions - consider if it should be split into
multiple smaller specs for easier implementation.

Continue resolving remaining questions? [Yes/No]
```

### Error Scenarios

**Scenario 1: Edit Tool Fails**
```
⚠️ Failed to update spec file (context mismatch)
This might indicate the spec was edited externally.

Re-reading spec and trying again...

[If second attempt fails:]
❌ Unable to update spec automatically.
Please manually add this answer to the spec:

Question 3: Package Manager Support
Answer: npm + yarn + pnpm

Would you like to:
[A] Continue with remaining questions (add this one manually later)
[B] Stop and fix the spec file first
```

**Scenario 2: Infinite Loop Detection**
```
⚠️ Validation still shows open questions after 10 iterations.

This might indicate:
- /spec:validate is not detecting resolved questions correctly
- Spec file has formatting issues
- Questions require manual intervention

Would you like to:
[A] Continue for 5 more iterations
[B] Stop and review the spec manually
[C] Show me which questions are still unresolved
```

---

## Testing Strategy

### Manual Testing Scenarios

Since the output is markdown documentation and the feature modifies command workflow, automated testing is not required. The following manual testing scenarios should be executed:

#### Test 1: Happy Path with Open Questions

**Setup:**
- Create ideation document with clarifications
- Run `/ideate-to-spec`

**Expected Behavior:**
1. Steps 1-5 complete normally
2. `/spec:validate` runs, detects open questions
3. System presents questions one at a time
4. User answers all questions
5. Spec file is updated with strikethrough format
6. Re-validation passes
7. Summary shows resolved questions list

**Success Criteria:**
- ✅ All questions presented interactively
- ✅ Answers recorded in spec with strikethrough
- ✅ Validation passes after resolution
- ✅ Summary includes resolved questions

#### Test 2: No Open Questions

**Setup:**
- Create spec without "Open Questions" section
- Run `/ideate-to-spec`

**Expected Behavior:**
1. Steps 1-6 complete normally
2. System detects no open questions
3. Steps 6a-6d are skipped
4. Proceed directly to Step 7

**Success Criteria:**
- ✅ No interactive prompts for questions
- ✅ Workflow completes without errors
- ✅ Summary doesn't mention resolved questions

#### Test 3: Partial Manual Resolution

**Setup:**
- Generate spec with 5 open questions
- Manually answer 2 questions in spec (add "Answer:" lines)
- Run `/ideate-to-spec`

**Expected Behavior:**
1. System detects 5 questions total
2. Skips 2 already-answered questions
3. Presents only 3 unanswered questions
4. Updates spec with 3 new answers

**Success Criteria:**
- ✅ Only unanswered questions presented
- ✅ Manual answers preserved
- ✅ New answers added in same format
- ✅ Summary shows all 5 questions (2 pre-existing, 3 new)

#### Test 4: Validation Loop (Multiple Iterations)

**Setup:**
- Create spec that generates complex questions
- Answer questions in a way that might trigger re-parsing

**Expected Behavior:**
1. First iteration: Answer 3 questions
2. Re-validate, 2 questions remain
3. Second iteration: Answer 2 questions
4. Re-validate, passes

**Success Criteria:**
- ✅ Multiple iterations handled correctly
- ✅ No duplicate questions presented
- ✅ Progress indication clear
- ✅ Final validation passes

#### Test 5: Malformed Questions

**Setup:**
- Create spec with questions that don't follow numbered format

**Expected Behavior:**
1. System attempts to parse
2. Falls back to treating section as single free-form question
3. User provides answer
4. Answer recorded

**Success Criteria:**
- ✅ No crash or error
- ✅ Graceful fallback to free-form
- ✅ Answer recorded (even if format differs)

#### Test 6: External Edit During Flow

**Setup:**
- Start question resolution
- After answering 2 questions, manually edit spec file externally
- Continue with remaining questions

**Expected Behavior:**
1. Next iteration re-parses spec
2. Detects external changes
3. Continues with remaining questions
4. Edit tool applies update successfully (or fails safely)

**Success Criteria:**
- ✅ External edits detected via re-parse
- ✅ No data corruption
- ✅ Edit failures handled gracefully
- ✅ User notified if intervention needed

#### Test 7: Validation Failure (Non-Question Reasons)

**Setup:**
- Create spec with missing required sections
- Run `/ideate-to-spec`

**Expected Behavior:**
1. Validation fails with structural issues
2. System prompts: "Continue or fix first?"
3. User chooses "Continue"
4. Question resolution proceeds
5. Validation warnings persist but don't block

**Success Criteria:**
- ✅ Interactive prompt presented
- ✅ User has choice to continue or stop
- ✅ Validation warnings shown but don't break flow
- ✅ Summary includes both warnings and resolved questions

#### Test 8: Many Questions (20+)

**Setup:**
- Create spec with 25 open questions

**Expected Behavior:**
1. System processes all questions (user chose "no limit")
2. Progress indication shows "Question N of 25"
3. All 25 questions answered
4. Spec updated 25 times
5. Validation passes

**Success Criteria:**
- ✅ All questions processed (no artificial limit)
- ✅ Clear progress indication throughout
- ✅ Performance acceptable (not too slow)
- ✅ Final spec has all answers

#### Test 9: Multi-Select Question

**Setup:**
- Create spec with question like "Which package managers to support?"

**Expected Behavior:**
1. System detects "which" keyword
2. Sets multiSelect: true
3. User can select multiple options
4. Answer shows comma-separated list

**Success Criteria:**
- ✅ Multi-select enabled automatically
- ✅ Multiple selections recorded correctly
- ✅ Answer format clear (e.g., "npm, yarn, pnpm")

#### Test 10: Free-Form Answer via "Other"

**Setup:**
- Question with predefined options
- User selects "Other" and provides custom text

**Expected Behavior:**
1. AskUserQuestion includes "Other" option
2. User selects "Other" and enters free-form text
3. Answer recorded as-is

**Success Criteria:**
- ✅ "Other" option always available
- ✅ Free-form text accepted
- ✅ Answer recorded without modification

### Test Documentation Template

For each test run:

```markdown
### Test: {Test Name}
**Date:** {Date}
**Tester:** {Name}
**Spec Used:** {Path to spec file}

**Steps:**
1. {Step 1}
2. {Step 2}
...

**Results:**
- ✅ {Expected behavior observed}
- ❌ {Issue found}

**Issues Found:**
- {Description of issue, if any}

**Pass/Fail:** {PASS or FAIL}
```

---

## Performance Considerations

### Expected Performance Characteristics

**File I/O:**
- Read spec file: 1-2 times per iteration (re-parse on loop)
- Edit spec file: Once per question answered
- For 5 questions: ~10-15 file operations total

**User Interaction Time:**
- Bottleneck is user reading and answering questions
- System overhead negligible compared to user time
- No performance optimization needed for file operations (specs are small, <500KB)

### Scalability

**Small Specs (1-5 questions):**
- Total time: 2-10 minutes (user-dependent)
- System overhead: <1 second
- Performance: Excellent

**Medium Specs (6-15 questions):**
- Total time: 10-30 minutes (user-dependent)
- System overhead: <3 seconds
- Performance: Good

**Large Specs (16+ questions):**
- Total time: 30+ minutes (user-dependent)
- System overhead: <10 seconds
- Performance: Acceptable
- **Recommendation:** If spec has >10 questions, suggest splitting into multiple specs

### Optimization Strategies

**Not Required:**
- No caching needed (specs change once per question)
- No parallelization possible (user answers sequentially)
- No indexing needed (linear search is fast for small docs)

**Future Consideration:**
- If Edit tool becomes slow (>1 second per edit), consider batching multiple edits
- Current approach (edit-as-you-go) prioritizes recoverability over speed

---

## Security Considerations

### No Security Risks

This feature operates entirely within the Claude Code environment and modifies only markdown documentation files. There are no security implications:

**No User Input Validation Required:**
- User answers are recorded as-is in markdown (no code execution)
- No SQL injection risk (no database)
- No XSS risk (markdown is rendered safely by viewers)
- No file path traversal (paths are hardcoded to specs/ directory)

**No External Communication:**
- No API calls
- No external services
- No network access
- All operations local to filesystem

**File System Safety:**
- Edit tool has built-in safety (old_string must match exactly)
- No file deletion
- No directory traversal outside specs/
- All paths validated by Claude Code runtime

### Data Privacy

**No Sensitive Data Handling:**
- User answers are business/technical decisions (not personal data)
- Spec files are documentation (expected to be committed to git)
- No credentials, tokens, or secrets involved

---

## Documentation

### Files to Update

#### 1. `.claude/commands/ideate-to-spec.md`

**Additions:**

Add new sections between Step 6 and Step 7:

```markdown
### Step 6a: Extract Open Questions from Spec

1. Read the generated specification file: `specs/{slug}/02-specification.md`
2. Use Grep to locate the "## Open Questions" section
3. Parse numbered questions using pattern: `^[0-9]+\. \*\*(.+?)\*\*`
4. For each question, extract:
   - Question number
   - Question text (from bold header)
   - Context (paragraphs following until next question/section)
   - Options (if format: "- Option A:", "- Option B:")
   - Recommendations (if format: "- Recommendation:")
5. Detect already-answered questions (search for "Answer:" keyword below question)
6. Build list of unanswered questions

**If no unanswered questions:** Skip to Step 7

**If unanswered questions found:** Proceed to Step 6b

### Step 6b: Interactive Question Resolution

For each unanswered question (in sequential order):

1. **Display Progress:**
   ```
   Question {N} of {Total}: {Question Text}
   ```

2. **Present Question with AskUserQuestion:**
   - question: {Question text from spec}
   - header: "Question {N}"
   - multiSelect: {auto-detect from question keywords}
   - options: {extracted from spec or generic Yes/No/Other}

3. **Auto-detect Multi-Select:**
   - If question text contains: "select all", "multiple", "which ones", "choose multiple"
   - Then: multiSelect = true
   - Else: multiSelect = false

4. **Construct Options:**
   - If spec has "Option A:", "Option B:" → Use those
   - Add descriptions from spec context
   - Mark recommended option if "Recommendation:" exists
   - Always include "Other" for free-form text

5. **Show Context:**
   - Display question + first 200 chars of context
   - If context > 200 chars: Add "(see full context in spec)"

6. **Record User's Answer:**
   - Store question number, question text, selected answer

### Step 6c: Update Spec with Answers

For each answered question:

1. **Construct Strikethrough Format:**
   ```
   {N}. ~~**{Question}**~~ (RESOLVED)
   **Answer:** {User's selection}
   **Rationale:** {Description from selected option}

   Original context preserved:
   {Original question context}
   ```

2. **Apply Edit:**
   - Use Edit tool to replace question block
   - old_string: {Original question block}
   - new_string: {Strikethrough format above}

3. **Handle Edit Failures:**
   - If Edit fails (context mismatch):
     - Re-read spec file
     - Re-parse question
     - Retry once
   - If second failure:
     - Prompt user: "Unable to update automatically. Please add manually: {answer}"
     - Ask: Continue or stop?

4. **Save Progress:**
   - Answers saved immediately (one Edit per question)
   - Enables recovery if user needs to pause

### Step 6d: Re-validate and Loop Control

1. **Execute `/spec:validate`:**
   ```
   /spec:validate specs/{slug}/02-specification.md
   ```

2. **Analyze Validation Output:**
   - Check for "Open Questions" mentions
   - Extract completeness score
   - Identify any validation errors/warnings

3. **Decision Logic:**

   **If validation indicates remaining open questions:**
   - Loop back to Step 6a (re-parse questions)

   **Else if validation passes (or only warnings):**
   - Proceed to Step 7

   **Else if validation fails for non-question reasons:**
   - Use AskUserQuestion to prompt:
     ```
     Validation found issues: {list issues}
     What would you like to do?

     [A] Continue with question resolution (fix issues later)
     [B] Stop and fix validation issues manually first
     [C] Show me the validation details
     ```
   - Based on user choice: Continue, stop, or show details

4. **Loop Safety:**
   - No iteration limit (user preference)
   - Optional: Warn at 10+ iterations: "Resolved {N} questions, {M} remain. Continue?"

5. **External Edit Detection:**
   - Re-parse spec file on each iteration
   - Gracefully handle manual edits between questions

6. **Exit Conditions:**
   - All questions answered AND validation passes → Step 7
   - User manually requests stop → Step 7 with warnings
   - Repeated Edit failures → Prompt for manual intervention
```

**Update Step 7:**

```markdown
### Step 7: Present Summary & Next Steps

Create a comprehensive summary for the user:

```markdown
## Specification Summary

**Feature Slug:** {slug}
**Spec Location:** specs/{slug}/02-specification.md
**Validation Status:** {READY FOR DECOMPOSITION or NEEDS WORK}
**Completeness Score:** {score}/10
**Open Questions Resolved:** {count} {only if > 0}

### What Was Specified

1. {Key feature/fix described}
2. {Technical approach chosen}
3. {Implementation scope}

### Decisions Made (Step 2: Ideation Clarifications)

{List all decisions from Step 2 with user's choices}

### Resolved Questions (Step 6b: Spec Open Questions) {only if any resolved}

{List resolved questions with brief answers}

1. {Question 1 text} → {User's answer}
2. {Question 2 text} → {User's answer}
...

### Validation Results

{Summary of /spec:validate output}

### Remaining Decisions (if any)

{List any open questions that still need manual resolution}
- [ ] {Decision 1}
- [ ] {Decision 2}

### Recommended Next Steps

1. [ ] Review the specification at specs/{slug}/02-specification.md
2. [ ] {If validation failed: Address validation feedback}
3. [ ] {If validation passed: Run /spec:decompose specs/{slug}/02-specification.md}
4. [ ] {Then implement with: /spec:execute specs/{slug}/02-specification.md}
5. [ ] {Track progress with: stm list --pretty --tag feature:{slug}}
6. [ ] {Any follow-up specs needed}

### Deferred Work

{Any items explicitly deferred during ideation or spec creation}
```
```

#### 2. `CLAUDE.md`

**Updates:**

```markdown
## Core Workflow

Complete feature lifecycle in 6 phases:

### Phase 2: Specification
- **Command:** `/ideate-to-spec <path-to-ideation>`
- **Output:** `specs/<slug>/02-specification.md`
- **Purpose:** Transform ideation into validated technical specification
- **Process:** Extract decisions → build spec → **resolve open questions** → validate completeness
- **NEW:** Interactive question resolution ensures specs are implementation-ready
```

**Add to "Workflow Instructions" section:**

```markdown
### Interactive Question Resolution

After spec creation, the system automatically:
1. Detects open questions in specification
2. Presents each question interactively with context
3. Records answers with audit trail (strikethrough format)
4. Re-validates until all questions resolved
5. Prevents decomposition until spec is complete
```

#### 3. `README.md`

**Add Example:**

```markdown
### Standard Workflow with Question Resolution

```bash
# 1. Ideate
/ideate <task-brief>

# 2. Create spec (now with interactive question resolution)
/ideate-to-spec specs/<slug>/01-ideation.md
# → System detects 5 open questions
# → Presents questions interactively
# → Updates spec with answers
# → Re-validates until complete

# 3. Decompose (spec is now guaranteed to be complete)
/spec:decompose specs/<slug>/02-specification.md

# 4. Execute
/spec:execute specs/<slug>/02-specification.md
```
```

#### 4. `.claude/README.md`

**Add Command Documentation:**

```markdown
### `/ideate-to-spec`

Transform ideation document into validated specification with interactive question resolution.

**Features:**
- Extracts decisions from ideation clarifications
- Builds detailed spec via `/spec:create`
- **NEW:** Automatically resolves open questions interactively
- Validates completeness via `/spec:validate`
- Loops until all questions answered
- Preserves audit trail in spec file

**Usage:**
```bash
/ideate-to-spec specs/<slug>/01-ideation.md
```

**Interactive Steps:**
1. Answer ideation clarifications (text-based)
2. System creates specification
3. **System detects open questions**
4. **Answer each question interactively (with context)**
5. **Spec updated with strikethrough format**
6. **Re-validation confirms completeness**
7. Summary shows resolved questions
```

---

## Implementation Phases

### Phase 1: Core Question Resolution (MVP)

**Goal:** Enable interactive resolution of open questions within `/ideate-to-spec` workflow

**Deliverables:**

1. **Question Parsing (Step 6a)**
   - Implement "Open Questions" section detection via Grep
   - Parse numbered questions with context extraction
   - Detect already-answered questions (skip if "Answer:" exists)
   - Handle edge case: No questions → skip to Step 7

2. **Interactive Resolution (Step 6b)**
   - Implement AskUserQuestion integration
   - One question at a time presentation
   - Progress indication ("Question N of Total")
   - Context display (question + 200 char context)
   - Options construction from spec or generic fallback
   - Multi-select auto-detection (keywords: "select all", "multiple")
   - Record answers in structured format

3. **Spec Updates (Step 6c)**
   - Implement strikethrough answer format
   - Edit tool integration for atomic updates
   - Error handling for Edit failures (re-read, retry)
   - Save-as-you-go for recoverability

4. **Validation Loop (Step 6d)**
   - Re-run `/spec:validate` after answering
   - Parse validation output for remaining questions
   - Loop back to Step 6a if questions remain
   - Interactive prompt for non-question validation failures
   - No iteration limit (user preference)
   - Re-parse spec each iteration (handle external edits)

5. **Summary Enhancement (Step 7)**
   - Add "Resolved Questions" section
   - List question number + answer summary
   - Update "Recommended Next Steps" based on completeness

6. **Documentation**
   - Update `.claude/commands/ideate-to-spec.md` with Steps 6a-6d
   - Update `CLAUDE.md` workflow description
   - Update `README.md` with example

**Acceptance Criteria:**
- ✅ Specs with open questions trigger interactive resolution
- ✅ Questions presented one at a time with context
- ✅ Answers recorded in strikethrough format
- ✅ Validation loop continues until complete
- ✅ Specs with no questions skip Steps 6a-6d (backward compatible)
- ✅ Already-answered questions skipped (re-entrant)
- ✅ Manual edits handled gracefully (re-parse)
- ✅ Validation failures prompt interactively (don't break flow)
- ✅ Summary includes resolved questions list

**Testing:**
- Manual testing of all 10 scenarios (happy path, no questions, partial resolution, etc.)
- Verify strikethrough format in updated specs
- Confirm backward compatibility (specs without questions)

**Timeline:** Single implementation phase (no phased rollout needed)

---

## Open Questions

### ~~**1. Should Step 2 Also Use AskUserQuestion?**~~ (RESOLVED)

**Answer:** No (out of scope for this spec)

**Rationale:** Current Step 2 uses text-based interaction pattern and works well. Changing it to AskUserQuestion would be a separate enhancement. This spec focuses only on Step 6 question resolution. Keep Step 2 as-is for consistency with existing workflow.

**Future Consideration:** Could create follow-up spec to standardize all interactive prompting to use AskUserQuestion, but that would be a broader refactor.

---

### ~~**2. Should We Support Question Templates?**~~ (RESOLVED)

**Answer:** No (deferred to future enhancement)

**Rationale:** User explicitly marked "Future enhancements" as out of scope. Question templates, AI-suggested answers, multi-spec propagation, and analytics are all valuable but not required for MVP. Focus on core resolution flow first.

**Future Enhancement:** Section 15 of ideation document outlines 5 potential enhancements for later consideration.

---

### ~~**3. How to Handle Circular Question Dependencies?**~~ (RESOLVED)

**Answer:** No dependency detection (sequential order only)

**Rationale:** User chose "No dependency detection (recommended)" in clarifications. Questions are presented in order as they appear in spec. If Question 3 depends on Question 1, user can manually reference their prior answer. Keeps implementation simple.

**Edge Case:** If questions are truly circular (A depends on B, B depends on A), user will resolve manually outside the flow or restructure questions.

---

### ~~**4. Should We Limit Questions Per Spec?**~~ (RESOLVED)

**Answer:** No limit (user chose "Process all questions regardless")

**Rationale:** User explicitly selected "Process all questions regardless of count". System will handle 1-100+ questions without artificial limits. Performance is acceptable (specs are small files).

**Recommendation to Users:** If spec generation produces >10 questions, consider if it should be split into multiple smaller specs. But system won't enforce this.

---

## References

### Related Documentation

- **Ideation Document:** specs/spec-open-questions-workflow/01-ideation.md
- **Current Command:** .claude/commands/ideate-to-spec.md (lines 1-237)
- **Spec Creation:** .claude/commands/spec/create.md
- **Feedback Command:** .claude/commands/spec/feedback.md (AskUserQuestion usage examples)
- **ClaudeKit Validation:** `/spec:validate` command (external)

### Example Specifications

- **package-publishing-strategy:** specs/package-publishing-strategy/02-specification.md (12 open questions, lines 1617-1694)
- **add-feedback-workflow-command:** specs/add-feedback-workflow-command/02-specification.md (Section 13, Open Questions)

### Tool Documentation

- **AskUserQuestion:** Claude Code built-in tool for interactive prompting
- **Read:** File reading tool
- **Edit:** Atomic file editing with old_string/new_string pattern
- **Grep:** Pattern search tool for markdown sections
- **SlashCommand:** Execute other commands (/spec:validate)

### Design Patterns

- **Strikethrough Format:** Preserves audit trail while marking questions as resolved
- **Edit-in-Place:** Save progress incrementally for recoverability
- **Re-parse on Loop:** Handle external manual edits gracefully
- **Interactive Fallback:** Prompt user when automated resolution fails

### Related Issues

- None (initial specification)

---

## Changelog

### Specification Changes

**2025-11-21 - Initial Draft**
- Created comprehensive specification based on ideation document
- Incorporated all 10 user decision points from clarifications
- Defined iterative loop architecture (Steps 6a-6d)
- Detailed question parsing, interactive resolution, spec update, and validation loop
- Specified strikethrough answer format with audit trail
- Outlined 10 manual testing scenarios
- Marked future enhancements as out of scope
- Resolved all 4 open questions

**Next Steps:**
1. Review specification for completeness
2. Validate with /spec:validate command
3. Address any validation feedback
4. Proceed to decomposition when ready
