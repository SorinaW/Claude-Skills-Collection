# Workflow Patterns

Common automation patterns for n8n workflows.

## Pattern 1: Webhook → Process → Notify

**Use case:** React to external events
```
Webhook → Code (process) → Telegram/Slack/Email
```

Example: Form submission notification
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": { "path": "form-submit", "httpMethod": "POST" }
    },
    {
      "name": "Format Message",
      "type": "n8n-nodes-base.code",
      "parameters": { "jsCode": "return [{ json: { text: `New submission from ${$json.email}` } }]" }
    },
    {
      "name": "Send Telegram",
      "type": "n8n-nodes-base.telegram",
      "parameters": { "chatId": "123456", "text": "={{ $json.text }}" }
    }
  ]
}
```

---

## Pattern 2: Schedule → Fetch → Filter → Act

**Use case:** Daily/hourly data processing
```
Schedule Trigger → HTTP Request → Code (filter) → Action
```

Example: Daily RSS digest
```json
{
  "nodes": [
    {
      "name": "Daily 7AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": { "rule": { "interval": [{ "triggerAtHour": 7 }] } }
    },
    {
      "name": "Fetch RSS",
      "type": "n8n-nodes-base.rssFeedRead",
      "parameters": { "url": "https://example.com/feed.xml" }
    },
    {
      "name": "Last 24h Only",
      "type": "n8n-nodes-base.code",
      "parameters": { "jsCode": "const cutoff = Date.now() - 24*60*60*1000; return $input.all().filter(i => new Date(i.json.pubDate) > cutoff);" }
    }
  ]
}
```

---

## Pattern 3: Conditional Branching

**Use case:** Different actions based on data
```
Trigger → IF → [True path] / [False path]
```

```json
{
  "nodes": [
    {
      "name": "Check Priority",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.priority }}",
            "operation": "equals",
            "value2": "high"
          }]
        }
      }
    }
  ],
  "connections": {
    "Check Priority": {
      "main": [
        [{ "node": "Urgent Handler", "type": "main", "index": 0 }],
        [{ "node": "Normal Handler", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

---

## Pattern 4: AI Processing

**Use case:** LLM-powered automation
```
Trigger → Prepare Prompt → AI Agent → Parse Response → Action
```

```json
{
  "nodes": [
    {
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.content }}",
        "options": { "systemMessage": "Summarize this content in 3 bullet points." }
      }
    },
    {
      "name": "Claude Model",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "parameters": {
        "model": { "__rl": true, "mode": "id", "value": "claude-3-haiku-20240307" }
      }
    }
  ]
}
```

---

## Pattern 5: Error Handling

**Use case:** Graceful failure handling
```
Main Workflow → (on error) → Error Workflow → Notify
```

1. Create error workflow with Error Trigger
2. In main workflow settings, set `errorWorkflow` to error workflow ID

```json
{
  "name": "Error Handler",
  "nodes": [
    {
      "name": "Error Trigger",
      "type": "n8n-nodes-base.errorTrigger",
      "parameters": {}
    },
    {
      "name": "Alert Team",
      "type": "n8n-nodes-base.telegram",
      "parameters": {
        "text": "Workflow failed: {{ $json.workflow.name }}\nError: {{ $json.execution.error.message }}"
      }
    }
  ]
}
```

---

## Pattern 6: Batch Processing

**Use case:** Handle large datasets
```
Trigger → Split In Batches → Process → Merge
```

```json
{
  "nodes": [
    {
      "name": "Split",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": { "batchSize": 10 }
    }
  ]
}
```

---

## Pattern 7: Data Enrichment

**Use case:** Add data from external sources
```
Trigger → For Each Item → API Lookup → Merge Back
```

```json
{
  "nodes": [
    {
      "name": "Enrich",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.example.com/lookup/{{ $json.id }}",
        "method": "GET"
      }
    }
  ]
}
```

---

## Anti-Patterns to Avoid

### Don't: Hardcode credentials
```json
// BAD
"parameters": { "apiKey": "sk-12345..." }

// GOOD - use n8n credentials
"credentials": { "openAiApi": { "id": "1", "name": "OpenAI" } }
```

### Don't: Infinite loops
Always have exit conditions in loops.

### Don't: Ignore errors
Set up error workflows for production.

### Don't: Process unlimited data
Always filter/limit data early in the workflow.

---

*Patterns for n8n Workflow Assistant Skill*
