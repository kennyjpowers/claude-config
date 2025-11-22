# Publishing Guide: @33strategies/claudeflow to npm

## Overview

This guide walks you through publishing @33strategies/claudeflow to npm with secure OIDC authentication. We'll use a two-step approach:

1. **Initial token-based publish** - Create the package on npm (required for OIDC setup)
2. **Switch to OIDC** - Enable trusted publishers for all future releases

## Prerequisites

- [x] Package ready for publishing (verified with `npm pack`)
- [x] GitHub repository created: `kennyjpowers/claude-flow`
- [x] Git remote updated to point to new repository
- [ ] npm account with publish permissions for @33strategies scope
- [ ] 2FA enabled on npm account
- [ ] Member of @33strategies organization on npm

## Step 1: Create Granular Access Token (Temporary)

### 1.1 Generate Token on npm

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → "Granular Access Token"
3. Configure token:
   - **Name**: `claudeflow-initial-publish`
   - **Expiration**: 7 days (minimum for temporary use)
   - **Type**: Automation
   - **Packages and scopes**:
     - Click "Select packages and scopes"
     - Select "@33strategies/claudeflow" (or select scope "@33strategies/*")
     - Set permissions to "Read and write"
   - Click "Generate Token"
4. **COPY TOKEN IMMEDIATELY** (only shown once)
   - Save to password manager or secure note
   - You'll need it in the next step

⚠️ **Security**: This token will be revoked after first publish. Keep it secure until then.

## Step 2: Add NPM_TOKEN to GitHub Secrets

1. Go to https://github.com/kennyjpowers/claude-flow/settings/secrets/actions
2. Click "New repository secret"
3. Add secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: [paste token from Step 1]
4. Click "Add secret"

## Step 3: Merge Changes to Main and Push

The temporary workflow `.github/workflows/release-token.yml` has already been created and committed. Now merge to main:

```bash
# Navigate to project directory
cd /Users/kennethpriester/src/ai_projects/claude-config  # or claude-flow if renamed

# Switch to main branch
git checkout main

# Merge the feature branch
git merge feat/package-publishing-strategy

# Push to GitHub
git push origin main
```

**Note**: The workflow uses `workflow_dispatch` (manual trigger) to avoid conflicts with the regular OIDC workflow. You'll trigger it manually in Step 4.

## Step 4: Manually Trigger the Publish Workflow

1. Go to https://github.com/kennyjpowers/claude-flow/actions
2. Click on "Release (Token-based - Temporary)" workflow in the left sidebar
3. Click the "Run workflow" button (top right)
4. Select branch: `main`
5. Click "Run workflow" (green button)
6. Monitor the workflow execution as it runs
7. Wait for completion (should take 2-5 minutes)

**Why Manual Trigger?** Using `workflow_dispatch` prevents conflicts with the regular OIDC workflow and gives you explicit control over when to publish.

### Expected Output:

```
✓ Run tests
✓ Verify files
✓ Authenticate via NPM_TOKEN
✓ Publish to npm
  + @33strategies/claudeflow@1.2.0
✓ Create GitHub release
```

### If Workflow Fails:

Common issues:
- **NPM_TOKEN invalid**: Verify token was copied correctly
- **Package name conflict**: Check package name on npm
- **@33strategies scope permissions**: Verify you're a member of the organization
- **semantic-release configuration**: Check .releaserc.json

## Step 5: Verify Package Published

```bash
# Check package on npm
npm view @33strategies/claudeflow

# Should show:
# @33strategies/claudeflow@1.2.0 | MIT | deps: 2 | versions: 1
# Workflow orchestration for Claude Code
```

Visit: https://www.npmjs.com/package/@33strategies/claudeflow

### Verification Checklist:

- [ ] Package exists on npm
- [ ] Version is 1.2.0
- [ ] README.md renders correctly
- [ ] License shows MIT
- [ ] Dependencies show claudekit and update-notifier
- [ ] Installation works: `npm install -g @33strategies/claudeflow`

## Step 6: Test Installation

```bash
# Uninstall if previously installed locally
npm uninstall -g @33strategies/claudeflow

# Install from npm
npm install -g @33strategies/claudeflow

# Verify command available
claudeflow --version
# Should show: claudeflow v1.2.0

# Run doctor
claudeflow doctor

# Test setup (dry run)
claudeflow help
```

## Step 7: Clean Up Token and Workflow

⚠️ **CRITICAL FOR SECURITY**: Must complete after publish succeeds

### 7.1 Delete NPM_TOKEN from GitHub Secrets

1. Go to https://github.com/kennyjpowers/claude-flow/settings/secrets/actions
2. Find "NPM_TOKEN"
3. Click "Remove"
4. Confirm deletion

### 7.2 Revoke Token on npm

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Find token "claudeflow-initial-publish"
3. Click "Revoke"
4. Confirm revocation

### 7.3 Delete Temporary Workflow

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes (includes new tag from release)
git pull origin main

# Delete temporary workflow file
rm .github/workflows/release-token.yml
git add .github/workflows/release-token.yml
git commit -m "chore: remove temporary token-based workflow after successful publish"
git push origin main
```

**Note**: The regular `.github/workflows/release.yml` (OIDC workflow) will remain for all future releases.

## Step 8: Configure npm Trusted Publishers (OIDC)

Now that the package exists, configure OIDC for future publishes:

### 8.1 Navigate to Package Settings

1. Go to https://www.npmjs.com/package/@33strategies/claudeflow/access
2. Or: npmjs.com → Your Profile → Packages → @33strategies/claudeflow → Settings tab

### 8.2 Add Trusted Publisher

1. Find section "Trusted Publisher" or "Trusted publishing with OIDC"
2. Click "Add a trusted publisher"
3. Select provider: **GitHub Actions**
4. Enter configuration (EXACT VALUES - Case Sensitive!):
   - **Organization/User**: `kennyjpowers`
   - **Repository**: `claude-flow` (just repo name, not org/repo)
   - **Workflow filename**: `release.yml` (include .yml extension, case-sensitive)
   - **Environment**: *(leave empty)*
5. Click "Save" or "Add trusted publisher"

### 8.3 Verify Configuration

- Check that configuration appears in Trusted Publishers list
- Verify all fields match exactly:
  - Provider: GitHub Actions
  - Repository: kennyjpowers/claude-flow
  - Workflow: release.yml
  - Environment: (none)

## Step 9: Verify OIDC Publishing Works

The existing `.github/workflows/release.yml` already has OIDC configured (no NPM_TOKEN). Test it:

```bash
# Make a small change to trigger release
# Example: Update CHANGELOG.md with a new entry

git checkout main
git checkout -b feat/test-oidc-publish

# Make a conventional commit (feat: triggers minor version bump)
echo "\n## Test OIDC publishing" >> README.md
git add README.md
git commit -m "feat: verify OIDC publishing works"

# Push to main (or merge via PR)
git checkout main
git merge feat/test-oidc-publish
git push origin main
```

### Monitor OIDC Workflow:

1. Go to https://github.com/kennyjpowers/claude-flow/actions
2. Find "Release" workflow run
3. Check for success messages:
   - ✅ "Authenticate via OpenID Connect (OIDC)"
   - ✅ "Signed provenance statement with source and build information"
   - ✅ "provenance attestation for @33strategies/claudeflow@1.3.0"

### Verify Provenance:

1. Go to https://www.npmjs.com/package/@33strategies/claudeflow
2. Look for:
   - ✅ Provenance badge (shield icon with checkmark)
   - ✅ "Published from GitHub Actions" text
   - ✅ "View signed attestation" link

## Step 10: Notify ClaudeKit Maintainer

Send a friendly message to ClaudeKit maintainer:

### Option A: GitHub Issue

1. Go to https://github.com/carlrannaberg/claudekit/issues
2. Click "New Issue"
3. Title: "New package published: @33strategies/claudeflow (builds on ClaudeKit)"
4. Body:

```markdown
Hi Carl,

I wanted to let you know I've published a new package that builds on top of ClaudeKit:

**Package**: [@33strategies/claudeflow](https://www.npmjs.com/package/@33strategies/claudeflow)
**Description**: Workflow orchestration for Claude Code - end-to-end feature development lifecycle

## Integration with ClaudeKit

claudeflow declares ClaudeKit as a dependency and tightly integrates with it:
- Installs ClaudeKit automatically when users install claudeflow
- Calls `claudekit setup` during installation
- Uses ClaudeKit agents (research-expert, code-review-expert, etc.) in workflow commands
- Provides 8 custom workflow commands that layer on top of ClaudeKit's foundation

## Would love to explore cross-promotion

Since claudeflow builds on ClaudeKit and promotes it to all users, I'd love to discuss potential cross-promotion opportunities. Would you be interested in:
- Mentioning claudeflow in ClaudeKit docs?
- Adding each other to README.md?
- Collaborating on shared workflow patterns?

Thanks for building such a great foundation with ClaudeKit!

Best,
Kenneth
```

### Option B: Email

Send to: carl@claudekit.cc (check GitHub profile for contact info)

## Troubleshooting

### Issue: Package name already taken

**Solution**: Check if you're logged into the correct npm account
```bash
npm whoami
# Should show your npm username
```

### Issue: Not authorized to publish to @33strategies scope

**Solution**: Verify org membership
1. Go to https://www.npmjs.com/settings/33strategies/members
2. Confirm your username is listed
3. Confirm you have "Developer" or "Owner" role

### Issue: OIDC authentication fails

**Symptoms**:
- "Unable to authenticate using OIDC"
- "OIDC token exchange error"

**Solutions**:
1. Verify npm trusted publisher config (Step 8.2)
2. Check workflow filename matches exactly: `release.yml` (case-sensitive)
3. Ensure `.github/workflows/release.yml` has `id-token: write` permission
4. Update npm CLI in workflow:
   ```yaml
   - name: Update npm
     run: npm install -g npm@latest
   ```

### Issue: Provenance not showing on npm

**Solution**:
- Provenance only available with OIDC (not token-based publish)
- Re-publish with OIDC workflow (Step 9)
- Check npm page after OIDC publish completes

## Success Criteria

- [x] Package published to npm: @33strategies/claudeflow@1.2.0+
- [x] Installation works: `npm install -g @33strategies/claudeflow`
- [x] All commands work: setup, doctor, version, help
- [x] NPM_TOKEN deleted from GitHub Secrets
- [x] Token revoked on npmjs.com
- [x] Temporary workflow deleted
- [x] npm Trusted Publishers configured
- [x] OIDC publish tested and working
- [x] Provenance badge visible on npm
- [x] ClaudeKit maintainer notified

## Next Steps

After successful publish:
1. Update implementation summary (specs/package-publishing-strategy/04-implementation.md)
2. Mark tasks complete in STM
3. Create final commit on main branch
4. Update CHANGELOG.md with release notes
5. Announce package on social media / communities
6. Submit to awesome-claude-code list

## References

- npm Trusted Publishers docs: https://docs.npmjs.com/trusted-publishers/
- GitHub Actions OIDC: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
- semantic-release: https://semantic-release.gitbook.io/
- @33strategies/claudeflow: https://www.npmjs.com/package/@33strategies/claudeflow
