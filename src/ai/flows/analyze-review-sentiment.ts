'use server';
/**
 * @fileOverview An AI flow for analyzing the sentiment of a customer review.
 *
 * This file exports:
 * - `analyzeReviewSentiment`: The main function to analyze review sentiment.
 * - `AnalyzeReviewSentimentInput`: The input type for the function.
 * - `AnalyzeReviewSentimentOutput`: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const AnalyzeReviewSentimentInputSchema = z.object({
  reviewText: z.string().describe('The customer review text to be analyzed.'),
});
export type AnalyzeReviewSentimentInput = z.infer<typeof AnalyzeReviewSentimentInputSchema>;

// Define the output schema for the flow
const AnalyzeReviewSentimentOutputSchema = z.object({
  sentiment: z
    .enum(['Positive', 'Negative', 'Neutral'])
    .describe('The determined sentiment of the review.'),
});
export type AnalyzeReviewSentimentOutput = z.infer<typeof AnalyzeReviewSentimentOutputSchema>;

// Define the main function that calls the flow
export async function analyzeReviewSentiment(input: AnalyzeReviewSentimentInput): Promise<AnalyzeReviewSentimentOutput> {
  return analyzeReviewSentimentFlow(input);
}

// Define the prompt
const analyzeReviewSentimentPrompt = ai.definePrompt({
  name: 'analyzeReviewSentimentPrompt',
  input: {schema: AnalyzeReviewSentimentInputSchema},
  output: {schema: AnalyzeReviewSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following customer review. Classify it as 'Positive', 'Negative', or 'Neutral'.

  Review: "{{reviewText}}"

  Your analysis:
  `,
});

// Define the flow
const analyzeReviewSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeReviewSentimentFlow',
    inputSchema: AnalyzeReviewSentimentInputSchema,
    outputSchema: AnalyzeReviewSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeReviewSentimentPrompt(input);
    return output!;
  }
);
