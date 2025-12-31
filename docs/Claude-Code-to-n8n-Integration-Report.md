# Connecting Claude Code to n8n: A Complete Guide

## Executive Summary

**Yes, you can absolutely connect Claude Code to n8n!** This is done through n8n's REST API (a way for programs to talk to each other over the internet). Claude Code can use simple commands to create, edit, debug, and trigger your n8n workflows remotely - no MCP needed.

---

## How It Works (The Simple Version)

Think of it like this:
- **n8n** is like a switchboard operator that connects different services
- **Claude Code** is your smart assistant that can make phone calls to that switchboard
- **The API** is the phone line between them

When you ask Claude Code to do something with n8n, it sends a message over the internet to your n8n instance, n8n does the work, and sends back a response.

---

## What Claude Code Can Do With Your n8n

| Task | How It Works |
|------|--------------|
| **Create new workflows** | Send workflow design as data to n8n |
| **Edit existing workflows** | Fetch workflow, modify it, send it back |
| **Delete workflows** | Send a delete command with workflow ID |
| **Turn workflows on/off** | Activate or deactivate with a command |
| **Trigger/test workflows** | Start a workflow and see what happens |
| **View execution history** | Check if workflows ran successfully |
| **Debug problems** | Read error logs and execution details |
| **Manage credentials** | Add or update login info for services |

---

## The Two Main Connection Methods

### Method 1: n8n REST API (Recommended)

This is the "official" way to control n8n programmatically.

**What you need:**
1. An n8n instance (cloud or self-hosted)
2. An API key from n8n
3. The URL of your n8n instance

**Example of what Claude Code would do:**

```bash
# List all your workflows
curl -X GET "https://your-n8n.com/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-secret-key"

# Create a new workflow
curl -X POST "https://your-n8n.com/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "My New Workflow", "nodes": [...], "connections": {...}}'

# Activate a workflow
curl -X POST "https://your-n8n.com/api/v1/workflows/123/activate" \
  -H "X-N8N-API-KEY: your-secret-key"
```

### Method 2: Webhooks (For Triggering Workflows)

Webhooks are like doorbells - you ring them and something happens inside.

**What you need:**
1. A workflow in n8n that starts with a "Webhook" node
2. The webhook URL that n8n gives you

**Example:**

```bash
# Trigger a workflow and send it some data
curl -X POST "https://your-n8n.com/webhook/my-workflow-trigger" \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "John", "order_id": "12345"}'
```

---

## Step-by-Step Setup Guide

### For n8n Cloud Users

1. **Log into n8n Cloud** at your-instance.app.n8n.cloud
2. **Go to Settings** (gear icon)
3. **Click "n8n API"** in the menu
4. **Click "Create an API key"**
5. **Give it a name** (like "Claude Code Access")
6. **Set expiration** (how long the key should work)
7. **Copy the key** - you'll need this!

**Important:** The API is NOT available during free trials. You need a paid plan.

### For Self-Hosted n8n Users

1. **Make sure the API is enabled** in your configuration:
   ```
   N8N_PUBLIC_API_DISABLED=false
   ```
2. **Access your n8n instance**
3. **Follow the same steps** as cloud users to create an API key
4. **Note your instance URL** (like http://localhost:5678 or https://n8n.yourcompany.com)

---

## What Information Claude Code Needs

To connect to your n8n, tell Claude Code:

| Information | Example | Where to Find It |
|------------|---------|------------------|
| **Instance URL** | `https://mycompany.app.n8n.cloud` | Your browser address bar when using n8n |
| **API Key** | `n8n_api_abc123xyz...` | Settings > n8n API in n8n |
| **Workflow IDs** | `123` or `abc-def-ghi` | URL when editing a workflow |

---

## Real-World Examples

### Example 1: "Create a workflow that sends me an email when a form is submitted"

Claude Code would:
1. Design the workflow structure (nodes and connections)
2. Send a POST request to create the workflow
3. Activate the workflow
4. Give you the webhook URL to put in your form

### Example 2: "Test my order processing workflow"

Claude Code would:
1. Send a test request to the workflow's webhook
2. Wait for the response
3. Check the execution history for errors
4. Tell you what happened

### Example 3: "Why is my workflow failing?"

Claude Code would:
1. Get the list of recent executions
2. Find the failed ones
3. Read the error details
4. Explain what went wrong and suggest fixes

---

## Cloud vs Self-Hosted: Key Differences

| Feature | n8n Cloud | Self-Hosted |
|---------|-----------|-------------|
| **API Access** | Paid plans only | Always available (if enabled) |
| **Setup Difficulty** | Easy (just get API key) | Medium (need to configure) |
| **URL Format** | `https://xxx.app.n8n.cloud/api/v1` | `https://your-domain.com/api/v1` |
| **Customization** | Limited | Full control |
| **Cost** | Monthly subscription (~€60+) | Server costs only |
| **Security** | n8n manages it | You manage it |

---

## Security Considerations

### Keep Your API Key Safe
- Never share it publicly
- Don't put it in code that goes to GitHub
- Set an expiration date
- Delete keys you no longer use

### For Self-Hosted Users
- Use HTTPS (encrypted connection)
- Consider IP whitelisting (only allow certain computers)
- Keep n8n updated

---

## Limitations to Know About

1. **Cloud Free Trial**: No API access during trial period
2. **Payload Size**: Maximum 16MB of data per request
3. **Rate Limits**: Too many requests too fast may be blocked
4. **SSL Required**: Cloud requires secure connections
5. **Workflow Complexity**: Very large workflows may timeout

---

## Troubleshooting Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| "Unauthorized" error | Wrong or expired API key | Generate a new key |
| "Not Found" error | Wrong URL or workflow ID | Double-check the URL |
| Connection refused | n8n not running or wrong port | Verify n8n is running |
| Timeout | Workflow takes too long | Optimize the workflow |
| "API not available" | Free trial or API disabled | Upgrade plan or enable API |

---

## Glossary (Technical Terms Explained)

| Term | Simple Explanation |
|------|-------------------|
| **API** | A way for programs to talk to each other, like a waiter taking orders between you and the kitchen |
| **REST API** | A specific style of API that uses web addresses (URLs) and standard commands (GET, POST, etc.) |
| **Endpoint** | A specific URL where you send requests, like a specific phone number for a department |
| **HTTP Method** | The type of action: GET (read), POST (create), PUT (update), DELETE (remove) |
| **API Key** | A password that proves you're allowed to use the API |
| **JSON** | A format for organizing data, like a structured form |
| **Webhook** | A URL that triggers something when you visit it, like a doorbell |
| **cURL** | A command-line tool for making web requests, like a text-based web browser |
| **Header** | Extra information sent with a request, like the "from" address on a letter |
| **Payload** | The actual data you're sending, like the contents of a package |
| **Self-hosted** | Running software on your own computer/server instead of using a company's servers |
| **Instance** | One running copy of n8n (you might have a test instance and a production instance) |
| **Execution** | One run of a workflow from start to finish |
| **Node** | One step/block in an n8n workflow |
| **Activate/Deactivate** | Turn a workflow on or off |

---

## Quick Reference Card

### Base URLs
- **Cloud**: `https://{your-instance}.app.n8n.cloud/api/v1`
- **Self-hosted**: `https://{your-domain}/api/v1`

### Essential API Endpoints
```
GET    /workflows           - List all workflows
GET    /workflows/{id}      - Get one workflow
POST   /workflows           - Create workflow
PUT    /workflows/{id}      - Update workflow
DELETE /workflows/{id}      - Delete workflow
POST   /workflows/{id}/activate    - Turn on
POST   /workflows/{id}/deactivate  - Turn off

GET    /executions          - List execution history
GET    /executions/{id}     - Get execution details
DELETE /executions/{id}     - Delete execution record

GET    /credentials         - List credentials
POST   /credentials         - Create credential
```

### Authentication Header
```
X-N8N-API-KEY: your-api-key-here
```

---

## Next Steps

1. **Get your n8n API key** (see setup guide above)
2. **Share the key and URL with Claude Code** when you want to work with n8n
3. **Just ask Claude Code** to create, edit, or debug workflows!

Example prompts you can use:
- "Create an n8n workflow that monitors my Gmail for invoices"
- "Debug my Slack notification workflow - it's not sending messages"
- "Show me all my active workflows in n8n"
- "Test my order processing webhook with sample data"

---

## Sources

- [n8n Public REST API Documentation](https://docs.n8n.io/api/)
- [n8n API Authentication Guide](https://docs.n8n.io/api/authentication/)
- [n8n Webhook Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [n8n Environment Variables](https://docs.n8n.io/hosting/configuration/environment-variables/)
- [n8n Data Structure Guide](https://docs.n8n.io/data/data-structure/)
- [Dynamic Workflow Creation Template](https://n8n.io/workflows/4544-create-dynamic-workflows-programmatically-via-webhooks-and-n8n-api/)
- [n8n Cloud vs Self-Hosted Comparison](https://docs.n8n.io/choose-n8n/)

---

*Report generated by Claude Code - December 2025*
