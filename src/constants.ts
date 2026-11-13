import { createRequire } from 'node:module';

/** Default AutoShort API base URL */
export const DEFAULT_BASE_URL = 'https://autoshort.org';

/**
 * Read from package.json so the version a client sees is the version that was published
 * (it was hardcoded "2.0.0" while package.json said 2.1.0). `../package.json` resolves from
 * both src/ (tests) and dist/ (the published build).
 */
export const VERSION: string = (createRequire(import.meta.url)('../package.json') as { version: string }).version;

/** User-Agent header for API requests (the server tags videos made through it as MCP). */
export const USER_AGENT = `autoshort-mcp-server/${VERSION}`;
