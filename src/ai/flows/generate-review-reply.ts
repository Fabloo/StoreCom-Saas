'use server';
/**
 * @fileOverview An AI flow for generating a reply to a customer review, considering brand-specific tone and SOPs.
 *
 * This file exports:
 * - `generateReviewReply`: The main function to generate a reply.
 */

import {ai} from '@/ai/genkit';
import { GenerateReviewReplyInput, GenerateReviewReplyInputSchema, GenerateReviewReplyOutput, GenerateReviewReplyOutputSchema } from '../schemas/review-schemas';


// Define the main function that calls the flow
export async function generateReviewReply(input: GenerateReviewReplyInput): Promise<GenerateReviewReplyOutput> {
  return generateReviewReplyFlow(input);
}

// Define the prompt
const generateReviewReplyPrompt = ai.definePrompt({
  name: 'generateReviewReplyPrompt',
  input: {schema: GenerateReviewReplyInputSchema},
  output: {schema: GenerateReviewReplyOutputSchema},
  prompt: `You are a helpful and empathetic customer service manager. Your task is to write a reply to a customer review.

  Your reply must adhere to the following brand guidelines:
  - Tone of Voice: {{brandTone}}
  {{#if brandSOP}}- Standard Operating Procedures: {{brandSOP}}{{/if}}

  Customer Review: "{{reviewText}}"
  Star Rating: {{rating}} / 5

  General Instructions (unless overridden by SOP):
  - If the rating is 3 or less, the reply should be apologetic, acknowledge the specific issues mentioned, and offer to make things right. Do not sound defensive.
  - If the rating is 4 or 5, the reply should be thankful, warm, and welcoming. Mention something specific from their review if possible.
  - Keep the reply concise and professional, while matching the brand tone.
  - Sign off as "The Management".
  `,
});

// Define the flow
const generateReviewReplyFlow = ai.defineFlow(
  {
    name: 'generateReviewReplyFlow',
    inputSchema: GenerateReviewReplyInputSchema,
    outputSchema: GenerateReviewReplyOutputSchema,
  },
  async input => {
    const {output} = await generateReviewReplyPrompt(input);
    return output!;
  }
);
