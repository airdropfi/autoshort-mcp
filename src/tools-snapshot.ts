/**
 * Offline snapshot of the public tools/list of https://autoshort.org/api/mcp (54 tools; that
 * method is unauthenticated). It is what this server lists when it runs WITHOUT an API key,
 * so tool discovery never needs the network or an account. With a key, tools/list is
 * fetched live from the remote registry (proxy.ts) and this file is not used. Every tools/call
 * needs an API key either way.
 *
 * Regenerate: curl -s -X POST https://autoshort.org/api/mcp -H "content-type: application/json" \
 *   -H "accept: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
 * and paste `result.tools` below.
 */

import type { RemoteTool } from './proxy.js';

export const TOOLS_SNAPSHOT: RemoteTool[] = [
  {
    "name": "autoshort_get_capabilities",
    "title": "Get capabilities and first steps",
    "description": "Start here. Describes the whole agent workflow end to end — make, approve, render, publish, automate, pay — the only steps a human must do, and the limits. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get capabilities and first steps"
    }
  },
  {
    "name": "autoshort_draft_video",
    "title": "Draft a video (free, no render)",
    "description": "Create a video DRAFT — nothing is rendered and no credits are charged. Director mode, the recommended way to make a video the user has opinions about: (1) write and agree the script with the user in this conversation first — narration per scene and what each scene should show; (2) call autoshort_draft_video with scenes[] (free, nothing is rendered or charged); (3) show the user the draft (scenes, estimated length, estimated credits, warnings) and apply their changes with autoshort_update_draft; (4) only after the user approves, call autoshort_render_draft — that is when credits are charged. Narration is read VERBATIM: AutoShort never rewrites it. Each scene with a `visual` gets exactly that image (plus the art style). A scene can carry image_url (the user's own picture, public https link): that scene shows it instead of a generated image, and the draft marks it imageSource \"your image\". Pass scenes[] for a script you agreed with the user (free; stored word for word), or a brief to have AutoShort write one draft for review (needs a positive credit balance, max 20 per hour). Returns draftId, the scenes, estimatedDurationSeconds, estimatedCredits and warnings[].",
    "inputSchema": {
      "type": "object",
      "properties": {
        "scenes": {
          "type": "array",
          "minItems": 1,
          "maxItems": 12,
          "items": {
            "type": "object",
            "properties": {
              "narration": {
                "type": "string",
                "maxLength": 1000,
                "description": "Exactly what the voice reads for this scene. Read verbatim — never rewritten."
              },
              "visual": {
                "type": "string",
                "maxLength": 600,
                "description": "What the viewer SEES in this scene, as a shot description (\"close-up of hands holding a coffee and a planner, morning light\"). Becomes the image prompt as written, plus the art style. Omit to let AutoShort pick an image from the narration."
              },
              "seconds": {
                "type": "number",
                "minimum": 1,
                "maximum": 30,
                "description": "Desired shot length. The spoken narration sets the real length; a mismatch is reported in warnings[]."
              },
              "image_url": {
                "type": "string",
                "format": "uri",
                "maxLength": 2048,
                "description": "Optional. Show the user's OWN image in this scene instead of a generated one (https URL, JPEG/PNG/WebP, at most 10 MB). Animated WebP uses its first frame; GIF and SVG are rejected. Downloaded once, cleaned (EXIF/GPS removed) and served from AutoShort. Same limits as image_urls on autoshort_generate_chat_video."
              }
            },
            "required": [
              "narration"
            ],
            "additionalProperties": false
          },
          "description": "The agreed script, scene by scene, in order."
        },
        "brief": {
          "type": "string",
          "maxLength": 4000,
          "description": "Only when there is no agreed script: what the video should be about. With scenes[] it is used as context for auto images."
        },
        "title": {
          "type": "string",
          "maxLength": 100,
          "description": "Headline shown over the first 1.5s and used as the video title. Defaults to the first sentence."
        },
        "targetDuration": {
          "type": "integer",
          "minimum": 8,
          "maximum": 90,
          "description": "Requested length in seconds. Kept as requested — if the verbatim narration cannot fit it, warnings[] says so with a word count that would."
        },
        "aspectRatio": {
          "type": "string",
          "enum": [
            "9:16",
            "1:1",
            "16:9"
          ]
        },
        "language": {
          "type": "string",
          "description": "BCP-47 narration language (\"en\", \"vi\", …). Omit to detect it from the narration."
        },
        "artStyle": {
          "type": "string",
          "enum": [
            "AUTOSHORTS",
            "LEGO",
            "COMIC_BOOK",
            "DISNEY_TOON",
            "STUDIO_GHIBLI",
            "PIXEL_ART",
            "WATERCOLOR",
            "OIL_PAINTING",
            "CYBERPUNK",
            "FANTASY",
            "ANIME",
            "STICKMAN"
          ],
          "description": "Visual style; see autoshort_list_niches. Default AUTOSHORTS (cinematic photography)."
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Draft a video (free, no render)"
    }
  },
  {
    "name": "autoshort_get_draft",
    "title": "Read a draft",
    "description": "Read a draft (or a submitted director video) as scenes with narration, visual, timing estimates, estimated credits and warnings. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "draftId": {
          "type": "string",
          "description": "The draftId returned by autoshort_draft_video."
        }
      },
      "required": [
        "draftId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Read a draft"
    }
  },
  {
    "name": "autoshort_update_draft",
    "title": "Edit a draft",
    "description": "Change a draft before render. Free. Every scene number refers to the draft as it is now (1-based); operations apply in the order edits, reorder, remove, insert. edits: change a scene's narration (verbatim), visual (null clears it → auto image) or seconds. insert: add scenes after scene N (0 = at the start). remove: scene numbers to drop. reorder: every current scene number in the new order. Returns the updated draft — show it to the user again.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "draftId": {
          "type": "string"
        },
        "edits": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "scene": {
                "type": "integer",
                "minimum": 1
              },
              "narration": {
                "type": "string",
                "maxLength": 1000
              },
              "visual": {
                "type": [
                  "string",
                  "null"
                ],
                "maxLength": 600
              },
              "seconds": {
                "type": [
                  "number",
                  "null"
                ],
                "minimum": 1,
                "maximum": 30
              }
            },
            "required": [
              "scene"
            ],
            "additionalProperties": false
          }
        },
        "insert": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "after": {
                "type": "integer",
                "minimum": 0
              },
              "narration": {
                "type": "string",
                "maxLength": 1000,
                "description": "Exactly what the voice reads for this scene. Read verbatim — never rewritten."
              },
              "visual": {
                "type": "string",
                "maxLength": 600,
                "description": "What the viewer SEES in this scene, as a shot description (\"close-up of hands holding a coffee and a planner, morning light\"). Becomes the image prompt as written, plus the art style. Omit to let AutoShort pick an image from the narration."
              },
              "seconds": {
                "type": "number",
                "minimum": 1,
                "maximum": 30,
                "description": "Desired shot length. The spoken narration sets the real length; a mismatch is reported in warnings[]."
              },
              "image_url": {
                "type": "string",
                "format": "uri",
                "maxLength": 2048,
                "description": "Optional. Show the user's OWN image in this scene instead of a generated one (https URL, JPEG/PNG/WebP, at most 10 MB). Animated WebP uses its first frame; GIF and SVG are rejected. Downloaded once, cleaned (EXIF/GPS removed) and served from AutoShort. Same limits as image_urls on autoshort_generate_chat_video."
              }
            },
            "required": [
              "after",
              "narration"
            ],
            "additionalProperties": false
          }
        },
        "remove": {
          "type": "array",
          "items": {
            "type": "integer",
            "minimum": 1
          }
        },
        "reorder": {
          "type": "array",
          "items": {
            "type": "integer",
            "minimum": 1
          }
        },
        "title": {
          "type": "string",
          "maxLength": 100,
          "description": "Headline shown over the first 1.5s and used as the video title. Defaults to the first sentence."
        },
        "targetDuration": {
          "type": "integer",
          "minimum": 8,
          "maximum": 90,
          "description": "Requested length in seconds. Kept as requested — if the verbatim narration cannot fit it, warnings[] says so with a word count that would."
        },
        "aspectRatio": {
          "type": "string",
          "enum": [
            "9:16",
            "1:1",
            "16:9"
          ]
        },
        "language": {
          "type": "string",
          "description": "BCP-47 narration language (\"en\", \"vi\", …). Omit to detect it from the narration."
        },
        "artStyle": {
          "type": "string",
          "enum": [
            "AUTOSHORTS",
            "LEGO",
            "COMIC_BOOK",
            "DISNEY_TOON",
            "STUDIO_GHIBLI",
            "PIXEL_ART",
            "WATERCOLOR",
            "OIL_PAINTING",
            "CYBERPUNK",
            "FANTASY",
            "ANIME",
            "STICKMAN"
          ],
          "description": "Visual style; see autoshort_list_niches. Default AUTOSHORTS (cinematic photography)."
        }
      },
      "required": [
        "draftId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Edit a draft"
    }
  },
  {
    "name": "autoshort_render_draft",
    "title": "Render an approved draft",
    "description": "Render an approved draft. Call ONLY after the user has seen the draft and said yes. Charges the draft's estimatedCredits now (40 with the default voice), before any rendering work; refunded automatically if the render fails for good. Narration is read verbatim and each scene shows its visual; targetDuration is recorded as requested, and the video runs as long as its narration takes to read (any mismatch was in the draft's warnings). Retry-safe: a repeated call returns the first submission and charges nothing. A short balance returns 402 and keeps the draft. If the account has no credits and has not yet had its free first video, this renders that video instead of failing: watermarked, labelled AI-generated, up to 30 seconds, standard voice, one per account, subject to the day's availability. The answer carries the new video id (not the draft id): poll that one. Rendering is asynchronous: poll autoshort_get_video every 20-30 seconds until status is COMPLETED or FAILED. If get_video returns blockedReason, stop polling and act on it (e.g. top up credits).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "draftId": {
          "type": "string"
        },
        "idempotencyKey": {
          "type": "string",
          "maxLength": 200,
          "description": "Optional; recorded with the submission. The draft itself can only be rendered once."
        }
      },
      "required": [
        "draftId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Render an approved draft"
    }
  },
  {
    "name": "autoshort_revise_scene",
    "title": "Revise one scene of a rendered video",
    "description": "Change one scene of a video that was already rendered. Creates a NEW draft that copies every scene (unchanged scenes keep their existing images) with this scene changed; the original video is untouched and nothing is charged. Show it to the user, then autoshort_render_draft renders it as a new, fully charged video (narration re-voiced, video re-assembled). Single-scene re-render inside the existing file is not available yet.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "videoId": {
          "type": "string"
        },
        "scene": {
          "type": "integer",
          "minimum": 1,
          "description": "1-based scene number."
        },
        "narration": {
          "type": "string",
          "maxLength": 1000,
          "description": "New narration, read verbatim."
        },
        "visual": {
          "type": [
            "string",
            "null"
          ],
          "maxLength": 600,
          "description": "New shot description; null clears it."
        }
      },
      "required": [
        "videoId",
        "scene"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false,
      "title": "Revise one scene of a rendered video"
    }
  },
  {
    "name": "autoshort_ugc_create_campaign",
    "title": "Create a Silent UGC campaign",
    "description": "Create a Silent UGC campaign for the user's own app. Silent UGC: 9-12 s silent short marketing clips for the user's OWN app. Scene 1 = one consistent FICTIONAL AI character (realistic, or faceless: hands on a phone / over-the-shoulder / back view) silently reacting with body language and a big hook in the upper third; scene 2 = the app's real screen recording with a short caption. No voice, no audio track (a trending sound is added when posting). Every video carries a visible \"AI-generated\" note and AI metadata; switch the platform AI label on when posting. Characters come only from a text description (no photo uploads), must be fictional adults (no real or public people, lookalikes or @handles) and non-sexual — the server refuses anything else. Flow: (0) autoshort_ugc_upload_recording (the app screen recording as a public https URL or base64 → recordingAssetId); (1) autoshort_ugc_create_campaign (app name, what it does, a character, recordingAssetId); (2) autoshort_ugc_suggest_hooks; (3) autoshort_ugc_preview ONE hook and show the still to the user; (4) after they approve, autoshort_ugc_render_batch with the hooks they picked; (5) poll autoshort_ugc_get_campaign for the finished videos. Pass characterId to reuse a character, or characterDescription (a fictional adult's look; never a real or public person, a lookalike or a @handle; nothing sexual) plus characterStyle (\"face\" = realistic fictional character, \"faceless\" = hands/over-the-shoulder only) to generate one (1 credit, charged before the image is made). recordingAssetId comes from autoshort_ugc_upload_recording (MP4/MOV, 3-60 s, max 50 MB). Free otherwise.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "appName": {
          "type": "string",
          "maxLength": 60
        },
        "appUrl": {
          "type": "string",
          "maxLength": 300,
          "description": "Public URL of the app or its store page."
        },
        "appDescription": {
          "type": "string",
          "minLength": 20,
          "maxLength": 1500,
          "description": "What the app really does. Hooks are written only from this."
        },
        "goal": {
          "type": "string",
          "enum": [
            "installs",
            "trial",
            "awareness"
          ]
        },
        "characterId": {
          "type": "string"
        },
        "characterName": {
          "type": "string",
          "maxLength": 40
        },
        "characterDescription": {
          "type": "string",
          "maxLength": 400
        },
        "characterStyle": {
          "type": "string",
          "enum": [
            "face",
            "faceless"
          ],
          "description": "Realistic fictional AI character (default when available) or faceless."
        },
        "recordingAssetId": {
          "type": "string"
        },
        "caption": {
          "type": "string",
          "maxLength": 60,
          "description": "Scene-2 caption, e.g. \"type one idea… get a finished short\"."
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and creates nothing."
        }
      },
      "required": [
        "appName",
        "appDescription"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Create a Silent UGC campaign"
    }
  },
  {
    "name": "autoshort_ugc_suggest_hooks",
    "title": "Suggest UGC hooks",
    "description": "Propose 10-20 hooks for a campaign from its app description, in the families \"I can't believe…\", \"No one told me…\", \"POV: …\", \"X months of … and now I find this\" and a pricing angle. An honesty filter drops income or results promises, testimonial stats and speed claims the app cannot back up. Free, but needs a positive credit balance; max 20 per hour. Show the hooks to the user and let them pick.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "campaignId": {
          "type": "string"
        },
        "count": {
          "type": "integer",
          "minimum": 10,
          "maximum": 20
        }
      },
      "required": [
        "campaignId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Suggest UGC hooks"
    }
  },
  {
    "name": "autoshort_ugc_preview",
    "title": "Preview a UGC variant",
    "description": "Preview ONE variant's scene 1 before rendering anything: the character in the chosen setting and gesture (expression = body language), with the hook laid out as the video will show it. Returns previewUrl and a variantId (a draft). 1 credit only when a new start frame has to be generated; otherwise free. Show the still to the user; render only after they approve.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "campaignId": {
          "type": "string"
        },
        "hook": {
          "type": "string",
          "maxLength": 90
        },
        "setting": {
          "type": "string",
          "enum": [
            "desk-pov",
            "couch-lap",
            "bed-pov",
            "kitchen-counter",
            "over-shoulder",
            "window-back"
          ]
        },
        "expression": {
          "type": "string",
          "enum": [
            "tapping",
            "pause",
            "thumbs-up",
            "lean-in",
            "scroll"
          ]
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and creates nothing."
        }
      },
      "required": [
        "campaignId",
        "hook"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Preview a UGC variant"
    }
  },
  {
    "name": "autoshort_ugc_render_batch",
    "title": "Render a batch of UGC variants",
    "description": "Approve and render up to 20 variants. Call ONLY after the user approved the preview. Pricing: character portrait 1 credit; preview 1 credit only when a new start frame is generated; a variant with a new clip 102 credits; a re-caption (same setting + expression, different hook, reuses the clip) 1 credit. The whole batch is reserved in one step before anything is generated — all or nothing; a short balance returns 402 and charges nothing. variantIds approves drafts from autoshort_ugc_preview; variants adds new hooks (setting/expression default to the latest previewed variant's, so they become cheap re-captions of its clip; fromVariantId re-captions a rendered clip). A clip that cannot be made falls back to the still frame and its clip credits come back. Poll autoshort_ugc_get_campaign every 30 seconds.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "campaignId": {
          "type": "string"
        },
        "variantIds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "maxItems": 20
        },
        "variants": {
          "type": "array",
          "maxItems": 20,
          "items": {
            "type": "object",
            "properties": {
              "hook": {
                "type": "string",
                "maxLength": 90
              },
              "setting": {
                "type": "string",
                "enum": [
                  "desk-pov",
                  "couch-lap",
                  "bed-pov",
                  "kitchen-counter",
                  "over-shoulder",
                  "window-back"
                ]
              },
              "expression": {
                "type": "string",
                "enum": [
                  "tapping",
                  "pause",
                  "thumbs-up",
                  "lean-in",
                  "scroll"
                ]
              },
              "fromVariantId": {
                "type": "string",
                "description": "Re-caption this variant's clip with the new hook."
              }
            },
            "required": [
              "hook"
            ],
            "additionalProperties": false
          }
        },
        "idempotencyKey": {
          "type": "string",
          "maxLength": 100,
          "description": "Retry-safe: the same key returns the first batch and charges nothing."
        }
      },
      "required": [
        "campaignId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Render a batch of UGC variants"
    }
  },
  {
    "name": "autoshort_ugc_get_campaign",
    "title": "Read a UGC campaign",
    "description": "Read a Silent UGC campaign: character, recording, suggested hooks, and every variant with its status, preview and finished videoUrl (download). Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "campaignId": {
          "type": "string"
        }
      },
      "required": [
        "campaignId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Read a UGC campaign"
    }
  },
  {
    "name": "autoshort_generate_video",
    "title": "Generate a video from a topic",
    "description": "Generate a video from a topic; AutoShort writes the script (to render a script you already agreed with the user, use autoshort_draft_video). Optional image_urls (public https links, up to 6) put the user's own pictures in the first scenes. Costs 65 credits (40 render + 25 ElevenLabs voice); art style does not change the price. Images do not change the price. A short balance is refused with 402 INSUFFICIENT_CREDITS. Rendering is asynchronous: poll autoshort_get_video every 20-30 seconds until status is COMPLETED or FAILED. If get_video returns blockedReason, stop polling and act on it (e.g. top up credits). ROUTING: this makes a narrated video of still images from a topic. If the user pasted a cinematic / video-model prompt, use autoshort_generate_motion_clip instead.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "topic": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500,
          "description": "What the video is about: one named subject, one angle, one twist. Short topics still work. e.g. \"Why airplane windows have a tiny hole in them\"."
        },
        "niche": {
          "type": "string",
          "enum": [
            "MOTIVATIONAL",
            "SCARY_STORIES",
            "AI_FACTS",
            "HISTORY_FACTS",
            "REDDIT_STORIES",
            "LIFE_HACKS",
            "CRYPTO_FINANCE",
            "PSYCHOLOGY_FACTS",
            "PERSONAL_FINANCE",
            "FUNNY_STORIES",
            "LOVE_STORIES",
            "KIDS_SONGS",
            "ABSURD_PROCESS"
          ],
          "description": "Optional content niche; see autoshort_list_niches."
        },
        "duration": {
          "type": "number",
          "enum": [
            5,
            8,
            15,
            30,
            60,
            90
          ],
          "description": "Target length in seconds (default 30). 15/30/60/90 = multi-scene faceless video; 5 and 8 make a very short video on the same pipeline and price."
        },
        "artStyle": {
          "type": "string",
          "enum": [
            "AUTOSHORTS",
            "LEGO",
            "COMIC_BOOK",
            "DISNEY_TOON",
            "STUDIO_GHIBLI",
            "PIXEL_ART",
            "WATERCOLOR",
            "OIL_PAINTING",
            "CYBERPUNK",
            "FANTASY",
            "ANIME",
            "STICKMAN"
          ],
          "description": "Optional art style; default AUTOSHORTS."
        },
        "language": {
          "type": "string",
          "description": "Optional BCP-47 code (e.g. \"en\", \"vi\"). Defaults to \"auto\"."
        },
        "quality": {
          "type": "string",
          "enum": [
            "HD_720",
            "FULL_HD_1080"
          ],
          "description": "Output resolution. Omit for the plan's resolution; asking for more than the plan renders returns 403 QUALITY_NOT_IN_PLAN."
        },
        "image_urls": {
          "type": "array",
          "minItems": 1,
          "maxItems": 6,
          "items": {
            "type": "string",
            "format": "uri",
            "maxLength": 2048
          },
          "description": "Optional. The user's OWN images to use as the first scenes: image 1 = scene 1, image 2 = scene 2, and so on; the remaining scenes are generated as usual. https URLs only, up to 6 per call, JPEG/PNG/WebP, each at most 10 MB and 25 megapixels; at most 30 images per hour per account. Animated WebP uses its first frame; GIF and SVG are rejected. AutoShort downloads each image once, strips EXIF/GPS, re-encodes it and serves it from its own domain (your URL is never linked into the video). Fast (FFMPEG) multi-scene videos only. The answer states how many images were used and for which scenes; more images than scenes is refused, never silently dropped. Only send images the user owns or may use; each is shown as a still with a slow zoom and is never animated or used to generate a person."
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and creates nothing."
        }
      },
      "required": [
        "topic"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Generate a video from a topic"
    }
  },
  {
    "name": "autoshort_generate_chat_video",
    "title": "Generate a video from a creative brief",
    "description": "Create a video from a natural-language creative brief; AutoShort writes the script from it. To keep an agreed script word for word with your own shots, use autoshort_draft_video instead. To use the user's own pictures (\"make a video with these images\"), pass image_urls (public https links, up to 6): image 1 becomes scene 1, image 2 scene 2, …; the rest are generated. Naming an image inside the brief does NOT attach it: only image_urls do. If the brief points at a picture you did not pass, the answer carries warnings[\"IMAGE_IGNORED\"] with a warningText (read it to the user), or CHAT_NO_IMAGE_INPUT (retry with image_urls, or proceedWithoutImage: true). Optional captionSecondaryLanguage adds a translated second caption line under the narration captions (e.g. \"vi\" for English narration with Vietnamese under it); \"none\" turns it off for this video even if the account default has one; omitted = the account default (off unless the user set one). It costs nothing extra. Costs 40 credits with the default voice (+25 if ElevenLabs narrates); images do not change the price. Rendering is asynchronous: poll autoshort_get_video every 20-30 seconds until status is COMPLETED or FAILED. If get_video returns blockedReason, stop polling and act on it (e.g. top up credits). ROUTING: if the user pasted a cinematic / video-model prompt (camera, lens, lighting, a scene description), do NOT use this tool: it writes its own script and makes narrated still-image scenes. Use autoshort_generate_motion_clip, which sends the prompt as written. Use this tool for narrated stories and facts. videoProvider VEO_3_1_OPERATOR is operator-fulfilled and not guaranteed: it does not turn a prompt into a moving clip.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "message": {
          "type": "string",
          "minLength": 3,
          "maxLength": 4000,
          "description": "Creative brief describing the desired video."
        },
        "videoProvider": {
          "type": "string",
          "enum": [
            "FFMPEG",
            "VEO_3_1_OPERATOR"
          ],
          "description": "FFMPEG for fast multi-scene video; VEO_3_1_OPERATOR for cinematic quality when eligible."
        },
        "artStyle": {
          "type": "string",
          "description": "Art style returned by autoshort_list_niches."
        },
        "aspectRatio": {
          "type": "string",
          "enum": [
            "9:16",
            "1:1",
            "16:9"
          ]
        },
        "language": {
          "type": "string",
          "enum": [
            "en",
            "es",
            "pt",
            "fr",
            "de",
            "it",
            "id",
            "tr",
            "vi"
          ],
          "description": "Narration language. Omit to detect it from the brief."
        },
        "targetDuration": {
          "type": "integer",
          "minimum": 8,
          "maximum": 90,
          "description": "Length in seconds. With image_urls and no targetDuration, 30 is used (6 scenes) so every image has a scene."
        },
        "captionSecondaryLanguage": {
          "type": "string",
          "enum": [
            "en",
            "ar",
            "bg",
            "cs",
            "zh",
            "da",
            "nl",
            "et",
            "fi",
            "fr",
            "de",
            "el",
            "hi",
            "hu",
            "id",
            "it",
            "ja",
            "ko",
            "ms",
            "no",
            "fa",
            "pl",
            "pt",
            "ru",
            "es",
            "sv",
            "tl",
            "th",
            "tr",
            "uk",
            "vi",
            "none"
          ],
          "description": "Second caption line language (translated, shown under the narration captions). \"none\" = no second line for this video. Omit to use the account default. Same language as the narration = ignored."
        },
        "image_urls": {
          "type": "array",
          "minItems": 1,
          "maxItems": 6,
          "items": {
            "type": "string",
            "format": "uri",
            "maxLength": 2048
          },
          "description": "Optional. The user's OWN images to use as the first scenes: image 1 = scene 1, image 2 = scene 2, and so on; the remaining scenes are generated as usual. https URLs only, up to 6 per call, JPEG/PNG/WebP, each at most 10 MB and 25 megapixels; at most 30 images per hour per account. Animated WebP uses its first frame; GIF and SVG are rejected. AutoShort downloads each image once, strips EXIF/GPS, re-encodes it and serves it from its own domain (your URL is never linked into the video). Fast (FFMPEG) multi-scene videos only. The answer states how many images were used and for which scenes; more images than scenes is refused, never silently dropped. Only send images the user owns or may use; each is shown as a still with a slow zoom and is never animated or used to generate a person."
        },
        "proceedWithoutImage": {
          "type": "boolean",
          "description": "Set true to create the video from the text even though the brief points at an image you did not pass in image_urls. Without it, a brief that clearly hands over a file (\"the photo I attached\", an image URL) is refused with CHAT_NO_IMAGE_INPUT before anything is charged; a softer mention creates the video and returns warnings: [\"IMAGE_IGNORED\"] + warningText."
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and creates nothing."
        }
      },
      "required": [
        "message"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Generate a video from a creative brief"
    }
  },
  {
    "name": "autoshort_generate_product_ad",
    "title": "Generate a product ad from a page",
    "description": "Create a product marketing video from a public product page. AutoShort extracts product details and images, writes the ad, and creates editable scenes. Costs at least 40 credits; the exact quote is checked before the page is fetched. Rendering is asynchronous: poll autoshort_get_video every 20-30 seconds until status is COMPLETED or FAILED. If get_video returns blockedReason, stop polling and act on it (e.g. top up credits).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "format": "uri",
          "description": "Public product page URL."
        },
        "language": {
          "type": "string",
          "description": "Output language, or auto."
        },
        "artStyle": {
          "type": "string",
          "description": "Art style returned by autoshort_list_niches."
        },
        "duration": {
          "type": "integer",
          "minimum": 15,
          "maximum": 90
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and creates nothing."
        }
      },
      "required": [
        "url"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Generate a product ad from a page"
    }
  },
  {
    "name": "autoshort_generate_image_to_video",
    "title": "Animate one image into a clip",
    "description": "Animate ONE reference image into a silent 5-second AI-generated video (for a multi-scene video built from several of the user's pictures, use image_urls on autoshort_generate_chat_video instead). Send the image as image_url (a public https link, JPEG/PNG/WebP, at most 10 MB) or as imageBase64; the stdio package also accepts a local imagePath and uploads it. The photo becomes the first frame of the clip. ACCEPTED: products, pets, scenery, food, illustrations, and cartoon, anime or other clearly stylised characters (not realistic people, whether real or AI-generated). REJECTED before anything is charged: photos of real people (any realistic human face, to prevent deepfakes), sexual content, anything that may show a child; the answer says why. Only send images the user owns or may use. Costs 100 credits (20 credits per second x 5 s), charged the moment the job is accepted (not on delivery). Any plan with enough credits; a never-paid account gets one AI clip until its first payment. Rendering is automatic (OpenRouter Seedance 2.0 Mini, 480p, no audio): ready in up to about 13 minutes, typically less (not yet measured), so poll autoshort_get_video every 20-30 seconds. If the clip cannot be made (for example the video provider refuses the image on content-policy grounds) the video ends FAILED with the specific reason and the credits are refunded automatically; if it does not come back, check autoshort_get_credit_balance and report a missing refund. The result is labelled AI-generated (aiGenerated: true); keep that label when posting. Retry-safe: the same image + motionPrompt returns the first job (duplicate: true) for 24 hours instead of charging again; pass idempotencyKey to force a separate clip from identical inputs. To turn a TEXT prompt into a moving clip automatically (no photo, no human operator), use autoshort_generate_motion_clip instead.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "image_url": {
          "type": "string",
          "format": "uri",
          "maxLength": 2048,
          "description": "Public https link to the JPG, PNG or WebP image (≤10MB). Alternative to imageBase64; send one of the two."
        },
        "imageBase64": {
          "type": "string",
          "maxLength": 13981030,
          "description": "The JPG, PNG or WebP file (≤10MB), base64-encoded. Alternative to image_url."
        },
        "imageFileName": {
          "type": "string",
          "maxLength": 200,
          "description": "Optional original file name."
        },
        "motionPrompt": {
          "type": "string",
          "minLength": 3,
          "maxLength": 1000,
          "description": "Motion, camera and scene direction."
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200
        }
      },
      "required": [
        "motionPrompt"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Animate one image into a clip"
    }
  },
  {
    "name": "autoshort_get_video",
    "title": "Get a video",
    "description": "Get one video's status and details by id. While rendering, status is PENDING/GENERATING_*/RENDERING with estimatedCompletionTime. A PENDING video that cannot render returns blockedReason (e.g. INSUFFICIENT_CREDITS) with creditsNeeded, creditsAvailable and topUpUrl: stop polling and resolve it. COMPLETED returns a playable videoUrl; FAILED returns error. Free. Motion clips (autoshort_generate_motion_clip) also return motionClip{promptSent, seed, resolution, seconds, credits}, and on failure errorCode and creditsRefunded.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Video id (a director draftId works too). Every create tool returns it as `id` (also as `videoId`)."
        },
        "videoId": {
          "type": "string",
          "description": "Alias of `id`: the name the create tools use in their answer. Send either one."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get a video"
    }
  },
  {
    "name": "autoshort_list_videos",
    "title": "List videos",
    "description": "List your videos, newest first, with pagination and an optional status filter (PENDING, GENERATING_SCRIPT, GENERATING_VOICE, FETCHING_MEDIA, RENDERING, COMPLETED, FAILED, DRAFT). Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "description": "Max results (default 20)."
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "description": "Pagination offset (default 0)."
        },
        "status": {
          "type": "string",
          "enum": [
            "PENDING",
            "GENERATING_SCRIPT",
            "GENERATING_VOICE",
            "FETCHING_MEDIA",
            "RENDERING",
            "COMPLETED",
            "FAILED",
            "DRAFT"
          ]
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "List videos"
    }
  },
  {
    "name": "autoshort_list_niches",
    "title": "List niches, styles and durations",
    "description": "List the content niches, art styles, video qualities and durations the generation tools accept. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "List niches, styles and durations"
    }
  },
  {
    "name": "autoshort_get_credit_balance",
    "title": "Get credit balance",
    "description": "Your current credit balance, monthly allocation, bonus credits and plan. Requires the \"credits:read\" scope (default in new keys). Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get credit balance"
    }
  },
  {
    "name": "autoshort_get_usage_stats",
    "title": "Get API usage statistics",
    "description": "API usage statistics: credit balance, API call counts (today/total) and recent credit transactions. Requires the \"usage:read\" scope. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get API usage statistics"
    }
  },
  {
    "name": "autoshort_get_subscription",
    "title": "Get subscription plan",
    "description": "Your subscription plan, status and credit allocation. Requires the \"billing:read\" scope. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get subscription plan"
    }
  },
  {
    "name": "autoshort_ugc_upload_recording",
    "title": "Upload a screen recording for UGC",
    "description": "Upload the app screen recording for Silent UGC and get its recordingAssetId (for autoshort_ugc_create_campaign). Pass recordingUrl (a public https link — fetched by AutoShort, not by you; up to 50 MB) or recordingBase64 (at most 10 MB; larger files must use recordingUrl). MP4 or MOV, 3-60 seconds, at most 50 MB, checked from the file itself. The stdio package also accepts a local recordingPath. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "recordingUrl": {
          "type": "string",
          "maxLength": 2000,
          "description": "Public https URL of the MP4/MOV (redirects are followed and re-checked)."
        },
        "recordingBase64": {
          "type": "string",
          "maxLength": 13981078,
          "description": "The MP4/MOV file, base64-encoded, at most 10 MB."
        },
        "fileName": {
          "type": "string",
          "maxLength": 200
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Upload a screen recording for UGC"
    }
  },
  {
    "name": "autoshort_list_social_accounts",
    "title": "List connected social accounts",
    "description": "List the connected publishing accounts per platform (YouTube, TikTok, Facebook Page, Instagram, Threads) with username, whether they need reconnecting, the publish mode, the AI-disclosure handling and today's platform limits. Never returns tokens. For a platform that is not connected, call autoshort_get_connection_status to get a one-click connectUrl. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "List connected social accounts"
    }
  },
  {
    "name": "autoshort_get_connection_status",
    "title": "Check a platform connection",
    "description": "Is this platform connected? If yes, returns the account. If not, returns connectUrl: a short, single-use link (expires in 15 minutes) that opens the platform's consent screen directly. Give it to the user — that consent is the only human step, once per platform — then call this again every 10 seconds (pollAfterSeconds) until connected is true and continue on your own. Polling reuses the same unexpired link. YouTube, Facebook, Instagram and Threads need a paid plan; Facebook/Instagram/Threads answer PLATFORM_PENDING_APPROVAL where Meta has not enabled them for the account yet. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "platform": {
          "type": "string",
          "enum": [
            "YOUTUBE",
            "TIKTOK",
            "FACEBOOK",
            "INSTAGRAM",
            "THREADS"
          ]
        }
      },
      "required": [
        "platform"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Check a platform connection"
    }
  },
  {
    "name": "autoshort_publish_video",
    "title": "Publish a completed video",
    "description": "Publish one of the user's COMPLETED videos. YOUTUBE: uploads to the connected channel with your title/description and privacy (public, unlisted, private); the \"altered or synthetic content\" disclosure is always set; madeForKids is the user's COPPA answer (ask them for a kids audience); nothing is appended to the description unless addAttribution is true (default false — only when the user asked for \"Made with AutoShort\"). TIKTOK: sends the video to the creator's TikTok Drafts (inbox) — they add the caption, switch on the AI-generated label and post in the app; pass userConsent: true only after the user agreed. FACEBOOK / INSTAGRAM / THREADS: publishes publicly as a Facebook Page Reel, an Instagram Reel or a Threads video with your caption (or a default one); #AIGenerated is always added. Meta processes the video for a minute or more: the first call answers QUEUED, call again with the same arguments to read the status (POSTED with the url). A FAILED publish is retried only with retry: true. Idempotent per (videoId, platform): a repeat returns the first result and never posts twice. Respects platform caps (YouTube ≈5 uploads/day; TikTok's pending-drafts limit; Facebook 25, Instagram 25, Threads 50 posts/day). Not connected → NOT_CONNECTED with a connectUrl. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "videoId": {
          "type": "string"
        },
        "platform": {
          "type": "string",
          "enum": [
            "YOUTUBE",
            "TIKTOK",
            "FACEBOOK",
            "INSTAGRAM",
            "THREADS"
          ]
        },
        "title": {
          "type": "string",
          "maxLength": 100,
          "description": "YouTube title (cleaned and cut to 60 characters on a word). Defaults to the video title."
        },
        "description": {
          "type": "string",
          "maxLength": 4900,
          "description": "YouTube description. #Shorts is added if missing."
        },
        "privacy": {
          "type": "string",
          "enum": [
            "public",
            "unlisted",
            "private"
          ],
          "description": "YouTube visibility (default public)."
        },
        "madeForKids": {
          "type": "boolean",
          "description": "YouTube COPPA declaration. Omit to use the series answer, or the niche default (false except KIDS_SONGS)."
        },
        "addAttribution": {
          "type": "boolean",
          "description": "YouTube only. Append \"Made with AutoShort\", a link to autoshort.org and #AutoShort to the description. Default false: set true ONLY if the user explicitly asked for it."
        },
        "userConsent": {
          "type": "boolean",
          "description": "TikTok only: the user agreed to send this video to their TikTok drafts."
        },
        "caption": {
          "type": "string",
          "maxLength": 5000,
          "description": "Facebook/Instagram/Threads caption (Threads ≤500, Instagram ≤2,200 characters and 30 hashtags). Defaults to the video title and topic hashtags."
        },
        "retry": {
          "type": "boolean",
          "description": "Facebook/Instagram/Threads only: publish again after a FAILED attempt (nothing was posted)."
        }
      },
      "required": [
        "videoId",
        "platform"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Publish a completed video"
    }
  },
  {
    "name": "autoshort_list_series",
    "title": "List series",
    "description": "List the user's series (autopilot channels), newest first, with schedule, auto-post flags, brief and video count. Paginated (page, limit). Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "minimum": 1
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "List series"
    }
  },
  {
    "name": "autoshort_create_series",
    "title": "Create a series",
    "description": "Create a series: AutoShort makes a video on this niche and brief every scheduleIntervalDays, and can auto-post it. Creating or changing a series is FREE. While active, the scheduler makes one video every scheduleIntervalDays (the first at its next run, within about 30 minutes) and charges each video like any video, at render — only when the balance covers it; a short balance skips that run, it never fails or overdraws. A series created or resumed through this connection counts each scheduled video against this key's daily agent spending cap (autoshort_get_limits); over the cap, that day's run is skipped. brief is what the generator writes from (topics, facts, tone) — put the user's own words here. Set startPaused: true to create it without generating yet (resume with autoshort_resume_series). Auto-post needs the platform connected (autoshort_get_connection_status); TikTok auto-post goes to Drafts.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "niche": {
          "type": "string",
          "enum": [
            "MOTIVATIONAL",
            "SCARY_STORIES",
            "AI_FACTS",
            "HISTORY_FACTS",
            "REDDIT_STORIES",
            "LIFE_HACKS",
            "CRYPTO_FINANCE",
            "PSYCHOLOGY_FACTS",
            "PERSONAL_FINANCE",
            "FUNNY_STORIES",
            "LOVE_STORIES",
            "AI_MUSIC_COVERS",
            "KIDS_SONGS",
            "ABSURD_PROCESS"
          ]
        },
        "brief": {
          "type": "string",
          "maxLength": 10000,
          "description": "What every video in this series is about — the generator writes from this."
        },
        "language": {
          "type": "string",
          "maxLength": 10,
          "description": "BCP-47 narration language, or \"auto\" (default)."
        },
        "scheduleIntervalDays": {
          "type": "integer",
          "minimum": 1,
          "maximum": 30,
          "description": "One video every N days (default 1)."
        },
        "defaultDuration": {
          "type": "integer",
          "enum": [
            10,
            60,
            90
          ],
          "description": "Seconds per video; 90 needs a paid plan."
        },
        "quality": {
          "type": "string",
          "enum": [
            "HD_720",
            "FULL_HD_1080"
          ]
        },
        "voiceId": {
          "type": "string",
          "maxLength": 200,
          "description": "A voice id from autoshort_list_options (premium voices cost extra per video)."
        },
        "autoPostYouTube": {
          "type": "boolean"
        },
        "autoPostTikTok": {
          "type": "boolean",
          "description": "Sends each video to the creator's TikTok Drafts."
        },
        "madeForKids": {
          "type": "boolean",
          "description": "COPPA answer for YouTube uploads from this series. Ask the user."
        },
        "motionMixLevel": {
          "type": "string",
          "enum": [
            "NONE",
            "HOOK",
            "HIGHLIGHTS",
            "CINEMATIC"
          ],
          "description": "AI motion: some scenes of every video are animated with Seedance, the rest stay images; each video is still a complete multi-scene video with voice and captions, never a single clip. Default NONE. Price per video at 30 s: NONE 40 credits per video; HOOK up to 140 credits per video (1 animated scene); HIGHLIGHTS up to 340 credits per video (3 animated scenes); CINEMATIC up to 540 credits per video (5 animated scenes). Animated scenes whose clip cannot start fall back to stills and are not charged. Accounts that have not paid yet can use only NONE or HOOK. If a run cannot afford or start the chosen level it makes the normal NONE video instead."
        },
        "startPaused": {
          "type": "boolean",
          "description": "Create without generating until resumed."
        }
      },
      "required": [
        "name",
        "niche"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Create a series"
    }
  },
  {
    "name": "autoshort_update_series",
    "title": "Edit a series",
    "description": "Change a series: name, brief, schedule, auto-post flags, the madeForKids answer or the AI motion level (motionMixLevel). Only the fields you pass change. Creating or changing a series is FREE. While active, the scheduler makes one video every scheduleIntervalDays (the first at its next run, within about 30 minutes) and charges each video like any video, at render — only when the balance covers it; a short balance skips that run, it never fails or overdraws. A series created or resumed through this connection counts each scheduled video against this key's daily agent spending cap (autoshort_get_limits); over the cap, that day's run is skipped.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "description": "Series id (or slug)."
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "brief": {
          "type": "string",
          "maxLength": 10000
        },
        "scheduleIntervalDays": {
          "type": "integer",
          "minimum": 1,
          "maximum": 30
        },
        "autoPostYouTube": {
          "type": "boolean"
        },
        "autoPostTikTok": {
          "type": "boolean"
        },
        "autoPostFacebook": {
          "type": "boolean",
          "description": "Publish each new video as a Reel on the connected Facebook Page."
        },
        "autoPostInstagram": {
          "type": "boolean",
          "description": "Publish each new video as a Reel on the connected Instagram account."
        },
        "autoPostThreads": {
          "type": "boolean",
          "description": "Publish each new video on the connected Threads profile."
        },
        "madeForKids": {
          "type": "boolean"
        },
        "motionMixLevel": {
          "type": "string",
          "enum": [
            "NONE",
            "HOOK",
            "HIGHLIGHTS",
            "CINEMATIC"
          ],
          "description": "AI motion: some scenes of every video are animated with Seedance, the rest stay images; each video is still a complete multi-scene video with voice and captions, never a single clip. Default NONE. Price per video at 30 s: NONE 40 credits per video; HOOK up to 140 credits per video (1 animated scene); HIGHLIGHTS up to 340 credits per video (3 animated scenes); CINEMATIC up to 540 credits per video (5 animated scenes). Animated scenes whose clip cannot start fall back to stills and are not charged. Accounts that have not paid yet can use only NONE or HOOK. If a run cannot afford or start the chosen level it makes the normal NONE video instead."
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Edit a series"
    }
  },
  {
    "name": "autoshort_pause_series",
    "title": "Pause a series",
    "description": "Pause a series: the scheduler stops making (and charging for) its videos until resumed. Videos already made are untouched. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string"
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Pause a series"
    }
  },
  {
    "name": "autoshort_resume_series",
    "title": "Resume a series",
    "description": "Resume a paused series. Creating or changing a series is FREE. While active, the scheduler makes one video every scheduleIntervalDays (the first at its next run, within about 30 minutes) and charges each video like any video, at render — only when the balance covers it; a short balance skips that run, it never fails or overdraws. A series created or resumed through this connection counts each scheduled video against this key's daily agent spending cap (autoshort_get_limits); over the cap, that day's run is skipped.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string"
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Resume a series"
    }
  },
  {
    "name": "autoshort_create_webhook",
    "title": "Create a webhook",
    "description": "Register an https URL to receive a signed POST when any of the user's videos reaches COMPLETED (video.completed) or FAILED (video.failed), within about a minute — instead of polling. Returns the signing secret ONCE: verify X-Webhook-Signature = hex HMAC-SHA256(raw body, secret). The URL must be public (private/internal addresses are refused). Max 10 per account. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "maxLength": 2000,
          "description": "https:// endpoint."
        },
        "events": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "video.completed",
              "video.failed",
              "*"
            ]
          },
          "description": "Default both video events."
        },
        "description": {
          "type": "string",
          "maxLength": 200
        }
      },
      "required": [
        "url"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Create a webhook"
    }
  },
  {
    "name": "autoshort_list_webhooks",
    "title": "List webhooks",
    "description": "List the registered webhooks (URL, events, active, last delivery, failures). Secrets are not shown. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "List webhooks"
    }
  },
  {
    "name": "autoshort_delete_webhook",
    "title": "Delete a webhook",
    "description": "Delete a webhook; deliveries to it stop immediately. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "webhookId": {
          "type": "string"
        }
      },
      "required": [
        "webhookId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Delete a webhook"
    }
  },
  {
    "name": "autoshort_list_options",
    "title": "List options and prices",
    "description": "Every option and price the tools accept, from the live constants: voices for a language (premium flag + extra credits), art styles (PRO flag), niches, caption themes, aspect ratios, the durations each tool allows, video providers for the plan, motion-clip / hero-scene prices — and for each, which tool lets you choose it. Use it instead of guessing an enum. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "language": {
          "type": "string",
          "maxLength": 10,
          "description": "Voice language (default \"en\")."
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "List options and prices"
    }
  },
  {
    "name": "autoshort_cancel_video",
    "title": "Cancel a video that has not started rendering",
    "description": "Cancel a video that has NOT started rendering (status PENDING or DRAFT) and refund whatever it was charged, through the credit ledger (net of earlier refunds — never twice). Refused once rendering has started (CANNOT_CANCEL_STARTED) and for operator-fulfilled clips. A cancelled video never renders later. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "videoId": {
          "type": "string"
        }
      },
      "required": [
        "videoId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Cancel a video that has not started rendering"
    }
  },
  {
    "name": "autoshort_get_limits",
    "title": "Get spending and rate limits",
    "description": "Everything that can stop a call: credit balance, this key's daily agent spending cap (spent / remaining / reset), auto-recharge status and monthly cap, platform publishing limits, and per-hour caps on free AI calls. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get spending and rate limits"
    }
  },
  {
    "name": "autoshort_set_limits",
    "title": "Set the daily agent spending cap",
    "description": "Set this key's daily agent spending cap in credits. Lowering (or keeping) it applies immediately. Raising it returns approvalUrl: the account owner must open it while signed in and approve — an agent cannot raise its own cap. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "dailyCreditCap": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100000
        }
      },
      "required": [
        "dailyCreditCap"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Set the daily agent spending cap"
    }
  },
  {
    "name": "autoshort_estimate_cost",
    "title": "Estimate the cost of a call",
    "description": "Price a paid call BEFORE making it: pass {tool, arguments} — the tool name and the exact arguments you would send (or just {draftId} to price autoshort_render_draft). Returns the most credits it can commit, the balance it needs, whether the balance and this key's daily cap cover it, and when it is charged. Nothing is created or charged. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "tool": {
          "type": "string",
          "description": "e.g. autoshort_generate_video, autoshort_render_draft, autoshort_ugc_render_batch"
        },
        "arguments": {
          "type": "object",
          "description": "The arguments you would pass to that tool."
        },
        "draftId": {
          "type": "string",
          "description": "Shortcut: price autoshort_render_draft for this draft (same as {tool: \"autoshort_render_draft\", arguments: {draftId}})."
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Estimate the cost of a call"
    }
  },
  {
    "name": "autoshort_get_buy_credits_url",
    "title": "Get a checkout link for credits or a plan",
    "description": "A checkout link to buy credits (pack) or start a plan (plan, 3-day trial) on Whop — for the human to open and pay once. No email or personal data is in the link. Packs: MICRO, STARTER, VALUE, MEGA. For a new customer, EPISODE is the first episode pack: 350 credits, enough for one 12-second Character Studio drama episode. AI-generated video. Credits do not expire while your account is active. One-time purchase, no renewal. First purchase 50% off the regular $6.99. A new account's first video can be free, in the web app or through autoshort_render_draft when the account has no credits (one watermarked video per person, a daily cap of 20 shared by all accounts; not available through direct REST calls with an API key), then EPISODE at $3.49 on a first purchase is the next step. After they pay, poll autoshort_get_credit_balance. If the owner enabled auto-recharge, use autoshort_buy_credits instead (no link). Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "pack": {
          "type": "string",
          "enum": [
            "MICRO",
            "STARTER",
            "VALUE",
            "MEGA",
            "EPISODE"
          ],
          "description": "One-time credit pack."
        },
        "plan": {
          "type": "string",
          "enum": [
            "STARTER",
            "PRO",
            "BUSINESS"
          ],
          "description": "Monthly plan (instead of a pack)."
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get a checkout link for credits or a plan"
    }
  },
  {
    "name": "autoshort_setup_auto_recharge",
    "title": "Propose auto-recharge",
    "description": "Propose auto-recharge so later purchases need no link: a pack and a monthly USD cap. Returns approvalUrl — the owner signs in, confirms exactly that pack and cap, and saves a card on Whop (nothing is charged then). Tell the user the pack price and the cap before sending the link. Until they finish, nothing changes. Cap: pack price to $500/month. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "pack": {
          "type": "string",
          "enum": [
            "MICRO",
            "STARTER",
            "VALUE",
            "MEGA"
          ]
        },
        "monthlyCapUsd": {
          "type": "number",
          "minimum": 1,
          "maximum": 500
        }
      },
      "required": [
        "pack",
        "monthlyCapUsd"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Propose auto-recharge"
    }
  },
  {
    "name": "autoshort_buy_credits",
    "title": "Buy the approved credit pack",
    "description": "Buy the owner-approved credit pack on their saved card, off-session — only when auto-recharge is ACTIVE and only within its monthly cap. Idempotent: the same idempotencyKey never charges twice. Returns 202 while Whop processes it; poll autoshort_get_credit_balance. Without auto-recharge use autoshort_get_buy_credits_url.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "A new unique key per purchase; reuse it only to retry the same purchase."
        }
      },
      "required": [
        "idempotencyKey"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Buy the approved credit pack"
    }
  },
  {
    "name": "autoshort_disable_auto_recharge",
    "title": "Turn off auto-recharge",
    "description": "Turn auto-recharge off immediately; autoshort_buy_credits stops charging. Turning it back on needs the owner's approval again. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Turn off auto-recharge"
    }
  },
  {
    "name": "autoshort_list_templates",
    "title": "List video templates",
    "description": "List 12 ready-made video templates (kind \"video\": history facts, scary stories, motivation, personal finance education, kids music, product ad, small-business explainer, character mini-episode and more) and 26 AI motion clip templates (kind \"motion\": single-shot prompts for landscapes, macro food, animals, products, abstract loops, city nights, weather, miniatures, fantasy scenery and short-drama beats in thriller, comedy, horror, romance, action, epic and drama; the clips are silent, and any person is only a silhouette, seen from behind or as hands, never a face or a child). A video template has the full prompt, length, credit price and the exact arguments for autoshort_generate_chat_video. A motion template has the full prompt, genre, a six-slot breakdown (camera, subject, action, setting, style, lighting: each phrase is literally in the prompt), a one-line why, seconds, credits, a demoVideoUrl when a sample clip exists, and the arguments for autoshort_generate_motion_clip (pass its id as templateId, or edit the prompt and pass it as prompt). 6 short-drama episode scripts (kind \"episode\", 12-60 s multi-shot episodes for Character Studio; listed only with kind \"episode\" or an id) carry a script, logline and cliffhanger. An episode is only made as one of the episodes of a reviewed, confirmed season plan: add it to a plan with autoshort_save_season_plan (at least 3 episodes, the cast, the narrator voice and the style), review and confirm it, then autoshort_quote_character_episode prices it for free. Edit any prompt first (swap the topic, shop name or facts). Pass kind \"video\", \"motion\" or \"episode\", id for one template, genre (drama, thriller, comedy, horror, romance, action, epic, nature, product, fantasy) to filter motion and episode templates, or niche (video templates) to filter. Nothing is created or charged; show the user the price before you generate. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "enum": [
            "history-lost-library",
            "scary-lighthouse",
            "motivation-small-steps",
            "finance-compound-interest",
            "kids-counting-song",
            "product-ad-candle",
            "explainer-bike-shop",
            "character-paper-fox-episode",
            "psychology-procrastination",
            "lifehacks-small-kitchen",
            "funny-cat-vacuum",
            "facts-venus-hotter-than-mercury",
            "misty-mountain-sunrise",
            "forest-waterfall-slow-tilt",
            "espresso-pour-macro",
            "honey-drip-macro",
            "fox-in-snow",
            "koi-pond-ripples",
            "sneaker-orbit-studio",
            "perfume-bottle-light",
            "liquid-paint-swirl",
            "rainy-neon-street",
            "skyline-timelapse-dusk",
            "thunderstorm-over-fields",
            "tiny-diorama-train",
            "floating-islands-fantasy",
            "lighthouse-lantern-relights",
            "paper-boats-gutter-race",
            "robot-waits-bus-stop-rain",
            "old-key-opens-wrong-room",
            "train-bridge-two-silhouettes",
            "rooftop-chase-paper-silhouettes",
            "dune-rider-dawn",
            "two-cups-one-empty-chair",
            "empty-elevator-opens",
            "cat-rides-robot-vacuum",
            "rocking-chair-attic",
            "two-umbrellas-crosswalk",
            "last-train-torn-ticket",
            "third-floor-light",
            "the-last-cookie-heist",
            "voicemail-from-my-own-number",
            "page-forty-one",
            "harbor-last-ferry"
          ],
          "description": "Return just this template."
        },
        "kind": {
          "type": "string",
          "enum": [
            "video",
            "motion",
            "episode"
          ],
          "description": "video = Chat to Video templates, motion = AI motion clip templates, episode = short-drama scripts for a season plan (autoshort_save_season_plan; only returned when asked for with kind \"episode\" or id). Default: video and motion."
        },
        "genre": {
          "type": "string",
          "enum": [
            "drama",
            "thriller",
            "comedy",
            "horror",
            "romance",
            "action",
            "epic",
            "nature",
            "product",
            "fantasy"
          ],
          "description": "Only motion and episode templates of this genre (episode scripts exist for drama, thriller, comedy, horror and romance)."
        },
        "niche": {
          "type": "string",
          "enum": [
            "HISTORY_FACTS",
            "SCARY_STORIES",
            "MOTIVATIONAL",
            "PERSONAL_FINANCE",
            "KIDS_SONGS",
            "PSYCHOLOGY_FACTS",
            "LIFE_HACKS",
            "FUNNY_STORIES",
            "AI_FACTS"
          ],
          "description": "Only templates for this niche (see autoshort_list_niches)."
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "List video templates"
    }
  },
  {
    "name": "autoshort_get_series_performance",
    "title": "Get series performance",
    "description": "How YOUR OWN posted YouTube Shorts performed, per series: videos posted/measured, total/median/mean views, top 3 and bottom 3 videos (with outlierScore = views / series median), and views gained in the last 7 days vs the 7 days before. Use it to decide what to make next: repeat the formats of the best videos, drop the worst. Only your own videos; views come from daily YouTube snapshots; audience retention is not available. Free, read-only.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "One series id (from autoshort_list_series). Omit for every series with posted videos."
        },
        "days": {
          "type": "integer",
          "minimum": 1,
          "maximum": 90,
          "description": "Only videos created in the last N days (default 30)."
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Get series performance"
    }
  },
  {
    "name": "autoshort_generate_motion_clip",
    "title": "Generate an AI motion clip",
    "description": "Turn a text-to-video prompt into ONE AI motion clip (Seedance 2.0). The prompt is sent EXACTLY as written: no script is written, no still images are made, no voice is added, nothing is rewritten or shortened. USE THIS TOOL when the user pastes or asks for a cinematic / video-model prompt (camera moves, lens, lighting, a scene description, \"9:16 vertical\", \"slow dolly-in\", the kind ChatGPT or Claude writes for Seedance, Sora or Veo). For a narrated story or facts video use autoshort_generate_chat_video. The clip is silent (no audio, no lip-sync, no talking), 4-12 seconds (default 5), resolution 480p (default 480p; higher resolutions need a higher plan: PLAN_TIER_LOCKED). Price: 20 credits per second, so 5 s = 100 credits and 12 s = 240; call autoshort_quote_video first and tell the user the price before creating. The credits are held when the clip is accepted and returned in full if no clip comes back. The only text added to the prompt is a short server suffix (\"No spoken dialogue, no lip-sync, no talking to camera, no watermark.\"); the answer echoes promptSent and the seed so the user can see and repeat exactly what was made. Not accepted (CONTENT_POLICY, nothing charged): real or famous people, minors, sexual content, protected characters or brands, deepfakes and lip-sync. A first-frame photo is not supported yet. Optional character_id: the id of one of YOUR character sheets (autoshort_get_character_sheet); the clip then starts from that sheet's chosen image, so the first frame shows your character. The character can still drift while it moves; it is not a guarantee of an identical face. A sheet that is not yours or not ready is CHARACTER_NOT_FOUND (nothing charged). Same price. Optional templateId: one of the 26 ready clip templates from autoshort_list_templates (kind \"motion\"); its prompt, seconds and aspect ratio are used. If you also pass prompt, the prompt wins and the template is ignored. An unknown templateId is refused (INVALID_INPUT, nothing charged). Trial accounts get up to 10 clips of up to 5 s each (MOTION_TRIAL_LIMIT); at most 2 clips run at once; a daily capacity limit applies (DAILY_CAP_REACHED). Rendering is asynchronous: poll autoshort_get_video every 20 seconds until COMPLETED (videoUrl is an MP4) or FAILED (errorCode, creditsRefunded). Pass idempotencyKey so a retry never charges twice.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "prompt": {
          "type": "string",
          "minLength": 8,
          "maxLength": 2000,
          "description": "The video prompt, exactly as the user wrote or pasted it (8-2000 characters). Do not summarise, translate or \"improve\" it: it is sent to the video model unchanged. Required unless templateId is given."
        },
        "templateId": {
          "type": "string",
          "enum": [
            "misty-mountain-sunrise",
            "forest-waterfall-slow-tilt",
            "espresso-pour-macro",
            "honey-drip-macro",
            "fox-in-snow",
            "koi-pond-ripples",
            "sneaker-orbit-studio",
            "perfume-bottle-light",
            "liquid-paint-swirl",
            "rainy-neon-street",
            "skyline-timelapse-dusk",
            "thunderstorm-over-fields",
            "tiny-diorama-train",
            "floating-islands-fantasy",
            "lighthouse-lantern-relights",
            "paper-boats-gutter-race",
            "robot-waits-bus-stop-rain",
            "old-key-opens-wrong-room",
            "train-bridge-two-silhouettes",
            "rooftop-chase-paper-silhouettes",
            "dune-rider-dawn",
            "two-cups-one-empty-chair",
            "empty-elevator-opens",
            "cat-rides-robot-vacuum",
            "rocking-chair-attic",
            "two-umbrellas-crosswalk"
          ],
          "description": "Optional. The id of a motion clip template (autoshort_list_templates, kind \"motion\"): its ready-made prompt is sent as written. Ignored when prompt is also given."
        },
        "duration": {
          "type": "integer",
          "minimum": 4,
          "maximum": 12,
          "description": "Clip length in whole seconds (default 5). Trial accounts: at most 5."
        },
        "resolution": {
          "type": "string",
          "enum": [
            "480p"
          ],
          "description": "Output resolution (default 480p). Higher ones cost more credits per second and need a higher plan."
        },
        "aspect_ratio": {
          "type": "string",
          "enum": [
            "9:16",
            "1:1",
            "16:9"
          ],
          "description": "Frame shape (default 9:16, vertical)."
        },
        "seed": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295,
          "description": "Optional. The answer always returns the seed used; pass it again to ask for a similar take (the provider treats it as best effort)."
        },
        "character_id": {
          "type": "string",
          "minLength": 8,
          "maxLength": 64,
          "description": "Optional. The id of one of your own READY character sheets: the clip starts from that sheet's chosen image. Describe the motion in the prompt."
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and charges nothing."
        }
      },
      "required": [],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Generate an AI motion clip"
    }
  },
  {
    "name": "autoshort_quote_video",
    "title": "Quote the credit price of a video",
    "description": "The exact credit price of a video BEFORE it is made. Read-only: nothing is created, reserved or charged. Tell the user the price, then call the creating tool. mode \"motion_clip\": one moving clip from a prompt (autoshort_generate_motion_clip), by duration and resolution; also says whether this account can start it now (canStart, blockedBy). mode \"stills\": a normal narrated video made of still images (autoshort_generate_chat_video, or tool \"autoshort_generate_video\"). Also returns the balance, whether it covers the price, and this key's remaining daily spending cap. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "mode": {
          "type": "string",
          "enum": [
            "stills",
            "motion_clip"
          ],
          "description": "What to price."
        },
        "duration": {
          "type": "number",
          "description": "Seconds: the clip length (motion_clip, 4-12) or the video length (stills, 8-90)."
        },
        "resolution": {
          "type": "string",
          "enum": [
            "480p"
          ],
          "description": "motion_clip only: the default is 480p."
        },
        "aspect_ratio": {
          "type": "string",
          "enum": [
            "9:16",
            "1:1",
            "16:9"
          ]
        },
        "tool": {
          "type": "string",
          "enum": [
            "autoshort_generate_chat_video",
            "autoshort_generate_video"
          ],
          "description": "stills only: which tool to price (default autoshort_generate_chat_video)."
        }
      },
      "required": [
        "mode"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Quote the credit price of a video"
    }
  },
  {
    "name": "autoshort_get_character_sheet",
    "title": "Read character sheets",
    "description": "Read the character sheets of one of your series: each sheet is a set of AI images of one fictional character, its images (id, view, url), which sheet and which image are chosen, how many sheets the series may still make (3 in total), and the exact price of a new sheet (21 credits for 5 images of a person, 10 for an animal or mascot). Free. Use this before autoshort_create_character_sheet and tell the user the price.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "A series id from autoshort_list_series."
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Read character sheets"
    }
  },
  {
    "name": "autoshort_create_character_sheet",
    "title": "Create a character sheet",
    "description": "Make a character sheet for one of your series: 4-6 AI images (default 5: front portrait, full body, side, two expressions) of ONE fictional character, from a text description. Price: 21 credits for 5 images of a person, 10 for an animal or mascot; call autoshort_get_character_sheet first and tell the user. Credits are taken when it starts and returned in full if no sheet comes back. If a non-primary view (full body, side, an expression) could not be made in time, the sheet still comes back with the images that exist (the answer says partial: true and lists missingViews) and only those images are charged: the difference is returned and creditsCharged shows what was kept. For a person the face is carried from the front portrait into the other views; the outfit follows the description and can drift a little. For an animal or mascot the views share one description and seed, so they look alike but are not guaranteed to be identical. Usually under a minute; the answer already contains the images (a slow image model fails the call and returns the credits). Not accepted (CONTENT_POLICY, nothing charged): real or famous people, children or anyone who looks under 18, sexual content, logos or protected characters. Characters must be fictional and clearly adult (or an animal / mascot). A series can hold 3 sheets in total; the first sheet is chosen automatically. Pass idempotencyKey so a retry never charges twice.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "A series id from autoshort_list_series."
        },
        "subjectKind": {
          "type": "string",
          "enum": [
            "PERSON",
            "ANIMAL",
            "MASCOT"
          ],
          "description": "PERSON (fictional adult, default), ANIMAL (pet) or MASCOT."
        },
        "description": {
          "type": "string",
          "minLength": 8,
          "maxLength": 400,
          "description": "The character's look: age band, hair, outfit, colours. Omit to use the series' saved character description."
        },
        "imageCount": {
          "type": "integer",
          "minimum": 4,
          "maximum": 6,
          "description": "Images in the sheet (default 5)."
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and charges nothing."
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Create a character sheet"
    }
  },
  {
    "name": "autoshort_select_character_image",
    "title": "Choose the series character image",
    "description": "Choose which character sheet a series uses and which of its images is the main one. The main image is what autoshort_generate_motion_clip starts from when you pass character_id (the sheet id). Only your own READY sheets and their images can be chosen. Free.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64
        },
        "sheetId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "A sheet id from autoshort_get_character_sheet."
        },
        "assetId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "An image id of that sheet to make the main image. Omit to keep the current main image."
        }
      },
      "required": [
        "seriesId",
        "sheetId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Choose the series character image"
    }
  },
  {
    "name": "autoshort_get_season_plan",
    "title": "Read a season plan",
    "description": "Read the season plan of one of your series: the plan (logline, genre, narrator voice, language, style, cast with outfits, every episode), its hash, its status (none, saved, reviewed or confirmed) and the recorded season review (a checklist with pass or fail per rule, the season price and, if it ran, the AI review). Free. An episode can only be made from a plan that is reviewed and confirmed: use this to see where the plan stands and which episodes can be quoted.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "A series id from autoshort_list_series."
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Read a season plan"
    }
  },
  {
    "name": "autoshort_save_season_plan",
    "title": "Save a season plan",
    "description": "Design, review and confirm the WHOLE season of a series before any episode is made. Free (no credits). Founder rules: a series is fully designed and reviewed before any video is produced, and its characters, voice and style are fixed in every episode. Three steps, one tool: (1) pass `plan` to save it (version 1: logline, genre, language, narratorVoiceId, styleTokens, characters[] with look, sheetId and wardrobeLock, rules[], at least 3 episodes[] with title, characterName, cliffhangerLine and shots[] or a script). Every edit clears the review and the confirmation. (2) pass `review: true` (with or without `plan`) to run the season review: a deterministic checklist (cliffhangers, hooks, one narrator and style, no on-screen text, one subject per look and per shot, outfit locked, season price) plus an advisory AI review that lists up to 8 concrete issues; if the AI review cannot run the answer says so and the checklist stands. (3) show the owner the checklist, the AI issues and the season price, and ONLY after they say yes call again with `confirm: true` and `planHash` from the review. Every character an episode uses needs a READY sheet of this series (autoshort_create_character_sheet, one sheet per character) whose id is in the plan. Then autoshort_quote_character_episode / autoshort_create_character_episode make the planned episodes.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "A series id from autoshort_list_series."
        },
        "plan": {
          "type": "object",
          "description": "The whole season plan. Omit to review or confirm the stored one.",
          "properties": {
            "version": {
              "type": "integer",
              "enum": [
                1
              ]
            },
            "title": {
              "type": "string",
              "maxLength": 80
            },
            "logline": {
              "type": "string",
              "minLength": 10,
              "maxLength": 300
            },
            "genre": {
              "type": "string",
              "enum": [
                "drama",
                "thriller",
                "comedy",
                "horror",
                "romance"
              ]
            },
            "language": {
              "type": "string",
              "maxLength": 12,
              "description": "The narration language of every episode: 'en', 'vi'... (never auto)."
            },
            "narratorVoiceId": {
              "type": "string",
              "minLength": 3,
              "maxLength": 64,
              "description": "The narrator of every episode: an ElevenLabs voice id or a Google voice name such as en-US-Chirp3-HD-Aoede."
            },
            "styleTokens": {
              "type": "string",
              "minLength": 3,
              "maxLength": 160,
              "description": "One short phrase appended to every shot prompt, e.g. \"cinematic, moody teal light, 35mm film\"."
            },
            "characters": {
              "type": "array",
              "minItems": 1,
              "maxItems": 6,
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "maxLength": 40
                  },
                  "role": {
                    "type": "string",
                    "maxLength": 120
                  },
                  "look": {
                    "type": "string",
                    "minLength": 8,
                    "maxLength": 400,
                    "description": "ONE character: age band, hair, outfit, one prop. Never two characters in one look."
                  },
                  "sheetId": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "The READY character sheet of THIS series that plays this character."
                  },
                  "wardrobeLock": {
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 200,
                    "description": "The outfit, identical in every episode (\"natural fur, no clothes\" for an animal)."
                  },
                  "expressionRule": {
                    "type": "string",
                    "maxLength": 200
                  }
                },
                "required": [
                  "name",
                  "look",
                  "wardrobeLock"
                ],
                "additionalProperties": false
              }
            },
            "rules": {
              "type": "array",
              "maxItems": 16,
              "items": {
                "type": "string",
                "maxLength": 300
              }
            },
            "episodes": {
              "type": "array",
              "minItems": 1,
              "maxItems": 12,
              "items": {
                "type": "object",
                "properties": {
                  "n": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 12
                  },
                  "title": {
                    "type": "string",
                    "maxLength": 80
                  },
                  "logline": {
                    "type": "string",
                    "maxLength": 300
                  },
                  "characterName": {
                    "type": "string",
                    "maxLength": 40,
                    "description": "The ONE character of the cast this episode stars."
                  },
                  "cliffhangerLine": {
                    "type": "string",
                    "maxLength": 200,
                    "description": "The LAST spoken sentence of every episode but the last."
                  },
                  "shots": {
                    "type": "array",
                    "minItems": 3,
                    "maxItems": 8,
                    "items": {
                      "type": "object",
                      "properties": {
                        "narration": {
                          "type": "string",
                          "maxLength": 600,
                          "description": "What the narrator says over this shot."
                        },
                        "action": {
                          "type": "string",
                          "maxLength": 300,
                          "description": "What the viewer sees: ONE character, one action. Never on-screen text."
                        },
                        "camera": {
                          "type": "string",
                          "maxLength": 120,
                          "description": "Camera: shot size and one move."
                        }
                      },
                      "required": [
                        "narration"
                      ],
                      "additionalProperties": false
                    },
                    "description": "Shots you write. Give `shots` OR `script`."
                  },
                  "script": {
                    "type": "string",
                    "maxLength": 2400,
                    "description": "The narration the system splits into shots. Give `script` OR `shots`."
                  }
                },
                "required": [
                  "n",
                  "title",
                  "characterName",
                  "cliffhangerLine"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": [
            "version",
            "logline",
            "genre",
            "language",
            "narratorVoiceId",
            "styleTokens",
            "characters",
            "episodes"
          ],
          "additionalProperties": false
        },
        "review": {
          "type": "boolean",
          "description": "Run the season review on the stored plan (after saving `plan` if given)."
        },
        "aiReview": {
          "type": "boolean",
          "description": "With review: also run the advisory AI review (default true)."
        },
        "confirm": {
          "type": "boolean",
          "description": "The owner confirms the reviewed plan. Needs planHash; do not send `plan` in the same call."
        },
        "planHash": {
          "type": "string",
          "minLength": 64,
          "maxLength": 64,
          "description": "With confirm: the planHash the review returned."
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": true,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Save a season plan"
    }
  },
  {
    "name": "autoshort_quote_character_episode",
    "title": "Quote a character episode",
    "description": "Price one PLANNED episode (12-60 seconds, 3-8 shots) of a series with a confirmed season plan, starring the character the plan names. FREE: it spends nothing and starts nothing. Returns the shot plan (narration, action, camera and seconds of every shot), the exact credits (clips are Seedance at the per-second rate of the chosen resolution: 480p by default, 720p only when quote.pricePerResolution lists it as available, plus a still per shot and the narration), and a ready-made nextAction for autoshort_create_character_episode. Show the customer the price and the shots, and call the create tool only after they say yes. The same safety checks as the real call run here: real or famous people, anyone who looks under 18, sexual content and protected characters are refused with CONTENT_POLICY. Only an episode of a REVIEWED, CONFIRMED season plan can be quoted or made: send its script or shots exactly as planned (autoshort_get_season_plan). Without a confirmed plan the answer is SEASON_PLAN_REQUIRED or SEASON_NOT_REVIEWED, and for shots that are not a planned episode EPISODE_NOT_IN_PLAN, each with a nextAction. The narrator voice, the language, the style and the character come from the plan and cannot be overridden (SEASON_FIELD_LOCKED); to change an episode, edit the plan (that clears the review).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "A series id from autoshort_list_series whose season plan is reviewed and confirmed."
        },
        "sheetId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "Omit it: the character sheet is the one the season plan names for this episode. If given it must equal that sheet."
        },
        "script": {
          "type": "string",
          "minLength": 60,
          "maxLength": 2400,
          "description": "The narration, about 29-138 words. The system splits it into shots by sentence. Give `script` OR `shots`."
        },
        "shots": {
          "type": "array",
          "minItems": 3,
          "maxItems": 8,
          "description": "Shots you write yourself (better pictures than the automatic split). Give `shots` OR `script`.",
          "items": {
            "type": "object",
            "properties": {
              "narration": {
                "type": "string",
                "maxLength": 600,
                "description": "What the narrator says over this shot (at most about 29 words)."
              },
              "action": {
                "type": "string",
                "maxLength": 300,
                "description": "What the viewer sees the character doing. Omit to illustrate the narration."
              },
              "camera": {
                "type": "string",
                "maxLength": 120,
                "description": "Camera: wide shot, close-up, push-in, over-the-shoulder... Omit for an automatic choice."
              }
            },
            "required": [
              "narration"
            ],
            "additionalProperties": false
          }
        },
        "shotCount": {
          "type": "integer",
          "minimum": 3,
          "maximum": 8,
          "description": "With `script`: how many shots to split it into. Omit for an automatic count."
        },
        "title": {
          "type": "string",
          "maxLength": 80,
          "description": "Optional title."
        },
        "language": {
          "type": "string",
          "maxLength": 12,
          "description": "Omit it: the narration language is the season plan's. If given it must equal the plan's."
        },
        "resolution": {
          "type": "string",
          "enum": [
            "480p",
            "720p"
          ],
          "description": "Clip resolution. Default '480p'. '720p' costs more per second (see quote.pricePerResolution) and is only accepted when it is listed as available there; the quote and the create must use the same resolution."
        }
      },
      "required": [
        "seriesId"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false,
      "title": "Quote a character episode"
    }
  },
  {
    "name": "autoshort_create_character_episode",
    "title": "Create a character episode",
    "description": "Make the episode: 3-8 shots, 12-60 seconds, the same fictional character in every shot, narrated with captions. CHARGES credits. The series must have a REVIEWED, CONFIRMED season plan and the episode must be one of its episodes exactly as planned (SEASON_PLAN_REQUIRED / SEASON_NOT_REVIEWED / EPISODE_NOT_IN_PLAN otherwise, with a nextAction, nothing charged); the narrator voice, language, style, look and outfit come from the plan. ALWAYS call autoshort_quote_character_episode first and get the customer yes: this call refuses unless `confirm` is true and `expectedCredits` equals the quoted price (a changed price answers 409 and charges nothing). Credits are held when it starts. A shot that cannot be animated keeps a still image and its clip credits go back; if too few shots move, or anything else fails, everything goes back. Takes about 10-25 minutes: poll autoshort_get_video with arguments { id: <the returned id / videoId> } (or use a webhook); it reports status, stage and, when COMPLETED, videoUrl. Pass idempotencyKey so a retry never charges twice. One episode at a time per account, 3 per day.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "seriesId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "A series id from autoshort_list_series whose season plan is reviewed and confirmed."
        },
        "sheetId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 64,
          "description": "Omit it: the character sheet is the one the season plan names for this episode. If given it must equal that sheet."
        },
        "script": {
          "type": "string",
          "minLength": 60,
          "maxLength": 2400,
          "description": "The narration, about 29-138 words. The system splits it into shots by sentence. Give `script` OR `shots`."
        },
        "shots": {
          "type": "array",
          "minItems": 3,
          "maxItems": 8,
          "description": "Shots you write yourself (better pictures than the automatic split). Give `shots` OR `script`.",
          "items": {
            "type": "object",
            "properties": {
              "narration": {
                "type": "string",
                "maxLength": 600,
                "description": "What the narrator says over this shot (at most about 29 words)."
              },
              "action": {
                "type": "string",
                "maxLength": 300,
                "description": "What the viewer sees the character doing. Omit to illustrate the narration."
              },
              "camera": {
                "type": "string",
                "maxLength": 120,
                "description": "Camera: wide shot, close-up, push-in, over-the-shoulder... Omit for an automatic choice."
              }
            },
            "required": [
              "narration"
            ],
            "additionalProperties": false
          }
        },
        "shotCount": {
          "type": "integer",
          "minimum": 3,
          "maximum": 8,
          "description": "With `script`: how many shots to split it into. Omit for an automatic count."
        },
        "title": {
          "type": "string",
          "maxLength": 80,
          "description": "Optional title."
        },
        "language": {
          "type": "string",
          "maxLength": 12,
          "description": "Omit it: the narration language is the season plan's. If given it must equal the plan's."
        },
        "resolution": {
          "type": "string",
          "enum": [
            "480p",
            "720p"
          ],
          "description": "Clip resolution. Default '480p'. '720p' costs more per second (see quote.pricePerResolution) and is only accepted when it is listed as available there; the quote and the create must use the same resolution."
        },
        "confirm": {
          "type": "boolean",
          "enum": [
            true
          ],
          "description": "Must be true: making an episode spends credits."
        },
        "expectedCredits": {
          "type": "integer",
          "minimum": 1,
          "description": "The credits the quote showed. Must match the current price."
        },
        "caption_secondary_language": {
          "type": "string",
          "maxLength": 12,
          "description": "Optional second caption line: a translated line under the caption, in this language code such as 'vi' or 'en'. 'none' for no second line. Omit to follow the series, then the account default (off unless set). No extra charge."
        },
        "idempotencyKey": {
          "type": "string",
          "minLength": 8,
          "maxLength": 200,
          "description": "Retry-safe: a repeat with the same key returns the first answer (replayed: true) and charges nothing."
        }
      },
      "required": [
        "seriesId",
        "confirm",
        "expectedCredits"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true,
      "title": "Create a character episode"
    }
  },
  {
    "name": "autoshort_plan_drama_season",
    "title": "Plan a drama season",
    "description": "Drama Studio writers room: turn a one-line premise into a short-drama season: a character bible (1-4 original fictional characters: name, role, look) and 2-8 episode scripts, each with a title, a logline, a script and a \"cliffhangerLine\". The cliffhanger is SPOKEN: the script's last sentence is exactly \"cliffhangerLine\" (an open hook for every episode but the last; a payoff plus one lingering question for the last), the first sentence is a hook and the next episode picks the hook up. Each script is already sized to pass autoshort_quote_character_episode (12-60 seconds of narration); an episode that could not be made to fit comes back with needsEditing: true and the exact limit in `issue`. FREE: it spends no credits, starts nothing and saves nothing (it is limited per hour). Characters are always original fictional adults, animals, robots or mascots; real people, brands and sexual or graphic content are refused. Next steps: autoshort_create_series (paused) with the main character as characterDescription, autoshort_create_character_sheet, then autoshort_save_season_plan (the whole season: cast, voice, style, every episode), review it, get the customer's yes and confirm it; only then autoshort_quote_character_episode and autoshort_create_character_episode per episode.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "premise": {
          "type": "string",
          "minLength": 20,
          "maxLength": 600,
          "description": "The story in one to three sentences: who, what they want, what goes wrong."
        },
        "genre": {
          "type": "string",
          "enum": [
            "drama",
            "thriller",
            "comedy",
            "horror",
            "romance"
          ],
          "description": "drama, thriller, comedy, horror or romance."
        },
        "episodes": {
          "type": "integer",
          "minimum": 2,
          "maximum": 8,
          "description": "How many episodes."
        },
        "language": {
          "type": "string",
          "maxLength": 12,
          "description": "Language code of the scripts, such as 'en' or 'vi'. Default 'en'."
        }
      },
      "required": [
        "premise",
        "genre",
        "episodes"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true,
      "title": "Plan a drama season"
    }
  }
];
