# n8n API Reference

Complete API documentation for n8n REST API integration.

## Base Configuration

```bash
Base URL: $N8N_INSTANCE_URL/api/v1
Header: X-N8N-API-KEY: $N8N_API_KEY
Content-Type: application/json
```

## Workflows API

### List All Workflows
```bash
GET /workflows
GET /workflows?active=true    # Only active
GET /workflows?limit=50       # Pagination
```

### Get Single Workflow
```bash
GET /workflows/{id}
```

### Create Workflow
```bash
POST /workflows
Content-Type: application/json

{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Update Workflow
```bash
PUT /workflows/{id}
Content-Type: application/json

# ONLY send these fields:
{
  "name": "Updated Name",
  "nodes": [...],
  "connections": {...},
  "settings": {...}
}

# Do NOT include: id, active, createdAt, updatedAt, staticData, tags
```

### Delete Workflow
```bash
DELETE /workflows/{id}
```

### Activate/Deactivate
```bash
POST /workflows/{id}/activate
POST /workflows/{id}/deactivate
```

---

## Executions API

### List Executions
```bash
GET /executions
GET /executions?status=error              # Failed only
GET /executions?status=success            # Successful only
GET /executions?workflowId={id}           # Specific workflow
GET /executions?limit=20                  # Pagination
```

### Get Execution Details
```bash
GET /executions/{id}
GET /executions/{id}?includeData=true     # Include full data
```

Response structure for errors:
```json
{
  "data": {
    "resultData": {
      "error": {
        "message": "Error description here",
        "node": "NodeName"
      }
    }
  }
}
```

### Delete Execution
```bash
DELETE /executions/{id}
```

---

## Credentials API

### List Credentials
```bash
GET /credentials
```

### Get Credential Schema
```bash
GET /credentials/schema/{credentialType}
```

Note: Credential values are not exposed via API for security.

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (check JSON) |
| 401 | Unauthorized (check API key) |
| 404 | Not found |
| 500 | Server error |

---

## Common Errors

### `request/body must NOT have additional properties`
You're sending fields that shouldn't be in the request. For PUT requests, only send:
- name
- nodes
- connections
- settings

### `Cannot read property Symbol(Symbol.iterator)`
Malformed connections object. Must be:
```json
{
  "SourceNodeName": {
    "main": [[
      { "node": "TargetNodeName", "type": "main", "index": 0 }
    ]]
  }
}
```

### `Unauthorized`
- Check API key is correct
- Check API key hasn't expired
- Verify API is enabled in n8n settings

---

## Rate Limits

n8n Cloud has rate limits. Self-hosted typically doesn't.

If you hit limits:
- Add delays between requests
- Batch operations where possible
- Cache responses

---

## Webhook URLs

For webhook-triggered workflows:
```
Production: $N8N_INSTANCE_URL/webhook/{path}
Test: $N8N_INSTANCE_URL/webhook-test/{path}
```

---

*Reference for n8n Workflow Assistant Skill*
