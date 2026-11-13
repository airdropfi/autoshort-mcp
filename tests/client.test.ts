/**
 * Unit tests for AutoShortClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoShortClient, AutoShortApiError } from '../src/client.js';

// Mock global fetch
global.fetch = vi.fn();

describe('AutoShortClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates client with api key and base url', () => {
      const client = new AutoShortClient('sk_test_123', 'https://api.example.com');
      expect(client).toBeInstanceOf(AutoShortClient);
      expect(client['apiKey']).toBe('sk_test_123');
      expect(client['baseUrl']).toBe('https://api.example.com');
    });

    it('initializes lastRateLimit as null', () => {
      const client = new AutoShortClient('sk_test_123', 'https://api.example.com');
      expect(client.lastRateLimit).toBeNull();
    });
  });

  describe('request method', () => {
    let client: AutoShortClient;

    beforeEach(() => {
      client = new AutoShortClient('sk_test_123', 'https://api.example.com');
    });

    it('makes successful GET request', async () => {
      const responseData = { id: 'vid_123', status: 'completed' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
        headers: new Map(),
      });

      const result = await client.request('GET', '/api/v1/videos/vid_123');
      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/videos/vid_123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk_test_123',
          }),
        })
      );
    });

    it('makes successful POST request with body', async () => {
      const responseData = { id: 'vid_456' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
        headers: new Map(),
      });

      const payload = { topic: 'AI facts', duration: 60 };
      const result = await client.request('POST', '/api/v1/videos/generate', payload);

      expect(result).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });

    it('sets rate limit headers when present', async () => {
      const mockHeaders = new Map([
        ['x-ratelimit-limit', '1000'],
        ['x-ratelimit-remaining', '999'],
        ['x-ratelimit-reset', '2026-03-22T12:00:00Z'],
      ]);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: mockHeaders,
      });

      await client.request('GET', '/api/v1/test');

      expect(client.lastRateLimit).toEqual({
        limit: 1000,
        remaining: 999,
        resetAt: '2026-03-22T12:00:00Z',
      });
    });

    it('throws AutoShortApiError on non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid API key', code: 'AUTH_INVALID' }),
        headers: new Map(),
      });

      await expect(client.request('GET', '/api/v1/test')).rejects.toThrow(AutoShortApiError);
    });

    it('handles error response with custom message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Topic too long', code: 'VALIDATION_ERROR' }),
        headers: new Map(),
      });

      try {
        await client.request('POST', '/api/v1/test');
        expect.fail('should throw');
      } catch (e) {
        expect(e).toBeInstanceOf(AutoShortApiError);
        expect((e as AutoShortApiError).message).toBe('Topic too long');
        expect((e as AutoShortApiError).status).toBe(400);
        expect((e as AutoShortApiError).code).toBe('VALIDATION_ERROR');
      }
    });

    it('handles error response with fallback message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
        headers: new Map(),
      });

      try {
        await client.request('GET', '/api/v1/test');
        expect.fail('should throw');
      } catch (e) {
        expect(e).toBeInstanceOf(AutoShortApiError);
        expect((e as AutoShortApiError).message).toContain('API error');
        expect((e as AutoShortApiError).status).toBe(500);
        expect((e as AutoShortApiError).code).toBe('HTTP_500');
      }
    });

    it('ignores malformed error JSON', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => { throw new Error('bad json'); },
        headers: new Map(),
      });

      try {
        await client.request('GET', '/api/v1/test');
        expect.fail('should throw');
      } catch (e) {
        expect(e).toBeInstanceOf(AutoShortApiError);
        expect((e as AutoShortApiError).status).toBe(403);
      }
    });

    it('includes User-Agent header', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.request('GET', '/api/v1/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('autoshort-mcp'),
          }),
        })
      );
    });
  });

  describe('API methods', () => {
    let client: AutoShortClient;

    beforeEach(() => {
      client = new AutoShortClient('sk_test_123', 'https://api.example.com');
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
        headers: new Map(),
      });
    });

    it('getCreditBalance calls correct endpoint', async () => {
      await client.getCreditBalance();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/credits/balance'),
        expect.objectContaining({ method: 'GET' })
      );
    });

  });
});

describe('AutoShortClient without an API key', () => {
  it('fails with MISSING_API_KEY before any network request', async () => {
    vi.mocked(global.fetch).mockClear();
    const client = new AutoShortClient('', 'https://api.example.com');
    await expect(client.request('GET', '/api/v1/credits/balance')).rejects.toMatchObject({ status: 401, code: 'MISSING_API_KEY' });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
