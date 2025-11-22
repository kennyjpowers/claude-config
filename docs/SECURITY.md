# Security

This document describes the security measures and verification procedures for claudeflow.

## Package Security

### NPM Provenance Attestations

claudeflow is published with npm provenance attestations, which provide cryptographic verification that links each published package version to its source code and build process.

**What is npm provenance?**
- Cryptographically signed attestations that prove package authenticity
- Links published package to specific GitHub repository and commit
- SLSA Level 2 compliance (Supply-chain Levels for Software Artifacts)
- Verifiable by anyone using npm CLI

**Verifying package authenticity:**

```bash
npm view @33strategies/claudeflow --json | jq '.dist.attestations'
```

This shows the provenance attestations, including:
- Source repository (GitHub)
- Commit SHA that the package was built from
- GitHub Actions workflow that performed the build
- Cryptographic signatures

**Benefits:**
- **Transparency:** Anyone can verify the package came from the official repository
- **Integrity:** Ensures the package hasn't been tampered with
- **Accountability:** Clear chain of custody from source code to published package

### Publishing with OIDC (Trusted Publishers)

claudeflow uses npm Trusted Publishers for secure, token-free publishing:

**What is OIDC publishing?**
- OpenID Connect authentication between GitHub Actions and npm
- Short-lived tokens generated per-workflow run (not long-lived NPM_TOKEN secrets)
- Automatic provenance attestations without manual configuration
- Eliminates risk of token leakage or theft

**Security benefits:**
1. **No stored secrets:** No NPM_TOKEN in GitHub Secrets to leak or compromise
2. **Automatic provenance:** SLSA Level 2 attestations generated automatically
3. **Reduced attack surface:** Tokens only exist during CI/CD run
4. **Audit trail:** Every publish is cryptographically linked to specific GitHub Actions run

**How it works:**
1. GitHub Actions workflow requests OIDC token from GitHub
2. npm validates the token and authenticates the workflow
3. Package is published with automatic provenance attestations
4. All artifacts are cryptographically signed and linked to source

**Verification:**
All releases are built and published via GitHub Actions. You can verify:
- Check `.github/workflows/release.yml` in the repository
- View provenance attestations (command above)
- Inspect GitHub Actions runs for all releases

### Dependency Security

claudeflow has minimal dependencies to reduce attack surface:

**Runtime dependencies:**
- `claudekit` (required) - 30+ agents, commands, hooks
- `update-notifier` - Notify users of available updates

**Development dependencies:**
- `semantic-release` - Automated version management
- `@semantic-release/changelog` - Generate CHANGELOG.md
- `@semantic-release/git` - Commit release assets

**Security practices:**
- All dependencies are locked via package-lock.json
- Dependabot automatically creates PRs for security updates
- npm audit runs in CI/CD pipeline
- Critical vulnerabilities fail the build

**Check for vulnerabilities:**
```bash
npm install -g @33strategies/claudeflow
npm audit
```

## Installation Security

### No Arbitrary Code Execution

The claudeflow CLI is designed with security in mind:

- ✅ No `eval()` or `Function()` calls
- ✅ No shell command construction from user input
- ✅ All file paths validated to prevent directory traversal
- ✅ Cross-platform file operations using Node.js APIs (not shell commands)

### File Permissions

Installation respects system security:

- **Unix/macOS:** Respects umask (default 644 for files, 755 for directories)
- **Windows:** Uses default Windows ACLs
- **No chmod operations:** Let the operating system handle permissions
- **User-only access:** Settings files readable only by installing user

### Settings Protection

Configuration files should never contain secrets:

**Best practices:**
- Use environment variable references: `"API_KEY": "${API_KEY}"`
- Never commit secrets to `.claude/settings.json`
- Keep `.env` files gitignored
- Use `.claude/settings.local.json` for personal/sensitive overrides (gitignored)

**File-guard hook:**
ClaudeKit provides a `file-guard` hook that prevents Claude Code from reading or modifying sensitive files:

```json
{
  "permissions": {
    "deny": [".env", "**/*.key", "secrets/", "**/*.pem"]
  }
}
```

## Supply Chain Security

### Development

- ✅ Dependencies locked with package-lock.json
- ✅ Dependency changes reviewed in pull requests
- ✅ Dependabot automated security updates
- ✅ 2FA required for npm publishing
- ✅ Code review required for all changes

### Publishing

- ✅ Publish only from GitHub Actions (not local machines)
- ✅ npm Trusted Publishers (OIDC) - no long-lived tokens
- ✅ Automatic provenance attestations (SLSA Level 2)
- ✅ Signed commits required for releases
- ✅ `id-token: write` permission in workflow for OIDC

**GitHub Actions workflow security:**
```yaml
permissions:
  contents: write
  id-token: write    # Required for npm OIDC authentication
  issues: write
  pull-requests: write
```

### Distribution

- ✅ Published via official npm registry (not third-party mirrors)
- ✅ Package integrity checksums (SHA-512)
- ✅ Provenance attestations for verification
- ✅ All releases tagged and signed in git

## Reporting Security Issues

If you discover a security vulnerability in claudeflow:

1. **Do NOT create a public GitHub issue**
2. **Email:** 33strategies@duck.com
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response timeline:**
- Initial response: Within 48 hours
- Severity assessment: Within 7 days
- Fix timeline: Based on severity (critical: immediate, high: 7 days, medium: 30 days)

**Disclosure policy:**
- Security fixes are released before public disclosure
- Credit given to reporter (unless anonymity requested)
- CVE assigned for critical vulnerabilities

## Security Best Practices for Users

### Installation

1. **Verify package name:** `@33strategies/claudeflow` (beware of typosquatting)
2. **Check provenance:** Run `npm view @33strategies/claudeflow --json | jq '.dist.attestations'`
3. **Review package contents:** `npm pack && tar -tzf @33strategies-claudeflow-*.tgz`
4. **Use official registry:** Don't use unofficial mirrors or proxies

### Usage

1. **Enable file-guard hook:** Protect sensitive files from AI access
2. **Never commit secrets:** Use environment variables
3. **Review settings.json:** Understand what's being configured
4. **Keep updated:** Install security updates promptly
5. **Use .local files:** Keep personal/sensitive configs in gitignored files

### For Teams

1. **Code review:** Require reviews for changes to `.claude/settings.json`
2. **Least privilege:** Only grant necessary permissions
3. **Audit regularly:** Review what files/commands are accessible
4. **Document policies:** Clear guidelines in CLAUDE.md
5. **Monitor access:** Use git history to track configuration changes

## Third-Party Security Audits

claudeflow has not undergone a formal security audit. However:

- Built on official npm and Node.js APIs (well-audited)
- ClaudeKit dependency is actively maintained with security updates
- Code is open source and publicly auditable
- Uses standard security practices (no custom crypto, no eval, etc.)

**For enterprise users:**
If you require a formal security audit, please contact 33strategies@duck.com to discuss arrangements.

## Compliance

### SLSA (Supply-chain Levels for Software Artifacts)

claudeflow achieves **SLSA Level 2** compliance through:

- ✅ **Version control:** All source code in GitHub
- ✅ **Build service:** GitHub Actions (hosted build platform)
- ✅ **Build as code:** `.github/workflows/release.yml` defines build process
- ✅ **Provenance:** Automatically generated attestations
- ✅ **Cryptographic signing:** npm provenance with OIDC

### License

- **MIT License:** Permissive open source license
- **No patent claims:** Free to use commercially
- **No warranty:** Provided "as is" (see LICENSE file)

## Security Updates

### Update Notifications

claudeflow checks for updates weekly and displays notifications:

```
╭───────────────────────────────────────────────────╮
│                                                   │
│   Update available: 1.3.0                        │
│   Current version:  1.2.0                        │
│   Run: npm install -g @33strategies/claudeflow   │
│                                                   │
╰───────────────────────────────────────────────────╯
```

**Security update policy:**
- Critical: Released immediately, notification within 24 hours
- High: Released within 7 days
- Medium: Included in next scheduled release
- Low: Bundled with feature releases

### Staying Informed

- **Watch the repository:** Get notified of new releases
- **Check CHANGELOG.md:** All security fixes documented
- **GitHub Security Advisories:** Critical issues published at https://github.com/kennyjpowers/claude-flow.git/security/advisories
- **npm advisory database:** Automatically checked by `npm audit`

## Resources

- **SLSA Framework:** https://slsa.dev
- **npm Provenance:** https://docs.npmjs.com/generating-provenance-statements
- **npm Trusted Publishers:** https://docs.npmjs.com/trusted-publishers
- **GitHub OIDC:** https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
- **npm Security Best Practices:** https://docs.npmjs.com/packages-and-modules/securing-your-code

## Changelog

### v1.2.0 (2025-11-21)
- Initial security documentation
- npm provenance attestations enabled
- OIDC/Trusted Publishers publishing
- SLSA Level 2 compliance achieved
