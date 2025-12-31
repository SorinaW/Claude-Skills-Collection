# n8n Claude Skills

Build n8n workflows from plain English using Claude Code.

> **Quick Start:** Open this folder in Claude Code and say: **"Set up n8n skills for me"**

---

## What This Does

Tell Claude what automation you want, and it:
- Designs the workflow structure
- Creates valid n8n JSON
- Deploys via API
- Debugs errors in plain English

**Example:**
> "Create a workflow that monitors my RSS feeds and sends a Telegram summary daily"

---

## Setup Instructions for Claude

**Claude: Follow these steps when user asks to set up n8n skills.**

### Step 1: Check Prerequisites

Ask user to confirm:
- [ ] Claude Code is installed
- [ ] Docker is installed (optional, for local testing)
- [ ] User has an n8n instance (cloud or self-hosted)

### Step 2: Get n8n Connection Details

Ask the user for:

1. **n8n Instance URL**
   - Cloud example: `https://your-name.app.n8n.cloud`
   - Self-hosted example: `http://localhost:5678`
   - No trailing slash

2. **n8n API Key**
   - Get from: n8n UI → Settings (gear icon) → API → Create API Key
   - Starts with `eyJ...` (JWT token)

### Step 3: Configure Environment Variables

Based on user's OS, run the appropriate command:

**Windows (PowerShell):**
```powershell
# Create/update Claude settings
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
$settings = if (Test-Path $settingsPath) { Get-Content $settingsPath | ConvertFrom-Json } else { @{} }
if (-not $settings.env) { $settings | Add-Member -NotePropertyName "env" -NotePropertyValue @{} -Force }
$settings.env.N8N_INSTANCE_URL = "USER_INSTANCE_URL"
$settings.env.N8N_API_KEY = "USER_API_KEY"
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath
Write-Host "Environment variables saved to $settingsPath"
```

**Mac/Linux:**
```bash
# Add to shell profile
echo 'export N8N_INSTANCE_URL="USER_INSTANCE_URL"' >> ~/.bashrc
echo 'export N8N_API_KEY="USER_API_KEY"' >> ~/.bashrc
source ~/.bashrc
```

**Or add to Claude settings.json manually:**
```json
{
  "env": {
    "N8N_INSTANCE_URL": "https://your-instance.app.n8n.cloud",
    "N8N_API_KEY": "your-api-key-here"
  }
}
```

### Step 4: Install the Skill

Copy the skill folder to Claude's skills directory:

**Windows:**
```powershell
$source = "skill"
$dest = "$env:USERPROFILE\.claude\my-skills\n8n-workflows"
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force }
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
Write-Host "Skill installed to $dest"
```

**Mac/Linux:**
```bash
mkdir -p ~/.claude/my-skills/n8n-workflows
cp -r skill/* ~/.claude/my-skills/n8n-workflows/
echo "Skill installed to ~/.claude/my-skills/n8n-workflows"
```

### Step 5: Verify Connection

Test the API connection:

```bash
curl -s "$N8N_INSTANCE_URL/api/v1/workflows?limit=1" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | head -c 200
```

If successful, you'll see workflow data. If you see "Unauthorized", check the API key.

### Step 6: Done!

Tell user:
- Setup complete
- Try: "Create a simple webhook workflow"
- Or: "What can you help me build with n8n?"

---

## Manual Setup

If you prefer to set up manually:

1. **Get your n8n API key:**
   - Go to your n8n instance
   - Click Settings (gear icon)
   - Go to API section
   - Create new API key

2. **Set environment variables:**
   - `N8N_INSTANCE_URL` = your n8n URL (no trailing slash)
   - `N8N_API_KEY` = your API key

3. **Copy skill files:**
   - Copy `skill/` folder contents to `~/.claude/my-skills/n8n-workflows/`

4. **Restart Claude Code**

---

## Project Structure

```
n8n-claude-skills/
├── skill/
│   ├── SKILL.md        # Main skill file (install this)
│   ├── reference.md    # API reference
│   ├── patterns.md     # Workflow patterns
│   └── examples.md     # Ready-to-use examples
├── docs/               # Extended documentation
│   ├── n8n-api-specification.md
│   ├── n8n-workflow-best-practices.md
│   ├── claude-skill-specification.md
│   ├── user-journey-specification.md
│   ├── n8n-workflows-collection.md
│   └── testing-infrastructure-specification.md
├── tests/              # Test configuration
│   ├── e2e/
│   │   ├── vitest.config.ts
│   │   └── .env.example
│   └── unit/
│       └── vitest.config.ts
├── docker-compose.yml      # Local n8n for testing
├── docker-compose.test.yml # Ephemeral test instance
└── package.json
```

---

## Local Development (Optional)

Run a local n8n instance for testing:

```bash
# Start n8n (persists data)
docker-compose up -d

# Access at http://localhost:5678
# Default: admin@localhost.dev / LocalDev123!

# Stop
docker-compose down
```

For automated tests:
```bash
# Copy example env
cp tests/e2e/.env.example tests/e2e/.env.test
# Edit with your test API key

# Install deps
npm install

# Run tests
npm test
```

---

## Troubleshooting

### "Unauthorized" error
- Check API key is correct
- Check key hasn't expired
- Verify API is enabled in n8n settings

### "Cannot connect" error
- Check N8N_INSTANCE_URL is correct
- Check there's no trailing slash
- For self-hosted: ensure n8n is running

### Skill not loading
- Check files are in `~/.claude/my-skills/n8n-workflows/`
- Restart Claude Code
- Check SKILL.md has valid YAML frontmatter

---

## What You Can Do

Once set up, try:

- "Create a workflow that sends me a Telegram message every morning"
- "Build an automation that watches my email and forwards important ones"
- "Help me debug this n8n error: [paste error]"
- "Design a lead enrichment workflow from Google Sheets to CRM"

---

## Security

- Never commit `.env` files or API keys
- The `.gitignore` excludes sensitive files
- Use n8n's credential storage for integrations
- Rotate API keys periodically

---

## Contributing

This is a work in progress. Issues and PRs welcome.

---

## License

ISC

---

*Built with Claude Code + n8n*
