# AutoShort MCP

[![Official MCP Registry](https://img.shields.io/badge/MCP%20Registry-org.autoshort%2Fautoshort-blue)](https://registry.modelcontextprotocol.io/v0.1/servers?search=autoshort)

Turn an idea into a faceless short video: script, voiceover, captions and scenes, from any AI assistant that speaks MCP. This repository is the public home of the **remote MCP server** of [AutoShort](https://autoshort.org): a hosted endpoint, so there is nothing to install or run.

- **Endpoint:** `https://autoshort.org/api/mcp` (Streamable HTTP)
- **Registry name:** `org.autoshort/autoshort` ([Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=autoshort))
- **Auth:** OAuth 2.0 with PKCE and dynamic client registration (discovered from `/.well-known/oauth-protected-resource`), or an AutoShort API key as `Authorization: Bearer sk_live_...`
- **Docs and API keys:** https://autoshort.org/en/developers
- **Also on npm** as a stdio proxy: `npx -y mcp-server-autoshorts` with `AUTOSHORT_API_KEY` set

## What you need

An AutoShort account. The server is a connector to your own account, not a free video generator: drafts are free, renders spend credits from your balance. AutoShort's current plans: a 3-day trial for $2.99 (non-refundable, includes 150 credits), then from $19/month; credit packs start at $2.99. See https://autoshort.org/en/pricing for the live prices.

## Connect

**Claude Code**

```bash
claude mcp add --transport http autoshort https://autoshort.org/api/mcp
```

then run `/mcp` and authenticate `autoshort` (a browser opens: sign in and allow).

**Gemini CLI**

```bash
gemini extensions install https://github.com/airdropfi/autoshort-gemini-extension
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "autoshort": { "type": "http", "url": "https://autoshort.org/api/mcp" }
  }
}
```

**Any other client that supports remote (Streamable HTTP) servers**: add the URL above. If the client cannot do OAuth, create an API key in the AutoShort dashboard and send it as `Authorization: Bearer sk_live_...`.

## What the tools cover

54 tools, with read-only / destructive annotations on each:

| Area | Examples |
|---|---|
| Draft and render | draft a script, review and edit it, revise a scene, price it, render it, cancel, track status |
| Formats | faceless videos, chat-style videos, product-page ads, image-to-video, motion clips, UGC-style campaigns |
| Series | plan a multi-episode character series, character sheets, per-episode quotes, pause/resume |
| Account | credit balance, usage, limits, cost estimate, subscription, webhooks, API keys |
| Publishing | list connected social accounts and publish a finished video |

Rules the server enforces: a draft is free and renders nothing; a render is priced first (`autoshort_estimate_cost` / `autoshort_quote_video`) and spends credits only when you confirm it; real or famous people, protected characters and sexual content are refused. Videos use AI-generated images and voice: switch on the platform's AI-content label when you post. No result or performance is promised.

## Related

- Claude Code plugin: https://github.com/airdropfi/autoshort-claude-plugin
- Gemini CLI extension: https://github.com/airdropfi/autoshort-gemini-extension
- Privacy: https://autoshort.org/en/privacy · Terms: https://autoshort.org/en/terms · Support: support@autoshort.org

## About this repository

It holds the registry metadata (`server.json`, identical to the published registry entry) and documentation. The server itself is closed source and runs at autoshort.org. MIT license covers the contents of this repository.
