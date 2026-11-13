/**
 * The stdio server's tools are the REMOTE server's tools.
 *
 * tools/list and tools/call are forwarded to `${baseUrl}/api/mcp` (JSON-RPC over HTTP) with the
 * user's API key, so this package and the remote connector expose exactly the same tool names,
 * descriptions and schemas — one registry, in the app (src/app/api/mcp/tools.ts). Before this,
 * the package defined its own 12 tools and the remote server 5 differently named ones, and an
 * agent saw different tools depending on how it connected.
 *
 * The one thing a remote server cannot do is read the user's disk, so image-to-video keeps a
 * local convenience: `imagePath` is read here and sent as `imageBase64`.
 *
 * Auth and money are enforced by the server on every call (401 without a valid key, 402 before
 * any paid work); nothing here can bypass them.
 */

import { readFile, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { USER_AGENT } from './constants.js';
import { TOOLS_SNAPSHOT } from './tools-snapshot.js';

export const IMAGE_TO_VIDEO_TOOL = 'autoshort_generate_image_to_video';
export const UPLOAD_RECORDING_TOOL = 'autoshort_ugc_upload_recording';

/** The largest image /api/videos/image-to-video accepts (IMAGE_TO_VIDEO_MAX_IMAGE_BYTES there). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * The largest recording this package sends inline (MAX_RECORDING_INLINE_BYTES on the server: the
 * /api/mcp body cap leaves room for 10 MB as base64). Larger files (up to 50 MB) go by recordingUrl.
 */
export const MAX_RECORDING_BYTES = 10 * 1024 * 1024;

export interface RemoteTool {
  name: string;
  title?: string;
  description?: string;
  inputSchema: { type: 'object'; properties?: Record<string, unknown>; required?: string[]; [k: string]: unknown };
  annotations?: Record<string, unknown>;
}

export interface ToolCallResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
  [k: string]: unknown;
}

type FetchLike = (input: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export class RemoteError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'RemoteError';
  }
}

/**
 * The remote schema, plus the stdio-only local-file alternatives: `imagePath` for image-to-video
 * and `recordingPath` for the UGC screen recording (read here, sent as base64).
 */
export function localizeTool(tool: RemoteTool): RemoteTool {
  if (tool.name === IMAGE_TO_VIDEO_TOOL) {
    const properties = { ...(tool.inputSchema.properties ?? {}) };
    properties.imagePath = {
      type: 'string',
      description: 'Absolute path to a local JPG, PNG or WebP file up to 10MB (read and uploaded by this local server). Use instead of image_url or imageBase64.',
    };
    return {
      ...tool,
      inputSchema: {
        ...tool.inputSchema,
        properties,
        // Either imagePath or imageBase64 — the server checks that an image arrived.
        required: (tool.inputSchema.required ?? []).filter((r) => r !== 'imageBase64'),
      },
    };
  }
  if (tool.name === UPLOAD_RECORDING_TOOL) {
    const properties = { ...(tool.inputSchema.properties ?? {}) };
    properties.recordingPath = {
      type: 'string',
      description: 'Absolute path to a local MP4/MOV screen recording up to 10MB (read and uploaded by this local server). Larger files: pass recordingUrl.',
    };
    return { ...tool, inputSchema: { ...tool.inputSchema, properties } };
  }
  return tool;
}

const mb = (n: number) => (n / (1024 * 1024)).toFixed(1);

export class RemoteToolProxy {
  private nextId = 1;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike = fetch as unknown as FetchLike,
    private readonly readLocalFile: (path: string) => Promise<Uint8Array> = readFile,
    private readonly localFileSize: (path: string) => Promise<number> = async (p) => (await stat(p)).size,
  ) {}

  private async rpc<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl.replace(/\/+$/, '')}/api/mcp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: this.nextId++, method, ...(params ? { params } : {}) }),
    });
    let body: { result?: T; error?: { message?: string } | string; code?: string } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      /* non-JSON */
    }
    if (!res.ok) {
      const message = typeof body.error === 'string' ? body.error : body.error?.message;
      throw new RemoteError(message || `AutoShort returned HTTP ${res.status}`, res.status);
    }
    if (body.error) {
      throw new RemoteError(typeof body.error === 'string' ? body.error : body.error.message || 'AutoShort error', res.status);
    }
    return body.result as T;
  }

  async listTools(): Promise<RemoteTool[]> {
    // No key: list the offline snapshot, so discovery needs neither network nor account.
    if (!this.apiKey) return TOOLS_SNAPSHOT.map(localizeTool);
    const result = await this.rpc<{ tools: RemoteTool[] }>('tools/list');
    return (result?.tools ?? []).map(localizeTool);
  }

  async callTool(name: string, rawArgs: Record<string, unknown> = {}): Promise<ToolCallResult> {
    if (!this.apiKey) {
      return {
        content: [{ type: 'text', text: 'Error: an AutoShort API key is required to call tools. Set AUTOSHORT_API_KEY (or pass --api-key). Create one at https://autoshort.org/en/developers. Nothing was sent.' }],
        isError: true,
      };
    }
    try {
      const args = { ...rawArgs };
      if (name === UPLOAD_RECORDING_TOOL && typeof args.recordingPath === 'string' && args.recordingPath) {
        const size = await this.localFileSize(args.recordingPath);
        if (size > MAX_RECORDING_BYTES) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${args.recordingPath} is ${mb(size)} MB; a local file can be sent up to ${mb(MAX_RECORDING_BYTES)} MB. Upload it somewhere public and pass recordingUrl instead (up to 50 MB). Nothing was uploaded.`,
            }],
            isError: true,
          };
        }
        const bytes = await this.readLocalFile(args.recordingPath);
        args.recordingBase64 = Buffer.from(bytes).toString('base64');
        if (!args.fileName) args.fileName = basename(args.recordingPath);
        delete args.recordingPath;
      }
      if (name === IMAGE_TO_VIDEO_TOOL && typeof args.imagePath === 'string' && args.imagePath) {
        // Checked before reading: a 2GB file must not be loaded into memory and base64'd only
        // for the server to refuse it.
        const size = await this.localFileSize(args.imagePath);
        if (size > MAX_IMAGE_BYTES) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${args.imagePath} is ${mb(size)} MB; AutoShort accepts images up to ${mb(MAX_IMAGE_BYTES)} MB. Nothing was uploaded or charged.`,
            }],
            isError: true,
          };
        }
        const bytes = await this.readLocalFile(args.imagePath);
        args.imageBase64 = Buffer.from(bytes).toString('base64');
        if (!args.imageFileName) args.imageFileName = basename(args.imagePath);
        delete args.imagePath;
      }
      return await this.rpc<ToolCallResult>('tools/call', { name, arguments: args });
    } catch (e) {
      const msg = e instanceof RemoteError
        ? `Error ${e.status}: ${e.message}`
        : `Error: ${e instanceof Error ? e.message : String(e)}`;
      return { content: [{ type: 'text', text: msg }], isError: true };
    }
  }
}
