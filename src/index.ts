// Main entry point - exports all public API

export { EmotionAnalyzer } from './client';

export {
  EmotionAnalyzerError,
  RateLimitError,
  ValidationError,
  ApiError,
  TimeoutError,
  NetworkError,
} from './errors';

export type {
  EmotionScore,
  EmotionResult,
  BatchEmotionResult,
  EmotionAnalyzerOptions,
  ApiAnalyzeResponse,
  ApiBatchResponse,
  ApiErrorResponse,
} from './types';
