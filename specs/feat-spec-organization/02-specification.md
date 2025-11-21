# Spec Organization Reorganization Plan

**Created:** 2025-11-21
**Status:** Implementation in progress

## Problem Statement

Currently, documents related to a single feature/bugfix are scattered across multiple directories:

```
docs/ideation/<slug>.md          # Created by /ideate
specs/<slug>.md                   # Created by /spec:create (via /ideate-to-spec)
specs/<slug>-tasks.md             # Created by /spec:decompose
IMPLEMENTATION_SUMMARY.md         # Sometimes created by /spec:execute (inconsistent)
```

This makes it difficult to:
- Find all related documents for a feature
- Track the lifecycle of a feature
- Maintain organization as projects grow
- Version control feature documentation

## Solution: Feature-Based Directory Structure

### New Structure

```
specs/
└── <feature-slug>/
    ├── 01-ideation.md
    ├── 02-specification.md
    ├── 03-tasks.md
    └── 04-implementation.md
```

### Benefits

1. **Single source of truth** - All documents for a feature in one directory
2. **Clear lifecycle** - Numbered prefixes show workflow progression
3. **Easy navigation** - `ls specs/my-feature/` shows entire lifecycle
4. **No conflicts** - Each feature has its own namespace
5. **Git-friendly** - Easy to track changes per feature
6. **Clean root** - No more stray IMPLEMENTATION_SUMMARY.md files
7. **STM integration** - Tasks tagged with feature slug for easy filtering

## Current Workflow

```
/ideate <task-brief>
   ↓
   Creates: docs/ideation/<slug>.md
   ↓
/ideate-to-spec docs/ideation/<slug>.md
   ↓
   • Reads ideation doc
   • Gathers user decisions interactively
   • Calls: /spec:create (creates specs/<slug>.md)
   • Calls: /spec:validate (validates it)
   • Returns summary with next steps
   ↓
/spec:decompose specs/<slug>.md
   ↓
   Creates: specs/<slug>-tasks.md + STM tasks
   ↓
/spec:execute specs/<slug>.md
   ↓
   Implements tasks, may create IMPLEMENTATION_SUMMARY.md
   ↓
stm list --pretty
   ↓
   Track progress
```

## New Workflow

```
/ideate <task-brief>
   ↓
   Creates: specs/<slug>/01-ideation.md
   ↓
/ideate-to-spec specs/<slug>/01-ideation.md
   ↓
   • Extract slug from ideation path
   • Read ideation doc & gather decisions
   • Call /spec:create with output path: specs/<slug>/02-specification.md
   • Call /spec:validate specs/<slug>/02-specification.md
   • Return summary
   ↓
/spec:decompose specs/<slug>/02-specification.md
   ↓
   Creates: specs/<slug>/03-tasks.md + STM tasks (with slug metadata)
   ↓
/spec:execute specs/<slug>/02-specification.md
   ↓
   Implements tasks
   Creates: specs/<slug>/04-implementation.md
   ↓
stm list --pretty --tag feature:<slug>
   ↓
   Track progress for specific feature
```

## Implementation Plan

### 1. Create Slug Extraction Helper

Add to all commands that need it:

```bash
# Helper function to extract slug from path
extract_slug() {
  local path="$1"
  # specs/<slug>/01-ideation.md → <slug>
  # specs/<slug>/02-specification.md → <slug>
  # specs/feat-foo.md (legacy) → feat-foo
  if [[ "$path" =~ specs/([^/]+)/ ]]; then
    echo "${BASH_REMATCH[1]}"
  elif [[ "$path" =~ specs/([^/]+)\.md ]]; then
    echo "${BASH_REMATCH[1]}"
  fi
}
```

### 2. Update `/ideate` Command

**File:** `.claude/commands/ideate.md`

**Changes:**
- Change output path from `docs/ideation/<slug>.md` to `specs/<slug>/01-ideation.md`
- Add directory creation: `mkdir -p specs/<slug>`
- Generate slug from task brief (kebab-case)

### 3. Update `/ideate-to-spec` Command

**File:** `.claude/commands/ideate-to-spec.md`

**Changes:**
- **Step 1:** Add slug extraction from ideation path
- **Step 5:** Pass output path to `/spec:create`: `specs/<slug>/02-specification.md`
- **Step 6:** Call `/spec:validate` with explicit path: `specs/<slug>/02-specification.md`
- **Step 7:** Update summary to reference new paths

### 4. Override `/spec:create` Command

**File:** `.claude/commands/spec/create.md` (override ClaudeKit)

**Changes:**
- Detect if output path is specified (from /ideate-to-spec)
- If not specified, use legacy path for backward compatibility
- Remove filename generation logic (path comes from caller)
- Update documentation sections to reference new structure

### 5. Override `/spec:decompose` Command

**File:** `.claude/commands/spec/decompose.md` (override ClaudeKit)

**Changes:**
- Extract slug from spec path
- Change output path to `specs/<slug>/03-tasks.md`
- Add STM task tagging: `--tags "feature:<slug>,phase1,..."`
- Support legacy paths for backward compatibility

### 6. Override `/spec:execute` Command

**File:** `.claude/commands/spec/execute.md` (override ClaudeKit)

**Changes:**
- Extract slug from spec path
- Create implementation summary at `specs/<slug>/04-implementation.md`
- Include task completion status, files modified, tests added
- Filter STM tasks by feature tag: `stm list --tag feature:<slug>`

## Backward Compatibility

All commands will support legacy paths:
- `specs/feat-<slug>.md` (legacy spec format)
- `specs/<slug>-tasks.md` (legacy tasks format)
- `docs/ideation/<slug>.md` (legacy ideation format)

Commands will detect format and adapt behavior accordingly.

## Migration Strategy

Create `.claude/commands/spec/migrate.md` to help migrate existing specs:

1. Find all specs in `specs/*.md`
2. For each spec:
   - Extract slug from filename
   - Create `specs/<slug>/` directory
   - Move spec to `specs/<slug>/02-specification.md`
   - Move tasks file to `specs/<slug>/03-tasks.md` (if exists)
   - Find and move related ideation doc to `specs/<slug>/01-ideation.md`
   - Update STM tasks with feature tag

## Testing Plan

1. Test new workflow with fresh feature
2. Test backward compatibility with legacy paths
3. Test migration command with existing specs
4. Verify STM integration and tagging
5. Confirm all commands work together end-to-end

## Rollout Steps

1. ✅ Document plan (this file)
2. ⏳ Create all command overrides
3. ⏳ Test with new feature
4. ⏳ Create migration command
5. ⏳ Migrate existing specs
6. ⏳ Update README.md to reflect new structure
7. ⏳ Update documentation examples

## Files to Create/Modify

### Create (Command Overrides)
- `.claude/commands/spec/create.md`
- `.claude/commands/spec/decompose.md`
- `.claude/commands/spec/execute.md`
- `.claude/commands/spec/migrate.md`

### Modify (Existing Custom Commands)
- `.claude/commands/ideate.md`
- `.claude/commands/ideate-to-spec.md`

### Update (Documentation)
- `README.md` - Update workflow examples
- `.claude/README.md` - Update command documentation

## Key Design Decisions

1. **Feature directory under specs/** - Keeps all specs together, avoids top-level clutter
2. **Numbered prefixes** - Makes lifecycle progression obvious
3. **STM feature tags** - Enables filtering tasks by feature
4. **Backward compatibility** - Doesn't break existing workflows
5. **Slug extraction** - Consistent slug naming across all documents
6. **Directory creation** - Commands create directories as needed

## Success Criteria

- ✅ All related documents in one directory per feature
- ✅ Commands work seamlessly with new structure
- ✅ Legacy paths still work (backward compatible)
- ✅ STM tasks properly tagged with feature slug
- ✅ Implementation summary consistently created
- ✅ Easy to find and navigate feature documentation
- ✅ README accurately documents new workflow

## Notes

- **Purpose of tasks.md**: It's a comprehensive reference document that preserves the full task breakdown with implementation details, dependencies, and acceptance criteria. It serves as the authoritative source that gets copied into STM tasks.

- **STM Integration**: The decompose command copies ALL content from the task breakdown into STM tasks using heredocs or temp files to preserve formatting. Each STM task should be self-contained with complete implementation details.

- **Implementation Summary**: Previously inconsistent, now will always be created at `specs/<slug>/04-implementation.md` with structured content about what was implemented.
