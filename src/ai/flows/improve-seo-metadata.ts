// This is an experimental implementation.
'use server';
/**
 * @fileOverview AI-powered SEO metadata suggestion flow for microsites.
 *
 * This file exports:
 * - `improveSEOMetadata`: The main function to generate SEO metadata suggestions.
 * - `ImproveSEOMetadataInput`: The input type for the `improveSEOMetadata` function.
 * - `ImproveSEOMetadataOutput`: The output type for the `improveSEOMetadata` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const ImproveSEOMetadataInputSchema = z.object({
  pageContent: z
    .string()
    .describe('The content of the microsite page to improve SEO for.'),
  keywords: z.string().describe('Comma separated keywords for the page.'),
  currentTitle: z.string().optional().describe('The current meta title of the page.'),
  currentDescription: z
    .string()
    .optional()
    .describe('The current meta description of the page.'),
});
export type ImproveSEOMetadataInput = z.infer<typeof ImproveSEOMetadataInputSchema>;

// Define the output schema for the flow
const ImproveSEOMetadataOutputSchema = z.object({
  suggestedTitle: z.string().describe('The AI-suggested meta title for the page.'),
  suggestedDescription: z
    .string()
    .describe('The AI-suggested meta description for the page.'),
  suggestedKeywords: z
    .string()
    .describe('The AI-suggested keywords for the page.'),
  suggestedFaqs: z.string().describe('AI-suggested FAQs for the page.'),
});
export type ImproveSEOMetadataOutput = z.infer<typeof ImproveSEOMetadataOutputSchema>;

// Define the main function that calls the flow
export async function improveSEOMetadata(input: ImproveSEOMetadataInput): Promise<ImproveSEOMetadataOutput> {
  return improveSEOMetadataFlow(input);
}

// Define the prompt
const improveSEOMetadataPrompt = ai.definePrompt({
  name: 'improveSEOMetadataPrompt',
  input: {schema: ImproveSEOMetadataInputSchema},
  output: {schema: ImproveSEOMetadataOutputSchema},
  prompt: `You are an expert SEO consultant.

  Given the content of a microsite page, its current meta title and description, and a list of keywords, you will generate improved SEO metadata for the page. This includes a new meta title, a new meta description, a new list of comma separated keywords and a list of frequently asked question in markdown format.

  Page Content: {{{pageContent}}}
  Keywords: {{{keywords}}}
  Current Meta Title: {{{currentTitle}}}
  Current Meta Description: {{{currentDescription}}}

  Your suggestions:
  `,
});

// Define the flow
const improveSEOMetadataFlow = ai.defineFlow(
  {
    name: 'improveSEOMetadataFlow',
    inputSchema: ImproveSEOMetadataInputSchema,
    outputSchema: ImproveSEOMetadataOutputSchema,
  },
  async input => {
    const {output} = await improveSEOMetadataPrompt(input);
    return output!;
  }
);
