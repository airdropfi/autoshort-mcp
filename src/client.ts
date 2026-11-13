/**
 * AutoShort API HTTP client, for the package's own resources (credit balance, rate limit).
 * Tools do not use it: they are proxied to the remote /api/mcp registry (see proxy.ts).
 */

import { USER_AGENT } from './constants.js';
import type { RateLimitInfo } from './types.js';

export class AutoShortClient {
  /** Last rate limit info from API response headers */
  public lastRateLimit: RateLimitInfo | null = null;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  /** Generic API request with auth, error handling, rate limit capture */
  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    if (!this.apiKey) {
      throw new AutoShortApiError('API key required. Set AUTOSHORT_API_KEY or pass --api-key.', 401, 'MISSING_API_KEY');
    }
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Capture rate limit headers
    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const resetAt = res.headers.get('x-ratelimit-reset');
    if (limit && remaining && resetAt) {
      this.lastRateLimit = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetAt,
      };
    }

    if (!res.ok) {
      let errorBody: { error?: string; code?: string } = {};
      try { errorBody = await res.json() as typeof errorBody; } catch { /* empty */ }
      const msg = errorBody.error || `API error: ${res.status} ${res.statusText}`;
      const code = errorBody.code || `HTTP_${res.status}`;
      throw new AutoShortApiError(msg, res.status, code);
    }

    return res.json() as Promise<T>;
  }

  // ── Credits ──

  async getCreditBalance() {
    return this.request<{ balance: number; monthlyAllocation: number; bonusCredits: number; plan: string }>(
      'GET', '/api/v1/credits/balance'
    );
  }

}

/** Typed API error with HTTP status and error code */
export class AutoShortApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AutoShortApiError';
  }
}
