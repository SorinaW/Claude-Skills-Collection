# n8n Workflows Collection

## Overview

This document catalogs GitHub repositories and resources containing n8n workflow templates. These collections serve as inspiration for common automation patterns and reusable workflow designs for the n8n Workflow Assistant project.

---

## Table of Contents

1. [Large Workflow Collections](#large-workflow-collections)
2. [Curated Template Repositories](#curated-template-repositories)
3. [Specialized Collections](#specialized-collections)
4. [Official Resources](#official-resources)
5. [Community Node Ecosystem](#community-node-ecosystem)
6. [Common Workflow Patterns](#common-workflow-patterns)
7. [Popular Workflow Categories](#popular-workflow-categories)
8. [Implementation Insights](#implementation-insights)

---

## Large Workflow Collections

### 1. Danitilahun/n8n-workflow-templates

**URL**: https://github.com/Danitilahun/n8n-workflow-templates

**Statistics**:
- **Total Workflows**: 2,053
- **Unique Integrations**: 365 services
- **Total Nodes**: 29,445 (avg 14.3 per workflow)
- **Active Workflows**: 215 (10.5%)

**Workflow Distribution by Trigger**:
| Trigger Type | Count | Percentage |
|--------------|-------|------------|
| Complex | 831 | 40.5% |
| Webhook | 519 | 25.3% |
| Manual | 477 | 23.2% |
| Scheduled | 226 | 11.0% |

**Complexity Breakdown**:
- Low (≤5 nodes): ~35%
- Medium (6-15 nodes): ~45%
- High (16+ nodes): ~20%

**Features**:
- FastAPI backend with SQLite FTS5 search
- Sub-100ms response times
- Mobile-responsive documentation
- Mermaid diagram generation
- 12 service categories

**Most Used Integrations**: Telegram, Discord, Slack, Google Drive, PostgreSQL, OpenAI, Anthropic

---

### 2. Zie619/n8n-workflows

**URL**: https://github.com/Zie619/n8n-workflows

**Statistics**:
- **Total Workflows**: 4,343
- **Unique Integrations**: 365
- **Categories**: 15+

**Features**:
- FastAPI server for search
- SQLite FTS5 indexing
- Workflows from n8n.io and community

**Use Case**: Largest single collection for pattern analysis

---

### 3. bheidepriem/n8n-workflows-1000-templates

**URL**: https://github.com/bheidepriem/n8n-workflows-1000-templates

**Content**: Collection of workflows from:
- n8n.io website exports
- Community forum shares
- Publicly shared examples

**Use Case**: Diverse real-world workflow examples

---

### 4. Sayerxofficial/n8n

**URL**: https://github.com/Sayerxofficial/n8n

**Statistics**: 2,000+ templates

**Coverage**: Various domains and applications

---

## Curated Template Repositories

### 5. enescingoz/awesome-n8n-templates ⭐

**URL**: https://github.com/enescingoz/awesome-n8n-templates

**Statistics**:
- **Stars**: 16.7k
- **Forks**: 4.9k
- **Contributors**: 11

**Organization** (24 folders):
| Category | Description |
|----------|-------------|
| Gmail/Email | Email automation |
| Telegram | Telegram bot workflows |
| WhatsApp | WhatsApp Business automation |
| Discord | Discord bot integration |
| Slack | Slack automation |
| WordPress | CMS automation |
| Instagram/Twitter | Social media |
| Google Drive/Sheets | Document & data |
| Airtable | Database automation |
| Notion | Workspace automation |
| OpenAI/LLMs | AI integrations |
| DevOps | CI/CD automation |
| HR & Recruitment | HR workflows |

**Note**: Templates sourced from community, not original creations.

**Use Case**: Well-organized starting point for common integrations

---

### 6. wassupjay/n8n-free-templates ⭐

**URL**: https://github.com/wassupjay/n8n-free-templates

**Statistics**:
- **Stars**: 5.1k
- **Forks**: 1.4k
- **Workflows**: 200+

**Organization** (25+ categories):
```
AI_ML/
Data_Analytics/
DevOps/
Finance_Accounting/
Healthcare/
E_Commerce_Retail/
HR/
Creative_Content/
IoT/
Legal_Tech/
Manufacturing/
Media/
Real_Estate/
Social_Media/
Gaming/
Travel/
Agriculture/
Automotive/
Education/
Energy/
Government_NGO/
Productivity/
Misc/
```

**AI Stack**:
| Component | Options |
|-----------|---------|
| Vector Stores | Pinecone, Weaviate, Supabase Vector, Redis |
| Embeddings | OpenAI, Cohere, Hugging Face |
| LLMs | GPT-4, Claude 3, Hugging Face |
| Memory | Zep Memory, Window Buffer |

**Features**:
- Pre-built RAG stacks
- Error handling included
- Guard-rails built in
- Production-ready

**Use Case**: Modern AI-powered automation templates

---

### 7. creativetimofficial/ct-n8n-templates

**URL**: https://github.com/creativetimofficial/ct-n8n-templates

**Content**: Ready-to-use workflow templates organized by:
- Integration type
- Use case

**Use Case**: Business automation scenarios

---

## Specialized Collections

### 8. simealdana/ai-automation-jsons

**URL**: https://github.com/simealdana/ai-automation-jsons

**Statistics**:
- **Stars**: 29
- **Forks**: 13
- **License**: MIT

**Workflows**:
| Workflow | Description |
|----------|-------------|
| `ai-voice-agent.json` | Voice processing with OpenAI + Pinecone |
| `ai-voice-agent-vapi.json` | Enhanced voice agent with VAPI |
| `lead-qualification-generation.json` | Automated lead scoring |
| `email-sender-tool.json` | Email automation |
| `calendar-mcp.json` | Calendar integration |
| `reddit-mcp.json` | Reddit data integration |

**Required Credentials**:
- OpenAI API
- Google Sheets OAuth2
- Pinecone API

**Use Case**: AI voice agents and lead qualification patterns

---

### 9. RooobinTheRobotWrangler/n8n-codex-library

**URL**: https://github.com/RooobinTheRobotWrangler/n8n-codex-library

**Purpose**: Reference library for AI/LLM development with n8n

**Structure**:
```
docs/       - Conceptual guides
nodes/      - Node specifications
prompts/    - LLM prompt templates
templates/  - JSON workflow examples
schema/     - Data structure definitions
```

**Use Case**: AI-assisted n8n development and workflow generation

---

### 10. workflowsdiy/n8n-workflows

**URL**: https://github.com/workflowsdiy/n8n-workflows

**Focus**: AI-driven tasks, agentic systems, and practical integrations

**Use Case**: Advanced AI automation patterns

---

### 11. LudwigGerdes/workflow-templates

**URL**: https://github.com/LudwigGerdes/workflow-templates

**Content**: Regularly updated workflow templates

**Use Case**: Fresh automation examples

---

## Official Resources

### n8n.io Workflow Library

**URL**: https://n8n.io/workflows/

**Statistics**:
- **Total Workflows**: 7,336+
- **AI Workflows**: 4,841+
- **Document Ops**: 769+
- **IT Ops**: 874+

**Categories**:
| Category | Sub-categories |
|----------|----------------|
| AI | Chatbot, RAG, Summarization |
| Sales | CRM, Lead Generation |
| Marketing | Content Creation, Social |
| IT Ops | Incident Response, Monitoring |
| Support | Ticket Management |
| Document Ops | PDF, Data Extraction |

**Popular Integrations**:
- Google Sheets
- OpenAI
- Telegram
- Gmail
- MySQL/Postgres
- Discord
- Slack
- Notion

**Features**:
- Creator Program for verified templates
- Search by integration combinations
- Trending templates highlighted

---

## Community Node Ecosystem

### restyler/awesome-n8n

**URL**: https://github.com/restyler/awesome-n8n

**Statistics**:
- **Stars**: 2.5k
- **Forks**: 311
- **Total Nodes**: 4,665 indexed
- **Growth**: ~17 new nodes/day

**Top Node Categories**:

| Category | Top Nodes | Downloads |
|----------|-----------|-----------|
| Communication | Evolution API (WhatsApp) | 7.7M/month |
| Documents | PDFKit, ZapSign | High |
| Web Scraping | SerpApi, Firecrawl, Playwright | High |
| Data Processing | Cronlytic, OCR | High |
| AI/LLM | MCP nodes, ElevenLabs, DeepSeek | 950k/month |

**Use Case**: Finding community nodes to extend workflows

---

## Common Workflow Patterns

### Pattern 1: CRM Sync
```
Trigger (Schedule/Webhook)
  → Fetch from CRM (Salesforce, HubSpot)
  → Transform Data
  → Update Spreadsheet (Google Sheets)
  → Notify (Slack/Email)
```
**Complexity**: Advanced
**Challenges**: OAuth, rate limits, field mapping

---

### Pattern 2: Lead Nurturing
```
Trigger (Form Submission/CRM Update)
  → Score Lead
  → IF (Score > Threshold)
    → Add to Campaign
    → Send Personalized Email
  → Update CRM Status
```
**Complexity**: Advanced
**Challenges**: Multi-channel coordination, trigger timing

---

### Pattern 3: Content Generation
```
Trigger (Schedule/Manual)
  → Fetch Topics (Google Sheets)
  → Generate Content (OpenAI/Claude)
  → Generate Images (DALL-E/Replicate)
  → Publish (WordPress/Social)
  → Log Results
```
**Complexity**: Advanced
**Challenges**: Prompt engineering, cost management

---

### Pattern 4: Social Media Automation
```
Trigger (Schedule)
  → Fetch Content Queue
  → Format for Platform
  → Post (Twitter/LinkedIn/Instagram)
  → Update Status
  → Monitor Engagement
```
**Complexity**: Intermediate
**Challenges**: Platform API changes, rate limits

---

### Pattern 5: Incident Response
```
Trigger (Webhook from Monitoring)
  → Parse Alert
  → Deduplicate
  → Create Ticket (Jira/Linear)
  → Notify Team (Slack/PagerDuty)
  → Update Status Dashboard
```
**Complexity**: Intermediate
**Challenges**: Alert fatigue, deduplication logic

---

### Pattern 6: Document Processing
```
Trigger (File Upload/Email)
  → Extract (OCR/AI)
  → Transform Data
  → Validate
  → Store (Database/Cloud)
  → Notify Completion
```
**Complexity**: Intermediate
**Challenges**: OCR reliability, varied formats

---

### Pattern 7: E-commerce Order Flow
```
Trigger (Order Webhook)
  → Validate Order
  → Check Inventory
  → Process Payment
  → Update Fulfillment System
  → Send Confirmation Email
  → Update Analytics
```
**Complexity**: Advanced
**Challenges**: Race conditions, transaction rollbacks

---

### Pattern 8: AI RAG Chatbot
```
Trigger (Webhook/Chat Message)
  → Embed Query (OpenAI)
  → Search Vector Store (Pinecone)
  → Retrieve Context
  → Generate Response (LLM)
  → Return Response
  → Log Conversation
```
**Complexity**: Advanced
**Challenges**: Context quality, response latency

---

## Popular Workflow Categories

### By Use Case (2025 Trends)

| Category | Example Workflows | Popularity |
|----------|-------------------|------------|
| **AI Content** | Blog generation, SEO articles | Very High |
| **WhatsApp** | Business automation, chatbots | Very High |
| **CRM Sync** | Salesforce/HubSpot to sheets | High |
| **Lead Qualification** | Scoring, enrichment | High |
| **Social Media** | Multi-platform posting | High |
| **Document Ops** | PDF extraction, OCR | High |
| **Email Automation** | Parsing, campaigns | High |
| **IT Ops** | Incident response, monitoring | Medium |
| **E-commerce** | Order processing, inventory | Medium |

### By Integration

| Integration | Workflow Count (approx) |
|-------------|------------------------|
| Google Sheets | 1,000+ |
| OpenAI | 800+ |
| Telegram | 600+ |
| Slack | 500+ |
| Gmail | 500+ |
| Discord | 400+ |
| PostgreSQL | 300+ |
| Notion | 300+ |
| Airtable | 250+ |
| WordPress | 200+ |

---

## Implementation Insights

### Complexity Reality

| Template Type | Setup Time | Monthly Maintenance |
|---------------|------------|---------------------|
| Simple (≤5 nodes) | 2-5 hours | 1-2 hours |
| Medium (6-15 nodes) | 10-20 hours | 3-5 hours |
| Complex (16+ nodes) | 20-40 hours | 5-10 hours |

### Common Implementation Challenges

1. **Authentication**: OAuth flows, token refresh, credential management
2. **Rate Limits**: API throttling, backoff strategies
3. **Data Mapping**: Field mismatches, format conversions
4. **Error Handling**: Retry logic, fallback paths
5. **Scalability**: Performance at volume, queue management
6. **Maintenance**: API changes, platform updates

### Template Adaptation Tips

1. **Test at Scale**: Templates may fail with production data volumes
2. **Add Error Handling**: Most templates lack robust error paths
3. **Secure Credentials**: Replace hardcoded values with credential storage
4. **Document Changes**: Track modifications for maintenance
5. **Monitor Performance**: Add logging and alerting

---

## Repository Quick Reference

### For Pattern Analysis

| Repository | Workflows | Best For |
|------------|-----------|----------|
| Zie619/n8n-workflows | 4,343 | Largest collection |
| Danitilahun/n8n-workflow-templates | 2,053 | Best organized |
| n8n.io/workflows | 7,336 | Official templates |

### For AI Workflows

| Repository | Focus |
|------------|-------|
| wassupjay/n8n-free-templates | RAG, LLM, embeddings |
| simealdana/ai-automation-jsons | Voice agents, MCP |
| workflowsdiy/n8n-workflows | Agentic systems |

### For Quick Start

| Repository | Advantage |
|------------|-----------|
| enescingoz/awesome-n8n-templates | Well-organized categories |
| creativetimofficial/ct-n8n-templates | Business scenarios |

### For Development

| Repository | Use |
|------------|-----|
| RooobinTheRobotWrangler/n8n-codex-library | AI-assisted development |
| restyler/awesome-n8n | Community node discovery |

---

## How to Use This Collection

### For Inspiration

1. Browse categories matching your use case
2. Study workflow structure and node choices
3. Identify common patterns
4. Adapt to your specific needs

### For Pattern Extraction

1. Download JSON from repositories
2. Analyze node types and connections
3. Extract reusable sub-workflows
4. Document common patterns

### For Template Development

1. Use existing templates as starting points
2. Add error handling and documentation
3. Test with real data
4. Contribute improvements back

---

## Sources

### GitHub Repositories
- [Danitilahun/n8n-workflow-templates](https://github.com/Danitilahun/n8n-workflow-templates)
- [Zie619/n8n-workflows](https://github.com/Zie619/n8n-workflows)
- [enescingoz/awesome-n8n-templates](https://github.com/enescingoz/awesome-n8n-templates)
- [wassupjay/n8n-free-templates](https://github.com/wassupjay/n8n-free-templates)
- [restyler/awesome-n8n](https://github.com/restyler/awesome-n8n)
- [simealdana/ai-automation-jsons](https://github.com/simealdana/ai-automation-jsons)
- [RooobinTheRobotWrangler/n8n-codex-library](https://github.com/RooobinTheRobotWrangler/n8n-codex-library)
- [creativetimofficial/ct-n8n-templates](https://github.com/creativetimofficial/ct-n8n-templates)
- [workflowsdiy/n8n-workflows](https://github.com/workflowsdiy/n8n-workflows)
- [bheidepriem/n8n-workflows-1000-templates](https://github.com/bheidepriem/n8n-workflows-1000-templates)
- [Sayerxofficial/n8n](https://github.com/Sayerxofficial/n8n)
- [LudwigGerdes/workflow-templates](https://github.com/LudwigGerdes/workflow-templates)

### GitHub Topics
- [n8n-workflow](https://github.com/topics/n8n-workflow)
- [n8n-template](https://github.com/topics/n8n-template)
- [n8n-automation](https://github.com/topics/n8n-automation)

### Official Resources
- [n8n Workflow Library](https://n8n.io/workflows/)
- [n8n AI Workflows](https://n8n.io/workflows/categories/ai/)
- [n8n GitHub Organization](https://github.com/n8n-io)

### Analysis Resources
- [15 N8N Workflow Examples 2025 - Latenode](https://latenode.com/blog/15-n8n-workflow-examples-2025-real-automation-templates-implementation-analysis)
- [Top n8n Templates 2025](https://n8n-automation.com/2025/02/05/top-n8n-templates-2025/)

---

*Document compiled for n8n Workflow Assistant project - December 2025*
