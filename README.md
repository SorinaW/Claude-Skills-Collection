# Anthropic Official Skills Collection

Curated collection of **6 core skills** from Anthropic's official Claude skills repository. These are the most universally useful skills for document handling and extending Claude's capabilities.

## Skills Overview

| Skill | Category | What It Does |
|-------|----------|--------------|
| [pdf](./skills/pdf/) | Document | Extract text/tables, create PDFs, merge files, handle forms |
| [docx](./skills/docx/) | Document | Create/edit Word documents with tracked changes |
| [xlsx](./skills/xlsx/) | Document | Excel spreadsheets with formulas, formatting, analysis |
| [pptx](./skills/pptx/) | Document | PowerPoint presentations with layouts, templates, charts |
| [mcp-builder](./skills/mcp-builder/) | Builder | Create custom MCP servers to extend Claude |
| [skill-creator](./skills/skill-creator/) | Builder | Interactive skill builder (meta-skill) |

---

## Document Skills

### [pdf](./skills/pdf/)
**Extract, create, and manipulate PDF files**

- Extract text and tables from PDFs
- Create new PDF documents
- Merge multiple PDFs
- Handle PDF forms
- Scripts: `scripts/` folder with helper utilities

Key files:
- `SKILL.md` - Main skill instructions
- `forms.md` - PDF form handling guide
- `reference.md` - API reference

---

### [docx](./skills/docx/)
**Word document creation and editing**

- Create professional Word documents
- Edit existing documents
- Track changes and comments
- Apply formatting and styles
- Work with OOXML structure

Key files:
- `SKILL.md` - Main skill instructions
- `docx-js.md` - JavaScript implementation guide
- `ooxml.md` - OOXML format reference
- `ooxml/` - Template files

---

### [xlsx](./skills/xlsx/)
**Excel spreadsheet handling**

- Create spreadsheets with data
- Apply formulas and functions
- Format cells and ranges
- Data analysis and charts
- Recalculate formulas programmatically

Key files:
- `SKILL.md` - Main skill instructions
- `recalc.py` - Formula recalculation script

---

### [pptx](./skills/pptx/)
**PowerPoint presentation creation**

- Create presentations from scratch
- Use layouts and templates
- Add charts and graphics
- Apply themes and styling
- Convert HTML to PowerPoint

Key files:
- `SKILL.md` - Main skill instructions
- `html2pptx.md` - HTML to PPTX conversion guide
- `scripts/` - Helper scripts

---

## Builder Skills

### [mcp-builder](./skills/mcp-builder/)
**Create custom MCP servers**

Extend Claude's capabilities by building your own Model Context Protocol servers. This skill guides you through:

- MCP server architecture
- Tool definition patterns
- Resource handling
- Best practices for production servers

Key files:
- `SKILL.md` - Main skill instructions

---

### [skill-creator](./skills/skill-creator/)
**Build better Claude skills**

A meta-skill that helps you create high-quality custom skills. Learn:

- Skill structure and format
- Best practices for instructions
- Testing and iteration
- Distribution patterns

Key files:
- `SKILL.md` - Main skill instructions

---

## Source

These skills are from Anthropic's official repository:
https://github.com/anthropics/skills

## License

Each skill contains its own `LICENSE.txt` file. See individual skill folders for licensing terms.

---

## Not Included (Other Categories)

The following Anthropic skills were excluded as they serve more niche purposes:

| Skill | Category | Why Excluded |
|-------|----------|--------------|
| webapp-testing | Testing | Covered by Playwright MCP |
| frontend-design | Dev | Niche use case |
| web-artifacts-builder | Dev | Niche use case |
| brand-guidelines | Marketing | Niche use case |
| internal-comms | Corporate | Niche use case |
| doc-coauthoring | Collab | Niche use case |
| theme-factory | Design | Niche use case |
| algorithmic-art | Creative | Fun/creative only |
| canvas-design | Creative | Fun/creative only |
| slack-gif-creator | Creative | Fun/creative only |
