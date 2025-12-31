# n8n REST API - Technical Specification

## Overview

This document provides comprehensive technical specifications for the n8n REST API, compiled for the n8n Workflow Assistant project development.

---

## API Basics

### Base URLs

| Deployment | URL Format |
|------------|------------|
| **n8n Cloud** | `https://{instance}.app.n8n.cloud/api/v1` |
| **Self-hosted** | `https://{your-domain}/api/v1` or `http://localhost:5678/api/v1` |

### API Availability

- **n8n Cloud**: Available on paid plans only (NOT available during free trial)
- **Self-hosted**: Always available (unless disabled via environment variable)

---

## Authentication

### API Key Authentication

All API requests require authentication via the `X-N8N-API-KEY` header.

**Creating an API Key:**
1. Log into n8n
2. Navigate to **Settings > n8n API**
3. Click **Create an API key**
4. Provide a label and set expiration
5. Copy and securely store the key

**Request Format:**
```bash
curl -X GET "https://your-n8n.com/api/v1/workflows" \
  -H "accept: application/json" \
  -H "X-N8N-API-KEY: your-api-key-here"
```

### API Scopes (Enterprise Only)

Enterprise customers can restrict API keys to specific resources and operations. Non-enterprise keys receive full account access.

### Security Best Practices

- Store API keys in environment variables
- Never expose keys in client-side code
- Set expiration dates on keys
- Delete unused keys
- Rotate keys periodically

---

## Pagination

### Parameters

| Parameter | Default | Maximum | Description |
|-----------|---------|---------|-------------|
| `limit` | 100 | 250 | Number of results per page |
| `cursor` | - | - | Base64-encoded token for next page |

### Response Structure

```json
{
  "data": [...],
  "nextCursor": "base64-encoded-cursor-string"
}
```

### Example

**First page:**
```bash
GET /api/v1/workflows?active=true&limit=150
```

**Next page:**
```bash
GET /api/v1/workflows?active=true&limit=150&cursor=<nextCursor_value>
```

---

## API Endpoints

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/workflows` | List all workflows |
| `GET` | `/workflows/{id}` | Get single workflow |
| `POST` | `/workflows` | Create new workflow |
| `PUT` | `/workflows/{id}` | Update workflow |
| `DELETE` | `/workflows/{id}` | Delete workflow |
| `POST` | `/workflows/{id}/activate` | Activate workflow |
| `POST` | `/workflows/{id}/deactivate` | Deactivate workflow |

### Executions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/executions` | List executions (max 250 per request) |
| `GET` | `/executions/{id}` | Get execution details |
| `DELETE` | `/executions/{id}` | Delete execution record |

**Execution Filters:**
- Filter by workflow (ID, URL, or from list)
- Filter by status: `Error`, `Success`, `Waiting`, `Running`, `Cancelled`
- Include execution details (optional)

### Credentials

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/credentials` | List credentials |
| `GET` | `/credentials/schema/{type}` | Get credential schema |
| `POST` | `/credentials` | Create credential |
| `PUT` | `/credentials/{id}` | Update credential (requires `credential:update` scope) |
| `DELETE` | `/credentials/{id}` | Delete credential |

**Credential Types** (examples):
- `githubApi`
- `notionApi`
- `slackApi`
- `openAiApi`

### Audit (Enterprise)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/audit` | Generate security audit |

**Risk Categories:**
- Credentials
- Database
- Filesystem
- Instance
- Nodes

---

## Workflow JSON Structure

### Top-Level Fields

```json
{
  "id": "workflow-uuid",
  "name": "My Workflow",
  "active": false,
  "nodes": [...],
  "connections": {...},
  "settings": {...},
  "staticData": null,
  "tags": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Workflow display name |
| `nodes` | array | Yes | Array of node objects |
| `connections` | object | Yes | Node connection mappings |
| `settings` | object | No | Workflow settings |
| `active` | boolean | No | Whether workflow is active |
| `staticData` | object | No | Persistent workflow data |
| `tags` | array | No | Workflow tags |

### Node Object Structure

```json
{
  "id": "unique-node-id",
  "name": "Node Display Name",
  "type": "n8n-nodes-base.nodeType",
  "typeVersion": 1,
  "position": [x, y],
  "parameters": {...},
  "credentials": {...}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (UUID format) |
| `name` | string | Yes | Display name in workflow |
| `type` | string | Yes | Node type identifier |
| `typeVersion` | number | Yes | Node version |
| `position` | array | Yes | Canvas coordinates [x, y] |
| `parameters` | object | No | Node-specific configuration |
| `credentials` | object | No | Credential references |

### Connections Object Structure

```json
{
  "connections": {
    "SourceNodeName": {
      "main": [
        [
          {
            "node": "TargetNodeName",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Key Points:**
- Keys are source node **names** (not IDs)
- `main` indicates the primary output type
- Array structure supports multiple outputs/connections
- `index` specifies which input on target node
- **Empty connections**: Use `{}` if no connections exist

### Common Connection Mistake

**Wrong** (causes "Cannot read property Symbol(Symbol.iterator)" error):
```json
"connections": {
  "main": [{"node": "Target", "type": "main", "index": 0}]
}
```

**Correct**:
```json
"connections": {
  "SourceNodeName": {
    "main": [[{"node": "Target", "type": "main", "index": 0}]]
  }
}
```

### Workflow Settings Object

```json
{
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "saveExecutionProgress": false,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "timeout": 3600,
    "timezone": "America/New_York",
    "errorWorkflow": "error-workflow-id"
  }
}
```

| Setting | Values | Description |
|---------|--------|-------------|
| `executionOrder` | `v1`, `v0` | Branch execution order (v1 recommended) |
| `saveManualExecutions` | boolean | Save test executions |
| `saveExecutionProgress` | boolean | Enable resume on error |
| `saveDataErrorExecution` | `all`, `none` | Save failed executions |
| `saveDataSuccessExecution` | `all`, `none` | Save successful executions |
| `timeout` | number | Timeout in seconds (-1 = none) |
| `timezone` | string | Workflow timezone |
| `errorWorkflow` | string | Workflow ID for error handling |

---

## Common Node Types

### Trigger Nodes

| Type | Description |
|------|-------------|
| `n8n-nodes-base.manualTrigger` | Manual execution trigger |
| `n8n-nodes-base.scheduleTrigger` | Time-based trigger |
| `n8n-nodes-base.webhook` | HTTP webhook trigger |
| `n8n-nodes-base.emailTrigger` | Email trigger |
| `n8n-nodes-base.n8nTrigger` | n8n event trigger |
| `n8n-nodes-base.formTrigger` | Form submission trigger |
| `n8n-nodes-base.workflowTrigger` | Sub-workflow trigger |

### Core Action Nodes

| Type | Description |
|------|-------------|
| `n8n-nodes-base.httpRequest` | Make HTTP requests |
| `n8n-nodes-base.code` | Execute custom code |
| `n8n-nodes-base.set` | Set field values |
| `n8n-nodes-base.if` | Conditional branching |
| `n8n-nodes-base.switch` | Multi-path branching |
| `n8n-nodes-base.merge` | Combine data streams |
| `n8n-nodes-base.splitInBatches` | Process items in batches |
| `n8n-nodes-base.function` | Run JavaScript functions |
| `n8n-nodes-base.respondToWebhook` | Send webhook response |
| `n8n-nodes-base.executeWorkflow` | Call sub-workflow |
| `n8n-nodes-base.noOp` | No operation (pass-through) |

### Integration Nodes (examples)

| Type | Description |
|------|-------------|
| `n8n-nodes-base.gmail` | Gmail operations |
| `n8n-nodes-base.slack` | Slack operations |
| `n8n-nodes-base.googleSheets` | Google Sheets operations |
| `n8n-nodes-base.notion` | Notion operations |
| `n8n-nodes-base.airtable` | Airtable operations |
| `n8n-nodes-base.postgres` | PostgreSQL operations |
| `n8n-nodes-base.mysql` | MySQL operations |

---

## Data Structure

### JSON Data Format

Data passed between nodes must be an **array of objects** with a `json` wrapper:

```json
[
  {
    "json": {
      "field1": "value1",
      "field2": {
        "nested": "value"
      }
    }
  },
  {
    "json": {
      "field1": "value2"
    }
  }
]
```

### Binary Data Format

```json
{
  "binary": {
    "data": {
      "data": "base64-encoded-string",
      "mimeType": "image/png",
      "fileExtension": "png",
      "fileName": "example.png"
    }
  }
}
```

### Auto-Wrapping (v0.166.0+)

Function and Code nodes automatically add `json` wrapper and array syntax if missing. **Custom API calls must still use proper format.**

---

## Webhook Configuration

### URL Types

| Type | When Active | Use Case |
|------|-------------|----------|
| **Test URL** | During development | Testing with "Listen for Test Event" |
| **Production URL** | After workflow activation | Live production use |

### HTTP Methods Supported

`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`

### Authentication Options

| Method | Description |
|--------|-------------|
| None | No authentication |
| Basic Auth | Username/password |
| Header Auth | Custom header name/value |
| JWT Auth | JSON Web Token |

### Response Modes

| Mode | Description |
|------|-------------|
| Immediately | Returns "Workflow got started" |
| When Last Node Finishes | Returns final node output |
| Using Respond to Webhook Node | Custom response handling |
| Streaming Response | Real-time data streaming |

### Configuration Options

| Option | Description |
|--------|-------------|
| Path | Custom URL path (supports route parameters) |
| Allowed Origins (CORS) | Cross-origin domain whitelist |
| Binary Property | Enable binary data reception |
| Ignore Bots | Filter bot requests |
| IP Whitelist | Limit by IP address |
| Raw Body | Receive unparsed request body |

### Payload Limits

- **Default**: 16MB maximum
- **Configurable**: Via `N8N_PAYLOAD_SIZE_MAX` environment variable
- **Form data**: 200MB default (`N8N_FORMDATA_FILE_SIZE_MAX`)

---

## Environment Variables (Self-Hosted)

### API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `N8N_PUBLIC_API_DISABLED` | `false` | Disable public API |
| `N8N_PUBLIC_API_ENDPOINT` | `api` | API path |
| `N8N_PUBLIC_API_SWAGGERUI_DISABLED` | `false` | Disable API playground |

### Endpoints

| Variable | Default | Description |
|----------|---------|-------------|
| `N8N_ENDPOINT_REST` | `rest` | REST endpoint path |
| `N8N_ENDPOINT_WEBHOOK` | `webhook` | Webhook path |
| `N8N_ENDPOINT_WEBHOOK_TEST` | `webhook-test` | Test webhook path |
| `N8N_ENDPOINT_WEBHOOK_WAIT` | `webhook-waiting` | Waiting webhook path |

### Limits

| Variable | Default | Description |
|----------|---------|-------------|
| `N8N_PAYLOAD_SIZE_MAX` | `16` | Max payload size (MiB) |
| `N8N_FORMDATA_FILE_SIZE_MAX` | `200` | Max form file size (MiB) |
| `EXECUTIONS_TIMEOUT` | `-1` | Default timeout (seconds) |

### Security

| Variable | Description |
|----------|-------------|
| `N8N_ENCRYPTION_KEY` | Custom encryption key for credentials |
| `WEBHOOK_URL` | Manual webhook URL (for reverse proxy) |

---

## API Playground

Self-hosted n8n includes a built-in Swagger UI playground at:
```
https://{your-n8n}/api/v1/docs
```

**Features:**
- Interactive documentation
- Test requests directly
- View request/response schemas
- Authorize with API key

**Note:** Authorized playground requests access live data.

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (invalid JSON) |
| `401` | Unauthorized (invalid/missing API key) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `429` | Rate limited |
| `500` | Server error |

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Invalid/expired API key | Generate new key |
| "Not Found" | Wrong URL or ID | Verify endpoint and IDs |
| "Cannot read property Symbol" | Malformed connections JSON | Fix connections structure |
| "API not available" | Free trial or disabled | Upgrade plan or enable API |
| Timeout | Workflow too slow | Optimize or increase timeout |

---

## Complete API Examples

### Create a Simple Workflow

```bash
curl -X POST "https://your-n8n.com/api/v1/workflows" \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: your-api-key" \
  -d '{
    "name": "My API Workflow",
    "nodes": [
      {
        "id": "start",
        "name": "Start",
        "type": "n8n-nodes-base.manualTrigger",
        "typeVersion": 1,
        "position": [100, 100],
        "parameters": {}
      },
      {
        "id": "set-data",
        "name": "Set Data",
        "type": "n8n-nodes-base.set",
        "typeVersion": 1,
        "position": [300, 100],
        "parameters": {
          "values": {
            "string": [
              {
                "name": "message",
                "value": "Hello from API!"
              }
            ]
          }
        }
      }
    ],
    "connections": {
      "Start": {
        "main": [
          [
            {
              "node": "Set Data",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "settings": {}
  }'
```

**Success Response:**
```json
{
  "id": "workflow-uuid",
  "name": "My API Workflow",
  "active": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "nodes": [...],
  "connections": {...},
  "settings": {}
}
```

### Activate Workflow

```bash
curl -X POST "https://your-n8n.com/api/v1/workflows/{id}/activate" \
  -H "X-N8N-API-KEY: your-api-key"
```

### Get Workflow Executions

```bash
curl -X GET "https://your-n8n.com/api/v1/executions?workflowId={id}&status=error&limit=10" \
  -H "X-N8N-API-KEY: your-api-key"
```

### Trigger Webhook Workflow

```bash
curl -X POST "https://your-n8n.com/webhook/my-workflow" \
  -H "Content-Type: application/json" \
  -d '{"customer": "John", "order": "12345"}'
```

---

## Validation Checklist

When creating workflows via API, verify:

- [ ] `nodes` is an array with at least one item
- [ ] Each node has: `id`, `name`, `type`, `position`
- [ ] `connections` uses node **names** as keys (not IDs)
- [ ] `connections` uses double-nested arrays: `[[{...}]]`
- [ ] Empty workflows use `"connections": {}`
- [ ] `typeVersion` matches the node version you're using
- [ ] Position values are valid numbers `[x, y]`
- [ ] Required node parameters are provided
- [ ] Credential references exist in your n8n instance

---

## Rate Limits and Quotas

- **Pagination**: Max 250 items per request
- **Payload**: Max 16MB (configurable)
- **Executions**: Consider cleanup for large volumes
- **API calls**: No documented rate limits, but excessive requests may be throttled

---

## Sources

- [n8n Public REST API Documentation](https://docs.n8n.io/api/)
- [n8n API Authentication](https://docs.n8n.io/api/authentication/)
- [n8n API Pagination](https://docs.n8n.io/api/pagination/)
- [n8n Data Structure](https://docs.n8n.io/data/data-structure/)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [n8n Workflow Settings](https://docs.n8n.io/workflows/settings/)
- [n8n Environment Variables](https://docs.n8n.io/hosting/configuration/environment-variables/)
- [n8n Node Types](https://docs.n8n.io/integrations/builtin/node-types/)
- [Dynamic Workflow Creation Template](https://n8n.io/workflows/4544-create-dynamic-workflows-programmatically-via-webhooks-and-n8n-api/)

---

*Document compiled for n8n Workflow Assistant project - December 2025*
