---
name: n8n-workflows
description: n8n workflow debugging, API usage, node configs, common errors, and best practices
---

# n8n Workflow Skills

## Quick Reference - API

### Authentication
```bash
Header: X-N8N-API-KEY: <jwt-token>
Base URL: https://<instance>.app.n8n.cloud/api/v1
```

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/workflows/{id}` | Get workflow |
| `PUT` | `/workflows/{id}` | Update workflow (only send: name, nodes, connections, settings) |
| `POST` | `/workflows/{id}/activate` | Activate workflow |
| `GET` | `/executions?status=error` | Get failed executions |
| `GET` | `/executions/{id}?includeData=true` | Get execution details with error info |

---

## Expression Syntax

**All dynamic content needs `{{}}`**

### Core Variables
| Variable | What it does | Example |
|----------|--------------|---------|
| `$json` | Current node output | `{{ $json.email }}` |
| `$node` | Reference other nodes | `{{ $node["HTTP Request"].json.data }}` |
| `$now` | Current timestamp | `{{ $now.format('yyyy-MM-dd') }}` |
| `$env` | Environment variables | `{{ $env.API_KEY }}` |
| `$input` | All input items | `{{ $input.all() }}` |
| `$itemIndex` | Current item index | `{{ $itemIndex }}` |

### CRITICAL: Webhook Body Gotcha
Webhook data lives under `.body`, NOT root level. This causes 80% of webhook errors.

| Wrong | Right |
|-------|-------|
| `{{ $json.email }}` | `{{ $json.body.email }}` |
| `{{ $json.name }}` | `{{ $json.body.name }}` |
| `{{ $json.data }}` | `{{ $json.body.data }}` |

### Syntax Rules
1. Always wrap in `{{ }}` for dynamic content
2. Use bracket notation for spaces: `{{ $json["First Name"] }}`
3. Node names are case-sensitive
4. Never nest braces: `{{ {{ bad }} }}`
5. No expressions in: Code nodes, webhook paths, credentials

### Common Patterns
```javascript
// Conditional
{{ $json.status === 'active' ? 'Yes' : 'No' }}

// Default value
{{ $json.name || 'Unknown' }}

// Array access
{{ $json.items[0].title }}

// Date formatting
{{ $now.format('dd/MM/yyyy HH:mm') }}

// String methods
{{ $json.email.toLowerCase() }}
```

---

## 5 Workflow Patterns

Choose the right architecture for your use case:

| Pattern | Use When | % of workflows |
|---------|----------|----------------|
| **Webhook Processing** | External triggers (forms, APIs calling you) | 35% |
| **HTTP API Integration** | Fetch/push data to external services | 45% |
| **Database Operations** | Read/write to databases, sync data | 28% |
| **AI Agent Workflows** | AI with tools, memory, decisions | Growing |
| **Scheduled Tasks** | Recurring automation (daily, hourly) | 28% |

### Pattern 1: Webhook Processing
```
Webhook → Validate → Process → Respond
```
- Always validate incoming data
- Return response quickly (avoid timeouts)
- Use "Respond to Webhook" node for custom responses

### Pattern 2: HTTP API Integration
```
Trigger → HTTP Request → Transform → Output
```
- Handle pagination for large datasets
- Add retry logic for flaky APIs
- Cache responses when possible

### Pattern 3: Database Operations
```
Trigger → Query → Transform → Write/Update
```
- Use transactions for critical writes
- Batch operations for performance
- Always handle "no results" case

### Pattern 4: AI Agent Workflows
```
Input → AI Agent → Tools → Memory → Output
```
- Define clear system prompts
- Limit tool access to what's needed
- Add human-in-the-loop for critical decisions

### Pattern 5: Scheduled Tasks
```
Schedule Trigger → Fetch → Process → Notify
```
- Use appropriate intervals (don't over-poll)
- Handle "nothing new" gracefully
- Add deduplication logic

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `No prompt specified` | AI Agent missing prompt config | Add `promptType: "define"` and `text: "={{ $json.field }}"` |
| `Custom email config is not valid JSON` | IMAP customEmailConfig syntax | Remove custom config, filter in Code node instead |
| `The resource you are requesting could not be found - model: xxx` | Model ID not recognized | Use specific ID like `claude-3-haiku-20240307`, NOT `latest` |
| `Authorization failed - invalid x-api-key` | Anthropic API key invalid | Update API key in n8n Credentials |
| `Your credit balance is too low` | Anthropic needs credits | Add credits at console.anthropic.com |
| `request/body must NOT have additional properties` | Extra fields in API PUT | Only send: name, nodes, connections, settings |
| `Cannot read property Symbol(Symbol.iterator)` | Malformed connections JSON | Use `{ "NodeName": { "main": [[{...}]] } }` format |

---

## Node Configurations

### AI Agent Node (LangChain)
```json
{
  "parameters": {
    "promptType": "define",
    "text": "={{ $json.prompt }}",
    "options": {
      "systemMessage": "Your system prompt..."
    }
  },
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 1.7
}
```

### Anthropic Chat Model
```json
{
  "parameters": {
    "model": {
      "__rl": true,
      "mode": "id",
      "value": "claude-3-haiku-20240307"
    },
    "options": {
      "maxTokensToSample": 2048,
      "temperature": 0.7
    }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
  "typeVersion": 1.3
}
```

**Working model IDs:**
- `claude-3-haiku-20240307` - Fast, cheap
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-opus-20240229` - Best quality
- **Note:** `claude-3-5-sonnet-latest` may NOT work

### IMAP Node
```json
{
  "parameters": { "options": {} },
  "type": "n8n-nodes-base.emailReadImap",
  "typeVersion": 2.1
}
```
**Warning:** `customEmailConfig` is unreliable. Filter in Code node instead.

### Telegram Node
```json
{
  "parameters": {
    "chatId": "123456789",
    "text": "={{ $json.output }}",
    "additionalFields": { "parse_mode": "Markdown" }
  },
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.2
}
```

### Schedule Trigger
```json
{
  "parameters": {
    "rule": { "interval": [{"triggerAtHour": 7}] }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2
}
```

---

## Code Node Patterns

### 24-Hour Deduplication
```javascript
const HOURS_BACK = 24;
const cutoffTime = new Date(Date.now() - HOURS_BACK * 60 * 60 * 1000);

for (const item of $input.all()) {
  const pubDate = new Date(data.pubDate || data.isoDate || 0);
  if (pubDate > cutoffTime) {
    // Include item
  }
}
```

### Limit Items (Cost Control)
```javascript
const MAX_ITEMS = 15;
if (items.length < MAX_ITEMS) {
  items.push(newItem);
}
```

### Email Filtering by Sender
```javascript
if ((data.subject || data.textPlain) &&
    data.from?.includes('sender@example.com')) {
  // Process email
}
```

### Token Saving (Nothing New)
```javascript
const prompt = (items.length === 0)
  ? 'No news. Reply: _nothing new'
  : `Full prompt with ${items.length} items...`;
```

---

## Workflow JSON Structure

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
- Empty: `"connections": {}`

### Settings
```json
{
  "settings": {
    "executionOrder": "v1",
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "timezone": "Europe/Berlin"
  }
}
```

---

## Debugging Workflow

1. **Check errors via API:**
```bash
curl -X GET ".../api/v1/executions?status=error" -H "X-N8N-API-KEY: ..."
```

2. **Get error details:**
```bash
curl -X GET ".../api/v1/executions/{id}?includeData=true" -H "X-N8N-API-KEY: ..."
```

3. **Error location:** `response.data.resultData.error.message`

4. **Push fix:**
```bash
curl -X PUT ".../api/v1/workflows/{id}" -H "X-N8N-API-KEY: ..." -d @workflow.json
```

---

## Best Practices

### Naming Conventions
- Workflows: `[Prod] Source > Destination: Task`
- Nodes: Describe action, not node type
- Status prefixes: `[InDev]`, `[InTesting]`, `[Prod]`, `[Offline]`

### Error Handling
1. Create dedicated error workflow with Error Trigger
2. Assign error workflow in main workflow settings
3. Enable retries on external API nodes (3-5 attempts)

### Performance
- Filter data early to reduce volume
- Use `Split In Batches` for large datasets
- Prefer built-in nodes over Code node
- Cache expensive API calls

### Security
- Use n8n credential storage (never hardcode keys)
- Enable webhook authentication
- Set credential expiration dates
- Rotate keys periodically

---

## Cost Estimates (Claude Haiku)
- Per run (15 items): ~$0.005
- Daily for 1 month: ~$0.15
- With "nothing new" days: even less

---

## Sources
- [n8n REST API Docs](https://docs.n8n.io/api/)
- [n8n Error Handling](https://docs.n8n.io/flow-logic/error-handling/)
- [n8n LangChain Integration](https://docs.n8n.io/integrations/builtin/cluster-nodes/)
- Learned from debugging eToro ETF Digest workflow
