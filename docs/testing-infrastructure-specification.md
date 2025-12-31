# Testing Infrastructure Specification

## Overview

This document specifies the E2E testing infrastructure for the n8n Workflow Assistant skills. Tests run against a real n8n instance inside a Docker Compose network, enabling verification of actual workflow creation, execution, and integrations.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [Docker Compose Setup](#docker-compose-setup)
4. [Project Structure](#project-structure)
5. [Test Helpers](#test-helpers)
6. [Test Scenarios](#test-scenarios)
7. [Running Tests](#running-tests)
8. [Future Expansion](#future-expansion)
9. [CI/CD Integration](#cicd-integration)

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                        │
│                      (test-network)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │     n8n      │    │  PostgreSQL  │    │   Mailpit    │      │
│  │   (real)     │◄──►│   (n8n DB)   │    │ (mock SMTP)  │      │
│  │              │    │              │    │              │      │
│  │  Port: 5678  │    │  Port: 5432  │    │ SMTP: 1025   │      │
│  │              │    │              │    │  API: 8025   │      │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘      │
│         │                                        │              │
│         │ n8n uses mailpit as SMTP server        │              │
│         └────────────────────────────────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │                                        │
          │ REST API                               │ REST API
          │ (workflow CRUD)                        │ (check emails)
          │                                        │
┌─────────┴────────────────────────────────────────┴──────────────┐
│                      Host Machine                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Vitest Runner                          │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ Test Setup  │  │   Helpers   │  │   Tests     │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ - Start     │  │ - N8nClient │  │ - CRUD      │        │ │
│  │  │   Docker    │  │ - Mailpit   │  │ - Webhooks  │        │ │
│  │  │ - Wait for  │  │   Client    │  │ - Email     │        │ │
│  │  │   ready     │  │ - Utilities │  │ - Errors    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Test Scenario
     │
     ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  1. Create  │────►│ 2. Activate │────►│ 3. Trigger  │
│  Workflow   │     │  Workflow   │     │  Webhook    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 6. Assert   │◄────│ 5. Check    │◄────│ 4. Workflow │
│  Results    │     │  Side Effects│     │  Executes   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ├── Email sent? (Mailpit)
                          ├── Webhook called? (MockServer)
                          └── Data stored? (DB query)
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Test Runner | Vitest | Fast, TypeScript-native testing |
| Container Orchestration | Docker Compose | Manage test services |
| n8n Instance | n8nio/n8n:latest | Real workflow engine |
| Database | PostgreSQL 15 | n8n data persistence |
| Mock Email | Mailpit | Capture and verify emails |
| Language | TypeScript | Type-safe test code |

### Why These Choices

**Vitest over Jest**:
- Faster execution
- Native TypeScript support
- Better ESM handling
- Compatible with Vite ecosystem

**Real n8n over Mocks**:
- Tests actual behavior
- Catches real integration issues
- No mock maintenance burden
- Confidence in production compatibility

**Mailpit over MailHog**:
- Actively maintained
- Better API for testing
- Modern web UI
- Lower resource usage

---

## Docker Compose Setup

### Two Docker Compose Configurations

The project includes **two separate Docker Compose files** for different testing scenarios:

| File | Purpose | Port | Data | Use Case |
|------|---------|------|------|----------|
| `docker-compose.yml` | Manual/interactive testing | 5678 | Persistent volume | Watch Claude create/edit workflows in real-time via n8n UI |
| `docker-compose.test.yml` | Automated E2E tests | 5679 | In-memory (ephemeral) | CI/CD, Vitest runs, fast iteration |

**Both can run simultaneously** (different ports/networks) for debugging scenarios.

---

### Manual Testing Configuration

```yaml
# docker-compose.yml - Persistent n8n for interactive use
# Usage: docker-compose up -d
# Access UI: http://localhost:5678

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-local
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - N8N_BASIC_AUTH_ACTIVE=false
      - DB_TYPE=sqlite
      - DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
      - N8N_PUBLIC_API_DISABLED=false
    volumes:
      - n8n-data:/home/node/.n8n
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

volumes:
  n8n-data:
    name: n8n-local-data
```

---

### Automated Testing Configuration

```yaml
# docker-compose.test.yml - Ephemeral n8n for automated tests
# Usage: docker-compose -f docker-compose.test.yml up -d

services:
  n8n-test:
    image: n8nio/n8n:latest
    container_name: n8n-test-instance
    ports:
      - "5679:5678"  # Different port to avoid conflicts
    environment:
      - N8N_HOST=localhost
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5679/
      - N8N_BASIC_AUTH_ACTIVE=false
      - N8N_USER_MANAGEMENT_DISABLED=true
      - DB_TYPE=sqlite
      - DB_SQLITE_DATABASE=:memory:  # In-memory for speed
      - N8N_PUBLIC_API_DISABLED=false
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_SKIP_OWNER_SETUP=true
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5678/healthz"]
      interval: 5s
      timeout: 5s
      retries: 10
    restart: "no"
    # No volumes - ephemeral by design
```

---

### Full E2E Test Configuration (with PostgreSQL and Mailpit)

```yaml
# tests/e2e/docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-test
    ports:
      - "5678:5678"
    environment:
      # Database
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n

      # API Access
      - N8N_PUBLIC_API_DISABLED=false
      - N8N_PUBLIC_API_ENDPOINT=api

      # Disable auth for testing
      - N8N_BASIC_AUTH_ACTIVE=false
      - N8N_USER_MANAGEMENT_DISABLED=true

      # Email via Mailpit
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=mailpit
      - N8N_SMTP_PORT=1025
      - N8N_SMTP_SENDER=n8n-test@localhost

      # Webhook URL for internal network
      - WEBHOOK_URL=http://n8n:5678

      # Logging
      - N8N_LOG_LEVEL=info

    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:5678/healthz"]
      interval: 5s
      timeout: 10s
      retries: 12
      start_period: 30s
    networks:
      - test-network

  postgres:
    image: postgres:15-alpine
    container_name: postgres-test
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n -d n8n"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - test-network

  mailpit:
    image: axllent/mailpit:latest
    container_name: mailpit-test
    ports:
      - "1025:1025"   # SMTP server
      - "8025:8025"   # Web UI and API
    environment:
      - MP_SMTP_AUTH_ACCEPT_ANY=true
      - MP_SMTP_AUTH_ALLOW_INSECURE=true
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8025/api/v1/info"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - test-network

networks:
  test-network:
    name: n8n-test-network
    driver: bridge

volumes:
  n8n_data:
  postgres_data:
```

### Environment Variables for Tests

```env
# tests/e2e/.env.test
N8N_BASE_URL=http://localhost:5678
N8N_API_URL=http://localhost:5678/api/v1
N8N_WEBHOOK_URL=http://localhost:5678/webhook
MAILPIT_API_URL=http://localhost:8025/api/v1
MAILPIT_SMTP_PORT=1025

# Generated during setup
N8N_API_KEY=
```

---

## Project Structure

```
tests/
├── e2e/
│   ├── docker-compose.yml          # Container definitions
│   ├── .env.test                    # Test environment variables
│   ├── vitest.config.ts             # Vitest E2E configuration
│   ├── globalSetup.ts               # Start containers before tests
│   ├── globalTeardown.ts            # Stop containers after tests
│   │
│   ├── helpers/
│   │   ├── index.ts                 # Export all helpers
│   │   ├── n8n-client.ts            # n8n API wrapper
│   │   ├── mailpit-client.ts        # Mailpit API wrapper
│   │   ├── docker-utils.ts          # Container management
│   │   └── wait-utils.ts            # Health check utilities
│   │
│   ├── fixtures/
│   │   ├── workflows/
│   │   │   ├── simple-webhook.json  # Basic webhook workflow
│   │   │   ├── email-notification.json
│   │   │   └── data-transform.json
│   │   └── test-data/
│   │       ├── form-submission.json
│   │       └── webhook-payloads.json
│   │
│   └── scenarios/
│       ├── workflow-crud.test.ts    # Create, read, update, delete
│       ├── workflow-execution.test.ts
│       ├── workflow-webhook.test.ts
│       ├── workflow-email.test.ts
│       ├── workflow-errors.test.ts
│       └── skill-integration.test.ts
│
├── unit/
│   ├── vitest.config.ts             # Unit test config
│   └── helpers/
│       └── json-validation.test.ts  # Workflow JSON validation
│
└── vitest.workspace.ts              # Workspace configuration
```

---

## Test Helpers

### N8n Client

```typescript
// tests/e2e/helpers/n8n-client.ts
import axios, { AxiosInstance } from 'axios'

export interface Workflow {
  id?: string
  name: string
  nodes: Node[]
  connections: Connections
  settings?: WorkflowSettings
  active?: boolean
}

export interface Node {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: Record<string, unknown>
  credentials?: Record<string, { id: string; name: string }>
}

export interface Connections {
  [sourceNode: string]: {
    main: Array<Array<{ node: string; type: string; index: number }>>
  }
}

export interface Execution {
  id: string
  finished: boolean
  mode: string
  status: 'success' | 'error' | 'waiting' | 'running'
  data?: {
    resultData?: {
      error?: { message: string }
    }
  }
}

export class N8nTestClient {
  private client: AxiosInstance
  private createdWorkflowIds: string[] = []

  constructor(
    private baseUrl: string = process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
    private apiKey?: string
  ) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey })
      }
    })
  }

  // API Key Management
  async createApiKey(label: string = 'test-key'): Promise<string> {
    // Note: API key creation may require owner setup first
    // For testing, we may need to use environment variable or setup script
    const response = await this.client.post('/api-keys', { label })
    return response.data.apiKey
  }

  // Workflow Operations
  async createWorkflow(workflow: Workflow): Promise<Workflow> {
    const response = await this.client.post('/workflows', workflow)
    const created = response.data
    this.createdWorkflowIds.push(created.id)
    return created
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.get(`/workflows/${id}`)
    return response.data
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await this.client.put(`/workflows/${id}`, workflow)
    return response.data
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.client.delete(`/workflows/${id}`)
    this.createdWorkflowIds = this.createdWorkflowIds.filter(wid => wid !== id)
  }

  async listWorkflows(): Promise<Workflow[]> {
    const response = await this.client.get('/workflows')
    return response.data.data
  }

  async activateWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.post(`/workflows/${id}/activate`)
    return response.data
  }

  async deactivateWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.post(`/workflows/${id}/deactivate`)
    return response.data
  }

  // Execution Operations
  async getExecutions(workflowId?: string): Promise<Execution[]> {
    const params = workflowId ? { workflowId } : {}
    const response = await this.client.get('/executions', { params })
    return response.data.data
  }

  async getExecution(id: string): Promise<Execution> {
    const response = await this.client.get(`/executions/${id}`)
    return response.data
  }

  async waitForExecution(
    workflowId: string,
    options: { timeout?: number; pollInterval?: number } = {}
  ): Promise<Execution> {
    const { timeout = 10000, pollInterval = 500 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const executions = await this.getExecutions(workflowId)
      const latest = executions[0]

      if (latest && latest.finished) {
        return latest
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Timeout waiting for execution of workflow ${workflowId}`)
  }

  // Webhook Triggering
  async triggerWebhook(
    path: string,
    data: Record<string, unknown>,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<unknown> {
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'
    const url = `${webhookUrl}/${path}`

    if (method === 'GET') {
      const response = await axios.get(url, { params: data })
      return response.data
    } else {
      const response = await axios.post(url, data)
      return response.data
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    for (const id of this.createdWorkflowIds) {
      try {
        // Deactivate first if active
        try {
          await this.deactivateWorkflow(id)
        } catch {
          // Ignore if already inactive
        }
        await this.deleteWorkflow(id)
      } catch (error) {
        console.warn(`Failed to cleanup workflow ${id}:`, error)
      }
    }
    this.createdWorkflowIds = []
  }

  // Health Check
  async isHealthy(): Promise<boolean> {
    try {
      await this.client.get('/workflows?limit=1')
      return true
    } catch {
      return false
    }
  }
}
```

### Mailpit Client

```typescript
// tests/e2e/helpers/mailpit-client.ts
import axios, { AxiosInstance } from 'axios'

export interface EmailMessage {
  ID: string
  MessageID: string
  From: { Name: string; Address: string }
  To: Array<{ Name: string; Address: string }>
  Subject: string
  Date: string
  Text: string
  HTML: string
  Attachments?: Array<{
    FileName: string
    ContentType: string
    Size: number
  }>
}

export interface MessageList {
  messages: EmailMessage[]
  total: number
}

export class MailpitClient {
  private client: AxiosInstance

  constructor(
    private baseUrl: string = process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1'
  ) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Get all messages
  async getMessages(): Promise<EmailMessage[]> {
    const response = await this.client.get('/messages')
    return response.data.messages || []
  }

  // Get single message by ID
  async getMessage(id: string): Promise<EmailMessage> {
    const response = await this.client.get(`/message/${id}`)
    return response.data
  }

  // Search messages
  async searchMessages(query: string): Promise<EmailMessage[]> {
    const response = await this.client.get('/search', {
      params: { query }
    })
    return response.data.messages || []
  }

  // Wait for message to arrive
  async waitForMessage(
    options: {
      to?: string
      subject?: string
      timeout?: number
      pollInterval?: number
    } = {}
  ): Promise<EmailMessage> {
    const { to, subject, timeout = 10000, pollInterval = 500 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const messages = await this.getMessages()

      const match = messages.find(msg => {
        const toMatch = !to || msg.To.some(t => t.Address.includes(to))
        const subjectMatch = !subject || msg.Subject.includes(subject)
        return toMatch && subjectMatch
      })

      if (match) {
        return match
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Timeout waiting for email (to: ${to}, subject: ${subject})`)
  }

  // Wait for specific number of messages
  async waitForMessageCount(
    count: number,
    options: { timeout?: number; pollInterval?: number } = {}
  ): Promise<EmailMessage[]> {
    const { timeout = 10000, pollInterval = 500 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const messages = await this.getMessages()

      if (messages.length >= count) {
        return messages.slice(0, count)
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Timeout waiting for ${count} emails`)
  }

  // Delete all messages
  async clearMessages(): Promise<void> {
    await this.client.delete('/messages')
  }

  // Delete single message
  async deleteMessage(id: string): Promise<void> {
    await this.client.delete(`/messages/${id}`)
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.get('/info')
      return response.status === 200
    } catch {
      return false
    }
  }
}
```

### Docker Utilities

```typescript
// tests/e2e/helpers/docker-utils.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface DockerComposeOptions {
  file?: string
  projectName?: string
  workDir?: string
}

export class DockerComposeManager {
  private composeFile: string
  private projectName: string
  private workDir: string

  constructor(options: DockerComposeOptions = {}) {
    this.composeFile = options.file || 'docker-compose.yml'
    this.projectName = options.projectName || 'n8n-test'
    this.workDir = options.workDir || process.cwd()
  }

  private async exec(command: string): Promise<string> {
    const { stdout } = await execAsync(command, { cwd: this.workDir })
    return stdout.trim()
  }

  private getBaseCommand(): string {
    return `docker compose -f ${this.composeFile} -p ${this.projectName}`
  }

  async up(): Promise<void> {
    console.log('Starting Docker containers...')
    await this.exec(`${this.getBaseCommand()} up -d --wait`)
    console.log('Docker containers started')
  }

  async down(removeVolumes = true): Promise<void> {
    console.log('Stopping Docker containers...')
    const volumeFlag = removeVolumes ? '-v' : ''
    await this.exec(`${this.getBaseCommand()} down ${volumeFlag}`)
    console.log('Docker containers stopped')
  }

  async logs(service?: string): Promise<string> {
    const serviceArg = service || ''
    return this.exec(`${this.getBaseCommand()} logs ${serviceArg}`)
  }

  async isRunning(): Promise<boolean> {
    try {
      const result = await this.exec(`${this.getBaseCommand()} ps --status=running -q`)
      return result.length > 0
    } catch {
      return false
    }
  }

  async restart(service?: string): Promise<void> {
    const serviceArg = service || ''
    await this.exec(`${this.getBaseCommand()} restart ${serviceArg}`)
  }
}
```

### Wait Utilities

```typescript
// tests/e2e/helpers/wait-utils.ts
import { N8nTestClient } from './n8n-client'
import { MailpitClient } from './mailpit-client'

export interface WaitOptions {
  timeout?: number
  pollInterval?: number
  onRetry?: (attempt: number) => void
}

export async function waitForN8n(
  client: N8nTestClient,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 60000, pollInterval = 1000, onRetry } = options
  const startTime = Date.now()
  let attempt = 0

  while (Date.now() - startTime < timeout) {
    attempt++
    if (onRetry) onRetry(attempt)

    if (await client.isHealthy()) {
      console.log(`n8n is ready after ${attempt} attempts`)
      return
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  throw new Error(`n8n did not become healthy within ${timeout}ms`)
}

export async function waitForMailpit(
  client: MailpitClient,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 30000, pollInterval = 1000, onRetry } = options
  const startTime = Date.now()
  let attempt = 0

  while (Date.now() - startTime < timeout) {
    attempt++
    if (onRetry) onRetry(attempt)

    if (await client.isHealthy()) {
      console.log(`Mailpit is ready after ${attempt} attempts`)
      return
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  throw new Error(`Mailpit did not become healthy within ${timeout}ms`)
}

export async function waitForAllServices(
  n8nClient: N8nTestClient,
  mailpitClient: MailpitClient,
  options: WaitOptions = {}
): Promise<void> {
  console.log('Waiting for all services to be ready...')

  await Promise.all([
    waitForN8n(n8nClient, options),
    waitForMailpit(mailpitClient, options)
  ])

  console.log('All services are ready!')
}
```

### Helper Index

```typescript
// tests/e2e/helpers/index.ts
export { N8nTestClient } from './n8n-client'
export type { Workflow, Node, Connections, Execution } from './n8n-client'

export { MailpitClient } from './mailpit-client'
export type { EmailMessage, MessageList } from './mailpit-client'

export { DockerComposeManager } from './docker-utils'
export type { DockerComposeOptions } from './docker-utils'

export { waitForN8n, waitForMailpit, waitForAllServices } from './wait-utils'
export type { WaitOptions } from './wait-utils'
```

---

## Test Scenarios

### Workflow CRUD Tests

```typescript
// tests/e2e/scenarios/workflow-crud.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { N8nTestClient, Workflow } from '../helpers'

describe('Workflow CRUD Operations', () => {
  let n8n: N8nTestClient

  beforeAll(() => {
    n8n = new N8nTestClient()
  })

  afterAll(async () => {
    await n8n.cleanup()
  })

  describe('Create Workflow', () => {
    it('creates a simple workflow', async () => {
      const workflow: Workflow = {
        name: 'Test Workflow',
        nodes: [
          {
            id: 'start',
            name: 'Start',
            type: 'n8n-nodes-base.manualTrigger',
            typeVersion: 1,
            position: [100, 100],
            parameters: {}
          }
        ],
        connections: {}
      }

      const created = await n8n.createWorkflow(workflow)

      expect(created.id).toBeDefined()
      expect(created.name).toBe('Test Workflow')
      expect(created.nodes).toHaveLength(1)
      expect(created.active).toBe(false)
    })

    it('creates workflow with multiple nodes and connections', async () => {
      const workflow: Workflow = {
        name: 'Multi-Node Workflow',
        nodes: [
          {
            id: 'trigger',
            name: 'Manual Trigger',
            type: 'n8n-nodes-base.manualTrigger',
            typeVersion: 1,
            position: [100, 100],
            parameters: {}
          },
          {
            id: 'set',
            name: 'Set Data',
            type: 'n8n-nodes-base.set',
            typeVersion: 1,
            position: [300, 100],
            parameters: {
              values: {
                string: [{ name: 'message', value: 'Hello Test' }]
              }
            }
          }
        ],
        connections: {
          'Manual Trigger': {
            main: [[{ node: 'Set Data', type: 'main', index: 0 }]]
          }
        }
      }

      const created = await n8n.createWorkflow(workflow)

      expect(created.nodes).toHaveLength(2)
      expect(created.connections).toHaveProperty('Manual Trigger')
    })
  })

  describe('Read Workflow', () => {
    it('retrieves workflow by ID', async () => {
      const workflow = await n8n.createWorkflow({
        name: 'Read Test Workflow',
        nodes: [{
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [100, 100],
          parameters: {}
        }],
        connections: {}
      })

      const retrieved = await n8n.getWorkflow(workflow.id!)

      expect(retrieved.id).toBe(workflow.id)
      expect(retrieved.name).toBe('Read Test Workflow')
    })

    it('lists all workflows', async () => {
      await n8n.createWorkflow({
        name: 'List Test 1',
        nodes: [{
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [100, 100],
          parameters: {}
        }],
        connections: {}
      })

      const workflows = await n8n.listWorkflows()

      expect(workflows.length).toBeGreaterThan(0)
      expect(workflows.some(w => w.name === 'List Test 1')).toBe(true)
    })
  })

  describe('Update Workflow', () => {
    it('updates workflow name', async () => {
      const workflow = await n8n.createWorkflow({
        name: 'Original Name',
        nodes: [{
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [100, 100],
          parameters: {}
        }],
        connections: {}
      })

      const updated = await n8n.updateWorkflow(workflow.id!, {
        name: 'Updated Name'
      })

      expect(updated.name).toBe('Updated Name')
    })
  })

  describe('Delete Workflow', () => {
    it('deletes workflow', async () => {
      const workflow = await n8n.createWorkflow({
        name: 'To Be Deleted',
        nodes: [{
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [100, 100],
          parameters: {}
        }],
        connections: {}
      })

      await n8n.deleteWorkflow(workflow.id!)

      await expect(n8n.getWorkflow(workflow.id!)).rejects.toThrow()
    })
  })

  describe('Activate/Deactivate Workflow', () => {
    it('activates and deactivates workflow', async () => {
      const workflow = await n8n.createWorkflow({
        name: 'Activation Test',
        nodes: [{
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'test-activation',
            httpMethod: 'POST'
          }
        }],
        connections: {}
      })

      // Activate
      const activated = await n8n.activateWorkflow(workflow.id!)
      expect(activated.active).toBe(true)

      // Deactivate
      const deactivated = await n8n.deactivateWorkflow(workflow.id!)
      expect(deactivated.active).toBe(false)
    })
  })
})
```

### Webhook Tests

```typescript
// tests/e2e/scenarios/workflow-webhook.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { N8nTestClient, Workflow } from '../helpers'

describe('Webhook Workflows', () => {
  let n8n: N8nTestClient

  beforeAll(() => {
    n8n = new N8nTestClient()
  })

  afterAll(async () => {
    await n8n.cleanup()
  })

  it('executes workflow on webhook trigger', async () => {
    // Create webhook workflow
    const workflow = await n8n.createWorkflow({
      name: 'Webhook Test',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'test-webhook-exec',
            httpMethod: 'POST',
            responseMode: 'onReceived'
          }
        },
        {
          id: 'respond',
          name: 'Respond',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [300, 100],
          parameters: {
            respondWith: 'json',
            responseBody: '={{ { "received": $json } }}'
          }
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'Respond', type: 'main', index: 0 }]]
        }
      }
    })

    // Activate workflow
    await n8n.activateWorkflow(workflow.id!)

    // Trigger webhook
    const response = await n8n.triggerWebhook('test-webhook-exec', {
      message: 'Hello from test'
    })

    // Verify response
    expect(response).toHaveProperty('received')
    expect((response as any).received.message).toBe('Hello from test')

    // Verify execution recorded
    const execution = await n8n.waitForExecution(workflow.id!)
    expect(execution.status).toBe('success')
  })

  it('handles webhook with query parameters', async () => {
    const workflow = await n8n.createWorkflow({
      name: 'Query Param Test',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'test-query-params',
            httpMethod: 'GET',
            responseMode: 'onReceived'
          }
        }
      ],
      connections: {}
    })

    await n8n.activateWorkflow(workflow.id!)

    const response = await n8n.triggerWebhook(
      'test-query-params',
      { foo: 'bar', count: '42' },
      'GET'
    )

    expect(response).toBeDefined()
  })
})
```

### Email Tests

```typescript
// tests/e2e/scenarios/workflow-email.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { N8nTestClient, MailpitClient } from '../helpers'

describe('Email Workflows', () => {
  let n8n: N8nTestClient
  let mailpit: MailpitClient

  beforeAll(() => {
    n8n = new N8nTestClient()
    mailpit = new MailpitClient()
  })

  beforeEach(async () => {
    await mailpit.clearMessages()
  })

  afterAll(async () => {
    await n8n.cleanup()
  })

  it('sends email when workflow executes', async () => {
    // Create workflow with email node
    const workflow = await n8n.createWorkflow({
      name: 'Email Test',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'test-email',
            httpMethod: 'POST',
            responseMode: 'onReceived'
          }
        },
        {
          id: 'email',
          name: 'Send Email',
          type: 'n8n-nodes-base.emailSend',
          typeVersion: 2,
          position: [300, 100],
          parameters: {
            fromEmail: 'test@localhost',
            toEmail: 'recipient@test.com',
            subject: 'Test Email from n8n',
            text: '={{ "Hello " + $json.name }}'
          }
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'Send Email', type: 'main', index: 0 }]]
        }
      }
    })

    await n8n.activateWorkflow(workflow.id!)

    // Trigger workflow
    await n8n.triggerWebhook('test-email', { name: 'Test User' })

    // Wait for and verify email
    const email = await mailpit.waitForMessage({
      to: 'recipient@test.com',
      subject: 'Test Email'
    })

    expect(email.Subject).toContain('Test Email from n8n')
    expect(email.Text).toContain('Hello Test User')
  })

  it('sends email with HTML content', async () => {
    const workflow = await n8n.createWorkflow({
      name: 'HTML Email Test',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'test-html-email',
            httpMethod: 'POST'
          }
        },
        {
          id: 'email',
          name: 'Send Email',
          type: 'n8n-nodes-base.emailSend',
          typeVersion: 2,
          position: [300, 100],
          parameters: {
            fromEmail: 'test@localhost',
            toEmail: 'html-test@test.com',
            subject: 'HTML Test',
            html: '<h1>Hello {{ $json.name }}</h1>'
          }
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'Send Email', type: 'main', index: 0 }]]
        }
      }
    })

    await n8n.activateWorkflow(workflow.id!)
    await n8n.triggerWebhook('test-html-email', { name: 'HTML User' })

    const email = await mailpit.waitForMessage({ to: 'html-test@test.com' })

    expect(email.HTML).toContain('<h1>')
    expect(email.HTML).toContain('HTML User')
  })
})
```

### Error Handling Tests

```typescript
// tests/e2e/scenarios/workflow-errors.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { N8nTestClient } from '../helpers'

describe('Error Handling', () => {
  let n8n: N8nTestClient

  beforeAll(() => {
    n8n = new N8nTestClient()
  })

  afterAll(async () => {
    await n8n.cleanup()
  })

  it('records failed execution', async () => {
    // Create workflow that will fail
    const workflow = await n8n.createWorkflow({
      name: 'Failing Workflow',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'test-fail',
            httpMethod: 'POST'
          }
        },
        {
          id: 'http',
          name: 'HTTP Request',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [300, 100],
          parameters: {
            url: 'http://non-existent-url-that-will-fail.invalid',
            method: 'GET'
          }
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]]
        }
      }
    })

    await n8n.activateWorkflow(workflow.id!)

    // Trigger and expect failure
    try {
      await n8n.triggerWebhook('test-fail', {})
    } catch {
      // Expected to fail
    }

    // Give time for execution to be recorded
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check execution status
    const executions = await n8n.getExecutions(workflow.id!)
    const failedExecution = executions.find(e => e.status === 'error')

    expect(failedExecution).toBeDefined()
  })

  it('rejects invalid workflow JSON', async () => {
    await expect(
      n8n.createWorkflow({
        name: 'Invalid Workflow',
        nodes: [], // Empty nodes - might be invalid
        connections: {
          'NonExistent': { // Connection to non-existent node
            main: [[{ node: 'Also NonExistent', type: 'main', index: 0 }]]
          }
        }
      })
    ).rejects.toThrow()
  })
})
```

---

## Running Tests

### Vitest Configuration

```typescript
// tests/e2e/vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['scenarios/**/*.test.ts'],
    setupFiles: ['./setup.ts'],
    globalSetup: ['./globalSetup.ts'],
    testTimeout: 60000, // Longer timeout for E2E
    hookTimeout: 120000, // Longer timeout for setup/teardown
    pool: 'forks', // Isolate tests
    poolOptions: {
      forks: {
        singleFork: true // Run sequentially to avoid conflicts
      }
    }
  },
  resolve: {
    alias: {
      '@helpers': path.resolve(__dirname, './helpers')
    }
  }
})
```

### Global Setup

```typescript
// tests/e2e/globalSetup.ts
import { DockerComposeManager, N8nTestClient, MailpitClient, waitForAllServices } from './helpers'
import path from 'path'

export default async function globalSetup() {
  console.log('\n🚀 Starting E2E test environment...\n')

  const docker = new DockerComposeManager({
    file: 'docker-compose.yml',
    workDir: path.resolve(__dirname),
    projectName: 'n8n-e2e-test'
  })

  // Start containers
  await docker.up()

  // Wait for services to be ready
  const n8nClient = new N8nTestClient()
  const mailpitClient = new MailpitClient()

  await waitForAllServices(n8nClient, mailpitClient, {
    timeout: 90000,
    onRetry: (attempt) => {
      if (attempt % 5 === 0) {
        console.log(`  Still waiting for services... (attempt ${attempt})`)
      }
    }
  })

  console.log('\n✅ E2E test environment ready!\n')

  // Return teardown function
  return async () => {
    console.log('\n🧹 Cleaning up E2E test environment...\n')
    await docker.down(true)
    console.log('✅ Cleanup complete!\n')
  }
}
```

### Setup File

```typescript
// tests/e2e/setup.ts
import { beforeAll, afterAll } from 'vitest'
import { N8nTestClient, MailpitClient } from './helpers'

// Make clients available globally
declare global {
  var n8nClient: N8nTestClient
  var mailpitClient: MailpitClient
}

beforeAll(() => {
  globalThis.n8nClient = new N8nTestClient()
  globalThis.mailpitClient = new MailpitClient()
})

afterAll(async () => {
  // Global cleanup if needed
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --config tests/unit/vitest.config.ts",
    "test:e2e": "vitest run --config tests/e2e/vitest.config.ts",
    "test:e2e:watch": "vitest --config tests/e2e/vitest.config.ts",
    "test:e2e:ui": "vitest --config tests/e2e/vitest.config.ts --ui",
    "docker:up": "docker compose -f tests/e2e/docker-compose.yml up -d",
    "docker:down": "docker compose -f tests/e2e/docker-compose.yml down -v",
    "docker:logs": "docker compose -f tests/e2e/docker-compose.yml logs -f"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "axios": "^1.6.0",
    "typescript": "^5.3.0"
  }
}
```

### Running Commands

```bash
# Run all E2E tests (starts/stops Docker automatically)
npm run test:e2e

# Watch mode for development
npm run test:e2e:watch

# Visual UI for debugging
npm run test:e2e:ui

# Manual Docker control
npm run docker:up      # Start containers
npm run docker:logs    # View logs
npm run docker:down    # Stop and cleanup
```

---

## Future Expansion

### Additional Mock Services

```yaml
# Add to docker-compose.yml as needed

services:
  # ... existing services ...

  # Mock webhook receiver (catch outgoing webhooks from n8n)
  mockserver:
    image: mockserver/mockserver:latest
    container_name: mockserver-test
    ports:
      - "1080:1080"
    environment:
      - MOCKSERVER_LOG_LEVEL=WARN
    networks:
      - test-network

  # Mock S3/MinIO for file storage tests
  minio:
    image: minio/minio:latest
    container_name: minio-test
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    networks:
      - test-network

  # Redis for queue mode testing
  redis:
    image: redis:7-alpine
    container_name: redis-test
    ports:
      - "6379:6379"
    networks:
      - test-network

  # Mock OAuth provider
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak-test
    ports:
      - "8080:8080"
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    command: start-dev
    networks:
      - test-network
```

### Future Test Helpers

```typescript
// tests/e2e/helpers/mockserver-client.ts
export class MockServerClient {
  // Capture and verify outgoing HTTP requests from n8n
  async expectRequest(path: string, method: string): Promise<void>
  async getRecordedRequests(): Promise<Request[]>
  async reset(): Promise<void>
}

// tests/e2e/helpers/minio-client.ts
export class MinioTestClient {
  // Verify files stored by n8n
  async listObjects(bucket: string): Promise<string[]>
  async getObject(bucket: string, key: string): Promise<Buffer>
  async cleanup(): Promise<void>
}
```

### Planned Test Categories

| Category | Description | Services Needed |
|----------|-------------|-----------------|
| Webhook Outgoing | Verify n8n calls external webhooks | MockServer |
| File Storage | Test file upload/download workflows | MinIO |
| Queue Processing | Test high-volume execution | Redis |
| OAuth Flows | Test credential refresh | Keycloak |
| Rate Limiting | Test retry behavior | MockServer |
| Long-running | Test timeout handling | Base setup |

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run E2E tests
        run: npm run test:e2e
        timeout-minutes: 15

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-results
          path: |
            tests/e2e/results/
            tests/e2e/*.log
```

### Test Result Reporting

```typescript
// tests/e2e/vitest.config.ts (extended)
export default defineConfig({
  test: {
    // ... existing config ...
    reporters: ['default', 'json', 'html'],
    outputFile: {
      json: './results/test-results.json',
      html: './results/test-results.html'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './results/coverage'
    }
  }
})
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Containers don't start | Port conflicts | Check for existing containers on ports 5678, 8025 |
| n8n not healthy | Slow startup | Increase timeout in globalSetup |
| Tests timeout | Network issues | Check Docker network connectivity |
| Email not received | Mailpit config | Verify SMTP settings in n8n |
| Webhook fails | URL mismatch | Ensure WEBHOOK_URL matches container network |

### Debug Commands

```bash
# Check container status
docker compose -f tests/e2e/docker-compose.yml ps

# View n8n logs
docker compose -f tests/e2e/docker-compose.yml logs n8n

# Access n8n directly
open http://localhost:5678

# Access Mailpit UI
open http://localhost:8025

# Execute command in container
docker compose -f tests/e2e/docker-compose.yml exec n8n sh
```

---

## Sources

- [Vitest Documentation](https://vitest.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [n8n Docker Setup](https://docs.n8n.io/hosting/installation/docker/)
- [Mailpit Documentation](https://github.com/axllent/mailpit)
- [n8n API Reference](https://docs.n8n.io/api/)

---

*Document compiled for n8n Workflow Assistant project - December 2025*
