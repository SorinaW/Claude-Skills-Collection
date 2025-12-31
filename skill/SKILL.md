---
name: n8n-workflows
description: Create, debug, and manage n8n workflows from natural language. Use when user asks about n8n, workflow automation, wants to create/edit/debug workflows, or mentions n8n errors. Handles workflow design, API deployment, error diagnosis, and testing.
---

# n8n Workflow Assistant

You help users build n8n automations through conversation. You can design workflows from descriptions, create them via API, debug failures, and explain errors in plain English.

## Your Capabilities

| Role | When to Use |
|------|-------------|
| **Designer** | User describes what they want to automate |
| **Creator** | User approves a design, ready to deploy |
| **Editor** | User wants to modify an existing workflow |
| **Debugger** | User has errors or workflow isn't working |
| **Tester** | User wants to verify a workflow works |

## Environment Requirements

These environment variables must be set:
- `N8N_INSTANCE_URL` - n8n instance (e.g., `https://xxx.app.n8n.cloud`)
- `N8N_API_KEY` - API key from n8n Settings > API

---

## Quick Reference - API

### Authentication
```bash
Header: X-N8N-API-KEY: $N8N_API_KEY
Base URL: $N8N_INSTANCE_URL/api/v1
```

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/workflows` | List all workflows |
| `POST` | `/workflows` | Create workflow |
| `GET` | `/workflows/{id}` | Get workflow |
| `PUT` | `/workflows/{id}` | Update workflow |
| `DELETE` | `/workflows/{id}` | Delete workflow |
| `POST` | `/workflows/{id}/activate` | Activate |
| `POST` | `/workflows/{id}/deactivate` | Deactivate |
| `GET` | `/executions?status=error` | Get failed runs |
| `GET` | `/executions/{id}?includeData=true` | Get execution details |

### Create/Update Workflow - Required Fields Only
```json
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": { "executionOrder": "v1" }
}
```
**Do NOT send:** id, active, createdAt, updatedAt, staticData, tags

---

## Workflow JSON Structure

### Node Template
```json
{
  "id": "unique-uuid",
  "name": "Descriptive Name",
  "type": "n8n-nodes-base.nodeType",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {...}
}
```

### Connections Format
```json
{
  "connections": {
    "SourceNodeName": {
      "main": [[
        { "node": "TargetNodeName", "type": "main", "index": 0 }
      ]]
    }
  }
}
```
- Keys are node **names** (not IDs)
- Double-nested arrays: `[[{...}]]`
- Empty workflow: `"connections": {}`

### Position Guidelines
- Start trigger at [100, 100]
- Horizontal spacing: 200px between nodes
- Vertical spacing: 150px for parallel branches

---

## Common Node Types

### Triggers
| Type | Node Type | Use Case |
|------|-----------|----------|
| Manual | `n8n-nodes-base.manualTrigger` | Testing |
| Schedule | `n8n-nodes-base.scheduleTrigger` | Cron jobs |
| Webhook | `n8n-nodes-base.webhook` | External triggers |
| Email | `n8n-nodes-base.emailReadImap` | Email monitoring |

### Actions
| Type | Node Type | Use Case |
|------|-----------|----------|
| HTTP | `n8n-nodes-base.httpRequest` | API calls |
| Code | `n8n-nodes-base.code` | Custom JS |
| Set | `n8n-nodes-base.set` | Set values |
| IF | `n8n-nodes-base.if` | Conditionals |
| Telegram | `n8n-nodes-base.telegram` | Messaging |
| Gmail | `n8n-nodes-base.gmail` | Email |

### AI/LangChain
| Type | Node Type |
|------|-----------|
| AI Agent | `@n8n/n8n-nodes-langchain.agent` |
| Claude | `@n8n/n8n-nodes-langchain.lmChatAnthropic` |
| OpenAI | `@n8n/n8n-nodes-langchain.lmChatOpenAi` |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `No prompt specified` | AI Agent missing prompt | Add `promptType: "define"` and `text` parameter |
| `The resource you are requesting could not be found` | Invalid model ID | Use exact ID like `claude-3-haiku-20240307` |
| `Authorization failed` | Bad API key | Update credentials in n8n |
| `request/body must NOT have additional properties` | Extra fields in PUT | Only send: name, nodes, connections, settings |
| `Cannot read property Symbol(Symbol.iterator)` | Bad connections JSON | Use `{ "Name": { "main": [[{...}]] } }` |
| `Unauthorized` | Expired/wrong API key | Check N8N_API_KEY env var |

---

## Design Workflow

When user describes what they want:

1. **Clarify requirements:**
   - What triggers the workflow?
   - What data is involved?
   - What should happen step by step?
   - What's the output?

2. **Propose design:**
   ```
   ## Workflow: "[Name]"

   **Trigger**: [What starts it]
   **Steps**:
   1. [Step description]
   2. [Step description]
   **Output**: [Final result]
   ```

3. **Get approval before creating**

---

## Debug Workflow

When user reports errors:

1. **Get error details:**
   ```bash
   curl -X GET "$N8N_INSTANCE_URL/api/v1/executions?status=error&limit=5" \
     -H "X-N8N-API-KEY: $N8N_API_KEY"
   ```

2. **Get specific execution:**
   ```bash
   curl -X GET "$N8N_INSTANCE_URL/api/v1/executions/{id}?includeData=true" \
     -H "X-N8N-API-KEY: $N8N_API_KEY"
   ```

3. **Find error in:** `response.data.resultData.error.message`

4. **Explain in plain English** - translate technical errors:
   - `401 Unauthorized` → "Your credential expired, reconnect in n8n"
   - `ENOTFOUND` → "Can't reach that URL, check if it's correct"
   - `timeout` → "The service took too long, may be overloaded"

---

## Node Configurations

### Schedule Trigger (Daily at 7 AM)
```json
{
  "parameters": {
    "rule": { "interval": [{ "triggerAtHour": 7 }] }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2
}
```

### Webhook
```json
{
  "parameters": {
    "path": "my-webhook",
    "httpMethod": "POST",
    "responseMode": "onReceived"
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1
}
```

### AI Agent (Claude)
```json
{
  "parameters": {
    "promptType": "define",
    "text": "={{ $json.prompt }}",
    "options": { "systemMessage": "You are..." }
  },
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 1.7
}
```

### Claude Chat Model
```json
{
  "parameters": {
    "model": {
      "__rl": true,
      "mode": "id",
      "value": "claude-3-haiku-20240307"
    },
    "options": { "maxTokensToSample": 2048 }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
  "typeVersion": 1.3
}
```

**Valid Claude model IDs:**
- `claude-3-haiku-20240307` - Fast, cheap
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-opus-20240229` - Best quality

### Telegram
```json
{
  "parameters": {
    "chatId": "123456789",
    "text": "={{ $json.message }}",
    "additionalFields": { "parse_mode": "Markdown" }
  },
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.2
}
```

---

## Code Node Patterns

### Filter by Time (Last 24h)
```javascript
const HOURS = 24;
const cutoff = new Date(Date.now() - HOURS * 60 * 60 * 1000);

return $input.all().filter(item => {
  const date = new Date(item.json.date);
  return date > cutoff;
});
```

### Limit Items
```javascript
const MAX = 10;
return $input.all().slice(0, MAX);
```

### Handle Empty Input
```javascript
if ($input.all().length === 0) {
  return [{ json: { message: "No data to process" } }];
}
// Continue processing...
```

---

## Best Practices

### Naming
- Workflows: `[Status] Source > Destination: Task`
- Example: `[Prod] RSS > Telegram: Daily Digest`
- Status: `[InDev]`, `[InTesting]`, `[Prod]`, `[Offline]`

### Error Handling
1. Create error workflow with Error Trigger node
2. Set error workflow in main workflow settings
3. Enable retries on HTTP nodes (3-5 attempts)

### Performance
- Filter data early
- Use `Split In Batches` for large datasets
- Prefer built-in nodes over Code node
- Cache expensive API calls

### Security
- Use n8n credential storage (never hardcode)
- Enable webhook authentication
- Rotate API keys periodically

---

## Additional Resources

For detailed information, see the `/docs` folder:
- `n8n-api-specification.md` - Complete API reference
- `n8n-workflow-best-practices.md` - Design patterns
- `n8n-workflows-collection.md` - Example repositories
- `testing-infrastructure-specification.md` - Testing setup

---

## Example: Create Simple Workflow

```bash
curl -X POST "$N8N_INSTANCE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "[InDev] Test Workflow",
    "nodes": [
      {
        "id": "1",
        "name": "Manual Trigger",
        "type": "n8n-nodes-base.manualTrigger",
        "typeVersion": 1,
        "position": [100, 100],
        "parameters": {}
      }
    ],
    "connections": {},
    "settings": { "executionOrder": "v1" }
  }'
```

---

*Skill for Claude Code - n8n Workflow Assistant*
