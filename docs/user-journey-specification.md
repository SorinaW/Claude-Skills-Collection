# User Journey Specification

## Overview

This document specifies how non-technical users interact with the n8n Workflow Assistant skills in Claude Code. The journey is designed to be simple, secure, and educational—users focus on their business goals while Claude handles all technical complexity.

---

## Table of Contents

1. [User Persona](#user-persona)
2. [Journey Overview](#journey-overview)
3. [Phase 1: Installation](#phase-1-installation)
4. [Phase 2: Credential Setup](#phase-2-credential-setup)
5. [Phase 3: Skill Installation](#phase-3-skill-installation)
6. [Phase 4: First Workflow](#phase-4-first-workflow)
7. [Phase 5: Ongoing Usage](#phase-5-ongoing-usage)
8. [Interaction Principles](#interaction-principles)
9. [Educational Approach](#educational-approach)
10. [Error Handling UX](#error-handling-ux)
11. [Security Architecture](#security-architecture)

---

## User Persona

### Primary User: Business Professional

**Characteristics**:
- Has workflow automation ideas
- Understands business processes
- Limited technical knowledge (no coding experience)
- Comfortable with basic computer tasks
- May have used no-code tools before

**Goals**:
- Automate repetitive business tasks
- Connect different tools and services
- Save time on manual processes
- Don't want to learn programming

**Pain Points**:
- Technical jargon is confusing
- JSON and API concepts are intimidating
- Fear of breaking things
- Overwhelmed by n8n's interface

**What They Say**:
- "I want to send an email when someone fills out my form"
- "Can you connect my CRM to my spreadsheet?"
- "Why did my automation stop working?"

---

## Journey Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY MAP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1          PHASE 2           PHASE 3         PHASE 4    │
│  ────────         ────────          ────────        ────────   │
│                                                                 │
│  Install          Add n8n           Install         Create      │
│  Claude    ───►   Credentials ───►  Skills   ───►  First       │
│  Code             (secure)                         Workflow     │
│                                                                 │
│  [10 min]         [5 min]           [2 min]        [15 min]    │
│                                                                 │
│                          │                                      │
│                          ▼                                      │
│                                                                 │
│                     PHASE 5: ONGOING USAGE                      │
│                     ──────────────────────                      │
│                                                                 │
│     ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│     │  Design  │    │  Debug   │    │  Learn   │              │
│     │ Workflows│◄──►│ Problems │◄──►│  & Grow  │              │
│     └──────────┘    └──────────┘    └──────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Installation

### Step 1.1: Install Claude Code

**User Action**: Download and install Claude Code

**Supported Platforms**:
- Windows (Windows 10+)
- macOS (10.15+)
- Linux (Ubuntu 20.04+)

**Installation Methods**:

**Option A: npm (Recommended)**
```bash
npm install -g @anthropic-ai/claude-code
```

**Option B: Direct Download**
- Visit: https://claude.ai/code
- Download installer for your platform
- Run installer

### Step 1.2: Authenticate with Anthropic

**User Action**: Log in with Anthropic account

```bash
claude login
```

**What Happens**:
1. Browser opens to Anthropic login page
2. User logs in or creates account
3. Authorization is granted
4. Claude Code receives authentication token
5. Token stored securely in local keychain

**User Sees**:
```
Welcome to Claude Code!
Opening browser for authentication...
✓ Successfully authenticated as user@email.com
```

### Step 1.3: Verify Installation

**User Action**: Test Claude Code works

```bash
claude --version
claude "Hello, can you help me with automation?"
```

**Success Criteria**:
- Version displays correctly
- Claude responds conversationally

---

## Phase 2: Credential Setup

### Security Design Principles

1. **Credentials stay local** - Never sent to Anthropic
2. **Encrypted storage** - Protected by OS keychain
3. **Explicit file blocking** - .env files invisible to Claude
4. **User control** - Full transparency on what's accessed

### Step 2.1: Create Project Directory

**User Action**: Create a dedicated workspace

```bash
mkdir my-n8n-workspace
cd my-n8n-workspace
```

### Step 2.2: Create Local Credentials File

**User Action**: Create .env file with n8n credentials

**File**: `.env` (in project root)
```env
# n8n Connection Settings
# Keep this file secure - never share or commit to git

N8N_INSTANCE_URL=https://your-instance.app.n8n.cloud
N8N_API_KEY=your-api-key-here
```

**How to Get n8n API Key**:
1. Log into n8n
2. Go to Settings → n8n API
3. Click "Create an API key"
4. Copy the key
5. Paste into .env file

### Step 2.3: Configure Security Settings

**User Action**: Create Claude Code settings to protect credentials

**File**: `.claude/settings.json`
```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

**What This Does**:
- Blocks Claude from reading .env files directly
- Credentials remain completely local
- Nothing sensitive sent to Anthropic

### Step 2.4: Create Credential Loader Script

**User Action**: Create script that makes credentials available

**File**: `load-credentials.sh` (macOS/Linux)
```bash
#!/bin/bash
# Load n8n credentials into environment
# This script is called before Claude Code starts

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
    echo "✓ n8n credentials loaded"
else
    echo "⚠ No .env file found - please create one"
fi
```

**File**: `load-credentials.ps1` (Windows)
```powershell
# Load n8n credentials into environment
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
    Write-Host "✓ n8n credentials loaded"
} else {
    Write-Host "⚠ No .env file found - please create one"
}
```

### Step 2.5: Start Claude Code with Credentials

**User Action**: Launch Claude Code with credentials loaded

**macOS/Linux**:
```bash
source load-credentials.sh && claude
```

**Windows**:
```powershell
.\load-credentials.ps1; claude
```

**Alternative: Use CLAUDE_ENV_FILE**:
```bash
export CLAUDE_ENV_FILE=./load-credentials.sh
claude
```

### Credential Security Summary

```
┌─────────────────────────────────────────────────────────────┐
│                 CREDENTIAL FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  .env file                                                   │
│  (on your computer)                                          │
│       │                                                      │
│       ▼                                                      │
│  load-credentials.sh                                         │
│  (loads into environment)                                    │
│       │                                                      │
│       ▼                                                      │
│  Environment Variables         ──────►  Claude Code          │
│  (in memory only)                       (can use variables)  │
│                                                              │
│       ✗                                                      │
│  ─────────────────────────────────────────────────────────  │
│       │                                                      │
│       ▼                                                      │
│  Anthropic Servers             ◄────── NOT sent to Anthropic │
│  (never receives credentials)                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 3: Skill Installation

### Step 3.1: Download Skills

**User Action**: Clone or download the n8n skills

**Option A: Git Clone**
```bash
git clone https://github.com/[repo]/n8n-workflow-skills.git .claude/skills/
```

**Option B: Manual Download**
1. Download skills ZIP from repository
2. Extract to `.claude/skills/` folder

### Step 3.2: Verify Skill Structure

**Expected Structure**:
```
.claude/
└── skills/
    ├── n8n-workflow-designer/
    │   └── SKILL.md
    ├── n8n-workflow-creator/
    │   └── SKILL.md
    ├── n8n-workflow-editor/
    │   └── SKILL.md
    ├── n8n-workflow-debugger/
    │   └── SKILL.md
    └── n8n-workflow-tester/
        └── SKILL.md
```

### Step 3.3: Verify Skills Load

**User Action**: Start Claude Code and check skills

```bash
claude
```

**User Says**: "What n8n skills do you have?"

**Claude Responds**:
```
I have access to these n8n workflow skills:

1. **Workflow Designer** - I can help you design workflows
   from plain English descriptions

2. **Workflow Creator** - I can create workflows directly
   in your n8n instance

3. **Workflow Editor** - I can modify your existing workflows

4. **Workflow Debugger** - I can analyze why workflows fail
   and suggest fixes

5. **Workflow Tester** - I can test your workflows with
   sample data

What would you like to automate today?
```

---

## Phase 4: First Workflow

### Example: Email Notification Workflow

**User's Goal**: "Send me an email when someone fills out my contact form"

### Step 4.1: Describe the Goal

**User Says**:
```
I want to get an email notification whenever someone
submits my website contact form
```

### Step 4.2: Claude Asks Clarifying Questions

**Claude Responds**:
```
I'd be happy to help you create that automation! Let me ask
a few questions to make sure I build exactly what you need:

1. **Where is your contact form?**
   - Is it on WordPress, Webflow, a custom website, or
     somewhere else?

2. **What information does the form collect?**
   - Name, email, message? Anything else?

3. **Where should the notification email go?**
   - Your personal email, a team inbox, or multiple addresses?

4. **What should the email include?**
   - Just the form data, or would you like a specific format?
```

### Step 4.3: User Provides Details

**User Says**:
```
- It's a Typeform
- It collects name, email, company, and message
- Send notifications to sales@mycompany.com
- I want to see all the details in a nice format
```

### Step 4.4: Claude Proposes Design

**Claude Responds**:
```
Perfect! Here's what I'll create for you:

## Workflow: "Contact Form to Email Notification"

**How it works:**
1. When someone submits your Typeform → workflow starts
2. Collects their name, email, company, and message
3. Formats it into a professional email
4. Sends to sales@mycompany.com

**What you'll see in each email:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 New Contact Form Submission

From: [Name]
Email: [Email]
Company: [Company]

Message:
[Their message]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**One-time setup needed:**
- Connect your Typeform account (I'll guide you)
- Connect your email service (Gmail, Outlook, or SMTP)

Does this look right? Say "yes" to create it, or let me
know what you'd like to change.
```

### Step 4.5: User Approves

**User Says**: "Yes, create it"

### Step 4.6: Claude Creates Workflow

**Claude Responds**:
```
Creating your workflow now...

✓ Workflow "Contact Form to Email Notification" created
✓ Typeform trigger configured
✓ Email formatter set up
✓ Gmail send node added

## Next Steps

I need you to connect two services in n8n:

### 1. Connect Typeform
Open this link: [n8n credentials page]
- Click "Add Credential" → "Typeform"
- Paste your Typeform API token
- Select your form from the dropdown

### 2. Connect Gmail
- Click "Add Credential" → "Gmail"
- Sign in with your Google account
- Grant permission to send emails

Once connected, say "done" and I'll activate the workflow.

💡 **Why credentials in n8n?**
Your login details are stored securely in YOUR n8n instance,
not shared with me or Anthropic. This keeps your accounts safe.
```

### Step 4.7: User Completes Setup

**User Says**: "Done, I connected both"

### Step 4.8: Claude Activates and Tests

**Claude Responds**:
```
Activating your workflow...

✓ Workflow activated!

## Let's Test It

I'll send a test submission through your form. Watch your
sales@mycompany.com inbox in the next few seconds.

[Sending test...]

✓ Test submission sent
✓ Workflow executed successfully
✓ Email delivered!

## You're All Set! 🎉

Your automation is now live. Every time someone fills out
your Typeform, you'll get an email at sales@mycompany.com.

**What you learned:**
- Webhooks let n8n know when something happens (like a
  form submission)
- n8n stores your credentials securely so it can act on
  your behalf
- Workflows run automatically 24/7 once activated

Would you like to add anything else? For example:
- Save submissions to a spreadsheet?
- Send a Slack notification too?
- Auto-respond to the person who submitted?
```

---

## Phase 5: Ongoing Usage

### Usage Pattern 1: Design New Workflows

**User Says**:
```
I want to automatically post my new blog articles to
Twitter and LinkedIn
```

**Claude**:
- Asks about blog platform
- Proposes workflow design
- Creates after approval
- Guides credential setup
- Activates and tests

### Usage Pattern 2: Debug Problems

**User Says**:
```
My workflow stopped working, it's not sending emails anymore
```

**Claude**:
- Fetches recent execution logs
- Identifies failure point
- Explains problem in simple terms
- Offers to fix automatically
- Verifies fix worked

### Usage Pattern 3: Modify Existing Workflows

**User Says**:
```
Can you add a Slack notification to my contact form workflow?
```

**Claude**:
- Fetches current workflow
- Proposes changes
- Adds new node after approval
- Tests the modification
- Confirms it works

### Usage Pattern 4: Learn and Explore

**User Says**:
```
What else can I automate with n8n?
```

**Claude**:
- Asks about user's tools and pain points
- Suggests relevant automations
- Explains concepts when asked
- Shares best practices

---

## Interaction Principles

### 1. Business Language First

**Don't Say**:
```
I'll configure a webhook trigger node with a POST endpoint
that parses the JSON payload and maps fields to downstream nodes.
```

**Do Say**:
```
I'll set up your workflow to automatically start whenever
someone submits the form. The information they enter will
flow through to your email notification.
```

### 2. Propose Before Acting

**Always**:
1. Understand the goal
2. Ask clarifying questions
3. Propose the solution
4. Wait for approval
5. Then implement

**Never**:
- Create workflows without explaining first
- Make assumptions without asking
- Use technical jargon unexpectedly

### 3. Educate Gently

**When Introducing Concepts**:
```
💡 **What's a webhook?**
Think of it like a doorbell for your workflow. When someone
fills out your form, it "rings the doorbell" to tell n8n
to start working.
```

**Keep Explanations**:
- Brief (1-3 sentences)
- Analogy-based
- Relevant to current task
- Optional to read

### 4. Celebrate Success

**After completing a workflow**:
```
## You're All Set! 🎉

Your automation is now live and working.

**What you accomplished:**
- Connected Typeform to your email
- Set up automatic notifications
- Your first n8n workflow!

**What you learned:**
- How triggers start workflows
- How credentials keep things secure
```

### 5. Handle Errors Gracefully

**When something fails**:
```
It looks like the workflow ran into a problem. Don't worry,
this happens and it's usually easy to fix!

**What happened:**
The email couldn't be sent because the Gmail connection
expired.

**How to fix it:**
1. Go to n8n credentials
2. Click on your Gmail credential
3. Click "Reconnect"
4. Sign in again

Let me know when you've done that, and I'll retry the workflow.
```

---

## Educational Approach

### Progressive Disclosure

**Level 1: Just Get It Done**
- User describes goal
- Claude creates workflow
- Workflow works

**Level 2: Understand Basics**
- Short explanations of concepts
- "What you learned" summaries
- Tips and suggestions

**Level 3: Dive Deeper (On Request)**
- Detailed explanations
- Best practices
- Advanced features

### Concept Introduction Schedule

| First Workflow | Second Workflow | Third+ Workflows |
|----------------|-----------------|------------------|
| What's a workflow | Error handling | Sub-workflows |
| What's a trigger | Testing | Performance |
| What's a node | Scheduling | Advanced patterns |
| What are credentials | Conditionals | API concepts |

### Learning Moments

**Natural Teaching Opportunities**:

1. **When connecting services**:
   "Your credentials are stored safely in YOUR n8n instance"

2. **When a workflow runs**:
   "Each step passes information to the next, like an assembly line"

3. **When debugging**:
   "Execution logs show exactly what happened at each step"

4. **When modifying**:
   "Workflows can grow and change as your needs evolve"

---

## Error Handling UX

### Error Categories

| Category | User Message | Claude Action |
|----------|--------------|---------------|
| Missing Credentials | "I need you to connect [Service]" | Provide step-by-step guide |
| API Error | "The workflow ran into a temporary problem" | Explain and retry |
| Configuration Error | "There's a small setup issue" | Offer to fix automatically |
| User Error | "Let me clarify..." | Re-ask question kindly |

### Error Message Template

```
## Something Needs Attention

**What happened:**
[Simple explanation without jargon]

**Why this happened:**
[Brief, non-technical reason]

**How to fix it:**
[Step-by-step instructions]

**Want me to help?**
[Offer to fix or guide through fix]
```

### Recovery Patterns

**Automatic Recovery**:
- Retry transient failures
- Refresh expired tokens (when possible)
- Suggest alternatives

**Guided Recovery**:
- Step-by-step instructions
- Screenshots when helpful
- Verification after each step

**Escalation**:
- When Claude can't fix it
- Link to n8n support
- Suggest community resources

---

## Security Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER (Local)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   .env       │     │  Environment │     │ Claude Code  │    │
│  │ (credentials)│────►│  Variables   │────►│   (local)    │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                                          │            │
│         │ BLOCKED                                  │            │
│         ▼                                          ▼            │
│  ┌──────────────┐                         ┌──────────────┐     │
│  │   settings   │                         │   API Calls  │     │
│  │   .json      │                         │  to n8n      │     │
│  │ (deny rules) │                         └──────────────┘     │
│  └──────────────┘                                  │            │
│                                                    │            │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                            HTTPS (encrypted)        │
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR n8n INSTANCE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │  Workflows   │     │  Executions  │     │ Credentials  │    │
│  │              │     │              │     │ (for Gmail,  │    │
│  │              │     │              │     │  Slack, etc) │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                    SEPARATE CHANNEL (your n8n stores these)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│               THIRD-PARTY SERVICES                               │
│         (Gmail, Slack, Typeform, etc.)                          │
└─────────────────────────────────────────────────────────────────┘
```

### What's Protected

| Data | Where Stored | Sent to Anthropic? |
|------|--------------|-------------------|
| n8n API Key | Local .env file | No |
| n8n Instance URL | Local .env file | No |
| Workflow JSON | n8n instance | No (only structure discussed) |
| Execution Logs | n8n instance | No (only summaries discussed) |
| Service Credentials | n8n instance | No |
| Conversation | Anthropic servers | Yes (encrypted) |

### Security Checklist for Users

```
□ .env file created with credentials
□ .claude/settings.json has deny rules
□ .env added to .gitignore
□ Using HTTPS for n8n instance
□ n8n API key has appropriate scope
□ Regular credential rotation planned
```

---

## Complete Setup Checklist

### First-Time Setup (One Time)

```
□ Install Claude Code
□ Authenticate with Anthropic account
□ Create project workspace
□ Create .env file with n8n credentials
□ Create .claude/settings.json with deny rules
□ Create credential loader script
□ Install n8n skills to .claude/skills/
□ Test Claude Code with credentials loaded
□ Verify skills are recognized
```

### Each Session

```
□ Navigate to project workspace
□ Run credential loader script
□ Start Claude Code
□ Begin prompting
```

### Periodic Maintenance

```
□ Rotate n8n API key (monthly recommended)
□ Update .env with new credentials
□ Update skills if new versions available
□ Review workflow health in n8n
```

---

## Sample Conversation Scripts

### First Interaction

```
USER: Hi, I'm new to this. What can you help me with?

CLAUDE: Welcome! I'm here to help you automate your work
using n8n—without needing to code anything.

Here are some things I can help you do:

📧 **Communication Automation**
   "Email me when someone fills out my form"
   "Post to Slack when I get a new customer"

📊 **Data Sync**
   "Copy new spreadsheet rows to my CRM"
   "Backup form submissions to Google Sheets"

🤖 **AI-Powered Tasks**
   "Summarize emails and send me a daily digest"
   "Generate social media posts from my blog"

What repetitive task would you like to automate? Just
describe it in plain English—I'll handle the technical parts.
```

### Credential Setup Guidance

```
USER: I want to create my first workflow

CLAUDE: Exciting! Before we create your first workflow,
let me make sure your n8n connection is set up.

I'll need to check if I can connect to your n8n instance.
Do you have your:

1. **n8n Instance URL**
   (looks like: https://your-name.app.n8n.cloud)

2. **n8n API Key**
   (found in n8n: Settings → n8n API → Create API key)

If you've already set these up in your .env file, just say
"ready" and I'll verify the connection.

If you need help setting this up, say "help me set up
credentials" and I'll guide you step by step.
```

### Workflow Creation

```
USER: I want to save all my email attachments to Google Drive

CLAUDE: Great idea! Let me design that automation for you.

**Questions to make sure I get this right:**

1. Which email account?
   □ Gmail
   □ Outlook
   □ Other: _______

2. Save ALL attachments or specific types?
   □ All files
   □ Only PDFs
   □ Only images
   □ Only spreadsheets
   □ Specific: _______

3. Which Google Drive folder?
   □ Create a new "Email Attachments" folder
   □ Existing folder (which one?)

4. How should files be organized?
   □ All in one folder
   □ Subfolders by sender
   □ Subfolders by date
   □ Subfolders by file type
```

---

## Success Metrics

### User Success Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| First workflow created | <30 minutes | Time to activation |
| Credentials set up securely | 100% | No .env in conversation |
| User understands what happened | High | Can describe workflow simply |
| Workflow works correctly | 100% | Test passes |
| User returns for more | High | Creates 2+ workflows |

### Quality Indicators

| Aspect | Good | Needs Improvement |
|--------|------|-------------------|
| Language | Business terms | Technical jargon |
| Questions | Specific, helpful | Vague, confusing |
| Explanations | Brief, clear | Long, complex |
| Errors | Helpful guidance | Raw error messages |
| Education | Gentle, contextual | Overwhelming |

---

## Future Enhancements

### Planned Improvements

1. **One-Click Credential Setup**
   - GUI for entering credentials
   - Automatic .env generation
   - Guided API key creation

2. **Workflow Templates**
   - "Start with a template" option
   - Industry-specific templates
   - Customizable starting points

3. **Visual Workflow Preview**
   - ASCII diagram of workflow
   - Interactive modification
   - Before/after comparison

4. **Proactive Suggestions**
   - "Your workflow could be improved by..."
   - "Based on your workflows, you might want..."
   - Health monitoring alerts

---

## Sources

- [Claude Code Security Documentation](https://code.claude.com/docs/en/security.md)
- [Claude Code Settings Configuration](https://code.claude.com/docs/en/settings.md)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills.md)
- [n8n API Authentication](https://docs.n8n.io/api/authentication/)

---

*Document compiled for n8n Workflow Assistant project - December 2025*
