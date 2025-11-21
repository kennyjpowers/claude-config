---
description: Process post-implementation feedback with interactive decisions
category: workflow
allowed-tools: Read, Grep, Glob, Write, Edit, Task, AskUserQuestion, Bash(stm:*), Bash(claudekit:status stm)
argument-hint: "<path-to-spec-file>"
---

# Process Post-Implementation Feedback

Process ONE specific piece of feedback from testing/usage with structured workflow including code exploration, optional research, interactive decisions, and spec updates.

## Command Syntax

```bash
/spec:feedback <path-to-spec-file>

# Example:
/spec:feedback specs/add-user-auth/02-specification.md
```

## Prerequisites

- Must have completed `/spec:execute` for the feature (04-implementation.md must exist)
- STM recommended but not required (graceful degradation)
- Feedback should be specific and actionable

## Workflow Steps

### Step 1: Validation & Setup

Extract the feature slug, validate prerequisites, check STM availability, and warn about incomplete tasks.

```markdown
1. Extract feature slug from spec path

   The spec path provided as argument must match one of these patterns:
   - Feature directory: `specs/<slug>/02-specification.md` → slug is `<slug>`
   - Legacy feature: `specs/feat-<slug>.md` → slug is `feat-<slug>`
   - Legacy bugfix: `specs/fix-<issue>-<desc>.md` → slug is `fix-<issue>-<desc>`

   Use Bash tool to extract:
   ```bash
   SPEC_PATH="<path-to-spec-file argument>"

   # Feature-directory format (preferred)
   if [[ "$SPEC_PATH" =~ ^specs/([^/]+)/02-specification\.md$ ]]; then
     SLUG="${BASH_REMATCH[1]}"
   # Legacy formats
   elif [[ "$SPEC_PATH" =~ ^specs/(feat|fix)-(.+)\.md$ ]]; then
     SLUG="${BASH_REMATCH[1]}-${BASH_REMATCH[2]}"
   else
     echo "❌ Error: Invalid spec path format"
     echo ""
     echo "Expected formats:"
     echo "  - specs/<slug>/02-specification.md (feature directory)"
     echo "  - specs/feat-<name>.md (legacy)"
     echo "  - specs/fix-<issue>-<desc>.md (legacy)"
     exit 1
   fi

   echo "✓ Feature slug: $SLUG"
   ```

2. Validate prerequisites - Check that implementation summary exists

   ```bash
   IMPL_FILE="specs/$SLUG/04-implementation.md"

   if [ ! -f "$IMPL_FILE" ]; then
     echo "❌ Error: No implementation found"
     echo ""
     echo "You must complete implementation before providing feedback."
     echo "Run: /spec:execute specs/$SLUG/02-specification.md"
     exit 1
   fi

   echo "✅ Implementation summary found"
   ```

3. Check STM availability (graceful degradation)

   ```bash
   STM_STATUS=$(claudekit status stm)
   STM_AVAILABLE=false

   if [[ "$STM_STATUS" == *"Available and initialized"* ]]; then
     STM_AVAILABLE=true
     echo "✅ STM available for task tracking"
   elif [[ "$STM_STATUS" == *"Available but not initialized"* ]]; then
     echo "⚠️  Warning: STM not initialized"
     echo "Run: stm init"
     echo "Continuing without STM task tracking..."
   else
     echo "⚠️  Warning: STM not installed"
     echo "Deferred feedback will be logged but not tracked in STM"
     echo "Install: npm install -g simple-task-master"
   fi
   ```

4. Check for incomplete tasks (if STM available)

   ```bash
   if [ "$STM_AVAILABLE" = true ]; then
     # Query STM for in-progress tasks
     INCOMPLETE_TASKS=$(stm list --tags "feature:$SLUG" --status in-progress -f json 2>/dev/null)
     INCOMPLETE_COUNT=$(echo "$INCOMPLETE_TASKS" | jq 'length' 2>/dev/null || echo "0")

     if [ "$INCOMPLETE_COUNT" -gt 0 ]; then
       echo ""
       echo "⚠️  Warning: You have $INCOMPLETE_COUNT task(s) still in progress"
       echo "Feedback changes may affect them."
       echo ""

       # Show the incomplete tasks
       echo "In-progress tasks:"
       echo "$INCOMPLETE_TASKS" | jq -r '.[] | "  - [\(.id)] \(.title)"' 2>/dev/null
       echo ""

       # Ask user to continue
       echo "Continue with feedback anyway? This may impact in-progress work."
       # Note: In practice, the user will see this and can decide to stop or continue
       # For now, we'll proceed but with the warning logged
     fi
   fi

   echo ""
   echo "═══════════════════════════════════════════════════"
   echo "Ready to process feedback for: $SLUG"
   echo "═══════════════════════════════════════════════════"
   echo ""
   ```

Store `$SLUG` and `$STM_AVAILABLE` for use in subsequent steps.
```

### Step 2: Feedback Collection

Prompt the user to provide ONE specific piece of feedback from their testing or usage.

```markdown
5. Prompt for feedback item

   Display clear instructions and examples to guide the user:

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

   Capture the user's feedback text. The user should provide their feedback at this point.

6. Validate feedback is not empty

   After receiving feedback, verify it's actionable:
   ```bash
   # Assuming FEEDBACK variable contains the user's input
   if [ -z "$FEEDBACK" ] || [ "$FEEDBACK" = "" ]; then
     echo "❌ Error: Feedback cannot be empty"
     echo "Please run the command again and provide specific feedback."
     exit 1
   fi

   # Basic validation
   WORD_COUNT=$(echo "$FEEDBACK" | wc -w)
   if [ "$WORD_COUNT" -lt 3 ]; then
     echo "⚠️  Warning: Feedback seems very short ($WORD_COUNT words)"
     echo "Consider providing more context for better analysis."
   fi

   echo "✓ Feedback received: ${FEEDBACK:0:100}..."
   echo ""
   ```

Store `$FEEDBACK` for use in Steps 3-7 (exploration, decisions, logging).
```

### Step 3: Code Exploration

Use Task agent with Explore subagent to investigate relevant code based on feedback.

```markdown
7. Read spec to identify affected components

   Use Read tool to extract the Detailed Design section from the spec:
   ```bash
   SPEC_FILE="specs/$SLUG/02-specification.md"
   ```

   Read the spec file and extract information about:
   - Components mentioned in Detailed Design section
   - File paths and locations
   - Dependencies and integrations
   - Current implementation details

   Store component information for exploration context.

8. Categorize feedback type

   Analyze the feedback to determine exploration focus:
   ```bash
   # Categorize feedback type for targeted exploration
   FEEDBACK_LOWER=$(echo "$FEEDBACK" | tr '[:upper:]' '[:lower:]')
   FEEDBACK_TYPE="general"

   if [[ "$FEEDBACK_LOWER" =~ (fail|error|crash|broken|doesn.?t work|bug) ]]; then
     FEEDBACK_TYPE="bug"
     EXPLORATION_FOCUS="Error handling, edge cases, validation logic, failure paths"
   elif [[ "$FEEDBACK_LOWER" =~ (slow|performance|lag|timeout|delay) ]]; then
     FEEDBACK_TYPE="performance"
     EXPLORATION_FOCUS="Performance bottlenecks, resource usage, optimization opportunities"
   elif [[ "$FEEDBACK_LOWER" =~ (ux|ui|confusing|unclear|hard to|difficult) ]]; then
     FEEDBACK_TYPE="ux"
     EXPLORATION_FOCUS="User interaction flows, UI components, feedback mechanisms"
   elif [[ "$FEEDBACK_LOWER" =~ (security|auth|permission|access) ]]; then
     FEEDBACK_TYPE="security"
     EXPLORATION_FOCUS="Security controls, authentication, authorization, input validation"
   else
     FEEDBACK_TYPE="general"
     EXPLORATION_FOCUS="Overall implementation, integration points, data flow"
   fi

   echo "Feedback categorized as: $FEEDBACK_TYPE"
   echo "Exploration focus: $EXPLORATION_FOCUS"
   echo ""
   ```

9. Launch Explore agent with targeted investigation

   Use Task tool to launch Explore subagent with context:
   ```
   Launch Explore agent with this investigation request:

   Context:
   - Feature: $SLUG
   - Feedback Type: $FEEDBACK_TYPE
   - Feedback Description: $FEEDBACK

   Affected Components (from spec):
   [List components extracted from Detailed Design section]

   Investigation Focus:
   $EXPLORATION_FOCUS

   Please conduct a QUICK but THOROUGH exploration to identify:
   1. Where in the code changes would be needed to address this feedback
   2. The blast radius (what other code might be affected)
   3. Related code that should be reviewed
   4. Any immediate concerns or risks

   Time limit: Aim for 3-5 minutes of exploration. Focus on actionable findings.
   ```

   The Explore agent will investigate the codebase and return findings.

10. Store exploration findings

    Capture the key findings from exploration:
    ```bash
    # Store exploration results (these will be gathered from agent output)
    EXPLORATION_FINDINGS=$(cat <<'EXPLORE_EOF'
    [Findings will include:]
    - Files/components requiring changes
    - Blast radius assessment
    - Related code to review
    - Immediate concerns or risks
    EXPLORE_EOF
    )

    echo "✓ Code exploration complete"
    echo ""
    ```

Store `$EXPLORATION_FINDINGS` for use in Steps 5 and 7.
```

### Step 4: Optional Research

Ask the user if they want research-expert consultation, and invoke if requested.

```markdown
11. Ask user if research is needed

    Use AskUserQuestion tool to offer research:
    ```
    Use AskUserQuestion with:

    Question: "Would you like the research-expert to investigate potential approaches and best practices for addressing this feedback?"

    Header: "Research"

    Options:
    1. Label: "Yes - Investigate approaches"
       Description: "Launch research-expert to analyze industry best practices, compare implementation approaches, and provide recommendations with trade-offs"

    2. Label: "No - Continue with findings"
       Description: "Skip research and proceed with the exploration findings already gathered"

    multiSelect: false
    ```

    Store the user's answer.

12. Launch research-expert if requested

    If user selected "Yes - Investigate approaches":
    ```bash
    # Conditionally launch research-expert
    if [[ "$RESEARCH_DECISION" == "Yes - Investigate approaches" ]]; then
      echo "Launching research-expert for investigation..."
      echo ""
    ```

    Use Task tool to launch research-expert agent:
    ```
    Launch research-expert agent with this research request:

    Research Topic: Approaches for addressing post-implementation feedback

    Context:
    - Feature: $SLUG
    - Feedback Type: $FEEDBACK_TYPE
    - Issue Description: $FEEDBACK

    Exploration Findings:
    $EXPLORATION_FINDINGS

    Research Objectives:
    1. Industry best practices for this type of issue
    2. Recommended approach with clear rationale
    3. Alternative approaches with trade-offs
    4. Security and performance considerations
    5. Common pitfalls to avoid

    Please provide concise, actionable recommendations focused on helping make an informed implementation decision.

    Time limit: Aim for 5-7 minutes of research. Focus on practical recommendations.
    ```

    The research-expert agent will investigate and return recommendations.

13. Store research findings

    Capture the research results:
    ```bash
      # Store research results (gathered from agent output)
      RESEARCH_FINDINGS=$(cat <<'RESEARCH_EOF'
      [Research findings will include:]
      - Industry best practices
      - Recommended approach with rationale
      - Alternative approaches with trade-offs
      - Security/performance considerations
      - Common pitfalls to avoid
      RESEARCH_EOF
      )

      echo "✓ Research investigation complete"
      echo ""
    else
      RESEARCH_FINDINGS="[Research skipped by user]"
      echo "✓ Continuing without research"
      echo ""
    fi
    ```

Store `$RESEARCH_FINDINGS` for use in Steps 5 and 7.
```

### Step 5: Interactive Decisions

Present findings and gather user decisions with batched questions.

```markdown
14. Display findings summary

    Present the exploration and research findings to the user:
    ```
    ═══════════════════════════════════════════════════════════
                      FINDINGS SUMMARY
    ═══════════════════════════════════════════════════════════

    Feedback: $FEEDBACK

    Type: $FEEDBACK_TYPE

    --- CODE EXPLORATION FINDINGS ---
    $EXPLORATION_FINDINGS

    --- RESEARCH FINDINGS ---
    $RESEARCH_FINDINGS

    ═══════════════════════════════════════════════════════════
    Now let's decide how to proceed...
    ```

15. Gather decisions with batched questions

    Use AskUserQuestion tool with 4 batched questions:
    ```
    Use AskUserQuestion with these 4 questions:

    Question 1:
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

    Question 2:
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

    Question 3:
    - question: "Which implementation approach should be used?"
    - header: "Approach"
    - multiSelect: false
    - options:
      [Dynamic options based on research findings and exploration]
      - If research was performed: List recommended approach + alternatives from research
      - If research was skipped: List approach options from exploration findings
      Example options:
      1. label: "Recommended: [Approach Name]"
         description: "[Brief description from research/exploration]"
      2. label: "Alternative: [Approach Name]"
         description: "[Brief description with key trade-off]"
      3. label: "Custom approach"
         description: "Describe a different approach not listed above"

    Question 4:
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

16. Store and validate decisions

    Process the answers from AskUserQuestion:
    ```bash
    # Store all decisions in associative array
    declare -A DECISIONS
    DECISIONS[action]="[Answer to Question 1]"
    DECISIONS[scope]="[Answer to Question 2]"
    DECISIONS[approach]="[Answer to Question 3]"
    DECISIONS[priority]="[Answer to Question 4]"

    # Validate decisions are consistent
    # Note: Questions 2-3 should only be answered if Question 1 = "Implement now"
    # Question 4 should be answered for both "Implement now" and "Defer"

    echo "✓ Decisions captured"
    echo "  Action: ${DECISIONS[action]}"
    echo "  Scope: ${DECISIONS[scope]}"
    echo "  Approach: ${DECISIONS[approach]}"
    echo "  Priority: ${DECISIONS[priority]}"
    echo ""
    ```

Store `$DECISIONS` associative array for use in Steps 6 and 7.

Note: Questions 2-3 are conditional - they should be presented/answered only when Question 1 = "Implement now". Question 4 should be presented when Question 1 is "Implement now" OR "Defer".
```

### Step 6: Execute Actions

Execute the appropriate actions based on the user's decision.

```markdown
17. Branch based on action decision

    Route to the appropriate action handler:
    ```bash
    ACTION="${DECISIONS[action]}"

    echo "Processing action: $ACTION"
    echo ""

    case "$ACTION" in
      "Implement now")
        # Proceed to spec changelog update (step 17a)
        ;;
      "Defer")
        # Proceed to deferred task creation (step 17b)
        ;;
      "Out of scope")
        # Only log, no further action needed
        echo "✓ Feedback will be logged as out of scope"
        echo "No spec or task changes required"
        echo ""
        ;;
      *)
        echo "❌ Error: Unknown action '$ACTION'"
        exit 1
        ;;
    esac
    ```

17a. Update spec changelog (if "Implement now")

    Add changelog entry to the specification:
    ```bash
    if [ "$ACTION" = "Implement now" ]; then
      echo "Updating specification changelog..."

      SPEC_FILE="specs/$SLUG/02-specification.md"
      CHANGELOG_DATE=$(date +"%Y-%m-%d")

      # Check if spec has a Changelog section
      if ! grep -q "^## 18\. Changelog" "$SPEC_FILE" && ! grep -q "^## Changelog" "$SPEC_FILE"; then
        # Create Changelog section
        echo "" >> "$SPEC_FILE"
        echo "## 18. Changelog" >> "$SPEC_FILE"
        echo "" >> "$SPEC_FILE"
        echo "Track specification updates and their rationale." >> "$SPEC_FILE"
        echo "" >> "$SPEC_FILE"
        echo "✓ Created Changelog section in spec"
      fi
    ```

    Use Edit tool to append the changelog entry:
    ```
    Append to the Changelog section:

    ### $CHANGELOG_DATE - Post-Implementation Feedback

    **Source:** Feedback #[N] (see specs/$SLUG/05-feedback.md)

    **Issue:** $FEEDBACK

    **Decision:** ${DECISIONS[action]} with ${DECISIONS[scope]} scope

    **Changes to Specification:**
    [Based on exploration findings, list the specific sections that need updates]
    - Section X: [Description of change needed]
    - Section Y: [Description of change needed]

    **Implementation Impact:**
    - Priority: ${DECISIONS[priority]}
    - Approach: ${DECISIONS[approach]}
    - Affected components: [List from exploration findings]
    - Estimated blast radius: [From exploration findings]

    **Next Steps:**
    1. Review and update the affected specification sections above
    2. Run `/spec:decompose specs/$SLUG/02-specification.md` to update task breakdown
    3. Run `/spec:execute specs/$SLUG/02-specification.md` to implement changes
    ```

    Complete the update:
    ```bash
      echo "✅ Spec changelog updated"
      echo ""
      echo "Next steps:"
      echo "  1. Review and update the affected spec sections listed in the changelog"
      echo "  2. Run: /spec:decompose specs/$SLUG/02-specification.md"
      echo "  3. Run: /spec:execute specs/$SLUG/02-specification.md"
      echo ""
    fi
    ```

17b. Create deferred task (if "Defer" and STM available)

    Create an STM task for deferred feedback:
    ```bash
    if [ "$ACTION" = "Defer" ]; then
      if [ "$STM_AVAILABLE" = true ]; then
        echo "Creating deferred task in STM..."

        # Create task title from feedback (first 80 chars)
        TASK_TITLE=$(echo "$FEEDBACK" | head -c 80)
        if [ ${#FEEDBACK} -gt 80 ]; then
          TASK_TITLE="${TASK_TITLE}..."
        fi

        # Priority mapping
        PRIORITY_LOWER=$(echo "${DECISIONS[priority]}" | tr '[:upper:]' '[:lower:]')

        # Build full task details
        TASK_DETAILS=$(cat <<TASK_EOF
    **Feedback:** $FEEDBACK

    **Type:** $FEEDBACK_TYPE

    **Exploration Findings:**
    $EXPLORATION_FINDINGS

    **Research Insights:**
    $RESEARCH_FINDINGS

    **Recommended Approach:** ${DECISIONS[approach]}

    **Implementation Scope:** ${DECISIONS[scope]}

    **When Implementing:**
    1. Update spec changelog and affected sections
    2. Run /spec:decompose to update tasks
    3. Run /spec:execute to implement changes

    **Reference:** See specs/$SLUG/05-feedback.md for full context
    TASK_EOF
    )

        # Create the STM task
        TASK_ID=$(stm add "$TASK_TITLE" \
          --details "$TASK_DETAILS" \
          --tags "feature:$SLUG,feedback,deferred,$PRIORITY_LOWER" \
          --status pending \
          --format json | jq -r '.id')

        if [ -n "$TASK_ID" ] && [ "$TASK_ID" != "null" ]; then
          echo "✅ Deferred task created: #$TASK_ID"
          echo ""
          echo "Task details:"
          echo "  Title: $TASK_TITLE"
          echo "  Tags: feature:$SLUG, feedback, deferred, $PRIORITY_LOWER"
          echo "  Priority: ${DECISIONS[priority]}"
          echo ""
          echo "View task: stm show $TASK_ID"
          echo "List deferred feedback: stm list --tags feature:$SLUG,feedback,deferred"
          echo ""

          # Store task ID for feedback log
          DEFERRED_TASK_ID=$TASK_ID
        else
          echo "❌ Error: Failed to create STM task"
          DEFERRED_TASK_ID=""
        fi
      else
        echo "⚠️  STM not available - task cannot be created"
        echo "Feedback will be logged in 05-feedback.md only"
        echo ""
        DEFERRED_TASK_ID=""
      fi
    fi
    ```

Store `$DEFERRED_TASK_ID` for use in Step 7.
```

### Step 7: Update Feedback Log

Create or update the feedback log with a complete entry for this feedback item.

```markdown
18. Determine next feedback number

    Calculate the next feedback number:
    ```bash
    FEEDBACK_LOG="specs/$SLUG/05-feedback.md"
    FEEDBACK_NUMBER=1

    if [ -f "$FEEDBACK_LOG" ]; then
      # Extract existing feedback numbers (format: ## Feedback #N)
      LAST_NUMBER=$(grep -E "^## Feedback #[0-9]+" "$FEEDBACK_LOG" | \
                    sed -E 's/^## Feedback #([0-9]+).*/\1/' | \
                    sort -n | \
                    tail -1)

      if [ -n "$LAST_NUMBER" ]; then
        FEEDBACK_NUMBER=$((LAST_NUMBER + 1))
      fi
    fi

    echo "This will be Feedback #$FEEDBACK_NUMBER"
    ```

19. Create or update feedback log file

    Generate the complete log entry:
    ```bash
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

    # Determine status for display
    case "$ACTION" in
      "Implement now")
        STATUS="Accepted - Implementation in progress"
        ;;
      "Defer")
        STATUS="Deferred - Logged for future consideration"
        ;;
      "Out of scope")
        STATUS="Out of scope - Logged only"
        ;;
    esac

    # Build the feedback entry
    FEEDBACK_ENTRY=$(cat <<FEEDBACK_EOF

## Feedback #$FEEDBACK_NUMBER

**Date:** $TIMESTAMP
**Status:** $STATUS
**Type:** $FEEDBACK_TYPE
**Priority:** ${DECISIONS[priority]}

### Description

$FEEDBACK

### Code Exploration Findings

$EXPLORATION_FINDINGS

### Research Findings

$RESEARCH_FINDINGS

### Decisions

- **Action:** ${DECISIONS[action]}
- **Scope:** ${DECISIONS[scope]}
- **Approach:** ${DECISIONS[approach]}
- **Priority:** ${DECISIONS[priority]}

### Actions Taken

FEEDBACK_EOF
    )

    # Add action-specific details
    if [ "$ACTION" = "Implement now" ]; then
      FEEDBACK_ENTRY="$FEEDBACK_ENTRY
- Updated specification changelog (Section 18)
- Next steps: Update spec sections → /spec:decompose → /spec:execute"
    elif [ "$ACTION" = "Defer" ] && [ -n "$DEFERRED_TASK_ID" ]; then
      FEEDBACK_ENTRY="$FEEDBACK_ENTRY
- Created STM task #$DEFERRED_TASK_ID
- Tagged with: feature:$SLUG, feedback, deferred, $PRIORITY_LOWER
- View with: stm show $DEFERRED_TASK_ID"
    elif [ "$ACTION" = "Defer" ]; then
      FEEDBACK_ENTRY="$FEEDBACK_ENTRY
- Logged for future consideration
- Note: STM not available, task not created"
    else
      FEEDBACK_ENTRY="$FEEDBACK_ENTRY
- Logged as out of scope
- No further action planned"
    fi

    # Add rationale
    FEEDBACK_ENTRY="$FEEDBACK_ENTRY

### Rationale

This feedback was addressed through the /spec:feedback workflow:
1. Code exploration identified affected components and blast radius
2. ${RESEARCH_FINDINGS:0:50}... research ${RESEARCH_FINDINGS:+was performed}${RESEARCH_FINDINGS:-was skipped}
3. Interactive decision process resulted in: ${DECISIONS[action]}
4. ${STATUS}

---
"
    ```

20. Write the feedback log

    Use Write or Edit tool to update the log:
    ```bash
    if [ ! -f "$FEEDBACK_LOG" ]; then
      # Create new feedback log with header
      HEADER=$(cat <<HEADER_EOF
# Feedback Log

Post-implementation feedback, analysis, and decisions for the $SLUG feature.

Each feedback item includes:
- Description of the issue or improvement
- Code exploration and research findings
- Interactive decision results
- Actions taken (spec updates, deferred tasks, or out-of-scope logging)

---
HEADER_EOF
      )
    ```

    Use Write tool to create the file:
    ```
    Write to: $FEEDBACK_LOG
    Content: $HEADER$FEEDBACK_ENTRY
    ```

    If file exists, use Edit tool to append:
    ```
    Append to: $FEEDBACK_LOG
    Content: $FEEDBACK_ENTRY
    ```

    Complete the logging:
    ```bash
      echo "✅ Feedback log updated: $FEEDBACK_LOG"
      echo ""
    else
      # Append to existing file
    ```

    Use Edit tool to append the entry, then:
    ```bash
      echo "✅ Feedback log updated: $FEEDBACK_LOG"
      echo ""
    fi
    ```

21. Display summary

    Show comprehensive summary of what was done:
    ```bash
    echo "═══════════════════════════════════════════════════════════"
    echo "              FEEDBACK PROCESSING COMPLETE"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "Feedback #$FEEDBACK_NUMBER processed successfully"
    echo ""
    echo "Decision: ${DECISIONS[action]}"
    echo "Priority: ${DECISIONS[priority]}"
    echo ""
    echo "Files Updated:"
    echo "  - $FEEDBACK_LOG"

    if [ "$ACTION" = "Implement now" ]; then
      echo "  - specs/$SLUG/02-specification.md (changelog)"
      echo ""
      echo "Next Steps:"
      echo "  1. Review the changelog entry in the spec"
      echo "  2. Update the affected specification sections"
      echo "  3. Run: /spec:decompose specs/$SLUG/02-specification.md"
      echo "  4. Run: /spec:execute specs/$SLUG/02-specification.md"
    elif [ "$ACTION" = "Defer" ] && [ -n "$DEFERRED_TASK_ID" ]; then
      echo ""
      echo "STM Task Created: #$DEFERRED_TASK_ID"
      echo ""
      echo "Query Commands:"
      echo "  - View task: stm show $DEFERRED_TASK_ID"
      echo "  - List all deferred feedback: stm list --tags feature:$SLUG,feedback,deferred"
      echo "  - List by priority: stm list --tags feature:$SLUG,feedback,deferred,$PRIORITY_LOWER"
    else
      echo ""
      echo "No further action required."
    fi

    echo ""
    echo "View feedback log: $FEEDBACK_LOG"
    echo "═══════════════════════════════════════════════════════════"
    ```
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
