# Anthropic Official Skills Collection

> **Official Source**: [github.com/anthropics/skills](https://github.com/anthropics/skills)

Complete collection of **all 16 official skills** published by Anthropic for Claude Code and Claude.ai. These are the same skills available in the Anthropic skills marketplace, packaged for easy local installation.

Each skill includes:
- `SKILL.md` - The skill prompt and instructions
- `DEPENDENCIES.md` - Required libraries and installation status
- `LICENSE.txt` - Anthropic's license terms

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

### 3. Install dependencies (see below)

---

## All 16 Official Skills

### Document Skills (4)
| Skill | What It Does | Dependencies |
|-------|--------------|--------------|
| [pdf](./skills/pdf/) | Extract, create, merge PDFs, handle forms | Python: pypdf, pdfplumber, reportlab |
| [docx](./skills/docx/) | Word documents with tracked changes | Node: docx |
| [xlsx](./skills/xlsx/) | Excel with formulas, formatting | Python: openpyxl, pandas |
| [pptx](./skills/pptx/) | PowerPoint presentations | Python: python-pptx |

### Builder Skills (2)
| Skill | What It Does | Dependencies |
|-------|--------------|--------------|
| [mcp-builder](./skills/mcp-builder/) | Create custom MCP servers | Guidance only |
| [skill-creator](./skills/skill-creator/) | Build Claude skills | Guidance only |

### Creative Skills (3)
| Skill | What It Does | Dependencies |
|-------|--------------|--------------|
| [algorithmic-art](./skills/algorithmic-art/) | Generative art with p5.js | Node: p5, canvas |
| [canvas-design](./skills/canvas-design/) | Visual art in PNG/PDF | Python: pillow |
| [slack-gif-creator](./skills/slack-gif-creator/) | Optimized animated GIFs | Python: pillow |

### Development Skills (3)
| Skill | What It Does | Dependencies |
|-------|--------------|--------------|
| [frontend-design](./skills/frontend-design/) | UI/UX development guidance | Guidance only |
| [webapp-testing](./skills/webapp-testing/) | Playwright browser testing | Python: playwright |
| [web-artifacts-builder](./skills/web-artifacts-builder/) | React/Tailwind/shadcn artifacts | Bash scripts |

### Business Skills (4)
| Skill | What It Does | Dependencies |
|-------|--------------|--------------|
| [brand-guidelines](./skills/brand-guidelines/) | Anthropic brand colors/typography | Guidance only |
| [internal-comms](./skills/internal-comms/) | Status reports, newsletters, FAQs | Guidance only |
| [doc-coauthoring](./skills/doc-coauthoring/) | Collaborative document workflow | Guidance only |
| [theme-factory](./skills/theme-factory/) | 10 professional themes for artifacts | Guidance only |

---

## Installation & Testing

### Document Skills

#### PDF Skill
```bash
pip install pypdf pdfplumber reportlab
```
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
c = canvas.Canvas('test.pdf', pagesize=letter)
c.drawString(100, 700, 'PDF Test - SUCCESS!')
c.save()
```

#### DOCX Skill
```bash
cd skills/docx && npm init -y && npm install docx
```
```javascript
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');
const doc = new Document({
  sections: [{ children: [new Paragraph({ children: [new TextRun('DOCX Test!')] })] }]
});
Packer.toBuffer(doc).then(b => fs.writeFileSync('test.docx', b));
```

#### XLSX Skill
```bash
pip install openpyxl pandas
```
```python
from openpyxl import Workbook
wb = Workbook()
wb.active['A1'] = 'XLSX Test - SUCCESS!'
wb.active['B1'] = '=1+1'
wb.save('test.xlsx')
```

#### PPTX Skill
```bash
pip install python-pptx
```
```python
from pptx import Presentation
from pptx.util import Inches, Pt
prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[6])
txBox = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(8), Inches(1))
txBox.text_frame.paragraphs[0].text = 'PPTX Test - SUCCESS!'
prs.save('test.pptx')
```

---

### Creative Skills

#### Algorithmic Art Skill
```bash
cd skills/algorithmic-art && npm init -y && npm install p5 canvas
```
Browser-based skill using p5.js for generative art. Creates HTML + JS files.

#### Canvas Design Skill
```bash
pip install pillow
```
Creates visual designs in PNG format. Includes 40+ TTF fonts.

#### Slack GIF Creator Skill
```bash
pip install pillow
# Optional: choco install gifsicle (Windows) or brew install gifsicle (Mac)
```
Creates optimized animated GIFs for Slack/Discord.

---

### Development Skills

#### Frontend Design Skill
**No installation** - Guidance for creating distinctive UI that avoids "AI slop" aesthetics.

#### Webapp Testing Skill
```bash
pip install playwright
playwright install chromium
```
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://example.com')
    page.screenshot(path='test.png')
    browser.close()
```

#### Web Artifacts Builder Skill
**Bash scripts** for creating React + TypeScript + Tailwind + shadcn/ui projects that bundle into single HTML artifacts.

---

### Business Skills

All business skills are **guidance only** - no installation required:
- **brand-guidelines** - Anthropic brand colors (#141413, #faf9f5, accents) and typography (Poppins, Lora)
- **internal-comms** - Templates for 3P updates, newsletters, FAQs, status reports
- **doc-coauthoring** - 3-stage workflow: Context Gathering, Refinement, Reader Testing
- **theme-factory** - 10 professional themes (Ocean Depths, Sunset Boulevard, Forest Canopy, etc.)

---

## Install All Dependencies

**All Python packages:**
```bash
pip install pypdf pdfplumber reportlab openpyxl pandas python-pptx pillow playwright
playwright install chromium
```

**Node packages (run in each skill folder):**
```bash
# docx
cd skills/docx && npm init -y && npm install docx

# algorithmic-art
cd skills/algorithmic-art && npm init -y && npm install p5 canvas
```

---

## Folder Structure

```
~/.claude/my-skills/anthropic-skills/
├── pdf/                    # Document - PDF processing
├── docx/                   # Document - Word documents
├── xlsx/                   # Document - Excel spreadsheets
├── pptx/                   # Document - PowerPoint
├── mcp-builder/            # Builder - MCP server creation
├── skill-creator/          # Builder - Skill development
├── algorithmic-art/        # Creative - Generative art
├── canvas-design/          # Creative - Visual design
├── slack-gif-creator/      # Creative - Animated GIFs
├── frontend-design/        # Development - UI/UX guidance
├── webapp-testing/         # Development - Browser testing
├── web-artifacts-builder/  # Development - React artifacts
├── brand-guidelines/       # Business - Anthropic branding
├── internal-comms/         # Business - Internal communications
├── doc-coauthoring/        # Business - Document collaboration
└── theme-factory/          # Business - Professional theming
```

---

## Official Source

All 16 skills are from Anthropic's official skills repository:
https://github.com/anthropics/skills

## License

Each skill contains its own `LICENSE.txt` file with Anthropic's license terms.
