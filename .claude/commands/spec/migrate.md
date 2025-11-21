---
description: Migrate existing specs to feature-directory structure
category: validation
allowed-tools: Read, Write, Bash(mv:*), Bash(mkdir:*), Bash(ls:*), Bash(find:*), Bash(basename:*), Bash(dirname:*), Glob, Grep
---

# Migrate Specs to New Directory Structure

This command migrates existing specification documents from the old flat structure to the new feature-based directory structure.

## Old Structure vs New Structure

**Old:**
```
docs/ideation/<slug>.md
specs/<slug>.md
specs/<slug>-tasks.md
IMPLEMENTATION_SUMMARY.md
```

**New:**
```
specs/<slug>/
├── 01-ideation.md
├── 02-specification.md
├── 03-tasks.md
└── 04-implementation.md
```

## Migration Process

### Step 1: Discover Existing Specs

Find all spec files in the specs/ directory:
```bash
ls -1 specs/*.md 2>/dev/null || echo "No specs found"
```

For each spec file found, extract the slug from the filename:
- `specs/feat-user-auth.md` → slug is `feat-user-auth`
- `specs/fix-123-bug.md` → slug is `fix-123-bug`

### Step 2: For Each Spec, Perform Migration

For each spec file (e.g., `specs/feat-user-auth.md`):

1. **Extract slug** from filename
2. **Create feature directory:** `mkdir -p specs/<slug>`
3. **Move spec file:**
   ```bash
   mv specs/<slug>.md specs/<slug>/02-specification.md
   ```
4. **Move tasks file if exists:**
   ```bash
   if [ -f specs/<slug>-tasks.md ]; then
     mv specs/<slug>-tasks.md specs/<slug>/03-tasks.md
   fi
   ```
5. **Search for related ideation doc:**
   - Check `docs/ideation/<slug>.md`
   - If found, move to `specs/<slug>/01-ideation.md`
   ```bash
   if [ -f docs/ideation/<slug>.md ]; then
     mv docs/ideation/<slug>.md specs/<slug>/01-ideation.md
   fi
   ```
6. **Look for implementation summary:**
   - Check for `IMPLEMENTATION_SUMMARY.md` in root
   - Check if it mentions this spec/feature
   - If related, move to `specs/<slug>/04-implementation.md`

### Step 3: Update STM Tasks (if STM is installed)

For specs that have been decomposed:

1. **Check if STM is available:** `command -v stm`
2. **Find tasks related to this spec:**
   - Search task titles for the slug
   - Look for tasks that reference the old spec path
3. **Add feature tag to tasks:**
   ```bash
   # For each related task ID
   stm update <task-id> --add-tags "feature:<slug>"
   ```

### Step 4: Report Migration Results

Create a migration summary showing:
- Total specs migrated
- Files moved for each spec
- Any specs that couldn't be fully migrated
- Any orphaned files found (no matching spec)
- STM tasks updated (if applicable)

## Safety Checks

Before migrating:
- ✅ Verify specs/ directory exists
- ✅ Check for uncommitted git changes (warn user)
- ✅ Confirm user wants to proceed with migration

After migrating:
- ✅ Verify all expected files exist in new locations
- ✅ Check for any broken references in spec files
- ✅ Suggest running git status to review changes

## Example Usage

```bash
/spec:migrate
```

This will:
1. Scan for all existing specs
2. Migrate each to the new structure
3. Update STM tasks with feature tags
4. Generate migration report

## Migration Report Format

```markdown
# Spec Migration Report

**Date:** {current-date}
**Specs Migrated:** {count}

## Successful Migrations

### feat-user-auth
- ✅ Spec: specs/feat-user-auth.md → specs/feat-user-auth/02-specification.md
- ✅ Tasks: specs/feat-user-auth-tasks.md → specs/feat-user-auth/03-tasks.md
- ✅ Ideation: docs/ideation/feat-user-auth.md → specs/feat-user-auth/01-ideation.md
- ✅ STM tasks: 5 tasks tagged with feature:feat-user-auth

### fix-bug-scroll
- ✅ Spec: specs/fix-bug-scroll.md → specs/fix-bug-scroll/02-specification.md
- ⚠️ Tasks: Not found
- ⚠️ Ideation: Not found
- ⚠️ STM tasks: None found

## Issues

- ⚠️ IMPLEMENTATION_SUMMARY.md found but couldn't determine which feature it belongs to
- ⚠️ specs/old-draft.md doesn't match naming convention - skipped

## Next Steps

1. Review migrated files: `ls -la specs/*/`
2. Check git status: `git status`
3. Commit migration: `git add specs/ && git commit -m "Migrate specs to feature-directory structure"`
4. Remove empty directories: `rmdir docs/ideation` (if empty)
```

## Rollback

If migration needs to be rolled back:
```bash
git restore specs/
git restore docs/ideation/
```

Or manually move files back:
```bash
# For each feature directory
mv specs/<slug>/02-specification.md specs/<slug>.md
mv specs/<slug>/03-tasks.md specs/<slug>-tasks.md
mv specs/<slug>/01-ideation.md docs/ideation/<slug>.md
rmdir specs/<slug>
```
