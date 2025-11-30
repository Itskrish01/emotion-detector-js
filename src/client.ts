import {
  EmotionAnalyzerOptions,
  EmotionResult,
  BatchEmotionResult,
  ApiAnalyzeResponse,
  ApiBatchResponse,
  ApiErrorResponse,
} from './types';

import {
  EmotionAnalyzerError,
  RateLimitError,
  ValidationError,
  ApiError,
  TimeoutError,
  NetworkError,
} from './errors';

/** Default API base URL */
const DEFAULT_BASE_URL = 'https://itsKrish01-emotion-checker.hf.space';

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT = 30000;

/** Maximum words allowed per text */
const MAX_WORDS_PER_TEXT = 100;

/** Maximum texts allowed in batch request */
const MAX_BATCH_SIZE = 10;

/**
 * Count words in a text string
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Transform API response to normalized EmotionResult
 */
function transformResponse(response: ApiAnalyzeResponse): EmotionResult {
  return {
    primaryEmotion: response.primary_emotion,
    confidence: response.confidence,
    allEmotions: response.all_emotions,
  };
}

/**
 * EmotionAnalyzer client for the Emotion Tone Analyzer API
 * 
 * @example
 * ```typescript
 * import { EmotionAnalyzer } from 'emotion-detector-js';
 * 
 * const analyzer = new EmotionAnalyzer();
 * 
 * // Single analysis
 * const result = await analyzer.analyze("I'm so happy today!");
 * console.log(result.primaryEmotion); // "joy"
 * console.log(result.confidence); // 0.95
 * 
 * // Batch analysis
 * const results = await analyzer.analyzeBatch([
 *   "I'm excited!",
 *   "This is terrible."
 * ]);
 * ```
 */
export class EmotionAnalyzer {
  private readonly baseUrl: string;
  private readonly timeout: number;

  /**
   * Create a new EmotionAnalyzer instance
   * 
   * @param options - Configuration options
   * @param options.baseUrl - Custom base URL for self-hosted instances
   * @param options.timeout - Request timeout in milliseconds (default: 30000)
   */
  constructor(options: EmotionAnalyzerOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Validate text for single analysis
   */
  private validateText(text: string): void {
    if (!text || typeof text !== 'string') {
      throw new ValidationError('Text is required and must be a string', 'text');
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      throw new ValidationError('Text cannot be empty', 'text');
    }

    const wordCount = countWords(trimmedText);
    if (wordCount > MAX_WORDS_PER_TEXT) {
      throw new ValidationError(
        `Text exceeds maximum word limit. Got ${wordCount} words, maximum is ${MAX_WORDS_PER_TEXT}`,
        'text'
      );
    }
  }

  /**
   * Validate texts for batch analysis
   */
  private validateBatchTexts(texts: string[]): void {
    if (!Array.isArray(texts)) {
      throw new ValidationError('Texts must be an array', 'texts');
    }

    if (texts.length === 0) {
      throw new ValidationError('At least one text is required', 'texts');
    }

    if (texts.length > MAX_BATCH_SIZE) {
      throw new ValidationError(
        `Batch size exceeds maximum limit. Got ${texts.length} texts, maximum is ${MAX_BATCH_SIZE}`,
        'texts'
      );
    }

    texts.forEach((text, index) => {
      if (!text || typeof text !== 'string') {
        throw new ValidationError(`Text at index ${index} is required and must be a string`, 'texts');
      }

      const trimmedText = text.trim();
      if (trimmedText.length === 0) {
        throw new ValidationError(`Text at index ${index} cannot be empty`, 'texts');
      }

      const wordCount = countWords(trimmedText);
      if (wordCount > MAX_WORDS_PER_TEXT) {
        throw new ValidationError(
          `Text at index ${index} exceeds maximum word limit. Got ${wordCount} words, maximum is ${MAX_WORDS_PER_TEXT}`,
          'texts'
        );
      }
    });
  }

  /**
   * Make an HTTP request with timeout support
   */
  private async request<T>(endpoint: string, body: object): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const responseText = await response.text().catch(() => '');
        
        // Handle rate limit error
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new RateLimitError(
            'Rate limit exceeded. Please wait before making more requests.',
            retryAfter ? parseInt(retryAfter, 10) : undefined
          );
        }

        // Try to parse error message from response
        let errorMessage = `API request failed with status ${response.status}`;
        try {
          const errorData: ApiErrorResponse = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch {
          // Use default error message if parsing fails
        }

        throw new ApiError(errorMessage, response.status, responseText);
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw our custom errors
      if (error instanceof EmotionAnalyzerError) {
        throw error;
      }

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(this.timeout);
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError('Failed to connect to the API. Please check your network connection.', error);
      }

      // Handle other errors
      throw new NetworkError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Analyze a single text for emotion
   * 
   * @param text - The text to analyze (max 100 words)
   * @returns The emotion analysis result
   * @throws {ValidationError} If text is invalid or exceeds word limit
   * @throws {RateLimitError} If rate limit is exceeded (30 req/min)
   * @throws {ApiError} If API returns an error
   * @throws {TimeoutError} If request times out
   * @throws {NetworkError} If network error occurs
   * 
   * @example
   * ```typescript
   * const result = await analyzer.analyze("I'm so happy today!");
   * console.log(result.primaryEmotion); // "joy"
   * console.log(result.confidence); // 0.95
   * console.log(result.allEmotions); // [{emotion: "joy", score: 0.95}, ...]
   * ```
   */
  async analyze(text: string): Promise<EmotionResult> {
    this.validateText(text);

    const response = await this.request<ApiAnalyzeResponse>('/api/v1/analyze', {
      text: text.trim(),
    });

    return transformResponse(response);
  }

  /**
   * Analyze multiple texts for emotion in a batch
   * 
   * @param texts - Array of texts to analyze (max 10 texts, 100 words each)
   * @returns The batch emotion analysis results
   * @throws {ValidationError} If texts are invalid or exceed limits
   * @throws {RateLimitError} If rate limit is exceeded (10 req/min)
   * @throws {ApiError} If API returns an error
   * @throws {TimeoutError} If request times out
   * @throws {NetworkError} If network error occurs
   * 
   * @example
   * ```typescript
   * const results = await analyzer.analyzeBatch([
   *   "I'm excited!",
   *   "This is terrible.",
   *   "I don't know what to think."
   * ]);
   * 
   * results.results.forEach((result, i) => {
   *   console.log(`Text ${i + 1}: ${result.primaryEmotion} (${result.confidence})`);
   * });
   * ```
   */
  async analyzeBatch(texts: string[]): Promise<BatchEmotionResult> {
    this.validateBatchTexts(texts);

    const response = await this.request<ApiBatchResponse>('/api/v1/analyze/batch', {
      texts: texts.map(t => t.trim()),
    });

    return {
      results: response.results.map(transformResponse),
      count: response.count,
    };
  }
}
