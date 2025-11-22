---
description: Transform ideation document into validated specification
allowed-tools: Read, Grep, Glob, Write, SlashCommand(/spec:create:*), SlashCommand(/spec:validate:*)
argument-hint: "<path-to-ideation-doc>"
category: workflow
---

# Ideate → Spec Workflow

**Ideation Document:** $ARGUMENTS

---

## Workflow Instructions

This command bridges the gap between ideation and implementation by transforming an ideation document into a validated, implementation-ready specification. Follow each step sequentially.

### Step 1: Extract Slug & Read Ideation Document

1. **Extract feature slug from the ideation path:**
   - Input format: `specs/<slug>/01-ideation.md`
   - Extract: `<slug>`
   - Store for use in subsequent steps (e.g., for spec output path)
   - Example: `specs/fix-chat-scroll-bug/01-ideation.md` → slug is `fix-chat-scroll-bug`

2. Read the ideation document at the provided path
3. Extract and synthesize:
   - **Intent & Assumptions** (Section 1) - What we're building and why
   - **Codebase Map** (Section 3) - Components/modules that will be affected
   - **Root Cause Analysis** (Section 4, if present) - Bug context
   - **Research Findings** (Section 5) - Recommended approach and alternatives
   - **Clarifications** (Section 6) - Open questions from ideation

### Step 2: Interactive Decision Gathering

Review the clarifications from Section 6 of the ideation document. For each clarification:

1. **Present the decision point clearly** to the user with:
   - Context from the ideation research
   - Recommended option (if any) from Section 5
   - Pros/cons of alternatives (if applicable)
   - Impact on implementation complexity/scope

2. **Ask the user to decide** with specific options when possible:
   - Multiple choice format for clear alternatives
   - Open-ended questions for creative/architectural decisions
   - Default recommendations to speed up decision-making

3. **Record decisions** in a structured format:
   ```
   Decision {N}: {Question}
   User choice: {Answer}
   Rationale: {Why this matters for the spec}
   ```

**Example interaction format:**
```
Decision 1: Image proxy URL construction
From research: We can either construct proxy URLs in the plugin OR in banner-data.json

Options:
  A) Plugin constructs URLs (recommended) - More flexible, handles edge cases
  B) Pre-construct in banner-data.json - Simpler, but less dynamic

Which approach do you prefer? [A/B or your own approach]
```

### Step 3: Identify Additional Specifications Needed

Based on the ideation document and user decisions:

1. **Determine specification scope:**
   - Is this a single feature/fix or does it need multiple specs?
   - Are there prerequisite changes needed first?
   - Should any parts be deferred to follow-up work?

2. **Ask the user:**
   - "Should I create one comprehensive spec or break this into multiple smaller specs?"
   - "Are there any parts of the ideation that should be out-of-scope for the initial spec?"

3. **Record the specification plan:**
   ```
   Primary spec: {description}
   Additional specs (if any): {list}
   Deferred work: {list}
   ```

### Step 4: Build Spec Creation Prompt

Construct a rich, detailed prompt for `/spec:create` that includes:

1. **Task description** (from ideation Intent + user decisions):
   - Clear, imperative statement of what to build/fix
   - Include "why" context from ideation research
   - Reference the recommended approach from Section 5

2. **Technical context** (from Codebase Map):
   - Files/components that will be modified (with paths)
   - Data flow and dependencies
   - Potential blast radius

3. **Implementation constraints** (from decisions + ideation):
   - User decisions made in Step 2
   - Architectural choices from research
   - Out-of-scope items

4. **Acceptance criteria** (inferred from ideation):
   - User-visible outcomes
   - Technical requirements
   - Non-regression requirements

**Example constructed prompt:**
```
Add proxy config integration to Figma plugin. The plugin should read a config.proxyBaseUrl
field from banner-data.json and automatically construct proxy URLs for image_url mappings
that point to TradeBlock domains (media.tradeblock.us, media.tradeblock.io).

Technical context:
- Modified file: json-filler-plugin/code.js lines 81-126 (image fetching logic)
- Data flow: banner-data.json → plugin reads config → constructs proxy URL → fetches image
- Must maintain backward compatibility with existing pipelines

User decisions:
- URL construction happens in plugin (not pre-constructed in JSON)
- Only proxy TradeBlock domains (media.tradeblock.us, media.tradeblock.io)
- Fallback to original URL if proxy fails

Acceptance criteria:
- Works with or without config.proxyBaseUrl (backward compatible)
- Only proxies whitelisted TradeBlock domains
- Gracefully falls back on proxy errors
- No changes needed to existing banner-data.json files
```

### Step 5: Execute Spec Creation

1. **Inform the user:**
   ```
   Creating specification with the following scope:
   - {Primary task description}
   - {Key technical constraints}
   - {Main acceptance criteria}

   Output path: specs/{slug}/02-specification.md
   Proceeding with /spec:create...
   ```

2. **Execute `/spec:create`** with the constructed prompt from Step 4, appending:
   ```

   IMPORTANT: Save this specification to: specs/{slug}/02-specification.md
   ```

   This explicit instruction tells spec:create exactly where to write the file.

3. **Verify the spec file was created at:** `specs/{slug}/02-specification.md`

### Step 6: Validate the Specification

1. **Execute `/spec:validate specs/{slug}/02-specification.md`**

2. **Capture validation results:**
   - Completeness score
   - Missing elements (if any)
   - Validation warnings or recommendations
   - Implementation readiness assessment

### Step 6a: Extract Open Questions from Spec

If no unanswered questions exist, skip directly to Step 7.

#### 6a.1: Detect and Parse Questions

1. **Use Grep to check for open questions:**
   ```bash
   grep -E "^[0-9]+\. \*\*" specs/{slug}/02-specification.md
   ```

2. **Decision logic:**
   - No matches → Skip to Step 7 (backward compatible)
   - Matches found → Extract question number, question text, and full context

3. **For each question, read context:**
   - Extract all lines from question header to next question or section
   - Context includes: descriptions, options, recommendations, notes

4. **Filter unanswered questions:**
   - Search context for keyword "Answer:"
   - If "Answer:" found → Skip (already answered)
   - If NOT found → Add to unanswered list

**Question Format Example:**
```markdown
1. **ClaudeKit Version Compatibility**
   - Option A: Pin exact version (e.g., "1.2.3")
   - Option B: Use caret range (e.g., "^1.0.0")
   - Recommendation: Option B

3. ~~**ESM vs CommonJS**~~ (RESOLVED)
   **Answer:** Use ESM (import/export) for modern Node.js 18+ compatibility
```

#### 6a.2: Construct Question Metadata

For each unanswered question, build structured data:

1. **Detect multi-select:** Search question text for keywords: "select all", "multiple", "which ones", "choose multiple"

2. **Extract options from spec:**
   - Parse lines starting with "- Option"
   - Format: `Option A: Description`
   - Mark recommended option (search for "- Recommendation:")

3. **Build options array:**
   ```javascript
   options = [
     { label: "Option A: Description", description: "" },
     { label: "Option B: Description - Recommended", description: "" },
     { label: "Other (custom answer)", description: "Provide your own answer" }
   ]
   ```

4. **Store question object:**
   ```javascript
   {
     questionNumber: "1",
     questionText: "ClaudeKit Version Compatibility",
     context: "...",
     options: [...],
     multiSelect: false
   }
   ```

**Edge Cases:**
- No options in spec → Provide generic fallback: [Yes, No, Other]
- Empty question list → Skip to Step 7

### Step 6b: Interactive Question Resolution

For each unanswered question:

#### 6b.1: Display Progress and Context

Show progress indicator before each question:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Question {current} of {total}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Question text}
```

Display context (truncate if > 200 chars):
```
Context: {question.context or truncated version}
```

#### 6b.2: Use AskUserQuestion Tool

Call the tool with structured question data:

```javascript
AskUserQuestion({
  questions: [{
    question: "{questionText}",
    header: "Question {questionNumber}",
    multiSelect: {true/false},
    options: [
      { label: "Option A: Description", description: "" },
      { label: "Option B: Description - Recommended", description: "" },
      { label: "Other (custom answer)", description: "" }
    ]
  }]
})
```

**Multi-select example:**
```javascript
multiSelect: true  // User can select multiple options
```

#### 6b.3: Record Answers

Store each answer in `recordedAnswers` array:

**Single-select format:**
```javascript
{
  questionNumber: "1",
  questionText: "ClaudeKit Version Compatibility",
  selectedOption: "Option B: Use caret range - Recommended",
  isMultiSelect: false
}
```

**Multi-select format:**
```javascript
{
  questionNumber: "5",
  questionText: "Authentication Methods",
  selectedOptions: ["API key", "OAuth 2.0", "JWT"],
  isMultiSelect: true
}
```

### Step 6c: Update Spec with Answers

Process each answer sequentially with save-as-you-go approach.

#### 6c.1: Build Strikethrough Format

For each answer, construct replacement text:

```markdown
{questionNumber}. ~~**{questionText}**~~ (RESOLVED)
   **Answer:** {user's answer}
   **Rationale:** {description}

   Original context preserved:
{original question context}
```

**Example transformation:**

**Before:**
```markdown
3. **Package Manager Support**
   - Option A: npm only
   - Option B: npm + yarn + pnpm
   - Recommendation: Option B
```

**After:**
```markdown
3. ~~**Package Manager Support**~~ (RESOLVED)
   **Answer:** npm + yarn + pnpm
   **Rationale:** Single publish supports all three

   Original context preserved:
   - Option A: npm only
   - Option B: npm + yarn + pnpm
   - Recommendation: Option B
```

#### 6c.2: Apply Edit Tool

For each answer (one at a time):

1. **Read spec fresh:**
   ```javascript
   const specContent = await Read(`specs/${slug}/02-specification.md`);
   ```

2. **Extract original question block** (exact match required)

3. **Use Edit tool:**
   ```javascript
   Edit({
     file_path: `specs/${slug}/02-specification.md`,
     old_string: "{exact original block}",
     new_string: "{strikethrough format from 6c.1}"
   })
   ```

4. **Display progress:**
   ```
   ✅ Updated question 1: ClaudeKit Version Compatibility
   ✅ Updated question 3: Package Manager Support
   ```

#### 6c.3: Handle Edit Failures

**Simple retry logic:**

1. **First failure:** Re-read spec and retry
2. **Second failure:** Ask user to continue or stop

**User prompt on failure:**
```
⚠️ Unable to Update Spec Automatically

Failed to update question {N}: {text}

How would you like to proceed?
[A] Continue with remaining questions (I'll add manually)
[B] Stop and fix the spec file first
```

#### 6c.4: Save-As-You-Go Benefits

**Why save after each answer:**
- Recovery if interrupted
- Resume capability (re-run detects "(RESOLVED)" marker)
- Progress visibility
- Error isolation

**Recovery example:**
```
Run 1: Answers questions 1, 2, 3 → Saved → Interrupted
Run 2: Detects 1-3 resolved → Presents only 4, 5, 6 → Complete
```

### Step 6d: Re-validate and Loop Control

After updating answers, determine whether to loop or proceed to Step 7.

#### 6d.1: Execute Re-validation

Run validation on updated spec:
```javascript
const validationOutput = await SlashCommand(`/spec:validate specs/${slug}/02-specification.md`);
```

Display output to user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Re-validating specification...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{validation output}
```

#### 6d.2: Parse Validation Results

Extract key decision data:

- **Check for remaining questions:** Look for "open questions" in output
- **Extract completeness score:** Pattern: "Completeness Score: N/10"
- **Detect structural issues:** Look for "Missing" or "incomplete" (not about questions)

**Example parsing results:**

```javascript
// All complete
{ questionsRemaining: false, completenessScore: 10, hasStructuralIssues: false }

// Questions remain
{ questionsRemaining: true, completenessScore: 9, hasStructuralIssues: false }

// Structural issues
{ questionsRemaining: false, completenessScore: 7, hasStructuralIssues: true }
```

#### 6d.3: Loop Control Decision

**Decision logic:**

- **Questions remain, no structural issues** → Loop to Step 6a
- **All questions answered, no issues** → Proceed to Step 7 (success)
- **Structural issues detected** → Prompt user:
  ```
  How would you like to proceed?
  [A] Continue resolving questions (fix structural issues later)
  [B] Stop and fix validation issues manually first
  ```

**High iteration warning (≥10 iterations):**
```
⚠️ Many Iterations Detected

You've completed {N} iterations resolving {M} questions.

This might indicate complex specification or formatting issues.

Continue resolving questions?
[A] Yes, continue - Recommended
[B] No, stop and review manually
```

#### 6d.4: Fresh Re-read on Each Loop

**Critical:** Always re-read spec on each iteration:

```javascript
// ✅ CORRECT: Fresh read each loop
while (true) {
  const specContent = await Read(`specs/${slug}/02-specification.md`);
  const unansweredQuestions = parseQuestions(specContent);
  // ...
}

// ❌ WRONG: Cached questions
const allQuestions = parseQuestions(spec);
while (true) { /* use cached */ }
```

**Why:** Detects external edits, prevents duplicate prompts

**Example:**
```
Iteration 1: Questions [1,2,3,4,5]
User manually edits spec to answer question 3
Iteration 2: Fresh read detects [2,4,5] (3 has "Answer:")
✅ No duplicate prompt for question 3
```

#### 6d.5: Loop Exit Conditions

Loop exits when:
- All questions answered + no structural issues → Step 7
- User chooses to stop (structural issues) → Exit with resume instructions
- User chooses to stop (high iterations) → Exit with progress summary
- User chooses to proceed with issues → Step 7

**Loop flow diagram:**
```
Validate → Parse → Questions remain?
           ├─ YES + no issues → Loop to 6a
           ├─ NO + no issues → Step 7
           └─ YES/NO + issues → Prompt user → Continue/Stop
```

### Step 7: Present Summary & Next Steps

Create a comprehensive summary for the user that reflects the specification's final state after all questions have been resolved.

#### 7.1: Build Summary Header

Construct the summary header with current specification status:

```markdown
## Specification Summary

**Feature Slug:** {slug}
**Spec Location:** specs/{slug}/02-specification.md
**Validation Status:** {READY FOR DECOMPOSITION ✅ or NEEDS WORK ⚠️}
**Completeness Score:** {score}/10
**Open Questions Resolved:** {count} {only if count > 0}
```

**Status Determination:**
- **READY FOR DECOMPOSITION ✅** - Completeness score 10/10, all questions answered
- **NEEDS WORK ⚠️** - Completeness score < 10/10 or structural issues remain

**Question Count:**
- Calculate total questions resolved across all iterations (from Step 6b recorded answers)
- Only display this line if count > 0 (backward compatible with specs that had no questions)

#### 7.2: Summarize Specification Content

```markdown
### What Was Specified

1. {Key feature/fix described}
2. {Technical approach chosen}
3. {Implementation scope}
```

Extract from the specification file:
- Read the "## Overview" section for feature description
- Read the "## Technical Design" section for approach
- Read the "## Implementation Phases" section for scope

#### 7.3: List Decisions Made (Step 2)

```markdown
### Decisions Made (Step 2: Ideation Clarifications)

{List all decisions from Step 2 with user's choices}
```

Include all decisions recorded during Step 2 (ideation clarifications) in this format:
```
1. {Decision question} → {User's answer}
2. {Decision question} → {User's answer}
```

#### 7.4: List Resolved Questions (Step 6b)

**Only include this section if questions were resolved in Step 6b (backward compatible):**

```markdown
### Resolved Questions (Step 6b: Spec Open Questions)

{If totalQuestionsResolved > 0, display all resolved questions}
```

**Display Format:**
```
1. {Question text} → {User's answer}
2. {Question text} → {User's answer}
3. {Question text} → {User's answer}
```

**Data Source:**
- Use the `recordedAnswers` array from Step 6b
- Extract `questionNumber`, `questionText`, and answer (from `selectedOption` or `selectedOptions`)
- Format answers:
  - **Single-select:** Display the selected option text (without "Option A:" prefix if present)
  - **Multi-select:** Join selected options with ", " separator
  - **Custom answers:** Display the user's free-form text

**Example Output:**
```markdown
### Resolved Questions (Step 6b: Spec Open Questions)

1. ClaudeKit Version Compatibility → Use caret range (^1.0.0)
2. Author Information → Kenneth Priester <kenneth@example.com>
3. ESM vs CommonJS → ESM (modern Node.js 18+)
4. Package Manager Support → npm, yarn, pnpm (all three)
5. NPM Organization → Personal account initially
```

**Conditional Logic:**
```javascript
// Only show section if questions were resolved
if (typeof totalQuestionsResolved !== 'undefined' && totalQuestionsResolved > 0) {
  console.log("### Resolved Questions (Step 6b: Spec Open Questions)\n");

  for (const answer of recordedAnswers) {
    const answerText = answer.isMultiSelect
      ? answer.selectedOptions.join(", ")
      : answer.selectedOption;

    console.log(`${answer.questionNumber}. ${answer.questionText} → ${answerText}`);
  }

  console.log();  // Blank line after section
}
```

#### 7.5: Display Validation Results

```markdown
### Validation Results

{Summary of /spec:validate output}
```

Include:
- Overall validation status (✅ PASSED or ⚠️ NEEDS WORK)
- List of complete sections
- List of incomplete sections (if any)
- List of missing sections (if any)
- Specific validation warnings or recommendations

#### 7.6: List Remaining Decisions

**Only include this section if there are still unanswered questions or deferred items:**

```markdown
### Remaining Decisions (if any)

{List any decisions that still need to be made before implementation}
- [ ] {Decision 1}
- [ ] {Decision 2}
```

If no remaining decisions:
```markdown
### Remaining Decisions

✅ All decisions have been made - specification is ready for decomposition!
```

#### 7.7: Provide Recommended Next Steps

```markdown
### Recommended Next Steps

1. [ ] Review the specification at specs/{slug}/02-specification.md
2. [ ] {If validation failed: Address validation feedback}
3. [ ] {If validation passed: Run /spec:decompose specs/{slug}/02-specification.md}
4. [ ] {Then implement with: /spec:execute specs/{slug}/02-specification.md}
5. [ ] {Track progress with: stm list --pretty --tag feature:{slug}}
6. [ ] {Any follow-up specs needed}
```

**Customize based on validation status:**

**If READY FOR DECOMPOSITION:**
```markdown
### Recommended Next Steps

1. [ ] Review the specification at specs/{slug}/02-specification.md
2. [ ] Run /spec:decompose specs/{slug}/02-specification.md
3. [ ] Implement with: /spec:execute specs/{slug}/02-specification.md
4. [ ] Track progress with: stm list --pretty --tag feature:{slug}
```

**If NEEDS WORK:**
```markdown
### Recommended Next Steps

1. [ ] Review the specification at specs/{slug}/02-specification.md
2. [ ] Address remaining validation issues:
   - {List specific issues from validation}
3. [ ] Re-run /spec:validate specs/{slug}/02-specification.md
4. [ ] Once validation passes, proceed with /spec:decompose
```

#### 7.8: List Deferred Work

```markdown
### Deferred Work

{Any items explicitly deferred during ideation or spec creation}
```

Include:
- Items from Step 3 (specification plan) marked as "Deferred"
- Follow-up specs identified during the process
- Out-of-scope items that may be addressed later

**Complete Step 7 Summary Template:**

```markdown
## Specification Summary

**Feature Slug:** {slug}
**Spec Location:** specs/{slug}/02-specification.md
**Validation Status:** {READY FOR DECOMPOSITION ✅ or NEEDS WORK ⚠️}
**Completeness Score:** {score}/10
**Open Questions Resolved:** {count} {only if count > 0}

### What Was Specified

1. {Key feature/fix described from Overview section}
2. {Technical approach chosen from Technical Design section}
3. {Implementation scope from Implementation Phases section}

### Decisions Made (Step 2: Ideation Clarifications)

1. {Decision question} → {User's answer}
2. {Decision question} → {User's answer}
{... all Step 2 decisions}

### Resolved Questions (Step 6b: Spec Open Questions) {only if totalQuestionsResolved > 0}

1. {Question text} → {User's answer}
2. {Question text} → {User's answer}
{... all Step 6b resolved questions}

### Validation Results

{Summary of /spec:validate output}
- ✅ {Completed sections}
- ⚠️ {Incomplete sections}
- ❌ {Missing sections}

### Remaining Decisions

{If none: "✅ All decisions have been made - specification is ready for decomposition!"}
{If some: List of remaining decisions with checkboxes}

### Recommended Next Steps

{Customized based on validation status - see 7.7 above}

### Deferred Work

{Items explicitly deferred during ideation or spec creation}
{If none: "No work was deferred."}
```

---

## Example Usage

```bash
/ideate-to-spec specs/add-proxy-config-to-figma-plugin/01-ideation.md
```

This will:
1. Read your ideation document
2. Walk you through clarification decisions
3. Create a detailed specification using `/spec:create`
4. Validate it with `/spec:validate`
5. Present a summary with next steps

---

## Notes

- **Interactive by design:** This command MUST pause and ask the user for decisions
- **Context preservation:** All ideation research carries forward into the spec
- **Validation feedback loop:** If validation fails, summarize what needs fixing
- **Traceability:** Link spec back to ideation document for context

---

## Changelog

### 2025-11-22 - Interactive Question Resolution

**Added Steps 6a-6d:** Enhanced `/ideate-to-spec` with automatic open questions resolution workflow.

**New Features:**
- **Step 6a:** Extract and parse open questions from generated specifications
- **Step 6b:** Present questions interactively with progress indicators and multi-select support
- **Step 6c:** Update spec file with answers in strikethrough format (audit trail preservation)
- **Step 6d:** Re-validate and loop until all questions resolved

**Benefits:**
- Ensures all specifications are implementation-ready before decomposition
- Prevents incomplete specs from blocking development
- Maintains audit trail of all question resolution decisions
- Backward compatible (skips if no questions present)
- Re-entrant (skips already-answered questions on re-run)

**Integration:**
- Seamlessly integrated between Step 6 (validation) and Step 7 (summary)
- Automatically loops back for multi-iteration question resolution
- Handles edge cases (malformed questions, external edits, validation failures)
- Progress tracking with iteration count and question resolution statistics
