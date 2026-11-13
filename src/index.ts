#!/usr/bin/env node

/**
 * AutoShort MCP Server
 *
 * Enables AI agents (Claude, Cursor, etc.) to generate videos via AutoShort API.
 * Usage: npx mcp-server-autoshorts --api-key sk_live_xxx
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { AutoShortClient } from './client.js';
import { DEFAULT_BASE_URL, VERSION } from './constants.js';

// ── Tools: proxied to the remote registry (src/app/api/mcp/tools.ts in the app) ──
import { ListToolsRequestSchema, CallToolRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { RemoteToolProxy } from './proxy.js';

// ── Resources ──
import { registerCreditResource } from './resources/credits.js';
import { registerRateLimitResource } from './resources/rate-limit.js';

// ── Prompts ──
import { registerGenerateVideoPrompt } from './prompts/generate-video.js';

// ── CLI arg parsing ──

function parseArgs(argv: string[]): { apiKey: string; baseUrl: string } {
  let apiKey = process.env.AUTOSHORT_API_KEY || '';
  let baseUrl = DEFAULT_BASE_URL;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--api-key' && argv[i + 1]) {
      apiKey = argv[++i];
    } else if (argv[i] === '--base-url' && argv[i + 1]) {
      baseUrl = argv[++i];
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.error(`autoshort-mcp-server v${VERSION}

Usage: autoshort-mcp --api-key <key> [--base-url <url>]

Options:
  --api-key <key>    AutoShort API key (or set AUTOSHORT_API_KEY env var)
  --base-url <url>   API base URL (default: ${DEFAULT_BASE_URL})
  --help, -h         Show this help message

Get your API key at: https://autoshort.org/en/developers`);
      process.exit(0);
    }
  }

  if (!apiKey) {
    console.error('Note: no API key set, so tools are listed but cannot be called. Use --api-key <key> or set AUTOSHORT_API_KEY.');
    console.error('Get your API key at: https://autoshort.org/en/developers');
  }

  return { apiKey, baseUrl };
}

// ── Main ──

async function main() {
  const { apiKey, baseUrl } = parseArgs(process.argv.slice(2));
  const client = new AutoShortClient(apiKey, baseUrl);

  const server = new McpServer({
    name: 'autoshort-mcp-server',
    version: VERSION,
  });

  // Tools: the remote server's registry, so stdio and the remote connector list the same set.
  const proxy = new RemoteToolProxy(apiKey, baseUrl);
  server.server.registerCapabilities({ tools: { listChanged: false } });
  server.server.setRequestHandler(ListToolsRequestSchema, async () => {
    try {
      return { tools: await proxy.listTools() };
    } catch (e) {
      throw new McpError(ErrorCode.InternalError, `Could not load AutoShort tools: ${e instanceof Error ? e.message : String(e)}`);
    }
  });
  server.server.setRequestHandler(CallToolRequestSchema, async (request) =>
    proxy.callTool(request.params.name, (request.params.arguments ?? {}) as Record<string, unknown>),
  );

  // Register resources
  registerCreditResource(server, client);
  registerRateLimitResource(server, client);

  // Register prompts
  registerGenerateVideoPrompt(server);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
