/** Video object from API */
export interface Video {
  id: string;
  title: string;
  slug: string | null;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  targetDuration: number | null;
  language: string | null;
  artStyle: string;
  createdAt: string;
  updatedAt: string;
}


/** Credit balance response */
export interface CreditBalance {
  balance: number;
  monthlyAllocation: number;
  bonusCredits: number;
  plan: string;
}

/** Subscription status response */
export interface SubscriptionStatus {
  plan: string;
  hasActiveSubscription: boolean;
  videosUsed: number;
  videosLimit: number;
  credits: { balance: number; monthlyAllocation: number; lastResetAt: string | null };
}

/** Usage stats response */
export interface UsageStats {
  credits: { balance: number; monthlyAllocation: number };
  apiCalls: { today: number; total: number };
  recentTransactions: Array<{
    id: string; type: string; amount: number; balance: number;
    feature: string | null; createdAt: string;
  }>;
}

/** Niche/art style option */
export interface EnumOption {
  value: string;
  label: string;
}

/** Rate limit info from API response headers */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
}

/** API error response */
export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}
