# Claude Skills Collection

Custom skills for [Claude Code](https://claude.com/claude-code).

---

## How to Install

1. Click a skill branch below
2. Copy the branch URL
3. Paste it in Claude Code and say **"set this up"**

Claude will read the README and guide you through installation.

---

## Available Skills

| Skill | Branch | Description |
|-------|--------|-------------|
| **n8n Workflows** | [`n8n-workflows`](../../tree/n8n-workflows) | Build n8n automations from natural language. Design, create, debug, and deploy workflows via API. |
| **Anti AI Slop** | [`sorina-anti-ai-slop`](../../tree/sorina-anti-ai-slop) | Rewrite content in authentic voice - direct, funny, opinionated. No corporate buzzwords. |

---

## What Are Skills?

Skills are reusable expertise that Claude invokes automatically. Unlike slash commands (you type `/command`), skills are model-invoked - Claude decides when to use them based on context.

Each skill branch contains:
```
skill/
├── SKILL.md        # Main skill file (required)
├── reference.md    # Extended docs (optional)
└── examples.md     # Ready-to-use examples (optional)
```

---

## Creating Your Own Skills

Skills are markdown files with YAML frontmatter:

```yaml
---
name: my-skill
description: When to use this skill (Claude reads this to decide)
---

# Skill content here
```

Best practices:
- Keep SKILL.md under 500 lines
- Put detailed docs in separate files
- Description is critical - Claude uses it to decide when to invoke

---

*Skills for Claude Code*
