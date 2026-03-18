export type PostTone =
  | "neutral"
  | "excited"
  | "angry"
  | "curious"
  | "informative"
  | "unknown";

export type PostIntent =
  | "question"
  | "opinion"
  | "discussion"
  | "hiring"
  | "promotion"
  | "unknown";

export type ReplyTone =
  | "helpful"
  | "insightful"
  | "witty"
  | "empathetic"
  | "professional";

export type PlatformId = "x" | "linkedin" | "reddit";

export interface PostAnalysis {
  tone: PostTone;
  intent: PostIntent;
  topics: string[];
}

export interface ReplyValidation {
  isSafe: boolean;
  score: number;
  issues?: string[];
}
