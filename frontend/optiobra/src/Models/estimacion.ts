export interface EstimacionIA {
  success: boolean;
  report?: string;
  model?: string;
  duration_ms?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  error?: string;
  message?: string;
}