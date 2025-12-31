# Claude Code Skills - Technical Specification

## Overview

This document provides comprehensive technical specifications for Claude Code Skills, compiled for the n8n Workflow Assistant project development.

---

## What Are Agent Skills?

**Agent Skills** are modular capabilities that extend Claude's functionality through organized directories containing:
- **SKILL.md file** (required) - Contains instructions and metadata
- **Supporting files** (optional) - Scripts, templates, reference materials
- **Resources** - Documentation, schemas, examples

**Key characteristic**: Skills are **model-invoked** (Claude autonomously decides when to use them), not user-invoked like slash commands which require explicit `/command` invocation.

Skills transform general-purpose agents into specialists by packaging domain-specific expertise, workflows, context, and best practices that can be discovered and used across conversations.

---

## How Skills Work - Three-Level Loading Architecture

Skills use progressive disclosure to minimize token usage:

| Level | When Loaded | Token Cost | Content |
|-------|-------------|------------|---------|
| **Level 1: Metadata** | Always (startup) | ~100 tokens per Skill | `name` and `description` from YAML frontmatter |
| **Level 2: Instructions** | When Skill triggered | Under 5k tokens | SKILL.md body with instructions |
| **Level 3+: Resources** | As needed | Zero (filesystem) | Bundled files executed via bash |

**Execution flow**:
1. System prompt includes all Skill metadata at startup
2. When request matches a Skill description, Claude reads SKILL.md via bash
3. Claude reads additional referenced files only when needed
4. Scripts execute without loading their code into context - only output is consumed

This architecture eliminates context penalties for large bundled resources.

---

## File Structure and Format

### Directory Structure

```
my-skill-name/
├── SKILL.md          (required)
├── reference.md      (optional)
├── examples.md       (optional)
├── scripts/
│   ├── helper.py
│   └── validate.py
└── templates/
    └── template.txt
```

### SKILL.md Format

```yaml
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
allowed-tools: Read, Grep, Glob
---

# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.
```

---

## YAML Frontmatter Requirements

| Field | Requirements | Max Length | Notes |
|-------|--------------|------------|-------|
| `name` | Lowercase letters, numbers, hyphens only | 64 chars | No XML tags, reserved words (anthropic, claude) |
| `description` | What it does + when to use it | 1024 chars | No XML tags, critical for discovery |
| `allowed-tools` | Tool names (optional) | N/A | Restricts Claude's tool access |

### Name Field Rules
- Must contain only `[a-z0-9-]`
- No uppercase letters
- No spaces
- No reserved words: `anthropic`, `claude`

### Description Best Practices

The description is **critical for skill discovery**. Guidelines:
- Include specific keywords users might mention
- Write in third person ("Analyzes Excel files" not "I can analyze")
- Be concrete, not vague
- Include trigger scenarios

**Good example**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Bad example**:
```yaml
description: Helps with documents
```

### Allowed-Tools Field

Restricts which tools Claude can use when this skill is active:
```yaml
allowed-tools: Read, Grep, Glob, Write, Bash
```

When specified, Claude can **only** use listed tools without permission prompts.

---

## Skill Storage Locations

| Location | Scope | Purpose | Shared via |
|----------|-------|---------|------------|
| `~/.claude/skills/` | Personal | Individual workflows | Manual copying |
| `.claude/skills/` | Project | Team workflows | Git repository |
| Plugins | Both | Distributed capabilities | Plugin marketplaces |

---

## Skill Invocation

### Automatic (Model-Invoked)

No explicit invocation required. Ask naturally:
```
Can you help me create an n8n workflow?
```

If matching Skill exists, Claude uses it automatically based on description matching.

### Execution Pattern

1. **Startup**: Skill metadata pre-loaded into system prompt
2. **Request matching**: Claude evaluates if description matches user request
3. **Content loading**: Claude reads SKILL.md via bash
4. **File access**: Claude uses bash to read referenced files as needed
5. **Script execution**: Claude runs scripts via bash, consuming only output

---

## Implementation Examples

### Simple Single-File Skill

```yaml
---
name: generating-commit-messages
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---

# Generating Commit Messages

## Instructions

1. Run `git diff --staged` to see changes
2. Suggest a commit message with:
   - Summary under 50 characters
   - Detailed description
   - Affected components

## Best practices

- Use present tense
- Explain what and why, not how
```

### Multi-File Skill with Scripts

```
pdf-processing/
├── SKILL.md
├── FORMS.md
├── REFERENCE.md
└── scripts/
    ├── analyze_form.py
    ├── fill_form.py
    └── validate.py
```

**SKILL.md with references**:
```markdown
# PDF Processing

## Quick start

Extract text:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For form filling, see [FORMS.md](FORMS.md)
For detailed API, see [REFERENCE.md](REFERENCE.md)
```

### Read-Only Skill with Tool Restrictions

```yaml
---
name: code-reviewer
description: Review code for best practices and potential issues
allowed-tools: Read, Grep, Glob
---

# Code Reviewer

This Skill provides read-only code analysis.

## Review process

1. Read target files
2. Search for patterns
3. Provide detailed feedback
```

---

## Best Practices

### Core Principles

1. **Keep focused** - One Skill per capability
2. **Write specific descriptions** - Include keywords and context triggers
3. **Be concise** - SKILL.md under 500 lines
4. **Use progressive disclosure** - Split large content across files
5. **Test with all models** - Haiku, Sonnet, and Opus

### Naming Conventions

**Recommended formats**:
- Gerund form (verb + -ing): `processing-pdfs`, `analyzing-spreadsheets`
- Action form: `process-pdfs`, `analyze-spreadsheets`

**Avoid**:
- Generic names: `helper`, `utils`, `documents`
- Reserved prefixes: `anthropic-xxx`, `claude-xxx`

### Description Structure

```yaml
description: [What it does]. Use when [specific scenarios and keywords].
```

**Example for n8n**:
```yaml
description: Create and configure n8n workflows from natural language descriptions. Use when designing workflows, creating automations, or setting up n8n integrations.
```

### File Organization Patterns

**Pattern 1 - Reference links**:
```markdown
## Quick start
[Basic content]

## Advanced features
See [FORMS.md](FORMS.md) for form filling
See [REFERENCE.md](REFERENCE.md) for API details
```

**Pattern 2 - Domain organization**:
```
n8n-skill/
├── SKILL.md (navigation)
└── reference/
    ├── nodes/
    ├── triggers/
    └── integrations/
```

**Pattern 3 - Conditional details**:
```markdown
## Creating workflows
Basic workflow creation steps

## Advanced
For webhook triggers: See [WEBHOOKS.md](WEBHOOKS.md)
For error handling: See [ERROR-HANDLING.md](ERROR-HANDLING.md)
```

### Development Approach (Evaluation-Driven)

1. Run Claude on task without Skill
2. Document specific failures
3. Create evaluations for those gaps
4. Write minimal content to pass evaluations
5. Iterate based on real usage

---

## Limitations and Constraints

### Cross-Surface Limitations

- Skills don't automatically sync between Claude.ai, API, and Claude Code
- Must upload/recreate separately for each surface

### Sharing Scope

| Surface | Sharing |
|---------|---------|
| Claude.ai | Individual user only |
| Claude API | Workspace-wide |
| Claude Code | Personal or project; shareable via plugins |

### Runtime Environment

| Surface | Network | Packages | Constraints |
|---------|---------|----------|-------------|
| Claude.ai | User-dependent | Can install | Varies by settings |
| Claude API | No network | Pre-installed only | No external API calls |
| Claude Code | Full access | Can install locally | No global install recommended |

### Request Limits

- Maximum **8 Skills** per request
- Maximum **8MB** upload size
- YAML validation required

### Performance Constraints

- SKILL.md body should be under **500 lines**
- Avoid deeply nested file references (keep **1 level deep**)
- Use table of contents in reference files >100 lines

---

## Integration with Other Claude Code Features

### Skills vs Slash Commands

| Aspect | Skills | Slash Commands |
|--------|--------|----------------|
| Invocation | Model-invoked (automatic) | User-invoked (explicit /cmd) |
| Use case | Domain expertise, workflows | Quick utilities, shortcuts |
| Context | Loaded on demand | Loaded on invocation |
| Parameters | Not parameterized | Support $1, $2, $ARGUMENTS |

### When to Use Skills

- Complex workflows needing multiple steps
- Domain-specific expertise
- Reference materials and documentation
- Deterministic operations

### When to Use Slash Commands

- Quick utilities
- Shortcuts for repeated tasks
- Operations with variable parameters
- Simple transformations

### Integration with Hooks

- Hooks can be triggered during Skill execution
- Hooks can prevent or modify Skill tool usage
- Hooks see MCP tools with format: `ServerName:tool_name`

### Integration with MCP Servers

- Skills can reference MCP tools
- Use fully qualified names: `ServerName:tool_name`
- Example: `BigQuery:bigquery_schema`, `GitHub:create_issue`

---

## Technical Details

### File Paths

- Always use forward slashes: `scripts/helper.py`
- Never Windows-style: `scripts\helper.py` (breaks on Unix)

### Package Requirements

- Must be listed in SKILL.md description
- Claude Code: Can install via pip/npm
- Claude API: Only pre-installed packages available
- List packages explicitly in instructions

### Script Execution

- Scripts execute without loading code into context
- Only output consumes tokens
- Script exit codes can signal errors
- Prefer scripts for deterministic operations

### Resource Files

- No context penalty until accessed
- Can include large datasets, API docs, examples
- Organize by domain or feature
- Use descriptive names

---

## Application to n8n Workflow Assistant

Based on this specification, our n8n skills should:

### Recommended Skill Structure

```
.claude/skills/
├── n8n-workflow-designer/
│   ├── SKILL.md
│   ├── NODE-REFERENCE.md
│   ├── TRIGGERS.md
│   ├── INTEGRATIONS.md
│   └── templates/
│       ├── email-workflow.json
│       └── webhook-workflow.json
├── n8n-workflow-creator/
│   ├── SKILL.md
│   ├── API-REFERENCE.md
│   └── scripts/
│       └── validate-workflow.py
├── n8n-workflow-debugger/
│   ├── SKILL.md
│   ├── ERROR-CODES.md
│   └── TROUBLESHOOTING.md
└── n8n-workflow-tester/
    ├── SKILL.md
    └── TEST-PATTERNS.md
```

### Key Skill Descriptions for n8n

```yaml
# Designer
name: n8n-workflow-designer
description: Design n8n workflows from natural language descriptions. Converts business requirements into workflow designs with appropriate nodes, triggers, and integrations. Use when planning automations, describing what should happen, or asking about workflow possibilities.

# Creator
name: n8n-workflow-creator
description: Create and deploy n8n workflows via the REST API. Handles JSON structure, node configuration, and API calls. Use when ready to build a workflow, after design approval, or when creating from templates.

# Debugger
name: n8n-workflow-debugger
description: Analyze and fix failing n8n workflows. Reads execution logs, identifies errors, and explains problems in plain language. Use when workflows fail, produce unexpected results, or need troubleshooting.

# Tester
name: n8n-workflow-tester
description: Test n8n workflows with sample data and validate outputs. Triggers test executions and reports results clearly. Use when verifying workflows work correctly or testing changes.
```

---

## Sources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills.md)
- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview.md)
- [Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)
- [Using Skills with the Claude API](https://platform.claude.com/docs/en/build-with-claude/skills-guide.md)
- [Agent Skills in the SDK](https://platform.claude.com/docs/en/agent-sdk/skills.md)

---

*Document compiled for n8n Workflow Assistant project - December 2025*
