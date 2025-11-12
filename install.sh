#!/usr/bin/env bash

# Claude Config Installation Script
# This script installs ClaudeKit (via npm) and sets up custom configuration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${YELLOW}ℹ${NC} $1"; }

# Configuration
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_TYPE="${1:-project}"  # project, user, or global
TARGET_DIR="${2:-$(pwd)}"
FORCE_FLAG=""
NON_INTERACTIVE=false

# Check for --force flag
for arg in "$@"; do
    if [ "$arg" = "--force" ]; then
        FORCE_FLAG="--force"
        NON_INTERACTIVE=true
    fi
done

echo "================================================"
echo "Claude Config Installation"
echo "================================================"
echo ""

# Step 1: Check prerequisites
print_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher (found: $(node -v))"
    exit 1
fi
print_success "Node.js $(node -v) found"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm -v) found"

if ! command -v claude &> /dev/null; then
    print_error "Claude Code CLI is not installed"
    print_info "Install it first: https://code.claude.com"
    exit 1
fi
print_success "Claude Code CLI found"

echo ""

# Step 2: Install or verify ClaudeKit
print_info "Checking ClaudeKit installation..."

if command -v claudekit &> /dev/null; then
    CLAUDEKIT_VERSION=$(claudekit --version 2>/dev/null || echo "unknown")
    print_success "ClaudeKit $CLAUDEKIT_VERSION is already installed"

    if [ "$NON_INTERACTIVE" = true ]; then
        REPLY="y"
    else
        read -p "Update ClaudeKit to latest version? (y/N): " -n 1 -r
        echo
    fi
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Updating ClaudeKit..."
        npm update -g claudekit
        print_success "ClaudeKit updated"
    fi
else
    print_info "Installing ClaudeKit globally..."
    npm install -g claudekit

    if command -v claudekit &> /dev/null; then
        print_success "ClaudeKit installed successfully"
    else
        print_error "ClaudeKit installation failed"
        exit 1
    fi
fi

echo ""

# Step 3: Determine installation target
case "$TARGET_TYPE" in
    user)
        INSTALL_DIR="$HOME/.claude"
        print_info "Installing to user directory: $INSTALL_DIR"
        ;;
    project)
        INSTALL_DIR="$TARGET_DIR/.claude"
        print_info "Installing to project directory: $INSTALL_DIR"
        ;;
    global)
        INSTALL_DIR="$HOME/.claude"
        print_info "Installing to global user directory: $INSTALL_DIR"
        ;;
    *)
        print_error "Invalid target type: $TARGET_TYPE"
        echo "Usage: $0 [user|project|global] [target-directory] [--force]"
        echo ""
        echo "Options:"
        echo "  user      Install to ~/.claude/ (available in all projects)"
        echo "  project   Install to current project's .claude/"
        echo "  --force   Force overwrite of existing files"
        exit 1
        ;;
esac

# Step 4: Create directory structure
print_info "Setting up directory structure..."
mkdir -p "$INSTALL_DIR/commands"
print_success "Directories created"

# Step 7: Run ClaudeKit setup
echo ""
print_info "Running ClaudeKit setup..."

# Determine setup options based on installation type
if [ "$TARGET_TYPE" = "user" ]; then
    echo "For user/global installation, we recommend installing ALL ClaudeKit components."
    echo "This includes 30+ agents, 20+ commands, and 25+ hooks."
    echo ""
else
    # For project installation, run from project directory
    echo "For project installation, ClaudeKit setup defaults will be based on project needs."
    echo ""
fi
if [ "$NON_INTERACTIVE" = true ]; then
    REPLY="y"
    print_info "Non-interactive mode: running ClaudeKit setup"
else
    read -p "Run 'claudekit setup' now? (Y/n): " -n 1 -r
    echo
fi
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    cd "$TARGET_DIR"
    claudekit setup 
    print_success "ClaudeKit setup complete"
fi

# Step 5: Copy custom commands
print_info "Installing custom commands..."

# Check if commands already exist
if [ -d "$INSTALL_DIR/commands" ] && [ "$(ls -A $INSTALL_DIR/commands 2>/dev/null)" ]; then
    print_info "Existing commands found in $INSTALL_DIR/commands"
    echo ""
    echo "⚠️  WARNING: Re-installing will overwrite files with the same names!"
    echo ""
    echo "Files that will be OVERWRITTEN (same name in both locations):"
    for file in "$REPO_DIR/.claude/commands/"*.md; do
        filename=$(basename "$file")
        if [ -f "$INSTALL_DIR/commands/$filename" ]; then
            echo "  - $filename"
        fi
    done
    echo ""
    echo "Files that will be PRESERVED (different names):"
    for file in "$INSTALL_DIR/commands/"*.md; do
        filename=$(basename "$file")
        if [ ! -f "$REPO_DIR/.claude/commands/$filename" ]; then
            echo "  - $filename"
        fi
    done
    echo ""
    if [ "$NON_INTERACTIVE" = true ]; then
        REPLY="y"
        print_info "Non-interactive mode: proceeding with installation"
    else
        read -p "Continue with installation? This may overwrite existing files (y/N): " -n 1 -r
        echo
    fi
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Installation cancelled"
        exit 0
    fi
fi

cp -r "$REPO_DIR/.claude/commands/"* "$INSTALL_DIR/commands/" 2>/dev/null || true
COMMAND_COUNT=$(find "$INSTALL_DIR/commands" -name "*.md" | wc -l | tr -d ' ')
print_success "Installed $COMMAND_COUNT custom commands"

# Step 6: Handle settings.json
if [ -f "$INSTALL_DIR/settings.json" ]; then
    print_info "Existing settings.json found"
    if [ "$NON_INTERACTIVE" = true ]; then
        REPLY="n"
        print_info "Non-interactive mode: preserving existing settings.json"
    else
        read -p "Backup and replace with example settings? (y/N): " -n 1 -r
        echo
    fi
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp "$INSTALL_DIR/settings.json" "$INSTALL_DIR/settings.json.backup"
        print_success "Backed up to settings.json.backup"
        cp "$REPO_DIR/.claude/settings.json.example" "$INSTALL_DIR/settings.json"
        print_success "Installed example settings.json"
    fi
else
    print_info "Installing example settings.json..."
    cp "$REPO_DIR/.claude/settings.json.example" "$INSTALL_DIR/settings.json"
    print_success "Installed settings.json"
fi



# Step 8: Summary
echo ""
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo ""
echo "Summary:"
echo "  - ClaudeKit: Installed globally via npm"
echo "  - Custom commands: $COMMAND_COUNT installed"
echo "  - Configuration: $INSTALL_DIR"
echo ""
echo "Available custom commands:"
echo "  /ideate          - Structured ideation workflow"
echo "  /ideate-to-spec  - Transform ideation to specification"
echo "  /spec:progress   - Track implementation progress"
echo "  /spec:doc-update - Parallel documentation review"
echo ""
echo "Plus ClaudeKit's 30+ agents including:"
echo "  typescript-expert, react-expert, testing-expert,"
echo "  database-expert, docker-expert, and many more"
echo ""
echo "Plus ClaudeKit's 20+ commands including:"
echo "  /git:commit, /spec:create, /research, /code-review,"
echo "  and comprehensive workflow automation"
echo ""
echo "Next steps:"
echo "  1. Review $INSTALL_DIR/settings.json"
echo "  2. Run 'claude' in your project directory"
echo "  3. Try: '/code-review' or ask Claude to use an agent"
echo "  4. List all agents: 'claudekit list agents'"
echo "  5. List all commands: 'claudekit list commands'"
echo ""
echo "Documentation:"
echo "  - This repo: $REPO_DIR/README.md"
echo "  - ClaudeKit: https://docs.claudekit.cc/"
echo "  - Claude Code: https://docs.claude.com/en/docs/claude-code/"
echo ""
