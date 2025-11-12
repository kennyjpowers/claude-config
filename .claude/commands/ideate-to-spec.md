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

### Step 1: Read & Synthesize Ideation Document

1. Read the ideation document at the provided path
2. Extract and synthesize:
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

   Proceeding with /spec:create...
   ```

2. **Execute `/spec:create`** with the constructed prompt from Step 4

3. **Capture the spec file path** from the command output

### Step 6: Validate the Specification

1. **Execute `/spec:validate`** on the newly created spec file

2. **Capture validation results:**
   - Completeness score
   - Missing elements (if any)
   - Validation warnings or recommendations
   - Implementation readiness assessment

### Step 7: Present Summary & Next Steps

Create a comprehensive summary for the user:

```markdown
## Specification Summary

**Spec Location:** {path/to/spec.md}
**Validation Status:** {PASS/NEEDS_WORK}
**Completeness Score:** {score}/10

### What Was Specified

1. {Key feature/fix described}
2. {Technical approach chosen}
3. {Implementation scope}

### Decisions Made

{List all decisions from Step 2 with user's choices}

### Validation Results

{Summary of /spec:validate output}

### Remaining Decisions (if any)

{List any decisions that still need to be made before implementation}
- [ ] {Decision 1}
- [ ] {Decision 2}

### Recommended Next Steps

1. [ ] Review the specification at {spec-path}
2. [ ] {If validation failed: Address validation feedback}
3. [ ] {If validation passed: Execute with /spec:execute {spec-path}}
4. [ ] {Any follow-up specs needed}

### Deferred Work

{Any items explicitly deferred during ideation or spec creation}
```

---

## Example Usage

```bash
/ideate-to-spec docs/ideation/add-proxy-config-to-figma-plugin.md
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
