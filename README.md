# Anthropic Official Skills Collection

Complete collection of **all 16 skills** from Anthropic's official Claude skills repository.

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

## All 16 Skills

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
| [algorithmic-art](./skills/algorithmic-art/) | Generative art with p5.js | Node: p5 |
| [canvas-design](./skills/canvas-design/) | Visual art in PNG/PDF | Python: pillow, cairo |
| [slack-gif-creator](./skills/slack-gif-creator/) | Optimized animated GIFs | Python: pillow, gifsicle |

### Development Skills (3)
| Skill | What It Does | Dependencies |
|-------|--------------|--------------|
| [frontend-design](./skills/frontend-design/) | UI/UX development guidance | Guidance only |
| [webapp-testing](./skills/webapp-testing/) | Playwright browser testing | Python: playwright |
| [web-artifacts-builder](./skills/web-artifacts-builder/) | React/Tailwind/shadcn components | Node: react, tailwind |

### Business Skills (4)
| Skill | What It Does | Dependencies |
|-------|--------------|--------------|
| [brand-guidelines](./skills/brand-guidelines/) | Apply brand assets consistently | Guidance only |
| [internal-comms](./skills/internal-comms/) | Status reports, newsletters | Guidance only |
| [doc-coauthoring](./skills/doc-coauthoring/) | Collaborative editing guidance | Guidance only |
| [theme-factory](./skills/theme-factory/) | Professional theming | Guidance only |

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
cd skills/algorithmic-art && npm init -y && npm install p5
```
Uses p5.js for generative art. See SKILL.md for patterns.

#### Canvas Design Skill
```bash
pip install pillow pycairo
```
Creates visual art in PNG/PDF formats. See SKILL.md for examples.

#### Slack GIF Creator Skill
```bash
pip install pillow
# Optional: install gifsicle for optimization
```
Creates optimized animated GIFs.

---

### Development Skills

#### Frontend Design Skill
**No installation** - Guidance for UI/UX development.

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
```bash
cd skills/web-artifacts-builder && npm init -y && npm install react react-dom tailwindcss
```
Builds React/Tailwind/shadcn UI components.

---

### Business Skills

All business skills are **guidance only** - no installation required:
- **brand-guidelines** - Apply brand assets consistently
- **internal-comms** - Status reports and newsletters
- **doc-coauthoring** - Collaborative editing patterns
- **theme-factory** - Professional theming guidance

---

## Install All Dependencies

**All Python packages:**
```bash
pip install pypdf pdfplumber reportlab openpyxl pandas python-pptx pillow playwright
```

**Node packages (run in each skill folder that needs them):**
```bash
# docx
cd skills/docx && npm init -y && npm install docx

# algorithmic-art
cd skills/algorithmic-art && npm init -y && npm install p5

# web-artifacts-builder
cd skills/web-artifacts-builder && npm init -y && npm install react react-dom
```

---

## Folder Structure

```
~/.claude/my-skills/anthropic-skills/
├── pdf/                    # Document
├── docx/                   # Document
├── xlsx/                   # Document
├── pptx/                   # Document
├── mcp-builder/            # Builder
├── skill-creator/          # Builder
├── algorithmic-art/        # Creative
├── canvas-design/          # Creative
├── slack-gif-creator/      # Creative
├── frontend-design/        # Development
├── webapp-testing/         # Development
├── web-artifacts-builder/  # Development
├── brand-guidelines/       # Business
├── internal-comms/         # Business
├── doc-coauthoring/        # Business
└── theme-factory/          # Business
```

---

## Source

All skills from Anthropic's official repository:
https://github.com/anthropics/skills

## License

Each skill contains its own `LICENSE.txt` file.
