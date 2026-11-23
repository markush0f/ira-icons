/** Shared request and response contracts for the studio and Gemini service. */
export type IconStyle = 'original' | 'minimalist' | 'animated';
export type GenerationStage = 'original' | 'variants';
export interface IconBrief {
  description: string;
  style: IconStyle;
}
export interface IconVariants {
  original: string;
  minimalist: string;
  animated: string;
}
export interface GenerationResponse {
  error?: string;
  svg?: string;
  original?: unknown[];
  variants?: IconVariants;
}
