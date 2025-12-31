# Claude Skills Collection

A collection of custom skills for [Claude Code](https://claude.com/claude-code).

Skills are reusable expertise that Claude can invoke automatically. Unlike slash commands (you type `/command`), skills are model-invoked - Claude decides when to use them based on context.

## Available Skills

| Skill | Branch | Description |
|-------|--------|-------------|
| **n8n Workflows** | [`n8n-workflows`](../../tree/n8n-workflows) | Build n8n automations from natural language. Design, create, debug, and deploy workflows via API. |
| **Anti AI Slop** | [`sorina-anti-ai-slop`](../../tree/sorina-anti-ai-slop) | Rewrite content in authentic voice - direct, funny, opinionated. No corporate buzzwords or AI-generated fluff. |

## How to Install a Skill

1. Switch to the skill's branch
2. Follow the README instructions in that branch
3. Copy skill files to `~/.claude/my-skills/<skill-name>/`

Or let Claude do it - open the branch in Claude Code and say "set this up".

## Skill Structure

Each skill branch contains:
```
skill/
├── SKILL.md        # Main skill file (required)
├── reference.md    # Extended docs (optional)
├── patterns.md     # Patterns/examples (optional)
└── examples.md     # Ready-to-use examples (optional)
```

## Creating Your Own Skills

Skills are markdown files with YAML frontmatter:

```yaml
---
name: my-skill
description: When to use this skill (Claude reads this to decide)
---

# Skill content here
Instructions, reference material, examples...
```

Best practices:
- Keep SKILL.md under 500 lines
- Put detailed docs in separate files (loaded on demand)
- Description is critical - Claude uses it to decide when to invoke

## Contributing

Feel free to suggest skills or improvements via issues/PRs.

---

*Skills for Claude Code*
