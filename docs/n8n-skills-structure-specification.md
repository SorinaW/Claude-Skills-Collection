# n8n Skills Structure Specification

## Overview

This document specifies the proposed structure for Claude Code skills that enable non-technical users to create and manage n8n workflows. The structure is designed based on Claude Code skill best practices, the n8n API specification, and workflow design patterns.

**Status**: Draft with critical analysis and open questions for discussion.

---

## Table of Contents

1. [Critical Analysis](#critical-analysis)
2. [Design Rationale](#design-rationale)
3. [Proposed Structure](#proposed-structure)
4. [Skill Specifications](#skill-specifications)
5. [Shared Resources](#shared-resources)
6. [Implementation Priority](#implementation-priority)
7. [Self-Answered Questions](#self-answered-questions)
8. [Open Questions for Discussion](#open-questions-for-discussion)

---

## Critical Analysis

### Fundamental Flaw in Multi-Skill Architectures

After deeper analysis, both the original 5-skill plan and the initially proposed 3-skill architecture have a fundamental flaw:

**Skills do not compose.** Claude Code skills are:
- **Independently triggered** - Claude picks ONE skill per interaction
- **Not composable** - one skill cannot invoke another skill
- **Mutually exclusive** - skills don't layer or coordinate

The proposed diagram showing "workflow-assistant coordinating with api-client" was architecturally incorrect:

```
THIS DOESN'T WORK:

n8n-workflow-assistant
        │
        ▼
┌─────────────────┐   ← Skills can't call other skills!
│ n8n-api-client  │
└─────────────────┘
```

### How Skills Actually Work

When a user says "Create a workflow that sends emails":

1. Claude evaluates ALL skill descriptions at once
2. Claude picks the SINGLE best matching skill
3. That skill's SKILL.md is loaded into context
4. Claude works entirely within that skill

If we have multiple skills with overlapping purposes (designer, creator, editor), Claude must choose ONE. The others are ignored for that interaction.

### Implications for This Project

| Approach | Problem |
|----------|---------|
| **5 skills** (original) | "Create workflow" vs "edit workflow" - which skill? User conversations naturally flow between these. |
| **3 skills** (first proposal) | "Layered" architecture is impossible. api-client would never be invoked as a sub-component. |
| **1 skill** (revised) | All workflow operations in one place. Matches natural conversation flow. |

---

## Design Rationale

### Original Plan vs Revised Proposal

The original CLAUDE.md specified 5 separate skills:

| Original Skill | Purpose |
|----------------|---------|
| `n8n-workflow-designer` | Convert natural language to workflow designs |
| `n8n-workflow-creator` | Create workflows via API |
| `n8n-workflow-editor` | Modify existing workflows |
| `n8n-workflow-debugger` | Analyze and fix failures |
| `n8n-workflow-tester` | Test workflows with sample data |

### Why ONE Skill Instead?

| Factor | Multiple Skills | One Skill |
|--------|-----------------|-----------|
| **Conversation Flow** | User must restart to switch skills | Seamless design → create → test → debug |
| **Skill Selection** | Ambiguous: "my workflow has a problem" - debugger or editor? | No ambiguity |
| **Context** | Lost when switching skills | Maintained throughout |
| **Maintenance** | Multiple SKILL.md files to sync | One source of truth |
| **User Mental Model** | "Which skill do I need?" | "Talk to the n8n assistant" |

### When Multiple Skills Make Sense

Multiple skills ARE appropriate when:
- Capabilities are truly distinct (e.g., "PDF processing" vs "spreadsheet analysis")
- Different tool restrictions needed (read-only vs read-write)
- Completely different domains

For n8n workflows, design/create/edit/debug are all part of the same workflow lifecycle - one skill fits better.

---

## Proposed Structure (Revised)

### Single Skill Architecture

```
.claude/skills/
└── n8n-workflows/                    # ONE comprehensive skill (SELF-CONTAINED)
    ├── SKILL.md                      # Core instructions, navigation
    │
    ├── reference/                    # Knowledge base (progressive disclosure)
    │   ├── NODES.md                  # Node type catalog
    │   ├── PATTERNS.md               # Common workflow patterns
    │   └── ERRORS.md                 # Error codes and solutions
    │
    ├── templates/                    # Workflow templates (discoverable)
    │   ├── INDEX.md                  # Template catalog for agent discovery
    │   ├── bootstrap/                # Minimal starters
    │   │   ├── minimal.json
    │   │   ├── webhook-trigger.json
    │   │   └── schedule-trigger.json
    │   └── patterns/                 # Common use cases
    │       ├── email-notification.json
    │       ├── data-sync.json
    │       └── api-integration.json
    │
    └── tools/                        # Utility scripts (skill's own)
        ├── n8n-client.ts             # API client with auth, error handling
        └── validate-workflow.ts      # Local JSON/schema validation

# Tests are SEPARATE (not distributed with skill)
tests/
├── unit/
│   └── tools/
│       └── n8n-client.test.ts        # Unit tests for skill tools
└── e2e/
    └── scenarios/
        └── skill-integration.test.ts # Integration tests
```

**Distribution**: Only `.claude/skills/n8n-workflows/` is distributed to users.

### Architecture

```
User Request ("I want to automate X")
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                     n8n-workflows skill                      │
│                                                              │
│  SKILL.md loads and provides:                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Interaction patterns (how to talk to users)          │ │
│  │ • Workflow design guidance                             │ │
│  │ • JSON generation rules                                │ │
│  │ • API operation instructions                           │ │
│  │ • Debugging procedures                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  Reference files (loaded as needed):                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ NODES.md │  │PATTERNS.md│ │ ERRORS.md│                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                          │                                   │
│                          ▼                                   │
│  API Operations (via Bash):                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • curl commands or                                     │ │
│  │ • npx tsx lib/n8n-client.ts                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                   n8n Instance
                   (via REST API)
```

### Why This Works

| User Says | Skill Handles |
|-----------|---------------|
| "I want to automate sending emails when..." | Design + Create |
| "Show me my workflows" | List via API |
| "Edit my workflow to also send Slack messages" | Fetch + Modify + Update |
| "Why isn't my workflow working?" | Fetch executions + Analyze + Explain |
| "Test my workflow" | Trigger + Monitor + Report |

One skill, one conversation, full context maintained.

---

## Skill Specifications

### n8n-workflows (Single Comprehensive Skill)

**Role**: Complete n8n workflow lifecycle management

```yaml
---
name: n8n-workflows
description: Design, create, edit, test, and debug n8n workflows from natural language. Converts business requirements into working automations, deploys to n8n via API, analyzes failures, and explains everything in plain language. Use when user wants to automate tasks, work with n8n workflows, troubleshoot problems, or learn about automation possibilities.
---
```

**Responsibilities**:

| Category | What the Skill Does |
|----------|---------------------|
| **Understand** | Parse user's automation goals, ask clarifying questions in business terms |
| **Design** | Propose workflow structure, explain what each part does |
| **Create** | Generate valid workflow JSON, deploy via n8n API |
| **Edit** | Fetch existing workflows, modify based on requests, update |
| **Test** | Trigger workflows, verify execution, report results |
| **Debug** | Fetch execution logs, identify failures, explain in plain language, suggest fixes |
| **Teach** | Explain automation concepts, answer questions about n8n capabilities |

**Key Files**:

| File | Purpose | Size Target |
|------|---------|-------------|
| `SKILL.md` | Core instructions, interaction patterns, API usage | <400 lines |
| `reference/NODES.md` | Node type catalog (triggers, actions, flow control) | <300 lines |
| `reference/PATTERNS.md` | Common workflow templates | <300 lines |
| `reference/ERRORS.md` | Error patterns and solutions | <300 lines |

**SKILL.md Structure**:

```markdown
# n8n Workflows

## How to Interact with Users
- Always use business language, not technical jargon
- Ask clarifying questions before building
- Propose design and get approval before creating
- Explain what you're doing at each step

## Workflow Design
- How to structure workflows
- Node selection guidance
- Connection patterns

## API Operations
- Environment variables: N8N_API_URL, N8N_API_KEY
- How to create/read/update/delete workflows
- How to activate/deactivate
- How to fetch executions

## Debugging
- How to fetch and interpret execution logs
- Common error patterns and fixes
- How to explain errors to users

## References
- For node details: see reference/NODES.md
- For patterns: see reference/PATTERNS.md
- For errors: see reference/ERRORS.md
```

**Example Triggers** (all handled by same skill):

| User Says | Skill Response |
|-----------|----------------|
| "I want to automate sending emails when a form is submitted" | Design → Create → Deploy |
| "Show me my workflows" | List via API |
| "Edit my email workflow to also notify Slack" | Fetch → Modify → Update |
| "Why isn't my workflow working?" | Fetch executions → Analyze → Explain |
| "Can n8n connect to Notion?" | Answer from knowledge |
| "Test my new workflow" | Trigger → Monitor → Report |

---

## Shared Resources

### Existing Documentation (Already Created)

```
docs/
├── n8n-api-specification.md         # Comprehensive API reference
├── n8n-workflow-best-practices.md   # Design patterns, security
├── n8n-workflows-collection.md      # Template repositories
├── claude-skill-specification.md    # How skills work
└── user-journey-specification.md    # User interaction patterns
```

### Existing Code (Already Working)

```
tests/e2e/helpers/
├── n8n-client.ts                    # Working API client (tested!)
├── n8n-setup.ts                     # Setup utilities
└── index.ts                         # Exports
```

### Code Reuse Strategy

The skill should reuse existing tested code rather than duplicating:

**Option A: Reference tests/ directly**
```bash
# In SKILL.md instructions
npx tsx tests/e2e/helpers/n8n-client.ts list-workflows
```

**Option B: Move shared code to lib/**
```
lib/
└── n8n-client.ts                    # Moved from tests/, both use it

tests/e2e/helpers/
└── index.ts                         # Re-exports from lib/

.claude/skills/n8n-workflows/
└── SKILL.md                         # References lib/
```

**Option C: Inline curl commands**
```bash
# No scripts, just direct API calls
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_API_URL/workflows"
```

---

## Implementation Priority

### Phase 1: MVP Skill

**Goal**: Minimal skill that can create a simple workflow end-to-end

**Deliverables**:
- [ ] `.claude/skills/n8n-workflows/SKILL.md` - Core instructions
- [ ] Verify existing `tests/e2e/helpers/n8n-client.ts` works from skill context
- [ ] Manual test: Create workflow via conversation

**Success Criteria**:
- User describes automation in plain English
- Claude generates valid workflow JSON
- Workflow is created in n8n via API
- User can see workflow in n8n UI

**Scope Limitation**: MVP does NOT need:
- Comprehensive node documentation
- Error pattern catalog
- Execution analysis
- Complex multi-step workflows

### Phase 2: Reference Documentation

**Goal**: Add reference files for better accuracy

**Deliverables**:
- [ ] `reference/NODES.md` - Common node types
- [ ] `reference/PATTERNS.md` - 5-10 common workflow patterns
- [ ] E2E tests for pattern-based creation

**Success Criteria**:
- Claude uses correct node types
- Generated workflows match patterns
- Fewer JSON validation errors

### Phase 3: Debugging Capability

**Goal**: Handle "my workflow isn't working" scenarios

**Deliverables**:
- [ ] `reference/ERRORS.md` - Common error patterns
- [ ] Execution fetching in SKILL.md
- [ ] E2E tests for debug scenarios

**Success Criteria**:
- Can fetch execution history
- Explains errors in plain language
- Suggests actionable fixes

---

## Self-Answered Questions

These questions from the initial proposal can be resolved based on analysis:

### Q1: Skill Consolidation (3 vs 5 skills)

**Answer: ONE skill.**

Neither 3 nor 5 is correct. Skills don't compose, so layered architectures don't work. One comprehensive skill handles the full workflow lifecycle (design → create → edit → test → debug) within a single conversation context.

### Q2: API Client Implementation

**Answer: Reuse existing tested code.**

We already have `tests/e2e/helpers/n8n-client.ts` that:
- Works with our test infrastructure
- Handles authentication
- Has proper error handling
- Is already tested

No need to rewrite. Either reference it directly or move to shared `lib/` folder.

### Q3: Credential Handling

**Answer: Environment variables for MVP.**

Our tests already use `N8N_API_URL` and `N8N_API_KEY`. This is sufficient for proving the concept. The elaborate .env loader from user-journey-spec can be added later for polish.

### Q4: Node Reference Depth

**Answer: Start minimal, expand if needed.**

Claude already knows a lot about n8n from training. Start with minimal reference that covers:
- Most common node types
- Required fields for workflow creation
- A few example patterns

Expand only if we observe Claude struggling with specific node types.

---

## Open Questions for Discussion

### ~~Question 1: Is ONE skill the right approach?~~ RESOLVED

**Answer: YES, single skill.**

**Rationale**:
- Skills don't compose; multi-skill designs are architecturally flawed
- User conversations naturally span design → create → debug
- Target users want seamless problem-solving, not skill-switching
- Maintains context throughout interaction

**Handling large knowledge base**:
- Claude Code supports progressive disclosure - loads more detail as needed
- Key is proper **labeling and linking** so Claude can discover relevant files
- Structure with clear navigation: SKILL.md → reference files → detailed docs
- We CAN put a LOT of knowledge in; Claude Code handles discovery

**File organization principle**:
```
SKILL.md (entry point, navigation, core instructions)
    ↓ links to
reference/NODES.md, PATTERNS.md, ERRORS.md (topical deep-dives)
    ↓ links to
docs/*.md (comprehensive specifications if needed)
```

---

### ~~Question 2: Does this even need to be a "skill"?~~ RESOLVED

**Answer: YES, absolutely.**

The skill is not for us (developers). It's for **distribution to end users** who:
- Don't have domain knowledge about n8n
- Don't understand how the n8n API works
- Don't know how to design workflows
- Don't want to learn best practices and pitfalls
- Want to solve business problems WITH n8n, not learn n8n itself

**The skill's job**: Encapsulate all the technical knowledge so users can operate at a strategic/business level. The skill does the "pushing" (technical work) while users do the thinking (what they want to automate).

**This is the core value proposition of the project.**

---

### ~~Question 3: How should the skill use the existing n8n-client.ts?~~ RESOLVED

**Answer: Skills bring their OWN utility tools. Skills are fully independent of test infrastructure.**

**Architecture Principle**:
```
.claude/skills/n8n-workflows/     # SELF-CONTAINED, DISTRIBUTABLE
├── SKILL.md
├── reference/
│   └── ...
└── tools/                        # Skill's own utilities
    └── n8n-client.ts             # Handles API, auth, etc.

tests/                            # SEPARATE, NOT DISTRIBUTED
├── e2e/
│   └── helpers/
│       └── n8n-client.ts         # May duplicate or import from skill
└── unit/
    └── tools/                    # Unit tests FOR skill tools
        └── n8n-client.test.ts
```

**Key principles**:
1. **Skills are self-contained** - can be distributed without test code
2. **Skills bring utility tools** - n8n-client.ts lives IN the skill
3. **Tools are tested** - unit and integration tests exist, but in tests/ folder
4. **Tests MAY reuse skill tools** - tests can import from skill (not vice versa)
5. **No curl/raw HTTP** - Claude uses proper tools with auth, error handling

**Distribution scenario**:
```bash
# User installs just the skill folder
cp -r .claude/skills/n8n-workflows ~/.claude/skills/
# Works immediately, no test code needed
```

---

### ~~Question 4: What's the MVP test scenario?~~ RESOLVED

**Answer: Multiple workflows (correct and broken) + guided checklist experience.**

**MVP Test Scenarios**:

| Scenario | Purpose |
|----------|---------|
| Create simple webhook workflow | Happy path, CRUD works |
| Create email notification workflow | More complex, multiple nodes |
| Create intentionally broken workflow | Test debugging capability |
| Debug and fix the broken workflow | Demonstrate error handling |

**Key MVP Feature: Workflow Checklist**

Agent maintains a per-workflow checklist (like TodoWrite) that:
- Tracks what's been clarified vs still open
- Guides user through n8n complexities
- Updates as conversation progresses
- Ensures nothing is missed before creation

```
## Workflow Checklist: "New Customer Email"

### Trigger
- [x] Type: Webhook (when form submitted)
- [x] Authentication: None (public form)

### Data Processing
- [ ] Which fields to extract? (name, email, ?)
- [ ] Any data transformation needed?

### Actions
- [x] Send email notification
- [ ] To which address? (need to clarify)
- [ ] Email template/format?

### Error Handling
- [ ] What if email fails to send?
- [ ] Retry policy?
```

**User Experience Goal: "Wow Effect"**

1. **CRUD works flawlessly** - create, read, update, delete without friction
2. **Agent guides through complexity** - explains n8n terminology in plain language
3. **User speaks their own words** - agent translates to n8n concepts
4. **Nothing falls through cracks** - checklist ensures completeness
5. **Debugging is smooth** - broken workflows get diagnosed and fixed

**Success Criteria**:
- User can create workflow by describing business need
- Agent asks right questions without overwhelming
- User understands what was created (can explain it back)
- Broken workflow gets fixed with clear explanation
- User feels guided, not confused

---

### ~~Question 5: How do we handle workflow JSON generation?~~ RESOLVED

**Answer: Local-first with templates and validation.**

**Design principles**:

1. **Always work locally first**
   - Export from n8n if workflow exists there
   - Generate/edit as local JSON file
   - Validate locally before pushing to n8n

2. **Template library in skill**
   ```
   .claude/skills/n8n-workflows/
   └── templates/
       ├── INDEX.md                    # Describes all templates, discoverable
       ├── bootstrap/
       │   ├── minimal.json            # Simplest valid workflow
       │   ├── webhook-trigger.json    # Webhook starter
       │   └── schedule-trigger.json   # Cron starter
       └── patterns/
           ├── email-notification.json
           ├── data-sync.json
           └── api-integration.json
   ```

3. **Local validation before deploy**
   - JSON syntax validation (is it valid JSON?)
   - Schema validation (does it match n8n workflow structure?)
   - Could use n8n tools if available, or custom verifier in `tools/`

4. **Agent workflow**
   ```
   User request
       ↓
   Agent discovers templates via INDEX.md
       ↓
   Agent selects/modifies template OR generates from scratch
       ↓
   Save to local .json file
       ↓
   Validate locally (tools/validate-workflow.ts)
       ↓
   If valid → push to n8n via tools/n8n-client.ts
   If invalid → fix and retry
   ```

**Benefits**:
- Templates provide reliable starting points
- Local files allow inspection and manual editing
- Validation catches errors before API call
- INDEX.md enables agent discovery

---

### ~~Question 6: n8n node versioning~~ RESOLVED

**Answer: Target latest n8n Cloud version.**

**Rationale**:
- Primary target is **n8n Cloud** (non-technical users)
- n8n Cloud auto-updates, users are always on latest
- No version mismatch problem for target audience
- Simple, low maintenance approach

**Implementation**:
- Use latest stable node `typeVersion` in templates
- Document minimum supported n8n version
- If self-hosted users become priority later, can add version detection

---

## Next Steps

All questions resolved. Ready for implementation:

1. **Create skill directory structure**
   ```
   .claude/skills/n8n-workflows/
   ├── SKILL.md
   ├── reference/
   ├── templates/
   └── tools/
   ```

2. **Implement tools first** (testable foundation)
   - `tools/n8n-client.ts` - API operations
   - `tools/validate-workflow.ts` - Local validation
   - Unit tests for tools

3. **Create bootstrap templates**
   - `templates/INDEX.md`
   - `templates/bootstrap/minimal.json`
   - Basic patterns

4. **Write SKILL.md** (core instructions)
   - Interaction patterns
   - Checklist system
   - Navigation to reference files

5. **Manual test with Claude Code**
   - Create simple workflow
   - Create complex workflow
   - Debug broken workflow
   - Verify "wow effect"

6. **Iterate and expand**
   - Add more templates
   - Expand reference documentation
   - Add error patterns

---

*Document created for n8n Workflow Assistant project - December 2025*
