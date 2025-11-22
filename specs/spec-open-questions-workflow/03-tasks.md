# Task Breakdown: Interactive Open Questions Resolution for /ideate-to-spec

**Generated:** 2025-11-22
**Source:** specs/spec-open-questions-workflow/02-specification.md
**Feature Slug:** spec-open-questions-workflow
**Last Decompose:** 2025-11-22

---

## Overview

This task breakdown implements interactive open question resolution for the `/ideate-to-spec` workflow. The feature enhances the existing 7-step workflow by adding 4 sub-steps (6a-6d) between validation and summary presentation.

**Key Capabilities:**
- Automatic detection of "Open Questions" sections in generated specifications
- Interactive question-by-question resolution using AskUserQuestion tool
- Real-time spec file updates with strikethrough audit trail format
- Re-validation loop until all questions are resolved
- Backward compatible (skips for specs without questions)
- Re-entrant (detects already-answered questions)

**Implementation Scope:**
- Single file modification: `.claude/commands/ideate-to-spec.md`
- No external dependencies (uses built-in Claude Code tools)
- Documentation updates to CLAUDE.md, README.md, .claude/README.md

---

## Phase 1: Foundation & Parsing

### Task 1.1: Implement Question Section Detection

**Description:** Build logic to detect presence of "Open Questions" section in specification files
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.2

**Technical Requirements:**
- Use Grep tool to locate "## Open Questions" section
- Handle edge cases: No section, empty section, malformed questions
- Return boolean indicating if section exists and has content

**Implementation Steps:**

1. Add Step 6a detection logic to `.claude/commands/ideate-to-spec.md` after Step 6 validation
2. Use Grep pattern to find section header
3. Implement edge case detection:
   - No "## Open Questions" header → Skip Steps 6a-6d
   - Empty section (header exists but no content) → Skip Steps 6a-6d
   - Section exists with numbered questions → Proceed to parsing

**Grep Pattern:**
```bash
# Detect "Open Questions" section
grep -n "## Open Questions" specs/{slug}/02-specification.md

# If found, check if it has content (numbered questions)
grep -E "^[0-9]+\. \*\*" specs/{slug}/02-specification.md
```

**Decision Logic:**
```
If "## Open Questions" NOT found:
  → Skip to Step 7 (backward compatible)

If "## Open Questions" found but no numbered questions:
  → Skip to Step 7

If numbered questions found:
  → Proceed to Task 1.2 (question parsing)
```

**Acceptance Criteria:**
- [ ] Detects "## Open Questions" section presence
- [ ] Distinguishes between empty and populated sections
- [ ] Returns correct skip/proceed decision
- [ ] Handles specs without section (backward compatible)
- [ ] Tests: Verify with 3 spec types (no section, empty section, with questions)

---

### Task 1.2: Implement Question Parsing Logic

**Description:** Parse numbered questions from "Open Questions" section, extracting question number, text, context, options, and recommendations
**Size:** Large
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** None (depends on 1.1 detection)

**Technical Requirements:**
- Parse numbered questions using pattern: `^[0-9]+\. \*\*(.+?)\*\*`
- Extract question components: number, text, context, options, recommendations
- Detect already-answered questions (search for "Answer:" keyword)
- Handle multi-paragraph context (until next question or section)
- Build structured list of unanswered questions

**Question Format Examples from Spec:**

**Simple question with options:**
```markdown
1. **ClaudeKit Version Compatibility**
   - Option A: Pin exact version (e.g., "1.2.3")
   - Option B: Use caret range (e.g., "^1.0.0")
   - Recommendation: Option B
```

**Open-ended question:**
```markdown
2. **Author Information**
   Who should be listed as package author?
   Need: Name and email address for npm contact
```

**Already answered (skip):**
```markdown
3. ~~**ESM vs CommonJS**~~ (RESOLVED)
   **Answer:** Use ESM (import/export) for modern Node.js 18+ compatibility
```

**Parsing Algorithm:**

1. Read spec file: `specs/{slug}/02-specification.md`
2. Use Grep to extract all lines matching `^[0-9]+\. \*\*`
3. For each question line:
   - Extract question number (e.g., "1", "2", "3")
   - Extract question text from bold header (between `**` and `**`)
   - Read subsequent lines until next question or section
   - Parse context for:
     - Options (lines starting with "- Option")
     - Recommendations (lines starting with "- Recommendation:")
     - Free-form context (other paragraphs)
4. Check if question is already answered:
   - Search question context for "Answer:" keyword
   - If found: Skip this question (already resolved)
   - If not found: Add to unanswered list
5. Return structured list:
   ```
   {
     questionNumber: "1",
     questionText: "ClaudeKit Version Compatibility",
     context: "This affects automatic dependency updates...",
     options: [
       { label: "Pin exact version", description: "..." },
       { label: "Use caret range", description: "..." }
     ],
     recommendation: "Option B",
     isAnswered: false
   }
   ```

**Edge Cases:**
- Malformed questions (no number) → Treat entire section as single free-form question
- Context exceeds 200 characters → Truncate for display, preserve full context in spec
- Options without descriptions → Use option text only
- Questions with strikethrough but no "Answer:" → Treat as unanswered

**Implementation Code:**
```bash
# Extract question numbers and texts
grep -E "^[0-9]+\. \*\*" specs/{slug}/02-specification.md > /tmp/questions.txt

# For each question, extract context
while read -r line; do
  question_num=$(echo "$line" | grep -oP '^[0-9]+')
  question_text=$(echo "$line" | grep -oP '\*\*\K[^*]+')

  # Check if already answered (look for "Answer:" in next 10 lines)
  answered=$(sed -n "/$line/,+10p" specs/{slug}/02-specification.md | grep -q "Answer:" && echo "true" || echo "false")

  if [ "$answered" = "false" ]; then
    # Extract context until next question
    # Parse options (lines with "- Option")
    # Parse recommendation (lines with "- Recommendation:")
    # Store in structured format
  fi
done < /tmp/questions.txt
```

**Acceptance Criteria:**
- [ ] Parses all numbered questions correctly
- [ ] Extracts question number, text, context, options, recommendations
- [ ] Detects already-answered questions and skips them
- [ ] Handles edge cases: malformed questions, long context, missing options
- [ ] Returns structured list of unanswered questions only
- [ ] Tests: Verify with spec containing 5 questions (2 answered, 3 unanswered)

---

### Task 1.3: Implement Multi-Select Detection

**Description:** Auto-detect when questions require multi-select vs single-select based on question text keywords
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.2
**Can run parallel with:** Task 1.4

**Technical Requirements:**
- Search question text for multi-select keywords
- Keywords: "select all", "multiple", "which ones", "choose multiple"
- Return boolean: `multiSelect: true/false`
- Default to single-select if no keywords found

**Implementation Logic:**
```bash
# Function to detect multi-select
detect_multiselect() {
  local question_text="$1"

  if echo "$question_text" | grep -iE "(select all|multiple|which ones|choose multiple)" > /dev/null; then
    echo "true"
  else
    echo "false"
  fi
}
```

**Example Questions:**
- "Which package managers should we support?" → multiSelect: true (contains "which")
- "Should we support npm, yarn, and pnpm?" → multiSelect: false (no keywords)
- "Select all authentication methods to include" → multiSelect: true (contains "select all")

**Acceptance Criteria:**
- [ ] Detects multi-select keywords correctly
- [ ] Returns true for "select all", "multiple", "which ones", "choose multiple"
- [ ] Returns false when keywords not present
- [ ] Case-insensitive matching
- [ ] Tests: Verify with 5 example questions (3 multi, 2 single)

---

### Task 1.4: Implement Options Construction

**Description:** Build AskUserQuestion options array from parsed question data, including spec options, recommendations, and generic fallback
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.2
**Can run parallel with:** Task 1.3

**Technical Requirements:**
- If spec has "Option A:", "Option B:" format → Use those as options
- Extract descriptions from option context
- Mark recommended option if "Recommendation:" exists
- Always include "Other" option for free-form text
- Generic fallback if no spec options: "Yes", "No", "Other (specify)"

**Option Construction Algorithm:**

1. Check if parsed question has options array
2. If yes:
   - For each option: Create `{ label: "Option text", description: "..." }`
   - Find recommended option (from "Recommendation:" field)
   - Append " - Recommended" to recommended option's label
3. If no:
   - Create generic options: `[{ label: "Yes", description: "" }, { label: "No", description: "" }]`
4. Always append: `{ label: "Other (custom answer)", description: "Provide your own answer" }`

**Example Construction:**

**Input (from parsing):**
```
Question: "ClaudeKit Version Compatibility"
Options:
  - Option A: Pin exact version (e.g., "1.2.3")
  - Option B: Use caret range (e.g., "^1.0.0")
Recommendation: Option B
```

**Output (for AskUserQuestion):**
```javascript
{
  options: [
    {
      label: "Pin exact version (e.g., '1.2.3')",
      description: "More stable but requires frequent updates"
    },
    {
      label: "Use caret range (e.g., '^1.0.0') - Recommended",
      description: "Automatic updates but potential breaking changes. Test compatibility in CI/CD."
    },
    {
      label: "Other (custom answer)",
      description: "Provide your own answer"
    }
  ]
}
```

**Generic Fallback Example:**

**Input:**
```
Question: "Who should be listed as package author?"
Options: (none)
```

**Output:**
```javascript
{
  options: [
    { label: "Yes", description: "" },
    { label: "No", description: "" },
    { label: "Other (custom answer)", description: "Provide your own answer" }
  ]
}
```

**Acceptance Criteria:**
- [ ] Constructs options array from spec options when available
- [ ] Includes descriptions from spec context
- [ ] Marks recommended option with " - Recommended" suffix
- [ ] Provides generic fallback when no spec options
- [ ] Always includes "Other" option
- [ ] Tests: Verify with 3 scenarios (spec options + recommendation, spec options no recommendation, no spec options)

---

## Phase 2: Interactive Resolution

### Task 2.1: Implement Progress Indicator

**Description:** Display progress indication showing "Question N of Total" for user awareness during multi-question resolution
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.2
**Can run parallel with:** Task 2.2

**Technical Requirements:**
- Calculate total unanswered questions
- Track current question number
- Display before each AskUserQuestion call
- Format: "Question {N} of {Total}: {Question Text}"

**Implementation:**
```markdown
Display progress in `.claude/commands/ideate-to-spec.md`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Question {current} of {total}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Question text from spec}
```

Example:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Question 3 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Should we support npm, yarn, and pnpm equally?
```
```

**Acceptance Criteria:**
- [ ] Displays question count (N of Total)
- [ ] Updates for each question
- [ ] Clear visual separation
- [ ] Tests: Verify with 5-question spec

---

### Task 2.2: Implement AskUserQuestion Integration

**Description:** Integrate AskUserQuestion tool to present each question interactively with context, options, and multi-select detection
**Size:** Large
**Priority:** High
**Dependencies:** Tasks 1.2, 1.3, 1.4
**Can run parallel with:** None (depends on all parsing tasks)

**Technical Requirements:**
- Construct AskUserQuestion call for each unanswered question
- Include question text, header, multiSelect flag, and options array
- Display context (first 200 chars with truncation notice if longer)
- Collect user's answer (selected option or free-form from "Other")
- Record answer for later spec update

**AskUserQuestion Call Structure:**

```javascript
AskUserQuestion({
  questions: [
    {
      question: "{Question text from spec}",
      header: "Question {N}",
      multiSelect: {result from Task 1.3},
      options: {result from Task 1.4}
    }
  ]
})
```

**Context Display Logic:**

```markdown
If question context <= 200 chars:
  Display full context

If question context > 200 chars:
  Display first 200 chars + "(see full context in spec)"
```

**Answer Recording:**

After user selects option(s), record:
```
{
  questionNumber: "3",
  questionText: "Package Manager Support",
  selectedOption: "Yes, all three equally (npm + yarn + pnpm)",
  selectedDescription: "Single publish to npm registry automatically supports all three package managers",
  isMultiSelect: false,
  timestamp: "2025-11-22T10:30:00Z"
}
```

**Implementation Example (from spec):**

```javascript
// Task 2.2: For each unanswered question
for (const question of unansweredQuestions) {
  // Display progress (Task 2.1)
  displayProgress(question.number, unansweredQuestions.length);

  // Show context (truncate if needed)
  const context = question.context.length > 200
    ? question.context.substring(0, 200) + " (see full context in spec)"
    : question.context;

  // Construct AskUserQuestion call
  const answer = await AskUserQuestion({
    questions: [{
      question: question.text,
      header: `Question ${question.number}`,
      multiSelect: question.isMultiSelect,  // from Task 1.3
      options: question.options             // from Task 1.4
    }]
  });

  // Record answer
  recordAnswer(question.number, answer);
}
```

**Real Example (from spec section 5.3):**

```javascript
AskUserQuestion({
  questions: [{
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
      },
      {
        label: "Other (custom answer)",
        description: "Provide your own answer"
      }
    ]
  }]
})
```

**Acceptance Criteria:**
- [ ] AskUserQuestion called for each unanswered question
- [ ] Question text, header, multiSelect, options all populated correctly
- [ ] Context displayed with truncation if >200 chars
- [ ] User's answer captured and recorded
- [ ] Multi-select questions allow multiple selections
- [ ] "Other" option collects free-form text
- [ ] Tests: Verify with 5-question spec (mix of single/multi-select, with/without spec options)

---

### Task 2.3: Implement Answer Recording

**Description:** Store user's answers in structured format for later spec file updates
**Size:** Small
**Priority:** High
**Dependencies:** Task 2.2
**Can run parallel with:** None (depends on 2.2 answer collection)

**Technical Requirements:**
- Record question number, question text, selected option, selected description
- Store in temporary data structure (array or map)
- Track timestamp for each answer
- Handle multi-select answers (comma-separated list)

**Data Structure:**

```javascript
const recordedAnswers = [
  {
    questionNumber: "1",
    questionText: "ClaudeKit Version Compatibility",
    selectedOption: "Use caret range (^1.0.0)",
    selectedDescription: "Automatic updates, test compatibility in CI/CD",
    isMultiSelect: false,
    timestamp: "2025-11-22T10:15:00Z"
  },
  {
    questionNumber: "2",
    questionText: "Package Manager Support",
    selectedOptions: ["npm", "yarn", "pnpm"],  // multi-select
    selectedDescription: "Support all three package managers",
    isMultiSelect: true,
    timestamp: "2025-11-22T10:16:30Z"
  }
];
```

**Storage Method:**

Since this is within a single command execution, answers can be stored in a bash array or temporary file:

```bash
# Temporary storage file
ANSWERS_FILE="/tmp/ideate-to-spec-answers-$$.txt"

# Record answer format (one per line)
echo "1|ClaudeKit Version Compatibility|Use caret range|Automatic updates..." >> "$ANSWERS_FILE"
echo "2|Package Manager Support|npm,yarn,pnpm|Support all three..." >> "$ANSWERS_FILE"
```

**Acceptance Criteria:**
- [ ] Answers stored with question number, text, selection, description
- [ ] Multi-select answers stored as comma-separated list
- [ ] Timestamp recorded for each answer
- [ ] Data structure persists across question loop
- [ ] Tests: Verify with 5 answers (3 single-select, 2 multi-select)

---

## Phase 3: Spec File Updates

### Task 3.1: Implement Strikethrough Answer Format

**Description:** Build formatted answer text with strikethrough pattern for audit trail preservation
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.3
**Can run parallel with:** None (depends on recorded answers)

**Technical Requirements:**
- Strikethrough question header: `~~**{Question}**~~ (RESOLVED)`
- Add "Answer:" line with user's selection
- Add "Rationale:" line with option description
- Preserve original context with "Original context preserved:" header
- Format multi-select answers as comma-separated list

**Strikethrough Format Template:**

**Before (original question):**
```markdown
1. **ClaudeKit Version Compatibility**
   - Option A: Pin exact version (e.g., "1.2.3")
   - Option B: Use caret range (e.g., "^1.0.0")
   - Recommendation: Option B
```

**After (with answer):**
```markdown
1. ~~**ClaudeKit Version Compatibility**~~ (RESOLVED)
   **Answer:** Use caret range (^1.0.0)
   **Rationale:** Automatic updates but potential breaking changes. Test compatibility in CI/CD.

   Original context preserved:
   - Option A: Pin exact version (e.g., "1.2.3")
   - Option B: Use caret range (e.g., "^1.0.0")
   - Recommendation: Option B
```

**Implementation Function:**

```bash
# Function to build strikethrough format
build_strikethrough_format() {
  local question_num="$1"
  local question_text="$2"
  local answer="$3"
  local rationale="$4"
  local original_context="$5"

  cat << EOF
$question_num. ~~**$question_text**~~ (RESOLVED)
   **Answer:** $answer
   **Rationale:** $rationale

   Original context preserved:
$original_context
EOF
}
```

**Multi-Select Format:**

**Before:**
```markdown
3. **Package Manager Support**
   Which package managers should we support?
   - npm
   - yarn
   - pnpm
```

**After:**
```markdown
3. ~~**Package Manager Support**~~ (RESOLVED)
   **Answer:** npm, yarn, pnpm (all three)
   **Rationale:** Single publish to npm registry automatically supports all three package managers

   Original context preserved:
   Which package managers should we support?
   - npm
   - yarn
   - pnpm
```

**Acceptance Criteria:**
- [ ] Strikethrough format applied to question header
- [ ] "(RESOLVED)" marker added
- [ ] "Answer:" line populated with user's selection
- [ ] "Rationale:" line populated with option description
- [ ] Original context preserved below
- [ ] Multi-select answers formatted as comma-separated list
- [ ] Tests: Verify with 3 formats (single-select, multi-select, free-form "Other")

---

### Task 3.2: Implement Edit Tool Integration

**Description:** Use Edit tool to apply strikethrough format to spec file, replacing original question blocks with answered format
**Size:** Large
**Priority:** High
**Dependencies:** Task 3.1
**Can run parallel with:** None (depends on strikethrough format)

**Technical Requirements:**
- Locate original question block in spec file
- Construct old_string (exact match from file)
- Construct new_string (strikethrough format from Task 3.1)
- Apply Edit tool atomically
- Handle Edit failures (context mismatch)
- Save progress incrementally (one edit per question)

**Edit Tool Usage Pattern:**

```javascript
Edit({
  file_path: "specs/{slug}/02-specification.md",
  old_string: "{exact original question block}",
  new_string: "{strikethrough format with answer}"
})
```

**Exact Match Requirement:**

The old_string MUST match the spec file exactly (including indentation, newlines, spacing). To ensure this:

1. Read spec file fresh before each edit
2. Extract question block using line numbers or grep context
3. Use exact text as old_string (no modifications)

**Implementation Example (from spec section 5.3):**

```javascript
// Read spec file to get exact question block
const specContent = await Read("specs/package-publishing-strategy/02-specification.md");

// Extract question 3 block (from "3. **" to next question or section)
const question3Block = extractQuestionBlock(specContent, "3");

// Build new format with strikethrough
const newFormat = buildStrikethroughFormat(
  "3",
  "Package Manager Support",
  "Yes, all three equally (npm + yarn + pnpm)",
  "Single publish to npm registry automatically supports all three package managers",
  question3Block.context
);

// Apply edit
await Edit({
  file_path: "specs/package-publishing-strategy/02-specification.md",
  old_string: question3Block.fullText,
  new_string: newFormat
});
```

**Real Example from Spec:**

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

**Error Handling:**

If Edit fails (old_string doesn't match):
1. Re-read spec file (might have been edited externally)
2. Re-parse question block
3. Retry edit once
4. If second failure: Prompt user for manual intervention

**Acceptance Criteria:**
- [ ] Edit tool called for each answered question
- [ ] old_string matches spec file exactly
- [ ] new_string uses strikethrough format
- [ ] Edits applied atomically (one question at a time)
- [ ] Edit failures detected and handled
- [ ] Progress saved incrementally (allows recovery)
- [ ] Tests: Verify with 5-question spec (all edits succeed)

---

### Task 3.3: Implement Edit Error Handling

**Description:** Handle Edit tool failures gracefully with retry logic and user prompting
**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.2
**Can run parallel with:** None (depends on Edit integration)

**Technical Requirements:**
- Detect Edit tool failures (context mismatch errors)
- Re-read spec file on failure (detect external edits)
- Re-parse question block and retry once
- If retry fails: Prompt user with AskUserQuestion
- Provide options: Continue or stop
- Log failed edits for user reference

**Error Detection:**

```bash
# Edit tool returns error if old_string doesn't match
if ! edit_result=$(Edit(...)); then
  echo "Edit failed: $edit_result"
  # Trigger retry logic
fi
```

**Retry Logic:**

1. **First Failure:**
   - Re-read spec file: `specs/{slug}/02-specification.md`
   - Re-parse question block (might have changed)
   - Retry Edit with fresh old_string

2. **Second Failure:**
   - Display error message to user
   - Provide manual edit instructions
   - Use AskUserQuestion to ask: Continue or stop?

**User Prompt (Second Failure):**

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

**Implementation:**

```bash
apply_edit_with_retry() {
  local question_num="$1"
  local new_format="$2"
  local max_retries=1
  local attempt=0

  while [ $attempt -le $max_retries ]; do
    # Read fresh spec
    spec_content=$(cat "specs/$slug/02-specification.md")

    # Extract question block
    old_string=$(extract_question_block "$spec_content" "$question_num")

    # Try edit
    if Edit file_path="specs/$slug/02-specification.md" old_string="$old_string" new_string="$new_format"; then
      echo "✅ Updated question $question_num"
      return 0
    else
      echo "⚠️ Edit failed (attempt $((attempt + 1)))"
      attempt=$((attempt + 1))
    fi
  done

  # Both attempts failed - prompt user
  prompt_user_for_manual_edit "$question_num" "$new_format"
  return 1
}
```

**Acceptance Criteria:**
- [ ] Detects Edit tool failures
- [ ] Re-reads spec file on first failure
- [ ] Retries edit once with fresh old_string
- [ ] Prompts user after second failure
- [ ] Provides manual edit instructions
- [ ] Offers continue or stop options
- [ ] Logs failed edits
- [ ] Tests: Simulate external edit during flow, verify recovery

---

### Task 3.4: Implement Save-As-You-Go Pattern

**Description:** Save answers to spec file incrementally (one edit per question) to enable recovery if user needs to pause
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 3.2
**Can run parallel with:** None (inherent to edit flow)

**Technical Requirements:**
- Apply Edit immediately after each question is answered
- Don't batch multiple edits
- Verify each edit succeeds before proceeding to next question
- Allow user to resume if they stop mid-flow

**Implementation Pattern:**

```bash
# For each question in loop
for question in "${unanswered_questions[@]}"; do
  # Ask question (Task 2.2)
  answer=$(ask_user_question "$question")

  # Record answer (Task 2.3)
  record_answer "$question" "$answer"

  # Build strikethrough format (Task 3.1)
  new_format=$(build_strikethrough_format "$question" "$answer")

  # Apply edit IMMEDIATELY (Task 3.2)
  apply_edit_with_retry "$question" "$new_format"

  # ✅ Answer is now saved to spec file
  # If user interrupts here, this question is permanently saved

  # Continue to next question
done
```

**Recovery Scenario:**

1. User runs `/ideate-to-spec`, answers 3 of 5 questions
2. User stops execution (Ctrl+C or error)
3. Spec file has 3 answered questions (strikethrough format)
4. User runs `/ideate-to-spec` again
5. System parses spec, finds 3 answered questions
6. Only presents 2 remaining unanswered questions
7. ✅ User doesn't have to re-answer first 3

**Acceptance Criteria:**
- [ ] Each edit applied immediately after question answered
- [ ] Edits not batched
- [ ] User can resume after interruption
- [ ] Already-answered questions detected on resume (Task 1.2)
- [ ] No duplicate question prompts
- [ ] Tests: Simulate interruption after 3 questions, verify resume

---

## Phase 4: Validation Loop

### Task 4.1: Implement Re-validation Call

**Description:** Execute `/spec:validate` after answering questions to check if all questions are resolved
**Size:** Small
**Priority:** High
**Dependencies:** Task 3.2 (needs answers saved first)
**Can run parallel with:** None (must run after edits)

**Technical Requirements:**
- Use SlashCommand tool to execute `/spec:validate`
- Pass spec file path: `specs/{slug}/02-specification.md`
- Capture validation output
- Parse output for completeness score and remaining issues

**SlashCommand Usage:**

```bash
# Execute validation
validation_output=$(SlashCommand("/spec:validate specs/$slug/02-specification.md"))

# Parse output
completeness_score=$(echo "$validation_output" | grep "Completeness Score:" | cut -d: -f2)
remaining_questions=$(echo "$validation_output" | grep "Open Questions" | wc -l)
```

**Validation Output Examples:**

**Success (all questions answered):**
```
✅ Validation passed!
✅ All 18 sections complete
✅ All open questions answered
Completeness Score: 10/10
```

**Partial (questions remain):**
```
⚠️ Validation incomplete
✅ 18 sections complete
❌ Open Questions section has 2 unanswered questions
Completeness Score: 9/10
```

**Failure (structural issues):**
```
❌ Validation failed
❌ Missing "Performance Considerations" section
❌ "Testing Strategy" section is incomplete
Completeness Score: 7/10
```

**Acceptance Criteria:**
- [ ] `/spec:validate` executed after answering questions
- [ ] Validation output captured
- [ ] Completeness score extracted
- [ ] Remaining questions detected
- [ ] Validation errors/warnings identified
- [ ] Tests: Verify with 3 scenarios (success, partial, failure)

---

### Task 4.2: Implement Validation Output Parsing

**Description:** Parse `/spec:validate` output to determine if questions remain, extract completeness score, and identify non-question issues
**Size:** Medium
**Priority:** High
**Dependencies:** Task 4.1
**Can run parallel with:** None (depends on validation output)

**Technical Requirements:**
- Parse validation output text
- Detect "Open Questions" mentions (indicates questions remain)
- Extract completeness score (format: "N/10")
- Identify structural issues (missing sections, incomplete sections)
- Return decision: Loop, proceed, or prompt

**Parsing Logic:**

```bash
parse_validation_output() {
  local validation_output="$1"

  # Check for open questions mentions
  if echo "$validation_output" | grep -qi "open questions"; then
    questions_remaining="true"
  else
    questions_remaining="false"
  fi

  # Extract completeness score
  completeness_score=$(echo "$validation_output" | grep -oP "Completeness Score: \K[0-9]+")

  # Check for structural issues (not question-related)
  if echo "$validation_output" | grep -E "(Missing|incomplete)" | grep -v "Open Questions"; then
    has_structural_issues="true"
  else
    has_structural_issues="false"
  fi

  # Return parsed data
  echo "$questions_remaining|$completeness_score|$has_structural_issues"
}
```

**Decision Matrix:**

| Questions Remain | Structural Issues | Action |
|------------------|-------------------|--------|
| Yes | No | Loop to Step 6a (re-parse questions) |
| No | No | Proceed to Step 7 (success!) |
| Yes | Yes | Prompt user: Continue or fix first? |
| No | Yes | Prompt user: Continue or fix first? |

**Acceptance Criteria:**
- [ ] Detects "Open Questions" mentions in output
- [ ] Extracts completeness score correctly
- [ ] Identifies structural issues (non-question)
- [ ] Returns structured decision data
- [ ] Tests: Verify with 4 validation output scenarios (success, questions remain, structural issues, both)

---

### Task 4.3: Implement Loop Control Logic

**Description:** Decide whether to loop back to Step 6a, proceed to Step 7, or prompt user based on validation results
**Size:** Medium
**Priority:** High
**Dependencies:** Task 4.2
**Can run parallel with:** None (depends on parsed validation)

**Technical Requirements:**
- Implement decision logic based on validation parsing
- Loop back to Step 6a if questions remain
- Proceed to Step 7 if complete
- Prompt user if structural issues exist
- Track loop iterations (no hard limit, but warn at 10+)
- Handle user decision to stop

**Decision Flow:**

```bash
# Parse validation output (Task 4.2)
parsed=$(parse_validation_output "$validation_output")
questions_remaining=$(echo "$parsed" | cut -d'|' -f1)
completeness_score=$(echo "$parsed" | cut -d'|' -f2)
has_structural_issues=$(echo "$parsed" | cut -d'|' -f3)

# Track iterations
iteration_count=$((iteration_count + 1))

# Warn at 10+ iterations
if [ $iteration_count -ge 10 ]; then
  echo "⚠️ Resolved $resolved_count questions so far, still have issues. Continue? [yes/no]"
  read continue
  if [ "$continue" != "yes" ]; then
    echo "Stopping. Please review spec manually."
    exit 0
  fi
fi

# Decision logic
if [ "$questions_remaining" = "true" ] && [ "$has_structural_issues" = "false" ]; then
  # Loop back to Step 6a
  echo "Questions remain. Re-parsing..."
  continue  # Back to question parsing loop

elif [ "$questions_remaining" = "false" ] && [ "$has_structural_issues" = "false" ]; then
  # Success! Proceed to Step 7
  echo "✅ All questions answered! Proceeding to summary..."
  break  # Exit loop, go to Step 7

else
  # Has structural issues - prompt user
  prompt_user_for_structural_issues "$validation_output"
fi
```

**User Prompt for Structural Issues:**

```
⚠️ Validation found issues:
- Missing "Performance Considerations" section
- "Testing Strategy" section is incomplete

What would you like to do?
[A] Continue with question resolution (fix issues later)
[B] Stop and fix validation issues manually first
[C] Show me the validation details
```

**Iteration Tracking:**

```bash
# Initialize before loop
iteration_count=0
resolved_count=0

# In loop
iteration_count=$((iteration_count + 1))
resolved_count=$((resolved_count + answers_this_iteration))

# Warn at 10
if [ $iteration_count -ge 10 ]; then
  warn_many_iterations "$resolved_count" "$remaining_count"
fi
```

**Acceptance Criteria:**
- [ ] Loops to Step 6a when questions remain
- [ ] Proceeds to Step 7 when complete
- [ ] Prompts user when structural issues exist
- [ ] Tracks loop iterations
- [ ] Warns at 10+ iterations
- [ ] Respects user decision to stop
- [ ] Tests: Verify with 3 scenarios (loop, proceed, prompt)

---

### Task 4.4: Implement External Edit Detection

**Description:** Re-parse spec file fresh on each loop iteration to detect and handle manual edits made between questions
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 4.3
**Can run parallel with:** None (inherent to loop)

**Technical Requirements:**
- Read spec file fresh at start of each iteration
- Re-parse "Open Questions" section (don't cache)
- Detect new answered questions (manual edits)
- Update unanswered questions list
- Handle question list changes gracefully

**Implementation Pattern:**

```bash
# Loop control
while true; do
  # ✅ Read spec file FRESH each iteration
  spec_content=$(Read "specs/$slug/02-specification.md")

  # ✅ Re-parse questions (Task 1.2)
  unanswered_questions=$(parse_unanswered_questions "$spec_content")

  # Check if any questions remain
  if [ ${#unanswered_questions[@]} -eq 0 ]; then
    echo "✅ All questions answered!"
    break
  fi

  # Ask next question
  # ...

  # Apply edit
  # ...

  # Re-validate (Task 4.1)
  # ...

  # Loop control (Task 4.3)
  # ...
done
```

**External Edit Scenario:**

1. System presents Question 1, user answers
2. **User manually edits spec file** to answer Question 3 directly
3. Next iteration: Read spec fresh
4. Re-parse finds Questions 2, 4, 5 unanswered (Question 3 now has "Answer:")
5. System skips Question 3, presents Question 2
6. ✅ No duplicate prompts, manual edit respected

**Safety:**

- Edit tool will fail if old_string doesn't match (prevents data corruption)
- Re-reading spec ensures Edit uses current file state
- Manual edits detected via "Answer:" keyword parsing (Task 1.2)

**Acceptance Criteria:**
- [ ] Spec file read fresh each iteration
- [ ] Questions re-parsed each iteration
- [ ] Manual edits detected (answered questions skipped)
- [ ] Edit tool uses current file state
- [ ] No caching of question list
- [ ] Tests: Simulate manual edit after 2 questions, verify detection

---

## Phase 5: Summary Enhancement

### Task 5.1: Implement Resolved Questions List

**Description:** Build list of resolved questions with answers for Step 7 summary display
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 2.3 (recorded answers)
**Can run parallel with:** Task 5.2

**Technical Requirements:**
- Extract question number + text from recorded answers
- Format as numbered list with arrow notation
- Show brief answer summary (not full rationale)
- Include count of resolved questions

**List Format:**

```markdown
### Resolved Questions (Step 6b: Spec Open Questions)

1. ClaudeKit Version Compatibility → Use caret range (^1.0.0)
2. Author Information → Kenneth Priester <email@example.com>
3. ESM vs CommonJS → ESM (modern Node.js 18+)
4. Package Manager Support → npm, yarn, pnpm (all three)
5. NPM Organization → Personal account initially
```

**Implementation:**

```bash
build_resolved_questions_list() {
  local answers_file="$1"

  echo "### Resolved Questions (Step 6b: Spec Open Questions)"
  echo ""

  while IFS='|' read -r num text answer desc; do
    echo "$num. $text → $answer"
  done < "$answers_file"
}
```

**Acceptance Criteria:**
- [ ] Lists all resolved questions
- [ ] Shows question number + text
- [ ] Shows brief answer (not full rationale)
- [ ] Formatted as numbered list with arrows
- [ ] Count displayed in section header
- [ ] Tests: Verify with 5 resolved questions

---

### Task 5.2: Update Step 7 Summary Template

**Description:** Enhance Step 7 summary in `.claude/commands/ideate-to-spec.md` to include resolved questions section
**Size:** Medium
**Priority:** High
**Dependencies:** Task 5.1
**Can run parallel with:** None (depends on resolved list)

**Technical Requirements:**
- Add "Open Questions Resolved: {count}" to summary header
- Add "Resolved Questions" section after "Decisions Made"
- Only show section if questions were resolved (backward compatible)
- Update validation status to "READY FOR DECOMPOSITION ✅" if complete
- Update recommended next steps based on completeness

**Enhanced Summary Template:**

```markdown
## Specification Summary

**Feature Slug:** {slug}
**Spec Location:** specs/{slug}/02-specification.md
**Validation Status:** {READY FOR DECOMPOSITION ✅ or NEEDS WORK}
**Completeness Score:** {score}/10
**Open Questions Resolved:** {count} {only if > 0}

### What Was Specified

{Brief description from spec}

### Decisions Made (Step 2: Ideation Clarifications)

{List decisions from Step 2}

### Resolved Questions (Step 6b: Spec Open Questions) {only if any resolved}

{List from Task 5.1}

### Validation Results

{Summary from /spec:validate}

### Remaining Decisions (if any)

{Any open questions still unanswered}

### Recommended Next Steps

1. [ ] Review the specification at specs/{slug}/02-specification.md
2. [ ] {If complete: Run /spec:decompose specs/{slug}/02-specification.md}
3. [ ] {If incomplete: Address remaining questions first}
4. [ ] {Then implement: /spec:execute specs/{slug}/02-specification.md}
5. [ ] {Track progress: stm list --pretty --tag feature:{slug}}
```

**Conditional Display Logic:**

```bash
# Only show "Resolved Questions" if count > 0
if [ $resolved_count -gt 0 ]; then
  echo "**Open Questions Resolved:** $resolved_count"
  echo ""
  echo "### Resolved Questions (Step 6b: Spec Open Questions)"
  build_resolved_questions_list "$answers_file"
fi
```

**Acceptance Criteria:**
- [ ] Summary header shows resolved count
- [ ] "Resolved Questions" section added
- [ ] Section only shown if questions were resolved
- [ ] Validation status updated correctly
- [ ] Next steps reflect completeness
- [ ] Backward compatible (specs without questions)
- [ ] Tests: Verify with 2 scenarios (with questions, without questions)

---

## Phase 6: Documentation & Testing

### Task 6.1: Update ideate-to-spec.md Command File

**Description:** Add Steps 6a-6d to `.claude/commands/ideate-to-spec.md` between Step 6 validation and Step 7 summary
**Size:** Large
**Priority:** High
**Dependencies:** All Phase 1-5 tasks
**Can run parallel with:** Task 6.2

**Technical Requirements:**
- Insert new steps after Step 6 (validation)
- Include all implementation details from tasks
- Add decision flow documentation
- Update Step 7 with enhanced summary
- Maintain backward compatibility notes

**File Modification:**

Current structure (lines 1-237):
```
Step 1: Extract slug & read ideation
Step 2: Interactive decision gathering
Step 3: Identify additional specifications
Step 4: Build spec creation prompt
Step 5: Execute /spec:create
Step 6: Validate specification
Step 7: Present summary & next steps
```

Enhanced structure:
```
Step 1: Extract slug & read ideation
Step 2: Interactive decision gathering
Step 3: Identify additional specifications
Step 4: Build spec creation prompt
Step 5: Execute /spec:create
Step 6: Validate specification
  └─ If has open questions:
     Step 6a: Extract Open Questions from spec
     Step 6b: Interactive question resolution
     Step 6c: Update spec with answers
     Step 6d: Re-validate and loop control
     └─ Loop back to 6a if questions remain
Step 7: Present summary & next steps (enhanced)
```

**Content from Spec Section 11.1:**

Add complete implementation instructions from specification section 11.1 (Documentation → Files to Update → `.claude/commands/ideate-to-spec.md`).

**Key Sections to Add:**

1. **Step 6a: Extract Open Questions from Spec** (lines 1045-1060 from spec)
2. **Step 6b: Interactive Question Resolution** (lines 1061-1093)
3. **Step 6c: Update Spec with Answers** (lines 1095-1127)
4. **Step 6d: Re-validate and Loop Control** (lines 1129-1172)
5. **Step 7 Enhancement** (lines 1174-1231)

**Acceptance Criteria:**
- [ ] Steps 6a-6d inserted after Step 6
- [ ] All implementation details included
- [ ] Decision flow documented
- [ ] Step 7 enhanced with resolved questions
- [ ] Backward compatibility noted
- [ ] File validates (no syntax errors)
- [ ] Tests: Run `/ideate-to-spec` and verify new steps execute

---

### Task 6.2: Update CLAUDE.md Workflow Documentation

**Description:** Update `CLAUDE.md` to document the interactive question resolution feature in Phase 2 workflow
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 6.1
**Can run parallel with:** Task 6.3

**Technical Requirements:**
- Update "Phase 2: Specification" section
- Add "Interactive Question Resolution" subsection
- Update workflow examples
- Document new capability

**Updates from Spec Section 11.2:**

Add to "Phase 2: Specification" (around line 20-30):
```markdown
## Core Workflow

### Phase 2: Specification
- **Command:** `/ideate-to-spec <path-to-ideation>`
- **Output:** `specs/<slug>/02-specification.md`
- **Purpose:** Transform ideation into validated technical specification
- **Process:** Extract decisions → build spec → **resolve open questions** → validate completeness
- **NEW:** Interactive question resolution ensures specs are implementation-ready
```

Add new subsection (around line 100):
```markdown
### Interactive Question Resolution

After spec creation, the system automatically:
1. Detects open questions in specification
2. Presents each question interactively with context
3. Records answers with audit trail (strikethrough format)
4. Re-validates until all questions resolved
5. Prevents decomposition until spec is complete
```

**Acceptance Criteria:**
- [ ] Phase 2 description updated
- [ ] "Interactive Question Resolution" section added
- [ ] Workflow examples updated
- [ ] Feature documented clearly
- [ ] Tests: Read CLAUDE.md and verify clarity

---

### Task 6.3: Update README.md with Usage Examples

**Description:** Add example workflow showing question resolution to README.md
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 6.1
**Can run parallel with:** Task 6.2

**Technical Requirements:**
- Add example to "Standard Workflow" section
- Show interactive question resolution flow
- Include comments explaining new behavior
- Update quick start examples

**Example from Spec Section 11.3:**

Add to README.md "Standard Workflow" section:
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

**Acceptance Criteria:**
- [ ] Example added to README.md
- [ ] Shows question resolution flow
- [ ] Comments explain behavior
- [ ] Quick start updated
- [ ] Tests: Review README for clarity

---

### Task 6.4: Update .claude/README.md Command Docs

**Description:** Document the `/ideate-to-spec` command's new question resolution features in `.claude/README.md`
**Size:** Small
**Priority:** Low
**Dependencies:** Task 6.1
**Can run parallel with:** Tasks 6.2, 6.3

**Technical Requirements:**
- Add question resolution to command features list
- Document interactive steps
- Update usage instructions
- Add examples

**Content from Spec Section 11.4:**

Add to `.claude/README.md`:
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

**Acceptance Criteria:**
- [ ] Command features documented
- [ ] Interactive steps listed
- [ ] Usage examples provided
- [ ] New capability highlighted
- [ ] Tests: Review .claude/README.md for completeness

---

### Task 6.5: Manual Testing - Happy Path

**Description:** Execute Test 1 from testing strategy: Happy path with open questions
**Size:** Medium
**Priority:** High
**Dependencies:** Task 6.1 (implementation complete)
**Can run parallel with:** None (sequential testing)

**Test Scenario (from Spec Section 10.1):**

**Setup:**
- Create or use existing ideation document with clarifications
- Run `/ideate-to-spec`

**Expected Behavior:**
1. Steps 1-5 complete normally
2. `/spec:validate` runs, detects open questions
3. System presents questions one at a time
4. User answers all questions
5. Spec file updated with strikethrough format
6. Re-validation passes
7. Summary shows resolved questions list

**Success Criteria:**
- ✅ All questions presented interactively
- ✅ Answers recorded in spec with strikethrough
- ✅ Validation passes after resolution
- ✅ Summary includes resolved questions

**Test Documentation:**

Create test report using template from spec section 10 (Test Documentation Template):

```markdown
### Test: Happy Path with Open Questions
**Date:** 2025-11-22
**Tester:** {Name}
**Spec Used:** specs/{test-spec}/02-specification.md

**Steps:**
1. Created ideation document
2. Ran /ideate-to-spec
3. Answered all interactive questions
4. Reviewed spec file for strikethrough format
5. Checked validation output
6. Reviewed summary

**Results:**
- ✅ All 5 questions presented interactively
- ✅ Answers recorded in spec with strikethrough
- ✅ Validation passed after resolution
- ✅ Summary included resolved questions list

**Issues Found:**
- None

**Pass/Fail:** PASS
```

**Acceptance Criteria:**
- [ ] Test executed with real ideation document
- [ ] All expected behaviors observed
- [ ] Test report documented
- [ ] Pass/fail recorded
- [ ] Issues logged if any found

---

### Task 6.6: Manual Testing - Edge Cases

**Description:** Execute Tests 2-10 from testing strategy: No questions, partial resolution, validation loop, malformed questions, external edits, validation failures, many questions, multi-select, free-form
**Size:** Large
**Priority:** High
**Dependencies:** Task 6.5 (happy path verified first)
**Can run parallel with:** None (sequential testing)

**Test Scenarios to Execute:**

1. **Test 2: No Open Questions** (Spec Section 10.2)
   - Setup: Spec without "Open Questions" section
   - Expected: Steps 6a-6d skipped, proceed directly to Step 7
   - Success: No interactive prompts, workflow completes

2. **Test 3: Partial Manual Resolution** (Spec Section 10.3)
   - Setup: 5 questions, manually answer 2
   - Expected: System skips 2 answered, presents 3 unanswered
   - Success: Only unanswered questions presented

3. **Test 4: Validation Loop** (Spec Section 10.4)
   - Setup: Complex questions triggering multiple iterations
   - Expected: Multiple iterations, no duplicates
   - Success: Loop handles correctly, final validation passes

4. **Test 5: Malformed Questions** (Spec Section 10.5)
   - Setup: Questions without numbered format
   - Expected: Graceful fallback to free-form
   - Success: No crash, answer recorded

5. **Test 6: External Edit During Flow** (Spec Section 10.6)
   - Setup: Manually edit spec after 2 questions
   - Expected: Next iteration detects changes, continues
   - Success: External edits detected, no data corruption

6. **Test 7: Validation Failure** (Spec Section 10.7)
   - Setup: Spec with missing required sections
   - Expected: Interactive prompt, user chooses continue
   - Success: User has choice, flow continues

7. **Test 8: Many Questions (20+)** (Spec Section 10.8)
   - Setup: Spec with 25 open questions
   - Expected: All processed, progress indication clear
   - Success: All questions answered, acceptable performance

8. **Test 9: Multi-Select Question** (Spec Section 10.9)
   - Setup: Question with "which" keyword
   - Expected: multiSelect enabled, multiple selections
   - Success: Multi-select works, answer formatted correctly

9. **Test 10: Free-Form Answer** (Spec Section 10.10)
   - Setup: User selects "Other" option
   - Expected: Free-form text accepted
   - Success: Custom answer recorded

**Test Documentation:**

Create test report for each scenario using template from spec section 10.

**Acceptance Criteria:**
- [ ] All 9 edge case tests executed
- [ ] Test reports documented for each
- [ ] Issues logged and tracked
- [ ] Pass/fail recorded for each test
- [ ] Regressions identified and fixed

---

## Summary

### Task Count by Phase

| Phase | Tasks | Estimated Size |
|-------|-------|----------------|
| Phase 1: Foundation & Parsing | 4 | 2 Small, 1 Medium, 1 Large |
| Phase 2: Interactive Resolution | 3 | 1 Small, 2 Large |
| Phase 3: Spec File Updates | 4 | 2 Small, 1 Medium, 1 Large |
| Phase 4: Validation Loop | 4 | 2 Small, 2 Medium |
| Phase 5: Summary Enhancement | 2 | 1 Small, 1 Medium |
| Phase 6: Documentation & Testing | 6 | 3 Small, 2 Medium, 1 Large |
| **Total** | **23** | **7 Small, 7 Medium, 9 Large** |

### Parallel Execution Opportunities

**Phase 1:**
- Task 1.1 → Task 1.2 (sequential)
- Task 1.2 → Tasks 1.3 + 1.4 (parallel)

**Phase 2:**
- Task 2.1 + 2.2 can start in parallel (progress indicator + question integration)
- Task 2.3 depends on 2.2

**Phase 3:**
- All tasks sequential (3.1 → 3.2 → 3.3)
- Task 3.4 inherent to 3.2

**Phase 4:**
- All tasks sequential (4.1 → 4.2 → 4.3)
- Task 4.4 inherent to loop

**Phase 5:**
- Tasks 5.1 + 5.2 can run in parallel

**Phase 6:**
- Tasks 6.2 + 6.3 + 6.4 can run in parallel (all documentation)
- Task 6.1 must complete first
- Tasks 6.5 + 6.6 sequential (testing)

### Critical Path

```
1.1 → 1.2 → 1.4 → 2.2 → 2.3 → 3.1 → 3.2 → 4.1 → 4.2 → 4.3 → 5.2 → 6.1 → 6.5 → 6.6
```

### Execution Strategy

1. **Foundation First:** Complete Phase 1 to enable parsing
2. **Interactive Flow:** Complete Phase 2 for question resolution
3. **File Updates:** Complete Phase 3 for spec modifications
4. **Validation Loop:** Complete Phase 4 for re-validation
5. **Summary:** Complete Phase 5 for enhanced output
6. **Documentation:** Complete Phase 6 for docs and testing

### Risk Assessment

**Low Risk:**
- Question parsing (well-defined format)
- AskUserQuestion integration (existing tool)
- Documentation updates

**Medium Risk:**
- Edit tool integration (context matching required)
- Validation loop (depends on external `/spec:validate`)
- Multi-iteration scenarios

**High Risk:**
- External edit detection (requires careful re-parsing)
- Edit error handling (must not corrupt spec files)
- Many-question scenarios (performance and UX)

### Recommended Next Steps

1. ✅ Review this task breakdown
2. → Run: `stm list --pretty --tag feature:spec-open-questions-workflow` to view tasks
3. → Implement with: `/spec:execute specs/spec-open-questions-workflow/02-specification.md`
4. → Track progress in STM
5. → Execute manual testing after implementation
