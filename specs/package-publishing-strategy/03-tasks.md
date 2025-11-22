# Task Breakdown: Transform claude-config into npm Package "claudeflow"

**Generated:** 2025-11-21
**Source:** specs/package-publishing-strategy/02-specification.md
**Last Decompose:** 2025-11-21

---

## Re-decompose Metadata

### Decompose History
| Session | Date | Mode | Changelog Entries | New Tasks | Notes |
|---------|------|------|-------------------|-----------|-------|
| 1 | 2025-11-21 | Full | N/A | 18 | Initial decomposition |
| 2 | 2025-11-21 | Incremental | 1 | 4 | npm Trusted Publishers (OIDC) migration |
| 3 | 2025-11-21 | Incremental | 1 | 1 | ClaudeKit setup flag fix |
| 4 | 2025-11-21 | Incremental | 1 | 1 | Update notification interval change |

### Current Session Details
- **Mode**: Incremental
- **Previous Decompose**: 2025-11-21 (Session 3)
- **Current Decompose**: 2025-11-21 (Session 4)
- **Changelog Entries Processed**: 1

### Changelog Entries (New Since Last Decompose)

#### Entry 1: Update Notification Interval Change
- **Date**: 2025-11-21
- **Issue**: Update notifications not displaying when running v1.0.1 with v1.1.0 published on npm
- **Decision**: Implement with minimal scope
- **Changes to Specification**:
  - Section 5.1: bin/claudeflow.js (Entry Point) - Line 289 update
  - Change from: `updateCheckInterval: 1000 * 60 * 60 * 24` (24 hours)
  - Change to: `updateCheckInterval: 1000 * 60 * 60 * 24 * 7` (7 days)
  - Rationale: Align with industry standard (npm, yarn, pnpm use 7-day intervals)
- **Implementation Impact**:
  - **Priority**: Low
  - **Affected Components**: bin/claudeflow.js (updateCheckInterval parameter, line 289)
  - **Blast Radius**: LOW - Single file, one parameter change, no downstream dependencies
  - **Approach**: Update interval to weekly standard
- **Action**: Create Task 1.24 for the update

### Task Changes Summary
- **Preserved**: 23 tasks (completed, no changes needed)
- **Updated**: 0 tasks
- **Created**: 1 task (1.24 - Update notification interval change)
- **Total**: 24 tasks

### Existing Tasks Status

#### Phase 1: Core npm Package Setup (24 tasks)
- Task 1.1: Create package.json ✅ DONE
- Task 1.2: Create LICENSE file ✅ DONE
- Task 1.3: Create .npmignore file ✅ DONE
- Task 1.4: Update .claude-plugin/plugin.json ✅ DONE
- Task 1.5: Implement bin/claudeflow.js ✅ DONE
- Task 1.6: Implement lib/setup.js ✅ DONE
- Task 1.7: Implement lib/doctor.js ✅ DONE
- Task 1.8: Create directory structure ✅ DONE
- Task 1.9: Create scripts/verify-files.js ✅ DONE
- Task 1.10: Update README.md ✅ DONE
- Task 1.11: Update CHANGELOG.md ✅ DONE
- Task 1.12: Create .github/workflows/release.yml ✅ DONE
- Task 1.13: Create .releaserc.json ✅ DONE
- Task 1.14: Remove install.sh ✅ DONE
- Task 1.15: Test package locally with npm pack ✅ DONE
- Task 1.16: Publish to npm with provenance ✅ DONE
- Task 1.17: Configure npm account for trusted publishers ✅ DONE
- Task 1.18: Perform initial token-based publish ✅ DONE
- Task 1.19: Switch to OIDC publishing ✅ DONE
- Task 1.20: Verify OIDC provenance attestation ✅ DONE
- Task 1.21: Verify installation from npm ✅ DONE
- Task 1.22: Notify ClaudeKit maintainer ✅ DONE
- Task 1.23: Fix ClaudeKit setup command flags ✅ DONE
- Task 1.24: Update notification interval to 7 days ⏳ NEW

### Execution Recommendations
1. Complete Task 1.24 (Update notification interval) - Low priority enhancement
2. This is a simple parameter change aligning with industry standards
3. No dependencies or complex testing required

---

## Overview

Transform claude-config into professionally published npm package "@33strategies/claudeflow" with cross-platform CLI installer. Replace 262-line bash install.sh with Node.js Pure Installer. Enable npm/yarn/pnpm installation, automated version management via semantic-release, and update notifications. Implement npm Trusted Publishers (OIDC) for secure, token-free publishing with automatic provenance attestations.

**Security Upgrade**: Using npm Trusted Publishers instead of NPM_TOKEN for modern supply chain security.

---

## Phase 1: Core npm Package Setup

### Task 1.1: Create package.json with all required fields ✅ DONE
**Status**: Completed in Session 1
**Description**: Initialize package.json with complete npm package configuration for @33strategies/claudeflow

### Task 1.2: Create LICENSE file (MIT) ✅ DONE
**Status**: Completed in Session 1
**Description**: Add MIT License file to project root with Kenneth Priester copyright

### Task 1.3: Create .npmignore file ✅ DONE
**Status**: Completed in Session 1
**Description**: Configure npm package file exclusions to reduce package size and exclude development files

### Task 1.4: Update .claude-plugin/plugin.json to v1.2.0 ✅ DONE
**Status**: Completed in Session 1
**Description**: Update plugin metadata to match package version and new package name

### Task 1.5: Implement bin/claudeflow.js (CLI entry point) ✅ DONE
**Status**: Completed in Session 1
**Description**: Create CLI entry point with command routing and update notifications

### Task 1.6: Implement lib/setup.js (installation logic) ✅ DONE
**Status**: Completed in Session 1
**Description**: Port install.sh functionality to Node.js with cross-platform support

### Task 1.7: Implement lib/doctor.js (diagnostic command) ✅ DONE
**Status**: Completed in Session 1
**Description**: Create diagnostic tool to verify installation health

### Task 1.8: Create directory structure (bin/, lib/) ✅ DONE
**Status**: Completed in Session 1
**Description**: Create necessary directories for package structure

### Task 1.9: Create scripts/verify-files.js (prepublish check) ✅ DONE
**Status**: Completed in Session 1
**Description**: Implement prepublishOnly hook to verify package contents before npm publish

### Task 1.10: Update README.md installation section ✅ DONE
**Status**: Completed in Session 1
**Description**: Replace bash installer instructions with npm installation

### Task 1.11: Update CHANGELOG.md for v1.2.0 ✅ DONE
**Status**: Completed in Session 1
**Description**: Document the npm packaging transformation in changelog

### Task 1.12: Create .github/workflows/release.yml 🔄 UPDATED
**Status**: Completed in Session 1, Updated in Session 2 for OIDC
**Description**: Set up GitHub Actions CI/CD with npm Trusted Publishers (OIDC) for automated releases
**Size**: Medium
**Priority**: High
**Dependencies**: Task 1.1, Task 1.13

**Update Note**: Affected by changelog entry on 2025-11-21 - Migrating from NPM_TOKEN to npm Trusted Publishers (OIDC). Review spec Security Considerations section and research report for OIDC implementation details.

**Technical Requirements:**
- Test matrix: 3 OS (ubuntu, macos, windows) × 2 Node versions (20, 22) = 6 combinations
- **OIDC Authentication**: Use `id-token: write` permission instead of NPM_TOKEN
- **Permissions**: Explicit job-level permissions for security
- Workflow runs on push to main
- Tests must pass before release
- semantic-release for automated publishing with OIDC provenance

**Complete workflow implementation (OIDC-enabled):**
```yaml
name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: read  # Default: minimal permissions

jobs:
  test:
    name: Test on ${{ matrix.os }} with Node ${{ matrix.node }}
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [20, 22]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Verify files
        run: node scripts/verify-files.js

  release:
    name: Release to npm
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: write        # To publish GitHub release
      issues: write          # To comment on released issues
      pull-requests: write   # To comment on released PRs
      id-token: write        # CRITICAL: Enables OIDC for npm

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: "https://registry.npmjs.org"
          # NO NODE_AUTH_TOKEN needed with OIDC

      - name: Install dependencies
        run: npm ci

      - name: Update npm to latest
        run: npm install -g npm@latest

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # NO NPM_TOKEN NEEDED - OIDC handles authentication
        run: npx semantic-release
```

**Key OIDC Changes:**
1. **Added `id-token: write`** to release job permissions (CRITICAL for OIDC)
2. **Removed `NPM_TOKEN`** from environment variables
3. **Added npm update step** to ensure npm CLI 11.5.1+ (required for OIDC)
4. **Added explicit permissions** at workflow and job level for security
5. **Set `persist-credentials: false`** in checkout to avoid GITHUB_TOKEN interference

**Implementation Steps:**
1. Update existing .github/workflows/release.yml
2. Add `permissions: contents: read` at workflow level
3. Add explicit permissions block to release job (contents, issues, pull-requests, id-token)
4. Remove NPM_TOKEN from env section
5. Add npm update step before release
6. Test workflow on feature branch (will fail at publish, but validates syntax)
7. Ready for Task 1.17 (configure npm account for OIDC)

**Acceptance Criteria:**
- [ ] .github/workflows/release.yml has OIDC permissions
- [ ] `id-token: write` permission present in release job
- [ ] NPM_TOKEN removed from workflow
- [ ] npm update step included
- [ ] Test matrix includes 3 OS × 2 Node = 6 jobs
- [ ] semantic-release configured
- [ ] Workflow syntax validates successfully
- [ ] Tests run before release job

### Task 1.13: Create .releaserc.json (semantic-release config) ✅ DONE
**Status**: Completed in Session 1
**Description**: Configure semantic-release for automated version management with CHANGELOG generation

### Task 1.14: Remove install.sh ✅ DONE
**Status**: Completed in Session 1
**Description**: Delete bash installer (clean break to npm)

### Task 1.15: Test package locally with npm pack ✅ DONE
**Status**: Completed in Session 1
**Description**: Verify package contents and local installation

### Task 1.16: Publish to npm with provenance 🔄 UPDATED
**Status**: Pending, Updated in Session 2 for OIDC
**Description**: Execute initial token-based publish, then migrate to OIDC (Option A approach)
**Size**: Small
**Priority**: Critical
**Dependencies**: Task 1.15, Task 1.17, Task 1.18, Task 1.19

**Update Note**: Affected by changelog entry on 2025-11-21 - Publishing strategy changed to two-phase approach: (1) Initial token-based publish to create package, (2) Switch to OIDC for all future publishes. See Tasks 1.17-1.20 for implementation steps.

**Pre-Flight Checklist:**
1. Verify member of @33strategies organization on npmjs.com
2. Ensure 2FA enabled on npm account
3. Test tarball locally (Task 1.15 complete)
4. Ensure CI/CD passes all tests
5. Verify all required files present (Task 1.9 verify-files.js passes)
6. **NEW**: Complete Task 1.17 (npm account OIDC configuration)
7. **NEW**: Complete Task 1.18 (initial token publish)
8. **NEW**: Complete Task 1.19 (OIDC migration)

**Two-Phase Publishing Strategy:**

**Phase 1: Initial Token-Based Publish** (Task 1.18)
- Create 7-day granular access token on npmjs.com
- Add NPM_TOKEN to GitHub Secrets temporarily
- Create temporary workflow file with token auth
- Push to main → semantic-release publishes v1.2.0
- Package now exists on npm (required for OIDC config)
- Remove NPM_TOKEN from GitHub Secrets

**Phase 2: Switch to OIDC** (Task 1.19)
- Configure trusted publisher on npmjs.com (Task 1.17 - done first)
- Update workflow to OIDC version (Task 1.12 - already updated)
- Merge to main
- Future publishes use OIDC automatically
- Verify provenance (Task 1.20)

**Automated Publish Workflow:**
- Push to main → semantic-release analyzes commits
- Determines next version (feat: minor, fix: patch, BREAKING: major)
- Generates CHANGELOG.md entry
- Creates git tag
- **Publishes to npm with OIDC authentication**
- **Automatic provenance attestation** (no --provenance flag needed)
- Creates GitHub release with notes

**Post-Publish Verification:**
1. Check package published: `npm view @33strategies/claudeflow`
2. Verify version matches release
3. Check provenance badge on npm package page
4. Verify GitHub release created
5. Test installation: `npm install -g @33strategies/claudeflow@latest`
6. Run `claudeflow doctor` to verify

**Acceptance Criteria:**
- [ ] Package published to npm registry
- [ ] Version matches semantic-release output
- [ ] CHANGELOG.md updated and committed
- [ ] Git tag created
- [ ] GitHub release published with notes
- [ ] **Provenance attestation visible on npm**
- [ ] **OIDC authentication successful (no token used)**
- [ ] Installation from npm succeeds
- [ ] `claudeflow doctor` passes all checks

### Task 1.17: Configure npm account for trusted publishers ⏳ NEW
**Status**: New in Session 2
**Description**: Set up npm Trusted Publishers (OIDC) configuration for @33strategies/claudeflow package
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.18 (must publish package first before configuring OIDC)
**Added**: 2025-11-21

**⚠️ IMPORTANT**: This task must be completed AFTER Task 1.18 (initial token-based publish) because npm requires the package to exist before configuring trusted publishers.

**Technical Requirements:**
- npm account with publish permissions for @33strategies scope
- Package must exist on npm (published via Task 1.18)
- 2FA enabled on npm account
- GitHub Actions workflow file name: `release.yml`

**Prerequisites:**
- [ ] @33strategies/claudeflow package published to npm (Task 1.18 complete)
- [ ] npm account has 2FA enabled
- [ ] Admin access to @33strategies organization on npmjs.com

**Configuration Steps:**

1. **Navigate to Package Settings**
   - Go to https://www.npmjs.com/package/@33strategies/claudeflow/access
   - Or: npmjs.com → Your Profile → Packages → @33strategies/claudeflow → Settings tab

2. **Locate Trusted Publishers Section**
   - Find section labeled "Trusted Publisher" or "Trusted publishing with OIDC"
   - Click "Add a trusted publisher" button

3. **Select CI/CD Provider**
   - Choose "GitHub Actions" from provider dropdown

4. **Enter Configuration Details** (EXACT VALUES - Case Sensitive!)

   | Field | Value | Notes |
   |-------|-------|-------|
   | **Organization/User** | kennyjpowers | GitHub username (case-sensitive) |
   | **Repository** | claude-flow | Just repo name, not org/repo |
   | **Workflow filename** | release.yml | Include `.yml` extension, case-sensitive |
   | **Environment** | *(leave empty)* | Only if using GitHub Environments |

   **⚠️ Common Errors to Avoid:**
   - Extra spaces in any field
   - Wrong file extension (.yaml vs .yml)
   - Wrong casing (Release.yml vs release.yml)
   - Full repo path instead of just name

5. **Save Configuration**
   - Click "Save" or "Add trusted publisher"
   - Configuration will appear in Trusted Publishers list

6. **Verify Configuration**
   - Check that configuration is visible in list
   - Verify all fields match exactly:
     - Provider: GitHub Actions
     - Repository: kennyjpowers/claude-flow
     - Workflow: release.yml
     - Environment: (none)

**Post-Configuration:**
- Configuration takes effect immediately (no propagation delay)
- No NPM_TOKEN needed for future publishes
- OIDC tokens generated automatically per-workflow run
- Ready for Task 1.19 (OIDC workflow merge)

**Troubleshooting:**
- If fields don't match workflow, publishing will fail with "unable to verify publisher"
- npm does NOT validate config when saving - errors only appear during publish
- Double-check workflow filename matches exactly (including extension and case)

**Implementation Commands:**
```bash
# Verify package exists (must show version)
npm view @33strategies/claudeflow

# Verify workflow file exists with exact name
ls -la .github/workflows/release.yml

# No CLI commands - configuration done via npm web UI
```

**Acceptance Criteria:**
- [ ] Package exists on npm registry (Task 1.18 complete)
- [ ] Navigated to package settings on npmjs.com
- [ ] Trusted publisher configuration added
- [ ] Provider set to "GitHub Actions"
- [ ] Organization field: kennyjpowers (exact match)
- [ ] Repository field: claude-flow (exact match, no org prefix)
- [ ] Workflow field: release.yml (exact match, case-sensitive, includes extension)
- [ ] Environment field: empty
- [ ] Configuration saved and visible in list
- [ ] All fields double-checked for typos/spaces

### Task 1.18: Perform initial token-based publish ⏳ NEW
**Status**: New in Session 2
**Description**: Execute first publish using temporary NPM_TOKEN to create package on npm registry (required before OIDC configuration)
**Size**: Medium
**Priority**: Critical
**Dependencies**: Task 1.15 (package tested), Task 1.12 (workflow exists)
**Added**: 2025-11-21

**⚠️ PURPOSE**: npm requires packages to exist before configuring trusted publishers. This task creates the package using traditional token auth so Task 1.17 can configure OIDC.

**Technical Requirements:**
- Create granular access token with 7-day expiration
- Temporarily add NPM_TOKEN to GitHub Secrets
- Create temporary workflow file with token authentication
- Publish v1.2.0 to npm
- Clean up token and workflow after success

**Implementation Steps:**

1. **Create Granular Access Token**
   - Navigate to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → "Granular Access Token"
   - Token settings:
     - **Name**: `claudeflow-initial-publish`
     - **Expiration**: 7 days (minimum for temporary use)
     - **Type**: Automation
     - **Packages and scopes**: Select @33strategies/claudeflow
     - **Permissions**: Read and write
   - Click "Generate Token"
   - **COPY TOKEN IMMEDIATELY** (only shown once)

2. **Add Token to GitHub Secrets**
   ```bash
   # Navigate to: https://github.com/kennyjpowers/claude-flow/settings/secrets/actions
   # Click "New repository secret"
   # Name: NPM_TOKEN
   # Value: [paste token from step 1]
   # Click "Add secret"
   ```

3. **Create Temporary Token-Based Workflow**

   Create `.github/workflows/release-token.yml`:
   ```yaml
   name: Release (Token-based - Temporary)

   on:
     push:
       branches:
         - feat/initial-publish  # Temporary branch

   jobs:
     release:
       name: Release to npm (Token Auth)
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v4
           with:
             fetch-depth: 0
             persist-credentials: false

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: 22

         - name: Install dependencies
           run: npm ci

         - name: Verify files
           run: node scripts/verify-files.js

         - name: Release
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             NPM_TOKEN: ${{ secrets.NPM_TOKEN }}  # Temporary token
           run: npx semantic-release
   ```

4. **Execute Initial Publish**
   ```bash
   # Create temporary branch
   git checkout -b feat/initial-publish

   # Add temporary workflow
   git add .github/workflows/release-token.yml
   git commit -m "chore: add temporary token-based release workflow"

   # Push to trigger release
   git push origin feat/initial-publish

   # Monitor GitHub Actions for success
   # Check: https://github.com/kennyjpowers/claude-flow/actions
   ```

5. **Verify Package Published**
   ```bash
   # Check package on npm
   npm view @33strategies/claudeflow

   # Should show:
   # - version: 1.2.0
   # - published: [timestamp]
   # - No provenance yet (token-based publish)
   ```

6. **Clean Up Token and Workflow**
   ```bash
   # Delete NPM_TOKEN from GitHub Secrets
   # Navigate to: https://github.com/kennyjpowers/claude-flow/settings/secrets/actions
   # Find NPM_TOKEN → Delete

   # Delete temporary workflow
   git checkout main
   git pull origin main
   rm .github/workflows/release-token.yml
   git add .github/workflows/release-token.yml
   git commit -m "chore: remove temporary token-based workflow"
   git push origin main

   # Delete temporary branch
   git branch -d feat/initial-publish
   git push origin --delete feat/initial-publish

   # Revoke token on npmjs.com
   # Navigate to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   # Find "claudeflow-initial-publish" → Revoke
   ```

**Post-Publish Verification:**
- [ ] Package exists: `npm view @33strategies/claudeflow`
- [ ] Version is 1.2.0
- [ ] Installation works: `npm install -g @33strategies/claudeflow`
- [ ] `claudeflow --version` shows 1.2.0
- [ ] `claudeflow doctor` passes
- [ ] GitHub release created
- [ ] CHANGELOG.md updated

**Security Cleanup:**
- [ ] NPM_TOKEN deleted from GitHub Secrets
- [ ] Token revoked on npmjs.com
- [ ] Temporary workflow file deleted
- [ ] Temporary branch deleted

**Acceptance Criteria:**
- [ ] Granular access token created (7-day expiration)
- [ ] NPM_TOKEN added to GitHub Secrets
- [ ] Temporary workflow file created
- [ ] Package published to npm successfully
- [ ] Version 1.2.0 visible on npm registry
- [ ] Installation from npm succeeds
- [ ] All commands work (`setup`, `doctor`, `version`, `help`)
- [ ] NPM_TOKEN deleted from GitHub Secrets
- [ ] Token revoked on npmjs.com
- [ ] Temporary workflow file deleted
- [ ] Temporary branch deleted
- [ ] Ready for Task 1.17 (OIDC configuration)

### Task 1.19: Switch to OIDC publishing ⏳ NEW
**Status**: New in Session 2
**Description**: Merge OIDC workflow (Task 1.12) to enable trusted publishers for all future releases
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.12 (OIDC workflow ready), Task 1.17 (npm OIDC configured), Task 1.18 (package exists)
**Added**: 2025-11-21

**⚠️ PURPOSE**: Enable OIDC-based publishing for all future releases. After this task, no NPM_TOKEN is needed - GitHub Actions generates short-lived tokens automatically.

**Prerequisites:**
- [ ] Task 1.18 complete (package exists on npm)
- [ ] Task 1.17 complete (npm trusted publishers configured)
- [ ] Task 1.12 complete (OIDC workflow file ready)
- [ ] NPM_TOKEN removed from GitHub Secrets

**Technical Requirements:**
- Merge OIDC-enabled workflow to main branch
- Trigger release with conventional commit
- Verify OIDC authentication succeeds
- Confirm provenance attestation generated

**Implementation Steps:**

1. **Verify OIDC Workflow Ready**
   ```bash
   # Check that .github/workflows/release.yml has OIDC config
   grep -A 5 "id-token: write" .github/workflows/release.yml

   # Should show:
   # permissions:
   #   contents: write
   #   issues: write
   #   pull-requests: write
   #   id-token: write

   # Verify NPM_TOKEN NOT in workflow
   grep "NPM_TOKEN" .github/workflows/release.yml
   # Should return NO matches
   ```

2. **Verify npm Trusted Publishers Configured**
   - Check npmjs.com package settings
   - Confirm trusted publisher entry exists:
     - Provider: GitHub Actions
     - Repository: kennyjpowers/claude-flow
     - Workflow: release.yml

3. **Create Feature Branch for OIDC Test**
   ```bash
   git checkout -b feat/enable-oidc-publishing
   ```

4. **Ensure OIDC Workflow is Committed**
   ```bash
   # If not already committed from Task 1.12
   git add .github/workflows/release.yml
   git commit -m "feat: enable npm Trusted Publishers (OIDC) for secure publishing

   Migrates from NPM_TOKEN to OIDC authentication:
   - Adds id-token: write permission
   - Removes NPM_TOKEN from workflow
   - Enables automatic provenance attestations
   - Aligns with npm security best practices"
   ```

5. **Merge to Main (Triggers OIDC Release)**
   ```bash
   # Push feature branch
   git push origin feat/enable-oidc-publishing

   # Merge to main (via PR or direct merge)
   git checkout main
   git merge feat/enable-oidc-publishing
   git push origin main

   # Monitor GitHub Actions
   # Watch for OIDC authentication success in logs
   ```

6. **Monitor Workflow Execution**
   - Navigate to: https://github.com/kennyjpowers/claude-flow/actions
   - Find running "Release" workflow
   - Check for success messages:
     - "Signed provenance statement with source and build information from GitHub Actions"
     - "Authenticate via OpenID Connect (OIDC)"
     - "provenance attestation for @33strategies/claudeflow@X.X.X"

7. **Verify OIDC Publish Success**
   ```bash
   # Check new version published
   npm view @33strategies/claudeflow

   # Should show new version (e.g., 1.3.0 if feat: commit)
   # Check GitHub releases
   # Should have new release with notes
   ```

**Workflow Log Verification:**

Look for these SUCCESS indicators in GitHub Actions logs:

```
✅ npm notice Authenticate via OpenID Connect (OIDC)
✅ npm notice publish Signed provenance statement with source and build information from GitHub Actions
✅ npm notice provenance attestation for @33strategies/claudeflow@1.3.0
✅ + @33strategies/claudeflow@1.3.0
```

**Common Errors and Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| Unable to authenticate using OIDC | Missing id-token: write | Verify permission in workflow |
| OIDC token exchange error - package not found | npm config wrong | Check Task 1.17 config fields |
| Workflow filename mismatch | Wrong filename in npm | Update npm config to "release.yml" |
| 404 Not Found | npm CLI outdated | Verify npm update step in workflow |

**Post-Migration Verification:**
```bash
# Verify provenance on npm package page
# Navigate to: https://www.npmjs.com/package/@33strategies/claudeflow
# Look for:
# - Provenance badge
# - "Published from GitHub Actions" indicator
# - Signed attestation link

# Test installation
npm install -g @33strategies/claudeflow@latest
claudeflow --version
claudeflow doctor
```

**Acceptance Criteria:**
- [ ] OIDC workflow merged to main branch
- [ ] Workflow triggered and completed successfully
- [ ] GitHub Actions logs show OIDC authentication
- [ ] Logs show "Signed provenance statement" message
- [ ] New version published to npm
- [ ] Provenance attestation generated
- [ ] GitHub release created
- [ ] No NPM_TOKEN used (verified in logs)
- [ ] Installation from npm succeeds
- [ ] All future publishes use OIDC (no tokens needed)

### Task 1.20: Verify OIDC provenance attestation ⏳ NEW
**Status**: New in Session 2
**Description**: Confirm cryptographic provenance is visible and valid on npm package page
**Size**: Trivial
**Priority**: Medium
**Dependencies**: Task 1.19 (OIDC publish complete)
**Added**: 2025-11-21

**PURPOSE**: Validate that npm Trusted Publishers is working correctly and generating SLSA-compliant provenance attestations.

**Technical Requirements:**
- Provenance badge visible on npm package page
- Attestation signed and verifiable
- Links to GitHub Actions workflow run
- Includes correct repository and commit information

**Verification Steps:**

1. **Check npm Package Page**
   ```bash
   # Open in browser
   open https://www.npmjs.com/package/@33strategies/claudeflow

   # Or use CLI
   npm view @33strategies/claudeflow
   ```

2. **Verify Provenance Indicators**

   On npm package page, look for:
   - ✅ **Provenance badge** (shield icon with checkmark)
   - ✅ **"Published from GitHub Actions"** text
   - ✅ **Signed attestation** link

3. **Inspect Attestation Details**
   - Click "View signed attestation" link
   - Verify attestation contains:
     - Package name: @33strategies/claudeflow
     - Package version: (latest version)
     - Repository: kennyjpowers/claude-flow
     - Workflow path: .github/workflows/release.yml
     - Commit SHA: (matches git commit)
     - Build environment: GitHub Actions
     - Predicate type: https://slsa.dev/provenance/v0.2
     - SLSA level: 2

4. **Verify Attestation Signature**
   ```bash
   # Use npm CLI to verify signature (npm 9.5.0+)
   npm audit signatures

   # Should show:
   # verified signature for @33strategies/claudeflow@X.X.X
   ```

5. **Check GitHub Actions Linkage**
   - Attestation should link to exact workflow run
   - Click workflow run link
   - Verify run completed successfully
   - Check logs show OIDC authentication

6. **Validate Repository Information**
   - Attestation shows correct GitHub repository
   - Commit SHA matches release commit
   - Workflow path is .github/workflows/release.yml
   - No forks or suspicious sources

**Expected Provenance Content:**

```json
{
  "subject": {
    "name": "@33strategies/claudeflow",
    "digest": { "sha512": "..." }
  },
  "predicateType": "https://slsa.dev/provenance/v0.2",
  "predicate": {
    "builder": {
      "id": "https://github.com/actions/runner/..."
    },
    "buildType": "https://github.com/Attestations/GitHubActionsWorkflow@v1",
    "metadata": {
      "buildInvocationId": "...",
      "completeness": { "environment": true },
      "reproducible": false
    },
    "materials": [
      {
        "uri": "git+https://github.com/kennyjpowers/claude-flow",
        "digest": { "sha1": "[commit-sha]" }
      }
    ]
  }
}
```

**Documentation Update:**

Add provenance section to README.md:
```markdown
## Security & Provenance

This package is published using [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers/) with OIDC authentication. Every release includes cryptographic provenance attestations that link the published package to the exact source code, commit, and GitHub Actions workflow that built it.

**Verify Provenance:**
```bash
npm audit signatures
```

Learn more: https://www.npmjs.com/package/@33strategies/claudeflow
```

**Acceptance Criteria:**
- [ ] Provenance badge visible on npm package page
- [ ] "Published from GitHub Actions" indicator shown
- [ ] Signed attestation link accessible
- [ ] Attestation contains correct package name and version
- [ ] Repository information is accurate (kennyjpowers/claude-flow)
- [ ] Workflow path matches .github/workflows/release.yml
- [ ] Commit SHA matches release commit
- [ ] SLSA provenance format validated
- [ ] `npm audit signatures` verifies signature successfully
- [ ] Workflow run link works and shows successful execution
- [ ] README.md updated with provenance information

### Task 1.21: Verify installation from npm ⏳ PENDING
**Status**: Pending from Session 1
**Description**: Test complete installation flow from npm registry to ensure end-to-end functionality

### Task 1.22: Notify ClaudeKit maintainer ⏳ PENDING
**Status**: Pending from Session 1
**Description**: Inform ClaudeKit maintainer of package publication for potential cross-promotion

---

### Task 1.23: Fix ClaudeKit setup command flags ⏳ NEW
**Status**: New in Session 3
**Description**: Fix ClaudeKit setup command to use correct flags (--user instead of --global, add --yes for non-interactive mode)
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.6 (lib/setup.js exists)
**Can run parallel with**: N/A (bug fix should be completed first)
**Source**: Feedback #2 from specs/package-publishing-strategy/05-feedback.md

**Technical Requirements**:
- Update lib/setup.js line 257 in the `runClaudeKitSetup()` function
- Replace incorrect `--global` flag with correct `--user` flag
- Add `--yes` flag for non-interactive mode (both global and project modes)
- Maintain error handling and non-fatal behavior

**Current Implementation (WRONG)**:
```javascript
async function runClaudeKitSetup(mode) {
  printInfo("Running ClaudeKit setup...");

  try {
    const setupCommand =
      mode === "global" ? "claudekit setup --global" : "claudekit setup";
    execSync(setupCommand, { stdio: "inherit" });
    printSuccess("ClaudeKit setup complete");
  } catch (error) {
    printError("ClaudeKit setup failed (non-fatal)");
    printInfo('You may need to run "claudekit setup" manually');
  }

  console.log("");
}
```

**Fixed Implementation (CORRECT)**:
```javascript
async function runClaudeKitSetup(mode) {
  printInfo("Running ClaudeKit setup...");

  try {
    const setupCommand =
      mode === "global" ? "claudekit setup --user --yes" : "claudekit setup --yes";
    execSync(setupCommand, { stdio: "inherit" });
    printSuccess("ClaudeKit setup complete");
  } catch (error) {
    printError("ClaudeKit setup failed (non-fatal)");
    printInfo('You may need to run "claudekit setup" manually');
  }

  console.log("");
}
```

**ClaudeKit Supported Flags (verified via `claudekit setup --help`)**:
- `--user` - Install in user directory (~/.claude) instead of project ✅
- `--project <path>` - Target directory for project installation ✅
- `--yes` - Automatic yes to prompts (non-interactive mode) ✅
- `--global` - NOT SUPPORTED ❌

**Key Changes**:
1. **Global mode**: Change from `claudekit setup --global` to `claudekit setup --user --yes`
   - `--user` tells ClaudeKit to install in ~/.claude/ directory
   - `--yes` makes setup non-interactive (no prompts during automated installation)

2. **Project mode**: Change from `claudekit setup` to `claudekit setup --yes`
   - Adds `--yes` flag for non-interactive mode
   - No path needed (defaults to current directory)

**Implementation Steps**:
1. Open `lib/setup.js`
2. Navigate to line 257 (inside `runClaudeKitSetup` function)
3. Replace the `setupCommand` line with corrected version
4. Save file
5. Test both modes:
   ```bash
   # Test global mode
   node bin/claudeflow.js setup --global
   # Should see: claudekit setup --user --yes (in debug output)

   # Test project mode
   node bin/claudeflow.js setup --project
   # Should see: claudekit setup --yes (in debug output)
   ```

**Acceptance Criteria**:
- [ ] Global mode uses `claudekit setup --user --yes`
- [ ] Project mode uses `claudekit setup --yes`
- [ ] No `error: unknown option '--global'` errors
- [ ] ClaudeKit setup completes without prompts (non-interactive)
- [ ] Global mode installs to ~/.claude/
- [ ] Project mode installs to ./.claude/
- [ ] Error handling remains non-fatal
- [ ] Success/failure messages display correctly

**Testing Plan**:
1. **Syntax validation**: Run `node -c lib/setup.js` (check for syntax errors)
2. **Global mode test**:
   - Run `claudeflow setup --global` in a clean environment
   - Verify no `--global` error appears
   - Verify ClaudeKit setup completes without prompts
   - Check that ~/.claude/ directory is created with ClaudeKit files
3. **Project mode test**:
   - Run `claudeflow setup --project` in a test directory
   - Verify no errors
   - Verify setup completes without prompts
   - Check that ./.claude/ directory is created with ClaudeKit files
4. **Error handling test**:
   - Test with ClaudeKit not installed (mock)
   - Verify error message is clear and non-fatal
   - Verify script continues and doesn't crash

**Risk Assessment**:
- **Risk Level**: LOW
- **Blast Radius**: Single function, single line change
- **Rollback**: Simple revert if issues found
- **User Impact**: HIGH (fixes bug affecting ALL global mode installations)

**Why This Fix Is Important**:
- Affects ALL global mode installations (100% failure rate currently)
- Creates confusing error message for users
- Simple one-line fix with low risk
- Improves user experience by making setup non-interactive
- Aligns with ClaudeKit's actual command-line API

**Related Issues**:
- Source: User feedback via `/spec:feedback` command
- Feedback log: specs/package-publishing-strategy/05-feedback.md #2
- Console error: `error: unknown option '--global'`
- Discovered during: Testing claudeflow v1.0.1 setup command

---

### Task 1.24: Update notification interval to 7 days ⏳ NEW
**Status**: New in Session 4
**Description**: Change update-notifier check interval from 24 hours to 7 days to align with industry standards
**Size**: Trivial
**Priority**: Low
**Dependencies**: Task 1.5 (bin/claudeflow.js exists)
**Can run parallel with**: All tasks (independent change)
**Source**: Feedback #2 from specs/package-publishing-strategy/05-feedback.md

**Technical Requirements**:
- Update bin/claudeflow.js line 289
- Change updateCheckInterval parameter from 1 day to 7 days
- Maintain non-blocking behavior
- Keep update notification format unchanged

**Current Implementation**:
```javascript
// Check for updates (non-blocking)
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 }); // Check daily
```

**Updated Implementation**:
```javascript
// Check for updates (non-blocking)
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 * 7 }); // Check weekly
```

**Why This Change**:
- **Industry Standard**: npm, yarn, and pnpm all use 7-day intervals for update checks
- **User Experience**: Daily checks can be intrusive and unnecessary
- **Network Efficiency**: Reduces unnecessary network requests
- **Best Practice**: Balances keeping users informed vs. being annoying
- **Alignment**: Follows update-notifier library recommendations

**Research Findings**:
According to update-notifier documentation and common practice:
- Default interval: 1 day (24 hours)
- Recommended interval: 7 days (1 week)
- npm CLI: Uses 7-day interval
- yarn: Uses 7-day interval
- pnpm: Uses 7-day interval

**Implementation Steps**:
1. Open `bin/claudeflow.js`
2. Navigate to line 289 (updateNotifier configuration)
3. Change the interval calculation:
   - FROM: `1000 * 60 * 60 * 24` (1 day in milliseconds)
   - TO: `1000 * 60 * 60 * 24 * 7` (7 days in milliseconds)
4. Update comment to reflect "Check weekly" instead of "Check daily"
5. Save file
6. Test update notification behavior

**Testing Plan**:
1. **Syntax validation**: Run `node -c bin/claudeflow.js`
2. **Manual interval test**:
   ```bash
   # Force update check by deleting cache
   rm -rf ~/.config/configstore/update-notifier-@33strategies-claudeflow.json

   # Run claudeflow command
   claudeflow --version

   # Check that notifier doesn't check again for 7 days
   # (Cache file should show next check date)
   cat ~/.config/configstore/update-notifier-@33strategies-claudeflow.json
   ```
3. **Regression test**: Verify update notifications still display when update available
4. **Non-blocking test**: Verify commands execute without waiting for update check

**Acceptance Criteria**:
- [ ] updateCheckInterval set to `1000 * 60 * 60 * 24 * 7` (7 days)
- [ ] Comment updated to say "Check weekly"
- [ ] Syntax validation passes
- [ ] Update check occurs at most once per week
- [ ] Update notifications still display when available
- [ ] Command execution not blocked by update check
- [ ] Aligns with npm/yarn/pnpm behavior

**Risk Assessment**:
- **Risk Level**: MINIMAL
- **Blast Radius**: Single parameter, single file
- **User Impact**: LOW (slight reduction in update notification frequency)
- **Rollback**: Trivial (revert single value)
- **Benefits**: Better user experience, reduced network overhead

**Related Issues**:
- Source: User feedback via `/spec:feedback` command
- Feedback log: specs/package-publishing-strategy/05-feedback.md #2
- Issue: Update notifications not displaying (investigation led to interval adjustment)
- Research: Industry standard analysis confirmed 7-day interval is best practice

---

## Implementation Notes

### OIDC Migration Strategy (Session 2)

**Why Option A (Initial Token → OIDC)**:
- Package must exist before configuring trusted publishers
- Simpler and more transparent than placeholder package
- No risk of name squatting concerns
- Clean migration path with verification at each step

**Security Benefits**:
- No long-lived NPM_TOKEN in GitHub Secrets
- Short-lived OIDC tokens (expire in minutes)
- Automatic cryptographic provenance (SLSA Level 2)
- Tokens generated per-workflow run, not stored
- Aligns with npm security roadmap (classic tokens deprecated)

**Implementation Order** (CRITICAL):
1. Task 1.12: Update workflow file (OIDC-ready, but won't use OIDC yet)
2. Task 1.18: Initial token publish (creates package on npm)
3. Task 1.17: Configure npm trusted publishers (requires package to exist)
4. Task 1.19: Merge OIDC workflow (enables OIDC for all future publishes)
5. Task 1.20: Verify provenance (confirms OIDC working correctly)

### Research Sources
- Research report: `/tmp/research_20251121_npm_trusted_publishers_semantic_release.md`
- Official docs: https://docs.npmjs.com/trusted-publishers/
- Security changelog: https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/

---

## Success Criteria

The implementation is complete when:
- ✅ All Session 1 tasks completed (15/15)
- ✅ OIDC workflow updated (Task 1.12)
- ⏳ ClaudeKit setup flags fixed (Task 1.23) - HIGH PRIORITY
- ⏳ Initial token publish complete (Task 1.18)
- ⏳ npm trusted publishers configured (Task 1.17)
- ⏳ OIDC publishing enabled (Task 1.19)
- ⏳ Provenance verified (Task 1.20)
- ⏳ Installation from npm succeeds (Task 1.21)
- ⏳ ClaudeKit maintainer notified (Task 1.22)
- ✅ Package published to npm registry
- ⏳ **OIDC authentication active (no NPM_TOKEN needed)**
- ⏳ **ClaudeKit setup works correctly for both global and project modes**
- ⏳ **Provenance attestations visible on npm**
- ✅ Installation works on all platforms (Windows, macOS, Linux)
- ✅ All commands functional (`setup`, `doctor`, `version`, `help`)
- ✅ Documentation updated (README.md, CHANGELOG.md)
- ✅ CI/CD pipeline operational

---

## Quality Gates

Before marking implementation complete:
- [ ] All 22 tasks marked as DONE in STM
- [ ] Package size < 500KB (verified: 92KB)
- [ ] `npm pack` creates valid tarball
- [ ] `claudeflow doctor` passes all checks
- [ ] CI/CD passes on all 6 OS/Node combinations
- [ ] **OIDC publishing successful (no tokens)**
- [ ] **Provenance badge visible on npm**
- [ ] No security vulnerabilities (`npm audit`)
- [ ] All required files included
- [ ] ClaudeKit integration working
