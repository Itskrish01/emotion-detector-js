/**
 * Base error class for EmotionAnalyzer errors
 */
export class EmotionAnalyzerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmotionAnalyzerError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    const ErrorWithCapture = Error as typeof Error & { 
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void 
    };
    if (typeof ErrorWithCapture.captureStackTrace === 'function') {
      ErrorWithCapture.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when the API rate limit is exceeded (HTTP 429)
 */
export class RateLimitError extends EmotionAnalyzerError {
  /** HTTP status code (429) */
  public readonly statusCode: number = 429;
  /** Time in seconds until the rate limit resets (if provided by API) */
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded. Please wait before making more requests.', retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends EmotionAnalyzerError {
  /** The field that failed validation */
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Error thrown when the API returns an error response
 */
export class ApiError extends EmotionAnalyzerError {
  /** HTTP status code from the API response */
  public readonly statusCode: number;
  /** Raw response body from the API */
  public readonly responseBody?: string;

  constructor(message: string, statusCode: number, responseBody?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Error thrown when the request times out
 */
export class TimeoutError extends EmotionAnalyzerError {
  /** Timeout duration in milliseconds */
  public readonly timeout: number;

  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Error thrown when there's a network error
 */
export class NetworkError extends EmotionAnalyzerError {
  /** Original error that caused the network failure */
  public readonly cause?: Error;

  constructor(message: string = 'Network error occurred', cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}
