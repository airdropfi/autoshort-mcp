/**
 * Video generation prompt template
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { API_VIDEO_COST_TEXT, CREDIT_COSTS } from '../catalog.js';

export function registerGenerateVideoPrompt(server: McpServer) {
  server.prompt(
    'generate_video',
    'Step-by-step guide to generate an AI video with AutoShort',
    { topic: z.string().optional().describe('Video topic (optional — will prompt if not provided)') },
    ({ topic }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Help me generate an AI video with AutoShort.${topic ? ` Topic: "${topic}"` : ''}

If I already have a script or specific shots in mind, use director mode instead: agree the scenes with me,
call autoshort_draft_video with scenes[] (free, narration read verbatim), show me the draft, and only call
autoshort_render_draft after I approve.

Steps for a quick video from a topic:
1. First, check my credit balance with autoshort_get_credit_balance
2. List available options with autoshort_list_niches (niches, art styles, qualities)
3. Generate the video with autoshort_generate_video using:
   - topic: ${topic ? `"${topic}"` : '(ask the user)'}
   - niche: Choose the best match from available niches
   - duration: 60 (default, good for most videos)
   - artStyle: AUTOSHORTS (default cinematic style)
4. Poll autoshort_get_video every 20-30 seconds until status is COMPLETED or FAILED.
   If it returns blockedReason (e.g. INSUFFICIENT_CREDITS), stop polling and tell the user what it says.
5. Share the video URL when done.
6. If I want it posted: autoshort_publish_video (YouTube upload or TikTok Drafts). If the platform is not connected,
   give me the connectUrl from autoshort_get_connection_status and poll that tool until it says connected.

Credit costs: autoshort_generate_video: ${API_VIDEO_COST_TEXT} Chat videos: ${CREDIT_COSTS.videoStandard} credits with the default voice, +${CREDIT_COSTS.elevenLabsVoice} with ElevenLabs.
If autoshort_get_credit_balance returns 403 INSUFFICIENT_SCOPE, the API key lacks "credits:read": the error says where to create a key that has it.`,
        },
      }],
    }),
  );
}
