/**
 * Tests for MCP resources: credit balance, rate limit
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCreditResource } from '../src/resources/credits.js';
import { registerRateLimitResource } from '../src/resources/rate-limit.js';

// Mock fetch
global.fetch = vi.fn();

describe('MCP Resources', () => {
  let server: McpServer;
  const registeredResources = new Map<string, any>();

  beforeEach(() => {
    vi.clearAllMocks();
    registeredResources.clear();
    server = new McpServer({ name: 'test', version: '1.0.0' });

    // Capture resource registrations
    const origResource = server.resource.bind(server);
    server.resource = ((name: string, uri: string, meta: any, handler: any) => {
      registeredResources.set(name, { uri, meta, handler });
      return origResource(name, uri, meta, handler);
    }) as any;
  });

  describe('registerCreditResource', () => {
    it('registers credit-balance resource', () => {
      const client = { getCreditBalance: vi.fn() } as any;
      registerCreditResource(server, client);
      expect(registeredResources.has('credit-balance')).toBe(true);
    });

    it('returns credit balance from API', async () => {
      const client = {
        getCreditBalance: vi.fn().mockResolvedValue({ balance: 500, monthlyAllocation: 80, bonusCredits: 0, plan: 'FREE' }),
      } as any;
      registerCreditResource(server, client);
      const handler = registeredResources.get('credit-balance').handler;
      const result = await handler(new URL('autoshort://credits/balance'), {});
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('autoshort://credits/balance');
      expect(result.contents[0].mimeType).toBe('application/json');
      const parsed = JSON.parse(result.contents[0].text);
      expect(parsed.balance).toBe(500);
      expect(parsed.plan).toBe('FREE');
    });

    it('uses autoshort:// URI scheme', () => {
      const client = { getCreditBalance: vi.fn() } as any;
      registerCreditResource(server, client);
      expect(registeredResources.get('credit-balance').uri).toBe('autoshort://credits/balance');
    });
  });

  describe('registerRateLimitResource', () => {
    it('registers rate-limit resource', () => {
      const client = { lastRateLimit: null } as any;
      registerRateLimitResource(server, client);
      expect(registeredResources.has('rate-limit')).toBe(true);
    });

    it('returns rate limit info when available', async () => {
      const client = {
        lastRateLimit: { limit: 1000, remaining: 999, resetAt: '2026-03-22T12:00:00Z' },
      } as any;
      registerRateLimitResource(server, client);
      const handler = registeredResources.get('rate-limit').handler;
      const result = await handler(new URL('autoshort://usage/rate-limit'), {});
      const parsed = JSON.parse(result.contents[0].text);
      expect(parsed.limit).toBe(1000);
      expect(parsed.remaining).toBe(999);
    });

    it('returns fallback when no requests made', async () => {
      const client = { lastRateLimit: null } as any;
      registerRateLimitResource(server, client);
      const handler = registeredResources.get('rate-limit').handler;
      const result = await handler(new URL('autoshort://usage/rate-limit'), {});
      const parsed = JSON.parse(result.contents[0].text);
      expect(parsed.limit).toBeNull();
      expect(parsed.remaining).toBeNull();
      expect(parsed.note).toBe('No API requests made yet');
    });
  });
});
