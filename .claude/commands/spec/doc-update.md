---
description: Review documentation for updates needed based on a spec file
allowed-tools: Task, Read, Glob
argument-hint: "<path-to-spec-file>"
category: workflow
---

# Documentation Update Review Based on Spec

You are tasked with reviewing all documentation to identify what needs to be updated based on a new specification file.

## Step 1: Read the Specification

Read the specification file provided by the user: `{{ARGUMENT}}`

Analyze the spec to identify:
1. **Deprecated functionality** - Features, APIs, components explicitly marked as deprecated or removed
2. **Changed functionality** - Modified behaviors, interfaces, or workflows
3. **New functionality** - Added features, components, or capabilities that should be documented

## Step 2: Gather All Documentation Files

Use the Glob tool to find all markdown files in:
- Root directory: `*.md`
- Developer guides: `developer-guides/*.md`

## Step 3: Launch Parallel Documentation Expert Agents

**IMPORTANT**: Launch ALL agents in a SINGLE message using multiple Task tool calls to maximize parallelization.

For each documentation file found, launch a separate `documentation-expert` agent with this prompt template:

```
Review the documentation file [FILENAME] for updates needed based on the specification at {{ARGUMENT}}.

Spec summary:
[Include a 3-5 sentence summary of key changes from the spec: deprecated features, changed functionality, new features]

Review [FILENAME] and identify:

1. **Deprecated Content** - Sections documenting functionality explicitly deprecated/removed by the spec
   - Quote the specific documentation text
   - Reference the spec section that deprecates it
   - Severity: CRITICAL (users would break) or WARNING (just outdated)

2. **Content Requiring Updates** - Sections needing modification due to spec changes
   - Quote the current documentation text
   - Explain what changed per the spec
   - Suggest the updated wording

3. **Missing Content** - New functionality from the spec that should be documented here
   - Reference the spec section describing new functionality
   - Suggest where to add it (which section, after which heading)
   - Draft suggested documentation text

## Output Format

### [FILENAME]

#### Deprecated Content
- **Location**: [section name or line reference]
- **Current Text**: [quote]
- **Reason**: [spec reference]
- **Severity**: CRITICAL | WARNING

#### Content Requiring Updates
- **Location**: [section name or line reference]
- **Current Text**: [quote]
- **Required Change**: [explanation based on spec]
- **Suggested Update**: [new wording]

#### Missing Content
- **Spec Feature**: [feature name from spec]
- **Suggested Placement**: [after which heading/section]
- **Draft Content**: [suggested documentation text]

## Priority Summary for this File

- P0 (Critical): [count] - Deprecated features still documented as current
- P1 (High): [count] - Incorrect documentation that would mislead users
- P2 (Medium): [count] - Missing documentation for new features
- P3 (Low): [count] - Minor clarifications or improvements

If the file requires no updates, respond with: "[FILENAME]: No updates required."
```

**Example of parallel launch** (in a single message):
- Agent 1: Review README.md
- Agent 2: Review CLAUDE.md
- Agent 3: Review TESTING.md
- Agent 4: Review developer-guides/system-overview.md
- Agent 5: Review developer-guides/cli-pipeline-executor.md
- ... (one agent per file)

## Step 4: Consolidate Results

After ALL agents complete (they run in parallel):

1. **Aggregate findings** from all agent reports
2. **Create summary table**:
   ```
   | File | P0 | P1 | P2 | P3 | Status |
   |------|----|----|----|----|--------|
   | README.md | 2 | 1 | 3 | 0 | Needs updates |
   | CLAUDE.md | 0 | 0 | 1 | 2 | Minor updates |
   ...
   ```

3. **Present detailed findings** organized by priority:
   - Start with P0 (Critical) across all files
   - Then P1 (High), P2 (Medium), P3 (Low)

4. **Provide recommendations**:
   - Which files need immediate attention
   - Suggested order of updates
   - Estimated effort for each file

5. **Ask the user** if they want you to implement any of the suggested updates

---

**Usage Example:**
```bash
/spec:doc-update specs/text-generator-spec.md
```
