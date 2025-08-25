/**
 * @fileOverview Zod schemas and TypeScript types for review-related AI flows.
 */

import {z} from 'genkit';

// Input schema for generating a review reply
export const GenerateReviewReplyInputSchema = z.object({
  reviewText: z.string().describe('The customer review text.'),
  rating: z.number().min(1).max(5).describe('The star rating given by the customer (1-5).'),
  brandTone: z.enum(['Professional', 'Friendly', 'Humorous']).default('Friendly').describe("The brand's desired tone of voice."),
  brandSOP: z.string().optional().describe("The brand's standard operating procedures for replies (e.g., 'Offer a discount on the next visit for negative reviews.')"),
});
export type GenerateReviewReplyInput = z.infer<typeof GenerateReviewReplyInputSchema>;

// Output schema for a generated review reply
export const GenerateReviewReplyOutputSchema = z.object({
  suggestedReply: z.string().describe('The AI-generated reply to the customer review.'),
});
export type GenerateReviewReplyOutput = z.infer<typeof GenerateReviewReplyOutputSchema>;
