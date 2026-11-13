/**
 * Values the AutoShort API accepts or charges, as this package advertises them to agents.
 *
 * This package is published on its own and cannot import the app, so these are copies.
 * Each copy is pinned to its source by src/lib/__tests__/mcp-stdio-catalog-sync.test.ts in
 * the app (VideoStatus enum, MOTION_LANGUAGE_CODES, CHAT_MESSAGE_MAX_CHARS, FEATURE_COSTS,
 * VideoQuality). Change the source and that test names the line to change here. Hand-typed
 * values are how the tools came to offer status GENERATING (rejected by the API), languages
 * en/vi only (the API speaks nine) and "40-150 credits" (an API video costs 65).
 */

/** Prisma VideoStatus, in schema order. */
export const VIDEO_STATUSES = [
  'PENDING',
  'GENERATING_SCRIPT',
  'GENERATING_VOICE',
  'FETCHING_MEDIA',
  'RENDERING',
  'COMPLETED',
  'FAILED',
  'DRAFT',
] as const;

/** MOTION_LANGUAGE_CODES: what POST /api/videos/chat honours as an explicit language. */
export const CHAT_VIDEO_LANGUAGES = ['en', 'es', 'pt', 'fr', 'de', 'it', 'id', 'tr', 'vi'] as const;

/** CHAT_MESSAGE_MAX_CHARS. */
export const CHAT_MESSAGE_MAX_CHARS = 4000;

/** Prisma VideoQuality. */
export const VIDEO_QUALITIES = ['HD_720', 'FULL_HD_1080'] as const;

/** FEATURE_COSTS.video_standard and FEATURE_COSTS.voice_over_premium. */
export const CREDIT_COSTS = {
  videoStandard: 40,
  elevenLabsVoice: 25,
} as const;

/** Every /api/v1 video is narrated by ElevenLabs, so the render gate asks for both. */
export const API_VIDEO_CREDITS = CREDIT_COSTS.videoStandard + CREDIT_COSTS.elevenLabsVoice;

export const API_VIDEO_COST_TEXT =
  `Costs ${API_VIDEO_CREDITS} credits (${CREDIT_COSTS.videoStandard} render + ` +
  `${CREDIT_COSTS.elevenLabsVoice} ElevenLabs voice); art style does not change the price.`;

export const POLL_HINT =
  'Rendering is asynchronous: poll autoshort_get_video every 20-30 seconds until status is COMPLETED or FAILED. ' +
  'If get_video returns blockedReason, stop polling and act on it (e.g. top up credits).';

/**
 * FEATURE_COSTS.video_image_motion.
 *
 * Hand-copied like every other number here, and this one is the figure an agent budgets
 * against BEFORE it spends: image-to-video is the only tool whose endpoint charges at submit.
 * Pinned to the app constant by src/lib/__tests__/mcp-stdio-catalog-sync.test.ts.
 */
export const IMAGE_TO_VIDEO_CREDITS = 40;

/**
 * No refund promise here, deliberately.
 *
 * This used to say the credits are "refunded if the clip is never produced". That is not an
 * invariant the pipeline holds. The operator-timeout path in cron/process-videos does call
 * refundIfChargedForFailedVideo, and so does the admin refuse route and, since the refund-failed-videos
 * cron, cron/retry-stuck-videos' permanentlyStuck sweep. One case can still end FAILED with money
 * taken for a while: that helper's own `refund-failed` outcome, retried by the refund-failed-videos
 * cron every 15 minutes and paged to Bugsly on the third failure.
 *
 * A longer list was checked and NARROWED: admin/videos is a GET-only dashboard whose
 * `status: "FAILED"` occurrences are `where` filters, admin/videos/[id]/operator refunds
 * BEFORE calling failVideo, and videos/[id]/render cannot reach its unrefunded FAILED write
 * for these rows at all — that write is gated on `claimedByRequest` while every
 * VEO_3_1_OPERATOR row returns ~230 lines earlier. Two real cases, not five.
 *
 * So the usual case refunds and the edges do not, which makes "it is refunded" a promise we
 * cannot keep. Say what is true and name the check instead, so an agent that was charged for
 * nothing can find out.
 */
export const IMAGE_TO_VIDEO_COST_TEXT =
  `Costs ${IMAGE_TO_VIDEO_CREDITS} credits, and unlike every other tool here it is charged ` +
  'the moment the job is accepted, not when the clip is delivered. A failed clip is normally ' +
  'refunded automatically, but that is not guaranteed on every failure path: if the video ends ' +
  'FAILED, check autoshort_get_credit_balance and report a missing refund rather than assuming it.';

/**
 * What an agent gets from image-to-video since 2026-10-19: an AUTOMATIC render (OpenRouter Seedance,
 * the image as the first frame) - no human operator for customers. Real people's faces are refused
 * (deepfake protection) before anything is charged. The refund wording stays hedged for the reason
 * in IMAGE_TO_VIDEO_COST_TEXT above.
 */
export const OPERATOR_MODE_WARNING =
  'Rendering is automatic (an AI video model animates the image; ready in up to about 13 minutes, ' +
  'typically less). Accepted images: products, pets, scenery, illustrations, clearly stylised cartoon ' +
  'characters. Realistic people (real or AI-generated), sexual content or anything that may show a child are refused ' +
  'before any charge, with the reason. If the clip cannot be made (for example the provider refuses ' +
  'the image on content-policy grounds) the video FAILS with that reason and the charge is normally ' +
  'refunded automatically. The clip is AI-generated: keep that label when posting.';

/**
 * Image-to-video dedupes on a requestId this package derives from the image bytes and the
 * motion prompt — not on an Idempotency-Key header. The id carries no time component on
 * purpose; the 24h bound is a continuous window on the server's lookup, so no two
 * near-simultaneous retries can fall on different sides of it.
 */
export const IMAGE_TO_VIDEO_IDEMPOTENCY_HINT =
  'Retry-safe: re-calling with the same image and motionPrompt returns the first job ' +
  '(duplicate: true) for 24 hours instead of charging again. If that attempt FAILED, a retry ' +
  'refunds the dead attempt first and then makes a new clip, so one clip is never billed ' +
  'twice — whatever its age. In the one case where the old credits cannot be returned you get ' +
  '409 STRANDED_CHARGE with the videoId and no new charge: report it, do not loop. Pass ' +
  'idempotencyKey to force a separate clip from identical inputs.';
