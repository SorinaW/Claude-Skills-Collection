# Workflow Examples

Ready-to-use workflow JSON examples.

## Example 1: Simple Webhook Echo

Returns whatever is sent to it.

```json
{
  "name": "[InDev] Webhook Echo",
  "nodes": [
    {
      "id": "webhook-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "path": "echo",
        "httpMethod": "POST",
        "responseMode": "lastNode"
      }
    },
    {
      "id": "respond-1",
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { received: $json, timestamp: new Date().toISOString() } }}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    }
  },
  "settings": { "executionOrder": "v1" }
}
```

---

## Example 2: Daily Telegram Reminder

Sends a message every day at 9 AM.

```json
{
  "name": "[Prod] Daily Reminder",
  "nodes": [
    {
      "id": "schedule-1",
      "name": "Every Day 9AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [100, 100],
      "parameters": {
        "rule": {
          "interval": [{ "triggerAtHour": 9 }]
        }
      }
    },
    {
      "id": "telegram-1",
      "name": "Send Reminder",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [300, 100],
      "parameters": {
        "chatId": "YOUR_CHAT_ID",
        "text": "Good morning! Here's your daily reminder.",
        "additionalFields": {}
      },
      "credentials": {
        "telegramApi": { "id": "1", "name": "Telegram Bot" }
      }
    }
  ],
  "connections": {
    "Every Day 9AM": {
      "main": [[{ "node": "Send Reminder", "type": "main", "index": 0 }]]
    }
  },
  "settings": { "executionOrder": "v1" }
}
```

---

## Example 3: RSS to Telegram

Fetches RSS feed and sends new items to Telegram.

```json
{
  "name": "[Prod] RSS > Telegram",
  "nodes": [
    {
      "id": "schedule-1",
      "name": "Every Hour",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [100, 100],
      "parameters": {
        "rule": { "interval": [{ "field": "hours", "hoursInterval": 1 }] }
      }
    },
    {
      "id": "rss-1",
      "name": "Fetch Feed",
      "type": "n8n-nodes-base.rssFeedRead",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://example.com/feed.xml"
      }
    },
    {
      "id": "code-1",
      "name": "Filter Recent",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [500, 100],
      "parameters": {
        "jsCode": "const hourAgo = Date.now() - 60*60*1000;\nreturn $input.all().filter(item => new Date(item.json.pubDate) > hourAgo);"
      }
    },
    {
      "id": "telegram-1",
      "name": "Send to Telegram",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [700, 100],
      "parameters": {
        "chatId": "YOUR_CHAT_ID",
        "text": "New: {{ $json.title }}\n{{ $json.link }}"
      },
      "credentials": {
        "telegramApi": { "id": "1", "name": "Telegram Bot" }
      }
    }
  ],
  "connections": {
    "Every Hour": {
      "main": [[{ "node": "Fetch Feed", "type": "main", "index": 0 }]]
    },
    "Fetch Feed": {
      "main": [[{ "node": "Filter Recent", "type": "main", "index": 0 }]]
    },
    "Filter Recent": {
      "main": [[{ "node": "Send to Telegram", "type": "main", "index": 0 }]]
    }
  },
  "settings": { "executionOrder": "v1" }
}
```

---

## Example 4: AI Summary

Uses Claude to summarize content.

```json
{
  "name": "[InDev] AI Summarizer",
  "nodes": [
    {
      "id": "webhook-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "path": "summarize",
        "httpMethod": "POST"
      }
    },
    {
      "id": "agent-1",
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [300, 100],
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.content }}",
        "options": {
          "systemMessage": "Summarize the following content in 3 bullet points. Be concise."
        }
      }
    },
    {
      "id": "model-1",
      "name": "Claude",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "typeVersion": 1.3,
      "position": [300, 300],
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "id",
          "value": "claude-3-haiku-20240307"
        },
        "options": {
          "maxTokensToSample": 1024
        }
      },
      "credentials": {
        "anthropicApi": { "id": "1", "name": "Anthropic" }
      }
    },
    {
      "id": "respond-1",
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [500, 100],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { summary: $json.output } }}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "AI Agent", "type": "main", "index": 0 }]]
    },
    "AI Agent": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    },
    "Claude": {
      "ai_languageModel": [[{ "node": "AI Agent", "type": "ai_languageModel", "index": 0 }]]
    }
  },
  "settings": { "executionOrder": "v1" }
}
```

---

## Example 5: Error Handler Workflow

Catches errors from other workflows and notifies.

```json
{
  "name": "[Prod] Error Handler",
  "nodes": [
    {
      "id": "error-1",
      "name": "Error Trigger",
      "type": "n8n-nodes-base.errorTrigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {}
    },
    {
      "id": "format-1",
      "name": "Format Error",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [300, 100],
      "parameters": {
        "jsCode": "const error = $json;\nreturn [{\n  json: {\n    message: `Workflow Failed\\n\\nWorkflow: ${error.workflow?.name || 'Unknown'}\\nError: ${error.execution?.error?.message || 'Unknown error'}\\nTime: ${new Date().toISOString()}`\n  }\n}];"
      }
    },
    {
      "id": "telegram-1",
      "name": "Alert",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [500, 100],
      "parameters": {
        "chatId": "YOUR_CHAT_ID",
        "text": "={{ $json.message }}"
      },
      "credentials": {
        "telegramApi": { "id": "1", "name": "Telegram Bot" }
      }
    }
  ],
  "connections": {
    "Error Trigger": {
      "main": [[{ "node": "Format Error", "type": "main", "index": 0 }]]
    },
    "Format Error": {
      "main": [[{ "node": "Alert", "type": "main", "index": 0 }]]
    }
  },
  "settings": { "executionOrder": "v1" }
}
```

---

## Using These Examples

1. Copy the JSON
2. Create workflow via API or paste in n8n editor
3. Replace `YOUR_CHAT_ID` with your Telegram chat ID
4. Set up required credentials in n8n
5. Activate the workflow

---

*Examples for n8n Workflow Assistant Skill*
