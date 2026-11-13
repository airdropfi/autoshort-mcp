/**
 * The stdio package is a proxy for the remote registry: it must list exactly the remote tool
 * names, forward calls with the user's key, and only add the local imagePath convenience.
 * (The cross-transport parity check against the REAL registry lives in the app:
 * src/app/api/mcp/transport-parity.test.ts.)
 */
import { describe, it, expect, vi } from 'vitest';
import { RemoteToolProxy, localizeTool, IMAGE_TO_VIDEO_TOOL, MAX_IMAGE_BYTES, UPLOAD_RECORDING_TOOL, MAX_RECORDING_BYTES } from '../src/proxy.js';

const REMOTE_TOOLS = [
  { name: 'autoshort_draft_video', description: 'draft', inputSchema: { type: 'object', properties: {}, required: [] } },
  {
    name: IMAGE_TO_VIDEO_TOOL,
    description: 'i2v',
    inputSchema: { type: 'object', properties: { imageBase64: { type: 'string' }, motionPrompt: { type: 'string' } }, required: ['imageBase64', 'motionPrompt'] },
  },
];

function fakeFetch(handler: (body: any, headers: Record<string, string>) => { status?: number; body: unknown }) {
  return vi.fn(async (_url: string, init: { method: string; headers: Record<string, string>; body: string }) => {
    const out = handler(JSON.parse(init.body), init.headers);
    return { ok: (out.status ?? 200) < 400, status: out.status ?? 200, json: async () => out.body };
  });
}

describe('RemoteToolProxy', () => {
  it('lists the remote tools by their remote names, with the key on the request', async () => {
    const fetchImpl = fakeFetch((body, headers) => {
      expect(headers.Authorization).toBe('Bearer sk_test_1');
      expect(body.method).toBe('tools/list');
      return { body: { jsonrpc: '2.0', id: body.id, result: { tools: REMOTE_TOOLS } } };
    });
    const proxy = new RemoteToolProxy('sk_test_1', 'https://autoshort.test/', fetchImpl as any);
    const tools = await proxy.listTools();
    expect(tools.map((t) => t.name)).toEqual(REMOTE_TOOLS.map((t) => t.name));
    expect(fetchImpl.mock.calls[0][0]).toBe('https://autoshort.test/api/mcp');
  });

  it('adds imagePath to image-to-video only, and stops requiring imageBase64', () => {
    const local = localizeTool(REMOTE_TOOLS[1] as any);
    expect(Object.keys(local.inputSchema.properties!)).toContain('imagePath');
    expect(local.inputSchema.required).toEqual(['motionPrompt']);
    expect(localizeTool(REMOTE_TOOLS[0] as any)).toBe(REMOTE_TOOLS[0]);
  });

  it('forwards tools/call unchanged and returns the remote result', async () => {
    const fetchImpl = fakeFetch((body) => {
      expect(body.method).toBe('tools/call');
      expect(body.params).toEqual({ name: 'autoshort_draft_video', arguments: { scenes: [{ narration: 'Hi' }] } });
      return { body: { jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: '{"draftId":"d1"}' }], isError: false } } };
    });
    const proxy = new RemoteToolProxy('sk', 'https://a.test', fetchImpl as any);
    const res = await proxy.callTool('autoshort_draft_video', { scenes: [{ narration: 'Hi' }] });
    expect(res.content[0].text).toContain('d1');
    expect(res.isError).toBe(false);
  });

  it('reads imagePath locally and sends it as imageBase64 (never the path)', async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const fetchImpl = fakeFetch((body) => {
      expect(body.params.arguments.imagePath).toBeUndefined();
      expect(body.params.arguments.imageBase64).toBe(Buffer.from(bytes).toString('base64'));
      expect(body.params.arguments.imageFileName).toBe('cat.jpg');
      return { body: { jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'ok' }] } } };
    });
    const proxy = new RemoteToolProxy('sk', 'https://a.test', fetchImpl as any, async () => bytes, async () => bytes.length);
    const res = await proxy.callTool(IMAGE_TO_VIDEO_TOOL, { imagePath: '/x/cat.jpg', motionPrompt: 'push in' });
    expect(res.isError).toBeUndefined();
  });

  it('sends a 10 MB image (the server limit) but refuses a larger one before reading or uploading it', async () => {
    const fetchImpl = fakeFetch((body) => ({ body: { jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'ok' }] } } }));
    const read = vi.fn(async () => new Uint8Array(MAX_IMAGE_BYTES));

    const atLimit = new RemoteToolProxy('sk', 'https://a.test', fetchImpl as any, read, async () => MAX_IMAGE_BYTES);
    const ok = await atLimit.callTool(IMAGE_TO_VIDEO_TOOL, { imagePath: '/x/big.jpg', motionPrompt: 'push in' });
    expect(ok.isError).toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledTimes(1);

    const over = new RemoteToolProxy('sk', 'https://a.test', fetchImpl as any, read, async () => MAX_IMAGE_BYTES + 1);
    const refused = await over.callTool(IMAGE_TO_VIDEO_TOOL, { imagePath: '/x/huge.jpg', motionPrompt: 'push in' });
    expect(refused.isError).toBe(true);
    expect(refused.content[0].text).toMatch(/accepts images up to 10\.0 MB\. Nothing was uploaded or charged/);
    expect(fetchImpl).toHaveBeenCalledTimes(1); // not sent
    expect(read).toHaveBeenCalledTimes(1); // not even read
  });

  it('turns a 401 into an error result instead of throwing', async () => {
    const fetchImpl = fakeFetch(() => ({ status: 401, body: { error: 'Invalid API key', code: 'UNAUTHORIZED' } }));
    const proxy = new RemoteToolProxy('bad', 'https://a.test', fetchImpl as any);
    const res = await proxy.callTool('autoshort_get_video', { id: 'x' });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toBe('Error 401: Invalid API key');
    await expect(proxy.listTools()).rejects.toThrow('Invalid API key');
  });

  it('adds recordingPath to the UGC upload tool, reads it locally and sends base64 (never the path)', async () => {
    const tool = localizeTool({ name: UPLOAD_RECORDING_TOOL, inputSchema: { type: 'object', properties: { recordingUrl: {}, recordingBase64: {} }, required: [] } });
    expect(Object.keys(tool.inputSchema.properties!)).toEqual(['recordingUrl', 'recordingBase64', 'recordingPath']);
    const bytes = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70]);
    const fetchImpl = fakeFetch((body) => {
      expect(body.params.arguments.recordingPath).toBeUndefined();
      expect(body.params.arguments.recordingBase64).toBe(Buffer.from(bytes).toString('base64'));
      expect(body.params.arguments.fileName).toBe('demo.mov');
      return { body: { jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'ok' }] } } };
    });
    const proxy = new RemoteToolProxy('sk', 'https://a.test', fetchImpl as any, async () => bytes, async () => bytes.length);
    expect((await proxy.callTool(UPLOAD_RECORDING_TOOL, { recordingPath: '/x/demo.mov' })).isError).toBeUndefined();

    const read = vi.fn(async () => new Uint8Array(1));
    const over = new RemoteToolProxy('sk', 'https://a.test', fetchImpl as any, read, async () => MAX_RECORDING_BYTES + 1);
    const refused = await over.callTool(UPLOAD_RECORDING_TOOL, { recordingPath: '/x/huge.mp4' });
    expect(refused.isError).toBe(true);
    expect(read).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe('RemoteToolProxy without an API key', () => {
  it('lists the offline snapshot without touching the network', async () => {
    const fetchImpl = vi.fn();
    const proxy = new RemoteToolProxy('', 'https://a.test', fetchImpl as any);
    const tools = await proxy.listTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.map((t) => t.name)).toContain('autoshort_draft_video');
    expect(tools.find((t) => t.name === IMAGE_TO_VIDEO_TOOL)!.inputSchema.properties).toHaveProperty('imagePath');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('refuses tools/call before sending anything', async () => {
    const fetchImpl = vi.fn();
    const proxy = new RemoteToolProxy('', 'https://a.test', fetchImpl as any);
    const res = await proxy.callTool('autoshort_draft_video', {});
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('API key is required');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
