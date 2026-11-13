/**
 * Credit balance MCP resource
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AutoShortClient } from '../client.js';

export function registerCreditResource(server: McpServer, client: AutoShortClient) {
  server.resource(
    'credit-balance',
    'autoshort://credits/balance',
    { description: 'Current credit balance, monthly allocation, and plan tier', mimeType: 'application/json' },
    async () => {
      const balance = await client.getCreditBalance();
      return {
        contents: [{
          uri: 'autoshort://credits/balance',
          mimeType: 'application/json',
          text: JSON.stringify(balance, null, 2),
        }],
      };
    },
  );
}
