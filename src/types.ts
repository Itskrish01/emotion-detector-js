/**
 * Emotion detection result for a single emotion
 */
export interface EmotionScore {
  /** The emotion name (e.g., "joy", "sadness", "anger") */
  emotion: string;
  /** Confidence score between 0 and 1 */
  score: number;
}

/**
 * API response for single text analysis
 */
export interface ApiAnalyzeResponse {
  primary_emotion: string;
  confidence: number;
  all_emotions: EmotionScore[];
}

/**
 * API response for batch text analysis
 */
export interface ApiBatchResponse {
  results: ApiAnalyzeResponse[];
  count: number;
}

/**
 * Normalized result for single text analysis
 */
export interface EmotionResult {
  /** The primary detected emotion */
  primaryEmotion: string;
  /** Confidence score for the primary emotion (0-1) */
  confidence: number;
  /** All detected emotions with their scores */
  allEmotions: EmotionScore[];
}

/**
 * Result for batch text analysis
 */
export interface BatchEmotionResult {
  /** Array of emotion results for each input text */
  results: EmotionResult[];
  /** Number of texts analyzed */
  count: number;
}

/**
 * Configuration options for EmotionAnalyzer
 */
export interface EmotionAnalyzerOptions {
  /** 
   * Custom base URL for self-hosted instances 
   * @default "https://itsKrish01-emotion-checker.hf.space"
   */
  baseUrl?: string;
  /** 
   * Request timeout in milliseconds 
   * @default 30000
   */
  timeout?: number;
}

/**
 * Error response from the API
 */
export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
}
