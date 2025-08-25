// This is an experimental implementation.
'use server';
/**
 * @fileOverview AI-powered SEO fix suggestion flow for microsites.
 *
 * This file exports:
 * - `suggestSeoFixes`: The main function to generate SEO fix suggestions.
 * - `SuggestSeoFixesInput`: The input type for the `suggestSeoFixes` function.
 * - `SuggestSeoFixesOutput`: The output type for the `suggestSeoFixes` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const SuggestSeoFixesInputSchema = z.object({
  title: z.string().optional().describe('The current meta title of the page.'),
  description: z.string().optional().describe('The current meta description of the page.'),
  h1: z.string().optional().describe('The current H1 heading of the page.'),
  imageAlts: z.array(z.string()).optional().describe('A list of image alt texts on the page.'),
  schema: z.array(z.string()).optional().describe('A list of schema types implemented on the page.'),
});
export type SuggestSeoFixesInput = z.infer<typeof SuggestSeoFixesInputSchema>;

// Define the output schema for the flow
const SuggestSeoFixesOutputSchema = z.object({
  suggestedTitle: z.string().describe('The AI-suggested meta title for the page.'),
  suggestedDescription: z.string().describe('The AI-suggested meta description for the page.'),
  suggestedKeywords: z.string().describe('A comma-separated list of AI-suggested keywords.'),
});
export type SuggestSeoFixesOutput = z.infer<typeof SuggestSeoFixesOutputSchema>;

// Define the main function that calls the flow
export async function suggestSeoFixes(input: SuggestSeoFixesInput): Promise<SuggestSeoFixesOutput> {
  return suggestSeoFixesFlow(input);
}

// Define the prompt
const suggestSeoFixesPrompt = ai.definePrompt({
  name: 'suggestSeoFixesPrompt',
  input: {schema: SuggestSeoFixesInputSchema},
  output: {schema: SuggestSeoFixesOutputSchema},
  prompt: `You are an expert SEO consultant reviewing a local business microsite.

  Based on the following current SEO data, provide specific, actionable suggestions for improvement.
  The goal is to improve local search visibility and click-through rates.

  Current Meta Title: "{{title}}"
  Current Meta Description: "{{description}}"
  Current H1: "{{h1}}"
  Image Alt Texts: [{{#each imageAlts}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}]
  Implemented Schema: [{{#each schema}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}]

  Your task is to generate:
  1.  An improved, SEO-optimized Meta Title (50-60 characters).
  2.  An improved, compelling Meta Description (150-160 characters).
  3.  A list of relevant, comma-separated keywords.

  Return your suggestions in the specified format.
  `,
});

// Define the flow
const suggestSeoFixesFlow = ai.defineFlow(
  {
    name: 'suggestSeoFixesFlow',
    inputSchema: SuggestSeoFixesInputSchema,
    outputSchema: SuggestSeoFixesOutputSchema,
  },
  async input => {
    const {output} = await suggestSeoFixesPrompt(input);
    return output!;
  }
);
