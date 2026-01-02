# Anthropic Official Skills Collection

Curated collection of **6 core skills** from Anthropic's official Claude skills repository. These are the most universally useful skills for document handling and extending Claude's capabilities.

---

## Quick Start

### 1. Clone this branch
```bash
git clone -b anthropic-skills https://github.com/SorinaW/Claude-Skills-Collection.git anthropic-skills
```

### 2. Copy to your Claude skills folder
```bash
# Windows
xcopy /E /I anthropic-skills\skills "C:\Users\YOUR_USER\.claude\my-skills\anthropic-skills"

# Mac/Linux
cp -r anthropic-skills/skills ~/.claude/my-skills/anthropic-skills
```

### 3. Install dependencies (see below for each skill)

---

## Skills Overview

| Skill | Category | Dependencies | Status |
|-------|----------|--------------|--------|
| [pdf](#pdf-skill) | Document | Python: pypdf, pdfplumber, reportlab | Tested |
| [docx](#docx-skill) | Document | Node: docx | Tested |
| [xlsx](#xlsx-skill) | Document | Python: openpyxl, pandas | Tested |
| [pptx](#pptx-skill) | Document | Python: python-pptx | Tested |
| [mcp-builder](#mcp-builder-skill) | Builder | None (guidance) | Ready |
| [skill-creator](#skill-creator-skill) | Builder | None (guidance) | Ready |

---

## Installation & Testing

### PDF Skill

**Install dependencies:**
```bash
pip install pypdf pdfplumber reportlab
```

**Test it works:**
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas('test.pdf', pagesize=letter)
c.drawString(100, 700, 'PDF Skill Test - SUCCESS!')
c.save()
print('Created: test.pdf')
```

**What it does:**
- Extract text and tables from PDFs (pdfplumber)
- Create new PDFs (reportlab)
- Merge, split, rotate PDFs (pypdf)
- Handle PDF forms

**Key files:**
- `SKILL.md` - Main instructions
- `forms.md` - PDF form handling
- `reference.md` - API reference
- `scripts/` - Helper utilities

---

### DOCX Skill

**Install dependencies (in the docx folder):**
```bash
cd skills/docx
npm init -y
npm install docx
```

**Test it works:**
```javascript
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'DOCX Skill Test - SUCCESS!', bold: true })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('test.docx', buffer);
  console.log('Created: test.docx');
});
```

**What it does:**
- Create Word documents from scratch
- Edit existing documents
- Track changes and comments
- Work with OOXML structure

**Key files:**
- `SKILL.md` - Main instructions
- `docx-js.md` - JavaScript guide for creating docs
- `ooxml.md` - OOXML format reference for editing

---

### XLSX Skill

**Install dependencies:**
```bash
pip install openpyxl pandas
```

**Test it works:**
```python
from openpyxl import Workbook
from openpyxl.styles import Font

wb = Workbook()
sheet = wb.active
sheet['A1'] = 'XLSX Skill Test - SUCCESS!'
sheet['A1'].font = Font(bold=True)
sheet['A3'] = 'Sales'
sheet['B3'] = 100
sheet['A4'] = 'Costs'
sheet['B4'] = 60
sheet['A5'] = 'Profit'
sheet['B5'] = '=B3-B4'  # Formula!
wb.save('test.xlsx')
print('Created: test.xlsx')
```

**What it does:**
- Create spreadsheets with formulas
- Format cells and ranges
- Data analysis with pandas
- Recalculate formulas (requires LibreOffice)

**Key files:**
- `SKILL.md` - Main instructions
- `recalc.py` - Formula recalculation script

---

### PPTX Skill

**Install dependencies:**
```bash
pip install python-pptx
```

**Test it works:**
```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[6])

txBox = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(8), Inches(1))
tf = txBox.text_frame
tf.paragraphs[0].text = 'PPTX Skill Test - SUCCESS!'
tf.paragraphs[0].font.size = Pt(32)
tf.paragraphs[0].font.bold = True

prs.save('test.pptx')
print('Created: test.pptx')
```

**What it does:**
- Create presentations from scratch
- Use layouts and templates
- Add charts and graphics
- Convert HTML to PowerPoint

**Key files:**
- `SKILL.md` - Main instructions
- `html2pptx.md` - HTML to PPTX conversion
- `scripts/` - Helper scripts

---

### MCP Builder Skill

**No installation required** - This is a guidance skill.

**What it does:**
- Guide for creating MCP servers
- Python (FastMCP) and Node (MCP SDK) patterns
- Tool definition best practices
- Testing and evaluation guidance

**When you actually build an MCP server:**
```bash
# Python
pip install fastmcp

# Node/TypeScript
npm install @modelcontextprotocol/sdk
```

**Key files:**
- `SKILL.md` - Main guide
- `reference/` - Detailed documentation

---

### Skill Creator Skill

**No installation required** - This is a guidance skill.

**What it does:**
- Guide for creating Claude skills
- Skill structure and format
- Best practices
- Helper scripts included

**Key files:**
- `SKILL.md` - Main guide
- `scripts/init_skill.py` - Initialize new skill
- `scripts/package_skill.py` - Package for distribution
- `scripts/quick_validate.py` - Validate skill format

---

## Folder Structure

After installation, your skills folder should look like:

```
~/.claude/my-skills/anthropic-skills/
├── pdf/
│   ├── SKILL.md
│   ├── forms.md
│   ├── reference.md
│   └── scripts/
├── docx/
│   ├── SKILL.md
│   ├── docx-js.md
│   ├── ooxml.md
│   ├── ooxml/
│   ├── scripts/
│   ├── package.json      # After npm install
│   └── node_modules/     # After npm install
├── xlsx/
│   ├── SKILL.md
│   └── recalc.py
├── pptx/
│   ├── SKILL.md
│   ├── html2pptx.md
│   ├── ooxml/
│   └── scripts/
├── mcp-builder/
│   ├── SKILL.md
│   ├── reference/
│   └── scripts/
└── skill-creator/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

---

## Dependencies Summary

| Skill | Type | Install Command |
|-------|------|-----------------|
| pdf | Python | `pip install pypdf pdfplumber reportlab` |
| docx | Node | `npm install docx` (in docx folder) |
| xlsx | Python | `pip install openpyxl pandas` |
| pptx | Python | `pip install python-pptx` |
| mcp-builder | None | Guidance only |
| skill-creator | None | Guidance only |

**Install all Python dependencies at once:**
```bash
pip install pypdf pdfplumber reportlab openpyxl pandas python-pptx
```

---

## Source

These skills are from Anthropic's official repository:
https://github.com/anthropics/skills

## License

Each skill contains its own `LICENSE.txt` file. See individual skill folders for licensing terms.

---

## Not Included

The following Anthropic skills were excluded (niche use cases):

| Skill | Why Excluded |
|-------|--------------|
| webapp-testing | Covered by Playwright MCP |
| frontend-design | Dev niche |
| web-artifacts-builder | Dev niche |
| brand-guidelines | Marketing niche |
| internal-comms | Corporate niche |
| doc-coauthoring | Collaboration niche |
| theme-factory | Design niche |
| algorithmic-art | Creative/fun |
| canvas-design | Creative/fun |
| slack-gif-creator | Creative/fun |
