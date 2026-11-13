/**
 * Tests for MCP prompts: generate_video (the clone_viral_video prompt was removed for Whop compliance)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGenerateVideoPrompt } from '../src/prompts/generate-video.js';

// Mock fetch
global.fetch = vi.fn();

describe('MCP Prompts', () => {
  let server: McpServer;
  const registeredPrompts = new Map<string, any>();

  beforeEach(() => {
    vi.clearAllMocks();
    registeredPrompts.clear();
    server = new McpServer({ name: 'test', version: '1.0.0' });

    // Capture prompt registrations
    const origPrompt = server.prompt.bind(server);
    server.prompt = ((name: string, description: string, schema: any, handler: any) => {
      registeredPrompts.set(name, { description, schema, handler });
      return origPrompt(name, description, schema, handler);
    }) as any;
  });

  describe('registerGenerateVideoPrompt', () => {
    it('registers generate_video prompt', () => {
      registerGenerateVideoPrompt(server);
      expect(registeredPrompts.has('generate_video')).toBe(true);
    });

    it('returns messages with topic when provided', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({ topic: 'AI facts' });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content.text).toContain('AI facts');
    });

    it('returns messages without topic when not provided', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({});
      expect(result.messages[0].content.text).toContain('ask the user');
    });

    it('includes credit cost information', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({ topic: 'test' });
      const text = result.messages[0].content.text;
      expect(text).toContain('Costs 65 credits (40 render + 25 ElevenLabs voice)');
      expect(text).toContain('+25 with ElevenLabs');
      expect(text).not.toContain('+50');
      expect(text).toContain('blockedReason');
    });

    it('includes step-by-step tool names', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({ topic: 'test' });
      const text = result.messages[0].content.text;
      expect(text).toContain('autoshort_get_credit_balance');
      expect(text).toContain('autoshort_list_niches');
      expect(text).toContain('autoshort_generate_video');
      expect(text).toContain('autoshort_get_video');
    });
  });

  describe('compliance', () => {
    it('no "clone viral" prompt is registered, and generate_video carries no clone/copy/income wording', () => {
      registerGenerateVideoPrompt(server);
      expect([...registeredPrompts.keys()]).toEqual(['generate_video']);
      const text = registeredPrompts.get('generate_video').handler({ topic: 'x' }).messages[0].content.text as string;
      expect(text).not.toMatch(/clon|copy|viral|income|earn|money|lifetime/i);
    });
  });
});
